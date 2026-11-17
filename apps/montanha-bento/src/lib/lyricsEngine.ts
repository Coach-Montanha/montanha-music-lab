/**
 * LyricsEngine: Motor de Letras & Legendas Sincronizadas em Tempo Real (LRCLIB)
 * 
 * - Integração 100% gratuita, aberta e de alta fidelidade com a LRCLIB API.
 * - Suporte a letras sincronizadas milissegundo a milissegundo (formato LRC).
 * - Fallback inteligente para letras em texto puro e faixas instrumentais.
 * - Cache em memória para transições instantâneas entre faixas.
 */

export interface LyricLine {
  time: number; // segundos com casas decimais (ex: 62.04)
  text: string;
}

export interface LyricsData {
  id?: number;
  trackName: string;
  artistName: string;
  isSynced: boolean;
  lines: LyricLine[];
  plainText?: string;
  isInstrumental?: boolean;
}

const lyricsCache = new Map<string, LyricsData | null>();

function cleanSearchTerm(str: string): string {
  return (str || '')
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/feat\..*$/i, '')
    .replace(/ft\..*$/i, '')
    .replace(/[^\p{L}\p{N}\s'-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Converte texto LRC [mm:ss.xx] em array ordenado de linhas com timestamp
 */
export function parseLrc(lrcText: string): LyricLine[] {
  if (!lrcText) return [];
  const lines: LyricLine[] = [];
  const regex = /\[(\d{2}):(\d{2}(?:\.\d{1,3})?)\](.*)/;

  const rawLines = lrcText.split('\n');
  for (const raw of rawLines) {
    const match = raw.match(regex);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseFloat(match[2]);
      const text = match[3].trim();
      const time = minutes * 60 + seconds;
      lines.push({ time, text });
    }
  }

  return lines.sort((a, b) => a.time - b.time);
}

/**
 * Busca letras sincronizadas na LRCLIB API
 */
export async function fetchLyrics(trackName: string, artistName: string, duration?: number): Promise<LyricsData | null> {
  const cleanTitle = cleanSearchTerm(trackName);
  const cleanArtist = cleanSearchTerm(artistName);
  const cacheKey = `${cleanTitle.toLowerCase()}---${cleanArtist.toLowerCase()}`;

  if (lyricsCache.has(cacheKey)) {
    return lyricsCache.get(cacheKey) || null;
  }

  try {
    // 1. Tenta correspondência exata via /api/get
    const params = new URLSearchParams();
    params.set('track_name', cleanTitle);
    params.set('artist_name', cleanArtist);
    if (duration && duration > 0) {
      params.set('duration', String(Math.floor(duration)));
    }

    const res = await fetch(`https://lrclib.net/api/get?${params.toString()}`, {
      signal: AbortSignal.timeout(4000)
    });

    if (res.ok) {
      const data = await res.json();
      if (data) {
        const parsed = processLyricsResponse(data, cleanTitle, cleanArtist);
        lyricsCache.set(cacheKey, parsed);
        return parsed;
      }
    }
  } catch {}

  // 2. Fallback: Busca aproximada via /api/search
  try {
    const searchParams = new URLSearchParams();
    searchParams.set('q', `${cleanTitle} ${cleanArtist}`.trim());

    const searchRes = await fetch(`https://lrclib.net/api/search?${searchParams.toString()}`, {
      signal: AbortSignal.timeout(4000)
    });

    if (searchRes.ok) {
      const list = await searchRes.json();
      if (Array.isArray(list) && list.length > 0) {
        // Encontra o melhor item (preferência para sincronizado)
        const best = list.find((item: any) => Boolean(item.syncedLyrics)) || list[0];
        const parsed = processLyricsResponse(best, cleanTitle, cleanArtist);
        lyricsCache.set(cacheKey, parsed);
        return parsed;
      }
    }
  } catch {}

  lyricsCache.set(cacheKey, null);
  return null;
}

function processLyricsResponse(data: any, fallbackTitle: string, fallbackArtist: string): LyricsData {
  const isInstrumental = Boolean(data.instrumental);
  const hasSynced = Boolean(data.syncedLyrics && data.syncedLyrics.trim());
  const lines = hasSynced ? parseLrc(data.syncedLyrics) : [];

  return {
    id: data.id,
    trackName: data.trackName || fallbackTitle,
    artistName: data.artistName || fallbackArtist,
    isSynced: hasSynced && lines.length > 0,
    lines,
    plainText: data.plainLyrics || undefined,
    isInstrumental
  };
}
