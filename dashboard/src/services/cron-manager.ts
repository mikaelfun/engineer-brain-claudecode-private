/**
 * cron-manager.ts — Self-managed cron job CRUD + scheduler
 *
 * Manages cron jobs stored in cron-jobs.json. Provides CRUD operations
 * and a simple setInterval-based scheduler that executes prompts via SDK query().
 * Broadcasts SSE events for real-time UI feedback with full observability
 * (SSE broadcast + in-memory state + JSONL disk logs).
 *
 * Migrated from CLI subprocess (spawn) to SDK query() — ISS-232.
 */
import { query, type Options } from '@anthropic-ai/claude-agent-sdk'
import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync, readdirSync, unlinkSync, statSync } from 'fs'
import { dirname, join, resolve } from 'path'
import { fileURLToPath } from 'url'
import { config } from '../config.js'
import { sseManager } from '../watcher/sse-manager.js'
import { loadAgentDefinitions } from '../agent/case-session-manager.js'
import { summarizeToolInput } from '../utils/sdk-message-broadcaster.js'
import { parseAssistantBlocks } from '../utils/sse-helpers.js'
import { sdkRegistry } from '../agent/sdk-session-registry.js'
import { parseSessionLog } from '../utils/session-log-parser.js'
import type { CronJob } from '../types/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function getProjectRoot(): string {
  return resolve(__dirname, '..', '..', '..')
}

// ---- In-memory state ----

let jobs: CronJob[] = []
/** Track running trigger AbortControllers for cancellation */
const runningControllers: Map<string, AbortController> = new Map()

// ---- In-memory message store (observability layer ②) ----
// Ring buffer per trigger for SSE recovery on page refresh.
// Cleared at each new execution, capped at MAX_MESSAGES_PER_TRIGGER.

const MAX_MESSAGES_PER_TRIGGER = 200

export interface CronMessage {
  kind: string      // thinking | response | tool-call | tool-result | agent-started | agent-progress | agent-completed
  content: string
  toolName?: string
  taskId?: string
  caseNumber?: string
  timestamp: string
}

/** triggerId → messages (ring buffer) */
const cronMessageStore: Map<string, CronMessage[]> = new Map()

function addCronMessage(triggerId: string, msg: CronMessage): void {
  let msgs = cronMessageStore.get(triggerId)
  if (!msgs) {
    msgs = []
    cronMessageStore.set(triggerId, msgs)
  }
  msgs.push(msg)
  if (msgs.length > MAX_MESSAGES_PER_TRIGGER) {
    msgs.splice(0, msgs.length - MAX_MESSAGES_PER_TRIGGER)
  }
}

/** Get stored messages for a trigger (for SSE recovery API) */
export function getCronMessages(triggerId: string): CronMessage[] {
  return cronMessageStore.get(triggerId) || []
}

/** Clear stored messages for a trigger */
export function clearCronMessages(triggerId: string): void {
  cronMessageStore.delete(triggerId)
}

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
// Executes cron prompts via Claude Agent SDK query().
// Observability: ① SSE broadcast ② in-memory state (job.state.lastOutput)
//               ③ JSONL disk logs (30-day retention)
//
// NOTE: Prompt is passed to SDK query() as-is. Slash commands like
// `/onenote-export sync` work correctly (tested 2026-04-02).

const CRON_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes default
const MAX_OUTPUT_LENGTH = 5000
const LOG_RETENTION_DAYS = 30

interface ExecutionResult {
  success: boolean
  output: string
  durationMs: number
  error?: string
  cancelled?: boolean
}

/** Load CLAUDE.md content for SDK systemPrompt.append (cached) */
let _claudeMdCache: string | null = null
function getClaudeMdContent(): string {
  if (_claudeMdCache !== null) return _claudeMdCache
  const claudeMdPath = join(getProjectRoot(), 'CLAUDE.md')
  _claudeMdCache = existsSync(claudeMdPath) ? readFileSync(claudeMdPath, 'utf-8') : ''
  return _claudeMdCache
}

/**
 * Execute a cron prompt via Claude Agent SDK query().
 *
 * Full observability:
 * - SSE broadcast (trigger-started / trigger-progress / trigger-completed/failed/cancelled)
 * - In-memory state (job.state.lastOutput — cumulative)
 * - JSONL disk log (one per execution, 30-day retention)
 *
/**
 * Convert slash command prompts to natural language prompts.
 *
 * SDK query() treats /foo as a built-in slash command lookup, which fails for
 * project-level skills (.claude/skills/). Convert to explicit instructions:
 *   "/onenote export sync X" → "Read .claude/skills/onenote/SKILL.md and execute: export sync X"
 *
 * Non-slash prompts are passed through unchanged.
 */
function resolveSlashPrompt(rawPrompt: string): string {
  const trimmed = rawPrompt.trim()
  if (!trimmed.startsWith('/')) return trimmed

  // Parse: /skillname [args...]
  // Handle compound names like /product-learn, /rag-sync
  const match = trimmed.match(/^\/([a-z0-9_-]+)\s*(.*)$/i)
  if (!match) return trimmed

  const skillName = match[1]
  const args = match[2].trim()

  // Check if skill exists on disk
  const skillPath = join(getProjectRoot(), '.claude', 'skills', skillName, 'SKILL.md')
  if (!existsSync(skillPath)) {
    // Not a project skill — pass through as-is (might be a built-in command)
    return trimmed
  }

  const parts = [
    `Read .claude/skills/${skillName}/SKILL.md FIRST, then follow all steps.`,
    `Config is at config.json.`,
  ]
  if (args) {
    parts.push(`Execute with arguments: ${args}`)
  }
  parts.push('Do NOT Glob or explore the codebase — go straight to the skill file.')

  console.log(`[cron-manager] Resolved slash prompt: "${trimmed}" → natural language (skill: ${skillName})`)
  return parts.join(' ')
}

/**
 * Execute a cron prompt via Claude Agent SDK query().
 *
 * Supports cancellation via AbortController + timeout.
 */
async function executeCronPrompt(triggerId: string, rawPrompt: string): Promise<ExecutionResult> {
  const prompt = resolveSlashPrompt(rawPrompt)
  const startMs = Date.now()
  const abortController = new AbortController()
  runningControllers.set(triggerId, abortController)

  // Timeout via AbortController
  const timeoutHandle = setTimeout(() => {
    console.warn(`[cron-manager] Trigger ${triggerId} timed out after ${CRON_TIMEOUT_MS / 1000}s`)
    abortController.abort()
  }, CRON_TIMEOUT_MS)

  // ③ JSONL disk log (config.cronLogsDir — independent of patrol)
  const logsDir = config.cronLogsDir
  if (!existsSync(logsDir)) mkdirSync(logsDir, { recursive: true })
  const logTs = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const sdkLogPath = join(logsDir, `${logTs}_${triggerId}.jsonl`)

  // Broadcast start
  sseManager.broadcast('trigger-started', {
    triggerId,
    prompt,
    startedAt: new Date().toISOString(),
  })

  let outputSoFar = ''

  // ② Clear in-memory store for fresh execution
  clearCronMessages(triggerId)

  const registryHandle = sdkRegistry.register({ source: 'cron', context: triggerId, intent: prompt.slice(0, 100) })

  try {
    const projectRoot = getProjectRoot()
    const claudeMdContent = getClaudeMdContent()

    // Sub-agent tracking (same pattern as patrol-orchestrator)
    const taskCaseMap: Record<string, string> = {}
    const seenUuids = new Set<string>()

    for await (const message of query({
      prompt,
      options: {
        abortController,
        cwd: projectRoot,
        settingSources: ['user'] as Options['settingSources'],
        agents: loadAgentDefinitions(),
        systemPrompt: {
          type: 'preset' as const,
          preset: 'claude_code' as const,
          append: claudeMdContent,
        },
        tools: ['Bash', 'Read', 'Write', 'Edit', 'Glob', 'Grep', 'Agent'],
        allowedTools: ['Bash', 'Read', 'Write', 'Edit', 'Glob', 'Grep', 'Agent'],
        permissionMode: 'bypassPermissions',
        allowDangerouslySkipPermissions: true,
        maxTurns: 100,
        stderr: (data: string) => console.error(`[SDK:stderr:cron:${triggerId}]`, data.trim()),
      },
    })) {
      // ① JSONL disk log — every message (with _ts for timestamp recovery)
      try { appendFileSync(sdkLogPath, JSON.stringify({ ...message, _ts: new Date().toISOString() }) + '\n', 'utf-8') } catch { /* non-fatal */ }

      registryHandle.onMessage(message)

      const msg = message as any
      const subtype = msg.subtype as string | undefined

      // ── Sub-agent lifecycle tracking ──
      if (subtype === 'task_started') {
        const taskId = msg.task_id as string
        const taskPrompt = (msg.prompt || msg.description || '') as string
        const caseMatch = taskPrompt.match(/(?:Case\s+|case\s+|\/active\/|caseNumber[:\s]+)(\d{10,})/i)
        if (caseMatch) taskCaseMap[taskId] = caseMatch[1]
        const agentType = msg.task_type || 'unknown'
        console.log(`[cron-manager] Sub-agent started: ${agentType} task=${taskId}`)
        const ts = new Date().toISOString()
        sseManager.broadcast('trigger-progress', {
          triggerId,
          chunk: `[Agent] ${msg.description || agentType}\n`,
          kind: 'agent-started',
          taskId,
          agentType,
          caseNumber: caseMatch?.[1],
          description: msg.description,
          elapsedMs: Date.now() - startMs,
        })
        addCronMessage(triggerId, {
          kind: 'agent-started',
          content: msg.description || `${agentType} started`,
          taskId,
          caseNumber: caseMatch?.[1],
          timestamp: ts,
        })
      }

      if (subtype === 'task_progress') {
        const taskId = msg.task_id as string
        if (!seenUuids.has(msg.uuid)) {
          seenUuids.add(msg.uuid)
          sseManager.broadcast('trigger-progress', {
            triggerId,
            chunk: msg.summary || '',
            kind: 'agent-progress',
            taskId,
            caseNumber: taskCaseMap[taskId],
            summary: msg.summary,
            elapsedMs: Date.now() - startMs,
          })
          addCronMessage(triggerId, {
            kind: 'agent-progress',
            content: msg.summary || '',
            taskId,
            caseNumber: taskCaseMap[taskId],
            timestamp: new Date().toISOString(),
          })
        }
      }

      if (subtype === 'task_notification') {
        const taskId = msg.task_id as string
        const caseNumber = taskCaseMap[taskId]
        const outputFile = msg.output_file as string | undefined
        const agentType = msg.task_type || 'unknown'

        console.log(`[cron-manager] Sub-agent ${msg.status}: task=${taskId} case=${caseNumber || '?'} output=${outputFile || 'none'}`)

        // Save output_file to cronLogsDir/agents/ for persistence + recovery
        if (outputFile && existsSync(outputFile)) {
          try {
            const agentsDir = join(logsDir, 'agents')
            if (!existsSync(agentsDir)) mkdirSync(agentsDir, { recursive: true })
            const logName = `${agentType}_${taskId.slice(0, 8)}.log`
            const content = readFileSync(outputFile, 'utf-8')
            writeFileSync(join(agentsDir, logName), content, 'utf-8')
            console.log(`[cron-manager] Saved sub-agent log: agents/${logName} (${Math.round(content.length / 1024)}KB)`)
          } catch (err) {
            console.warn(`[cron-manager] Failed to save sub-agent output:`, (err as Error).message)
          }
        }

        // Parse output file → full sub-agent messages (thinking/tool-call/tool-result/response)
        let agentMessages: any[] | undefined
        if (outputFile && existsSync(outputFile)) {
          try {
            const parsed = parseSessionLog(outputFile)
            if (parsed.mainMessages.length > 0) {
              agentMessages = parsed.mainMessages
            }
          } catch { /* non-fatal */ }
        }

        sseManager.broadcast('trigger-progress', {
          triggerId,
          chunk: msg.summary || `Agent ${msg.status}\n`,
          kind: 'agent-completed',
          taskId,
          agentType,
          caseNumber,
          status: msg.status,
          summary: msg.summary,
          elapsedMs: Date.now() - startMs,
          ...(agentMessages ? { messages: agentMessages } : {}),
        })
        addCronMessage(triggerId, {
          kind: 'agent-completed',
          content: msg.summary || `Agent ${msg.status}`,
          taskId,
          caseNumber,
          timestamp: new Date().toISOString(),
        })
        delete taskCaseMap[taskId]
      }

      // ── Main agent message parsing (shared parser) ──
      if (msg.type === 'assistant' && msg.message?.content) {
        const content = msg.message.content
        if (Array.isArray(content)) {
          for (const parsed of parseAssistantBlocks(content)) {
            const ts = new Date().toISOString()
            if (parsed.kind === 'tool-call') {
              const toolContent = summarizeToolInput(parsed.toolName!, parsed.toolInput)
              const text = `\n▶ ${parsed.toolName}${toolContent ? ': ' + toolContent.slice(0, 200) : ''}\n`
              outputSoFar += text
              sseManager.broadcast('trigger-progress', {
                triggerId,
                chunk: text,
                kind: 'tool-call',
                toolName: parsed.toolName,
                content: toolContent,
                elapsedMs: Date.now() - startMs,
                outputLength: outputSoFar.length,
              })
              addCronMessage(triggerId, {
                kind: 'tool-call',
                content: toolContent,
                toolName: parsed.toolName,
                timestamp: ts,
              })
            } else if (parsed.kind === 'response') {
              outputSoFar += parsed.content
              sseManager.broadcast('trigger-progress', {
                triggerId,
                kind: 'response',
                chunk: parsed.content,
                elapsedMs: Date.now() - startMs,
                outputLength: outputSoFar.length,
              })
              addCronMessage(triggerId, {
                kind: 'response',
                content: parsed.content,
                timestamp: ts,
              })
            } else if (parsed.kind === 'thinking') {
              // Extended thinking — don't add to output, just broadcast + store
              sseManager.broadcast('trigger-progress', {
                triggerId,
                kind: 'thinking',
                chunk: parsed.content,
                elapsedMs: Date.now() - startMs,
              })
              addCronMessage(triggerId, {
                kind: 'thinking',
                content: parsed.content,
                timestamp: ts,
              })
            }
          }
        }
      }

      if (msg.type === 'tool_result') {
        const resultContent = typeof msg.content === 'string'
          ? msg.content.slice(0, 500)
          : typeof msg.text === 'string'
            ? msg.text.slice(0, 500)
            : ''
        if (resultContent) {
          outputSoFar += resultContent.slice(0, 200) + '\n'
          const ts = new Date().toISOString()
          sseManager.broadcast('trigger-progress', {
            triggerId,
            chunk: resultContent.slice(0, 200) + '\n',
            kind: 'tool-result',
            content: resultContent,
            elapsedMs: Date.now() - startMs,
            outputLength: outputSoFar.length,
          })
          addCronMessage(triggerId, {
            kind: 'tool-result',
            content: resultContent,
            timestamp: ts,
          })
        }
      }
    }

    // SDK query completed successfully
    registryHandle.complete()
    const durationMs = Date.now() - startMs
    const output = outputSoFar.slice(-MAX_OUTPUT_LENGTH)

    sseManager.broadcast('trigger-completed', {
      triggerId,
      durationMs,
      outputPreview: output.slice(0, 300),
    })

    return { success: true, output, durationMs }

  } catch (err) {
    const durationMs = Date.now() - startMs
    const errMsg = err instanceof Error ? err.message : String(err)
    const cancelled = errMsg.includes('abort')
    registryHandle.fail(cancelled ? 'cancelled' : errMsg)

    if (cancelled) {
      sseManager.broadcast('trigger-cancelled', { triggerId, durationMs })
      return {
        success: false,
        output: outputSoFar.slice(-MAX_OUTPUT_LENGTH),
        durationMs,
        cancelled: true,
      }
    }

    sseManager.broadcast('trigger-failed', {
      triggerId,
      durationMs,
      error: errMsg.slice(0, 500),
    })
    return {
      success: false,
      output: outputSoFar.slice(-MAX_OUTPUT_LENGTH),
      durationMs,
      error: errMsg,
    }

  } finally {
    clearTimeout(timeoutHandle)
    runningControllers.delete(triggerId)
    // Clean up old cron JSONL logs (30-day retention)
    cleanupOldCronLogs()
  }
}

/** Delete cron JSONL logs older than LOG_RETENTION_DAYS */
function cleanupOldCronLogs(): void {
  try {
    const logsDir = config.cronLogsDir
    if (!existsSync(logsDir)) return
    const cutoff = Date.now() - LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000
    const files = readdirSync(logsDir).filter(f => f.endsWith('.jsonl'))
    let removed = 0
    for (const file of files) {
      const filePath = join(logsDir, file)
      const mtime = statSync(filePath).mtimeMs
      if (mtime < cutoff) {
        unlinkSync(filePath)
        removed++
      }
    }
    if (removed > 0) {
      console.log(`[cron-manager] Cleaned up ${removed} cron log(s) older than ${LOG_RETENTION_DAYS} days`)
    }
  } catch { /* non-fatal */ }
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
          console.error(`[cron-manager] Job ${job.id} failed: ${result.error}`)
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
  return runningControllers.has(id)
}

/** Get all running trigger IDs */
export function getRunningTriggerIds(): string[] {
  return Array.from(runningControllers.keys())
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
  if (runningControllers.has(id)) {
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
    console.error(`[cron-manager] Manual trigger ${job.id} failed: ${result.error}`)
  } else {
    console.log(`[cron-manager] Manual trigger ${job.id} ${result.cancelled ? 'cancelled' : 'succeeded'} in ${(result.durationMs / 1000).toFixed(1)}s`)
  }

  return { success: result.success, error: result.error }
}

/** Cancel a running trigger by aborting its SDK query */
export function cancelTrigger(id: string): boolean {
  const controller = runningControllers.get(id)
  if (!controller) return false

  try {
    controller.abort()
    console.log(`[cron-manager] Cancelled trigger: ${id}`)
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
