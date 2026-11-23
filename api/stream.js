// Serverless Function /api/stream - Montanha Music
// Resolve áudio de alta fidelidade (320kbps MP4 Akamai JioSaavn nativo / YouTube Completo 206 Range Proxy)
// 100% MÚSICAS COMPLETAS — PREVIEWS DE 30s BANIDOS TERMINANTEMENTE

import { createDecipheriv } from 'node:crypto';
import { Ytdl } from '@distube/ytdl-core';

const ytdlClient = new Ytdl();
const ytCache = new Map();

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
  const firstWord = rawList[0]?.split(' ')[0];
  if (firstWord && firstWord.length > 2 && !candidates.includes(firstWord)) {
    candidates.push(firstWord);
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
    'karaoke',
    'tribute',
    'originally performed by',
    'in the style of',
    'instrumental version',
    'cover version',
    '8-bit',
    '16-bit',
    'chiptune',
    'midi version'
  ];
  for (const marker of badMarkers) {
    if (lower.includes(marker) && !qLower.includes(marker)) {
      return true;
    }
  }
  return false;
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

function isDisallowedPreview(url, duration) {
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

async function searchYouTubeVideoId(query) {
  if (!query) return null;
  try {
    const ytSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
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
        return match[1];
      }
    }
  } catch {}
  return null;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. FAST-PATH: Range Proxying para YouTube (Status 206, chunked streaming seguro contra timeout)
  const ytDirectId = (req.query?.yt || req.body?.yt || '').trim();
  if (ytDirectId && /^[a-zA-Z0-9_-]{11}$/.test(ytDirectId)) {
    try {
      let cached = ytCache.get(ytDirectId);
      if (!cached || Date.now() > cached.expires) {
        const info = await ytdlClient.getInfo(ytDirectId);
        const format = info.formats.find(f => f.itag === 140) || info.formats.find(f => f.hasAudio && !f.hasVideo);
        if (!format) {
          return res.status(404).json({ error: 'Nenhum formato de áudio disponível' });
        }
        cached = {
          contentLength: Number(format.contentLength) || 5000000,
          expires: Date.now() + 3600000
        };
        ytCache.set(ytDirectId, cached);
      }

      const totalLen = cached.contentLength;
      let start = 0;
      let end = totalLen - 1;

      const clientRange = req.headers?.range;
      if (clientRange && clientRange.startsWith('bytes=')) {
        const parts = clientRange.replace(/bytes=/, '').split('-');
        start = parseInt(parts[0], 10) || 0;
        if (parts[1]) {
          end = parseInt(parts[1], 10);
        } else {
          // Chunk de 1MB por requisição garante resposta instantânea sem timeout na Vercel
          end = Math.min(start + 1048576, totalLen - 1);
        }
      } else {
        end = Math.min(1048576, totalLen - 1);
      }

      const chunkSize = end - start + 1;
      res.status(206);
      res.setHeader('Content-Type', 'audio/mp4');
      res.setHeader('Content-Range', `bytes ${start}-${end}/${totalLen}`);
      res.setHeader('Content-Length', chunkSize);
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'public, max-age=3600');

      const downloadStream = ytdlClient.download(ytDirectId, {
        filter: f => f.hasAudio && !f.hasVideo,
        range: { start, end }
      });

      downloadStream.pipe(res);
      return;
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao transmitir áudio: ' + (err?.message || err) });
    }
  }

  const title = (req.query?.title || req.query?.t || req.body?.title || '').trim();
  const artist = (req.query?.artist || req.query?.a || req.body?.artist || '').trim();
  const id = (req.query?.id || req.body?.id || '').trim();
  const quality = (req.query?.quality || req.body?.quality || 'high').trim();
  const bitrateSuffix = quality === 'economy' ? '_96' : quality === 'standard' ? '_160' : '_320';

  const cleanT = sanitizeTitle(title);
  const candidates = extractArtistCandidates(artist);

  if (!cleanT && !id) {
    return res.status(400).json({ error: 'Parâmetro title ou id obrigatório' });
  }

  // TIER 1: JioSaavn Nativo 320kbps MP4 Akamai (Descriptografia direta, zero CORS, zero 30s)
  if (cleanT) {
    try {
      const candidateList = [...candidates];
      const queries = [];
      if (candidateList.length > 0) {
        queries.push(`${cleanT} ${candidateList[0]}`.trim());
        if (candidateList[1]) queries.push(`${cleanT} ${candidateList[1]}`.trim());
        queries.push(`${candidateList[0]} ${cleanT}`.trim());
      }
      queries.push(cleanT);

      const saavnPromises = queries.slice(0, 4).map(async (q) => {
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
            if (candidateList.length > 0 && !isArtistMatch(itemArtist, candidateList)) continue;

            const enc = item.more_info?.encrypted_media_url;
            if (enc) {
              const raw = decryptSaavnMediaUrl(enc);
              if (raw && raw.includes('saavncdn.com')) {
                const streamUrl = raw.replace(/_\d+\.mp4$/, `${bitrateSuffix}.mp4`);
                const duration = Number(item.more_info?.duration) || 210;

                if (!isDisallowedPreview(streamUrl, duration)) {
                  return {
                    url: streamUrl,
                    duration,
                    mimeType: 'audio/mp4',
                    title: item.title || title,
                    artist: item.more_info?.artistMap?.primary_artists?.[0]?.name || candidates[0] || artist,
                    source: (quality === 'economy' ? 'saavn-96' : quality === 'standard' ? 'saavn-160' : 'saavn-320')
                  };
                }
              }
            }
          }
        }
        throw new Error('not found');
      });

      const winner = await Promise.any(saavnPromises);
      if (winner && !isDisallowedPreview(winner.url, winner.duration)) {
        return res.status(200).json(winner);
      }
    } catch {}
  }

  let lastYtError = null;
  // TIER 2: YouTube Completo via Range Proxy (Todas as faixas ocidentais, rock, metal, dance, sem 30s)
  try {
    let youtubeId = id.replace(/^yt-/, '').split('&')[0];
    if (!youtubeId || !/^[a-zA-Z0-9_-]{11}$/.test(youtubeId)) {
      if (cleanT) {
        const queries = [
          `${cleanT} ${candidates[0] || artist}`.trim(),
          candidates[1] ? `${cleanT} ${candidates[1]}` : null,
          cleanT
        ].filter(Boolean);

        for (const q of queries) {
          youtubeId = await searchYouTubeVideoId(q);
          if (youtubeId) break;
        }
      }
    }

    if (youtubeId && /^[a-zA-Z0-9_-]{11}$/.test(youtubeId)) {
      const info = await ytdlClient.getInfo(youtubeId);
      const duration = Number(info.videoDetails?.lengthSeconds) || 210;
      const format = info.formats.find(f => f.itag === 140) || info.formats.find(f => f.hasAudio && !f.hasVideo);

      if (duration > 30) {
        ytCache.set(youtubeId, {
          contentLength: Number(format?.contentLength) || 5000000,
          expires: Date.now() + 3600000
        });
        return res.status(200).json({
          url: `/api/stream?yt=${youtubeId}`,
          duration,
          mimeType: 'audio/mp4',
          title: info.videoDetails?.title || title,
          artist: info.videoDetails?.author?.name || artist,
          source: 'youtube-full'
        });
      }
    } else {
      lastYtError = 'No videoId resolved from YouTube search';
    }
  } catch (ytErr) {
    lastYtError = ytErr?.message || String(ytErr);
    console.warn('[Stream YouTube Fallback Error]', ytErr?.message || ytErr);
  }

  return res.status(404).json({ error: 'Fluxo de áudio completo não encontrado na fonte', ytError: lastYtError });
}
