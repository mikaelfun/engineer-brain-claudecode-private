# Specification: WebUI Real-time Test Dashboard with Runner Controls

**Track ID:** webui-test-dashboard_20260329
**Issue:** ISS-147
**Type:** Feature
**Created:** 2026-03-29
**Status:** Draft

## Summary

Enhance the existing TestLab.tsx page with 4 new capabilities: (1) Runner control panel (start/stop/pause via UI), (2) Attention panel (priority-sorted issues), (3) Real-time activity stream (SSE-driven), (4) Evolution timeline. Backend additions: runner lifecycle API endpoints and enhanced SSE events.

## Context

### Existing WebUI infrastructure
- **TestLab.tsx** (630 lines): Phase Pipeline, Stats Cards, Round Journey, Queue Tables, Phase History, Discovery Table, Trend Chart
- **Backend routes** (`test-supervisor.ts`): GET endpoints for state, discoveries, trends, registry, results, fixes, manifest
- **File watcher** (`file-watcher.ts`): Watches `tests/state.json`, `tests/discoveries.json`, `tests/results/*.json` → emits SSE events
- **SSE hook** (`useSSE.ts`): Frontend subscription to server-sent events

### What's missing
1. **No runner controls** — can only start/stop runner from CLI (`/loop 5m /test-supervisor run`)
2. **No attention prioritization** — all stats shown equally, no "what needs my attention?"
3. **No real-time activity** — page refreshes on interval, not on actual state changes
4. **No evolution visibility** — framework evolution history not shown

### User's vision
> WebUI 做一个实时 dashboard，随时启动和安全停止 runner loop。

## Motivation

Enable the user to monitor and control the test-loop from the browser, without needing CLI access. Essential for the "autonomous quality system" vision.

## Success Criteria

- [ ] RunnerControl component: Start/Stop/Pause buttons functional
- [ ] Start button spawns runner via Claude SDK session
- [ ] Stop button injects `pause` directive (safe stop, not process kill)
- [ ] Runner status indicator: IDLE / RUNNING / PAUSED with last-run timestamp
- [ ] AttentionPanel shows priority-sorted issues (same logic as CLI dashboard's Attention section)
- [ ] ActivityStream shows real-time phase events via SSE
- [ ] EvolutionTimeline shows framework evolution milestones
- [ ] All components respect dark/light theme (existing CSS variables)
- [ ] Page layout reorganized: Attention at top, Controls at top-right, Activity inline

## Technical Design

### Component 1: RunnerControl

**Location**: Top of TestLab.tsx page, right-aligned next to page title.

```tsx
function RunnerControl({ status, lastRun, onStart, onStop, onPause }) {
  // status: 'idle' | 'running' | 'paused'
  // Renders: status indicator dot + label + action buttons
}
```

**Visual design** (following dashboard-design-system.md):
```
┌──────────────────────────────────────────────┐
│  🧪 Test Lab                    ● IDLE       │
│                          [▶ Start] [⏸ Pause] │
│                   Last: 03-29 09:57 (1h ago)  │
└──────────────────────────────────────────────┘
```

Status indicator colors:
- `idle`: `var(--text-tertiary)` (dim)
- `running`: `var(--accent-green)` (pulsing dot)
- `paused`: `var(--accent-amber)` (static)

**Backend API**:

```typescript
// POST /api/tests/runner/start
// Body: { interval?: number } (default 300000 = 5min)
// Response: { status: 'started', sessionId: string }
// Implementation: Spawn Claude SDK session with prompt "/test-supervisor run"
// Store session reference for status tracking

// POST /api/tests/runner/stop
// Response: { status: 'stopping' }
// Implementation: Write pause directive to tests/directives.json
// Does NOT kill process — test-loop reads directive at next Step 0.5

// GET /api/tests/runner/status
// Response: { status: 'idle'|'running'|'paused', lastRun: ISO, sessionId?: string }
// Implementation: Check if runner session is active + directives.paused state
```

**Safe stop mechanism**:
```typescript
// When user clicks Stop:
// 1. Read tests/directives.json
// 2. Add directive: { type: "pause", status: "pending", createdAt: now }
// 3. Write back directives.json
// 4. Test-loop reads pause at next Step 0.5 and exits gracefully
// 5. Runner post-flight completes normally
// 6. Status transitions to 'paused'
```

### Component 2: AttentionPanel

**Location**: Below controls, above Pipeline. Full width.

```tsx
function AttentionPanel({ state, trends, discoveries }) {
  // Computes attention items with same logic as CLI dashboard-renderer.sh
  // Renders priority-sorted cards
}
```

**Attention rules** (same as CLI dashboard from Track 1):
1. 🔴 fixQueue framework items (priority 1)
2. 🔴 health stuck/error
3. 🟡 health stale (with duration)
4. 🟡 regressions > 50% of discoveries
5. 🟡 coverage plateau (3+ rounds)
6. 🟡 stale probes
7. 🟡 fix success rate declining

**Empty state**: If no attention items → show "✅ All systems nominal" in muted green.

### Component 3: ActivityStream

**Location**: Below Phase Pipeline, inline (not a separate section).

```tsx
function ActivityStream({ events }) {
  // Real-time feed of phase events from SSE
  // Shows last 20 events, auto-scrolls
}
```

**Event format** (from enhanced SSE):
```json
{
  "type": "test-activity",
  "timestamp": "2026-03-29T11:52:30Z",
  "phase": "TEST",
  "action": "test_pass",
  "testId": "wf-iss142-retro-skill",
  "detail": "3/3 assertions passed"
}
```

**Visual**: Compact timeline with colored phase badges, similar to existing PhaseTimeline but real-time.

### Component 4: EvolutionTimeline

**Location**: New tab or collapsible section at bottom.

```tsx
function EvolutionTimeline({ evolution }) {
  // Visual timeline of evolution.json entries
  // Each node: round marker + title + impact description
}
```

**Data source**: `GET /api/tests/evolution` → reads `tests/evolution.json`

### Backend changes

**New route file**: `dashboard/src/routes/test-runner.ts`

```typescript
// Runner lifecycle management
app.post('/api/tests/runner/start', authMiddleware, async (req, res) => { ... })
app.post('/api/tests/runner/stop', authMiddleware, async (req, res) => { ... })
app.get('/api/tests/runner/status', authMiddleware, (req, res) => { ... })
app.get('/api/tests/evolution', authMiddleware, (req, res) => { ... })
```

**Enhanced SSE events** in `file-watcher.ts`:

Currently emits generic `test-state-changed` and `test-discovery-changed` events. Enhance to:
- `test-phase-changed`: When `state.json.phase` changes
- `test-activity`: When `state.json.phaseHistory` gets new entries
- `test-progress`: When `.progress-*.json` files appear/disappear
- `test-queue-changed`: When queue sizes change
- `runner-status-changed`: When runner starts/stops/pauses

### Page layout reorganization

```
Current:                         New:
┌─────────────────┐             ┌─────────────────────────┐
│ Title    R26/80 │             │ Title    R26/80  [●IDLE] │
│ Phase Pipeline  │             │ ⚠️ Attention Panel      │
│ Stats Cards     │             │ Phase Pipeline + Activity│
│ Journey+Queues  │             │ Stats Cards (compact)    │
│ Phase History   │             │ Journey + Queues (2-col) │
│ Discoveries     │             │ Discoveries              │
│ Trend Chart     │             │ Trend Chart + Evolution  │
└─────────────────┘             └─────────────────────────┘
```

Key changes:
- Controls integrated into title bar (not a separate section)
- Attention panel promoted to top (most important)
- Activity stream merged with Pipeline (real-time context)
- Evolution added alongside or below Trend Chart

## Dependencies

- **Track 1 (ISS-143)**: Attention logic (reuse from CLI dashboard-renderer.sh)
- **Track 3 (ISS-145)**: Runner status tracking (runner now has structured lifecycle)
- Existing TestLab.tsx components (Phase Pipeline, Stats, etc.)
- Existing SSE infrastructure (useSSE.ts, file-watcher.ts)
- Claude Code SDK for spawning runner sessions
- `playbooks/guides/dashboard-design-system.md` for visual design rules

## Out of Scope

- Runner loop interval configuration from UI (use default 5min, configurable later)
- Suggested issues display (future enhancement after ISS-146 scan expansion)
- Test result detail drill-down (existing API supports it, but UI not in this track)
- Mobile responsive layout (desktop-first)

## Files Changed

| File | Action | Description |
|------|--------|-------------|
| `dashboard/web/src/pages/TestLab.tsx` | MODIFY | Add RunnerControl, AttentionPanel, ActivityStream, EvolutionTimeline; reorganize layout |
| `dashboard/web/src/api/hooks.ts` | MODIFY | Add useRunnerStatus, useTestEvolution hooks |
| `dashboard/src/routes/test-runner.ts` | CREATE | Runner lifecycle API endpoints |
| `dashboard/src/routes/test-supervisor.ts` | MODIFY | Add evolution endpoint |
| `dashboard/src/watcher/file-watcher.ts` | MODIFY | Enhance SSE events with granular test activity |
| `dashboard/src/index.ts` | MODIFY | Register new routes |

## Testing

- Click Start → verify runner session spawns (check backend logs)
- Click Stop → verify pause directive written to directives.json
- Verify status indicator transitions: IDLE → RUNNING → PAUSED → IDLE
- Verify Attention panel shows correct priority items (compare with CLI dashboard)
- Verify ActivityStream updates in real-time when state.json changes (modify state.json manually and observe)
- Verify EvolutionTimeline renders all entries from evolution.json
- Test with dashboard-design-system.md: dark mode, light mode, correct colors
- Test with no test data → verify EmptyState rendered correctly

## Design System Compliance

All new components must follow `playbooks/guides/dashboard-design-system.md`:
- Use CSS variables (`var(--accent-green)`, `var(--bg-card)`, etc.)
- Dark mode as default, light mode supported
- Font: system-ui for text, JetBrains Mono for monospace
- Badge component for status indicators
- Card component for content sections
- Consistent spacing (gap-3, gap-4 between sections)
