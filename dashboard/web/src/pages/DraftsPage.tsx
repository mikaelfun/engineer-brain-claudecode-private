/**
 * DraftsPage — 邮件草稿审批页
 */
import { useState } from 'react'
import { ChevronDown, ChevronRight, Copy, Check } from 'lucide-react'
import { Card } from '../components/common/Card'
import { Badge } from '../components/common/Badge'
import { Loading, EmptyState } from '../components/common/Loading'
import { useDrafts } from '../api/hooks'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useNavigate } from 'react-router-dom'

function DraftCard({ draft }: { draft: any }) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  // Compress multiple empty lines but preserve single blank lines for email formatting
  const cleanContent = draft.content?.replace(/\n{3,}/g, '\n\n') || ''

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(cleanContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for browsers without clipboard API
      const textarea = document.createElement('textarea')
      textarea.value = cleanContent
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Card>
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          {expanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
          <span className="font-mono text-xs text-gray-500">{draft.filename}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
              copied
                ? 'text-green-600 bg-green-50'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
            title="Copy to clipboard"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <span className="text-xs text-gray-400">
            {new Date(draft.createdAt).toLocaleString()}
          </span>
        </div>
      </div>
      {expanded && (
        <div className="prose prose-sm max-w-none border-t border-gray-100 pt-3 mt-3">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {cleanContent}
          </ReactMarkdown>
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
        <h2 className="text-2xl font-bold text-gray-900">Email Drafts</h2>
        <p className="text-gray-500 text-sm mt-1">
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
              className="text-md font-semibold text-gray-900 mb-2 flex items-center gap-2 cursor-pointer hover:text-primary"
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
