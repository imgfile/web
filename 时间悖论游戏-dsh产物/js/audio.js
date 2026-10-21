/* =========================================================================
 * 时间悖论：失控实验室 — 程序化声音
 * 无外部音频素材。低频实验室底噪、机械按键、压力板钟琴、倒带反向噪声、
 * 同步和弦与结局音景都由 WebAudio 即时合成。
 * ========================================================================= */
(function (root) {
  'use strict';

  var STORAGE_KEY = 'chrono.sound.muted.v1';

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function ChronoAudio() {
    this.ctx = null;
    this.master = null;
    this.sfxBus = null;
    this.ambientBus = null;
    this.reverb = null;
    this.reverbSend = null;
    this.ambientNodes = [];
    this.ambientTimer = null;
    this.initialized = false;
    this.muted = false;
    this.scene = 'title';
    this.volume = 0.55;
    this.bellTimer = null;
    this.lastBell = 0;
    this._loadPrefs();
  }

  ChronoAudio.prototype._loadPrefs = function () {
    try {
      this.muted = window.localStorage.getItem(STORAGE_KEY) === '1';
    } catch (e) { this.muted = false; }
  };

  ChronoAudio.prototype._savePrefs = function () {
    try { window.localStorage.setItem(STORAGE_KEY, this.muted ? '1' : '0'); } catch (e) { /* ignore */ }
  };

  ChronoAudio.prototype.init = function () {
    if (this.initialized) {
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
      return this;
    }
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return this;
    try {
      this.ctx = new AC();
      var ctx = this.ctx;
      var compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -18;
      compressor.knee.value = 20;
      compressor.ratio.value = 4;
      compressor.attack.value = 0.005;
      compressor.release.value = 0.22;
      compressor.connect(ctx.destination);

      this.master = ctx.createGain();
      this.master.gain.value = this.muted ? 0 : this.volume;
      this.master.connect(compressor);

      this.sfxBus = ctx.createGain();
      this.sfxBus.gain.value = 0.85;
      this.sfxBus.connect(this.master);

      this.ambientBus = ctx.createGain();
      this.ambientBus.gain.value = 0.4;
      this.ambientBus.connect(this.master);

      // 合成一段短而暗的空间混响，让压力板钟琴和倒带声有“地下实验室”的尾音
      this.reverb = ctx.createConvolver();
      this.reverb.buffer = this._makeImpulse(2.6, 2.4);
      this.reverbSend = ctx.createGain();
      this.reverbSend.gain.value = 0.34;
      this.reverbSend.connect(this.reverb);
      this.reverb.connect(this.master);

      this._startAmbient();
      this.initialized = true;
      if (ctx.state === 'suspended') ctx.resume();
    } catch (e) {
      this.initialized = false;
    }
    return this;
  };

  ChronoAudio.prototype._makeImpulse = function (duration, decay) {
    var ctx = this.ctx;
    var rate = ctx.sampleRate;
    var length = Math.floor(rate * duration);
    var buffer = ctx.createBuffer(2, length, rate);
    for (var c = 0; c < 2; c++) {
      var data = buffer.getChannelData(c);
      for (var i = 0; i < length; i++) {
        var t = i / length;
        var noise = (Math.random() * 2 - 1) * Math.pow(1 - t, decay);
        // 低频散射，避免金属味过重
        data[i] = noise * (0.5 + 0.5 * Math.sin(i * 0.0007 + c));
      }
    }
    return buffer;
  };

  ChronoAudio.prototype._startAmbient = function () {
    if (!this.ctx) return;
    var ctx = this.ctx;
    var self = this;
    var filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 260;
    filter.Q.value = 0.7;
    filter.connect(this.ambientBus);

    var gain = ctx.createGain();
    gain.gain.value = 0.13;
    gain.connect(filter);

    var freqs = [55, 82.41, 110, 164.81];
    var types = ['sine', 'sine', 'triangle', 'sine'];
    var gains = [0.32, 0.2, 0.09, 0.05];
    for (var i = 0; i < freqs.length; i++) {
      var osc = ctx.createOscillator();
      var og = ctx.createGain();
      osc.type = types[i];
      osc.frequency.value = freqs[i];
      osc.detune.value = (i % 2 ? 1 : -1) * (3 + i * 2);
      og.gain.value = gains[i];
      osc.connect(og);
      og.connect(gain);
      osc.start();
      // 极慢的相位漂移
      var lfo = ctx.createOscillator();
      var lfoGain = ctx.createGain();
      lfo.frequency.value = 0.013 + i * 0.006;
      lfoGain.gain.value = 4 + i * 1.5;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.detune);
      lfo.start();
      this.ambientNodes.push({ osc: osc, gain: og, lfo: lfo, base: gains[i] });
    }

    // 过滤器的呼吸
    var breath = ctx.createOscillator();
    var breathGain = ctx.createGain();
    breath.frequency.value = 0.035;
    breathGain.gain.value = 70;
    breath.connect(breathGain);
    breathGain.connect(filter.frequency);
    breath.start();
    this.ambientNodes.push({ osc: breath, gain: null, lfo: null });

    this._ambientFilter = filter;
    this._ambientGain = gain;

    // 稀疏的钟声，像远处的实验设备在自我校准
    this.bellTimer = setInterval(function () {
      if (!self.ctx || self.ctx.state !== 'running' || self.muted) return;
      var now = Date.now();
      if (now - self.lastBell < 7000) return;
      self.lastBell = now;
      if (Math.random() > 0.7) self._ambientBell();
    }, 5200);
  };

  ChronoAudio.prototype._ambientBell = function () {
    var ctx = this.ctx;
    if (!ctx) return;
    var notes = [293.66, 349.23, 440, 523.25, 659.25];
    var freq = notes[Math.floor(Math.random() * notes.length)];
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    var t = ctx.currentTime + 0.1;
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.012, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 3.8);
    osc.connect(gain);
    gain.connect(this.ambientBus);
    gain.connect(this.reverbSend);
    osc.start(t);
    osc.stop(t + 4);
  };

  ChronoAudio.prototype.setScene = function (scene) {
    this.scene = scene;
    if (!this.ctx || !this._ambientFilter) return;
    var target = 260;
    if (scene === 'title') target = 300;
    else if (scene === 'game') target = 220;
    else if (scene === 'ending') target = 420;
    var now = this.ctx.currentTime;
    this._ambientFilter.frequency.cancelScheduledValues(now);
    this._ambientFilter.frequency.linearRampToValueAtTime(target, now + 1.5);
  };

  ChronoAudio.prototype._now = function () {
    return this.ctx ? this.ctx.currentTime : 0;
  };

  ChronoAudio.prototype._connectOut = function (node, reverbAmount) {
    node.connect(this.sfxBus);
    if (reverbAmount > 0) {
      var send = this.ctx.createGain();
      send.gain.value = reverbAmount;
      node.connect(send);
      send.connect(this.reverbSend);
    }
  };

  ChronoAudio.prototype._tone = function (opts) {
    if (!this.initialized || !this.ctx) return;
    var ctx = this.ctx;
    var t = ctx.currentTime + (opts.delay || 0);
    var dur = opts.dur || 0.15;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    var filter = null;
    osc.type = opts.type || 'sine';
    osc.frequency.setValueAtTime(Math.max(20, opts.freq), t);
    if (opts.toFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(20, opts.toFreq), t + dur);
    if (opts.filter) {
      filter = ctx.createBiquadFilter();
      filter.type = opts.filterType || 'lowpass';
      filter.frequency.setValueAtTime(opts.filter, t);
      if (opts.filterTo) filter.frequency.exponentialRampToValueAtTime(Math.max(40, opts.filterTo), t + dur);
      filter.Q.value = opts.q || 0.7;
      osc.connect(filter);
      filter.connect(gain);
    } else {
      osc.connect(gain);
    }
    var peak = opts.gain === undefined ? 0.08 : opts.gain;
    var attack = opts.attack === undefined ? 0.006 : opts.attack;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak), t + Math.min(attack, dur * 0.4));
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    this._connectOut(gain, opts.reverb || 0);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  };

  ChronoAudio.prototype._noise = function (opts) {
    if (!this.initialized || !this.ctx) return;
    var ctx = this.ctx;
    var t = ctx.currentTime + (opts.delay || 0);
    var dur = opts.dur || 0.3;
    var rate = ctx.sampleRate;
    var length = Math.max(1, Math.floor(rate * dur));
    var buffer = ctx.createBuffer(1, length, rate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < length; i++) {
      var env = Math.sin((i / length) * Math.PI);
      data[i] = (Math.random() * 2 - 1) * env * (opts.rough || 1);
    }
    var src = ctx.createBufferSource();
    src.buffer = buffer;
    var filter = ctx.createBiquadFilter();
    filter.type = opts.filterType || 'bandpass';
    filter.frequency.setValueAtTime(opts.freq || 900, t);
    if (opts.toFreq) filter.frequency.exponentialRampToValueAtTime(Math.max(40, opts.toFreq), t + dur);
    filter.Q.value = opts.q || 0.8;
    var gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(opts.gain || 0.04, t + Math.min(0.03, dur * 0.3));
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filter);
    filter.connect(gain);
    this._connectOut(gain, opts.reverb || 0);
    src.start(t);
    src.stop(t + dur + 0.02);
  };

  ChronoAudio.prototype.play = function (name) {
    if (!this.initialized) return;
    switch (name) {
      case 'ui':
        this._tone({ freq: 660, toFreq: 620, type: 'sine', dur: 0.065, gain: 0.035, reverb: 0.1 });
        break;
      case 'ui-soft':
        this._tone({ freq: 420, toFreq: 400, type: 'sine', dur: 0.06, gain: 0.018 });
        break;
      case 'move':
        this._tone({ freq: 190, toFreq: 150, type: 'triangle', dur: 0.055, gain: 0.035 });
        this._noise({ dur: 0.035, freq: 2200, toFreq: 800, gain: 0.012, filterType: 'bandpass', q: 1.4 });
        break;
      case 'echo-move':
        this._tone({ freq: 520, toFreq: 480, type: 'sine', dur: 0.06, gain: 0.012, reverb: 0.2 });
        break;
      case 'blocked':
        this._tone({ freq: 90, toFreq: 70, type: 'sine', dur: 0.11, gain: 0.055, reverb: 0.1 });
        this._tone({ freq: 180, toFreq: 140, type: 'square', dur: 0.04, gain: 0.009 });
        break;
      case 'wait':
        this._tone({ freq: 330, type: 'sine', dur: 0.06, gain: 0.02 });
        break;
      case 'plate-on':
        this._tone({ freq: 740, type: 'sine', dur: 0.45, gain: 0.055, reverb: 0.55 });
        this._tone({ freq: 1110, type: 'sine', dur: 0.32, gain: 0.03, reverb: 0.5, delay: 0.015 });
        break;
      case 'plate-off':
        this._tone({ freq: 330, toFreq: 280, type: 'sine', dur: 0.16, gain: 0.025, reverb: 0.2 });
        break;
      case 'door-open':
        this._noise({ dur: 0.32, freq: 700, toFreq: 160, gain: 0.05, filterType: 'lowpass', reverb: 0.2 });
        this._tone({ freq: 130, toFreq: 160, type: 'triangle', dur: 0.25, gain: 0.04 });
        break;
      case 'door-close':
        this._noise({ dur: 0.24, freq: 260, toFreq: 900, gain: 0.04, filterType: 'lowpass' });
        this._tone({ freq: 110, toFreq: 80, type: 'sine', dur: 0.2, gain: 0.04 });
        break;
      case 'seal':
        this._tone({ freq: 392, toFreq: 311, type: 'sawtooth', dur: 0.45, gain: 0.026, filter: 1200, filterTo: 280, reverb: 0.5 });
        this._noise({ dur: 0.4, freq: 1800, toFreq: 400, gain: 0.03, filterType: 'bandpass', q: 0.6, reverb: 0.4 });
        this._tone({ freq: 78, type: 'sine', dur: 0.6, gain: 0.05, reverb: 0.2 });
        break;
      case 'sync':
        [220, 329.63, 440, 554.37, 659.25].forEach(function (f, i) {
          this._tone({ freq: f, type: 'sine', dur: 2.2, gain: 0.045, delay: i * 0.055, reverb: 0.7 });
        }, this);
        this._noise({ dur: 1.2, freq: 600, toFreq: 3800, gain: 0.025, filterType: 'bandpass', reverb: 0.6 });
        break;
      case 'shard':
        [880, 1174.66, 1567.98].forEach(function (f, i) {
          this._tone({ freq: f, type: 'sine', dur: 0.38, gain: 0.036, delay: i * 0.055, reverb: 0.6 });
        }, this);
        break;
      case 'rewind':
        this._noise({ dur: 0.7, freq: 3000, toFreq: 160, gain: 0.055, filterType: 'bandpass', q: 0.5, reverb: 0.35 });
        this._tone({ freq: 420, toFreq: 52, type: 'sine', dur: 0.65, gain: 0.05, reverb: 0.25 });
        this._tone({ freq: 880, toFreq: 110, type: 'triangle', dur: 0.5, gain: 0.018, delay: 0.05 });
        break;
      case 'rewind-restore':
        [220, 330, 440].forEach(function (f, i) {
          this._tone({ freq: f, type: 'sine', dur: 0.75, gain: 0.027, delay: i * 0.05, reverb: 0.6 });
        }, this);
        this._noise({ dur: 0.5, freq: 200, toFreq: 1600, gain: 0.02, filterType: 'bandpass' });
        break;
      case 'undo':
        this._tone({ freq: 480, toFreq: 700, type: 'sine', dur: 0.11, gain: 0.026, reverb: 0.2 });
        break;
      case 'hint':
        this._tone({ freq: 523.25, type: 'sine', dur: 0.22, gain: 0.03, reverb: 0.4 });
        this._tone({ freq: 783.99, type: 'sine', dur: 0.28, gain: 0.02, delay: 0.08, reverb: 0.5 });
        break;
      case 'error':
        this._tone({ freq: 155, toFreq: 120, type: 'triangle', dur: 0.18, gain: 0.04 });
        break;
      case 'win':
        [261.63, 329.63, 392, 523.25, 659.25].forEach(function (f, i) {
          this._tone({ freq: f, type: 'sine', dur: 2.6, gain: 0.05, delay: i * 0.095, reverb: 0.8 });
        }, this);
        this._tone({ freq: 65.4, type: 'sine', dur: 2.4, gain: 0.06, reverb: 0.3 });
        this._noise({ dur: 1.6, freq: 800, toFreq: 6000, gain: 0.02, filterType: 'bandpass', reverb: 0.8 });
        break;
      case 'portal':
        this._tone({ freq: 220, toFreq: 880, type: 'sine', dur: 0.9, gain: 0.032, reverb: 0.7 });
        break;
      case 'start':
        this._tone({ freq: 55, type: 'sine', dur: 1.4, gain: 0.08, reverb: 0.25 });
        this._tone({ freq: 110, toFreq: 220, type: 'triangle', dur: 1.1, gain: 0.026, reverb: 0.5 });
        this._noise({ dur: 1.0, freq: 180, toFreq: 2600, gain: 0.025, filterType: 'bandpass', reverb: 0.5 });
        break;
      case 'ending':
        [146.83, 220, 293.66, 369.99, 440].forEach(function (f, i) {
          this._tone({ freq: f, type: 'sine', dur: 4.5, gain: 0.025, delay: i * 0.4, reverb: 0.85 });
        }, this);
        break;
      default:
        break;
    }
  };

  ChronoAudio.prototype.setMuted = function (muted) {
    this.muted = !!muted;
    this._savePrefs();
    if (!this.master || !this.ctx) return;
    var now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(this.muted ? 0.0001 : this.volume, now + 0.18);
  };

  ChronoAudio.prototype.toggleMute = function () {
    this.setMuted(!this.muted);
    return this.muted;
  };

  ChronoAudio.prototype.isMuted = function () { return this.muted; };

  ChronoAudio.prototype.suspend = function () {
    if (this.ctx && this.ctx.state === 'running') this.ctx.suspend();
  };

  ChronoAudio.prototype.resume = function () {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  };

  root.ChronoAudio = ChronoAudio;
})(typeof globalThis !== 'undefined' ? globalThis : this);
