export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const id = (req.query?.id || req.body?.id || '').trim();
  if (!id) {
    return res.status(400).json({ error: 'ID do vídeo obrigatório' });
  }

  const cleanId = id.replace(/^yt-/, '').replace(/https?:\/\/(www\.)?youtube\.com\/watch\?v=/, '');

  const pipedInstances = [
    'https://api.piped.private.coffee',
    'https://pipedapi.adminforge.de',
    'https://piped.video/api/v1'
  ];

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
    } catch {
      // try next instance
    }
  }

  return res.status(500).json({ error: 'Falha ao resolver stream de áudio do YouTube' });
}
