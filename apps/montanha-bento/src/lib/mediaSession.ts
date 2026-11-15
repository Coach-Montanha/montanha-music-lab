export interface TrackMetadata {
  title: string;
  artist?: string | null;
  album?: string | null;
  artworkUrl?: string | null;
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
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist || 'Able Music',
        album: track.album || 'Able Player Library',
        artwork: track.artworkUrl
          ? [
              { src: track.artworkUrl, sizes: '96x96' },
              { src: track.artworkUrl, sizes: '128x128' },
              { src: track.artworkUrl, sizes: '256x256' },
              { src: track.artworkUrl, sizes: '512x512' },
            ]
          : [],
      });
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
  }

  updatePlaybackState(isPlaying: boolean) {
    if (!('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    } catch {}
  }

  updatePositionState(state: { duration: number; playbackRate?: number; position: number }) {
    if (!('mediaSession' in navigator) || !navigator.mediaSession.setPositionState) return;
    try {
      if (
        Number.isFinite(state.duration) &&
        state.duration > 0 &&
        state.position >= 0 &&
        state.position <= state.duration
      ) {
        navigator.mediaSession.setPositionState({
          duration: state.duration,
          playbackRate: state.playbackRate || 1,
          position: state.position,
        });
      }
    } catch {}
  }
}

export const mediaSessionController = MediaSessionController.getInstance();
