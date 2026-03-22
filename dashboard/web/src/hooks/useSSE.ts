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
import { useIssueTrackStore } from '../stores/issueTrackStore'
import { useTodoExecuteStore } from '../stores/todoExecuteStore'

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
  const addCaseSessionPerSession = useCaseSessionStore((s) => s.addSessionMessage)
  const addIssueTrackMessage = useIssueTrackStore((s) => s.addMessage)
  const setIssueTrackingActive = useIssueTrackStore((s) => s.setTrackingActive)
  const clearIssueTrackMessages = useIssueTrackStore((s) => s.clearMessages)
  const setIssuePendingQuestion = useIssueTrackStore((s) => s.setPendingQuestion)
  const startImplement = useIssueTrackStore((s) => s.startImplement)
  const addImplementMessage = useIssueTrackStore((s) => s.addImplementMessage)
  const setImplementStatus = useIssueTrackStore((s) => s.setImplementStatus)
  const addVerifyMessage = useIssueTrackStore((s) => s.addVerifyMessage)
  const setVerifyActive = useIssueTrackStore((s) => s.setVerifyActive)
  const setVerifyResult = useIssueTrackStore((s) => s.setVerifyResult)
  const clearVerify = useIssueTrackStore((s) => s.clearVerify)
  const todoExecSetProgress = useTodoExecuteStore((s) => s.setProgress)
  const todoExecSetResult = useTodoExecuteStore((s) => s.setResult)

  // caseSessionStore unified actions
  const sessionStoreSetStatus = useCaseSessionStore((s) => s.setSessionStatus)
  const sessionStoreSetActiveSession = useCaseSessionStore((s) => s.setActiveSessionId)
  const sessionStoreSetCurrentStep = useCaseSessionStore((s) => s.setCurrentStep)
  const sessionStoreSetPendingQuestion = useCaseSessionStore((s) => s.setPendingQuestion)
  const sessionStoreClearPendingQuestion = useCaseSessionStore((s) => s.clearPendingQuestion)

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
        const msg: import('../stores/caseSessionStore').CaseSessionMessage = {
          type: 'thinking',
          content: typeof d.content === 'string' ? d.content : '',
          step: d.step,
          timestamp: d.timestamp || new Date().toISOString(),
        }
        addCaseSessionMessage(caseNumber, msg)
        if (d.sessionId) {
          addCaseSessionPerSession(caseNumber, d.sessionId, msg)
          // Auto-discover session ID (ISS-090)
          const currentActive = useCaseSessionStore.getState().activeSessionId[caseNumber]
          if (!currentActive) {
            sessionStoreSetActiveSession(caseNumber, d.sessionId)
            sessionStoreSetStatus(caseNumber, 'active')
            if (d.step) sessionStoreSetCurrentStep(caseNumber, d.step)
          }
        }
      }
    })

    es.addEventListener('case-session-tool-call', (e) => {
      const data = safeParse(e.data)
      if (!data) return
      const d = data.data || data
      const caseNumber = d.caseNumber
      if (caseNumber) {
        const msg: import('../stores/caseSessionStore').CaseSessionMessage = {
          type: 'tool-call',
          content: typeof d.content === 'string' ? d.content : '',
          toolName: d.toolName,
          step: d.step,
          timestamp: d.timestamp || new Date().toISOString(),
        }
        addCaseSessionMessage(caseNumber, msg)
        if (d.sessionId) {
          addCaseSessionPerSession(caseNumber, d.sessionId, msg)
          // Auto-discover session ID (ISS-090)
          const currentActive = useCaseSessionStore.getState().activeSessionId[caseNumber]
          if (!currentActive) {
            sessionStoreSetActiveSession(caseNumber, d.sessionId)
            sessionStoreSetStatus(caseNumber, 'active')
            if (d.step) sessionStoreSetCurrentStep(caseNumber, d.step)
          }
        }
      }
    })

    es.addEventListener('case-session-tool-result', (e) => {
      const data = safeParse(e.data)
      if (!data) return
      const d = data.data || data
      const caseNumber = d.caseNumber
      if (caseNumber) {
        const msg: import('../stores/caseSessionStore').CaseSessionMessage = {
          type: 'tool-result',
          content: typeof d.content === 'string' ? d.content : '',
          toolName: d.toolName,
          step: d.step,
          timestamp: d.timestamp || new Date().toISOString(),
        }
        addCaseSessionMessage(caseNumber, msg)
        if (d.sessionId) {
          addCaseSessionPerSession(caseNumber, d.sessionId, msg)
          // Auto-discover session ID (ISS-090)
          const currentActive = useCaseSessionStore.getState().activeSessionId[caseNumber]
          if (!currentActive) {
            sessionStoreSetActiveSession(caseNumber, d.sessionId)
            sessionStoreSetStatus(caseNumber, 'active')
            if (d.step) sessionStoreSetCurrentStep(caseNumber, d.step)
          }
        }
      }
    })

    // Case step started event — update operation status immediately
    es.addEventListener('case-step-started', (e) => {
      const data = safeParse(e.data)
      if (!data) return
      const d = data.data || data
      const caseNumber = d.caseNumber
      if (caseNumber) {
        const ts = d.startedAt || new Date().toISOString()
        const startMsg: import('../stores/caseSessionStore').CaseSessionMessage = {
          type: 'system',
          content: `Step "${d.step}" started`,
          step: d.step,
          timestamp: ts,
        }
        addCaseSessionMessage(caseNumber, startMsg)
        if (d.sessionId) addCaseSessionPerSession(caseNumber, d.sessionId, startMsg)

        // Update caseSessionStore unified state
        sessionStoreSetStatus(caseNumber, 'active')
        if (d.step) sessionStoreSetCurrentStep(caseNumber, d.step)
        if (d.sessionId) sessionStoreSetActiveSession(caseNumber, d.sessionId)

        // Immediately invalidate operation query so UI reflects active operation
        queryClient.invalidateQueries({ queryKey: ['case-operation', caseNumber] })
      }
    })

    // Case step progress events — write to caseSessionStore
    es.addEventListener('case-step-progress', (e) => {
      const data = safeParse(e.data)
      if (!data) return
      const d = data.data || data
      const caseNumber = d.caseNumber
      if (caseNumber) {
        const msgType = d.kind === 'tool-call' ? 'tool-call' : d.kind === 'tool-result' ? 'tool-result' : 'thinking'
        const sessionMsg: import('../stores/caseSessionStore').CaseSessionMessage = {
          type: msgType,
          content: typeof d.content === 'string' ? d.content : '',
          toolName: d.toolName,
          step: d.step,
          timestamp: d.timestamp || new Date().toISOString(),
        }
        addCaseSessionMessage(caseNumber, sessionMsg)
        if (d.sessionId) {
          addCaseSessionPerSession(caseNumber, d.sessionId, sessionMsg)
          // Auto-discover session ID: if case-step-started lacked sessionId (e.g. full-process),
          // promote the first progress event's sessionId to activeSession (ISS-090)
          const currentActive = useCaseSessionStore.getState().activeSessionId[caseNumber]
          if (!currentActive) {
            sessionStoreSetActiveSession(caseNumber, d.sessionId)
            sessionStoreSetStatus(caseNumber, 'active')
            if (d.step) sessionStoreSetCurrentStep(caseNumber, d.step)
          }
        }
      }
    })

    // Case step question event — AskUserQuestion interception
    es.addEventListener('case-step-question', (e) => {
      const data = safeParse(e.data)
      if (!data) return
      const d = data.data || data
      const caseNumber = d.caseNumber
      if (caseNumber) {
        const ts = d.timestamp || new Date().toISOString()

        // Write to caseSessionStore (unified)
        if (d.questions) {
          sessionStoreSetStatus(caseNumber, 'waiting-input')
          sessionStoreSetPendingQuestion(caseNumber, d.sessionId || d.executionId || '', d.questions)
          const questionMsg: import('../stores/caseSessionStore').CaseSessionMessage = {
            type: 'system',
            content: d.questions?.map((q: any) => q.question).join('; ') || 'Question pending',
            step: d.step,
            timestamp: ts,
          }
          addCaseSessionMessage(caseNumber, questionMsg)
          if (d.sessionId) addCaseSessionPerSession(caseNumber, d.sessionId, questionMsg)
        }
      }
    })

    // Case step completed event — finalize status + invalidate operation
    es.addEventListener('case-step-completed', (e) => {
      const data = safeParse(e.data)
      if (!data) return
      const d = data.data || data
      const caseNumber = d.caseNumber
      if (caseNumber) {
        const ts = new Date().toISOString()
        const completedMsg: import('../stores/caseSessionStore').CaseSessionMessage = {
          type: 'completed',
          content: d.step ? `Step "${d.step}" completed` : 'Step completed',
          step: d.step,
          timestamp: ts,
        }

        // Update caseSessionStore unified state
        sessionStoreSetStatus(caseNumber, 'completed')
        sessionStoreClearPendingQuestion(caseNumber)
        addCaseSessionMessage(caseNumber, completedMsg)
        if (d.sessionId) addCaseSessionPerSession(caseNumber, d.sessionId, completedMsg)

        // Invalidate operation query so buttons are released
        queryClient.invalidateQueries({ queryKey: ['case-operation', caseNumber] })
        queryClient.invalidateQueries({ queryKey: ['case-sessions', caseNumber] })
        queryClient.invalidateQueries({ queryKey: ['cases', caseNumber] })
        queryClient.invalidateQueries({ queryKey: ['cases', caseNumber, 'todo'] })
      }
    })

    // Case step failed event — set failed status + invalidate operation
    es.addEventListener('case-step-failed', (e) => {
      const data = safeParse(e.data)
      if (!data) return
      const d = data.data || data
      const caseNumber = d.caseNumber
      if (caseNumber) {
        const ts = new Date().toISOString()
        const failedMsg: import('../stores/caseSessionStore').CaseSessionMessage = {
          type: 'failed',
          content: d.error || 'Step failed',
          step: d.step,
          timestamp: ts,
        }

        // Update caseSessionStore unified state
        sessionStoreSetStatus(caseNumber, 'failed')
        sessionStoreClearPendingQuestion(caseNumber)
        addCaseSessionMessage(caseNumber, failedMsg)
        if (d.sessionId) addCaseSessionPerSession(caseNumber, d.sessionId, failedMsg)

        // Invalidate operation query so buttons are released
        queryClient.invalidateQueries({ queryKey: ['case-operation', caseNumber] })
        queryClient.invalidateQueries({ queryKey: ['case-sessions', caseNumber] })
      }
    })

    // Case session completion/failure → store + query invalidation
    es.addEventListener('case-session-completed', (e) => {
      const data = safeParse(e.data)
      if (!data) return
      const caseNumber = data.data?.caseNumber
      if (caseNumber) {
        const msg: import('../stores/caseSessionStore').CaseSessionMessage = {
          type: 'completed',
          content: data.data?.step ? `Step "${data.data.step}" completed` : 'Session completed',
          step: data.data?.step,
          timestamp: new Date().toISOString(),
        }
        addCaseSessionMessage(caseNumber, msg)
        if (data.data?.sessionId) addCaseSessionPerSession(caseNumber, data.data.sessionId, msg)
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
        const msg: import('../stores/caseSessionStore').CaseSessionMessage = {
          type: 'failed',
          content: data.data?.error || 'Session failed',
          step: data.data?.step,
          timestamp: new Date().toISOString(),
        }
        addCaseSessionMessage(caseNumber, msg)
        if (data.data?.sessionId) addCaseSessionPerSession(caseNumber, data.data.sessionId, msg)
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

    // Sessions changed event — immediately refresh Agent Monitor session list (ISS-082)
    es.addEventListener('sessions-changed', () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    })

    // Issue track creation progress events → populate issueTrackStore for live display
    es.addEventListener('issue-track-started', (e) => {
      const data = safeParse(e.data)
      if (!data) return
      const d = data.data || data
      const issueId = d.issueId
      if (issueId) {
        setIssueTrackingActive(issueId, true)
        addIssueTrackMessage(issueId, {
          kind: 'started',
          content: d.issueTitle ? `Track creation started for "${d.issueTitle}"` : 'Track creation started',
          timestamp: d.timestamp || new Date().toISOString(),
        })
        queryClient.invalidateQueries({ queryKey: ['issues'] })
      }
    })

    es.addEventListener('issue-track-progress', (e) => {
      const data = safeParse(e.data)
      if (!data) return
      const d = data.data || data
      const issueId = d.issueId
      if (issueId) {
        addIssueTrackMessage(issueId, {
          kind: d.kind || (d.toolName ? 'tool-call' : 'thinking'),
          content: d.content,
          toolName: d.toolName,
          timestamp: d.timestamp || new Date().toISOString(),
        })
      }
    })

    es.addEventListener('issue-track-completed', (e) => {
      const data = safeParse(e.data)
      if (!data) return
      const d = data.data || data
      const issueId = d.issueId
      if (issueId) {
        addIssueTrackMessage(issueId, {
          kind: 'completed',
          trackId: d.trackId,
          planSummary: d.planSummary,
          timestamp: d.timestamp || new Date().toISOString(),
        })
        setIssueTrackingActive(issueId, false)
        queryClient.invalidateQueries({ queryKey: ['issues'] })
      }
    })

    es.addEventListener('issue-track-error', (e) => {
      const data = safeParse(e.data)
      if (!data) return
      const d = data.data || data
      const issueId = d.issueId
      if (issueId) {
        if (d.error === '__cancelled__') {
          // Cancelled by user — clear all messages so panel disappears
          clearIssueTrackMessages(issueId)
        } else {
          addIssueTrackMessage(issueId, {
            kind: 'error',
            error: d.error,
            timestamp: d.timestamp || new Date().toISOString(),
          })
          setIssueTrackingActive(issueId, false)
        }
        queryClient.invalidateQueries({ queryKey: ['issues'] })
      }
    })

    es.addEventListener('issue-track-question', (e) => {
      const data = safeParse(e.data)
      if (!data) return
      const d = data.data || data
      const issueId = d.issueId
      if (issueId) {
        addIssueTrackMessage(issueId, {
          kind: 'question',
          questions: d.questions,
          sessionId: d.sessionId,
          content: d.questions?.map((q: any) => q.question).join('; '),
          timestamp: d.timestamp || new Date().toISOString(),
        })
        if (d.sessionId && d.questions) {
          setIssuePendingQuestion(issueId, d.sessionId, d.questions)
        } else if (d.questions) {
          // sessionId may be undefined if canUseTool fires before session_id is captured (ISS-027 fallback)
          setIssuePendingQuestion(issueId, d.sessionId || '', d.questions)
        }
      }
    })

    // Issue implement progress events → populate issueTrackStore for live display
    es.addEventListener('issue-implement-started', (e) => {
      const data = safeParse(e.data)
      if (!data) return
      const d = data.data || data
      const issueId = d.issueId
      if (issueId) {
        startImplement(issueId, d.trackId || '')
        addImplementMessage(issueId, {
          kind: 'started',
          content: `Implementation started${d.trackId ? ` for track ${d.trackId}` : ''}`,
          timestamp: d.timestamp || new Date().toISOString(),
        })
        queryClient.invalidateQueries({ queryKey: ['issues'] })
      }
    })

    es.addEventListener('issue-implement-progress', (e) => {
      const data = safeParse(e.data)
      if (!data) return
      const d = data.data || data
      const issueId = d.issueId
      if (issueId) {
        addImplementMessage(issueId, {
          kind: d.kind || (d.toolName ? 'tool-call' : 'thinking'),
          content: d.content || d.toolName || '',
          toolName: d.toolName,
          timestamp: d.timestamp || new Date().toISOString(),
        })
      }
    })

    es.addEventListener('issue-implement-completed', (e) => {
      const data = safeParse(e.data)
      if (!data) return
      const d = data.data || data
      const issueId = d.issueId
      if (issueId) {
        setImplementStatus(issueId, 'completed')
        addImplementMessage(issueId, {
          kind: 'completed',
          content: `Implementation completed${d.trackId ? ` for track ${d.trackId}` : ''}`,
          timestamp: d.timestamp || new Date().toISOString(),
        })
        queryClient.invalidateQueries({ queryKey: ['issues'] })
      }
    })

    es.addEventListener('issue-implement-error', (e) => {
      const data = safeParse(e.data)
      if (!data) return
      const d = data.data || data
      const issueId = d.issueId
      if (issueId) {
        setImplementStatus(issueId, 'failed')
        addImplementMessage(issueId, {
          kind: 'failed',
          content: d.error || 'Implementation failed',
          timestamp: d.timestamp || new Date().toISOString(),
        })
        queryClient.invalidateQueries({ queryKey: ['issues'] })
      }
    })

    // Issue verify progress events → populate issueTrackStore verify state
    es.addEventListener('issue-verify-started', (e) => {
      const data = safeParse(e.data)
      if (!data) return
      const d = data.data || data
      const issueId = d.issueId
      if (issueId) {
        setVerifyActive(issueId, true)
        addVerifyMessage(issueId, {
          kind: 'started',
          content: 'Verification started',
          timestamp: d.timestamp || new Date().toISOString(),
        })
      }
    })

    es.addEventListener('issue-verify-progress', (e) => {
      const data = safeParse(e.data)
      if (!data) return
      const d = data.data || data
      const issueId = d.issueId
      if (issueId) {
        addVerifyMessage(issueId, {
          kind: d.kind || (d.toolName ? 'tool-call' : 'thinking'),
          content: d.content || d.toolName || '',
          toolName: d.toolName,
          timestamp: d.timestamp || new Date().toISOString(),
        })
      }
    })

    es.addEventListener('issue-verify-completed', (e) => {
      const data = safeParse(e.data)
      if (!data) return
      const d = data.data || data
      const issueId = d.issueId
      if (issueId) {
        setVerifyActive(issueId, false)
        addVerifyMessage(issueId, {
          kind: 'completed',
          content: d.result?.overall ? 'All tests passed ✓' : 'Tests completed with failures',
          timestamp: d.timestamp || new Date().toISOString(),
        })
        if (d.result) {
          setVerifyResult(issueId, d.result)
        }
        queryClient.invalidateQueries({ queryKey: ['issues'] })
      }
    })

    es.addEventListener('issue-verify-error', (e) => {
      const data = safeParse(e.data)
      if (!data) return
      const d = data.data || data
      const issueId = d.issueId
      if (issueId) {
        if (d.error === '__cancelled__') {
          // Cancelled by user — clear all verify state so panel disappears
          clearVerify(issueId)
        } else {
          setVerifyActive(issueId, false)
          addVerifyMessage(issueId, {
            kind: 'error',
            content: d.error || 'Verification failed',
            timestamp: d.timestamp || new Date().toISOString(),
          })
        }
        queryClient.invalidateQueries({ queryKey: ['issues'] })
      }
    })

    // Todo execute progress/result events → populate todoExecuteStore
    es.addEventListener('todo-execute-progress', (e) => {
      const data = safeParse(e.data)
      if (!data) return
      const d = data.data || data
      const caseNumber = d.caseNumber
      const lineNumber = d.lineNumber ?? 0
      if (caseNumber) {
        const key = `${caseNumber}:${lineNumber}`
        todoExecSetProgress(key, d.phase || 'executing', d.message)
      }
    })

    es.addEventListener('todo-execute-result', (e) => {
      const data = safeParse(e.data)
      if (!data) return
      const d = data.data || data
      const caseNumber = d.caseNumber
      const lineNumber = d.lineNumber ?? 0
      if (caseNumber) {
        const key = `${caseNumber}:${lineNumber}`
        todoExecSetResult(key, d.success === true, d.verificationDetails)
        // Also invalidate todos to refresh checkbox state
        queryClient.invalidateQueries({ queryKey: ['todos'] })
      }
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
  }, [queryClient, patrolOnProgress, patrolOnCaseCompleted, addCaseSessionMessage, addCaseSessionPerSession, addIssueTrackMessage, setIssueTrackingActive, clearIssueTrackMessages, setIssuePendingQuestion, startImplement, addImplementMessage, setImplementStatus, addVerifyMessage, setVerifyActive, setVerifyResult, clearVerify, todoExecSetProgress, todoExecSetResult, sessionStoreSetStatus, sessionStoreSetActiveSession, sessionStoreSetCurrentStep, sessionStoreSetPendingQuestion, sessionStoreClearPendingQuestion])

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
