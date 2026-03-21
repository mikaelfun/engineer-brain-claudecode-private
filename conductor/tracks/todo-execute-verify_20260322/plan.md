# Implementation Plan: Todo Execute Verification Mechanism

**Track ID:** todo-execute-verify_20260322
**Spec:** [spec.md](./spec.md)
**Created:** 2026-03-22
**Status:** [ ] Not Started

## Overview

Three-layer change: (1) Backend — enhance `executeTodoAction()` prompt to include a verification read-back step, add dedicated SSE events for progress/result; (2) Backend route — broadcast structured `todo-execute-progress` and `todo-execute-result` events; (3) Frontend — per-item state machine (idle → executing → verifying → success | failed) with spinner, timer, and final status badge.

## Phase 1: Backend — Enhanced Agent Prompt with Verification

Modify `executeTodoAction()` in `case-session-manager.ts` to include a post-write verification step and structured result reporting.

### Tasks

- [x] Task 1.1: Enhance `executeTodoAction()` prompt — add verification instructions: after running the D365 write script, run the matching read-back script (fetch-notes.ps1 for note, view-labor.ps1 for labor, refresh-timeline.ps1 for sap), then report structured JSON result `{ action, success, verificationDetails }`
- [x] Task 1.2: Add action-to-verification-script mapping — define which read-back script to use for each action type: `{ note: 'fetch-notes.ps1', labor: 'view-labor.ps1', sap: 'refresh-timeline.ps1' }`
- [x] Task 1.3: Update prompt to NOT auto-check the todo checkbox on failure — only mark `[x]` when verification confirms success

### Verification

- [ ] TypeScript compiles without errors
- [ ] Existing unit tests pass (`npm test`)

## Phase 2: Backend Route — Structured SSE Events

Update `POST /todo/:id/execute` route in `case-routes.ts` to broadcast `todo-execute-progress` and `todo-execute-result` SSE events with structured payloads.

### Tasks

- [x] Task 2.1: Add `todo-execute-progress` SSE event — broadcast during execution with `{ caseNumber, action, lineNumber, phase: 'executing' | 'verifying', message }` payload; parse agent messages to detect when write script vs read-back script is running
- [x] Task 2.2: Add `todo-execute-result` SSE event — broadcast after agent completes with `{ caseNumber, action, lineNumber, success: boolean, verificationDetails: string }` payload; parse agent's final structured JSON output
- [x] Task 2.3: Include `lineNumber` in the execute request body — frontend must send the todo item's lineNumber so SSE events can be keyed per-item

### Verification

- [x] TypeScript compiles without errors
- [x] Unit tests pass: Frontend — Per-Item State Machine + Timer

Update `TodoView.tsx` to track per-item execution state and render spinner/timer/result.

### Tasks

- [x] Task 3.1: Add per-item execution state store — `Map<string, { status: 'idle' | 'executing' | 'verifying' | 'success' | 'failed', startTime?: number, message?: string }>` keyed by `${caseNumber}:${lineNumber}`; update state on SSE events
- [x] Task 3.2: Listen to SSE events `todo-execute-progress` and `todo-execute-result` — update per-item state based on event payload; on `todo-execute-result` with `success=true`, also trigger todo toggle to check the item
- [x] Task 3.3: Replace Execute button rendering — based on item state: idle → "Execute" (amber, clickable); executing → "Executing..." spinner + elapsed timer (gray, disabled); verifying → "Verifying..." spinner (gray, disabled); success → "Execution Complete" ✓ (green, disabled); failed → "Execution Failed ✗" (red, clickable to retry)
- [x] Task 3.4: Add elapsed timer component — start counting on 'executing' state, stop on 'success'/'failed', display as "Xs" or "Xm Xs"
- [x] Task 3.5: Pass `lineNumber` in execute mutation call — update `handleExecute()` to include `lineNumber` in the request body

### Verification

- [x] TypeScript compiles without errors
- [x] Frontend renders correctly with different item states

## Verification Plan

| # | Acceptance Criterion | Test Type | Test Steps |
|---|---------------------|-----------|------------|
| 1 | Click Execute → button enters "Executing..." state with spinner + timer | Interaction | Navigate to Todo page → find actionable item → click Execute → verify spinner appears and timer starts counting |
| 2 | During execution, the button is disabled (no double-click) | Interaction | While executing → attempt click → verify button has disabled attribute |
| 3 | Backend streams SSE progress events during script execution | API | POST /todo/{id}/execute → listen SSE stream → verify todo-execute-progress events received |
| 4 | After write completes, backend runs read-back verification script | Skip | Covered by unit tests — agent prompt includes verification step |
| 5 | Verification uses correct scripts per action type | Skip | Covered by unit tests — mapping is deterministic |
| 6 | Verification pass → button shows "Execution Complete" (green, disabled) | Visual | After successful execution → verify button text and color |
| 7 | Verification fail → button shows "Execution Failed" (red, retryable) | Visual | Simulate failure → verify button text, color, and clickability |
| 8 | SSE todo-execute-result carries { success, verificationDetails } | API | Listen SSE after execution → verify event payload shape |
| 9 | Checkbox auto-checked only after verification passes | Skip | Covered by unit tests — conditional toggle logic |
| 10 | Failed execution does NOT auto-check checkbox | Skip | Covered by unit tests |

**Test Type Legend:**
- **Interaction** — Playwright clicks, form fills, state assertions
- **Visual** — Navigate + screenshot + visual inspection
- **API** — curl/fetch endpoint + assert response
- **Skip** — Backend-only or covered by unit tests

## Post-Implementation Checklist

- [ ] 单元测试文件已创建/更新并通过
- [ ] 关联 Issue JSON (ISS-066) 状态已更新
- [ ] Track metadata.json 已更新
- [ ] tracks.md 状态标记已更新

---

_Generated by Conductor. Tasks will be marked [~] in progress and [x] complete._
