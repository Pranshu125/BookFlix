// BookFlix PWA Service Worker (v29 - SEO, Backups, Liquid Glass + Claymorphism)
const CACHE_NAME = 'bookflix-cache-v29';
const PRECACHE_ASSETS = [
  '/',
  '/index.html?v=29',
  '/styles.css?v=29',
  '/app.js?v=29',
  '/manifest.json?v=18',
  '/logo.svg?v=18',
  '/favicon.ico?v=18',
  '/og-preview.svg',
  '/404.html',
  '/robots.txt',
  '/sitemap.xml',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch(() => {});
    })
  );
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
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Never cache audio/video streams, direct downloads, feedback POSTs, or range requests
  if (
    url.pathname.startsWith('/api/stream') ||
    url.pathname.startsWith('/api/download') ||
    url.pathname.startsWith('/api/read-text') ||
    url.pathname.startsWith('/api/feedback') ||
    event.request.method === 'POST' ||
    event.request.headers.get('range')
  ) {
    return;
  }

  // Network-first strategy for APIs (/api/home, /api/search, etc.) with cache fallback
  if (url.pathname.startsWith('/api/')) {
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

  // Stale-while-revalidate for static UI assets (HTML, CSS, JS, SVG, Fonts)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
