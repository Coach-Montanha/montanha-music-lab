// Serverless Function /api/stream - Montanha Music
// Resolve áudio de alta fidelidade (320kbps MP4 Akamai JioSaavn nativo)
// 100% MÚSICAS COMPLETAS — PREVIEWS DE 30s BANIDOS TERMINANTEMENTE

import { createDecipheriv } from 'node:crypto';

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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const title = (req.query?.title || req.query?.t || req.body?.title || '').trim();
  const artist = (req.query?.artist || req.query?.a || req.body?.artist || '').trim();
  const quality = (req.query?.quality || req.body?.quality || 'high').trim();
  const bitrateSuffix = quality === 'economy' ? '_96' : quality === 'standard' ? '_160' : '_320';

  const cleanT = sanitizeTitle(title);
  const candidates = extractArtistCandidates(artist);

  if (!cleanT) {
    return res.status(400).json({ error: 'Parâmetro title obrigatório' });
  }

  // TIER 1: JioSaavn Nativo 320kbps MP4 Akamai (Descriptografia direta, zero CORS, zero 30s)
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

  return res.status(404).json({ error: 'Fluxo de áudio completo não encontrado na fonte' });
}
