/**
 * restart-service.ts — 重启前端/后端进程
 *
 * 开发模式下通过 shell 命令杀指定端口进程并 spawn 新进程。
 * Windows 环境使用 taskkill + netstat 定位 PID。
 */
import { exec, spawn } from 'child_process'
import { promisify } from 'util'
import { config } from '../config.js'
import { join } from 'path'
import { abortAllQueries } from '../agent/case-session-manager.js'

const execAsync = promisify(exec)

const FRONTEND_PORT = 5173
const BACKEND_PORT = config.port // default 3001

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

/** Kill a process by PID (Windows) */
async function killPid(pid: number): Promise<void> {
  try {
    await execAsync(`taskkill /F /PID ${pid}`)
  } catch {
    // process may already be dead
  }
}

/** Kill process on a given port */
async function killPort(port: number): Promise<boolean> {
  const pid = await findPidByPort(port)
  if (!pid) return false
  await killPid(pid)
  // Wait a moment for port to be released
  await new Promise(r => setTimeout(r, 500))
  return true
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
  child.unref()
}

export async function restartFrontend(): Promise<{ success: boolean; message: string }> {
  const killed = await killPort(FRONTEND_PORT)
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
  // For backend self-restart: spawn new process first, then exit current
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
  // Restart frontend first (non-destructive to current process)
  await restartFrontend()
  // Then restart backend (will kill current process)
  spawnBackend()
  setTimeout(() => process.exit(0), 500)
  return {
    success: true,
    message: `All services restarting...`,
  }
}
