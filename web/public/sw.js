// Service Worker para Montanha Music Lab PWA - Versão 4.0 Resiliente Anti-Cache Trap
const CACHE_NAME = 'montanha-music-v4';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Deletando cache antigo:', key);
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Network-First para absolutamente tudo, com fallback gracioso para não deixar tela branca
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = event.request.url;

  // Não interceptar APIs externas, streams de áudio ou YouTube
  if (
    url.includes('/api/') ||
    url.includes('googlevideo') ||
    url.includes('youtube') ||
    url.includes(':3001') ||
    url.includes('supabase.co')
  ) {
    return;
  }

  // Requisição de navegação HTML (abrir página ou recarregar)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          const fallback = await caches.match('/index.html');
          if (fallback) return fallback;
          return fetch(event.request);
        })
    );
    return;
  }

  // Assets estáticos (JS, CSS, Imagens)
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return networkResponse;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        // Nunca retornar undefined para evitar ERR_FAILED que gera tela branca
        return new Response('', { status: 404, statusText: 'Not Found in Cache' });
      })
  );
});
