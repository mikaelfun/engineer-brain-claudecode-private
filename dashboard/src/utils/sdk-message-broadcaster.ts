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
