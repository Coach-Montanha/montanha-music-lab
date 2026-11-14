export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const id = (req.query?.id || req.body?.id || '').trim();
  const query = (req.query?.q || req.query?.query || req.body?.query || '').trim();

  if (!id && !query) {
    return res.status(400).json({ error: 'ID ou query do vídeo obrigatório' });
  }

  let cleanId = id.replace(/^yt-/, '').replace(/https?:\/\/(www\.)?youtube\.com\/watch\?v=/, '').split('&')[0];
  const isValidYoutubeId = /^[a-zA-Z0-9_-]{11}$/.test(cleanId);

  const invidiousHosts = [
    'https://echostreamz.com'
  ];

  // Função auxiliar para selecionar o melhor stream de áudio (AAC/m4a preferencial)
  function selectBestAudio(data, host) {
    const audios = (data.adaptiveFormats || []).filter(
      (f) => f.type && (f.type.startsWith('audio/mp4') || f.type.startsWith('audio/webm'))
    );
    if (audios.length === 0) return null;

    audios.sort((a, b) => {
      const aMp4 = a.type.startsWith('audio/mp4') ? 1 : 0;
      const bMp4 = b.type.startsWith('audio/mp4') ? 1 : 0;
      if (aMp4 !== bMp4) return bMp4 - aMp4;
      return (parseInt(b.bitrate) || 0) - (parseInt(a.bitrate) || 0);
    });

    const best = audios[0];
    if (!best.url) return null;

    try {
      const proxiedUrl = best.url.replace(new URL(best.url).origin, host);
      return {
        url: proxiedUrl,
        title: data.title,
        artist: data.author,
        duration: Number(data.lengthSeconds) || 240,
        mimeType: best.type.split(';')[0] || 'audio/mp4'
      };
    } catch {
      return null;
    }
  }

  // 1. Tenta extrair áudio diretamente pelo ID
  if (cleanId && isValidYoutubeId) {
    for (const host of invidiousHosts) {
      try {
        const resp = await fetch(`${host}/api/v1/videos/${encodeURIComponent(cleanId)}`, {
          signal: AbortSignal.timeout(3500),
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        if (resp.ok) {
          const data = await resp.json();
          const result = selectBestAudio(data, host);
          if (result) {
            return res.status(200).json(result);
          }
        }
      } catch {}
    }
  }

  // 2. Busca por termo ou query alternativa (com 'audio' para focar na faixa de música oficial)
  const searchTerm = (query || (isValidYoutubeId ? '' : cleanId) || '').trim();
  if (searchTerm) {
    for (const host of invidiousHosts) {
      try {
        const searchResp = await fetch(
          `${host}/api/v1/search?q=${encodeURIComponent(`${searchTerm} audio`)}&type=video`,
          {
            signal: AbortSignal.timeout(3500),
            headers: { 'User-Agent': 'Mozilla/5.0' }
          }
        );
        if (searchResp.ok) {
          const searchData = await searchResp.json();
          for (const item of (searchData || []).slice(0, 3)) {
            if (!item?.videoId) continue;
            try {
              const vResp = await fetch(`${host}/api/v1/videos/${encodeURIComponent(item.videoId)}`, {
                signal: AbortSignal.timeout(3000),
                headers: { 'User-Agent': 'Mozilla/5.0' }
              });
              if (vResp.ok) {
                const vData = await vResp.json();
                const result = selectBestAudio(vData, host);
                if (result) {
                  return res.status(200).json(result);
                }
              }
            } catch {}
          }
        }
      } catch {}
    }
  }

  // 3. Fallback: devolve o ID do YouTube limpo caso o stream direto falhe
  if (cleanId && isValidYoutubeId) {
    return res.status(200).json({
      url: `https://www.youtube.com/watch?v=${cleanId}`,
      youtubeId: cleanId,
      mimeType: 'video/youtube'
    });
  }

  return res.status(404).json({ error: 'Stream de áudio não encontrado' });
}
