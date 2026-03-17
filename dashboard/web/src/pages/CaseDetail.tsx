/**
 * CaseDetail — Case 详情页 (多 tab)
 */
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Sparkles, Loader2 } from 'lucide-react'
import { Tabs } from '../components/common/Tabs'
import { Card, CardHeader } from '../components/common/Card'
import { SeverityBadge, CaseStatusBadge, SlaBadge, Badge } from '../components/common/Badge'
import { Loading, ErrorState, EmptyState } from '../components/common/Loading'
import {
  useCaseDetail, useCaseEmails, useCaseNotes,
  useCaseTeams, useCaseMeta, useCaseAnalysis,
  useCaseDrafts, useAnalyzeCase
} from '../api/hooks'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import CaseAIPanel from '../components/CaseAIPanel'

export default function CaseDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('info')
  const [aiResult, setAiResult] = useState<string | null>(null)

  const { data: caseInfo, isLoading, error } = useCaseDetail(id || '')
  const { data: emailsData } = useCaseEmails(id || '')
  const { data: notesData } = useCaseNotes(id || '')
  const { data: teamsData } = useCaseTeams(id || '')
  const { data: meta } = useCaseMeta(id || '')
  const { data: analysisData } = useCaseAnalysis(id || '')
  const { data: draftsData } = useCaseDrafts(id || '')
  const analyzeCase = useAnalyzeCase()

  if (isLoading) return <Loading text="Loading case..." />
  if (error || !caseInfo) return <ErrorState message="Case not found" onRetry={() => navigate('/')} />

  const tabs = [
    { id: 'info', label: 'Info', icon: '📋' },
    { id: 'emails', label: 'Emails', icon: '📧', count: emailsData?.total },
    { id: 'notes', label: 'Notes', icon: '📝', count: notesData?.total },
    { id: 'teams', label: 'Teams', icon: '💬', count: teamsData?.total },
    { id: 'drafts', label: 'Drafts', icon: '✉️', count: draftsData?.total },
    { id: 'analysis', label: 'Analysis', icon: '🔍' },
  ]

  const handleAiAnalyze = async () => {
    try {
      const result = await analyzeCase.mutateAsync(id!)
      setAiResult(result.analysis)
    } catch {
      setAiResult('AI analysis failed.')
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button
          onClick={() => navigate('/')}
          className="mt-1 p-1.5 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm text-gray-500">{id}</span>
            <SeverityBadge severity={caseInfo.severity} />
            <CaseStatusBadge status={caseInfo.status} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mt-1">{caseInfo.title}</h2>
          <p className="text-sm text-gray-500">
            {caseInfo.customer} | {caseInfo.assignedTo} | Age: {caseInfo.caseAge} | {caseInfo.sap}
          </p>
        </div>
        <button
          onClick={handleAiAnalyze}
          disabled={analyzeCase.isPending}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 disabled:bg-purple-400 flex-shrink-0"
        >
          {analyzeCase.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          AI
        </button>
      </div>

      {/* AI Result */}
      {aiResult && (
        <Card className="border-purple-200 bg-purple-50/30">
          <CardHeader
            title="AI Analysis"
            icon={<Sparkles className="w-4 h-4 text-purple-500" />}
            action={<button onClick={() => setAiResult(null)} className="text-xs text-gray-400">Dismiss</button>}
          />
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiResult}</ReactMarkdown>
          </div>
        </Card>
      )}

      {/* AI Panel */}
      <CaseAIPanel caseNumber={id!} />

      {/* SLA Indicators */}
      {meta && (
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500">IR SLA:</span>
            <SlaBadge status={meta.irSla?.status || 'unknown'} />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500">FWR:</span>
            <SlaBadge status={meta.fwr?.status || 'unknown'} />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500">FDR:</span>
            <SlaBadge status={meta.fdr?.status || 'unknown'} />
          </div>
          {meta.teams_chat_count > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500">Teams:</span>
              <Badge variant="purple" size="xs">{meta.teams_chat_count} chats</Badge>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === 'info' && <InfoTab caseInfo={caseInfo} />}
        {activeTab === 'emails' && <EmailsTab emails={emailsData?.emails || []} />}
        {activeTab === 'notes' && <NotesTab notes={notesData?.notes || []} />}
        {activeTab === 'teams' && <TeamsTab chats={teamsData?.chats || []} />}
        {activeTab === 'drafts' && <DraftsTab drafts={draftsData?.drafts || []} />}
        {activeTab === 'analysis' && <AnalysisTab content={analysisData?.content} exists={analysisData?.exists} />}
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
  if (chats.length === 0) return <EmptyState icon="💬" title="No Teams chats" description="Teams data will appear after the teams-search-refresh cron job runs" />

  return (
    <div className="space-y-3">
      {chats.map((chat, i) => (
        <Card key={chat.chatId || i} padding="sm">
          <h4 className="font-medium text-sm text-gray-900 mb-2">Chat: {chat.chatId}</h4>
          <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-96 overflow-y-auto">
            {chat.content}
          </div>
        </Card>
      ))}
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
