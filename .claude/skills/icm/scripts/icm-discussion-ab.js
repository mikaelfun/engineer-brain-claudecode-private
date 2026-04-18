#!/usr/bin/env node
/**
 * icm-discussion-ab.js — ICM Discussion Fetcher (agent-browser 模式)
 *
 * 首选执行入口。不依赖 playwright-core，无进程残留，天然支持并发。
 *
 * 用法:
 *   node icm-discussion-ab.js --single <incidentId> --case-dir <dir>
 *   node icm-discussion-ab.js --token-only             # 只刷新 token
 *
 * Token 获取链路（三级 fallback）:
 *   1. 缓存 token（$TEMP/icm-ab-token-cache.json，170min 有效）→ 验证 → 直接用
 *   2. agent-browser (Edge headless, session=icm-discussion) → CDP 拦截 → 提取新 token
 *   3. Playwright daemon --token-only（最终回落）
 *
 * 依赖: npm i -g agent-browser ws
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');

// --- 参数解析 ---
const args = process.argv.slice(2);
const tokenOnlyMode = args.includes('--token-only');
const incidentId = tokenOnlyMode ? null : args[args.indexOf('--single') + 1];
const caseDirIdx = args.indexOf('--case-dir');
const caseDir = caseDirIdx !== -1 ? args[caseDirIdx + 1] : null;
// Casework v2: optional output dir — when provided, writes
// {outputDir}/icm.json with active/completed/failed status + delta.newEntries.
// Backward compatible: absent → legacy stdout-only behavior.
const outputDirIdx = args.indexOf('--output-dir');
const outputDir = outputDirIdx !== -1 ? args[outputDirIdx + 1] : null;
if (!tokenOnlyMode && (!incidentId || !caseDir)) {
  console.error('Usage: node icm-discussion-ab.js --single <incidentId> --case-dir <dir> [--output-dir <dir>]');
  console.error('       node icm-discussion-ab.js --token-only');
  process.exit(1);
}

const API_BASE = 'https://prod.microsofticm.com/api2/incidentapi';
const TOKEN_CACHE = path.join(process.env.TEMP || '/tmp', 'icm-ab-token-cache.json');
const EDGE_EXE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
// 固定一个 incident ID 用于 token 获取时的页面导航（不会真正读数据）
const TOKEN_PROBE_ID = '51000000969736';

function log(msg) {
  console.log(`[${new Date().toISOString().replace('T',' ').slice(0,19)}] ${msg}`);
}

// --- Event emission (Casework v2 Task 5.3) ---
// Atomic write: tmp + rename, so Dashboard file-watcher never sees half-written JSON.
// All failures silently ignored — event layer must never break the real fetch.
const eventStartTs = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
const eventStartMs = Date.now();
function writeIcmEvent(payload) {
  if (!outputDir) return;
  try {
    fs.mkdirSync(outputDir, { recursive: true });
    const final = path.join(outputDir, 'icm.json');
    const tmp = `${final}.tmp.${process.pid}.${Math.floor(Math.random() * 1e9)}`;
    fs.writeFileSync(tmp, JSON.stringify({ task: 'icm', ...payload }), 'utf-8');
    fs.renameSync(tmp, final);
  } catch (_) { /* best effort */ }
}

// Compute newEntries by diffing against previous raw JSON (ICM entries are
// append-only + immutable by date, so length delta is reliable).
function computeNewEntries(newCount, outPath) {
  try {
    if (!fs.existsSync(outPath)) return newCount;  // first run = all new
    const prev = JSON.parse(fs.readFileSync(outPath, 'utf-8'));
    const prevCount = prev?.discussions?.Items?.length || 0;
    return Math.max(0, newCount - prevCount);
  } catch (_) {
    return newCount;  // unreadable prev → treat as first run
  }
}

// --- agent-browser 命令执行 ---
function ab(cmd, timeout = 30000) {
  try {
    return execSync(`agent-browser ${cmd}`, { encoding: 'utf-8', timeout, stdio: ['pipe','pipe','pipe'] }).trim();
  } catch(e) {
    return e.stdout?.trim() || '';
  }
}

// --- HTTPS JSON 请求 ---
function fetchJson(url, token) {
  return new Promise((resolve) => {
    const u = new URL(url);
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname + u.search,
      headers: { 'Authorization': token, 'Accept': 'application/json' }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, data: null }); }
      });
    });
    req.on('error', () => resolve({ status: 0, data: null }));
    req.setTimeout(15000, () => { req.destroy(); resolve({ status: 0, data: null }); });
    req.end();
  });
}

// --- Token 缓存 ---
function getCachedToken() {
  if (!fs.existsSync(TOKEN_CACHE)) return null;
  try {
    const cache = JSON.parse(fs.readFileSync(TOKEN_CACHE, 'utf-8'));
    const ageMin = (Date.now()/1000 - cache.timestamp) / 60;
    if (ageMin < 170 && cache.token?.length > 100) return cache.token;
  } catch {}
  return null;
}

function saveToken(token) {
  fs.writeFileSync(TOKEN_CACHE, JSON.stringify({ token, timestamp: Date.now()/1000 }));
}

// --- 验证 token 有效性（轻量 HEAD-like 请求）---
async function validateToken(token) {
  const url = `${API_BASE}/incidents/${TOKEN_PROBE_ID}/getdescriptionentries?$top=1&$skip=0`;
  const r = await fetchJson(url, token);
  return r.status === 200;
}

// --- SSO 流程（agent-browser）---
function doSSO(targetUrl) {
  log('agent-browser SSO starting...');
  ab('close --all', 5000);

  const openResult = ab(`--executable-path "${EDGE_EXE}" --session-name icm-discussion open "${targetUrl}"`, 35000);
  log(`Open: ${openResult.split('\n')[0] || '(no output)'}`);

  // 等页面初始加载
  ab('wait 4000', 8000);

  let url = ab('get url', 5000);

  // Step 1: Identity Provider Selection
  if (url.includes('IdentityProvider')) {
    log('SSO: Identity Provider page...');
    const snap = ab('snapshot -i', 10000);
    const m = snap.match(/link "Sign in" \[ref=(e\d+)\]/);
    if (m) ab(`click @${m[1]}`, 8000);
    ab('wait 4000', 8000);
    url = ab('get url', 5000);
  }

  // Step 2: Pick account
  if (url.includes('login.microsoftonline')) {
    log('SSO: Pick account page...');
    const snap = ab('snapshot -i', 10000);
    const m = snap.match(/button "Sign in with [^"]*@microsoft\.com[^"]*" \[ref=(e\d+)\]/);
    if (m) {
      ab(`click @${m[1]}`, 8000);
    } else {
      ab('find text "@microsoft.com" click', 8000);
    }
    // 等 SSO redirect 完成
    for (let i = 0; i < 25; i++) {
      ab('wait 1000', 3000);
      url = ab('get url', 5000);
      if (url.includes('/incidents/') || url.includes('microsofticm.com/imp')) break;
    }
  }

  return url.includes('microsofticm.com') && !url.includes('login') && !url.includes('IdentityProvider');
}

// --- 通过 CDP 拦截 requestWillBeSent 拿 Bearer Token ---
async function extractTokenViaCDP() {
  const cdpUrl = ab('get cdp-url', 5000);
  const portMatch = cdpUrl.match(/127\.0\.0\.1:(\d+)/);
  if (!portMatch) { log('Cannot get CDP port'); return null; }
  const port = portMatch[1];

  let WebSocket;
  try {
    WebSocket = require(path.join(process.env.APPDATA, 'npm', 'node_modules', 'ws'));
  } catch {
    try { WebSocket = require('ws'); } catch {
      log('ERROR: ws module not found. Run: npm i -g ws');
      return null;
    }
  }

  // 获取 page target
  const targets = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('CDP targets timeout')), 5000);
    http.get(`http://127.0.0.1:${port}/json`, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { clearTimeout(timer); resolve(JSON.parse(d)); });
    }).on('error', e => { clearTimeout(timer); reject(e); });
  });
  const page = targets.find(t => t.type === 'page' && t.url.includes('microsofticm'));
  if (!page) { log('No ICM page target in CDP'); return null; }

  const ws = new WebSocket(page.webSocketDebuggerUrl, { maxPayload: 10*1024*1024 });
  await new Promise((r, j) => { ws.on('open', r); ws.on('error', j); });

  let msgId = 0;
  const send = (method, params) => ws.send(JSON.stringify({ id: ++msgId, method, params }));

  // Enable network + disable cache
  send('Network.setCacheDisabled', { cacheDisabled: true });
  send('Network.enable');
  // 等上面两个 ack
  await new Promise(r => setTimeout(r, 500));

  // Reload 触发 API 请求
  send('Page.reload', { ignoreCache: true });

  // 监听 requestWillBeSent
  const token = await new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), 20000);
    ws.on('message', raw => {
      const msg = JSON.parse(raw);
      if (msg.method === 'Network.requestWillBeSent') {
        const reqUrl = msg.params?.request?.url || '';
        if (reqUrl.includes('getdescriptionentries') || reqUrl.includes('GetIncidentDetails')) {
          const auth = msg.params.request.headers?.Authorization;
          if (auth?.length > 100) { clearTimeout(timer); resolve(auth); }
        }
      }
    });
  });

  ws.close();
  return token;
}

// --- Token 获取主逻辑（三级 fallback）---
async function acquireToken() {
  // Level 1: 缓存
  const cached = getCachedToken();
  if (cached) {
    log(`Cached token found (validating...)`);
    if (await validateToken(cached)) {
      log('Cached token valid');
      return cached;
    }
    log('Cached token expired, refreshing...');
    try { fs.unlinkSync(TOKEN_CACHE); } catch {}
  }

  // Level 2: agent-browser SSO → CDP 拦截
  const icmUrl = `https://portal.microsofticm.com/imp/v5/incidents/details/${TOKEN_PROBE_ID}/summary`;
  const ssoOk = doSSO(icmUrl);

  if (ssoOk) {
    log('SSO OK, extracting token via CDP...');
    const token = await extractTokenViaCDP();
    ab('close', 5000);
    if (token) {
      log(`Token extracted (${token.length} chars)`);
      saveToken(token);
      return token;
    }
    log('CDP extraction failed');
  } else {
    ab('close', 5000);
    log('agent-browser SSO failed');
  }

  // Level 3: Playwright daemon --token-only（最终回落）
  log('Falling back to Playwright daemon --token-only...');
  try {
    const daemonPath = path.join(__dirname, 'icm-discussion-daemon.js');
    const out = execSync(`node "${daemonPath}" --token-only`, { encoding: 'utf-8', timeout: 45000 });
    if (out.includes('TOKEN_OK')) {
      const token = getCachedToken();
      if (token) { log('Token via Playwright daemon fallback'); return token; }
    }
  } catch(e) {
    log(`Playwright fallback failed: ${e.message.split('\n')[0]}`);
  }

  return null;
}

// --- 主流程 ---
async function main() {
  const start = Date.now();

  // --token-only 模式
  if (tokenOnlyMode) {
    log('TOKEN-ONLY mode');
    const token = await acquireToken();
    if (token) {
      console.log(`TOKEN_OK|${token.length}`);
    } else {
      console.log('TOKEN_FAIL');
      process.exit(1);
    }
    return;
  }

  log(`SINGLE mode: incident=${incidentId} caseDir=${caseDir}`);
  writeIcmEvent({ status: 'active', startedAt: eventStartTs });

  // 1. 获取 token
  const token = await acquireToken();
  if (!token) {
    writeIcmEvent({
      status: 'failed',
      startedAt: eventStartTs,
      durationMs: Date.now() - eventStartMs,
      error: 'no token'
    });
    console.log(`ICM_FAIL|${incidentId}|no token`);
    process.exit(1);
  }

  // 2. 并行调两个 API
  const discUrl = `${API_BASE}/incidents/${incidentId}/getdescriptionentries?$top=100&$skip=0`;
  const detUrl = `${API_BASE}/incidents(${incidentId})/GetIncidentDetails?$expand=Attachments,CustomFields,AccessRestrictedToClaims`;
  log('Calling ICM API...');
  const [disc, det] = await Promise.all([fetchJson(discUrl, token), fetchJson(detUrl, token)]);

  if (!disc.data?.Items?.length) {
    writeIcmEvent({
      status: 'failed',
      startedAt: eventStartTs,
      durationMs: Date.now() - eventStartMs,
      error: `0 entries (HTTP ${disc.status})`
    });
    console.log(`ICM_FAIL|${incidentId}|0 entries (HTTP ${disc.status})`);
    process.exit(1);
  }

  // 3. 写入 case 目录
  const icmDir = path.join(caseDir, 'icm');
  fs.mkdirSync(icmDir, { recursive: true });
  const outPath = path.join(icmDir, '_icm-portal-raw.json');
  // Compute delta BEFORE overwriting outPath (diff vs previous entry count).
  const count = disc.data.Items.length;
  const newEntries = computeNewEntries(count, outPath);
  const result = {
    _version: 1,
    _fetchedAt: new Date().toISOString(),
    _source: 'agent-browser-curl',
    incidentId,
    details: det.data || null,
    discussions: disc.data
  };
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf-8');

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  const completedAt = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
  writeIcmEvent({
    status: 'completed',
    startedAt: eventStartTs,
    completedAt,
    durationMs: Date.now() - eventStartMs,
    delta: { newEntries }
  });
  log(`DONE: ${incidentId} → ${outPath} (${count} entries, ${elapsed}s)`);
  console.log(`ICM_OK|${incidentId}|entries=${count}|${elapsed}s|source=agent-browser`);
}

main().catch(e => {
  writeIcmEvent({
    status: 'failed',
    startedAt: eventStartTs,
    durationMs: Date.now() - eventStartMs,
    error: e.message || 'fatal'
  });
  console.error('FATAL:', e.message);
  process.exit(1);
});
