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

// Sincronização em nuvem resiliente entre PC e Dispositivos Móveis
export async function syncCloudPlaylists(userId: string, playlists: any[]) {
  // 1. Tenta via API Serverless de alta velocidade e privilégio de admin
  try {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'albertosarly@gmail.com', playlists })
    });
    if (res.ok) {
      console.log('Playlists sincronizadas com sucesso via /api/sync!');
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
  } catch (err) {
    console.warn('Falha no sync de playlists:', err);
  }
}

export async function fetchCloudPlaylists(userId: string): Promise<any[] | null> {
  // 1. Tenta via API Serverless /api/sync
  try {
    const res = await fetch('/api/sync', { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.playlists) && data.playlists.length > 0) {
        console.log(`Recuperadas ${data.playlists.length} playlists via /api/sync!`);
        return data.playlists;
      }
    }
  } catch {}

  // 2. Fallback: Supabase Client direto
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (!error && user?.user_metadata?.able_playlists) {
      return user.user_metadata.able_playlists;
    }
  } catch (err) {
    console.warn('Falha ao carregar playlists da nuvem:', err);
  }
  return null;
}
