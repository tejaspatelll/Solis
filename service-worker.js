const cacheName = 'solis-hifi-cache-v1';
const staticAssets = [
  './',
  './index.html', // Or Solis_hifi.html
  './Solis_hifi.html',
  './style.css',   // Or your CSS file
  './script.js',  // Or your JS file
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', async event => {
  const cache = await caches.open(cacheName);
  await cache.addAll(staticAssets);
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== cacheName).map(key => caches.delete(key))
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
