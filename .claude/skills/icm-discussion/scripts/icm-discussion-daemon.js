/**
 * icm-discussion-daemon.js — ICM Discussion Timeline Fetcher
 *
 * 两种模式：
 *   --single <incidentId> --case-dir <dir>   一次性抓取，完成退出
 *   (no args, env CASES_ROOT)                 队列模式，轮询 .patrol/icm-queue/
 *
 * 技术栈：playwright-core + Edge + headless + persistent profile
 * Profile: $TEMP/pw-icm-discussion-profile
 */
const path = require('path');
const fs = require('fs');

// playwright-core 路径（跟 DTM warm-up 一样，从 @playwright/cli 内部取）
let pw;
try {
  pw = require(path.join(process.env.APPDATA, 'npm', 'node_modules', '@playwright', 'cli', 'node_modules', 'playwright-core'));
} catch {
  // fallback: 直接 require playwright-core
  pw = require('playwright-core');
}

const PROFILE = path.join(process.env.TEMP || '/tmp', 'pw-icm-discussion-profile');
const ICM_BASE = 'https://portal.microsofticm.com/imp/v5/incidents/details';

// --- 解析命令行 ---
const args = process.argv.slice(2);
const singleIdx = args.indexOf('--single');
const caseDirIdx = args.indexOf('--case-dir');
const singleMode = singleIdx !== -1;
const singleIncidentId = singleMode ? args[singleIdx + 1] : null;
const singleCaseDir = caseDirIdx !== -1 ? args[caseDirIdx + 1] : null;
const casesRoot = process.env.CASES_ROOT || './cases';

function log(msg) {
  const ts = new Date().toISOString().replace('T', ' ').substring(0, 19);
  console.log(`[${ts}] ${msg}`);
}

function appendLog(msg) {
  const logPath = path.join(casesRoot, '.patrol', 'icm-queue.log');
  const ts = new Date().toLocaleString('sv-SE').replace(',', '');
  fs.appendFileSync(logPath, `[${ts}] ${msg}\n`);
}

async function ssoLogin(page) {
  const url = page.url();
  if (!url.includes('IdentityProvider') && !url.includes('login.microsoftonline')) return true;

  // Identity Provider Selection page
  if (url.includes('IdentityProvider')) {
    log('SSO: Identity Provider page, clicking Sign in...');
    const signIn = page.locator('a:has-text("Sign in")').first();
    await signIn.click().catch(() => {});
    await page.waitForTimeout(3000);
  }

  // Pick an account page
  if (page.url().includes('login.microsoftonline')) {
    log('SSO: Pick account page...');
    const tiles = await page.locator('[data-test-id]').all();
    for (const t of tiles) {
      const txt = await t.textContent().catch(() => '');
      if (txt && txt.includes('@microsoft.com')) {
        await t.click();
        log('SSO: Selected @microsoft.com account');
        break;
      }
    }
    try {
      await page.waitForURL('**/incidents/**', { timeout: 20000 });
    } catch {
      await page.waitForTimeout(5000);
    }
  }

  return !page.url().includes('login');
}

async function fetchIncident(page, incidentId) {
  let details = null;
  let discussions = null;

  // 设置路由拦截
  const detailsHandler = async (route) => {
    const response = await route.fetch();
    details = await response.text();
    await route.fulfill({ response, body: details });
  };
  const discussionsHandler = async (route) => {
    const response = await route.fetch();
    discussions = await response.text();
    await route.fulfill({ response, body: discussions });
  };

  await page.route('**/GetIncidentDetails*', detailsHandler);
  await page.route('**/getdescriptionentries*', discussionsHandler);

  try {
    await page.goto(`${ICM_BASE}/${incidentId}/summary`, {
      waitUntil: 'domcontentloaded',
      timeout: 20000
    });

    // 检查是否需要 SSO
    if (page.url().includes('IdentityProvider') || page.url().includes('login')) {
      const ok = await ssoLogin(page);
      if (!ok) {
        log(`ERROR: SSO failed for ${incidentId}`);
        return null;
      }
      // SSO 后重新导航
      await page.goto(`${ICM_BASE}/${incidentId}/summary`, {
        waitUntil: 'domcontentloaded',
        timeout: 20000
      });
    }

    // 等待 API 响应
    const deadline = Date.now() + 15000;
    while ((!details || !discussions) && Date.now() < deadline) {
      await page.waitForTimeout(1000);
    }
  } catch (e) {
    log(`ERROR: Navigation failed for ${incidentId}: ${e.message}`);
  } finally {
    // 清除路由，避免累积
    await page.unroute('**/GetIncidentDetails*', detailsHandler).catch(() => {});
    await page.unroute('**/getdescriptionentries*', discussionsHandler).catch(() => {});
  }

  if (!details && !discussions) return null;

  return {
    _version: 1,
    _fetchedAt: new Date().toISOString(),
    _source: 'playwright-intercept',
    incidentId,
    details: details ? JSON.parse(details) : null,
    discussions: discussions ? JSON.parse(discussions) : null
  };
}

function writeResult(caseDir, incidentId, result) {
  const icmDir = path.join(caseDir, 'icm');
  fs.mkdirSync(icmDir, { recursive: true });
  const outPath = path.join(icmDir, '_icm-portal-raw.json');
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf-8');
  log(`DONE: ${incidentId} → ${outPath} (${result.discussions?.Items?.length || 0} entries)`);
}

// --- 单次模式 ---
async function runSingle() {
  if (!singleIncidentId || !singleCaseDir) {
    console.error('Usage: --single <incidentId> --case-dir <path>');
    process.exit(1);
  }

  log(`SINGLE mode: incident=${singleIncidentId} caseDir=${singleCaseDir}`);
  const ctx = await pw.chromium.launchPersistentContext(PROFILE, { channel: 'msedge', headless: true });
  const page = ctx.pages()[0] || await ctx.newPage();

  try {
    const result = await fetchIncident(page, singleIncidentId);
    if (result) {
      writeResult(singleCaseDir, singleIncidentId, result);
      console.log(`ICM_OK|${singleIncidentId}|entries=${result.discussions?.Items?.length || 0}`);
    } else {
      console.log(`ICM_FAIL|${singleIncidentId}|no data captured`);
    }
  } finally {
    await ctx.close();
  }
}

// --- 队列模式 ---
async function runQueue() {
  const queueDir = path.join(casesRoot, '.patrol', 'icm-queue');
  const activeFile = path.join(casesRoot, '.patrol', 'icm-queue-active');
  const stopFile = path.join(casesRoot, '.patrol', 'icm-queue-stop');

  fs.mkdirSync(queueDir, { recursive: true });

  log(`QUEUE mode: casesRoot=${casesRoot}`);
  const ctx = await pw.chromium.launchPersistentContext(PROFILE, { channel: 'msedge', headless: true });
  const page = ctx.pages()[0] || await ctx.newPage();

  // SSO 预热：导航到 ICM 首页触发登录
  log('SSO warm-up: navigating to ICM portal...');
  await page.goto('https://portal.microsofticm.com/imp/v5', {
    waitUntil: 'domcontentloaded', timeout: 20000
  }).catch(() => {});

  if (page.url().includes('IdentityProvider') || page.url().includes('login')) {
    await ssoLogin(page);
  }
  log('SSO warm-up complete');

  // 写 active 信号
  fs.writeFileSync(activeFile, String(Date.now()));
  appendLog('ICM QUEUE START | daemon ready');

  // 主循环
  let processed = 0;
  while (true) {
    // 检查 stop 信号
    if (fs.existsSync(stopFile)) {
      log('STOP signal received');
      break;
    }

    // 扫描请求
    let requests = [];
    try {
      requests = fs.readdirSync(queueDir)
        .filter(f => f.startsWith('request-') && f.endsWith('.json'))
        .sort();
    } catch { }

    if (requests.length === 0) {
      await new Promise(r => setTimeout(r, 5000));
      continue;
    }

    for (const reqFile of requests) {
      // 再次检查 stop
      if (fs.existsSync(stopFile)) break;

      const reqPath = path.join(queueDir, reqFile);
      let req;
      try {
        req = JSON.parse(fs.readFileSync(reqPath, 'utf-8'));
      } catch {
        log(`SKIP: invalid request ${reqFile}`);
        fs.unlinkSync(reqPath);
        continue;
      }

      const { incidentId, caseDir, caseNumber } = req;
      log(`PROCESSING: ${incidentId} (case ${caseNumber})`);
      appendLog(`ICM QUEUE PROCESSING | ${caseNumber} | incident ${incidentId}`);

      const start = Date.now();
      const result = await fetchIncident(page, incidentId);

      if (result) {
        writeResult(caseDir, incidentId, result);
        const elapsed = ((Date.now() - start) / 1000).toFixed(1);
        appendLog(`ICM QUEUE DONE | ${caseNumber} | ok | ${elapsed}s | ${result.discussions?.Items?.length || 0} entries`);
      } else {
        appendLog(`ICM QUEUE FAIL | ${caseNumber} | no data captured`);
      }

      // 删除 request
      try { fs.unlinkSync(reqPath); } catch { }
      processed++;
    }
  }

  // 退出
  await ctx.close();
  try { fs.unlinkSync(activeFile); } catch { }
  appendLog(`ICM QUEUE EXIT | processed=${processed}`);
  log(`EXIT: processed ${processed} incidents`);
}

// --- 入口 ---
(singleMode ? runSingle() : runQueue()).catch(e => {
  console.error('FATAL:', e.message);
  process.exit(1);
});
