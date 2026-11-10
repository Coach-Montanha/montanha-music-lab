export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const query = (req.body?.query || req.query?.q || req.query?.query || '').trim();
  if (!query) {
    return res.status(400).json({ error: 'Query de busca vazia' });
  }

  // 1. Tentar Piped APIs (instâncias públicas de alta disponibilidade)
  const pipedInstances = [
    'https://api.piped.private.coffee',
    'https://pipedapi.adminforge.de',
    'https://piped.video/api/v1'
  ];

  for (const instance of pipedInstances) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);

      const resp = await fetch(`${instance}/search?q=${encodeURIComponent(query)}&filter=all`, {
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      clearTimeout(timeout);

      if (resp.ok) {
        const data = await resp.json();
        const items = Array.isArray(data.items) ? data.items : [];

        const results = [];
        const playlists = [];

        for (const item of items) {
          if (item.type === 'stream') {
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
          } else if (item.type === 'playlist') {
            const playlistId = (item.url || '').replace('/playlist?list=', '').split('&')[0];
            playlists.push({
              id: playlistId || `pl-${Math.random().toString(36).slice(2, 8)}`,
              title: item.title || 'Playlist YouTube',
              author: item.uploaderName || 'YouTube Music',
              url: `https://www.youtube.com/playlist?list=${playlistId}`,
              thumbnail: item.thumbnail || '',
              videosCount: item.videos || 0
            });
          }
        }

        if (results.length > 0 || playlists.length > 0) {
          return res.status(200).json({ results, playlists });
        }
      }
    } catch {
      // continua para a próxima instância
    }
  }

  // 2. Fallback de alta velocidade: iTunes Music Search API
  try {
    const itunesResp = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=25`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    );
    if (itunesResp.ok) {
      const itunesData = await itunesResp.json();
      const results = (itunesData.results || []).map((track) => ({
        id: String(track.trackId || Math.random().toString(36).slice(2, 8)),
        title: track.trackName || 'Música sem título',
        artist: track.artistName || 'Artista desconhecido',
        album: track.collectionName || 'Álbum',
        duration: Math.round((track.trackTimeMillis || 180000) / 1000),
        thumbnail: (track.artworkUrl100 || '').replace('100x100bb', '600x600bb'),
        url: track.trackViewUrl || '',
        previewUrl: track.previewUrl || '',
        source: 'itunes'
      }));

      return res.status(200).json({ results, playlists: [] });
    }
  } catch (err) {
    console.error('iTunes fallback error:', err);
  }

  return res.status(500).json({ error: 'Nenhum provedor de busca respondeu no momento.' });
}
