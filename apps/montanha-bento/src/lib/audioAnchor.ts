/**
 * AudioAnchorEngine: Mantém o canal de áudio do sistema operacional ativo em segundo plano
 * (Android / iOS) via Web Audio API em nível imperceptível (-100dB, 0.00001 gain).
 * - ZERO estalos ou 'toc toc toc' (onda senoidal contínua matematicamente pura).
 * - ZERO roubo de Audio Focus (não utiliza tag <audio> que silencie o YouTube).
 * - Garante que o Android não congele o processo ou desative a saída de som ao apagar a tela.
 */
class AudioAnchorEngine {
  private static instance: AudioAnchorEngine;
  private audioCtx: AudioContext | null = null;
  private osc: OscillatorNode | null = null;
  private gain: GainNode | null = null;
  private isRunning = false;

  static getInstance(): AudioAnchorEngine {
    if (!this.instance) {
      this.instance = new AudioAnchorEngine();
    }
    return this.instance;
  }

  init() {
    if (typeof window === 'undefined') return;

    // Configura AudioSession API nativa do Safari (iOS 16.4+)
    if ('audioSession' in navigator) {
      try {
        (navigator as any).audioSession.type = 'playback';
      } catch {}
    }

    // Remove qualquer tag <audio> residual que possa ter ficado no DOM
    const old = document.getElementById('montanha-audio-anchor');
    if (old) old.remove();
  }

  play() {
    this.init();
    if (typeof window === 'undefined') return;

    try {
      if (!this.audioCtx) {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtxClass) {
          this.audioCtx = new AudioCtxClass();
        }
      }

      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }

      if (this.audioCtx && !this.isRunning) {
        this.osc = this.audioCtx.createOscillator();
        this.gain = this.audioCtx.createGain();
        // Nível imperceptível a ouvidos humanos (-100dB), mantendo o hardware ativo
        this.gain.gain.value = 0.00001;
        this.osc.frequency.value = 440;
        this.osc.connect(this.gain);
        this.gain.connect(this.audioCtx.destination);
        this.osc.start();
        this.isRunning = true;
      }
    } catch {}
  }

  pause() {
    if (this.audioCtx && this.isRunning) {
      try {
        if (this.osc) {
          this.osc.stop();
          this.osc.disconnect();
          this.osc = null;
        }
        this.isRunning = false;
      } catch {}
    }
  }

  isPaused(): boolean {
    return !this.isRunning;
  }
}

export const audioAnchor = AudioAnchorEngine.getInstance();
