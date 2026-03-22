/**
 * restart-service.test.ts — Unit tests for restart-service
 *
 * ISS-089: Verify process tree kill, PID tracking, and killPort on backend restart.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

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
  // Do NOT use vi.useFakeTimers() — killSavedAndPort uses real setTimeout(300ms) awaits.

  describe('killPid uses /T flag for tree kill', () => {
    it('should include /T in taskkill command', async () => {
      // findPidByPort returns a PID for port 5173
      mockExecImpl
        .mockResolvedValueOnce({ stdout: '  TCP    0.0.0.0:5173    0.0.0.0:0    LISTENING    9999\n' })
        .mockResolvedValueOnce({}) // taskkill succeeds
        .mockRejectedValueOnce(new Error('no match')) // second findPidByPort (fallback) — no more

      await restartFrontend()

      // Find the taskkill call among all exec calls
      const taskkillCall = mockExecImpl.mock.calls.find(
        (call: unknown[]) => typeof call[0] === 'string' && (call[0] as string).includes('taskkill')
      )
      expect(taskkillCall).toBeDefined()
      expect(taskkillCall![0]).toMatch(/taskkill \/F \/T \/PID 9999/)
    })
  })

  describe('spawn PID tracking', () => {
    it('should call spawn for frontend with correct args', async () => {
      mockSpawn.mockReturnValue({ pid: 55555, unref: vi.fn() })

      await restartFrontend()

      expect(mockSpawn).toHaveBeenCalledWith(
        'npx',
        ['vite', '--port', '5173'],
        expect.objectContaining({ shell: true, detached: true })
      )
    })

    it('should call spawn for backend with correct args', async () => {
      mockSpawn.mockReturnValue({ pid: 66666, unref: vi.fn() })

      await restartBackend()

      expect(mockSpawn).toHaveBeenCalledWith(
        'npx',
        ['tsx', 'src/index.ts'],
        expect.objectContaining({ shell: true, detached: true })
      )
    })

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
        .mockResolvedValueOnce({}) // taskkill /F /T /PID 8888
        .mockRejectedValueOnce(new Error('no match')) // second findPidByPort check

      await restartBackend()

      // Verify taskkill was called for port 3010 listener
      const taskkillCall = mockExecImpl.mock.calls.find(
        (call: unknown[]) => typeof call[0] === 'string' && (call[0] as string).includes('8888')
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

      const spawnArgs = mockSpawn.mock.calls.map((c: unknown[]) => (c[1] as string[]))
      const hasFrontend = spawnArgs.some(args => args.includes('vite'))
      const hasBackend = spawnArgs.some(args => args.includes('tsx'))
      expect(hasFrontend).toBe(true)
      expect(hasBackend).toBe(true)
    })

    // Note: process.exit via setTimeout is not tested — vitest intercepts it.
    // The setTimeout(() => process.exit(0), 500) pattern is standard and not worth testing.
  })
})
