// Service Worker para Montanha Music Lab PWA - Network First com Cache de Contingência
const CACHE_NAME = 'montanha-music-v6';

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
  const url = event.request.url;

  // 1. NUNCA intercepta fluxos de áudio, vídeo ou mídias de CDNs (Garante Range 206 nativo ininterrupto com tela apagada)
  if (
    event.request.destination === 'audio' ||
    event.request.destination === 'video' ||
    url.includes('saavncdn.com') ||
    url.includes('itunes.apple.com') ||
    url.includes('audio-ssl') ||
    url.includes('dzcdn.net') ||
    url.includes('deezer.com') ||
    url.includes('googlevideo.com') ||
    url.includes('youtube.com') ||
    url.includes('piped') ||
    url.includes('supabase') ||
    url.includes('/api/') ||
    url.endsWith('.mp4') ||
    url.endsWith('.mp3') ||
    url.endsWith('.m4a') ||
    url.endsWith('.webm') ||
    url.endsWith('.wav')
  ) {
    return;
  }

  // 2. Navegação de páginas (HTML): SEMPRE Network-First para garantir código fresco
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
