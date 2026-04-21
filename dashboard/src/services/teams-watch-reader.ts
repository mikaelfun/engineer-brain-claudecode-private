/**
 * teams-watch-reader.ts — Teams Watch 状态读取 + 进程管理
 *
 * 读取 $TEMP/teams-watch/ 下的 watch state 和 daemon config 文件，
 * 提供 CRUD 操作，通过 shell 调用 teams-daemon.sh 控制后台进程。
 */
import { readFileSync, existsSync, readdirSync, unlinkSync } from 'fs'
import { join, resolve } from 'path'
import { execSync } from 'child_process'
import { config } from '../config.js'

const TEMP = process.env.TEMP || process.env.TMP || '/tmp'
const STATE_DIR = join(TEMP, 'teams-watch')
const PID_DIR = join(STATE_DIR, 'pids')

const DAEMON_SCRIPT = resolve(
  config.projectRoot,
  '.claude', 'skills', 'teams-watch', 'scripts', 'teams-daemon.sh'
)

const WATCH_TARGETS_FILE = resolve(
  config.projectRoot,
  '.claude', 'skills', 'teams-watch', 'watch-targets.json'
)

// ── Types ──

export interface ParsedCard {
  type: 'case-assignment' | 'unknown'
  caseNumber?: string
  assignedTo?: string
  severity?: string
  slaExpire?: string
  d365Url?: string
}

export interface WatchHistoryEntry {
  detectedAt: string
  messageTime: string
  from: string
  preview: string
  action: string
  actionResult: string
  parsedCard?: ParsedCard
}

export interface TeamsWatch {
  watchId: string
  topic: string
  chatId: string
  interval: number
  action: string
  status: 'running' | 'stopped'
  pid: number | null
  lastPollAt: string | null
  lastMessageFrom: string | null
  lastMessagePreview: string | null
  lastMessageId: string | null
  pollCount: number
  newMessageCount: number
  consecutiveErrors: number
  history: WatchHistoryEntry[]
}

// ── Helpers ──

function readJsonFile<T>(filePath: string): T | null {
  if (!existsSync(filePath)) return null
  try {
    return JSON.parse(readFileSync(filePath, 'utf-8')) as T
  } catch {
    return null
  }
}

function isProcessAlive(pid: number): boolean {
  try {
    const out = execSync(`tasklist /FI "PID eq ${pid}" /NH`, {
      encoding: 'utf-8',
      timeout: 5000,
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    return out.includes(String(pid))
  } catch {
    return false
  }
}

// ── State file schemas (internal) ──

interface WatchStateFile {
  _version: number
  watchId: string
  target: {
    type: string
    chatId: string
    topic: string
    resolvedAt: string
  }
  config: {
    interval: number
    action: string
    actionScript?: string | null
  }
  state: {
    lastPollAt: string
    lastMessageId: string
    lastMessageTime: string
    lastMessageFrom?: string
    lastMessagePreview?: string
    pollCount: number
    newMessageCount: number
    consecutiveErrors: number
  }
  history: WatchHistoryEntry[]
}

interface DaemonConfigFile {
  watchId: string
  topic: string
  chatId: string
  interval: number
  action: string
  pid: number
  startedAt: string
  logFile: string
  status: 'running' | 'stopped'
}

interface WatchTargetsFile {
  targets: Record<string, {
    chatId: string
    displayName: string
    description?: string
  }>
}

// ── Public API ──

/**
 * Scan $TEMP/teams-watch/ for all watch state files, merge with daemon configs
 * for running status, and check PID liveness.
 */
export function listWatches(): TeamsWatch[] {
  if (!existsSync(STATE_DIR)) return []

  // 1. Read all daemon configs (keyed by watchId)
  const daemonConfigs = new Map<string, DaemonConfigFile>()
  try {
    const files = readdirSync(STATE_DIR).filter(
      f => f.startsWith('daemon-') && f.endsWith('-config.json')
    )
    for (const f of files) {
      const cfg = readJsonFile<DaemonConfigFile>(join(STATE_DIR, f))
      if (cfg?.watchId) {
        daemonConfigs.set(cfg.watchId, cfg)
      }
    }
  } catch { /* dir may not exist yet */ }

  // 2. Read all watch state files
  const watches: TeamsWatch[] = []
  try {
    const files = readdirSync(STATE_DIR).filter(
      f => f.startsWith('watch-') && f.endsWith('.json')
    )
    for (const f of files) {
      const state = readJsonFile<WatchStateFile>(join(STATE_DIR, f))
      if (!state) continue

      const watchId = state.watchId || f.replace('.json', '')
      const daemon = daemonConfigs.get(watchId)

      // Determine PID and liveness
      let pid: number | null = daemon?.pid ?? null
      let alive = false

      // Also check PID file
      if (!pid) {
        const hash = watchId.replace('watch-', '')
        const pidFile = join(PID_DIR, `watch-${hash}.pid`)
        if (existsSync(pidFile)) {
          try {
            const pidVal = parseInt(readFileSync(pidFile, 'utf-8').trim(), 10)
            if (!isNaN(pidVal)) pid = pidVal
          } catch { /* ignore */ }
        }
      }

      if (pid) {
        alive = isProcessAlive(pid)
      }

      // Daemon config says 'running' but process is dead → stopped
      const status: 'running' | 'stopped' = alive ? 'running' : 'stopped'

      watches.push({
        watchId,
        topic: state.target?.topic || daemon?.topic || '',
        chatId: state.target?.chatId || daemon?.chatId || '',
        interval: daemon?.interval ?? state.config?.interval ?? 60,
        action: daemon?.action ?? state.config?.action ?? 'notify',
        status,
        pid: alive ? pid : null,
        lastPollAt: state.state?.lastPollAt || null,
        lastMessageFrom: state.state?.lastMessageFrom || null,
        lastMessagePreview: state.state?.lastMessagePreview || null,
        lastMessageId: state.state?.lastMessageId || null,
        pollCount: state.state?.pollCount ?? 0,
        newMessageCount: state.state?.newMessageCount ?? 0,
        consecutiveErrors: state.state?.consecutiveErrors ?? 0,
        history: state.history || [],
      })

      // Remove from map so we can detect orphan daemon configs
      daemonConfigs.delete(watchId)
    }
  } catch { /* ignore */ }

  // 3. Add orphan daemon configs (have config but no state file yet)
  for (const [watchId, daemon] of Array.from(daemonConfigs.entries())) {
    const pid = daemon.pid
    const alive = pid ? isProcessAlive(pid) : false

    watches.push({
      watchId,
      topic: daemon.topic || '',
      chatId: daemon.chatId || '',
      interval: daemon.interval ?? 60,
      action: daemon.action ?? 'notify',
      status: alive ? 'running' : 'stopped',
      pid: alive ? pid : null,
      lastPollAt: null,
      lastMessageFrom: null,
      lastMessagePreview: null,
      lastMessageId: null,
      pollCount: 0,
      newMessageCount: 0,
      consecutiveErrors: 0,
      history: [],
    })
  }

  return watches
}

/**
 * Start a new watch daemon via teams-daemon.sh.
 * Returns the daemon output line (e.g. "DAEMON_STARTED|topic=...|pid=...")
 */
export function startWatch(opts: {
  topic?: string
  chatId?: string
  interval?: number
  action?: string
}): string {
  const { topic, chatId, interval = 60, action = 'notify' } = opts

  if (!topic && !chatId) {
    return 'ERROR: topic or chatId required'
  }

  const args: string[] = ['start']
  if (topic) args.push('--topic', `"${topic}"`)
  if (chatId) args.push('--chat-id', `"${chatId}"`)
  args.push('--interval', String(interval))
  args.push('--action', action)

  try {
    const result = execSync(
      `bash "${DAEMON_SCRIPT}" ${args.join(' ')}`,
      {
        encoding: 'utf-8',
        timeout: 15_000,
        cwd: config.projectRoot,
        stdio: ['pipe', 'pipe', 'pipe'],
      }
    )
    return result.trim()
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message.substring(0, 200) : String(e)
    return `ERROR: ${msg}`
  }
}

/**
 * Stop a watch daemon by watchId.
 * Reads the topic from the state/config file, then calls teams-daemon.sh stop.
 */
export function stopWatch(watchId: string): string {
  const hash = watchId.replace('watch-', '')

  // Try to find the topic from daemon config or state file
  let topic = ''
  const cfgPath = join(STATE_DIR, `daemon-${hash}-config.json`)
  const statePath = join(STATE_DIR, `${watchId}.json`)

  const cfg = readJsonFile<DaemonConfigFile>(cfgPath)
  if (cfg?.topic) {
    topic = cfg.topic
  } else {
    const state = readJsonFile<WatchStateFile>(statePath)
    if (state?.target?.topic) {
      topic = state.target.topic
    }
  }

  if (!topic) {
    // Fallback: try to kill PID directly
    const pidFile = join(PID_DIR, `watch-${hash}.pid`)
    if (existsSync(pidFile)) {
      try {
        const pid = parseInt(readFileSync(pidFile, 'utf-8').trim(), 10)
        if (!isNaN(pid) && isProcessAlive(pid)) {
          execSync(`taskkill /PID ${pid} /F /T`, {
            encoding: 'utf-8',
            timeout: 5000,
            stdio: ['pipe', 'pipe', 'pipe'],
          })
          unlinkSync(pidFile)
          return `DAEMON_STOPPED|watchId=${watchId}|pid=${pid}`
        }
      } catch { /* ignore */ }
    }
    return `ERROR: cannot find topic for ${watchId}`
  }

  try {
    const result = execSync(
      `bash "${DAEMON_SCRIPT}" stop --topic "${topic}"`,
      {
        encoding: 'utf-8',
        timeout: 10_000,
        cwd: config.projectRoot,
        stdio: ['pipe', 'pipe', 'pipe'],
      }
    )
    return result.trim()
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message.substring(0, 200) : String(e)
    return `ERROR: ${msg}`
  }
}

/**
 * Stop and remove all state/config/log/pid files for a watch.
 */
export function deleteWatch(watchId: string): boolean {
  // Stop first (ignore errors)
  stopWatch(watchId)

  const hash = watchId.replace('watch-', '')
  const filesToRemove = [
    join(STATE_DIR, `${watchId}.json`),
    join(STATE_DIR, `daemon-${hash}-config.json`),
    join(STATE_DIR, `daemon-${hash}.log`),
    join(PID_DIR, `watch-${hash}.pid`),
  ]

  let removed = false
  for (const f of filesToRemove) {
    try {
      if (existsSync(f)) {
        unlinkSync(f)
        removed = true
      }
    } catch { /* ignore */ }
  }
  return removed
}

/**
 * Read the history array from a watch state file.
 */
export function getWatchHistory(watchId: string): WatchHistoryEntry[] {
  const hash = watchId.replace('watch-', '')
  const statePath = join(STATE_DIR, `watch-${hash}.json`)
  const state = readJsonFile<WatchStateFile>(statePath)
  return state?.history || []
}

/**
 * Read the SBA target from watch-targets.json.
 */
export function getSbaTarget(): { chatId: string; displayName: string } | null {
  const targets = readJsonFile<WatchTargetsFile>(WATCH_TARGETS_FILE)
  const sba = targets?.targets?.sba
  if (!sba?.chatId) return null
  return { chatId: sba.chatId, displayName: sba.displayName }
}

/**
 * Find a watch entry by chatId.
 */
export function findWatchByChatId(chatId: string): TeamsWatch | null {
  const watches = listWatches()
  return watches.find(w => w.chatId === chatId) || null
}
