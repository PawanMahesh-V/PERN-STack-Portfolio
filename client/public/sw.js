const CACHE_NAME = 'portfolio-v3';
const STATIC_ASSETS = ['/', '/index.html'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first strategy for API calls, cache-first for static
self.addEventListener('fetch', (event) => {
  // Do not cache non-GET requests
  if (event.request.method !== 'GET') return;

  if (event.request.url.includes('/api/') || event.request.url.includes('/phantom')) {
    // Network-first for API and Admin pages
    event.respondWith(
      fetch(event.request).catch(err => {
        console.warn('SW Fetch Error:', err);
        return caches.match(event.request).then(cached => cached || new Response('Network error', { status: 503 }));
      })
    );
  } else {
    // Cache-first for static assets
    event.respondWith(
      caches.match(event.request).then(cached =>
        cached || fetch(event.request).then(response => {
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
          }
          return response;
        }).catch(err => {
          console.warn('SW Static Fetch Error:', err);
        })
      )
    );
  }
});
