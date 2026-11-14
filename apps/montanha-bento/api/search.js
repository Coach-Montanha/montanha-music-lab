export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { q, type = 'all', action, id, entityType = 'album' } = req.query;

  // 1. AÇÃO ESPECÍFICA: Buscar faixas de um álbum, playlist ou top tracks de um artista
  if (action === 'tracks' && id) {
    try {
      let fetchUrl = '';
      if (entityType === 'album') {
        fetchUrl = `https://api.deezer.com/album/${id}/tracks?limit=100`;
      } else if (entityType === 'playlist') {
        fetchUrl = `https://api.deezer.com/playlist/${id}/tracks?limit=100`;
      } else if (entityType === 'artist') {
        fetchUrl = `https://api.deezer.com/artist/${id}/top?limit=50`;
      }

      if (!fetchUrl) {
        return res.status(400).json({ error: 'entityType inválido' });
      }

      const tracksResp = await fetch(fetchUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(6000)
      });

      if (!tracksResp.ok) {
        return res.status(tracksResp.status).json({ error: 'Falha ao buscar faixas' });
      }

      const data = await tracksResp.json();
      const rawSongs = data.data || [];

      // Mapeia para o contrato padrão Song
      const songs = rawSongs.map((t, idx) => {
        const cover =
          t.album?.cover_xl ||
          t.album?.cover_big ||
          t.album?.cover_medium ||
          t.album?.cover ||
          'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80';

        return {
          id: `dz-${t.id || idx}`,
          name: t.title || t.name || 'Música',
          artist: t.artist?.name || 'Artista',
          album: t.album?.title || '',
          thumbnail: cover,
          duration: t.duration || 210,
          audioUrl: t.preview || ''
        };
      });

      return res.status(200).json({ songs });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // 2. BUSCA MULTIFACETADA (Músicas, Álbuns, Artistas, Playlists)
  const query = (q || '').trim();
  if (!query) {
    return res.status(400).json({ error: 'Parâmetro q é obrigatório' });
  }

  try {
    const fetchPromises = [];

    // Busca faixas
    if (type === 'all' || type === 'track') {
      fetchPromises.push(
        fetch(`https://api.deezer.com/search/track?q=${encodeURIComponent(query)}&limit=25`, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: AbortSignal.timeout(4500)
        })
          .then((r) => (r.ok ? r.json() : { data: [] }))
          .then((data) => ({
            type: 'songs',
            items: (data.data || []).map((t) => ({
              id: `dz-${t.id}`,
              name: t.title,
              artist: t.artist?.name || 'Artista',
              album: t.album?.title || '',
              thumbnail: t.album?.cover_xl || t.album?.cover_big || t.album?.cover_medium,
              duration: t.duration || 210,
              audioUrl: t.preview || ''
            }))
          }))
          .catch(() => ({ type: 'songs', items: [] }))
      );
    }

    // Busca álbuns
    if (type === 'all' || type === 'album') {
      fetchPromises.push(
        fetch(`https://api.deezer.com/search/album?q=${encodeURIComponent(query)}&limit=15`, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: AbortSignal.timeout(4500)
        })
          .then((r) => (r.ok ? r.json() : { data: [] }))
          .then((data) => ({
            type: 'albums',
            items: (data.data || []).map((a) => ({
              id: `dz-alb-${a.id}`,
              rawId: a.id,
              name: a.title,
              artist: a.artist?.name || 'Artista',
              cover: a.cover_xl || a.cover_big || a.cover_medium,
              trackCount: a.nb_tracks || 0
            }))
          }))
          .catch(() => ({ type: 'albums', items: [] }))
      );
    }

    // Busca artistas
    if (type === 'all' || type === 'artist') {
      fetchPromises.push(
        fetch(`https://api.deezer.com/search/artist?q=${encodeURIComponent(query)}&limit=12`, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: AbortSignal.timeout(4500)
        })
          .then((r) => (r.ok ? r.json() : { data: [] }))
          .then((data) => ({
            type: 'artists',
            items: (data.data || []).map((art) => ({
              id: `dz-art-${art.id}`,
              rawId: art.id,
              name: art.name,
              image: art.picture_xl || art.picture_big || art.picture_medium,
              nbAlbum: art.nb_album || 0,
              nbFan: art.nb_fan || 0
            }))
          }))
          .catch(() => ({ type: 'artists', items: [] }))
      );
    }

    // Busca playlists
    if (type === 'all' || type === 'playlist') {
      fetchPromises.push(
        fetch(`https://api.deezer.com/search/playlist?q=${encodeURIComponent(query)}&limit=15`, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: AbortSignal.timeout(4500)
        })
          .then((r) => (r.ok ? r.json() : { data: [] }))
          .then((data) => ({
            type: 'playlists',
            items: (data.data || []).map((p) => ({
              id: `dz-pl-${p.id}`,
              rawId: p.id,
              name: p.title,
              creator: p.creator?.name || 'Deezer',
              cover: p.picture_xl || p.picture_big || p.picture_medium,
              trackCount: p.nb_tracks || 0
            }))
          }))
          .catch(() => ({ type: 'playlists', items: [] }))
      );
    }

    const resultsArray = await Promise.all(fetchPromises);

    const responseData = {
      songs: [],
      albums: [],
      artists: [],
      playlists: []
    };

    for (const resObj of resultsArray) {
      if (resObj.type && Array.isArray(resObj.items)) {
        responseData[resObj.type] = resObj.items;
      }
    }

    return res.status(200).json(responseData);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
