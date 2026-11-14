'use strict';
/* ============================================================
   МЫШКИН ПОБЕГ — Telegram Mini App
   Чистый JS, Canvas 2D. Экраны: загрузка → меню → карта → игра.
   ============================================================ */

/* ---------------- Локализация ---------------- */
var STR = {
  ru: {
    title: 'Мышкин побег',
    play: 'Играть', again: 'Ещё раз', next: 'Следующий', map: 'Карта уровней',
    retry: 'Заново', resume: 'Продолжить', restart: 'Начать заново', menu: 'В меню',
    failCat: 'Мышь убежала в кота!', failTrap: 'Ловушка захлопнулась!',
    hint: 'Подсказка', skip: 'Пропустить уровень', win: 'Уровень пройден!',
    level: 'Уровень',
    loading: 'Загрузка…', locked: 'Закрыто',
    mice: 'Мыши', current: 'К текущему',
    music: 'Музыка', sounds: 'Звуки', on: 'вкл', off: 'выкл',
    gotit: 'Понятно', skipTut: 'Пропустить', tutorial: 'Обучение',
    tut_basics_open: 'Это нора мышки. Тапни по ней — мышка побежит к коврику-выходу по пунктиру.',
    tut_basics_run: 'Отлично! Дождись, пока мышка добежит до выхода.',
    tut_cat_intro: 'Это кот. Пока он бодрствует («!» и красная полоска), мышь, дошедшая до него, проиграет. Не тапай бодрого кота!',
    tut_cat_wait: 'Подожди, пока кот уснёт: красная полоска закончится.',
    tut_cat_snooze: 'Тапни спящего кота — он проспит ещё 4 секунды. Синяя полоска показывает, сколько ему осталось.',
    tut_cat_open: 'Теперь открой нору. Пока мышь бежит, подтапывай кота, чтобы он не проснулся.',
    tut_cat_run: 'Следи за синей полоской и тапай кота, пока мышь не пробежит мимо.',
    tut_multi_intro: 'Здесь две норы. Мышей можно выпускать в любом порядке. Начни с той, на пути которой нет котов.',
    tut_multi_run: 'Теперь вторая мышь: сначала уложи кота спать, потом открывай нору.',
    tut_trap_intro: 'Это мышеловка. Если мышь наступит на неё — уровень проигран.',
    tut_trap_tap: 'Тапни по мышеловке, чтобы обезвредить её.',
    tut_trap_open: 'Путь свободен. Выпускай мышь!',
    tut_cheese: 'Сыр! Мышь, пробежавшая по нему, принесёт третью звезду. Звёзды: 1 — пройти уровень, 2 — без проигрышей, 3 — собрать сыр.',
    tut_camera_1: 'Поле большое. Двигай его пальцем, сведи пальцы — зум. Кнопки справа: + и −, а нижняя вписывает всё поле на экран.',
    tut_camera_2: 'Кнопка «Подсказка» покажет следующий шаг и сама наведёт на него камеру.',
        tut_bends_1: 'Пути бывают извилистыми. Цвет пунктира совпадает с цветом норы и коврика выхода. Пути могут пересекаться — кот на перекрёстке мешает обеим мышам.',
    failDog: 'Собака напугала мышку!', failDoor: 'Дверь ещё закрыта!',
    shop: 'Магазин', coins: 'Монеты', mouseSkins: 'Образы мышей', catSkins: 'Образы котов',
    buy: 'Купить', equip: 'Выбрать', equipped: 'Выбрано', owned: 'Открыто',
    chapterApartment: 'Квартира', chapterBasement: 'Подвал', chapterWarehouse: 'Склад',
    dogHelp: 'Собака: нажми на неё, чтобы успокоить.', doorHelp: 'Дверь: нажми, чтобы открыть.'
  },
  en: {
    title: 'Mouse Escape',
    play: 'Play', again: 'Again', next: 'Next', map: 'Levels',
    retry: 'Retry', resume: 'Resume', restart: 'Restart', menu: 'Menu',
    failCat: 'The mouse ran into the cat!', failTrap: 'The trap snapped shut!',
    hint: 'Hint', skip: 'Skip level', win: 'Level complete!',
    level: 'Level',
    loading: 'Loading…', locked: 'Locked',
    mice: 'Mice', current: 'Current',
    music: 'Music', sounds: 'Sounds', on: 'on', off: 'off',
    gotit: 'Got it', skipTut: 'Skip', tutorial: 'Tutorial',
    tut_basics_open: 'This is a mouse hole. Tap it — the mouse runs along the dotted path to the exit mat.',
    tut_basics_run: 'Nice! Wait until the mouse reaches the exit.',
    tut_cat_intro: 'This is a cat. While it is awake (a “!” and a red bar) a mouse that reaches it loses. Never tap an awake cat!',
    tut_cat_wait: 'Wait for the cat to fall asleep: the red bar runs out.',
    tut_cat_snooze: 'Tap the sleeping cat — it sleeps 4 more seconds. The blue bar shows how much sleep is left.',
    tut_cat_open: 'Now open the hole. While the mouse runs, keep tapping the cat so it stays asleep.',
    tut_cat_run: 'Watch the blue bar and keep tapping the cat until the mouse has passed.',
    tut_multi_intro: 'Two holes here. Release the mice in any order. Start with the one that has no cats on its path.',
    tut_multi_run: 'Now the second mouse: put its cat to sleep first, then open the hole.',
    tut_trap_intro: 'This is a mousetrap. If a mouse steps on it, you lose.',
    tut_trap_tap: 'Tap the trap to disarm it.',
    tut_trap_open: 'The path is clear. Release the mouse!',
    tut_cheese: 'Cheese! A mouse running over it earns the third star. Stars: 1 — finish, 2 — no fails, 3 — get the cheese.',
    tut_camera_1: 'The board is big. Drag to move it, pinch to zoom. Buttons on the right: + and −, and the bottom one fits the whole board.',
    tut_camera_2: 'The Hint button shows the next move and moves the camera there for you.',
        tut_bends_1: 'Paths can wind. The dotted colour matches its hole and exit mat. Paths may cross — a cat on a crossing blocks both mice.',
    failDog: 'The dog scared the mouse!', failDoor: 'The door is still closed!',
    shop: 'Shop', coins: 'Coins', mouseSkins: 'Mouse skins', catSkins: 'Cat skins',
    buy: 'Buy', equip: 'Equip', equipped: 'Equipped', owned: 'Owned',
    chapterApartment: 'Apartment', chapterBasement: 'Basement', chapterWarehouse: 'Warehouse',
    dogHelp: 'Dog: tap it to calm it down.', doorHelp: 'Door: tap to open.'
  }
};
var LANG = 'ru';
function t(k) { return (STR[LANG] && STR[LANG][k]) || STR.ru[k] || k; }

/* ---------------- Константы ---------------- */
var NAP_CAP = Sim.NAP_CAP;   // максимум запаса сна кота
var AREA_TOP = 74, AREA_BOTTOM = 84; // свободная область поля между HUD
var PATH_COLORS = ['#c0773a','#3f86c0','#7a5ec0','#3f9e6a','#c05a8a','#a8941f','#d0562b','#5a6b78'];
var HINT_TIME = 3;    // секунд горит подсказка
var SKINS = {
  mouse: [
    { id: 'classic', name: 'Серая', en: 'Grey', price: 0, hue: 0 },
    { id: 'gold', name: 'Золотая', en: 'Golden', price: 25, hue: 35 },
    { id: 'ocean', name: 'Морская', en: 'Ocean', price: 40, hue: 185 },
    { id: 'violet', name: 'Фиалка', en: 'Violet', price: 60, hue: 265 }
  ],
  cat: [
    { id: 'classic', name: 'Рыжий', en: 'Ginger', price: 0, hue: 0 },
    { id: 'shadow', name: 'Теневой', en: 'Shadow', price: 35, hue: 215 },
    { id: 'rose', name: 'Розовый', en: 'Rose', price: 50, hue: 325 },
    { id: 'royal', name: 'Королевский', en: 'Royal', price: 80, hue: 45 }
  ]
};
function skinHue(kind) {
  var id = kind === 'mouse' ? Save.data.mouseSkin : Save.data.catSkin;
  var list = SKINS[kind];
  for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i].hue;
  return 0;
}
function chapterName(idx) { var c = getChapter(idx); return c.id === 'apartment' ? t('chapterApartment') : (c.id === 'basement' ? t('chapterBasement') : t('chapterWarehouse')); }

/* ---------------- Canvas ---------------- */
var canvas, ctx, W = 0, H = 0, dpr = 1;
var lastTs = 0;

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (window.G && G.level && G.screen === 'game') resetCam(false);
}

/* ---------------- Спрайты ---------------- */
var ASSET_FILES = {
  mouse_run_sheet: 'img/mouse_run_sheet.png',
  cat_sleep_sheet: 'img/cat_sleep_sheet.png',
  cat_awake: 'img/cat_awake.png',
  hole_closed: 'img/hole_closed.png',
  hole_open: 'img/hole_open.png',
  cheese: 'img/cheese.png',
  mousetrap: 'img/mousetrap.png',
  mousetrap_disarmed: 'img/mousetrap_disarmed.png',
  star: 'img/star.png'
};
var IMG = {};
var assetsReady = false;

function loadAssets(done) {
  var names = Object.keys(ASSET_FILES);
  var pending = names.length;
  var finished = false;
  function finish() {
    if (!finished) { finished = true; assetsReady = true; if (done) done(); }
  }
  var timeout = setTimeout(finish, 2500); // не зависаем на загрузке
  names.forEach(function(k) {
    var im = new Image();
    im.onload = function() { pending--; if (pending <= 0) { clearTimeout(timeout); finish(); } };
    im.onerror = function() { pending--; if (pending <= 0) { clearTimeout(timeout); finish(); } };
    im.src = ASSET_FILES[k];
    IMG[k] = im;
  });
}

/* Рисует кадр из спрайт-листа или программный фолбэк */
function drawSprite(name, frame, count, x, y, w, h, flip, hue) {
  var im = IMG[name];
  if (im && im.complete && im.naturalWidth) {
    var fw = im.naturalWidth / count;
    ctx.save();
    if (hue) ctx.filter = 'hue-rotate(' + hue + 'deg) saturate(1.35)';
    if (flip) {
      ctx.translate(x + w, y);
      ctx.scale(-1, 1);
      ctx.drawImage(im, frame * fw, 0, fw, im.naturalHeight, 0, 0, w, h);
    } else {
      ctx.drawImage(im, frame * fw, 0, fw, im.naturalHeight, x, y, w, h);
    }
    ctx.restore();
    return;
  }
  /* --- программный фолбэк --- */
  ctx.save();
  if (hue) ctx.filter = 'hue-rotate(' + hue + 'deg) saturate(1.35)';
  if (flip) { ctx.translate(x + w / 2, 0); ctx.scale(-1, 1); ctx.translate(-(x + w / 2), 0); }
  if (name === 'mouse_run_sheet') {
    ctx.fillStyle = '#9ea3ac'; ctx.strokeStyle = '#4b3621'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.ellipse(x + w * 0.5, y + h * 0.62, w * 0.3, h * 0.2, 0, 0, 7); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(x + w * 0.72, y + h * 0.42, w * 0.16, 0, 7); ctx.fill(); ctx.stroke();
  } else if (name === 'cat_sleep_sheet' || name === 'cat_awake') {
    ctx.fillStyle = '#f09636'; ctx.strokeStyle = '#5e3416'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.ellipse(x + w * 0.5, y + h * 0.6, w * 0.38, h * 0.28, 0, 0, 7); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(x + w * 0.34, y + h * 0.36, w * 0.18, 0, 7); ctx.fill(); ctx.stroke();
  } else if (name === 'hole_closed' || name === 'hole_open') {
    ctx.fillStyle = name === 'hole_open' ? '#241608' : '#8b5e38';
    ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, w * 0.4, 0, 7); ctx.fill();
    ctx.strokeStyle = '#a8633e'; ctx.lineWidth = 8; ctx.stroke();
  } else if (name === 'cheese') {
    ctx.fillStyle = '#facd50'; ctx.strokeStyle = '#4b3621'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(x + w * 0.1, y + h * 0.85); ctx.lineTo(x + w * 0.9, y + h * 0.85);
    ctx.lineTo(x + w * 0.9, y + h * 0.25); ctx.closePath(); ctx.fill(); ctx.stroke();
  } else if (name === 'mousetrap' || name === 'mousetrap_disarmed') {
    ctx.fillStyle = '#96663a'; ctx.strokeStyle = '#4b3621'; ctx.lineWidth = 5;
    ctx.fillRect(x + w * 0.15, y + h * 0.72, w * 0.7, h * 0.18); ctx.strokeRect(x + w * 0.15, y + h * 0.72, w * 0.7, h * 0.18);
    ctx.strokeStyle = '#787e86'; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.arc(x + w * 0.5, y + h * 0.72, w * 0.28, Math.PI, 0); ctx.stroke();
  } else if (name === 'star') {
    ctx.fillStyle = '#ffde6e'; ctx.strokeStyle = '#966c14'; ctx.lineWidth = 5;
    ctx.beginPath();
    for (var k = 0; k < 10; k++) {
      var a = -Math.PI / 2 + k * Math.PI / 5;
      var rad = k % 2 === 0 ? w * 0.42 : w * 0.18;
      var px = x + w / 2 + rad * Math.cos(a), py = y + h / 2 + rad * Math.sin(a);
      if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}

/* Звук и музыка — в js/audio.js (AudioSys) */
function trackForLevel(idx) { return idx < 200 ? 'easy' : (idx < 600 ? 'mid' : 'hard'); }

/* ---------------- Сохранение ---------------- */
var Save = {
  data: { unlocked: 0, stars: {}, sound: true, music: true, tut: {}, coins: 0,
    mouseSkin: 'classic', catSkin: 'classic', mouseOwned: { classic: 1 }, catOwned: { classic: 1 },
    coinLevels: {}, rewardLevels: {} },
  encode: function() {
    var d = this.data, n = Math.min(LEVEL_COUNT, d.unlocked + 1), stars = '', coinFlags = '', rewardFlags = '';
    for (var i = 0; i < n; i++) stars += (d.stars[i] || 0);
    /* Флаги монет/наград храним для всех уровней: монета может быть сохранена до победы. */
    for (var j = 0; j < LEVEL_COUNT; j++) { coinFlags += d.coinLevels[j] ? '1' : '0'; rewardFlags += d.rewardLevels[j] ? '1' : '0'; }
    return { v: 3, u: d.unlocked, s: stars, snd: d.sound ? 1 : 0, m: d.music ? 1 : 0,
      t: Object.keys(d.tut).join(','), c: d.coins | 0, ms: d.mouseSkin, cs: d.catSkin,
      mo: Object.keys(d.mouseOwned).join(','), ko: Object.keys(d.catOwned).join(','), cl: coinFlags, rw: rewardFlags };
  },
  load: function() {
    var self = this;
    return Ads.load().then(function(d) {
      if (d) {
        if (d.v === 3 || d.v === 2) {
          self.data.unlocked = Math.min(LEVEL_COUNT - 1, d.u | 0);
          self.data.stars = {};
          for (var i = 0; i < (d.s || '').length; i++) { var v = +d.s[i]; if (v > 0) self.data.stars[i] = v; }
          self.data.sound = !!d.snd; self.data.music = d.m === undefined ? true : !!d.m;
          self.data.tut = {}; (d.t || '').split(',').forEach(function(k) { if (k) self.data.tut[k] = 1; });
          if (d.v === 3) {
            self.data.coins = Math.max(0, d.c | 0); self.data.mouseSkin = d.ms || 'classic'; self.data.catSkin = d.cs || 'classic';
            self.data.mouseOwned = { classic: 1 }; self.data.catOwned = { classic: 1 };
            (d.mo || 'classic').split(',').forEach(function(k) { if (k) self.data.mouseOwned[k] = 1; });
            (d.ko || 'classic').split(',').forEach(function(k) { if (k) self.data.catOwned[k] = 1; });
            self.data.coinLevels = {}; self.data.rewardLevels = {};
            for (var j = 0; j < (d.cl || '').length; j++) if (d.cl[j] === '1') self.data.coinLevels[j] = 1;
            for (var r = 0; r < (d.rw || '').length; r++) if (d.rw[r] === '1') self.data.rewardLevels[r] = 1;
          }
        } else {
          if (typeof d.unlocked === 'number') self.data.unlocked = Math.min(LEVEL_COUNT - 1, d.unlocked);
          if (d.stars) self.data.stars = d.stars;
          if (typeof d.sound === 'boolean') self.data.sound = d.sound;
        }
      }
      if ((!d || d.t === undefined) && self.data.unlocked >= 6) ['basics', 'cats', 'multi', 'traps', 'cheese'].forEach(function(k) { self.data.tut[k] = 1; });
      AudioSys.muted = !self.data.sound; AudioSys.setMusic(self.data.music);
    });
  },
  save: function() { Ads.save(this.encode()); }
};

/* ---------------- Глобальное состояние ---------------- */
var G = {
  screen: 'loading',   // loading | menu | map | game | shop
  overlay: null,       // null | win | fail | pause
  paused: false,
  levelIdx: 0,
  mapPage: 0,
  holes: [], cats: [], traps: [], cheese: null,
  time: 0, winTime: 0, winStars: 0,
  shake: 0, failMsg: '',
  attemptFails: 0, failStreak: 0,
  hintCell: null, hintTimer: 0,
  cheeseAnim: 0,
  levelsCompleted: 0, lastInterstitial: 0,
  fade: 1, errMsg: null,
  cam: { cs: 40, ox: 0, oy: 0 }, speed: 2.2,
  tut: null, tf: { opened: 0, snoozed: 0, disarmed: 0 }, zoomRect: null, hintRect: null, shopTab: 'mouse'
};

function toggleMusic() { Save.data.music = !Save.data.music; AudioSys.setMusic(Save.data.music); Save.save(); }
function toggleSfx() { Save.data.sound = !Save.data.sound; AudioSys.muted = !Save.data.sound; Save.save(); }
function openMap(idx) { G.mapPage = Math.floor(Math.max(0, Math.min(idx, LEVEL_COUNT - 1)) / 20); setScreen('map'); }
function setScreen(s) { if (window.Ads && Ads.updateBackButton) Ads.updateBackButton(s !== 'menu'); G.screen = s; uiButtons = []; G.fade = 1; AudioSys.setTrack(s === 'game' ? trackForLevel(G.levelIdx) : 'menu'); }
function openShop(tab) { G.shopTab = tab || 'mouse'; setScreen('shop'); }
function buyOrEquipSkin(kind, skin) {
  var owned = kind === 'mouse' ? Save.data.mouseOwned : Save.data.catOwned;
  var key = kind === 'mouse' ? 'mouseSkin' : 'catSkin';
  if (owned[skin.id]) { Save.data[key] = skin.id; Save.save(); return; }
  if (Save.data.coins < skin.price) return;
  Save.data.coins -= skin.price; owned[skin.id] = 1; Save.data[key] = skin.id; Save.save();
}

function trapAt(x, y) { return Sim.trapAt(G, x, y); }
function catAt(x, y) { return Sim.catAt(G, x, y); }

/* ---------------- Камера (зум/сдвиг для больших полей) ---------------- */
function areaH() { return H - AREA_TOP - AREA_BOTTOM; }
function fitCs() {
  var L = G.level;
  return Math.max(6, Math.floor(Math.min((W - 24) / L.cols, areaH() / L.rows)));
}
function maxCs() { return Math.max(fitCs(), 64); }
function clampCam() {
  var c = G.cam, L = G.level; if (!L) return;
  var bw = c.cs * L.cols, bh = c.cs * L.rows, m = 12;
  if (bw + 2 * m <= W) c.ox = Math.floor((W - bw) / 2);
  else c.ox = Math.min(m, Math.max(W - bw - m, c.ox));
  var ah = areaH();
  if (bh <= ah) c.oy = Math.floor(AREA_TOP + (ah - bh) / 2);
  else c.oy = Math.min(AREA_TOP + m, Math.max(AREA_TOP + ah - bh - m, c.oy));
}
function resetCam(startZoomed) {
  var f = fitCs();
  G.cam.cs = Math.min(maxCs(), Math.max(f, 30));   // не мельче 30 px: клетки должны быть тапабельными
  G.cam.ox = 0; G.cam.oy = 0;
  clampCam();
}
function zoomAt(px, py, factor) {
  var c = G.cam, ncs = Math.max(fitCs(), Math.min(maxCs(), c.cs * factor));
  if (ncs === c.cs) return;
  var u = (px - c.ox) / c.cs, v = (py - c.oy) / c.cs;
  c.cs = ncs; c.ox = px - u * ncs; c.oy = py - v * ncs;
  clampCam();
}
function toggleFit() {
  var f = fitCs(), cx = W / 2, cy = AREA_TOP + areaH() / 2;
  if (G.cam.cs > f * 1.08) zoomAt(cx, cy, f / G.cam.cs);
  else zoomAt(cx, cy, Math.min(maxCs(), Math.max(34, f)) / G.cam.cs);
}
function focusCell(x, y) {
  var c = G.cam;
  c.ox = W / 2 - (x + 0.5) * c.cs;
  c.oy = AREA_TOP + areaH() / 2 - (y + 0.5) * c.cs;
  clampCam();
}
function boardFits() {
  var L = G.level;
  return G.cam.cs * L.cols <= W + 1 && G.cam.cs * L.rows <= areaH() + 1;
}

/* ---------------- Уровень ---------------- */
function startLevel(idx, keepStats) {
  var L = getLevel(idx);
  G.levelIdx = idx;
  Sim.init(G, L);
  if (Save.data.coinLevels[idx]) G.coins.forEach(function(c) { c.taken = true; });
  G.cheeseAnim = 0;
  G.overlay = null; G.paused = false;
  G.shake = 0; G.hintCell = null; G.hintTimer = 0;
  if (!keepStats) { G.attemptFails = 0; G.failStreak = 0; }
  Pt = {};
  resetCam(true);
  AudioSys.duck(1);
  setScreen('game');
  initTutorial(idx);
}

function catOnScreen(c) {
  var g = G.cam, cs = g.cs, px = g.ox + c.x * cs, py = g.oy + c.y * cs;
  return px > -cs && px < W && py > AREA_TOP - cs && py < H - AREA_BOTTOM;
}

function fail(reason) {
  G.overlay = 'fail';
  G.failMsg = t(reason === 'trap' ? 'failTrap' : (reason === 'dog' ? 'failDog' : (reason === 'door' ? 'failDoor' : 'failCat')));
  G.attemptFails++;
  G.failStreak++;
  G.shake = 1;
  AudioSys.fail(reason);
  AudioSys.duck(0.35);
  Save.save();
}

function win() {
  var stars = 1;
  if (G.attemptFails === 0) stars = 2;
  if (G.cheese && G.cheese.taken) stars = 3;
  var prev = Save.data.stars[G.levelIdx] || 0;
  Save.data.stars[G.levelIdx] = Math.max(prev, stars);
  Save.data.unlocked = Math.min(LEVEL_COUNT - 1, Math.max(Save.data.unlocked, G.levelIdx + 1));
  if (!Save.data.rewardLevels[G.levelIdx]) { Save.data.coins += 5; Save.data.rewardLevels[G.levelIdx] = 1; }
  G.failStreak = 0;
  if (G.tut) { Save.data.tut[G.tut.id] = 1; G.tut = null; }
  Save.save();
  G.overlay = 'win';
  G.winTime = 0;
  G.winStars = stars;
  AudioSys.win();
  AudioSys.duck(0.35);
}

/* ---------------- Обновление ---------------- */
function update(dt) {
  if (G.fade > 0) G.fade = Math.max(0, G.fade - dt * 2.5);
  if (G.shake > 0) G.shake = Math.max(0, G.shake - dt * 2);
  if (G.hintTimer > 0) G.hintTimer -= dt;
  if (G.cheeseAnim > 0) G.cheeseAnim += dt;

  if (G.screen !== 'game') return;
  if (G.overlay === 'win') { G.winTime += dt; return; }
  if (G.overlay || G.paused) return;
  if (G.tut) tutUpdate();
  if (tutBlocking()) return;

  var ev = Sim.update(G, dt);
  for (var e = 0; e < ev.length; e++) {
    var x = ev[e];
    if (x.t === 'exit') AudioSys.exitMouse();
    else if (x.t === 'cheese') { G.cheeseAnim = 0.001; AudioSys.crunch(); }
    else if (x.t === 'coin') { if (!Save.data.coinLevels[G.levelIdx]) { Save.data.coinLevels[G.levelIdx] = 1; Save.data.coins += 1; Save.save(); } AudioSys.crunch(); }
    else if (x.t === 'catwake' || x.t === 'catsleep') {
      /* коты подают голос только на экране и не чаще раза в 0.2 с */
      if (catOnScreen(x.c) && AudioSys.catGate()) {
        if (x.t === 'catwake') AudioSys.catWake(1); else AudioSys.catSleep(1);
      }
    }
    else if (x.t === 'fail') { fail(x.reason); return; }
    else if (x.t === 'win') win();
  }
}

/* ---------------- Подсказка ---------------- */
function computeHint() {
  var i, j, hole, cell;
  for (i = 0; i < G.holes.length; i++) {
    hole = G.holes[i];
    if (hole.done) continue;
    var from = hole.opened ? hole.mouse.i + 1 : 1;
    for (j = from; j < hole.path.length; j++) {
      cell = hole.path[j];
      var tr = trapAt(cell[0], cell[1]);
      if (tr && tr.armed) return { x: cell[0], y: cell[1] };
      var dr = Sim.itemAt(G.doors, cell[0], cell[1]);
      if (dr && !dr.open) return { x: cell[0], y: cell[1] };
      var dg = Sim.itemAt(G.dogs, cell[0], cell[1]);
      if (dg && !dg.calm) return { x: cell[0], y: cell[1] };
    }
  }
  for (i = 0; i < G.holes.length; i++) {
    hole = G.holes[i];
    if (hole.done) continue;
    var from2 = hole.opened ? hole.mouse.i + 1 : 1;
    for (j = from2; j < hole.path.length; j++) {
      cell = hole.path[j];
      var ca = catAt(cell[0], cell[1]);
      if (ca && ca.state === 'asleep') return { x: cell[0], y: cell[1] };
    }
  }
  for (i = 0; i < G.holes.length; i++) {
    hole = G.holes[i];
    if (hole.done || hole.opened) continue;
    var danger = false;
    for (j = 1; j < hole.path.length; j++) {
      cell = hole.path[j];
      var ca2 = catAt(cell[0], cell[1]);
      if (ca2 && ca2.state === 'awake') { danger = true; break; }
    }
    if (!danger) return { x: hole.x, y: hole.y };
  }
  return null;
}

/* ---------------- Тапы ---------------- */
var uiButtons = [];

function addButton(x, y, w, h, label, cb, color) {
  uiButtons.push({ x: x, y: y, w: w, h: h, label: label, cb: cb, color: color || '#7bb661' });
}

/* Активные касания: id -> {sx,sy,x,y,moved,handled} */
var Pt = {};
var pinch = null;

function canvasXY(e) {
  var r = canvas.getBoundingClientRect();
  return { x: (e.clientX - r.left) * (W / r.width), y: (e.clientY - r.top) * (H / r.height) };
}
function hitButton(x, y) {
  var blocking = tutBlocking();
  for (var i = uiButtons.length - 1; i >= 0; i--) {
    var b = uiButtons[i];
    if (blocking && !b.tut) continue;
    if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return b;
  }
  return null;
}
function boardActive() { return G.screen === 'game' && !G.overlay && !G.paused && !tutBlocking(); }

function onDown(e) {
  if (window.Ads && Ads.haptic) Ads.haptic('light');
  if (e.preventDefault) e.preventDefault();
  if (!AudioSys.ctx) AudioSys.init();
  AudioSys.resume();
  var p = canvasXY(e);
  var b = hitButton(p.x, p.y);
  if (b) { AudioSys.tap(); b.cb(); return; }
  if (!boardActive()) return;

  var id = e.pointerId === undefined ? 'm' : e.pointerId;
  Pt[id] = { sx: p.x, sy: p.y, x: p.x, y: p.y, moved: false, handled: false };
  try { if (canvas.setPointerCapture && e.pointerId !== undefined) canvas.setPointerCapture(e.pointerId); } catch (err) {}
  var ids = Object.keys(Pt);
  if (ids.length >= 2) {            // щипок: отменяем одиночные тапы
    ids.forEach(function(k) { Pt[k].moved = true; });
    var a = Pt[ids[0]], c = Pt[ids[1]];
    pinch = { d: Math.hypot(a.x - c.x, a.y - c.y) || 1 };
  } else if (boardFits()) {         // поле целиком на экране — реагируем сразу, как раньше
    Pt[id].handled = true;
    gameTap(p.x, p.y);
  }
}

function onMove(e) {
  var id = e.pointerId === undefined ? 'm' : e.pointerId;
  var pt = Pt[id];
  if (!pt || !boardActive()) return;
  var p = canvasXY(e);
  var ids = Object.keys(Pt);
  if (ids.length >= 2 && pinch) {
    pt.x = p.x; pt.y = p.y;
    var a = Pt[ids[0]], c = Pt[ids[1]];
    var d = Math.hypot(a.x - c.x, a.y - c.y) || 1;
    zoomAt((a.x + c.x) / 2, (a.y + c.y) / 2, d / pinch.d);
    pinch.d = d;
    return;
  }
  if (!pt.moved && Math.hypot(p.x - pt.sx, p.y - pt.sy) > 10) pt.moved = true;
  if (pt.moved && !pt.handled) {
    G.cam.ox += p.x - pt.x; G.cam.oy += p.y - pt.y;
    clampCam();
  }
  pt.x = p.x; pt.y = p.y;
}

function onUp(e) {
  var id = e.pointerId === undefined ? 'm' : e.pointerId;
  var pt = Pt[id];
  if (!pt) return;
  delete Pt[id];
  if (Object.keys(Pt).length < 2) pinch = null;
  if (e.type !== 'pointercancel' && !pt.moved && !pt.handled && boardActive()) gameTap(pt.sx, pt.sy);
}

function gameTap(px, py) {
  var geo = boardGeometry();
  if (!geo) return;
  var cx = Math.floor((px - geo.bx) / geo.cs);
  var cy = Math.floor((py - geo.by) / geo.cs);
  if (cx < 0 || cy < 0 || cx >= G.level.cols || cy >= G.level.rows) return;
  G.hintCell = null; G.hintTimer = 0;
  var r = Sim.tap(G, cx, cy);
  if (r === 'trap') { AudioSys.trap(); G.tf.disarmed++; }
  else if (r === 'door' || r === 'dog') { AudioSys.tap(); }
  else if (r === 'snooze') { AudioSys.purr(); G.tf.snoozed++; }
  else if (r === 'open') { AudioSys.open(); G.tf.opened++; }
  else if (r === 'catfail') fail('cat');
}

/* ---------------- Геометрия поля ---------------- */
function boardGeometry() {
  if (!G.level) return null;
  clampCam();
  return { cs: G.cam.cs, bx: Math.round(G.cam.ox), by: Math.round(G.cam.oy) };
}

/* ---------------- Отрисовка утилит ---------------- */
function rrPath(x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(str, x, y, size, fill, align, noStroke) {
  ctx.font = 'bold ' + size + 'px "Segoe UI", system-ui, sans-serif';
  ctx.textAlign = align || 'center';
  ctx.textBaseline = 'middle';
  if (!noStroke) {
    ctx.lineWidth = Math.max(3, size / 8);
    ctx.strokeStyle = '#4b3621';
    ctx.lineJoin = 'round';
    ctx.strokeText(str, x, y);
  }
  ctx.fillStyle = fill || '#4b3621';
  ctx.fillText(str, x, y);
}

function drawButtonRect(b) {
  rrPath(b.x, b.y + 5, b.w, b.h, 16);
  ctx.fillStyle = 'rgba(60,40,20,0.25)';
  ctx.fill();
  rrPath(b.x, b.y, b.w, b.h, 16);
  ctx.fillStyle = b.color;
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#4b3621';
  ctx.stroke();
  rrPath(b.x + 6, b.y + 5, b.w - 12, b.h * 0.32, 10);
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ctx.fill();
  text(b.label, b.x + b.w / 2, b.y + b.h / 2, Math.min(26, b.h * 0.42), '#ffffff');
}

function iconButton(x, y, size, kind, cb) {
  addButton(x, y, size, size, '', cb, '#e8d5b5');
  var b = uiButtons[uiButtons.length - 1];
  b.icon = kind;
}

function drawIcon(b) {
  var cx = b.x + b.w / 2, cy = b.y + b.h / 2, r = b.w * 0.22;
  ctx.strokeStyle = '#4b3621'; ctx.fillStyle = '#4b3621'; ctx.lineWidth = 3.5;
  if (b.icon === 'pause') {
    ctx.fillRect(cx - r * 0.7, cy - r, r * 0.5, r * 2);
    ctx.fillRect(cx + r * 0.2, cy - r, r * 0.5, r * 2);
  } else if (b.icon === 'sound_on') {
    ctx.beginPath(); ctx.moveTo(cx - r, cy - r * 0.5); ctx.lineTo(cx - r * 0.2, cy - r * 0.5);
    ctx.lineTo(cx + r * 0.3, cy - r); ctx.lineTo(cx + r * 0.3, cy + r);
    ctx.lineTo(cx - r * 0.2, cy + r * 0.5); ctx.lineTo(cx - r, cy + r * 0.5);
    ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + r * 0.5, cy, r * 0.6, -0.9, 0.9); ctx.stroke();
  } else if (b.icon === 'sound_off') {
    ctx.beginPath(); ctx.moveTo(cx - r, cy - r * 0.5); ctx.lineTo(cx - r * 0.2, cy - r * 0.5);
    ctx.lineTo(cx + r * 0.3, cy - r); ctx.lineTo(cx + r * 0.3, cy + r);
    ctx.lineTo(cx - r * 0.2, cy + r * 0.5); ctx.lineTo(cx - r, cy + r * 0.5);
    ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx + r * 0.5, cy - r * 0.6); ctx.lineTo(cx + r * 1.2, cy + r * 0.6);
    ctx.moveTo(cx + r * 1.2, cy - r * 0.6); ctx.lineTo(cx + r * 0.5, cy + r * 0.6); ctx.stroke();
  } else if (b.icon === 'music_on' || b.icon === 'music_off') {
    ctx.beginPath(); ctx.ellipse(cx - r * 0.35, cy + r * 0.7, r * 0.5, r * 0.38, -0.4, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx + r * 0.1, cy + r * 0.55); ctx.lineTo(cx + r * 0.1, cy - r * 0.9);
    ctx.quadraticCurveTo(cx + r * 0.9, cy - r * 0.6, cx + r * 0.7, cy + r * 0.1); ctx.lineCap = 'round'; ctx.stroke();
    if (b.icon === 'music_off') {
      ctx.strokeStyle = '#c0492b'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(cx - r * 1.1, cy + r * 1.1); ctx.lineTo(cx + r * 1.1, cy - r * 1.1); ctx.stroke();
    }
  } else if (b.icon === 'plus' || b.icon === 'minus') {
    ctx.beginPath(); ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy);
    if (b.icon === 'plus') { ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r); }
    ctx.lineCap = 'round'; ctx.stroke();
  } else if (b.icon === 'fit') {
    var q = r * 0.9, k = r * 0.6;
    ctx.lineCap = 'round'; ctx.beginPath();
    ctx.moveTo(cx - q, cy - q + k); ctx.lineTo(cx - q, cy - q); ctx.lineTo(cx - q + k, cy - q);
    ctx.moveTo(cx + q - k, cy - q); ctx.lineTo(cx + q, cy - q); ctx.lineTo(cx + q, cy - q + k);
    ctx.moveTo(cx + q, cy + q - k); ctx.lineTo(cx + q, cy + q); ctx.lineTo(cx + q - k, cy + q);
    ctx.moveTo(cx - q + k, cy + q); ctx.lineTo(cx - q, cy + q); ctx.lineTo(cx - q, cy + q - k);
    ctx.stroke();
  } else if (b.icon === 'bulb') {
    ctx.beginPath(); ctx.arc(cx, cy - r * 0.15, r * 0.7, 0, 7); ctx.stroke();
    ctx.fillRect(cx - r * 0.25, cy + r * 0.45, r * 0.5, r * 0.4);
    ctx.fillRect(cx - r * 0.18, cy + r * 0.95, r * 0.36, r * 0.15);
  }
}

/* ---------------- Фон стены (меню) ---------------- */
function drawWall(theme) {
  var g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, theme ? theme.wall : '#f7e7c8');
  g.addColorStop(1, theme ? theme.floorA : '#eed5a8');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = theme ? theme.accent + '22' : 'rgba(214,178,120,0.25)';
  var step = 46;
  for (var x = ((G.time * 0) + step); x < W; x += step) ctx.fillRect(x, 0, 10, H);
  /* плинтус */
  var bh = Math.max(34, H * 0.07);
  ctx.fillStyle = theme ? theme.accent : '#a8815a';
  ctx.fillRect(0, H - bh, W, bh);
  ctx.fillStyle = theme ? '#51483b' : '#8a6342';
  ctx.fillRect(0, H - bh, W, 6);
}

/* ============================================================
   ЭКРАНЫ
   ============================================================ */
function drawLoading() {
  drawWall();
  text(t('title'), W / 2, H * 0.18, Math.min(54, W / 12), '#4b3621');
  drawSprite('cat_sleep_sheet', Math.floor(G.time * 2.5) % 4, 4, W / 2 - 90, H * 0.32, 180, 180);
  text(t('loading'), W / 2, H * 0.75, 24, '#8a6342');
  if (G.fade > 0) { ctx.fillStyle = 'rgba(0,0,0,' + G.fade + ')'; ctx.fillRect(0, 0, W, H); }
}

function drawMenu() {
  drawWall();
  /* нора в плинтусе */
  ctx.fillStyle = '#3c2718';
  ctx.beginPath(); ctx.ellipse(W * 0.82, H - Math.max(34, H * 0.07) * 0.55, 34, 22, 0, Math.PI, 0); ctx.fill();
  /* кот */
  var cs = Math.min(W, H) * 0.42;
  drawSprite('cat_sleep_sheet', Math.floor(G.time * 2.5) % 4, 4, W * 0.5 - cs / 2, H * 0.34, cs, cs);
  /* заголовок */
  text(t('title'), W / 2, H * 0.14, Math.min(56, W / 11), '#4b3621');
  /* кнопка играть */
  var bw = Math.min(280, W * 0.6), bh = 66, menuY = H * 0.55;
  addButton(W / 2 - bw / 2, menuY, bw, bh, t('play'), function() { openMap(Save.data.unlocked); }, '#7bb661');
  drawButtonRect(uiButtons[uiButtons.length - 1]);
  addButton(W / 2 - bw / 2, menuY + bh + 10, bw, 52, t('shop') + ' · ' + t('coins') + ': ' + Save.data.coins, function() { openShop('mouse'); }, '#e8b25a');
  drawButtonRect(uiButtons[uiButtons.length - 1]);
  addButton(W / 2 - bw / 2, menuY + bh + 72, bw, 48, t('tutorial'), function() {
    Save.data.tut = {}; Save.save(); startLevel(0, false);
  }, '#e8933c');
  drawButtonRect(uiButtons[uiButtons.length - 1]);
  /* звук */
  var s = 52;
  iconButton(W - s - 14, 14, s, Save.data.sound ? 'sound_on' : 'sound_off', function() {
    Save.data.sound = !Save.data.sound;
    AudioSys.muted = !Save.data.sound;
    Save.save();
  });
  drawIcon(uiButtons[uiButtons.length - 1]);
  iconButton(W - 2 * s - 22, 14, s, Save.data.music ? 'music_on' : 'music_off', toggleMusic);
  drawIcon(uiButtons[uiButtons.length - 1]);
  if (G.fade > 0) { ctx.fillStyle = 'rgba(0,0,0,' + G.fade + ')'; ctx.fillRect(0, 0, W, H); }
}

function drawMap() {
  var mapTheme = getChapter(Math.min(LEVEL_COUNT - 1, G.mapPage * 20));
  drawWall(mapTheme);
  text(t('map') + ' · ' + chapterName(Math.min(LEVEL_COUNT - 1, G.mapPage * 20)), W / 2, 44, Math.min(32, W / 13), '#4b3621');
  var s = 52;
  iconButton(14, 14, s, 'menu_arrow', function() { setScreen('menu'); });
  drawIconMenu(uiButtons[uiButtons.length - 1]);

  var perPage = 20, cols = 5, rows = 4;
  var gx = 20, gy = 86;
  var bw = Math.min((W - gx * 2 - 60) / cols, 110);
  var bh = Math.min(bw * 1.1, (H - gy - 90) / rows);
  bw = Math.min(bw, bh / 1.1);
  var totalPages = Math.ceil(LEVEL_COUNT / perPage);
  if (G.mapPage >= totalPages) G.mapPage = totalPages - 1;

  var startX = (W - (cols * (bw + 10) - 10)) / 2;
  for (var i = 0; i < perPage; i++) {
    var idx = G.mapPage * perPage + i;
    if (idx >= LEVEL_COUNT) break;
    var col = i % cols, row = Math.floor(i / cols);
    var x = startX + col * (bw + 10);
    var y = gy + row * (bh + 10);
    var unlocked = idx <= Save.data.unlocked;
    addButton(x, y, bw, bh, '', (function(lvl, ok) {
      return function() { if (ok) startLevel(lvl, false); };
    })(idx, unlocked), unlocked ? '#e8b25a' : '#cbb894');
    var b = uiButtons[uiButtons.length - 1];
    rrPath(b.x, b.y + 4, b.w, b.h, 12);
    ctx.fillStyle = 'rgba(60,40,20,0.25)'; ctx.fill();
    rrPath(b.x, b.y, b.w, b.h, 12);
    ctx.fillStyle = unlocked ? '#e8b25a' : '#cbb894'; ctx.fill();
    ctx.lineWidth = 3.5; ctx.strokeStyle = '#4b3621'; ctx.stroke();
    if (unlocked) {
      text(String(idx + 1), b.x + b.w / 2, b.y + b.h * 0.4, Math.min(30, b.h * 0.4) * (idx >= 99 ? (idx >= 999 ? 0.62 : 0.78) : 1), '#4b3621');
      var st = Save.data.stars[idx] || 0;
      for (var k = 0; k < 3; k++) {
        ctx.beginPath();
        ctx.arc(b.x + b.w / 2 + (k - 1) * b.w * 0.2, b.y + b.h * 0.72, Math.max(4, b.w * 0.06), 0, 7);
        ctx.fillStyle = k < st ? '#ffde6e' : 'rgba(255,255,255,0.45)';
        ctx.fill();
        ctx.lineWidth = 2; ctx.strokeStyle = '#4b3621'; ctx.stroke();
      }
    } else {
      /* замок */
      var lx = b.x + b.w / 2, ly = b.y + b.h / 2;
      ctx.fillStyle = '#8a6f52';
      rrPath(lx - 11, ly - 2, 22, 18, 4); ctx.fill();
      ctx.lineWidth = 4; ctx.strokeStyle = '#8a6f52';
      ctx.beginPath(); ctx.arc(lx, ly - 4, 7, Math.PI, 0); ctx.stroke();
      text(t('locked'), b.x + b.w / 2, b.y + b.h * 0.85, 10, '#7a6448', 'center', true);
    }
  }
  /* стрелки страниц */
  if (totalPages > 1) {
    var ay = gy + (bh * rows + 10 * (rows - 1)) / 2 - 20;
    if (G.mapPage > 0) {
      addButton(6, ay, 46, 46, '', function() { G.mapPage--; }, '#e8d5b5');
      drawArrow(uiButtons[uiButtons.length - 1], true);
    }
    if (G.mapPage < totalPages - 1) {
      addButton(W - 52, ay, 46, 46, '', function() { G.mapPage++; }, '#e8d5b5');
      drawArrow(uiButtons[uiButtons.length - 1], false);
    }
    text((G.mapPage + 1) + ' / ' + totalPages, W / 2, H - 78, 18, '#8a6342', 'center', true);
    /* быстрые переходы: −10 страниц / к текущему / +10 страниц */
    var jw = Math.min(110, (W - 60) / 3), jy = H - 56, jh = 44, jg = 8;
    var jx = (W - (jw * 3 + jg * 2)) / 2;
    addButton(jx, jy, jw, jh, '−10', function() { G.mapPage = Math.max(0, G.mapPage - 10); }, '#e8b25a');
    drawButtonRect(uiButtons[uiButtons.length - 1]);
    addButton(jx + jw + jg, jy, jw, jh, t('current'), function() { G.mapPage = Math.floor(Math.min(Save.data.unlocked, LEVEL_COUNT - 1) / perPage); }, '#7bb661');
    drawButtonRect(uiButtons[uiButtons.length - 1]);
    addButton(jx + 2 * (jw + jg), jy, jw, jh, '+10', function() { G.mapPage = Math.min(totalPages - 1, G.mapPage + 10); }, '#e8b25a');
    drawButtonRect(uiButtons[uiButtons.length - 1]);
  }
  if (G.fade > 0) { ctx.fillStyle = 'rgba(0,0,0,' + G.fade + ')'; ctx.fillRect(0, 0, W, H); }
}

function drawShop() {
  drawWall();
  text(t('shop'), W / 2, 42, 34, '#4b3621');
  text('🪙 ' + Save.data.coins, W / 2, 78, 22, '#a56a16', 'center', true);
  iconButton(14, 14, 52, 'menu_arrow', function() { setScreen('menu'); });
  drawIconMenu(uiButtons[uiButtons.length - 1]);
  var tabY = 108, tabW = Math.min(160, (W - 42) / 2), tabH = 48;
  addButton(W / 2 - tabW - 4, tabY, tabW, tabH, t('mouseSkins'), function() { G.shopTab = 'mouse'; }, G.shopTab === 'mouse' ? '#7bb661' : '#cbb894');
  drawButtonRect(uiButtons[uiButtons.length - 1]);
  addButton(W / 2 + 4, tabY, tabW, tabH, t('catSkins'), function() { G.shopTab = 'cat'; }, G.shopTab === 'cat' ? '#7bb661' : '#cbb894');
  drawButtonRect(uiButtons[uiButtons.length - 1]);
  var kind = G.shopTab, list = SKINS[kind], owned = kind === 'mouse' ? Save.data.mouseOwned : Save.data.catOwned;
  var equipped = kind === 'mouse' ? Save.data.mouseSkin : Save.data.catSkin;
  var cardW = Math.min(158, (W - 42) / 2), cardH = Math.min(190, (H - 230) / 2);
  var gap = 12, totalW = cardW * 2 + gap, startX = (W - totalW) / 2, startY = 176;
  list.forEach(function(skin, i) {
    var x = startX + (i % 2) * (cardW + gap), y = startY + Math.floor(i / 2) * (cardH + 10);
    rrPath(x, y, cardW, cardH, 16); ctx.fillStyle = '#f9efdd'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#8a6342'; ctx.stroke();
    var isOwned = !!owned[skin.id], isEquipped = equipped === skin.id;
    if (kind === 'mouse') drawSprite('mouse_run_sheet', 2, 6, x + cardW * .24, y + 8, cardW * .52, cardW * .52, false, skin.hue);
    else drawSprite('cat_sleep_sheet', 1, 4, x + cardW * .24, y + 4, cardW * .52, cardW * .52, false, skin.hue);
    text(LANG === 'en' ? skin.en : skin.name, x + cardW / 2, y + cardW * .62, 17, '#4b3621', 'center', true);
    var label = isEquipped ? t('equipped') : (isOwned ? t('equip') : t('buy') + ' · ' + skin.price);
    addButton(x + 9, y + cardH - 48, cardW - 18, 40, label, function() { buyOrEquipSkin(kind, skin); }, isEquipped ? '#7bb661' : (isOwned || Save.data.coins >= skin.price ? '#e8b25a' : '#cbb894'));
    drawButtonRect(uiButtons[uiButtons.length - 1]);
  });
  text(kind === 'mouse' ? t('mouseSkins') : t('catSkins'), W / 2, H - 28, 13, '#8a6342', 'center', true);
  if (G.fade > 0) { ctx.fillStyle = 'rgba(0,0,0,' + G.fade + ')'; ctx.fillRect(0, 0, W, H); }
}

function drawIconMenu(b) {
  var cx = b.x + b.w / 2, cy = b.y + b.h / 2;
  ctx.strokeStyle = '#4b3621'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx + 8, cy - 10); ctx.lineTo(cx - 8, cy); ctx.lineTo(cx + 8, cy + 10);
  ctx.stroke();
}

function drawArrow(b, left) {
  var cx = b.x + b.w / 2, cy = b.y + b.h / 2;
  ctx.strokeStyle = '#4b3621'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath();
  if (left) { ctx.moveTo(cx + 8, cy - 12); ctx.lineTo(cx - 8, cy); ctx.lineTo(cx + 8, cy + 12); }
  else { ctx.moveTo(cx - 8, cy - 12); ctx.lineTo(cx + 8, cy); ctx.lineTo(cx - 8, cy + 12); }
  ctx.stroke();
}

/* ---------------- Игровой экран ---------------- */
function drawGame() {
  var geo = boardGeometry();
  var sx = 0, sy = 0;
  if (G.shake > 0) {
    sx = (Math.random() - 0.5) * 14 * G.shake;
    sy = (Math.random() - 0.5) * 14 * G.shake;
  }
  var cols = G.level.cols, rows = G.level.rows, cs = geo.cs;
  var ah = areaH(), theme = getChapter(G.levelIdx);

  ctx.save();
  ctx.translate(sx, sy);
  /* поле не рисуем под HUD */
  ctx.beginPath(); ctx.rect(0, AREA_TOP - 4, W, ah + 8); ctx.clip();

  /* видимый диапазон клеток */
  var x0 = Math.max(0, Math.floor((0 - geo.bx) / cs) - 1), x1 = Math.min(cols - 1, Math.ceil((W - geo.bx) / cs) + 1);
  var y0 = Math.max(0, Math.floor((AREA_TOP - geo.by) / cs) - 2), y1 = Math.min(rows - 1, Math.ceil((AREA_TOP + ah - geo.by) / cs) + 1);
  function vis(x, y) { return x >= x0 - 1 && x <= x1 + 1 && y >= y0 - 1 && y <= y1 + 2; }

  /* пол */
  for (var yy = y0; yy <= y1; yy++) {
    for (var xx = x0; xx <= x1; xx++) {
      ctx.fillStyle = (xx + yy) % 2 === 0 ? theme.floorA : theme.floorB;
      ctx.fillRect(geo.bx + xx * cs, geo.by + yy * cs, cs, cs);
    }
  }
  /* Ненавязчивые детали окружения для каждой главы. */
  ctx.save();
  if (theme.id === 'apartment') {
    ctx.strokeStyle = 'rgba(151,105,62,0.12)'; ctx.lineWidth = Math.max(1, cs * .018);
    for (var ax = x0; ax <= x1; ax += 3) { ctx.beginPath(); ctx.moveTo(geo.bx + ax * cs + cs * .18, geo.by + y0 * cs); ctx.lineTo(geo.bx + ax * cs + cs * .18, geo.by + (y1 + 1) * cs); ctx.stroke(); }
  } else if (theme.id === 'basement') {
    ctx.strokeStyle = 'rgba(55,65,65,0.12)'; ctx.lineWidth = Math.max(1, cs * .025);
    for (var byy = y0; byy <= y1; byy++) for (var bxx = x0; bxx <= x1; bxx++) if ((bxx * 13 + byy * 7) % 19 === 0) {
      var bx0 = geo.bx + bxx * cs, by0 = geo.by + byy * cs;
      ctx.beginPath(); ctx.moveTo(bx0 + cs * .25, by0 + cs * .28); ctx.lineTo(bx0 + cs * .48, by0 + cs * .43); ctx.lineTo(bx0 + cs * .38, by0 + cs * .66); ctx.stroke();
    }
  } else {
    ctx.strokeStyle = 'rgba(105,75,42,0.13)'; ctx.lineWidth = Math.max(1, cs * .035);
    for (var wy = y0; wy <= y1; wy++) for (var wx = x0; wx <= x1; wx++) if ((wx * 11 + wy * 17) % 23 === 0) {
      var wx0 = geo.bx + wx * cs, wy0 = geo.by + wy * cs;
      ctx.strokeRect(wx0 + cs * .2, wy0 + cs * .2, cs * .6, cs * .6);
      ctx.beginPath(); ctx.moveTo(wx0 + cs * .2, wy0 + cs * .4); ctx.lineTo(wx0 + cs * .8, wy0 + cs * .4); ctx.stroke();
    }
  }
  ctx.restore();
  ctx.strokeStyle = 'rgba(160,120,70,0.18)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (var i = x0; i <= x1 + 1; i++) { ctx.moveTo(geo.bx + i * cs, geo.by + y0 * cs); ctx.lineTo(geo.bx + i * cs, geo.by + (y1 + 1) * cs); }
  for (var j = y0; j <= y1 + 1; j++) { ctx.moveTo(geo.bx + x0 * cs, geo.by + j * cs); ctx.lineTo(geo.bx + (x1 + 1) * cs, geo.by + j * cs); }
  ctx.stroke();

  /* маршруты мышей (пунктир своего цвета у каждой норы) */
  G.holes.forEach(function(h, hi) {
    if (h.done) return;
    ctx.save();
    ctx.strokeStyle = PATH_COLORS[hi % PATH_COLORS.length];
    ctx.globalAlpha = h.opened ? 0.28 : 0.6;
    ctx.lineWidth = Math.max(2, cs * 0.13);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.setLineDash([cs * 0.2, cs * 0.22]);
    ctx.beginPath();
    for (var k = 0; k < h.path.length; k++) {
      var px = geo.bx + h.path[k][0] * cs + cs / 2, py = geo.by + h.path[k][1] * cs + cs / 2;
      if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.restore();
  });

  /* выходы (коврики со стрелкой) */
  G.holes.forEach(function(h, hi) {
    var last = h.path[h.path.length - 1];
    if (!vis(last[0], last[1])) return;
    var prev = h.path[h.path.length - 2] || last;
    var ex = geo.bx + last[0] * cs, ey = geo.by + last[1] * cs;
    rrPath(ex + 4, ey + 4, cs - 8, cs - 8, 8);
    ctx.fillStyle = '#d9b98a'; ctx.fill();
    ctx.strokeStyle = PATH_COLORS[hi % PATH_COLORS.length]; ctx.lineWidth = Math.max(2, cs * 0.08); ctx.stroke();
    var dx = last[0] - prev[0], dy = last[1] - prev[1];
    var mx = ex + cs / 2, my = ey + cs / 2, u = cs / 6;
    ctx.strokeStyle = '#7a5a34'; ctx.lineWidth = Math.max(2, cs * 0.08); ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(mx - dx * u * 1.6, my - dy * u * 1.6);
    ctx.lineTo(mx + dx * u * 1.4, my + dy * u * 1.4);
    // наконечник стрелки
    var tipx = mx + dx * u * 1.4, tipy = my + dy * u * 1.4;
    ctx.moveTo(tipx - dx * u - dy * u, tipy - dy * u - dx * u);
    ctx.lineTo(tipx, tipy);
    ctx.lineTo(tipx - dx * u + dy * u, tipy - dy * u + dx * u);
    ctx.stroke();
  });

  /* норы */
  G.holes.forEach(function(h, hi) {
    if (!vis(h.x, h.y)) return;
    var size = cs * 1.15;
    var cxp = geo.bx + h.x * cs + cs / 2, cyp = geo.by + h.y * cs + cs / 2;
    ctx.beginPath(); ctx.arc(cxp, cyp, cs * 0.52, 0, 7);
    ctx.lineWidth = Math.max(3, cs * 0.1); ctx.strokeStyle = PATH_COLORS[hi % PATH_COLORS.length]; ctx.stroke();
    drawSprite(h.opened ? 'hole_open' : 'hole_closed', 0, 1, cxp - size / 2, cyp - size / 2, size, size);
  });

  /* мышеловки */
  G.traps.forEach(function(tr) {
    if (!vis(tr.x, tr.y)) return;
    var size = cs * 0.85;
    drawSprite(tr.armed ? 'mousetrap' : 'mousetrap_disarmed', 0, 1,
      geo.bx + tr.x * cs + cs / 2 - size / 2, geo.by + tr.y * cs + cs / 2 - size / 2, size, size);
  });

  /* новые препятствия и бонусы */
  (G.coins || []).forEach(function(coin) {
    if (coin.taken || !vis(coin.x, coin.y)) return;
    var ccx = geo.bx + coin.x * cs + cs / 2, ccy = geo.by + coin.y * cs + cs / 2;
    ctx.beginPath(); ctx.arc(ccx, ccy, cs * .27, 0, Math.PI * 2); ctx.fillStyle = '#f7c948'; ctx.fill();
    ctx.lineWidth = Math.max(2, cs * .07); ctx.strokeStyle = '#a56a16'; ctx.stroke();
    text('★', ccx, ccy, Math.max(10, cs * .32), '#fff6c9', 'center', true);
  });
  (G.doors || []).forEach(function(door) {
    if (!vis(door.x, door.y)) return;
    var dx = geo.bx + door.x * cs, dy = geo.by + door.y * cs;
    ctx.fillStyle = door.open ? '#9bb18a' : '#8b5934';
    rrPath(dx + cs * .18, dy + cs * .08, cs * .64, cs * .84, 5); ctx.fill();
    ctx.strokeStyle = '#4b3621'; ctx.lineWidth = Math.max(2, cs * .06); ctx.stroke();
    ctx.fillStyle = '#e7c46c'; ctx.beginPath(); ctx.arc(dx + cs * (door.open ? .34 : .7), dy + cs * .5, Math.max(2, cs * .055), 0, 7); ctx.fill();
    if (door.open) text('↗', dx + cs * .5, dy + cs * .48, Math.max(12, cs * .38), '#fff4d6', 'center', true);
  });
  (G.dogs || []).forEach(function(dog) {
    if (!vis(dog.x, dog.y)) return;
    var dx = geo.bx + dog.x * cs, dy = geo.by + dog.y * cs;
    ctx.save(); ctx.globalAlpha = dog.calm ? .72 : 1;
    text('🐶', dx + cs / 2, dy + cs * .55, Math.max(18, cs * .78), '#ffffff', 'center', true);
    if (dog.calm) text('Zz', dx + cs * .75, dy + cs * .16, Math.max(10, cs * .25), '#4f8fc7', 'center', true);
    else text('!', dx + cs * .78, dy + cs * .18, Math.max(12, cs * .35), '#d64b2a', 'center', true);
    ctx.restore();
  });
  (G.teleports || []).forEach(function(pair, pi) {
    [pair.a, pair.b].forEach(function(pt, side) {
      if (!vis(pt.x, pt.y)) return;
      var cxp = geo.bx + pt.x * cs + cs / 2, cyp = geo.by + pt.y * cs + cs / 2;
      ctx.beginPath(); ctx.arc(cxp, cyp, cs * .34, 0, Math.PI * 2); ctx.fillStyle = side ? '#4d9ed0' : '#9b68d0'; ctx.fill();
      ctx.lineWidth = Math.max(2, cs * .08); ctx.strokeStyle = '#f7e8ff'; ctx.stroke();
      ctx.beginPath(); ctx.arc(cxp, cyp, cs * .2, G.time * 2, G.time * 2 + Math.PI * 1.5); ctx.strokeStyle = '#fff'; ctx.lineWidth = Math.max(2, cs * .06); ctx.stroke();
    });
  });

  /* сыр */
  if (G.cheese && vis(G.cheese.x, G.cheese.y)) {
    var sizeC = cs * 0.8;
    var alpha = 1;
    if (G.cheese.taken && G.cheeseAnim > 0) alpha = Math.max(0, 1 - G.cheeseAnim * 2.5);
    ctx.save();
    ctx.globalAlpha = alpha;
    drawSprite('cheese', 0, 1,
      geo.bx + G.cheese.x * cs + cs / 2 - sizeC / 2, geo.by + G.cheese.y * cs + cs / 2 - sizeC / 2, sizeC, sizeC);
    ctx.restore();
  }

  /* коты + полоска таймера (синяя — спит, сколько осталось; красная — бодрствует до засыпания) */
  G.cats.forEach(function(c) {
    if (!vis(c.x, c.y)) return;
    var size = cs * 1.6;
    var px = geo.bx + c.x * cs + cs / 2 - size / 2;
    var py = geo.by + c.y * cs + cs / 2 - size * 0.62;
    if (c.state === 'asleep') {
      drawSprite('cat_sleep_sheet', Math.floor(c.anim * 2.5) % 4, 4, px, py, size, size, false, skinHue('cat'));
      if (c.snoozeFx > 0) text('Zz!', px + size * 0.8, py + 10, Math.max(12, cs * 0.5), '#5e3416');
    } else {
      drawSprite('cat_awake', 0, 1, px, py, size, size, false, skinHue('cat'));
      if (cs >= 20) {
        var bx2 = px + size * 0.78, by2 = py - 4 + Math.sin(G.time * 6) * 3;
        ctx.fillStyle = '#fffdf4';
        rrPath(bx2 - 10, by2 - 16, 20, 30, 8); ctx.fill();
        ctx.lineWidth = 3; ctx.strokeStyle = '#4b3621'; ctx.stroke();
        text('!', bx2, by2, 20, '#d64b2a', 'center', true);
      }
    }
    var barW = cs * 0.84, barH = Math.max(4, cs * 0.11);
    var bxp = geo.bx + c.x * cs + (cs - barW) / 2, byp = geo.by + c.y * cs + cs - barH - 1;
    ctx.fillStyle = 'rgba(40,25,10,0.55)';
    ctx.fillRect(bxp - 1, byp - 1, barW + 2, barH + 2);
    var frac = c.state === 'asleep' ? Math.min(1, c.timer / NAP_CAP) : Math.min(1, c.timer / c.wake);
    ctx.fillStyle = c.state === 'asleep' ? '#5aa9e6' : '#e0533a';
    ctx.fillRect(bxp, byp, barW * Math.max(0, frac), barH);
  });

  /* мыши */
  G.holes.forEach(function(h) {
    if (!h.opened || h.done) return;
    var m = h.mouse;
    var a = h.path[m.i], b = h.path[Math.min(m.i + 1, h.path.length - 1)];
    var fx = a[0] + (b[0] - a[0]) * m.prog;
    var fy = a[1] + (b[1] - a[1]) * m.prog;
    if (b[0] !== a[0]) m.face = b[0] > a[0] ? 1 : -1;
    var size = cs * 0.72;
    drawSprite('mouse_run_sheet', Math.floor(G.time * 12) % 6, 6,
      geo.bx + fx * cs + cs / 2 - size / 2, geo.by + fy * cs + cs - size, size, size, m.face < 0, skinHue('mouse'));
  });

  /* подсказка */
  if (G.hintCell && G.hintTimer > 0) {
    var pul = 1 + Math.sin(G.time * 8) * 0.15;
    ctx.beginPath();
    ctx.arc(geo.bx + G.hintCell.x * cs + cs / 2, geo.by + G.hintCell.y * cs + cs / 2, cs * 0.52 * pul, 0, 7);
    ctx.lineWidth = 5; ctx.strokeStyle = '#ffd23e'; ctx.stroke();
  }
  ctx.restore();

  /* HUD */
  text(t('level') + ' ' + (G.levelIdx + 1), W / 2, 25, 25, '#4b3621');
  text(chapterName(G.levelIdx), W / 2, 52, 14, theme.accent, 'center', true);
  text('🪙 ' + Save.data.coins, 82, 28, 15, '#a56a16', 'center', true);
  var left = 0;
  G.holes.forEach(function(h) { if (!h.done) left++; });
  text(t('mice') + ': ' + (G.holes.length - left) + '/' + G.holes.length, W / 2, 72, 14, '#8a6342', 'center', true);
  var s = 52;
  var allOn = Save.data.sound || Save.data.music;   // кнопка в игре — «всё вкл/выкл»; по отдельности — в паузе
  iconButton(14, 10, s, allOn ? 'sound_on' : 'sound_off', function() {
    var on = !(Save.data.sound || Save.data.music);
    Save.data.sound = on; Save.data.music = on; AudioSys.muted = !on; AudioSys.setMusic(on); Save.save();
  });
  drawIcon(uiButtons[uiButtons.length - 1]);
  iconButton(W - s - 14, 10, s, 'pause', function() { G.overlay = 'pause'; });
  drawIcon(uiButtons[uiButtons.length - 1]);

  /* кнопки зума — только если поле не помещается на экране при минимальном масштабе удобства */
  G.zoomRect = null;
  if (!G.overlay && Math.max(cols, rows) > 8) {
    var zs = 44, zx = W - zs - 8, zy = AREA_TOP + ah / 2 - (zs * 3 + 16) / 2;
    ctx.globalAlpha = 0.85;
    G.zoomRect = { x: zx - 4, y: zy - 4, w: zs + 8, h: 3 * zs + 24 };
    iconButton(zx, zy, zs, 'plus', function() { zoomAt(W / 2, AREA_TOP + ah / 2, 1.35); });
    drawButtonRectSoft(uiButtons[uiButtons.length - 1]); drawIcon(uiButtons[uiButtons.length - 1]);
    iconButton(zx, zy + zs + 8, zs, 'minus', function() { zoomAt(W / 2, AREA_TOP + ah / 2, 1 / 1.35); });
    drawButtonRectSoft(uiButtons[uiButtons.length - 1]); drawIcon(uiButtons[uiButtons.length - 1]);
    iconButton(zx, zy + 2 * (zs + 8), zs, 'fit', toggleFit);
    drawButtonRectSoft(uiButtons[uiButtons.length - 1]); drawIcon(uiButtons[uiButtons.length - 1]);
    ctx.globalAlpha = 1;
  }

  var hw = Math.min(190, W * 0.42), hh = 54;
  G.hintRect = { x: W / 2 - hw / 2 - 4, y: H - hh - 20, w: hw + 8, h: hh + 8 };
  addButton(W / 2 - hw / 2, H - hh - 16, hw, hh, t('hint'), function() {
    Ads.showRewarded(function() {
      G.hintCell = computeHint();
      G.hintTimer = HINT_TIME;
      if (G.hintCell) focusCell(G.hintCell.x, G.hintCell.y);
    });
  }, '#e8933c');
  drawButtonRect(uiButtons[uiButtons.length - 1]);

  if (!G.overlay) drawTutorial(geo);
  if (G.overlay) drawOverlay(geo);
  if (G.fade > 0) { ctx.fillStyle = 'rgba(0,0,0,' + G.fade + ')'; ctx.fillRect(0, 0, W, H); }
}

function drawButtonRectSoft(b) {
  rrPath(b.x, b.y, b.w, b.h, 12);
  ctx.fillStyle = '#f2e3c6'; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = '#4b3621'; ctx.stroke();
}

/* ---------------- Оверлеи ---------------- */
function drawOverlay(geo) {
  ctx.fillStyle = 'rgba(30,18,8,0.55)';
  ctx.fillRect(0, 0, W, H);
  var pw = Math.min(380, W * 0.88), ph = G.overlay === 'pause' ? 410 : 340;
  var px = (W - pw) / 2, py = (H - ph) / 2;
  rrPath(px, py, pw, ph, 24);
  ctx.fillStyle = '#f9efdd'; ctx.fill();
  ctx.lineWidth = 5; ctx.strokeStyle = '#4b3621'; ctx.stroke();

  var bw = Math.min(pw - 60, 260), bh = 54, bx = (W - bw) / 2;

  if (G.overlay === 'win') {
    text(t('win'), W / 2, py + 46, 30, '#4b3621');
    for (var k = 0; k < 3; k++) {
      var shown = G.winTime > 0.3 + k * 0.45;
      var sc = shown ? Math.min(1.15, 0.6 + (G.winTime - 0.3 - k * 0.45) * 2.2) : 0.01;
      var size = 64 * sc;
      ctx.globalAlpha = (shown && k < G.winStars) ? 1 : 0.25;
      drawSprite('star', 0, 1, W / 2 + (k - 1) * 80 - size / 2, py + 108 - size / 2, size, size);
      ctx.globalAlpha = 1;
    }
    addButton(bx, py + 178, bw, bh, t('next'), function() {
      maybeInterstitial();
      if (G.levelIdx + 1 < LEVEL_COUNT) startLevel(G.levelIdx + 1, false);
      else openMap(LEVEL_COUNT - 1);
    }, '#7bb661');
    drawButtonRect(uiButtons[uiButtons.length - 1]);
    addButton(bx, py + 244, bw / 2 - 6, bh, t('again'), function() { startLevel(G.levelIdx, false); }, '#e8b25a');
    drawButtonRect(uiButtons[uiButtons.length - 1]);
    addButton(bx + bw / 2 + 6, py + 244, bw / 2 - 6, bh, t('map'), function() { maybeInterstitial(); openMap(G.levelIdx + 1); }, '#e8b25a');
    drawButtonRect(uiButtons[uiButtons.length - 1]);
  } else if (G.overlay === 'fail') {
    text(G.failMsg, W / 2, py + 60, 24, '#c0492b');
    addButton(bx, py + 120, bw, bh, t('retry'), function() { startLevel(G.levelIdx, true); }, '#e8933c');
    drawButtonRect(uiButtons[uiButtons.length - 1]);
    var nextY = py + 186;
    if (G.failStreak >= 3) {
      addButton(bx, nextY, bw, bh, t('skip'), function() {
        Ads.showRewarded(function() {
          Save.data.unlocked = Math.min(LEVEL_COUNT - 1, Math.max(Save.data.unlocked, G.levelIdx + 1));
          Save.save();
          openMap(G.levelIdx + 1);
        });
      }, '#7bb661');
      drawButtonRect(uiButtons[uiButtons.length - 1]);
      nextY += bh + 12;
    }
    addButton(bx, nextY, bw, bh, t('map'), function() { openMap(G.levelIdx); }, '#cbb894');
    drawButtonRect(uiButtons[uiButtons.length - 1]);
  } else if (G.overlay === 'pause') {
    text(t('title'), W / 2, py + 60, 30, '#4b3621');
    addButton(bx, py + 120, bw, bh, t('resume'), function() { G.overlay = null; }, '#7bb661');
    drawButtonRect(uiButtons[uiButtons.length - 1]);
    addButton(bx, py + 186, bw, bh, t('restart'), function() { startLevel(G.levelIdx, false); }, '#e8b25a');
    drawButtonRect(uiButtons[uiButtons.length - 1]);
    addButton(bx, py + 252, bw, bh, t('menu'), function() { setScreen('menu'); }, '#cbb894');
    drawButtonRect(uiButtons[uiButtons.length - 1]);
    var tw = bw / 2 - 6;
    addButton(bx, py + 330, tw, 54, t('music') + ': ' + t(Save.data.music ? 'on' : 'off'), toggleMusic, Save.data.music ? '#7bb661' : '#cbb894');
    drawButtonRect(uiButtons[uiButtons.length - 1]);
    addButton(bx + bw / 2 + 6, py + 330, tw, 54, t('sounds') + ': ' + t(Save.data.sound ? 'on' : 'off'), toggleSfx, Save.data.sound ? '#7bb661' : '#cbb894');
    drawButtonRect(uiButtons[uiButtons.length - 1]);
  }
}

/* ---------------- Реклама: интерстишл ---------------- */
function maybeInterstitial() {
  G.levelsCompleted++;
  if (G.levelsCompleted % 3 === 0 && Date.now() - G.lastInterstitial > 60000) {
    G.lastInterstitial = Date.now();
    Ads.showInterstitial();
  }
}

/* ============================================================
   ОБУЧЕНИЕ
   Подсказки привязаны к уровням 1–6 (нора, кот, две норы, мышеловка, сыр),
   а также показываются один раз при первом большом поле (камера) и
   первых извилистых маршрутах. Шаги 'ok' ставят игру на паузу,
   шаги 'wait' ждут действия игрока и идут вместе с игрой.
   ============================================================ */
function tutBlocking() {
  if (!G.tut || G.screen !== 'game') return false;
  var st = G.tut.steps[G.tut.i];
  return !!(st && st.kind === 'ok');
}
function tutCell(x, y) { return { type: 'cell', x: x, y: y }; }

function holeWithoutCat() {
  for (var i = 0; i < G.holes.length; i++) {
    var ok = true;
    for (var k = 0; k < G.holes[i].path.length; k++) {
      if (catAt(G.holes[i].path[k][0], G.holes[i].path[k][1])) { ok = false; break; }
    }
    if (ok && !G.holes[i].opened) return G.holes[i];
  }
  return G.holes[0];
}
function allDone() { return G.holes.every(function(h) { return h.done; }); }

function firstBend() {
  for (var i = 0; i < G.holes.length; i++) {
    var p = G.holes[i].path;
    for (var k = 1; k < p.length - 1; k++) {
      if ((p[k][0] - p[k - 1][0]) !== (p[k + 1][0] - p[k][0]) || (p[k][1] - p[k - 1][1]) !== (p[k + 1][1] - p[k][1])) return p[k];
    }
  }
  return null;
}

function buildTutorial(id) {
  var cat = function() { return G.cats[0]; };
  var T = {
    basics: [
      { kind: 'wait', text: 'tut_basics_open', target: function() { return tutCell(G.holes[0].x, G.holes[0].y); }, cond: function() { return G.tf.opened > 0; } },
      { kind: 'wait', text: 'tut_basics_run', target: null, cond: allDone }
    ],
    cats: [
      { kind: 'ok', text: 'tut_cat_intro', target: function() { return tutCell(cat().x, cat().y); } },
      { kind: 'wait', text: 'tut_cat_wait', target: function() { return tutCell(cat().x, cat().y); }, cond: function() { return cat().state === 'asleep'; } },
      { kind: 'wait', text: 'tut_cat_snooze', target: function() { return tutCell(cat().x, cat().y); },
        cond: function() { return G.tf.snoozed > 0; }, backIf: function() { return cat().state !== 'asleep' && G.tf.snoozed === 0; } },
      { kind: 'wait', text: 'tut_cat_open', target: function() { return tutCell(G.holes[0].x, G.holes[0].y); }, cond: function() { return G.tf.opened > 0; } },
      { kind: 'wait', text: 'tut_cat_run', target: null, cond: allDone }
    ],
    multi: [
      { kind: 'ok', text: 'tut_multi_intro', target: function() { var h = holeWithoutCat(); return tutCell(h.x, h.y); } },
      { kind: 'wait', text: 'tut_multi_run', target: null, cond: allDone }
    ],
    traps: [
      { kind: 'ok', text: 'tut_trap_intro', target: function() { return tutCell(G.traps[0].x, G.traps[0].y); } },
      { kind: 'wait', text: 'tut_trap_tap', target: function() { return tutCell(G.traps[0].x, G.traps[0].y); }, cond: function() { return G.tf.disarmed > 0; } },
      { kind: 'wait', text: 'tut_trap_open', target: function() { return tutCell(G.holes[0].x, G.holes[0].y); }, cond: function() { return G.tf.opened > 0; } }
    ],
    cheese: [
      { kind: 'ok', text: 'tut_cheese', target: function() { return tutCell(G.cheese.x, G.cheese.y); } }
    ],
    camera: [
      { kind: 'ok', text: 'tut_camera_1', target: function() { return G.zoomRect ? { type: 'rect', x: G.zoomRect.x, y: G.zoomRect.y, w: G.zoomRect.w, h: G.zoomRect.h } : null; } },
      { kind: 'ok', text: 'tut_camera_2', target: function() { return G.hintRect ? { type: 'rect', x: G.hintRect.x, y: G.hintRect.y, w: G.hintRect.w, h: G.hintRect.h } : null; } }
    ],
    bends: [
      { kind: 'ok', text: 'tut_bends_1', target: function() { var b = firstBend(); return b ? tutCell(b[0], b[1]) : null; } }
    ]
  };
  return T[id];
}

function initTutorial(idx) {
  G.tf = { opened: 0, snoozed: 0, disarmed: 0 };
  G.tut = null;
  var done = Save.data.tut, id = null;
  var byLevel = { 0: 'basics', 1: 'cats', 2: 'multi', 3: 'traps', 5: 'cheese' };
  if (byLevel[idx] && !done[byLevel[idx]]) id = byLevel[idx];
  else if (idx >= 10) {
    if (!done.camera && !boardFits()) id = 'camera';
    else if (!done.bends && firstBend()) id = 'bends';
  }
  if (!id) return;
  var steps = buildTutorial(id);
  if (id === 'camera' && !steps) return;
  G.tut = { id: id, steps: steps, i: 0, t0: 0 };
  tutEnterStep();
}

/* камера наводится на цель шага, если поле не влезает на экран */
function tutEnterStep() {
  if (!G.tut) return;
  var st = G.tut.steps[G.tut.i];
  G.tut.t0 = G.time;
  if (!st || !st.target || boardFits()) return;
  var tg = st.target();
  if (tg && tg.type === 'cell') focusCell(tg.x, tg.y);
}
function tutNext() {
  if (!G.tut) return;
  G.tut.i++;
  if (G.tut.i >= G.tut.steps.length) {
    Save.data.tut[G.tut.id] = 1; Save.save();   // шаги пройдены — больше не показываем
    G.tut = null;
    return;
  }
  tutEnterStep();
}
function tutUpdate() {
  var guard = 0;
  while (G.tut && guard++ < 6) {
    var st = G.tut.steps[G.tut.i];
    if (!st || st.kind !== 'wait') return;
    if (st.backIf && G.tut.i > 0 && st.backIf()) { G.tut.i--; tutEnterStep(); return; }
    if (st.cond()) { tutNext(); } else return;
  }
}
function tutSkipAll() {
  ['basics', 'cats', 'multi', 'traps', 'cheese', 'camera', 'bends'].forEach(function(k) { Save.data.tut[k] = 1; });
  Save.save();
  G.tut = null;
}

function wrapText(str, maxW, size) {
  ctx.font = 'bold ' + size + 'px "Segoe UI", system-ui, sans-serif';
  var words = String(str).split(' '), lines = [], cur = '';
  for (var i = 0; i < words.length; i++) {
    var test = cur ? cur + ' ' + words[i] : words[i];
    if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = words[i]; }
    else cur = test;
  }
  if (cur) lines.push(cur);
  return lines;
}

function drawTutorial(geo) {
  if (!G.tut) return;
  var st = G.tut.steps[G.tut.i];
  if (!st) return;
  var pulse = 1 + Math.sin(G.time * 7) * 0.08;

  /* цель: клетка или прямоугольник на экране */
  var rect = null, tg = st.target ? st.target() : null;
  if (tg && tg.type === 'cell') {
    var pad = Math.max(4, geo.cs * 0.08);
    rect = { x: geo.bx + tg.x * geo.cs - pad, y: geo.by + tg.y * geo.cs - pad, w: geo.cs + pad * 2, h: geo.cs + pad * 2 };
  } else if (tg && tg.type === 'rect') rect = tg;

  /* затемнение с «окном» вокруг цели (только на шагах с паузой) */
  if (st.kind === 'ok') {
    ctx.fillStyle = 'rgba(30,18,8,0.55)';
    ctx.beginPath(); ctx.rect(0, 0, W, H);
    if (rect) ctx.rect(rect.x, rect.y, rect.w, rect.h);
    ctx.fill('evenodd');
  }
  if (rect) {
    var gx = rect.x + rect.w / 2, gy = rect.y + rect.h / 2;
    ctx.save();
    ctx.lineWidth = 5; ctx.strokeStyle = '#ffd23e';
    rrPath(gx - rect.w / 2 * pulse, gy - rect.h / 2 * pulse, rect.w * pulse, rect.h * pulse, 12);
    ctx.stroke();
    /* стрелка-указатель */
    var bob = Math.sin(G.time * 6) * 5, ay = rect.y + rect.h + 8 + bob;
    var below = rect.y + rect.h + 40 < H - 90;
    ctx.fillStyle = '#ffd23e'; ctx.strokeStyle = '#4b3621'; ctx.lineWidth = 3; ctx.lineJoin = 'round';
    ctx.beginPath();
    if (below) { ctx.moveTo(gx, ay); ctx.lineTo(gx - 12, ay + 22); ctx.lineTo(gx + 12, ay + 22); }
    else { var ty = rect.y - 8 - bob; ctx.moveTo(gx, ty); ctx.lineTo(gx - 12, ty - 22); ctx.lineTo(gx + 12, ty - 22); }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  /* пузырь с текстом: вверху или внизу, подальше от цели */
  var bw = Math.min(W - 24, 430), size = 17, pad = 14;
  var lines = wrapText(t(st.text), bw - pad * 2, size);
  var btnH = 40, bh = pad * 2 + lines.length * 23 + btnH + 8;
  var targetY = rect ? rect.y + rect.h / 2 : H * 0.25;
  var top = targetY > H * 0.5 ? AREA_TOP - 2 : H - AREA_BOTTOM - bh + 4;
  var bx = (W - bw) / 2;
  rrPath(bx, top, bw, bh, 18);
  ctx.fillStyle = '#fff6e4'; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = '#4b3621'; ctx.stroke();
  for (var i = 0; i < lines.length; i++) {
    text(lines[i], W / 2, top + pad + 12 + i * 23, size, '#4b3621', 'center', true);
  }
  var by = top + bh - pad - btnH + 2;
  var isOk = st.kind === 'ok';
  var sw = isOk ? (bw - pad * 2 - 10) * 0.42 : Math.min(150, bw - pad * 2);
  addButton(bx + pad, by, sw, btnH, t('skipTut'), function() { tutSkipAll(); }, '#cbb894');
  drawButtonRect(uiButtons[uiButtons.length - 1]); uiButtons[uiButtons.length - 1].tut = true;
  if (isOk) {
    var gw = bw - pad * 2 - 10 - sw;
    addButton(bx + pad + sw + 10, by, gw, btnH, t('gotit'), function() { tutNext(); }, '#7bb661');
    drawButtonRect(uiButtons[uiButtons.length - 1]); uiButtons[uiButtons.length - 1].tut = true;
  }
}

/* ---------------- Главный цикл ---------------- */
function draw() {
  uiButtons = [];   // кнопки пересобираются каждый кадр, иначе остаются «невидимые» кнопки закрытых окон
  ctx.clearRect(0, 0, W, H);
  if (G.screen === 'loading') drawLoading();
  else if (G.screen === 'menu') drawMenu();
  else if (G.screen === 'map') drawMap();
  else if (G.screen === 'shop') drawShop();
  else if (G.screen === 'game') drawGame();
  if (G.errMsg && G.screen !== 'game') {
    ctx.fillStyle = 'rgba(200,40,40,0.9)';
    ctx.fillRect(0, H - 26, W, 26);
    text(String(G.errMsg).slice(0, 90), W / 2, H - 13, 12, '#fff', 'center', true);
  }
}

function loop(ts) {
  var dt = Math.min(0.05, (ts - lastTs) / 1000 || 0);
  lastTs = ts;
  G.time += dt;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

/* ---------------- Telegram Mini App integration ---------------- */
window.__telegramBack = function() {
  if (G.screen === 'game') { if (G.overlay) G.overlay = null; else G.overlay = 'pause'; }
  else if (G.screen === 'map') setScreen('menu');
  else if (G.screen !== 'menu') setScreen('menu');
};

/* ---------------- Запуск ---------------- */
function boot() {
  canvas = document.getElementById('game');
  ctx = canvas.getContext('2d');
  resize();
  window.addEventListener('resize', resize);

  if (window.PointerEvent) {
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
  } else {
    canvas.addEventListener('mousedown', onDown);
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseup', onUp);
    canvas.addEventListener('touchstart', function(e) {
      e.preventDefault();
      onDown(e.changedTouches[0]);
    }, { passive: false });
    canvas.addEventListener('touchmove', function(e) { e.preventDefault(); onMove(e.changedTouches[0]); }, { passive: false });
    canvas.addEventListener('touchend', function(e) { onUp(e.changedTouches[0]); });
  }

  canvas.addEventListener('wheel', function(e) {
    if (!boardActive()) return;
    e.preventDefault();
    var p = canvasXY(e);
    zoomAt(p.x, p.y, e.deltaY < 0 ? 1.15 : 1 / 1.15);
  }, { passive: false });

  document.addEventListener('visibilitychange', function() {
    if (document.hidden) AudioSys.suspend(); else AudioSys.resume();
    if (document.hidden && G.screen === 'game' && !G.overlay) {
      G.overlay = 'pause';
    }
  });

  window.addEventListener('error', function(e) {
    G.errMsg = e && e.message ? e.message : 'script error';
  });

  loadAssets(function() { if (G.screen === 'loading') setScreen('menu'); });

  Ads.init().then(function() {
    LANG = Ads.getLang() === 'en' ? 'en' : 'ru';
    return Save.load();
  }).catch(function() {});

  requestAnimationFrame(loop);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
