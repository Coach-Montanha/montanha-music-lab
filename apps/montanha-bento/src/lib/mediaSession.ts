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

    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist || 'Able Music',
      album: track.album || 'Able Player Library',
      artwork: track.artworkUrl
        ? [
            { src: track.artworkUrl, sizes: '96x96', type: 'image/jpeg' },
            { src: track.artworkUrl, sizes: '128x128', type: 'image/jpeg' },
            { src: track.artworkUrl, sizes: '256x256', type: 'image/jpeg' },
            { src: track.artworkUrl, sizes: '512x512', type: 'image/jpeg' },
          ]
        : [],
    });
  }

  setupActionHandlers(handlers: {
    onPlay: () => void;
    onPause: () => void;
    onPrevious?: () => void;
    onNext?: () => void;
    onSeekTo?: (details: MediaSessionActionDetails) => void;
  }) {
    if (!('mediaSession' in navigator)) return;

    try {
      navigator.mediaSession.setActionHandler('play', handlers.onPlay);
      navigator.mediaSession.setActionHandler('pause', handlers.onPause);

      if (handlers.onPrevious) {
        navigator.mediaSession.setActionHandler('previoustrack', handlers.onPrevious);
      }
      if (handlers.onNext) {
        navigator.mediaSession.setActionHandler('nexttrack', handlers.onNext);
      }
      if (handlers.onSeekTo) {
        navigator.mediaSession.setActionHandler('seekto', (details) => {
          if (details.seekTime !== undefined && handlers.onSeekTo) {
            handlers.onSeekTo(details);
          }
        });
      }
    } catch (e) {
      console.warn('Erro ao registrar MediaSession actions:', e);
    }
  }

  updatePlaybackState(isPlaying: boolean) {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
  }

  updatePositionState(state: { duration: number; playbackRate?: number; position: number }) {
    if (!('mediaSession' in navigator) || !navigator.mediaSession.setPositionState) return;
    try {
      if (state.duration > 0 && state.position <= state.duration) {
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
