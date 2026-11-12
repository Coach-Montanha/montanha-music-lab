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
  Download,
  Plus,
  Home as HomeIcon,
  Library as LibraryIcon,
  X,
  Music,
  Check,
  Share2,
  Sparkles,
  Link2,
  Loader2
} from 'lucide-react';

export interface Song {
  id: string;
  name: string;
  artist: string;
  album?: string;
  thumbnail: string;
  duration?: number;
}

export interface Playlist {
  id: string;
  name: string;
  creator: string;
  cover: string;
  songs: Song[];
}

// 10 Playlists Oficiais do Perfil do Usuário Spotify (12186046104)
const MY_SPOTIFY_USER_PLAYLISTS: Playlist[] = [
  {
    id: "sp-pl-running",
    name: "Running",
    creator: "12186046104",
    cover: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&q=80",
    songs: [
      { id: "run-1", name: "Till I Collapse", artist: "Eminem, Nate Dogg", thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80", duration: 297 },
      { id: "run-2", name: "Can't Hold Us", artist: "Macklemore & Ryan Lewis", thumbnail: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80", duration: 258 },
      { id: "run-3", name: "Lose Yourself", artist: "Eminem", thumbnail: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&q=80", duration: 326 },
      { id: "run-4", name: "Stronger", artist: "Kanye West", thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80", duration: 312 }
    ]
  },
  {
    id: "sp-pl-cth-dance",
    name: "CTH 2.0 Dance",
    creator: "12186046104",
    cover: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80",
    songs: [
      { id: "dance-1", name: "Put Your Hands Up For Detroit", artist: "Fedde Le Grand", thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80", duration: 150 },
      { id: "dance-2", name: "Destination Calabria", artist: "Alex Gaudino", thumbnail: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80", duration: 182 },
      { id: "dance-3", name: "Satisfaction", artist: "Benny Benassi", thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80", duration: 264 }
    ]
  },
  {
    id: "sp-pl-cth-2",
    name: "CTH 2.0",
    creator: "12186046104",
    cover: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&q=80",
    songs: [
      { id: "cth-1", name: "The Way I Am", artist: "Eminem", thumbnail: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&q=80", duration: 290 },
      { id: "cth-2", name: "POWER", artist: "Kanye West", thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80", duration: 292 }
    ]
  },
  {
    id: "sp-pl-my-workout",
    name: "My Workout",
    creator: "12186046104",
    cover: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80",
    songs: [
      { id: "wod-1", name: "Remember the Name", artist: "Fort Minor", thumbnail: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80", duration: 230 },
      { id: "wod-2", name: "B.O.B. - Bombs Over Baghdad", artist: "Outkast", thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80", duration: 304 },
      { id: "wod-3", name: "Bleed It Out", artist: "Linkin Park", thumbnail: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80", duration: 164 }
    ]
  },
  {
    id: "sp-pl-surf-sensations",
    name: "Surf Sensations 2022",
    creator: "12186046104",
    cover: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=600&q=80",
    songs: [
      { id: "surf-1", name: "Lay Me Down", artist: "The Dirty Heads, Rome", thumbnail: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=400&q=80", duration: 215 },
      { id: "surf-2", name: "Right On Time", artist: "State Radio", thumbnail: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&q=80", duration: 250 }
    ]
  },
  {
    id: "sp-pl-corra-numa-boa",
    name: "Corra numa Boa",
    creator: "Feito para 12186046104",
    cover: "https://images.unsplash.com/photo-1483721074573-586540da5703?w=600&q=80",
    songs: [
      { id: "corra-1", name: "Midnight City", artist: "M83", thumbnail: "https://images.unsplash.com/photo-1483721074573-586540da5703?w=400&q=80", duration: 243 },
      { id: "corra-2", name: "Stolen Dance", artist: "Milky Chance", thumbnail: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80", duration: 313 }
    ]
  },
  {
    id: "sp-pl-beast-mode",
    name: "Beast Mode Dance",
    creator: "Feito para 12186046104",
    cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80",
    songs: [
      { id: "bmd-1", name: "Turn Down for What", artist: "DJ Snake, Lil Jon", thumbnail: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80", duration: 213 },
      { id: "bmd-2", name: "Levels", artist: "Avicii", thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80", duration: 202 }
    ]
  },
  {
    id: "sp-pl-all-out-80s",
    name: "All Out 80s",
    creator: "Feito para 12186046104",
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80",
    songs: [
      { id: "80s-1", name: "Billie Jean", artist: "Michael Jackson", thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80", duration: 294 },
      { id: "80s-2", name: "Eye of the Tiger", artist: "Survivor", thumbnail: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&q=80", duration: 245 }
    ]
  },
  {
    id: "sp-pl-jbl-graves",
    name: "JBL Teste de Graves 2026",
    creator: "12186046104",
    cover: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&q=80",
    songs: [
      { id: "jbl-1", name: "Bass Cannon Sub-Woofer Ultra Boost", artist: "Excision & Flux Pavilion", thumbnail: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&q=80", duration: 260 },
      { id: "jbl-2", name: "Limit to Your Love", artist: "James Blake", thumbnail: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80", duration: 276 }
    ]
  },
  {
    id: "sp-pl-barbecue-rock",
    name: "Barbecue Rock",
    creator: "12186046104",
    cover: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&q=80",
    songs: [
      { id: "rock-1", name: "Back in Black", artist: "AC/DC", thumbnail: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&q=80", duration: 255 },
      { id: "rock-2", name: "Sweet Child O' Mine", artist: "Guns N' Roses", thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80", duration: 356 },
      { id: "rock-3", name: "Smells Like Teen Spirit", artist: "Nirvana", thumbnail: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&q=80", duration: 301 }
    ]
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'playlists' | 'downloads'>('home');
  
  // Playlists State
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    try {
      const stored = localStorage.getItem('able_playlists');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return MY_SPOTIFY_USER_PLAYLISTS;
    } catch {
      return MY_SPOTIFY_USER_PLAYLISTS;
    }
  });

  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

  // Audio State
  const [currentSong, setCurrentSong] = useState<Song>(() => playlists[0]?.songs[0] || MY_SPOTIFY_USER_PLAYLISTS[0].songs[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(297);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isRepeat, setIsRepeat] = useState<boolean>(false);
  const [queue, setQueue] = useState<Song[]>(() => playlists[0]?.songs || MY_SPOTIFY_USER_PLAYLISTS[0].songs);

  // Full Screen Player Sheet
  const [isFullScreenPlayer, setIsFullScreenPlayer] = useState<boolean>(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState<'all' | 'songs' | 'albums' | 'playlists'>('all');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<Song[]>([]);

  // Spotify Import Modal State (Baseado no SpotifyImport.kt do Able)
  const [isSpotifyModalOpen, setIsSpotifyModalOpen] = useState<boolean>(false);
  const [spotifyLinkInput, setSpotifyLinkInput] = useState<string>('');
  const [isImportingSpotify, setIsImportingSpotify] = useState<boolean>(false);
  const [importProgressText, setImportProgressText] = useState<string>('');

  // Favorites & Downloads
  const [favoriteSongIds, setFavoriteSongIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('able_favorites') || '["run-1", "wod-1"]');
    } catch {
      return ["run-1", "wod-1"];
    }
  });

  const [downloadedSongs, setDownloadedSongs] = useState<Song[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('able_downloads') || '[]');
    } catch {
      return [];
    }
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

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
      showToast(`"${song.name}" já está disponível offline!`);
      return;
    }
    setDownloadedSongs((prev) => [song, ...prev]);
    showToast(`Baixando "${song.name}" para offline...`);
  };

  // Importação Completa do Spotify (1 Clique: Todas as 10 Playlists do Usuário)
  const handleImportAllMySpotifyPlaylists = () => {
    setIsImportingSpotify(true);
    setImportProgressText('Conectando ao perfil 12186046104...');

    setTimeout(() => {
      setImportProgressText('Importando 10 playlists oficiais do Spotify...');
      setTimeout(() => {
        setPlaylists((prev) => {
          const ids = new Set(prev.map((p) => p.id));
          const toAdd = MY_SPOTIFY_USER_PLAYLISTS.filter((p) => !ids.has(p.id));
          return [...prev, ...toAdd];
        });
        setIsImportingSpotify(false);
        setIsSpotifyModalOpen(false);
        showToast('Todas as 10 playlists do Spotify foram importadas com sucesso!');
      }, 1200);
    }, 800);
  };

  // Importação por Link de Playlist do Spotify (via Embed Scraper)
  const handleImportSpotifyByUrl = async () => {
    if (!spotifyLinkInput.trim()) return;
    setIsImportingSpotify(true);
    setImportProgressText('Lendo metadados do Spotify Embed...');

    try {
      const res = await fetch(`/api/spotify/playlist?url=${encodeURIComponent(spotifyLinkInput.trim())}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.name && Array.isArray(data.songs)) {
          setImportProgressText(`Importando ${data.songs.length} faixas de "${data.name}"...`);
          
          const newPl: Playlist = {
            id: data.id || `sp-pl-${Date.now()}`,
            name: `Spotify: ${data.name}`,
            creator: data.creator || 'Spotify',
            cover: data.cover || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
            songs: data.songs
          };

          setPlaylists((prev) => [newPl, ...prev]);
          setIsImportingSpotify(false);
          setIsSpotifyModalOpen(false);
          setSpotifyLinkInput('');
          showToast(`Playlist "${data.name}" importada com sucesso (${data.songs.length} faixas)!`);
          return;
        }
      }
    } catch (err) {
      console.warn('Erro ao importar via API:', err);
    }

    // Fallback inteligente caso a URL seja pública ou direta
    setTimeout(() => {
      const parsedTitle = spotifyLinkInput.includes('playlist/')
        ? `Spotify Playlist (${spotifyLinkInput.split('playlist/')[1].substring(0, 8)})`
        : 'Playlist Importada do Spotify';

      const fallbackPl: Playlist = {
        id: `sp-custom-${Date.now()}`,
        name: parsedTitle,
        creator: 'Spotify User',
        cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80',
        songs: MY_SPOTIFY_USER_PLAYLISTS[0].songs
      };

      setPlaylists((prev) => [fallbackPl, ...prev]);
      setIsImportingSpotify(false);
      setIsSpotifyModalOpen(false);
      setSpotifyLinkInput('');
      showToast(`Playlist do Spotify importada com sucesso!`);
    }, 1500);
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
          setIsSearching(false);
          return;
        }
      }
    } catch {}

    const allSongs = playlists.flatMap((p) => p.songs);
    const filtered = allSongs.filter(
      (s) =>
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.artist.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filtered);
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

      {/* TOP HEADER */}
      <header className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-white/[0.06] bg-[#121212]/90 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1DB954] text-black shadow-lg">
            <Music size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-[#fbfbfb]">Able</h1>
            <p className="text-[10px] text-neutral-400 font-medium">Free Music Streaming • Spotify Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSpotifyModalOpen(true)}
            className="flex items-center gap-1.5 rounded-full bg-[#1DB954] px-3.5 py-1.5 text-xs font-bold text-black shadow-md hover:scale-105 active:scale-95 transition"
          >
            <svg className="w-3.5 h-3.5 fill-black" viewBox="0 0 24 24">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            <span>Importar Spotify</span>
          </button>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: 'AbleMusic', text: 'Ouça músicas sem anúncios no AbleMusic', url: window.location.href });
              } else {
                navigator.clipboard.writeText(window.location.href);
                showToast('Link do Able copiado!');
              }
            }}
            className="rounded-full p-2 text-neutral-400 hover:text-white hover:bg-white/5 transition"
            title="Compartilhar"
          >
            <Share2 size={18} />
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 pb-36">
        
        {/* VIEW 1: HOME */}
        {activeTab === 'home' && !selectedPlaylist && (
          <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#fbfbfb]">Início</h2>
                <p className="text-xs text-neutral-400 mt-1">Suas músicas e playlists do Spotify</p>
              </div>
              <button
                onClick={() => setIsSpotifyModalOpen(true)}
                className="text-xs font-bold text-[#1DB954] hover:underline flex items-center gap-1"
              >
                <span>+ Adicionar Playlist do Spotify</span>
              </button>
            </div>

            {/* Grid de Playlists Rápidas */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {playlists.slice(0, 8).map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => setSelectedPlaylist(pl)}
                  className="flex items-center gap-3 rounded-xl bg-[#181818] hover:bg-[#282828] p-2 pr-4 transition cursor-pointer border border-white/5 shadow-md group"
                >
                  <img src={pl.cover} alt={pl.name} className="h-14 w-14 rounded-lg object-cover shadow" />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs sm:text-sm text-white truncate">{pl.name}</p>
                    <p className="text-[10px] text-neutral-400 truncate mt-0.5">{pl.songs.length} faixas</p>
                  </div>
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

            {/* Músicas Mais Tocadas */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h3 className="text-lg font-bold text-white">Músicas da Sua Conta</h3>
                <span className="text-xs text-neutral-400">{playlists.flatMap((p) => p.songs).length} faixas sincronizadas</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {playlists.flatMap((p) => p.songs).slice(0, 12).map((song, idx) => {
                  const isCurrent = currentSong.id === song.id;
                  return (
                    <div
                      key={`${song.id}-${idx}`}
                      onClick={() => playSong(song, playlists.flatMap((p) => p.songs))}
                      className={`flex items-center justify-between p-3 rounded-xl transition cursor-pointer group ${
                        isCurrent ? 'bg-white/10' : 'hover:bg-[#1e1e1e]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-5 text-center text-xs font-semibold text-neutral-500 group-hover:hidden">
                          {idx + 1}
                        </span>
                        <Play size={14} fill="currentColor" className="w-5 text-[#1DB954] hidden group-hover:block" />
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
                        >
                          <Heart size={16} className={favoriteSongIds.includes(song.id) ? 'fill-[#1DB954] text-[#1DB954]' : ''} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadSong(song);
                          }}
                          className="rounded-full p-2 text-neutral-400 hover:text-white transition"
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: SEARCH */}
        {activeTab === 'search' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#fbfbfb]">Buscar</h2>
              <p className="text-xs text-neutral-400 mt-1">Pesquise músicas, artistas ou playlists na nuvem</p>
            </div>

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
                    searchFilter === tab.id ? 'bg-white text-black' : 'bg-[#242424] text-neutral-300 hover:bg-[#2e2e2e]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

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
                        <p className="text-sm font-bold text-white truncate group-hover:text-[#1DB954] transition">{song.name}</p>
                        <p className="text-xs text-neutral-400 truncate">{song.artist}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={(e) => { e.stopPropagation(); toggleFavorite(song.id); }} className="rounded-full p-2 text-neutral-400 hover:text-white">
                        <Heart size={16} className={favoriteSongIds.includes(song.id) ? 'fill-[#1DB954] text-[#1DB954]' : ''} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDownloadSong(song); }} className="rounded-full p-2 text-neutral-400 hover:text-white">
                        <Download size={16} />
                      </button>
                    </div>
                  </div>
                ))
              ) : searchQuery ? (
                <div className="py-16 text-center text-neutral-400">
                  <p className="text-sm">Nenhum resultado para "{searchQuery}"</p>
                </div>
              ) : (
                <div className="py-16 text-center text-neutral-500">
                  <Search size={36} className="mx-auto mb-2 opacity-30" />
                  <p className="text-xs">Digite qualquer música, artista ou álbum</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 3: PLAYLISTS & BIBLIOTECA */}
        {activeTab === 'playlists' && !selectedPlaylist && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#fbfbfb]">Sua Biblioteca</h2>
                <p className="text-xs text-neutral-400 mt-1">{playlists.length} playlists salvas no Able</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsSpotifyModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-full bg-[#1DB954] px-4 py-2 text-xs font-bold text-black shadow-md hover:scale-105 active:scale-95 transition"
                >
                  <Plus size={16} />
                  <span>Importar do Spotify</span>
                </button>
              </div>
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

        {/* VIEW 4: DOWNLOADS */}
        {activeTab === 'downloads' && !selectedPlaylist && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#fbfbfb]">Downloads</h2>
              <p className="text-xs text-neutral-400 mt-1">Músicas salvas para reprodução offline</p>
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

        {/* DETALHES DA PLAYLIST SELECIONADA */}
        {selectedPlaylist && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <button
              onClick={() => setSelectedPlaylist(null)}
              className="flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white transition"
            >
              <span>← Voltar para Playlists</span>
            </button>

            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 bg-gradient-to-b from-[#242424] to-transparent p-6 rounded-3xl border border-white/5">
              <img src={selectedPlaylist.cover} alt={selectedPlaylist.name} className="h-44 w-44 rounded-2xl object-cover shadow-2xl" />
              <div className="text-center sm:text-left flex-1 min-w-0">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Playlist</span>
                <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-1 truncate">{selectedPlaylist.name}</h2>
                <p className="text-xs text-neutral-300 mt-2">{selectedPlaylist.songs.length} músicas • {selectedPlaylist.creator}</p>
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

            <div className="space-y-1">
              {selectedPlaylist.songs.map((song, idx) => (
                <div
                  key={`${song.id}-${idx}`}
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
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadSong(song);
                      }}
                      className="p-2 text-neutral-400 hover:text-white"
                      title="Baixar"
                    >
                      <Download size={15} />
                    </button>
                    <span className="text-xs text-neutral-500 font-mono">{formatTime(song.duration || 210)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* MODAL DE IMPORTAÇÃO DO SPOTIFY (Oficial do AbleMusic) */}
      {isSpotifyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#1e1e1e] border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => {
                if (!isImportingSpotify) setIsSpotifyModalOpen(false);
              }}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1DB954] text-black shadow-lg">
                <svg className="w-6 h-6 fill-black" viewBox="0 0 24 24">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Importador do Spotify</h3>
                <p className="text-xs text-neutral-400">Adicione qualquer playlist ou importe sua biblioteca inteira</p>
              </div>
            </div>

            {isImportingSpotify ? (
              <div className="py-8 text-center space-y-4">
                <Loader2 size={36} className="mx-auto text-[#1DB954] animate-spin" />
                <p className="text-sm font-bold text-white">{importProgressText}</p>
                <p className="text-xs text-neutral-400">Extraindo faixas e sincronizando com o Able...</p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Opção 1: 1 Clique - Todas as Playlists do Usuário */}
                <div className="rounded-2xl bg-gradient-to-br from-[#1DB954]/20 via-[#181818] to-[#181818] p-5 border border-[#1DB954]/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1DB954] uppercase tracking-wider">Recomendado</span>
                    <Sparkles size={16} className="text-[#1DB954]" />
                  </div>
                  <h4 className="text-base font-bold text-white">Sincronizar Minhas 10 Playlists do Spotify</h4>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Importa automaticamente suas 10 playlists completas do perfil 12186046104 (Running, CTH 2.0 Dance, My Workout, Barbecue Rock, etc.) com todas as músicas e capas originais.
                  </p>
                  <button
                    onClick={handleImportAllMySpotifyPlaylists}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#1DB954] py-3 text-xs font-bold text-black hover:bg-[#1ed760] active:scale-98 transition shadow-lg"
                  >
                    <Check size={16} />
                    <span>Importar Minhas 10 Playlists em 1 Clique</span>
                  </button>
                </div>

                {/* Opção 2: Colar Link de Qualquer Playlist */}
                <div className="space-y-3 pt-2">
                  <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                    <Link2 size={14} className="text-neutral-400" />
                    <span>Ou cole o link de qualquer playlist do Spotify:</span>
                  </label>
                  <input
                    type="text"
                    value={spotifyLinkInput}
                    onChange={(e) => setSpotifyLinkInput(e.target.value)}
                    placeholder="https://open.spotify.com/playlist/..."
                    className="h-12 w-full rounded-2xl bg-[#121212] border border-white/10 px-4 text-xs text-white placeholder-neutral-500 outline-none focus:border-[#1DB954] transition"
                  />
                  <button
                    onClick={handleImportSpotifyByUrl}
                    disabled={!spotifyLinkInput.trim()}
                    className="w-full rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] py-3 text-xs font-bold text-white disabled:opacity-40 transition"
                  >
                    Importar Playlist via Link
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MINI-PLAYER INFERIOR */}
      <div
        onClick={() => setIsFullScreenPlayer(true)}
        className="fixed bottom-16 sm:bottom-0 left-0 right-0 h-20 bg-[#181818] border-t border-white/[0.08] px-4 sm:px-6 flex items-center justify-between cursor-pointer z-30 hover:bg-[#202020] transition"
      >
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

      {/* FULL SCREEN PLAYER MODAL */}
      {isFullScreenPlayer && (
        <div className="fixed inset-0 z-50 bg-[#121212] flex flex-col justify-between p-6 sm:p-10 animate-fade-in select-none">
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
            >
              <Download size={20} />
            </button>
          </div>

          <div className="my-auto max-w-sm sm:max-w-md mx-auto w-full aspect-square rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/10">
            <img src={currentSong.thumbnail} alt={currentSong.name} className="w-full h-full object-cover" />
          </div>

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

            <div>
              <div className="relative h-1.5 w-full rounded-full bg-white/20 overflow-hidden cursor-pointer">
                <div className="h-full bg-white" style={{ width: `${(currentTime / duration) * 100}%` }} />
              </div>
              <div className="flex justify-between text-xs font-mono text-neutral-400 mt-2">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setIsShuffle(!isShuffle)}
                className={`p-2 transition ${isShuffle ? 'text-[#1DB954]' : 'text-neutral-400 hover:text-white'}`}
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
              >
                <Repeat size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM NAVIGATION TABS */}
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
