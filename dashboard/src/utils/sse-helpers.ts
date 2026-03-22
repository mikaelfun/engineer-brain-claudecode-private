/**
 * sse-helpers.ts — Shared SSE message formatting utilities
 *
 * Used by case-routes.ts, steps.ts, and case-session-manager.ts
 * to convert Claude SDK messages into SSE event payloads.
 */

/** Map a Claude SDK message type to an SSE event name */
export function getSSEEventType(message: any): string {
  if (message.type === 'result') return 'case-session-completed'
  if (message.type === 'assistant') return 'case-session-thinking'
  if (message.type === 'tool_use') return 'case-session-tool-call'
  if (message.type === 'tool_result') return 'case-session-tool-result'
  return 'case-session-thinking'
}

/**
 * Map a Claude SDK message type to the frontend-compatible type name
 * used by caseSessionStore (thinking, tool-call, tool-result, etc.)
 */
export function getPersistedMessageType(message: any): string {
  if (message.type === 'assistant') return 'thinking'
  if (message.type === 'tool_use') return 'tool-call'
  if (message.type === 'tool_result') return 'tool-result'
  if (message.type === 'result') return 'completed'
  return 'system'
}

/**
 * Extract text content from a Claude SDK message.
 * SDK messages can have content as:
 *   - string (simple text)
 *   - array of content blocks: [{type: 'text', text: '...'}, {type: 'tool_use', ...}]
 *   - undefined/null
 */
function extractContent(message: any): string {
  const content = message.content ?? message.text ?? message.result ?? ''

  // Already a string
  if (typeof content === 'string') return content

  // Array of content blocks (SDK structured format)
  if (Array.isArray(content)) {
    const parts: string[] = []
    for (const block of content) {
      if (block.type === 'text' && typeof block.text === 'string') {
        parts.push(block.text)
      } else if (block.type === 'thinking' && typeof block.thinking === 'string') {
        parts.push(block.thinking)
      }
    }
    return parts.join('\n')
  }

  // Fallback: try to stringify
  try {
    return String(content)
  } catch {
    return ''
  }
}

/** Format a Claude SDK message into an SSE-friendly payload */
export function formatMessageForSSE(message: any): Record<string, unknown> {
  return {
    messageType: message.type,
    content: extractContent(message),
    toolName: message.name || undefined,
    timestamp: new Date().toISOString(),
  }
}
