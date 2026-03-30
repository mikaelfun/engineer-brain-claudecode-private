# Implementation Plan: Test Architecture Refactor — Pipeline Model

**Track ID:** test-arch-refactor_20260330
**Spec:** [spec.md](./spec.md)
**Created:** 2026-03-30
**Status:** [~] In Progress

## Overview

Refactor in 4 phases: State layer first (foundation), then Framework layer (agents/skills), then Dashboard layer (UI/API), finally integration verification. Each phase is independently verifiable.

## Phase 1: State Layer Refactor

Split monolithic state.json into focused files and update state-writer.sh.

### Tasks

- [x] Task 1.1: Design new state file schemas — define exact JSON structure for pipeline.json, queues.json, stats.json, supervisor.json
- [x] Task 1.2: Create state migration script — reads current state.json, writes 4 new files + archives to history/
- [x] Task 1.3: Refactor state-writer.sh — support `--target pipeline|queues|stats|supervisor` parameter, maintain `--merge` behavior, add backward compat shim that auto-routes fields to correct file
- [x] Task 1.4: Create state-reader.sh — unified read utility that assembles state from multiple files (for components that still need full state)
- [x] Task 1.5: Implement per-tick archival — after each tick completes, archive supervisor.json reasoning to history/cycle-N/tick-M.json
- [x] Task 1.6: Rename all field names in state files — round→cycle, phase→stage, phaseHistory→stageHistory, roundJourney→cycleJourney→stages (in pipeline.json)

### Verification

- [ ] Run state migration on current state.json → verify 4 output files are correct
- [ ] Run state-writer.sh --target pipeline --merge → verify only pipeline.json updated
- [ ] Verify state-reader.sh assembles complete state from all files

## Phase 2: Framework Layer Refactor (Agents + Skills)

Update all agent definitions, skill files, and phase executors with new naming.

### Tasks

- [x] Task 2.1: Update test-supervisor-runner.md — rename runner steps to Reasoning Steps (Observe/Diagnose/Decide/Act/Reflect), update all state field references
- [x] Task 2.2: Update test-loop SKILL.md — rename to reference "stage-worker" concept, update phase→stage terminology
- [x] Task 2.3: Update all phase files (phases/common.md, SCAN.md, GENERATE.md, TEST.md, FIX.md, VERIFY.md, state-update.md) — round→cycle, phase→stage, state-writer calls use --target
- [x] Task 2.4: Update test-supervisor SKILL.md — update mode routing, terminology
- [x] Task 2.5: Update supervisor modes (dashboard.md, health.md, trends.md, etc.) — all references to round/phase/runner
- [x] Task 2.6: Update executor scripts — stats-reporter.sh, health-check.sh, trend-analyzer.sh, pre-flight.sh, learnings-writer.sh: field name changes + multi-file state reads
- [x] Task 2.7: Update test-supervisor-runner agent to write reasoning conclusions to supervisor.json — each step writes its one-sentence conclusion

### Verification

- [ ] All skill/agent .md files use new terminology consistently
- [ ] state-writer.sh calls in all phase files use --target parameter
- [ ] Supervisor reasoning conclusions are written to supervisor.json after each step

## Phase 3: Dashboard Layer Refactor

Redesign TestLab.tsx and update API endpoints.

### Tasks

- [x] Task 3.1: Update API endpoints — read from split state files (pipeline.json for stage progress, supervisor.json for reasoning, queues.json for queues, stats.json for stats)
- [x] Task 3.2: Implement SSE unified push — replace 4 polling intervals with single SSE stream, emit events on state file changes (chokidar watch)
- [x] Task 3.3: Redesign TestLab.tsx header — Cycle N/M + status + elapsed timer + controls (compact, one line)
- [x] Task 3.4: Implement Reasoning Narrative component — reads supervisor.json reasoning, smart fold (collapsed = one-line summary, expanded = full 5-step narrative with conclusions)
- [x] Task 3.5: Redesign Stage Pipeline component — horizontal 5-stage flow with status/processed/total from pipeline.json
- [x] Task 3.6: Implement smart folding logic — auto-expand on selfHealEvent present, auto-expand on reflect having content, collapse when all steps are normal ✅
- [x] Task 3.7: Update Activity Stream — mix self-heal events (🔧), learning events (📝), strategy events (🧠) with test events, read from SSE stream
- [x] Task 3.8: Update Queues panel — read from queues.json, show non-empty queues only
- [x] Task 3.9: Update Stats bar — inline compact format, read from stats.json
- [x] Task 3.10: Remove old dual-pipeline UI — delete LiveHero runner steps dots, merge into unified view

### Verification

- [ ] Dashboard renders with new state file format
- [ ] SSE events fire on state changes
- [ ] Reasoning narrative auto-expands on self-heal events
- [ ] All 5 stages show correct progress from pipeline.json

## Phase 4: Integration & Documentation

End-to-end verification and documentation updates.

### Tasks

- [ ] Task 4.1: Run a full test cycle with new architecture — verify SCAN→GENERATE→TEST→FIX→VERIFY completes
- [ ] Task 4.2: Verify self-heal scenario — inject a corrupt state, verify supervisor detects and heals
- [ ] Task 4.3: Update MEMORY.md with architecture changes
- [ ] Task 4.4: Run existing unit tests — ensure no regressions
- [ ] Task 4.5: Create migration notes — document breaking changes for any external references

### Verification

- [ ] Full cycle completes without errors
- [ ] Dashboard shows reasoning narrative correctly during live run
- [ ] All unit tests pass

## Verification Plan

| # | Acceptance Criterion | Test Type | Test Steps |
|---|---------------------|-----------|------------|
| 1 | Concepts renamed (Cycle/Stage/Reasoning Steps) | E2E | Run state migration → grep all .md/.sh/.ts files for old terms → verify 0 matches in active code |
| 2 | state.json split into 4 files | E2E | Run migration script → verify pipeline.json ~15 lines + queues.json + stats.json + supervisor.json exist and are valid JSON |
| 3 | Per-tick history archived | E2E | Run one supervisor tick → verify history/cycle-N/tick-M.json created with reasoning snapshot |
| 4 | state-writer.sh multi-file support | E2E | Write to each target file → read back → verify correct file updated, others unchanged |
| 5 | Dashboard unified narrative + pipeline | Visual | Navigate to TestLab → screenshot → verify single pipeline (not dual), reasoning section visible |
| 6 | SSE unified push | API | Connect to SSE endpoint → trigger state change → verify event received within 2s |
| 7 | Smart folding (normal = collapsed) | Interaction | Seed normal supervisor.json (no selfHeal) → navigate → verify reasoning is one-line |
| 8 | Smart folding (self-heal = expanded) | Interaction | Seed supervisor.json with selfHealEvent → navigate → verify reasoning expanded with 5 steps |
| 9 | Phase files use new naming | E2E | Grep phases/*.md for "round" "phase" old terms → verify 0 matches |
| 10 | Supervisor writes reasoning conclusions | E2E | Run supervisor tick → read supervisor.json → verify reasoning.observe/diagnose/decide/act/reflect have values |
| 11 | All existing tests pass | E2E | Run npm test → verify 0 failures |

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
