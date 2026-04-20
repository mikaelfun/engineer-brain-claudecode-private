/**
 * test-runner.ts — Runner lifecycle API for Test Lab
 *
 * Endpoints:
 *   POST /api/tests/runner/start  — Spawn a test-supervisor run session (single or loop)
 *   POST /api/tests/runner/stop   — Inject pause directive (safe stop)
 *   GET  /api/tests/runner/status — Current runner status
 */
import { Hono } from 'hono'
import { query, type Options } from '@anthropic-ai/claude-agent-sdk'
import { readDirectives, writeDirectives, readTestState, readPipeline, readSupervisor } from '../services/test-reader.js'
import { config } from '../config.js'
import { sseManager } from '../watcher/sse-manager.js'
import { sdkRegistry } from '../agent/sdk-session-registry.js'
import type { SSEEventType } from '../types/index.js'

const testRunnerRoutes = new Hono()

// ---- Runner State ----

interface RunnerState {
  status: 'idle' | 'running' | 'paused' | 'waiting'
  sessionId: string | null
  startedAt: string | null
  lastRunAt: string | null
  abortController: AbortController | null
  // Loop state
  loop: boolean
  intervalMinutes: number
  runsCompleted: number
  nextRunAt: string | null
  waitTimer: ReturnType<typeof setTimeout> | null
}

const runnerState: RunnerState = {
  status: 'idle',
  sessionId: null,
  startedAt: null,
  lastRunAt: null,
  abortController: null,
  loop: false,
  intervalMinutes: 5,
  runsCompleted: 0,
  nextRunAt: null,
  waitTimer: null,
}

function broadcastRunnerStatus() {
  sseManager.broadcast('runner-status-changed' as SSEEventType, {
    status: runnerState.status,
    sessionId: runnerState.sessionId,
    startedAt: runnerState.startedAt,
    lastRunAt: runnerState.lastRunAt,
    loop: runnerState.loop,
    intervalMinutes: runnerState.intervalMinutes,
    runsCompleted: runnerState.runsCompleted,
    nextRunAt: runnerState.nextRunAt,
  })
}

/** Run one test-supervisor session. Returns normally on completion, throws on error/abort. */
async function runOnce(ac: AbortController): Promise<void> {
  const projectRoot = config.projectRoot
  let firstMessage = true
  const registryHandle = sdkRegistry.register({ source: 'test', context: 'test-supervisor', intent: 'Test supervisor run' })
  try {
    for await (const message of query({
      prompt: '执行一轮监督式测试循环。读取 .claude/agents/test-supervisor-runner.md 获取步骤。',
      options: {
        abortController: ac,
        cwd: projectRoot,
        settingSources: ['user'] as Options['settingSources'],
        permissionMode: 'bypassPermissions',
        allowDangerouslySkipPermissions: true,
      },
    })) {
      registryHandle.onMessage(message)
      if (firstMessage) {
        const msg = message as Record<string, unknown>
        if (msg.session_id) {
          runnerState.sessionId = msg.session_id as string
        }
        firstMessage = false
      }
    }
    registryHandle.complete()
  } catch (err) {
    registryHandle.fail((err as Error)?.message || 'unknown error')
    throw err
  }
}

/** Sleep that respects abort. Returns true if slept fully, false if aborted. */
function sleepWithAbort(ms: number, ac: AbortController): Promise<boolean> {
  return new Promise((resolve) => {
    if (ac.signal.aborted) { resolve(false); return }
    const timer = setTimeout(() => {
      runnerState.waitTimer = null
      resolve(true)
    }, ms)
    runnerState.waitTimer = timer
    ac.signal.addEventListener('abort', () => {
      clearTimeout(timer)
      runnerState.waitTimer = null
      resolve(false)
    }, { once: true })
  })
}

/** Main runner loop — runs once or loops based on runnerState.loop */
async function runnerLoop(ac: AbortController) {
  try {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      // Clear pause directives before each run
      const directives = readDirectives()
      const filtered = directives.filter(d => !(d.type === 'pause' && d.status === 'pending'))
      if (filtered.length !== directives.length) {
        writeDirectives(filtered)
      }

      const runStartedAt = Date.now()
      runnerState.status = 'running'
      runnerState.sessionId = null
      runnerState.nextRunAt = null
      broadcastRunnerStatus()

      await runOnce(ac)

      runnerState.runsCompleted++
      runnerState.lastRunAt = new Date().toISOString()
      runnerState.sessionId = null

      // If not looping, we're done
      if (!runnerState.loop) break

      // Check if aborted during the run
      if (ac.signal.aborted) break

      // Wait for remaining interval (measured from run START, not end)
      const intervalMs = runnerState.intervalMinutes * 60 * 1000
      const elapsed = Date.now() - runStartedAt
      const remainingMs = Math.max(0, intervalMs - elapsed)

      if (remainingMs > 0) {
        runnerState.status = 'waiting'
        runnerState.nextRunAt = new Date(Date.now() + remainingMs).toISOString()
        broadcastRunnerStatus()

        console.log(`[test-runner] Loop: run took ${Math.round(elapsed/1000)}s, waiting ${Math.round(remainingMs/1000)}s before next run`)
        const sleptFully = await sleepWithAbort(remainingMs, ac)
        if (!sleptFully) break
      } else {
        console.log(`[test-runner] Loop: run took ${Math.round(elapsed/1000)}s (>= interval ${runnerState.intervalMinutes}m), starting next immediately`)
      }
    }

    // Normal completion
    runnerState.status = 'idle'
    runnerState.sessionId = null
    runnerState.abortController = null
    runnerState.nextRunAt = null
    runnerState.waitTimer = null
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error('[test-runner] Runner session error:', errorMsg)
    if (errorMsg.includes('abort')) {
      runnerState.status = 'paused'
    } else {
      // On error in loop mode, don't crash — log and continue
      if (runnerState.loop && !ac.signal.aborted) {
        console.error('[test-runner] Error in loop run, will retry after interval')
        runnerState.runsCompleted++
        runnerState.lastRunAt = new Date().toISOString()
        runnerState.sessionId = null

        const waitMs = runnerState.intervalMinutes * 60 * 1000
        runnerState.status = 'waiting'
        runnerState.nextRunAt = new Date(Date.now() + waitMs).toISOString()
        broadcastRunnerStatus()

        const sleptFully = await sleepWithAbort(waitMs, ac)
        if (sleptFully) {
          // Retry the loop
          return runnerLoop(ac)
        }
        runnerState.status = 'paused'
      } else {
        runnerState.status = 'idle'
      }
    }
    runnerState.sessionId = null
    runnerState.abortController = null
    runnerState.nextRunAt = null
    runnerState.waitTimer = null
  }
  broadcastRunnerStatus()
}

// POST /start — Spawn runner session (single or loop)
testRunnerRoutes.post('/start', async (c) => {
  if (runnerState.status === 'running') {
    return c.json({ error: 'Runner 已在运行中', status: runnerState.status }, 409)
  }

  // Parse loop options from body
  let loop = false
  let intervalMinutes = 5
  try {
    const body = await c.req.json().catch(() => ({}))
    if (body.loop === true) loop = true
    if (typeof body.intervalMinutes === 'number' && body.intervalMinutes >= 1) {
      intervalMinutes = Math.min(body.intervalMinutes, 60)
    }
  } catch { /* no body = single run */ }

  const ac = new AbortController()
  runnerState.status = 'running'
  runnerState.startedAt = new Date().toISOString()
  runnerState.abortController = ac
  runnerState.loop = loop
  runnerState.intervalMinutes = intervalMinutes
  runnerState.runsCompleted = 0
  runnerState.nextRunAt = null
  runnerState.waitTimer = null
  broadcastRunnerStatus()

  // Spawn in background — don't await
  runnerLoop(ac)

  return c.json({
    status: 'started',
    loop,
    intervalMinutes: loop ? intervalMinutes : null,
    startedAt: runnerState.startedAt,
  })
})

// POST /stop — Inject pause directive (safe stop)
testRunnerRoutes.post('/stop', async (c) => {
  // Handle external CLI run: memory says idle but files say running
  if (runnerState.status === 'idle') {
    const supervisor = readSupervisor()
    const pipeline = readPipeline()
    const isSupActive = supervisor && ACTIVE_SUPERVISOR_STATUSES.has(supervisor.status)
    const isPipeActive = pipeline?.pipelineStatus === 'running'

    if (isSupActive || isPipeActive) {
      // External run detected — inject pause directive for CLI supervisor to pick up
      const directives = readDirectives()
      directives.push({
        type: 'pause',
        status: 'pending',
        createdAt: new Date().toISOString(),
        source: 'webui-external-stop',
      })
      writeDirectives(directives)
      broadcastRunnerStatus()
      return c.json({ status: 'stopping', source: 'external' })
    }
    return c.json({ error: 'Runner 未在运行', status: runnerState.status }, 409)
  }

  if (runnerState.status !== 'running' && runnerState.status !== 'waiting') {
    return c.json({ error: 'Runner 未在运行', status: runnerState.status }, 409)
  }

  // Write pause directive for stage-worker to read at next check
  const directives = readDirectives()
  directives.push({
    type: 'pause',
    status: 'pending',
    createdAt: new Date().toISOString(),
    source: 'webui-runner-stop',
  })
  writeDirectives(directives)

  // Abort the SDK session / wait timer
  if (runnerState.abortController) {
    try { runnerState.abortController.abort() } catch { /* ignore */ }
  }

  runnerState.status = 'paused'
  runnerState.lastRunAt = new Date().toISOString()
  runnerState.sessionId = null
  runnerState.abortController = null
  runnerState.loop = false
  runnerState.nextRunAt = null
  runnerState.waitTimer = null
  broadcastRunnerStatus()

  return c.json({ status: 'stopping' })
})

// Supervisor statuses that indicate an active external run
const ACTIVE_SUPERVISOR_STATUSES = new Set([
  'running', 'scanning', 'generating', 'testing', 'fixing', 'verifying',
])

// GET /status — Current runner status
testRunnerRoutes.get('/status', (c) => {
  const pipeline = readPipeline()
  const state = !pipeline ? readTestState() : null

  // Detect external CLI run: memory says idle but files say running
  // Check both supervisor.json AND pipeline.json — CLI supervisor may not
  // update supervisor.json status, but stage-worker always updates pipeline.json
  let effectiveStatus: string = runnerState.status
  let source: string | null = null
  let supervisorStatus: string | null = null

  if (runnerState.status === 'idle') {
    const supervisor = readSupervisor()
    const isSupActive = supervisor && ACTIVE_SUPERVISOR_STATUSES.has(supervisor.status)
    const isPipeActive = pipeline?.pipelineStatus === 'running'

    if (isSupActive || isPipeActive) {
      effectiveStatus = 'external'
      source = 'cli'
      supervisorStatus = isSupActive ? supervisor!.status : (pipeline?.currentStage || 'running')
    }
  }

  return c.json({
    status: effectiveStatus,
    source,
    supervisorStatus,
    sessionId: runnerState.sessionId,
    startedAt: runnerState.startedAt,
    lastRunAt: runnerState.lastRunAt,
    // New pipeline model fields
    currentStage: pipeline?.currentStage || state?.phase || null,
    currentCycle: pipeline?.cycle || state?.round || null,
    // Legacy compat (same data, old names)
    currentPhase: pipeline?.currentStage || state?.phase || null,
    currentRound: pipeline?.cycle || state?.round || null,
    // Loop info
    loop: runnerState.loop,
    intervalMinutes: runnerState.intervalMinutes,
    runsCompleted: runnerState.runsCompleted,
    nextRunAt: runnerState.nextRunAt,
  })
})

export default testRunnerRoutes
