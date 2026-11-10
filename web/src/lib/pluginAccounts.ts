import { supabase } from './supabase';

export interface PluginAccountData {
  provider: 'youtube' | 'spotify' | 'deezer' | 'lrclib' | 'newpipe' | 'scrobble';
  connected: boolean;
  installed: boolean;
  username?: string;
  avatar?: string;
  token?: string;
  authMethod?: 'oauth' | 'cookie' | 'credentials';
  lastSync?: string;
}

const STORAGE_KEY = 'montanha_music_lab_plugins_v3';

export const getStoredPluginAccounts = (): Record<string, PluginAccountData> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to read plugin accounts from storage', err);
  }

  // Padrão Spotube oficial: Plugins estão INSTALADOS nativamente, mas NÃO conectados até login real
  return {
    youtube: {
      provider: 'youtube',
      connected: false,
      installed: true,
      username: undefined,
      token: undefined
    },
    newpipe: {
      provider: 'newpipe',
      connected: false,
      installed: true,
      username: undefined,
      token: undefined
    },
    lrclib: {
      provider: 'lrclib',
      connected: false,
      installed: true,
      username: undefined,
      token: undefined
    },
    spotify: {
      provider: 'spotify',
      connected: false,
      installed: true,
      username: undefined,
      token: undefined
    },
    deezer: {
      provider: 'deezer',
      connected: false,
      installed: true,
      username: undefined,
      token: undefined
    },
    scrobble: {
      provider: 'scrobble',
      connected: false,
      installed: true,
      username: undefined,
      token: undefined
    }
  };
};

export const savePluginAccount = async (
  provider: string,
  data: { username?: string; token?: string; authMethod?: 'oauth' | 'cookie' | 'credentials' }
): Promise<Record<string, PluginAccountData>> => {
  const current = getStoredPluginAccounts();
  current[provider] = {
    provider: provider as any,
    connected: true,
    installed: true,
    username: data.username || `${provider}_conectado`,
    token: data.token || 'auth_token_valid',
    authMethod: data.authMethod || 'credentials',
    lastSync: new Date().toISOString()
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch (err) {
    console.error('Failed to write plugin accounts to localStorage', err);
  }

  // Sincronizar com Supabase sob o ID do usuário ativo
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    if (userId) {
      await supabase.from('montanha_playlists').upsert({
        user_id: userId,
        name: `Sync: ${provider.toUpperCase()}`,
        description: `Conectado como ${data.username || provider}`
      }, { onConflict: 'user_id,name' });
    }
  } catch (supabaseErr) {
    console.warn('Supabase sync skipped for plugin account:', supabaseErr);
  }

  return current;
};

export const removePluginAccount = async (
  provider: string
): Promise<Record<string, PluginAccountData>> => {
  const current = getStoredPluginAccounts();
  current[provider] = {
    provider: provider as any,
    connected: false,
    installed: true,
    username: undefined,
    token: undefined,
    authMethod: undefined,
    lastSync: new Date().toISOString()
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch (err) {
    console.error('Failed to update plugin accounts in localStorage', err);
  }

  return current;
};
