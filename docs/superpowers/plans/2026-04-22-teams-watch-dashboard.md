# Teams Watch Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Teams Watch management UI + backend API to the Dashboard, with SBA bot Adaptive Card parsing and auto-patrol triggering.

**Architecture:** Shell-based wrapper pattern (same as daemon-reader.ts). Backend reads `$TEMP/teams-watch/*.json` state files and spawns `teams-daemon.sh` for process control. Graph API token from Token Daemon enables Adaptive Card content extraction. SBA patrol trigger runs as a 60s interval in the backend.

**Tech Stack:** Hono (backend), React + TypeScript + Tailwind (frontend), Playwright localStorage extraction (Graph token), Microsoft Graph API (chat message attachments)

**Spec:** `docs/superpowers/specs/2026-04-22-teams-watch-dashboard-design.md`

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `.claude/skills/browser-profiles/registry.json` | Modify | Add `graph` token entry |
| `dashboard/src/services/graph-token-reader.ts` | Create | Read Graph API token from Token Daemon cache |
| `dashboard/src/services/teams-watch-reader.ts` | Create | Read watch state files + spawn daemon scripts |
| `dashboard/src/services/sba-patrol-trigger.ts` | Create | SBA message detection + Adaptive Card parsing + patrol trigger |
| `dashboard/src/routes/teams-watch-routes.ts` | Create | REST API routes |
| `dashboard/src/types/index.ts` | Modify | Add SSE event type |
| `dashboard/src/index.ts` | Modify | Register routes + init SBA trigger |
| `dashboard/web/src/api/hooks.ts` | Modify | Add teams-watch API hooks |
| `dashboard/web/src/pages/AutomationsPage.tsx` | Modify | Implement TeamsWatchTab |

---

### Task 1: Add Graph Token to Browser Profiles Registry

**Files:**
- Modify: `.claude/skills/browser-profiles/registry.json`

This adds a `graph` entry to `registry.tokens`. The Token Daemon already iterates all entries in `registry.tokens` and handles `tokenSource: "localStorage"` generically via `extractFromLocalStorage()`. No code changes to `token-daemon.js` or `extract-token.js` are needed — the existing loop will pick up the new entry automatically. The token is extracted from the OWA tab's MSAL localStorage (same profile as `ui.owa`).

- [ ] **Step 1: Add graph token entry to registry.json**

In `.claude/skills/browser-profiles/registry.json`, add a new entry inside the `"tokens"` object, after the `"icm"` entry:

```json
    "graph": {
      "tab": "outlook.office.com",
      "startUrl": "https://outlook.office.com/mail/",
      "tokenSource": "localStorage",
      "tokenMatch": {
        "credentialType": "AccessToken",
        "targetIncludes": "graph.microsoft.com/Chat.Read"
      },
      "cacheFile": "$TEMP/graph-api-token.json",
      "cacheTTLMinutes": 55,
      "description": "Graph API token for Teams chat message attachments (Adaptive Card parsing)"
    }
```

- [ ] **Step 2: Verify registry.json is valid JSON**

Run: `python3 -c "import json; json.load(open('.claude/skills/browser-profiles/registry.json')); print('OK')"`
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/browser-profiles/registry.json
git commit -m "feat: add graph token entry to browser-profiles registry"
```

---

### Task 2: Graph Token Reader Service

**Files:**
- Create: `dashboard/src/services/graph-token-reader.ts`

Reads the Graph API token from `$TEMP/graph-api-token.json` (written by Token Daemon). Follows the same pattern as `daemon-reader.ts`'s `readJsonFile()`.

- [ ] **Step 1: Create graph-token-reader.ts**

```typescript
/**
 * graph-token-reader.ts — Read Graph API token cached by Token Daemon
 *
 * Cache file: $TEMP/graph-api-token.json
 * Format: { secret: string, expiresOn: string, fetchedAt: string }
 */
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const TEMP = process.env.TEMP || process.env.TMP || '/tmp'
const GRAPH_TOKEN_FILE = join(TEMP, 'graph-api-token.json')
const TOKEN_MARGIN_SECONDS = 120 // consider expired 2 min early

export interface GraphToken {
  secret: string
  expiresOn: number
  isValid: boolean
  remainSeconds: number
}

/**
 * Read the Graph API token from Token Daemon's cache file.
 * Returns null if file doesn't exist or is unparseable.
 */
export function readGraphToken(): GraphToken | null {
  if (!existsSync(GRAPH_TOKEN_FILE)) return null
  try {
    const raw = JSON.parse(readFileSync(GRAPH_TOKEN_FILE, 'utf-8'))
    const secret: string = raw.secret || ''
    const expiresOn = parseInt(raw.expiresOn || '0', 10)
    const now = Math.floor(Date.now() / 1000)
    const remainSeconds = expiresOn - now
    const isValid = secret.length > 100 && remainSeconds > TOKEN_MARGIN_SECONDS
    return { secret, expiresOn, isValid, remainSeconds }
  } catch {
    return null
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd dashboard && npx tsc --noEmit src/services/graph-token-reader.ts 2>&1 | head -5`
Expected: no errors (or only unrelated pre-existing errors)

- [ ] **Step 3: Commit**

```bash
git add dashboard/src/services/graph-token-reader.ts
git commit -m "feat: add graph-token-reader service"
```

---

### Task 3: Teams Watch Reader Service

**Files:**
- Create: `dashboard/src/services/teams-watch-reader.ts`

Reads `$TEMP/teams-watch/watch-*.json` (state files) and `$TEMP/teams-watch/daemon-*-config.json` (daemon configs). Provides `listWatches()`, `startWatch()`, `stopWatch()`, `getWatchHistory()`. Spawns `teams-daemon.sh` for start/stop.

- [ ] **Step 1: Create teams-watch-reader.ts**

```typescript
/**
 * teams-watch-reader.ts — Teams Watch state reader + process control
 *
 * Reads $TEMP/teams-watch/ state files and spawns teams-daemon.sh for management.
 * Pattern: same as daemon-reader.ts (shell-based wrapper).
 */
import { readFileSync, existsSync, readdirSync, unlinkSync } from 'fs'
import { join, resolve } from 'path'
import { execSync } from 'child_process'
import { config } from '../config.js'

const TEMP = process.env.TEMP || process.env.TMP || '/tmp'
const STATE_DIR = join(TEMP, 'teams-watch')

const DAEMON_SCRIPT = resolve(
  config.projectRoot,
  '.claude', 'skills', 'teams-watch', 'scripts', 'teams-daemon.sh'
)

const WATCH_TARGETS_FILE = resolve(
  config.projectRoot,
  '.claude', 'skills', 'teams-watch', 'watch-targets.json'
)

// ── Types ──

export interface ParsedCard {
  type: 'case-assignment' | 'unknown'
  caseNumber?: string
  assignedTo?: string
  severity?: string
  slaExpire?: string
  d365Url?: string
}

export interface WatchHistoryEntry {
  detectedAt: string
  messageTime: string
  from: string
  preview: string
  action: string
  actionResult: string
  parsedCard?: ParsedCard
}

export interface TeamsWatch {
  watchId: string
  topic: string
  chatId: string
  interval: number
  action: string
  status: 'running' | 'stopped'
  pid: number | null
  lastPollAt: string | null
  lastMessageFrom: string | null
  lastMessagePreview: string | null
  lastMessageId: string | null
  pollCount: number
  newMessageCount: number
  consecutiveErrors: number
  history: WatchHistoryEntry[]
}

// ── Helpers ──

function readJsonSafe<T>(filePath: string): T | null {
  if (!existsSync(filePath)) return null
  try {
    return JSON.parse(readFileSync(filePath, 'utf-8')) as T
  } catch {
    return null
  }
}

function isProcessAlive(pid: number): boolean {
  try {
    const out = execSync(`tasklist /FI "PID eq ${pid}" /NH`, {
      encoding: 'utf-8', timeout: 5000, stdio: ['pipe', 'pipe', 'pipe'],
    })
    return out.includes(String(pid))
  } catch {
    return false
  }
}

// ── Public API ──

/**
 * List all watches by scanning state files and daemon configs.
 */
export function listWatches(): TeamsWatch[] {
  if (!existsSync(STATE_DIR)) return []

  const watches: TeamsWatch[] = []
  const files = readdirSync(STATE_DIR).filter(f => f.startsWith('watch-') && f.endsWith('.json'))

  for (const file of files) {
    const state = readJsonSafe<any>(join(STATE_DIR, file))
    if (!state || !state.target) continue

    const watchId = state.watchId || file.replace('.json', '')
    const hash = watchId.replace('watch-', '')

    // Check daemon config for running status
    const daemonCfg = readJsonSafe<any>(join(STATE_DIR, `daemon-${hash}-config.json`))
    const pid = daemonCfg?.pid ?? null
    const alive = pid ? isProcessAlive(pid) : false

    watches.push({
      watchId,
      topic: state.target?.topic || '',
      chatId: state.target?.chatId || '',
      interval: daemonCfg?.interval ?? state.config?.interval ?? 0,
      action: daemonCfg?.action ?? state.config?.action ?? 'notify',
      status: alive ? 'running' : 'stopped',
      pid: alive ? pid : null,
      lastPollAt: state.state?.lastPollAt ?? null,
      lastMessageFrom: state.state?.lastMessageFrom ?? null,
      lastMessagePreview: state.state?.lastMessagePreview ?? null,
      lastMessageId: state.state?.lastMessageId ?? null,
      pollCount: state.state?.pollCount ?? 0,
      newMessageCount: state.state?.newMessageCount ?? 0,
      consecutiveErrors: state.state?.consecutiveErrors ?? 0,
      history: (state.history || []).slice(-20),
    })
  }

  return watches
}

/**
 * Start a watch daemon via teams-daemon.sh.
 * Returns the output from the script.
 */
export function startWatch(opts: {
  topic?: string
  chatId?: string
  interval?: number
  action?: string
}): string {
  const { topic, chatId, interval = 60, action = 'notify' } = opts
  if (!topic && !chatId) throw new Error('topic or chatId required')

  const args: string[] = ['start']
  if (topic) args.push('--topic', `"${topic}"`)
  if (chatId) args.push('--chat-id', `"${chatId}"`)
  args.push('--interval', String(interval))
  args.push('--action', action)

  try {
    const result = execSync(`bash "${DAEMON_SCRIPT}" ${args.join(' ')}`, {
      encoding: 'utf-8', timeout: 15000, stdio: ['pipe', 'pipe', 'pipe'],
    })
    return result.trim()
  } catch (e: any) {
    return `ERROR: ${e.message?.substring(0, 200)}`
  }
}

/**
 * Stop a watch daemon.
 */
export function stopWatch(watchId: string): string {
  // Find the topic from state file
  const hash = watchId.replace('watch-', '')
  const stateFile = join(STATE_DIR, `${watchId}.json`)
  const state = readJsonSafe<any>(stateFile)
  const topic = state?.target?.topic

  const args: string[] = ['stop']
  if (topic) args.push('--topic', `"${topic}"`)

  try {
    return execSync(`bash "${DAEMON_SCRIPT}" ${args.join(' ')}`, {
      encoding: 'utf-8', timeout: 10000, stdio: ['pipe', 'pipe', 'pipe'],
    }).trim()
  } catch (e: any) {
    return `ERROR: ${e.message?.substring(0, 200)}`
  }
}

/**
 * Delete a watch (stop + remove state files).
 */
export function deleteWatch(watchId: string): boolean {
  stopWatch(watchId)
  const hash = watchId.replace('watch-', '')
  const filesToRemove = [
    join(STATE_DIR, `${watchId}.json`),
    join(STATE_DIR, `daemon-${hash}-config.json`),
    join(STATE_DIR, `daemon-${hash}.log`),
    join(STATE_DIR, 'pids', `${watchId}.pid`),
  ]
  for (const f of filesToRemove) {
    try { if (existsSync(f)) unlinkSync(f) } catch {}
  }
  return true
}

/**
 * Get history for a specific watch.
 */
export function getWatchHistory(watchId: string): WatchHistoryEntry[] {
  const stateFile = join(STATE_DIR, `${watchId}.json`)
  const state = readJsonSafe<any>(stateFile)
  return (state?.history || []) as WatchHistoryEntry[]
}

/**
 * Read SBA watch target config.
 */
export function getSbaTarget(): { chatId: string; displayName: string } | null {
  const targets = readJsonSafe<any>(WATCH_TARGETS_FILE)
  const sba = targets?.targets?.sba
  if (!sba?.chatId) return null
  return { chatId: sba.chatId, displayName: sba.displayName || 'SBAManager Bot' }
}

/**
 * Find watch by chatId.
 */
export function findWatchByChatId(chatId: string): TeamsWatch | null {
  const watches = listWatches()
  return watches.find(w => w.chatId === chatId) ?? null
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd dashboard && npx tsc --noEmit src/services/teams-watch-reader.ts 2>&1 | head -10`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add dashboard/src/services/teams-watch-reader.ts
git commit -m "feat: add teams-watch-reader service"
```

---

### Task 4: SBA Adaptive Card Parser + Patrol Trigger

**Files:**
- Create: `dashboard/src/services/sba-patrol-trigger.ts`
- Modify: `dashboard/src/types/index.ts`

The SBA patrol trigger runs a 60s `setInterval`. It reads the SBA watch state file, detects new messages, fetches Adaptive Card content via Graph API, parses case assignment info, and triggers patrol if assigned to the current engineer.

- [ ] **Step 1: Add SSE event type to types/index.ts**

In `dashboard/src/types/index.ts`, add `'teams-watch-update'` to the `SSEEventType` union, right before the closing of the type:

```typescript
  | 'agent-completed'
  | 'teams-watch-update'
```

- [ ] **Step 2: Create sba-patrol-trigger.ts**

```typescript
/**
 * sba-patrol-trigger.ts — SBA case assignment detection + patrol trigger
 *
 * Polls the SBA watch state file every 60s. When newMessageCount increases:
 * 1. Fetch message via Graph API (gets Adaptive Card content)
 * 2. Parse card for case number, assigned-to, severity
 * 3. If assigned to current engineer → trigger patrol
 * 4. Push SSE notification
 */
import { readGraphToken } from './graph-token-reader.js'
import { getSbaTarget, findWatchByChatId, type ParsedCard } from './teams-watch-reader.js'
import { config } from '../config.js'
import { sseManager } from '../watcher/sse-manager.js'

// Lazy import to avoid circular deps
let _runSdkPatrol: ((force: boolean, mode: string) => Promise<any>) | null = null
let _isSdkPatrolRunning: (() => boolean) | null = null

async function getPatrolFns() {
  if (!_runSdkPatrol) {
    const mod = await import('../agent/patrol-orchestrator.js')
    _runSdkPatrol = mod.runSdkPatrol
    _isSdkPatrolRunning = mod.isSdkPatrolRunning
  }
  return { runSdkPatrol: _runSdkPatrol!, isSdkPatrolRunning: _isSdkPatrolRunning! }
}

// ── State ──
let lastKnownMessageCount = -1  // -1 = not initialized
let lastProcessedMessageId = ''
let triggerInterval: NodeJS.Timeout | null = null
let lastCheckAt: string | null = null
let lastAssignment: { caseNumber: string; assignedTo: string; detectedAt: string } | null = null

// ── Adaptive Card Parser ──

export function parseSbaCard(card: any): ParsedCard | null {
  if (!card?.body || !Array.isArray(card.body)) return null

  const facts = card.body
    .find((b: any) => b.type === 'FactSet')
    ?.facts || []

  const caseNumber = facts.find((f: any) => f.title === 'SR')?.value || ''
  const severity = facts.find((f: any) => f.title === 'Severity')?.value || ''
  const slaExpire = facts.find((f: any) => f.title === 'Sla Expire Date')?.value || ''

  const assignText = card.body
    .find((b: any) => b.type === 'TextBlock' && b.text?.includes('assigned'))
    ?.text || ''
  const assignedTo = assignText.match(/\*\*(.+?)\*\*/)?.[1] || ''

  // DfM URL from ActionSet
  const actions = card.body
    .flatMap((b: any) => b.actions || [])
  const d365Url = actions.find((a: any) => a.title === 'DfM')?.url || ''

  if (!caseNumber) return null

  return {
    type: 'case-assignment',
    caseNumber,
    assignedTo,
    severity,
    slaExpire,
    d365Url,
  }
}

// ── Graph API fetch ──

async function fetchRecentMessages(chatId: string, token: string, top = 5): Promise<any[]> {
  const url = `https://graph.microsoft.com/v1.0/me/chats/${encodeURIComponent(chatId)}/messages?$top=${top}`
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) {
      console.warn(`[sba-trigger] Graph API ${res.status}: ${res.statusText}`)
      return []
    }
    const data = await res.json()
    return data.value || []
  } catch (e: any) {
    console.warn(`[sba-trigger] Graph API error: ${e.message}`)
    return []
  }
}

// ── Main check loop ──

async function checkForNewAssignments() {
  lastCheckAt = new Date().toISOString()

  const sbaTarget = getSbaTarget()
  if (!sbaTarget) return // SBA target not configured

  const watch = findWatchByChatId(sbaTarget.chatId)
  if (!watch) return // SBA watch not active

  // Initialize on first run
  if (lastKnownMessageCount < 0) {
    lastKnownMessageCount = watch.newMessageCount
    lastProcessedMessageId = watch.lastMessageId || ''
    return
  }

  // No new messages
  if (watch.newMessageCount <= lastKnownMessageCount &&
      watch.lastMessageId === lastProcessedMessageId) {
    return
  }

  console.log(`[sba-trigger] New message detected (count: ${lastKnownMessageCount} → ${watch.newMessageCount})`)
  lastKnownMessageCount = watch.newMessageCount

  // Deduplicate: skip if we already processed this message
  if (watch.lastMessageId === lastProcessedMessageId) return
  lastProcessedMessageId = watch.lastMessageId || ''

  // Try to fetch and parse Adaptive Card via Graph API
  const graphToken = readGraphToken()
  let parsedCard: ParsedCard | null = null

  if (graphToken?.isValid) {
    const messages = await fetchRecentMessages(sbaTarget.chatId, graphToken.secret, 5)
    for (const msg of messages) {
      const attachments = msg.attachments || []
      const cardAtt = attachments.find((a: any) =>
        a.contentType === 'application/vnd.microsoft.card.adaptive'
      )
      if (cardAtt?.content) {
        try {
          const card = typeof cardAtt.content === 'string'
            ? JSON.parse(cardAtt.content)
            : cardAtt.content
          parsedCard = parseSbaCard(card)
          if (parsedCard) break
        } catch {}
      }
    }
  } else {
    console.warn('[sba-trigger] Graph token unavailable, skipping card parsing')
  }

  // SSE broadcast
  sseManager.broadcast('teams-watch-update', {
    watchId: watch.watchId,
    topic: watch.topic,
    newMessages: watch.newMessageCount - (lastKnownMessageCount - 1),
    latestFrom: watch.lastMessageFrom || 'unknown',
    latestPreview: watch.lastMessagePreview || '',
    parsedCard: parsedCard ?? undefined,
    patrolTriggered: false, // updated below if triggered
  })

  // Trigger patrol if assigned to current engineer
  if (parsedCard?.type === 'case-assignment' && parsedCard.assignedTo) {
    const engineerName = config.engineerName
    if (parsedCard.assignedTo.toLowerCase().includes(engineerName.toLowerCase())) {
      console.log(`[sba-trigger] Case ${parsedCard.caseNumber} assigned to ${parsedCard.assignedTo} → triggering patrol`)

      lastAssignment = {
        caseNumber: parsedCard.caseNumber!,
        assignedTo: parsedCard.assignedTo,
        detectedAt: new Date().toISOString(),
      }

      const { runSdkPatrol, isSdkPatrolRunning } = await getPatrolFns()
      if (!isSdkPatrolRunning()) {
        runSdkPatrol(true, 'normal').catch(err => {
          console.error(`[sba-trigger] Patrol failed: ${err.message}`)
        })
        // Re-broadcast with patrolTriggered=true
        sseManager.broadcast('teams-watch-update', {
          watchId: watch.watchId,
          topic: watch.topic,
          parsedCard,
          patrolTriggered: true,
        })
      } else {
        console.log('[sba-trigger] Patrol already running, skipped')
      }
    }
  }
}

// ── Init / Cleanup ──

export function initSbaPatrolTrigger() {
  if (triggerInterval) return
  console.log('[sba-trigger] Initialized (60s interval)')
  triggerInterval = setInterval(() => {
    checkForNewAssignments().catch(err => {
      console.error(`[sba-trigger] Check error: ${err.message}`)
    })
  }, 60_000)
  // First check after 10s (let daemon start up first)
  setTimeout(() => checkForNewAssignments().catch(() => {}), 10_000)
}

export function stopSbaPatrolTrigger() {
  if (triggerInterval) {
    clearInterval(triggerInterval)
    triggerInterval = null
  }
}

export function getSbaPatrolStatus() {
  return {
    active: triggerInterval !== null,
    lastCheckAt,
    lastAssignment,
    lastKnownMessageCount,
  }
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd dashboard && npx tsc --noEmit src/services/sba-patrol-trigger.ts 2>&1 | head -10`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add dashboard/src/services/sba-patrol-trigger.ts dashboard/src/types/index.ts
git commit -m "feat: add SBA patrol trigger with Adaptive Card parser"
```

---

### Task 5: Backend API Routes

**Files:**
- Create: `dashboard/src/routes/teams-watch-routes.ts`
- Modify: `dashboard/src/index.ts`

- [ ] **Step 1: Create teams-watch-routes.ts**

```typescript
/**
 * teams-watch-routes.ts — Teams Watch management API
 *
 * GET  /api/teams-watch              — list all watches
 * POST /api/teams-watch              — create/start a watch
 * DELETE /api/teams-watch/:id        — delete a watch
 * POST /api/teams-watch/:id/start    — start a stopped watch
 * POST /api/teams-watch/:id/stop     — stop a running watch
 * GET  /api/teams-watch/:id/history  — get message history
 * GET  /api/teams-watch/sba/status   — SBA trigger status
 */
import { Hono } from 'hono'
import {
  listWatches,
  startWatch,
  stopWatch,
  deleteWatch,
  getWatchHistory,
} from '../services/teams-watch-reader.js'
import { getSbaPatrolStatus } from '../services/sba-patrol-trigger.js'

const teamsWatchRoutes = new Hono()

// List all watches
teamsWatchRoutes.get('/', (c) => {
  const watches = listWatches()
  return c.json({ watches, total: watches.length })
})

// SBA trigger status (must be before /:id to avoid matching "sba" as id)
teamsWatchRoutes.get('/sba/status', (c) => {
  return c.json(getSbaPatrolStatus())
})

// Create/start a new watch
teamsWatchRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json<{
      topic?: string
      chatId?: string
      interval?: number
      action?: string
    }>()
    if (!body.topic && !body.chatId) {
      return c.json({ error: 'topic or chatId required' }, 400)
    }
    const result = startWatch(body)
    return c.json({ ok: true, result })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// Delete a watch
teamsWatchRoutes.delete('/:id', (c) => {
  const id = c.req.param('id')
  const ok = deleteWatch(id)
  return c.json({ ok })
})

// Start a stopped watch
teamsWatchRoutes.post('/:id/start', async (c) => {
  const id = c.req.param('id')
  const watches = listWatches()
  const watch = watches.find(w => w.watchId === id)
  if (!watch) return c.json({ error: 'Watch not found' }, 404)

  const result = startWatch({
    topic: watch.topic || undefined,
    chatId: watch.chatId || undefined,
    interval: watch.interval || 60,
    action: watch.action || 'notify',
  })
  return c.json({ ok: true, result })
})

// Stop a running watch
teamsWatchRoutes.post('/:id/stop', (c) => {
  const id = c.req.param('id')
  const result = stopWatch(id)
  return c.json({ ok: true, result })
})

// Get message history
teamsWatchRoutes.get('/:id/history', (c) => {
  const id = c.req.param('id')
  const history = getWatchHistory(id)
  return c.json({ history, total: history.length })
})

export default teamsWatchRoutes
```

- [ ] **Step 2: Register routes in index.ts**

In `dashboard/src/index.ts`, add the import at the top with other route imports (after the `actionsRoutes` import around line 62):

```typescript
import teamsWatchRoutes from './routes/teams-watch-routes.js'
import { initSbaPatrolTrigger } from './services/sba-patrol-trigger.js'
```

Add auth middleware (after the `app.use('/api/actions', authMiddleware)` line around line 109):

```typescript
app.use('/api/teams-watch', authMiddleware)
app.use('/api/teams-watch/*', authMiddleware)
```

Add route registration (after the `app.route('/api/actions', actionsRoutes)` line around line 128):

```typescript
app.route('/api/teams-watch', teamsWatchRoutes)
```

Add SBA trigger init (after the `startAzProfileMonitor` block, around line 171):

```typescript
// Initialize SBA patrol trigger (monitors Teams Watch for new case assignments)
initSbaPatrolTrigger()
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd dashboard && npx tsc --noEmit 2>&1 | tail -5`
Expected: no new errors

- [ ] **Step 4: Commit**

```bash
git add dashboard/src/routes/teams-watch-routes.ts dashboard/src/index.ts
git commit -m "feat: add teams-watch API routes and register in server"
```

---

### Task 6: Frontend API Hooks

**Files:**
- Modify: `dashboard/web/src/api/hooks.ts`

- [ ] **Step 1: Add teams-watch hooks**

Add the following at the end of `dashboard/web/src/api/hooks.ts`, before any closing brackets:

```typescript
// ---- Teams Watch hooks ----

export function useTeamsWatches() {
  return useQuery({
    queryKey: ['teams-watch'],
    queryFn: () => apiGet<{ watches: any[]; total: number }>('/teams-watch'),
    refetchInterval: 15_000,
  })
}

export function useTeamsWatchHistory(watchId: string | null) {
  return useQuery({
    queryKey: ['teams-watch', watchId, 'history'],
    queryFn: () => apiGet<{ history: any[]; total: number }>(`/teams-watch/${watchId}/history`),
    enabled: !!watchId,
  })
}

export function useSbaStatus() {
  return useQuery({
    queryKey: ['teams-watch', 'sba', 'status'],
    queryFn: () => apiGet<any>('/teams-watch/sba/status'),
    refetchInterval: 30_000,
  })
}

export function useCreateTeamsWatch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { topic?: string; chatId?: string; interval?: number; action?: string }) =>
      apiPost<any>('/teams-watch', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams-watch'] })
    },
  })
}

export function useStartTeamsWatch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiPost<any>(`/teams-watch/${id}/start`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams-watch'] })
    },
  })
}

export function useStopTeamsWatch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiPost<any>(`/teams-watch/${id}/stop`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams-watch'] })
    },
  })
}

export function useDeleteTeamsWatch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiDelete<any>(`/teams-watch/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams-watch'] })
    },
  })
}
```

- [ ] **Step 2: Verify frontend compiles**

Run: `cd dashboard/web && npx tsc --noEmit 2>&1 | tail -5`
Expected: no new errors

- [ ] **Step 3: Commit**

```bash
git add dashboard/web/src/api/hooks.ts
git commit -m "feat: add teams-watch frontend API hooks"
```

---

### Task 7: Frontend TeamsWatchTab Implementation

**Files:**
- Modify: `dashboard/web/src/pages/AutomationsPage.tsx`

Replace the `TeamsWatchTab` placeholder with the full implementation. Layout follows the CronJobsTab pattern: left list + right detail panel.

- [ ] **Step 1: Replace TeamsWatchTab in AutomationsPage.tsx**

Replace the entire `function TeamsWatchTab()` component (lines 560-580) with the full implementation. The component is self-contained within AutomationsPage.tsx (no new files needed, consistent with CronJobsTab pattern).

The implementation should include:
- `TeamsWatchTab`: orchestrator with state for selectedWatchId
- Left panel: list of watches with status icons (🟢/🔴), topic, interval, action, control buttons (start/stop/delete)
- Right panel: selected watch detail + message history with Adaptive Card rendering
- Add Watch dialog (inline form, not a separate component)
- Import and use the hooks from Task 6: `useTeamsWatches`, `useTeamsWatchHistory`, `useStartTeamsWatch`, `useStopTeamsWatch`, `useDeleteTeamsWatch`, `useCreateTeamsWatch`

Key UI elements:
- Watch list items show: status dot (🟢 running / 🔴 stopped), topic, `{interval}s`, action type, poll count
- Control buttons: Play/Stop toggle, Trash (with confirm), Pencil (future edit)
- Detail panel header: topic, chatId (truncated), interval, action, poll/new counts
- History section: reverse chronological, each entry shows timestamp + from + preview
- For `parsedCard` entries (SBA assignments): render as a highlighted card showing SR number, severity, assigned-to, SLA, patrol status
- Use existing UI primitives: `Card`, `Badge`, `Loading`, `EmptyState` from `../components/common/`
- Icons from lucide-react: `Play`, `Square`, `Trash2`, `Plus`, `RefreshCw`, `Eye`, `Bell`

The component should follow the exact same patterns as `CronJobsTab` for consistency: inline styles using CSS variables (`var(--text-primary)`, `var(--bg-surface)`, etc.), hover states via onMouseEnter/Leave, and responsive grid layout.

- [ ] **Step 2: Also update the tab count**

In the `tabs` array definition inside `AutomationsPage`, update the Teams Watch tab entry to include the watch count:

```typescript
{ key: 'teams-watch', label: 'Teams Watch', icon: '👁️', count: teamsWatchData?.watches?.length },
```

This requires moving the `useTeamsWatches()` hook call from inside `TeamsWatchTab` to the parent `AutomationsPage` component, or adding a separate count query.

- [ ] **Step 3: Verify frontend compiles and renders**

Run: `cd dashboard/web && npx tsc --noEmit 2>&1 | tail -10`
Expected: no errors

- [ ] **Step 4: Manual smoke test**

1. Start dashboard: `cd dashboard && npm run dev`
2. Open `http://localhost:5173` → Automations page → Teams Watch tab
3. Verify: watch list shows (if any daemons running), Add button works, start/stop toggles

- [ ] **Step 5: Commit**

```bash
git add dashboard/web/src/pages/AutomationsPage.tsx
git commit -m "feat: implement TeamsWatchTab UI with watch list and detail panel"
```

---

### Task 8: Integration Test — End-to-End Smoke

**Files:** None (manual verification)

- [ ] **Step 1: Ensure Token Daemon is running with graph token**

Run: `node .claude/skills/browser-profiles/scripts/token-daemon.js status`
Expected: should show `graph` token in the output. If not, run `node .claude/skills/browser-profiles/scripts/token-daemon.js warmup` to restart daemon with the new registry entry.

- [ ] **Step 2: Start SBA watch daemon**

Run: `bash .claude/skills/teams-watch/scripts/teams-daemon.sh start --chat-id "19:deeeb1e6-0c83-4151-9662-fe56143e83d4_9c20e562-eb23-4bbd-a65c-23684d386825@unq.gbl.spaces" --interval 60 --action notify`
Expected: `DAEMON_STARTED|topic=...|pid=...|interval=60s|action=notify`

- [ ] **Step 3: Verify backend API returns watches**

Run: `curl -s http://localhost:3010/api/teams-watch | python3 -m json.tool | head -20`
Expected: JSON with `watches` array containing the SBA watch

- [ ] **Step 4: Verify SBA status endpoint**

Run: `curl -s http://localhost:3010/api/teams-watch/sba/status | python3 -m json.tool`
Expected: JSON with `active: true`, `lastCheckAt`, etc.

- [ ] **Step 5: Verify Dashboard UI**

Open browser → Automations → Teams Watch tab → verify SBA watch appears with correct status

- [ ] **Step 6: Commit final state**

```bash
git add -A
git commit -m "feat: teams-watch dashboard integration complete"
```
