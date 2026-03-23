#!/usr/bin/env node
/**
 * Interactive browser test:
 * 1. Login
 * 2. Navigate to Dashboard, click on a case → CaseDetail
 * 3. Stay on CaseDetail for 30s watching for MaxUpdateDepth / ErrorBoundary
 * 4. Navigate between tabs within CaseDetail
 * 5. Go back to Dashboard and navigate to another case
 * 6. Rapidly switch between pages while SSE is running
 */
import { chromium } from 'playwright';

const BASE = 'http://localhost:5177';
const PASSWORD = 'eb2026';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  const allErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      allErrors.push({ type: 'console', text: msg.text().slice(0, 500), route: page.url() });
    }
  });
  page.on('pageerror', err => {
    allErrors.push({ type: 'pageerror', text: err.message.slice(0, 500), route: page.url() });
  });

  console.log('\n=== Interactive Browser Test ===\n');

  // --- Login ---
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
  console.log('   Logged in.\n');

  // Helper: check for crash errors on current page
  async function checkForErrors(label) {
    const bodyText = await page.evaluate(() => document.body?.innerText || '');
    const hasMaxUpdate = bodyText.includes('Maximum update depth');
    const hasErrBoundary = bodyText.includes('Something went wrong');
    if (hasMaxUpdate || hasErrBoundary) {
      console.log(`   ❌ [${label}] MaxUpdateDepth=${hasMaxUpdate} ErrorBoundary=${hasErrBoundary}`);
      await page.screenshot({
        path: `C:/Users/fangkun/Documents/Claude Code Projects/EngineerBrain/scripts/screenshots/error-${label}.png`,
        fullPage: true
      });
      return true;
    }
    return false;
  }

  // Helper: get render count by injecting a MutationObserver briefly
  async function getRenderInfo() {
    return await page.evaluate(() => {
      const h2 = document.querySelector('h2')?.textContent || '(no h2)';
      const cards = document.querySelectorAll('.space-y-4, [class*="card"]').length;
      return { h2, cards };
    });
  }

  // --- 2. Navigate to Dashboard and find a case link ---
  console.log('2. Dashboard → Click first case...');
  allErrors.length = 0;
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 10000 });
  await page.waitForTimeout(3000);

  // Find a case link (case numbers are displayed as monospace text)
  const caseLinks = await page.$$('a[href*="/case/"], [class*="cursor-pointer"]');
  console.log(`   Found ${caseLinks.length} clickable elements`);

  // Try to find and click on a case card
  let navigatedToCase = false;
  const caseCard = await page.$('[class*="cursor-pointer"]');
  if (caseCard) {
    await caseCard.click();
    await page.waitForTimeout(5000); // Wait for CaseDetail to render + all 12 queries
    navigatedToCase = true;
    const info = await getRenderInfo();
    console.log(`   → Navigated to case. h2="${info.h2}", cards=${info.cards}`);
    const hasErr = await checkForErrors('case-click');
    if (hasErr) console.log('   ❌ ERROR on case click!');
  } else {
    // Try direct navigation to known case
    console.log('   No clickable card found, navigating directly to case...');
    await page.goto(`${BASE}/case/2603190030000206`, { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.waitForTimeout(5000);
    navigatedToCase = true;
    const info = await getRenderInfo();
    console.log(`   → Direct nav. h2="${info.h2}", cards=${info.cards}`);
    await checkForErrors('case-direct');
  }

  // --- 3. Soak test on CaseDetail (30s) ---
  if (navigatedToCase) {
    console.log('\n3. CaseDetail soak test (30s)...');
    allErrors.length = 0;
    for (let i = 0; i < 6; i++) {
      await page.waitForTimeout(5000);
      const bodyText = await page.evaluate(() => document.body?.innerText || '');
      const hasMaxUpdate = bodyText.includes('Maximum update depth');
      const hasErrBoundary = bodyText.includes('Something went wrong');
      const consErr = allErrors.filter(e => e.type === 'console').length;
      const pageErr = allErrors.filter(e => e.type === 'pageerror').length;
      process.stdout.write(`   [${(i+1)*5}s] maxUpdate=${hasMaxUpdate} errBoundary=${hasErrBoundary} pageErr=${pageErr} consErr=${consErr}\n`);
      if (hasMaxUpdate || hasErrBoundary) {
        await page.screenshot({
          path: `C:/Users/fangkun/Documents/Claude Code Projects/EngineerBrain/scripts/screenshots/error-soak-${(i+1)*5}s.png`,
          fullPage: true
        });
        break;
      }
    }
  }

  // --- 4. Switch tabs within CaseDetail ---
  console.log('\n4. Tab switching within CaseDetail...');
  allErrors.length = 0;
  const tabNames = ['Emails', 'Notes', 'Teams', 'Drafts', 'Analysis', 'Todo', 'Info', 'Inspection', 'Timing', 'Logs', 'Files'];
  for (const tabName of tabNames) {
    const tab = await page.$(`button:has-text("${tabName}")`);
    if (tab) {
      await tab.click();
      await page.waitForTimeout(1000);
      const hasErr = await checkForErrors(`tab-${tabName}`);
      if (hasErr) {
        console.log(`   ❌ Tab "${tabName}" caused error!`);
      } else {
        process.stdout.write(`   ✅ Tab "${tabName}" OK\n`);
      }
    }
  }

  // --- 5. Navigate back to Dashboard then to another case ---
  console.log('\n5. Back to Dashboard → another case...');
  allErrors.length = 0;
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 10000 });
  await page.waitForTimeout(2000);
  await checkForErrors('dashboard-return');

  // Navigate to a different case directly
  await page.goto(`${BASE}/case/2601290030000748`, { waitUntil: 'domcontentloaded', timeout: 10000 });
  await page.waitForTimeout(5000);
  const info2 = await getRenderInfo();
  console.log(`   Case 2: h2="${info2.h2}"`);
  await checkForErrors('case2');

  // --- 6. Rapid cross-page navigation with CaseDetail ---
  console.log('\n6. Rapid navigation (including CaseDetail routes)...');
  allErrors.length = 0;
  const rapidRoutes = [
    '/', '/case/2603190030000206', '/todo', '/case/2601290030000748',
    '/agents', '/case/2603030040001542', '/settings', '/',
    '/case/2603050040000857', '/drafts'
  ];
  for (const r of rapidRoutes) {
    await page.goto(`${BASE}${r}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.waitForTimeout(1500);
    const hasErr = await checkForErrors(`rapid-${r.replace(/\//g, '_')}`);
    if (hasErr) console.log(`   ❌ Error on ${r}!`);
  }
  console.log(`   Rapid nav done. pageErr=${allErrors.filter(e=>e.type==='pageerror').length}, consErr=${allErrors.filter(e=>e.type==='console').length}`);

  // --- 7. Final soak: CaseDetail for 15s after all the rapid navigation ---
  console.log('\n7. Final soak on CaseDetail (15s)...');
  allErrors.length = 0;
  await page.goto(`${BASE}/case/2603190030000206`, { waitUntil: 'domcontentloaded', timeout: 10000 });
  for (let i = 0; i < 3; i++) {
    await page.waitForTimeout(5000);
    const hasErr = await checkForErrors(`final-soak-${(i+1)*5}s`);
    if (hasErr) break;
    process.stdout.write(`   [${(i+1)*5}s] stable\n`);
  }

  // --- Summary ---
  console.log('\n=== Summary ===');
  const pageErrs = allErrors.filter(e => e.type === 'pageerror');
  const consErrs = allErrors.filter(e => e.type === 'console');
  console.log(`Total page errors: ${pageErrs.length}`);
  console.log(`Total console errors: ${consErrs.length}`);

  if (pageErrs.length > 0) {
    console.log('\nPage errors:');
    pageErrs.forEach((e, i) => console.log(`  ${i}: [${e.route}] ${e.text}`));
  }
  if (consErrs.length > 0) {
    console.log('\nConsole errors (first 10):');
    consErrs.slice(0, 10).forEach((e, i) => console.log(`  ${i}: [${e.route}] ${e.text.slice(0, 200)}`));
  }

  await browser.close();
  console.log('\n=== Done ===');
  process.exit(pageErrs.length > 0 ? 1 : 0);
})();
