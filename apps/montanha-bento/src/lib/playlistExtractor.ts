import { Song, Playlist } from '../types';

function createTimeoutSignal(ms: number): AbortSignal {
  if (typeof AbortSignal !== 'undefined' && typeof (AbortSignal as any).timeout === 'function') {
    try {
      return (AbortSignal as any).timeout(ms);
    } catch {}
  }
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}

export async function extractPlaylistFromUrl(url: string): Promise<Playlist | null> {
  const clean = url.trim();
  if (!clean) return null;

  // 1. PLAYLIST, ÁLBUM, ARTISTA OU FAIXA DO SPOTIFY
  if (clean.includes('spotify.com') || clean.includes('spotify:')) {
    const match = clean.match(/(playlist|album|track|artist)[/:]([a-zA-Z0-9]+)/i);
    const type = match ? match[1].toLowerCase() : 'playlist';
    let playId = match ? match[2] : '';

    if (!playId) {
      const idMatch = clean.match(/([a-zA-Z0-9]{22})/);
      if (idMatch) {
        playId = idMatch[1];
      } else {
        playId = clean.replace(/.*playlist\//, '').split('?')[0].replace(/[^a-zA-Z0-9]/g, '');
      }
    }

    // Tenta endpoint /api/spotify (Serverless Function & Vite dev server)
    try {
      const apiRes = await fetch(`/api/spotify?url=${encodeURIComponent(clean)}`, {
        signal: createTimeoutSignal(10000)
      });
      if (apiRes.ok) {
        const data = await apiRes.json();
        if (data && data.name && Array.isArray(data.songs) && data.songs.length > 0) {
          return {
            id: `sp-${type}-${playId || Date.now()}`,
            name: data.name,
            creator: data.creator || 'Spotify',
            cover: data.cover || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
            songs: data.songs,
            isCustom: true
          };
        }
      }
    } catch (err) {
      console.warn('[Extractor] API /api/spotify erro/timeout:', err);
    }

    // Fallback: oEmbed oficial do Spotify APENAS para faixa única (track)
    if (type === 'track') {
      try {
        const oembedRes = await fetch(
          `https://open.spotify.com/oembed?url=https://open.spotify.com/track/${playId}`,
          { signal: createTimeoutSignal(4000) }
        );
        if (oembedRes.ok) {
          const oembed = await oembedRes.json();
          return {
            id: `sp-track-pl-${playId}-${Date.now()}`,
            name: oembed.title || 'Faixa Spotify',
            creator: 'Spotify',
            cover: oembed.thumbnail_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
            songs: [
              {
                id: `sp-track-${playId}-${Date.now()}`,
                name: oembed.title || 'Música',
                artist: 'Spotify',
                thumbnail: oembed.thumbnail_url,
                duration: 210
              }
            ],
            isCustom: true
          };
        }
      } catch {}
    }

    return null;
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
      const streamInstances = [
        'https://api.piped.private.coffee',
        'https://pipedapi.adminforge.de',
        'https://piped.video/api/v1',
        'https://inv.nadeko.net/api/v1',
        'https://invidious.nerdvpn.de/api/v1'
      ];

      for (const inst of streamInstances) {
        try {
          const resp = await fetch(`${inst}/playlists/${encodeURIComponent(listId)}`, {
            signal: createTimeoutSignal(6000)
          });
          if (resp.ok) {
            const data = await resp.json();
            const relatedStreams = data.relatedStreams || data.videos || [];
            if (relatedStreams.length > 0) {
              const songs: Song[] = relatedStreams.map((item: any, idx: number) => ({
                id: `yt-${item.url ? item.url.replace('/watch?v=', '').split('&')[0] : item.videoId || idx}`,
                name: item.title || 'Música',
                artist: item.uploaderName || item.author || 'YouTube Music',
                youtubeId: item.url ? item.url.replace('/watch?v=', '').split('&')[0] : item.videoId || undefined,
                thumbnail: item.thumbnail || item.videoThumbnails?.[0]?.url || data.thumbnailUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80',
                duration: item.duration || 210
              }));

              return {
                id: `yt-pl-${listId}-${Date.now()}`,
                name: data.name || data.title || 'Playlist do YouTube',
                creator: data.uploader || data.author || 'YouTube',
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
