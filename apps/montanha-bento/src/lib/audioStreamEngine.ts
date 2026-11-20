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

export function getCachedStream(song: { id?: string; youtubeId?: string; name?: string; artist?: string } | string): StreamResult | null {
  if (typeof song === 'string') {
    return streamCache.get(song) || null;
  }
  const cleanId = (song.youtubeId || '').replace(/^yt-/, '').split('&')[0].trim();
  const cacheKey = cleanId || `${song.name || ''}-${song.artist || ''}`;
  if (streamCache.has(cacheKey)) return streamCache.get(cacheKey)!;
  if (song.id && streamCache.has(song.id)) return streamCache.get(song.id)!;
  return null;
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

// 2. TIER 2: Fast-Saavn Direto (Busca Concorrente Ultrarrápida em Paralelo)
async function fetchFromSaavnDirect(title: string, artist: string): Promise<StreamResult | null> {
  const cleanT = sanitizeTitle(title);
  if (!cleanT) return null;
  const candidates = getArtistCandidates(artist);
  if (cleanT.length > 4) candidates.push(cleanT);
  const quality = typeof window !== 'undefined' ? localStorage.getItem('montanha_sound_quality') || 'high' : 'high';
  const bitrateSuffix = quality === 'economy' ? '_96' : quality === 'standard' ? '_160' : '_320';

  const promises = candidates.slice(0, 3).map(async (cand) => {
    const res = await fetch(
      `https://fast-saavn.vercel.app/api?title=${encodeURIComponent(cleanT)}&artist=${encodeURIComponent(cand)}`,
      { signal: AbortSignal.timeout(2000) }
    );
    if (res.ok) {
      const id = (await res.text()).trim();
      if (id && id.length > 5 && !id.includes('error') && !id.includes('not found')) {
        return {
          url: `https://aac.saavncdn.com/${id}${bitrateSuffix}.mp4`,
          duration: 210,
          mimeType: 'audio/mp4',
          title,
          artist: cand,
          source: (quality === 'economy' ? 'saavn-96' : quality === 'standard' ? 'saavn-160' : 'saavn-320') as any
        };
      }
    }
    throw new Error('not found');
  });

  try {
    return await Promise.any(promises);
  } catch {
    return null;
  }
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
    return Promise.resolve(streamCache.get(songId)!);
  }

  if (streamCache.has(cacheKey)) {
    return Promise.resolve(streamCache.get(cacheKey)!);
  }

  if (inflight.has(cacheKey)) {
    return inflight.get(cacheKey)!;
  }

  const promise = (async () => {
    // Passo 1: Busca via Serverless API interna (Saavn 320kbps + Invidious YouTube Completo)
    if (songName || cleanId) {
      const internalResult = await fetchFromInternalApi(songName || '', artistName || '', cleanId);
      if (internalResult) {
        streamCache.set(cacheKey, internalResult);
        if (songId) streamCache.set(songId, internalResult);
        return internalResult;
      }
    }

    // Passo 2: Busca direta no Saavn (Akamai 320kbps MP4 Completo em paralelo)
    if (songName) {
      const saavnResult = await fetchFromSaavnDirect(songName, artistName || '');
      if (saavnResult) {
        streamCache.set(cacheKey, saavnResult);
        if (songId) streamCache.set(songId, saavnResult);
        return saavnResult;
      }
    }

    // Passo 3: Fallback do objeto original (apenas se for áudio completo, rejeita previews de 30s)
    if (
      fallbackAudioUrl &&
      fallbackAudioUrl.startsWith('http') &&
      !fallbackAudioUrl.includes('preview') &&
      !fallbackAudioUrl.includes('dzcdn.net') &&
      !fallbackAudioUrl.includes('apple.com') &&
      !fallbackAudioUrl.includes('mzstatic')
    ) {
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
