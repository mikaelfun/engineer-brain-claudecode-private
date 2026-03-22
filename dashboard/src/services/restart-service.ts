/**
 * restart-service.ts — 重启前端/后端进程
 *
 * 开发模式下通过 shell 命令杀指定端口进程并 spawn 新进程。
 * Windows 环境使用 taskkill + netstat 定位 PID。
 *
 * ISS-089: Fix process tree leak — use /T flag, track spawned PIDs,
 *          killPort before backend restart.
 */
import { exec, spawn } from 'child_process'
import { promisify } from 'util'
import { config } from '../config.js'
import { join } from 'path'
import { abortAllQueries } from '../agent/case-session-manager.js'

const execAsync = promisify(exec)

const FRONTEND_PORT = 5173
const BACKEND_PORT = config.port // default 3001

// ISS-089: Track spawned child PIDs for clean kill on next restart
let lastFrontendPid: number | null = null
let lastBackendPid: number | null = null

/** Find PID listening on a given port (Windows) */
async function findPidByPort(port: number): Promise<number | null> {
  try {
    const { stdout } = await execAsync(
      `netstat -ano | findstr :${port} | findstr LISTENING`
    )
    const lines = stdout.trim().split('\n')
    for (const line of lines) {
      const parts = line.trim().split(/\s+/)
      const pid = parseInt(parts[parts.length - 1], 10)
      if (pid && pid > 0) return pid
    }
    return null
  } catch {
    return null
  }
}

/** Kill a process tree by PID (Windows) — ISS-089: added /T for tree kill */
async function killPid(pid: number): Promise<void> {
  try {
    await execAsync(`taskkill /F /T /PID ${pid}`)
  } catch {
    // process may already be dead
  }
}

/** Kill saved spawned process + port listener as fallback */
async function killSavedAndPort(savedPid: number | null, port: number): Promise<boolean> {
  let killed = false

  // First: kill saved process tree (the cmd.exe root we spawned)
  if (savedPid) {
    console.log(`[restart] Killing saved process tree PID=${savedPid}`)
    await killPid(savedPid)
    killed = true
    // Wait for process tree to die
    await new Promise(r => setTimeout(r, 300))
  }

  // Fallback: kill whatever is still listening on the port
  const portPid = await findPidByPort(port)
  if (portPid) {
    console.log(`[restart] Killing port ${port} listener PID=${portPid}`)
    await killPid(portPid)
    killed = true
    await new Promise(r => setTimeout(r, 300))
  }

  return killed
}

/** Spawn frontend dev server (vite) as detached process */
function spawnFrontend(): void {
  const cwd = join(config.projectRoot, 'dashboard', 'web')
  const child = spawn('npx', ['vite', '--port', String(FRONTEND_PORT)], {
    cwd,
    shell: true,
    detached: true,
    stdio: 'ignore',
  })
  // ISS-089: save PID for clean kill on next restart
  lastFrontendPid = child.pid ?? null
  console.log(`[restart] Spawned frontend PID=${lastFrontendPid}`)
  child.unref()
}

/** Spawn backend dev server (tsx) as detached process */
function spawnBackend(): void {
  const cwd = join(config.projectRoot, 'dashboard')
  const child = spawn('npx', ['tsx', 'src/index.ts'], {
    cwd,
    shell: true,
    detached: true,
    stdio: 'ignore',
    env: { ...process.env, PORT: String(BACKEND_PORT) },
  })
  // ISS-089: save PID for clean kill on next restart
  lastBackendPid = child.pid ?? null
  console.log(`[restart] Spawned backend PID=${lastBackendPid}`)
  child.unref()
}

export async function restartFrontend(): Promise<{ success: boolean; message: string }> {
  // ISS-089: kill saved process tree + port fallback
  const killed = await killSavedAndPort(lastFrontendPid, FRONTEND_PORT)
  lastFrontendPid = null
  spawnFrontend()
  return {
    success: true,
    message: killed
      ? `Frontend (port ${FRONTEND_PORT}) restarted`
      : `Frontend spawned on port ${FRONTEND_PORT} (no existing process found)`,
  }
}

export async function restartBackend(): Promise<{ success: boolean; message: string }> {
  // Abort all active SDK queries before exiting (ISS-086)
  const aborted = abortAllQueries()
  console.log(`[restart] Aborted ${aborted} active queries before backend restart`)
  // ISS-089: kill old backend process tree + port before spawning new one
  await killSavedAndPort(lastBackendPid, BACKEND_PORT)
  lastBackendPid = null
  spawnBackend()
  // Schedule self-exit after response is sent
  setTimeout(() => process.exit(0), 500)
  return {
    success: true,
    message: `Backend (port ${BACKEND_PORT}) restarting...`,
  }
}

export async function restartAll(): Promise<{ success: boolean; message: string }> {
  // Abort all active SDK queries before exiting (ISS-086)
  const aborted = abortAllQueries()
  console.log(`[restart] Aborted ${aborted} active queries before full restart`)
  // ISS-089: kill both saved process trees + ports
  await killSavedAndPort(lastFrontendPid, FRONTEND_PORT)
  lastFrontendPid = null
  await killSavedAndPort(lastBackendPid, BACKEND_PORT)
  lastBackendPid = null
  // Spawn fresh processes
  spawnFrontend()
  spawnBackend()
  setTimeout(() => process.exit(0), 500)
  return {
    success: true,
    message: `All services restarting...`,
  }
}

// Export for testing
export { lastFrontendPid, lastBackendPid, findPidByPort, killPid, killSavedAndPort }
