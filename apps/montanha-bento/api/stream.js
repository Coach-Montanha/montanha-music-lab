// Serverless Function /api/stream - Montanha Music Lab
// Resolve áudio de alta fidelidade (320kbps MP4 Akamai / YouTube Audio Completo)
// Com CORS liberado para navegadores, PWAs e mobile (iOS / Android)
// ZERO PREVIEWS DE 30s: Apenas faixas integrais de alta duração

function sanitizeTitle(str) {
  return (str || '')
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
  const rawList = artistStr
    .split(/[,&/]|feat\.|ft\.|x\s+/i)
    .map(a => sanitizeTitle(a))
    .filter(a => a.length > 1);

  const candidates = [];
  const cleanedFull = sanitizeTitle(artistStr);
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
  return candidates.length > 0 ? candidates : [artistStr.trim()];
}

async function searchYouTubeVideoId(query) {
  if (!query) return null;
  try {
    const ytSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const ytResp = await fetch(ytSearchUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    clearTimeout(timeout);

    if (ytResp.ok) {
      const html = await ytResp.text();
      const match = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
      if (match && match[1]) {
        return match[1];
      }
    }
  } catch {}

  // Fallback Invidious / Piped search
  const searchMirrors = [
    `https://yt.chocolatemoo53.com/api/v1/search?q=${encodeURIComponent(query)}&type=video`,
    `https://invidious.nerdvpn.de/api/v1/search?q=${encodeURIComponent(query)}&type=video`
  ];
  for (const mirror of searchMirrors) {
    try {
      const r = await fetch(mirror, { signal: AbortSignal.timeout(3000) });
      if (r.ok) {
        const data = await r.json();
        if (Array.isArray(data) && data[0]?.videoId) {
          return data[0].videoId;
        }
      }
    } catch {}
  }

  return null;
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

  const cleanT = sanitizeTitle(title);
  const candidates = extractArtistCandidates(artist);

  // 1. TIER 1: JioSaavn 320kbps MP4 via Fast-Saavn (Akamai CDN - Músicas Integrais em Alta Fidelidade)
  if (cleanT) {
    for (const cand of candidates) {
      try {
        const saavnRes = await fetch(
          `https://fast-saavn.vercel.app/api?title=${encodeURIComponent(cleanT)}&artist=${encodeURIComponent(cand)}`,
          { signal: AbortSignal.timeout(3500) }
        );
        if (saavnRes.ok) {
          const streamId = (await saavnRes.text()).trim();
          if (streamId && streamId.length > 5 && !streamId.includes('error') && !streamId.includes('not found')) {
            return res.status(200).json({
              url: `https://aac.saavncdn.com/${streamId}_320.mp4`,
              duration: 210,
              mimeType: 'audio/mp4',
              title,
              artist: cand,
              source: 'saavn-320'
            });
          }
        }
      } catch {}
    }

    // Tentativa somente com título se for bem específico
    if (cleanT.length > 4) {
      try {
        const saavnRes = await fetch(
          `https://fast-saavn.vercel.app/api?title=${encodeURIComponent(cleanT)}&artist=${encodeURIComponent(cleanT)}`,
          { signal: AbortSignal.timeout(2500) }
        );
        if (saavnRes.ok) {
          const streamId = (await saavnRes.text()).trim();
          if (streamId && streamId.length > 5 && !streamId.includes('error') && !streamId.includes('not found')) {
            return res.status(200).json({
              url: `https://aac.saavncdn.com/${streamId}_320.mp4`,
              duration: 210,
              mimeType: 'audio/mp4',
              title,
              artist,
              source: 'saavn-320'
            });
          }
        }
      } catch {}
    }
  }

  // 2. TIER 2: YouTube Audio Completo via Invidious (Com Resolução Automática de ID se Não Fornecido)
  let youtubeId = id.replace(/^yt-/, '').split('&')[0];
  if (!youtubeId || !/^[a-zA-Z0-9_-]{11}$/.test(youtubeId)) {
    if (cleanT) {
      const query = `${cleanT} ${candidates[0] || artist}`.trim();
      youtubeId = await searchYouTubeVideoId(query);
    }
  }

  if (youtubeId && /^[a-zA-Z0-9_-]{11}$/.test(youtubeId)) {
    const mirrors = ['https://yt.chocolatemoo53.com', 'https://invidious.nerdvpn.de', 'https://inv.nadeko.net'];

    for (const host of mirrors) {
      try {
        const invRes = await fetch(`${host}/api/v1/videos/${youtubeId}`, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: AbortSignal.timeout(3500)
        });
        if (invRes.ok) {
          const data = await invRes.json();
          const audios = (data.adaptiveFormats || []).filter(
            (f) => f.type && (f.type.startsWith('audio/mp4') || f.type.startsWith('audio/webm'))
          );
          if (audios.length > 0) {
            audios.sort((a, b) => {
              const aMp4 = a.type.startsWith('audio/mp4') ? 1 : 0;
              const bMp4 = b.type.startsWith('audio/webm') ? 0 : 1;
              if (aMp4 !== bMp4) return bMp4 - aMp4;
              return (parseInt(b.bitrate) || 0) - (parseInt(a.bitrate) || 0);
            });
            const best = audios[0];
            const proxied = best.url.replace(new URL(best.url).origin, host);
            return res.status(200).json({
              url: proxied,
              duration: Number(data.lengthSeconds) || 210,
              mimeType: best.type.split(';')[0] || 'audio/mp4',
              title: data.title || title,
              artist: data.author || artist,
              source: 'invidious'
            });
          }
        }
      } catch {}
    }
  }

  return res.status(404).json({ error: 'Fluxo de áudio não encontrado' });
}
