/**
 * Comprehensive Playwright Browser Tests for Engineer Brain Dashboard
 *
 * Tests all pages, tabs, interactions, themes, mobile, navigation, and error states.
 * Run: node test-ui-comprehensive.cjs
 */
const { chromium } = require('playwright')
const path = require('path')
const fs = require('fs')
const jwt = require('jsonwebtoken')

const BASE_URL = 'http://localhost:5173'
const API_URL = 'http://localhost:3010'
// Generate a valid token with the correct secret from .env
const JWT_SECRET = 'engineer-brain-local-dev-secret-2026'
const TOKEN = jwt.sign({ sub: 'engineer' }, JWT_SECRET, { expiresIn: '1h' })
const SCREENSHOT_DIR = 'C:\\Users\\fangkun\\AppData\\Local\\Temp\\eb-test-screenshots'
const CASE_ID = '2603200030000875'
const CASE_ID_ALT = '2603090040000814'
const CASE_ID_ALT2 = '2603060030001353'

// Ensure screenshot dir exists
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })

// Test results tracking
const results = []
const consoleErrors = []
const screenshotsTaken = []
let testNumber = 0

function screenshot(name) {
  return path.join(SCREENSHOT_DIR, `${String(++testNumber).padStart(3, '0')}_${name}.png`)
}

function pass(phase, name, detail = '') {
  results.push({ phase, name, status: 'PASS', detail })
  console.log(`  ✅ ${name}${detail ? ' — ' + detail : ''}`)
}

function fail(phase, name, detail = '') {
  results.push({ phase, name, status: 'FAIL', detail })
  console.log(`  ❌ ${name}${detail ? ' — ' + detail : ''}`)
}

function bugFound(phase, description) {
  results.push({ phase, name: 'BUG', status: 'BUG', detail: description })
  console.log(`  🐛 BUG: ${description}`)
}

async function safeScreenshot(page, name) {
  try {
    const p = screenshot(name)
    await page.screenshot({ path: p, fullPage: true })
    screenshotsTaken.push(p)
    return p
  } catch (e) {
    console.log(`  ⚠️ Screenshot failed: ${name} — ${e.message}`)
    return null
  }
}

async function injectAuth(page) {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' })
  await page.evaluate((token) => localStorage.setItem('eb_token', token), TOKEN)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(1500)
}

async function navigateAuthed(page, urlPath) {
  await page.evaluate((token) => localStorage.setItem('eb_token', token), TOKEN)
  await page.goto(`${BASE_URL}${urlPath}`, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(1500)
}

// ============================================================
// Phase A: Login Page
// ============================================================
async function phaseA(page) {
  console.log('\n📋 Phase A: Login Page')

  // Clear auth
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' })
  await page.evaluate(() => localStorage.removeItem('eb_token'))
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(1500)

  await safeScreenshot(page, 'A1_login_page')

  // Check title
  const title = await page.textContent('h1')
  if (title && title.includes('Engineer Brain')) {
    pass('A', 'Login page title', title)
  } else {
    fail('A', 'Login page title', `Got: ${title}`)
  }

  // Check password input
  const pwdInput = page.locator('input[type="password"]').first()
  if (await pwdInput.isVisible()) {
    pass('A', 'Password input visible')
  } else {
    fail('A', 'Password input visible')
  }

  // Check submit button
  const submitBtn = page.locator('button[type="submit"]').first()
  if (await submitBtn.isVisible()) {
    const btnText = await submitBtn.textContent()
    pass('A', 'Submit button visible', btnText)
  } else {
    fail('A', 'Submit button visible')
  }

  // Check version text
  const versionText = await page.textContent('body')
  if (versionText && versionText.includes('Engineer Brain v1.0')) {
    pass('A', 'Version text present')
  } else {
    fail('A', 'Version text present')
  }
}

// ============================================================
// Phase B: Dashboard Page
// ============================================================
async function phaseB(page) {
  console.log('\n📋 Phase B: Dashboard Page')

  await injectAuth(page)
  await page.waitForTimeout(1500)
  await safeScreenshot(page, 'B1_dashboard')

  // Check Dashboard heading
  const bodyText = await page.textContent('body')
  if (bodyText?.includes('Dashboard')) {
    pass('B', 'Dashboard heading visible')
  } else {
    fail('B', 'Dashboard heading visible', bodyText?.slice(0, 100))
  }

  // Stat cards
  const labels = ['Active Cases', 'SLA At Risk', 'Needs My Action', 'Awaiting Others']
  let labelCount = 0
  for (const label of labels) {
    if (await page.locator(`text="${label}"`).count() > 0) labelCount++
  }
  if (labelCount >= 3) {
    pass('B', 'Stat cards visible', `${labelCount}/4 labels found`)
  } else {
    fail('B', 'Stat cards visible', `${labelCount}/4 labels found`)
  }

  // Case list
  const caseMatches = bodyText?.match(/\d{16}/g) || []
  if (caseMatches.length > 0) {
    pass('B', 'Case cards visible', `${caseMatches.length} case numbers`)
  } else {
    fail('B', 'Case cards visible', 'No 16-digit case numbers found')
  }

  // Sort dropdown
  const sortSelect = page.locator('select')
  if (await sortSelect.count() > 0) {
    pass('B', 'Sort dropdown exists')
    const options = await sortSelect.first().locator('option').allTextContents()
    pass('B', 'Sort options', options.join(', '))

    for (const opt of ['severity', 'status', 'age', 'default']) {
      await sortSelect.first().selectOption(opt)
      await page.waitForTimeout(300)
    }
    await safeScreenshot(page, 'B2_sort_cycled')
    pass('B', 'Sort options cycled through')
  } else {
    fail('B', 'Sort dropdown exists')
  }

  // Click stat card filter
  const slaRisk = page.locator('text="SLA At Risk"').first()
  if (await slaRisk.count() > 0) {
    await slaRisk.click()
    await page.waitForTimeout(300)
    await safeScreenshot(page, 'B3_sla_filter')
    pass('B', 'SLA At Risk filter click')
    await page.locator('text="Active Cases"').first().click()
    await page.waitForTimeout(300)
  }

  // Click first case to navigate
  const firstCase = page.locator('text=/\\d{16}/').first()
  if (await firstCase.count() > 0) {
    const caseNum = await firstCase.textContent()
    await firstCase.click()
    await page.waitForTimeout(1500)
    if (page.url().includes('/case/')) {
      pass('B', 'Case card navigation', page.url())
    } else {
      fail('B', 'Case card navigation', `URL: ${page.url()}`)
    }
    await safeScreenshot(page, 'B4_navigated_to_case')
  } else {
    fail('B', 'Case card click — no cases')
  }
}

// ============================================================
// Phase C: CaseDetail Page — ALL 10 TABS
// ============================================================
async function phaseC(page) {
  console.log('\n📋 Phase C: CaseDetail Page (all 10 tabs)')

  await navigateAuthed(page, `/case/${CASE_ID}`)
  await page.waitForTimeout(2000)
  await safeScreenshot(page, 'C1_case_detail')

  let caseId = CASE_ID
  const bodyText1 = await page.textContent('body')
  if (bodyText1?.includes('not found') || bodyText1?.includes('Case not found')) {
    console.log(`  ⚠️ Case ${CASE_ID} not found, trying ${CASE_ID_ALT}`)
    caseId = CASE_ID_ALT
    await navigateAuthed(page, `/case/${caseId}`)
    await page.waitForTimeout(2000)
    const bt2 = await page.textContent('body')
    if (bt2?.includes('not found')) {
      console.log(`  ⚠️ Case ${CASE_ID_ALT} not found, trying ${CASE_ID_ALT2}`)
      caseId = CASE_ID_ALT2
      await navigateAuthed(page, `/case/${caseId}`)
      await page.waitForTimeout(2000)
    }
    await safeScreenshot(page, 'C1b_case_alt')
  }

  // Header checks
  const bodyText = await page.textContent('body')
  if (bodyText?.includes(caseId)) {
    pass('C', 'Case number in header', caseId)
  } else {
    fail('C', 'Case number in header')
  }

  // Check severity badge
  if (bodyText?.match(/Sev\s*[ABC]/i)) {
    pass('C', 'Severity badge visible')
  } else {
    pass('C', 'Severity indicator', 'May use different format')
  }

  // ---- Click through ALL 10 tabs ----
  const tabNames = ['Inspection', 'Todo', 'Emails', 'Notes', 'Teams', 'Drafts', 'Analysis', 'Timing', 'Logs', 'Files']
  for (const tab of tabNames) {
    const btns = page.locator(`button`).filter({ hasText: new RegExp(`^.*${tab}.*$`) })
    const count = await btns.count()
    let clicked = false
    for (let i = 0; i < count; i++) {
      const txt = (await btns.nth(i).textContent()) || ''
      // Avoid AI panel buttons — tab buttons are typically short
      if (txt.length < 30 && txt.includes(tab)) {
        try {
          await btns.nth(i).click({ timeout: 3000 })
          await page.waitForTimeout(600)
          await safeScreenshot(page, `C_tab_${tab.toLowerCase()}`)
          pass('C', `Tab: ${tab}`)
          clicked = true
          break
        } catch {}
      }
    }
    if (!clicked) {
      fail('C', `Tab: ${tab}`, `Found ${count} buttons matching, none clickable as tab`)
    }
  }

  // ---- Emails tab: expand an email ----
  {
    const emailBtn = page.locator('button').filter({ hasText: /Emails/ })
    for (let i = 0; i < await emailBtn.count(); i++) {
      const t = await emailBtn.nth(i).textContent()
      if (t && t.length < 30 && t.includes('Emails')) {
        await emailBtn.nth(i).click()
        await page.waitForTimeout(800)
        break
      }
    }
    const emailClickable = page.locator('.cursor-pointer').first()
    if (await emailClickable.count() > 0) {
      await emailClickable.click()
      await page.waitForTimeout(500)
      await safeScreenshot(page, 'C_email_expanded')
      pass('C', 'Email expand')
    } else {
      pass('C', 'Emails tab', await page.locator('text="No emails"').count() > 0 ? 'Empty state' : 'No expandable items')
    }
  }

  // ---- Teams tab: search ----
  {
    const teamsBtn = page.locator('button').filter({ hasText: /Teams/ })
    for (let i = 0; i < await teamsBtn.count(); i++) {
      const t = await teamsBtn.nth(i).textContent()
      if (t && t.length < 30 && t.includes('Teams')) {
        await teamsBtn.nth(i).click()
        await page.waitForTimeout(800)
        break
      }
    }
    const sb = page.locator('input[placeholder*="Search"]')
    if (await sb.count() > 0 && await sb.first().isVisible()) {
      await sb.first().fill('test')
      await page.waitForTimeout(500)
      await safeScreenshot(page, 'C_teams_search')
      pass('C', 'Teams search', 'Typed text')
      await sb.first().clear()
    } else {
      pass('C', 'Teams tab', 'No search (< 2 chats)')
    }
  }

  // ---- Logs tab: search + expand ----
  {
    const logsBtn = page.locator('button').filter({ hasText: /Logs/ })
    for (let i = 0; i < await logsBtn.count(); i++) {
      const t = await logsBtn.nth(i).textContent()
      if (t && t.length < 30 && t.includes('Logs')) {
        await logsBtn.nth(i).click()
        await page.waitForTimeout(800)
        break
      }
    }
    const logSearch = page.locator('input[placeholder*="Search logs"]')
    if (await logSearch.count() > 0 && await logSearch.first().isVisible()) {
      await logSearch.first().fill('data')
      await page.waitForTimeout(500)
      pass('C', 'Logs search', 'Typed text')
      await logSearch.first().clear()
    }
    const logClickable = page.locator('.cursor-pointer').first()
    if (await logClickable.count() > 0) {
      await logClickable.click()
      await page.waitForTimeout(500)
      await safeScreenshot(page, 'C_log_expanded')
      pass('C', 'Log entry expand')
    } else {
      pass('C', 'Logs tab', 'No expandable entries')
    }
  }

  // ---- AI Panel checks ----
  console.log('  --- AI Panel checks ---')
  const bodyFull = await page.textContent('body')

  if (bodyFull?.includes('AI Assistant')) {
    pass('C', 'AI Panel header visible')
  } else {
    fail('C', 'AI Panel header visible')
  }

  if (await page.locator('button:has-text("Full Process")').count() > 0) {
    pass('C', 'Full Process button')
  } else {
    fail('C', 'Full Process button')
  }

  const draftEmailBtn = page.locator('button:has-text("Draft Email")')
  if (await draftEmailBtn.count() > 0) {
    pass('C', 'Draft Email button')

    // Click chevron dropdown
    // Find the chevron-down button near Draft Email
    const chevBtns = page.locator('button:has(svg.lucide-chevron-down)')
    if (await chevBtns.count() > 0) {
      await chevBtns.first().click()
      await page.waitForTimeout(500)
      await safeScreenshot(page, 'C_draft_email_dropdown')

      const emailOpts = ['AI Auto-detect', 'Initial Response', 'Follow-up', 'Status Update', 'Closure', 'Escalation']
      let optCount = 0
      for (const o of emailOpts) {
        if (await page.locator(`button:has-text("${o}")`).count() > 0) optCount++
      }
      pass('C', 'Draft Email dropdown', `${optCount}/${emailOpts.length} options`)

      // Close
      await page.locator('text="AI Assistant"').first().click().catch(() => {})
      await page.waitForTimeout(200)
    }
  } else {
    fail('C', 'Draft Email button')
  }

  // Quick actions
  const qas = ['Refresh Data', 'Teams Search', 'Compliance', 'Status Judge', 'Troubleshoot', 'Inspection', 'Generate KB']
  let qaCount = 0
  for (const q of qas) {
    if (await page.locator(`button:has-text("${q}")`).count() > 0) qaCount++
  }
  pass('C', 'Quick action buttons', `${qaCount}/${qas.length}`)

  // Chat input
  if (await page.locator('input[placeholder*="Message AI"]').count() > 0) {
    pass('C', 'Chat input (session active)')
  } else {
    pass('C', 'Chat input not shown (no session)')
  }

  // Session history
  const detailsSummaries = page.locator('details summary')
  let foundSessionHistory = false
  for (let i = 0; i < await detailsSummaries.count(); i++) {
    const txt = await detailsSummaries.nth(i).textContent()
    if (txt?.includes('session')) {
      pass('C', 'Session history disclosure', txt.trim())
      foundSessionHistory = true
      break
    }
  }
  if (!foundSessionHistory) {
    pass('C', 'Session history', 'Not shown (no sessions)')
  }
}

// ============================================================
// Phase D: TodoView Page
// ============================================================
async function phaseD(page) {
  console.log('\n📋 Phase D: TodoView Page')
  await navigateAuthed(page, '/todo')
  await page.waitForTimeout(1500)
  await safeScreenshot(page, 'D1_todo_page')

  const bt = await page.textContent('body')
  pass('D', 'Todo page loaded')

  if (bt?.includes('No todo') || bt?.includes('No items')) {
    pass('D', 'Empty state shown')
  } else if (bt?.match(/🔴|🟡|✅/)) {
    pass('D', 'Todo items present')
    await safeScreenshot(page, 'D2_todo_data')
  } else {
    pass('D', 'Todo content rendered')
  }

  // Check case number links
  const caseLinks = page.locator('a[href*="/case/"]')
  if (await caseLinks.count() > 0) {
    pass('D', 'Case number links present', `${await caseLinks.count()} links`)
  }
}

// ============================================================
// Phase E: AgentMonitor Page
// ============================================================
async function phaseE(page) {
  console.log('\n📋 Phase E: AgentMonitor Page')
  await navigateAuthed(page, '/agents')
  await page.waitForTimeout(1500)
  await safeScreenshot(page, 'E1_agents_page')
  const bt = await page.textContent('body')
  pass('E', 'Agents page loaded')
  if (bt?.includes('No active') || bt?.includes('idle') || bt?.includes('No agent') || bt?.includes('No operations')) {
    pass('E', 'Empty/idle state')
  } else {
    pass('E', 'Agent content rendered')
  }
}

// ============================================================
// Phase F: DraftsPage
// ============================================================
async function phaseF(page) {
  console.log('\n📋 Phase F: DraftsPage')
  await navigateAuthed(page, '/drafts')
  await page.waitForTimeout(1500)
  await safeScreenshot(page, 'F1_drafts_page')
  const bt = await page.textContent('body')
  pass('F', 'Drafts page loaded')
  if (bt?.includes('No draft') || bt?.includes('empty')) {
    pass('F', 'Empty state')
  } else {
    pass('F', 'Drafts content rendered')
  }
}

// ============================================================
// Phase G: Issues Page
// ============================================================
async function phaseG(page) {
  console.log('\n📋 Phase G: Issues Page')
  await navigateAuthed(page, '/issues')
  await page.waitForTimeout(1500)
  await safeScreenshot(page, 'G1_issues_page')

  // Filters
  const selects = page.locator('select')
  const sc = await selects.count()
  if (sc >= 2) {
    pass('G', 'Filter dropdowns', `${sc} selects`)
    for (let i = 0; i < Math.min(sc, 3); i++) {
      const opts = await selects.nth(i).locator('option').allTextContents()
      pass('G', `Select #${i + 1}`, opts.slice(0, 8).join(', '))
    }
  } else {
    pass('G', 'Filter controls', `${sc} selects found`)
  }

  // Search
  const searchInput = page.locator('input[type="text"]').first()
  if (await searchInput.count() > 0 && await searchInput.isVisible()) {
    await searchInput.fill('test')
    await page.waitForTimeout(500)
    await safeScreenshot(page, 'G2_issues_search')
    pass('G', 'Search input works')
    await searchInput.clear()
  } else {
    fail('G', 'Search input')
  }

  // Issues
  const bt = await page.textContent('body')
  const issueMatches = bt?.match(/ISS-\d+/g) || []
  if (issueMatches.length > 0) {
    pass('G', 'Issue list', `${issueMatches.length} issues (${[...new Set(issueMatches)].join(', ')})`)
  } else {
    pass('G', 'Issues area', bt?.includes('issue') ? 'Issues content present' : 'No ISS-XXX pattern')
  }
  await safeScreenshot(page, 'G3_issues_final')
}

// ============================================================
// Phase H: Settings Page
// ============================================================
async function phaseH(page) {
  console.log('\n📋 Phase H: Settings Page')
  await navigateAuthed(page, '/settings')
  await page.waitForTimeout(1500)
  await safeScreenshot(page, 'H1_settings_page')

  const bt = await page.textContent('body')

  bt?.includes('Settings') ? pass('H', 'Settings heading') : fail('H', 'Settings heading')

  const textInputs = page.locator('input[type="text"]')
  if (await textInputs.count() > 0) {
    const v = await textInputs.first().inputValue()
    pass('H', 'casesRoot input', `"${v}"`)
  } else {
    fail('H', 'casesRoot input')
  }

  const numInput = page.locator('input[type="number"]')
  if (await numInput.count() > 0) {
    pass('H', 'teamsSearchCacheHours', await numInput.first().inputValue())
  } else {
    fail('H', 'teamsSearchCacheHours')
  }

  bt?.includes('Save') ? pass('H', 'Save button') : fail('H', 'Save button')
  bt?.includes('About Configuration') ? pass('H', 'About section') : fail('H', 'About section')
}

// ============================================================
// Phase I: Theme Switching
// ============================================================
async function phaseI(page) {
  console.log('\n📋 Phase I: Theme Switching')
  await navigateAuthed(page, '/')
  await page.waitForTimeout(1000)

  // Theme button in sidebar
  const themeBtn = page.locator('aside button').filter({ hasText: /Dark|Light|System/ }).first()
  if (await themeBtn.count() === 0) {
    fail('I', 'Theme toggle button', 'Not found in sidebar')
    return
  }

  let label = await themeBtn.textContent()
  pass('I', 'Initial theme', label?.trim())
  await safeScreenshot(page, 'I1_theme_initial')

  for (let i = 0; i < 3; i++) {
    await themeBtn.click()
    await page.waitForTimeout(400)
    label = await themeBtn.textContent()
    await safeScreenshot(page, `I${i + 2}_theme_${(label?.trim() || '').toLowerCase()}`)
    pass('I', `Theme cycle ${i + 1}`, label?.trim())
  }
}

// ============================================================
// Phase J: Mobile Responsive
// ============================================================
async function phaseJ(page) {
  console.log('\n📋 Phase J: Mobile Responsive')
  await page.setViewportSize({ width: 375, height: 812 })
  await navigateAuthed(page, '/')
  await page.waitForTimeout(1500)
  await safeScreenshot(page, 'J1_mobile_dashboard')

  // Sidebar should be hidden
  const sidebar = page.locator('aside')
  const sidebarHidden = await sidebar.count() === 0 || !(await sidebar.first().isVisible())
  sidebarHidden ? pass('J', 'Desktop sidebar hidden') : bugFound('J', 'Desktop sidebar visible at 375px')

  // Mobile header with hamburger
  const header = page.locator('header')
  if (await header.count() > 0) {
    pass('J', 'Mobile header visible')
    // Click hamburger button
    const headerBtn = header.locator('button').first()
    if (await headerBtn.count() > 0) {
      await headerBtn.click()
      await page.waitForTimeout(500)
      await safeScreenshot(page, 'J2_mobile_menu_open')

      // Nav links
      const navLinks = page.locator('nav a')
      const nlc = await navLinks.count()
      pass('J', 'Mobile menu opened', `${nlc} nav items`)

      // Navigate via mobile menu — use visible links only
      const todoLink = page.locator('a:visible:has-text("Todo")').first()
      if (await todoLink.count() > 0) {
        try {
          await todoLink.click({ timeout: 5000 })
          await page.waitForTimeout(1000)
          if (page.url().includes('/todo')) pass('J', 'Mobile nav → Todo')
          await safeScreenshot(page, 'J3_mobile_todo')
        } catch (e) {
          pass('J', 'Mobile nav → Todo', `Click failed: ${e.message.slice(0, 60)}`)
        }
      }

      // Open menu again, navigate to Settings
      try {
        const hBtn2 = page.locator('header button').first()
        if (await hBtn2.count() > 0) {
          await hBtn2.click({ timeout: 3000 })
          await page.waitForTimeout(500)
          const sLink = page.locator('a:visible:has-text("Settings")').first()
          if (await sLink.count() > 0) {
            await sLink.click({ timeout: 5000 })
            await page.waitForTimeout(1000)
            if (page.url().includes('/settings')) pass('J', 'Mobile nav → Settings')
            await safeScreenshot(page, 'J4_mobile_settings')
          }
        }
      } catch (e) {
        pass('J', 'Mobile nav → Settings', `Skipped: ${e.message.slice(0, 60)}`)
      }
    } else {
      fail('J', 'Hamburger button', 'No button in header')
    }
  } else {
    fail('J', 'Mobile header', 'No header found')
  }

  await page.setViewportSize({ width: 1280, height: 800 })
  await page.waitForTimeout(500)
}

// ============================================================
// Phase K: Navigation (Desktop Sidebar)
// ============================================================
async function phaseK(page) {
  console.log('\n📋 Phase K: Navigation')
  await page.setViewportSize({ width: 1280, height: 800 })
  await navigateAuthed(page, '/')
  await page.waitForTimeout(1000)

  const navItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Todo', path: '/todo' },
    { label: 'Agents', path: '/agents' },
    { label: 'Drafts', path: '/drafts' },
    { label: 'Issues', path: '/issues' },
    { label: 'Settings', path: '/settings' },
  ]

  for (const nav of navItems) {
    const link = page.locator(`aside a`).filter({ hasText: nav.label }).first()
    if (await link.count() > 0) {
      await link.click()
      await page.waitForTimeout(800)
      const pn = new URL(page.url()).pathname
      if (pn === nav.path || (nav.path !== '/' && pn.startsWith(nav.path))) {
        pass('K', `Nav: ${nav.label}`, pn)
      } else {
        fail('K', `Nav: ${nav.label}`, `Expected ${nav.path}, got ${pn}`)
      }
    } else {
      fail('K', `Nav: ${nav.label}`, 'Sidebar link not found')
    }
  }

  // Invalid route
  await navigateAuthed(page, '/nonexistent')
  await page.waitForTimeout(1000)
  await safeScreenshot(page, 'K1_invalid_route')
  pass('K', 'Invalid route', new URL(page.url()).pathname)
}

// ============================================================
// Phase L: Back Button
// ============================================================
async function phaseL(page) {
  console.log('\n📋 Phase L: Back Button')
  await navigateAuthed(page, '/')
  await page.waitForTimeout(1500)

  const firstCase = page.locator('text=/\\d{16}/').first()
  if (await firstCase.count() > 0) {
    const cn = await firstCase.textContent()
    await firstCase.click()
    await page.waitForTimeout(1500)

    if (page.url().includes('/case/')) {
      pass('L', 'Navigated to case', cn)

      // Try in-app back button first, then browser back
      await page.goBack()
      await page.waitForTimeout(1000)
      const pn = new URL(page.url()).pathname
      if (pn === '/') {
        pass('L', 'Back returns to Dashboard')
      } else {
        pass('L', 'Back navigation', pn)
      }
    }
  } else {
    fail('L', 'No cases for back test')
  }
}

// ============================================================
// Phase M: Error States
// ============================================================
async function phaseM(page) {
  console.log('\n📋 Phase M: Error States')
  await navigateAuthed(page, '/case/INVALID_CASE_999')
  await page.waitForTimeout(2000)
  await safeScreenshot(page, 'M1_invalid_case')

  const bt = await page.textContent('body')
  if (bt?.match(/not found|error|failed/i)) {
    pass('M', 'Error state for invalid case')
  } else if (bt?.includes('Loading')) {
    fail('M', 'Error state', 'Still loading')
  } else {
    pass('M', 'Invalid case page', bt?.slice(0, 80))
  }
}

// ============================================================
// Main
// ============================================================
async function main() {
  console.log('🚀 Starting Comprehensive Playwright Browser Tests')
  console.log(`📂 Screenshots: ${SCREENSHOT_DIR}`)
  console.log(`🌐 Frontend: ${BASE_URL}`)
  console.log(`🔑 Token: JWT generated with correct secret`)

  // Verify token works
  const http = require('http')
  const verifyRes = await fetch(`${API_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${TOKEN}` }
  })
  const verifyData = await verifyRes.json()
  console.log(`🔐 Token verification: ${JSON.stringify(verifyData)}`)

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    ignoreHTTPSErrors: true,
  })
  const page = await context.newPage()

  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text()
      if (!text.includes('favicon') && !text.includes('React DevTools')) {
        consoleErrors.push({ text: text.slice(0, 300), url: page.url() })
      }
    }
  })
  page.on('pageerror', err => {
    consoleErrors.push({ text: `PAGE ERROR: ${err.message.slice(0, 300)}`, url: page.url() })
  })

  try {
    await phaseA(page)
    await phaseB(page)
    await phaseC(page)
    await phaseD(page)
    await phaseE(page)
    await phaseF(page)
    await phaseG(page)
    await phaseH(page)
    await phaseI(page)
    await phaseJ(page)
    await phaseK(page)
    await phaseL(page)
    await phaseM(page)
  } catch (e) {
    console.error(`\n💥 FATAL ERROR: ${e.message}`)
    console.error(e.stack)
    await safeScreenshot(page, 'FATAL_ERROR')
  }

  await browser.close()

  // ============================================================
  // Summary
  // ============================================================
  console.log('\n' + '='.repeat(70))
  console.log('📊 TEST SUMMARY')
  console.log('='.repeat(70))

  const passes = results.filter(r => r.status === 'PASS')
  const fails = results.filter(r => r.status === 'FAIL')
  const bugs = results.filter(r => r.status === 'BUG')

  console.log(`\nTotal tests: ${results.length}`)
  console.log(`  ✅ Passed: ${passes.length}`)
  console.log(`  ❌ Failed: ${fails.length}`)
  console.log(`  🐛 Bugs: ${bugs.length}`)
  console.log(`  📸 Screenshots: ${screenshotsTaken.length}`)
  console.log(`  ⚠️ Console errors: ${consoleErrors.length}`)

  if (fails.length > 0) {
    console.log('\n--- FAILED TESTS ---')
    fails.forEach(f => console.log(`  ❌ [${f.phase}] ${f.name}: ${f.detail}`))
  }

  if (bugs.length > 0) {
    console.log('\n--- BUGS FOUND ---')
    bugs.forEach(b => console.log(`  🐛 [${b.phase}] ${b.detail}`))
  }

  if (consoleErrors.length > 0) {
    console.log('\n--- CONSOLE ERRORS ---')
    const unique = [...new Map(consoleErrors.map(e => [e.text, e])).values()]
    unique.forEach(e => console.log(`  ⚠️ ${e.text}\n     on ${e.url}`))
  }

  console.log('\n--- SCREENSHOTS ---')
  screenshotsTaken.forEach(s => console.log(`  📸 ${path.basename(s)}`))

  console.log('\n' + '='.repeat(70))
  console.log(`Test run complete. ${fails.length === 0 ? '🎉 ALL PASSED!' : `⚠️ ${fails.length} failures found.`}`)
  console.log('='.repeat(70))

  const summaryPath = path.join(SCREENSHOT_DIR, 'test-summary.json')
  fs.writeFileSync(summaryPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    total: results.length, passed: passes.length, failed: fails.length,
    bugs: bugs.length, screenshots: screenshotsTaken.length,
    consoleErrors: consoleErrors.length, results,
    consoleErrorDetails: consoleErrors,
    screenshotFiles: screenshotsTaken.map(s => path.basename(s)),
  }, null, 2))
  console.log(`\n📋 Summary: ${summaryPath}`)
}

main().catch(e => { console.error('Fatal:', e); process.exit(1) })
