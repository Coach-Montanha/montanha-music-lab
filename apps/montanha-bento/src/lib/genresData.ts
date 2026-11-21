import { Song, SearchAlbum, SearchArtist } from '../types';

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
  gradient: string;
  glowColor: string;
  tagline: string;
  topTracks: Song[];
  playlists: GenreThemedPlaylist[];
  albums: SearchAlbum[];
  artists: SearchArtist[];
}

// Utilitário para gerar playlists de referência ricas com tracks reais padrão do gênero
function createPlaylists(
  genrePrefix: string,
  baseGradient: string,
  defaultTracks: Song[],
  items: Array<{ name: string; creator?: string; trackCount?: number; gradient?: string }>
): GenreThemedPlaylist[] {
  return items.map((item, idx) => ({
    id: `pl-${genrePrefix}-${idx + 1}`,
    name: item.name,
    creator: item.creator || 'Montanha Music',
    cover: defaultTracks[idx % defaultTracks.length]?.thumbnail || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    trackCount: item.trackCount || 60 + ((idx * 7) % 65),
    gradient: item.gradient || baseGradient,
    tracks: defaultTracks
  }));
}

// 1. ROCK
const rockTracks: Song[] = [
  { id: 'rock-1', name: "Sweet Child O' Mine", artist: "Guns N' Roses", album: 'Appetite For Destruction', thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80', duration: 356 },
  { id: 'rock-2', name: "Livin' On A Prayer", artist: 'Bon Jovi', album: 'Slippery When Wet', thumbnail: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80', duration: 249 },
  { id: 'rock-3', name: 'Smells Like Teen Spirit', artist: 'Nirvana', album: 'Nevermind', thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80', duration: 301 },
  { id: 'rock-4', name: 'Down with the Sickness', artist: 'Disturbed', album: 'The Sickness', thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80', duration: 278 },
  { id: 'rock-5', name: 'Back In Black', artist: 'AC/DC', album: 'Back In Black', thumbnail: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80', duration: 255 },
  { id: 'rock-6', name: 'In the End', artist: 'Linkin Park', album: 'Hybrid Theory', thumbnail: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=600&auto=format&fit=crop&q=80', duration: 216 },
  { id: 'rock-7', name: 'Anjos (Pra quem tem fé)', artist: 'O Rappa', album: 'Nunca Tem Fim...', thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80', duration: 418 }
];

// 2. POP
const popTracks: Song[] = [
  { id: 'pop-1', name: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80', duration: 200 },
  { id: 'pop-2', name: 'Levitating', artist: 'Dua Lipa', album: 'Future Nostalgia', thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80', duration: 203 },
  { id: 'pop-3', name: 'As It Was', artist: 'Harry Styles', album: "Harry's House", thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80', duration: 167 },
  { id: 'pop-4', name: 'Cruel Summer', artist: 'Taylor Swift', album: 'Lover', thumbnail: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=600&auto=format&fit=crop&q=80', duration: 178 },
  { id: 'pop-5', name: 'Die With A Smile', artist: 'Lady Gaga & Bruno Mars', album: 'Die With A Smile', thumbnail: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80', duration: 251 }
];

// 3. SERTANEJO
const sertanejoTracks: Song[] = [
  { id: 'sert-1', name: 'Arranhão', artist: 'Henrique & Juliano', album: 'Manifesto Musical', thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80', duration: 172 },
  { id: 'sert-2', name: 'Bloqueado', artist: 'Gusttavo Lima', album: 'Buteco in Boston', thumbnail: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80', duration: 165 },
  { id: 'sert-3', name: 'Molhando o Volante', artist: 'Jorge & Mateus', album: 'É Simples Assim', thumbnail: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80', duration: 180 },
  { id: 'sert-4', name: 'Pipoco', artist: 'Ana Castela', album: 'Pipoco', thumbnail: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=600&auto=format&fit=crop&q=80', duration: 190 },
  { id: 'sert-5', name: 'Todo Mundo Menos Você', artist: 'Marília Mendonça, Maiara & Maraisa', album: 'Patroas 35%', thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80', duration: 215 }
];

// 4. MPB
const mpbTracks: Song[] = [
  { id: 'mpb-1', name: 'Não Quero Dinheiro', artist: 'Tim Maia', album: 'Tim Maia 1971', thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80', duration: 153 },
  { id: 'mpb-2', name: 'Sina', artist: 'Djavan', album: 'Luz', thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80', duration: 334 },
  { id: 'mpb-3', name: 'Aquele Abraço', artist: 'Gilberto Gil', album: 'Gilberto Gil 1969', thumbnail: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80', duration: 323 },
  { id: 'mpb-4', name: 'Sozinho', artist: 'Caetano Veloso', album: 'Prenda Minha', thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80', duration: 196 }
];

// 5. RAP / FUNK BRASILEIRO
const rapFunkTracks: Song[] = [
  { id: 'rf-1', name: 'Anos Luz', artist: 'Matuê', album: 'Máquina do Tempo', thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80', duration: 212 },
  { id: 'rf-2', name: 'Me Sinto Abençoado', artist: 'MC Poze do Rodo, Filipe Ret', album: 'LUME', thumbnail: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=600&auto=format&fit=crop&q=80', duration: 175 },
  { id: 'rf-3', name: 'Essência de Cria', artist: 'MC Cabelinho', album: 'Little Love', thumbnail: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80', duration: 198 },
  { id: 'rf-4', name: 'Amor de Fim de Noite', artist: 'Orochi', album: 'Celebridade', thumbnail: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80', duration: 204 }
];

// 6. RAP / HIP HOP INTERNACIONAL
const hipHopTracks: Song[] = [
  { id: 'hh-1', name: 'Lose Yourself', artist: 'Eminem', album: '8 Mile Soundtrack', thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80', duration: 326 },
  { id: 'hh-2', name: 'HUMBLE.', artist: 'Kendrick Lamar', album: 'DAMN.', thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80', duration: 177 },
  { id: 'hh-3', name: "God's Plan", artist: 'Drake', album: 'Scorpion', thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80', duration: 198 },
  { id: 'hh-4', name: 'SICKO MODE', artist: 'Travis Scott', album: 'ASTROWORLD', thumbnail: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=600&auto=format&fit=crop&q=80', duration: 312 }
];

// 7. REGGAETON
const reggaetonTracks: Song[] = [
  { id: 'reg-1', name: 'Tití Me Preguntó', artist: 'Bad Bunny', album: 'Un Verano Sin Ti', thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80', duration: 243 },
  { id: 'reg-2', name: 'Gasolina', artist: 'Daddy Yankee', album: 'Barrio Fino', thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80', duration: 192 },
  { id: 'reg-3', name: 'PROVENZA', artist: 'Karol G', album: 'Mañana Será Bonito', thumbnail: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80', duration: 210 }
];

// 8. DANCE / ELETRÔNICA
const danceTracks: Song[] = [
  { id: 'dance-1', name: 'One Kiss', artist: 'Calvin Harris, Dua Lipa', album: 'One Kiss', thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80', duration: 214 },
  { id: 'dance-2', name: 'Hear Me Now', artist: 'Alok, Bruno Martini, Zeeba', album: 'Hear Me Now', thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80', duration: 192 },
  { id: 'dance-3', name: 'Wake Me Up', artist: 'Avicii', album: 'True', thumbnail: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80', duration: 247 }
];

// 9. R&B & SOUL
const rnbTracks: Song[] = [
  { id: 'rnb-1', name: 'Kill Bill', artist: 'SZA', album: 'SOS', thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80', duration: 153 },
  { id: 'rnb-2', name: 'Thinkin Bout You', artist: 'Frank Ocean', album: 'Channel Orange', thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80', duration: 200 },
  { id: 'rnb-3', name: 'No One', artist: 'Alicia Keys', album: 'As I Am', thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80', duration: 253 }
];

// 10. ALTERNATIVO
const altTracks: Song[] = [
  { id: 'alt-1', name: 'Do I Wanna Know?', artist: 'Arctic Monkeys', album: 'AM', thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80', duration: 272 },
  { id: 'alt-2', name: 'The Less I Know The Better', artist: 'Tame Impala', album: 'Currents', thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80', duration: 216 },
  { id: 'alt-3', name: 'Sweater Weather', artist: 'The Neighbourhood', album: 'I Love You.', thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80', duration: 240 }
];

// 11. TREINO PESADO
const treinoTracks: Song[] = [
  { id: 'tm-1', name: 'Down with the Sickness', artist: 'Disturbed', album: 'The Sickness', thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80', duration: 278 },
  { id: 'tm-2', name: 'Psychosocial', artist: 'Slipknot', album: 'All Hope Is Gone', thumbnail: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80', duration: 284 },
  { id: 'tm-3', name: 'Master of Puppets', artist: 'Metallica', album: 'Master of Puppets', thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80', duration: 515 },
  { id: 'tm-4', name: 'Du Hast', artist: 'Rammstein', album: 'Sehnsucht', thumbnail: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80', duration: 234 }
];

// 12. LO-FI & FOCO
const lofiTracks: Song[] = [
  { id: 'lf-1', name: 'Affection', artist: 'Jinsang', album: 'Life', thumbnail: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&auto=format&fit=crop&q=80', duration: 135 },
  { id: 'lf-2', name: 'Controlla', artist: 'Idealism', album: 'Rainy Evening', thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80', duration: 150 },
  { id: 'lf-3', name: 'Kingdom in Blue', artist: 'Kupla', album: 'Kingdom in Blue', thumbnail: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&auto=format&fit=crop&q=80', duration: 160 }
];

// 13. SAMBA & PAGODE
const sambaTracks: Song[] = [
  { id: 'sp-1', name: 'Deixa Alagar', artist: 'Zeca Pagodinho', album: 'Deixa a Vida Me Levar', thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80', duration: 278 },
  { id: 'sp-2', name: 'Manta do Bem Querer', artist: 'Thiaguinho', album: 'Tardezinha', thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80', duration: 210 },
  { id: 'sp-3', name: 'A Amizade É Tudo', artist: 'Jeito Moleque', album: 'Ao Vivo na Amazônia', thumbnail: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80', duration: 220 }
];

export const GENRES_CATALOG: GenreCategory[] = [
  {
    id: 'rock',
    name: 'Rock',
    gradient: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
    glowColor: 'rgba(37, 99, 235, 0.4)',
    tagline: 'Clássicos mundiais, guitarras marcantes e hinos imortais',
    topTracks: rockTracks,
    playlists: createPlaylists('rock', 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', rockTracks, [
      { name: 'Rock Internacional | 80-90-00', creator: 'Spotify', trackCount: 100, gradient: 'linear-gradient(135deg, #ec4899 0%, #f97316 100%)' },
      { name: 'Rock Road Trip', creator: 'Deezer Hits', trackCount: 80, gradient: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' },
      { name: 'Clássicos do Rock Nacional', creator: 'Montanha Music', trackCount: 65, gradient: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)' },
      { name: 'Hard Rock 80s Anthems', creator: 'Apple Music', trackCount: 95 },
      { name: 'Grunge & 90s Alternative', creator: 'Spotify', trackCount: 88 },
      { name: 'Rock Ballads & Acoustic', creator: 'Deezer', trackCount: 70 },
      { name: 'Classic Rock Greatest Hits', creator: 'Universal Music', trackCount: 120 },
      { name: 'Heavy Rock Workout', creator: 'Coach Montanha', trackCount: 75 },
      { name: 'Punk Rock 90s & 2000s', creator: 'Spotify', trackCount: 64 },
      { name: 'Nu-Metal Titans', creator: 'Roadrunner', trackCount: 55 },
      { name: 'Progressive Rock Legends', creator: 'Deezer', trackCount: 82 },
      { name: 'Rock Brasil Anos 80', creator: 'Som Livre', trackCount: 90 },
      { name: 'Guitarras Brasileiras', creator: 'Spotify', trackCount: 60 },
      { name: 'Soft Rock Relax', creator: 'Apple Music', trackCount: 75 },
      { name: 'Arena Rock Champions', creator: 'Warner Music', trackCount: 110 },
      { name: 'Psychedelic 70s Rock', creator: 'Spotify', trackCount: 68 },
      { name: 'Modern Rock 2026', creator: 'Montanha Music', trackCount: 85 },
      { name: 'Glam Metal Sunset', creator: 'Deezer', trackCount: 58 },
      { name: 'Acoustic Rock Unplugged', creator: 'MTV Brasil', trackCount: 72 },
      { name: 'British Rock Invasion', creator: 'BBC Radio 1', trackCount: 94 },
      { name: 'Surf Rock & Garage', creator: 'Spotify', trackCount: 52 },
      { name: 'Folk Rock Storytellers', creator: 'Apple Music', trackCount: 66 },
      { name: 'Stoner & Desert Rock', creator: 'Deezer', trackCount: 48 },
      { name: 'Power Metal Anthems', creator: 'Nuclear Blast', trackCount: 77 },
      { name: 'Alternative Rock 2000s', creator: 'Spotify', trackCount: 105 },
      { name: 'Rock Instrumental & Solos', creator: 'Guitar World', trackCount: 62 },
      { name: 'Festival Rock Mainstage', creator: 'Rock in Rio', trackCount: 115 },
      { name: 'Rock de Garagem Nacional', creator: 'Montanha Music', trackCount: 50 },
      { name: 'Post-Punk & New Wave', creator: 'Spotify', trackCount: 74 },
      { name: 'Emo Rock & Pop Punk 2000s', creator: 'Deezer', trackCount: 86 },
      { name: 'Southern Rock & Blues', creator: 'Apple Music', trackCount: 59 },
      { name: 'Symphonic Rock Masters', creator: 'Spotify', trackCount: 63 }
    ]),
    albums: [
      { id: 'alb-gnr-appetite', rawId: '1390088440', name: 'Appetite For Destruction', artist: "Guns N' Roses", cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80', trackCount: 12 },
      { id: 'alb-bonjovi-slippery', rawId: '1440854234', name: 'Slippery When Wet', artist: 'Bon Jovi', cover: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80', trackCount: 10 },
      { id: 'alb-nirvana-nevermind', rawId: '1440783617', name: 'Nevermind', artist: 'Nirvana', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80', trackCount: 12 }
    ],
    artists: [
      { id: 'art-gnr', name: "Guns N' Roses", image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80', nbFan: 15400000 },
      { id: 'art-bonjovi', name: 'Bon Jovi', image: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80', nbFan: 12300000 },
      { id: 'art-nirvana', name: 'Nirvana', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80', nbFan: 18900000 }
    ]
  },
  {
    id: 'pop',
    name: 'Pop',
    gradient: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    tagline: 'Os maiores sucessos mundiais das paradas e trends',
    topTracks: popTracks,
    playlists: createPlaylists('pop', 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)', popTracks, [
      { name: 'Pop Global Hits 2026', creator: 'Spotify', trackCount: 100 },
      { name: 'Pop Nostalgia 2000-2015', creator: 'Apple Music', trackCount: 85 },
      { name: 'Divas do Pop Internacional', creator: 'Deezer Hits', trackCount: 90 },
      { name: 'Pop Brasil & Mundo', creator: 'Montanha Music', trackCount: 75 },
      { name: 'Teen Pop Anthems', creator: 'Spotify', trackCount: 80 },
      { name: 'Pop Acústico Relax', creator: 'Apple Music', trackCount: 65 },
      { name: 'Dance Pop Fever', creator: 'Deezer', trackCount: 95 },
      { name: 'Pop 90s Flashback', creator: 'Spotify', trackCount: 110 },
      { name: 'Pop Rádio FM Hits', creator: 'Billboard', trackCount: 70 },
      { name: 'Viral Pop TikTok & Reels', creator: 'Spotify', trackCount: 105 },
      { name: 'Soft Pop Morning', creator: 'Apple Music', trackCount: 60 },
      { name: 'Indie Pop Dream', creator: 'Deezer', trackCount: 72 },
      { name: 'Pop Rock 2000s', creator: 'Spotify', trackCount: 88 },
      { name: 'Electro Pop Party', creator: 'Ultra Music', trackCount: 92 },
      { name: 'Pop Latino & Crossover', creator: 'Sony Latin', trackCount: 84 },
      { name: 'Pop Melancólico & Sad Songs', creator: 'Spotify', trackCount: 65 },
      { name: 'Boybands 90s & 2000s', creator: 'Apple Music', trackCount: 78 },
      { name: 'Pop Sunset Acoustic', creator: 'Deezer', trackCount: 55 },
      { name: 'Pop Workout Beats', creator: 'Coach Montanha', trackCount: 90 },
      { name: 'Pop Romântico Love Songs', creator: 'Spotify', trackCount: 82 },
      { name: 'Pop Star Pride Anthems', creator: 'Apple Music', trackCount: 100 },
      { name: 'Pop Soul Sensations', creator: 'Deezer', trackCount: 68 },
      { name: 'Dark Pop & Synthpop', creator: 'Spotify', trackCount: 74 },
      { name: 'Bedroom Pop Cozy', creator: 'Montanha Music', trackCount: 58 },
      { name: 'Pop Francês & Europeu', creator: 'Deezer Paris', trackCount: 62 },
      { name: 'Pop Country Crossover', creator: 'Spotify Nashville', trackCount: 70 },
      { name: 'Summer Pop Festival', creator: 'Apple Music', trackCount: 115 },
      { name: 'Pop Chill Lounge', creator: 'Spotify', trackCount: 64 },
      { name: 'Pop Guitar Acoustic', creator: 'Deezer', trackCount: 50 },
      { name: 'Pop Dancefloor 128 BPM', creator: 'Spinnin Pop', trackCount: 96 },
      { name: 'Mega Hits Pop FM', creator: 'Montanha Music', trackCount: 120 }
    ]),
    albums: [
      { id: 'alb-dua-fn', name: 'Future Nostalgia', artist: 'Dua Lipa', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80', trackCount: 11 },
      { id: 'alb-weeknd-ah', name: 'After Hours', artist: 'The Weeknd', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80', trackCount: 14 }
    ],
    artists: [
      { id: 'art-theweeknd', name: 'The Weeknd', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80', nbFan: 25000000 },
      { id: 'art-dualipa', name: 'Dua Lipa', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80', nbFan: 19800000 }
    ]
  },
  {
    id: 'sertanejo',
    name: 'Sertanejo',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    tagline: 'O ritmo do coração do Brasil, modões e universitário',
    topTracks: sertanejoTracks,
    playlists: createPlaylists('sert', 'linear-gradient(135deg, #10b981 0%, #047857 100%)', sertanejoTracks, [
      { name: 'Sertanejo Universitário 2026', creator: 'Spotify Brasil', trackCount: 110 },
      { name: 'Churrasco, Modão & Viola', creator: 'Som Livre', trackCount: 85 },
      { name: 'Sertanejo das Antigas', creator: 'Deezer Brasil', trackCount: 95 },
      { name: 'Modão Bruto de Peão', creator: 'Apple Music', trackCount: 75 },
      { name: 'Sofrência & Paredão', creator: 'Spotify', trackCount: 100 },
      { name: 'Boteco Sertanejo Ao Vivo', creator: 'Montanha Music', trackCount: 88 },
      { name: 'Acústico Sertanejo Intimista', creator: 'Deezer', trackCount: 65 },
      { name: 'As Patroas do Sertanejo', creator: 'Spotify', trackCount: 90 },
      { name: 'Sertanejo Romântico', creator: 'Som Livre', trackCount: 80 },
      { name: 'Hit Sertanejo Rádio Brasil', creator: 'Billboard Brasil', trackCount: 105 },
      { name: 'Bailão Sertanejo & Vanera', creator: 'Apple Music', trackCount: 70 },
      { name: 'Sertanejo Raiz de Viola', creator: 'Deezer', trackCount: 60 },
      { name: 'Moda de Viola Caipira', creator: 'Spotify', trackCount: 65 },
      { name: 'Sertanejo Balada 140 BPM', creator: 'Montanha Music', trackCount: 85 },
      { name: 'Resenha Sertaneja de Sábado', creator: 'Spotify', trackCount: 95 },
      { name: 'Sertanejo Acústico Voz e Violão', creator: 'Apple Music', trackCount: 55 },
      { name: 'Clássicos dos Anos 90 Sertanejo', creator: 'Som Livre', trackCount: 100 },
      { name: 'Duplas Inesquecíveis', creator: 'Deezer', trackCount: 78 },
      { name: 'Sertanejo na Estrada', creator: 'Spotify', trackCount: 82 },
      { name: 'Rodeio & Festa do Peão', creator: 'Barretos Oficial', trackCount: 120 },
      { name: 'Pout-Pourri Sertanejo Ao Vivo', creator: 'Montanha Music', trackCount: 75 },
      { name: 'Sertanejo Romântico 2000s', creator: 'Apple Music', trackCount: 68 },
      { name: 'Modas Pra Beber Chorando', creator: 'Spotify', trackCount: 84 },
      { name: 'Sertanejo Prime', creator: 'Deezer', trackCount: 92 },
      { name: 'Rancho Sertanejo', creator: 'Spotify', trackCount: 64 },
      { name: 'Sertanejo Agro & Pista', creator: 'Som Livre', trackCount: 100 },
      { name: 'Pagode & Sertanejo Mix', creator: 'Montanha Music', trackCount: 80 },
      { name: 'Sertanejo Sunset Festival', creator: 'Apple Music', trackCount: 90 },
      { name: 'Viola Caipira Instrumental', creator: 'Deezer', trackCount: 50 },
      { name: 'Luau Sertanejo Praia', creator: 'Spotify', trackCount: 58 },
      { name: 'Pizada Sertaneja', creator: 'Montanha Music', trackCount: 110 }
    ]),
    albums: [
      { id: 'alb-hj-manifesto', name: 'Manifesto Musical', artist: 'Henrique & Juliano', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80', trackCount: 27 },
      { id: 'alb-marilia-todos', name: 'Todos Os Cantos, Vol. 1', artist: 'Marília Mendonça', cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80', trackCount: 12 }
    ],
    artists: [
      { id: 'art-hj', name: 'Henrique & Juliano', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80', nbFan: 14000000 },
      { id: 'art-marilia', name: 'Marília Mendonça', image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80', nbFan: 18000000 }
    ]
  },
  {
    id: 'mpb',
    name: 'MPB',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    tagline: 'A rica poesia, harmonia e musicalidade popular brasileira',
    topTracks: mpbTracks,
    playlists: createPlaylists('mpb', 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)', mpbTracks, [
      { name: 'Clássicos da MPB Essencial', creator: 'Spotify Brasil', trackCount: 95 },
      { name: 'MPB Acústico Relax & Café', creator: 'Deezer Brasil', trackCount: 70 },
      { name: 'Tropicália & Bossa Nova', creator: 'Apple Music', trackCount: 80 },
      { name: 'Voz e Violão Brasil', creator: 'Montanha Music', trackCount: 65 },
      { name: 'MPB Anos 70 Dourados', creator: 'Som Livre', trackCount: 88 },
      { name: 'Nova MPB & Indie Brasil', creator: 'Spotify', trackCount: 75 },
      { name: 'MPB Romântica Poética', creator: 'Deezer', trackCount: 85 },
      { name: 'Samba de Raiz & MPB', creator: 'Apple Music', trackCount: 90 },
      { name: 'MPB para Trabalhar & Foco', creator: 'Spotify', trackCount: 60 },
      { name: 'Grandes Mestres da MPB', creator: 'Universal Music', trackCount: 110 },
      { name: 'Domingo de MPB em Família', creator: 'Montanha Music', trackCount: 72 },
      { name: 'Poesia Cantada MPB', creator: 'Deezer', trackCount: 58 },
      { name: 'MPB Groove & Soul 70s', creator: 'Spotify', trackCount: 68 },
      { name: 'Canções da Bossa Nova', creator: 'Apple Music', trackCount: 82 },
      { name: 'MPB Acústico ao Vivo', creator: 'Som Livre', trackCount: 70 },
      { name: 'Mulheres da MPB', creator: 'Spotify', trackCount: 95 },
      { name: 'MPB & Jazz Brasileiro', creator: 'Deezer', trackCount: 62 },
      { name: 'Clube da Esquina & Minas', creator: 'Apple Music', trackCount: 55 },
      { name: 'Clássicos Tropicália 1968', creator: 'Spotify', trackCount: 50 },
      { name: 'MPB de Praia & Vento', creator: 'Montanha Music', trackCount: 64 },
      { name: 'MPB Filosófica & Reflexiva', creator: 'Deezer', trackCount: 52 },
      { name: 'Nordeste em MPB', creator: 'Spotify', trackCount: 85 },
      { name: 'Chorinho & MPB Instrumental', creator: 'Apple Music', trackCount: 60 },
      { name: 'MPB Suave Noite', creator: 'Deezer', trackCount: 56 },
      { name: 'MPB 80s & Baladas', creator: 'Som Livre', trackCount: 78 },
      { name: 'Violão Brasileiro Clássico', creator: 'Montanha Music', trackCount: 48 },
      { name: 'MPB para Ler e Estudar', creator: 'Spotify', trackCount: 66 },
      { name: 'MPB Rádio Nacional Histórica', creator: 'EBC', trackCount: 90 },
      { name: 'Sambas-Enredo & MPB', creator: 'Deezer', trackCount: 75 },
      { name: 'Samba-Canção Nostalgia', creator: 'Apple Music', trackCount: 58 },
      { name: 'Antologia MPB Brasil', creator: 'Montanha Music', trackCount: 130 }
    ]),
    albums: [
      { id: 'alb-djavan-luz', name: 'Luz', artist: 'Djavan', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80', trackCount: 10 },
      { id: 'alb-tim-1971', name: 'Tim Maia (1971)', artist: 'Tim Maia', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80', trackCount: 12 }
    ],
    artists: [
      { id: 'art-djavan', name: 'Djavan', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80', nbFan: 4800000 },
      { id: 'art-timmaia', name: 'Tim Maia', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80', nbFan: 5900000 }
    ]
  },
  {
    id: 'rap-funk',
    name: 'Rap/Funk Brasileiro',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    tagline: 'O peso dos graves, rimas afiadas e a vibração das ruas',
    topTracks: rapFunkTracks,
    playlists: createPlaylists('rf', 'linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)', rapFunkTracks, [
      { name: 'Trap Brasil 2026', creator: 'Spotify Brasil', trackCount: 120 },
      { name: 'Funk Mandrake & Fluxo', creator: 'GR6 Explode', trackCount: 80 },
      { name: 'Baile de Favela RJ & SP', creator: 'KondZilla', trackCount: 95 },
      { name: 'Trapstar RJ Destaque', creator: 'Deezer Brasil', trackCount: 75 },
      { name: 'Funk Consciente & Relatos', creator: 'Apple Music', trackCount: 68 },
      { name: 'Drill Brasil 140 BPM', creator: 'Spotify', trackCount: 82 },
      { name: 'Funk 150 BPM Proibidão', creator: 'Montanha Music', trackCount: 90 },
      { name: 'Trap Romântico & Love Songs', creator: 'Deezer', trackCount: 70 },
      { name: 'Boom Bap Nacional 90s', creator: 'Racionais MCs', trackCount: 85 },
      { name: 'Funk das Antigas Furacão 2000', creator: 'Furacão 2000', trackCount: 110 },
      { name: 'Batalha da Aldeia & Freestyle', creator: 'BDA', trackCount: 60 },
      { name: 'Trap de Quebrada', creator: 'Spotify', trackCount: 88 },
      { name: 'Funk Melody 90s Romântico', creator: 'Som Livre', trackCount: 75 },
      { name: 'Grime & Trap Nordeste', creator: 'Apple Music', trackCount: 64 },
      { name: 'Funk Automotivo Bass Boosted', creator: 'Montanha Music', trackCount: 100 },
      { name: 'Trap Acústico Sessão', creator: 'Pineapple Storm', trackCount: 55 },
      { name: 'Rimas de Ouro do Rap Nacional', creator: 'Deezer', trackCount: 92 },
      { name: 'Funk Rave & Eletrônico', creator: 'Spotify', trackCount: 78 },
      { name: 'Trap Mob & Collabs', creator: 'Sony Music', trackCount: 84 },
      { name: 'Rap de Mensagem & Resistência', creator: 'Apple Music', trackCount: 70 },
      { name: 'Funk Paulista Ostentação', creator: 'KondZilla', trackCount: 80 },
      { name: 'Drill SP & Zona Leste', creator: 'Deezer', trackCount: 65 },
      { name: 'Trap Instrumental Beats', creator: 'Montanha Music', trackCount: 50 },
      { name: 'Funk Bh Mandelão', creator: 'Spotify', trackCount: 90 },
      { name: 'Rap Feminino Brasil', creator: 'Deezer', trackCount: 72 },
      { name: 'Rimas e Poesias Acústicas', creator: 'Pineapple', trackCount: 62 },
      { name: 'Funk Ritmo Louco', creator: 'Spotify', trackCount: 85 },
      { name: 'Trap Sunset Chill', creator: 'Apple Music', trackCount: 58 },
      { name: 'Funk Tik Tok Virais', creator: 'Montanha Music', trackCount: 105 },
      { name: 'Cyphers & Poesia Acústica', creator: 'Spotify', trackCount: 66 },
      { name: 'Trap Pesado 808 Sub', creator: 'Coach Montanha', trackCount: 95 }
    ]),
    albums: [
      { id: 'alb-matue-mdt', name: 'Máquina do Tempo', artist: 'Matuê', cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80', trackCount: 7 },
      { id: 'alb-ret-lume', name: 'LUME', artist: 'Filipe Ret', cover: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=600&auto=format&fit=crop&q=80', trackCount: 11 }
    ],
    artists: [
      { id: 'art-matue', name: 'Matuê', image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80', nbFan: 11500000 },
      { id: 'art-ret', name: 'Filipe Ret', image: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=600&auto=format&fit=crop&q=80', nbFan: 8900000 }
    ]
  },
  {
    id: 'hip-hop',
    name: 'Rap/Hip Hop',
    gradient: 'linear-gradient(135deg, #e11d48 0%, #9f1239 100%)',
    glowColor: 'rgba(225, 29, 72, 0.4)',
    tagline: 'Flow potente, boom bap, 808s e rimas lendárias do rap mundial',
    topTracks: hipHopTracks,
    playlists: createPlaylists('hh', 'linear-gradient(135deg, #e11d48 0%, #9f1239 100%)', hipHopTracks, [
      { name: 'Hip Hop Royalty', creator: 'Spotify', trackCount: 90 },
      { name: 'Golden 90s East Coast vs West Coast', creator: 'Def Jam', trackCount: 75 },
      { name: 'Trap & Drill US Atlanta', creator: 'Apple Music', trackCount: 100 },
      { name: 'Rap Caviar Essentials', creator: 'Spotify', trackCount: 110 },
      { name: '2000s Rap Anthems', creator: 'Deezer', trackCount: 85 },
      { name: 'Chill Rap & Lofi Hip Hop', creator: 'Montanha Music', trackCount: 65 },
      { name: 'UK Drill & Grime London', creator: 'BBC 1Xtra', trackCount: 78 },
      { name: 'Conscious Rap & Lyricism', creator: 'Spotify', trackCount: 70 },
      { name: 'Southern Rap Dirty South', creator: 'Apple Music', trackCount: 82 },
      { name: 'Hip Hop Workout Power', creator: 'Coach Montanha', trackCount: 95 },
      { name: 'Rap Gods: 90s Classics', creator: 'Interscope', trackCount: 105 },
      { name: 'Melodic Trap 2026', creator: 'Deezer', trackCount: 88 },
      { name: 'Boom Bap Beats & Crates', creator: 'Spotify', trackCount: 60 },
      { name: 'Gangsta Rap Classics', creator: 'Death Row', trackCount: 92 },
      { name: 'R&B and Hip Hop Party', creator: 'Apple Music', trackCount: 115 },
      { name: 'Rap Collabs & Cyphers', creator: 'Montanha Music', trackCount: 74 },
      { name: 'Detroit Rap & Flow', creator: 'Shady Records', trackCount: 68 },
      { name: 'Hip Hop Instrumental Solos', creator: 'Spotify', trackCount: 52 },
      { name: 'Underground Rap Gems', creator: 'Deezer', trackCount: 58 },
      { name: 'French Rap & European Beats', creator: 'Deezer France', trackCount: 76 },
      { name: 'Rap Night Drive', creator: 'Apple Music', trackCount: 80 },
      { name: 'Fast Flow Rap Gods', creator: 'Spotify', trackCount: 62 },
      { name: 'Trap Bass Boosted Car Audio', creator: 'Montanha Music', trackCount: 100 },
      { name: '90s Queensbridge Legends', creator: 'Sony Hip Hop', trackCount: 55 },
      { name: 'Hip Hop Party Bangers', creator: 'Deezer', trackCount: 90 },
      { name: 'Golden Era Hip Hop 1994', creator: 'Spotify', trackCount: 84 },
      { name: 'Cloud Rap & Emo Rap', creator: 'Soundcloud Legends', trackCount: 70 },
      { name: 'West Coast G-Funk Era', creator: 'Death Row Records', trackCount: 86 },
      { name: 'UK Rap & Afroswing', creator: 'Apple Music', trackCount: 72 },
      { name: 'Hardcore Rap Pit', creator: 'Coach Montanha', trackCount: 64 },
      { name: 'Old School Block Party', creator: 'Spotify', trackCount: 98 }
    ]),
    albums: [
      { id: 'alb-kendrick-damn', name: 'DAMN.', artist: 'Kendrick Lamar', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80', trackCount: 14 },
      { id: 'alb-eminem-tes', name: 'The Eminem Show', artist: 'Eminem', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80', trackCount: 20 }
    ],
    artists: [
      { id: 'art-eminem', name: 'Eminem', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80', nbFan: 35000000 },
      { id: 'art-kendrick', name: 'Kendrick Lamar', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80', nbFan: 21000000 }
    ]
  },
  {
    id: 'reggaeton',
    name: 'Reggaeton',
    gradient: 'linear-gradient(135deg, #f43f5e 0%, #fb923c 100%)',
    glowColor: 'rgba(244, 63, 94, 0.4)',
    tagline: 'O ritmo latino contagiante, batidas envolventes e puro perreo',
    topTracks: reggaetonTracks,
    playlists: createPlaylists('reg', 'linear-gradient(135deg, #f43f5e 0%, #fb923c 100%)', reggaetonTracks, [
      { name: 'Perreo Intenso & Latino', creator: 'Spotify Latin', trackCount: 85 },
      { name: 'Reggaeton Clássico 2004-2012', creator: 'Universal Latin', trackCount: 95 },
      { name: 'Fiesta Latina & Verano', creator: 'Apple Music', trackCount: 100 },
      { name: 'Dembow Dominicano Puro', creator: 'Deezer', trackCount: 70 },
      { name: 'Bachata & Romantiqueo', creator: 'Sony Latin', trackCount: 80 },
      { name: 'Trap Latino Duro', creator: 'Spotify', trackCount: 90 },
      { name: 'Reggaeton Acústico Suave', creator: 'Montanha Music', trackCount: 60 },
      { name: 'Latin Pop Hits 2026', creator: 'Billboard Latin', trackCount: 105 },
      { name: 'Perreo Old School Puerto Rico', creator: 'Deezer', trackCount: 88 },
      { name: 'Cumbia & Reggaeton Beat', creator: 'Spotify', trackCount: 75 },
      { name: 'Salsa & Mambo Fest', creator: 'Apple Music', trackCount: 82 },
      { name: 'Reggaeton para Malhar', creator: 'Coach Montanha', trackCount: 95 },
      { name: 'Latin Urban Remixes', creator: 'Deezer', trackCount: 70 },
      { name: 'Perreo de Madrugada', creator: 'Spotify', trackCount: 85 },
      { name: 'Baladas Latinas de Amor', creator: 'Sony Latin', trackCount: 65 },
      { name: 'Reggaeton Femenino Divas', creator: 'Apple Music', trackCount: 78 },
      { name: 'Dembow 120 BPM Club', creator: 'Montanha Music', trackCount: 80 },
      { name: 'Latin Chill & Sunset Beach', creator: 'Deezer', trackCount: 55 },
      { name: 'Reggaeton Colombia Medellín', creator: 'Spotify', trackCount: 90 },
      { name: 'Reggaeton Mexica & Corrido Urbano', creator: 'Apple Music', trackCount: 84 },
      { name: 'Perreo Pesado 2026', creator: 'Montanha Music', trackCount: 110 },
      { name: 'Latin Grammy Winners', creator: 'Latin Recording Academy', trackCount: 60 },
      { name: 'Fiesta de Bodas Latina', creator: 'Spotify', trackCount: 95 },
      { name: 'Reggaeton Romántico', creator: 'Deezer', trackCount: 72 },
      { name: 'Latin House & Afrobeat Mix', creator: 'Apple Music', trackCount: 68 },
      { name: 'Perreo Under & Boliche', creator: 'Spotify', trackCount: 85 },
      { name: 'Latin Trap Kings', creator: 'Rimas Entertainment', trackCount: 76 },
      { name: 'Verano en Ibiza Latino', creator: 'Deezer', trackCount: 90 },
      { name: 'Cumbia Villera & RKT', creator: 'Montanha Music', trackCount: 82 },
      { name: 'Reggaeton & Afrobeats Fusion', creator: 'Spotify', trackCount: 70 },
      { name: 'Bailoteo Latino 2026', creator: 'Apple Music', trackCount: 115 }
    ]),
    albums: [
      { id: 'alb-bb-verano', name: 'Un Verano Sin Ti', artist: 'Bad Bunny', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80', trackCount: 23 }
    ],
    artists: [
      { id: 'art-badbunny', name: 'Bad Bunny', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80', nbFan: 30000000 }
    ]
  },
  {
    id: 'dance',
    name: 'Dance',
    gradient: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
    glowColor: 'rgba(251, 146, 60, 0.4)',
    tagline: 'Festivais eletrônicos, clubs e energia contagiante 128 BPM',
    topTracks: danceTracks,
    playlists: createPlaylists('dance', 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)', danceTracks, [
      { name: 'Mainstage Festival Hits', creator: 'Tomorrowland', trackCount: 100 },
      { name: 'Brazilian Bass & Alok', creator: 'Controversia', trackCount: 85 },
      { name: 'House Sunset & Chill', creator: 'Defected', trackCount: 75 },
      { name: 'Tech House Underground', creator: 'Beatport', trackCount: 90 },
      { name: 'Melodic Techno & Afterlife', creator: 'Afterlife', trackCount: 80 },
      { name: 'Trance Uplifting 138 BPM', creator: 'Armada Music', trackCount: 95 },
      { name: 'Drum & Bass Fast Beats', creator: 'Hospital Records', trackCount: 70 },
      { name: '90s Eurodance Anthems', creator: 'Spotify', trackCount: 110 },
      { name: 'Deep House Lounge & Pool', creator: 'Deezer', trackCount: 65 },
      { name: 'Progressive House Journey', creator: 'Anjunabeats', trackCount: 85 },
      { name: 'EDM Workout Motivation', creator: 'Coach Montanha', trackCount: 105 },
      { name: 'Synthwave & Retrowave 80s', creator: 'NewRetroWave', trackCount: 72 },
      { name: 'Dubstep Heavy Bass Drop', creator: 'Spinnin', trackCount: 88 },
      { name: 'Slap House & Radio Dance', creator: 'Spotify', trackCount: 92 },
      { name: 'Afro House Tulum Vibes', creator: 'Apple Music', trackCount: 60 },
      { name: 'Electro House Peak Time', creator: 'Ultra Records', trackCount: 85 },
      { name: 'Hardstyle & Hard Dance', creator: 'Q-Dance', trackCount: 78 },
      { name: 'Chillstep & Melodic Bass', creator: 'MrSuicideSheep', trackCount: 64 },
      { name: 'Ibiza Sunset Café Del Mar', creator: 'Café Del Mar', trackCount: 70 },
      { name: 'Disco House & Funk Groove', creator: 'Glitterbox', trackCount: 82 },
      { name: 'Future Rave & Big Room', creator: 'David Guetta & Morten', trackCount: 90 },
      { name: 'Bass House Club Bangers', creator: 'Confession', trackCount: 75 },
      { name: 'Minimal Techno Dark', creator: 'Drumcode', trackCount: 68 },
      { name: 'Tropical House Summer', creator: 'Kygo Music', trackCount: 84 },
      { name: 'UK Garage & 2-Step', creator: 'Spotify UK', trackCount: 62 },
      { name: 'Psytrance Forest & Full On', creator: 'Ozora', trackCount: 77 },
      { name: 'Festival Anthems 2012-2016', creator: 'EDC Las Vegas', trackCount: 120 },
      { name: 'Gaming EDM & NCS Beats', creator: 'NoCopyrightSounds', trackCount: 100 },
      { name: 'Workout Cardio 135 BPM', creator: 'Montanha Music', trackCount: 95 },
      { name: 'Vocal Trance Classics', creator: 'A State Of Trance', trackCount: 80 },
      { name: 'Rave Legends 90s', creator: 'Deezer', trackCount: 105 }
    ]),
    albums: [
      { id: 'alb-avicii-true', name: 'True', artist: 'Avicii', cover: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80', trackCount: 10 }
    ],
    artists: [
      { id: 'art-alok', name: 'Alok', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80', nbFan: 16000000 }
    ]
  },
  {
    id: 'rnb',
    name: 'R&B',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    glowColor: 'rgba(99, 102, 241, 0.4)',
    tagline: 'Vozes suaves, harmonias aveludadas e sensibilidade visceral',
    topTracks: rnbTracks,
    playlists: createPlaylists('rnb', 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', rnbTracks, [
      { name: 'R&B Chill & Soul', creator: 'Spotify', trackCount: 65 },
      { name: '2000s R&B Nostalgia', creator: 'Apple Music', trackCount: 90 },
      { name: 'Neo-Soul & Coffee Morning', creator: 'Deezer', trackCount: 75 },
      { name: 'Motown Classics 60s & 70s', creator: 'Motown Records', trackCount: 110 },
      { name: 'Contemporary R&B 2026', creator: 'Spotify', trackCount: 80 },
      { name: 'Slow Jams & Late Night', creator: 'Montanha Music', trackCount: 85 },
      { name: 'Smooth R&B Romance', creator: 'Apple Music', trackCount: 70 },
      { name: 'Trapsoul & Dark Vibes', creator: 'Deezer', trackCount: 68 },
      { name: 'R&B Duets of All Time', creator: 'Sony R&B', trackCount: 72 },
      { name: '90s R&B Queens & Boybands', creator: 'Spotify', trackCount: 95 },
      { name: 'Soulful Sunday Afternoon', creator: 'Apple Music', trackCount: 60 },
      { name: 'R&B Acoustic Sessions', creator: 'Montanha Music', trackCount: 55 },
      { name: 'R&B Workout Energy', creator: 'Coach Montanha', trackCount: 78 },
      { name: 'Modern Soul Revival', creator: 'Daptone', trackCount: 62 },
      { name: 'Retro Soul & Funk 70s', creator: 'Spotify', trackCount: 88 },
      { name: 'Midnight R&B Ride', creator: 'Deezer', trackCount: 74 },
      { name: 'R&B Heartbreak Anthems', creator: 'Apple Music', trackCount: 80 },
      { name: 'R&B Groove & Dance', creator: 'Spotify', trackCount: 84 },
      { name: 'Afro-R&B Sensations', creator: 'Deezer Africa', trackCount: 66 },
      { name: 'UK R&B & Soul Melodies', creator: 'BBC 1Xtra', trackCount: 70 },
      { name: 'Sexy R&B Slow Mood', creator: 'Montanha Music', trackCount: 75 },
      { name: 'Deep Soul Grooves', creator: 'Apple Music', trackCount: 58 },
      { name: '80s Boogie & Quiet Storm', creator: 'Spotify', trackCount: 82 },
      { name: 'R&B Vocal Powerhouses', creator: 'Deezer', trackCount: 90 },
      { name: 'Chillhop & Soul Blend', creator: 'Montanha Music', trackCount: 50 },
      { name: 'R&B Summer Sunset', creator: 'Spotify', trackCount: 64 },
      { name: 'Gospel Soul Awakening', creator: 'Apple Music', trackCount: 76 },
      { name: 'Sensual Soul & Candlelight', creator: 'Deezer', trackCount: 60 },
      { name: 'Acoustic Neo-Soul', creator: 'Spotify', trackCount: 52 },
      { name: '2000s Love Songs R&B', creator: 'Apple Music', trackCount: 85 },
      { name: 'Velvet R&B Sessions', creator: 'Montanha Music', trackCount: 100 }
    ]),
    albums: [
      { id: 'alb-sza-sos', name: 'SOS', artist: 'SZA', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80', trackCount: 23 }
    ],
    artists: [
      { id: 'art-sza', name: 'SZA', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80', nbFan: 14500000 }
    ]
  },
  {
    id: 'alternativo',
    name: 'Alternativo',
    gradient: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
    glowColor: 'rgba(20, 184, 166, 0.4)',
    tagline: 'Texturas sonoras indie, inovação e melodias fora da curva',
    topTracks: altTracks,
    playlists: createPlaylists('alt', 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)', altTracks, [
      { name: 'Indie Vibes & Chill Road', creator: 'Spotify', trackCount: 70 },
      { name: '2000s Indie Rock Anthems', creator: 'NME', trackCount: 85 },
      { name: 'Shoegaze & Dream Pop', creator: 'Apple Music', trackCount: 65 },
      { name: 'Post-Punk Revival', creator: 'Rough Trade', trackCount: 78 },
      { name: 'Indie Folk & Acoustic Woods', creator: 'Spotify', trackCount: 80 },
      { name: 'Bedroom Pop & Lo-Fi Indie', creator: 'Montanha Music', trackCount: 60 },
      { name: 'Indie Pop Summer Sun', creator: 'Deezer', trackCount: 75 },
      { name: 'Art Pop & Experimental', creator: 'Pitchfork', trackCount: 55 },
      { name: 'Indie Sleaze 2008', creator: 'Spotify', trackCount: 88 },
      { name: 'Psychedelic Indie Journey', creator: 'Apple Music', trackCount: 72 },
      { name: 'Dark Wave & Synth Post-Punk', creator: 'Deezer', trackCount: 64 },
      { name: 'Indie Rock Morning Coffee', creator: 'Spotify', trackCount: 58 },
      { name: 'Math Rock & Mid-West Emo', creator: 'Sub Pop', trackCount: 62 },
      { name: 'British Indie Explosion', creator: 'BBC 6 Music', trackCount: 90 },
      { name: 'Lo-Fi Garage Rock', creator: 'Montanha Music', trackCount: 50 },
      { name: 'Indie Electronic & Chillwave', creator: 'Ghostly', trackCount: 68 },
      { name: 'Surf Indie & Coast Road', creator: 'Apple Music', trackCount: 70 },
      { name: 'Brazilian Indie & Nova Cena', creator: 'Spotify Brasil', trackCount: 80 },
      { name: 'Melancholic Indie Rain', creator: 'Deezer', trackCount: 65 },
      { name: 'Indie Workout Upbeat', creator: 'Coach Montanha', trackCount: 75 },
      { name: '90s College Rock', creator: 'Matador Records', trackCount: 82 },
      { name: 'Dreamy Indie Night Drive', creator: 'Spotify', trackCount: 70 },
      { name: 'Indie Love Songs', creator: 'Apple Music', trackCount: 66 },
      { name: 'Indie Ballads Acoustic', creator: 'Deezer', trackCount: 54 },
      { name: 'Alt-Country & Americana', creator: 'Spotify Nashville', trackCount: 74 },
      { name: 'Grunge Revival & Noise', creator: 'Montanha Music', trackCount: 60 },
      { name: 'Indie Festival Anthems', creator: 'Glastonbury', trackCount: 105 },
      { name: 'Neo-Psychedelia Mind', creator: 'Tame Impala Radio', trackCount: 62 },
      { name: 'Indie Piano & Strings', creator: 'Apple Music', trackCount: 48 },
      { name: 'Nordic Indie & Synth', creator: 'Spotify Nordic', trackCount: 58 },
      { name: 'Underground Indie Discoveries', creator: 'Montanha Music', trackCount: 100 }
    ]),
    albums: [
      { id: 'alb-am-am', name: 'AM', artist: 'Arctic Monkeys', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80', trackCount: 12 }
    ],
    artists: [
      { id: 'art-arctic', name: 'Arctic Monkeys', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80', nbFan: 17800000 }
    ]
  },
  {
    id: 'treino-metal',
    name: 'Treino Pesado',
    gradient: 'linear-gradient(135deg, #b91c1c 0%, #450a0a 100%)',
    glowColor: 'rgba(185, 28, 28, 0.4)',
    tagline: 'Adrenalina pura, metalcore e peso para quebrar recordes no tatame e na barra',
    topTracks: treinoTracks,
    playlists: createPlaylists('tm', 'linear-gradient(135deg, #b91c1c 0%, #450a0a 100%)', treinoTracks, [
      { name: 'Treino Bruto 1RM | Coach Montanha', creator: 'Coach Montanha', trackCount: 150 },
      { name: 'Metalcore Heavy PR', creator: 'Roadrunner', trackCount: 85 },
      { name: 'Hardstyle & Gym Phonk', creator: 'Spotify', trackCount: 95 },
      { name: 'Nu-Metal Workout Rage', creator: 'Deezer', trackCount: 90 },
      { name: 'Deathcore & Heavy Metal Gym', creator: 'Nuclear Blast', trackCount: 75 },
      { name: 'Rock Pesado Barra & Halteres', creator: 'Coach Montanha', trackCount: 110 },
      { name: 'Adrenalina Pura Pré-Treino', creator: 'Apple Music', trackCount: 80 },
      { name: 'Industrial Metal & Rammstein', creator: 'Universal', trackCount: 70 },
      { name: 'Hip Hop Pesado Bass Boost', creator: 'Montanha Music', trackCount: 88 },
      { name: 'Thrash Metal Moshpit', creator: 'Spotify', trackCount: 82 },
      { name: 'Trap Metal & Scream', creator: 'Deezer', trackCount: 65 },
      { name: 'Powerlifting Savage Mode', creator: 'Coach Montanha', trackCount: 120 },
      { name: 'Viking Metal & Battle Cry', creator: 'Apple Music', trackCount: 60 },
      { name: 'Hard Rock Iron Gym', creator: 'Spotify', trackCount: 95 },
      { name: 'Heavy Beatdrop Motivation', creator: 'Montanha Music', trackCount: 85 },
      { name: 'CrossFit WOD & Metcon 1:1', creator: 'Coach Montanha', trackCount: 100 },
      { name: 'Hardcore Punk Fast Sprint', creator: 'Epitaph', trackCount: 68 },
      { name: 'Metal Brasil Sepultura & Angra', creator: 'Cogumelo', trackCount: 78 },
      { name: 'Doom Metal Slow Heavy', creator: 'Deezer', trackCount: 50 },
      { name: 'Groove Metal Pantera Style', creator: 'Atco Records', trackCount: 72 },
      { name: 'Gym Phonk Drift Brazil', creator: 'Montanha Music', trackCount: 90 },
      { name: 'Post-Hardcore & Emo Screams', creator: 'Spotify', trackCount: 80 },
      { name: 'Heavy Electronic Bass', creator: 'Apple Music', trackCount: 84 },
      { name: 'Symphonic Heavy Metal', creator: 'Nightwish Radio', trackCount: 65 },
      { name: 'Tatame Jiu-Jitsu & Luta', creator: 'Coach Montanha', trackCount: 105 },
      { name: 'Heavy Cardio & Corrida', creator: 'Nike Run Club', trackCount: 75 },
      { name: 'Leg Day No Mercy', creator: 'Coach Montanha', trackCount: 115 },
      { name: 'Heavy Iron & Chalk', creator: 'Rogue Fitness', trackCount: 90 },
      { name: 'Heavy Guitar Riffs Workout', creator: 'Spotify', trackCount: 85 },
      { name: 'Deadlift Day 100% PR', creator: 'Coach Montanha', trackCount: 130 },
      { name: 'Spartan War Beast Mode', creator: 'Montanha Music', trackCount: 140 }
    ]),
    albums: [
      { id: 'alb-metallica-mop', name: 'Master of Puppets', artist: 'Metallica', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80', trackCount: 8 }
    ],
    artists: [
      { id: 'art-metallica', name: 'Metallica', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80', nbFan: 25000000 }
    ]
  },
  {
    id: 'lofi-foco',
    name: 'Lo-Fi & Foco',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #4338ca 100%)',
    glowColor: 'rgba(124, 58, 237, 0.4)',
    tagline: 'Batidas relaxantes e instrumentais para estudo, leitura e foco absoluto',
    topTracks: lofiTracks,
    playlists: createPlaylists('lf', 'linear-gradient(135deg, #7c3aed 0%, #4338ca 100%)', lofiTracks, [
      { name: 'Lo-Fi Chill & Deep Focus', creator: 'Lofi Girl', trackCount: 120 },
      { name: 'Chillhop Study Beats', creator: 'Chillhop Music', trackCount: 95 },
      { name: 'Late Night Coding & Hack', creator: 'Montanha Music', trackCount: 85 },
      { name: 'Rainy Day Lo-Fi Coffee', creator: 'Spotify', trackCount: 80 },
      { name: 'Japanese Lo-Fi & Tokyo Night', creator: 'ChilledCow', trackCount: 75 },
      { name: 'Cozy Bedroom Lo-Fi', creator: 'Apple Music', trackCount: 70 },
      { name: 'Lo-Fi Hip Hop Nostalgia', creator: 'Deezer', trackCount: 90 },
      { name: 'Piano Lo-Fi Relax', creator: 'Spotify', trackCount: 65 },
      { name: 'Guitar Lo-Fi Sunset', creator: 'Montanha Music', trackCount: 60 },
      { name: 'Ambient & Synth Lo-Fi', creator: 'Apple Music', trackCount: 72 },
      { name: 'Lo-Fi Sleep & Dreams', creator: 'Deezer', trackCount: 100 },
      { name: 'Morning Coffee & Reading Lo-Fi', creator: 'Spotify', trackCount: 55 },
      { name: 'Jazzhop & Sax Lo-Fi', creator: 'Chillhop', trackCount: 68 },
      { name: 'Lo-Fi Gaming Relax', creator: 'Montanha Music', trackCount: 82 },
      { name: 'Nature Sounds & Lo-Fi Rain', creator: 'Apple Music', trackCount: 60 },
      { name: 'Vinyl Crackle Lo-Fi Beats', creator: 'Spotify', trackCount: 75 },
      { name: 'Peaceful Mind Meditation', creator: 'Calm', trackCount: 50 },
      { name: 'Lo-Fi Instrumental Chillout', creator: 'Deezer', trackCount: 85 },
      { name: 'Lofi Beats to Study to', creator: 'Lofi Girl', trackCount: 110 },
      { name: 'Sunset Walk Lo-Fi', creator: 'Apple Music', trackCount: 58 },
      { name: 'Aesthetic Lo-Fi Room', creator: 'Spotify', trackCount: 70 },
      { name: 'Autumn Leaves Lo-Fi', creator: 'Deezer', trackCount: 62 },
      { name: 'Space Ambient & Lo-Fi', creator: 'Montanha Music', trackCount: 66 },
      { name: 'Deep Work 90min Lo-Fi', creator: 'Focus at Will', trackCount: 90 },
      { name: 'Anime Nostalgia Lo-Fi', creator: 'Ghibli Lofi', trackCount: 78 },
      { name: 'Smooth Lo-Fi Rhodes', creator: 'Spotify', trackCount: 52 },
      { name: 'Midnight Library Lo-Fi', creator: 'Apple Music', trackCount: 64 },
      { name: 'Chill Vibes Only', creator: 'Deezer', trackCount: 80 },
      { name: 'Soft Beats for Focus', creator: 'Montanha Music', trackCount: 74 },
      { name: 'Lo-Fi Bossa Nova Brasil', creator: 'Spotify Brasil', trackCount: 60 },
      { name: 'Zen Garden Lo-Fi', creator: 'Buddha Chill', trackCount: 88 }
    ]),
    albums: [
      { id: 'alb-kupla-kib', name: 'Kingdom in Blue', artist: 'Kupla', cover: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&auto=format&fit=crop&q=80', trackCount: 10 }
    ],
    artists: [
      { id: 'art-kupla', name: 'Kupla', image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&auto=format&fit=crop&q=80', nbFan: 2100000 }
    ]
  },
  {
    id: 'samba-pagode',
    name: 'Samba/Pagode',
    gradient: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
    glowColor: 'rgba(234, 179, 8, 0.4)',
    tagline: 'Cavaquinho, pandeiro, alegria brasileira e romantismo de roda de samba',
    topTracks: sambaTracks,
    playlists: createPlaylists('sp', 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)', sambaTracks, [
      { name: 'Roda de Samba & Tardezinha', creator: 'Thiaguinho Oficial', trackCount: 80 },
      { name: 'Pagode 90s Romântico Ouro', creator: 'Som Livre', trackCount: 100 },
      { name: 'Samba de Raiz & Velha Guarda', creator: 'Portela & Mangueira', trackCount: 85 },
      { name: 'Pagode de Mesa & Cerveja Gelada', creator: 'Spotify Brasil', trackCount: 95 },
      { name: 'Churrasco de Domingo & Samba', creator: 'Deezer Brasil', trackCount: 90 },
      { name: 'Samba-Enredo Clássicos Carnaval', creator: 'Liesa Rio', trackCount: 110 },
      { name: 'Pagode Universitário & Pandeiro', creator: 'Apple Music', trackCount: 75 },
      { name: 'Samba Romântico Chorinho', creator: 'Montanha Music', trackCount: 65 },
      { name: 'Clássicos do Zeca & Almir Guineto', creator: 'Universal Samba', trackCount: 88 },
      { name: 'Pagode Novo & Resenha', creator: 'Spotify', trackCount: 82 },
      { name: 'Bossa & Samba Suave', creator: 'Deezer', trackCount: 60 },
      { name: 'Partido Alto de Bamba', creator: 'Fundo de Quintal', trackCount: 78 },
      { name: 'Samba Paulista & Terê', creator: 'Som Livre', trackCount: 70 },
      { name: 'Pagode Acústico Intimista', creator: 'Montanha Music', trackCount: 55 },
      { name: 'Samba de Gafieira Clássico', creator: 'Apple Music', trackCount: 68 },
      { name: 'Pagode das Antigas SPC & Soweto', creator: 'Spotify', trackCount: 92 },
      { name: 'Samba e Futebol Domingo', creator: 'Globo Esporte', trackCount: 80 },
      { name: 'Mulheres do Samba & Vozes', creator: 'Alcione & Beth Carvalho', trackCount: 85 },
      { name: 'Roda de Choro & Cavaquinho', creator: 'Deezer', trackCount: 58 },
      { name: 'Pagode Retrô Anos 2000', creator: 'Apple Music', trackCount: 88 },
      { name: 'Samba de Terreiro & Axé', creator: 'Spotify', trackCount: 65 },
      { name: 'Pagodão Bahia & Swingueira', creator: 'Salvador Produções', trackCount: 95 },
      { name: 'Sambas para Chorar de Amor', creator: 'Montanha Music', trackCount: 70 },
      { name: 'Samba Sunset Praia & Mar', creator: 'Deezer', trackCount: 62 },
      { name: 'Hinos do Pagode Romântico', creator: 'Spotify', trackCount: 105 },
      { name: 'Samba de Malandro', creator: 'Apple Music', trackCount: 74 },
      { name: 'Pagode e Rap Acústico', creator: 'Pineapple', trackCount: 60 },
      { name: 'Pagode Delas', creator: 'Marvvila & Ludmilla', trackCount: 80 },
      { name: 'Samba Raiz Rio de Janeiro', creator: 'Montanha Music', trackCount: 90 },
      { name: 'Boteco do Pagode', creator: 'Deezer', trackCount: 76 },
      { name: 'Tardezinha ao Vivo Maracanã', creator: 'Thiaguinho', trackCount: 120 }
    ]),
    albums: [
      { id: 'alb-zeca-vida', name: 'Deixa a Vida Me Levar', artist: 'Zeca Pagodinho', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80', trackCount: 14 }
    ],
    artists: [
      { id: 'art-zeca', name: 'Zeca Pagodinho', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80', nbFan: 6200000 }
    ]
  }
];
