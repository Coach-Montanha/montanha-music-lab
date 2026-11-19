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
    return res.status(400).json({ error: 'URL ou ID do Spotify é obrigatório' });
  }

  // Identifica o tipo (playlist, album, track, artist) e o ID limpo
  const match = input.match(/(playlist|album|track|artist)[/:]([a-zA-Z0-9]+)/i);
  let type = match ? match[1].toLowerCase() : 'playlist';
  let playId = match ? match[2] : '';

  if (!playId) {
    const idMatch = input.match(/([a-zA-Z0-9]{22})/);
    if (idMatch) {
      playId = idMatch[1];
    } else {
      playId = input.replace(/.*playlist\//, '').split('?')[0].replace(/[^a-zA-Z0-9]/g, '');
    }
  }

  if (!playId) {
    return res.status(400).json({ error: 'ID do Spotify não reconhecido' });
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

    if (resp.ok) {
      const html = await resp.text();
      const matchScript = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);

      if (matchScript && matchScript[1]) {
        const parsed = JSON.parse(matchScript[1]);
        const entity = parsed?.props?.pageProps?.state?.data?.entity;

        if (entity) {
          let name = entity.title || entity.name || (type === 'album' ? 'Álbum Spotify' : type === 'artist' ? 'Artista Spotify' : 'Playlist Spotify');
          if (type === 'artist' && !name.includes('Top') && !name.includes('Melhores')) {
            name = `${name} • Top Músicas`;
          }
          const creator = entity.owner?.name || entity.subtitle || (Array.isArray(entity.artists) ? entity.artists.map((a) => a.name).join(', ') : 'Spotify');
          const cover = entity.coverArt?.sources?.[0]?.url || entity.visualIdentity?.image?.[0]?.url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80';

          let songs = [];

          if (entity.type === 'track') {
            // Faixa individual
            songs = [{
              id: `sp-${entity.id || playId}-${Date.now()}`,
              name: entity.name || entity.title || 'Música',
              artist: Array.isArray(entity.artists) ? entity.artists.map((a) => a.name).join(', ') : creator,
              album: entity.album?.name || 'Single',
              thumbnail: entity.visualIdentity?.image?.[0]?.url || cover,
              duration: Math.round((entity.duration || 180000) / 1000)
            }];
          } else {
            // Playlist, Álbum ou Artista
            const rawTracks = entity.trackList || entity.tracks || [];
            songs = rawTracks.map((t, idx) => {
              const trackThumb =
                t.album?.coverArt?.sources?.[0]?.url ||
                t.album?.images?.[0]?.url ||
                t.coverArt?.sources?.[0]?.url ||
                t.visualIdentity?.image?.[0]?.url ||
                t.images?.[0]?.url ||
                (t.album?.id ? `https://i.scdn.co/image/${t.album.id}` : null) ||
                cover;

              return {
                id: `sp-${t.id || idx}-${Date.now()}`,
                name: t.title || t.name || 'Música',
                artist: t.subtitle || (Array.isArray(t.artists) ? t.artists.map((a) => a.name).join(', ') : creator),
                album: t.album?.name || name,
                thumbnail: trackThumb,
                duration: Math.round((t.duration || 180000) / 1000)
              };
            });
          }

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
    }

    // Fallback inteligente: consulta oEmbed para recuperar nome/artista e busca faixas no Deezer
    let fallbackTitle = '';
    let fallbackCover = '';
    try {
      const oembedRes = await fetch(`https://open.spotify.com/oembed?url=https://open.spotify.com/${type}/${playId}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      if (oembedRes.ok) {
        const oembed = await oembedRes.json();
        fallbackTitle = oembed.title || '';
        fallbackCover = oembed.thumbnail_url || '';
      }
    } catch {}

    // Se oEmbed confirmou que é uma única faixa (track):
    if (type === 'track' && fallbackTitle) {
      return res.status(200).json({
        name: fallbackTitle,
        creator: 'Spotify',
        cover: fallbackCover || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
        songs: [
          {
            id: `sp-track-${playId}-${Date.now()}`,
            name: fallbackTitle,
            artist: 'Spotify',
            thumbnail: fallbackCover || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
            duration: 210
          }
        ]
      });
    }

    // Se temos nome do artista ou álbum, busca faixas completas no Deezer
    if (fallbackTitle) {
      try {
        const queryTerm = type === 'artist' ? `artist:"${fallbackTitle}"` : fallbackTitle;
        const dzRes = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(queryTerm)}&limit=30`, {
          signal: AbortSignal.timeout(5000)
        });
        if (dzRes.ok) {
          const dzData = await dzRes.json();
          if (Array.isArray(dzData.data) && dzData.data.length > 0) {
            const songs = dzData.data.map((item, idx) => ({
              id: `sp-dz-${item.id || idx}-${Date.now()}`,
              name: item.title,
              artist: item.artist?.name || fallbackTitle,
              album: item.album?.title || fallbackTitle,
              thumbnail: item.album?.cover_medium || fallbackCover || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
              duration: item.duration || 210
            }));

            return res.status(200).json({
              name: type === 'artist' ? `${fallbackTitle} • Top Músicas` : fallbackTitle,
              creator: type === 'artist' ? fallbackTitle : 'Spotify',
              cover: fallbackCover || songs[0]?.thumbnail || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
              songs
            });
          }
        }
      } catch (dzErr) {
        console.warn('Deezer fallback error:', dzErr);
      }
    }

    return res.status(404).json({ error: 'Nenhuma faixa encontrada na playlist ou perfil fornecido. Verifique se o link é público.' });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Erro interno ao processar link do Spotify' });
  }
}
