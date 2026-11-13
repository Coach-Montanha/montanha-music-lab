export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url, id } = req.query;
  const input = (url || id || '').trim();

  if (!input) {
    return res.status(400).json({ error: 'URL ou ID da playlist do Spotify é obrigatório' });
  }

  // Identifica o tipo (playlist, album, track) e o ID limpo
  const match = input.match(/(playlist|album|track)[/:]([a-zA-Z0-9]+)/i);
  const type = match ? match[1].toLowerCase() : 'playlist';
  const playId = match ? match[2] : input.replace(/.*playlist\//, '').split('?')[0].replace(/[^a-zA-Z0-9]/g, '');

  if (!playId) {
    return res.status(400).json({ error: 'ID da playlist não reconhecido' });
  }

  try {
    const embedUrl = `https://open.spotify.com/embed/${type}/${playId}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    const resp = await fetch(embedUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    clearTimeout(timeout);

    if (!resp.ok) {
      return res.status(resp.status).json({ error: `Spotify embed retornou status ${resp.status}` });
    }

    const html = await resp.text();
    const matchScript = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);

    if (matchScript && matchScript[1]) {
      const parsed = JSON.parse(matchScript[1]);
      const entity = parsed?.props?.pageProps?.state?.data?.entity;

      if (entity) {
        const name = entity.title || entity.name || (type === 'album' ? 'Álbum Spotify' : 'Playlist Spotify');
        const creator = entity.owner?.name || entity.subtitle || (Array.isArray(entity.artists) ? entity.artists.map((a) => a.name).join(', ') : 'Spotify');
        const cover = entity.coverArt?.sources?.[0]?.url || entity.visualIdentity?.image?.[0]?.url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80';
        const rawTracks = entity.trackList || entity.tracks || [];

        const songs = rawTracks.map((t, idx) => ({
          id: `sp-${t.id || idx}-${Date.now()}`,
          name: t.title || t.name || 'Música',
          artist: t.subtitle || (Array.isArray(t.artists) ? t.artists.map((a) => a.name).join(', ') : 'Artista'),
          album: t.album?.name || name,
          thumbnail: t.coverArt?.sources?.[0]?.url || cover,
          duration: Math.round((t.duration || 180000) / 1000)
        }));

        if (songs.length > 0) {
          return res.status(200).json({
            name,
            creator,
            cover,
            songs
          });
        }
      }
    }

    // Fallback: oEmbed oficial do Spotify
    try {
      const oembedRes = await fetch(`https://open.spotify.com/oembed?url=https://open.spotify.com/${type}/${playId}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      if (oembedRes.ok) {
        const oembed = await oembedRes.json();
        return res.status(200).json({
          name: oembed.title || 'Playlist Spotify',
          creator: 'Spotify',
          cover: oembed.thumbnail_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
          songs: [
            {
              id: `sp-track-${playId}-${Date.now()}`,
              name: oembed.title || 'Faixa Principal',
              artist: 'Spotify',
              thumbnail: oembed.thumbnail_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
              duration: 210
            }
          ]
        });
      }
    } catch {}

    return res.status(404).json({ error: 'Nenhuma faixa encontrada na playlist fornecida' });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Erro interno ao processar playlist' });
  }
}
