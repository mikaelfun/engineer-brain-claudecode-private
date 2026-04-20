/**
 * index.ts — Hono API Server 入口
 */
import 'dotenv/config'

// Global safety net: prevent unhandled errors from crashing the process
// Patrol's abortQuery kills SDK subprocesses, which causes pipe/socket errors
// that bubble up as uncaught exceptions or unhandled rejections
process.on('unhandledRejection', (reason) => {
  console.error('[SAFETY-NET] Unhandled rejection:', reason instanceof Error ? reason.message : reason)
})

process.on('uncaughtException', (err) => {
  // Socket/pipe errors from killed SDK subprocesses — safe to swallow
  const code = (err as any).code
  if (code === 'EOF' || code === 'EPIPE' || code === 'ECONNRESET' ||
      err.message?.includes('write EOF') || err.message?.includes('write EPIPE')) {
    console.warn('[SAFETY-NET] Pipe error from killed subprocess (safe):', err.message)
    return // Do NOT crash
  }
  // Unknown errors — log but still don't crash (server should keep running)
  console.error('[SAFETY-NET] Uncaught exception:', err)
  console.error('[SAFETY-NET] Stack:', err.stack)
  // For truly fatal errors (OOM, etc), Node will still crash via the default handler
  // since we're not calling process.exit here
})

import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

import { config } from './config.js'
import { authMiddleware } from './middleware/auth.js'
import { isWorkspaceReady } from './services/workspace.js'
import { startFileWatcher, stopFileWatcher } from './watcher/file-watcher.js'
import { abortAllQueries } from './agent/case-session-manager.js'
import { recoverOrphanTrackingIssues } from './services/issue-reader.js'
import { initCronManager } from './services/cron-manager.js'
import { patrolStateManager } from './services/patrol-state-manager.js'

import authRoutes from './routes/auth.js'
import casesRoutes from './routes/cases.js'
import todosRoutes from './routes/todos.js'
import agentsRoutes from './routes/agents.js'
import draftsRoutes from './routes/drafts.js'
import eventsRoutes from './routes/events.js'
import caseAiRoutes from './routes/case-routes.js'
import stepRoutes from './routes/steps.js'
import issuesRoutes from './routes/issues.js'
import restartRoutes from './routes/restart.js'
import { sessionRoutes } from './routes/sessions.js'
import testSupervisorRoutes from './routes/test-supervisor.js'
import testRunnerRoutes from './routes/test-runner.js'
import { skillRoutes } from './routes/skill-routes.js'
import { initSkillRegistry } from './services/skill-registry.js'
import { noteGapRoutes, noteGapBatchRoutes } from './routes/note-gap-routes.js'
import { laborEstimateRoutes } from './routes/labor-estimate.js'
import daemonRoutes from './routes/daemon.js'
import azProfileRoutes from './routes/az-profiles.js'
import { startAzProfileMonitor } from './services/az-profile-reader.js'
import actionsRoutes from './routes/actions.js'
import { spawnDaemonWarmup } from './services/daemon-reader.js'

const app = new Hono()

// ===== Middleware =====
app.use('*', cors({
  origin: [`http://localhost:${config.webPort}`, `http://localhost:${config.port}`],
  credentials: true,
}))
app.use('*', logger())

// ===== Health Check (no auth) =====
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    casesReady: isWorkspaceReady(),
    casesRoot: config.casesDir,
    engineerName: config.engineerName,
    timestamp: new Date().toISOString(),
  })
})

// ===== Auth Routes (no auth middleware) =====
app.route('/api/auth', authRoutes)

// ===== SSE Events (no auth for simplicity, uses separate auth check) =====
app.route('/api/events', eventsRoutes)

// ===== Protected Routes =====
app.use('/api/cases/*', authMiddleware)
app.use('/api/todos/*', authMiddleware)
app.use('/api/drafts/*', authMiddleware)
app.use('/api/case/*', authMiddleware)
app.use('/api/patrol', authMiddleware)
app.use('/api/settings', authMiddleware)
app.use('/api/sessions', authMiddleware)
app.use('/api/sessions/*', authMiddleware)
app.use('/api/issues/*', authMiddleware)
app.use('/api/restart/*', authMiddleware)
app.use('/api/tests/*', authMiddleware)
app.use('/api/skills', authMiddleware)
app.use('/api/skills/*', authMiddleware)
app.use('/api/case/*/note-gap', authMiddleware)
app.use('/api/case/*/note-gap/*', authMiddleware)
app.use('/api/daemon/*', authMiddleware)
app.use('/api/note-gaps', authMiddleware)
app.use('/api/actions', authMiddleware)

app.route('/api/cases', casesRoutes)
app.route('/api/todos', todosRoutes)
app.route('/api/agents', agentsRoutes)
app.route('/api/drafts', draftsRoutes)
app.route('/api', caseAiRoutes)
app.route('/api', stepRoutes)
app.route('/api/issues', issuesRoutes)
app.route('/api/restart', restartRoutes)
app.route('/api/sessions', sessionRoutes)
app.route('/api/tests', testSupervisorRoutes)
app.route('/api/tests/runner', testRunnerRoutes)
app.route('/api/skills', skillRoutes)
app.route('/api/case', noteGapRoutes)
app.route('/api/note-gaps', noteGapBatchRoutes)
app.route('/api/labor-estimate', laborEstimateRoutes)
app.route('/api/daemon', daemonRoutes)
app.route('/api/az-profiles', azProfileRoutes)
app.route('/api/actions', actionsRoutes)

// ===== Start =====
console.log(`
🧠 Engineer Brain Dashboard
━━━━━━━━━━━━━━━━━━━━━━━━━
  API Server:    http://localhost:${config.port}
  Cases Root:    ${config.casesDir}
  Cases Ready:   ${isWorkspaceReady()}
━━━━━━━━━━━━━━━━━━━━━━━━━
`)

// Start file watcher + patrol state hydration
if (isWorkspaceReady()) {
  patrolStateManager.hydrate()
  startFileWatcher()
}

// Startup recovery: reset orphan "tracking" issues left by server restarts
recoverOrphanTrackingIssues()

// Initialize cron job scheduler
initCronManager()

// Initialize skill registry
initSkillRegistry(config.projectRoot)

// Background: warm up Token Daemon (non-blocking)
try {
  const warmup = spawnDaemonWarmup()
  if (warmup.pid) {
    console.log(`🔥 Token Daemon warmup spawned (PID: ${warmup.pid})`)
  }
} catch (e) {
  console.warn('[startup] Token Daemon warmup failed (non-fatal):', e)
}

// Background: monitor az profile tokens every 15 min
startAzProfileMonitor((profiles) => {
  const expired = profiles.filter(p => p.status === 'expired')
  if (expired.length > 0) {
    console.warn(`⚠️ [az-profile] ${expired.length} profile(s) expired: ${expired.map(p => p.name).join(', ')}`)
  }
})

serve({
  fetch: app.fetch,
  port: config.port,
})

// ===== Graceful Shutdown (ISS-086) =====
function shutdown(signal: string) {
  console.log(`\n[shutdown] Received ${signal}, aborting all active queries...`)
  const aborted = abortAllQueries()
  console.log(`[shutdown] Aborted ${aborted} active queries`)
  stopFileWatcher()
  process.exit(0)
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
