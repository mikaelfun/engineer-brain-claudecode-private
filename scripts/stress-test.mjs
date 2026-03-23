#!/usr/bin/env node
/**
 * Extended stress test: rapid navigation, long soak, SSE reconnect detection
 */
import { chromium } from 'playwright';

const BASE = 'http://localhost:5177';
const PASSWORD = 'eb2026';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const allErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') allErrors.push({ type: 'console', text: msg.text() });
  });
  page.on('pageerror', err => {
    allErrors.push({ type: 'pageerror', text: err.message.slice(0, 500) });
  });

  console.log('\n=== Extended Stress Test ===\n');

  // Login
  console.log('1. Logging in...');
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 10000 });
  await page.waitForTimeout(2000);
  const pwInput = await page.$('input[type="password"]');
  if (pwInput) {
    await pwInput.fill(PASSWORD);
    const btn = await page.$('button[type="submit"]');
    if (btn) await btn.click();
    await page.waitForTimeout(3000);
  }
  console.log('   Logged in.');

  // === Rapid Navigation Stress Test ===
  console.log('\n2. Rapid Navigation (10 page transitions)...');
  allErrors.length = 0;
  const routes = ['/', '/todo', '/agents', '/drafts', '/settings', '/', '/agents', '/todo', '/settings', '/'];
  for (const r of routes) {
    await page.goto(`${BASE}${r}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.waitForTimeout(800);
  }
  console.log(`   Done. Page errors: ${allErrors.filter(e => e.type === 'pageerror').length}, Console errors: ${allErrors.filter(e => e.type === 'console').length}`);

  // === Check for "Maximum update depth" after rapid nav ===
  let maxUpdate = await page.evaluate(() =>
    document.body?.innerText?.includes('Maximum update depth') || false
  );
  let errBoundary = await page.evaluate(() =>
    document.body?.innerText?.includes('Something went wrong') || false
  );
  console.log(`   MaxUpdateDepth: ${maxUpdate}, ErrorBoundary: ${errBoundary}`);

  // === Extended Soak Test (45s on Dashboard) ===
  console.log('\n3. Extended Soak Test (45s on Dashboard)...');
  allErrors.length = 0;
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 10000 });

  // Check every 5 seconds
  for (let i = 0; i < 9; i++) {
    await page.waitForTimeout(5000);
    maxUpdate = await page.evaluate(() =>
      document.body?.innerText?.includes('Maximum update depth') || false
    );
    errBoundary = await page.evaluate(() =>
      document.body?.innerText?.includes('Something went wrong') || false
    );
    if (maxUpdate || errBoundary) {
      console.log(`   ❌ Error detected at ${(i + 1) * 5}s! MaxUpdate: ${maxUpdate}, ErrorBoundary: ${errBoundary}`);
      await page.screenshot({ path: 'C:/Users/fangkun/Documents/Claude Code Projects/EngineerBrain/scripts/stress-error.png', fullPage: true });
      break;
    }
    const h2 = await page.evaluate(() => document.querySelector('h2')?.textContent || '(no h2)');
    const consoleErrs = allErrors.filter(e => e.type === 'console').length;
    const pageErrs = allErrors.filter(e => e.type === 'pageerror').length;
    process.stdout.write(`   [${(i + 1) * 5}s] h2="${h2}" pageErr=${pageErrs} consoleErr=${consoleErrs}\n`);
  }

  // === Check SSE connectivity ===
  console.log('\n4. SSE Connection Check...');
  const sseStatus = await page.evaluate(async () => {
    try {
      const resp = await fetch('/api/events');
      return { status: resp.status, ok: resp.ok, type: resp.headers.get('content-type') };
    } catch (e) {
      return { error: e.message };
    }
  });
  console.log('   SSE endpoint:', JSON.stringify(sseStatus));

  // === Check for React render count (inject counter) ===
  console.log('\n5. React Render Count Test (navigate to /agents, wait 10s)...');
  allErrors.length = 0;
  await page.goto(`${BASE}/agents`, { waitUntil: 'domcontentloaded', timeout: 10000 });
  await page.waitForTimeout(10000);
  const agentPageErrs = allErrors.filter(e => e.type === 'pageerror');
  console.log(`   Page errors on /agents after 10s: ${agentPageErrs.length}`);
  if (agentPageErrs.length > 0) {
    agentPageErrs.forEach((e, i) => console.log(`   ${i}: ${e.text.slice(0, 300)}`));
  }

  // === Final Summary ===
  console.log('\n=== Summary ===');
  console.log(`Total page errors: ${allErrors.filter(e => e.type === 'pageerror').length}`);
  console.log(`Total console errors: ${allErrors.filter(e => e.type === 'console').length}`);

  if (allErrors.filter(e => e.type === 'pageerror').length > 0) {
    console.log('\nAll page errors:');
    allErrors.filter(e => e.type === 'pageerror').forEach((e, i) => console.log(`  ${i}: ${e.text}`));
  }

  await browser.close();
  console.log('\n=== Done ===');
})();
