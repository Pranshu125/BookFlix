// BookFlix PWA Service Worker (v51 - Centered Auth Card Title & Streamlined Clean Form)
const CACHE_NAME = 'bookflix-cache-v51';
const PRECACHE_ASSETS = [
  '/',
  '/index.html?v=51',
  '/styles.css?v=51',
  '/app.js?v=51',
  '/firebase-config.js?v=51',
  '/manifest.json?v=51',
  '/logo.svg?v=20',
  '/favicon.ico?v=20',
  '/favicon.svg?v=20',
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
            console.log('Evicting old cache:', key);
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

  // Network-First for HTML documents (Navigation & Page Loads)
  // Ensures user ALWAYS gets the latest UI immediately on reload
  if (
    event.request.mode === 'navigate' ||
    url.pathname === '/' ||
    url.pathname.endsWith('.html') ||
    (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'))
  ) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match('/')))
    );
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

  // Stale-while-revalidate for static assets (CSS, JS, Fonts, Icons)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
