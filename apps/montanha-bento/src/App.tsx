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
  Flame,
  Dumbbell,
  Timer,
  Zap,
  Sparkles,
  Heart,
  ChevronRight,
  ListMusic,
  Share2,
  Download,
  Activity,
  Radio,
  Sliders,
  Check
} from 'lucide-react';

interface Song {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration?: number;
  audioUrl?: string;
}

interface Playlist {
  id: string;
  name: string;
  category: string;
  cover: string;
  description: string;
  songs: Song[];
}

// 10 Playlists Reais do Coach Montanha (Spotify 12186046104)
const BENTO_PLAYLISTS: Playlist[] = [
  {
    id: "sp-pl-running",
    name: "Running",
    category: "Cardio & Pace",
    cover: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&q=80",
    description: "Batidas no ritmo certo para correr sem quebrar o pace",
    songs: [
      { id: "run-1", title: "Till I Collapse", artist: "Eminem, Nate Dogg", thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80", duration: 297 },
      { id: "run-2", title: "Can't Hold Us", artist: "Macklemore & Ryan Lewis", thumbnail: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80", duration: 258 },
      { id: "run-3", title: "Lose Yourself", artist: "Eminem", thumbnail: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&q=80", duration: 326 }
    ]
  },
  {
    id: "sp-pl-cth-dance",
    name: "CTH 2.0 Dance",
    category: "High Energy",
    cover: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80",
    description: "Eletrônica acelerada para treinos intensos e alta adrenalina",
    songs: [
      { id: "dance-1", title: "Put Your Hands Up For Detroit", artist: "Fedde Le Grand", thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80", duration: 150 },
      { id: "dance-2", title: "Destination Calabria", artist: "Alex Gaudino", thumbnail: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80", duration: 182 },
      { id: "dance-3", title: "Satisfaction", artist: "Benny Benassi", thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80", duration: 264 }
    ]
  },
  {
    id: "sp-pl-my-workout",
    name: "My Workout",
    category: "CrossTraining WOD",
    cover: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80",
    description: "Combustível puro para WODs pesados de levantamento e força",
    songs: [
      { id: "wod-1", title: "Remember the Name", artist: "Fort Minor", thumbnail: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80", duration: 230 },
      { id: "wod-2", title: "B.O.B. - Bombs Over Baghdad", artist: "Outkast", thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80", duration: 304 },
      { id: "wod-3", title: "Bleed It Out", artist: "Linkin Park", thumbnail: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80", duration: 164 }
    ]
  },
  {
    id: "sp-pl-barbecue-rock",
    name: "Barbecue Rock",
    category: "Classic Rock & LPO",
    cover: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&q=80",
    description: "Guitarras pesadas para puxar barra olímpica e repetições máximas",
    songs: [
      { id: "rock-1", title: "Back in Black", artist: "AC/DC", thumbnail: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&q=80", duration: 255 },
      { id: "rock-2", title: "Sweet Child O' Mine", artist: "Guns N' Roses", thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80", duration: 356 },
      { id: "rock-3", title: "Smells Like Teen Spirit", artist: "Nirvana", thumbnail: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&q=80", duration: 301 }
    ]
  },
  {
    id: "sp-pl-beast-mode",
    name: "Beast Mode Dance",
    category: "Bass & Drops",
    cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80",
    description: "Graves subterrâneos para bater recordes pessoais no ginásio",
    songs: [
      { id: "bmd-1", title: "Turn Down for What", artist: "DJ Snake, Lil Jon", thumbnail: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80", duration: 213 },
      { id: "bmd-2", title: "Levels", artist: "Avicii", thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80", duration: 202 }
    ]
  },
  {
    id: "sp-pl-all-out-80s",
    name: "All Out 80s",
    category: "80s Retro Hits",
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80",
    description: "Nostalgia e ritmo com os maiores hinos da década de 80",
    songs: [
      { id: "80s-1", title: "Billie Jean", artist: "Michael Jackson", thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80", duration: 294 },
      { id: "80s-2", title: "Eye of the Tiger", artist: "Survivor", thumbnail: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&q=80", duration: 245 }
    ]
  }
];

export default function App() {
  const [activePlaylist, setActivePlaylist] = useState<Playlist>(BENTO_PLAYLISTS[0]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(297);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [workoutTimerSeconds, setWorkoutTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [activeWorkoutMode, setActiveWorkoutMode] = useState<'lpo' | 'wod' | 'cardio' | 'chill'>('wod');
  const [favorites, setFavorites] = useState<string[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentSong = useMemo(() => {
    return activePlaylist.songs[currentSongIndex] || activePlaylist.songs[0];
  }, [activePlaylist, currentSongIndex]);

  // Workout Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setWorkoutTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Audio Playback Simulation & Engine
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

  const handleNextSong = () => {
    const nextIdx = (currentSongIndex + 1) % activePlaylist.songs.length;
    setCurrentSongIndex(nextIdx);
    setCurrentTime(0);
    setDuration(activePlaylist.songs[nextIdx].duration || 240);
    setIsPlaying(true);
  };

  const handlePrevSong = () => {
    const prevIdx = currentSongIndex === 0 ? activePlaylist.songs.length - 1 : currentSongIndex - 1;
    setCurrentSongIndex(prevIdx);
    setCurrentTime(0);
    setDuration(activePlaylist.songs[prevIdx].duration || 240);
    setIsPlaying(true);
  };

  const selectPlaylist = (pl: Playlist) => {
    setActivePlaylist(pl);
    setCurrentSongIndex(0);
    setCurrentTime(0);
    setDuration(pl.songs[0]?.duration || 240);
    setIsPlaying(true);
  };

  const toggleFavorite = (songId: string) => {
    setFavorites((prev) =>
      prev.includes(songId) ? prev.filter((id) => id !== songId) : [...prev, songId]
    );
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const formatTimer = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins < 10 ? '0' : ''}${mins}m`;
    }
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const filteredPlaylists = useMemo(() => {
    if (!searchQuery.trim()) return BENTO_PLAYLISTS;
    const q = searchQuery.toLowerCase();
    return BENTO_PLAYLISTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.songs.some((s) => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-8 flex flex-col justify-between max-w-7xl mx-auto selection:bg-blue-600">
      {/* 1. APPLE TOP BAR */}
      <header className="flex items-center justify-between pb-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#0066cc] to-[#0088ff] text-white shadow-[0_4px_20px_rgba(0,102,204,0.4)]">
            <Activity size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">Montanha Music Bento</h1>
              <span className="rounded-full bg-blue-500/20 border border-blue-500/30 px-2 py-0.5 text-[10px] font-bold text-blue-400">
                PWA Aluno
              </span>
            </div>
            <p className="text-xs text-[#86868b]">Apple Bento Grid Edition • HiFi Audio Engine</p>
          </div>
        </div>

        {/* Global Controls / Status */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-full bg-white/[0.04] border border-white/8 px-3 py-1.5 text-xs text-neutral-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Gapless Engine 60 FPS</span>
          </div>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Montanha Music Bento',
                  text: 'Ouça as playlists de treino oficiais do Coach Montanha!',
                  url: window.location.href
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copiado!');
              }
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-neutral-300 transition"
            title="Compartilhar App"
          >
            <Share2 size={16} />
          </button>
        </div>
      </header>

      {/* 2. THE MAIN BENTO GRID (Apple Modular Layout) */}
      <main className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 py-6 flex-1">
        
        {/* CARD 1: NOW PLAYING HERO (2x2 on Desktop, Full Width on Mobile) */}
        <div className="bento-card md:col-span-2 lg:col-span-2 p-6 flex flex-col justify-between relative overflow-hidden group">
          {/* Ambient Glow */}
          <div
            className="absolute -top-24 -left-24 w-80 h-80 rounded-full blur-[90px] opacity-25 pointer-events-none transition duration-700"
            style={{ backgroundImage: `url(${currentSong.thumbnail})`, backgroundSize: 'cover' }}
          />

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-blue-500 animate-ping" />
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">Tocando Agora</span>
            </div>
            <button
              onClick={() => toggleFavorite(currentSong.id)}
              className="rounded-full p-2 text-neutral-400 hover:text-rose-500 transition active:scale-90"
              title="Favoritar"
            >
              <Heart
                size={20}
                className={favorites.includes(currentSong.id) ? 'fill-rose-500 text-rose-500' : ''}
              />
            </button>
          </div>

          {/* Cover & Song Info */}
          <div className="relative z-10 my-6 flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-[24px] overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.5)] border border-white/10 group-hover:scale-[1.02] transition duration-500">
              <img
                src={currentSong.thumbnail}
                alt={currentSong.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
            </div>

            <div className="text-center sm:text-left flex-1 min-w-0">
              <span className="text-xs font-medium text-blue-400/90 tracking-wide uppercase">
                {activePlaylist.name}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight truncate mt-1">
                {currentSong.title}
              </h2>
              <p className="text-sm sm:text-base text-[#86868b] font-medium truncate mt-0.5">
                {currentSong.artist}
              </p>

              {/* Tag com Modo de Treino */}
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/[0.05] border border-white/10 px-3 py-1 text-xs text-neutral-300">
                <Flame size={13} className="text-orange-400" />
                <span>{activePlaylist.category}</span>
              </div>
            </div>
          </div>

          {/* Timeline & Controls */}
          <div className="relative z-10 space-y-4">
            {/* Scrubber Bar */}
            <div>
              <div className="relative h-1.5 w-full rounded-full bg-white/10 overflow-hidden cursor-pointer">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-sky-400 transition-all duration-200"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-semibold text-[#86868b] mt-1.5 tabular-nums">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Playback Buttons */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}
                className="text-neutral-400 hover:text-white transition p-2 text-xs font-semibold"
                title="Voltar 10s"
              >
                -10s
              </button>

              <div className="flex items-center gap-4">
                <button
                  onClick={handlePrevSong}
                  className="rounded-full p-2 text-neutral-300 hover:text-white hover:bg-white/5 transition active:scale-90"
                  title="Anterior"
                >
                  <SkipBack size={22} fill="currentColor" />
                </button>

                <button
                  onClick={togglePlay}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-black shadow-[0_8px_30px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 transition"
                  title={isPlaying ? "Pausar" : "Tocar"}
                >
                  {isPlaying ? (
                    <Pause size={24} fill="currentColor" />
                  ) : (
                    <Play size={24} fill="currentColor" className="ml-0.5" />
                  )}
                </button>

                <button
                  onClick={handleNextSong}
                  className="rounded-full p-2 text-neutral-300 hover:text-white hover:bg-white/5 transition active:scale-90"
                  title="Próxima"
                >
                  <SkipForward size={22} fill="currentColor" />
                </button>
              </div>

              <button
                onClick={() => setCurrentTime(Math.min(duration, currentTime + 10))}
                className="text-neutral-400 hover:text-white transition p-2 text-xs font-semibold"
                title="Avançar 10s"
              >
                +10s
              </button>
            </div>
          </div>
        </div>

        {/* CARD 2: WORKOUT TIMER & FOCUS (1x1 Bento Card) */}
        <div className="bento-card p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#86868b]">Tempo de WOD</span>
            <div className="h-8 w-8 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
              <Timer size={16} />
            </div>
          </div>

          <div className="my-auto py-4 text-center">
            <div className="text-4xl sm:text-5xl font-black tracking-tight text-white font-mono">
              {formatTimer(workoutTimerSeconds)}
            </div>
            <p className="text-xs text-neutral-400 mt-2">Duração ativa da sessão de treino</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="flex-1 rounded-2xl bg-white/[0.08] hover:bg-white/[0.12] py-2 text-xs font-bold text-white transition active:scale-95"
            >
              {isTimerRunning ? 'Pausar' : 'Retomar'}
            </button>
            <button
              onClick={() => setWorkoutTimerSeconds(0)}
              className="rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] px-3 py-2 text-xs font-semibold text-neutral-400 hover:text-white transition active:scale-95"
            >
              Zerar
            </button>
          </div>
        </div>

        {/* CARD 3: VIBE / TREINO SELECTOR (1x1 Bento Card) */}
        <div className="bento-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#86868b]">Vibe do Treino</span>
            <div className="h-8 w-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Zap size={16} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 my-auto py-2">
            {[
              { id: 'lpo', label: 'LPO & Força', plIdx: 3, icon: Dumbbell },
              { id: 'wod', label: 'Metcon WOD', plIdx: 2, icon: Flame },
              { id: 'cardio', label: 'Corrida', plIdx: 0, icon: Activity },
              { id: 'chill', label: 'Recovery', plIdx: 5, icon: Radio }
            ].map((mode) => {
              const Icon = mode.icon;
              const isSelected = activeWorkoutMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => {
                    setActiveWorkoutMode(mode.id as any);
                    selectPlaylist(BENTO_PLAYLISTS[mode.plIdx]);
                  }}
                  className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border transition active:scale-95 ${
                    isSelected
                      ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                      : 'bg-white/[0.03] border-white/5 text-neutral-300 hover:bg-white/[0.06]'
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-[11px] font-bold">{mode.label}</span>
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-center text-[#86868b]">
            Ajusta o BPM sonoro ao estímulo fisiológico
          </div>
        </div>

        {/* CARD 4: PLAYLISTS CAROUSEL & DISCOVER (2x1 on Desktop, Full Width) */}
        <div className="bento-card md:col-span-3 lg:col-span-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                <span>Playlists Oficiais Coach Montanha</span>
                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  {BENTO_PLAYLISTS.length} Disponíveis
                </span>
              </h3>
              <p className="text-xs text-[#86868b] mt-0.5">Sincronizadas com o perfil do Spotify para treinos e LPO</p>
            </div>

            {/* Quick Search */}
            <div className="relative sm:w-72">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtrar por nome ou artista..."
                className="w-full h-9 rounded-full bg-white/[0.05] border border-white/10 pl-9 pr-4 text-xs text-white placeholder-[#86868b] outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* Horizontal Grid of Bento Playlists */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {filteredPlaylists.map((pl) => {
              const isSelected = activePlaylist.id === pl.id;
              return (
                <div
                  key={pl.id}
                  onClick={() => selectPlaylist(pl)}
                  className={`group relative cursor-pointer overflow-hidden rounded-[22px] border p-2.5 transition duration-300 hover:scale-[1.03] active:scale-95 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500/10 shadow-[0_4px_24px_rgba(0,102,204,0.3)]'
                      : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10'
                  }`}
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-[16px] bg-black/40">
                    <img
                      src={pl.cover}
                      alt={pl.name}
                      className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <div className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white shadow-md opacity-0 group-hover:opacity-100 transition">
                      <Play size={14} fill="currentColor" className="ml-0.5" />
                    </div>
                  </div>
                  <div className="mt-2 text-left">
                    <h4 className="text-xs font-bold text-white truncate">{pl.name}</h4>
                    <p className="text-[10px] text-[#86868b] truncate mt-0.5">{pl.category}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </main>

      {/* 3. APPLE FOOTER */}
      <footer className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-[#86868b] gap-2">
        <p>© 2026 Ecossistema Coach Montanha • Montanha Music Bento PWA</p>
        <p className="flex items-center gap-1">
          <span>Feito com</span>
          <span className="text-red-500">♥</span>
          <span>para atletas de alta performance</span>
        </p>
      </footer>
    </div>
  );
}
