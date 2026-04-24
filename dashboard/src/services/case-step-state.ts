/**
 * case-step-state.ts — In-memory cache of case step execution progress messages
 *
 * Modeled after issue-track-state.ts, this provides:
 *   - Semantic message types (started/thinking/tool-call/completed/error/question)
 *   - Per-case step state with messages, isActive, pendingQuestion
 *   - Page-refresh recovery via GET /case/:id/step-progress
 *   - AskUserQuestion interception support (pending question state)
 *
 * Data is ephemeral — lost on server restart. The underlying case session status
 * is persisted in .case-sessions.json.
 */

export interface CaseStepQuestion {
  question: string
  header?: string
  options?: Array<{ label: string; description?: string }>
  multiSelect?: boolean
}

export interface CaseStepMessage {
  kind: 'started' | 'thinking' | 'response' | 'tool-call' | 'tool-result' | 'completed' | 'error' | 'question' | 'agent-started' | 'agent-progress' | 'agent-completed'
  content?: string
  toolName?: string
  step?: string
  error?: string
  questions?: CaseStepQuestion[]
  sessionId?: string
  timestamp: string
}

interface PendingQuestion {
  sessionId: string
  questions: CaseStepQuestion[]
  askedAt: string
}

interface StepState {
  messages: CaseStepMessage[]
  isActive: boolean
  currentStep?: string
  executionId?: string
  pendingQuestion?: PendingQuestion | null
  cancelled?: boolean
}

const MAX_MESSAGES = 100

class CaseStepStateManager {
  private states = new Map<string, StepState>()

  /** Initialize step state for a case (called on step-started) */
  start(caseNumber: string, stepName?: string, executionId?: string): void {
    this.states.set(caseNumber, {
      messages: [],
      isActive: true,
      currentStep: stepName,
      executionId,
    })
  }

  /** Add a progress message (capped at MAX_MESSAGES) */
  addMessage(caseNumber: string, msg: CaseStepMessage): void {
    const state = this.states.get(caseNumber)
    if (!state) {
      // Auto-initialize if needed (e.g. server restarted mid-step)
      this.states.set(caseNumber, {
        messages: [msg],
        isActive: true,
        currentStep: msg.step,
      })
      return
    }
    state.messages.push(msg)
    if (state.messages.length > MAX_MESSAGES) {
      state.messages = state.messages.slice(-MAX_MESSAGES)
    }
  }

  /** Mark step as finished (completed or error) */
  finish(caseNumber: string): void {
    const state = this.states.get(caseNumber)
    if (state) {
      state.isActive = false
    }
  }

  /** Get current state for a case (for the step-progress API) */
  getState(caseNumber: string): StepState | null {
    return this.states.get(caseNumber) || null
  }

  /** Check if a case step is actively running */
  isActive(caseNumber: string): boolean {
    return this.states.get(caseNumber)?.isActive ?? false
  }

  /** Store a pending question (agent asked AskUserQuestion, waiting for user answer) */
  setPendingQuestion(caseNumber: string, sessionId: string, questions: CaseStepQuestion[]): void {
    const state = this.states.get(caseNumber)
    if (state) {
      state.pendingQuestion = { sessionId, questions, askedAt: new Date().toISOString() }
    }
  }

  /** Get the pending question for a case */
  getPendingQuestion(caseNumber: string): PendingQuestion | null {
    return this.states.get(caseNumber)?.pendingQuestion ?? null
  }

  /** Clear pending question (after user answers) */
  clearPendingQuestion(caseNumber: string): void {
    const state = this.states.get(caseNumber)
    if (state) {
      state.pendingQuestion = null
    }
  }

  /** Clear state for a case (optional cleanup) */
  clear(caseNumber: string): void {
    this.states.delete(caseNumber)
  }

  /** Mark step as cancelled — agent output will be discarded */
  cancel(caseNumber: string): void {
    const state = this.states.get(caseNumber)
    if (state) {
      state.cancelled = true
      state.isActive = false
      state.pendingQuestion = null
    }
  }

  /** Check if a case's step was cancelled */
  isCancelled(caseNumber: string): boolean {
    return this.states.get(caseNumber)?.cancelled ?? false
  }

  /** Get all step states (for monitoring/debug) */
  getAll(): Array<{
    caseNumber: string
    isActive: boolean
    currentStep?: string
    executionId?: string
    messageCount: number
    hasPendingQuestion: boolean
    startedAt?: string
  }> {
    return Array.from(this.states.entries()).map(([caseNumber, state]) => ({
      caseNumber,
      isActive: state.isActive,
      currentStep: state.currentStep,
      executionId: state.executionId,
      messageCount: state.messages.length,
      hasPendingQuestion: !!state.pendingQuestion,
      startedAt: state.messages[0]?.timestamp,
    }))
  }
}

export const caseStepState = new CaseStepStateManager()
