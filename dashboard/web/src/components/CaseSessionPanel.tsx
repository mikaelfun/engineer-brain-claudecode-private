/**
 * CaseSessionPanel — Per-case SDK session 管理面板 (design system v2)
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
        <div className="text-sm py-2" style={{ color: 'var(--text-tertiary)' }}>Loading sessions...</div>
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
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>No active session</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!hasActiveSession && (
            <button
              onClick={() =>
                processCase.mutate({ caseId: caseNumber })
              }
              disabled={processCase.isPending}
              className="px-3 py-1 text-xs font-medium rounded-lg disabled:opacity-50 transition-colors"
              style={{ background: 'var(--accent-blue)', color: 'var(--text-inverse)' }}
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
              className="px-3 py-1 text-xs font-medium rounded-lg disabled:opacity-50 transition-colors"
              style={{ color: 'var(--accent-red)', background: 'var(--accent-red-dim)' }}
            >
              End
            </button>
          )}
        </div>
      </div>

      {/* Active Session Details */}
      {activeSession && (
        <div className="text-xs space-y-1.5 mb-3 p-2.5 rounded-lg" style={{ background: 'var(--bg-inset)' }}>
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
          <summary className="text-xs cursor-pointer select-none" style={{ color: 'var(--text-tertiary)' }}>
            {sessions.length} total sessions
            {sessions.length > 1 && (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  endAll.mutate(caseNumber)
                }}
                className="ml-2"
                style={{ color: 'var(--accent-red)' }}
              >
                (end all)
              </button>
            )}
          </summary>
          <div className="mt-2 space-y-1">
            {sessions.map((s: any) => (
              <div
                key={s.sessionId}
                className="flex items-center justify-between text-xs py-1 px-2 rounded"
                style={{ background: 'var(--bg-inset)' }}
              >
                <SessionBadge
                  status={s.status}
                  sessionId={s.sessionId}
                  compact
                />
                <span style={{ color: 'var(--text-tertiary)' }}>
                  {new Date(s.lastActivityAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* No sessions */}
      {sessions.length === 0 && !hasActiveSession && (
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
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
      <span className="shrink-0" style={{ color: 'var(--text-tertiary)' }}>{label}</span>
      <span
        className={`text-right ${truncate ? 'truncate max-w-[200px]' : ''}`}
        style={{ color: 'var(--text-secondary)' }}
      >
        {value}
      </span>
    </div>
  )
}
