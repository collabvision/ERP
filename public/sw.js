const CACHE_NAME = 'v9-erp-v1';
const ASSETS = [
  '/',
  '/index.html',
  // Add other static assets here
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});