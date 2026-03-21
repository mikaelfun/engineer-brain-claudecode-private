/**
 * VerifyProgressPanel — Inline verify progress display (ISS-037)
 *
 * Shows real-time test execution progress inline in the Issues page,
 * replacing the previous full-screen loading overlay + result modal.
 * Mirrors the TrackProgressPanel pattern with SSE-driven state.
 *
 * ISS-054: Added polling fallback — when isActive is true and messages exist,
 * polls verify-status every 5s to detect missed SSE completion events.
 */
import { useState, useEffect, useRef, useMemo } from 'react'
import { Loader2, Wrench, CheckCircle2, AlertCircle, XCircle, FlaskConical, ChevronDown, ChevronRight, History } from 'lucide-react'
import { useIssueTrackStore, EMPTY_VERIFY_MESSAGES, type VerifyMessage, type VerifyResult } from '../stores/issueTrackStore'
import { useVerifyStatus } from '../api/hooks'

interface VerifyProgressPanelProps {
  issueId: string
  /** Called when user clicks retry after error */
  onRetry?: () => void
}

export default function VerifyProgressPanel({ issueId, onRetry }: VerifyProgressPanelProps) {
  const messages = useIssueTrackStore((s) => s.verifyMessages[issueId] ?? EMPTY_VERIFY_MESSAGES)
  const isActive = useIssueTrackStore((s) => s.activeVerify[issueId] ?? false)
  const result = useIssueTrackStore((s) => s.verifyResult[issueId])
  const loadVerifyMessages = useIssueTrackStore((s) => s.loadVerifyMessages)
  const setVerifyResult = useIssueTrackStore((s) => s.setVerifyResult)
  const setVerifyActive = useIssueTrackStore((s) => s.setVerifyActive)
  const addVerifyMessage = useIssueTrackStore((s) => s.addVerifyMessage)
  const scrollRef = useRef<HTMLDivElement>(null)
  const hasRecoveredRef = useRef(false)
  const [collapsed, setCollapsed] = useState(false)

  // Recovery: fetch from backend when verify is active but no messages (page refresh)
  const needsRecovery = !hasRecoveredRef.current && messages.length === 0
  const { data: recoveredData } = useVerifyStatus(issueId, needsRecovery)

  useEffect(() => {
    if (recoveredData && !hasRecoveredRef.current) {
      if (recoveredData.status !== 'none') {
        hasRecoveredRef.current = true
        const mappedMessages = (recoveredData.messages || []).map((m: any) => ({
          kind: m.kind || m.type || 'thinking',
          content: m.content || '',
          toolName: m.toolName,
          timestamp: m.timestamp || new Date().toISOString(),
        })) as VerifyMessage[]
        loadVerifyMessages(issueId, mappedMessages, recoveredData.active, recoveredData.result)
      }
    }
  }, [recoveredData, issueId, loadVerifyMessages])

  // ISS-054: Polling fallback — when isActive but messages exist (SSE completion may be missed),
  // poll verify-status every 5s. If backend says completed/failed, sync frontend state.
  const needsPolling = isActive && messages.length > 0
  const { data: polledData } = useVerifyStatus(issueId, needsPolling, needsPolling ? 5000 : false)

  useEffect(() => {
    if (!polledData || !isActive) return
    if (polledData.status === 'completed' || polledData.status === 'failed') {
      // Backend is done but frontend still thinks it's active — sync state
      setVerifyActive(issueId, false)
      if (polledData.result) {
        setVerifyResult(issueId, polledData.result)
      }
      // Add completed/error message if not already present
      const hasCompletedMsg = messages.some(m => m.kind === 'completed' || m.kind === 'error')
      if (!hasCompletedMsg) {
        addVerifyMessage(issueId, {
          kind: polledData.status === 'completed' ? 'completed' : 'error',
          content: polledData.status === 'completed'
            ? (polledData.result?.overall ? 'All tests passed ✓' : 'Tests completed with failures')
            : 'Verification failed',
          timestamp: new Date().toISOString(),
        })
      }
    }
  }, [polledData, isActive, issueId, setVerifyActive, setVerifyResult, addVerifyMessage, messages])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages.length])

  // Find the completed or error message if any
  const completedMsg = messages.find(m => m.kind === 'completed')
  const errorMsg = messages.find(m => m.kind === 'error')

  // Auto-collapse when finished
  const isFinished = (!!completedMsg || !!errorMsg) && !isActive
  useEffect(() => {
    // Don't auto-collapse — verify results are important to see
  }, [isFinished])

  if (messages.length === 0) return null

  return (
    <div className="px-4 py-3" style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-inset)' }}>
      {/* Header */}
      <div className="flex items-center gap-2">
        {isActive ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: 'var(--accent-blue)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--accent-blue)' }}>Running Tests...</span>
          </>
        ) : completedMsg && result?.overall ? (
          <>
            <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--accent-green)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--accent-green)' }}>All Tests Passed</span>
          </>
        ) : completedMsg && !result?.overall ? (
          <>
            <XCircle className="w-3.5 h-3.5" style={{ color: 'var(--accent-red)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--accent-red)' }}>Tests Failed</span>
          </>
        ) : errorMsg ? (
          <>
            <AlertCircle className="w-3.5 h-3.5" style={{ color: 'var(--accent-red)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--accent-red)' }}>Verify Error</span>
          </>
        ) : (
          <>
            <FlaskConical className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Verify Progress</span>
          </>
        )}

        {/* Toggle button */}
        {messages.length > 0 && (
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto flex items-center gap-1 px-1.5 py-0.5 rounded text-xs transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
            title={collapsed ? 'Show verify log' : 'Hide verify log'}
          >
            <History className="w-3 h-3" />
            {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}
      </div>

      {/* Message stream */}
      {!collapsed && (
        <>
          <div ref={scrollRef} className="max-h-48 overflow-y-auto space-y-1 text-xs mt-2">
            <VerifyMessageList messages={messages} />
            {/* Show spinner at bottom if still active */}
            {isActive && messages.length > 0 && (
              <div className="flex items-center gap-1.5 py-0.5" style={{ color: 'var(--text-tertiary)' }}>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Processing...</span>
              </div>
            )}
          </div>

          {/* Test results summary */}
          {result && !isActive && (
            <VerifyResultSummary result={result} />
          )}

          {/* Error + retry */}
          {errorMsg && onRetry && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs" style={{ color: 'var(--accent-red)' }}>{errorMsg.content}</span>
              <button
                onClick={onRetry}
                className="px-2 py-1 text-xs rounded transition-colors"
                style={{ background: 'var(--accent-red-dim)', color: 'var(--accent-red)' }}
              >
                Retry
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

/** Test results summary panel */
function VerifyResultSummary({ result }: { result: VerifyResult }) {
  const [expandedSection, setExpandedSection] = useState<'unit' | 'ui' | null>(null)

  return (
    <div className="mt-2 space-y-1.5">
      {/* Unit test result */}
      {result.unitTest && (
        <div>
          <button
            type="button"
            onClick={() => setExpandedSection(expandedSection === 'unit' ? null : 'unit')}
            className="flex items-center gap-1.5 text-xs w-full text-left"
          >
            {expandedSection === 'unit' ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            {result.unitTest.passed ? (
              <CheckCircle2 className="w-3 h-3" style={{ color: 'var(--accent-green)' }} />
            ) : (
              <XCircle className="w-3 h-3" style={{ color: 'var(--accent-red)' }} />
            )}
            <span style={{ color: result.unitTest.passed ? 'var(--accent-green)' : 'var(--accent-red)' }}>
              Unit Tests: {result.unitTest.passed ? 'Passed' : 'Failed'}
            </span>
          </button>
          {expandedSection === 'unit' && (
            <pre
              className="mt-1 ml-5 p-2 text-xs rounded overflow-x-auto max-h-40 overflow-y-auto"
              style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
            >
              {result.unitTest.output || 'No output'}
            </pre>
          )}
        </div>
      )}

      {/* UI test result */}
      {result.uiTest && (
        <div>
          <button
            type="button"
            onClick={() => setExpandedSection(expandedSection === 'ui' ? null : 'ui')}
            className="flex items-center gap-1.5 text-xs w-full text-left"
          >
            {expandedSection === 'ui' ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            {result.uiTest.passed ? (
              <CheckCircle2 className="w-3 h-3" style={{ color: 'var(--accent-green)' }} />
            ) : (
              <XCircle className="w-3 h-3" style={{ color: 'var(--accent-red)' }} />
            )}
            <span style={{ color: result.uiTest.passed ? 'var(--accent-green)' : 'var(--accent-red)' }}>
              UI Tests: {result.uiTest.passed ? 'Passed' : 'Failed'}
            </span>
          </button>
          {expandedSection === 'ui' && (
            <pre
              className="mt-1 ml-5 p-2 text-xs rounded overflow-x-auto max-h-40 overflow-y-auto"
              style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
            >
              {result.uiTest.output || 'No output'}
            </pre>
          )}
        </div>
      )}
    </div>
  )
}

/** Renders verify messages with consecutive tool-call collapsing */
function VerifyMessageList({ messages }: { messages: VerifyMessage[] }) {
  const processed = useMemo(() => processVerifyMessages(messages), [messages])
  return (
    <>
      {processed.map((item, i) => {
        if (item.kind === 'collapsed') {
          return <CollapsedGroup key={i} group={item} />
        }
        return <VerifyMessageRow key={i} msg={item.messages[0]} />
      })}
    </>
  )
}

interface ProcessedVerifyMessage {
  kind: 'single' | 'collapsed'
  messages: VerifyMessage[]
  toolNames: string[]
  timestamp: string
}

function processVerifyMessages(messages: VerifyMessage[]): ProcessedVerifyMessage[] {
  if (!messages.length) return []
  const result: ProcessedVerifyMessage[] = []
  let i = 0
  while (i < messages.length) {
    const msg = messages[i]
    // Consecutive tool-call → collapsed
    if (msg.kind === 'tool-call') {
      const group: VerifyMessage[] = []
      const names: string[] = []
      while (i < messages.length && messages[i].kind === 'tool-call') {
        group.push(messages[i])
        const name = messages[i].toolName || 'unknown'
        if (!names.includes(name)) names.push(name)
        i++
      }
      if (group.length === 1) {
        result.push({ kind: 'single', messages: [group[0]], toolNames: [], timestamp: group[0].timestamp })
      } else {
        result.push({ kind: 'collapsed', messages: group, toolNames: names, timestamp: group[group.length - 1].timestamp })
      }
      continue
    }
    result.push({ kind: 'single', messages: [msg], toolNames: [], timestamp: msg.timestamp })
    i++
  }
  return result
}

function CollapsedGroup({ group }: { group: ProcessedVerifyMessage }) {
  const [expanded, setExpanded] = useState(false)
  const label = group.toolNames.slice(0, 3).join(', ') + (group.toolNames.length > 3 ? '...' : '')
  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 py-0.5 w-full text-left"
        style={{ color: 'var(--accent-purple)' }}
      >
        {expanded ? <ChevronDown className="w-3 h-3 shrink-0" /> : <ChevronRight className="w-3 h-3 shrink-0" />}
        <Wrench className="w-3 h-3 shrink-0" />
        <span>{label} ({group.messages.length} steps)</span>
      </button>
      {expanded && (
        <div className="ml-5 space-y-0.5" style={{ borderLeft: '2px solid var(--accent-purple-dim, var(--border-subtle))' }}>
          {group.messages.map((m, j) => (
            <div key={j} className="flex items-center gap-1.5 py-0.5 pl-2" style={{ color: 'var(--text-tertiary)' }}>
              <Wrench className="w-2.5 h-2.5 shrink-0" />
              <span>{m.toolName}: {m.content}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function VerifyMessageRow({ msg }: { msg: VerifyMessage }) {
  switch (msg.kind) {
    case 'started':
      return (
        <div className="flex items-center gap-1.5 py-0.5" style={{ color: 'var(--accent-blue)' }}>
          <FlaskConical className="w-3 h-3 shrink-0" />
          <span>{msg.content || 'Verification started'}</span>
        </div>
      )
    case 'thinking':
      return (
        <div className="flex items-start gap-1.5 py-0.5" style={{ color: 'var(--text-secondary)' }}>
          <FlaskConical className="w-3 h-3 shrink-0 mt-0.5" />
          <span className="line-clamp-2">{msg.content}</span>
        </div>
      )
    case 'tool-call':
      return (
        <div className="flex items-center gap-1.5 py-0.5" style={{ color: 'var(--accent-purple)' }}>
          <Wrench className="w-3 h-3 shrink-0" />
          <span>{msg.toolName}: {msg.content}</span>
        </div>
      )
    case 'tool-result':
      return (
        <div className="flex items-start gap-1.5 py-0.5" style={{ color: 'var(--text-secondary)' }}>
          <Wrench className="w-3 h-3 shrink-0 mt-0.5" />
          <span className="line-clamp-3 font-mono">{msg.content}</span>
        </div>
      )
    case 'completed':
      return (
        <div className="flex items-center gap-1.5 py-0.5 font-medium" style={{ color: 'var(--accent-green)' }}>
          <CheckCircle2 className="w-3 h-3 shrink-0" />
          <span>{msg.content || 'Verification completed'}</span>
        </div>
      )
    case 'error':
      return (
        <div className="flex items-center gap-1.5 py-0.5" style={{ color: 'var(--accent-red)' }}>
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>Error: {msg.content}</span>
        </div>
      )
    default:
      return null
  }
}
