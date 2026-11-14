'use strict';
/* Дымовой тест: гоняет игру с заглушками Canvas/DOM, проверяет экраны, ввод, сохранение. */
const fs = require('fs'), vm = require('vm'), path = require('path');
const root = path.join(__dirname, '..');
const noop = () => {};
const ctx2d = new Proxy({}, { get: (t, k) => k in t ? t[k] : k === 'measureText' ? (s => ({ width: String(s).length * 9 })) : (k === 'createLinearGradient' ? () => ({ addColorStop: noop }) : noop), set: (t, k, v) => { t[k] = v; return true; } });
const listeners = {};
const canvas = { width: 0, height: 0, style: {}, getContext: () => ctx2d, getBoundingClientRect: () => ({ left: 0, top: 0, width: 390, height: 800 }),
  addEventListener: (n, f) => { listeners[n] = f; }, setPointerCapture: noop };

// ---- поддельный WebAudio: считает узлы, проверяет вызовы ----
const audioStats = { osc: 0, noise: 0, nodes: 0, badParam: 0 };
let audioNow = 0;
const param = () => { const p = { value: 0 }; for (const m of ['setValueAtTime', 'linearRampToValueAtTime', 'exponentialRampToValueAtTime', 'setTargetAtTime']) p[m] = (v, tt) => { if (!isFinite(v) || !isFinite(tt === undefined ? 0 : tt) || v === 0 && m === 'exponentialRampToValueAtTime') audioStats.badParam++; return p; }; return p; };
const node = (extra = {}) => { audioStats.nodes++; return Object.assign({ connect: noop, start: noop, stop: noop, disconnect: noop }, extra); };
class FakeAudioContext {
  constructor() { this.state = 'suspended'; this.sampleRate = 8000; this.destination = {}; }
  get currentTime() { return audioNow; }
  resume() { this.state = 'running'; } suspend() { this.state = 'suspended'; }
  createGain() { return node({ gain: param() }); }
  createOscillator() { audioStats.osc++; return node({ frequency: param(), type: '' }); }
  createBiquadFilter() { return node({ frequency: param(), Q: param(), type: '' }); }
  createDynamicsCompressor() { return node(); }
  createBufferSource() { audioStats.noise++; return node({ buffer: null }); }
  createBuffer(c, n) { return { getChannelData: () => new Float32Array(n) }; }
}
const store = {};
const win = { innerWidth: 390, innerHeight: 800, devicePixelRatio: 2, addEventListener: noop, PointerEvent: function() {}, Telegram: null };
let rafCb = null;
const sandbox = { window: win, document: { readyState: 'complete', getElementById: () => canvas, addEventListener: noop, hidden: false },
  navigator: { language: 'ru' }, localStorage: { getItem: k => store[k] || null, setItem: (k, v) => { store[k] = v; } },
  Image: function() { setTimeout(() => this.onload && this.onload(), 0); }, setTimeout, clearTimeout, console, Math, JSON, Object, Promise,
  requestAnimationFrame: f => { rafCb = f; }, AudioContext: FakeAudioContext, setInterval, clearInterval };
Object.assign(sandbox, win); sandbox.window = sandbox;
vm.createContext(sandbox);
for (const f of ['sim.js', 'levels.js', 'ads.js', 'audio.js', 'game.js']) vm.runInContext(fs.readFileSync(path.join(root, 'js', f), 'utf8'), sandbox, { filename: f });
vm.runInContext('this.__G=G;this.__api={startLevel,openMap,Save,setScreen,zoomAt,gameTap,boardGeometry,fail,win,openShop,buyOrEquipSkin,SKINS};', sandbox);
const G = sandbox.__G, api = sandbox.__api;
let ts = 0;
function frames(n, dt = 16) { for (let i = 0; i < n; i++) { ts += dt; audioNow = ts / 1000; rafCb(ts); } }
const ev = (type, x, y, id = 1) => listeners[type]({ type, clientX: x, clientY: y, pointerId: id, preventDefault: noop });
const tapUI = label => { const b = vm.runInContext('uiButtons', sandbox).find(b => b.label === label); if (!b) throw new Error('no button ' + label); ev('pointerdown', b.x + 2, b.y + 2); ev('pointerup', b.x + 2, b.y + 2); };

setTimeout(() => {
  frames(5); console.log('экран:', G.screen);
  api.setScreen('menu'); frames(3);
  api.openMap(0); frames(3); console.log('карта ok, страница', G.mapPage);
  api.openMap(999); frames(3); console.log('карта 1000 ok, страница', G.mapPage);
  // отрисовка и тапы на разных уровнях
  for (const idx of [0, 9, 10, 150, 400, 700, 999]) {
    api.startLevel(idx, false); frames(10);
    const L = G.level;
    // зум/пан/щипок
    api.zoomAt(200, 400, 1.5); frames(2);
    ev('pointerdown', 100, 300, 1); ev('pointermove', 140, 340, 1); ev('pointerup', 140, 340, 1); frames(2);
    ev('pointerdown', 100, 300, 1); ev('pointerdown', 200, 300, 2); ev('pointermove', 80, 300, 1); ev('pointermove', 220, 300, 2); ev('pointerup', 80, 300, 1); ev('pointerup', 220, 300, 2); frames(2);
    console.log('уровень', idx + 1, L.cols + 'x' + L.rows, 'норы', L.holes.length, 'коты', L.cats.length, 'cs', G.cam.cs.toFixed(1), 'ok');
  }
  // реальное прохождение уровня 1 тапами: открыть нору (экранные координаты через geometry)
  api.startLevel(0, false); frames(3);
  const g = api.boardGeometry(), h = G.level.holes[0];
  ev('pointerdown', g.bx + h.x * g.cs + g.cs / 2, g.by + h.y * g.cs + g.cs / 2); ev('pointerup', 0, 0); 
  frames(400); console.log('после прогона уровня 1: overlay =', G.overlay, 'unlocked =', api.Save.data.unlocked);
  // ---------- ОБУЧЕНИЕ ----------
  const assert = (c, m) => { if (!c) { console.log('FAIL:', m); process.exit(1); } console.log('ok  :', m); };
  const blocking = () => vm.runInContext('tutBlocking()', sandbox);
  // ---------- МАГАЗИН И СКИНЫ ----------
  api.Save.data.coins = 100;
  api.openShop('mouse'); frames(4);
  assert(G.screen === 'shop', 'магазин мышей открывается и отрисовывается');
  api.buyOrEquipSkin('mouse', api.SKINS.mouse[1]);
  assert(api.Save.data.mouseSkin === 'gold' && api.Save.data.coins === 75, 'покупка скина мыши списывает монеты и экипирует его');
  api.openShop('cat'); frames(4);
  assert(G.screen === 'shop' && G.shopTab === 'cat', 'переключение на магазин котов работает');
  assert(api.Save.encode().v === 3, 'новый формат сохранения V3 активен');
  api.setScreen('menu'); frames(2);
  const cellXY = (x, y) => { const g = api.boardGeometry(); return [g.bx + (x + .5) * g.cs, g.by + (y + .5) * g.cs]; };
  const tapCell = (x, y) => { const [px, py] = cellXY(x, y); ev('pointerdown', px, py, 9); ev('pointerup', px, py, 9); };
  api.Save.data.tut = {};
  // 1. нора
  api.startLevel(0, false); frames(3);
  assert(G.tut && G.tut.id === 'basics' && !blocking(), 'уровень 1: обучение «basics», игра не на паузе');
  const h0 = G.level.holes[0]; tapCell(h0.x, h0.y); frames(2);
  assert(G.tut.i === 1, 'после тапа по норе шаг сменился');
  frames(500);
  assert(G.overlay === 'win' && api.Save.data.tut.basics === 1, 'победа — обучение basics отмечено пройденным');
  // 2. кот
  api.startLevel(1, false); frames(3);
  assert(G.tut.id === 'cats' && blocking(), 'уровень 2: шаг-пауза про кота');
  const c0 = G.cats[0]; const cp = cellXY(c0.x, c0.y);
  const timerBefore = c0.timer; frames(30);
  assert(c0.timer === timerBefore, 'на паузе кот не двигается');
  const hp = cellXY(G.level.holes[0].x, G.level.holes[0].y);
  ev('pointerdown', hp[0], hp[1], 9); ev('pointerup', hp[0], hp[1], 9); frames(2);
  assert(!G.holes[0].opened, 'на паузе тап по норе игнорируется');
  tapUI('Понятно'); frames(2);
  assert(!blocking() && G.tut.i === 1, 'после «Понятно» игра идёт, шаг «жди»');
  frames(260);   // кот засыпает
  assert(G.tut.i === 2 && c0.state === 'asleep', 'кот уснул — шаг «тапни кота»');
  tapCell(c0.x, c0.y); frames(2);
  assert(G.tut.i === 3, 'тап по спящему коту — шаг «открой нору»');
  tapCell(G.level.holes[0].x, G.level.holes[0].y); frames(2);
  assert(G.holes[0].opened, 'нора открыта');
  for (let k = 0; k < 400 && !G.overlay; k++) { if (c0.state === 'asleep' && c0.timer < 3) tapCell(c0.x, c0.y); frames(1); }
  assert(G.overlay === 'win' && api.Save.data.tut.cats === 1, 'уровень 2 пройден по подсказкам, обучение отмечено');
  // 3. ловушка
  api.startLevel(3, false); frames(2);
  assert(G.tut.id === 'traps' && blocking(), 'уровень 4: ловушка');
  tapUI('Понятно'); frames(2);
  tapCell(G.traps[0].x, G.traps[0].y); frames(2);
  assert(G.tut.i === 2, 'ловушка обезврежена — следующий шаг');
  // 4. пропуск
  api.Save.data.tut = {}; api.startLevel(2, false); frames(2);
  assert(G.tut.id === 'multi', 'уровень 3: две норы');
  tapUI('Пропустить'); frames(2);
  assert(!G.tut && api.Save.data.tut.camera === 1 && !blocking(), '«Пропустить» отключает всё обучение');
  // 5. камера
  api.Save.data.tut = { basics: 1, cats: 1, multi: 1, traps: 1, cheese: 1, bends: 1 };
  api.startLevel(300, false); frames(3);
  assert(G.tut && G.tut.id === 'camera' && blocking(), 'большое поле: обучение камере');
  tapUI('Понятно'); frames(1); tapUI('Понятно'); frames(2);
  assert(!G.tut && api.Save.data.tut.camera === 1, 'камера: два шага пройдены');
  api.startLevel(300, false); frames(2);
  assert(!G.tut, 'повторно камера не показывается');
  // 6. извилистые пути
  api.Save.data.tut = { basics: 1, cats: 1, multi: 1, traps: 1, cheese: 1, camera: 1 };
  api.startLevel(500, false); frames(3);
  assert(G.tut && G.tut.id === 'bends', 'извилистые маршруты: обучение bends');
  tapUI('Понятно'); frames(2);
  assert(!G.tut, 'bends пройден');
  // 7. невидимые кнопки не копятся
  api.startLevel(20, false); G.overlay = 'pause'; frames(5); G.overlay = null; frames(100);
  assert(vm.runInContext('uiButtons.length', sandbox) < 20, 'список кнопок пересобирается каждый кадр (нет «призрачных» кнопок)');
  // 8. сохранение флагов
  api.Save.data.tut = { basics: 1, cats: 1 };
  assert(api.Save.encode().t === 'basics,cats', 'флаги обучения попадают в сохранение');
  // ---------- ЗВУК ----------
  const A = sandbox.AudioSys;
  assert(A.ctx && A.ctx.state === 'running', 'AudioContext создан и запущен после первого тапа');
  assert(A.playing === 'menu' || A.playing, 'выбрана музыкальная дорожка: ' + A.playing);
  // музыка играет: планировщик за 2 с реального времени
  const osc0 = audioStats.osc; A.setTrack('easy'); const w = Date.now(); 
  const waitFor = (ms) => new Promise(r => setTimeout(r, ms));
  (async () => {
    for (let i = 0; i < 25; i++) { frames(6); await waitFor(60); }
    assert(audioStats.osc > osc0 + 20, 'музыка планирует ноты (создано осцилляторов: ' + (audioStats.osc - osc0) + ')');
    // дорожки по сложности
    for (const [idx, tr] of [[5, 'easy'], [300, 'mid'], [800, 'hard']]) { api.startLevel(idx, false); frames(2); assert(A.playing === tr, 'уровень ' + (idx + 1) + ' → дорожка ' + tr); }
    api.setScreen('menu'); frames(2); assert(A.playing === 'menu', 'меню → дорожка menu');
    // эффекты
    const before = audioStats.osc + audioStats.noise;
    A.open(); A.exitMouse(); A.trap(); A.crunch(); A.purr(); A.catWake(1); A.catSleep(1); A.win(); A.fail('trap'); A.fail('cat'); A.tap();
    assert(audioStats.osc + audioStats.noise > before + 25, 'все эффекты создают звук');
    // выключатели
    A.muted = true; const b2 = audioStats.osc; A.open(); A.fail('cat'); assert(audioStats.osc === b2, 'звуки выключены — тишина');
    A.muted = false;
    A.setMusic(false); const b3 = audioStats.osc; for (let i = 0; i < 10; i++) { frames(6); await waitFor(60); }
    assert(audioStats.osc === b3, 'музыка выключена — новые ноты не планируются');
    A.setMusic(true); for (let i = 0; i < 10; i++) { frames(6); await waitFor(60); }
    assert(audioStats.osc > b3, 'музыка снова включена — играет');
    // события игры → звуки котов на экране
    api.Save.data.tut = { basics: 1, cats: 1, multi: 1, traps: 1, cheese: 1, camera: 1, bends: 1 }; api.startLevel(1, false); frames(2); const bc = audioStats.osc + audioStats.noise; frames(260);
    assert(audioStats.osc + audioStats.noise > bc, 'кот проснулся/уснул — слышно мяуканье/мурлыканье');
    // пауза-переключатели и сохранение
    api.startLevel(20, false); G.overlay = 'pause'; frames(3);
    const mb = vm.runInContext('uiButtons', sandbox).find(b => b.label === 'Музыка: вкл'); assert(!!mb, 'в паузе есть переключатель музыки');
    ev('pointerdown', mb.x + 2, mb.y + 2); ev('pointerup', mb.x + 2, mb.y + 2); frames(2);
    assert(api.Save.data.music === false && A.musicOn === false, 'переключатель выключил музыку');
    assert(api.Save.encode().m === 0, 'настройка музыки попадает в сохранение');
    assert(A.errors === 0, 'ошибок в звуковом коде: ' + A.errors);
    assert(audioStats.badParam === 0, 'некорректных параметров WebAudio (NaN/0 в exp-рампе): ' + audioStats.badParam);
    api.Save.data.music = true; A.setMusic(true);
    finish();
  })();
  return;
  function finish() {
  // сохранение: размер
  api.Save.data.unlocked = 999; for (let i = 0; i < 1000; i++) api.Save.data.stars[i] = 3;
  const enc = JSON.stringify(api.Save.encode());
  console.log('размер сохранения на 1000 уровней:', enc.length, 'символов (лимит CloudStorage 4096)');
  // старый формат
  store.mousekin_save = JSON.stringify({ unlocked: 12, stars: { 0: 3, 1: 2 }, sound: false });
  sandbox.Ads.load().then(d => { console.log('старый формат читается:', JSON.stringify(d)); process.exit(0); });
  }
}, 50);
