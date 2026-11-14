/**
 * AudioAnchorEngine: Mantém a sessão de áudio do sistema operacional ativa em segundo plano
 * no celular (Android / iOS) ao travar ou apagar a tela.
 * - Utiliza um buffer WAV contínuo de 10 segundos com zeros matemáticos absolutos (PCM 16-bit).
 * - Volume em nível imperceptível (0.001 = 0.1%), suficiente para o Android registrar playback
 *   de mídia contínuo (evitando suspensão do processo ou corte de CPU) SEM causar ducking do YouTube.
 * - ZERO estalos ou 'toc toc toc' (sem re-seek de currentTime, apenas loop nativo contínuo do navegador).
 */
class AudioAnchorEngine {
  private static instance: AudioAnchorEngine;
  private audioEl: HTMLAudioElement | null = null;
  private blobUrl: string | null = null;

  static getInstance(): AudioAnchorEngine {
    if (!this.instance) {
      this.instance = new AudioAnchorEngine();
    }
    return this.instance;
  }

  private createSilentBlobUrl(): string {
    if (this.blobUrl) return this.blobUrl;

    const sampleRate = 22050;
    const durationSec = 10;
    const numChannels = 1;
    const bytesPerSample = 2; // 16-bit signed PCM
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const numSamples = durationSec * sampleRate;
    const dataSize = numSamples * blockAlign;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    // RIFF Header
    view.setUint32(0, 0x52494646, false); // 'RIFF'
    view.setUint32(4, 36 + dataSize, true);
    view.setUint32(8, 0x57415645, false); // 'WAVE'

    // fmt subchunk
    view.setUint32(12, 0x666d7420, false); // 'fmt '
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM Format = 1
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true); // 16-bit

    // data subchunk (todos os bytes são 0x0000 = zero absoluto / silêncio matemático perfeito)
    view.setUint32(36, 0x64617461, false); // 'data'
    view.setUint32(40, dataSize, true);

    const blob = new Blob([buffer], { type: 'audio/wav' });
    this.blobUrl = URL.createObjectURL(blob);
    return this.blobUrl;
  }

  init() {
    if (typeof window === 'undefined') return;

    // Configura AudioSession API nativa do Safari (iOS 16.4+)
    if ('audioSession' in navigator) {
      try {
        (navigator as any).audioSession.type = 'playback';
      } catch {}
    }

    if (!this.audioEl) {
      const existing = document.getElementById('montanha-audio-anchor') as HTMLAudioElement | null;
      if (existing) {
        this.audioEl = existing;
      } else {
        this.audioEl = document.createElement('audio');
        this.audioEl.id = 'montanha-audio-anchor';
        this.audioEl.src = this.createSilentBlobUrl();
        this.audioEl.loop = true;
        this.audioEl.preload = 'auto';
        this.audioEl.setAttribute('playsinline', 'true');
        this.audioEl.setAttribute('webkit-playsinline', 'true');
        // Volume 0.001 (0.1%): Inaudível para o ouvido humano, mas ativo para o Android OS
        this.audioEl.volume = 0.001;
        this.audioEl.style.position = 'fixed';
        this.audioEl.style.bottom = '0';
        this.audioEl.style.opacity = '0';
        this.audioEl.style.pointerEvents = 'none';
        this.audioEl.style.zIndex = '-999';
        document.body.appendChild(this.audioEl);
      }
    }
  }

  play() {
    this.init();
    if (this.audioEl && this.audioEl.paused) {
      this.audioEl.volume = 0.001;
      this.audioEl.play().catch(() => {});
    }
  }

  pause() {
    if (this.audioEl && !this.audioEl.paused) {
      this.audioEl.pause();
    }
  }

  isPaused(): boolean {
    return this.audioEl ? this.audioEl.paused : true;
  }
}

export const audioAnchor = AudioAnchorEngine.getInstance();
