import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://muryznvaxzszcffrbxpv.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11cnl6bnZheHpzemNmZnJieHB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ0NDExNjksImV4cCI6MjEwMDAxNzE2OX0.RHa_GLUGiRTVBGGCPvOcoLH6rh4IhyNM7YJWeJvI4Uo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'montanha-music-lab-auth'
  }
});

export interface CloudFavorite {
  id: string;
  user_id: string;
  song_id: string;
  title: string;
  artist: string;
  album?: string;
  thumbnail?: string;
  duration?: number;
  source?: string;
  created_at: string;
}

export interface CloudPlaylist {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  cover_url?: string;
  created_at: string;
}

export interface CloudDownload {
  id: string;
  user_id: string;
  song_id: string;
  title: string;
  artist: string;
  status: 'completed' | 'downloading' | 'failed';
  file_path?: string;
  created_at: string;
}

export async function getCloudFavorites(userId: string): Promise<CloudFavorite[]> {
  try {
    const { data, error } = await supabase
      .from('montanha_favorites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('Erro ao carregar favoritos da nuvem:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('Falha na conexão Supabase:', err);
    return [];
  }
}

export async function toggleCloudFavorite(
  userId: string,
  song: { id: string; title?: string | null; artist?: string | null; album?: string | null; thumbnail?: string | null; duration?: number | null; source?: string | null },
  isFavorite: boolean
) {
  try {
    if (isFavorite) {
      await supabase.from('montanha_favorites').upsert(
        {
          user_id: userId,
          song_id: song.id,
          title: song.title || 'Música sem título',
          artist: song.artist || 'Artista desconhecido',
          album: song.album || 'Desconhecido',
          thumbnail: song.thumbnail || '',
          duration: song.duration || 0,
          source: song.source || 'youtube'
        },
        { onConflict: 'user_id,song_id' }
      );
    } else {
      await supabase
        .from('montanha_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('song_id', song.id);
    }
  } catch (err) {
    console.warn('Falha ao atualizar favorito no Supabase:', err);
  }
}

export async function getCloudPlaylists(userId: string): Promise<CloudPlaylist[]> {
  try {
    const { data, error } = await supabase
      .from('montanha_playlists')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('Erro ao carregar playlists da nuvem:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('Falha na conexão Supabase playlists:', err);
    return [];
  }
}

export async function createCloudPlaylist(userId: string, name: string) {
  try {
    const { data, error } = await supabase
      .from('montanha_playlists')
      .insert({
        user_id: userId,
        name
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('Falha ao criar playlist no Supabase:', err);
    return null;
  }
}
