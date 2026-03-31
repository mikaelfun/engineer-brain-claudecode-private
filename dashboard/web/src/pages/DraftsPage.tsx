/**
 * DraftsPage — 邮件草稿审批页
 */
import { useState } from 'react'
import { ChevronDown, ChevronRight, Copy, Check, Pencil, X, Save } from 'lucide-react'
import { Card } from '../components/common/Card'
import { Badge } from '../components/common/Badge'
import { Loading, EmptyState } from '../components/common/Loading'
import { useDrafts } from '../api/hooks'
import MarkdownContent from '../components/common/MarkdownContent'
import { useNavigate } from 'react-router-dom'

function DraftCard({ draft }: { draft: any }) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const [ccCopied, setCcCopied] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState('')

  const cleanContent = draft.content?.replace(/\n{3,}/g, '\n\n') || ''

  // Extract CC line from draft content
  const ccMatch = cleanContent.match(/\*\*CC:\*\*\s*(.+)/i)
  const ccEmails = ccMatch ? ccMatch[1].trim() : null

  const handleCopyCC = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!ccEmails) return
    try {
      await navigator.clipboard.writeText(ccEmails)
      setCcCopied(true)
      setTimeout(() => setCcCopied(false), 1500)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = ccEmails
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCcCopied(true)
      setTimeout(() => setCcCopied(false), 1500)
    }
  }

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
          {ccEmails && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded mb-3 text-xs"
              style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}
            >
              <span style={{ color: 'var(--text-secondary)' }}>
                <strong>CC:</strong> {ccEmails}
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
          )}
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
  const navigate = useNavigate()
  const { data: draftsData, isLoading } = useDrafts()

  if (isLoading) return <Loading text="Loading drafts..." />

  const drafts = draftsData?.drafts || []

  // Group by case number
  const grouped = drafts.reduce((acc: Record<string, any[]>, draft: any) => {
    const key = draft.caseNumber
    if (!acc[key]) acc[key] = []
    acc[key].push(draft)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Email Drafts</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
          {drafts.length} drafts across {Object.keys(grouped).length} cases
        </p>
      </div>

      {drafts.length === 0 ? (
        <EmptyState
          icon="✉️"
          title="No drafts"
          description="Email drafts created by the email-drafter agent will appear here"
        />
      ) : (
        Object.entries(grouped).map(([caseNumber, caseDrafts]) => (
          <div key={caseNumber}>
            <h3
              className="text-md font-semibold mb-2 flex items-center gap-2 cursor-pointer"
              style={{ color: 'var(--text-primary)' }}
              onClick={() => navigate(`/case/${caseNumber}`)}
            >
              <span>📧</span> Case {caseNumber}
              <Badge variant="primary" size="xs">{(caseDrafts as any[]).length}</Badge>
            </h3>

            <div className="space-y-3">
              {(caseDrafts as any[]).map((draft, i) => (
                <DraftCard key={i} draft={draft} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
