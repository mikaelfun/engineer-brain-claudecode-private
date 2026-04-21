#!/usr/bin/env node
/**
 * warm-teams-token.js — 预热 Teams ic3 token
 *
 * 用法:
 *   node warm-teams-token.js [--force]
 *
 * 输出:
 *   TOKEN_OK|len=N|expires=EPOCH
 *   TOKEN_CACHED|len=N|expires=EPOCH
 *   TOKEN_FAIL|reason=...
 *
 * 缓存: $TEMP/teams-ic3-token.json
 *
 * 设计:
 *   Node.js playwright-core + Edge（和 DTM warm-dtm-token.ps1 一致）
 *   独立 profile: $TEMP/pw-teams-token-profile
 *   首次运行自动 SSO（找 @microsoft.com tile 点击，和 DTM 相同）
 *   Teams 会 redirect: teams.microsoft.com → login → teams.microsoft.com → teams.cloud.microsoft
 */

const path = require('path');
const fs = require('fs');
const pw = require(path.join(process.env.APPDATA, 'npm', 'node_modules', '@playwright', 'cli', 'node_modules', 'playwright-core'));

const PROFILE = path.join(process.env.TEMP || '/tmp', 'pw-teams-token-profile');
const CACHE_PATH = path.join(process.env.TEMP || '/tmp', 'teams-ic3-token.json');
const TOKEN_MARGIN_SECONDS = 300;

const force = process.argv.includes('--force');

function cleanStaleLock() {
  for (const f of ['SingletonLock', 'SingletonSocket', 'SingletonCookie']) {
    const p = path.join(PROFILE, f);
    try { if (fs.existsSync(p)) { fs.unlinkSync(p); console.error('  cleaned stale ' + f); } } catch {}
  }
  const defaultLock = path.join(PROFILE, 'Default', 'lock');
  try { if (fs.existsSync(defaultLock)) { fs.unlinkSync(defaultLock); console.error('  cleaned Default/lock'); } } catch {}
}

function checkCache() {
  if (!fs.existsSync(CACHE_PATH)) return null;
  try {
    const cached = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'));
    const expires = parseInt(cached.expiresOn || '0', 10);
    if (Date.now() / 1000 < expires - TOKEN_MARGIN_SECONDS) return cached;
  } catch {}
  return null;
}

function saveCache(secret, expiresOn) {
  const data = { secret, expiresOn: String(expiresOn), fetchedAt: new Date().toISOString() };
  fs.writeFileSync(CACHE_PATH, JSON.stringify(data));
}

async function extractToken(page) {
  return page.evaluate(() => {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      try {
        const val = JSON.parse(localStorage.getItem(key));
        if (val && val.credentialType === 'AccessToken' && val.target &&
            (val.target.includes('Teams.Access') || val.target.includes('ic3.teams'))) {
          return { secret: val.secret, expiresOn: val.expiresOn };
        }
      } catch {}
    }
    return null;
  }).catch(() => null);
}

(async () => {
  // 1. Check cache
  if (!force) {
    const cached = checkCache();
    if (cached) {
      console.log(`TOKEN_CACHED|len=${(cached.secret || '').length}|expires=${cached.expiresOn || '?'}`);
      return;
    }
  }

  // 2. Launch browser
  cleanStaleLock();
  let ctx;
  try {
    ctx = await pw.chromium.launchPersistentContext(PROFILE, { channel: 'msedge', headless: true });
  } catch {
    console.error('  launch failed, cleaning locks and retrying...');
    cleanStaleLock();
    try {
      ctx = await pw.chromium.launchPersistentContext(PROFILE, { channel: 'msedge', headless: true });
    } catch (e2) {
      console.log(`TOKEN_FAIL|reason=launch failed: ${e2.message.substring(0, 100)}`);
      process.exit(1);
    }
  }

  const page = ctx.pages()[0] || await ctx.newPage();

  try {
    // 3. Navigate to Teams
    await page.goto('https://teams.microsoft.com', { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});

    // 4. Wait and detect: login page or Teams app (polls for up to 15s)
    //    Teams flow: /v2/ → (3-5s delay) → login.microsoftonline.com → /v2/authv2 → teams.cloud.microsoft
    for (let i = 0; i < 30; i++) {
      await page.waitForTimeout(500);
      const url = page.url();
      if (url.includes('login.microsoftonline') || url.includes('login.live')) {
        // 5. Login page — auto-click @microsoft.com tile (same as DTM)
        console.error('  Login page — auto-selecting @microsoft.com...');
        await page.waitForTimeout(2000);
        const tiles = await page.locator('[data-test-id]').all();
        for (const t of tiles) {
          const txt = await t.textContent().catch(() => '');
          if (txt && txt.includes('@microsoft.com')) {
            console.error('  Clicking:', txt.trim().replace(/\s+/g, ' ').substring(0, 50));
            await t.click();
            break;
          }
        }
        break;
      }
      // Already past login (session exists)
      if (url.includes('teams.cloud.microsoft')) break;
    }

    // 6. Wait for Teams to fully load (handles redirect chain)
    //    teams.microsoft.com/v2/ → teams.cloud.microsoft
    //    Poll for final URL to stabilize (up to 30s)
    console.error('  Waiting for Teams to load...');
    for (let i = 0; i < 60; i++) {
      await page.waitForTimeout(500);
      const url = page.url();
      // teams.cloud.microsoft is the final destination (Teams v2 new domain)
      if (url.includes('teams.cloud.microsoft')) {
        await page.waitForTimeout(8000); // Let MSAL populate localStorage
        break;
      }
      // Fallback: still on teams.microsoft.com with content loaded
      if (url.includes('teams.microsoft.com/v2') && !url.includes('authorize') && !url.includes('#code=')) {
        const hasLS = await page.evaluate(() => localStorage.length > 10).catch(() => false);
        if (hasLS) { await page.waitForTimeout(3000); break; }
      }
    }

    // 7. Extract token — try current page (teams.cloud.microsoft or teams.microsoft.com)
    let tokenData = await extractToken(page);

    // 8. If not found on current domain, try the other one
    if (!tokenData) {
      const url = page.url();
      const otherUrl = url.includes('teams.cloud.microsoft')
        ? 'https://teams.microsoft.com/v2/'
        : 'https://teams.cloud.microsoft';
      console.error('  No token on current domain, checking', otherUrl.substring(0, 40), '...');
      await page.goto(otherUrl, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(3000);
      tokenData = await extractToken(page);
    }

    if (tokenData && tokenData.secret) {
      saveCache(tokenData.secret, tokenData.expiresOn);
      console.log(`TOKEN_OK|len=${tokenData.secret.length}|expires=${tokenData.expiresOn}`);
    } else {
      console.log('TOKEN_FAIL|reason=no token in localStorage');
      process.exit(1);
    }
  } finally {
    await ctx.close();
  }
})();
