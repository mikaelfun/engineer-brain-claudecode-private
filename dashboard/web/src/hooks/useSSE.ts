/**
 * SSE Hook — 监听服务端事件并自动刷新 TanStack Query 缓存
 *
 * Fixes applied:
 * - Auto-reconnect on error (exponential backoff)
 * - Stable Zustand refs (avoid subscribing to entire store objects)
 * - Safe JSON.parse with try/catch
 * - Removed dead event listeners (case-session-updated never broadcast)
 * - todo-updated also invalidates per-case todo queries
 */
import { useEffect, useRef, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { BASE_URL } from '../api/client'
import { usePatrolStore } from '../stores/patrolStore'
import { useCaseSessionStore } from '../stores/caseSessionStore'

/** Safely parse JSON, returning null on failure */
function safeParse(raw: string): any | null {
  try {
    return JSON.parse(raw)
  } catch {
    console.warn('[SSE] Failed to parse event data:', raw.slice(0, 200))
    return null
  }
}

export function useSSE() {
  const queryClient = useQueryClient()
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const retryCountRef = useRef(0)
  const MAX_RETRIES = 10
  const BASE_DELAY_MS = 2000

  // Use stable refs for Zustand store actions to avoid effect re-runs
  const patrolOnProgress = usePatrolStore((s) => s.onPatrolProgress)
  const patrolOnCaseCompleted = usePatrolStore((s) => s.onPatrolCaseCompleted)
  const addCaseSessionMessage = useCaseSessionStore((s) => s.addMessage)

  const connect = useCallback(() => {
    const token = localStorage.getItem('eb_token')
    if (!token) return

    // Clean up existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }

    const url = `${BASE_URL}/events`
    const es = new EventSource(url)
    eventSourceRef.current = es

    es.addEventListener('case-updated', (e) => {
      const data = safeParse(e.data)
      if (!data) return
      const caseNumber = data.data?.caseNumber
      queryClient.invalidateQueries({ queryKey: ['cases'] })
      if (caseNumber) {
        queryClient.invalidateQueries({ queryKey: ['cases', caseNumber] })
      }
    })

    es.addEventListener('todo-updated', (e) => {
      const data = safeParse(e.data)
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      // Also invalidate per-case todo queries
      const caseNumber = data?.data?.caseNumber
      if (caseNumber) {
        queryClient.invalidateQueries({ queryKey: ['cases', caseNumber, 'todo'] })
      }
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

    // Case session real-time SSE events → populate caseSessionStore for live display
    es.addEventListener('case-session-thinking', (e) => {
      const data = safeParse(e.data)
      if (!data) return
      const d = data.data || data
      const caseNumber = d.caseNumber
      if (caseNumber) {
        addCaseSessionMessage(caseNumber, {
          type: 'thinking',
          content: typeof d.content === 'string' ? d.content : '',
          step: d.step,
          timestamp: d.timestamp || new Date().toISOString(),
        })
      }
    })

    es.addEventListener('case-session-tool-call', (e) => {
      const data = safeParse(e.data)
      if (!data) return
      const d = data.data || data
      const caseNumber = d.caseNumber
      if (caseNumber) {
        addCaseSessionMessage(caseNumber, {
          type: 'tool-call',
          content: typeof d.content === 'string' ? d.content : '',
          toolName: d.toolName,
          step: d.step,
          timestamp: d.timestamp || new Date().toISOString(),
        })
      }
    })

    es.addEventListener('case-session-tool-result', (e) => {
      const data = safeParse(e.data)
      if (!data) return
      const d = data.data || data
      const caseNumber = d.caseNumber
      if (caseNumber) {
        addCaseSessionMessage(caseNumber, {
          type: 'tool-result',
          content: typeof d.content === 'string' ? d.content : '',
          toolName: d.toolName,
          step: d.step,
          timestamp: d.timestamp || new Date().toISOString(),
        })
      }
    })

    // Case step started event — update operation status immediately
    es.addEventListener('case-step-started', (e) => {
      const data = safeParse(e.data)
      if (!data) return
      const d = data.data || data
      const caseNumber = d.caseNumber
      if (caseNumber) {
        addCaseSessionMessage(caseNumber, {
          type: 'system',
          content: `Step "${d.step}" started`,
          step: d.step,
          timestamp: d.startedAt || new Date().toISOString(),
        })
        // Immediately invalidate operation query so UI reflects active operation
        queryClient.invalidateQueries({ queryKey: ['case-operation', caseNumber] })
      }
    })

    // Case session completion/failure → store + query invalidation
    es.addEventListener('case-session-completed', (e) => {
      const data = safeParse(e.data)
      if (!data) return
      const caseNumber = data.data?.caseNumber
      if (caseNumber) {
        addCaseSessionMessage(caseNumber, {
          type: 'completed',
          content: data.data?.step ? `Step "${data.data.step}" completed` : 'Session completed',
          step: data.data?.step,
          timestamp: new Date().toISOString(),
        })
        queryClient.invalidateQueries({ queryKey: ['cases', caseNumber] })
        queryClient.invalidateQueries({ queryKey: ['cases', caseNumber, 'todo'] })
        queryClient.invalidateQueries({ queryKey: ['case-sessions', caseNumber] })
        queryClient.invalidateQueries({ queryKey: ['case-operation', caseNumber] })
      }
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    })

    es.addEventListener('case-session-failed', (e) => {
      const data = safeParse(e.data)
      if (!data) return
      const caseNumber = data.data?.caseNumber
      if (caseNumber) {
        addCaseSessionMessage(caseNumber, {
          type: 'failed',
          content: data.data?.error || 'Session failed',
          step: data.data?.step,
          timestamp: new Date().toISOString(),
        })
        queryClient.invalidateQueries({ queryKey: ['case-sessions', caseNumber] })
        queryClient.invalidateQueries({ queryKey: ['case-operation', caseNumber] })
      }
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    })

    // Patrol progress events
    es.addEventListener('patrol-progress', (e) => {
      const data = safeParse(e.data)
      if (!data) return
      patrolOnProgress(data.data || data)
    })

    es.addEventListener('patrol-case-completed', (e) => {
      const data = safeParse(e.data)
      if (!data) return
      patrolOnCaseCompleted(data.data || data)
      const caseNumber = (data.data || data)?.caseNumber
      if (caseNumber) {
        queryClient.invalidateQueries({ queryKey: ['cases', caseNumber] })
        queryClient.invalidateQueries({ queryKey: ['case-sessions', caseNumber] })
      }
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    })

    es.addEventListener('settings-updated', () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    })

    es.onopen = () => {
      // Reset retry count on successful connection
      retryCountRef.current = 0
    }

    es.onerror = () => {
      es.close()
      eventSourceRef.current = null

      // Reconnect with exponential backoff
      if (retryCountRef.current < MAX_RETRIES) {
        const delay = BASE_DELAY_MS * Math.pow(2, Math.min(retryCountRef.current, 5))
        retryCountRef.current++
        console.warn(`[SSE] Connection lost, reconnecting in ${delay}ms (attempt ${retryCountRef.current}/${MAX_RETRIES})`)
        reconnectTimerRef.current = setTimeout(connect, delay)
      } else {
        console.error(`[SSE] Max retries (${MAX_RETRIES}) exceeded, giving up`)
      }
    }
  }, [queryClient, patrolOnProgress, patrolOnCaseCompleted, addCaseSessionMessage])

  useEffect(() => {
    connect()

    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current)
        reconnectTimerRef.current = null
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
    }
  }, [connect])
}
