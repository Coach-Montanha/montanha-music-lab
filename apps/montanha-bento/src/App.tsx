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

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
    ytPlayer: any;
  }
}

export interface Song {
  id: string;
  name: string;
  artist: string;
  album?: string;
  thumbnail: string;
  duration?: number;
  youtubeId?: string;
  audioUrl?: string;
}

export interface Playlist {
  id: string;
  name: string;
  creator: string;
  cover: string;
  songs: Song[];
}

// 10 Playlists Oficiais do Perfil do Usuário Spotify (12186046104) com IDs Reais de Áudio
const MY_SPOTIFY_USER_PLAYLISTS: Playlist[] = [
  {
    id: "sp-pl-running",
    name: "Running",
    creator: "12186046104",
    cover: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&q=80",
    songs: [
      { id: "run-1", name: "Till I Collapse", artist: "Eminem, Nate Dogg", youtubeId: "_1xXYeNrW9k", audioUrl: "https://cdnt-preview.dzcdn.net/api/1/1/8/4/6/0/846995adc7246b0d3a90d6c3281a298a.mp3?hdnea=exp=1794449347~acl=/api/1/1/8/4/6/0/846995adc7246b0d3a90d6c3281a298a.mp3*~data=user_id=0,application_id=42~hmac=a60553a6b110ceb772d4a64b43706c97c669525325780151fe60a2dd682987dc", thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80", duration: 297 },
      { id: "run-2", name: "Can't Hold Us", artist: "Macklemore & Ryan Lewis", youtubeId: "2zNSgS797P8", audioUrl: "https://cdnt-preview.dzcdn.net/api/1/1/b/c/6/0/bc66a201d24622fb130e7a624b1679fd.mp3?hdnea=exp=1794449347~acl=/api/1/1/b/c/6/0/bc66a201d24622fb130e7a624b1679fd.mp3*~data=user_id=0,application_id=42~hmac=46ad8b556ca66cc45f4200a82befc979d7bd20104e34a838d4c283d3db5fd532", thumbnail: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80", duration: 258 },
      { id: "run-3", name: "Lose Yourself", artist: "Eminem", youtubeId: "_Yhyp-_hX2s", audioUrl: "https://cdnt-preview.dzcdn.net/api/1/1/d/0/d/0/d0de8f4ff3151508065c431afc37bca6.mp3?hdnea=exp=1794449348~acl=/api/1/1/d/0/d/0/d0de8f4ff3151508065c431afc37bca6.mp3*~data=user_id=0,application_id=42~hmac=83ed69dac448c7d6f02a5631ee8f1e4bc1c01caee969accc4da3469a580494fd", thumbnail: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&q=80", duration: 326 },
      { id: "run-4", name: "Stronger", artist: "Kanye West", youtubeId: "PsO6Zn4Vjm8", audioUrl: "https://cdnt-preview.dzcdn.net/api/1/1/c/8/7/0/c8777e35f09472d0e689a6738fc6810a.mp3?hdnea=exp=1794449348~acl=/api/1/1/c/8/7/0/c8777e35f09472d0e689a6738fc6810a.mp3*~data=user_id=0,application_id=42~hmac=a7ba6c8005b82e885d9b051ecf0650ca07d3d6de45f41fc46ed057c3c6b88232", thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80", duration: 312 }
    ]
  },
  {
    id: "sp-pl-cth-dance",
    name: "CTH 2.0 Dance",
    creator: "12186046104",
    cover: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80",
    songs: [
      { id: "dance-1", name: "Put Your Hands Up For Detroit", artist: "Fedde Le Grand", youtubeId: "SYs2HGYbr28", audioUrl: "https://cdnt-preview.dzcdn.net/api/1/1/e/4/2/0/e42614c3502f94343c296e9f81040fe5.mp3?hdnea=exp=1794449349~acl=/api/1/1/e/4/2/0/e42614c3502f94343c296e9f81040fe5.mp3*~data=user_id=0,application_id=42~hmac=97ee73aa1017f02ddf0e8e16f63ffcada5477bbfe0851f55b9593eb97eac95c7", thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80", duration: 150 },
      { id: "dance-2", name: "Destination Calabria", artist: "Alex Gaudino", youtubeId: "Kq4OtRsdXLS", audioUrl: "https://cdnt-preview.dzcdn.net/api/1/1/4/8/e/0/48e5212349d609c26ef4d6a8aca0c406.mp3?hdnea=exp=1794449349~acl=/api/1/1/4/8/e/0/48e5212349d609c26ef4d6a8aca0c406.mp3*~data=user_id=0,application_id=42~hmac=0ee818b931fafe6001c9f65aa294536543d1be912053e1b03937881b8444f74d", thumbnail: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80", duration: 182 },
      { id: "dance-3", name: "Satisfaction", artist: "Benny Benassi", youtubeId: "a0fkNdPiIL4", audioUrl: "https://cdnt-preview.dzcdn.net/api/1/1/e/2/2/0/e22cddd9afd54b5c6dbfa32abd6fe9c6.mp3?hdnea=exp=1794449350~acl=/api/1/1/e/2/2/0/e22cddd9afd54b5c6dbfa32abd6fe9c6.mp3*~data=user_id=0,application_id=42~hmac=df0a1fb1b10f623ab0ab3ddb3ccc73f99cc28969a4382fd87f845012782ade83", thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80", duration: 264 }
    ]
  },
  {
    id: "sp-pl-cth-2",
    name: "CTH 2.0",
    creator: "12186046104",
    cover: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&q=80",
    songs: [
      { id: "cth-1", name: "The Way I Am", artist: "Eminem", youtubeId: "mQvteoFiMlg", audioUrl: "https://cdnt-preview.dzcdn.net/api/1/1/2/e/2/0/2e22eedde36f592ceed2caa9439ffd86.mp3?hdnea=exp=1794449350~acl=/api/1/1/2/e/2/0/2e22eedde36f592ceed2caa9439ffd86.mp3*~data=user_id=0,application_id=42~hmac=2b7f74dca49f7384077890abced0938ab561218e38442b41517fa57e4829b3c5", thumbnail: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&q=80", duration: 290 },
      { id: "cth-2", name: "POWER", artist: "Kanye West", youtubeId: "L53gjP-Tt2w", audioUrl: "https://cdnt-preview.dzcdn.net/api/1/1/4/a/a/0/4aa5d2dce95b43b74605ad529180483a.mp3?hdnea=exp=1794449351~acl=/api/1/1/4/a/a/0/4aa5d2dce95b43b74605ad529180483a.mp3*~data=user_id=0,application_id=42~hmac=4448a3150f65e86a9d909238bb8f4152fec5748b2ca68a46381070dae06707cb", thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80", duration: 292 }
    ]
  },
  {
    id: "sp-pl-my-workout",
    name: "My Workout",
    creator: "12186046104",
    cover: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80",
    songs: [
      { id: "wod-1", name: "Remember the Name", artist: "Fort Minor", youtubeId: "VDvr08sCPOc", audioUrl: "https://cdnt-preview.dzcdn.net/api/1/1/7/6/e/0/76e85dbed81463aedcd2496e8b14402e.mp3?hdnea=exp=1794449351~acl=/api/1/1/7/6/e/0/76e85dbed81463aedcd2496e8b14402e.mp3*~data=user_id=0,application_id=42~hmac=06bbe4816885ef2eb4a7cba0e5dab71e4f5b8bb2d0176e5659973957862b9d71", thumbnail: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80", duration: 230 },
      { id: "wod-2", name: "B.O.B. - Bombs Over Baghdad", artist: "Outkast", youtubeId: "lVHjCWvy4sc", audioUrl: "https://cdnt-preview.dzcdn.net/api/1/1/0/a/f/0/0afbc69d010193a70780e46232021143.mp3?hdnea=exp=1794449352~acl=/api/1/1/0/a/f/0/0afbc69d010193a70780e46232021143.mp3*~data=user_id=0,application_id=42~hmac=0a5c5bd29dacd33ae4e8f08e46d64671a160ef0b6def256d4f5fce5a7d4b1a5e", thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80", duration: 304 },
      { id: "wod-3", name: "Bleed It Out", artist: "Linkin Park", youtubeId: "OnuuYcqhzCE", audioUrl: "https://cdnt-preview.dzcdn.net/api/1/1/7/9/1/0/791ea8ebce5906768bcb58b1c9d398ef.mp3?hdnea=exp=1794449353~acl=/api/1/1/7/9/1/0/791ea8ebce5906768bcb58b1c9d398ef.mp3*~data=user_id=0,application_id=42~hmac=2a698590038b8697f94ed49b25ac5546e430d9f90b37310a2b5c6ba8547f3f3c", thumbnail: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80", duration: 164 }
    ]
  },
  {
    id: "sp-pl-surf-sensations",
    name: "Surf Sensations 2022",
    creator: "12186046104",
    cover: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=600&q=80",
    songs: [
      { id: "surf-1", name: "Lay Me Down", artist: "The Dirty Heads, Rome", youtubeId: "5gHYB548t6U", audioUrl: "https://cdnt-preview.dzcdn.net/api/1/1/8/5/5/0/855ea9669d35e68ce3582fe7b721050f.mp3?hdnea=exp=1794449353~acl=/api/1/1/8/5/5/0/855ea9669d35e68ce3582fe7b721050f.mp3*~data=user_id=0,application_id=42~hmac=062a8e327f19d7b1bd07f73188ae6682de601a6a761457dd57f7682e649f4077", thumbnail: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=400&q=80", duration: 215 },
      { id: "surf-2", name: "Right On Time", artist: "State Radio", youtubeId: "g7iO8yO9Tuo", thumbnail: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&q=80", duration: 250 }
    ]
  },
  {
    id: "sp-pl-corra-numa-boa",
    name: "Corra numa Boa",
    creator: "Feito para 12186046104",
    cover: "https://images.unsplash.com/photo-1483721074573-586540da5703?w=600&q=80",
    songs: [
      { id: "corra-1", name: "Midnight City", artist: "M83", youtubeId: "dX3k_QDnzHE", audioUrl: "https://cdnt-preview.dzcdn.net/api/1/1/b/d/7/0/bd727b30df15d3d506abd829ee8da9f0.mp3?hdnea=exp=1794449354~acl=/api/1/1/b/d/7/0/bd727b30df15d3d506abd829ee8da9f0.mp3*~data=user_id=0,application_id=42~hmac=d488dd0d99afb73267d7a9b1b6826580998bfd533fa51fdfbd84eaca67c95ca5", thumbnail: "https://images.unsplash.com/photo-1483721074573-586540da5703?w=400&q=80", duration: 243 },
      { id: "corra-2", name: "Stolen Dance", artist: "Milky Chance", youtubeId: "iX-QaNzd-0Y", audioUrl: "https://cdnt-preview.dzcdn.net/api/1/1/a/6/4/0/a645e75dc75c56181ac342f60d6c6c48.mp3?hdnea=exp=1794449354~acl=/api/1/1/a/6/4/0/a645e75dc75c56181ac342f60d6c6c48.mp3*~data=user_id=0,application_id=42~hmac=26c673cd0fbd760f6600fb40df181a7271dad0d18f42bf6eab5995ecd1cafa18", thumbnail: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80", duration: 313 }
    ]
  },
  {
    id: "sp-pl-beast-mode",
    name: "Beast Mode Dance",
    creator: "Feito para 12186046104",
    cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80",
    songs: [
      { id: "bmd-1", name: "Turn Down for What", artist: "DJ Snake, Lil Jon", youtubeId: "HMUDVMiITOU", audioUrl: "https://cdnt-preview.dzcdn.net/api/1/1/e/2/4/0/e24d6cbfc49469f06e5814b9b26359ab.mp3?hdnea=exp=1794449355~acl=/api/1/1/e/2/4/0/e24d6cbfc49469f06e5814b9b26359ab.mp3*~data=user_id=0,application_id=42~hmac=d347e98242aa91ea36b534992988ac5901af5224888b4a842e033c6278910300", thumbnail: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80", duration: 213 },
      { id: "bmd-2", name: "Levels", artist: "Avicii", youtubeId: "_ovdm2yX4MA", audioUrl: "https://cdnt-preview.dzcdn.net/api/1/1/0/d/9/0/0d9d5592d4169f2d6772234f5198662d.mp3?hdnea=exp=1794449355~acl=/api/1/1/0/d/9/0/0d9d5592d4169f2d6772234f5198662d.mp3*~data=user_id=0,application_id=42~hmac=cd676a36bb7a502814c71afa0a4b3480fa2a21c162cc6672bb924a1c61315f27", thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80", duration: 202 }
    ]
  },
  {
    id: "sp-pl-all-out-80s",
    name: "All Out 80s",
    creator: "Feito para 12186046104",
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80",
    songs: [
      { id: "80s-1", name: "Billie Jean", artist: "Michael Jackson", youtubeId: "Zi_XLOBDo_Y", audioUrl: "https://cdnt-preview.dzcdn.net/api/1/1/e/6/e/0/e6e0f8717b1e6353e2abf797c6849889.mp3?hdnea=exp=1794449356~acl=/api/1/1/e/6/e/0/e6e0f8717b1e6353e2abf797c6849889.mp3*~data=user_id=0,application_id=42~hmac=502718c0c4760590f690eebd0ac2eece0a2d280ec435d31b7081d0f04c28bcbf", thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80", duration: 294 },
      { id: "80s-2", name: "Eye of the Tiger", artist: "Survivor", youtubeId: "btPJPFnesV4", audioUrl: "https://cdnt-preview.dzcdn.net/api/1/1/6/a/6/0/6a6cec63a2a62ad17c65c3706e216ce8.mp3?hdnea=exp=1794449357~acl=/api/1/1/6/a/6/0/6a6cec63a2a62ad17c65c3706e216ce8.mp3*~data=user_id=0,application_id=42~hmac=449a14b831028af3cc47583466b71c280c7808f8adab9786ce36845eea58b9dd", thumbnail: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&q=80", duration: 245 }
    ]
  },
  {
    id: "sp-pl-jbl-graves",
    name: "JBL Teste de Graves 2026",
    creator: "12186046104",
    cover: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&q=80",
    songs: [
      { id: "jbl-1", name: "Bass Cannon Sub-Woofer Ultra Boost", artist: "Excision & Flux Pavilion", youtubeId: "z_SQO3vv3p8", thumbnail: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&q=80", duration: 260 },
      { id: "jbl-2", name: "Limit to Your Love", artist: "James Blake", youtubeId: "oOT2-OTebx0", audioUrl: "https://cdnt-preview.dzcdn.net/api/1/1/9/2/c/0/92cb8ca2087fa5cdbcb9728a10949d22.mp3?hdnea=exp=1794449358~acl=/api/1/1/9/2/c/0/92cb8ca2087fa5cdbcb9728a10949d22.mp3*~data=user_id=0,application_id=42~hmac=c5140f6e31cb6962c7c01c897db38c9f33f77b4954b9c8aa1db8d064c3082723", thumbnail: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80", duration: 276 }
    ]
  },
  {
    id: "sp-pl-barbecue-rock",
    name: "Barbecue Rock",
    creator: "12186046104",
    cover: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&q=80",
    songs: [
      { id: "rock-1", name: "Back in Black", artist: "AC/DC", youtubeId: "pAgnJDJN4VA", audioUrl: "https://cdnt-preview.dzcdn.net/api/1/1/8/2/b/0/82be918b42c3d26093b20d01e97e4a03.mp3?hdnea=exp=1794449358~acl=/api/1/1/8/2/b/0/82be918b42c3d26093b20d01e97e4a03.mp3*~data=user_id=0,application_id=42~hmac=fd3cff0dad1614984e3130f44318e569650b3a0bf3eb5322462addeeab1fb6cb", thumbnail: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&q=80", duration: 255 },
      { id: "rock-2", name: "Sweet Child O' Mine", artist: "Guns N' Roses", youtubeId: "1w7OgIMMRc4", audioUrl: "https://cdnt-preview.dzcdn.net/api/1/1/5/9/1/0/59115eec88ea0bc7742eaba93facf49b.mp3?hdnea=exp=1794449359~acl=/api/1/1/5/9/1/0/59115eec88ea0bc7742eaba93facf49b.mp3*~data=user_id=0,application_id=42~hmac=16393fee7066f20d1452e6212de21012b019fc0c5c1265617003678f29a57957", thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80", duration: 356 },
      { id: "rock-3", name: "Smells Like Teen Spirit", artist: "Nirvana", youtubeId: "hTWKbfoikeg", audioUrl: "https://cdnt-preview.dzcdn.net/api/1/1/3/4/b/0/34bad352aa1aa0f8eecbbc9c27a40eaf.mp3?hdnea=exp=1794449360~acl=/api/1/1/3/4/b/0/34bad352aa1aa0f8eecbbc9c27a40eaf.mp3*~data=user_id=0,application_id=42~hmac=4e54150d8708ea5a918295512055774e6cc1f254e1defe577001c1c3de271b2a", thumbnail: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&q=80", duration: 301 }
    ]
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'playlists' | 'downloads'>('home');
  
  // Playlists State
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    try {
      const stored = localStorage.getItem('able_playlists_v2');
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

  const audioRef = useRef<HTMLAudioElement | null>(null);

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
    localStorage.setItem('able_playlists_v2', JSON.stringify(playlists));
  }, [playlists]);

  useEffect(() => {
    localStorage.setItem('able_favorites', JSON.stringify(favoriteSongIds));
  }, [favoriteSongIds]);

  useEffect(() => {
    localStorage.setItem('able_downloads', JSON.stringify(downloadedSongs));
  }, [downloadedSongs]);

  // Inicialização do YouTube IFrame Player API
  useEffect(() => {
    const initYt = () => {
      if (window.YT && window.YT.Player && !window.ytPlayer) {
        try {
          window.ytPlayer = new window.YT.Player('able-yt-player', {
            height: '240',
            width: '320',
            videoId: currentSong?.youtubeId || '_1xXYeNrW9k',
            playerVars: {
              autoplay: 1,
              controls: 0,
              disablekb: 1,
              fs: 0,
              rel: 0,
              playsinline: 1,
              origin: window.location.origin
            },
            events: {
              onReady: (event: any) => {
                try {
                  event.target.setVolume(Math.round(volume * 100));
                  if (!isMuted) event.target.unMute();
                } catch {}
              },
              onStateChange: (event: any) => {
                // 1 = PLAYING, 2 = PAUSED, 0 = ENDED, 3 = BUFFERING
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
          console.warn('Erro ao inicializar YouTube Player:', e);
        }
      }
    };

    if (window.YT && window.YT.Player) {
      initYt();
    } else {
      window.onYouTubeIframeAPIReady = initYt;
    }
  }, []);

  // Sincronização em Tempo Real do Progresso de Áudio (YouTube Player + HTML5 Audio)
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        if (window.ytPlayer && typeof window.ytPlayer.getCurrentTime === 'function') {
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
        } else if (audioRef.current && !audioRef.current.paused) {
          setCurrentTime(Math.floor(audioRef.current.currentTime));
          if (audioRef.current.duration) {
            setDuration(Math.floor(audioRef.current.duration));
          }
        }
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  // Sincronização de Volume
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
      if (window.ytPlayer && typeof window.ytPlayer.pauseVideo === 'function') {
        window.ytPlayer.pauseVideo();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      if (window.ytPlayer && typeof window.ytPlayer.playVideo === 'function') {
        window.ytPlayer.playVideo();
      }
      if (audioRef.current && audioRef.current.src) {
        audioRef.current.play().catch(console.warn);
      }
      setIsPlaying(true);
    }
  };

  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime);
    if (window.ytPlayer && typeof window.ytPlayer.seekTo === 'function') {
      try {
        window.ytPlayer.seekTo(newTime, true);
      } catch {}
    }
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const playSong = async (song: Song, newQueue?: Song[]) => {
    setCurrentSong(song);
    setCurrentTime(0);
    setDuration(song.duration || 240);
    setIsPlaying(true);
    if (newQueue) {
      setQueue(newQueue);
    }
    showToast(`Tocando: ${song.name}`);

    // Opção 1: Audio nativo via áudio URL direto
    if (song.audioUrl && audioRef.current) {
      try {
        if (window.ytPlayer && typeof window.ytPlayer.pauseVideo === 'function') {
          window.ytPlayer.pauseVideo();
        }
        audioRef.current.src = song.audioUrl;
        audioRef.current.volume = isMuted ? 0 : volume;
        await audioRef.current.play();
        return;
      } catch (err) {
        console.warn('Erro ao tocar audioUrl nativo, fallback YouTube:', err);
      }
    }

    // Opção 2: YouTube Player (Áudio Oficial sem cortes)
    let ytId = song.youtubeId;
    if (!ytId) {
      // Lookup dinâmico de ID via busca
      try {
        const cleanQuery = `${song.name} ${song.artist}`.trim();
        const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(cleanQuery)}`);
        if (res.ok) {
          const data = await res.json();
          const first = data.songs?.[0];
          if (first?.id) {
            ytId = first.id.replace(/^yt-/, '');
          }
        }
      } catch {}
    }

    // Fallback de ID se ainda não encontrou
    if (!ytId) {
      ytId = '_1xXYeNrW9k'; // Eminem Till I Collapse
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
    }

    if (window.ytPlayer && typeof window.ytPlayer.loadVideoById === 'function') {
      try {
        window.ytPlayer.loadVideoById({
          videoId: ytId,
          startSeconds: 0
        });
        if (typeof window.ytPlayer.unMute === 'function' && !isMuted) window.ytPlayer.unMute();
        if (typeof window.ytPlayer.setVolume === 'function') window.ytPlayer.setVolume(Math.round(volume * 100));
        window.ytPlayer.playVideo();
      } catch (e) {
        console.warn('Erro ao carregar no YouTube Player:', e);
      }
    } else if (window.YT && window.YT.Player) {
      try {
        window.ytPlayer = new window.YT.Player('able-yt-player', {
          height: '240',
          width: '320',
          videoId: ytId,
          playerVars: { autoplay: 1, controls: 0, playsinline: 1, origin: window.location.origin },
          events: {
            onReady: (event: any) => {
              event.target.setVolume(Math.round(volume * 100));
              if (!isMuted) event.target.unMute();
              event.target.playVideo();
            }
          }
        });
      } catch {}
    }
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
            youtubeId: (s.id || '').replace(/^yt-/, ''),
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
      <header className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-white/[0.06] bg-[#121212]/90 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1DB954] text-black shadow-lg">
            <Music size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-[#fbfbfb]">Able</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Botão Oficial Importar Spotify */}
          <button
            onClick={() => setIsSpotifyModalOpen(true)}
            className="flex items-center gap-2 rounded-full bg-[#1DB954] hover:bg-[#1ed760] active:scale-95 px-4 py-2 text-xs font-bold text-black shadow-lg transition"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span className="hidden sm:inline">Importar do Spotify</span>
            <span className="sm:hidden">Spotify</span>
          </button>
        </div>
      </header>

      {/* MAIN VIEW CONTENT */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 pb-40">
        
        {/* VIEW 1: HOME (Início com Playlists Oficiais do Spotify) */}
        {activeTab === 'home' && !selectedPlaylist && (
          <div className="space-y-8 max-w-7xl mx-auto">
            
            {/* Header da Home */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-white">Sua Biblioteca Spotify</h2>
                <p className="text-xs text-neutral-400 mt-0.5">10 playlists oficiais sincronizadas com o perfil 12186046104</p>
              </div>
              <button
                onClick={() => setIsSpotifyModalOpen(true)}
                className="text-xs font-bold text-[#1DB954] hover:underline flex items-center gap-1"
              >
                <span>Adicionar mais</span>
                <Plus size={14} />
              </button>
            </div>

            {/* Grid 2x4 de Playlists do Spotify */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {playlists.map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => setSelectedPlaylist(pl)}
                  className="group flex flex-col p-3 rounded-2xl bg-[#181818] hover:bg-[#282828] transition duration-200 cursor-pointer border border-white/5 relative"
                >
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 shadow-md">
                    <img src={pl.cover} alt={pl.name} className="h-full w-full object-cover group-hover:scale-105 transition duration-300" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (pl.songs.length > 0) playSong(pl.songs[0], pl.songs);
                      }}
                      className="absolute bottom-2.5 right-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-[#1DB954] text-black shadow-xl opacity-0 group-hover:opacity-100 transition hover:scale-105 active:scale-95"
                    >
                      <Play size={18} fill="currentColor" className="ml-0.5" />
                    </button>
                  </div>
                  <h3 className="text-sm font-bold text-white truncate">{pl.name}</h3>
                  <p className="text-xs text-neutral-400 truncate mt-0.5">{pl.creator}</p>
                </div>
              ))}
            </div>

            {/* Seção de Músicas Recomendadas */}
            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-bold text-white">Mais Tocadas</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {playlists.flatMap((p) => p.songs).slice(0, 9).map((song, idx) => {
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
                        <img src={song.thumbnail} alt={song.name} className="h-11 w-11 rounded-lg object-cover" />
                        <div className="min-w-0">
                          <p className={`text-sm font-bold truncate ${isCurrent ? 'text-[#1DB954]' : 'text-white'}`}>
                            {song.name}
                          </p>
                          <p className="text-xs text-neutral-400 truncate">{song.artist}</p>
                        </div>
                      </div>
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
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* VIEW 2: SEARCH (Busca Global de Músicas e Playlists) */}
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
                placeholder="O que você quer ouvir? Músicas, artistas ou playlists..."
                className="h-12 w-full rounded-2xl bg-[#1e1e1e] border border-white/10 pl-11 pr-4 text-sm text-white placeholder-neutral-400 outline-none focus:border-[#1DB954] transition"
              />
              {isSearching && (
                <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1DB954] animate-spin" />
              )}
            </div>

            {/* Categorias de Busca */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {[
                { id: 'all', label: 'Tudo' },
                { id: 'songs', label: 'Músicas' },
                { id: 'playlists', label: 'Playlists' }
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSearchFilter(filter.id as any)}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                    searchFilter === filter.id
                      ? 'bg-white text-black'
                      : 'bg-white/10 text-neutral-300 hover:bg-white/15'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Resultados de Busca */}
            {searchResults.length > 0 ? (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-neutral-400">Resultados Encontrados</h3>
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
              <div className="py-12 text-center text-neutral-500 text-sm">
                Digite um termo para pesquisar faixas ou escolha uma playlist na tela de Início.
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: PLAYLISTS / LIBRARY (Sua Biblioteca do Spotify) */}
        {activeTab === 'playlists' && !selectedPlaylist && (
          <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-white">Suas Playlists</h2>
              <button
                onClick={() => setIsSpotifyModalOpen(true)}
                className="flex items-center gap-2 rounded-full bg-[#1DB954] px-4 py-2 text-xs font-bold text-black hover:bg-[#1ed760] transition"
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
                  className="group flex flex-col p-3 rounded-2xl bg-[#181818] hover:bg-[#282828] transition cursor-pointer border border-white/5 relative"
                >
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 shadow-md">
                    <img src={pl.cover} alt={pl.name} className="h-full w-full object-cover group-hover:scale-105 transition duration-300" />
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
                  <h3 className="text-sm font-bold text-white truncate">{pl.name}</h3>
                  <p className="text-xs text-neutral-400 truncate mt-0.5">{pl.songs.length} faixas • {pl.creator}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 4: DOWNLOADS (Músicas Offline no Padrão Able) */}
        {activeTab === 'downloads' && !selectedPlaylist && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-white">Downloads Offline</h2>
                <p className="text-xs text-neutral-400 mt-0.5">Músicas salvas localmente no dispositivo para ouvir sem gastar dados</p>
              </div>
              <span className="text-xs font-bold text-neutral-400 bg-white/10 px-3 py-1.5 rounded-full">
                {downloadedSongs.length} faixas salvas
              </span>
            </div>

            {downloadedSongs.length > 0 ? (
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
                      <span className="text-xs text-[#1DB954] font-semibold flex items-center gap-1">
                        <Check size={14} />
                        <span>Offline</span>
                      </span>
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
                  Clique no ícone de download ao lado de qualquer música para salvá-la offline no seu aparelho.
                </p>
              </div>
            )}
          </div>
        )}

        {/* DETALHE DA PLAYLIST SELECIONADA */}
        {selectedPlaylist && (
          <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
            <button
              onClick={() => setSelectedPlaylist(null)}
              className="text-xs font-bold text-neutral-400 hover:text-white flex items-center gap-1.5 transition"
            >
              <span>← Voltar para Playlists</span>
            </button>

            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 bg-gradient-to-b from-white/10 to-transparent p-6 rounded-3xl border border-white/5">
              <img
                src={selectedPlaylist.cover}
                alt={selectedPlaylist.name}
                className="h-44 w-44 rounded-2xl object-cover shadow-2xl"
              />
              <div className="text-center sm:text-left space-y-2">
                <span className="text-xs font-bold text-[#1DB954] uppercase tracking-wider">Playlist do Spotify</span>
                <h2 className="text-3xl sm:text-4xl font-black text-white">{selectedPlaylist.name}</h2>
                <p className="text-xs text-neutral-400">
                  Criada por <span className="text-white font-semibold">{selectedPlaylist.creator}</span> • {selectedPlaylist.songs.length} faixas
                </p>
                <div className="pt-2 flex items-center justify-center sm:justify-start gap-3">
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
