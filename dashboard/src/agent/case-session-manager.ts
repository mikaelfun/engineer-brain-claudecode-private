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
 *   - Patrol is now delegated to CLI via cli-patrol-manager.ts (thin shell)
 *
 * 注意: @anthropic-ai/claude-agent-sdk 提供 query() 函数
 */
import { query, type Options, type SDKMessage, type CanUseTool, type McpServerConfig, type AgentDefinition } from '@anthropic-ai/claude-agent-sdk'
import { sdkRegistry } from './sdk-session-registry.js'
import { readFileSync, existsSync, writeFileSync, mkdirSync, appendFileSync, readdirSync, unlinkSync } from 'fs'
import { join, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'
import { sseManager } from '../watcher/sse-manager.js'
import { getSkillRegistry } from '../services/skill-registry.js'
import { broadcastSDKMessages } from '../utils/sdk-message-broadcaster.js'
import type { ExecutionSummary, ToolCallRecord } from '../types/index.js'
import { config } from '../config.js'

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

// ---- Connection Timeout ----
// SDK query() has internal exponential-backoff retry on ECONNREFUSED,
// leading to ~180s total wait. We add a connection-level timeout that
// aborts the query if no first message arrives within CONNECTION_TIMEOUT_MS.
const CONNECTION_TIMEOUT_MS = 120_000 // 120 seconds — MCP servers (13+) need time to initialize
const RESUME_TIMEOUT_MS = 6_000 // 6 seconds — resume doesn't need MCP init, should be fast

/**
 * Create a timer that auto-aborts the AbortController if no message arrives.
 * Call clearConnectionTimeout() after receiving the first message.
 */
function setConnectionTimeout(ac: AbortController, label: string): ReturnType<typeof setTimeout> {
  return setTimeout(() => {
    console.error(`[SDK] Connection timeout (${CONNECTION_TIMEOUT_MS / 1000}s) for ${label} — aborting`)
    try { ac.abort() } catch { /* ignore */ }
  }, CONNECTION_TIMEOUT_MS)
}

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
      const raw = config.casesRoot || ''
      // Always resolve to absolute path based on project root
      // so file operations work regardless of process.cwd()
      return raw ? resolve(getProjectRoot(), raw) : ''
    } catch {
      // fall through
    }
  }
  return ''
}

// ---- MCP Server Config ----

// MCP servers relevant to case processing (subset of .mcp.json)
// ISS-231: Reduced to msft-learn and local-rag only (icm/teams/mail/kusto handled by scripts/agents)
const CASE_MCP_SERVER_NAMES = ['msft-learn', 'local-rag']

// Per-step MCP requirements — steps not listed here get ALL MCP servers (full-process, etc.)
const STEP_MCP_SERVERS: Record<string, string[]> = {
  'data-refresh':        [],
  'compliance-check':    [],
  'status-judge':        [],
  'inspection':          [],
  'labor-estimate':      [],
  'note-gap':            [],
  'onenote-case-search': [],
  'generate-kb':         ['local-rag'],
  'teams-search':        [],
  'email-search':        [],
  'draft-email':         [],
  'troubleshoot':        ['msft-learn', 'local-rag'],
}

// Cached MCP config (loaded once per process)
let _mcpServersCache: Record<string, McpServerConfig> | null = null

/**
 * Load MCP server configs from project .mcp.json, filtered to case-relevant servers.
 * If stepName is provided and has a mapping in STEP_MCP_SERVERS, only load those MCPs.
 * Returns empty object if .mcp.json is missing or malformed (never blocks session creation).
 */
function getCaseMcpServers(stepName?: string): Record<string, McpServerConfig> {
  // Load all case MCP configs into cache (once per process)
  if (_mcpServersCache === null) {
    const mcpConfigPath = join(getProjectRoot(), '.mcp.json')
    try {
      if (!existsSync(mcpConfigPath)) {
        console.warn('[MCP] .mcp.json not found — sessions will run without MCP servers')
        _mcpServersCache = {}
      } else {
        const raw = JSON.parse(readFileSync(mcpConfigPath, 'utf-8'))
        const allServers: Record<string, any> = raw.mcpServers || {}
        const filtered: Record<string, McpServerConfig> = {}

        for (const name of CASE_MCP_SERVER_NAMES) {
          if (allServers[name]) {
            filtered[name] = allServers[name] as McpServerConfig
          }
        }

        console.log(`[MCP] Loaded ${Object.keys(filtered).length} case MCP servers: ${Object.keys(filtered).join(', ')}`)
        _mcpServersCache = filtered
      }
    } catch (err) {
      console.warn('[MCP] Failed to load .mcp.json — sessions will run without MCP servers:', (err as Error).message)
      _mcpServersCache = {}
    }
  }

  // If step has a specific MCP mapping, filter down
  if (stepName && stepName in STEP_MCP_SERVERS) {
    const needed = STEP_MCP_SERVERS[stepName]
    if (needed.length === 0) return {}
    const result: Record<string, McpServerConfig> = {}
    for (const name of needed) {
      if (_mcpServersCache[name]) result[name] = _mcpServersCache[name]
    }
    return result
  }

  // Default: return all case MCP servers
  return _mcpServersCache
}


// ---- Agent Definitions Loader (ISS-200) ----

// Cached agent definitions (loaded once per process)
let _agentDefinitionsCache: Record<string, AgentDefinition> | null = null

/**
 * Load custom agent definitions from {projectRoot}/.claude/agents/*.md.
 * Parses YAML frontmatter for name/description/tools/model/mcpServers,
 * uses markdown body as the agent's prompt.
 *
 * Returns Record<string, AgentDefinition> for injection into query() options.agents.
 * Cached after first call. Individual parse failures are warned and skipped.
 */
export function loadAgentDefinitions(): Record<string, AgentDefinition> {
  if (_agentDefinitionsCache !== null) return _agentDefinitionsCache

  const agentsDir = join(getProjectRoot(), '.claude', 'agents')
  const definitions: Record<string, AgentDefinition> = {}

  try {
    if (!existsSync(agentsDir)) {
      console.warn('[Agents] .claude/agents/ not found — no custom agents loaded')
      _agentDefinitionsCache = definitions
      return definitions
    }

    const files = readdirSync(agentsDir).filter(f => f.endsWith('.md'))

    for (const file of files) {
      try {
        const filePath = join(agentsDir, file)
        const content = readFileSync(filePath, 'utf-8')

        // Parse YAML frontmatter (between --- delimiters)
        const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
        if (!fmMatch) {
          console.warn(`[Agents] ${file}: no valid frontmatter found, skipping`)
          continue
        }

        const frontmatter = fmMatch[1]
        const body = fmMatch[2].trim()

        // Parse YAML fields manually (avoid adding yaml dependency)
        const name = parseYamlField(frontmatter, 'name')
        const description = parseYamlField(frontmatter, 'description')

        if (!name || !description) {
          console.warn(`[Agents] ${file}: missing required 'name' or 'description' in frontmatter, skipping`)
          continue
        }

        const toolsRaw = parseYamlField(frontmatter, 'tools')
        const model = parseYamlField(frontmatter, 'model')
        const mcpServersList = parseYamlList(frontmatter, 'mcpServers')

        const def: AgentDefinition = {
          description: description.replace(/^["']|["']$/g, ''), // strip surrounding quotes
          prompt: body,
        }

        if (toolsRaw) {
          def.tools = toolsRaw.split(',').map(t => t.trim()).filter(Boolean)
        }

        if (model) {
          def.model = model
        }

        if (mcpServersList.length > 0) {
          def.mcpServers = mcpServersList
        }

        definitions[name] = def
      } catch (err) {
        console.warn(`[Agents] Failed to parse ${file}:`, (err as Error).message)
      }
    }

    console.log(`[Agents] Loaded ${Object.keys(definitions).length} agent definitions: ${Object.keys(definitions).join(', ')}`)
  } catch (err) {
    console.warn('[Agents] Failed to read .claude/agents/ directory:', (err as Error).message)
  }

  _agentDefinitionsCache = definitions
  return definitions
}

/**
 * Parse a simple YAML scalar field: "key: value" or "key: 'value'" or 'key: "value"'
 */
function parseYamlField(yaml: string, key: string): string | undefined {
  const regex = new RegExp(`^${key}:\\s*(.+?)\\s*$`, 'm')
  const match = yaml.match(regex)
  if (!match) return undefined
  return match[1].replace(/^["']|["']$/g, '') // strip surrounding quotes
}

/**
 * Parse a YAML list field:
 *   mcpServers:
 *     - teams
 *     - icm
 * Returns string[] of list items.
 */
function parseYamlList(yaml: string, key: string): string[] {
  const lines = yaml.split(/\r?\n/)
  const items: string[] = []
  let capturing = false

  for (const line of lines) {
    if (line.match(new RegExp(`^${key}:\\s*$`))) {
      capturing = true
      continue
    }
    if (capturing) {
      const itemMatch = line.match(/^\s+-\s+(.+?)\s*$/)
      if (itemMatch) {
        items.push(itemMatch[1])
      } else if (line.match(/^\S/)) {
        // Next top-level key, stop capturing
        break
      }
    }
  }

  return items
}

/**
 * Clear the agent definitions cache (for testing or hot-reload).
 */
export function clearAgentDefinitionsCache(): void {
  _agentDefinitionsCache = null
}

const sessionStorePath = config.caseSessionsFile
const sessionMessagesPath = config.caseSessionMessagesFile
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

/**
 * Clear persisted messages for a specific step only (other steps preserved).
 */
export function clearStepSessionMessages(caseNumber: string, stepName: string): void {
  if (!sessionMessages[caseNumber]) return
  sessionMessages[caseNumber] = sessionMessages[caseNumber].filter(m => m.step !== stepName)
  saveSessionMessages()
}

// ---- Step-Level Log Writer (REMOVED by ISS-231) ----
// writeStepLog() was removed — session.jsonl in runs/{runId}/ replaces markdown step logs.

// ---- Execution Summary Extraction (ISS-136) ----

/**
 * Extract ExecutionSummary from collected SDK messages.
 * Called by route handlers after session completes.
 *
 * @param messages - Raw SDK messages collected during session
 * @param agentType - The agent/step type (e.g. 'full-process', 'data-refresh')
 * @param mcpServerNames - MCP server names passed to the session
 * @returns ExecutionSummary or null if extraction fails
 */
export function buildExecutionSummary(
  toolCalls: ToolCallRecord[],
  agentType: string,
  turns: number,
  mcpServerNames?: string[],
): ExecutionSummary | null {
  try {
    return {
      agentType,
      turns,
      mcpServers: mcpServerNames ?? Object.keys(getCaseMcpServers()),
      toolCalls,
    }
  } catch {
    return null
  }
}

/**
 * Get the list of case MCP server names (for executionSummary).
 */
export function getCaseMcpServerNames(): string[] {
  return Object.keys(getCaseMcpServers())
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

// ---- Expired Session Purge ----
// Remove completed/failed sessions after TTL, paused sessions after SDK expiry,
// and sessions for cases no longer in active/ directory (archived).
const COMPLETED_TTL_MS = 2 * 60 * 60 * 1000   // 2 hours — keep completed sessions visible in Agent Monitor
const PAUSED_TTL_MS = 15 * 60 * 1000         // 15 min for paused (SDK session expired)
const PURGE_INTERVAL_MS = 30 * 60 * 1000     // run every 30 min
const MESSAGE_TTL_MS = 2 * 60 * 60 * 1000    // 2 hours — purge messages earlier than sessions

/**
 * Purge expired / orphaned sessions from the store.
 * - completed/failed older than 1 hour
 * - paused older than 15 min (SDK can't resume)
 * - any session whose case is no longer in cases/active/
 */
export function purgeExpiredSessions(): { purged: number; remaining: number } {
  const now = Date.now()
  // Build a Set of active case numbers for O(1) lookup
  let activeCases: Set<string> | null = null
  try {
    const casesRoot = getCasesRoot()
    if (casesRoot) {
      const activeCasesDir = join(casesRoot, 'active')
      if (existsSync(activeCasesDir)) {
        activeCases = new Set(readdirSync(activeCasesDir, { withFileTypes: true })
          .filter(e => e.isDirectory()).map(e => e.name))
      }
    }
  } catch { /* if workspace not ready, skip archive check */ }

  let purged = 0
  const sidsToPurge: string[] = []

  for (const [sid, info] of Object.entries(sessions)) {
    const age = now - new Date(info.lastActivityAt).getTime()
    const isTerminal = info.status === 'completed' || info.status === 'failed'
    const isPausedExpired = info.status === 'paused' && age > PAUSED_TTL_MS
    const isTerminalExpired = isTerminal && age > COMPLETED_TTL_MS
    const isCaseArchived = activeCases !== null && !activeCases.has(info.caseNumber)

    if (isTerminalExpired || isPausedExpired || (isCaseArchived && !isActiveQuery(info.caseNumber))) {
      sidsToPurge.push(sid)
    }
  }

  // Separately purge old messages (shorter TTL than sessions)
  let messagesPurged = 0
  for (const [sid, info] of Object.entries(sessions)) {
    if (sidsToPurge.includes(sid)) continue // will be fully deleted anyway
    const age = now - new Date(info.lastActivityAt).getTime()
    const isTerminal = info.status === 'completed' || info.status === 'failed'
    if (isTerminal && age > MESSAGE_TTL_MS && sessionMessages[info.caseNumber]) {
      delete sessionMessages[info.caseNumber]
      messagesPurged++
    }
  }

  for (const sid of sidsToPurge) {
    const info = sessions[sid]
    if (caseIndex[info.caseNumber] === sid) {
      delete caseIndex[info.caseNumber]
    }
    // Clean session messages keyed by caseNumber (only if no other session exists for this case)
    const otherSessionsForCase = Object.values(sessions).filter(s => s.caseNumber === info.caseNumber && s.sessionId !== sid)
    if (otherSessionsForCase.length === 0) {
      delete sessionMessages[info.caseNumber]
    }
    delete sessions[sid]
    purged++
  }

  if (purged > 0 || messagesPurged > 0) {
    saveSessionStore()
    saveSessionMessages()
    console.log(`[session-purge] Purged ${purged} session(s), ${messagesPurged} message cache(s), ${Object.keys(sessions).length} remaining`)
  }

  return { purged, remaining: Object.keys(sessions).length }
}

/** Check if a case has an active in-memory SDK query */
function isActiveQuery(caseNumber: string): boolean {
  return activeQueries.has(caseNumber)
}

// Run purge on startup (after loadSessionStore already ran)
purgeExpiredSessions()

// Periodic purge
const purgeTimer = setInterval(purgeExpiredSessions, PURGE_INTERVAL_MS)
purgeTimer.unref()

// ---- System Prompt Builder ----

function buildCaseAppendPrompt(caseNumber: string): string {
  const casesRoot = getCasesRoot()
  const caseDir = join(casesRoot, 'active', caseNumber)

  // Inject CLAUDE.md project instructions (since we use settingSources: ['user'] to skip project MCP servers)
  let claudeMd = ''
  const claudeMdPath = join(getProjectRoot(), 'CLAUDE.md')
  if (existsSync(claudeMdPath)) {
    try {
      claudeMd = `\n\n## Project Instructions (CLAUDE.md)\n${readFileSync(claudeMdPath, 'utf-8')}\n`
    } catch {
      // ignore
    }
  }

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

  return `${claudeMd}\nYou are processing Case ${caseNumber}.\nCase directory: ${caseDir}\n${caseSummary}

## CRITICAL SAFETY RULES — D365 Write Operations BLOCKED

You are running in automated patrol/casework mode. The following actions are ABSOLUTELY FORBIDDEN:

1. **NEVER call d365-case-ops email scripts**: \`new-email.ps1\`, \`reply-email.ps1\`, \`edit-draft.ps1\`, \`open-draft.ps1\`, \`delete-draft.ps1\`
2. **NEVER use Mail MCP write tools**: \`CreateDraftMessage\`, \`SendDraftMessage\`, \`SendEmailWithAttachments\`, \`ReplyToMessage\`, \`ForwardMessage\`, \`ReplyAllToMessage\`
3. **NEVER create, send, or modify emails in D365 or Outlook** — email drafts must ONLY be saved as local markdown files in \`{caseDir}/drafts/\`
4. **NEVER call d365-case-ops write scripts**: \`add-note.ps1\`, \`add-phonecall.ps1\`, \`record-labor.ps1\` — these require explicit user confirmation

Email drafts go to: \`{caseDir}/drafts/YYYYMMDD-HHMM-{type}-{lang}-{recipient}.md\` (local files only).
The user will review drafts and send manually.
`
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
 * Always creates a fresh session — no cross-execution resume (ISS-231 simplification).
 * Resume is only used for intra-execution AskUserQuestion via chatCaseSession().
 */
export async function* processCaseSession(
  caseNumber: string,
  intent: string,
  canUseTool?: CanUseTool,
  mcpOverride?: Record<string, McpServerConfig>,
  /** If true, don't register in caseIndex */
  ephemeral?: boolean,
): AsyncGenerator<SDKMessage & { sdkSessionId?: string }> {
  // Clean up any previous session for this case (no resume — always fresh)
  const existingSessionId = caseIndex[caseNumber]
  if (existingSessionId && sessions[existingSessionId]) {
    sessions[existingSessionId].status = 'completed'
    delete caseIndex[caseNumber]
    saveSessionStore()
  }

  const now = new Date().toISOString()
  let sdkSessionId: string | undefined

  // Ensure context directory exists
  ensureContextDir(caseNumber)

  // Initialize state.json and mark start=active (SDK cold-start timing begins here)
  // This is deterministic — happens before SDK query(), so startedAt = button click time.
  // data-refresh.sh will later write start=completed (cold-start duration = completed - started).
  try {
    const casesRoot = getCasesRoot()
    const caseDir = join(casesRoot, 'active', caseNumber)
    const updateStatePy = join(getProjectRoot(), '.claude', 'skills', 'casework', 'scripts', 'update-state.py')
    if (existsSync(updateStatePy)) {
      execSync(
        `python3 "${updateStatePy}" --case-dir "${caseDir}" --init --run-type casework --step start --status active --case-number "${caseNumber}"`,
        { timeout: 5000, stdio: 'pipe' }
      )
    }
  } catch (err) {
    console.warn(`[processCaseSession] Failed to init state.json for ${caseNumber}:`, (err as Error).message)
  }

  // Register in unified SDK session registry for Agent Monitor observability
  const registryHandle = sdkRegistry.register({
    source: 'case',
    context: caseNumber,
    intent,
    metadata: { ephemeral },
  })

  // Create AbortController for this query (ISS-086)
  const abortController = registerQuery(caseNumber)
  // Connection timeout: abort if no first message within 30s
  const connTimer = setConnectionTimeout(abortController, `process:${caseNumber}`)
  let firstMessageReceived = false

  try {
    for await (const message of query({
      prompt: `Case ${caseNumber}: ${intent}`,
      options: {
        abortController,
        cwd: getProjectRoot(),
        // settingSources: ['user'] — skip 'project' to avoid loading .mcp.json (300+ MCP tools
        // overflow the API token limit). CLAUDE.md is injected via systemPrompt.append instead.
        // Case-relevant MCP servers are explicitly passed via mcpServers option (ISS-134).
        // Custom agents are explicitly loaded from .claude/agents/*.md (ISS-200).
        settingSources: ['user'] as Options['settingSources'],
        mcpServers: mcpOverride ?? getCaseMcpServers(),
        agents: loadAgentDefinitions(),
        systemPrompt: {
          type: 'preset' as const,
          preset: 'claude_code' as const,
          append: buildCaseAppendPrompt(caseNumber),
        },
        tools: ['Bash', 'Read', 'Write', 'Edit', 'Glob', 'Grep', 'Agent'],
        allowedTools: ['Read', 'Write', 'Bash', 'Edit', 'Glob', 'Grep', 'Agent'],
        permissionMode: 'bypassPermissions',
        allowDangerouslySkipPermissions: true,
        maxTurns: 200,
        stderr: (data: string) => console.error(`[SDK:stderr:${caseNumber}]`, data.trim()),
        ...(canUseTool ? { canUseTool } : {}),
      },
    })) {
      // Clear connection timeout on first message
      if (!firstMessageReceived) {
        firstMessageReceived = true
        clearTimeout(connTimer)
      }
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
        if (!ephemeral) {
          caseIndex[caseNumber] = sdkSessionId
        }
        saveSessionStore()
      }

      // Update activity timestamp
      if (sdkSessionId && sessions[sdkSessionId]) {
        sessions[sdkSessionId].lastActivityAt = new Date().toISOString()
      }

      // Detect maxTurns exhaustion — break out to avoid hang
      if ((message as any).subtype === 'error_max_turns') {
        console.warn(`[SDK] maxTurns exhausted for case ${caseNumber} — ending session`)
        registryHandle.onMessage(message)
        yield { ...message, sdkSessionId } as any
        break
      }

      registryHandle.onMessage(message)
      yield { ...message, sdkSessionId } as any
    }

    // Mark as paused (can be resumed)
    if (sdkSessionId && sessions[sdkSessionId]) {
      sessions[sdkSessionId].status = 'paused'
      saveSessionStore()
    }
    registryHandle.complete()
    // Clean up AbortController + connection timer on normal completion (ISS-086)
    clearTimeout(connTimer)
    unregisterQuery(caseNumber)
  } catch (err) {
    // Clean up AbortController + connection timer on failure (ISS-086)
    clearTimeout(connTimer)
    unregisterQuery(caseNumber)
    // Enhance error message for connection timeout
    const isTimeout = !firstMessageReceived && (err as Error)?.message?.includes('abort')
    registryHandle.fail((err as Error)?.message || 'unknown error')
    if (sdkSessionId && sessions[sdkSessionId]) {
      sessions[sdkSessionId].status = 'failed'
      // Clean up caseIndex so failed session doesn't block new sessions
      if (caseIndex[caseNumber] === sdkSessionId) {
        delete caseIndex[caseNumber]
      }
      saveSessionStore()
    }
    if (isTimeout) {
      throw new Error(`SDK connection timeout: no response within ${CONNECTION_TIMEOUT_MS / 1000}s. Check that Claude Code CLI is installed and accessible.`)
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

  // Register in unified SDK session registry
  const registryHandle = sdkRegistry.register({
    source: 'case',
    context: session.caseNumber,
    intent: `Chat: ${userMessage.slice(0, 100)}`,
    metadata: { resumeSessionId: sessionId },
  })

  // Create AbortController for this query (ISS-086)
  const abortController = registerQuery(session.caseNumber)
  // Resume timeout: shorter than new session (no MCP init needed)
  const connTimer = setTimeout(() => {
    console.error(`[SDK] Resume timeout (${RESUME_TIMEOUT_MS / 1000}s) for chat:${session.caseNumber} — aborting`)
    try { abortController.abort() } catch { /* ignore */ }
  }, RESUME_TIMEOUT_MS)
  let firstMessageReceived = false

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
      // Clear connection timeout on first message
      if (!firstMessageReceived) {
        firstMessageReceived = true
        clearTimeout(connTimer)
      }
      session.lastActivityAt = new Date().toISOString()
      saveSessionStore()
      registryHandle.onMessage(message)
      yield message
    }

    session.status = 'paused' // Paused, can be resumed
    saveSessionStore()
    registryHandle.complete()
    // Clean up AbortController + connection timer on normal completion (ISS-086)
    clearTimeout(connTimer)
    unregisterQuery(session.caseNumber)
  } catch (err) {
    // Clean up AbortController + connection timer on failure (ISS-086)
    clearTimeout(connTimer)
    unregisterQuery(session.caseNumber)
    const isTimeout = !firstMessageReceived && (err as Error)?.message?.includes('abort')
    registryHandle.fail((err as Error)?.message || 'unknown error')
    session.status = 'failed'
    // Clean up caseIndex so failed session doesn't block new sessions
    if (caseIndex[session.caseNumber] === sessionId) {
      delete caseIndex[session.caseNumber]
    }
    saveSessionStore()
    if (isTimeout) {
      throw new Error(`SDK connection timeout: no response within ${CONNECTION_TIMEOUT_MS / 1000}s. Check that Claude Code CLI is installed and accessible.`)
    }
    throw err
  }
}

/**
 * Execute a specific step within a case session.
 * Always creates a fresh session — no cross-execution resume (ISS-231 simplification).
 */
export async function* stepCaseSession(
  caseNumber: string,
  stepName: string,
  options?: { emailType?: string; forceRefresh?: boolean; fullSearch?: boolean; canUseTool?: CanUseTool }
): AsyncGenerator<SDKMessage & { sdkSessionId?: string }> {
  // Build dynamic params for prompt template
  const casesRoot = getCasesRoot()
  const caseDir = join(casesRoot, 'active', caseNumber)
  const promptParams: Record<string, string> = {
    caseNumber,
    casesRoot,
    caseDir,
  }

  // Handle step-specific params
  if (stepName === 'draft-email') {
    const emailTypeInstruction = (() => {
      if (!options?.emailType || options.emailType === 'auto') return ''
      return ` The email type is: "${options.emailType}". Draft accordingly.`
    })()
    promptParams.emailTypeInstruction = emailTypeInstruction
  }

  if (stepName === 'teams-search') {
    promptParams.forceRefresh = options?.forceRefresh ? ' --force-refresh' : ''
    promptParams.fullSearch = options?.fullSearch ? ' --full-search' : ''
  }

  // ISS-231: Build troubleshoot context (case-summary + analysis + dir listing)
  if (stepName === 'troubleshoot') {
    const casesRoot = getCasesRoot()
    const caseDir = join(casesRoot, 'active', caseNumber)
    const contextParts: string[] = []

    // Case summary
    const summaryPath = join(caseDir, 'case-summary.md')
    if (existsSync(summaryPath)) {
      try {
        const summary = readFileSync(summaryPath, 'utf-8')
        contextParts.push(`## Case Summary\n${summary}`)
      } catch { /* ignore */ }
    }

    // Analysis results (if any)
    const analysisDir = join(caseDir, 'analysis')
    if (existsSync(analysisDir)) {
      try {
        const analysisFiles = readdirSync(analysisDir).filter(f => f.endsWith('.md') || f.endsWith('.json')).sort().reverse()
        for (const file of analysisFiles.slice(0, 3)) { // latest 3 files max
          try {
            const content = readFileSync(join(analysisDir, file), 'utf-8')
            contextParts.push(`## Previous Analysis: ${file}\n${content.slice(0, 4000)}`)
          } catch { /* ignore */ }
        }
      } catch { /* ignore */ }
    }

    // Claims.json (troubleshooter previous output)
    const claimsPath = join(caseDir, '.casework', 'claims.json')
    if (existsSync(claimsPath)) {
      try {
        const claims = readFileSync(claimsPath, 'utf-8')
        contextParts.push(`## Previous Troubleshoot Claims\n\`\`\`json\n${claims.slice(0, 3000)}\n\`\`\``)
      } catch { /* ignore */ }
    }

    // Case directory structure
    try {
      const { execSync: execSyncLocal } = require('child_process')
      const listing = execSyncLocal(`ls -la "${caseDir}" 2>/dev/null || dir "${caseDir}" 2>nul`, {
        encoding: 'utf-8', timeout: 3000, cwd: getProjectRoot(),
      }).slice(0, 2000)
      contextParts.push(`## Case Directory\n\`\`\`\n${listing}\n\`\`\``)
    } catch { /* ignore */ }

    promptParams.troubleshootContext = contextParts.length > 0
      ? `\n\n# Pre-loaded Context\n\n${contextParts.join('\n\n')}`
      : ''
    promptParams.caseDir = caseDir
  }

  // Look up prompt from skill registry, with fallback for agent-based steps
  const AGENT_STEP_PROMPTS: Record<string, (caseNumber: string) => string> = {
    'onenote-case-search': (cn) => {
      const casesRoot = getCasesRoot()
      const caseDir = join(casesRoot, 'active', cn)
      return `Spawn the onenote-case-search agent for Case ${cn}. Use the Agent tool with subagent_type "onenote-case-search" and prompt: "Case ${cn}, caseDir=${caseDir}（绝对路径）。请先读取 .claude/agents/onenote-case-search.md 获取完整执行步骤，然后执行。"`
    },
  }

  let prompt: string | null = getSkillRegistry().getPrompt(stepName, promptParams)
  if (!prompt && AGENT_STEP_PROMPTS[stepName]) {
    prompt = AGENT_STEP_PROMPTS[stepName](caseNumber)
  }
  if (!prompt) {
    const available = getSkillRegistry().listSkills().map(s => s.webUiAlias || s.name)
    throw new Error(`Unknown step: ${stepName}. Available: ${available.join(', ')}`)
  }

  // Performance optimization (ISS-210): For simple inline skills, inject the SKILL.md
  // content directly so the agent doesn't waste a tool call reading it.
  // EXCEPTION: orchestrator skills (casework, patrol) are NOT injected — their SKILL.md
  // contains complex bash templates with variable references ({CD}, {CASE_DIR}) that
  // confuse the agent when injected as prompt text. The agent needs to Read them itself
  // to properly understand CWD and file paths.
  const skill = getSkillRegistry().getSkill(stepName)
  const SKIP_INJECTION = new Set(['casework', 'patrol'])
  if (!SKIP_INJECTION.has(stepName)) {
    const skillDir = skill?.skillDir || stepName
    const skillPath = join(getProjectRoot(), '.claude', 'skills', skillDir, 'SKILL.md')
    if (existsSync(skillPath)) {
      try {
        const skillContent = readFileSync(skillPath, 'utf-8')
        // Strip frontmatter (between --- markers)
        const bodyMatch = skillContent.match(/^---[\s\S]*?---\s*\n([\s\S]*)$/)
        const skillBody = bodyMatch ? bodyMatch[1] : skillContent
        // Inject as reference — agent doesn't need to Read SKILL.md
        // Replace template variables ({caseNumber}, {casesRoot}, {caseDir}) in skill body
        let resolvedBody = skillBody
        for (const [key, value] of Object.entries(promptParams)) {
          resolvedBody = resolvedBody.replaceAll(`{${key}}`, value)
        }
        prompt = `${prompt}\n\n## Skill Reference (already loaded — do NOT re-read SKILL.md)\n\n${resolvedBody}`
      } catch {
        // Fallback to original prompt if read fails
      }
    }
  }

  // Always create fresh session with step-specific MCP servers (ISS-231: no resume)
  const stepMcp = getCaseMcpServers(stepName)
  yield* processCaseSession(caseNumber, prompt, options?.canUseTool, stepMcp, true)
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

  // Always standalone query — no resume (ISS-231 simplification)
  const todoAbort = registerQuery(`todo-${caseNumber}`)
  const todoConnTimer = setConnectionTimeout(todoAbort, `todo:${caseNumber}`)
  let todoFirstMsg = false
  try {
    for await (const message of query({
      prompt,
      options: {
        abortController: todoAbort,
        cwd: getProjectRoot(),
        settingSources: ['user'] as Options['settingSources'],
        mcpServers: getCaseMcpServers(),
        systemPrompt: {
          type: 'preset' as const,
          preset: 'claude_code' as const,
          append: buildCaseAppendPrompt(caseNumber),
        },
        tools: ['Bash', 'Read', 'Write'],
        allowedTools: ['Bash', 'Read', 'Write'],
        permissionMode: 'bypassPermissions',
        allowDangerouslySkipPermissions: true,
        maxTurns: 10,
      },
    })) {
      if (!todoFirstMsg) { todoFirstMsg = true; clearTimeout(todoConnTimer) }
      yield message
    }
  } finally {
    clearTimeout(todoConnTimer)
    unregisterQuery(`todo-${caseNumber}`)
  }
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
 * Clean up stale/paused sessions for a case before starting a new operation.
 * Marks all non-active sessions as 'completed' and clears the caseIndex.
 * This prevents "session residual blocking" where a previous step's paused
 * session blocks new casework from starting (ISS-210).
 */
export function cleanupStaleSessions(caseNumber: string): number {
  let cleaned = 0
  for (const [sid, session] of Object.entries(sessions)) {
    if (session.caseNumber === caseNumber && session.status !== 'completed') {
      // Check if session is stale (no activity in last 2 minutes)
      const lastActivity = new Date(session.lastActivityAt).getTime()
      const isStale = Date.now() - lastActivity > 2 * 60 * 1000
      if (isStale || session.status === 'paused' || session.status === 'failed') {
        sessions[sid].status = 'completed'
        cleaned++
      }
    }
  }
  if (caseIndex[caseNumber]) {
    const indexedSession = sessions[caseIndex[caseNumber]]
    if (!indexedSession || indexedSession.status === 'completed') {
      delete caseIndex[caseNumber]
    }
  }
  if (cleaned > 0) {
    saveSessionStore()
    console.log(`[cleanupStaleSessions] Cleaned ${cleaned} stale sessions for case ${caseNumber}`)
  }
  return cleaned
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

/**
 * Register an externally-created session (e.g. from patrol-orchestrator).
 * If sessionId is already registered, updates lastActivityAt and status.
 * Set ephemeral=true to skip caseIndex registration (won't be resumed).
 */
export function registerCaseSession(
  sessionId: string,
  caseNumber: string,
  intent: string,
  ephemeral = true,
): void {
  const now = new Date().toISOString()
  if (sessions[sessionId]) {
    sessions[sessionId].lastActivityAt = now
    sessions[sessionId].status = 'active'
  } else {
    sessions[sessionId] = {
      sessionId,
      caseNumber,
      intent,
      status: 'active',
      createdAt: now,
      lastActivityAt: now,
    }
  }
  if (!ephemeral) {
    caseIndex[caseNumber] = sessionId
  }
  saveSessionStore()
}

/**
 * Update a session's status (e.g. mark as completed/failed after patrol finishes).
 */
export function updateCaseSessionStatus(
  sessionId: string,
  status: CaseSessionInfo['status'],
): void {
  if (sessions[sessionId]) {
    sessions[sessionId].status = status
    sessions[sessionId].lastActivityAt = new Date().toISOString()
    if (status === 'completed' || status === 'failed') {
      const cn = sessions[sessionId].caseNumber
      if (caseIndex[cn] === sessionId) {
        delete caseIndex[cn]
      }
    }
    saveSessionStore()
  }
}
