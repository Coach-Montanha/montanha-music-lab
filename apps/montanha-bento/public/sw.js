// Service Worker para Able Music Player PWA - Network First com Cache de Contingência
const CACHE_NAME = 'able-music-v4';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('Removendo cache antigo:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // 1. Navegação de páginas (HTML): SEMPRE Network-First para evitar tela branca por versão antiga
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // 2. Ignora requisições de áudio externo, YouTube ou APIs dinâmicas
  if (
    event.request.url.includes('youtube.com') ||
    event.request.url.includes('itunes.apple.com') ||
    event.request.url.includes('piped') ||
    event.request.url.includes('supabase') ||
    event.request.url.includes('/api/')
  ) {
    return;
  }

  // 3. Demais recursos estáticos: Network-First com fallback para cache
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
