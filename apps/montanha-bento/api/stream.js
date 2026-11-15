// Serverless Function /api/stream - Montanha Music Lab
// Resolve áudio de alta fidelidade (320kbps MP4 Akamai / Invidious / Deezer)
// Com CORS liberado para navegadores, PWAs e mobile (iOS / Android)

function sanitizeTitle(str) {
  return (str || '')
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/feat\..*$/i, '')
    .replace(/ft\..*$/i, '')
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractArtistCandidates(artistStr) {
  if (!artistStr) return [];
  const rawList = artistStr
    .split(/[,&/]|feat\.|ft\.|x\s+/i)
    .map(a => a.trim().replace(/[^\w\s-]/g, ' ').replace(/\s+/g, ' ').trim())
    .filter(a => a.length > 1);

  const candidates = [];
  for (const a of rawList) {
    if (!candidates.includes(a)) candidates.push(a);
  }
  const cleanedFull = artistStr.split(',')[0].trim();
  if (cleanedFull && !candidates.includes(cleanedFull)) {
    candidates.unshift(cleanedFull);
  }
  return candidates.length > 0 ? candidates : [artistStr.trim()];
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

  // 1. TIER 1: JioSaavn 320kbps MP4 via Fast-Saavn (Akamai CDN - Zero Bloqueio de YouTube)
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

  // 2. TIER 2: Deezer API
  if (cleanT) {
    try {
      const q = `${cleanT} ${candidates[0] || ''}`.trim();
      const dzRes = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(q)}&limit=1`, {
        signal: AbortSignal.timeout(3000)
      });
      if (dzRes.ok) {
        const dzData = await dzRes.json();
        const track = dzData?.data?.[0];
        if (track?.preview) {
          return res.status(200).json({
            url: track.preview,
            duration: track.duration || 30,
            mimeType: 'audio/mpeg',
            title: track.title || title,
            artist: track.artist?.name || artist,
            source: 'deezer'
          });
        }
      }
    } catch {}
  }

  // 3. TIER 3: Invidious Audio Stream Resolver
  const youtubeId = id.replace(/^yt-/, '').split('&')[0];
  const mirrors = ['https://yt.chocolatemoo53.com', 'https://inv.nadeko.net', 'https://echostreamz.com'];

  if (youtubeId && /^[a-zA-Z0-9_-]{11}$/.test(youtubeId)) {
    for (const host of mirrors) {
      try {
        const invRes = await fetch(`${host}/api/v1/videos/${youtubeId}`, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: AbortSignal.timeout(3000)
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
