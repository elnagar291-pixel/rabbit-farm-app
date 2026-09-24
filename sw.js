const CACHE_NAME = 'khair-tabeaa-v2.7.0';
const CORE_ASSETS = ['./index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.mode === 'navigate') {
    // Always try the network first for the app page, so updates are picked up.
    event.respondWith(
      fetch(req)
        .then((resp) => {
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resp.clone()));
          return resp;
        })
        .catch(() => caches.match(req))
    );
  } else {
    // Cache-first for static assets (icons, manifest).
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req))
    );
  }
});
