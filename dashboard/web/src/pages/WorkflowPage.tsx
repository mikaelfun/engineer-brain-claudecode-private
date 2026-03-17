/**
 * WorkflowPage — 工作流管理页：触发卡片 + 实时日志流 + 历史会话列表
 *
 * Live Session 面板以时间顺序展示：
 *   iteration 分隔线 → AI thinking 气泡 → tool-call/tool-result 条目 → 最终报告
 */
import { useState, useRef, useEffect } from 'react'
import {
  useWorkflowConfigs,
  useWorkflowSessions,
  useStartWorkflow,
  useCancelWorkflow,
} from '../api/hooks'
import {
  useWorkflowStore,
  type LiveSession,
  type LogEntry,
  type LogEntryThinking,
  type LogEntryToolCall,
  type LogEntryToolResult,
  type LogEntryIteration,
} from '../stores/workflowStore'

// ============ Workflow Trigger Cards ============

function WorkflowCard({ config, onStart, disabled }: { config: any; onStart: (params: Record<string, string>) => void; disabled: boolean }) {
  const [caseNumber, setCaseNumber] = useState('')
  const [emailType, setEmailType] = useState('initial-response')

  const emailTypes = [
    { value: 'initial-response', label: 'Initial Response' },
    { value: 'request-info', label: 'Request Info' },
    { value: 'result-confirm', label: 'Result Confirm' },
    { value: 'follow-up', label: 'Follow Up' },
    { value: 'closure', label: 'Closure' },
    { value: '21v-convert-ir', label: '21V Convert IR' },
  ]

  const handleStart = () => {
    if (disabled) return
    const params: Record<string, string> = {}
    if (config.requiredParams.includes('caseNumber')) {
      if (!caseNumber.trim()) return
      params.caseNumber = caseNumber.trim()
    }
    if (config.requiredParams.includes('emailType')) {
      params.emailType = emailType
    }
    onStart(params)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{config.icon}</span>
        <h3 className="font-semibold text-gray-900">{config.name}</h3>
      </div>
      <p className="text-sm text-gray-500 mb-4 line-clamp-2">{config.description}</p>

      {config.requiredParams.includes('caseNumber') && (
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 mb-1">Case Number</label>
          <input
            type="text"
            value={caseNumber}
            onChange={(e) => setCaseNumber(e.target.value)}
            placeholder="e.g., 2603100030005863"
            className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
      )}

      {config.requiredParams.includes('emailType') && (
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 mb-1">Email Type</label>
          <select
            value={emailType}
            onChange={(e) => setEmailType(e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
          >
            {emailTypes.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      )}

      <button
        onClick={handleStart}
        disabled={disabled}
        className={`w-full mt-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2
          ${disabled
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-primary text-white hover:bg-primary/90'}`}
      >
        <span>▶</span> Start
      </button>
    </div>
  )
}

// ============ Log Stream Entries ============

function IterationDivider({ entry }: { entry: LogEntryIteration }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex-1 border-t border-gray-200" />
      <span className="text-xs font-medium text-gray-400 flex-shrink-0">
        Iteration {entry.iteration} / {entry.maxIterations}
      </span>
      <div className="flex-1 border-t border-gray-200" />
    </div>
  )
}

function ThinkingBubble({ entry }: { entry: LogEntryThinking }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = entry.content.length > 200

  return (
    <div className="my-2 ml-2 pl-3 border-l-2 border-purple-200">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-xs">🧠</span>
        <span className="text-xs font-medium text-purple-600">AI Thinking</span>
      </div>
      <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
        {isLong && !expanded
          ? entry.content.slice(0, 200) + '...'
          : entry.content}
      </div>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-purple-500 hover:text-purple-700 mt-1"
        >
          {expanded ? '收起' : '展开全部'}
        </button>
      )}
    </div>
  )
}

function ToolCallEntry({ entry, result }: { entry: LogEntryToolCall; result?: LogEntryToolResult }) {
  const [expanded, setExpanded] = useState(false)
  const argsStr = Object.entries(entry.args)
    .map(([, v]) => v)
    .join(', ')

  const isRunning = !result
  const isSuccess = result?.success === true
  const icon = isRunning ? '⏳' : isSuccess ? '✅' : '❌'

  const outputText = result?.output || ''
  const isLongOutput = outputText.length > 120

  return (
    <div className="my-1.5 ml-2 pl-3 border-l-2 border-blue-100">
      <div className="flex items-start gap-2">
        <span className="flex-shrink-0 text-sm mt-0.5">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-mono text-xs font-medium text-gray-800">{entry.toolName}</span>
            {argsStr && (
              <span className="text-gray-400 text-xs">({argsStr})</span>
            )}
            {isRunning && (
              <span className="text-blue-500 text-xs animate-pulse">running...</span>
            )}
            {result?.durationMs !== undefined && (
              <span className="text-gray-400 text-xs ml-auto flex-shrink-0">
                {result.durationMs < 1000
                  ? `${result.durationMs}ms`
                  : `${(result.durationMs / 1000).toFixed(1)}s`}
              </span>
            )}
          </div>

          {/* Output */}
          {result && outputText && (
            <div className="mt-1">
              <div
                className={`text-xs font-mono p-2 rounded-md whitespace-pre-wrap break-all leading-relaxed
                  ${isSuccess ? 'bg-gray-50 text-gray-600' : 'bg-red-50 text-red-700'}`}
              >
                {isLongOutput && !expanded
                  ? outputText.slice(0, 120) + '...'
                  : outputText}
              </div>
              {isLongOutput && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-xs text-blue-500 hover:text-blue-700 mt-0.5"
                >
                  {expanded ? '收起' : `展开全部 (${outputText.length} 字符)`}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============ Live Session Panel ============

function LiveSessionPanel({ session, onCancel }: { session: LiveSession; onCancel: () => void }) {
  const logEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new entries arrive
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [session.logStream.length, session.status])

  const isRunning = session.status === 'running'
  const statusConfig = {
    running: { label: 'Running', color: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500' },
    completed: { label: 'Completed', color: 'bg-green-50 text-green-700', dot: 'bg-green-500' },
    failed: { label: 'Failed', color: 'bg-red-50 text-red-700', dot: 'bg-red-500' },
    cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-500', dot: 'bg-gray-400' },
  }[session.status]

  // Build a tool-result lookup by callId for pairing
  const toolResultMap = new Map<string, LogEntryToolResult>()
  for (const entry of session.logStream) {
    if (entry.kind === 'tool-result') {
      toolResultMap.set(entry.callId, entry)
    }
  }

  // Render log stream — skip tool-result entries (they render inline with tool-call)
  const renderEntry = (entry: LogEntry, idx: number) => {
    switch (entry.kind) {
      case 'iteration':
        return <IterationDivider key={`iter-${idx}`} entry={entry} />
      case 'thinking':
        return <ThinkingBubble key={`think-${idx}`} entry={entry} />
      case 'tool-call':
        return (
          <ToolCallEntry
            key={`tc-${idx}`}
            entry={entry}
            result={toolResultMap.get(entry.callId)}
          />
        )
      case 'tool-result':
        // Rendered inline with tool-call, skip standalone
        return null
      default:
        return null
    }
  }

  // Calculate elapsed time
  const elapsed = session.logStream.length > 0
    ? Math.round((Date.now() - session.logStream[0].ts) / 1000)
    : 0
  const elapsedStr = elapsed < 60 ? `${elapsed}s` : `${Math.floor(elapsed / 60)}m ${elapsed % 60}s`

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-5 py-3 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-gray-900">{session.workflowName}</h3>
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full ${statusConfig.color}`}>
            {isRunning && <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${statusConfig.dot}`} />}
            {statusConfig.label}
          </span>
          {session.maxIterations > 0 && (
            <span className="text-xs text-gray-400">
              iter {session.iteration}/{session.maxIterations}
            </span>
          )}
          <span className="text-xs text-gray-400">{elapsedStr}</span>
          <span className="text-xs text-gray-400">{session.toolCalls.length} tools</span>
        </div>
        {isRunning && (
          <button
            onClick={onCancel}
            className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Log Stream */}
      <div className="px-4 md:px-5 py-3 max-h-[500px] overflow-y-auto">
        {session.logStream.length === 0 && isRunning && (
          <p className="text-sm text-gray-400 py-4 text-center animate-pulse">
            Initializing workflow...
          </p>
        )}

        {session.logStream.map((entry, idx) => renderEntry(entry, idx))}

        {/* Waiting indicator at the bottom during running */}
        {isRunning && session.logStream.length > 0 && (
          <div className="flex items-center gap-2 py-2 mt-1">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            <span className="text-xs text-gray-400 animate-pulse">Waiting for AI response...</span>
          </div>
        )}

        <div ref={logEndRef} />
      </div>

      {/* Final Result / Error */}
      {session.status === 'completed' && (session.resultFull || session.resultPreview) && (
        <FinalReport content={session.resultFull || session.resultPreview || ''} />
      )}
      {session.status === 'failed' && session.error && (
        <div className="mx-4 md:mx-5 mb-4 p-4 bg-red-50 rounded-lg border border-red-100">
          <p className="text-xs font-semibold text-red-700 mb-1">Error</p>
          <p className="text-sm text-red-800 whitespace-pre-wrap">{session.error}</p>
        </div>
      )}
      {session.status === 'cancelled' && (
        <div className="mx-4 md:mx-5 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500 text-center">Workflow was cancelled</p>
        </div>
      )}
    </div>
  )
}

// ============ Final Report with basic markdown rendering ============

function FinalReport({ content }: { content: string }) {
  const [collapsed, setCollapsed] = useState(false)

  // Simple markdown → HTML: headings, bold, code blocks, lists
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n')
    const htmlParts: string[] = []
    let inCodeBlock = false

    for (const line of lines) {
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          htmlParts.push('</code></pre>')
          inCodeBlock = false
        } else {
          htmlParts.push('<pre class="bg-gray-100 rounded p-2 text-xs overflow-x-auto my-1"><code>')
          inCodeBlock = true
        }
        continue
      }
      if (inCodeBlock) {
        htmlParts.push(escapeHtml(line) + '\n')
        continue
      }

      let processed = line
      // Headings
      if (processed.startsWith('#### ')) {
        processed = `<h4 class="font-semibold text-sm text-gray-800 mt-3 mb-1">${escapeHtml(processed.slice(5))}</h4>`
      } else if (processed.startsWith('### ')) {
        processed = `<h3 class="font-semibold text-sm text-gray-800 mt-3 mb-1">${escapeHtml(processed.slice(4))}</h3>`
      } else if (processed.startsWith('## ')) {
        processed = `<h2 class="font-semibold text-base text-gray-900 mt-4 mb-1">${escapeHtml(processed.slice(3))}</h2>`
      } else if (processed.startsWith('# ')) {
        processed = `<h1 class="font-bold text-lg text-gray-900 mt-4 mb-2">${escapeHtml(processed.slice(2))}</h1>`
      } else if (processed.startsWith('- ') || processed.startsWith('* ')) {
        processed = `<li class="ml-4 text-sm text-gray-700 list-disc">${inlineMd(processed.slice(2))}</li>`
      } else if (/^\d+\.\s/.test(processed)) {
        processed = `<li class="ml-4 text-sm text-gray-700 list-decimal">${inlineMd(processed.replace(/^\d+\.\s/, ''))}</li>`
      } else if (processed.trim() === '') {
        processed = '<br/>'
      } else {
        processed = `<p class="text-sm text-gray-700 leading-relaxed">${inlineMd(processed)}</p>`
      }
      htmlParts.push(processed)
    }
    if (inCodeBlock) htmlParts.push('</code></pre>')
    return htmlParts.join('\n')
  }

  const escapeHtml = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const inlineMd = (s: string) => {
    let out = escapeHtml(s)
    // Bold **text**
    out = out.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    // Inline code `text`
    out = out.replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">$1</code>')
    return out
  }

  return (
    <div className="mx-4 md:mx-5 mb-4">
      <div
        className="flex items-center justify-between cursor-pointer py-2"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">📋</span>
          <span className="text-sm font-semibold text-green-700">Final Report</span>
        </div>
        <span className="text-xs text-gray-400">{collapsed ? '▶ 展开' : '▼ 收起'}</span>
      </div>
      {!collapsed && (
        <div
          className="p-4 bg-green-50/50 rounded-lg border border-green-100 overflow-x-auto"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
        />
      )}
    </div>
  )
}

// ============ Recent Sessions ============

function SessionRow({ session }: { session: any }) {
  const statusConfig: Record<string, { icon: string; color: string }> = {
    running: { icon: '🔵', color: 'text-blue-600' },
    completed: { icon: '🟢', color: 'text-green-600' },
    failed: { icon: '🔴', color: 'text-red-600' },
    cancelled: { icon: '⚪', color: 'text-gray-500' },
  }

  const status = statusConfig[session.status] || statusConfig.cancelled

  const startedAt = new Date(session.startedAt)
  const dateStr = startedAt.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
  const timeStr = startedAt.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })

  let duration = ''
  if (session.completedAt) {
    const ms = new Date(session.completedAt).getTime() - startedAt.getTime()
    if (ms < 60000) duration = `${Math.round(ms / 1000)}s`
    else duration = `${Math.round(ms / 60000)}m`
  }

  return (
    <div className="flex items-center gap-3 py-2.5 px-3 hover:bg-gray-50 rounded-lg transition-colors">
      <span>{status.icon}</span>
      <span className="font-medium text-sm text-gray-800 w-24 flex-shrink-0">{session.workflowName}</span>
      <span className="text-xs text-gray-400 w-24 flex-shrink-0">{dateStr} {timeStr}</span>
      <span className={`text-xs font-medium w-20 flex-shrink-0 ${status.color}`}>{session.status}</span>
      {duration && <span className="text-xs text-gray-400">{duration}</span>}
      {session.toolCallCount > 0 && (
        <span className="text-xs text-gray-400 ml-auto">{session.toolCallCount} tools</span>
      )}
    </div>
  )
}

function RecentSessions() {
  const { data, isLoading } = useWorkflowSessions(10)

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-3">Recent Sessions</h3>
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    )
  }

  const sessions = data?.sessions || []

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5">
      <h3 className="font-semibold text-gray-900 mb-3">Recent Sessions</h3>
      {sessions.length === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center">No workflow sessions yet</p>
      ) : (
        <div className="divide-y divide-gray-50">
          {sessions.map((s: any) => (
            <SessionRow key={s.id} session={s} />
          ))}
        </div>
      )}
    </div>
  )
}

// ============ Main Page ============

export default function WorkflowPage() {
  const { data: configData, isLoading: configLoading } = useWorkflowConfigs()
  const startWorkflow = useStartWorkflow()
  const cancelWorkflow = useCancelWorkflow()
  const liveSession = useWorkflowStore((s) => s.liveSession)

  const configs = configData?.configs || []

  const isSessionActive = liveSession?.status === 'running'

  const handleStart = (workflowId: string, params: Record<string, string>) => {
    startWorkflow.mutate(
      { workflowId, params },
      {
        onError: (err: any) => {
          const msg = err?.message || 'Failed to start workflow'
          alert(msg)
        },
      }
    )
  }

  const handleCancel = () => {
    if (liveSession?.sessionId) {
      cancelWorkflow.mutate(liveSession.sessionId)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span>🔄</span> Workflows
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          AI-powered D365 automation workflows
        </p>
      </div>

      {/* Workflow Cards */}
      {configLoading ? (
        <div className="text-sm text-gray-400">Loading workflows...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {configs.map((cfg: any) => (
            <WorkflowCard
              key={cfg.id}
              config={cfg}
              disabled={!!isSessionActive}
              onStart={(params) => handleStart(cfg.id, params)}
            />
          ))}
        </div>
      )}

      {/* Live Session */}
      {liveSession && (
        <LiveSessionPanel session={liveSession} onCancel={handleCancel} />
      )}

      {/* Recent Sessions */}
      <RecentSessions />
    </div>
  )
}
