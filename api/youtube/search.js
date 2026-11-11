export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const query = (req.body?.query || req.query?.q || req.query?.query || '').trim();
  const filter = (req.body?.filter || req.query?.filter || req.query?.type || 'tudo').toLowerCase().trim();

  if (!query) {
    return res.status(400).json({ error: 'Query de busca vazia' });
  }

  const results = [];
  const playlists = [];
  const albums = [];
  const artists = [];

  // 1. Deezer API (Instantânea, sem CORS, com alta disponibilidade e dados estruturados)
  try {
    if (filter === 'playlists') {
      const dzResp = await fetch(`https://api.deezer.com/search/playlist?q=${encodeURIComponent(query)}&limit=25`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      if (dzResp.ok) {
        const dzData = await dzResp.json();
        for (const pl of dzData.data || []) {
          playlists.push({
            id: `dz-pl-${pl.id}`,
            title: pl.title || 'Playlist sem título',
            author: pl.user?.name || 'Deezer Curador',
            url: pl.link || `https://www.deezer.com/playlist/${pl.id}`,
            thumbnail: pl.picture_big || pl.picture_medium || '',
            videosCount: pl.nb_tracks || 0,
            source: 'deezer'
          });
        }
      }
    } else if (filter === 'albuns') {
      const dzResp = await fetch(`https://api.deezer.com/search/album?q=${encodeURIComponent(query)}&limit=25`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      if (dzResp.ok) {
        const dzData = await dzResp.json();
        for (const alb of dzData.data || []) {
          albums.push({
            id: `dz-alb-${alb.id}`,
            title: alb.title || 'Álbum',
            artist: alb.artist?.name || 'Artista',
            thumbnail: alb.cover_big || alb.cover_medium || '',
            tracksCount: alb.nb_tracks || 0,
            source: 'deezer'
          });
        }
      }
    } else if (filter === 'artistas') {
      const dzResp = await fetch(`https://api.deezer.com/search/artist?q=${encodeURIComponent(query)}&limit=25`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      if (dzResp.ok) {
        const dzData = await dzResp.json();
        for (const art of dzData.data || []) {
          artists.push({
            id: `dz-art-${art.id}`,
            name: art.name || 'Artista',
            thumbnail: art.picture_big || art.picture_medium || '',
            fansCount: art.nb_fan || 0,
            source: 'deezer'
          });
        }
      }
    } else {
      // 'tudo' ou 'faixas'
      const dzResp = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=30`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      if (dzResp.ok) {
        const dzData = await dzResp.json();
        for (const track of dzData.data || []) {
          results.push({
            id: `dz-${track.id}`,
            title: track.title || 'Música sem título',
            artist: track.artist?.name || 'Artista desconhecido',
            album: track.album?.title || 'Álbum',
            duration: track.duration || 180,
            thumbnail: track.album?.cover_big || track.album?.cover_medium || '',
            url: track.link || `https://www.deezer.com/track/${track.id}`,
            previewUrl: track.preview || '',
            source: 'deezer'
          });
        }
      }

      // Se for 'tudo', busca também algumas playlists
      if (filter === 'tudo') {
        try {
          const dzPl = await fetch(`https://api.deezer.com/search/playlist?q=${encodeURIComponent(query)}&limit=10`, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
          });
          if (dzPl.ok) {
            const dzPlData = await dzPl.json();
            for (const pl of dzPlData.data || []) {
              playlists.push({
                id: `dz-pl-${pl.id}`,
                title: pl.title || 'Playlist sem título',
                author: pl.user?.name || 'Deezer Curador',
                url: pl.link || `https://www.deezer.com/playlist/${pl.id}`,
                thumbnail: pl.picture_big || pl.picture_medium || '',
                videosCount: pl.nb_tracks || 0,
                source: 'deezer'
              });
            }
          }
        } catch {}
      }
    }
  } catch (dzErr) {
    console.error('Deezer search error:', dzErr);
  }

  // 2. YouTube (via Piped instances)
  const pipedInstances = [
    'https://api.piped.private.coffee',
    'https://pipedapi.adminforge.de',
    'https://piped.video/api/v1'
  ];

  for (const instance of pipedInstances) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);

      const resp = await fetch(`${instance}/search?q=${encodeURIComponent(query)}&filter=all`, {
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      clearTimeout(timeout);

      if (resp.ok) {
        const data = await resp.json();
        const items = Array.isArray(data.items) ? data.items : [];

        for (const item of items) {
          if (item.type === 'stream' && (filter === 'tudo' || filter === 'faixas')) {
            const videoId = (item.url || '').replace('/watch?v=', '').split('&')[0];
            results.push({
              id: videoId || `yt-${Math.random().toString(36).slice(2, 8)}`,
              title: item.title || 'Música sem título',
              artist: item.uploaderName || 'Artista YouTube',
              album: 'YouTube Music',
              duration: item.duration || 180,
              thumbnail: item.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
              url: `https://www.youtube.com/watch?v=${videoId}`,
              source: 'youtube'
            });
          } else if (item.type === 'playlist' && (filter === 'tudo' || filter === 'playlists')) {
            const playlistId = (item.url || '').replace('/playlist?list=', '').split('&')[0];
            playlists.push({
              id: playlistId || `pl-${Math.random().toString(36).slice(2, 8)}`,
              title: item.title || 'Playlist YouTube',
              author: item.uploaderName || 'YouTube Music',
              url: `https://www.youtube.com/playlist?list=${playlistId}`,
              thumbnail: item.thumbnail || '',
              videosCount: item.videos || 0,
              source: 'youtube'
            });
          }
        }
        break;
      }
    } catch {}
  }

  return res.status(200).json({
    results,
    playlists,
    albums,
    artists
  });
}
