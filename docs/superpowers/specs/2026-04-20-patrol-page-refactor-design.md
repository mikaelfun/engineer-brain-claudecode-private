# Patrol Page Refactor — Pipeline + Case Row Redesign

**Date:** 2026-04-20
**Status:** Approved
**Mockups:** `.superpowers/brainstorm/704345-1776696646/content/`

## Overview

Refactor the Patrol page's two core visual components:

1. **Left Sidebar Pipeline** — from 6 flat stages to 3 parent stages with sub-steps
2. **Right Case Row** — from 3-zone horizontal layout to 3-step pipeline header + expandable detail panels with rich action cards

## 1. Patrol Pipeline Sidebar (Left)

### Current → New Stage Mapping

| Current (6 flat) | New (3 parent + sub-steps) |
|---|---|
| Start | **Initialize** → SDK Session |
| — | **Initialize** → Load Config (skill + script) |
| — | **Initialize** → Mutex Check |
| Discover | **Initialize** → D365 Query |
| Filter | **Initialize** → Filter & Archive |
| Warmup | **Initialize** → Token Warmup |
| Process | **Process** → per-agent sub-steps |
| Aggregate | **Finalize** → Cleanup / Aggregate / Write state / Unlock |

### Initialize Stage

Parent header: icon (28px circle) + "Initialize" label + total duration.

Sub-steps displayed as a vertical list indented under the parent, connected by a left border line:

- **SDK Session** — duration
- **Load Config** — "skill + script"
- **Mutex Check** — "ok" / error
- **D365 Query** — "N found"
- **Filter & Archive** — "N proc · N skip · N arch"
- **Token Warmup** — "all valid" / status

Sub-steps are always visible (no auto-collapse when completed). Each sub-step shows:
- 7px dot (green=done, blue-pulse=active, gray=pending)
- Label
- Right-aligned detail/duration text

### Process Stage

Parent header: icon + "Process" + "N / M" counter.

Sub-steps are **per-agent rows** — one row per spawned casework subagent, in spawn order:

- **Completed agent row**: green dot + case number + flow summary (e.g. "assess → email") + duration. Opacity 0.65.
- **Running agent row**: blue-pulse dot + case number + status pill (e.g. "⟳ Assess") + current action text + live timer. Highlighted border.
- **Queued agent**: gray dot + case number + "queued" label. Opacity 0.35.
- **SSE messages**: small monospace box between agent rows showing spawn/slot messages from the main agent.

### Finalize Stage

Parent header: icon + "Finalize" label.

Sub-steps:
- **Cleanup orphans**
- **Aggregate results**
- **Write state & unlock**

### Visual Design

- Parent icons: 28px circles (green filled = done, blue border+dim bg = active, gray border = pending)
- Sub-step connector: 2px left border line (green-tinted when done, blue-tinted when active, gray when pending)
- Sub-step dots: 7px circles
- All CSS variables from dashboard's `.light` / `.dark` theme

### Data Flow

- SSE events remain the same: `patrol-state` (global phase) and `patrol-case` (per-case)
- `patrolStore.ts` `PatrolPhase` type updated: `'idle' | 'initializing' | 'processing' | 'finalizing' | 'completed' | 'failed'`
- Phase-to-substep mapping derived in the sidebar component from existing store fields (totalFound, changedCases, skippedCount, warmupStatus, archivedCount, etc.)
- Agent sub-steps consumed from `patrolAgentStore.ts`

## 2. Case Row (Right)

### Pipeline: 4 Steps → 3 Steps

| Current | New |
|---|---|
| Data Refresh | **Refresh** |
| Assess | (merged into Act) |
| Act | **Act** (starts with Assess as first action node) |
| Summarize | **Summary** |

**Rationale:** Assess is the first action in the Act chain. Having it as both a separate pipeline step AND the first action node is redundant. 3 steps also gives more visual breathing room.

### Pipeline Stepper (Full-Width)

Horizontal 3-step stepper spanning the full card width:

- Each step: 32px circle icon + label + duration
- Connectors between steps using CSS `::before` pseudo-elements
- Connector classes on the RIGHT element: `cg` (green), `ch` (gradient green→blue), `chp` (gradient green→purple), `ce` (empty/gray)
- Steps are clickable — clicking shows the detail panel below
- **No hover background on step area** — only icon `scale(1.08)` on hover
- **Selected state**: icon-only ring via `box-shadow: 0 0 0 3px` (no area highlight)
- Active case: Act step auto-expanded, no ring needed (active icon already visually distinct)

### Detail Panel

A single panel area below the pipeline stepper. Content changes based on which step is selected:

#### Refresh Detail
- Grid of subtask cards (D365, Teams, ICM, OneNote, Attachments)
- Each card: dot + name + delta text ("+3 emails · +1 note")
- Skipped subtasks shown with gray dot + "skipped" label

#### Act Detail — Rich Action Cards
Vertical timeline with cards. Each action in the chain is a card with a left-side timeline connector:

- **Timeline**: 10px dots + 2px connecting lines, colored per status
- **Card content**:
  - **Assess card**: name + result pill (needs-action / no-change) + reasoning text + context tags
  - **Troubleshoot card**: name + duration + findings summary + tool tags (Kusto queries, msft-learn docs)
  - **Reassess card**: name + status pill + evaluation detail
  - **Challenger card**: name + evidence chain result
  - **Email Drafter card**: name + duration + draft file path tag
  - **Pending cards**: dashed border + opacity 0.45 + name only
- Simple case (no-change): single Assess card + italic "No actions needed" text

#### Summary Detail
- Todo list generated by the summarize step
- Each item: check icon + title + description
- Icon variants: ✓ (done), ! (warning/pending), ○ (open)

### Case Row States

| State | Header | Pipeline | Detail |
|---|---|---|---|
| Active (default) | case# + status pill + duration | 3 steps, Act highlighted | Act auto-expanded |
| Active (user clicks Refresh) | same | Refresh icon ringed | Refresh subtasks |
| Active (user clicks Summary) | same | Summary icon ringed | — (pending, nothing to show) |
| Completed (collapsed) | chevron + case# + Done pill + flow pills + duration | hidden | hidden |
| Completed (expanded, Act selected) | case# + Done pill + duration | 3 steps all green, Act ringed | Act cards (review mode) |
| Completed (expanded, Summary selected) | same | Summary ringed | Todo list |

### Collapsed Flow Pills

When a completed case is collapsed (header only), show the action chain as mini pills:
- `assess → no-change` (simple)
- `assess → troubleshoot → reassess → email` (complex)
- Reassess pills get purple dim background

## 3. Store Changes

### `patrolStore.ts`

- `PatrolPhase` type: replace `'starting' | 'discovering' | 'filtering' | 'warming-up' | 'processing' | 'aggregating'` with `'initializing' | 'processing' | 'finalizing'`
- Add sub-phase tracking fields for Initialize sub-steps (can reuse existing fields: `currentAction`, `totalFound`, `changedCases`, `skippedCount`, `warmupStatus`, `archivedCount`, `transferredCount`)
- CaseworkPipeline steps reduced from 4 to 3 in `DEFAULT_CASEWORK_STEPS`

### `patrolAgentStore.ts`

No changes needed — already tracks per-agent state with the right granularity.

### SSE Backend

- `patrol-state` event: `phase` field values updated to match new 3-phase model
- Backward compatibility: frontend maps old phase names to new ones during transition

## 4. Component Architecture

### Files to Modify

| File | Change |
|---|---|
| `PatrolSidebar.tsx` | Rewrite: 3 parent stages with sub-steps |
| `PatrolCaseRow.tsx` | Rewrite: 3-step pipeline + detail panels + action cards |
| `CaseworkPipeline.tsx` | Update: 3 steps (Refresh, Act, Summary) |
| `patrolStore.ts` | Update: PatrolPhase type, deriveStages logic |
| `PatrolPage.tsx` | Minor: update RUNNING_PHASES array |
| `PatrolHeader.tsx` | Minor: update phase display names |
| `PatrolCaseList.tsx` | No change |

### New Components

| Component | Purpose |
|---|---|
| `ActionFlowTimeline.tsx` | Vertical timeline with rich action cards |
| `RefreshDetail.tsx` | Subtask grid for data refresh |
| `SummaryDetail.tsx` | Todo list display |

### Backend Changes

| File | Change |
|---|---|
| `patrol-state-manager.ts` | Update phase names emitted via SSE |
| `patrol-orchestrator.ts` | Update phase transitions |

## 5. Theme Support

All colors use CSS variables from `index.css` — both `.light` and `.dark` themes are supported automatically. No hardcoded colors.

Key variables used:
- Status: `--accent-green`, `--accent-blue`, `--accent-purple`, `--accent-amber`, `--accent-red`
- Dim backgrounds: `--accent-*-dim`
- Surfaces: `--bg-base`, `--bg-surface`, `--bg-inset`
- Borders: `--border-subtle`, `--border-default`
- Text: `--text-primary`, `--text-secondary`, `--text-tertiary`

## 6. Interaction Behavior

- **Pipeline step click**: toggles detail panel. Clicking the already-selected step closes the panel. Clicking a different step switches content.
- **Active case default**: Act step auto-expanded on mount (no user click needed).
- **Completed case expand**: clicking the header row expands to show the pipeline. No step is pre-selected — user clicks to view details.
- **Animation**: detail panel slides down with `translateY(-6px) → 0` + opacity fade, 200ms ease-out.
- **No hover background** on pipeline steps — only icon scale(1.08) on hover.

## 7. Out of Scope

- Backend casework logic changes (assess/act/summarize orchestration unchanged)
- Case sorting/filtering logic in PatrolCaseList
- Dashboard header/nav changes
- Mobile responsive layout
