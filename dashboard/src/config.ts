/**
 * config.ts — 环境变量 + 路径配置
 */
import { existsSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'

function resolveWorkspace(): string {
  // 1. 环境变量
  if (process.env.OPENCLAW_WORKSPACE) {
    return process.env.OPENCLAW_WORKSPACE
  }
  // 2. 自动检测 ~/.openclaw/workspace
  const defaultPath = join(homedir(), '.openclaw', 'workspace')
  if (existsSync(defaultPath)) {
    return defaultPath
  }
  console.warn('[config] ⚠️ OpenClaw workspace not found. Set OPENCLAW_WORKSPACE in .env')
  return defaultPath
}

function resolveOpenclawRoot(): string {
  if (process.env.OPENCLAW_ROOT) {
    return process.env.OPENCLAW_ROOT
  }
  const defaultPath = join(homedir(), '.openclaw')
  if (existsSync(defaultPath)) {
    return defaultPath
  }
  return defaultPath
}

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  jwtSecret: process.env.JWT_SECRET || 'engineer-brain-dev-secret',
  workspace: resolveWorkspace(),
  openclawRoot: resolveOpenclawRoot(),
  githubCopilotToken: process.env.GITHUB_COPILOT_TOKEN || '',

  get casesDir() {
    return join(this.workspace, 'cases')
  },
  get activeCasesDir() {
    return join(this.workspace, 'cases', 'active')
  },
  get arCasesDir() {
    return join(this.workspace, 'cases', 'AR')
  },
  get todoDir() {
    return join(this.workspace, 'cases', 'todo')
  },
  get patrolStateFile() {
    return join(this.workspace, 'cases', 'casehealth-state.json')
  },
  get cronJobsFile() {
    return join(this.openclawRoot, 'cron', 'jobs.json')
  },
  get openclawConfigFile() {
    return join(this.openclawRoot, 'openclaw.json')
  },
  get authFile() {
    return join(this.openclawRoot, '.eb-auth.json')
  },
  get perfReportsDir() {
    return join(this.workspace, 'perf-reports')
  },
  get scriptsDir() {
    return join(this.openclawRoot, 'skills', 'd365-case-ops', 'scripts')
  },
  get agentSessionsDir() {
    return join(this.workspace, 'agent-sessions')
  },
  agentMaxConcurrency: 1,
}
