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
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import CaseAIPanel from '../components/CaseAIPanel'

export default function CaseDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('info')

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
  const { data: inspectionData } = useCaseInspection(activeTab === 'inspection' ? (id || '') : '')
  const toggleCaseTodo = useToggleCaseTodo(id || '')
  const { data: timingData } = useCaseTiming(activeTab === 'timing' ? (id || '') : '')

  if (isLoading) return <Loading text="Loading case..." />
  if (error || !caseInfo) return <ErrorState message="Case not found" onRetry={() => navigate('/')} />

  const tabs = [
    { id: 'info', label: 'Info', icon: '📋' },
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
  ]

  return (
    <div className="space-y-4">
      {/* Compact Header Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        {/* Row 1: Back + Title + Health Score */}
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate('/')}
            className="mt-1 p-1 hover:bg-gray-100 rounded-lg flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </button>
          <h2 className="text-lg font-bold text-gray-900 leading-snug flex-1 min-w-0">
            {caseInfo.title}
          </h2>
          {meta && <HealthScoreBadge meta={meta} />}
        </div>

        {/* Row 2: Metadata chips */}
        <div className="flex items-center gap-1.5 flex-wrap mt-2 ml-9 text-xs">
          <span className="font-mono text-gray-500">{id}</span>
          <span className="text-gray-300">·</span>
          <SeverityBadge severity={caseInfo.severity} />
          <CaseStatusBadge status={caseInfo.status} />
          {meta?.actualStatus && meta.actualStatus !== caseInfo.status?.toLowerCase() && (
            <Badge variant="info" size="xs">{meta.actualStatus}</Badge>
          )}
          <span className="text-gray-300">·</span>
          <span className="text-gray-600">{caseInfo.assignedTo}</span>
          <span className="text-gray-300">·</span>
          <span className="text-gray-600">{caseInfo.caseAge || '0 days'}</span>
          {meta?.daysSinceLastContact != null && meta.daysSinceLastContact > 0 && (
            <>
              <span className="text-gray-300">·</span>
              <span className={`${meta.daysSinceLastContact > 3 ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                Last contact {meta.daysSinceLastContact}d ago
              </span>
            </>
          )}
        </div>

        {/* Row 3: Timestamps */}
        <div className="flex items-center gap-3 flex-wrap mt-1.5 ml-9 text-xs text-gray-400">
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
          <div className="flex items-center gap-1.5 mt-2 ml-9 text-xs text-gray-500">
            <FolderOpen className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="truncate" title={caseInfo.sap}>{caseInfo.sap}</span>
          </div>
        )}

        {/* Row 5: SLA indicators (integrated into header) */}
        {meta && (
          <div className="flex items-center gap-3 mt-2.5 ml-9 pt-2.5 border-t border-gray-100 text-xs">
            <div className="flex items-center gap-1">
              <span className="text-gray-400">IR:</span>
              <SlaBadge status={meta.irSla?.status || 'unknown'} />
              {meta.irSla?.remaining && (
                <span className="text-gray-400 ml-0.5">{meta.irSla.remaining}</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-400">FWR:</span>
              <SlaBadge status={meta.fwr?.status || 'unknown'} />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-400">FDR:</span>
              <SlaBadge status={meta.fdr?.status || 'unknown'} />
            </div>
            {meta.teams_chat_count > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-gray-400">Teams:</span>
                <Badge variant="purple" size="xs">{meta.teams_chat_count} chats</Badge>
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Panel */}
      <CaseAIPanel caseNumber={id!} />

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === 'info' && <InfoTab caseInfo={caseInfo} />}
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
      </div>
    </div>
  )
}

function InfoTab({ caseInfo }: { caseInfo: any }) {
  const sections = [
    { title: 'Basic Info', fields: [
      ['Case Number', caseInfo.caseNumber],
      ['Title', caseInfo.title],
      ['Severity', caseInfo.severity],
      ['Status', caseInfo.status],
      ['SAP', caseInfo.sap],
      ['24x7', caseInfo.is24x7],
      ['Assigned To', caseInfo.assignedTo],
      ['Created', caseInfo.createdOn],
      ['Case Age', caseInfo.caseAge],
      ['Active Hours', caseInfo.activeHours],
      ['Origin', caseInfo.origin],
      ['Timezone', caseInfo.timezone],
      ['Country', caseInfo.country],
    ]},
    { title: 'Contact', fields: [
      ['Name', caseInfo.contact?.name],
      ['Email', caseInfo.contact?.email],
      ['Phone', caseInfo.contact?.phone],
      ['Preferred', caseInfo.contact?.preferredMethod],
    ]},
    { title: 'Customer', fields: [
      ['Customer', caseInfo.customer],
    ]},
    { title: 'Counts', fields: [
      ['Emails', caseInfo.emailCount],
      ['Notes', caseInfo.noteCount],
      ['Phone Calls', caseInfo.phoneCallCount],
      ['Labor', caseInfo.laborCount],
      ['ICM', caseInfo.icmCount],
      ['Attachments', caseInfo.attachmentCount],
    ]},
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {sections.map(s => (
        <Card key={s.title}>
          <h4 className="font-semibold text-gray-900 mb-3">{s.title}</h4>
          <table className="w-full text-sm">
            <tbody>
              {s.fields.filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => (
                <tr key={k as string} className="border-b border-gray-50">
                  <td className="py-1.5 pr-3 text-gray-500 whitespace-nowrap">{k}</td>
                  <td className="py-1.5 text-gray-900 break-all">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ))}
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
                <span className="text-xs text-gray-400">{email.date}</span>
              </div>
              <p className="font-medium text-gray-900 text-sm mt-1 truncate">{email.subject}</p>
              {email.from && <p className="text-xs text-gray-500">From: {email.from}</p>}
            </div>
          </div>
          {expanded.has(email.id || String(i)) && (
            <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-700 whitespace-pre-wrap">
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
            <span className="text-xs text-gray-400">{note.date}</span>
            <Badge variant="secondary" size="xs">{note.author}</Badge>
          </div>
          {note.title && note.title !== '(no title)' && (
            <p className="font-medium text-gray-900 text-sm">{note.title}</p>
          )}
          <p className="text-sm text-gray-700 whitespace-pre-wrap mt-1">{note.body}</p>
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
        ? <mark key={i} className="bg-yellow-200 px-0.5 rounded">{part}</mark>
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
          className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      )}

      {filteredChats.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">No matches for "{searchTerm}"</p>
      ) : (
        filteredChats.map((chat, i) => (
          <Card key={chat.chatId || i} padding="sm">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm text-gray-900">Chat: {chat.chatId}</h4>
              <span className="text-xs text-gray-400">{chat.content?.split('\n').length || 0} messages</span>
            </div>
            <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-96 overflow-y-auto">
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
            <span className="font-mono text-xs text-gray-500">{draft.filename}</span>
            <span className="text-xs text-gray-400">{new Date(draft.createdAt).toLocaleString()}</span>
          </div>
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{draft.content}</ReactMarkdown>
          </div>
        </Card>
      ))}
    </div>
  )
}

function AnalysisTab({ content, exists }: { content?: string; exists?: boolean }) {
  if (!exists || !content) return <EmptyState icon="🔍" title="No analysis report" description="Run the troubleshooter agent to generate an analysis" />

  return (
    <Card>
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    </Card>
  )
}

function InspectionTab({ content, exists, filename, updatedAt }: { content?: string; exists?: boolean; filename?: string; updatedAt?: string }) {
  if (!exists || !content) return <EmptyState icon="🩺" title="No inspection report" description="Run casework to generate an inspection" />

  return (
    <Card>
      <div className="flex items-center justify-between mb-3 text-xs text-gray-400">
        <span className="font-mono">{filename}</span>
        {updatedAt && <span>{new Date(updatedAt).toLocaleString()}</span>}
      </div>
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
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
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>History:</span>
          {files.map(f => (
            <button
              key={f.filename}
              onClick={() => setSelectedFile(f.filename === latest.filename ? null : f.filename)}
              className={`px-2 py-0.5 rounded font-mono ${
                (!selectedFile && f.filename === latest.filename) || selectedFile === f.filename
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {f.filename}
            </button>
          ))}
        </div>
      )}

      {/* Loading state for historical file */}
      {isHistorical && histLoading && (
        <div className="py-4 text-center text-sm text-gray-400">Loading historical todo...</div>
      )}

      {/* Content card */}
      {!(isHistorical && histLoading) && (
        <Card>
          <div className="flex items-center justify-between mb-3 text-xs text-gray-400">
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
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    {section.title}
                  </h4>
                  <div className="space-y-1">
                    {section.items.map((item, ii) => (
                      <div
                        key={ii}
                        className={`flex items-start gap-2 p-2 rounded-lg ${
                          section.type === 'green' ? 'bg-green-50' :
                          item.checked ? 'bg-gray-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        {section.type === 'green' || !isViewingLatest ? (
                          <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                            section.type === 'green' ? 'text-green-500' :
                            item.checked ? 'text-primary' : 'text-gray-300'
                          }`} />
                        ) : (
                          <button
                            onClick={() => handleToggle(item.lineNumber, item.checked)}
                            className="flex-shrink-0 mt-0.5"
                            disabled={toggleTodo.isPending}
                          >
                            {item.checked ? (
                              <CheckCircle2 className="w-5 h-5 text-primary" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-300 hover:text-primary" />
                            )}
                          </button>
                        )}
                        <p className={`text-sm flex-1 ${
                          item.checked || section.type === 'green'
                            ? 'text-gray-400 line-through'
                            : 'text-gray-900'
                        }`}>
                          {section.type === 'red' && !item.checked && (
                            <AlertTriangle className="w-3.5 h-3.5 text-red-500 inline mr-1" />
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
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayFile.content}</ReactMarkdown>
            </div>
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

function parseCaseTodoContent(content: string): Array<{
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

  const stepColors = ['bg-blue-400', 'bg-green-400', 'bg-amber-400', 'bg-purple-400', 'bg-rose-400', 'bg-cyan-400', 'bg-orange-400']

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-gray-900">Casework Timing</h4>
          <span className="text-lg font-mono font-bold text-blue-600">{formatDuration(totalSec)}</span>
        </div>
        <div className="text-xs text-gray-500 space-y-1">
          {timing.caseworkStartedAt && <p>Started: {new Date(timing.caseworkStartedAt).toLocaleString()}</p>}
          {timing.caseworkCompletedAt && <p>Completed: {new Date(timing.caseworkCompletedAt).toLocaleString()}</p>}
        </div>
      </Card>

      {/* Step breakdown */}
      {timing.steps && (
        <Card>
          <h4 className="font-semibold text-gray-900 mb-3">Step Breakdown</h4>
          <div className="space-y-2">
            {Object.entries(timing.steps).map(([name, step]: [string, any], idx: number) => {
              const pct = totalSec > 0 ? (step.seconds / totalSec) * 100 : 0
              const label = stepLabels[name] || { label: name, icon: '⚙️' }
              const barColor = stepColors[idx % stepColors.length]
              return (
                <div key={name}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">
                      {label.icon} {label.label}
                    </span>
                    <span className="text-gray-500 font-mono">{formatDuration(step.seconds)}</span>
                  </div>
                  <div className="mt-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${barColor} rounded-full transition-all`}
                      style={{ width: `${Math.max(pct, 1)}%` }}
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
          <h4 className="font-semibold text-gray-900 mb-2">Skipped Steps</h4>
          <div className="flex flex-wrap gap-2">
            {timing.skippedSteps.map((s: string) => (
              <Badge key={s} variant="secondary" size="xs">{s}</Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Errors */}
      {timing.errors?.length > 0 && (
        <Card className="border-red-200">
          <h4 className="font-semibold text-red-700 mb-2">Errors</h4>
          <ul className="text-sm text-red-600 space-y-1">
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
          className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      )}

      {Object.entries(groupedLogs).map(([step, stepLogs]) => (
        <div key={step}>
          {Object.keys(groupedLogs).length > 1 && (
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
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
                  <span className="font-mono text-sm text-gray-900">{log.filename}</span>
                  <span className="text-xs text-gray-400">{formatSize(log.size)}</span>
                </div>
                <span className="text-xs text-gray-400">{new Date(log.updatedAt).toLocaleString()}</span>
              </div>
              {expanded.has(log.filename) && (
                <pre className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-600 whitespace-pre-wrap overflow-x-auto max-h-96 overflow-y-auto font-mono bg-gray-50 p-3 rounded">
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
          <h4 className="font-semibold text-gray-900 mb-3">Downloaded Files ({files.length})</h4>
          <div className="divide-y divide-gray-100">
            {files.map(f => (
              <div key={f.filename} className="flex items-center justify-between py-2 group">
                <button
                  onClick={() => handleDownload(f.filename)}
                  className="flex items-center gap-2 min-w-0 text-left hover:text-blue-600 transition-colors"
                >
                  <span>{getFileIcon(f.filename)}</span>
                  <span className="text-sm text-gray-900 group-hover:text-blue-600 truncate">{f.filename}</span>
                </button>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-gray-400">{formatSize(f.size)}</span>
                  <span className="text-xs text-gray-400">{new Date(f.updatedAt).toLocaleString()}</span>
                  <button
                    onClick={() => handleDownload(f.filename)}
                    className="text-xs text-blue-500 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"
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
          <h4 className="font-semibold text-gray-900 mb-2">Attachment Metadata</h4>
          <pre className="text-xs text-gray-600 bg-gray-50 p-3 rounded overflow-x-auto max-h-48 overflow-y-auto font-mono">
            {JSON.stringify(meta, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  )
}
