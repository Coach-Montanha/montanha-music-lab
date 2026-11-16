import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const SUPABASE_URL = 'https://muryznvaxzszcffrbxpv.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11cnl6bnZheHpzemNmZnJieHB2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDQ0MTE2OSwiZXhwIjoyMTAwMDE3MTY5fQ.SpYzAP5ej1jUKyIPGSowyZrG_eeox50HmKnP1r81a24';
const USER_ID = '3f954063-c246-4989-8f48-dc84a12f5be3';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-serverless-dev-middleware',
      configureServer(server) {
        // 1. /api/sync middleware
        server.middlewares.use(async (req, res, next) => {
          if (!req.url?.startsWith('/api/sync')) return next();
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');

          if (req.method === 'GET') {
            try {
              // Busca do Storage (sem poluir o Auth JWT)
              const storageResp = await fetch(
                `${SUPABASE_URL}/storage/v1/object/public/music-playlists/${USER_ID}.json?t=${Date.now()}`,
                { headers: { apikey: SUPABASE_SERVICE_ROLE_KEY } }
              );
              if (storageResp.ok) {
                const sData = await storageResp.json();
                if (sData?.playlists && sData.playlists.length > 0) {
                  res.statusCode = 200;
                  res.end(JSON.stringify({ playlists: sData.playlists, synced_at: sData.synced_at }));
                  return;
                }
              }
              res.statusCode = 200;
              res.end(JSON.stringify({ playlists: [], synced_at: null }));
              return;
            } catch (e: any) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: e.message }));
              return;
            }
          }

          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
              try {
                const parsed = JSON.parse(body || '{}');
                const playlists = parsed.playlists || [];
                const syncedAt = new Date().toISOString();

                // Salva exclusivamente no Supabase Storage - NUNCA em user_metadata do Auth
                const storageUpload = await fetch(`${SUPABASE_URL}/storage/v1/object/music-playlists/${USER_ID}.json`, {
                  method: 'POST',
                  headers: {
                    apikey: SUPABASE_SERVICE_ROLE_KEY,
                    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                    'Content-Type': 'application/json',
                    'x-upsert': 'true'
                  },
                  body: JSON.stringify({ playlists, synced_at: syncedAt })
                });

                res.statusCode = 200;
                res.end(JSON.stringify({ success: true, count: playlists.length, synced_at: syncedAt }));
                return;
              } catch (e: any) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: e.message }));
                return;
              }
            });
            return;
          }

          next();
        });

        // 1.5. /api/stream middleware (Proxy local com suporte a Saavn 320kbps e Invidious)
        server.middlewares.use(async (req, res, next) => {
          if (!req.url?.startsWith('/api/stream')) return next();
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');

          const urlObj = new URL(req.url, 'http://localhost');
          const title = (urlObj.searchParams.get('title') || urlObj.searchParams.get('t') || '').trim();
          const artist = (urlObj.searchParams.get('artist') || urlObj.searchParams.get('a') || '').trim();
          const id = (urlObj.searchParams.get('id') || '').trim();

          const cleanT = (title || '')
            .replace(/\(.*?\)/g, '')
            .replace(/\[.*?\]/g, '')
            .replace(/feat\..*$/i, '')
            .replace(/ft\..*$/i, '')
            .replace(/[^\p{L}\p{N}\s'-]/gu, ' ')
            .replace(/\s+/g, ' ')
            .trim();

          const rawArtists = (artist || '')
            .split(/[,&/]|feat\.|ft\.|x\s+/i)
            .map(a => a.replace(/[^\p{L}\p{N}\s'-]/gu, ' ').replace(/\s+/g, ' ').trim())
            .filter(a => a.length > 1);

          const candidates = new Set<string>();
          const cleanArtist = (artist || '').replace(/[^\p{L}\p{N}\s'-]/gu, ' ').replace(/\s+/g, ' ').trim();
          if (cleanArtist) candidates.add(cleanArtist);
          for (const a of rawArtists) {
            if (a) candidates.add(a);
          }
          const firstWord = rawArtists[0]?.split(' ')[0];
          if (firstWord && firstWord.length > 2) candidates.add(firstWord);

          // Tier 1: Saavn 320kbps MP4 Completo com busca paralela ultrarrápida
          if (cleanT) {
            const candidateList = Array.from(candidates);
            if (cleanT.length > 4) candidateList.push(cleanT);

            const saavnPromises = candidateList.slice(0, 3).map(async (cand) => {
              const saavnRes = await fetch(
                `https://fast-saavn.vercel.app/api?title=${encodeURIComponent(cleanT)}&artist=${encodeURIComponent(cand)}`
              );
              if (saavnRes.ok) {
                const streamId = (await saavnRes.text()).trim();
                if (streamId && streamId.length > 5 && !streamId.includes('error') && !streamId.includes('not found')) {
                  return { streamId, cand };
                }
              }
              throw new Error('not found');
            });

            try {
              const winner = await Promise.any(saavnPromises);
              if (winner?.streamId) {
                res.statusCode = 200;
                res.end(JSON.stringify({
                  url: `https://aac.saavncdn.com/${winner.streamId}_320.mp4`,
                  duration: 210,
                  mimeType: 'audio/mp4',
                  title,
                  artist: winner.cand,
                  source: 'saavn-320'
                }));
                return;
              }
            } catch {}
          }

          // Tier 2: Invidious YouTube Resolver (Com Resolução Automática de ID)
          let youtubeId = id.replace(/^yt-/, '').split('&')[0];
          if (!youtubeId || !/^[a-zA-Z0-9_-]{11}$/.test(youtubeId)) {
            if (cleanT) {
              try {
                const query = `${cleanT} ${Array.from(candidates)[0] || artist}`.trim();
                const ytResp = await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, {
                  headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept-Language': 'en-US,en;q=0.9'
                  }
                });
                if (ytResp.ok) {
                  const html = await ytResp.text();
                  const match = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
                  if (match && match[1]) {
                    youtubeId = match[1];
                  }
                }
              } catch {}
            }
          }

          const mirrors = ['https://yt.chocolatemoo53.com', 'https://invidious.nerdvpn.de', 'https://inv.nadeko.net'];
          if (youtubeId && /^[a-zA-Z0-9_-]{11}$/.test(youtubeId)) {
            for (const host of mirrors) {
              try {
                const invRes = await fetch(`${host}/api/v1/videos/${youtubeId}`, {
                  headers: { 'User-Agent': 'Mozilla/5.0' }
                });
                if (invRes.ok) {
                  const data = await invRes.json();
                  const audios = (data.adaptiveFormats || []).filter(
                    (f: any) => f.type && (f.type.startsWith('audio/mp4') || f.type.startsWith('audio/webm'))
                  );
                  if (audios.length > 0) {
                    audios.sort((a: any, b: any) => {
                      const aMp4 = a.type.startsWith('audio/mp4') ? 1 : 0;
                      const bMp4 = b.type.startsWith('audio/webm') ? 0 : 1;
                      if (aMp4 !== bMp4) return bMp4 - aMp4;
                      return (parseInt(b.bitrate) || 0) - (parseInt(a.bitrate) || 0);
                    });
                    const best = audios[0];
                    const proxied = best.url.replace(new URL(best.url).origin, host);
                    res.statusCode = 200;
                    res.end(JSON.stringify({
                      url: proxied,
                      duration: Number(data.lengthSeconds) || 210,
                      mimeType: best.type.split(';')[0] || 'audio/mp4',
                      title: data.title || title,
                      artist: data.author || artist,
                      source: 'invidious'
                    }));
                    return;
                  }
                }
              } catch {}
            }
          }

          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'Áudio não encontrado' }));
        });

        // 2. /api/youtube-search middleware
        server.middlewares.use(async (req, res, next) => {
          if (!req.url?.startsWith('/api/youtube-search')) return next();
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');

          const urlObj = new URL(req.url, 'http://localhost');
          const query = (urlObj.searchParams.get('q') || '').trim();

          if (!query) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Parâmetro q obrigatório' }));
            return;
          }

          // Busca no YouTube / Piped
          try {
            const ytResp = await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, {
              headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
            });
            if (ytResp.ok) {
              const html = await ytResp.text();
              const match = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
              if (match && match[1]) {
                res.statusCode = 200;
                res.end(JSON.stringify({ videoId: match[1], source: 'youtube' }));
                return;
              }
            }
          } catch {}

          try {
            const pipedResp = await fetch(`https://api.piped.private.coffee/search?q=${encodeURIComponent(query)}&filter=music_songs`);
            if (pipedResp.ok) {
              const data = await pipedResp.json();
              const item = data.items?.find((i: any) => i.type === 'stream');
              if (item?.url) {
                const vid = item.url.replace('/watch?v=', '').split('&')[0];
                if (vid) {
                  res.statusCode = 200;
                  res.end(JSON.stringify({ videoId: vid, source: 'piped' }));
                  return;
                }
              }
            }
          } catch {}

          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'Vídeo não encontrado' }));
        });

        // 3. /api/spotify middleware
        server.middlewares.use(async (req, res, next) => {
          if (!req.url?.startsWith('/api/spotify')) return next();
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
