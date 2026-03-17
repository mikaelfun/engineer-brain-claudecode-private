/**
 * Dashboard — 总览页
 */
import { useNavigate } from 'react-router-dom'
import { Briefcase, AlertTriangle, Clock, CheckCircle, Activity, Sparkles, Loader2 } from 'lucide-react'
import { StatCard, Card, CardHeader } from '../components/common/Card'
import { SeverityBadge, CaseStatusBadge, SlaBadge } from '../components/common/Badge'
import { Loading, ErrorState, EmptyState } from '../components/common/Loading'
import { useCases, useCaseStats, usePatrolState, useAnalyzeAll } from '../api/hooks'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function Dashboard() {
  const navigate = useNavigate()
  const { data: casesData, isLoading, error } = useCases()
  const { data: stats } = useCaseStats()
  const { data: patrol } = usePatrolState()
  const analyzeAll = useAnalyzeAll()
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null)

  if (isLoading) return <Loading text="Loading dashboard..." />
  if (error) return <ErrorState message="Failed to load cases" onRetry={() => window.location.reload()} />

  const cases = casesData?.cases || []

  // Sort: red > yellow > green (by severity A > B > C)
  const sortedCases = [...cases].sort((a, b) => {
    const sevOrder: Record<string, number> = { A: 0, B: 1, C: 2 }
    return (sevOrder[a.severity] ?? 3) - (sevOrder[b.severity] ?? 3)
  })

  const handleAnalyzeAll = async () => {
    try {
      const result = await analyzeAll.mutateAsync()
      setAiAnalysis(result.analysis)
    } catch (err) {
      setAiAnalysis('AI analysis failed. Please check your GitHub Copilot token configuration.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-500 text-sm mt-1">
            {cases.length} active cases
            {patrol && ` | Last patrol: ${new Date(patrol.lastPatrol).toLocaleString()}`}
          </p>
        </div>
        <button
          onClick={handleAnalyzeAll}
          disabled={analyzeAll.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 disabled:bg-purple-400 transition-colors"
        >
          {analyzeAll.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          AI Analysis
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          label="Active Cases"
          value={stats?.total ?? cases.length}
          icon={<Briefcase className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          label="Urgent Items"
          value={stats?.urgentItems ?? 0}
          icon={<AlertTriangle className="w-6 h-6" />}
          color="red"
        />
        <StatCard
          label="Pending Items"
          value={stats?.pendingItems ?? 0}
          icon={<Clock className="w-6 h-6" />}
          color="yellow"
        />
        <StatCard
          label="Normal"
          value={stats?.normalItems ?? 0}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
        />
      </div>

      {/* Patrol Status */}
      {patrol && (
        <Card>
          <CardHeader
            title="Patrol Status"
            icon={<Activity className="w-5 h-5 text-primary" />}
            subtitle={`Type: ${patrol.patrolType} | ${patrol.lastRunTiming?.caseCount || 0} cases in ${patrol.lastRunTiming?.wallClockMinutes || 0} min`}
          />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
            <div className="bg-red-50 px-3 py-2 rounded-lg">
              <span className="text-gray-600">Pending Engineer</span>
              <p className="font-bold text-red-700">{patrol.summary?.pendingEngineer || 0}</p>
            </div>
            <div className="bg-yellow-50 px-3 py-2 rounded-lg">
              <span className="text-gray-600">Pending Customer</span>
              <p className="font-bold text-yellow-700">{patrol.summary?.pendingCustomer || 0}</p>
            </div>
            <div className="bg-blue-50 px-3 py-2 rounded-lg">
              <span className="text-gray-600">Waiting PG</span>
              <p className="font-bold text-blue-700">{patrol.summary?.waitingPG || 0}</p>
            </div>
            <div className="bg-purple-50 px-3 py-2 rounded-lg">
              <span className="text-gray-600">AR</span>
              <p className="font-bold text-purple-700">{patrol.summary?.ar || 0}</p>
            </div>
            <div className="bg-green-50 px-3 py-2 rounded-lg">
              <span className="text-gray-600">Normal</span>
              <p className="font-bold text-green-700">{patrol.summary?.normal || 0}</p>
            </div>
          </div>
          {patrol.lastRunTiming?.bottlenecks?.length > 0 && (
            <div className="mt-3 text-xs text-gray-500">
              Bottlenecks: {patrol.lastRunTiming.bottlenecks.join(' | ')}
            </div>
          )}
        </Card>
      )}

      {/* AI Analysis Result */}
      {aiAnalysis && (
        <Card>
          <CardHeader
            title="AI Analysis"
            icon={<Sparkles className="w-5 h-5 text-purple-500" />}
            action={
              <button
                onClick={() => setAiAnalysis(null)}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Dismiss
              </button>
            }
          />
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiAnalysis}</ReactMarkdown>
          </div>
        </Card>
      )}

      {/* Case Cards */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Active Cases</h3>
        {cases.length === 0 ? (
          <EmptyState icon="📂" title="No active cases" description="No cases found in the workspace" />
        ) : (
          <div className="grid gap-3">
            {sortedCases.map((c: any) => (
              <Card
                key={c.caseNumber}
                hover
                onClick={() => navigate(`/case/${c.caseNumber}`)}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm text-gray-500">{c.caseNumber}</span>
                      <SeverityBadge severity={c.severity} />
                      <CaseStatusBadge status={c.status} />
                    </div>
                    <h4 className="font-medium text-gray-900 mt-1 truncate">{c.title || 'Untitled'}</h4>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {c.customer} | {c.assignedTo} | Age: {c.caseAge}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs flex-shrink-0">
                    {c.meta && (
                      <>
                        <div className="text-center">
                          <span className="text-gray-400 block">IR</span>
                          <SlaBadge status={c.meta.irSla?.status || 'unknown'} />
                        </div>
                        <div className="text-center">
                          <span className="text-gray-400 block">FWR</span>
                          <SlaBadge status={c.meta.fwr?.status || 'unknown'} />
                        </div>
                        {c.meta.teams_chat_count > 0 && (
                          <div className="text-center">
                            <span className="text-gray-400 block">Teams</span>
                            <span className="text-purple-600 font-medium">{c.meta.teams_chat_count}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
