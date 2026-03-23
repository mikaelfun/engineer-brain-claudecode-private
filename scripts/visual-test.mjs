#!/usr/bin/env node
/**
 * Visual test: login, take screenshots of every page, report exact state
 */
import { chromium } from 'playwright';

const BASE = 'http://localhost:5177';
const PASSWORD = 'eb2026';
const OUT = 'C:/Users/fangkun/Documents/Claude Code Projects/EngineerBrain/scripts/screenshots';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  console.log('\n=== Visual Verification Test ===\n');

  // Login
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 10000 });
  await page.waitForTimeout(2000);
  const pwInput = await page.$('input[type="password"]');
  if (pwInput) {
    await pwInput.fill(PASSWORD);
    const btn = await page.$('button[type="submit"]');
    if (btn) await btn.click();
    await page.waitForTimeout(3000);
    console.log('Logged in.');
  }

  const routes = [
    { path: '/', name: 'dashboard' },
    { path: '/todo', name: 'todo' },
    { path: '/agents', name: 'agents' },
    { path: '/drafts', name: 'drafts' },
    { path: '/settings', name: 'settings' },
  ];

  for (const r of routes) {
    await page.goto(`${BASE}${r.path}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.waitForTimeout(3000);

    // Check for errors
    const bodyText = await page.evaluate(() => document.body?.innerText || '');
    const hasMaxUpdate = bodyText.includes('Maximum update depth');
    const hasErrorBoundary = bodyText.includes('Something went wrong');
    const h2 = await page.evaluate(() => document.querySelector('h2')?.textContent || '(none)');

    const ssPath = `${OUT}/${r.name}.png`;
    await page.screenshot({ path: ssPath, fullPage: true });

    console.log(`[${r.path}] h2="${h2}" maxUpdate=${hasMaxUpdate} errBoundary=${hasErrorBoundary}`);
  }

  await browser.close();
  console.log('\n=== Done. Screenshots in scripts/screenshots/ ===');
})();
