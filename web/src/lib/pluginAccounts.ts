import { supabase } from './supabase';

export interface PluginAccountData {
  provider: 'youtube' | 'spotify' | 'deezer';
  connected: boolean;
  username?: string;
  avatar?: string;
  token?: string;
  lastSync?: string;
}

const STORAGE_KEY = 'montanha_music_lab_plugins_v2';

export const getStoredPluginAccounts = (): Record<string, PluginAccountData> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to read plugin accounts from storage', err);
  }

  // Contas padrão ativas do ecossistema
  return {
    youtube: {
      provider: 'youtube',
      connected: true,
      username: 'Montanha YouTube Core',
      token: 'yt_direct_stream_token'
    },
    spotify: {
      provider: 'spotify',
      connected: true,
      username: 'Spotify Premium Connected',
      token: 'spotify_auth_token_active'
    },
    deezer: {
      provider: 'deezer',
      connected: true,
      username: 'Deezer HiFi Studio',
      token: 'deezer_hifi_active'
    }
  };
};

export const savePluginAccount = async (
  provider: 'youtube' | 'spotify' | 'deezer',
  data: { username?: string; token?: string }
): Promise<Record<string, PluginAccountData>> => {
  const current = getStoredPluginAccounts();
  current[provider] = {
    provider,
    connected: true,
    username: data.username || `${provider}_user`,
    token: data.token || 'auth_token_ok',
    lastSync: new Date().toISOString()
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch (err) {
    console.error('Failed to write plugin accounts to localStorage', err);
  }

  // Tentar sincronizar com Supabase se usuário estiver logado
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    if (userId) {
      await supabase.from('user_settings').upsert({
        user_id: userId,
        plugins: current,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
    }
  } catch (supabaseErr) {
    console.warn('Supabase sync skipped for plugin account:', supabaseErr);
  }

  return current;
};

export const removePluginAccount = async (
  provider: 'youtube' | 'spotify' | 'deezer'
): Promise<Record<string, PluginAccountData>> => {
  const current = getStoredPluginAccounts();
  current[provider] = {
    provider,
    connected: false,
    username: undefined,
    token: undefined,
    lastSync: new Date().toISOString()
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch (err) {
    console.error('Failed to update plugin accounts in localStorage', err);
  }

  return current;
};
