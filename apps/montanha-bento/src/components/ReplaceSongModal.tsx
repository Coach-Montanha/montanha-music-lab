import React, { useState, useEffect, useRef } from 'react';
import { X, Search, RefreshCw, Check, Play, Pause, Loader2, Music2, AlertCircle } from 'lucide-react';
import { Song } from '../types';
import { searchCategorized } from '../lib/searchEngine';
import { fetchAudioStream } from '../lib/audioStreamEngine';

interface ReplaceSongModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetSong: Song | null;
  playlistId?: string;
  onSelectReplacement: (targetSong: Song, newSong: Song, playlistId?: string) => void;
}

export function ReplaceSongModal({
  isOpen,
  onClose,
  targetSong,
  playlistId,
  onSelectReplacement
}: ReplaceSongModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewingSongId, setPreviewingSongId] = useState<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Inicializa a busca com o nome da música e artista ao abrir o modal
  useEffect(() => {
    if (isOpen && targetSong) {
      const initialQuery = `${targetSong.name} ${targetSong.artist}`.trim();
      setQuery(initialQuery);
      performSearch(initialQuery);
    } else {
      stopPreview();
    }
  }, [isOpen, targetSong]);

  const stopPreview = () => {
    if (previewAudioRef.current) {
      try {
        previewAudioRef.current.pause();
        previewAudioRef.current.src = '';
      } catch {}
      previewAudioRef.current = null;
    }
    setPreviewingSongId(null);
  };

  const performSearch = async (searchTerm: string) => {
    const q = searchTerm.trim();
    if (!q) {
      setResults([]);
      return;
    }
    setLoading(true);
    stopPreview();
    try {
      const res = await searchCategorized(q, 'songs');
      // Filtra faixas idênticas ao ID original quebrado para não sugerir a mesma fonte com falha
      const filtered = (res.songs || []).filter((s) => s.id !== targetSong?.id);
      setResults(filtered);
    } catch (err) {
      console.warn('Erro ao buscar alternativas para substituição:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePreview = async (song: Song, e: React.MouseEvent) => {
    e.stopPropagation();

    // Se já estiver tocando esta prévia, pausa
    if (previewingSongId === song.id) {
      stopPreview();
      return;
    }

    stopPreview();
    setPreviewingSongId(song.id);

    try {
      const res = await fetchAudioStream(song.youtubeId, song.name, song.artist, undefined, song.id);
      const streamUrl = res.kind === 'audio' ? res.url : null;
      if (!streamUrl) {
        setPreviewingSongId(null);
        return;
      }

      const audio = new Audio(streamUrl);
      previewAudioRef.current = audio;
      audio.volume = 0.8;
      audio.onended = () => stopPreview();
      audio.onerror = () => stopPreview();
      await audio.play();
    } catch {
      stopPreview();
    }
  };

  const handleConfirmReplacement = (newSong: Song) => {
    if (!targetSong) return;
    stopPreview();
    onSelectReplacement(targetSong, newSong, playlistId);
    onClose();
  };

  if (!isOpen || !targetSong) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div
        className="w-full max-w-xl max-h-[90vh] bg-[#181818] border border-white/10 rounded-3xl flex flex-col shadow-2xl overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CABEÇALHO DO POP-UP */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-[#1c1c1e] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-[#1DB954]">
              <RefreshCw size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-tight">Substituir Música</h3>
              <p className="text-[11px] text-neutral-400 font-medium">
                Escolha uma versão alternativa funcional para sua playlist
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopPreview();
              onClose();
            }}
            className="rounded-full p-2 text-neutral-400 hover:text-white hover:bg-white/10 transition"
            title="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        {/* CARTÃO DA FAIXA ATUAL (ALVO DA SUBSTITUIÇÃO) */}
        <div className="p-4 sm:p-5 border-b border-white/5 bg-black/20 flex-shrink-0 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              Faixa Atual com Falha
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-red-400 bg-red-950/40 border border-red-500/30 px-2 py-0.5 rounded-full">
              <AlertCircle size={10} />
              Áudio Indisponível
            </span>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/[0.03] border border-white/5">
            <img
              src={targetSong.thumbnail}
              alt={targetSong.name}
              className="h-12 w-12 rounded-xl object-cover shadow flex-shrink-0"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/icon-192.png';
              }}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white truncate">{targetSong.name}</p>
              <p className="text-xs text-neutral-400 truncate">{targetSong.artist}</p>
            </div>
          </div>

          {/* BARRA DE PESQUISA REFINÁVEL */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  performSearch(query);
                }
              }}
              placeholder="Refinar busca de alternativas..."
              className="h-11 w-full rounded-2xl bg-[#222222] border border-white/10 pl-10 pr-24 text-xs sm:text-sm text-white placeholder-neutral-500 outline-none focus:border-[#1DB954] transition shadow-inner"
            />
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="p-1.5 text-neutral-400 hover:text-white"
                  title="Limpar"
                >
                  <X size={14} />
                </button>
              )}
              <button
                onClick={() => performSearch(query)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-[#1DB954] hover:text-black text-xs font-bold text-white transition active:scale-95"
              >
                <span>Buscar</span>
              </button>
            </div>
          </div>
        </div>

        {/* LISTA DE ALTERNATIVAS ENCONTRADAS */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-2">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
              <Loader2 size={32} className="text-[#1DB954] animate-spin" />
              <p className="text-xs text-neutral-400 font-medium">
                Buscando versões alternativas disponíveis...
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-2">
              <Music2 size={36} className="text-neutral-600 mb-1" />
              <p className="text-sm font-bold text-neutral-300">Nenhuma alternativa encontrada</p>
              <p className="text-xs text-neutral-500 max-w-sm">
                Tente ajustar o termo de pesquisa acima (por exemplo, digitar apenas o título sem o nome do artista).
              </p>
            </div>
          ) : (
            results.map((altSong, idx) => {
              const isPreviewing = previewingSongId === altSong.id;
              return (
                <div
                  key={altSong.id || idx}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 transition group gap-2.5"
                >
                  {/* ESQUERDA: CAPA + PREVIEW PLAY + INFO */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="relative h-11 w-11 rounded-xl overflow-hidden flex-shrink-0 group/cover">
                      <img
                        src={altSong.thumbnail}
                        alt={altSong.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/icon-192.png';
                        }}
                      />
                      <button
                        onClick={(e) => handleTogglePreview(altSong, e)}
                        className={`absolute inset-0 flex items-center justify-center bg-black/60 transition ${
                          isPreviewing ? 'opacity-100' : 'opacity-0 group-hover/cover:opacity-100'
                        }`}
                        title={isPreviewing ? 'Pausar prévia' : 'Ouvir prévia'}
                      >
                        {isPreviewing ? (
                          <Pause size={18} className="text-[#1DB954]" fill="currentColor" />
                        ) : (
                          <Play size={18} className="text-white ml-0.5" fill="currentColor" />
                        )}
                      </button>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-bold text-white truncate">{altSong.name}</p>
                      <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                        {altSong.artist} {altSong.album ? `• ${altSong.album}` : ''}
                      </p>
                    </div>
                  </div>

                  {/* DIREITA: BOTÃO DE SUBSTITUIÇÃO DIRETA */}
                  <button
                    onClick={() => handleConfirmReplacement(altSong)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1DB954] text-black font-extrabold text-xs hover:bg-[#1ed760] hover:scale-105 active:scale-95 transition shadow-lg shrink-0"
                    title="Substituir por esta música"
                  >
                    <Check size={14} strokeWidth={3} />
                    <span className="hidden sm:inline">Substituir por esta</span>
                    <span className="sm:hidden">Escolher</span>
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* RODAPÉ DO MODAL */}
        <div className="p-3.5 sm:p-4 border-t border-white/10 bg-[#141414] flex items-center justify-between flex-shrink-0">
          <p className="text-[11px] text-neutral-500 hidden sm:block">
            {results.length} {results.length === 1 ? 'alternativa disponível' : 'alternativas disponíveis'}
          </p>
          <button
            onClick={() => {
              stopPreview();
              onClose();
            }}
            className="w-full sm:w-auto px-5 py-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-xs font-semibold transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
