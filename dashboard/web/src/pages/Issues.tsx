/**
 * Issues — Issue Tracker 页面
 *
 * 功能：列表 + 筛选 + 分页 + 内联创建 + 行内编辑 + 状态驱动操作按钮
 */
import { useState, useCallback } from 'react'
import { Plus, X, Trash2, ExternalLink, ChevronRight, ChevronDown, Loader2, Rocket, Play, CheckCircle, RotateCcw, RefreshCw, Monitor, Server, Search, Pencil, FileText, ListChecks, FlaskConical, CircleCheck, ShieldCheck, UserCheck, Copy, Check } from 'lucide-react'
import { useIssues, useCreateIssue, useUpdateIssue, useDeleteIssue, useCreateTrack, useStartImplement, useVerifyIssue, useReopenIssue, useMarkDone, useRestartFrontend, useRestartBackend, useRestartAll, useTrackSpec, useTrackPlan } from '../api/hooks'
import { Loading, ErrorState } from '../components/common/Loading'
import TrackProgressPanel from '../components/TrackProgressPanel'
import ImplementPanel from '../components/ImplementPanel'
import VerifyProgressPanel from '../components/VerifyProgressPanel'
import { useIssueTrackStore, EMPTY_TRACK_MESSAGES } from '../stores/issueTrackStore'
import { useImplementStore } from '../stores/implementStore'

type IssueType = 'bug' | 'feature' | 'refactor' | 'chore'
type IssuePriority = 'P0' | 'P1' | 'P2'
type IssueStatus = 'pending' | 'tracking' | 'tracked' | 'in-progress' | 'implemented' | 'done'

const TYPE_COLORS: Record<IssueType, { bg: string; color: string }> = {
  bug: { bg: 'var(--accent-red-dim)', color: 'var(--accent-red)' },
  feature: { bg: 'var(--accent-blue-dim)', color: 'var(--accent-blue)' },
  refactor: { bg: 'var(--accent-purple-dim)', color: 'var(--accent-purple)' },
  chore: { bg: 'var(--bg-inset)', color: 'var(--text-secondary)' },
}

const PRIORITY_COLORS: Record<IssuePriority, { bg: string; color: string }> = {
  P0: { bg: 'var(--accent-red)', color: 'var(--text-inverse)' },
  P1: { bg: 'var(--accent-amber-dim)', color: 'var(--accent-amber)' },
  P2: { bg: 'var(--bg-inset)', color: 'var(--text-tertiary)' },
}

const STATUS_COLORS: Record<IssueStatus, { bg: string; color: string }> = {
  pending: { bg: 'var(--accent-amber-dim)', color: 'var(--accent-amber)' },
  tracking: { bg: 'var(--accent-blue-dim)', color: 'var(--accent-blue)' },
  tracked: { bg: 'var(--accent-blue-dim)', color: 'var(--accent-blue)' },
  'in-progress': { bg: 'var(--accent-purple-dim)', color: 'var(--accent-purple)' },
  implemented: { bg: 'var(--accent-teal-dim, var(--accent-blue-dim))', color: 'var(--accent-teal, var(--accent-blue))' },
  done: { bg: 'var(--accent-green-dim)', color: 'var(--accent-green)' },
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

  // Delete button hover state
  const [deleteHoverId, setDeleteHoverId] = useState<string | null>(null)

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
  const markDone = useMarkDone()
  const restartFe = useRestartFrontend()
  const restartBe = useRestartBackend()
  const restartAllSvc = useRestartAll()
  const setIssueTracking = useIssueTrackStore((s) => s.setIssueTracking)

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
      headerBorder: 'var(--accent-amber-dim)',
      headerBg: 'var(--accent-amber-dim)',
      countBg: 'var(--accent-amber-dim)',
      countColor: 'var(--accent-amber)',
    },
    {
      key: 'tracked',
      label: '🔵 Tracked',
      description: 'Has implementation track',
      issues: filteredIssues.filter((i: any) => i.status === 'tracked'),
      headerBorder: 'var(--accent-blue-dim)',
      headerBg: 'var(--accent-blue-dim)',
      countBg: 'var(--accent-blue-dim)',
      countColor: 'var(--accent-blue)',
    },
    {
      key: 'implemented',
      label: '🟢 Implemented',
      description: 'Awaiting manual verification',
      issues: filteredIssues.filter((i: any) => i.status === 'implemented'),
      headerBorder: 'var(--accent-teal-dim, var(--accent-green-dim))',
      headerBg: 'var(--accent-teal-dim, var(--accent-green-dim))',
      countBg: 'var(--accent-teal-dim, var(--accent-green-dim))',
      countColor: 'var(--accent-teal, var(--accent-green))',
    },
    {
      key: 'done',
      label: '✅ Done',
      description: 'Completed',
      issues: filteredIssues.filter((i: any) => i.status === 'done'),
      headerBorder: 'var(--accent-green-dim)',
      headerBg: 'var(--accent-green-dim)',
      countBg: 'var(--accent-green-dim)',
      countColor: 'var(--accent-green)',
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
    // Fire-and-forget: backend runs tests async, SSE pushes progress
    const verifyStore = useIssueTrackStore.getState()
    verifyStore.setVerifyActive(issueId, true)
    verifyIssue.mutate(issueId)
  }

  /** Render the status-driven action button for an issue */
  const renderActionButton = (issue: any) => {
    const status = issue.status as IssueStatus

    // tracking → spinner (disabled, agent is running)
    if (status === 'tracking') {
      return (
        <button
          disabled
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md opacity-70 cursor-not-allowed whitespace-nowrap"
          style={{ background: 'var(--accent-blue-dim)', color: 'var(--accent-blue)' }}
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
          onClick={(e) => { e.stopPropagation(); setIssueTracking(issue.id, true); createTrack.mutate({ id: issue.id }) }}
          disabled={isLoading}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md disabled:opacity-50 transition-colors whitespace-nowrap"
          style={{ background: 'var(--accent-blue-dim)', color: 'var(--accent-blue)' }}
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
          onClick={(e) => {
            e.stopPropagation()
            // Optimistically start the implement session in local store so ImplementPanel mounts immediately
            const implementStore = useImplementStore.getState()
            implementStore.startSession(issue.id, issue.trackId || '')
            startImplement.mutate(issue.id)
          }}
          disabled={isLoading}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md disabled:opacity-50 transition-colors whitespace-nowrap"
          style={{ background: 'var(--accent-purple-dim)', color: 'var(--accent-purple)' }}
          title="Start implementation"
        >
          {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
          Implement
        </button>
      )
    }

    // in-progress → Verify
    if (status === 'in-progress') {
      return (
        <button
          onClick={(e) => { e.stopPropagation(); handleVerify(issue.id) }}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap"
          style={{ background: 'var(--accent-green-dim)', color: 'var(--accent-green)' }}
          title="Run tests to verify"
        >
          <FlaskConical className="w-3.5 h-3.5" />
          Verify
        </button>
      )
    }

    // implemented → Mark Done + Verify + Reopen
    if (status === 'implemented') {
      const isDoneLoading = markDone.isPending && markDone.variables === issue.id
      const isReopenLoading = reopenIssue.isPending && reopenIssue.variables === issue.id
      return (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); markDone.mutate(issue.id) }}
            disabled={isDoneLoading}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md disabled:opacity-50 transition-colors whitespace-nowrap"
            style={{ background: 'var(--accent-green-dim)', color: 'var(--accent-green)' }}
            title="Mark as done (verified)"
          >
            {isDoneLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CircleCheck className="w-3.5 h-3.5" />}
            Mark Done
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleVerify(issue.id) }}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap"
            style={{ background: 'var(--accent-amber-dim)', color: 'var(--accent-amber)' }}
            title="Run tests to verify"
          >
            <FlaskConical className="w-3.5 h-3.5" />
            Verify
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); reopenIssue.mutate(issue.id) }}
            disabled={isReopenLoading}
            className="flex items-center gap-1 px-2 py-1 text-xs rounded-md disabled:opacity-50 transition-colors whitespace-nowrap"
            style={{ color: 'var(--text-tertiary)' }}
            title="Reopen issue"
          >
            {isReopenLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
          </button>
        </div>
      )
    }

    // done → Reopen
    if (status === 'done') {
      const isLoading = reopenIssue.isPending && reopenIssue.variables === issue.id
      return (
        <button
          onClick={(e) => { e.stopPropagation(); reopenIssue.mutate(issue.id) }}
          disabled={isLoading}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md disabled:opacity-50 transition-colors whitespace-nowrap"
          style={{ background: 'var(--bg-inset)', color: 'var(--text-secondary)' }}
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
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Issues</h1>
        <div className="flex items-center gap-2">
          {/* Restart buttons */}
          <div className="flex items-center gap-1 rounded-lg px-1 py-0.5" style={{ border: '1px solid var(--border-default)' }}>
            <button
              onClick={handleRestartFrontend}
              disabled={restartFe.isPending || reconnecting}
              className="flex items-center gap-1 px-2 py-1.5 text-xs rounded disabled:opacity-40 transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              title="Restart frontend (vite)"
            >
              {restartFe.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Monitor className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">FE</span>
            </button>
            <button
              onClick={handleRestartBackend}
              disabled={restartBe.isPending || reconnecting}
              className="flex items-center gap-1 px-2 py-1.5 text-xs rounded disabled:opacity-40 transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              title="Restart backend (tsx)"
            >
              {restartBe.isPending || reconnecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Server className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">BE</span>
            </button>
            <button
              onClick={handleRestartAll}
              disabled={restartAllSvc.isPending || reconnecting}
              className="flex items-center gap-1 px-2 py-1.5 text-xs rounded disabled:opacity-40 transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              title="Restart all (frontend + backend)"
            >
              {restartAllSvc.isPending || reconnecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">All</span>
            </button>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ background: 'var(--accent-blue)', color: 'var(--text-inverse)' }}
          >
            {showCreate ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showCreate ? 'Cancel' : 'New Issue'}
          </button>
        </div>
      </div>

      {/* Reconnecting overlay */}
      {reconnecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="rounded-xl shadow-2xl px-8 py-6 flex flex-col items-center gap-3" style={{ background: 'var(--bg-surface)' }}>
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent-blue)' }} />
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Restarting services...</p>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Waiting for server to come back online</p>
          </div>
        </div>
      )}

      {/* Create Form */}
      {showCreate && (
        <div className="rounded-lg p-4 space-y-3" style={{ background: 'var(--bg-surface)', border: '1px solid var(--accent-blue)' }}>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="Issue title..."
            className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
            style={{ border: '1px solid var(--border-default)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
            autoFocus
          />
          <textarea
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Description (optional)..."
            rows={2}
            className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 resize-none"
            style={{ border: '1px solid var(--border-default)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
          />
          <div className="flex items-center gap-3">
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as IssueType)}
              className="px-2 py-1.5 rounded text-sm"
              style={{ border: '1px solid var(--border-default)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
            >
              <option value="bug">Bug</option>
              <option value="feature">Feature</option>
              <option value="refactor">Refactor</option>
              <option value="chore">Chore</option>
            </select>
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as IssuePriority)}
              className="px-2 py-1.5 rounded text-sm"
              style={{ border: '1px solid var(--border-default)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
            >
              <option value="P0">P0</option>
              <option value="P1">P1</option>
              <option value="P2">P2</option>
            </select>
            <button
              onClick={handleCreate}
              disabled={!newTitle.trim() || createIssue.isPending}
              className="ml-auto px-4 py-1.5 rounded-lg text-sm transition-colors"
              style={{
                background: !newTitle.trim() || createIssue.isPending ? 'var(--bg-active)' : 'var(--accent-blue)',
                color: !newTitle.trim() || createIssue.isPending ? 'var(--text-tertiary)' : 'var(--text-inverse)',
              }}
            >
              {createIssue.isPending ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Filter:</span>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value) }}
            placeholder="Search issues..."
            className="pl-7 pr-7 py-1 rounded text-xs w-44 focus:outline-none focus:ring-1"
            style={{ border: '1px solid var(--border-default)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery('') }}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value) }}
          className="px-2 py-1 rounded text-xs"
          style={{ border: '1px solid var(--border-default)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="tracking">Tracking</option>
          <option value="tracked">Tracked</option>
          <option value="in-progress">In Progress</option>
          <option value="implemented">Implemented</option>
          <option value="done">Done</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value) }}
          className="px-2 py-1 rounded text-xs"
          style={{ border: '1px solid var(--border-default)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
        >
          <option value="">All Types</option>
          <option value="bug">Bug</option>
          <option value="feature">Feature</option>
          <option value="refactor">Refactor</option>
          <option value="chore">Chore</option>
        </select>
        <span className="ml-auto text-xs" style={{ color: 'var(--text-tertiary)' }}>
          {searchQuery ? `${filteredIssues.length} / ` : ''}{totalIssueCount} issues
        </span>
      </div>

      {/* Issue List — Grouped by status */}
      <div className="space-y-4">
        {filteredIssues.length === 0 ? (
          <div className="text-center py-12 text-sm" style={{ color: 'var(--text-tertiary)' }}>
            {searchQuery
              ? <>No issues matching "<strong style={{ color: 'var(--text-secondary)' }}>{searchQuery}</strong>". Try a different keyword.</>
              : <>No issues found. Click "New Issue" to create one, or use <code className="px-1 rounded" style={{ background: 'var(--bg-inset)' }}>/issue</code> in CLI.</>}
          </div>
        ) : (
          issueGroups.map(group => (
            <div key={group.key}>
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(group.key)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-opacity mb-2"
                style={{ border: `1px solid ${group.headerBorder}`, background: group.headerBg }}
              >
                {collapsedGroups.has(group.key)
                  ? <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                  : <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                }
                <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>{group.label}</span>
                <span
                  className="px-1.5 py-0.5 rounded-full text-xs font-medium"
                  style={{ background: group.countBg, color: group.countColor }}
                >
                  {group.issues.length}
                </span>
                <span className="text-xs ml-1" style={{ color: 'var(--text-tertiary)' }}>{group.description}</span>
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
                      deleteHoverId={deleteHoverId}
                      setDeleteHoverId={setDeleteHoverId}
                    />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>


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
  deleteHoverId,
  setDeleteHoverId,
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
  deleteHoverId: string | null
  setDeleteHoverId: (v: string | null) => void
}) {
  // Subscribe to track messages for this specific issue
  const hasTrackMessages = useIssueTrackStore((s) => (s.messages[issue.id]?.length ?? 0) > 0)
  const isOptimisticTracking = useIssueTrackStore((s) => s.trackingIssues[issue.id] ?? false)
  const setIssueTracking = useIssueTrackStore((s) => s.setIssueTracking)
  const isTracking = issue.status === 'tracking'

  // Subscribe to implement store for this specific issue
  const implementSession = useImplementStore((s) => s.sessions[issue.id])
  const hasImplementSession = !!implementSession
  const isImplementActive = implementSession?.status === 'active'

  // Subscribe to verify store for this specific issue
  const hasVerifyMessages = useIssueTrackStore((s) => (s.verifyMessages[issue.id]?.length ?? 0) > 0)
  const isVerifyActive = useIssueTrackStore((s) => s.activeVerify[issue.id] ?? false)

  // Show progress panel if issue is tracking, has track messages, or was optimistically marked (ISS-029)
  const showProgress = isTracking || hasTrackMessages || isOptimisticTracking
  // Show implement panel if there is an implement session (active, completed, or failed)
  const showImplement = hasImplementSession
  // Show verify panel if verify is active or has messages
  const showVerify = isVerifyActive || hasVerifyMessages

  const isExpanded = expandedId === issue.id
  const isEditing = editingId === issue.id

  // Lazy-load track spec and plan when expanded and issue has a trackId
  // For done issues: also load plan when collapsed to show task progress in row header
  const isDone = issue.status === 'done'
  const { data: specData } = useTrackSpec(issue.id, isExpanded && !!issue.trackId)
  const needPlan = isExpanded || (isDone && !!issue.trackId)
  const { data: planData } = useTrackPlan(issue.id, needPlan ? issue.trackId : undefined)

  const priorityStyle = PRIORITY_COLORS[issue.priority as IssuePriority]
  const typeStyle = TYPE_COLORS[issue.type as IssueType]
  const statusStyle = STATUS_COLORS[issue.status as IssueStatus]

  return (
    <div
      className="rounded-lg transition-colors"
      style={{
        background: 'var(--bg-surface)',
        border: isTracking ? '1px solid var(--accent-blue)' : isImplementActive ? '1px solid var(--accent-purple)' : isVerifyActive ? '1px solid var(--accent-green)' : '1px solid var(--border-default)',
      }}
    >
      {/* Row Header — always visible, click toggles expand/collapse */}
      <div className="p-3 flex items-start gap-3 cursor-pointer" onClick={() => { setExpandedId(isExpanded ? null : issue.id); if (isEditing) setEditingId(null) }}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {isExpanded
              ? <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />
              : <ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />
            }
            <span className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>{issue.id}</span>
            {priorityStyle && (
              <span
                className="px-1.5 py-0.5 rounded text-xs font-medium"
                style={{ background: priorityStyle.bg, color: priorityStyle.color }}
              >
                {issue.priority}
              </span>
            )}
            {typeStyle && (
              <span
                className="px-1.5 py-0.5 rounded text-xs font-medium"
                style={{ background: typeStyle.bg, color: typeStyle.color }}
              >
                {issue.type}
              </span>
            )}
            {statusStyle && (
              <span
                className="px-1.5 py-0.5 rounded text-xs font-medium"
                style={{ background: statusStyle.bg, color: statusStyle.color }}
              >
                {issue.status}
              </span>
            )}
            {/* Done issue verification method badge */}
            {issue.status === 'done' && (
              issue.verifyResult ? (
                <span
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium"
                  style={{
                    background: issue.verifyResult.unitTest?.success && issue.verifyResult.uiTest?.success
                      ? 'var(--accent-green-dim)' : 'var(--accent-red-dim)',
                    color: issue.verifyResult.unitTest?.success && issue.verifyResult.uiTest?.success
                      ? 'var(--accent-green)' : 'var(--accent-red)',
                  }}
                >
                  <ShieldCheck className="w-3 h-3" />
                  Auto-Verified
                </span>
              ) : (
                <span
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium"
                  style={{ background: 'var(--bg-inset)', color: 'var(--text-tertiary)' }}
                >
                  <UserCheck className="w-3 h-3" />
                  Manual
                </span>
              )
            )}
          </div>
          <h3
            className={`text-sm font-medium mt-1 ${issue.status === 'done' ? 'line-through' : ''}`}
            style={{ color: issue.status === 'done' ? 'var(--text-tertiary)' : 'var(--text-primary)' }}
          >
            {issue.title}
          </h3>
          {!isExpanded && issue.description && (
            <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{issue.description}</p>
          )}
          {!isExpanded && (
            <div className="flex items-center gap-3 mt-1.5 text-xs" style={{ color: 'var(--text-tertiary)' }}>
              <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
              {issue.trackId && (
                <span className="flex items-center gap-0.5" style={{ color: 'var(--accent-blue)' }}>
                  <ExternalLink className="w-3 h-3" />
                  {issue.trackId}
                </span>
              )}
              {/* Done issue: show track task completion progress */}
              {isDone && issue.trackId && planData?.plan && (() => {
                const tasks = planData.plan.match(/^- \[.\]\s*Task\s+\d/gim) || []
                const completed = planData.plan.match(/^- \[x\]\s*Task\s+\d/gim) || []
                if (tasks.length === 0) return null
                return (
                  <span className="flex items-center gap-1" style={{ color: completed.length === tasks.length ? 'var(--accent-green)' : 'var(--text-tertiary)' }}>
                    <ListChecks className="w-3 h-3" />
                    {completed.length}/{tasks.length} tasks {completed.length === tasks.length ? '✓' : ''}
                  </span>
                )
              })()}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Override action button when implement or verify is actively running */}
          {isImplementActive ? (
            <button
              disabled
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md opacity-70 cursor-not-allowed whitespace-nowrap"
              style={{ background: 'var(--accent-purple-dim)', color: 'var(--accent-purple)' }}
              title="Implementation in progress..."
            >
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Implementing...
            </button>
          ) : isVerifyActive ? (
            <button
              disabled
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md opacity-70 cursor-not-allowed whitespace-nowrap"
              style={{ background: 'var(--accent-green-dim)', color: 'var(--accent-green)' }}
              title="Verification in progress..."
            >
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Verifying...
            </button>
          ) : renderActionButton(issue)}
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (confirm(`Delete ${issue.id}?`)) deleteIssue.mutate(issue.id)
            }}
            className="p-1 transition-colors"
            style={{ color: deleteHoverId === issue.id ? 'var(--accent-red)' : 'var(--text-tertiary)' }}
            onMouseEnter={() => setDeleteHoverId(issue.id)}
            onMouseLeave={() => setDeleteHoverId(null)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded Content — readonly detail or edit form */}
      {isExpanded && (
        <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
          {isEditing ? (
            /* Edit Mode */
            <div className="p-4 space-y-3" style={{ background: 'var(--bg-inset)' }}>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
                style={{ border: '1px solid var(--border-default)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
              />
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 resize-none"
                style={{ border: '1px solid var(--border-default)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
              />
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value as IssueType)}
                  className="px-2 py-1 rounded text-xs"
                  style={{ border: '1px solid var(--border-default)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
                >
                  <option value="bug">Bug</option>
                  <option value="feature">Feature</option>
                  <option value="refactor">Refactor</option>
                  <option value="chore">Chore</option>
                </select>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as IssuePriority)}
                  className="px-2 py-1 rounded text-xs"
                  style={{ border: '1px solid var(--border-default)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
                >
                  <option value="P0">P0</option>
                  <option value="P1">P1</option>
                  <option value="P2">P2</option>
                </select>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as IssueStatus)}
                  className="px-2 py-1 rounded text-xs"
                  style={{ border: '1px solid var(--border-default)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
                >
                  <option value="pending">Pending</option>
                  <option value="tracking">Tracking</option>
                  <option value="tracked">Tracked</option>
                  <option value="in-progress">In Progress</option>
                  <option value="implemented">Implemented</option>
                  <option value="done">Done</option>
                </select>
                <input
                  type="text"
                  value={editTrackId}
                  onChange={(e) => setEditTrackId(e.target.value)}
                  placeholder="Track ID (optional)"
                  className="px-2 py-1 rounded text-xs w-48"
                  style={{ border: '1px solid var(--border-default)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
                />
                <div className="ml-auto flex gap-2">
                  <button onClick={() => setEditingId(null)} className="px-3 py-1 text-xs" style={{ color: 'var(--text-secondary)' }}>Cancel</button>
                  <button
                    onClick={handleUpdate}
                    disabled={updateIssue.isPending}
                    className="px-3 py-1 text-xs rounded"
                    style={{
                      background: updateIssue.isPending ? 'var(--bg-active)' : 'var(--accent-blue)',
                      color: updateIssue.isPending ? 'var(--text-tertiary)' : 'var(--text-inverse)',
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Readonly Detail Panel */
            <div className="px-4 py-3 space-y-3">
              {issue.description ? (
                <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>{issue.description}</p>
              ) : (
                <p className="text-sm italic" style={{ color: 'var(--text-tertiary)' }}>No description</p>
              )}

              {/* Track Detail: Analysis + Plan (only for issues with trackId) */}
              {issue.trackId && (specData || planData) && (
                <div className="space-y-3 pt-1">
                  {/* Analysis section — from spec.md */}
                  {specData?.spec && (() => {
                    const spec = specData.spec
                    // Extract Summary section
                    const summaryMatch = spec.match(/## Summary\s*\n([\s\S]*?)(?=\n## |\n---|\n_Generated)/m)
                    const summary = summaryMatch?.[1]?.trim()
                    // Extract Acceptance Criteria
                    const acMatch = spec.match(/## Acceptance Criteria\s*\n([\s\S]*?)(?=\n## |\n---|\n_Generated)/m)
                    const acRaw = acMatch?.[1]?.trim()
                    const acItems = acRaw
                      ? acRaw.split('\n').filter(l => /^- \[.\]/.test(l.trim())).map(l => {
                          const checked = /^- \[x\]/i.test(l.trim())
                          const text = l.trim().replace(/^- \[.\]\s*/, '')
                          return { checked, text }
                        })
                      : []

                    if (!summary && acItems.length === 0) return null

                    return (
                      <div className="rounded-lg p-3" style={{ background: 'var(--bg-inset)', border: '1px solid var(--border-subtle)' }}>
                        <div className="flex items-center gap-1.5 mb-2">
                          <FileText className="w-3.5 h-3.5" style={{ color: 'var(--accent-blue)' }} />
                          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--accent-blue)' }}>Analysis</span>
                        </div>
                        {summary && (
                          <p className="text-xs leading-relaxed mb-2" style={{ color: 'var(--text-secondary)' }}>{summary}</p>
                        )}
                        {acItems.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>Acceptance Criteria:</span>
                            {acItems.map((item, i) => (
                              <div key={i} className="flex items-start gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                                <span className="shrink-0 mt-0.5" style={{ color: item.checked ? 'var(--accent-green)' : 'var(--text-tertiary)' }}>
                                  {item.checked ? '✓' : '○'}
                                </span>
                                <span className={item.checked ? 'line-through opacity-60' : ''}>{item.text}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })()}

                  {/* Plan section — from plan.md */}
                  {planData?.plan && (() => {
                    const plan = planData.plan
                    // Parse tasks: lines matching "- [x] Task X.Y: ..." or "- [ ] Task X.Y: ..."
                    const taskLines = plan.split('\n').filter(l => /^- \[.\]\s*Task\s+\d/i.test(l.trim()))
                    const tasks = taskLines.map(l => {
                      const checked = /^- \[x\]/i.test(l.trim())
                      const text = l.trim().replace(/^- \[.\]\s*/, '')
                      return { checked, text }
                    })
                    // Parse status from header
                    const statusMatch = plan.match(/\*\*Status:\*\*\s*\[(.)\]/)
                    const trackStatus = statusMatch?.[1] === 'x' ? 'Complete' : statusMatch?.[1] === '~' ? 'In Progress' : 'Not Started'

                    if (tasks.length === 0) return null

                    const completedCount = tasks.filter(t => t.checked).length

                    return (
                      <div className="rounded-lg p-3" style={{ background: 'var(--bg-inset)', border: '1px solid var(--border-subtle)' }}>
                        <div className="flex items-center gap-1.5 mb-2">
                          <ListChecks className="w-3.5 h-3.5" style={{ color: 'var(--accent-purple)' }} />
                          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--accent-purple)' }}>Plan</span>
                          <span className="ml-auto text-xs" style={{ color: 'var(--text-tertiary)' }}>
                            {completedCount}/{tasks.length} tasks · {trackStatus}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {tasks.map((task, i) => (
                            <div key={i} className="flex items-start gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                              <span className="shrink-0 mt-0.5" style={{ color: task.checked ? 'var(--accent-green)' : 'var(--text-tertiary)' }}>
                                {task.checked ? '✓' : '○'}
                              </span>
                              <span className={task.checked ? 'line-through opacity-60' : ''}>{task.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}

              {/* ISS-039: Verify Results — show when issue has persisted verifyResult */}
              {/* ISS-041: Show manual done hint when no verifyResult */}
              {issue.verifyResult ? (
                <VerifyResultPanel verifyResult={issue.verifyResult} />
              ) : isDone && (
                <div className="rounded-lg p-3 flex items-center gap-2" style={{ background: 'var(--bg-inset)', border: '1px solid var(--border-subtle)' }}>
                  <UserCheck className="w-4 h-4 shrink-0" style={{ color: 'var(--text-tertiary)' }} />
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    Manually marked as done — no automated test verification
                  </span>
                </div>
              )}

              <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <span>Created: {new Date(issue.createdAt).toLocaleString()}</span>
                {issue.updatedAt && <span>Updated: {new Date(issue.updatedAt).toLocaleString()}</span>}
                {issue.trackId && (
                  <span className="flex items-center gap-0.5" style={{ color: 'var(--accent-blue)' }}>
                    <ExternalLink className="w-3 h-3" />
                    {issue.trackId}
                  </span>
                )}
              </div>
              <div className="flex justify-end pt-1">
                <button
                  onClick={(e) => { e.stopPropagation(); startEdit(issue) }}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
                  style={{ color: 'var(--text-secondary)', background: 'var(--bg-inset)' }}
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
          isTracking={isTracking || isOptimisticTracking}
          onRetry={() => { setIssueTracking(issue.id, true); createTrack.mutate({ id: issue.id }) }}
        />
      )}

      {/* Implement progress panel — shown when implement session exists */}
      {showImplement && !isEditing && (
        <ImplementPanel
          issueId={issue.id}
          trackId={implementSession!.trackId}
        />
      )}

      {/* Verify progress panel — shown when verify is active or has messages */}
      {showVerify && !isEditing && (
        <VerifyProgressPanel
          issueId={issue.id}
          onRetry={() => {
            const verifyStore = useIssueTrackStore.getState()
            verifyStore.clearVerify(issue.id)
            verifyStore.setVerifyActive(issue.id, true)
            // Re-trigger verify via API would need import; handled by parent handleVerify
          }}
        />
      )}
    </div>
  )
}

/** ISS-039: Collapsible verify result panel shown in expanded issue detail */
function VerifyResultPanel({ verifyResult }: { verifyResult: { unitTest: { success: boolean; output: string }; uiTest: { success: boolean; output: string }; verifiedAt: string } }) {
  const [expanded, setExpanded] = useState(false)
  const allPassed = verifyResult.unitTest.success && verifyResult.uiTest.success

  const steps = [
    { label: 'Unit Tests (Vitest)', result: verifyResult.unitTest, skipped: false },
    { label: 'UI Tests (Playwright)', result: verifyResult.uiTest, skipped: !verifyResult.unitTest.success },
  ]

  return (
    <div className="rounded-lg p-3" style={{ background: 'var(--bg-inset)', border: '1px solid var(--border-subtle)' }}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 w-full text-left"
      >
        {expanded
          ? <ChevronDown className="w-3.5 h-3.5" style={{ color: allPassed ? 'var(--accent-green)' : 'var(--accent-red)' }} />
          : <ChevronRight className="w-3.5 h-3.5" style={{ color: allPassed ? 'var(--accent-green)' : 'var(--accent-red)' }} />
        }
        <FlaskConical className="w-3.5 h-3.5" style={{ color: allPassed ? 'var(--accent-green)' : 'var(--accent-red)' }} />
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: allPassed ? 'var(--accent-green)' : 'var(--accent-red)' }}>
          Test Results
        </span>
        <span
          className="ml-1 px-1.5 py-0.5 rounded text-xs font-medium"
          style={{
            background: allPassed ? 'var(--accent-green-dim)' : 'var(--accent-red-dim)',
            color: allPassed ? 'var(--accent-green)' : 'var(--accent-red)',
          }}
        >
          {allPassed ? 'ALL PASS' : 'FAILED'}
        </span>
        <span className="ml-auto text-xs" style={{ color: 'var(--text-tertiary)' }}>
          {new Date(verifyResult.verifiedAt).toLocaleString()}
        </span>
      </button>

      {expanded && (
        <div className="mt-2 space-y-2">
          {steps.map((step, i) => (
            <div key={i}>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="px-1.5 py-0.5 rounded text-xs font-medium"
                  style={{
                    background: step.skipped
                      ? 'var(--bg-inset)'
                      : step.result.success ? 'var(--accent-green-dim)' : 'var(--accent-red-dim)',
                    color: step.skipped
                      ? 'var(--text-secondary)'
                      : step.result.success ? 'var(--accent-green)' : 'var(--accent-red)',
                  }}
                >
                  {step.skipped ? 'SKIPPED' : step.result.success ? 'PASS' : 'FAIL'}
                </span>
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Step {i + 1}: {step.label}
                </span>
              </div>
              <pre
                className="text-xs p-2 rounded overflow-x-auto max-h-32 overflow-y-auto whitespace-pre-wrap"
                style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
              >
                {step.skipped
                  ? 'Skipped — unit tests failed'
                  : step.result.output || '(no output)'}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
