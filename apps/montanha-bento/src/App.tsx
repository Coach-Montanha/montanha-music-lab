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
  ArrowLeft,
  Download,
  Plus,
  Home as HomeIcon,
  Library as LibraryIcon,
  X,
  Music,
  Check,
  Share2,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Link2,
  Loader2,
  Trash2,
  ListPlus,
  FolderPlus,
  Edit2,
  User as UserIcon,
  Cloud,
  CheckCircle2,
  Smartphone,
  RefreshCw,
  ListMusic,
  Disc,
  Users,
  Sliders,
  Settings
} from 'lucide-react';

import { Song, Playlist, SearchAlbum, SearchArtist, SearchPlaylist, CategorizedSearchResults } from './types';
import { storeOfflineBlob, getOfflineBlob, deleteOfflineBlob } from './lib/offlineDb';
import { supabase, syncCloudPlaylists, fetchCloudPlaylists } from './lib/supabase';
import { extractPlaylistFromUrl } from './lib/playlistExtractor';
import { universalSearch, searchCategorized, fetchEntityTracks } from './lib/searchEngine';
import { AuthModal } from './components/AuthModal';
import { AuthGateway } from './components/AuthGateway';
import { SettingsModal } from './components/SettingsModal';
import { AudioScrubber } from './components/AudioScrubber';
import { mediaSessionController } from './lib/mediaSession';
import { fetchRealTrackCover, cacheImageLocally, downloadImageFile, enrichPlaylistTracks } from './lib/coverEngine';
import { fetchAudioStream, invalidateStream } from './lib/audioStreamEngine';
import { SilentHoldKeeper, GestureGuardian } from 'pwa-audio-player';
import { GenreCategory } from './lib/genresData';
import { GenreExploreGrid } from './components/GenreExploreGrid';
import { GenreDetailView } from './components/GenreDetailView';

// 10 Playlists Padrão Oficiais (Motor de Áudio Integral via YouTube Music Engine)
const INITIAL_PLAYLISTS: Playlist[] = [
  {
    id: "sp-pl-running",
    name: "Running",
    creator: "Able Player",
    cover: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&q=80",
    songs: [
      { id: "run-1", name: "Till I Collapse", artist: "Eminem, Nate Dogg", youtubeId: "ytQ5CYE1VZw", thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80", duration: 297 },
      { id: "run-2", name: "Can't Hold Us", artist: "Macklemore & Ryan Lewis", youtubeId: "2zNSgS797P8", thumbnail: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80", duration: 258 },
      { id: "run-3", name: "Lose Yourself", artist: "Eminem", youtubeId: "_Yhyp-_hX2s", thumbnail: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&q=80", duration: 326 },
      { id: "run-4", name: "Stronger", artist: "Kanye West", youtubeId: "PsO6Zn4Vjm8", thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80", duration: 312 }
    ]
  },
  {
    id: "sp-pl-cth-dance",
    name: "CTH 2.0 Dance",
    creator: "Able Player",
    cover: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80",
    songs: [
      { id: "dance-1", name: "Put Your Hands Up For Detroit", artist: "Fedde Le Grand", youtubeId: "SYs2HGYbr28", thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80", duration: 150 },
      { id: "dance-2", name: "Destination Calabria", artist: "Alex Gaudino", youtubeId: "Kq4OtRsdXLS", thumbnail: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80", duration: 182 },
      { id: "dance-3", name: "Satisfaction", artist: "Benny Benassi", youtubeId: "a0fkNdPiIL4", thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80", duration: 264 }
    ]
  },
  {
    id: "sp-pl-cth-2",
    name: "CTH 2.0",
    creator: "Able Player",
    cover: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&q=80",
    songs: [
      { id: "cth-1", name: "The Way I Am", artist: "Eminem", youtubeId: "mQvteoFiMlg", thumbnail: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&q=80", duration: 290 },
      { id: "cth-2", name: "POWER", artist: "Kanye West", youtubeId: "L53gjP-Tt2w", thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80", duration: 292 }
    ]
  },
  {
    id: "sp-pl-my-workout",
    name: "My Workout",
    creator: "Able Player",
    cover: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80",
    songs: [
      { id: "wod-1", name: "Remember the Name", artist: "Fort Minor", youtubeId: "VDvr08sCPOc", thumbnail: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80", duration: 230 },
      { id: "wod-2", name: "B.O.B. - Bombs Over Baghdad", artist: "Outkast", youtubeId: "lVHjCWvy4sc", thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80", duration: 304 },
      { id: "wod-3", name: "Bleed It Out", artist: "Linkin Park", youtubeId: "OnuuYcqhzCE", thumbnail: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80", duration: 164 }
    ]
  },
  {
    id: "sp-pl-barbecue-rock",
    name: "Barbecue Rock",
    creator: "Able Player",
    cover: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&q=80",
    songs: [
      { id: "rock-1", name: "Back in Black", artist: "AC/DC", youtubeId: "pAgnJDJN4VA", thumbnail: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&q=80", duration: 255 },
      { id: "rock-2", name: "Sweet Child O' Mine", artist: "Guns N' Roses", youtubeId: "1w7OgIMMRc4", thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80", duration: 356 },
      { id: "rock-3", name: "Smells Like Teen Spirit", artist: "Nirvana", youtubeId: "hTWKbfoikeg", thumbnail: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&q=80", duration: 301 }
    ]
  }
];

function getUserPlaylistStorageKey(userId?: string | null): string {
  if (!userId) return 'able_playlists_guest';
  return `able_playlists_${userId}`;
}

function loadInitialUserPlaylists(user: any): Playlist[] {
  if (!user?.id) {
    try {
      const stored = localStorage.getItem('able_playlists_guest');
      return stored ? JSON.parse(stored) : INITIAL_PLAYLISTS;
    } catch {
      return INITIAL_PLAYLISTS;
    }
  }

  const userKey = getUserPlaylistStorageKey(user.id);
  try {
    const stored = localStorage.getItem(userKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
    // Migração de compatibilidade retroativa para a conta pioneira do Alberto
    if (user.email === 'albertosarly@gmail.com') {
      const legacy = localStorage.getItem('able_playlists_v2');
      if (legacy) {
        const parsedLegacy = JSON.parse(legacy);
        if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
          try { localStorage.setItem(userKey, legacy); } catch {}
          return parsedLegacy;
        }
      }
    }
    // Qualquer novo perfil (login e senha diferente): biblioteca limpa e estritamente isolada
    return [];
  } catch {
    return [];
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'playlists' | 'downloads'>('home');

  // Usuário Conectado via Supabase (Persistência Imediata no Dispositivo para Zero Deslogamentos)
  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const stored = localStorage.getItem('montanha_music_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.id) return parsed;
      }
    } catch {}
    return null;
  });

  // Playlists State com Isolamento Estrito por Perfil (Cada usuário tem acesso APENAS às suas próprias músicas)
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    try {
      const storedUser = localStorage.getItem('montanha_music_user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      return loadInitialUserPlaylists(user);
    } catch {
      return INITIAL_PLAYLISTS;
    }
  });

  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);

  // Estado de Atualização de Capas Sequencial de Todas as Playlists do Perfil
  const [isEnrichingAllCovers, setIsEnrichingAllCovers] = useState(false);
  const [enrichAllProgress, setEnrichAllProgress] = useState<{ current: number; total: number; playlistName: string }>({
    current: 0,
    total: 0,
    playlistName: ''
  });

  // Audio State
  const [currentSong, setCurrentSong] = useState<Song>(() => playlists[0]?.songs[0] || INITIAL_PLAYLISTS[0].songs[0]);
  const activeSong: Song = currentSong || playlists[0]?.songs[0] || INITIAL_PLAYLISTS[0].songs[0];

  useEffect(() => {
    if (!currentSong && playlists[0]?.songs[0]) {
      setCurrentSong(playlists[0].songs[0]);
    }
  }, [playlists, currentSong]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [scrubbingTime, setScrubbingTime] = useState<number | null>(null);
  const [duration, setDuration] = useState<number>(297);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isRepeat, setIsRepeat] = useState<boolean>(false);
  const [queue, setQueue] = useState<Song[]>(() => playlists[0]?.songs || INITIAL_PLAYLISTS[0].songs);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const silentHoldRef = useRef<SilentHoldKeeper | null>(null);
  const gestureGuardianRef = useRef<GestureGuardian | null>(null);
  const isPlayingRef = useRef<boolean>(false);
  const userInitiatedPauseRef = useRef<boolean>(false);
  const isSwitchingRef = useRef<boolean>(false);
  const playRequestIdRef = useRef<number>(0);
  const handleNextSongRef = useRef<() => void>(() => {});
  const handlePrevSongRef = useRef<() => void>(() => {});
  const handlePlayRef = useRef<() => void>(() => {});
  const handlePauseRef = useRef<() => void>(() => {});
  const handleSeekRef = useRef<(t: number) => void>(() => {});
  const nextSongStreamRef = useRef<{ id: string; url: string; duration?: number } | null>(null);
  const originalQueueRef = useRef<Song[]>([]);
  const queueRef = useRef<Song[]>([]);
  const currentSongRef = useRef<Song>(currentSong);
  queueRef.current = queue;
  currentSongRef.current = currentSong;

  // Full Screen Player Sheet
  const [isFullScreenPlayer, setIsFullScreenPlayer] = useState<boolean>(false);

  // Search State Categorizado (Músicas, Álbuns, Artistas, Playlists)
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchCategory, setSearchCategory] = useState<'all' | 'songs' | 'albums' | 'artists' | 'playlists'>('all');
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [categorizedResults, setCategorizedResults] = useState<CategorizedSearchResults>({
    songs: [],
    albums: [],
    artists: [],
    playlists: []
  });
  // Gêneros Musicais & Descoberta Estilo eSound
  const [selectedGenre, setSelectedGenre] = useState<GenreCategory | null>(null);

  // Modal de Inspeção e Execução de Álbum / Playlist / Artista
  const [viewingEntity, setViewingEntity] = useState<{
    type: 'album' | 'playlist' | 'artist';
    name: string;
    subtitle?: string;
    cover: string;
    rawId?: string | number;
    songs: Song[];
    loading: boolean;
  } | null>(null);

  // Importador Universal (Spotify + YouTube / YouTube Music)
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [importLinkInput, setImportLinkInput] = useState<string>('');
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importProgressText, setImportProgressText] = useState<string>('');

  // Músicas Indisponíveis (Com Falha de Áudio na Fonte) & Fluxo de Substituição
  const [unavailableSongIds, setUnavailableSongIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('able_unavailable_songs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [replacingSongContext, setReplacingSongContext] = useState<{
    targetSong: Song;
    playlistId?: string;
  } | null>(null);

  const markSongUnavailable = (songId: string) => {
    setUnavailableSongIds((prev) => {
      if (prev.includes(songId)) return prev;
      const updated = [...prev, songId];
      try { localStorage.setItem('able_unavailable_songs', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const markSongAvailable = (songId: string) => {
    setUnavailableSongIds((prev) => {
      const updated = prev.filter((id) => id !== songId);
      try { localStorage.setItem('able_unavailable_songs', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const handleStartReplaceSong = (song: Song, playlistId?: string) => {
    setReplacingSongContext({ targetSong: song, playlistId });
    setActiveTab('search');
    setSearchQuery(`${song.name} ${song.artist}`);
    handleSearch(`${song.name} ${song.artist}`);
    showToast(`Buscando alternativas para "${song.name}". Escolha uma versão para substituir.`);
  };

  const handleApplySongReplacement = (newSong: Song) => {
    if (!replacingSongContext) return;
    const { targetSong, playlistId } = replacingSongContext;

    if (playlistId) {
      setPlaylists((prev) => {
        const updated = prev.map((pl) => {
          if (pl.id !== playlistId) return pl;
          const updatedSongs = pl.songs.map((s) => (s.id === targetSong.id ? newSong : s));
          return { ...pl, songs: updatedSongs };
        });
        if (currentUser?.id) {
          syncCloudPlaylists(currentUser.id, updated);
        }
        return updated;
      });

      if (selectedPlaylist && selectedPlaylist.id === playlistId) {
        setSelectedPlaylist((prev) =>
          prev ? { ...prev, songs: prev.songs.map((s) => (s.id === targetSong.id ? newSong : s)) } : null
        );
      }
    }

    markSongAvailable(targetSong.id);
    setReplacingSongContext(null);
    showToast(`"${newSong.name}" substituiu "${targetSong.name}" com sucesso!`);
  };

  // Contador de reproduções por música (Músicas Mais Tocadas da Conta)
  const [playCounts, setPlayCounts] = useState<Record<string, number>>(() => {
    try {
      const stored = localStorage.getItem('able_play_counts');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const isCloudLoadedRef = useRef(false);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);

  // Modal: Criar Playlist
  const [isCreatePlaylistModalOpen, setIsCreatePlaylistModalOpen] = useState<boolean>(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState<string>('');

  // Modal: Editar Playlist
  const [isEditPlaylistModalOpen, setIsEditPlaylistModalOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setEditPlaylistCover(reader.result);
          showToast('Imagem carregada com sucesso!');
        }
      };
      reader.readAsDataURL(file);
    }
  };
  const [editPlaylistTitle, setEditPlaylistTitle] = useState<string>('');
  const [editPlaylistCover, setEditPlaylistCover] = useState<string>('');
  const [playlistBeingEdited, setPlaylistBeingEdited] = useState<Playlist | null>(null);

  // Modal: Adicionar Música a uma Playlist
  const [isAddToPlaylistModalOpen, setIsAddToPlaylistModalOpen] = useState<boolean>(false);
  const [songToAddToPlaylist, setSongToAddToPlaylist] = useState<Song | null>(null);

  // Favorites & Downloads
  const [favoriteSongIds, setFavoriteSongIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('able_favorites') || '["run-1"]');
    } catch {
      return ["run-1"];
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

    // SUCESSO DE LOGIN / CADASTRO: CARREGAMENTO EXCLUSIVO DO PERFIL AUTENTICADO
  const handleAuthSuccess = async (user: any) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('montanha_music_user', JSON.stringify(user));
    } catch {}
    showToast(`Conectado como ${user.email}!`);

    const userKey = getUserPlaylistStorageKey(user.id);
    const cachedUserPls = loadInitialUserPlaylists(user);

    try {
      // 1. Tenta carregar playlists exclusivas deste perfil na nuvem
      const cloudPls = await fetchCloudPlaylists(user.id);
      if (cloudPls && Array.isArray(cloudPls) && cloudPls.length > 0) {
        setPlaylists(cloudPls);
        isCloudLoadedRef.current = true;
        try { localStorage.setItem(userKey, JSON.stringify(cloudPls)); } catch {}
      } else {
        // Usuário novo ou sem acervo na nuvem: define sua própria biblioteca isolada (NUNCA herda de outros)
        setPlaylists(cachedUserPls);
        isCloudLoadedRef.current = true;
        try { localStorage.setItem(userKey, JSON.stringify(cachedUserPls)); } catch {}
      }
    } catch (err) {
      console.warn('Erro ao carregar playlists da nuvem:', err);
      setPlaylists(cachedUserPls);
    }
  };

  // Forçar atualização manual da nuvem (1-Click Cloud Pull com Isolamento Estrito de Perfil)
  const handleForceCloudSync = async () => {
    if (!currentUser?.id) {
      showToast('Faça login para sincronizar suas playlists na nuvem.');
      return;
    }

    setIsSyncingCloud(true);
    showToast('Buscando suas playlists na nuvem...');
    try {
      const cloudPls = await fetchCloudPlaylists(currentUser.id);
      const userKey = getUserPlaylistStorageKey(currentUser.id);

      if (cloudPls && Array.isArray(cloudPls) && cloudPls.length > 0) {
        setPlaylists(cloudPls);
        isCloudLoadedRef.current = true;
        try { localStorage.setItem(userKey, JSON.stringify(cloudPls)); } catch {}
        showToast(`🎉 ${cloudPls.length} playlists sincronizadas do seu perfil!`);
      } else {
        if (playlists.length > 0) {
          // Se o usuário já criou playlists locais neste perfil, sobe para sua nuvem
          await syncCloudPlaylists(currentUser.id, playlists);
          showToast(`Playlists enviadas para a sua nuvem! (${playlists.length} playlists)`);
        } else {
          showToast('Nenhuma playlist encontrada na sua conta.');
        }
      }
    } catch {
      showToast('Erro ao sincronizar da nuvem. Verifique a conexão.');
    } finally {
      setIsSyncingCloud(false);
    }
  };

  // Inicialização de Sessão Supabase com Isolamento Estrito de Perfil
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u = session.user;
        setCurrentUser(u);
        try { localStorage.setItem('montanha_music_user', JSON.stringify(u)); } catch {}
        if (u.user_metadata?.able_play_counts) {
          setPlayCounts((prev) => ({ ...prev, ...u.user_metadata.able_play_counts }));
        }

        const userKey = getUserPlaylistStorageKey(u.id);
        fetchCloudPlaylists(u.id).then((cloudPls) => {
          if (cloudPls && Array.isArray(cloudPls) && cloudPls.length > 0) {
            setPlaylists(cloudPls);
            isCloudLoadedRef.current = true;
            try { localStorage.setItem(userKey, JSON.stringify(cloudPls)); } catch {}
          }
        }).catch(() => {});
      }
    }).catch(console.warn);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        try { localStorage.removeItem('montanha_music_user'); } catch {}
        // Limpa a tela imediatamente ao deslogar para não vazar faixas para outro perfil
        setPlaylists([]);
        isCloudLoadedRef.current = false;
        showToast('Sessão encerrada com segurança.');
      } else if (session?.user) {
        const u = session.user;
        setCurrentUser(u);
        try { localStorage.setItem('montanha_music_user', JSON.stringify(u)); } catch {}
        if (u.user_metadata?.able_play_counts) {
          setPlayCounts((prev) => ({ ...prev, ...u.user_metadata.able_play_counts }));
        }

        const userKey = getUserPlaylistStorageKey(u.id);
        fetchCloudPlaylists(u.id).then((cloudPls) => {
          if (cloudPls && Array.isArray(cloudPls) && cloudPls.length > 0) {
            setPlaylists(cloudPls);
            isCloudLoadedRef.current = true;
            try { localStorage.setItem(userKey, JSON.stringify(cloudPls)); } catch {}
          }
        }).catch(() => {});
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Músicas em Destaque (Lista de Referência Estável do Acervo Montanha)
  const featuredSongs = useMemo(() => {
    const allSongsMap = new Map<string, Song>();
    playlists.forEach((p) => {
      (p.songs || []).forEach((s) => {
        if (!allSongsMap.has(s.id)) {
          allSongsMap.set(s.id, s);
        }
      });
    });
    return Array.from(allSongsMap.values()).slice(0, 9);
  }, [playlists]);

  // Persistência Imediata de Playlists no LocalStorage e Nuvem Isolada por Perfil
  useEffect(() => {
    const userKey = getUserPlaylistStorageKey(currentUser?.id);
    try {
      localStorage.setItem(userKey, JSON.stringify(playlists));
    } catch {}

    // TRAVA ANTI-ZERAMENTO & ISOLAMENTO: Sincroniza na nuvem estritamente se houver usuário autenticado
    if (currentUser?.id && playlists.length > 0 && isCloudLoadedRef.current) {
      syncCloudPlaylists(currentUser.id, playlists);
    }
  }, [playlists, currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem('able_favorites', JSON.stringify(favoriteSongIds));
    } catch {}
  }, [favoriteSongIds]);

  useEffect(() => {
    try {
      localStorage.setItem('able_downloads', JSON.stringify(downloadedSongs));
    } catch {}
  }, [downloadedSongs]);

  // Histórico e Botão Físico/Virtual Voltar (Navegação Segura no Mobile)
  useEffect(() => {
    const handlePopState = () => {
      if (isQueueOpen) {
        setIsQueueOpen(false);
      } else if (isFullScreenPlayer) {
        setIsFullScreenPlayer(false);
      } else if (isSettingsModalOpen) {
        setIsSettingsModalOpen(false);
      } else if (isAuthModalOpen) {
        setIsAuthModalOpen(false);
      } else if (selectedPlaylist) {
        setSelectedPlaylist(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectedPlaylist, isFullScreenPlayer, isQueueOpen, isAuthModalOpen, isSettingsModalOpen]);

  // Tecla Escape para Fechamento Rápido no Desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isQueueOpen) setIsQueueOpen(false);
        if (isFullScreenPlayer) setIsFullScreenPlayer(false);
        if (isSettingsModalOpen) setIsSettingsModalOpen(false);
        if (isAuthModalOpen) setIsAuthModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isQueueOpen, isFullScreenPlayer, isAuthModalOpen, isSettingsModalOpen]);

  // Screen Wake Lock API (Evita que a tela do celular apague sozinha durante o treino / reprodução)
  useEffect(() => {
    let wakeLockSentinel: any = null;

    const requestWakeLock = async () => {
      if ('wakeLock' in navigator && isPlaying) {
        try {
          wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
        } catch {}
      }
    };

    if (isPlaying) {
      requestWakeLock();
    } else if (wakeLockSentinel) {
      try {
        wakeLockSentinel.release();
        wakeLockSentinel = null;
      } catch {}
    }

    return () => {
      if (wakeLockSentinel) {
        try { wakeLockSentinel.release(); } catch {}
      }
    };
  }, [isPlaying]);

  // Manutenção Contínua de Áudio em Background ao Travar a Tela do Celular (Android / iOS)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        // Ao apagar a tela ou alternar app: garante que o elemento de áudio continue ativo
        if (isPlayingRef.current && !userInitiatedPauseRef.current) {
          if (audioRef.current && audioRef.current.paused && audioRef.current.src) {
            audioRef.current.play().catch(() => {});
          }
        }
      } else {
        // Ao reativar a tela: garante sincronia perfeita
        if (isPlayingRef.current && !userInitiatedPauseRef.current) {
          if (audioRef.current && audioRef.current.paused && audioRef.current.src) {
            audioRef.current.play().catch(() => {});
          }
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
    };
  }, []);

  // Inicialização do SilentHoldKeeper (Blindagem de Hardware Audio Session no Mobile PWA)
  useEffect(() => {
    if (audioRef.current && !silentHoldRef.current) {
      try {
        silentHoldRef.current = new SilentHoldKeeper(
          audioRef.current,
          {
            strategy: 'silent-hold',
            hardPauseTimeoutMs: 15 * 60 * 1000
          },
          {
            onKeepAliveEnter: () => {
              mediaSessionController.updatePlaybackState(false);
            },
            onKeepAliveExit: () => {
              mediaSessionController.updatePlaybackState(true);
            }
          }
        );
        gestureGuardianRef.current = new GestureGuardian();
      } catch (err) {
        console.warn('Erro ao inicializar SilentHoldKeeper:', err);
      }
    }
  }, []);

  // Sincronização em Tempo Real do Progresso de Áudio (Auto-avanço gerenciado exclusivamente pelo onEnded nativo)
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        if (audioRef.current && !audioRef.current.paused) {
          const cur = Math.floor(audioRef.current.currentTime);
          setCurrentTime(cur);
          if (audioRef.current.duration) {
            const dur = Math.floor(audioRef.current.duration);
            if (dur > 0 && dur !== duration) {
              setDuration(dur);
            }
          }
        }
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  // Sincronização Imediata de Volume e Mute no <audio>
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPwa = async () => {
    if (!deferredPrompt) {
      showToast('No Edge/Chrome, clique nos 3 pontos e em "Instalar Aplicativo" ou "Adicionar à Tela de Início"');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
      showToast('Able Music Player instalado com sucesso!');
    }
    setDeferredPrompt(null);
  };

  // Suporte a MediaSession API (Tela Bloqueada, Fones de Ouvido, Notificação no Celular)
  useEffect(() => {
    if (currentSong) {
      mediaSessionController.updateMetadata({
        title: currentSong.name,
        artist: currentSong.artist,
        album: currentSong.album || 'Able Music',
        artworkUrl: currentSong.thumbnail
      });
    }
  }, [currentSong]);

  const handlePlay = () => {
    userInitiatedPauseRef.current = false;
    setIsPlaying(true);
    isPlayingRef.current = true;
    mediaSessionController.updatePlaybackState(true);

    // 1. Se estiver retido no SilentHoldKeeper, retoma a música real imediatamente
    if (silentHoldRef.current?.isHolding()) {
      const resumed = silentHoldRef.current.handleResume(() => {
        setIsPlaying(true);
        isPlayingRef.current = true;
        mediaSessionController.updatePlaybackState(true);
      });
      if (resumed) return;
    }

    // 2. Prioridade absoluta para o motor de áudio nativo HTML5 (background-safe)
    if (audioRef.current && audioRef.current.src) {
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.play().catch(() => {
        if (currentSong) playSong(currentSong);
      });
      return;
    }

    if (currentSong) {
      playSong(currentSong);
    }
  };

  const handlePause = () => {
    userInitiatedPauseRef.current = true;
    setIsPlaying(false);
    isPlayingRef.current = false;
    mediaSessionController.updatePlaybackState(false);

    // 1. Interceptação pelo SilentHoldKeeper: evita CoreAudio decoder eviction no Android/iOS
    if (audioRef.current && silentHoldRef.current) {
      const handled = silentHoldRef.current.handlePause(
        currentSong ? { id: currentSong.id, title: currentSong.name, artist: currentSong.artist, src: audioRef.current.src } : null,
        currentTime,
        duration,
        audioRef.current.src
      );
      if (handled) {
        return;
      }
    }

    if (audioRef.current) {
      try { audioRef.current.pause(); } catch {}
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  };

  handlePlayRef.current = handlePlay;
  handlePauseRef.current = handlePause;

  // Registro único dos handlers MediaSession e AudioSession (evita re-binding e quedas de sessão no SO)
  useEffect(() => {
    if ('audioSession' in navigator) {
      try {
        (navigator as any).audioSession.type = 'playback';
      } catch {}
    }

    mediaSessionController.setupActionHandlers({
      onPlay: () => handlePlayRef.current(),
      onPause: () => handlePauseRef.current(),
      onPrevious: () => handlePrevSongRef.current(),
      onNext: () => handleNextSongRef.current(),
      onSeekTo: (details) => {
        if (details.seekTime !== undefined) handleSeekRef.current(details.seekTime);
      }
    });
  }, []);

  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime);
    if (silentHoldRef.current?.isHolding()) {
      silentHoldRef.current.updateSavedPauseTime(newTime);
    }
    if (audioRef.current && audioRef.current.src) {
      audioRef.current.currentTime = newTime;
    }
    mediaSessionController.updatePositionState({
      duration,
      position: newTime,
      playbackRate: 1
    });
  };
  handleSeekRef.current = handleSeek;

  const takePreloaded = (songId: string) => {
    if (nextSongStreamRef.current && nextSongStreamRef.current.id === songId) {
      const s = nextSongStreamRef.current;
      nextSongStreamRef.current = null;
      return s;
    }
    return null;
  };

  const preloadTimeoutRef = useRef<any>(null);
  const schedulePreload = (currentSongItem: Song) => {
    if (preloadTimeoutRef.current) clearTimeout(preloadTimeoutRef.current);
    preloadTimeoutRef.current = setTimeout(() => {
      const currentQ = queueRef.current;
      if (currentQ.length <= 1) return;
      const currentIdx = currentQ.findIndex((s) => s.id === currentSongItem.id);
      const nextIdx = (currentIdx + 1) % currentQ.length;
      const nextSong = currentQ[nextIdx];
      if (!nextSong || unavailableSongIds.includes(nextSong.id)) return;

      fetchAudioStream(nextSong.youtubeId, nextSong.name, nextSong.artist, nextSong.audioUrl)
        .then((ns) => {
          if (ns?.url) {
            nextSongStreamRef.current = { id: nextSong.id, url: ns.url, duration: ns.duration };
          }
        })
        .catch(() => {});
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (preloadTimeoutRef.current) clearTimeout(preloadTimeoutRef.current);
    };
  }, []);

  // Motor Unificado Padrão Montanha Music Lab (HTML5 Audio com Streaming 320kbps e Background-Safe)
  const playSong = async (song: Song, newQueue?: Song[], retry = 0) => {
    const audio = audioRef.current;
    if (!audio) return;
    const reqId = ++playRequestIdRef.current;
    isSwitchingRef.current = true;
    userInitiatedPauseRef.current = false;

    setCurrentSong(song);
    setCurrentTime(0);
    if (newQueue) setQueue(newQueue);
    showToast(`Tocando: ${song.name}`);

    // Atualização imperativa e imediata dos metadados da MediaSession
    mediaSessionController.updateMetadata({
      title: song.name,
      artist: song.artist,
      album: song.album || 'Able Music',
      artworkUrl: song.thumbnail,
    });
    mediaSessionController.updatePlaybackState(true);
    mediaSessionController.updatePositionState({
      duration: song.duration || 210,
      position: 0,
      playbackRate: 1,
    });

    // Incrementa contador de reprodução para Músicas em Destaque
    setPlayCounts((prev) => {
      const updated = { ...prev, [song.id]: (prev[song.id] || 0) + 1 };
      try {
        localStorage.setItem('able_play_counts', JSON.stringify(updated));
      } catch {}
      if (currentUser?.id) {
        supabase.auth.updateUser({
          data: { able_play_counts: updated }
        }).catch(() => {});
      }
      return updated;
    });

    // 1. TENTA REPRODUÇÃO OFFLINE A PARTIR DO INDEXEDDB
    const offlineBlob = await getOfflineBlob(song.id);
    if (reqId !== playRequestIdRef.current) return;
    if (offlineBlob) {
      try {
        const blobUrl = URL.createObjectURL(offlineBlob);
        audio.src = blobUrl;
        audio.volume = isMuted ? 0 : volume;
        schedulePreload(song);
        await audio.play();
        return;
      } catch (err: any) {
        if (err?.name !== 'AbortError') console.warn('Erro ao reproduzir blob offline:', err);
      }
    }

    // 2. CONSUMO DA FAIXA PRÉ-RESOLVIDA (Síncrono sem delay de rede)
    let streamUrl: string | null = null;
    let streamDuration: number | undefined = undefined;

    const preloaded = takePreloaded(song.id);
    if (preloaded) {
      streamUrl = preloaded.url;
      streamDuration = preloaded.duration;
    } else {
      try {
        const res = await fetchAudioStream(song.youtubeId, song.name, song.artist, song.audioUrl);
        if (res?.url) {
          streamUrl = res.url;
          streamDuration = res.duration;
        }
      } catch {}
      if (reqId !== playRequestIdRef.current) return;
    }

    if (!streamUrl) {
      // Rejeita terminantemente previews de 30s da Deezer / Apple
      const isPreview = (url?: string) =>
        Boolean(url && (url.includes('preview') || url.includes('dzcdn.net') || url.includes('apple.com') || url.includes('mzstatic')));

      if (song.audioUrl && !isPreview(song.audioUrl)) {
        streamUrl = song.audioUrl;
        streamDuration = song.duration || 210;
      } else {
        markSongUnavailable(song.id);
        isSwitchingRef.current = false;
        showToast(`"${song.name}" está indisponível na fonte. Toque em "Substituir por semelhante".`);
        return;
      }
    }

    audio.src = streamUrl;
    audio.currentTime = 0;
    audio.volume = isMuted ? 0 : volume;
    if (streamDuration) {
      setDuration(streamDuration);
    }

    // Dispara preload antecipado da faixa seguinte (N+1) imediatamente
    schedulePreload(song);

    try {
      await audio.play();
    } catch (err: any) {
      if (reqId !== playRequestIdRef.current) return;
      invalidateStream(song);

      if (err?.name === 'AbortError') return;
      if (err?.name === 'NotAllowedError') {
        setIsPlaying(false);
        isPlayingRef.current = false;
        mediaSessionController.updatePlaybackState(false);
        isSwitchingRef.current = false;
        return;
      }

      if (retry < 1) {
        return playSong(song, undefined, retry + 1);
      }
      console.warn('Erro ao reproduzir stream após retry:', err);
      isSwitchingRef.current = false;
    }
  };

  const handleNextSong = () => {
    if (isRepeat) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      return;
    }
    const currentQ = queueRef.current;
    if (currentQ.length === 0) return;
    const currentIdx = currentQ.findIndex((s) => s.id === currentSongRef.current?.id);
    let nextIdx = currentIdx + 1;
    if (nextIdx >= currentQ.length || nextIdx < 0) nextIdx = 0;
    const nextSong = currentQ[nextIdx];
    if (nextSong) {
      playSong(nextSong);
    }
  };

  handleNextSongRef.current = handleNextSong;

  const handlePrevSong = () => {
    const currentQ = queueRef.current;
    if (currentQ.length === 0) return;
    const currentIdx = currentQ.findIndex((s) => s.id === currentSongRef.current?.id);
    let prevIdx = currentIdx - 1;
    if (prevIdx < 0) prevIdx = currentQ.length - 1;
    const prevSong = currentQ[prevIdx];
    if (prevSong) {
      playSong(prevSong);
    }
  };
  handlePrevSongRef.current = handlePrevSong;

  // BOTÃO SHUFFLE REAL: Embaralha imediatamente a fila de execução visível
  const toggleShuffle = () => {
    const nextShuffle = !isShuffle;
    setIsShuffle(nextShuffle);

    if (nextShuffle) {
      originalQueueRef.current = [...queue];
      const current = currentSong;
      const rest = queue.filter((s) => s.id !== current.id);
      for (let i = rest.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rest[i], rest[j]] = [rest[j], rest[i]];
      }
      const shuffledQueue = [current, ...rest];
      setQueue(shuffledQueue);
      showToast('Modo aleatório ativado: fila embaralhada!');
    } else {
      if (originalQueueRef.current.length > 0) {
        setQueue(originalQueueRef.current);
      }
      showToast('Ordem sequencial restaurada.');
    }
  };

  // Gerenciamento da Fila de Reprodução (Queue)
  const handleAddToQueue = (song: Song) => {
    setQueue((prev) => [...prev, song]);
    showToast(`"${song.name}" adicionada à fila!`);
  };

  const handleRemoveFromQueue = (indexToRemove: number) => {
    setQueue((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleClearQueue = () => {
    if (currentSong) {
      setQueue([currentSong]);
      showToast('Fila limpa.');
    }
  };

  const toggleFavorite = (songId: string) => {
    setFavoriteSongIds((prev) => {
      const exists = prev.includes(songId);
      const updated = exists ? prev.filter((id) => id !== songId) : [...prev, songId];
      showToast(exists ? 'Removida dos favoritos' : 'Adicionada aos favoritos');
      return updated;
    });
  };

  // DOWNLOAD REAL SEGURO PARA DISPOSITIVOS MÓVEIS & DESKTOP (INDEXEDDB BLOB)
  const handleDownloadSong = async (song: Song) => {
    showToast(`Baixando "${song.name}" para offline...`);

    const isPreview = (url?: string) =>
      Boolean(url && (url.includes('preview') || url.includes('dzcdn.net') || url.includes('apple.com') || url.includes('mzstatic')));

    let audioSourceUrl: string | null = null;
    if (song.audioUrl && !isPreview(song.audioUrl)) {
      audioSourceUrl = song.audioUrl;
    } else {
      try {
        const streamRes = await fetchAudioStream(song.youtubeId, song.name, song.artist);
        if (streamRes?.url) {
          audioSourceUrl = streamRes.url;
        }
      } catch {}
    }

    if (audioSourceUrl) {
      try {
        const resp = await fetch(audioSourceUrl);
        if (resp.ok) {
          const blob = await resp.blob();
          await storeOfflineBlob(song.id, blob);
          
          // Dispara download local via Blob (Evita 100% de erro da Akamai / EdgeSuite!)
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = `${song.name} - ${song.artist}.mp3`;
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            try { document.body.removeChild(a); URL.revokeObjectURL(blobUrl); } catch {}
          }, 300);
        }
      } catch (err) {
        console.warn('Erro ao obter blob:', err);
      }
    }

    setDownloadedSongs((prev) => {
      if (prev.some((s) => s.id === song.id)) return prev;
      const updated = [song, ...prev];
      try { localStorage.setItem('able_downloads', JSON.stringify(updated)); } catch {}
      return updated;
    });

    showToast(`"${song.name}" salva com sucesso para offline!`);
  };

  // EXCLUIR MÚSICA DOS DOWNLOADS OFFLINE
  const handleDeleteDownloadedSong = async (songId: string) => {
    await deleteOfflineBlob(songId);
    setDownloadedSongs((prev) => {
      const updated = prev.filter((s) => s.id !== songId);
      try { localStorage.setItem('able_downloads', JSON.stringify(updated)); } catch {}
      return updated;
    });
    showToast('Música removida dos downloads.');
  };

  // DOWNLOAD DE PLAYLIST COMPLETA
  const handleDownloadPlaylist = async (playlist: Playlist) => {
    if (!playlist.songs || playlist.songs.length === 0) {
      showToast('A playlist está vazia!');
      return;
    }

    showToast(`Iniciando download de ${playlist.songs.length} faixas de "${playlist.name}"...`);

    setDownloadedSongs((prev) => {
      const existingIds = new Set(prev.map(s => s.id));
      const newItems = playlist.songs.filter(s => !existingIds.has(s.id));
      const updated = [...newItems, ...prev];
      try { localStorage.setItem('able_downloads', JSON.stringify(updated)); } catch {}
      return updated;
    });

    const isPreview = (url?: string) =>
      Boolean(url && (url.includes('preview') || url.includes('dzcdn.net') || url.includes('apple.com') || url.includes('mzstatic')));

    for (let i = 0; i < playlist.songs.length; i++) {
      const song = playlist.songs[i];
      let streamUrl: string | null = null;
      if (song.audioUrl && !isPreview(song.audioUrl)) {
        streamUrl = song.audioUrl;
      } else {
        try {
          const streamRes = await fetchAudioStream(song.youtubeId, song.name, song.artist);
          if (streamRes?.url) streamUrl = streamRes.url;
        } catch {}
      }

      if (streamUrl && !isPreview(streamUrl)) {
        try {
          const resp = await fetch(streamUrl);
          if (resp.ok) {
            const blob = await resp.blob();
            await storeOfflineBlob(song.id, blob);
          }
        } catch {}
      }
    }

    showToast(`Todas as faixas de "${playlist.name}" foram salvas offline!`);
  };

  // CRIAR PLAYLIST PRÓPRIA
  const handleCreateNewPlaylist = () => {
    const title = newPlaylistTitle.trim() || `Minha Playlist #${playlists.length + 1}`;
    const newPl: Playlist = {
      id: `custom-pl-${Date.now()}`,
      name: title,
      creator: currentUser?.email ? currentUser.email.split('@')[0] : 'Você',
      cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
      songs: [],
      isCustom: true
    };

    setPlaylists((prev) => [newPl, ...prev]);
    setNewPlaylistTitle('');
    setIsCreatePlaylistModalOpen(false);
    setSelectedPlaylist(newPl);
    showToast(`Playlist "${newPl.name}" criada com sucesso!`);
  };

  // EDITAR PLAYLIST
  const handleOpenEditPlaylist = (pl: Playlist) => {
    setPlaylistBeingEdited(pl);
    setEditPlaylistTitle(pl.name);
    setEditPlaylistCover(pl.cover);
    setIsEditPlaylistModalOpen(true);
  };

  const handleSaveEditPlaylist = () => {
    if (!playlistBeingEdited) return;
    const updatedTitle = editPlaylistTitle.trim() || playlistBeingEdited.name;
    const updatedCover = editPlaylistCover.trim() || playlistBeingEdited.songs[0]?.thumbnail || playlistBeingEdited.cover;

    setPlaylists((prev) =>
      prev.map((pl) =>
        pl.id === playlistBeingEdited.id
          ? { ...pl, name: updatedTitle, cover: updatedCover }
          : pl
      )
    );

    if (selectedPlaylist?.id === playlistBeingEdited.id) {
      setSelectedPlaylist({ ...selectedPlaylist, name: updatedTitle, cover: updatedCover });
    }

    setIsEditPlaylistModalOpen(false);
    setPlaylistBeingEdited(null);
    showToast('Playlist atualizada com sucesso!');
  };

  // EXCLUIR PLAYLIST (Qualquer Playlist)
  const handleDeletePlaylist = (playlistId: string) => {
    setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
    setSelectedPlaylist(null);
    showToast('Playlist excluída com sucesso.');
  };

  // ENRIQUECER E ATUALIZAR CAPAS DAS MÚSICAS DA PLAYLIST COM CAPAS REAIS DE SINGLE/ÁLBUM EM HD
  const [isEnrichingCovers, setIsEnrichingCovers] = useState(false);
  const handleEnrichCurrentPlaylistCovers = async () => {
    if (!selectedPlaylist || selectedPlaylist.songs.length === 0) return;
    setIsEnrichingCovers(true);
    showToast('Buscando capas oficiais em HD para cada música...');

    try {
      const enriched = await enrichPlaylistTracks(selectedPlaylist, (done, total) => {
        if (done % 5 === 0 || done === total) {
          showToast(`Atualizando capas: ${done}/${total}...`);
        }
      });

      setSelectedPlaylist(enriched);
      const nextPlaylists = playlists.map((p) => (p.id === enriched.id ? enriched : p));
      setPlaylists(nextPlaylists);
      try {
        const userKey = getUserPlaylistStorageKey(currentUser?.id);
        localStorage.setItem(userKey, JSON.stringify(nextPlaylists));
      } catch {}
      if (currentUser?.id) {
        await syncCloudPlaylists(currentUser.id, nextPlaylists);
      }
      showToast(`🎉 Capas oficiais atualizadas para ${enriched.songs.length} faixas!`);
    } catch {
      showToast('Erro ao atualizar capas. Tente novamente.');
    } finally {
      setIsEnrichingCovers(false);
    }
  };

  // ENRIQUECER E ATUALIZAR CAPAS DE TODAS AS PLAYLISTS DO PERFIL SEQUENCIALMENTE
  const handleEnrichAllPlaylistsCovers = async () => {
    if (playlists.length === 0) {
      showToast('Nenhuma playlist para atualizar capas.');
      return;
    }
    if (isEnrichingAllCovers) return;

    setIsEnrichingAllCovers(true);
    showToast(`Iniciando atualização de capas em sequência para ${playlists.length} playlists...`);

    try {
      const updatedPlaylists = [...playlists];
      for (let i = 0; i < updatedPlaylists.length; i++) {
        const pl = updatedPlaylists[i];
        setEnrichAllProgress({
          current: i + 1,
          total: updatedPlaylists.length,
          playlistName: pl.name
        });
        showToast(`(${i + 1}/${updatedPlaylists.length}) Atualizando capas: "${pl.name}"...`);

        if (pl.songs && pl.songs.length > 0) {
          const enriched = await enrichPlaylistTracks(pl, (done, total) => {
            if (done === total || done % 10 === 0) {
              console.log(`[Cover Engine] Playlist "${pl.name}": ${done}/${total} faixas processadas.`);
            }
          });
          updatedPlaylists[i] = enriched;
          setPlaylists([...updatedPlaylists]);
          if (selectedPlaylist && selectedPlaylist.id === enriched.id) {
            setSelectedPlaylist(enriched);
          }
        }
        // Intervalo de segurança amigável entre playlists
        await new Promise((resolve) => setTimeout(resolve, 400));
      }

      // Persistência local no perfil
      const userKey = getUserPlaylistStorageKey(currentUser?.id);
      try {
        localStorage.setItem(userKey, JSON.stringify(updatedPlaylists));
      } catch {}

      // Sincronização em nuvem Supabase
      if (currentUser?.id) {
        showToast('Salvando alterações na nuvem...');
        await syncCloudPlaylists(currentUser.id, updatedPlaylists);
      }

      showToast(`🎉 Concluído! Todas as capas das ${updatedPlaylists.length} playlists foram atualizadas.`);
    } catch (err) {
      console.error('[Cover Engine Error]', err);
      showToast('Erro ao atualizar capas de algumas playlists.');
    } finally {
      setIsEnrichingAllCovers(false);
      setEnrichAllProgress({ current: 0, total: 0, playlistName: '' });
    }
  };

  // ADICIONAR MÚSICA A UMA PLAYLIST
  const handleAddSongToTargetPlaylist = (targetPlaylistId: string) => {
    if (!songToAddToPlaylist) return;

    setPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id === targetPlaylistId) {
          if (pl.songs.some((s) => s.id === songToAddToPlaylist.id)) {
            showToast(`"${songToAddToPlaylist.name}" já está nesta playlist!`);
            return pl;
          }
          const nextSongs = [...pl.songs, songToAddToPlaylist];
          showToast(`"${songToAddToPlaylist.name}" adicionada a "${pl.name}"!`);
          return { ...pl, songs: nextSongs };
        }
        return pl;
      })
    );

    setIsAddToPlaylistModalOpen(false);
    setSongToAddToPlaylist(null);
  };

  // REMOVER MÚSICA DE UMA PLAYLIST
  const handleRemoveSongFromPlaylist = (playlistId: string, songId: string) => {
    setPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id === playlistId) {
          return { ...pl, songs: pl.songs.filter((s) => s.id !== songId) };
        }
        return pl;
      })
    );

    if (selectedPlaylist?.id === playlistId) {
      setSelectedPlaylist({
        ...selectedPlaylist,
        songs: selectedPlaylist.songs.filter((s) => s.id !== songId)
      });
    }

    showToast('Música removida da playlist.');
  };

  // IMPORTAÇÃO UNIVERSAL POR LINK (SPOTIFY OU YOUTUBE)
  const handleImportByUrl = async () => {
    if (!importLinkInput.trim() || isImporting) return;
    setIsImporting(true);
    setImportProgressText('Conectando ao Spotify / YouTube...');

    try {
      setImportProgressText('Lendo metadados e faixas da playlist...');
      const extracted = await extractPlaylistFromUrl(importLinkInput.trim());
      if (extracted && extracted.songs && extracted.songs.length > 0) {
        const nextPlaylists = [extracted, ...playlists];
        setPlaylists(nextPlaylists);
        try {
          const userKey = getUserPlaylistStorageKey(currentUser?.id);
          localStorage.setItem(userKey, JSON.stringify(nextPlaylists));
        } catch {}
        if (currentUser?.id) {
          isCloudLoadedRef.current = true;
          syncCloudPlaylists(currentUser.id, nextPlaylists);
        }
        setIsImportModalOpen(false);
        setImportLinkInput('');
        setSelectedPlaylist(extracted);
        showToast(`Playlist "${extracted.name}" importada com sucesso (${extracted.songs.length} faixas)!`);
        return;
      } else {
        showToast('Não foi possível importar faixas. Verifique se a playlist é pública.');
      }
    } catch (e: any) {
      console.warn('Erro ao extrair playlist:', e);
      showToast('Falha na importação. Tente novamente com o link público da playlist.');
    } finally {
      setIsImporting(false);
    }
  };

  // BUSCA CATEGORIZADA (Músicas, Álbuns, Artistas e Playlists)
  const handleSearch = async (
    query: string,
    cat: 'all' | 'songs' | 'albums' | 'artists' | 'playlists' = searchCategory
  ) => {
    const q = query.trim();
    if (!q) {
      setSearchResults([]);
      setCategorizedResults({ songs: [], albums: [], artists: [], playlists: [] });
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    try {
      const results = await searchCategorized(q, cat);
      setCategorizedResults(results);
      setSearchResults(results.songs || []);
      
      if (
        (results.songs && results.songs.length > 0) ||
        (results.albums && results.albums.length > 0) ||
        (results.artists && results.artists.length > 0) ||
        (results.playlists && results.playlists.length > 0)
      ) {
        setIsSearching(false);
        return;
      }
    } catch {}

    // Fallback: Busca nas playlists locais da biblioteca do usuário
    const allSongs = playlists.flatMap((p) => p.songs);
    const filteredSongs = allSongs.filter(
      (s) =>
        s.name.toLowerCase().includes(q.toLowerCase()) ||
        s.artist.toLowerCase().includes(q.toLowerCase())
    );
    const filteredPlaylists: SearchPlaylist[] = playlists
      .filter((p) => p.name.toLowerCase().includes(q.toLowerCase()))
      .map((p) => ({
        id: p.id,
        rawId: p.id,
        name: p.name,
        creator: p.creator || 'Você',
        cover: p.cover,
        trackCount: p.songs.length
      }));

    setSearchResults(filteredSongs);
    setCategorizedResults({
      songs: filteredSongs,
      albums: [],
      artists: [],
      playlists: filteredPlaylists
    });
    setIsSearching(false);
  };

  // Abre detalhes de um Álbum, Artista ou Playlist encontrada
  const handleOpenEntity = async (entity: {
    type: 'album' | 'playlist' | 'artist';
    name: string;
    subtitle?: string;
    cover: string;
    rawId?: string | number;
    tracks?: Song[];
  }) => {
    // 1. Se as faixas já foram fornecidas (ex: playlists de referência com faixas predefinidas), carrega instantaneamente
    if (entity.tracks && entity.tracks.length > 0) {
      setViewingEntity({
        ...entity,
        songs: entity.tracks,
        loading: false
      });
      return;
    }

    setViewingEntity({
      ...entity,
      songs: [],
      loading: true
    });

    try {
      if (entity.rawId) {
        const tracks = await fetchEntityTracks(entity.rawId, entity.type, entity.name);
        if (tracks && tracks.length > 0) {
          setViewingEntity((prev) => (prev ? { ...prev, songs: tracks, loading: false } : null));
          return;
        }
      }

      // Procura por ID ou Nome nas playlists locais do usuário
      const local = playlists.find((p) => p.id === entity.name || p.name === entity.name);
      if (local && local.songs && local.songs.length > 0) {
        setViewingEntity((prev) => (prev ? { ...prev, songs: local.songs, loading: false } : null));
        return;
      }

      // Fallback Inteligente: Busca online faixas correspondentes ao nome da playlist no Deezer/iTunes
      const searchRes = await searchCategorized(entity.name, 'songs');
      if (searchRes.songs && searchRes.songs.length > 0) {
        setViewingEntity((prev) => (prev ? { ...prev, songs: searchRes.songs, loading: false } : null));
        return;
      }

      // Fallback de Contingência: Se ainda vazio, usa as músicas do gênero atual
      if (selectedGenre && selectedGenre.topTracks && selectedGenre.topTracks.length > 0) {
        setViewingEntity((prev) => (prev ? { ...prev, songs: selectedGenre.topTracks, loading: false } : null));
        return;
      }

      setViewingEntity((prev) => (prev ? { ...prev, loading: false } : null));
    } catch {
      setViewingEntity((prev) => (prev ? { ...prev, loading: false } : null));
    }
  };

  // Toca todas as faixas da entidade aberta
  const handlePlayEntityAll = (entity: { name: string; songs: Song[] }) => {
    if (!entity.songs || entity.songs.length === 0) {
      showToast('Nenhuma faixa disponível para reprodução.');
      return;
    }
    setQueue(entity.songs);
    playSong(entity.songs[0], entity.songs);
    showToast(`Tocando ${entity.songs.length} faixas de "${entity.name}"!`);
  };

  // Reprodução em lote para Gêneros Estilo eSound
  const handlePlayAllGenre = (tracks: Song[]) => {
    if (!tracks || tracks.length === 0) {
      showToast('Nenhuma música encontrada neste gênero.');
      return;
    }
    setQueue(tracks);
    playSong(tracks[0], tracks);
    showToast(`Tocando ${tracks.length} músicas deste gênero!`);
  };

  const handleShufflePlayGenre = (tracks: Song[]) => {
    if (!tracks || tracks.length === 0) {
      showToast('Nenhuma música encontrada neste gênero.');
      return;
    }
    const shuffled = [...tracks].sort(() => Math.random() - 0.5);
    setQueue(shuffled);
    playSong(shuffled[0], shuffled);
    showToast(`Modo Aleatório: tocando ${shuffled.length} músicas!`);
  };

  // Salva o álbum ou playlist encontrada na biblioteca do usuário e sincroniza com a nuvem
  const handleSaveEntityToLibrary = (entity: {
    type: 'album' | 'playlist' | 'artist';
    name: string;
    subtitle?: string;
    cover: string;
    songs: Song[];
  }) => {
    if (!entity.songs || entity.songs.length === 0) {
      showToast('Nenhuma faixa para salvar na biblioteca.');
      return;
    }

    const titlePrefix =
      entity.type === 'album'
        ? `${entity.name} (Álbum)`
        : entity.type === 'artist'
        ? `Top: ${entity.name}`
        : entity.name;

    const newPl: Playlist = {
      id: `pl-${entity.type}-${Date.now()}`,
      name: titlePrefix,
      creator: entity.subtitle || 'Montanha Music Lab',
      cover: entity.cover,
      songs: entity.songs,
      isCustom: true
    };

    const nextPlaylists = [newPl, ...playlists];
    setPlaylists(nextPlaylists);
    setSelectedPlaylist(newPl);
    setViewingEntity(null);
    showToast(`"${newPl.name}" salva na sua biblioteca!`);

    if (currentUser?.id) {
      syncCloudPlaylists(currentUser.id, nextPlaylists);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#121212] text-white font-sans select-none">
      
      {/* TELA DE AUTENTICAÇÃO GATEWAY: Fundo Desfocado quando não logado */}
      {!currentUser && (
        <AuthGateway onSuccess={handleAuthSuccess} />
      )}

      {/* CORPO DO APLICATIVO: DESFOCADO QUANDO NÃO LOGADO, 100% NÍTIDO QUANDO CONECTADO */}
      <div className={`flex h-full w-full flex-col transition-all duration-700 ease-out ${
        !currentUser ? 'filter blur-2xl brightness-40 pointer-events-none scale-[0.98]' : 'filter-none brightness-100 scale-100'
      }`}>
      
      {/* MOTOR DE ÁUDIO HTML5 ULTRA-RESILIENTE (Background-Safe sem crossOrigin) */}
      <audio
        ref={audioRef}
        preload="auto"
        loop={isRepeat}
        playsInline={true}
        style={{
          position: 'fixed',
          bottom: 0,
          right: 0,
          width: '1px',
          height: '1px',
          opacity: 0.01,
          pointerEvents: 'none',
          zIndex: -1
        }}
        onPlaying={() => {
          isSwitchingRef.current = false;
          setIsPlaying(true);
          isPlayingRef.current = true;
          mediaSessionController.updatePlaybackState(true);
          if (currentSongRef.current) {
            mediaSessionController.updateMetadata({
              title: currentSongRef.current.name,
              artist: currentSongRef.current.artist,
              album: currentSongRef.current.album || 'Able Music',
              artworkUrl: currentSongRef.current.thumbnail,
            });
          }
        }}
        onTimeUpdate={() => {
          if (audioRef.current) {
            const cur = Math.floor(audioRef.current.currentTime);
            setCurrentTime(cur);
            mediaSessionController.updatePositionState({
              duration: audioRef.current.duration || duration,
              position: cur,
              playbackRate: 1
            });
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current && audioRef.current.duration && Number.isFinite(audioRef.current.duration)) {
            setDuration(Math.floor(audioRef.current.duration));
          }
        }}
        onEnded={handleNextSong}
        onPause={() => {
          const a = audioRef.current;
          if (!a || a.ended || isSwitchingRef.current) return;
          setIsPlaying(false);
          isPlayingRef.current = false;
          mediaSessionController.updatePlaybackState(false);
        }}
        onError={(e) => {
          console.warn('HTML5 Audio error:', e);
          if (isSwitchingRef.current) return;
          if (currentSongRef.current) {
            invalidateStream(currentSongRef.current);
          }
          if (isPlayingRef.current) {
            setTimeout(() => {
              if (isPlayingRef.current && !isSwitchingRef.current) {
                handleNextSongRef.current();
              }
            }, 300);
          }
        }}
      />

      {/* TOAST NOTIFICATION (Posicionado abaixo do Header para não cobrir botões) */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 rounded-full bg-[#282828] border border-white/10 px-5 py-2.5 text-xs font-semibold text-white shadow-2xl animate-fade-in flex items-center gap-2 pointer-events-none">
          <Check size={14} className="text-[#1DB954]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER */}
      <header className="flex h-16 shrink-0 items-center justify-between px-4 sm:px-6 border-b border-white/[0.06] bg-[#121212]/90 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          {/* BOTÃO DE VOLTAR DE NAVEGAÇÃO NO HEADER */}
          {selectedPlaylist && (
            <button
              onClick={() => setSelectedPlaylist(null)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition text-white shadow"
              title="Voltar"
            >
              <ArrowLeft size={18} />
            </button>
          )}

          <div className="flex items-center gap-2.5 flex-shrink-0 select-none">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-[#1DB954] text-black shadow-md p-1.5 flex-shrink-0">
              <img src="/music.svg" alt="Montanha Music Lab" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col justify-center leading-none">
              <span className="text-sm sm:text-base font-black tracking-tight text-white leading-none">Montanha</span>
              <span className="text-[8px] sm:text-[9px] font-extrabold tracking-widest text-[#1DB954] uppercase mt-1 leading-none">MUSIC LAB</span>
            </div>
          </div>
        </div>

        {/* NAVEGAÇÃO CENTRAL DESKTOP */}
        <nav className="hidden sm:flex items-center gap-1 bg-[#181818] p-1 rounded-full border border-white/5 shadow-inner">
          {[
            { id: 'home', label: 'Início', icon: HomeIcon },
            { id: 'search', label: 'Buscar', icon: Search },
            { id: 'playlists', label: 'Playlists', icon: LibraryIcon },
            { id: 'downloads', label: 'Downloads', icon: Download }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id && !selectedPlaylist;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setSelectedPlaylist(null);
                }}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition ${
                  isActive
                    ? 'bg-white text-black shadow'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-black' : ''} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Botão Criar Playlist - Apenas telas médias/grandes (já presente na Home no mobile) */}
          <button
            onClick={() => setIsCreatePlaylistModalOpen(true)}
            className="hidden md:flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 px-3.5 py-2 text-xs font-bold text-white transition border border-white/10"
            title="Criar Playlist"
          >
            <FolderPlus size={15} />
            <span>Criar Playlist</span>
          </button>

          {/* Botão Atualizar Capas ao lado de Criar Playlist */}
          <button
            onClick={handleEnrichAllPlaylistsCovers}
            disabled={isEnrichingAllCovers}
            className="flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 px-3 py-1.5 sm:py-2 text-xs font-bold text-white transition border border-white/10 flex-shrink-0"
            title="Atualizar capas em alta definição de todas as playlists em sequência"
          >
            <Sparkles size={14} className={isEnrichingAllCovers ? "animate-spin text-[#1DB954]" : "text-[#1DB954]"} />
            <span className="hidden sm:inline">
              {isEnrichingAllCovers ? `Atualizando (${enrichAllProgress.current}/${enrichAllProgress.total})` : 'Atualizar Capas'}
            </span>
          </button>

          {/* Botão Importar Playlist por Link - Apenas telas médias/grandes (já presente na Home no mobile) */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="hidden md:flex items-center gap-2 rounded-full bg-[#1DB954] hover:bg-[#1ed760] active:scale-95 px-4 py-2 text-xs font-bold text-black shadow-lg transition"
            title="Importar Playlist"
          >
            <Link2 size={16} strokeWidth={2.5} />
            <span>Importar</span>
          </button>

          {/* Botão de Atualizar / Sincronizar em Nuvem - VISÍVEL SEMPRE (Mobile e Desktop) */}
          <button
            onClick={handleForceCloudSync}
            disabled={isSyncingCloud}
            className="flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-bold text-white transition border border-white/10 flex-shrink-0"
            title="Atualizar e sincronizar biblioteca com a nuvem"
          >
            <RefreshCw size={14} className={isSyncingCloud ? "animate-spin text-[#1DB954]" : "text-[#1DB954]"} />
            <span className="hidden sm:inline">Atualizar</span>
          </button>

          {/* Botão Instalar App PWA - VISÍVEL SEMPRE (Mobile e Desktop) */}
          <button
            onClick={handleInstallPwa}
            className="flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-bold text-white transition border border-white/10 flex-shrink-0"
            title="Baixar e Instalar Montanha Music Lab no seu Celular ou Computador"
          >
            <Smartphone size={14} className="text-[#1DB954]" />
            <span className="hidden sm:inline">Baixar App</span>
          </button>

          {/* Botão de Configurações & Perfil */}
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border transition flex-shrink-0 ${
              currentUser
                ? 'bg-[#1DB954]/20 border-[#1DB954] text-[#1DB954]'
                : 'bg-white/10 border-white/10 text-white hover:bg-white/20'
            }`}
            title={currentUser ? `Configurações de ${currentUser.email}` : 'Configurações & Login'}
          >
            {currentUser ? <Sliders size={16} /> : <UserIcon size={16} />}
          </button>
        </div>
      </header>

      {/* MAIN VIEW CONTENT */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 pb-40">
        
        {/* VIEW 1: HOME */}
        {activeTab === 'home' && !selectedPlaylist && (
          <div className="space-y-8 max-w-7xl mx-auto">
            
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-white">Sua Biblioteca</h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {currentUser ? `Sincronizada na nuvem como ${currentUser.email}` : 'Playlists salvas no dispositivo'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsCreatePlaylistModalOpen(true)}
                  className="text-xs font-bold text-white hover:text-[#1DB954] flex items-center gap-1 transition"
                >
                  <Plus size={14} />
                  <span>Criar Playlist</span>
                </button>
                <button
                  onClick={handleEnrichAllPlaylistsCovers}
                  disabled={isEnrichingAllCovers}
                  className="text-xs font-bold text-[#1DB954] hover:underline flex items-center gap-1 transition disabled:opacity-50"
                  title="Atualizar capas de todas as playlists do perfil"
                >
                  <Sparkles size={14} className={isEnrichingAllCovers ? "animate-spin" : ""} />
                  <span>{isEnrichingAllCovers ? `Atualizando (${enrichAllProgress.current}/${enrichAllProgress.total})...` : 'Atualizar Capas'}</span>
                </button>
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="text-xs font-bold text-[#1DB954] hover:underline flex items-center gap-1"
                >
                  <Link2 size={14} />
                  <span>Importar Link</span>
                </button>
              </div>
            </div>

            {/* Grid de Playlists */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {playlists.map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => setSelectedPlaylist(pl)}
                  className="group flex flex-col p-3 rounded-2xl bg-[#181818] hover:bg-[#282828] transition duration-200 cursor-pointer border border-white/5 relative"
                >
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 shadow-md">
                    <img
                      src={pl.cover || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=60'}
                      alt={pl.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=60';
                      }}
                      className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    {pl.isCustom && (
                      <span className="absolute top-2 left-2 bg-[#1DB954] text-black text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                        Sua
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (pl.songs.length > 0) {
                          if (isPlaying && currentSong.id === pl.songs[0].id) {
                            togglePlay();
                          } else {
                            playSong(pl.songs[0], pl.songs);
                          }
                        }
                      }}
                      className="absolute bottom-2.5 right-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-[#1DB954] text-black shadow-xl opacity-0 group-hover:opacity-100 transition hover:scale-105 active:scale-95"
                    >
                      {isPlaying && pl.songs.some(s => s.id === currentSong.id) ? (
                        <Pause size={18} fill="currentColor" />
                      ) : (
                        <Play size={18} fill="currentColor" className="ml-0.5" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-start justify-between gap-1">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-white truncate">{pl.name}</h3>
                      <p className="text-xs text-neutral-400 truncate mt-0.5">{pl.songs.length} faixas • {pl.creator}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditPlaylist(pl);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-white transition"
                      title="Editar Playlist"
                    >
                      <Edit2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Seção Músicas em Destaque (Referência Rápida) */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Músicas em Destaque
                    <span className="text-xs font-normal text-neutral-400">(Referência)</span>
                  </h3>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {featuredSongs.map((song, idx) => {
                  const isCurrent = currentSong.id === song.id;
                  const plays = playCounts[song.id] || 0;
                  return (
                    <div
                      key={`${song.id}-${idx}`}
                      onClick={() => playSong(song, featuredSongs)}
                      className={`flex items-center justify-between p-3 rounded-xl transition cursor-pointer group ${
                        isCurrent ? 'bg-white/10' : 'hover:bg-[#1e1e1e]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative">
                          <img src={song.thumbnail} alt={song.name} className="h-11 w-11 rounded-lg object-cover" />
                          {plays > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-[#1DB954] text-black text-[9px] font-black px-1.5 py-0.2 rounded-full shadow">
                              {plays}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm font-bold truncate ${isCurrent ? 'text-[#1DB954]' : 'text-white'}`}>
                            {song.name}
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-neutral-400 truncate">{song.artist}</p>
                            {plays > 0 && (
                              <span className="text-[10px] text-[#1DB954] font-semibold">
                                • {plays} {plays === 1 ? 'play' : 'plays'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSongToAddToPlaylist(song);
                            setIsAddToPlaylistModalOpen(true);
                          }}
                          className="p-1.5 text-neutral-400 hover:text-white"
                          title="Adicionar à Playlist"
                        >
                          <ListPlus size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadSong(song);
                          }}
                          className="p-1.5 text-neutral-400 hover:text-white"
                          title="Baixar Música"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(song.id);
                          }}
                          className="p-1.5 text-neutral-400 hover:text-white"
                        >
                          <Heart size={16} className={favoriteSongIds.includes(song.id) ? 'fill-[#1DB954] text-[#1DB954]' : ''} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* VIEW 2: SEARCH CATEGORIZADO & HUB DE ESTILOS (ESOUND STYLE) */}
        {activeTab === 'search' && !selectedPlaylist && (
          <div className="space-y-6 max-w-5xl mx-auto">
            {selectedGenre && !searchQuery ? (
              <GenreDetailView
                genre={selectedGenre}
                onBack={() => setSelectedGenre(null)}
                onPlaySong={(song, queue) => playSong(song, queue)}
                onPlayAll={handlePlayAllGenre}
                onShufflePlay={handleShufflePlayGenre}
                onOpenEntity={handleOpenEntity}
                onAddToPlaylist={(song) => {
                  setSongToAddToPlaylist(song);
                  setIsAddToPlaylistModalOpen(true);
                }}
                onDownloadSong={handleDownloadSong}
                onToggleFavorite={toggleFavorite}
                onReplaceSong={handleStartReplaceSong}
                unavailableSongIds={unavailableSongIds}
                favoriteSongIds={favoriteSongIds}
                currentSongId={currentSong?.id}
                isPlaying={isPlaying}
              />
            ) : (
              <>
                {/* Banner de Substituição Ativa de Música */}
                {replacingSongContext && (
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-white animate-fade-in shadow-lg">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <RefreshCw size={16} className="text-[#1DB954] shrink-0 animate-spin" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">
                          Substituindo <span className="text-[#1DB954] font-black">{replacingSongContext.targetSong.name}</span>
                        </p>
                        <p className="text-[11px] text-neutral-400 truncate">
                          Escolha uma das versões abaixo para atualizar sua playlist automaticamente.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setReplacingSongContext(null)}
                      className="text-xs font-semibold text-neutral-400 hover:text-white px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 shrink-0"
                    >
                      Cancelar
                    </button>
                  </div>
                )}

                {/* Header da Tela de Busca estilo eSound */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">Buscar</h2>
                    <p className="text-xs text-neutral-400 mt-0.5">O que você quer ouvir?</p>
                  </div>
                  <button
                    onClick={() => setIsSettingsModalOpen(true)}
                    className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition active:scale-95 border border-white/5"
                    title="Configurações"
                  >
                    <Settings size={20} />
                  </button>
                </div>

                {/* Campo de Busca */}
                <div className="relative">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      handleSearch(e.target.value);
                    }}
                    placeholder="O que você quer ouvir? (músicas, álbuns, artistas...)"
                    className="h-12 w-full rounded-2xl bg-[#1e1e1e] border border-white/10 pl-11 pr-10 text-sm text-white placeholder-neutral-400 outline-none focus:border-[#1DB954] transition shadow-lg"
                  />
                  {isSearching ? (
                    <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1DB954] animate-spin" />
                  ) : searchQuery ? (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        handleSearch('');
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  ) : null}
                </div>

            {/* Pílulas de Filtro por Categoria */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all', label: 'Tudo', count: null },
                { id: 'songs', label: 'Músicas', count: categorizedResults.songs.length },
                { id: 'albums', label: 'Álbuns', count: categorizedResults.albums.length },
                { id: 'artists', label: 'Artistas', count: categorizedResults.artists.length },
                { id: 'playlists', label: 'Playlists', count: categorizedResults.playlists.length }
              ].map((tab) => {
                const isActive = searchCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setSearchCategory(tab.id as any);
                      if (searchQuery) handleSearch(searchQuery, tab.id as any);
                    }}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition active:scale-95 whitespace-nowrap shadow-sm ${
                      isActive
                        ? 'bg-[#1DB954] text-black shadow-[0_2px_10px_rgba(29,185,84,0.3)]'
                        : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {searchQuery && tab.count !== null && tab.count > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                        isActive ? 'bg-black/20 text-black' : 'bg-white/10 text-neutral-300'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* RESULTADOS CATEGORIZADOS */}
            {searchQuery ? (
              <div className="space-y-8 animate-fade-in">
                {/* 1. SEÇÃO DE ÁLBUNS */}
                {(searchCategory === 'all' || searchCategory === 'albums') && categorizedResults.albums.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                        <Disc size={16} className="text-[#1DB954]" />
                        <span>Álbuns Encontrados</span>
                      </h3>
                      {searchCategory === 'all' && categorizedResults.albums.length > 4 && (
                        <button
                          onClick={() => setSearchCategory('albums')}
                          className="text-xs text-[#1DB954] hover:underline font-bold"
                        >
                          Ver todos ({categorizedResults.albums.length})
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {(searchCategory === 'all' ? categorizedResults.albums.slice(0, 4) : categorizedResults.albums).map((album) => (
                        <div
                          key={album.id}
                          onClick={() => handleOpenEntity({
                            type: 'album',
                            name: album.name,
                            subtitle: album.artist,
                            cover: album.cover,
                            rawId: album.rawId
                          })}
                          className="group p-3 rounded-2xl bg-[#181818] hover:bg-[#282828] transition duration-200 cursor-pointer border border-white/5 relative flex flex-col"
                        >
                          <div className="aspect-square w-full rounded-xl overflow-hidden mb-3 shadow-md relative">
                            <img
                              src={album.cover}
                              alt={album.name}
                              className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                            />
                            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-[10px] text-white px-2 py-0.5 rounded-full font-bold">
                              Álbum
                            </div>
                          </div>
                          <p className="text-sm font-bold text-white truncate group-hover:text-[#1DB954]">{album.name}</p>
                          <p className="text-xs text-neutral-400 truncate mt-0.5">{album.artist}</p>
                          {album.trackCount ? (
                            <span className="text-[10px] text-neutral-500 mt-1">{album.trackCount} faixas</span>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. SEÇÃO DE ARTISTAS */}
                {(searchCategory === 'all' || searchCategory === 'artists') && categorizedResults.artists.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                        <Users size={16} className="text-[#1DB954]" />
                        <span>Artistas</span>
                      </h3>
                      {searchCategory === 'all' && categorizedResults.artists.length > 4 && (
                        <button
                          onClick={() => setSearchCategory('artists')}
                          className="text-xs text-[#1DB954] hover:underline font-bold"
                        >
                          Ver todos ({categorizedResults.artists.length})
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                      {(searchCategory === 'all' ? categorizedResults.artists.slice(0, 6) : categorizedResults.artists).map((artist) => (
                        <div
                          key={artist.id}
                          onClick={() => handleOpenEntity({
                            type: 'artist',
                            name: artist.name,
                            subtitle: `${artist.nbAlbum || 0} álbuns`,
                            cover: artist.image,
                            rawId: artist.rawId
                          })}
                          className="group p-3 rounded-2xl bg-[#181818] hover:bg-[#282828] transition duration-200 cursor-pointer border border-white/5 flex flex-col items-center text-center"
                        >
                          <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full overflow-hidden mb-3 shadow-md border-2 border-transparent group-hover:border-[#1DB954] transition">
                            <img
                              src={artist.image}
                              alt={artist.name}
                              className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                            />
                          </div>
                          <p className="text-xs sm:text-sm font-bold text-white truncate w-full group-hover:text-[#1DB954]">{artist.name}</p>
                          <span className="text-[10px] text-neutral-400 mt-0.5">Artista</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. SEÇÃO DE PLAYLISTS */}
                {(searchCategory === 'all' || searchCategory === 'playlists') && categorizedResults.playlists.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                        <ListMusic size={16} className="text-[#1DB954]" />
                        <span>Playlists Encontradas</span>
                      </h3>
                      {searchCategory === 'all' && categorizedResults.playlists.length > 4 && (
                        <button
                          onClick={() => setSearchCategory('playlists')}
                          className="text-xs text-[#1DB954] hover:underline font-bold"
                        >
                          Ver todas ({categorizedResults.playlists.length})
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {(searchCategory === 'all' ? categorizedResults.playlists.slice(0, 4) : categorizedResults.playlists).map((playlist) => (
                        <div
                          key={playlist.id}
                          onClick={() => handleOpenEntity({
                            type: 'playlist',
                            name: playlist.name,
                            subtitle: playlist.creator,
                            cover: playlist.cover,
                            rawId: playlist.rawId
                          })}
                          className="group p-3 rounded-2xl bg-[#181818] hover:bg-[#282828] transition duration-200 cursor-pointer border border-white/5 relative flex flex-col"
                        >
                          <div className="aspect-square w-full rounded-xl overflow-hidden mb-3 shadow-md relative">
                            <img
                              src={playlist.cover}
                              alt={playlist.name}
                              className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                            />
                            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-[10px] text-white px-2 py-0.5 rounded-full font-bold">
                              Playlist
                            </div>
                          </div>
                          <p className="text-sm font-bold text-white truncate group-hover:text-[#1DB954]">{playlist.name}</p>
                          <p className="text-xs text-neutral-400 truncate mt-0.5">{playlist.creator}</p>
                          {playlist.trackCount ? (
                            <span className="text-[10px] text-neutral-500 mt-1">{playlist.trackCount} faixas</span>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. SEÇÃO DE MÚSICAS */}
                {(searchCategory === 'all' || searchCategory === 'songs') && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-black uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                      <Music size={16} className="text-[#1DB954]" />
                      <span>Músicas</span>
                    </h3>
                    {categorizedResults.songs.length > 0 ? (
                      <div className="space-y-2">
                        {categorizedResults.songs.map((song) => (
                          <div
                            key={song.id}
                            onClick={() => playSong(song, categorizedResults.songs)}
                            className="flex items-center justify-between p-3 rounded-xl bg-[#181818] hover:bg-[#282828] transition cursor-pointer group border border-white/5"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <img src={song.thumbnail} alt={song.name} className="h-12 w-12 rounded-lg object-cover shadow" />
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-white truncate group-hover:text-[#1DB954]">{song.name}</p>
                                <p className="text-xs text-neutral-400 truncate">{song.artist}{song.album ? ` • ${song.album}` : ''}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {replacingSongContext && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleApplySongReplacement(song);
                                  }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black text-xs font-bold shadow transition active:scale-95 mr-1"
                                  title="Substituir a faixa por esta versão"
                                >
                                  <RefreshCw size={12} />
                                  <span>Substituir</span>
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSongToAddToPlaylist(song);
                                  setIsAddToPlaylistModalOpen(true);
                                }}
                                className="p-2 text-neutral-400 hover:text-white transition"
                                title="Adicionar à Playlist"
                              >
                                <ListPlus size={16} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadSong(song);
                                }}
                                className="p-2 text-neutral-400 hover:text-white transition"
                                title="Baixar para Offline"
                              >
                                <Download size={16} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(song.id);
                                }}
                                className="p-2 text-neutral-400 hover:text-white transition"
                              >
                                <Heart size={16} className={favoriteSongIds.includes(song.id) ? 'fill-[#1DB954] text-[#1DB954]' : ''} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-neutral-500 text-xs">
                        Nenhuma música avulsa encontrada para este termo.
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Quando o campo de busca estiver vazio: Exibe o Grid de Estilos Musicais eSound */
              <GenreExploreGrid onSelectGenre={(genre) => setSelectedGenre(genre)} />
            )}
              </>
            )}
          </div>
        )}

        {/* VIEW 3: PLAYLISTS */}
        {activeTab === 'playlists' && !selectedPlaylist && (
          <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-white">Suas Playlists</h2>
                <p className="text-xs text-neutral-400 mt-0.5">Gerencie, edite e crie suas listas de reprodução</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsCreatePlaylistModalOpen(true)}
                  className="flex items-center gap-2 rounded-full bg-[#1DB954] px-4 py-2 text-xs font-bold text-black hover:bg-[#1ed760] transition shadow-lg"
                >
                  <Plus size={16} strokeWidth={2.5} />
                  <span>Nova Playlist</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              
              {/* Card Criar Nova Playlist */}
              <div
                onClick={() => setIsCreatePlaylistModalOpen(true)}
                className="group flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-white/20 hover:border-[#1DB954] transition cursor-pointer aspect-square text-center bg-[#181818]/50 hover:bg-[#181818]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 group-hover:bg-[#1DB954] group-hover:text-black transition mb-3">
                  <Plus size={24} />
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-[#1DB954]">Criar Playlist</h3>
                <p className="text-[11px] text-neutral-400 mt-1">Monte sua própria lista</p>
              </div>

              {playlists.map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => setSelectedPlaylist(pl)}
                  className="group flex flex-col p-3 rounded-2xl bg-[#181818] hover:bg-[#282828] transition cursor-pointer border border-white/5 relative"
                >
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 shadow-md">
                    <img
                      src={pl.cover || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=60'}
                      alt={pl.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=60';
                      }}
                      className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    {pl.isCustom && (
                      <span className="absolute top-2 left-2 bg-[#1DB954] text-black text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                        Sua
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (pl.songs.length > 0) {
                          if (isPlaying && currentSong.id === pl.songs[0].id) {
                            togglePlay();
                          } else {
                            playSong(pl.songs[0], pl.songs);
                          }
                        }
                      }}
                      className="absolute bottom-2.5 right-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-[#1DB954] text-black shadow-xl opacity-0 group-hover:opacity-100 transition hover:scale-105"
                    >
                      <Play size={18} fill="currentColor" className="ml-0.5" />
                    </button>
                  </div>
                  <div className="flex items-start justify-between gap-1">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-white truncate">{pl.name}</h3>
                      <p className="text-xs text-neutral-400 truncate mt-0.5">{pl.songs.length} faixas • {pl.creator}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditPlaylist(pl);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-white transition"
                      title="Editar Playlist"
                    >
                      <Edit2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 4: DOWNLOADS */}
        {activeTab === 'downloads' && !selectedPlaylist && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-white">Downloads Offline</h2>
                <p className="text-xs text-neutral-400 mt-0.5">Músicas salvas localmente no dispositivo para ouvir sem gastar internet</p>
              </div>
              <span className="text-xs font-bold text-neutral-400 bg-white/10 px-3 py-1.5 rounded-full">
                {downloadedSongs.length} faixas
              </span>
            </div>

            {downloadedSongs.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-2">
                  <button
                    onClick={() => playSong(downloadedSongs[0], downloadedSongs)}
                    className="flex items-center gap-2 rounded-full bg-[#1DB954] px-4 py-2 text-xs font-bold text-black hover:bg-[#1ed760] transition shadow"
                  >
                    <Play size={16} fill="currentColor" />
                    <span>Tocar Todas Offline</span>
                  </button>
                </div>

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
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#1DB954] font-semibold flex items-center gap-1 mr-2">
                        <Check size={14} />
                        <span>Offline</span>
                      </span>
                      {/* BOTÃO EXCLUIR MÚSICA DOS DOWNLOADS */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDownloadedSong(song.id);
                        }}
                        className="p-2 text-neutral-500 hover:text-red-400 transition"
                        title="Remover dos Downloads"
                      >
                        <Trash2 size={16} />
                      </button>
                      <span className="text-xs text-neutral-500 font-mono">{formatTime(song.duration || 210)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center space-y-3">
                <Download size={40} className="mx-auto text-neutral-600" />
                <p className="text-sm font-bold text-neutral-400">Nenhuma música baixada ainda</p>
                <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                  Clique no ícone de download ao lado de qualquer música ou playlist para salvá-la offline no seu aparelho.
                </p>
              </div>
            )}
          </div>
        )}

        {/* DETALHE DA PLAYLIST SELECIONADA */}
        {selectedPlaylist && (
          <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
            
            {/* BARRA SUPERIOR DE AÇÕES COM BOTÃO VOLTAR */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSelectedPlaylist(null)}
                className="group flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 px-4 py-2 text-xs font-bold text-white transition active:scale-95 shadow"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition" />
                <span>Voltar</span>
              </button>

              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                {/* Botão Baixar Capa da Playlist */}
                <button
                  onClick={() => downloadImageFile(selectedPlaylist.cover, selectedPlaylist.name)}
                  className="flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white transition px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
                  title="Baixar Capa da Playlist em Alta Resolução"
                >
                  <Download size={14} className="text-[#1DB954]" />
                  <span className="hidden sm:inline">Baixar Capa</span>
                </button>

                {/* Botão Atualizar Capas das Músicas com Capas Oficiais */}
                <button
                  onClick={handleEnrichCurrentPlaylistCovers}
                  disabled={isEnrichingCovers}
                  className="flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white transition px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
                  title="Buscar capas oficiais individuais para cada música da playlist"
                >
                  <Sparkles size={14} className={isEnrichingCovers ? "animate-spin text-[#1DB954]" : "text-[#1DB954]"} />
                  <span>{isEnrichingCovers ? "Buscando..." : "Atualizar Capas"}</span>
                </button>

                <button
                  onClick={() => handleOpenEditPlaylist(selectedPlaylist)}
                  className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition p-2 rounded-lg hover:bg-white/10"
                >
                  <Edit2 size={15} />
                  <span>Editar</span>
                </button>

                <button
                  onClick={() => handleDeletePlaylist(selectedPlaylist.id)}
                  className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition p-2 rounded-lg hover:bg-red-500/10"
                >
                  <Trash2 size={15} />
                  <span>Excluir</span>
                </button>
              </div>
            </div>

            {/* CABEÇALHO DA PLAYLIST */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 bg-gradient-to-b from-white/10 to-transparent p-6 rounded-3xl border border-white/5">
              <img
                src={selectedPlaylist.cover}
                alt={selectedPlaylist.name}
                className="h-44 w-44 rounded-2xl object-cover shadow-2xl"
              />
              <div className="text-center sm:text-left space-y-2 flex-1">
                <span className="text-xs font-bold text-[#1DB954] uppercase tracking-wider">
                  {selectedPlaylist.isCustom ? 'Minha Playlist' : 'Playlist Salva'}
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-white">{selectedPlaylist.name}</h2>
                <p className="text-xs text-neutral-400">
                  Criada por <span className="text-white font-semibold">{selectedPlaylist.creator}</span> • {selectedPlaylist.songs.length} faixas
                </p>
                
                {/* BOTÕES: TOCAR, SHUFFLE, REPEAT E BAIXAR PLAYLIST COMPLETA */}
                <div className="pt-3 flex items-center justify-center sm:justify-start gap-3">
                  <button
                    onClick={() => {
                      if (selectedPlaylist.songs.length > 0) {
                        if (isPlaying && selectedPlaylist.songs.some(s => s.id === currentSong.id)) {
                          togglePlay();
                        } else {
                          playSong(selectedPlaylist.songs[0], selectedPlaylist.songs);
                        }
                      }
                    }}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1DB954] text-black shadow-lg hover:scale-105 active:scale-95 transition"
                    title="Tocar Playlist"
                  >
                    {isPlaying && selectedPlaylist.songs.some(s => s.id === currentSong.id) ? (
                      <Pause size={20} fill="currentColor" />
                    ) : (
                      <Play size={20} fill="currentColor" className="ml-0.5" />
                    )}
                  </button>

                  {/* BOTÃO SHUFFLE NA PLAYLIST */}
                  <button
                    onClick={() => {
                      if (selectedPlaylist.songs.length === 0) return;
                      if (!selectedPlaylist.songs.some(s => s.id === currentSong.id)) {
                        const randomIdx = Math.floor(Math.random() * selectedPlaylist.songs.length);
                        playSong(selectedPlaylist.songs[randomIdx], selectedPlaylist.songs);
                        if (!isShuffle) toggleShuffle();
                      } else {
                        toggleShuffle();
                      }
                    }}
                    className={`flex h-10 w-10 items-center justify-center rounded-full border transition active:scale-95 ${
                      isShuffle
                        ? 'bg-[#1DB954]/20 border-[#1DB954] text-[#1DB954]'
                        : 'bg-white/5 border-white/10 text-neutral-300 hover:text-white hover:bg-white/10'
                    }`}
                    title={isShuffle ? 'Modo Aleatório Ativado' : 'Tocar em Ordem Aleatória'}
                  >
                    <Shuffle size={18} />
                  </button>

                  {/* BOTÃO REPEAT NA PLAYLIST */}
                  <button
                    onClick={() => {
                      const nextRepeat = !isRepeat;
                      setIsRepeat(nextRepeat);
                      showToast(nextRepeat ? 'Repetir música ativado' : 'Repetição desativada');
                    }}
                    className={`flex h-10 w-10 items-center justify-center rounded-full border transition active:scale-95 ${
                      isRepeat
                        ? 'bg-[#1DB954]/20 border-[#1DB954] text-[#1DB954]'
                        : 'bg-white/5 border-white/10 text-neutral-300 hover:text-white hover:bg-white/10'
                    }`}
                    title={isRepeat ? 'Repetição Ativada' : 'Ativar Repetição'}
                  >
                    <Repeat size={18} />
                  </button>

                  <button
                    onClick={() => handleDownloadPlaylist(selectedPlaylist)}
                    className="flex h-10 items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 px-4 text-xs font-bold text-white border border-white/10 transition shadow-lg"
                    title="Baixar todas as faixas desta playlist para offline"
                  >
                    <Download size={16} />
                    <span>Baixar</span>
                  </button>
                </div>
              </div>
            </div>

            {/* LISTA DE MÚSICAS DA PLAYLIST */}
            <div className="space-y-1">
              {selectedPlaylist.songs.length > 0 ? (
                selectedPlaylist.songs.map((song, idx) => {
                  const isUnavailable = unavailableSongIds.includes(song.id);
                  return (
                    <div
                      key={`${song.id}-${idx}`}
                      onClick={() => {
                        if (isUnavailable) {
                          showToast(`"${song.name}" está indisponível na fonte. Toque em "Substituir por semelhante".`);
                          return;
                        }
                        playSong(song, selectedPlaylist.songs);
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl transition group ${
                        isUnavailable
                          ? 'bg-red-950/20 border border-red-500/20 opacity-60 hover:opacity-85 cursor-not-allowed'
                          : 'hover:bg-white/5 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs font-mono text-neutral-500 w-5">{idx + 1}</span>
                        <img
                          src={song.thumbnail}
                          alt={song.name}
                          className={`h-10 w-10 rounded-lg object-cover ${isUnavailable ? 'grayscale contrast-125' : ''}`}
                        />
                        <div className="min-w-0">
                          <p
                            className={`text-sm font-bold truncate ${
                              isUnavailable
                                ? 'text-red-400 line-through'
                                : 'text-white group-hover:text-[#1DB954]'
                            }`}
                          >
                            {song.name}
                          </p>
                          {isUnavailable ? (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wide">
                                Áudio indisponível
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartReplaceSong(song, selectedPlaylist.id);
                                }}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition active:scale-95"
                              >
                                <RefreshCw size={11} />
                                <span>Substituir por semelhante</span>
                              </button>
                            </div>
                          ) : (
                            <p className="text-xs text-neutral-400 truncate">{song.artist}</p>
                          )}
                        </div>
                      </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      {/* BAIXAR CAPA DA MÚSICA */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadImageFile(song.thumbnail, song.name);
                          showToast(`Capa de "${song.name}" baixada!`);
                        }}
                        className="p-1.5 sm:p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition"
                        title="Baixar capa desta faixa"
                      >
                        <ImageIcon size={15} />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSongToAddToPlaylist(song);
                          setIsAddToPlaylistModalOpen(true);
                        }}
                        className="p-2 text-neutral-400 hover:text-white"
                        title="Adicionar a outra playlist"
                      >
                        <ListPlus size={16} />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadSong(song);
                        }}
                        className="p-2 text-neutral-400 hover:text-white"
                        title="Baixar Música"
                      >
                        <Download size={16} />
                      </button>

                      {/* REMOVER MÚSICA DA PLAYLIST */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveSongFromPlaylist(selectedPlaylist.id, song.id);
                        }}
                        className="p-2 text-neutral-500 hover:text-red-400"
                        title="Remover desta playlist"
                      >
                        <Trash2 size={16} />
                      </button>

                      <span className="text-xs text-neutral-500 font-mono w-12 text-right">{formatTime(song.duration || 210)}</span>
                    </div>
                  </div>
                );
              })
              ) : (
                <div className="py-12 text-center text-neutral-500 text-sm space-y-3">
                  <p>Esta playlist ainda não tem músicas.</p>
                  <button
                    onClick={() => {
                      setSelectedPlaylist(null);
                      setActiveTab('search');
                    }}
                    className="rounded-full bg-[#1DB954] px-5 py-2.5 text-xs font-bold text-black hover:bg-[#1ed760] transition shadow-lg"
                  >
                    Buscar Músicas para Adicionar
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* MODAL: CRIAR NOVA PLAYLIST */}
      {isCreatePlaylistModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#1e1e1e] border border-white/10 p-6 sm:p-8 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setIsCreatePlaylistModalOpen(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1DB954] text-black">
                <FolderPlus size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Criar Nova Playlist</h3>
                <p className="text-xs text-neutral-400">Dê um nome para sua nova playlist</p>
              </div>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={newPlaylistTitle}
                onChange={(e) => setNewPlaylistTitle(e.target.value)}
                placeholder="Ex: Minhas Favoritas, Rock, etc..."
                autoFocus
                className="h-12 w-full rounded-2xl bg-[#121212] border border-white/10 px-4 text-sm text-white placeholder-neutral-500 outline-none focus:border-[#1DB954] transition"
              />

              <div className="flex gap-2">
                <button
                  onClick={() => setIsCreatePlaylistModalOpen(false)}
                  className="flex-1 rounded-2xl bg-white/10 hover:bg-white/15 py-3 text-xs font-bold text-white transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateNewPlaylist}
                  className="flex-1 rounded-2xl bg-[#1DB954] hover:bg-[#1ed760] py-3 text-xs font-bold text-black shadow-lg transition"
                >
                  Criar Playlist
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR PLAYLIST */}
      {isEditPlaylistModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#1e1e1e] border border-white/10 p-6 sm:p-8 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setIsEditPlaylistModalOpen(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1DB954] text-black">
                <Edit2 size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Editar Playlist</h3>
                <p className="text-xs text-neutral-400">Altere o nome e a imagem de capa</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase text-neutral-400">Nome da Playlist</label>
                <input
                  type="text"
                  value={editPlaylistTitle}
                  onChange={(e) => setEditPlaylistTitle(e.target.value)}
                  className="h-12 w-full rounded-2xl bg-[#121212] border border-white/10 px-4 text-sm text-white outline-none focus:border-[#1DB954] mt-1"
                />
              </div>

              {/* Prévia e Upload de Capa */}
              <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-[#121212] border border-white/10">
                <img
                  src={editPlaylistCover || playlistBeingEdited?.songs[0]?.thumbnail || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80'}
                  alt="Prévia da Capa"
                  className="h-16 w-16 rounded-xl object-cover shadow border border-white/10 flex-shrink-0"
                />
                <div className="flex-1 min-w-0 space-y-1.5">
                  <p className="text-xs font-bold text-white">Imagem de Capa</p>
                  <p className="text-[11px] text-neutral-400">Envie um arquivo do aparelho ou escolha uma capa das músicas</p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-[#1DB954] transition active:scale-95"
                  >
                    <Upload size={14} />
                    <span>Upload de Foto / Imagem</span>
                  </button>
                </div>
              </div>

              {/* Seleção de Capa a partir das músicas da playlist */}
              {playlistBeingEdited && playlistBeingEdited.songs.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-neutral-400">
                    Ou selecione a capa de uma música da playlist:
                  </label>
                  <div className="flex gap-2 overflow-x-auto pb-2 pt-1">
                    {playlistBeingEdited.songs.slice(0, 8).map((song, i) => (
                      <button
                        key={`${song.id}-${i}`}
                        type="button"
                        onClick={() => {
                          setEditPlaylistCover(song.thumbnail);
                          showToast(`Capa de "${song.name}" selecionada!`);
                        }}
                        className={`flex-shrink-0 relative rounded-xl overflow-hidden border-2 transition hover:scale-105 ${
                          editPlaylistCover === song.thumbnail ? 'border-[#1DB954]' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                        title={song.name}
                      >
                        <img src={song.thumbnail} alt={song.name} className="h-12 w-12 object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold uppercase text-neutral-400">Ou cole a URL da Imagem</label>
                <input
                  type="text"
                  value={editPlaylistCover}
                  onChange={(e) => setEditPlaylistCover(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="h-10 w-full rounded-2xl bg-[#121212] border border-white/10 px-4 text-xs text-white outline-none focus:border-[#1DB954] mt-1"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setIsEditPlaylistModalOpen(false)}
                  className="flex-1 rounded-2xl bg-white/10 hover:bg-white/15 py-3 text-xs font-bold text-white transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveEditPlaylist}
                  className="flex-1 rounded-2xl bg-[#1DB954] hover:bg-[#1ed760] py-3 text-xs font-bold text-black shadow-lg transition"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADICIONAR MÚSICA A UMA PLAYLIST */}
      {isAddToPlaylistModalOpen && songToAddToPlaylist && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#1e1e1e] border border-white/10 p-6 sm:p-8 space-y-5 shadow-2xl relative">
            <button
              onClick={() => {
                setIsAddToPlaylistModalOpen(false);
                setSongToAddToPlaylist(null);
              }}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1"
            >
              <X size={20} />
            </button>

            <div>
              <h3 className="text-lg font-black text-white">Adicionar à Playlist</h3>
              <p className="text-xs text-neutral-400 truncate mt-0.5">
                Música: <span className="text-white font-semibold">{songToAddToPlaylist.name}</span>
              </p>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {playlists.map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => handleAddSongToTargetPlaylist(pl.id)}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#141414] hover:bg-white/10 transition cursor-pointer border border-white/5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={pl.cover} alt={pl.name} className="h-10 w-10 rounded-lg object-cover" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{pl.name}</p>
                      <p className="text-xs text-neutral-400">{pl.songs.length} faixas</p>
                    </div>
                  </div>
                  <Plus size={16} className="text-[#1DB954]" />
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setIsAddToPlaylistModalOpen(false);
                setIsCreatePlaylistModalOpen(true);
              }}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-white/10 hover:bg-white/15 py-3 text-xs font-bold text-white transition border border-white/10"
            >
              <FolderPlus size={16} />
              <span>+ Criar Nova Playlist</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE INSPEÇÃO E EXECUÇÃO DE ÁLBUM / PLAYLIST / ARTISTA */}
      {viewingEntity && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-2xl max-h-[85vh] rounded-3xl bg-[#181818] border border-white/10 p-6 flex flex-col shadow-2xl relative overflow-hidden">
            {/* Header da Entidade */}
            <div className="flex items-start gap-4 pb-4 border-b border-white/10 relative">
              <div className={`h-24 w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden shadow-xl ${
                viewingEntity.type === 'artist' ? 'rounded-full' : 'rounded-2xl'
              }`}>
                <img
                  src={viewingEntity.cover}
                  alt={viewingEntity.name}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0 pr-8">
                <div className="inline-block bg-[#1DB954]/20 text-[#1DB954] border border-[#1DB954]/30 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1.5">
                  {viewingEntity.type === 'album' ? 'Álbum' : viewingEntity.type === 'artist' ? 'Artista' : 'Playlist'}
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white truncate">{viewingEntity.name}</h3>
                {viewingEntity.subtitle && (
                  <p className="text-xs text-neutral-400 mt-1 truncate">{viewingEntity.subtitle}</p>
                )}
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handlePlayEntityAll(viewingEntity)}
                    disabled={viewingEntity.loading || viewingEntity.songs.length === 0}
                    className="flex items-center gap-2 rounded-full bg-[#1DB954] hover:bg-[#1ed760] px-4 py-2 text-xs font-bold text-black transition active:scale-95 disabled:opacity-40"
                  >
                    <Play size={14} fill="currentColor" />
                    <span>Tocar Tudo</span>
                  </button>
                  <button
                    onClick={() => handleSaveEntityToLibrary(viewingEntity)}
                    disabled={viewingEntity.loading || viewingEntity.songs.length === 0}
                    className="flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 px-4 py-2 text-xs font-bold text-white transition active:scale-95 border border-white/10 disabled:opacity-40"
                  >
                    <FolderPlus size={14} className="text-[#1DB954]" />
                    <span>Salvar na Biblioteca</span>
                  </button>
                </div>
              </div>

              <button
                onClick={() => setViewingEntity(null)}
                className="absolute top-0 right-0 p-2 text-neutral-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Lista de Faixas da Entidade */}
            <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-1.5 scrollbar-thin">
              {viewingEntity.loading ? (
                <div className="py-16 text-center text-neutral-400 text-xs flex flex-col items-center gap-2">
                  <Loader2 size={24} className="animate-spin text-[#1DB954]" />
                  <span>Carregando faixas em alta fidelidade...</span>
                </div>
              ) : viewingEntity.songs.length > 0 ? (
                viewingEntity.songs.map((song, idx) => {
                  const isUnavailable = unavailableSongIds.includes(song.id);
                  return (
                    <div
                      key={song.id || idx}
                      onClick={() => {
                        if (isUnavailable) {
                          showToast(`"${song.name}" está indisponível na fonte. Toque em "Substituir por semelhante".`);
                          return;
                        }
                        setQueue(viewingEntity.songs);
                        playSong(song, viewingEntity.songs);
                      }}
                      className={`flex items-center justify-between p-2.5 rounded-xl transition group ${
                        isUnavailable
                          ? 'bg-red-950/20 border border-red-500/20 opacity-60 hover:opacity-85 cursor-not-allowed'
                          : 'hover:bg-white/5 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-5 text-center text-xs text-neutral-500 font-mono group-hover:text-[#1DB954]">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <p
                            className={`text-sm font-bold truncate ${
                              isUnavailable
                                ? 'text-red-400 line-through'
                                : 'text-white group-hover:text-[#1DB954]'
                            }`}
                          >
                            {song.name}
                          </p>
                          {isUnavailable ? (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wide">
                                Áudio indisponível
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartReplaceSong(song);
                                }}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition active:scale-95"
                              >
                                <RefreshCw size={11} />
                                <span>Substituir</span>
                              </button>
                            </div>
                          ) : (
                            <p className="text-xs text-neutral-400 truncate">{song.artist}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-neutral-400 font-mono">
                        <span>{song.duration ? formatTime(song.duration) : ''}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-neutral-500 text-xs">
                  Nenhuma faixa encontrada para este item.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: IMPORTADOR UNIVERSAL DE PLAYLISTS (SPOTIFY & YOUTUBE) */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#1e1e1e] border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => {
                setIsImporting(false);
                setIsImportModalOpen(false);
              }}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1DB954] text-black shadow-lg">
                <Link2 size={22} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Importar Playlist por Link</h3>
                <p className="text-xs text-neutral-400">Cole o link público de qualquer playlist do Spotify ou YouTube</p>
              </div>
            </div>

            {isImporting ? (
              <div className="py-8 text-center space-y-4">
                <Loader2 size={36} className="mx-auto text-[#1DB954] animate-spin" />
                <p className="text-sm font-bold text-white">{importProgressText}</p>
                <p className="text-xs text-neutral-400">Extraindo faixas reais e sincronizando com o player...</p>
                <button
                  type="button"
                  onClick={() => {
                    setIsImporting(false);
                    setIsImportModalOpen(false);
                  }}
                  className="mt-4 px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-neutral-300 hover:text-white transition"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-300">Link da Playlist:</label>
                  <input
                    type="text"
                    value={importLinkInput}
                    onChange={(e) => setImportLinkInput(e.target.value)}
                    placeholder="https://open.spotify.com/playlist/... ou https://www.youtube.com/playlist?list=..."
                    className="h-12 w-full rounded-2xl bg-[#121212] border border-white/10 px-4 text-xs text-white placeholder-neutral-500 outline-none focus:border-[#1DB954] transition"
                  />
                </div>

                <div className="rounded-xl bg-white/5 p-3 text-xs text-neutral-400 space-y-1">
                  <p className="font-semibold text-neutral-300">Formatos aceitos:</p>
                  <p>• Spotify: https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M</p>
                  <p>• YouTube: https://www.youtube.com/playlist?list=PLrAlX1vF51V... ou link do YouTube Music</p>
                </div>

                <button
                  onClick={handleImportByUrl}
                  disabled={!importLinkInput.trim()}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#1DB954] hover:bg-[#1ed760] py-3.5 text-xs font-bold text-black shadow-lg disabled:opacity-40 transition"
                >
                  <Check size={16} />
                  <span>Importar Playlist Agora</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE AUTENTICAÇÃO SUPABASE */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onUserChange={(user) => setCurrentUser(user)}
        onSyncPlaylists={handleForceCloudSync}
      />

      {/* MODAL DE CONFIGURAÇÕES, PERFIL & QUALIDADE DO SOM */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        currentUser={currentUser}
        onUserChange={(user) => setCurrentUser(user)}
        playlists={playlists}
        onPlaylistsChange={(nextPls) => {
          setPlaylists(nextPls);
          try {
            const userKey = getUserPlaylistStorageKey(currentUser?.id);
            localStorage.setItem(userKey, JSON.stringify(nextPls));
          } catch {}
        }}
        onSyncPlaylists={handleForceCloudSync}
        downloadedCount={downloadedSongs.length}
      />

      {/* PAINEL LATERAL: FILA DE REPRODUÇÃO (QUEUE DRAWER) COM BACKDROP E DISMISSAL TOUCH-FRIENDLY */}
      {isQueueOpen && (
        <>
          {/* BACKDROP ESCURECIDO CLICÁVEL: Fecha ao tocar fora em qualquer lugar da tela */}
          <div
            onClick={() => setIsQueueOpen(false)}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-30 animate-fade-in"
            aria-label="Fechar Fila de Reprodução"
          />

          <aside className="fixed top-0 bottom-16 sm:bottom-0 right-0 w-full sm:max-w-md bg-[#161616] border-l border-white/10 z-40 p-4 sm:p-6 flex flex-col shadow-2xl animate-fade-in select-none">
            {/* CABEÇALHO DA FILA COM TOUCH TARGET SEGURO */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1DB954]/15 text-[#1DB954]">
                  <ListMusic size={22} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white tracking-tight">Fila de Reprodução</h3>
                  <p className="text-[11px] text-neutral-400 font-medium">
                    {queue.length} {queue.length === 1 ? 'música na lista' : 'músicas na lista'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {queue.length > 1 && (
                  <button
                    onClick={handleClearQueue}
                    className="text-xs font-semibold text-neutral-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition"
                  >
                    Limpar
                  </button>
                )}
                {/* BOTÃO FECHAR TOUCH-FRIENDLY (min 44x44px) */}
                <button
                  onClick={() => setIsQueueOpen(false)}
                  className="flex items-center justify-center h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white transition shadow"
                  title="Fechar Fila"
                  aria-label="Fechar Fila"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pt-4 pr-1">
              {/* SEÇÃO: TOCANDO AGORA */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Tocando Agora
                </span>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-[#1DB954]/20 shadow-md">
                  <img
                    src={activeSong.thumbnail}
                    alt={activeSong.name}
                    className="h-12 w-12 rounded-xl object-cover shadow flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[#1DB954] truncate flex items-center gap-1.5">
                      <span>{activeSong.name}</span>
                      <span className="inline-block h-2 w-2 rounded-full bg-[#1DB954] animate-pulse" />
                    </p>
                    <p className="text-xs text-neutral-400 truncate">{activeSong.artist}</p>
                  </div>
                  <span className="text-xs font-mono text-neutral-400 tabular-nums">
                    {formatTime(activeSong.duration || duration)}
                  </span>
                </div>
              </div>

              {/* SEÇÃO: A SEGUIR NA FILA */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    A Seguir ({Math.max(0, queue.length - 1)})
                  </span>
                  {queue.length > 2 && (
                    <button
                      onClick={() => {
                        const nextQ = [...queue];
                        // Embaralha apenas as próximas faixas da fila
                        const rest = nextQ.filter(s => s.id !== activeSong.id);
                        for (let i = rest.length - 1; i > 0; i--) {
                          const j = Math.floor(Math.random() * (i + 1));
                          [rest[i], rest[j]] = [rest[j], rest[i]];
                        }
                        setQueue([activeSong, ...rest]);
                        showToast('Fila embaralhada!');
                      }}
                      className="flex items-center gap-1 text-[11px] font-semibold text-neutral-400 hover:text-[#1DB954] transition"
                    >
                      <Shuffle size={12} />
                      <span>Embaralhar</span>
                    </button>
                  )}
                </div>

                {queue.length > 1 ? (
                  <div className="space-y-1">
                    {queue
                      .filter((s, idx) => !(s.id === activeSong.id && idx === 0))
                      .map((song, qIdx) => (
                        <div
                          key={`queue-${song.id}-${qIdx}`}
                          onClick={() => playSong(song)}
                          className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 active:bg-white/10 transition cursor-pointer group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-xs font-mono text-neutral-500 w-4 tabular-nums">
                              {qIdx + 1}
                            </span>
                            <img
                              src={song.thumbnail}
                              alt={song.name}
                              className="h-10 w-10 rounded-lg object-cover flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate group-hover:text-[#1DB954]">
                                {song.name}
                              </p>
                              <p className="text-[11px] text-neutral-400 truncate">{song.artist}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono text-neutral-500 tabular-nums">
                              {formatTime(song.duration || 210)}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveFromQueue(qIdx + 1);
                              }}
                              className="p-2 text-neutral-500 hover:text-red-400 transition"
                              title="Remover da fila"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-white/5 border border-dashed border-white/10 text-center space-y-3">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-neutral-400">
                      <ListMusic size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Fila vazia</p>
                      <p className="text-[11px] text-neutral-400 mt-1">
                        Adicione músicas clicando no ícone <ListPlus size={12} className="inline mx-0.5" /> em qualquer playlist.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* BOTÃO DE RODAPÉ FIXO: SAÍDA INSTANTÂNEA E GARANTIDA DA TELA */}
            <div className="pt-4 border-t border-white/10 flex-shrink-0">
              <button
                onClick={() => setIsQueueOpen(false)}
                className="w-full py-3.5 px-4 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-98 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg"
              >
                <span>Voltar ao Player / Fechar</span>
              </button>
            </div>
          </aside>
        </>
      )}

      {/* MINI-PLAYER INFERIOR RESPONSIVO */}
      <div
        onClick={() => setIsFullScreenPlayer(true)}
        className="fixed bottom-16 sm:bottom-0 left-0 right-0 h-20 bg-[#181818] border-t border-white/[0.08] px-3.5 sm:px-6 flex items-center cursor-pointer z-30 hover:bg-[#202020] transition select-none"
      >
        {/* LAYOUT MOBILE (sm:hidden) - Limpo, Descomplicado e Sem Aperto */}
        <div className="flex sm:hidden items-center justify-between w-full gap-2">
          {/* Esquerda: Capa + Título + Artista */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-1">
            <img
              src={activeSong.thumbnail}
              alt={activeSong.name}
              className="h-11 w-11 rounded-lg object-cover shadow flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{activeSong.name}</p>
              <p className="text-[11px] text-neutral-400 truncate mt-0.5">{activeSong.artist}</p>
            </div>
          </div>

          {/* Direita: Controles Essenciais Touch-Friendly */}
          <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            {/* Fila com badge */}
            <button
              onClick={() => setIsQueueOpen(!isQueueOpen)}
              className={`p-2 rounded-xl transition relative ${
                isQueueOpen
                  ? 'bg-[#1DB954]/20 text-[#1DB954]'
                  : 'text-neutral-300 hover:text-white'
              }`}
              title="Abrir Fila de Reprodução"
            >
              <ListMusic size={18} />
              {queue.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-[#1DB954] text-[9px] font-black text-black shadow">
                  {queue.length}
                </span>
              )}
            </button>

            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black active:scale-95 transition shadow ml-0.5"
              title={isPlaying ? "Pausar" : "Tocar"}
            >
              {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
            </button>

            {/* Próxima */}
            <button
              onClick={handleNextSong}
              className="p-2 text-neutral-300 active:text-white transition"
              title="Próxima Faixa"
            >
              <SkipForward size={18} fill="currentColor" />
            </button>
          </div>
        </div>

        {/* LAYOUT DESKTOP (hidden sm:flex) - 3 Colunas Completas com Seeker e Volume */}
        <div className="hidden sm:flex items-center justify-between w-full">
          <div className="flex items-center gap-3 min-w-0 w-1/3">
            <img src={activeSong.thumbnail} alt={activeSong.name} className="h-12 w-12 rounded-lg object-cover shadow" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">{activeSong.name}</p>
              <p className="text-xs text-neutral-400 truncate">{activeSong.artist}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(activeSong.id);
              }}
              className="p-1.5 text-neutral-400 hover:text-white transition"
            >
              <Heart size={18} className={favoriteSongIds.includes(activeSong.id) ? 'fill-[#1DB954] text-[#1DB954]' : ''} />
            </button>
          </div>

          <div className="flex flex-col items-center gap-1.5 w-1/3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-4">
              {/* BOTÃO SHUFFLE NO DESKTOP */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleShuffle();
                }}
                className={`p-1.5 rounded-full transition ${
                  isShuffle ? 'text-[#1DB954] bg-[#1DB954]/15' : 'text-neutral-400 hover:text-white'
                }`}
                title={isShuffle ? 'Modo Aleatório Ativado' : 'Ativar Modo Aleatório'}
              >
                <Shuffle size={16} />
              </button>

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

              {/* BOTÃO REPEAT NO DESKTOP */}
              <button
                onClick={() => {
                  const nextRep = !isRepeat;
                  setIsRepeat(nextRep);
                  showToast(nextRep ? 'Repetir música ativado' : 'Repetição desativada');
                }}
                className={`p-1.5 rounded-full transition ${
                  isRepeat ? 'text-[#1DB954] bg-[#1DB954]/15' : 'text-neutral-400 hover:text-white'
                }`}
                title={isRepeat ? 'Repetir Música Ativado' : 'Ativar Repetição'}
              >
                <Repeat size={16} />
              </button>
            </div>

            <div className="w-full max-w-md flex items-center gap-2">
              <span className="text-[10px] text-neutral-500 font-mono tabular-nums w-8 text-right">
                {formatTime(scrubbingTime !== null ? scrubbingTime : currentTime)}
              </span>
              <AudioScrubber
                currentTime={currentTime}
                duration={duration}
                onSeek={handleSeek}
                className="flex-1"
                barHeight="h-1.5"
                thumbSize="w-3 h-3"
                onScrubbingChange={(isScrubbing, time) => {
                  setScrubbingTime(isScrubbing ? time : null);
                }}
              />
              <span className="text-[10px] text-neutral-500 font-mono tabular-nums w-8">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 sm:gap-3 w-1/3" onClick={(e) => e.stopPropagation()}>
            {/* BOTÃO DA FILA DE EXECUÇÃO */}
            <button
              onClick={() => setIsQueueOpen(!isQueueOpen)}
              className={`p-2 rounded-xl transition relative ${
                isQueueOpen
                  ? 'bg-[#1DB954]/20 text-[#1DB954] border border-[#1DB954]/40'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
              title="Abrir Fila de Reprodução"
            >
              <ListMusic size={18} />
              {queue.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-[#1DB954] text-[9px] font-black text-black shadow">
                  {queue.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setSongToAddToPlaylist(activeSong);
                setIsAddToPlaylistModalOpen(true);
              }}
              className="text-neutral-400 hover:text-white transition p-1.5"
              title="Adicionar à Playlist"
            >
              <ListPlus size={18} />
            </button>
            <button
              onClick={() => handleDownloadSong(activeSong)}
              className="text-neutral-400 hover:text-white transition p-1.5"
              title="Baixar Música"
            >
              <Download size={18} />
            </button>
            <div className="flex items-center gap-2">
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
      </div>

      {/* FULL SCREEN PLAYER MODAL */}
      {isFullScreenPlayer && (
        <div className="fixed inset-0 z-[60] bg-[#121212] flex flex-col justify-between p-5 sm:p-8 animate-fade-in select-none h-[100dvh] max-h-[100dvh] overflow-y-auto pb-[calc(env(safe-area-inset-bottom,16px)+20px)] pt-[env(safe-area-inset-top,16px)]">
          <div className="flex items-center justify-between flex-shrink-0">
            <button
              onClick={() => setIsFullScreenPlayer(false)}
              className="rounded-full p-2 text-neutral-400 hover:text-white hover:bg-white/10 transition"
              title="Minimizar Player"
            >
              <ChevronDown size={28} />
            </button>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Tocando Agora</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setSongToAddToPlaylist(currentSong);
                  setIsAddToPlaylistModalOpen(true);
                }}
                className="rounded-full p-2 text-neutral-400 hover:text-white hover:bg-white/10 transition"
                title="Adicionar à Playlist"
              >
                <ListPlus size={22} />
              </button>
              <button
                onClick={() => handleDownloadSong(currentSong)}
                className="rounded-full p-2 text-neutral-400 hover:text-white hover:bg-white/10 transition"
                title="Baixar Música"
              >
                <Download size={22} />
              </button>
            </div>
          </div>

          {/* CAPA RESPONSIVA: CSS Units dvh / % para jamais transbordar em telas mobile */}
          <div className="my-auto flex items-center justify-center w-full min-h-0 flex-1 py-2 sm:py-4">
            <div className="w-auto h-full max-h-[35vh] sm:max-h-[44vh] aspect-square rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/10 flex-shrink">
              <img src={activeSong.thumbnail} alt={activeSong.name} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* CONTROLES E SCRUBBER: Compactos e Perfeitamente Visíveis */}
          <div className="max-w-md mx-auto w-full space-y-4 sm:space-y-6 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <h2 className="text-xl sm:text-2xl font-black text-white truncate">{activeSong.name}</h2>
                <p className="text-xs sm:text-sm text-neutral-400 font-medium truncate mt-0.5">{activeSong.artist}</p>
              </div>
              <button onClick={() => toggleFavorite(currentSong.id)} className="p-2 text-neutral-400 hover:text-white">
                <Heart size={24} className={favoriteSongIds.includes(currentSong.id) ? 'fill-[#1DB954] text-[#1DB954]' : ''} />
              </button>
            </div>

            <div>
              <AudioScrubber
                currentTime={currentTime}
                duration={duration}
                onSeek={handleSeek}
                className="w-full"
                barHeight="h-2"
                thumbSize="w-4 h-4"
                showThumbAlways={true}
                onScrubbingChange={(isScrubbing, time) => {
                  setScrubbingTime(isScrubbing ? time : null);
                }}
              />
              <div className="flex justify-between text-xs font-mono text-neutral-400 mt-1">
                <span className="tabular-nums">
                  {formatTime(scrubbingTime !== null ? scrubbingTime : currentTime)}
                </span>
                <span className="tabular-nums">{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 sm:pt-2">
              <button
                onClick={toggleShuffle}
                className={`p-2 transition ${isShuffle ? 'text-[#1DB954]' : 'text-neutral-400 hover:text-white'}`}
                title={isShuffle ? 'Modo Aleatório Ativado' : 'Ativar Modo Aleatório'}
              >
                <Shuffle size={20} />
              </button>

              <button onClick={handlePrevSong} className="p-2 text-white hover:scale-110 active:scale-95 transition">
                <SkipBack size={28} fill="currentColor" />
              </button>

              <button
                onClick={togglePlay}
                className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-white text-black shadow-2xl hover:scale-105 active:scale-95 transition"
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

      {/* BOTTOM NAVIGATION TABS (Mobile - Oculto quando o player fullscreen está ativo) */}
      {!isFullScreenPlayer && (
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#121212]/95 border-t border-white/[0.08] backdrop-blur-lg flex items-center justify-around z-40 sm:hidden">
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
                  setIsQueueOpen(false);
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
      )}

      </div>
    </div>
  );
}
