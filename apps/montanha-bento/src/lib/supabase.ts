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

// Sincronização em nuvem resiliente entre PC e Dispositivos Móveis com Trava Anti-Zeramento
export async function syncCloudPlaylists(userId: string, playlists: any[], allowEmpty: boolean = false) {
  if (!Array.isArray(playlists)) return;

  // Trava de segurança inegociável: impede que limpar a tela do celular apague o acervo na nuvem
  if (playlists.length === 0 && !allowEmpty) {
    console.warn('Proteção de Nuvem: Bloqueada sobrescrita acidental da nuvem com 0 playlists.');
    return;
  }

  // 1. Tenta via API Serverless de alta velocidade e privilégio de admin (/api/sync)
  try {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'albertosarly@gmail.com', playlists })
    });
    if (res.ok) {
      console.log(`[Cloud Sync] ${playlists.length} playlists salvas via /api/sync!`);
      return;
    }
  } catch {}

  // 2. Fallback: Supabase Client direto
  try {
    await supabase.auth.updateUser({
      data: {
        able_playlists: playlists,
        synced_at: new Date().toISOString()
      }
    });
    console.log(`[Cloud Sync] ${playlists.length} playlists salvas via Supabase client.`);
  } catch (err) {
    console.warn('Falha no sync de playlists:', err);
  }
}

export async function fetchCloudPlaylists(userId?: string): Promise<any[] | null> {
  // 1. Tenta via API Serverless /api/sync
  try {
    const res = await fetch('/api/sync', { signal: AbortSignal.timeout(6000) });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.playlists) && data.playlists.length > 0) {
        console.log(`[Cloud Pull] ${data.playlists.length} playlists recuperadas via /api/sync!`);
        return data.playlists;
      }
    }
  } catch {}

  // 2. Tenta diretamente do Supabase Storage Público (Sem limites e super rápido)
  try {
    const targetUid = userId || '3f954063-c246-4989-8f48-dc84a12f5be3';
    const storageRes = await fetch(`${SUPABASE_URL}/storage/v1/object/public/music-playlists/${targetUid}.json?t=${Date.now()}`, {
      signal: AbortSignal.timeout(5000)
    });
    if (storageRes.ok) {
      const sData = await storageRes.json();
      if (Array.isArray(sData.playlists) && sData.playlists.length > 0) {
        console.log(`[Cloud Pull] ${sData.playlists.length} playlists recuperadas do Supabase Storage!`);
        return sData.playlists;
      }
    }
  } catch {}

  // 3. Fallback: Supabase Client direto
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (!error && user?.user_metadata?.able_playlists && Array.isArray(user.user_metadata.able_playlists) && user.user_metadata.able_playlists.length > 0) {
      console.log(`[Cloud Pull] ${user.user_metadata.able_playlists.length} playlists recuperadas via Supabase user metadata.`);
      return user.user_metadata.able_playlists;
    }
  } catch (err) {
    console.warn('Falha ao carregar playlists da nuvem:', err);
  }

  return null;
}
