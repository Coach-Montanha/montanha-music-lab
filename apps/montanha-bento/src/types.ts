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
