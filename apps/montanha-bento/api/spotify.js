export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url, id } = req.query;
  const input = url || id || '';
  const match = input.match(/playlist\/([a-zA-Z0-9]+)/);
  const playId = match ? match[1] : input.trim();

  if (!playId) {
    return res.status(400).json({ error: 'ID ou URL da playlist do Spotify inválida' });
  }

  try {
    const embedUrl = `https://open.spotify.com/embed/playlist/${playId}`;
    const resp = await fetch(embedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    if (!resp.ok) {
      return res.status(resp.status).json({ error: `Spotify embed retornou status ${resp.status}` });
    }

    const html = await resp.text();
    const matchScript = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);
    if (!matchScript || !matchScript[1]) {
      return res.status(502).json({ error: 'Metadados da playlist não encontrados no Spotify' });
    }

    const parsed = JSON.parse(matchScript[1]);
    const entity = parsed?.props?.pageProps?.state?.data?.entity;
    if (!entity) {
      return res.status(404).json({ error: 'Playlist vazia ou privada no Spotify' });
    }

    const name = entity.title || entity.name || 'Playlist Spotify';
    const creator = entity.owner?.name || entity.subtitle || 'Spotify';
    const cover = entity.coverArt?.sources?.[0]?.url || entity.visualIdentity?.image?.[0]?.url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80';
    const rawTracks = entity.trackList || entity.tracks || [];

    const songs = rawTracks.map((t, idx) => ({
      id: `sp-${t.id || idx}-${Date.now()}`,
      name: t.title || t.name || 'Música',
      artist: t.subtitle || t.artists?.[0]?.name || 'Artista',
      album: t.album?.name || name,
      thumbnail: t.coverArt?.sources?.[0]?.url || cover,
      duration: Math.round((t.duration || 180000) / 1000)
    }));

    return res.status(200).json({
      name,
      creator,
      cover,
      songs
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Erro interno ao processar playlist' });
  }
}
