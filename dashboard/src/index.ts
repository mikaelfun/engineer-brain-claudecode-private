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

import authRoutes from './routes/auth.js'
import casesRoutes from './routes/cases.js'
import todosRoutes from './routes/todos.js'
import agentsRoutes from './routes/agents.js'
import draftsRoutes from './routes/drafts.js'
import eventsRoutes from './routes/events.js'
import caseAiRoutes from './routes/case-routes.js'
import stepRoutes from './routes/steps.js'

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
    casesReady: isWorkspaceReady(),
    casesRoot: config.casesDir,
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
app.use('/api/case/*', authMiddleware)
app.use('/api/patrol', authMiddleware)
app.use('/api/settings', authMiddleware)
app.use('/api/sessions', authMiddleware)

app.route('/api/cases', casesRoutes)
app.route('/api/todos', todosRoutes)
app.route('/api/agents', agentsRoutes)
app.route('/api/drafts', draftsRoutes)
app.route('/api', caseAiRoutes)
app.route('/api', stepRoutes)

// ===== Start =====
console.log(`
🧠 Engineer Brain Dashboard
━━━━━━━━━━━━━━━━━━━━━━━━━
  API Server:    http://localhost:${config.port}
  Cases Root:    ${config.casesDir}
  Cases Ready:   ${isWorkspaceReady()}
━━━━━━━━━━━━━━━━━━━━━━━━━
`)

// Start file watcher
if (isWorkspaceReady()) {
  startFileWatcher()
}

serve({
  fetch: app.fetch,
  port: config.port,
})
