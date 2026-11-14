'use strict';
/* Проверка проходимости всех уровней «ботом с человеческими ограничениями».
   Запуск:  node tools/verify.js            — проверить
            node tools/verify.js --write    — подобрать «соль» и записать в js/levels.js
   Бот играет по ТЕМ ЖЕ правилам (js/sim.js), что и игра:
   - открывает мышей по одной, предварительно сняв все ловушки на маршруте;
   - не быстрее 1 тапа за GAP секунд;
   - тапает кота только если он проспит ещё >= SAFE секунд (запас на реакцию);
   - в момент прохода мыши кот должен спать уже >= MARGIN и проспать ещё >= MARGIN. */
const fs = require('fs'), vm = require('vm'), path = require('path');
const root = path.join(__dirname, '..');
const lvPath = path.join(root, 'js/levels.js');
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'js/sim.js'), 'utf8') + '\nthis.Sim=Sim;', ctx);
vm.runInContext(fs.readFileSync(lvPath, 'utf8'), ctx);
const Sim = ctx.Sim;

const DT = 0.05, GAP = 0.5, SAFE = 0.8, LEAD = 1.8, MARGIN = 0.4;
const WRITE = process.argv.includes('--write');

function advanceCat(c, dt) {
  while (dt > 0) {
    if (dt >= c.timer) { dt -= c.timer; if (c.state === 'awake') { c.state = 'asleep'; c.timer = c.sleep; } else { c.state = 'awake'; c.timer = c.wake; } c.age = 0; }
    else { c.timer -= dt; c.age += dt; dt = 0; }
  }
}

/* одна попытка: открыть мышь через d секунд, держать котов спящими */
function trial(cats0, hole, speed, d, catIdx) {
  const S = { cats: cats0.map(c => Object.assign({}, c)), traps: [], cheese: null, speed,
    holes: [{ x: hole.x, y: hole.y, path: hole.path, opened: false, done: false, mouse: { i: 0, prog: 0, face: 1 } }] };
  const h = S.holes[0];
  // кот -> индекс клетки на пути
  const onPath = [];
  hole.path.forEach((cell, k) => { const ci = catIdx[cell[0] + ',' + cell[1]]; if (ci !== undefined) onPath.push({ ci, k }); });
  let t = 0, nextTap = 0, taps = 0, prevI = 0;
  const maxT = d + hole.path.length / speed + 5;
  while (t < maxT) {
    // политика
    if (t >= d && !h.opened && t >= nextTap) { Sim.tap(S, hole.x, hole.y); nextTap = t + GAP; taps++; }
    let best = null;
    for (const o of onPath) {
      const c = S.cats[o.ci];
      const a = d + o.k / speed, needEnd = a + MARGIN;
      if (needEnd < t || c.state !== 'asleep') continue;
      const natEnd = t + c.timer;
      if (natEnd >= needEnd) continue;
      const s2 = natEnd + c.wake;
      if (s2 <= a - MARGIN) continue;                 // следующее окно сна успеет само
      if (c.timer <= LEAD && c.timer >= SAFE && (!best || c.timer < best.timer)) best = c;
    }
    if (best && t >= nextTap) { Sim.tap(S, best.x, best.y); nextTap = t + GAP; taps++; }
    const ev = Sim.update(S, DT); t += DT;
    for (const e of ev) if (e.t === 'fail') return null;
    if (h.opened && h.mouse.i !== prevI) {
      prevI = h.mouse.i;
      for (const o of onPath) if (o.k === prevI) {
        const c = S.cats[o.ci];
        if (c.state !== 'asleep' || c.age < MARGIN || c.timer < MARGIN) return null;
      }
    }
    if (h.done) return { S, t, taps };
  }
  return null;
}


function normalizeLevelForBot(L) {
  const holes = L.holes.map(h => {
    let path = h.path.map(c => c.slice());
    for (const tp of (L.teleports || [])) {
      const a = path.findIndex(c => c[0] === tp.a.x && c[1] === tp.a.y);
      const b = path.findIndex(c => c[0] === tp.b.x && c[1] === tp.b.y);
      if (a >= 0 && b > a) { path = path.slice(0, a + 1).concat(path.slice(b)); break; }
    }
    return { x: h.x, y: h.y, path };
  });
  const cells = new Set();
  holes.forEach(h => h.path.forEach(c => cells.add(c[0] + ',' + c[1])));
  const on = a => (a || []).filter(o => cells.has(o.x + ',' + o.y));
  return { ...L, holes, cats: on(L.cats), traps: on(L.traps), dogs: on(L.dogs), doors: on(L.doors), teleports: [] };
}

function solveLevel(L) {
  L = normalizeLevelForBot(L);
  const speed = L.speed || 2.2;
  let cats = L.cats.map(c => ({ x: c.x, y: c.y, state: 'awake', timer: c.wake, wake: c.wake, sleep: c.sleep, age: 0 }));
  const catIdx = {}; cats.forEach((c, i) => catIdx[c.x + ',' + c.y] = i);
  const trapCells = {}; L.traps.forEach(tr => trapCells[tr.x + ',' + tr.y] = 1);
  const extraCells = {};
  (L.dogs || []).forEach(o => extraCells[o.x + ',' + o.y] = 1);
  (L.doors || []).forEach(o => extraCells[o.x + ',' + o.y] = 1);
  let total = 0, taps = 0;
  const done = new Set();
  const order = L.holes.map((_, i) => i);
  while (done.size < L.holes.length) {
    let progressed = false;
    for (const hi of order) {
      if (done.has(hi)) continue;
      const hole = L.holes[hi];
      // снять ловушки, открыть двери и успокоить собак на маршруте (+ время на каждый тап)
      let nt = 0;
      hole.path.forEach(c => { const k = c[0] + ',' + c[1]; if (trapCells[k]) { delete trapCells[k]; nt++; } if (extraCells[k]) { delete extraCells[k]; nt++; } });
      const pre = 1 + 0.5 * nt; taps += nt;
      cats.forEach(c => advanceCat(c, pre)); total += pre;
      let res = null, d = 0;
      for (d = 0; d <= 90; d += 0.25) {
        res = trial(cats, hole, speed, d, catIdx);
        if (res) break;
      }
      if (!res) return { ok: false, hole: hi };
      cats = res.S.cats; total += res.t; taps += res.taps;
      done.add(hi); progressed = true;
    }
    if (!progressed) break;
  }
  return { ok: true, time: total, taps };
}

const N = ctx.LEVEL_COUNT, salts = {};
let fails = 0, stats = [], t0 = Date.now();
for (let i = 0; i < N; i++) {
  const maxSalt = WRITE ? 60 : 0;
  let ok = false, res = null, s;
  for (s = 0; s <= maxSalt; s++) {
    const L = i < 10 ? ctx.getLevel(i) : ctx.buildLevel(i, WRITE ? s : (ctx.LEVEL_SALT[i] || 0));
    res = solveLevel(L);
    if (res.ok) { ok = true; if (s) salts[i] = s; break; }
    if (!WRITE) break;
  }
  if (!ok) { fails++; console.log('FAIL level', i + 1); }
  else stats.push(Object.assign({ i }, res));
  if (i % 100 === 99) console.log('...проверено', i + 1, 'за', ((Date.now() - t0) / 1000).toFixed(0), 'с');
}
console.log('\nУровней:', N, ' непроходимых:', fails, ' с подобранной солью:', Object.keys(salts).length);
for (let b = 0; b < N; b += 100) {
  const sl = stats.filter(x => x.i >= b && x.i < b + 100);
  if (!sl.length) continue;
  const avg = k => (sl.reduce((a, x) => a + x[k], 0) / sl.length);
  console.log(`уровни ${b + 1}-${b + 100}: ср. время бота ${avg('time').toFixed(0)} с, тапов ${avg('taps').toFixed(0)}`);
}
if (WRITE && fails === 0) {
  let src = fs.readFileSync(lvPath, 'utf8');
  src = src.replace(/var LEVEL_SALT = \{[^}]*\};/, 'var LEVEL_SALT = ' + JSON.stringify(salts) + ';');
  fs.writeFileSync(lvPath, src);
  console.log('Соль записана в js/levels.js');
}
process.exit(fails ? 1 : 0);
