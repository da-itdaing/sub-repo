/* 잇다잉 PWA Service Worker v3.0 */
const VERSION = 'v3.0';
const CACHE_NAME = `itdaing-${VERSION}`;
const RUNTIME_CACHE = `runtime-${VERSION}`;

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
  '/site.webmanifest',
  '/placeholder-popup.png',
  '/placeholder-user.png'
];

// 캐시하지 않을 경로 (API, 챗봇, 인증)
const NO_CACHE_PATHS = ['/api/', '/ai/', '/actuator/', '/auth/'];
const isNoCachePath = (url) => NO_CACHE_PATHS.some(path => url.includes(path));

// 이미지 캐시 대상
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico'];
const isImageRequest = (url) => IMAGE_EXTENSIONS.some(ext => url.toLowerCase().includes(ext));

// S3/CDN 이미지 도메인
const IMAGE_DOMAINS = ['s3.ap-northeast-2.amazonaws.com', 'daitdaing-static-files'];
const isExternalImage = (url) => IMAGE_DOMAINS.some(domain => url.includes(domain));

/* ============ Service Worker 설치 ============ */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing version:', VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching app shell');
        // 개별 파일 캐싱 (하나 실패해도 나머지 진행)
        return Promise.allSettled(
          APP_SHELL.map(url => 
            cache.add(url).catch(err => {
              console.warn('[SW] Failed to cache:', url, err.message);
            })
          )
        );
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

/* ============ Service Worker 활성화 및 이전 캐시 정리 ============ */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating version:', VERSION);
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

/* ============ Fetch 이벤트 처리 ============ */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = request.url;

  // POST, PUT, DELETE 등 non-GET 요청은 캐시하지 않음
  if (request.method !== 'GET') return;

  // API/챗봇/인증 요청은 항상 네트워크 (캐시하지 않음)
  if (isNoCachePath(url)) {
    event.respondWith(
      fetch(request)
        .catch(err => {
          console.warn('[SW] API request failed:', url);
          return new Response(
            JSON.stringify({ 
              error: 'NETWORK_ERROR', 
              message: '네트워크 연결을 확인해주세요.',
              offline: true 
            }),
            { 
              status: 503, 
              headers: { 'Content-Type': 'application/json' } 
            }
          );
        })
    );
    return;
  }

  // HTML 네비게이션: 네트워크 우선, 실패 시 offline.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // 성공한 응답 캐시
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(RUNTIME_CACHE)
              .then(cache => cache.put(request, clone))
              .catch(() => {});
          }
          return response;
        })
        .catch(() => {
          // 오프라인 시 캐시된 페이지 또는 offline.html
          return caches.match(request)
            .then(cached => cached || caches.match('/offline.html'))
            .then(fallback => fallback || caches.match('/index.html'));
        })
    );
    return;
  }

  // S3/CDN 이미지: 캐시 우선, 7일 후 갱신
  if (isExternalImage(url)) {
    event.respondWith(
      caches.match(request)
        .then(cached => {
          // 백그라운드에서 새 버전 fetch
          const fetchPromise = fetch(request)
            .then(response => {
              if (response && response.status === 200) {
                const clone = response.clone();
                caches.open(RUNTIME_CACHE)
                  .then(cache => cache.put(request, clone))
                  .catch(() => {});
              }
              return response;
            })
            .catch(() => null);

          // 캐시가 있으면 즉시 반환, 없으면 네트워크 대기
          return cached || fetchPromise;
        })
        .catch(() => caches.match('/placeholder-popup.png'))
    );
    return;
  }

  // 정적 파일: 캐시 우선, 없으면 네트워크
  event.respondWith(
    caches.match(request)
      .then(cached => {
        if (cached) {
          return cached;
        }
        
        // 캐시 없으면 네트워크 요청
        return fetch(request).then(response => {
          // 성공한 응답만 캐시 (opaque 응답 제외)
          if (response && response.status === 200 && response.type !== 'opaque') {
            const clone = response.clone();
            caches.open(RUNTIME_CACHE)
              .then(cache => cache.put(request, clone))
              .catch(() => {});
          }
          return response;
        });
      })
      .catch(err => {
        console.warn('[SW] Fetch failed:', url);
        // 오프라인 시 이미지 플레이스홀더
        if (isImageRequest(url)) {
          return caches.match('/placeholder-popup.png');
        }
        return new Response('Offline', { status: 503 });
      })
  );
});

/* ============ 메시지 이벤트 (캐시 관리) ============ */
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
  
  if (event.data === 'clearCache') {
    caches.keys().then(keys => {
      keys.forEach(key => caches.delete(key));
    });
    console.log('[SW] All caches cleared');
  }
});
