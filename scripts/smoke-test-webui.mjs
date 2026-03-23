#!/usr/bin/env node
/**
 * WebUI API Smoke Test
 * Usage: node scripts/smoke-test-webui.mjs [--base-url http://localhost:3010] [--password eb2026]
 */

const BASE_URL = process.argv.includes('--base-url')
  ? process.argv[process.argv.indexOf('--base-url') + 1]
  : 'http://localhost:3010'

const PASSWORD = process.argv.includes('--password')
  ? process.argv[process.argv.indexOf('--password') + 1]
  : 'eb2026'

let token = ''
let passed = 0
let failed = 0
const results = []

async function test(name, fn) {
  try {
    await fn()
    passed++
    results.push({ name, status: 'PASS' })
    console.log(`  ✅ ${name}`)
  } catch (e) {
    failed++
    results.push({ name, status: 'FAIL', error: e.message })
    console.log(`  ❌ ${name}: ${e.message}`)
  }
}

async function api(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  }
  if (token) opts.headers['Authorization'] = `Bearer ${token}`
  if (body) opts.body = JSON.stringify(body)

  const res = await fetch(`${BASE_URL}${path}`, opts)
  const text = await res.text()
  let data
  try { data = JSON.parse(text) } catch { data = text }
  return { status: res.status, data }
}

async function run() {
  console.log(`\n🔍 WebUI API Smoke Test — ${BASE_URL}\n`)

  // 1. Health
  await test('GET /api/health returns 200', async () => {
    const r = await api('GET', '/api/health')
    if (r.status !== 200) throw new Error(`status ${r.status}`)
  })

  // 2. Auth - wrong password
  await test('POST /api/auth/login rejects wrong password', async () => {
    const r = await api('POST', '/api/auth/login', { password: 'wrong' })
    if (r.status !== 401) throw new Error(`expected 401, got ${r.status}`)
  })

  // 3. Auth - correct password
  await test('POST /api/auth/login accepts correct password', async () => {
    const r = await api('POST', '/api/auth/login', { password: PASSWORD })
    if (r.status !== 200) throw new Error(`status ${r.status}`)
    if (!r.data?.token) throw new Error('no token in response')
    token = r.data.token
  })

  // 4. Unauthenticated access
  await test('GET /api/cases rejects without token', async () => {
    const saved = token; token = ''
    const r = await api('GET', '/api/cases')
    token = saved
    if (r.status !== 401) throw new Error(`expected 401, got ${r.status}`)
  })

  // 5. Cases list
  let firstCase = null
  await test('GET /api/cases returns cases array', async () => {
    const r = await api('GET', '/api/cases')
    if (r.status !== 200) throw new Error(`status ${r.status}`)
    if (!Array.isArray(r.data?.cases)) throw new Error('no cases array')
    console.log(`       (${r.data.cases.length} cases)`)
    if (r.data.cases.length > 0) firstCase = r.data.cases[0]
  })

  // 6. Case detail
  if (firstCase) {
    await test(`GET /api/cases/${firstCase.caseNumber} returns case info`, async () => {
      const r = await api('GET', `/api/cases/${firstCase.caseNumber}`)
      if (r.status !== 200) throw new Error(`status ${r.status}`)
      if (!r.data?.title) throw new Error('no title field')
    })

    // 7. Case info fields present (bug prevention check)
    await test(`Case ${firstCase.caseNumber} has status & severity fields`, async () => {
      const r = await api('GET', `/api/cases/${firstCase.caseNumber}`)
      if (typeof r.data?.status !== 'string') throw new Error(`status is ${typeof r.data?.status}`)
      if (typeof r.data?.severity !== 'string') throw new Error(`severity is ${typeof r.data?.severity}`)
    })
  }

  // 8. Case stats
  await test('GET /api/cases/stats returns stats', async () => {
    const r = await api('GET', '/api/cases/stats')
    if (r.status !== 200) throw new Error(`status ${r.status}`)
  })

  // 9. Invalid case number
  await test('GET /api/cases/invalid returns 400', async () => {
    const r = await api('GET', '/api/cases/invalid-case')
    if (r.status !== 400 && r.status !== 404) throw new Error(`expected 400/404, got ${r.status}`)
  })

  // 10. Settings
  await test('GET /api/settings returns config', async () => {
    const r = await api('GET', '/api/settings')
    if (r.status !== 200) throw new Error(`status ${r.status}`)
  })

  // 11. Todos
  await test('GET /api/todos/all returns todos', async () => {
    const r = await api('GET', '/api/todos/all')
    if (r.status !== 200) throw new Error(`status ${r.status}`)
  })

  // Summary
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed (${passed + failed} total)`)
  if (failed > 0) {
    console.log('\nFailed tests:')
    results.filter(r => r.status === 'FAIL').forEach(r => console.log(`  ❌ ${r.name}: ${r.error}`))
    process.exit(1)
  } else {
    console.log('✅ All tests passed!\n')
  }
}

run().catch(e => {
  console.error('Fatal error:', e.message)
  process.exit(1)
})
