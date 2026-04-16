/**
 * sdk-message-broadcaster.ts — Shared SDK message deep-parser and SSE broadcaster
 *
 * Extracted from case-routes.ts for reuse by both single-case processing and patrol.
 * Deep-parses Claude SDK messages (nested content blocks) and broadcasts
 * semantic SSE events with proper content extraction.
 */
import { sseManager } from '../watcher/sse-manager.js'
import { appendSessionMessage } from '../agent/case-session-manager.js'
import { getSSEEventType, formatMessageForSSE, getPersistedMessageType } from './sse-helpers.js'
import type { ToolCallRecord } from '../types/index.js'

/**
 * Extract a human-readable summary from tool input.
 * Used to show meaningful descriptions in SSE messages (e.g., file paths, commands).
 */
export function summarizeToolInput(toolName: string, input: any): string {
  if (!input || typeof input !== 'object') return ''
  try {
    if (toolName === 'Bash' && input.command) return input.command.slice(0, 300)
    if (['Read', 'Write', 'Edit'].includes(toolName) && input.file_path) return input.file_path
    if (toolName === 'Glob' && input.pattern) return input.pattern
    if (toolName === 'Grep' && input.pattern) return `/${input.pattern}/` + (input.path ? ` in ${input.path}` : '')
    if (toolName === 'Agent' && input.prompt) return input.prompt.slice(0, 200)
    if (input.url) return input.url
    if (input.query) return input.query
    for (const key of Object.keys(input)) {
      if (typeof input[key] === 'string' && input[key].length > 0) {
        return `${key}: ${input[key].slice(0, 200)}`
      }
    }
  } catch { /* ignore */ }
  return ''
}

/**
 * Infer casework sub-step from tool-call context.
 * Returns a human-readable step name if detectable, or null for generic tool calls.
 */
export function inferCaseworkSubstep(toolName: string, toolContent: string): string | null {
  const c = toolContent.toLowerCase()
  // Agent spawns → subagent type is the step
  if (toolName === 'Agent') {
    if (c.includes('troubleshoot')) return 'troubleshoot'
    if (c.includes('email-drafter') || c.includes('draft-email')) return 'draft-email'
    if (c.includes('teams-search')) return 'teams-search'
    if (c.includes('onenote')) return 'onenote-search'
    if (c.includes('challenge')) return 'challenge'
  }
  // Bash → script names
  if (toolName === 'Bash') {
    if (c.includes('fetch-all-data') || c.includes('fetch-notes') || c.includes('fetch-emails')) return 'data-refresh'
    if (c.includes('check-ir-status') || c.includes('check-entitlement') || c.includes('mooncake-cc')) return 'compliance-check'
    if (c.includes('check-case-changes') || c.includes('changegate') || c.includes('fast-path')) return 'changegate'
    if (c.includes('detect-case-status')) return 'archive-detect'
    if (c.includes('record-timing') || c.includes('.t_')) {
      if (c.includes('agentwait') || c.includes('agent_wait')) return 'waiting-agents'
      return null  // timing markers are internal, don't change displayed step
    }
    if (c.includes('view-labor') || c.includes('download-attachment')) return 'data-refresh'
    if (c.includes('casework-fast-path')) return 'fast-path'
  }
  // Read SKILL.md → init
  if (toolName === 'Read' && c.includes('skill.md')) {
    if (c.includes('casework')) return 'init'
    if (c.includes('compliance')) return 'compliance-check'
    if (c.includes('status-judge')) return 'status-judge'
    if (c.includes('inspection')) return 'inspection-writer'
    if (c.includes('note-gap')) return 'note-gap'
    if (c.includes('data-refresh')) return 'data-refresh'
  }
  // Write to specific outputs
  if ((toolName === 'Write' || toolName === 'Edit') && c.includes('case-summary')) return 'inspection-writer'
  if ((toolName === 'Write' || toolName === 'Edit') && c.includes('casework-meta')) return 'status-judge'
  if ((toolName === 'Write' || toolName === 'Edit') && c.includes('note-draft')) return 'note-gap'
  // MCP tools
  if (toolName.startsWith('mcp__icm__')) return 'icm-check'
  if (toolName.startsWith('mcp__kusto__')) return 'troubleshoot'
  if (toolName.startsWith('mcp__teams__')) return 'teams-search'
  if (toolName.startsWith('mcp__mail__')) return 'email-search'
  if (toolName.startsWith('mcp__msft-learn__')) return 'troubleshoot'
  return null
}

export interface BroadcastResult {
  sessionId: string | undefined
  messageCount: number
  toolCalls: ToolCallRecord[]
  turns: number
}

/**
 * Deep-parse SDK messages and broadcast semantic SSE events.
 *
 * Handles the nested SDK message structure:
 * - assistant messages: message.message.content → array of text/thinking/tool_use blocks
 * - tool_result messages: message.content (string) or message.text
 * - other messages: fallback to getSSEEventType + formatMessageForSSE
 *
 * Broadcasts as 'case-step-progress' events with `kind` field for frontend consistency.
 * Persists messages via appendSessionMessage for recovery on page refresh.
 */
export async function broadcastSDKMessages(
  caseNumber: string,
  stepName: string,
  queryIter: AsyncIterable<any>,
): Promise<BroadcastResult> {
  let capturedSessionId: string | undefined
  let messageCount = 0
  let lastToolName: string | undefined
  const toolCalls: ToolCallRecord[] = []
  let turns = 0

  for await (const message of queryIter) {
    // Capture SDK session ID
    if ((message as any).sdkSessionId && !capturedSessionId) {
      capturedSessionId = (message as any).sdkSessionId
    }
    if ((message as any).session_id && !capturedSessionId) {
      capturedSessionId = (message as any).session_id
    }

    // Deep-parse assistant messages (SDK nested structure: message.message.content)
    if (message.type === 'assistant' && message.message?.content) {
      turns++
      const content = message.message.content
      if (Array.isArray(content)) {
        for (const block of content) {
          if (block.type === 'tool_use') {
            const toolContent = summarizeToolInput((block as any).name, (block as any).input)
            lastToolName = (block as any).name
            const substep = inferCaseworkSubstep(lastToolName!, toolContent)
            // Track tool call (mark as pending; will be resolved by tool_result)
            toolCalls.push({ name: lastToolName!, success: true })
            messageCount++
            sseManager.broadcast('case-step-progress' as any, {
              caseNumber,
              sessionId: capturedSessionId,
              step: stepName,
              kind: 'tool-call',
              toolName: lastToolName,
              content: toolContent,
              ...(substep ? { substep } : {}),
              timestamp: new Date().toISOString(),
            })
            appendSessionMessage(caseNumber, {
              type: 'tool-call',
              content: toolContent,
              toolName: lastToolName,
              step: stepName,
              timestamp: new Date().toISOString(),
            })
          } else if (block.type === 'text' && (block as any).text) {
            messageCount++
            const text = (block as any).text.slice(0, 500)
            sseManager.broadcast('case-step-progress' as any, {
              caseNumber,
              sessionId: capturedSessionId,
              step: stepName,
              kind: 'thinking',
              content: text,
              timestamp: new Date().toISOString(),
            })
            appendSessionMessage(caseNumber, {
              type: 'thinking',
              content: text,
              step: stepName,
              timestamp: new Date().toISOString(),
            })
          } else if (block.type === 'thinking' && (block as any).thinking) {
            messageCount++
            const thinkText = (block as any).thinking.slice(0, 500)
            sseManager.broadcast('case-step-progress' as any, {
              caseNumber,
              sessionId: capturedSessionId,
              step: stepName,
              kind: 'thinking',
              content: thinkText,
              timestamp: new Date().toISOString(),
            })
            appendSessionMessage(caseNumber, {
              type: 'thinking',
              content: thinkText,
              step: stepName,
              timestamp: new Date().toISOString(),
            })
          }
        }
      }
      continue // already handled
    }

    // Deep-parse tool_result messages
    if (message.type === 'tool_result') {
      // Check if tool_result indicates an error
      const isError = (message as any).is_error === true
      if (isError && toolCalls.length > 0) {
        const lastCall = toolCalls[toolCalls.length - 1]
        lastCall.success = false
        const errText = typeof message.content === 'string' ? message.content.slice(0, 200) : ''
        if (errText) lastCall.error = errText
      }
      const resultContent = typeof message.content === 'string'
        ? message.content.slice(0, 300)
        : typeof message.text === 'string'
          ? message.text.slice(0, 300)
          : ''
      if (resultContent) {
        messageCount++
        sseManager.broadcast('case-step-progress' as any, {
          caseNumber,
          sessionId: capturedSessionId,
          step: stepName,
          kind: 'tool-result',
          toolName: lastToolName,
          content: resultContent,
          timestamp: new Date().toISOString(),
        })
        appendSessionMessage(caseNumber, {
          type: 'tool-result',
          content: resultContent,
          toolName: lastToolName,
          step: stepName,
          timestamp: new Date().toISOString(),
        })
      }
      continue // already handled
    }

    // For other message types (system, user, result), broadcast as-is
    messageCount++
    const eventType = getSSEEventType(message)
    const formatted = formatMessageForSSE(message)
    sseManager.broadcast(eventType as any, {
      caseNumber,
      sessionId: capturedSessionId,
      step: stepName,
      ...formatted,
    })
    // Only persist non-empty content
    if (typeof formatted.content === 'string' && formatted.content.trim()) {
      appendSessionMessage(caseNumber, {
        type: getPersistedMessageType(message),
        content: formatted.content,
        toolName: formatted.toolName as string,
        step: stepName,
        timestamp: formatted.timestamp as string || new Date().toISOString(),
      })
    }
  }

  return { sessionId: capturedSessionId, messageCount, toolCalls, turns }
}
