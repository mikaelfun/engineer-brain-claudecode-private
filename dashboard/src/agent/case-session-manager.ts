/**
 * case-session-manager.ts — Claude Code SDK per-case session 管理
 *
 * 核心修复：使用 SDK 返回的真实 session_id（而非自生成 ID）
 *
 * 提供：
 *   - processCaseSession: 完整 Case 处理（新 session）
 *   - chatCaseSession: 交互式反馈（resume 已有 session）
 *   - stepCaseSession: 单步执行（在已有 session 中 resume 或新建）
 *   - executeTodoAction: 执行单个 Todo 动作
 *   - patrolCoordinator: 单个 SDK session 执行 /patrol SKILL.md，与 CLI 一致
 *
 * 注意: @anthropic-ai/claude-agent-sdk 提供 query() 函数
 */
import { query, type Options, type SDKMessage, type CanUseTool } from '@anthropic-ai/claude-agent-sdk'
import { readFileSync, existsSync, writeFileSync, mkdirSync, appendFileSync, readdirSync } from 'fs'
import { join, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'
import { sseManager } from '../watcher/sse-manager.js'
import { getSSEEventType, formatMessageForSSE } from '../utils/sse-helpers.js'
import type { PatrolProgress, PatrolTodoSummary } from '../types/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// ---- Types ----

export interface CaseSessionInfo {
  sessionId: string // SDK 返回的真实 session_id
  caseNumber: string
  intent: string
  status: 'active' | 'paused' | 'completed' | 'failed'
  createdAt: string
  lastActivityAt: string
}

interface SessionStore {
  [sessionId: string]: CaseSessionInfo
}

// Per-session persisted messages for UI recovery after page refresh
interface SessionMessageStore {
  [sessionId: string]: SessionMessage[]
}

export interface SessionMessage {
  type: string
  content: string
  toolName?: string
  step?: string
  timestamp: string
}

// caseNumber → SDK session_id 的快速查找索引
interface CaseSessionIndex {
  [caseNumber: string]: string // caseNumber → sessionId
}

// ---- Per-case operation lock (prevents duplicate session spawning) ----

interface ActiveOperation {
  caseNumber: string
  operationType: string // 'full-process' | step name
  startedAt: string
}

// In-memory lock: caseNumber → active operation info
const activeOperations = new Map<string, ActiveOperation>()

// ---- AbortController Registry (ISS-086) ----
// Tracks active SDK query() AbortControllers for process cleanup
// Key: caseNumber (or 'patrol-{caseNumber}' for patrol sessions)
const activeQueries = new Map<string, AbortController>()

/**
 * Register an AbortController for an active query.
 * Returns the AbortController for injection into query() options.
 */
export function registerQuery(key: string): AbortController {
  // If there's already one for this key, abort it first
  const existing = activeQueries.get(key)
  if (existing) {
    try { existing.abort() } catch { /* ignore */ }
  }
  const ac = new AbortController()
  activeQueries.set(key, ac)
  return ac
}

/**
 * Abort and remove a single query by key.
 * Returns true if an active query was found and aborted.
 */
export function abortQuery(key: string): boolean {
  const ac = activeQueries.get(key)
  if (ac) {
    try { ac.abort() } catch { /* ignore */ }
    activeQueries.delete(key)
    return true
  }
  return false
}

/**
 * Unregister a query without aborting (for normal completion cleanup).
 */
export function unregisterQuery(key: string): void {
  activeQueries.delete(key)
}

/**
 * Abort ALL active queries (for shutdown / restart).
 * Returns number of queries aborted.
 */
export function abortAllQueries(): number {
  let count = 0
  for (const [key, ac] of activeQueries) {
    try {
      ac.abort()
      count++
    } catch { /* ignore */ }
  }
  activeQueries.clear()
  return count
}

/**
 * Get the number of active queries (for monitoring).
 */
export function getActiveQueryCount(): number {
  return activeQueries.size
}

/**
 * Acquire an operation lock for a case.
 * Returns true if lock acquired, false if case already has an active operation.
 */
export function acquireCaseOperationLock(caseNumber: string, operationType: string): boolean {
  if (activeOperations.has(caseNumber)) {
    return false
  }
  activeOperations.set(caseNumber, {
    caseNumber,
    operationType,
    startedAt: new Date().toISOString(),
  })
  return true
}

/**
 * Release the operation lock for a case.
 */
export function releaseCaseOperationLock(caseNumber: string): void {
  activeOperations.delete(caseNumber)
}

/**
 * Get the active operation for a case (if any).
 */
export function getActiveCaseOperation(caseNumber: string): ActiveOperation | null {
  return activeOperations.get(caseNumber) || null
}

/**
 * Get all active operations (for monitoring).
 */
export function listActiveOperations(): ActiveOperation[] {
  return Array.from(activeOperations.values())
}

// ---- Config ----

function getProjectRoot(): string {
  // EngineerBrain project root (parent of dashboard/)
  return resolve(__dirname, '..', '..', '..')
}

function getCasesRoot(): string {
  const configPath = join(getProjectRoot(), 'config.json')
  if (existsSync(configPath)) {
    try {
      const config = JSON.parse(readFileSync(configPath, 'utf-8'))
      return config.casesRoot || ''
    } catch {
      // fall through
    }
  }
  return ''
}

// ---- Session Store (in-memory + file-backed) ----

const sessionStorePath = join(getProjectRoot(), 'dashboard', '.case-sessions.json')
const sessionMessagesPath = join(getProjectRoot(), 'dashboard', '.case-session-messages.json')
let sessions: SessionStore = {}
let caseIndex: CaseSessionIndex = {}
let sessionMessages: SessionMessageStore = {}

function loadSessionStore(): void {
  if (existsSync(sessionStorePath)) {
    try {
      const data = JSON.parse(readFileSync(sessionStorePath, 'utf-8'))
      sessions = data.sessions || data // backward compat: old format was flat SessionStore
      caseIndex = data.caseIndex || {}
      // Rebuild caseIndex if missing (migration from old format)
      if (Object.keys(caseIndex).length === 0) {
        for (const [sid, info] of Object.entries(sessions)) {
          if ((info as CaseSessionInfo).caseNumber && (info as CaseSessionInfo).status !== 'completed') {
            caseIndex[(info as CaseSessionInfo).caseNumber] = sid
          }
        }
      }
      // --- Startup stale session recovery ---
      // On fresh start, no SDK queries are running in-memory.
      // Any session still marked 'active' is a zombie from a previous crash/restart.
      let recoveredCount = 0
      for (const [sid, info] of Object.entries(sessions)) {
        const session = info as CaseSessionInfo
        if (session.status === 'active') {
          session.status = 'failed'
          // Clean caseIndex so it doesn't block new sessions
          if (caseIndex[session.caseNumber] === sid) {
            delete caseIndex[session.caseNumber]
          }
          recoveredCount++
        }
      }
      if (recoveredCount > 0) {
        console.log(`[session-manager] Recovered ${recoveredCount} stale active session(s) → failed`)
        saveSessionStore()
      }
    } catch {
      sessions = {}
      caseIndex = {}
    }
  }
}

function saveSessionStore(): void {
  writeFileSync(sessionStorePath, JSON.stringify({ sessions, caseIndex }, null, 2), 'utf-8')
}

const MAX_PERSISTED_MESSAGES = 50

function loadSessionMessages(): void {
  if (existsSync(sessionMessagesPath)) {
    try {
      sessionMessages = JSON.parse(readFileSync(sessionMessagesPath, 'utf-8'))
    } catch {
      sessionMessages = {}
    }
  }
}

function saveSessionMessages(): void {
  writeFileSync(sessionMessagesPath, JSON.stringify(sessionMessages, null, 2), 'utf-8')
}

/**
 * Append a message to persisted session message store.
 * Called by routes when broadcasting SSE events so that messages can be recovered after page refresh.
 * Skips messages with empty/whitespace-only content to avoid cluttering the UI with blank entries.
 */
export function appendSessionMessage(caseNumber: string, message: SessionMessage): void {
  // Filter out empty-content messages (ISS-059: SDK metadata messages with no display content)
  if (!message.content || !message.content.trim()) {
    return
  }

  if (!sessionMessages[caseNumber]) {
    sessionMessages[caseNumber] = []
  }
  sessionMessages[caseNumber].push(message)
  // Keep bounded
  if (sessionMessages[caseNumber].length > MAX_PERSISTED_MESSAGES) {
    sessionMessages[caseNumber] = sessionMessages[caseNumber].slice(-MAX_PERSISTED_MESSAGES)
  }
  saveSessionMessages()
}

/**
 * Get persisted messages for a case (for UI recovery after page refresh).
 */
export function getSessionMessages(caseNumber: string): SessionMessage[] {
  return sessionMessages[caseNumber] || []
}

/**
 * Clear persisted messages for a case.
 */
export function clearSessionMessages(caseNumber: string): void {
  delete sessionMessages[caseNumber]
  saveSessionMessages()
}

// ---- Step-Level Log Writer ----

/**
 * Write a step log to cases/active/<caseNumber>/logs/
 * Format: YYYY-MM-DD_HH-mm_<step-name>.log
 * Contains: step name, start/end time, status, key output summary
 */
export function writeStepLog(
  caseNumber: string,
  stepName: string,
  opts: {
    status: 'completed' | 'failed'
    startedAt: string
    error?: string
    messageCount?: number
  }
): void {
  try {
    const casesRoot = getCasesRoot()
    const projectRoot = getProjectRoot()
    const casesRootResolved = resolve(projectRoot, casesRoot)
    const logsDir = join(casesRootResolved, 'active', caseNumber, 'logs')

    if (!existsSync(logsDir)) {
      mkdirSync(logsDir, { recursive: true })
    }

    const now = new Date()
    const dateStr = now.toISOString().replace(/T/, '_').replace(/:/g, '-').slice(0, 16)
    const filename = `${dateStr}_${stepName}.log`
    const filePath = join(logsDir, filename)

    const endedAt = now.toISOString()
    const startTime = new Date(opts.startedAt).getTime()
    const durationMs = now.getTime() - startTime
    const durationSec = (durationMs / 1000).toFixed(1)

    const lines = [
      `# Step Log: ${stepName}`,
      ``,
      `- **Case:** ${caseNumber}`,
      `- **Step:** ${stepName}`,
      `- **Status:** ${opts.status}`,
      `- **Started:** ${opts.startedAt}`,
      `- **Ended:** ${endedAt}`,
      `- **Duration:** ${durationSec}s`,
    ]

    if (opts.messageCount !== undefined) {
      lines.push(`- **Messages:** ${opts.messageCount}`)
    }

    if (opts.error) {
      lines.push(``, `## Error`, `\`\`\``, opts.error, `\`\`\``)
    }

    // Include summary from persisted messages
    const messages = getSessionMessages(caseNumber)
    if (messages.length > 0) {
      lines.push(``, `## Output Summary`)
      const completedMsg = messages.find(m => m.type === 'completed')
      if (completedMsg) {
        lines.push(`- ${completedMsg.content}`)
      }
      const toolCalls = messages.filter(m => m.type === 'tool-call')
      if (toolCalls.length > 0) {
        lines.push(`- Tool calls: ${toolCalls.length}`)
        const toolNames = [...new Set(toolCalls.map(t => t.toolName).filter(Boolean))]
        if (toolNames.length > 0) {
          lines.push(`- Tools used: ${toolNames.join(', ')}`)
        }
      }
    }

    lines.push(``)

    writeFileSync(filePath, lines.join('\n'), 'utf-8')
  } catch (err) {
    console.error(`[step-log] Failed to write log for ${stepName} on case ${caseNumber}:`, err)
  }
}

// Initialize on import
loadSessionStore()
loadSessionMessages()

// ---- Runtime Stale Session Watchdog ----
// Periodically check for 'active' sessions that have no corresponding in-memory query.
// This catches cases where the SDK subprocess died but the async iterator never threw/completed.
const STALE_SESSION_CHECK_INTERVAL_MS = 60_000 // check every 60s
const STALE_SESSION_THRESHOLD_MS = 5 * 60_000  // 5 min without activity + no in-memory query → stale

const staleSessionWatchdog = setInterval(() => {
  const now = Date.now()
  let recovered = 0

  for (const [sid, session] of Object.entries(sessions)) {
    if (session.status !== 'active') continue

    // If there's an active in-memory query for this case, it's genuinely running
    if (activeQueries.has(session.caseNumber)) continue

    // No in-memory query — check how long since last activity
    const lastActivity = new Date(session.lastActivityAt).getTime()
    if (now - lastActivity > STALE_SESSION_THRESHOLD_MS) {
      session.status = 'failed'
      if (caseIndex[session.caseNumber] === sid) {
        delete caseIndex[session.caseNumber]
      }
      recovered++
      console.log(`[session-watchdog] Recovered stale session ${sid} (case ${session.caseNumber}, inactive ${Math.round((now - lastActivity) / 1000)}s)`)
    }
  }

  if (recovered > 0) {
    saveSessionStore()
  }
}, STALE_SESSION_CHECK_INTERVAL_MS)

// Don't let the watchdog prevent Node from exiting
staleSessionWatchdog.unref()

// ---- System Prompt Builder ----

function buildCaseAppendPrompt(caseNumber: string): string {
  const casesRoot = getCasesRoot()
  const caseDir = join(casesRoot, 'active', caseNumber)

  // Inject case-summary.md as context anchor if it exists (root level, not context/)
  let caseSummary = ''
  const summaryPath = join(caseDir, 'case-summary.md')
  if (existsSync(summaryPath)) {
    try {
      caseSummary = `\n\n## Case Summary (persistent context)\n${readFileSync(summaryPath, 'utf-8')}\n`
    } catch {
      // ignore
    }
  } else {
    // Fallback: try legacy context/case-summary.md path
    const legacySummaryPath = join(caseDir, 'context', 'case-summary.md')
    if (existsSync(legacySummaryPath)) {
      try {
        caseSummary = `\n\n## Case Summary (persistent context)\n${readFileSync(legacySummaryPath, 'utf-8')}\n`
      } catch {
        // ignore
      }
    }
  }

  return `\nYou are processing Case ${caseNumber}.\nCase directory: ${caseDir}\n${caseSummary}`
}

// ---- SDK Session ID Extraction ----

/**
 * Extract SDK session_id from a message.
 * The SDK provides session_id on system/init and result messages.
 */
function extractSessionId(message: any): string | undefined {
  // system init message
  if (message.type === 'system' && message.subtype === 'init' && message.session_id) {
    return message.session_id
  }
  // result message (both success and error)
  if (message.type === 'result' && message.session_id) {
    return message.session_id
  }
  // assistant message also carries session_id
  if (message.type === 'assistant' && message.session_id) {
    return message.session_id
  }
  return undefined
}

// ---- Context Directory Management ----

function ensureContextDir(caseNumber: string): void {
  const casesRoot = getCasesRoot()
  const contextDir = join(casesRoot, 'active', caseNumber, 'context')
  if (!existsSync(contextDir)) {
    mkdirSync(contextDir, { recursive: true })
  }
}

function appendUserInput(caseNumber: string, type: string, content: string): void {
  ensureContextDir(caseNumber)
  const casesRoot = getCasesRoot()
  const inputsPath = join(casesRoot, 'active', caseNumber, 'context', 'user-inputs.jsonl')
  const record = JSON.stringify({
    timestamp: new Date().toISOString(),
    type,
    content,
  })
  appendFileSync(inputsPath, record + '\n', 'utf-8')
}

// ---- Public API ----

/**
 * Start a new case processing session.
 * Captures the SDK's real session_id from the message stream.
 */
export async function* processCaseSession(
  caseNumber: string,
  intent: string,
  canUseTool?: CanUseTool
): AsyncGenerator<SDKMessage & { sdkSessionId?: string }> {
  // Check if case already has a resumable session → reuse it (avoid orphan sessions)
  const existingSessionId = caseIndex[caseNumber]
  if (existingSessionId && sessions[existingSessionId] && sessions[existingSessionId].status !== 'completed') {
    // Resume existing session with new intent
    yield* chatCaseSession(existingSessionId, `Case ${caseNumber}: ${intent}`, canUseTool) as any
    return
  }

  const now = new Date().toISOString()
  let sdkSessionId: string | undefined

  // Ensure context directory exists
  ensureContextDir(caseNumber)

  // Create AbortController for this query (ISS-086)
  const abortController = registerQuery(caseNumber)

  try {
    for await (const message of query({
      prompt: `Case ${caseNumber}: ${intent}`,
      options: {
        abortController,
        cwd: getProjectRoot(),
        settingSources: ['project'] as Options['settingSources'],
        systemPrompt: {
          type: 'preset' as const,
          preset: 'claude_code' as const,
          append: buildCaseAppendPrompt(caseNumber),
        },
        allowedTools: ['Read', 'Write', 'Bash', 'Glob', 'Grep', 'Agent'],
        permissionMode: 'bypassPermissions',
        allowDangerouslySkipPermissions: true,
        maxTurns: 50,
        ...(canUseTool ? { canUseTool } : {}),
      },
    })) {
      // Capture SDK session ID from the first message that has it
      const msgSessionId = extractSessionId(message)
      if (msgSessionId && !sdkSessionId) {
        sdkSessionId = msgSessionId
        // Register session with SDK's real ID
        sessions[sdkSessionId] = {
          sessionId: sdkSessionId,
          caseNumber,
          intent,
          status: 'active',
          createdAt: now,
          lastActivityAt: now,
        }
        caseIndex[caseNumber] = sdkSessionId
        saveSessionStore()
      }

      // Update activity timestamp
      if (sdkSessionId && sessions[sdkSessionId]) {
        sessions[sdkSessionId].lastActivityAt = new Date().toISOString()
      }

      yield { ...message, sdkSessionId } as any
    }

    // Mark as paused (can be resumed)
    if (sdkSessionId && sessions[sdkSessionId]) {
      sessions[sdkSessionId].status = 'paused'
      saveSessionStore()
    }
    // Clean up AbortController on normal completion (ISS-086)
    unregisterQuery(caseNumber)
  } catch (err) {
    // Clean up AbortController on failure (ISS-086)
    unregisterQuery(caseNumber)
    if (sdkSessionId && sessions[sdkSessionId]) {
      sessions[sdkSessionId].status = 'failed'
      // Clean up caseIndex so failed session doesn't block new sessions
      if (caseIndex[caseNumber] === sdkSessionId) {
        delete caseIndex[caseNumber]
      }
      saveSessionStore()
    }
    throw err
  }
}

/**
 * Send interactive feedback to an existing session (resume).
 * Uses the SDK's real session_id for resume.
 */
export async function* chatCaseSession(
  sessionId: string,
  userMessage: string,
  canUseTool?: CanUseTool
): AsyncGenerator<SDKMessage> {
  const session = sessions[sessionId]
  if (!session) {
    throw new Error(`Session ${sessionId} not found`)
  }

  session.status = 'active'
  session.lastActivityAt = new Date().toISOString()
  saveSessionStore()

  // Record user input to persistent context
  appendUserInput(session.caseNumber, 'user-note', userMessage)

  // Create AbortController for this query (ISS-086)
  const abortController = registerQuery(session.caseNumber)

  try {
    for await (const message of query({
      prompt: userMessage,
      options: {
        abortController,
        resume: sessionId, // SDK's real session_id
        cwd: getProjectRoot(),
        permissionMode: 'bypassPermissions',
        allowDangerouslySkipPermissions: true,
        ...(canUseTool ? { canUseTool } : {}),
      },
    })) {
      session.lastActivityAt = new Date().toISOString()
      saveSessionStore()
      yield message
    }

    session.status = 'paused' // Paused, can be resumed
    saveSessionStore()
    // Clean up AbortController on normal completion (ISS-086)
    unregisterQuery(session.caseNumber)
  } catch (err) {
    // Clean up AbortController on failure (ISS-086)
    unregisterQuery(session.caseNumber)
    session.status = 'failed'
    // Clean up caseIndex so failed session doesn't block new sessions
    if (caseIndex[session.caseNumber] === sessionId) {
      delete caseIndex[session.caseNumber]
    }
    saveSessionStore()
    throw err
  }
}

/**
 * Execute a specific step within a case session (resume or create new).
 * Each step runs in the same case session for context continuity.
 */
export async function* stepCaseSession(
  caseNumber: string,
  stepName: string,
  options?: { emailType?: string; forceRefresh?: boolean; fullSearch?: boolean; canUseTool?: CanUseTool }
): AsyncGenerator<SDKMessage & { sdkSessionId?: string }> {
  // Build email type instruction for draft-email step
  const emailTypeInstruction = (() => {
    if (stepName !== 'draft-email' || !options?.emailType || options.emailType === 'auto') {
      return '' // AI auto-detect (default)
    }
    return ` The email type is: "${options.emailType}". Draft accordingly.`
  })()

  // Map step names to skill/agent invocations
  const stepPrompts: Record<string, string> = {
    'data-refresh': `Execute data-refresh for Case ${caseNumber}. Read .claude/skills/data-refresh/SKILL.md for full instructions, then execute.`,
    'compliance-check': `Execute compliance-check for Case ${caseNumber}. Read .claude/skills/compliance-check/SKILL.md for full instructions, then execute.`,
    'status-judge': `Execute status-judge for Case ${caseNumber}. Read .claude/skills/status-judge/SKILL.md for full instructions, then execute.`,
    'teams-search': `Execute teams-search for Case ${caseNumber}${options?.forceRefresh ? ' --force-refresh' : ''}${options?.fullSearch ? ' --full-search' : ''}. Read .claude/skills/teams-search/SKILL.md for full instructions, then execute.`,
    'troubleshoot': `Execute troubleshoot for Case ${caseNumber}. Read .claude/skills/troubleshoot/SKILL.md for full instructions, then execute.`,
    'draft-email': `Execute draft-email for Case ${caseNumber}.${emailTypeInstruction} Read .claude/skills/draft-email/SKILL.md for full instructions, then execute.`,
    'inspection': `Execute inspection-writer for Case ${caseNumber}. This updates case-summary.md (incremental narrative) and generates todo via generate-todo.sh. Read .claude/skills/inspection-writer/SKILL.md for full instructions, then execute.`,
    'generate-kb': `Case ${caseNumber} is being closed. Read all case data from the case directory and generate a Knowledge Base article. Save to {caseDir}/kb/kb-article.md`,
  }

  const prompt = stepPrompts[stepName]
  if (!prompt) {
    throw new Error(`Unknown step: ${stepName}. Available: ${Object.keys(stepPrompts).join(', ')}`)
  }

  // Check if case already has a session → resume in that session
  const existingSessionId = caseIndex[caseNumber]
  if (existingSessionId && sessions[existingSessionId] && sessions[existingSessionId].status !== 'completed') {
    // Resume existing session with step prompt
    yield* chatCaseSession(existingSessionId, prompt, options?.canUseTool) as any
    return
  }

  // No existing session → create new one
  yield* processCaseSession(caseNumber, prompt, options?.canUseTool)
}

/**
 * Map action type to its verification (read-back) script.
 */
const ACTION_VERIFY_SCRIPTS: Record<string, string> = {
  note: 'fetch-notes.ps1',
  labor: 'view-labor.ps1',
  sap: 'refresh-timeline.ps1',
}

/**
 * Execute a specific Todo action (D365 write operation) with post-write verification.
 * Runs in the case's existing session if available.
 *
 * The agent will:
 * 1. Execute the D365 write script
 * 2. Run the matching read-back script to verify success
 * 3. Report a structured JSON result
 * 4. Only mark the todo checkbox [x] if verification passes
 */
export async function* executeTodoAction(
  caseNumber: string,
  action: string,
  params: Record<string, string>
): AsyncGenerator<SDKMessage> {
  const casesRoot = getCasesRoot()
  const caseDir = join(casesRoot, 'active', caseNumber)
  const verifyScript = ACTION_VERIFY_SCRIPTS[action] || ''

  const prompt = `Execute the following D365 action for Case ${caseNumber}:
Action: ${action}
Parameters: ${JSON.stringify(params)}
Case directory: ${caseDir}

## Step 1: Execute Write Operation
Use the appropriate PowerShell script from skills/d365-case-ops/scripts/ to execute this action.

## Step 2: Verify Write Success
After the write script completes, run the read-back verification script to confirm the operation was recorded in D365:
${verifyScript ? `- Verification script: skills/d365-case-ops/scripts/${verifyScript}` : '- Check the D365 timeline/notes for the case to verify the write succeeded'}
- Compare the read-back result against what was written
- Determine if the operation was successfully persisted

## Step 3: Report Result
After verification, output a single JSON block on a line by itself:
\`\`\`json
{"todoExecuteResult": {"success": true/false, "action": "${action}", "verificationDetails": "description of what was verified"}}
\`\`\`

## Step 4: Update Todo Checkbox
- If verification PASSED (success=true): update the corresponding Todo file to mark this item as completed [x]
- If verification FAILED (success=false): do NOT mark the checkbox, leave it as [ ]`

  // Try to resume in existing case session
  const existingSessionId = caseIndex[caseNumber]
  if (existingSessionId && sessions[existingSessionId] && sessions[existingSessionId].status !== 'completed') {
    yield* chatCaseSession(existingSessionId, prompt)
    return
  }

  // Fallback: standalone query
  const todoAbort = registerQuery(`todo-${caseNumber}`)
  try {
    for await (const message of query({
      prompt,
      options: {
        abortController: todoAbort,
        cwd: getProjectRoot(),
        settingSources: ['project'] as Options['settingSources'],
        systemPrompt: {
          type: 'preset' as const,
          preset: 'claude_code' as const,
          append: buildCaseAppendPrompt(caseNumber),
        },
        allowedTools: ['Bash', 'Read', 'Write'],
        permissionMode: 'bypassPermissions',
        allowDangerouslySkipPermissions: true,
        maxTurns: 10,
      },
    })) {
      yield message
    }
  } finally {
    unregisterQuery(`todo-${caseNumber}`)
  }
}

// ---- Patrol Helpers ----

/**
 * Filter cases by lastInspected — only include cases that:
 * 1. Have no casehealth-meta.json or no lastInspected field (new case)
 * 2. lastInspected is older than 24 hours
 */
export function filterCasesByLastInspected(
  allCases: string[],
  casesRootResolved: string
): { filtered: string[]; skipped: string[] } {
  const now = Date.now()
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000
  const filtered: string[] = []
  const skipped: string[] = []

  for (const caseNumber of allCases) {
    const metaPath = join(casesRootResolved, 'active', caseNumber, 'casehealth-meta.json')
    try {
      if (!existsSync(metaPath)) {
        filtered.push(caseNumber) // New case, no meta
        continue
      }
      const meta = JSON.parse(readFileSync(metaPath, 'utf-8'))
      if (!meta.lastInspected) {
        filtered.push(caseNumber) // No lastInspected field
        continue
      }
      const lastInspected = new Date(meta.lastInspected).getTime()
      if (now - lastInspected > TWENTY_FOUR_HOURS) {
        filtered.push(caseNumber) // Stale — needs re-inspection
      } else {
        skipped.push(caseNumber) // Recently inspected, skip
      }
    } catch {
      filtered.push(caseNumber) // Parse error → treat as needing inspection
    }
  }

  return { filtered, skipped }
}

/**
 * Run patrol warm-up phase — parallel execution of:
 * 1. check-ir-status-batch.ps1 -SaveMeta (IR/FDR/FWR batch pre-fill)
 * 2. warm-dtm-token.ps1 (DTM token cache warming)
 *
 * Failures are logged but don't block patrol.
 */
export async function runPatrolWarmup(casesRootResolved: string): Promise<{
  irBatch: { success: boolean; error?: string }
  dtmToken: { success: boolean; error?: string }
}> {
  const projectRoot = getProjectRoot()
  const results = {
    irBatch: { success: false } as { success: boolean; error?: string },
    dtmToken: { success: false } as { success: boolean; error?: string },
  }

  // Run both warmup tasks in parallel
  const [irResult, dtmResult] = await Promise.allSettled([
    // IR/FDR/FWR batch check
    new Promise<void>((resolve, reject) => {
      try {
        const script = join(projectRoot, 'skills', 'd365-case-ops', 'scripts', 'check-ir-status-batch.ps1')
        if (existsSync(script)) {
          execSync(
            `pwsh -NoProfile -File "${script}" -SaveMeta -MetaDir "${join(casesRootResolved, 'active')}"`,
            { cwd: projectRoot, timeout: 30000, stdio: 'pipe' }
          )
        }
        resolve()
      } catch (err) {
        reject(err)
      }
    }),
    // DTM token warming
    new Promise<void>((resolve, reject) => {
      try {
        const script = join(projectRoot, 'skills', 'd365-case-ops', 'scripts', 'warm-dtm-token.ps1')
        if (existsSync(script)) {
          execSync(
            `pwsh -NoProfile -File "${script}" -CasesRoot "${casesRootResolved}"`,
            { cwd: projectRoot, timeout: 60000, stdio: 'pipe' }
          )
        }
        resolve()
      } catch (err) {
        reject(err)
      }
    }),
  ])

  results.irBatch.success = irResult.status === 'fulfilled'
  if (irResult.status === 'rejected') {
    results.irBatch.error = irResult.reason instanceof Error ? irResult.reason.message : String(irResult.reason)
  }

  results.dtmToken.success = dtmResult.status === 'fulfilled'
  if (dtmResult.status === 'rejected') {
    results.dtmToken.error = dtmResult.reason instanceof Error ? dtmResult.reason.message : String(dtmResult.reason)
  }

  return results
}

/**
 * Run patrol (batch inspection) — 并行 per-case SDK sessions
 *
 * 两阶段架构:
 *   Phase 1: Discover active cases and determine which have changes
 *   Phase 2: Process changed cases in parallel (Promise.allSettled)
 *
 * 每个 case 独立一个 SDK session，互不阻塞。
 * 进度通过 onProgress + SSE 广播给前端。
 */

// Patrol cancellation flag
let patrolCancelled = false
let patrolRunning = false
const patrolActiveCases = new Set<string>() // Track active patrol case sessions for cancel

export function cancelPatrol(): boolean {
  if (!patrolRunning) return false
  patrolCancelled = true
  // Abort all active patrol case sessions
  for (const caseNumber of patrolActiveCases) {
    abortQuery(caseNumber)
    releaseCaseOperationLock(caseNumber)
  }
  patrolActiveCases.clear()
  return true
}

export function isPatrolRunning(): boolean {
  return patrolRunning
}

export async function patrolCoordinator(
  onProgress: (progress: PatrolProgress) => void
): Promise<PatrolTodoSummary> {
  patrolCancelled = false
  patrolRunning = true

  try {
    return await _runPatrol(onProgress)
  } finally {
    patrolRunning = false
    patrolCancelled = false
  }
}

async function _runPatrol(
  onProgress: (progress: PatrolProgress) => void
): Promise<PatrolTodoSummary> {
  const projectRoot = getProjectRoot()
  const casesRoot = getCasesRoot()
  const casesRootResolved = resolve(projectRoot, casesRoot)
  const activeCasesDir = join(casesRootResolved, 'active')

  // Phase 1: Discover active cases
  onProgress({ phase: 'discovering' })

  let allCases: string[] = []
  try {
    if (existsSync(activeCasesDir)) {
      allCases = readdirSync(activeCasesDir, { withFileTypes: true })
        .filter(e => e.isDirectory())
        .map(e => e.name)
        .sort()
    }
  } catch {
    onProgress({ phase: 'failed', error: 'Cannot read active cases directory' })
    return { red: [], yellow: [], green: [] }
  }

  onProgress({ phase: 'discovering', totalCases: allCases.length })

  if (allCases.length === 0) {
    onProgress({ phase: 'completed', totalCases: 0, processedCases: 0 })
    return { red: [], yellow: [], green: [] }
  }

  // Phase 2: Filter by lastInspected (only cases needing re-inspection)
  onProgress({ phase: 'filtering', totalCases: allCases.length })

  const { filtered: casesToProcess, skipped } = filterCasesByLastInspected(allCases, casesRootResolved)

  if (casesToProcess.length === 0) {
    onProgress({
      phase: 'completed',
      totalCases: allCases.length,
      changedCases: 0,
      processedCases: 0,
    })
    return aggregateTodos(casesRootResolved)
  }

  // Phase 3: Warm-up (DTM token + IR batch)
  onProgress({
    phase: 'warming-up' as PatrolProgress['phase'],
    totalCases: allCases.length,
    changedCases: casesToProcess.length,
  })

  const warmupResult = await runPatrolWarmup(casesRootResolved)
  if (warmupResult.irBatch.error) {
    console.warn('[patrol] IR batch warmup warning:', warmupResult.irBatch.error)
  }
  if (warmupResult.dtmToken.error) {
    console.warn('[patrol] DTM token warmup warning:', warmupResult.dtmToken.error)
  }

  if (patrolCancelled) {
    onProgress({ phase: 'completed', totalCases: allCases.length, changedCases: casesToProcess.length, processedCases: 0 })
    return aggregateTodos(casesRootResolved)
  }

  // Phase 4: Process cases via processCaseSession (semaphore-limited concurrency)
  onProgress({
    phase: 'processing',
    totalCases: allCases.length,
    changedCases: casesToProcess.length,
    processedCases: 0,
  })

  let processedCount = 0
  const CONCURRENCY_LIMIT = 5
  const CASE_TIMEOUT_MS = 15 * 60 * 1000 // 15 minutes per case

  // Semaphore for concurrency control
  let activeCount = 0
  const queue = [...casesToProcess]
  const caseResults: Array<{ caseNumber: string; status: 'completed' | 'failed' | 'timeout'; error?: string }> = []

  const processNextCase = async (): Promise<void> => {
    while (queue.length > 0) {
      if (patrolCancelled) return

      const caseNumber = queue.shift()!
      activeCount++
      patrolActiveCases.add(caseNumber)

      // Acquire operation lock (prevents user from starting full-process on same case)
      const lockAcquired = acquireCaseOperationLock(caseNumber, 'patrol')
      if (!lockAcquired) {
        // Case already has an active operation — skip it
        caseResults.push({ caseNumber, status: 'failed', error: 'Case already has active operation' })
        processedCount++
        activeCount--
        patrolActiveCases.delete(caseNumber)
        continue
      }

      // Broadcast per-case start
      onProgress({
        phase: 'processing',
        totalCases: allCases.length,
        changedCases: casesToProcess.length,
        processedCases: processedCount,
        currentCase: caseNumber,
      })

      sseManager.broadcast('patrol-progress' as any, {
        phase: 'processing',
        currentCase: caseNumber,
        totalCases: allCases.length,
        changedCases: casesToProcess.length,
        processedCases: processedCount,
      })

      // Notify Agent Monitor
      sseManager.broadcast('sessions-changed' as any, { reason: 'patrol-case-started', caseNumber })

      try {
        const patrolIntent = `对 Case ${caseNumber} 执行完整 casework 流程。caseDir: ${join(casesRootResolved, 'active', caseNumber)}/。请读取 .claude/skills/casework/SKILL.md 获取完整执行步骤。`

        // Use processCaseSession — this registers the session in sessions map + caseIndex
        // and makes it visible in Agent Monitor and Case detail page
        const sessionGen = processCaseSession(caseNumber, patrolIntent)

        // Consume the AsyncGenerator with timeout
        let caseSessionId: string | undefined
        const timeoutPromise = new Promise<'timeout'>((resolve) =>
          setTimeout(() => resolve('timeout'), CASE_TIMEOUT_MS)
        )

        const processPromise = (async () => {
          for await (const message of sessionGen) {
            if (!caseSessionId && (message as any).sdkSessionId) {
              caseSessionId = (message as any).sdkSessionId
            }
            // Broadcast SDK messages as SSE (via existing event types)
            const eventType = getSSEEventType(message)
            const formatted = formatMessageForSSE(message)
            sseManager.broadcast(eventType as any, {
              caseNumber,
              sessionId: caseSessionId || 'pending',
              step: 'patrol',
              ...formatted,
            })
            // Persist messages for session recovery
            appendSessionMessage(caseNumber, {
              type: eventType,
              content: (formatted.content as string) || '',
              toolName: formatted.toolName as string,
              step: 'patrol',
              timestamp: (formatted.timestamp as string) || new Date().toISOString(),
            })
          }
          return 'completed' as const
        })()

        const result = await Promise.race([processPromise, timeoutPromise])

        if (result === 'timeout') {
          // Abort the timed-out session
          abortQuery(caseNumber)
          caseResults.push({ caseNumber, status: 'timeout', error: 'Case processing timed out (15 min)' })
        } else {
          caseResults.push({ caseNumber, status: 'completed' })
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        caseResults.push({ caseNumber, status: 'failed', error: errorMsg })
      } finally {
        processedCount++
        releaseCaseOperationLock(caseNumber)
        patrolActiveCases.delete(caseNumber)
        activeCount--

        // Broadcast per-case completion
        const lastResult = caseResults[caseResults.length - 1]
        sseManager.broadcast('patrol-case-completed' as any, {
          caseNumber,
          processedCases: processedCount,
          error: lastResult?.error,
        })
        sseManager.broadcast('sessions-changed' as any, { reason: 'patrol-case-completed', caseNumber })

        onProgress({
          phase: 'processing',
          totalCases: allCases.length,
          changedCases: casesToProcess.length,
          processedCases: processedCount,
        })
      }
    }
  }

  // Launch CONCURRENCY_LIMIT workers
  const workers = Array.from({ length: Math.min(CONCURRENCY_LIMIT, casesToProcess.length) }, () => processNextCase())
  await Promise.allSettled(workers)

  // Phase 5: Aggregate todos
  onProgress({ phase: 'aggregating' })
  const todoSummary = aggregateTodos(casesRootResolved)

  onProgress({
    phase: 'completed',
    totalCases: allCases.length,
    changedCases: casesToProcess.length,
    processedCases: processedCount,
    todoSummary,
  })

  return todoSummary
}

// ---- Helpers: Todo aggregation ----

function aggregateTodos(casesRoot: string): PatrolTodoSummary {
  const activeCasesDir = join(casesRoot, 'active')
  const summary: PatrolTodoSummary = { red: [], yellow: [], green: [] }

  if (!existsSync(activeCasesDir)) return summary

  let caseDirs: string[]
  try {
    caseDirs = readdirSync(activeCasesDir)
  } catch {
    return summary
  }

  for (const caseId of caseDirs) {
    const todoDir = join(activeCasesDir, caseId, 'todo')
    if (!existsSync(todoDir)) continue

    try {
      const todoFiles = readdirSync(todoDir)
        .filter(f => f.endsWith('.md'))
        .sort()
        .reverse()

      if (todoFiles.length === 0) continue

      const content = readFileSync(join(todoDir, todoFiles[0]), 'utf-8')
      const items = parseTodoContent(content)

      if (items.red.length > 0) {
        summary.red.push({ caseNumber: caseId, items: items.red })
      }
      if (items.yellow.length > 0) {
        summary.yellow.push({ caseNumber: caseId, items: items.yellow })
      }
      if (items.green.length > 0) {
        summary.green.push({ caseNumber: caseId, items: items.green })
      }
    } catch {
      // Skip unreadable todo dirs
    }
  }

  return summary
}

function parseTodoContent(content: string): { red: string[]; yellow: string[]; green: string[] } {
  const result = { red: [] as string[], yellow: [] as string[], green: [] as string[] }
  let currentSection: 'red' | 'yellow' | 'green' | null = null

  for (const line of content.split('\n')) {
    if (line.includes('🔴')) currentSection = 'red'
    else if (line.includes('🟡')) currentSection = 'yellow'
    else if (line.includes('✅')) currentSection = 'green'

    if (currentSection && line.trimStart().startsWith('- [')) {
      result[currentSection].push(line.trim())
    }
  }

  return result
}

/**
 * End a session
 */
export function endSession(sessionId: string): boolean {
  if (sessions[sessionId]) {
    const caseNumber = sessions[sessionId].caseNumber
    // Abort the underlying SDK query to terminate child processes (ISS-086)
    abortQuery(caseNumber)
    sessions[sessionId].status = 'completed'
    // Remove from case index
    if (caseIndex[caseNumber] === sessionId) {
      delete caseIndex[caseNumber]
    }
    saveSessionStore()
    return true
  }
  return false
}

/**
 * Get session info
 */
export function getSession(sessionId: string): CaseSessionInfo | null {
  return sessions[sessionId] || null
}

/**
 * Get the active session ID for a case (if any).
 * Only returns sessions that are actually active or paused (resumable).
 * Failed/completed sessions are not considered active.
 */
export function getActiveSessionForCase(caseNumber: string): string | null {
  const sessionId = caseIndex[caseNumber]
  if (sessionId && sessions[sessionId]) {
    const status = sessions[sessionId].status
    if (status === 'active' || status === 'paused') {
      return sessionId
    }
    // Clean up stale caseIndex entries (failed sessions that weren't cleaned up)
    if (status === 'failed' || status === 'completed') {
      delete caseIndex[caseNumber]
      saveSessionStore()
    }
  }
  return null
}

/**
 * List all sessions
 */
export function listCaseSessions(): CaseSessionInfo[] {
  return Object.values(sessions).sort(
    (a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime()
  )
}

/**
 * Get sessions for a specific case
 */
export function getCaseSessions(caseNumber: string): CaseSessionInfo[] {
  return Object.values(sessions)
    .filter((s) => s.caseNumber === caseNumber)
    .sort((a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime())
}
