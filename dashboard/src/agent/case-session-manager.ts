/**
 * case-session-manager.ts — Claude Code SDK per-case session 管理
 *
 * 提供：
 *   - processCaseSession: 完整 Case 处理（新 session）
 *   - chatCaseSession: 交互式反馈（resume 已有 session）
 *   - executeTodoAction: 执行单个 Todo 动作
 *   - patrolSession: 批量巡检
 *
 * 注意: @anthropic-ai/claude-code-sdk 提供 query() 函数
 */
import { query, type ClaudeCodeOptions, type Message } from '@anthropic-ai/claude-code-sdk'
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs'
import { join, resolve } from 'path'

// ---- Types ----

export interface CaseSessionInfo {
  sessionId: string
  caseNumber: string
  intent: string
  status: 'active' | 'paused' | 'completed' | 'failed'
  createdAt: string
  lastActivityAt: string
}

interface SessionStore {
  [sessionId: string]: CaseSessionInfo
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
let sessions: SessionStore = {}

function loadSessionStore(): void {
  if (existsSync(sessionStorePath)) {
    try {
      sessions = JSON.parse(readFileSync(sessionStorePath, 'utf-8'))
    } catch {
      sessions = {}
    }
  }
}

function saveSessionStore(): void {
  writeFileSync(sessionStorePath, JSON.stringify(sessions, null, 2), 'utf-8')
}

function generateSessionId(): string {
  const ts = Date.now().toString(36)
  const rand = Math.random().toString(36).slice(2, 6)
  return `cs-${ts}-${rand}`
}

// Initialize on import
loadSessionStore()

// ---- System Prompt Builder ----

function buildCaseSystemPrompt(caseNumber: string): string {
  const projectRoot = getProjectRoot()
  const casesRoot = getCasesRoot()
  const caseDir = join(casesRoot, 'active', caseNumber)

  return `You are an AI assistant for Azure Support Engineer Kun Fang.
You are processing Case ${caseNumber}.

Project root: ${projectRoot}
Case directory: ${caseDir}

You have access to:
- D365 PowerShell scripts in skills/d365-case-ops/scripts/
- Teams search scripts in skills/teams-case-search/scripts/
- Playbooks in playbooks/ (read as needed)
- Humanizer skills in skills/humanizer/ and skills/humanizer-zh/

Follow the orchestration rules defined in CLAUDE.md.
Coordinate subagents for case processing tasks.
`
}

// ---- Subagent Configs ----

function buildCaseAgents(): ClaudeCodeOptions['agents'] {
  const projectRoot = getProjectRoot()
  const agentsDir = join(projectRoot, '.claude', 'agents')

  // Read agent definitions from .claude/agents/
  const agentNames = [
    'data-refresh',
    'teams-search',
    'compliance-check',
    'troubleshooter',
    'email-drafter',
    'inspection-writer',
  ]

  const agents: NonNullable<ClaudeCodeOptions['agents']> = []

  for (const name of agentNames) {
    const mdPath = join(agentsDir, `${name}.md`)
    if (existsSync(mdPath)) {
      agents.push({
        name,
        description: `Subagent: ${name}`,
        prompt: readFileSync(mdPath, 'utf-8'),
      })
    }
  }

  return agents
}

// ---- MCP Config ----

function buildMcpConfig(): ClaudeCodeOptions['mcpServers'] {
  const projectRoot = getProjectRoot()
  const mcpJsonPath = join(projectRoot, '.mcp.json')

  if (existsSync(mcpJsonPath)) {
    try {
      const mcpConfig = JSON.parse(readFileSync(mcpJsonPath, 'utf-8'))
      return mcpConfig.mcpServers || {}
    } catch {
      return {}
    }
  }
  return {}
}

// ---- Public API ----

/**
 * Start a new case processing session
 */
export async function* processCaseSession(
  caseNumber: string,
  intent: string
): AsyncGenerator<Message> {
  const sessionId = generateSessionId()
  const now = new Date().toISOString()

  // Register session
  sessions[sessionId] = {
    sessionId,
    caseNumber,
    intent,
    status: 'active',
    createdAt: now,
    lastActivityAt: now,
  }
  saveSessionStore()

  try {
    for await (const message of query({
      prompt: `Case ${caseNumber}: ${intent}`,
      options: {
        systemPrompt: buildCaseSystemPrompt(caseNumber),
        allowedTools: ['Read', 'Write', 'Bash', 'Glob', 'Grep', 'Agent'],
        agents: buildCaseAgents(),
        mcpServers: buildMcpConfig(),
        permissionMode: 'acceptEdits',
        maxTurns: 50,
      },
    })) {
      sessions[sessionId].lastActivityAt = new Date().toISOString()
      saveSessionStore()
      yield { ...message, sessionId } as any
    }

    sessions[sessionId].status = 'completed'
    saveSessionStore()
  } catch (err) {
    sessions[sessionId].status = 'failed'
    saveSessionStore()
    throw err
  }
}

/**
 * Send interactive feedback to an existing session (resume)
 */
export async function* chatCaseSession(
  sessionId: string,
  userMessage: string
): AsyncGenerator<Message> {
  const session = sessions[sessionId]
  if (!session) {
    throw new Error(`Session ${sessionId} not found`)
  }

  session.status = 'active'
  session.lastActivityAt = new Date().toISOString()
  saveSessionStore()

  try {
    for await (const message of query({
      prompt: userMessage,
      options: {
        resume: sessionId,
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
 * Execute a specific Todo action (D365 write operation)
 */
export async function* executeTodoAction(
  caseNumber: string,
  action: string,
  params: Record<string, string>
): AsyncGenerator<Message> {
  const casesRoot = getCasesRoot()
  const caseDir = join(casesRoot, 'active', caseNumber)

  const prompt = `Execute the following D365 action for Case ${caseNumber}:
Action: ${action}
Parameters: ${JSON.stringify(params)}
Case directory: ${caseDir}

Use the appropriate PowerShell script from skills/d365-case-ops/scripts/ to execute this action.
After execution, update the corresponding Todo file to mark this item as completed [x].`

  for await (const message of query({
    prompt,
    options: {
      systemPrompt: buildCaseSystemPrompt(caseNumber),
      allowedTools: ['Bash', 'Read', 'Write'],
      permissionMode: 'acceptEdits',
      maxTurns: 10,
    },
  })) {
    yield message
  }
}

/**
 * Run patrol (batch inspection)
 */
export async function* patrolSession(): AsyncGenerator<Message> {
  const projectRoot = getProjectRoot()

  for await (const message of query({
    prompt: '/patrol',
    options: {
      systemPrompt: buildCaseSystemPrompt('patrol'),
      cwd: projectRoot,
      allowedTools: ['Read', 'Write', 'Bash', 'Glob', 'Grep', 'Agent'],
      agents: buildCaseAgents(),
      mcpServers: buildMcpConfig(),
      permissionMode: 'acceptEdits',
      maxTurns: 100,
    },
  })) {
    yield message
  }
}

/**
 * End a session
 */
export function endSession(sessionId: string): boolean {
  if (sessions[sessionId]) {
    sessions[sessionId].status = 'completed'
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
