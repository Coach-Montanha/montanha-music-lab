const SUPABASE_URL = 'https://muryznvaxzszcffrbxpv.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11cnl6bnZheHpzemNmZnJieHB2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDQ0MTE2OSwiZXhwIjoyMTAwMDE3MTY5fQ.SpYzAP5ej1jUKyIPGSowyZrG_eeox50HmKnP1r81a24';

const USER_ID = '3f954063-c246-4989-8f48-dc84a12f5be3'; // albertosarly@gmail.com

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Recupera playlists atualizadas da nuvem
  if (req.method === 'GET') {
    try {
      // 1. Tenta buscar do Storage (sem limite de tamanho 64KB)
      const storageResp = await fetch(
        `${SUPABASE_URL}/storage/v1/object/public/music-playlists/${USER_ID}.json?t=${Date.now()}`,
        {
          headers: { apikey: SUPABASE_SERVICE_ROLE_KEY }
        }
      );
      if (storageResp.ok) {
        const sData = await storageResp.json();
        if (sData?.playlists && sData.playlists.length > 0) {
          return res.status(200).json({ playlists: sData.playlists, synced_at: sData.synced_at });
        }
      }

      // 2. Fallback para user_metadata
      const resp = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${USER_ID}`, {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
        }
      });
      if (resp.ok) {
        const data = await resp.json();
        const playlists = data.user_metadata?.able_playlists || [];
        return res.status(200).json({ playlists, synced_at: data.user_metadata?.synced_at });
      } else {
        return res.status(resp.status).json({ error: 'Erro ao buscar no Supabase' });
      }
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // POST: Salva playlists na nuvem para retransmissão imediata entre PC e Celular
  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      const playlists = body.playlists || [];

      if (!Array.isArray(playlists)) {
        return res.status(400).json({ error: 'Playlists deve ser um array' });
      }

      const syncedAt = new Date().toISOString();

      // Salva no Supabase Storage (sem limite de 64KB)
      const storageUpload = await fetch(`${SUPABASE_URL}/storage/v1/object/music-playlists/${USER_ID}.json`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'x-upsert': 'true'
        },
        body: JSON.stringify({ playlists, synced_at: syncedAt })
      });

      // Tenta atualizar user_metadata secundariamente
      try {
        await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${USER_ID}`, {
          method: 'PUT',
          headers: {
            apikey: SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            user_metadata: {
              able_playlists: playlists.slice(0, 5),
              synced_at: syncedAt
            }
          })
        });
      } catch {}

      if (storageUpload.ok) {
        return res.status(200).json({ success: true, count: playlists.length, synced_at: syncedAt });
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
