/* =========================================================================
 * 时间悖论：失控实验室 — Canvas 场景与因果棋盘渲染
 * 所有视觉均为程序化绘制，无外部图片素材。
 * ========================================================================= */
(function (root) {
  'use strict';

  var TAU = Math.PI * 2;
  var MONO = '"Cascadia Mono", "Consolas", monospace';
  var DISPLAY = '"Bahnschrift", "Microsoft YaHei UI", "Noto Sans SC", sans-serif';
  var UI = '"Segoe UI", "Microsoft YaHei UI", sans-serif';

  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function hash2(x, y) {
    var n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
    return n - Math.floor(n);
  }
  function rgba(hex, alpha) {
    var h = hex.replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var r = parseInt(h.slice(0, 2), 16);
    var g = parseInt(h.slice(2, 4), 16);
    var b = parseInt(h.slice(4, 6), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }
  function roundRect(ctx, x, y, w, h, r) {
    var rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.lineTo(x + w - rr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
    ctx.lineTo(x + w, y + h - rr);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
    ctx.lineTo(x + rr, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
    ctx.lineTo(x, y + rr);
    ctx.quadraticCurveTo(x, y, x + rr, y);
    ctx.closePath();
  }
  function poly(ctx, points, close) {
    ctx.beginPath();
    for (var i = 0; i < points.length; i++) {
      if (i === 0) ctx.moveTo(points[i][0], points[i][1]);
      else ctx.lineTo(points[i][0], points[i][1]);
    }
    if (close !== false) ctx.closePath();
  }
  function seeded(n) {
    var x = Math.sin(n * 91.177 + 31.17) * 43758.5453;
    return x - Math.floor(x);
  }

  /* =====================================================================
     基础场景：DPR、缩放、生命周期
     ===================================================================== */
  class BaseScene {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.w = 1;
      this.h = 1;
      this.dpr = 1;
      this.running = false;
      this.reduced = false;
      this._raf = 0;
      this._last = 0;
      this._t0 = 0;
      this._onResize = this.resize.bind(this);
      window.addEventListener('resize', this._onResize, { passive: true });
      if (typeof ResizeObserver !== 'undefined') {
        this._ro = new ResizeObserver(this._onResize);
        this._ro.observe(canvas);
      }
      this.resize();
    }

    resize() {
      if (!this.canvas) return;
      var rect = this.canvas.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.w = rect.width;
      this.h = rect.height;
      var pw = Math.round(this.w * this.dpr);
      var ph = Math.round(this.h * this.dpr);
      if (this.canvas.width !== pw) this.canvas.width = pw;
      if (this.canvas.height !== ph) this.canvas.height = ph;
      if (this.ctx) this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }

    start() {
      this.resize();
      if (this.running) return;
      this.running = true;
      this._t0 = performance.now();
      this._last = this._t0;
      var self = this;
      var loop = function (now) {
        if (!self.running) return;
        var dt = Math.min(0.05, Math.max(0.001, (now - self._last) / 1000));
        self._last = now;
        try {
          self.render((now - self._t0) / 1000, dt);
        } catch (error) {
          // 渲染异常不阻塞游戏：记录后尝试有限次恢复，仍失败则保持当前帧。
          if (typeof self.onRenderError === 'function') self.onRenderError(error);
          self._renderFailures = (self._renderFailures || 0) + 1;
          if (self._renderFailures <= 2) {
            setTimeout(function () {
              if (self.running) {
                self._last = performance.now();
                self._raf = requestAnimationFrame(loop);
              }
            }, 450);
            return;
          }
          self.running = false;
          return;
        }
        self._renderFailures = 0;
        self._raf = requestAnimationFrame(loop);
      };
      this._raf = requestAnimationFrame(loop);
    }

    stop() {
      this.running = false;
      if (this._raf) cancelAnimationFrame(this._raf);
      this._raf = 0;
    }

    resizeNow() { this.resize(); }
    setReducedMotion(value) { this.reduced = !!value; }
    render() {}
  }

  /* =====================================================================
     棋盘渲染
     ===================================================================== */
  var LEVEL_ACCENTS = {
    1: { accent: '#ffc15e', second: '#64f5d2' },
    2: { accent: '#74d8ff', second: '#64f5d2' },
    3: { accent: '#ffc15e', second: '#e7a46a' },
    4: { accent: '#e7a46a', second: '#64f5d2' },
    5: { accent: '#e7a46a', second: '#64f5d2' },
    6: { accent: '#64f5d2', second: '#74d8ff' },
    7: { accent: '#e7a46a', second: '#74d8ff' },
    8: { accent: '#ece7db', second: '#64f5d2' }
  };
  var ECHO_COLORS = ['#64f5d2', '#74d8ff', '#ffc15e'];

  class ChronoRenderer extends BaseScene {
    constructor(canvas) {
      super(canvas);
      this.game = null;
      this.level = null;
      this.time = 0;
      this.layout = null;
      this.hover = null;
      this.blockFx = null;
      this.rewindFx = null;
      this.winFx = null;
      this.syncFx = null;
      this.sealFx = null;
      this.particles = [];
      this.visual = { player: null, echoes: {}, crates: {} };
      this.doorAnims = {};
      this.plateAnims = {};
      this.lastLoopPath = [];
      this.showTrail = true;
      this._lastStatus = 'playing';
    }

    setGame(game) {
      this.game = game;
      this.level = game ? game.level : null;
      this.time = 0;
      this.hover = null;
      this.blockFx = null;
      this.rewindFx = null;
      this.winFx = null;
      this.syncFx = null;
      this.particles = [];
      this.visual = { player: null, echoes: {}, crates: {} };
      this.doorAnims = {};
      this.plateAnims = {};
      this.lastLoopPath = [];
      this._lastStatus = game ? game.status : 'playing';
      if (!game) return;
      this.palette = LEVEL_ACCENTS[this.level.id] || LEVEL_ACCENTS[1];
      this._snapVisuals();
      game.doors.forEach((d) => { this.doorAnims[d.id] = { value: d.open ? 1 : 0 }; });
      var plates = game.plates.concat(game.syncPlates);
      plates.forEach((p) => { this.plateAnims[p.id] = { value: p.pressed ? 1 : 0 }; });
      this.resize();
    }

    _snapVisuals() {
      if (!this.game) return;
      this.visual.player = { x: this.game.player.x, y: this.game.player.y, facing: this.game.player.facing };
      this.visual.echoes = {};
      this.game.echoes.forEach((e) => {
        this.visual.echoes[e.id] = { x: e.x, y: e.y, facing: e.facing };
      });
      this.visual.crates = {};
      this.game.crates.forEach((c) => {
        this.visual.crates[c.id] = { x: c.x, y: c.y };
      });
    }

    cellAtPoint(clientX, clientY) {
      if (!this.game || !this.layout) return null;
      var rect = this.canvas.getBoundingClientRect();
      var px = clientX - rect.left;
      var py = clientY - rect.top;
      var L = this.layout;
      var x = Math.floor((px - L.bx) / L.tile);
      var y = Math.floor((py - L.by) / L.tile);
      if (x < 0 || y < 0 || x >= this.game.width || y >= this.game.height) return null;
      return { x: x, y: y, cell: this.game.cellAt(x, y) };
    }

    setHover(cell) { this.hover = cell; }

    setReducedMotion(value) {
      super.setReducedMotion(value);
      if (value) {
        this.particles = [];
      }
    }

    showBlocked(x, y) {
      if (this.reduced) return;
      this.blockFx = { x: x, y: y, life: 0.45, max: 0.45 };
    }

    showRewind(path, loop, echoNo) {
      if (this.reduced) {
        this._snapVisuals();
        return;
      }
      this._snapVisuals();
      var pts = path && path.length ? path.slice() : [];
      this.rewindFx = {
        life: 0.82,
        max: 0.82,
        path: pts,
        loop: loop || 2,
        echoNo: echoNo || 1
      };
    }

    showSync() {
      if (this.reduced) return;
      this.syncFx = { life: 1.4, max: 1.4 };
      this._spawnParticles(this.w / 2, this.h / 2, 26, ['#64f5d2', '#d8fff4']);
    }

    showSeal(x, y) {
      if (this.reduced) return;
      this.sealFx = { x: x, y: y, life: 0.75, max: 0.75 };
    }

    showWin() {
      this.winFx = { life: 2.1, max: 2.1 };
      if (!this.reduced) {
        var goal = this.game ? this.game.exit : null;
        if (goal) {
          var c = this.cellCenter(goal.x, goal.y);
          this._spawnParticles(c.x, c.y, 54, ['#ece7db', '#64f5d2', '#e7a46a', '#ffc15e']);
        }
      }
    }

    _spawnParticles(x, y, count, colors) {
      for (var i = 0; i < count; i++) {
        var angle = Math.random() * TAU;
        var speed = 30 + Math.random() * 130;
        this.particles.push({
          x: x, y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 20,
          life: 0.7 + Math.random() * 1.1,
          max: 1.8,
          size: 1 + Math.random() * 2.5,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    }

    _cellRect(x, y) {
      var L = this.layout;
      return { x: L.bx + x * L.tile, y: L.by + y * L.tile, w: L.tile, h: L.tile };
    }
    cellCenter(x, y) {
      var L = this.layout;
      return { x: L.bx + (x + 0.5) * L.tile, y: L.by + (y + 0.5) * L.tile };
    }

    _computeLayout() {
      var w = this.w;
      var h = this.h;
      var side = w < 520 ? 12 : 26;
      var top = w < 520 ? 30 : 38;
      var bottom = w < 520 ? 14 : 22;
      var gw = this.game.width;
      var gh = this.game.height;
      var tile = Math.min((w - side * 2) / gw, (h - top - bottom) / gh);
      tile = Math.max(tile, 8);
      var bw = tile * gw;
      var bh = tile * gh;
      var bx = (w - bw) / 2;
      var by = top + Math.max(0, (h - top - bottom - bh) / 2);
      this.layout = { tile: tile, bx: bx, by: by, bw: bw, bh: bh, gw: gw, gh: gh, side: side };
    }

    render(t, dt) {
      if (!this.game) return;
      this.time = this.reduced ? 0 : t;
      this._computeLayout();
      this._updateAnimations(dt);
      var ctx = this.ctx;
      var W = this.w;
      var H = this.h;
      ctx.clearRect(0, 0, W, H);

      var shakeX = 0;
      var shakeY = 0;
      if (this.rewindFx && !this.reduced) {
        var p = 1 - this.rewindFx.life / this.rewindFx.max;
        var amp = 3.5 * (1 - p);
        shakeX = Math.sin(p * 57) * amp;
        shakeY = Math.cos(p * 71) * amp;
      } else if (this.winFx && !this.reduced) {
        var wq = 1 - this.winFx.life / this.winFx.max;
        var wamp = 2.5 * Math.max(0, 1 - wq * 4);
        shakeX = Math.sin(wq * 80) * wamp;
        shakeY = Math.cos(wq * 67) * wamp;
      }
      ctx.save();
      ctx.translate(shakeX, shakeY);
      this._drawStage(t);
      this._drawBoard(t);
      this._drawCausalLinks(t);
      this._drawTrails(t);
      this._drawFloorObjects(t);
      this._drawDoors(t);
      this._drawCrates(t);
      this._drawEchoes(t);
      this._drawPlayer(t);
      this._drawParticles(dt);
      this._drawHover(t);
      this._drawOverlays(t);
      ctx.restore();
      this._drawScreenAtmosphere(t);
    }

    _updateAnimations(dt) {
      var game = this.game;
      if (!game) return;
      var rate = 1 - Math.exp(-dt * 12);
      var mapRate = 1 - Math.exp(-dt * 14);
      function approach(obj, tx, ty, facing, rate) {
        obj.x = lerp(obj.x, tx, rate);
        obj.y = lerp(obj.y, ty, rate);
        if (facing) obj.facing = facing;
      }
      if (this.visual.player) approach(this.visual.player, game.player.x, game.player.y, game.player.facing, rate);
      var seenEchoes = {};
      game.echoes.forEach((e) => {
        seenEchoes[e.id] = true;
        if (!this.visual.echoes[e.id]) {
          this.visual.echoes[e.id] = { x: e.x, y: e.y, facing: e.facing };
        } else {
          approach(this.visual.echoes[e.id], e.x, e.y, e.facing, rate);
        }
      });
      Object.keys(this.visual.echoes).forEach((id) => {
        if (!seenEchoes[id]) delete this.visual.echoes[id];
      });
      var seenCrates = {};
      game.crates.forEach((c) => {
        seenCrates[c.id] = true;
        if (!this.visual.crates[c.id]) this.visual.crates[c.id] = { x: c.x, y: c.y };
        else approach(this.visual.crates[c.id], c.x, c.y, null, rate * 0.85);
      });
      Object.keys(this.visual.crates).forEach((id) => {
        if (!seenCrates[id]) delete this.visual.crates[id];
      });
      game.doors.forEach((d) => {
        if (!this.doorAnims[d.id]) this.doorAnims[d.id] = { value: d.open ? 1 : 0 };
        this.doorAnims[d.id].value = lerp(this.doorAnims[d.id].value, d.open ? 1 : 0, mapRate);
      });
      game.plates.concat(game.syncPlates).forEach((p) => {
        if (!this.plateAnims[p.id]) this.plateAnims[p.id] = { value: p.pressed ? 1 : 0 };
        this.plateAnims[p.id].value = lerp(this.plateAnims[p.id].value, p.pressed ? 1 : 0, mapRate);
      });
      if (this.blockFx) this.blockFx.life -= dt;
      if (this.blockFx && this.blockFx.life <= 0) this.blockFx = null;
      if (this.rewindFx) {
        this.rewindFx.life -= dt;
        if (this.rewindFx.life <= 0) this.rewindFx = null;
      }
      if (this.winFx) {
        this.winFx.life -= dt;
        if (this.winFx.life <= 0) this.winFx = null;
      }
      if (this.syncFx) {
        this.syncFx.life -= dt;
        if (this.syncFx.life <= 0) this.syncFx = null;
      }
      if (this.sealFx) {
        this.sealFx.life -= dt;
        if (this.sealFx.life <= 0) this.sealFx = null;
      }
      for (var i = this.particles.length - 1; i >= 0; i--) {
        var pa = this.particles[i];
        pa.life -= dt;
        if (pa.life <= 0) { this.particles.splice(i, 1); continue; }
        pa.x += pa.vx * dt;
        pa.y += pa.vy * dt;
        pa.vx *= 0.985;
        pa.vy = pa.vy * 0.985 + 16 * dt;
      }
    }

    /* ---------------- stage atmosphere ---------------- */
    _drawStage(t) {
      var ctx = this.ctx;
      var W = this.w;
      var H = this.h;
      var accent = this.palette ? this.palette.accent : '#64f5d2';
      var second = this.palette ? this.palette.second : '#64f5d2';
      var bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#071015');
      bg.addColorStop(0.55, '#050b0f');
      bg.addColorStop(1, '#070d11');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      var g1 = ctx.createRadialGradient(W * 0.5, H * 0.2, 0, W * 0.5, H * 0.2, Math.max(W, H) * 0.55);
      g1.addColorStop(0, rgba(second, 0.105));
      g1.addColorStop(0.5, rgba(second, 0.03));
      g1.addColorStop(1, rgba(second, 0));
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, W, H);

      var g2 = ctx.createRadialGradient(W * 0.14, H * 0.86, 0, W * 0.14, H * 0.86, Math.max(W, H) * 0.45);
      g2.addColorStop(0, rgba(accent, 0.055));
      g2.addColorStop(1, rgba(accent, 0));
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, W, H);

      // 极细的实验室坐标线
      ctx.save();
      ctx.strokeStyle = 'rgba(120, 156, 155, 0.055)';
      ctx.lineWidth = 1;
      var gap = Math.max(42, Math.min(W, H) / 12);
      for (var x = W / 2 % gap; x < W; x += gap) {
        ctx.beginPath(); ctx.moveTo(Math.round(x) + 0.5, 0); ctx.lineTo(Math.round(x) + 0.5, H); ctx.stroke();
      }
      for (var y = H / 2 % gap; y < H; y += gap) {
        ctx.beginPath(); ctx.moveTo(0, Math.round(y) + 0.5); ctx.lineTo(W, Math.round(y) + 0.5); ctx.stroke();
      }
      ctx.restore();

      // 舞台内部刻度
      ctx.save();
      ctx.fillStyle = 'rgba(141, 170, 168, 0.26)';
      ctx.font = '7px ' + MONO;
      ctx.textAlign = 'left';
      if (this.w > 640) {
        for (var i = 0; i < 12; i++) {
          ctx.fillRect(10, (H / 12) * i, i % 3 === 0 ? 5 : 3, 1);
          ctx.fillRect(W - 10 - (i % 3 === 0 ? 5 : 3), (H / 12) * i, i % 3 === 0 ? 5 : 3, 1);
        }
      }
      ctx.restore();

      // 背景缓慢脉冲的因果环
      if (!this.reduced) {
        var cx = W * 0.5;
        var cy = H * 0.5;
        var maxR = Math.min(W, H) * 0.58;
        ctx.save();
        ctx.globalAlpha = 0.24;
        ctx.strokeStyle = rgba(second, 0.5);
        ctx.lineWidth = 1;
        for (var k = 0; k < 3; k++) {
          var rr = maxR * (0.55 + k * 0.16) + Math.sin(t * 0.22 + k) * 8;
          ctx.beginPath();
          ctx.ellipse(cx, cy, rr, rr * 0.42, -0.12, 0, TAU);
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    _drawBoard(t) {
      var ctx = this.ctx;
      var L = this.layout;
      var accent = this.palette ? this.palette.accent : '#64f5d2';
      var second = this.palette ? this.palette.second : '#64f5d2';
      var tile = L.tile;

      // 棋盘落影
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.66)';
      ctx.shadowBlur = 38;
      ctx.shadowOffsetY = 18;
      roundRect(ctx, L.bx - 4, L.by - 4, L.bw + 8, L.bh + 8, 8);
      ctx.fillStyle = '#050b0e';
      ctx.fill();
      ctx.restore();

      // 外框
      roundRect(ctx, L.bx - 5.5, L.by - 5.5, L.bw + 11, L.bh + 11, 9);
      ctx.fillStyle = 'rgba(12, 20, 24, 0.9)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(141, 171, 174, 0.24)';
      ctx.lineWidth = 1;
      ctx.stroke();
      roundRect(ctx, L.bx - 1, L.by - 1, L.bw + 2, L.bh + 2, 6);
      ctx.strokeStyle = rgba(accent, 0.18);
      ctx.stroke();

      // 内侧地面底
      ctx.save();
      roundRect(ctx, L.bx, L.by, L.bw, L.bh, 5);
      ctx.clip();
      var floorBg = ctx.createLinearGradient(L.bx, L.by, L.bx, L.by + L.bh);
      floorBg.addColorStop(0, '#0a1419');
      floorBg.addColorStop(0.55, '#081116');
      floorBg.addColorStop(1, '#060d11');
      ctx.fillStyle = floorBg;
      ctx.fillRect(L.bx, L.by, L.bw, L.bh);

      // 大圆环装饰
      ctx.save();
      ctx.strokeStyle = rgba(second, 0.075);
      ctx.lineWidth = 1;
      var cx = L.bx + L.bw / 2;
      var cy = L.by + L.bh / 2;
      for (var i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, Math.min(L.bw, L.bh) * (0.16 + i * 0.11), 0, TAU);
        ctx.stroke();
      }
      ctx.setLineDash([2, 9]);
      ctx.beginPath();
      ctx.arc(cx, cy, Math.min(L.bw, L.bh) * 0.48, 0, TAU);
      ctx.stroke();
      ctx.restore();

      this._drawFloorCells(t);
      this._drawWalls(t);
      this._drawBoardTicks();
      ctx.restore();

      // 棋盘四角铆钉/支架
      ctx.save();
      ctx.strokeStyle = rgba(accent, 0.35);
      ctx.lineWidth = 1;
      var corners = [
        [L.bx - 5.5, L.by - 5.5, 1, 1],
        [L.bx + L.bw + 5.5, L.by - 5.5, -1, 1],
        [L.bx - 5.5, L.by + L.bh + 5.5, 1, -1],
        [L.bx + L.bw + 5.5, L.by + L.bh + 5.5, -1, -1]
      ];
      for (var c = 0; c < corners.length; c++) {
        var co = corners[c];
        ctx.beginPath();
        ctx.moveTo(co[0] + 10 * co[2], co[1]);
        ctx.lineTo(co[0], co[1]);
        ctx.lineTo(co[0], co[1] + 10 * co[3]);
        ctx.stroke();
      }
      ctx.restore();
    }

    _drawFloorCells(t) {
      var ctx = this.ctx;
      var L = this.layout;
      var game = this.game;
      var tile = L.tile;
      for (var y = 0; y < game.height; y++) {
        for (var x = 0; x < game.width; x++) {
          var cell = game.cellAt(x, y);
          if (!cell || cell.wall) continue;
          var px = L.bx + x * tile;
          var py = L.by + y * tile;
          var v = hash2(x, y);
          var base = v > 0.58 ? 'rgba(25, 43, 48, 0.44)' : 'rgba(18, 33, 38, 0.31)';
          if (cell.exit) base = 'rgba(45, 55, 48, 0.5)';
          ctx.fillStyle = base;
          ctx.fillRect(px, py, tile, tile);

          // 地砖接缝
          ctx.strokeStyle = 'rgba(135, 170, 166, 0.075)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(px, py + tile - 0.5);
          ctx.lineTo(px + tile, py + tile - 0.5);
          ctx.moveTo(px + tile - 0.5, py);
          ctx.lineTo(px + tile - 0.5, py + tile);
          ctx.stroke();

          // 细小的地面标记
          if (v > 0.82) {
            ctx.fillStyle = 'rgba(145, 185, 176, 0.19)';
            ctx.fillRect(px + tile * 0.18, py + tile * 0.2, 2, 1);
            ctx.fillRect(px + tile * 0.18, py + tile * 0.2, 1, 2);
          }
          // 靠近地面中心的测距刻线
          if (tile > 34 && v > 0.92) {
            ctx.save();
            ctx.strokeStyle = 'rgba(134, 174, 168, 0.12)';
            ctx.beginPath();
            ctx.arc(px + tile / 2, py + tile / 2, tile * 0.27, 0, TAU);
            ctx.stroke();
            ctx.restore();
          }
        }
      }
    }

    _drawWalls(t) {
      var ctx = this.ctx;
      var L = this.layout;
      var game = this.game;
      var tile = L.tile;
      for (var y = 0; y < game.height; y++) {
        for (var x = 0; x < game.width; x++) {
          var cell = game.cellAt(x, y);
          if (!cell || !cell.wall) continue;
          var px = L.bx + x * tile;
          var py = L.by + y * tile;
          var above = game.cellAt(x, y - 1);
          var below = game.cellAt(x, y + 1);
          var left = game.cellAt(x - 1, y);
          var right = game.cellAt(x + 1, y);
          var v = hash2(x * 7.1, y * 3.7);
          var grad = ctx.createLinearGradient(px, py, px + tile * 0.35, py + tile);
          grad.addColorStop(0, v > 0.5 ? '#38525c' : '#30474f');
          grad.addColorStop(0.16, '#293f47');
          grad.addColorStop(0.65, '#192a31');
          grad.addColorStop(1, '#0c171c');
          ctx.fillStyle = grad;
          ctx.fillRect(px, py, tile, tile);
          // 立面阴影
          ctx.fillStyle = 'rgba(2, 6, 8, 0.3)';
          ctx.fillRect(px, py + tile * 0.82, tile, tile * 0.18);
          // 高光边
          if (!above || !above.wall) {
            ctx.fillStyle = 'rgba(218, 242, 234, 0.31)';
            ctx.fillRect(px, py, tile, Math.max(1, tile * 0.045));
            ctx.fillStyle = 'rgba(187, 219, 212, 0.07)';
            ctx.fillRect(px, py + Math.max(1, tile * 0.045), tile, Math.max(1, tile * 0.08));
          }
          if (!left || !left.wall) {
            ctx.fillStyle = 'rgba(203, 233, 225, 0.18)';
            ctx.fillRect(px, py, Math.max(1, tile * 0.035), tile);
          }
          if (!below || !below.wall) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.46)';
            ctx.fillRect(px, py + tile - Math.max(1, tile * 0.075), tile, Math.max(1, tile * 0.075));
          }
          if (!right || !right.wall) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
            ctx.fillRect(px + tile - Math.max(1, tile * 0.055), py, Math.max(1, tile * 0.055), tile);
          }
          // 面板刻线与铆钉
          if (tile > 30) {
            ctx.save();
            ctx.strokeStyle = 'rgba(158, 192, 187, 0.075)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(px + tile * 0.16, py + tile * 0.24);
            ctx.lineTo(px + tile * 0.56, py + tile * 0.24);
            ctx.stroke();
            ctx.restore();
          }
          if (tile > 36 && v > 0.62) {
            ctx.fillStyle = 'rgba(206, 230, 223, 0.19)';
            ctx.beginPath();
            ctx.arc(px + tile * 0.23, py + tile * 0.25, Math.max(1, tile * 0.018), 0, TAU);
            ctx.fill();
          }
          // 管线细节
          if (tile > 42 && v > 0.86) {
            ctx.save();
            ctx.strokeStyle = 'rgba(100, 245, 210, 0.12)';
            ctx.beginPath();
            ctx.moveTo(px + tile * 0.16, py + tile * 0.54);
            ctx.lineTo(px + tile * 0.84, py + tile * 0.54);
            ctx.stroke();
            ctx.restore();
          }
        }
      }
    }

    _drawBoardTicks() {
      var L = this.layout;
      var game = this.game;
      if (L.tile < 25) return;
      var ctx = this.ctx;
      var accent = this.palette ? this.palette.accent : '#64f5d2';
      ctx.save();
      ctx.font = '7px ' + MONO;
      ctx.fillStyle = 'rgba(146, 174, 170, 0.38)';
      ctx.strokeStyle = 'rgba(146, 174, 170, 0.22)';
      ctx.lineWidth = 1;
      ctx.textAlign = 'center';
      for (var x = 0; x < game.width; x++) {
        var cx = L.bx + (x + 0.5) * L.tile;
        ctx.fillText(String.fromCharCode(65 + (x % 26)), cx, L.by - 10);
        ctx.beginPath();
        ctx.moveTo(L.bx + x * L.tile, L.by - 5);
        ctx.lineTo(L.bx + x * L.tile, L.by - 2);
        ctx.stroke();
      }
      ctx.textAlign = 'right';
      for (var y = 0; y < game.height; y++) {
        var cy = L.by + (y + 0.5) * L.tile + 2;
        ctx.fillText(String(y + 1).padStart(2, '0'), L.bx - 9, cy);
        ctx.beginPath();
        ctx.moveTo(L.bx - 5, L.by + y * L.tile);
        ctx.lineTo(L.bx - 2, L.by + y * L.tile);
        ctx.stroke();
      }
      ctx.restore();
    }

    /* ---------------- paths ---------------- */
    /* ---------------- causality links ---------------- */
    _drawCausalLinks(t) {
      var ctx = this.ctx;
      var game = this.game;
      var L = this.layout;
      var self = this;
      ctx.save();
      ctx.beginPath();
      ctx.rect(L.bx, L.by, L.bw, L.bh);
      ctx.clip();
      ctx.globalCompositeOperation = 'lighter';
      function link(ax, ay, bx, by, color, alpha, offset) {
        var a = self.cellCenter(ax, ay);
        var b = self.cellCenter(bx, by);
        ctx.save();
        ctx.strokeStyle = rgba(color, alpha);
        ctx.lineWidth = Math.max(1, L.tile * 0.018);
        ctx.setLineDash([Math.max(2, L.tile * 0.08), Math.max(4, L.tile * 0.18)]);
        ctx.lineDashOffset = -((t * 22 + offset * 30) % 1000);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        // 能量头沿因果线移动
        var p = self.reduced ? 0.55 : (t * 0.24 + offset) % 1;
        var px = lerp(a.x, b.x, p);
        var py = lerp(a.y, b.y, p);
        ctx.setLineDash([]);
        ctx.fillStyle = rgba(color, alpha * 2.4);
        ctx.beginPath();
        ctx.arc(px, py, Math.max(1.1, L.tile * 0.024), 0, TAU);
        ctx.fill();
        ctx.restore();
      }
      game.plates.forEach(function (plate, i) {
        if (!plate.pressed) return;
        var color = plate.group === 'A' ? '#ffc15e' : '#74d8ff';
        game.doors.forEach(function (door) {
          if (door.group === plate.group) link(plate.x, plate.y, door.x, door.y, color, 0.2, i * 0.35 + door.x * 0.01);
        });
      });
      if (game.syncPlates.length) {
        var syncGate = game.doors.find(function (d) { return d.kind === 'sync'; });
        if (syncGate) {
          game.syncPlates.forEach(function (node, i) {
            if (!node.pressed) return;
            link(node.x, node.y, syncGate.x, syncGate.y, node.cradle ? '#e7a46a' : '#64f5d2', game.syncLatched ? 0.18 : 0.1, i * 0.21);
          });
        }
      }
      ctx.restore();
    }

    _drawTrails(t) {
      if (this.reduced) this.showTrail = true;
      var ctx = this.ctx;
      var game = this.game;
      var L = this.layout;
      var tile = L.tile;

      // 当前轮轨迹
      var current = [{ x: game.playerStart.x, y: game.playerStart.y }].concat(
        game.currentActions.map(function (a) { return { x: a.x, y: a.y }; })
      );
      if (this.showTrail && current.length > 1) {
        ctx.save();
        ctx.lineWidth = Math.max(1, tile * 0.034);
        ctx.strokeStyle = 'rgba(236, 231, 219, 0.18)';
        ctx.setLineDash([Math.max(2, tile * 0.08), Math.max(3, tile * 0.14)]);
        ctx.beginPath();
        current.forEach(function (pt, i) {
          var c = this.cellCenter(pt.x, pt.y);
          if (i === 0) ctx.moveTo(c.x, c.y); else ctx.lineTo(c.x, c.y);
        }, this);
        ctx.stroke();
        ctx.restore();
      }

      // 回响轨迹
      game.echoes.forEach((echo, idx) => {
        if (!echo.path || !echo.path.length) return;
        var color = ECHO_COLORS[(echo.no - 1) % ECHO_COLORS.length];
        var pts = [{ x: game.playerStart.x, y: game.playerStart.y }].concat(echo.path);
        ctx.save();
        ctx.lineWidth = Math.max(1, tile * 0.022);
        ctx.strokeStyle = rgba(color, 0.24);
        ctx.setLineDash([Math.max(1, tile * 0.06), Math.max(3, tile * 0.16)]);
        ctx.beginPath();
        pts.forEach(function (pt, i) {
          var c = this.cellCenter(pt.x, pt.y);
          if (i === 0) ctx.moveTo(c.x, c.y); else ctx.lineTo(c.x, c.y);
        }, this);
        ctx.stroke();
        // 路径节点
        ctx.setLineDash([]);
        ctx.fillStyle = rgba(color, 0.2);
        var step = Math.max(1, Math.floor(pts.length / 9));
        for (var p = 0; p < pts.length; p += step) {
          var cc = this.cellCenter(pts[p].x, pts[p].y);
          ctx.beginPath();
          ctx.arc(cc.x, cc.y, 1.3, 0, TAU);
          ctx.fill();
        }
        ctx.restore();
      });
    }

    /* ---------------- floor devices ---------------- */
    _drawFloorObjects(t) {
      var game = this.game;
      game.plates.forEach((p) => this._drawPlate(p, t));
      game.syncPlates.forEach((p) => this._drawPlate(p, t));
      game.sealTriggers.forEach((s) => this._drawSealTrigger(s, t));
      if (!game.shardCollected) {
        game.shardCells.forEach((s) => this._drawShard(s, t));
      }
      game.exitCells.forEach((e) => this._drawExit(e, t));
    }

    _drawPlate(p, t) {
      var ctx = this.ctx;
      var L = this.layout;
      var tile = L.tile;
      var c = this.cellCenter(p.x, p.y);
      var color = p.group === 'A' ? '#ffc15e' : p.group === 'B' ? '#74d8ff' : p.cradle ? '#e7a46a' : '#64f5d2';
      var anim = this.plateAnims[p.id] ? this.plateAnims[p.id].value : 0;
      var size = tile * (p.kind === 'sync' ? 0.62 : 0.68);
      ctx.save();
      ctx.translate(c.x, c.y);

      // 基座
      if (p.kind === 'sync') {
        if (p.cradle) {
          roundRect(ctx, -size / 2, -size / 2, size, size, 2);
          ctx.fillStyle = 'rgba(5, 12, 14, 0.86)';
          ctx.fill();
          ctx.strokeStyle = rgba(color, 0.34 + anim * 0.35);
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.strokeStyle = rgba(color, 0.2);
          roundRect(ctx, -size * 0.37, -size * 0.37, size * 0.74, size * 0.74, 1);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, size * 0.48, 0, TAU);
          ctx.fillStyle = 'rgba(5, 12, 14, 0.86)';
          ctx.fill();
          ctx.strokeStyle = rgba(color, 0.38 + anim * 0.35);
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(0, 0, size * 0.36, 0, TAU);
          ctx.strokeStyle = rgba(color, 0.16);
          ctx.stroke();
        }
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.48, 0, TAU);
        ctx.fillStyle = 'rgba(5, 12, 14, 0.86)';
        ctx.fill();
        ctx.strokeStyle = rgba(color, 0.4 + anim * 0.3);
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.4, 0, TAU);
        ctx.strokeStyle = rgba(color, 0.16);
        ctx.stroke();
      }

      // 按压光环
      if (anim > 0.01) {
        ctx.save();
        ctx.globalAlpha = anim * 0.55;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, size * (0.5 + 0.12 * Math.sin(t * 2.5)), 0, TAU);
        ctx.stroke();
        ctx.restore();
        ctx.fillStyle = rgba(color, 0.12 + anim * 0.15);
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.37, 0, TAU);
        ctx.fill();
      }

      // 标记
      ctx.fillStyle = anim > 0.25 ? color : rgba(color, 0.8);
      ctx.font = '600 ' + Math.max(8, Math.min(13, tile * 0.19)) + 'px ' + MONO;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (p.kind === 'sync') {
        ctx.fillText(String(p.node), 0, 0.5);
        if (p.cradle) {
          ctx.fillStyle = rgba(color, 0.65);
          ctx.fillRect(-size * 0.18, -size * 0.29, size * 0.36, 2);
        }
      } else {
        ctx.fillText(p.group, 0, 0.5);
      }
      // 四角刻度
      if (tile > 34) {
        ctx.strokeStyle = rgba(color, 0.18 + anim * 0.2);
        ctx.lineWidth = 1;
        for (var a = 0; a < 4; a++) {
          ctx.save();
          ctx.rotate(a * Math.PI / 2 + Math.PI / 4);
          ctx.beginPath();
          ctx.moveTo(size * 0.58, 0);
          ctx.lineTo(size * 0.66, 0);
          ctx.stroke();
          ctx.restore();
        }
      }
      ctx.restore();
    }

    _drawSealTrigger(s, t) {
      var ctx = this.ctx;
      var tile = this.layout.tile;
      var c = this.cellCenter(s.x, s.y);
      var active = this.game.sealTriggered;
      var color = '#ff6b8a';
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.strokeStyle = rgba(color, active ? 0.6 : 0.3);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-tile * 0.22, -tile * 0.07);
      ctx.lineTo(tile * 0.2, -tile * 0.12);
      ctx.lineTo(tile * 0.12, tile * 0.16);
      ctx.lineTo(-tile * 0.17, tile * 0.1);
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = rgba(color, active ? 0.13 : 0.035);
      ctx.fill();
      ctx.fillStyle = active ? color : rgba(color, 0.55);
      ctx.font = '600 ' + Math.max(7, tile * 0.15) + 'px ' + MONO;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('v', 0, 0.5);
      if (active && !this.reduced) {
        ctx.globalAlpha = 0.3 + 0.2 * Math.sin(t * 6);
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.arc(0, 0, tile * 0.34, 0, TAU);
        ctx.stroke();
      }
      ctx.restore();
    }

    _drawShard(s, t) {
      var ctx = this.ctx;
      var tile = this.layout.tile;
      var c = this.cellCenter(s.x, s.y);
      var bob = this.reduced ? 0 : Math.sin(t * 2.2 + s.x) * tile * 0.045;
      var size = tile * 0.17;
      ctx.save();
      ctx.translate(c.x, c.y - tile * 0.08 + bob);
      // 光晕
      var g = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 2.7);
      g.addColorStop(0, 'rgba(255, 193, 94, 0.18)');
      g.addColorStop(1, 'rgba(255, 193, 94, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(-size * 3, -size * 3, size * 6, size * 6);
      // 轨道
      ctx.strokeStyle = 'rgba(255, 193, 94, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 1.8, size * 0.52, this.reduced ? 0 : t * 0.5, 0, TAU);
      ctx.stroke();
      // 晶体
      ctx.rotate(this.reduced ? 0 : t * 0.8);
      poly(ctx, [[0, -size], [size * 0.7, 0], [0, size], [-size * 0.7, 0]]);
      var grad = ctx.createLinearGradient(0, -size, 0, size);
      grad.addColorStop(0, '#fff4cf');
      grad.addColorStop(0.45, '#ffc15e');
      grad.addColorStop(1, '#b7723c');
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 243, 204, 0.75)';
      ctx.stroke();
      ctx.restore();
    }

    _drawExit(e, t) {
      var ctx = this.ctx;
      var tile = this.layout.tile;
      var c = this.cellCenter(e.x, e.y);
      var pulse = this.reduced ? 0.5 : 0.5 + Math.sin(t * 1.8) * 0.12;
      var accent = this.palette ? this.palette.second : '#64f5d2';
      ctx.save();
      ctx.translate(c.x, c.y);
      // 地面光池
      var g = ctx.createRadialGradient(0, 0, 0, 0, 0, tile * 0.8);
      g.addColorStop(0, rgba(accent, 0.22));
      g.addColorStop(0.42, rgba(accent, 0.07));
      g.addColorStop(1, rgba(accent, 0));
      ctx.fillStyle = g;
      ctx.fillRect(-tile, -tile, tile * 2, tile * 2);
      // 传送环
      ctx.strokeStyle = rgba(accent, 0.72);
      ctx.lineWidth = Math.max(1, tile * 0.018);
      ctx.beginPath();
      ctx.ellipse(0, tile * 0.14, tile * 0.33, tile * 0.16, 0, 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = rgba(accent, 0.24);
      ctx.beginPath();
      ctx.ellipse(0, tile * 0.14, tile * 0.42, tile * 0.22, 0, 0, TAU);
      ctx.stroke();
      // 光柱
      var beam = ctx.createLinearGradient(0, -tile * 0.55, 0, tile * 0.16);
      beam.addColorStop(0, rgba(accent, 0));
      beam.addColorStop(0.15, rgba(accent, 0.18 * pulse));
      beam.addColorStop(1, rgba(accent, 0.52 * pulse));
      ctx.fillStyle = beam;
      ctx.beginPath();
      ctx.moveTo(-tile * 0.14, tile * 0.12);
      ctx.lineTo(-tile * 0.055, -tile * 0.58);
      ctx.lineTo(tile * 0.055, -tile * 0.58);
      ctx.lineTo(tile * 0.14, tile * 0.12);
      ctx.closePath();
      ctx.fill();
      // 旋转刻线
      if (!this.reduced) {
        ctx.save();
        ctx.rotate(t * 0.55);
        ctx.setLineDash([2, 7]);
        ctx.strokeStyle = rgba(accent, 0.42);
        ctx.beginPath();
        ctx.arc(0, tile * 0.05, tile * 0.3, 0, TAU);
        ctx.stroke();
        ctx.restore();
      }
      // 底部铭牌
      ctx.fillStyle = rgba(accent, 0.56);
      ctx.font = '7px ' + MONO;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('EXIT', 0, tile * 0.36);
      ctx.restore();
    }

    /* ---------------- doors ---------------- */
    _drawDoors(t) {
      var ctx = this.ctx;
      var tile = this.layout.tile;
      var game = this.game;
      game.doors.forEach((d) => {
        var color = d.group === 'A' ? '#ffc15e' : d.group === 'B' ? '#74d8ff' : d.group === 'V' ? '#ff6b8a' : '#64f5d2';
        var anim = this.doorAnims[d.id] ? this.doorAnims[d.id].value : (d.open ? 1 : 0);
        var px = this.layout.bx + d.x * tile;
        var py = this.layout.by + d.y * tile;
        var above = game.cellAt(d.x, d.y - 1);
        var below = game.cellAt(d.x, d.y + 1);
        var left = game.cellAt(d.x - 1, d.y);
        var right = game.cellAt(d.x + 1, d.y);
        var horizontalSliding = !(above && below && above.wall && below.wall);
        if (left && right && left.wall && right.wall) horizontalSliding = true;
        ctx.save();
        // 门框
        ctx.fillStyle = 'rgba(5, 11, 14, 0.82)';
        ctx.fillRect(px + 1, py + 1, tile - 2, tile - 2);
        ctx.strokeStyle = rgba(color, 0.26 + anim * 0.25);
        ctx.lineWidth = 1;
        ctx.strokeRect(px + 2.5, py + 2.5, tile - 5, tile - 5);
        // 门叶
        var gap = tile * 0.06;
        var slide = anim * (tile * 0.48);
        ctx.fillStyle = rgba(color, 0.1 + anim * 0.045);
        if (horizontalSliding) {
          var leafW = (tile - gap * 3) / 2;
          ctx.fillRect(px + gap + slide - leafW, py + tile * 0.16, leafW, tile * 0.68);
          ctx.fillRect(px + tile - gap - slide, py + tile * 0.16, leafW, tile * 0.68);
          // 中央能量线
          ctx.strokeStyle = rgba(color, 0.7 * (1 - anim * 0.7));
          ctx.beginPath();
          ctx.moveTo(px + tile / 2, py + tile * 0.2);
          ctx.lineTo(px + tile / 2, py + tile * 0.8);
          ctx.stroke();
        } else {
          var leafH = (tile - gap * 3) / 2;
          ctx.fillRect(px + tile * 0.16, py + gap + slide - leafH, tile * 0.68, leafH);
          ctx.fillRect(px + tile * 0.16, py + tile - gap - slide, tile * 0.68, leafH);
          ctx.strokeStyle = rgba(color, 0.7 * (1 - anim * 0.7));
          ctx.beginPath();
          ctx.moveTo(px + tile * 0.2, py + tile / 2);
          ctx.lineTo(px + tile * 0.8, py + tile / 2);
          ctx.stroke();
        }
        // 四角与标识
        ctx.strokeStyle = rgba(color, 0.48 + anim * 0.2);
        ctx.strokeRect(px + tile * 0.06, py + tile * 0.06, tile * 0.88, tile * 0.88);
        ctx.fillStyle = rgba(color, 0.16 + anim * 0.08);
        ctx.font = '600 ' + Math.max(18, tile * 0.32) + 'px ' + MONO;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(d.group, px + tile / 2, py + tile / 2 + 1);
        ctx.fillStyle = rgba(color, 0.82);
        ctx.font = '600 ' + Math.max(7, tile * 0.13) + 'px ' + MONO;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(d.group, px + tile * 0.1, py + tile * 0.1);
        // 扫描带
        if (!this.reduced) {
          var band = (t * 0.8 + d.x * 0.17) % 1;
          ctx.fillStyle = rgba(color, 0.14 * (1 - anim));
          ctx.fillRect(px + 2, py + tile * band, tile - 4, 1);
        }
        ctx.restore();
      });
    }

    /* ---------------- crates & tethers ---------------- */
    _drawCrates(t) {
      var ctx = this.ctx;
      var tile = this.layout.tile;
      var game = this.game;
      game.crates.forEach((crate) => {
        var vis = this.visual.crates[crate.id] || { x: crate.x, y: crate.y };
        var c = this.cellCenter(vis.x, vis.y);
        var s = tile * 0.58;
        var bob = crate.anchor && !this.reduced ? Math.sin(t * 1.7 + crate.x) * tile * 0.025 : 0;
        ctx.save();
        // 阴影
        ctx.fillStyle = 'rgba(0, 0, 0, 0.34)';
        ctx.beginPath();
        ctx.ellipse(c.x, c.y + s * 0.42, s * 0.42, s * 0.15, 0, 0, TAU);
        ctx.fill();
        ctx.translate(c.x, c.y + bob);
        if (crate.anchor) {
          // 因果锚的时间环
          ctx.save();
          ctx.rotate(this.reduced ? 0.4 : t * 0.18);
          ctx.strokeStyle = 'rgba(231, 164, 106, 0.38)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.ellipse(0, 0, s * 0.78, s * 0.28, 0, 0, TAU);
          ctx.stroke();
          ctx.rotate(1.2);
          ctx.strokeStyle = 'rgba(231, 164, 106, 0.2)';
          ctx.beginPath();
          ctx.ellipse(0, 0, s * 0.66, s * 0.22, 0, 0, TAU);
          ctx.stroke();
          ctx.restore();
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          var ag = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 0.9);
          ag.addColorStop(0, 'rgba(231, 164, 106, 0.22)');
          ag.addColorStop(1, 'rgba(231, 164, 106, 0)');
          ctx.fillStyle = ag;
          ctx.fillRect(-s, -s, s * 2, s * 2);
          ctx.restore();
        }
        // 箱体
        roundRect(ctx, -s / 2, -s / 2, s, s, s * 0.12);
        var grad = ctx.createLinearGradient(-s / 2, -s / 2, s / 2, s / 2);
        if (crate.anchor) {
          grad.addColorStop(0, '#5d3d28');
          grad.addColorStop(0.48, '#2e1f1a');
          grad.addColorStop(1, '#171014');
        } else {
          grad.addColorStop(0, '#605b4f');
          grad.addColorStop(0.5, '#353832');
          grad.addColorStop(1, '#1b2020');
        }
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = crate.anchor ? 'rgba(231, 164, 106, 0.78)' : 'rgba(196, 199, 182, 0.32)';
        ctx.lineWidth = 1;
        ctx.stroke();
        // 表面斜纹
        ctx.save();
        ctx.beginPath();
        ctx.rect(-s / 2 + 2, -s / 2 + 2, s - 4, s - 4);
        ctx.clip();
        ctx.strokeStyle = crate.anchor ? 'rgba(231, 164, 106, 0.18)' : 'rgba(255, 255, 255, 0.06)';
        ctx.lineWidth = 2;
        for (var i = -2; i < 4; i++) {
          ctx.beginPath();
          ctx.moveTo(-s / 2 + i * s * 0.28, s / 2);
          ctx.lineTo(-s / 2 + i * s * 0.28 + s, -s / 2);
          ctx.stroke();
        }
        ctx.restore();
        // 角护条
        ctx.strokeStyle = crate.anchor ? 'rgba(255, 222, 178, 0.45)' : 'rgba(224, 225, 204, 0.22)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-s * 0.36, -s * 0.42);
        ctx.lineTo(-s * 0.42, -s * 0.36);
        ctx.moveTo(s * 0.36, -s * 0.42);
        ctx.lineTo(s * 0.42, -s * 0.36);
        ctx.moveTo(-s * 0.36, s * 0.42);
        ctx.lineTo(-s * 0.42, s * 0.36);
        ctx.moveTo(s * 0.36, s * 0.42);
        ctx.lineTo(s * 0.42, s * 0.36);
        ctx.stroke();
        // 标识
        ctx.fillStyle = crate.anchor ? '#ffd8a8' : 'rgba(230, 229, 210, 0.66)';
        ctx.font = '600 ' + Math.max(8, Math.min(14, tile * 0.17)) + 'px ' + UI;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(crate.anchor ? '锚' : '◆', 0, 1);
        ctx.restore();
      });
    }

    /* ---------------- actors ---------------- */
    _drawEchoes(t) {
      var ctx = this.ctx;
      var game = this.game;
      game.echoes.forEach((echo) => {
        var vis = this.visual.echoes[echo.id] || { x: echo.x, y: echo.y, facing: echo.facing };
        var c = this.cellCenter(vis.x, vis.y);
        var color = ECHO_COLORS[(echo.no - 1) % ECHO_COLORS.length];
        var alpha = 0.55;
        // 回响足环
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        var g = ctx.createRadialGradient(c.x, c.y + this.layout.tile * 0.23, 0, c.x, c.y + this.layout.tile * 0.23, this.layout.tile * 0.42);
        g.addColorStop(0, rgba(color, 0.15));
        g.addColorStop(1, rgba(color, 0));
        ctx.fillStyle = g;
        ctx.fillRect(c.x - this.layout.tile * 0.5, c.y - this.layout.tile * 0.4, this.layout.tile, this.layout.tile * 0.9);
        ctx.restore();
        this._drawFigure(c.x, c.y, this.layout.tile, vis.facing, {
          echo: true,
          color: color,
          alpha: alpha,
          index: echo.no,
          time: t,
          scale: 1.1,
          recent: Math.floor(t * 7 + echo.no) % 9 === 0
        });
        // no. 徽章
        ctx.save();
        ctx.translate(c.x + this.layout.tile * 0.24, c.y - this.layout.tile * 0.27);
        ctx.fillStyle = 'rgba(6, 15, 16, 0.84)';
        ctx.strokeStyle = rgba(color, 0.5);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(5, this.layout.tile * 0.09), 0, TAU);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = rgba(color, 0.9);
        ctx.font = '7px ' + MONO;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(echo.no).padStart(2, '0'), 0, 0.5);
        ctx.restore();
      });
    }

    _drawPlayer(t) {
      var p = this.visual.player;
      if (!p) return;
      var c = this.cellCenter(p.x, p.y);
      var game = this.game;
      var hasShard = game.shardCollected;
      var ctx = this.ctx;
      // 玩家脚下锚定光环：在深色棋盘上给出稳定的定位点。
      ctx.save();
      var ring = ctx.createRadialGradient(c.x, c.y + this.layout.tile * 0.2, 0, c.x, c.y + this.layout.tile * 0.2, this.layout.tile * 0.34);
      ring.addColorStop(0, 'rgba(100, 245, 210, 0.12)');
      ring.addColorStop(1, 'rgba(100, 245, 210, 0)');
      ctx.fillStyle = ring;
      ctx.fillRect(c.x - this.layout.tile * 0.4, c.y - this.layout.tile * 0.2, this.layout.tile * 0.8, this.layout.tile * 0.8);
      ctx.strokeStyle = 'rgba(100, 245, 210, 0.36)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 5]);
      ctx.save();
      ctx.translate(c.x, c.y + this.layout.tile * 0.19);
      ctx.rotate(this.reduced ? 0 : t * 0.55);
      ctx.beginPath();
      ctx.ellipse(0, 0, this.layout.tile * 0.22, this.layout.tile * 0.1, 0, 0, TAU);
      ctx.stroke();
      ctx.restore();
      ctx.restore();
      if (hasShard && !this.reduced) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        var gg = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, this.layout.tile * 0.45);
        gg.addColorStop(0, 'rgba(255,193,94,0.15)');
        gg.addColorStop(1, 'rgba(255,193,94,0)');
        ctx.fillStyle = gg;
        ctx.fillRect(c.x - this.layout.tile * 0.5, c.y - this.layout.tile * 0.5, this.layout.tile, this.layout.tile);
        ctx.restore();
      }
      this._drawFigure(c.x, c.y, this.layout.tile, p.facing, {
        echo: false,
        color: '#ece7db',
        alpha: 1,
        index: 0,
        time: t,
        scale: 1.1,
        recent: false
      });
    }

    _drawFigure(cx, cy, tile, facing, opts) {
      var ctx = this.ctx;
      var echo = !!opts.echo;
      var color = opts.color || '#ece7db';
      var alpha = opts.alpha === undefined ? 1 : opts.alpha;
      var bob = this.reduced ? 0 : Math.sin(opts.time * 2.4 + (opts.index || 0) * 1.7) * tile * 0.008;
      var s = tile * (opts.scale || 1);
      var dir = facing || 'down';
      ctx.save();
      ctx.globalAlpha = alpha;
      // 阴影
      ctx.fillStyle = echo ? rgba(color, 0.12) : 'rgba(0,0,0,0.32)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + s * 0.27, s * 0.17, s * 0.055, 0, 0, TAU);
      ctx.fill();
      ctx.translate(cx, cy + s * 0.02 + bob);
      if (dir === 'left') ctx.scale(-1, 1);
      // 回响的横向裂相
      if (echo && opts.recent && !this.reduced) {
        ctx.save();
        ctx.globalAlpha = alpha * 0.4;
        ctx.strokeStyle = '#ff6b8a';
        ctx.fillStyle = 'rgba(255,107,138,0.1)';
        ctx.translate(-1.4, 0);
        this._figureBody(s, dir, true);
        ctx.restore();
        ctx.save();
        ctx.globalAlpha = alpha * 0.32;
        ctx.strokeStyle = '#74d8ff';
        ctx.fillStyle = 'rgba(116,216,255,0.08)';
        ctx.translate(1.4, 0);
        this._figureBody(s, dir, true);
        ctx.restore();
      }
      // 主体
      ctx.save();
      ctx.globalAlpha = alpha * (echo ? 0.72 : 1);
      this._figureBody(s, dir, echo);
      ctx.restore();
      // 背包/天线
      if (dir !== 'down') {
        ctx.strokeStyle = echo ? rgba(color, 0.6) : 'rgba(236, 231, 219, 0.7)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-s * 0.04, -s * 0.19);
        ctx.lineTo(-s * 0.04, -s * 0.3);
        ctx.stroke();
        ctx.fillStyle = echo ? color : '#ffc15e';
        ctx.beginPath();
        ctx.arc(-s * 0.04, -s * 0.31, Math.max(1.2, s * 0.022), 0, TAU);
        ctx.fill();
      }
      // 朝向小箭头
      if (!echo) {
        ctx.fillStyle = 'rgba(100, 245, 210, 0.55)';
        ctx.beginPath();
        if (dir === 'up') { ctx.moveTo(0, -s * 0.35); ctx.lineTo(-s * 0.04, -s * 0.3); ctx.lineTo(s * 0.04, -s * 0.3); }
        else if (dir === 'down') { ctx.moveTo(0, s * 0.34); ctx.lineTo(-s * 0.04, s * 0.29); ctx.lineTo(s * 0.04, s * 0.29); }
        else if (dir === 'left') { ctx.moveTo(-s * 0.28, 0); ctx.lineTo(-s * 0.23, -s * 0.04); ctx.lineTo(-s * 0.23, s * 0.04); }
        else { ctx.moveTo(s * 0.28, 0); ctx.lineTo(s * 0.23, -s * 0.04); ctx.lineTo(s * 0.23, s * 0.04); }
        ctx.fill();
      }
      ctx.restore();
    }

    _figureBody(s, dir, echo) {
      var ctx = this.ctx;
      var suit = echo ? 'rgba(100, 245, 210, 0.28)' : '#d9d5c8';
      var suitDark = echo ? 'rgba(10, 50, 46, 0.6)' : '#1a2428';
      var line = echo ? 'rgba(100, 245, 210, 0.75)' : 'rgba(236, 231, 219, 0.82)';
      // 腿
      ctx.fillStyle = suitDark;
      roundRect(ctx, -s * 0.105, s * 0.06, s * 0.075, s * 0.16, s * 0.025);
      ctx.fill();
      roundRect(ctx, s * 0.03, s * 0.06, s * 0.075, s * 0.16, s * 0.025);
      ctx.fill();
      // 靴子
      ctx.fillStyle = echo ? 'rgba(100,245,210,0.4)' : '#0d1418';
      roundRect(ctx, -s * 0.12, s * 0.19, s * 0.11, s * 0.04, 1);
      ctx.fill();
      roundRect(ctx, s * 0.015, s * 0.19, s * 0.11, s * 0.04, 1);
      ctx.fill();
      // 躯干
      ctx.fillStyle = suit;
      roundRect(ctx, -s * 0.13, -s * 0.17, s * 0.26, s * 0.28, s * 0.08);
      ctx.fill();
      ctx.strokeStyle = line;
      ctx.lineWidth = Math.max(0.8, s * 0.012);
      ctx.stroke();
      // 手臂
      ctx.strokeStyle = suit;
      ctx.lineWidth = Math.max(1.5, s * 0.032);
      ctx.lineCap = 'round';
      if (dir === 'left' || dir === 'right') {
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.12);
        ctx.lineTo(s * 0.2, -s * 0.02);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(-s * 0.12, -s * 0.11);
        ctx.lineTo(-s * 0.18, s * 0.02);
        ctx.moveTo(s * 0.12, -s * 0.11);
        ctx.lineTo(s * 0.18, s * 0.02);
        ctx.stroke();
      }
      // 肩灯
      ctx.fillStyle = echo ? 'rgba(100,245,210,0.7)' : '#64f5d2';
      ctx.beginPath();
      ctx.arc(-s * 0.115, -s * 0.155, Math.max(1, s * 0.016), 0, TAU);
      ctx.fill();
      // 头盔
      ctx.fillStyle = echo ? 'rgba(9, 42, 40, 0.6)' : '#111b20';
      ctx.strokeStyle = line;
      ctx.beginPath();
      ctx.arc(0, -s * 0.26, s * 0.115, 0, TAU);
      ctx.fill();
      ctx.stroke();
      // 面罩
      if (dir !== 'up') {
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, -s * 0.26, s * 0.115, 0, TAU);
        ctx.clip();
        ctx.fillStyle = echo ? 'rgba(100,245,210,0.5)' : 'rgba(100,245,210,0.72)';
        roundRect(ctx, -s * 0.075, -s * 0.33, s * 0.15, s * 0.09, s * 0.035);
        ctx.fill();
        if (!echo) {
          ctx.fillStyle = 'rgba(255,255,255,0.24)';
          ctx.fillRect(-s * 0.045, -s * 0.315, s * 0.07, 1);
        }
        ctx.restore();
      }
      // 背包
      ctx.fillStyle = echo ? 'rgba(100,245,210,0.12)' : '#26363b';
      roundRect(ctx, -s * 0.075, -s * 0.15, s * 0.15, s * 0.17, 2);
      ctx.fill();
      ctx.strokeStyle = echo ? 'rgba(100,245,210,0.25)' : 'rgba(166,199,197,0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    /* ---------------- hover ---------------- */
    _drawHover(t) {
      if (!this.hover) return;
      var cell = this.hover.cell;
      if (!cell) return;
      var ctx = this.ctx;
      var L = this.layout;
      var px = L.bx + cell.x * L.tile;
      var py = L.by + cell.y * L.tile;
      var accent = this.palette ? this.palette.second : '#64f5d2';
      ctx.save();
      ctx.strokeStyle = rgba(accent, 0.45);
      ctx.lineWidth = 1;
      var len = Math.min(8, L.tile * 0.2);
      ctx.beginPath();
      ctx.moveTo(px + 2, py + 2 + len); ctx.lineTo(px + 2, py + 2); ctx.lineTo(px + 2 + len, py + 2);
      ctx.moveTo(px + L.tile - 2 - len, py + 2); ctx.lineTo(px + L.tile - 2, py + 2); ctx.lineTo(px + L.tile - 2, py + 2 + len);
      ctx.moveTo(px + 2, py + L.tile - 2 - len); ctx.lineTo(px + 2, py + L.tile - 2); ctx.lineTo(px + 2 + len, py + L.tile - 2);
      ctx.moveTo(px + L.tile - 2 - len, py + L.tile - 2); ctx.lineTo(px + L.tile - 2, py + L.tile - 2); ctx.lineTo(px + L.tile - 2, py + L.tile - 2 - len);
      ctx.stroke();
      ctx.restore();
    }

    /* ---------------- fx ---------------- */
    _drawParticles(dt) {
      if (!this.particles.length) return;
      var ctx = this.ctx;
      var L = this.layout;
      var tile = L.tile;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (var i = 0; i < this.particles.length; i++) {
        var p = this.particles[i];
        var alpha = Math.max(0, Math.min(1, p.life / 1.2)) * 0.8;
        ctx.fillStyle = rgba(p.color, alpha);
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
      ctx.restore();
      // 从出口升起的常驻因果尘
      if (!this.reduced) {
        var game = this.game;
        if (game && game.exit) {
          for (var k = 0; k < 6; k++) {
            var seed = seeded(k + 9);
            var ex = this.cellCenter(game.exit.x, game.exit.y);
            var t = (this.time * (0.16 + seed * 0.12) + seed) % 1;
            var px = ex.x + (seed - 0.5) * tile * 0.5 + Math.sin((this.time + k) * 2) * 2;
            var py = ex.y + tile * 0.15 - t * tile * 0.7;
            ctx.fillStyle = rgba(this.palette ? this.palette.second : '#64f5d2', 0.35 * (1 - t));
            ctx.fillRect(px, py, 1.2, 1.2);
          }
        }
      }
    }

    _drawOverlays(t) {
      var ctx = this.ctx;
      var L = this.layout;

      // 被阻挡脉冲
      if (this.blockFx) {
        var p = 1 - this.blockFx.life / this.blockFx.max;
        var c = this.cellCenter(this.blockFx.x, this.blockFx.y);
        ctx.save();
        ctx.globalAlpha = (1 - p) * 0.7;
        ctx.strokeStyle = '#ffc15e';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(c.x, c.y, L.tile * (0.2 + p * 0.22), 0, TAU);
        ctx.stroke();
        ctx.restore();
      }

      // 封印触发
      if (this.sealFx) {
        var sp = 1 - this.sealFx.life / this.sealFx.max;
        var sc = this.cellCenter(this.sealFx.x, this.sealFx.y);
        ctx.save();
        ctx.globalAlpha = (1 - sp) * 0.35;
        ctx.strokeStyle = '#ff6b8a';
        ctx.lineWidth = 1;
        for (var i = 0; i < 7; i++) {
          var ang = (i / 7) * TAU + sp * 1.5;
          ctx.beginPath();
          ctx.moveTo(sc.x + Math.cos(ang) * L.tile * 0.25, sc.y + Math.sin(ang) * L.tile * 0.25);
          ctx.lineTo(sc.x + Math.cos(ang) * L.tile * (0.55 + sp * 0.4), sc.y + Math.sin(ang) * L.tile * (0.55 + sp * 0.4));
          ctx.stroke();
        }
        ctx.restore();
      }

      // 同步完成：节点到中央门的光线
      if (this.syncFx) {
        var q = 1 - this.syncFx.life / this.syncFx.max;
        var gate = this.game.doors.find(function (d) { return d.kind === 'sync'; });
        if (gate) {
          var gC = this.cellCenter(gate.x, gate.y);
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          this.game.syncPlates.forEach(function (node) {
            var nC = this.cellCenter(node.x, node.y);
            ctx.strokeStyle = 'rgba(100, 245, 210, ' + (0.55 * (1 - q)) + ')';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(nC.x, nC.y);
            ctx.lineTo(gC.x, gC.y);
            ctx.stroke();
            ctx.fillStyle = 'rgba(100, 245, 210, ' + (0.35 * (1 - q)) + ')';
            ctx.beginPath();
            ctx.arc(lerp(nC.x, gC.x, q), lerp(nC.y, gC.y, q), 2.2, 0, TAU);
            ctx.fill();
          }, this);
          ctx.restore();
        }
      }

      // 胜利光环
      if (this.winFx) {
        var wr = 1 - this.winFx.life / this.winFx.max;
        var goal = this.game.exit;
        if (goal) {
          var gc = this.cellCenter(goal.x, goal.y);
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          for (var w = 0; w < 3; w++) {
            var rr = L.tile * (0.3 + wr * (1.2 + w * 0.45));
            ctx.strokeStyle = 'rgba(100, 245, 210, ' + (0.28 * (1 - wr) / (w + 1)) + ')';
            ctx.lineWidth = 1 + w;
            ctx.beginPath();
            ctx.arc(gc.x, gc.y, rr, 0, TAU);
            ctx.stroke();
          }
          ctx.restore();
        }
      }

      // 回响倒带效果
      if (this.rewindFx) this._drawRewind();
    }

    _drawRewind() {
      var fx = this.rewindFx;
      if (!fx) return;
      var ctx = this.ctx;
      var L = this.layout;
      var p = 1 - fx.life / fx.max;
      var alpha = Math.sin(Math.min(1, p) * Math.PI) * 0.65;
      // 整体闪白 → 冷蓝
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      var overlay = ctx.createRadialGradient(this.w / 2, this.h / 2, 0, this.w / 2, this.h / 2, Math.max(this.w, this.h) * 0.7);
      overlay.addColorStop(0, rgba('#64f5d2', alpha * 0.1));
      overlay.addColorStop(0.55, rgba('#74d8ff', alpha * 0.035));
      overlay.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = overlay;
      ctx.fillRect(0, 0, this.w, this.h);
      ctx.restore();

      // 反向轨迹
      if (fx.path && fx.path.length > 1) {
        var pts = fx.path;
        ctx.save();
        ctx.lineWidth = Math.max(1, L.tile * 0.055);
        ctx.strokeStyle = rgba('#64f5d2', alpha * 0.35);
        ctx.beginPath();
        for (var i = pts.length - 1; i >= 0; i--) {
          var c = this.cellCenter(pts[i].x, pts[i].y);
          if (i === pts.length - 1) ctx.moveTo(c.x, c.y); else ctx.lineTo(c.x, c.y);
        }
        ctx.stroke();
        // 亮点向起点移动
        var head = pts[Math.max(0, Math.floor((1 - p) * (pts.length - 1)))];
        var hc = this.cellCenter(head.x, head.y);
        ctx.fillStyle = rgba('#d8fff4', alpha);
        ctx.beginPath();
        ctx.arc(hc.x, hc.y, L.tile * 0.09, 0, TAU);
        ctx.fill();
        ctx.restore();
      }

      // 扫描线
      ctx.save();
      ctx.globalAlpha = alpha * 0.35;
      ctx.strokeStyle = '#64f5d2';
      ctx.lineWidth = 1;
      for (var k = 0; k < 5; k++) {
        var y = ((p * 1.4 + k * 0.18) % 1) * this.h;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(this.w, y);
        ctx.stroke();
      }
      ctx.restore();

      // 文字
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.sin(p * Math.PI)) * 0.72;
      ctx.fillStyle = '#64f5d2';
      ctx.font = '10px ' + MONO;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('C A U S A L   R E W I N D   //   E C H O ' + String(fx.echoNo).padStart(2, '0'), this.w / 2, this.h / 2 - L.tile * 0.1);
      ctx.fillStyle = 'rgba(236,231,219,0.55)';
      ctx.font = '7px ' + MONO;
      ctx.fillText('LOOP ' + String(fx.loop).padStart(2, '0') + '  ·  RECORDING PAST ACTIONS', this.w / 2, this.h / 2 + 14);
      ctx.restore();
    }

    _drawScreenAtmosphere(t) {
      var ctx = this.ctx;
      var W = this.w;
      var H = this.h;
      // 顶部/底部内阴影
      var top = ctx.createLinearGradient(0, 0, 0, H * 0.15);
      top.addColorStop(0, 'rgba(2, 5, 7, 0.6)');
      top.addColorStop(1, 'rgba(2, 5, 7, 0)');
      ctx.fillStyle = top;
      ctx.fillRect(0, 0, W, H * 0.15);
      var bottom = ctx.createLinearGradient(0, H * 0.86, 0, H);
      bottom.addColorStop(0, 'rgba(2, 5, 7, 0)');
      bottom.addColorStop(1, 'rgba(2, 5, 7, 0.64)');
      ctx.fillStyle = bottom;
      ctx.fillRect(0, H * 0.86, W, H * 0.14);
      // 动态尘点
      if (!this.reduced) {
        ctx.save();
        for (var i = 0; i < 26; i++) {
          var sx = seeded(i * 3.7) * W;
          var sy = seeded(i * 9.2 + 2) * H;
          var drift = (this.time * (3 + (i % 5)) + i * 17) % (H + 20);
          var yy = (sy + drift * 0.18) % H;
          var a = 0.06 + 0.11 * Math.sin(this.time * 0.6 + i);
          ctx.fillStyle = 'rgba(181, 213, 205, ' + Math.max(0, a) + ')';
          ctx.fillRect(sx, yy, 1, 1);
        }
        ctx.restore();
      }
    }
  }

  /* =====================================================================
     标题 / 开场观测窗
     ===================================================================== */
  class TitleScene extends BaseScene {
    constructor(canvas, options) {
      super(canvas);
      this.options = options || {};
      this.variant = this.options.variant || 'title';
      this.dust = [];
      for (var i = 0; i < 110; i++) {
        this.dust.push({
          x: seeded(i * 2.13),
          y: seeded(i * 7.41 + 3),
          s: 0.4 + seeded(i * 4.1) * 1.5,
          speed: 0.2 + seeded(i * 1.7) * 0.7,
          alpha: 0.05 + seeded(i * 9.3) * 0.25
        });
      }
    }

    setVariant(v) { this.variant = v; }

    render(t, dt) {
      var ctx = this.ctx;
      var W = this.w;
      var H = this.h;
      var time = this.reduced ? 0 : t;
      ctx.clearRect(0, 0, W, H);

      var isIntro = this.variant === 'intro';
      var cx = W * (isIntro ? 0.68 : 0.53);
      var cy = H * (isIntro ? 0.46 : 0.45);
      var R = Math.min(W, H) * (isIntro ? 0.26 : 0.3);

      // 背景
      var bg = ctx.createRadialGradient(cx, cy * 0.8, 0, cx, cy, Math.max(W, H) * 0.98);
      bg.addColorStop(0, isIntro ? '#0a1618' : '#0b181b');
      bg.addColorStop(0.35, '#071014');
      bg.addColorStop(1, '#030709');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // 顶光
      var topGlow = ctx.createLinearGradient(0, 0, 0, H);
      topGlow.addColorStop(0, 'rgba(100, 245, 210, 0.07)');
      topGlow.addColorStop(0.32, 'rgba(100, 245, 210, 0)');
      ctx.fillStyle = topGlow;
      ctx.fillRect(0, 0, W, H);

      // 光束
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (var b = 0; b < 3; b++) {
        var bx = cx + (b - 1) * R * 0.85;
        var lg = ctx.createLinearGradient(bx, 0, bx + W * 0.12, H * 0.82);
        lg.addColorStop(0, 'rgba(100,245,210,0.025)');
        lg.addColorStop(0.5, 'rgba(100,245,210,0.012)');
        lg.addColorStop(1, 'rgba(100,245,210,0)');
        ctx.fillStyle = lg;
        ctx.beginPath();
        ctx.moveTo(bx - R * 0.1, 0);
        ctx.lineTo(bx + R * 0.1, 0);
        ctx.lineTo(bx + R * 0.8, H);
        ctx.lineTo(bx + R * 0.2, H);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // 地板透视网格
      this._drawFloorGrid(ctx, W, H, time, isIntro);

      // 主装置
      this._drawApparatus(ctx, cx, cy, R, time, isIntro);

      // 尘点
      if (!this.reduced) {
        ctx.save();
        for (var i = 0; i < this.dust.length; i++) {
          var d = this.dust[i];
          var y = H - ((d.y * H + time * 6 * d.speed) % (H + 20));
          var x = d.x * W + Math.sin(time * 0.18 + i) * 7;
          ctx.fillStyle = 'rgba(175, 213, 202, ' + (d.alpha * 0.55) + ')';
          ctx.fillRect(x, y, d.s, d.s);
        }
        ctx.restore();
      }

      // 轻微扫描线
      ctx.save();
      ctx.globalAlpha = 0.06;
      ctx.fillStyle = '#baffea';
      var scanY = (time * 18) % H;
      ctx.fillRect(0, scanY, W, 1);
      ctx.restore();

      // 暗角
      var vig = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, Math.max(W, H) * 0.78);
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(0.55, 'rgba(0,0,0,0.14)');
      vig.addColorStop(1, 'rgba(0,0,0,0.65)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);
    }

    _drawFloorGrid(ctx, W, H, time, isIntro) {
      var horizon = H * 0.69;
      var cx = W * (isIntro ? 0.68 : 0.53);
      var grad = ctx.createLinearGradient(0, horizon, 0, H);
      grad.addColorStop(0, 'rgba(9, 22, 25, 0.05)');
      grad.addColorStop(0.4, 'rgba(8, 18, 21, 0.5)');
      grad.addColorStop(1, 'rgba(2, 6, 8, 0.92)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, horizon, W, H - horizon);

      ctx.save();
      ctx.strokeStyle = 'rgba(100, 245, 210, 0.095)';
      ctx.lineWidth = 1;
      var vpX = cx;
      var vpY = horizon - H * 0.06;
      for (var i = -12; i <= 12; i++) {
        var bx = cx + i * W * 0.075;
        ctx.beginPath();
        ctx.moveTo(vpX, vpY);
        ctx.lineTo(bx, H);
        ctx.stroke();
      }
      for (var r = 0; r < 10; r++) {
        var p = r / 10;
        var y = lerp(horizon, H, Math.pow(p, 1.65));
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
      ctx.restore();

      if (!this.reduced) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (var k = 0; k < 3; k++) {
          var rr = (time * 0.1 + k * 0.33) % 1;
          var y2 = lerp(horizon, H, rr * rr);
          ctx.strokeStyle = 'rgba(100,245,210,' + (0.07 * (1 - rr)) + ')';
          ctx.beginPath();
          ctx.ellipse(cx, y2, W * (0.05 + rr * 0.3), 4 + rr * 10, 0, 0, TAU);
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    _drawApparatus(ctx, cx, cy, R, time, isIntro) {
      ctx.save();
      ctx.translate(cx, cy);

      // 主辉光
      var coreGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 1.15);
      coreGlow.addColorStop(0, 'rgba(100, 245, 210, ' + (isIntro ? 0.1 : 0.15) + ')');
      coreGlow.addColorStop(0.38, 'rgba(100, 245, 210, 0.035)');
      coreGlow.addColorStop(1, 'rgba(100, 245, 210, 0)');
      ctx.fillStyle = coreGlow;
      ctx.fillRect(-R * 1.3, -R * 1.3, R * 2.6, R * 2.6);

      // 地板平台
      ctx.save();
      ctx.globalAlpha = 0.8;
      ctx.strokeStyle = 'rgba(231, 164, 106, 0.22)';
      ctx.lineWidth = 1;
      for (var pl = 0; pl < 3; pl++) {
        ctx.beginPath();
        ctx.ellipse(0, R * 0.9, R * (0.42 + pl * 0.18), R * (0.09 + pl * 0.025), 0, 0, TAU);
        ctx.stroke();
      }
      ctx.fillStyle = 'rgba(3, 8, 10, 0.35)';
      ctx.beginPath();
      ctx.ellipse(0, R * 0.9, R * 0.65, R * 0.14, 0, 0, TAU);
      ctx.fill();
      ctx.restore();

      // 外层刻度环
      var glowPulse = this.reduced ? 0.5 : 0.5 + Math.sin(time * 1.3) * 0.2;
      ctx.save();
      for (var i = 0; i < 120; i++) {
        var a = (i / 120) * TAU + (this.reduced ? 0 : time * 0.035);
        var major = i % 10 === 0;
        var r1 = R * (major ? 0.9 : 0.94);
        var r2 = R * 0.98;
        ctx.strokeStyle = 'rgba(100, 245, 210, ' + (major ? 0.38 : 0.13) + ')';
        ctx.lineWidth = major ? 1.2 : 1;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
        ctx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2);
        ctx.stroke();
      }
      // 四个弧段
      var arcs = [0.15, 1.7, 3.3, 4.9];
      ctx.lineWidth = Math.max(1, R * 0.008);
      for (var k = 0; k < arcs.length; k++) {
        var start = arcs[k] + (this.reduced ? 0 : time * 0.06);
        var span = 0.6 + 0.3 * Math.sin(k * 2.1 + time * 0.4);
        ctx.strokeStyle = k % 2 ? 'rgba(231, 164, 106, 0.45)' : 'rgba(100, 245, 210, ' + (0.45 + glowPulse * 0.2) + ')';
        ctx.beginPath();
        ctx.arc(0, 0, R, start, start + span);
        ctx.stroke();
      }
      ctx.restore();

      // 中层椭圆轨道
      ctx.save();
      ctx.rotate(-0.38 + (this.reduced ? 0 : time * 0.02));
      ctx.scale(1, 0.36);
      ctx.strokeStyle = 'rgba(231, 164, 106, 0.38)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 9]);
      ctx.beginPath();
      ctx.arc(0, 0, R * 0.76, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#e7a46a';
      for (var d = 0; d < 4; d++) {
        var angle = (d / 4) * TAU + time * 0.15;
        ctx.beginPath();
        ctx.arc(Math.cos(angle) * R * 0.76, Math.sin(angle) * R * 0.76, R * 0.012 + 1, 0, TAU);
        ctx.fill();
      }
      ctx.restore();

      // 内层轨道
      ctx.save();
      ctx.rotate(0.75 - (this.reduced ? 0 : time * 0.045));
      ctx.scale(0.45, 1);
      ctx.strokeStyle = 'rgba(116, 216, 255, 0.34)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, R * 0.72, 0, TAU);
      ctx.stroke();
      ctx.restore();

      // 核心晶体
      ctx.save();
      var crystalR = R * 0.34;
      var rot = this.reduced ? 0.2 : time * 0.18;
      ctx.rotate(rot);
      var cg = ctx.createLinearGradient(-crystalR, -crystalR, crystalR, crystalR);
      cg.addColorStop(0, 'rgba(206, 255, 242, 0.15)');
      cg.addColorStop(0.4, 'rgba(100, 245, 210, 0.07)');
      cg.addColorStop(1, 'rgba(100, 245, 210, 0.01)');
      poly(ctx, [[0, -crystalR], [crystalR * 0.72, -crystalR * 0.16], [0, crystalR], [-crystalR * 0.72, -crystalR * 0.16]]);
      ctx.fillStyle = cg;
      ctx.fill();
      ctx.strokeStyle = 'rgba(174, 255, 236, 0.72)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      // 内部菱形
      poly(ctx, [[0, -crystalR * 0.62], [crystalR * 0.4, -crystalR * 0.06], [0, crystalR * 0.58], [-crystalR * 0.4, -crystalR * 0.06]]);
      ctx.strokeStyle = 'rgba(255, 211, 160, 0.6)';
      ctx.stroke();
      // 中心辉点
      var cg2 = ctx.createRadialGradient(0, 0, 0, 0, 0, crystalR * 0.6);
      cg2.addColorStop(0, 'rgba(244, 255, 250, 0.7)');
      cg2.addColorStop(0.3, 'rgba(100, 245, 210, 0.25)');
      cg2.addColorStop(1, 'rgba(100, 245, 210, 0)');
      ctx.fillStyle = cg2;
      ctx.beginPath();
      ctx.arc(0, 0, crystalR * 0.65, 0, TAU);
      ctx.fill();
      ctx.restore();

      // 轨道碎片
      ctx.save();
      for (var s = 0; s < 7; s++) {
        var ang = (s / 7) * TAU + time * (0.09 + s * 0.005);
        var rad = R * (0.46 + (s % 3) * 0.08);
        var sx = Math.cos(ang) * rad;
        var sy = Math.sin(ang) * rad * 0.42;
        ctx.fillStyle = s % 2 ? 'rgba(231, 164, 106, 0.65)' : 'rgba(100, 245, 210, 0.55)';
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(ang + time * 0.2);
        ctx.fillRect(-1.8, -1.8, 3.6, 3.6);
        ctx.restore();
      }
      ctx.restore();

      // 回响剪影：标题页也需要让人一眼读出“过去的你会站在这里”
      if (!isIntro) {
        // 时钟刻度底盘
        ctx.save();
        ctx.strokeStyle = 'rgba(100, 245, 210, 0.12)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 8]);
        ctx.beginPath();
        ctx.ellipse(0, R * 0.88, R * 0.78, R * 0.18, 0, 0, TAU);
        ctx.stroke();
        ctx.restore();
        var figures = [
          { x: -R * 0.5, y: R * 0.9, h: R * 0.32, color: '#64f5d2', alpha: 0.56, solid: false, no: 'ECHO 01', delay: 0.4 },
          { x: R * 0.39, y: R * 0.91, h: R * 0.29, color: '#74d8ff', alpha: 0.42, solid: false, no: 'ECHO 02', delay: 2.4 },
          { x: -R * 0.07, y: R * 0.96, h: R * 0.39, color: '#ece7db', alpha: 0.95, solid: true, no: '', delay: 0.8 }
        ];
        for (var g = 0; g < figures.length; g++) {
          var gh = figures[g];
          var bob = this.reduced ? 0 : Math.sin(time * 0.9 + gh.delay) * 2;
          this._drawTitleFigure(ctx, gh.x, gh.y + bob, gh.h, {
            color: gh.color, alpha: gh.alpha, solid: gh.solid, label: gh.no, time: time
          });
        }
      }

      // 故障切片
      if (!this.reduced && !isIntro && (time % 7.4) < 0.15) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.2;
        ctx.translate(2.5, 0);
        ctx.strokeStyle = '#ff6b8a';
        ctx.beginPath();
        ctx.arc(0, 0, R, 0.4, 1.4);
        ctx.stroke();
        ctx.translate(-5, 0);
        ctx.strokeStyle = '#74d8ff';
        ctx.beginPath();
        ctx.arc(0, 0, R, 0.4, 1.4);
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore();
    }

    _drawTitleFigure(ctx, x, y, h, opts) {
      ctx.save();
      ctx.globalAlpha = opts.alpha;
      ctx.translate(x, y);
      var color = opts.color;
      var solid = !!opts.solid;
      var w = h * 0.34;
      // 地面阴影与锚点环
      ctx.fillStyle = solid ? 'rgba(0, 0, 0, 0.42)' : 'rgba(0, 0, 0, 0.16)';
      ctx.beginPath();
      ctx.ellipse(0, 2, w * 0.75, h * 0.055, 0, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = solid ? 'rgba(100, 245, 210, 0.58)' : rgba(color, 0.34);
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);
      ctx.beginPath();
      ctx.ellipse(0, 0, w * 1.02, h * 0.095, 0, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
      if (solid) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        var gr = ctx.createRadialGradient(0, -h * 0.3, 0, 0, -h * 0.3, h * 0.75);
        gr.addColorStop(0, 'rgba(100, 245, 210, 0.1)');
        gr.addColorStop(1, 'rgba(100, 245, 210, 0)');
        ctx.fillStyle = gr;
        ctx.fillRect(-h * 0.9, -h * 1.2, h * 1.8, h * 1.8);
        ctx.restore();
      }
      // 腿
      ctx.strokeStyle = solid ? 'rgba(22, 34, 38, 0.95)' : rgba(color, 0.7);
      ctx.lineWidth = Math.max(2, h * 0.06);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-w * 0.18, -h * 0.28);
      ctx.lineTo(-w * 0.22, -h * 0.02);
      ctx.moveTo(w * 0.18, -h * 0.28);
      ctx.lineTo(w * 0.22, -h * 0.02);
      ctx.stroke();
      // 靴子
      ctx.strokeStyle = solid ? 'rgba(9, 15, 18, 0.98)' : rgba(color, 0.55);
      ctx.beginPath();
      ctx.moveTo(-w * 0.28, 0);
      ctx.lineTo(-w * 0.03, 0);
      ctx.moveTo(w * 0.03, 0);
      ctx.lineTo(w * 0.28, 0);
      ctx.stroke();
      // 躯干
      if (solid) {
        ctx.fillStyle = 'rgba(206, 201, 187, 0.92)';
        roundRect(ctx, -w * 0.35, -h * 0.66, w * 0.7, h * 0.4, w * 0.17);
        ctx.fill();
        ctx.strokeStyle = 'rgba(236, 231, 219, 0.72)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = 'rgba(22, 34, 38, 0.9)';
        roundRect(ctx, -w * 0.24, -h * 0.64, w * 0.48, h * 0.2, 2);
        ctx.fill();
      } else {
        ctx.fillStyle = rgba(color, 0.08);
        ctx.strokeStyle = rgba(color, 0.72);
        ctx.lineWidth = 1;
        roundRect(ctx, -w * 0.35, -h * 0.66, w * 0.7, h * 0.4, w * 0.17);
        ctx.fill();
        ctx.stroke();
        // 幽灵裂相扫描线
        ctx.strokeStyle = rgba(color, 0.24);
        ctx.beginPath();
        ctx.moveTo(-w * 0.42, -h * 0.47);
        ctx.lineTo(w * 0.42, -h * 0.47);
        ctx.moveTo(-w * 0.35, -h * 0.35);
        ctx.lineTo(w * 0.35, -h * 0.35);
        ctx.stroke();
      }
      // 肩臂
      ctx.strokeStyle = solid ? 'rgba(206, 201, 187, 0.92)' : rgba(color, 0.6);
      ctx.lineWidth = Math.max(2, h * 0.05);
      ctx.beginPath();
      ctx.moveTo(-w * 0.35, -h * 0.62);
      ctx.lineTo(-w * 0.62, -h * 0.4);
      ctx.moveTo(w * 0.35, -h * 0.62);
      ctx.lineTo(w * 0.62, -h * 0.4);
      ctx.stroke();
      // 头盔
      ctx.fillStyle = solid ? 'rgba(16, 25, 29, 0.98)' : 'rgba(5, 21, 22, 0.85)';
      ctx.strokeStyle = solid ? 'rgba(236, 231, 219, 0.8)' : rgba(color, 0.78);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, -h * 0.79, h * 0.105, 0, TAU);
      ctx.fill();
      ctx.stroke();
      // 面罩
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, -h * 0.79, h * 0.105, 0, TAU);
      ctx.clip();
      ctx.fillStyle = solid ? 'rgba(100, 245, 210, 0.8)' : rgba(color, 0.64);
      roundRect(ctx, -w * 0.24, -h * 0.835, w * 0.48, h * 0.07, 2);
      ctx.fill();
      ctx.restore();
      // 背包/肩灯
      ctx.fillStyle = solid ? 'rgba(100, 245, 210, 0.75)' : rgba(color, 0.65);
      ctx.beginPath();
      ctx.arc(-w * 0.46, -h * 0.55, Math.max(1, h * 0.014), 0, TAU);
      ctx.fill();
      // 头顶小引线
      ctx.strokeStyle = solid ? 'rgba(236, 231, 219, 0.35)' : rgba(color, 0.3);
      ctx.beginPath();
      ctx.moveTo(0, -h * 0.9);
      ctx.lineTo(0, -h * 1.01);
      ctx.stroke();
      // 标签
      if (opts.label) {
        ctx.fillStyle = rgba(color, 0.62);
        ctx.font = '7px ' + MONO;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(opts.label, 0, -h * 1.04);
      }
      ctx.restore();
    }
  }

  /* =====================================================================
     结局背景
     ===================================================================== */
  class EndingScene extends BaseScene {
    render(t) {
      var ctx = this.ctx;
      var W = this.w;
      var H = this.h;
      var time = this.reduced ? 0 : t;
      ctx.clearRect(0, 0, W, H);
      var bg = ctx.createRadialGradient(W * 0.6, H * 0.46, 0, W * 0.6, H * 0.5, Math.max(W, H));
      bg.addColorStop(0, '#0b1718');
      bg.addColorStop(0.45, '#060d10');
      bg.addColorStop(1, '#030608');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      var cx = W * 0.62;
      var cy = H * 0.42;
      var R = Math.min(W, H) * 0.28;

      ctx.save();
      ctx.translate(cx, cy);
      var glow = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 2.1);
      glow.addColorStop(0, 'rgba(100, 245, 210, 0.175)');
      glow.addColorStop(0.4, 'rgba(100, 245, 210, 0.055)');
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(-R * 2.3, -R * 2.3, R * 4.6, R * 4.6);
      ctx.strokeStyle = 'rgba(208, 235, 228, 0.28)';
      ctx.lineWidth = 1;
      for (var k = 0; k < 3; k++) {
        ctx.beginPath();
        ctx.arc(0, 0, R * (0.45 + k * 0.18), 0.3 + time * 0.02, TAU - 0.7 + time * 0.02);
        ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(231, 164, 106, 0.38)';
      ctx.beginPath();
      ctx.arc(0, 0, R * 0.82, 2.1, 4.7);
      ctx.stroke();
      // 核心残片
      ctx.rotate(0.4);
      ctx.strokeStyle = 'rgba(151, 255, 234, 0.72)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, -R * 0.33);
      ctx.lineTo(R * 0.22, 0);
      ctx.lineTo(0, R * 0.33);
      ctx.lineTo(-R * 0.22, 0);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      // 漂浮回响尘
      if (!this.reduced) {
        ctx.save();
        for (var i = 0; i < 42; i++) {
          var sx = seeded(i * 19.1) * W;
          var baseY = seeded(i * 7.7) * H;
          var y = (baseY - time * (5 + seeded(i) * 12)) % (H + 40);
          if (y < -20) y += H + 40;
          var a = 0.1 + seeded(i * 3.1) * 0.35;
          ctx.fillStyle = 'rgba(160, 255, 233, ' + a * 0.5 + ')';
          ctx.fillRect(sx, y, 1.2, 1.2);
        }
        ctx.restore();
      }

      var vig = ctx.createRadialGradient(cx, cy, R, cx, cy, Math.max(W, H));
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(1, 'rgba(0,0,0,0.7)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);
    }
  }

  /* =====================================================================
     全局环境尘
     ===================================================================== */
  class AmbientScene extends BaseScene {
    constructor(canvas) {
      super(canvas);
      this.dust = [];
      for (var i = 0; i < 50; i++) {
        this.dust.push({
          x: seeded(i * 3.3),
          y: seeded(i * 9.7 + 2),
          s: 0.5 + seeded(i * 1.9) * 1.2,
          speed: 0.15 + seeded(i * 5.3) * 0.55,
          alpha: 0.04 + seeded(i * 2.7) * 0.13
        });
      }
    }
    render(t) {
      var ctx = this.ctx;
      var W = this.w;
      var H = this.h;
      var time = this.reduced ? 0 : t;
      ctx.clearRect(0, 0, W, H);
      // 极淡的环形场
      ctx.save();
      ctx.translate(W * 0.66, H * 0.36);
      for (var r = 0; r < 4; r++) {
        ctx.strokeStyle = 'rgba(100, 245, 210, ' + (0.018 - r * 0.003) + ')';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(0, 0, Math.min(W, H) * (0.34 + r * 0.17), Math.min(W, H) * (0.12 + r * 0.06), -0.2, 0, TAU);
        ctx.stroke();
      }
      ctx.restore();
      for (var i = 0; i < this.dust.length; i++) {
        var d = this.dust[i];
        var y = (d.y * H - time * 2.2 * d.speed + H) % H;
        var x = d.x * W + Math.sin(time * 0.08 + i) * 14;
        ctx.fillStyle = 'rgba(160, 220, 207, ' + d.alpha + ')';
        ctx.fillRect(x, y, d.s, d.s);
      }
    }
  }

  root.ChronoRenderer = ChronoRenderer;
  root.TitleScene = TitleScene;
  root.EndingScene = EndingScene;
  root.AmbientScene = AmbientScene;
})(typeof globalThis !== 'undefined' ? globalThis : this);
