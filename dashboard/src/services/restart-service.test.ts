/**
 * restart-service.test.ts — Unit tests for restart-service
 *
 * ISS-089: Verify process tree kill, PID tracking, and killPort on backend restart.
 * ISS-100: Verify process tree root traversal, --watch mode spawn, port retry.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock child_process
const mockExecImpl = vi.fn()
const mockSpawn = vi.fn()
vi.mock('child_process', () => ({
  exec: (...args: unknown[]) => mockExecImpl(...args),
  spawn: (...args: unknown[]) => mockSpawn(...args),
}))

// Mock util.promisify to return a function that wraps our mockExecImpl
vi.mock('util', () => ({
  promisify: () => (...args: unknown[]) => mockExecImpl(...args),
}))

// Mock config
vi.mock('../config.js', () => ({
  config: { port: 3010, projectRoot: 'C:\\mock\\project' },
}))

// Mock case-session-manager
vi.mock('../agent/case-session-manager.js', () => ({
  abortAllQueries: vi.fn(() => 0),
}))

// Mock process.exit
vi.spyOn(process, 'exit').mockImplementation((() => {}) as never)

/**
 * Helper: build a PowerShell CSV stdout for getAllProcessParentInfo.
 * Takes an array of [pid, name, parentPid] tuples.
 */
function buildProcessCsv(processes: [number, string, number][]): string {
  const header = '"ProcessId","Name","ParentProcessId"'
  const rows = processes.map(([pid, name, ppid]) => `"${pid}","${name}","${ppid}"`)
  return [header, ...rows].join('\n') + '\n'
}

describe('restart-service', () => {
  let restartFrontend: () => Promise<{ success: boolean; message: string }>
  let restartBackend: () => Promise<{ success: boolean; message: string }>
  let restartAll: () => Promise<{ success: boolean; message: string }>

  beforeEach(async () => {
    vi.clearAllMocks()

    // Default: spawn returns a mock child with pid and unref
    mockSpawn.mockReturnValue({
      pid: 12345,
      unref: vi.fn(),
    })

    // Default: exec rejects (no process found on port)
    mockExecImpl.mockRejectedValue(new Error('no match'))

    // Re-import to get fresh module state (resets lastFrontendPid/lastBackendPid)
    vi.resetModules()
    const mod = await import('./restart-service.js')
    restartFrontend = mod.restartFrontend
    restartBackend = mod.restartBackend
    restartAll = mod.restartAll
  })

  // NOTE: Do NOT use vi.restoreAllMocks() — process.exit mock must stay as no-op
  // for pending setTimeout(() => process.exit(0), 500) timers in restartBackend/restartAll.
  // Do NOT use vi.useFakeTimers() — killSavedAndPort uses real setTimeout awaits.

  describe('killPid uses /T flag for tree kill', () => {
    it('should include /T in taskkill command', async () => {
      // findPidByPort returns a PID for port 5173
      mockExecImpl
        .mockResolvedValueOnce({ stdout: '  TCP    0.0.0.0:5173    0.0.0.0:0    LISTENING    9999\n' })
        // getAllProcessParentInfo — returns process list (PowerShell fails → empty)
        .mockRejectedValueOnce(new Error('ps failed'))
        .mockResolvedValueOnce({}) // taskkill
        .mockRejectedValueOnce(new Error('no match')) // retry findPidByPort

      await restartFrontend()

      const taskkillCall = mockExecImpl.mock.calls.find(
        (call: unknown[]) => typeof call[0] === 'string' && (call[0] as string).startsWith('taskkill')
      )
      expect(taskkillCall).toBeDefined()
      expect(taskkillCall![0]).toMatch(/taskkill \/F \/T \/PID/)
    })
  })

  describe('ISS-100: findProcessTreeRoot', () => {
    it('should return same PID when parent is not a node process', async () => {
      vi.resetModules()
      const mod = await import('./restart-service.js')
      const { findProcessTreeRoot } = mod

      // Process map: PID 1000 (node.exe, parent=500), PID 500 (explorer.exe, parent=100)
      // → 500 is explorer.exe, not in NODE_TREE_PROCESS_NAMES → return 1000
      mockExecImpl
        .mockResolvedValueOnce({ stdout: buildProcessCsv([
          [1000, 'node.exe', 500],
          [500, 'explorer.exe', 100],
        ])})

      const root = await findProcessTreeRoot(1000)
      expect(root).toBe(1000)
    })

    it('should walk up through node.exe parents', async () => {
      vi.resetModules()
      const mod = await import('./restart-service.js')
      const { findProcessTreeRoot } = mod

      // Process tree:
      //   3000 (node.exe) → parent 2000 (cmd.exe) → parent 1000 (node.exe) → parent 500 (explorer.exe)
      // Walk: 3000→parent=2000, 2000 is cmd.exe (in set) → go to 2000
      //       2000→parent=1000, 1000 is node.exe (in set) → go to 1000
      //       1000→parent=500, 500 is explorer.exe (not in set) → stop
      // return 1000
      mockExecImpl
        .mockResolvedValueOnce({ stdout: buildProcessCsv([
          [3000, 'node.exe', 2000],
          [2000, 'cmd.exe', 1000],
          [1000, 'node.exe', 500],
          [500, 'explorer.exe', 1],
        ])})

      const root = await findProcessTreeRoot(3000)
      expect(root).toBe(1000)
    })

    it('should stop at system PID (<=4)', async () => {
      vi.resetModules()
      const mod = await import('./restart-service.js')
      const { findProcessTreeRoot } = mod

      // PID 1000 (node.exe, parent=4) — System process, don't go higher
      mockExecImpl
        .mockResolvedValueOnce({ stdout: buildProcessCsv([
          [1000, 'node.exe', 4],
        ])})

      const root = await findProcessTreeRoot(1000)
      expect(root).toBe(1000)
    })

    it('should handle PowerShell failure gracefully', async () => {
      vi.resetModules()
      const mod = await import('./restart-service.js')
      const { findProcessTreeRoot } = mod

      mockExecImpl.mockRejectedValue(new Error('ps failed'))

      const root = await findProcessTreeRoot(1000)
      expect(root).toBe(1000) // returns original PID
    })
  })

  describe('ISS-100: spawn commands align with dev scripts', () => {
    it('should spawn backend with node --watch (aligned with dev:server)', async () => {
      mockSpawn.mockReturnValue({ pid: 66666, unref: vi.fn() })

      await restartBackend()

      expect(mockSpawn).toHaveBeenCalledWith(
        'node',
        ['--import', 'tsx/esm', '--watch', 'src/index.ts'],
        expect.objectContaining({ shell: true, detached: true })
      )
    })

    it('should spawn frontend with npx vite (aligned with dev:web)', async () => {
      mockSpawn.mockReturnValue({ pid: 55555, unref: vi.fn() })

      await restartFrontend()

      expect(mockSpawn).toHaveBeenCalledWith(
        'npx',
        ['vite', '--port', '5173'],
        expect.objectContaining({ shell: true, detached: true })
      )
    })
  })

  describe('ISS-100: port release retry', () => {
    it('should retry kill if port still occupied after first kill', async () => {
      // First findPidByPort → 9999
      mockExecImpl
        .mockResolvedValueOnce({ stdout: '  TCP    0.0.0.0:5173    0.0.0.0:0    LISTENING    9999\n' })
        // getAllProcessParentInfo fails → returns 9999 as-is
        .mockRejectedValueOnce(new Error('ps failed'))
        // killPid(9999)
        .mockResolvedValueOnce({})
        // Retry findPidByPort → 9998 (watcher respawned!)
        .mockResolvedValueOnce({ stdout: '  TCP    0.0.0.0:5173    0.0.0.0:0    LISTENING    9998\n' })
        // getAllProcessParentInfo fails → returns 9998 as-is
        .mockRejectedValueOnce(new Error('ps failed'))
        // killPid(9998)
        .mockResolvedValueOnce({})

      await restartFrontend()

      // Should have two taskkill calls (original + retry)
      const taskkillCalls = mockExecImpl.mock.calls.filter(
        (call: unknown[]) => typeof call[0] === 'string' && (call[0] as string).includes('taskkill')
      )
      expect(taskkillCalls.length).toBe(2)
      expect(taskkillCalls[0][0]).toMatch(/9999/)
      expect(taskkillCalls[1][0]).toMatch(/9998/)
    })
  })

  describe('spawn PID tracking', () => {
    it('should kill saved PID on subsequent restart', async () => {
      // First call: spawn returns PID 55555, no port listener
      mockSpawn.mockReturnValue({ pid: 55555, unref: vi.fn() })
      mockExecImpl.mockRejectedValue(new Error('no match'))

      await restartFrontend()

      // Reset mocks for second call
      mockExecImpl.mockReset()
      // Second call: killPid(55555) then findPidByPort fallback
      mockExecImpl
        .mockResolvedValueOnce({}) // taskkill /F /T /PID 55555
        .mockRejectedValueOnce(new Error('no match')) // findPidByPort fallback
      mockSpawn.mockReturnValue({ pid: 77777, unref: vi.fn() })

      await restartFrontend()

      // Verify taskkill was called with the previously saved PID
      const taskkillCall = mockExecImpl.mock.calls.find(
        (call: unknown[]) => typeof call[0] === 'string' && (call[0] as string).includes('55555')
      )
      expect(taskkillCall).toBeDefined()
      expect(taskkillCall![0]).toBe('taskkill /F /T /PID 55555')
    })
  })

  describe('restartBackend kills port', () => {
    it('should kill backend port listener before spawning new process', async () => {
      // No saved PID (first run), but port 3010 has a listener
      mockExecImpl
        .mockResolvedValueOnce({ stdout: '  TCP    0.0.0.0:3010    0.0.0.0:0    LISTENING    8888\n' }) // findPidByPort(3010)
        .mockRejectedValueOnce(new Error('ps failed')) // getAllProcessParentInfo fails → returns 8888
        .mockResolvedValueOnce({}) // taskkill /F /T /PID 8888
        .mockRejectedValueOnce(new Error('no match')) // retry findPidByPort — port freed

      await restartBackend()

      // Verify taskkill was called for port 3010 listener
      const taskkillCall = mockExecImpl.mock.calls.find(
        (call: unknown[]) => typeof call[0] === 'string' && (call[0] as string).startsWith('taskkill')
      )
      expect(taskkillCall).toBeDefined()
      expect(taskkillCall![0]).toBe('taskkill /F /T /PID 8888')
    })
  })

  describe('restartAll', () => {
    it('should spawn both frontend and backend', async () => {
      // All port lookups return no match (clean state)
      mockExecImpl.mockRejectedValue(new Error('no match'))
      mockSpawn.mockReturnValue({ pid: 11111, unref: vi.fn() })

      await restartAll()

      // Should spawn exactly 2 processes
      expect(mockSpawn).toHaveBeenCalledTimes(2)

      const spawnCmds = mockSpawn.mock.calls.map((c: unknown[]) => c[0] as string)
      const hasViteFrontend = spawnCmds.includes('npx')
      const hasNodeBackend = spawnCmds.includes('node')
      expect(hasViteFrontend).toBe(true)
      expect(hasNodeBackend).toBe(true)
    })
  })
})
