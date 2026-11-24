// api/stream.js — Vercel Serverless (Node 18+)
// Resolve cada faixa para UMA destas respostas:
//   { kind: 'audio',   url, duration, source }  -> tocar no <audio>
//   { kind: 'youtube', videoId, duration }       -> tocar no YouTubeAdapter oficial (IFrame API)
//   { kind: 'unavailable' }                      -> marcar como indisponível

import { createDecipheriv } from 'node:crypto';

const AUDIUS_BASE = 'https://api.audius.co/v1';
const APP_NAME = 'montanha-music';

const norm = (s = '') =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\(.*?\)|\[.*?\]/g, ' ')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

function sameSong(title, artist, cand) {
  const t = norm(title);
  const a = norm(artist);
  const ct = norm(cand.title);
  const ca = norm(cand.user?.name);
  return Boolean(t && ct.includes(t) && ca && (ca.includes(a) || a.includes(ca)));
}

function sanitizeTitle(str) {
  return (str || '')
    .replace(/[\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]/g, ' ')
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/feat\..*$/i, '')
    .replace(/ft\..*$/i, '')
    .replace(/[^\p{L}\p{N}\s'-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractArtistCandidates(artistStr) {
  if (!artistStr) return [];
  const normalized = artistStr.replace(/[\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]/g, ' ');
  const rawList = normalized
    .split(/[,&/]|feat\.|ft\.|x\s+/i)
    .map(a => sanitizeTitle(a))
    .filter(a => a.length > 1);

  const candidates = [];
  const cleanedFull = sanitizeTitle(normalized);
  if (cleanedFull && !candidates.includes(cleanedFull)) {
    candidates.push(cleanedFull);
  }
  for (const a of rawList) {
    if (!candidates.includes(a)) candidates.push(a);
  }
  return candidates.length > 0 ? candidates : [normalized.trim()];
}

function isTitleMatch(saavnTitle, targetTitle) {
  if (!saavnTitle || !targetTitle) return false;
  const s = sanitizeTitle(saavnTitle).toLowerCase();
  const t = sanitizeTitle(targetTitle).toLowerCase();
  if (s === t) return true;
  if (s.includes(t) || t.includes(s)) return true;
  const sWords = s.split(' ').filter(w => w.length > 2);
  const tWords = t.split(' ').filter(w => w.length > 2);
  if (tWords.length === 0) return true;
  const common = sWords.filter(w => tWords.includes(w));
  return common.length >= Math.min(2, tWords.length);
}

function isArtistMatch(saavnArtist, candidates) {
  if (!candidates || candidates.length === 0) return true;
  if (!saavnArtist) return false;
  const s = sanitizeTitle(saavnArtist).toLowerCase();
  for (const cand of candidates) {
    const c = cand.toLowerCase();
    if (s.includes(c) || c.includes(s)) return true;
    const sWords = s.split(' ').filter(w => w.length > 2);
    const cWords = c.split(' ').filter(w => w.length > 2);
    if (cWords.some(w => sWords.includes(w))) return true;
  }
  return false;
}

function isFakeCover(title, query) {
  if (!title) return false;
  const lower = title.toLowerCase();
  const qLower = (query || '').toLowerCase();
  const badMarkers = [
    'karaoke', 'tribute', 'originally performed by', 'in the style of',
    'instrumental version', 'cover version', '8-bit', '16-bit', 'chiptune', 'midi version'
  ];
  return badMarkers.some(m => lower.includes(m) && !qLower.includes(m));
}

// Descriptografia nativa de stream JioSaavn (3DES-ECB com chave '38346591' repetida 3x)
function decryptSaavnMediaUrl(encryptedMediaUrl) {
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

// ---------- Resolvedor 1: JioSaavn 320kbps MP4 Akamai (Zero CORS, Estúdio) ----------
async function resolveJioSaavn(title, artist, quality = 'high') {
  const cleanT = sanitizeTitle(title);
  const candidates = extractArtistCandidates(artist);
  const bitrateSuffix = quality === 'economy' ? '_96' : quality === 'standard' ? '_160' : '_320';

  const queries = [];
  if (candidates.length > 0) {
    queries.push(`${cleanT} ${candidates[0]}`.trim());
    if (candidates[1]) queries.push(`${cleanT} ${candidates[1]}`.trim());
  }
  queries.push(cleanT);

  for (const q of queries.slice(0, 3)) {
    try {
      const jioUrl = `https://www.jiosaavn.com/api.php?_format=json&_marker=0&api_version=4&ctx=web6dot0&__call=search.getResults&q=${encodeURIComponent(q)}&p=0&n=5`;
      const resp = await fetch(jioUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        signal: AbortSignal.timeout(3000)
      });
      if (resp.ok) {
        const data = await resp.json();
        const results = data.results || [];
        for (const item of results) {
          if (!isTitleMatch(item.title, cleanT)) continue;
          if (isFakeCover(item.title, cleanT)) continue;

          const itemArtist = item.more_info?.artistMap?.primary_artists?.[0]?.name || item.more_info?.music || item.subtitle || '';
          if (candidates.length > 0 && !isArtistMatch(itemArtist, candidates)) continue;

          const enc = item.more_info?.encrypted_media_url;
          if (enc) {
            const raw = decryptSaavnMediaUrl(enc);
            if (raw && raw.includes('saavncdn.com')) {
              const streamUrl = raw.replace(/_\d+\.mp4$/, `${bitrateSuffix}.mp4`);
              const duration = Number(item.more_info?.duration) || 210;
              return {
                kind: 'audio',
                url: streamUrl,
                duration,
                source: (quality === 'economy' ? 'saavn-96' : quality === 'standard' ? 'saavn-160' : 'saavn-320')
              };
            }
          }
        }
      }
    } catch {}
  }
  return null;
}

// ---------- Resolvedor 2: Audius (API aberta, MP3 completo) ----------
async function resolveAudius(title, artist) {
  try {
    const headers = process.env.AUDIUS_API_KEY
      ? { Authorization: `Bearer ${process.env.AUDIUS_API_KEY}` }
      : {};
    const q = encodeURIComponent(`${artist} ${title}`);

    const search = await fetch(`${AUDIUS_BASE}/tracks/search?query=${q}&app_name=${APP_NAME}`, {
      headers,
      signal: AbortSignal.timeout(3000)
    });
    if (!search.ok) return null;
    const { data = [] } = await search.json();

    const hit = data.find((t) => t.is_streamable !== false && sameSong(title, artist, t));
    if (!hit) return null;

    const stream = await fetch(
      `${AUDIUS_BASE}/tracks/${hit.id}/stream?no_redirect=true&app_name=${APP_NAME}`,
      { headers, signal: AbortSignal.timeout(3000) }
    );
    if (!stream.ok) return null;
    const { data: url } = await stream.json();
    return url ? { kind: 'audio', url, duration: hit.duration || 210, source: 'audius' } : null;
  } catch {
    return null;
  }
}

// ---------- Resolvedor 3: YouTube (ID do vídeo para YouTubeAdapter oficial) ----------
async function resolveYouTube(title, artist, knownId) {
  if (knownId && /^[a-zA-Z0-9_-]{11}$/.test(knownId)) {
    return { kind: 'youtube', videoId: knownId };
  }

  // Se houver YOUTUBE_API_KEY configurada, tenta primeiro a API oficial v3
  const key = process.env.YOUTUBE_API_KEY;
  if (key) {
    try {
      const params = new URLSearchParams({
        part: 'snippet',
        type: 'video',
        videoEmbeddable: 'true',
        videoSyndicated: 'true',
        videoCategoryId: '10',
        maxResults: '3',
        q: `${artist} ${title} official audio`,
        key,
      });
      const r = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`, {
        signal: AbortSignal.timeout(3000)
      });
      if (r.ok) {
        const { items = [] } = await r.json();
        const videoId = items[0]?.id?.videoId;
        if (videoId) return { kind: 'youtube', videoId };
      }
    } catch {}
  }

  // Fallback resiliente sem API key: busca pública via HTML scrape leve
  try {
    const ytSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${artist} ${title} official`)}`;
    const ytResp = await fetch(ytSearchUrl, {
      signal: AbortSignal.timeout(3500),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    if (ytResp.ok) {
      const html = await ytResp.text();
      const match = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
      if (match && match[1]) {
        return { kind: 'youtube', videoId: match[1] };
      }
    }
  } catch {}

  return null;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const title = (req.query?.title || req.query?.t || '').trim();
  const artist = (req.query?.artist || req.query?.a || '').trim();
  const youtubeId = (req.query?.youtubeId || req.query?.id || '').replace(/^yt-/, '').split('&')[0].trim();
  const quality = (req.query?.quality || 'high').trim();

  if (!title && !youtubeId) {
    return res.status(400).json({ kind: 'unavailable', error: 'title ou youtubeId são obrigatórios' });
  }

  const resolvers = [
    () => resolveJioSaavn(title, artist, quality),
    () => resolveAudius(title, artist),
    () => resolveYouTube(title, artist, youtubeId),
  ];

  for (const resolve of resolvers) {
    try {
      const result = await resolve();
      if (result) {
        const ttl = result.kind === 'youtube' ? 604800 : 3600;
        res.setHeader('Cache-Control', `s-maxage=${ttl}, stale-while-revalidate=86400`);
        return res.status(200).json(result);
      }
    } catch (err) {
      console.warn('[stream] resolver falhou:', err?.message);
    }
  }

  res.setHeader('Cache-Control', 's-maxage=300');
  return res.status(200).json({ kind: 'unavailable' });
}
