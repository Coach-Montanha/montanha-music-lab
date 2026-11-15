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
const inflight = new Map<string, Promise<StreamResult | null>>();

export function invalidateStream(song: { id?: string; youtubeId?: string; name?: string; artist?: string } | string) {
  if (typeof song === 'string') {
    streamCache.delete(song);
    inflight.delete(song);
    return;
  }
  const cleanId = (song.youtubeId || '').replace(/^yt-/, '').split('&')[0].trim();
  const cacheKey = cleanId || `${song.name || ''}-${song.artist || ''}`;
  streamCache.delete(cacheKey);
  inflight.delete(cacheKey);
  if (song.id) {
    streamCache.delete(song.id);
    inflight.delete(song.id);
  }
}

function sanitizeTitle(str: string): string {
  return (str || '')
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/feat\..*$/i, '')
    .replace(/ft\..*$/i, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// 1. TIER 1: Nosso Endpoint Serverless Próprio /api/stream (Zero Erros de CORS no Navegador)
async function fetchFromInternalApi(title: string, artist: string, youtubeId?: string): Promise<StreamResult | null> {
  try {
    const params = new URLSearchParams();
    if (title) params.set('title', title);
    if (artist) params.set('artist', artist);
    if (youtubeId) params.set('id', youtubeId);

    const res = await fetch(`/api/stream?${params.toString()}`, {
      signal: AbortSignal.timeout(4500)
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.url && data.url.startsWith('http')) {
        return {
          url: data.url,
          duration: Number(data.duration) || 210,
          mimeType: data.mimeType || 'audio/mp4',
          title: data.title || title,
          artist: data.artist || artist,
          source: data.source || 'saavn-320'
        };
      }
    }
  } catch {}
  return null;
}

// 2. TIER 2: Fast-Saavn Direto (Contingência)
async function fetchFromSaavnDirect(title: string, artist: string): Promise<StreamResult | null> {
  const cleanT = sanitizeTitle(title);
  if (!cleanT) return null;
  const cleanA = (artist || '').split(',')[0].trim();

  try {
    const res = await fetch(
      `https://fast-saavn.vercel.app/api?title=${encodeURIComponent(cleanT)}&artist=${encodeURIComponent(cleanA)}`,
      { signal: AbortSignal.timeout(3000) }
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
  return null;
}

// 3. TIER 3: Deezer API Aberta (Contingência)
async function fetchFromDeezer(title: string, artist: string): Promise<StreamResult | null> {
  try {
    const q = `${sanitizeTitle(title)} ${(artist || '').split(',')[0].trim()}`.trim();
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

export function fetchAudioStream(
  youtubeId?: string,
  songName?: string,
  artistName?: string,
  fallbackAudioUrl?: string
): Promise<StreamResult | null> {
  const cleanId = (youtubeId || '').replace(/^yt-/, '').split('&')[0].trim();
  const cacheKey = cleanId || `${songName || ''}-${artistName || ''}`;

  if (streamCache.has(cacheKey)) {
    return Promise.resolve(streamCache.get(cacheKey)!);
  }

  if (inflight.has(cacheKey)) {
    return inflight.get(cacheKey)!;
  }

  const promise = (async () => {
    // Passo 1: Busca via Serverless API interna (Sem problemas de CORS no Mobile)
    if (songName || cleanId) {
      const internalResult = await fetchFromInternalApi(songName || '', artistName || '', cleanId);
      if (internalResult) {
        streamCache.set(cacheKey, internalResult);
        return internalResult;
      }
    }

    // Passo 2: Busca direta no Saavn (Akamai 320kbps MP4)
    if (songName) {
      const saavnResult = await fetchFromSaavnDirect(songName, artistName || '');
      if (saavnResult) {
        streamCache.set(cacheKey, saavnResult);
        return saavnResult;
      }
    }

    // Passo 3: Deezer CDN Fallback
    if (songName) {
      const deezerResult = await fetchFromDeezer(songName, artistName || '');
      if (deezerResult) {
        streamCache.set(cacheKey, deezerResult);
        return deezerResult;
      }
    }

    // Passo 4: Fallback do objeto original
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
  })().finally(() => {
    inflight.delete(cacheKey);
  });

  inflight.set(cacheKey, promise);
  return promise;
}
