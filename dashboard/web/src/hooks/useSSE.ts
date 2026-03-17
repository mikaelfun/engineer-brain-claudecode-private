/**
 * SSE Hook — 监听服务端事件并自动刷新 TanStack Query 缓存
 */
import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { BASE_URL } from '../api/client'
import { useWorkflowStore } from '../stores/workflowStore'

export function useSSE() {
  const queryClient = useQueryClient()
  const eventSourceRef = useRef<EventSource | null>(null)
  const workflowStore = useWorkflowStore()

  useEffect(() => {
    const token = localStorage.getItem('eb_token')
    if (!token) return

    const url = `${BASE_URL}/events`
    const es = new EventSource(url)
    eventSourceRef.current = es

    es.addEventListener('case-updated', (e) => {
      const data = JSON.parse(e.data)
      const caseNumber = data.data?.caseNumber
      queryClient.invalidateQueries({ queryKey: ['cases'] })
      if (caseNumber) {
        queryClient.invalidateQueries({ queryKey: ['cases', caseNumber] })
      }
    })

    es.addEventListener('todo-updated', () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    })

    es.addEventListener('patrol-updated', () => {
      queryClient.invalidateQueries({ queryKey: ['agents', 'patrol-state'] })
      queryClient.invalidateQueries({ queryKey: ['cases'] })
    })

    es.addEventListener('draft-updated', () => {
      queryClient.invalidateQueries({ queryKey: ['drafts'] })
    })

    es.addEventListener('cron-updated', () => {
      queryClient.invalidateQueries({ queryKey: ['agents', 'cron-jobs'] })
    })

    // Case session events
    es.addEventListener('case-session-updated', (e) => {
      const data = JSON.parse(e.data)
      const caseNumber = data.data?.caseNumber
      if (caseNumber) {
        queryClient.invalidateQueries({ queryKey: ['case-sessions', caseNumber] })
        queryClient.invalidateQueries({ queryKey: ['cases', caseNumber] })
      }
    })

    es.addEventListener('settings-updated', () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    })

    // ===== Workflow SSE Events =====

    es.addEventListener('workflow-started', (e) => {
      const data = JSON.parse(e.data)
      workflowStore.onWorkflowStarted(data.data)
      queryClient.invalidateQueries({ queryKey: ['workflow', 'sessions'] })
    })

    es.addEventListener('workflow-iteration', (e) => {
      const data = JSON.parse(e.data)
      workflowStore.onWorkflowIteration(data.data)
    })

    es.addEventListener('workflow-thinking', (e) => {
      const data = JSON.parse(e.data)
      workflowStore.onWorkflowThinking(data.data)
    })

    es.addEventListener('workflow-tool-call', (e) => {
      const data = JSON.parse(e.data)
      workflowStore.onWorkflowToolCall(data.data)
    })

    es.addEventListener('workflow-tool-result', (e) => {
      const data = JSON.parse(e.data)
      workflowStore.onWorkflowToolResult(data.data)
    })

    es.addEventListener('workflow-completed', (e) => {
      const data = JSON.parse(e.data)
      workflowStore.onWorkflowCompleted(data.data)
      queryClient.invalidateQueries({ queryKey: ['workflow', 'sessions'] })
    })

    es.addEventListener('workflow-failed', (e) => {
      const data = JSON.parse(e.data)
      workflowStore.onWorkflowFailed(data.data)
      queryClient.invalidateQueries({ queryKey: ['workflow', 'sessions'] })
    })

    es.addEventListener('workflow-cancelled', (e) => {
      const data = JSON.parse(e.data)
      workflowStore.onWorkflowCancelled(data.data)
      queryClient.invalidateQueries({ queryKey: ['workflow', 'sessions'] })
    })

    es.onerror = () => {
      // Reconnect on error
      es.close()
      setTimeout(() => {
        if (eventSourceRef.current === es) {
          eventSourceRef.current = null
        }
      }, 5000)
    }

    return () => {
      es.close()
      eventSourceRef.current = null
    }
  }, [queryClient, workflowStore])
}
