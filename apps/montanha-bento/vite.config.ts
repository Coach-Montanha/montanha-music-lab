import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'spotify-api-middleware',
      configureServer(server) {
        server.middlewares.use('/api/spotify', async (req, res) => {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');

          const urlObj = new URL(req.url, 'http://localhost');
          const input = (urlObj.searchParams.get('url') || urlObj.searchParams.get('id') || '').trim();

          const match = input.match(/(playlist|album|track)[/:]([a-zA-Z0-9]+)/i);
          const type = match ? match[1].toLowerCase() : 'playlist';
          const playId = match ? match[2] : input.replace(/.*playlist\//, '').split('?')[0].replace(/[^a-zA-Z0-9]/g, '');

          if (!playId) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'ID ou URL da playlist inválida' }));
            return;
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
              res.statusCode = resp.status;
              res.end(JSON.stringify({ error: `Spotify embed retornou ${resp.status}` }));
              return;
            }

            const html = await resp.text();
            const matchScript = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);

            if (matchScript && matchScript[1]) {
              const parsed = JSON.parse(matchScript[1]);
              const entity = parsed?.props?.pageProps?.state?.data?.entity;

              if (entity) {
                const name = entity.title || entity.name || (type === 'album' ? 'Álbum Spotify' : 'Playlist Spotify');
                const creator = entity.owner?.name || entity.subtitle || (Array.isArray(entity.artists) ? entity.artists.map((a: any) => a.name).join(', ') : 'Spotify');
                const cover = entity.coverArt?.sources?.[0]?.url || entity.visualIdentity?.image?.[0]?.url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80';
                const rawTracks = entity.trackList || entity.tracks || [];

                const songs = rawTracks.map((t: any, idx: number) => {
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
                    artist: t.subtitle || (Array.isArray(t.artists) ? t.artists.map((a: any) => a.name).join(', ') : 'Artista'),
                    album: t.album?.name || name,
                    thumbnail: trackThumb,
                    duration: Math.round((t.duration || 180000) / 1000)
                  };
                });

                if (songs.length > 0) {
                  res.statusCode = 200;
                  res.end(JSON.stringify({ name, creator, cover, songs }));
                  return;
                }
              }
            }

            // Fallback oEmbed
            try {
              const oembedRes = await fetch(`https://open.spotify.com/oembed?url=https://open.spotify.com/${type}/${playId}`, {
                headers: { 'User-Agent': 'Mozilla/5.0' }
              });
              if (oembedRes.ok) {
                const oembed = await oembedRes.json();
                res.statusCode = 200;
                res.end(JSON.stringify({
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
                }));
                return;
              }
            } catch {}

            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'Nenhuma faixa encontrada na playlist' }));
          } catch (e: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
        });
      }
    }
  ],
  server: {
    host: '0.0.0.0',
    port: 5174
  }
});
