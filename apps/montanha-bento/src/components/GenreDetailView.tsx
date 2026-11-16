import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Play,
  Pause,
  Shuffle,
  Music,
  Disc,
  ListMusic,
  Users,
  Heart,
  ListPlus,
  Download,
  Sparkles,
  MoreVertical,
  RefreshCw
} from 'lucide-react';
import { Song, SearchAlbum, SearchArtist } from '../types';
import { GenreCategory, GenreThemedPlaylist } from '../lib/genresData';

interface GenreDetailViewProps {
  genre: GenreCategory;
  onBack: () => void;
  onPlaySong: (song: Song, queue: Song[]) => void;
  onPlayAll: (tracks: Song[]) => void;
  onShufflePlay: (tracks: Song[]) => void;
  onOpenEntity: (entity: {
    type: 'album' | 'playlist' | 'artist';
    name: string;
    subtitle?: string;
    cover: string;
    rawId?: string | number;
    tracks?: Song[];
  }) => void;
  onAddToPlaylist: (song: Song) => void;
  onDownloadSong: (song: Song) => void;
  onToggleFavorite: (songId: string) => void;
  favoriteSongIds: string[];
  currentSongId?: string;
  isPlaying?: boolean;
}

export const GenreDetailView: React.FC<GenreDetailViewProps> = ({
  genre,
  onBack,
  onPlaySong,
  onPlayAll,
  onShufflePlay,
  onOpenEntity,
  onAddToPlaylist,
  onDownloadSong,
  onToggleFavorite,
  favoriteSongIds,
  currentSongId,
  isPlaying = false
}) => {
  const [randomSeed, setRandomSeed] = useState<number>(0);

  // Seleciona aleatoriamente apenas 3 playlists de referência do catálogo de 30+
  const displayedPlaylists = useMemo(() => {
    if (!genre.playlists || genre.playlists.length === 0) return [];
    if (genre.playlists.length <= 3) return genre.playlists;
    const shuffled = [...genre.playlists].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }, [genre.id, genre.playlists, randomSeed]);
  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Top Bar com Botão Voltar & Título */}
      <div className="flex items-center justify-between sticky top-0 z-20 py-2 -mx-2 px-2 bg-black/60 backdrop-blur-xl border-b border-white/5">
        <button
          onClick={onBack}
          className="flex items-center justify-center h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white transition duration-200"
          aria-label="Voltar para todos os gêneros"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-black tracking-wide text-white capitalize">{genre.name}</h2>
        <div className="w-11" /> {/* Balanço simétrico */}
      </div>

      {/* Hero Banner do Gênero */}
      <div
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl transition-all"
        style={{
          background: genre.gradient,
          boxShadow: `0 20px 40px -15px ${genre.glowColor}`
        }}
      >
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 backdrop-blur-md text-[11px] font-black uppercase tracking-wider text-white border border-white/15">
              <Sparkles size={12} className="text-yellow-300" />
              <span>Gênero Musical</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white drop-shadow-md tracking-tight">
              {genre.name}
            </h1>
            <p className="text-xs sm:text-sm text-white/90 font-medium drop-shadow">
              {genre.tagline}
            </p>
          </div>

          {/* Botões de Ação Rápida: Play Tudo & Shuffle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onPlayAll(genre.topTracks)}
              className="flex items-center justify-center h-14 w-14 rounded-full bg-[#1DB954] hover:bg-[#1ed760] active:scale-90 text-black shadow-xl hover:shadow-[0_0_25px_rgba(29,185,84,0.6)] transition duration-200"
              title="Tocar Todas as Músicas"
            >
              <Play size={24} fill="currentColor" className="ml-1" />
            </button>
            <button
              onClick={() => onShufflePlay(genre.topTracks)}
              className="flex items-center justify-center h-12 w-12 rounded-full bg-black/40 hover:bg-black/60 active:scale-90 text-white backdrop-blur-md border border-white/20 transition duration-200"
              title="Modo Aleatório"
            >
              <Shuffle size={20} />
            </button>
          </div>
        </div>

        {/* Efeito sutil de brilho no fundo */}
        <div className="absolute -right-10 -bottom-10 w-60 h-60 rounded-full bg-white/10 blur-3xl pointer-events-none" />
      </div>

      {/* 1. SEÇÃO: MÚSICAS EM DESTAQUE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-wider text-neutral-300 flex items-center gap-2">
            <Music size={16} className="text-[#1DB954]" />
            <span>Músicas em Destaque</span>
          </h3>
          <span className="text-xs text-neutral-500 font-semibold">{genre.topTracks.length} faixas</span>
        </div>

        <div className="space-y-2">
          {genre.topTracks.map((song, idx) => {
            const isCurrent = currentSongId === song.id;
            return (
              <div
                key={song.id}
                onClick={() => onPlaySong(song, genre.topTracks)}
                className={`flex items-center justify-between p-3 rounded-2xl transition cursor-pointer group border ${
                  isCurrent
                    ? 'bg-[#1DB954]/10 border-[#1DB954]/30 shadow-md'
                    : 'bg-[#181818] hover:bg-[#242424] border-white/5'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-5 text-center text-xs font-bold text-neutral-500 group-hover:text-white">
                    {isCurrent && isPlaying ? (
                      <div className="flex items-end justify-center gap-0.5 h-3">
                        <span className="w-0.5 h-full bg-[#1DB954] animate-pulse" />
                        <span className="w-0.5 h-2/3 bg-[#1DB954] animate-pulse delay-75" />
                        <span className="w-0.5 h-4/5 bg-[#1DB954] animate-pulse delay-150" />
                      </div>
                    ) : (
                      idx + 1
                    )}
                  </span>
                  <div className="h-12 w-12 rounded-xl overflow-hidden shrink-0 shadow relative">
                    <img
                      src={song.thumbnail}
                      alt={song.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    {isCurrent && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        {isPlaying ? (
                          <Pause size={14} className="text-[#1DB954]" fill="currentColor" />
                        ) : (
                          <Play size={14} className="text-[#1DB954]" fill="currentColor" />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-bold truncate transition ${
                        isCurrent ? 'text-[#1DB954]' : 'text-white group-hover:text-[#1DB954]'
                      }`}
                    >
                      {song.name}
                    </p>
                    <p className="text-xs text-neutral-400 truncate mt-0.5">
                      {song.artist}
                      {song.album ? ` • ${song.album}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToPlaylist(song);
                    }}
                    className="p-2 text-neutral-400 hover:text-white transition active:scale-95"
                    title="Adicionar à Playlist"
                  >
                    <ListPlus size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownloadSong(song);
                    }}
                    className="p-2 text-neutral-400 hover:text-white transition active:scale-95"
                    title="Baixar para Offline"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(song.id);
                    }}
                    className="p-2 text-neutral-400 hover:text-white transition active:scale-95"
                    title="Favoritar"
                  >
                    <Heart
                      size={16}
                      className={favoriteSongIds.includes(song.id) ? 'fill-[#1DB954] text-[#1DB954]' : ''}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. SEÇÃO: PLAYLISTS DO TEMA (3 ESCOLHIDAS ALEATORIAMENTE DO ACERVO DE 30+) */}
      {displayedPlaylists && displayedPlaylists.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black uppercase tracking-wider text-neutral-300 flex items-center gap-2">
                <ListMusic size={16} className="text-[#1DB954]" />
                <span>Playlists do Gênero</span>
              </h3>
              <span className="text-[11px] text-neutral-400 font-semibold bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5">
                3 de {genre.playlists.length}
              </span>
            </div>
            <button
              onClick={() => setRandomSeed((s) => s + 1)}
              className="flex items-center gap-1.5 text-xs font-bold text-[#1DB954] hover:text-[#1ed760] transition px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 border border-white/5"
              title="Sortear outras 3 playlists de referência"
            >
              <RefreshCw size={12} />
              <span>Sortear Outras</span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {displayedPlaylists.map((playlist) => (
              <div
                key={playlist.id}
                onClick={() =>
                  onOpenEntity({
                    type: 'playlist',
                    name: playlist.name,
                    subtitle: playlist.creator,
                    cover: playlist.cover,
                    tracks: playlist.tracks
                  })
                }
                className="group p-4 rounded-2xl bg-[#181818] hover:bg-[#242424] transition duration-200 cursor-pointer border border-white/5 flex flex-col"
              >
                <div
                  className="aspect-square w-full rounded-xl overflow-hidden mb-3 shadow-lg relative flex items-center justify-center p-4 text-center"
                  style={{
                    background: playlist.gradient || genre.gradient
                  }}
                >
                  <span className="text-white font-black text-base sm:text-lg drop-shadow-md leading-snug line-clamp-3">
                    {playlist.name}
                  </span>
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-[10px] text-white px-2 py-0.5 rounded-full font-bold">
                    Playlist
                  </div>
                </div>
                <p className="text-sm font-bold text-white truncate group-hover:text-[#1DB954]">
                  {playlist.name}
                </p>
                <p className="text-xs text-neutral-400 truncate mt-0.5">{playlist.creator}</p>
                <span className="text-[10px] text-neutral-500 mt-1 font-medium">
                  {playlist.trackCount} faixas
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. SEÇÃO: ÁLBUNS DO GÊNERO */}
      {genre.albums && genre.albums.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-wider text-neutral-300 flex items-center gap-2">
              <Disc size={16} className="text-[#1DB954]" />
              <span>Álbuns em Destaque</span>
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {genre.albums.map((album) => (
              <div
                key={album.id}
                onClick={() =>
                  onOpenEntity({
                    type: 'album',
                    name: album.name,
                    subtitle: album.artist,
                    cover: album.cover,
                    rawId: album.rawId
                  })
                }
                className="group p-3 rounded-2xl bg-[#181818] hover:bg-[#242424] transition duration-200 cursor-pointer border border-white/5 flex flex-col"
              >
                <div className="aspect-square w-full rounded-xl overflow-hidden mb-3 shadow-lg relative">
                  <img
                    src={album.cover}
                    alt={album.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-[10px] text-white px-2 py-0.5 rounded-full font-bold">
                    Álbum
                  </div>
                </div>
                <p className="text-sm font-bold text-white truncate group-hover:text-[#1DB954]">
                  {album.name}
                </p>
                <p className="text-xs text-neutral-400 truncate mt-0.5">{album.artist}</p>
                {album.trackCount ? (
                  <span className="text-[10px] text-neutral-500 mt-1">{album.trackCount} faixas</span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. SEÇÃO: ARTISTAS DO GÊNERO */}
      {genre.artists && genre.artists.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-wider text-neutral-300 flex items-center gap-2">
              <Users size={16} className="text-[#1DB954]" />
              <span>Artistas Notáveis</span>
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {genre.artists.map((artist) => (
              <div
                key={artist.id}
                onClick={() =>
                  onOpenEntity({
                    type: 'artist',
                    name: artist.name,
                    subtitle: 'Artista',
                    cover: artist.image,
                    rawId: artist.rawId
                  })
                }
                className="group p-3 rounded-2xl bg-[#181818] hover:bg-[#242424] transition duration-200 cursor-pointer border border-white/5 flex flex-col items-center text-center"
              >
                <div className="h-24 w-24 rounded-full overflow-hidden mb-3 shadow-lg relative">
                  <img
                    src={artist.image}
                    alt={artist.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <p className="text-sm font-bold text-white truncate w-full group-hover:text-[#1DB954]">
                  {artist.name}
                </p>
                <span className="text-[10px] text-neutral-500 mt-0.5">Artista</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
