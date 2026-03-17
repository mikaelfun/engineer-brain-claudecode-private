/**
 * cron-reader.ts — 读 cron/jobs.json + openclaw.json
 */
import { readFileSync, existsSync } from 'fs'
import { config } from '../config.js'
import type { AgentInfo, CronJob } from '../types/index.js'

export function readCronJobs(): CronJob[] {
  if (!existsSync(config.cronJobsFile)) return []

  try {
    const content = readFileSync(config.cronJobsFile, 'utf-8')
    const data = JSON.parse(content)
    return (data.jobs || []) as CronJob[]
  } catch {
    return []
  }
}

export function readAgents(): AgentInfo[] {
  if (!existsSync(config.openclawConfigFile)) return []

  try {
    const content = readFileSync(config.openclawConfigFile, 'utf-8')
    const data = JSON.parse(content)
    const agents = data.agents?.list || []
    return agents.map((a: any) => ({
      id: a.id,
      name: a.name || a.id,
      model: a.model || data.agents?.defaults?.model?.primary || 'unknown',
      workspace: a.workspace,
      agentDir: a.agentDir,
      subagents: a.subagents,
    }))
  } catch {
    return []
  }
}
