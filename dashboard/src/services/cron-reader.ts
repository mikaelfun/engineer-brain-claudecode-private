/**
 * cron-reader.ts — 读 cron-jobs.json
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
  // Agent configuration is now managed via .claude/agents/ in the project.
  // No external config file is needed.
  return []
}
