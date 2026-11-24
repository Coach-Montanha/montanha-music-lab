import { Song } from '../types';
import { fetchAudioStream, isDisallowedPreview } from './audioStreamEngine';
import { searchCategorized } from './searchEngine';

export interface HealResult {
  success: boolean;
  healedSong: Song;
  method: 'direct' | 'substituted' | 'failed';
  originalId: string;
}

/**
 * Tenta curar automaticamente uma faixa que se apresentou com falha ou sem áudio:
 * 1. Testa resolução direta de stream (caso a falha anterior tenha sido timeout temporário)
 * 2. Se falhar, busca automaticamente faixas alternativas (mesmo nome, artista, álbum)
 * 3. Valida se a alternativa possui áudio funcional antes de confirmar
 * 4. Retorna a faixa curada ou status 'failed' se nenhuma alternativa funcional existir
 */
export async function autoHealOrSubstituteSong(song: Song): Promise<HealResult> {
  const originalId = song.id;

  // 1. TENTATIVA DIRETA: Verifica se a faixa atual já toca com o motor otimizado
  try {
    const directStream = await fetchAudioStream(
      song.youtubeId,
      song.name,
      song.artist,
      song.audioUrl,
      song.id
    );
    if (directStream && (directStream.kind === 'audio' || directStream.kind === 'youtube')) {
      const healed = directStream.kind === 'youtube'
        ? { ...song, youtubeId: directStream.videoId }
        : { ...song, audioUrl: directStream.url };
      return {
        success: true,
        healedSong: healed,
        method: 'direct',
        originalId
      };
    }
  } catch {}

  // 1.5. RESOLUÇÃO VIA YOUTUBE AUDIO INTEGRAL (Garante 100% de disponibilidade para Rock, Metal, Nu-Metal e EDM)
  try {
    const query = `${song.artist || ''} ${song.name || ''}`.trim();
    if (query) {
      const ytResp = await fetch(`/api/youtube-search?q=${encodeURIComponent(query)}`, {
        signal: AbortSignal.timeout(4500)
      });
      if (ytResp.ok) {
        const ytData = await ytResp.json();
        if (ytData?.videoId && /^[a-zA-Z0-9_-]{11}$/.test(ytData.videoId)) {
          return {
            success: true,
            healedSong: {
              ...song,
              youtubeId: ytData.videoId,
              duration: song.duration || 210
            },
            method: 'direct',
            originalId
          };
        }
      }
    }
  } catch {}

  // 2. BUSCA DE ALTERNATIVAS POR TÍTULO, ARTISTA E ÁLBUM
  try {
    const rawName = song.name || '';
    const rawArtist = song.artist || '';

    // Higieniza termos de busca para aumentar chance de match
    const cleanTitle = rawName
      .replace(/\(.*?\)/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/feat\..*$/i, '')
      .replace(/ft\..*$/i, '')
      .replace(/-\s*20\d\d\s*remaster/i, '')
      .replace(/-\s*remastered/i, '')
      .replace(/-\s*ao vivo/i, '')
      .replace(/-\s*live/i, '')
      .replace(/\s+/g, ' ')
      .trim();

    const cleanArtist = rawArtist
      .split(/[,&/]|feat\.|ft\./i)[0]
      .replace(/[^\p{L}\p{N}\s'-]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();

    const queriesToTry = [
      `${rawName} ${cleanArtist || rawArtist}`.trim(),
      cleanTitle && cleanArtist ? `${cleanTitle} ${cleanArtist}` : null,
      cleanTitle || null
    ].filter(Boolean) as string[];

    let candidateSongs: Song[] = [];

    for (const q of queriesToTry) {
      try {
        const res = await searchCategorized(q, 'songs');
        const found = (res.songs || []).filter((s) => s.id !== song.id);
        if (found.length > 0) {
          candidateSongs = found;
          break;
        }
      } catch {}
    }

    if (candidateSongs.length > 0) {
      const lowerArtist = (cleanArtist || rawArtist).toLowerCase();
      const lowerTitle = (cleanTitle || rawName).toLowerCase();

      // Ordena por maior similaridade de artista e título
      candidateSongs.sort((a, b) => {
        const aArt = (a.artist || '').toLowerCase();
        const bArt = (b.artist || '').toLowerCase();
        const aTit = (a.name || '').toLowerCase();
        const bTit = (b.name || '').toLowerCase();

        let aScore = 0;
        let bScore = 0;

        if (lowerArtist && aArt.includes(lowerArtist)) aScore += 4;
        if (lowerArtist && bArt.includes(lowerArtist)) bScore += 4;
        if (lowerTitle && aTit.includes(lowerTitle)) aScore += 2;
        if (lowerTitle && bTit.includes(lowerTitle)) bScore += 2;

        return bScore - aScore;
      });

      // 1. Valida se algum dos candidatos possui stream imediato e funcional
      for (const cand of candidateSongs.slice(0, 5)) {
        try {
          const testStream = await fetchAudioStream(
            cand.youtubeId,
            cand.name,
            cand.artist,
            cand.audioUrl,
            cand.id
          );
          if (testStream && testStream.kind === 'audio' && !isDisallowedPreview(testStream.url, testStream.duration)) {
            const substituted: Song = {
              ...cand,
              id: cand.id,
              name: cand.name || song.name,
              artist: cand.artist || song.artist,
              album: cand.album || song.album,
              thumbnail: cand.thumbnail || song.thumbnail,
              duration: testStream.duration || cand.duration || song.duration || 210,
              audioUrl: testStream.url
            };
            return {
              success: true,
              healedSong: substituted,
              method: 'substituted',
              originalId
            };
          } else if (testStream && testStream.kind === 'youtube') {
            const substituted: Song = {
              ...cand,
              id: cand.id,
              name: cand.name || song.name,
              artist: cand.artist || song.artist,
              album: cand.album || song.album,
              thumbnail: cand.thumbnail || song.thumbnail,
              duration: testStream.duration || cand.duration || song.duration || 210,
              youtubeId: testStream.videoId
            };
            return {
              success: true,
              healedSong: substituted,
              method: 'substituted',
              originalId
            };
          }
        } catch {}
      }

      // Se nenhum candidato possui áudio funcional comprovado, não substitui às cegas para evitar loop de erros
      return {
        success: false,
        healedSong: song,
        method: 'failed',
        originalId
      };
    }
  } catch (err) {
    console.warn('[SongHealer] Falha ao procurar alternativas:', err);
  }

  // 3. Nenhuma alternativa funcional encontrada no momento
  return {
    success: false,
    healedSong: song,
    method: 'failed',
    originalId
  };
}
