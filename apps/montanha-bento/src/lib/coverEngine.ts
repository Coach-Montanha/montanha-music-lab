import { Song, Playlist } from '../types';

// Busca a capa original do single ou álbum em Ultra HD (1000x1000 via Deezer ou 600x600 via iTunes)
export async function fetchRealTrackCover(songName: string, artist: string): Promise<string | null> {
  const cleanTitle = songName.replace(/\([^)]*\)|\[[^\]]*\]/g, '').trim();
  const cleanArtist = (artist || '').split(/[,&/]/)[0].trim();
  const query = `${cleanTitle} ${cleanArtist}`.trim();

  // 1. Tenta Deezer (Capas oficiais de gravadora em 1000x1000)
  try {
    const res = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=1`, {
      signal: AbortSignal.timeout(3500)
    });
    if (res.ok) {
      const data = await res.json();
      const first = data.data?.[0];
      const cover = first?.album?.cover_xl || first?.album?.cover_big || first?.album?.cover_medium;
      if (cover) return cover;
    }
  } catch {}

  // 2. Tenta iTunes Search API (Capas oficiais Apple Music em 600x600)
  try {
    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=1`, {
      signal: AbortSignal.timeout(3500)
    });
    if (res.ok) {
      const data = await res.json();
      const first = data.results?.[0];
      if (first?.artworkUrl100) {
        return first.artworkUrl100.replace('100x100bb', '600x600bb');
      }
    }
  } catch {}

  return null;
}

// Faz cache local permanente da imagem no CacheStorage do navegador (Offline Real PWA)
export async function cacheImageLocally(url: string): Promise<string> {
  if (!url || typeof window === 'undefined' || !('caches' in window)) return url;
  try {
    const cache = await window.caches.open('montanha-music-covers-v1');
    const cached = await cache.match(url);
    if (cached) {
      const blob = await cached.blob();
      return URL.createObjectURL(blob);
    }
    // Baixa e armazena em segundo plano
    const resp = await fetch(url, { mode: 'cors' });
    if (resp.ok) {
      await cache.put(url, resp.clone());
      const blob = await resp.blob();
      return URL.createObjectURL(blob);
    }
  } catch {}
  return url;
}

// Download direto do arquivo de imagem (.jpg) para a galeria / downloads do dispositivo
export async function downloadImageFile(imageUrl: string, filename: string): Promise<boolean> {
  try {
    const resp = await fetch(imageUrl, { mode: 'cors' });
    if (!resp.ok) throw new Error('Falha ao baixar imagem');
    const blob = await resp.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `${filename.replace(/[^a-zA-Z0-9_-]/g, '_')}_capa.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    return true;
  } catch {
    // Fallback caso CORS bloqueie download direto: abre a imagem em nova aba
    window.open(imageUrl, '_blank');
    return false;
  }
}

// Varre e enriquece todas as músicas de uma playlist com capas reais individuais
export async function enrichPlaylistTracks(
  playlist: Playlist,
  onProgress?: (done: number, total: number) => void
): Promise<Playlist> {
  const songs = [...(playlist.songs || [])];
  const updatedSongs: Song[] = [];

  for (let i = 0; i < songs.length; i++) {
    const s = songs[i];
    // Se a música tem a mesma capa da playlist, ou miniatura de placeholder
    const isSharedCover = !s.thumbnail || s.thumbnail === playlist.cover;

    if (isSharedCover) {
      try {
        const realCover = await fetchRealTrackCover(s.name, s.artist);
        if (realCover) {
          updatedSongs.push({ ...s, thumbnail: realCover });
        } else {
          updatedSongs.push(s);
        }
      } catch {
        updatedSongs.push(s);
      }
    } else {
      updatedSongs.push(s);
    }

    if (onProgress) {
      onProgress(i + 1, songs.length);
    }
  }

  return {
    ...playlist,
    songs: updatedSongs
  };
}
