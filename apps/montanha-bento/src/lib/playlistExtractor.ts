import { Song, Playlist } from '../types';

export async function extractPlaylistFromUrl(url: string): Promise<Playlist | null> {
  const clean = url.trim();

  // 1. PLAYLIST DO SPOTIFY
  if (clean.includes('spotify.com') || clean.includes('spotify:playlist')) {
    const match = clean.match(/playlist\/([a-zA-Z0-9]+)/);
    const playId = match ? match[1] : clean.replace('spotify:playlist:', '').trim();

    // Tentar endpoint /api/spotify (Vercel Serverless Function & Vite dev server)
    try {
      const apiRes = await fetch(`/api/spotify?url=${encodeURIComponent(playId)}`, { signal: AbortSignal.timeout(12000) });
      if (apiRes.ok) {
        const data = await apiRes.json();
        if (data && data.name && Array.isArray(data.songs) && data.songs.length > 0) {
          return {
            id: `sp-pl-${playId}-${Date.now()}`,
            name: data.name,
            creator: data.creator || 'Spotify',
            cover: data.cover || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
            songs: data.songs,
            isCustom: true
          };
        }
      }
    } catch (err) {
      console.warn('API /api/spotify:', err);
    }

    // Fallback: oEmbed oficial do Spotify (Metadados garantidos)
    try {
      const oembedRes = await fetch(`https://open.spotify.com/oembed?url=https://open.spotify.com/playlist/${playId}`, { signal: AbortSignal.timeout(6000) });
      if (oembedRes.ok) {
        const oembed = await oembedRes.json();
        return {
          id: `sp-pl-${playId}-${Date.now()}`,
          name: oembed.title || 'Playlist Spotify',
          creator: 'Spotify',
          cover: oembed.thumbnail_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
          songs: [
            {
              id: `sp-track-${playId}-1`,
              name: oembed.title,
              artist: 'Vários Artistas',
              thumbnail: oembed.thumbnail_url,
              duration: 240
            }
          ],
          isCustom: true
        };
      }
    } catch {}
  }

  // 2. PLAYLIST DO YOUTUBE / YOUTUBE MUSIC
  if (clean.includes('youtube.com') || clean.includes('youtu.be')) {
    let listId = '';
    const match = clean.match(/[?&]list=([a-zA-Z0-9_-]+)/);
    if (match) {
      listId = match[1];
    } else {
      listId = clean;
    }

    if (listId) {
      const pipedInstances = [
        'https://api.piped.private.coffee',
        'https://pipedapi.adminforge.de',
        'https://piped.video/api/v1'
      ];

      for (const inst of pipedInstances) {
        try {
          const resp = await fetch(`${inst}/playlists/${encodeURIComponent(listId)}`, { signal: AbortSignal.timeout(6000) });
          if (resp.ok) {
            const data = await resp.json();
            const relatedStreams = data.relatedStreams || [];
            if (relatedStreams.length > 0) {
              const songs: Song[] = relatedStreams.map((item: any, idx: number) => ({
                id: `yt-${item.url ? item.url.replace('/watch?v=', '').split('&')[0] : idx}`,
                name: item.title || 'Música',
                artist: item.uploaderName || 'YouTube Music',
                youtubeId: item.url ? item.url.replace('/watch?v=', '').split('&')[0] : undefined,
                thumbnail: item.thumbnail || data.thumbnailUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80',
                duration: item.duration || 210
              }));

              return {
                id: `yt-pl-${listId}-${Date.now()}`,
                name: data.name || 'Playlist do YouTube',
                creator: data.uploader || 'YouTube',
                cover: data.thumbnailUrl || songs[0]?.thumbnail || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80',
                songs,
                isCustom: true
              };
            }
          }
        } catch {}
      }
    }
  }

  return null;
}
