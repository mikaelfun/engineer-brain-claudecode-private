/**
 * test-runner.ts — Runner lifecycle API for Test Lab
 *
 * Endpoints:
 *   POST /api/tests/runner/start  — Spawn a test-supervisor run session
 *   POST /api/tests/runner/stop   — Inject pause directive (safe stop)
 *   GET  /api/tests/runner/status — Current runner status
 */
import { Hono } from 'hono'
import { query, type Options } from '@anthropic-ai/claude-agent-sdk'
import { readDirectives, writeDirectives, readTestState } from '../services/test-reader.js'
import { config } from '../config.js'
import { sseManager } from '../watcher/sse-manager.js'
import type { SSEEventType } from '../types/index.js'

const testRunnerRoutes = new Hono()

// ---- Runner State ----

interface RunnerState {
  status: 'idle' | 'running' | 'paused'
  sessionId: string | null
  startedAt: string | null
  lastRunAt: string | null
  abortController: AbortController | null
}

const runnerState: RunnerState = {
  status: 'idle',
  sessionId: null,
  startedAt: null,
  lastRunAt: null,
  abortController: null,
}

function broadcastRunnerStatus() {
  sseManager.broadcast('runner-status-changed' as SSEEventType, {
    status: runnerState.status,
    sessionId: runnerState.sessionId,
    startedAt: runnerState.startedAt,
    lastRunAt: runnerState.lastRunAt,
  })
}

// POST /start — Spawn runner session
testRunnerRoutes.post('/start', async (c) => {
  if (runnerState.status === 'running') {
    return c.json({ error: 'Runner 已在运行中', status: runnerState.status }, 409)
  }

  // Clear any pending pause directive before starting
  const directives = readDirectives()
  const filtered = directives.filter(d => !(d.type === 'pause' && d.status === 'pending'))
  if (filtered.length !== directives.length) {
    writeDirectives(filtered)
  }

  const ac = new AbortController()
  runnerState.status = 'running'
  runnerState.startedAt = new Date().toISOString()
  runnerState.abortController = ac
  broadcastRunnerStatus()

  // Spawn in background — don't await
  const projectRoot = config.projectRoot
  ;(async () => {
    try {
      let firstMessage = true
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
        if (firstMessage) {
          // Extract session ID from first message
          const msg = message as Record<string, unknown>
          if (msg.session_id) {
            runnerState.sessionId = msg.session_id as string
          }
          firstMessage = false
        }
      }
      // Normal completion
      runnerState.status = 'idle'
      runnerState.lastRunAt = new Date().toISOString()
      runnerState.sessionId = null
      runnerState.abortController = null
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      console.error('[test-runner] Runner session error:', errorMsg)
      // Check if it was an intentional abort (stop/pause)
      if (errorMsg.includes('abort')) {
        runnerState.status = 'paused'
      } else {
        runnerState.status = 'idle'
      }
      runnerState.lastRunAt = new Date().toISOString()
      runnerState.sessionId = null
      runnerState.abortController = null
    }
    broadcastRunnerStatus()
  })()

  return c.json({
    status: 'started',
    startedAt: runnerState.startedAt,
  })
})

// POST /stop — Inject pause directive (safe stop)
testRunnerRoutes.post('/stop', async (c) => {
  if (runnerState.status !== 'running') {
    return c.json({ error: 'Runner 未在运行', status: runnerState.status }, 409)
  }

  // Write pause directive for test-loop to read at next check
  const directives = readDirectives()
  directives.push({
    type: 'pause',
    status: 'pending',
    createdAt: new Date().toISOString(),
    source: 'webui-runner-stop',
  })
  writeDirectives(directives)

  // Also abort the SDK session for immediate stop
  if (runnerState.abortController) {
    try { runnerState.abortController.abort() } catch { /* ignore */ }
  }

  runnerState.status = 'paused'
  runnerState.lastRunAt = new Date().toISOString()
  runnerState.sessionId = null
  runnerState.abortController = null
  broadcastRunnerStatus()

  return c.json({ status: 'stopping' })
})

// GET /status — Current runner status
testRunnerRoutes.get('/status', (c) => {
  // Also check state.json for additional context
  const state = readTestState()

  return c.json({
    status: runnerState.status,
    sessionId: runnerState.sessionId,
    startedAt: runnerState.startedAt,
    lastRunAt: runnerState.lastRunAt,
    currentPhase: state?.phase || null,
    currentRound: state?.round || null,
  })
})

export default testRunnerRoutes
