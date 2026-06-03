const CACHE_NAME = 'museu-carvao-v1';
const ASSETS_TO_CACHE = [
    './',
    'index.html',
    'css/style.css',
    'css/premium.css',
    'js/main.js',
    'js/modules/a11y.js',
    'js/modules/carousel.js',
    'js/translations.js',
    'manifest.json',
    'img/logo-museu.png',
    'img/fachada_museu.jpg',
    'img/museu_exposicao.jpg',
    'img/usina_antiga.jpg'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Stale-while-revalidate strategy
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                const fetchPromise = fetch(event.request).then(networkResponse => {
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, networkResponse.clone());
                    });
                    return networkResponse;
                }).catch(() => {
                    // Ignora erro de fetch offline
                });

                return cachedResponse || fetchPromise;
            })
    );
});
