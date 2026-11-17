export interface TrackMetadata {
  title: string;
  artist?: string | null;
  album?: string | null;
  artworkUrl?: string | null;
}

function normalizeArtwork(url?: string | null) {
  const fallback = [
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
  ];

  if (!url || typeof url !== 'string' || !url.trim()) return fallback;

  try {
    const absolute = new URL(url.trim(), window.location.href).href;
    const isPng = absolute.toLowerCase().includes('.png');
    const type = isPng ? 'image/png' : 'image/jpeg';
    return [
      { src: absolute, sizes: '96x96', type },
      { src: absolute, sizes: '128x128', type },
      { src: absolute, sizes: '256x256', type },
      { src: absolute, sizes: '512x512', type },
      ...fallback,
    ];
  } catch {
    return fallback;
  }
}

export class MediaSessionController {
  private static instance: MediaSessionController;

  static getInstance(): MediaSessionController {
    if (!this.instance) {
      this.instance = new MediaSessionController();
    }
    return this.instance;
  }

  updateMetadata(track: TrackMetadata) {
    if (!('mediaSession' in navigator)) return;

    try {
      const artwork = normalizeArtwork(track.artworkUrl);
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title || 'Música',
        artist: track.artist || 'Able Music',
        album: track.album || 'Able Player Library',
        artwork,
      });
      // Garante que o playbackState permaneça 'playing' para evitar descarte da notificação pelo SO
      navigator.mediaSession.playbackState = 'playing';
    } catch (e) {
      console.warn('Erro ao atualizar MediaMetadata:', e);
    }
  }

  setupActionHandlers(handlers: {
    onPlay: () => void;
    onPause: () => void;
    onPrevious?: () => void;
    onNext?: () => void;
    onSeekTo?: (details: MediaSessionActionDetails) => void;
    onSeekForward?: (offset: number) => void;
    onSeekBackward?: (offset: number) => void;
  }) {
    if (!('mediaSession' in navigator)) return;

    const safeSet = (action: MediaSessionAction, fn: MediaSessionActionHandler | null) => {
      try {
        navigator.mediaSession.setActionHandler(action, fn);
      } catch (err) {
        console.warn(`MediaSession action [${action}] não suportada:`, err);
      }
    };

    safeSet('play', handlers.onPlay);
    safeSet('pause', handlers.onPause);

    if (handlers.onPrevious) {
      safeSet('previoustrack', handlers.onPrevious);
    }
    if (handlers.onNext) {
      safeSet('nexttrack', handlers.onNext);
    }
    if (handlers.onSeekTo) {
      safeSet('seekto', (details) => {
        if (details.seekTime !== undefined && handlers.onSeekTo) {
          handlers.onSeekTo(details);
        }
      });
    }
    if (handlers.onSeekForward) {
      safeSet('seekforward', (details) => {
        handlers.onSeekForward!(details.seekOffset || 10);
      });
    }
    if (handlers.onSeekBackward) {
      safeSet('seekbackward', (details) => {
        handlers.onSeekBackward!(details.seekOffset || 10);
      });
    }
  }

  updatePlaybackState(isPlaying: boolean) {
    if (!('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    } catch {}
  }

  private lastPositionUpdate = 0;

  updatePositionState(state: { duration: number; playbackRate?: number; position: number }, force = false) {
    if (!('mediaSession' in navigator) || !navigator.mediaSession.setPositionState) return;
    
    // Throttling defensivo: limita a 1 chamada a cada 2.5s para evitar descarte pelo Android Notification IPC
    const now = Date.now();
    if (!force && now - this.lastPositionUpdate < 2500) {
      return;
    }

    try {
      if (Number.isFinite(state.duration) && state.duration > 0 && state.position >= 0) {
        const safePosition = Math.min(state.position, state.duration);
        navigator.mediaSession.setPositionState({
          duration: state.duration,
          playbackRate: state.playbackRate || 1,
          position: safePosition,
        });
        this.lastPositionUpdate = now;
      }
    } catch {}
  }
}

export const mediaSessionController = MediaSessionController.getInstance();
