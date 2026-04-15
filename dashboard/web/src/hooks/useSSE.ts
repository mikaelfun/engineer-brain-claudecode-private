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
import { useTriggerRunStore } from '../stores/triggerRunStore'

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
  const lastSeqRef = useRef<number>(0)
  const MAX_RETRIES = 30
  const BASE_DELAY_MS = 1000

  // Use stable refs for Zustand store actions to avoid effect re-runs
  const patrolOnProgress = usePatrolStore((s) => s.onPatrolProgress)
  const patrolOnCaseCompleted = usePatrolStore((s) => s.onPatrolCaseCompleted)
  const patrolOnCaseStepUpdate = usePatrolStore((s) => s.onCaseStepUpdate)
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

  // triggerRunStore actions
  const triggerOnStarted = useTriggerRunStore((s) => s.onTriggerStarted)
  const triggerOnProgress = useTriggerRunStore((s) => s.onTriggerProgress)
  const triggerOnCompleted = useTriggerRunStore((s) => s.onTriggerCompleted)
  const triggerOnFailed = useTriggerRunStore((s) => s.onTriggerFailed)
  const triggerOnCancelled = useTriggerRunStore((s) => s.onTriggerCancelled)

  // caseSessionStore unified actions
  const sessionStoreSetStatus = useCaseSessionStore((s) => s.setSessionStatus)
  const sessionStoreSetActiveSession = useCaseSessionStore((s) => s.setActiveSessionId)
  const sessionStoreSetCurrentStep = useCaseSessionStore((s) => s.setCurrentStep)
  const sessionStoreSetPendingQuestion = useCaseSessionStore((s) => s.setPendingQuestion)
  const sessionStoreClearPendingQuestion = useCaseSessionStore((s) => s.clearPendingQuestion)
  const sessionStoreSetHeartbeat = useCaseSessionStore((s) => s.setLastHeartbeatAt)
  const sessionStoreSetQueueStatus = useCaseSessionStore((s) => s.setQueueStatus)
  const sessionStoreInitPipeline = useCaseSessionStore((s) => s.initPipelineSteps)
  const sessionStoreUpdatePipeline = useCaseSessionStore((s) => s.updatePipelineStep)
  const sessionStoreInitAgentSpawns = useCaseSessionStore((s) => s.initAgentSpawns)
  const sessionStoreUpdateAgentSpawn = useCaseSessionStore((s) => s.updateAgentSpawn)

  const connect = useCallback(() => {
    const token = localStorage.getItem('eb_token')
    if (!token) return

    // Clean up existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }

    const url = `${BASE_URL}/events${lastSeqRef.current > 0 ? `?lastSeq=${lastSeqRef.current}` : ''}`
    const es = new EventSource(url)
    eventSourceRef.current = es

    /** Update last event sequence number from parsed SSE data */
    function updateLastSeq(data: Record<string, unknown> | null) {
      if (data && typeof (data as any).seq === 'number' && (data as any).seq > lastSeqRef.current) {
        lastSeqRef.current = (data as any).seq
      }
    }

    /** Parse SSE event data and track sequence for reconnect replay */
    function parseAndTrack(raw: string): any | null {
      const data = safeParse(raw)
      updateLastSeq(data)
      return data
    }

    es.addEventListener('case-updated', (e) => {
      const data = parseAndTrack(e.data)
      if (!data) return
      const caseNumber = data.data?.caseNumber
      queryClient.invalidateQueries({ queryKey: ['cases'] })
      if (caseNumber) {
        queryClient.invalidateQueries({ queryKey: ['cases', caseNumber] })
      }
    })

    es.addEventListener('todo-updated', (e) => {
      const data = parseAndTrack(e.data)
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
      const data = parseAndTrack(e.data)
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
      const data = parseAndTrack(e.data)
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
      const data = parseAndTrack(e.data)
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
      const data = parseAndTrack(e.data)
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

        // Initialize pipeline steps if casework (ISS-210)
        if (d.pipelineSteps && Array.isArray(d.pipelineSteps)) {
          sessionStoreInitPipeline(caseNumber, d.pipelineSteps)
        }
        // Initialize agent spawns if casework (ISS-210 v2)
        if (d.agentSpawns && Array.isArray(d.agentSpawns)) {
          sessionStoreInitAgentSpawns(caseNumber, d.agentSpawns)
        }

        // Update patrol store if patrol is running (per-case sub-step tracking)
        if (d.step) patrolOnCaseStepUpdate(caseNumber, { step: d.step })
      }
    })

    // Case step progress events — write to caseSessionStore
    es.addEventListener('case-step-progress', (e) => {
      const data = parseAndTrack(e.data)
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

        // Update patrol store per-case substep tracking (only meaningful steps, not raw tool names)
        if (d.substep) patrolOnCaseStepUpdate(caseNumber, { step: d.substep })
      }
    })

    // Case step question event — AskUserQuestion interception
    es.addEventListener('case-step-question', (e) => {
      const data = parseAndTrack(e.data)
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
      const data = parseAndTrack(e.data)
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

        // Clear pipeline steps on casework completion (ISS-210)
        // Mark all remaining pending/active steps as completed, then clear after 60s
        if (d.step === 'casework') {
          const steps = useCaseSessionStore.getState().pipelineSteps[caseNumber]
          if (steps) {
            for (const s of steps) {
              if (s.status === 'active' || s.status === 'pending') {
                sessionStoreUpdatePipeline(caseNumber, s.id, s.status === 'active' ? 'completed' : 'skipped')
              }
            }
            // Clear pipeline after 60s so user can see final state
            setTimeout(() => {
              useCaseSessionStore.getState().clearPipelineSteps(caseNumber)
            }, 60_000)
          }
        }

        // Invalidate + force refetch operation query so buttons are released immediately
        queryClient.invalidateQueries({ queryKey: ['case-operation', caseNumber] })
        queryClient.refetchQueries({ queryKey: ['case-operation', caseNumber] })
        queryClient.invalidateQueries({ queryKey: ['case-sessions', caseNumber] })
        queryClient.invalidateQueries({ queryKey: ['cases', caseNumber] })
        queryClient.invalidateQueries({ queryKey: ['cases', caseNumber, 'todo'] })
        // Invalidate note-gap query when note-gap step completes so NoteGapCard picks up the result
        if (d.step === 'note-gap') {
          queryClient.invalidateQueries({ queryKey: ['note-gap', caseNumber] })
        }
      }
    })

    // Pipeline step status updates for casework (ISS-210)
    es.addEventListener('case-pipeline-step', (e) => {
      const data = parseAndTrack(e.data)
      if (!data) return
      const d = data.data || data
      const caseNumber = d.caseNumber
      if (caseNumber && d.pipelineStep && d.status) {
        sessionStoreUpdatePipeline(caseNumber, d.pipelineStep, d.status, d.durationMs)
      }
    })

    // Agent spawn status updates for casework (ISS-210 v2)
    es.addEventListener('case-agent-spawn', (e) => {
      const data = parseAndTrack(e.data)
      if (!data) return
      const d = data.data || data
      const caseNumber = d.caseNumber
      if (caseNumber && d.agentId && d.status) {
        sessionStoreUpdateAgentSpawn(caseNumber, d.agentId, d.status, d.durationMs)
      }
    })

    // Case step failed event — set failed status + invalidate operation
    es.addEventListener('case-step-failed', (e) => {
      const data = parseAndTrack(e.data)
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

        // Invalidate + force refetch operation query so buttons are released immediately
        queryClient.invalidateQueries({ queryKey: ['case-operation', caseNumber] })
        queryClient.refetchQueries({ queryKey: ['case-operation', caseNumber] })
        queryClient.invalidateQueries({ queryKey: ['case-sessions', caseNumber] })
      }
    })

    // Case session completion/failure → store + query invalidation
    es.addEventListener('case-session-completed', (e) => {
      const data = parseAndTrack(e.data)
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
        queryClient.refetchQueries({ queryKey: ['case-operation', caseNumber] })
      }
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    })

    es.addEventListener('case-session-failed', (e) => {
      const data = parseAndTrack(e.data)
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
        queryClient.refetchQueries({ queryKey: ['case-operation', caseNumber] })
      }
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    })

    // Patrol progress events
    es.addEventListener('patrol-progress', (e) => {
      const data = parseAndTrack(e.data)
      if (!data) return
      patrolOnProgress(data.data || data)
    })

    es.addEventListener('patrol-case-completed', (e) => {
      const data = parseAndTrack(e.data)
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

    // Heartbeat events — update lastHeartbeatAt to drive stall detection
    es.addEventListener('case-step-heartbeat', (e) => {
      const data = parseAndTrack(e.data)
      if (!data) return
      const d = data.data || data
      const caseNumber = d.caseNumber
      if (caseNumber) {
        sessionStoreSetHeartbeat(caseNumber, d.timestamp || new Date().toISOString())
      }
    })

    // SDK queue status changes — update global queue indicator
    es.addEventListener('sdk-queue-changed', (e) => {
      const data = parseAndTrack(e.data)
      if (!data) return
      const d = data.data || data
      sessionStoreSetQueueStatus({
        isQueued: d.running === true && (d.queueLength ?? 0) > 0,
        currentLabel: d.currentLabel || null,
        queueLength: d.queueLength ?? 0,
        queueLabels: d.queueLabels || [],
      })
    })

    // Issue track creation progress events → populate issueTrackStore for live display
    es.addEventListener('issue-track-started', (e) => {
      const data = parseAndTrack(e.data)
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
      const data = parseAndTrack(e.data)
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
      const data = parseAndTrack(e.data)
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
      const data = parseAndTrack(e.data)
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
      const data = parseAndTrack(e.data)
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
      const data = parseAndTrack(e.data)
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
      const data = parseAndTrack(e.data)
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
      const data = parseAndTrack(e.data)
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
      const data = parseAndTrack(e.data)
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
      const data = parseAndTrack(e.data)
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
      const data = parseAndTrack(e.data)
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
      const data = parseAndTrack(e.data)
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
      const data = parseAndTrack(e.data)
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
      const data = parseAndTrack(e.data)
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
      const data = parseAndTrack(e.data)
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

    // Test Lab SSE events → invalidate TanStack Query caches
    // Split file events (pipeline model)
    es.addEventListener('test-pipeline-updated', () => {
      queryClient.invalidateQueries({ queryKey: ['tests', 'pipeline'] })
      queryClient.invalidateQueries({ queryKey: ['tests', 'state'] })
      queryClient.invalidateQueries({ queryKey: ['tests', 'runner-status'] })
    })

    es.addEventListener('test-supervisor-updated', () => {
      queryClient.invalidateQueries({ queryKey: ['tests', 'supervisor'] })
      queryClient.invalidateQueries({ queryKey: ['tests', 'state'] })
      // Supervisor status change may indicate external CLI run start/stop
      queryClient.invalidateQueries({ queryKey: ['tests', 'runner-status'] })
    })

    es.addEventListener('test-queues-updated', () => {
      queryClient.invalidateQueries({ queryKey: ['tests', 'queues'] })
      queryClient.invalidateQueries({ queryKey: ['tests', 'state'] })
    })

    es.addEventListener('test-stats-updated', () => {
      queryClient.invalidateQueries({ queryKey: ['tests', 'stats'] })
      queryClient.invalidateQueries({ queryKey: ['tests', 'state'] })
    })

    // Legacy state.json event (backward compat during migration)
    es.addEventListener('test-state-updated', () => {
      queryClient.invalidateQueries({ queryKey: ['tests', 'state'] })
      queryClient.invalidateQueries({ queryKey: ['tests', 'discoveries'] })
    })

    es.addEventListener('test-discoveries-updated', () => {
      queryClient.invalidateQueries({ queryKey: ['tests', 'discoveries'] })
    })

    es.addEventListener('test-result-updated', () => {
      queryClient.invalidateQueries({ queryKey: ['tests', 'state'] })
      queryClient.invalidateQueries({ queryKey: ['tests', 'trends'] })
    })

    es.addEventListener('test-evolution-updated', () => {
      queryClient.invalidateQueries({ queryKey: ['tests', 'evolution'] })
    })

    es.addEventListener('test-directives-updated', () => {
      queryClient.invalidateQueries({ queryKey: ['tests', 'state'] })
      queryClient.invalidateQueries({ queryKey: ['tests', 'runner-status'] })
    })

    es.addEventListener('runner-status-changed', () => {
      queryClient.invalidateQueries({ queryKey: ['tests', 'runner-status'] })
    })

    // ---- Trigger run SSE events ----
    es.addEventListener('trigger-started', (e) => {
      const data = parseAndTrack(e.data)
      if (!data) return
      const d = data.data || data
      if (d.triggerId) {
        triggerOnStarted(d.triggerId)
      }
    })

    es.addEventListener('trigger-progress', (e) => {
      const data = parseAndTrack(e.data)
      if (!data) return
      const d = data.data || data
      if (d.triggerId) {
        triggerOnProgress(d.triggerId, d.chunk || '', d.elapsedMs || 0)
      }
    })

    es.addEventListener('trigger-completed', (e) => {
      const data = parseAndTrack(e.data)
      if (!data) return
      const d = data.data || data
      if (d.triggerId) {
        triggerOnCompleted(d.triggerId, d.durationMs || 0, d.outputPreview)
        queryClient.invalidateQueries({ queryKey: ['agents', 'triggers'] })
        queryClient.invalidateQueries({ queryKey: ['agents', 'cron-jobs'] })
      }
    })

    es.addEventListener('trigger-failed', (e) => {
      const data = parseAndTrack(e.data)
      if (!data) return
      const d = data.data || data
      if (d.triggerId) {
        triggerOnFailed(d.triggerId, d.durationMs || 0, d.error)
        queryClient.invalidateQueries({ queryKey: ['agents', 'triggers'] })
        queryClient.invalidateQueries({ queryKey: ['agents', 'cron-jobs'] })
      }
    })

    es.addEventListener('trigger-cancelled', (e) => {
      const data = parseAndTrack(e.data)
      if (!data) return
      const d = data.data || data
      if (d.triggerId) {
        triggerOnCancelled(d.triggerId, d.durationMs || 0)
        queryClient.invalidateQueries({ queryKey: ['agents', 'triggers'] })
        queryClient.invalidateQueries({ queryKey: ['agents', 'cron-jobs'] })
      }
    })

    es.onopen = () => {
      // Reset retry count on successful connection
      retryCountRef.current = 0
      console.log('[SSE] Connection opened, lastSeq:', lastSeqRef.current)

      // Reconcile patrol store with backend truth on (re)connect
      // Fixes stuck "patrolling" state when SSE missed the completion event
      fetch('/api/patrol/status').then(r => r.json()).then((status: any) => {
        const store = usePatrolStore.getState()
        if (store.isRunning && !status.running) {
          // Backend says patrol is NOT running, but store thinks it is → force complete
          console.log('[SSE] Patrol store reconciliation: backend not running, forcing completed')
          patrolOnProgress({ phase: 'completed', ...(status.lastRun || {}) })
        }
      }).catch(() => { /* ignore */ })
    }

    es.onerror = () => {
      console.warn('[SSE] Connection error, readyState:', es.readyState, 'lastSeq:', lastSeqRef.current)
      es.close()
      eventSourceRef.current = null

      // Reconnect with exponential backoff
      if (retryCountRef.current < MAX_RETRIES) {
        const delay = BASE_DELAY_MS * Math.pow(2, Math.min(retryCountRef.current, 5))
        retryCountRef.current++
        console.warn(`[SSE] Reconnecting in ${delay}ms (attempt ${retryCountRef.current}/${MAX_RETRIES}, lastSeq=${lastSeqRef.current})`)
        reconnectTimerRef.current = setTimeout(connect, delay)
      } else {
        console.error(`[SSE] Max retries (${MAX_RETRIES}) exceeded, giving up. Last seq: ${lastSeqRef.current}`)
      }
    }
  }, [queryClient, patrolOnProgress, patrolOnCaseCompleted, addCaseSessionMessage, addCaseSessionPerSession, addIssueTrackMessage, setIssueTrackingActive, clearIssueTrackMessages, setIssuePendingQuestion, startImplement, addImplementMessage, setImplementStatus, addVerifyMessage, setVerifyActive, setVerifyResult, clearVerify, todoExecSetProgress, todoExecSetResult, sessionStoreSetStatus, sessionStoreSetActiveSession, sessionStoreSetCurrentStep, sessionStoreSetPendingQuestion, sessionStoreClearPendingQuestion, sessionStoreSetHeartbeat, sessionStoreSetQueueStatus])

  useEffect(() => {
    connect()

    // Periodic liveness check: if EventSource dies silently (HMR, StrictMode, proxy timeout),
    // force reconnect. This catches cases where onerror never fires.
    const livenessCheck = setInterval(() => {
      const es = eventSourceRef.current
      if (!es || es.readyState === EventSource.CLOSED) {
        console.warn('[SSE] Liveness check: connection dead, forcing reconnect. lastSeq:', lastSeqRef.current)
        retryCountRef.current = 0 // reset retry counter for fresh reconnect
        connect()
      }
    }, 5000)

    return () => {
      clearInterval(livenessCheck)
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
