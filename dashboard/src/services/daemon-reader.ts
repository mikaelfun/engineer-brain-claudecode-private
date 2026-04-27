/**
 * daemon-reader.ts — Token Daemon 状态读取 + 管理
 *
 * 读取 daemon 的 heartbeat、PID、port 文件，返回统一状态。
 * 支持 warmup 启动和 stop 操作。
 */
import { readFileSync, existsSync, unlinkSync } from 'fs'
import { join, resolve } from 'path'
import { execSync, spawn } from 'child_process'
import { config } from '../config.js'

const TEMP = process.env.TEMP || process.env.TMP || '/tmp'
const PID_FILE = join(TEMP, 'pw-token-daemon.pid')
const HEARTBEAT_FILE = join(TEMP, 'pw-token-daemon-heartbeat.json')
const PORT_FILE = join(TEMP, 'pw-token-daemon-port.json')
const HEARTBEAT_STALE_MS = 60_000 // 60s — same as daemon

const DAEMON_SCRIPT = resolve(
  config.projectRoot,
  '.claude', 'skills', 'browser-profiles', 'scripts', 'token-daemon.js'
)

// ── Types ──

export interface TokenStatus {
  name: string
  status: 'ok' | 'expired' | 'session' | 'unknown'
  remainMin: number | null
  ttlMinutes: number
  tab: string
  type: string // 'localStorage' | 'request-intercept' | 'session(none)'
}

export interface DaemonStatus {
  daemon: {
    pid: number | null
    alive: boolean
    heartbeatFresh: boolean
    httpPort: number | null
    startedAt: string | null
    lastHeartbeat: string | null
  }
  tokens: TokenStatus[]
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
    if (process.platform === 'linux') {
      process.kill(pid, 0)
      return true
    }
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

// ── Public API ──

/**
 * 读取 daemon 完整状态（非阻塞，纯文件读取 + PID check）
 */
export function readDaemonStatus(): DaemonStatus {
  // 1. PID — prefer heartbeat PID (written by daemon itself), fallback to PID file
  let pid: number | null = null
  let pidFromFile: number | null = null
  try {
    if (existsSync(PID_FILE)) {
      pidFromFile = parseInt(readFileSync(PID_FILE, 'utf-8').trim(), 10)
      if (isNaN(pidFromFile)) pidFromFile = null
    }
  } catch { /* ignore */ }

  // 2. Heartbeat
  interface HeartbeatData {
    pid: number
    startedAt: string
    lastHeartbeat: string
    tabs: Record<string, { status: string; remainMin: number | null }>
  }
  const hb = readJsonFile<HeartbeatData>(HEARTBEAT_FILE)

  // Use heartbeat PID if available (more authoritative), else PID file
  pid = hb?.pid ?? pidFromFile

  const alive = pid ? isProcessAlive(pid) : false

  let heartbeatFresh = false
  if (hb?.lastHeartbeat) {
    const age = Date.now() - new Date(hb.lastHeartbeat).getTime()
    heartbeatFresh = age < HEARTBEAT_STALE_MS
  }

  // 3. Port
  interface PortData { port: number; pid: number; startedAt: string }
  const portData = readJsonFile<PortData>(PORT_FILE)
  const httpPort = portData?.port ?? null

  // 4. Token 状态 — 优先从 heartbeat 读（daemon 写的实时数据），fallback 读 registry + cache 文件
  const tokens: TokenStatus[] = []

  // 读 registry 获取 token 列表
  const registryPath = resolve(
    config.projectRoot,
    '.claude', 'skills', 'browser-profiles', 'registry.json'
  )
  const registry = readJsonFile<{
    tokens: Record<string, {
      tab: string
      tokenSource: string
      cacheFile: string | null
      cacheTTLMinutes: number
    }>
  }>(registryPath)

  if (registry?.tokens) {
    for (const [name, cfg] of Object.entries(registry.tokens)) {
      if (cfg.tokenSource === 'none') {
        // Session tab (d365)
        tokens.push({
          name,
          status: 'session',
          remainMin: null,
          ttlMinutes: 0,
          tab: cfg.tab,
          type: 'session',
        })
        continue
      }

      // 优先用 heartbeat 数据
      const hbTab = hb?.tabs?.[name]
      if (hbTab && heartbeatFresh) {
        tokens.push({
          name,
          status: hbTab.status as TokenStatus['status'],
          remainMin: hbTab.remainMin,
          ttlMinutes: cfg.cacheTTLMinutes,
          tab: cfg.tab,
          type: cfg.tokenSource,
        })
        continue
      }

      // Fallback: 直接读 cache 文件
      if (cfg.cacheFile) {
        const cacheFilePath = cfg.cacheFile.replace('$TEMP', TEMP)
        const cache = readJsonFile<{
          expiresOn?: string
          timestamp?: number
          fetchedAt?: string
        }>(cacheFilePath)

        let remainMin = -1
        let status: TokenStatus['status'] = 'unknown'

        if (cache) {
          if (cache.expiresOn) {
            const expires = parseInt(cache.expiresOn, 10)
            remainMin = Math.round((expires - Date.now() / 1000) / 60)
          } else if (cache.timestamp) {
            const ageMin = (Date.now() / 1000 - cache.timestamp) / 60
            remainMin = Math.round(cfg.cacheTTLMinutes - ageMin)
          } else if (cache.fetchedAt) {
            const fetched = new Date(cache.fetchedAt).getTime()
            remainMin = Math.round((cfg.cacheTTLMinutes * 60 * 1000 - (Date.now() - fetched)) / 60000)
          }
          status = remainMin > 0 ? 'ok' : 'expired'
        }

        tokens.push({
          name,
          status,
          remainMin: remainMin > 0 ? remainMin : null,
          ttlMinutes: cfg.cacheTTLMinutes,
          tab: cfg.tab,
          type: cfg.tokenSource,
        })
      }
    }
  }

  return {
    daemon: {
      pid,
      alive,
      heartbeatFresh,
      httpPort,
      startedAt: hb?.startedAt ?? null,
      lastHeartbeat: hb?.lastHeartbeat ?? null,
    },
    tokens,
  }
}

/**
 * 后台启动 daemon warmup（非阻塞）
 */
export function spawnDaemonWarmup(): { pid: number | undefined } {
  if (!existsSync(DAEMON_SCRIPT)) {
    console.warn(`[daemon] Script not found: ${DAEMON_SCRIPT}`)
    return { pid: undefined }
  }

  const child = spawn('node', [DAEMON_SCRIPT, 'warmup'], {
    detached: true,
    stdio: 'ignore',
    cwd: config.projectRoot,
    env: { ...process.env, NODE_PATH: process.env.NODE_PATH || '/usr/lib/node_modules' },
  })
  child.unref()

  console.log(`[daemon] Spawned warmup process (PID: ${child.pid})`)
  return { pid: child.pid }
}

/**
 * 停止 daemon（发送 taskkill 给 PID 文件里的进程）
 */
export function stopDaemon(): { stopped: boolean; pid: number | null; error?: string } {
  let pid: number | null = null
  try {
    if (existsSync(PID_FILE)) {
      pid = parseInt(readFileSync(PID_FILE, 'utf-8').trim(), 10)
      if (isNaN(pid)) pid = null
    }
  } catch { /* ignore */ }

  if (!pid) {
    // No PID but stale files may exist — clean up
    cleanupDaemonFiles()
    return { stopped: false, pid: null, error: 'No PID file found' }
  }

  if (!isProcessAlive(pid)) {
    cleanupDaemonFiles()
    return { stopped: false, pid, error: 'Process not alive (cleaned up stale files)' }
  }

  try {
    if (process.platform === 'linux') {
      process.kill(pid, 'SIGTERM')
    } else {
      execSync(`taskkill /PID ${pid} /F /T`, {
        encoding: 'utf-8',
        timeout: 5000,
        stdio: ['pipe', 'pipe', 'pipe'],
      })
    }
    cleanupDaemonFiles()
    return { stopped: true, pid }
  } catch (e: any) {
    return { stopped: false, pid, error: e.message?.substring(0, 100) }
  }
}

function cleanupDaemonFiles(): void {
  for (const f of [PID_FILE, HEARTBEAT_FILE, PORT_FILE]) {
    try { if (existsSync(f)) unlinkSync(f) } catch { /* ignore */ }
  }
}
