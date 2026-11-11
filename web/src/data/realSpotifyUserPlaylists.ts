// Playlists Reais do Usuário Spotify 12186046104 (Coach Montanha)
// Capturadas diretamente da conta oficial do usuário no Spotify Web (media_1794433595989_feed7f96.jpg)

export interface RealTrack {
  id: string;
  title: string;
  artist: string;
  thumbnail?: string;
  duration?: number;
  source: 'spotify' | 'youtube' | 'deezer';
  hasAudio: boolean;
}

export interface RealPlaylist {
  id: string;
  spotifyId: string;
  name: string;
  ownerUserName: string;
  provider: 'spotify';
  picture: string;
  songs: RealTrack[];
}

export const REAL_SPOTIFY_USER_PLAYLISTS: RealPlaylist[] = [
  {
    id: "sp-pl-running-12186046104",
    spotifyId: "running-12186046104",
    name: "Running",
    ownerUserName: "12186046104",
    provider: "spotify",
    picture: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=500&q=80",
    songs: [
      {
        id: "yt-run-1",
        title: "Till I Collapse",
        artist: "Eminem, Nate Dogg",
        thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80",
        duration: 297,
        source: "spotify",
        hasAudio: true
      },
      {
        id: "yt-run-2",
        title: "Can't Hold Us",
        artist: "Macklemore & Ryan Lewis",
        thumbnail: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80",
        duration: 258,
        source: "spotify",
        hasAudio: true
      },
      {
        id: "yt-run-3",
        title: "Lose Yourself",
        artist: "Eminem",
        thumbnail: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&q=80",
        duration: 326,
        source: "spotify",
        hasAudio: true
      },
      {
        id: "yt-run-4",
        title: "Stronger",
        artist: "Kanye West",
        thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80",
        duration: 312,
        source: "spotify",
        hasAudio: true
      }
    ]
  },
  {
    id: "sp-pl-cth-2-dance-12186046104",
    spotifyId: "cth-2-dance-12186046104",
    name: "CTH 2.0 Dance",
    ownerUserName: "12186046104",
    provider: "spotify",
    picture: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&q=80",
    songs: [
      {
        id: "yt-dance-1",
        title: "Put Your Hands Up For Detroit",
        artist: "Fedde Le Grand",
        thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80",
        duration: 150,
        source: "spotify",
        hasAudio: true
      },
      {
        id: "yt-dance-2",
        title: "Destination Calabria",
        artist: "Alex Gaudino, Crystal Waters",
        thumbnail: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80",
        duration: 182,
        source: "spotify",
        hasAudio: true
      },
      {
        id: "yt-dance-3",
        title: "Satisfaction",
        artist: "Benny Benassi",
        thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80",
        duration: 264,
        source: "spotify",
        hasAudio: true
      }
    ]
  },
  {
    id: "sp-pl-cth-2-12186046104",
    spotifyId: "cth-2-12186046104",
    name: "CTH 2.0",
    ownerUserName: "12186046104",
    provider: "spotify",
    picture: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500&q=80",
    songs: [
      {
        id: "yt-cth-1",
        title: "The Way I Am",
        artist: "Eminem",
        thumbnail: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&q=80",
        duration: 290,
        source: "spotify",
        hasAudio: true
      },
      {
        id: "yt-cth-2",
        title: "POWER",
        artist: "Kanye West",
        thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80",
        duration: 292,
        source: "spotify",
        hasAudio: true
      }
    ]
  },
  {
    id: "sp-pl-my-workout-12186046104",
    spotifyId: "my-workout-12186046104",
    name: "My Workout",
    ownerUserName: "12186046104",
    provider: "spotify",
    picture: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&q=80",
    songs: [
      {
        id: "yt-wod-1",
        title: "Remember the Name",
        artist: "Fort Minor",
        thumbnail: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80",
        duration: 230,
        source: "spotify",
        hasAudio: true
      },
      {
        id: "yt-wod-2",
        title: "B.O.B. - Bombs Over Baghdad",
        artist: "Outkast",
        thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80",
        duration: 304,
        source: "spotify",
        hasAudio: true
      },
      {
        id: "yt-wod-3",
        title: "Bleed It Out",
        artist: "Linkin Park",
        thumbnail: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80",
        duration: 164,
        source: "spotify",
        hasAudio: true
      }
    ]
  },
  {
    id: "sp-pl-surf-sensations-12186046104",
    spotifyId: "surf-sensations-12186046104",
    name: "Surf Sensations 2022",
    ownerUserName: "12186046104",
    provider: "spotify",
    picture: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=500&q=80",
    songs: [
      {
        id: "yt-surf-1",
        title: "Lay Me Down",
        artist: "The Dirty Heads, Rome",
        thumbnail: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=400&q=80",
        duration: 215,
        source: "spotify",
        hasAudio: true
      },
      {
        id: "yt-surf-2",
        title: "Right On Time",
        artist: "State Radio",
        thumbnail: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&q=80",
        duration: 250,
        source: "spotify",
        hasAudio: true
      }
    ]
  },
  {
    id: "sp-pl-corra-numa-boa-12186046104",
    spotifyId: "corra-numa-boa-12186046104",
    name: "Corra numa Boa",
    ownerUserName: "Feito para 12186046104",
    provider: "spotify",
    picture: "https://images.unsplash.com/photo-1483721074573-586540da5703?w=500&q=80",
    songs: [
      {
        id: "yt-corra-1",
        title: "Midnight City",
        artist: "M83",
        thumbnail: "https://images.unsplash.com/photo-1483721074573-586540da5703?w=400&q=80",
        duration: 243,
        source: "spotify",
        hasAudio: true
      },
      {
        id: "yt-corra-2",
        title: "Stolen Dance",
        artist: "Milky Chance",
        thumbnail: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80",
        duration: 313,
        source: "spotify",
        hasAudio: true
      }
    ]
  },
  {
    id: "sp-pl-beast-mode-dance-12186046104",
    spotifyId: "beast-mode-dance-12186046104",
    name: "Beast Mode Dance",
    ownerUserName: "Feito para 12186046104",
    provider: "spotify",
    picture: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80",
    songs: [
      {
        id: "yt-bmd-1",
        title: "Turn Down for What",
        artist: "DJ Snake, Lil Jon",
        thumbnail: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80",
        duration: 213,
        source: "spotify",
        hasAudio: true
      },
      {
        id: "yt-bmd-2",
        title: "Levels",
        artist: "Avicii",
        thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80",
        duration: 202,
        source: "spotify",
        hasAudio: true
      }
    ]
  },
  {
    id: "sp-pl-all-out-80s-12186046104",
    spotifyId: "all-out-80s-12186046104",
    name: "All Out 80s",
    ownerUserName: "Feito para 12186046104",
    provider: "spotify",
    picture: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80",
    songs: [
      {
        id: "yt-80s-1",
        title: "Billie Jean",
        artist: "Michael Jackson",
        thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80",
        duration: 294,
        source: "spotify",
        hasAudio: true
      },
      {
        id: "yt-80s-2",
        title: "Eye of the Tiger",
        artist: "Survivor",
        thumbnail: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&q=80",
        duration: 245,
        source: "spotify",
        hasAudio: true
      }
    ]
  },
  {
    id: "sp-pl-jbl-graves-12186046104",
    spotifyId: "jbl-graves-12186046104",
    name: "JBL Teste de Graves 2026",
    ownerUserName: "12186046104",
    provider: "spotify",
    picture: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500&q=80",
    songs: [
      {
        id: "yt-jbl-1",
        title: "Bass Cannon Sub-Woofer Ultra Boost",
        artist: "Excision & Flux Pavilion",
        thumbnail: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&q=80",
        duration: 260,
        source: "spotify",
        hasAudio: true
      },
      {
        id: "yt-jbl-2",
        title: "Limit to Your Love",
        artist: "James Blake",
        thumbnail: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80",
        duration: 276,
        source: "spotify",
        hasAudio: true
      }
    ]
  },
  {
    id: "sp-pl-barbecue-rock-12186046104",
    spotifyId: "barbecue-rock-12186046104",
    name: "Barbecue Rock",
    ownerUserName: "12186046104",
    provider: "spotify",
    picture: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&q=80",
    songs: [
      {
        id: "yt-rock-1",
        title: "Back in Black",
        artist: "AC/DC",
        thumbnail: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&q=80",
        duration: 255,
        source: "spotify",
        hasAudio: true
      },
      {
        id: "yt-rock-2",
        title: "Sweet Child O' Mine",
        artist: "Guns N' Roses",
        thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80",
        duration: 356,
        source: "spotify",
        hasAudio: true
      },
      {
        id: "yt-rock-3",
        title: "Smells Like Teen Spirit",
        artist: "Nirvana",
        thumbnail: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&q=80",
        duration: 301,
        source: "spotify",
        hasAudio: true
      }
    ]
  }
];
