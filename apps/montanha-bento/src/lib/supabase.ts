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

export async function syncCloudPlaylists(userId: string, playlists: any[]) {
  try {
    const { error } = await supabase.from('montanha_playlists').upsert(
      {
        id: `pl_user_${userId}`,
        user_id: userId,
        name: 'User Sync Playlists',
        description: JSON.stringify(playlists)
      },
      { onConflict: 'id' }
    );
    if (error) console.warn('Erro ao sincronizar playlists na nuvem:', error);
  } catch (err) {
    console.warn('Falha no sync de playlists:', err);
  }
}

export async function fetchCloudPlaylists(userId: string): Promise<any[] | null> {
  try {
    const { data, error } = await supabase
      .from('montanha_playlists')
      .select('description')
      .eq('id', `pl_user_${userId}`)
      .single();

    if (!error && data?.description) {
      return JSON.parse(data.description);
    }
  } catch (err) {
    console.warn('Falha ao carregar playlists da nuvem:', err);
  }
  return null;
}
