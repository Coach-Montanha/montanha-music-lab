// Motor Resiliente de Streaming de Áudio Multi-Tier para PWA
// Suporta reprodução em segundo plano com tela desligada / bloqueada (Android e iOS)

export interface StreamResult {
  url: string;
  duration: number;
  mimeType: string;
  title?: string;
  artist?: string;
  source: 'saavn-320' | 'invidious' | 'soundcloud' | 'deezer' | 'blob';
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

function sanitizeArtist(str: string): string {
  return (str || '')
    .split(',')[0]
    .split('&')[0]
    .replace(/\s+/g, ' ')
    .trim();
}

// 1. TIER 1: Akamai CDN 320kbps MP4/AAC via Fast-Saavn
async function fetchFromSaavn(title: string, artist: string): Promise<StreamResult | null> {
  const cleanT = sanitizeTitle(title);
  const cleanA = sanitizeArtist(artist);
  if (!cleanT) return null;

  try {
    const res = await fetch(
      `https://fast-saavn.vercel.app/api?title=${encodeURIComponent(cleanT)}&artist=${encodeURIComponent(cleanA)}`,
      { signal: AbortSignal.timeout(3000) }
    );
    if (res.ok) {
      const id = (await res.text()).trim();
      if (id && id.length > 5 && !id.includes('error') && !id.includes('not found')) {
        const fullUrl = `https://aac.saavncdn.com/${id}_320.mp4`;
        return {
          url: fullUrl,
          duration: 240,
          mimeType: 'audio/mp4',
          title,
          artist,
          source: 'saavn-320'
        };
      }
    }
  } catch {}
  return null;
}

// 2. TIER 2: Invidious Multi-Mirror Resolver (Audio/MP4 Proxy 206)
async function fetchFromInvidious(youtubeId?: string, query?: string): Promise<StreamResult | null> {
  const mirrors = [
    'https://echostreamz.com',
    'https://yt.chocolatemoo53.com',
    'https://inv.nadeko.net'
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
              const bMp4 = b.type.startsWith('audio/mp4') ? 1 : 0;
              if (aMp4 !== bMp4) return bMp4 - aMp4;
              return (parseInt(b.bitrate) || 0) - (parseInt(a.bitrate) || 0);
            });
            const best = audios[0];
            const proxied = best.url.replace(new URL(best.url).origin, host);
            return {
              url: proxied,
              duration: Number(data.lengthSeconds) || 240,
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

// 3. TIER 3: Backend Serverless API /api/youtube/stream
async function fetchFromBackendApi(youtubeId: string): Promise<StreamResult | null> {
  try {
    const res = await fetch(`/api/youtube/stream?id=${encodeURIComponent(youtubeId)}`, {
      signal: AbortSignal.timeout(2500)
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.url && !data.url.includes('youtube.com/watch')) {
        return {
          url: data.url,
          duration: Number(data.duration) || 240,
          mimeType: data.mimeType || 'audio/mp4',
          title: data.title,
          artist: data.artist,
          source: 'invidious'
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

  // Passo 2: Backend Serverless com cache e proxy
  if (cleanId) {
    const backendResult = await fetchFromBackendApi(cleanId);
    if (backendResult) {
      streamCache.set(cacheKey, backendResult);
      return backendResult;
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

  // Passo 4: Fallback Deezer HQ Preview CDN (Garante áudio imediato sem tela preta)
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
