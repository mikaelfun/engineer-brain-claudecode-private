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

  describe('ISS-100: spawn commands use PowerShell Start-Process', () => {
    it('should spawn backend via PowerShell Start-Process with node --watch', async () => {
      // All exec calls succeed (no port listener, PowerShell Start-Process succeeds)
      mockExecImpl
        .mockRejectedValueOnce(new Error('no match')) // findPidByPort — no port listener
        .mockResolvedValueOnce({}) // PowerShell Start-Process for backend

      await restartBackend()

      // Find the PowerShell Start-Process call for backend
      const psCall = mockExecImpl.mock.calls.find(
        (call: unknown[]) => typeof call[0] === 'string' && (call[0] as string).includes('Start-Process') && (call[0] as string).includes('--watch')
      )
      expect(psCall).toBeDefined()
      expect(psCall![0]).toMatch(/node/)
      expect(psCall![0]).toMatch(/--import.*tsx\/esm/)
      expect(psCall![0]).toMatch(/--watch/)
      expect(psCall![0]).toMatch(/src\/index\.ts/)
    })

    it('should spawn frontend via PowerShell Start-Process with npx vite', async () => {
      mockExecImpl
        .mockRejectedValueOnce(new Error('no match')) // findPidByPort — no port listener
        .mockResolvedValueOnce({}) // PowerShell Start-Process for frontend

      await restartFrontend()

      const psCall = mockExecImpl.mock.calls.find(
        (call: unknown[]) => typeof call[0] === 'string' && (call[0] as string).includes('Start-Process') && (call[0] as string).includes('vite')
      )
      expect(psCall).toBeDefined()
      expect(psCall![0]).toMatch(/npx/)
      expect(psCall![0]).toMatch(/vite/)
      expect(psCall![0]).toMatch(/5173/)
    })
  })

  describe('ISS-100: port release retry', () => {
    it('should retry kill if port still occupied after first kill', async () => {
      let callIndex = 0
      const responses: Array<{ resolve?: unknown; reject?: Error }> = [
        { resolve: { stdout: '  TCP    0.0.0.0:5173    0.0.0.0:0    LISTENING    9999\n' } }, // findPidByPort
        { reject: new Error('ps failed') },    // getAllProcessParentInfo
        { resolve: {} },                        // killPid(9999)
        { resolve: { stdout: '  TCP    0.0.0.0:5173    0.0.0.0:0    LISTENING    9998\n' } }, // retry findPidByPort
        { reject: new Error('ps failed') },    // retry getAllProcessParentInfo
        { resolve: {} },                        // killPid(9998)
        { resolve: {} },                        // PowerShell Start-Process frontend
      ]
      // mockReset clears both mockRejectedValue and any previous implementation
      mockExecImpl.mockReset()
      mockExecImpl.mockImplementation(() => {
        const resp = responses[callIndex++]
        if (!resp || resp.reject) return Promise.reject(resp?.reject ?? new Error('no mock'))
        return Promise.resolve(resp.resolve)
      })

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
    it('should call killSavedAndPort on subsequent restart (frontend)', async () => {
      // First call: no port listener, PowerShell Start-Process succeeds
      mockExecImpl
        .mockRejectedValueOnce(new Error('no match')) // findPidByPort — no listener
        .mockResolvedValueOnce({}) // PowerShell Start-Process frontend

      await restartFrontend()

      // Reset mocks for second call
      mockExecImpl.mockReset()
      // Second call: findPidByPort finds a process, kill it, spawn new
      mockExecImpl
        .mockResolvedValueOnce({ stdout: '  TCP    0.0.0.0:5173    0.0.0.0:0    LISTENING    55555\n' }) // findPidByPort
        .mockRejectedValueOnce(new Error('ps failed')) // getAllProcessParentInfo
        .mockResolvedValueOnce({}) // taskkill 55555
        .mockRejectedValueOnce(new Error('no match')) // retry findPidByPort
        .mockResolvedValueOnce({}) // PowerShell Start-Process frontend

      await restartFrontend()

      // Verify taskkill was called for the port listener
      const taskkillCall = mockExecImpl.mock.calls.find(
        (call: unknown[]) => typeof call[0] === 'string' && (call[0] as string).includes('55555')
      )
      expect(taskkillCall).toBeDefined()
      expect(taskkillCall![0]).toBe('taskkill /F /T /PID 55555')
    })
  })

  describe('restartBackend self-exit (no self-kill)', () => {
    it('should NOT kill own port — just spawn new backend and schedule exit', async () => {
      // No saved PID (first run), port 3010 has a listener (which is us)
      // restartBackend should NOT call taskkill on itself
      mockExecImpl
        .mockRejectedValueOnce(new Error('no match')) // no findPidByPort for backend (skipped)
        .mockResolvedValueOnce({}) // PowerShell Start-Process

      await restartBackend()

      // Should NOT have any taskkill calls (we don't kill our own port)
      const taskkillCalls = mockExecImpl.mock.calls.filter(
        (call: unknown[]) => typeof call[0] === 'string' && (call[0] as string).startsWith('taskkill')
      )
      expect(taskkillCalls.length).toBe(0)

      // Should have spawned new backend via PowerShell
      const psCall = mockExecImpl.mock.calls.find(
        (call: unknown[]) => typeof call[0] === 'string' && (call[0] as string).includes('Start-Process') && (call[0] as string).includes('node')
      )
      expect(psCall).toBeDefined()
    })
  })

  describe('restartAll', () => {
    it('should spawn both frontend and backend', async () => {
      // All port lookups return no match (clean state), PowerShell spawns succeed
      mockExecImpl
        .mockRejectedValueOnce(new Error('no match')) // findPidByPort for frontend
        .mockResolvedValueOnce({}) // PowerShell Start-Process frontend
        .mockResolvedValueOnce({}) // PowerShell Start-Process backend

      await restartAll()

      // Should have two Start-Process calls
      const psCalls = mockExecImpl.mock.calls.filter(
        (call: unknown[]) => typeof call[0] === 'string' && (call[0] as string).includes('Start-Process')
      )
      expect(psCalls.length).toBe(2)

      const cmds = psCalls.map((c: unknown[]) => c[0] as string)
      const hasFrontend = cmds.some(c => c.includes('vite'))
      const hasBackend = cmds.some(c => c.includes('--watch'))
      expect(hasFrontend).toBe(true)
      expect(hasBackend).toBe(true)
    })
  })
})
