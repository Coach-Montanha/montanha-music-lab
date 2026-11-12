import { Song, Playlist } from '../types';

export async function extractPlaylistFromUrl(url: string): Promise<Playlist | null> {
  const clean = url.trim();

  // 1. PLAYLIST DO SPOTIFY
  if (clean.includes('spotify.com')) {
    const match = clean.match(/playlist\/([a-zA-Z0-9]+)/);
    const playId = match ? match[1] : clean;

    // Tentar API local do backend
    try {
      const localRes = await fetch(`/api/spotify/playlist?url=${encodeURIComponent(playId)}`);
      if (localRes.ok) {
        const data = await localRes.json();
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
    } catch {}

    // Extração direta via Spotify Embed (__NEXT_DATA__)
    const embedUrl = `https://open.spotify.com/embed/playlist/${playId}`;
    const proxies = [
      `https://api.allorigins.win/raw?url=${encodeURIComponent(embedUrl)}`,
      `https://corsproxy.io/?url=${encodeURIComponent(embedUrl)}`
    ];

    for (const proxy of proxies) {
      try {
        const resp = await fetch(proxy);
        if (resp.ok) {
          const html = await resp.text();
          const matchScript = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);
          if (matchScript && matchScript[1]) {
            const parsed = JSON.parse(matchScript[1]);
            const entity = parsed?.props?.pageProps?.state?.data?.entity;
            if (entity) {
              const name = entity.title || entity.name || 'Playlist Spotify';
              const cover = entity.coverArt?.sources?.[0]?.url || entity.visualIdentity?.image?.[0]?.url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80';
              const rawTracks = entity.trackList || entity.tracks || [];

              const songs: Song[] = rawTracks.map((t: any, idx: number) => ({
                id: `sp-track-${t.id || idx}-${Date.now()}`,
                name: t.title || t.name || 'Música',
                artist: t.subtitle || t.artists?.[0]?.name || 'Artista',
                album: t.album?.name || name,
                thumbnail: t.coverArt?.sources?.[0]?.url || cover,
                duration: Math.round((t.duration || 180000) / 1000)
              }));

              if (songs.length > 0) {
                return {
                  id: `sp-pl-${playId}-${Date.now()}`,
                  name,
                  creator: entity.owner?.name || 'Spotify',
                  cover,
                  songs,
                  isCustom: true
                };
              }
            }
          }
        }
      } catch {}
    }
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
          const resp = await fetch(`${inst}/playlists/${encodeURIComponent(listId)}`);
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
