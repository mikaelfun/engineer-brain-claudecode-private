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
import { query, type Options, type SDKMessage } from '@anthropic-ai/claude-agent-sdk'
import { readFileSync, existsSync, writeFileSync, mkdirSync, appendFileSync, readdirSync } from 'fs'
import { join, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
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

// ---- System Prompt Builder ----

function buildCaseAppendPrompt(caseNumber: string): string {
  const casesRoot = getCasesRoot()
  const caseDir = join(casesRoot, 'active', caseNumber)

  // Inject case-summary.md as context anchor if it exists
  let caseSummary = ''
  const summaryPath = join(caseDir, 'context', 'case-summary.md')
  if (existsSync(summaryPath)) {
    try {
      caseSummary = `\n\n## Case Summary (persistent context)\n${readFileSync(summaryPath, 'utf-8')}\n`
    } catch {
      // ignore
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
  intent: string
): AsyncGenerator<SDKMessage & { sdkSessionId?: string }> {
  const now = new Date().toISOString()
  let sdkSessionId: string | undefined

  // Ensure context directory exists
  ensureContextDir(caseNumber)

  try {
    for await (const message of query({
      prompt: `Case ${caseNumber}: ${intent}`,
      options: {
        cwd: getProjectRoot(),
        settingSources: ['project'] as Options['settingSources'],
        systemPrompt: {
          type: 'preset' as const,
          preset: 'claude_code' as const,
          append: buildCaseAppendPrompt(caseNumber),
        },
        allowedTools: ['Read', 'Write', 'Bash', 'Glob', 'Grep', 'Agent'],
        permissionMode: 'acceptEdits',
        maxTurns: 50,
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
  } catch (err) {
    if (sdkSessionId && sessions[sdkSessionId]) {
      sessions[sdkSessionId].status = 'failed'
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
  userMessage: string
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

  try {
    for await (const message of query({
      prompt: userMessage,
      options: {
        resume: sessionId, // SDK's real session_id
        cwd: getProjectRoot(),
      },
    })) {
      session.lastActivityAt = new Date().toISOString()
      saveSessionStore()
      yield message
    }

    session.status = 'paused' // Paused, can be resumed
    saveSessionStore()
  } catch (err) {
    session.status = 'failed'
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
  options?: { emailType?: string }
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
    'data-refresh': `Read .claude/skills/data-refresh/SKILL.md and execute data-refresh for Case ${caseNumber}`,
    'compliance-check': `Read .claude/skills/compliance-check/SKILL.md and execute compliance-check for Case ${caseNumber}`,
    'status-judge': `Read .claude/skills/status-judge/SKILL.md and execute status-judge for Case ${caseNumber}`,
    'teams-search': `Spawn a teams-search agent (read .claude/agents/teams-search.md) for Case ${caseNumber}`,
    'troubleshoot': `Spawn a troubleshooter agent (read .claude/agents/troubleshooter.md) for Case ${caseNumber}`,
    'draft-email': `Spawn an email-drafter agent (read .claude/agents/email-drafter.md) for Case ${caseNumber}.${emailTypeInstruction}`,
    'inspection': `Read .claude/skills/inspection-writer/SKILL.md and execute inspection-writer for Case ${caseNumber}`,
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
    yield* chatCaseSession(existingSessionId, prompt) as any
    return
  }

  // No existing session → create new one
  yield* processCaseSession(caseNumber, prompt)
}

/**
 * Execute a specific Todo action (D365 write operation).
 * Runs in the case's existing session if available.
 */
export async function* executeTodoAction(
  caseNumber: string,
  action: string,
  params: Record<string, string>
): AsyncGenerator<SDKMessage> {
  const casesRoot = getCasesRoot()
  const caseDir = join(casesRoot, 'active', caseNumber)

  const prompt = `Execute the following D365 action for Case ${caseNumber}:
Action: ${action}
Parameters: ${JSON.stringify(params)}
Case directory: ${caseDir}

Use the appropriate PowerShell script from skills/d365-case-ops/scripts/ to execute this action.
After execution, update the corresponding Todo file to mark this item as completed [x].`

  // Try to resume in existing case session
  const existingSessionId = caseIndex[caseNumber]
  if (existingSessionId && sessions[existingSessionId] && sessions[existingSessionId].status !== 'completed') {
    yield* chatCaseSession(existingSessionId, prompt)
    return
  }

  // Fallback: standalone query
  for await (const message of query({
    prompt,
    options: {
      cwd: getProjectRoot(),
      settingSources: ['project'] as Options['settingSources'],
      systemPrompt: {
        type: 'preset' as const,
        preset: 'claude_code' as const,
        append: buildCaseAppendPrompt(caseNumber),
      },
      allowedTools: ['Bash', 'Read', 'Write'],
      permissionMode: 'acceptEdits',
      maxTurns: 10,
    },
  })) {
    yield message
  }
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

export function cancelPatrol(): boolean {
  if (!patrolRunning) return false
  patrolCancelled = true
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

  // Phase 1: Discover
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

  // Phase 2: Process all cases in parallel
  onProgress({
    phase: 'processing',
    totalCases: allCases.length,
    changedCases: allCases.length,
    processedCases: 0,
  })

  let processedCount = 0
  const CONCURRENCY_LIMIT = 5 // Max parallel SDK sessions

  // Process in batches to limit concurrency
  const processCaseBatch = async (batch: string[]) => {
    const results = await Promise.allSettled(
      batch.map(async (caseNumber) => {
        // Broadcast per-case start
        onProgress({
          phase: 'processing',
          totalCases: allCases.length,
          changedCases: allCases.length,
          processedCases: processedCount,
          currentCase: caseNumber,
        })

        sseManager.broadcast('patrol-progress' as any, {
          phase: 'processing',
          currentCase: caseNumber,
          totalCases: allCases.length,
          changedCases: allCases.length,
          processedCases: processedCount,
        })

        try {
          const patrolPrompt = `请读取 .claude/skills/patrol/SKILL.md 获取完整执行步骤，仅对 Case ${caseNumber} 执行巡检流程。`

          for await (const message of query({
            prompt: patrolPrompt,
            options: {
              cwd: projectRoot,
              settingSources: ['project'] as Options['settingSources'],
              systemPrompt: {
                type: 'preset' as const,
                preset: 'claude_code' as const,
              },
              allowedTools: ['Read', 'Write', 'Bash', 'Glob', 'Grep', 'Agent'],
              permissionMode: 'acceptEdits',
              maxTurns: 100,
            },
          })) {
            // Forward SDK messages as SSE for real-time monitoring
            const eventType = getSSEEventType(message)
            sseManager.broadcast(eventType as any, {
              type: 'patrol',
              caseNumber,
              ...formatMessageForSSE(message),
            })
          }

          // Per-case completed
          processedCount++
          sseManager.broadcast('patrol-case-completed' as any, {
            caseNumber,
            processedCases: processedCount,
          })

          return { caseNumber, status: 'completed' as const }
        } catch (err) {
          processedCount++
          const errorMsg = err instanceof Error ? err.message : String(err)

          sseManager.broadcast('patrol-case-completed' as any, {
            caseNumber,
            processedCases: processedCount,
            error: errorMsg,
          })

          return { caseNumber, status: 'failed' as const, error: errorMsg }
        }
      })
    )

    return results
  }

  // Execute in batches of CONCURRENCY_LIMIT
  for (let i = 0; i < allCases.length; i += CONCURRENCY_LIMIT) {
    // Check cancellation between batches
    if (patrolCancelled) {
      onProgress({
        phase: 'completed',
        totalCases: allCases.length,
        changedCases: allCases.length,
        processedCases: processedCount,
      })
      sseManager.broadcast('patrol-progress' as any, {
        phase: 'completed',
        totalCases: allCases.length,
        processedCases: processedCount,
        cancelled: true,
      })
      return aggregateTodos(casesRootResolved)
    }

    const batch = allCases.slice(i, i + CONCURRENCY_LIMIT)
    await processCaseBatch(batch)
  }

  // Phase 3: Aggregate todos
  onProgress({ phase: 'aggregating' })
  const todoSummary = aggregateTodos(casesRootResolved)

  onProgress({
    phase: 'completed',
    totalCases: allCases.length,
    changedCases: allCases.length,
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
 * Get the active session ID for a case (if any)
 */
export function getActiveSessionForCase(caseNumber: string): string | null {
  const sessionId = caseIndex[caseNumber]
  if (sessionId && sessions[sessionId] && sessions[sessionId].status !== 'completed') {
    return sessionId
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
