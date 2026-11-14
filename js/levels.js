'use strict';
/* ================= УРОВНИ «МЫШКИН ПОБЕГ» =================
   Формат уровня:
   cols, rows           — размер сетки
   holes[]              — норы: x,y и путь мыши path (последняя клетка — выход)
   cats[]               — коты: x,y, wake (бодрствует сек), sleep (дремлет сек)
   traps[]              — мышеловки: x,y
   cheese               — бонусный сыр (звезда №3) или null
=========================================================== */

/* 10 авторских уровней (обучение + босс зоны) */
var HAND_LEVELS = [
  { cols:6, rows:6,
    holes:[{ x:0, y:2, path:[[0,2],[1,2],[2,2],[3,2],[4,2],[5,2]] }],
    cats:[], traps:[], cheese:null },

  { cols:6, rows:6,
    holes:[{ x:0, y:2, path:[[0,2],[1,2],[2,2],[3,2],[4,2],[5,2]] }],
    cats:[{ x:3, y:2, wake:3, sleep:5 }],
    traps:[], cheese:null },

  { cols:6, rows:6,
    holes:[{ x:0, y:1, path:[[0,1],[1,1],[2,1],[3,1],[4,1],[5,1]] },
           { x:0, y:4, path:[[0,4],[1,4],[2,4],[3,4],[4,4],[5,4]] }],
    cats:[{ x:3, y:1, wake:3, sleep:4 }],
    traps:[], cheese:null },

  { cols:6, rows:6,
    holes:[{ x:0, y:3, path:[[0,3],[1,3],[2,3],[3,3],[4,3],[5,3]] }],
    cats:[], traps:[{ x:3, y:3 }], cheese:null },

  { cols:6, rows:6,
    holes:[{ x:0, y:2, path:[[0,2],[1,2],[2,2],[2,3],[2,4],[2,5],[3,5],[4,5],[5,5]] },
           { x:0, y:4, path:[[0,4],[1,4],[2,4],[3,4],[4,4],[5,4]] }],
    cats:[{ x:2, y:4, wake:3, sleep:5 }],
    traps:[{ x:4, y:4 }], cheese:null },

  { cols:6, rows:6,
    holes:[{ x:0, y:2, path:[[0,2],[1,2],[2,2],[3,2],[4,2],[5,2]] }],
    cats:[{ x:2, y:2, wake:4, sleep:4 }],
    traps:[], cheese:{ x:4, y:2 } },

  { cols:6, rows:6,
    holes:[{ x:0, y:2, path:[[0,2],[1,2],[2,2],[3,2],[4,2],[5,2]] }],
    cats:[{ x:2, y:2, wake:4.2, sleep:3.5 }, { x:4, y:2, wake:4.5, sleep:3.2 }],
    traps:[{ x:3, y:2 }], cheese:null },

  { cols:6, rows:6,
    holes:[{ x:0, y:1, path:[[0,1],[1,1],[2,1],[3,1],[4,1],[5,1]] },
           { x:0, y:3, path:[[0,3],[1,3],[2,3],[3,3],[4,3],[5,3]] },
           { x:0, y:5, path:[[0,5],[1,5],[2,5],[3,5],[4,5],[5,5]] }],
    cats:[{ x:2, y:1, wake:4.2, sleep:3.5 }, { x:3, y:3, wake:4.5, sleep:3.2 }, { x:2, y:5, wake:4.2, sleep:3.4 }],
    traps:[{ x:4, y:1 }, { x:4, y:3 }, { x:4, y:5 }],
    dogs:[{ x:1, y:3 }], doors:[{ x:3, y:5 }], coins:[{ x:3, y:1 }], cheese:null },

  { cols:6, rows:6,
    holes:[{ x:0, y:2, path:[[0,2],[1,2],[2,2],[3,2],[3,3],[3,4],[4,4],[5,4]] },
           { x:0, y:5, path:[[0,5],[1,5],[2,5],[3,5],[4,5],[5,5]] }],
    cats:[{ x:1, y:2, wake:4.5, sleep:3.2 }, { x:3, y:4, wake:4.2, sleep:3.4 }, { x:2, y:5, wake:4.5, sleep:3.2 }, { x:4, y:5, wake:4.2, sleep:3.3 }],
    traps:[{ x:2, y:2 }, { x:1, y:5 }, { x:4, y:4 }],
    dogs:[{ x:3, y:3 }], doors:[{ x:3, y:5 }], coins:[{ x:3, y:2 }], cheese:null },

  { cols:6, rows:6,
    holes:[{ x:0, y:0, path:[[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[5,1],[5,2]] },
           { x:0, y:3, path:[[0,3],[1,3],[2,3],[2,2],[2,1],[3,1],[4,1],[4,2],[4,3],[5,3]] },
           { x:0, y:5, path:[[0,5],[1,5],[2,5],[3,5],[4,5],[5,5]] }],
    cats:[{ x:2, y:0, wake:4.5, sleep:3.2 }, { x:5, y:1, wake:4.2, sleep:3.3 },
          { x:1, y:3, wake:4.5, sleep:3.2 }, { x:3, y:1, wake:4.2, sleep:3.3 },
          { x:2, y:5, wake:4.5, sleep:3.2 }, { x:4, y:5, wake:4.2, sleep:3.3 }],
    traps:[{ x:4, y:0 }, { x:2, y:3 }, { x:3, y:5 }],
    dogs:[{ x:1, y:5 }], doors:[{ x:3, y:0 }],
    teleports:[{ a:{ x:2, y:2 }, b:{ x:4, y:2 } }], coins:[{ x:1, y:0 }],
    cheese:{ x:4, y:3 } }
];

/* ============================================================
   ГЕНЕРАТОР 1000 УРОВНЕЙ
   Уровни 1–10 — авторские. Уровни 11–1000 строятся детерминированно
   (у всех игроков одинаковые) по формулам сложности levelParams().
   LEVEL_SALT — «соль» для уровней, где первая раскладка не прошла
   проверку ботом (tools/verify.js). Так проходимость гарантирована.
   ============================================================ */
var LEVEL_COUNT = 1000;
var LEVEL_SALT = {"818":1};

function mulberry32(a) {
  return function() {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffleRnd(rnd, arr) {
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(rnd() * (i + 1));
    var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
  }
  return arr;
}
function rint(rnd, a, b) { return a + Math.floor(rnd() * (b - a + 1)); }
function r1(v) { return Math.round(v * 10) / 10; }

/* Параметры сложности: всё НЕ убывает с ростом номера уровня */
function levelParams(idx) {
  var d = idx - 10;                       // 0..989
  var t = Math.min(1, d / 989);
  var S = Math.min(30, 6 + Math.floor(d / 24));            // размер поля 6 → 30
  var H = Math.min(2 + Math.floor(d / 85), Math.floor(S / 2)); // больше нор на средних и высоких уровнях
  var rhoC = 0.18 + 0.24 * t;             // больше котов на маршрутах
  var rhoT = 0.07 + 0.08 * t;             // плотнее расставлены мышеловки
  return {
    d: d, t: t, S: S, H: H,
    cats: Math.max(3, Math.floor(H * (S - 3) * rhoC)),
    traps: Math.max(2, Math.floor(H * (S - 4) * rhoT)),
    speed: r1(2.3 + 0.8 * t),
    sleepBase: 4.6 - 2.2 * t,             // коты спят меньше на поздних уровнях
    wakeBase: 3.3 + 2.7 * t,              // коты дольше бодрствуют
    bendMax: Math.min(8, Math.floor(d / 90)),
    maxJump: Math.min(29, 2 + Math.floor(d / 65)),
    cross: d >= 150
  };
}

/* Маршрут слева направо: горизонтальные участки + вертикальные сдвиги в колонках-изгибах */
function buildPath(cols, y0, bendCols, bendRows, exitRow) {
  var p = [[0, y0]], x = 0, y = y0, i;
  for (i = 0; i < bendCols.length; i++) {
    while (x < bendCols[i]) { x++; p.push([x, y]); }
    var ty = bendRows[i], st = ty > y ? 1 : -1;
    while (y !== ty) { y += st; p.push([x, y]); }
  }
  while (x < cols - 1) { x++; p.push([x, y]); }
  while (y !== exitRow) { y += (exitRow > y ? 1 : -1); p.push([x, y]); } // страховка
  return p;
}

function buildLevel(idx, salt) {
  var P = levelParams(idx);
  var rnd = mulberry32(idx * 7919 + 12345 + (salt || 0) * 104729);
  var S = P.S, H = P.H;
  var cols = S;
  var rows = S < 8 ? S : Math.max(2 * H, Math.min(30, S + rint(rnd, -1, 2)));
  var i, j, k;

  /* ряды нор: стараемся не ставить рядом */
  var holeRows = null;
  for (k = 0; k < 30; k++) {
    var pool = shuffleRnd(rnd, Array.apply(null, Array(rows)).map(function(_, n) { return n; })).slice(0, H).sort(function(a, b) { return a - b; });
    holeRows = pool;
    var ok = true;
    for (i = 1; i < pool.length; i++) if (pool[i] - pool[i - 1] < 2) ok = false;
    if (ok || rows < 2 * H + 1) break;
  }

  /* какие пути прямые, какие извилистые */
  var bendChance = P.bendMax > 0 ? Math.min(0.85, 0.25 + P.d / 1200) : 0;
  var straight = holeRows.map(function() { return !(rnd() < bendChance); });
  var exitUsed = {};
  for (i = 0; i < H; i++) if (straight[i]) exitUsed[holeRows[i]] = true;
  var freeExit = [];
  for (i = 0; i < rows; i++) if (!exitUsed[i]) freeExit.push(i);
  shuffleRnd(rnd, freeExit);

  var cellPaths = {};   // 'x,y' -> сколько путей проходит
  function addCells(path) { path.forEach(function(c) { var kk = c[0] + ',' + c[1]; cellPaths[kk] = (cellPaths[kk] || 0) + 1; }); }
  function overlaps(path) { return path.some(function(c) { return cellPaths[c[0] + ',' + c[1]]; }); }

  var paths = [];
  for (i = 0; i < H; i++) {
    var y0 = holeRows[i], path = null, tries = 0;
    if (straight[i]) {
      path = buildPath(cols, y0, [], [], y0);
    } else {
      var exitRow = freeExit.pop();
      while (tries < 40) {
        tries++;
        var nb = rint(rnd, 1, Math.max(1, P.bendMax));
        nb = Math.min(nb, cols - 2);
        var colSet = {};
        while (Object.keys(colSet).length < nb) colSet[rint(rnd, 1, cols - 2)] = 1;
        var bc = Object.keys(colSet).map(Number).sort(function(a, b) { return a - b; });
        var br = [], prev = y0;
        for (j = 0; j < bc.length; j++) {
          var ny;
          if (j === bc.length - 1) ny = exitRow;
          else {
            ny = prev + rint(rnd, -P.maxJump, P.maxJump);
            ny = Math.max(0, Math.min(rows - 1, ny));
          }
          br.push(ny); prev = ny;
        }
        path = buildPath(cols, y0, bc, br, exitRow);
        if (P.cross || !overlaps(path)) break;
      }
    }
    paths.push(path);
    addCells(path);
  }

  /* клетки, где опасности запрещены: начало и конец любого пути */
  var protect = {};
  paths.forEach(function(p) {
    [0, 1, p.length - 2, p.length - 1].forEach(function(n) { protect[p[n][0] + ',' + p[n][1]] = 1; });
  });
  var used = {}, catKey = {};
  var cats = [], traps = [];
  var tt = P.t;

  function distribute(total) {
    var q = paths.map(function() { return 0; });
    for (var n = 0; n < total; n++) q[n % paths.length]++;
    return shuffleRnd(rnd, q);
  }
  var catQ = distribute(P.cats), trapQ = distribute(P.traps);

  for (i = 0; i < paths.length; i++) {
    var path2 = paths[i], L = path2.length, placed = 0, att = 0;
    // сколько котов уже стоит на этом пути (общие клетки при пересечениях)
    path2.forEach(function(c) { if (catKey[c[0] + ',' + c[1]]) placed++; });
    while (placed < catQ[i] && att < 300) {
      att++;
      var kx = rint(rnd, 2, L - 3), c = path2[kx], key = c[0] + ',' + c[1];
      if (used[key] || protect[key]) continue;
      var pc = path2[kx - 1], nc = path2[kx + 1];
      if (catKey[pc[0] + ',' + pc[1]] || catKey[nc[0] + ',' + nc[1]]) continue;
      used[key] = 1; catKey[key] = 1;
      cats.push({
        x: c[0], y: c[1],
        wake: r1(Math.max(2, P.wakeBase + (rnd() - 0.5) * 1.0)),
        sleep: r1(Math.max(2.6, P.sleepBase + (rnd() - 0.5) * 0.8))
      });
      placed++;
    }
  }
  for (i = 0; i < paths.length; i++) {
    var path3 = paths[i], L3 = path3.length, pl = 0, at2 = 0;
    while (pl < trapQ[i] && at2 < 200) {
      at2++;
      var kt = rint(rnd, 2, L3 - 3), ct = path3[kt], keyt = ct[0] + ',' + ct[1];
      if (used[keyt] || protect[keyt]) continue;
      used[keyt] = 1;
      traps.push({ x: ct[0], y: ct[1] });
      pl++;
    }
  }
  var cheese = null;
  if (rnd() < 0.55) {
    var pp = paths[rint(rnd, 0, paths.length - 1)];
    for (k = 0; k < 40; k++) {
      var kc = rint(rnd, 2, pp.length - 3), cc = pp[kc], keyc = cc[0] + ',' + cc[1];
      if (!used[keyc] && !protect[keyc]) { cheese = { x: cc[0], y: cc[1] }; break; }
    }
  }

  var holes = paths.map(function(p) { return { x: p[0][0], y: p[0][1], path: p }; });
  /* Новые интерактивные объекты размещаются только на безопасных клетках маршрутов. */
  var dogs = [], doors = [], teleports = [], coins = [];
  function placeExtra(target, count, type) {
    for (var n = 0; n < count; n++) {
      var candidates = [];
      paths.forEach(function(pp, pi) {
        for (var kk = 2; kk < pp.length - 2; kk++) {
          var cc = pp[kk], key = cc[0] + ',' + cc[1];
          if (!used[key] && !protect[key]) candidates.push({ c: cc, pi: pi, kk: kk });
        }
      });
      if (!candidates.length) break;
      var pick = candidates[rint(rnd, 0, candidates.length - 1)], cell = pick.c;
      used[cell[0] + ',' + cell[1]] = 1;
      target.push({ x: cell[0], y: cell[1] });
    }
  }
  var dogCount = idx >= 10 ? Math.min(2, 1 + Math.floor(P.d / 420)) : 0;
  var doorCount = idx >= 16 ? Math.min(2, 1 + Math.floor(P.d / 500)) : 0;
  placeExtra(dogs, dogCount, 'dog');
  placeExtra(doors, doorCount, 'door');
  /* Одна пара порталов: вход и выход принадлежат одному маршруту, выход дальше по пути. */
  if (idx >= 28 && rnd() < 0.62) {
    for (var ti = 0; ti < paths.length; ti++) {
      var tpPath = paths[ti], pairFound = false;
      for (var ai = 2; ai < tpPath.length - 4 && !pairFound; ai++) {
        var ac = tpPath[ai], ak = ac[0] + ',' + ac[1];
        if (used[ak] || protect[ak]) continue;
        for (var bi = ai + 3; bi < tpPath.length - 1; bi++) {
          var bc2 = tpPath[bi], bk = bc2[0] + ',' + bc2[1];
          if (!used[bk] && !protect[bk]) {
            teleports.push({ a: { x: ac[0], y: ac[1] }, b: { x: bc2[0], y: bc2[1] } });
            used[ak] = used[bk] = 1; pairFound = true; break;
          }
        }
      }
      if (pairFound) break;
    }
  }
  /* Монета лежит на маршруте; допускается клетка рядом с норой/выходом, но не сами нора и выход. */
  var coinCells = [];
  paths.forEach(function(pp) { for (var ci = 1; ci < pp.length - 1; ci++) { var ccoin = pp[ci], ckey = ccoin[0] + ',' + ccoin[1]; if (!used[ckey]) coinCells.push(ccoin); } });
  if (coinCells.length) { var chosenCoin = coinCells[rint(rnd, 0, coinCells.length - 1)]; coins.push({ x: chosenCoin[0], y: chosenCoin[1] }); used[chosenCoin[0] + ',' + chosenCoin[1]] = 1; }

  var level = { cols: cols, rows: rows, holes: holes, cats: cats, traps: traps, dogs: dogs, doors: doors, teleports: teleports, coins: coins, cheese: cheese, speed: P.speed };

  /* случайно поворачиваем поле на бок (мыши бегут сверху вниз) */
  if (rnd() < 0.5) {
    level = {
      cols: rows, rows: cols, speed: P.speed,
      holes: holes.map(function(h) { return { x: h.y, y: h.x, path: h.path.map(function(c) { return [c[1], c[0]]; }) }; }),
      cats: cats.map(function(c) { return { x: c.y, y: c.x, wake: c.wake, sleep: c.sleep }; }),
      traps: traps.map(function(c) { return { x: c.y, y: c.x }; }),
      dogs: dogs.map(function(c) { return { x: c.y, y: c.x }; }),
      doors: doors.map(function(c) { return { x: c.y, y: c.x }; }),
      teleports: teleports.map(function(p) { return { a: { x: p.a.y, y: p.a.x }, b: { x: p.b.y, y: p.b.x } }; }),
      coins: coins.map(function(c) { return { x: c.y, y: c.x }; }),
      cheese: cheese ? { x: cheese.y, y: cheese.x } : null
    };
  }
  return level;
}

var LEVEL_CACHE = {};
function getLevel(idx) {
  if (idx < HAND_LEVELS.length) return HAND_LEVELS[idx];
  if (!LEVEL_CACHE[idx]) LEVEL_CACHE[idx] = buildLevel(idx, LEVEL_SALT[idx] || 0);
  return LEVEL_CACHE[idx];
}

/* Тематические главы кампании. Индекс уровня начинается с нуля. */
function getChapter(idx) {
  if (idx < 100) return { id: 'apartment', title: 'Квартира', range: '1–100', floorA: '#f7ecd7', floorB: '#f0e1c2', wall: '#f5e6cf', accent: '#b77a45' };
  if (idx < 300) return { id: 'basement', title: 'Подвал', range: '101–300', floorA: '#b9b5a6', floorB: '#aaa695', wall: '#d1cbbb', accent: '#687b79' };
  return { id: 'warehouse', title: 'Склад', range: '301–1000', floorA: '#c5b99e', floorB: '#b7a98b', wall: '#ded1b5', accent: '#9a713b' };
}
