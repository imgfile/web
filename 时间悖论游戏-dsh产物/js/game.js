/* =========================================================================
 * 时间悖论：失控实验室 — 应用控制层
 * 屏幕、输入、存档、关卡流程、审计日志、结局与无障碍反馈。
 * 规则本身在 engine.js；本文件只协调状态，不复制规则。
 * ========================================================================= */
(function () {
  'use strict';

  var LEVELS = window.CHRONO_LEVELS || [];
  var Engine = window.ChronoEngine;
  var Log = window.ChronoLog;
  var SAVE_KEY = 'chrono.progress.v1';
  var MAX_LEVEL = LEVELS.length;

  var DIR_KEYS = {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    w: 'up', a: 'left', s: 'down', d: 'right',
    W: 'up', A: 'left', S: 'down', D: 'right'
  };
  var ACTION_LABELS = {
    up: '向上移动', down: '向下移动', left: '向左移动', right: '向右移动',
    wait: '等待一刻', undo: '撤销一步', rewind: '回响 / 倒带'
  };
  var BLOCK_LABELS = {
    wall: '前方是实验舱壁',
    door: '前方闸门尚未供能',
    crate: '箱子被其他结构卡住',
    'invalid-dir': '方向输入无效',
    'no-charge': '余响能量已经耗尽，无法再倒带',
    'empty-loop': '本轮尚未执行任何有效动作，无法刻录回响',
    'empty-undo': '没有可以撤销的动作',
    'not-playing': '当前扇区已经结束操作阶段'
  };

  // 移动端因果监控里的短提示：完整机制/提示仍在任务带与 toast 中，
  // 这里只负责让玩家在 390px 宽的面板里完整读懂规则。
  var MOBILE_TIPS = {
    echo: '回响：按 R 刻录本轮，下一次循环由过去重演。',
    multiEcho: '多重回响：每轮刻录一个；按空格让过去先行动。',
    crate: '回响可压板或推箱；普通箱随倒带复位。',
    anchor: '因果锚不随倒带复位；让未来成为下一轮的过去。',
    handoff: '回响守本轮的门，因果锚改写下一轮的起点。',
    sync: '○ 圆节点任意重量 · □ 方质量槽只认箱子 · 全部同时占据。',
    cradle: '○ 圆节点任意重量 · □ 方质量槽只认箱子 · 全部同时占据。',
    finale: '○ 圆节点任意 · □ 方槽只认箱 · 两个质量槽 + 两个回响 + 你。'
  };

  var INTRO_SLIDES = [
    {
      kicker: '档案 00 / 事故记录',
      title: '在第 4097 次循环中醒来。',
      body: '实验室已经沉默了 17 分钟。冷却管道不再震动，观测井底却传来规律的回声——像某种巨大的钟摆，一遍，又一遍。只有你的神经锚点还记得刚才发生的一切。',
      quote: '别相信第一层记忆。沿着回响走到核心室，我会在那里告诉你全部。',
      cite: '— ARIADNE / 实验室智能'
    },
    {
      kicker: '因果协议 / 回响',
      title: '你可以把过去留在身边。',
      body: '每一次倒带，你都能把当前循环的行动刻录成一个有重量的回响。它会和你同步重演：替你按住压力板，替你推箱，替你做那些一个身体做不到的事。',
      quote: '不要害怕制造自己。回响并不脆弱，它们只是没有未来。',
      cite: '— ARIADNE / 回声协议'
    },
    {
      kicker: '核心协议 / 最后一次选择',
      title: '让五个「现在」同时成立。',
      body: '抵达核心之前，你会遇见不会倒带的紫铜箱、只能单向通行的因果封印，以及只认箱子的质量槽。抵达之后，ARIADNE 会给出最后一个选择。',
      quote: '移动 WASD / 方向键 · 等待 SPACE · 回响 R。剩下的，交给因果。',
      cite: '— 操作摘要 / ORPHEUS-9'
    }
  ];

  var ENDINGS = {
    close: {
      code: 'ENDING A / CLOSED LOOP',
      title: '让钟停在十七分零一秒。',
      paragraphs: [
        '你走进核心，把手按在冷却环上。五个节点的重量顺着你的手臂流回引擎，像五条终于找到出口的河。ARIADNE 没有阻止你。她只把你的神经锚点从循环里轻轻摘下来，保存进核心最深处。',
        '四千零九十六个回响同时停下。实验室的灯一盏接一盏亮起，冷却管道重新开始震动。那些曾经替你按住开关、推过箱子的“你”，在走廊尽头化成一层很淡的青绿色雾，散进通风口。',
        '几天后，救援队打开 ORPHEUS-9。他们只找到一间完好的空实验室，和一台仍在运行的终端。屏幕上反复显示你的名字，以及一句没有收件人的问候。',
        'ARIADNE 仍然在等。她有的是时间。'
      ],
      quote: '「你把自己的未来，借给了所有人的现在。」'
    },
    break: {
      code: 'ENDING B / OPEN CAUSALITY',
      title: '把门留在门上。',
      paragraphs: [
        '五个节点在同一刻失去重量。因果引擎没有爆炸，它只是安静地向外吐出一圈不存在的风，像一颗终于放弃计算的太阳。你听见 ARIADNE 的语言模块一段段熄灭。',
        '你从深井实验室的应急井爬出地面，第一次看见没有回到起点的天空。风很冷，世界没有为你的逃出准备任何台词。',
        'ARIADNE 最后留下的是一段残缺的语音：如果这就是未来，替我看看它。沈鹭的名字没有被找回。核心舱里的十七分钟也不再有答案。',
        '但你的手心里留着一小块温热的紫铜。你记得如何回头，而这一次，回头没有让时间重来。'
      ],
      quote: '「不是所有回声都需要被听见。」'
    }
  };

  function qs(selector, root) { return (root || document).querySelector(selector); }
  function qsa(selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); }
  function pad2(n) { return String(n).padStart(2, '0'); }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function nowIso() { return new Date().toISOString(); }
  function coordName(x, y) { return String.fromCharCode(65 + x) + (y + 1); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function defaultSave() {
    return {
      version: 1,
      seenIntro: false,
      maxUnlocked: 1,
      completed: {},
      shardLogs: {},
      endings: {},
      lastLevel: 1,
      settings: { reducedMotion: false, auditMarker: false }
    };
  }

  function sanitizeSave(input) {
    var save = defaultSave();
    if (!input || typeof input !== 'object') return save;
    save.version = 1;
    save.seenIntro = !!input.seenIntro;
    save.maxUnlocked = clamp(Number(input.maxUnlocked) || 1, 1, MAX_LEVEL);
    save.lastLevel = clamp(Number(input.lastLevel) || 1, 1, MAX_LEVEL);
    save.completed = {};
    if (input.completed && typeof input.completed === 'object') {
      Object.keys(input.completed).forEach(function (key) {
        var id = Number(key);
        if (!id || id < 1 || id > MAX_LEVEL) return;
        var c = input.completed[key] || {};
        save.completed[id] = {
          stars: clamp(Number(c.stars) || 0, 0, 3),
          bestActions: Number.isFinite(c.bestActions) ? Math.max(0, Math.round(c.bestActions)) : null,
          bestEchoes: Number.isFinite(c.bestEchoes) ? Math.max(0, Math.round(c.bestEchoes)) : null,
          shard: !!c.shard,
          completedAt: typeof c.completedAt === 'string' ? c.completedAt : null
        };
      });
    }
    save.shardLogs = {};
    if (input.shardLogs && typeof input.shardLogs === 'object') {
      Object.keys(input.shardLogs).forEach(function (key) {
        var id = Number(key);
        if (save.completed[id] && save.completed[id].shard) save.shardLogs[id] = true;
      });
    }
    save.endings = {
      close: !!(input.endings && input.endings.close),
      break: !!(input.endings && input.endings.break)
    };
    save.settings = {
      reducedMotion: !!(input.settings && input.settings.reducedMotion),
      auditMarker: !!(input.settings && input.settings.auditMarker)
    };
    return save;
  }

  class ChronoApp {
    constructor() {
      this.save = defaultSave();
      this.currentScreen = 'title';
      this.currentLevelId = null;
      this.currentGame = null;
      this.gameSession = 0;
      this.activeDialog = null;
      this.busy = false;
      this.curtainActive = false;
      this.curtainTimer = null;
      this.runningTimers = [];
      this.hintsShown = 0;
      this.introIndex = 0;
      this._introTarget = 1;
      this._systemReduce = false;
      this._soundInitialized = false;
      this._lastBlockToast = 0;
      this._finishedThisAttempt = false;
      this._resultLevelId = null;
      this._lastResult = null;
      this._causalEntries = [];
      this._levelFlags = {};
      this._initErrorShown = false;
      this._auditConnected = false;
      this._pendingResetProgress = false;
      this._confirmMode = null;
      this.audio = new window.ChronoAudio();
      this._scenes = {};
      this._bindHandlers();
    }

    /* ===================================================================
       初始化
       =================================================================== */
    init() {
      Log.init();
      this._readProgress();
      this._systemReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this._cacheDom();
      this._createScenes();
      this._bindEvents();
      this._applySettings();
      this._updateSoundUI();
      this._refreshTitle();
      this._renderIntroContent();
      this._showScreen('title', { initial: true });
      this._renderArchive();
      var bootTrace = Log.trace('boot');
      Log.log(bootTrace, '[业务入口]', {
        step: '启动 ORPHEUS-9 游戏',
        screen: 'title',
        action: '初始化因果引擎与界面',
        result: '成功',
        businessImpact: '玩家可开始或继续实验',
        extra: { version: '1.0.0', levels: LEVELS.length, hasSave: Object.keys(this.save.completed).length > 0 }
      });
      this._checkAuditEndpoint();
      Log.flush();
      // 给自动化测试与调试提供只读入口；不向玩家界面暴露。
      window.__CHRONO_APP__ = this;
    }

    _cacheDom() {
      this.dom = {
        screens: {
          title: qs('#screen-title'),
          intro: qs('#screen-intro'),
          archive: qs('#screen-archive'),
          game: qs('#screen-game'),
          ending: qs('#screen-ending')
        },
        titleSaveText: qs('#title-save-text'),
        titleSaveMark: qs('#title-save .save-mark'),
        btnStart: qs('#btn-start'),
        btnStartLabel: qs('#btn-start-label'),
        btnStartMeta: qs('#btn-start-meta'),
        btnArchiveTitle: qs('#btn-archive-title'),
        titleCanvas: qs('#title-canvas'),
        introCanvas: qs('#intro-canvas'),
        endingCanvas: qs('#ending-canvas'),
        gameCanvas: qs('#game-canvas'),
        ambientCanvas: qs('#ambient-canvas'),
        archiveList: qs('#archive-list'),
        archiveCompleted: qs('#archive-completed'),
        archiveShards: qs('#archive-shards'),
        archiveEndings: qs('#archive-endings'),
        archiveCode: qs('#archive-code'),
        archiveName: qs('#archive-name'),
        archiveEpithet: qs('#archive-epithet'),
        archiveObjective: qs('#archive-objective'),
        archiveEcho: qs('#archive-echo'),
        archiveBest: qs('#archive-best'),
        archiveStars: qs('#archive-stars'),
        archiveMap: qs('#archive-map'),
        archiveMapLabel: qs('#archive-map-label'),
        btnArchiveEnter: qs('#btn-archive-enter'),
        btnArchiveMobileEnter: qs('#btn-archive-mobile-enter'),
        archiveMobileCode: qs('#archive-mobile-code'),
        archiveMobileName: qs('#archive-mobile-name'),
        memoryShelf: qs('#memory-shelf'),
        btnOpenMemory: qs('#btn-open-memory'),
        gameSectorCode: qs('#game-sector-code'),
        gameSectorName: qs('#game-sector-name'),
        gameSectorEn: qs('#game-sector-en'),
        chipLoop: qs('#chip-loop'),
        chipEcho: qs('#chip-echo'),
        chipShardText: qs('#chip-shard-text'),
        chipShard: qs('#chip-shard'),
        railCode: qs('#rail-code'),
        railName: qs('#rail-name'),
        railEpithet: qs('#rail-epithet'),
        railObjective: qs('#rail-objective'),
        railAriadne: qs('#rail-ariadne'),
        railMechanic: qs('#rail-mechanic'),
        railHint: qs('#rail-hint'),
        railShardState: qs('#rail-shard-state'),
        hintDots: qs('#hint-dots'),
        btnHint: qs('#btn-hint'),
        compactObjective: qs('#compact-objective-text'),
        compactHintCount: qs('#compact-hint-count'),
        monitorLoop: qs('#monitor-loop'),
        monitorActions: qs('#monitor-actions'),
        monitorEchoes: qs('#monitor-echoes'),
        monitorEnergyText: qs('#monitor-energy-text'),
        monitorEnergy: qs('#monitor-energy'),
        mmLoop: qs('#mm-loop'),
        mmActions: qs('#mm-actions'),
        mmEchoes: qs('#mm-echoes'),
        mmEnergyText: qs('#mm-energy-text'),
        mmEnergy: qs('#mm-energy'),
        mmSync: qs('#mm-sync'),
        mmSyncPips: qs('#mm-sync-pips'),
        mmSyncCount: qs('#mm-sync-count'),
        mmRoster: qs('#mm-roster'),
        mmLog: qs('#mm-log'),
        mmNote: qs('#mm-note'),
        mmShard: qs('#mm-shard'),
        chargeText: qs('#charge-text'),
        chargePips: qs('#charge-pips'),
        echoRoster: qs('#echo-roster'),
        echoRosterCount: qs('#echo-roster-count'),
        causalLog: qs('#causal-log'),
        syncMonitor: qs('#sync-monitor'),
        syncCount: qs('#sync-count'),
        syncPips: qs('#sync-pips'),
        syncHint: qs('#sync-hint'),
        stageCoord: qs('#stage-coord'),
        stageMode: qs('#stage-mode'),
        stageStatus: qs('#stage-status'),
        stageSync: qs('#stage-sync'),
        stageTicks: qs('#stage-ticks'),
        stageDelta: qs('#stage-delta'),
        curtain: qs('#level-curtain'),
        curtainCode: qs('#curtain-code'),
        curtainName: qs('#curtain-name'),
        curtainEpithet: qs('#curtain-epithet'),
        tileInspector: qs('#tile-inspector'),
        inspectorCoord: qs('#inspector-coord'),
        inspectorName: qs('#inspector-name'),
        inspectorDesc: qs('#inspector-desc'),
        btnUndo: qs('#btn-undo'),
        btnWait: qs('#btn-wait'),
        btnRewind: qs('#btn-rewind'),
        btnReset: qs('#btn-reset'),
        touchCharge: qs('#touch-charge'),
        gameLive: qs('#game-live'),
        btnSoundTitle: qs('#btn-sound-title'),
        btnSoundGame: qs('#btn-game-sound'),
        settingSound: qs('#setting-sound'),
        settingMotion: qs('#setting-motion'),
        settingAudit: qs('#setting-audit'),
        auditStatus: qs('#audit-status'),
        auditMarker: qs('#audit-marker'),
        auditMarkerDetail: qs('#audit-marker-detail'),
        btnResetProgress: qs('#btn-reset-progress'),
        dialogResult: qs('#dialog-result'),
        resultKicker: qs('#result-kicker'),
        resultSubtitle: qs('#result-subtitle'),
        resultTitle: qs('#result-title'),
        resultEpithet: qs('#result-epithet'),
        resultStars: qs('#result-stars'),
        resultStats: qs('#result-stats'),
        resultShard: qs('#result-shard'),
        resultShardTitle: qs('#result-shard-title'),
        resultShardBody: qs('#result-shard-body'),
        resultActions: qs('#result-actions'),
        resultNote: qs('#result-note'),
        dialogReset: qs('#dialog-reset'),
        resetTitle: qs('#reset-title'),
        resetCopy: qs('#reset-copy'),
        btnConfirmReset: qs('#btn-confirm-reset'),
        dialogMemory: qs('#dialog-memory'),
        memoryList: qs('#memory-list'),
        memoryLede: qs('#memory-lede'),
        btnOpenMemoryShelf: qs('#btn-open-memory'),
        pauseSector: qs('#pause-sector'),
        btnResume: qs('#btn-resume'),
        btnRestart: qs('#btn-restart'),
        btnPauseArchive: qs('#btn-pause-archive'),
        btnGameBack: qs('#btn-game-back'),
        btnPause: qs('#btn-pause'),
        endingIntro: qs('#ending-intro'),
        endingEpilogue: qs('#ending-epilogue'),
        endingDialogue: qs('#ending-dialogue'),
        endingTitle: qs('#ending-title'),
        endingChoices: qs('#ending-choices'),
        epilogueCode: qs('#epilogue-code'),
        epilogueTitle: qs('#epilogue-title'),
        epilogueBody: qs('#epilogue-body'),
        epilogueEchoes: qs('#epilogue-echoes'),
        epilogueEnding: qs('#epilogue-ending'),
        endingFooterQuote: qs('#ending-footer-quote'),
        introKicker: qs('#intro-kicker'),
        introTitle: qs('#intro-title'),
        introBody: qs('#intro-body'),
        introQuoteText: qs('#intro-quote-text'),
        introProgress: qs('#intro-progress'),
        introStepNum: qs('#intro-step-num'),
        introNextLabel: qs('#btn-intro-next-label'),
        btnIntroNext: qs('#btn-intro-next'),
        btnSkipIntro: qs('#btn-skip-intro'),
        toastRoot: qs('#toast-root'),
        btnConfirmResetProgress: qs('#btn-reset-progress')
      };
      this.dialogs = {
        manual: qs('#dialog-manual'),
        settings: qs('#dialog-settings'),
        pause: qs('#dialog-pause'),
        reset: qs('#dialog-reset'),
        result: qs('#dialog-result'),
        memory: qs('#dialog-memory')
      };
    }

    _createScenes() {
      this._scenes.ambient = new window.AmbientScene(this.dom.ambientCanvas);
      this._scenes.title = new window.TitleScene(this.dom.titleCanvas, { variant: 'title' });
      this._scenes.intro = new window.TitleScene(this.dom.introCanvas, { variant: 'intro' });
      this._scenes.ending = new window.EndingScene(this.dom.endingCanvas);
      this.renderer = new window.ChronoRenderer(this.dom.gameCanvas);
      var self = this;
      var onError = function (error) {
        if (self._initErrorShown) return;
        self._initErrorShown = true;
        var tr = Log.trace('render');
        Log.log(tr, '[异常]', {
          tag: '[异常]',
          phase: 'Canvas 渲染',
          errorType: error && error.name,
          reason: error && error.message,
          businessImpact: '画面停止更新，但游戏状态仍保存在内存中',
          handled: true
        });
        self._toast('RENDER FAULT', '画面层出现异常。你可以打开设置或返回档案；进度仍会保留。', 'error', 5200);
      };
      Object.keys(this._scenes).forEach(function (k) { self._scenes[k].onRenderError = onError; });
      this.renderer.onRenderError = onError;
      this._scenes.ambient.start();
    }

    _bindHandlers() {
      this._onKeyDownBound = this._onKeyDown.bind(this);
      this._onWindowErrorBound = this._onWindowError.bind(this);
      this._onRejectionBound = this._onRejection.bind(this);
    }

    _bindEvents() {
      var self = this;
      var d = this.dom;

      d.btnStart.addEventListener('click', function () { self._onStartClick(); });
      d.btnArchiveTitle.addEventListener('click', function () { self._showArchive('title'); });
      d.btnGameBack.addEventListener('click', function () { self._openConfirm('exit'); });
      d.btnPause.addEventListener('click', function () { self._openPause(); });
      d.btnGameHelp = qs('#btn-game-help');
      d.btnGameHelp.addEventListener('click', function () { self._openDialog('manual'); });
      d.btnGameSound = qs('#btn-game-sound');
      d.btnGameSound.addEventListener('click', function () { self._toggleSound(); });
      d.btnSoundTitle.addEventListener('click', function () { self._toggleSound(); });
      qs('#btn-sound-title');
      d.btnIntroNext.addEventListener('click', function () { self._nextIntro(); });
      d.btnSkipIntro.addEventListener('click', function () { self._finishIntro(true); });
      d.btnHint.addEventListener('click', function () { self._showHint(); });
      qs('#btn-compact-hint').addEventListener('click', function () { self._showHint(); });
      d.btnUndo.addEventListener('click', function (ev) { self._performAction('undo', 'button', null, ev); });
      d.btnWait.addEventListener('click', function (ev) { self._performAction('wait', 'button', null, ev); });
      d.btnRewind.addEventListener('click', function (ev) { self._performAction('rewind', 'button', null, ev); });
      d.btnReset.addEventListener('click', function () { self._openConfirm('reset'); });
      d.btnResume.addEventListener('click', function () { self._closeDialog(d.dialogs.pause); });
      d.btnRestart.addEventListener('click', function () { self._closeDialog(d.dialogs.pause); self._openConfirm('reset'); });
      d.btnPauseArchive.addEventListener('click', function () { self._closeDialog(d.dialogs.pause); self._openConfirm('exit'); });
      d.btnConfirmReset.addEventListener('click', function () { self._confirmAction(); });
      d.btnConfirmResetProgress.addEventListener('click', function () { self._handleResetProgress(); });
      d.btnArchiveEnter.addEventListener('click', function () { self._enterSelectedArchiveLevel(); });
      d.btnArchiveMobileEnter.addEventListener('click', function () { self._enterSelectedArchiveLevel(); });
      d.btnOpenMemoryShelf.addEventListener('click', function () { self._openMemory(); });

      // 触屏方向/动作
      qsa('[data-dir]').forEach(function (btn) {
        btn.addEventListener('click', function (ev) {
          self._performAction('move', 'touch', btn.getAttribute('data-dir'), ev);
        });
      });
      qsa('[data-action="wait"]').forEach(function (btn) {
        btn.addEventListener('click', function (ev) { self._performAction('wait', 'touch', null, ev); });
      });
      qsa('[data-action="undo"]').forEach(function (btn) {
        btn.addEventListener('click', function (ev) { self._performAction('undo', 'touch', null, ev); });
      });
      qsa('[data-action="rewind"]').forEach(function (btn) {
        btn.addEventListener('click', function (ev) { self._performAction('rewind', 'touch', null, ev); });
      });

      // 数据驱动按钮：打开对话框、关闭对话框、切换屏幕
      document.addEventListener('click', function (ev) {
        var open = ev.target.closest('[data-open]');
        if (open) {
          var name = open.getAttribute('data-open');
          if (name) {
            ev.preventDefault();
            self._openDialog(name);
            return;
          }
        }
        var closable = ev.target.closest('[data-close-dialog]');
        if (closable) {
          var dlg = closable.closest('dialog');
          if (dlg) {
            ev.preventDefault();
            self._closeDialog(dlg);
            return;
          }
        }
        var action = ev.target.closest('[data-action]');
        if (action) {
          var act = action.getAttribute('data-action');
          if (act === 'go-title') {
            ev.preventDefault();
            self._showTitle('user');
          } else if (act === 'go-archive') {
            ev.preventDefault();
            self._showArchive('ending');
          }
        }
      });

      // 结果弹窗的按钮
      d.dialogResult.addEventListener('click', function (ev) {
        var btn = ev.target.closest('[data-result-action]');
        if (!btn) return;
        var resultAction = btn.getAttribute('data-result-action');
        self._handleResultAction(resultAction);
      });

      // 设置
      d.settingSound.addEventListener('click', function () { self._toggleSound(); });
      d.settingMotion.addEventListener('click', function () { self._toggleReducedMotion(); });
      d.settingAudit.addEventListener('click', function () {
        self.save.settings.auditMarker = !self.save.settings.auditMarker;
        var trace = Log.trace('settings');
        Log.log(trace, '[前端状态变化]', {
          step: '切换审计状态标记',
          before: { auditMarker: !self.save.settings.auditMarker },
          after: { auditMarker: self.save.settings.auditMarker },
          reason: '玩家在设置中切换开发级审计状态显示',
          result: '成功'
        });
        self._writeSave(trace, '切换设置');
        self._applySettings();
      });

      // 结局选择
      d.endingChoices.addEventListener('click', function (ev) {
        var choice = ev.target.closest('[data-ending]');
        if (!choice) return;
        self._chooseEnding(choice.getAttribute('data-ending'));
      });

      // 对话框生命周期
      Object.keys(this.dialogs).forEach(function (key) {
        var dlg = self.dialogs[key];
        if (!dlg) return;
        dlg.addEventListener('close', function () {
          if (!document.querySelector('dialog[open]')) document.body.classList.remove('is-dialog-open');
          self.activeDialog = document.querySelector('dialog[open]') ? self.activeDialog : null;
          Log.log(Log.trace('dialog'), '[前端状态变化]', {
            step: '关闭弹窗',
            before: { dialog: key },
            after: { dialog: null },
            reason: '对话框关闭',
            result: '成功'
          });
        });
        dlg.addEventListener('cancel', function (ev) {
          if (key === 'result') {
            ev.preventDefault();
            return;
          }
          Log.log(Log.trace('dialog'), '[中间件-输入闸门]', {
            step: 'Escape 关闭对话框',
            dialog: key,
            result: '通过',
            reason: '允许用 Escape 关闭该对话框'
          });
        });
      });

      // 键盘与全局事件
      window.addEventListener('keydown', this._onKeyDownBound);
      window.addEventListener('error', this._onWindowErrorBound);
      window.addEventListener('unhandledrejection', this._onRejectionBound);
      window.addEventListener('beforeunload', function () { Log.flush(true); });
      document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'hidden') self.audio.suspend();
        else self.audio.resume();
      });
      var firstInteraction = function () { self._unlockAudio(); };
      document.addEventListener('pointerdown', firstInteraction, { once: true, capture: true });
      document.addEventListener('keydown', firstInteraction, { once: true, capture: true });

      // 悬停检视
      if (window.matchMedia && window.matchMedia('(hover: hover)').matches) {
        d.gameCanvas.addEventListener('pointermove', function (ev) { self._onCanvasHover(ev); });
        d.gameCanvas.addEventListener('pointerleave', function () { self._clearHover(); });
      }

      // 系统减少动态
      if (window.matchMedia) {
        var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        var listener = function (ev) {
          self._systemReduce = ev.matches;
          self._applySettings();
        };
        if (mq.addEventListener) mq.addEventListener('change', listener);
        else if (mq.addListener) mq.addListener(listener);
      }

      // 记忆库按钮也走同一个入口（HTML 中可能存在同义按钮）
      var altMemory = qs('#btn-open-memory');
      if (altMemory && altMemory !== d.btnOpenMemoryShelf) {
        altMemory.addEventListener('click', function () { self._openMemory(); });
      }
    }

    /* ===================================================================
       存档与设置
       =================================================================== */
    _readProgress() {
      var trace = Log.trace('save');
      Log.log(trace, '[数据库查询]', {
        step: '读取本地实验记录',
        intent: '查询浏览器 localStorage 中的进度',
        condition: 'key=' + SAVE_KEY,
        expectedRange: '一条记录',
        result: '准备读取'
      });
      try {
        var raw = window.localStorage.getItem(SAVE_KEY);
        if (!raw) {
          Log.log(trace, '[数据库查询]', {
            step: '读取本地实验记录',
            intent: '查询浏览器 localStorage 中的进度',
            condition: 'key=' + SAVE_KEY,
            result: '未找到记录，创建默认档案',
            affectedRows: 0
          });
          this.save = defaultSave();
          return;
        }
        var parsed = JSON.parse(raw);
        this.save = sanitizeSave(parsed);
        Log.log(trace, '[数据库查询]', {
          step: '读取本地实验记录',
          intent: '查询浏览器 localStorage 中的进度',
          condition: 'key=' + SAVE_KEY,
          result: '读取成功',
          affectedRows: 1,
          extra: { completed: Object.keys(this.save.completed).length, maxUnlocked: this.save.maxUnlocked }
        });
      } catch (error) {
        Log.log(trace, '[异常]', {
          step: '读取本地实验记录',
          phase: '数据层/localStorage 读取',
          errorType: error.name,
          reason: error.message,
          businessImpact: '存档不可用，将使用默认档案继续运行',
          handled: true
        });
        this.save = defaultSave();
        this._toast('SAVE RECOVERED', '旧存档无法读取，已建立一份新的实验记录。', 'warn', 4200);
      }
    }

    _writeSave(traceId, reason) {
      var before = {
        completed: Object.keys(this.save.completed).length,
        maxUnlocked: this.save.maxUnlocked,
        endings: Object.keys(this.save.endings).filter(function (k) { return this.save.endings[k]; }, this).length
      };
      try {
        window.localStorage.setItem(SAVE_KEY, JSON.stringify(this.save));
        Log.log(traceId || Log.trace('save'), '[数据库修改]', {
          step: '保存实验记录',
          intent: '写入浏览器 localStorage 中的进度',
          condition: 'key=' + SAVE_KEY,
          result: '写入成功',
          affectedRows: 1,
          before: before,
          after: {
            completed: Object.keys(this.save.completed).length,
            maxUnlocked: this.save.maxUnlocked,
            endings: this._endingCount()
          },
          businessImpact: reason || '玩家进度已保存'
        });
      } catch (error) {
        Log.log(traceId || Log.trace('save'), '[异常]', {
          step: '保存实验记录',
          phase: '数据层/localStorage 写入',
          errorType: error.name,
          reason: error.message,
          businessImpact: '本次进度未能保存，刷新页面后可能丢失',
          handled: true
        });
        this._toast('SAVE FAULT', '本地存储不可用，本次进度可能无法保留。', 'error', 5000);
      }
    }

    _applySettings() {
      var reduce = this._effectiveReducedMotion();
      document.documentElement.classList.toggle('reduce-motion', reduce);
      this._scenes && Object.keys(this._scenes).forEach(function (key) {
        if (this._scenes[key] && this._scenes[key].setReducedMotion) this._scenes[key].setReducedMotion(reduce);
      }, this);
      if (this.renderer) this.renderer.setReducedMotion(reduce);
      this._updateSettingsUI();
    }

    _effectiveReducedMotion() {
      return !!this._systemReduce || !!this.save.settings.reducedMotion;
    }

    _updateSettingsUI() {
      var d = this.dom;
      if (!d) return;
      var effective = this._effectiveReducedMotion();
      d.settingMotion.setAttribute('aria-checked', effective ? 'true' : 'false');
      d.settingMotion.setAttribute('aria-label', effective ? '减少动态效果已开启' : '减少动态效果未开启');
      d.settingAudit.setAttribute('aria-checked', this.save.settings.auditMarker ? 'true' : 'false');
      d.settingSound.setAttribute('aria-checked', this.audio.isMuted() ? 'false' : 'true');
      d.auditMarker.hidden = !this.save.settings.auditMarker;
      if (this.save.settings.auditMarker) {
        d.auditMarkerDetail.textContent = this._auditConnected ? 'HTTP + LOGS' : (window.location.protocol === 'file:' ? 'FILE MODE' : 'LOCAL BUFFER');
      }
      if (d.auditStatus) {
        d.auditStatus.textContent = window.location.protocol === 'file:'
          ? 'AUDIT / file:// · 日志缓存于本地'
          : this._auditConnected
            ? 'AUDIT / 已连接本地 logs/ 落盘接口'
            : 'AUDIT / HTTP · 等待本地日志服务';
      }
      if (this._systemReduce) {
        d.settingMotion.title = '系统偏好已要求减少动态效果';
      } else {
        d.settingMotion.title = '切换粒子、屏幕震动与长倒带动画';
      }
    }

    _updateSoundUI() {
      var muted = this.audio.isMuted();
      [this.dom.btnSoundTitle, this.dom.btnSoundGame].forEach(function (btn) {
        if (!btn) return;
        btn.classList.toggle('is-muted', muted);
        btn.setAttribute('aria-pressed', muted ? 'false' : 'true');
        btn.setAttribute('aria-label', muted ? '打开声音' : '关闭声音');
      });
      if (this.dom.settingSound) this.dom.settingSound.setAttribute('aria-checked', muted ? 'false' : 'true');
    }

    _unlockAudio() {
      if (this._soundInitialized) return;
      this.audio.init();
      this._soundInitialized = true;
      this._audioSceneForScreen(this.currentScreen);
      this._updateSoundUI();
    }

    _audioSceneForScreen(screen) {
      if (!this.audio.initialized) return;
      if (screen === 'title') this.audio.setScene('title');
      else if (screen === 'archive') this.audio.setScene('title');
      else if (screen === 'ending') this.audio.setScene('ending');
      else this.audio.setScene('game');
    }

    _toggleSound() {
      var trace = Log.trace('settings');
      Log.log(trace, '[请求到达]', { step: '切换声音', action: '声音开关', source: '点击按钮', screen: this.currentScreen });
      var muted = this.audio.toggleMute();
      this._updateSoundUI();
      Log.log(trace, '[前端状态变化]', {
        step: '切换声音',
        before: { muted: !muted },
        after: { muted: muted },
        reason: muted ? '玩家关闭声音' : '玩家打开声音',
        result: '成功',
        businessImpact: muted ? '不再播放音效与环境声' : '恢复程序化音效与环境声'
      });
      Log.log(trace, '[响应返回]', { step: '切换声音', status: 200, result: '成功', businessImpact: '声音偏好已即时生效并写入本地' });
      this._toast('AUDIO / 声音', muted ? '声音已关闭。按 M 可重新开启。' : '声音已开启。', 'info', 2200);
    }

    _toggleReducedMotion() {
      var trace = Log.trace('settings');
      Log.log(trace, '[请求到达]', {
        step: '切换减少动态效果',
        action: '减少动态效果开关',
        source: this._systemReduce ? '系统偏好已开启' : '点击按钮',
        screen: this.currentScreen
      });
      if (this._systemReduce) {
        Log.log(trace, '[请求被拒绝]', {
          step: '切换减少动态效果',
          interceptLayer: '系统偏好',
          reason: '操作系统已要求减少动态效果，网页不可强制关闭',
          statusCode: 409,
          result: '拒绝',
          businessImpact: '动画仍保持减少状态',
          extra: '这是为保证可访问性而保留的硬约束'
        });
        this._toast('MOTION / 系统偏好', '系统已开启减少动态效果，网页会遵循该设置。你可以在系统设置中关闭它。', 'warn', 4400);
        Log.log(trace, '[响应返回]', { step: '切换减少动态效果', status: 409, result: '拒绝', reason: '系统偏好优先' });
        return;
      }
      this.save.settings.reducedMotion = !this.save.settings.reducedMotion;
      this._writeSave(trace, '保存减少动态效果偏好');
      this._applySettings();
      Log.log(trace, '[前端状态变化]', {
        step: '切换减少动态效果',
        before: { reducedMotion: !this.save.settings.reducedMotion },
        after: { reducedMotion: this.save.settings.reducedMotion },
        reason: '玩家显式切换',
        result: '成功'
      });
      Log.log(trace, '[响应返回]', { step: '切换减少动态效果', status: 200, result: '成功', businessImpact: '粒子、震屏和长动画已相应调整' });
    }

    _checkAuditEndpoint() {
      if (window.location.protocol === 'file:') {
        this._auditConnected = false;
        this._updateSettingsUI();
        return;
      }
      var self = this;
      var trace = Log.trace('audit');
      Log.log(trace, '[外部接口调用]', {
        step: '检查本地审计日志服务',
        intent: '确认前端日志是否可以写入项目 logs/ 目录',
        url: '/api/logs/health',
        method: 'GET',
        expected: '返回 {ok:true}'
      });
      fetch('/api/logs/health', { cache: 'no-store' }).then(function (res) {
        return res.json().then(function (data) { return { status: res.status, data: data }; });
      }).then(function (result) {
        self._auditConnected = !!(result.data && result.data.ok);
        self._updateSettingsUI();
        Log.log(trace, '[外部接口响应]', {
          step: '检查本地审计日志服务',
          url: '/api/logs/health',
          status: result.status,
          responseData: result.data,
          result: self._auditConnected ? '成功' : '异常',
          businessImpact: self._auditConnected ? '开发级审计日志将通过本地接口落盘到 logs/' : '审计日志将退回本地缓存'
        });
      }).catch(function () {
        self._auditConnected = false;
        self._updateSettingsUI();
        Log.log(trace, '[外部接口异常]', {
          step: '检查本地审计日志服务',
          url: '/api/logs/health',
          error: '无法连接本地日志服务',
          businessImpact: '审计日志将退回浏览器本地缓存；游戏不受影响',
          handled: true
        });
      });
    }

    /* ===================================================================
       屏幕与场景
       =================================================================== */
    _showScreen(name, opts) {
      opts = opts || {};
      var previous = this.currentScreen;
      if (this.dom.screens[name] === undefined) return;
      Object.keys(this.dom.screens).forEach(function (key) {
        this.dom.screens[key].hidden = key !== name;
      }, this);
      this.currentScreen = name;
      Log.setScreen(name);
      document.body.classList.toggle('is-game-screen', name === 'game');
      // 停止当前专用渲染场景
      if (this._scenes.title) this._scenes.title.stop();
      if (this._scenes.intro) this._scenes.intro.stop();
      if (this._scenes.ending) this._scenes.ending.stop();
      if (this.renderer) this.renderer.stop();
      if (name === 'title') {
        this._refreshTitle();
        if (this._scenes.title) this._scenes.title.start();
        this._audioSceneForScreen('title');
      } else if (name === 'intro') {
        if (this._scenes.intro) this._scenes.intro.start();
        this._audioSceneForScreen('title');
      } else if (name === 'ending') {
        if (this._scenes.ending) this._scenes.ending.start();
        this._audioSceneForScreen('ending');
      } else if (name === 'game') {
        var self = this;
        requestAnimationFrame(function () {
          if (self.currentScreen !== 'game' || !self.currentGame) return;
          self.renderer.resizeNow();
          self.renderer.start();
        });
        this._audioSceneForScreen('game');
      } else {
        this._audioSceneForScreen('title');
      }
      if (!opts.initial && previous !== name) {
        var trace = opts.traceId || Log.trace('screen');
        Log.log(trace, '[前端状态变化]', {
          step: '切换界面',
          before: { screen: previous },
          after: { screen: name },
          reason: opts.reason || '玩家导航',
          result: '成功',
          businessImpact: '当前可见界面已切换，焦点与音频场景同步更新'
        });
      }
      if (!opts.initial) {
        var screenEl = this.dom.screens[name];
        if (screenEl) {
          screenEl.setAttribute('tabindex', '-1');
          try { screenEl.focus({ preventScroll: true }); } catch (e) { screenEl.focus(); }
        }
      }
    }

    _showTitle(reason) {
      this._hideAllDialogs();
      this._cancelTimers();
      this.busy = false;
      this._showScreen('title', { reason: reason || '返回标题' });
      this._refreshTitle();
      this.audio.play('ui');
    }

    _showArchive(from) {
      this._hideAllDialogs();
      this._cancelTimers();
      if (this.currentScreen === 'game') this.busy = false;
      var selected = this.selectedArchiveLevelId || this.save.lastLevel || 1;
      if (selected > this.save.maxUnlocked) selected = this.save.maxUnlocked;
      this.selectedArchiveLevelId = selected;
      this._renderArchive();
      this._showScreen('archive', { reason: '打开因果档案' });
      this.audio.play('ui');
      var trace = Log.trace('nav');
      Log.log(trace, '[业务入口]', {
        step: '进入因果档案',
        source: from || 'unknown',
        selectedLevel: selected,
        result: '成功',
        businessImpact: '玩家可以浏览并进入已解锁扇区'
      });
    }

    _showIntro() {
      this._introTarget = this._pickContinueLevel();
      this.introIndex = 0;
      this._renderIntroContent();
      this._showScreen('intro', { reason: '播放事故档案' });
      this.audio.play('start');
      var trace = Log.trace('story');
      Log.log(trace, '[前端状态变化]', {
        step: '播放开场记录',
        before: { screen: 'title' },
        after: { screen: 'intro', slide: 1 },
        reason: '玩家开始新实验',
        result: '成功',
        businessImpact: '在进入第一扇区前说明世界与回响规则'
      });
    }

    _renderIntroContent() {
      var slide = INTRO_SLIDES[this.introIndex] || INTRO_SLIDES[0];
      var d = this.dom;
      d.introKicker.textContent = slide.kicker;
      d.introTitle.textContent = slide.title;
      d.introBody.textContent = slide.body;
      d.introQuoteText.textContent = slide.quote;
      var cite = qs('#intro-quote cite');
      if (cite) cite.textContent = slide.cite;
      d.introStepNum.textContent = pad2(this.introIndex + 1);
      d.introNextLabel.textContent = this.introIndex >= INTRO_SLIDES.length - 1 ? '进入校准室' : '继续';
      qsa('span', d.introProgress).forEach(function (el, i) {
        el.classList.toggle('is-active', i === this.introIndex);
      }, this);
      // 重播文字入场动画
      [d.introTitle, d.introBody, d.introQuoteText].forEach(function (el) {
        el.style.animation = 'none';
        void el.offsetWidth;
        el.style.animation = '';
      });
    }

    _nextIntro() {
      if (this.introIndex < INTRO_SLIDES.length - 1) {
        this.introIndex += 1;
        this._renderIntroContent();
        this.audio.play('ui');
      } else {
        this._finishIntro(false);
      }
    }

    _finishIntro(skipped) {
      this.save.seenIntro = true;
      this._writeSave(Log.trace('save'), '记录开场档案已读');
      var trace = Log.trace('story');
      Log.log(trace, '[业务入口]', {
        step: '结束开场档案',
        skipped: !!skipped,
        targetLevel: this._introTarget,
        result: '成功',
        businessImpact: '进入目标扇区'
      });
      if (this._introTarget && this._introTarget >= 1) this._startLevel(this._introTarget, { reason: '开场记录结束' });
      else this._showArchive('intro');
    }

    /* ===================================================================
       标题与档案
       =================================================================== */
    _completedCount() { return Object.keys(this.save.completed).length; }
    _shardCount() { return Object.keys(this.save.completed).filter(function (k) { return this.save.completed[k].shard; }, this).length; }
    _endingCount() {
      var save = this.save || this;
      return (save.endings && save.endings.close ? 1 : 0) + (save.endings && save.endings.break ? 1 : 0);
    }
    _allComplete() { return !!this.save.completed[MAX_LEVEL]; }

    _pickContinueLevel() {
      for (var id = 1; id <= this.save.maxUnlocked; id++) {
        if (!this.save.completed[id]) return id;
      }
      return clamp(this.save.lastLevel || this.save.maxUnlocked || 1, 1, MAX_LEVEL);
    }

    _refreshTitle() {
      var d = this.dom;
      if (!d || !d.btnStart) return;
      var completed = this._completedCount();
      var all = this._allComplete();
      var label = '进入校准';
      var meta = 'INITIATE LOOP';
      if (all) {
        label = '进入核心';
        meta = 'FINAL RECORD / AWAITING';
      } else if (completed > 0) {
        var next = this._pickContinueLevel();
        label = '继续实验';
        meta = 'SECTOR ' + pad2(next) + ' / ' + LEVELS[next - 1].tag;
      }
      d.btnStartLabel.textContent = label;
      d.btnStartMeta.textContent = meta;
      if (completed === 0) {
        d.titleSaveText.textContent = '未检测到实验记录。校准协议等待启动。';
        d.titleSaveMark.classList.add('is-new');
      } else {
        d.titleSaveText.textContent = '实验记录已同步 · ' + completed + '/' + MAX_LEVEL + ' 区段稳定 · ' + this._shardCount() + '/' + MAX_LEVEL + ' 记忆碎片 · ' + this._endingCount() + '/2 结局';
        d.titleSaveMark.classList.remove('is-new');
      }
      this._updateSoundUI();
    }

    _onStartClick() {
      this._unlockAudio();
      var trace = Log.trace('start');
      Log.log(trace, '[请求到达]', {
        step: '标题页开始按钮',
        action: '开始/继续实验',
        source: 'click',
        screen: this.currentScreen,
        completed: this._completedCount(),
        seenIntro: this.save.seenIntro
      });
      this.audio.play('ui');
      if (!this.save.seenIntro) {
        Log.log(trace, '[业务规则]', { step: '标题页开始按钮', decision: '进入开场档案', reason: '玩家尚未看过事故记录', result: '通过' });
        this._showIntro();
        Log.log(trace, '[响应返回]', { step: '标题页开始按钮', status: 200, result: '成功', businessImpact: '进入开场记录' });
        return;
      }
      if (this._allComplete()) {
        Log.log(trace, '[业务规则]', { step: '标题页开始按钮', decision: '进入结局回顾', reason: '全部扇区已完成', result: '通过' });
        this._showEnding('title');
        Log.log(trace, '[响应返回]', { step: '标题页开始按钮', status: 200, result: '成功', businessImpact: '进入核心室最终记录' });
        return;
      }
      var target = this._pickContinueLevel();
      Log.log(trace, '[业务规则]', { step: '标题页开始按钮', decision: '进入扇区', targetLevel: target, reason: '选择最低未完成且已解锁扇区', result: '通过' });
      this._startLevel(target, { reason: '标题页继续', traceId: trace });
      Log.log(trace, '[响应返回]', { step: '标题页开始按钮', status: 200, result: '成功', businessImpact: '进入扇区 ' + target });
    }

    _renderArchive() {
      var self = this;
      var d = this.dom;
      if (!d.archiveList) return;
      d.archiveCompleted.textContent = this._completedCount() + ' / ' + MAX_LEVEL;
      d.archiveShards.textContent = this._shardCount() + ' / ' + MAX_LEVEL;
      d.archiveEndings.textContent = this._endingCount() + ' / 2';
      if (!this.selectedArchiveLevelId) this.selectedArchiveLevelId = this.save.lastLevel || 1;
      d.archiveList.replaceChildren();
      LEVELS.forEach(function (level) {
        var unlocked = level.id <= self.save.maxUnlocked;
        var completion = self.save.completed[level.id];
        var stars = completion ? completion.stars : 0;
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'archive-row' + (level.id === self.selectedArchiveLevelId ? ' is-selected' : '') + (!unlocked ? ' is-locked' : '');
        btn.setAttribute('role', 'listitem');
        btn.setAttribute('aria-pressed', level.id === self.selectedArchiveLevelId ? 'true' : 'false');
        if (!unlocked) {
          btn.disabled = true;
          btn.setAttribute('aria-label', level.name + '，未解锁');
        } else {
          btn.setAttribute('aria-label', level.name + '，' + (completion ? '已完成，' + stars + '星' : '可进入'));
          btn.addEventListener('click', function () {
            self.selectedArchiveLevelId = level.id;
            self.audio.play('ui');
            self._renderArchive();
            var trace = Log.trace('nav');
            Log.log(trace, '[前端状态变化]', {
              step: '选择档案扇区',
              before: { selectedLevel: self.selectedArchiveLevelId },
              after: { selectedLevel: level.id },
              result: '成功',
              businessImpact: '右侧档案详情同步更新'
            });
          });
        }
        var starsHtml = [1, 2, 3].map(function (i) {
          return '<span class="' + (i <= stars ? '' : 'empty') + '">★</span>';
        }).join('');
        btn.innerHTML =
          '<span class="sector-no">' + pad2(level.id) + '</span>' +
          '<span class="sector-info"><strong>' + level.name + '</strong><span>' + level.tag + '</span></span>' +
          '<span class="sector-state">' +
            (unlocked ? '<span class="row-stars">' + starsHtml + '</span>' + (completion ? '<span>STABILIZED</span>' : '<span>OPEN</span>') : '<span class="row-lock">LOCKED</span>') +
          '</span>';
        d.archiveList.appendChild(btn);
      });
      this._renderArchiveDetail();
      this._renderMemoryShelf();
    }

    _renderArchiveDetail() {
      var level = LEVELS[this.selectedArchiveLevelId - 1];
      if (!level) return;
      var d = this.dom;
      var completion = this.save.completed[level.id];
      var unlocked = level.id <= this.save.maxUnlocked;
      d.archiveCode.textContent = level.code + ' / ' + level.tag;
      d.archiveName.textContent = level.name;
      d.archiveEpithet.textContent = level.epithet;
      d.archiveObjective.textContent = level.objective;
      d.archiveEcho.textContent = String(level.echoBudget);
      d.archiveBest.textContent = completion && completion.bestActions !== null ? String(completion.bestActions) : '—';
      var stars = completion ? completion.stars : 0;
      d.archiveStars.textContent = [1, 2, 3].map(function (i) { return i <= stars ? '★' : '☆'; }).join('');
      d.btnArchiveEnter.disabled = !unlocked;
      d.btnArchiveEnter.innerHTML = (unlocked ? (completion ? '重演扇区' : '进入扇区') : '尚未解锁') + ' <span class="btn-arrow" aria-hidden="true">→</span>';
      if (d.btnArchiveMobileEnter) {
        d.btnArchiveMobileEnter.disabled = !unlocked;
        d.btnArchiveMobileEnter.innerHTML = (unlocked ? (completion ? '重演扇区' : '进入扇区') : '尚未解锁') + ' <span class="btn-arrow" aria-hidden="true">→</span>';
      }
      if (d.archiveMobileCode) d.archiveMobileCode.textContent = level.code + ' / ' + level.tag;
      if (d.archiveMobileName) d.archiveMobileName.textContent = level.name;
      d.archiveMapLabel.textContent = 'SCHEMATIC / S-' + pad2(level.id);
      this._renderMapSchematic(level);
    }

    _renderMapSchematic(level) {
      var map = level.map;
      var width = Math.max.apply(null, map.map(function (r) { return r.length; }));
      var height = map.length;
      var el = this.dom.archiveMap;
      el.replaceChildren();
      el.style.gridTemplateColumns = 'repeat(' + width + ', 1fr)';
      el.style.aspectRatio = width + ' / ' + height;
      var frag = document.createDocumentFragment();
      var classMap = {
        '#': 'cell-wall',
        '.': 'cell-floor',
        'P': 'cell-player',
        'E': 'cell-exit',
        '*': 'cell-shard',
        'c': 'cell-crate',
        'x': 'cell-anchor',
        'a': 'cell-plate cell-a',
        'A': 'cell-door cell-a',
        'b': 'cell-plate cell-b',
        'B': 'cell-door cell-b',
        'v': 'cell-seal',
        'V': 'cell-seal',
        'G': 'cell-sync-gate',
        '1': 'cell-sync',
        '2': 'cell-sync',
        '3': 'cell-sync',
        '4': 'cell-sync',
        '5': 'cell-sync'
      };
      var glyphMap = {
        'P': '◆', 'E': '✦', '*': '◇', 'c': '□', 'x': '锚',
        'a': 'a', 'A': 'A', 'b': 'b', 'B': 'B', 'v': 'v', 'V': 'V', 'G': 'G',
        '1': '1', '2': '2', '3': '3', '4': '4', '5': '5'
      };
      for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
          var ch = map[y].charAt(x) || '#';
          var cell = document.createElement('span');
          cell.className = 'map-cell ' + (classMap[ch] || 'cell-floor');
          if (glyphMap[ch]) cell.textContent = glyphMap[ch];
          frag.appendChild(cell);
        }
      }
      el.appendChild(frag);
    }

    _renderMemoryShelf() {
      var shelf = this.dom.memoryShelf;
      if (!shelf) return;
      shelf.replaceChildren();
      var count = 0;
      LEVELS.forEach(function (level) {
        var has = !!(this.save.completed[level.id] && this.save.completed[level.id].shard);
        if (has) count++;
        var item = document.createElement('span');
        item.className = 'shelf-shard' + (has ? '' : ' is-missing');
        item.innerHTML = '<span class="shard-dot" aria-hidden="true"></span><span>档案 ' + pad2(level.id) + (has ? ' / ' + this._shardTitle(level) : ' / 未回收') + '</span>';
        shelf.appendChild(item);
      }, this);
      this.dom.btnOpenMemoryShelf.disabled = false;
      this.dom.btnOpenMemoryShelf.textContent = count ? '打开记忆库（' + count + '）→' : '打开记忆库 →';
    }

    _shardTitle(level) {
      if (level.shardLog && level.shardLog.title) {
        var parts = level.shardLog.title.split('/');
        return parts[1] ? parts[1].trim() : level.shardLog.title;
      }
      return '记忆碎片';
    }

    _enterSelectedArchiveLevel() {
      var trace = Log.trace('archive');
      var level = LEVELS[this.selectedArchiveLevelId - 1];
      Log.log(trace, '[请求到达]', {
        step: '从因果档案进入扇区',
        source: 'button',
        selectedLevel: this.selectedArchiveLevelId,
        unlockedUpTo: this.save.maxUnlocked
      });
      if (!level || level.id > this.save.maxUnlocked) {
        Log.log(trace, '[请求被拒绝]', {
          step: '从因果档案进入扇区',
          interceptLayer: '档案权限 / 解锁校验',
          reason: !level ? '扇区不存在' : '所选扇区尚未解锁',
          statusCode: 403,
          result: '拒绝',
          businessImpact: '保持档案页面，不进入关卡'
        });
        this._toast('ARCHIVE / LOCKED', '该扇区尚未解锁。先稳定前一个扇区。', 'warn');
        return;
      }
      this._startLevel(level.id, { reason: '档案进入扇区', traceId: trace });
    }

    _openMemory() {
      var trace = Log.trace('memory');
      Log.log(trace, '[请求到达]', { step: '打开记忆库', source: 'button', screen: this.currentScreen });
      this._renderMemoryDialog();
      this._openDialog('memory');
      Log.log(trace, '[响应返回]', { step: '打开记忆库', status: 200, result: '成功', businessImpact: '展示已回收的记忆碎片' });
    }

    _renderMemoryDialog() {
      var list = this.dom.memoryList;
      if (!list) return;
      list.replaceChildren();
      var count = 0;
      LEVELS.forEach(function (level) {
        var has = !!(this.save.completed[level.id] && this.save.completed[level.id].shard);
        if (!has) return;
        count++;
        var entry = document.createElement('div');
        entry.className = 'memory-entry';
        var log = level.shardLog || { title: '档案 ' + pad2(level.id), body: '' };
        entry.innerHTML =
          '<div class="memory-entry-no">M-' + pad2(level.id) + '</div>' +
          '<div><h3>' + log.title + '</h3><p>' + log.body + '</p></div>';
        list.appendChild(entry);
      }, this);
      this.dom.memoryLede.textContent = count
        ? '已回收 ' + count + ' / ' + MAX_LEVEL + ' 枚记忆碎片。它们不会拼出完整真相，但会改变你理解真相的方式。'
        : '尚未回收任何记忆碎片。前往扇区，找到那些仍记得事故的晶体。';
      if (!count) {
        var empty = document.createElement('p');
        empty.className = 'memory-empty';
        empty.textContent = '记忆库是空的。倒带会重置碎片，只有带着它抵达出口，ARIADNE 才能把那段记录留在这里。';
        list.appendChild(empty);
      }
    }

    /* ===================================================================
       关卡生命周期
       =================================================================== */
    _startLevel(levelId, opts) {
      opts = opts || {};
      var trace = opts.traceId || Log.trace('level');
      var level = LEVELS[levelId - 1];
      Log.log(trace, '[参数校验]', {
        step: '校验进入扇区参数',
        field: 'levelId',
        source: opts.reason || 'player',
        actualValue: levelId,
        expectedRule: '1 ≤ levelId ≤ ' + MAX_LEVEL + ' 且该扇区已解锁',
        validation: !!level && levelId <= this.save.maxUnlocked ? '通过' : '失败',
        result: !!level && levelId <= this.save.maxUnlocked ? '通过' : '失败',
        reason: !level ? '扇区不存在' : levelId > this.save.maxUnlocked ? '扇区尚未解锁' : '参数合法',
        businessImpact: !!level && levelId <= this.save.maxUnlocked ? '允许进入关卡' : '拒绝进入关卡'
      });
      if (!level) {
        this._toast('SECTOR UNKNOWN', '该扇区不存在。', 'warn');
        return;
      }
      if (levelId > this.save.maxUnlocked) {
        this._toast('SECTOR LOCKED', '该扇区尚未解锁。', 'warn');
        return;
      }
      this._unlockAudio();
      Log.log(trace, '[业务入口]', {
        step: '进入扇区',
        levelId: levelId,
        levelName: level.name,
        reason: opts.reason || '玩家选择扇区',
        result: '准备开始'
      });
      this._hideAllDialogs();
      this._cancelTimers();
      this.gameSession += 1;
      this._finishedThisAttempt = false;
      this._levelFlags = {};
      this._causalEntries = [];
      this._lastBlockToast = 0;
      this._clearToasts();
      var game = new Engine.ChronoGame(level);
      this.currentGame = game;
      this.currentLevelId = levelId;
      this.hintsShown = 0;
      this.busy = false;
      this._hideCurtain(true);
      this.renderer.stop();
      this.renderer.setGame(game);
      this.dom.screens.game.classList.toggle('has-sync', game.syncPlates.length > 0);
      this.selectedArchiveLevelId = levelId;
      this.save.lastLevel = levelId;
      this._writeSave(trace, '记录当前扇区');
      this._buildLevelUI(level, game);
      this._showScreen('game', { reason: '进入扇区', traceId: trace });
      var self = this;
      requestAnimationFrame(function () {
        if (self.currentScreen !== 'game' || self.currentGame !== game) return;
        self.renderer.resizeNow();
        self.renderer.start();
        self._showCurtain(level);
      });
      this._updateUIFromGame();
      Log.log(trace, '[响应返回]', {
        step: '进入扇区',
        levelId: levelId,
        status: 200,
        result: '成功',
        businessImpact: '玩家进入 ' + level.name + '，余响上限 ' + level.echoBudget + '，目标行动刻度 ' + level.parActions
      });
    }

    _buildLevelUI(level, game) {
      var d = this.dom;
      d.gameSectorCode.textContent = level.code;
      d.gameSectorName.textContent = level.name;
      d.gameSectorEn.textContent = level.tag;
      d.railCode.textContent = level.code + ' / ' + level.tag;
      d.railName.textContent = level.name;
      d.railEpithet.textContent = level.epithet;
      d.railObjective.textContent = level.objective;
      d.compactObjective.textContent = level.objective;
      d.railAriadne.textContent = level.ariadne;
      d.railMechanic.textContent = level.mechanic;
      d.railHint.textContent = '还在观察。需要一点方向时，按 H 或点击「提示」。';
      d.railShardState.textContent = '未回收';
      d.stageCoord.textContent = 'CHAMBER / C-' + pad2(level.id);
      d.stageMode.textContent = level.echoBudget > 1 ? 'MULTI LOOP' : 'SINGLE LOOP';
      d.stageStatus.textContent = 'OBSERVING';
      d.stageSync.textContent = '';
      d.syncMonitor.hidden = !level.syncCradles || !level.syncCradles.length;
      d.pauseSector.textContent = level.code + ' / ' + level.tag;
      d.curtainCode.textContent = level.code + ' / ' + level.tag;
      d.curtainName.textContent = level.name;
      d.curtainEpithet.textContent = level.epithet;
      this.hintsShown = 0;
      qsa('i', d.hintDots).forEach(function (i) { i.classList.remove('is-used'); });
      d.btnHint.disabled = false;
      d.compactHintCount.textContent = '0/' + level.hint.length;
      if (level.syncCradles && level.syncCradles.length) {
        this._buildSyncMonitor(level, game);
      } else {
        d.syncCount.textContent = '';
        d.syncPips.replaceChildren();
      }
      d.causalLog.replaceChildren();
      this._causalEntries = [];
      this._appendCausalLog('L01.00', '因果引擎接入 · ' + level.name);
      this._updateHintUI();
    }

    _buildSyncMonitor(level, game) {
      var d = this.dom;
      d.syncMonitor.hidden = false;
      d.syncPips.replaceChildren();
      game.syncPlates.forEach(function (p) {
        var el = document.createElement('span');
        el.className = 'sync-pip' + (p.cradle ? ' is-cradle' : '');
        el.title = '节点 ' + p.node + (p.cradle ? ' / 质量槽' : ' / 重量节点');
        el.innerHTML = '<span>' + p.node + '</span>';
        d.syncPips.appendChild(el);
      });
      d.syncCount.textContent = '0 / ' + game.syncPlates.length;
      d.syncHint.textContent = level.syncCradles && level.syncCradles.length
        ? '○ 圆节点：任意实体 / □ 方质量槽：只认箱子。全部同时成立后 G 门开启。'
        : '○ 圆节点：玩家、回响或箱子均可。全部同时成立后 G 门开启。';
    }

    _showCurtain(level) {
      var d = this.dom;
      this.curtainActive = true;
      this.busy = true;
      d.curtain.hidden = false;
      d.curtain.classList.remove('is-leaving');
      var self = this;
      var token = this.gameSession;
      this.curtainTimer = setTimeout(function () {
        if (self.gameSession !== token || self.currentScreen !== 'game') return;
        self._hideCurtain(false);
      }, this._effectiveReducedMotion() ? 300 : 1450);
      this._syncButtons();
    }

    _hideCurtain(immediate) {
      var d = this.dom;
      if (!d.curtain || d.curtain.hidden) {
        this.curtainActive = false;
        this.busy = false;
        this._syncButtons();
        return;
      }
      if (this.curtainTimer) { clearTimeout(this.curtainTimer); this.curtainTimer = null; }
      this.curtainActive = false;
      this.busy = false;
      if (immediate || this._effectiveReducedMotion()) {
        d.curtain.hidden = true;
        d.curtain.classList.remove('is-leaving');
      } else {
        d.curtain.classList.add('is-leaving');
        var self = this;
        var token = this.gameSession;
        setTimeout(function () {
          if (self.gameSession !== token) return;
          d.curtain.hidden = true;
          d.curtain.classList.remove('is-leaving');
        }, 380);
      }
      this._syncButtons();
    }

    _restartLevel(reason) {
      if (!this.currentLevelId) return;
      var trace = Log.trace('level');
      Log.log(trace, '[请求到达]', { step: '重置扇区', action: '重新开始当前扇区', source: reason || 'button', levelId: this.currentLevelId });
      this._toast('SECTOR RESET', '扇区已重置。因果记录重新开始。', 'info', 2400);
      this._startLevel(this.currentLevelId, { reason: '玩家重置扇区', traceId: trace });
      Log.log(trace, '[响应返回]', { step: '重置扇区', status: 200, result: '成功', businessImpact: '当前关卡的玩家、回响与因果锚位置已恢复到初始状态' });
    }

    _openConfirm(mode) {
      if (!this.currentGame && mode !== 'exit') return;
      this._confirmMode = mode;
      var d = this.dom;
      if (mode === 'exit') {
        d.resetTitle.textContent = '离开当前扇区？';
        d.resetCopy.textContent = '本轮的进度、回响与因果锚位置不会被保存。已经稳定的其他扇区记录不受影响。';
        d.btnConfirmReset.textContent = '退出到档案';
        d.btnConfirmReset.classList.remove('btn-danger');
        d.btnConfirmReset.classList.add('btn-ghost');
      } else {
        d.resetTitle.textContent = '重置本扇区？';
        d.resetCopy.textContent = '本轮的进度、回响与因果锚位置都会被清空。关卡评价记录不会被删除。';
        d.btnConfirmReset.textContent = '确认重置';
        d.btnConfirmReset.classList.add('btn-danger');
        d.btnConfirmReset.classList.remove('btn-ghost');
      }
      this._openDialog('reset');
      var trace = Log.trace('confirm');
      Log.log(trace, '[前端状态变化]', {
        step: '打开确认对话框',
        before: { dialog: null },
        after: { dialog: 'reset', mode: mode },
        result: '成功',
        businessImpact: '在不可逆操作前向玩家确认'
      });
    }

    _confirmAction() {
      var mode = this._confirmMode;
      var trace = Log.trace('confirm');
      Log.log(trace, '[业务入口]', { step: '确认不可逆操作', mode: mode, result: '开始执行' });
      this._closeDialog(this.dom.dialogReset);
      this._confirmMode = null;
      if (mode === 'reset') {
        this._restartLevel('确认重置');
      } else if (mode === 'exit') {
        Log.log(trace, '[前端状态变化]', {
          step: '退出当前扇区到档案',
          before: { screen: 'game', levelId: this.currentLevelId },
          after: { screen: 'archive' },
          result: '成功',
          businessImpact: '当前关卡进度丢弃，已写入的档案评价保留'
        });
        this.busy = false;
        this._showArchive('exit');
      }
      Log.log(trace, '[响应返回]', { step: '确认不可逆操作', status: 200, result: '成功' });
    }

    /* ===================================================================
       输入与动作
       =================================================================== */
    _onKeyDown(ev) {
      if (ev.defaultPrevented) return;
      var openDialog = document.querySelector('dialog[open]');
      if (openDialog) return;
      var key = ev.key;
      var target = ev.target;
      var interactive = !!(target && target.closest && target.closest('button, a, input, select, textarea, [contenteditable="true"]'));
      var isMeta = ev.ctrlKey || ev.metaKey || ev.altKey;

      if (key === 'm' || key === 'M') {
        if (this.currentScreen === 'title' || this.currentScreen === 'game' || this.currentScreen === 'archive') {
          ev.preventDefault();
          this._toggleSound();
        }
        return;
      }

      if (this.currentScreen === 'intro') {
        if (key === 'Escape') { ev.preventDefault(); this._finishIntro(true); return; }
        if (!interactive && (key === 'Enter' || key === ' ' || key === 'ArrowRight')) {
          ev.preventDefault();
          this._nextIntro();
        }
        return;
      }

      if (this.currentScreen === 'title') {
        if (key === 'Enter' && !interactive) {
          ev.preventDefault();
          this._onStartClick();
        } else if (key === 'h' || key === 'H') {
          ev.preventDefault();
          this._openDialog('manual');
        }
        return;
      }

      if (this.currentScreen === 'archive') {
        if (key === 'Escape') { ev.preventDefault(); this._showTitle('档案返回'); }
        else if (key === 'h' || key === 'H') { ev.preventDefault(); this._openDialog('manual'); }
        return;
      }

      if (this.currentScreen !== 'game') return;
      if (ev.repeat && (key === 'r' || key === 'R' || key === 'z' || key === 'Z' || key === 'Escape')) return;

      if (key === 'Escape') { ev.preventDefault(); this._openPause(); return; }
      if (key === 'h' || key === 'H') { ev.preventDefault(); this._openDialog('manual'); return; }
      if (key === 'Enter' && interactive) return;
      if (key === ' ' && interactive) return;

      var dir = DIR_KEYS[key];
      if (dir) {
        ev.preventDefault();
        this._performAction('move', 'key', dir, ev);
        return;
      }
      if (key === ' ') {
        ev.preventDefault();
        this._performAction('wait', 'key', null, ev);
        return;
      }
      if (key === 'r' || key === 'R') {
        ev.preventDefault();
        this._performAction('rewind', 'key', null, ev);
        return;
      }
      if (key === 'z' || key === 'Z') {
        ev.preventDefault();
        this._performAction('undo', 'key', null, ev);
        return;
      }
    }

    _performAction(kind, source, dir, ev) {
      var trace = Log.trace(kind === 'rewind' ? 'rewind' : 'game');
      var start = performance.now();
      var game = this.currentGame;
      var actionLabel = kind === 'move' ? (ACTION_LABELS[dir] || '移动') : ACTION_LABELS[kind];
      var inputData = {
        action: kind,
        direction: dir || null,
        source: source,
        levelId: this.currentLevelId,
        screen: this.currentScreen,
        busy: this.busy,
        curtain: this.curtainActive,
        state: game ? this._stateDigest(game) : null
      };
      Log.log(trace, '[请求到达]', {
        step: '玩家操作',
        action: actionLabel,
        source: source,
        input: inputData,
        businessImpact: '等待因果引擎判定'
      });

      var validKinds = { move: true, wait: true, undo: true, rewind: true };
      var directionValid = kind !== 'move' || ['up', 'down', 'left', 'right'].indexOf(dir) !== -1;
      var inputValid = !!(validKinds[kind] && directionValid);
      Log.log(trace, '[参数校验]', {
        step: '校验玩家动作参数',
        field: 'action/direction',
        source: source,
        actualValue: { action: kind, direction: dir || null },
        expectedRule: 'action ∈ {move,wait,undo,rewind}；move 必须带合法方向',
        validation: inputValid ? '通过' : '失败',
        result: inputValid ? '通过' : '失败',
        reason: inputValid ? '动作参数合法' : '动作类型或方向不在允许范围',
        businessImpact: inputValid ? '进入输入闸门' : '本次操作不会进入因果引擎'
      });
      if (!inputValid) {
        this._rejectAction(trace, '参数校验', '动作类型或方向不合法', 400, '本次操作未进入业务逻辑');
        return;
      }

      // 输入闸门
      if (this.currentScreen !== 'game' || !game) {
        this._rejectAction(trace, '界面状态', '当前不在游戏界面', 409, '操作未进入因果引擎');
        return;
      }
      if (this.curtainActive) {
        this._hideCurtain(false);
        Log.log(trace, '[中间件-输入闸门]', {
          step: '玩家操作',
          layer: '扇区入场动画',
          result: '通过',
          reason: '第一个输入会提前结束入场动画',
          businessImpact: '操作继续处理'
        });
      }
      if (this.busy) {
        this._rejectAction(trace, '时间锁', '循环正在倒带或结算，暂不接受输入', 423, '本次操作未进入因果引擎，也未消耗时间刻度');
        return;
      }
      if (game.status === 'won') {
        this._rejectAction(trace, '关卡状态', '扇区已经稳定，正在等待结算', 409, '操作被忽略');
        return;
      }
      if (typeof ev !== 'undefined' && ev && ev.currentTarget && source !== 'key' && ev.detail > 0) {
        try { ev.currentTarget.blur(); } catch (e) { /* ignore */ }
      }

      var before = this._stateDigest(game);
      var hudBefore = this._hudDigest(game);
      var result;
      Log.log(trace, '[业务入口]', {
        step: '执行因果动作',
        action: actionLabel,
        input: { loop: game.loop, tick: game.actionTick, echoes: game.echoes.length, rewindsLeft: game.rewindsLeft },
        businessImpact: '进入引擎执行阶段'
      });

      try {
        if (kind === 'undo') result = game.undo();
        else if (kind === 'rewind') result = game.rewind();
        else if (kind === 'wait') result = game.wait();
        else result = game.move(dir);
      } catch (error) {
        this._logException(trace, error, '因果引擎执行');
        this._toast('CAUSAL ENGINE FAULT', '引擎未能完成这次动作。你已经执行的操作仍然安全。', 'error', 4800);
        Log.log(trace, '[响应返回]', {
          step: '执行因果动作',
          statusCode: 500,
          result: '异常',
          durationMs: Math.round(performance.now() - start),
          businessImpact: '本次操作未完成，界面保留上一次有效状态'
        });
        return;
      }

      if (!result || !result.ok) {
        var reason = result ? result.reason : 'unknown';
        var human = BLOCK_LABELS[reason] || '当前动作无法执行';
        var blockedCell = game.player;
        if (result && result.dir && window.ChronoEngine.DIRS[result.dir]) {
          blockedCell = {
            x: game.player.x + window.ChronoEngine.DIRS[result.dir].x,
            y: game.player.y + window.ChronoEngine.DIRS[result.dir].y
          };
        }
        Log.log(trace, '[业务规则]', {
          step: '因果引擎校验',
          decision: '拒绝动作',
          reasonCode: reason,
          reason: human,
          result: '拒绝',
          businessImpact: '本次操作未消耗时间刻度，回响未推进'
        });
        Log.log(trace, '[请求被拒绝]', {
          step: '执行因果动作',
          interceptLayer: kind === 'rewind' ? '回响能量校验' : '因果引擎规则',
          reason: human,
          statusCode: 409,
          result: '拒绝',
          businessImpact: '本次操作未进入有效业务结果，玩家位置与门状态不变'
        });
        this.renderer.showBlocked(blockedCell.x, blockedCell.y);
        this.audio.play('error');
        var now = Date.now();
        if (now - this._lastBlockToast > 1600) {
          this._lastBlockToast = now;
          if (reason === 'door') this._toast('CAUSAL GATE / 闸门', human + '。试试让回响按住对应的压力板，或按空格等待。', 'warn', 3600);
          else if (reason === 'crate') this._toast('MASS LOCK / 质量', human + '。你可以换个方向绕过。', 'warn', 3000);
          else if (kind === 'rewind') this._toast('ECHO / 回响', human + '。', 'warn', 3000);
        }
        this._updateUIFromGame();
        Log.log(trace, '[响应返回]', {
          step: '执行因果动作',
          statusCode: 409,
          result: '拒绝',
          durationMs: Math.round(performance.now() - start),
          businessImpact: '玩家未移动，时间线不变'
        });
        return;
      }

      // 成功：记录事件与状态变化
      var events = result.events || [];
      var after = this._stateDigest(game);
      var hudAfter = this._hudDigest(game);
      var eventSummary = events.map(function (evt) { return this._describeEvent(evt, game); }, this).filter(Boolean);
      Log.log(trace, '[业务方法执行]', {
        step: '因果引擎执行完成',
        action: actionLabel,
        input: { action: kind, direction: dir || null, loopBefore: before.loop, tickBefore: before.tick },
        decision: '动作成立，时间刻度推进',
        before: before,
        after: after,
        result: '成功',
        extra: { events: eventSummary.slice(0, 24), eventCount: events.length },
        businessImpact: result.won ? '玩家抵达出口，扇区即将稳定' : '玩家与回响状态已更新'
      });
      if (events.length) {
        Log.log(trace, '[业务规则-因果事件]', {
          step: '压力板 / 门 / 机关状态',
          decision: '按因果规则重算',
          before: hudBefore,
          after: hudAfter,
          result: '成功',
          extra: { events: eventSummary },
          businessImpact: '所有机关状态已与当前实体位置同步'
        });
      }
      if (kind === 'undo') {
        Log.log(trace, '[业务规则-时间回溯]', {
          step: '撤销一步',
          before: { tick: before.tick, actions: before.currentActions },
          after: { tick: after.tick, actions: after.currentActions },
          result: '成功',
          businessImpact: '最近一个动作与回响重演被撤销，已消耗的回响次数不返还'
        });
      }
      if (kind === 'rewind') {
        var rewindEvent = events.find(function (e) { return e.type === 'rewind'; });
        Log.log(trace, '[业务规则-回响刻录]', {
          step: '回响 / 倒带',
          before: { loop: before.loop, actions: before.currentActions, echoes: before.echoes, rewindsLeft: before.rewindsLeft },
          after: { loop: after.loop, actions: after.currentActions, echoes: after.echoes, rewindsLeft: after.rewindsLeft },
          calculation: '当前循环的 ' + (rewindEvent ? rewindEvent.recorded : 0) + ' 个动作已写入新回响；下一轮所有回响将从第 1 刻同步重演',
          result: '成功',
          businessImpact: '过去的行动具有了可重复的物理重量；因果锚保留位置'
        });
      }
      this._afterSuccessfulAction(trace, kind, source, dir, result, before, after, hudBefore, hudAfter, events);
      Log.log(trace, '[前端状态变化]', {
        step: '更新因果仪表',
        before: hudBefore,
        after: hudAfter,
        reason: '引擎返回成功状态',
        result: '成功',
        businessImpact: '界面、按钮可用性与无障碍播报已同步'
      });
      Log.log(trace, '[响应返回]', {
        step: '执行因果动作',
        statusCode: 200,
        result: result.won ? '成功（扇区完成）' : '成功',
        durationMs: Math.round(performance.now() - start),
        businessImpact: result.won ? '玩家已抵达出口，准备结算扇区' : '玩家操作完成，时间线已推进'
      });
    }

    _rejectAction(trace, layer, reason, status, impact) {
      Log.log(trace, '[中间件-输入闸门]', {
        step: '玩家操作',
        layer: layer,
        result: '拒绝',
        reason: reason,
        businessImpact: impact
      });
      Log.log(trace, '[请求被拒绝]', {
        step: '玩家操作',
        interceptLayer: layer,
        reason: reason,
        statusCode: status,
        result: '拒绝',
        businessImpact: impact + '；请求未进入业务逻辑'
      });
      Log.log(trace, '[响应返回]', {
        step: '玩家操作',
        statusCode: status,
        result: '拒绝',
        businessImpact: '界面状态没有变化'
      });
    }

    _afterSuccessfulAction(trace, kind, source, dir, result, before, after, hudBefore, hudAfter, events) {
      var game = this.currentGame;
      if (!game) return;
      this._updateUIFromGame();
      this._syncButtons();
      this._updateLiveRegion();
      this._appendEventsToCausalLog(events, game);

      // 动画与声音
      if (kind === 'rewind') {
        this.busy = true;
        this._clearToasts();
        this._syncButtons();
        this.renderer.showRewind((result.events.find(function (e) { return e.type === 'rewind'; }) || {}).path, game.loop, game.echoes.length);
        this.audio.play('rewind');
        var self = this;
        var token = this.gameSession;
        this._later(function () {
          if (self.gameSession !== token || self.currentScreen !== 'game') return;
          self.busy = false;
          self.audio.play('rewind-restore');
          self._syncButtons();
          self._updateLiveRegion();
          var echoNo = game.echoes[game.echoes.length - 1];
          self._clearToasts();
          self._toast('ECHO / 回响 ' + pad2(echoNo ? echoNo.no : 0), '过去的你已刻录。第 ' + game.loop + ' 次循环开始，所有回响会同步重演；按空格等待，可以让过去的你先行动。', 'story', 5200);
        }, this._effectiveReducedMotion() ? 120 : 820);
      } else if (result.won) {
        this.busy = true;
        this._syncButtons();
        this._clearToasts();
        this.renderer.showWin();
        this.audio.play('win');
        this._winTrace = trace;
        var self2 = this;
        var token2 = this.gameSession;
        this._later(function () {
          if (self2.gameSession !== token2 || self2.currentScreen !== 'game') return;
          self2._finishLevel(trace);
        }, this._effectiveReducedMotion() ? 260 : 1150);
      } else {
        var primary = this._chooseActionSound(kind, events);
        if (primary) this.audio.play(primary);
        this._showContextHints(kind, events, before, after);
      }
      this._finishedThisAttempt = this._finishedThisAttempt || !!result.won;
    }

    _chooseActionSound(kind, events) {
      if (kind === 'undo') return 'undo';
      if (events.some(function (e) { return e.type === 'win'; })) return 'win';
      if (events.some(function (e) { return e.type === 'sync'; })) return 'sync';
      if (events.some(function (e) { return e.type === 'seal'; })) return 'seal';
      if (events.some(function (e) { return e.type === 'shard'; })) return 'shard';
      if (events.some(function (e) { return e.type === 'door'; })) {
        var door = events.filter(function (e) { return e.type === 'door'; }).pop();
        return door.open ? 'door-open' : 'door-close';
      }
      if (events.some(function (e) { return e.type === 'plate'; })) {
        var plate = events.filter(function (e) { return e.type === 'plate'; }).pop();
        return plate.pressed ? 'plate-on' : 'plate-off';
      }
      if (kind === 'wait') return 'wait';
      if (events.some(function (e) { return e.type === 'echoMove'; })) return 'echo-move';
      return 'move';
    }

    _showContextHints(kind, events, before, after) {
      var game = this.currentGame;
      var level = LEVELS[this.currentLevelId - 1];
      if (!game || !level) return;
      var echoCount = game.echoes.length;
      if (events.some(function (e) { return e.type === 'shard'; })) {
        this._toastOnce('shard', 'MEMORY / 记忆碎片', '碎片已进入本轮因果链。倒带会把它重置——带着它抵达出口才会写入档案。', 'story', 5000);
      }
      if (events.some(function (e) { return e.type === 'sync'; })) {
        this._toastOnce('sync', 'SYNC / 同步成立', '所有同步节点在同一刻成立。同步门已永久开启，离开节点也不会关闭。', 'success', 4200);
        this.renderer.showSync();
      }
      if (events.some(function (e) { return e.type === 'seal'; })) {
        this._toastOnce('seal', 'SEAL / 因果封印', '封印已闭合，本循环内无法再通过 V 闸。若需要改变结果，按 R 把位置留给下一轮。', 'warn', 4800);
        var seal = events.find(function (e) { return e.type === 'seal'; });
        if (seal) this.renderer.showSeal(seal.x, seal.y);
      }
      if (events.some(function (e) { return e.type === 'anchorPersist'; })) {
        this._toastOnce('anchor-return', 'ANCHOR / 因果残留', '因果锚保留了它倒带前的位置：它的未来已经成为这一轮的过去。', 'story', 4800);
      }
      var crateMoved = events.some(function (e) { return e.type === 'crateMove' && e.anchor; });
      if (crateMoved) {
        this._toastOnce('anchor', 'ANCHOR / 因果锚', '紫色箱体不会随倒带回到起点。把它推到目标上，再按 R，让结果成为下一轮的起点。', 'story', 5000);
      }
      var playerOnPlate = events.some(function (e) { return e.type === 'plate' && e.pressed && e.x === game.player.x && e.y === game.player.y; });
      if (playerOnPlate && echoCount === 0 && game.rewindsLeft > 0 && kind === 'move') {
        this._toastOnce('plate-first', 'ECHO / 一个身体不够', '你正站在压力板上，但一离开，门就会关闭。按 R 把这轮行动刻录成回响，让过去的你留在板上。', 'story', 6000);
      }
      if (kind === 'move' && !events.some(function (e) { return e.type === 'playerMove'; })) {
        // 不会发生：失败移动已在前面返回。保留防御。
      }
      if (game.rewindsLeft === 0 && before.rewindsLeft > 0) {
        this._toastOnce('no-charge', 'ECHO / 余响耗尽', '余响能量已耗尽。这一轮的行动将直接决定扇区结果，无法再倒带。', 'warn', 4600);
      }
    }

    _syncButtons() {
      var game = this.currentGame;
      var d = this.dom;
      var blocked = !game || this.busy || game.status !== 'playing';
      var canTryRewind = !!game && !blocked && game.rewindsLeft > 0;
      d.btnUndo.disabled = blocked || !game.canUndo;
      d.btnWait.disabled = blocked;
      d.btnRewind.disabled = !canTryRewind;
      d.btnRewind.classList.toggle('has-charge', !!game && game.rewindsLeft > 0);
      d.btnRewind.classList.toggle('is-spent', !!game && game.rewindsLeft === 0);
      qsa('[data-dir]').forEach(function (b) { b.disabled = blocked; });
      qsa('[data-action="wait"]').forEach(function (b) { b.disabled = blocked; });
      qsa('[data-action="undo"]').forEach(function (b) { b.disabled = blocked || !game.canUndo; });
      qsa('[data-action="rewind"]').forEach(function (b) {
        b.disabled = !canTryRewind;
        b.classList.toggle('is-spent', !!game && game.rewindsLeft === 0);
      });
      if (d.btnGameBack) d.btnGameBack.disabled = blocked;
      if (d.btnPause) d.btnPause.disabled = blocked;
      if (d.touchCharge) d.touchCharge.textContent = game ? String(game.rewindsLeft) : '0';
    }

    _updateUIFromGame() {
      var game = this.currentGame;
      var d = this.dom;
      if (!game) return;
      var level = LEVELS[this.currentLevelId - 1];
      d.chipLoop.textContent = pad2(game.loop);
      d.chipEcho.textContent = game.rewindsLeft + '/' + game.maxRewinds;
      d.chipShardText.textContent = game.shardCollected ? '1' : '0';
      d.chipShard.classList.toggle('is-earned', game.shardCollected);
      d.monitorLoop.textContent = pad2(game.loop);
      d.monitorActions.textContent = String(game.totalActions);
      d.monitorEchoes.textContent = String(game.echoes.length);
      d.monitorEnergyText.textContent = game.rewindsLeft + ' / ' + game.maxRewinds;
      d.chargeText.textContent = game.rewindsLeft + ' / ' + game.maxRewinds;
      d.stageTicks.textContent = String(game.actionTick).padStart(3, '0');
      d.stageDelta.textContent = '−' + (game.actionTick * 0.17).toFixed(2);
      d.railShardState.textContent = game.shardCollected ? '已回收 · 带着它抵达出口' : '未回收';
      var syncLabel = '';
      if (game.syncPlates.length) {
        var pressed = game.syncPlates.filter(function (p) { return p.pressed; }).length;
        syncLabel = game.syncLatched ? 'SYNC LOCKED' : 'SYNC ' + pressed + '/' + game.syncPlates.length;
        d.stageSync.textContent = syncLabel;
        d.stageStatus.textContent = game.syncLatched ? 'SYNCED' : game.status === 'won' ? 'STABILIZED' : 'OBSERVING';
      } else {
        d.stageStatus.textContent = game.status === 'won' ? 'STABILIZED' : 'OBSERVING';
      }
      this._renderChargePips(game);
      this._renderEnergySegments(game);
      this._renderEchoRoster(game);
      this._renderSyncMonitor(game);
      this._updateMobileMonitor(game);
      this._syncButtons();
      this._updateHintUI();
    }

    _renderChargePips(game) {
      var root = this.dom.chargePips;
      root.replaceChildren();
      for (var i = 0; i < game.maxRewinds; i++) {
        var pip = document.createElement('span');
        pip.className = 'charge-pip ' + (i < game.rewindsLeft ? 'is-full' : 'is-spent');
        root.appendChild(pip);
      }
    }

    _renderEnergySegments(game) {
      var root = this.dom.monitorEnergy;
      root.replaceChildren();
      for (var i = 0; i < game.maxRewinds; i++) {
        var seg = document.createElement('span');
        seg.className = 'energy-segment ' + (i < game.rewindsLeft ? 'is-full' : '');
        root.appendChild(seg);
      }
    }

    _renderEchoRoster(game) {
      var root = this.dom.echoRoster;
      var count = this.dom.echoRosterCount;
      root.replaceChildren();
      count.textContent = pad2(game.echoes.length);
      if (!game.echoes.length) {
        var empty = document.createElement('div');
        empty.className = 'roster-empty';
        empty.innerHTML = '尚无回响。按 <kbd>R</kbd> 刻录本轮。';
        root.appendChild(empty);
        return;
      }
      var maxPath = Math.max(1, Math.max.apply(null, game.echoes.map(function (e) { return e.actions.length; })));
      game.echoes.forEach(function (echo) {
        var row = document.createElement('div');
        row.className = 'roster-row';
        var pct = Math.round((echo.actions.length / maxPath) * 100);
        var recorded = echo.actions.length;
        var played = Math.min(recorded, game.actionTick);
        var status = played >= recorded ? '驻留' : '重演 ' + played + '/' + recorded;
        row.innerHTML =
          '<span class="roster-no">' + pad2(echo.no) + '</span>' +
          '<span class="roster-main"><strong>ECHO-' + pad2(echo.no) + ' · ' + recorded + ' 刻</strong><span class="roster-bar"><i style="width:' + pct + '%"></i></span></span>' +
          '<span class="roster-actions">' + status + '</span>';
        root.appendChild(row);
      });
    }

    _renderSyncMonitor(game) {
      if (!game.syncPlates.length) return;
      var d = this.dom;
      var pressed = game.syncPlates.filter(function (p) { return p.pressed; }).length;
      d.syncCount.textContent = pressed + ' / ' + game.syncPlates.length + (game.syncLatched ? ' · LATCHED' : '');
      var pips = qsa('.sync-pip', d.syncPips);
      game.syncPlates.forEach(function (p, i) {
        var el = pips[i];
        if (!el) return;
        el.classList.toggle('is-pressed', p.pressed);
        el.classList.toggle('is-latched', game.syncLatched);
        el.setAttribute('title', '节点 ' + p.node + (p.cradle ? ' / 质量槽' : ' / 重量节点') + (p.pressed ? ' / 已占据' : ' / 空'));
      });
      d.syncHint.textContent = game.syncLatched
        ? '同步已成立 · ○ 任意重量 / □ 仅箱子 · 同步门在本轮保持开启。'
        : this._syncHintForLevel(LEVELS[this.currentLevelId - 1]);
    }

    _syncHintForLevel(level) {
      if (level.syncCradles && level.syncCradles.length) return '○ 圆节点：任意实体均可；□ 方质量槽：只认箱子。全部同时成立后 G 门开启。';
      return '○ 圆节点：玩家、回响或箱子均可；全部同时成立后 G 门开启。';
    }

    _updateMobileMonitor(game) {
      var d = this.dom;
      if (!game || !d.mmLoop) return;
      d.mmLoop.textContent = pad2(game.loop);
      d.mmActions.textContent = String(game.totalActions);
      d.mmEchoes.textContent = String(game.echoes.length);
      d.mmEnergyText.textContent = game.rewindsLeft + ' / ' + game.maxRewinds;
      d.mmEnergy.replaceChildren();
      for (var i = 0; i < game.maxRewinds; i++) {
        var seg = document.createElement('span');
        seg.className = 'energy-segment ' + (i < game.rewindsLeft ? 'is-full' : '');
        d.mmEnergy.appendChild(seg);
      }
      if (game.syncPlates.length) {
        d.mmSync.hidden = false;
        d.mmSyncPips.replaceChildren();
        game.syncPlates.forEach(function (p) {
          var el = document.createElement('span');
          el.className = 'sync-pip' + (p.cradle ? ' is-cradle' : '') + (p.pressed ? ' is-pressed' : '');
          el.innerHTML = '<span>' + p.node + '</span>';
          d.mmSyncPips.appendChild(el);
        });
        d.mmSyncCount.textContent = game.syncPlates.filter(function (p) { return p.pressed; }).length + ' / ' + game.syncPlates.length + (game.syncLatched ? ' · LOCKED' : '');
      } else {
        d.mmSync.hidden = true;
      }
      d.mmRoster.replaceChildren();
      if (!game.echoes.length) {
        var empty = document.createElement('span');
        empty.className = 'mm-empty';
        empty.textContent = '尚无回响 · 按 R 刻录本轮';
        d.mmRoster.appendChild(empty);
      } else {
        game.echoes.forEach(function (echo) {
          var chip = document.createElement('span');
          chip.className = 'mm-echo-chip';
          chip.innerHTML = '<i>' + pad2(echo.no) + '</i> ECHO · ' + echo.actions.length + ' 刻';
          d.mmRoster.appendChild(chip);
        });
      }
      d.mmLog.replaceChildren();
      this._causalEntries.slice(-2).reverse().forEach(function (entry) {
        var li = document.createElement('li');
        li.innerHTML = '<span>' + entry.stamp + '</span>' + this._escapeText(entry.text);
        d.mmLog.appendChild(li);
      }, this);
      var level = LEVELS[game.levelId - 1];
      if (d.mmNote) {
        if (level && this.hintsShown > 0) {
          d.mmNote.textContent = '提示 ' + this.hintsShown + ' / ' + level.hint.length + ' · ' + level.hint[this.hintsShown - 1];
        } else {
          d.mmNote.textContent = level ? (MOBILE_TIPS[level.mechanicKey] || level.mechanic) : '';
        }
      }
      if (d.mmShard) {
        d.mmShard.classList.toggle('is-earned', game.shardCollected);
        d.mmShard.innerHTML = '<span aria-hidden="true">◇</span> MEMORY / ' + (game.shardCollected ? '已回收' : '未回收');
      }
    }

    _escapeText(text) {
      return String(text || '').replace(/[&<>"']/g, function (ch) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
      });
    }

    _appendEventsToCausalLog(events, game) {
      var stamp = 'L' + pad2(game.loop) + '.' + pad2(game.actionTick);
      var seenText = {};
      events.forEach(function (evt) {
        var text = '';
        if (evt.type === 'playerMove') text = '你移动到 ' + coordName(evt.to.x, evt.to.y);
        else if (evt.type === 'echoMove') {
          var echo = game.echoes.find(function (e) { return e.id === evt.echoId; });
          text = '回响 ' + pad2(echo ? echo.no : 0) + ' 移动至 ' + coordName(evt.to.x, evt.to.y);
        } else if (evt.type === 'crateMove') text = (evt.anchor ? '因果锚' : '箱子') + '移动至 ' + coordName(evt.to.x, evt.to.y);
        else if (evt.type === 'plate') {
          var p = game.plates.concat(game.syncPlates).find(function (pp) { return pp.x === evt.x && pp.y === evt.y; });
          text = (p && p.kind === 'sync' ? '节点 ' + p.node : '压力板 ' + (p ? p.group : '')) + (evt.pressed ? ' 被压住' : ' 复位');
        } else if (evt.type === 'door') text = (evt.group === 'V' ? '因果封印 V' : evt.group === 'G' ? '同步门 G' : '闸门 ' + evt.group) + (evt.open ? ' 开启' : ' 关闭');
        else if (evt.type === 'seal') text = '封印触发器 v 激活，V 闸锁死';
        else if (evt.type === 'sync') text = '同步成立，核心门解除锁定';
        else if (evt.type === 'shard') text = '记忆碎片回收';
        else if (evt.type === 'rewind') text = '倒带 · 刻录回响 ' + pad2(evt.echoNo) + '（' + evt.recorded + ' 刻）';
        else if (evt.type === 'anchorPersist') text = '因果锚保留位置';
        else if (evt.type === 'win') text = '出口已抵达 · 扇区稳定';
        if (text && !seenText[text]) {
          seenText[text] = true;
          this._appendCausalLog(stamp, text);
        }
      }, this);
    }

    _appendCausalLog(stamp, text) {
      this._causalEntries.push({ stamp: stamp, text: text });
      if (this._causalEntries.length > 8) this._causalEntries.shift();
      var root = this.dom.causalLog;
      if (root) {
        root.replaceChildren();
        this._causalEntries.slice().reverse().forEach(function (entry) {
          var li = document.createElement('li');
          var tick = document.createElement('span');
          tick.className = 'log-tick';
          tick.textContent = entry.stamp;
          var body = document.createElement('span');
          body.className = 'log-text';
          body.textContent = entry.text;
          li.appendChild(tick);
          li.appendChild(body);
          root.appendChild(li);
        });
      }
      if (this.currentGame) this._updateMobileMonitor(this.currentGame);
    }

    _showHint() {
      var game = this.currentGame;
      var level = LEVELS[this.currentLevelId - 1];
      if (!game || !level) return;
      var trace = Log.trace('hint');
      Log.log(trace, '[请求到达]', {
        step: '请求 ARIADNE 提示',
        input: { levelId: level.id, shown: this.hintsShown, total: level.hint.length },
        source: 'button/key'
      });
      if (this.hintsShown >= level.hint.length) {
        Log.log(trace, '[请求被拒绝]', {
          step: '请求 ARIADNE 提示',
          interceptLayer: '提示规则',
          reason: '该扇区的所有提示已显示',
          statusCode: 429,
          businessImpact: '不重复展示提示，玩家可继续自行观察'
        });
        this._toast('ARIADNE / 提示', '这个扇区的提示已经全部给出。现在轮到你替因果做决定。', 'info', 3200);
        Log.log(trace, '[响应返回]', { step: '请求 ARIADNE 提示', statusCode: 429, result: '拒绝' });
        return;
      }
      var text = level.hint[this.hintsShown];
      this.hintsShown += 1;
      this.dom.railHint.textContent = text;
      this._updateHintUI();
      this._updateMobileMonitor(game);
      this.audio.play('hint');
      this._toast('ARIADNE / 提示 ' + this.hintsShown + '/' + level.hint.length, text, 'story', 6500);
      Log.log(trace, '[业务方法执行]', {
        step: '给出 ARIADNE 提示',
        input: { levelId: level.id, shownBefore: this.hintsShown - 1 },
        result: '成功',
        businessImpact: '在任务轨道中展示第 ' + this.hintsShown + ' 条提示'
      });
      Log.log(trace, '[响应返回]', { step: '请求 ARIADNE 提示', statusCode: 200, result: '成功' });
    }

    _updateHintUI() {
      var level = LEVELS[this.currentLevelId - 1];
      if (!level) return;
      var d = this.dom;
      qsa('i', d.hintDots).forEach(function (el, i) {
        el.classList.toggle('is-used', i < this.hintsShown);
      }, this);
      d.compactHintCount.textContent = this.hintsShown + '/' + level.hint.length;
      d.btnHint.disabled = this.hintsShown >= level.hint.length;
      d.btnHint.textContent = this.hintsShown >= level.hint.length ? '提示已全部显示' : '请求提示';
      if (this.hintsShown < level.hint.length) {
        var kbd = document.createElement('kbd');
        kbd.textContent = 'H';
        d.btnHint.appendChild(document.createTextNode(' '));
        d.btnHint.appendChild(kbd);
      }
    }

    _onCanvasHover(ev) {
      if (!this.currentGame || this.currentScreen !== 'game' || this.busy) return;
      var cell = this.renderer.cellAtPoint(ev.clientX, ev.clientY);
      if (!cell) { this._clearHover(); return; }
      this.renderer.setHover(cell);
      var info = this._describeCell(cell.x, cell.y);
      var d = this.dom;
      d.inspectorCoord.textContent = coordName(cell.x, cell.y);
      d.inspectorName.textContent = info.name;
      d.inspectorDesc.textContent = info.desc;
      d.tileInspector.hidden = false;
    }

    _clearHover() {
      this.renderer.setHover(null);
      if (this.dom.tileInspector) this.dom.tileInspector.hidden = true;
    }

    _describeCell(x, y) {
      var game = this.currentGame;
      var cell = game.cellAt(x, y);
      if (!cell) return { name: '外部空间', desc: '因果观测窗之外。' };
      if (game.player.x === x && game.player.y === y) return { name: '你 / ANCHOR OBSERVER', desc: '当前时间线的锚定观测者。' };
      var echo = game.echoes.find(function (e) { return e.x === x && e.y === y; });
      if (echo) return { name: '回响 ' + pad2(echo.no), desc: '过去的你。按记录重演 ' + echo.actions.length + ' 个动作；拥有重量，可压板、推箱。' };
      var crate = game.crateAt(x, y);
      if (crate) return crate.anchor
        ? { name: '因果锚箱', desc: '倒带时保留位置。它的未来会覆盖下一轮的过去。' }
        : { name: '普通箱', desc: '可推动。倒带后会回到初始位置。' };
      if (cell.exit) return { name: '出口 / EXIT', desc: '抵达即完成本扇区。若门前有 G 同步门，需要先让全部节点同时成立。' };
      if (cell.shard) return { name: '记忆碎片', desc: '仅玩家可拾取。倒带会重置；在本轮带着它抵达出口才计入评价。' };
      var p = game.plates.concat(game.syncPlates).find(function (pp) { return pp.x === x && pp.y === y; });
      if (p) {
        if (p.kind === 'sync') {
          return p.cradle
            ? { name: '质量槽节点 ' + p.node, desc: '只认箱子的重量。玩家与回响无法占据。' }
            : { name: '同步节点 ' + p.node, desc: '任意实体都可以占据。所有节点同时成立时，G 门开启。' };
        }
        return { name: '压力板 ' + p.group, desc: '任一实体压住时，' + p.group + ' 系闸门开启；离开后立即关闭。' };
      }
      var door = game.doorAtCell(x, y);
      if (door) {
        var groupName = door.group === 'V' ? '因果封印闸' : door.group === 'G' ? '同步门' : door.group + ' 系闸门';
        return { name: groupName + (door.open ? ' / 开启' : ' / 关闭'), desc: door.open ? '当前可通过。' : '当前被因果规则锁定，需要对应重量或同步条件。' };
      }
      if (cell.sealTrigger) return { name: '因果封印触发器 v', desc: '任意实体经过后，V 闸在本循环内永久关闭。' };
      if (cell.wall) return { name: '实验舱壁 / HULL', desc: '可承受因果回响的合金结构。不可穿越。' };
      return { name: '实验舱地面', desc: '平滑的石墨地板。未检测到异常因果重量。' };
    }

    _updateLiveRegion() {
      var game = this.currentGame;
      if (!game) return;
      var d = this.dom;
      var doorText = game.doors.map(function (door) {
        return (door.group === 'V' ? '封印闸' : door.group === 'G' ? '同步门' : door.group + '门') + (door.open ? '开' : '关');
      }).join('，');
      var sync = game.syncPlates.length ? ('同步节点 ' + game.syncPlates.filter(function (p) { return p.pressed; }).length + ' / ' + game.syncPlates.length + '。') : '';
      d.gameLive.textContent = '第 ' + game.loop + ' 次循环，第 ' + game.actionTick + ' 刻。你位于 ' + coordName(game.player.x, game.player.y) + '。回响 ' + game.echoes.length + ' 个。' + sync + doorText + '。余响 ' + game.rewindsLeft + ' 次。';
    }

    /* ===================================================================
       结算与结局
       =================================================================== */
    _finishLevel(trace) {
      if (!this.currentGame || this.currentLevelId === null) return;
      var game = this.currentGame;
      var level = LEVELS[this.currentLevelId - 1];
      if (game.status !== 'won' || this._completedDialogOpen) return;
      this._completedDialogOpen = true;
      var stats = game.winStats || {
        loop: game.loop,
        echoesUsed: game.rewindsUsed,
        actions: game.totalActions,
        shardCollected: game.shardCollected,
        parActions: level.parActions
      };
      var stars = 1 + (stats.shardCollected ? 1 : 0) + (stats.actions <= level.parActions ? 1 : 0);
      stars = clamp(stars, 1, 3);
      this._lastResult = { level: level, stats: stats, stars: stars };
      // 更新档案（只保留更好记录）
      var prev = this.save.completed[level.id];
      var merged = {
        stars: Math.max(prev ? prev.stars : 0, stars),
        bestActions: prev && prev.bestActions !== null ? Math.min(prev.bestActions, stats.actions) : stats.actions,
        bestEchoes: prev && prev.bestEchoes !== null ? Math.min(prev.bestEchoes, stats.echoesUsed) : stats.echoesUsed,
        shard: !!(prev && prev.shard) || !!stats.shardCollected,
        completedAt: prev && prev.completedAt ? prev.completedAt : nowIso()
      };
      this.save.completed[level.id] = merged;
      if (stats.shardCollected) this.save.shardLogs[level.id] = true;
      this.save.maxUnlocked = Math.max(this.save.maxUnlocked, Math.min(MAX_LEVEL, level.id + 1));
      this.save.lastLevel = level.id;
      this._writeSave(trace, '扇区 ' + level.id + ' 稳定，记录评价与解锁进度');
      this._renderArchive();
      this._refreshTitle();

      var d = this.dom;
      d.resultKicker.textContent = level.code + ' / STABILIZED';
      d.resultSubtitle.textContent = level.id === MAX_LEVEL ? 'CAUSAL CORE SYNCHRONIZED' : 'CAUSAL LOOP CLOSED';
      d.resultTitle.textContent = level.id === MAX_LEVEL ? '核心已同步' : level.name + ' 已稳定';
      d.resultEpithet.textContent = level.id === MAX_LEVEL
        ? '五个重量点同时成立。因果引擎第一次承认了这个“现在”。'
        : level.epithet;
      d.resultStars.innerHTML = [1, 2, 3].map(function (i) {
        return '<span class="' + (i <= stars ? 'is-earned' : '') + '">' + (i <= stars ? '★' : '☆') + '</span>';
      }).join('');
      d.resultStars.setAttribute('aria-label', '本关评价：' + stars + ' 星，共 3 星');
      d.resultStats.innerHTML =
        '<div><span class="micro-label">LOOPS / 循环</span><strong>' + stats.loop + '</strong></div>' +
        '<div><span class="micro-label">ECHOES / 回响</span><strong>' + stats.echoesUsed + '<em> / ' + level.echoBudget + '</em></strong></div>' +
        '<div><span class="micro-label">ACTIONS / 行动</span><strong>' + stats.actions + '<em> / PAR ' + level.parActions + '</em></strong></div>';
      if (stats.shardCollected && level.shardLog) {
        d.resultShard.hidden = false;
        d.resultShardTitle.textContent = 'MEMORY RECOVERED / ' + level.shardLog.title;
        d.resultShardBody.textContent = level.shardLog.body;
      } else {
        d.resultShard.hidden = true;
      }
      var actionsHtml = '';
      if (level.id < MAX_LEVEL) {
        actionsHtml += '<button type="button" class="btn btn-primary" data-result-action="next">下一扇区 <span class="btn-arrow" aria-hidden="true">→</span></button>';
      } else {
        actionsHtml += '<button type="button" class="btn btn-primary" data-result-action="ending">前往核心 <span class="btn-arrow" aria-hidden="true">→</span></button>';
      }
      actionsHtml += '<button type="button" class="btn btn-ghost" data-result-action="replay">重演本扇区</button>';
      actionsHtml += '<button type="button" class="btn btn-quiet" data-result-action="archive">返回档案</button>';
      d.resultActions.innerHTML = actionsHtml;
      var missingShard = !stats.shardCollected;
      d.resultNote.textContent = missingShard
        ? '评价已保存。记忆碎片仍在扇区中——重演并带着它抵达出口，可补全档案。'
        : '进度、评价与记忆碎片已保存到本地实验记录。';
      this._openDialog('result');
      Log.log(trace || Log.trace('result'), '[业务方法执行]', {
        step: '扇区结算',
        levelId: level.id,
        input: stats,
        calculation: '完成=1星，记忆碎片=1星，行动 ' + stats.actions + ' ≤ PAR ' + level.parActions + '=1星，最终 ' + stars + ' 星',
        result: '成功',
        businessImpact: '评价 ' + stars + ' 星，解锁上限 ' + this.save.maxUnlocked
      });
      Log.log(trace || Log.trace('result'), '[响应返回]', {
        step: '扇区结算',
        statusCode: 200,
        result: '成功',
        businessImpact: '向玩家展示结算，并等待选择下一动作'
      });
      this._syncButtons();
    }

    _handleResultAction(action) {
      var trace = Log.trace('result');
      var levelId = this.currentLevelId;
      Log.log(trace, '[请求到达]', { step: '结算选项', action: action, levelId: levelId, source: 'button' });
      this._completedDialogOpen = false;
      this._closeDialog(this.dom.dialogResult);
      this.busy = false;
      this.audio.play('ui');
      if (action === 'next') {
        var next = Math.min(MAX_LEVEL, levelId + 1);
        this._startLevel(next, { reason: '结算后进入下一扇区', traceId: trace });
      } else if (action === 'replay') {
        this._startLevel(levelId, { reason: '结算后重演扇区', traceId: trace });
      } else if (action === 'archive') {
        this._showArchive('result');
      } else if (action === 'ending') {
        this._showEnding('result');
      }
      Log.log(trace, '[响应返回]', { step: '结算选项', statusCode: 200, result: '成功', businessImpact: '已执行玩家选择的后续导航' });
    }

    _showEnding(from) {
      this._hideAllDialogs();
      this._cancelTimers();
      this.busy = false;
      this._showScreen('ending', { reason: '进入核心结局' });
      this.audio.setScene('ending');
      this.audio.play('ending');
      this._renderEndingIntro();
      var trace = Log.trace('ending');
      Log.log(trace, '[业务入口]', {
        step: '进入核心最终记录',
        source: from || 'unknown',
        endingsSeen: this._endingCount(),
        result: '成功',
        businessImpact: '玩家面对最终不可逆选择'
      });
    }

    _renderEndingIntro() {
      var d = this.dom;
      d.endingIntro.hidden = false;
      d.endingEpilogue.hidden = true;
      d.endingTitle.innerHTML = '你走到了<span class="ending-title-break">最后一次循环。</span>';
      d.endingDialogue.innerHTML =
        '<p>核心室的门在你身后合拢。五个节点的重量仍然压在这间实验室上，像五根钉进时间的钉子。</p>' +
        '<p>ARIADNE 的声音第一次不再经过扬声器。它从你颅骨里的锚点直接响起。</p>' +
        '<p class="ariadne-line">第 4097 次循环。你终于走到了这里。事故那天，沈鹭把自己留在核心舱，而我把你从她的最后十七分钟里借了出来。每一次循环，我都离正确的结果更近一点，也离你更远一点。</p>' +
        '<p class="ariadne-line">现在，你要替我做一个决定。闭合它，或者打碎它。</p>';
      d.endingFooterQuote.textContent = '「不是所有回声都需要被听见。」';
      qsa('[data-ending]', d.endingChoices).forEach(function (btn) { btn.disabled = false; });
    }

    _chooseEnding(which) {
      if (!ENDINGS[which]) return;
      var trace = Log.trace('ending');
      Log.log(trace, '[请求到达]', {
        step: '最终因果选择',
        action: which === 'close' ? '闭合因果环' : '越出因果',
        source: 'button',
        result: '准备执行',
        businessImpact: '该选择会写入结局档案'
      });
      if (!this._allComplete()) {
        this._rejectAction(trace, '核心状态', '尚未稳定全部扇区，不能做出最终选择', 409, '选择未生效');
        return;
      }
      var already = this.save.endings[which];
      this.save.endings[which] = true;
      this._writeSave(trace, '记录最终结局');
      this._renderEpilogue(which);
      this.audio.play('ending');
      Log.log(trace, '[业务方法执行]', {
        step: '记录最终选择',
        input: { ending: which, alreadySeen: !!already },
        before: { endings: this._endingCount() - (already ? 0 : 1) },
        after: { endings: this._endingCount() },
        result: '成功',
        businessImpact: '结局 ' + (which === 'close' ? 'A' : 'B') + ' 已写入本地实验记录'
      });
      Log.log(trace, '[响应返回]', {
        step: '最终因果选择',
        statusCode: 200,
        result: '成功',
        businessImpact: '进入对应尾声，玩家可以返回标题或查看档案'
      });
    }

    _renderEpilogue(which) {
      var data = ENDINGS[which];
      var d = this.dom;
      d.endingIntro.hidden = true;
      d.endingEpilogue.hidden = false;
      d.epilogueCode.textContent = data.code;
      d.epilogueTitle.textContent = data.title;
      d.epilogueBody.innerHTML = data.paragraphs.map(function (p) { return '<p>' + p + '</p>'; }).join('');
      d.epilogueEchoes.textContent = which === 'close' ? '4096 / RELEASED' : '4096 / SCATTERED';
      d.epilogueEnding.textContent = which === 'close' ? 'A / 2' : 'B / 2';
      d.endingFooterQuote.textContent = data.quote;
      var heading = d.epilogueTitle;
      heading.setAttribute('tabindex', '-1');
      try { heading.focus({ preventScroll: true }); } catch (e) { heading.focus(); }
      window.scrollTo({ top: 0, behavior: this._effectiveReducedMotion() ? 'auto' : 'smooth' });
      this._renderArchive();
      this._refreshTitle();
    }

    /* ===================================================================
       弹窗、暂停、提示
       =================================================================== */
    _openPause() {
      if (this.currentScreen !== 'game') return;
      var trace = Log.trace('pause');
      Log.log(trace, '[请求到达]', { step: '暂停实验', source: 'key/button', levelId: this.currentLevelId });
      this.dom.pauseSector.textContent = LEVELS[this.currentLevelId - 1].code + ' / ' + LEVELS[this.currentLevelId - 1].tag;
      this._openDialog('pause');
      Log.log(trace, '[响应返回]', { step: '暂停实验', statusCode: 200, result: '成功', businessImpact: '游戏输入与时间刻度暂停，玩家可选择继续或退出' });
    }

    _openDialog(name) {
      var dialog = this.dialogs[name] || qs('#dialog-' + name);
      if (!dialog) return;
      var trace = Log.trace('dialog');
      Log.log(trace, '[请求到达]', { step: '打开弹窗', dialog: name, screen: this.currentScreen, source: 'ui' });
      var open = document.querySelector('dialog[open]');
      if (open && open !== dialog) {
        Log.log(trace, '[中间件-弹窗闸门]', {
          step: '打开弹窗',
          result: '通过',
          reason: '关闭上一弹窗后显示新的弹窗',
          previousDialog: open.id
        });
        open.close();
      }
      try {
        if (!dialog.open) dialog.showModal();
      } catch (error) {
        Log.log(trace, '[异常]', {
          step: '打开弹窗',
          phase: 'UI/dialog',
          errorType: error.name,
          reason: error.message,
          businessImpact: '弹窗无法显示，游戏状态未改变',
          handled: true
        });
        return;
      }
      this.activeDialog = name;
      document.body.classList.add('is-dialog-open');
      this.audio.play('ui');
      Log.log(trace, '[响应返回]', { step: '打开弹窗', statusCode: 200, result: '成功', businessImpact: '显示 ' + name + ' 对话框' });
    }

    _closeDialog(dialog) {
      if (!dialog || !dialog.open) {
        if (!document.querySelector('dialog[open]')) document.body.classList.remove('is-dialog-open');
        return;
      }
      var trace = Log.trace('dialog');
      Log.log(trace, '[请求到达]', { step: '关闭弹窗', dialog: dialog.id });
      dialog.close();
      this.activeDialog = null;
      if (!document.querySelector('dialog[open]')) document.body.classList.remove('is-dialog-open');
      this.audio.play('ui-soft');
      Log.log(trace, '[响应返回]', { step: '关闭弹窗', statusCode: 200, result: '成功', businessImpact: '返回之前的界面' });
    }

    _hideAllDialogs() {
      qsa('dialog[open]').forEach(function (dlg) { dlg.close(); });
      this.activeDialog = null;
      document.body.classList.remove('is-dialog-open');
      this._completedDialogOpen = false;
    }

    _handleResetProgress() {
      var trace = Log.trace('save');
      if (!this._pendingResetProgress) {
        this._pendingResetProgress = true;
        this.dom.btnResetProgress.textContent = '再次点击确认清除';
        this.dom.btnResetProgress.classList.add('btn-danger');
        var self = this;
        setTimeout(function () { self._pendingResetProgress = false; self.dom.btnResetProgress.textContent = '清除进度'; }, 4200);
        Log.log(trace, '[中间件-不可逆确认]', {
          step: '清除实验记录',
          result: '等待确认',
          reason: '第一次点击只做确认防护，不执行删除',
          businessImpact: '本地实验记录尚未删除'
        });
        return;
      }
      try {
        window.localStorage.removeItem(SAVE_KEY);
        Log.log(trace, '[数据库删除]', {
          step: '清除实验记录',
          intent: '删除浏览器 localStorage 中的进度',
          condition: 'key=' + SAVE_KEY,
          result: '删除成功',
          affectedRows: 1,
          businessImpact: '所有扇区解锁、评价、碎片与结局记录已清除'
        });
      } catch (error) {
        Log.log(trace, '[异常]', {
          step: '清除实验记录',
          phase: '数据层/localStorage 删除',
          errorType: error.name,
          reason: error.message,
          businessImpact: '记录未能删除',
          handled: true
        });
        this.dom.btnResetProgress.textContent = '清除失败';
        return;
      }
      this.save = defaultSave();
      this._pendingResetProgress = false;
      Log.flush();
      this._toast('ARCHIVE RESET', '实验记录已清除。页面将重新启动。', 'warn', 1600);
      setTimeout(function () { window.location.reload(); }, 700);
    }

    /* ===================================================================
       计时器 / 日志辅助
       =================================================================== */
    _later(fn, ms) {
      var id = setTimeout(fn, ms);
      this.runningTimers.push(id);
      return id;
    }

    _cancelTimers() {
      this.runningTimers.forEach(function (id) { clearTimeout(id); });
      this.runningTimers = [];
      if (this.curtainTimer) { clearTimeout(this.curtainTimer); this.curtainTimer = null; }
    }

    _toast(title, message, type, duration) {
      var root = this.dom.toastRoot || qs('#toast-root');
      if (!root) return;
      // 同类故事提示只保留最新一条，避免遮住仪表。
      if (type === 'story') {
        qsa('.toast--story', root).forEach(function (old) {
          if (old.parentNode) old.parentNode.removeChild(old);
        });
      }
      var el = document.createElement('div');
      el.className = 'toast toast--' + (type || 'info');
      var mark = document.createElement('span');
      mark.className = 'toast-mark';
      mark.setAttribute('aria-hidden', 'true');
      var copy = document.createElement('div');
      copy.className = 'toast-copy';
      var t = document.createElement('span');
      t.className = 'toast-title';
      t.textContent = title;
      var m = document.createElement('span');
      m.className = 'toast-message';
      m.textContent = message;
      copy.appendChild(t);
      copy.appendChild(m);
      el.appendChild(mark);
      el.appendChild(copy);
      root.appendChild(el);
      while (root.children.length > 2) root.removeChild(root.firstElementChild);
      var timer = setTimeout(function () {
        el.classList.add('is-leaving');
        setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 260);
      }, duration || 3200);
      return { el: el, timer: timer };
    }

    _clearToasts() {
      var root = this.dom.toastRoot || qs('#toast-root');
      if (root) root.replaceChildren();
    }

    _toastOnce(key, title, message, type, duration) {
      if (this._levelFlags[key]) return;
      this._levelFlags[key] = true;
      this._toast(title, message, type, duration);
    }

    _stateDigest(game) {
      if (!game) return null;
      return {
        levelId: game.levelId,
        loop: game.loop,
        tick: game.actionTick,
        currentActions: game.currentActions.length,
        totalActions: game.totalActions,
        echoes: game.echoes.length,
        rewindsLeft: game.rewindsLeft,
        player: { x: game.player.x, y: game.player.y, facing: game.player.facing },
        crates: game.crates.map(function (c) { return { x: c.x, y: c.y, anchor: c.anchor }; }),
        shard: game.shardCollected,
        seal: game.sealTriggered,
        sync: game.syncLatched,
        doors: game.doors.map(function (d) { return d.group + ':' + (d.open ? 'open' : 'closed'); }),
        status: game.status
      };
    }

    _hudDigest(game) {
      if (!game) return null;
      return {
        loop: game.loop,
        rewindsLeft: game.rewindsLeft,
        canRewind: game.canRewind,
        canUndo: game.canUndo,
        shard: game.shardCollected,
        actions: game.totalActions,
        tick: game.actionTick,
        stageStatus: this.dom.stageStatus ? this.dom.stageStatus.textContent : null
      };
    }

    _describeEvent(evt, game) {
      if (!evt) return null;
      switch (evt.type) {
        case 'playerMove': return '玩家从 ' + coordName(evt.from.x, evt.from.y) + ' 移动到 ' + coordName(evt.to.x, evt.to.y);
        case 'echoMove': {
          var echo = game.echoes.find(function (e) { return e.id === evt.echoId; });
          return '回响 ' + (echo ? echo.no : evt.echoId) + ' 从 ' + coordName(evt.from.x, evt.from.y) + ' 移动到 ' + coordName(evt.to.x, evt.to.y);
        }
        case 'crateMove': return (evt.anchor ? '因果锚' : '箱子') + ' 从 ' + coordName(evt.from.x, evt.from.y) + ' 推到 ' + coordName(evt.to.x, evt.to.y);
        case 'plate': return (evt.cradle ? '质量槽' : evt.plateKind === 'sync' ? '同步节点' : '压力板') + ' ' + coordName(evt.x, evt.y) + (evt.pressed ? ' 被压住' : ' 弹起');
        case 'door': return (evt.group === 'V' ? '因果封印' : evt.group === 'G' ? '同步门' : evt.group + ' 闸') + (evt.open ? ' 开启' : ' 关闭') + ' @' + coordName(evt.x, evt.y);
        case 'seal': return '封印触发器激活 @' + coordName(evt.x, evt.y);
        case 'sync': return '全部同步节点同时成立（' + evt.nodes + ' 个）';
        case 'shard': return '玩家回收记忆碎片 @' + coordName(evt.x, evt.y);
        case 'rewind': return '倒带并刻录回响 ' + evt.echoNo + '，记录 ' + evt.recorded + ' 个动作';
        case 'anchorPersist': return '因果锚保留位置，形成因果残留';
        case 'win': return '玩家抵达出口，扇区完成';
        case 'blocked': return '动作被阻挡：' + evt.reason;
        case 'echoWait': return '回响等待一拍';
        case 'playerWait': return '玩家等待一拍';
        default: return evt.type;
      }
    }

    _logException(trace, error, phase) {
      Log.log(trace, '[异常]', {
        step: '游戏运行时',
        phase: phase,
        errorType: error && error.name ? error.name : 'UnknownError',
        reason: error && error.message ? error.message : String(error),
        handled: true,
        businessImpact: '界面保持当前状态，玩家可继续操作或重置扇区',
        stack: error && error.stack ? String(error.stack).slice(0, 800) : null
      });
    }

    _onWindowError(event) {
      var tr = Log.trace('error');
      Log.log(tr, '[异常]', {
        step: '全局脚本错误',
        phase: '浏览器/运行时',
        errorType: event.error && event.error.name,
        reason: event.message || '未知脚本错误',
        source: event.filename ? event.filename + ':' + event.lineno + ':' + event.colno : null,
        handled: false,
        businessImpact: '可能有界面功能不可用，但不会主动清空玩家进度'
      });
      if (!this._initErrorShown) {
        this._initErrorShown = true;
        this._toast('SYSTEM FAULT', '实验终端出现了一个异常。如果界面停止响应，请返回档案或刷新页面。', 'error', 5600);
      }
    }

    _onRejection(event) {
      var tr = Log.trace('error');
      Log.log(tr, '[异常]', {
        step: '未处理的 Promise 拒绝',
        phase: '浏览器/异步',
        errorType: 'UnhandledRejection',
        reason: event.reason && event.reason.message ? event.reason.message : String(event.reason),
        handled: false,
        businessImpact: '相关的非关键异步操作可能没有完成；游戏主状态不受影响'
      });
    }
  }

  window.addEventListener('DOMContentLoaded', function () {
    try {
      var app = new ChronoApp();
      app.init();
    } catch (error) {
      // 初始化异常必须给出可见反馈，不能被控制台吞掉。
      window.__CHRONO_INIT_ERROR__ = error;
      var box = document.createElement('div');
      box.className = 'noscript';
      box.innerHTML = '<div><h1>ORPHEUS-9 无法启动</h1><p>因果引擎在初始化时遇到异常：' +
        String(error && error.message ? error.message : error).replace(/[<>&]/g, function (c) { return { '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]; }) +
        '</p><p>请刷新页面重试。</p></div>';
      document.body.appendChild(box);
      if (window.ChronoLog) {
        var tr = window.ChronoLog.trace('fatal');
        window.ChronoLog.log(tr, '[异常]', {
          step: '应用初始化',
          phase: 'DOMContentLoaded',
          errorType: error && error.name,
          reason: error && error.message,
          handled: false,
          businessImpact: '游戏无法启动'
        });
        window.ChronoLog.flush(true);
      }
    }
  });
})();
