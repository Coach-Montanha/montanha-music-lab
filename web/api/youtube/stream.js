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

  let cleanId = id.replace(/^yt-/, '').replace(/https?:\/\/(www\.)?youtube\.com\/watch\?v=/, '').split('&')[0];

  const pipedInstances = [
    'https://api.piped.private.coffee',
    'https://pipedapi.adminforge.de',
    'https://piped.video/api/v1',
    'https://api.piped.projectsegfau.lt'
  ];

  // 1. Se não for ID válido direto do YouTube (ex: dz-*, sp-* ou busca por texto), busca no YouTube Music / Piped
  const isValidYoutubeId = /^[a-zA-Z0-9_-]{11}$/.test(cleanId);
  if (!cleanId || !isValidYoutubeId || cleanId.startsWith('dz-') || cleanId.startsWith('sp-')) {
    const searchTerm = query || id.replace(/^(dz|sp)-/, '');
    for (const instance of pipedInstances) {
      try {
        const c = new AbortController();
        const t = setTimeout(() => c.abort(), 3500);
        const searchResp = await fetch(`${instance}/search?q=${encodeURIComponent(searchTerm)}&filter=music_songs`, {
          signal: c.signal,
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        clearTimeout(t);
        if (searchResp.ok) {
          const searchData = await searchResp.json();
          const firstStream = (searchData.items || []).find((item) => item.type === 'stream' || item.url);
          if (firstStream?.url) {
            cleanId = firstStream.url.replace('/watch?v=', '').split('&')[0];
            break;
          }
        }
      } catch {}
    }
  }

  // 2. Extrair áudio de alta fidelidade completo (Opus/AAC 160-320kbps) das instâncias Piped
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
              artist: data.uploader,
              duration: data.duration,
              mimeType: audioStreams[0].mimeType || 'audio/webm'
            });
          }
        }
      } catch {}
    }
  }

  // 3. Fallback inteligente: se não conseguiu extrair URL estática, devolve o ID do YouTube limpo
  // para que o player utilize o YouTube IFrame Player integrado (sem 30s de corte)
  if (cleanId && !cleanId.startsWith('dz-')) {
    return res.status(200).json({
      url: `https://www.youtube.com/watch?v=${cleanId}`,
      youtubeId: cleanId,
      mimeType: 'video/youtube'
    });
  }

  return res.status(404).json({ error: 'Stream de áudio não encontrado' });
}
