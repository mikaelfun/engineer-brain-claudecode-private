/**
 * patrolAgentStore.ts — Zustand store for patrol sub-agent monitoring
 *
 * Tracks sub-agents spawned during patrol runs (casework, troubleshooter,
 * email-drafter, reassess, challenger, summarize).
 *
 * Fed by SSE event: patrol-agent (events: started, progress, completed)
 * Cleared when patrol restarts (patrol-state phase=starting).
 */
import { create } from 'zustand'

export interface PatrolAgent {
  taskId: string
  agentType: string
  caseNumber?: string
  status: 'running' | 'completed' | 'failed' | 'stopped'
  description?: string
  startedAt: string
  completedAt?: string
  lastToolName?: string
  summary?: string
  usage?: { total_tokens: number; tool_uses: number; duration_ms: number }
}

export interface PatrolMainMessage {
  kind: 'tool-call' | 'thinking' | 'tool-result'
  toolName?: string
  content: string
  timestamp: string
}

interface PatrolAgentStore {
  /** All tracked agents, keyed by taskId */
  agents: Record<string, PatrolAgent>

  /** Main agent messages (tool-call/thinking/tool-result) during patrol */
  mainMessages: PatrolMainMessage[]

  /** SessionId of the patrol run these messages belong to */
  sessionId: string | null

  /** SSE handler for patrol-agent events */
  onPatrolAgent: (data: Record<string, unknown>) => void

  /** SSE handler for patrol-main-progress events */
  onMainProgress: (data: Record<string, unknown>) => void

  /** Clear all agent state (called on patrol restart) */
  clear: () => void

  /** Set session ID for tracking which patrol run messages belong to */
  setSessionId: (id: string) => void
}

const MAX_MAIN_MESSAGES = 200

export const usePatrolAgentStore = create<PatrolAgentStore>()((set) => ({
  agents: {},
  mainMessages: [],
  sessionId: null,

  onMainProgress: (data) => set((state) => {
    const kind = data.kind as PatrolMainMessage['kind']
    if (!kind) return state
    const msg: PatrolMainMessage = {
      kind,
      toolName: data.toolName as string | undefined,
      content: (data.content as string) || '',
      timestamp: (data.timestamp as string) || new Date().toISOString(),
    }
    const updated = [...state.mainMessages, msg]
    return {
      mainMessages: updated.length > MAX_MAIN_MESSAGES
        ? updated.slice(-MAX_MAIN_MESSAGES)
        : updated,
    }
  }),

  onPatrolAgent: (data) => set((state) => {
    const event = data.event as string
    const taskId = data.taskId as string
    if (!taskId) return state

    if (event === 'started') {
      const agent: PatrolAgent = {
        taskId,
        agentType: (data.agentType as string) || 'unknown',
        caseNumber: data.caseNumber as string | undefined,
        status: 'running',
        description: data.description as string | undefined,
        startedAt: (data.timestamp as string) || new Date().toISOString(),
      }
      return { agents: { ...state.agents, [taskId]: agent } }
    }

    if (event === 'progress') {
      const existing = state.agents[taskId]
      if (!existing) return state
      const newSummary = (data.summary as string) || (data.description as string) || existing.summary
      return {
        agents: {
          ...state.agents,
          [taskId]: {
            ...existing,
            lastToolName: (data.lastToolName as string) || existing.lastToolName,
            summary: newSummary,
            usage: (data.usage as PatrolAgent['usage']) || existing.usage,
          },
        },
      }
    }

    if (event === 'completed') {
      const existing = state.agents[taskId]
      if (!existing) return state
      const status = (data.status as string) || 'completed'
      return {
        agents: {
          ...state.agents,
          [taskId]: {
            ...existing,
            status: (status === 'failed' || status === 'stopped') ? status : 'completed',
            summary: (data.summary as string) || existing.summary,
            usage: (data.usage as PatrolAgent['usage']) || existing.usage,
            completedAt: (data.timestamp as string) || new Date().toISOString(),
          },
        },
      }
    }

    return state
  }),

  clear: () => set({ agents: {}, mainMessages: [], sessionId: null }),

  setSessionId: (id: string) => set({ sessionId: id }),
}))

/** Hydrate agent store from /api/patrol/messages on page load (SSE doesn't replay history) */
export function hydratePatrolAgents() {
  fetch('/api/patrol/messages')
    .then(r => r.json())
    .then(data => {
      const msgs: Array<Record<string, any>> = data.messages || data || []
      const agents: Record<string, PatrolAgent> = {}
      for (const m of msgs) {
        const taskId = m.taskId as string
        if (!taskId) continue
        if (m.kind === 'agent-started') {
          agents[taskId] = {
            taskId,
            agentType: m.agentType || 'unknown',
            caseNumber: m.caseNumber,
            status: 'running',
            description: m.content,
            startedAt: m.timestamp || new Date().toISOString(),
          }
        } else if (m.kind === 'agent-progress' && agents[taskId]) {
          agents[taskId].summary = m.content || agents[taskId].summary
        } else if (m.kind === 'agent-completed' && agents[taskId]) {
          agents[taskId].status = 'completed'
          agents[taskId].summary = m.content || agents[taskId].summary
          agents[taskId].completedAt = m.timestamp
        }
      }
      // Only hydrate if store is currently empty (don't overwrite live SSE data)
      const current = usePatrolAgentStore.getState().agents
      if (Object.keys(current).length === 0 && Object.keys(agents).length > 0) {
        usePatrolAgentStore.setState({ agents })
      }
    })
    .catch(() => {})
}
