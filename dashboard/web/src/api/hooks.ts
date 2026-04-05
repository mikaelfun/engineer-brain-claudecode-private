/**
 * TanStack Query hooks for all API endpoints
 */
import { useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost, apiPatch, apiPut, apiDelete } from './client'
import { useTriggerRunStore } from '../stores/triggerRunStore'

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

export function useCaseOnenote(id: string) {
  return useQuery({
    queryKey: ['cases', id, 'onenote'],
    queryFn: () => apiGet<{ files: Array<{ filename: string; content: string; size: number; updatedAt: string }>; total: number }>(`/cases/${id}/onenote`),
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

export function useCaseClaims(id: string) {
  return useQuery({
    queryKey: ['cases', id, 'claims'],
    queryFn: () => apiGet<any>(`/cases/${id}/claims`),
    enabled: !!id,
  })
}

export function useChallengeReport(id: string) {
  return useQuery({
    queryKey: ['cases', id, 'challenge-report'],
    queryFn: () => apiGet<{ content: string | null }>(`/cases/${id}/challenge-report`),
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

// ---- Trigger hooks (self-managed cron jobs) ----

export function useTriggers() {
  return useQuery({
    queryKey: ['agents', 'triggers'],
    queryFn: () => apiGet<{ triggers: any[]; total: number }>('/agents/triggers'),
    refetchInterval: 30_000, // Refresh every 30s to show updated state
  })
}

export function useCreateTrigger() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; prompt: string; cron: string; description?: string }) =>
      apiPost<any>('/agents/triggers', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents', 'triggers'] })
      queryClient.invalidateQueries({ queryKey: ['agents', 'cron-jobs'] })
    },
  })
}

export function useDeleteTrigger() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiDelete<any>(`/agents/triggers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents', 'triggers'] })
      queryClient.invalidateQueries({ queryKey: ['agents', 'cron-jobs'] })
    },
  })
}

export function useRunTrigger() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiPost<any>(`/agents/triggers/${id}/run`, {}),
    onMutate: (id: string) => {
      // Optimistic update: immediately show running state before SSE arrives
      useTriggerRunStore.getState().onTriggerStarted(id)
    },
    onSuccess: () => {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['agents', 'triggers'] })
        queryClient.invalidateQueries({ queryKey: ['agents', 'cron-jobs'] })
      }, 2000)
    },
  })
}

export function useCancelTrigger() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiPost<any>(`/agents/triggers/${id}/cancel`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents', 'triggers'] })
      queryClient.invalidateQueries({ queryKey: ['agents', 'cron-jobs'] })
    },
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
    mutationFn: (force?: boolean) => apiPost<{ status: string }>('/patrol', { force: force ?? true }),
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

// ===== Test Lab =====

// --- Split state hooks (pipeline model) ---

export function useTestPipeline() {
  return useQuery({
    queryKey: ['tests', 'pipeline'],
    queryFn: async () => {
      try {
        return await apiGet<any>('/tests/pipeline')
      } catch (err: any) {
        if (err?.status === 404) return null
        throw err
      }
    },
    // SSE invalidation is primary; polling is fallback when SSE disconnects
    staleTime: 3_000,
    refetchInterval: 3_000,
    retry: (failureCount, error: any) => {
      if (error?.status === 404) return false
      return failureCount < 3
    },
  })
}

export function useTestSupervisor() {
  return useQuery({
    queryKey: ['tests', 'supervisor'],
    queryFn: async () => {
      try {
        return await apiGet<any>('/tests/supervisor')
      } catch (err: any) {
        if (err?.status === 404) return null
        throw err
      }
    },
    staleTime: 3_000,
    refetchInterval: 3_000,
    retry: (failureCount, error: any) => {
      if (error?.status === 404) return false
      return failureCount < 3
    },
  })
}

export function useTestQueues() {
  return useQuery({
    queryKey: ['tests', 'queues'],
    queryFn: async () => {
      try {
        return await apiGet<any>('/tests/queues')
      } catch (err: any) {
        if (err?.status === 404) return null
        throw err
      }
    },
    staleTime: 3_000,
    refetchInterval: 5_000,
    retry: (failureCount, error: any) => {
      if (error?.status === 404) return false
      return failureCount < 3
    },
  })
}

export function useTestStats() {
  return useQuery({
    queryKey: ['tests', 'stats'],
    queryFn: async () => {
      try {
        return await apiGet<any>('/tests/stats')
      } catch (err: any) {
        if (err?.status === 404) return null
        throw err
      }
    },
    staleTime: 3_000,
    refetchInterval: 5_000,
    retry: (failureCount, error: any) => {
      if (error?.status === 404) return false
      return failureCount < 3
    },
  })
}

// --- Assembled state hook (backward compat — still available for components using full state) ---

export function useTestState() {
  return useQuery({
    queryKey: ['tests', 'state'],
    queryFn: async () => {
      try {
        return await apiGet<any>('/tests/state')
      } catch (err: any) {
        if (err?.status === 404) return null
        throw err
      }
    },
    refetchInterval: 30_000,
    retry: (failureCount, error: any) => {
      if (error?.status === 404) return false
      return failureCount < 3
    },
  })
}

export function useTestDiscoveries() {
  return useQuery({
    queryKey: ['tests', 'discoveries'],
    queryFn: async () => {
      try {
        return await apiGet<any>('/tests/discoveries')
      } catch (err: any) {
        if (err?.status === 404) return null
        throw err
      }
    },
    refetchInterval: 60_000,
    retry: (failureCount, error: any) => {
      if (error?.status === 404) return false
      return failureCount < 3
    },
  })
}

export function useTestTrends() {
  return useQuery({
    queryKey: ['tests', 'trends'],
    queryFn: () => apiGet<any[]>('/tests/trends'),
    staleTime: 60_000,
  })
}

export function useTestRegistry() {
  return useQuery({
    queryKey: ['tests', 'registry'],
    queryFn: async () => {
      try {
        return await apiGet<Record<string, any>>('/tests/registry')
      } catch (err: any) {
        if (err?.status === 404) return {}
        throw err
      }
    },
    staleTime: 5 * 60 * 1000, // 5 min — registry rarely changes
    retry: (failureCount, error: any) => {
      if (error?.status === 404) return false
      return failureCount < 3
    },
  })
}

export function useRunnerStatus() {
  return useQuery({
    queryKey: ['tests', 'runner-status'],
    queryFn: () => apiGet<{
      status: 'idle' | 'running' | 'paused' | 'waiting' | 'external'
      source?: string | null
      supervisorStatus?: string | null
      startedAt: string | null
      lastRunAt: string | null
      loop: boolean
      intervalMinutes: number
      runsCompleted: number
      nextRunAt: string | null
    }>('/tests/runner/status'),
    refetchInterval: 5_000,
  })
}

export function useRunnerStart() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (opts?: { loop?: boolean; intervalMinutes?: number }) =>
      apiPost<{ status: string }>('/tests/runner/start', opts || {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests', 'runner-status'] })
    },
  })
}

export function useRunnerStop() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => apiPost<{ status: string }>('/tests/runner/stop'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests', 'runner-status'] })
    },
  })
}

export function useTestEvolution() {
  return useQuery({
    queryKey: ['tests', 'evolution'],
    queryFn: async () => {
      try {
        return await apiGet<any[]>('/tests/evolution')
      } catch (err: any) {
        if (err?.status === 404) return []
        throw err
      }
    },
    staleTime: 60_000,
    retry: (failureCount, error: any) => {
      if (error?.status === 404) return false
      return failureCount < 3
    },
  })
}

export function useTestStory() {
  return useQuery({
    queryKey: ['tests', 'story'],
    queryFn: async () => {
      try {
        return await apiGet<any>('/tests/story')
      } catch (err: any) {
        if (err?.status === 404) return null
        throw err
      }
    },
    staleTime: 30_000,
    retry: (failureCount, error: any) => {
      if (error?.status === 404) return false
      return failureCount < 3
    },
  })
}

export function useFeatureMap() {
  return useQuery({
    queryKey: ['tests', 'feature-map'],
    queryFn: async () => {
      try {
        return await apiGet<any>('/tests/feature-map')
      } catch (err: any) {
        if (err?.status === 404) return null
        throw err
      }
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
    retry: (failureCount, error: any) => {
      if (error?.status === 404) return false
      return failureCount < 3
    },
  })
}

// ===== Skills =====

export interface SkillInfo {
  name: string
  displayName: string
  description: string
  category: 'inline' | 'agent' | 'orchestrator'
  stability: 'stable' | 'beta' | 'dev'
  requiredInput?: string
  estimatedDuration?: string
  steps?: string[]
  webUiAlias?: string
}

export function useSkills() {
  return useQuery<SkillInfo[]>({
    queryKey: ['skills'],
    queryFn: () => apiGet<SkillInfo[]>('/skills'),
    staleTime: 60_000,
  })
}

// ===== Test Results (Morning Report) =====

export interface TestResultEvent {
  ts?: string
  type: string
  impact?: string
  area?: string
  detail?: string
  result?: string
  method?: string
  chosen?: string
  confidence?: string | number
  delta?: string
  [key: string]: unknown
}

export interface TestResultSummary {
  verified_pass: number
  verified_fail: number
  bugs: number
  fixed: number
  fix_failed: number
  needs_human: number
  perf_regressions: number
  perf_improved: number
  ui_issues: number
}

export interface TestResultData {
  runDate: string
  duration: string
  cycles: number
  summary: TestResultSummary
  events: TestResultEvent[]
  byArea: Record<string, TestResultEvent[]>
  byImpact: Record<string, TestResultEvent[]>
  competitiveFixes: TestResultEvent[]
}

export function useTestReportDates() {
  return useQuery<{ dates: string[] }>({
    queryKey: ['tests', 'report-dates'],
    queryFn: () => apiGet<{ dates: string[] }>('/tests/report-dates'),
    staleTime: 60_000,
  })
}

export function useTestReport(date?: string) {
  return useQuery<TestResultData>({
    queryKey: ['tests', 'report', date ?? 'latest'],
    queryFn: () =>
      date
        ? apiGet<TestResultData>(`/tests/report/${date}`)
        : apiGet<TestResultData>('/tests/report'),
    staleTime: 60_000,
    retry: (failureCount, error: any) => {
      if (error?.status === 404) return false
      return failureCount < 3
    },
  })
}

// ===== Note Gap =====

export interface NoteGapStatus {
  hasGap: boolean
  draft: {
    title: string
    body: string
    gapDays: number
    lastNoteDate: string
    generatedAt: string
  } | null
}

export function useNoteGap(caseId: string) {
  return useQuery<NoteGapStatus>({
    queryKey: ['note-gap', caseId],
    queryFn: () => apiGet<NoteGapStatus>(`/case/${caseId}/note-gap`),
    enabled: !!caseId,
    refetchInterval: 30_000,
  })
}

export function useSubmitNote(caseId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { title: string; body: string }) =>
      apiPost(`/case/${caseId}/note-gap/submit`, data),
    // Don't invalidate immediately — let the component show success state first
    // Component calls delayedInvalidate() after showing feedback
  })
}

/** Call after showing success feedback to clear the note gap card */
export function useInvalidateNoteGap(caseId: string) {
  const qc = useQueryClient()
  return () => qc.invalidateQueries({ queryKey: ['note-gap', caseId] })
}

export function useDismissNoteGap(caseId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => apiDelete(`/case/${caseId}/note-gap`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['note-gap', caseId] })
    },
  })
}

// ===== Batch Note Gaps =====

export interface NoteGapItem {
  caseNumber: string
  title: string
  body: string
  gapDays: number
  lastNoteDate: string
  generatedAt: string
}

export function useAllNoteGaps() {
  return useQuery<{ gaps: NoteGapItem[] }>({
    queryKey: ['note-gaps-all'],
    queryFn: () => apiGet<{ gaps: NoteGapItem[] }>('/note-gaps'),
    refetchInterval: 30_000,
  })
}

export interface BatchCheckResult {
  checked: number
  gaps: number
  generated: number
  skipped: number
  details: Array<{
    caseNumber: string
    status: 'gap' | 'ok' | 'no-notes' | 'already-has-draft'
    gapDays?: number
    lastNoteDate?: string
  }>
}

export function useCheckAllNoteGaps() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => apiPost<BatchCheckResult>('/note-gaps', {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['note-gaps-all'] })
    },
  })
}

// ===== Labor Estimate =====

export interface LaborEstimateItem {
  date: string
  caseNumber: string
  caseTitle?: string
  estimated: {
    totalMinutes: number
    classification: string
    description: string
    breakdown: Array<{ type: string; minutes: number; detail: string }>
  }
  final: {
    totalMinutes: number
    classification: string
    description: string
  } | null
  status: 'pending' | 'confirmed' | 'submitted'
}

export function useLaborEstimates() {
  return useQuery({
    queryKey: ['labor-estimates'],
    queryFn: () => apiGet<{ estimates: LaborEstimateItem[]; total: number }>('/labor-estimate'),
    refetchInterval: 10_000,
  })
}

export function useLaborEstimate(caseNumber: string) {
  return useQuery({
    queryKey: ['labor-estimate', caseNumber],
    queryFn: () => apiGet<{ estimate: LaborEstimateItem | null; exists: boolean }>(`/labor-estimate/${caseNumber}`),
    enabled: !!caseNumber,
  })
}

export function useLaborEstimateTrigger() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (caseNumber: string) =>
      apiPost<{ success: boolean; estimate: LaborEstimateItem | null }>(`/labor-estimate/${caseNumber}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labor-estimates'] })
    },
  })
}

export function useLaborEstimateAll() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () =>
      apiPost<{
        success: boolean
        estimates: Array<{ caseNumber: string; success: boolean; estimate?: LaborEstimateItem | null; error?: string }>
        total: number
      }>('/labor-estimate/all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labor-estimates'] })
    },
  })
}

export function useLaborEstimateUpdate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ caseNumber, ...body }: {
      caseNumber: string
      totalMinutes?: number
      classification?: string
      description?: string
    }) => apiPut<{ success: boolean; estimate: LaborEstimateItem }>(`/labor-estimate/${caseNumber}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labor-estimates'] })
    },
  })
}

export function useLaborSubmit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ caseNumber, ...body }: {
      caseNumber: string
      totalMinutes: number
      classification: string
      description: string
    }) => apiPost<{ success: boolean; message: string }>(`/labor-estimate/${caseNumber}/submit`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labor-estimates'] })
    },
  })
}

export function useLaborBatchSubmit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (items: Array<{
      caseNumber: string
      totalMinutes: number
      classification: string
      description: string
    }>) => apiPost<{
      results: Array<{ caseNumber: string; success: boolean; message: string }>
      total: number
      succeeded: number
      failed: number
    }>('/labor-estimate/batch-submit', { items }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labor-estimates'] })
    },
  })
}
