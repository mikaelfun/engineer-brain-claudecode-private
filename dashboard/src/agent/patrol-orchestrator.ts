/**
 * patrol-orchestrator.ts — SDK query()-based patrol orchestration
 *
 * Replaces the CLI-based patrol with TypeScript orchestration
 * that runs per-case SDK query() calls through the sdkQueue. Benefits:
 *   - No child process reliability issues on Windows
 *   - Per-case SSE streaming via broadcastSDKMessages
 *   - Fine-grained progress tracking and cancel support
 *   - MCP server scoping per step (casework-light → ICM only, etc.)
 *
 * Exports:
 *   - runSdkPatrol(force): Main entry point
 *   - isSdkPatrolRunning(): Status check
 *   - cancelSdkPatrol(): Abort in-flight patrol
 */
import { query, type Options, type McpServerConfig, type AgentDefinition } from '@anthropic-ai/claude-agent-sdk'
import {
  existsSync, readFileSync, writeFileSync, mkdirSync,
  readdirSync, renameSync, statSync, rmSync,
} from 'fs'
import { join, resolve, dirname } from 'path'
import { execSync, exec } from 'child_process'
import { promisify } from 'util'
import { config } from '../config.js'
import { sdkQueue } from '../utils/sdk-queue.js'
import { sseManager } from '../watcher/sse-manager.js'
import { broadcastSDKMessages } from '../utils/sdk-message-broadcaster.js'
import { loadAgentDefinitions, registerCaseSession, updateCaseSessionStatus } from './case-session-manager.js'

const execAsync = promisify(exec)


// ============================================================
// Types
// ============================================================

/** Result of a completed patrol run */
export interface PatrolResult {
  phase: 'completed' | 'failed'
  totalCases: number
  changedCases: number
  processedCases: number
  archivedCases: Array<{ caseNumber: string; reason: string }>
  caseResults: Array<{
    caseNumber: string
    status: string
    actions?: string
    durationMs?: number
    error?: string
  }>
  wallClockMinutes: number
  error?: string
  startedAt: string
  completedAt: string
}

/** Action entry from execution-plan.json */
interface ExecutionPlanAction {
  type: string
  emailType?: string
  [key: string]: unknown
}

/** Archive detection output from detect-case-status.ps1 */
interface ArchiveEntry {
  caseNumber: string
  reason: string
  targetFolder: string
}


// ============================================================
// Module state
// ============================================================

let patrolRunning = false
let patrolAbortController: AbortController | null = null

/** Counter for processed cases (updated during processing phase) */
let processedCount = 0

/**
 * In-flight patrol progress snapshot.
 * Updated as patrol progresses; read by `/patrol/status` API for page-refresh recovery.
 */
let patrolLiveProgress: {
  phase: string
  totalCases: number
  changedCases: number
  processedCases: number
  caseList: string[]
  caseResults: PatrolResult['caseResults']
  startedAt: string
  detail?: string
} | null = null


// ============================================================
// Public API
// ============================================================

/**
 * Run a full SDK-based patrol.
 *
 * Flow: discover → warm-up → process (per-case SDK queries) → aggregate → done.
 *
 * @param force - If true, process all cases regardless of lastInspected freshness
 * @returns PatrolResult with per-case outcomes and timing
 */
export async function runSdkPatrol(force: boolean): Promise<PatrolResult> {
  if (patrolRunning) {
    return makeFailedResult('Patrol is already running')
  }

  patrolRunning = true
  patrolAbortController = new AbortController()
  processedCount = 0
  // Notify Agent Monitor that a patrol session started (ISS-082 follow-up)
  sseManager.broadcast('sessions-changed' as any, { reason: 'patrol-started' })
  const startedAt = new Date().toISOString()
  const startMs = Date.now()

  patrolLiveProgress = {
    phase: 'starting',
    totalCases: 0,
    changedCases: 0,
    processedCases: 0,
    caseList: [],
    caseResults: [],
    startedAt,
  }

  const result: PatrolResult = {
    phase: 'completed',
    totalCases: 0,
    changedCases: 0,
    processedCases: 0,
    archivedCases: [],
    caseResults: [],
    wallClockMinutes: 0,
    startedAt,
    completedAt: '',
  }

  try {
    // Ensure .patrol directory exists
    const patrolDir = join(config.casesDir, '.patrol')
    if (!existsSync(patrolDir)) {
      mkdirSync(patrolDir, { recursive: true })
    }

    // ---- Phase 1: Discovering ----
    broadcastPhase('discovering')
    console.log(`[sdk-patrol] casesDir=${config.casesDir}, activeCasesDir=${config.activeCasesDir}, exists=${existsSync(config.activeCasesDir)}`)

    const { activeCases, archivedCases } = await discoverCases()
    console.log(`[sdk-patrol] discoverCases returned: active=${activeCases.length}, archived=${archivedCases.length}, cases=${activeCases.join(',')}`)
    result.archivedCases = archivedCases
    result.totalCases = activeCases.length

    checkAborted()

    // Filter by freshness
    const filteredCases = filterByFreshness(activeCases, force)
    result.changedCases = filteredCases.length

    broadcastPhase('discovering', {
      totalCases: activeCases.length,
      changedCases: filteredCases.length,
      caseList: filteredCases,
    })

    // Update live progress snapshot for API consumers
    if (patrolLiveProgress) {
      patrolLiveProgress.phase = 'discovering'
      patrolLiveProgress.totalCases = activeCases.length
      patrolLiveProgress.changedCases = filteredCases.length
      patrolLiveProgress.caseList = filteredCases
    }

    console.log(`[sdk-patrol] Discovered ${activeCases.length} active cases, ${filteredCases.length} need processing (force=${force})`)

    if (filteredCases.length === 0) {
      result.completedAt = new Date().toISOString()
      result.wallClockMinutes = elapsedMinutes(startMs)
      finalizePatrol(result)
      return result
    }

    // ---- Phase 2: Warming up ----
    checkAborted()
    if (patrolLiveProgress) patrolLiveProgress.phase = 'warming-up'
    broadcastPhase('warming-up')
    await warmUp()

    // ---- Phase 3: Processing ----
    checkAborted()
    if (patrolLiveProgress) patrolLiveProgress.phase = 'processing'
    broadcastPhase('processing', { changedCases: filteredCases.length })

    const casePromises = filteredCases.map(caseNumber => {
      return sdkQueue.enqueue(async () => {
        checkAborted()
        const caseResult = await processSingleCase(caseNumber)
        result.caseResults.push(caseResult)
        processedCount++
        result.processedCases = processedCount

        // Update live progress snapshot
        if (patrolLiveProgress) {
          patrolLiveProgress.processedCases = processedCount
          patrolLiveProgress.caseResults = [...result.caseResults]
        }

        broadcastPhase('processing', {
          changedCases: filteredCases.length,
          processedCases: processedCount,
        })
      }, `patrol:${caseNumber}`, `patrol:${caseNumber}`)
    })

    await Promise.allSettled(casePromises)

    // ---- Phase 4: Aggregating ----
    if (patrolLiveProgress) patrolLiveProgress.phase = 'aggregating'
    broadcastPhase('aggregating')

    // Check if all cases failed
    const allFailed = result.caseResults.length > 0 &&
      result.caseResults.every(r => r.status === 'error')
    if (allFailed) {
      result.phase = 'failed'
      result.error = 'All cases failed during processing'
    }

    // ---- Phase 5: Completed ----
    result.completedAt = new Date().toISOString()
    result.wallClockMinutes = elapsedMinutes(startMs)
    finalizePatrol(result)

    return result
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    const isAbort = errorMsg.includes('Patrol aborted')

    result.phase = 'failed'
    result.error = isAbort ? 'Patrol cancelled by user' : errorMsg
    result.completedAt = new Date().toISOString()
    result.wallClockMinutes = elapsedMinutes(startMs)

    console.error(`[sdk-patrol] Patrol ${isAbort ? 'cancelled' : 'failed'}:`, errorMsg)
    broadcastPhase('failed', { error: result.error })
    savePatrolLastRun(result as unknown as Record<string, unknown>)

    return result
  } finally {
    patrolRunning = false
    patrolAbortController = null
    patrolLiveProgress = null
  }
}

/** Check if a patrol is currently running */
export function isSdkPatrolRunning(): boolean {
  return patrolRunning
}

/**
 * Get a snapshot of the current patrol progress.
 * Returns null when no patrol is running.
 * Used by `/patrol/status` API for page-refresh recovery.
 */
export function getSdkPatrolLiveProgress() {
  return patrolLiveProgress
}

/**
 * Cancel the current patrol run.
 * Signals the AbortController, which will cause in-flight SDK queries to abort
 * and checkAborted() calls to throw.
 *
 * @returns true if a patrol was running and has been signalled to cancel
 */
export function cancelSdkPatrol(): boolean {
  if (!patrolAbortController) return false
  console.log('[sdk-patrol] Cancel requested')
  patrolAbortController.abort()
  return true
}


// ============================================================
// Phase 1: Discovery
// ============================================================

/**
 * Discover active cases and archive resolved/transferred ones.
 *
 * 1. Runs list-active-cases.ps1 to get the current D365 active case list
 * 2. Runs detect-case-status.ps1 to identify cases that should be archived
 * 3. Moves archived cases to the appropriate subdirectory
 */
async function discoverCases(): Promise<{
  activeCases: string[]
  archivedCases: Array<{ caseNumber: string; reason: string }>
}> {
  const archivedCases: Array<{ caseNumber: string; reason: string }> = []

  // Get active case list from D365
  let allCaseNumbers: string[] = []
  try {
    const listScript = join(config.projectRoot, 'skills', 'd365-case-ops', 'scripts', 'list-active-cases.ps1')
    console.log(`[sdk-patrol] Running list-active-cases: ${listScript}`)
    const listOutput = execSync(
      `pwsh -NoProfile -File "${listScript}" -OutputJson`,
      { cwd: config.projectRoot, encoding: 'utf-8', timeout: 60_000 },
    )
    console.log(`[sdk-patrol] list-active-cases output length: ${listOutput.length}`)
    // Parse JSON output — script may output non-JSON lines before the array
    const jsonMatch = listOutput.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      allCaseNumbers = Array.isArray(parsed)
        ? parsed.map((c: any) => String(c.caseNumber || c.ticketnumber || c))
        : []
      console.log(`[sdk-patrol] Parsed ${allCaseNumbers.length} cases from PS: ${allCaseNumbers.join(',')}`)
    } else {
      console.warn('[sdk-patrol] No JSON array found in list-active-cases output')
    }
  } catch (err) {
    console.warn('[sdk-patrol] list-active-cases.ps1 failed, falling back to directory scan:',
      (err as Error).message)
    allCaseNumbers = readActiveCaseDirs()
  }

  // If PowerShell gave no results, fallback to directory scan
  if (allCaseNumbers.length === 0) {
    allCaseNumbers = readActiveCaseDirs()
  }

  // Detect archive candidates
  try {
    const detectScript = join(config.projectRoot, 'skills', 'd365-case-ops', 'scripts', 'detect-case-status.ps1')
    const detectOutput = execSync(
      `pwsh -NoProfile -File "${detectScript}" -CasesRoot "${config.casesDir}"`,
      { cwd: config.projectRoot, encoding: 'utf-8', timeout: 60_000 },
    )
    const jsonMatch = detectOutput.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      const entries: ArchiveEntry[] = JSON.parse(jsonMatch[0])
      for (const entry of entries) {
        const srcDir = join(config.activeCasesDir, entry.caseNumber)
        if (!existsSync(srcDir)) continue

        const targetBase = entry.targetFolder === 'transfer'
          ? join(config.casesDir, 'transfer')
          : join(config.casesDir, 'archived')
        const destDir = join(targetBase, entry.caseNumber)

        try {
          if (!existsSync(targetBase)) mkdirSync(targetBase, { recursive: true })
          // If destination already exists, remove it first to avoid nesting or ENOTEMPTY
          if (existsSync(destDir)) {
            rmSync(destDir, { recursive: true, force: true })
            console.log(`[sdk-patrol] Removed stale archived dir for ${entry.caseNumber}`)
          }
          renameSync(srcDir, destDir)
          archivedCases.push({ caseNumber: entry.caseNumber, reason: entry.reason })
          console.log(`[sdk-patrol] Archived ${entry.caseNumber} → ${entry.targetFolder} (${entry.reason})`)
        } catch (moveErr) {
          console.warn(`[sdk-patrol] Failed to archive ${entry.caseNumber}:`,
            (moveErr as Error).message)
        }
      }
    }
  } catch (err) {
    console.warn('[sdk-patrol] detect-case-status.ps1 failed, skipping archive:',
      (err as Error).message)
  }

  // Refresh the active list after archiving
  const archivedNumbers = new Set(archivedCases.map(a => a.caseNumber))
  const activeCases = allCaseNumbers.filter(cn => {
    if (archivedNumbers.has(cn)) return false
    return existsSync(join(config.activeCasesDir, cn))
  })

  return { activeCases, archivedCases }
}

/** Read case directory names from the active cases folder */
function readActiveCaseDirs(): string[] {
  try {
    if (!existsSync(config.activeCasesDir)) return []
    return readdirSync(config.activeCasesDir, { withFileTypes: true })
      .filter(d => d.isDirectory() && /^\d{16}/.test(d.name))
      .map(d => d.name)
  } catch {
    return []
  }
}

/**
 * Filter cases by lastInspected freshness.
 *
 * Reads each case's casehealth-meta.json to check when it was last inspected.
 * Cases without meta or with stale lastInspected are included.
 *
 * @param cases - All active case numbers
 * @param force - If true, include all cases regardless of freshness
 * @returns Case numbers that need processing
 */
function filterByFreshness(cases: string[], force: boolean): string[] {
  if (force) return cases

  const patrolSkipHours = readConfigValue('patrolSkipHours', 3)
  const thresholdMs = patrolSkipHours * 60 * 60 * 1000
  const now = Date.now()

  return cases.filter(cn => {
    const metaPath = join(config.activeCasesDir, cn, 'casehealth-meta.json')
    try {
      if (!existsSync(metaPath)) return true
      const meta = JSON.parse(readFileSync(metaPath, 'utf-8'))
      if (!meta.lastInspected) return true
      const inspectedAt = new Date(meta.lastInspected).getTime()
      return (now - inspectedAt) > thresholdMs
    } catch {
      return true // On parse error, include the case
    }
  })
}


// ============================================================
// Phase 2: Warm-up
// ============================================================

/**
 * Run warm-up scripts in parallel:
 *   - check-ir-status-batch.ps1: Batch-check IR/SLA status and save to meta files
 *   - warm-dtm-token.ps1: Pre-warm DTM authentication token
 *
 * Both scripts are fire-and-forget — failures are logged but don't block patrol.
 */
async function warmUp(): Promise<void> {
  const irScript = join(config.projectRoot, 'skills', 'd365-case-ops', 'scripts', 'check-ir-status-batch.ps1')
  const warmScript = join(config.projectRoot, 'skills', 'd365-case-ops', 'scripts', 'warm-dtm-token.ps1')

  const tasks: string[] = []
  if (existsSync(irScript)) tasks.push('IR batch')
  if (existsSync(warmScript)) tasks.push('DTM token')

  broadcastPhase('warming-up', { detail: `Starting: ${tasks.join(' + ')}...` })

  const promises: Promise<unknown>[] = []

  if (existsSync(irScript)) {
    broadcastPhase('warming-up', { detail: 'IR batch status check running...' })
    promises.push(
      execAsync(
        `pwsh -NoProfile -File "${irScript}" -SaveMeta -MetaDir "${config.activeCasesDir}"`,
        { cwd: config.projectRoot, timeout: 60_000 },
      ).then(() => {
        broadcastPhase('warming-up', { detail: 'IR batch ✓' })
        console.log('[sdk-patrol] IR batch check completed')
      }).catch(err => {
        broadcastPhase('warming-up', { detail: 'IR batch ✗ (non-blocking)' })
        console.warn('[sdk-patrol] check-ir-status-batch failed:', (err as Error).message)
      }),
    )
  }

  if (existsSync(warmScript)) {
    broadcastPhase('warming-up', { detail: 'DTM token warm-up running...' })
    promises.push(
      execAsync(
        `pwsh -NoProfile -File "${warmScript}" -CasesRoot "${config.casesDir}"`,
        { cwd: config.projectRoot, timeout: 60_000 },
      ).then(() => {
        broadcastPhase('warming-up', { detail: 'DTM token ✓' })
        console.log('[sdk-patrol] DTM token warm-up completed')
      }).catch(err => {
        broadcastPhase('warming-up', { detail: 'DTM token ✗ (non-blocking)' })
        console.warn('[sdk-patrol] warm-dtm-token failed:', (err as Error).message)
      }),
    )
  }

  if (promises.length > 0) {
    await Promise.all(promises)
  }

  broadcastPhase('warming-up', { detail: 'Warm-up complete ✓' })
  console.log('[sdk-patrol] Warm-up completed')
}


// ============================================================
// Phase 3: Per-case processing
// ============================================================

/**
 * Process a single case through the patrol pipeline:
 *
 *   a. casework-light (data-refresh → compliance → status-judge)
 *   b. Read execution-plan.json for follow-up actions
 *   c. Execute each action (troubleshooter, email-drafter)
 *   d. Run inspection-writer (todo + inspection)
 *
 * Each step is a separate SDK query() call scoped with appropriate MCP servers.
 * Errors are caught per-case and don't propagate to other cases.
 *
 * @param caseNumber - The D365 case number to process
 * @returns Per-case result entry for the caseResults array
 */
async function processSingleCase(
  caseNumber: string,
): Promise<PatrolResult['caseResults'][number]> {
  const startTime = Date.now()
  // Register a patrol session so Agent Monitor can track it immediately
  const patrolSessionId = `patrol-${caseNumber}-${Date.now()}`
  registerCaseSession(patrolSessionId, caseNumber, `Patrol: ${caseNumber}`, true)

  try {
    checkAborted()

    // Determine case properties
    const isAR = caseNumber.length >= 19
    const mainCaseId = isAR ? caseNumber.slice(0, 16) : ''
    const teamsSearchCacheHours = readConfigValue('teamsSearchCacheHours', 8)

    broadcastPhase('processing', { currentCase: caseNumber })
    // Notify Agent Monitor that a per-case session is starting
    sseManager.broadcast('sessions-changed' as any, { reason: 'patrol-case-started', caseNumber })

    // ---- Step A: casework-light ----
    const caseworkPrompt = [
      `轻量 casework for Case ${caseNumber}。`,
      `caseDir: ./cases/active/${caseNumber}/`,
      `projectRoot: .`,
      `casesRoot: ./cases`,
      `isAR: ${isAR}`,
      `mainCaseId: ${mainCaseId}`,
      `skipDataRefresh: false`,
      `teamsSearchCacheHours: ${teamsSearchCacheHours}`,
      `请读取 .claude/agents/casework-light.md 获取完整执行步骤。`,
    ].join('\n')

    const caseworkIter = query({
      prompt: caseworkPrompt,
      options: buildQueryOptions('casework-light'),
    })

    const caseworkResult = await broadcastSDKMessages(caseNumber, 'patrol', caseworkIter)

    // Update session with real SDK session ID if available
    if (caseworkResult.sessionId && caseworkResult.sessionId !== patrolSessionId) {
      updateCaseSessionStatus(patrolSessionId, 'completed')
      registerCaseSession(caseworkResult.sessionId, caseNumber, `Patrol → casework-light`, true)
      updateCaseSessionStatus(caseworkResult.sessionId, 'completed')
    } else {
      updateCaseSessionStatus(patrolSessionId, 'completed')
    }
    sseManager.broadcast('sessions-changed' as any, { reason: 'patrol-casework-completed', caseNumber })

    checkAborted()

    // ---- Step B: Read execution plan ----
    const actions = readExecutionPlan(caseNumber)

    // Broadcast routing decision as SSE so case page shows patrol orchestration
    const planPath = join(config.activeCasesDir, caseNumber, 'execution-plan.json')
    let routingSummary = `No actions planned`
    try {
      if (existsSync(planPath)) {
        const plan = JSON.parse(readFileSync(planPath, 'utf-8'))
        if (plan.noActionReason) {
          routingSummary = `Routing: no-action — ${plan.noActionReason}`
        } else if (actions.length > 0) {
          routingSummary = `Routing: ${actions.map((a: any) => a.type).join(' → ')} (${plan.routingSource || 'rule-table'})`
        }
      }
    } catch { /* ignore parse errors */ }

    sseManager.broadcast('case-step-progress' as any, {
      caseNumber,
      step: 'patrol',
      kind: 'thinking',
      content: routingSummary,
      timestamp: new Date().toISOString(),
    })

    // ---- Step C: Execute follow-up actions ----
    for (const action of actions) {
      checkAborted()

      const actionPrompt = buildActionPrompt(caseNumber, action)
      const stepMcp = action.type === 'email-drafter' ? 'email-drafter'
        : action.type === 'troubleshooter' ? 'troubleshooter'
          : 'casework-light'

      // Register a session for each follow-up action so Agent Monitor tracks it
      const actionSessionId = `patrol-${action.type}-${caseNumber}-${Date.now()}`
      registerCaseSession(actionSessionId, caseNumber, `Patrol → ${action.type}`, true)
      sseManager.broadcast('sessions-changed' as any, { reason: 'patrol-action-started', caseNumber, action: action.type })

      const actionIter = query({
        prompt: actionPrompt,
        options: buildQueryOptions(stepMcp),
      })

      const actionResult = await broadcastSDKMessages(caseNumber, action.type, actionIter)

      // Update session: use real SDK id if available, mark completed
      if (actionResult.sessionId && actionResult.sessionId !== actionSessionId) {
        updateCaseSessionStatus(actionSessionId, 'completed')
        registerCaseSession(actionResult.sessionId, caseNumber, `Patrol → ${action.type}`, true)
        updateCaseSessionStatus(actionResult.sessionId, 'completed')
      } else {
        updateCaseSessionStatus(actionSessionId, 'completed')
      }
      sseManager.broadcast('sessions-changed' as any, { reason: 'patrol-action-completed', caseNumber, action: action.type })
    }

    checkAborted()

    // ---- Step D: Inspection writer ----
    const inspSessionId = `patrol-inspection-${caseNumber}-${Date.now()}`
    registerCaseSession(inspSessionId, caseNumber, `Patrol → inspection`, true)

    const inspectionPrompt = [
      `仅执行 inspection-writer for Case ${caseNumber}。`,
      `caseDir: ./cases/active/${caseNumber}/。`,
      `请读取 .claude/skills/inspection-writer/SKILL.md 获取完整执行步骤。`,
      `只做 inspection + todo 生成，不做其他步骤。`,
    ].join('')

    const inspIter = query({
      prompt: inspectionPrompt,
      options: buildQueryOptions('inspection'),
    })

    await broadcastSDKMessages(caseNumber, 'inspection', inspIter)
    updateCaseSessionStatus(inspSessionId, 'completed')

    // ---- Done ----
    const durationMs = Date.now() - startTime

    // Mark patrol session as completed in session store
    updateCaseSessionStatus(patrolSessionId, 'completed')

    sseManager.broadcast('patrol-case-completed' as any, {
      caseNumber,
      durationMs,
    })
    // Broadcast case session lifecycle events so frontend case pages update correctly
    sseManager.broadcast('case-session-completed' as any, {
      caseNumber,
      step: 'patrol',
      durationMs,
    })
    // Refresh Agent Monitor session list after each case completes
    sseManager.broadcast('sessions-changed' as any, { reason: 'patrol-case-completed', caseNumber })

    console.log(`[sdk-patrol] Case ${caseNumber} completed in ${Math.round(durationMs / 1000)}s`)

    return {
      caseNumber,
      status: 'completed',
      actions: actions.map(a => a.type).join(', ') || 'none',
      durationMs,
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)

    // Propagate abort errors so the top-level loop stops
    if (errorMsg.includes('Patrol aborted')) throw err

    console.error(`[sdk-patrol] Case ${caseNumber} failed:`, errorMsg)

    // Mark patrol session as failed in session store
    updateCaseSessionStatus(patrolSessionId, 'failed')

    // Broadcast failure events so frontend case pages show the error
    sseManager.broadcast('case-step-failed' as any, {
      caseNumber,
      step: 'patrol',
      error: errorMsg,
    })
    sseManager.broadcast('sessions-changed' as any, { reason: 'patrol-case-failed', caseNumber })

    return {
      caseNumber,
      status: 'error',
      durationMs: Date.now() - startTime,
      error: errorMsg,
    }
  }
}

/**
 * Read execution-plan.json from a case directory.
 * Returns an empty array if the file doesn't exist or is invalid.
 */
function readExecutionPlan(caseNumber: string): ExecutionPlanAction[] {
  const planPath = join(config.activeCasesDir, caseNumber, 'execution-plan.json')
  try {
    if (!existsSync(planPath)) return []
    const plan = JSON.parse(readFileSync(planPath, 'utf-8'))
    const actions = Array.isArray(plan.actions) ? plan.actions : []
    // Filter out actions without a type to prevent "undefined" in session names
    return actions.filter((a: any) => a && typeof a.type === 'string' && a.type)
  } catch {
    return []
  }
}

/**
 * Build a prompt for a follow-up action (troubleshooter, email-drafter, etc.)
 * All paths use POSIX-style relative format as required by CLAUDE.md.
 */
function buildActionPrompt(caseNumber: string, action: ExecutionPlanAction): string {
  const caseDir = `./cases/active/${caseNumber}/`

  switch (action.type) {
    case 'troubleshooter':
      return `Execute troubleshooter for Case ${caseNumber}。caseDir: ${caseDir}。请读取 .claude/agents/troubleshooter.md 获取完整执行步骤。`

    case 'email-drafter':
      return `Execute email-drafter for Case ${caseNumber}。caseDir: ${caseDir}。emailType: ${action.emailType || 'follow-up'}。请读取 .claude/agents/email-drafter.md 获取完整执行步骤。`

    default:
      return `Execute ${action.type} for Case ${caseNumber}。caseDir: ${caseDir}。请读取 .claude/agents/${action.type}.md 获取完整执行步骤。`
  }
}


// ============================================================
// MCP Server Loading
// ============================================================

/**
 * Load MCP server configs from .mcp.json, filtered by step name.
 *
 * Each patrol step only needs a subset of MCP servers:
 *   - casework-light: ICM only (for IR/entitlement checks)
 *   - troubleshooter:  ICM + Kusto + msft-learn
 *   - email-drafter:   Mail
 *   - inspection:      none (pure file I/O)
 */

/** MCP servers relevant to case processing (full set) */
const CASE_MCPS = ['icm', 'teams', 'mail', 'kusto', 'msft-learn', 'local-rag']

/** Per-step MCP requirements — steps not listed get the full set */
const STEP_MCPS: Record<string, string[]> = {
  'casework-light': ['icm'],
  'troubleshooter': ['icm', 'kusto', 'msft-learn'],
  'email-drafter': ['mail'],
  'inspection': [],
}

/** Cached raw MCP config (loaded once per process lifetime) */
let _mcpConfigCache: Record<string, McpServerConfig> | null = null

/**
 * Load and filter MCP server configs for a given step.
 * Caches the full set from .mcp.json on first call.
 */
function loadCaseMcpServers(stepName?: string): Record<string, McpServerConfig> {
  // Load + cache the full set once
  if (_mcpConfigCache === null) {
    const mcpConfigPath = join(config.projectRoot, '.mcp.json')
    if (!existsSync(mcpConfigPath)) {
      _mcpConfigCache = {}
    } else {
      try {
        const raw = JSON.parse(readFileSync(mcpConfigPath, 'utf-8'))
        const allServers: Record<string, any> = raw.mcpServers || {}
        const filtered: Record<string, McpServerConfig> = {}
        for (const name of CASE_MCPS) {
          if (allServers[name]) filtered[name] = allServers[name] as McpServerConfig
        }
        _mcpConfigCache = filtered
      } catch {
        _mcpConfigCache = {}
      }
    }
  }

  // Apply step-level filter
  if (stepName && stepName in STEP_MCPS) {
    const needed = STEP_MCPS[stepName]
    if (needed.length === 0) return {}
    const result: Record<string, McpServerConfig> = {}
    for (const name of needed) {
      if (_mcpConfigCache[name]) result[name] = _mcpConfigCache[name]
    }
    return result
  }

  // Default: return a copy of all case MCP servers
  return { ..._mcpConfigCache }
}


// ============================================================
// Query Options Builder
// ============================================================

/**
 * Build common SDK query options for patrol sub-steps.
 *
 * All patrol queries share:
 *   - Same permission model (bypassPermissions)
 *   - Same base tools (Bash, Read, Glob, Grep)
 *   - Same project root as cwd
 *   - Same agent definitions
 *   - Patrol's shared AbortController for cancellation
 */
function buildQueryOptions(stepName: string): { cwd: string } & Options {
  return {
    cwd: config.projectRoot,
    settingSources: ['user'] as Options['settingSources'],
    agents: loadAgentDefinitions(),
    mcpServers: loadCaseMcpServers(stepName),
    systemPrompt: { type: 'preset' as const, preset: 'claude_code' as const },
    tools: ['Bash', 'Read', 'Glob', 'Grep'],
    allowedTools: ['Bash', 'Read', 'Glob', 'Grep'],
    permissionMode: 'bypassPermissions' as const,
    allowDangerouslySkipPermissions: true,
    maxTurns: 200,
    model: 'sonnet',
    abortController: patrolAbortController ?? undefined,
  }
}


// ============================================================
// Persistence
// ============================================================

const PATROL_LAST_RUN_PATH = config.patrolLastRunFile

/**
 * Save patrol result for dashboard consumption.
 *
 * Writes two files:
 *   1. dashboard/.patrol-last-run.json — full result for the Last Patrol API
 *   2. cases/.patrol/casehealth-state.json — summary for the Dashboard card
 */
function savePatrolLastRun(data: Record<string, unknown>): void {
  try {
    writeFileSync(PATROL_LAST_RUN_PATH, JSON.stringify(data, null, 2), 'utf-8')
  } catch (err) {
    console.warn('[sdk-patrol] Failed to save last run:', err)
  }

  // Also write casehealth-state.json for Dashboard Last Patrol card
  try {
    const stateFile = config.patrolStateFile
    const stateDir = dirname(stateFile)
    if (!existsSync(stateDir)) mkdirSync(stateDir, { recursive: true })

    const stateData: Record<string, unknown> = {
      lastPatrol: data.completedAt || data.startedAt || new Date().toISOString(),
      currentPatrolStartedAt: data.startedAt,
      patrolType: data.phase === 'completed' ? 'full' : String(data.phase || 'unknown'),
      lastRunTiming: {
        caseCount: data.changedCases ?? data.totalCases ?? 0,
        wallClockMinutes: data.wallClockMinutes ?? 0,
        computeSeconds: 0,
        bottlenecks: [],
      },
    }
    writeFileSync(stateFile, JSON.stringify(stateData, null, 2), 'utf-8')
  } catch (err) {
    console.warn('[sdk-patrol] Failed to save patrol state:', err)
  }
}

/** Load the last patrol run result (for API consumers) */
export function loadPatrolLastRun(): Record<string, unknown> | null {
  try {
    if (existsSync(PATROL_LAST_RUN_PATH)) {
      return JSON.parse(readFileSync(PATROL_LAST_RUN_PATH, 'utf-8'))
    }
  } catch { /* ignore */ }
  return null
}


// ============================================================
// Helpers
// ============================================================

/** Broadcast a patrol phase SSE event */
function broadcastPhase(phase: string, extra: Record<string, unknown> = {}): void {
  sseManager.broadcast('patrol-progress' as any, { phase, ...extra })
}

/**
 * Finalize patrol: broadcast completion events and persist results.
 * Called on both success (all/some cases done) and early-exit (0 cases to process).
 */
function finalizePatrol(result: PatrolResult): void {
  broadcastPhase('completed', {
    totalCases: result.totalCases,
    changedCases: result.changedCases,
    processedCases: result.processedCases,
    archivedCases: result.archivedCases.length,
    wallClockMinutes: result.wallClockMinutes,
  })

  sseManager.broadcast('patrol-updated' as any, {
    processedCases: result.processedCases,
    changedCases: result.changedCases,
    totalCases: result.totalCases,
  })

  // Notify Agent Monitor that patrol sessions are done
  sseManager.broadcast('sessions-changed' as any, { reason: 'patrol-completed' })

  savePatrolLastRun(result as unknown as Record<string, unknown>)
  console.log(
    `[sdk-patrol] Patrol completed: ${result.processedCases}/${result.changedCases} cases in ${result.wallClockMinutes}min`,
  )
}

/** Calculate elapsed minutes from a start timestamp (ms) */
function elapsedMinutes(startMs: number): number {
  return Math.round((Date.now() - startMs) / 60_000)
}

/** Throw if the patrol has been aborted via cancelSdkPatrol() */
function checkAborted(): void {
  if (patrolAbortController?.signal.aborted) {
    throw new Error('Patrol aborted by user')
  }
}

/** Create a failed PatrolResult with an error message (used for early-exit errors) */
function makeFailedResult(error: string): PatrolResult {
  const now = new Date().toISOString()
  return {
    phase: 'failed',
    totalCases: 0,
    changedCases: 0,
    processedCases: 0,
    archivedCases: [],
    caseResults: [],
    wallClockMinutes: 0,
    error,
    startedAt: now,
    completedAt: now,
  }
}

/**
 * Read a numeric config value from config.json dynamically.
 * Re-reads the file each call to pick up runtime config changes.
 *
 * @param key - The config key to read
 * @param defaultValue - Fallback if key is missing or not a number
 */
function readConfigValue(key: string, defaultValue: number): number {
  try {
    const configPath = join(config.projectRoot, 'config.json')
    const raw = JSON.parse(readFileSync(configPath, 'utf-8'))
    const val = raw[key]
    return typeof val === 'number' ? val : defaultValue
  } catch {
    return defaultValue
  }
}

