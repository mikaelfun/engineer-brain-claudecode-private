/**
 * E2E Test: Dashboard Summary Tab + Fallback
 *
 * VP #5: Dashboard Summary tab 渲染 (Visual + API)
 * VP #6: 旧 inspection fallback (API)
 *
 * Screenshot rules: JPEG only, save to file, main session does NOT Read them.
 */

import { execSync } from 'child_process'
import { writeFileSync, unlinkSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { createRequire } from 'module'

const require = createRequire(join(process.cwd(), 'dashboard', 'package.json'))
const jwt = require('jsonwebtoken')
const { chromium } = require('playwright')

const BASE_URL = 'http://localhost:5173'
const API_URL = 'http://localhost:3010'
const JWT_SECRET = 'engineer-brain-local-dev-secret-2026'
const CASES_ROOT = join(process.cwd(), 'cases', 'active')
const SCREENSHOT_DIR = join(process.cwd(), 'scripts', 'screenshots')

const LEGACY_CASE = '2603260030005229'
const EMPTY_CASE = '2603230010001900001'
const SUMMARY_TEST_CASE = '2603260030005229'

// Auth
const token = jwt.sign({ sub: 'engineer' }, JWT_SECRET, { expiresIn: '1h' })
const headers = { 'Authorization': `Bearer ${token}` }

if (!existsSync(SCREENSHOT_DIR)) mkdirSync(SCREENSHOT_DIR, { recursive: true })

const results = []
let tempSummaryPath = null

function log(test, status, detail = '') {
  const icon = status === 'PASS' ? '✅' : '❌'
  console.log(`${icon} ${test}${detail ? ': ' + detail : ''}`)
  results.push({ test, status, detail })
}

async function apiGet(path) {
  const res = await fetch(`${API_URL}${path}`, { headers })
  return res.json()
}

try {
  // ─── VP #6: API Fallback Tests ─────────────────────────────────
  console.log('\n── VP #6: API Fallback Tests ──')

  // Test 1: Legacy case → legacy=true
  {
    const data = await apiGet(`/api/cases/${LEGACY_CASE}/inspection`)
    if (data.exists === true && data.legacy === true && data.content?.length > 0) {
      log('Legacy fallback', 'PASS', `filename=${data.filename}`)
    } else {
      log('Legacy fallback', 'FAIL', JSON.stringify({ exists: data.exists, legacy: data.legacy }))
    }
  }

  // Test 2: Empty case → exists=false
  {
    const data = await apiGet(`/api/cases/${EMPTY_CASE}/inspection`)
    if (data.exists === false) {
      log('Empty case fallback', 'PASS')
    } else {
      log('Empty case fallback', 'FAIL', JSON.stringify(data))
    }
  }

  // ─── VP #5: Summary Tab Tests ──────────────────────────────────
  console.log('\n── VP #5: Summary Tab Tests ──')

  // Test 3: Create temp case-summary.md → API returns legacy=false
  const testContent = `# Case Summary — ${SUMMARY_TEST_CASE}

## 问题描述
E2E test: Azure VM AllocationFailed error.

## 排查进展
- [2026-03-28] 检查 region capacity

## 关键发现
- Subscription quota 已满

## 风险
- SLA 即将到期
`
  tempSummaryPath = join(CASES_ROOT, SUMMARY_TEST_CASE, 'case-summary.md')
  writeFileSync(tempSummaryPath, testContent, 'utf-8')
  console.log(`  Created temp: case-summary.md`)

  {
    const data = await apiGet(`/api/cases/${SUMMARY_TEST_CASE}/inspection`)
    if (data.exists === true && data.legacy === false && data.filename === 'case-summary.md') {
      log('New summary API', 'PASS', `legacy=${data.legacy}`)
    } else {
      log('New summary API', 'FAIL', JSON.stringify({ exists: data.exists, legacy: data.legacy, filename: data.filename }))
    }
    if (data.content?.includes('AllocationFailed')) {
      log('Summary content match', 'PASS')
    } else {
      log('Summary content match', 'FAIL', 'missing AllocationFailed')
    }
  }

  // Test 4: Playwright Visual — Summary tab rendering
  const browser = await chromium.launch({ channel: 'msedge', headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

  try {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' })
    await page.evaluate((t) => { localStorage.setItem('eb_token', t) }, token)

    await page.goto(`${BASE_URL}/case/${SUMMARY_TEST_CASE}`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(3000)

    // Assert: Summary tab visible (tab text includes icon + label)
    const tabVisible = await page.locator('button', { hasText: 'Summary' }).first().isVisible().catch(() => false)
    log('Summary tab visible', tabVisible ? 'PASS' : 'FAIL')

    // Assert: Content rendered (key text from test data)
    const contentVisible = await page.locator('text=AllocationFailed').isVisible({ timeout: 5000 }).catch(() => false)
    log('Summary content rendered', contentVisible ? 'PASS' : 'FAIL')

    // Assert: 📋 icon
    const iconPresent = await page.locator('text=📋').isVisible().catch(() => false)
    log('Summary tab icon 📋', iconPresent ? 'PASS' : 'FAIL')

    // Screenshot — JPEG, save to file only (not read back into session)
    await page.screenshot({
      path: join(SCREENSHOT_DIR, 'e2e-summary-tab.jpeg'),
      type: 'jpeg',
      quality: 70,
    })
    console.log(`  Screenshot saved: scripts/screenshots/e2e-summary-tab.jpeg`)
  } finally {
    await browser.close()
  }

  // ─── Results ───────────────────────────────────────────────────
  console.log('\n── Results ──')
  const passed = results.filter(r => r.status === 'PASS').length
  const failed = results.filter(r => r.status === 'FAIL').length
  console.log(`${passed} passed, ${failed} failed out of ${results.length} tests`)

  if (failed > 0) {
    console.log('\nFailed tests:')
    results.filter(r => r.status === 'FAIL').forEach(r => console.log(`  ❌ ${r.test}: ${r.detail}`))
    process.exit(1)
  }
  console.log('\n✅ All E2E tests passed!')

} finally {
  if (tempSummaryPath && existsSync(tempSummaryPath)) {
    unlinkSync(tempSummaryPath)
    console.log(`  Cleaned up: case-summary.md`)
  }
  execSync(`rm -f "${SCREENSHOT_DIR}"/e2e-summary-*.jpeg 2>/dev/null || true`)
}
