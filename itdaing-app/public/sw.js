/* Da-Itdaing PWA Service Worker */
const VERSION = 'v2.0';
const CACHE_NAME = 'daitdaing-' + VERSION;
const RUNTIME_CACHE = 'runtime-' + VERSION;

// 캐시할 앱 셸 (오프라인 필수 파일)
const APP_SHELL = [
  '/',
  '/index.html',
  '/offline.html',
  '/favicon.ico',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/apple-touch-icon.png',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/site.webmanifest'
];

// API 요청은 캐시하지 않음
const API_PATHS = ['/api/', '/actuator/'];
const isApiRequest = (url) => API_PATHS.some(path => url.includes(path));

// Service Worker 설치
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker version:', VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching app shell');
        return cache.addAll(APP_SHELL);
      })
      .then(() => {
        console.log('[SW] Skip waiting');
        return self.skipWaiting();
      })
      .catch(err => {
        console.error('[SW] Install failed:', err);
      })
  );
});

// Service Worker 활성화 및 이전 캐시 정리
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker version:', VERSION);
  event.waitUntil(
    caches.keys()
      .then(keys => {
        const validCaches = [CACHE_NAME, RUNTIME_CACHE];
        return Promise.all(
          keys
            .filter(key => !validCaches.includes(key))
            .map(key => {
              console.log('[SW] Deleting old cache:', key);
              return caches.delete(key);
            })
        );
      })
      .then(() => {
        console.log('[SW] Claiming clients');
        return self.clients.claim();
      })
  );
});

// Fetch 이벤트 처리
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = request.url;

  // POST, PUT, DELETE 등 non-GET 요청은 캐시하지 않음
  if (request.method !== 'GET') return;

  // API 요청은 항상 네트워크 (캐시하지 않음)
  if (isApiRequest(url)) {
    event.respondWith(
      fetch(request).catch(err => {
        console.warn('[SW] API request failed:', url, err);
        return new Response(
          JSON.stringify({ error: 'Network error', offline: true }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
      })
    );
    return;
  }

  // HTML 네비게이션: 네트워크 우선, 실패 시 offline.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match('/offline.html') || caches.match('/index.html'))
    );
    return;
  }

  // 정적 파일: 캐시 우선, 없으면 네트워크
  event.respondWith(
    caches.match(request)
      .then(cached => {
        if (cached) {
          console.log('[SW] Serving from cache:', url);
          return cached;
        }
        
        // 캐시 없으면 네트워크 요청
        return fetch(request).then(response => {
          // 성공한 응답만 캐시
          if (response && response.status === 200 && response.type !== 'opaque') {
            const clone = response.clone();
            caches.open(RUNTIME_CACHE)
              .then(cache => cache.put(request, clone))
              .catch(err => console.warn('[SW] Cache put failed:', err));
          }
          return response;
        });
      })
      .catch(err => {
        console.error('[SW] Fetch failed:', url, err);
        // 오프라인 시 기본 응답
        if (request.destination === 'image') {
          return caches.match('/android-chrome-192x192.png');
        }
        return new Response('Offline', { status: 503 });
      })
  );
});
