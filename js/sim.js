'use strict';
/* ============================================================
   Чистая логика игры (без Canvas/DOM).
   Используется и игрой (game.js), и проверочным ботом (tools/verify.js),
   поэтому бот проверяет проходимость по тем же правилам, что видит игрок.
   ============================================================ */
var Sim = (function () {
  var SNOOZE = 4;          // секунд дремоты за один тап по спящему коту
  var NAP_CAP = 8;         // кот не может «наспать» больше этого запаса (нельзя усыпить на минуту вперёд)
  var DEFAULT_SPEED = 2.2; // клеток в секунду

  function trapAt(S, x, y) {
    for (var i = 0; i < S.traps.length; i++) {
      if (S.traps[i].x === x && S.traps[i].y === y) return S.traps[i];
    }
    return null;
  }
  function catAt(S, x, y) {
    for (var i = 0; i < S.cats.length; i++) {
      if (S.cats[i].x === x && S.cats[i].y === y) return S.cats[i];
    }
    return null;
  }
  function itemAt(items, x, y) {
    for (var i = 0; i < (items || []).length; i++) if (items[i].x === x && items[i].y === y) return items[i];
    return null;
  }

  /* Заполняет объект состояния S данными уровня L */
  function init(S, L) {
    S.level = L;
    S.speed = L.speed || DEFAULT_SPEED;
    S.holes = L.holes.map(function (h) {
      return { x: h.x, y: h.y, path: h.path, opened: false, done: false, mouse: { i: 0, prog: 0, face: 1 } };
    });
    S.cats = L.cats.map(function (c) {
      return { x: c.x, y: c.y, state: 'awake', timer: c.wake, wake: c.wake, sleep: c.sleep, anim: 0, snoozeFx: 0, age: 0 };
    });
    S.traps = (L.traps || []).map(function (tr) { return { x: tr.x, y: tr.y, armed: true }; });
    S.dogs = (L.dogs || []).map(function (d) { return { x: d.x, y: d.y, calm: false }; });
    S.doors = (L.doors || []).map(function (d) { return { x: d.x, y: d.y, open: false }; });
    S.teleports = (L.teleports || []).map(function (p) { return { a: p.a, b: p.b }; });
    S.coins = (L.coins || []).map(function (c) { return { x: c.x, y: c.y, taken: false }; });
    S.cheese = L.cheese ? { x: L.cheese.x, y: L.cheese.y, taken: false } : null;
  }

  /* Шаг времени. Возвращает список событий:
     {t:'exit'} {t:'cheese'} {t:'fail', reason:'trap'|'cat'} {t:'win'}
     {t:'catwake', c} {t:'catsleep', c} — кот сменил состояние (для звука) */
  function update(S, dt) {
    var ev = [];
    var i, c;
    for (i = 0; i < S.cats.length; i++) {
      c = S.cats[i];
      c.anim += dt;
      c.age += dt;
      if (c.snoozeFx > 0) c.snoozeFx -= dt;
      c.timer -= dt;
      if (c.timer <= 0) {
        if (c.state === 'awake') { c.state = 'asleep'; c.timer = c.sleep; }
        else { c.state = 'awake'; c.timer = c.wake; }
        c.age = 0;
        ev.push({ t: c.state === 'asleep' ? 'catsleep' : 'catwake', c: c });
      }
    }

    var allDone = true;
    for (var h = 0; h < S.holes.length; h++) {
      var hole = S.holes[h];
      if (hole.done) continue;
      allDone = false;
      if (!hole.opened) continue;
      var m = hole.mouse;
      m.prog += dt * S.speed;
      var blocked = false;
      while (m.prog >= 1 && !blocked) {
        m.prog -= 1;
        m.i++;
        if (m.i >= hole.path.length - 1) {
          hole.done = true;
          ev.push({ t: 'exit' });
          break;
        }
        var cell = hole.path[m.i];
        if (S.cheese && !S.cheese.taken && S.cheese.x === cell[0] && S.cheese.y === cell[1]) {
          S.cheese.taken = true; ev.push({ t: 'cheese' });
        }
        var coin = itemAt(S.coins, cell[0], cell[1]);
        if (coin && !coin.taken) { coin.taken = true; ev.push({ t: 'coin' }); }
        var tr = trapAt(S, cell[0], cell[1]);
        if (tr && tr.armed) { ev.push({ t: 'fail', reason: 'trap' }); blocked = true; break; }
        var door = itemAt(S.doors, cell[0], cell[1]);
        if (door && !door.open) { ev.push({ t: 'fail', reason: 'door' }); blocked = true; break; }
        var dog = itemAt(S.dogs, cell[0], cell[1]);
        if (dog && !dog.calm) { ev.push({ t: 'fail', reason: 'dog' }); blocked = true; break; }
        var ca = catAt(S, cell[0], cell[1]);
        if (ca && ca.state === 'awake') { ev.push({ t: 'fail', reason: 'cat' }); blocked = true; break; }
        /* Телепорт переносит мышь с первой площадки на парную, расположенную дальше по её пути. */
        for (var tp = 0; tp < (S.teleports || []).length; tp++) {
          var pair = S.teleports[tp], dest = null;
          if (pair.a.x === cell[0] && pair.a.y === cell[1]) dest = pair.b;
          else if (pair.b.x === cell[0] && pair.b.y === cell[1]) dest = pair.a;
          if (dest) {
            for (var pi = m.i + 1; pi < hole.path.length; pi++) {
              if (hole.path[pi][0] === dest.x && hole.path[pi][1] === dest.y) { m.i = pi; ev.push({ t: 'teleport' }); break; }
            }
            break;
          }
        }
      }
      if (blocked) break;
    }
    if (allDone) ev.push({ t: 'win' });
    return ev;
  }

  /* Тап по клетке: обезвреживание, успокоение, открытие двери или норы. */
  function tap(S, cx, cy) {
    var tr = trapAt(S, cx, cy);
    if (tr && tr.armed) { tr.armed = false; return 'trap'; }
    var door = itemAt(S.doors, cx, cy);
    if (door && !door.open) { door.open = true; return 'door'; }
    var dog = itemAt(S.dogs, cx, cy);
    if (dog && !dog.calm) { dog.calm = true; return 'dog'; }

    var ca = catAt(S, cx, cy);
    if (ca) {
      if (ca.state === 'asleep') {
        ca.timer = Math.max(ca.timer, Math.min(ca.timer + SNOOZE, NAP_CAP));
        ca.snoozeFx = 0.6;
        return 'snooze';
      }
      return 'catfail';
    }

    for (var i = 0; i < S.holes.length; i++) {
      var h = S.holes[i];
      if (h.x === cx && h.y === cy && !h.opened) { h.opened = true; return 'open'; }
    }
    return null;
  }

  return {
    SNOOZE: SNOOZE, NAP_CAP: NAP_CAP, DEFAULT_SPEED: DEFAULT_SPEED,
    trapAt: trapAt, catAt: catAt, itemAt: itemAt, init: init, update: update, tap: tap
  };
})();
