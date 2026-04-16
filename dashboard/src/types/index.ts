/**
 * Engineer Brain Dashboard — 共享类型定义
 */

// ============ Case 相关 ============

export interface CaseInfo {
  caseNumber: string
  title: string
  severity: string
  status: string
  sap: string
  is24x7: string
  assignedTo: string
  createdOn: string
  caseAge: string
  activeHours: string
  origin: string
  timezone: string
  country: string
  fetchedAt: string
  modifiedAt?: string
  contact: {
    name: string
    email: string
    phone: string
    preferredMethod: string
  }
  customer: string
  customerStatement: string
  entitlement: {
    serviceLevel: string
    serviceName: string
    schedule: string
    contractCountry: string
  }
  emailCount: number
  noteCount: number
  phoneCallCount: number
  laborCount: number
  icmCount: number
  attachmentCount: number
}

export interface CaseSummary {
  caseNumber: string
  title: string
  severity: string
  status: string
  customer: string
  assignedTo: string
  createdOn: string
  caseAge: string
  fetchedAt?: string
  teamsLastMessageTime?: string
  meta: CaseHealthMeta | null
}

export interface CaseStats {
  total: number
  bySeverity: Record<string, number>
  byStatus: Record<string, number>
  slaAtRisk: number
  needsMyAction: number
  awaitingOthers: number
}

// ============ Email 相关 ============

export interface Email {
  id: string
  direction: 'sent' | 'received'
  date: string
  subject: string
  from: string
  to: string
  cc: string
  body: string
}

// ============ Note 相关 ============

export interface Note {
  id: string
  date: string
  author: string
  title: string
  body: string
}

// ============ Labor Record 相关 ============

export interface LaborRecord {
  date: string
  durationMin: number
  classification: string
  description: string
}

// ============ Todo 相关 ============

export interface TodoFile {
  date: string
  filename: string
  title: string
  patrolInfo: string
  sections: TodoSection[]
  summary: TodoSummary | null
}

export interface TodoSection {
  type: 'carryover' | 'patrol'
  title: string
  cases: TodoCase[]
}

export interface TodoCase {
  caseNumber: string
  customer: string
  severity: string
  status: string
  priority: 'red' | 'yellow' | 'green'
  description: string
  items: TodoItem[]
}

export interface TodoItem {
  lineNumber: number
  checked: boolean
  priority: 'red' | 'yellow' | 'done'
  text: string
  isCarryover: boolean
}

export interface TodoSummary {
  urgent: string[]
  pending: string[]
  carryover: string[]
  normal: string[]
}

// ============ CaseHealth Meta ============

export interface CaseHealthMeta {
  caseNumber: string
  lastInspected: string
  fwr: SlaStatus
  fdr: SlaStatus
  irSla: SlaStatus
  teams_last_updated?: string
  teams_chat_count?: number
  actualStatus?: string
  daysSinceLastContact?: number
  statusJudgedAt?: string
  statusReasoning?: string
  compliance?: {
    entitlementOk: boolean
    serviceLevel: string
    serviceName: string
    schedule: string
    contractCountry: string
    is21vConvert: boolean
    '21vCaseId': string | null
    '21vCaseOwner': string | null
    warnings: string[]
  }
  ccEmails?: string
  ccAccount?: string
  ccKnowMePage?: string
}

export interface SlaStatus {
  status: string
  remaining: string | null
  checkedAt: string
}

// ============ Patrol State ============

export interface PatrolState {
  lastPatrol: string
  activeCases: string[]
  arCases: string[]
  todoFile: string
  patrolType: string
  summary: {
    pendingEngineer: number
    pendingCustomer: number
    waitingPG: number
    ar: number
    normal: number
  }
  currentPatrolStartedAt: string
  lastRunTiming: {
    caseCount: number
    startedAt: string
    completedAt: string
    wallClockMinutes: number
    computeSeconds: number
    bottlenecks: string[]
  }
}

// ============ Agent 相关 ============

export interface AgentInfo {
  id: string
  name?: string
  model: string
  workspace?: string
  agentDir?: string
  subagents?: {
    allowAgents: string[]
  }
}

export interface CronJob {
  id: string
  agentId: string
  name: string
  enabled: boolean
  createdAtMs: number
  updatedAtMs?: number
  schedule: {
    kind: string
    expr?: string
    tz?: string
    at?: string
  }
  state?: {
    nextRunAtMs?: number
    lastRunAtMs?: number
    lastRunStatus?: string
    lastStatus?: string
    lastDurationMs?: number
    lastError?: string
    lastOutput?: string
    consecutiveErrors?: number
  }
}

// ============ Draft 相关 ============

export interface Draft {
  caseNumber: string
  filename: string
  content: string
  createdAt: string
  ccAccount?: string   // RDSE customer name from meta.json
  ccList?: string      // matched CC list from mooncake-cc.json
}

// ============ SSE 事件 ============

export type SSEEventType =
  | 'case-updated'
  | 'todo-updated'
  | 'patrol-updated'
  | 'draft-updated'
  | 'cron-updated'
  | 'connected'
  | 'case-session-updated'
  | 'patrol-progress'
  | 'patrol-case-completed'
  | 'settings-updated'
  | 'case-session-started'
  | 'case-session-thinking'
  | 'case-session-tool-call'
  | 'case-session-tool-result'
  | 'case-session-completed'
  | 'case-session-failed'
  | 'issue-implement-started'
  | 'issue-implement-progress'
  | 'issue-implement-completed'
  | 'issue-implement-error'
  | 'issue-track-started'
  | 'issue-track-progress'
  | 'issue-track-completed'
  | 'issue-track-error'
  | 'issue-track-question'
  | 'issue-verify-started'
  | 'issue-verify-progress'
  | 'issue-verify-completed'
  | 'issue-verify-error'
  | 'todo-execute-progress'
  | 'todo-execute-result'
  | 'case-step-started'
  | 'case-step-progress'
  | 'case-step-completed'
  | 'case-step-failed'
  | 'case-step-question'
  | 'case-step-heartbeat'
  | 'sdk-queue-changed'
  | 'test-state-updated'
  | 'test-pipeline-updated'
  | 'test-supervisor-updated'
  | 'test-queues-updated'
  | 'test-stats-updated'
  | 'test-discoveries-updated'
  | 'test-result-updated'
  | 'test-evolution-updated'
  | 'test-directives-updated'
  | 'runner-status-changed'
  | 'skill-registry-updated'
  | 'trigger-started'
  | 'trigger-progress'
  | 'trigger-completed'
  | 'trigger-failed'
  | 'trigger-cancelled'

export interface SSEEvent {
  type: SSEEventType
  data: Record<string, unknown>
  timestamp: string
}

// ============ Auth 相关 ============

export interface AuthStatus {
  isSetup: boolean
  isAuthenticated: boolean
}

export interface AuthPayload {
  sub: string
  iat: number
  exp: number
}

// ============ Workflow / Agent 相关 ============

export type WorkflowId = 'patrol' | 'troubleshoot' | 'draft-email' | 'casework'

export type SessionStatus = 'active' | 'completed' | 'failed'

export interface WorkflowConfig {
  id: WorkflowId
  name: string
  description: string
  icon: string
  requiredParams: string[]
  maxIterations: number
  timeoutMs: number
}

export interface AgentSession {
  id: string
  workflowId: WorkflowId
  workflowName: string
  status: SessionStatus
  params: Record<string, string>
  messages: AgentMessage[]
  toolCalls: AgentToolCallRecord[]
  result?: string
  error?: string
  startedAt: string
  completedAt?: string
  iterations: number
  maxIterations: number
}

export interface AgentMessage {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string | null
  tool_calls?: Array<{
    id: string
    type: 'function'
    function: { name: string; arguments: string }
  }>
  tool_call_id?: string
  timestamp: string
}

export interface AgentToolCallRecord {
  callId: string
  toolName: string
  args: Record<string, string>
  success: boolean
  output: string
  error?: string
  durationMs: number
  timestamp: string
}

// ============ Patrol 进度 ============

export interface PatrolProgress {
  phase: 'discovering' | 'filtering' | 'warming-up' | 'processing' | 'aggregating' | 'completed' | 'failed'
  totalCases?: number
  changedCases?: number
  processedCases?: number
  currentCase?: string
  error?: string
  detail?: string
  todoSummary?: PatrolTodoSummary
  caseResults?: Array<{ caseNumber: string; status: string; error?: string }>
}

export interface PatrolTodoSummary {
  red: Array<{ caseNumber: string; items: string[] }>
  yellow: Array<{ caseNumber: string; items: string[] }>
  green: Array<{ caseNumber: string; items: string[] }>
}

// ============ Issue Tracker ============

export type IssueType = 'bug' | 'feature' | 'refactor' | 'chore'
export type IssuePriority = 'P0' | 'P1' | 'P2'
export type IssueStatus = 'pending' | 'tracking' | 'tracked' | 'in-progress' | 'implemented' | 'done'

export interface IssueVerifyResult {
  // Old format fields (still present for backward compat)
  unitTest?: { success: boolean; output: string }
  uiTest?: { success: boolean; output: string }
  verifiedAt?: string
  // New format fields (criteria-based)
  regression?: 'pass' | 'fail'
  criteria?: TrackVerifyCriterion[]
  timestamp?: string
}

export interface Issue {
  id: string
  title: string
  description: string
  type: IssueType
  priority: IssuePriority
  status: IssueStatus
  trackId?: string
  testLoopScan?: boolean
  verifyResult?: IssueVerifyResult
  createdAt: string
  updatedAt: string
}

// ============ Conductor Track ============

export type TrackVerificationStatus = 'pending' | 'running' | 'passed' | 'failed' | 'skipped'
export type TrackVerificationMethod = 'auto' | 'manual'

/** Single criterion result from reasoning-driven verification (SKILL.md format) */
export interface TrackVerifyCriterion {
  id: string           // e.g. "AC1"
  description: string
  result: 'pass' | 'fail' | 'skip'
  evidence: string
  recipe?: string | null  // e.g. "file-content-check.md"
}

export interface TrackVerification {
  status: TrackVerificationStatus
  method?: TrackVerificationMethod
  timestamp?: string
  reason?: string                // mark-done reason
  regression?: 'pass' | 'fail'  // Step 1 regression guard result

  // --- Old format (unitTest + uiTest) ---
  result?: {
    unitTest: { success: boolean; output: string }
    uiTest: { success: boolean; output: string }
    verifiedAt: string
    // Allow extra fields from scanner verification etc.
    [key: string]: unknown
  }

  // --- New format (criteria-based, from SKILL.md) ---
  criteria?: TrackVerifyCriterion[]
}

export interface TrackMetadata {
  id: string
  title: string
  type: string
  status: string
  issueId?: string
  verification?: TrackVerification
  created: string
  updated: string
  phases: { total: number; completed: number }
  tasks: { total: number; completed: number }
  commits?: string[]
}

// ============ Execution Summary (ISS-136) ============

export interface ToolCallRecord {
  name: string
  success: boolean
  error?: string
}

export interface ExecutionSummary {
  agentType: string
  turns: number
  mcpServers: string[]
  toolCalls: ToolCallRecord[]
}

// ============ Unified Session View ============

export type UnifiedSessionType = 'case' | 'implement' | 'verify' | 'track-creation'
export type UnifiedSessionStatus = 'active' | 'paused' | 'completed' | 'failed'

export interface UnifiedSession {
  id: string
  type: UnifiedSessionType
  status: UnifiedSessionStatus
  context: string // case number or issue ID
  intent: string // description of what the session is doing
  startedAt: string
  lastActivityAt: string
  metadata?: Record<string, unknown> // type-specific extra data
}
