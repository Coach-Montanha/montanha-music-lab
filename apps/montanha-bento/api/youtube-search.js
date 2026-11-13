export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { q } = req.query;
  const query = (q || '').trim();

  if (!query) {
    return res.status(400).json({ error: 'Parâmetro de busca obrigatório' });
  }

  // 1. Tenta YouTube Suggest / Search oficial scrape ultra-leve
  try {
    const ytSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const ytResp = await fetch(ytSearchUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    clearTimeout(timeout);

    if (ytResp.ok) {
      const html = await ytResp.text();
      const match = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
      if (match && match[1]) {
        return res.status(200).json({ videoId: match[1], source: 'youtube' });
      }
    }
  } catch {}

  // 2. Fallback: Instâncias Piped e Invidious resilientes
  const instances = [
    `https://api.piped.private.coffee/search?q=${encodeURIComponent(query)}&filter=music_songs`,
    `https://pipedapi.adminforge.de/search?q=${encodeURIComponent(query)}&filter=music_songs`,
    `https://inv.bp.projectsegfau.lt/api/v1/search?q=${encodeURIComponent(query)}&type=video`
  ];

  for (const inst of instances) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);
      const resp = await fetch(inst, { signal: controller.signal });
      clearTimeout(timeout);

      if (resp.ok) {
        const data = await resp.json();
        // Piped
        if (Array.isArray(data.items)) {
          const item = data.items.find((i) => i.type === 'stream');
          if (item?.url) {
            const vid = item.url.replace('/watch?v=', '').split('&')[0];
            if (vid) return res.status(200).json({ videoId: vid, source: 'piped' });
          }
        }
        // Invidious
        if (Array.isArray(data) && data[0]?.videoId) {
          return res.status(200).json({ videoId: data[0].videoId, source: 'invidious' });
        }
      }
    } catch {}
  }

  return res.status(404).json({ error: 'Nenhum vídeo correspondente encontrado' });
}
