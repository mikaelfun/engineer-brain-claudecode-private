/**
 * config.ts — 环境变量 + 路径配置
 *
 * 所有路径来源：
 *   1. 项目相对路径（repo 内的脚本、skills 等）
 *   2. config.json（casesRoot / dataRoot 等可配置路径）
 *   3. dashboard/.runtime/（dashboard 自管理的运行时文件）
 */
import { existsSync, readFileSync, mkdirSync } from 'fs'
import { join, resolve, isAbsolute, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * 从 __dirname 向上查找包含 config.json 的项目根目录
 */
function resolveProjectRoot(): string {
  let dir = __dirname
  for (let i = 0; i < 10; i++) {
    if (existsSync(join(dir, 'config.json'))) {
      return dir
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  // Fallback: assume dashboard/src → project root is ../../
  const fallback = resolve(__dirname, '..', '..')
  console.warn(`[config] ⚠️ config.json not found, using fallback project root: ${fallback}`)
  return fallback
}

interface DashboardConfig {
  serverPort?: number
  webPort?: number
  /** How many days completed sessions stay visible in Monitor (default 7) */
  sessionRetentionDays?: number
}

/** SSE message truncation limits — centralized config to avoid hardcoded magic numbers */
export interface SseLimits {
  /** Max chars for tool-call content summary (Bash commands, Agent prompts, etc.) */
  toolCallContentMaxLen: number
  /** Max chars for tool-result content */
  toolResultMaxLen: number
  /** Max chars for response (text) content */
  responseMaxLen: number
  /** Max chars for thinking (extended reasoning) content */
  thinkingMaxLen: number
}

const SSE_DEFAULTS: SseLimits = {
  toolCallContentMaxLen: 2000,
  toolResultMaxLen: 5000,
  responseMaxLen: 5000,
  thinkingMaxLen: 5000,
}

interface PlatformConfig {
  pwsh?: string
  agencyExe?: string
}

interface ProjectConfig {
  casesRoot: string
  dataRoot?: string
  patrolDir?: string
  platform?: PlatformConfig
  dashboard?: DashboardConfig
  sse?: Partial<SseLimits>
}

/** Cached config — avoids re-reading config.json on every property access */
let _cachedConfig: ProjectConfig | null = null

function readProjectConfig(): ProjectConfig {
  if (_cachedConfig) return _cachedConfig
  const configPath = join(projectRoot, 'config.json')
  try {
    const raw = readFileSync(configPath, 'utf-8')
    _cachedConfig = JSON.parse(raw) as ProjectConfig
    return _cachedConfig
  } catch {
    _cachedConfig = { casesRoot: './cases' }
    return _cachedConfig
  }
}

/** Invalidate cached config — call after settings are updated */
export function reloadConfig(): void {
  _cachedConfig = null
}

function resolveConfigPath(configValue: string): string {
  if (isAbsolute(configValue)) return configValue
  return resolve(projectRoot, configValue)
}

const projectRoot = resolveProjectRoot()
const runtimeDir = join(projectRoot, 'dashboard', '.runtime')

// Ensure runtime directory exists on startup
if (!existsSync(runtimeDir)) {
  mkdirSync(runtimeDir, { recursive: true })
}

export const config = {
  port: parseInt(process.env.PORT || String(readProjectConfig().dashboard?.serverPort ?? 3010), 10),
  get webPort(): number {
    return readProjectConfig().dashboard?.webPort ?? 5173
  },
  /** Completed session retention in ms (default 7 days, configurable via dashboard.sessionRetentionDays) */
  get sessionRetentionMs(): number {
    const days = readProjectConfig().dashboard?.sessionRetentionDays ?? 7
    return days * 24 * 60 * 60 * 1000
  },
  jwtSecret: process.env.JWT_SECRET || 'engineer-brain-dev-secret',
  projectRoot,

  get casesDir() {
    return resolveConfigPath(readProjectConfig().casesRoot)
  },
  get activeCasesDir() {
    return join(this.casesDir, 'active')
  },
  get arCasesDir() {
    return join(this.casesDir, 'AR')
  },
  get patrolDir() {
    const pd = readProjectConfig().patrolDir
    if (!pd) throw new Error('patrolDir not configured in config.json')
    return resolveConfigPath(pd)
  },
  get patrolStateFile() {
    return join(this.patrolDir, 'patrol-state.json')
  },
  get patrolProgressFile() {
    return join(this.patrolDir, 'patrol-progress.json')
  },
  get archiveSummaryFile() {
    return join(this.patrolDir, 'archive-summary.json')
  },
  /** @deprecated Todo files are now per-case (cases/active/{id}/todo/). Kept for backward compat. */
  get todoDir() {
    return join(this.casesDir, 'todo')
  },
  get cronJobsFile() {
    return join(runtimeDir, 'cron-jobs.json')
  },
  get cronLogsDir() {
    return join(runtimeDir, 'cron-logs')
  },
  get authFile() {
    return join(runtimeDir, '.eb-auth.json')
  },
  get perfReportsDir() {
    return join(runtimeDir, 'perf-reports')
  },
  get scriptsDir() {
    return join(projectRoot, '.claude', 'skills', 'd365-case-ops', 'scripts')
  },
  get agentSessionsDir() {
    return join(runtimeDir, 'agent-sessions')
  },
  get caseSessionsFile() {
    return join(runtimeDir, 'case-sessions.json')
  },
  get caseSessionMessagesFile() {
    return join(runtimeDir, 'case-session-messages.json')
  },
  get patrolLastRunFile() {
    return join(this.patrolDir, 'patrol-state.json')
  },
  get dataDir() {
    const dr = readProjectConfig().dataRoot
    return dr ? resolveConfigPath(dr) : resolve(projectRoot, '..', 'data')
  },
  agentMaxConcurrency: 1,

  get agencyExe(): string {
    const configured = readProjectConfig().platform?.agencyExe
    if (configured) return configured
    const appdata = process.env.APPDATA
    if (appdata) return join(appdata, 'agency', 'CurrentVersion', 'agency.exe')
    return join(process.env.HOME || '', '.config', 'agency', 'CurrentVersion', 'agency')
  },

  get noteGapThresholdDays(): number {
    return (readProjectConfig() as any).noteGapThresholdDays ?? 3
  },

  get engineerName(): string {
    return (readProjectConfig() as any).engineerName ?? 'Engineer'
  },

  /** SSE truncation limits — merged from config.json with defaults */
  get sseLimits(): SseLimits {
    const cfg = readProjectConfig()
    return { ...SSE_DEFAULTS, ...cfg.sse }
  },
}
