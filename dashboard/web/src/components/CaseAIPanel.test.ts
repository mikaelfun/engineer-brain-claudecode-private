/**
 * processMessages unit tests
 *
 * Tests the message collapsing logic that converts raw SSE messages
 * into display-friendly groups for the CaseAIPanel.
 */
import { describe, it, expect } from 'vitest'
import { processMessages, type DisplayMessage } from './session/SessionMessageList'
import type { CaseSessionMessage } from '../stores/caseSessionStore'

const ts = '2026-03-21T10:00:00Z'

function msg(type: CaseSessionMessage['type'], content = '', toolName?: string, step?: string): CaseSessionMessage {
  return { type, content, toolName, step, timestamp: ts }
}

describe('processMessages', () => {
  it('returns empty array for empty input', () => {
    expect(processMessages([])).toEqual([])
  })

  it('passes through single system message', () => {
    const result = processMessages([msg('system', 'Step started')])
    expect(result).toHaveLength(1)
    expect(result[0].kind).toBe('single')
    expect(result[0].messages[0].type).toBe('system')
  })

  it('passes through single completed message', () => {
    const result = processMessages([msg('completed', 'Done')])
    expect(result).toHaveLength(1)
    expect(result[0].kind).toBe('single')
  })

  it('passes through single failed message', () => {
    const result = processMessages([msg('failed', 'Error!')])
    expect(result).toHaveLength(1)
    expect(result[0].kind).toBe('single')
  })

  it('passes through single user message', () => {
    const result = processMessages([msg('user', 'Hello')])
    expect(result).toHaveLength(1)
    expect(result[0].kind).toBe('single')
  })

  it('collapses consecutive tool-call messages into one group', () => {
    const messages = [
      msg('tool-call', 'param1', 'Bash'),
      msg('tool-call', 'param2', 'Read'),
      msg('tool-call', 'param3', 'Grep'),
    ]
    const result = processMessages(messages)
    expect(result).toHaveLength(1)
    expect(result[0].kind).toBe('collapsed-tools')
    expect(result[0].messages).toHaveLength(3)
    expect(result[0].toolNames).toEqual(['Bash', 'Read', 'Grep'])
  })

  it('collapses mixed tool-call and tool-result into one group', () => {
    const messages = [
      msg('tool-call', 'running', 'Bash'),
      msg('tool-result', 'output', 'Bash'),
      msg('tool-call', 'running', 'Read'),
      msg('tool-result', 'content', 'Read'),
    ]
    const result = processMessages(messages)
    expect(result).toHaveLength(1)
    expect(result[0].kind).toBe('collapsed-tools')
    expect(result[0].messages).toHaveLength(4)
    expect(result[0].toolNames).toEqual(['Bash', 'Read'])
  })

  it('collapses consecutive thinking into one group', () => {
    const messages = [
      msg('thinking', 'I need to analyze...'),
      msg('thinking', 'Looking at the code...'),
      msg('thinking', 'Found the issue...'),
    ]
    const result = processMessages(messages)
    expect(result).toHaveLength(1)
    expect(result[0].kind).toBe('collapsed-thinking')
    expect(result[0].messages).toHaveLength(3)
  })

  it('preserves system message between tool groups', () => {
    const messages = [
      msg('tool-call', '', 'Bash'),
      msg('tool-result', '', 'Bash'),
      msg('system', 'Step "data-refresh" started'),
      msg('tool-call', '', 'Read'),
      msg('tool-result', '', 'Read'),
    ]
    const result = processMessages(messages)
    expect(result).toHaveLength(3)
    expect(result[0].kind).toBe('collapsed-tools')
    expect(result[1].kind).toBe('single')
    expect(result[1].messages[0].type).toBe('system')
    expect(result[2].kind).toBe('collapsed-tools')
  })

  it('handles mixed flow: thinking → tools → system → completed', () => {
    const messages = [
      msg('thinking', 'Let me think...'),
      msg('thinking', 'Analyzing...'),
      msg('tool-call', '', 'Bash'),
      msg('tool-result', '', 'Bash'),
      msg('tool-call', '', 'Read'),
      msg('tool-result', '', 'Read'),
      msg('system', 'Step done'),
      msg('completed', 'All done'),
    ]
    const result = processMessages(messages)
    expect(result).toHaveLength(4)
    expect(result[0].kind).toBe('collapsed-thinking')
    expect(result[1].kind).toBe('collapsed-tools')
    expect(result[2].kind).toBe('single') // system
    expect(result[3].kind).toBe('single') // completed
  })

  it('does not collapse a single tool-call (still wraps in group)', () => {
    const result = processMessages([msg('tool-call', 'params', 'Bash')])
    expect(result).toHaveLength(1)
    expect(result[0].kind).toBe('collapsed-tools')
    expect(result[0].messages).toHaveLength(1)
  })

  it('deduplicates tool names in group', () => {
    const messages = [
      msg('tool-call', '', 'Bash'),
      msg('tool-result', '', 'Bash'),
      msg('tool-call', '', 'Bash'),
      msg('tool-result', '', 'Bash'),
    ]
    const result = processMessages(messages)
    expect(result[0].toolNames).toEqual(['Bash'])
  })

  it('preserves step from last message in group', () => {
    const messages = [
      msg('tool-call', '', 'Bash', 'data-refresh'),
      msg('tool-result', '', 'Bash', 'data-refresh'),
      msg('tool-call', '', 'Read', 'compliance-check'),
    ]
    const result = processMessages(messages)
    expect(result[0].step).toBe('compliance-check')
  })

  it('handles user message between tool groups', () => {
    const messages = [
      msg('tool-call', '', 'Bash'),
      msg('tool-result', '', 'Bash'),
      msg('user', 'Can you explain?'),
      msg('thinking', 'Sure, let me explain...'),
      msg('tool-call', '', 'Read'),
    ]
    const result = processMessages(messages)
    expect(result).toHaveLength(4)
    expect(result[0].kind).toBe('collapsed-tools')
    expect(result[1].kind).toBe('single') // user
    expect(result[2].kind).toBe('collapsed-thinking')
    expect(result[3].kind).toBe('collapsed-tools')
  })

  it('handles tool messages without toolName', () => {
    const messages = [
      msg('tool-call', 'some content'),
      msg('tool-result', 'some result'),
    ]
    const result = processMessages(messages)
    expect(result).toHaveLength(1)
    expect(result[0].toolNames).toEqual([])
  })

  it('passes through queued message as single item', () => {
    const result = processMessages([msg('queued', 'My queued question')])
    expect(result).toHaveLength(1)
    expect(result[0].kind).toBe('single')
    expect(result[0].messages[0].type).toBe('queued')
    expect(result[0].messages[0].content).toBe('My queued question')
  })

  it('preserves queued messages between tool groups', () => {
    const messages = [
      msg('tool-call', '', 'Bash'),
      msg('tool-result', 'output', 'Bash'),
      msg('queued', 'Question while busy'),
      msg('tool-call', '', 'Read'),
    ]
    const result = processMessages(messages)
    expect(result).toHaveLength(3)
    expect(result[0].kind).toBe('collapsed-tools')
    expect(result[1].kind).toBe('single')
    expect(result[1].messages[0].type).toBe('queued')
    expect(result[2].kind).toBe('collapsed-tools')
  })

  it('shows multiple queued messages as separate items', () => {
    const messages = [
      msg('queued', 'First question'),
      msg('queued', 'Second question'),
    ]
    const result = processMessages(messages)
    expect(result).toHaveLength(2)
    expect(result[0].kind).toBe('single')
    expect(result[1].kind).toBe('single')
    expect(result[0].messages[0].content).toBe('First question')
    expect(result[1].messages[0].content).toBe('Second question')
  })

  it('passes through response message as single item (never collapsed)', () => {
    const result = processMessages([msg('response', 'Here is the answer')])
    expect(result).toHaveLength(1)
    expect(result[0].kind).toBe('single')
    expect(result[0].messages[0].type).toBe('response')
  })

  it('does not collapse response with adjacent thinking', () => {
    const messages = [
      msg('thinking', 'Let me reason...'),
      msg('thinking', 'Analyzing...'),
      msg('response', 'The answer is 42'),
      msg('thinking', 'More reasoning...'),
    ]
    const result = processMessages(messages)
    expect(result).toHaveLength(3)
    expect(result[0].kind).toBe('collapsed-thinking')
    expect(result[0].messages).toHaveLength(2)
    expect(result[1].kind).toBe('single')
    expect(result[1].messages[0].type).toBe('response')
    expect(result[2].kind).toBe('collapsed-thinking')
    expect(result[2].messages).toHaveLength(1)
  })
})
