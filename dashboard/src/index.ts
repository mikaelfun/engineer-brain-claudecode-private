/**
 * index.ts — Hono API Server 入口
 */
import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

import { config } from './config.js'
import { authMiddleware } from './middleware/auth.js'
import { isWorkspaceReady } from './services/workspace.js'
import { startFileWatcher } from './watcher/file-watcher.js'
import { cleanupStaleSessions } from './agent/session-manager.js'

import authRoutes from './routes/auth.js'
import casesRoutes from './routes/cases.js'
import todosRoutes from './routes/todos.js'
import agentsRoutes from './routes/agents.js'
import draftsRoutes from './routes/drafts.js'
import aiRoutes from './routes/ai.js'
import eventsRoutes from './routes/events.js'
import workflowRoutes from './routes/workflow.js'
import caseAiRoutes from './routes/case-routes.js'

const app = new Hono()

// ===== Middleware =====
app.use('*', cors({
  origin: ['http://localhost:5173', `http://localhost:${config.port}`],
  credentials: true,
}))
app.use('*', logger())

// ===== Health Check (no auth) =====
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    workspace: isWorkspaceReady(),
    workspacePath: config.workspace,
    hasAI: !!config.githubCopilotToken,
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
app.use('/api/agents/*', authMiddleware)
app.use('/api/drafts/*', authMiddleware)
app.use('/api/ai/*', authMiddleware)
app.use('/api/workflow/*', authMiddleware)
app.use('/api/case/*', authMiddleware)
app.use('/api/patrol', authMiddleware)
app.use('/api/settings', authMiddleware)
app.use('/api/sessions', authMiddleware)

app.route('/api/cases', casesRoutes)
app.route('/api/todos', todosRoutes)
app.route('/api/agents', agentsRoutes)
app.route('/api/drafts', draftsRoutes)
app.route('/api/ai', aiRoutes)
app.route('/api/workflow', workflowRoutes)
app.route('/api', caseAiRoutes)

// ===== Start =====
console.log(`
🧠 Engineer Brain Dashboard
━━━━━━━━━━━━━━━━━━━━━━━━━
  API Server:    http://localhost:${config.port}
  Workspace:     ${config.workspace}
  Workspace OK:  ${isWorkspaceReady()}
  AI Enabled:    ${!!config.githubCopilotToken}
━━━━━━━━━━━━━━━━━━━━━━━━━
`)

// Start file watcher
if (isWorkspaceReady()) {
  startFileWatcher()
  // Clean up any sessions left in "running" state from previous server runs
  const cleaned = cleanupStaleSessions()
  if (cleaned > 0) {
    console.log(`  🧹 Cleaned ${cleaned} stale session(s)`)
  }
}

serve({
  fetch: app.fetch,
  port: config.port,
})
