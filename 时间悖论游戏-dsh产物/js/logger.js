/* =========================================================================
 * 时间悖论：失控实验室 — 开发级前端审计日志
 * 目标：把一次玩家操作从“请求到达 → 输入闸门 → 业务校验 → 引擎执行 →
 * 状态变化 → 响应返回 → 异常”串成同一条 traceId 故事线。
 * 日志优先批量上报到 /api/logs/report；由 tools/serve.mjs 写入 logs/。
 * 直接用 file:// 打开时无法写盘，会静默缓存到 localStorage，不阻塞游戏。
 * ========================================================================= */
(function (root) {
  'use strict';

  var APP = 'chrono-paradox-lab';
  var VERSION = '1.0.0';
  var ENDPOINT = '/api/logs/report';
  var MAX_QUEUE = 120;
  var FLUSH_SIZE = 10;
  var FLUSH_DELAY = 600;
  var sessionId = makeId('session');
  var queue = [];
  var flushTimer = null;
  var inFlight = false;
  var screenName = 'boot';
  var localStorageKey = 'chrono.audit.spool.v1';
  var sequence = 0;
  var startedAt = Date.now();
  var enabled = true;
  var pageInfo = {
    href: '',
    path: '',
    userAgent: '',
    language: '',
    viewport: ''
  };

  function makeId(prefix) {
    var rand = Math.random().toString(36).slice(2, 10);
    return prefix + '-' + Date.now().toString(36) + '-' + rand;
  }

  function isBrowser() {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  }

  function isFileProtocol() {
    return isBrowser() && window.location.protocol === 'file:';
  }

  function readPageInfo() {
    if (!isBrowser()) return;
    pageInfo = {
      href: window.location.href,
      path: window.location.pathname,
      userAgent: navigator.userAgent,
      language: navigator.language,
      viewport: window.innerWidth + 'x' + window.innerHeight
    };
  }

  function summarize(value, depth) {
    if (value === null || value === undefined) return value;
    if (typeof value === 'string') return value.length > 240 ? value.slice(0, 237) + '…' : value;
    if (typeof value === 'number' || typeof value === 'boolean') return value;
    depth = depth || 0;
    if (depth > 2) return '[truncated]';
    if (Array.isArray(value)) {
      return value.slice(0, 8).map(function (item) { return summarize(item, depth + 1); });
    }
    if (typeof value === 'object') {
      var out = {};
      var keys = Object.keys(value).slice(0, 20);
      for (var i = 0; i < keys.length; i++) out[keys[i]] = summarize(value[keys[i]], depth + 1);
      return out;
    }
    return String(value);
  }

  function writeFallback(entries) {
    if (!isBrowser()) return;
    try {
      var current = [];
      try { current = JSON.parse(window.localStorage.getItem(localStorageKey) || '[]'); } catch (e) { current = []; }
      current = current.concat(entries).slice(-260);
      window.localStorage.setItem(localStorageKey, JSON.stringify(current));
    } catch (e) { /* 存储空间满或隐私模式：静默降级 */ }
  }

  function baseEntry(traceId, tag, data) {
    if (isBrowser()) {
      pageInfo.viewport = window.innerWidth + 'x' + window.innerHeight;
      pageInfo.href = window.location.href;
    }
    var payload = {
      schema: 'chrono-audit/v1',
      app: APP,
      appVersion: VERSION,
      env: 'development',
      sessionId: sessionId,
      traceId: traceId || 'untraced',
      seq: ++sequence,
      tag: tag,
      screen: screenName,
      time: new Date().toISOString(),
      elapsedMs: Date.now() - startedAt,
      page: pageInfo
    };
    if (data && typeof data === 'object') {
      var keys = Object.keys(data);
      for (var i = 0; i < keys.length; i++) {
        if (payload[keys[i]] === undefined) payload[keys[i]] = summarize(data[keys[i]]);
      }
    }
    return payload;
  }

  function scheduleFlush() {
    if (flushTimer || !enabled) return;
    flushTimer = setTimeout(function () {
      flushTimer = null;
      flush(false);
    }, FLUSH_DELAY);
  }

  function flush(useBeacon) {
    if (!enabled || !queue.length) return;
    if (isFileProtocol()) {
      writeFallback(queue);
      queue = [];
      return;
    }
    if (inFlight) {
      scheduleFlush();
      return;
    }
    var batch = queue.slice();
    queue = [];
    var body = JSON.stringify({
      sessionId: sessionId,
      app: APP,
      env: 'development',
      page: pageInfo,
      entries: batch
    });
    inFlight = true;

    if (useBeacon && isBrowser() && navigator.sendBeacon) {
      try {
        var blob = new Blob([body], { type: 'application/json' });
        navigator.sendBeacon(ENDPOINT, blob);
        inFlight = false;
        return;
      } catch (e) { /* fall through to fetch */ }
    }

    if (typeof fetch !== 'function') {
      writeFallback(batch);
      inFlight = false;
      return;
    }
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body,
      keepalive: false
    }).then(function (res) {
      if (!res.ok) {
        writeFallback(batch);
      }
      inFlight = false;
      if (queue.length >= FLUSH_SIZE) flush(false);
    }).catch(function () {
      writeFallback(batch);
      inFlight = false;
      if (queue.length >= FLUSH_SIZE) scheduleFlush();
    });
  }

  var Log = {
    init: function () {
      readPageInfo();
      if (isBrowser()) {
        window.addEventListener('pagehide', function () { flush(true); });
        document.addEventListener('visibilitychange', function () {
          if (document.visibilityState === 'hidden') flush(true);
        });
      }
      return Log;
    },
    trace: function (prefix) {
      return makeId(prefix || 'act');
    },
    setScreen: function (name) {
      screenName = name || 'unknown';
    },
    setEnabled: function (value) {
      enabled = !!value;
      if (!enabled) queue = [];
    },
    isEnabled: function () { return enabled; },
    log: function (traceId, tag, data) {
      if (!enabled) return;
      queue.push(baseEntry(traceId, tag, data));
      if (queue.length > MAX_QUEUE) queue.splice(0, queue.length - MAX_QUEUE);
      if (queue.length >= FLUSH_SIZE) flush(false);
      else scheduleFlush();
    },
    /* 小工具：同一条链路里写一条“阶段”日志 */
    phase: function (traceId, phase, data) {
      Log.log(traceId, phase, data);
    },
    flush: function (beacon) { flush(!!beacon); },
    info: function () {
      return {
        app: APP, version: VERSION, sessionId: sessionId,
        endpoint: ENDPOINT, screen: screenName,
        queued: queue.length, fileProtocol: isFileProtocol()
      };
    }
  };

  root.ChronoLog = Log;
})(typeof globalThis !== 'undefined' ? globalThis : this);
