import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createDecipheriv } from 'node:crypto';
import { Ytdl } from '@distube/ytdl-core';

const ytdlClient = new Ytdl({ clients: ['visionos', 'tv'] });
const ytCache = new Map();

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

        // 1.5. /api/stream middleware (Proxy local com suporte a Saavn 320kbps nativo e YTDL Completo)
        server.middlewares.use(async (req, res, next) => {
          if (!req.url?.startsWith('/api/stream')) return next();
          res.setHeader('Access-Control-Allow-Origin', '*');

          const urlObj = new URL(req.url, 'http://localhost');

          // FAST-PATH: Range Proxying para YouTube (Status 206 com suporte a scrub/seek)
          const ytDirectId = (urlObj.searchParams.get('yt') || '').trim();
          if (ytDirectId && /^[a-zA-Z0-9_-]{11}$/.test(ytDirectId)) {
            try {
              let cached = ytCache.get(ytDirectId);
              if (!cached || Date.now() > cached.expires) {
                const info = await ytdlClient.getInfo(ytDirectId);
                const format = info.formats.find((f: any) => f.itag === 140) || info.formats.find((f: any) => f.hasAudio && !f.hasVideo);
                if (!format || !format.url) {
                  res.statusCode = 404;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'Nenhum formato de áudio encontrado para este vídeo' }));
                  return;
                }
                cached = { url: format.url, contentLength: format.contentLength, expires: Date.now() + 3600000 };
                ytCache.set(ytDirectId, cached);
              }

              const clientRange = req.headers.range || 'bytes=0-';
              const upstream = await fetch(cached.url, {
                headers: { 'Range': clientRange }
              });

              res.statusCode = upstream.status;
              res.setHeader('Content-Type', upstream.headers.get('content-type') || 'audio/mp4');
              if (upstream.headers.get('content-range')) {
                res.setHeader('Content-Range', upstream.headers.get('content-range')!);
              }
              if (upstream.headers.get('content-length')) {
                res.setHeader('Content-Length', upstream.headers.get('content-length')!);
              }
              res.setHeader('Accept-Ranges', 'bytes');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Cache-Control', 'public, max-age=3600');

              const arrayBuf = await upstream.arrayBuffer();
              res.end(Buffer.from(arrayBuf));
              return;
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Erro ao transmitir áudio: ' + (err?.message || err) }));
              return;
            }
          }

          res.setHeader('Content-Type', 'application/json');
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

          function decryptSaavnMedia(encryptedMediaUrl: string): string {
            if (!encryptedMediaUrl) return '';
            try {
              const singleKey = Buffer.from('38346591', 'utf8');
              const tripleKey = Buffer.concat([singleKey, singleKey, singleKey]);
              const decipher = createDecipheriv('des-ede3-ecb', tripleKey, null);
              decipher.setAutoPadding(true);
              let dec = decipher.update(encryptedMediaUrl, 'base64', 'utf8');
              dec += decipher.final('utf8');
              return dec.trim().replace('http:', 'https:');
            } catch {
              return '';
            }
          }

          function isTitleMatch(saavnTitle: string, targetTitle: string): boolean {
            if (!saavnTitle || !targetTitle) return false;
            const s = (saavnTitle || '').toLowerCase().replace(/[^\p{L}\p{N}\s'-]/gu, ' ').replace(/\s+/g, ' ').trim();
            const t = (targetTitle || '').toLowerCase().replace(/[^\p{L}\p{N}\s'-]/gu, ' ').replace(/\s+/g, ' ').trim();
            if (s === t) return true;
            if (s.includes(t) || t.includes(s)) return true;
            const sWords = s.split(' ').filter(w => w.length > 2);
            const tWords = t.split(' ').filter(w => w.length > 2);
            if (tWords.length === 0) return true;
            const common = sWords.filter(w => tWords.includes(w));
            return common.length >= Math.min(2, tWords.length);
          }

          function isDisallowed(url: string, duration?: number): boolean {
            if (!url || typeof url !== 'string') return true;
            if (
              url.includes('dzcdn.net') ||
              url.includes('mzstatic') ||
              url.includes('apple.com') ||
              url.includes('preview') ||
              url.includes('p.scdn.co')
            ) {
              return true;
            }
            if (duration && Number(duration) <= 30) {
              return true;
            }
            return false;
          }

          // Tier 1: Saavn 320kbps MP4 Completo Nativo com 3DES
          if (cleanT) {
            const candidateList = Array.from(candidates);
            if (cleanT.length > 4) candidateList.push(cleanT);

            const saavnPromises = candidateList.slice(0, 3).map(async (cand) => {
              const q = `${cleanT} ${cand}`.trim();
              const jioUrl = `https://www.jiosaavn.com/api.php?_format=json&_marker=0&api_version=4&ctx=web6dot0&__call=search.getResults&q=${encodeURIComponent(q)}&p=0&n=5`;
              const saavnRes = await fetch(jioUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
                signal: AbortSignal.timeout(3000)
              });
              if (saavnRes.ok) {
                const data = await saavnRes.json();
                for (const item of (data.results || [])) {
                  if (!isTitleMatch(item.title, cleanT)) continue;
                  const encUrl = item.more_info?.encrypted_media_url;
                  if (encUrl) {
                    const rawUrl = decryptSaavnMedia(encUrl);
                    if (rawUrl && rawUrl.includes('saavncdn.com')) {
                      const streamUrl = rawUrl.replace(/_\d+\.mp4$/, '_320.mp4');
                      const duration = Number(item.more_info?.duration) || 210;
                      if (!isDisallowed(streamUrl, duration)) {
                        return {
                          url: streamUrl,
                          duration,
                          mimeType: 'audio/mp4',
                          title: item.title || title,
                          artist: cand,
                          source: 'saavn-320'
                        };
                      }
                    }
                  }
                }
              }
              throw new Error('not found');
            });

            try {
              const winner = await Promise.any(saavnPromises);
              if (winner?.url) {
                res.statusCode = 200;
                res.end(JSON.stringify(winner));
                return;
              }
            } catch {}
          }

          // Tier 2: YouTube Completo via YTDL nativo (Zero 30s)
          try {
            let youtubeId = id.replace(/^yt-/, '').split('&')[0];
            if (!youtubeId || !/^[a-zA-Z0-9_-]{11}$/.test(youtubeId)) {
              if (cleanT) {
                const query = `${cleanT} ${Array.from(candidates)[0] || artist}`.trim();
                const ytResp = await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, {
                  headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept-Language': 'en-US,en;q=0.9'
                  },
                  signal: AbortSignal.timeout(3000)
                });
                if (ytResp.ok) {
                  const html = await ytResp.text();
                  const match = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
                  if (match && match[1]) {
                    youtubeId = match[1];
                  }
                }
              }
            }

            if (youtubeId && /^[a-zA-Z0-9_-]{11}$/.test(youtubeId)) {
              const info = await ytdlClient.getInfo(youtubeId);
              const duration = Number(info.videoDetails?.lengthSeconds) || 210;
              const format = info.formats.find((f: any) => f.itag === 140) || info.formats.find((f: any) => f.hasAudio && !f.hasVideo);
              if (duration > 30 && format?.url) {
                ytCache.set(youtubeId, { url: format.url, contentLength: format.contentLength, expires: Date.now() + 3600000 });
                res.statusCode = 200;
                res.end(JSON.stringify({
                  url: `/api/stream?yt=${youtubeId}`,
                  duration,
                  mimeType: 'audio/mp4',
                  title: info.videoDetails?.title || title,
                  artist: info.videoDetails?.author?.name || artist,
                  source: 'youtube-full'
                }));
                return;
              }
            }
          } catch {}

          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'Áudio completo não encontrado' }));
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

          const match = input.match(/(playlist|album|track|artist)[/:]([a-zA-Z0-9]+)/i);
          const type = match ? match[1].toLowerCase() : 'playlist';
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
                  const creator = entity.owner?.name || entity.subtitle || (Array.isArray(entity.artists) ? entity.artists.map((a: any) => a.name).join(', ') : 'Spotify');
                  const cover = entity.coverArt?.sources?.[0]?.url || entity.visualIdentity?.image?.[0]?.url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80';

                  let songs: any[] = [];

                  if (entity.type === 'track') {
                    songs = [{
                      id: `sp-${entity.id || playId}-${Date.now()}`,
                      name: entity.name || entity.title || 'Música',
                      artist: Array.isArray(entity.artists) ? entity.artists.map((a: any) => a.name).join(', ') : creator,
                      album: entity.album?.name || 'Single',
                      thumbnail: entity.visualIdentity?.image?.[0]?.url || cover,
                      duration: Math.round((entity.duration || 180000) / 1000)
                    }];
                  } else {
                    const rawTracks = entity.trackList || entity.tracks || [];
                    songs = rawTracks.map((t: any, idx: number) => {
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
                        artist: t.subtitle || (Array.isArray(t.artists) ? t.artists.map((a: any) => a.name).join(', ') : creator),
                        album: t.album?.name || name,
                        thumbnail: trackThumb,
                        duration: Math.round((t.duration || 180000) / 1000)
                      };
                    });
                  }

                  if (songs.length > 0) {
                    res.statusCode = 200;
                    res.end(JSON.stringify({ name, creator, cover, songs }));
                    return;
                  }
                }
              }
            }

            // Fallback inteligente: consulta oEmbed e busca faixas no Deezer
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

            if (type === 'track' && fallbackTitle) {
              res.statusCode = 200;
              res.end(JSON.stringify({
                name: fallbackTitle,
                creator: 'Spotify',
                cover: fallbackCover || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
                songs: [{
                  id: `sp-track-${playId}-${Date.now()}`,
                  name: fallbackTitle,
                  artist: 'Spotify',
                  thumbnail: fallbackCover,
                  duration: 210
                }]
              }));
              return;
            }

            if (fallbackTitle) {
              try {
                const queryTerm = type === 'artist' ? `artist:"${fallbackTitle}"` : fallbackTitle;
                const dzRes = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(queryTerm)}&limit=30`, {
                  signal: AbortSignal.timeout(5000)
                });
                if (dzRes.ok) {
                  const dzData = await dzRes.json();
                  if (Array.isArray(dzData.data) && dzData.data.length > 0) {
                    const songs = dzData.data.map((item: any, idx: number) => ({
                      id: `sp-dz-${item.id || idx}-${Date.now()}`,
                      name: item.title,
                      artist: item.artist?.name || fallbackTitle,
                      album: item.album?.title || fallbackTitle,
                      thumbnail: item.album?.cover_medium || fallbackCover || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
                      duration: item.duration || 210
                    }));

                    res.statusCode = 200;
                    res.end(JSON.stringify({
                      name: type === 'artist' ? `${fallbackTitle} • Top Músicas` : fallbackTitle,
                      creator: type === 'artist' ? fallbackTitle : 'Spotify',
                      cover: fallbackCover || songs[0]?.thumbnail || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
                      songs
                    }));
                    return;
                  }
                }
              } catch {}
            }

            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'Nenhuma faixa encontrada na playlist fornecida' }));
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
