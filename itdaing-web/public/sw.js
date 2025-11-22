/* Basic PWA service worker for Da-Itdaing */
const VERSION = 'v1';
const APP_SHELL = [
  '/',
  '/index.html',
  '/offline.html',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/apple-touch-icon.png',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/site.webmanifest'
];
const RUNTIME_CACHE = 'runtime-' + VERSION;
const SHELL_CACHE = 'shell-' + VERSION;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => ![SHELL_CACHE, RUNTIME_CACHE].includes(k)).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return; // skip non-GET

  // HTML navigation requests: network first, fallback to offline.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/offline.html'))
    );
    return;
  }

  // For other GET requests: try cache, then network, then put in runtime cache.
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(resp => {
        // skip opaque and error responses
        if (!resp || resp.status !== 200 || resp.type === 'opaque') return resp;
        const clone = resp.clone();
        caches.open(RUNTIME_CACHE).then(cache => cache.put(request, clone));
        return resp;
      }).catch(() => cached); // if network fails and no cache, undefined propagates
    })
  );
});
