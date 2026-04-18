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
const pw = require(path.join(process.env.APPDATA, 'npm', 'node_modules', '@playwright', 'cli', 'node_modules', 'playwright-core'));

const { handleSSO } = require('./sso-handler');
const { extractToken } = require('./extract-token');

// ── 配置 ──
const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
const TEMP = process.env.TEMP || '/tmp';
const PROFILE = path.join(TEMP, 'pw-token-daemon-profile');
const PID_FILE = path.join(TEMP, 'pw-token-daemon.pid');
const HEARTBEAT_FILE = path.join(TEMP, 'pw-token-daemon-heartbeat.json');
const PORT_FILE = path.join(TEMP, 'pw-token-daemon-port.json');
const HEARTBEAT_INTERVAL_MS = 30000;
const HEARTBEAT_STALE_MS = 60000;

function log(msg) {
  const ts = new Date().toISOString().replace('T', ' ').substring(0, 19);
  console.error(`[${ts}] ${msg}`);
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

function isCacheValid(cacheFile, ttlMinutes) {
  if (!cacheFile) return false; // session tab: no cache, always "needs processing"
  const cache = readCache(cacheFile);
  if (!cache) return false;

  // localStorage 方式: expiresOn 字段
  if (cache.expiresOn) {
    const expires = parseInt(cache.expiresOn, 10);
    return (Date.now() / 1000) < (expires - 300); // 5min 余量
  }

  // request-intercept 方式: timestamp 字段
  if (cache.timestamp) {
    const ageMin = (Date.now() / 1000 - cache.timestamp) / 60;
    return ageMin < ttlMinutes;
  }

  // fetchedAt fallback
  if (cache.fetchedAt) {
    const fetched = new Date(cache.fetchedAt).getTime();
    return (Date.now() - fetched) < ttlMinutes * 60 * 1000;
  }

  return false;
}

function getCacheRemainMin(cacheFile, ttlMinutes) {
  if (!cacheFile) return -1; // session tab
  const cache = readCache(cacheFile);
  if (!cache) return -1;

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
    // Windows: tasklist 查 PID
    const out = execSync(`tasklist /FI "PID eq ${pid}" /NH`, { encoding: 'utf-8', timeout: 5000 });
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
      data.tabs[name] = { status: 'session', remainMin: null };
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
        await handleSSO(page, {
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

  const ctx = await pw.chromium.launchPersistentContext(PROFILE, {
    channel: 'msedge',
    headless: true
  });

  log(`Edge launched (PID file: ${PID_FILE})`);

  // 为每个 token 打开一个 tab
  const tabs = {};
  const tokenEntries = Object.entries(registry.tokens);

  for (const [name, config] of tokenEntries) {
    const page = await ctx.newPage();
    let startUrl = config.startUrl;
    if (startUrl === 'dynamic:from-d365-workspace') {
      startUrl = await resolveDtmUrl(ctx);
    }

    log(`Opening tab [${name}]: ${startUrl}`);
    await page.goto(startUrl, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});

    // SSO: 首个 tab 做完 SSO 后，后续 tab 共享 session
    const ssoResult = await handleSSO(page, {
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
      const tokenData = await extractToken(page, config);
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

  // 心跳循环
  log('Daemon running. Heartbeat every 30s. Ctrl+C to stop.');
  writeHeartbeat(tabs);

  const heartbeatTimer = setInterval(() => {
    writeHeartbeat(tabs);
  }, HEARTBEAT_INTERVAL_MS);

  // ── D365 OData HTTP Server ──
  const httpServer = await startD365HttpServer(tabs);

  // Graceful shutdown
  const shutdown = async () => {
    log('Shutting down...');
    clearInterval(heartbeatTimer);
    if (httpServer) httpServer.close();
    await ctx.close().catch(() => {});
    try { fs.unlinkSync(PID_FILE); } catch {}
    try { fs.unlinkSync(HEARTBEAT_FILE); } catch {}
    try { fs.unlinkSync(PORT_FILE); } catch {}
    log('Daemon stopped.');
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // Keep alive — 定期检查 token 过期并自动刷新（session tab 跳过）
  setInterval(async () => {
    for (const [name, { page, config }] of Object.entries(tabs)) {
      if (config.tokenSource === 'none') continue; // session tab: no token to refresh
      if (!isCacheValid(config.cacheFile, config.cacheTTLMinutes)) {
        log(`[${name}] Token expired, refreshing...`);
        try {
          const tokenData = await extractToken(page, config);
          if (tokenData) {
            const secret = tokenData.secret || tokenData.token || '';
            const cacheData = tokenData.secret
              ? { secret: tokenData.secret, expiresOn: tokenData.expiresOn, fetchedAt: new Date().toISOString() }
              : { token: tokenData.token, timestamp: Date.now() / 1000, fetchedAt: new Date().toISOString() };
            writeCache(config.cacheFile, cacheData);
            log(`[${name}] Token refreshed (len=${secret.length})`);
          } else {
            log(`[${name}] Refresh failed`);
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
    execSync(`taskkill /PID ${pid} /F /T`, { encoding: 'utf-8', timeout: 10000 });
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
    try { execSync(`taskkill /PID ${pid} /F /T 2>nul`, { encoding: 'utf-8', timeout: 5000 }); } catch {}
  }
  try { fs.unlinkSync(PID_FILE); } catch {}

  // 后台启动自身的 start 命令
  const child = spawn(process.execPath, [__filename, 'start'], {
    detached: true,
    stdio: 'ignore'
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
  // 1. Ensure daemon
  const pid = readPid();
  const alive = pid && isProcessAlive(pid) && isHeartbeatFresh();

  if (!alive) {
    // Daemon 不存活 → 直接 start（前台模式会阻塞，改为 inline warmup）
    log('Daemon not alive, doing inline warmup...');
    await inlineWarmup();
    return;
  }

  // 2. Daemon 存活 → 检查各 token cache
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

  console.log(`WARMUP_OK|daemon=alive|${results.join('|')}`);
}

/**
 * Inline warmup — daemon 不存活时的降级方案
 * 临时启动 Edge，顺序刷新每个 token，完成后关闭
 */
async function inlineWarmup() {
  cleanStaleLocks();

  let ctx;
  try {
    ctx = await pw.chromium.launchPersistentContext(PROFILE, { channel: 'msedge', headless: true });
  } catch {
    cleanStaleLocks();
    try {
      ctx = await pw.chromium.launchPersistentContext(PROFILE, { channel: 'msedge', headless: true });
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
          await handleSSO(page, {
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
        tokenData = await extractToken(page, config);
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
