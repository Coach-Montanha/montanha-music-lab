// Motor de Efeitos e Processamento de Áudio em Tempo Real (Web Audio API)
// Suporta Equalizador Paramétrico de 5 Bandas, Normalização de Volume (Compressor Dinâmico)
// e Fade-In / Fade-Out para Crossfade transparente entre faixas.

export type EqualizerPresetId = 'workout' | 'flat' | 'vocal' | 'rock' | 'bass' | 'acoustic';

export interface EqualizerPresetConfig {
  id: EqualizerPresetId;
  name: string;
  desc: string;
  // Ganhos em dB para 60Hz (Sub-bass), 250Hz (Punch/Bass), 1kHz (Médios), 4kHz (Presença), 12kHz (Brilho)
  gains: [number, number, number, number, number];
}

export const EQUALIZER_PRESETS: Record<EqualizerPresetId, EqualizerPresetConfig> = {
  workout: {
    id: 'workout',
    name: 'Treino Pesado',
    desc: 'Punch & Sub-bass',
    gains: [7, 4.5, -1, 2, 3], // Boost agressivo de sub-graves e punch de bumbo
  },
  flat: {
    id: 'flat',
    name: 'Equilibrado',
    desc: 'Flat Studio',
    gains: [0, 0, 0, 0, 0], // Neutro analítico
  },
  vocal: {
    id: 'vocal',
    name: 'Vocal Cristalino',
    desc: 'Foco na Voz',
    gains: [-3, 0, 3.5, 5, 2.5], // Foco na banda de 1kHz a 4kHz, corte de graves embolados
  },
  rock: {
    id: 'rock',
    name: 'Rock & Metal',
    desc: 'Guitarras Vivas',
    gains: [4, 2.5, -2, 4, 4.5], // Timbre em V clássico com ataque de palhetada e pratos vivos
  },
  bass: {
    id: 'bass',
    name: 'Mega Bass Boost',
    desc: 'Graves Máximos',
    gains: [9, 6, -2, 0, 1], // Graves ultra potentes para fones potentes e caixas de som
  },
  acoustic: {
    id: 'acoustic',
    name: 'Acústico & Leve',
    desc: 'Clareza Natural',
    gains: [2, 1, 2, 3, 4], // Equilíbrio natural para voz e violão
  },
};

class AudioEffectsEngine {
  private static instance: AudioEffectsEngine;

  private audioCtx: AudioContext | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private filters: BiquadFilterNode[] = [];
  private compressor: DynamicsCompressorNode | null = null;
  private masterGain: GainNode | null = null;
  private attachedElement: HTMLAudioElement | null = null;
  private isInitialized = false;

  private currentPreset: EqualizerPresetId = 'workout';
  private isNormEnabled = true;

  static getInstance(): AudioEffectsEngine {
    if (!this.instance) {
      this.instance = new AudioEffectsEngine();
    }
    return this.instance;
  }

  constructor() {
    // Carrega preferências salvas
    if (typeof window !== 'undefined') {
      try {
        const savedPreset = localStorage.getItem('montanha_equalizer') as EqualizerPresetId;
        if (savedPreset && EQUALIZER_PRESETS[savedPreset]) {
          this.currentPreset = savedPreset;
        }
        const savedNorm = localStorage.getItem('montanha_volume_norm');
        this.isNormEnabled = savedNorm !== 'false';
      } catch {}
    }
  }

  /**
   * Conecta a cadeia de processamento Web Audio API ao elemento HTMLAudioElement principal
   */
  attach(audioEl: HTMLAudioElement) {
    if (typeof window === 'undefined') return;
    if (this.attachedElement === audioEl && this.isInitialized) {
      return;
    }

    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) {
        console.warn('[AudioEffectsEngine] Web Audio API não suportada neste navegador.');
        return;
      }

      if (!this.audioCtx) {
        this.audioCtx = new AudioCtxClass({ latencyHint: 'playback' });
      }

      if (this.audioCtx.state === 'suspended') {
        const resumeOnInteract = () => {
          if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume().catch(() => {});
          }
          window.removeEventListener('click', resumeOnInteract);
          window.removeEventListener('touchstart', resumeOnInteract);
        };
        window.addEventListener('click', resumeOnInteract, { passive: true });
        window.addEventListener('touchstart', resumeOnInteract, { passive: true });
      }

      // Conexão do elemento de áudio (só pode ser feito uma única vez por elemento)
      if (!this.sourceNode) {
        this.sourceNode = this.audioCtx.createMediaElementSource(audioEl);
      }

      // 1. Criação das 5 bandas de equalização paramétrica
      const frequencies = [60, 250, 1000, 4000, 12000];
      const types: BiquadFilterType[] = ['lowshelf', 'peaking', 'peaking', 'peaking', 'highshelf'];

      this.filters = frequencies.map((freq, idx) => {
        const filter = this.audioCtx!.createBiquadFilter();
        filter.type = types[idx];
        filter.frequency.value = freq;
        if (filter.type === 'peaking') {
          filter.Q.value = 1.0;
        }
        return filter;
      });

      // 2. Criação do compressor dinâmico (Normalização de Volume)
      this.compressor = this.audioCtx.createDynamicsCompressor();
      this.applyCompressionSettings(this.isNormEnabled);

      // 3. Nó de Ganho Mestre (Master Gain + Fade de Crossfade)
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.value = 1.0;

      // 4. Encadeamento Serial dos Nós:
      // Source -> EQ[0] -> EQ[1] -> EQ[2] -> EQ[3] -> EQ[4] -> Compressor -> MasterGain -> Destination
      let lastNode: AudioNode = this.sourceNode;
      for (const filter of this.filters) {
        lastNode.connect(filter);
        lastNode = filter;
      }

      lastNode.connect(this.compressor);
      this.compressor.connect(this.masterGain);
      this.masterGain.connect(this.audioCtx.destination);

      this.attachedElement = audioEl;
      this.isInitialized = true;

      // Aplica preset salvo inicial
      this.setEqualizerPreset(this.currentPreset, true);

      console.log(`[AudioEffectsEngine] Web Audio Engine ativo! EQ: ${this.currentPreset}, Normalização: ${this.isNormEnabled}`);
    } catch (err) {
      console.warn('[AudioEffectsEngine] Erro ao conectar Web Audio:', err);
    }
  }

  /**
   * Garante que o contexto de áudio esteja ativo após interação do usuário
   */
  async ensureAudioContextRunning() {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      try {
        await this.audioCtx.resume();
      } catch {}
    }
  }

  /**
   * Aplica ganhos do preset de equalização em tempo real de forma suave (sem estalos)
   */
  setEqualizerPreset(presetId: EqualizerPresetId, immediate = false) {
    this.currentPreset = presetId;
    const preset = EQUALIZER_PRESETS[presetId] || EQUALIZER_PRESETS.workout;

    if (!this.audioCtx || this.filters.length !== 5) return;

    const currentTime = this.audioCtx.currentTime;
    preset.gains.forEach((targetGain, i) => {
      const filter = this.filters[i];
      if (immediate) {
        filter.gain.setValueAtTime(targetGain, currentTime);
      } else {
        filter.gain.setTargetAtTime(targetGain, currentTime, 0.05);
      }
    });
  }

  /**
   * Ativa ou desativa a normalização de volume (compressor dinâmico suave)
   */
  setVolumeNormalization(enabled: boolean) {
    this.isNormEnabled = enabled;
    this.applyCompressionSettings(enabled);
  }

  private applyCompressionSettings(enabled: boolean) {
    if (!this.compressor || !this.audioCtx) return;
    const now = this.audioCtx.currentTime;

    if (enabled) {
      // Configuração suave estilo broadcast: comprime picos muito altos e eleva partes sussurradas
      this.compressor.threshold.setTargetAtTime(-22, now, 0.05); // dB
      this.compressor.knee.setTargetAtTime(25, now, 0.05);
      this.compressor.ratio.setTargetAtTime(8, now, 0.05);
      this.compressor.attack.setTargetAtTime(0.005, now, 0.05); // 5ms
      this.compressor.release.setTargetAtTime(0.25, now, 0.05); // 250ms
    } else {
      // Bypass transparente: ratio 1:1 e threshold 0
      this.compressor.threshold.setTargetAtTime(0, now, 0.05);
      this.compressor.ratio.setTargetAtTime(1, now, 0.05);
    }
  }

  /**
   * Suavização gradual de volume nos últimos segundos da música para crossfade
   */
  fadeOut(durationSec: number) {
    if (!this.masterGain || !this.audioCtx || durationSec <= 0) return;
    const now = this.audioCtx.currentTime;
    try {
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(0.001, now + durationSec);
    } catch {}
  }

  /**
   * Retorno suave do volume no início da nova música
   */
  fadeIn(durationSec: number, targetVolume = 1.0) {
    if (!this.masterGain || !this.audioCtx || durationSec <= 0) {
      if (this.masterGain) this.masterGain.gain.value = targetVolume;
      return;
    }
    const now = this.audioCtx.currentTime;
    try {
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(0.001, now);
      this.masterGain.gain.linearRampToValueAtTime(targetVolume, now + durationSec);
    } catch {
      if (this.masterGain) this.masterGain.gain.value = targetVolume;
    }
  }

  /**
   * Restaura o ganho mestre imediatamente ao normal
   */
  resetMasterGain(targetVolume = 1.0) {
    if (!this.masterGain || !this.audioCtx) return;
    const now = this.audioCtx.currentTime;
    try {
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(targetVolume, now);
    } catch {
      this.masterGain.gain.value = targetVolume;
    }
  }

  getCurrentPreset(): EqualizerPresetId {
    return this.currentPreset;
  }

  isNormalizationActive(): boolean {
    return this.isNormEnabled;
  }
}

export const audioEffectsEngine = AudioEffectsEngine.getInstance();
