/**
 * TanStack Query hooks for all API endpoints
 */
import { useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost, apiPatch, apiPut, apiDelete } from './client'

// ===== Cases =====

export function useCases() {
  return useQuery({
    queryKey: ['cases'],
    queryFn: () => apiGet<{ cases: any[]; total: number }>('/cases'),
    refetchInterval: 60_000,
  })
}

export function useCaseStats() {
  return useQuery({
    queryKey: ['cases', 'stats'],
    queryFn: () => apiGet<any>('/cases/stats'),
    refetchInterval: 60_000,
  })
}

export function useCaseDetail(id: string) {
  return useQuery({
    queryKey: ['cases', id],
    queryFn: () => apiGet<any>(`/cases/${id}`),
    enabled: !!id,
  })
}

export function useCaseEmails(id: string) {
  return useQuery({
    queryKey: ['cases', id, 'emails'],
    queryFn: () => apiGet<{ emails: any[]; total: number }>(`/cases/${id}/emails`),
    enabled: !!id,
  })
}

export function useCaseNotes(id: string) {
  return useQuery({
    queryKey: ['cases', id, 'notes'],
    queryFn: () => apiGet<{ notes: any[]; total: number }>(`/cases/${id}/notes`),
    enabled: !!id,
  })
}

export function useCaseTeams(id: string) {
  return useQuery({
    queryKey: ['cases', id, 'teams'],
    queryFn: () => apiGet<{ chats: any[]; total: number }>(`/cases/${id}/teams`),
    enabled: !!id,
  })
}

export function useCaseMeta(id: string) {
  return useQuery({
    queryKey: ['cases', id, 'meta'],
    queryFn: () => apiGet<any>(`/cases/${id}/meta`),
    enabled: !!id,
  })
}

export function useCaseAnalysis(id: string) {
  return useQuery({
    queryKey: ['cases', id, 'analysis'],
    queryFn: () => apiGet<{ content: string; exists: boolean }>(`/cases/${id}/analysis`),
    enabled: !!id,
  })
}

export function useCaseDrafts(id: string) {
  return useQuery({
    queryKey: ['cases', id, 'drafts'],
    queryFn: () => apiGet<{ drafts: any[]; total: number }>(`/cases/${id}/drafts`),
    enabled: !!id,
  })
}

export function useCaseInspection(id: string) {
  return useQuery({
    queryKey: ['cases', id, 'inspection'],
    queryFn: () => apiGet<{ content: string; filename: string; exists: boolean; updatedAt?: string; allFiles: string[] }>(`/cases/${id}/inspection`),
    enabled: !!id,
  })
}

export function useCaseTodo(id: string) {
  return useQuery({
    queryKey: ['cases', id, 'todo'],
    queryFn: () => apiGet<{ files: Array<{ filename: string; updatedAt: string }>; latest: { filename: string; content: string; updatedAt: string } | null; total: number }>(`/cases/${id}/todo`),
    enabled: !!id,
  })
}

export function useCaseTodoFile(id: string, filename: string | null) {
  return useQuery({
    queryKey: ['cases', id, 'todo', filename],
    queryFn: () => apiGet<{ file: { filename: string; content: string; updatedAt: string } }>(`/cases/${id}/todo`, { filename }),
    enabled: !!id && !!filename,
  })
}

export function useToggleCaseTodo(caseId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ lineNumber, checked, filename }: { lineNumber: number; checked: boolean; filename?: string }) =>
      apiPatch(`/cases/${caseId}/todo/toggle`, { lineNumber, checked, filename }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases', caseId, 'todo'] })
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}

export function useCaseTiming(id: string) {
  return useQuery({
    queryKey: ['cases', id, 'timing'],
    queryFn: () => apiGet<{ exists: boolean; timing: any }>(`/cases/${id}/timing`),
    enabled: !!id,
  })
}

export function useCaseLogs(id: string) {
  return useQuery({
    queryKey: ['cases', id, 'logs'],
    queryFn: () => apiGet<{ logs: Array<{ filename: string; content: string; size: number; updatedAt: string }>; total: number }>(`/cases/${id}/logs`),
    enabled: !!id,
  })
}

export function useCaseAttachments(id: string) {
  return useQuery({
    queryKey: ['cases', id, 'attachments'],
    queryFn: () => apiGet<{ meta: any; files: Array<{ filename: string; size: number; updatedAt: string }>; total: number }>(`/cases/${id}/attachments`),
    enabled: !!id,
  })
}

// ===== Todos =====

export function useTodoList() {
  return useQuery({
    queryKey: ['todos'],
    queryFn: () => apiGet<{ files: any[]; total: number }>('/todos'),
  })
}

export function useTogglePerCaseTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ caseNumber, lineNumber, checked, filename }: { caseNumber: string; lineNumber: number; checked: boolean; filename?: string }) =>
      apiPatch(`/cases/${caseNumber}/todo/toggle`, { lineNumber, checked, filename }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      queryClient.invalidateQueries({ queryKey: ['cases'] })
    },
  })
}

// ===== Agents =====

export function useAgents() {
  return useQuery({
    queryKey: ['agents'],
    queryFn: () => apiGet<{ agents: any[]; total: number }>('/agents'),
  })
}

export function useCronJobs() {
  return useQuery({
    queryKey: ['agents', 'cron-jobs'],
    queryFn: () => apiGet<{ jobs: any[]; total: number }>('/agents/cron-jobs'),
  })
}

export function usePatrolState() {
  return useQuery({
    queryKey: ['agents', 'patrol-state'],
    queryFn: async () => {
      try {
        return await apiGet<any>('/agents/patrol-state')
      } catch (err: any) {
        // 404 = no patrol state file yet, treat as "no data" rather than error
        if (err?.status === 404) return null
        throw err
      }
    },
    refetchInterval: 15_000,
    retry: (failureCount, error: any) => {
      // Don't retry on 404 (expected when no patrol state exists)
      if (error?.status === 404) return false
      return failureCount < 3
    },
  })
}

// ===== Drafts =====

export function useDrafts() {
  return useQuery({
    queryKey: ['drafts'],
    queryFn: () => apiGet<{ drafts: any[]; total: number }>('/drafts'),
  })
}

// ===== Health =====

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => apiGet<any>('/health'),
    refetchInterval: 60_000,
  })
}

// ===== Case AI Processing =====

export function useProcessCase() {
  return useMutation({
    mutationFn: ({ caseId, intent }: { caseId: string; intent?: string }) =>
      apiPost<{ status: string; caseNumber: string }>(`/case/${caseId}/process`, { intent }),
  })
}

/** @deprecated No consumers — use CaseAIPanel's direct SSE-based chat instead. Remove when confirmed safe. */
export function useChatCase() {
  return useMutation({
    mutationFn: ({ caseId, sessionId, message }: { caseId: string; sessionId: string; message: string }) =>
      apiPost<{ status: string; sessionId: string }>(`/case/${caseId}/chat`, { sessionId, message }),
  })
}

/** All active operations — used by Dashboard to disable action buttons for busy cases */
export function useActiveOperations() {
  return useQuery({
    queryKey: ['operations', 'active'],
    queryFn: () => apiGet<{ operations: Array<{ caseNumber: string; operationType: string; startedAt: string }>; total: number }>('/operations/active'),
    refetchInterval: 5_000,
  })
}

export function useEndCaseSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ caseId, sessionId }: { caseId: string; sessionId?: string }) =>
      apiDelete<{ success: boolean }>(`/case/${caseId}/session`, { sessionId }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['case-sessions', vars.caseId] })
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    },
  })
}

export function useEndAllCaseSessions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (caseId: string) =>
      apiPost<{ success: boolean; endedCount: number }>(`/case/${caseId}/session/end-all`),
    onSuccess: (_, caseId) => {
      queryClient.invalidateQueries({ queryKey: ['case-sessions', caseId] })
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    },
  })
}

export function useCaseSessions(caseId: string) {
  return useQuery({
    queryKey: ['case-sessions', caseId],
    queryFn: () => apiGet<{ sessions: any[]; activeSession: string | null }>(`/case/${caseId}/sessions`),
    enabled: !!caseId,
    refetchInterval: 10_000,
  })
}

/** Check if a case has an active operation (for preventing duplicate spawn) */
export function useCaseOperation(caseId: string) {
  return useQuery({
    queryKey: ['case-operation', caseId],
    queryFn: () => apiGet<{ caseNumber: string; operation: { caseNumber: string; operationType: string; startedAt: string } | null }>(`/case/${caseId}/operation`),
    enabled: !!caseId,
    refetchInterval: 3_000, // Poll frequently to catch operation start/end
  })
}

/** Get persisted messages for a case (recovery after page refresh) */
export function useCaseMessages(caseId: string) {
  return useQuery({
    queryKey: ['case-messages', caseId],
    queryFn: () => apiGet<{ caseNumber: string; messages: Array<{ type: string; content: string; toolName?: string; step?: string; timestamp: string }> }>(`/case/${caseId}/messages`),
    enabled: !!caseId,
  })
}

// ===== Sessions (global) =====

export function useAllSessions(status?: string) {
  return useQuery({
    queryKey: ['sessions', { status }],
    queryFn: () => apiGet<{ sessions: any[]; total: number }>('/sessions', status ? { status } : undefined),
    refetchInterval: 15_000,
  })
}

// ===== Unified Sessions =====

export interface UnifiedSession {
  id: string
  type: 'case' | 'implement' | 'verify' | 'track-creation'
  status: 'active' | 'paused' | 'completed' | 'failed'
  context: string
  intent: string
  startedAt: string
  lastActivityAt: string
  metadata?: Record<string, any>
}

export function useUnifiedSessions(type?: string, status?: string) {
  return useQuery({
    queryKey: ['sessions', 'all', { type, status }],
    queryFn: () => {
      const params: Record<string, string> = {}
      if (type) params.type = type
      if (status) params.status = status
      return apiGet<{ sessions: UnifiedSession[]; total: number }>('/sessions/all', Object.keys(params).length ? params : undefined)
    },
    refetchInterval: 10_000,
  })
}

/**
 * Returns a Set of issueIds that have active track-creation sessions on the backend.
 * Used by Issues page to detect and recover sessions missed by SSE (ISS-055).
 */
export function useActiveTrackSessions(): Set<string> {
  const { data } = useUnifiedSessions('track-creation')
  return useMemo(() => {
    if (!data?.sessions?.length) return EMPTY_ACTIVE_SET
    const activeIds = new Set<string>()
    for (const s of data.sessions) {
      if (s.status === 'active') {
        activeIds.add(s.context) // context = issueId for track-creation sessions
      }
    }
    return activeIds.size > 0 ? activeIds : EMPTY_ACTIVE_SET
  }, [data])
}

const EMPTY_ACTIVE_SET = new Set<string>()

// ===== Patrol =====

export function useStartPatrol() {
  return useMutation({
    mutationFn: () => apiPost<{ status: string }>('/patrol'),
  })
}

export function useCancelPatrol() {
  return useMutation({
    mutationFn: () => apiPost<{ success: boolean; message: string }>('/patrol/cancel'),
  })
}

// ===== Todo All =====

export function useTodoAll() {
  return useQuery({
    queryKey: ['todos', 'all'],
    queryFn: () => apiGet<{ todos: any[]; total: number }>('/todos/all'),
    refetchInterval: 30_000,
  })
}

export function useExecuteTodoAction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ caseId, action, params, lineNumber }: { caseId: string; action: string; params: Record<string, string>; lineNumber?: number }) =>
      apiPost<{ status: string }>(`/todo/${caseId}/execute`, { action, params, lineNumber }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}

// ===== Settings =====

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => apiGet<Record<string, any>>('/settings'),
  })
}

export function useSaveSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (settings: Record<string, any>) =>
      apiPut<{ success: boolean; config: Record<string, any> }>('/settings', settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
  })
}

// ===== Issues =====

export function useIssues(params?: { status?: string; type?: string; priority?: string; page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: ['issues', params],
    queryFn: () => apiGet<{ issues: any[]; total: number; page: number; pageSize: number; totalPages: number }>('/issues', params),
    refetchInterval: 30_000,
  })
}

export function useCreateIssue() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { title: string; description?: string; type?: string; priority?: string }) =>
      apiPost<any>('/issues', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] })
    },
  })
}

export function useUpdateIssue() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; [key: string]: any }) =>
      apiPut<any>(`/issues/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] })
    },
  })
}

export function useDeleteIssue() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiDelete<any>(`/issues/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] })
    },
  })
}

export function useCreateTrack() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, extraContext }: { id: string; extraContext?: string }) =>
      apiPost<any>(`/issues/${id}/create-track`, extraContext ? { extraContext } : {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] })
    },
  })
}

export function useCancelTrack() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiPost<{ ok: boolean; message: string }>(`/issues/${id}/cancel-track`),
    onMutate: async (id: string) => {
      // ISS-061: Optimistic update — immediately flip issue.status from 'tracking' to 'pending'
      // so that isTracking (derived from issue.status === 'tracking') becomes false instantly
      await queryClient.cancelQueries({ queryKey: ['issues'] })
      // Update all matching issue queries in cache
      queryClient.setQueriesData<{ issues: any[]; total: number; page: number; pageSize: number; totalPages: number }>(
        { queryKey: ['issues'] },
        (old) => {
          if (!old?.issues) return old
          return {
            ...old,
            issues: old.issues.map((issue: any) =>
              issue.id === id ? { ...issue, status: 'pending' } : issue
            ),
          }
        }
      )
      // Also invalidate unified sessions to prevent ISS-055 recovery effect from re-arming
      queryClient.invalidateQueries({ queryKey: ['sessions', 'all', { type: 'track-creation' }] })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] })
    },
  })
}

export function useCancelVerify() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiPost<{ ok: boolean; message: string }>(`/issues/${id}/cancel-verify`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] })
    },
  })
}

export function useStartImplement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiPost<any>(`/issues/${id}/start-implement`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] })
    },
  })
}

export function useVerifyIssue() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiPost<{ message: string }>(`/issues/${id}/verify`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] })
    },
  })
}

export function useReopenIssue() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiPost<any>(`/issues/${id}/reopen`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] })
    },
  })
}

export function useMarkDone() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiPost<any>(`/issues/${id}/mark-done`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] })
    },
  })
}

export function useTrackPlan(issueId: string, trackId?: string) {
  return useQuery({
    queryKey: ['track-plan', issueId],
    queryFn: () => apiGet<{ plan: string; trackId: string }>(`/issues/${issueId}/track-plan`),
    enabled: !!trackId,
  })
}

export function useTrackSpec(issueId: string, enabled: boolean = false) {
  return useQuery({
    queryKey: ['track-spec', issueId],
    queryFn: () => apiGet<{ spec: string; trackId: string }>(`/issues/${issueId}/track-spec`),
    enabled,
  })
}

export function useTrackProgress(issueId: string, enabled: boolean = false) {
  return useQuery({
    queryKey: ['track-progress', issueId],
    queryFn: () => apiGet<{ messages: any[]; isActive: boolean; pendingQuestion: any | null }>(`/issues/${issueId}/track-progress`),
    enabled,
  })
}

export function useAnswerTrackQuestion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, answer }: { id: string; answer: string }) =>
      apiPost<{ ok: boolean }>(`/issues/${id}/track-answer`, { answer }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] })
    },
  })
}

/** Fetch implement status for page-refresh recovery */
export function useImplementStatus(issueId: string, enabled: boolean = false) {
  return useQuery({
    queryKey: ['implement-status', issueId],
    queryFn: () => apiGet<{
      active: boolean
      status: 'active' | 'completed' | 'failed' | 'none'
      messages: Array<{ type: string; content: string; toolName?: string; timestamp: string }>
      trackId?: string
      startedAt?: string
    }>(`/issues/${issueId}/implement-status`),
    enabled,
  })
}

/** Fetch verify status for page-refresh recovery and polling fallback (ISS-054) */
export function useVerifyStatus(issueId: string, enabled: boolean = false, refetchInterval?: number | false) {
  return useQuery({
    queryKey: ['verify-status', issueId, refetchInterval ? 'polling' : 'recovery'],
    queryFn: () => apiGet<{
      active: boolean
      status: 'active' | 'completed' | 'failed' | 'none'
      messages: Array<{ kind: string; content: string; toolName?: string; timestamp: string }>
      result?: { unitTest?: { passed: boolean; output: string }; uiTest?: { passed: boolean; output: string }; overall: boolean }
      startedAt?: string
    }>(`/issues/${issueId}/verify-status`),
    enabled,
    refetchInterval: refetchInterval ?? false,
  })
}

/** Fetch step progress for page-refresh recovery (caseSessionStore hydration) */
export function useCaseStepProgress(caseNumber: string, enabled: boolean = false) {
  return useQuery({
    queryKey: ['case-step-progress', caseNumber],
    queryFn: () => apiGet<{
      messages: Array<{
        kind: string
        content?: string
        toolName?: string
        step?: string
        error?: string
        questions?: Array<{ question: string; header?: string; options?: Array<{ label: string; description?: string }>; multiSelect?: boolean }>
        sessionId?: string
        timestamp: string
      }>
      isActive: boolean
      pendingQuestion: { sessionId: string; questions: Array<{ question: string; header?: string; options?: Array<{ label: string; description?: string }>; multiSelect?: boolean }> } | null
      currentStep: string | null
      executionId: string | null
    }>(`/case/${caseNumber}/step-progress`),
    enabled,
  })
}

/** Submit an answer to a case step pending question */
export function useAnswerStepQuestion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ caseNumber, answer }: { caseNumber: string; answer: string }) =>
      apiPost<{ ok: boolean }>(`/case/${caseNumber}/step-answer`, { answer }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['case-step-progress', vars.caseNumber] })
    },
  })
}

// ===== Restart =====

export function useRestartFrontend() {
  return useMutation({
    mutationFn: () => apiPost<{ success: boolean; message: string }>('/restart/frontend'),
  })
}

export function useRestartBackend() {
  return useMutation({
    mutationFn: () => apiPost<{ success: boolean; message: string }>('/restart/backend'),
  })
}

export function useRestartAll() {
  return useMutation({
    mutationFn: () => apiPost<{ success: boolean; message: string }>('/restart/all'),
  })
}
