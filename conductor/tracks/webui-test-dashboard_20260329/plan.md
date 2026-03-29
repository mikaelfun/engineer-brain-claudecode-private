# Implementation Plan: WebUI Real-time Test Dashboard with Runner Controls

**Track ID:** webui-test-dashboard_20260329
**Spec:** [spec.md](./spec.md)
**Created:** 2026-03-29
**Status:** [ ] Not Started

## Overview

Add 4 new capabilities to TestLab.tsx: (1) Runner controls (Start/Stop/Pause), (2) Attention panel, (3) Real-time activity stream, (4) Evolution timeline. Plus backend API endpoints and enhanced SSE events.

## Phase 1: Backend — Runner API + Evolution Endpoint + SSE Enhancement

### Tasks

- [x] Task 1.1: Create `dashboard/src/routes/test-runner.ts` — Runner lifecycle API (POST start/stop, GET status). Start spawns Claude SDK session with `/test-supervisor run`; Stop writes pause directive to `tests/directives.json`; Status checks runner session + directives state. Add `readEvolution()` to `test-reader.ts` and GET `/api/tests/evolution` to `test-supervisor.ts`.
- [x] Task 1.2: Enhance `dashboard/src/watcher/file-watcher.ts` — Add granular SSE events: `test-phase-changed` (phase field changes), `test-activity` (phaseHistory new entries), `runner-status-changed` (runner start/stop). Add new event types to `types/index.ts → SSEEventType`.
- [x] Task 1.3: Register new routes in `dashboard/src/index.ts` — Import and mount `test-runner.ts` routes under `/api/tests/runner/*`.

### Phase 1 Verification
- TypeScript compile: `npx tsc --noEmit` in `dashboard/`
- `curl http://localhost:3010/api/tests/runner/status` → 200 with `{ status: 'idle' }`
- `curl http://localhost:3010/api/tests/evolution` → 200 with evolution data
- `npm run test:server` → all backend tests pass

## Phase 2: Frontend — New Components + Hooks

### Tasks

- [x] Task 2.1: Add `useRunnerStatus`, `useRunnerStart`, `useRunnerStop`, `useTestEvolution` hooks to `hooks.ts`. useRunnerStatus polls every 5s. Start/Stop are mutations.
- [x] Task 2.2: Create `RunnerControl` component inline in TestLab.tsx — Status indicator (dot + label), Start/Stop/Pause buttons, last-run timestamp. Colors: idle=tertiary, running=green(pulsing), paused=amber.
- [x] Task 2.3: Create `AttentionPanel` component inline in TestLab.tsx — Compute attention items using same rules as CLI dashboard-renderer.sh (framework fix items, health issues, regressions, plateaus, stale probes). Priority-sorted cards with 🔴/🟡 indicators. Empty state: "✅ All systems nominal".
- [x] Task 2.4: Create `ActivityStream` component inline in TestLab.tsx — Show last 20 SSE events with colored phase badges, auto-scroll. Subscribe to new `test-activity` / `test-phase-changed` events via useSSE.
- [x] Task 2.5: Create `EvolutionTimeline` component inline in TestLab.tsx — Visual timeline from evolution.json. Each node: round marker + title + impact. Collapsible section at bottom.

### Phase 2 Verification
- TypeScript compile: `npx tsc --noEmit` in both `dashboard/` and `dashboard/web/`
- `npm run test:web` → all frontend tests pass
- Visual: navigate to TestLab page, verify components render without errors

## Phase 3: Layout Reorganization + Integration + Tests

### Tasks

- [ ] Task 3.1: Reorganize TestLab.tsx layout — Controls integrated into title bar (right-aligned), Attention panel below title (full width), Activity stream merged with Pipeline section, Evolution below Trend chart. Follow spec layout diagram.
- [ ] Task 3.2: Write unit tests — `test-runner.ts` route tests (mock session spawn, directive write, status check). TestLab component tests (RunnerControl render states, AttentionPanel priority sorting, empty states).
- [ ] Task 3.3: Final integration — Ensure all components work together, dark/light theme compliance, responsive behavior at 1440px+.

### Phase 3 Verification
- `npm test` → all tests (server + web) pass
- Visual: Screenshot at 1440px in dark mode, verify design system compliance

## Verification Plan

| # | Acceptance Criterion | Test Type | Test Steps |
|---|---------------------|-----------|------------|
| 1 | RunnerControl Start/Stop/Pause buttons functional | Interaction | Render RunnerControl with each status → verify correct buttons shown → click Start → verify mutation called |
| 2 | Start button spawns runner via Claude SDK session | API | POST /api/tests/runner/start → assert response { status: 'started' } → verify session spawn logic |
| 3 | Stop button injects pause directive | API | POST /api/tests/runner/stop → read directives.json → assert pause directive exists |
| 4 | Runner status indicator IDLE/RUNNING/PAUSED | Interaction | Render RunnerControl with each status → verify dot color and label text |
| 5 | AttentionPanel shows priority-sorted issues | E2E | Seed state.json with known issues → GET /api/tests/state → render AttentionPanel → verify 🔴 items before 🟡 |
| 6 | ActivityStream shows real-time SSE events | Interaction | Mock SSE events → render ActivityStream → verify events appear with phase badges |
| 7 | EvolutionTimeline shows milestones | API | GET /api/tests/evolution → assert response shape → render component → verify entries |
| 8 | Dark/light theme compliance | Visual | Navigate to TestLab → screenshot dark mode → verify CSS variable usage |
| 9 | Page layout reorganized per spec | Visual | Navigate to TestLab → verify Attention at top, Controls top-right, Activity inline |

**Test Type Legend:**
- **E2E** — Backup data → run actual workflow/script → verify file outputs + API + UI → restore
- **Interaction** — Playwright clicks, form fills, state assertions
- **Visual** — Navigate + screenshot + visual inspection
- **API** — curl/fetch endpoint + assert response
- **Skip** — D365 write/execute operations only (must justify)

## Post-Implementation Checklist

- [ ] 单元测试文件已创建/更新并通过
- [ ] 关联 Issue JSON 状态已更新为 `implemented`（非 `done`，需 verify 后才可标 `done`）
- [ ] Track metadata.json 已更新
- [ ] tracks.md 状态标记已更新

---

_Generated by Conductor. Tasks will be marked [~] in progress and [x] complete._
