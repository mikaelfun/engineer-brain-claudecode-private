/**
 * CaseDetail — Case 详情页 (多 tab)
 */
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Circle, AlertTriangle, FolderOpen, Clock, RefreshCw } from 'lucide-react'
import { Tabs } from '../components/common/Tabs'
import { Card, CardHeader } from '../components/common/Card'
import { SeverityBadge, CaseStatusBadge, SlaBadge, Badge, HealthScoreBadge } from '../components/common/Badge'
import { Loading, ErrorState, EmptyState } from '../components/common/Loading'
import {
  useCaseDetail, useCaseEmails, useCaseNotes,
  useCaseTeams, useCaseMeta, useCaseAnalysis,
  useCaseDrafts, useCaseInspection, useCaseTodo, useCaseTodoFile,
  useCaseTiming, useCaseLogs, useCaseAttachments,
  useToggleCaseTodo
} from '../api/hooks'
import MarkdownContent from '../components/common/MarkdownContent'
import CaseAIPanel from '../components/CaseAIPanel'

export default function CaseDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('inspection')

  const { data: caseInfo, isLoading, error } = useCaseDetail(id || '')
  // Always-fetch: key tab data for badge counts (lightweight — only returns arrays)
  const { data: emailsData } = useCaseEmails(id || '')
  const { data: notesData } = useCaseNotes(id || '')
  const { data: todoData } = useCaseTodo(id || '')
  const { data: draftsData } = useCaseDrafts(id || '')
  const { data: logsData } = useCaseLogs(id || '')
  const { data: attachmentsData } = useCaseAttachments(id || '')
  // Lazy-load: only fetch heavier tab data when its tab is active
  const { data: teamsData } = useCaseTeams(activeTab === 'teams' ? (id || '') : '')
  const { data: meta } = useCaseMeta(id || '') // always needed for SLA indicators
  const { data: analysisData } = useCaseAnalysis(activeTab === 'analysis' ? (id || '') : '')
  const { data: inspectionData } = useCaseInspection(id || '')
  const toggleCaseTodo = useToggleCaseTodo(id || '')
  const { data: timingData } = useCaseTiming(activeTab === 'timing' ? (id || '') : '')

  if (isLoading) return <Loading text="Loading case..." />
  if (error || !caseInfo) return <ErrorState message="Case not found" onRetry={() => navigate('/')} />

  const tabs = [
    { id: 'inspection', label: 'Inspection', icon: '🩺' },
    { id: 'todo', label: 'Todo', icon: '📌', count: todoData?.total },
    { id: 'emails', label: 'Emails', icon: '📧', count: emailsData?.total },
    { id: 'notes', label: 'Notes', icon: '📝', count: notesData?.total },
    { id: 'teams', label: 'Teams', icon: '💬', count: teamsData?.total },
    { id: 'drafts', label: 'Drafts', icon: '✉️', count: draftsData?.total },
    { id: 'analysis', label: 'Analysis', icon: '🔍' },
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
            onClick={() => navigate('/')}
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
      </div>

      {/* Main Content: Left (Tabs + Content) | Right (AI Panel) */}
      <div className="flex gap-4 items-start">
        {/* Left — Information area */}
        <div className="flex-1 min-w-0 space-y-4">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          <div>
            {activeTab === 'inspection' && <InspectionTab content={inspectionData?.content} exists={inspectionData?.exists} filename={inspectionData?.filename} updatedAt={inspectionData?.updatedAt} />}
            {activeTab === 'todo' && <CaseTodoTab caseId={id!} latest={todoData?.latest || null} files={todoData?.files || []} toggleTodo={toggleCaseTodo} />}
            {activeTab === 'emails' && <EmailsTab emails={emailsData?.emails || []} />}
            {activeTab === 'notes' && <NotesTab notes={notesData?.notes || []} />}
            {activeTab === 'teams' && <TeamsTab chats={teamsData?.chats || []} />}
            {activeTab === 'drafts' && <DraftsTab drafts={draftsData?.drafts || []} />}
            {activeTab === 'analysis' && <AnalysisTab content={analysisData?.content} exists={analysisData?.exists} />}
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

function EmailsTab({ emails }: { emails: any[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  if (emails.length === 0) return <EmptyState icon="📧" title="No emails" />

  const toggle = (id: string) => {
    const next = new Set(expanded)
    next.has(id) ? next.delete(id) : next.add(id)
    setExpanded(next)
  }

  return (
    <div className="space-y-3">
      {emails.map((email, i) => (
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
            </div>
          </div>
          {expanded.has(email.id || String(i)) && (
            <div
              className="mt-3 pt-3 text-sm whitespace-pre-wrap"
              style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
            >
              {email.body || '(No body)'}
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}

function NotesTab({ notes }: { notes: any[] }) {
  if (notes.length === 0) return <EmptyState icon="📝" title="No notes" />

  return (
    <div className="space-y-3">
      {notes.map((note, i) => (
        <Card key={note.id || i} padding="sm">
          <div className="flex items-center gap-2 mb-2">
            <span>📝</span>
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{note.date}</span>
            <Badge variant="secondary" size="xs">{note.author}</Badge>
          </div>
          {note.title && note.title !== '(no title)' && (
            <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{note.title}</p>
          )}
          <p className="text-sm whitespace-pre-wrap mt-1" style={{ color: 'var(--text-secondary)' }}>{note.body}</p>
        </Card>
      ))}
    </div>
  )
}

function TeamsTab({ chats }: { chats: any[] }) {
  const [searchTerm, setSearchTerm] = useState('')

  if (chats.length === 0) return <EmptyState icon="💬" title="No Teams chats" description="Teams data will appear after running casework or teams-search" />

  const filteredChats = searchTerm
    ? chats.filter(c => c.content?.toLowerCase().includes(searchTerm.toLowerCase()) || c.chatId?.toLowerCase().includes(searchTerm.toLowerCase()))
    : chats

  const highlightText = (text: string) => {
    if (!searchTerm) return text
    const parts = text.split(new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))
    return parts.map((part, i) =>
      part.toLowerCase() === searchTerm.toLowerCase()
        ? <mark key={i} className="px-0.5 rounded" style={{ background: 'var(--accent-amber-dim)' }}>{part}</mark>
        : part
    )
  }

  return (
    <div className="space-y-3">
      {chats.length > 1 && (
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search chats..."
          className="w-full px-3 py-1.5 text-sm rounded-lg focus:outline-none focus:ring-2"
          style={{ border: '1px solid var(--border-default)', boxShadow: 'none', outlineColor: 'var(--accent-blue)', '--tw-ring-color': 'var(--accent-blue)' } as React.CSSProperties}
        />
      )}

      {filteredChats.length === 0 ? (
        <p className="text-sm text-center py-4" style={{ color: 'var(--text-tertiary)' }}>No matches for &ldquo;{searchTerm}&rdquo;</p>
      ) : (
        filteredChats.map((chat, i) => (
          <Card key={chat.chatId || i} padding="sm">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>Chat: {chat.chatId}</h4>
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{chat.content?.split('\n').length || 0} messages</span>
            </div>
            <div className="text-sm whitespace-pre-wrap max-h-96 overflow-y-auto" style={{ color: 'var(--text-secondary)' }}>
              {searchTerm ? highlightText(chat.content || '') : chat.content}
            </div>
          </Card>
        ))
      )}
    </div>
  )
}

function DraftsTab({ drafts }: { drafts: any[] }) {
  if (drafts.length === 0) return <EmptyState icon="✉️" title="No drafts" />

  return (
    <div className="space-y-3">
      {drafts.map((draft, i) => (
        <Card key={i} padding="sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs" style={{ color: 'var(--text-tertiary)' }}>{draft.filename}</span>
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{new Date(draft.createdAt).toLocaleString()}</span>
          </div>
          <MarkdownContent>{draft.content}</MarkdownContent>
        </Card>
      ))}
    </div>
  )
}

function AnalysisTab({ content, exists }: { content?: string; exists?: boolean }) {
  if (!exists || !content) return <EmptyState icon="🔍" title="No analysis report" description="Run the troubleshooter agent to generate an analysis" />

  return (
    <Card>
      <MarkdownContent>{content}</MarkdownContent>
    </Card>
  )
}

function InspectionTab({ content, exists, filename, updatedAt }: { content?: string; exists?: boolean; filename?: string; updatedAt?: string }) {
  if (!exists || !content) return <EmptyState icon="🩺" title="No inspection report" description="Run casework to generate an inspection" />

  return (
    <Card>
      <div className="flex items-center justify-between mb-3 text-xs" style={{ color: 'var(--text-tertiary)' }}>
        <span className="font-mono">{filename}</span>
        {updatedAt && <span>{new Date(updatedAt).toLocaleString()}</span>}
      </div>
      <MarkdownContent>{content}</MarkdownContent>
    </Card>
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

  const stepLabels: Record<string, { label: string; icon: string }> = {
    dataRefresh: { label: 'Data Refresh', icon: '🔄' },
    teamsSearch: { label: 'Teams Search', icon: '💬' },
    complianceCheck: { label: 'Compliance Check', icon: '✅' },
    statusJudge: { label: 'Status Judge', icon: '🔍' },
    troubleshooter: { label: 'Troubleshooter', icon: '🔧' },
    emailDrafter: { label: 'Email Drafter', icon: '📧' },
    inspectionWriter: { label: 'Inspection Writer', icon: '📝' },
  }

  const stepColors = [
    'var(--accent-blue)', 'var(--accent-green)', 'var(--accent-amber)',
    'var(--accent-purple, #a855f7)', 'var(--accent-red)', 'var(--accent-cyan, #06b6d4)', 'var(--accent-amber)'
  ]

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Casework Timing</h4>
          <span className="text-lg font-mono font-bold" style={{ color: 'var(--accent-blue)' }}>{formatDuration(totalSec)}</span>
        </div>
        <div className="text-xs space-y-1" style={{ color: 'var(--text-tertiary)' }}>
          {timing.caseworkStartedAt && <p>Started: {new Date(timing.caseworkStartedAt).toLocaleString()}</p>}
          {timing.caseworkCompletedAt && <p>Completed: {new Date(timing.caseworkCompletedAt).toLocaleString()}</p>}
        </div>
      </Card>

      {/* Step breakdown */}
      {timing.steps && (
        <Card>
          <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Step Breakdown</h4>
          <div className="space-y-2">
            {Object.entries(timing.steps).map(([name, step]: [string, any], idx: number) => {
              const pct = totalSec > 0 ? (step.seconds / totalSec) * 100 : 0
              const label = stepLabels[name] || { label: name, icon: '⚙️' }
              const barColor = stepColors[idx % stepColors.length]
              return (
                <div key={name}>
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {label.icon} {label.label}
                    </span>
                    <span className="font-mono" style={{ color: 'var(--text-tertiary)' }}>{formatDuration(step.seconds)}</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-hover)' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${Math.max(pct, 1)}%`, background: barColor }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Skipped steps */}
      {timing.skippedSteps?.length > 0 && (
        <Card>
          <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Skipped Steps</h4>
          <div className="flex flex-wrap gap-2">
            {timing.skippedSteps.map((s: string) => (
              <Badge key={s} variant="secondary" size="xs">{s}</Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Errors */}
      {timing.errors?.length > 0 && (
        <Card style={{ borderColor: 'var(--accent-red)' }}>
          <h4 className="font-semibold mb-2" style={{ color: 'var(--accent-red)' }}>Errors</h4>
          <ul className="text-sm space-y-1" style={{ color: 'var(--accent-red)' }}>
            {timing.errors.map((e: string, i: number) => (
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
