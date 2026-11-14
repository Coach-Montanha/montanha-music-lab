import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://muryznvaxzszcffrbxpv.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11cnl6bnZheHpzemNmZnJieHB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ0NDExNjksImV4cCI6MjEwMDAxNzE2OX0.RHa_GLUGiRTVBGGCPvOcoLH6rh4IhyNM7YJWeJvI4Uo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'able-music-supabase-auth'
  }
});

// Sincronização em nuvem resiliente entre PC e Dispositivos Móveis com Isolamento Estrito de Perfil
export async function syncCloudPlaylists(userId: string, playlists: any[], allowEmpty: boolean = false) {
  if (!userId || !Array.isArray(playlists)) return;

  // Trava de segurança inegociável: impede que limpar a tela do celular apague o acervo na nuvem
  if (playlists.length === 0 && !allowEmpty) {
    console.warn('Proteção de Nuvem: Bloqueada sobrescrita acidental da nuvem com 0 playlists.');
    return;
  }

  // 1. Tenta via API Serverless /api/sync com userId individual
  try {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, playlists })
    });
    if (res.ok) {
      console.log(`[Cloud Sync] ${playlists.length} playlists salvas para perfil ${userId}!`);
      return;
    }
  } catch {}

  // 2. Fallback: Storage bucket direto isolado no arquivo do usuário (${userId}.json)
  try {
    await supabase.storage.from('music-playlists').upload(
      `${userId}.json`,
      new Blob([JSON.stringify({ playlists, synced_at: new Date().toISOString() })], { type: 'application/json' }),
      { upsert: true }
    );
    console.log(`[Cloud Sync] ${playlists.length} playlists salvas via Supabase Storage para ${userId}.`);
  } catch (err) {
    console.warn('Falha no sync de playlists:', err);
  }
}

export async function fetchCloudPlaylists(userId?: string): Promise<any[] | null> {
  if (!userId) return null;

  // 1. Tenta via API Serverless /api/sync?userId=...
  try {
    const res = await fetch(`/api/sync?userId=${encodeURIComponent(userId)}`, { signal: AbortSignal.timeout(6000) });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.playlists)) {
        console.log(`[Cloud Pull] ${data.playlists.length} playlists recuperadas para ${userId} via /api/sync!`);
        return data.playlists;
      }
    }
  } catch {}

  // 2. Tenta diretamente do Supabase Storage Público (${userId}.json)
  try {
    const storageRes = await fetch(`${SUPABASE_URL}/storage/v1/object/public/music-playlists/${userId}.json?t=${Date.now()}`, {
      signal: AbortSignal.timeout(5000)
    });
    if (storageRes.ok) {
      const sData = await storageRes.json();
      if (Array.isArray(sData.playlists)) {
        console.log(`[Cloud Pull] ${sData.playlists.length} playlists recuperadas do Storage para ${userId}!`);
        return sData.playlists;
      }
    }
  } catch {}

  return null;
}
