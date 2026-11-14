/**
 * AudioAnchorEngine: Garante a compatibilidade com a AudioSession API do Safari/iOS
 * e coordena a integridade do canal de áudio sem criar elementos secundários de silêncio
 * que poderiam roubar o foco de áudio (Audio Focus) no Android.
 */
class AudioAnchorEngine {
  private static instance: AudioAnchorEngine;

  static getInstance(): AudioAnchorEngine {
    if (!this.instance) {
      this.instance = new AudioAnchorEngine();
    }
    return this.instance;
  }

  init() {
    if (typeof window === 'undefined') return;

    // Configura AudioSession API nativa do Safari (iOS 16.4+) para canal de mídia contínuo
    if ('audioSession' in navigator) {
      try {
        (navigator as any).audioSession.type = 'playback';
      } catch {}
    }

    // Remove qualquer elemento residual que possa ter roubado o foco de áudio
    const existing = document.getElementById('montanha-audio-anchor');
    if (existing) {
      existing.remove();
    }
  }

  play() {
    this.init();
  }

  pause() {
    // No-op para zero conflito
  }

  isPaused(): boolean {
    return false;
  }
}

export const audioAnchor = AudioAnchorEngine.getInstance();
