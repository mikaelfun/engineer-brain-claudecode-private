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

// ===== Todos =====

export function useTodoList() {
  return useQuery({
    queryKey: ['todos'],
    queryFn: () => apiGet<{ files: any[]; total: number }>('/todos'),
  })
}

export function useLatestTodo() {
  return useQuery({
    queryKey: ['todos', 'latest'],
    queryFn: () => apiGet<any>('/todos/latest'),
    refetchInterval: 30_000,
  })
}

export function useTodoByDate(date: string) {
  return useQuery({
    queryKey: ['todos', date],
    queryFn: () => apiGet<any>(`/todos/${date}`),
    enabled: !!date,
  })
}

export function useToggleTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ date, lineNumber, checked }: { date: string; lineNumber: number; checked: boolean }) =>
      apiPatch(`/todos/${date}/items/${lineNumber}`, { checked }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
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
    queryFn: () => apiGet<any>('/agents/patrol-state'),
    refetchInterval: 15_000,
  })
}

// ===== Drafts =====

export function useDrafts() {
  return useQuery({
    queryKey: ['drafts'],
    queryFn: () => apiGet<{ drafts: any[]; total: number }>('/drafts'),
  })
}

// ===== AI =====

export function useAnalyzeCase() {
  return useMutation({
    mutationFn: (caseId: string) => apiPost<{ analysis: string }>(`/ai/analyze-case/${caseId}`),
  })
}

export function useAnalyzeAll() {
  return useMutation({
    mutationFn: () => apiPost<{ analysis: string }>('/ai/analyze-all'),
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

// ===== Workflow =====

export function useWorkflowConfigs() {
  return useQuery({
    queryKey: ['workflow', 'configs'],
    queryFn: () => apiGet<{ configs: any[] }>('/workflow/configs'),
  })
}

export function useWorkflowSessions(limit = 20, status?: string) {
  return useQuery({
    queryKey: ['workflow', 'sessions', { limit, status }],
    queryFn: () => apiGet<{ sessions: any[]; total: number }>('/workflow/sessions', { limit, status }),
    refetchInterval: 30_000,
  })
}

export function useWorkflowSession(id: string) {
  return useQuery({
    queryKey: ['workflow', 'sessions', id],
    queryFn: () => apiGet<any>(`/workflow/sessions/${id}`),
    enabled: !!id,
  })
}

export function useStartWorkflow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { workflowId: string; params?: Record<string, string> }) =>
      apiPost<{ sessionId: string; status: string }>('/workflow/start', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow', 'sessions'] })
    },
  })
}

export function useCancelWorkflow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (sessionId: string) =>
      apiPost<{ success: boolean }>(`/workflow/cancel/${sessionId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow', 'sessions'] })
    },
  })
}

// ===== Case AI Processing =====

export function useProcessCase() {
  return useMutation({
    mutationFn: ({ caseId, intent }: { caseId: string; intent?: string }) =>
      apiPost<{ status: string; caseNumber: string }>(`/case/${caseId}/process`, { intent }),
  })
}

export function useChatCase() {
  return useMutation({
    mutationFn: ({ caseId, sessionId, message }: { caseId: string; sessionId: string; message: string }) =>
      apiPost<{ status: string; sessionId: string }>(`/case/${caseId}/chat`, { sessionId, message }),
  })
}

export function useEndCaseSession() {
  return useMutation({
    mutationFn: ({ caseId, sessionId }: { caseId: string; sessionId: string }) =>
      apiDelete<{ success: boolean }>(`/case/${caseId}/session`, { sessionId }),
  })
}

export function useCaseSessions(caseId: string) {
  return useQuery({
    queryKey: ['case-sessions', caseId],
    queryFn: () => apiGet<{ sessions: any[] }>(`/case/${caseId}/sessions`),
    enabled: !!caseId,
  })
}

// ===== Patrol =====

export function useStartPatrol() {
  return useMutation({
    mutationFn: () => apiPost<{ status: string }>('/patrol'),
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
