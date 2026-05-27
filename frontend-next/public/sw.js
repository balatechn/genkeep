const CACHE = 'genkeep-v1';
const SHELL = ['/', '/dashboard', '/vault', '/generator', '/offline'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const { request } = e;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  // Always network-first for API calls
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(
      fetch(request).catch(() => new Response(JSON.stringify({ error: 'Offline' }), {
        headers: { 'Content-Type': 'application/json' }
      }))
    );
    return;
  }
  // Cache-first for static assets, network-first for pages
  e.respondWith(
    caches.match(request).then(cached => {
      if (cached && url.pathname.match(/\.(js|css|svg|png|jpg|woff2?)$/)) return cached;
      return fetch(request)
        .then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(request, clone));
          }
          return res;
        })
        .catch(() => cached || caches.match('/offline') || new Response('Offline', { status: 503 }));
    })
  );
});
