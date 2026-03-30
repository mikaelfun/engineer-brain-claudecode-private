/**
 * test-reader.ts — Read test-loop data files from disk
 *
 * All functions follow the same pattern as case-reader.ts:
 * readFileSync + existsSync guard + JSON.parse with try/catch.
 */
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'fs'
import { join, basename } from 'path'
import { config } from '../config.js'

// ============ Registry Types ============

export interface TestRegistryEntry {
  id: string
  name: string
  description: string
  source: string
  priority: string
  tags: string[]
}

// ============ Types (Pipeline Model) ============

export interface TestStats {
  passed: number
  failed: number
  fixed: number
  skipped: number
}

export interface StageEntry {
  status: string
  summary: string
  duration_ms?: number
  startedAt?: string | null
  completedAt?: string | null
  [key: string]: unknown
}

export interface PipelineState {
  cycle: number
  maxCycles: number
  currentStage: string
  currentTest: string
  stageProgress: unknown | null
  stages: Record<string, StageEntry>
}

export interface QueuesState {
  testQueue: TestQueueItem[]
  fixQueue: TestQueueItem[]
  verifyQueue: TestQueueItem[]
  regressionQueue: TestQueueItem[]
  gaps: unknown[]
  inProgress: string[]
  skipRegistry: unknown[]
}

export interface StatsState {
  cumulative: TestStats
  cycleStats: TestStats
  scanStrategy: Record<string, unknown> | null
  observabilityStatus: ObservabilityStatus | null
}

export interface ReasoningState {
  observe: string | null
  diagnose: string | null
  decide: string | null
  act: string | null
  reflect: string | null
}

export interface SelfHealEvent {
  type: string
  description: string
}

export interface SupervisorState {
  status: string
  tick: number
  active: string | null
  step: string | null
  reasoning: ReasoningState
  selfHealEvent: SelfHealEvent | null
  schedulerInterval: string | null
  lastTickAt: string | null
}

export interface TestQueueItem {
  testId: string
  category?: string
  source?: string
  addedAt?: string
  [key: string]: unknown
}

export interface ObservabilityStatus {
  probesTotal: number
  probesRun: number
  probesPass: number
  probesFail: number
  staleCount: number
  lastResults: Record<string, unknown>
}

// Legacy compat: assembled full state (old format)
export interface RoundJourneyPhase {
  status: string
  summary: string
}

export interface PhaseHistoryEntry {
  phase: string
  action: string
  timestamp: string
  testId?: string
  result?: string
  count?: number
  issueIds?: string[]
  gaps?: number
  regression_gaps?: number
  skipped?: number
  round?: number
  issue_gaps?: number
  obs_gaps?: number
  total_gaps?: number
  note?: string
  tests_added?: number
  [key: string]: unknown
}

export interface TestState {
  // New pipeline model fields
  cycle: number
  maxCycles: number
  currentStage: string
  stages: Record<string, StageEntry>
  // Legacy compat aliases
  phase: string
  round: number
  stats: TestStats
  maxRounds: number
  roundJourney: Record<string, RoundJourneyPhase>
  testQueue: TestQueueItem[]
  fixQueue: TestQueueItem[]
  verifyQueue: TestQueueItem[]
  regressionQueue: TestQueueItem[]
  gaps: unknown[]
  currentTest: string
  inProgress: string[]
  skipRegistry: unknown[]
  phaseHistory: PhaseHistoryEntry[]
  observabilityStatus: ObservabilityStatus
  roundStats: TestStats
  // Supervisor fields
  reasoning?: ReasoningState
  selfHealEvent?: SelfHealEvent | null
}

export interface DiscoverySummary {
  total: number
  verified: number
  fixedUnverified: number
  diagnosed: number
  retryNeeded: number
  regression: number
  unaddressed: number
}

export interface DiscoveryEntry {
  testId: string
  foundRound: number
  firstFailedAssertion: string
  hasAnalysis: boolean
  hasFix: boolean
  hasVerify: boolean
  hasRegression: boolean
  verifiedRound: number | null
  status: string
  rootCause: string | null
}

export interface Discoveries {
  version: number
  generatedAt: string
  generatedByRound: number
  summary: DiscoverySummary
  discoveries: DiscoveryEntry[]
}

export interface RoundSummary {
  round: number
  timestamp: string
  phase: string
  stats: {
    totalTests: number
    passed: number
    failed: number
    fixed: number
    skipped: number
    coverage: number
  }
  queues?: {
    testQueue: number
    fixQueue: number
  }
}

// ============ Paths ============

function testsDir(): string {
  return join(config.projectRoot, 'tests')
}

function resultsDir(): string {
  return join(testsDir(), 'results')
}

// ============ Split State Readers (Pipeline Model) ============

/** Read pipeline.json — cycle, stages, progress */
export function readPipeline(): PipelineState | null {
  const filePath = join(testsDir(), 'pipeline.json')
  if (!existsSync(filePath)) return null
  try {
    const raw = readFileSync(filePath, 'utf-8')
    return JSON.parse(raw) as PipelineState
  } catch (err) {
    console.error('[test-reader] Failed to read pipeline.json:', err)
    return null
  }
}

/** Read queues.json — testQueue, fixQueue, verifyQueue, regressionQueue, gaps, skipRegistry */
export function readQueues(): QueuesState | null {
  const filePath = join(testsDir(), 'queues.json')
  if (!existsSync(filePath)) return null
  try {
    const raw = readFileSync(filePath, 'utf-8')
    return JSON.parse(raw) as QueuesState
  } catch (err) {
    console.error('[test-reader] Failed to read queues.json:', err)
    return null
  }
}

/** Read stats.json — cumulative, cycleStats, scanStrategy, observabilityStatus */
export function readStats(): StatsState | null {
  const filePath = join(testsDir(), 'stats.json')
  if (!existsSync(filePath)) return null
  try {
    const raw = readFileSync(filePath, 'utf-8')
    return JSON.parse(raw) as StatsState
  } catch (err) {
    console.error('[test-reader] Failed to read stats.json:', err)
    return null
  }
}

/** Read supervisor.json — reasoning, selfHealEvent, tick, status */
export function readSupervisor(): SupervisorState | null {
  const filePath = join(testsDir(), 'supervisor.json')
  if (!existsSync(filePath)) return null
  try {
    const raw = readFileSync(filePath, 'utf-8')
    return JSON.parse(raw) as SupervisorState
  } catch (err) {
    console.error('[test-reader] Failed to read supervisor.json:', err)
    return null
  }
}

// ============ Assembled State Reader ============

/**
 * Read full test state — assembles from split files (pipeline.json, queues.json, stats.json, supervisor.json).
 * Falls back to monolithic state.json if split files don't exist (backward compat).
 * Provides legacy field aliases (phase, round, roundJourney, roundStats) for existing consumers.
 */
export function readTestState(): TestState | null {
  const pipeline = readPipeline()

  // If pipeline.json exists, assemble from split files
  if (pipeline) {
    const queues = readQueues()
    const stats = readStats()
    const supervisor = readSupervisor()

    // Build stages → legacy roundJourney mapping
    const roundJourney: Record<string, RoundJourneyPhase> = {}
    if (pipeline.stages) {
      for (const [name, entry] of Object.entries(pipeline.stages)) {
        roundJourney[name] = { status: entry.status, summary: entry.summary }
      }
    }

    // Read phaseHistory from history dir (or empty)
    const phaseHistory = readPhaseHistory(pipeline.cycle)

    return {
      // New pipeline model fields
      cycle: pipeline.cycle,
      maxCycles: pipeline.maxCycles,
      currentStage: pipeline.currentStage,
      stages: pipeline.stages,
      // Legacy compat aliases
      phase: pipeline.currentStage,
      round: pipeline.cycle,
      maxRounds: pipeline.maxCycles,
      currentTest: pipeline.currentTest,
      roundJourney,
      stats: stats?.cumulative || { passed: 0, failed: 0, fixed: 0, skipped: 0 },
      roundStats: stats?.cycleStats || { passed: 0, failed: 0, fixed: 0, skipped: 0 },
      observabilityStatus: stats?.observabilityStatus || { probesTotal: 0, probesRun: 0, probesPass: 0, probesFail: 0, staleCount: 0, lastResults: {} },
      testQueue: queues?.testQueue || [],
      fixQueue: queues?.fixQueue || [],
      verifyQueue: queues?.verifyQueue || [],
      regressionQueue: queues?.regressionQueue || [],
      gaps: queues?.gaps || [],
      inProgress: queues?.inProgress || [],
      skipRegistry: queues?.skipRegistry || [],
      phaseHistory,
      // Supervisor fields
      reasoning: supervisor?.reasoning || undefined,
      selfHealEvent: supervisor?.selfHealEvent || null,
    }
  }

  // Fallback: read monolithic state.json (pre-migration)
  const filePath = join(testsDir(), 'state.json')
  if (!existsSync(filePath)) return null
  try {
    const raw = readFileSync(filePath, 'utf-8')
    return JSON.parse(raw) as TestState
  } catch (err) {
    console.error('[test-reader] Failed to read state.json:', err)
    return null
  }
}

/** Read phase history entries from history directory for the current cycle */
function readPhaseHistory(cycle: number): PhaseHistoryEntry[] {
  const historyDir = join(testsDir(), 'history')
  if (!existsSync(historyDir)) return []
  try {
    // Try cycle-specific history first
    const cycleDir = join(historyDir, `cycle-${cycle}`)
    if (existsSync(cycleDir)) {
      const files = readdirSync(cycleDir)
        .filter(f => f.endsWith('.json'))
        .sort()
      const entries: PhaseHistoryEntry[] = []
      for (const f of files) {
        try {
          const raw = readFileSync(join(cycleDir, f), 'utf-8')
          const data = JSON.parse(raw)
          if (Array.isArray(data)) {
            entries.push(...data)
          } else if (data.stageHistory) {
            entries.push(...data.stageHistory)
          }
        } catch { /* skip */ }
      }
      if (entries.length > 0) return entries
    }
    // Fall back to top-level phase-history.json
    const phFilePath = join(historyDir, 'phase-history.json')
    if (existsSync(phFilePath)) {
      const raw = readFileSync(phFilePath, 'utf-8')
      return JSON.parse(raw) as PhaseHistoryEntry[]
    }
    return []
  } catch {
    return []
  }
}

export function readDiscoveries(): Discoveries | null {
  const filePath = join(testsDir(), 'discoveries.json')
  if (!existsSync(filePath)) return null
  try {
    const raw = readFileSync(filePath, 'utf-8')
    return JSON.parse(raw) as Discoveries
  } catch (err) {
    console.error('[test-reader] Failed to read discoveries.json:', err)
    return null
  }
}

export function readRoundSummaries(): RoundSummary[] {
  const dir = resultsDir()
  if (!existsSync(dir)) return []
  try {
    const files = readdirSync(dir)
      .filter(f => /^round-\d+-summary\.json$/.test(f))
      .sort((a, b) => {
        const numA = parseInt(a.match(/round-(\d+)/)?.[1] || '0')
        const numB = parseInt(b.match(/round-(\d+)/)?.[1] || '0')
        return numA - numB
      })

    return files.map(f => {
      try {
        const raw = readFileSync(join(dir, f), 'utf-8')
        return JSON.parse(raw) as RoundSummary
      } catch {
        return null
      }
    }).filter((s): s is RoundSummary => s !== null)
  } catch (err) {
    console.error('[test-reader] Failed to read round summaries:', err)
    return []
  }
}

export function readTestResult(round: number, testId: string): Record<string, unknown> | null {
  const dir = resultsDir()
  // Try pattern: {round}-{testId}.json
  const filePath = join(dir, `${round}-${testId}.json`)
  if (!existsSync(filePath)) return null
  try {
    const raw = readFileSync(filePath, 'utf-8')
    return JSON.parse(raw)
  } catch (err) {
    console.error(`[test-reader] Failed to read test result ${round}-${testId}:`, err)
    return null
  }
}

export function readFixDetails(testId: string): string | null {
  const fixesDir = join(resultsDir(), 'fixes')
  if (!existsSync(fixesDir)) return null
  try {
    const files = readdirSync(fixesDir)
      .filter(f => f.startsWith(`${testId}-`) && f.endsWith('.md'))
      .sort()

    if (files.length === 0) return null

    // Return latest fix file content
    const latest = files[files.length - 1]
    return readFileSync(join(fixesDir, latest), 'utf-8')
  } catch (err) {
    console.error(`[test-reader] Failed to read fix details for ${testId}:`, err)
    return null
  }
}

export function readManifest(): Record<string, unknown> | null {
  const filePath = join(testsDir(), 'manifest.json')
  if (!existsSync(filePath)) return null
  try {
    const raw = readFileSync(filePath, 'utf-8')
    return JSON.parse(raw)
  } catch (err) {
    console.error('[test-reader] Failed to read manifest.json:', err)
    return null
  }
}

// ============ Evolution ============

export interface EvolutionEntry {
  round: number
  title: string
  impact: string
  timestamp?: string
  category?: string
  [key: string]: unknown
}

export function readEvolution(): EvolutionEntry[] {
  const filePath = join(testsDir(), 'evolution.json')
  if (!existsSync(filePath)) return []
  try {
    const raw = readFileSync(filePath, 'utf-8')
    const data = JSON.parse(raw)
    // evolution.json can be an array or { entries: [...] }
    return Array.isArray(data) ? data : (data.entries || [])
  } catch (err) {
    console.error('[test-reader] Failed to read evolution.json:', err)
    return []
  }
}

// ============ Directives ============

export interface DirectiveEntry {
  type: string
  status: string
  createdAt: string
  source?: string
  [key: string]: unknown
}

export function readDirectives(): DirectiveEntry[] {
  const filePath = join(testsDir(), 'directives.json')
  if (!existsSync(filePath)) return []
  try {
    const raw = readFileSync(filePath, 'utf-8')
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data : (data.directives || [])
  } catch (err) {
    console.error('[test-reader] Failed to read directives.json:', err)
    return []
  }
}

export function writeDirectives(directives: DirectiveEntry[]): void {
  const filePath = join(testsDir(), 'directives.json')
  writeFileSync(filePath, JSON.stringify(directives, null, 2), 'utf-8')
}

// ============ Test Registry ============

// In-memory cache (registry rarely changes during a session)
let _registryCache: Map<string, TestRegistryEntry> | null = null
let _registryCacheTime = 0
const REGISTRY_CACHE_TTL_MS = 5 * 60 * 1000 // 5 min

/**
 * Extract a simple YAML scalar field value from file content.
 * Handles both quoted (`field: "value"`) and unquoted (`field: value`) formats.
 */
function extractYamlField(content: string, field: string): string {
  const match = content.match(new RegExp(`^${field}:\\s*"(.+?)"\\s*$`, 'm'))
  if (match) return match[1]
  // Try unquoted
  const unquoted = content.match(new RegExp(`^${field}:\\s*(.+?)\\s*$`, 'm'))
  return unquoted ? unquoted[1] : ''
}

/**
 * Extract a YAML array field like `tags: ["a", "b", "c"]` from content.
 */
function extractYamlArrayField(content: string, field: string): string[] {
  const match = content.match(new RegExp(`^${field}:\\s*\\[(.+?)\\]\\s*$`, 'm'))
  if (!match) return []
  return match[1]
    .split(',')
    .map(s => s.trim().replace(/^["']|["']$/g, ''))
    .filter(Boolean)
}

/**
 * Recursively scan a directory for .yaml files.
 */
function scanYamlFiles(dir: string): string[] {
  if (!existsSync(dir)) return []
  const results: string[] = []
  try {
    const entries = readdirSync(dir)
    for (const entry of entries) {
      const fullPath = join(dir, entry)
      try {
        const st = statSync(fullPath)
        if (st.isDirectory()) {
          results.push(...scanYamlFiles(fullPath))
        } else if (entry.endsWith('.yaml') || entry.endsWith('.yml')) {
          results.push(fullPath)
        }
      } catch {
        // Skip unreadable entries
      }
    }
  } catch {
    // Skip unreadable directories
  }
  return results
}

/**
 * Read all test registry YAML files and extract metadata.
 * Returns a map of testId → { name, description, source, priority, tags }.
 * Results are cached for 5 minutes.
 */
export function readTestRegistry(): Record<string, TestRegistryEntry> {
  // Return cached if fresh
  if (_registryCache && Date.now() - _registryCacheTime < REGISTRY_CACHE_TTL_MS) {
    return Object.fromEntries(_registryCache)
  }

  const registryDir = join(testsDir(), 'registry')
  const map = new Map<string, TestRegistryEntry>()

  const yamlFiles = scanYamlFiles(registryDir)
  for (const filePath of yamlFiles) {
    try {
      const content = readFileSync(filePath, 'utf-8')
      const id = extractYamlField(content, 'id')
      if (!id) continue

      map.set(id, {
        id,
        name: extractYamlField(content, 'name'),
        description: extractYamlField(content, 'description'),
        source: extractYamlField(content, 'source'),
        priority: extractYamlField(content, 'priority'),
        tags: extractYamlArrayField(content, 'tags'),
      })
    } catch {
      // Skip unparseable files
    }
  }

  _registryCache = map
  _registryCacheTime = Date.now()
  console.log(`[test-reader] Registry loaded: ${map.size} test definitions`)
  return Object.fromEntries(map)
}
