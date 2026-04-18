/**
 * CaseDetail — Case 详情页 (多 tab)
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Circle, AlertTriangle, FolderOpen, Clock, RefreshCw, ChevronDown, ChevronRight, Copy, Check, Pencil, X, Save } from 'lucide-react'
import { Tabs } from '../components/common/Tabs'
import { Card, CardHeader } from '../components/common/Card'
import { SeverityBadge, CaseStatusBadge, SlaBadge, Badge, HealthScoreBadge, EntitlementWarningBanner, RdseBadge } from '../components/common/Badge'
import { Loading, ErrorState, EmptyState } from '../components/common/Loading'
import {
  useCaseDetail, useCaseEmails, useCaseNotes, useCaseLaborRecords,
  useRefreshNotes, useRefreshLaborRecords,
  useCaseTeams, useCaseMeta, useCaseAnalysis, useCaseOnenote,
  useCaseDrafts, useCaseInspection, useCaseTodo, useCaseTodoFile,
  useCaseTiming, useCaseLogs, useCaseAttachments,
  useToggleCaseTodo, useCaseClaims
} from '../api/hooks'
import MarkdownContent from '../components/common/MarkdownContent'
import CaseAIPanel from '../components/CaseAIPanel'
import CaseSummaryRenderer from '../components/case/CaseSummaryRenderer'
import { LaborEstimateCard } from '../components/LaborEstimateCard'
import { NoteGapCard } from '../components/NoteGapCard'
import EvidenceChainTab from '../components/EvidenceChainTab'

export default function CaseDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const searchParams = new URLSearchParams(window.location.search)
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'summary')

  const { data: caseInfo, isLoading, error } = useCaseDetail(id || '')
  // Always-fetch: key tab data for badge counts (lightweight — only returns arrays)
  const { data: emailsData } = useCaseEmails(id || '')
  const { data: notesData } = useCaseNotes(id || '')
  const { data: laborRecordsData } = useCaseLaborRecords(id || '')
  const { data: todoData } = useCaseTodo(id || '')
  const { data: draftsData } = useCaseDrafts(id || '')
  const { data: logsData } = useCaseLogs(id || '')
  const { data: attachmentsData } = useCaseAttachments(id || '')
  // Lazy-load: only fetch heavier tab data when its tab is active
  const { data: teamsData } = useCaseTeams(activeTab === 'teams' ? (id || '') : '')
  const { data: meta } = useCaseMeta(id || '') // always needed for SLA indicators
  const { data: analysisData } = useCaseAnalysis(activeTab === 'analysis' ? (id || '') : '')
  const { data: onenoteData } = useCaseOnenote(activeTab === 'onenote' ? (id || '') : '')
  const { data: inspectionData } = useCaseInspection(id || '')
  const toggleCaseTodo = useToggleCaseTodo(id || '')
  const { data: timingData } = useCaseTiming(activeTab === 'timing' ? (id || '') : '')
  const { data: claimsData } = useCaseClaims(id || '')

  if (isLoading) return <Loading text="Loading case..." />
  if (error || !caseInfo) return <ErrorState message="Case not found" onRetry={() => navigate('/cases')} />

  // Evidence chain: count claims with issues for badge
  const claimsList = claimsData?.claims as Array<{ status: string }> | null | undefined
  const evidenceCount = Array.isArray(claimsList) ? claimsList.length : undefined

  const tabs = [
    { id: 'summary', label: 'Summary', icon: '📋' },
    { id: 'todo', label: 'Todo', icon: '📌', count: todoData?.total },
    { id: 'emails', label: 'Emails', icon: '📧', count: emailsData?.total },
    { id: 'notes', label: 'Notes & Labor', icon: '📝', count: (notesData?.total || 0) + (laborRecordsData?.total || 0) || undefined },
    { id: 'teams', label: 'Teams', icon: '💬', count: teamsData?.total },
    { id: 'drafts', label: 'Drafts', icon: '✉️', count: draftsData?.total },
    { id: 'analysis', label: 'Analysis', icon: '🔍' },
    { id: 'evidence', label: 'Evidence', icon: '🔗', count: evidenceCount },
    { id: 'onenote', label: 'OneNote', icon: '📓', count: onenoteData?.total },
    { id: 'timing', label: 'Timing', icon: '⏱️' },
    { id: 'logs', label: 'Logs', icon: '📄', count: logsData?.total },
    { id: 'attachments', label: 'Files', icon: '📎', count: attachmentsData?.total },
    { id: 'ai', label: 'AI Assistant', icon: '🤖' },
  ]

  return (
    <div className="space-y-4">
      {/* Compact Header Card */}
      <div
        className="rounded-xl p-4"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-card)' }}
      >
        {/* Row 1: Back + Title + Health Score */}
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate('/cases')}
            className="mt-1 p-1 rounded-lg flex-shrink-0"
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = ''}
          >
            <ArrowLeft className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
          </button>
          <h2 className="text-lg font-bold leading-snug flex-1 min-w-0" style={{ color: 'var(--text-primary)' }}>
            {caseInfo.title}
          </h2>
          {meta && <HealthScoreBadge meta={meta} />}
        </div>

        {/* Row 2: Metadata chips */}
        <div className="flex items-center gap-1.5 flex-wrap mt-2 ml-9 text-xs">
          <span className="font-mono" style={{ color: 'var(--text-tertiary)' }}>{id}</span>
          <span style={{ color: 'var(--border-default)' }}>·</span>
          <SeverityBadge severity={caseInfo.severity} />
          <CaseStatusBadge status={caseInfo.status} />
          {meta?.actualStatus && meta.actualStatus !== caseInfo.status?.toLowerCase() && (
            <Badge variant="info" size="xs">{meta.actualStatus}</Badge>
          )}
          {caseInfo.is24x7 && /24\s*[x×]\s*7|yes|true/i.test(caseInfo.is24x7) && (
            <Badge variant="danger" size="xs">24×7</Badge>
          )}
          {meta?.ccAccount && <RdseBadge ccAccount={meta.ccAccount} />}
          <span style={{ color: 'var(--border-default)' }}>·</span>
          <span style={{ color: 'var(--text-secondary)' }}>{caseInfo.assignedTo}</span>
          <span style={{ color: 'var(--border-default)' }}>·</span>
          <span style={{ color: 'var(--text-secondary)' }}>{caseInfo.caseAge || '0 days'}</span>
          {caseInfo.origin && (
            <>
              <span style={{ color: 'var(--border-default)' }}>·</span>
              <span style={{ color: 'var(--text-tertiary)' }}>{caseInfo.origin}</span>
            </>
          )}
          {caseInfo.country && (
            <>
              <span style={{ color: 'var(--border-default)' }}>·</span>
              <span style={{ color: 'var(--text-tertiary)' }}>{caseInfo.country}</span>
            </>
          )}
          {caseInfo.timezone && (
            <>
              <span style={{ color: 'var(--border-default)' }}>·</span>
              <span style={{ color: 'var(--text-tertiary)' }}>{caseInfo.timezone}</span>
            </>
          )}
          {meta?.daysSinceLastContact != null && meta.daysSinceLastContact > 0 && (
            <>
              <span style={{ color: 'var(--border-default)' }}>·</span>
              <span
                className={meta.daysSinceLastContact > 3 ? 'font-medium' : ''}
                style={{ color: meta.daysSinceLastContact > 3 ? 'var(--accent-red)' : 'var(--text-tertiary)' }}
              >
                Last contact {meta.daysSinceLastContact}d ago
              </span>
            </>
          )}
        </div>

        {/* Row 3: Timestamps */}
        <div className="flex items-center gap-3 flex-wrap mt-1.5 ml-9 text-xs" style={{ color: 'var(--text-tertiary)' }}>
          <span title={caseInfo.createdOn}>
            <Clock className="w-3 h-3 inline mr-0.5 -mt-px" />
            Created {formatCompactTime(caseInfo.createdOn)}
          </span>
          {caseInfo.modifiedAt && (
            <span title={caseInfo.modifiedAt}>
              · Updated {formatCompactTime(caseInfo.modifiedAt)}
            </span>
          )}
          {caseInfo.fetchedAt && (
            <span title={caseInfo.fetchedAt}>
              <RefreshCw className="w-3 h-3 inline mr-0.5 -mt-px" />
              Fetched {formatCompactTime(caseInfo.fetchedAt)}
            </span>
          )}
        </div>

        {/* Row 4: SAP path */}
        {caseInfo.sap && (
          <div className="flex items-center gap-1.5 mt-2 ml-9 text-xs" style={{ color: 'var(--text-tertiary)' }}>
            <FolderOpen className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--text-tertiary)' }} />
            <span className="truncate" title={caseInfo.sap}>{caseInfo.sap}</span>
          </div>
        )}

        {/* Row 5: SLA indicators (integrated into header) */}
        {meta && (
          <div
            className="flex items-center gap-3 mt-2.5 ml-9 pt-2.5 text-xs"
            style={{ borderTop: '1px solid var(--border-subtle)' }}
          >
            <div className="flex items-center gap-1">
              <span style={{ color: 'var(--text-tertiary)' }}>IR:</span>
              <SlaBadge status={meta.irSla?.status || 'unknown'} />
              {meta.irSla?.remaining && (
                <span className="ml-0.5" style={{ color: 'var(--text-tertiary)' }}>{meta.irSla.remaining}</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <span style={{ color: 'var(--text-tertiary)' }}>FWR:</span>
              <SlaBadge status={meta.fwr?.status || 'unknown'} />
            </div>
            <div className="flex items-center gap-1">
              <span style={{ color: 'var(--text-tertiary)' }}>FDR:</span>
              <SlaBadge status={meta.fdr?.status || 'unknown'} />
            </div>
            {meta.teams_chat_count > 0 && (
              <div className="flex items-center gap-1">
                <span style={{ color: 'var(--text-tertiary)' }}>Teams:</span>
                <Badge variant="purple" size="xs">{meta.teams_chat_count} chats</Badge>
              </div>
            )}
          </div>
        )}

        {/* Entitlement Warning Banner */}
        {meta?.compliance?.entitlementOk === false && (
          <div className="mt-2.5 ml-9">
            <EntitlementWarningBanner compliance={meta.compliance} />
          </div>
        )}
      </div>

      {/* Main Content: Left (Tabs + Content) | Right (AI Panel) */}
      <div className="flex gap-4 items-start">
        {/* Left — Information area */}
        <div className="flex-1 min-w-0 space-y-4">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          <div>
            {activeTab === 'summary' && <InspectionTab content={inspectionData?.content} exists={inspectionData?.exists} filename={inspectionData?.filename} updatedAt={inspectionData?.updatedAt} />}
            {activeTab === 'todo' && <CaseTodoTab caseId={id!} latest={todoData?.latest || null} files={todoData?.files || []} toggleTodo={toggleCaseTodo} />}
            {activeTab === 'emails' && <EmailsTab emails={emailsData?.emails || []} caseNumber={id!} />}
            {activeTab === 'notes' && <NotesAndLaborTab notes={notesData?.notes || []} laborRecords={laborRecordsData?.records || []} caseId={id!} />}
            {activeTab === 'teams' && <TeamsTab chats={teamsData?.chats || []} digest={teamsData?.digest || null} caseId={id!} />}
            {activeTab === 'drafts' && <DraftsTab drafts={draftsData?.drafts || []} caseNumber={id!} />}
            {activeTab === 'analysis' && <AnalysisTab content={analysisData?.content} exists={analysisData?.exists} files={analysisData?.files} />}
            {activeTab === 'evidence' && <EvidenceChainTab caseId={id!} />}
            {activeTab === 'onenote' && <OnenoteTab caseId={id!} files={onenoteData?.files || []} pages={onenoteData?.pages || []} scoring={onenoteData?.scoring} />}
            {activeTab === 'timing' && <TimingTab exists={timingData?.exists} timing={timingData?.timing} />}
            {activeTab === 'logs' && <LogsTab logs={logsData?.logs || []} />}
            {activeTab === 'attachments' && <AttachmentsTab files={attachmentsData?.files || []} meta={attachmentsData?.meta} caseNumber={id!} />}
            {activeTab === 'ai' && <CaseAIPanel mode="full" caseNumber={id!} />}
          </div>
        </div>

        {/* Right — AI Assistant sidebar (xl+ only, sticky) */}
        <div className="w-64 flex-shrink-0 hidden xl:block sticky top-4">
          <CaseAIPanel mode="compact" caseNumber={id!} onOpenFull={() => setActiveTab('ai')} skipRecovery />
        </div>
      </div>

      {/* Tablet/Mobile: AI Panel below content */}
      <div className="xl:hidden">
        <CaseAIPanel mode="compact" caseNumber={id!} onOpenFull={() => setActiveTab('ai')} skipRecovery />
      </div>
    </div>
  )
}

/** Fetches image with JWT auth header, renders as blob URL */
function AuthImage({ src, alt, className, style }: { src: string; alt: string; className?: string; style?: React.CSSProperties }) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const token = localStorage.getItem('eb_token')
    fetch(src, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.blob() : null)
      .then(blob => {
        if (blob && !cancelled) setBlobUrl(URL.createObjectURL(blob))
      })
      .catch(() => {})
    return () => { cancelled = true; if (blobUrl) URL.revokeObjectURL(blobUrl) }
  }, [src])

  if (!blobUrl) return null
  return <img src={blobUrl} alt={alt} className={className} style={style} />
}

function EmailsTab({ emails, caseNumber }: { emails: any[]; caseNumber: string }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  if (emails.length === 0) return <EmptyState icon="📧" title="No emails" />

  // Sort newest first
  const sorted = [...emails].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const toggle = (id: string) => {
    const next = new Set(expanded)
    next.has(id) ? next.delete(id) : next.add(id)
    setExpanded(next)
  }

  // Transform inline image markdown to img tags with API URLs
  const renderBody = (body: string) => {
    if (!body) return '(No body)'
    // Strip legacy "**Inline Images:**" header and empty image refs
    const cleaned = body
      .replace(/\*\*Inline Images:\*\*\n?/g, '')
      .replace(/!\[inline-image\]\(\)\n?/g, '')
    const parts = cleaned.split(/(!\[.*?\]\(images\/[^)]+\))/)
    return parts.map((part, i) => {
      const imgMatch = part.match(/!\[.*?\]\((images\/([^)]+))\)/)
      if (imgMatch) {
        const filename = imgMatch[2]
        const src = `/api/cases/${caseNumber}/images/${filename}`
        return (
          <AuthImage
            key={i}
            src={src}
            alt="inline"
            className="max-w-full my-2 rounded border"
            style={{ borderColor: 'var(--border-subtle)', maxHeight: '400px' }}
          />
        )
      }
      return <span key={i}>{part}</span>
    })
  }

  return (
    <div className="space-y-3">
      {sorted.map((email, i) => (
        <Card key={email.id || i} padding="sm">
          <div
            className="flex items-start gap-3 cursor-pointer"
            onClick={() => toggle(email.id || String(i))}
          >
            <span className="text-lg flex-shrink-0 mt-0.5">
              {email.direction === 'sent' ? '📤' : '📥'}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={email.direction === 'sent' ? 'primary' : 'success'} size="xs">
                  {email.direction === 'sent' ? 'Sent' : 'Received'}
                </Badge>
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{email.date}</span>
              </div>
              <p className="font-medium text-sm mt-1 truncate" style={{ color: 'var(--text-primary)' }}>{email.subject}</p>
              {email.from && <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>From: {email.from}</p>}
              {email.cc && <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>CC: {email.cc}</p>}
            </div>
          </div>
          {expanded.has(email.id || String(i)) && (
            <div
              className="mt-3 pt-3 text-sm whitespace-pre-wrap"
              style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
            >
              {renderBody(email.body)}
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}

function NotesAndLaborTab({ notes, laborRecords, caseId }: { notes: any[]; laborRecords: any[]; caseId: string }) {
  const hasNotes = notes.length > 0
  const hasLabor = laborRecords.length > 0
  const [expandedNotes, setExpandedNotes] = useState<Set<number>>(new Set(hasNotes ? [0] : []))
  const [expandedLabor, setExpandedLabor] = useState<Set<number>>(new Set())
  const refreshNotes = useRefreshNotes()
  const refreshLabor = useRefreshLaborRecords()
  const [notesMsg, setNotesMsg] = useState<string | null>(null)
  const [laborMsg, setLaborMsg] = useState<string | null>(null)

  const toggleNote = (i: number) => {
    const next = new Set(expandedNotes)
    next.has(i) ? next.delete(i) : next.add(i)
    setExpandedNotes(next)
  }
  const toggleLabor = (i: number) => {
    const next = new Set(expandedLabor)
    next.has(i) ? next.delete(i) : next.add(i)
    setExpandedLabor(next)
  }

  // Truncate body to ~2 lines for preview
  const previewText = (text: string, maxLen = 120) => {
    if (!text) return ''
    const oneLine = text.replace(/\n/g, ' ').trim()
    return oneLine.length > maxLen ? oneLine.slice(0, maxLen) + '...' : oneLine
  }

  // Labor classification color map
  const classificationColor = (cls: string): 'primary' | 'purple' | 'success' | 'warning' | 'info' => {
    const lower = (cls || '').toLowerCase()
    if (lower.includes('troubleshoot')) return 'primary'
    if (lower.includes('research')) return 'purple'
    if (lower.includes('communi')) return 'success'
    if (lower.includes('remote') || lower.includes('session')) return 'warning'
    return 'info'
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
      {/* Left column — Notes */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-1" style={{ color: 'var(--text-primary)' }}>
          <span className="text-base">📝</span> Notes
          {hasNotes && (
            <Badge variant="secondary" size="xs">{notes.length}</Badge>
          )}
          <button
            className="ml-auto p-1 rounded hover:bg-white/10 transition-colors disabled:opacity-40"
            title="Refresh notes from D365"
            disabled={refreshNotes.isPending}
            onClick={() => {
              const oldCount = notes.length
              refreshNotes.mutate(caseId, {
                onSuccess: (data: any) => {
                  const newCount = data?.total ?? data?.notes?.length ?? 0
                  setNotesMsg(newCount > oldCount ? `Updated: ${newCount} notes (+${newCount - oldCount})` : `Up to date (${newCount} notes)`)
                  setTimeout(() => setNotesMsg(null), 3000)
                },
                onError: () => { setNotesMsg('Refresh failed'); setTimeout(() => setNotesMsg(null), 3000) },
              })
            }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshNotes.isPending ? 'animate-spin' : ''}`} style={{ color: 'var(--text-tertiary)' }} />
          </button>
          {notesMsg && <span className="text-[10px] ml-1" style={{ color: 'var(--accent-green)' }}>{notesMsg}</span>}
        </h3>
        <NoteGapCard caseId={caseId} />
        {!hasNotes ? (
          <EmptyState icon="📝" title="No notes" />
        ) : (
          notes.map((note, i) => {
            const isOpen = expandedNotes.has(i)
            return (
              <Card key={note.id || i} padding="sm" hover>
                <div
                  className="cursor-pointer"
                  onClick={() => toggleNote(i)}
                >
                  {/* Row 1: icon + meta */}
                  <div className="flex items-start gap-2.5">
                    <span className="text-base flex-shrink-0 mt-0.5">📝</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="info" size="xs">{note.author}</Badge>
                        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{note.date}</span>
                      </div>
                      {/* Row 2: title */}
                      {note.title && note.title !== '(no title)' && (
                        <p className="font-medium text-sm mt-1 truncate" style={{ color: 'var(--text-primary)' }}>{note.title}</p>
                      )}
                      {/* Row 3: preview (collapsed) */}
                      {!isOpen && note.body && (
                        <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-tertiary)' }}>
                          {previewText(note.body, 150)}
                        </p>
                      )}
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 flex-shrink-0 mt-1 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      style={{ color: 'var(--text-tertiary)' }}
                    />
                  </div>
                </div>
                {/* Expanded body */}
                {isOpen && (
                  <div
                    className="mt-3 pt-3 text-sm whitespace-pre-wrap"
                    style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
                  >
                    {note.body}
                  </div>
                )}
              </Card>
            )
          })
        )}
      </div>

      {/* Right column — Labor */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-1" style={{ color: 'var(--text-primary)' }}>
          <span className="text-base">⏱️</span> Labor
          {hasLabor && (
            <Badge variant="secondary" size="xs">{laborRecords.length}</Badge>
          )}
          <button
            className="ml-auto p-1 rounded hover:bg-white/10 transition-colors disabled:opacity-40"
            title="Refresh labor from D365"
            disabled={refreshLabor.isPending}
            onClick={() => {
              const oldCount = laborRecords.length
              refreshLabor.mutate(caseId, {
                onSuccess: (data: any) => {
                  const newCount = data?.total ?? data?.records?.length ?? 0
                  setLaborMsg(newCount > oldCount ? `Updated: ${newCount} records (+${newCount - oldCount})` : `Up to date (${newCount} records)`)
                  setTimeout(() => setLaborMsg(null), 3000)
                },
                onError: () => { setLaborMsg('Refresh failed'); setTimeout(() => setLaborMsg(null), 3000) },
              })
            }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshLabor.isPending ? 'animate-spin' : ''}`} style={{ color: 'var(--text-tertiary)' }} />
          </button>
          {laborMsg && <span className="text-[10px] ml-1" style={{ color: 'var(--accent-green)' }}>{laborMsg}</span>}
        </h3>
        <LaborEstimateCard caseNumber={caseId} hasLaborToday={laborRecords.some((r: any) => {
          const d = r.performedOn || r.date
          return d && new Date(d).toDateString() === new Date().toDateString()
        })} />
        {!hasLabor ? (
          <EmptyState icon="⏱️" title="No labor records" />
        ) : (
          laborRecords.map((record, i) => {
            const isOpen = expandedLabor.has(i)
            return (
              <Card key={i} padding="sm" hover>
                <div
                  className="cursor-pointer"
                  onClick={() => toggleLabor(i)}
                >
                  {/* Row 1: icon + meta */}
                  <div className="flex items-start gap-2.5">
                    <span className="text-base flex-shrink-0 mt-0.5">⏱️</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={classificationColor(record.classification)} size="xs">
                          {record.classification}
                        </Badge>
                        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{record.date}</span>
                        <span className="text-sm font-semibold ml-auto" style={{ color: 'var(--accent-blue)' }}>
                          {record.durationMin} min
                        </span>
                      </div>
                      {/* Row 2: preview (collapsed) */}
                      {!isOpen && record.description && (
                        <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-tertiary)' }}>
                          {previewText(record.description, 150)}
                        </p>
                      )}
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 flex-shrink-0 mt-1 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      style={{ color: 'var(--text-tertiary)' }}
                    />
                  </div>
                </div>
                {/* Expanded body */}
                {isOpen && (
                  <div
                    className="mt-3 pt-3 text-sm whitespace-pre-wrap"
                    style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
                  >
                    {record.description || '(No description)'}
                  </div>
                )}
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}

function TeamsTab({ chats, digest, caseId }: { chats: any[]; digest: { scoredAt: string; keyFacts: string[]; relevantCount: number; irrelevantCount: number } | null; caseId: string }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showRelevant, setShowRelevant] = useState(true)
  const [showOther, setShowOther] = useState(false)
  const [expandedChats, setExpandedChats] = useState<Set<string>>(new Set())

  const toggleChat = (chatId: string) => {
    setExpandedChats(prev => {
      const next = new Set(prev)
      if (next.has(chatId)) next.delete(chatId)
      else next.add(chatId)
      return next
    })
  }

  const scrollRef = useCallback((node: HTMLDivElement | null) => {
    if (node) node.scrollTop = node.scrollHeight
  }, [])

  if (chats.length === 0) return <EmptyState icon="💬" title="No Teams chats" description="Teams data will appear after running casework or teams-search" />

  const filteredChats = searchTerm
    ? chats.filter(c => c.content?.toLowerCase().includes(searchTerm.toLowerCase()) || c.chatId?.toLowerCase().includes(searchTerm.toLowerCase()))
    : chats

  const relevantChats = filteredChats.filter(c => c.relevance === 'high')
  const otherChats = filteredChats.filter(c => c.relevance !== 'high')
  const hasScoring = digest !== null

  const highlightText = (text: string) => {
    if (!searchTerm) return text
    const parts = text.split(new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))
    return parts.map((part, i) =>
      part.toLowerCase() === searchTerm.toLowerCase()
        ? <mark key={i} className="px-0.5 rounded" style={{ background: 'var(--accent-amber-dim)' }}>{part}</mark>
        : part
    )
  }

  // ISS-226: Replace ./assets/ paths in chat content with API URLs
  const rewriteImagePaths = (content: string) => {
    return content.replace(/!\[([^\]]*)\]\(\.\/assets\/([^)]+)\)/g,
      `![$1](/api/cases/${caseId}/teams/assets/$2)`)
  }

  // ISS-227: Ensure each chat message line gets its own paragraph
  // Chat .md format: "**Name** (HH:MM): content" — consecutive lines need blank line separation
  const ensureMessageLineBreaks = (content: string) => {
    return content.replace(/(\n)(\*\*[^*]+\*\*\s*\()/g, '\n\n$2')
  }

  // Extract last update time from chat content header ("> 最后更新：2026-04-18 02:03 GMT+8")
  const extractLastUpdate = (content: string) => {
    const match = content.match(/最后更新[：:]\s*(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})/)
    return match ? match[1] : ''
  }

  // Strip .md header (everything before first "## " date heading) for clean content display
  const stripMdHeader = (content: string) => {
    const idx = content.indexOf('\n## ')
    return idx >= 0 ? content.slice(idx + 1) : content
  }

  // Colorize person names + style date headings in chat messages
  const colorizeChatContent = (content: string) => {
    const colors = ['var(--accent-blue)', 'var(--accent-green)', '#c084fc', 'var(--accent-amber)', '#f472b6', 'var(--accent-red)']
    const nameColorMap: Record<string, string> = {}
    let colorIdx = 0
    // 1. Replace **Name** with colored <span>
    let result = content.replace(/\*\*([^*]+)\*\*/g, (match, name) => {
      if (!(name in nameColorMap)) {
        nameColorMap[name] = colors[colorIdx % colors.length]
        colorIdx++
      }
      return `<span style="color:${nameColorMap[name]};font-weight:600">${name}</span>`
    })
    // 2. Replace ## YYYY-MM-DD date headings with styled HTML (amber color, smaller, with divider)
    result = result.replace(/^## (\d{4}-\d{2}-\d{2})/gm,
      '<div style="color:var(--accent-amber);font-weight:700;font-size:13px;margin-top:12px;padding-bottom:4px;border-bottom:1px solid var(--border-subtle)">📅 $1</div>')
    return result
  }

  const renderChat = (chat: any, i: number) => {
    const chatKey = chat.chatId || `chat-${i}`
    const isExpanded = expandedChats.has(chatKey)
    const lastUpdate = extractLastUpdate(chat.content || '')
    return (
      <Card key={chatKey} padding="sm">
        <button
          onClick={() => toggleChat(chatKey)}
          className="flex items-center justify-between w-full text-left"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <div className="flex items-center gap-2">
            <span style={{ display: 'inline-block', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s', fontSize: '10px', color: 'var(--text-tertiary)' }}>▶</span>
            <h4 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
              {chat.chatId?.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) || `Chat ${i + 1}`}
            </h4>
            {chat.chatType === 'customer' && (
              <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'var(--accent-blue-dim)', color: 'var(--accent-blue)' }}>customer</span>
            )}
            {chat.relevance === 'high' && (
              <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'var(--accent-green-dim)', color: 'var(--accent-green)' }}>relevant</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {lastUpdate && <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>🕐 {lastUpdate}</span>}
            {chat.reason && <span className="text-xs truncate max-w-48" style={{ color: 'var(--text-tertiary)' }}>{chat.reason}</span>}
          </div>
        </button>
        {isExpanded && (
          <div ref={scrollRef} className="text-sm max-h-96 overflow-y-auto mt-2 pt-2" style={{ color: 'var(--text-secondary)', borderTop: '1px solid var(--border-subtle)' }}>
            {searchTerm
              ? highlightText(chat.content || '')
              : <MarkdownContent>{colorizeChatContent(ensureMessageLineBreaks(rewriteImagePaths(stripMdHeader(chat.content || ''))))}</MarkdownContent>
            }
          </div>
        )}
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {/* Key Facts Card */}
      {digest && digest.keyFacts.length > 0 && (
        <Card padding="sm" style={{ borderLeft: '3px solid var(--accent-amber)' }}>
          <h4 className="font-medium text-sm mb-2" style={{ color: 'var(--accent-amber)' }}>🔑 关键事实（Key Facts）</h4>
          <div className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
            {digest.keyFacts.map((fact, i) =>
              fact.startsWith('### ')
                ? <p key={i} className="font-medium mt-3 mb-1 text-xs" style={{ color: 'var(--accent-amber)', opacity: 0.8 }}>{fact.slice(4)}</p>
                : fact.includes('![')
                  ? <div key={i} className="pl-0" style={{ lineHeight: '1.5' }}><MarkdownContent>{'• ' + rewriteImagePaths(fact)}</MarkdownContent></div>
                  : <p key={i} className="pl-0" style={{ lineHeight: '1.5' }}>• {fact}</p>
            )}
          </div>
          <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
            相关对话: {digest.relevantCount} / {digest.relevantCount + digest.irrelevantCount} · 评分时间: {new Date(digest.scoredAt).toLocaleString()}
          </p>
        </Card>
      )}

      {/* Search */}
      {chats.length > 1 && (
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search chats..."
          className="w-full px-3 py-1.5 text-sm rounded-lg focus:outline-none focus:ring-2"
          style={{ border: '1px solid var(--border-default)', background: 'var(--bg-inset)', color: 'var(--text-primary)', boxShadow: 'none', outlineColor: 'var(--accent-blue)', '--tw-ring-color': 'var(--accent-blue)' } as React.CSSProperties}
        />
      )}

      {filteredChats.length === 0 ? (
        <p className="text-sm text-center py-4" style={{ color: 'var(--text-tertiary)' }}>No matches for &ldquo;{searchTerm}&rdquo;</p>
      ) : hasScoring && !searchTerm ? (
        <>
          {/* Relevant Chats Section — collapsible, default open */}
          {relevantChats.length > 0 && (
            <div>
              <button
                onClick={() => setShowRelevant(!showRelevant)}
                className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider w-full py-2 hover:opacity-80 transition-opacity"
                style={{ color: 'var(--accent-green)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <span style={{ display: 'inline-block', transform: showRelevant ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▶</span>
                📌 相关对话 ({relevantChats.length})
              </button>
              {showRelevant && (
                <div className="space-y-2 mt-1">
                  {relevantChats.map(renderChat)}
                </div>
              )}
            </div>
          )}

          {/* Other Chats Section — collapsed by default */}
          {otherChats.length > 0 && (
            <div>
              <button
                onClick={() => setShowOther(!showOther)}
                className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider w-full py-2 hover:opacity-80 transition-opacity"
                style={{ color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <span style={{ display: 'inline-block', transform: showOther ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▶</span>
                其他对话 ({otherChats.length})
              </button>
              {showOther && (
                <div className="space-y-2 mt-1">
                  {otherChats.map(renderChat)}
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        /* Flat layout: no scoring data OR user is searching */
        filteredChats.map(renderChat)
      )}
    </div>
  )
}

/** Strip YAML frontmatter (--- ... ---) from markdown. */
function stripFrontmatter(md: string): string {
  const lines = md.split('\n')
  if (lines[0]?.trim() !== '---') return md
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') return lines.slice(i + 1).join('\n').replace(/^\n+/, '')
  }
  return md
}

function DraftCard({ draft, defaultExpanded, caseNumber }: { draft: any; defaultExpanded: boolean; caseNumber: string }) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [copied, setCopied] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState('')

  const cleanContent = stripFrontmatter((draft.content || '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^(\*\*(?:To|CC|Subject|Language|Type):.*$)/gm, '$1\n'))

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const { copyAsRichText } = await import('../utils/clipboard')
      await copyAsRichText(editing ? editContent : cleanContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setEditContent(cleanContent)
    setEditing(true)
    if (!expanded) setExpanded(true)
  }

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const res = await fetch(`/api/drafts/${caseNumber}/${draft.filename}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent }),
      })
      if (res.ok) {
        draft.content = editContent
        setEditing(false)
      }
    } catch { /* ignore */ }
  }

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation()
    setEditing(false)
    setEditContent('')
  }

  return (
    <Card padding="sm">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          {expanded
            ? <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
            : <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />}
          <span className="font-mono text-xs" style={{ color: 'var(--text-tertiary)' }}>{draft.filename}</span>
          {!defaultExpanded && (
            <Badge variant="secondary" size="xs">Historical</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleEdit}
            className="flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors"
            style={{ color: editing ? 'var(--accent-blue)' : 'var(--text-tertiary)' }}
            title="Edit draft"
          >
            <Pencil className="w-3 h-3" />
            Edit
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors"
            style={{
              color: copied ? 'var(--accent-green)' : 'var(--text-tertiary)',
              background: copied ? 'var(--accent-green-dim)' : undefined,
            }}
            title="Copy as rich text for Outlook"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {new Date(draft.createdAt).toLocaleString()}
          </span>
        </div>
      </div>
      {expanded && (
        <div
          className="border-t pt-3 mt-3"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          {editing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full min-h-[300px] p-3 rounded text-sm font-mono"
                style={{
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-default)',
                }}
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs rounded transition-colors"
                  style={{ color: 'var(--text-tertiary)', border: '1px solid var(--border-default)' }}
                >
                  <X className="w-3 h-3" /> Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs rounded transition-colors"
                  style={{ color: 'var(--accent-blue)', border: '1px solid var(--accent-blue)' }}
                >
                  <Save className="w-3 h-3" /> Save
                </button>
              </div>
            </div>
          ) : (
            <MarkdownContent>{cleanContent}</MarkdownContent>
          )}
        </div>
      )}
    </Card>
  )
}

function DraftsTab({ drafts, caseNumber }: { drafts: any[]; caseNumber: string }) {
  const [ccCopied, setCcCopied] = useState(false)

  if (drafts.length === 0) return <EmptyState icon="✉️" title="No drafts" />

  // Sort by createdAt descending — latest first
  const sorted = [...drafts].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  // CC: RDSE case shows customer-specific CC, otherwise default
  const myEmail = 'fangkun@microsoft.com'
  const defaultCC = 'mcpodvm@microsoft.com;fangkun@microsoft.com'
  const sample = sorted[0]
  const isRDSE = sample?.ccAccount && sample?.ccList
  const ccEmails = isRDSE
    ? (sample.ccList.toLowerCase().includes(myEmail) ? sample.ccList : `${sample.ccList};${myEmail}`)
    : defaultCC
  const ccLabel = isRDSE ? `RDSE: ${sample.ccAccount.split('/')[0].trim()}` : null
  const handleCopyCC = async () => {
    try { await navigator.clipboard.writeText(ccEmails) } catch {
      const ta = document.createElement('textarea'); ta.value = ccEmails
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta)
    }
    setCcCopied(true); setTimeout(() => setCcCopied(false), 1500)
  }

  return (
    <div className="space-y-3">
      <div
        className="flex items-start gap-2 px-3 py-2 rounded text-xs"
        style={{
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <span className="min-w-0 break-all" style={{ color: 'var(--text-secondary)' }}>
          <strong style={isRDSE ? { color: 'var(--accent-blue)' } : undefined}>CC{ccLabel ? ` (${ccLabel})` : ''}:</strong> {ccEmails}
        </span>
        <button
          onClick={handleCopyCC}
          className="flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors shrink-0"
          style={{
            color: ccCopied ? 'var(--accent-green)' : 'var(--text-tertiary)',
            background: ccCopied ? 'var(--accent-green-dim)' : undefined,
          }}
          title="Copy CC list"
        >
          {ccCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {ccCopied ? '✓' : 'Copy CC'}
        </button>
      </div>
      {sorted.map((draft, i) => (
        <DraftCard key={i} draft={draft} defaultExpanded={i === 0} caseNumber={caseNumber} />
      ))}
    </div>
  )
}

function AnalysisTab({ content, exists, files }: {
  content?: string
  exists?: boolean
  files?: Array<{ filename: string; content: string; updatedAt: string; size: number }>
}) {
  if (!exists || !content) return <EmptyState icon="🔍" title="No analysis report" description="Run the troubleshooter agent to generate an analysis" />

  // If we have individual files, render with collapse (latest expanded, older collapsed)
  if (files && files.length > 1) {
    return <AnalysisFileList files={files} />
  }

  // Single file or legacy format — render as-is
  return (
    <Card>
      <MarkdownContent>{content}</MarkdownContent>
    </Card>
  )
}

function AnalysisFileList({ files }: { files: Array<{ filename: string; content: string; updatedAt: string; size: number }> }) {
  // Latest file is first (sorted by mtime desc from backend)
  const [expanded, setExpanded] = useState<string>(files[0]?.filename || '')

  return (
    <div className="space-y-3">
      {files.map((f, idx) => {
        const isLatest = idx === 0
        const isExpanded = expanded === f.filename
        return (
          <Card key={f.filename}>
            <button
              onClick={() => setExpanded(isExpanded ? '' : f.filename)}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-2">
                {isLatest && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase"
                    style={{ background: 'var(--accent-blue-dim)', color: 'var(--accent-blue)' }}>
                    Latest
                  </span>
                )}
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {f.filename.replace(/\.md$/, '').replace(/\.txt$/, '')}
                </span>
                <span className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>
                  {(f.size / 1024).toFixed(1)}KB
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  {new Date(f.updatedAt).toLocaleString()}
                </span>
                {isExpanded
                  ? <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                  : <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />}
              </div>
            </button>
            {isExpanded && (
              <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <MarkdownContent>{f.content}</MarkdownContent>
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}

function OnenoteTab({ caseId, files, pages, scoring }: {
  caseId: string
  files: Array<{ filename: string; content: string; size: number; updatedAt: string }>
  pages?: Array<{ filename: string; content: string; size: number; updatedAt: string; imageCount: number }>
  scoring?: {
    scoredAt: string;
    format?: string;
    // v2 four-section format
    keyInfo?: string[];
    analyses?: string[];
    actionItems?: string[];
    lowRelevance?: string[];
    // v1 legacy format
    keyFacts?: string[];
    highCount: number;
    lowCount: number;
    pages: Record<string, { relevance: string; reason: string }>
  } | null
}) {
  const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set())
  const [showHighPages, setShowHighPages] = useState(true)
  const [showLowPages, setShowLowPages] = useState(false)
  const [lightboxImg, setLightboxImg] = useState<string | null>(null)

  if (files.length === 0) return <EmptyState icon="📓" title="No OneNote notes" description="Run patrol or casework to search OneNote for case-related notes" />

  const hasPages = pages && pages.length > 0
  // v2 format check: has any of the four sections populated
  const isV2 = scoring && (scoring.format === 'v2' || (scoring.keyInfo && scoring.keyInfo.length > 0))
  const hasScoring = scoring && (isV2 || (scoring.keyFacts && scoring.keyFacts.length > 0))

  const togglePage = (filename: string) => {
    setExpandedPages(prev => {
      const next = new Set(prev)
      if (next.has(filename)) next.delete(filename)
      else next.add(filename)
      return next
    })
  }

  // Replace ./assets/xxx.png references with API URLs in markdown
  const renderPageContent = (content: string) => {
    return content.replace(
      /!\[([^\]]*)\]\(\.\/(assets\/[^)]+)\)/g,
      (_, alt, assetPath) => {
        const filename = assetPath.replace('assets/', '')
        return `![${alt}](/api/cases/${caseId}/onenote/assets/${filename})`
      }
    )
  }

  // Get page relevance from scoring data
  const getPageRelevance = (filename: string): string => {
    if (!scoring?.pages) return 'unknown'
    const key = filename.replace(/\.md$/, '')
    return scoring.pages[key]?.relevance || 'unknown'
  }

  const getPageReason = (filename: string): string => {
    if (!scoring?.pages) return ''
    const key = filename.replace(/\.md$/, '')
    return scoring.pages[key]?.reason || ''
  }

  // Split pages into high/low relevance
  const highPages = hasPages ? pages.filter(p => getPageRelevance(p.filename) === 'high') : []
  const lowPages = hasPages ? pages.filter(p => getPageRelevance(p.filename) !== 'high') : []

  const renderPage = (page: typeof pages extends (infer T)[] | undefined ? NonNullable<T> : never) => {
    const isExpanded = expandedPages.has(page.filename)
    const displayName = page.filename
      .replace(/^_page-/, '')
      .replace(/\.md$/, '')
      .replace(/--/g, ' › ')
    const relevance = getPageRelevance(page.filename)
    return (
      <Card key={page.filename} padding="sm">
        <button
          onClick={() => togglePage(page.filename)}
          className="flex items-center justify-between w-full text-left"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <div className="flex items-center gap-2">
            <span style={{ display: 'inline-block', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s', fontSize: '10px', color: 'var(--text-tertiary)' }}>▶</span>
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {displayName}
            </span>
            {relevance === 'high' && (
              <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'var(--accent-green-dim)', color: 'var(--accent-green)' }}>relevant</span>
            )}
            {page.imageCount > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)' }}>
                🖼️ {page.imageCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              {new Date(page.updatedAt).toLocaleDateString()}
            </span>
            {relevance !== 'high' && (
              <span className="text-xs truncate max-w-48" style={{ color: 'var(--text-tertiary)' }}>{getPageReason(page.filename)}</span>
            )}
          </div>
        </button>
        {isExpanded && (
          <div
            className="mt-3 pt-3"
            style={{ borderTop: '1px solid var(--border-subtle)' }}
            onClick={(e) => {
              const target = e.target as HTMLElement
              if (target.tagName === 'IMG') {
                setLightboxImg((target as HTMLImageElement).src)
              }
            }}
          >
            <style>{`
              .onenote-page-content img {
                max-width: 100%;
                max-height: 400px;
                object-fit: contain;
                cursor: pointer;
                border-radius: 4px;
                margin: 8px 0;
                transition: opacity 0.2s;
              }
              .onenote-page-content img:hover { opacity: 0.8; }
            `}</style>
            <div className="onenote-page-content">
              <MarkdownContent>{renderPageContent(page.content)}</MarkdownContent>
            </div>
          </div>
        )}
      </Card>
    )
  }

  // Helper: render markdown-ish items with bold/image support
  const renderItem = (item: string, idx: number) => {
    // Process inline image references for display
    const processed = item.replace(
      /!\[([^\]]*)\]\(\.\/(assets\/[^)]+)\)/g,
      (_, alt, assetPath) => {
        const fname = assetPath.replace('assets/', '')
        return `![${alt}](/api/cases/${caseId}/onenote/assets/${fname})`
      }
    )
    // Bold labels like **问题描述**: ...
    if (processed.startsWith('**')) {
      return <div key={idx} className="mt-2 mb-1"><MarkdownContent>{processed}</MarkdownContent></div>
    }
    // Section sub-headers (### page-name)
    if (processed.startsWith('### ')) {
      return <p key={idx} className="font-medium mt-3 mb-1 text-xs" style={{ color: 'var(--text-tertiary)', opacity: 0.8 }}>{processed.slice(4)}</p>
    }
    // Regular "- item" lines
    const text = processed.startsWith('- ') ? processed.slice(2) : processed
    return <p key={idx} style={{ lineHeight: '1.5' }}>• {text}</p>
  }

  return (
    <div className="space-y-3">
      {/* ── V2 Four-Section Layout ── */}
      {isV2 && scoring && (() => {
        const keyInfo = scoring.keyInfo || []
        const analyses = scoring.analyses || []
        const actionItems = scoring.actionItems || []
        const lowRel = scoring.lowRelevance || []

        return <>
          {/* Section 1: Key Information — amber */}
          {keyInfo.length > 0 && (
            <Card padding="sm" style={{ borderLeft: '3px solid var(--accent-amber)' }}>
              <h4 className="font-medium text-sm mb-2" style={{ color: 'var(--accent-amber)' }}>🔑 关键信息（Key Information）</h4>
              <div className="text-sm space-y-0.5" style={{ color: 'var(--text-secondary)' }}>
                {keyInfo.map((item, i) => renderItem(item, i))}
              </div>
              <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
                相关页面: {scoring.highCount} / {scoring.highCount + scoring.lowCount} · 评分时间: {new Date(scoring.scoredAt).toLocaleString()}
              </p>
            </Card>
          )}

          {/* Section 2: Analysis & Reasoning — blue */}
          {analyses.length > 0 && (
            <Card padding="sm" style={{ borderLeft: '3px solid var(--accent-blue)' }}>
              <h4 className="font-medium text-sm mb-2" style={{ color: 'var(--accent-blue)' }}>💡 分析推断（Analysis & Reasoning）</h4>
              <div className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                {analyses.map((a, i) => {
                  const isEngineer = a.startsWith('[engineer]')
                  const isLLM = a.startsWith('[llm-generated]')
                  const label = isEngineer ? '[engineer]' : isLLM ? '[llm-generated]' : ''
                  const text = a.replace(/^\[(engineer|llm-generated)\]\s*/, '')
                  return (
                    <p key={i} style={{ lineHeight: '1.5', opacity: isLLM ? 0.75 : 0.9 }}>
                      {label && <span className="text-xs font-mono mr-1 px-1 py-0.5 rounded" style={{
                        background: isEngineer ? 'var(--accent-blue-dim, rgba(59,130,246,0.1))' : 'var(--bg-tertiary)',
                        color: isEngineer ? 'var(--accent-blue)' : 'var(--text-tertiary)',
                      }}>{label}</span>}
                      {text}
                    </p>
                  )
                })}
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                ⚠️ [llm-generated] 为 LLM 推断，可能不准确，需验证后引用
              </p>
            </Card>
          )}

          {/* Section 3: Action Plan — green */}
          {actionItems.length > 0 && (
            <Card padding="sm" style={{ borderLeft: '3px solid var(--accent-green)' }}>
              <h4 className="font-medium text-sm mb-2" style={{ color: 'var(--accent-green)' }}>📋 行动计划（Action Plan）</h4>
              <div className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                {actionItems.map((item, i) => {
                  const isVerified = item.startsWith('[verified]')
                  const isUnverified = item.startsWith('[unverified]')
                  const text = item.replace(/^\[(verified|unverified)\]\s*/, '')
                  return (
                    <p key={i} className="flex items-start gap-2" style={{ lineHeight: '1.5' }}>
                      <span className="text-xs mt-0.5 flex-shrink-0">{isVerified ? '✅' : '⬜'}</span>
                      <span style={{ opacity: isVerified ? 0.7 : 1, textDecoration: isVerified ? 'line-through' : 'none' }}>{text}</span>
                    </p>
                  )
                })}
              </div>
            </Card>
          )}

          {/* Section 4: Low-Relevance — gray */}
          {lowRel.length > 0 && (
            <Card padding="sm" style={{ borderLeft: '3px solid var(--border-subtle)', opacity: 0.7 }}>
              <h4 className="font-medium text-sm mb-2" style={{ color: 'var(--text-tertiary)' }}>📦 低价值信息（Low-Relevance）</h4>
              <div className="text-xs space-y-0.5" style={{ color: 'var(--text-tertiary)' }}>
                {lowRel.map((item, i) => <p key={i}>• {item}</p>)}
              </div>
            </Card>
          )}
        </>
      })()}

      {/* ── V1 Legacy Layout (backward compat) ── */}
      {!isV2 && hasScoring && scoring && (() => {
        const facts = (scoring.keyFacts || []).filter(f => f.startsWith('[fact]') || f.startsWith('### '))
        const analyses = (scoring.keyFacts || []).filter(f => f.startsWith('[analysis]'))
        return <>
          {facts.length > 0 && (
            <Card padding="sm" style={{ borderLeft: '3px solid var(--accent-amber)' }}>
              <h4 className="font-medium text-sm mb-2" style={{ color: 'var(--accent-amber)' }}>🔑 事实记录（Facts）</h4>
              <div className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                {facts.map((fact, i) =>
                  fact.startsWith('### ')
                    ? <p key={i} className="font-medium mt-3 mb-1 text-xs" style={{ color: 'var(--accent-amber)', opacity: 0.8 }}>{fact.slice(4)}</p>
                    : <p key={i} className="pl-0" style={{ lineHeight: '1.5' }}>• {fact.replace(/^\[fact\]\s*/, '')}</p>
                )}
              </div>
              <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
                相关页面: {scoring.highCount} / {scoring.highCount + scoring.lowCount} · 评分时间: {new Date(scoring.scoredAt).toLocaleString()}
              </p>
            </Card>
          )}
          {analyses.length > 0 && (
            <Card padding="sm" style={{ borderLeft: '3px solid var(--accent-blue)' }}>
              <h4 className="font-medium text-sm mb-2" style={{ color: 'var(--accent-blue)' }}>💡 分析记录（Analysis）</h4>
              <div className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                {analyses.map((a, i) =>
                  <p key={i} className="pl-0" style={{ lineHeight: '1.5', opacity: 0.85 }}>• {a.replace(/^\[analysis\]\s*/, '')}</p>
                )}
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                ⚠️ 以上为 LLM 推断，可能不准确，需验证后引用
              </p>
            </Card>
          )}
        </>
      })()}

      {/* Fallback: raw markdown if no scoring data */}
      {!hasScoring && files.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-3 text-xs" style={{ color: 'var(--text-tertiary)' }}>
            <span className="font-mono">{files[0].filename.replace(/\.md$/, '')}</span>
            <span>{new Date(files[0].updatedAt).toLocaleString()}</span>
          </div>
          <MarkdownContent>{files[0].content}</MarkdownContent>
        </Card>
      )}

      {/* Pages grouped by relevance — mirrors Teams relevant/other chats */}
      {hasPages && hasScoring ? (
        <>
          {highPages.length > 0 && (
            <div>
              <button
                onClick={() => setShowHighPages(!showHighPages)}
                className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider w-full py-2 hover:opacity-80 transition-opacity"
                style={{ color: 'var(--accent-green)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <span style={{ display: 'inline-block', transform: showHighPages ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▶</span>
                📌 相关页面 ({highPages.length})
              </button>
              {showHighPages && (
                <div className="space-y-2 mt-1">
                  {highPages.map(renderPage)}
                </div>
              )}
            </div>
          )}

          {lowPages.length > 0 && (
            <div>
              <button
                onClick={() => setShowLowPages(!showLowPages)}
                className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider w-full py-2 hover:opacity-80 transition-opacity"
                style={{ color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <span style={{ display: 'inline-block', transform: showLowPages ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▶</span>
                其他页面 ({lowPages.length})
              </button>
              {showLowPages && (
                <div className="space-y-2 mt-1">
                  {lowPages.map(renderPage)}
                </div>
              )}
            </div>
          )}
        </>
      ) : hasPages && (
        /* No scoring — flat page list */
        <div className="space-y-2">
          <div className="text-xs font-medium px-1" style={{ color: 'var(--text-secondary)' }}>
            Raw Pages ({pages!.length})
          </div>
          {pages!.map(renderPage)}
        </div>
      )}

      {/* Lightbox modal */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 cursor-pointer"
          onClick={() => setLightboxImg(null)}
        >
          <img
            src={lightboxImg}
            alt="Enlarged view"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
          <button
            className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300"
            onClick={() => setLightboxImg(null)}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}

function InspectionTab({ content, exists, filename, updatedAt }: { content?: string; exists?: boolean; filename?: string; updatedAt?: string }) {
  if (!exists || !content) return <EmptyState icon="📋" title="No case summary" description="Run casework to generate a summary" />

  return (
    <CaseSummaryRenderer
      content={content}
      filename={filename}
      updatedAt={updatedAt}
    />
  )
}

function CaseTodoTab({ caseId, latest, files, toggleTodo }: {
  caseId: string
  latest: { filename: string; content: string; updatedAt: string } | null
  files: Array<{ filename: string; updatedAt: string }>
  toggleTodo: any
}) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null)

  // Fetch historical file content when a non-latest file is selected
  const isHistorical = selectedFile !== null && selectedFile !== latest?.filename
  const { data: histData, isLoading: histLoading } = useCaseTodoFile(caseId, isHistorical ? selectedFile : null)

  if (!latest) return <EmptyState icon="📌" title="No todo items" description="Run casework to generate todos" />

  // Determine which file to display
  const displayFile = isHistorical && histData?.file
    ? histData.file
    : latest

  // Parse todo content into structured sections
  const sections = parseCaseTodoContent(displayFile.content)
  const isViewingLatest = !isHistorical

  const handleToggle = (lineNumber: number, currentChecked: boolean) => {
    if (!isViewingLatest) return // Only allow toggling on the latest file
    toggleTodo.mutate({
      lineNumber,
      checked: !currentChecked,
      filename: latest.filename,
    })
  }

  return (
    <div className="space-y-3">
      {/* File selector when multiple exist */}
      {files.length > 1 && (
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
          <span>History:</span>
          {files.map(f => {
            const isActive = (!selectedFile && f.filename === latest.filename) || selectedFile === f.filename
            return (
              <button
                key={f.filename}
                onClick={() => setSelectedFile(f.filename === latest.filename ? null : f.filename)}
                className="px-2 py-0.5 rounded font-mono"
                style={{
                  background: isActive ? 'var(--accent-blue-dim)' : 'var(--bg-hover)',
                  color: isActive ? 'var(--accent-blue)' : undefined,
                }}
              >
                {f.filename}
              </button>
            )
          })}
        </div>
      )}

      {/* Loading state for historical file */}
      {isHistorical && histLoading && (
        <div className="py-4 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>Loading historical todo...</div>
      )}

      {/* Content card */}
      {!(isHistorical && histLoading) && (
        <Card>
          <div className="flex items-center justify-between mb-3 text-xs" style={{ color: 'var(--text-tertiary)' }}>
            <div className="flex items-center gap-2">
              <span className="font-mono">{displayFile.filename}</span>
              {!isViewingLatest && (
                <Badge variant="secondary" size="xs">Historical</Badge>
              )}
            </div>
            <span>{new Date(displayFile.updatedAt).toLocaleString()}</span>
          </div>

          {sections.length > 0 ? (
            <div className="space-y-4">
              {sections.map((section, si) => (
                <div key={si}>
                  <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>
                    {section.title}
                  </h4>
                  <div className="space-y-1">
                    {section.items.map((item, ii) => (
                      <div
                        key={ii}
                        className="flex items-start gap-2 p-2 rounded-lg"
                        style={{
                          background: section.type === 'green' ? 'var(--accent-green-dim)' :
                            item.checked ? 'var(--bg-inset)' : undefined
                        }}
                      >
                        {!isViewingLatest ? (
                          <CheckCircle2
                            className="w-5 h-5 flex-shrink-0 mt-0.5"
                            style={{
                              color: section.type === 'green' ? 'var(--accent-green)' :
                                item.checked ? 'var(--accent-blue)' : 'var(--border-default)'
                            }}
                          />
                        ) : (
                          <button
                            onClick={() => handleToggle(item.lineNumber, item.checked)}
                            className="flex-shrink-0 mt-0.5"
                            disabled={toggleTodo.isPending}
                          >
                            {item.checked ? (
                              <CheckCircle2 className="w-5 h-5" style={{ color: section.type === 'green' ? 'var(--accent-green)' : 'var(--accent-blue)' }} />
                            ) : (
                              <Circle className="w-5 h-5" style={{ color: section.type === 'green' ? 'var(--accent-green)' : 'var(--border-default)' }} />
                            )}
                          </button>
                        )}
                        <p className="text-sm flex-1" style={{
                          textDecoration: (item.checked && section.type !== 'green') ? 'line-through' : 'none',
                          color: item.checked
                            ? 'var(--text-tertiary)'
                            : 'var(--text-primary)'
                        }}>
                          {section.type === 'red' && !item.checked && (
                            <AlertTriangle className="w-3.5 h-3.5 inline mr-1" style={{ color: 'var(--accent-red)' }} />
                          )}
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <MarkdownContent>{displayFile.content}</MarkdownContent>
          )}
        </Card>
      )}
    </div>
  )
}

/** Parse per-case todo markdown into structured sections (shared parser) */
/** Format timestamp to compact form: M/D HH:MM */
function formatCompactTime(raw: string | undefined): string {
  if (!raw) return ''
  // Try parsing as Date first (ISO / locale format)
  const d = new Date(raw)
  if (!isNaN(d.getTime())) {
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }
  // Fallback: try "YYYY-MM-DD HH:MM:SS" format
  const m = raw.match(/(\d{1,2})\/(\d{1,2})\/\d{4}\s+(\d{1,2}:\d{2})/)
  if (m) return `${m[1]}/${m[2]} ${m[3]}`
  // Last fallback: return first 16 chars
  return raw.slice(0, 16)
}

export function parseCaseTodoContent(content: string): Array<{
  type: 'red' | 'yellow' | 'green'
  title: string
  items: Array<{ text: string; checked: boolean; lineNumber: number }>
}> {
  const lines = content.split('\n')
  const sections: Array<{ type: 'red' | 'yellow' | 'green'; title: string; items: Array<{ text: string; checked: boolean; lineNumber: number }> }> = []
  let current: typeof sections[0] | null = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNumber = i + 1

    if (line.startsWith('## ')) {
      if (line.includes('🔴')) {
        current = { type: 'red', title: line.replace(/^##\s*/, ''), items: [] }
        sections.push(current)
      } else if (line.includes('🟡')) {
        current = { type: 'yellow', title: line.replace(/^##\s*/, ''), items: [] }
        sections.push(current)
      } else if (line.includes('✅')) {
        current = { type: 'green', title: line.replace(/^##\s*/, ''), items: [] }
        sections.push(current)
      }
      continue
    }

    const match = line.match(/^- \[([ x])\]\s*(.*)/)
    if (match && current) {
      current.items.push({ text: match[2], checked: match[1] === 'x', lineNumber })
    }
  }

  return sections
}

function TimingTab({ exists, timing }: { exists?: boolean; timing?: any }) {
  if (!exists || !timing) return <EmptyState icon="⏱️" title="No timing data" description="Timing data is generated after casework runs" />

  const totalSec = timing.totalSeconds || 0
  const formatDuration = (s: number) => {
    if (s >= 60) return `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`
    return `${Math.round(s)}s`
  }

  // Support both v2 (phases) and v1 (steps) timing.json
  const phaseData = timing.phases || timing.steps || {}
  const stats = timing.stats

  // Ordered step definitions matching casework SKILL.md flow
  // Fast path:  init → changegate → decision → fastpath → dataGathering → inspection (Step 1 → 4)
  // Normal path: init → changegate → spawnAndPrep → compliance → waitAgents → statusJudge → routing → dataGathering → inspection (Step 1 → B1-B5 → 4)
  type StepDef = { key: string; step: string; label: string; category: 'setup' | 'detect' | 'llm' | 'work' | 'wait' | 'output' }

  const fastPathSteps: StepDef[] = [
    { key: 'init',          step: '1',  label: 'mkdir logs + 写起始时间戳',            category: 'setup' },
    { key: 'changegate',    step: '1',  label: '比对 emails/notes/ICM 变化',          category: 'detect' },
    { key: 'decision',      step: '1a', label: '判断 NO_CHANGE → 快速/正常路径',      category: 'llm' },
    { key: 'fastpath',      step: '1a', label: '验证 Teams/合规/Judge/路由缓存',       category: 'detect' },
    { key: 'dataGathering', step: '4',  label: '读 case-info/emails/notes/teams → 构思',  category: 'llm' },
    { key: 'inspection',    step: '4',  label: 'summary + todo + timing',        category: 'output' },
  ]

  const normalPathSteps: StepDef[] = [
    { key: 'init',          step: '1',    label: 'mkdir logs + 写起始时间戳',                    category: 'setup' },
    { key: 'changegate',    step: '1',    label: '比对 emails/notes/ICM 变化',                   category: 'detect' },
    { key: 'spawnAndPrep',  step: 'B1-2', label: 'Spawn DR + TS agents → 预读 SKILLs',          category: 'work' },
    { key: 'compliance',    step: 'B3',   label: '检查 Entitlement + 21v Convert',               category: 'work' },
    { key: 'waitAgents',    step: 'B4',   label: '等待 data-refresh + teams-search 完成',         category: 'wait' },
    { key: 'statusJudge',   step: 'B4',   label: '分析 emails/notes → 判断 actualStatus',        category: 'work' },
    { key: 'routing',       step: 'B5',   label: '按 status 路由 → spawn troubleshooter/drafter', category: 'work' },
    { key: 'dataGathering', step: '4',    label: '读 case-info/emails/notes/teams → 构思',        category: 'llm' },
    { key: 'inspection',    step: '4',    label: 'summary + todo + timing',                 category: 'output' },
  ]

  // Detect source: v2-events from .casework/events/, v1 from timing.json
  const isV2Events = timing.source === 'v2-events'

  // v2 events step definitions (data-refresh parallel sources)
  const v2EventSteps: StepDef[] = [
    { key: 'd365',         step: '1',  label: 'D365 数据拉取（emails/notes/labor）',    category: 'work' },
    { key: 'teams',        step: '1',  label: 'Teams 搜索（agency proxy）',              category: 'work' },
    { key: 'icm',          step: '1',  label: 'ICM Discussion 拉取',                    category: 'work' },
    { key: 'onenote',      step: '1',  label: 'OneNote 搜索（ripgrep）',                 category: 'work' },
    { key: 'attachments',  step: '1',  label: '附件下载（DTM token）',                   category: 'work' },
    { key: 'data-refresh', step: '1',  label: 'Step 1 Data Refresh 总耗时',             category: 'output' },
    { key: 'assess',       step: '2',  label: 'Step 2 Assess（状态判断 + 行动规划）',     category: 'llm' },
    { key: 'act',          step: '3',  label: 'Step 3 Act（troubleshooter/email spawn）', category: 'wait' },
    { key: 'summarize',    step: '4',  label: 'Step 4 Summarize（summary + todo）',      category: 'output' },
  ]

  // Detect path: fastpath phase exists → fast path, otherwise normal
  const isFastPath = !isV2Events && ('fastpath' in phaseData || 'decision' in phaseData)
  const stepDefs = isV2Events ? v2EventSteps : (isFastPath ? fastPathSteps : normalPathSteps)

  // v1 fallback: if phaseData has old keys (steps), use flat rendering
  const isV1 = !timing.phases && timing.steps
  const v1Steps: StepDef[] = Object.keys(phaseData).map((k, i) => ({
    key: k, step: `${i + 1}`, label: k, category: 'work' as const,
  }))

  const steps = isV1 ? v1Steps : stepDefs.filter(s => s.key in phaseData)

  const categoryStyles: Record<string, { color: string; bg: string; dot: string }> = {
    setup:  { color: 'var(--text-secondary)',           bg: 'var(--bg-hover)',              dot: 'var(--text-tertiary)' },
    detect: { color: 'var(--accent-blue)',              bg: 'rgba(107,163,232,0.15)',       dot: 'var(--accent-blue)' },
    llm:    { color: 'var(--accent-purple, #9e8cc7)',   bg: 'rgba(158,140,199,0.15)',       dot: 'var(--accent-purple, #9e8cc7)' },
    work:   { color: 'var(--accent-green)',             bg: 'rgba(92,191,138,0.15)',        dot: 'var(--accent-green)' },
    wait:   { color: 'var(--accent-amber)',             bg: 'rgba(212,164,74,0.15)',        dot: 'var(--accent-amber)' },
    output: { color: 'var(--accent-cyan, #06b6d4)',    bg: 'rgba(6,182,212,0.15)',         dot: 'var(--accent-cyan, #06b6d4)' },
  }

  return (
    <div className="space-y-4">
      {/* Summary card */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Casework Timing</h4>
            {!isV1 && (
              <span className="text-xs px-1.5 py-0.5 rounded font-mono" style={{
                background: isV2Events ? 'rgba(107,163,232,0.15)' : (isFastPath ? 'rgba(212,164,74,0.15)' : 'rgba(92,191,138,0.15)'),
                color: isV2Events ? 'var(--accent-blue)' : (isFastPath ? 'var(--accent-amber)' : 'var(--accent-green)'),
              }}>
                {isV2Events ? '📊 v2 Events' : (isFastPath ? '⚡ Fast Path' : '🔄 Normal')}
              </span>
            )}
          </div>
          <span className="text-lg font-mono font-bold" style={{ color: 'var(--accent-blue)' }}>{formatDuration(totalSec)}</span>
        </div>
        <div className="text-xs space-y-1" style={{ color: 'var(--text-tertiary)' }}>
          {timing.caseworkStartedAt && <p>Started: {new Date(timing.caseworkStartedAt).toLocaleString()}</p>}
          {timing.caseworkCompletedAt && <p>Completed: {new Date(timing.caseworkCompletedAt).toLocaleString()}</p>}
        </div>
        {/* Stats row */}
        {stats && (stats.bashCalls > 0 || stats.toolCalls > 0 || stats.agentSpawns > 0) && (
          <div className="flex gap-4 mt-2 pt-2" style={{ borderTop: '1px solid var(--border-primary)' }}>
            {stats.toolCalls > 0 && (
              <span className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>
                🔧 Tools: {stats.toolCalls}
              </span>
            )}
            {stats.bashCalls > 0 && (
              <span className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>
                💻 Bash: {stats.bashCalls}
              </span>
            )}
            {stats.agentSpawns > 0 && (
              <span className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>
                🤖 Agents: {stats.agentSpawns}
              </span>
            )}
          </div>
        )}
      </Card>

      {/* Pipeline breakdown */}
      {steps.length > 0 && (
        <Card>
          <h4 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Pipeline</h4>
          <div className="relative">
            {(() => {
              // Group steps by step number for v2 (Step 1 has sub-steps)
              const isGrouped = isV2Events
              // Step 1 sub-items vs main steps
              const step1Subs = isGrouped ? steps.filter(s => s.step === '1' && s.key !== 'data-refresh') : []
              const step1Total = isGrouped ? steps.find(s => s.key === 'data-refresh') : null
              const mainSteps = isGrouped ? steps.filter(s => s.step !== '1') : steps

              const renderStep = (s: StepDef, isSubStep: boolean, isLast: boolean) => {
                const phase = phaseData[s.key] || { seconds: 0 }
                const sec = phase.seconds || phase.durationSec || 0
                const pct = totalSec > 0 ? (sec / totalSec) * 100 : 0
                const style = categoryStyles[s.category] || categoryStyles.work
                const statusIcon = phase.status === 'completed' ? '' : (phase.status === 'active' ? '⏳' : '')

                return (
                  <div key={s.key} className="relative flex" style={{ minHeight: isSubStep ? '2.2rem' : '3rem', marginLeft: isSubStep ? '1.5rem' : 0 }}>
                    <div className="flex flex-col items-center" style={{ width: '2rem', flexShrink: 0 }}>
                      <div style={{
                        width: isSubStep ? 6 : 10, height: isSubStep ? 6 : 10, borderRadius: '50%',
                        background: style.dot, flexShrink: 0, marginTop: isSubStep ? 6 : 4,
                        boxShadow: isSubStep ? 'none' : `0 0 0 3px ${style.bg}`,
                      }} />
                      {!isLast && (
                        <div style={{ width: isSubStep ? 1 : 2, flex: 1, background: 'var(--border-default)', marginTop: 2, marginBottom: 2 }} />
                      )}
                    </div>
                    <div className="flex-1 pb-2 ml-1" style={{ minWidth: 0 }}>
                      <div className="flex items-center gap-2 text-sm">
                        {!isSubStep && (
                          <span className="font-mono text-xs px-1 py-0.5 rounded shrink-0" style={{ background: style.bg, color: style.color, minWidth: '2rem', textAlign: 'center' }}>
                            {s.step}
                          </span>
                        )}
                        <span className={`truncate ${isSubStep ? 'text-xs' : ''}`} style={{ color: 'var(--text-secondary)' }}>
                          {statusIcon}{phase.label || s.label}
                        </span>
                        <span className="ml-auto flex items-center gap-1.5 shrink-0">
                          {!isSubStep && pct >= 1 && (
                            <span className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>{Math.round(pct)}%</span>
                          )}
                          <span className={`font-mono ${isSubStep ? 'text-xs' : 'font-medium'}`} style={{ color: style.color, minWidth: '3rem', textAlign: 'right' }}>
                            {sec > 0 ? formatDuration(sec) : (phase.status === 'active' ? 'timeout' : '0s')}
                          </span>
                        </span>
                      </div>
                      {!isSubStep && sec > 0 && (
                        <div className="mt-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-hover)' }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${Math.max(pct, 2)}%`, background: style.color }} />
                        </div>
                      )}
                    </div>
                  </div>
                )
              }

              return (
                <>
                  {isGrouped && step1Total && (
                    <>
                      {renderStep({ ...step1Total, label: 'Step 1 Data Refresh（并行数据收集）' }, false, false)}
                      {step1Subs.map((s, i) => renderStep(s, true, i === step1Subs.length - 1 && mainSteps.length === 0))}
                    </>
                  )}
                  {mainSteps.filter(s => s.key in phaseData).map((s, idx, arr) => renderStep(s, false, idx === arr.length - 1))}
                </>
              )
            })()}
          </div>

          {/* Category legend */}
          <div className="flex flex-wrap gap-3 mt-3 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            {(['detect', 'work', 'llm', 'wait', 'output'] as const).filter(cat =>
              steps.some(s => s.category === cat)
            ).map(cat => {
              const names: Record<string, string> = { detect: 'Detection', work: 'Execution', llm: 'LLM Thinking', wait: 'Waiting', output: 'Output', setup: 'Setup' }
              const style = categoryStyles[cat]
              return (
                <span key={cat} className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: style.dot, display: 'inline-block' }} />
                  {names[cat]}
                </span>
              )
            })}
          </div>
        </Card>
      )}

      {/* Skipped steps */}
      {timing.skippedSteps?.length > 0 && (
        <Card>
          <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Skipped</h4>
          <div className="flex flex-wrap gap-2">
            {(Array.isArray(timing.skippedSteps[0]) ? timing.skippedSteps.flat() : timing.skippedSteps).map((s: string) => (
              <Badge key={s} variant="secondary" size="xs">{s}</Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Errors */}
      {timing.errors?.filter((e: any) => e && (typeof e === 'string' ? e : true)).length > 0 && (
        <Card style={{ borderColor: 'var(--accent-red)' }}>
          <h4 className="font-semibold mb-2" style={{ color: 'var(--accent-red)' }}>Errors</h4>
          <ul className="text-sm space-y-1" style={{ color: 'var(--accent-red)' }}>
            {timing.errors.filter((e: any) => e && (typeof e === 'string')).map((e: string, i: number) => (
              <li key={i}>• {e}</li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}

function LogsTab({ logs }: { logs: Array<{ filename: string; content: string; size: number; updatedAt: string }> }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [logSearch, setLogSearch] = useState('')

  if (logs.length === 0) return <EmptyState icon="📄" title="No logs" description="Logs are generated during casework execution" />

  const toggle = (name: string) => {
    const next = new Set(expanded)
    next.has(name) ? next.delete(name) : next.add(name)
    setExpanded(next)
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`
    return `${(bytes / 1024).toFixed(1)}KB`
  }

  const filteredLogs = logSearch
    ? logs.filter(l => l.filename.toLowerCase().includes(logSearch.toLowerCase()) || l.content.toLowerCase().includes(logSearch.toLowerCase()))
    : logs

  // Group logs by step name (extract from filename: YYYY-MM-DD_HH-mm_<step>.log)
  const groupedLogs = filteredLogs.reduce((acc, log) => {
    const stepMatch = log.filename.match(/_([^_]+)\.log$/)
    const step = stepMatch?.[1] || 'other'
    if (!acc[step]) acc[step] = []
    acc[step].push(log)
    return acc
  }, {} as Record<string, typeof logs>)

  return (
    <div className="space-y-3">
      {logs.length > 3 && (
        <input
          type="text"
          value={logSearch}
          onChange={(e) => setLogSearch(e.target.value)}
          placeholder="Search logs..."
          className="w-full px-3 py-1.5 text-sm rounded-lg focus:outline-none focus:ring-2"
          style={{ border: '1px solid var(--border-default)', boxShadow: 'none', outlineColor: 'var(--accent-blue)', '--tw-ring-color': 'var(--accent-blue)' } as React.CSSProperties}
        />
      )}

      {Object.entries(groupedLogs).map(([step, stepLogs]) => (
        <div key={step}>
          {Object.keys(groupedLogs).length > 1 && (
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-tertiary)' }}>
              {step} ({stepLogs.length})
            </h4>
          )}
          {stepLogs.map(log => (
            <Card key={log.filename} padding="sm" className="mb-2">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggle(log.filename)}
              >
                <div className="flex items-center gap-2">
                  <span>📄</span>
                  <span className="font-mono text-sm" style={{ color: 'var(--text-primary)' }}>{log.filename}</span>
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{formatSize(log.size)}</span>
                </div>
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{new Date(log.updatedAt).toLocaleString()}</span>
              </div>
              {expanded.has(log.filename) && (
                <pre
                  className="mt-3 pt-3 text-xs whitespace-pre-wrap overflow-x-auto max-h-96 overflow-y-auto font-mono p-3 rounded"
                  style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', background: 'var(--bg-inset)' }}
                >
                  {log.content}
                </pre>
              )}
            </Card>
          ))}
        </div>
      ))}
    </div>
  )
}

function AttachmentsTab({ files, meta, caseNumber }: { files: Array<{ filename: string; size: number; updatedAt: string }>; meta?: any; caseNumber: string }) {
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`
  }

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase() || ''
    const icons: Record<string, string> = {
      pdf: '📕', png: '🖼️', jpg: '🖼️', jpeg: '🖼️', gif: '🖼️', bmp: '🖼️', svg: '🖼️',
      txt: '📄', log: '📄', md: '📄', csv: '📊',
      json: '📋', xml: '📋', html: '🌐', htm: '🌐',
      zip: '📦', '7z': '📦', rar: '📦', tar: '📦', gz: '📦',
      doc: '📘', docx: '📘', xls: '📗', xlsx: '📗', ppt: '📙', pptx: '📙',
      msg: '📧', eml: '📧',
      pcap: '🔍', pcapng: '🔍', har: '🔍', evtx: '🔍',
    }
    return icons[ext] || '📎'
  }

  const handleDownload = async (filename: string) => {
    const token = localStorage.getItem('eb_token')
    const url = `/api/cases/${caseNumber}/attachments/${encodeURIComponent(filename)}`
    try {
      const res = await fetch(url, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      })
      if (!res.ok) throw new Error(`Download failed: ${res.status}`)
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)

      // Open in new tab for previewable types, download for others
      const previewable = /\.(pdf|png|jpg|jpeg|gif|svg|txt|log|md|json|xml|html|htm|csv)$/i
      if (previewable.test(filename)) {
        window.open(blobUrl, '_blank')
      } else {
        const a = document.createElement('a')
        a.href = blobUrl
        a.download = filename
        a.click()
      }
      // Clean up blob URL after a short delay
      setTimeout(() => URL.revokeObjectURL(blobUrl), 30000)
    } catch {
      // Fallback: direct link (may fail if auth required)
      window.open(url, '_blank')
    }
  }

  if (files.length === 0 && !meta) return <EmptyState icon="📎" title="No attachments" description="Attachments are downloaded during data-refresh" />

  return (
    <div className="space-y-4">
      {/* File list */}
      {files.length > 0 && (
        <Card>
          <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Downloaded Files ({files.length})</h4>
          <div>
            {files.map((f, i) => (
              <div
                key={f.filename}
                className="flex items-center justify-between py-2 group"
                style={i > 0 ? { borderTop: '1px solid var(--border-subtle)' } : undefined}
              >
                <button
                  onClick={() => handleDownload(f.filename)}
                  className="flex items-center gap-2 min-w-0 text-left transition-colors"
                  onMouseEnter={e => {
                    const nameSpan = e.currentTarget.querySelector('[data-name]') as HTMLElement
                    if (nameSpan) nameSpan.style.color = 'var(--accent-blue)'
                  }}
                  onMouseLeave={e => {
                    const nameSpan = e.currentTarget.querySelector('[data-name]') as HTMLElement
                    if (nameSpan) nameSpan.style.color = 'var(--text-primary)'
                  }}
                >
                  <span>{getFileIcon(f.filename)}</span>
                  <span
                    data-name
                    className="text-sm truncate"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {f.filename}
                  </span>
                </button>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{formatSize(f.size)}</span>
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{new Date(f.updatedAt).toLocaleString()}</span>
                  <button
                    onClick={() => handleDownload(f.filename)}
                    className="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: 'var(--accent-blue)' }}
                  >
                    Open
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Meta info */}
      {meta && (
        <Card>
          <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Attachment Metadata</h4>
          <pre
            className="text-xs p-3 rounded overflow-x-auto max-h-48 overflow-y-auto font-mono"
            style={{ color: 'var(--text-secondary)', background: 'var(--bg-inset)' }}
          >
            {JSON.stringify(meta, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  )
}
