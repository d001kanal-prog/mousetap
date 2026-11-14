/*
 * Автообновление Telegram Mini App.
 * Версия берётся из <meta name="app-version"> в index.html.
 * При выпуске новой версии измените версию в index.html и query-параметры
 * локальных ресурсов (?v=...).
 */
(function () {
  'use strict';

  if (!('serviceWorker' in navigator) || location.protocol !== 'https:') return;

  var meta = document.querySelector('meta[name="app-version"]');
  var version = meta && meta.content ? meta.content.trim() : 'dev';
  var reloadedForController = false;
  var hadControllerBeforeRegistration = !!navigator.serviceWorker.controller;

  // Новая версия Service Worker берёт управление и один раз перезагружает игру,
  // чтобы HTML и все скрипты загрузились уже из актуальной версии.
  navigator.serviceWorker.addEventListener('controllerchange', function () {
    if (!hadControllerBeforeRegistration || reloadedForController) return;
    reloadedForController = true;
    window.location.reload();
  });

  window.addEventListener('load', function () {
    navigator.serviceWorker.register('./sw.js?v=' + encodeURIComponent(version), {
      scope: './',
      updateViaCache: 'none'
    }).then(function (registration) {
      // Запрашиваем проверку новой версии при каждом открытии Mini App.
      if (typeof registration.update === 'function') {
        registration.update().catch(function () {});
      }
      // Если обновлённый worker уже ожидает, активируем его немедленно.
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    }).catch(function (error) {
      // Игра продолжает работать и без Service Worker.
      if (window.console && console.warn) console.warn('Не удалось включить автообновление:', error);
    });
  });
})();
