import { Song, SearchAlbum, SearchArtist, SearchPlaylist, CategorizedSearchResults } from '../types';

// Busca categorizada completa (Músicas, Álbuns, Artistas e Playlists)
export async function searchCategorized(
  query: string,
  filterType: 'all' | 'songs' | 'albums' | 'artists' | 'playlists' = 'all'
): Promise<CategorizedSearchResults> {
  const q = query.trim();
  const emptyResult: CategorizedSearchResults = {
    songs: [],
    albums: [],
    artists: [],
    playlists: []
  };

  if (!q) return emptyResult;

  const apiType =
    filterType === 'songs'
      ? 'track'
      : filterType === 'albums'
      ? 'album'
      : filterType === 'artists'
      ? 'artist'
      : filterType === 'playlists'
      ? 'playlist'
      : 'all';

  // 1. Tenta API Serverless /api/search (Deezer Ultra HD em alta fidelidade)
  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&type=${apiType}`, {
      signal: AbortSignal.timeout(5000)
    });
    if (res.ok) {
      const data = await res.json();
      if (
        (data.songs && data.songs.length > 0) ||
        (data.albums && data.albums.length > 0) ||
        (data.artists && data.artists.length > 0) ||
        (data.playlists && data.playlists.length > 0)
      ) {
        return {
          songs: data.songs || [],
          albums: data.albums || [],
          artists: data.artists || [],
          playlists: data.playlists || []
        };
      }
    }
  } catch {}

  // 2. Fallback Aberto: iTunes API (CORS nativo sem servidor para Músicas, Álbuns e Artistas)
  try {
    const itunesPromises: Promise<any>[] = [];

    if (filterType === 'all' || filterType === 'songs') {
      itunesPromises.push(
        fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&entity=song&limit=25`, {
          signal: AbortSignal.timeout(4000)
        })
          .then((r) => (r.ok ? r.json() : { results: [] }))
          .then((d) => ({
            type: 'songs',
            items: (d.results || []).map((item: any) => ({
              id: `itunes-${item.trackId}`,
              name: item.trackName,
              artist: item.artistName || 'Artista',
              album: item.collectionName,
              thumbnail: (item.artworkUrl100 || '').replace('100x100bb', '600x600bb'),
              duration: item.trackTimeMillis ? Math.round(item.trackTimeMillis / 1000) : 210,
              audioUrl: item.previewUrl
            }))
          }))
          .catch(() => ({ type: 'songs', items: [] }))
      );
    }

    if (filterType === 'all' || filterType === 'albums') {
      itunesPromises.push(
        fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&entity=album&limit=15`, {
          signal: AbortSignal.timeout(4000)
        })
          .then((r) => (r.ok ? r.json() : { results: [] }))
          .then((d) => ({
            type: 'albums',
            items: (d.results || []).map((item: any) => ({
              id: `itunes-alb-${item.collectionId}`,
              rawId: item.collectionId,
              name: item.collectionName,
              artist: item.artistName || 'Artista',
              cover: (item.artworkUrl100 || '').replace('100x100bb', '600x600bb'),
              trackCount: item.trackCount || 0
            }))
          }))
          .catch(() => ({ type: 'albums', items: [] }))
      );
    }

    if (filterType === 'all' || filterType === 'artists') {
      itunesPromises.push(
        fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&entity=musicArtist&limit=12`, {
          signal: AbortSignal.timeout(4000)
        })
          .then((r) => (r.ok ? r.json() : { results: [] }))
          .then((d) => ({
            type: 'artists',
            items: (d.results || []).map((item: any) => ({
              id: `itunes-art-${item.artistId}`,
              rawId: item.artistId,
              name: item.artistName,
              image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
              nbAlbum: 0
            }))
          }))
          .catch(() => ({ type: 'artists', items: [] }))
      );
    }

    const itunesResults = await Promise.all(itunesPromises);
    const result: CategorizedSearchResults = { ...emptyResult };

    for (const r of itunesResults) {
      if (r.type === 'songs') result.songs = r.items;
      if (r.type === 'albums') result.albums = r.items;
      if (r.type === 'artists') result.artists = r.items;
    }

    if (result.songs.length > 0 || result.albums.length > 0 || result.artists.length > 0) {
      return result;
    }
  } catch {}

  return emptyResult;
}

// Busca faixas completas de um álbum, playlist ou top músicas de um artista
export async function fetchEntityTracks(
  rawId: string | number,
  entityType: 'album' | 'playlist' | 'artist',
  artistName?: string
): Promise<Song[]> {
  // 1. Tenta API Serverless /api/search?action=tracks
  try {
    const res = await fetch(`/api/search?action=tracks&id=${rawId}&entityType=${entityType}`, {
      signal: AbortSignal.timeout(6000)
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.songs) && data.songs.length > 0) {
        return data.songs;
      }
    }
  } catch {}

  // 2. Fallback iTunes para álbuns
  if (entityType === 'album' && rawId) {
    try {
      const res = await fetch(`https://itunes.apple.com/lookup?id=${rawId}&entity=song`, {
        signal: AbortSignal.timeout(5000)
      });
      if (res.ok) {
        const data = await res.json();
        const items = data.results || [];
        const songs: Song[] = [];
        for (const item of items) {
          if (item.wrapperType === 'track') {
            songs.push({
              id: `itunes-${item.trackId}`,
              name: item.trackName,
              artist: item.artistName || artistName || 'Artista',
              album: item.collectionName,
              thumbnail: (item.artworkUrl100 || '').replace('100x100bb', '600x600bb'),
              duration: item.trackTimeMillis ? Math.round(item.trackTimeMillis / 1000) : 210,
              audioUrl: item.previewUrl
            });
          }
        }
        if (songs.length > 0) return songs;
      }
    } catch {}
  }

  // 3. Fallback Artista: busca top músicas do artista no iTunes
  if (entityType === 'artist' && artistName) {
    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(artistName)}&media=music&entity=song&limit=30`, {
        signal: AbortSignal.timeout(5000)
      });
      if (res.ok) {
        const data = await res.json();
        return (data.results || []).map((item: any) => ({
          id: `itunes-${item.trackId}`,
          name: item.trackName,
          artist: item.artistName || artistName,
          album: item.collectionName,
          thumbnail: (item.artworkUrl100 || '').replace('100x100bb', '600x600bb'),
          duration: item.trackTimeMillis ? Math.round(item.trackTimeMillis / 1000) : 210,
          audioUrl: item.previewUrl
        }));
      }
    } catch {}
  }

  return [];
}

// Mantido para compatibilidade reversa
export async function universalSearch(query: string): Promise<Song[]> {
  const categorized = await searchCategorized(query, 'songs');
  return categorized.songs;
}
