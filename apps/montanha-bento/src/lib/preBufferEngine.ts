// apps/montanha-bento/src/lib/preBufferEngine.ts
// Engine de Pré-Buffer Inteligente com Janela Deslizante de 15s e Esvaziamento Imediato

import { fetchAudioStream, StreamResult, isDisallowedPreview } from './audioStreamEngine';
import { Song } from '../types';

interface PrebufferedEntry {
  songId: string;
  stream: StreamResult;
  chunkLoaded: boolean;
  timestamp: number;
}

class PreBufferEngine {
  private activeAbortController: AbortController | null = null;
  private currentContextId: string | null = null;
  private prebufferedMap = new Map<string, PrebufferedEntry>();
  private activeQueue: Song[] = [];
  private currentSongId: string | null = null;
  private isProcessing = false;
  private maxWindowSize = 3; // Mantém no máximo as próximas 3 músicas pré-carregadas
  private scheduledTimeout: any = null;

  /**
   * Define o contexto da playlist / álbum ativo.
   * Ao mudar de contexto (playlist diferente), cancela qualquer download ativo
   * e esvazia 100% da memória do buffer anterior.
   */
  setContext(contextId: string, initialQueue?: Song[]) {
    if (this.currentContextId !== contextId) {
      console.log(`[PreBuffer] 🔄 Mudança de contexto (${this.currentContextId} -> ${contextId}). Esvaziando cache...`);
      this.abortAndFlush();
      this.currentContextId = contextId;
    }

    if (initialQueue && initialQueue.length > 0) {
      this.activeQueue = [...initialQueue];
      // Agenda pré-buffer das primeiras faixas com pequeno delay para priorizar a UI
      this.scheduleProcessing(200);
    }
  }

  /**
   * Notifica a engine de que a faixa ativa mudou, avançando a janela deslizante.
   */
  onTrackChanged(songId: string, currentQueue: Song[]) {
    this.currentSongId = songId;
    this.activeQueue = [...currentQueue];

    // Limpa músicas que ficaram para trás da janela deslizante para poupar memória no mobile
    this.pruneOldEntries();

    // Agenda o pré-carregamento das próximas faixas na nova janela
    this.scheduleProcessing(300);
  }

  /**
   * Esvazia completamente o cache e aborta downloads pendentes.
   */
  abortAndFlush() {
    if (this.scheduledTimeout) {
      clearTimeout(this.scheduledTimeout);
      this.scheduledTimeout = null;
    }

    if (this.activeAbortController) {
      try {
        this.activeAbortController.abort('Context changed / Flush');
      } catch {}
      this.activeAbortController = null;
    }

    this.prebufferedMap.clear();
    this.isProcessing = false;
    console.log('[PreBuffer] 🧹 Cache de pré-buffer 100% esvaziado.');
  }

  /**
   * Retorna os dados pré-carregados se existirem para início instantâneo.
   */
  getPrebuffered(songId: string): PrebufferedEntry | null {
    const entry = this.prebufferedMap.get(songId);
    if (entry && entry.stream.kind === 'audio' && !isDisallowedPreview(entry.stream.url, entry.stream.duration)) {
      return entry;
    }
    return null;
  }

  /**
   * Agenda o processamento da janela com debounce.
   */
  private scheduleProcessing(delayMs = 250) {
    if (this.scheduledTimeout) clearTimeout(this.scheduledTimeout);
    this.scheduledTimeout = setTimeout(() => {
      this.processSlidingWindow().catch((err) => {
        if (err?.name !== 'AbortError') {
          console.warn('[PreBuffer] Aviso durante processamento:', err);
        }
      });
    }, delayMs);
  }

  /**
   * Processa as faixas da janela deslizante (as próximas N faixas da fila).
   */
  private async processSlidingWindow() {
    if (this.isProcessing || !this.activeQueue || this.activeQueue.length <= 1) return;
    this.isProcessing = true;

    // Garante um AbortController ativo
    if (!this.activeAbortController || this.activeAbortController.signal.aborted) {
      this.activeAbortController = new AbortController();
    }
    const signal = this.activeAbortController.signal;

    try {
      const windowSongs = this.calculateWindowSongs();
      for (const song of windowSongs) {
        if (signal.aborted) break;

        // Se já está pré-carregada, pula
        if (this.prebufferedMap.has(song.id)) continue;

        await this.prebufferTrack(song, signal);

        // Intervalo de cortesia de 150ms entre faixas para não monopolizar a rede 4G/Wi-Fi
        await new Promise((resolve) => setTimeout(resolve, 150));
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Calcula as próximas faixas da fila dentro do limite da janela deslizante.
   */
  private calculateWindowSongs(): Song[] {
    if (!this.activeQueue.length) return [];

    let startIdx = 0;
    if (this.currentSongId) {
      const idx = this.activeQueue.findIndex((s) => s.id === this.currentSongId);
      if (idx !== -1) {
        startIdx = idx + 1;
      }
    }

    const windowSongs: Song[] = [];
    for (let i = 0; i < this.maxWindowSize; i++) {
      let targetIdx = startIdx + i;
      if (targetIdx >= this.activeQueue.length) {
        // Envolve para o começo se a fila for circular
        targetIdx = targetIdx % this.activeQueue.length;
      }
      const song = this.activeQueue[targetIdx];
      if (song && song.id !== this.currentSongId && !windowSongs.some((ws) => ws.id === song.id)) {
        windowSongs.push(song);
      }
    }
    return windowSongs;
  }

  /**
   * Pré-carrega uma única faixa: resolve a URL e baixa os primeiros ~15 segundos (350KB).
   */
  private async prebufferTrack(song: Song, signal: AbortSignal): Promise<void> {
    try {
      // 1. Resolve a melhor fonte de áudio (JioSaavn 320kbps / SoundCloud HLS)
      const streamRes = await fetchAudioStream(
        song.youtubeId,
        song.name,
        song.artist,
        song.audioUrl,
        song.id
      );

      if (signal.aborted || streamRes.kind === 'unavailable') return;

      if (streamRes.kind === 'audio' && streamRes.url) {
        // 2. Pré-aquece os primeiros 15 segundos (~350 KB) com Range Request
        let chunkLoaded = false;
        try {
          // Range: bytes=0-350000 puxa ~15 segundos a 192-320kbps
          const r = await fetch(streamRes.url, {
            headers: { Range: 'bytes=0-350000' },
            signal,
            cache: 'force-cache'
          });
          if (r.ok || r.status === 206) {
            chunkLoaded = true;
          }
        } catch (fetchErr: any) {
          if (fetchErr?.name === 'AbortError') return;
          // Se o servidor rejeitar o Range (ex: 416 ou CORS restrito), a URL já está resolvida no cache do stream
        }

        this.prebufferedMap.set(song.id, {
          songId: song.id,
          stream: streamRes,
          chunkLoaded,
          timestamp: Date.now()
        });

        console.log(`[PreBuffer] ⚡ Pré-aquecido ~15s de "${song.name}" (${chunkLoaded ? 'chunk 350KB OK' : 'stream OK'})`);
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        console.warn(`[PreBuffer] Falha silenciosa no pré-buffer de ${song.name}:`, err);
      }
    }
  }

  /**
   * Descarta entradas antigas fora da janela atual para manter uso de memória mínimo.
   */
  private pruneOldEntries() {
    if (this.prebufferedMap.size <= this.maxWindowSize + 2) return;

    const currentWindowSongIds = new Set(this.calculateWindowSongs().map((s) => s.id));
    if (this.currentSongId) currentWindowSongIds.add(this.currentSongId);

    for (const [id] of this.prebufferedMap) {
      if (!currentWindowSongIds.has(id)) {
        this.prebufferedMap.delete(id);
      }
    }
  }
}

export const preBufferEngine = new PreBufferEngine();
