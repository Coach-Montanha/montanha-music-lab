const SUPABASE_URL = 'https://muryznvaxzszcffrbxpv.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11cnl6bnZheHpzemNmZnJieHB2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDQ0MTE2OSwiZXhwIjoyMTAwMDE3MTY5fQ.SpYzAP5ej1jUKyIPGSowyZrG_eeox50HmKnP1r81a24';

const DEFAULT_ALBERTO_ID = '3f954063-c246-4989-8f48-dc84a12f5be3';

// Conjunto de UUIDs e perfis vinculados ao ecossistema do Alberto (PC, Motorola, Redmi, Hotmail)
const ALBERTO_ALIAS_IDS = new Set([
  DEFAULT_ALBERTO_ID,
  '4541d773-99e4-4eda-9ff3-69c44a491764', // Notebook / PC Edge
  '08fd3ca5-dc9a-4363-be88-9847c648cd6c', // Celular Motorola Chrome
  'd6e21a10-65dc-426b-a61e-62a03fe871d2', // Celular Redmi PWA
  'c4c3571d-883f-4164-91e4-3f20cc8666fa'  // albertosarly@hotmail.com
]);

function resolveCanonicalUserId(userId, email) {
  if (userId && ALBERTO_ALIAS_IDS.has(userId)) return DEFAULT_ALBERTO_ID;
  if (email) {
    const em = email.toLowerCase().trim();
    if (em.includes('alberto') || em.includes('coachmontanha')) {
      return DEFAULT_ALBERTO_ID;
    }
  }
  return userId || null;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Identificação e canonicalização do perfil
  let rawUserId = req.query?.userId || req.body?.userId;
  const email = req.query?.email || req.body?.email;
  const canonicalUserId = resolveCanonicalUserId(rawUserId, email);

  // GET: Recupera playlists da nuvem
  if (req.method === 'GET') {
    if (!canonicalUserId) {
      return res.status(200).json({ playlists: [], message: 'Nenhum perfil especificado' });
    }

    try {
      // 1. Tenta buscar do Storage canônico (${canonicalUserId}.json)
      const storageResp = await fetch(
        `${SUPABASE_URL}/storage/v1/object/public/music-playlists/${canonicalUserId}.json?t=${Date.now()}`,
        {
          headers: { apikey: SUPABASE_SERVICE_ROLE_KEY }
        }
      );
      if (storageResp.ok) {
        const sData = await storageResp.json();
        if (Array.isArray(sData?.playlists)) {
          return res.status(200).json({ playlists: sData.playlists, synced_at: sData.synced_at, canonicalUserId });
        }
      }

      // 2. Se for Alberto e ainda não estiver no arquivo canônico, tenta fallback nos aliases
      if (canonicalUserId === DEFAULT_ALBERTO_ID) {
        for (const aliasId of ALBERTO_ALIAS_IDS) {
          const aliasResp = await fetch(
            `${SUPABASE_URL}/storage/v1/object/public/music-playlists/${aliasId}.json?t=${Date.now()}`,
            { headers: { apikey: SUPABASE_SERVICE_ROLE_KEY } }
          );
          if (aliasResp.ok) {
            const aData = await aliasResp.json();
            if (Array.isArray(aData?.playlists) && aData.playlists.length > 0) {
              return res.status(200).json({ playlists: aData.playlists, synced_at: aData.synced_at, canonicalUserId });
            }
          }
        }
      }

      return res.status(200).json({ playlists: [], synced_at: null, canonicalUserId });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // POST: Salva playlists na nuvem de forma atômica e espelha para todos os aparelhos
  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      const playlists = body.playlists || [];

      if (!canonicalUserId) {
        return res.status(401).json({ error: 'É necessário estar autenticado para sincronizar playlists.' });
      }

      if (!Array.isArray(playlists)) {
        return res.status(400).json({ error: 'Playlists deve ser um array' });
      }

      const syncedAt = new Date().toISOString();

      // Se o usuário for Alberto, vamos salvar no canônico E espelhar em todos os aliases
      const targetIds = (canonicalUserId === DEFAULT_ALBERTO_ID)
        ? Array.from(ALBERTO_ALIAS_IDS)
        : [canonicalUserId];

      const payload = JSON.stringify({ playlists, synced_at: syncedAt, updated_by: rawUserId || canonicalUserId });

      // Salva em paralelo para garantir propagação instantânea em todos os dispositivos
      await Promise.all(
        targetIds.map(async (tId) => {
          try {
            await fetch(`${SUPABASE_URL}/storage/v1/object/music-playlists/${tId}.json`, {
              method: 'POST',
              headers: {
                apikey: SUPABASE_SERVICE_ROLE_KEY,
                Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                'Content-Type': 'application/json',
                'x-upsert': 'true'
              },
              body: payload
            });
          } catch (uploadErr) {
            console.error(`[Cloud Sync Mirror Err: ${tId}]`, uploadErr);
          }
        })
      );

      return res.status(200).json({
        success: true,
        canonicalUserId,
        count: playlists.length,
        synced_at: syncedAt
      });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
