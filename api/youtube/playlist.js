// Serverless API: Resolve faixas completas de uma playlist (Deezer, YouTube ou busca temática)
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const id = (req.query?.id || req.body?.id || '').trim();
  const title = (req.query?.title || req.query?.name || req.body?.title || '').trim();

  if (!id && !title) {
    return res.status(400).json({ error: 'ID ou título da playlist não fornecido' });
  }

  let songs = [];

  // 1. Caso Deezer (dz-pl-XXXX)
  if (id.startsWith('dz-pl-') || (/^\d+$/.test(id) && !id.startsWith('PL'))) {
    const dzId = id.replace('dz-pl-', '');
    try {
      const dzRes = await fetch(`https://api.deezer.com/playlist/${encodeURIComponent(dzId)}/tracks`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      if (dzRes.ok) {
        const data = await dzRes.json();
        if (Array.isArray(data.data) && data.data.length > 0) {
          songs = data.data.map((t) => ({
            id: `dz-${t.id}`,
            title: t.title || 'Música',
            artist: t.artist?.name || 'Artista',
            thumbnail: t.album?.cover_big || t.album?.cover_medium || '',
            duration: t.duration || 180,
            source: 'deezer',
            hasAudio: true
          }));
          return res.status(200).json({ id, title: title || 'Playlist Deezer', songs });
        }
      }
    } catch (err) {
      console.warn('Erro ao buscar playlist no Deezer:', err);
    }
  }

  // 2. Caso YouTube Playlist Oficial (PL... ou yt-pl-...)
  const cleanYtId = id.replace(/^yt-pl-/, '');
  if (cleanYtId.startsWith('PL') || cleanYtId.startsWith('UU') || cleanYtId.startsWith('RD')) {
    const pipedInstances = [
      'https://pipedapi.kavin.rocks',
      'https://api.piped.privacydev.net',
      'https://piped-api.lunar.icu'
    ];

    for (const inst of pipedInstances) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3500);
        const pipedRes = await fetch(`${inst}/playlists/${encodeURIComponent(cleanYtId)}`, {
          signal: controller.signal,
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        clearTimeout(timeout);

        if (pipedRes.ok) {
          const pData = await pipedRes.json();
          const items = Array.isArray(pData.relatedStreams) ? pData.relatedStreams : [];
          if (items.length > 0) {
            songs = items.slice(0, 50).map((v) => ({
              id: (v.url || '').replace('/watch?v=', '') || `yt-${Date.now()}`,
              title: v.title || 'Faixa YouTube',
              artist: v.uploaderName || 'Artista',
              thumbnail: v.thumbnail || '',
              duration: v.duration || 180,
              source: 'youtube',
              hasAudio: true
            }));
            return res.status(200).json({ id, title: pData.name || title, songs });
          }
        }
      } catch {}
    }
  }

  // 3. Fallback Dinâmico Inteligente: Se for playlist por nome (ex: "The Offspring", "Rock Pesado", etc.)
  // Busca as faixas mais representativas no catálogo para garantir que NUNCA fique vazia
  const searchTerm = title || id.replace('yt-pl-', '').replace('pl-', '');
  if (searchTerm) {
    try {
      const dzSearch = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(searchTerm)}&limit=25`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      if (dzSearch.ok) {
        const dzData = await dzSearch.json();
        if (Array.isArray(dzData.data) && dzData.data.length > 0) {
          songs = dzData.data.map((t) => ({
            id: `dz-${t.id}`,
            title: t.title || 'Música',
            artist: t.artist?.name || 'Artista',
            thumbnail: t.album?.cover_big || t.album?.cover_medium || '',
            duration: t.duration || 180,
            source: 'deezer',
            hasAudio: true
          }));
          return res.status(200).json({ id, title: title || searchTerm, songs });
        }
      }
    } catch {}
  }

  return res.status(200).json({ id, title, songs: [] });
}
