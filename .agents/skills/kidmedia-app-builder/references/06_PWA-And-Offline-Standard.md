# Kidmedia Educational Web Apps — 1-Click PWA & Offline Standard

> **Document Status**: Mandatory Architectural Reference  
> **Target Audience**: Developers, UI/UX Designers, Special Education Technologists  
> **Scope**: All HTML5 Kidmedia Web Applications (Erasmus & Kidmedia.eu profiles)

---

## 1. Executive Summary & Objective

Educational web apps for Special Educational Needs (SEN) must function reliably in diverse school environments, including classrooms with unstable or nonexistent internet connections, tablets, interactive whiteboards, and personal assistive devices.

The **1-Click Progressive Web App (PWA)** standard enables any Kidmedia HTML5 application to:
1. Be installed natively on Android, iOS, Windows, macOS, and ChromeOS as a standalone application.
2. Run **100% offline** by caching all core scripts, stylesheets, fonts, local voices, procedural audio, and branding assets.
3. Provide an intuitive, one-click install button inside the UI (e.g. Setup Screen or Toolbar) without requiring technical navigation of browser menus.

---

## 2. PWA Manifest Standard (`manifest.webmanifest`)

Each project MUST place a `manifest.webmanifest` (or `manifest.json`) in the project root:

```json
{
  "name": "Kidmedia Application Name",
  "short_name": "KidmediaApp",
  "description": "Accessible Educational Web Application by Kidmedia",
  "start_url": "./index.html",
  "scope": "./",
  "display": "standalone",
  "orientation": "any",
  "background_color": "#f8fafc",
  "theme_color": "#1976d2",
  "lang": "el",
  "icons": [
    {
      "src": "images/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "images/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

In `index.html` within `<head>`:
```html
<link rel="manifest" href="./manifest.webmanifest">
<meta name="theme-color" content="#1976d2">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="apple-touch-icon" href="images/icon-192.png">
```

---

## 3. Service Worker Standard (`sw.js`)

Each application MUST include a lightweight `sw.js` in the project root implementing a **Cache-First** strategy for core static assets and a **Network-First** strategy for dynamic cloud resources (e.g., Google Sheets CSV).

```javascript
// sw.js - Kidmedia Zero-Config Offline Service Worker
const CACHE_NAME = 'kidmedia-app-v1';

const STATIC_ASSETS = [
  './',
  './index.html',
  './css/styles.css',
  './js/main.js',
  './js/state.js',
  './js/events.js',
  './js/render.js',
  './js/i18n.js',
  './i18n/translations.json',
  './manifest.webmanifest'
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
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Dynamic cloud fetches (Google Sheets, Cloud TTS) use Network-First
  if (url.origin !== self.location.origin || url.pathname.includes('google')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Core static assets use Cache-First, fallback to Network
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      });
    })
  );
});
```

---

## 4. UI 1-Click Install Button Standard

In the application UI (Toolbar or Setup Screen), provide an explicit install button:

### HTML:
```html
<button id="pwa-install-btn" class="btn btn-secondary pwa-btn" style="display: none;" title="Εγκατάσταση Εφαρμογής">
  📥 <span data-i18n="install_app">Εγκατάσταση</span>
</button>
```

### JavaScript Registration & Handling (in `events.js` or `main.js`):
```javascript
let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const installBtn = document.getElementById('pwa-install-btn');
  if (installBtn) {
    installBtn.style.display = 'inline-flex';
  }
});

const installBtn = document.getElementById('pwa-install-btn');
if (installBtn) {
  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('[PWA] User accepted install');
    }
    deferredPrompt = null;
    installBtn.style.display = 'none';
  });
}

window.addEventListener('appinstalled', () => {
  const installBtn = document.getElementById('pwa-install-btn');
  if (installBtn) installBtn.style.display = 'none';
  deferredPrompt = null;
  console.log('[PWA] Application installed successfully');
});

// Register Service Worker in main.js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((err) => {
      console.warn('[SW] Registration failed:', err);
    });
  });
}
```
