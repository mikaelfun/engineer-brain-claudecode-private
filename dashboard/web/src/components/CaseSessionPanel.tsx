/**
 * CaseSessionPanel — Per-case SDK session 管理面板
 *
 * 显示在 CaseDetail 页面，提供:
 *  - 当前 session 状态
 *  - Start / End 操作按钮
 *  - Session 详情 (创建时间、最近活动、resume 次数)
 *  - Session 历史列表 (可折叠)
 */
import { SessionBadge } from './SessionBadge'
import { Card, CardHeader } from './common/Card'
import {
  useCaseSessions,
  useProcessCase,
  useEndCaseSession,
  useEndAllCaseSessions,
} from '../api/hooks'

interface CaseSessionPanelProps {
  caseNumber: string
}

export default function CaseSessionPanel({ caseNumber }: CaseSessionPanelProps) {
  const { data, isLoading } = useCaseSessions(caseNumber)
  const processCase = useProcessCase()
  const endSession = useEndCaseSession()
  const endAll = useEndAllCaseSessions()

  const sessions = data?.sessions || []
  const activeSessionId = data?.activeSession
  const activeSession = sessions.find(
    (s: any) => s.sessionId === activeSessionId
  )
  const hasActiveSession = !!activeSessionId

  if (isLoading) {
    return (
      <Card>
        <div className="text-sm text-gray-400 py-2">Loading sessions...</div>
      </Card>
    )
  }

  return (
    <Card>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CardHeader title="Session" icon={<span className="text-sm">🧠</span>} />
          {hasActiveSession ? (
            <SessionBadge
              status={activeSession?.status || 'paused'}
              sessionId={activeSessionId!}
            />
          ) : (
            <span className="text-xs text-gray-400">No active session</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!hasActiveSession && (
            <button
              onClick={() =>
                processCase.mutate({ caseId: caseNumber })
              }
              disabled={processCase.isPending}
              className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {processCase.isPending ? '...' : 'Start Session'}
            </button>
          )}
          {hasActiveSession && (
            <button
              onClick={() =>
                endSession.mutate({
                  caseId: caseNumber,
                  sessionId: activeSessionId!,
                })
              }
              disabled={endSession.isPending}
              className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
            >
              End
            </button>
          )}
        </div>
      </div>

      {/* Active Session Details */}
      {activeSession && (
        <div className="text-xs text-gray-500 space-y-1.5 mb-3 p-2.5 bg-gray-50 rounded-lg">
          <DetailRow
            label="Created"
            value={new Date(activeSession.createdAt).toLocaleString()}
          />
          <DetailRow
            label="Last Activity"
            value={new Date(activeSession.lastActivityAt).toLocaleString()}
          />
          {activeSession.intent && (
            <DetailRow
              label="Intent"
              value={activeSession.intent}
              truncate
            />
          )}
        </div>
      )}

      {/* Session History */}
      {sessions.length > 1 && (
        <details className="mt-2">
          <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 select-none">
            {sessions.length} total sessions
            {sessions.length > 1 && (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  endAll.mutate(caseNumber)
                }}
                className="ml-2 text-red-400 hover:text-red-600"
              >
                (end all)
              </button>
            )}
          </summary>
          <div className="mt-2 space-y-1">
            {sessions.map((s: any) => (
              <div
                key={s.sessionId}
                className="flex items-center justify-between text-xs py-1 px-2 bg-gray-50 rounded"
              >
                <SessionBadge
                  status={s.status}
                  sessionId={s.sessionId}
                  compact
                />
                <span className="text-gray-400">
                  {new Date(s.lastActivityAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* No sessions */}
      {sessions.length === 0 && !hasActiveSession && (
        <p className="text-xs text-gray-400">
          No sessions yet. Start a session to begin casework processing.
        </p>
      )}
    </Card>
  )
}

function DetailRow({
  label,
  value,
  truncate,
}: {
  label: string
  value: string
  truncate?: boolean
}) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-gray-400 shrink-0">{label}</span>
      <span
        className={`text-gray-600 text-right ${truncate ? 'truncate max-w-[200px]' : ''}`}
      >
        {value}
      </span>
    </div>
  )
}
