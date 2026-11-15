// Service Worker para Montanha Music Lab PWA - Network First com Cache Estático Same-Origin
const CACHE_NAME = 'montanha-music-v7';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  // Apenas requisições GET podem ser cacheadas
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // 1. NUNCA intercepta requisições cross-origin (CDNs externos, Saavn, Deezer, YouTube, Supabase)
  if (url.origin !== self.location.origin) return;

  // 2. NUNCA intercepta endpoints serverless dinâmicos
  if (url.pathname.startsWith('/api/')) return;

  // 3. NUNCA intercepta mídias ou requisições de Range (Garante Range 206 nativo do navegador)
  if (req.headers.has('range') || ['audio', 'video'].includes(req.destination)) return;

  // 4. Navegação de páginas (HTML): SEMPRE Network-First para garantir código fresco
  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith(
      fetch(req)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone)).catch(() => {});
          }
          return response;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // 5. Demais recursos estáticos same-origin (JS, CSS, SVGs, imagens locais): Network-First com fallback
  event.respondWith(
    fetch(req)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone)).catch(() => {});
        }
        return networkResponse;
      })
      .catch(() => caches.match(req))
  );
});
