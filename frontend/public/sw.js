const CACHE_NAME = 'ablenova-v1';
const STATIC_ASSETS = [
  '/',
  '/student',
  '/lessons',
  '/progress',
  '/ai-assistant',
  '/accessibility',
  '/manifest.json',
  '/file.svg',
  '/globe.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
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
  // Only handle GET requests, avoid caching API POST/PUT calls or secrets
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('/api/v1/auth')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // If offline and request is for page navigation, fallback to app shell
          if (event.request.mode === 'navigate') {
            return caches.match('/student') || caches.match('/');
          }
        });
    })
  );
});
