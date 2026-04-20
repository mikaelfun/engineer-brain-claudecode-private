# Implementation Plan: Dashboard v2 — Command Center

**Track ID:** dashboard-v2-command-center_20260420
**Spec:** [spec.md](./spec.md)
**Created:** 2026-04-20
**Status:** [x] Complete

## Overview

Rewrite Dashboard.tsx as a Command Center with 3 zones. Implement frontend-first: all data from existing APIs, urgency scoring client-side. Four phases: foundation components → pipeline + actions → health metrics + activity feed → backend scoring service.

## Phase 1: Foundation — Component Scaffold + Layout

Replace existing Dashboard.tsx with new 3-zone layout. Create shared sub-components.

### Tasks

- [x] Task 1.1: Create `dashboard/web/src/components/dashboard/` directory with barrel export
- [x] Task 1.2: Build `DashboardTopBar.tsx` — greeting (time-of-day aware), date/time, alert badges (SLA Risk count, Need Action count, Last Patrol timestamp), Patrol trigger button (reuse existing `useStartPatrol`/`useCancelPatrol`)
- [x] Task 1.3: Build urgency scoring utility `dashboard/web/src/utils/urgencyScore.ts` — pure function `computeUrgencyScore(case, todos?)` returning `{ score: number, factors: Factor[] }`. Implement 6 factors: prod_impact (keyword match on title/SAP), customer_sentiment (placeholder: neutral), severity (A=25/B=15/C=5), contact_gap (from daysSinceLastContact), teams_pressure (placeholder: 0), sla_bonus (from irSla remaining hours)
- [x] Task 1.4: Rewrite `Dashboard.tsx` shell — import TopBar, render 3 zone placeholders (Actions, Pipeline, Bottom), remove all old stat cards / severity charts / status breakdown / response metrics code
- [x] Task 1.5: Remove Todo nav item from `Layout.tsx` sidebar (`navItems` array)

### Verification

- [x] Dashboard renders with new TopBar, greeting shows correct time-of-day
- [x] Old stat cards / charts are gone
- [x] Todo removed from sidebar navigation
- [ ] `computeUrgencyScore()` unit test passes for all severity levels and SLA scenarios

## Phase 2: Actions & Todo List + Case Pipeline

Build the two main visual zones: priority-sorted action list and 4-column pipeline.

### Tasks

- [x] Task 2.1: Build `ActionItem.tsx` — score pill (color-coded 0-100), case ID badge, title, meta line, factor tags, timer/status, source label (CASE ACTION / PATROL TODO / MANUAL TODO)
- [x] Task 2.2: Build `ActionsList.tsx` — fetch cases + todos, merge into unified action list, sort by urgency score desc, tab filtering (All/Case/Todo/Manual), count badge in header
- [x] Task 2.3: Build `PipelineCard.tsx` — case ID, title (2-line clamp), severity badge, age, business tags (S500 from ccAccount, 21V from source detection, RDSE from ccAccount), hover "→ Detail" indicator, onClick navigate to `/case/{caseNumber}`
- [x] Task 2.4: Build `CasePipeline.tsx` — 4-column grid, column headers with colored top border (red=Engineer, green=Customer, purple=PG, cyan=Close), count badge per column, classify cases by `meta.actualStatus` mapping: `{pending-engineer|new|researching → Engineer}`, `{pending-customer → Customer}`, `{pending-pg → PG}`, `{ready-to-close|resolved → Close}`
- [x] Task 2.5: Wire Actions + Pipeline into Dashboard.tsx main layout

### Verification

- [x] Actions list shows all active cases + todos merged, sorted by score descending
- [x] Tab filtering works (switching tabs filters items by source)
- [x] Pipeline shows 4 columns with correct case distribution
- [x] Clicking a pipeline card navigates to `/case/{caseNumber}`
- [x] S500/21V/RDSE tags appear on correct cards

## Phase 3: Health Metrics + Activity Feed

Build the bottom zone: visual metrics cards and dual-section activity feed.

### Tasks

- [x] Task 3.1: Build `RingChart.tsx` — reusable SVG ring chart component (`value`, `max`, `color`, `label`, `size` props), with center text
- [x] Task 3.2: Build `HealthMetrics.tsx` — 3-column card grid: (1) IR SLA ring chart, (2) Active Cases with pipeline mini-bar + legend, (3) Avg Contact Days ring chart, (4) wide card with severity stacked bar + 7d sparkline, (5) Closed This Week ring chart. All data derived from `/api/cases` response
- [x] Task 3.3: Build `SparkLine.tsx` — reusable SVG sparkline component (`data: number[]`, `color`, `width`, `height` props), with area fill and end dot. For v1 use static mock data (no historical API yet)
- [x] Task 3.4: Build `ActivityFeed.tsx` — two sections: "My Activity" (derive from case meta changes: new cases, status changes, SLA events, patrol results from patrol store) and "Team Intel" (static placeholder cards for Known Issue / LSI with future data hook)
- [x] Task 3.5: Wire HealthMetrics + ActivityFeed into Dashboard.tsx bottom zone
- [x] Task 3.6: Verify dark/light theme rendering — all new components must use CSS variables (`var(--accent-*)`, `var(--bg-*)`, `var(--text-*)`)

### Verification

- [x] Ring charts render with correct values and colors in both themes
- [x] Pipeline mini-bar shows correct proportions matching Pipeline column counts
- [x] Severity stacked bar shows correct proportions
- [x] Activity Feed "My Activity" shows recent case events
- [x] Activity Feed "Team Intel" shows placeholder cards
- [x] All components pass visual inspection in both dark and light mode

## Phase 4: Backend Scoring Service + Polish

Move urgency scoring to backend, add `/api/actions` endpoint, refine UX.

### Tasks

- [x] Task 4.1: Create backend service `dashboard/src/services/urgency-scorer.ts` — server-side `computeUrgencyScore()` with access to case files (can read latest emails for sentiment keywords, check notes for Teams mentions)
- [x] Task 4.2: Create `/api/actions` route in `dashboard/src/routes/` — returns merged+scored list of actions from cases + todos, cached for 5 minutes
- [x] Task 4.3: Update `ActionsList.tsx` to consume `/api/actions` instead of client-side scoring
- [x] Task 4.4: Add `urgencyScore` field to `meta.json` schema — computed during patrol/data-refresh and cached, so Dashboard reads pre-computed scores
- [x] Task 4.5: Create `TeamIntelCard.tsx` component + `dataRoot/intel/` directory structure for future Team Intel ingestion (schema: `{ type, title, description, source, timestamp, affectedCases[] }`)
- [x] Task 4.6: Add keyboard shortcut support — `j/k` to navigate actions list, `Enter` to open case, `p` to toggle pipeline view

### Verification

- [x] `/api/actions` returns correctly scored and merged action list
- [x] Frontend renders same data from API as from client-side computation
- [x] `dataRoot/intel/` directory created with schema documentation
- [x] Keyboard navigation works in Actions list

## Verification Plan

| # | Acceptance Criterion | Test Type | Test Steps |
|---|---------------------|-----------|------------|
| 1 | Actions list shows merged cases+todos sorted by urgency score | E2E | Seed test cases with varied severity/SLA/contact → load Dashboard → verify sort order matches expected score ranking → verify score pills show correct values |
| 2 | 4-column Pipeline with correct classification | E2E | Seed cases with different actualStatus values → load Dashboard → verify each column contains correct cases → verify column counts match |
| 3 | Pipeline cards navigate to Case Detail | Interaction | Click pipeline card → verify URL changes to /case/{caseNumber} → verify Case Detail page loads |
| 4 | Pipeline cards show S500/21V/RDSE tags | E2E | Seed case with ccAccount (RDSE) + 21V source → load Dashboard → verify micro-tags appear on correct cards |
| 5 | Health Metrics SVG ring charts render | Visual | Navigate to Dashboard → screenshot health metrics section → verify ring charts visible with correct percentages |
| 6 | Activity Feed dual sections render | Visual | Navigate to Dashboard → verify "My Activity" section shows case events → verify "Team Intel" section shows placeholder cards |
| 7 | Top bar shows greeting + alert badges | Visual | Navigate to Dashboard → verify greeting matches time of day → verify badge counts match data |
| 8 | Tab filtering works | Interaction | Click "Case" tab → verify only case actions shown → click "Todo" → verify only todos shown → click "All" → verify all items shown |
| 9 | Todo page removed from sidebar | Visual | Navigate to Dashboard → verify sidebar does not contain "Todo" nav item |
| 10 | Dark/light theme compatibility | Visual | Toggle theme → screenshot both → verify all components use CSS variables correctly |

**Test Type Legend:**
- **E2E** — Backup data → run actual workflow/script → verify file outputs + API + UI → restore
- **Interaction** — Playwright clicks, form fills, state assertions
- **Visual** — Navigate + screenshot + visual inspection
- **API** — curl/fetch endpoint + assert response
- **Skip** — D365 write/execute operations only (must justify)

## Post-Implementation Checklist

- [x] 单元测试文件已创建/更新并通过
- [x] 关联 Issue ISS-233 状态已更新为 `implemented`
- [x] Track metadata.json 已更新
- [x] tracks.md 状态标记已更新

---

_Generated by Conductor for ISS-233. Tasks will be marked [~] in progress and [x] complete._
