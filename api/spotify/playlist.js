// Serverless API: Spotify Playlist Importer (Baseado no SpotifyImport.kt do AbleMusicPlayer)
// Faz o scraping limpo do endpoint Embed do Spotify sem requerer chaves de API pagas ou OAuth
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const input = (req.query?.url || req.query?.id || req.body?.url || req.body?.id || '').trim();

  if (!input) {
    return res.status(400).json({ error: 'URL ou ID da playlist do Spotify não fornecido' });
  }

  // Extrai o ID da playlist a partir da URL
  // Ex: https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M?si=... -> 37i9dQZF1DXcBWIGoYBM5M
  let playlistId = input;
  const match = input.match(/playlist\/([a-zA-Z0-9]+)/);
  if (match) {
    playlistId = match[1];
  }

  try {
    const embedUrl = `https://open.spotify.com/embed/playlist/${encodeURIComponent(playlistId)}`;
    const response = await fetch(embedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Falha ao acessar o Spotify Embed (${response.status})` });
    }

    const html = await response.text();

    // Procura o bloco __NEXT_DATA__ exatamente como o AbleMusicPlayer faz
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);

    if (nextDataMatch && nextDataMatch[1]) {
      const parsed = JSON.parse(nextDataMatch[1]);
      const entity = parsed?.props?.pageProps?.state?.data?.entity;

      if (entity) {
        const playlistName = entity.title || entity.name || 'Playlist Spotify';
        const cover = entity.coverArt?.sources?.[0]?.url || entity.visualIdentity?.image?.[0]?.url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80';
        const rawTracks = entity.trackList || entity.tracks || [];

        const tracks = rawTracks.map((t, idx) => ({
          id: `sp-${t.id || idx}`,
          name: t.title || t.name || 'Faixa Desconhecida',
          artist: t.subtitle || t.artists?.[0]?.name || 'Artista',
          album: t.album?.name || playlistName,
          thumbnail: t.coverArt?.sources?.[0]?.url || cover,
          duration: Math.round((t.duration || 180000) / 1000)
        }));

        return res.status(200).json({
          id: `sp-pl-${playlistId}`,
          name: playlistName,
          creator: entity.owner?.name || 'Spotify User',
          cover,
          songs: tracks
        });
      }
    }

    return res.status(404).json({ error: 'Não foi possível extrair faixas da playlist' });
  } catch (err) {
    console.error('Erro no Spotify Importer:', err);
    return res.status(500).json({ error: err.message || 'Erro interno no servidor' });
  }
}
