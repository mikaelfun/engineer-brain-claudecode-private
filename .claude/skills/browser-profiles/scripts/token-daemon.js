#!/usr/bin/env node
/**
 * token-daemon.js — Token Daemon 主进程
 *
 * 单个长驻 Edge 实例，多 tab 共享 SSO session，统一管理 token 预热。
 *
 * 命令:
 *   node token-daemon.js start     # 启动 daemon（前台运行，Ctrl+C 停止）
 *   node token-daemon.js stop      # 停止 daemon（发 SIGTERM 给 PID 文件里的进程）
 *   node token-daemon.js ensure    # 确保 daemon 存活（不存在则启动）
 *   node token-daemon.js warmup    # ensure + 刷新过期 token
 *   node token-daemon.js status    # 输出 daemon 状态 + 各 token 倒计时
 *
 * 配置: ../registry.json
 * Profile: $TEMP/pw-token-daemon-profile
 */

const path = require('path');
const fs = require('fs');
const http = require('http');
const { execSync, spawn } = require('child_process');

const SCRIPT_DIR = __dirname;
const REGISTRY_PATH = path.join(SCRIPT_DIR, '..', 'registry.json');

// ── Platform detection ──
const _isWSL = (() => {
  try { return fs.readFileSync('/proc/version', 'utf-8').toLowerCase().includes('microsoft'); } catch { return false; }
})();

// ── Lazy-load heavy deps (ISS-perf) ──
// playwright-core takes ~5-8s to require on Windows.
// warmup/status commands don't need it when daemon is alive,
// so defer loading until actually needed (inlineWarmup, start).
let _pw = null;
function getPW() {
  if (!_pw) {
    if (_isWSL) {
      try { _pw = require('playwright-core'); } catch {
        _pw = require('/usr/lib/node_modules/playwright-core');
      }
    } else {
      _pw = require(path.join(process.env.APPDATA, 'npm', 'node_modules', '@playwright', 'cli', 'node_modules', 'playwright-core'));
    }
  }
  return _pw;
}

// Also lazy-load SSO/extract helpers (they may import playwright internally)
let _handleSSO = null;
let _extractToken = null;
function getHandleSSO() { if (!_handleSSO) _handleSSO = require('./sso-handler').handleSSO; return _handleSSO; }
function getExtractToken() { if (!_extractToken) _extractToken = require('./extract-token').extractToken; return _extractToken; }

// ── 配置 ──
const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
const TEMP = process.env.TEMP || '/tmp';
const PROFILE = path.join(TEMP, 'pw-token-daemon-profile');
const PID_FILE = path.join(TEMP, 'pw-token-daemon.pid');
const HEARTBEAT_FILE = path.join(TEMP, 'pw-token-daemon-heartbeat.json');
const PORT_FILE = path.join(TEMP, 'pw-token-daemon-port.json');
const HEARTBEAT_INTERVAL_MS = 30000;
const HEARTBEAT_STALE_MS = 60000;
const LOG_FILE = path.join(TEMP, 'pw-token-daemon.log');
const LOG_MAX_BYTES = 2 * 1024 * 1024; // 2MB — rotate when exceeded
const WARMUP_LOCK_FILE = path.join(TEMP, 'pw-token-daemon-warmup.lock');
const WARMUP_LOCK_STALE_MS = 180000; // 3min — auto-release stale lock

function log(msg) {
  const ts = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const line = `[${ts}] ${msg}\n`;
  console.error(line.trimEnd());
  // Append to log file (fire-and-forget)
  try {
    // Simple rotation: truncate if too large
    try {
      const stat = fs.statSync(LOG_FILE);
      if (stat.size > LOG_MAX_BYTES) {
        const old = LOG_FILE + '.old';
        try { fs.unlinkSync(old); } catch {}
        fs.renameSync(LOG_FILE, old);
      }
    } catch {}
    fs.appendFileSync(LOG_FILE, line);
  } catch {}
}

// ── Warmup Mutex (cross-process) ──
function acquireWarmupLock() {
  try {
    if (fs.existsSync(WARMUP_LOCK_FILE)) {
      const stat = fs.statSync(WARMUP_LOCK_FILE);
      const age = Date.now() - stat.mtimeMs;
      if (age < WARMUP_LOCK_STALE_MS) {
        const holder = fs.readFileSync(WARMUP_LOCK_FILE, 'utf-8').trim();
        log(`Warmup lock held by PID ${holder} (${Math.round(age/1000)}s ago), skipping`);
        return false;
      }
      log(`Warmup lock stale (${Math.round(age/1000)}s), stealing`);
    }
    fs.writeFileSync(WARMUP_LOCK_FILE, String(process.pid));
    return true;
  } catch { return false; }
}

function releaseWarmupLock() {
  try { fs.unlinkSync(WARMUP_LOCK_FILE); } catch {}
}

// ── Kill orphan Edge processes using daemon profile ──
function killOrphanEdge() {
  try {
    const { spawnSync } = require('child_process');
    const psCmd = 'Get-CimInstance Win32_Process -Filter "CommandLine LIKE \'%pw-token-daemon-profile%\' AND Name=\'msedge.exe\'" -ErrorAction SilentlyContinue | ForEach-Object { $_.ProcessId }';
    const r = spawnSync('powershell.exe', ['-NoProfile', '-Command', psCmd], { encoding: 'utf-8', timeout: 10000 });
    const pids = (r.stdout || '').split('\n').map(l => l.trim()).filter(p => /^\d+$/.test(p));
    for (const p of pids) {
      try {
        spawnSync('taskkill.exe', ['/PID', p, '/F'], { encoding: 'utf-8', timeout: 5000, stdio: ['pipe','pipe','pipe'] });
        log(`killed orphan Edge PID ${p}`);
      } catch {}
    }
    if (pids.length > 0) {
      try { execSync('sleep 1', { timeout: 3000 }); } catch {}
    }
  } catch (e) {
    log(`killOrphanEdge error (non-fatal): ${e.message}`);
  }
}

// ── Lock Cleanup ──
function cleanStaleLocks() {
  for (const f of ['SingletonLock', 'SingletonSocket', 'SingletonCookie']) {
    const p = path.join(PROFILE, f);
    try { if (fs.existsSync(p)) { fs.unlinkSync(p); log(`cleaned ${f}`); } } catch {}
  }
  const defaultLock = path.join(PROFILE, 'Default', 'lock');
  try { if (fs.existsSync(defaultLock)) { fs.unlinkSync(defaultLock); } } catch {}
}

// ── WSL → Windows Edge CDP bridge ──
let _cdpEdgePid = null;

function readProjectConfig() {
  const configPath = path.join(SCRIPT_DIR, '..', '..', '..', '..', 'config.json');
  try { return JSON.parse(fs.readFileSync(configPath, 'utf-8')); } catch { return {}; }
}

function wslToWinPath(p) {
  // /mnt/c/Users/... → C:\Users\...
  const m = p.match(/^\/mnt\/([a-z])\/(.*)/);
  if (m) return `${m[1].toUpperCase()}:\\${m[2].replace(/\//g, '\\')}`;
  return p;
}

async function launchEdgeViaCDP() {
  const { spawnSync } = require('child_process');
  const cfg = readProjectConfig().platform || {};
  const cdpPort = cfg.cdpPort || 9222;
  const profileDir = cfg.edgeProfileDir || path.join(TEMP, 'pw-token-daemon-profile');
  const winProfileDir = wslToWinPath(profileDir);

  log(`CDP mode: launching Windows Edge on port ${cdpPort}, profile=${winProfileDir}`);

  // Kill any existing Edge on this CDP port
  try {
    spawnSync('powershell.exe', ['-NoProfile', '-Command',
      `Get-CimInstance Win32_Process -Filter "CommandLine LIKE '%--remote-debugging-port=${cdpPort}%' AND Name='msedge.exe'" -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -EA SilentlyContinue }`
    ], { encoding: 'utf-8', timeout: 10000 });
  } catch {}

  // Launch Edge via Windows interop
  const edgeArgs = `--remote-debugging-port=${cdpPort} --user-data-dir="${winProfileDir}" --headless=new --no-first-run --disable-gpu`;
  try {
    spawnSync('powershell.exe', ['-NoProfile', '-Command',
      `Start-Process 'msedge' -ArgumentList '${edgeArgs}'`
    ], { encoding: 'utf-8', timeout: 15000 });
  } catch (e) {
    throw new Error(`Failed to launch Edge: ${e.message}`);
  }

  // Wait for CDP endpoint
  const cdpUrl = `http://127.0.0.1:${cdpPort}`;
  let ready = false;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`${cdpUrl}/json/version`);
      if (res.ok) { ready = true; break; }
    } catch {}
    await new Promise(r => setTimeout(r, 500));
  }
  if (!ready) throw new Error(`CDP endpoint not ready after 15s on port ${cdpPort}`);

  // Record Edge PID for cleanup
  try {
    const pidR = spawnSync('powershell.exe', ['-NoProfile', '-Command',
      `Get-CimInstance Win32_Process -Filter "CommandLine LIKE '%--remote-debugging-port=${cdpPort}%' AND Name='msedge.exe'" | Select-Object -First 1 -ExpandProperty ProcessId`
    ], { encoding: 'utf-8', timeout: 5000 });
    _cdpEdgePid = parseInt((pidR.stdout || '').trim(), 10) || null;
  } catch {}
  log(`Edge launched (CDP port=${cdpPort}, PID=${_cdpEdgePid})`);

  const browser = await getPW().chromium.connectOverCDP(cdpUrl);
  const contexts = browser.contexts();
  return contexts[0] || await browser.newContext();
}

function killCdpEdge() {
  if (!_cdpEdgePid) return;
  try {
    execSync(`taskkill.exe /PID ${_cdpEdgePid} /F /T`, { encoding: 'utf-8', timeout: 5000 });
    log(`killed CDP Edge PID ${_cdpEdgePid}`);
  } catch {}
  _cdpEdgePid = null;
}

// ── Cache 读写 ──
function resolveEnvPath(p) {
  return p.replace('$TEMP', TEMP);
}

function readCache(cacheFile) {
  const p = resolveEnvPath(cacheFile);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf-8'));
  } catch { return null; }
}

function writeCache(cacheFile, data) {
  const p = resolveEnvPath(cacheFile);
  const dir = path.dirname(p);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
}

/**
 * Decode JWT exp claim from a Bearer token (no verification, just base64 decode).
 * Returns epoch seconds or null if not a valid JWT.
 */
function getJwtExp(tokenStr) {
  try {
    const raw = (tokenStr || '').replace(/^Bearer\s+/i, '');
    const parts = raw.split('.');
    if (parts.length !== 3) return null;
    let payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (payload.length % 4) payload += '=';
    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf-8'));
    return decoded.exp || null;
  } catch { return null; }
}

function isCacheValid(cacheFile, ttlMinutes) {
  if (!cacheFile) return false; // session tab: no cache, always "needs processing"
  const cache = readCache(cacheFile);
  if (!cache) return false;

  // Priority 1: JWT exp claim (most accurate for request-intercept tokens).
  // The token may have been intercepted long after issuance; cache.timestamp
  // only records when WE cached it, not when the IdP issued it. JWT exp is
  // the ground truth.
  const jwtExp = getJwtExp(cache.token);
  if (jwtExp) {
    return (Date.now() / 1000) < (jwtExp - 300); // 5min buffer
  }

  // Priority 2: localStorage 方式: expiresOn 字段
  if (cache.expiresOn) {
    const expires = parseInt(cache.expiresOn, 10);
    return (Date.now() / 1000) < (expires - 300); // 5min 余量
  }

  // Priority 3: request-intercept 方式: timestamp 字段（预留 5 分钟余量）
  if (cache.timestamp) {
    const ageMin = (Date.now() / 1000 - cache.timestamp) / 60;
    return ageMin < (ttlMinutes - 5);
  }

  // fetchedAt fallback（预留 5 分钟余量）
  if (cache.fetchedAt) {
    const fetched = new Date(cache.fetchedAt).getTime();
    return (Date.now() - fetched) < (ttlMinutes - 5) * 60 * 1000;
  }

  return false;
}

function getCacheRemainMin(cacheFile, ttlMinutes) {
  if (!cacheFile) return -1; // session tab
  const cache = readCache(cacheFile);
  if (!cache) return -1;

  // Priority 1: JWT exp (ground truth)
  const jwtExp = getJwtExp(cache.token);
  if (jwtExp) {
    return Math.round((jwtExp - Date.now() / 1000) / 60);
  }

  if (cache.expiresOn) {
    const expires = parseInt(cache.expiresOn, 10);
    return Math.round((expires - Date.now() / 1000) / 60);
  }
  if (cache.timestamp) {
    const ageMin = (Date.now() / 1000 - cache.timestamp) / 60;
    return Math.round(ttlMinutes - ageMin);
  }
  return -1;
}

// ── PID 管理 ──
function writePid() {
  fs.writeFileSync(PID_FILE, String(process.pid));
}

function readPid() {
  if (!fs.existsSync(PID_FILE)) return null;
  try { return parseInt(fs.readFileSync(PID_FILE, 'utf-8').trim(), 10); } catch { return null; }
}

function isProcessAlive(pid) {
  if (!pid) return false;
  try {
    const cmd = _isWSL ? 'tasklist.exe' : 'tasklist';
    const out = execSync(`${cmd} /FI "PID eq ${pid}" /NH`, { encoding: 'utf-8', timeout: 5000, stdio: ['pipe','pipe','pipe'] });
    return out.includes(String(pid));
  } catch { return false; }
}

function isHeartbeatFresh() {
  if (!fs.existsSync(HEARTBEAT_FILE)) return false;
  try {
    const hb = JSON.parse(fs.readFileSync(HEARTBEAT_FILE, 'utf-8'));
    const age = Date.now() - new Date(hb.lastHeartbeat).getTime();
    return age < HEARTBEAT_STALE_MS;
  } catch { return false; }
}

// ── 心跳 ──
function writeHeartbeat(tabs) {
  const data = {
    pid: process.pid,
    startedAt: new Date().toISOString(),
    lastHeartbeat: new Date().toISOString(),
    tabs: {}
  };
  for (const [name, config] of Object.entries(registry.tokens)) {
    if (config.tokenSource === 'none') {
      // Session tab: check if page is still on the target domain
      const tabEntry = tabs[name];
      let sessionOk = true;
      if (tabEntry && tabEntry.page) {
        try {
          const url = tabEntry.page.url();
          sessionOk = url.includes(config.tab) && !url.includes('login');
        } catch { sessionOk = false; }
      }
      data.tabs[name] = { status: sessionOk ? 'session' : 'expired', remainMin: null };
      continue;
    }
    const remain = getCacheRemainMin(config.cacheFile, config.cacheTTLMinutes);
    data.tabs[name] = {
      status: remain > 0 ? 'ok' : 'expired',
      remainMin: remain
    };
  }
  fs.writeFileSync(HEARTBEAT_FILE, JSON.stringify(data, null, 2));
}

// ── DTM startUrl 特殊处理 ──
const DTM_WSID_CACHE = path.join(TEMP, 'd365-case-ops-runtime', 'dtm-workspace-id.json');

function cachedWorkspaceId() {
  if (!fs.existsSync(DTM_WSID_CACHE)) return null;
  try {
    const d = JSON.parse(fs.readFileSync(DTM_WSID_CACHE, 'utf-8'));
    if (d.workspaceId) return d.workspaceId;
  } catch {}
  return null;
}

function saveWorkspaceId(wsId, source) {
  const dir = path.dirname(DTM_WSID_CACHE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DTM_WSID_CACHE, JSON.stringify({
    workspaceId: wsId,
    source,
    cachedAt: new Date().toISOString()
  }));
}

/**
 * 用 daemon 自己的浏览器打开 D365 → OData 查 workspace ID。
 * 利用 daemon 浏览器已有的 SSO session，无需外部 playwright-cli 实例。
 * @param {import('playwright-core').BrowserContext} ctx - daemon 的 browser context
 * @returns {Promise<string|null>} workspace ID 或 null
 */
async function fetchWorkspaceIdViaBrowser(ctx) {
  let page;
  try {
    page = await ctx.newPage();
    const D365_URL = 'https://onesupport.crm.dynamics.com/main.aspx?forceUCI=1&appid=101acb62-8d00-eb11-a813-000d3a8b3117';

    log('[dtm-resolve] Opening D365 via daemon browser for workspace ID...');
    await page.goto(D365_URL, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});

    // SSO 自愈循环（最多 40s）
    let onD365 = false;
    for (let i = 0; i < 40 && !onD365; i++) {
      await page.waitForTimeout(1000);
      const url = page.url();
      if (url.includes('login.microsoftonline') || url.includes('login.live')) {
        await getHandleSSO()(page, {
          targetDomain: 'dynamics.com',
          log: (msg) => log(`[dtm-resolve] ${msg}`)
        });
        continue;
      }
      if (url.includes('dynamics.com') && !url.includes('login') && !url.includes('#code=') && !url.includes('authorize')) {
        await page.waitForTimeout(3000); // 等 D365 框架加载
        onD365 = true;
      }
    }

    if (!onD365) {
      log('[dtm-resolve] WARN: could not reach D365 within 40s');
      return null;
    }

    // OData 查 DTM attachment metadata → 提取 workspaceId
    const wsId = await page.evaluate(async () => {
      try {
        const resp = await fetch(
          '/api/data/v9.0/msdfm_dtmattachmentmetadatas?$select=msdfm_dtmlocationurl&$top=1&$filter=msdfm_dtmlocationurl ne null&$orderby=createdon desc',
          { headers: { 'Accept': 'application/json', 'OData-MaxVersion': '4.0', 'OData-Version': '4.0' } }
        );
        if (!resp.ok) return null;
        const data = await resp.json();
        if (data.value && data.value[0] && data.value[0].msdfm_dtmlocationurl) {
          const m = data.value[0].msdfm_dtmlocationurl.match(/workspaceid=([a-f0-9-]+)/i);
          return m ? m[1] : null;
        }
        return null;
      } catch { return null; }
    });

    if (wsId) {
      log(`[dtm-resolve] Got workspace ID via D365 OData: ${wsId.substring(0, 8)}...`);
    } else {
      log('[dtm-resolve] WARN: D365 OData returned no workspace ID');
    }
    return wsId;
  } catch (e) {
    log(`[dtm-resolve] WARN: browser D365 query failed: ${e.message.substring(0, 80)}`);
    return null;
  } finally {
    if (page) await page.close().catch(() => {});
  }
}

/**
 * 解析 DTM startUrl（需要动态获取 workspaceId）
 * 获取链: 缓存 → 本地文件扫描 → daemon 浏览器 D365 OData → PowerShell fallback
 * @param {import('playwright-core').BrowserContext} [ctx] - daemon 的 browser context（async step 3 需要）
 * @returns {Promise<string|null>} DTM URL 或 null
 */
async function resolveDtmUrl(ctx) {
  // 1. 读 workspace ID 缓存（秒级）
  const cached = cachedWorkspaceId();
  if (cached) return `https://client.dtmnebula.microsoft.com/?workspaceid=${cached}`;

  // 2. 扫 active cases 的 attachments-meta.json（和 warm-dtm-token.ps1 一样）
  try {
    const configPath = path.join(SCRIPT_DIR, '..', '..', '..', '..', 'config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const casesRoot = path.resolve(path.join(SCRIPT_DIR, '..', '..', '..', '..'), config.casesRoot || '../data/cases');
    const activeDir = path.join(casesRoot, 'active');
    if (fs.existsSync(activeDir)) {
      for (const d of fs.readdirSync(activeDir)) {
        const metaFile = path.join(activeDir, d, 'attachments-meta.json');
        if (fs.existsSync(metaFile)) {
          const meta = JSON.parse(fs.readFileSync(metaFile, 'utf-8'));
          const attachments = meta.attachments || [];
          for (const a of attachments) {
            if (a.msdfm_dtmlocationurl) {
              const m = a.msdfm_dtmlocationurl.match(/workspaceid=([a-f0-9-]+)/i);
              if (m) {
                saveWorkspaceId(m[1], 'attachments-meta');
                return `https://client.dtmnebula.microsoft.com/?workspaceid=${m[1]}`;
              }
            }
          }
        }
      }
    }
  } catch {}

  // 3. 查找 daemon context 中已有的 D365 tab（registry 中 d365 排在 dtm 前面）
  if (ctx) {
    const d365Page = ctx.pages().find(p => p.url().includes('dynamics.com') && !p.url().includes('login'));
    if (d365Page) {
      try {
        log('[dtm-resolve] Using existing D365 tab for workspace ID query...');
        const wsId = await d365Page.evaluate(async () => {
          try {
            const resp = await fetch(
              '/api/data/v9.0/msdfm_dtmattachmentmetadatas?$select=msdfm_dtmlocationurl&$top=1&$filter=msdfm_dtmlocationurl ne null&$orderby=createdon desc',
              { headers: { 'Accept': 'application/json', 'OData-MaxVersion': '4.0', 'OData-Version': '4.0' } }
            );
            if (!resp.ok) return null;
            const data = await resp.json();
            if (data.value && data.value[0] && data.value[0].msdfm_dtmlocationurl) {
              const m = data.value[0].msdfm_dtmlocationurl.match(/workspaceid=([a-f0-9-]+)/i);
              return m ? m[1] : null;
            }
            return null;
          } catch { return null; }
        });
        if (wsId && wsId.match(/^[a-f0-9-]+$/i)) {
          log(`[dtm-resolve] Got workspace ID via D365 tab: ${wsId.substring(0, 8)}...`);
          saveWorkspaceId(wsId, 'daemon-d365-tab');
          return `https://client.dtmnebula.microsoft.com/?workspaceid=${wsId}`;
        }
      } catch (e) {
        log(`[dtm-resolve] D365 tab query failed: ${e.message.substring(0, 60)}`);
      }
    }
  }

  // 4. Fallback: 临时开 D365 页面获取（D365 tab 不存在时）
  if (ctx) {
    try {
      const wsId = await fetchWorkspaceIdViaBrowser(ctx);
      if (wsId && wsId.match(/^[a-f0-9-]+$/i)) {
        saveWorkspaceId(wsId, 'daemon-d365-odata');
        return `https://client.dtmnebula.microsoft.com/?workspaceid=${wsId}`;
      }
    } catch (e) {
      log(`WARN: daemon browser D365 query failed: ${e.message.substring(0, 60)}`);
    }
  }

  // 4. PowerShell fallback（调 Invoke-D365Api — 需要外部 playwright-cli D365 实例）
  try {
    const wsId = execSync(
      `pwsh -NoProfile -c ". .claude/skills/d365-case-ops/scripts/_init.ps1; $r = Invoke-D365Api -Endpoint '/api/data/v9.0/msdfm_dtmattachmentmetadatas?\\$select=msdfm_dtmlocationurl&\\$top=1&\\$filter=msdfm_dtmlocationurl ne null&\\$orderby=createdon desc'; if ($r.value[0].msdfm_dtmlocationurl -match 'workspaceid=([a-f0-9-]+)') { $Matches[1] }"`,
      { encoding: 'utf-8', timeout: 30000 }
    ).trim();
    if (wsId && wsId.match(/^[a-f0-9-]+$/i)) {
      saveWorkspaceId(wsId, 'd365-api');
      return `https://client.dtmnebula.microsoft.com/?workspaceid=${wsId}`;
    }
  } catch (e) {
    log(`WARN: PowerShell D365 API workspace query failed: ${e.message.substring(0, 60)}`);
  }

  // 5. Fallback — 跳过
  log('WARN: no DTM workspace ID found, skipping DTM token');
  return null;
}

// ═══════════════════════════════════════
// D365 OData HTTP Server
// ═══════════════════════════════════════

/**
 * 在 daemon 中启动 HTTP server，提供 D365 OData 代理。
 * PowerShell Invoke-D365Api 可以通过 HTTP 调用替代 playwright-cli run-code。
 *
 * Endpoints:
 *   POST /d365/odata       — 单个 OData 调用 { method, endpoint, body?, fetchXml? }
 *   POST /d365/odata-batch — 批量 OData 调用 { requests: [{method, endpoint, body?, fetchXml?}] }
 *   GET  /d365/health      — D365 session 状态检查
 *
 * @param {Object} tabs - { name: { page, config } }
 * @returns {Promise<http.Server|null>}
 */
async function startD365HttpServer(tabs) {
  const d365Tab = tabs.d365;
  if (!d365Tab) {
    log('[http] No D365 tab registered, HTTP server skipped');
    return null;
  }

  /**
   * 在 D365 page 上执行单个 OData fetch
   */
  async function execOData(page, { method = 'GET', url, body }) {
    return page.evaluate(async (args) => {
      try {
        const headers = {
          'Accept': 'application/json',
          'OData-MaxVersion': '4.0',
          'OData-Version': '4.0',
          'Prefer': 'odata.include-annotations="*"'
        };
        const opts = { method: args.method, headers };
        if (args.method !== 'GET' && args.body) {
          headers['Content-Type'] = 'application/json';
          opts.body = args.body;
        }
        const resp = await fetch(args.url, opts);
        const status = resp.status;
        if (status === 204) {
          return { _status: status, _entityId: resp.headers.get('OData-EntityId') || '' };
        }
        if (status >= 400) {
          const errText = await resp.text().catch(() => '');
          return { _status: status, _error: errText.substring(0, 2000) };
        }
        const data = await resp.json();
        data._status = status;
        return data;
      } catch (e) {
        return { _status: 0, _error: e.message || String(e) };
      }
    }, { method, url, body: body || '' });
  }

  /**
   * 解析请求 body（JSON）
   */
  function parseBody(req) {
    return new Promise((resolve, reject) => {
      let data = '';
      req.on('data', chunk => { data += chunk; });
      req.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
      req.on('error', reject);
    });
  }

  /**
   * 构建 fetch URL（处理 fetchXml 参数）
   */
  function buildFetchUrl(endpoint, fetchXml) {
    if (!fetchXml) return endpoint;
    const sep = endpoint.includes('?') ? '&' : '?';
    return endpoint + sep + 'fetchXml=' + encodeURIComponent(fetchXml);
  }

  const server = http.createServer(async (req, res) => {
    // CORS headers (localhost only)
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost');

    try {
      const page = d365Tab.page;

      // ── GET /d365/health ──
      if (req.method === 'GET' && req.url === '/d365/health') {
        const url = page.url();
        const onD365 = url.includes('dynamics.com') && !url.includes('login');
        res.writeHead(200);
        res.end(JSON.stringify({ status: onD365 ? 'ok' : 'session-expired', url }));
        return;
      }

      // ── POST /d365/odata ──
      if (req.method === 'POST' && req.url === '/d365/odata') {
        const body = await parseBody(req);
        const url = buildFetchUrl(body.endpoint, body.fetchXml);
        const result = await execOData(page, {
          method: body.method || 'GET',
          url,
          body: body.body
        });

        if (result && result._status >= 400) {
          res.writeHead(200); // 返回 200，error 在 body 里（和原 Invoke-D365Api 行为一致）
        } else {
          res.writeHead(200);
        }
        res.end(JSON.stringify(result));
        return;
      }

      // ── POST /d365/odata-batch ──
      if (req.method === 'POST' && req.url === '/d365/odata-batch') {
        const body = await parseBody(req);
        const requests = body.requests || [];

        // 在浏览器里用 Promise.all 并行执行（和 Invoke-D365ApiBatch 一致）
        const results = await page.evaluate(async (reqs) => {
          const doFetch = async (r) => {
            try {
              const headers = {
                'Accept': 'application/json',
                'OData-MaxVersion': '4.0',
                'OData-Version': '4.0',
                'Prefer': 'odata.include-annotations="*"'
              };
              const opts = { method: r.method || 'GET', headers };
              if (r.method !== 'GET' && r.body) {
                headers['Content-Type'] = 'application/json';
                opts.body = r.body;
              }
              const resp = await fetch(r.url, opts);
              if (resp.status === 204) return { _status: 204 };
              if (resp.status >= 400) {
                const t = await resp.text().catch(() => '');
                return { _status: resp.status, _error: t.substring(0, 1000) };
              }
              const data = await resp.json();
              data._status = resp.status;
              return data;
            } catch (e) {
              return { _status: 0, _error: e.message || String(e) };
            }
          };
          return Promise.all(reqs.map(r => doFetch(r)));
        }, requests.map(r => ({
          method: r.method || 'GET',
          url: buildFetchUrl(r.endpoint, r.fetchXml),
          body: r.body || ''
        })));

        res.writeHead(200);
        res.end(JSON.stringify(results));
        return;
      }

      // ── 404 ──
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Not found', endpoints: ['/d365/odata', '/d365/odata-batch', '/d365/health'] }));

    } catch (e) {
      log(`[http] Error: ${e.message}`);
      res.writeHead(500);
      res.end(JSON.stringify({ error: e.message }));
    }
  });

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      fs.writeFileSync(PORT_FILE, JSON.stringify({ port, pid: process.pid, startedAt: new Date().toISOString() }));
      log(`[http] D365 OData server listening on 127.0.0.1:${port}`);
      resolve(server);
    });
    server.on('error', (e) => {
      log(`[http] Server error: ${e.message}`);
      resolve(null);
    });
  });
}

// ═══════════════════════════════════════
// 命令: start
// ═══════════════════════════════════════
async function cmdStart() {
  log('Token Daemon starting...');
  cleanStaleLocks();
  writePid();

  const ctx = _isWSL
    ? await launchEdgeViaCDP()
    : await getPW().chromium.launchPersistentContext(PROFILE, { channel: 'msedge', headless: true });

  log(`Edge launched (PID file: ${PID_FILE})`);

  // 为每个 token 打开一个 tab
  const tabs = {};
  const tokenEntries = Object.entries(registry.tokens);

  // 立即开始心跳（不等 token 提取完成），避免 tab 卡住导致 heartbeat 不写
  const heartbeatTimer = setInterval(() => {
    writeHeartbeat(tabs);
  }, HEARTBEAT_INTERVAL_MS);
  writeHeartbeat(tabs); // 首次立即写

  for (const [name, config] of tokenEntries) {
    const page = await ctx.newPage();
    let startUrl = config.startUrl;
    if (startUrl === 'dynamic:from-d365-workspace') {
      startUrl = await resolveDtmUrl(ctx);
    }

    log(`Opening tab [${name}]: ${startUrl}`);
    await page.goto(startUrl, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});

    // SSO: 首个 tab 做完 SSO 后，后续 tab 共享 session
    const ssoResult = await getHandleSSO()(page, {
      targetDomain: config.tab,
      log: (msg) => log(`[${name}] ${msg}`)
    });

    if (ssoResult.success) {
      log(`[${name}] SSO: ${ssoResult.action}`);
    } else {
      log(`[${name}] SSO failed: ${ssoResult.action}`);
    }

    // 等页面加载完
    await page.waitForTimeout(8000);

    // 提取 token（session tab 跳过）
    if (config.tokenSource === 'none') {
      log(`[${name}] Session tab ready`);
    } else {
      const tokenData = await getExtractToken()(page, config);
      if (tokenData) {
        const secret = tokenData.secret || tokenData.token || '';
        const cacheData = tokenData.secret
          ? { secret: tokenData.secret, expiresOn: tokenData.expiresOn, fetchedAt: new Date().toISOString() }
          : { token: tokenData.token, timestamp: Date.now() / 1000, fetchedAt: new Date().toISOString() };
        writeCache(config.cacheFile, cacheData);
        log(`[${name}] Token OK (len=${secret.length})`);
      } else {
        log(`[${name}] Token extraction failed`);
      }
    }

    tabs[name] = { page, config };
  }

  // 关闭初始空白 tab
  const allPages = ctx.pages();
  if (allPages.length > tokenEntries.length) {
    await allPages[0].close().catch(() => {});
  }

  // 心跳已在 tab 循环前启动，这里只记录日志
  log('All tabs initialized. Daemon running. Ctrl+C to stop.');

  // ── D365 OData HTTP Server ──
  const httpServer = await startD365HttpServer(tabs);

  // Graceful shutdown
  const shutdown = async () => {
    log('Shutting down...');
    clearInterval(heartbeatTimer);
    if (httpServer) httpServer.close();
    await ctx.close().catch(() => {});
    if (_isWSL) killCdpEdge();
    try { fs.unlinkSync(PID_FILE); } catch {}
    try { fs.unlinkSync(HEARTBEAT_FILE); } catch {}
    try { fs.unlinkSync(PORT_FILE); } catch {}
    log('Daemon stopped.');
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // Keep alive — 定期检查 token 过期并自动刷新 + session tab SSO 自愈
  // Per-token stale retry counter: avoid hammering reload every 60s when token can't be refreshed
  const staleRetryCount = {};  // { tokenName: { count, lastAttempt } }
  const STALE_MAX_RETRIES = 3;
  const STALE_COOLDOWN_MS = 5 * 60 * 1000; // 5 min cooldown after max retries
  setInterval(async () => {
    for (const [name, { page, config }] of Object.entries(tabs)) {
      // Session tab: 检查是否被踢到 login 页面，自动重新 SSO
      if (config.tokenSource === 'none') {
        try {
          const url = page.url();
          if (url.includes('login.microsoftonline') || url.includes('login.live') || url.includes('IdentityProvider')) {
            log(`[${name}] Session expired (on login page), re-doing SSO...`);
            const ssoResult = await getHandleSSO()(page, {
              targetDomain: config.tab,
              log: (msg) => log(`[${name}] ${msg}`)
            });
            if (ssoResult.success) {
              log(`[${name}] SSO re-auth OK: ${ssoResult.action}`);
              await page.waitForTimeout(5000).catch(() => {});
            } else {
              log(`[${name}] SSO re-auth failed: ${ssoResult.action}`);
            }
          }
        } catch (e) {
          log(`[${name}] Session check error: ${e.message}`);
        }
        continue;
      }
      if (!isCacheValid(config.cacheFile, config.cacheTTLMinutes)) {
        log(`[${name}] Token expired, refreshing...`);
        // Check stale retry cooldown — avoid hammering reload when token can't be refreshed
        const sr = staleRetryCount[name] || { count: 0, lastAttempt: 0 };
        if (sr.count >= STALE_MAX_RETRIES && (Date.now() - sr.lastAttempt) < STALE_COOLDOWN_MS) {
          const cooldownRemain = Math.round((STALE_COOLDOWN_MS - (Date.now() - sr.lastAttempt)) / 60000);
          log(`[${name}] Stale retry limit reached (${sr.count}x), cooldown ${cooldownRemain}m remaining`);
          continue;
        }
        try {
          const tokenData = await getExtractToken()(page, config);
          if (tokenData) {
            const secret = tokenData.secret || tokenData.token || '';

            // Check if extracted token is actually fresh (防止读到 localStorage 里的过期 token 死循环)
            let isStale = false;
            if (tokenData.expiresOn && String(tokenData.expiresOn).length > 0) {
              isStale = (Date.now() / 1000) >= (parseInt(tokenData.expiresOn, 10) - 60);
            }
            // Fallback: decode JWT exp from either .token (request-intercept) or .secret (localStorage)
            if (!isStale && !tokenData.expiresOn) {
              const rawToken = tokenData.token || tokenData.secret || '';
              const jwtExp = getJwtExp(rawToken);
              if (jwtExp) isStale = (Date.now() / 1000) >= (jwtExp - 60);
            }

            if (isStale) {
              // Token extracted but already expired → reload page to force MSAL/SSO renewal
              log(`[${name}] Extracted token is stale (expiresOn already passed), reloading page...`);
              staleRetryCount[name] = { count: (sr.count || 0) + 1, lastAttempt: Date.now() };
              await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
              await page.waitForTimeout(3000).catch(() => {});

              // If we landed on login page → SSO re-auth
              const reloadUrl = page.url();
              if (reloadUrl.includes('login.microsoftonline') || reloadUrl.includes('login.live') || reloadUrl.includes('IdentityProvider')) {
                log(`[${name}] SSO needed after reload`);
                await getHandleSSO()(page, {
                  targetDomain: config.tab,
                  log: (msg) => log(`[${name}] ${msg}`)
                });
              }
              await page.waitForTimeout(5000).catch(() => {});

              // Re-extract after reload
              const retryData = await getExtractToken()(page, config);
              let retryOk = false;
              if (retryData) {
                // Verify the re-extracted token is actually fresh
                let retryStale = false;
                if (retryData.expiresOn && String(retryData.expiresOn).length > 0) {
                  retryStale = (Date.now() / 1000) >= (parseInt(retryData.expiresOn, 10) - 60);
                }
                if (!retryStale && !retryData.expiresOn) {
                  const rawRetry = retryData.token || retryData.secret || '';
                  const retryExp = getJwtExp(rawRetry);
                  if (retryExp) retryStale = (Date.now() / 1000) >= (retryExp - 60);
                }
                if (!retryStale) {
                  const s = retryData.secret || retryData.token || '';
                  const cd = retryData.secret
                    ? { secret: retryData.secret, expiresOn: retryData.expiresOn, fetchedAt: new Date().toISOString() }
                    : { token: retryData.token, timestamp: Date.now() / 1000, fetchedAt: new Date().toISOString() };
                  writeCache(config.cacheFile, cd);
                  log(`[${name}] Token refreshed after page reload (len=${s.length})`);
                  retryOk = true;
                } else {
                  log(`[${name}] Re-extracted token still stale after reload`);
                }
              }

              // Fallback: clear MSAL AccessToken entries from localStorage to force silent renewal
              if (!retryOk && config.tokenSource === 'localStorage') {
                log(`[${name}] Clearing MSAL AccessToken cache from localStorage to force renewal...`);
                const targetPattern = config.tokenMatch?.targetIncludes || '';
                await page.evaluate((pattern) => {
                  const keysToRemove = [];
                  for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    try {
                      const val = JSON.parse(localStorage.getItem(key));
                      if (val && val.credentialType === 'AccessToken' && val.target) {
                        if (!pattern || val.target.includes(pattern)) {
                          keysToRemove.push(key);
                        }
                      }
                    } catch {}
                  }
                  keysToRemove.forEach(k => localStorage.removeItem(k));
                  return keysToRemove.length;
                }, targetPattern).catch(() => 0);

                // Reload to trigger MSAL acquireTokenSilent with refresh_token
                await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
                await page.waitForTimeout(8000).catch(() => {}); // MSAL silent renewal needs time

                // If on login page → SSO
                const postClearUrl = page.url();
                if (postClearUrl.includes('login.microsoftonline') || postClearUrl.includes('login.live') || postClearUrl.includes('IdentityProvider')) {
                  log(`[${name}] SSO needed after MSAL cache clear`);
                  await getHandleSSO()(page, {
                    targetDomain: config.tab,
                    log: (msg) => log(`[${name}] ${msg}`)
                  });
                  await page.waitForTimeout(5000).catch(() => {});
                }

                // Final re-extract
                const finalData = await getExtractToken()(page, config);
                if (finalData) {
                  const s = finalData.secret || finalData.token || '';
                  const cd = finalData.secret
                    ? { secret: finalData.secret, expiresOn: finalData.expiresOn, fetchedAt: new Date().toISOString() }
                    : { token: finalData.token, timestamp: Date.now() / 1000, fetchedAt: new Date().toISOString() };
                  writeCache(config.cacheFile, cd);
                  log(`[${name}] Token refreshed after MSAL cache clear (len=${s.length})`);
                } else {
                  log(`[${name}] Refresh failed even after MSAL cache clear`);
                }
              } else if (!retryOk) {
                log(`[${name}] Refresh still failed after page reload`);
              }
            } else {
              // Token is fresh → write to cache
              const cacheData = tokenData.secret
                ? { secret: tokenData.secret, expiresOn: tokenData.expiresOn, fetchedAt: new Date().toISOString() }
                : { token: tokenData.token, timestamp: Date.now() / 1000, fetchedAt: new Date().toISOString() };
              writeCache(config.cacheFile, cacheData);
              log(`[${name}] Token refreshed (len=${secret.length})`);
              // Reset stale retry counter on successful fresh token
              staleRetryCount[name] = { count: 0, lastAttempt: 0 };
            }
          } else {
            // extractToken failed — check if page landed on login (session expired)
            const curUrl = page.url();
            if (curUrl.includes('login.microsoftonline') || curUrl.includes('login.live')) {
              log(`[${name}] Session expired during refresh, re-doing SSO...`);
              const ssoResult = await getHandleSSO()(page, {
                targetDomain: config.tab,
                log: (msg) => log(`[${name}] ${msg}`)
              });
              if (ssoResult.success) {
                log(`[${name}] SSO re-auth OK, retrying token extraction...`);
                await page.waitForTimeout(5000).catch(() => {});
                const retryData = await getExtractToken()(page, config);
                if (retryData) {
                  const s = retryData.secret || retryData.token || '';
                  const cd = retryData.secret
                    ? { secret: retryData.secret, expiresOn: retryData.expiresOn, fetchedAt: new Date().toISOString() }
                    : { token: retryData.token, timestamp: Date.now() / 1000, fetchedAt: new Date().toISOString() };
                  writeCache(config.cacheFile, cd);
                  log(`[${name}] Token refreshed after SSO re-auth (len=${s.length})`);
                } else {
                  log(`[${name}] Refresh still failed after SSO re-auth`);
                }
              } else {
                log(`[${name}] SSO re-auth failed: ${ssoResult.action}`);
              }
            } else {
              log(`[${name}] Refresh failed (page: ${curUrl.substring(0, 60)})`);
            }
          }
        } catch (e) {
          log(`[${name}] Refresh error: ${e.message}`);
        }
      }
    }
  }, 60000); // 每分钟检查
}

// ═══════════════════════════════════════
// 命令: stop
// ═══════════════════════════════════════
function cmdStop() {
  const pid = readPid();
  if (!pid) {
    console.log('DAEMON_NOT_RUNNING');
    // 清理可能残留的文件
    try { fs.unlinkSync(PORT_FILE); } catch {}
    try { fs.unlinkSync(HEARTBEAT_FILE); } catch {}
    return;
  }
  if (!isProcessAlive(pid)) {
    console.log('DAEMON_STALE_PID|cleaning up');
    try { fs.unlinkSync(PID_FILE); } catch {}
    try { fs.unlinkSync(HEARTBEAT_FILE); } catch {}
    try { fs.unlinkSync(PORT_FILE); } catch {}
    return;
  }
  try {
    execSync(`taskkill.exe /PID ${pid} /F /T`, { encoding: 'utf-8', timeout: 10000 });
    console.log(`DAEMON_STOPPED|pid=${pid}`);
  } catch (e) {
    console.log(`DAEMON_STOP_FAILED|pid=${pid}|${e.message}`);
  }
  try { fs.unlinkSync(PID_FILE); } catch {}
  try { fs.unlinkSync(HEARTBEAT_FILE); } catch {}
  try { fs.unlinkSync(PORT_FILE); } catch {}
}

// ═══════════════════════════════════════
// 命令: ensure
// ═══════════════════════════════════════
async function cmdEnsure() {
  const pid = readPid();
  if (pid && isProcessAlive(pid) && isHeartbeatFresh()) {
    console.log(`DAEMON_ALIVE|pid=${pid}`);
    return;
  }

  // Daemon 不存活 → 清理 + 后台启动
  log('Daemon not alive, starting...');
  if (pid) {
    try { execSync(`taskkill.exe /PID ${pid} /F /T 2>nul`, { encoding: 'utf-8', timeout: 5000 }); } catch {}
  }
  try { fs.unlinkSync(PID_FILE); } catch {}
  killOrphanEdge();
  cleanStaleLocks();

  // 后台启动自身的 start 命令
  const child = spawn(process.execPath, [__filename, 'start'], {
    detached: true,
    stdio: 'ignore',
    env: { ...process.env, NODE_PATH: process.env.NODE_PATH || '/usr/lib/node_modules' }
  });
  child.unref();

  // 等待 PID 文件出现（最多 15s）
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 500));
    if (fs.existsSync(PID_FILE)) {
      const newPid = readPid();
      console.log(`DAEMON_STARTED|pid=${newPid}`);
      return;
    }
  }
  console.log('DAEMON_START_TIMEOUT');
}

// ═══════════════════════════════════════
// 命令: warmup
// ═══════════════════════════════════════
async function cmdWarmup() {
  const pid = readPid();
  const alive = pid && isProcessAlive(pid) && isHeartbeatFresh();

  if (alive) {
    // Daemon 存活 → 检查各 token cache，过期的清掉 cache 触发 daemon 60s 轮询自动刷新
    const results = [];
    for (const [name, config] of Object.entries(registry.tokens)) {
      if (config.tokenSource === 'none') {
        results.push(`${name}=session`);
        continue;
      }
      const valid = isCacheValid(config.cacheFile, config.cacheTTLMinutes);
      const remain = getCacheRemainMin(config.cacheFile, config.cacheTTLMinutes);
      if (!valid && config.cacheFile) {
        // 清掉过期 cache 强制 daemon 下一轮刷新
        try { fs.unlinkSync(resolveEnvPath(config.cacheFile)); } catch {}
        results.push(`${name}=queued-refresh`);
      } else {
        results.push(`${name}=${valid ? `cached(${remain}m)` : 'expired'}`);
      }
    }
    console.log(`WARMUP_OK|daemon=alive|${results.join('|')}`);
    process.exit(0);
    return;
  }

  // Daemon 不存活 → 需要重启，先抢互斥锁
  if (!acquireWarmupLock()) {
    console.log('WARMUP_SKIP|another warmup in progress');
    process.exit(0);
    return;
  }

  log('Daemon not alive, ensuring daemon start...');

  // 清理残留
  if (pid) {
    try { execSync(`taskkill.exe /PID ${pid} /F /T 2>nul`, { encoding: 'utf-8', timeout: 5000 }); } catch {}
  }
  try { fs.unlinkSync(PID_FILE); } catch {}
  try { fs.unlinkSync(PORT_FILE); } catch {}
  killOrphanEdge();
  cleanStaleLocks();

  // 后台启动 daemon
  const child = spawn(process.execPath, [__filename, 'start'], {
    detached: true,
    stdio: 'ignore'
  });
  child.unref();

  // 等 port file 出现（HTTP server 就绪 = daemon 完全启动，最多 120s）
  let daemonReady = false;
  for (let i = 0; i < 240; i++) {
    await new Promise(r => setTimeout(r, 500));
    if (fs.existsSync(PORT_FILE)) {
      daemonReady = true;
      break;
    }
  }

  if (daemonReady) {
    const newPid = readPid();
    // 报告 token 状态
    const results = [];
    for (const [name, config] of Object.entries(registry.tokens)) {
      if (config.tokenSource === 'none') {
        results.push(`${name}=session`);
        continue;
      }
      const valid = isCacheValid(config.cacheFile, config.cacheTTLMinutes);
      const remain = getCacheRemainMin(config.cacheFile, config.cacheTTLMinutes);
      results.push(`${name}=${valid ? `cached(${remain}m)` : 'expired'}`);
    }
    console.log(`WARMUP_OK|daemon=started(pid=${newPid})|${results.join('|')}`);
  } else {
    // Daemon 启动超时 → fallback inline warmup
    log('Daemon start timeout (120s), falling back to inline warmup...');
    await inlineWarmup();
  }

  releaseWarmupLock();
  process.exit(0);
}

/**
 * Inline warmup — daemon 不存活时的降级方案
 * 临时启动 Edge，顺序刷新每个 token，完成后关闭
 */
async function inlineWarmup() {
  cleanStaleLocks();

  let ctx;
  const launchCtx = async () => {
    if (_isWSL) return launchEdgeViaCDP();
    return getPW().chromium.launchPersistentContext(PROFILE, { channel: 'msedge', headless: true });
  };

  try {
    ctx = await launchCtx();
  } catch {
    cleanStaleLocks();
    try {
      ctx = await launchCtx();
    } catch (e) {
      console.log(`WARMUP_FAIL|launch failed: ${e.message.substring(0, 80)}`);
      return;
    }
  }

  const results = [];

  try {
    for (const [name, config] of Object.entries(registry.tokens)) {
      // 检查 cache
      if (isCacheValid(config.cacheFile, config.cacheTTLMinutes)) {
        const remain = getCacheRemainMin(config.cacheFile, config.cacheTTLMinutes);
        results.push(`${name}=cached(${remain}m)`);
        continue;
      }

      // 需要刷新
      const page = await ctx.newPage();
      let startUrl = config.startUrl;
      if (startUrl === 'dynamic:from-d365-workspace') startUrl = await resolveDtmUrl(ctx);

      if (!startUrl) {
        results.push(`${name}=skipped(no-url)`);
        log(`[${name}] SKIP: no start URL`);
        await page.close().catch(() => {});
        continue;
      }

      log(`[${name}] Refreshing: ${startUrl}`);

      // 对 request-intercept 类型，在 goto 之前就注册 listener（和原 warm-dtm-token.ps1 一样）
      // 这样首次加载 + SSO redirect 后的页面加载都能捕获到
      let earlyToken = '';
      if (config.tokenSource === 'request-intercept') {
        const urlPattern = config.tokenMatch.urlIncludes || '';
        const headerName = (config.tokenMatch.header || 'authorization').toLowerCase();
        page.on('request', req => {
          if (req.url().includes(urlPattern)) {
            const val = req.headers()[headerName];
            if (val && val.length > 100 && !earlyToken) earlyToken = val;
          }
        });
      }

      await page.goto(startUrl, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
      await page.waitForTimeout(3000).catch(() => {}); // 等 redirect 开始

      // 等页面稳定 + SSO 自愈循环
      let settled = false;
      for (let i = 0; i < 60 && !settled; i++) {
        await page.waitForTimeout(500).catch(() => {});
        const curUrl = page.url();

        // 在 login 或 IdentityProvider 页面 → 触发 SSO
        if (curUrl.includes('login.microsoftonline') || curUrl.includes('login.live') || curUrl.includes('IdentityProvider')) {
          log(`[${name}] SSO needed`);
          await getHandleSSO()(page, {
            targetDomain: config.tab,
            log: (msg) => log(`[${name}] ${msg}`)
          });
          continue;
        }

        // 到达目标域
        if (curUrl.includes(config.tab) && !curUrl.includes('#code=') && !curUrl.includes('authorize')) {
          await page.waitForTimeout(5000).catch(() => {});
          settled = true;
        }
      }

      // request-intercept: 如果首次加载没拿到，reload 再试（和原 DTM 逻辑一致）
      if (config.tokenSource === 'request-intercept' && !earlyToken && settled) {
        log(`[${name}] No token on first load, reloading...`);
        await page.reload({ waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
        for (let i = 0; i < 20 && !earlyToken; i++) await page.waitForTimeout(500).catch(() => {});
      }

      // 提取 token
      let tokenData = null;
      if (config.tokenSource === 'request-intercept' && earlyToken) {
        tokenData = { token: earlyToken };
      } else if (config.tokenSource === 'localStorage') {
        // localStorage 需要等页面加载完再读
        await page.waitForTimeout(3000).catch(() => {});
        tokenData = await getExtractToken()(page, config);
      } else if (!earlyToken) {
        // request-intercept 但没拿到
        tokenData = null;
      }
      if (tokenData) {
        const secret = tokenData.secret || tokenData.token || '';
        const cacheData = tokenData.secret
          ? { secret: tokenData.secret, expiresOn: tokenData.expiresOn, fetchedAt: new Date().toISOString() }
          : { token: tokenData.token, timestamp: Date.now() / 1000, fetchedAt: new Date().toISOString() };
        writeCache(config.cacheFile, cacheData);
        results.push(`${name}=refreshed(${secret.length})`);
        log(`[${name}] OK (len=${secret.length})`);
      } else {
        results.push(`${name}=failed`);
        log(`[${name}] FAIL`);
      }

      await page.close().catch(() => {});
    }
  } finally {
    await ctx.close().catch(() => {});
  }

  console.log(`WARMUP_OK|daemon=inline|${results.join('|')}`);
}

// ═══════════════════════════════════════
// 命令: status
// ═══════════════════════════════════════
function cmdStatus() {
  const pid = readPid();
  const alive = pid && isProcessAlive(pid);
  const freshHB = isHeartbeatFresh();

  const output = {
    daemon: {
      pid: pid || null,
      alive,
      heartbeatFresh: freshHB,
      profilePath: PROFILE
    },
    tokens: {}
  };

  for (const [name, config] of Object.entries(registry.tokens)) {
    if (config.tokenSource === 'none') {
      output.tokens[name] = { cacheFile: null, valid: true, remainMin: null, ttlMinutes: 0, tab: config.tab, type: 'session' };
      continue;
    }
    const valid = isCacheValid(config.cacheFile, config.cacheTTLMinutes);
    const remain = getCacheRemainMin(config.cacheFile, config.cacheTTLMinutes);
    output.tokens[name] = {
      cacheFile: resolveEnvPath(config.cacheFile),
      valid,
      remainMin: remain,
      ttlMinutes: config.cacheTTLMinutes,
      tab: config.tab
    };
  }

  console.log(JSON.stringify(output, null, 2));
}

// ═══════════════════════════════════════
// Main
// ═══════════════════════════════════════

// Global error handlers — catch crashes and write to log file
process.on('uncaughtException', (err) => {
  log(`FATAL uncaughtException: ${err.stack || err.message}`);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  log(`FATAL unhandledRejection: ${reason instanceof Error ? reason.stack : String(reason)}`);
  process.exit(1);
});

const cmd = process.argv[2] || 'status';

switch (cmd) {
  case 'start':   cmdStart(); break;
  case 'stop':    cmdStop(); break;
  case 'ensure':  cmdEnsure(); break;
  case 'warmup':  cmdWarmup(); break;
  case 'status':  cmdStatus(); break;
  default:
    console.error(`Unknown command: ${cmd}`);
    console.error('Usage: token-daemon.js [start|stop|ensure|warmup|status]');
    process.exit(1);
}
