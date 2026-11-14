// Motor de Resolução de Streaming em Tag <audio> Pura (Zero IFrame)
// Permite reprodução ininterrupta em segundo plano com a tela apagada/bloqueada no Edge (Android) e Safari (iOS).

export interface StreamResult {
  url: string;
  duration: number;
  mimeType: string;
  title?: string;
  artist?: string;
}

const streamCache = new Map<string, StreamResult>();

function extractBestAudio(data: any, host: string): StreamResult | null {
  const audios = (data.adaptiveFormats || []).filter(
    (f: any) => f.type && (f.type.startsWith('audio/mp4') || f.type.startsWith('audio/webm'))
  );
  if (audios.length === 0) return null;

  // Prioriza mp4 (m4a AAC) para 100% de suporte nativo em iOS Safari e Android Edge
  audios.sort((a: any, b: any) => {
    const aMp4 = a.type.startsWith('audio/mp4') ? 1 : 0;
    const bMp4 = b.type.startsWith('audio/mp4') ? 1 : 0;
    if (aMp4 !== bMp4) return bMp4 - aMp4;
    return (parseInt(b.bitrate) || 0) - (parseInt(a.bitrate) || 0);
  });

  const best = audios[0];
  if (!best.url) return null;

  try {
    const proxiedUrl = best.url.replace(new URL(best.url).origin, host);
    return {
      url: proxiedUrl,
      duration: Number(data.lengthSeconds) || 240,
      mimeType: best.type.split(';')[0] || 'audio/mp4',
      title: data.title,
      artist: data.author
    };
  } catch {
    return null;
  }
}

export async function fetchAudioStream(
  youtubeId?: string,
  songName?: string,
  artistName?: string
): Promise<StreamResult | null> {
  const cleanId = (youtubeId || '').replace(/^yt-/, '').split('&')[0].trim();
  const cacheKey = cleanId || `${songName || ''}-${artistName || ''}`;

  if (streamCache.has(cacheKey)) {
    return streamCache.get(cacheKey)!;
  }

  // 1. Tenta API Serverless interna /api/youtube/stream
  if (cleanId) {
    try {
      const apiRes = await fetch(`/api/youtube/stream?id=${encodeURIComponent(cleanId)}`, {
        signal: AbortSignal.timeout(3000)
      });
      if (apiRes.ok) {
        const data = await apiRes.json();
        if (data?.url && (data.url.startsWith('http://') || data.url.startsWith('https://')) && !data.url.includes('youtube.com/watch')) {
          const res: StreamResult = {
            url: data.url,
            duration: Number(data.duration) || 240,
            mimeType: data.mimeType || 'audio/mp4',
            title: data.title,
            artist: data.artist
          };
          streamCache.set(cacheKey, res);
          return res;
        }
      }
    } catch {}
  }

  // 2. Fallback Direto Multi-Mirror Invidious (Proxy 206 Partial Content)
  const hosts = ['https://echostreamz.com'];

  for (const host of hosts) {
    // 2A. Resolução direta por Video ID
    if (cleanId && /^[a-zA-Z0-9_-]{11}$/.test(cleanId)) {
      try {
        const res = await fetch(`${host}/api/v1/videos/${cleanId}`, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: AbortSignal.timeout(3500)
        });
        if (res.ok) {
          const data = await res.json();
          const result = extractBestAudio(data, host);
          if (result) {
            streamCache.set(cacheKey, result);
            return result;
          }
        }
      } catch {}
    }

    // 2B. Resolução por busca (Áudio oficial / YouTube Music)
    const searchQuery = songName ? `${songName} ${artistName || ''} audio`.trim() : cleanId;
    if (searchQuery) {
      try {
        const sRes = await fetch(`${host}/api/v1/search?q=${encodeURIComponent(searchQuery)}&type=video`, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: AbortSignal.timeout(3500)
        });
        if (sRes.ok) {
          const items = await sRes.json();
          for (const item of (items || []).slice(0, 3)) {
            if (!item?.videoId) continue;
            try {
              const vRes = await fetch(`${host}/api/v1/videos/${item.videoId}`, {
                headers: { 'User-Agent': 'Mozilla/5.0' },
                signal: AbortSignal.timeout(3000)
              });
              if (vRes.ok) {
                const vData = await vRes.json();
                const result = extractBestAudio(vData, host);
                if (result) {
                  streamCache.set(cacheKey, result);
                  return result;
                }
              }
            } catch {}
          }
        }
      } catch {}
    }
  }

  return null;
}
