/**
 * cron-manager.ts — Self-managed cron job CRUD + scheduler
 *
 * Manages cron jobs stored in cron-jobs.json. Provides CRUD operations
 * and a simple setInterval-based scheduler that executes prompts via Claude CLI.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { dirname } from 'path'
import { spawn } from 'child_process'
import { config } from '../config.js'
import type { CronJob } from '../types/index.js'

// ---- In-memory state ----

let jobs: CronJob[] = []
let timers: Map<string, ReturnType<typeof setInterval>> = new Map()

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

const CRON_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes default
const MAX_OUTPUT_LENGTH = 2000

interface ExecutionResult {
  success: boolean
  output: string
  durationMs: number
  exitCode: number | null
  error?: string
}

/**
 * Execute a cron prompt via Claude CLI subprocess.
 * Uses `claude -p` (print mode) which supports slash commands and skills.
 */
async function executeCronPrompt(prompt: string): Promise<ExecutionResult> {
  const startMs = Date.now()

  return new Promise((resolve) => {
    const chunks: Buffer[] = []
    const errChunks: Buffer[] = []

    const child = spawn('claude', ['-p', prompt], {
      cwd: config.projectRoot,
      shell: true,
      timeout: CRON_TIMEOUT_MS,
      env: { ...process.env },
    })

    child.stdout.on('data', (data: Buffer) => chunks.push(data))
    child.stderr.on('data', (data: Buffer) => errChunks.push(data))

    child.on('close', (code) => {
      const durationMs = Date.now() - startMs
      const stdout = Buffer.concat(chunks).toString('utf-8')
      const stderr = Buffer.concat(errChunks).toString('utf-8')
      const output = (stdout || stderr).slice(-MAX_OUTPUT_LENGTH)

      resolve({
        success: code === 0,
        output,
        durationMs,
        exitCode: code,
        error: code !== 0 ? `Exit code ${code}: ${stderr.slice(0, 500)}` : undefined,
      })
    })

    child.on('error', (err) => {
      const durationMs = Date.now() - startMs
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

    const result = await executeCronPrompt(prompt)

    job.state = job.state || {}
    job.state.lastRunAtMs = Date.now() - result.durationMs
    job.state.lastDurationMs = result.durationMs
    job.state.lastStatus = result.success ? 'success' : 'error'
    job.state.lastError = result.error
    job.state.lastOutput = result.output
    job.state.consecutiveErrors = result.success ? 0 : (job.state.consecutiveErrors || 0) + 1
    job.state.nextRunAtMs = Date.now() + intervalMs

    if (!result.success) {
      console.error(`[cron-manager] Job ${job.id} failed (exit ${result.exitCode}): ${result.error}`)
    } else {
      console.log(`[cron-manager] Job ${job.id} succeeded in ${(result.durationMs / 1000).toFixed(1)}s`)
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

  unscheduleJob(id)
  jobs.splice(idx, 1)
  saveJobs()

  return true
}

export async function runTriggerNow(id: string): Promise<{ success: boolean; error?: string }> {
  const job = jobs.find(j => j.id === id)
  if (!job) return { success: false, error: 'Trigger not found' }

  const prompt = (job as any).prompt || job.name
  console.log(`[cron-manager] Manual trigger: ${job.name} (${job.id}) — prompt: "${prompt}"`)

  const result = await executeCronPrompt(prompt)

  job.state = job.state || {}
  job.state.lastRunAtMs = Date.now() - result.durationMs
  job.state.lastDurationMs = result.durationMs
  job.state.lastStatus = result.success ? 'success' : 'error'
  job.state.lastError = result.error
  job.state.lastOutput = result.output
  job.state.consecutiveErrors = result.success ? 0 : (job.state.consecutiveErrors || 0) + 1
  saveJobs()

  if (!result.success) {
    console.error(`[cron-manager] Manual trigger ${job.id} failed (exit ${result.exitCode}): ${result.error}`)
  } else {
    console.log(`[cron-manager] Manual trigger ${job.id} succeeded in ${(result.durationMs / 1000).toFixed(1)}s`)
  }

  return { success: result.success, error: result.error }
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
