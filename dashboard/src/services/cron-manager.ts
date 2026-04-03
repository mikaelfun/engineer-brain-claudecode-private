/**
 * cron-manager.ts — Self-managed cron job CRUD + scheduler
 *
 * Manages cron jobs stored in cron-jobs.json. Provides CRUD operations
 * and a simple setInterval-based scheduler that executes prompts via Claude CLI.
 * Broadcasts SSE events for real-time UI feedback.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { dirname } from 'path'
import { spawn, type ChildProcess } from 'child_process'
import { config } from '../config.js'
import { sseManager } from '../watcher/sse-manager.js'
import type { CronJob } from '../types/index.js'

// ---- In-memory state ----

let jobs: CronJob[] = []
let timers: Map<string, ReturnType<typeof setInterval>> = new Map()
/** Track running trigger subprocesses for cancellation */
let runningProcesses: Map<string, ChildProcess> = new Map()

// ---- File I/O ----

function loadJobs(): CronJob[] {
  if (!existsSync(config.cronJobsFile)) return []
  try {
    const content = readFileSync(config.cronJobsFile, 'utf-8')
    const data = JSON.parse(content)
    return (data.jobs || []) as CronJob[]
  } catch {
    return []
  }
}

function saveJobs(): void {
  const dir = dirname(config.cronJobsFile)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  writeFileSync(config.cronJobsFile, JSON.stringify({ jobs }, null, 2), 'utf-8')
}

// ---- Cron expression → interval ms ----

function cronToIntervalMs(expr: string): number | null {
  // Support basic cron patterns: */N * * * * (every N minutes), 0 */N * * * (every N hours)
  const parts = expr.trim().split(/\s+/)
  if (parts.length !== 5) return null

  const [minute, hour] = parts

  // */N * * * * → every N minutes
  if (minute.startsWith('*/') && hour === '*') {
    const n = parseInt(minute.slice(2))
    if (!isNaN(n) && n > 0) return n * 60 * 1000
  }

  // 0 */N * * * → every N hours
  if (minute === '0' && hour.startsWith('*/')) {
    const n = parseInt(hour.slice(2))
    if (!isNaN(n) && n > 0) return n * 60 * 60 * 1000
  }

  // N * * * * → specific minute, treat as hourly
  if (/^\d+$/.test(minute) && hour === '*') {
    return 60 * 60 * 1000
  }

  // Fallback: unsupported pattern → null (won't auto-schedule)
  return null
}

// ---- Execution Engine ----
//
// NOTE: Prompt is passed to `claude -p` as-is. Slash commands like
// `/onenote-export sync` work correctly in -p mode (tested 2026-04-02).
// Previous `formatPromptForPrintMode()` rewrites BROKE the prompt by
// stripping the slash command format that the CLI relies on for skill
// invocation. DO NOT add prompt rewriting — pass through verbatim.

const CRON_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes default
const MAX_OUTPUT_LENGTH = 2000

interface ExecutionResult {
  success: boolean
  output: string
  durationMs: number
  exitCode: number | null
  error?: string
  cancelled?: boolean
}

/**
 * Execute a cron prompt via Claude CLI subprocess.
 * Broadcasts SSE events for real-time UI feedback.
 * Supports cancellation via runningProcesses map.
 */
async function executeCronPrompt(triggerId: string, prompt: string): Promise<ExecutionResult> {
  const startMs = Date.now()

  // Broadcast start
  sseManager.broadcast('trigger-started', {
    triggerId,
    prompt,
    startedAt: new Date().toISOString(),
  })

  return new Promise((resolve) => {
    const chunks: Buffer[] = []
    const errChunks: Buffer[] = []
    let outputSoFar = ''

    const child = spawn('claude', ['-p'], {
      cwd: config.projectRoot,
      shell: true,
      timeout: CRON_TIMEOUT_MS,
      env: { ...process.env },
    })

    // Pipe prompt via stdin to avoid shell quoting issues with long prompts
    child.stdin.write(prompt)
    child.stdin.end()

    // Track for cancellation
    runningProcesses.set(triggerId, child)

    // Stream stdout in real-time
    child.stdout.on('data', (data: Buffer) => {
      chunks.push(data)
      const newText = data.toString('utf-8')
      outputSoFar += newText
      // Broadcast progress with latest output chunk
      sseManager.broadcast('trigger-progress', {
        triggerId,
        chunk: newText,
        elapsedMs: Date.now() - startMs,
        outputLength: outputSoFar.length,
      })
    })

    child.stderr.on('data', (data: Buffer) => errChunks.push(data))

    child.on('close', (code, signal) => {
      runningProcesses.delete(triggerId)
      const durationMs = Date.now() - startMs
      const stdout = Buffer.concat(chunks).toString('utf-8')
      const stderr = Buffer.concat(errChunks).toString('utf-8')
      const output = (stdout || stderr).slice(-MAX_OUTPUT_LENGTH)
      const cancelled = signal === 'SIGTERM' || signal === 'SIGKILL'

      if (cancelled) {
        sseManager.broadcast('trigger-cancelled', {
          triggerId,
          durationMs,
        })
      } else if (code === 0) {
        sseManager.broadcast('trigger-completed', {
          triggerId,
          durationMs,
          outputPreview: output.slice(0, 300),
        })
      } else {
        sseManager.broadcast('trigger-failed', {
          triggerId,
          durationMs,
          exitCode: code,
          error: stderr.slice(0, 500),
        })
      }

      resolve({
        success: code === 0,
        output,
        durationMs,
        exitCode: code,
        error: code !== 0 && !cancelled ? `Exit code ${code}: ${stderr.slice(0, 500)}` : undefined,
        cancelled,
      })
    })

    child.on('error', (err) => {
      runningProcesses.delete(triggerId)
      const durationMs = Date.now() - startMs
      sseManager.broadcast('trigger-failed', {
        triggerId,
        durationMs,
        error: err.message,
      })
      resolve({
        success: false,
        output: '',
        durationMs,
        exitCode: null,
        error: `Spawn error: ${err.message}`,
      })
    })
  })
}

// ---- Scheduler ----

function scheduleJob(job: CronJob): void {
  if (!job.enabled) return

  const intervalMs = cronToIntervalMs(job.schedule.expr || '')
  if (!intervalMs) {
    console.log(`[cron-manager] Cannot schedule job ${job.id}: unsupported cron expression "${job.schedule.expr}"`)
    return
  }

  // Clear existing timer if any
  if (timers.has(job.id)) {
    clearInterval(timers.get(job.id)!)
  }

  // Calculate next run
  job.state = job.state || {}
  job.state.nextRunAtMs = Date.now() + intervalMs

  const timer = setInterval(async () => {
    const prompt = (job as any).prompt || job.name
    console.log(`[cron-manager] Executing job: ${job.name} (${job.id}) — prompt: "${prompt}"`)

    const result = await executeCronPrompt(job.id, prompt)

    job.state = job.state || {}
    job.state.lastRunAtMs = Date.now() - result.durationMs
    job.state.lastDurationMs = result.durationMs
    job.state.lastStatus = result.cancelled ? 'cancelled' : result.success ? 'success' : 'error'
    job.state.lastError = result.error
    job.state.lastOutput = result.output
    job.state.consecutiveErrors = result.success ? 0 : (job.state.consecutiveErrors || 0) + 1
    job.state.nextRunAtMs = Date.now() + intervalMs

    if (!result.success && !result.cancelled) {
      console.error(`[cron-manager] Job ${job.id} failed (exit ${result.exitCode}): ${result.error}`)
    } else {
      console.log(`[cron-manager] Job ${job.id} ${result.cancelled ? 'cancelled' : 'succeeded'} in ${(result.durationMs / 1000).toFixed(1)}s`)
    }

    saveJobs()
  }, intervalMs)

  timers.set(job.id, timer)
  console.log(`[cron-manager] Scheduled job ${job.id}: "${job.name}" every ${intervalMs / 1000}s`)
}

function unscheduleJob(jobId: string): void {
  const timer = timers.get(jobId)
  if (timer) {
    clearInterval(timer)
    timers.delete(jobId)
  }
}

// ---- Public API ----

export function initCronManager(): void {
  jobs = loadJobs()
  // Schedule all enabled jobs
  for (const job of jobs) {
    if (job.enabled) {
      scheduleJob(job)
    }
  }
  console.log(`[cron-manager] Initialized with ${jobs.length} jobs (${jobs.filter(j => j.enabled).length} enabled)`)
}

export function listTriggers(): CronJob[] {
  return jobs
}

export function getTrigger(id: string): CronJob | undefined {
  return jobs.find(j => j.id === id)
}

/** Check if a trigger is currently running */
export function isTriggerRunning(id: string): boolean {
  return runningProcesses.has(id)
}

/** Get all running trigger IDs */
export function getRunningTriggerIds(): string[] {
  return Array.from(runningProcesses.keys())
}

export interface CreateTriggerInput {
  name: string         // Human-readable name / prompt to execute
  prompt: string       // The actual prompt/command to run
  cron: string         // Cron expression (e.g., "0 */3 * * *")
  description?: string // Optional description
}

export function createTrigger(input: CreateTriggerInput): CronJob {
  const id = `trigger_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
  const now = Date.now()

  const job: CronJob = {
    id,
    agentId: 'self-managed',
    name: input.name,
    enabled: true,
    createdAtMs: now,
    updatedAtMs: now,
    schedule: {
      kind: 'cron',
      expr: input.cron,
    },
    state: {
      nextRunAtMs: undefined,
      lastRunAtMs: undefined,
      lastStatus: undefined,
      lastDurationMs: undefined,
      lastError: undefined,
      consecutiveErrors: 0,
    },
  }

  // Store prompt in a custom field (extend CronJob or embed in name)
  // For simplicity, store the prompt as the name and description separately
  ;(job as any).prompt = input.prompt
  ;(job as any).description = input.description || ''

  jobs.push(job)
  saveJobs()
  scheduleJob(job)

  return job
}

export function deleteTrigger(id: string): boolean {
  const idx = jobs.findIndex(j => j.id === id)
  if (idx === -1) return false

  // Cancel if running
  cancelTrigger(id)
  unscheduleJob(id)
  jobs.splice(idx, 1)
  saveJobs()

  return true
}

export async function runTriggerNow(id: string): Promise<{ success: boolean; error?: string }> {
  const job = jobs.find(j => j.id === id)
  if (!job) return { success: false, error: 'Trigger not found' }

  // Prevent double-run
  if (runningProcesses.has(id)) {
    return { success: false, error: 'Trigger is already running' }
  }

  const prompt = (job as any).prompt || job.name
  console.log(`[cron-manager] Manual trigger: ${job.name} (${job.id}) — prompt: "${prompt}"`)

  const result = await executeCronPrompt(id, prompt)

  job.state = job.state || {}
  job.state.lastRunAtMs = Date.now() - result.durationMs
  job.state.lastDurationMs = result.durationMs
  job.state.lastStatus = result.cancelled ? 'cancelled' : result.success ? 'success' : 'error'
  job.state.lastError = result.error
  job.state.lastOutput = result.output
  job.state.consecutiveErrors = result.success ? 0 : (job.state.consecutiveErrors || 0) + 1
  saveJobs()

  if (!result.success && !result.cancelled) {
    console.error(`[cron-manager] Manual trigger ${job.id} failed (exit ${result.exitCode}): ${result.error}`)
  } else {
    console.log(`[cron-manager] Manual trigger ${job.id} ${result.cancelled ? 'cancelled' : 'succeeded'} in ${(result.durationMs / 1000).toFixed(1)}s`)
  }

  return { success: result.success, error: result.error }
}

/** Cancel a running trigger by killing its subprocess */
export function cancelTrigger(id: string): boolean {
  const child = runningProcesses.get(id)
  if (!child) return false

  try {
    // On Windows, use taskkill for the process tree
    if (process.platform === 'win32') {
      spawn('taskkill', ['/F', '/T', '/PID', String(child.pid)], { shell: true })
    } else {
      child.kill('SIGTERM')
    }
    console.log(`[cron-manager] Cancelled trigger: ${id} (PID ${child.pid})`)
    return true
  } catch (err: any) {
    console.error(`[cron-manager] Failed to cancel trigger ${id}:`, err.message)
    return false
  }
}

export function toggleTrigger(id: string, enabled: boolean): CronJob | null {
  const job = jobs.find(j => j.id === id)
  if (!job) return null

  job.enabled = enabled
  job.updatedAtMs = Date.now()

  if (enabled) {
    scheduleJob(job)
  } else {
    unscheduleJob(id)
  }

  saveJobs()
  return job
}
