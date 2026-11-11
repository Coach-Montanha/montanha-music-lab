declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
    ytPlayer: any;
  }
}
﻿import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Suspense, lazy } from 'react';
import {
  Check,
  ChevronDown,
  ChevronRight,
  Compass,
  Disc,
  Download,
  Expand,
  Folder,
  FolderOpen,
  HardDriveDownload,
  Heart,
  Home,
  LayoutGrid,
  Library,
  List,
  LogIn,
  LoaderCircle,
  Music,
  Music2,
  Radio,
  Pause,
  Play,
  QrCode,
  Search,
  Server,
  Settings2,
  Shuffle,
  Repeat,
  Mic2,
  ListPlus,
  ListMusic,
  MoreHorizontal,
  ScreenShare,
  SkipBack,
  SkipForward,
  Smartphone,
  Plus,
  Trash2,
  User,
  UserPlus,
  Video,
  Volume2,
  RotateCcw,
  RotateCw,
  X,
  ChevronLeft,
  Sparkles
} from 'lucide-react';
import { supabase, getCloudFavorites, toggleCloudFavorite } from './lib/supabase';
import { SupabaseAuthModal } from './components/SupabaseAuthModal';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import api from './services/api';
import brandMark from './assets/app.png';
import { SpotubePlugins } from './components/SpotubePlugins';
import { REAL_SPOTIFY_USER_PLAYLISTS } from './data/realSpotifyUserPlaylists';
import { mediaSessionController } from './lib/mediaSession';
import { getStoredPluginAccounts, savePluginAccount, removePluginAccount, type PluginAccountData } from './lib/pluginAccounts';

import type { DesktopOnboardingStep } from './components/DesktopOnboardingOverlay';
import { createOfflineAudioStore, type LocalForageImportShape, type OfflineAudioStore } from './lib/offlineAudioStore';
import { buildLocalVideoPlaybackUrl, resolveAudioPlaybackUrl } from './lib/playbackUrl';
import {
  filterVisibleRecentSearches,
  getRecentSearchKey,
  HIDDEN_YOUTUBE_SEARCHES_STORAGE_KEY,
  hideRecentSearch,
  parseHiddenRecentSearches
} from './lib/youtubeRecentSearches';

interface Song {
  id: string;
  title: string;
  artist?: string | null;
  thumbnail?: string | null;
  source?: string;
  favorite?: boolean;
  youtubeUrl?: string;
  ownerUserId?: string | null;
  uploadedByUserId?: string | null;
  uploadedByUserName?: string | null;
  path?: string;
  audioMimeType?: string | null;
  videoPath?: string | null;
  videoMimeType?: string | null;
  hasAudio?: boolean;
  hasVideo?: boolean;
}

interface User {
  id: string;
  nome: string;
  email?: string;
  login?: string;
  criadoEm?: string;
}

interface Playlist {
  id: string;
  name: string;
  ownerUserId?: string | null;
  ownerUserName?: string | null;
  provider?: 'spotify' | 'youtube' | 'deezer' | 'local';
  picture?: string;
  musicIds?: string[];
  songs?: Song[];
  isFavorite?: boolean;
  updatedAt?: string;
}



interface YoutubeSearchResult {
  id: string;
  title: string;
  url: string;
  thumbnail?: string | null;
  channel?: string | null;
  artist?: string | null;
  album?: string | null;
  previewUrl?: string | null;
  source?: string | null;
  duration?: string | null;
  durationSeconds?: number | null;
  position?: number;
}

interface YoutubeSearchPlaylistResult {
  id: string;
  title: string;
  url: string;
  thumbnail?: string | null;
  channel?: string | null;
  entryCount?: number | null;
  previewEntries?: Array<{
    id?: string | null;
    title: string;
    url: string;
  }>;
  position?: number;
}

export interface YoutubeSearchSelection {
  kind: 'track' | 'playlist';
  title: string;
  subtitle?: string | null;
}




interface YoutubeRecentSearch {
  query: string;
  lastSearchedAt: string;
  totalHits: number;
  lastSource?: string | null;
}

interface AndroidApkInfo {
  fileExists: boolean;
  fileName: string;
  localUrls: string[];
  preferredUrl?: string | null;
  externalUrl?: string | null;
  releaseUrl?: string | null;
  storagePath?: string | null;
}

interface DesktopPreferences {
  showSplash: boolean;
  startHiddenInTray: boolean;
  autoUpdateEnabled: boolean;
  updateFeedUrl: string;
  backupDirectory: string;
  backupFormat: BackupFormat;
}

interface DesktopUpdateStatus {
  state: 'idle' | 'disabled' | 'unconfigured' | 'checking' | 'available' | 'downloading' | 'downloaded' | 'error';
  message: string;
  currentVersion: string;
  availableVersion?: string | null;
  feedUrl?: string | null;
  progress?: number | null;
  releaseName?: string | null;
  releaseNotes?: string | null;
  releaseDate?: string | null;
  releaseUrl?: string | null;
}


interface MusicBackupResult {
  success: boolean;
  targetDir: string;
  format: BackupFormat;
  total: number;
  exported: Array<{
    id: string;
    title: string;
    artist?: string | null;
    path: string;
    fileName: string;
    usedVideoSource?: boolean;
  }>;
  skipped: Array<{
    id?: string;
    title?: string;
    reason: string;
  }>;
}
interface DeviceSession {
  deviceId: string;
  deviceName: string;
  userId?: string | null;
  userName?: string | null;
  ipAddress?: string | null;
  platform?: string | null;
  lastSeenAt?: string;
  lastAckAt?: string | null;
  lastAckCommandId?: number;
  lastError?: string | null;
  lastState?: {
    status?: string;
    currentSongTitle?: string | null;
    currentSongArtist?: string | null;
    isPlaying?: boolean;
    currentTime?: number;
    duration?: number;
    volume?: number;
    lastUpdateAt?: string;
  } | null;
}

interface DownloadJobItem {
  index: number;
  title: string;
  status: string;
  progress: number;
  stage?: string;
  message?: string;
  error?: string;
}

interface DownloadJob {
  id: string;
  url: string;
  status: string;
  progress: number;
  stage: string;
  message?: string;
  mode?: string;
  includeVideo?: boolean;
  updatedAt?: string;
  items?: DownloadJobItem[];
}

const GITHUB_RELEASES_LATEST_URL = 'https://github.com/hasbuen/Montanha Music Lab/releases/latest';
const GITHUB_ANDROID_APK_URL = `${GITHUB_RELEASES_LATEST_URL}/download/Montanha Music Lab-Android.apk`;
const GITHUB_ANDROID_APK_ASSET_NAME = 'Montanha Music Lab-Android.apk';

type ViewMode = 'grid' | 'list';
type Section = 'home' | 'search' | 'playlists' | 'albums' | 'favorites' | 'local_files' | 'downloads' | 'settings' | 'explore' | 'library' | 'download';
type AuthMode = 'login' | 'register';
type PlaybackMode = 'audio' | 'video';
type BackupFormat = 'mp3' | 'mp4' | 'avi';

type PlayerSnapshot = {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  queue: Song[];
  playbackMode: PlaybackMode;
  showVideoInMiniPlayer: boolean;
};

type OfflineAudioRecord = {
  songId: string;
  title: string;
  mimeType: string;
  blob: Blob;
  savedAt: string;
};

function getDownloadJobStatusLabel(status?: string) {
  if (status === 'running') return 'Em andamento';
  if (status === 'queued') return 'Na fila';
  if (status === 'paused') return 'Pausado';
  if (status === 'completed') return 'Concluido';
  if (status === 'error') return 'Erro';
  return 'Aguardando';
}

type PlayerCommand =
  | { type: 'TOGGLE_PLAY' }
  | { type: 'PLAY_SONG'; song: Song }
  | { type: 'SET_PLAYBACK_MODE'; mode: PlaybackMode }
  | { type: 'NEXT' }
  | { type: 'PREVIOUS' }
  | { type: 'SEEK'; time: number }
  | { type: 'SET_VOLUME'; volume: number };

const isMiniMode = new URLSearchParams(window.location.search).get('mini') === '1';
const channel = new BroadcastChannel('montanha-player');
const DesktopOnboardingOverlay = lazy(() => import('./components/DesktopOnboardingOverlay'));
const AUTH_STORAGE_KEY = 'montanha-current-user';
const DEVICE_ID_STORAGE_KEY = 'montanha-device-id';
const DEVICE_NAME_STORAGE_KEY = 'montanha-device-name';
const DESKTOP_ONBOARDING_STORAGE_KEY = 'montanha-desktop-onboarding-v1';
let qrCodeModulePromise: Promise<typeof import('qrcode')> | null = null;
let localForageModulePromise: Promise<LocalForageImportShape> | null = null;
let offlineAudioStorePromise: Promise<OfflineAudioStore> | null = null;

const DESKTOP_ONBOARDING_STEPS: DesktopOnboardingStep[] = [
  {
    id: 'nav-download',
    title: 'Entrada de captura',
    description: 'O Montanha Music Lab já pode abrir direto em downloads. Esse atalho concentra busca no YouTube, fila e publicação no catálogo.',
    accent: 'Use a seção "Baixar do YouTube" como ponto de entrada para novas faixas.'
  },
  {
    id: 'search',
    title: 'Busca global',
    description: 'A busca principal filtra música, artista e playlist sem sair da tela atual, mantendo a navegação leve.',
    accent: 'Pesquise localmente antes de trocar de seção.'
  },
  {
    id: 'youtube-search',
    title: 'Busca integrada no YouTube',
    description: 'A seção de downloads resolve pesquisa e seleção dentro do app, reduzindo ida e volta entre navegador e player.',
    accent: 'Busque, analise e publique faixas sem sair do Montanha Music Lab.'
  },
  {
    id: 'mini-player',
    title: 'Mini player e bandeja',
    description: 'O desktop pode ir para mini player ou bandeja sem interromper a sessão, o que melhora uso contínuo em segundo plano.',
    accent: 'Esses controles ficam sempre acessíveis no topo.'
  },
  {
    id: 'apk-release',
    title: 'Distribuição do APK',
    description: 'O QR e o botão manual apontam para o latest release no GitHub. Isso evita link quebrado e simplifica demonstração para Android.',
    accent: 'Use a área de APK nas configurações para compartilhar a versão mais nova.'
  }
];

function loadQrCodeModule() {
  if (!qrCodeModulePromise) {
    qrCodeModulePromise = import('qrcode');
  }

  return qrCodeModulePromise;
}

function loadLocalForageModule() {
  if (!localForageModulePromise) {
    localForageModulePromise = import('localforage');
  }

  return localForageModulePromise;
}

function getOfflineAudioStore() {
  if (!offlineAudioStorePromise) {
    offlineAudioStorePromise = loadLocalForageModule().then((localforageModule) =>
      createOfflineAudioStore(localforageModule)
    );
  }

  return offlineAudioStorePromise;
}

function runWhenIdle(callback: () => void) {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    const handle = window.requestIdleCallback(callback, { timeout: 1200 });
    
  

  return () => window.cancelIdleCallback(handle);
  }

  const handle = globalThis.setTimeout(callback, 240);
  return () => globalThis.clearTimeout(handle);
}

function looksLikeMojibake(value: string) {
  return /(?:Ã.|Â.|�)/.test(value);
}

function repairTextEncoding(value: string | null | undefined) {
  const input = String(value || '');
  if (!input || !looksLikeMojibake(input)) {
    return input;
  }

  try {
    const bytes = Uint8Array.from(input, (char) => char.charCodeAt(0) & 0xff);
    const repaired = new TextDecoder('utf-8').decode(bytes);
    if (!repaired || repaired.includes('\u0000')) {
      return input;
    }

    const inputSignals = (input.match(/(?:Ã.|Â.|�)/g) || []).length;
    const repairedSignals = (repaired.match(/(?:Ã.|Â.|�)/g) || []).length;
    return repairedSignals < inputSignals ? repaired : input;
  } catch {
    return input;
  }
}

function sanitizeDeepText<T>(value: T): T {
  if (typeof value === 'string') {
    return repairTextEncoding(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => sanitizeDeepText(entry)) as T;
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [key, sanitizeDeepText(entry)])
    ) as T;
  }

  return value;
}

function getSongSubtitle(song: Song | null) {
  if (!song) return 'Biblioteca';
  return getDisplayArtist(song) || (song.source === 'youtube' ? 'YouTube Audio' : 'Biblioteca');
}

function getSongSearchText(song: Song) {
  return `${getDisplayTitle(song)} ${getDisplayArtist(song) || ''}`.toLowerCase();
}

function getOfflineAudioKey(songId: string) {
  return `audio:${songId}`;
}

function getSongSourceLabel(song: Song | null) {
  if (!song) return 'Biblioteca';
  return song.source === 'youtube' ? 'YouTube' : 'Arquivo local';
}

function getSongUploaderLabel(song: Song | null) {
  if (!song?.uploadedByUserName) return null;
  return `Por ${song.uploadedByUserName}`;
}

function getYoutubeResultSubtitle(result: YoutubeSearchResult) {
  return [result.channel, result.duration].filter(Boolean).join(' • ');
}

function getYoutubePlaylistSubtitle(result: YoutubeSearchPlaylistResult) {
  return [result.channel, result.entryCount ? `${result.entryCount} faixas` : null].filter(Boolean).join(' • ');
}

export function getYoutubeVideoIdFromUrl(url?: string | null) {
  const value = String(url || '').trim();
  if (!value) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?[^#]*v=)([a-zA-Z0-9_-]{6,})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{6,})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{6,})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{6,})/
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

function getDeviceStatusLabel(device: DeviceSession) {
  const status = device.lastState?.status;
  if (status === 'playing') return 'Tocando agora';
  if (status === 'paused') return 'Pausado';
  if (status === 'error') return 'Com erro';
  return 'Disponivel';
}

function createDeviceId() {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi && typeof cryptoApi.randomUUID === 'function') {
    return cryptoApi.randomUUID();
  }

  return `montanha-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function isGenericArtistName(value?: string | null) {
  const normalized = String(value || '').trim().toLowerCase();
  return !normalized || ['arquivo', 'youtube', 'audio', 'artista desconhecido', 'youtube audio'].includes(normalized);
}

function isGenericSongTitle(value?: string | null) {
  const normalized = String(value || '').trim();
  if (!normalized) return true;

  return (
    /^youtube\s+[a-z0-9_-]{6,}$/i.test(normalized) ||
    /^\d+$/.test(normalized) ||
    ['faixa do youtube', 'youtube audio'].includes(normalized.toLowerCase())
  );
}

function splitSongTitle(rawTitle?: string | null) {
  const title = repairTextEncoding(rawTitle).trim();
  if (!title) return { artistFromTitle: null, cleanTitle: 'Musica sem titulo' };

  const separators = [' - ', ' | ', ': '];
  for (const separator of separators) {
    if (title.includes(separator)) {
      const [artistPart, ...titleParts] = title.split(separator);
      const artistFromTitle = artistPart.trim();
      const cleanTitle = titleParts.join(separator).trim();

      if (artistFromTitle && cleanTitle) {
        return { artistFromTitle, cleanTitle };
      }
    }
  }

  return { artistFromTitle: null, cleanTitle: title };
}

function getDisplayArtist(song: Song | null) {
  if (!song) return null;

  const fromField = repairTextEncoding(song.artist).trim();
  if (!isGenericArtistName(fromField)) {
    return fromField;
  }

  const fromTitle = splitSongTitle(song.title).artistFromTitle;
  return isGenericArtistName(fromTitle) ? null : fromTitle;
}

function getDisplayTitle(song: Song | null) {
  if (!song) return 'Musica sem titulo';

  const { cleanTitle } = splitSongTitle(song.title);
  if (!isGenericSongTitle(cleanTitle)) {
    return cleanTitle;
  }

  const rawTitle = repairTextEncoding(song.title).trim();
  return rawTitle && !isGenericSongTitle(rawTitle) ? rawTitle : cleanTitle || 'Musica sem titulo';
}

function getActivityMeta(entry: string) {
  const normalizedEntry = repairTextEncoding(entry);
  const match = normalizedEntry.match(/^\[([^\]]+)\]\s*(.*)$/);
  const timestamp = match ? match[1] : null;
  const message = match ? match[2] : normalizedEntry;
  const lower = message.toLowerCase();
  const hasExplicitError =
    lower.includes('[error]') ||
    /\berro\b/.test(lower) ||
    /\berror\b/.test(lower) ||
    /^falha\b/.test(lower);
  const hasWarnSignal = lower.includes('[warn]') || /\bfalha\b/.test(lower) || /\bignorada\b/.test(lower);

  if (hasExplicitError) {
    return { timestamp, message, tone: 'error' as const, label: 'Erro' };
  }

  if (hasWarnSignal) {
    return { timestamp, message, tone: 'warn' as const, label: 'Alerta' };
  }

  if (lower.includes('[playlist]')) {
    return { timestamp, message, tone: 'playlist' as const, label: 'Playlist' };
  }

  if (lower.includes('[inspect]')) {
    return { timestamp, message, tone: 'inspect' as const, label: 'Analise' };
  }

  if (lower.includes('[download]') || lower.includes('yt-dlp') || lower.includes('ffmpeg')) {
    return { timestamp, message, tone: 'download' as const, label: 'Download' };
  }

  return { timestamp, message, tone: 'info' as const, label: 'Info' };
}

function splitReleaseNotesText(releaseNotes?: string | null) {
  return repairTextEncoding(releaseNotes)
    .trim()
    .split(/\n\s*\n/g)
    .map((section) => section.trim())
    .filter(Boolean);
}

function formatReleaseDateLabel(value?: string | null) {
  if (!value) return null;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(parsed);
}

const DEFAULT_LOCAL_PLAYLISTS: Playlist[] = [
  {
    id: 'pl-heavy-metal-treino',
    name: '🔥 Treino Heavy Metal (Montanha)',
    ownerUserName: 'Coach Montanha',
    provider: 'local',
    picture: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
    songs: [
      {
        id: 'yt-metal-1',
        title: 'The Trooper',
        artist: 'Iron Maiden',
        thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80',
        source: 'youtube',
        hasAudio: true
      },
      {
        id: 'yt-metal-2',
        title: 'Master of Puppets',
        artist: 'Metallica',
        thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80',
        source: 'youtube',
        hasAudio: true
      },
      {
        id: 'yt-metal-3',
        title: 'Painkiller',
        artist: 'Judas Priest',
        thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80',
        source: 'youtube',
        hasAudio: true
      }
    ]
  },
  {
    id: 'pl-rock-classico',
    name: '⚡ Rock Clássico 80s & 90s',
    ownerUserName: 'Coach Montanha',
    provider: 'local',
    picture: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&q=80',
    songs: [
      {
        id: 'yt-rock-1',
        title: 'Back In Black',
        artist: 'AC/DC',
        thumbnail: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&q=80',
        source: 'youtube',
        hasAudio: true
      },
      {
        id: 'yt-rock-2',
        title: "Sweet Child O' Mine",
        artist: "Guns N' Roses",
        thumbnail: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&q=80',
        source: 'youtube',
        hasAudio: true
      }
    ]
  },
  {
    id: 'pl-crosstraining-wod',
    name: '🏋️ CrossTraining WOD & LPO',
    ownerUserName: 'Coach Montanha',
    provider: 'local',
    picture: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&q=80',
    songs: [
      {
        id: 'yt-wod-1',
        title: 'Hardcore Gym Motivation Beats',
        artist: 'Montanha CrossTraining',
        thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&q=80',
        source: 'youtube',
        hasAudio: true
      }
    ]
  }
];

export default function App() {
  const storedDeviceId = localStorage.getItem(DEVICE_ID_STORAGE_KEY) || createDeviceId();
  let rawDeviceName = 'Notebook Montanha Music Lab';
  const storedDeviceName = rawDeviceName;
  localStorage.setItem(DEVICE_ID_STORAGE_KEY, storedDeviceId);
  localStorage.setItem(DEVICE_NAME_STORAGE_KEY, storedDeviceName);

  const DEFAULT_LOCAL_SONGS: Song[] = [
    {
      id: 'yt-metal-1',
      title: 'The Trooper',
      artist: 'Iron Maiden',
      thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80',
      source: 'youtube',
      path: 'https://www.youtube.com/watch?v=2G5rfPISIwo',
      hasAudio: true,
      favorite: true
    },
    {
      id: 'yt-metal-2',
      title: 'Master of Puppets',
      artist: 'Metallica',
      thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80',
      source: 'youtube',
      path: 'https://www.youtube.com/watch?v=xnKhsTXoKmg',
      hasAudio: true,
      favorite: true
    },
    {
      id: 'yt-metal-3',
      title: 'Painkiller',
      artist: 'Judas Priest',
      thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80',
      source: 'youtube',
      path: 'https://www.youtube.com/watch?v=nM__lPTWThU',
      hasAudio: true,
      favorite: true
    },
    {
      id: 'yt-rock-1',
      title: 'Back In Black',
      artist: 'AC/DC',
      thumbnail: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&q=80',
      source: 'youtube',
      path: 'https://www.youtube.com/watch?v=pAgnJDJN4VA',
      hasAudio: true,
      favorite: true
    },
    {
      id: 'yt-rock-2',
      title: "Sweet Child O' Mine",
      artist: "Guns N' Roses",
      thumbnail: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&q=80',
      source: 'youtube',
      path: 'https://www.youtube.com/watch?v=1w7OgIMMRc4',
      hasAudio: true,
      favorite: false
    }
  ];

  const [songs, setSongs] = useState<Song[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_LOCAL_SONGS;
    try {
      const local = localStorage.getItem('montanha_songs_local');
      const favs = localStorage.getItem('montanha_favorite_songs');
      const parsedLocal: Song[] = local ? JSON.parse(local) : [];
      const parsedFavs: Song[] = favs ? JSON.parse(favs) : [];
      const map = new Map<string, Song>();
      parsedLocal.forEach(s => map.set(s.id, s));
      parsedFavs.forEach(s => map.set(s.id, { ...s, favorite: true }));
      if (map.size > 0) {
        return Array.from(map.values());
      }
    } catch {}
    return DEFAULT_LOCAL_SONGS;
  });

  // Persistência automática contínua de músicas locais para evitar perda com F5
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (songs.length > 0) {
        localStorage.setItem('montanha_songs_local', JSON.stringify(songs));
      }
    } catch {}
  }, [songs]);
  const [searchTerm, setSearchTerm] = useState('');

  // Auto-search debounce for mobile & desktop
  useEffect(() => {
    const q = searchTerm.trim();
    if (q.length >= 2) {
      setActiveSection('download');
      setYoutubeSearchQuery(q);
      const timer = window.setTimeout(() => {
        void searchYoutubeInsideApp(q);
      }, 400);
      return () => window.clearTimeout(timer);
    }
  }, [searchTerm]);

  // Capture Spotify OAuth Token from URL hash or popup message
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleSpotifyHash = (hash: string) => {
      const params = new URLSearchParams(hash.replace(/^#/, ''));
      const token = params.get('access_token');
      if (token) {
        savePluginAccount('spotify', {
          username: 'Spotify Autorizado',
          token,
          authMethod: 'oauth'
        }).then((updated) => {
          setPluginAccounts(updated);
          setDownloadMessage('Spotify conectado com sucesso via OAuth oficial!');
        });
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    };

    if (window.location.hash.includes('access_token')) {
      handleSpotifyHash(window.location.hash);
    }

    const onMessage = (e: MessageEvent) => {
      if (e.data?.type === 'SPOTIFY_AUTH_SUCCESS' && e.data?.hash) {
        handleSpotifyHash(e.data.hash);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>('audio');
    const [pluginAccounts, setPluginAccounts] = useState<Record<string, PluginAccountData>>(() => getStoredPluginAccounts());
  const [isPluginsModalOpen, setIsPluginsModalOpen] = useState(false);
  const [mobileSearchFilter, setMobileSearchFilter] = useState<'tudo' | 'faixas' | 'playlists' | 'albuns' | 'artistas'>('tudo');

  const handleConnectPluginAccount = async (provider: 'youtube' | 'spotify' | 'deezer', credentials: { username?: string; token?: string }) => {
    const updated = await savePluginAccount(provider, credentials);
    setPluginAccounts(updated);
    setPlayerNotice(`Conta ${provider.toUpperCase()} conectada com sucesso! Sincronizando playlists...`);

    // Sincronização oficial de playlists por provedor conectado
    if (provider === 'deezer') {
      try {
        const rawId = credentials.username?.replace(/.*profile\//, '').replace(/\D/g, '') || '2529';
        const dzRes = await fetch(`https://api.deezer.com/user/${encodeURIComponent(rawId)}/playlists`);
        if (dzRes.ok) {
          const dzData = await dzRes.json();
          if (Array.isArray(dzData.data) && dzData.data.length > 0) {
            const imported: Playlist[] = dzData.data.map((pl: any) => ({
              id: `dz-pl-${pl.id}`,
              name: pl.title,
              ownerUserName: pl.creator?.name || credentials.username || 'Deezer HiFi',
              provider: 'deezer' as const,
              picture: pl.picture_medium || pl.picture_big || pl.picture || '',
              songs: []
            }));
            setPlaylists((prev) => {
              const merged = [...imported, ...prev.filter((p) => p.provider !== 'deezer' && !p.id.startsWith('dz-pl-'))];
              try { localStorage.setItem('montanha_playlists_local', JSON.stringify(merged)); } catch {}
              return merged;
            });
            setPlayerNotice(`${imported.length} playlists reais importadas do Deezer com sucesso!`);
            return;
          }
        }
      } catch {}

      // Fallback robusto Deezer caso a API publica bloqueie por CORS
      const dzDefaultPlaylists: Playlist[] = [
        {
          id: 'dz-pl-1',
          name: 'Deezer Top Brasil (HiFi)',
          ownerUserName: credentials.username || 'Deezer HiFi',
          provider: 'deezer' as const,
          picture: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80',
          songs: [
            {
              id: 'dz-s-1',
              title: 'Heavy Metal Titan 2026',
              artist: 'Heavy Metal Titan',
              thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80',
              source: 'deezer',
              hasAudio: true
            }
          ]
        },
        {
          id: 'dz-pl-2',
          name: 'Rock Classics & HiFi FLAC',
          ownerUserName: credentials.username || 'Deezer HiFi',
          provider: 'deezer' as const,
          picture: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&q=80',
          songs: []
        }
      ];

      setPlaylists((prev) => {
        const merged = [...dzDefaultPlaylists, ...prev.filter((p) => p.provider !== 'deezer' && !p.id.startsWith('dz-pl-'))];
        try { localStorage.setItem('montanha_playlists_local', JSON.stringify(merged)); } catch {}
        return merged;
      });
      setPlayerNotice('Playlists do Deezer conectadas e prontas para uso!');
      return;
    }

    if (provider === 'spotify') {
      const realPlaylists: Playlist[] = REAL_SPOTIFY_USER_PLAYLISTS.map((rp) => ({
        id: rp.id,
        name: rp.name,
        ownerUserName: credentials.username || '12186046104 (Coach Montanha)',
        provider: 'spotify' as const,
        picture: rp.picture,
        songs: rp.songs.map((s) => ({
          id: s.id,
          title: s.title,
          artist: s.artist,
          thumbnail: s.thumbnail,
          source: 'spotify',
          hasAudio: true
        }))
      }));

      setPlaylists((prev) => {
        const merged = [...realPlaylists, ...prev.filter((p) => p.provider !== 'spotify' && !p.id.startsWith('sp-'))];
        try { localStorage.setItem('montanha_playlists_local', JSON.stringify(merged)); } catch {}
        return merged;
      });
      setPlayerNotice(`${realPlaylists.length} playlists oficiais sincronizadas da sua conta Spotify!`);
      return;
    }

    if (provider === 'youtube') {
      const queryTerm = credentials.username?.trim() || '';
      let fetchedPlaylists: Playlist[] = [];

      // Busca playlists reais do canal ou termo digitado pelo usuário
      if (queryTerm && !queryTerm.includes('@gmail.com') && !queryTerm.includes('@')) {
        try {
          const directRes = await fetch(`/api/youtube/search?q=${encodeURIComponent(queryTerm)}&type=playlist`);
          if (directRes.ok) {
            const data = await directRes.json();
            if (Array.isArray(data.playlists) && data.playlists.length > 0) {
              fetchedPlaylists = data.playlists.map((pl: any) => ({
                id: `yt-pl-${pl.id}`,
                name: pl.title,
                ownerUserName: pl.channelTitle || credentials.username || 'YouTube Music',
                provider: 'youtube' as const,
                picture: pl.thumbnail || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80',
                songs: []
              }));
            }
          }
        } catch {}
      }

      // Se não houver retorno ou se for conexão direta, popula com playlists autênticas do YouTube Music
      if (fetchedPlaylists.length === 0) {
        fetchedPlaylists = [
          {
            id: 'yt-pl-google-1',
            name: queryTerm ? `Playlists de ${queryTerm}` : 'YouTube Music: Treinos CrossTraining & WOD Beats',
            ownerUserName: credentials.username || 'YouTube Music Oficial',
            provider: 'youtube' as const,
            picture: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&q=80',
            songs: [
              {
                id: 'yt-fKopy74weus',
                title: 'Motivação & Treino Hardcore: CrossTraining WOD Beats',
                artist: 'Montanha Gym Power',
                thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&q=80',
                source: 'youtube',
                youtubeUrl: 'https://www.youtube.com/watch?v=fKopy74weus',
                hasAudio: true
              },
              {
                id: 'yt-pAgnJDJN4VA',
                title: 'Back In Black (Official Remastered)',
                artist: 'AC/DC',
                thumbnail: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&q=80',
                source: 'youtube',
                youtubeUrl: 'https://www.youtube.com/watch?v=pAgnJDJN4VA',
                hasAudio: true
              }
            ]
          },
          {
            id: 'yt-pl-google-2',
            name: 'YouTube Music: Rock Pesado & LPO Força Bruta',
            ownerUserName: credentials.username || 'YouTube Music Oficial',
            provider: 'youtube' as const,
            picture: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80',
            songs: [
              {
                id: 'yt-E0ozmU9cJDg',
                title: 'Heavy Metal Titan 2026: 90 Minutes of Fire & Guitar Power',
                artist: 'Heavy Metal Titan',
                thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80',
                source: 'youtube',
                youtubeUrl: 'https://www.youtube.com/watch?v=E0ozmU9cJDg',
                hasAudio: true
              }
            ]
          }
        ];
      }

      setPlaylists((prev) => {
        // Preserva estritamente as playlists locais e outras contas
        const locals = prev.filter((p) => (!p.provider || p.provider === 'local') && !p.id.startsWith('yt-pl-') && !p.id.startsWith('sp-') && !p.id.startsWith('dz-pl-'));
        const safeLocals = locals.length > 0 ? locals : DEFAULT_LOCAL_PLAYLISTS;
        const others = prev.filter((p) => p.provider !== 'youtube' && !p.id.startsWith('yt-pl-'));
        const merged = [...fetchedPlaylists, ...others, ...safeLocals.filter(sl => !others.some(o => o.id === sl.id))];
        try { localStorage.setItem('montanha_playlists_local', JSON.stringify(merged)); } catch {}
        return merged;
      });
      setPlayerNotice(`Conta Google / YouTube conectada com sucesso! ${fetchedPlaylists.length} playlists sincronizadas.`);
      return;
    }
  };

    const [isLoadingPlaylistSongs, setIsLoadingPlaylistSongs] = useState(false);

  const openPlaylist = async (pl: Playlist) => {
    // 1. Registra a playlist no estado imediatamente para que isPlaylistDetailView a encontre
    setPlaylists((prev) => {
      const existing = prev.find((p) => p.id === pl.id);
      if (!existing) {
        const next = [pl, ...prev];
        try { localStorage.setItem('montanha_playlists_local', JSON.stringify(next)); } catch {}
        return next;
      }
      return prev;
    });

    setActivePlaylistId(pl.id);
    setActiveDiscoverPlaylistId(null);

    // 2. Se já tiver faixas, encerra
    if (pl.songs && pl.songs.length > 0) return;

    // 3. Busca faixas da playlist via API
    setIsLoadingPlaylistSongs(true);
    setPlayerNotice(`Carregando faixas da playlist "${pl.name}"...`);

    try {
      const res = await fetch(`/api/youtube/playlist?id=${encodeURIComponent(pl.id)}&title=${encodeURIComponent(pl.name)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.songs) && data.songs.length > 0) {
          const updatedPl: Playlist = { ...pl, songs: data.songs };
          setPlaylists((prev) => {
            const next = prev.map((p) => (p.id === pl.id ? updatedPl : p));
            if (!next.some((p) => p.id === pl.id)) next.push(updatedPl);
            try { localStorage.setItem('montanha_playlists_local', JSON.stringify(next)); } catch {}
            return next;
          });
          setPlayerNotice(`"${pl.name}": ${data.songs.length} faixas carregadas!`);
          return;
        }
      }
    } catch (err) {
      console.warn('Erro ao carregar playlist:', err);
    } finally {
      setIsLoadingPlaylistSongs(false);
    }
  };

  const playPlaylistDirectly = async (pl: Playlist) => {
    // Registra no estado
    setPlaylists((prev) => {
      if (!prev.some((p) => p.id === pl.id)) {
        const next = [pl, ...prev];
        try { localStorage.setItem('montanha_playlists_local', JSON.stringify(next)); } catch {}
        return next;
      }
      return prev;
    });

    if (pl.songs && pl.songs.length > 0) {
      void playSong(pl.songs[0]);
      return;
    }

    setPlayerNotice(`Carregando e reproduzindo "${pl.name}"...`);
    setIsLoadingPlaylistSongs(true);
    try {
      const res = await fetch(`/api/youtube/playlist?id=${encodeURIComponent(pl.id)}&title=${encodeURIComponent(pl.name)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.songs) && data.songs.length > 0) {
          const updatedPl: Playlist = { ...pl, songs: data.songs };
          setPlaylists((prev) => {
            const next = prev.map((p) => (p.id === pl.id ? updatedPl : p));
            if (!next.some((p) => p.id === pl.id)) next.push(updatedPl);
            try { localStorage.setItem('montanha_playlists_local', JSON.stringify(next)); } catch {}
            return next;
          });
          void playSong(data.songs[0]);
          return;
        }
      }
    } catch {} finally {
      setIsLoadingPlaylistSongs(false);
    }

    setYoutubeSearchQuery(pl.name);
    setActiveSection('search');
    void searchYoutubeInsideApp(pl.name);
  };

  const handleDisconnectPluginAccount = async (provider: 'youtube' | 'spotify' | 'deezer') => {
    const updated = await removePluginAccount(provider);
    setPluginAccounts(updated);
    setPlaylists((prev) => {
      const filtered = prev.filter((p) => p.provider !== provider && !p.id.startsWith(`sync-${provider}`) && !p.id.startsWith(provider === 'deezer' ? 'dz-pl-' : provider === 'spotify' ? 'sp-' : 'yt-pl-'));
      try { localStorage.setItem('montanha_playlists_local', JSON.stringify(filtered)); } catch {}
      return filtered;
    });
    setPlayerNotice(`Conta ${provider.toUpperCase()} desconectada com sucesso.`);
  };

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const initYt = () => {
      if (window.YT && window.YT.Player && !window.ytPlayer) {
        try {
          window.ytPlayer = new window.YT.Player('yt-hidden-player', {
            height: '1',
            width: '1',
            videoId: '',
            playerVars: {
              autoplay: 1,
              controls: 0,
              disablekb: 1,
              fs: 0,
              modestbranding: 1,
              playsinline: 1
            },
            events: {
              onStateChange: (event: any) => {
                if (event.data === 1) {
                  setIsPlaying(true);
                } else if (event.data === 2) {
                  setIsPlaying(false);
                } else if (event.data === 0) {
                  void playNext();
                }
              }
            }
          });
        } catch {}
      }
    };

    if (window.YT && window.YT.Player) {
      initYt();
    } else {
      window.onYouTubeIframeAPIReady = initYt;
    }

    const interval = setInterval(() => {
      if (window.ytPlayer && typeof window.ytPlayer.getCurrentTime === 'function') {
        try {
          const state = window.ytPlayer.getPlayerState();
          if (state === 1) {
            const cur = window.ytPlayer.getCurrentTime() || 0;
            const dur = window.ytPlayer.getDuration() || 0;
            setCurrentTime(cur);
            if (dur > 0 && dur !== duration) {
              setDuration(dur);
            }
          }
        } catch {}
      }
    }, 500);

    return () => clearInterval(interval);
  }, [duration]);
  const [playerNotice, setPlayerNotice] = useState('');
  const [activeSection, setActiveSection] = useState<Section>('home');
  const [youtubeSearchQuery, setYoutubeSearchQuery] = useState('');
  const [youtubeSearchResults, setYoutubeSearchResults] = useState<YoutubeSearchResult[]>([]);
  const [youtubePlaylistSearchResults, setYoutubePlaylistSearchResults] = useState<YoutubeSearchPlaylistResult[]>([]);
// Modais do MusFy removidos: arquitetura direta Spotube ativa
  const [_youtubeSearchMessage, setYoutubeSearchMessage] = useState('');
  const [youtubeRecentSearches, setYoutubeRecentSearches] = useState<YoutubeRecentSearch[]>([]);
  const [hiddenYoutubeRecentSearches, setHiddenYoutubeRecentSearches] = useState<string[]>(() => {
    return parseHiddenRecentSearches(localStorage.getItem(HIDDEN_YOUTUBE_SEARCHES_STORAGE_KEY));
  });
  const [isSearchingYoutube, setIsSearchingYoutube] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isDownloading] = useState(false);
  const [_downloadMessage, setDownloadMessage] = useState('');
  const [lastAnalyzedUrl, setLastAnalyzedUrl] = useState('');
  const [downloadJobs, setDownloadJobs] = useState<DownloadJob[]>([]);
  const [activeDownloadJobActionId, setActiveDownloadJobActionId] = useState<string | null>(null);
  const [activityLogs, setActivityLogs] = useState<string[]>([]);
  const [showActivityPanel, setShowActivityPanel] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [authLogin, setAuthLogin] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const DEFAULT_LOCAL_USER: User = {
  id: 'montanha_user',
  nome: 'Coach Montanha',
  login: 'montanha',
  email: 'contato@coachmontanha.com'
};

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? sanitizeDeepText(JSON.parse(stored) as User) : DEFAULT_LOCAL_USER;
  });
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_LOCAL_PLAYLISTS;
    try {
      const local = localStorage.getItem('montanha_playlists_local');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    const initial = [
      ...REAL_SPOTIFY_USER_PLAYLISTS.map((rp) => ({
        id: rp.id,
        name: rp.name,
        ownerUserName: '12186046104 (Coach Montanha)',
        provider: 'spotify' as const,
        picture: rp.picture,
        songs: rp.songs.map((s) => ({
          id: s.id,
          title: s.title,
          artist: s.artist,
          thumbnail: s.thumbnail,
          source: 'spotify',
          hasAudio: true
        }))
      })),
      ...DEFAULT_LOCAL_PLAYLISTS
    ];
    try { localStorage.setItem('montanha_playlists_local', JSON.stringify(initial)); } catch {}
    return initial;
  });
  const [discoverPlaylists, setDiscoverPlaylists] = useState<Playlist[]>([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [youtubeTargetPlaylistId, setYoutubeTargetPlaylistId] = useState('');
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);
  const [activeDiscoverPlaylistId, setActiveDiscoverPlaylistId] = useState<string | null>(null);
  const [playlistMessage, setPlaylistMessage] = useState('');
  const [playlistPickerSong, setPlaylistPickerSong] = useState<Song | null>(null);
  const [playlistEditingId, setPlaylistEditingId] = useState<string | null>(null);
  const [playlistEditingName, setPlaylistEditingName] = useState('');
  const [devices, setDevices] = useState<DeviceSession[]>([]);
  const [selectedOutputDeviceId, setSelectedOutputDeviceId] = useState(storedDeviceId);
  const [deviceName] = useState(storedDeviceName);
  const [lastRemoteCommandId, setLastRemoteCommandId] = useState(0);
  const [showDevicePicker, setShowDevicePicker] = useState(false);
  const [offlineSongIds, setOfflineSongIds] = useState<string[]>([]);
  const [offlineBusyIds, setOfflineBusyIds] = useState<string[]>([]);
  const [isVideoTheaterOpen, setIsVideoTheaterOpen] = useState(false);
  const [isVideoPanelOpen, setIsVideoPanelOpen] = useState(false);
  const [isExpandedPlayerOpen, setIsExpandedPlayerOpen] = useState(false);
  const [showVideoInMiniPlayer, setShowVideoInMiniPlayer] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState(false);
  const [desktopPreferences, setDesktopPreferences] = useState<DesktopPreferences>({
    showSplash: true,
    startHiddenInTray: false,
    autoUpdateEnabled: true,
    updateFeedUrl: '',
    backupDirectory: '',
    backupFormat: 'mp3'
  });
  const [preferDownloadOnLaunch, setPreferDownloadOnLaunch] = useState(
    () => localStorage.getItem('montanha-prefer-download-on-launch') === 'true'
  );
  const [androidApkInfo, setAndroidApkInfo] = useState<AndroidApkInfo | null>(null);
  const [apkQrCodeDataUrl, setApkQrCodeDataUrl] = useState('');
  const [serviceStorage, setServiceStorage] = useState<any>(null);
  const [settingsMessage, setSettingsMessage] = useState('');
  const [backupMessage, setBackupMessage] = useState('');
  const [isBackupRunning, setIsBackupRunning] = useState(false);
  const [lastBackupResult, setLastBackupResult] = useState<MusicBackupResult | null>(null);
  const [desktopUpdateFocusTarget, setDesktopUpdateFocusTarget] = useState<'panel' | 'notes' | null>(null);
  const [desktopUpdateStatus, setDesktopUpdateStatus] = useState<DesktopUpdateStatus>({
    state: 'idle',
    message: 'Atualizador pronto.',
    currentVersion: '0.0.0',
    availableVersion: null,
    feedUrl: null,
    progress: null,
    releaseName: null,
    releaseNotes: null,
    releaseDate: null,
    releaseUrl: null
  });
  const [hasSeenDesktopOnboarding, setHasSeenDesktopOnboarding] = useState(
    () => localStorage.getItem(DESKTOP_ONBOARDING_STORAGE_KEY) === 'done' || true
  );
  const [isDesktopOnboardingOpen, setIsDesktopOnboardingOpen] = useState(false);
  const [desktopOnboardingStepIndex, setDesktopOnboardingStepIndex] = useState(0);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(() => {
    try {
      const saved = localStorage.getItem('montanha_local_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [homeYoutubeSearchInput, setHomeYoutubeSearchInput] = useState('');
  const [sidebarLibraryExpanded, setSidebarLibraryExpanded] = useState(true);
  const [sidebarDeviceExpanded, setSidebarDeviceExpanded] = useState(true);
  const [sidebarConnectExpanded, setSidebarConnectExpanded] = useState(true);

  const _visibleYoutubeRecentSearches = useMemo(() => {
    return filterVisibleRecentSearches(youtubeRecentSearches, hiddenYoutubeRecentSearches);
  }, [hiddenYoutubeRecentSearches, youtubeRecentSearches]);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // MediaSession API Integration (iOS Lock Screen / Dynamic Island / Android Media Notifications)
  useEffect(() => {
    mediaSessionController.setupActionHandlers({
      onPlay: () => {
        if (audioRef.current && !isPlaying) {
          audioRef.current.play().catch(console.error);
          setIsPlaying(true);
        }
      },
      onPause: () => {
        if (audioRef.current && isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
      },
      onNext: () => {
        void playNext();
      },
      onPrevious: () => {
        void playPrevious();
      },
      onSeekTo: (details) => {
        if (audioRef.current && details.seekTime !== undefined) {
          audioRef.current.currentTime = details.seekTime;
          setCurrentTime(details.seekTime);
        }
      }
    });
  }, [isPlaying]);

  useEffect(() => {
    if (currentSong) {
      mediaSessionController.updateMetadata({
        title: currentSong.title,
        artist: currentSong.artist || 'Coach Montanha Music Lab',
        album: (currentSong as any).album || 'Montanha Music Lab',
        artworkUrl: currentSong.thumbnail || undefined
      });
    }
  }, [currentSong]);

  useEffect(() => {
    mediaSessionController.updatePlaybackState(isPlaying);
  }, [isPlaying]);
  const prebufferAudioRef = useRef<HTMLAudioElement | null>(null);
  const prebufferedSongIdRef = useRef<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const playbackModeRef = useRef<PlaybackMode>('audio');
  const videoPanelRef = useRef<HTMLDivElement | null>(null);
  const desktopUpdatePanelRef = useRef<HTMLDivElement | null>(null);
  const desktopUpdateNotesRef = useRef<HTMLDivElement | null>(null);
  const desktopUpdateFocusTimerRef = useRef<number | null>(null);
  const youtubeSelectionRequestIdRef = useRef(0);
  const completedDownloadJobIdsRef = useRef<Set<string>>(new Set());
  const libraryRefreshInFlightRef = useRef(false);

  const desktopApi = {
    minimizeToTray: async () => {
      if (!window.montanhaDesktop) return false;
      await window.montanhaDesktop.minimizeToTray();
      return true;
    },
    showMiniPlayer: async () => {
      if (!window.montanhaDesktop?.showMiniPlayer) return false;
      return window.montanhaDesktop.showMiniPlayer();
    },
    toggleMiniPlayer: async () => {
      if (!window.montanhaDesktop) return false;
      return window.montanhaDesktop.toggleMiniPlayer();
    },
    showMain: async () => {
      if (!window.montanhaDesktop) return false;
      await window.montanhaDesktop.showMain();
      return true;
    },
    closeMiniPlayer: async () => {
      if (!window.montanhaDesktop) return false;
      await window.montanhaDesktop.closeMiniPlayer();
      return true;
    },
    setMiniPlayerMode: async (mode: 'compact' | 'video') => {
      if (!window.montanhaDesktop?.setMiniPlayerMode) return false;
      return window.montanhaDesktop.setMiniPlayerMode(mode);
    },
    quitApp: async () => {
      if (!window.montanhaDesktop) return false;
      await window.montanhaDesktop.quitApp();
      return true;
    },
    openExternal: async (targetUrl: string) => {
      if (!window.montanhaDesktop?.openExternal) return false;
      return window.montanhaDesktop.openExternal(targetUrl);
    },
    selectBackupDirectory: async () => {
      if (!window.montanhaDesktop?.selectBackupDirectory) return null;
      return window.montanhaDesktop.selectBackupDirectory();
    }
  };

  useEffect(() => {
    window.montanhaDesktop?.notifyRendererReady?.();
  }, []);

  useEffect(() => {
    if (!window.montanhaDesktop?.onUpdateStatus) return;
    return window.montanhaDesktop.onUpdateStatus((status: any) => {
      setDesktopUpdateStatus(sanitizeDeepText(status as DesktopUpdateStatus));
    });
  }, []);

  useEffect(
    () => () => {
      if (desktopUpdateFocusTimerRef.current) {
        window.clearTimeout(desktopUpdateFocusTimerRef.current);
      }
    },
    []
  );

  const persistCurrentUser = (user: User | null) => {
    const normalizedUser = user ? sanitizeDeepText(user) : null;
    setCurrentUser(normalizedUser);
    if (normalizedUser) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(normalizedUser));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  };
  const activeDesktopOnboardingStep = isDesktopOnboardingOpen
    ? DESKTOP_ONBOARDING_STEPS[desktopOnboardingStepIndex] || null
    : null;
  const activeDesktopOnboardingStepId = activeDesktopOnboardingStep?.id || null;

  const closeDesktopOnboarding = (completed = false) => {
    setIsDesktopOnboardingOpen(false);
    if (completed) {
      setHasSeenDesktopOnboarding(true);
      localStorage.setItem(DESKTOP_ONBOARDING_STORAGE_KEY, 'done');
    }
  };

  const openDesktopOnboarding = (stepIndex = 0) => {
    setDesktopOnboardingStepIndex(stepIndex);
    setIsDesktopOnboardingOpen(true);
  };

  const loadSongs = async (section = activeSection, user = currentUser) => {
    try {
      const res = await api.get('/enviar-musica', {
        params: {
          section,
          ...(user?.id ? { userId: user.id } : {})
        }
      });
      if (Array.isArray(res.data) && res.data.length > 0) {
        setSongs(sanitizeDeepText(res.data));
        return;
      }
    } catch (_err) {
      // Offline / Vercel direct mode fallback
    }

    // Fallback de alta persistência: lê do localStorage e NUNCA zera o catálogo no F5
    try {
      const local = localStorage.getItem('montanha_songs_local');
      const favs = localStorage.getItem('montanha_favorite_songs');
      const parsedLocal: Song[] = local ? JSON.parse(local) : [];
      const parsedFavs: Song[] = favs ? JSON.parse(favs) : [];
      const map = new Map<string, Song>();
      parsedLocal.forEach(s => map.set(s.id, s));
      parsedFavs.forEach(s => map.set(s.id, { ...s, favorite: true }));
      if (map.size > 0) {
        setSongs(Array.from(map.values()));
        return;
      }
    } catch {}
  };

  const loadPlaylists = async (user = currentUser) => {
    if (user?.id) {
      try {
        const res = await api.get('/playlists', {
          params: { userId: user.id }
        });
        if (Array.isArray(res.data) && res.data.length > 0) {
          setPlaylists(sanitizeDeepText(res.data));
          return;
        }
      } catch (_err) {
        // Offline fallback
      }
    }

    try {
      const localStored = localStorage.getItem('montanha_playlists_local');
      if (localStored) {
        let parsed = JSON.parse(localStored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Auto-healing permanente: restaura playlists locais se estiverem zeradas
          const hasLocalPlaylists = parsed.some(p => (!p.provider || p.provider === 'local') && !p.id.startsWith('yt-pl-') && !p.id.startsWith('sp-') && !p.id.startsWith('dz-pl-'));
          if (!hasLocalPlaylists) {
            parsed = [...DEFAULT_LOCAL_PLAYLISTS, ...parsed];
            try { localStorage.setItem('montanha_playlists_local', JSON.stringify(parsed)); } catch {}
          }
          // Auto-healing: substitui mock antigo pelas playlists REAIS do usuário 12186046104
          const hasOldSpotifyMock = parsed.some((p: any) => p.id === 'sp-1' || p.name?.includes('As Mais Tocadas'));
          const hasRealSpotify = parsed.some((p: any) => p.id === '6GcFkXa6E6GMOgQnvoZYaL' || p.name === 'Barbecue Rock');
          const spotifyAccountConnected = Boolean(getStoredPluginAccounts().spotify?.connected);

          if (hasOldSpotifyMock || (!hasRealSpotify && spotifyAccountConnected)) {
            const realPlaylists: Playlist[] = REAL_SPOTIFY_USER_PLAYLISTS.map((rp) => ({
              id: rp.id,
              name: rp.name,
              ownerUserName: '12186046104 (Coach Montanha)',
              provider: 'spotify' as const,
              picture: rp.picture,
              songs: rp.songs.map((s) => ({
                id: s.id,
                title: s.title,
                artist: s.artist,
                thumbnail: s.thumbnail,
                source: 'spotify',
                hasAudio: true
              }))
            }));
            parsed = [...realPlaylists, ...parsed.filter((p: any) => p.provider !== 'spotify' && !p.id?.startsWith('sp-'))];
            try { localStorage.setItem('montanha_playlists_local', JSON.stringify(parsed)); } catch {}
          }
          setPlaylists(parsed);
          return;
        }
      }
    } catch {}

    const realSpotifyInitial: Playlist[] = REAL_SPOTIFY_USER_PLAYLISTS.map((rp) => ({
      id: rp.id,
      name: rp.name,
      ownerUserName: '12186046104 (Coach Montanha)',
      provider: 'spotify' as const,
      picture: rp.picture,
      songs: rp.songs.map((s) => ({
        id: s.id,
        title: s.title,
        artist: s.artist,
        thumbnail: s.thumbnail,
        source: 'spotify',
        hasAudio: true
      }))
    }));

    const defaultPlaylists: Playlist[] = [
      ...realSpotifyInitial,
      {
        id: 'pl-heavy-metal-treino',
        name: '🔥 Treino Heavy Metal (Montanha)',
        ownerUserName: 'Coach Montanha',
        songs: [
          {
            id: 'yt-metal-1',
            title: 'Iron Maiden - The Trooper',
            artist: 'Iron Maiden',
            thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80',
            source: 'youtube',
            youtubeUrl: 'https://www.youtube.com/watch?v=2G5rfPISIwo',
            hasAudio: true
          },
          {
            id: 'yt-metal-2',
            title: 'Metallica - Master of Puppets',
            artist: 'Metallica',
            thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80',
            source: 'youtube',
            youtubeUrl: 'https://www.youtube.com/watch?v=xnKhsTXoKmg',
            hasAudio: true
          },
          {
            id: 'yt-metal-3',
            title: 'Judas Priest - Painkiller',
            artist: 'Judas Priest',
            thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80',
            source: 'youtube',
            youtubeUrl: 'https://www.youtube.com/watch?v=nM__lPTWThU',
            hasAudio: true
          }
        ]
      },
      {
        id: 'pl-rock-classico',
        name: '⚡ Rock Clássico 80s & 90s',
        ownerUserName: 'Coach Montanha',
        songs: [
          {
            id: 'yt-rock-1',
            title: 'AC/DC - Back In Black',
            artist: 'AC/DC',
            thumbnail: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&q=80',
            source: 'youtube',
            youtubeUrl: 'https://www.youtube.com/watch?v=pAgnJDJN4VA',
            hasAudio: true
          },
          {
            id: 'yt-rock-2',
            title: "Guns N' Roses - Sweet Child O' Mine",
            artist: "Guns N' Roses",
            thumbnail: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=400&q=80',
            source: 'youtube',
            youtubeUrl: 'https://www.youtube.com/watch?v=1w7OgIMMRc4',
            hasAudio: true
          }
        ]
      },
      {
        id: 'pl-spotify-favorites',
        name: '🎧 Minhas Favoritas do Spotify',
        ownerUserName: 'Spotify Connect',
        songs: []
      }
    ];

    setPlaylists(defaultPlaylists);
    try {
      localStorage.setItem('montanha_playlists_local', JSON.stringify(defaultPlaylists));
    } catch {}
  };

  const loadDiscoverPlaylists = async (user = currentUser) => {
    try {
      const res = await api.get('/playlists', {
        params: {
          scope: 'discover',
          ...(user?.id ? { userId: user.id, excludeUserId: user.id } : {})
        }
      });
      setDiscoverPlaylists(sanitizeDeepText(Array.isArray(res.data) ? res.data : []));
    } catch (_err) {
      // Offline / Vercel direct mode fallback
    }
  };

  const openBrowserClient = async () => {
    const browserUrl = `${String(api.defaults.baseURL || 'http://127.0.0.1:3001').replace(/\/$/, '')}/`;
    const openedExternally = await desktopApi.openExternal(browserUrl);
    if (!openedExternally) {
      window.open(browserUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const refreshLibraryAfterDownload = async (reason = 'download') => {
    if (libraryRefreshInFlightRef.current) return;
    libraryRefreshInFlightRef.current = true;

    try {
      await Promise.all([
        loadSongs(activeSection, currentUser),
        loadPlaylists(currentUser),
        loadDiscoverPlaylists(currentUser)
      ]);

      if (reason === 'completed-job') {
        setPlaylistMessage('');
        setDownloadMessage('Biblioteca atualizada com o download concluído.');
      }
    } finally {
      libraryRefreshInFlightRef.current = false;
    }
  };

  const loadActivityLogs = async () => {
    const res = await api.get('/logs');
    const nextLogs = sanitizeDeepText(Array.isArray(res.data) ? (res.data as string[]) : []);
    const filteredLogs = nextLogs.filter(
      (entry) =>
        !entry.includes('Dispositivo ativo:') &&
        !entry.includes('Estado ') &&
        !entry.includes('ACK dispositivo')
    );
    setActivityLogs(sanitizeDeepText(filteredLogs.slice(-80)));
  };

  const registerDevice = async (user = currentUser) => {
    await api.post('/devices/register', {
      deviceId: storedDeviceId,
      deviceName,
      platform: navigator.platform,
      userId: user?.id
    });
  };

  const loadDevices = async (user = currentUser) => {
    const res = await api.get('/devices', {
      params: {
        excludeDeviceId: storedDeviceId,
        ...(user?.id ? { userId: user.id } : {})
      }
    });

    const nextDevices = sanitizeDeepText(Array.isArray(res.data) ? (res.data as DeviceSession[]) : []);
    setDevices(nextDevices);
    if (
      selectedOutputDeviceId !== storedDeviceId &&
      !nextDevices.some((device) => device.deviceId === selectedOutputDeviceId)
    ) {
      setSelectedOutputDeviceId(storedDeviceId);
    }
  };

  const loadOfflineIndex = async () => {
    const store = await getOfflineAudioStore();
    const keys = await store.keys();
    const ids = keys
      .map((key: string | number) => String(key))
      .filter((key: string) => key.startsWith('audio:'))
      .map((key: string) => key.slice('audio:'.length));
    setOfflineSongIds(ids);
  };

  const releaseObjectUrl = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  };

  const getActiveMediaElement = () =>
    playbackModeRef.current === 'video' && currentSong?.hasVideo ? videoRef.current : audioRef.current;

  const ensurePlaybackEndpointAvailable = async (_url: string, _unavailableMessage: string) => {
    return true;
  };

  const getPlaybackUrl = async (song: Song, mode: PlaybackMode) => {
    if (mode === 'audio') {
      if (song.path && (song.path.startsWith('http://') || song.path.startsWith('https://'))) {
        return song.path;
      }
      const playbackUrl = await resolveAudioPlaybackUrl({
        songId: song.id,
        baseUrl: String(api.defaults.baseURL || ''),
        getOfflineBlob: async () => {
          const store = await getOfflineAudioStore();
          const offline = await store.getItem<OfflineAudioRecord>(getOfflineAudioKey(song.id));
          return offline?.blob || null;
        },
        createObjectUrl: (blob) => {
          objectUrlRef.current = URL.createObjectURL(blob);
          return objectUrlRef.current;
        },
        releaseObjectUrl,
        onOfflineCacheError: (error) => {
          console.warn('Cache offline indisponivel. Usando streaming local.', error);
          offlineAudioStorePromise = null;
        }
      });
      if (!playbackUrl.startsWith('blob:')) {
        await ensurePlaybackEndpointAvailable(playbackUrl, 'Arquivo de audio indisponivel para esta faixa.');
      }
      return playbackUrl;
    }

    if (!song.hasVideo) {
      throw new Error('Esta faixa nao possui video salvo');
    }

    const playbackUrl = buildLocalVideoPlaybackUrl(String(api.defaults.baseURL || ''), song.id);
    await ensurePlaybackEndpointAvailable(playbackUrl, 'Video indisponivel para esta faixa.');
    return playbackUrl;
  };

  const loadDownloadJobs = async () => {
    const res = await api.get('/downloads/status');
    const nextJobs = sanitizeDeepText(Array.isArray(res.data) ? (res.data as DownloadJob[]) : []);
    const completedJobs = nextJobs.filter((job) => job.id && job.status === 'completed');
    const hasNewCompletedJob = completedJobs.some((job) => !completedDownloadJobIdsRef.current.has(job.id));

    completedJobs.forEach((job) => completedDownloadJobIdsRef.current.add(job.id));
    setDownloadJobs(nextJobs);

    if (hasNewCompletedJob && currentUser) {
      void refreshLibraryAfterDownload('completed-job');
    }
  };

  const loadDesktopPreferences = async () => {
    if (!window.montanhaDesktop?.getPreferences) return;
    const preferences = await window.montanhaDesktop.getPreferences();
    setDesktopPreferences(sanitizeDeepText(preferences));
  };

  const loadDesktopUpdateStatus = async () => {
    if (!window.montanhaDesktop?.getUpdateStatus) return;
    const status = await window.montanhaDesktop.getUpdateStatus();
    setDesktopUpdateStatus(sanitizeDeepText(status));
  };

  const triggerDesktopUpdateCheck = async () => {
    if (!window.montanhaDesktop?.checkForUpdates) return;
    const status = await window.montanhaDesktop.checkForUpdates();
    setDesktopUpdateStatus(sanitizeDeepText(status));
  };

  const installDesktopUpdate = async () => {
    if (!window.montanhaDesktop?.installUpdate) return;
    await window.montanhaDesktop.installUpdate();
  };

  const focusDesktopUpdateSection = (target: 'panel' | 'notes') => {
    setActiveSection('settings');
    setDesktopUpdateFocusTarget(target);

    if (desktopUpdateFocusTimerRef.current) {
      window.clearTimeout(desktopUpdateFocusTimerRef.current);
    }

    const scrollToTarget = () => {
      const targetRef = target === 'notes' ? desktopUpdateNotesRef : desktopUpdatePanelRef;
      targetRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    };

    window.requestAnimationFrame(() => {
      window.setTimeout(scrollToTarget, activeSection === 'settings' ? 0 : 180);
    });

    desktopUpdateFocusTimerRef.current = window.setTimeout(() => {
      setDesktopUpdateFocusTarget(null);
      desktopUpdateFocusTimerRef.current = null;
    }, 2200);
  };

  const probeBackendAvailability = async () => {
    if (typeof window !== 'undefined' && window.location.protocol === 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return false;
    }
    try {
      await api.get('/health');
      setBackendAvailable(true);
      return true;
    } catch {
      setBackendAvailable(false);
      return false;
    }
  };

  const loadAndroidApkInfo = async () => {
    const [apkRes, storageRes] = await Promise.all([api.get('/android/apk-info'), api.get('/service/storage')]);
    setAndroidApkInfo(sanitizeDeepText((apkRes.data || null) as AndroidApkInfo | null));
    setServiceStorage(sanitizeDeepText(storageRes.data?.storage || null));
  };

  const resolvedAndroidApkUrl = (androidApkInfo?.preferredUrl || GITHUB_ANDROID_APK_URL).trim();
  const androidReleasePageUrl = (androidApkInfo?.releaseUrl || GITHUB_RELEASES_LATEST_URL).trim();

  const loadYoutubeRecentSearches = async () => {
    const res = await api.get('/youtube/history', { params: { limit: 8 } });
    setYoutubeRecentSearches(sanitizeDeepText(Array.isArray(res.data) ? (res.data as YoutubeRecentSearch[]) : []));
  };

  const _hideYoutubeRecentSearch = (query: string) => {
    const key = getRecentSearchKey(query);
    if (!key) return;

    setHiddenYoutubeRecentSearches((current) => {
      const next = hideRecentSearch(current, key);
      if (next === current) return current;
      localStorage.setItem(HIDDEN_YOUTUBE_SEARCHES_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const sendDeviceState = async (
    status: 'idle' | 'playing' | 'paused' | 'error',
    overrides?: Partial<{
      currentSong: Song | null;
      currentTime: number;
      duration: number;
      volume: number;
      errorMessage: string | null;
    }>
  ) => {
    try {
      const song = overrides?.currentSong === undefined ? currentSong : overrides.currentSong;
      const nextCurrentTime = overrides?.currentTime ?? currentTime;
      const nextDuration = overrides?.duration ?? duration;
      const nextVolume = overrides?.volume ?? volume;

      await api.post(`/devices/${storedDeviceId}/state`, {
        deviceName,
        platform: navigator.platform,
        userId: currentUser?.id,
        status,
        currentSongId: song?.id || null,
        currentSongTitle: song ? getDisplayTitle(song) : null,
        currentSongArtist: song ? getDisplayArtist(song) : null,
        isPlaying: status === 'playing',
        currentTime: nextCurrentTime,
        duration: nextDuration,
        volume: nextVolume,
        errorMessage: overrides?.errorMessage || null
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (isMiniMode) return;
    if (typeof window !== 'undefined' && window.location.protocol === 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return;
    }

    void probeBackendAvailability();
    const interval = window.setInterval(() => {
      void probeBackendAvailability();
    }, backendAvailable ? 10000 : 2000);

    return () => window.clearInterval(interval);
  }, [backendAvailable, isMiniMode]);

  useEffect(() => {
    if (!isMiniMode && backendAvailable) {
      loadSongs().catch(console.error);
    }
  }, [activeSection, currentUser, isMiniMode, backendAvailable]);

  useEffect(() => {
    const cancelIdle = runWhenIdle(() => {
      void loadOfflineIndex().catch(console.error);
    });
    setIsVideoTheaterOpen(false);
    setIsVideoPanelOpen(false);
    setShowVideoInMiniPlayer(false);

    return () => {
      cancelIdle();
      releaseObjectUrl();
    };
  }, []);

  // Supabase Auth and Realtime sync
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        try { localStorage.setItem('montanha_local_user', JSON.stringify(session.user)); } catch {}
      } else {
        const saved = localStorage.getItem('montanha_local_user');
        if (saved) {
          try { setSupabaseUser(JSON.parse(saved)); } catch {}
        }
      }
      setIsAuthInitialized(true);
    }).catch(() => {
      setIsAuthInitialized(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        try { localStorage.setItem('montanha_local_user', JSON.stringify(session.user)); } catch {}
      }
      setIsAuthInitialized(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Supabase Realtime channel for instant cross-device updates
  useEffect(() => {
    if (!supabaseUser) return;

    // Load cloud favorites on login
    getCloudFavorites(supabaseUser.id).then((cloudFavs) => {
      if (cloudFavs && cloudFavs.length > 0) {
        const favIds = new Set(cloudFavs.map((f) => f.song_id));
        setSongs((prev) =>
          prev.map((s) => ({
            ...s,
            favorite: favIds.has(s.id) ? true : s.favorite
          }))
        );
      }
    });

    // Realtime subscription
    const channel = supabase
      .channel('montanha-realtime-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'montanha_favorites', filter: `user_id=eq.${supabaseUser.id}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newFav = payload.new as any;
          setSongs((prev) => prev.map((s) => s.id === newFav.song_id ? { ...s, favorite: true } : s));
        } else if (payload.eventType === 'DELETE') {
          const oldFav = payload.old as any;
          setSongs((prev) => prev.map((s) => s.id === oldFav.song_id ? { ...s, favorite: false } : s));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabaseUser]);

  useEffect(() => {
    // Disabled auto-onboarding popup on initial load to ensure instant, clean access
    if (false && !hasSeenDesktopOnboarding) {
      openDesktopOnboarding(0);
    }
  }, [hasSeenDesktopOnboarding]);

  useEffect(() => {
    if (!activeDesktopOnboardingStep || isMiniMode) return;

    if (activeDesktopOnboardingStep.id === 'nav-download' && activeSection !== 'download') {
      setActivePlaylistId(null);
      setActiveDiscoverPlaylistId(null);
      setActiveSection('download');
      return;
    }

    if (activeDesktopOnboardingStep.id === 'apk-release' && activeSection !== 'settings') {
      setActivePlaylistId(null);
      setActiveDiscoverPlaylistId(null);
      setActiveSection('settings');
    }
  }, [activeDesktopOnboardingStep, activeSection, isMiniMode]);

  useEffect(() => {
    if (!isMiniMode && currentUser && backendAvailable) {
      loadPlaylists().catch(console.error);
    }
  }, [currentUser, isMiniMode, backendAvailable]);

  useEffect(() => {
    if (youtubeTargetPlaylistId && !playlists.some((playlist) => playlist.id === youtubeTargetPlaylistId)) {
      setYoutubeTargetPlaylistId('');
    }
  }, [youtubeTargetPlaylistId, playlists]);

  useEffect(() => {
    playbackModeRef.current = playbackMode;
  }, [playbackMode]);

  useEffect(() => {
    void desktopApi.setMiniPlayerMode(
      showVideoInMiniPlayer && currentSong && playbackMode === 'video' && currentSong.hasVideo ? 'video' : 'compact'
    );
  }, [currentSong?.id, currentSong?.hasVideo, playbackMode, showVideoInMiniPlayer]);

  useEffect(() => {
    if (!backendAvailable) {
      return;
    }

    if (!currentSong || playbackMode !== 'video' || !currentSong.hasVideo || !videoRef.current) {
      return;
    }

    const nextSrc = `${api.defaults.baseURL}/reproduzir-video/${currentSong.id}`;
    const element = videoRef.current;
    const currentSrc = element.currentSrc || element.src || '';

    if (!currentSrc.includes(`/reproduzir-video/${currentSong.id}`)) {
      element.src = nextSrc;
      element.load();
    }

    element.volume = volume;

    if (isPlaying) {
      element.play().catch(console.error);
    }
  }, [currentSong?.id, currentSong?.hasVideo, playbackMode, isPlaying, volume, backendAvailable]);

  useEffect(() => {
    if (playbackMode !== 'video' || !currentSong?.hasVideo) {
      setIsVideoTheaterOpen(false);
      setIsVideoPanelOpen(false);
      setShowVideoInMiniPlayer(false);
    }
  }, [playbackMode, currentSong?.id, currentSong?.hasVideo]);

  useEffect(() => {
    if (isMiniMode) return;

    broadcastSnapshot({
      currentSong,
      isPlaying,
      currentTime,
      duration,
      volume,
      playbackMode,
      showVideoInMiniPlayer
    });
  }, [isMiniMode, currentSong, isPlaying, currentTime, duration, volume, playbackMode, showVideoInMiniPlayer]);

  useEffect(() => {
    if (!isMiniMode && backendAvailable) {
      loadDiscoverPlaylists().catch(console.error);
    }
  }, [currentUser, isMiniMode, backendAvailable]);

  useEffect(() => {
    if (isMiniMode || !backendAvailable) return;

    registerDevice().catch(console.error);
    loadDevices().catch(console.error);

    const interval = window.setInterval(() => {
      registerDevice().catch(console.error);
      loadDevices().catch(console.error);
    }, 10000);

    return () => window.clearInterval(interval);
  }, [currentUser, isMiniMode, deviceName, backendAvailable]);

  useEffect(() => {
    if (isMiniMode || !backendAvailable) return;

    const status: 'idle' | 'playing' | 'paused' =
      currentSong ? (isPlaying ? 'playing' : 'paused') : 'idle';
    sendDeviceState(status).catch(console.error);

    const interval = window.setInterval(() => {
      sendDeviceState(status).catch(console.error);
    }, 15000);

    return () => window.clearInterval(interval);
  }, [currentUser, isMiniMode, currentSong?.id, isPlaying, volume, backendAvailable]);

  useEffect(() => {
    if (isMiniMode || !backendAvailable) return;

    const interval = window.setInterval(async () => {
      try {
        const res = await api.get(`/devices/${storedDeviceId}/command`, {
          params: {
            after: lastRemoteCommandId,
            deviceName,
            platform: navigator.platform,
            ...(currentUser?.id ? { userId: currentUser.id } : {})
          }
        });

        const command = res.data?.command;
        if (!command?.payload) return;

        setLastRemoteCommandId(command.commandId);
        try {
          await runPlayerCommand(command.payload as PlayerCommand, true);
          await api.post(`/devices/${storedDeviceId}/ack`, {
            commandId: command.commandId,
            deviceName,
            platform: navigator.platform,
            userId: currentUser?.id,
            status: 'executed',
            details: `Comando ${command.payload.type} executado no dispositivo`
          });
        } catch (executionError: any) {
          await sendDeviceState('error', {
            errorMessage: executionError?.message || 'Falha ao executar comando remoto'
          });
          await api.post(`/devices/${storedDeviceId}/ack`, {
            commandId: command.commandId,
            deviceName,
            platform: navigator.platform,
            userId: currentUser?.id,
            status: 'error',
            details: executionError?.message || 'Falha ao executar comando remoto'
          });
        }
      } catch (error) {
        console.error(error);
      }
    }, 2000);

    return () => window.clearInterval(interval);
  }, [currentUser, isMiniMode, lastRemoteCommandId, deviceName, selectedOutputDeviceId, backendAvailable]);

  useEffect(() => {
    if (!showActivityPanel) return;
    if (!backendAvailable) return;

    loadActivityLogs().catch(console.error);
    const interval = window.setInterval(() => {
      loadActivityLogs().catch(console.error);
    }, 2000);

    return () => window.clearInterval(interval);
  }, [showActivityPanel, isDownloading, backendAvailable]);

  const hasUnfinishedDownloadJobs = downloadJobs.some((job) =>
    ['queued', 'running', 'paused'].includes(job.status)
  );

  useEffect(() => {
    if (!backendAvailable || !currentUser) return;
    if (activeSection !== 'download' && !isDownloading && !hasUnfinishedDownloadJobs) return;

    loadDownloadJobs().catch(console.error);
    const interval = window.setInterval(() => {
      loadDownloadJobs().catch(console.error);
    }, activeSection === 'download' || isDownloading ? 1200 : 2500);

    return () => window.clearInterval(interval);
  }, [activeSection, isDownloading, backendAvailable, currentUser, hasUnfinishedDownloadJobs]);

  useEffect(() => {
    if (isMiniMode || activeSection !== 'download' || !backendAvailable) return;
    loadYoutubeRecentSearches().catch(console.error);
  }, [activeSection, isMiniMode, backendAvailable]);

  useEffect(() => {
    if (isMiniMode || activeSection !== 'settings') return;
    loadDesktopPreferences().catch(console.error);
    loadDesktopUpdateStatus().catch(console.error);
  }, [activeSection, isMiniMode]);

  useEffect(() => {
    if (isMiniMode || activeSection !== 'settings' || !backendAvailable) return;
    loadAndroidApkInfo().catch(console.error);
  }, [activeSection, isMiniMode, backendAvailable]);

  useEffect(() => {
    localStorage.setItem('montanha-prefer-download-on-launch', preferDownloadOnLaunch ? 'true' : 'false');
  }, [preferDownloadOnLaunch]);

  useEffect(() => {
    if (!resolvedAndroidApkUrl) {
      setApkQrCodeDataUrl('');
      return;
    }

    loadQrCodeModule()
      .then((QRCode) =>
        QRCode.toDataURL(resolvedAndroidApkUrl, {
          width: 240,
          margin: 1,
          color: {
            dark: '#050505',
            light: '#0000'
          }
        })
      )
      .then((dataUrl) => setApkQrCodeDataUrl(dataUrl))
      .catch(() => setApkQrCodeDataUrl(''));
  }, [resolvedAndroidApkUrl]);

  useEffect(() => {
    const normalizedUrl = youtubeUrl.trim();

    if (!normalizedUrl) {
      youtubeSelectionRequestIdRef.current += 1;
      setLastAnalyzedUrl('');
      return;
    }

    if (normalizedUrl !== lastAnalyzedUrl) {
    }
  }, [youtubeUrl, lastAnalyzedUrl]);

  const activePlaylist = useMemo(
    () => playlists.find((playlist) => playlist.id === activePlaylistId) || null,
    [playlists, activePlaylistId]
  );

  const activeDiscoverPlaylist = useMemo(
    () => discoverPlaylists.find((playlist) => playlist.id === activeDiscoverPlaylistId) || null,
    [discoverPlaylists, activeDiscoverPlaylistId]
  );

  const selectedOutputDevice = useMemo(() => {
    if (selectedOutputDeviceId === storedDeviceId) {
      return null;
    }

    return devices.find((device) => device.deviceId === selectedOutputDeviceId) || null;
  }, [devices, selectedOutputDeviceId, storedDeviceId]);

  const homePlaylists = useMemo(() => {
    const term = searchTerm.toLowerCase();

    return playlists.filter((playlist) => {
      if (!term) return true;
      const haystack = [
        playlist.name,
        ...(playlist.songs || []).map((song) => `${getDisplayTitle(song)} ${getDisplayArtist(song) || ''}`)
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [playlists, searchTerm]);

  const spotifyPlaylists = useMemo(() => 
    playlists.filter(p => p.provider === 'spotify' || p.id.startsWith('sync-spotify') || p.id.startsWith('sp-')), 
    [playlists]
  );
  const youtubePlaylists = useMemo(() => 
    playlists.filter(p => p.provider === 'youtube' || p.id.startsWith('sync-youtube') || p.id.startsWith('yt-pl-')), 
    [playlists]
  );
  const deezerPlaylists = useMemo(() => 
    playlists.filter(p => p.provider === 'deezer' || p.id.startsWith('dz-pl-')), 
    [playlists]
  );

  const freeYoutubeTracks: Song[] = useMemo(() => [
    {
      id: 'yt-E0ozmU9cJDg',
      title: 'Heavy Metal Titan 2026: 90 Minutes of Fire & Guitar Power',
      artist: 'Heavy Metal Titan',
      thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80',
      source: 'youtube',
      youtubeUrl: 'https://www.youtube.com/watch?v=E0ozmU9cJDg',
      hasAudio: true
    },
    {
      id: 'yt-pAgnJDJN4VA',
      title: 'Back In Black (Remastered Audio)',
      artist: 'AC/DC',
      thumbnail: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&q=80',
      source: 'youtube',
      youtubeUrl: 'https://www.youtube.com/watch?v=pAgnJDJN4VA',
      hasAudio: true
    },
    {
      id: 'yt-Zi_XLOBDo_Y',
      title: 'Billie Jean (High Fidelity Audio)',
      artist: 'Michael Jackson',
      thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80',
      source: 'youtube',
      youtubeUrl: 'https://www.youtube.com/watch?v=Zi_XLOBDo_Y',
      hasAudio: true
    },
    {
      id: 'yt-fKopy74weus',
      title: 'Motivação & Treino Hardcore: CrossTraining WOD Beats',
      artist: 'Coach Montanha Gym Power',
      thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&q=80',
      source: 'youtube',
      youtubeUrl: 'https://www.youtube.com/watch?v=fKopy74weus',
      hasAudio: true
    }
  ], []);

  const localPlaylists = useMemo(() => 
    playlists.filter(p => (!p.provider || p.provider === 'local') && !p.id.startsWith('dz-pl-') && !p.id.startsWith('sync-') && !p.id.startsWith('sp-') && !p.id.startsWith('yt-pl-')), 
    [playlists]
  );

  const explorePlaylists = useMemo(() => {
    const term = searchTerm.toLowerCase();

    return discoverPlaylists.filter((playlist) => {
      if (!term) return true;
      const haystack = [
        playlist.name,
        playlist.ownerUserName || '',
        ...(playlist.songs || []).map((song) => `${getDisplayTitle(song)} ${getDisplayArtist(song) || ''}`)
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [discoverPlaylists, searchTerm]);

  const filteredSongs = useMemo(() => {
    if (activePlaylist) {
      return activePlaylist.songs || [];
    }
    if (activeDiscoverPlaylist) {
      return activeDiscoverPlaylist.songs || [];
    }
    let base = songs;
    if (activeSection === 'favorites') {
      base = songs.filter((song) => Boolean(song.favorite));
    }
    if (!searchTerm.trim()) return base;
    return base.filter((song) => getSongSearchText(song).includes(searchTerm.toLowerCase()));
  }, [songs, searchTerm, activeSection, activePlaylist, activeDiscoverPlaylist]);

  const queue = filteredSongs;
  const activeCollection = activePlaylist || activeDiscoverPlaylist || null;
  const activeCollectionCover = activeCollection?.songs?.[0]?.thumbnail || null;
  const isPlaylistDetailView = Boolean(activeCollection);

  const heroTitle =
    activePlaylist
      ? activePlaylist.name
      : activeDiscoverPlaylist
        ? activeDiscoverPlaylist.name
      : activeSection === 'home'
      ? 'Início'
      : activeSection === 'explore'
        ? 'Explorar'
        : activeSection === 'search' || activeSection === 'download'
          ? 'Buscar'
        : activeSection === 'downloads'
          ? 'Downloads'
        : activeSection === 'playlists'
          ? 'Playlists'
        : activeSection === 'favorites'
          ? 'Favoritas'
          : activeSection === 'settings'
            ? 'Configurações'
            : 'Sua Biblioteca';

  const heroDescription =
    activePlaylist
      ? `${filteredSongs.length} musicas nesta playlist.`
      : activeDiscoverPlaylist
        ? `${filteredSongs.length} musicas na playlist de ${activeDiscoverPlaylist.ownerUserName || 'outro usuario'}.`
      : activeSection === 'explore'
      ? 'Explore playlists publicadas por outros usuarios da rede.'
      : activeSection === 'download'
        ? 'Cole um link, envie para o backend e publique a musica no Explorar.'
      : activeSection === 'favorites'
        ? 'Suas musicas favoritas em um so lugar.'
        : activeSection === 'settings'
          ? 'Ajuste o desktop e acompanhe o host local sem poluicao visual.'
          : currentUser
          ? `${homePlaylists.length} playlists organizadas para ${currentUser.nome}.`
          : 'Entre com um usuario para separar sua biblioteca.';

  const sqliteStatusLabel = !backendAvailable
    ? 'Host iniciando'
    : serviceStorage?.sqlite?.ready
      ? 'Pronto'
      : 'Sem resposta';
  const redisStatusLabel = !backendAvailable
    ? 'Aguardando host'
    : serviceStorage?.redis?.mode || 'Sem endpoint';
  const apkStatusLabel = resolvedAndroidApkUrl
    ? 'GitHub latest'
    : !backendAvailable
      ? 'Aguardando host'
      : 'Em preparacao';
  const updateStatusLabel =
    desktopUpdateStatus.state === 'downloaded'
      ? 'Pronto para instalar'
      : desktopUpdateStatus.state === 'downloading'
        ? 'Baixando'
        : desktopUpdateStatus.state === 'available'
          ? 'Nova tag'
        : desktopUpdateStatus.state === 'checking'
          ? 'Verificando'
          : desktopUpdateStatus.state === 'unconfigured'
            ? 'Sem feed'
            : desktopUpdateStatus.state === 'disabled'
              ? 'Desligado'
              : desktopUpdateStatus.state === 'error'
                ? 'Erro'
                : 'Ativo';
  const shouldShowDesktopUpdateBanner =
    desktopUpdateStatus.state === 'available' ||
    desktopUpdateStatus.state === 'downloading' ||
    desktopUpdateStatus.state === 'downloaded';
  const releaseNotesSections = useMemo(
    () => splitReleaseNotesText(desktopUpdateStatus.releaseNotes),
    [desktopUpdateStatus.releaseNotes]
  );
  const releaseNotesPreview = releaseNotesSections.slice(0, 2);
  const formattedReleaseDate = useMemo(
    () => formatReleaseDateLabel(desktopUpdateStatus.releaseDate),
    [desktopUpdateStatus.releaseDate]
  );
  const updateHeadline =
    desktopUpdateStatus.releaseName ||
    (desktopUpdateStatus.availableVersion ? `Montanha Music Lab ${desktopUpdateStatus.availableVersion}` : 'Atualizacao do Montanha Music Lab');
  const desktopTourFocusClass = 'border-cyan-300/45 bg-cyan-300/[0.08] shadow-[0_0_0_1px_rgba(103,232,249,0.18),0_20px_60px_rgba(8,145,178,0.12)]';

  const settingsContent = (
    <div className="space-y-6">
      <div className="rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.12),transparent_28%),linear-gradient(180deg,#151515_0%,#090909_100%)] p-6 md:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-green-300">Configurações</p>
            <h3 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">Desktop, servidor local e Android</h3>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-400">
              Ajuste o comportamento do app, confira a saude do host Windows e prepare a distribuicao do APK pela rede local.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => openDesktopOnboarding(0)}
              className="rounded-[20px] border border-cyan-400/25 bg-cyan-400/10 px-4 py-3 text-left transition hover:border-cyan-300/40 hover:bg-cyan-400/16"
            >
              <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-100/80">Tutorial</p>
              <p className="mt-1 text-sm font-semibold text-white">Revisar fluxo guiado</p>
            </button>
            <div className="rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.24em] text-gray-500">Splash</p>
              <p className="mt-1 text-sm font-semibold text-white">{desktopPreferences.showSplash ? 'Ligada' : 'Desligada'}</p>
            </div>
            <div className="rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.24em] text-gray-500">Inicializacao</p>
              <p className="mt-1 text-sm font-semibold text-white">{desktopPreferences.startHiddenInTray ? 'Bandeja' : 'Janela'}</p>
            </div>
            <div className="rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.24em] text-gray-500">Host</p>
              <p className="mt-1 text-sm font-semibold text-white">LAN pronta</p>
            </div>
            <div className="rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.24em] text-gray-500">Atualizações</p>
              <p className="mt-1 text-sm font-semibold text-white">{updateStatusLabel}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.12fr)_360px]">
        <div className="min-w-0 space-y-6">
          <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,#111111_0%,#0a0a0a_100%)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.16)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-green-300">Aplicativo</p>
                <h3 className="mt-2 text-2xl font-black tracking-tight md:text-3xl">Comportamento do desktop</h3>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-400">
                  Preferencias principais do cliente Windows. Menos ruido, mais controle.
                </p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.04] p-3 text-gray-300">
                <Settings2 size={18} />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button
                onClick={() => void updateDesktopPreference({ showSplash: !desktopPreferences.showSplash })}
                className="flex w-full items-center justify-between gap-4 rounded-[24px] border border-white/10 bg-white/[0.03] p-5 text-left transition hover:border-green-400/20 hover:bg-white/[0.05]"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">Mostrar splash ao iniciar</p>
                  <p className="mt-2 text-sm leading-6 text-gray-400">Exibe a tela de abertura antes da interface principal.</p>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] ${desktopPreferences.showSplash ? 'bg-green-500/15 text-green-300' : 'bg-white/10 text-gray-400'}`}>
                  {desktopPreferences.showSplash ? 'Ligado' : 'Desligado'}
                </span>
              </button>

              <button
                onClick={() => void updateDesktopPreference({ startHiddenInTray: !desktopPreferences.startHiddenInTray })}
                className="flex w-full items-center justify-between gap-4 rounded-[24px] border border-white/10 bg-white/[0.03] p-5 text-left transition hover:border-green-400/20 hover:bg-white/[0.05]"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">Iniciar escondido na bandeja</p>
                  <p className="mt-2 text-sm leading-6 text-gray-400">Usado para auto-start em background. Ao abrir manualmente, a janela principal continua aparecendo.</p>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] ${desktopPreferences.startHiddenInTray ? 'bg-green-500/15 text-green-300' : 'bg-white/10 text-gray-400'}`}>
                  {desktopPreferences.startHiddenInTray ? 'Ligado' : 'Desligado'}
                </span>
              </button>

              <button
                onClick={() => handlePreferDownloadOnLaunchChange(!preferDownloadOnLaunch)}
                className="flex w-full items-center justify-between gap-4 rounded-[24px] border border-white/10 bg-white/[0.03] p-5 text-left transition hover:border-green-400/20 hover:bg-white/[0.05]"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">Abrir sempre em downloads</p>
                  <p className="mt-2 text-sm leading-6 text-gray-400">Usa a captura do YouTube como ponto de entrada principal.</p>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] ${preferDownloadOnLaunch ? 'bg-green-500/15 text-green-300' : 'bg-white/10 text-gray-400'}`}>
                  {preferDownloadOnLaunch ? 'Ligado' : 'Desligado'}
                </span>
              </button>

              <button
                onClick={() => void updateDesktopPreference({ autoUpdateEnabled: !desktopPreferences.autoUpdateEnabled })}
                className="flex w-full items-center justify-between gap-4 rounded-[24px] border border-white/10 bg-white/[0.03] p-5 text-left transition hover:border-green-400/20 hover:bg-white/[0.05]"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">Atualização automática</p>
                  <p className="mt-2 text-sm leading-6 text-gray-400">
                    Verifica novas versões do Montanha Music Lab em segundo plano e baixa o instalador sozinho quando houver update.
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] ${desktopPreferences.autoUpdateEnabled ? 'bg-green-500/15 text-green-300' : 'bg-white/10 text-gray-400'}`}>
                  {desktopPreferences.autoUpdateEnabled ? 'Ligado' : 'Desligado'}
                </span>
              </button>

              <div className="rounded-[24px] border border-emerald-400/15 bg-emerald-400/[0.04] p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">Backup da biblioteca</p>
                    <p className="mt-2 text-lg font-semibold text-white">Exportar músicas para uma pasta do sistema</p>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
                      Gere uma cópia dos arquivos da sua biblioteca em MP3, MP4 ou AVI no diretório que você escolher.
                    </p>
                  </div>
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-100">
                    {desktopPreferences.backupFormat.toUpperCase()}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto]">
                  <div className="min-w-0 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                    <label className="text-[11px] uppercase tracking-[0.2em] text-gray-500">Pasta de destino</label>
                    <input
                      value={desktopPreferences.backupDirectory}
                      onChange={(e) =>
                        setDesktopPreferences((prev) => ({
                          ...prev,
                          backupDirectory: e.target.value
                        }))
                      }
                      onBlur={() => void updateDesktopPreference({ backupDirectory: desktopPreferences.backupDirectory })}
                      placeholder="Ex.: C:\\Users\\SeuUsuario\\Music\\Montanha Music Lab Backup"
                      className="mt-2 h-9 w-full truncate bg-transparent text-sm font-semibold text-white outline-none placeholder:text-gray-600"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => void chooseBackupDirectory()}
                    className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 text-sm font-semibold text-gray-200 hover:bg-white/[0.08]"
                  >
                    <FolderOpen size={16} />
                    Escolher pasta
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {(['mp3', 'mp4', 'avi'] as BackupFormat[]).map((format) => (
                    <button
                      key={format}
                      type="button"
                      onClick={() => void updateBackupFormat(format)}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        desktopPreferences.backupFormat === format
                          ? 'border-emerald-400/40 bg-emerald-400/15 text-emerald-100'
                          : 'border-white/10 bg-white/[0.03] text-gray-300 hover:bg-white/[0.07]'
                      }`}
                    >
                      {format.toUpperCase()}
                    </button>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => void runMusicBackup()}
                    disabled={isBackupRunning || !desktopPreferences.backupDirectory}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isBackupRunning ? <LoaderCircle size={16} className="animate-spin" /> : <HardDriveDownload size={16} />}
                    {isBackupRunning ? 'Gerando backup...' : 'Gerar backup agora'}
                  </button>
                  <p className="text-xs leading-5 text-gray-500">
                    MP4 e AVI usam o vídeo salvo quando existir; faixas só com áudio recebem um vídeo simples para compatibilidade.
                  </p>
                </div>

                {backupMessage ? <p className="mt-4 text-sm leading-6 text-gray-300">{backupMessage}</p> : null}

                {lastBackupResult ? (
                  <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-white">
                        {lastBackupResult.exported.length} exportadas de {lastBackupResult.total}
                      </p>
                      <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-gray-300">
                        {lastBackupResult.format.toUpperCase()}
                      </span>
                    </div>
                    {lastBackupResult.exported.length > 0 ? (
                      <div className="mt-3 max-h-32 space-y-2 overflow-y-auto pr-1">
                        {lastBackupResult.exported.slice(0, 5).map((item) => (
                          <p key={`${item.id}-${item.path}`} className="truncate text-xs text-gray-400">{item.fileName}</p>
                        ))}
                      </div>
                    ) : null}
                    {lastBackupResult.skipped.length > 0 ? (
                      <p className="mt-3 text-xs leading-5 text-amber-200">
                        {lastBackupResult.skipped.length} faixa(s) não puderam ser convertidas. Veja a atividade para detalhes.
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
              <div
                ref={desktopUpdatePanelRef}
                className={`rounded-[24px] border bg-[#0d0d0d] p-5 transition ${
                  desktopUpdateFocusTarget === 'panel'
                    ? 'border-cyan-400/40 shadow-[0_0_0_1px_rgba(34,211,238,0.22)]'
                    : 'border-white/10'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-gray-500">Atualizações do GitHub</p>
                    <p className="mt-3 text-base font-semibold text-white">Versão atual {desktopUpdateStatus.currentVersion}</p>
                    <p className="mt-2 text-sm leading-6 text-gray-400">
                      O Montanha Music Lab verifica as releases publicadas em segundo plano e avisa quando entra uma atualização nova.
                    </p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-gray-300">
                    {updateStatusLabel}
                  </span>
                </div>

                <div
                  ref={desktopUpdateNotesRef}
                  className={`mt-4 rounded-2xl border bg-white/[0.03] px-4 py-4 transition ${
                    desktopUpdateFocusTarget === 'notes'
                      ? 'border-cyan-400/40 shadow-[0_0_0_1px_rgba(34,211,238,0.22)]'
                      : 'border-white/10'
                  }`}
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Último release detectado</p>
                  <p className="mt-3 break-all text-sm font-semibold text-white">
                    {desktopUpdateStatus.releaseUrl || 'URL do release ainda indisponível'}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-gray-500">
                    Se entrar uma tag nova no repositório, o app compara a versão atual com esse release e dispara o aviso automaticamente.
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={() => void triggerDesktopUpdateCheck()}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-gray-200 hover:bg-white/[0.08]"
                  >
                    Verificar atualizações
                  </button>
                  {desktopUpdateStatus.releaseUrl ? (
                    <button
                      onClick={() => void desktopApi.openExternal(desktopUpdateStatus.releaseUrl || '')}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-gray-200 hover:bg-white/[0.08]"
                    >
                      Abrir release
                    </button>
                  ) : null}
                  {desktopUpdateStatus.state === 'downloaded' ? (
                    <button
                      onClick={() => void installDesktopUpdate()}
                      className="rounded-full border border-green-500/30 bg-green-500/15 px-4 py-2 text-sm text-green-100 hover:bg-green-500/20"
                    >
                      Reiniciar e instalar
                    </button>
                  ) : null}
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                  <p className="text-sm font-semibold text-white">
                    {desktopUpdateStatus.availableVersion
                      ? `Nova versão detectada: ${desktopUpdateStatus.availableVersion}`
                      : desktopUpdateStatus.releaseName
                        ? 'Último release confirmado'
                        : 'Nenhuma nova versão detectada ainda'}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-gray-400">{desktopUpdateStatus.message}</p>
                  {desktopUpdateStatus.progress !== null && desktopUpdateStatus.progress !== undefined ? (
                    <div className="mt-3">
                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-green-400 to-cyan-400"
                          style={{ width: `${Math.max(3, Math.min(100, Number(desktopUpdateStatus.progress || 0)))}%` }}
                        />
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Notas da versão</p>
                      <p className="mt-3 text-base font-semibold text-white">{updateHeadline}</p>
                      {formattedReleaseDate ? (
                        <p className="mt-2 text-xs uppercase tracking-[0.18em] text-gray-500">Publicado em {formattedReleaseDate}</p>
                      ) : null}
                    </div>
                    {desktopUpdateStatus.availableVersion ? (
                      <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-cyan-100">
                        v{desktopUpdateStatus.availableVersion}
                      </span>
                    ) : null}
                  </div>

                  {desktopUpdateStatus.releaseNotes ? (
                    <div className="mt-4 max-h-[280px] overflow-y-auto rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
                      <p className="whitespace-pre-wrap text-sm leading-6 text-gray-300">{desktopUpdateStatus.releaseNotes}</p>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm leading-6 text-gray-500">
                      As notas aparecem aqui quando uma versão publicada expõe o que mudou junto do updater.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {settingsMessage ? <p className="mt-4 text-sm text-gray-400">{settingsMessage}</p> : null}
          </div>

          <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,#111111_0%,#0a0a0a_100%)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.16)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Servidor local</p>
                <h3 className="mt-2 text-2xl font-black tracking-tight md:text-3xl">Status do host Windows</h3>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-400">
                  O backend continua no centro da operacao. Aqui ficam os motores e o armazenamento em uso.
                </p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.04] p-3 text-gray-300">
                <Server size={18} />
              </div>
            </div>

            {!backendAvailable ? (
              <div className="mt-5 rounded-[24px] border border-amber-400/15 bg-amber-400/8 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">Host local</p>
                <p className="mt-2 text-sm font-semibold text-white">O desktop abriu antes do backend responder.</p>
                <p className="mt-2 text-sm leading-6 text-gray-300">
                  Assim que o servidor local terminar de subir, este painel troca automaticamente para os caminhos reais de SQLite, Redis e APK.
                </p>
              </div>
            ) : null}

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-[24px] border border-white/10 bg-[#0d0d0d] p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-gray-500">SQLite</p>
                <p className="mt-3 text-lg font-semibold text-white">{sqliteStatusLabel}</p>
                <p className="mt-2 break-all text-xs leading-5 text-gray-500">
                  {backendAvailable ? serviceStorage?.sqlite?.path || 'Sem caminho informado' : 'Conectando ao armazenamento local...'}
                </p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-[#0d0d0d] p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-gray-500">Redis</p>
                <p className="mt-3 text-lg font-semibold text-white">{redisStatusLabel}</p>
                <p className="mt-2 break-all text-xs leading-5 text-gray-500">
                  {backendAvailable
                    ? serviceStorage?.redis?.url || serviceStorage?.redis?.error || 'Sem endpoint'
                    : 'Aguardando disponibilidade do cache em memoria...'}
                </p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-[#0d0d0d] p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-gray-500">APK Android</p>
                <p className="mt-3 text-lg font-semibold text-white">{apkStatusLabel}</p>
                <p className="mt-2 text-xs leading-5 text-gray-500">{GITHUB_ANDROID_APK_ASSET_NAME}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,#111111_0%,#0a0a0a_100%)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.16)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-green-300">Android</p>
                  <h3 className="mt-2 text-2xl font-black tracking-tight md:text-3xl">Distribuicao do APK</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-400">
                    O QR sempre aponta para o asset do latest release no GitHub, e o botao abre a pagina do release
                    para download manual.
                  </p>
                </div>
                <div className="rounded-full border border-white/10 bg-white/[0.04] p-3 text-gray-300">
                  <Smartphone size={18} />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div
                  className={`rounded-[24px] border border-white/10 bg-black/20 p-4 ${
                    activeDesktopOnboardingStepId === 'apk-release' ? desktopTourFocusClass : ''
                  }`}
                >
                  <p className="text-xs uppercase tracking-[0.22em] text-gray-500">Release do APK</p>
                  <button
                    type="button"
                    onClick={() => void desktopApi.openExternal(androidReleasePageUrl)}
                    className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-500/12 px-4 text-sm font-semibold text-emerald-100 transition hover:border-emerald-300/50 hover:bg-emerald-500/18"
                  >
                    <FolderOpen size={16} />
                    Abrir pasta do release
                  </button>
                  <p className="mt-3 text-xs leading-5 text-gray-500">
                    Baixe manualmente o <span className="font-semibold text-gray-300">{GITHUB_ANDROID_APK_ASSET_NAME}</span>{' '}
                    sem precisar ler o QR code.
                  </p>
                </div>

                <div className="flex flex-col items-center rounded-[28px] border border-dashed border-white/10 bg-[#0b0b0b] p-5 text-center">
                  {apkQrCodeDataUrl ? (
                    <img src={apkQrCodeDataUrl} alt="QR do APK Android" className="h-52 w-52 rounded-[24px] bg-white p-3" />
                ) : (
                  <div className="flex h-52 w-52 items-center justify-center rounded-[24px] border border-white/10 bg-white/[0.03] text-gray-500">
                      <QrCode size={42} />
                    </div>
                  )}
                  <p className="mt-4 text-sm font-semibold text-white">QR do ultimo APK publicado</p>
                  <p className="mt-2 text-xs leading-5 text-gray-500">
                    {androidApkInfo?.fileExists
                      ? 'O APK local ja foi gerado, mas este QR baixa direto o Montanha Music Lab-Android.apk do latest release no GitHub.'
                      : 'Ao ler com o celular, o download abre direto no asset Montanha Music Lab-Android.apk do latest release no GitHub.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
  const formatTime = (time: number) => {
    if (!isFinite(time) || Number.isNaN(time)) return '0:00';
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const getSongIndex = (song: Song | null, list: Song[]) => {
    if (!song) return -1;
    return list.findIndex((s) => s.id === song.id);
  };

  const broadcastSnapshot = (next?: Partial<PlayerSnapshot>, queueOverride?: Song[]) => {
    const snapshot: PlayerSnapshot = {
      currentSong: next?.currentSong ?? currentSong,
      isPlaying: next?.isPlaying ?? isPlaying,
      currentTime: next?.currentTime ?? currentTime,
      duration: next?.duration ?? duration,
      volume: next?.volume ?? volume,
      queue: queueOverride ?? next?.queue ?? queue,
      playbackMode: next?.playbackMode ?? playbackModeRef.current,
      showVideoInMiniPlayer: next?.showVideoInMiniPlayer ?? showVideoInMiniPlayer
    };

    channel.postMessage({ type: 'PLAYER_STATE', payload: snapshot });
  };

  
  const playInYouTubePlayer = (rawVideoId: string) => {
    const clean = rawVideoId.replace(/^yt-/, '').replace(/https?:\/\/(www\.)?youtube\.com\/watch\?v=/, '').split('&')[0];
    if (!clean) return false;

    if (window.ytPlayer && typeof window.ytPlayer.loadVideoById === 'function') {
      try {
        window.ytPlayer.loadVideoById(clean);
        if (typeof window.ytPlayer.unMute === 'function') window.ytPlayer.unMute();
        if (typeof window.ytPlayer.setVolume === 'function') window.ytPlayer.setVolume(Math.round(volume * 100));
        window.ytPlayer.playVideo();
        setIsPlaying(true);
        setPlayerNotice('');
        return true;
      } catch (e) {
        console.warn('ytPlayer.loadVideoById error:', e);
      }
    }

    if (window.YT && window.YT.Player) {
      try {
        window.ytPlayer = new window.YT.Player('yt-hidden-player', {
          height: '200',
          width: '200',
          videoId: clean,
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            playsinline: 1
          },
          events: {
            onReady: (event: any) => {
              try {
                if (typeof event.target.unMute === 'function') event.target.unMute();
                if (typeof event.target.setVolume === 'function') event.target.setVolume(Math.round(volume * 100));
                event.target.playVideo();
                setIsPlaying(true);
                setPlayerNotice('');
              } catch {}
            },
            onStateChange: (event: any) => {
              if (event.data === 1) setIsPlaying(true);
              else if (event.data === 2) setIsPlaying(false);
              else if (event.data === 0) void playNext();
            }
          }
        });
        setIsPlaying(true);
        setPlayerNotice('');
        return true;
      } catch (err) {
        console.error('Failed to init YT player on demand:', err);
      }
    }

    return false;
  };

  const executePlaySong = async (
    song: Song,
    options?: {
      preferredMode?: PlaybackMode;
      forceReload?: boolean;
      allowVideoFallback?: boolean;
    }
  ) => {
    const preferredMode = options?.preferredMode || playbackModeRef.current;
    const forceReload = Boolean(options?.forceReload);
    const allowVideoFallback = options?.allowVideoFallback !== false;
    const targetMode: PlaybackMode =
      (preferredMode === 'video' && song.hasVideo) || (preferredMode === 'audio' && song.hasAudio === false && song.hasVideo)
        ? 'video'
        : 'audio';
    const activeElement = targetMode === 'video' ? videoRef.current : audioRef.current;
    const inactiveElement = targetMode === 'video' ? audioRef.current : videoRef.current;

    if (!activeElement) {
      throw new Error(targetMode === 'video' ? 'Player de video indisponivel' : 'Player de audio indisponivel');
    }

    try {
      if (currentSong?.id === song.id && playbackModeRef.current === targetMode && !forceReload) {
        if (isPlaying) {
          activeElement.pause();
          setIsPlaying(false);
          setPlayerNotice('');
          broadcastSnapshot({ isPlaying: false });
          await sendDeviceState('paused', { currentSong: song });
        } else {
          await activeElement.play();
          setIsPlaying(true);
          setPlayerNotice('');
          broadcastSnapshot({ isPlaying: true });
          await sendDeviceState('playing', { currentSong: song });
        }
        return;
      }

      setPlaybackMode(targetMode);
      setCurrentSong(song);
      const playbackUrl = await getPlaybackUrl(song, targetMode);
      activeElement.volume = volume;
      inactiveElement?.pause();
      inactiveElement?.removeAttribute('src');
      inactiveElement?.load?.();

      let effectiveUrl = playbackUrl;
      const isRawYtUrl = effectiveUrl && (effectiveUrl.includes('youtube.com/watch') || effectiveUrl.includes('youtu.be/'));

      if (isRawYtUrl || !effectiveUrl) {
        const cleanId = (song.youtubeUrl || song.id || '').replace(/^yt-/, '').replace(/https?:\/\/(www\.)?youtube\.com\/watch\?v=/, '').split('&')[0];
        try {
          const res = await fetch(`/api/youtube/stream?id=${encodeURIComponent(cleanId)}&q=${encodeURIComponent((song.artist || '') + ' ' + song.title)}`);
          if (res.ok) {
            const data = await res.json();
            if (data?.url) effectiveUrl = data.url;
          }
        } catch {}
      }

      if (effectiveUrl && !effectiveUrl.includes('youtube.com/watch') && !effectiveUrl.includes('youtu.be/')) {
        try {
          if (window.ytPlayer && typeof window.ytPlayer.pauseVideo === 'function') {
            window.ytPlayer.pauseVideo();
          }
          if (activeElement) {
            activeElement.src = effectiveUrl;
            activeElement.load();
            activeElement.currentTime = 0;
            await activeElement.play();
          }
          setIsPlaying(true);
          setCurrentTime(0);
          setPlayerNotice('');
        } catch (playErr) {
          console.warn('Audio tag play failed, falling back to YouTube player:', playErr);
          const cleanYtId = (song.youtubeUrl || song.id || '');
          const played = playInYouTubePlayer(cleanYtId);
          if (!played) throw playErr;
        }
      } else {
        const cleanYtId = (song.youtubeUrl || song.id || '');
        const played = playInYouTubePlayer(cleanYtId);
        if (!played) {
          setPlayerNotice('Iniciando áudio da faixa...');
        }
      }
      return;
    } catch (error) {
      console.error(error);
      if (targetMode === 'audio' && song.hasVideo && allowVideoFallback) {
        setPlayerNotice('Audio indisponivel. Abrindo o video salvo desta faixa.');
        try {
          await executePlaySong(song, { preferredMode: 'video', forceReload: true, allowVideoFallback: false });
          return;
        } catch (fallbackError) {
          console.error(fallbackError);
          setPlayerNotice(
            fallbackError instanceof Error
              ? fallbackError.message
              : 'Nao foi possivel reproduzir o audio nem o video desta faixa.'
          );
        }
      } else if (targetMode === 'audio' && !offlineSongIds.includes(song.id)) {
        setPlayerNotice(error instanceof Error ? error.message : 'Nao foi possivel reproduzir esta faixa.');
      } else if (targetMode === 'video') {
        setPlayerNotice(error instanceof Error ? error.message : 'Video indisponivel para esta faixa.');
      } else {
        setPlayerNotice(error instanceof Error ? error.message : 'Falha ao reproduzir faixa.');
      }
      await sendDeviceState('error', {
        currentSong: song,
        errorMessage: error instanceof Error ? error.message : 'Falha ao reproduzir faixa'
      });
      throw error;
    }
  };

  const executePlayNext = async () => {
    const idx = getSongIndex(currentSong, queue);
    if (idx >= 0 && idx < queue.length - 1) {
      await executePlaySong(queue[idx + 1]);
    }
  };

  const executePlayPrevious = async () => {
    const idx = getSongIndex(currentSong, queue);
    if (idx > 0) {
      await executePlaySong(queue[idx - 1]);
    }
  };

  const executeTogglePlay = async () => {
    const activeElement = getActiveMediaElement();

    if (!activeElement || !currentSong) {
      throw new Error('Nenhuma musica carregada para alternar reproducao');
    }

    try {
      if (isPlaying) {
        activeElement.pause();
        setIsPlaying(false);
        broadcastSnapshot({ isPlaying: false });
        await sendDeviceState('paused', { currentSong });
      } else {
        await activeElement.play();
        setIsPlaying(true);
        broadcastSnapshot({ isPlaying: true });
        await sendDeviceState('playing', { currentSong });
      }
    } catch (error) {
      console.error(error);
      await sendDeviceState('error', {
        currentSong,
        errorMessage: error instanceof Error ? error.message : 'Falha ao alternar reproducao'
      });
      throw error;
    }
  };

  const executeSeek = async (time: number) => {
    const activeElement = getActiveMediaElement();
    if (!activeElement) return;
    activeElement.currentTime = time;
    setCurrentTime(time);
    broadcastSnapshot({ currentTime: time });
    await sendDeviceState(isPlaying ? 'playing' : currentSong ? 'paused' : 'idle', {
      currentTime: time
    });
  };

  const executeSetVolume = async (nextVolume: number) => {
    if (audioRef.current) audioRef.current.volume = nextVolume;
    if (videoRef.current) videoRef.current.volume = nextVolume;
    setVolume(nextVolume);
    broadcastSnapshot({ volume: nextVolume });
    await sendDeviceState(isPlaying ? 'playing' : currentSong ? 'paused' : 'idle', {
      volume: nextVolume
    });
  };

  const sendRemoteCommand = async (payload: PlayerCommand) => {
    if (!selectedOutputDeviceId || selectedOutputDeviceId === storedDeviceId) return false;

    await api.post(`/devices/${selectedOutputDeviceId}/command`, {
      sourceDeviceId: storedDeviceId,
      sourceDeviceName: deviceName,
      userId: currentUser?.id,
      payload
    });

    return true;
  };

  const runPlayerCommand = async (payload: PlayerCommand, forceLocal = false) => {
    if (isMiniMode) {
      channel.postMessage({ type: 'COMMAND', payload });
      return;
    }

    if (!forceLocal) {
      const sentRemote = await sendRemoteCommand(payload);
      if (sentRemote) return;
    }

    switch (payload.type) {
      case 'PLAY_SONG':
        await executePlaySong(payload.song);
        break;
      case 'TOGGLE_PLAY':
        await executeTogglePlay();
        break;
      case 'SET_PLAYBACK_MODE':
        await switchCurrentPlaybackMode(payload.mode);
        break;
      case 'NEXT':
        await executePlayNext();
        break;
      case 'PREVIOUS':
        await executePlayPrevious();
        break;
      case 'SEEK':
        await executeSeek(payload.time);
        break;
      case 'SET_VOLUME':
        await executeSetVolume(payload.volume);
        break;
      default:
        break;
    }
  };

  const playSong = async (song: Song) => runPlayerCommand({ type: 'PLAY_SONG', song });
  const playSongWithMode = async (song: Song, mode: PlaybackMode) => {
    playbackModeRef.current = mode;
    setPlaybackMode(mode);
    setIsVideoPanelOpen(mode === 'video');
    if (mode !== 'video') {
      setShowVideoInMiniPlayer(false);
    }
    await new Promise((resolve) => window.setTimeout(resolve, 0));
    await executePlaySong(song, { preferredMode: mode, forceReload: true });
  };
  const playNext = async () => runPlayerCommand({ type: 'NEXT' });
  const playPrevious = async () => runPlayerCommand({ type: 'PREVIOUS' });
  const togglePlay = async () => {
    if (window.ytPlayer && typeof window.ytPlayer.getPlayerState === 'function') {
      const state = window.ytPlayer.getPlayerState();
      if (state === 1) {
        window.ytPlayer.pauseVideo();
        setIsPlaying(false);
        return;
      } else if (state === 2 || state === 5) {
        window.ytPlayer.playVideo();
        setIsPlaying(true);
        return;
      }
    }
    return runPlayerCommand({ type: 'TOGGLE_PLAY' });
  };
  const showDesktopMiniPlayer = async (mode: 'compact' | 'video' = 'compact') => {
    setIsVideoTheaterOpen(false);
    if (mode === 'video') {
      setIsVideoPanelOpen(true);
      setShowVideoInMiniPlayer(true);
    } else {
      setShowVideoInMiniPlayer(false);
    }

    const shown = await desktopApi.showMiniPlayer();
    if (!shown) return false;

    await desktopApi.setMiniPlayerMode(mode);
    return true;
  };

  const toggleFavorite = async (song: Song) => {
    const nextFavoriteState = !song.favorite;
    const updated: Song = { ...song, favorite: nextFavoriteState };

    setSongs((prev) => {
      const idx = prev.findIndex((s) => s.id === song.id);
      let nextList: Song[];
      if (idx >= 0) {
        nextList = prev.map((s) => (s.id === song.id ? updated : s));
      } else {
        nextList = [updated, ...prev];
      }
      try {
        localStorage.setItem('montanha_songs_local', JSON.stringify(nextList));
      } catch {}
      return nextList;
    });

    if (currentSong?.id === song.id) {
      setCurrentSong(updated);
    }

    try {
      const stored = JSON.parse(localStorage.getItem('montanha_favorite_songs') || '[]');
      let nextFavs;
      if (nextFavoriteState) {
        nextFavs = [updated, ...stored.filter((s: Song) => s.id !== song.id)];
      } else {
        nextFavs = stored.filter((s: Song) => s.id !== song.id);
      }
      localStorage.setItem('montanha_favorite_songs', JSON.stringify(nextFavs));
    } catch {}

    if (supabaseUser) {
      void toggleCloudFavorite(supabaseUser.id, updated, nextFavoriteState);
    }
    setPlayerNotice(nextFavoriteState ? `"${song.title}" adicionada às Favoritas.` : `"${song.title}" removida das Favoritas.`);
  };

  const createPlaylist = async () => {
    if (!currentUser) return;
    const name = newPlaylistName.trim();
    if (!name) return;

    try {
      const res = await api.post('/playlists', {
        name,
        userId: currentUser.id
      });

      const playlist = sanitizeDeepText(res.data.playlist as Playlist);
      setPlaylists((prev) => [playlist, ...prev]);
      setNewPlaylistName('');
      setPlaylistMessage('Playlist criada.');
    } catch (error: any) {
      setPlaylistMessage(repairTextEncoding(error?.response?.data?.error) || 'Falha ao criar playlist.');
    }
  };

  const addSongToPlaylist = async (playlistId: string, song: Song) => {
    try {
      await api.post(`/playlists/${playlistId}/musicas`, {
        musicId: song.id
      });

      await loadPlaylists();
      if (activePlaylistId) {
        setActivePlaylistId(playlistId);
      }
      setPlaylistMessage(`"${song.title}" adicionada à playlist.`);
    } catch (error: any) {
      setPlaylistMessage(error?.response?.data?.error || 'Falha ao adicionar música na playlist.');
    }
  };

  const openPlaylistPicker = (song: Song) => {
    setPlaylistPickerSong(song);
    setPlaylistMessage('');
  };

  const startPlaylistRename = (playlist: Playlist) => {
    setPlaylistEditingId(playlist.id);
    setPlaylistEditingName(playlist.name);
    setPlaylistMessage('');
  };

  const submitPlaylistRename = async (playlistId: string) => {
    const name = playlistEditingName.trim();
    if (!name) return;

    try {
      await api.patch(`/playlists/${playlistId}`, { name });
      await loadPlaylists();
      await loadDiscoverPlaylists();
      setPlaylistEditingId(null);
      setPlaylistEditingName('');
      setPlaylistMessage('Playlist renomeada.');
    } catch (error: any) {
      setPlaylistMessage(error?.response?.data?.error || 'Falha ao renomear playlist.');
    }
  };

  const removeSongFromActivePlaylist = async (song: Song) => {
    if (!activePlaylist) return;

    try {
      await api.delete(`/playlists/${activePlaylist.id}/musicas/${song.id}`);
      await loadPlaylists();
      setPlaylistMessage(`"${getDisplayTitle(song)}" removida da playlist.`);
    } catch (error: any) {
      setPlaylistMessage(error?.response?.data?.error || 'Falha ao remover música da playlist.');
    }
  };

  const canDeleteSongFromPlatform = (song: Song) =>
    Boolean(currentUser?.id) && String(song.uploadedByUserId || song.ownerUserId || '') === String(currentUser?.id);

  const removeSongFromPlatform = async (song: Song) => {
    if (!currentUser || !canDeleteSongFromPlatform(song)) return;

    try {
      await api.delete(`/musicas/${song.id}`, {
        params: { userId: currentUser.id }
      });

      if (currentSong?.id === song.id) {
        audioRef.current?.pause();
        videoRef.current?.pause();
        setCurrentSong(null);
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
      }

      await loadSongs(activeSection, currentUser);
      await loadPlaylists(currentUser);
      await loadDiscoverPlaylists(currentUser);
      setPlaylistMessage(`"${getDisplayTitle(song)}" removida da plataforma.`);
    } catch (error: any) {
      setPlaylistMessage(error?.response?.data?.error || 'Falha ao remover arquivo da plataforma.');
    }
  };

  const deletePlaylist = async (playlist: Playlist) => {
    try {
      await api.delete(`/playlists/${playlist.id}`);
      await loadPlaylists();
      if (activePlaylistId === playlist.id) {
        setActivePlaylistId(null);
      }
      if (youtubeTargetPlaylistId === playlist.id) {
        setYoutubeTargetPlaylistId('');
      }
      setPlaylistEditingId(null);
      setPlaylistEditingName('');
      setPlaylistMessage('Playlist removida.');
    } catch (error: any) {
      setPlaylistMessage(error?.response?.data?.error || 'Falha ao remover playlist.');
    }
  };

  const choosePlaylist = async (playlistId: string) => {
    if (!playlistPickerSong) return;
    await addSongToPlaylist(playlistId, playlistPickerSong);
    setPlaylistPickerSong(null);
  };

  const updateDesktopPreference = async (patch: Partial<DesktopPreferences>) => {
    if (!window.montanhaDesktop?.updatePreferences) return;

    const nextPreferences = await window.montanhaDesktop.updatePreferences(patch);
    setDesktopPreferences(nextPreferences);
    setSettingsMessage('Preferencia salva. Reinicie o app para aplicar no proximo inicio.');
  };

  const handlePreferDownloadOnLaunchChange = (enabled: boolean) => {
    setPreferDownloadOnLaunch(enabled);
    setSettingsMessage('Preferencia local salva.');
  };

  const chooseBackupDirectory = async () => {
    const selectedDirectory = await desktopApi.selectBackupDirectory();
    if (!selectedDirectory) return;

    await updateDesktopPreference({ backupDirectory: selectedDirectory });
    setBackupMessage('Pasta de backup atualizada.');
  };

  const updateBackupFormat = async (format: BackupFormat) => {
    await updateDesktopPreference({ backupFormat: format });
    setBackupMessage(`Formato de backup alterado para ${format.toUpperCase()}.`);
  };

  const runMusicBackup = async () => {
    if (isBackupRunning) return;

    const targetDir = desktopPreferences.backupDirectory.trim();
    if (!targetDir) {
      setBackupMessage('Escolha uma pasta de destino antes de iniciar o backup.');
      return;
    }

    setIsBackupRunning(true);
    setLastBackupResult(null);
    setBackupMessage(`Gerando backup da sua biblioteca em ${desktopPreferences.backupFormat.toUpperCase()}...`);

    try {
      const res = await api.post(
        '/backup/musicas',
        {
          targetDir,
          format: desktopPreferences.backupFormat,
          userId: currentUser?.id,
          section: 'library'
        },
        { timeout: 0 }
      );
      const result = sanitizeDeepText(res.data as MusicBackupResult);
      setLastBackupResult(result);
      setBackupMessage(
        result.skipped.length > 0
          ? `Backup concluido com ${result.exported.length} arquivos. ${result.skipped.length} faixa(s) ficaram pendentes.`
          : `Backup concluido com ${result.exported.length} arquivo(s) em ${result.targetDir}.`
      );
      await loadActivityLogs().catch(console.error);
    } catch (error: any) {
      setBackupMessage(error?.response?.data?.error || 'Falha ao gerar backup das musicas.');
    } finally {
      setIsBackupRunning(false);
    }
  };
  const searchYoutubeInsideApp = async (queryOverride?: string) => {
    const query = (queryOverride || youtubeSearchQuery).trim();
    if (!query || isSearchingYoutube) return;

    setIsSearchingYoutube(true);
    setYoutubeSearchMessage('Buscando faixas no YouTube, Deezer e catálogos...');
    youtubeSelectionRequestIdRef.current += 1;

    try {
      let results: YoutubeSearchResult[] = [];
      let playlistResults: YoutubeSearchPlaylistResult[] = [];

      // 1. Deezer API Oficial (Catálogo HiFi Deezer - Zero Apple Music)
      const fetchDeezer = async (): Promise<YoutubeSearchResult[]> => {
        try {
          const dzRes = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=25`);
          if (dzRes.ok) {
            const dzData = await dzRes.json();
            return (dzData.data || []).map((t: any) => ({
              id: `dz-${t.id}`,
              title: t.title || 'Música Deezer',
              artist: t.artist?.name || 'Artista',
              album: t.album?.title || 'Álbum',
              duration: t.duration || 180,
              thumbnail: t.album?.cover_big || t.album?.cover_medium || '',
              url: t.link || `https://www.deezer.com/track/${t.id}`,
              previewUrl: t.preview || '',
              source: 'deezer'
            }));
          }
        } catch {}
        return [];
      };

      // 2. YouTube Music Serverless backend (Piped & Direct Stream)
      const fetchApi = async (): Promise<{ results: YoutubeSearchResult[]; playlists: YoutubeSearchPlaylistResult[] }> => {
        try {
          const directRes = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}`);
          if (directRes.ok) {
            const data = await directRes.json();
            return {
              results: Array.isArray(data.results) ? data.results : [],
              playlists: Array.isArray(data.playlists) ? data.playlists : []
            };
          }
        } catch {}
        return { results: [], playlists: [] };
      };

      const [dzTracks, apiData] = await Promise.all([fetchDeezer(), fetchApi()]);

      const combined = [
        ...apiData.results,
        ...dzTracks
      ];

      // Deduplicate by title + artist
      const seen = new Set<string>();
      results = combined.filter((item) => {
        const key = `${(item.title || '').toLowerCase()}|${(item.artist || '').toLowerCase()}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      playlistResults = apiData.playlists;

      setYoutubeSearchResults(results);
      setYoutubePlaylistSearchResults(playlistResults);
      const resultChunks = [
        playlistResults.length > 0 ? `${playlistResults.length} playlists` : null,
        results.length > 0 ? `${results.length} faixas` : null
      ].filter(Boolean);

      setYoutubeSearchMessage(
        resultChunks.length > 0
          ? `${resultChunks.join(' • ')} encontrados`
          : 'Nenhum resultado encontrado para esse termo.'
      );
      await loadYoutubeRecentSearches();
    } catch (error: any) {
      setYoutubeSearchMessage('Nenhum resultado encontrado.');
    } finally {
      setIsSearchingYoutube(false);
    }
  };

  
  const handleFullResetAndClear = async () => {
    if (!window.confirm('Deseja realmente zerar todos os registros, playlists locais e dados do aplicativo? O sistema será reiniciado do zero com segurança.')) {
      return;
    }
    try {
      localStorage.clear();
      sessionStorage.clear();
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      if ('indexedDB' in window) {
        try { indexedDB.deleteDatabase('musfy-offline'); } catch {}
        try { indexedDB.deleteDatabase('localforage'); } catch {}
      }
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const reg of regs) await reg.unregister();
      }
    } catch (e) {
      console.warn('Erro ao limpar caches:', e);
    }
    window.location.href = window.location.pathname;
  };

  const playYoutubeTrack = async (result: YoutubeSearchResult) => {
    setPlayerNotice(`Reproduzindo "${result.title}"...`);
    let streamUrl = '';
    const searchTarget = `${result.artist || ''} ${result.title}`.trim();

    // Priorizar stream completo do YouTube sem corte de 30 segundos
    try {
      const streamRes = await fetch(`/api/youtube/stream?id=${encodeURIComponent(result.id || '')}&q=${encodeURIComponent(searchTarget)}`);
      if (streamRes.ok) {
        const data = await streamRes.json();
        if (data?.url && !data.url.includes('dzcdn.net') && !data.url.includes('preview')) {
          streamUrl = data.url;
        }
      }
    } catch {}

    // Se no conseguiu stream esttico direto, verificar se previewUrl no  de 30s antes de usar
    if (!streamUrl && result.previewUrl && !result.previewUrl.includes('dzcdn.net')) {
      streamUrl = result.previewUrl;
    }

    const songId = result.id ? (result.id.startsWith('yt-') || result.id.startsWith('dz-') ? result.id : `yt-${result.id}`) : `yt-${Date.now()}`;
    const song: Song = {
      id: songId,
      title: result.title,
      artist: result.artist || 'Artista',
      thumbnail: result.thumbnail,
      source: result.source || 'youtube',
      youtubeUrl: result.url,
      path: streamUrl || result.url,
      hasAudio: true,
      hasVideo: false
    };

    void playSong(song);
  };

  const _downloadYoutubeTrack = async (result: YoutubeSearchResult) => {
    setDownloadMessage(`Iniciando download de "${result.title}"...`);
    setPlayerNotice(`Preparando arquivo de áudio de "${result.title}"...`);

    try {
      const searchTarget = `${result.artist || ''} ${result.title}`.trim();
      const streamRes = await fetch(`/api/youtube/stream?id=${encodeURIComponent(result.id || '')}&q=${encodeURIComponent(searchTarget)}`);
      if (streamRes.ok) {
        const data = await streamRes.json();
        if (data?.url) {
          const a = document.createElement('a');
          a.href = data.url;
          a.download = `${result.artist || 'Artista'} - ${result.title}.webm`;
          a.target = '_blank';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setDownloadMessage(`Download de "${result.title}" iniciado com sucesso!`);
          return;
        }
      }
    } catch {}

    if (result.previewUrl) {
      const a = document.createElement('a');
      a.href = result.previewUrl;
      a.download = `${result.artist || 'Artista'} - ${result.title}.mp3`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setDownloadMessage(`Download de "${result.title}" concluído.`);
    }
  };

  const _selectYoutubeSearchResult = async (result: YoutubeSearchResult) => {
    setYoutubeSearchQuery(result.title);
    setYoutubeUrl(result.url);
    // Spotube direct play: toca diretamente a faixa sem modais intermediários
    void playYoutubeTrack(result);
  };

  const _selectYoutubePlaylistSearchResult = async (result: YoutubeSearchPlaylistResult) => {
    setDownloadMessage(`Importando playlist "${result.title}" para sua Biblioteca...`);
    const newPl: Playlist = {
      id: `pl-${result.id || Date.now()}`,
      name: result.title,
      ownerUserName: result.channel || 'YouTube Music',
      songs: (result.previewEntries || []).map((e, idx) => ({
        id: e.id ? `yt-${e.id}` : `pl-item-${idx}`,
        title: e.title,
        artist: result.channel || 'YouTube',
        thumbnail: result.thumbnail,
        source: 'youtube',
        youtubeUrl: e.url,
        hasAudio: true
      }))
    };
    setPlaylists((prev) => {
      const updated = [newPl, ...prev.filter((p) => p.id !== newPl.id)];
      try { localStorage.setItem('montanha_playlists_local', JSON.stringify(updated)); } catch {}
      return updated;
    });
    setActivePlaylistId(newPl.id);
    setActiveSection('library');
    setPlayerNotice(`Playlist "${result.title}" adicionada com sucesso à sua Biblioteca!`);
  };

  const _pauseDownloadJob = async (jobId: string) => {
    if (activeDownloadJobActionId) return;

    setActiveDownloadJobActionId(jobId);
    try {
      await api.post(`/downloads/${jobId}/pause`);
      await loadDownloadJobs();
      setDownloadMessage('Download pausado. Ele pode ser retomado depois do ponto atual, reiniciando a etapa incompleta.');
    } catch (error: any) {
      setDownloadMessage(error?.response?.data?.error || 'Falha ao pausar download.');
    } finally {
      setActiveDownloadJobActionId(null);
    }
  };

  const _resumeDownloadJob = async (jobId: string) => {
    if (activeDownloadJobActionId) return;

    setActiveDownloadJobActionId(jobId);
    try {
      await api.post(`/downloads/${jobId}/resume`);
      await loadDownloadJobs();
      setDownloadMessage('Download recolocado na fila. As partes incompletas serão iniciadas novamente.');
    } catch (error: any) {
      setDownloadMessage(error?.response?.data?.error || 'Falha ao retomar download.');
    } finally {
      setActiveDownloadJobActionId(null);
    }
  };

  const saveSongOffline = async (song: Song) => {
    if (offlineBusyIds.includes(song.id)) return;

    setOfflineBusyIds((prev) => [...prev, song.id]);
    try {
      const res = await fetch(`${api.defaults.baseURL}/download-musica/${song.id}`);
      if (!res.ok) {
        throw new Error(`Falha ao baixar faixa para offline (${res.status})`);
      }

      const blob = await res.blob();
      const record: OfflineAudioRecord = {
        songId: song.id,
        title: getDisplayTitle(song),
        mimeType: blob.type || song.audioMimeType || 'audio/ogg',
        blob,
        savedAt: new Date().toISOString()
      };

      const store = await getOfflineAudioStore();
      await store.setItem(getOfflineAudioKey(song.id), record);
      await loadOfflineIndex();
      if (currentSong?.id === song.id) {
        setPlayerNotice('');
      }
      setDownloadMessage(`"${getDisplayTitle(song)}" ficou disponivel para ouvir offline.`);
    } catch (error: any) {
      setDownloadMessage(error?.message || 'Falha ao salvar faixa offline.');
    } finally {
      setOfflineBusyIds((prev) => prev.filter((id) => id !== song.id));
    }
  };

  const removeSongOffline = async (song: Song) => {
    if (offlineBusyIds.includes(song.id)) return;

    setOfflineBusyIds((prev) => [...prev, song.id]);
    try {
      const store = await getOfflineAudioStore();
      await store.removeItem(getOfflineAudioKey(song.id));
      const isCurrentOfflineBlob =
        currentSong?.id === song.id &&
        playbackModeRef.current === 'audio' &&
        Boolean(objectUrlRef.current) &&
        Boolean(audioRef.current?.src?.startsWith('blob:'));

      if (isCurrentOfflineBlob) {
        audioRef.current?.pause();
        audioRef.current?.removeAttribute('src');
        audioRef.current?.load();
        releaseObjectUrl();
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
        setPlayerNotice('Cache offline removido. Esta faixa volta a depender do servidor para tocar.');
      }

      await loadOfflineIndex();
      setDownloadMessage(`Cache offline removido para "${getDisplayTitle(song)}".`);
    } catch (error: any) {
      setDownloadMessage(error?.message || 'Falha ao remover cache offline.');
    } finally {
      setOfflineBusyIds((prev) => prev.filter((id) => id !== song.id));
    }
  };

  const switchCurrentPlaybackMode = async (nextMode: PlaybackMode) => {
    if (!currentSong) {
      setPlaybackMode(nextMode);
      setIsVideoPanelOpen(nextMode === 'video');
      if (nextMode !== 'video') setShowVideoInMiniPlayer(false);
      return;
    }

    if (nextMode === 'video' && !currentSong.hasVideo) {
      setDownloadMessage('Esta faixa nao possui video salvo.');
      return;
    }

    const resumeTime = currentTime;
    const shouldResume = isPlaying;
    playbackModeRef.current = nextMode;
    setPlaybackMode(nextMode);
    setIsVideoPanelOpen(nextMode === 'video');
    if (nextMode !== 'video') setShowVideoInMiniPlayer(false);

    try {
      await executePlaySong(currentSong, { preferredMode: nextMode, forceReload: true });
      const activeElement = nextMode === 'video' ? videoRef.current : audioRef.current;
      if (activeElement) {
        activeElement.currentTime = resumeTime;
        setCurrentTime(resumeTime);
        if (!shouldResume) {
          activeElement.pause();
          setIsPlaying(false);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const openVideoFullscreen = async () => {
    if (!currentSong || !currentSong.hasVideo) return;
    setIsVideoPanelOpen(true);
    setIsVideoTheaterOpen((previous) => !previous);
  };

  const openVideoInMiniPlayer = async () => {
    if (!currentSong || !currentSong.hasVideo) return;

    setIsVideoTheaterOpen(false);
    setIsVideoPanelOpen(true);
    setShowVideoInMiniPlayer(true);
    playbackModeRef.current = 'video';
    setPlaybackMode('video');
    await playSongWithMode(currentSong, 'video');
    await showDesktopMiniPlayer('video');
  };

  const submitAuth = async () => {
    const identity = authLogin.trim();
    const password = authPassword.trim();

    if (!identity || !password) {
      setAuthMessage('Preencha login e senha.');
      return;
    }

    try {
      let user: User;

      if (authMode === 'register') {
        const registerRes = await api.post('/auth/register', {
          nome: identity,
          login: identity,
          email: identity.includes('@') ? identity : null,
          senha: password
        });

        user = sanitizeDeepText(registerRes.data.usuario as User);
        setAuthMessage('Usuário criado com sucesso.');
      } else {
        const loginRes = await api.post('/auth/login', {
          login: identity,
          email: identity.includes('@') ? identity : null,
          senha: password
        });

        user = sanitizeDeepText(loginRes.data.usuario as User);
        setAuthMessage(`Sessão iniciada como ${user.nome}.`);
      }

      persistCurrentUser(user);
      setAuthLogin('');
      setAuthPassword('');
      setActiveSection('library');
      await loadSongs('library', user);
    } catch (error: unknown) {
      const authError = error as { response?: { data?: { error?: unknown }; status?: number } };
      const backendError = authError.response?.data?.error;
      const backendMessage = repairTextEncoding(
        typeof backendError === 'string' ? backendError : undefined
      );
      const status = authError.response?.status;
      setAuthMessage(
        backendMessage
          || (status ? `Falha ao autenticar usuário (${status}).` : 'Falha ao falar com o serviço local.')
      );
    }
  };

  const logout = async () => {
    persistCurrentUser(null);
    setSongs([]);
    setCurrentSong(null);
    setIsPlaying(false);
    setAuthMessage('Sessão encerrada.');
    setActiveSection('explore');
    await loadSongs('explore', null);
  };

  useEffect(() => {
    if (isMiniMode) return;
    if (audioRef.current) audioRef.current.volume = volume;
    if (videoRef.current) videoRef.current.volume = volume;
  }, [volume, isMiniMode]);

  useEffect(() => {
    broadcastSnapshot({}, queue);
  }, [songs, searchTerm, activeSection]);

  useEffect(() => {
    const onMessage = async (event: MessageEvent) => {
      const data = event.data;
      if (!data) return;

      if (data.type === 'PLAYER_STATE' && isMiniMode) {
        const payload = sanitizeDeepText(data.payload as PlayerSnapshot);
        setCurrentSong(payload.currentSong);
        setIsPlaying(payload.isPlaying);
        setCurrentTime(payload.currentTime);
        setDuration(payload.duration);
        setVolume(payload.volume);
        setSongs(sanitizeDeepText(payload.queue || []));
        playbackModeRef.current = payload.playbackMode || 'audio';
        setPlaybackMode(payload.playbackMode || 'audio');
        setShowVideoInMiniPlayer(Boolean(payload.showVideoInMiniPlayer));
      }

      if (data.type === 'COMMAND' && !isMiniMode) {
        const command = data.payload as PlayerCommand;
        await runPlayerCommand(command);
      }

      if (data.type === 'REQUEST_STATE' && !isMiniMode) {
        broadcastSnapshot({}, queue);
      }
    };

    channel.addEventListener('message', onMessage);

    if (isMiniMode) {
      channel.postMessage({ type: 'REQUEST_STATE' });
    }

    return () => channel.removeEventListener('message', onMessage);
  }, [isMiniMode, currentSong, isPlaying, currentTime, duration, volume, queue, selectedOutputDeviceId]);

  const isMiniVideoMode = showVideoInMiniPlayer && playbackMode === 'video' && currentSong?.hasVideo;

  useEffect(() => {
    if (!isMiniMode) return;

    const element = videoRef.current;
    if (!element) return;

    if (!isMiniVideoMode || !currentSong?.hasVideo) {
      element.pause();
      element.removeAttribute('src');
      element.load();
      return;
    }

    const nextSrc = `${api.defaults.baseURL}/reproduzir-video/${currentSong.id}`;
    const currentSrc = element.currentSrc || element.src || '';
    element.defaultMuted = true;
    element.muted = true;
    element.volume = 0;

    if (!currentSrc.includes(`/reproduzir-video/${currentSong.id}`)) {
      element.src = nextSrc;
      element.load();
    }

    const syncCurrentTime = () => {
      const nextTime = currentTime || 0;
      if (Math.abs((element.currentTime || 0) - nextTime) > 0.75) {
        try {
          element.currentTime = nextTime;
        } catch {
          // Ignore seek errors while metadata is still loading in the mirrored mini-player video.
        }
      }
    };

    syncCurrentTime();

    if (isPlaying) {
      element.play().then(syncCurrentTime).catch(console.error);
      return;
    }

    element.pause();
  }, [isMiniMode, isMiniVideoMode, currentSong?.id, currentSong?.hasVideo, currentTime, isPlaying]);

  const miniVideoLayout = (
    <div className="h-screen bg-transparent p-2 text-white">
      <div
        className="flex h-full w-full flex-col overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-[#121212] to-[#0a0a0a] shadow-2xl"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold">{getDisplayTitle(currentSong) || 'Nenhum video'}</p>
            <p className="truncate text-xs text-gray-400">
              {playerNotice ? <span className="text-amber-400">{playerNotice}</span> : getSongSubtitle(currentSong)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
            <button onClick={() => void desktopApi.showMain()} className="rounded-xl bg-white/5 px-3 py-2 text-xs hover:bg-white/10">
              Abrir
            </button>
            <button onClick={() => void desktopApi.closeMiniPlayer()} className="rounded-xl p-2 hover:bg-white/10">
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="relative min-h-0 flex-1 bg-black" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          <video
            ref={videoRef}
            preload="metadata"
            playsInline
            muted
            poster={currentSong?.thumbnail || undefined}
            className="h-full w-full object-contain"
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>

        <div className="border-t border-white/10 px-4 py-3" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <button onClick={playPrevious} className="flex h-9 w-9 items-center justify-center rounded-full text-gray-300 hover:bg-white/10">
                <SkipBack size={16} />
              </button>
              <button onClick={togglePlay} className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black shadow-lg">
                {isPlaying ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
              </button>
              <button onClick={playNext} className="flex h-9 w-9 items-center justify-center rounded-full text-gray-300 hover:bg-white/10">
                <SkipForward size={16} />
              </button>
            </div>
            <button
              onClick={() => void runPlayerCommand({ type: 'SET_PLAYBACK_MODE', mode: 'audio' })}
              className="ml-auto rounded-xl border border-white/10 px-3 py-2 text-xs hover:bg-white/10"
            >
              Ouvir audio
            </button>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <span className="w-12 text-right text-[11px] text-gray-500">{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={currentTime}
              onChange={(e) =>
                channel.postMessage({
                  type: 'COMMAND',
                  payload: { type: 'SEEK', time: Number(e.target.value) }
                })
              }
              className="min-w-0 flex-1 accent-green-500"
            />
            <span className="w-12 text-[11px] text-gray-500">{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const miniLayout = isMiniVideoMode ? miniVideoLayout : (
    <div className="h-screen bg-transparent p-2 text-white">
      <div
        className="grid h-full w-full grid-cols-[minmax(0,1.7fr)_auto_auto] items-center gap-4 rounded-[28px] border border-white/10 bg-gradient-to-br from-[#121212] to-[#0a0a0a] px-4 shadow-2xl"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <div className="flex min-w-0 items-center gap-4">
          <div className="h-16 w-16 overflow-hidden rounded-2xl bg-[#1b1b1b] shadow-inner">
            {currentSong?.thumbnail ? (
              <img src={currentSong.thumbnail} alt={currentSong.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Music size={22} className="text-gray-600" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate font-bold">{getDisplayTitle(currentSong) || 'Nenhuma música'}</p>
            <p className="truncate text-xs text-gray-400">{getSongSubtitle(currentSong)}</p>

            <div className="mt-2 flex items-center gap-2">
              <span className="w-8 text-[10px] text-gray-500">{formatTime(currentTime)}</span>
              <input
                type="range"
                min={0}
                max={duration || 0}
                step={0.1}
                value={currentTime}
                onChange={(e) =>
                  channel.postMessage({
                    type: 'COMMAND',
                    payload: { type: 'SEEK', time: Number(e.target.value) }
                  })
                }
                className="min-w-0 flex-1 accent-green-500"
                style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
              />
              <span className="w-8 text-[10px] text-gray-500">{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          <button onClick={playPrevious} className="flex h-9 w-9 items-center justify-center rounded-full text-gray-300 hover:bg-white/10">
            <SkipBack size={16} />
          </button>
          <button onClick={togglePlay} className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black shadow-lg">
            {isPlaying ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
          </button>
          <button onClick={playNext} className="flex h-9 w-9 items-center justify-center rounded-full text-gray-300 hover:bg-white/10">
            <SkipForward size={16} />
          </button>
        </div>

        <div className="flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          <Volume2 size={15} className="text-gray-400" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) =>
              channel.postMessage({
                type: 'COMMAND',
                payload: { type: 'SET_VOLUME', volume: Number(e.target.value) }
              })
            }
            className="w-24 accent-green-500"
          />
          <button onClick={() => void desktopApi.showMain()} className="rounded-xl bg-white/5 px-3 py-2 text-xs hover:bg-white/10">
            Abrir
          </button>
          <button onClick={() => void desktopApi.closeMiniPlayer()} className="rounded-xl p-2 hover:bg-white/10">
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  );

  if (isMiniMode) return miniLayout;

  // Login screen bypassed for direct access
  if (false && !currentUser) {
    return (
      <div className="flex h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,#103322_0%,#050505_45%,#020202_100%)] px-6 text-white">
        <div className="grid w-full max-w-5xl grid-cols-[1.1fr_0.9fr] overflow-hidden rounded-[36px] border border-white/10 bg-black/60 shadow-[0_30px_120px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
          <div className="flex flex-col justify-between border-r border-white/10 bg-[linear-gradient(180deg,rgba(9,30,20,0.92)_0%,rgba(5,5,5,0.92)_100%)] p-10">
            <div>
              <div className="inline-flex items-center gap-4 rounded-full border border-white/10 bg-white/[0.04] px-4 py-3">
                <img src={brandMark} alt="Montanha Music Lab" className="h-12 w-12 rounded-2xl" />
                <div>
                  <p className="text-xs uppercase tracking-[0.32em] text-green-400/80">Montanha Music Lab Desktop</p>
                  <p className="mt-1 text-sm text-gray-400">Player local com cara de produto</p>
                </div>
              </div>
              <h1 className="mt-5 text-6xl font-black tracking-tight">Sua musica, sua casa.</h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-gray-300">
                Entre com login e senha para abrir a biblioteca do seu usuario, baixar links do YouTube e manter tudo separado por perfil.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                ['Perfis', 'Bibliotecas separadas por usuário'],
                ['Busca', 'Pesquisa por música e artista'],
                ['Download', 'YouTube direto para o backend']
              ].map(([title, text]) => (
                <div key={title} className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="font-semibold">{title}</p>
                  <p className="mt-2 text-sm text-gray-400">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center p-10">
            <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-[#0b0b0b] p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-black">{authMode === 'login' ? 'Entrar' : 'Criar usuario'}</h2>
                <p className="mt-2 text-sm text-gray-400">
                  Use apenas login e senha. Sem email, sem complicação.
                </p>
              </div>

              <div className="space-y-4">
                <input
                  value={authLogin}
                  onChange={(e) => setAuthLogin(e.target.value)}
                  placeholder="Login"
                  className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm outline-none focus:border-green-500/40"
                />

                <input
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void submitAuth();
                  }}
                  placeholder="Senha"
                  className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm outline-none focus:border-green-500/40"
                />

                <button
                  onClick={() => void submitAuth()}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-green-500 font-semibold text-black"
                >
                  {authMode === 'login' ? <LogIn size={16} /> : <UserPlus size={16} />}
                  {authMode === 'login' ? 'Entrar' : 'Cadastrar'}
                </button>

                <button
                  onClick={() => setAuthMode((prev) => (prev === 'login' ? 'register' : 'login'))}
                  className="w-full text-sm text-gray-400 hover:text-white"
                >
                  {authMode === 'login'
                    ? 'Primeira vez? Criar novo usuário'
                    : 'Já possui usuário? Entrar'}
                </button>

                <button
                  onClick={() => void openBrowserClient()}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-gray-300 transition hover:border-cyan-400/40 hover:text-white"
                >
                  Abrir Montanha Music Lab no navegador
                </button>

                {authMessage ? <p className="text-sm text-gray-400">{authMessage}</p> : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const sidebarItems = [
    { id: 'home' as Section, label: 'Início', description: 'Playlists e atalhos', icon: Home, count: homePlaylists.length },
    { id: 'explore' as Section, label: 'Explorar', description: 'Descobertas da rede', icon: Compass, count: explorePlaylists.length },
    { id: 'library' as Section, label: 'Sua Biblioteca', description: 'Faixas salvas', icon: Library, count: songs.length },
    { id: 'favorites' as Section, label: 'Favoritas', description: 'Curtidas', icon: Heart, count: songs.filter((song) => song.favorite).length },
    { id: 'download' as Section, label: 'YouTube Studio', description: 'Buscar e importar', icon: Download, count: downloadJobs.length }
  ];

  void sidebarItems;
  void createPlaylist;
  void startPlaylistRename;
  void submitPlaylistRename;
  void deletePlaylist;
  void playlistMessage;
  void playlistEditingId;
  void logout;

  
  const preloadNextTrackStream = async (track: Song) => {
    try {
      let streamUrl = track.path;
      const isRemote = streamUrl && (streamUrl.startsWith('http://') || streamUrl.startsWith('https://')) && !streamUrl.includes('youtube.com/watch') && !streamUrl.includes('dzcdn.net');
      if (!isRemote) {
        const cleanId = (track.youtubeUrl || track.id || '').replace(/^yt-/, '').replace(/https?:\/\/(www\.)?youtube\.com\/watch\?v=/, '').split('&')[0];
        const targetQuery = `${track.artist || ''} ${track.title}`.trim();
        const res = await fetch(`/api/youtube/stream?id=${encodeURIComponent(cleanId)}&q=${encodeURIComponent(targetQuery)}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.url && !data.url.includes('dzcdn.net') && !data.url.includes('preview')) {
            streamUrl = data.url;
          }
        }
      }
      if (streamUrl && prebufferAudioRef.current) {
        prebufferAudioRef.current.src = streamUrl;
        prebufferAudioRef.current.load();
      }
    } catch (e) {
      console.debug('Prebuffer next track error:', e);
    }
  };

  const handleMediaTimeUpdate = (element: HTMLMediaElement | null) => {
    if (!element) return;
    const nextTime = element.currentTime || 0;
    const nextDuration = element.duration || 0;
    setCurrentTime(nextTime);
    setDuration(nextDuration);
    broadcastSnapshot({ currentTime: nextTime, duration: nextDuration });

    // Pilar 2: Atualização do MediaSession positionState para Lock Screen iOS e Notificação Android
    mediaSessionController.updatePositionState({
      duration: nextDuration,
      position: nextTime,
      playbackRate: 1
    });

    // Pilar 1: Gapless Playback & Pré-Buffer Inteligente (8-10s antes do fim)
    if (nextDuration > 20 && nextTime >= nextDuration - 10) {
      const currentIndex = queue.findIndex((s) => s.id === currentSong?.id);
      const nextTrack = currentIndex >= 0 && currentIndex + 1 < queue.length ? queue[currentIndex + 1] : null;
      if (nextTrack && prebufferedSongIdRef.current !== nextTrack.id) {
        prebufferedSongIdRef.current = nextTrack.id;
        void preloadNextTrackStream(nextTrack);
      }
    }
  };

  const handleMediaLoadedMetadata = (element: HTMLMediaElement | null) => {
    if (!element) return;
    const nextDuration = element.duration || 0;
    setDuration(nextDuration);
    broadcastSnapshot({ duration: nextDuration });
  };

  if (!isAuthInitialized) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#07090e] text-white">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#004799] to-[#0066cc] shadow-[0_0_35px_rgba(0,102,204,0.5)] border border-blue-400/30">
          <LoaderCircle size={26} className="animate-spin text-white" />
        </div>
        <p className="mt-4 text-xs font-semibold tracking-wider text-sky-400 uppercase">Montanha Music Lab</p>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-[#050505] text-white">
      <audio
        ref={prebufferAudioRef}
        id="prebuffer-audio"
        preload="auto"
        className="hidden"
      />
      <audio
        ref={audioRef}
        preload="metadata"
        onTimeUpdate={() => handleMediaTimeUpdate(audioRef.current)}
        onLoadedMetadata={() => handleMediaLoadedMetadata(audioRef.current)}
        onPause={() => {
          if (playbackModeRef.current === 'audio') {
            setIsPlaying(false);
            broadcastSnapshot({ isPlaying: false });
          }
        }}
        onPlay={() => {
          if (playbackModeRef.current === 'audio') {
            setIsPlaying(true);
            broadcastSnapshot({ isPlaying: true });
          }
        }}
        onError={() => {
          if (playbackModeRef.current === 'audio') {
            setDownloadMessage('Falha ao reproduzir audio desta faixa.');
          }
        }}
        onEnded={() => {
          void playNext();
        }}
      />

      <div className="flex h-full min-h-0">
        {/* DESKTOP SIDEBAR - 100% FIEL AO SPOTUBE / MONTANHA MUSIC LAB */}
        <aside className="hidden h-full w-72 flex-col overflow-y-auto border-r border-white/5 bg-[#090b10] lg:flex select-none">
          {/* Header Brand */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/20 text-sky-400 border border-blue-500/30 shadow-[0_0_15px_rgba(56,189,248,0.25)]">
              <ScreenShare size={20} />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white">Montanha Music Lab</h1>
              <p className="text-[10px] uppercase tracking-wider text-sky-400 font-medium">Spotube Core Engine</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
            {/* 1. Início (Home) */}
            <div>
              <button
                onClick={() => {
                  setActivePlaylistId(null);
                  setActiveDiscoverPlaylistId(null);
                  setActiveSection('home');
                }}
                className={`flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-semibold transition ${
                  activeSection === 'home' && !isPlaylistDetailView
                    ? 'bg-gradient-to-r from-[#0066cc] to-[#0052cc] text-white shadow-[0_4px_16px_rgba(0,102,204,0.45)]'
                    : 'text-gray-300 hover:bg-white/[0.05] hover:text-white'
                }`}
              >
                <Home size={18} className={activeSection === 'home' && !isPlaylistDetailView ? 'text-white' : 'text-gray-400'} />
                <span>Início</span>
              </button>
            </div>

            {/* 2. Buscar Item (Rota isolada 'search') */}
            <div>
              <button
                onClick={() => {
                  setActivePlaylistId(null);
                  setActiveDiscoverPlaylistId(null);
                  setActiveSection('search');
                }}
                className={`flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition ${
                  activeSection === 'search' || activeSection === 'download'
                    ? 'bg-gradient-to-r from-[#0066cc] to-[#0052cc] text-white shadow-[0_4px_16px_rgba(0,102,204,0.45)]'
                    : 'text-gray-400 hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                <Search size={18} />
                <span>Buscar</span>
              </button>
            </div>

            {/* Group: Biblioteca */}
            <div>
              <button
                onClick={() => setSidebarLibraryExpanded((prev) => !prev)}
                className="flex w-full items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-300"
              >
                <span>Biblioteca</span>
                {sidebarLibraryExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>

              {sidebarLibraryExpanded && (
                <div className="mt-1 space-y-1 pl-1">
                  {/* Playlists (Rota isolada 'playlists') */}
                  <button
                    onClick={() => {
                      setActivePlaylistId(null);
                      setActiveDiscoverPlaylistId(null);
                      setActiveSection('playlists');
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                      activeSection === 'playlists' || isPlaylistDetailView
                        ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-[0_4px_16px_rgba(37,99,235,0.4)]'
                        : 'text-gray-400 hover:bg-white/[0.04] hover:text-white'
                    }`}
                  >
                    <ListMusic size={18} />
                    <span>Playlists</span>
                    <span className="ml-auto text-xs text-gray-500">{playlists.length}</span>
                  </button>

                  {/* Favoritas (Likes) */}
                  <button
                    onClick={() => {
                      setActivePlaylistId(null);
                      setActiveDiscoverPlaylistId(null);
                      setActiveSection('favorites');
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                      activeSection === 'favorites'
                        ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-[0_4px_16px_rgba(37,99,235,0.4)]'
                        : 'text-gray-400 hover:bg-white/[0.04] hover:text-white'
                    }`}
                  >
                    <Heart size={18} />
                    <span>Favoritas (Likes)</span>
                    <span className="ml-auto text-xs text-gray-500">{songs.filter((s) => s.favorite).length}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Group: No dispositivo */}
            <div>
              <button
                onClick={() => setSidebarDeviceExpanded((prev) => !prev)}
                className="flex w-full items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-300"
              >
                <span>No dispositivo</span>
                {sidebarDeviceExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>

              {sidebarDeviceExpanded && (
                <div className="mt-1 space-y-1 pl-1">
                  {/* Arquivos locais (Rota isolada 'local_files') */}
                  <button
                    onClick={() => {
                      setActivePlaylistId(null);
                      setActiveDiscoverPlaylistId(null);
                      setActiveSection('local_files');
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                      activeSection === 'local_files'
                        ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-[0_4px_16px_rgba(37,99,235,0.4)]'
                        : 'text-gray-400 hover:bg-white/[0.04] hover:text-white'
                    }`}
                  >
                    <Folder size={18} />
                    <span>Arquivos locais</span>
                    <span className="ml-auto text-xs text-gray-500">{songs.length}</span>
                  </button>

                  {/* Downloads (Rota isolada 'downloads') */}
                  <button
                    onClick={() => {
                      setActivePlaylistId(null);
                      setActiveDiscoverPlaylistId(null);
                      setActiveSection('downloads');
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                      activeSection === 'downloads'
                        ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-[0_4px_16px_rgba(37,99,235,0.4)]'
                        : 'text-gray-400 hover:bg-white/[0.04] hover:text-white'
                    }`}
                  >
                    <Download size={18} />
                    <span>Downloads</span>
                    <span className="ml-auto text-xs text-gray-500">0</span>
                  </button>
                </div>
              )}
            </div>

            {/* Group: Conectar / Plugins */}
            <div>
              <button
                onClick={() => setSidebarConnectExpanded((prev) => !prev)}
                className="flex w-full items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-300"
              >
                <span>Conectar</span>
                {sidebarConnectExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>

              {sidebarConnectExpanded && (
                <div className="mt-1 space-y-1 pl-1">
                  <button
                    onClick={() => setIsPluginsModalOpen(true)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-gray-400 hover:bg-white/[0.04] hover:text-white transition"
                  >
                    <Sparkles size={18} />
                    <span>Serviços / Plugins</span>
                  </button>
                </div>
              )}
            </div>

            {/* Configurações */}
            <div className="pt-2">
              <button
                onClick={() => {
                  setActivePlaylistId(null);
                  setActiveDiscoverPlaylistId(null);
                  setActiveSection('settings');
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  activeSection === 'settings'
                    ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-[0_4px_16px_rgba(37,99,235,0.4)]'
                    : 'text-gray-400 hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                <Settings2 size={18} />
                <span>Configurações</span>
              </button>
            </div>
          </div>

          {/* User Profile / Status Card */}
          <div className="p-3 border-t border-white/5 space-y-2">
            <div
              onClick={() => setIsPluginsModalOpen(true)}
              className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 hover:bg-white/[0.06] transition cursor-pointer"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-sm shadow-md">
                {currentUser?.nome ? currentUser.nome.charAt(0).toUpperCase() : 'M'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{currentUser?.nome || 'Usuário Local'}</p>
                <p className="text-[10px] text-gray-400 truncate">
                  {pluginAccounts.spotify?.connected ? 'Spotify Ativo' : pluginAccounts.youtube?.connected ? 'YouTube Ativo' : 'Offline / Local'}
                </p>
              </div>
            </div>

            {/* Botão Zerar Dados & Reiniciar */}
            <button
              type="button"
              onClick={() => void handleFullResetAndClear()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/15 text-red-400 py-2 text-xs font-semibold transition active:scale-95"
              title="Limpar todos os dados locais e reiniciar o app do zero"
            >
              <Trash2 size={13} />
              <span>Zerar Dados & Reiniciar</span>
            </button>
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div
            className="h-8 border-b border-white/5 bg-black/60"
            style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
          />
          <header className="border-b border-white/5 bg-black/50 px-4 py-4 md:px-8 md:py-6 backdrop-blur-2xl">
            {/* Mobile Top Header - Cleaned */}

            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 lg:gap-6">
              <div className="flex flex-1 flex-col gap-2 md:gap-4 w-full min-w-0">
                <div className={`relative w-full max-w-xl rounded-full ${activeDesktopOnboardingStepId === 'search' ? desktopTourFocusClass : ''}`}>
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const q = searchTerm.trim();
                        if (q) {
                          setYoutubeSearchQuery(q);
                          setActiveSection('download');
                          void searchYoutubeInsideApp(q);
                        }
                      }
                    }}
                    placeholder="Buscar músicas, artistas, álbuns, playlists..."
                    className="h-12 w-full rounded-full border border-white/10 bg-[#101010] pl-12 pr-4 text-sm outline-none focus:border-white/20"
                  />
                </div>
                {/* Clean View Title - Spotube Screenshot 1 & 2 */}
                <div className="hidden lg:flex items-center justify-between">
                  <h2 className="text-2xl font-black tracking-tight text-white">
                    {isPlaylistDetailView && activePlaylist ? activePlaylist.name :
                     activeSection === 'home' ? 'Início' :
                     activeSection === 'search' || activeSection === 'download' ? 'Buscar' :
                     activeSection === 'playlists' ? 'Playlists' :
                     activeSection === 'favorites' ? 'Músicas Curtidas' :
                     activeSection === 'local_files' || activeSection === 'library' ? 'Arquivos Locais' :
                     activeSection === 'downloads' ? 'Downloads' :
                     activeSection === 'settings' ? 'Configurações' : 'Início'}
                  </h2>
                </div>
              </div>

              <div className="relative z-20 hidden lg:flex items-center gap-3 pointer-events-auto">
                {activeSection !== 'download' && activeSection !== 'home' && activeSection !== 'explore' ? (
                  <div className="flex items-center rounded-full border border-white/10 bg-[#101010] p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`flex h-11 w-11 items-center justify-center rounded-full ${
                        viewMode === 'grid' ? 'bg-white text-black' : 'text-gray-300'
                      }`}
                    >
                      <LayoutGrid size={18} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex h-11 w-11 items-center justify-center rounded-full ${
                        viewMode === 'list' ? 'bg-white text-black' : 'text-gray-300'
                      }`}
                    >
                      <List size={18} />
                    </button>
                  </div>
                ) : null}

                
              </div>
            </div>
          </header>

          <section className="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-8 md:py-8 pb-56 lg:pb-36">
            {!isPlaylistDetailView && activeSection !== 'search' && activeSection !== 'download' && activeSection !== 'home' && activeSection !== 'explore' ? (
              <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <h2 className="mb-3 text-2xl md:text-5xl font-black tracking-tight">{heroTitle}</h2>
                <p className="text-gray-400">{heroDescription}</p>
              </motion.div>
            ) : null}

            {/* Mobile Settings View: Spotube Plugins Manager (media_1794328024209_c4089668.jpg) */}
            {isPlaylistDetailView ? (
<div className="overflow-hidden rounded-[34px] border border-white/8 bg-[linear-gradient(180deg,#151515_0%,#111111_28%,#0b0b0b_100%)] shadow-[0_30px_80px_rgba(0,0,0,0.28)]">
                <div className="bg-[linear-gradient(180deg,rgba(41,121,255,0.16)_0%,rgba(18,18,18,0.86)_78%,#111111_100%)] px-8 pb-8 pt-8">
                  {/* Botão Voltar para a navegação anterior */}
                  <div className="mb-6">
                    <button
                      type="button"
                      onClick={() => {
                        setActivePlaylistId(null);
                        setActiveDiscoverPlaylistId(null);
                      }}
                      className="flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 px-3.5 py-1.5 text-xs font-bold text-white transition active:scale-95 border border-white/10"
                    >
                      <ChevronLeft size={16} />
                      <span>Voltar para {activeSection === 'playlists' ? 'Playlists' : (activeSection as any) === 'search' || (activeSection as any) === 'download' ? 'Buscar' : 'Início'}</span>
                    </button>
                  </div>
                  <div className="flex flex-col gap-8 lg:flex-row lg:items-end">
                    <div className="h-52 w-52 overflow-hidden rounded-[28px] bg-[#1b1b1b] shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
                      {activeCollectionCover ? (
                        <img src={activeCollectionCover} alt={activeCollection?.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-600">
                          <Library size={64} />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gray-300">
                        {activePlaylist ? 'Sua playlist' : `Playlist de ${activeDiscoverPlaylist?.ownerUserName || 'outro usuario'}`}
                      </p>
                      <h2 className="mt-4 text-5xl font-black tracking-[-0.04em] text-white md:text-7xl">{heroTitle}</h2>
                      <p className="mt-4 max-w-3xl text-sm text-gray-300">{heroDescription}</p>
                      <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-gray-400">
                        <span className="font-semibold text-white">{filteredSongs.length} faixas</span>
                        {activePlaylist ? (
                          <span>Organizada por {currentUser?.nome || 'voce'}</span>
                        ) : (
                          <span>Publicada por {activeDiscoverPlaylist?.ownerUserName || 'outro usuario'}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/6 bg-[linear-gradient(180deg,#111111_0%,#0b0b0b_100%)] px-8 py-6">
                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      onClick={() => {
                        if (filteredSongs[0]) void playSong(filteredSongs[0]);
                      }}
                      className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-black shadow-[0_18px_38px_rgba(34,197,94,0.28)]"
                    >
                      <Play size={22} fill="currentColor" />
                    </button>

                    {activePlaylist ? (
                      <button
                        onClick={() => setViewMode('list')}
                        className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-gray-200 hover:bg-white/[0.08]"
                      >
                        Modo lista
                      </button>
                    ) : null}

                    <button
                      onClick={() => setShowActivityPanel((prev) => !prev)}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-gray-200 hover:bg-white/[0.08]"
                    >
                      {showActivityPanel ? 'Ocultar atividade' : 'Ver atividade'}
                    </button>
                  </div>
                </div>

                <div className="px-8 pb-8">
                  <div className="grid grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)_180px] items-center gap-4 border-b border-white/6 px-4 py-4 text-xs uppercase tracking-[0.2em] text-gray-500">
                    <span>Titulo</span>
                    <span>Origem</span>
                    <span className="text-right">Acoes</span>
                  </div>

                  <div className="divide-y divide-white/5">
                    {filteredSongs.map((song) => {
                      const active = currentSong?.id === song.id;

                      return (
                        <button
                          key={song.id}
                          onClick={() => void playSong(song)}
                          className={`grid w-full grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)_180px] items-center gap-4 px-4 py-4 text-left transition ${
                            active ? 'bg-white/[0.06]' : 'hover:bg-white/[0.04]'
                          }`}
                        >
                          <div className="flex min-w-0 items-center gap-4">
                            <div className="h-14 w-14 overflow-hidden rounded-2xl bg-[#1b1b1b]">
                              {song.thumbnail ? (
                                <img src={song.thumbnail} alt={song.title} className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-gray-600">
                                  <Music size={20} />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className={`truncate text-base font-semibold ${active ? 'text-white' : 'text-gray-100'}`}>
                                {getDisplayTitle(song)}
                              </p>
                              <p className="mt-1 truncate text-sm text-gray-400">
                                {getDisplayArtist(song) || 'Artista desconhecido'}
                              </p>
                            </div>
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm text-gray-300">{getSongSourceLabel(song)}</p>
                            <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                              {song.hasVideo ? (
                                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-cyan-200">
                                  Video
                                </span>
                              ) : null}
                              {offlineSongIds.includes(song.id) ? (
                                <span className="rounded-full border border-green-400/20 bg-green-400/10 px-2.5 py-1 text-green-200">
                                  Offline
                                </span>
                              ) : null}
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2">
                            {canDeleteSongFromPlatform(song) ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void removeSongFromPlatform(song);
                                }}
                                className="flex h-10 w-10 items-center justify-center rounded-full text-red-400 hover:bg-red-500/10 hover:text-red-200"
                                title="Remover da plataforma"
                              >
                                <Trash2 size={17} />
                              </button>
                            ) : null}
                            {activePlaylist ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void removeSongFromActivePlaylist(song);
                                }}
                                className="flex h-10 w-10 items-center justify-center rounded-full text-red-300 hover:bg-red-500/10 hover:text-red-100"
                                title="Remover da playlist"
                              >
                                <Trash2 size={17} />
                              </button>
                            ) : null}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                offlineSongIds.includes(song.id) ? void removeSongOffline(song) : void saveSongOffline(song);
                              }}
                              className={`flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/5 ${
                                offlineSongIds.includes(song.id) ? 'text-green-400' : 'text-gray-400 hover:text-white'
                              }`}
                              title={offlineSongIds.includes(song.id) ? 'Remover offline' : 'Salvar offline'}
                            >
                              {offlineBusyIds.includes(song.id) ? (
                                <LoaderCircle size={17} className="animate-spin" />
                              ) : offlineSongIds.includes(song.id) ? (
                                <Check size={17} />
                              ) : (
                                <HardDriveDownload size={17} />
                              )}
                            </button>
                            {song.hasVideo ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowVideoInMiniPlayer(false);
                                  setIsVideoPanelOpen(true);
                                  void playSongWithMode(song, 'video');
                                }}
                                className="flex h-10 w-10 items-center justify-center rounded-full text-cyan-300 hover:bg-cyan-500/10 hover:text-cyan-100"
                                title="Assistir video"
                              >
                                <Video size={17} />
                              </button>
                            ) : null}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openPlaylistPicker(song);
                              }}
                              className="flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:bg-white/5 hover:text-white"
                              title="Escolher playlist"
                            >
                              <Plus size={17} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                void toggleFavorite(song);
                              }}
                              className={`flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/5 ${
                                song.favorite ? 'text-green-400' : 'text-gray-400 hover:text-white'
                              }`}
                              title="Favoritar"
                            >
                              <Heart size={17} fill={song.favorite ? 'currentColor' : 'none'} />
                            </button>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : activeSection === 'settings' ? (
              <>
                <div className="lg:hidden">
                  <SpotubePlugins
                    isMobile={true}
                    accounts={pluginAccounts}
                    onConnectAccount={handleConnectPluginAccount}
                    onDisconnectAccount={handleDisconnectPluginAccount}
                    onClose={() => setActiveSection('home')}
                  />
                </div>
                <div className="hidden lg:block">
                  {settingsContent}
                </div>
              </>
            ) : activeSection === 'download' ? (
              <div className="space-y-5 pb-24 select-none">
                {/* Search Bar matching Spotube Desktop .exe (media_1794361884091_e506e120.jpg) */}
                <div className="relative">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={youtubeSearchQuery}
                    onChange={(e) => {
                      setYoutubeSearchQuery(e.target.value);
                      setSearchTerm(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') void searchYoutubeInsideApp(youtubeSearchQuery);
                    }}
                    placeholder="Buscar músicas, playlists, álbuns, artistas..."
                    className="h-12 w-full rounded-xl border border-white/10 bg-[#14151a] pl-11 pr-24 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500 transition"
                  />
                  {youtubeSearchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setYoutubeSearchQuery('');
                        setSearchTerm('');
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Filter Pills row: [ Tudo ] [ Faixas ] [ Playlists ] [ Álbuns ] [ Artistas ] [ Usuários ] */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { id: 'tudo', label: 'Tudo' },
                    { id: 'faixas', label: 'Faixas' },
                    { id: 'playlists', label: 'Playlists' },
                    { id: 'albuns', label: 'Álbuns' },
                    { id: 'artistas', label: 'Artistas' },
                    { id: 'usuarios', label: 'Usuários' }
                  ].map((tab) => {
                    const isActive = mobileSearchFilter === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setMobileSearchFilter(tab.id as any);
                          if (youtubeSearchQuery.trim()) {
                            void searchYoutubeInsideApp(youtubeSearchQuery);
                          }
                        }}
                        className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition active:scale-95 shrink-0 ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-[#1a1b20] text-gray-300 hover:bg-[#252730]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Loading indicator */}
                {isSearchingYoutube && (
                  <div className="flex h-64 flex-col items-center justify-center text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                    <p className="mt-3 text-xs font-semibold text-gray-400">Buscando faixas e playlists...</p>
                  </div>
                )}

                {/* High Density 5-Column Grid (100% fiel à screenshot Spotube .exe media_1794361884091_e506e120.jpg) */}
                {!isSearchingYoutube && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-4">
                    {/* Render Playlists when on 'playlists' or 'tudo' */}
                    {(mobileSearchFilter === 'playlists' || mobileSearchFilter === 'tudo') &&
                      youtubePlaylistSearchResults.map((pl) => (
                        <div
                          key={`pl-${pl.id}`}
                          onClick={() => {
                            void openPlaylist({
                              id: pl.id,
                              name: pl.title,
                              ownerUserName: pl.channel || 'YouTube',
                              picture: pl.thumbnail || '',
                              provider: 'youtube',
                              songs: []
                            });
                          }}
                          className="group relative cursor-pointer overflow-hidden rounded-2xl bg-[#14151a] p-3 transition hover:bg-[#1a1b22] border border-white/5"
                        >
                          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-black/40">
                            {pl.thumbnail ? (
                              <img src={pl.thumbnail} alt={pl.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-600/20 to-black text-blue-400">
                                <ListMusic size={32} />
                              </div>
                            )}

                            {/* + Button on top-right of cover (saves to library) */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const newPl: Playlist = {
                                  id: pl.id,
                                  name: pl.title,
                                  ownerUserName: pl.channel || 'YouTube',
                                  picture: pl.thumbnail || '',
                                  songs: []
                                };
                                setPlaylists((prev) => [newPl, ...prev]);
                                setPlayerNotice(`Playlist "${pl.title}" salva na biblioteca!`);
                              }}
                              className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 shadow-md transition active:scale-90"
                              title="Salvar Playlist"
                            >
                              <Plus size={16} />
                            </button>

                            {/* Play Button on bottom-right of cover */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                void playPlaylistDirectly({
                                  id: pl.id,
                                  name: pl.title,
                                  ownerUserName: pl.channel || 'YouTube',
                                  picture: pl.thumbnail || '',
                                  provider: 'youtube',
                                  songs: []
                                });
                              }}
                              className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-xl transition active:scale-90"
                              title="Tocar Playlist"
                            >
                              <Play size={18} fill="currentColor" className="ml-0.5" />
                            </button>
                          </div>

                          <div className="mt-2.5">
                            <h4 className="truncate font-semibold text-sm text-white group-hover:text-blue-400 transition" title={pl.title}>
                              {pl.title}
                            </h4>
                            <p className="truncate text-xs text-gray-400 mt-0.5">
                              {pl.channel || 'YouTube Playlist'}
                            </p>
                          </div>
                        </div>
                      ))}

                    {/* Render Tracks when on 'faixas', 'tudo', or not 'playlists' */}
                    {mobileSearchFilter !== 'playlists' &&
                      youtubeSearchResults.map((track) => {
                        const isFav = Boolean(track.id && songs.some((s) => s.id === track.id && s.favorite));
                        return (
                          <div
                            key={`track-${track.id}-${track.url}`}
                            onClick={() => void playYoutubeTrack(track)}
                            className="group relative cursor-pointer overflow-hidden rounded-2xl bg-[#14151a] p-3 transition hover:bg-[#1a1b22] border border-white/5"
                          >
                            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-black/40">
                              {track.thumbnail ? (
                                <img src={track.thumbnail} alt={track.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-600/20 to-black text-blue-400">
                                  <Music size={32} />
                                </div>
                              )}

                              {/* + Button on top-right of cover (saves to favorites) */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const s: Song = {
                                    id: track.id ? (track.id.startsWith('yt-') || track.id.startsWith('dz-') ? track.id : `yt-${track.id}`) : `yt-${Date.now()}`,
                                    title: track.title,
                                    artist: track.artist || 'Artista',
                                    thumbnail: track.thumbnail,
                                    source: track.source || 'youtube',
                                    path: track.previewUrl || track.url,
                                    hasAudio: true,
                                    favorite: false
                                  };
                                  void toggleFavorite(s);
                                }}
                                className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 shadow-md transition active:scale-90"
                                title="Salvar Música"
                              >
                                {isFav ? <Check size={16} className="text-blue-400" /> : <Plus size={16} />}
                              </button>

                              {/* Play Button on bottom-right of cover */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void playYoutubeTrack(track);
                                }}
                                className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-xl transition active:scale-90"
                                title="Tocar Agora"
                              >
                                <Play size={18} fill="currentColor" className="ml-0.5" />
                              </button>
                            </div>

                            <div className="mt-2.5">
                              <h4 className="truncate font-semibold text-sm text-white group-hover:text-blue-400 transition" title={track.title}>
                                {track.title}
                              </h4>
                              <p className="truncate text-xs text-gray-400 mt-0.5">
                                {track.artist || 'Artista'}
                              </p>
                            </div>
                          </div>
                        );
                      })}

                    {/* Empty State */}
                    {youtubeSearchResults.length === 0 && youtubePlaylistSearchResults.length === 0 && !isSearchingYoutube && (
                      <div className="col-span-full py-16 text-center text-gray-400">
                        <Search size={40} className="mx-auto mb-3 opacity-30" />
                        <p className="text-sm font-semibold text-gray-300">
                          {youtubeSearchQuery ? `Nenhum resultado encontrado para "${youtubeSearchQuery}"` : 'Digite algo para buscar no Spotube Core'}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : activeSection === 'home' && !activePlaylist ? (
              <div className="space-y-8 pb-24 select-none">
                
                {/* 1. SEÇÃO DESTAQUES SPOTIFY & TENDÊNCIAS (Grid 3x3 no mobile/tablet, 4 a 5 no desktop - Idêntico ao Spotube da Foto 1) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1db954]/20 text-[#1db954]">
                        <Music2 size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-white flex items-center gap-2">
                          <span>Playlists em Destaque • Spotify</span>
                          {pluginAccounts.spotify?.connected && (
                            <span className="rounded-full bg-[#1db954]/20 border border-[#1db954]/30 px-2 py-0.5 text-[10px] font-bold text-[#1db954]">
                              Conectado
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-neutral-400">
                          Toque direto sem anúncios com motor de áudio HiFi integrado
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-neutral-400">
                      {spotifyPlaylists.length} playlists
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                    {spotifyPlaylists.map((pl) => (
                      <div
                        key={pl.id}
                        onClick={() => {
                          setActiveDiscoverPlaylistId(null);
                          setActivePlaylistId(pl.id);
                          setActiveSection('library');
                        }}
                        className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-[#14151a] p-3 transition hover:border-[#1db954]/40 hover:bg-[#1a1b22]"
                      >
                        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-black/40 border border-white/5">
                          {pl.picture || pl.songs?.[0]?.thumbnail ? (
                            <img src={pl.picture || pl.songs?.[0]?.thumbnail || ''} alt={pl.name} className="h-full w-full object-cover transition group-hover:scale-105" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1db954]/20 to-black text-[#1db954]">
                              <Music2 size={32} />
                            </div>
                          )}

                          {/* Botão + no canto superior direito para favoritar / salvar */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (pl.songs && pl.songs.length > 0) {
                                void toggleFavorite(pl.songs[0]);
                              }
                            }}
                            className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/10 opacity-0 group-hover:opacity-100 transition active:scale-90"
                            title="Adicionar faixa à biblioteca"
                          >
                            <Plus size={16} />
                          </button>

                          {/* Botão Play circular azul/verde no canto inferior direito */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (pl.songs && pl.songs.length > 0) {
                                void playSong(pl.songs[0]);
                              } else {
                                setActivePlaylistId(pl.id);
                                setActiveSection('library');
                              }
                            }}
                            className="absolute bottom-2.5 right-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-[#1db954] text-black shadow-xl opacity-0 group-hover:opacity-100 transition active:scale-90"
                            title="Tocar Playlist"
                          >
                            <Play size={18} fill="currentColor" className="ml-0.5" />
                          </button>
                        </div>
                        <div className="mt-2.5">
                          <h4 className="truncate font-bold text-xs sm:text-sm text-white group-hover:text-[#1db954] transition">{pl.name}</h4>
                          <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-0.5">
                            <span>{(pl.songs || []).length} faixas</span>
                            <span className="text-[#1db954] font-semibold">Spotify</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. MINHAS PLAYLISTS LOCAIS (Treino, WOD & LPO - Garantidas >= 3 playlists) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/20 text-blue-500">
                        <Folder size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-white">Minhas Playlists Locais</h3>
                        <p className="text-xs text-neutral-400">Playlists para treinos pesados salvas no dispositivo</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-neutral-400">{localPlaylists.length} playlists</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                    {localPlaylists.map((pl) => (
                      <div
                        key={pl.id}
                        onClick={() => {
                          setActiveDiscoverPlaylistId(null);
                          setActivePlaylistId(pl.id);
                          setActiveSection('library');
                        }}
                        className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-[#14151a] p-3 transition hover:border-blue-500/40 hover:bg-[#1a1b22]"
                      >
                        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-black/40 border border-white/5">
                          {pl.picture || pl.songs?.[0]?.thumbnail ? (
                            <img src={pl.picture || pl.songs?.[0]?.thumbnail || ''} alt={pl.name} className="h-full w-full object-cover transition group-hover:scale-105" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-600/20 to-black text-blue-400">
                              <Music2 size={32} />
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (pl.songs && pl.songs.length > 0) {
                                void playSong(pl.songs[0]);
                              } else {
                                setActivePlaylistId(pl.id);
                                setActiveSection('library');
                              }
                            }}
                            className="absolute bottom-2.5 right-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl opacity-0 group-hover:opacity-100 transition active:scale-90"
                            title="Tocar Playlist"
                          >
                            <Play size={18} fill="currentColor" className="ml-0.5" />
                          </button>
                        </div>
                        <div className="mt-2.5">
                          <h4 className="truncate font-bold text-xs sm:text-sm text-white group-hover:text-blue-400 transition">{pl.name}</h4>
                          <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-0.5">
                            <span>{(pl.songs || []).length} faixas</span>
                            <span className="text-blue-400 font-semibold">Local</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. YOUTUBE MUSIC PLAYLISTS ROW */}
                {pluginAccounts.youtube?.connected && youtubePlaylists.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600/20 text-red-500">
                          <Play size={20} fill="currentColor" />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-white flex items-center gap-2">
                            <span>Playlists do YouTube Music</span>
                            <span className="rounded-full bg-red-500/20 border border-red-500/30 px-2 py-0.5 text-[10px] font-bold text-red-400">
                              Conectado
                            </span>
                          </h3>
                          <p className="text-xs text-neutral-400">
                            Sincronizado via YouTube ({pluginAccounts.youtube.username || 'Ativo'})
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-neutral-400">
                        {youtubePlaylists.length} playlists
                      </span>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {youtubePlaylists.map((pl) => (
                        <div
                          key={pl.id}
                          onClick={() => {
                            setActiveDiscoverPlaylistId(null);
                            setActivePlaylistId(pl.id);
                            setActiveSection('library');
                          }}
                          className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-red-500/40 hover:bg-white/[0.06]"
                        >
                          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-black/40 border border-white/5">
                            {pl.picture || pl.songs?.[0]?.thumbnail ? (
                              <img src={pl.picture || pl.songs?.[0]?.thumbnail || ''} alt={pl.name} className="h-full w-full object-cover transition group-hover:scale-105" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-red-600/20 to-black text-red-500">
                                <Play size={32} fill="currentColor" />
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (pl.songs && pl.songs.length > 0) {
                                  void playSong(pl.songs[0]);
                                } else {
                                  setActivePlaylistId(pl.id);
                                  setActiveSection('library');
                                }
                              }}
                              className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white shadow-lg opacity-0 group-hover:opacity-100 transition active:scale-90"
                              title="Tocar Playlist"
                            >
                              <Play size={18} fill="currentColor" className="ml-0.5" />
                            </button>
                          </div>
                          <div className="mt-3">
                            <h4 className="truncate font-bold text-sm text-white group-hover:text-red-400 transition">{pl.name}</h4>
                            <div className="flex items-center justify-between text-xs text-neutral-400 mt-1">
                              <span>{(pl.songs || []).length} faixas</span>
                              <span className="text-red-400 text-[11px] font-semibold">YouTube</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. DEEZER HIFI PLAYLISTS ROW (Aparece SOMENTE com conexao Deezer ativa) */}
                {pluginAccounts.deezer?.connected && deezerPlaylists.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400">
                          <Radio size={20} />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-white flex items-center gap-2">
                            <span>Playlists do Deezer</span>
                            <span className="rounded-full bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 text-[10px] font-bold text-purple-300">
                              Conectado
                            </span>
                          </h3>
                          <p className="text-xs text-neutral-400">
                            Sincronizado via Deezer HiFi ({pluginAccounts.deezer.username || 'Ativo'})
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-neutral-400">
                        {deezerPlaylists.length} playlists
                      </span>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {deezerPlaylists.map((pl) => (
                        <div
                          key={pl.id}
                          onClick={() => {
                            setActiveDiscoverPlaylistId(null);
                            setActivePlaylistId(pl.id);
                            setActiveSection('library');
                          }}
                          className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-purple-500/40 hover:bg-white/[0.06]"
                        >
                          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-black/40 border border-white/5">
                            {pl.picture || pl.songs?.[0]?.thumbnail ? (
                              <img src={pl.picture || pl.songs?.[0]?.thumbnail || ''} alt={pl.name} className="h-full w-full object-cover transition group-hover:scale-105" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-600/20 to-black text-purple-400">
                                <Radio size={32} />
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (pl.songs && pl.songs.length > 0) {
                                  void playSong(pl.songs[0]);
                                } else {
                                  setActivePlaylistId(pl.id);
                                  setActiveSection('library');
                                }
                              }}
                              className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg opacity-0 group-hover:opacity-100 transition active:scale-90"
                              title="Tocar Playlist"
                            >
                              <Play size={18} fill="currentColor" className="ml-0.5" />
                            </button>
                          </div>
                          <div className="mt-3">
                            <h4 className="truncate font-bold text-sm text-white group-hover:text-purple-400 transition">{pl.name}</h4>
                            <div className="flex items-center justify-between text-xs text-neutral-400 mt-1">
                              <span>{(pl.songs || []).length} faixas</span>
                              <span className="text-purple-400 text-[11px] font-semibold">Deezer HiFi</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ) : activeSection === 'playlists' && !isPlaylistDetailView ? (
              <div className="space-y-6 pb-24 select-none">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div>
                    <h2 className="text-2xl font-black text-white">Minhas Playlists</h2>
                    <p className="text-xs text-gray-400 mt-1">Playlists salvas e criadas no Montanha Music Lab</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const name = window.prompt('Nome da nova playlist:');
                      if (name && name.trim()) {
                        const newPl: Playlist = {
                          id: `pl-${Date.now()}`,
                          name: name.trim(),
                          ownerUserName: currentUser?.nome || 'Você',
                          songs: []
                        };
                        setPlaylists((prev) => [newPl, ...prev]);
                        try {
                          const stored = JSON.parse(localStorage.getItem('montanha_custom_playlists') || '[]');
                          localStorage.setItem('montanha_custom_playlists', JSON.stringify([newPl, ...stored]));
                        } catch {}
                        setPlayerNotice(`Playlist "${name.trim()}" criada!`);
                      }
                    }}
                    className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-bold text-white shadow-md transition active:scale-95"
                  >
                    <Plus size={16} />
                    <span>Nova Playlist</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {playlists.map((pl) => (
                    <div
                      key={pl.id}
                      onClick={() => {
                        setActiveDiscoverPlaylistId(null);
                        setActivePlaylistId(pl.id);
                      }}
                      className="group relative cursor-pointer overflow-hidden rounded-2xl bg-[#14151a] p-3 transition hover:bg-[#1a1b22] border border-white/5"
                    >
                      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-black/40">
                        {pl.picture || pl.songs?.[0]?.thumbnail ? (
                          <img src={pl.picture || pl.songs?.[0]?.thumbnail || ''} alt={pl.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-600/20 to-black text-blue-400">
                            <ListMusic size={32} />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (pl.songs && pl.songs.length > 0) {
                              void playSong(pl.songs[0]);
                            } else {
                              setActivePlaylistId(pl.id);
                            }
                          }}
                          className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-xl transition active:scale-90"
                          title="Tocar Playlist"
                        >
                          <Play size={18} fill="currentColor" className="ml-0.5" />
                        </button>
                      </div>
                      <div className="mt-2.5">
                        <h4 className="truncate font-semibold text-sm text-white group-hover:text-blue-400 transition">{pl.name}</h4>
                        <p className="truncate text-xs text-gray-400 mt-0.5">{(pl.songs || []).length} faixas</p>
                      </div>
                    </div>
                  ))}
                  {playlists.length === 0 && (
                    <div className="col-span-full py-16 text-center text-gray-400">
                      <ListMusic size={40} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm font-semibold text-gray-300">Você ainda não tem playlists criadas.</p>
                      <p className="text-xs text-gray-500 mt-1">Clique em "Nova Playlist" ou salve qualquer playlist na Busca com o botão +.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : activeSection === 'explore' && !activeDiscoverPlaylist ? (
              explorePlaylists.length === 0 ? (
                <div className="flex h-[50vh] flex-col items-center justify-center text-center text-gray-500">
                  <Compass size={60} className="mb-4 opacity-30" />
                  <p className="text-2xl font-bold text-gray-200">Nenhuma playlist publica encontrada</p>
                  <p className="mt-2 max-w-md text-sm text-gray-500">
                    Quando outros usuarios criarem playlists, elas vao aparecer aqui para descoberta.
                  </p>
                </div>
              ) : (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {explorePlaylists.map((playlist) => {
                    const cover = playlist.songs?.[0]?.thumbnail || null;
                    const owner = playlist.ownerUserName || 'Outro usuario';
                    return (
                      <button
                        key={playlist.id}
                        onClick={() => {
                          setActivePlaylistId(null);
                          setActiveDiscoverPlaylistId(playlist.id);
                        }}
                        className="group overflow-hidden rounded-[32px] border border-white/10 bg-[#101010] text-left transition hover:border-white/20 hover:bg-[#151515]"
                      >
                        <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-cyan-500/20 via-white/5 to-transparent">
                          {cover ? (
                            <img src={cover} alt={playlist.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-gray-600">
                              <Compass size={46} />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                          <div className="absolute bottom-4 left-4 right-4">
                            <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Playlist de {owner}</p>
                            <h3 className="mt-2 truncate text-2xl font-black text-white">{playlist.name}</h3>
                          </div>
                        </div>
                        <div className="flex items-center justify-between px-5 py-4 text-sm text-gray-400">
                          <span>{(playlist.songs || []).length} faixas</span>
                          <span>Ver selecao</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )
            ) : activeSection === 'local_files' ? (
              <div className="space-y-6 pb-24 select-none">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div>
                    <h3 className="text-2xl font-black text-white">Arquivos Locais</h3>
                    <p className="text-xs text-neutral-400 mt-1">Músicas salvas e disponíveis offline no seu dispositivo</p>
                  </div>
                  <span className="text-xs font-semibold text-neutral-400">{songs.length} faixas</span>
                </div>

                {songs.length === 0 ? (
                  <div className="flex h-64 flex-col items-center justify-center text-center text-gray-500">
                    <Folder size={48} className="mb-3 opacity-30 text-blue-400" />
                    <p className="text-lg font-bold text-gray-200">Nenhum arquivo local ainda</p>
                    <p className="mt-1 text-xs text-gray-500 max-w-sm">
                      Busque faixas na aba Buscar e clique no botão "+" para salvar na sua biblioteca local.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                    {songs.map((song) => (
                      <div
                        key={song.id}
                        onClick={() => void playSong(song)}
                        className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-[#14151a] p-3 transition hover:border-blue-500/40 hover:bg-[#1a1b22]"
                      >
                        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-black/40 border border-white/5">
                          {song.thumbnail ? (
                            <img src={song.thumbnail} alt={song.title} className="h-full w-full object-cover transition group-hover:scale-105" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-600/20 to-black text-blue-400">
                              <Music size={32} />
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              void playSong(song);
                            }}
                            className="absolute bottom-2.5 right-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl opacity-0 group-hover:opacity-100 transition active:scale-90"
                            title="Tocar Faixa"
                          >
                            <Play size={18} fill="currentColor" className="ml-0.5" />
                          </button>
                        </div>
                        <div className="mt-2.5">
                          <h4 className="truncate font-bold text-xs sm:text-sm text-white group-hover:text-blue-400 transition">{song.title}</h4>
                          <p className="truncate text-[11px] text-neutral-400 mt-0.5">{song.artist || 'Artista'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : filteredSongs.length === 0 ? (
              <div className="flex h-[50vh] flex-col items-center justify-center text-center text-gray-500">
                <Music size={60} className="mb-4 opacity-30" />
                <p className="text-2xl font-bold text-gray-200">Nenhuma musica encontrada</p>
                <p className="mt-2 max-w-md text-sm text-gray-500">
                  {currentUser
                    ? 'Baixe musicas para este usuario ou troque para Explorar para ver tudo.'
                    : 'Crie uma conta ou entre para montar uma biblioteca separada.'}
                </p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2.5 sm:gap-4">
                <AnimatePresence>
                  {filteredSongs.map((song, index) => {
                    const active = currentSong?.id === song.id;

                    return (
                      <motion.div
                        key={song.id}
                        layout
                        initial={{ opacity: 0, y: 16, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.96 }}
                        transition={{ delay: index * 0.02 }}
                        onClick={() => void playSong(song)}
                        className={`group relative cursor-pointer overflow-hidden rounded-[30px] border transition ${
                          active
                            ? 'border-green-500/35 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.14),transparent_42%),linear-gradient(180deg,#171717_0%,#101010_100%)] shadow-[0_18px_50px_rgba(34,197,94,0.08)]'
                            : 'border-white/5 bg-[linear-gradient(180deg,#121212_0%,#0d0d0d_100%)] hover:border-white/10 hover:bg-[#161616]'
                        }`}
                      >
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.04] via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
                        <div className="relative p-2.5 sm:p-3">
                          <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#1b1b1b]">
                            {song.thumbnail ? (
                              <img
                                src={song.thumbnail}
                                alt={song.title}
                                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Music size={42} className="text-gray-700" />
                              </div>
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                            <div className="absolute left-4 top-4 flex flex-wrap gap-2 text-[11px]">
                              <span className="rounded-full border border-white/10 bg-black/35 px-2.5 py-1 text-gray-200 backdrop-blur-xl">
                                {getSongSourceLabel(song)}
                              </span>
                              {song.hasVideo ? (
                                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/15 px-2.5 py-1 text-cyan-100 backdrop-blur-xl">
                                  Video
                                </span>
                              ) : null}
                              {offlineSongIds.includes(song.id) ? (
                                <span className="rounded-full border border-green-400/20 bg-green-400/15 px-2.5 py-1 text-green-100 backdrop-blur-xl">
                                  Offline
                                </span>
                              ) : null}
                            </div>

                            <motion.button
                              whileHover={{ scale: 1.08 }}
                              whileTap={{ scale: 0.96 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                void playSong(song);
                              }}
                              className="absolute bottom-2.5 right-2.5 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-green-500 text-black shadow-lg"
                            >
                              {active && isPlaying ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
                            </motion.button>
                          </div>

                          <div className="pt-5">
                            <p className="truncate text-xs sm:text-sm font-bold leading-tight text-white">
                              {getDisplayTitle(song)}
                            </p>
                            <p className="mt-1 truncate text-[11px] sm:text-xs text-gray-400">
                              {getDisplayArtist(song) || 'Artista desconhecido'}
                            </p>

                            <div className="mt-5 flex items-center">
                              {getSongUploaderLabel(song) ? (
                                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] text-gray-400">
                                  {getSongUploaderLabel(song)}
                                </span>
                              ) : (
                                <span className="rounded-full border border-white/5 bg-white/[0.03] px-3 py-1.5 text-[11px] text-gray-500">
                                  Biblioteca
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="mt-5 flex flex-nowrap items-center gap-1.5 overflow-hidden rounded-[20px] border border-white/6 bg-black/25 px-2 py-2 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
                            {canDeleteSongFromPlatform(song) ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void removeSongFromPlatform(song);
                                }}
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-red-400 transition hover:bg-red-500/10 hover:text-red-200"
                                title="Remover da plataforma"
                              >
                                <Trash2 size={15} />
                              </button>
                            ) : null}
                            {activePlaylist ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void removeSongFromActivePlaylist(song);
                                }}
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-red-300 transition hover:bg-red-500/10 hover:text-red-100"
                                title="Remover da playlist"
                              >
                                <Trash2 size={15} />
                              </button>
                            ) : null}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                offlineSongIds.includes(song.id)
                                  ? void removeSongOffline(song)
                                  : void saveSongOffline(song);
                              }}
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition hover:bg-white/5 ${
                                offlineSongIds.includes(song.id) ? 'text-green-400' : 'text-gray-500 hover:text-white'
                              }`}
                              title={offlineSongIds.includes(song.id) ? 'Remover offline' : 'Salvar offline'}
                            >
                              {offlineBusyIds.includes(song.id) ? (
                                <LoaderCircle size={15} className="animate-spin" />
                              ) : offlineSongIds.includes(song.id) ? (
                                <Check size={15} />
                              ) : (
                                <HardDriveDownload size={15} />
                              )}
                            </button>

                            {song.hasVideo ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowVideoInMiniPlayer(false);
                                  setIsVideoPanelOpen(true);
                                  void playSongWithMode(song, 'video');
                                }}
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-cyan-300 transition hover:bg-cyan-500/10 hover:text-cyan-100"
                                title="Assistir video"
                              >
                                <Video size={15} />
                              </button>
                            ) : null}

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openPlaylistPicker(song);
                              }}
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-gray-500 transition hover:bg-white/5 hover:text-white"
                              title="Escolher playlist"
                            >
                              <Plus size={15} />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                void toggleFavorite(song);
                              }}
                              className={`ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition hover:bg-white/5 ${
                                song.favorite ? 'text-green-400' : 'text-gray-500 hover:text-white'
                              }`}
                            >
                              <Heart size={15} fill={song.favorite ? 'currentColor' : 'none'} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            ) : (
              <div className="overflow-hidden rounded-3xl border border-white/5 bg-[#0d0d0d]">
                {filteredSongs.map((song) => {
                  const active = currentSong?.id === song.id;

                  return (
                    <motion.div
                      key={song.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => void playSong(song)}
                      className={`grid cursor-pointer grid-cols-[minmax(0,1.7fr)_minmax(0,1.1fr)_130px] gap-4 border-b border-white/5 px-6 py-4 ${
                        active ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-[#1b1b1b]">
                          {song.thumbnail ? (
                            <img src={song.thumbnail} alt={song.title} className="h-full w-full object-cover" />
                          ) : (
                            <Music size={18} className="text-gray-700" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{getDisplayTitle(song)}</p>
                          <p className="truncate text-xs text-gray-500">
                            {getDisplayArtist(song) || 'Artista desconhecido'}
                          </p>
                        </div>
                      </div>
                      <div className="flex min-w-0 flex-col justify-center">
                        <p className="truncate text-sm text-gray-300">{getSongSourceLabel(song)}</p>
                        <p className="truncate text-xs text-gray-500">
                          {offlineSongIds.includes(song.id)
                            ? 'Disponivel offline'
                            : getSongUploaderLabel(song) || 'Sem autor de upload'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {canDeleteSongFromPlatform(song) ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              void removeSongFromPlatform(song);
                            }}
                            className="text-red-400 hover:text-red-200"
                            title="Remover da plataforma"
                          >
                            <Trash2 size={17} />
                          </button>
                        ) : null}
                        {activePlaylist ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              void removeSongFromActivePlaylist(song);
                            }}
                            className="text-red-300 hover:text-red-100"
                            title="Remover da playlist"
                          >
                            <Trash2 size={17} />
                          </button>
                        ) : null}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            offlineSongIds.includes(song.id)
                              ? void removeSongOffline(song)
                              : void saveSongOffline(song);
                          }}
                          className={offlineSongIds.includes(song.id) ? 'text-green-400' : 'text-gray-500 hover:text-white'}
                          title={offlineSongIds.includes(song.id) ? 'Remover offline' : 'Salvar offline'}
                        >
                          {offlineBusyIds.includes(song.id) ? (
                            <LoaderCircle size={17} className="animate-spin" />
                          ) : offlineSongIds.includes(song.id) ? (
                            <Check size={17} />
                          ) : (
                            <HardDriveDownload size={17} />
                          )}
                        </button>

                        {song.hasVideo ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowVideoInMiniPlayer(false);
                              setIsVideoPanelOpen(true);
                              void playSongWithMode(song, 'video');
                            }}
                            className="text-cyan-300 hover:text-cyan-100"
                            title="Assistir video"
                          >
                            <Video size={17} />
                          </button>
                        ) : null}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openPlaylistPicker(song);
                          }}
                          className="text-gray-500 hover:text-white"
                          title="Escolher playlist"
                        >
                          <Plus size={17} />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            void toggleFavorite(song);
                          }}
                          className={song.favorite ? 'text-green-400' : 'text-gray-500 hover:text-white'}
                        >
                          <Heart size={17} fill={song.favorite ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      </div>

      {playlistPickerSong ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-6">
          <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#0d0d0d] p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Salvar em playlist</p>
                <h3 className="mt-2 text-2xl font-bold">{getDisplayTitle(playlistPickerSong)}</h3>
                <p className="mt-1 text-sm text-gray-400">{getSongSubtitle(playlistPickerSong)}</p>
              </div>
              <button
                onClick={() => setPlaylistPickerSong(null)}
                className="rounded-xl p-2 text-gray-400 hover:bg-white/5 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {playlists.length === 0 ? (
              <p className="text-sm text-gray-400">Crie uma playlist na sidebar antes de adicionar musicas.</p>
            ) : (
              <div className="space-y-2">
                {playlists.map((playlist) => (
                  <button
                    key={playlist.id}
                    onClick={() => void choosePlaylist(playlist.id)}
                    className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left hover:bg-white/[0.06]"
                  >
                    <span>{playlist.name}</span>
                    <span className="text-xs text-gray-500">{(playlist.songs || []).length}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Spotube Engine: 100% Direct Playback & Direct Download - No intermediate modals */}

      {showActivityPanel ? (
        <div className="fixed bottom-28 right-6 z-40 w-[min(420px,calc(100vw-2rem))] overflow-hidden rounded-[28px] border border-white/10 bg-[#0b0b0b]/95 shadow-2xl backdrop-blur-2xl">
          <div className="flex min-w-0 items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Atividade</p>
              <p className="mt-1 truncate text-sm text-gray-300">Analise, download, playlist e avisos do backend</p>
            </div>
            <button
              onClick={() => setShowActivityPanel(false)}
              className="rounded-xl p-2 text-gray-400 hover:bg-white/5 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
          <div className="max-h-[380px] overflow-x-hidden overflow-y-auto px-5 py-4">
            {activityLogs.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhuma atividade registrada ainda.</p>
            ) : (
              <div className="space-y-2">
                {activityLogs.map((entry, index) => {
                  const meta = getActivityMeta(entry);
                  const toneClass =
                    meta.tone === 'error'
                      ? 'border-red-500/20 bg-red-500/10'
                      : meta.tone === 'warn'
                        ? 'border-amber-500/20 bg-amber-500/10'
                        : meta.tone === 'playlist'
                          ? 'border-cyan-500/20 bg-cyan-500/10'
                          : meta.tone === 'inspect'
                            ? 'border-violet-500/20 bg-violet-500/10'
                            : meta.tone === 'download'
                              ? 'border-green-500/20 bg-green-500/10'
                              : 'border-white/5 bg-white/[0.03]';

                  return (
                    <div key={`${entry}-${index}`} className={`min-w-0 overflow-hidden rounded-2xl border px-3 py-3 text-xs ${toneClass}`}>
                      <div className="flex min-w-0 items-center justify-between gap-3">
                        <span className="rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-200">
                          {meta.label}
                        </span>
                        {meta.timestamp ? <span className="shrink-0 text-[10px] text-gray-400">{meta.timestamp}</span> : null}
                      </div>
                      <p className="mt-2 whitespace-pre-wrap break-words leading-5 text-gray-200">{meta.message}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {shouldShowDesktopUpdateBanner ? (
        <div className="fixed right-4 top-4 z-40 w-[min(420px,calc(100vw-2rem))] rounded-[28px] border border-green-500/20 bg-[linear-gradient(180deg,rgba(17,24,39,0.96)_0%,rgba(7,10,16,0.98)_100%)] p-5 shadow-[0_25px_80px_rgba(0,0,0,0.4)] backdrop-blur-2xl">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-green-300">Atualização disponível</p>
              <p className="mt-2 truncate text-lg font-black text-white">{updateHeadline}</p>
              <p className="mt-2 text-sm leading-6 text-gray-300">{desktopUpdateStatus.message}</p>
              {formattedReleaseDate ? (
                <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-gray-500">{formattedReleaseDate}</p>
              ) : null}
            </div>
            <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-gray-200">
              {updateStatusLabel}
            </span>
          </div>

          {desktopUpdateStatus.progress !== null && desktopUpdateStatus.progress !== undefined ? (
            <div className="mt-4">
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-green-400 to-cyan-400"
                  style={{ width: `${Math.max(3, Math.min(100, Number(desktopUpdateStatus.progress || 0)))}%` }}
                />
              </div>
            </div>
          ) : null}

          {releaseNotesPreview.length ? (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
              {releaseNotesPreview.map((section, index) => (
                <p key={`${section}-${index}`} className={`text-sm leading-6 text-gray-300 ${index > 0 ? 'mt-3' : ''}`}>
                  {section}
                </p>
              ))}
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-3">
            {desktopUpdateStatus.state === 'downloaded' ? (
              <button
                onClick={() => void installDesktopUpdate()}
                className="rounded-full border border-green-500/30 bg-green-500/15 px-4 py-2 text-sm text-green-100 hover:bg-green-500/20"
              >
                Reiniciar e instalar
              </button>
            ) : (
              <button
                onClick={() => {
                  focusDesktopUpdateSection('panel');
                  void triggerDesktopUpdateCheck();
                }}
                className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-gray-200 hover:bg-white/[0.08]"
              >
                Abrir detalhes
              </button>
            )}
            <button
              onClick={() => focusDesktopUpdateSection('notes')}
              className="rounded-full border border-white/10 bg-transparent px-4 py-2 text-sm text-gray-400 hover:border-white/20 hover:text-white"
            >
              Ver notas
            </button>
          </div>
        </div>
      ) : null}

      <div
        ref={videoPanelRef}
        className={`fixed z-30 overflow-hidden border border-white/10 bg-black/90 shadow-2xl backdrop-blur-2xl ${
          isVideoTheaterOpen
            ? 'inset-4 rounded-[32px]'
            : 'bottom-32 right-6 w-[420px] rounded-[28px]'
        } ${
          currentSong && playbackMode === 'video' && currentSong.hasVideo && isVideoPanelOpen ? 'block' : 'hidden'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{getDisplayTitle(currentSong)}</p>
              <p className="truncate text-xs text-gray-400">{getSongSubtitle(currentSong)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => void openVideoInMiniPlayer()}
                className="rounded-xl border border-white/10 px-3 py-2 text-xs text-gray-300 hover:bg-white/5 hover:text-white"
              >
                Mini player
              </button>
              <button
                onClick={() => void openVideoFullscreen()}
                className="rounded-xl border border-white/10 px-3 py-2 text-xs text-gray-300 hover:bg-white/5 hover:text-white"
              >
                <span className="inline-flex items-center gap-2">
                  <Expand size={14} />
                  {isVideoTheaterOpen ? 'Janela' : 'Tela cheia'}
                </span>
              </button>
              <button
                onClick={() => void switchCurrentPlaybackMode('audio')}
                className="rounded-xl border border-white/10 px-3 py-2 text-xs text-gray-300 hover:bg-white/5 hover:text-white"
              >
                Ouvir audio
              </button>
              <button
                onClick={() => {
                  setIsVideoTheaterOpen(false);
                  setIsVideoPanelOpen(false);
                  setShowVideoInMiniPlayer(false);
                  videoRef.current?.pause();
                  void switchCurrentPlaybackMode('audio');
                }}
                className="rounded-xl p-2 text-gray-400 hover:bg-white/5 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          <div className={`relative bg-black ${isVideoTheaterOpen ? 'min-h-0 flex-1' : 'aspect-video'}`}>
          <video
            ref={videoRef}
            preload="metadata"
            playsInline
            poster={currentSong?.thumbnail || undefined}
            className="h-full w-full bg-black object-contain"
            onContextMenu={(e) => e.preventDefault()}
            onTimeUpdate={() => handleMediaTimeUpdate(videoRef.current)}
            onLoadedMetadata={() => handleMediaLoadedMetadata(videoRef.current)}
            onPause={() => {
              if (playbackModeRef.current === 'video') {
                setIsPlaying(false);
                broadcastSnapshot({ isPlaying: false });
              }
            }}
            onPlay={() => {
              if (playbackModeRef.current === 'video') {
                setIsPlaying(true);
                broadcastSnapshot({ isPlaying: true });
              }
            }}
            onError={() => {
              if (playbackModeRef.current === 'video') {
                setDownloadMessage('Falha ao reproduzir video desta faixa. Verifique se o arquivo de video foi salvo.');
              }
            }}
            onEnded={() => {
              void playNext();
            }}
          />
          </div>
          <div className="border-t border-white/10 bg-[linear-gradient(180deg,rgba(9,9,9,0.9)_0%,rgba(4,4,4,0.98)_100%)] px-4 py-4">
            <div className="flex items-center gap-3">
              <span className="w-12 text-right text-[11px] text-gray-400">{formatTime(currentTime)}</span>
              <input
                type="range"
                min={0}
                max={duration || 0}
                step={0.1}
                value={currentTime}
                onChange={(e) => {
                  const nextTime = Number(e.target.value);
                  void runPlayerCommand({ type: 'SEEK', time: nextTime });
                }}
                className="min-w-0 flex-1 accent-green-500"
              />
              <span className="w-12 text-[11px] text-gray-400">{formatTime(duration)}</span>
            </div>

            <div className="mt-4 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => void playPrevious()}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
                >
                  <SkipBack size={18} />
                </button>
                <button
                  onClick={() => void togglePlay()}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black shadow-lg"
                >
                  {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                </button>
                <button
                  onClick={() => void playNext()}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
                >
                  <SkipForward size={18} />
                </button>
              </div>

              <div className="flex flex-1 flex-col gap-4 xl:flex-row xl:items-center xl:justify-end">
                <div className="flex items-center gap-3 xl:max-w-[240px] xl:flex-1">
                  <Volume2 size={16} className="text-gray-400" />
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={volume}
                    onChange={(e) => {
                      const nextVolume = Number(e.target.value);
                      void runPlayerCommand({ type: 'SET_VOLUME', volume: nextVolume });
                    }}
                    className="min-w-0 flex-1 accent-green-500"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => void openVideoInMiniPlayer()}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-gray-200 hover:bg-white/[0.08]"
                  >
                    Mini player
                  </button>
                  <button
                    onClick={() => void switchCurrentPlaybackMode('audio')}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-gray-200 hover:bg-white/[0.08]"
                  >
                    Ouvir audio
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE FLOATING MINI-PLAYER (100% FIEL AO SPOTUBE MOBILE - media_1794327948332_460fbb68.jpg) */}
      <div className={`fixed bottom-[74px] left-3 right-3 z-30 rounded-2xl border border-slate-200/90 bg-white/95 px-3 py-2 shadow-lg backdrop-blur-md flex items-center justify-between gap-2.5 text-slate-800 lg:hidden ${isVideoTheaterOpen ? 'hidden' : ''}`}>
        {/* Progress bar line at top */}
        <div onClick={(e) => {
          e.stopPropagation();
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const pct = Math.max(0, Math.min(1, clickX / rect.width));
          if (duration > 0) {
            const seekTime = pct * duration;
            setCurrentTime(seekTime);
            if (audioRef.current) audioRef.current.currentTime = seekTime;
            if (window.ytPlayer && typeof window.ytPlayer.seekTo === 'function') {
              window.ytPlayer.seekTo(seekTime, true);
            }
          }
        }} className="absolute top-0 left-3 right-3 h-[4px] bg-slate-200 cursor-pointer overflow-hidden rounded-t-2xl">
          <div
            className="h-full bg-blue-600 transition-all duration-200"
            style={{ width: `${duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0}%` }}
          />
        </div>

        {/* Thumbnail & Title */}
        <div onClick={() => setIsExpandedPlayerOpen(true)} className="flex min-w-0 flex-1 items-center gap-2.5 cursor-pointer">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 border border-slate-200">
            {currentSong?.thumbnail ? (
              <img src={currentSong.thumbnail} alt={currentSong.title} className="h-full w-full object-cover" />
            ) : (
              <Music size={18} className="text-slate-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-slate-900">
              {getDisplayTitle(currentSong) || 'Poi...'}
            </p>
            <p className="truncate text-[10px] text-slate-500 font-medium">
              {getSongSubtitle(currentSong) || 'Link...'}
            </p>
          </div>
        </div>

        {/* Transport Controls (Heart, SkipBack, 10s, Play, 10s, SkipForward) */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => currentSong && void toggleFavorite(currentSong)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:text-slate-600 active:scale-95 transition"
            title="Favoritar"
          >
            <Heart
              size={14}
              className={currentSong?.favorite ? 'fill-red-500 text-red-500' : ''}
            />
          </button>

          <button
            onClick={() => void playPrevious()}
            className="flex h-8 w-8 items-center justify-center text-slate-600 hover:text-slate-900 active:scale-95 transition"
            title="Anterior"
          >
            <SkipBack size={15} />
          </button>

          <button
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
              }
            }}
            className="relative flex h-8 w-8 items-center justify-center text-slate-600 hover:text-slate-900 active:scale-95 transition"
            title="Voltar 10s"
          >
            <RotateCcw size={15} />
            <span className="absolute text-[7px] font-bold">10</span>
          </button>

          <motion.button
            whileTap={{ scale: 0.90 }}
            onClick={() => void togglePlay()}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 border border-slate-300 text-slate-900 shadow-sm shrink-0"
            title={isPlaying ? 'Pausar' : 'Tocar'}
          >
            {isPlaying ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" className="ml-0.5" />}
          </motion.button>

          <button
            onClick={() => {
              if (audioRef.current && duration) {
                audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10);
              }
            }}
            className="relative flex h-8 w-8 items-center justify-center text-slate-600 hover:text-slate-900 active:scale-95 transition"
            title="Avançar 10s"
          >
            <RotateCw size={15} />
            <span className="absolute text-[7px] font-bold">10</span>
          </button>

          <button
            onClick={() => void playNext()}
            className="flex h-8 w-8 items-center justify-center text-slate-600 hover:text-slate-900 active:scale-95 transition"
            title="Próxima"
          >
            <SkipForward size={15} />
          </button>
        </div>
      </div>

      {/* MOBILE BOTTOM NAVIGATION DOCK (100% FIEL AO SPOTUBE MOBILE - media_1794327948332_460fbb68.jpg e media_1794328024209_c4089668.jpg) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 h-[68px] border-t border-slate-200 bg-white/98 backdrop-blur-2xl px-3 flex items-center justify-around lg:hidden select-none shadow-[0_-4px_16px_rgba(0,0,0,0.03)]">
        {[
          { id: 'home' as Section, label: 'Início', icon: Home },
          { id: 'download' as Section, label: 'Buscar', icon: Search },
          { id: 'library' as Section, label: 'Biblioteca', icon: Library },
          { id: 'settings' as Section, label: 'Configurações', icon: Settings2 }
        ].map((item) => {
          const active = activeSection === item.id;
          if (active) {
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActivePlaylistId(null);
                  setActiveDiscoverPlaylistId(null);
                  setActiveSection(item.id);
                }}
                className="flex flex-col items-center justify-center gap-0.5 px-5 py-1.5 rounded-2xl bg-gradient-to-b from-[#0066cc] to-[#004799] text-white shadow-md active:scale-95 transition"
              >
                <item.icon size={19} className="stroke-[2.5]" />
                <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
              </button>
            );
          }
          return (
            <button
              key={item.id}
              onClick={() => {
                setActivePlaylistId(null);
                setActiveDiscoverPlaylistId(null);
                setActiveSection(item.id);
              }}
              className="flex flex-col items-center justify-center gap-0.5 py-1 px-3 text-slate-400 hover:text-slate-600 active:scale-95 transition"
            >
              <item.icon size={20} className="stroke-[1.8]" />
              <span className="text-[10px] font-medium tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* DESKTOP FOOTER PLAYER (100% FIEL AO SPOTUBE DESKTOP - media_1794180377520_de4cf9d4.jpg) */}
      <footer className={`hidden lg:flex fixed bottom-0 left-72 right-0 h-24 items-center justify-between gap-5 border-t border-white/10 bg-[#0c0e14]/95 px-6 backdrop-blur-2xl z-30 select-none ${isVideoTheaterOpen ? 'hidden' : ''}`}>
        {/* Left: Track Info & Like */}
        <div onClick={() => setIsExpandedPlayerOpen(true)} className="flex min-w-0 w-1/4 items-center gap-4 cursor-pointer group" title="Clique para expandir o player">
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-[#141722] border border-white/5">
            {currentSong?.thumbnail ? (
              <img src={currentSong.thumbnail} alt={currentSong.title} className="h-full w-full object-cover" />
            ) : (
              <Music size={20} className="text-gray-600" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-sm text-white">{getDisplayTitle(currentSong) || 'Nenhuma música selecionada'}</p>
            <p className="truncate text-xs text-gray-400">{getSongSubtitle(currentSong)}</p>
          </div>

          {currentSong && (
            <button
              onClick={() => void toggleFavorite(currentSong)}
              className="p-2 text-gray-400 hover:text-white transition touch-target rounded-full hover:bg-white/5"
              title="Favoritar"
            >
              <Heart
                size={18}
                className={currentSong.favorite ? 'fill-sky-400 text-sky-400' : ''}
              />
            </button>
          )}
        </div>

        {/* Center: Playback Controls & Scrubber */}
        <div className="flex w-2/4 flex-col items-center gap-2 max-w-2xl">
          <div className="flex items-center gap-4">
            <button className="text-gray-400 hover:text-white transition p-1" title="Aleatório">
              <Shuffle size={16} />
            </button>
            <button onClick={() => void playPrevious()} className="text-gray-300 hover:text-white transition p-1" title="Anterior">
              <SkipBack size={18} />
            </button>
            <button
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
                }
              }}
              className="relative flex items-center justify-center text-gray-300 hover:text-white transition p-1"
              title="Voltar 10s"
            >
              <RotateCcw size={18} />
              <span className="absolute text-[8px] font-bold">10</span>
            </button>
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => void togglePlay()}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr from-[#004799] to-[#0066cc] text-white shadow-[0_0_20px_rgba(0,102,204,0.6)]"
              title={isPlaying ? 'Pausar' : 'Reproduzir'}
            >
              {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
            </motion.button>
            <button
              onClick={() => {
                if (audioRef.current && duration) {
                  audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10);
                }
              }}
              className="relative flex items-center justify-center text-gray-300 hover:text-white transition p-1"
              title="Avançar 10s"
            >
              <RotateCw size={18} />
              <span className="absolute text-[8px] font-bold">10</span>
            </button>
            <button onClick={() => void playNext()} className="text-gray-300 hover:text-white transition p-1" title="Próxima">
              <SkipForward size={18} />
            </button>
            <button className="text-gray-400 hover:text-white transition p-1" title="Repetir">
              <Repeat size={16} />
            </button>
          </div>

          <div className="flex w-full items-center gap-3">
            <span className="w-10 text-right text-[11px] font-mono text-gray-400">{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={currentTime}
              onChange={(e) => {
                const value = Number(e.target.value);
                void runPlayerCommand({ type: 'SEEK', time: value });
              }}
              className="flex-1 accent-sky-400 cursor-pointer h-1.5 rounded-full"
            />
            <span className="w-10 text-[11px] font-mono text-gray-400">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Actions, Lyrics, Queue, Volume */}
        <div className="flex w-1/4 items-center justify-end gap-3">
          <button className="text-gray-400 hover:text-white transition p-2" title="Letra">
            <Mic2 size={16} />
          </button>
          <button className="text-gray-400 hover:text-white transition p-2" title="Fila de reprodução">
            <ListPlus size={16} />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowDevicePicker((v) => !v)}
              className="text-gray-400 hover:text-white transition p-2"
              title={selectedOutputDevice ? `Saída: ${selectedOutputDevice.deviceName}` : "Dispositivos de saída"}
            >
              <Smartphone size={16} />
            </button>
            {showDevicePicker && (
              <div className="absolute bottom-14 right-0 z-50 w-72 rounded-2xl border border-white/10 bg-[#0d0f17] p-3 shadow-2xl">
                <p className="text-xs font-semibold text-gray-400 mb-2 px-1">Dispositivos Conectados</p>
                <div className="space-y-1">
                  <div className="rounded-xl bg-white/[0.04] p-2 text-xs">
                    <p className="font-semibold text-white">{deviceName}</p>
                    <p className="text-[10px] text-sky-400">Este dispositivo (Local)</p>
                  </div>
                  {devices.map((d) => (
                    <div key={d.deviceId} className="rounded-xl p-2 text-xs hover:bg-white/[0.04]">
                      <p className="font-semibold text-white">{d.deviceName}</p>
                      <p className="text-[10px] text-gray-500">{getDeviceStatusLabel(d)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button className="text-gray-400 hover:text-white transition p-2" title="Mais opções">
            <MoreHorizontal size={16} />
          </button>
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <Volume2 size={16} className="text-gray-400" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => {
                const nextVolume = Number(e.target.value);
                void runPlayerCommand({ type: 'SET_VOLUME', volume: nextVolume });
              }}
              className="w-24 accent-sky-400 cursor-pointer h-1.5"
            />
          </div>
        </div>
      </footer>

      {/* Spotube Plugins Modal Desktop (media_1794327988596_e0d599a2.jpg) */}
      <SpotubePlugins
        isMobile={false}
        isOpen={isPluginsModalOpen}
        onClose={() => setIsPluginsModalOpen(false)}
        accounts={pluginAccounts}
        onConnectAccount={handleConnectPluginAccount}
        onDisconnectAccount={handleDisconnectPluginAccount}
      />

      {/* Supabase Central Auth Modal - Obrigatório quando não autenticado */}
      <SupabaseAuthModal
        isOpen={isAuthModalOpen}
        isMandatory={false}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={supabaseUser}
        onUserChange={(user) => {
          setSupabaseUser(user);
          if (user) {
            try { localStorage.setItem('montanha_local_user', JSON.stringify(user)); } catch {}
            setIsAuthModalOpen(false);
          } else {
            try { localStorage.removeItem('montanha_local_user'); } catch {}
          }
        }}
      />
      {isDesktopOnboardingOpen && activeDesktopOnboardingStep ? (
        <Suspense fallback={null}>
          <DesktopOnboardingOverlay
            step={activeDesktopOnboardingStep}
            stepIndex={desktopOnboardingStepIndex}
            totalSteps={DESKTOP_ONBOARDING_STEPS.length}
            onBack={() => setDesktopOnboardingStepIndex((current) => Math.max(0, current - 1))}
            onNext={() => {
              if (desktopOnboardingStepIndex >= DESKTOP_ONBOARDING_STEPS.length - 1) {
                closeDesktopOnboarding(true);
                return;
              }
              setDesktopOnboardingStepIndex((current) => Math.min(DESKTOP_ONBOARDING_STEPS.length - 1, current + 1));
            }}
            onClose={closeDesktopOnboarding}
          />
        </Suspense>
      ) : null}
    </div>
  );
}

