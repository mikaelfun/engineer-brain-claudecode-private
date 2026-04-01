# Implementation Plan: Fix Cron Job Execution

**Track ID:** cron-exec-fix_20260401
**Spec:** [spec.md](./spec.md)
**Created:** 2026-04-01
**Status:** [x] Complete

## Overview

Replace the SDK `query()` execution engine in `cron-manager.ts` with `claude -p` CLI subprocess. This ensures slash commands are properly recognized and executed. The change is localized to two functions: `scheduleJob`'s interval callback and `runTriggerNow`.

## Phase 1: Replace execution engine

Extract the shared execution logic into a helper function that spawns `claude -p` as a subprocess.

### Tasks

- [x] Task 1.1: Create `executeCronPrompt()` helper function in `cron-manager.ts` that spawns `claude -p` with the job's prompt, captures stdout/stderr, respects a configurable timeout (default 30 min), and returns `{ success, output, durationMs, exitCode }`
- [x] Task 1.2: Replace SDK `query()` in `scheduleJob`'s interval callback (lines 90-104) with `executeCronPrompt()`
- [x] Task 1.3: Replace SDK `query()` in `runTriggerNow()` (lines 222-235) with `executeCronPrompt()`
- [x] Task 1.4: Store execution output summary in job state — add `lastOutput` field (truncated to 2000 chars) to `job.state`

### Verification

- [ ] Build succeeds with `npm run build` in dashboard/
- [ ] Manually trigger a cron job from WebUI and verify it runs longer than 2 seconds

## Phase 2: Expose execution output in API + WebUI

### Tasks

- [x] Task 2.1: Update `GET /api/agents/triggers` response to include `lastOutput` from job state
- [x] Task 2.2: Show `lastOutput` in WebUI trigger list — add expandable output section to each trigger card
- [x] Task 2.3: Update CronJob type definition in `types/index.ts` to include `lastOutput` in state

### Verification

- [ ] WebUI shows real execution output after triggering a job
- [ ] Output is truncated properly for long-running jobs

## Verification Plan

| # | Acceptance Criterion | Test Type | Test Steps |
|---|---------------------|-----------|------------|
| 1 | Slash command cron jobs execute correctly | E2E | Create cron job with `/onenote-export sync` → trigger manually → verify CLI process spawned → verify duration > 5s → verify lastStatus reflects actual result |
| 2 | Plain prompt cron jobs still work | E2E | Create cron job with plain text prompt → trigger → verify claude -p executes → verify output captured |
| 3 | Job captures real duration and exit code | API | Trigger job → GET /api/agents/triggers → assert lastDurationMs > 5000 and lastOutput is non-empty |
| 4 | Job status reflects actual success/failure | API | Trigger job with invalid prompt → verify lastStatus = "error" and lastError is populated |
| 5 | WebUI shows execution output | Visual | Navigate to Agents page → trigger job → verify output section appears with real content |

**Test Type Legend:**
- **E2E** — Backup data → run actual workflow/script → verify file outputs + API + UI → restore
- **Interaction** — Playwright clicks, form fills, state assertions
- **Visual** — Navigate + screenshot + visual inspection
- **API** — curl/fetch endpoint + assert response
- **Skip** — D365 write/execute operations only (must justify)

## Post-Implementation Checklist

- [ ] 关联 Issue JSON 状态已更新为 `implemented`（非 `done`）
- [ ] Track metadata.json 已更新
- [ ] tracks.md 状态标记已更新
