// Motor Resiliente de Streaming de Áudio Multi-Tier para PWA
// Suporta reprodução em segundo plano com tela desligada / bloqueada (Android e iOS)

export interface StreamResult {
  url: string;
  duration: number;
  mimeType: string;
  title?: string;
  artist?: string;
  source: 'saavn-320' | 'youtube-full' | 'invidious-full' | 'blob';
}

const streamCache = new Map<string, StreamResult>();
const inflight = new Map<string, Promise<StreamResult | null>>();

export function isDisallowedPreview(url?: string, duration?: number): boolean {
  if (!url || typeof url !== 'string') return true;
  if (
    url.includes('dzcdn.net') ||
    url.includes('preview') ||
    url.includes('apple.com') ||
    url.includes('mzstatic') ||
    url.includes('p.scdn.co') ||
    url.includes('sndcdn.com/preview')
  ) {
    return true;
  }
  if (duration && Number(duration) <= 30) {
    return true;
  }
  return false;
}

export function getCachedStream(song: { id?: string; youtubeId?: string; name?: string; artist?: string } | string): StreamResult | null {
  if (typeof song === 'string') {
    const res = streamCache.get(song) || null;
    if (res && isDisallowedPreview(res.url, res.duration)) {
      streamCache.delete(song);
      return null;
    }
    return res;
  }
  const cleanId = (song.youtubeId || '').replace(/^yt-/, '').split('&')[0].trim();
  const cacheKey = cleanId || `${song.name || ''}-${song.artist || ''}`;
  let res: StreamResult | null = null;
  if (streamCache.has(cacheKey)) {
    res = streamCache.get(cacheKey)!;
  } else if (song.id && streamCache.has(song.id)) {
    res = streamCache.get(song.id)!;
  }
  if (res && isDisallowedPreview(res.url, res.duration)) {
    invalidateStream(song);
    return null;
  }
  return res;
}

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
    .replace(/[^\p{L}\p{N}\s'-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getArtistCandidates(artistStr: string): string[] {
  if (!artistStr) return [];
  const rawList = artistStr
    .split(/[,&/]|feat\.|ft\.|x\s+/i)
    .map(a => sanitizeTitle(a))
    .filter(a => a.length > 1);

  const candidates = new Set<string>();
  const full = sanitizeTitle(artistStr);
  if (full) candidates.add(full);
  for (const a of rawList) {
    if (a) candidates.add(a);
  }
  const firstWord = rawList[0]?.split(' ')[0];
  if (firstWord && firstWord.length > 2) candidates.add(firstWord);

  return Array.from(candidates);
}

// 1. TIER 1: Nosso Endpoint Serverless Próprio /api/stream (Zero Erros de CORS no Navegador)
async function fetchFromInternalApi(title: string, artist: string, youtubeId?: string): Promise<StreamResult | null> {
  try {
    const quality = typeof window !== 'undefined' ? localStorage.getItem('montanha_sound_quality') || 'high' : 'high';
    const params = new URLSearchParams();
    if (title) params.set('title', title);
    if (artist) params.set('artist', artist);
    if (youtubeId) params.set('id', youtubeId);
    params.set('quality', quality);

    const res = await fetch(`/api/stream?${params.toString()}`, {
      signal: AbortSignal.timeout(7500)
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.url && (data.url.startsWith('http') || data.url.startsWith('/'))) {
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

export function fetchAudioStream(
  youtubeId?: string,
  songName?: string,
  artistName?: string,
  fallbackAudioUrl?: string,
  songId?: string
): Promise<StreamResult | null> {
  const cleanId = (youtubeId || '').replace(/^yt-/, '').split('&')[0].trim();
  const cacheKey = cleanId || `${songName || ''}-${artistName || ''}`;

  if (songId && streamCache.has(songId)) {
    const cached = streamCache.get(songId)!;
    if (!isDisallowedPreview(cached.url, cached.duration)) {
      return Promise.resolve(cached);
    }
    streamCache.delete(songId);
  }

  if (streamCache.has(cacheKey)) {
    const cached = streamCache.get(cacheKey)!;
    if (!isDisallowedPreview(cached.url, cached.duration)) {
      return Promise.resolve(cached);
    }
    streamCache.delete(cacheKey);
  }

  if (inflight.has(cacheKey)) {
    return inflight.get(cacheKey)!;
  }

  const promise = (async () => {
    // Passo 1: Busca via Serverless API interna (Saavn 320kbps + YTDL YouTube Completo — Zero 30s)
    if (songName || cleanId) {
      const internalResult = await fetchFromInternalApi(songName || '', artistName || '', cleanId);
      if (internalResult && !isDisallowedPreview(internalResult.url, internalResult.duration)) {
        streamCache.set(cacheKey, internalResult);
        if (songId) streamCache.set(songId, internalResult);
        return internalResult;
      }
    }

    // Passo 2: Fallback do áudio salvo originalmente (SE E SOMENTE SE for áudio completo — zero previews de 30s)
    if (fallbackAudioUrl && !isDisallowedPreview(fallbackAudioUrl)) {
      const fallbackResult: StreamResult = {
        url: fallbackAudioUrl,
        duration: 210,
        mimeType: 'audio/mp4',
        title: songName,
        artist: artistName,
        source: 'saavn-320'
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
