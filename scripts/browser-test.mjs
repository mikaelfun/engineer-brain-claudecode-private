#!/usr/bin/env node
/**
 * Browser smoke test: navigate each page, capture actual errors and screenshots.
 * Uses JWT token injection (not password login) and 'domcontentloaded' (SSE keeps connection open).
 *
 * Env vars:
 *   BROWSER_TEST_URL  — base URL (default: http://localhost:5173)
 *   JWT_SECRET        — secret for signing test JWT (default: engineer-brain-local-dev-secret-2026)
 */
import { chromium } from 'playwright';
import { createRequire } from 'module';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

// jsonwebtoken is in dashboard/node_modules
const require = createRequire(join(projectRoot, 'dashboard', 'node_modules', 'placeholder.js'));
const jwt = require('jsonwebtoken');

const BASE = process.env.BROWSER_TEST_URL || 'http://localhost:5173';
const JWT_SECRET = process.env.JWT_SECRET || 'engineer-brain-local-dev-secret-2026';

// Generate a valid JWT token for authentication
const TOKEN = jwt.sign({ sub: 'engineer' }, JWT_SECRET, { expiresIn: '1h' });

// Screenshot output directory (same dir as this script)
const screenshotDir = __dirname;

// --- Health check: verify service is reachable before launching browser ---
async function healthCheck(url, retries = 3, delayMs = 2000) {
  for (let i = 1; i <= retries; i++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (res.ok || res.status < 500) return true;
    } catch {
      // ignore
    }
    if (i < retries) {
      console.log(`   Health check attempt ${i}/${retries} failed, retrying in ${delayMs / 1000}s...`);
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
  return false;
}

(async () => {
  console.log(`\n🌐 Browser Test — ${BASE}\n`);

  // Pre-flight: check if service is reachable
  console.log('0. Health check...');
  const reachable = await healthCheck(BASE);
  if (!reachable) {
    console.error(`\n❌ Service not reachable at ${BASE}`);
    console.error('   Make sure the dev server is running (cd dashboard && npm run dev)');
    process.exit(1);
  }
  console.log('   ✅ Service reachable\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => {
    pageErrors.push(err.message);
  });

  // 1. Inject JWT token (replaces password-based login)
  console.log('1. Injecting auth token...');
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 10000 });
  await page.evaluate((token) => {
    localStorage.setItem('eb_token', token);
  }, TOKEN);
  // Reload to pick up the token
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 10000 });
  await page.waitForTimeout(3000);
  console.log('   ✅ Authenticated via JWT\n');

  // Helper
  async function checkPage(label) {
    const errEl = await page.$('text=Something went wrong');
    if (errEl) {
      const msg = await page.evaluate(() => {
        const p = document.querySelector('p.text-sm.text-gray-500');
        return p?.textContent || '(no message)';
      });
      console.log(`   ❌ ErrorBoundary: ${msg}`);
      return true;
    }
    const maxUpdate = await page.evaluate(() =>
      document.body?.innerText?.includes('Maximum update depth') || false
    );
    if (maxUpdate) {
      console.log(`   ❌ "Maximum update depth exceeded" in page`);
      return true;
    }
    return false;
  }

  // Test each route
  const routes = ['/', '/todo', '/agents', '/drafts', '/settings', '/issues'];
  let failed = 0;

  for (const r of routes) {
    consoleErrors.length = 0;
    pageErrors.length = 0;

    process.stdout.write(`[${r}] `);
    await page.goto(`${BASE}${r}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.waitForTimeout(4000); // wait for React to render + potential loops

    const hasErr = await checkPage(r);
    if (hasErr) {
      failed++;
      const screenshotName = r.replace(/\//g, '_') || 'root';
      await page.screenshot({ path: join(screenshotDir, `error-${screenshotName}.png`), fullPage: true });
      console.log(`   📸 Screenshot saved`);
    } else {
      const h = await page.evaluate(() => document.querySelector('h2')?.textContent || '(no h2)');
      console.log(`✅ "${h}"`);
    }

    if (pageErrors.length > 0) {
      console.log(`   ⚠️ JS errors (${pageErrors.length}):`);
      pageErrors.forEach(e => console.log(`     ${e.slice(0, 300)}`));
    }
    if (consoleErrors.length > 0) {
      console.log(`   ⚠️ Console errors (${consoleErrors.length}):`);
      consoleErrors.slice(0, 3).forEach(e => console.log(`     ${e.slice(0, 200)}`));
    }
  }

  // Soak: stay on Dashboard for 15s to catch delayed infinite loop
  console.log('\n--- Soak test: Dashboard 15s ---');
  consoleErrors.length = 0;
  pageErrors.length = 0;
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 10000 });
  await page.waitForTimeout(15000);

  const soakErr = await checkPage('soak');
  if (soakErr) {
    failed++;
    await page.screenshot({ path: join(screenshotDir, 'error-soak.png'), fullPage: true });
  } else {
    console.log('   ✅ Stable after 15s');
  }
  if (pageErrors.length > 0) {
    console.log(`   ⚠️ JS errors during soak (${pageErrors.length}):`);
    pageErrors.forEach(e => console.log(`     ${e.slice(0, 300)}`));
  }

  console.log(`\n${failed > 0 ? '❌' : '✅'} ${failed} page(s) had errors\n`);
  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
})();
