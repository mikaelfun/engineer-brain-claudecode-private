/**
 * agents.ts — Agent 状态/cron 路由
 */
import { Hono } from 'hono'
import { readAgents, readCronJobs } from '../services/cron-reader.js'
import { readPatrolState } from '../services/meta-reader.js'

const agents = new Hono()

// GET /api/agents — Agent 列表
agents.get('/', (c) => {
  const agentList = readAgents()
  return c.json({ agents: agentList, total: agentList.length })
})

// GET /api/agents/cron-jobs — Cron 任务列表
agents.get('/cron-jobs', (c) => {
  const jobs = readCronJobs()
  return c.json({ jobs, total: jobs.length })
})

// GET /api/agents/patrol-state — 巡检状态
agents.get('/patrol-state', (c) => {
  const state = readPatrolState()
  if (!state) {
    return c.json({ error: 'Patrol state not found' }, 404)
  }
  return c.json(state)
})

export default agents
