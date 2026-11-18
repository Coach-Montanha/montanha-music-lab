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

const DEFAULT_ALBERTO_ID = '3f954063-c246-4989-8f48-dc84a12f5be3';

export const ALBERTO_ALIAS_IDS = new Set([
  DEFAULT_ALBERTO_ID,
  '4541d773-99e4-4eda-9ff3-69c44a491764', // Notebook / PC Edge
  '08fd3ca5-dc9a-4363-be88-9847c648cd6c', // Celular Motorola Chrome
  'd6e21a10-65dc-426b-a61e-62a03fe871d2', // Celular Redmi PWA
  'c4c3571d-883f-4164-91e4-3f20cc8666fa'  // albertosarly@hotmail.com
]);

export function getCanonicalUserId(userId?: string | null, email?: string | null): string {
  if (userId && ALBERTO_ALIAS_IDS.has(userId)) return DEFAULT_ALBERTO_ID;
  if (email) {
    const em = email.toLowerCase().trim();
    if (em.includes('alberto') || em.includes('coachmontanha')) return DEFAULT_ALBERTO_ID;
  }
  return userId || DEFAULT_ALBERTO_ID;
}

/**
 * Smart Merge Bidirecional: Une bibliotecas locais e remotas com resolução determinística por timestamp,
 * garantindo que novas playlists criadas offline sejam somadas e faixas removidas sejam respeitadas.
 */
export function smartMergePlaylists(local: any[], remote: any[]): any[] {
  if (!Array.isArray(local) || local.length === 0) return remote || [];
  if (!Array.isArray(remote) || remote.length === 0) return local || [];

  const map = new Map<string, any>();

  // 1. Indexa remotas
  remote.forEach((p) => {
    if (p && p.id) {
      map.set(p.id, p);
    }
  });

  // 2. Mescla locais
  local.forEach((p) => {
    if (!p || !p.id) return;
    if (!map.has(p.id)) {
      // Nova playlist criada localmente
      map.set(p.id, p);
    } else {
      const remoteP = map.get(p.id);
      const localUpdated = Number(p.updatedAt) || 0;
      const remoteUpdated = Number(remoteP.updatedAt) || 0;

      if (localUpdated > remoteUpdated) {
        map.set(p.id, p);
      } else {
        map.set(p.id, remoteP);
      }
    }
  });

  return Array.from(map.values());
}

/**
 * Canal Realtime Broadcast: Transmite notificações instantâneas entre aparelhos
 * quando uma música/playlist é alterada, adicionada ou removida.
 */
let realtimeChannel: any = null;

export function broadcastLibraryChange(userId: string, count: number) {
  try {
    const canonical = getCanonicalUserId(userId);
    if (!realtimeChannel) {
      realtimeChannel = supabase.channel('montanha-music-realtime-sync');
      realtimeChannel.subscribe();
    }
    realtimeChannel.send({
      type: 'broadcast',
      event: 'library_updated',
      payload: { userId: canonical, count, timestamp: Date.now() }
    });
  } catch (err) {
    console.warn('[Realtime Broadcast Warn]', err);
  }
}

export function subscribeToLibraryChanges(userId: string, onRemoteChange: () => void) {
  try {
    const canonical = getCanonicalUserId(userId);
    const channel = supabase.channel('montanha-music-realtime-sync');
    channel
      .on('broadcast', { event: 'library_updated' }, (msg: any) => {
        // Se a mensagem for para a mesma conta (canônica), dispara a sincronização
        if (!msg.payload?.userId || msg.payload.userId === canonical) {
          console.log('[Realtime] Biblioteca modificada em outro aparelho conectado. Puxando atualizações...');
          onRemoteChange();
        }
      })
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch {}
    };
  } catch {
    return () => {};
  }
}

/**
 * Sincronização em nuvem resiliente com suporte a API Serverless, Storage e Realtime Broadcast
 */
export async function syncCloudPlaylists(
  userId: string,
  playlists: any[],
  allowEmpty: boolean = false,
  email?: string
) {
  if (!userId || !Array.isArray(playlists)) return;

  // Trava de segurança inegociável: impede que limpar a tela do celular apague o acervo na nuvem
  if (playlists.length === 0 && !allowEmpty) {
    console.warn('Proteção de Nuvem: Bloqueada sobrescrita acidental da nuvem com 0 playlists.');
    return;
  }

  const canonicalId = getCanonicalUserId(userId, email);

  // 1. Tenta via API Serverless /api/sync com canonicalId
  try {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: canonicalId, email, playlists })
    });
    if (res.ok) {
      console.log(`[Cloud Sync] ${playlists.length} playlists salvas na nuvem com sucesso!`);
      return;
    }
  } catch {}

  // 2. Fallback: Storage bucket direto isolado no arquivo do usuário (${canonicalId}.json)
  try {
    await supabase.storage.from('music-playlists').upload(
      `${canonicalId}.json`,
      new Blob([JSON.stringify({ playlists, synced_at: new Date().toISOString() })], { type: 'application/json' }),
      { upsert: true }
    );
    console.log(`[Cloud Sync] ${playlists.length} playlists salvas via Supabase Storage para ${canonicalId}.`);
  } catch (err) {
    console.warn('Falha no sync de playlists:', err);
  }
}

export async function fetchCloudPlaylists(userId?: string, email?: string): Promise<any[] | null> {
  if (!userId) return null;
  const canonicalId = getCanonicalUserId(userId, email);

  // 1. Tenta via API Serverless /api/sync?userId=...
  try {
    const res = await fetch(`/api/sync?userId=${encodeURIComponent(canonicalId)}&email=${encodeURIComponent(email || '')}`, {
      signal: AbortSignal.timeout(6000)
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.playlists) && data.playlists.length > 0) {
        console.log(`[Cloud Pull] ${data.playlists.length} playlists recuperadas via /api/sync!`);
        return data.playlists;
      }
    }
  } catch {}

  // 2. Tenta diretamente do Supabase Storage Público (${canonicalId}.json)
  try {
    const storageRes = await fetch(`${SUPABASE_URL}/storage/v1/object/public/music-playlists/${canonicalId}.json?t=${Date.now()}`, {
      signal: AbortSignal.timeout(5000)
    });
    if (storageRes.ok) {
      const sData = await storageRes.json();
      if (Array.isArray(sData.playlists) && sData.playlists.length > 0) {
        console.log(`[Cloud Pull] ${sData.playlists.length} playlists recuperadas do Storage!`);
        return sData.playlists;
      }
    }
  } catch {}

  return null;
}
