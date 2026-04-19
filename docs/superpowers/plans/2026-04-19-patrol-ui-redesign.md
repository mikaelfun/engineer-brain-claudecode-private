# Patrol UI Redesign — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the patrol page with a left sidebar vertical pipeline + right case list layout, 5-step case pipeline with rich detail, and collapsible done rows.

**Architecture:** Replace the current top-down layout (PatrolHeader → PatrolGlobalPipeline → PatrolCaseList) with a sidebar+content layout. The PatrolPage becomes a flex container. Left sidebar contains a sticky vertical pipeline card. Right side contains the header bar + case list. PatrolCaseRow is rewritten with 5 horizontal steps. Store gets new fields (`currentAction`, `totalFound`, `skippedCount`, `warmupStatus`).

**Tech Stack:** React + TypeScript, Tailwind CSS, Zustand (patrolStore), lucide-react icons, CSS variables from dashboard design system.

**Spec:** `docs/superpowers/specs/2026-04-19-patrol-ui-redesign.md`
**Mockup:** `.superpowers/brainstorm/543180-1776581717/content/patrol-v7-sidebar.html`

---

### File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `dashboard/web/src/stores/patrolStore.ts` | Modify | Add `currentAction`, `totalFound`, `skippedCount`, `warmupStatus` fields |
| `dashboard/web/src/pages/PatrolPage.tsx` | Rewrite | Sidebar + content flex layout, header bar integrated |
| `dashboard/web/src/components/patrol/PatrolSidebar.tsx` | Create | Vertical pipeline card (6 stages with detail text) |
| `dashboard/web/src/components/patrol/PatrolCaseRow.tsx` | Rewrite | 5-step horizontal pipeline with rich detail per step |
| `dashboard/web/src/components/patrol/PatrolCaseList.tsx` | Modify | Adapt to new layout (remove old progress bar header, use right-side section) |
| `dashboard/web/src/components/patrol/PatrolHeader.tsx` | Modify | Slim down: remove global pipeline elements (now in sidebar) |
| `dashboard/web/src/components/patrol/PatrolGlobalPipeline.tsx` | Delete | Replaced by PatrolSidebar |
| `dashboard/src/services/patrol-state-manager.ts` | Modify | Add `currentAction`, `totalFound`, `skippedCount`, `warmupStatus` to PatrolState |

---

### Task 1: Extend store and StateManager with new fields

**Files:**
- Modify: `dashboard/src/services/patrol-state-manager.ts`
- Modify: `dashboard/web/src/stores/patrolStore.ts`

- [ ] **Step 1: Add fields to backend PatrolState interface**

In `dashboard/src/services/patrol-state-manager.ts`, add to the `PatrolState` interface after the `detail` field:

```typescript
  // Process stage enrichment
  currentAction?: string                   // patrol session's serial decision text
  totalFound?: number                      // total cases found in discover (before filter)
  skippedCount?: number                    // cases skipped by filter
  warmupStatus?: string                    // token daemon status text
```

- [ ] **Step 2: Add fields to frontend store**

In `dashboard/web/src/stores/patrolStore.ts`, add to the `PatrolStore` interface after `phaseTimings`:

```typescript
  // Pipeline detail fields (from patrol-progress.json via SSE)
  currentAction?: string
  totalFound?: number
  skippedCount?: number
  warmupStatus?: string
```

Add to initial state:

```typescript
  currentAction: undefined,
  totalFound: undefined,
  skippedCount: undefined,
  warmupStatus: undefined,
```

Add to `onPatrolState` handler (after the `phaseTimings` line):

```typescript
    if (data.currentAction !== undefined) update.currentAction = data.currentAction as string
    if (data.totalFound !== undefined) update.totalFound = data.totalFound as number
    if (data.skippedCount !== undefined) update.skippedCount = data.skippedCount as number
    if (data.warmupStatus !== undefined) update.warmupStatus = data.warmupStatus as string
```

Add to `reset()`:

```typescript
    currentAction: undefined,
    totalFound: undefined,
    skippedCount: undefined,
    warmupStatus: undefined,
```

Add to `start()` (clear stale values):

```typescript
    currentAction: undefined,
    totalFound: undefined,
    skippedCount: undefined,
    warmupStatus: undefined,
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd dashboard && npx tsc --noEmit && cd web && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add dashboard/src/services/patrol-state-manager.ts dashboard/web/src/stores/patrolStore.ts
git commit -m "feat(patrol): add currentAction, totalFound, skippedCount, warmupStatus to store"
```

---

### Task 2: Create PatrolSidebar component

**Files:**
- Create: `dashboard/web/src/components/patrol/PatrolSidebar.tsx`

- [ ] **Step 1: Create the PatrolSidebar component**

Create `dashboard/web/src/components/patrol/PatrolSidebar.tsx`. This is a vertical timeline inside a sticky card showing 6 pipeline stages with status icons, labels, durations, and detail text.

Read the existing `PatrolGlobalPipeline.tsx` for the `LiveTimer` component pattern and `deriveNodes` logic — adapt for vertical layout.

The component should:
- Subscribe to `usePatrolStore` for: `phase`, `phaseTimings`, `phaseStartedAt`, `totalCases`, `processedCases`, `totalFound`, `skippedCount`, `warmupStatus`, `currentAction`, `startedAt`, `sessionId`
- Define 6 stages: `starting`, `discovering`, `filtering`, `warming-up`, `processing`, `aggregating`
- Each stage renders: status icon (checkmark/pulse dot/empty circle) + name + duration + 1-2 lines detail
- Stage detail text (use store data when available, fallback to generic text):
  - **Start**: `"SDK session launched"` + truncated sessionId
  - **Discover**: `"D365 query → {totalFound} active cases"` (fallback: `"Querying D365..."`)
  - **Filter**: `"{changedCases} changed · {skippedCount} skipped"` (fallback: `"Checking changes..."`)
  - **Warmup**: `warmupStatus` or `"Token daemon running"`
  - **Process**: `"{processedCases} / {totalCases} cases"` + progress bar + `currentAction` text with spinner
  - **Aggregate**: `"Aggregating todos..."` when active, result text when complete
- Connecting lines between stages: green for completed, gradient for active→pending, gray for pending
- Stage item padding: `28px 0` (per approved mockup spacing)
- Active stage icon has pulse animation
- Wrap in a `Card` component or manual card div with design system styling

Use the mockup CSS classes as reference: `.vs-item`, `.vs-icon`, `.vs-content`, `.vs-head`, `.vs-name`, `.vs-time`, `.vs-detail`, `.vs-bar`, `.vs-fill`. Translate these to Tailwind + inline styles using CSS variables.

The `LiveTimer` component from `PatrolGlobalPipeline.tsx` should be extracted into a shared util or duplicated here (it's small — `useState` + `useEffect` with `setInterval`).

```typescript
// Key structure:
const SIDEBAR_PHASES = ['starting', 'discovering', 'filtering', 'warming-up', 'processing', 'aggregating'] as const

interface SidebarStage {
  phase: PatrolPhase
  label: string
  status: 'completed' | 'active' | 'pending'
  durationMs?: number
  isLive?: boolean
  liveStartedAt?: string
  detail: React.ReactNode  // 1-2 lines of detail content
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd dashboard/web && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add dashboard/web/src/components/patrol/PatrolSidebar.tsx
git commit -m "feat(patrol): create PatrolSidebar vertical pipeline component"
```

---

### Task 3: Rewrite PatrolCaseRow with 5-step pipeline

**Files:**
- Rewrite: `dashboard/web/src/components/patrol/PatrolCaseRow.tsx`

- [ ] **Step 1: Rewrite PatrolCaseRow**

Replace the entire file. The new component has:

**Props:** `{ caseState: CaseState; defaultExpanded: boolean }` (replaces `isExpanded`)

**Structure:**
1. **Header bar** (always visible): case number + status pill + summary tags (for collapsed done) + step count + duration + chevron (for done cases)
2. **Pipeline body** (expandable): 5 horizontal steps with connectors

**5 steps:** `start`, `data-refresh`, `assess`, `act`, `summarize`
- `start` column uses `flex: 0.6` (narrower — less detail needed)
- Other columns use `flex: 1`

**Step rendering per type:**

- **Start**: When completed: `"SDK session ready"` + duration. When active: `"Launching SDK session…"` with spinner.

- **Refresh (data-refresh)**: Show 5 subtask rows. Each row: status dot + name (`D365`/`Teams`/`ICM`/`OneNote`/`Attach`) + delta text (from `subtask.delta` if available, else empty) + duration. Delta formatting:
  - D365: `+{emails} emails · +{notes} note` (omit zero parts)
  - Teams: `{chats} chats · {messages} msgs`
  - ICM: `+{discussions} discussions`
  - OneNote: `{pagesUpdated} pages updated`
  - Attachments: `+{files} file` + optional `({sizeKB} KB)`
  - Fallback when no delta: just show duration or "no new"

- **Assess**: Result pill with icon (`needs-action` = amber, `no-change` = gray) + reasoning text below (from `step.reasoning`). If no reasoning, just show result.

- **Act**: Dynamic agent cards from `step.actions` array. Each card has 3 states:
  - `status === 'active' && detail === 'Launching SDK session…'` → purple bg + spinner + "Launching SDK session…"
  - `status === 'active'` → purple bg + pulse dot + `detail` text
  - `status === 'completed'` → green border + `result` text
  - Cards render in order, no preset cards for agents not yet triggered

- **Summary (summarize)**: When completed: `"Todo updated"` + `step.result` text. When active: spinner.

**Collapse/expand for done cases:**
- `defaultExpanded` controls initial state
- Done cases start collapsed: header shows chevron + case ID + done pill + assess result tag + act summary + duration
- Click chevron toggles pipeline body visibility
- Active/starting cases always show pipeline body (no chevron)

**Connectors** between steps: 20px wide divs with 2px colored lines (green=done, gradient=active, gray=pending)

**Helper functions** (reuse from existing or define inline):
- `formatDuration(ms)` — from existing code, add `<1s` for sub-second
- `isCaseComplete(state)` — same logic as current
- `isCaseActive(state)` — same logic as current
- `getCaseDuration(state)` — same logic as current
- `formatDelta(subtaskName, delta)` — new, formats delta object to display string

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd dashboard/web && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add dashboard/web/src/components/patrol/PatrolCaseRow.tsx
git commit -m "feat(patrol): rewrite PatrolCaseRow with 5-step pipeline and collapsible done rows"
```

---

### Task 4: Update PatrolCaseList for new layout

**Files:**
- Modify: `dashboard/web/src/components/patrol/PatrolCaseList.tsx`

- [ ] **Step 1: Simplify PatrolCaseList**

Remove the phase status messages (those are now in the sidebar). Remove the progress bar header (moved to sidebar Process stage). Keep the case sorting logic and queued case display.

The component now renders:
1. Section header: `"Cases"` + `"{processedCases} / {totalCases} processed"` + thin progress bar
2. Sorted case rows using new `PatrolCaseRow` with `defaultExpanded` prop:
   - Active cases: `defaultExpanded={true}`
   - Not-yet-complete cases: `defaultExpanded={true}`
   - Complete cases: `defaultExpanded={false}` (collapsed by default)
3. Queued cases: single-line rows with 30% opacity

Remove the `PHASE_STATUS` map and the pre-processing phase spinner display (sidebar handles this now).

Remove `Card` wrapper — PatrolPage layout handles the visual container.

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd dashboard/web && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add dashboard/web/src/components/patrol/PatrolCaseList.tsx
git commit -m "feat(patrol): simplify PatrolCaseList for sidebar layout"
```

---

### Task 5: Rewrite PatrolPage with sidebar layout + integrate header

**Files:**
- Rewrite: `dashboard/web/src/pages/PatrolPage.tsx`
- Modify: `dashboard/web/src/components/patrol/PatrolHeader.tsx`
- Delete: `dashboard/web/src/components/patrol/PatrolGlobalPipeline.tsx`

- [ ] **Step 1: Slim down PatrolHeader**

Remove the stat chips from PatrolHeader — those move to the header bar in PatrolPage. PatrolHeader now only renders: title `"Patrol"` + phase badge + timer + action buttons (Start/Cancel/Reset). Keep the ref-based timer logic exactly as-is.

The header becomes a simpler inline flex row that PatrolPage places at the top.

- [ ] **Step 2: Rewrite PatrolPage layout**

Replace the current vertical stack with:

```tsx
export default function PatrolPage() {
  // ... existing hydration useEffect (keep exactly as-is) ...

  return (
    <div className="flex gap-6 items-start">
      {/* Left: Sidebar pipeline (sticky) */}
      <div className="w-[260px] flex-shrink-0 sticky top-7">
        <PatrolSidebar />
      </div>

      {/* Right: Header + Cases */}
      <div className="flex-1 min-w-0 space-y-5">
        {/* Header row: title + badge + timer + stats + button */}
        <PatrolHeader />

        {/* Stats row (only when not idle) */}
        {phase !== 'idle' && <StatRow />}

        {/* Case list */}
        <PatrolCaseList />
      </div>
    </div>
  )
}
```

The `StatRow` is a simple flex row with stat chips (Total/Done/Active/Queue) — extracted from the old PatrolHeader.

When `phase === 'idle'`, the sidebar is hidden (or shows empty state) and the right side shows just the Start button centered.

- [ ] **Step 3: Delete PatrolGlobalPipeline**

Remove `dashboard/web/src/components/patrol/PatrolGlobalPipeline.tsx` — its functionality is now in PatrolSidebar.

- [ ] **Step 4: Verify TypeScript compiles**

Run: `cd dashboard/web && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Verify Vite dev server builds**

Run: `cd dashboard/web && npx vite build 2>&1 | tail -5`
Expected: Build succeeds with no errors

- [ ] **Step 6: Commit**

```bash
git add dashboard/web/src/pages/PatrolPage.tsx dashboard/web/src/components/patrol/PatrolHeader.tsx
git rm dashboard/web/src/components/patrol/PatrolGlobalPipeline.tsx
git commit -m "feat(patrol): rewrite PatrolPage with sidebar layout, delete old horizontal pipeline"
```

---

### Task 6: Add CSS animations and dark mode

**Files:**
- Modify: `dashboard/web/src/components/patrol/PatrolSidebar.tsx`
- Modify: `dashboard/web/src/components/patrol/PatrolCaseRow.tsx`

- [ ] **Step 1: Add keyframe animations**

Add to PatrolSidebar (or a shared patrol styles block):

```css
@keyframes patrol-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.3; transform: scale(0.7); }
}
@keyframes patrol-glow {
  0%, 100% { box-shadow: rgba(106,95,193,0.12) 0 4px 16px; }
  50% { box-shadow: rgba(106,95,193,0.25) 0 6px 28px; }
}
@keyframes patrol-spin {
  to { transform: rotate(360deg); }
}
```

Apply:
- Active sidebar stage card: `animation: patrol-glow 3s ease-in-out infinite` (via inline style)
- Active dots: `animation: patrol-pulse 2s ease-in-out infinite`
- Spinner icons (Loader2): already uses Tailwind `animate-spin`, keep as-is

- [ ] **Step 2: Verify dark mode**

All colors use CSS variables (`--text-primary`, `--accent-blue`, `--bg-surface`, etc.), so dark mode should work automatically. Verify:
- Sidebar card uses `var(--bg-surface)` for background
- Connecting lines use `var(--accent-green)` / `var(--border-subtle)`
- Case cards use `var(--bg-surface)` and `var(--bg-base)` for header

- [ ] **Step 3: Verify TypeScript compiles and dev build**

Run: `cd dashboard/web && npx tsc --noEmit && npx vite build 2>&1 | tail -3`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add dashboard/web/src/components/patrol/PatrolSidebar.tsx dashboard/web/src/components/patrol/PatrolCaseRow.tsx
git commit -m "feat(patrol): add animations and verify dark mode support"
```

---

### Task 7: Final integration test

- [ ] **Step 1: Verify page renders correctly**

Start the dashboard dev server. Navigate to the Patrol page. Verify:
1. Left sidebar shows vertical pipeline with 6 stages
2. When idle: sidebar hidden or minimal, Start button visible
3. Right side shows case list header + case rows
4. Done cases are collapsed with chevron, click expands
5. Active cases show full 5-step pipeline
6. Queued cases show single-line at 30% opacity
7. No console errors in browser DevTools

- [ ] **Step 2: Verify with real patrol data**

If there's a previous patrol result (patrol-state.json exists), verify:
1. Mount hydration loads last run state correctly
2. Pipeline sidebar shows all stages completed with timings
3. Case rows show real case data with correct step statuses
4. Collapsed done rows show assess result tag + act summary

- [ ] **Step 3: Final commit if any fixes needed**

```bash
git add -A && git commit -m "fix(patrol): address integration issues from UI redesign"
```
