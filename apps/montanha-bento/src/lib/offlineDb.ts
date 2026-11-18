// IndexedDB Nativo para Armazenamento Offline Real de Áudio (Zero dependência externa)
const DB_NAME = 'montanha_music_offline_storage';
const OLD_DB_NAME = 'able_music_offline_storage';
const STORE_NAME = 'audio_tracks';

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function storeOfflineBlob(songId: string, blob: Blob): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(blob, songId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Erro ao salvar blob offline:', err);
  }
}

export async function getOfflineBlob(songId: string): Promise<Blob | null> {
  try {
    const db = await getDB();
    const blob = await new Promise<Blob | null>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(songId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
    if (blob) return blob;

    // Migração/fallback transparente para músicas baixadas anteriormente
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      return new Promise((resolve) => {
        try {
          const oldReq = indexedDB.open(OLD_DB_NAME, 1);
          oldReq.onsuccess = () => {
            const oldDb = oldReq.result;
            if (!oldDb.objectStoreNames.contains(STORE_NAME)) {
              oldDb.close();
              return resolve(null);
            }
            const tx = oldDb.transaction(STORE_NAME, 'readonly');
            const r = tx.objectStore(STORE_NAME).get(songId);
            r.onsuccess = () => {
              const res = r.result || null;
              oldDb.close();
              resolve(res);
            };
            r.onerror = () => { oldDb.close(); resolve(null); };
          };
          oldReq.onerror = () => resolve(null);
        } catch {
          resolve(null);
        }
      });
    }
    return null;
  } catch (err) {
    console.warn('Erro ao ler blob offline:', err);
    return null;
  }
}

export async function deleteOfflineBlob(songId: string): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(songId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Erro ao deletar blob offline:', err);
  }
}
