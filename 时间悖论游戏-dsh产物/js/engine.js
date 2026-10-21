/* =========================================================================
 * 时间悖论：失控实验室 — 因果引擎（纯逻辑，可脱离 DOM 运行）
 * 规则的核心都在这里：移动、推箱、回响刻录/重演、压力板、门、因果封印、
 * 同步节点、因果锚保留。渲染层不许复制规则，只能读取这里的状态。
 * ========================================================================= */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ChronoEngine = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var VERSION = '1.0.0';
  var DIRS = {
    up: { x: 0, y: -1, key: 'up' },
    down: { x: 0, y: 1, key: 'down' },
    left: { x: -1, y: 0, key: 'left' },
    right: { x: 1, y: 0, key: 'right' }
  };
  var ACTOR_KIND = { player: 'player', echo: 'echo' };

  function cloneAction(a) {
    return { type: a.type, dir: a.dir || null, x: a.x, y: a.y, facing: a.facing || null };
  }

  class ChronoGame {
    constructor(level) {
      if (!level || !Array.isArray(level.map)) {
        throw new Error('关卡数据缺少 map');
      }
      this.level = level;
      this.levelId = level.id;
      this._parse();
      this._prepareInitialState();
      this._resetRuntime();
      this._recomputeMechanisms({ events: [], silent: true });
    }

    /* ---------------------------------------------------------------------
     * 解析关卡 ASCII 地图
     * ------------------------------------------------------------------- */
    _parse() {
      var rows = this.level.map.slice();
      if (!rows.length) throw new Error('关卡地图为空');
      this.height = rows.length;
      this.width = Math.max.apply(null, rows.map(function (r) { return r.length; }));
      this.grid = [];
      this.playerStart = null;
      this.exit = null;
      this.exitCells = [];
      this.shardCells = [];
      this.plates = [];
      this.doors = [];
      this.syncPlates = [];
      this.crateStarts = [];
      this.sealTriggers = [];
      this.syncGateCount = 0;

      for (var y = 0; y < this.height; y++) {
        var row = rows[y];
        if (row.length !== this.width) {
          throw new Error('关卡 ' + this.levelId + ' 第 ' + y + ' 行长度不一致');
        }
        var line = [];
        for (var x = 0; x < this.width; x++) {
          var ch = row.charAt(x);
          var cell = {
            x: x, y: y, ch: ch, wall: false, floor: true,
            exit: false, shard: false, plate: null, door: null,
            sealTrigger: false, sealGate: false, syncPlate: null
          };
          switch (ch) {
            case '#':
              cell.wall = true;
              cell.floor = false;
              break;
            case '.':
              break;
            case 'P':
              if (this.playerStart) throw new Error('关卡只能有一个玩家起点');
              this.playerStart = { x: x, y: y };
              break;
            case 'E':
              if (!this.exit) this.exit = { x: x, y: y };
              this.exitCells.push({ x: x, y: y });
              cell.exit = true;
              break;
            case '*':
              this.shardCells.push({ x: x, y: y });
              cell.shard = true;
              break;
            case 'c':
            case 'x':
              this.crateStarts.push({
                x: x, y: y, anchor: ch === 'x',
                id: 'crate-' + this.crateStarts.length
              });
              break;
            case 'a':
            case 'b':
              cell.plate = ch;
              this.plates.push({
                x: x, y: y, group: ch.toUpperCase(), kind: 'hold',
                id: ch + '-' + this.plates.length, pressed: false, wasPressed: false
              });
              break;
            case 'A':
            case 'B':
              cell.door = ch;
              this.doors.push({
                x: x, y: y, group: ch, kind: 'hold',
                id: 'door-' + ch + '-' + x + '-' + y, open: false
              });
              break;
            case 'v':
              cell.sealTrigger = true;
              this.sealTriggers.push({ x: x, y: y });
              break;
            case 'V':
              cell.sealGate = true;
              this.doors.push({
                x: x, y: y, group: 'V', kind: 'seal',
                id: 'door-V-' + x + '-' + y, open: true
              });
              break;
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
              cell.syncPlate = Number(ch);
              this.syncPlates.push({
                x: x, y: y, group: 'S', kind: 'sync', node: Number(ch),
                id: 'sync-' + ch, pressed: false, wasPressed: false
              });
              break;
            case 'G':
              cell.syncGate = true;
              this.syncGateCount++;
              this.doors.push({
                x: x, y: y, group: 'G', kind: 'sync',
                id: 'door-G-' + x + '-' + y, open: false
              });
              break;
            case ' ':
              // 空白按墙体处理，避免关卡外泄
              cell.wall = true;
              cell.floor = false;
              break;
            default:
              throw new Error('未知地图字符 "' + ch + '" @ ' + x + ',' + y);
          }
          line.push(cell);
        }
        this.grid.push(line);
      }
      if (!this.playerStart) throw new Error('关卡缺少玩家起点 P');
      if (!this.exit) throw new Error('关卡缺少出口 E');
      if (!this.syncGateCount && this.syncPlates.length) {
        // 同步节点可以只作为视觉状态存在；但正常关卡应带 G。
        throw new Error('存在同步节点但没有同步门 G');
      }
      if (this.syncGateCount && !this.syncPlates.length) {
        throw new Error('存在同步门但没有同步节点');
      }
      this.doorAt = new Map();
      for (var i = 0; i < this.doors.length; i++) {
        var d = this.doors[i];
        this.doorAt.set(d.x + ',' + d.y, d);
      }

      // 质量槽同步节点：只接受箱子，不接受玩家或回响。
      var cradleIds = Array.isArray(this.level.syncCradles) ? this.level.syncCradles : [];
      for (i = 0; i < this.syncPlates.length; i++) {
        this.syncPlates[i].cradle = cradleIds.indexOf(this.syncPlates[i].node) !== -1;
      }
      for (i = 0; i < cradleIds.length; i++) {
        var found = this.syncPlates.some(function (p) { return p.node === cradleIds[i]; });
        if (!found) throw new Error('关卡 ' + this.levelId + ' 的质量槽节点 ' + cradleIds[i] + ' 不存在');
      }
    }

    _prepareInitialState() {
      this.initial = {
        crates: this.crateStarts.map(function (c) {
          return { id: c.id, anchor: c.anchor, x: c.x, y: c.y, startX: c.x, startY: c.y };
        }),
        player: { x: this.playerStart.x, y: this.playerStart.y }
      };
    }

    _resetRuntime() {
      this.player = { x: this.playerStart.x, y: this.playerStart.y, facing: 'down' };
      this.echoes = [];
      this.echoSerial = 0;
      this.crates = this.initial.crates.map(function (c) {
        return { id: c.id, anchor: c.anchor, x: c.x, y: c.y, startX: c.startX, startY: c.startY };
      });
      this.shardCollected = false;
      this.sealTriggered = false;
      this.syncLatched = false;
      this.loop = 1;
      this.rewindsUsed = 0;
      this.actionTick = 0;
      this.totalActions = 0;
      this.currentActions = [];
      this.lastLoopPath = [];
      this.undoStack = [];
      this.status = 'playing';
      this.won = false;
      this.winStats = null;
      this.doors.forEach(function (d) {
        d.open = d.kind === 'seal' ? true : false;
      });
    }

    /* ---------------------------------------------------------------------
     * 公共查询
     * ------------------------------------------------------------------- */
    get maxRewinds() {
      return Math.max(0, Number(this.level.echoBudget) || 0);
    }

    get rewindsLeft() {
      return Math.max(0, this.maxRewinds - this.rewindsUsed);
    }

    get canRewind() {
      return this.status === 'playing' && this.rewindsLeft > 0 && this.currentActions.length > 0;
    }

    get canUndo() {
      return this.status === 'playing' && this.undoStack.length > 0;
    }

    cellAt(x, y) {
      if (x < 0 || y < 0 || x >= this.width || y >= this.height) return null;
      return this.grid[y][x];
    }

    doorAtCell(x, y) {
      return this.doorAt.get(x + ',' + y) || null;
    }

    doorIsOpen(x, y) {
      var d = this.doorAtCell(x, y);
      return d ? d.open : true;
    }

    crateAt(x, y) {
      for (var i = 0; i < this.crates.length; i++) {
        if (this.crates[i].x === x && this.crates[i].y === y) return this.crates[i];
      }
      return null;
    }

    actorAt(x, y) {
      if (this.player.x === x && this.player.y === y) return { kind: 'player', id: 'player' };
      for (var i = 0; i < this.echoes.length; i++) {
        if (this.echoes[i].x === x && this.echoes[i].y === y) {
          return { kind: 'echo', id: this.echoes[i].id, echo: this.echoes[i] };
        }
      }
      return null;
    }

    occupantsAt(x, y) {
      var occ = [];
      if (this.player.x === x && this.player.y === y) occ.push({ kind: 'player', id: 'player' });
      for (var i = 0; i < this.echoes.length; i++) {
        if (this.echoes[i].x === x && this.echoes[i].y === y) {
          occ.push({ kind: 'echo', id: this.echoes[i].id });
        }
      }
      var crate = this.crateAt(x, y);
      if (crate) occ.push({ kind: 'crate', id: crate.id, anchor: crate.anchor });
      return occ;
    }

    getCellTopology() {
      return this.grid;
    }

    getEchoPaths() {
      return this.echoes.map(function (e) {
        return { id: e.id, no: e.no, path: e.path.slice(), colorIndex: e.no - 1 };
      });
    }

    getSnapshot() {
      return {
        status: this.status,
        loop: this.loop,
        rewindsUsed: this.rewindsUsed,
        rewindsLeft: this.rewindsLeft,
        maxRewinds: this.maxRewinds,
        actionTick: this.actionTick,
        totalActions: this.totalActions,
        player: { x: this.player.x, y: this.player.y, facing: this.player.facing },
        echoes: this.echoes.map(function (e) {
          return {
            id: e.id, no: e.no, x: e.x, y: e.y, facing: e.facing,
            recordedActions: e.actions.length, path: e.path.slice()
          };
        }),
        crates: this.crates.map(function (c) {
          return { id: c.id, x: c.x, y: c.y, anchor: c.anchor };
        }),
        doors: this.doors.map(function (d) {
          return { id: d.id, x: d.x, y: d.y, group: d.group, open: d.open };
        }),
        plates: this.plates.concat(this.syncPlates).map(function (p) {
          return { id: p.id, x: p.x, y: p.y, pressed: p.pressed, kind: p.kind, cradle: !!p.cradle };
        }),
        shardCollected: this.shardCollected,
        sealTriggered: this.sealTriggered,
        syncLatched: this.syncLatched,
        canRewind: this.canRewind,
        canUndo: this.canUndo,
        winStats: this.winStats
      };
    }

    _slimState() {
      return {
        player: { x: this.player.x, y: this.player.y, facing: this.player.facing },
        echoes: this.echoes.map(function (e) {
          return { x: e.x, y: e.y, facing: e.facing, id: e.id };
        }),
        crates: this.crates.map(function (c) {
          return { x: c.x, y: c.y, anchor: c.anchor };
        }),
        doors: this.doors.map(function (d) { return d.open; }),
        plates: this.plates.concat(this.syncPlates).map(function (p) { return p.pressed; }),
        shardCollected: this.shardCollected,
        sealTriggered: this.sealTriggered,
        syncLatched: this.syncLatched
      };
    }

    /* ---------------------------------------------------------------------
     * 快照 / 还原（用于撤销）
     * ------------------------------------------------------------------- */
    _takeSnapshot() {
      return {
        player: { x: this.player.x, y: this.player.y, facing: this.player.facing },
        echoes: this.echoes.map(function (e) {
          return { x: e.x, y: e.y, facing: e.facing };
        }),
        crates: this.crates.map(function (c) {
          return { x: c.x, y: c.y };
        }),
        doorOpen: this.doors.map(function (d) { return d.open; }),
        platePressed: this.plates.concat(this.syncPlates).map(function (p) { return p.pressed; }),
        shardCollected: this.shardCollected,
        sealTriggered: this.sealTriggered,
        syncLatched: this.syncLatched,
        actionTick: this.actionTick,
        totalActions: this.totalActions,
        currentActions: this.currentActions.map(cloneAction),
        status: this.status,
        won: this.won,
        winStats: this.winStats
      };
    }

    _restoreSnapshot(s) {
      this.player = { x: s.player.x, y: s.player.y, facing: s.player.facing };
      for (var i = 0; i < this.echoes.length; i++) {
        this.echoes[i].x = s.echoes[i].x;
        this.echoes[i].y = s.echoes[i].y;
        this.echoes[i].facing = s.echoes[i].facing;
        this.echoes[i].replayIndex = s.actionTick;
      }
      for (i = 0; i < this.crates.length; i++) {
        this.crates[i].x = s.crates[i].x;
        this.crates[i].y = s.crates[i].y;
      }
      for (i = 0; i < this.doors.length; i++) this.doors[i].open = s.doorOpen[i];
      var plates = this.plates.concat(this.syncPlates);
      for (i = 0; i < plates.length; i++) plates[i].pressed = s.platePressed[i];
      this.shardCollected = s.shardCollected;
      this.sealTriggered = s.sealTriggered;
      this.syncLatched = s.syncLatched;
      this.actionTick = s.actionTick;
      this.totalActions = s.totalActions;
      this.currentActions = s.currentActions.map(cloneAction);
      this.status = s.status;
      this.won = s.won;
      this.winStats = s.winStats;
    }

    /* ---------------------------------------------------------------------
     * 机制重算：压力板 → 同步 → 门
     * ------------------------------------------------------------------- */
    _isOccupied(x, y) {
      return this.occupantsAt(x, y).length > 0;
    }

    _recomputeMechanisms(opts) {
      opts = opts || {};
      var events = opts.events || [];
      var i;
      var allPlates = this.plates.concat(this.syncPlates);
      for (i = 0; i < allPlates.length; i++) {
        var p = allPlates[i];
        var was = p.pressed;
        if (p.kind === 'sync' && p.cradle) {
          // 质量槽只认箱子的重量。
          p.pressed = !!this.crateAt(p.x, p.y);
        } else {
          p.pressed = this._isOccupied(p.x, p.y);
        }
        if (p.pressed !== was) {
          events.push({
            type: 'plate', x: p.x, y: p.y, pressed: p.pressed,
            plateKind: p.kind, group: p.group, node: p.node || null, cradle: !!p.cradle
          });
        }
      }

      // 同步节点：全部同时被占据 → 同步门永久解锁（本循环内）
      if (!this.syncLatched && this.syncPlates.length > 0) {
        var allPressed = this.syncPlates.every(function (sp) { return sp.pressed; });
        if (allPressed) {
          this.syncLatched = true;
          events.push({ type: 'sync', nodes: this.syncPlates.length });
        }
      }

      var byGroup = {};
      for (i = 0; i < this.plates.length; i++) {
        var plate = this.plates[i];
        byGroup[plate.group] = byGroup[plate.group] || false;
        if (plate.pressed) byGroup[plate.group] = true;
      }

      for (i = 0; i < this.doors.length; i++) {
        var door = this.doors[i];
        var shouldOpen = false;
        if (door.kind === 'hold') shouldOpen = !!byGroup[door.group];
        else if (door.kind === 'seal') shouldOpen = !this.sealTriggered;
        else if (door.kind === 'sync') shouldOpen = this.syncLatched;
        if (door.open !== shouldOpen) {
          door.open = shouldOpen;
          events.push({
            type: 'door', x: door.x, y: door.y, group: door.group,
            open: shouldOpen, doorKind: door.kind
          });
        }
      }

      // 防止同步门没有打开的情况被视觉层误读
      if (this.syncLatched && this.syncGateCount > 0) {
        for (i = 0; i < this.doors.length; i++) {
          if (this.doors[i].kind === 'sync') this.doors[i].open = true;
        }
      }
      return events;
    }

    /* ---------------------------------------------------------------------
     * 移动与推箱
     * ------------------------------------------------------------------- */
    _tryPushCrate(crate, dx, dy, events) {
      var nx = crate.x + dx;
      var ny = crate.y + dy;
      var cell = this.cellAt(nx, ny);
      if (!cell || cell.wall) return false;
      if (cell.exit) return false;
      if (cell.shard) return false;
      var door = this.doorAtCell(nx, ny);
      if (door && !door.open) return false;
      if (this.crateAt(nx, ny)) return false;
      var fromX = crate.x;
      var fromY = crate.y;
      crate.x = nx;
      crate.y = ny;
      events.push({
        type: 'crateMove', crateId: crate.id, anchor: crate.anchor,
        from: { x: fromX, y: fromY }, to: { x: nx, y: ny }
      });
      return true;
    }

    _tryMoveActor(actor, dir, kind, events) {
      var d = DIRS[dir];
      if (!d) return { ok: false, reason: 'invalid-dir' };
      actor.facing = dir;
      var nx = actor.x + d.x;
      var ny = actor.y + d.y;
      var cell = this.cellAt(nx, ny);
      if (!cell || cell.wall) {
        events.push({ type: 'blocked', actor: kind, dir: dir, reason: 'wall', x: nx, y: ny });
        return { ok: false, reason: 'wall' };
      }
      var door = this.doorAtCell(nx, ny);
      if (door && !door.open) {
        events.push({ type: 'blocked', actor: kind, dir: dir, reason: 'door', x: nx, y: ny, doorGroup: door.group });
        return { ok: false, reason: 'door', doorGroup: door.group };
      }
      var crate = this.crateAt(nx, ny);
      if (crate) {
        if (!this._tryPushCrate(crate, d.x, d.y, events)) {
          events.push({ type: 'blocked', actor: kind, dir: dir, reason: 'crate', x: nx, y: ny });
          return { ok: false, reason: 'crate' };
        }
      }
      var fromX = actor.x;
      var fromY = actor.y;
      actor.x = nx;
      actor.y = ny;
      var moveEvent = {
        type: kind === 'player' ? 'playerMove' : 'echoMove',
        actor: kind, dir: dir,
        from: { x: fromX, y: fromY }, to: { x: nx, y: ny }
      };
      if (kind === 'echo') moveEvent.echoId = actor.id;
      events.push(moveEvent);

      if (kind === 'player') {
        if (cell.shard && !this.shardCollected) {
          this.shardCollected = true;
          events.push({ type: 'shard', x: nx, y: ny });
        }
        if (cell.sealTrigger && !this.sealTriggered) {
          this.sealTriggered = true;
          events.push({ type: 'seal', x: nx, y: ny, active: true });
        }
      } else if (kind === 'echo') {
        if (cell.sealTrigger && !this.sealTriggered) {
          this.sealTriggered = true;
          events.push({ type: 'seal', x: nx, y: ny, active: true, echoId: actor.id });
        }
      }

      return { ok: true, x: nx, y: ny, enterShard: kind === 'player' && cell.shard };
    }

    /* ---------------------------------------------------------------------
     * 玩家执行一个动作（内部统一入口）
     * ------------------------------------------------------------------- */
    _performPlayerAction(action) {
      if (this.status !== 'playing') {
        return { ok: false, reason: 'not-playing', events: [] };
      }
      var events = [];
      var snapshot = this._takeSnapshot();
      var i;

      // 1) 既有回响先重演本刻动作。回响可以打开门或推箱，从而改变玩家本刻的可行性。
      for (i = 0; i < this.echoes.length; i++) {
        var echo = this.echoes[i];
        var echoAction = echo.actions[this.actionTick];
        if (!echoAction) continue;
        if (echoAction.type === 'wait') {
          events.push({ type: 'echoWait', echoId: echo.id });
        } else {
          this._tryMoveActor(echo, echoAction.dir, 'echo', events);
        }
        this._recomputeMechanisms({ events: events });
      }

      // 2) 玩家动作
      var outcome;
      if (action.type === 'wait') {
        outcome = { ok: true, reason: 'wait' };
        events.push({ type: 'playerWait' });
      } else {
        outcome = this._tryMoveActor(this.player, action.dir, 'player', events);
      }

      // 玩家动作不成立时不消耗时间；把回响本刻的移动也回滚，避免“撞墙让回响偷跑”。
      if (!outcome.ok) {
        this._restoreSnapshot(snapshot);
        if (action.dir) this.player.facing = action.dir;
        return {
          ok: false, reason: outcome.reason || 'blocked', dir: action.dir,
          events: [], tick: this.actionTick
        };
      }

      // 3) 重算压力板 / 门 / 同步；玩家可能压上或离开压力板
      this._recomputeMechanisms({ events: events });

      // 4) 记录动作，推进时间
      var recorded = {
        type: action.type,
        dir: action.dir || null,
        x: this.player.x,
        y: this.player.y,
        facing: this.player.facing
      };
      this.currentActions.push(recorded);
      this.actionTick += 1;
      this.totalActions += 1;
      this.undoStack.push(snapshot);
      if (this.undoStack.length > 200) this.undoStack.shift();

      // 5) 出口判定
      if (this.player.x === this.exit.x && this.player.y === this.exit.y) {
        this.status = 'won';
        this.won = true;
        this.winStats = {
          loop: this.loop,
          echoesUsed: this.rewindsUsed,
          actions: this.totalActions,
          currentLoopActions: this.actionTick,
          shardCollected: this.shardCollected,
          parActions: this.level.parActions || null,
          parEchoes: this.level.parEchoes || null
        };
        events.push({ type: 'win', x: this.player.x, y: this.player.y, stats: this.winStats });
      }

      return {
        ok: true,
        reason: outcome.reason || 'moved',
        dir: action.dir || null,
        tick: this.actionTick,
        won: this.won,
        events: events
      };
    }

    move(dir) {
      if (!DIRS[dir]) return { ok: false, reason: 'invalid-dir', events: [] };
      return this._performPlayerAction({ type: 'move', dir: dir });
    }

    wait() {
      return this._performPlayerAction({ type: 'wait' });
    }

    /* ---------------------------------------------------------------------
     * 回响：倒带 + 刻录当前循环
     * ------------------------------------------------------------------- */
    rewind() {
      if (this.status !== 'playing') {
        return { ok: false, reason: 'not-playing', events: [] };
      }
      if (this.rewindsLeft <= 0) {
        return { ok: false, reason: 'no-charge', events: [] };
      }
      if (this.currentActions.length === 0) {
        return { ok: false, reason: 'empty-loop', events: [] };
      }

      var events = [];
      var recordedActions = this.currentActions.map(cloneAction);
      var recordedPath = this.currentActions.map(function (a) { return { x: a.x, y: a.y }; });
      var newEcho = {
        id: 'echo-' + (++this.echoSerial),
        no: this.echoSerial,
        actions: recordedActions,
        path: recordedPath.slice(),
        x: this.playerStart.x,
        y: this.playerStart.y,
        facing: 'down',
        replayIndex: 0
      };
      this.echoes.push(newEcho);
      this.rewindsUsed += 1;
      this.loop += 1;
      this.lastLoopPath = recordedPath.slice();
      events.push({
        type: 'rewind',
        echoId: newEcho.id,
        echoNo: newEcho.no,
        recorded: recordedActions.length,
        loop: this.loop,
        path: [{ x: this.playerStart.x, y: this.playerStart.y }].concat(recordedPath)
      });

      // 常规物体回溯；因果锚保留在未来位置。
      for (var i = 0; i < this.crates.length; i++) {
        var crate = this.crates[i];
        if (!crate.anchor) {
          crate.x = crate.startX;
          crate.y = crate.startY;
        }
      }
      this.player = { x: this.playerStart.x, y: this.playerStart.y, facing: 'down' };
      var startX = this.playerStart.x;
      var startY = this.playerStart.y;
      this.echoes.forEach(function (e) {
        e.x = startX;
        e.y = startY;
        e.facing = 'down';
        e.replayIndex = 0;
      });
      this.shardCollected = false;
      this.sealTriggered = false;
      this.syncLatched = false;
      this.actionTick = 0;
      this.currentActions = [];
      this.undoStack = [];
      this.status = 'playing';
      this.won = false;
      this.winStats = null;
      this._recomputeMechanisms({ events: events });
      // 因果锚可能在循环起点压住压力板 / 同步节点；在事件里标记“因果残留”
      var anchorOnPlate = this.crates.some(function (c) {
        if (!c.anchor) return false;
        return (this.plates.concat(this.syncPlates)).some(function (p) { return p.x === c.x && p.y === c.y && p.pressed; });
      }, this);
      if (anchorOnPlate) events.push({ type: 'anchorPersist' });

      return {
        ok: true,
        reason: 'rewound',
        events: events,
        echo: { id: newEcho.id, no: newEcho.no, actions: recordedActions.length },
        loop: this.loop,
        tick: 0
      };
    }

    /* ---------------------------------------------------------------------
     * 撤销一步（不回溯已消耗的回响）
     * ------------------------------------------------------------------- */
    undo() {
      if (this.status !== 'playing') return { ok: false, reason: 'not-playing' };
      if (!this.undoStack.length) return { ok: false, reason: 'empty-undo' };
      var previousActions = this.currentActions.length;
      var snapshot = this.undoStack.pop();
      this._restoreSnapshot(snapshot);
      this.echoes.forEach(function (e) { e.replayIndex = snapshot.actionTick; });
      return {
        ok: true,
        reason: 'undone',
        fromActions: previousActions,
        toActions: this.currentActions.length,
        tick: this.actionTick
      };
    }

    /**
     * 关卡内调试/叙事用：从玩家动作路径推演动态位置。
     * 只用于表现（如轨迹虚线），不会改变状态。
     */
    tracePath(start, actions) {
      var x = start.x;
      var y = start.y;
      var pts = [{ x: x, y: y }];
      for (var i = 0; i < actions.length; i++) {
        var a = actions[i];
        if (a.type === 'move' && DIRS[a.dir]) {
          x += DIRS[a.dir].x;
          y += DIRS[a.dir].y;
          pts.push({ x: x, y: y });
        }
      }
      return pts;
    }
  }

  return {
    VERSION: VERSION,
    DIRS: DIRS,
    ChronoGame: ChronoGame
  };
});
