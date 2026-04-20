/**
 * sdk-session-registry.ts — Unified SDK session observation layer
 *
 * Every SDK query() call registers here so Agent Monitor can observe it.
 * Provides: register → onMessage → complete/fail lifecycle,
 * with auto sessionId extraction, sub-agent detection, and SSE broadcast.
 *
 * Guide: playbooks/guides/sdk-session-registry.md
 */
import { sseManager } from '../watcher/sse-manager.js'
import { existsSync } from 'fs'
import { parseSessionLog } from '../utils/session-log-parser.js'

// ---- Types ----

export type AgentSource = 'case' | 'patrol' | 'cron' | 'implement' | 'verify' | 'batch' | 'test' | 'track-creation'

export interface MainAgent {
  /** Registry-assigned unique ID */
  id: string
  /** SDK session ID (filled after first message) */
  sessionId?: string
  /** Source type for filtering/display */
  source: AgentSource
  /** Display identifier (case number, issue id, job name) */
  context: string
  /** Human-readable task description */
  intent: string
  /** Lifecycle status */
  status: 'active' | 'paused' | 'completed' | 'failed'
  /** Timestamps */
  registeredAt: string
  lastActivityAt: string
  completedAt?: string
  /** Arbitrary metadata (stepName, trackId, etc.) */
  metadata?: Record<string, unknown>
  /** Error message (when failed) */
  error?: string
}

export interface RegisterOptions {
  source: AgentSource
  context: string
  intent: string
  metadata?: Record<string, unknown>
}

export interface SessionHandle {
  /** Registry ID of this agent */
  readonly id: string
  /** Feed an SDK message — auto extracts sessionId, detects sub-agents, updates activity */
  onMessage(message: any): void
  /** Mark session as completed */
  complete(): void
  /** Mark session as failed */
  fail(error?: string): void
  /** Get current agent state */
  getAgent(): MainAgent
}

// ---- Implementation ----

/** Extract session_id from SDK messages */
function extractSessionId(message: any): string | undefined {
  if (message.session_id) return message.session_id
  return undefined
}

/** Max completed agents to keep in memory */
const MAX_COMPLETED = 50

let nextId = 1

class SdkSessionRegistry {
  private agents = new Map<string, MainAgent>()
  /** Map SDK sessionId → registry id (for reverse lookups) */
  private sessionIndex = new Map<string, string>()
  /** Sub-agent tracking per registry id */
  private subAgentMaps = new Map<string, Record<string, string>>() // taskId → agentType
  private seenUuids = new Map<string, Set<string>>()

  /**
   * Register a new SDK query session. Returns a handle for lifecycle management.
   */
  register(opts: RegisterOptions): SessionHandle {
    const id = `agent-${nextId++}`
    const now = new Date().toISOString()

    const agent: MainAgent = {
      id,
      source: opts.source,
      context: opts.context,
      intent: opts.intent,
      status: 'active',
      registeredAt: now,
      lastActivityAt: now,
      metadata: opts.metadata,
    }

    this.agents.set(id, agent)
    this.subAgentMaps.set(id, {})
    this.seenUuids.set(id, new Set())

    // SSE broadcast
    sseManager.broadcast('agent-registered' as any, {
      id,
      source: opts.source,
      context: opts.context,
      intent: opts.intent,
      timestamp: now,
    })

    console.log(`[registry] Registered ${id}: source=${opts.source} context=${opts.context} intent="${opts.intent}"`)

    // Trim old completed agents
    this.trimCompleted()

    const self = this
    const handle: SessionHandle = {
      id,
      onMessage(message: any) {
        self.handleMessage(id, message)
      },
      complete() {
        self.markComplete(id)
      },
      fail(error?: string) {
        self.markFailed(id, error)
      },
      getAgent() {
        return self.agents.get(id)!
      },
    }

    return handle
  }

  /** Process an SDK message for a registered agent */
  private handleMessage(id: string, message: any): void {
    const agent = this.agents.get(id)
    if (!agent) return

    agent.lastActivityAt = new Date().toISOString()

    // Extract sessionId from first message that has it
    if (!agent.sessionId) {
      const sid = extractSessionId(message)
      if (sid) {
        agent.sessionId = sid
        this.sessionIndex.set(sid, id)
        sseManager.broadcast('agent-session-bound' as any, {
          id,
          sessionId: sid,
          source: agent.source,
          context: agent.context,
          timestamp: agent.lastActivityAt,
        })
        console.log(`[registry] ${id} bound to SDK session ${sid}`)
      }
    }

    // Detect sub-agent lifecycle events
    const subtype = message.subtype as string | undefined
    const taskAgentMap = this.subAgentMaps.get(id) || {}
    const seenSet = this.seenUuids.get(id) || new Set()

    if (subtype === 'task_started') {
      const taskId = message.task_id as string
      const agentType = message.task_type || 'unknown'
      taskAgentMap[taskId] = agentType
      this.subAgentMaps.set(id, taskAgentMap)

      sseManager.broadcast('case-step-progress' as any, {
        caseNumber: agent.context,
        sessionId: agent.sessionId,
        kind: 'agent-started',
        agentType,
        taskId,
        description: message.description,
        parentAgentId: id,
        timestamp: new Date().toISOString(),
      })
    }

    if (subtype === 'task_progress') {
      const taskId = message.task_id as string
      if (!seenSet.has(message.uuid)) {
        seenSet.add(message.uuid)
        this.seenUuids.set(id, seenSet)

        sseManager.broadcast('case-step-progress' as any, {
          caseNumber: agent.context,
          sessionId: agent.sessionId,
          kind: 'agent-progress',
          agentType: taskAgentMap[taskId] || 'unknown',
          taskId,
          lastToolName: message.last_tool_name,
          summary: message.summary,
          usage: message.usage,
          parentAgentId: id,
          timestamp: new Date().toISOString(),
        })
      }
    }

    if (subtype === 'task_notification') {
      const taskId = message.task_id as string
      const agentType = taskAgentMap[taskId] || message.task_type || 'unknown'
      const outputFile = message.output_file as string | undefined

      // Parse output file → full sub-agent messages (thinking/tool-call/tool-result/response)
      let agentMessages: any[] | undefined
      if (outputFile && existsSync(outputFile)) {
        try {
          const parsed = parseSessionLog(outputFile)
          if (parsed.mainMessages.length > 0) {
            agentMessages = parsed.mainMessages
          }
        } catch { /* non-fatal */ }
      }

      sseManager.broadcast('case-step-progress' as any, {
        caseNumber: agent.context,
        sessionId: agent.sessionId,
        kind: 'agent-completed',
        agentType,
        taskId,
        status: message.status,
        summary: message.summary,
        usage: message.usage,
        parentAgentId: id,
        timestamp: new Date().toISOString(),
        ...(agentMessages ? { messages: agentMessages } : {}),
      })

      delete taskAgentMap[taskId]
      this.subAgentMaps.set(id, taskAgentMap)
    }
  }

  private markComplete(id: string): void {
    const agent = this.agents.get(id)
    if (!agent) return
    const now = new Date().toISOString()
    agent.status = 'completed'
    agent.completedAt = now
    agent.lastActivityAt = now
    this.cleanup(id)

    sseManager.broadcast('agent-completed' as any, {
      id,
      source: agent.source,
      context: agent.context,
      status: 'completed',
      timestamp: now,
    })
    console.log(`[registry] ${id} completed: ${agent.source}/${agent.context}`)
  }

  private markFailed(id: string, error?: string): void {
    const agent = this.agents.get(id)
    if (!agent) return
    const now = new Date().toISOString()
    agent.status = 'failed'
    agent.completedAt = now
    agent.lastActivityAt = now
    agent.error = error
    this.cleanup(id)

    sseManager.broadcast('agent-completed' as any, {
      id,
      source: agent.source,
      context: agent.context,
      status: 'failed',
      error,
      timestamp: now,
    })
    console.log(`[registry] ${id} failed: ${agent.source}/${agent.context} error=${error}`)
  }

  private cleanup(id: string): void {
    this.subAgentMaps.delete(id)
    this.seenUuids.delete(id)
  }

  /** List all agents (active first, then recent completed) */
  listAll(): MainAgent[] {
    return Array.from(this.agents.values())
      .sort((a, b) => {
        // Active before completed
        if (a.status === 'active' && b.status !== 'active') return -1
        if (a.status !== 'active' && b.status === 'active') return 1
        // Then by lastActivityAt desc
        return new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime()
      })
  }

  /** Get agent by registry ID */
  get(id: string): MainAgent | undefined {
    return this.agents.get(id)
  }

  /** Get agent by context (e.g. case number) — returns the most recent active one */
  getByContext(context: string): MainAgent | undefined {
    let best: MainAgent | undefined
    for (const agent of this.agents.values()) {
      if (agent.context !== context) continue
      if (agent.status === 'active') return agent // active takes priority
      if (!best || new Date(agent.lastActivityAt) > new Date(best.lastActivityAt)) {
        best = agent
      }
    }
    return best
  }

  /** Get agent by SDK session ID */
  getBySessionId(sessionId: string): MainAgent | undefined {
    const id = this.sessionIndex.get(sessionId)
    return id ? this.agents.get(id) : undefined
  }

  /** Remove completed agents beyond MAX_COMPLETED limit */
  private trimCompleted(): void {
    const completed = Array.from(this.agents.values())
      .filter(a => a.status === 'completed' || a.status === 'failed')
      .sort((a, b) => new Date(b.completedAt || b.lastActivityAt).getTime() - new Date(a.completedAt || a.lastActivityAt).getTime())

    if (completed.length > MAX_COMPLETED) {
      for (const old of completed.slice(MAX_COMPLETED)) {
        this.agents.delete(old.id)
        if (old.sessionId) this.sessionIndex.delete(old.sessionId)
      }
    }
  }

  /** Get active count */
  get activeCount(): number {
    let count = 0
    for (const a of this.agents.values()) {
      if (a.status === 'active') count++
    }
    return count
  }

  /** Get total count */
  get totalCount(): number {
    return this.agents.size
  }
}

/** Singleton registry instance */
export const sdkRegistry = new SdkSessionRegistry()
