// sw.js - Kidmedia Erasmus+ Reading Tool Offline Service Worker
const CACHE_NAME = 'erasmus-reader-v2';

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/styles.css',
  './js/state.js',
  './js/storage.js',
  './js/i18n.js',
  './js/tts.js',
  './js/algorithms.js',
  './js/parser.js',
  './js/render.js',
  './js/worksheet.js',
  './js/events.js',
  './js/pwa.js',
  './js/main.js',
  './i18n/translations.json',
  './images/icon-192.png',
  './images/icon-512.png',
  './images/Sesat-kidmedia-net.png',
  './images/EL_Co-fundedbytheEU_RGB_POS.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Pre-caching warning (some non-critical assets skipped):', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Dynamic cloud fetches (Google Sheets, Cloud TTS, CDNs) use Network-First
  if (url.origin !== self.location.origin || url.pathname.includes('google') || url.pathname.includes('googleapis')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Core static assets use Cache-First, fallback to Network
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch((fetchErr) => {
        // Fallback for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('./').then(r => r || caches.match('./index.html'));
        }
        throw fetchErr;
      });
    })
  );
});
