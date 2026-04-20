/**
 * subAgentStore.ts — Unified Zustand store for sub-agent monitoring
 *
 * Tracks sub-agents spawned by any main agent (casework steps, patrol, cron jobs).
 * Replaces the patrol-only patrolAgentStore with a source-agnostic model.
 *
 * Fed by SSE events:
 *   - case-step-progress (kind: agent-started/agent-progress/agent-completed)
 *   - patrol-agent (event: started/progress/completed)
 *
 * Sub-agents are grouped by parentSessionId to show under their main agent.
 */
import { create } from 'zustand'

export type SubAgentSource = 'casework' | 'patrol' | 'cron' | 'step' | 'unknown'

export interface SubAgentMessage {
  type: 'system' | 'tool-call' | 'tool-result' | 'thinking' | 'response' | 'completed' | 'failed'
  content: string
  toolName?: string
  timestamp: string
}

export interface SubAgent {
  taskId: string
  agentType: string
  source: SubAgentSource
  /** Parent main agent's session ID (links to UnifiedSession.id) */
  parentSessionId: string
  /** Case number if applicable */
  caseNumber?: string
  status: 'running' | 'completed' | 'failed' | 'stopped'
  description?: string
  startedAt: string
  completedAt?: string
  lastToolName?: string
  summary?: string
  usage?: { total_tokens?: number; tool_uses?: number; duration_ms?: number }
  /** Accumulated SSE messages for this sub-agent */
  messages: SubAgentMessage[]
}

interface SubAgentStore {
  /** All tracked sub-agents, keyed by taskId */
  agents: Record<string, SubAgent>

  /** Handle a sub-agent event (normalized from any SSE source) */
  onAgentEvent: (event: {
    type: 'started' | 'progress' | 'completed'
    taskId: string
    agentType?: string
    source?: SubAgentSource
    parentSessionId: string
    caseNumber?: string
    description?: string
    status?: string
    lastToolName?: string
    summary?: string
    usage?: SubAgent['usage']
    timestamp?: string
  }) => void

  /** Get sub-agents for a specific parent session */
  getByParent: (parentSessionId: string) => SubAgent[]

  /** Hydrate a recovered sub-agent with full state + messages (from disk recovery) */
  hydrate: (agent: SubAgent) => void

  /** Clear sub-agents for a specific parent (or all if no id given) */
  clear: (parentSessionId?: string) => void
}

export const useSubAgentStore = create<SubAgentStore>()((set, get) => ({
  agents: {},

  onAgentEvent: (event) => set((state) => {
    const { type, taskId, parentSessionId } = event
    if (!taskId) return state

    if (type === 'started') {
      const ts = event.timestamp || new Date().toISOString()
      const agent: SubAgent = {
        taskId,
        agentType: event.agentType || 'unknown',
        source: event.source || 'unknown',
        parentSessionId,
        caseNumber: event.caseNumber,
        status: 'running',
        description: event.description,
        startedAt: ts,
        messages: [{
          type: 'system',
          content: `🤖 ${event.agentType || 'Agent'} started${event.description ? ': ' + event.description : ''}`,
          timestamp: ts,
        }],
      }
      return { agents: { ...state.agents, [taskId]: agent } }
    }

    if (type === 'progress') {
      const existing = state.agents[taskId]
      if (!existing) return state
      const ts = event.timestamp || new Date().toISOString()
      const newMessages = [...existing.messages]
      // Add tool-call message if lastToolName changed
      if (event.lastToolName && event.lastToolName !== existing.lastToolName) {
        newMessages.push({
          type: 'tool-call',
          content: event.summary || '',
          toolName: event.lastToolName,
          timestamp: ts,
        })
      } else if (event.summary && event.summary !== existing.summary) {
        // Summary changed without tool change → thinking update
        newMessages.push({
          type: 'thinking',
          content: event.summary,
          timestamp: ts,
        })
      }
      return {
        agents: {
          ...state.agents,
          [taskId]: {
            ...existing,
            lastToolName: event.lastToolName || existing.lastToolName,
            summary: event.summary || existing.summary,
            usage: event.usage || existing.usage,
            messages: newMessages.length > 100 ? newMessages.slice(-100) : newMessages,
          },
        },
      }
    }

    if (type === 'completed') {
      const existing = state.agents[taskId]
      if (!existing) return state
      const rawStatus = event.status || 'completed'
      const ts = event.timestamp || new Date().toISOString()
      const finalStatus = (rawStatus === 'failed' || rawStatus === 'stopped') ? rawStatus as 'failed' | 'stopped' : 'completed' as const
      const newMessages = [...existing.messages, {
        type: (finalStatus === 'failed' ? 'failed' : 'completed') as SubAgentMessage['type'],
        content: event.summary || `Agent ${finalStatus}`,
        timestamp: ts,
      }]
      return {
        agents: {
          ...state.agents,
          [taskId]: {
            ...existing,
            status: finalStatus,
            summary: event.summary || existing.summary,
            usage: event.usage || existing.usage,
            completedAt: ts,
            messages: newMessages,
          },
        },
      }
    }

    return state
  }),

  getByParent: (parentSessionId: string) => {
    return Object.values(get().agents).filter(a => a.parentSessionId === parentSessionId)
  },

  hydrate: (agent: SubAgent) => set((state) => ({
    agents: { ...state.agents, [agent.taskId]: agent },
  })),

  clear: (parentSessionId?: string) => set((state) => {
    if (!parentSessionId) return { agents: {} }
    const filtered: Record<string, SubAgent> = {}
    for (const [id, agent] of Object.entries(state.agents)) {
      if (agent.parentSessionId !== parentSessionId) {
        filtered[id] = agent
      }
    }
    return { agents: filtered }
  }),
}))
