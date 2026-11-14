'use strict';
const fs = require('fs');
const vm = require('vm');
const assert = require('assert');
const root = require('path').join(__dirname, '..');
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(root + '/js/sim.js', 'utf8') + '\nthis.Sim=Sim;', ctx);
const Sim = ctx.Sim;

// Dog + door + coin + portal: the mouse must calm/open, collect, teleport and exit.
const S = {};
Sim.init(S, {
  cols: 5, rows: 1, speed: 1,
  holes: [{ x: 0, y: 0, path: [[0,0],[1,0],[2,0],[3,0],[4,0]] }],
  cats: [], traps: [], dogs: [{ x: 1, y: 0 }], doors: [{ x: 2, y: 0 }],
  teleports: [{ a: { x: 3, y: 0 }, b: { x: 4, y: 0 } }], coins: [{ x: 1, y: 0 }]
});
assert.strictEqual(Sim.tap(S, 1, 0), 'dog');
assert.strictEqual(Sim.tap(S, 2, 0), 'door');
assert.strictEqual(Sim.tap(S, 0, 0), 'open');
let events = [];
for (let i = 0; i < 8 && !S.holes[0].done; i++) events = events.concat(Sim.update(S, 1));
assert(S.holes[0].done, 'mouse exits after using portal');
assert(events.some(e => e.t === 'coin'), 'coin collection event is emitted');
assert(events.some(e => e.t === 'teleport'), 'teleport event is emitted');

// Untamed dog and closed door must stop the mouse.
const dogFail = {};
Sim.init(dogFail, { cols: 3, rows: 1, speed: 1,
  holes: [{ x: 0, y: 0, path: [[0,0],[1,0],[2,0]] }], cats: [], traps: [],
  dogs: [{ x: 1, y: 0 }], doors: [], coins: [] });
Sim.tap(dogFail, 0, 0);
assert.strictEqual(Sim.update(dogFail, 1).find(e => e.t === 'fail').reason, 'dog');

const doorFail = {};
Sim.init(doorFail, { cols: 3, rows: 1, speed: 1,
  holes: [{ x: 0, y: 0, path: [[0,0],[1,0],[2,0]] }], cats: [], traps: [],
  dogs: [], doors: [{ x: 1, y: 0 }], coins: [] });
Sim.tap(doorFail, 0, 0);
assert.strictEqual(Sim.update(doorFail, 1).find(e => e.t === 'fail').reason, 'door');

console.log('OK: собака, дверь, монета, телепорт и оба состояния проигрыша');
