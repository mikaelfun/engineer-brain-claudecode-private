/**
 * session-log-parser.ts — Parse session.jsonl into recoverable SSE messages
 *
 * Single parser for recovering ALL SSE data from a run's session.jsonl:
 *   - Main agent messages (thinking, tool-call, tool-result, response)
 *   - Sub-agent lifecycle (started, progress, completed)
 *   - Sub-agent output (from agents/*.log files)
 *
 * Used by recovery APIs to rebuild frontend stores after page refresh / backend restart.
 */

/**
 * Infer real agent purpose from SDK's generic 'local_agent' task_type.
 * SDK Agent tool always reports task_type as 'local_agent';
 * the actual purpose is encoded in the description field (3-5 word task summary).
 */
export function inferAgentType(taskType: string, description?: string): string {
  if (taskType === 'local_bash') return 'local_bash'
  if (taskType && taskType !== 'local_agent' && taskType !== 'unknown') return taskType
  if (!description) return taskType || 'unknown'

  const desc = String(description).toLowerCase()
  if (desc.includes('casework') || desc.includes('case processing') || desc.includes('full process')) return 'casework'
  if (desc.includes('troubleshoot')) return 'troubleshooter'
  if (desc.includes('phase2') || desc.includes('phase 2')) return 'phase2'
  if (desc.includes('email') || desc.includes('draft')) return 'email-drafter'
  if (desc.includes('challenge') || desc.includes('review')) return 'challenger'
  if (desc.includes('reassess')) return 'reassess'
  if (desc.includes('summarize') || desc.includes('summary')) return 'summarize'
  if (desc.includes('data-refresh') || desc.includes('refresh')) return 'data-refresh'
  if (desc.includes('patrol')) return 'patrol'
  if (desc.includes('note-gap') || desc.includes('notegap')) return 'note-gap'
  if (desc.includes('labor')) return 'labor'
  if (desc.includes('onenote')) return 'onenote'
  if (desc.includes('teams')) return 'teams-search'
  // Fallback: use first 2-3 meaningful words from description
  const words = desc.replace(/[^a-z0-9\s-]/g, '').trim().split(/\s+/).slice(0, 3).join('-')
  return words || taskType || 'agent'
}
import { existsSync, readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { parseAssistantBlocks } from './sse-helpers.js'
import { summarizeToolInput } from './sdk-message-broadcaster.js'
import { config } from '../config.js'

// ---- Output types ----

export interface RecoveredMessage {
  type: 'system' | 'thinking' | 'tool-call' | 'tool-result' | 'response' | 'completed' | 'failed'
  content: string
  toolName?: string
  timestamp: string
}

export interface RecoveredSubAgent {
  taskId: string
  agentType: string
  caseNumber?: string
  status: 'running' | 'completed' | 'failed' | 'stopped'
  description?: string
  startedAt: string
  completedAt?: string
  summary?: string
  usage?: { total_tokens?: number; tool_uses?: number; duration_ms?: number }
  /** Messages derived from task_progress events */
  messages: RecoveredMessage[]
  /** Full output from agents/*.log file (if available) */
  output?: string
}

export interface RecoveredSession {
  /** Main agent SSE messages */
  mainMessages: RecoveredMessage[]
  /** Sub-agents keyed by taskId */
  subAgents: Record<string, RecoveredSubAgent>
}

// ---- Parser ----

/**
 * Parse a session.jsonl file + agents/*.log directory into recoverable data.
 *
 * @param sessionJsonlPath - Path to session.jsonl
 * @param agentsDir - Path to agents/ directory (optional, for sub-agent output files)
 */
export function parseSessionLog(sessionJsonlPath: string, agentsDir?: string): RecoveredSession {
  const result: RecoveredSession = {
    mainMessages: [],
    subAgents: {},
  }

  // Parse session.jsonl if it exists
  if (existsSync(sessionJsonlPath)) {

  const lines = readFileSync(sessionJsonlPath, 'utf-8').split('\n').filter(l => l.trim())

  for (const line of lines) {
    let msg: any
    try {
      msg = JSON.parse(line)
    } catch {
      continue
    }

    const subtype = msg.subtype as string | undefined
    /** Timestamp: prefer _ts injected at write time, then SDK's timestamp field, fallback to parse time */
    const ts = msg._ts || msg.timestamp || new Date().toISOString()

    // ---- Sub-agent lifecycle events ----
    if (subtype === 'task_started') {
      const taskId = msg.task_id as string
      const agentType = inferAgentType(msg.task_type as string, msg.description as string)
      if (agentType === 'local_bash') continue
      const prompt = (msg.prompt || msg.description || '') as string
      const caseMatch = prompt.match(/(?:Case\s+|case\s+|\/active\/|caseNumber[:\s]+)(\d{10,})/i)

      result.subAgents[taskId] = {
        taskId,
        agentType,
        caseNumber: caseMatch?.[1],
        status: 'running',
        description: msg.description,
        startedAt: ts,
        messages: [{
          type: 'system',
          content: `🤖 ${agentType} started${msg.description ? ': ' + msg.description : ''}`,
          timestamp: ts,
        }],
      }
      continue
    }

    if (subtype === 'task_progress') {
      const taskId = msg.task_id as string
      const sub = result.subAgents[taskId]
      if (sub) {
        if (msg.last_tool_name) {
          sub.messages.push({
            type: 'tool-call',
            content: msg.summary || '',
            toolName: msg.last_tool_name,
            timestamp: ts,
          })
        } else if (msg.summary) {
          sub.messages.push({
            type: 'thinking',
            content: msg.summary,
            timestamp: ts,
          })
        }
        sub.summary = msg.summary || sub.summary
        sub.usage = msg.usage || sub.usage
      }
      continue
    }

    if (subtype === 'task_notification') {
      const taskId = msg.task_id as string
      const sub = result.subAgents[taskId]
      if (sub) {
        const status = (msg.status as string) || 'completed'
        sub.status = (status === 'failed' || status === 'stopped') ? status as any : 'completed'
        sub.completedAt = ts
        sub.summary = msg.summary || sub.summary
        sub.usage = msg.usage || sub.usage
        sub.messages.push({
          type: sub.status === 'failed' ? 'failed' : 'completed',
          content: msg.summary || `Agent ${sub.status}`,
          timestamp: ts,
        })
      }
      continue
    }

    // ---- Main agent messages ----
    if (msg.type === 'assistant' && msg.message?.content) {
      const content = msg.message.content
      if (Array.isArray(content)) {
        for (const parsed of parseAssistantBlocks(content)) {
          if (parsed.kind === 'tool-call') {
            result.mainMessages.push({
              type: 'tool-call',
              toolName: parsed.toolName,
              content: summarizeToolInput(parsed.toolName!, parsed.toolInput),
              timestamp: ts,
            })
          } else {
            result.mainMessages.push({
              type: parsed.kind === 'response' ? 'response' : 'thinking',
              content: parsed.content?.slice(0, config.sseLimits.thinkingMaxLen) || '',
              timestamp: ts,
            })
          }
        }
      }
    }

    // tool_result: SDK wraps these as type:"user" with content[].type==="tool_result"
    if (msg.type === 'user' && Array.isArray(msg.message?.content)) {
      for (const block of msg.message.content) {
        if (block.type === 'tool_result') {
          const maxToolResult = config.sseLimits.toolResultMaxLen
          const resultContent = typeof block.content === 'string'
            ? block.content.slice(0, maxToolResult)
            : Array.isArray(block.content)
              ? block.content.map((b: any) => b.text || '').join('').slice(0, maxToolResult)
              : ''
          if (resultContent) {
            result.mainMessages.push({
              type: 'tool-result',
              content: resultContent,
              timestamp: ts,
            })
          }
        }
      }
    }

    // Legacy: standalone tool_result messages (older SDK format)
    if (msg.type === 'tool_result') {
      const maxToolResult = config.sseLimits.toolResultMaxLen
      const resultContent = typeof msg.content === 'string'
        ? msg.content.slice(0, maxToolResult)
        : typeof msg.text === 'string'
          ? msg.text.slice(0, maxToolResult)
          : ''
      if (resultContent) {
        result.mainMessages.push({
          type: 'tool-result',
          content: resultContent,
          timestamp: ts,
        })
      }
    }
  }
  } // end if (existsSync(sessionJsonlPath))

  // ---- Post-process: fix thinking/response classification for subagent output ----
  // SDK subagent JSONL strips thinking blocks — all content arrives as text (→ response).
  // Heuristic: if no thinking messages exist, treat all response messages except the last
  // as thinking (they're internal reasoning before tool calls).
  const hasThinking = result.mainMessages.some(m => m.type === 'thinking')
  if (!hasThinking) {
    let lastResponseIdx = -1
    for (let i = result.mainMessages.length - 1; i >= 0; i--) {
      if (result.mainMessages[i].type === 'response') { lastResponseIdx = i; break }
    }
    for (let i = 0; i < result.mainMessages.length; i++) {
      if (result.mainMessages[i].type === 'response' && i !== lastResponseIdx) {
        result.mainMessages[i].type = 'thinking'
      }
    }
  }

  // ---- Merge sub-agent output files ----
  // Sub-agent logs are full SDK JSONL (same format as session.jsonl).
  // Parse them to recover the sub-agent's complete SSE message stream.
  if (agentsDir && existsSync(agentsDir)) {
    try {
      const files = readdirSync(agentsDir).filter(f => f.endsWith('.log'))
      for (const file of files) {
        const agentId = file.replace('.log', '')
        const filePath = join(agentsDir, file)
        const raw = readFileSync(filePath, 'utf-8')
        const firstLine = raw.split('\n')[0]?.trim()

        // Detect JSONL format (starts with '{')
        let subMessages: RecoveredMessage[] = []
        if (firstLine?.startsWith('{')) {
          // Full SDK JSONL — parse like a session log
          const subParsed = parseSessionLog(filePath)
          subMessages = subParsed.mainMessages
        }

        // Match to existing sub-agent (from main agent's task_started/task_notification)
        // Try matching by agentId (taskId prefix) since log filename is the task_id
        const matchingSub = Object.values(result.subAgents).find(s =>
          s.taskId === agentId || s.taskId.startsWith(agentId) || agentId.startsWith(s.taskId.slice(0, 8))
        ) || Object.values(result.subAgents).find(s => s.agentType === agentId)

        if (matchingSub) {
          if (subMessages.length > 0) {
            matchingSub.messages = subMessages
          } else {
            matchingSub.output = raw
          }
        } else {
          // No lifecycle event found — create a standalone recovered entry
          const taskId = `recovered-${agentId}`
          // Extract timestamp from first JSONL line if available
          let startTs: string | undefined
          try { startTs = JSON.parse(firstLine).timestamp || JSON.parse(firstLine)._ts } catch {}
          result.subAgents[taskId] = {
            taskId,
            agentType: agentId,
            status: 'completed',
            startedAt: startTs || new Date().toISOString(),
            completedAt: startTs || new Date().toISOString(),
            messages: subMessages.length > 0 ? subMessages : [{
              type: 'completed',
              content: `Agent output recovered (${Math.round(raw.length / 1024)}KB)`,
              timestamp: startTs || new Date().toISOString(),
            }],
            output: subMessages.length === 0 ? raw : undefined,
          }
        }
      }
    } catch { /* non-fatal */ }
  }

  return result
}

/**
 * Find the latest run directory for a case.
 */
export function findLatestRunDir(caseworkDir: string): string | null {
  const runsDir = join(caseworkDir, 'runs')
  if (!existsSync(runsDir)) return null

  try {
    const dirs = readdirSync(runsDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name)
      .sort()
      .reverse()

    return dirs.length > 0 ? join(runsDir, dirs[0]) : null
  } catch {
    return null
  }
}
