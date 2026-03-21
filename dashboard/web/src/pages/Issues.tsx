/**
 * Issues — Issue Tracker 页面
 *
 * 功能：列表 + 筛选 + 分页 + 内联创建 + 行内编辑 + 状态驱动操作按钮
 */
import { useState } from 'react'
import { Plus, X, Trash2, ExternalLink, ChevronRight, ChevronDown, Loader2, Rocket, Play, CheckCircle, RotateCcw, RefreshCw, Monitor, Server, Search, Pencil } from 'lucide-react'
import { useIssues, useCreateIssue, useUpdateIssue, useDeleteIssue, useCreateTrack, useStartImplement, useVerifyIssue, useReopenIssue, useRestartFrontend, useRestartBackend, useRestartAll } from '../api/hooks'
import { Loading, ErrorState } from '../components/common/Loading'
import TrackProgressPanel from '../components/TrackProgressPanel'
import { useIssueTrackStore, EMPTY_TRACK_MESSAGES } from '../stores/issueTrackStore'

type IssueType = 'bug' | 'feature' | 'refactor' | 'chore'
type IssuePriority = 'P0' | 'P1' | 'P2'
type IssueStatus = 'pending' | 'tracking' | 'tracked' | 'in-progress' | 'done'

const TYPE_COLORS: Record<IssueType, string> = {
  bug: 'bg-red-100 text-red-700',
  feature: 'bg-blue-100 text-blue-700',
  refactor: 'bg-purple-100 text-purple-700',
  chore: 'bg-gray-100 text-gray-700',
}

const PRIORITY_COLORS: Record<IssuePriority, string> = {
  P0: 'bg-red-600 text-white',
  P1: 'bg-orange-100 text-orange-700',
  P2: 'bg-gray-100 text-gray-600',
}

const STATUS_COLORS: Record<IssueStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  tracking: 'bg-cyan-100 text-cyan-700',
  tracked: 'bg-blue-100 text-blue-700',
  'in-progress': 'bg-purple-100 text-purple-700',
  done: 'bg-green-100 text-green-700',
}

interface VerifyResult {
  unitTest: { success: boolean; output: string }
  uiTest: { success: boolean; output: string }
}

export default function Issues() {
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  // Status grouping: Done is collapsed by default
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set(['done']))

  // Form state
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newType, setNewType] = useState<IssueType>('bug')
  const [newPriority, setNewPriority] = useState<IssuePriority>('P1')

  // Edit form state
  const [editTitle, setEditTitle] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editType, setEditType] = useState<IssueType>('bug')
  const [editPriority, setEditPriority] = useState<IssuePriority>('P1')
  const [editStatus, setEditStatus] = useState<IssueStatus>('pending')
  const [editTrackId, setEditTrackId] = useState('')

  // Verify modal state
  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null)
  const [verifyIssueId, setVerifyIssueId] = useState<string | null>(null)

  const { data, isLoading, error } = useIssues({
    status: statusFilter || undefined,
    type: typeFilter || undefined,
  })
  const createIssue = useCreateIssue()
  const updateIssue = useUpdateIssue()
  const deleteIssue = useDeleteIssue()
  const createTrack = useCreateTrack()
  const startImplement = useStartImplement()
  const verifyIssue = useVerifyIssue()
  const reopenIssue = useReopenIssue()
  const restartFe = useRestartFrontend()
  const restartBe = useRestartBackend()
  const restartAllSvc = useRestartAll()

  // Reconnect state: after backend restart, poll /api/health until it's back
  const [reconnecting, setReconnecting] = useState(false)

  const pollHealth = () => {
    setReconnecting(true)
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/health')
        if (res.ok) {
          clearInterval(interval)
          setReconnecting(false)
          window.location.reload()
        }
      } catch {
        // still down, keep polling
      }
    }, 1500)
    // Safety timeout: stop polling after 30s
    setTimeout(() => { clearInterval(interval); setReconnecting(false) }, 30000)
  }

  const handleRestartFrontend = () => {
    restartFe.mutate(undefined, {
      onSuccess: () => {
        // Frontend will restart, vite HMR should auto-reconnect
        // Give it a moment then reload
        setTimeout(() => window.location.reload(), 3000)
      },
    })
  }

  const handleRestartBackend = () => {
    restartBe.mutate(undefined, {
      onSuccess: () => pollHealth(),
      onError: () => pollHealth(), // request may fail as server dies
    })
  }

  const handleRestartAll = () => {
    restartAllSvc.mutate(undefined, {
      onSuccess: () => pollHealth(),
      onError: () => pollHealth(),
    })
  }

  if (isLoading) return <Loading text="Loading issues..." />
  if (error) return <ErrorState message="Failed to load issues" onRetry={() => window.location.reload()} />

  const issues = data?.issues || []
  const totalIssueCount = data?.total || 0

  // Client-side keyword search filter (match against title, description, id)
  const filteredIssues = searchQuery.trim()
    ? issues.filter((issue: any) => {
        const q = searchQuery.toLowerCase()
        return (
          (issue.title || '').toLowerCase().includes(q) ||
          (issue.description || '').toLowerCase().includes(q) ||
          (issue.id || '').toLowerCase().includes(q)
        )
      })
    : issues

  // Group issues by status category (all filtered issues, no pagination)
  const issueGroups = [
    {
      key: 'pending',
      label: '🟡 Pending',
      description: 'Needs action',
      issues: filteredIssues.filter((i: any) => ['pending', 'tracking', 'in-progress'].includes(i.status)),
      headerColor: 'border-yellow-200 bg-yellow-50/50',
      countColor: 'bg-yellow-100 text-yellow-700',
    },
    {
      key: 'tracked',
      label: '🔵 Tracked',
      description: 'Has implementation track',
      issues: filteredIssues.filter((i: any) => i.status === 'tracked'),
      headerColor: 'border-blue-200 bg-blue-50/50',
      countColor: 'bg-blue-100 text-blue-700',
    },
    {
      key: 'done',
      label: '✅ Done',
      description: 'Completed',
      issues: filteredIssues.filter((i: any) => i.status === 'done'),
      headerColor: 'border-green-200 bg-green-50/50',
      countColor: 'bg-green-100 text-green-700',
    },
  ].filter(g => g.issues.length > 0)

  const toggleGroup = (key: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const handleCreate = () => {
    if (!newTitle.trim()) return
    createIssue.mutate(
      { title: newTitle.trim(), description: newDesc, type: newType, priority: newPriority },
      {
        onSuccess: () => {
          setNewTitle('')
          setNewDesc('')
          setNewType('bug')
          setNewPriority('P1')
          setShowCreate(false)
        },
      }
    )
  }

  const startEdit = (issue: any) => {
    setEditingId(issue.id)
    setEditTitle(issue.title)
    setEditDesc(issue.description || '')
    setEditType(issue.type)
    setEditPriority(issue.priority)
    setEditStatus(issue.status)
    setEditTrackId(issue.trackId || '')
  }

  const handleUpdate = () => {
    if (!editingId) return
    updateIssue.mutate(
      { id: editingId, title: editTitle, description: editDesc, type: editType, priority: editPriority, status: editStatus, trackId: editTrackId || undefined },
      { onSuccess: () => setEditingId(null) }
    )
  }

  const handleVerify = (issueId: string) => {
    setVerifyIssueId(issueId)
    verifyIssue.mutate(issueId, {
      onSuccess: (result) => {
        setVerifyResult({ unitTest: result.unitTest, uiTest: result.uiTest })
      },
      onError: () => {
        setVerifyResult({
          unitTest: { success: false, output: 'Request failed' },
          uiTest: { success: false, output: '' },
        })
      },
    })
  }

  /** Render the status-driven action button for an issue */
  const renderActionButton = (issue: any) => {
    const status = issue.status as IssueStatus

    // tracking → spinner (disabled, agent is running)
    if (status === 'tracking') {
      return (
        <button
          disabled
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-cyan-50 text-cyan-600 opacity-70 cursor-not-allowed whitespace-nowrap"
          title="Track creation in progress..."
        >
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Creating Track...
        </button>
      )
    }

    // pending + no trackId → Create Track (direct, no dialog)
    if (status === 'pending' && !issue.trackId) {
      const isLoading = createTrack.isPending && (createTrack.variables as any)?.id === issue.id
      return (
        <button
          onClick={(e) => { e.stopPropagation(); createTrack.mutate({ id: issue.id }) }}
          disabled={isLoading}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 disabled:opacity-50 transition-colors whitespace-nowrap"
          title="Create conductor track"
        >
          {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Rocket className="w-3.5 h-3.5" />}
          Create Track
        </button>
      )
    }

    // pending + has trackId → Implement (track already exists, ready to implement)
    // tracked → Implement
    if (status === 'tracked' || (status === 'pending' && issue.trackId)) {
      const isLoading = startImplement.isPending && startImplement.variables === issue.id
      return (
        <button
          onClick={(e) => { e.stopPropagation(); startImplement.mutate(issue.id) }}
          disabled={isLoading}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-purple-50 text-purple-600 hover:bg-purple-100 disabled:opacity-50 transition-colors whitespace-nowrap"
          title="Start implementation"
        >
          {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
          Implement
        </button>
      )
    }

    // in-progress → Verify
    if (status === 'in-progress') {
      const isLoading = verifyIssue.isPending && verifyIssueId === issue.id
      return (
        <button
          onClick={(e) => { e.stopPropagation(); handleVerify(issue.id) }}
          disabled={isLoading}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-green-50 text-green-600 hover:bg-green-100 disabled:opacity-50 transition-colors whitespace-nowrap"
          title="Run tests to verify"
        >
          {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
          Verify
        </button>
      )
    }

    // done → Reopen
    if (status === 'done') {
      const isLoading = reopenIssue.isPending && reopenIssue.variables === issue.id
      return (
        <button
          onClick={(e) => { e.stopPropagation(); reopenIssue.mutate(issue.id) }}
          disabled={isLoading}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-gray-50 text-gray-500 hover:bg-gray-100 disabled:opacity-50 transition-colors whitespace-nowrap"
          title="Reopen issue"
        >
          {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
          Reopen
        </button>
      )
    }

    // No matching action for this state
    return null
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Issues</h1>
        <div className="flex items-center gap-2">
          {/* Restart buttons */}
          <div className="flex items-center gap-1 border border-gray-200 rounded-lg px-1 py-0.5">
            <button
              onClick={handleRestartFrontend}
              disabled={restartFe.isPending || reconnecting}
              className="flex items-center gap-1 px-2 py-1.5 text-xs text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded disabled:opacity-40 transition-colors"
              title="Restart frontend (vite)"
            >
              {restartFe.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Monitor className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">FE</span>
            </button>
            <button
              onClick={handleRestartBackend}
              disabled={restartBe.isPending || reconnecting}
              className="flex items-center gap-1 px-2 py-1.5 text-xs text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded disabled:opacity-40 transition-colors"
              title="Restart backend (tsx)"
            >
              {restartBe.isPending || reconnecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Server className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">BE</span>
            </button>
            <button
              onClick={handleRestartAll}
              disabled={restartAllSvc.isPending || reconnecting}
              className="flex items-center gap-1 px-2 py-1.5 text-xs text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded disabled:opacity-40 transition-colors"
              title="Restart all (frontend + backend)"
            >
              {restartAllSvc.isPending || reconnecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">All</span>
            </button>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
          >
            {showCreate ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showCreate ? 'Cancel' : 'New Issue'}
          </button>
        </div>
      </div>

      {/* Reconnecting overlay */}
      {reconnecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl px-8 py-6 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-sm font-medium text-gray-700">Restarting services...</p>
            <p className="text-xs text-gray-400">Waiting for server to come back online</p>
          </div>
        </div>
      )}

      {/* Create Form */}
      {showCreate && (
        <div className="bg-white rounded-lg border border-blue-200 p-4 space-y-3">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="Issue title..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            autoFocus
          />
          <textarea
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Description (optional)..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
          />
          <div className="flex items-center gap-3">
            <select value={newType} onChange={(e) => setNewType(e.target.value as IssueType)} className="px-2 py-1.5 border border-gray-200 rounded text-sm">
              <option value="bug">Bug</option>
              <option value="feature">Feature</option>
              <option value="refactor">Refactor</option>
              <option value="chore">Chore</option>
            </select>
            <select value={newPriority} onChange={(e) => setNewPriority(e.target.value as IssuePriority)} className="px-2 py-1.5 border border-gray-200 rounded text-sm">
              <option value="P0">P0</option>
              <option value="P1">P1</option>
              <option value="P2">P2</option>
            </select>
            <button
              onClick={handleCreate}
              disabled={!newTitle.trim() || createIssue.isPending}
              className="ml-auto px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
            >
              {createIssue.isPending ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray-500 font-medium">Filter:</span>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value) }}
            placeholder="Search issues..."
            className="pl-7 pr-7 py-1 border border-gray-200 rounded text-xs w-44 focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery('') }}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value) }}
          className="px-2 py-1 border border-gray-200 rounded text-xs"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="tracking">Tracking</option>
          <option value="tracked">Tracked</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value) }}
          className="px-2 py-1 border border-gray-200 rounded text-xs"
        >
          <option value="">All Types</option>
          <option value="bug">Bug</option>
          <option value="feature">Feature</option>
          <option value="refactor">Refactor</option>
          <option value="chore">Chore</option>
        </select>
        <span className="ml-auto text-xs text-gray-400">
          {searchQuery ? `${filteredIssues.length} / ` : ''}{totalIssueCount} issues
        </span>
      </div>

      {/* Issue List — Grouped by status */}
      <div className="space-y-4">
        {filteredIssues.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            {searchQuery
              ? <>No issues matching "<strong className="text-gray-500">{searchQuery}</strong>". Try a different keyword.</>
              : <>No issues found. Click "New Issue" to create one, or use <code className="bg-gray-100 px-1 rounded">/issue</code> in CLI.</>}
          </div>
        ) : (
          issueGroups.map(group => (
            <div key={group.key}>
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(group.key)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border ${group.headerColor} hover:opacity-80 transition-opacity mb-2`}
              >
                {collapsedGroups.has(group.key)
                  ? <ChevronRight className="w-4 h-4 text-gray-500" />
                  : <ChevronDown className="w-4 h-4 text-gray-500" />
                }
                <span className="text-sm font-semibold text-gray-700">{group.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${group.countColor}`}>
                  {group.issues.length}
                </span>
                <span className="text-xs text-gray-400 ml-1">{group.description}</span>
              </button>

              {/* Group Issues */}
              {!collapsedGroups.has(group.key) && (
                <div className="space-y-2">
                  {group.issues.map((issue: any) => (
                    <IssueRow
                      key={issue.id}
                      issue={issue}
                      editingId={editingId}
                      expandedId={expandedId}
                      setExpandedId={setExpandedId}
                      editTitle={editTitle}
                      editDesc={editDesc}
                      editType={editType}
                      editPriority={editPriority}
                      editStatus={editStatus}
                      editTrackId={editTrackId}
                      setEditTitle={setEditTitle}
                      setEditDesc={setEditDesc}
                      setEditType={setEditType}
                      setEditPriority={setEditPriority}
                      setEditStatus={setEditStatus}
                      setEditTrackId={setEditTrackId}
                      setEditingId={setEditingId}
                      handleUpdate={handleUpdate}
                      updateIssue={updateIssue}
                      startEdit={startEdit}
                      renderActionButton={renderActionButton}
                      deleteIssue={deleteIssue}
                      createTrack={createTrack}
                    />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Verify Result Modal */}
      {verifyResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => { setVerifyResult(null); setVerifyIssueId(null) }}>
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Verify Results</h2>
              <button onClick={() => { setVerifyResult(null); setVerifyIssueId(null) }} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto max-h-[calc(80vh-4rem)]">
              {/* Unit Test */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${verifyResult.unitTest.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {verifyResult.unitTest.success ? 'PASS' : 'FAIL'}
                  </span>
                  <span className="text-sm font-medium text-gray-700">Step 1: Unit Tests (Vitest)</span>
                </div>
                <pre className="bg-gray-900 text-gray-100 text-xs p-3 rounded-lg overflow-x-auto max-h-48 overflow-y-auto whitespace-pre-wrap">
                  {verifyResult.unitTest.output || '(no output)'}
                </pre>
              </div>

              {/* UI Test */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${verifyResult.uiTest.success ? 'bg-green-100 text-green-700' : verifyResult.unitTest.success ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                    {!verifyResult.unitTest.success ? 'SKIPPED' : verifyResult.uiTest.success ? 'PASS' : 'FAIL'}
                  </span>
                  <span className="text-sm font-medium text-gray-700">Step 2: UI Tests (Playwright)</span>
                </div>
                <pre className="bg-gray-900 text-gray-100 text-xs p-3 rounded-lg overflow-x-auto max-h-48 overflow-y-auto whitespace-pre-wrap">
                  {verifyResult.uiTest.output || (verifyResult.unitTest.success ? '(no output)' : 'Skipped — unit tests failed')}
                </pre>
              </div>

              {/* Overall result */}
              <div className={`text-center py-2 rounded-lg text-sm font-medium ${verifyResult.unitTest.success && verifyResult.uiTest.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {verifyResult.unitTest.success && verifyResult.uiTest.success
                  ? 'All tests passed — issue marked as done'
                  : 'Tests failed — issue remains in-progress'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verify loading overlay */}
      {verifyIssue.isPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl px-8 py-6 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-sm font-medium text-gray-700">Running tests...</p>
            <p className="text-xs text-gray-400">This may take up to 5 minutes</p>
          </div>
        </div>
      )}

    </div>
  )
}

/** Extracted IssueRow component — subscribes to issueTrackStore per-issue to show progress panel */
function IssueRow({
  issue,
  editingId,
  expandedId,
  setExpandedId,
  editTitle, editDesc, editType, editPriority, editStatus, editTrackId,
  setEditTitle, setEditDesc, setEditType, setEditPriority, setEditStatus, setEditTrackId,
  setEditingId,
  handleUpdate,
  updateIssue,
  startEdit,
  renderActionButton,
  deleteIssue,
  createTrack,
}: {
  issue: any
  editingId: string | null
  expandedId: string | null
  setExpandedId: (v: string | null) => void
  editTitle: string; editDesc: string; editType: IssueType; editPriority: IssuePriority; editStatus: IssueStatus; editTrackId: string
  setEditTitle: (v: string) => void; setEditDesc: (v: string) => void; setEditType: (v: IssueType) => void; setEditPriority: (v: IssuePriority) => void; setEditStatus: (v: IssueStatus) => void; setEditTrackId: (v: string) => void
  setEditingId: (v: string | null) => void
  handleUpdate: () => void
  updateIssue: any
  startEdit: (issue: any) => void
  renderActionButton: (issue: any) => React.ReactNode
  deleteIssue: any
  createTrack: any
}) {
  // Subscribe to track messages for this specific issue
  const hasTrackMessages = useIssueTrackStore((s) => (s.messages[issue.id]?.length ?? 0) > 0)
  const isTracking = issue.status === 'tracking'

  // Show progress panel if issue is tracking or has track messages in store
  const showProgress = isTracking || hasTrackMessages

  const isExpanded = expandedId === issue.id
  const isEditing = editingId === issue.id

  return (
    <div className={`bg-white rounded-lg border transition-colors ${isTracking ? 'border-cyan-200' : 'border-gray-200 hover:border-gray-300'}`}>
      {/* Row Header — always visible, click toggles expand/collapse */}
      <div className="p-3 flex items-start gap-3 cursor-pointer" onClick={() => { setExpandedId(isExpanded ? null : issue.id); if (isEditing) setEditingId(null) }}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
            <span className="text-xs font-mono text-gray-400">{issue.id}</span>
            <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${PRIORITY_COLORS[issue.priority as IssuePriority] || ''}`}>
              {issue.priority}
            </span>
            <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${TYPE_COLORS[issue.type as IssueType] || ''}`}>
              {issue.type}
            </span>
            <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[issue.status as IssueStatus] || ''}`}>
              {issue.status}
            </span>
          </div>
          <h3 className={`text-sm font-medium mt-1 ${issue.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
            {issue.title}
          </h3>
          {!isExpanded && issue.description && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{issue.description}</p>
          )}
          {!isExpanded && (
            <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
              <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
              {issue.trackId && (
                <span className="flex items-center gap-0.5 text-blue-500">
                  <ExternalLink className="w-3 h-3" />
                  {issue.trackId}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {renderActionButton(issue)}
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (confirm(`Delete ${issue.id}?`)) deleteIssue.mutate(issue.id)
            }}
            className="p-1 text-gray-300 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded Content — readonly detail or edit form */}
      {isExpanded && (
        <div className="border-t border-gray-100">
          {isEditing ? (
            /* Edit Mode */
            <div className="p-4 space-y-3 bg-gray-50/50">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
              />
              <div className="flex items-center gap-2 flex-wrap">
                <select value={editType} onChange={(e) => setEditType(e.target.value as IssueType)} className="px-2 py-1 border border-gray-200 rounded text-xs">
                  <option value="bug">Bug</option>
                  <option value="feature">Feature</option>
                  <option value="refactor">Refactor</option>
                  <option value="chore">Chore</option>
                </select>
                <select value={editPriority} onChange={(e) => setEditPriority(e.target.value as IssuePriority)} className="px-2 py-1 border border-gray-200 rounded text-xs">
                  <option value="P0">P0</option>
                  <option value="P1">P1</option>
                  <option value="P2">P2</option>
                </select>
                <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as IssueStatus)} className="px-2 py-1 border border-gray-200 rounded text-xs">
                  <option value="pending">Pending</option>
                  <option value="tracking">Tracking</option>
                  <option value="tracked">Tracked</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
                <input
                  type="text"
                  value={editTrackId}
                  onChange={(e) => setEditTrackId(e.target.value)}
                  placeholder="Track ID (optional)"
                  className="px-2 py-1 border border-gray-200 rounded text-xs w-48"
                />
                <div className="ml-auto flex gap-2">
                  <button onClick={() => setEditingId(null)} className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700">Cancel</button>
                  <button onClick={handleUpdate} disabled={updateIssue.isPending} className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300">
                    Save
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Readonly Detail Panel */
            <div className="px-4 py-3 space-y-2">
              {issue.description ? (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{issue.description}</p>
              ) : (
                <p className="text-sm text-gray-400 italic">No description</p>
              )}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>Created: {new Date(issue.createdAt).toLocaleString()}</span>
                {issue.updatedAt && <span>Updated: {new Date(issue.updatedAt).toLocaleString()}</span>}
                {issue.trackId && (
                  <span className="flex items-center gap-0.5 text-blue-500">
                    <ExternalLink className="w-3 h-3" />
                    {issue.trackId}
                  </span>
                )}
              </div>
              <div className="flex justify-end pt-1">
                <button
                  onClick={(e) => { e.stopPropagation(); startEdit(issue) }}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Track progress panel — shown when tracking or has messages */}
      {showProgress && !isEditing && (
        <TrackProgressPanel
          issueId={issue.id}
          isTracking={isTracking}
          onRetry={() => createTrack.mutate({ id: issue.id })}
        />
      )}
    </div>
  )
}
