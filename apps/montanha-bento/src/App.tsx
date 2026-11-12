import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  Search,
  Heart,
  ChevronDown,
  ChevronUp,
  Download,
  ListMusic,
  Plus,
  Home as HomeIcon,
  Library as LibraryIcon,
  Settings as SettingsIcon,
  X,
  Music,
  MoreVertical,
  Check,
  Share2,
  Radio
} from 'lucide-react';

export interface Song {
  id: string;
  name: string;
  artist: string;
  album?: string;
  filePath?: string;
  thumbnail: string;
  duration?: number;
  isLocal?: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  creator: string;
  cover: string;
  songs: Song[];
}

// Catálogo Global Able - Músicas de Uso Comum (Sem nenhum rótulo de treino)
const GLOBAL_ABLE_SONGS: Song[] = [
  {
    id: "able-s-1",
    name: "Till I Collapse",
    artist: "Eminem, Nate Dogg",
    album: "The Eminem Show",
    thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80",
    duration: 297
  },
  {
    id: "able-s-2",
    name: "Can't Hold Us",
    artist: "Macklemore & Ryan Lewis",
    album: "The Heist",
    thumbnail: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80",
    duration: 258
  },
  {
    id: "able-s-3",
    name: "Lose Yourself",
    artist: "Eminem",
    album: "8 Mile",
    thumbnail: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&q=80",
    duration: 326
  },
  {
    id: "able-s-4",
    name: "Billie Jean",
    artist: "Michael Jackson",
    album: "Thriller",
    thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80",
    duration: 294
  },
  {
    id: "able-s-5",
    name: "Sweet Child O' Mine",
    artist: "Guns N' Roses",
    album: "Appetite for Destruction",
    thumbnail: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&q=80",
    duration: 356
  },
  {
    id: "able-s-6",
    name: "Midnight City",
    artist: "M83",
    album: "Hurry Up, We're Dreaming",
    thumbnail: "https://images.unsplash.com/photo-1483721074573-586540da5703?w=400&q=80",
    duration: 243
  },
  {
    id: "able-s-7",
    name: "Back in Black",
    artist: "AC/DC",
    album: "Back in Black",
    thumbnail: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&q=80",
    duration: 255
  },
  {
    id: "able-s-8",
    name: "The Kids Aren't Alright",
    artist: "The Offspring",
    album: "Americana",
    thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80",
    duration: 180
  },
  {
    id: "able-s-9",
    name: "Smells Like Teen Spirit",
    artist: "Nirvana",
    album: "Nevermind",
    thumbnail: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&q=80",
    duration: 301
  },
  {
    id: "able-s-10",
    name: "Turn Down for What",
    artist: "DJ Snake, Lil Jon",
    album: "Turn Down for What",
    thumbnail: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80",
    duration: 213
  }
];

// Playlists Comuns / Pessoais Fiel ao AbleMusicPlayer
const INITIAL_ABLE_PLAYLISTS: Playlist[] = [
  {
    id: "pl-top-hits",
    name: "Top Hits 2026",
    creator: "Able Music",
    cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80",
    songs: [GLOBAL_ABLE_SONGS[0], GLOBAL_ABLE_SONGS[1], GLOBAL_ABLE_SONGS[2], GLOBAL_ABLE_SONGS[5]]
  },
  {
    id: "pl-rock-classics",
    name: "Rock Classics",
    creator: "Able Music",
    cover: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&q=80",
    songs: [GLOBAL_ABLE_SONGS[4], GLOBAL_ABLE_SONGS[6], GLOBAL_ABLE_SONGS[7], GLOBAL_ABLE_SONGS[8]]
  },
  {
    id: "pl-pop-retro",
    name: "All Out 80s & 90s",
    creator: "Able Music",
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80",
    songs: [GLOBAL_ABLE_SONGS[3], GLOBAL_ABLE_SONGS[6], GLOBAL_ABLE_SONGS[8]]
  },
  {
    id: "pl-favorites",
    name: "Músicas Favoritas",
    creator: "Você",
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=80",
    songs: [GLOBAL_ABLE_SONGS[0], GLOBAL_ABLE_SONGS[2], GLOBAL_ABLE_SONGS[4]]
  }
];

export default function App() {
  // Navigation: 'home' | 'search' | 'playlists' | 'downloads'
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'playlists' | 'downloads'>('home');
  
  // Audio Player State
  const [currentSong, setCurrentSong] = useState<Song>(GLOBAL_ABLE_SONGS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(297);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isRepeat, setIsRepeat] = useState<boolean>(false);
  const [queue, setQueue] = useState<Song[]>(GLOBAL_ABLE_SONGS);
  
  // Full Screen Player Sheet (player.xml do Able)
  const [isFullScreenPlayer, setIsFullScreenPlayer] = useState<boolean>(false);

  // Search State (search.xml)
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState<'all' | 'songs' | 'albums' | 'playlists'>('all');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<Song[]>([]);

  // Playlists State
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    try {
      const stored = localStorage.getItem('able_playlists');
      return stored ? JSON.parse(stored) : INITIAL_ABLE_PLAYLISTS;
    } catch {
      return INITIAL_ABLE_PLAYLISTS;
    }
  });
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

  // Favorites & Downloads
  const [favoriteSongIds, setFavoriteSongIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('able_favorites');
      return stored ? JSON.parse(stored) : ['able-s-1', 'able-s-3'];
    } catch {
      return ['able-s-1', 'able-s-3'];
    }
  });

  const [downloadedSongs, setDownloadedSongs] = useState<Song[]>(() => {
    try {
      const stored = localStorage.getItem('able_downloads');
      return stored ? JSON.parse(stored) : [GLOBAL_ABLE_SONGS[0], GLOBAL_ABLE_SONGS[4]];
    } catch {
      return [GLOBAL_ABLE_SONGS[0], GLOBAL_ABLE_SONGS[4]];
    }
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('able_playlists', JSON.stringify(playlists));
  }, [playlists]);

  useEffect(() => {
    localStorage.setItem('able_favorites', JSON.stringify(favoriteSongIds));
  }, [favoriteSongIds]);

  useEffect(() => {
    localStorage.setItem('able_downloads', JSON.stringify(downloadedSongs));
  }, [downloadedSongs]);

  // Audio Playback Timer
  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            handleNextSong();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, duration]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const playSong = (song: Song, newQueue?: Song[]) => {
    setCurrentSong(song);
    setCurrentTime(0);
    setDuration(song.duration || 240);
    setIsPlaying(true);
    if (newQueue) {
      setQueue(newQueue);
    }
    showToast(`Tocando: ${song.name}`);
  };

  const handleNextSong = () => {
    if (queue.length === 0) return;
    const currentIdx = queue.findIndex((s) => s.id === currentSong.id);
    let nextIdx = currentIdx + 1;
    if (nextIdx >= queue.length) {
      nextIdx = 0;
    }
    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    }
    playSong(queue[nextIdx]);
  };

  const handlePrevSong = () => {
    if (queue.length === 0) return;
    const currentIdx = queue.findIndex((s) => s.id === currentSong.id);
    let prevIdx = currentIdx - 1;
    if (prevIdx < 0) {
      prevIdx = queue.length - 1;
    }
    playSong(queue[prevIdx]);
  };

  const toggleFavorite = (songId: string) => {
    setFavoriteSongIds((prev) => {
      const exists = prev.includes(songId);
      const updated = exists ? prev.filter((id) => id !== songId) : [...prev, songId];
      showToast(exists ? 'Removida dos favoritos' : 'Adicionada aos favoritos');
      return updated;
    });
  };

  const handleDownloadSong = (song: Song) => {
    if (downloadedSongs.some((s) => s.id === song.id)) {
      showToast(`"${song.name}" já está salva nos downloads!`);
      return;
    }
    setDownloadedSongs((prev) => [song, ...prev]);
    showToast(`Baixando "${song.name}" para reprodução offline...`);
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.songs) && data.songs.length > 0) {
          const mapped: Song[] = data.songs.map((s: any) => ({
            id: s.id || `yt-${Date.now()}`,
            name: s.title || s.name || 'Música',
            artist: s.artist || 'Artista',
            thumbnail: s.thumbnail || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80',
            duration: s.duration || 210
          }));
          setSearchResults(mapped);
          return;
        }
      }
    } catch {}

    // Fallback local do Able
    const localFiltered = GLOBAL_ABLE_SONGS.filter(
      (s) =>
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.artist.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(localFiltered);
    setIsSearching(false);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex h-screen w-full flex-col bg-[#121212] text-white font-sans overflow-hidden select-none">
      
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 rounded-full bg-[#282828] border border-white/10 px-5 py-2.5 text-xs font-semibold text-white shadow-2xl animate-fade-in flex items-center gap-2">
          <Check size={14} className="text-[#1DB954]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER (Fiel ao AbleActivity) */}
      <header className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-white/[0.06] bg-[#121212]/90 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1DB954] text-black shadow-lg">
            <Music size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-[#fbfbfb]">Able</h1>
            <p className="text-[10px] text-neutral-400 font-medium">Free Music Streaming • Cloud & Offline</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: 'AbleMusic', text: 'Ouça músicas sem anúncios no AbleMusic', url: window.location.href });
              } else {
                navigator.clipboard.writeText(window.location.href);
                showToast('Link do Able copiado!');
              }
            }}
            className="rounded-full p-2.5 text-neutral-400 hover:text-white hover:bg-white/5 transition"
            title="Compartilhar"
          >
            <Share2 size={18} />
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 pb-36">
        
        {/* VIEW 1: HOME (home.xml do Able) */}
        {activeTab === 'home' && !selectedPlaylist && (
          <div className="space-y-8 max-w-6xl mx-auto">
            {/* Saudações & Destaques */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#fbfbfb]">Início</h2>
              <p className="text-xs text-neutral-400 mt-1">Músicas mais tocadas e recomendações para você</p>
            </div>

            {/* Grid de Playlists Rápidas estilo Spotify */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {playlists.slice(0, 4).map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => setSelectedPlaylist(pl)}
                  className="flex items-center gap-3 rounded-xl bg-[#181818] hover:bg-[#282828] p-2 pr-4 transition cursor-pointer border border-white/5 shadow-md group"
                >
                  <img src={pl.cover} alt={pl.name} className="h-14 w-14 rounded-lg object-cover shadow" />
                  <span className="font-bold text-xs sm:text-sm text-white truncate flex-1">{pl.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (pl.songs.length > 0) playSong(pl.songs[0], pl.songs);
                    }}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1DB954] text-black shadow-lg opacity-0 group-hover:opacity-100 transition hover:scale-105"
                  >
                    <Play size={16} fill="currentColor" className="ml-0.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Seção: Músicas Populares (Lista Rápida com Swipe / Play direto) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h3 className="text-lg font-bold text-white">Músicas Recomendadas</h3>
                <span className="text-xs text-neutral-400">{GLOBAL_ABLE_SONGS.length} faixas</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {GLOBAL_ABLE_SONGS.map((song, idx) => {
                  const isCurrent = currentSong.id === song.id;
                  return (
                    <div
                      key={song.id}
                      onClick={() => playSong(song, GLOBAL_ABLE_SONGS)}
                      className={`flex items-center justify-between p-3 rounded-xl transition cursor-pointer group ${
                        isCurrent ? 'bg-white/10' : 'hover:bg-[#1e1e1e]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-5 text-center text-xs font-semibold text-neutral-500 group-hover:hidden">
                          {idx + 1}
                        </span>
                        <Play
                          size={14}
                          fill="currentColor"
                          className="w-5 text-[#1DB954] hidden group-hover:block"
                        />
                        <img src={song.thumbnail} alt={song.name} className="h-11 w-11 rounded-lg object-cover" />
                        <div className="min-w-0">
                          <p className={`text-sm font-bold truncate ${isCurrent ? 'text-[#1DB954]' : 'text-white'}`}>
                            {song.name}
                          </p>
                          <p className="text-xs text-neutral-400 truncate">{song.artist}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(song.id);
                          }}
                          className="rounded-full p-2 text-neutral-400 hover:text-white transition"
                          title="Favoritar"
                        >
                          <Heart
                            size={16}
                            className={favoriteSongIds.includes(song.id) ? 'fill-[#1DB954] text-[#1DB954]' : ''}
                          />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadSong(song);
                          }}
                          className="rounded-full p-2 text-neutral-400 hover:text-white transition"
                          title="Baixar Música"
                        >
                          <Download size={16} />
                        </button>
                        <span className="text-xs text-neutral-500 font-mono hidden sm:inline">
                          {formatTime(song.duration || 210)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: SEARCH (search.xml do Able com filtros) */}
        {activeTab === 'search' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#fbfbfb]">Buscar</h2>
              <p className="text-xs text-neutral-400 mt-1">Pesquise músicas, artistas ou playlists na nuvem</p>
            </div>

            {/* Input de Busca do Able */}
            <div className="relative">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  void handleSearch(e.target.value);
                }}
                placeholder="O que você quer ouvir hoje?"
                className="h-12 w-full rounded-full bg-[#242424] pl-12 pr-10 text-sm text-white placeholder-neutral-400 outline-none focus:ring-2 focus:ring-[#1DB954] transition shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Filtros do Able: [ Tudo ] [ Músicas ] [ Álbuns ] [ Playlists ] */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all', label: 'Tudo' },
                { id: 'songs', label: 'Músicas' },
                { id: 'albums', label: 'Álbuns' },
                { id: 'playlists', label: 'Playlists' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSearchFilter(tab.id as any)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                    searchFilter === tab.id
                      ? 'bg-white text-black'
                      : 'bg-[#242424] text-neutral-300 hover:bg-[#2e2e2e]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Resultados da Busca */}
            <div className="space-y-2 pt-2">
              {isSearching ? (
                <div className="py-20 text-center text-neutral-400">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#1DB954] border-t-transparent mb-3" />
                  <p className="text-xs">Buscando faixas no Able Cloud...</p>
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((song) => (
                  <div
                    key={song.id}
                    onClick={() => playSong(song, searchResults)}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#181818] hover:bg-[#282828] transition cursor-pointer group border border-white/5"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={song.thumbnail} alt={song.name} className="h-12 w-12 rounded-lg object-cover" />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate group-hover:text-[#1DB954] transition">
                          {song.name}
                        </p>
                        <p className="text-xs text-neutral-400 truncate">{song.artist}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(song.id);
                        }}
                        className="rounded-full p-2 text-neutral-400 hover:text-white"
                        title="Favoritar"
                      >
                        <Heart
                          size={16}
                          className={favoriteSongIds.includes(song.id) ? 'fill-[#1DB954] text-[#1DB954]' : ''}
                        />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadSong(song);
                        }}
                        className="rounded-full p-2 text-neutral-400 hover:text-white"
                        title="Baixar"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </div>
                ))
              ) : searchQuery ? (
                <div className="py-16 text-center text-neutral-400">
                  <p className="text-sm">Nenhum resultado encontrado para "{searchQuery}"</p>
                </div>
              ) : (
                <div className="py-16 text-center text-neutral-500">
                  <Search size={36} className="mx-auto mb-2 opacity-30" />
                  <p className="text-xs">Digite qualquer artista, música ou álbum para buscar</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 3: PLAYLISTS & LIBRARY (playlists.xml do Able) */}
        {activeTab === 'playlists' && !selectedPlaylist && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#fbfbfb]">Sua Biblioteca</h2>
                <p className="text-xs text-neutral-400 mt-1">Playlists salvas e coleções</p>
              </div>
              <button
                onClick={() => {
                  const name = prompt('Nome da nova playlist:');
                  if (name && name.trim()) {
                    const newPl: Playlist = {
                      id: `pl-${Date.now()}`,
                      name: name.trim(),
                      creator: 'Você',
                      cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
                      songs: []
                    };
                    setPlaylists((prev) => [newPl, ...prev]);
                    showToast(`Playlist "${name}" criada!`);
                  }
                }}
                className="flex items-center gap-1.5 rounded-full bg-[#1DB954] px-4 py-2 text-xs font-bold text-black shadow-md hover:scale-105 active:scale-95 transition"
              >
                <Plus size={16} />
                <span>Nova Playlist</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {playlists.map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => setSelectedPlaylist(pl)}
                  className="rounded-2xl bg-[#181818] hover:bg-[#282828] p-3.5 transition cursor-pointer border border-white/5 group shadow-lg"
                >
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black/40">
                    <img src={pl.cover} alt={pl.name} className="h-full w-full object-cover transition group-hover:scale-105 duration-300" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (pl.songs.length > 0) playSong(pl.songs[0], pl.songs);
                      }}
                      className="absolute bottom-2.5 right-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-[#1DB954] text-black shadow-xl opacity-0 group-hover:opacity-100 transition hover:scale-105"
                    >
                      <Play size={18} fill="currentColor" className="ml-0.5" />
                    </button>
                  </div>
                  <h4 className="mt-3 text-sm font-bold text-white truncate group-hover:text-[#1DB954] transition">{pl.name}</h4>
                  <p className="text-xs text-neutral-400 mt-0.5 truncate">{pl.songs.length} músicas • {pl.creator}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 4: DOWNLOADS OFFLINE (activity_downloads.xml do Able) */}
        {activeTab === 'downloads' && !selectedPlaylist && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#fbfbfb]">Downloads</h2>
              <p className="text-xs text-neutral-400 mt-1">Músicas disponíveis para reprodução offline sem internet</p>
            </div>

            {downloadedSongs.length === 0 ? (
              <div className="py-20 text-center text-neutral-500">
                <Download size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-semibold text-neutral-300">Nenhuma música baixada ainda</p>
                <p className="text-xs mt-1">Toque no ícone de download em qualquer música para salvar offline.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {downloadedSongs.map((song, idx) => (
                  <div
                    key={song.id}
                    onClick={() => playSong(song, downloadedSongs)}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-[#181818] hover:bg-[#282828] transition cursor-pointer border border-white/5 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-mono text-neutral-500 w-5">{idx + 1}</span>
                      <img src={song.thumbnail} alt={song.name} className="h-11 w-11 rounded-lg object-cover" />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate group-hover:text-[#1DB954]">{song.name}</p>
                        <p className="text-xs text-neutral-400 truncate">{song.artist}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-semibold text-[#1DB954] bg-[#1DB954]/10 border border-[#1DB954]/20 px-2.5 py-0.5 rounded-full">
                        Offline Pronto
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDownloadedSongs((prev) => prev.filter((s) => s.id !== song.id));
                          showToast(`"${song.name}" removida dos downloads.`);
                        }}
                        className="rounded-full p-2 text-neutral-400 hover:text-red-400 transition"
                        title="Remover download"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* DETALHES DA PLAYLIST SELECIONADA (albumplaylist.xml do Able) */}
        {selectedPlaylist && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <button
              onClick={() => setSelectedPlaylist(null)}
              className="flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white transition"
            >
              <span>← Voltar</span>
            </button>

            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 bg-gradient-to-b from-[#242424] to-transparent p-6 rounded-3xl border border-white/5">
              <img src={selectedPlaylist.cover} alt={selectedPlaylist.name} className="h-44 w-44 rounded-2xl object-cover shadow-2xl" />
              <div className="text-center sm:text-left flex-1 min-w-0">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Playlist</span>
                <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-1 truncate">{selectedPlaylist.name}</h2>
                <p className="text-xs text-neutral-300 mt-2">{selectedPlaylist.songs.length} músicas • Criada por {selectedPlaylist.creator}</p>
                <div className="mt-4 flex items-center justify-center sm:justify-start gap-3">
                  <button
                    onClick={() => {
                      if (selectedPlaylist.songs.length > 0) {
                        playSong(selectedPlaylist.songs[0], selectedPlaylist.songs);
                      }
                    }}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1DB954] text-black shadow-lg hover:scale-105 active:scale-95 transition"
                  >
                    <Play size={20} fill="currentColor" className="ml-0.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Lista de Faixas da Playlist */}
            <div className="space-y-1">
              {selectedPlaylist.songs.map((song, idx) => (
                <div
                  key={song.id}
                  onClick={() => playSong(song, selectedPlaylist.songs)}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono text-neutral-500 w-5">{idx + 1}</span>
                    <img src={song.thumbnail} alt={song.name} className="h-10 w-10 rounded-lg object-cover" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate group-hover:text-[#1DB954]">{song.name}</p>
                      <p className="text-xs text-neutral-400 truncate">{song.artist}</p>
                    </div>
                  </div>
                  <span className="text-xs text-neutral-500 font-mono">{formatTime(song.duration || 210)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* MINI-PLAYER INFERIOR (Fiel à barra de reprodução do Able / Spotify) */}
      <div
        onClick={() => setIsFullScreenPlayer(true)}
        className="fixed bottom-16 sm:bottom-0 left-0 right-0 h-20 bg-[#181818] border-t border-white/[0.08] px-4 sm:px-6 flex items-center justify-between cursor-pointer z-30 hover:bg-[#202020] transition"
      >
        {/* Track Info */}
        <div className="flex items-center gap-3 min-w-0 w-1/3">
          <img src={currentSong.thumbnail} alt={currentSong.name} className="h-12 w-12 rounded-lg object-cover shadow" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate">{currentSong.name}</p>
            <p className="text-xs text-neutral-400 truncate">{currentSong.artist}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(currentSong.id);
            }}
            className="hidden sm:block p-1.5 text-neutral-400 hover:text-white transition"
          >
            <Heart size={18} className={favoriteSongIds.includes(currentSong.id) ? 'fill-[#1DB954] text-[#1DB954]' : ''} />
          </button>
        </div>

        {/* Central Controls */}
        <div className="flex flex-col items-center gap-1.5 w-1/3" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-4">
            <button onClick={handlePrevSong} className="text-neutral-400 hover:text-white transition">
              <SkipBack size={18} fill="currentColor" />
            </button>
            <button
              onClick={togglePlay}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black hover:scale-105 active:scale-95 transition shadow"
            >
              {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
            </button>
            <button onClick={handleNextSong} className="text-neutral-400 hover:text-white transition">
              <SkipForward size={18} fill="currentColor" />
            </button>
          </div>

          <div className="w-full max-w-md hidden sm:flex items-center gap-2">
            <span className="text-[10px] text-neutral-500 font-mono tabular-nums">{formatTime(currentTime)}</span>
            <div className="h-1 flex-1 rounded-full bg-white/20 overflow-hidden">
              <div className="h-full bg-white" style={{ width: `${(currentTime / duration) * 100}%` }} />
            </div>
            <span className="text-[10px] text-neutral-500 font-mono tabular-nums">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume & Right Actions */}
        <div className="flex items-center justify-end gap-3 w-1/3" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => handleDownloadSong(currentSong)}
            className="text-neutral-400 hover:text-white transition p-1.5"
            title="Baixar Música"
          >
            <Download size={18} />
          </button>
          <div className="hidden sm:flex items-center gap-2">
            <button onClick={() => setIsMuted(!isMuted)} className="text-neutral-400 hover:text-white">
              {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                setIsMuted(false);
              }}
              className="w-20 h-1 accent-white bg-white/20 rounded-full cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* FULL SCREEN PLAYER MODAL (player.xml do Able) */}
      {isFullScreenPlayer && (
        <div className="fixed inset-0 z-50 bg-[#121212] flex flex-col justify-between p-6 sm:p-10 animate-fade-in select-none">
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsFullScreenPlayer(false)}
              className="rounded-full p-2 text-neutral-400 hover:text-white hover:bg-white/10 transition"
            >
              <ChevronDown size={28} />
            </button>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Tocando da Biblioteca</span>
            <button
              onClick={() => handleDownloadSong(currentSong)}
              className="rounded-full p-2 text-neutral-400 hover:text-white hover:bg-white/10 transition"
              title="Baixar Música"
            >
              <Download size={20} />
            </button>
          </div>

          {/* Large Cover Art (com o visual limpo do Able) */}
          <div className="my-auto max-w-sm sm:max-w-md mx-auto w-full aspect-square rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/10">
            <img src={currentSong.thumbnail} alt={currentSong.name} className="w-full h-full object-cover" />
          </div>

          {/* Song Info & Scrubber & Controls */}
          <div className="max-w-md mx-auto w-full space-y-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <h2 className="text-2xl font-black text-white truncate">{currentSong.name}</h2>
                <p className="text-sm text-neutral-400 font-medium truncate mt-0.5">{currentSong.artist}</p>
              </div>
              <button onClick={() => toggleFavorite(currentSong.id)} className="p-2 text-neutral-400 hover:text-white">
                <Heart size={24} className={favoriteSongIds.includes(currentSong.id) ? 'fill-[#1DB954] text-[#1DB954]' : ''} />
              </button>
            </div>

            {/* Seekbar */}
            <div>
              <div className="relative h-1.5 w-full rounded-full bg-white/20 overflow-hidden cursor-pointer">
                <div className="h-full bg-white" style={{ width: `${(currentTime / duration) * 100}%` }} />
              </div>
              <div className="flex justify-between text-xs font-mono text-neutral-400 mt-2">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Large Controls */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setIsShuffle(!isShuffle)}
                className={`p-2 transition ${isShuffle ? 'text-[#1DB954]' : 'text-neutral-400 hover:text-white'}`}
                title="Aleatório"
              >
                <Shuffle size={20} />
              </button>

              <button onClick={handlePrevSong} className="p-2 text-white hover:scale-110 active:scale-95 transition">
                <SkipBack size={28} fill="currentColor" />
              </button>

              <button
                onClick={togglePlay}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-black shadow-2xl hover:scale-105 active:scale-95 transition"
              >
                {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
              </button>

              <button onClick={handleNextSong} className="p-2 text-white hover:scale-110 active:scale-95 transition">
                <SkipForward size={28} fill="currentColor" />
              </button>

              <button
                onClick={() => setIsRepeat(!isRepeat)}
                className={`p-2 transition ${isRepeat ? 'text-[#1DB954]' : 'text-neutral-400 hover:text-white'}`}
                title="Repetir"
              >
                <Repeat size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM NAVIGATION TABS (activity_main.xml do Able: Home, Search, Playlists, Downloads) */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#121212]/95 border-t border-white/[0.08] backdrop-blur-lg flex items-center justify-around z-20 sm:hidden">
        {[
          { id: 'home', label: 'Início', icon: HomeIcon },
          { id: 'search', label: 'Buscar', icon: Search },
          { id: 'playlists', label: 'Playlists', icon: LibraryIcon },
          { id: 'downloads', label: 'Downloads', icon: Download }
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as any);
                setSelectedPlaylist(null);
              }}
              className={`flex flex-col items-center justify-center gap-1 py-1 px-4 transition ${
                isActive ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-[#1DB954]' : ''} />
              <span className={`text-[10px] font-semibold ${isActive ? 'text-white' : 'text-neutral-500'}`}>{item.label}</span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}
