/**
 * teams-watch-reader.ts — Teams Watch 状态读取 + 进程管理
 *
 * 读取 {dataDir}/teams-watch/ 下的 watch state 和 daemon config 文件，
 * 提供 CRUD 操作，通过 shell 调用 teams-daemon.sh 控制后台进程。
 */
import { readFileSync, existsSync, readdirSync, unlinkSync, writeFileSync, mkdirSync, statSync } from 'fs'
import { join, resolve } from 'path'
import { execSync, spawn } from 'child_process'
import { config } from '../config.js'

const STATE_DIR = join(config.dataDir, 'teams-watch')
const PID_DIR = join(STATE_DIR, 'pids')

const DAEMON_SCRIPT = resolve(
  config.projectRoot,
  '.claude', 'skills', 'teams-watch', 'scripts', 'teams-daemon.sh'
)

const POLL_SCRIPT = resolve(
  config.projectRoot,
  '.claude', 'skills', 'teams-watch', 'scripts', 'teams-poll.sh'
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

/**
 * Extract the hash from a watchId, handling the "watch-watch-xxx" bug
 * from teams-poll.sh which double-prefixes the watchId.
 * Input: "watch-07aa2e857f13" or "watch-watch-07aa2e857f13" → "07aa2e857f13"
 */
function extractHash(watchId: string): string {
  return watchId.replace(/^(watch-)+/, '')
}

// ── Public API ──

/**
 * Scan $TEMP/teams-watch/ for all watch state files, merge with daemon configs
 * for running status, and check PID liveness.
 */
export function listWatches(): TeamsWatch[] {
  if (!existsSync(STATE_DIR)) return []

  // Load watch-targets.json for display name enrichment
  const targets = readJsonFile<WatchTargetsFile>(WATCH_TARGETS_FILE)
  const chatIdToDisplayName = new Map<string, string>()
  if (targets?.targets) {
    for (const t of Object.values(targets.targets)) {
      if (t.chatId && t.displayName) {
        chatIdToDisplayName.set(t.chatId, t.displayName)
      }
    }
  }

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

      // Use filename as authoritative watchId (state.watchId has "watch-watch-" bug)
      const watchId = f.replace('.json', '')
      const hash = extractHash(watchId)
      const daemon = daemonConfigs.get(watchId) || daemonConfigs.get(`watch-${hash}`) || daemonConfigs.get(state.watchId || '')

      // Determine PID and liveness
      let pid: number | null = daemon?.pid ?? null
      let alive = false

      // Also check PID file
      if (!pid) {
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

      const chatId = state.target?.chatId || daemon?.chatId || ''
      const rawTopic = state.target?.topic || daemon?.topic || ''
      const topic = chatIdToDisplayName.get(chatId) || rawTopic

      watches.push({
        watchId,
        topic,
        chatId,
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
 * Start a watch daemon by spawning teams-poll.sh in a detached loop.
 * Uses Node spawn({detached:true}) instead of bash background process
 * to survive parent pipe close (Git Bash limitation on Windows).
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

  const label = chatId || topic || ''
  const hash = execSync(`python3 -c "import hashlib; print(hashlib.md5('${label}'.encode()).hexdigest()[:12])"`, {
    encoding: 'utf-8', timeout: 5000,
  }).trim()

  const pidDir = join(STATE_DIR, 'pids')
  mkdirSync(pidDir, { recursive: true })
  const pidFile = join(pidDir, `watch-${hash}.pid`)

  // Check if already running
  if (existsSync(pidFile)) {
    try {
      const oldPid = parseInt(readFileSync(pidFile, 'utf-8').trim(), 10)
      if (!isNaN(oldPid) && isProcessAlive(oldPid)) {
        return `DAEMON_ALREADY_RUNNING|topic=${label}|pid=${oldPid}`
      }
    } catch {}
  }

  // Build poll args
  const pollArgs: string[] = []
  if (topic) pollArgs.push('--topic', topic)
  if (chatId) pollArgs.push('--chat-id', chatId)
  pollArgs.push('--action', action, '--state-dir', STATE_DIR)

  // Write a loop script and spawn it detached
  const logFile = join(STATE_DIR, `daemon-${hash}.log`)
  const loopScript = join(STATE_DIR, `daemon-${hash}-loop.sh`)

  const pollCmd = `bash "${POLL_SCRIPT}" ${pollArgs.map(a => `"${a}"`).join(' ')}`
  const scriptContent = `#!/usr/bin/env bash
echo "[$(date '+%Y-%m-%d %H:%M:%S')] DAEMON START | topic=${label} interval=${interval}s action=${action}" >> "${logFile}"
while true; do
  ${pollCmd} >> "${logFile}" 2>&1
  sleep ${interval}
done
`
  writeFileSync(loopScript, scriptContent)

  const child = spawn('bash', [loopScript], {
    detached: true,
    stdio: 'ignore',
    cwd: config.projectRoot,
  })
  child.unref()

  const pid = child.pid
  if (pid) {
    writeFileSync(pidFile, String(pid))

    // Write daemon config for UI
    const cfgFile = join(STATE_DIR, `daemon-${hash}-config.json`)
    writeFileSync(cfgFile, JSON.stringify({
      watchId: `watch-${hash}`,
      topic: label,
      chatId: chatId || '',
      interval,
      action,
      pid,
      startedAt: new Date().toISOString(),
      status: 'running',
    }, null, 2))
  }

  return `DAEMON_STARTED|topic=${label}|pid=${pid}|interval=${interval}s|action=${action}`
}

/**
 * Stop a watch daemon by watchId.
 * Reads the topic from the state/config file, then calls teams-daemon.sh stop.
 */
export function stopWatch(watchId: string): string {
  const hash = extractHash(watchId)

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

  const hash = extractHash(watchId)
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
  const hash = extractHash(watchId)
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

/**
 * Enrich watch history with Graph API data:
 * - Replace "system" from with actual sender displayName
 * - Parse Adaptive Card attachments into parsedCard
 *
 * Results are cached in a separate enriched-{hash}.json file
 * to avoid re-fetching on every request.
 */
export async function enrichWatchHistory(watchId: string): Promise<WatchHistoryEntry[]> {
  const { readGraphToken } = await import('./graph-token-reader.js')
  const { parseSbaCard } = await import('./sba-patrol-trigger.js')

  const hash = extractHash(watchId)
  const statePath = join(STATE_DIR, `watch-${hash}.json`)
  const enrichCachePath = join(STATE_DIR, `enriched-${hash}.json`)
  const state = readJsonFile<WatchStateFile>(statePath)
  if (!state?.history?.length) return []

  const chatId = state.target?.chatId
  if (!chatId) return state.history

  // Check enrichment cache — reuse if fresh (< 2 min old)
  if (existsSync(enrichCachePath)) {
    try {
      const fstat = statSync(enrichCachePath)
      const ageMs = Date.now() - fstat.mtimeMs
      if (ageMs < 120_000) {
        const cached = readJsonFile<WatchHistoryEntry[]>(enrichCachePath)
        if (cached) return cached
      }
    } catch {}
  }

  // Get Graph token
  const token = readGraphToken()
  if (!token?.isValid) return state.history // Can't enrich without token

  // Fetch recent messages with full data (from + attachments)
  try {
    const res = await fetch(
      `https://graph.microsoft.com/v1.0/me/chats/${encodeURIComponent(chatId)}/messages?$top=20`,
      { headers: { Authorization: `Bearer ${token.secret}` } }
    )
    if (!res.ok) return state.history

    const data = await res.json()
    const graphMessages: any[] = data.value || []

    // Build lookup: messageId → { from, parsedCard }
    const msgLookup = new Map<string, { from: string; parsedCard?: ParsedCard }>()
    // Also build time-based lookup for matching (state history uses messageTime)
    const timeLookup = new Map<string, { from: string; parsedCard?: ParsedCard }>()

    for (const msg of graphMessages) {
      const from = msg.from?.user?.displayName
        || msg.from?.application?.displayName
        || 'system'

      let parsedCard: ParsedCard | undefined
      if (Array.isArray(msg.attachments)) {
        for (const att of msg.attachments) {
          if (att.contentType === 'application/vnd.microsoft.card.adaptive' && att.content) {
            try {
              const cardJson = typeof att.content === 'string' ? JSON.parse(att.content) : att.content
              const card = parseSbaCard(cardJson)
              if (card) parsedCard = card
            } catch {}
          }
        }
      }

      if (msg.id) msgLookup.set(msg.id, { from, parsedCard })
      if (msg.createdDateTime) timeLookup.set(msg.createdDateTime, { from, parsedCard })
    }

    // Enrich history entries
    const enriched = state.history.map(entry => {
      // Match by messageTime (most reliable — same as createdDateTime from Graph)
      const match = timeLookup.get(entry.messageTime) || null
      if (!match) return entry

      return {
        ...entry,
        from: match.from !== 'system' ? match.from : entry.from,
        parsedCard: match.parsedCard || entry.parsedCard,
      }
    })

    // Cache enriched result
    writeFileSync(enrichCachePath, JSON.stringify(enriched, null, 2))
    return enriched

  } catch (err) {
    console.warn(`[teams-watch] Enrichment failed for ${watchId}:`, err)
    return state.history
  }
}
