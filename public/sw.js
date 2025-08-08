// En tu archivo sw.js (Service Worker)
const CACHE_NAME = 'audio-cache-v1';
const AUDIO_ASSETS = [
  '/sounds/mixkit-bell-ring-buzzer-2962.wav',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(AUDIO_ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  if (AUDIO_ASSETS.some(path => event.request.url.includes(path))) {
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
  }
});