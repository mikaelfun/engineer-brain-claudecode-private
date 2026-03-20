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

/** Format a Claude SDK message into an SSE-friendly payload */
export function formatMessageForSSE(message: any): Record<string, unknown> {
  return {
    messageType: message.type,
    content: message.content || message.text || message.result || '',
    toolName: message.name || undefined,
    timestamp: new Date().toISOString(),
  }
}
