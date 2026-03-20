/**
 * TanStack Query hooks for all API endpoints
 */
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
    mutationFn: ({ caseId, action, params }: { caseId: string; action: string; params: Record<string, string> }) =>
      apiPost<{ status: string }>(`/todo/${caseId}/execute`, { action, params }),
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
