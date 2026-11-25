// apps/montanha-bento/src/lib/audioStreamEngine.ts

export type StreamResult =
  | { kind: 'audio'; url: string; duration?: number; source: string; isPreview?: boolean }
  | { kind: 'youtube'; videoId: string; duration?: number }
  | { kind: 'unavailable' };

const resolved = new Map<string, StreamResult>();

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

export function invalidateStream(song: { id?: string; youtubeId?: string; name?: string; artist?: string } | string) {
  if (typeof song === 'string') {
    resolved.delete(song);
    return;
  }
  if (song.id) resolved.delete(song.id);
  const key = `${song.artist || ''}|${song.name || ''}`;
  resolved.delete(key);
}

export function getCachedStream(song: { id?: string; youtubeId?: string; name?: string; artist?: string } | string): { url: string; duration?: number } | null {
  const key = typeof song === 'string' ? song : (song.id ?? `${song.artist || ''}|${song.name || ''}`);
  const cached = resolved.get(key);
  if (cached && cached.kind === 'audio') {
    return { url: cached.url, duration: cached.duration };
  }
  return null;
}

/** Assinatura padronizada: NUNCA retorna null, sempre devolve um "kind" */
export async function fetchAudioStream(
  youtubeId?: string,
  songName?: string,
  artistName?: string,
  fallbackAudioUrl?: string,
  songId?: string
): Promise<StreamResult> {
  const key = songId ?? `${artistName || ''}|${songName || ''}`;
  const cached = resolved.get(key);
  if (cached && cached.kind !== 'unavailable') return cached;

  try {
    const qs = new URLSearchParams({ title: songName ?? '', artist: artistName ?? '' });
    if (youtubeId) qs.set('youtubeId', youtubeId);

    const r = await fetch(`/api/stream?${qs.toString()}`, {
      signal: AbortSignal.timeout(9000)
    });
    if (r.ok) {
      const data = (await r.json()) as StreamResult;
      if (data.kind !== 'unavailable') {
        resolved.set(key, data);
        if (songId) resolved.set(songId, data);
        return data;
      }
    }
  } catch {
    /* rede/API fora: cai no fallback abaixo */
  }

  // Prévia de 30s só como último recurso se não for preview proibido
  if (fallbackAudioUrl && !isDisallowedPreview(fallbackAudioUrl)) {
    return { kind: 'audio', url: fallbackAudioUrl, source: 'fallback', isPreview: false };
  }
  return { kind: 'unavailable' };
}

// ---------------------------------------------------------------------------
// Player oficial do YouTube (IFrame Player API)
// ---------------------------------------------------------------------------

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let ytApi: Promise<void> | null = null;
function loadYouTubeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve();
  if (!ytApi) {
    ytApi = new Promise<void>((resolve) => {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        resolve();
      };
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const s = document.createElement('script');
        s.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(s);
      }
    });
  }
  return ytApi;
}

export interface YouTubeCallbacks {
  onEnded: () => void;
  onError: (code: number) => void;
  onPlaying?: () => void;
  onPaused?: () => void;
}

export class YouTubeAdapter {
  private player: any = null;
  private currentVid: string | null = null;

  constructor(private host: HTMLElement, private cb: YouTubeCallbacks) {}

  async play(videoId: string): Promise<void> {
    await loadYouTubeApi();

    if (this.player && typeof this.player.loadVideoById === 'function') {
      try {
        this.currentVid = videoId;
        this.player.loadVideoById(videoId);
        this.player.unMute?.();
        this.player.playVideo?.();
        return;
      } catch (err) {
        console.warn('Erro ao chamar loadVideoById:', err);
      }
    }

    return new Promise<void>((resolve) => {
      this.currentVid = videoId;
      this.player = new window.YT.Player(this.host, {
        width: '100%',
        height: '100%',
        videoId,
        playerVars: {
          autoplay: 1,
          playsinline: 1,
          controls: 1,
          rel: 0,
          modestbranding: 1
        },
        events: {
          onReady: (e: any) => {
            try {
              e.target.unMute?.();
              e.target.playVideo?.();
            } catch {}
            resolve();
          },
          onStateChange: (e: { data: number }) => {
            if (e.data === 0) this.cb.onEnded(); // ENDED
            if (e.data === 1) this.cb.onPlaying?.(); // PLAYING
            if (e.data === 2) this.cb.onPaused?.(); // PAUSED
          },
          onError: (e: { data: number }) => this.cb.onError(e.data),
        },
      });
    });
  }

  pause() {
    try { this.player?.pauseVideo(); } catch {}
  }
  resume() {
    try { this.player?.playVideo(); } catch {}
  }
  seek(seconds: number) {
    try { this.player?.seekTo(seconds, true); } catch {}
  }
  getPlayerState(): number {
    try { return this.player?.getPlayerState?.() ?? -1; } catch { return -1; }
  }
  isPaused(): boolean {
    try { return this.player?.getPlayerState?.() === 2; } catch { return false; }
  }
  currentTime(): number {
    try { return this.player?.getCurrentTime?.() ?? 0; } catch { return 0; }
  }
  duration(): number {
    try { return this.player?.getDuration?.() ?? 0; } catch { return 0; }
  }
  setVolume(volPercent: number) {
    try { this.player?.setVolume?.(volPercent); } catch {}
  }
  mute() {
    try { this.player?.mute?.(); } catch {}
  }
  unMute() {
    try { this.player?.unMute?.(); } catch {}
  }
  stop() {
    try { this.player?.stopVideo(); } catch {}
  }
  destroy() {
    try { this.player?.destroy(); } catch {}
    this.player = null;
    this.currentVid = null;
  }
}
