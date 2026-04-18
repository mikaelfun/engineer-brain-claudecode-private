# Patrol UI & Progress Tracking Full-Stack Refactor

## Overview

Full-stack refactoring of patrol status tracking and display. Delete all existing patrol UI code, rebuild from scratch with a unified data model, simplified SSE protocol, and a new independent Patrol page with Pipeline Flow visualization.

## Decisions

| Dimension | Decision |
|-----------|----------|
| UI style | Style A — Pipeline Flow (Vercel-inspired) |
| Per-case layout | Hybrid: compact nested-dot rows + active case auto-expands to inline chips |
| Page placement | Independent `/patrol` route; AgentMonitor keeps only a link |
| Refactor scope | Full-stack: frontend + backend + SSE protocol + data files |

## 1. Data Layer: `.casework/` Directory Restructure

### Current problems

1. **Two write systems that don't know about each other**: `write-pipeline-state.sh` writes main step progress to `pipeline-state.json`; `event-wrapper.sh`/`write-event.sh` write substep progress to `events/*.json`; `update-pipeline-state.py` also writes `pipeline-state.json` but ignores `events/`.
2. **Progress and business data mixed**: `events/d365.json` contains both `status`/`durationMs` (progress) and `delta.newEmails:21` (business data).
3. **No act substep tracking**: troubleshooter/email-drafter/challenger progress has no standardized file.
4. **Inconsistent naming**: `.aggregate-status` (hidden), `data-refresh-output.json` (explicit), `events/` (subdirectory).

### New structure

```
.casework/
├── state.json              ← Single source of truth for progress (WebUI consumes)
├── output/                 ← Business artifacts (consumed by casework steps)
│   ├── data-refresh.json   ← was: data-refresh-output.json
│   ├── delta-content.md    ← unchanged
│   ├── execution-plan.json ← unchanged
│   └── claims.json         ← troubleshooter output
└── logs/                   ← Debug/audit (WebUI log viewer, post-hoc debugging)
    ├── casework.log        ← agent output concatenation
    ├── d365.log
    ├── teams.log
    ├── teams-build-input.log
    ├── teams-write.log
    ├── onenote.log
    ├── icm.log
    ├── attachments.log
    ├── digest-teams.log
    ├── digest-onenote.log
    └── aggregate.log       ← was: .aggregate-status + .aggregate-stderr
```

**Deleted**:
- `events/` directory (all 8 files) — merged into `state.json`
- `pipeline-state.json` — merged into `state.json`
- `.aggregate-status`, `.aggregate-stderr` — merged into `logs/aggregate.log`

### `state.json` schema

```json
{
  "caseNumber": "2601290030000748",
  "updatedAt": "2026-04-18T13:58:23Z",
  "currentStep": "act",
  "steps": {
    "data-refresh": {
      "status": "completed",
      "startedAt": "2026-04-18T13:55:59Z",
      "completedAt": "2026-04-18T13:58:08Z",
      "durationMs": 128701,
      "subtasks": {
        "d365":        { "status": "completed", "durationMs": 50598 },
        "teams":       { "status": "completed", "durationMs": 21965 },
        "onenote":     { "status": "completed", "durationMs": 1822 },
        "icm":         { "status": "completed", "durationMs": 67198 },
        "attachments": { "status": "completed", "durationMs": 3044 }
      }
    },
    "assess": {
      "status": "completed",
      "startedAt": "2026-04-18T13:58:23Z",
      "completedAt": "2026-04-18T13:58:28Z",
      "durationMs": 5200,
      "result": "pending-engineer"
    },
    "act": {
      "status": "active",
      "startedAt": "2026-04-18T13:58:30Z",
      "actions": [
        { "type": "troubleshooter", "status": "active", "durationMs": 45000 },
        { "type": "email-drafter", "status": "pending" }
      ]
    },
    "summarize": {
      "status": "pending"
    }
  }
}
```

Status values: `pending` | `active` | `completed` | `failed` | `skipped`

### New unified writer: `update-state.py`

Replaces three scripts: `write-pipeline-state.sh`, `write-event.sh`/`event-wrapper.sh`, `update-pipeline-state.py`.

```
# Main step transition
python3 .claude/skills/casework/scripts/update-state.py \
  --case-dir <dir> --step data-refresh --status active

# Substep update (data-refresh subtasks)
python3 .claude/skills/casework/scripts/update-state.py \
  --case-dir <dir> --step data-refresh --subtask d365 --status completed --duration-ms 50598

# Act action update
python3 .claude/skills/casework/scripts/update-state.py \
  --case-dir <dir> --step act --action troubleshooter --status active

# Assess result annotation
python3 .claude/skills/casework/scripts/update-state.py \
  --case-dir <dir> --step assess --status completed --result pending-engineer
```

Atomic write: tmp file + `os.replace()`.

### Scripts affected

| Script | Change |
|--------|--------|
| `data-refresh.sh` | Replace `WRITE_EVENT` calls with `update-state.py --subtask` calls; move delta data to `output/data-refresh.json` instead of embedding in event |
| `event-wrapper.sh` | Rewrite to call `update-state.py` instead of `write-event.sh` |
| `write-event.sh` | Delete |
| `write-pipeline-state.sh` | Delete |
| `update-pipeline-state.py` | Delete (merged into `update-state.py`) |
| `casework/SKILL.md` | Replace all `write-pipeline-state.sh` and `write-event.sh` calls with `update-state.py` |
| `casework/act/SKILL.md` | Replace `update-pipeline-state.py` calls with `update-state.py` |
| `casework/summarize/SKILL.md` | Replace `update-pipeline-state.py` calls with `update-state.py` |
| `teams-search-inline.sh` | Replace `WRITE_EVENT` calls with `update-state.py` |

## 2. Patrol-Level Progress File

### Current: `patrol-phase` (plain text)

```
processing|3/5
```

### New: `patrol-progress.json`

```json
{
  "phase": "processing",
  "startedAt": "2026-04-18T13:50:00Z",
  "source": "webui",
  "totalCases": 5,
  "changedCases": 5,
  "processedCases": 3,
  "currentCase": "2601290030000748",
  "caseList": ["...3042", "...8891", "...5520", "...7741", "...9102"],
  "archived": ["...1100"],
  "updatedAt": "2026-04-18T14:02:00Z"
}
```

Phase values: `discovering` | `filtering` | `warming-up` | `processing` | `aggregating` | `completed` | `failed`

**Writer**: patrol SKILL.md updates via `update-state.py --patrol` or direct python write (same atomic pattern).

**`patrol-phase` file**: Keep for backward compat with CLI patrol-progress.py renderer. New dashboard reads `patrol-progress.json` only.

## 3. SSE Protocol Simplification

### Current: 6 patrol-related event types

- `patrol-updated` — patrol-state.json changed
- `patrol-progress` — phase/count changed
- `patrol-case-completed` — single case finished
- `patrol-pipeline-update` — per-case pipeline-state.json changed
- `case-subtask-progress` — per-case events/*.json changed
- `sessions-changed` — generic

### New: 2 event types

| Event | Trigger | Payload |
|-------|---------|---------|
| `patrol-state` | `patrol-progress.json` changed | Full patrol-progress.json content |
| `patrol-case` | Any case's `.casework/state.json` changed | Full state.json content for that case |

The `patrol-case` event carries the complete per-case state in one payload. The frontend never needs to merge multiple events.

### Backend file-watcher changes

**Watch**:
- `{patrolDir}/patrol-progress.json` → emit `patrol-state`
- `{patrolDir}/patrol.lock` → emit `patrol-state` (phase: starting/idle)
- `{casesRoot}/active/*/.casework/state.json` → emit `patrol-case`

**Stop watching**:
- `events/*.json` — deleted
- `pipeline-state.json` — merged into `state.json`
- `casework-meta.json` for patrol completion detection — `state.json` carries completion status directly

## 4. Backend: patrol-orchestrator.ts Refactor

### Delete: dual-track progress polling

Remove `scanPatrolProgress()` and its `setInterval(8s)` — the file-watcher → SSE path is the single source.

### Simplify: lock management

Keep `patrol.lock` as-is. Remove redundant stale detection that checks abortController state (the lock age check is sufficient).

### Simplify: routes

| Route | Change |
|-------|--------|
| `POST /patrol` | Keep — starts SDK patrol |
| `POST /patrol/cancel` | Keep — aborts SDK patrol |
| `GET /patrol/status` | Simplify — read `patrol-progress.json` + `patrol.lock`, no more directory scanning |
| `GET /agents/patrol-state` | Delete — replaced by `/patrol/status` |

## 5. Frontend: New Independent Patrol Page

### Route: `/patrol`

### Components

```
PatrolPage.tsx              ← Route page
├── PatrolHeader.tsx         ← Start/Cancel button + elapsed timer + stats bar
├── PatrolGlobalPipeline.tsx ← 5-stage horizontal pipeline
│   (Discover → Filter → Warmup → Process → Aggregate)
└── PatrolCaseList.tsx       ← Case rows
    └── PatrolCaseRow.tsx    ← Single case (compact or expanded)
        ├── CompactRow       ← Nested dots + badge + duration
        └── ExpandedDetail   ← Inline chips per step
            ├── DataRefreshChips ← 5 parallel chips (d365/teams/onenote/icm/attachments)
            ├── AssessResult     ← Status badge (pending-engineer, etc.)
            ├── ActChips         ← Serial chips (troubleshooter → email → challenger)
            └── SummarizeStatus  ← Simple status
```

### Visual Design

- **Style**: Pipeline Flow (Vercel-inspired) with light/dark mode support
- **Global pipeline**: 5 circle nodes with connector lines, color-coded by status
- **Case list — default**: Compact nested-dot rows. Large dots = main steps, small dot clusters = subtasks. Duration + status badge right-aligned.
- **Case list — active case**: Auto-expands to show inline chips for each step. Data-refresh chips side-by-side (parallel, labeled `PARALLEL`). Act chips connected with `→` arrows (serial, labeled `SERIAL`). Skipped actions shown at 40% opacity.
- **Case list — completed case**: Compact row, green status.
- **Case list — queued case**: Compact row, gray status.

### PatrolStore (Zustand) — rewrite

```typescript
interface PatrolStore {
  // Global patrol state
  phase: PatrolPhase
  totalCases: number
  changedCases: number
  processedCases: number
  startedAt?: string
  completedAt?: string
  error?: string
  caseList: string[]

  // Per-case state (keyed by caseNumber)
  cases: Record<string, CaseState>

  // 2 event handlers (was 12)
  onPatrolState: (data: PatrolProgressJson) => void
  onCaseUpdate: (data: CaseStateJson) => void

  // User actions
  start: () => void
  reset: () => void
}

interface CaseState {
  status: 'queued' | 'processing' | 'completed' | 'failed'
  currentStep?: string
  durationMs?: number
  error?: string
  steps: {
    'data-refresh'?: StepState
    assess?: StepState
    act?: StepState
    summarize?: StepState
  }
}

interface StepState {
  status: 'pending' | 'active' | 'completed' | 'failed' | 'skipped'
  startedAt?: string
  completedAt?: string
  durationMs?: number
  result?: string                           // assess result
  subtasks?: Record<string, SubtaskState>   // data-refresh subtasks
  actions?: ActionState[]                   // act actions
}
```

### useSSE changes

Remove all patrol-specific event listeners (6) and replace with 2:

```typescript
es.addEventListener('patrol-state', handler)
es.addEventListener('patrol-case', handler)
```

### AgentMonitor cleanup

Remove from `AgentMonitor.tsx`:
- All `usePatrolStore` selectors (~15 lines)
- All patrol UI rendering (~300 lines JSX)
- Patrol polling `useEffect` (~30 lines)
- `usePatrolState` / `useCancelPatrol` hooks usage

Add: A link card to `/patrol` page.

### API hooks cleanup

Remove from `hooks.ts`:
- `usePatrolState()` — replaced by PatrolStore hydrating from `/patrol/status`

Keep:
- `useStartPatrol()` — used by PatrolHeader
- `useCancelPatrol()` — used by PatrolHeader

## 6. Files Deleted (complete list)

### Frontend
- `dashboard/web/src/stores/patrolStore.ts` — rewritten from scratch
- `dashboard/web/src/components/pipeline/CaseworkPipeline.tsx` — replaced by PatrolGlobalPipeline + PatrolCaseRow

### Backend
- `dashboard/src/services/meta-reader.ts` → `readPatrolState()` function removed
- `dashboard/src/routes/agents.ts` → `/patrol-state` route removed

### Skills/Scripts
- `.claude/skills/casework/scripts/write-event.sh` — deleted
- `.claude/skills/casework/scripts/write-pipeline-state.sh` — deleted
- `.claude/skills/casework/act/scripts/update-pipeline-state.py` — deleted

### Per-case data (on next run)
- `.casework/events/` directory — no longer created
- `.casework/pipeline-state.json` — no longer created
- `.casework/.aggregate-status` — replaced by `logs/aggregate.log`
- `.casework/.aggregate-stderr` — replaced by `logs/aggregate.log`

## 7. Migration & Compatibility

- **patrol SKILL.md**: Update phase file writes to also write `patrol-progress.json`. Keep writing `patrol-phase` for CLI backward compat.
- **casework SKILL.md**: Replace all `write-pipeline-state.sh` and `write-event.sh` calls. Test both `mode=full` and `mode=patrol`.
- **Existing `.casework/` data**: Old files (events/, pipeline-state.json) ignored by new code. Next casework run creates new structure. No migration script needed.
- **`data-refresh.sh` reset logic**: Change `rm -rf "$EVT_DIR"` to just reset `state.json`. Keep `rm -f` for output files but use new paths.

## 8. Implementation Order

1. **`update-state.py`** — new unified writer with tests
2. **`data-refresh.sh`** — migrate to `update-state.py`, output to `output/data-refresh.json`
3. **`event-wrapper.sh`** — rewrite to use `update-state.py`
4. **`casework/SKILL.md`** + `act/SKILL.md` + `summarize/SKILL.md` — update all write calls
5. **Backend file-watcher** — watch `state.json` instead of `events/` + `pipeline-state.json`
6. **Backend SSE** — consolidate to 2 event types
7. **Backend patrol-orchestrator** — remove `scanPatrolProgress()`, simplify routes
8. **Frontend PatrolStore** — rewrite
9. **Frontend PatrolPage** — new page with all components
10. **Frontend AgentMonitor** — remove patrol code, add link
11. **Delete old scripts** — `write-event.sh`, `write-pipeline-state.sh`, `update-pipeline-state.py`
12. **patrol SKILL.md** — add `patrol-progress.json` writes alongside `patrol-phase`
