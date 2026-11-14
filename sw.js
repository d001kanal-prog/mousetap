/*
 * Cache strategy for GitHub Pages / Telegram Mini App.
 * - HTML navigation: network-first, so a new index.html is picked up quickly.
 * - Versioned local assets (?v=...): cache-first; changing the version creates
 *   a new URL and therefore cannot reuse an old JS/CSS response.
 * - Other same-origin assets (e.g. images): network-first with offline fallback.
 */
'use strict';

var url = new URL(self.location.href);
var VERSION = url.searchParams.get('v') || 'dev';
var CACHE_NAME = 'mousekin-static-' + VERSION;
var CACHE_PREFIX = 'mousekin-static-';

self.addEventListener('install', function (event) {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (key) {
        if (key.indexOf(CACHE_PREFIX) === 0 && key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', function (event) {
  var request = event.request;
  if (request.method !== 'GET') return;

  var requestUrl;
  try { requestUrl = new URL(request.url); } catch (e) { return; }
  if (requestUrl.origin !== self.location.origin) return;
  if (requestUrl.pathname.endsWith('/sw.js')) return;

  var isNavigation = request.mode === 'navigate';
  var isVersioned = requestUrl.searchParams.has('v');

  if (isVersioned && !isNavigation) {
    // JS/CSS с новым ?v= имеют новый ключ кэша.
    event.respondWith(
      caches.open(CACHE_NAME).then(function (cache) {
        return cache.match(request).then(function (cached) {
          if (cached) return cached;
          return fetch(request, { cache: 'no-store' }).then(function (response) {
            if (response && response.ok) cache.put(request, response.clone());
            return response;
          });
        });
      })
    );
    return;
  }

  // HTML и изображения всегда сначала проверяются в сети, чтобы изменения
  // GitHub Pages не оставались скрытыми за устаревшим ответом.
  event.respondWith(
    fetch(request, { cache: 'no-store' }).then(function (response) {
      if (response && response.ok) {
        var copy = response.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(request, copy).catch(function () {});
        });
      }
      return response;
    }).catch(function () {
      return caches.match(request).then(function (cached) {
        if (cached) return cached;
        if (isNavigation) {
          var indexUrl = new URL('./index.html', self.registration.scope).toString();
          return caches.match(indexUrl);
        }
        return Response.error();
      });
    })
  );
});
