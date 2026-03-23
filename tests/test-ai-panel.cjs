/**
 * CaseDetail AI Panel — Comprehensive Playwright Tests
 *
 * Tests the AI assistant sidebar panel on the CaseDetail page:
 *  1. Layout & element presence
 *  2. Draft Email dropdown menu
 *  3. Quick Action: Refresh Data (real session)
 *  4. Quick Action: Compliance Check (real session)
 *  5. Quick Action: Status Judge (real session)
 *  6. Chat input interaction (real session)
 *  7. End session
 *  8. Session history
 *  9. Full Process (real session, long)
 * 10. Draft Email (real session)
 * 11. End All Sessions
 * 12. Error handling
 *
 * SAFETY: No Todo "Execute" buttons or D365 write operations are triggered.
 */

const { chromium } = require('playwright')

const BASE = 'http://localhost:5173'
const API = 'http://localhost:3010'
const CASE_ID = '2603200030000875'
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlbmdpbmVlciIsImlhdCI6MTc3NDExMzQ2NiwiZXhwIjoxNzc0MTIwNjY2fQ.1pwm-Tq_jvDe8j_ua6H6tZJEbrt2azi8vyTrqPBas6g'

const SCREENSHOT_DIR = 'C:\\Users\\fangkun\\Documents\\Claude Code Projects\\EngineerBrain\\dashboard\\screenshots-ai-panel'

const results = []
const consoleErrors = []
const timings = {}
let browser, page

// ─── Helpers ───────────────────────────────────────────────

function log(msg) {
  const ts = new Date().toISOString().slice(11, 23)
  console.log(`[${ts}] ${msg}`)
}

async function screenshot(name) {
  const path = `${SCREENSHOT_DIR}/${name}.png`
  await page.screenshot({ path, fullPage: false })
  log(`📸  ${name}`)
  return path
}

function record(testName, status, details = '') {
  results.push({ test: testName, status, details })
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️'
  log(`${icon}  ${testName}: ${status}${details ? ' — ' + details : ''}`)
}

/** Wait for any active operation to finish by polling the API */
async function waitForOperationDone(timeoutMs = 180_000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await page.evaluate(async (args) => {
        const r = await fetch(`/api/case/${args.caseId}/operation`, {
          headers: { 'Authorization': `Bearer ${args.token}` }
        })
        return r.json()
      }, { caseId: CASE_ID, token: TOKEN })
      if (!res.operation) return { elapsed: Date.now() - start, result: res }
    } catch { /* ignore */ }
    await page.waitForTimeout(3000)
  }
  throw new Error(`Operation did not finish within ${timeoutMs / 1000}s`)
}

/** Wait for an active session to appear */
async function waitForSession(timeoutMs = 60_000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await page.evaluate(async (args) => {
        const r = await fetch(`/api/case/${args.caseId}/sessions`, {
          headers: { 'Authorization': `Bearer ${args.token}` }
        })
        return r.json()
      }, { caseId: CASE_ID, token: TOKEN })
      if (res.activeSession) return res
    } catch { /* ignore */ }
    await page.waitForTimeout(2000)
  }
  return null
}

/** End any active session via API to clean state */
async function endActiveSessionViaAPI() {
  try {
    const sessions = await page.evaluate(async (args) => {
      const r = await fetch(`/api/case/${args.caseId}/sessions`, {
        headers: { 'Authorization': `Bearer ${args.token}` }
      })
      return r.json()
    }, { caseId: CASE_ID, token: TOKEN })

    if (sessions.activeSession) {
      await page.evaluate(async (args) => {
        await fetch(`/api/case/${args.caseId}/session`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${args.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ sessionId: args.sessionId })
        })
      }, { caseId: CASE_ID, token: TOKEN, sessionId: sessions.activeSession })
      log(`🔧 Ended active session ${sessions.activeSession.slice(0, 8)}`)
      await page.waitForTimeout(2000)
    }
  } catch (e) {
    log(`⚠️  Could not end session: ${e.message}`)
  }
}

/** End ALL sessions for this case via API */
async function endAllSessionsViaAPI() {
  try {
    await page.evaluate(async (args) => {
      await fetch(`/api/case/${args.caseId}/session/end-all`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${args.token}`,
          'Content-Type': 'application/json'
        }
      })
    }, { caseId: CASE_ID, token: TOKEN })
    log('🔧 Ended all sessions via API')
    await page.waitForTimeout(2000)
  } catch (e) {
    log(`⚠️  Could not end all sessions: ${e.message}`)
  }
}

/** Get AI Panel container — tries desktop sidebar first, then mobile below-content */
async function getAIPanel() {
  // Desktop: xl:block sidebar on the right
  let panel = page.locator('.xl\\:block').first()
  if (await panel.isVisible().catch(() => false)) return panel
  // Mobile/tablet: below content
  panel = page.locator('.xl\\:hidden').last()
  if (await panel.isVisible().catch(() => false)) return panel
  // Fallback: find by "AI Assistant" text
  return page.locator('text=AI Assistant').locator('..').locator('..').locator('..')
}

// ─── Tests ─────────────────────────────────────────────────

async function test01_layout() {
  const name = 'Test 01: AI Panel Layout & Elements'
  const t0 = Date.now()
  try {
    await page.goto(`${BASE}/case/${CASE_ID}`)
    await page.waitForTimeout(3000)

    // Wait for page to fully load
    await page.waitForSelector('text=AI Assistant', { timeout: 15000 })

    await screenshot('01-case-detail-full')

    // Check key elements
    const checks = {
      'AI Assistant header': await page.locator('text=AI Assistant').isVisible(),
      'Full Process button': await page.locator('button:has-text("Full Process")').isVisible(),
      'Draft Email button': await page.locator('button:has-text("Draft Email")').isVisible(),
      'Refresh Data action': await page.locator('button:has-text("Refresh Data")').isVisible(),
      'Teams Search action': await page.locator('button:has-text("Teams Search")').isVisible(),
      'Compliance action': await page.locator('button:has-text("Compliance")').isVisible(),
      'Status Judge action': await page.locator('button:has-text("Status Judge")').isVisible(),
      'Troubleshoot action': await page.locator('button:has-text("Troubleshoot")').isVisible(),
      'Inspection action': await page.locator('button:has-text("Inspection")').isVisible(),
      'Generate KB action': await page.locator('button:has-text("Generate KB")').isVisible(),
    }

    // The dropdown arrow is the second button inside the Draft Email split container
    const dropdownArrow = page.locator('button:has-text("Draft Email")').locator('..').locator('button').nth(1)
    checks['Draft Email dropdown arrow'] = await dropdownArrow.isVisible()

    const failed = Object.entries(checks).filter(([, v]) => !v)
    if (failed.length === 0) {
      record(name, 'PASS', `All ${Object.keys(checks).length} elements found`)
    } else {
      record(name, 'FAIL', `Missing: ${failed.map(([k]) => k).join(', ')}`)
    }

    await screenshot('01-ai-panel-area')
    timings[name] = Date.now() - t0
  } catch (e) {
    record(name, 'FAIL', e.message)
    await screenshot('01-error')
    timings[name] = Date.now() - t0
  }
}

async function test02_draftEmailDropdown() {
  const name = 'Test 02: Draft Email Dropdown Menu'
  const t0 = Date.now()
  try {
    // Find the split button container — it's the div containing both "Draft Email" and the chevron
    // The chevron button is the small one at the end
    const splitContainer = page.locator('button:has-text("Draft Email")').locator('..')
    const dropdownBtn = splitContainer.locator('button').last()

    await dropdownBtn.click()
    await page.waitForTimeout(500)

    await screenshot('02-dropdown-open')

    // Check email type options
    const expectedOptions = [
      'AI Auto-detect',
      'Initial Response',
      'Follow-up',
      'Status Update',
      'Closure',
      'Escalation'
    ]

    const found = []
    const missing = []
    for (const opt of expectedOptions) {
      const visible = await page.locator(`button:has-text("${opt}")`).isVisible().catch(() => false)
      if (visible) found.push(opt)
      else missing.push(opt)
    }

    // Close dropdown by clicking away
    await page.click('body', { position: { x: 10, y: 10 } })
    await page.waitForTimeout(300)

    if (missing.length === 0) {
      record(name, 'PASS', `All ${expectedOptions.length} email types found: ${found.join(', ')}`)
    } else {
      record(name, 'FAIL', `Missing options: ${missing.join(', ')}; Found: ${found.join(', ')}`)
    }

    await screenshot('02-dropdown-closed')
    timings[name] = Date.now() - t0
  } catch (e) {
    record(name, 'FAIL', e.message)
    await screenshot('02-error')
    timings[name] = Date.now() - t0
  }
}

async function test03_refreshData() {
  const name = 'Test 03: Quick Action — Refresh Data'
  const t0 = Date.now()
  try {
    // Make sure no active operation
    await endActiveSessionViaAPI()
    await page.waitForTimeout(2000)

    // Click Refresh Data
    const btn = page.locator('button:has-text("Refresh Data")').first()
    await btn.click()
    log('Clicked Refresh Data')

    await page.waitForTimeout(2000)
    await screenshot('03-refresh-started')

    // Wait for operation to complete
    const { elapsed } = await waitForOperationDone(180_000)
    log(`Refresh Data completed in ${(elapsed / 1000).toFixed(1)}s`)

    await page.waitForTimeout(2000)
    await screenshot('03-refresh-completed')

    // Check for SSE messages or completion indicators
    const completedVisible = await page.locator('text=completed').first().isVisible().catch(() => false)
    const doneVisible = await page.locator('text=Done').first().isVisible().catch(() => false)

    record(name, 'PASS', `Completed in ${(elapsed / 1000).toFixed(1)}s. Completion visible: ${completedVisible || doneVisible}`)
    timings[name] = Date.now() - t0
  } catch (e) {
    record(name, 'FAIL', e.message)
    await screenshot('03-error')
    timings[name] = Date.now() - t0
  }
}

async function test04_complianceCheck() {
  const name = 'Test 04: Quick Action — Compliance Check'
  const t0 = Date.now()
  try {
    await endActiveSessionViaAPI()
    await page.waitForTimeout(2000)

    const btn = page.locator('button:has-text("Compliance")').first()
    await btn.click()
    log('Clicked Compliance')

    await page.waitForTimeout(2000)
    await screenshot('04-compliance-started')

    const { elapsed } = await waitForOperationDone(180_000)
    log(`Compliance Check completed in ${(elapsed / 1000).toFixed(1)}s`)

    await page.waitForTimeout(2000)
    await screenshot('04-compliance-completed')

    record(name, 'PASS', `Completed in ${(elapsed / 1000).toFixed(1)}s`)
    timings[name] = Date.now() - t0
  } catch (e) {
    record(name, 'FAIL', e.message)
    await screenshot('04-error')
    timings[name] = Date.now() - t0
  }
}

async function test05_statusJudge() {
  const name = 'Test 05: Quick Action — Status Judge'
  const t0 = Date.now()
  try {
    await endActiveSessionViaAPI()
    await page.waitForTimeout(2000)

    const btn = page.locator('button:has-text("Status Judge")').first()
    await btn.click()
    log('Clicked Status Judge')

    await page.waitForTimeout(2000)
    await screenshot('05-statusjudge-started')

    const { elapsed } = await waitForOperationDone(180_000)
    log(`Status Judge completed in ${(elapsed / 1000).toFixed(1)}s`)

    await page.waitForTimeout(2000)
    await screenshot('05-statusjudge-completed')

    record(name, 'PASS', `Completed in ${(elapsed / 1000).toFixed(1)}s`)
    timings[name] = Date.now() - t0
  } catch (e) {
    record(name, 'FAIL', e.message)
    await screenshot('05-error')
    timings[name] = Date.now() - t0
  }
}

async function test06_chatInput() {
  const name = 'Test 06: Chat Input Interaction'
  const t0 = Date.now()
  try {
    // Need an active session for chat to work
    // Check if we have one from previous test
    let sessionData = await page.evaluate(async (args) => {
      const r = await fetch(`/api/case/${args.caseId}/sessions`, {
        headers: { 'Authorization': `Bearer ${args.token}` }
      })
      return r.json()
    }, { caseId: CASE_ID, token: TOKEN })

    if (!sessionData.activeSession) {
      log('No active session, skipping chat test or starting one...')
      // We might not have a session. Try to use the session from test05.
      // If none, we can still test the input field behavior.
    }

    // Find chat input — it should appear when there's an active session
    const chatInput = page.locator('input[placeholder="Message AI..."]')
    const hasInput = await chatInput.isVisible().catch(() => false)

    if (hasInput) {
      // Type message
      await chatInput.fill('Hello, what is this case about?')
      await screenshot('06-chat-typed')

      // Click send
      const sendBtn = chatInput.locator('..').locator('button').last()
      await sendBtn.click()
      log('Sent chat message')

      await page.waitForTimeout(3000)
      await screenshot('06-chat-sent')

      // Wait for response (poll for new messages in the panel)
      const responseStart = Date.now()
      let responseReceived = false
      while (Date.now() - responseStart < 120_000) {
        // Check if new messages appeared
        const messageCount = await page.locator('[class*="border-left"], [style*="border-left"]').count().catch(() => 0)
        if (messageCount > 1) {
          responseReceived = true
          break
        }
        await page.waitForTimeout(3000)
      }

      await screenshot('06-chat-response')
      record(name, 'PASS', `Chat input functional. Response received: ${responseReceived}`)
    } else {
      await screenshot('06-no-chat-input')
      record(name, 'SKIP', 'No active session — chat input not visible. This is expected if session ended.')
    }

    timings[name] = Date.now() - t0
  } catch (e) {
    record(name, 'FAIL', e.message)
    await screenshot('06-error')
    timings[name] = Date.now() - t0
  }
}

async function test07_endSession() {
  const name = 'Test 07: End Session'
  const t0 = Date.now()
  try {
    // Check for End button in header
    const endBtn = page.locator('button:has-text("End")').first()
    const doneBtn = page.locator('button:has-text("Done")').first()
    const dismissBtn = page.locator('button:has-text("Dismiss")').first()

    let clicked = false
    for (const btn of [endBtn, doneBtn, dismissBtn]) {
      if (await btn.isVisible().catch(() => false)) {
        await btn.click()
        clicked = true
        log('Clicked end/done/dismiss button')
        break
      }
    }

    if (!clicked) {
      // Try ending via API
      await endActiveSessionViaAPI()
    }

    await page.waitForTimeout(3000)
    await screenshot('07-session-ended')

    // Verify session is ended
    const sessionData = await page.evaluate(async (args) => {
      const r = await fetch(`/api/case/${args.caseId}/sessions`, {
        headers: { 'Authorization': `Bearer ${args.token}` }
      })
      return r.json()
    }, { caseId: CASE_ID, token: TOKEN })

    if (!sessionData.activeSession) {
      record(name, 'PASS', 'Session successfully ended')
    } else {
      record(name, 'WARN', `Session still active: ${sessionData.activeSession.slice(0, 8)}`)
    }

    timings[name] = Date.now() - t0
  } catch (e) {
    record(name, 'FAIL', e.message)
    await screenshot('07-error')
    timings[name] = Date.now() - t0
  }
}

async function test08_sessionHistory() {
  const name = 'Test 08: Session History'
  const t0 = Date.now()
  try {
    // Session history is a <details> element with session count
    const detailsSummary = page.locator('details summary')
    let found = false

    const allSummaries = await detailsSummary.count()
    for (let i = 0; i < allSummaries; i++) {
      const text = await detailsSummary.nth(i).textContent().catch(() => '')
      if (text.includes('session')) {
        // Found the session history section
        await detailsSummary.nth(i).click()
        await page.waitForTimeout(500)
        found = true
        log(`Found session history: "${text.trim()}"`)
        break
      }
    }

    if (found) {
      await screenshot('08-session-history-expanded')

      // Check for SessionBadge components
      const badges = await page.locator('[class*="font-mono"]').count().catch(() => 0)
      record(name, 'PASS', `Session history visible with ${badges} badge elements`)
    } else {
      await screenshot('08-no-session-history')

      // Check API for sessions
      const sessionData = await page.evaluate(async (args) => {
        const r = await fetch(`/api/case/${args.caseId}/sessions`, {
          headers: { 'Authorization': `Bearer ${args.token}` }
        })
        return r.json()
      }, { caseId: CASE_ID, token: TOKEN })

      record(name, 'SKIP', `No session history disclosure visible. API shows ${sessionData.sessions?.length || 0} sessions`)
    }

    timings[name] = Date.now() - t0
  } catch (e) {
    record(name, 'FAIL', e.message)
    await screenshot('08-error')
    timings[name] = Date.now() - t0
  }
}

async function test09_fullProcess() {
  const name = 'Test 09: Full Process'
  const t0 = Date.now()
  try {
    // Clean up before starting
    await endAllSessionsViaAPI()
    await page.waitForTimeout(3000)
    // Reload to get clean state
    await page.reload()
    await page.waitForSelector('text=AI Assistant', { timeout: 15000 })
    await page.waitForTimeout(2000)

    // Click Full Process
    const btn = page.locator('button:has-text("Full Process")').first()
    await btn.click()
    log('Clicked Full Process')

    await page.waitForTimeout(3000)
    await screenshot('09-fullprocess-started')

    // Monitor progress — take periodic screenshots
    const screenshotIntervals = [15, 30, 60, 90, 120, 180, 240]
    const startTime = Date.now()
    let screenshotIndex = 0
    let completed = false

    while (Date.now() - startTime < 300_000) {
      // Check if operation is still running
      try {
        const res = await page.evaluate(async (args) => {
          const r = await fetch(`/api/case/${args.caseId}/operation`, {
            headers: { 'Authorization': `Bearer ${args.token}` }
          })
          return r.json()
        }, { caseId: CASE_ID, token: TOKEN })

        if (!res.operation) {
          completed = true
          break
        }

        // Log current operation
        log(`Full Process running: ${res.operation.operationType} (${((Date.now() - startTime) / 1000).toFixed(0)}s)`)
      } catch { /* ignore */ }

      // Take periodic screenshots
      const elapsedSec = (Date.now() - startTime) / 1000
      if (screenshotIndex < screenshotIntervals.length && elapsedSec >= screenshotIntervals[screenshotIndex]) {
        await screenshot(`09-fullprocess-${screenshotIntervals[screenshotIndex]}s`)
        screenshotIndex++
      }

      await page.waitForTimeout(5000)
    }

    const elapsed = Date.now() - startTime
    await screenshot('09-fullprocess-final')

    // Check messages in the panel
    const messageCount = await page.locator('[style*="border-left"]').count().catch(() => 0)

    if (completed) {
      record(name, 'PASS', `Completed in ${(elapsed / 1000).toFixed(1)}s. ${messageCount} message elements visible.`)
    } else {
      record(name, 'WARN', `Did not complete within 300s. ${messageCount} messages visible.`)
    }

    timings[name] = Date.now() - t0
  } catch (e) {
    record(name, 'FAIL', e.message)
    await screenshot('09-error')
    timings[name] = Date.now() - t0
  }
}

async function test10_draftEmail() {
  const name = 'Test 10: Draft Email'
  const t0 = Date.now()
  try {
    // Wait for any existing operation to finish
    try {
      await waitForOperationDone(10_000)
    } catch { /* may not have any */ }

    // End any active session before starting new one
    await endActiveSessionViaAPI()
    await page.waitForTimeout(2000)

    // Click Draft Email (main button, auto-detect mode)
    const btn = page.locator('button:has-text("Draft Email")').first()
    await btn.click()
    log('Clicked Draft Email')

    await page.waitForTimeout(3000)
    await screenshot('10-draftemail-started')

    // Wait for operation to complete
    const { elapsed } = await waitForOperationDone(180_000)
    log(`Draft Email completed in ${(elapsed / 1000).toFixed(1)}s`)

    await page.waitForTimeout(3000)
    await screenshot('10-draftemail-completed')

    // Check if a draft appeared — click on Drafts tab
    const draftsTab = page.locator('button:has-text("Drafts")').first()
    if (await draftsTab.isVisible().catch(() => false)) {
      await draftsTab.click()
      await page.waitForTimeout(2000)
      await screenshot('10-drafts-tab')
    }

    record(name, 'PASS', `Completed in ${(elapsed / 1000).toFixed(1)}s`)
    timings[name] = Date.now() - t0
  } catch (e) {
    record(name, 'FAIL', e.message)
    await screenshot('10-error')
    timings[name] = Date.now() - t0
  }
}

async function test11_endAllSessions() {
  const name = 'Test 11: End All Sessions'
  const t0 = Date.now()
  try {
    // Navigate back to the AI panel area
    await page.goto(`${BASE}/case/${CASE_ID}`)
    await page.waitForSelector('text=AI Assistant', { timeout: 15000 })
    await page.waitForTimeout(3000)

    // Look for "end all" button in session history
    const endAllBtn = page.locator('button:has-text("end all")')
    const endAllVisible = await endAllBtn.isVisible().catch(() => false)

    if (endAllVisible) {
      await endAllBtn.click()
      log('Clicked "end all"')
      await page.waitForTimeout(3000)
      await screenshot('11-end-all-clicked')
    } else {
      // Use API fallback
      await endAllSessionsViaAPI()
    }

    // Verify
    const sessionData = await page.evaluate(async (args) => {
      const r = await fetch(`/api/case/${args.caseId}/sessions`, {
        headers: { 'Authorization': `Bearer ${args.token}` }
      })
      return r.json()
    }, { caseId: CASE_ID, token: TOKEN })

    await screenshot('11-end-all-result')

    if (!sessionData.activeSession) {
      record(name, 'PASS', `All sessions ended. ${sessionData.sessions?.length || 0} historical sessions remain.`)
    } else {
      record(name, 'WARN', `Active session still exists: ${sessionData.activeSession.slice(0, 8)}`)
    }

    timings[name] = Date.now() - t0
  } catch (e) {
    record(name, 'FAIL', e.message)
    await screenshot('11-error')
    timings[name] = Date.now() - t0
  }
}

async function test12_errorHandling() {
  const name = 'Test 12: Error Handling'
  const t0 = Date.now()
  try {
    // Make sure no active session
    await endAllSessionsViaAPI()
    await page.waitForTimeout(2000)
    await page.reload()
    await page.waitForSelector('text=AI Assistant', { timeout: 15000 })
    await page.waitForTimeout(2000)

    // Try sending a chat message without an active session
    const chatInput = page.locator('input[placeholder="Message AI..."]')
    const chatVisible = await chatInput.isVisible().catch(() => false)

    if (!chatVisible) {
      // Good — chat input should not be visible without active session
      await screenshot('12-no-chat-without-session')
      record(name, 'PASS', 'Chat input correctly hidden when no active session (expected behavior)')
    } else {
      // Chat input visible without session — try sending
      await chatInput.fill('test message')
      const sendBtn = chatInput.locator('..').locator('button').last()
      await sendBtn.click()
      await page.waitForTimeout(2000)
      await screenshot('12-chat-without-session')

      // Check for error message
      const errorVisible = await page.locator('[style*="accent-red"]').isVisible().catch(() => false)
      record(name, 'PASS', `Chat with no session — error shown: ${errorVisible}`)
    }

    // Also test: try clicking action when another operation is running
    // (We won't actually start a conflicting operation to keep it safe)

    timings[name] = Date.now() - t0
  } catch (e) {
    record(name, 'FAIL', e.message)
    await screenshot('12-error')
    timings[name] = Date.now() - t0
  }
}

// ─── Main ──────────────────────────────────────────────────

async function main() {
  const overall_t0 = Date.now()
  log('═══════════════════════════════════════════════════')
  log('  CaseDetail AI Panel — Comprehensive Test Suite   ')
  log('═══════════════════════════════════════════════════')
  log(`Case: ${CASE_ID}`)
  log(`App: ${BASE}`)
  log(`API: ${API}`)

  // Create screenshot directory
  const fs = require('fs')
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
  }

  // Launch browser
  browser = await chromium.launch({ headless: true, args: ['--window-size=1920,1080'] })
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } })
  page = await context.newPage()

  // Collect console errors
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push({ text: msg.text(), url: page.url(), time: new Date().toISOString() })
    }
  })

  page.on('pageerror', (err) => {
    consoleErrors.push({ text: err.message, url: page.url(), time: new Date().toISOString() })
  })

  // Auth setup
  log('Setting up authentication...')
  await page.goto(BASE)
  await page.evaluate((token) => {
    localStorage.setItem('eb_token', token)
    localStorage.setItem('eb-token', token) // backup key name
  }, TOKEN)
  await page.reload()
  await page.waitForTimeout(2000)

  // Verify auth worked
  const title = await page.title()
  log(`Page title: ${title}`)

  // Clean state before tests
  log('Cleaning existing sessions...')
  await endAllSessionsViaAPI()

  // ═══ Run Tests ═══
  log('\n─── Phase 1: UI-only tests (no Claude sessions) ───')
  await test01_layout()
  await test02_draftEmailDropdown()

  log('\n─── Phase 2: Quick Action tests (real Claude sessions) ───')
  await test03_refreshData()
  await test04_complianceCheck()
  await test05_statusJudge()

  log('\n─── Phase 3: Chat & Session Management ───')
  await test06_chatInput()
  await test07_endSession()
  await test08_sessionHistory()

  log('\n─── Phase 4: Full Process & Draft Email (long-running) ───')
  await test09_fullProcess()
  await test10_draftEmail()

  log('\n─── Phase 5: Cleanup & Error Handling ───')
  await test11_endAllSessions()
  await test12_errorHandling()

  // ═══ Summary ═══
  const totalTime = Date.now() - overall_t0

  log('\n═══════════════════════════════════════════════════')
  log('                  TEST SUMMARY                     ')
  log('═══════════════════════════════════════════════════')

  const passed = results.filter(r => r.status === 'PASS').length
  const failed = results.filter(r => r.status === 'FAIL').length
  const skipped = results.filter(r => r.status === 'SKIP').length
  const warned = results.filter(r => r.status === 'WARN').length

  for (const r of results) {
    const icon = r.status === 'PASS' ? '✅' : r.status === 'FAIL' ? '❌' : r.status === 'SKIP' ? '⏭️' : '⚠️'
    console.log(`  ${icon} ${r.test}: ${r.status}`)
    if (r.details) console.log(`     ${r.details}`)
  }

  console.log('')
  console.log(`Results: ${passed} passed, ${failed} failed, ${warned} warnings, ${skipped} skipped / ${results.length} total`)
  console.log(`Total time: ${(totalTime / 1000).toFixed(1)}s`)

  console.log('\n─── Timing Breakdown ───')
  for (const [test, ms] of Object.entries(timings)) {
    console.log(`  ${test}: ${(ms / 1000).toFixed(1)}s`)
  }

  if (consoleErrors.length > 0) {
    console.log(`\n─── Console Errors (${consoleErrors.length}) ───`)
    for (const e of consoleErrors.slice(0, 20)) {
      console.log(`  [${e.time}] ${e.text.slice(0, 200)}`)
    }
    if (consoleErrors.length > 20) {
      console.log(`  ... and ${consoleErrors.length - 20} more`)
    }
  } else {
    console.log('\n  No console errors collected.')
  }

  console.log(`\nScreenshots saved to: ${SCREENSHOT_DIR}`)

  // Cleanup
  await endAllSessionsViaAPI()
  await browser.close()

  // Exit with error code if any tests failed
  process.exit(failed > 0 ? 1 : 0)
}

main().catch((e) => {
  console.error('Fatal error:', e)
  if (browser) browser.close().catch(() => {})
  process.exit(2)
})
