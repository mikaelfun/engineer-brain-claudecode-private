# Patrol Page Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the Patrol page from 6 flat pipeline stages to 3 parent stages with sub-steps (sidebar), and from a 4-step/3-zone case row to a 3-step pipeline header with clickable detail panels and rich action cards.

**Architecture:** Frontend-only refactor of 2 component trees (PatrolSidebar, PatrolCaseRow) plus store type updates and backend phase-name mapping. SSE event structure and backend orchestration logic remain unchanged — only phase string values get a compatibility layer.

**Tech Stack:** React + TypeScript + Zustand + CSS variables (dual theme light/dark)

---

## File Structure

### Frontend (dashboard/web/src/)

| File | Action | Responsibility |
|---|---|---|
| `stores/patrolStore.ts` | Modify | Update PatrolPhase type, add phase mapping, update RUNNING_PHASES |
| `components/patrol/PatrolSidebar.tsx` | Rewrite | 3 parent stages (Initialize/Process/Finalize) with sub-steps |
| `components/patrol/PatrolCaseRow.tsx` | Rewrite | 3-step pipeline header + detail panel container + click state |
| `components/patrol/ActionFlowTimeline.tsx` | Create | Vertical timeline with rich action cards for Act detail |
| `components/patrol/RefreshDetail.tsx` | Create | Subtask grid for Data Refresh detail |
| `components/patrol/SummaryDetail.tsx` | Create | Todo list for Summary detail |
| `components/pipeline/CaseworkPipeline.tsx` | Modify | Update DEFAULT_CASEWORK_STEPS to 3 steps, update STEP_ICONS |
| `pages/PatrolPage.tsx` | Modify | Update RUNNING_PHASES array |
| `components/patrol/PatrolHeader.tsx` | Modify | Update RUNNING_PHASES array |
| `components/patrol/PatrolCaseList.tsx` | Modify | Update RUNNING_PHASES array |

### Backend (dashboard/src/)

| File | Action | Responsibility |
|---|---|---|
| `services/patrol-state-manager.ts` | Modify | Add phase mapping layer (old→new names), update PIPELINE_PHASES |
| `types/index.ts` | Modify | Update PatrolProgressEvent phase type |

---

### Task 1: PatrolStore — Phase Type Update + Backward Compat Mapping

**Files:**
- Modify: `dashboard/web/src/stores/patrolStore.ts`

This task updates the PatrolPhase type and adds a mapping function so the frontend can accept both old (from backend/SSE during transition) and new phase names.

- [ ] **Step 1: Update PatrolPhase type**

In `dashboard/web/src/stores/patrolStore.ts`, replace the PatrolPhase type (line 11-14):

```typescript
// Old:
export type PatrolPhase =
  | 'idle' | 'starting' | 'discovering' | 'filtering'
  | 'warming-up' | 'processing' | 'aggregating'
  | 'completed' | 'failed'

// New:
export type PatrolPhase =
  | 'idle' | 'initializing' | 'processing' | 'finalizing'
  | 'completed' | 'failed'

/** Map old backend phase names to new 3-phase model (backward compat) */
function mapPhase(raw: string): PatrolPhase {
  switch (raw) {
    case 'starting':
    case 'discovering':
    case 'filtering':
    case 'warming-up':
      return 'initializing'
    case 'processing':
      return 'processing'
    case 'aggregating':
      return 'finalizing'
    case 'initializing':
    case 'finalizing':
      return raw as PatrolPhase
    case 'completed':
    case 'failed':
    case 'idle':
      return raw as PatrolPhase
    default:
      return 'idle'
  }
}
```

- [ ] **Step 2: Apply mapPhase in onPatrolState handler**

In the `onPatrolState` handler (line 134), change:
```typescript
// Old:
const phase = (data.phase as PatrolPhase) || 'idle'

// New:
const phase = mapPhase((data.phase as string) || 'idle')
```

- [ ] **Step 3: Update start() action phase value**

In the `start` action (line 215), change:
```typescript
// Old:
phase: 'starting' as PatrolPhase,

// New:
phase: 'initializing' as PatrolPhase,
```

- [ ] **Step 4: Update the "phase === 'starting'" reset guard in onPatrolState**

In `onPatrolState`, the reset guard checks `if (phase === 'starting')` (line 166). Since backend still sends `'starting'` which now maps to `'initializing'`, update:
```typescript
// Old:
if (phase === 'starting') {

// New:
if (phase === 'initializing') {
```

- [ ] **Step 5: Verify no other references to old phase names in the store**

Search the file for any remaining old phase string literals (`'starting'`, `'discovering'`, `'filtering'`, `'warming-up'`, `'aggregating'`). All should go through `mapPhase()` or be updated to new names.

- [ ] **Step 6: Commit**

```bash
git add dashboard/web/src/stores/patrolStore.ts
git commit -m "refactor(patrolStore): update PatrolPhase to 3-phase model with backward compat mapping"
```

---

### Task 2: Update RUNNING_PHASES in Page + Header + CaseList

**Files:**
- Modify: `dashboard/web/src/pages/PatrolPage.tsx`
- Modify: `dashboard/web/src/components/patrol/PatrolHeader.tsx`
- Modify: `dashboard/web/src/components/patrol/PatrolCaseList.tsx`

These 3 files all have identical `RUNNING_PHASES` arrays that need updating.

- [ ] **Step 1: Update PatrolPage.tsx**

In `dashboard/web/src/pages/PatrolPage.tsx` (line 28-30), replace:
```typescript
// Old:
const RUNNING_PHASES: PatrolPhase[] = [
  'starting', 'discovering', 'filtering', 'warming-up', 'processing', 'aggregating',
]

// New:
const RUNNING_PHASES: PatrolPhase[] = [
  'initializing', 'processing', 'finalizing',
]
```

- [ ] **Step 2: Update PatrolHeader.tsx**

In `dashboard/web/src/components/patrol/PatrolHeader.tsx` (line 29-31), same replacement:
```typescript
const RUNNING_PHASES: PatrolPhase[] = [
  'initializing', 'processing', 'finalizing',
]
```

- [ ] **Step 3: Update PatrolCaseList.tsx**

In `dashboard/web/src/components/patrol/PatrolCaseList.tsx` (line 13-15), same replacement:
```typescript
const RUNNING_PHASES: PatrolPhase[] = [
  'initializing', 'processing', 'finalizing',
]
```

- [ ] **Step 4: Commit**

```bash
git add dashboard/web/src/pages/PatrolPage.tsx dashboard/web/src/components/patrol/PatrolHeader.tsx dashboard/web/src/components/patrol/PatrolCaseList.tsx
git commit -m "refactor: update RUNNING_PHASES to 3-phase model in PatrolPage, PatrolHeader, PatrolCaseList"
```

---

### Task 3: Backend — Phase Mapping Layer in patrol-state-manager.ts

**Files:**
- Modify: `dashboard/src/services/patrol-state-manager.ts`
- Modify: `dashboard/src/types/index.ts`

The backend state manager receives old phase names from patrol-init.sh (via file-watcher reading patrol-phase) and from patrol-progress.json. We add a mapping layer so it broadcasts new phase names to the frontend.

- [ ] **Step 1: Update PatrolPhase type in patrol-state-manager.ts**

In `dashboard/src/services/patrol-state-manager.ts` (line 24-27), replace:
```typescript
// Old:
export type PatrolPhase =
  | 'idle' | 'starting' | 'discovering' | 'filtering'
  | 'warming-up' | 'processing' | 'aggregating'
  | 'completed' | 'failed'

// New:
export type PatrolPhase =
  | 'idle' | 'initializing' | 'processing' | 'finalizing'
  | 'completed' | 'failed'

/** Map legacy phase names from patrol-init.sh to new 3-phase model */
function mapLegacyPhase(raw: string): PatrolPhase {
  switch (raw) {
    case 'starting':
    case 'discovering':
    case 'filtering':
    case 'warming-up':
      return 'initializing'
    case 'processing':
      return 'processing'
    case 'aggregating':
      return 'finalizing'
    case 'initializing':
    case 'finalizing':
      return raw as PatrolPhase
    case 'completed':
    case 'failed':
    case 'idle':
      return raw as PatrolPhase
    default:
      return 'idle'
  }
}
```

- [ ] **Step 2: Update PIPELINE_PHASES constant**

Replace line 60-62:
```typescript
// Old:
const PIPELINE_PHASES: PatrolPhase[] = [
  'starting', 'discovering', 'filtering', 'warming-up', 'processing', 'aggregating',
]

// New:
const PIPELINE_PHASES: PatrolPhase[] = [
  'initializing', 'processing', 'finalizing',
]
```

- [ ] **Step 3: Apply mapLegacyPhase in the update() method**

In the `update()` method, at the top (after line 183), add phase mapping before any phase comparison:
```typescript
  update(partial: Partial<PatrolState>): void {
    const now = new Date().toISOString()

    // ── Map legacy phase names to new 3-phase model ──
    if (partial.phase) {
      partial = { ...partial, phase: mapLegacyPhase(partial.phase) }
    }

    // ... rest of method unchanged
```

- [ ] **Step 4: Update the 'starting' reset guard**

In `update()`, change the reset guard (around line 241):
```typescript
// Old:
if (newPhase === 'starting') {

// New:
if (newPhase === 'initializing') {
```

- [ ] **Step 5: Update hydrate() default phase**

In `hydrate()` (line 121):
```typescript
// Old:
this.state.phase = 'starting' // default if no phase file

// New:
this.state.phase = 'initializing' // default if no phase file
```

And the fallback check (line 137):
```typescript
// Old:
if (this.state.phase === 'starting') {

// New:
if (this.state.phase === 'initializing') {
```

- [ ] **Step 6: Update types/index.ts**

In `dashboard/src/types/index.ts` (line 393), update the phase type:
```typescript
// Old:
phase: 'discovering' | 'filtering' | 'warming-up' | 'processing' | 'aggregating' | 'completed' | 'failed'

// New:
phase: 'initializing' | 'processing' | 'finalizing' | 'completed' | 'failed'
```

- [ ] **Step 7: Update patrol-orchestrator.ts phase references**

In `dashboard/src/agent/patrol-orchestrator.ts` (line 163, 171), update:
```typescript
// Line 163 — phase file reset:
writeFileSync(phaseFile, 'initializing', 'utf-8')  // was 'starting'

// Line 171 — state manager update:
phase: 'initializing',  // was 'starting'
```

- [ ] **Step 8: Commit**

```bash
git add dashboard/src/services/patrol-state-manager.ts dashboard/src/types/index.ts dashboard/src/agent/patrol-orchestrator.ts
git commit -m "refactor(backend): add phase mapping layer, update to 3-phase model"
```

---

### Task 4: PatrolSidebar — Rewrite with 3 Parent Stages + Sub-steps

**Files:**
- Rewrite: `dashboard/web/src/components/patrol/PatrolSidebar.tsx`

Complete rewrite of PatrolSidebar from 6 flat stages to 3 parent stages (Initialize, Process, Finalize) with sub-steps. The Initialize sub-steps derive from existing store fields. Process sub-steps come from patrolAgentStore.

- [ ] **Step 1: Write the new PatrolSidebar.tsx**

Replace the entire file `dashboard/web/src/components/patrol/PatrolSidebar.tsx` with the new implementation. The component structure:

```typescript
/**
 * PatrolSidebar — 3 parent stages with sub-steps
 *
 * Stages: Initialize → Process → Finalize
 * Each has expandable sub-steps derived from patrol store fields.
 */
import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { usePatrolStore, type PatrolPhase } from '../../stores/patrolStore'
import { usePatrolAgentStore, type PatrolAgent } from '../../stores/patrolAgentStore'
import { Card } from '../common/Card'

// ─── Types ───

type StageStatus = 'pending' | 'active' | 'completed'

interface SubStep {
  id: string
  label: string
  status: StageStatus
  detail?: string
}

// ─── Helpers ───

function formatDuration(ms: number): string {
  if (ms < 1000) return '<1s'
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  if (m > 0) return `${m}m ${s % 60}s`
  return `${s}s`
}

function LiveTimer({ startedAt }: { startedAt: string }) {
  const [elapsed, setElapsed] = useState(() => Date.now() - new Date(startedAt).getTime())
  useEffect(() => {
    const start = new Date(startedAt).getTime()
    setElapsed(Date.now() - start)
    const timer = setInterval(() => setElapsed(Date.now() - start), 1000)
    return () => clearInterval(timer)
  }, [startedAt])
  return (
    <span className="font-mono text-[11px]" style={{ color: 'var(--accent-blue)' }}>
      {formatDuration(elapsed)}
    </span>
  )
}

function friendlyWarmupStatus(raw?: string): string {
  if (!raw) return 'Checking tokens…'
  const s = raw.toLowerCase()
  if (s.includes('alive') || s.includes('running') || s.includes('ready')) return 'Token daemon ready'
  if (s.includes('valid') || s.includes('fresh')) return 'All tokens valid'
  if (s.includes('expired') || s.includes('refresh')) return 'Refreshing tokens…'
  if (s.includes('offline') || s.includes('not running') || s.includes('failed')) return 'Daemon offline — using fallback'
  if (s.includes('warmup') || s.includes('warming up') || s.includes('starting')) return 'Warming up tokens…'
  return raw.length > 30 ? raw.slice(0, 30) + '…' : raw
}

// ─── Derive parent stage status ───

function deriveStageStatus(phase: PatrolPhase, stagePhase: PatrolPhase): StageStatus {
  const ORDER: PatrolPhase[] = ['initializing', 'processing', 'finalizing']
  const currentIdx = ORDER.indexOf(phase)
  const stageIdx = ORDER.indexOf(stagePhase)

  if (phase === 'completed') return 'completed'
  if (phase === 'failed') return stageIdx <= currentIdx ? 'completed' : 'pending'
  if (currentIdx < 0) return 'pending' // idle
  if (stageIdx < currentIdx) return 'completed'
  if (stageIdx === currentIdx) return 'active'
  return 'pending'
}

// ─── Derive Initialize sub-steps ───
// Uses existing store fields — the backend's old 6-phase data maps perfectly.
// "starting" → SDK Session, "discovering" → D365 Query, etc.
// Since backend still writes granular phases (starting, discovering, filtering, warming-up)
// even though the parent phase maps to "initializing", we can use currentAction and
// the presence of data fields to determine which sub-step is active/complete.

function deriveInitSubSteps(store: {
  phase: PatrolPhase
  currentAction?: string
  totalFound?: number
  changedCases: number
  skippedCount?: number
  warmupStatus?: string
  archivedCount?: number
  transferredCount?: number
}): SubStep[] {
  const parentDone = store.phase !== 'initializing' && store.phase !== 'idle'
  const isInit = store.phase === 'initializing'

  // Heuristic: determine which sub-step we're at based on available data
  // Data flows sequentially: SDK→Config→Mutex→D365→Filter→Warmup
  const hasSession = isInit || parentDone // session always starts first
  const hasD365 = store.totalFound !== undefined
  const hasFilter = store.changedCases > 0 || store.skippedCount !== undefined || store.archivedCount !== undefined
  const hasWarmup = store.warmupStatus !== undefined

  function subStatus(subDone: boolean, subActive: boolean): StageStatus {
    if (parentDone) return 'completed'
    if (subDone) return 'completed'
    if (subActive) return 'active'
    return 'pending'
  }

  // SDK Session — done once we have any other data or if currentAction indicates past it
  const sdkDone = hasD365 || hasFilter || hasWarmup || (isInit && store.currentAction && !store.currentAction.includes('SDK') && !store.currentAction.includes('Launch'))
  const sdkActive = isInit && !sdkDone

  // Config — we don't have explicit tracking for this, treat as done once SDK is done
  const configDone = sdkDone
  const configActive = false // too brief to show as active

  // Mutex — same as config, too brief
  const mutexDone = sdkDone
  const mutexActive = false

  // D365 Query
  const d365Done = hasFilter || hasWarmup || (hasD365 && !isInit) || (hasD365 && hasFilter)
  const d365Active = isInit && hasD365 && !hasFilter && !hasWarmup

  // Filter
  const filterDone = hasWarmup || (hasFilter && store.phase !== 'initializing') || (hasFilter && hasWarmup)
  const filterActive = isInit && hasFilter && !hasWarmup

  // Warmup
  const warmupDone = parentDone
  const warmupActive = isInit && hasWarmup && !parentDone

  const steps: SubStep[] = [
    {
      id: 'sdk-session',
      label: 'SDK Session',
      status: subStatus(!!sdkDone, sdkActive),
      detail: sdkActive ? 'Launching…' : sdkDone ? undefined : undefined,
    },
    {
      id: 'load-config',
      label: 'Load Config',
      status: subStatus(!!configDone, configActive),
      detail: configDone ? 'skill + script' : undefined,
    },
    {
      id: 'mutex-check',
      label: 'Mutex Check',
      status: subStatus(!!mutexDone, mutexActive),
      detail: mutexDone ? 'ok' : undefined,
    },
    {
      id: 'd365-query',
      label: 'D365 Query',
      status: subStatus(!!d365Done, d365Active),
      detail: store.totalFound !== undefined ? `${store.totalFound} found` : (d365Active ? 'Querying…' : undefined),
    },
    {
      id: 'filter-archive',
      label: 'Filter & Archive',
      status: subStatus(!!filterDone, filterActive),
      detail: hasFilter ? buildFilterDetail(store) : (filterActive ? 'Checking…' : undefined),
    },
    {
      id: 'token-warmup',
      label: 'Token Warmup',
      status: subStatus(!!warmupDone, warmupActive),
      detail: hasWarmup ? friendlyWarmupStatus(store.warmupStatus) : undefined,
    },
  ]
  return steps
}

function buildFilterDetail(store: {
  changedCases: number
  skippedCount?: number
  archivedCount?: number
  transferredCount?: number
}): string {
  const parts: string[] = [`${store.changedCases} proc`]
  if (store.skippedCount && store.skippedCount > 0) parts.push(`${store.skippedCount} skip`)
  if (store.archivedCount && store.archivedCount > 0) parts.push(`${store.archivedCount} arch`)
  if (store.transferredCount && store.transferredCount > 0) parts.push(`${store.transferredCount} xfer`)
  return parts.join(' · ')
}

// ─── Check Icon ───

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Parent Stage Component ───

function ParentStage({
  label,
  status,
  durationMs,
  liveStartedAt,
  rightLabel,
  children,
}: {
  label: string
  status: StageStatus
  durationMs?: number
  liveStartedAt?: string
  rightLabel?: string
  children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: 2 }}>
      {/* Parent header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0' }}>
        <div
          style={{
            width: 28, height: 28, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            ...(status === 'completed' ? { background: 'var(--accent-green)', color: 'white' } :
              status === 'active' ? { border: '2.5px solid var(--accent-blue)', background: 'var(--accent-blue-dim)' } :
              { border: '2px solid var(--border-default)', opacity: 0.4 }),
          }}
        >
          {status === 'completed' && <CheckIcon />}
          {status === 'active' && (
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-blue)', animation: 'sidebar-pulse 2s ease-in-out infinite' }} />
          )}
        </div>

        <div style={{
          fontSize: 14, fontWeight: 800, flex: 1,
          color: status === 'completed' ? 'var(--accent-green)' : status === 'active' ? 'var(--accent-blue)' : 'var(--text-tertiary)',
          opacity: status === 'pending' ? 0.4 : 1,
        }}>
          {label}
        </div>

        {/* Right: duration or counter */}
        {rightLabel ? (
          <span className="font-mono text-[11px]" style={{ color: status === 'active' ? 'var(--accent-blue)' : 'var(--text-tertiary)' }}>
            {rightLabel}
          </span>
        ) : liveStartedAt ? (
          <LiveTimer startedAt={liveStartedAt} />
        ) : durationMs !== undefined ? (
          <span className="font-mono text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
            {formatDuration(durationMs)}
          </span>
        ) : null}
      </div>

      {/* Sub-steps */}
      <div style={{
        marginLeft: 14,
        paddingLeft: 16,
        paddingBottom: 4,
        borderLeft: `2px solid ${
          status === 'completed' ? 'rgba(22,163,74,0.2)' :
          status === 'active' ? 'rgba(106,95,193,0.2)' :
          'var(--border-subtle)'
        }`,
        opacity: status === 'pending' ? 0.35 : 1,
      }}>
        {children}
      </div>
    </div>
  )
}

// ─── Sub-step row ───

function SubStepRow({ step }: { step: SubStep }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
      <div style={{
        width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
        ...(step.status === 'completed' ? { background: 'var(--accent-green)' } :
          step.status === 'active' ? { background: 'var(--accent-blue)', animation: 'sidebar-pulse 2s ease-in-out infinite' } :
          { background: 'var(--border-default)', opacity: 0.35 }),
      }} />
      <span style={{
        fontSize: 11, fontWeight: 600,
        color: step.status === 'completed' ? 'var(--accent-green)' :
          step.status === 'active' ? 'var(--accent-blue)' :
          'var(--text-tertiary)',
        opacity: step.status === 'pending' ? 0.45 : 1,
      }}>
        {step.label}
      </span>
      {step.detail && (
        <span style={{ fontSize: 10, color: 'var(--text-tertiary)', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
          {step.detail}
        </span>
      )}
    </div>
  )
}

// ─── Agent Row (Process sub-step) ───

function AgentRow({ agent }: { agent: PatrolAgent }) {
  const isRunning = agent.status === 'running'
  const isDone = agent.status === 'completed'

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '7px 10px', margin: '3px 0', borderRadius: 8,
      background: isRunning ? 'rgba(106,95,193,0.04)' : 'var(--bg-surface)',
      border: `1px solid ${isRunning ? 'rgba(106,95,193,0.22)' : 'var(--border-subtle)'}`,
      opacity: isDone ? 0.65 : 1,
    }}>
      <div style={{
        width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
        background: isDone ? 'var(--accent-green)' : isRunning ? 'var(--accent-blue)' : 'var(--border-default)',
        ...(isRunning ? { animation: 'sidebar-pulse 2s ease-in-out infinite' } : {}),
      }} />
      <span style={{
        fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
        fontSize: 11, fontWeight: 700,
        color: isDone ? 'var(--accent-green)' : isRunning ? 'var(--accent-blue)' : 'var(--text-tertiary)',
      }}>
        {agent.caseNumber || agent.taskId.slice(0, 8)}
      </span>
      {isRunning && agent.lastToolName && (
        <span style={{
          fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px',
          padding: '2px 8px', borderRadius: 6,
          background: 'var(--accent-blue-dim)', color: 'var(--accent-blue)',
        }}>
          ⟳ {agent.lastToolName}
        </span>
      )}
      {isDone && agent.summary && (
        <span style={{ fontSize: 10, color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', opacity: 0.6 }}>
          {agent.summary}
        </span>
      )}
      {agent.usage?.duration_ms !== undefined && (
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: 'var(--text-tertiary)', flexShrink: 0 }}>
          {formatDuration(agent.usage.duration_ms)}
        </span>
      )}
    </div>
  )
}

// ─── Main Component ───

export default function PatrolSidebar() {
  const phase = usePatrolStore(s => s.phase)
  const phaseTimings = usePatrolStore(s => s.phaseTimings)
  const phaseStartedAt = usePatrolStore(s => s.phaseStartedAt)
  const totalFound = usePatrolStore(s => s.totalFound)
  const changedCases = usePatrolStore(s => s.changedCases)
  const skippedCount = usePatrolStore(s => s.skippedCount)
  const warmupStatus = usePatrolStore(s => s.warmupStatus)
  const processedCases = usePatrolStore(s => s.processedCases)
  const totalCases = usePatrolStore(s => s.totalCases)
  const currentAction = usePatrolStore(s => s.currentAction)
  const archivedCount = usePatrolStore(s => s.archivedCount)
  const transferredCount = usePatrolStore(s => s.transferredCount)

  const agents = usePatrolAgentStore(s => s.agents)

  if (phase === 'idle') return null

  // Derive statuses
  const initStatus = deriveStageStatus(phase, 'initializing')
  const processStatus = deriveStageStatus(phase, 'processing')
  const finalizeStatus = deriveStageStatus(phase, 'finalizing')

  // Initialize sub-steps
  const initSubSteps = deriveInitSubSteps({
    phase, currentAction, totalFound, changedCases,
    skippedCount, warmupStatus, archivedCount, transferredCount,
  })

  // Initialize total duration: sum of old phase timings that map to "initializing"
  const initDuration = phaseTimings
    ? (phaseTimings['starting'] || 0) + (phaseTimings['discovering'] || 0) +
      (phaseTimings['filtering'] || 0) + (phaseTimings['warming-up'] || 0) +
      (phaseTimings['initializing'] || 0)
    : undefined

  // Process agents sorted by start time
  const sortedAgents = Object.values(agents).sort((a, b) =>
    new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
  )
  const queuedCaseList = usePatrolStore(s => s.caseList)
  const casesInAgents = new Set(sortedAgents.map(a => a.caseNumber).filter(Boolean))

  // Finalize sub-steps
  const finalizeSubSteps: SubStep[] = [
    { id: 'cleanup', label: 'Cleanup orphans', status: finalizeStatus === 'active' ? 'active' : finalizeStatus === 'completed' ? 'completed' : 'pending' },
    { id: 'aggregate', label: 'Aggregate results', status: finalizeStatus === 'completed' ? 'completed' : 'pending' },
    { id: 'write-state', label: 'Write state & unlock', status: finalizeStatus === 'completed' ? 'completed' : 'pending' },
  ]

  return (
    <Card padding="none">
      <div style={{ padding: '16px 18px 10px', lineHeight: '16px' }}>
        <span className="text-[11px] font-bold uppercase" style={{ letterSpacing: '0.8px', color: 'var(--text-tertiary)' }}>
          Pipeline
        </span>
      </div>

      <div style={{ padding: '0 18px 18px' }}>
        {/* Initialize */}
        <ParentStage
          label="Initialize"
          status={initStatus}
          durationMs={initStatus === 'completed' ? initDuration : undefined}
          liveStartedAt={initStatus === 'active' ? phaseStartedAt : undefined}
        >
          {initSubSteps.map(step => <SubStepRow key={step.id} step={step} />)}
        </ParentStage>

        {/* Process */}
        <ParentStage
          label="Process"
          status={processStatus}
          rightLabel={totalCases > 0 ? `${processedCases} / ${totalCases}` : undefined}
          liveStartedAt={processStatus === 'active' ? phaseStartedAt : undefined}
        >
          {sortedAgents.map(agent => <AgentRow key={agent.taskId} agent={agent} />)}
          {/* Queued cases not yet spawned */}
          {queuedCaseList
            .filter(cn => !casesInAgents.has(cn))
            .map(cn => (
              <div key={cn} style={{ padding: '4px 10px', opacity: 0.35, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', border: '1.5px solid var(--border-default)' }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: 'var(--text-tertiary)' }}>{cn}</span>
                <span style={{ fontSize: 9, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>queued</span>
              </div>
            ))}
        </ParentStage>

        {/* Finalize */}
        <ParentStage
          label="Finalize"
          status={finalizeStatus}
          durationMs={finalizeStatus === 'completed' ? (phaseTimings?.['aggregating'] || phaseTimings?.['finalizing'] || 0) : undefined}
          liveStartedAt={finalizeStatus === 'active' ? phaseStartedAt : undefined}
        >
          {finalizeSubSteps.map(step => <SubStepRow key={step.id} step={step} />)}
        </ParentStage>
      </div>

      <style>{`
        @keyframes sidebar-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.7); }
        }
      `}</style>
    </Card>
  )
}
```

- [ ] **Step 2: Verify the component renders**

Start the dashboard dev server and navigate to the Patrol page. The sidebar should show 3 parent stages with sub-steps. If no patrol is running, the sidebar should be hidden (phase === 'idle').

- [ ] **Step 3: Commit**

```bash
git add dashboard/web/src/components/patrol/PatrolSidebar.tsx
git commit -m "refactor(PatrolSidebar): rewrite with 3 parent stages + sub-steps"
```

---

### Task 5: RefreshDetail Component

**Files:**
- Create: `dashboard/web/src/components/patrol/RefreshDetail.tsx`

Subtask grid showing D365, Teams, ICM, OneNote, Attachments data deltas.

- [ ] **Step 1: Create RefreshDetail.tsx**

Create `dashboard/web/src/components/patrol/RefreshDetail.tsx`:

```typescript
/**
 * RefreshDetail — Subtask grid for Data Refresh step detail panel.
 * Shows D365, Teams, ICM, OneNote, Attachments with delta counts.
 */
import type { SubtaskState } from '../../stores/patrolStore'

const SUBTASK_ORDER = ['d365', 'teams', 'icm', 'onenote', 'attachments'] as const
const SUBTASK_LABELS: Record<string, string> = {
  d365: 'D365', teams: 'Teams', icm: 'ICM', onenote: 'OneNote', attachments: 'Attach',
}

function formatDelta(name: string, delta?: Record<string, number>): string | null {
  if (!delta) return null
  switch (name) {
    case 'd365': {
      const parts: string[] = []
      if (delta.newEmails) parts.push(`+${delta.newEmails} emails`)
      if (delta.newNotes) parts.push(`+${delta.newNotes} note`)
      return parts.join(' · ') || null
    }
    case 'teams': {
      const parts: string[] = []
      if (delta.newChats) parts.push(`${delta.newChats} chats`)
      if (delta.newMessages) parts.push(`${delta.newMessages} msgs`)
      return parts.join(' · ') || null
    }
    case 'icm': return delta.newEntries ? `+${delta.newEntries} disc` : null
    case 'onenote': {
      const pages = (delta.newPages || 0) + (delta.updatedPages || 0)
      return pages ? `${pages} pages` : null
    }
    case 'attachments': return delta.downloaded ? `+${delta.downloaded} file` : null
    default: return null
  }
}

interface RefreshDetailProps {
  subtasks?: Record<string, SubtaskState>
  durationMs?: number
}

export default function RefreshDetail({ subtasks, durationMs }: RefreshDetailProps) {
  return (
    <div style={{
      background: 'var(--bg-inset)', border: '1px solid var(--border-subtle)',
      borderRadius: 10, padding: '14px 16px',
      animation: 'detail-slide 0.2s ease-out',
    }}>
      <div style={{
        fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.6px', color: 'var(--text-tertiary)', marginBottom: 10,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-green)' }} />
        Data Refresh{durationMs !== undefined ? ` · ${formatDurationShort(durationMs)}` : ''}
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8,
      }}>
        {SUBTASK_ORDER.map(name => {
          const sub = subtasks?.[name]
          if (!sub) return null
          const isSkipped = sub.status === 'skipped'
          const deltaText = formatDelta(name, sub.delta)
          return (
            <div key={name} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 10px', borderRadius: 8,
              background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                background: isSkipped ? 'var(--text-tertiary)' : 'var(--accent-green)',
                opacity: isSkipped ? 0.4 : 1,
              }} />
              <span style={{
                fontSize: 11, fontWeight: 600,
                color: isSkipped ? 'var(--text-tertiary)' : 'var(--accent-green)',
                opacity: isSkipped ? 0.6 : 1,
              }}>
                {SUBTASK_LABELS[name]}
              </span>
              <span style={{ fontSize: 9, color: 'var(--text-tertiary)', marginLeft: 'auto', whiteSpace: 'nowrap', opacity: isSkipped ? 0.5 : 1 }}>
                {isSkipped ? 'skipped' : (deltaText || 'no new')}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function formatDurationShort(ms: number): string {
  if (ms < 1000) return '<1s'
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  if (m > 0) return `${m}m ${s % 60}s`
  return `${s}s`
}
```

- [ ] **Step 2: Commit**

```bash
git add dashboard/web/src/components/patrol/RefreshDetail.tsx
git commit -m "feat: add RefreshDetail component for data refresh subtask grid"
```

---

### Task 6: ActionFlowTimeline Component

**Files:**
- Create: `dashboard/web/src/components/patrol/ActionFlowTimeline.tsx`

Vertical timeline with rich action cards for the Act detail panel. Derives cards from CaseState steps (assess, act.actions[]).

- [ ] **Step 1: Create ActionFlowTimeline.tsx**

Create `dashboard/web/src/components/patrol/ActionFlowTimeline.tsx`:

```typescript
/**
 * ActionFlowTimeline — Vertical timeline with rich action cards.
 * Shows the assess → troubleshoot → reassess → challenger → email chain
 * with status, reasoning, findings, and context tags.
 */
import type { StepState, ActionState, StepStatus } from '../../stores/patrolStore'

// ─── Types ───

interface ActionCard {
  type: string
  label: string
  status: StepStatus
  durationMs?: number
  detail?: string     // reasoning / findings / evaluation text
  result?: string     // assess result (needs-action / no-change)
  subtype?: string    // email subtype
  tags?: string[]     // context tags
}

interface ActionFlowTimelineProps {
  steps: Record<string, StepState>
}

// ─── Derive action cards from steps ───

function deriveCards(steps: Record<string, StepState>): ActionCard[] {
  const cards: ActionCard[] = []
  const assess = steps?.assess
  if (!assess || assess.status === 'pending') return cards

  // Card 1: Assess
  cards.push({
    type: 'assess',
    label: 'Assess',
    status: assess.status,
    durationMs: assess.durationMs,
    detail: assess.reasoning,
    result: assess.result,
  })

  // Cards from act.actions[]
  const act = steps?.act
  const actions = act?.actions || []
  for (const action of actions) {
    const isReassess = action.type === 'reassess'
    const isEmail = action.type === 'email-drafter'
    cards.push({
      type: action.type,
      label: isReassess ? 'Reassess'
           : isEmail ? `Email${action.subtype ? ': ' + action.subtype : ''}`
           : action.type.charAt(0).toUpperCase() + action.type.slice(1).replace(/-/g, ' '),
      status: action.status || 'pending',
      durationMs: action.durationMs,
      detail: action.detail,
      result: action.result,
      subtype: action.subtype,
    })
  }

  return cards
}

// ─── Helpers ───

function formatDuration(ms: number): string {
  if (ms < 1000) return '<1s'
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  if (m > 0) return `${m}m ${s % 60}s`
  return `${s}s`
}

function statusColor(status: StepStatus): string {
  switch (status) {
    case 'completed': return 'var(--accent-green)'
    case 'active': return status === 'active' ? 'var(--accent-blue)' : 'var(--accent-blue)'
    case 'failed': return 'var(--accent-red)'
    default: return 'var(--border-default)'
  }
}

function isReassessType(type: string): boolean {
  return type === 'reassess'
}

function cardAccentColor(card: ActionCard): string {
  if (isReassessType(card.type) && card.status === 'active') return 'var(--accent-purple)'
  return statusColor(card.status)
}

function resultPillColor(result?: string): { bg: string; color: string } {
  if (result === 'needs-action') return { bg: 'var(--accent-amber-dim)', color: 'var(--accent-amber)' }
  if (result === 'no-change') return { bg: 'var(--accent-green-dim)', color: 'var(--accent-green)' }
  return { bg: 'var(--accent-blue-dim)', color: 'var(--accent-blue)' }
}

// ─── Main Component ───

export default function ActionFlowTimeline({ steps }: ActionFlowTimelineProps) {
  const cards = deriveCards(steps)

  if (cards.length === 0) return null

  const noAction = cards.length === 1 && cards[0].result === 'no-change'

  return (
    <div style={{
      background: 'var(--bg-inset)', border: '1px solid var(--border-subtle)',
      borderRadius: 10, padding: '14px 16px',
      animation: 'detail-slide 0.2s ease-out',
    }}>
      <div style={{
        fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.6px', color: 'var(--text-tertiary)', marginBottom: 12,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: cards.some(c => c.status === 'active') ? cardAccentColor(cards.find(c => c.status === 'active')!) : 'var(--accent-green)' }} />
        Action Flow
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {cards.map((card, idx) => {
          const isLast = idx === cards.length - 1
          const accent = cardAccentColor(card)
          const isPending = card.status === 'pending'
          const isActive = card.status === 'active'
          const isDone = card.status === 'completed'

          return (
            <div key={`${card.type}-${idx}`} style={{ display: 'flex', alignItems: 'stretch' }}>
              {/* Timeline: dot + line */}
              <div style={{ width: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, paddingTop: 14 }}>
                <div style={{
                  width: 10, height: 10, borderRadius: '50%', flexShrink: 0, zIndex: 1,
                  background: isPending ? 'var(--border-default)' : accent,
                  opacity: isPending ? 0.35 : 1,
                  ...(isActive ? { animation: 'sidebar-pulse 2s ease-in-out infinite' } : {}),
                }} />
                {!isLast && (
                  <div style={{
                    width: 2, flex: 1, borderRadius: 1, marginTop: 4,
                    background: isDone ? 'rgba(22,163,74,0.2)' : isActive ? 'rgba(106,95,193,0.15)' : 'var(--border-subtle)',
                    opacity: isPending ? 0.5 : 1,
                  }} />
                )}
              </div>

              {/* Card body */}
              <div style={{ flex: 1, padding: '8px 0 8px 10px' }}>
                <div style={{
                  padding: '10px 14px', borderRadius: 8,
                  background: isActive ? 'rgba(106,95,193,0.03)' : isPending ? 'transparent' : 'var(--bg-surface)',
                  border: `1px solid ${isPending ? 'var(--border-subtle)' : isActive ? 'rgba(106,95,193,0.25)' : 'var(--border-subtle)'}`,
                  borderStyle: isPending ? 'dashed' : 'solid',
                  opacity: isPending ? 0.45 : 1,
                }}>
                  {/* Header row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: isPending ? 'var(--text-tertiary)' : accent }}>
                      {card.label}
                    </span>
                    {card.result && (
                      <span style={{
                        fontSize: 8, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                        ...resultPillColor(card.result),
                      }}>
                        {card.result}
                      </span>
                    )}
                    {isActive && (
                      <span style={{
                        fontSize: 8, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                        background: isReassessType(card.type) ? 'var(--accent-purple-dim)' : 'var(--accent-blue-dim)',
                        color: isReassessType(card.type) ? 'var(--accent-purple)' : 'var(--accent-blue)',
                      }}>
                        ⟳ {card.detail?.split(' ')[0] || 'running'}
                      </span>
                    )}
                    {card.durationMs !== undefined && (
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: 'var(--text-tertiary)', marginLeft: 'auto' }}>
                        {formatDuration(card.durationMs)}
                      </span>
                    )}
                  </div>

                  {/* Detail text (only for non-pending) */}
                  {!isPending && card.detail && (
                    <div style={{
                      marginTop: 5, fontSize: 11, lineHeight: 1.55,
                      color: isActive ? accent : 'var(--text-secondary)',
                      opacity: isActive ? 0.7 : 1,
                    }}>
                      {card.detail}
                    </div>
                  )}

                  {/* Tags */}
                  {card.tags && card.tags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                      {card.tags.map((tag, i) => (
                        <span key={i} style={{
                          fontSize: 9, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                          background: 'var(--bg-inset)', color: 'var(--text-tertiary)',
                        }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {noAction && (
        <div style={{ marginTop: 8, fontSize: 10, color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
          No actions needed — proceeding to summary
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add dashboard/web/src/components/patrol/ActionFlowTimeline.tsx
git commit -m "feat: add ActionFlowTimeline component for rich action cards"
```

---

### Task 7: SummaryDetail Component

**Files:**
- Create: `dashboard/web/src/components/patrol/SummaryDetail.tsx`

Todo list display for the Summary step detail panel.

- [ ] **Step 1: Create SummaryDetail.tsx**

Create `dashboard/web/src/components/patrol/SummaryDetail.tsx`:

```typescript
/**
 * SummaryDetail — Todo list generated by the summarize step.
 * Reads from case-summary.md or steps.summarize data.
 */
import type { StepState } from '../../stores/patrolStore'

interface SummaryDetailProps {
  summarizeStep?: StepState
  durationMs?: number
}

export default function SummaryDetail({ summarizeStep, durationMs }: SummaryDetailProps) {
  if (!summarizeStep || summarizeStep.status === 'pending') return null

  const isActive = summarizeStep.status === 'active'

  return (
    <div style={{
      background: 'var(--bg-inset)', border: '1px solid var(--border-subtle)',
      borderRadius: 10, padding: '14px 16px',
      animation: 'detail-slide 0.2s ease-out',
    }}>
      <div style={{
        fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.6px', color: 'var(--text-tertiary)', marginBottom: 10,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: isActive ? 'var(--accent-blue)' : 'var(--accent-green)' }} />
        Summary{durationMs !== undefined ? ` · ${formatDuration(durationMs)}` : ''}
      </div>

      {isActive ? (
        <div style={{ fontSize: 11, color: 'var(--accent-blue)', opacity: 0.7 }}>
          Generating todo…
        </div>
      ) : (
        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
          {summarizeStep.result || 'Todo updated'}
        </div>
      )}
    </div>
  )
}

function formatDuration(ms: number): string {
  if (ms < 1000) return '<1s'
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  if (m > 0) return `${m}m ${s % 60}s`
  return `${s}s`
}
```

- [ ] **Step 2: Commit**

```bash
git add dashboard/web/src/components/patrol/SummaryDetail.tsx
git commit -m "feat: add SummaryDetail component for todo list display"
```

---

### Task 8: PatrolCaseRow — Rewrite with 3-Step Pipeline + Detail Panels

**Files:**
- Rewrite: `dashboard/web/src/components/patrol/PatrolCaseRow.tsx`

Complete rewrite: replaces the 3-zone horizontal layout with a 3-step pipeline header (Refresh → Act → Summary), clickable with detail panels. Active cases auto-expand Act. This is the largest task.

- [ ] **Step 1: Write the new PatrolCaseRow.tsx**

Replace the entire file `dashboard/web/src/components/patrol/PatrolCaseRow.tsx`. The component has 3 sections:
1. **Header** — case number, status pill, flow pills (collapsed), duration
2. **Pipeline stepper** — 3 horizontal steps with connectors (full width)
3. **Detail panel** — RefreshDetail, ActionFlowTimeline, or SummaryDetail

```typescript
/**
 * PatrolCaseRow — 3-step pipeline + expandable detail panels (v6)
 *
 * Layout:
 *   ┌─ Header: case# | pill | flow pills (collapsed) | duration ─┐
 *   │  Pipeline: [Refresh] ─── [Act] ─── [Summary]                │
 *   │  Detail panel (slide-down, switches per selected step)       │
 *   └─────────────────────────────────────────────────────────────┘
 */
import { useState, useEffect, useMemo } from 'react'
import { ChevronRight, Loader2 } from 'lucide-react'
import type { CaseState, StepStatus, ActionState } from '../../stores/patrolStore'
import RefreshDetail from './RefreshDetail'
import ActionFlowTimeline from './ActionFlowTimeline'
import SummaryDetail from './SummaryDetail'

// ─── Types ───

type SelectedStep = 'refresh' | 'act' | 'summary' | null

interface PatrolCaseRowProps {
  caseState: CaseState
  defaultExpanded: boolean
}

// ─── Helpers ───

function formatDuration(ms: number): string {
  if (ms < 1000) return '<1s'
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  if (m > 0) return `${m}m ${s % 60}s`
  return `${s}s`
}

function isCaseComplete(c: CaseState): boolean {
  const sum = c.steps?.summarize
  const act = c.steps?.act
  return sum?.status === 'completed' || sum?.status === 'skipped' || (act?.status === 'completed' && sum?.status !== 'active')
}

function isCaseActive(c: CaseState): boolean {
  return Object.values(c.steps).some(s => s.status === 'active')
}

function hasFailed(c: CaseState): boolean {
  return Object.values(c.steps).some(s => s.status === 'failed')
}

function getCaseDuration(c: CaseState): number | undefined {
  if (isCaseActive(c)) {
    for (const step of Object.values(c.steps)) {
      if (step.status === 'active' && step.startedAt) {
        const ms = new Date(step.startedAt).getTime()
        if (!isNaN(ms)) return Date.now() - ms
      }
    }
    const startStep = c.steps?.start
    if (startStep?.startedAt) {
      const ms = new Date(startStep.startedAt).getTime()
      if (!isNaN(ms)) return Date.now() - ms
    }
    return undefined
  }
  const startStep = c.steps?.start
  if (!startStep?.startedAt) return undefined
  const startMs = new Date(startStep.startedAt).getTime()
  if (isNaN(startMs)) return undefined
  let latestMs = startMs
  for (const step of Object.values(c.steps)) {
    if (step.completedAt) {
      const t = new Date(step.completedAt).getTime()
      if (!isNaN(t) && t > latestMs) latestMs = t
    }
  }
  if (c.updatedAt) {
    const t = new Date(c.updatedAt).getTime()
    if (!isNaN(t) && t > latestMs) latestMs = t
  }
  return latestMs > startMs ? latestMs - startMs : undefined
}

// ─── Derive 3-step pipeline statuses ───

interface PipelineStepInfo {
  id: string
  label: string
  status: StepStatus
  durationMs?: number
  connectorType: 'none' | 'green' | 'gradient-blue' | 'gradient-purple' | 'empty'
}

function derivePipelineSteps(steps: Record<string, any>): PipelineStepInfo[] {
  const refresh = steps?.['data-refresh']
  const start = steps?.start
  const assess = steps?.assess
  const act = steps?.act
  const summarize = steps?.summarize

  // Refresh: done when data-refresh completed
  const refreshStatus: StepStatus = refresh?.status === 'completed' ? 'completed'
    : refresh?.status === 'active' ? 'active'
    : start?.status === 'active' ? 'active' // start is part of refresh phase
    : 'pending'
  const refreshDur = (start?.durationMs || 0) + (refresh?.durationMs || 0) || undefined

  // Act: active if assess or act is active, done if both done
  const actActions = act?.actions || []
  const hasReassessActive = actActions.some((a: ActionState) => a.type === 'reassess' && a.status === 'active')
  const actStatus: StepStatus = (assess?.status === 'completed' && act?.status === 'completed') ? 'completed'
    : (assess?.status === 'active' || act?.status === 'active') ? 'active'
    : assess?.status === 'completed' && act?.status !== 'active' && act?.status !== 'completed' ? 'active' // between assess done and act actions
    : 'pending'
  const actDur = (assess?.durationMs || 0) + (act?.durationMs || 0) || undefined

  // Summary
  const sumStatus: StepStatus = summarize?.status || 'pending'
  const sumDur = summarize?.durationMs

  // Connector types
  const refreshConn: PipelineStepInfo['connectorType'] = 'none' // first step, no left connector

  let actConn: PipelineStepInfo['connectorType'] = 'empty'
  if (refreshStatus === 'completed' && actStatus === 'completed') actConn = 'green'
  else if (refreshStatus === 'completed' && actStatus === 'active') actConn = hasReassessActive ? 'gradient-purple' : 'gradient-blue'

  let sumConn: PipelineStepInfo['connectorType'] = 'empty'
  if (actStatus === 'completed' && sumStatus === 'completed') sumConn = 'green'
  else if (actStatus === 'completed' && sumStatus === 'active') sumConn = 'gradient-blue'

  return [
    { id: 'refresh', label: 'Refresh', status: refreshStatus, durationMs: refreshDur, connectorType: refreshConn },
    { id: 'act', label: 'Act', status: actStatus, durationMs: actDur, connectorType: actConn },
    { id: 'summary', label: 'Summary', status: sumStatus, durationMs: sumDur, connectorType: sumConn },
  ]
}

// ─── Collapsed flow pills ───

function deriveFlowPills(steps: Record<string, any>): Array<{ label: string; color: 'default' | 'green' | 'purple' }> {
  const assess = steps?.assess
  const act = steps?.act
  const actions = act?.actions || []

  if (!assess || assess.status === 'pending') return []

  if (actions.length === 0) {
    return [
      { label: 'assess', color: 'default' },
      { label: assess.result || 'no-change', color: 'green' },
    ]
  }

  const pills: Array<{ label: string; color: 'default' | 'green' | 'purple' }> = [
    { label: 'assess', color: 'default' },
  ]
  for (const a of actions) {
    pills.push({
      label: a.type === 'email-drafter' ? 'email' : a.type === 'troubleshooter' ? 'troubleshoot' : a.type,
      color: a.type === 'reassess' ? 'purple' : 'default',
    })
  }
  return pills
}

// ─── Check Icon ───

function CheckIcon({ size = 9 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Pipeline Step Node ───

function PipelineStep({
  step,
  isSelected,
  onClick,
}: {
  step: PipelineStepInfo
  isSelected: boolean
  onClick: () => void
}) {
  const { status, label, durationMs, connectorType } = step
  const isActive = status === 'active'
  const isDone = status === 'completed'
  const isPending = status === 'pending' || status === 'skipped'

  const iconColor = isDone ? 'var(--accent-green)' : isActive ? 'var(--accent-blue)' : 'var(--text-tertiary)'

  // Ring color for selected state (only when not naturally active)
  const ringStyle: React.CSSProperties = isSelected && !isActive ? {
    boxShadow: `0 0 0 3px ${isDone ? 'rgba(22,163,74,0.25)' : 'rgba(106,95,193,0.25)'}`,
  } : {}

  // Connector CSS class
  const connectorBg = connectorType === 'green' ? 'var(--accent-green)'
    : connectorType === 'gradient-blue' ? 'linear-gradient(90deg, var(--accent-green), var(--accent-blue))'
    : connectorType === 'gradient-purple' ? 'linear-gradient(90deg, var(--accent-green), var(--accent-purple))'
    : 'var(--border-subtle)'
  const connectorOpacity = connectorType === 'empty' ? 1 : 0.45

  return (
    <div
      style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        position: 'relative', cursor: 'pointer', padding: '4px 4px 8px',
      }}
      onClick={onClick}
    >
      {/* Connector (drawn on this element, connects from prev step) */}
      {connectorType !== 'none' && (
        <div style={{
          position: 'absolute', top: 20, height: 2, borderRadius: 1,
          right: 'calc(50% + 20px)', left: 'calc(-50% + 20px)',
          background: connectorBg, opacity: connectorOpacity,
        }} />
      )}

      {/* Icon */}
      <div
        style={{
          width: 32, height: 32, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, flexShrink: 0,
          position: 'relative', zIndex: 1,
          transition: 'transform 0.15s ease, box-shadow 0.2s ease',
          ...(isDone ? { background: 'var(--accent-green)', color: 'white' } :
            isActive ? { border: '2.5px solid var(--accent-blue)', background: 'var(--accent-blue-dim)' } :
            { border: '2px solid var(--border-default)', color: 'var(--text-tertiary)', opacity: 0.4 }),
          ...ringStyle,
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
      >
        {isDone && <CheckIcon size={12} />}
        {isActive && (
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-blue)', animation: 'patrol-pulse 2s ease-in-out infinite' }} />
        )}
        {isPending && <span style={{ fontSize: 11 }}>📄</span>}
      </div>

      {/* Label */}
      <span style={{
        fontSize: 11, fontWeight: 700, marginTop: 5, textAlign: 'center',
        color: iconColor, opacity: isPending ? 0.4 : 1,
      }}>
        {label}
      </span>

      {/* Duration */}
      {isDone && durationMs !== undefined && (
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: 'var(--text-tertiary)', marginTop: 2 }}>
          {formatDuration(durationMs)}
        </span>
      )}
    </div>
  )
}

// ─── Main Component ───

export default function PatrolCaseRow({ caseState, defaultExpanded }: PatrolCaseRowProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [selectedStep, setSelectedStep] = useState<SelectedStep>(null)
  const isComplete = isCaseComplete(caseState)
  const isActive = isCaseActive(caseState)
  const failed = hasFailed(caseState)

  // Live duration tick
  const [, setTick] = useState(0)
  useEffect(() => {
    if (!isActive) return
    const timer = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(timer)
  }, [isActive])

  const duration = getCaseDuration(caseState)
  const pipelineSteps = useMemo(() => derivePipelineSteps(caseState.steps), [caseState.steps])
  const flowPills = useMemo(() => deriveFlowPills(caseState.steps), [caseState.steps])

  // Auto-collapse on complete
  useEffect(() => {
    if (isComplete && !isActive) { setExpanded(false); setSelectedStep(null) }
  }, [isComplete, isActive])

  // Active case: auto-select Act
  useEffect(() => {
    if (isActive) {
      setSelectedStep('act')
    }
  }, [isActive])

  // Determine current active pill label
  const actActions = caseState.steps?.act?.actions || []
  const activeAction = actActions.find((a: ActionState) => a.status === 'active')
  const pillLabel = activeAction?.type === 'reassess' ? 'Reassess'
    : activeAction?.type === 'email-drafter' ? 'Email'
    : activeAction?.type === 'troubleshooter' ? 'Troubleshoot'
    : activeAction?.type === 'challenger' ? 'Challenger'
    : caseState.steps?.assess?.status === 'active' ? 'Assess'
    : caseState.steps?.summarize?.status === 'active' ? 'Summary'
    : caseState.steps?.['data-refresh']?.status === 'active' ? 'Refresh'
    : caseState.currentStep || 'Processing'
  const isPurplePill = activeAction?.type === 'reassess'

  const showBody = isActive || expanded
  const canCollapse = !isActive

  function handleStepClick(stepId: string) {
    const step = stepId as SelectedStep
    setSelectedStep(prev => prev === step ? null : step)
  }

  return (
    <div
      className="rounded-xl transition-all duration-200"
      style={{
        background: 'var(--bg-surface)',
        border: isActive ? '1px solid rgba(106,95,193,0.22)' : '1px solid var(--border-subtle)',
        boxShadow: isActive ? '0 2px 12px rgba(106,95,193,0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
        overflow: 'hidden',
      }}
    >
      {/* ─── Header ─── */}
      <div
        className="flex items-center gap-2.5"
        style={{
          padding: '10px 18px', background: 'var(--bg-inset)',
          cursor: canCollapse ? 'pointer' : undefined, userSelect: 'none',
        }}
        onClick={() => canCollapse && setExpanded(e => !e)}
      >
        {canCollapse && (
          <ChevronRight size={14} style={{
            color: 'var(--text-tertiary)', flexShrink: 0,
            transition: 'transform 150ms ease',
            transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
          }} />
        )}
        <span className="text-[13px] font-bold shrink-0" style={{
          fontFamily: "'JetBrains Mono', monospace",
          color: isActive ? 'var(--accent-blue)' : 'rgba(106,95,193,0.55)',
        }}>
          {caseState.caseNumber}
        </span>

        {/* Status pill */}
        {isActive && (
          <span className="inline-flex items-center gap-1 text-[9.5px] font-bold uppercase rounded-lg px-2.5 py-0.5 shrink-0" style={{
            background: isPurplePill ? 'var(--accent-purple-dim)' : 'var(--accent-blue-dim)',
            color: isPurplePill ? 'var(--accent-purple)' : 'var(--accent-blue)',
            letterSpacing: '0.3px',
          }}>
            <Loader2 size={10} className="animate-spin" />
            {pillLabel}
          </span>
        )}
        {isComplete && !failed && (
          <span className="inline-flex items-center gap-1 text-[9.5px] font-bold uppercase rounded-lg px-2.5 py-0.5 shrink-0" style={{
            background: 'var(--accent-green-dim)', color: 'var(--accent-green)', letterSpacing: '0.3px',
          }}>
            <CheckIcon size={8} /> Done
          </span>
        )}
        {failed && (
          <span className="inline-flex items-center gap-1 text-[9.5px] font-bold uppercase rounded-lg px-2.5 py-0.5 shrink-0" style={{
            background: 'rgba(239,68,68,0.10)', color: 'var(--accent-red)', letterSpacing: '0.3px',
          }}>
            Failed
          </span>
        )}

        {/* Collapsed flow pills */}
        {canCollapse && !expanded && flowPills.length > 0 && (
          <div className="flex items-center gap-0.5 min-w-0 overflow-hidden">
            {flowPills.map((fp, i) => (
              <span key={i} className="flex items-center gap-0.5">
                {i > 0 && <span style={{ color: 'var(--text-tertiary)', fontSize: 9, padding: '0 1px' }}>→</span>}
                <span style={{
                  padding: '2px 7px', borderRadius: 4, fontSize: 10, fontWeight: 600,
                  background: fp.color === 'purple' ? 'var(--accent-purple-dim)' : fp.color === 'green' ? 'var(--accent-green-dim)' : 'var(--bg-inset)',
                  color: fp.color === 'purple' ? 'var(--accent-purple)' : fp.color === 'green' ? 'var(--accent-green)' : 'var(--text-tertiary)',
                }}>
                  {fp.label}
                </span>
              </span>
            ))}
          </div>
        )}

        <div className="flex-1" />
        {duration !== undefined && (
          <span className="shrink-0" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-tertiary)' }}>
            {formatDuration(duration)}
          </span>
        )}
      </div>

      {/* ─── Body ─── */}
      <div style={{
        maxHeight: showBody ? 800 : 0, opacity: showBody ? 1 : 0,
        overflow: 'hidden', transition: 'max-height 300ms ease, opacity 200ms ease',
      }}>
        {/* Pipeline stepper (full width) */}
        <div style={{ display: 'flex', alignItems: 'flex-start', padding: '16px 24px 6px' }}>
          {pipelineSteps.map(step => (
            <PipelineStep
              key={step.id}
              step={step}
              isSelected={selectedStep === step.id}
              onClick={() => handleStepClick(step.id)}
            />
          ))}
        </div>

        {/* Detail panel */}
        {selectedStep && (
          <div style={{ padding: '0 20px 16px' }}>
            {selectedStep === 'refresh' && (
              <RefreshDetail
                subtasks={caseState.steps?.['data-refresh']?.subtasks}
                durationMs={caseState.steps?.['data-refresh']?.durationMs}
              />
            )}
            {selectedStep === 'act' && (
              <ActionFlowTimeline steps={caseState.steps} />
            )}
            {selectedStep === 'summary' && (
              <SummaryDetail
                summarizeStep={caseState.steps?.summarize}
                durationMs={caseState.steps?.summarize?.durationMs}
              />
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes patrol-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(106,95,193,0.25); }
          50% { box-shadow: 0 0 0 5px rgba(106,95,193,0); }
        }
        @keyframes detail-slide {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
```

- [ ] **Step 2: Verify the component renders with test data**

Start the dashboard and trigger a patrol run (or review a previous completed run). The case rows should show the new 3-step pipeline with clickable detail panels.

- [ ] **Step 3: Commit**

```bash
git add dashboard/web/src/components/patrol/PatrolCaseRow.tsx
git commit -m "refactor(PatrolCaseRow): rewrite with 3-step pipeline + clickable detail panels"
```

---

### Task 9: Update CaseworkPipeline (used outside patrol)

**Files:**
- Modify: `dashboard/web/src/components/pipeline/CaseworkPipeline.tsx`

The CaseworkPipeline component is also used in CaseAIPanel (non-patrol context). Update DEFAULT_CASEWORK_STEPS to 3 steps and update STEP_ICONS.

- [ ] **Step 1: Update DEFAULT_CASEWORK_STEPS**

In `dashboard/web/src/components/pipeline/CaseworkPipeline.tsx` (line 61-66), replace:

```typescript
// Old:
export const DEFAULT_CASEWORK_STEPS: PipelineStep[] = [
  { id: 'data-refresh', label: 'Data Refresh', status: 'pending' },
  { id: 'assess', label: 'Assess', status: 'pending' },
  { id: 'act', label: 'Act', status: 'pending' },
  { id: 'summarize', label: 'Summarize', status: 'pending' },
]

// New:
export const DEFAULT_CASEWORK_STEPS: PipelineStep[] = [
  { id: 'data-refresh', label: 'Refresh', status: 'pending' },
  { id: 'act', label: 'Act', status: 'pending' },
  { id: 'summarize', label: 'Summary', status: 'pending' },
]
```

- [ ] **Step 2: Update STEP_ICONS if needed**

The existing STEP_ICONS map should still work (keyed by step id). If 'data-refresh' → RefreshCw, 'act' → GitBranch, 'summarize' → FileText — these are all still valid. Remove the 'assess' entry:

```typescript
const STEP_ICONS: Record<string, LucideIcon> = {
  'data-refresh': RefreshCw,
  act: GitBranch,
  summarize: FileText,
}
```

Remove the `assess: Scale` import and entry. Also remove the `Scale` import from lucide-react if no longer used.

- [ ] **Step 3: Check CaseAIPanel usage**

Read `dashboard/web/src/components/CaseAIPanel.tsx` to see how it uses CaseworkPipeline. Verify the step ids it passes match the new 3-step model. If it still passes 4 steps (with 'assess'), update it to 3.

- [ ] **Step 4: Commit**

```bash
git add dashboard/web/src/components/pipeline/CaseworkPipeline.tsx dashboard/web/src/components/CaseAIPanel.tsx
git commit -m "refactor(CaseworkPipeline): update to 3-step model (Refresh/Act/Summary)"
```

---

### Task 10: Integration Test — Full Patrol Flow Verification

**Files:**
- No code changes — manual verification

- [ ] **Step 1: Start the dashboard**

```bash
cd dashboard && npm run dev
```

Ensure both frontend (port 5173) and backend (port 3010) start without errors.

- [ ] **Step 2: Verify idle state**

Navigate to the Patrol page. With no patrol running:
- Sidebar should be hidden
- Start Patrol button visible

- [ ] **Step 3: Start a patrol and verify pipeline progression**

Click Start Patrol. Verify:
- Sidebar appears with 3 stages (Initialize, Process, Finalize)
- Initialize sub-steps light up as the init script progresses (SDK Session → Config → D365 → Filter → Warmup)
- Process stage shows agent rows appearing as subagents spawn
- Case rows show 3-step pipeline (Refresh → Act → Summary)

- [ ] **Step 4: Verify case row interactions**

While patrol runs:
- Click a Refresh icon on a completed-refresh case → subtask grid appears
- Click Act icon → action flow timeline appears
- Click same icon again → panel closes (toggle behavior)
- Active cases auto-expand Act with no ring

- [ ] **Step 5: Verify completed state**

After patrol completes:
- Done cases collapse to header with flow pills
- Click to expand → pipeline visible, click steps to review details
- Sidebar shows all 3 stages as completed with durations

- [ ] **Step 6: Verify theme support**

Toggle between light and dark mode. All colors should use CSS variables correctly.

- [ ] **Step 7: Commit any fixes found during testing**

```bash
git add -A
git commit -m "fix: integration test fixes for patrol page refactor"
```
