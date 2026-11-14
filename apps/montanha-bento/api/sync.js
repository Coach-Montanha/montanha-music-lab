const SUPABASE_URL = 'https://muryznvaxzszcffrbxpv.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11cnl6bnZheHpzemNmZnJieHB2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDQ0MTE2OSwiZXhwIjoyMTAwMDE3MTY5fQ.SpYzAP5ej1jUKyIPGSowyZrG_eeox50HmKnP1r81a24';

const DEFAULT_ALBERTO_ID = '3f954063-c246-4989-8f48-dc84a12f5be3';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Identificação Rigorosa e Isolada do Perfil
  let userId = req.query?.userId || req.body?.userId;
  const email = req.query?.email || req.body?.email;

  // Se o email informado for o de Alberto e não tiver userId:
  if (!userId && email === 'albertosarly@gmail.com') {
    userId = DEFAULT_ALBERTO_ID;
  }

  // GET: Recupera playlists estritamente da conta solicitada
  if (req.method === 'GET') {
    if (!userId) {
      return res.status(200).json({ playlists: [], message: 'Nenhum perfil especificado' });
    }

    try {
      // 1. Tenta buscar do Storage isolado para este usuário (${userId}.json)
      const storageResp = await fetch(
        `${SUPABASE_URL}/storage/v1/object/public/music-playlists/${userId}.json?t=${Date.now()}`,
        {
          headers: { apikey: SUPABASE_SERVICE_ROLE_KEY }
        }
      );
      if (storageResp.ok) {
        const sData = await storageResp.json();
        if (Array.isArray(sData?.playlists)) {
          return res.status(200).json({ playlists: sData.playlists, synced_at: sData.synced_at });
        }
      }

      // 2. Se for o Alberto e ainda não estiver no arquivo do Storage, busca histórico
      if (userId === DEFAULT_ALBERTO_ID) {
        const resp = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
          headers: {
            apikey: SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
          }
        });
        if (resp.ok) {
          const data = await resp.json();
          const playlists = data.user_metadata?.able_playlists || [];
          return res.status(200).json({ playlists, synced_at: data.user_metadata?.synced_at });
        }
      }

      // Usuário novo ou sem acervo na nuvem: retorna lista vazia isolada (NUNCA vaza playlists de outro)
      return res.status(200).json({ playlists: [], synced_at: null });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // POST: Salva playlists na nuvem estritamente no arquivo do perfil autenticado
  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      const playlists = body.playlists || [];

      if (!userId) {
        return res.status(401).json({ error: 'É necessário estar autenticado para sincronizar playlists.' });
      }

      if (!Array.isArray(playlists)) {
        return res.status(400).json({ error: 'Playlists deve ser um array' });
      }

      const syncedAt = new Date().toISOString();

      // Salva no Supabase Storage no arquivo exclusivo daquele usuário (${userId}.json)
      const storageUpload = await fetch(`${SUPABASE_URL}/storage/v1/object/music-playlists/${userId}.json`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'x-upsert': 'true'
        },
        body: JSON.stringify({ playlists, synced_at: syncedAt })
      });

      if (storageUpload.ok) {
        return res.status(200).json({ success: true, userId, count: playlists.length, synced_at: syncedAt });
      } else {
        const errText = await storageUpload.text();
        return res.status(storageUpload.status).json({ error: errText });
      }
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
