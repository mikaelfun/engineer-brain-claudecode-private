/**
 * TrackProgressPanel unit tests
 *
 * Tests the message collapsing logic (processTrackMessages) and
 * context extraction logic (extractContextContent) for TrackProgressPanel.
 */
import { describe, it, expect } from 'vitest'
import { processTrackMessages, extractContextContent, type TrackDisplayMessage } from './TrackProgressPanel'
import type { IssueTrackMessage } from '../stores/issueTrackStore'

const ts = '2026-03-21T21:00:00Z'

function msg(kind: IssueTrackMessage['kind'], opts: Partial<Omit<IssueTrackMessage, 'kind' | 'timestamp'>> = {}): IssueTrackMessage {
  return { kind, timestamp: ts, ...opts }
}

describe('processTrackMessages', () => {
  it('returns empty array for empty input', () => {
    expect(processTrackMessages([])).toEqual([])
  })

  it('passes through single started message', () => {
    const result = processTrackMessages([msg('started', { content: 'Track creation started' })])
    expect(result).toHaveLength(1)
    expect(result[0].kind).toBe('single')
    expect(result[0].messages[0].kind).toBe('started')
  })

  it('passes through single completed message', () => {
    const result = processTrackMessages([msg('completed', { trackId: 'test_20260321' })])
    expect(result).toHaveLength(1)
    expect(result[0].kind).toBe('single')
  })

  it('passes through single error message', () => {
    const result = processTrackMessages([msg('error', { error: 'Something failed' })])
    expect(result).toHaveLength(1)
    expect(result[0].kind).toBe('single')
  })

  it('passes through single question message', () => {
    const result = processTrackMessages([msg('question', { content: 'Choose an option' })])
    expect(result).toHaveLength(1)
    expect(result[0].kind).toBe('single')
  })

  it('passes through single thinking message as single', () => {
    const result = processTrackMessages([msg('thinking', { content: 'Analyzing...' })])
    expect(result).toHaveLength(1)
    expect(result[0].kind).toBe('single')
  })

  it('passes through single tool-call message as single', () => {
    const result = processTrackMessages([msg('tool-call', { toolName: 'Read' })])
    expect(result).toHaveLength(1)
    expect(result[0].kind).toBe('single')
  })

  it('collapses consecutive tool-call messages into one group', () => {
    const messages = [
      msg('tool-call', { toolName: 'Read' }),
      msg('tool-call', { toolName: 'Write' }),
      msg('tool-call', { toolName: 'Bash' }),
    ]
    const result = processTrackMessages(messages)
    expect(result).toHaveLength(1)
    expect(result[0].kind).toBe('collapsed-tools')
    expect(result[0].messages).toHaveLength(3)
    expect(result[0].toolNames).toEqual(['Read', 'Write', 'Bash'])
  })

  it('collapses consecutive thinking messages into one group', () => {
    const messages = [
      msg('thinking', { content: 'Step 1...' }),
      msg('thinking', { content: 'Step 2...' }),
      msg('thinking', { content: 'Step 3...' }),
    ]
    const result = processTrackMessages(messages)
    expect(result).toHaveLength(1)
    expect(result[0].kind).toBe('collapsed-thinking')
    expect(result[0].messages).toHaveLength(3)
  })

  it('deduplicates tool names in collapsed group', () => {
    const messages = [
      msg('tool-call', { toolName: 'Read' }),
      msg('tool-call', { toolName: 'Read' }),
      msg('tool-call', { toolName: 'Write' }),
      msg('tool-call', { toolName: 'Read' }),
    ]
    const result = processTrackMessages(messages)
    expect(result).toHaveLength(1)
    expect(result[0].toolNames).toEqual(['Read', 'Write'])
  })

  it('preserves started message between tool groups', () => {
    const messages = [
      msg('tool-call', { toolName: 'Read' }),
      msg('tool-call', { toolName: 'Write' }),
      msg('started', { content: 'Starting new phase' }),
      msg('tool-call', { toolName: 'Bash' }),
      msg('tool-call', { toolName: 'Grep' }),
    ]
    const result = processTrackMessages(messages)
    expect(result).toHaveLength(3)
    expect(result[0].kind).toBe('collapsed-tools')
    expect(result[0].toolNames).toEqual(['Read', 'Write'])
    expect(result[1].kind).toBe('single')
    expect(result[1].messages[0].kind).toBe('started')
    expect(result[2].kind).toBe('collapsed-tools')
    expect(result[2].toolNames).toEqual(['Bash', 'Grep'])
  })

  it('handles mixed flow: started → thinking → tools → completed', () => {
    const messages = [
      msg('started', { content: 'Track creation started' }),
      msg('thinking', { content: 'Analyzing...' }),
      msg('thinking', { content: 'Planning...' }),
      msg('tool-call', { toolName: 'Read' }),
      msg('tool-call', { toolName: 'Write' }),
      msg('tool-call', { toolName: 'Bash' }),
      msg('completed', { trackId: 'test_20260321' }),
    ]
    const result = processTrackMessages(messages)
    expect(result).toHaveLength(4)
    expect(result[0].kind).toBe('single')     // started
    expect(result[1].kind).toBe('collapsed-thinking')
    expect(result[2].kind).toBe('collapsed-tools')
    expect(result[3].kind).toBe('single')     // completed
  })

  it('handles question between tool groups', () => {
    const messages = [
      msg('tool-call', { toolName: 'Read' }),
      msg('tool-call', { toolName: 'Write' }),
      msg('question', { content: 'Which approach?' }),
      msg('tool-call', { toolName: 'Bash' }),
    ]
    const result = processTrackMessages(messages)
    expect(result).toHaveLength(3)
    expect(result[0].kind).toBe('collapsed-tools')
    expect(result[1].kind).toBe('single')     // question
    expect(result[2].kind).toBe('single')     // single tool-call
  })

  it('handles tool-call messages without toolName', () => {
    const messages = [
      msg('tool-call'),
      msg('tool-call'),
    ]
    const result = processTrackMessages(messages)
    expect(result).toHaveLength(1)
    expect(result[0].kind).toBe('collapsed-tools')
    expect(result[0].toolNames).toEqual(['unknown'])
  })

  it('uses timestamp from last message in collapsed group', () => {
    const messages: IssueTrackMessage[] = [
      { kind: 'tool-call', toolName: 'Read', timestamp: '2026-03-21T10:00:00Z' },
      { kind: 'tool-call', toolName: 'Write', timestamp: '2026-03-21T10:01:00Z' },
      { kind: 'tool-call', toolName: 'Bash', timestamp: '2026-03-21T10:02:00Z' },
    ]
    const result = processTrackMessages(messages)
    expect(result[0].timestamp).toBe('2026-03-21T10:02:00Z')
  })

  it('handles alternating tool-call and thinking', () => {
    const messages = [
      msg('tool-call', { toolName: 'Read' }),
      msg('thinking', { content: 'Hmm...' }),
      msg('tool-call', { toolName: 'Write' }),
    ]
    const result = processTrackMessages(messages)
    expect(result).toHaveLength(3)
    expect(result[0].kind).toBe('single')     // single tool-call
    expect(result[1].kind).toBe('single')     // single thinking
    expect(result[2].kind).toBe('single')     // single tool-call
  })

  it('error message is never collapsed', () => {
    const messages = [
      msg('error', { error: 'Fail 1' }),
      msg('error', { error: 'Fail 2' }),
    ]
    const result = processTrackMessages(messages)
    expect(result).toHaveLength(2)
    expect(result[0].kind).toBe('single')
    expect(result[1].kind).toBe('single')
  })
})

describe('extractContextContent', () => {
  it('returns empty string for empty messages', () => {
    expect(extractContextContent([])).toBe('')
  })

  it('extracts thinking content from simple thinking → question sequence', () => {
    const messages: IssueTrackMessage[] = [
      msg('thinking', { content: 'Here is the spec...' }),
      msg('question', { content: 'Is this correct?' }),
    ]
    expect(extractContextContent(messages)).toBe('Here is the spec...')
  })

  it('ISS-072: extracts thinking content across tool-call gap (thinking → tool-call → question)', () => {
    const messages: IssueTrackMessage[] = [
      msg('started', { content: 'Track creation started' }),
      msg('thinking', { content: 'Pre-flight checks passed. Here is the specification...' }),
      msg('tool-call', { toolName: 'AskUserQuestion' }),
      msg('question', { content: 'Is this specification correct?' }),
    ]
    expect(extractContextContent(messages)).toBe('Pre-flight checks passed. Here is the specification...')
  })

  it('ISS-072: extracts multiple thinking messages across tool-call gap', () => {
    const messages: IssueTrackMessage[] = [
      msg('started', { content: 'Started' }),
      msg('thinking', { content: 'Part 1 of spec' }),
      msg('thinking', { content: 'Part 2 of spec' }),
      msg('tool-call', { toolName: 'AskUserQuestion' }),
      msg('question', { content: 'Is this correct?' }),
    ]
    expect(extractContextContent(messages)).toBe('Part 1 of spec\n\nPart 2 of spec')
  })

  it('stops at non-thinking, non-question, non-tool-call message', () => {
    const messages: IssueTrackMessage[] = [
      msg('thinking', { content: 'Earlier thinking' }),
      msg('started', { content: 'Something else' }),
      msg('thinking', { content: 'Recent thinking' }),
      msg('question', { content: 'Question' }),
    ]
    // Should only get 'Recent thinking' — stops at 'started'
    expect(extractContextContent(messages)).toBe('Recent thinking')
  })

  it('handles multiple tool-call messages between thinking and question', () => {
    const messages: IssueTrackMessage[] = [
      msg('thinking', { content: 'Spec content' }),
      msg('tool-call', { toolName: 'Read' }),
      msg('tool-call', { toolName: 'AskUserQuestion' }),
      msg('question', { content: 'Confirm?' }),
    ]
    expect(extractContextContent(messages)).toBe('Spec content')
  })

  it('returns empty when no thinking messages precede question', () => {
    const messages: IssueTrackMessage[] = [
      msg('started', { content: 'Started' }),
      msg('tool-call', { toolName: 'Read' }),
      msg('question', { content: 'Question?' }),
    ]
    expect(extractContextContent(messages)).toBe('')
  })

  it('treats thinking with empty content as a stop boundary', () => {
    const messages: IssueTrackMessage[] = [
      msg('thinking', { content: 'Valid content' }),
      msg('thinking', { content: '' }),
      msg('question', { content: 'Question?' }),
    ]
    // Empty-content thinking fails the `m.content` check → falls to break
    // Only content after the break boundary is collected
    expect(extractContextContent(messages)).toBe('')
  })
})
