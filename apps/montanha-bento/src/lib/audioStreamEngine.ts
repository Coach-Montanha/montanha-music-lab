// Motor Resiliente de Streaming de Áudio Multi-Tier para PWA
// Suporta reprodução em segundo plano com tela desligada / bloqueada (Android e iOS)

export interface StreamResult {
  url: string;
  duration: number;
  mimeType: string;
  title?: string;
  artist?: string;
  source: 'saavn-320' | 'invidious' | 'deezer' | 'blob';
}

const streamCache = new Map<string, StreamResult>();

function sanitizeTitle(str: string): string {
  return (str || '')
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/feat\..*$/i, '')
    .replace(/ft\..*$/i, '')
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractArtistCandidates(artistStr: string): string[] {
  if (!artistStr) return [];
  const rawList = artistStr
    .split(/[,&/]|feat\.|ft\.|x\s+/i)
    .map(a => a.trim().replace(/[^\w\s-]/g, ' ').replace(/\s+/g, ' ').trim())
    .filter(a => a.length > 1);

  const candidates: string[] = [];
  for (const a of rawList) {
    if (!candidates.includes(a)) candidates.push(a);
  }
  // Adiciona também o nome original limpo
  const cleanedFull = artistStr.split(',')[0].trim();
  if (cleanedFull && !candidates.includes(cleanedFull)) {
    candidates.unshift(cleanedFull);
  }
  return candidates.length > 0 ? candidates : [artistStr.trim()];
}

// 1. TIER 1: Akamai CDN 320kbps MP4/AAC via Fast-Saavn com Multi-Artist Fallback
async function fetchFromSaavn(title: string, artist: string): Promise<StreamResult | null> {
  const cleanT = sanitizeTitle(title);
  if (!cleanT) return null;

  const artistCandidates = extractArtistCandidates(artist);

  for (const candidate of artistCandidates) {
    try {
      const res = await fetch(
        `https://fast-saavn.vercel.app/api?title=${encodeURIComponent(cleanT)}&artist=${encodeURIComponent(candidate)}`,
        { signal: AbortSignal.timeout(3000) }
      );
      if (res.ok) {
        const id = (await res.text()).trim();
        if (id && id.length > 5 && !id.includes('error') && !id.includes('not found')) {
          const fullUrl = `https://aac.saavncdn.com/${id}_320.mp4`;
          return {
            url: fullUrl,
            duration: 210,
            mimeType: 'audio/mp4',
            title,
            artist,
            source: 'saavn-320'
          };
        }
      }
    } catch {}
  }

  // Tentativa final sem artista (se o título for bem específico)
  if (cleanT.length > 4) {
    try {
      const res = await fetch(
        `https://fast-saavn.vercel.app/api?title=${encodeURIComponent(cleanT)}&artist=${encodeURIComponent(cleanT)}`,
        { signal: AbortSignal.timeout(2000) }
      );
      if (res.ok) {
        const id = (await res.text()).trim();
        if (id && id.length > 5 && !id.includes('error') && !id.includes('not found')) {
          return {
            url: `https://aac.saavncdn.com/${id}_320.mp4`,
            duration: 210,
            mimeType: 'audio/mp4',
            title,
            artist,
            source: 'saavn-320'
          };
        }
      }
    } catch {}
  }

  return null;
}

// 2. TIER 2: Invidious Multi-Mirror Resolver (Audio/MP4 Proxy 206)
async function fetchFromInvidious(youtubeId?: string, query?: string): Promise<StreamResult | null> {
  const mirrors = [
    'https://yt.chocolatemoo53.com',
    'https://inv.nadeko.net',
    'https://echostreamz.com'
  ];

  for (const host of mirrors) {
    if (youtubeId && /^[a-zA-Z0-9_-]{11}$/.test(youtubeId)) {
      try {
        const res = await fetch(`${host}/api/v1/videos/${youtubeId}`, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: AbortSignal.timeout(2800)
        });
        if (res.ok) {
          const data = await res.json();
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
            return {
              url: proxied,
              duration: Number(data.lengthSeconds) || 210,
              mimeType: best.type.split(';')[0] || 'audio/mp4',
              title: data.title,
              artist: data.author,
              source: 'invidious'
            };
          }
        }
      } catch {}
    }
  }
  return null;
}

// 3. TIER 3: Deezer Search API (CDN Aberto Global)
async function fetchFromDeezer(title: string, artist: string): Promise<StreamResult | null> {
  try {
    const q = `${sanitizeTitle(title)} ${artist.split(',')[0].trim()}`.trim();
    const res = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(q)}&limit=1`, {
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) {
      const data = await res.json();
      const track = data?.data?.[0];
      if (track?.preview) {
        return {
          url: track.preview,
          duration: track.duration || 30,
          mimeType: 'audio/mpeg',
          title: track.title || title,
          artist: track.artist?.name || artist,
          source: 'deezer'
        };
      }
    }
  } catch {}
  return null;
}

export async function fetchAudioStream(
  youtubeId?: string,
  songName?: string,
  artistName?: string,
  fallbackAudioUrl?: string
): Promise<StreamResult | null> {
  const cleanId = (youtubeId || '').replace(/^yt-/, '').split('&')[0].trim();
  const cacheKey = cleanId || `${songName || ''}-${artistName || ''}`;

  if (streamCache.has(cacheKey)) {
    return streamCache.get(cacheKey)!;
  }

  // Passo 1: Busca no Saavn (Akamai 320kbps MP4 - zero bloqueio de YouTube, ultrarrápido)
  if (songName) {
    const saavnResult = await fetchFromSaavn(songName, artistName || '');
    if (saavnResult) {
      streamCache.set(cacheKey, saavnResult);
      return saavnResult;
    }
  }

  // Passo 2: Fallback Deezer HQ Audio CDN
  if (songName) {
    const deezerResult = await fetchFromDeezer(songName, artistName || '');
    if (deezerResult) {
      streamCache.set(cacheKey, deezerResult);
      return deezerResult;
    }
  }

  // Passo 3: Invidious Multi-Mirror
  if (cleanId) {
    const invidiousResult = await fetchFromInvidious(cleanId, `${songName || ''} ${artistName || ''}`);
    if (invidiousResult) {
      streamCache.set(cacheKey, invidiousResult);
      return invidiousResult;
    }
  }

  // Passo 4: Fallback URL existente do objeto song
  if (fallbackAudioUrl && fallbackAudioUrl.startsWith('http')) {
    const fallbackResult: StreamResult = {
      url: fallbackAudioUrl,
      duration: 30,
      mimeType: 'audio/mpeg',
      title: songName,
      artist: artistName,
      source: 'deezer'
    };
    return fallbackResult;
  }

  return null;
}
