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
  isCustom?: boolean;
}

export interface SearchAlbum {
  id: string;
  rawId?: string | number;
  name: string;
  artist: string;
  cover: string;
  trackCount?: number;
}

export interface SearchArtist {
  id: string;
  rawId?: string | number;
  name: string;
  image: string;
  nbAlbum?: number;
  nbFan?: number;
}

export interface SearchPlaylist {
  id: string;
  rawId?: string | number;
  name: string;
  creator: string;
  cover: string;
  trackCount?: number;
}

export interface CategorizedSearchResults {
  songs: Song[];
  albums: SearchAlbum[];
  artists: SearchArtist[];
  playlists: SearchPlaylist[];
}
