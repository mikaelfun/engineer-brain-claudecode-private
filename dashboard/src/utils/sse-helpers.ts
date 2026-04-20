/**
 * sse-helpers.ts — Shared SSE message formatting utilities
 *
 * Used by case-routes.ts, steps.ts, case-session-manager.ts,
 * cron-manager.ts, and patrol-orchestrator.ts
 * to convert Claude SDK messages into SSE event payloads.
 */

// ---- Shared assistant content block parser ----

/**
 * Parsed content block from an SDK assistant message.
 *
 * Single entry point for classifying SDK content blocks:
 * - text blocks → 'response' (actual model output)
 * - thinking blocks → 'thinking' (extended reasoning)
 * - tool_use blocks → 'tool-call' (tool invocation)
 *
 * All consumers (case sessions, cron, patrol) MUST use this parser
 * instead of duplicating classification logic.
 */
export interface ParsedContentBlock {
  kind: 'response' | 'thinking' | 'tool-call'
  content: string
  toolName?: string
  toolInput?: any
}

/**
 * Parse an SDK assistant message's content blocks into typed events.
 *
 * @param contentBlocks - Array of content blocks from message.message.content
 * @param maxContentLen - Max length to slice content (default 800)
 * @returns Array of parsed blocks
 */
export function parseAssistantBlocks(
  contentBlocks: any[],
): ParsedContentBlock[] {
  const results: ParsedContentBlock[] = []

  for (const block of contentBlocks) {
    if (block.type === 'tool_use') {
      results.push({
        kind: 'tool-call',
        content: '', // callers use toolInput to summarize
        toolName: block.name,
        toolInput: block.input,
      })
    } else if (block.type === 'text' && block.text) {
      results.push({
        kind: 'response',
        content: block.text,
      })
    } else if (block.type === 'thinking' && block.thinking) {
      results.push({
        kind: 'thinking',
        content: block.thinking,
      })
    }
  }

  return results
}

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
