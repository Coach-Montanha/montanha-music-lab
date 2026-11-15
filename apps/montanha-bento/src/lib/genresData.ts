import { Song, SearchAlbum, SearchArtist, SearchPlaylist } from '../types';

export interface GenreThemedPlaylist {
  id: string;
  name: string;
  creator: string;
  cover: string;
  trackCount: number;
  gradient?: string;
  tracks?: Song[];
}

export interface GenreCategory {
  id: string;
  name: string;
  gradient: string; // CSS linear-gradient
  glowColor: string; // for shadows/glows
  tagline: string;
  topTracks: Song[];
  playlists: GenreThemedPlaylist[];
  albums: SearchAlbum[];
  artists: SearchArtist[];
}

export const GENRES_CATALOG: GenreCategory[] = [
  {
    id: 'rock',
    name: 'Rock',
    gradient: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
    glowColor: 'rgba(37, 99, 235, 0.4)',
    tagline: 'Clássicos mundiais, guitarras marcantes e hinos imortais',
    topTracks: [
      {
        id: 'rock-1',
        name: "Sweet Child O' Mine",
        artist: "Guns N' Roses",
        album: 'Appetite For Destruction',
        thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
        duration: 356
      },
      {
        id: 'rock-2',
        name: "Livin' On A Prayer",
        artist: 'Bon Jovi',
        album: 'Slippery When Wet',
        thumbnail: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80',
        duration: 249
      },
      {
        id: 'rock-3',
        name: 'Smells Like Teen Spirit',
        artist: 'Nirvana',
        album: 'Nevermind',
        thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
        duration: 301
      },
      {
        id: 'rock-4',
        name: 'Down with the Sickness',
        artist: 'Disturbed',
        album: 'The Sickness',
        thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
        duration: 278
      },
      {
        id: 'rock-5',
        name: 'Back In Black',
        artist: 'AC/DC',
        album: 'Back In Black',
        thumbnail: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80',
        duration: 255
      },
      {
        id: 'rock-6',
        name: 'In the End',
        artist: 'Linkin Park',
        album: 'Hybrid Theory',
        thumbnail: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=600&auto=format&fit=crop&q=80',
        duration: 216
      },
      {
        id: 'rock-7',
        name: 'Anjos (Pra quem tem fé)',
        artist: 'O Rappa',
        album: 'Nunca Tem Fim...',
        thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
        duration: 418
      }
    ],
    playlists: [
      {
        id: 'pl-rock-1',
        name: 'Rock Internacional | 80-90-00',
        creator: 'Montanha Music Lab',
        cover: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80',
        trackCount: 100,
        gradient: 'linear-gradient(135deg, #ec4899 0%, #f97316 100%)'
      },
      {
        id: 'pl-rock-2',
        name: 'Rock Road Trip',
        creator: 'Montanha Music Lab',
        cover: 'https://images.unsplash.com/photo-1469488865564-c2de10f69f96?w=600&auto=format&fit=crop&q=80',
        trackCount: 80,
        gradient: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)'
      },
      {
        id: 'pl-rock-3',
        name: 'Clássicos do Rock Nacional',
        creator: 'Montanha Music Lab',
        cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
        trackCount: 65,
        gradient: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)'
      }
    ],
    albums: [
      {
        id: 'alb-gnr-appetite',
        rawId: '1390088440',
        name: 'Appetite For Destruction',
        artist: "Guns N' Roses",
        cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
        trackCount: 12
      },
      {
        id: 'alb-bonjovi-slippery',
        rawId: '1440854234',
        name: 'Slippery When Wet',
        artist: 'Bon Jovi',
        cover: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80',
        trackCount: 10
      },
      {
        id: 'alb-nirvana-nevermind',
        rawId: '1440783617',
        name: 'Nevermind',
        artist: 'Nirvana',
        cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
        trackCount: 12
      },
      {
        id: 'alb-lp-hybrid',
        rawId: '5284360',
        name: 'Hybrid Theory',
        artist: 'Linkin Park',
        cover: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=600&auto=format&fit=crop&q=80',
        trackCount: 12
      }
    ],
    artists: [
      {
        id: 'art-gnr',
        name: "Guns N' Roses",
        image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
        nbFan: 15400000
      },
      {
        id: 'art-bonjovi',
        name: 'Bon Jovi',
        image: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80',
        nbFan: 12300000
      },
      {
        id: 'art-nirvana',
        name: 'Nirvana',
        image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
        nbFan: 18900000
      },
      {
        id: 'art-acdc',
        name: 'AC/DC',
        image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80',
        nbFan: 22000000
      }
    ]
  },
  {
    id: 'pop',
    name: 'Pop',
    gradient: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    tagline: 'Os maiores sucessos mundiais das paradas e trends',
    topTracks: [
      {
        id: 'pop-1',
        name: 'Blinding Lights',
        artist: 'The Weeknd',
        album: 'After Hours',
        thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
        duration: 200
      },
      {
        id: 'pop-2',
        name: 'Levitating',
        artist: 'Dua Lipa',
        album: 'Future Nostalgia',
        thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
        duration: 203
      },
      {
        id: 'pop-3',
        name: 'As It Was',
        artist: 'Harry Styles',
        album: "Harry's House",
        thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
        duration: 167
      },
      {
        id: 'pop-4',
        name: 'Cruel Summer',
        artist: 'Taylor Swift',
        album: 'Lover',
        thumbnail: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=600&auto=format&fit=crop&q=80',
        duration: 178
      },
      {
        id: 'pop-5',
        name: 'Die With A Smile',
        artist: 'Lady Gaga & Bruno Mars',
        album: 'Die With A Smile',
        thumbnail: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80',
        duration: 251
      }
    ],
    playlists: [
      {
        id: 'pl-pop-1',
        name: 'Pop Global Hits 2026',
        creator: 'Montanha Music Lab',
        cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
        trackCount: 75,
        gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)'
      },
      {
        id: 'pl-pop-2',
        name: 'Pop Nostalgia 2000-2015',
        creator: 'Montanha Music Lab',
        cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
        trackCount: 90,
        gradient: 'linear-gradient(135deg, #f43f5e 0%, #fb923c 100%)'
      }
    ],
    albums: [
      {
        id: 'alb-dua-fn',
        name: 'Future Nostalgia',
        artist: 'Dua Lipa',
        cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
        trackCount: 11
      },
      {
        id: 'alb-weeknd-ah',
        name: 'After Hours',
        artist: 'The Weeknd',
        cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
        trackCount: 14
      }
    ],
    artists: [
      {
        id: 'art-theweeknd',
        name: 'The Weeknd',
        image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
        nbFan: 25000000
      },
      {
        id: 'art-dualipa',
        name: 'Dua Lipa',
        image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
        nbFan: 19800000
      }
    ]
  },
  {
    id: 'sertanejo',
    name: 'Sertanejo',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    tagline: 'O ritmo do coração do Brasil, modões e universitário',
    topTracks: [
      {
        id: 'sert-1',
        name: 'Arranhão',
        artist: 'Henrique & Juliano',
        album: 'Manifesto Musical',
        thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
        duration: 172
      },
      {
        id: 'sert-2',
        name: 'Bloqueado',
        artist: 'Gusttavo Lima',
        album: 'Buteco in Boston',
        thumbnail: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80',
        duration: 165
      },
      {
        id: 'sert-3',
        name: 'Molhando o Volante',
        artist: 'Jorge & Mateus',
        album: 'É Simples Assim',
        thumbnail: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80',
        duration: 180
      },
      {
        id: 'sert-4',
        name: 'Pipoco',
        artist: 'Ana Castela',
        album: 'Pipoco',
        thumbnail: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=600&auto=format&fit=crop&q=80',
        duration: 190
      },
      {
        id: 'sert-5',
        name: 'Todo Mundo Menos Você',
        artist: 'Marília Mendonça, Maiara & Maraisa',
        album: 'Patroas 35%',
        thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
        duration: 215
      }
    ],
    playlists: [
      {
        id: 'pl-sert-1',
        name: 'Sertanejo Universitário 2026',
        creator: 'Montanha Music Lab',
        cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
        trackCount: 110,
        gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)'
      },
      {
        id: 'pl-sert-2',
        name: 'Churrasco, Modão & Viola',
        creator: 'Montanha Music Lab',
        cover: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80',
        trackCount: 85,
        gradient: 'linear-gradient(135deg, #059669 0%, #0f766e 100%)'
      }
    ],
    albums: [
      {
        id: 'alb-hj-manifesto',
        name: 'Manifesto Musical',
        artist: 'Henrique & Juliano',
        cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
        trackCount: 27
      },
      {
        id: 'alb-marilia-todos',
        name: 'Todos Os Cantos, Vol. 1',
        artist: 'Marília Mendonça',
        cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
        trackCount: 12
      }
    ],
    artists: [
      {
        id: 'art-hj',
        name: 'Henrique & Juliano',
        image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
        nbFan: 14000000
      },
      {
        id: 'art-marilia',
        name: 'Marília Mendonça',
        image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
        nbFan: 18000000
      }
    ]
  },
  {
    id: 'mpb',
    name: 'MPB',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    tagline: 'A rica poesia, harmonia e musicalidade popular brasileira',
    topTracks: [
      {
        id: 'mpb-1',
        name: 'Não Quero Dinheiro',
        artist: 'Tim Maia',
        album: 'Tim Maia 1971',
        thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
        duration: 153
      },
      {
        id: 'mpb-2',
        name: 'Sina',
        artist: 'Djavan',
        album: 'Luz',
        thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
        duration: 334
      },
      {
        id: 'mpb-3',
        name: 'Aquele Abraço',
        artist: 'Gilberto Gil',
        album: 'Gilberto Gil 1969',
        thumbnail: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80',
        duration: 323
      },
      {
        id: 'mpb-4',
        name: 'Sozinho',
        artist: 'Caetano Veloso',
        album: 'Prenda Minha',
        thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
        duration: 196
      }
    ],
    playlists: [
      {
        id: 'pl-mpb-1',
        name: 'Clássicos da MPB Essencial',
        creator: 'Montanha Music Lab',
        cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
        trackCount: 95,
        gradient: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)'
      },
      {
        id: 'pl-mpb-2',
        name: 'MPB Acústico Relax & Café',
        creator: 'Montanha Music Lab',
        cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
        trackCount: 70,
        gradient: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)'
      }
    ],
    albums: [
      {
        id: 'alb-djavan-luz',
        name: 'Luz',
        artist: 'Djavan',
        cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
        trackCount: 10
      },
      {
        id: 'alb-tim-1971',
        name: 'Tim Maia (1971)',
        artist: 'Tim Maia',
        cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
        trackCount: 12
      }
    ],
    artists: [
      {
        id: 'art-djavan',
        name: 'Djavan',
        image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
        nbFan: 4800000
      },
      {
        id: 'art-timmaia',
        name: 'Tim Maia',
        image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
        nbFan: 5900000
      }
    ]
  },
  {
    id: 'rap-funk',
    name: 'Rap/Funk Brasileiro',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    tagline: 'O peso dos graves, rimas afiadas e a vibração das ruas',
    topTracks: [
      {
        id: 'rf-1',
        name: 'Anos Luz',
        artist: 'Matuê',
        album: 'Máquina do Tempo',
        thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
        duration: 212
      },
      {
        id: 'rf-2',
        name: 'Me Sinto Abençoado',
        artist: 'MC Poze do Rodo, Filipe Ret',
        album: 'LUME',
        thumbnail: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=600&auto=format&fit=crop&q=80',
        duration: 175
      },
      {
        id: 'rf-3',
        name: 'Essência de Cria',
        artist: 'MC Cabelinho',
        album: 'Little Love',
        thumbnail: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80',
        duration: 198
      },
      {
        id: 'rf-4',
        name: 'Amor de Fim de Noite',
        artist: 'Orochi',
        album: 'Celebridade',
        thumbnail: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80',
        duration: 204
      }
    ],
    playlists: [
      {
        id: 'pl-rf-1',
        name: 'Trap Brasil 2026',
        creator: 'Montanha Music Lab',
        cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
        trackCount: 120,
        gradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)'
      },
      {
        id: 'pl-rf-2',
        name: 'Funk Mandrake & Fluxo',
        creator: 'Montanha Music Lab',
        cover: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=600&auto=format&fit=crop&q=80',
        trackCount: 80,
        gradient: 'linear-gradient(135deg, #0891b2 0%, #155e75 100%)'
      }
    ],
    albums: [
      {
        id: 'alb-matue-mdt',
        name: 'Máquina do Tempo',
        artist: 'Matuê',
        cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
        trackCount: 7
      },
      {
        id: 'alb-ret-lume',
        name: 'LUME',
        artist: 'Filipe Ret',
        cover: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=600&auto=format&fit=crop&q=80',
        trackCount: 11
      }
    ],
    artists: [
      {
        id: 'art-matue',
        name: 'Matuê',
        image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
        nbFan: 11500000
      },
      {
        id: 'art-ret',
        name: 'Filipe Ret',
        image: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=600&auto=format&fit=crop&q=80',
        nbFan: 8900000
      }
    ]
  },
  {
    id: 'hip-hop',
    name: 'Rap/Hip Hop',
    gradient: 'linear-gradient(135deg, #e11d48 0%, #9f1239 100%)',
    glowColor: 'rgba(225, 29, 72, 0.4)',
    tagline: 'Flow potente, boom bap, 808s e rimas lendárias do rap mundial',
    topTracks: [
      {
        id: 'hh-1',
        name: 'Lose Yourself',
        artist: 'Eminem',
        album: '8 Mile Soundtrack',
        thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
        duration: 326
      },
      {
        id: 'hh-2',
        name: 'HUMBLE.',
        artist: 'Kendrick Lamar',
        album: 'DAMN.',
        thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
        duration: 177
      },
      {
        id: 'hh-3',
        name: 'God\'s Plan',
        artist: 'Drake',
        album: 'Scorpion',
        thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
        duration: 198
      },
      {
        id: 'hh-4',
        name: 'SICKO MODE',
        artist: 'Travis Scott',
        album: 'ASTROWORLD',
        thumbnail: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=600&auto=format&fit=crop&q=80',
        duration: 312
      }
    ],
    playlists: [
      {
        id: 'pl-hh-1',
        name: 'Hip Hop Royalty',
        creator: 'Montanha Music Lab',
        cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
        trackCount: 90,
        gradient: 'linear-gradient(135deg, #e11d48 0%, #4c0519 100%)'
      },
      {
        id: 'pl-hh-2',
        name: 'Golden 90s East Coast vs West Coast',
        creator: 'Montanha Music Lab',
        cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
        trackCount: 75,
        gradient: 'linear-gradient(135deg, #f43f5e 0%, #881337 100%)'
      }
    ],
    albums: [
      {
        id: 'alb-kendrick-damn',
        name: 'DAMN.',
        artist: 'Kendrick Lamar',
        cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
        trackCount: 14
      },
      {
        id: 'alb-eminem-tes',
        name: 'The Eminem Show',
        artist: 'Eminem',
        cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
        trackCount: 20
      }
    ],
    artists: [
      {
        id: 'art-eminem',
        name: 'Eminem',
        image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
        nbFan: 35000000
      },
      {
        id: 'art-kendrick',
        name: 'Kendrick Lamar',
        image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
        nbFan: 21000000
      }
    ]
  },
  {
    id: 'reggaeton',
    name: 'Reggaeton',
    gradient: 'linear-gradient(135deg, #f43f5e 0%, #fb923c 100%)',
    glowColor: 'rgba(244, 63, 94, 0.4)',
    tagline: 'O ritmo latino contagiante, batidas envolventes e puro perreo',
    topTracks: [
      {
        id: 'reg-1',
        name: 'Tití Me Preguntó',
        artist: 'Bad Bunny',
        album: 'Un Verano Sin Ti',
        thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
        duration: 243
      },
      {
        id: 'reg-2',
        name: 'Gasolina',
        artist: 'Daddy Yankee',
        album: 'Barrio Fino',
        thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
        duration: 192
      },
      {
        id: 'reg-3',
        name: 'PROVENZA',
        artist: 'Karol G',
        album: 'Mañana Será Bonito',
        thumbnail: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80',
        duration: 210
      }
    ],
    playlists: [
      {
        id: 'pl-reg-1',
        name: 'Perreo Intenso & Latino',
        creator: 'Montanha Music Lab',
        cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
        trackCount: 85,
        gradient: 'linear-gradient(135deg, #f43f5e 0%, #ea580c 100%)'
      }
    ],
    albums: [
      {
        id: 'alb-bb-verano',
        name: 'Un Verano Sin Ti',
        artist: 'Bad Bunny',
        cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
        trackCount: 23
      }
    ],
    artists: [
      {
        id: 'art-badbunny',
        name: 'Bad Bunny',
        image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
        nbFan: 30000000
      }
    ]
  },
  {
    id: 'dance',
    name: 'Dance',
    gradient: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
    glowColor: 'rgba(251, 146, 60, 0.4)',
    tagline: 'Festivais eletrônicos, clubs e energia contagiante 128 BPM',
    topTracks: [
      {
        id: 'dance-1',
        name: 'One Kiss',
        artist: 'Calvin Harris, Dua Lipa',
        album: 'One Kiss',
        thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
        duration: 214
      },
      {
        id: 'dance-2',
        name: 'Hear Me Now',
        artist: 'Alok, Bruno Martini, Zeeba',
        album: 'Hear Me Now',
        thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
        duration: 192
      },
      {
        id: 'dance-3',
        name: 'Wake Me Up',
        artist: 'Avicii',
        album: 'True',
        thumbnail: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80',
        duration: 247
      }
    ],
    playlists: [
      {
        id: 'pl-dance-1',
        name: 'Mainstage Festival Hits',
        creator: 'Montanha Music Lab',
        cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
        trackCount: 100,
        gradient: 'linear-gradient(135deg, #fb923c 0%, #d97706 100%)'
      }
    ],
    albums: [
      {
        id: 'alb-avicii-true',
        name: 'True',
        artist: 'Avicii',
        cover: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80',
        trackCount: 10
      }
    ],
    artists: [
      {
        id: 'art-alok',
        name: 'Alok',
        image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
        nbFan: 16000000
      }
    ]
  },
  {
    id: 'rnb',
    name: 'R&B',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    glowColor: 'rgba(99, 102, 241, 0.4)',
    tagline: 'Vozes suaves, harmonias aveludadas e sensibilidade visceral',
    topTracks: [
      {
        id: 'rnb-1',
        name: 'Kill Bill',
        artist: 'SZA',
        album: 'SOS',
        thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
        duration: 153
      },
      {
        id: 'rnb-2',
        name: 'Thinkin Bout You',
        artist: 'Frank Ocean',
        album: 'Channel Orange',
        thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
        duration: 200
      },
      {
        id: 'rnb-3',
        name: 'No One',
        artist: 'Alicia Keys',
        album: 'As I Am',
        thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
        duration: 253
      }
    ],
    playlists: [
      {
        id: 'pl-rnb-1',
        name: 'R&B Chill & Soul',
        creator: 'Montanha Music Lab',
        cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
        trackCount: 65,
        gradient: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)'
      }
    ],
    albums: [
      {
        id: 'alb-sza-sos',
        name: 'SOS',
        artist: 'SZA',
        cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
        trackCount: 23
      }
    ],
    artists: [
      {
        id: 'art-sza',
        name: 'SZA',
        image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
        nbFan: 14500000
      }
    ]
  },
  {
    id: 'alternativo',
    name: 'Alternativo',
    gradient: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
    glowColor: 'rgba(20, 184, 166, 0.4)',
    tagline: 'Texturas sonoras indie, inovação e melodias fora da curva',
    topTracks: [
      {
        id: 'alt-1',
        name: 'Do I Wanna Know?',
        artist: 'Arctic Monkeys',
        album: 'AM',
        thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
        duration: 272
      },
      {
        id: 'alt-2',
        name: 'The Less I Know The Better',
        artist: 'Tame Impala',
        album: 'Currents',
        thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
        duration: 216
      },
      {
        id: 'alt-3',
        name: 'Sweater Weather',
        artist: 'The Neighbourhood',
        album: 'I Love You.',
        thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
        duration: 240
      }
    ],
    playlists: [
      {
        id: 'pl-alt-1',
        name: 'Indie Vibes & Chill Road',
        creator: 'Montanha Music Lab',
        cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
        trackCount: 70,
        gradient: 'linear-gradient(135deg, #14b8a6 0%, #0369a1 100%)'
      }
    ],
    albums: [
      {
        id: 'alb-am-am',
        name: 'AM',
        artist: 'Arctic Monkeys',
        cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
        trackCount: 12
      }
    ],
    artists: [
      {
        id: 'art-arctic',
        name: 'Arctic Monkeys',
        image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
        nbFan: 17800000
      }
    ]
  },
  {
    id: 'treino-metal',
    name: 'Treino Pesado',
    gradient: 'linear-gradient(135deg, #b91c1c 0%, #450a0a 100%)',
    glowColor: 'rgba(185, 28, 28, 0.4)',
    tagline: 'Adrenalina pura, metalcore e peso para quebrar recordes no tatame e na barra',
    topTracks: [
      {
        id: 'tm-1',
        name: 'Down with the Sickness',
        artist: 'Disturbed',
        album: 'The Sickness',
        thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
        duration: 278
      },
      {
        id: 'tm-2',
        name: 'Psychosocial',
        artist: 'Slipknot',
        album: 'All Hope Is Gone',
        thumbnail: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80',
        duration: 284
      },
      {
        id: 'tm-3',
        name: 'Master of Puppets',
        artist: 'Metallica',
        album: 'Master of Puppets',
        thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
        duration: 515
      },
      {
        id: 'tm-4',
        name: 'Du Hast',
        artist: 'Rammstein',
        album: 'Sehnsucht',
        thumbnail: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80',
        duration: 234
      }
    ],
    playlists: [
      {
        id: 'pl-tm-1',
        name: 'Treino Bruto 1RM | Coach Montanha',
        creator: 'Coach Montanha',
        cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
        trackCount: 150,
        gradient: 'linear-gradient(135deg, #b91c1c 0%, #1f2937 100%)'
      }
    ],
    albums: [
      {
        id: 'alb-metallica-mop',
        name: 'Master of Puppets',
        artist: 'Metallica',
        cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
        trackCount: 8
      }
    ],
    artists: [
      {
        id: 'art-metallica',
        name: 'Metallica',
        image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
        nbFan: 25000000
      }
    ]
  },
  {
    id: 'lofi-foco',
    name: 'Lo-Fi & Foco',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #4338ca 100%)',
    glowColor: 'rgba(124, 58, 237, 0.4)',
    tagline: 'Batidas relaxantes e instrumentais para estudo, leitura e foco absoluto',
    topTracks: [
      {
        id: 'lf-1',
        name: 'Affection',
        artist: 'Jinsang',
        album: 'Life',
        thumbnail: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&auto=format&fit=crop&q=80',
        duration: 135
      },
      {
        id: 'lf-2',
        name: 'Controlla',
        artist: 'Idealism',
        album: 'Rainy Evening',
        thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
        duration: 150
      },
      {
        id: 'lf-3',
        name: 'Kingdom in Blue',
        artist: 'Kupla',
        album: 'Kingdom in Blue',
        thumbnail: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&auto=format&fit=crop&q=80',
        duration: 160
      }
    ],
    playlists: [
      {
        id: 'pl-lf-1',
        name: 'Lo-Fi Chill & Deep Focus',
        creator: 'Montanha Music Lab',
        cover: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&auto=format&fit=crop&q=80',
        trackCount: 120,
        gradient: 'linear-gradient(135deg, #7c3aed 0%, #2e1065 100%)'
      }
    ],
    albums: [
      {
        id: 'alb-kupla-kib',
        name: 'Kingdom in Blue',
        artist: 'Kupla',
        cover: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&auto=format&fit=crop&q=80',
        trackCount: 10
      }
    ],
    artists: [
      {
        id: 'art-kupla',
        name: 'Kupla',
        image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&auto=format&fit=crop&q=80',
        nbFan: 2100000
      }
    ]
  },
  {
    id: 'samba-pagode',
    name: 'Samba/Pagode',
    gradient: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
    glowColor: 'rgba(234, 179, 8, 0.4)',
    tagline: 'Cavaquinho, pandeiro, alegria brasileira e romantismo de roda de samba',
    topTracks: [
      {
        id: 'sp-1',
        name: 'Deixa Alagar',
        artist: 'Zeca Pagodinho',
        album: 'Deixa a Vida Me Levar',
        thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
        duration: 278
      },
      {
        id: 'sp-2',
        name: 'Manta do Bem Querer',
        artist: 'Thiaguinho',
        album: 'Tardezinha',
        thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
        duration: 210
      },
      {
        id: 'sp-3',
        name: 'A Amizade É Tudo',
        artist: 'Jeito Moleque',
        album: 'Ao Vivo na Amazônia',
        thumbnail: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80',
        duration: 220
      }
    ],
    playlists: [
      {
        id: 'pl-sp-1',
        name: 'Roda de Samba & Tardezinha',
        creator: 'Montanha Music Lab',
        cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
        trackCount: 80,
        gradient: 'linear-gradient(135deg, #eab308 0%, #854d0e 100%)'
      }
    ],
    albums: [
      {
        id: 'alb-zeca-vida',
        name: 'Deixa a Vida Me Levar',
        artist: 'Zeca Pagodinho',
        cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
        trackCount: 14
      }
    ],
    artists: [
      {
        id: 'art-zeca',
        name: 'Zeca Pagodinho',
        image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
        nbFan: 6200000
      }
    ]
  }
];
