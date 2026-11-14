'use strict';
/* ============================================================
   ЗВУК И МУЗЫКА — всё синтезируется на лету (WebAudio), файлов нет.
   Эффекты: мяуканье, мурлыканье, писк мыши, щелчки ловушек, хруст сыра.
   Музыка: три зацикленные мелодии (лёгкая / средняя / напряжённая),
   выбираются по номеру уровня; в меню — спокойная.
   ============================================================ */
var AudioSys = {
  ctx: null, master: null, sfxBus: null, musicBus: null, noiseBuf: null,
  muted: false,          // эффекты выключены
  musicOn: true,         // музыка включена
  want: 'menu',          // какую мелодию нужно играть
  playing: null, timer: null, nextTime: 0, step: 0, pattern: [], T: null,
  lastCat: 0, errors: 0,

  init: function() {
    if (this.ctx) return;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      var c = this.ctx = new AC();
      var comp = c.createDynamicsCompressor();      // чтобы много звуков сразу не «хрипели»
      comp.connect(c.destination);
      this.master = c.createGain(); this.master.gain.value = 0.9; this.master.connect(comp);
      this.sfxBus = c.createGain(); this.sfxBus.gain.value = 1; this.sfxBus.connect(this.master);
      this.musicBus = c.createGain(); this.musicBus.gain.value = this.musicOn ? 0.3 : 0; this.musicBus.connect(this.master);
      var len = c.sampleRate | 0, buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      this.noiseBuf = buf;
      this._startMusic();
    } catch (e) { this.errors++; }
  },

  /* ---------- кирпичики ---------- */
  _tone: function(freq, dur, type, vol, when, glide, bus) {
    var c = this.ctx; if (!c) return;
    var t0 = when || c.currentTime;
    var o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t0);
    if (glide) o.frequency.exponentialRampToValueAtTime(Math.max(20, glide), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(vol || 0.15, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(bus || this.sfxBus);
    o.start(t0); o.stop(t0 + dur + 0.02);
  },
  _noise: function(dur, vol, ftype, freq, q, when, bus) {
    var c = this.ctx; if (!c || !this.noiseBuf) return;
    var t0 = when || c.currentTime;
    var s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = this.noiseBuf;
    f.type = ftype || 'bandpass'; f.frequency.value = freq || 2000; f.Q.value = q || 1;
    g.gain.setValueAtTime(vol || 0.2, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    s.connect(f); f.connect(g); g.connect(bus || this.sfxBus);
    s.start(t0, Math.random() * 0.5); s.stop(t0 + dur + 0.02);
  },
  _sfx: function(fn, a, b, c2) {
    if (this.muted || !this.ctx) return;
    try { fn.call(this, a, b, c2); } catch (e) { this.errors++; }
  },

  /* ---------- мяуканье: пила через два формантных фильтра ---------- */
  _meow: function(pitch, dur, vol) {
    var c = this.ctx, t0 = c.currentTime;
    var o = c.createOscillator(), g = c.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(pitch * 0.8, t0);
    o.frequency.linearRampToValueAtTime(pitch * 1.3, t0 + dur * 0.35);
    o.frequency.linearRampToValueAtTime(pitch * 0.7, t0 + dur);
    var f1 = c.createBiquadFilter(), f2 = c.createBiquadFilter();
    f1.type = 'bandpass'; f1.Q.value = 5;
    f1.frequency.setValueAtTime(650, t0); f1.frequency.linearRampToValueAtTime(1100, t0 + dur * 0.4); f1.frequency.linearRampToValueAtTime(600, t0 + dur);
    f2.type = 'bandpass'; f2.Q.value = 7;
    f2.frequency.setValueAtTime(1700, t0); f2.frequency.linearRampToValueAtTime(2500, t0 + dur * 0.4); f2.frequency.linearRampToValueAtTime(1500, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + dur * 0.12);
    g.gain.setValueAtTime(vol, t0 + dur * 0.6);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(f1); o.connect(f2); f1.connect(g); f2.connect(g); g.connect(this.sfxBus);
    o.start(t0); o.stop(t0 + dur + 0.03);
  },
  /* ---------- мурлыканье: низкий тон с быстрой амплитудной модуляцией ---------- */
  _purr: function(dur, vol) {
    var c = this.ctx, t0 = c.currentTime;
    var o = c.createOscillator(), lfo = c.createOscillator(), lg = c.createGain(), g = c.createGain(), lp = c.createBiquadFilter();
    o.type = 'sawtooth'; o.frequency.value = 62;
    lp.type = 'lowpass'; lp.frequency.value = 260;
    lfo.type = 'sine'; lfo.frequency.value = 24;
    lg.gain.value = vol * 0.6;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.12);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    lfo.connect(lg); lg.connect(g.gain);
    o.connect(lp); lp.connect(g); g.connect(this.sfxBus);
    o.start(t0); lfo.start(t0); o.stop(t0 + dur + 0.03); lfo.stop(t0 + dur + 0.03);
  },
  /* ---------- писк мыши: быстрые «чирики» ---------- */
  _squeak: function(n, base, vol) {
    var c = this.ctx, t0 = c.currentTime;
    for (var i = 0; i < n; i++) {
      var w = t0 + i * 0.09;
      var o = c.createOscillator(), g = c.createGain(), v = c.createOscillator(), vg = c.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(base, w);
      o.frequency.linearRampToValueAtTime(base * 1.5, w + 0.045);
      o.frequency.linearRampToValueAtTime(base * 1.2, w + 0.08);
      v.frequency.value = 38; vg.gain.value = base * 0.05; v.connect(vg); vg.connect(o.frequency);   // дрожание
      g.gain.setValueAtTime(0.0001, w);
      g.gain.linearRampToValueAtTime(vol, w + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, w + 0.085);
      o.connect(g); g.connect(this.sfxBus);
      o.start(w); v.start(w); o.stop(w + 0.1); v.stop(w + 0.1);
    }
  },
  _snap: function(vol) {      // захлопнувшаяся мышеловка
    this._noise(0.06, vol, 'highpass', 2500, 0.7);
    this._tone(260, 0.14, 'square', vol * 0.5, 0, 55);
    this._tone(1800, 0.02, 'square', vol * 0.4);
  },

  /* ---------- публичные эффекты ---------- */
  tap: function() { this._sfx(function() { this._tone(620, 0.06, 'sine', 0.1); }); },
  open: function() { this._sfx(function() { this._squeak(2, 2300, 0.11); this._noise(0.1, 0.06, 'lowpass', 500, 0.5); }); },       // нора открылась, мышь пискнула
  exitMouse: function() { this._sfx(function() { this._squeak(1, 3000, 0.09); this._tone(880, 0.08, 'triangle', 0.08, this.ctx.currentTime + 0.1); }); },
  trap: function() { this._sfx(function() { this._noise(0.05, 0.22, 'bandpass', 3200, 2); this._tone(600, 0.07, 'triangle', 0.14, 0, 1000); }); },   // ловушку обезвредили
  crunch: function() { this._sfx(function() { var t = this.ctx.currentTime; for (var i = 0; i < 3; i++) this._noise(0.05, 0.22, 'bandpass', 1400 + i * 300, 1.5, t + i * 0.07); this._tone(900, 0.09, 'triangle', 0.1, t + 0.22); }); },
  purr: function() { this._sfx(function() { this._purr(0.7, 0.16); }); },      // кота тапнули, пока спит
  catWake: function(gain) { this._sfx(function() { this._meow(520, 0.32, 0.1 * gain); }); },
  catSleep: function(gain) { this._sfx(function() { this._purr(0.5, 0.08 * gain); }); },
  win: function() {
    this._sfx(function() {
      var t = this.ctx.currentTime, self = this;
      [523, 659, 784, 1047].forEach(function(f, i) { self._tone(f, 0.22, 'triangle', 0.14, t + i * 0.11); self._tone(f * 2, 0.16, 'sine', 0.04, t + i * 0.11); });
      this._squeak(2, 3200, 0.07);
    });
  },
  /* проигрыш: reason = 'trap' | 'cat' */
  fail: function(reason) {
    this._sfx(function() {
      if (reason === 'trap') { this._snap(0.4); this._squeak(1, 3400, 0.12); }
      else { this._meow(380, 0.55, 0.22); this._noise(0.25, 0.1, 'highpass', 4500, 0.6); this._squeak(1, 3600, 0.1); }
      this._tone(180, 0.5, 'sawtooth', 0.07, this.ctx.currentTime + 0.1, 70);
    });
  },
  /* можно ли сейчас проиграть звук кота (не чаще раза в 0.2 с, чтобы 80 котов не устроили какофонию) */
  catGate: function() {
    if (!this.ctx) return false;
    var t = this.ctx.currentTime;
    if (t - this.lastCat < 0.2) return false;
    this.lastCat = t; return true;
  },

  /* ---------- настройки ---------- */
  setMusic: function(on) {
    this.musicOn = !!on;
    if (!this.ctx) return;
    try { this.musicBus.gain.setTargetAtTime(on ? 0.3 : 0, this.ctx.currentTime, 0.08); } catch (e) { this.errors++; }
    if (on) this._startMusic();
  },
  duck: function(level) {     // приглушить музыку (во время окна победы/поражения)
    if (!this.ctx || !this.musicOn) return;
    try { this.musicBus.gain.setTargetAtTime(0.3 * level, this.ctx.currentTime, 0.15); } catch (e) { this.errors++; }
  },
  suspend: function() { try { if (this.ctx && this.ctx.suspend) this.ctx.suspend(); } catch (e) {} },
  resume: function() { try { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); } catch (e) {} },

  /* ---------- музыка ---------- */
  TRACKS: {
    menu: { bpm: 92,  roots: [48, 45, 41, 43], minor: false, hat: 0, kick: false, seed: 11, density: 0.55 },     // C Am F G
    easy: { bpm: 108, roots: [48, 45, 41, 43], minor: false, hat: 0, kick: false, seed: 23, density: 0.6 },
    mid:  { bpm: 120, roots: [45, 41, 48, 40], minor: true,  hat: 1, kick: false, seed: 37, density: 0.65 },     // Am F C E
    hard: { bpm: 138, roots: [50, 46, 41, 48], minor: true,  hat: 2, kick: true,  seed: 53, density: 0.75 }      // Dm Bb F C
  },
  setTrack: function(name) {
    this.want = name;
    if (this.ctx && this.playing !== name) { this._startMusic(); }
  },
  _mtof: function(m) { return 440 * Math.pow(2, (m - 69) / 12); },
  _buildPattern: function(T) {
    var r = (function(a) { return function() { a |= 0; a = (a + 0x6D2B79F5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; })(T.seed);
    var scale = T.minor ? [0, 3, 5, 7, 10] : [0, 2, 4, 7, 9];   // пентатоника
    var pat = [], idx = 2;
    for (var st = 0; st < 64; st++) {
      var bar = Math.floor(st / 8) % 4, pos = st % 8, root = T.roots[bar] + 24;
      if (pos !== 0 && r() > T.density) { pat.push(null); continue; }
      idx += Math.floor(r() * 3) - 1; idx = Math.max(0, Math.min(scale.length * 2 - 1, idx));
      var note = root + scale[idx % scale.length] + 12 * Math.floor(idx / scale.length) - 12;
      pat.push(note);
    }
    return pat;
  },
  _startMusic: function() {
    if (!this.ctx || !this.musicOn) return;
    var name = this.want, T = this.TRACKS[name];
    if (!T) return;
    if (this.timer && this.playing === name) return;
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
    this.playing = name; this.T = T; this.pattern = this._buildPattern(T);
    this.step = 0; this.nextTime = this.ctx.currentTime + 0.1;
    var self = this;
    this.timer = setInterval(function() { self._pump(); }, 60);
  },
  _pump: function() {
    var c = this.ctx;
    if (!c || !this.musicOn || c.state !== 'running') { if (c && c.state === 'running') {} return; }
    try {
      var eighth = 60 / this.T.bpm / 2;
      if (this.nextTime < c.currentTime - 0.5) this.nextTime = c.currentTime + 0.05;   // догоняем после паузы
      while (this.nextTime < c.currentTime + 0.3) {
        this._scheduleStep(this.step, this.nextTime, eighth);
        this.nextTime += eighth; this.step++;
      }
    } catch (e) { this.errors++; }
  },
  _scheduleStep: function(step, when, eighth) {
    var T = this.T, bar = Math.floor(step / 8) % 4, pos = step % 8, bus = this.musicBus;
    var root = T.roots[bar];
    if (pos === 0 || pos === 4 || (T.hat === 2 && (pos === 2 || pos === 6))) {         // бас
      this._tone(this._mtof(root - 12), eighth * 3, 'triangle', 0.5, when, 0, bus);
    }
    if (T.kick && (pos === 0 || pos === 4)) this._tone(130, 0.14, 'sine', 0.55, when, 42, bus);
    if (T.hat === 1 && pos % 2 === 1) this._noise(0.04, 0.07, 'highpass', 7000, 0.7, when, bus);
    if (T.hat === 2) this._noise(0.035, pos % 2 ? 0.09 : 0.05, 'highpass', 7500, 0.7, when, bus);
    if (pos === 0) {                                                                    // тихий аккорд-подложка
      var third = T.minor ? 3 : 4;
      var self = this;
      [0, third, 7].forEach(function(iv) { self._tone(self._mtof(root + 12 + iv), eighth * 7, 'sine', 0.07, when, 0, bus); });
    }
    var n = this.pattern[step % this.pattern.length];
    if (n !== null && n !== undefined) {                                                // мелодия (щипок)
      this._tone(this._mtof(n), eighth * 1.8, 'triangle', 0.32, when, 0, bus);
      this._tone(this._mtof(n + 12), eighth * 0.9, 'sine', 0.06, when, 0, bus);
    }
  }
};
