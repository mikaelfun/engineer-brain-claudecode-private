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
 * ISS-209: Pre-restart orphan scan — kill ALL dashboard-related cmd.exe/node.exe
 *          zombies from previous restarts before spawning new processes.
 */
import { exec, spawn } from 'child_process'
import { promisify } from 'util'
import { config } from '../config.js'
import { join } from 'path'
import { abortAllQueries } from '../agent/case-session-manager.js'

const execAsync = promisify(exec)

const FRONTEND_PORT = config.webPort
const BACKEND_PORT = config.port

// ISS-089: Track spawned child PIDs for clean kill on next restart
let lastFrontendPid: number | null = null
let lastBackendPid: number | null = null

// Process names considered part of Node.js process trees (for tree root traversal)
const NODE_TREE_PROCESS_NAMES = new Set([
  'node.exe', 'cmd.exe', 'pwsh.exe', 'powershell.exe', 'npm.cmd', 'npx.cmd',
  'conhost.exe',
])

/**
 * Command-line patterns that identify dashboard-related processes.
 * Used by cleanupOrphanedDashboardProcesses() to find zombies.
 */
const FRONTEND_CMD_PATTERNS = [
  'npx.*vite.*--port',
  'vite.*--port',
]

const BACKEND_CMD_PATTERNS = [
  'concurrently.*dev:server.*dev:web',
  'npm run dev:server',
  'node.*tsx.*src/index\\.ts',
  'cd web.*npm run dev',
]

const DASHBOARD_CMD_PATTERNS = [
  ...BACKEND_CMD_PATTERNS,
  'npm run dev:web',
  ...FRONTEND_CMD_PATTERNS,
]

const IS_LINUX = process.platform === 'linux'

/** Find PID listening on a given port */
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
 * This ensures we kill the process tree root, not just the child.
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
 * ISS-209: Scan and kill ALL orphaned dashboard-related processes.
 *
 * When dashboard is started via `npm run dev` → `concurrently`, it creates
 * a tree of cmd.exe/node.exe processes. The port-based kill only catches
 * the leaf processes (vite, node tsx), leaving wrapper cmd.exe shells as
 * zombies. Over multiple restarts, these accumulate.
 *
 * This function:
 * 1. Lists all cmd.exe + node.exe processes with command lines
 * 2. Matches against DASHBOARD_CMD_PATTERNS
 * 3. Excludes the current process (our own PID) and its ancestors
 * 4. Kills all matches with /F /T
 *
 * Called before each restart to ensure a clean slate.
 */
async function cleanupOrphanedDashboardProcesses(excludePids?: Set<number>, scope: 'all' | 'backend-only' = 'all'): Promise<number> {
  const myPid = process.pid
  const exclude = excludePids ?? new Set<number>()
  exclude.add(myPid)

  // Also exclude our parent chain (Claude Code, terminal, etc.)
  const processMap = await getAllProcessParentInfo()
  let walkPid = myPid
  for (let i = 0; i < 10; i++) {
    const info = processMap.get(walkPid)
    if (!info || info.parentPid <= 4) break
    exclude.add(info.parentPid)
    walkPid = info.parentPid
  }

  try {
    let pidsToKill: number[] = []
    const patterns = scope === 'backend-only' ? BACKEND_CMD_PATTERNS : DASHBOARD_CMD_PATTERNS

    if (IS_LINUX) {
      const { stdout } = await execAsync(`ps aux`, { maxBuffer: 5 * 1024 * 1024 })
      const lines = stdout.trim().split('\n').slice(1)
      for (const line of lines) {
        const parts = line.trim().split(/\s+/)
        const pid = parseInt(parts[1], 10)
        if (exclude.has(pid)) continue
        const cmdLine = parts.slice(10).join(' ')
        const isDashboard = patterns.some(pattern => {
          try { return new RegExp(pattern, 'i').test(cmdLine) } catch { return false }
        })
        if (isDashboard) pidsToKill.push(pid)
      }
    } else {
      // Get all cmd.exe and node.exe processes with command lines
      const { stdout } = await execAsync(
        `powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \\"Name='cmd.exe' OR Name='node.exe'\\" | Select-Object ProcessId,CommandLine | ConvertTo-Csv -NoTypeInformation"`,
        { maxBuffer: 5 * 1024 * 1024 }
      )

      const lines = stdout.trim().split('\n').filter(l => l.trim().length > 0)
      for (const line of lines) {
        if (line.startsWith('"ProcessId"')) continue // header
        const match = line.match(/^"(\d+)","(.+)"$/)
        if (!match) continue
        const pid = parseInt(match[1], 10)
        const cmdLine = match[2]
        if (exclude.has(pid)) continue
        if (!cmdLine) continue
        const isDashboard = patterns.some(pattern => {
          try { return new RegExp(pattern, 'i').test(cmdLine) } catch { return false }
        })
        if (isDashboard) pidsToKill.push(pid)
      }
    }

    if (pidsToKill.length > 0) {
      console.log(`[restart] Cleaning up ${pidsToKill.length} orphaned dashboard processes: ${pidsToKill.join(', ')}`)
      for (const pid of pidsToKill) {
        await killPid(pid)
      }
      // Brief wait for processes to exit
      await new Promise(r => setTimeout(r, 500))
    } else {
      console.log(`[restart] No orphaned dashboard processes found`)
    }

    return pidsToKill.length
  } catch (err) {
    console.error(`[restart] Orphan cleanup failed:`, err)
    return 0
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
 * Uses PowerShell Start-Process to ensure the process survives parent exit on Windows.
 */
async function spawnFrontend(): Promise<void> {
  const cwd = join(config.projectRoot, 'dashboard', 'web')
  const cmd = `npx vite --port ${FRONTEND_PORT}`
  console.log(`[restart] Spawning frontend: ${cmd} (cwd: ${cwd})`)
  try {
    await execAsync(
      `powershell -NoProfile -Command "Start-Process -FilePath 'cmd' -ArgumentList '/c','npx','vite','--port','${FRONTEND_PORT}' -WorkingDirectory '${cwd}' -WindowStyle Hidden"`,
    )
    console.log(`[restart] Frontend spawn initiated`)
  } catch (e) {
    console.error(`[restart] Failed to spawn frontend:`, e)
  }
}

/**
 * Spawn backend dev server as detached process.
 * Aligned with package.json dev:server script — NO --watch.
 * --watch causes SSE disconnections, zombie process pile-up, and terminal flash popups.
 * Uses PowerShell Start-Process to ensure the process survives parent exit on Windows.
 */
async function spawnBackend(): Promise<void> {
  const cwd = join(config.projectRoot, 'dashboard')
  const cmd = `node --import tsx/esm src/index.ts`
  console.log(`[restart] Spawning backend: ${cmd} (cwd: ${cwd})`)
  try {
    await execAsync(
      `powershell -NoProfile -Command "Start-Process -FilePath 'node' -ArgumentList '--import','tsx/esm','src/index.ts' -WorkingDirectory '${cwd}' -WindowStyle Hidden"`,
    )
    console.log(`[restart] Backend spawn initiated`)
  } catch (e) {
    console.error(`[restart] Failed to spawn backend:`, e)
  }
}

export async function restartFrontend(): Promise<{ success: boolean; message: string }> {
  // ISS-209: Clean up orphaned dashboard processes before restart
  const orphansKilled = await cleanupOrphanedDashboardProcesses()
  const killed = await killSavedAndPort(lastFrontendPid, FRONTEND_PORT)
  lastFrontendPid = null
  await spawnFrontend()
  return {
    success: true,
    message: killed
      ? `Frontend (port ${FRONTEND_PORT}) restarted${orphansKilled > 0 ? ` (cleaned ${orphansKilled} orphans)` : ''}`
      : `Frontend spawned on port ${FRONTEND_PORT} (no existing process found)`,
  }
}

export async function restartBackend(): Promise<{ success: boolean; message: string }> {
  // Abort all active SDK queries before exiting (ISS-086)
  const aborted = abortAllQueries()
  console.log(`[restart] Aborted ${aborted} active queries before backend restart`)
  // ISS-209: Clean up orphaned backend processes only (don't kill frontend)
  await cleanupOrphanedDashboardProcesses(undefined, 'backend-only')
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
  await spawnBackend()
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
  // ISS-209: Clean up ALL orphaned dashboard processes first
  const orphansKilled = await cleanupOrphanedDashboardProcesses()
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
  await spawnFrontend()
  await spawnBackend()
  setTimeout(() => process.exit(0), 500)
  return {
    success: true,
    message: `All services restarting...${orphansKilled > 0 ? ` (cleaned ${orphansKilled} orphans)` : ''}`,
  }
}

// Export for testing
export { lastFrontendPid, lastBackendPid, findPidByPort, killPid, killSavedAndPort, findProcessTreeRoot, getAllProcessParentInfo, cleanupOrphanedDashboardProcesses }
