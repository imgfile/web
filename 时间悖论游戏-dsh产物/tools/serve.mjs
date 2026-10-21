#!/usr/bin/env node
/*
 * ORPHEUS-9 本地静态服务器 + 审计日志落盘接口
 * ------------------------------------------------------------
 * 运行：node tools/serve.mjs
 * 打开：http://127.0.0.1:4173/
 *
 * 该服务器只绑定 127.0.0.1，不用于生产部署。它负责：
 *  1. 提供游戏静态文件，让浏览器从 http:// 而不是 file:// 运行；
 *  2. 接收游戏前端 /api/logs/report 的结构化日志，写入 logs/；
 *  3. 如实记录请求到达、参数校验、被拒绝、响应、异常。
 */
import http from 'node:http';
import { readFile, stat, mkdir, appendFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const LOG_DIR = path.join(ROOT, 'logs');
const PORT = Number(process.env.PORT || 4173);
const HOST = process.env.HOST || '127.0.0.1';
const START = Date.now();
const CLIENT_SESSIONS = new Map();
const MAX_BODY = 2 * 1024 * 1024;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

function dateStamp(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function nowIso() { return new Date().toISOString(); }
function rid(prefix) { return `${prefix}-${Date.now().toString(36)}-${crypto.randomBytes(3).toString('hex')}`; }

async function ensureLogDir() {
  await mkdir(LOG_DIR, { recursive: true });
}

async function appendLine(file, line) {
  try {
    await ensureLogDir();
    await appendFile(path.join(LOG_DIR, file), line + '\n', 'utf8');
  } catch (error) {
    process.stderr.write(`[日志写入失败] ${error.message}\n`);
  }
}

async function log(file, line) {
  await appendLine(file, line);
}

function requestSource(req) {
  return req.socket.remoteAddress || 'unknown';
}

function writeServerRequest(req, traceId, params) {
  return log(`server-dev-${dateStamp()}.log`,
    `[请求到达] traceId=${traceId} 入口=${req.method} ${req.url} 来源=${requestSource(req)} 客户端=${(req.headers['user-agent'] || 'unknown').slice(0, 120)} 关键参数=${params}`);
}

function writeServerResponse(req, traceId, status, note, elapsed) {
  return log(`server-dev-${dateStamp()}.log`,
    `[响应返回] traceId=${traceId} 入口=${req.method} ${req.url} 状态码=${status} 响应数据=${note} 耗时=${elapsed}ms 最终业务结果=${status >= 200 && status < 400 ? '成功' : '失败'}`);
}

function writeRejected(req, traceId, layer, reason, status, impact) {
  return log(`server-dev-${dateStamp()}.log`,
    `[请求被拒绝] traceId=${traceId} 拦截层=${layer} 结果=拒绝 原因=${reason} 返回状态码=${status} 业务影响=${impact} 请求未进入业务逻辑`);
}

function sanitizeValue(value) {
  if (Array.isArray(value)) return value.length;
  if (value === null || value === undefined) return '无';
  if (typeof value === 'object') return JSON.stringify(value).slice(0, 300);
  return String(value).replace(/\s+/g, ' ').slice(0, 300);
}

function humanReadableEntry(entry, batch) {
  const parts = [];
  parts.push(`[${entry.tag || '[未标记]'}]`);
  parts.push(`traceId=${entry.traceId || 'untraced'}`);
  parts.push(`session=${entry.sessionId || 'unknown'}`);
  if (entry.levelId) parts.push(`level=${entry.levelId}`);
  if (entry.step) parts.push(`step=${entry.step}`);
  if (entry.action) parts.push(`action=${entry.action}`);
  if (entry.result) parts.push(`结果=${entry.result}`);
  if (entry.decision) parts.push(`判断=${entry.decision}`);
  if (entry.reason) parts.push(`原因=${entry.reason}`);
  if (entry.input && typeof entry.input === 'object') {
    const inputPairs = Object.keys(entry.input).map((k) => `${k}:${sanitizeValue(entry.input[k])}`);
    if (inputPairs.length) parts.push(`关键输入={${inputPairs.join(',')}}`);
  }
  if (entry.before !== undefined) parts.push(`变更前=${sanitizeValue(entry.before)}`);
  if (entry.after !== undefined) parts.push(`变更后=${sanitizeValue(entry.after)}`);
  if (entry.businessImpact) parts.push(`业务影响=${entry.businessImpact}`);
  if (entry.durationMs !== undefined) parts.push(`耗时=${entry.durationMs}ms`);
  if (entry.page && entry.page.path) parts.push(`页面=${entry.page.path}`);
  if (entry.extra) parts.push(`补充=${sanitizeValue(entry.extra)}`);
  parts.push(`批次=${batch}`);
  return `[${entry.time || nowIso()}] ${parts.join(' ')}`;
}

async function saveReportBatch(payload, traceId, source) {
  const entries = Array.isArray(payload.entries) ? payload.entries : [];
  const batchId = rid('batch');
  const sessionId = payload.sessionId || 'unknown-session';
  CLIENT_SESSIONS.set(sessionId, {
    sessionId,
    lastSeen: nowIso(),
    lastTrace: traceId,
    count: (CLIENT_SESSIONS.get(sessionId)?.count || 0) + entries.length
  });
  const frontendFile = `frontend-dev-${dateStamp()}.log`;
  const auditFile = `audit-dev-${dateStamp()}.log`;
  for (const entry of entries) {
    await log(frontendFile, JSON.stringify({
      ...entry,
      serverBatchId: batchId,
      serverRequestTraceId: traceId,
      receivedAt: nowIso()
    }));
    await log(auditFile, humanReadableEntry(entry, batchId));
  }
  await log(`server-dev-${dateStamp()}.log`,
    `[业务入口] traceId=${traceId} step=写入前端审计日志 客户端session=${sessionId} 本次收到=${entries.length}条 来源=${source} 写入文件=${frontendFile},${auditFile} 批次=${batchId}`);
}

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const normalized = path.normalize(decoded).replace(/^(\.\.[/\\])+/, '');
  const target = path.resolve(ROOT, '.' + normalized);
  if (!target.startsWith(ROOT + path.sep) && target !== ROOT) return null;
  return target;
}

async function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        reject(Object.assign(new Error('payload-too-large'), { code: 'TOO_LARGE' }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const started = Date.now();
  const traceId = rid('httpreq');
  const urlPath = req.url.split('?')[0];

  try {
    await writeServerRequest(req, traceId, urlPath);

    if (req.method === 'POST' && urlPath === '/api/logs/report') {
      let raw;
      try {
        raw = await readBody(req);
      } catch (error) {
        await writeRejected(req, traceId, '请求体校验', error.code === 'TOO_LARGE' ? '请求体超过 2MB' : `读取失败:${error.message}`, 413, '日志未落盘');
        res.writeHead(413, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: false, error: 'payload-too-large' }));
        await writeServerResponse(req, traceId, 413, '请求体过大', Date.now() - started);
        return;
      }
      let payload;
      try {
        payload = JSON.parse(raw.toString('utf8'));
      } catch (error) {
        await writeRejected(req, traceId, 'JSON 解析', `无法解析请求体: ${error.message}`, 400, '前端日志未写入，游戏不受影响');
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: false, error: 'invalid-json' }));
        await writeServerResponse(req, traceId, 400, 'JSON 解析失败', Date.now() - started);
        return;
      }

      const entries = Array.isArray(payload.entries) ? payload.entries : null;
      if (!entries) {
        await writeRejected(req, traceId, '参数校验', 'entries 缺失或不是数组', 400, '前端日志未写入');
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: false, error: 'entries-required' }));
        await writeServerResponse(req, traceId, 400, '参数校验失败', Date.now() - started);
        return;
      }

      const invalid = entries.filter((entry) => !entry || typeof entry !== 'object' || !entry.traceId || !entry.tag);
      if (invalid.length) {
        await writeRejected(req, traceId, '日志结构校验', `有 ${invalid.length}/${entries.length} 条日志缺少 traceId 或 tag`, 422, '整批日志被拒绝，未落盘');
        res.writeHead(422, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: false, error: 'invalid-entry', invalid: invalid.length }));
        await writeServerResponse(req, traceId, 422, '日志结构校验失败', Date.now() - started);
        return;
      }

      await saveReportBatch(payload, traceId, requestSource(req));
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(JSON.stringify({ ok: true, received: entries.length, traceId }));
      await writeServerResponse(req, traceId, 200, `收到 ${entries.length} 条日志并写入 logs/`, Date.now() - started);
      return;
    }

    if (urlPath === '/api/logs/health' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(JSON.stringify({ ok: true, uptimeSec: Math.round((Date.now() - START) / 1000), sessions: CLIENT_SESSIONS.size, logDir: 'logs/' }));
      await writeServerResponse(req, traceId, 200, '健康检查通过', Date.now() - started);
      return;
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      await writeRejected(req, traceId, 'HTTP 方法', `${req.method} 不允许`, 405, '请求未处理');
      res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Method Not Allowed');
      await writeServerResponse(req, traceId, 405, '方法不允许', Date.now() - started);
      return;
    }

    let target = safePath(req.url === '/' ? '/index.html' : req.url);
    if (!target) {
      await writeRejected(req, traceId, '路径校验', '疑似路径穿越', 403, '文件未返回');
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Forbidden');
      await writeServerResponse(req, traceId, 403, '拒绝访问', Date.now() - started);
      return;
    }

    let info;
    try {
      info = await stat(target);
    } catch (error) {
      await writeRejected(req, traceId, '静态资源查找', `文件不存在: ${urlPath}`, 404, '页面资源未返回');
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
      await writeServerResponse(req, traceId, 404, '文件不存在', Date.now() - started);
      return;
    }
    if (info.isDirectory()) target = path.join(target, 'index.html');

    let content;
    try {
      content = await readFile(target);
    } catch (error) {
      await writeRejected(req, traceId, '静态资源读取', `读取失败: ${error.message}`, 500, '页面资源未返回');
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Internal Server Error');
      await writeServerResponse(req, traceId, 500, '读取文件失败', Date.now() - started);
      return;
    }

    const ext = path.extname(target).toLowerCase();
    const type = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': type,
      // 开发服务器：所有文件不缓存，便于视觉迭代和审计排查。
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Content-Type-Options': 'nosniff'
    });
    if (req.method === 'HEAD') res.end();
    else res.end(content);
    await writeServerResponse(req, traceId, 200, `静态文件 ${path.relative(ROOT, target)} (${content.length} bytes)`, Date.now() - started);
  } catch (error) {
    await log(`error-${dateStamp()}.log`, `[异常] traceId=${traceId} 发生阶段=HTTP请求处理 异常类型=${error.name} 原因=${error.message} 业务影响=本次请求未完成 是否已处理=是（返回500）`);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Internal Server Error');
    }
    await writeServerResponse(req, traceId, 500, `服务端异常: ${error.message}`, Date.now() - started);
  }
});

await ensureLogDir();
server.listen(PORT, HOST, () => {
  const startedAt = new Date().toISOString();
  process.stdout.write(`ORPHEUS-9 本地实验终端已启动\n`);
  process.stdout.write(`  游戏: http://${HOST}:${PORT}/\n`);
  process.stdout.write(`  日志: ${LOG_DIR}\n`);
  process.stdout.write(`  审计接口: POST http://${HOST}:${PORT}/api/logs/report\n`);
  process.stdout.write(`  启动时间: ${startedAt}\n`);
  log(`server-dev-${dateStamp()}.log`, `[服务启动] 时间=${startedAt} 地址=http://${HOST}:${PORT}/ 日志目录=${LOG_DIR}`).catch(() => {});
});

process.on('SIGINT', () => {
  process.stdout.write('\n终端关闭。日志已保存。\n');
  server.close(() => process.exit(0));
});
