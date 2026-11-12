import { Song } from '../types';

export async function universalSearch(query: string): Promise<Song[]> {
  const q = query.trim();
  if (!q) return [];

  const results: Song[] = [];

  // 1. Apple Music / iTunes Search API (100% nativo com CORS Aberto, streaming instantâneo sem proxy)
  try {
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&entity=song&limit=30`;
    const resp = await fetch(itunesUrl);
    if (resp.ok) {
      const data = await resp.json();
      const items = data.results || [];
      if (items.length > 0) {
        for (const item of items) {
          if (item.trackName && item.previewUrl) {
            const highResArt = (item.artworkUrl100 || '').replace('100x100bb', '600x600bb');
            results.push({
              id: `itunes-${item.trackId}`,
              name: item.trackName,
              artist: item.artistName || 'Artista',
              album: item.collectionName,
              thumbnail: highResArt || item.artworkUrl100 || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80',
              duration: item.trackTimeMillis ? Math.round(item.trackTimeMillis / 1000) : 210,
              audioUrl: item.previewUrl
            });
          }
        }
        if (results.length > 0) return results;
      }
    }
  } catch (err) {
    console.warn('iTunes Search:', err);
  }

  // 2. Fallback: Piped & Invidious (Para músicas do YouTube Music)
  const videoInstances = [
    'https://api.piped.private.coffee',
    'https://pipedapi.adminforge.de',
    'https://inv.tux.pizza/api/v1'
  ];

  for (const inst of videoInstances) {
    try {
      const isInv = inst.includes('inv');
      const url = isInv
        ? `${inst}/search?q=${encodeURIComponent(q)}&type=video`
        : `${inst}/search?q=${encodeURIComponent(q)}&filter=music_songs`;

      const resp = await fetch(url);
      if (resp.ok) {
        const data = await resp.json();
        const items = isInv ? data : (data.items || []);
        for (const item of items) {
          const ytId = isInv ? item.videoId : (item.url || '').replace('/watch?v=', '').split('&')[0];
          if (ytId) {
            results.push({
              id: `yt-${ytId}`,
              name: item.title || 'Música',
              artist: (isInv ? item.author : item.uploaderName) || 'Artista',
              youtubeId: ytId,
              thumbnail: (item.videoThumbnails?.[0]?.url || item.thumbnail) || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80',
              duration: item.lengthSeconds || item.duration || 210
            });
          }
        }
        if (results.length > 0) return results;
      }
    } catch {}
  }

  return results;
}
