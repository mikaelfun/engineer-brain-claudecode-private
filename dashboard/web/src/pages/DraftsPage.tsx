/**
 * DraftsPage — 邮件草稿审批页
 */
import { Card, CardHeader } from '../components/common/Card'
import { Badge } from '../components/common/Badge'
import { Loading, EmptyState } from '../components/common/Loading'
import { useDrafts } from '../api/hooks'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useNavigate } from 'react-router-dom'

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
          description="Email drafts created by the mailplanner agent will appear here"
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
                <Card key={i}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs text-gray-500">{draft.filename}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(draft.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="prose prose-sm max-w-none border-t border-gray-100 pt-3">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {draft.content}
                    </ReactMarkdown>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
