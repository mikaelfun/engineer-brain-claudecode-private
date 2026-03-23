/**
 * restart-service.ts — 重启前端/后端进程
 *
 * 开发模式下通过 shell 命令杀指定端口进程并 spawn 新进程。
 * Windows 环境使用 taskkill + netstat 定位 PID。
 *
 * ISS-089: Fix process tree leak — use /T flag, track spawned PIDs,
 *          killPort before backend restart.
 * ISS-100: Fix --watch mode process kill + align spawn commands with
 *          package.json dev scripts.
 */
import { exec, spawn } from 'child_process'
import { promisify } from 'util'
import { config } from '../config.js'
import { join } from 'path'
import { abortAllQueries } from '../agent/case-session-manager.js'

const execAsync = promisify(exec)

const FRONTEND_PORT = 5173
const BACKEND_PORT = config.port // default 3010

// ISS-089: Track spawned child PIDs for clean kill on next restart
let lastFrontendPid: number | null = null
let lastBackendPid: number | null = null

// Process names considered part of Node.js process trees (for tree root traversal)
const NODE_TREE_PROCESS_NAMES = new Set([
  'node.exe', 'cmd.exe', 'pwsh.exe', 'powershell.exe', 'npm.cmd', 'npx.cmd',
  'conhost.exe',
])

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

/**
 * ISS-100: Get all process parent info in a single PowerShell call.
 * Returns a Map of PID → { parentPid, processName }.
 * This avoids cold-starting PowerShell for each getParentInfo call.
 */
async function getAllProcessParentInfo(): Promise<Map<number, { parentPid: number; processName: string }>> {
  const map = new Map<number, { parentPid: number; processName: string }>()
  try {
    const { stdout } = await execAsync(
      `powershell -NoProfile -Command "Get-CimInstance Win32_Process | Select-Object ProcessId,Name,ParentProcessId | ConvertTo-Csv -NoTypeInformation"`,
      { maxBuffer: 10 * 1024 * 1024 } // 10MB buffer for all processes
    )
    const lines = stdout.trim().split('\n').filter(l => l.trim().length > 0)
    for (const line of lines) {
      if (line.trim().startsWith('"ProcessId"')) continue // skip header
      // Parse CSV: "12345","node.exe","67890"
      const match = line.match(/"(\d+)","([^"]+)","(\d+)"/)
      if (match) {
        const pid = parseInt(match[1], 10)
        const processName = match[2].trim().toLowerCase()
        const parentPid = parseInt(match[3], 10)
        if (pid > 0) {
          map.set(pid, { parentPid, processName })
        }
      }
    }
  } catch {
    // PowerShell failed — return empty map, caller will use original PID
  }
  return map
}

/**
 * ISS-100: Find the root of a Node.js process tree.
 *
 * Given a child PID (e.g., the process listening on a port), walk up
 * the parent chain as long as the parent is a Node.js/cmd/shell process.
 * Returns the topmost PID in the tree that is still part of the chain.
 *
 * Uses a single PowerShell call to get all process info, then traverses in memory.
 * This ensures we kill the --watch watcher parent, not just the child.
 * Max depth of 10 to prevent infinite loops.
 */
async function findProcessTreeRoot(pid: number): Promise<number> {
  const processMap = await getAllProcessParentInfo()
  if (processMap.size === 0) return pid // PowerShell failed

  let currentPid = pid
  const visited = new Set<number>()

  for (let depth = 0; depth < 10; depth++) {
    if (visited.has(currentPid)) break // cycle detection
    visited.add(currentPid)

    const info = processMap.get(currentPid)
    if (!info) break // process not found

    const { parentPid } = info

    // Don't go above PID 4 (System) or PID 0 (Idle)
    if (parentPid <= 4) break

    // Check if parent itself is a Node.js/shell process
    const parentInfo = processMap.get(parentPid)
    if (!parentInfo) break

    if (NODE_TREE_PROCESS_NAMES.has(parentInfo.processName)) {
      // Parent is a node/cmd/shell process — it's part of our tree, go up
      currentPid = parentPid
    } else {
      // Parent is something else (explorer, svchost, etc.) — we found the root
      break
    }
  }

  return currentPid
}

/** Kill a process tree by PID (Windows) — ISS-089: added /T for tree kill */
async function killPid(pid: number): Promise<void> {
  try {
    await execAsync(`taskkill /F /T /PID ${pid}`)
  } catch {
    // process may already be dead
  }
}

/**
 * Kill saved spawned process + port listener as fallback.
 * ISS-100: Walk up process tree to find and kill the root (--watch watcher).
 *          Retry port check after kill to handle watcher respawn race.
 */
async function killSavedAndPort(savedPid: number | null, port: number): Promise<boolean> {
  let killed = false

  // First: kill saved process tree (the cmd.exe root we spawned)
  if (savedPid) {
    console.log(`[restart] Killing saved process tree PID=${savedPid}`)
    await killPid(savedPid)
    killed = true
    await new Promise(r => setTimeout(r, 300))
  }

  // Fallback: kill whatever is still listening on the port
  // ISS-100: Walk up to find tree root (catches --watch watcher parent)
  const portPid = await findPidByPort(port)
  if (portPid) {
    const rootPid = await findProcessTreeRoot(portPid)
    if (rootPid !== portPid) {
      console.log(`[restart] Port ${port} listener PID=${portPid}, tree root PID=${rootPid}`)
    } else {
      console.log(`[restart] Killing port ${port} listener PID=${portPid}`)
    }
    await killPid(rootPid)
    killed = true
    await new Promise(r => setTimeout(r, 500))

    // ISS-100: Retry — check if port is still occupied (watcher may have respawned)
    const retryPid = await findPidByPort(port)
    if (retryPid) {
      console.log(`[restart] Port ${port} still occupied after kill (PID=${retryPid}), retrying...`)
      const retryRoot = await findProcessTreeRoot(retryPid)
      await killPid(retryRoot)
      await new Promise(r => setTimeout(r, 500))
    }
  }

  return killed
}

/**
 * Spawn frontend dev server (vite) as detached process.
 * ISS-100: Aligned with package.json dev:web script.
 */
function spawnFrontend(): void {
  const cwd = join(config.projectRoot, 'dashboard', 'web')
  const cmd = 'npx'
  const args = ['vite', '--port', String(FRONTEND_PORT)]
  console.log(`[restart] Spawning frontend: ${cmd} ${args.join(' ')} (cwd: ${cwd})`)
  const child = spawn(cmd, args, {
    cwd,
    shell: true,
    detached: true,
    stdio: 'ignore',
  })
  lastFrontendPid = child.pid ?? null
  console.log(`[restart] Spawned frontend PID=${lastFrontendPid}`)
  child.unref()
}

/**
 * Spawn backend dev server as detached process.
 * ISS-100: Aligned with package.json dev:server script — uses node --watch.
 */
function spawnBackend(): void {
  const cwd = join(config.projectRoot, 'dashboard')
  const cmd = 'node'
  const args = ['--import', 'tsx/esm', '--watch', 'src/index.ts']
  console.log(`[restart] Spawning backend: ${cmd} ${args.join(' ')} (cwd: ${cwd})`)
  const child = spawn(cmd, args, {
    cwd,
    shell: true,
    detached: true,
    stdio: 'ignore',
    env: { ...process.env, PORT: String(BACKEND_PORT) },
  })
  lastBackendPid = child.pid ?? null
  console.log(`[restart] Spawned backend PID=${lastBackendPid}`)
  child.unref()
}

export async function restartFrontend(): Promise<{ success: boolean; message: string }> {
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
  // NOTE: Do NOT kill own port — we ARE the backend process on BACKEND_PORT.
  // taskkill /T on our own tree would kill us before spawn runs.
  // Instead: kill saved PID from previous restart (if any), spawn new backend,
  // then exit. The new detached process will bind the port after we release it.
  if (lastBackendPid) {
    console.log(`[restart] Killing previously spawned backend PID=${lastBackendPid}`)
    await killPid(lastBackendPid)
    await new Promise(r => setTimeout(r, 300))
  }
  lastBackendPid = null
  spawnBackend()
  // Schedule self-exit after response is sent — port is released on exit,
  // allowing the newly spawned backend to bind it.
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
  // Kill frontend (safe — we are not the frontend process)
  await killSavedAndPort(lastFrontendPid, FRONTEND_PORT)
  lastFrontendPid = null
  // Kill saved backend PID only (not our own port — see restartBackend comment)
  if (lastBackendPid) {
    console.log(`[restart] Killing previously spawned backend PID=${lastBackendPid}`)
    await killPid(lastBackendPid)
    await new Promise(r => setTimeout(r, 300))
  }
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
export { lastFrontendPid, lastBackendPid, findPidByPort, killPid, killSavedAndPort, findProcessTreeRoot, getAllProcessParentInfo }
