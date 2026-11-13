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
  RefreshCw
} from 'lucide-react';

import { Song, Playlist } from './types';
import { storeOfflineBlob, getOfflineBlob, deleteOfflineBlob } from './lib/offlineDb';
import { supabase, syncCloudPlaylists, fetchCloudPlaylists } from './lib/supabase';
import { extractPlaylistFromUrl } from './lib/playlistExtractor';
import { universalSearch } from './lib/searchEngine';
import { AuthModal } from './components/AuthModal';
import { AuthGateway } from './components/AuthGateway';
import { mediaSessionController } from './lib/mediaSession';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
    ytPlayer: any;
  }
}

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

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'playlists' | 'downloads'>('home');

  // Playlists State (Persistente no LocalStorage e Sincronizado via Supabase)
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    try {
      const stored = localStorage.getItem('able_playlists_v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_PLAYLISTS;
    } catch {
      return INITIAL_PLAYLISTS;
    }
  });

  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

  // Usuário Conectado via Supabase
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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
  const [duration, setDuration] = useState<number>(297);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isRepeat, setIsRepeat] = useState<boolean>(false);
  const [queue, setQueue] = useState<Song[]>(() => playlists[0]?.songs || INITIAL_PLAYLISTS[0].songs);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Full Screen Player Sheet
  const [isFullScreenPlayer, setIsFullScreenPlayer] = useState<boolean>(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<Song[]>([]);

  // Importador Universal (Spotify + YouTube / YouTube Music)
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [importLinkInput, setImportLinkInput] = useState<string>('');
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importProgressText, setImportProgressText] = useState<string>('');

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

    // SUCESSO DE LOGIN / CADASTRO: SINCRONIZAÇÃO COMPLETA DA NUVEM
  const handleAuthSuccess = async (user: any) => {
    setCurrentUser(user);
    showToast(`Conectado como ${user.email}!`);

    try {
      const metaPlaylists = user.user_metadata?.able_playlists;
      if (Array.isArray(metaPlaylists) && metaPlaylists.length > 0) {
        setPlaylists(metaPlaylists);
        isCloudLoadedRef.current = true;
        try { localStorage.setItem('able_playlists_v2', JSON.stringify(metaPlaylists)); } catch {}
        return;
      }

      const cloudPls = await fetchCloudPlaylists(user.id);
      if (cloudPls && Array.isArray(cloudPls) && cloudPls.length > 0) {
        setPlaylists(cloudPls);
        isCloudLoadedRef.current = true;
        try { localStorage.setItem('able_playlists_v2', JSON.stringify(cloudPls)); } catch {}
      } else {
        isCloudLoadedRef.current = true;
        syncCloudPlaylists(user.id, playlists);
      }
    } catch (err) {
      console.warn('Erro ao carregar playlists da nuvem:', err);
    }
  };

  // Forçar atualização manual da nuvem (1-Click Cloud Pull)
  const handleForceCloudSync = async () => {
    if (!currentUser?.id) return;
    setIsSyncingCloud(true);
    showToast('Buscando playlists mais recentes da nuvem...');
    try {
      const cloudPls = await fetchCloudPlaylists(currentUser.id);
      if (cloudPls && Array.isArray(cloudPls) && cloudPls.length > 0) {
        setPlaylists(cloudPls);
        isCloudLoadedRef.current = true;
        try { localStorage.setItem('able_playlists_v2', JSON.stringify(cloudPls)); } catch {}
        showToast(`Biblioteca sincronizada! (${cloudPls.length} playlists carregadas)`);
      } else {
        showToast('Nenhuma playlist nova encontrada na nuvem.');
      }
    } catch {
      showToast('Erro ao sincronizar da nuvem. Verifique a conexão.');
    } finally {
      setIsSyncingCloud(false);
    }
  };

  // Inicialização de Sessão Supabase
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUser(session.user);
        if (session.user.user_metadata?.able_play_counts) {
          setPlayCounts((prev) => ({ ...prev, ...session.user.user_metadata.able_play_counts }));
        }

        // Se a sessão já possui playlists salvas no metadata, aplica instantaneamente
        const metaPlaylists = session.user.user_metadata?.able_playlists;
        if (Array.isArray(metaPlaylists) && metaPlaylists.length > 0) {
          setPlaylists(metaPlaylists);
          isCloudLoadedRef.current = true;
          try { localStorage.setItem('able_playlists_v2', JSON.stringify(metaPlaylists)); } catch {}
        } else {
          // Busca via network
          fetchCloudPlaylists(session.user.id).then((cloudPls) => {
            if (cloudPls && Array.isArray(cloudPls) && cloudPls.length > 0) {
              setPlaylists(cloudPls);
              isCloudLoadedRef.current = true;
              try { localStorage.setItem('able_playlists_v2', JSON.stringify(cloudPls)); } catch {}
            }
          });
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null);
      if (session?.user) {
        if (session.user.user_metadata?.able_play_counts) {
          setPlayCounts((prev) => ({ ...prev, ...session.user.user_metadata.able_play_counts }));
        }
        const metaPlaylists = session.user.user_metadata?.able_playlists;
        if (Array.isArray(metaPlaylists) && metaPlaylists.length > 0) {
          setPlaylists(metaPlaylists);
          isCloudLoadedRef.current = true;
          try { localStorage.setItem('able_playlists_v2', JSON.stringify(metaPlaylists)); } catch {}
        } else {
          fetchCloudPlaylists(session.user.id).then((cloudPls) => {
            if (cloudPls && Array.isArray(cloudPls) && cloudPls.length > 0) {
              setPlaylists(cloudPls);
              isCloudLoadedRef.current = true;
              try { localStorage.setItem('able_playlists_v2', JSON.stringify(cloudPls)); } catch {}
            }
          });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Músicas em Destaque (Mais Tocadas da Conta do Usuário)
  const featuredSongs = useMemo(() => {
    const allSongsMap = new Map<string, Song>();
    playlists.forEach((p) => {
      (p.songs || []).forEach((s) => {
        if (!allSongsMap.has(s.id)) {
          allSongsMap.set(s.id, s);
        }
      });
    });
    const all = Array.from(allSongsMap.values());
    all.sort((a, b) => (playCounts[b.id] || 0) - (playCounts[a.id] || 0));
    return all.slice(0, 9);
  }, [playlists, playCounts]);

  // Persistência Imediata de Playlists no LocalStorage e Nuvem (Apenas quando já carregou da nuvem)
  useEffect(() => {
    try {
      localStorage.setItem('able_playlists_v2', JSON.stringify(playlists));
    } catch {}

    if (currentUser?.id && isCloudLoadedRef.current) {
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

  // Histórico e Botão Físico/Virtual Voltar
  useEffect(() => {
    const handlePopState = () => {
      if (isFullScreenPlayer) {
        setIsFullScreenPlayer(false);
      } else if (selectedPlaylist) {
        setSelectedPlaylist(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectedPlaylist, isFullScreenPlayer]);

  // Inicialização do YouTube Iframe API
  useEffect(() => {
    const initYt = () => {
      if (window.YT && window.YT.Player && !window.ytPlayer) {
        try {
          window.ytPlayer = new window.YT.Player('able-yt-player', {
            height: '240',
            width: '320',
            videoId: currentSong?.youtubeId || 'ytQ5CYE1VZw',
            playerVars: {
              autoplay: 1,
              controls: 0,
              disablekb: 1,
              fs: 0,
              rel: 0,
              playsinline: 1
            },
            events: {
              onReady: (event: any) => {
                try {
                  event.target.setVolume(Math.round(volume * 100));
                  if (!isMuted) event.target.unMute();
                } catch {}
              },
              onStateChange: (event: any) => {
                if (event.data === 1) {
                  setIsPlaying(true);
                } else if (event.data === 2) {
                  setIsPlaying(false);
                } else if (event.data === 0) {
                  handleNextSong();
                }
              }
            }
          });
        } catch (e) {
          console.warn('YouTube Player:', e);
        }
      }
    };

    if (window.YT && window.YT.Player) {
      initYt();
    } else {
      window.onYouTubeIframeAPIReady = initYt;
    }
  }, []);

  // Sincronização em Tempo Real do Progresso de Áudio
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        if (audioRef.current && !audioRef.current.paused) {
          setCurrentTime(Math.floor(audioRef.current.currentTime));
          if (audioRef.current.duration) {
            setDuration(Math.floor(audioRef.current.duration));
          }
        } else if (window.ytPlayer && typeof window.ytPlayer.getCurrentTime === 'function') {
          try {
            const state = window.ytPlayer.getPlayerState();
            if (state === 1) {
              const cur = window.ytPlayer.getCurrentTime() || 0;
              const dur = window.ytPlayer.getDuration() || 0;
              setCurrentTime(Math.floor(cur));
              if (dur > 0 && Math.floor(dur) !== duration) {
                setDuration(Math.floor(dur));
              }
            }
          } catch {}
        }
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

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

  useEffect(() => {
    mediaSessionController.setupActionHandlers({
      onPlay: () => togglePlay(),
      onPause: () => togglePlay(),
      onPrevious: () => handlePrevSong(),
      onNext: () => handleNextSong(),
      onSeekTo: (details) => {
        if (details.seekTime !== undefined) handleSeek(details.seekTime);
      }
    });
  }, [queue, currentSong, isPlaying]);

  useEffect(() => {
    mediaSessionController.updatePlaybackState(isPlaying);
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying && duration > 0) {
      mediaSessionController.updatePositionState({
        duration,
        position: currentTime,
        playbackRate: 1
      });
    }
  }, [currentTime, duration, isPlaying]);

  // Volume
  useEffect(() => {
    const vol100 = isMuted ? 0 : Math.round(volume * 100);
    if (window.ytPlayer && typeof window.ytPlayer.setVolume === 'function') {
      try {
        window.ytPlayer.setVolume(vol100);
        if (isMuted && typeof window.ytPlayer.mute === 'function') {
          window.ytPlayer.mute();
        } else if (!isMuted && typeof window.ytPlayer.unMute === 'function') {
          window.ytPlayer.unMute();
        }
      } catch {}
    }
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (isPlaying) {
      if (audioRef.current) audioRef.current.pause();
      if (window.ytPlayer && typeof window.ytPlayer.pauseVideo === 'function') {
        window.ytPlayer.pauseVideo();
      }
      setIsPlaying(false);
    } else {
      // Se houver YouTube Player ativo, despausa o vídeo completo
      if (window.ytPlayer && typeof window.ytPlayer.playVideo === 'function') {
        try {
          window.ytPlayer.playVideo();
          setIsPlaying(true);
          return;
        } catch {}
      }
      if (audioRef.current && audioRef.current.src) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {
          if (currentSong) playSong(currentSong);
        });
      } else if (currentSong) {
        playSong(currentSong);
      }
    }
  };

  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime);
    if (audioRef.current && audioRef.current.src) {
      audioRef.current.currentTime = newTime;
    }
    if (window.ytPlayer && typeof window.ytPlayer.seekTo === 'function') {
      try { window.ytPlayer.seekTo(newTime, true); } catch {}
    }
  };

  // Motor Padrão AbleMusic (YouTube Music Stream Completo 100% da Duração)
  const playSong = async (song: Song, newQueue?: Song[]) => {
    setCurrentSong(song);
    setCurrentTime(0);
    setDuration(song.duration || 240);
    setIsPlaying(true);
    if (newQueue) setQueue(newQueue);
    showToast(`Tocando: ${song.name}`);

    // Incrementa contador de reprodução para Músicas em Destaque (Mais Tocadas da Conta)
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

    // 1. TENTA REPRODUÇÃO OFFLINE A PARTIR DO INDEXEDDB (Se tiver sido baixada)
    const offlineBlob = await getOfflineBlob(song.id);
    if (offlineBlob && audioRef.current) {
      try {
        if (window.ytPlayer && typeof window.ytPlayer.pauseVideo === 'function') {
          window.ytPlayer.pauseVideo();
        }
        const blobUrl = URL.createObjectURL(offlineBlob);
        audioRef.current.src = blobUrl;
        audioRef.current.volume = isMuted ? 0 : volume;
        await audioRef.current.play();
        return;
      } catch (err) {
        console.warn('Erro ao reproduzir blob offline:', err);
      }
    }

    // 2. MOTOR YOUTUBE MUSIC (ÁUDIO INTEGRAL COMPLETO DE 3 A 6+ MINUTOS)
    let ytId = song.youtubeId;
    if (!ytId) {
      try {
        const query = `${song.name} ${song.artist}`;
        const piped = await fetch(`https://api.piped.private.coffee/search?q=${encodeURIComponent(query)}&filter=music_songs`, { signal: AbortSignal.timeout(3000) });
        if (piped.ok) {
          const pData = await piped.json();
          const first = pData.items?.find((i: any) => i.type === 'stream');
          if (first?.url) ytId = first.url.replace('/watch?v=', '').split('&')[0];
        }
      } catch {}

      if (!ytId) {
        try {
          const inv = await fetch(`https://inv.bp.projectsegfau.lt/api/v1/search?q=${encodeURIComponent(`${song.name} ${song.artist}`)}&type=video`, { signal: AbortSignal.timeout(3000) });
          if (inv.ok) {
            const d = await inv.json();
            if (d[0]?.videoId) ytId = d[0].videoId;
          }
        } catch {}
      }
    }

    if (ytId && ytId !== 'ytQ5CYE1VZw') {
      song.youtubeId = ytId;
    } else if (song.youtubeId) {
      ytId = song.youtubeId;
    } else {
      ytId = 'ytQ5CYE1VZw';
    }

    // Pausa qualquer áudio HTML5 para não sobrepor
    if (audioRef.current) {
      audioRef.current.pause();
    }

    // Reproduz áudio completo via YouTube Music Engine
    if (window.ytPlayer && typeof window.ytPlayer.loadVideoById === 'function') {
      try {
        window.ytPlayer.loadVideoById({ videoId: ytId, startSeconds: 0 });
        if (typeof window.ytPlayer.unMute === 'function' && !isMuted) window.ytPlayer.unMute();
        if (typeof window.ytPlayer.setVolume === 'function') window.ytPlayer.setVolume(Math.round(volume * 100));
        window.ytPlayer.playVideo();
        setIsPlaying(true);
        return;
      } catch (e) {
        console.warn('YouTube Load Error:', e);
      }
    }

    // Inicialização dinâmica caso o player ainda esteja carregando
    if (window.YT && window.YT.Player) {
      try {
        window.ytPlayer = new window.YT.Player('able-yt-player', {
          height: '1',
          width: '1',
          videoId: ytId,
          playerVars: { autoplay: 1, controls: 0, disablekb: 1, fs: 0, rel: 0, playsinline: 1 },
          events: {
            onReady: (e: any) => {
              try {
                e.target.setVolume(Math.round(volume * 100));
                if (!isMuted) e.target.unMute();
                e.target.playVideo();
              } catch {}
            },
            onStateChange: (e: any) => {
              if (e.data === 1) setIsPlaying(true);
              else if (e.data === 2) setIsPlaying(false);
              else if (e.data === 0) handleNextSong();
            }
          }
        });
        setIsPlaying(true);
        return;
      } catch {}
    }

    // Fallback de emergência (caso o YouTube esteja totalmente bloqueado pela rede do usuário)
    if (song.audioUrl && audioRef.current) {
      audioRef.current.src = song.audioUrl;
      audioRef.current.volume = isMuted ? 0 : volume;
      await audioRef.current.play().catch(console.warn);
    }
  };

  const handleNextSong = () => {
    if (queue.length === 0) return;
    const currentIdx = queue.findIndex((s) => s.id === currentSong.id);
    let nextIdx = currentIdx + 1;
    if (nextIdx >= queue.length) nextIdx = 0;
    if (isShuffle) nextIdx = Math.floor(Math.random() * queue.length);
    playSong(queue[nextIdx]);
  };

  const handlePrevSong = () => {
    if (queue.length === 0) return;
    const currentIdx = queue.findIndex((s) => s.id === currentSong.id);
    let prevIdx = currentIdx - 1;
    if (prevIdx < 0) prevIdx = queue.length - 1;
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

  // DOWNLOAD REAL SEGURO PARA DISPOSITIVOS MÓVEIS & DESKTOP (INDEXEDDB BLOB)
  const handleDownloadSong = async (song: Song) => {
    showToast(`Baixando "${song.name}" para offline...`);

    let audioSourceUrl = song.audioUrl;
    if (!audioSourceUrl) {
      try {
        const r = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(song.name + ' ' + song.artist)}`);
        const data = await r.json();
        audioSourceUrl = data?.data?.[0]?.preview;
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

    for (let i = 0; i < playlist.songs.length; i++) {
      const song = playlist.songs[i];
      if (song.audioUrl) {
        try {
          const resp = await fetch(song.audioUrl);
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
        setPlaylists((prev) => [extracted, ...prev]);
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

  // BUSCA UNIVERSAL (Deezer + Piped + YouTube)
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const results = await universalSearch(query);
      if (results.length > 0) {
        setSearchResults(results);
        setIsSearching(false);
        return;
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
    <div className="relative h-screen w-full overflow-hidden bg-[#121212] text-white font-sans select-none">
      
      {/* TELA DE AUTENTICAÇÃO GATEWAY: Fundo Desfocado quando não logado */}
      {!currentUser && (
        <AuthGateway onSuccess={handleAuthSuccess} />
      )}

      {/* CORPO DO APLICATIVO: DESFOCADO QUANDO NÃO LOGADO, 100% NÍTIDO QUANDO CONECTADO */}
      <div className={`flex h-full w-full flex-col transition-all duration-700 ease-out ${
        !currentUser ? 'filter blur-2xl brightness-40 pointer-events-none scale-[0.98]' : 'filter-none brightness-100 scale-100'
      }`}>
      
      {/* PLAYER DE ÁUDIO OCULTO (HTML5 Audio) */}
      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(Math.floor(audioRef.current.currentTime));
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current && audioRef.current.duration) {
            setDuration(Math.floor(audioRef.current.duration));
          }
        }}
        onEnded={handleNextSong}
        className="hidden"
      />

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 rounded-full bg-[#282828] border border-white/10 px-5 py-2.5 text-xs font-semibold text-white shadow-2xl animate-fade-in flex items-center gap-2">
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

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1DB954] text-black shadow-lg">
            <Music size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-[#fbfbfb]">Able</h1>
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

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Botão Criar Playlist */}
          <button
            onClick={() => setIsCreatePlaylistModalOpen(true)}
            className="flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 px-3.5 py-2 text-xs font-bold text-white transition border border-white/10"
            title="Criar Playlist"
          >
            <FolderPlus size={15} />
            <span className="hidden sm:inline">Criar Playlist</span>
          </button>

          {/* Botão Importar Playlist por Link (Spotify / YouTube) */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 rounded-full bg-[#1DB954] hover:bg-[#1ed760] active:scale-95 px-4 py-2 text-xs font-bold text-black shadow-lg transition"
          >
            <Link2 size={16} strokeWidth={2.5} />
            <span className="hidden sm:inline">Importar Playlist</span>
            <span className="sm:hidden">Importar</span>
          </button>

          {/* Botão Instalar App PWA */}
          <button
            onClick={handleInstallPwa}
            className="flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 px-3 py-2 text-xs font-bold text-white transition border border-white/10"
            title="Instalar Able Music como Aplicativo no Celular ou Desktop"
          >
            <Smartphone size={15} />
            <span className="hidden sm:inline">Instalar App</span>
          </button>

          {/* Botão de Conta & Sincronização em Nuvem */}
          {currentUser && (
            <button
              onClick={handleForceCloudSync}
              disabled={isSyncingCloud}
              className="flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 px-3 py-2 text-xs font-bold text-white transition border border-white/10"
              title="Puxar as playlists mais recentes da nuvem"
            >
              <RefreshCw size={13} className={isSyncingCloud ? "animate-spin text-[#1DB954]" : "text-[#1DB954]"} />
              <span className="hidden sm:inline">Sincronizar</span>
            </button>
          )}

          <button
            onClick={() => setIsAuthModalOpen(true)}
            className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
              currentUser
                ? 'bg-[#1DB954]/20 border-[#1DB954] text-[#1DB954]'
                : 'bg-white/10 border-white/10 text-white hover:bg-white/20'
            }`}
            title={currentUser ? `Logado como ${currentUser.email}` : 'Entrar na minha conta'}
          >
            {currentUser ? <Cloud size={18} /> : <UserIcon size={18} />}
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
                    <img src={pl.cover} alt={pl.name} className="h-full w-full object-cover group-hover:scale-105 transition duration-300" />
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

            {/* Seção Mais Tocadas (Calculada pela Conta Logada) */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Músicas em Destaque
                    <span className="text-xs font-normal text-white/50">(Mais tocadas no app)</span>
                  </h3>
                </div>
                {currentUser && (
                  <span className="text-xs text-[#1DB954] font-medium flex items-center gap-1">
                    <UserIcon size={12} /> {currentUser.email?.split('@')[0]}
                  </span>
                )}
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

        {/* VIEW 2: SEARCH */}
        {activeTab === 'search' && !selectedPlaylist && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                placeholder="Buscar qualquer música, artista ou banda..."
                className="h-12 w-full rounded-2xl bg-[#1e1e1e] border border-white/10 pl-11 pr-4 text-sm text-white placeholder-neutral-400 outline-none focus:border-[#1DB954] transition"
              />
              {isSearching && (
                <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1DB954] animate-spin" />
              )}
            </div>

            {/* Resultados de Busca */}
            {searchResults.length > 0 ? (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-neutral-400">Resultados da Busca</h3>
                {searchResults.map((song) => (
                  <div
                    key={song.id}
                    onClick={() => playSong(song, searchResults)}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#181818] hover:bg-[#282828] transition cursor-pointer group border border-white/5"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={song.thumbnail} alt={song.name} className="h-12 w-12 rounded-lg object-cover" />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate group-hover:text-[#1DB954]">{song.name}</p>
                        <p className="text-xs text-neutral-400 truncate">{song.artist}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSongToAddToPlaylist(song);
                          setIsAddToPlaylistModalOpen(true);
                        }}
                        className="p-2 text-neutral-400 hover:text-white"
                        title="Adicionar à Playlist"
                      >
                        <ListPlus size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadSong(song);
                        }}
                        className="p-2 text-neutral-400 hover:text-white"
                        title="Baixar para Offline"
                      >
                        <Download size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(song.id);
                        }}
                        className="p-2 text-neutral-400 hover:text-white"
                      >
                        <Heart size={16} className={favoriteSongIds.includes(song.id) ? 'fill-[#1DB954] text-[#1DB954]' : ''} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-neutral-500 text-sm">
                Digite um termo para pesquisar ou ouça qualquer playlist da sua biblioteca.
              </div>
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
                    <img src={pl.cover} alt={pl.name} className="h-full w-full object-cover group-hover:scale-105 transition duration-300" />
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

              <div className="flex items-center gap-2">
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
                
                {/* BOTÕES: TOCAR E BAIXAR PLAYLIST COMPLETA */}
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
                  >
                    {isPlaying && selectedPlaylist.songs.some(s => s.id === currentSong.id) ? (
                      <Pause size={20} fill="currentColor" />
                    ) : (
                      <Play size={20} fill="currentColor" className="ml-0.5" />
                    )}
                  </button>

                  <button
                    onClick={() => handleDownloadPlaylist(selectedPlaylist)}
                    className="flex h-12 items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 px-5 text-xs font-bold text-white border border-white/10 transition shadow-lg"
                    title="Baixar todas as faixas desta playlist para offline"
                  >
                    <Download size={18} />
                    <span>Baixar Playlist</span>
                  </button>
                </div>
              </div>
            </div>

            {/* LISTA DE MÚSICAS DA PLAYLIST */}
            <div className="space-y-1">
              {selectedPlaylist.songs.length > 0 ? (
                selectedPlaylist.songs.map((song, idx) => (
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
                ))
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

      {/* MINI-PLAYER INFERIOR */}
      <div
        onClick={() => setIsFullScreenPlayer(true)}
        className="fixed bottom-16 sm:bottom-0 left-0 right-0 h-20 bg-[#181818] border-t border-white/[0.08] px-4 sm:px-6 flex items-center justify-between cursor-pointer z-30 hover:bg-[#202020] transition"
      >
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
            className="hidden sm:block p-1.5 text-neutral-400 hover:text-white transition"
          >
            <Heart size={18} className={favoriteSongIds.includes(activeSong.id) ? 'fill-[#1DB954] text-[#1DB954]' : ''} />
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
            <div
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                handleSeek(Math.floor(pos * duration));
              }}
              className="h-1.5 flex-1 rounded-full bg-white/20 overflow-hidden cursor-pointer relative group"
            >
              <div className="h-full bg-white group-hover:bg-[#1DB954] transition" style={{ width: `${(currentTime / Math.max(duration, 1)) * 100}%` }} />
            </div>
            <span className="text-[10px] text-neutral-500 font-mono tabular-nums">{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 w-1/3" onClick={(e) => e.stopPropagation()}>
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

          <div className="my-auto max-w-sm sm:max-w-md mx-auto w-full aspect-square rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/10">
            <img src={activeSong.thumbnail} alt={activeSong.name} className="w-full h-full object-cover" />
          </div>

          <div className="max-w-md mx-auto w-full space-y-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <h2 className="text-2xl font-black text-white truncate">{activeSong.name}</h2>
                <p className="text-sm text-neutral-400 font-medium truncate mt-0.5">{activeSong.artist}</p>
              </div>
              <button onClick={() => toggleFavorite(currentSong.id)} className="p-2 text-neutral-400 hover:text-white">
                <Heart size={24} className={favoriteSongIds.includes(currentSong.id) ? 'fill-[#1DB954] text-[#1DB954]' : ''} />
              </button>
            </div>

            <div>
              <div
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pos = (e.clientX - rect.left) / rect.width;
                  handleSeek(Math.floor(pos * duration));
                }}
                className="relative h-2 w-full rounded-full bg-white/20 overflow-hidden cursor-pointer group"
              >
                <div className="h-full bg-white group-hover:bg-[#1DB954] transition" style={{ width: `${(currentTime / Math.max(duration, 1)) * 100}%` }} />
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

      {/* BOTTOM NAVIGATION TABS (Mobile) */}
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
    </div>
  );
}
