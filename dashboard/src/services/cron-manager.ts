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

// ---- Cron expression matching ----

/** Parse cron expression into structured fields */
interface CronFields {
  minute: number[] | null  // null = wildcard
  hour: number[] | null
}

function parseCronExpr(expr: string): CronFields | null {
  const parts = expr.trim().split(/\s+/)
  if (parts.length !== 5) return null

  return {
    minute: parseField(parts[0], 0, 59),
    hour: parseField(parts[1], 0, 23),
  }
}

function parseField(field: string, min: number, max: number): number[] | null {
  if (field === '*') return null // wildcard

  // */N — step
  if (field.startsWith('*/')) {
    const step = parseInt(field.slice(2))
    if (isNaN(step) || step <= 0) return null
    const vals: number[] = []
    for (let i = min; i <= max; i += step) vals.push(i)
    return vals
  }

  // Single number
  if (/^\d+$/.test(field)) {
    const n = parseInt(field)
    if (n >= min && n <= max) return [n]
    return null
  }

  return null // unsupported
}

/** Check if a Date matches a cron expression */
function cronMatches(expr: string, date: Date): boolean {
  const fields = parseCronExpr(expr)
  if (!fields) return false

  const m = date.getMinutes()
  const h = date.getHours()

  if (fields.minute !== null && !fields.minute.includes(m)) return false
  if (fields.hour !== null && !fields.hour.includes(h)) return false

  return true
}

/** Calculate next matching time for display in UI */
function nextCronMatch(expr: string): number | null {
  const now = new Date()
  // Scan up to 48 hours ahead
  for (let i = 1; i <= 48 * 60; i++) {
    const candidate = new Date(now.getTime() + i * 60 * 1000)
    candidate.setSeconds(0, 0)
    if (cronMatches(expr, candidate)) return candidate.getTime()
  }
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

    const child = spawn('claude', ['-p', '--output-format', 'stream-json', '--verbose'], {
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

    // Stream stdout as NDJSON — parse each line and extract readable text
    let lineBuf = ''

    child.stdout.on('data', (data: Buffer) => {
      chunks.push(data)
      lineBuf += data.toString('utf-8')
      const lines = lineBuf.split('\n')
      lineBuf = lines.pop() || '' // keep incomplete trailing line

      for (const line of lines) {
        if (!line.trim()) continue
        try {
          const msg = JSON.parse(line)
          let text = ''

          if (msg.type === 'assistant' && msg.message?.content) {
            const parts: string[] = []
            for (const block of msg.message.content) {
              if (block.type === 'text' && block.text) {
                parts.push(block.text)
              } else if (block.type === 'tool_use') {
                // Show tool invocation as progress indicator
                const input = block.input || {}
                const summary = input.command || input.description || input.pattern || input.file_path || ''
                parts.push(`\n▶ ${block.name}${summary ? ': ' + String(summary).slice(0, 120) : ''}\n`)
              }
            }
            text = parts.join('')
          } else if (msg.type === 'user' && msg.message?.content) {
            // Tool results come back as synthetic user messages
            const contents = Array.isArray(msg.message.content) ? msg.message.content : []
            for (const block of contents) {
              if (block.type === 'tool_result' && block.content) {
                // Extract first 200 chars of tool output as progress
                const resultText = typeof block.content === 'string'
                  ? block.content
                  : Array.isArray(block.content)
                    ? block.content.filter((c: any) => c.type === 'text').map((c: any) => c.text).join('')
                    : ''
                if (resultText) {
                  text += resultText.slice(0, 200) + (resultText.length > 200 ? '...' : '') + '\n'
                }
              }
            }
          } else if (msg.type === 'result' && msg.subtype === 'success' && msg.result) {
            // Final result — use as definitive output
            text = msg.result
          }

          if (text) {
            outputSoFar += text
            sseManager.broadcast('trigger-progress', {
              triggerId,
              chunk: text,
              elapsedMs: Date.now() - startMs,
              outputLength: outputSoFar.length,
            })
          }
        } catch {
          // Non-JSON line — skip
        }
      }
    })

    child.stderr.on('data', (data: Buffer) => errChunks.push(data))

    child.on('close', (code, signal) => {
      runningProcesses.delete(triggerId)
      const durationMs = Date.now() - startMs
      const stderr = Buffer.concat(errChunks).toString('utf-8')
      // Use parsed human-readable text (outputSoFar) instead of raw NDJSON
      const output = (outputSoFar || stderr).slice(-MAX_OUTPUT_LENGTH)
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

// ---- Scheduler (true cron: 1-minute tick) ----

/** Set of job IDs currently executing (prevent double-run) */
const executingJobs = new Set<string>()
/** Track last fired minute per job to avoid double-fire within same minute */
const lastFiredMinute = new Map<string, string>()

let cronTickTimer: ReturnType<typeof setInterval> | null = null

function startCronTick(): void {
  if (cronTickTimer) return

  cronTickTimer = setInterval(() => {
    const now = new Date()
    const minuteKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}`

    for (const job of jobs) {
      if (!job.enabled) continue
      if (executingJobs.has(job.id)) continue
      if (lastFiredMinute.get(job.id) === minuteKey) continue

      const expr = job.schedule.expr || ''
      if (!cronMatches(expr, now)) continue

      // Match! Fire this job
      lastFiredMinute.set(job.id, minuteKey)
      executingJobs.add(job.id)

      const prompt = (job as any).prompt || job.name
      console.log(`[cron-manager] Cron fired: ${job.name} (${job.id}) at ${now.toLocaleTimeString()} — prompt: "${prompt}"`)

      executeCronPrompt(job.id, prompt).then((result) => {
        executingJobs.delete(job.id)

        job.state = job.state || {}
        job.state.lastRunAtMs = Date.now() - result.durationMs
        job.state.lastDurationMs = result.durationMs
        job.state.lastStatus = result.cancelled ? 'cancelled' : result.success ? 'success' : 'error'
        job.state.lastError = result.error
        job.state.lastOutput = result.output
        job.state.consecutiveErrors = result.success ? 0 : (job.state.consecutiveErrors || 0) + 1
        job.state.nextRunAtMs = nextCronMatch(expr) || undefined

        if (!result.success && !result.cancelled) {
          console.error(`[cron-manager] Job ${job.id} failed (exit ${result.exitCode}): ${result.error}`)
        } else {
          console.log(`[cron-manager] Job ${job.id} ${result.cancelled ? 'cancelled' : 'succeeded'} in ${(result.durationMs / 1000).toFixed(1)}s`)
        }

        saveJobs()
      })
    }
  }, 60 * 1000) // Check every 60 seconds

  console.log('[cron-manager] Cron tick started (60s interval)')
}

function stopCronTick(): void {
  if (cronTickTimer) {
    clearInterval(cronTickTimer)
    cronTickTimer = null
  }
}

// ---- Public API ----

export function initCronManager(): void {
  jobs = loadJobs()
  // Calculate next run times for all enabled jobs
  for (const job of jobs) {
    if (job.enabled) {
      job.state = job.state || {}
      job.state.nextRunAtMs = nextCronMatch(job.schedule.expr || '') || undefined
    }
  }
  startCronTick()
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
  // No per-job timer needed — global cron tick handles all jobs

  return job
}

export function deleteTrigger(id: string): boolean {
  const idx = jobs.findIndex(j => j.id === id)
  if (idx === -1) return false

  // Cancel if running
  cancelTrigger(id)
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
    job.state = job.state || {}
    job.state.nextRunAtMs = nextCronMatch(job.schedule.expr || '') || undefined
  }

  saveJobs()
  return job
}

export function updateTrigger(id: string, updates: { name?: string; prompt?: string; cron?: string; description?: string }): CronJob | null {
  const job = jobs.find(j => j.id === id)
  if (!job) return null

  if (updates.name) job.name = updates.name
  if (updates.prompt !== undefined) (job as any).prompt = updates.prompt
  if (updates.description !== undefined) (job as any).description = updates.description
  if (updates.cron) {
    job.schedule.expr = updates.cron
    if (job.enabled) {
      job.state = job.state || {}
      job.state.nextRunAtMs = nextCronMatch(updates.cron) || undefined
    }
  }
  job.updatedAtMs = Date.now()

  saveJobs()
  return job
}
