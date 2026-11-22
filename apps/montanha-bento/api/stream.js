// Serverless Function /api/stream - Montanha Music
// Resolve áudio de alta fidelidade (320kbps MP4 Akamai JioSaavn nativo / YouTube Completo)
// 100% MÚSICAS COMPLETAS — PREVIEWS DE 30s BANIDOS TERMINANTEMENTE

import { createDecipheriv } from 'node:crypto';
import { Ytdl } from '@distube/ytdl-core';

const ytdlClient = new Ytdl();

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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const title = (req.query?.title || req.query?.t || req.body?.title || '').trim();
  const artist = (req.query?.artist || req.query?.a || req.body?.artist || '').trim();
  const id = (req.query?.id || req.body?.id || '').trim();
  const quality = (req.query?.quality || req.body?.quality || 'high').trim();
  const bitrateSuffix = quality === 'economy' ? '_96' : quality === 'standard' ? '_160' : '_320';

  const cleanT = sanitizeTitle(title);
  const candidates = extractArtistCandidates(artist);

  // 1. TIER 1: JioSaavn Nativo 320kbps MP4 Akamai (Validação estrita de título)
  const saavnPromise = (async () => {
    if (!cleanT) return null;
    const candidateList = [...candidates];
    if (cleanT.length > 4) candidateList.push(cleanT);

    const saavnPromises = candidateList.slice(0, 3).map(async (cand) => {
      const q = `${cleanT} ${cand}`.trim();
      const jioUrl = `https://www.jiosaavn.com/api.php?_format=json&_marker=0&api_version=4&ctx=web6dot0&__call=search.getResults&q=${encodeURIComponent(q)}&p=0&n=5`;
      const resp = await fetch(jioUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        signal: AbortSignal.timeout(3000)
      });
      if (resp.ok) {
        const data = await resp.json();
        const results = data.results || [];
        for (const item of results) {
          // Verifica correspondência semântica de título para evitar músicas aleatórias
          if (!isTitleMatch(item.title, cleanT)) continue;

          const encUrl = item.more_info?.encrypted_media_url;
          if (encUrl) {
            const rawUrl = decryptSaavnMediaUrl(encUrl);
            if (rawUrl && rawUrl.includes('saavncdn.com')) {
              const streamUrl = rawUrl.replace(/_\d+\.mp4$/, `${bitrateSuffix}.mp4`);
              const duration = Number(item.more_info?.duration) || 210;
              if (!isDisallowedPreview(streamUrl, duration)) {
                return {
                  url: streamUrl,
                  duration,
                  mimeType: 'audio/mp4',
                  title: item.title || title,
                  artist: cand,
                  source: (quality === 'economy' ? 'saavn-96' : quality === 'standard' ? 'saavn-160' : 'saavn-320')
                };
              }
            }
          }
        }
      }
      throw new Error('not found');
    });

    try {
      return await Promise.any(saavnPromises);
    } catch {
      return null;
    }
  })();

  // 2. TIER 2: YouTube Completo via YTDL nativo (Zero 30s, faixas completas com 206 HTTP)
  let ytdlErr = null;
  const ytdlPromise = (async () => {
    try {
      let youtubeId = id.replace(/^yt-/, '').split('&')[0];
      if (!youtubeId || !/^[a-zA-Z0-9_-]{11}$/.test(youtubeId)) {
        if (cleanT) {
          const query = `${cleanT} ${candidates[0] || artist}`.trim();
          youtubeId = await searchYouTubeVideoId(query);
        }
      }

      if (youtubeId && /^[a-zA-Z0-9_-]{11}$/.test(youtubeId)) {
        const info = await ytdlClient.getInfo(`https://www.youtube.com/watch?v=${youtubeId}`, { client: ['android', 'ios', 'tv'] });
        const duration = Number(info.videoDetails?.lengthSeconds) || 210;
        const audioFormats = (info.formats || []).filter(f => f.hasAudio && !f.hasVideo && f.url);
        
        if (audioFormats.length > 0) {
          const sorted = [...audioFormats].sort((a, b) => {
            const aMp4 = (a.mimeType || '').includes('mp4') ? 1 : 0;
            const bMp4 = (b.mimeType || '').includes('mp4') ? 1 : 0;
            if (aMp4 !== bMp4) return bMp4 - aMp4;
            return (b.audioBitrate || 0) - (a.audioBitrate || 0);
          });
          const best = sorted[0];
          if (best?.url && !isDisallowedPreview(best.url, duration)) {
            return {
              url: best.url,
              duration,
              mimeType: best.mimeType ? best.mimeType.split(';')[0] : 'audio/mp4',
              title: info.videoDetails?.title || title,
              artist: info.videoDetails?.author?.name || artist,
              source: 'youtube-full'
            };
          }
        }
      }
    } catch (e) {
      ytdlErr = e?.message || String(e);
    }
    return null;
  })();

  // 3. TIER 3: Invidious YouTube Resolver (Fallback secundário para stream completo)
  const invidiousPromise = (async () => {
    let youtubeId = id.replace(/^yt-/, '').split('&')[0];
    if (!youtubeId || !/^[a-zA-Z0-9_-]{11}$/.test(youtubeId)) {
      if (cleanT) {
        const query = `${cleanT} ${candidates[0] || artist}`.trim();
        youtubeId = await searchYouTubeVideoId(query);
      }
    }

    if (youtubeId && /^[a-zA-Z0-9_-]{11}$/.test(youtubeId)) {
      const mirrors = ['https://yt.chocolatemoo53.com', 'https://inv.nadeko.net'];

      const mirrorPromises = mirrors.map(async (host) => {
        const invRes = await fetch(`${host}/api/v1/videos/${youtubeId}`, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: AbortSignal.timeout(3200)
        });
        if (invRes.ok) {
          const data = await invRes.json();
          const duration = Number(data.lengthSeconds) || 210;
          const audios = (data.adaptiveFormats || []).filter(
            (f) => f.type && (f.type.startsWith('audio/mp4') || f.type.startsWith('audio/webm'))
          );
          if (audios.length > 0) {
            audios.sort((a, b) => {
              const aMp4 = a.type.startsWith('audio/mp4') ? 1 : 0;
              const bMp4 = b.type.startsWith('audio/webm') ? 0 : 1;
              if (aMp4 !== bMp4) return bMp4 - aMp4;
              const bitDiff = (parseInt(b.bitrate) || 0) - (parseInt(a.bitrate) || 0);
              return quality === 'economy' ? -bitDiff : bitDiff;
            });
            const best = audios[0];
            const proxied = best.url.replace(new URL(best.url).origin, host);
            if (!isDisallowedPreview(proxied, duration)) {
              return {
                url: proxied,
                duration,
                mimeType: best.type.split(';')[0] || 'audio/mp4',
                title: data.title || title,
                artist: data.author || artist,
                source: 'invidious-full'
              };
            }
          }
        }
        throw new Error('mirror failed');
      });

      try {
        return await Promise.any(mirrorPromises);
      } catch {}
    }
    return null;
  })();

  const [saavnRes, ytdlRes, invRes] = await Promise.all([
    saavnPromise,
    ytdlPromise,
    invidiousPromise
  ]);

  const finalWinner = saavnRes || ytdlRes || invRes;

  if (finalWinner && !isDisallowedPreview(finalWinner.url, finalWinner.duration)) {
    return res.status(200).json(finalWinner);
  }

  return res.status(404).json({ error: 'Fluxo de áudio completo não encontrado', ytdlError: ytdlErr });
}
