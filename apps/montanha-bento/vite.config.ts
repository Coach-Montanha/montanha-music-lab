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
          const input = urlObj.searchParams.get('url') || urlObj.searchParams.get('id') || '';
          const match = input.match(/playlist\/([a-zA-Z0-9]+)/);
          const playId = match ? match[1] : input.trim();

          if (!playId) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'ID ou URL da playlist inválida' }));
            return;
          }

          try {
            const embedUrl = `https://open.spotify.com/embed/playlist/${playId}`;
            const resp = await fetch(embedUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
              }
            });

            if (!resp.ok) {
              res.statusCode = resp.status;
              res.end(JSON.stringify({ error: `Spotify embed retornou ${resp.status}` }));
              return;
            }

            const html = await resp.text();
            const matchScript = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);
            if (!matchScript || !matchScript[1]) {
              res.statusCode = 502;
              res.end(JSON.stringify({ error: 'Metadados não encontrados' }));
              return;
            }

            const parsed = JSON.parse(matchScript[1]);
            const entity = parsed?.props?.pageProps?.state?.data?.entity;
            if (!entity) {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'Playlist vazia ou privada' }));
              return;
            }

            const name = entity.title || entity.name || 'Playlist Spotify';
            const creator = entity.owner?.name || entity.subtitle || 'Spotify';
            const cover = entity.coverArt?.sources?.[0]?.url || entity.visualIdentity?.image?.[0]?.url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80';
            const rawTracks = entity.trackList || entity.tracks || [];

            const songs = rawTracks.map((t: any, idx: number) => ({
              id: `sp-${t.id || idx}-${Date.now()}`,
              name: t.title || t.name || 'Música',
              artist: t.subtitle || t.artists?.[0]?.name || 'Artista',
              album: t.album?.name || name,
              thumbnail: t.coverArt?.sources?.[0]?.url || cover,
              duration: Math.round((t.duration || 180000) / 1000)
            }));

            res.statusCode = 200;
            res.end(JSON.stringify({ name, creator, cover, songs }));
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
