/**
 * DraftsPage — 邮件草稿审批页
 */
import { useState } from 'react'
import { ChevronDown, ChevronRight, Copy, Check, Pencil, X, Save } from 'lucide-react'
import { Card } from '../components/common/Card'
import { Loading, EmptyState } from '../components/common/Loading'
import { useDrafts } from '../api/hooks'
import MarkdownContent from '../components/common/MarkdownContent'
import { useNavigate } from 'react-router-dom'

/**
 * Strip YAML frontmatter (--- ... ---) from markdown content.
 */
function stripFrontmatter(md: string): string {
  const lines = md.split('\n')
  if (lines[0]?.trim() !== '---') return md
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      return lines.slice(i + 1).join('\n').replace(/^\n+/, '')
    }
  }
  return md
}

function DraftCard({ draft, showCaseNumber = false }: { draft: any; showCaseNumber?: boolean }) {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState('')

  const cleanContent = stripFrontmatter(draft.content?.replace(/\n{3,}/g, '\n\n') || '')

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
      const res = await fetch(`/api/drafts/${draft.caseNumber}/${draft.filename}`, {
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
    <Card>
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          {expanded
            ? <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
            : <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />}
          {showCaseNumber && (
            <span
              className="font-mono text-xs px-1.5 py-0.5 rounded cursor-pointer hover:underline"
              style={{ color: 'var(--accent-blue)', background: 'var(--bg-tertiary)' }}
              onClick={(e) => { e.stopPropagation(); navigate(`/case/${draft.caseNumber}`) }}
              title={`Go to Case ${draft.caseNumber}`}
            >
              {draft.caseNumber}
            </span>
          )}
          <span className="font-mono text-xs" style={{ color: 'var(--text-tertiary)' }}>{draft.filename}</span>
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

export default function DraftsPage() {
  const { data: draftsData, isLoading } = useDrafts()

  if (isLoading) return <Loading text="Loading drafts..." />

  const drafts = draftsData?.drafts || []

  // Keep only the latest draft per case (backend already sorts DESC by mtime)
  const latestPerCase: any[] = []
  const seen = new Set<string>()
  for (const draft of drafts) {
    if (!seen.has(draft.caseNumber)) {
      seen.add(draft.caseNumber)
      latestPerCase.push(draft)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Email Drafts</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
          Latest draft from {latestPerCase.length} cases
        </p>
      </div>

      {latestPerCase.length === 0 ? (
        <EmptyState
          icon="✉️"
          title="No drafts"
          description="Email drafts created by the email-drafter agent will appear here"
        />
      ) : (
        <div className="space-y-3">
          {latestPerCase.map((draft, i) => (
            <DraftCard key={`${draft.caseNumber}-${draft.filename}`} draft={draft} showCaseNumber />
          ))}
        </div>
      )}
    </div>
  )
}
