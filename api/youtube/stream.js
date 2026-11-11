export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const id = (req.query?.id || req.body?.id || '').trim();
  const query = (req.query?.q || req.query?.query || req.body?.query || '').trim();

  if (!id && !query) {
    return res.status(400).json({ error: 'ID ou query do vídeo obrigatório' });
  }

  // 1. Se for ID do Deezer (ex: dz-12345), buscar URL de áudio direta da API Deezer
  if (id.startsWith('dz-')) {
    const dzId = id.replace(/^dz-/, '');
    try {
      const dzResp = await fetch(`https://api.deezer.com/track/${dzId}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      if (dzResp.ok) {
        const trackData = await dzResp.json();
        if (trackData.preview) {
          return res.status(200).json({
            url: trackData.preview,
            title: trackData.title,
            artist: trackData.artist?.name,
            mimeType: 'audio/mpeg'
          });
        }
      }
    } catch (e) {
      console.warn('Deezer direct fetch failed:', e);
    }
  }

  let cleanId = id.replace(/^yt-/, '').replace(/https?:\/\/(www\.)?youtube\.com\/watch\?v=/, '');

  const pipedInstances = [
    'https://api.piped.private.coffee',
    'https://pipedapi.adminforge.de',
    'https://piped.video/api/v1'
  ];

  // 2. Se o ID não for de vídeo direto do YouTube ou query foi passada, tentar Piped Search
  if (!cleanId || cleanId.startsWith('dz-')) {
    const searchTerm = query || id.replace(/^dz-/, '');
    for (const instance of pipedInstances) {
      try {
        const c = new AbortController();
        const t = setTimeout(() => c.abort(), 3500);
        const searchResp = await fetch(`${instance}/search?q=${encodeURIComponent(searchTerm)}&filter=all`, {
          signal: c.signal,
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        clearTimeout(t);
        if (searchResp.ok) {
          const searchData = await searchResp.json();
          const firstStream = (searchData.items || []).find((item) => item.type === 'stream');
          if (firstStream?.url) {
            cleanId = firstStream.url.replace('/watch?v=', '').split('&')[0];
            break;
          }
        }
      } catch {}
    }
  }

  // 3. Tentar extrair áudio direto das instâncias Piped
  if (cleanId && !cleanId.startsWith('dz-')) {
    for (const instance of pipedInstances) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);

        const resp = await fetch(`${instance}/streams/${encodeURIComponent(cleanId)}`, {
          signal: controller.signal,
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        clearTimeout(timeout);

        if (resp.ok) {
          const data = await resp.json();
          const audioStreams = data.audioStreams || [];
          if (audioStreams.length > 0) {
            audioStreams.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));
            return res.status(200).json({
              url: audioStreams[0].url,
              title: data.title,
              mimeType: audioStreams[0].mimeType || 'audio/webm'
            });
          }
        }
      } catch {}
    }
  }

  // 4. Fallback garantido: Buscar áudio na API Deezer pela query/título
  const fallbackQuery = query || cleanId;
  if (fallbackQuery) {
    try {
      const dzResp = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(fallbackQuery)}&limit=1`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      if (dzResp.ok) {
        const dzData = await dzResp.json();
        const first = dzData.data?.[0];
        if (first?.preview) {
          return res.status(200).json({
            url: first.preview,
            title: first.title,
            artist: first.artist?.name,
            mimeType: 'audio/mpeg'
          });
        }
      }
    } catch {}
  }

  return res.status(500).json({ error: 'Falha ao resolver stream de áudio' });
}
