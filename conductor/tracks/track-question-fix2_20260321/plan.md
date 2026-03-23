# Implementation Plan: Fix Create Track Question Dialog Not Showing (Round 2)

**Track ID:** track-question-fix2_20260321
**Spec:** [spec.md](./spec.md)
**Created:** 2026-03-21
**Status:** [x] Complete

## Overview

Fix the 3 interrelated bugs causing the Create Track question dialog to not appear:
1. Backend always stores pendingQuestion + backfills sessionId
2. Frontend optimistic panel mount on create-track mutation
3. Frontend recovery logic fix for edge cases

## Phase 1: Backend — Always Store pendingQuestion + Backfill sessionId

Fix the backend so pendingQuestion is always persisted regardless of sessionId availability.

### Tasks

- [x] Task 1.1: In `createCanUseTool()` (issues.ts), remove the `if (sessionId)` guard around `issueTrackState.setPendingQuestion()`. Always store the question with `sessionId || ''`.
- [x] Task 1.2: In `processQueryMessages()` (issues.ts), after capturing `session_id` into `sessionRef.current`, check if `issueTrackState` has a stored pendingQuestion with empty sessionId for this issueId. If so, update it with the now-known sessionId. Also re-broadcast `issue-track-question` SSE with the correct sessionId.
- [x] Task 1.3: In the `/track-answer` POST handler, when looking up pendingQuestion, use the stored sessionId (which may have been backfilled) for resuming the session, not just the frontend-provided sessionId.

### Verification

- [x] TypeScript compiles: `npx tsc --noEmit` in `dashboard/`
- [x] Backend unit tests pass: `npm run test:server`

## Phase 2: Frontend — Optimistic Panel Mount + Recovery Fix

Fix the frontend so TrackProgressPanel mounts immediately and recovery handles all edge cases.

### Tasks

- [x] Task 2.1: In `issueTrackStore.ts`, add a new state field `trackingIssues: Record<string, boolean>` and action `setIssueTracking(issueId: string, active: boolean)`. This provides an immediate local signal for panel mount.
- [x] Task 2.2: In `Issues.tsx`, when the create-track mutation fires (onMutate or onSuccess), call `setIssueTracking(issue.id, true)` to immediately mark the issue as tracking locally. Update `showProgress` condition to also check this local flag.
- [x] Task 2.3: In `TrackProgressPanel.tsx`, fix the recovery logic: remove the `messages.length === 0` guard for `pendingQuestion` recovery. Always check if `recoveredData.pendingQuestion` exists and the store doesn't already have a pendingQuestion for this issueId — if so, restore it.
- [x] Task 2.4: In `useSSE.ts`, verify the `issue-track-question` handler always calls `setIssuePendingQuestion` regardless of whether `sessionId` exists in the event data (the ISS-027 fallback already does this, confirmed robust).

### Verification

- [x] TypeScript compiles: `npx tsc --noEmit` in both `dashboard/` and `dashboard/web/`
- [x] All tests pass: `npm test`

## Phase 3: Unit Tests + Verification

### Tasks

- [x] Task 3.1: Add/update backend unit tests in `issues.test.ts` for: track-answer endpoint (6 tests), track-progress pendingQuestion (2 tests). Updated mock to include setPendingQuestion, getPendingQuestion, clearPendingQuestion.
- [x] Task 3.2: Frontend tests — existing useSSE.test.tsx and SessionBadge.test.tsx continue to pass. The store changes are backward-compatible.

### Verification

- [x] All unit tests pass: `npm test` (99 total: 81 backend + 18 frontend)
- [x] No TypeScript errors

## Verification Plan

| # | Acceptance Criterion | Test Type | Test Steps |
|---|---------------------|-----------|------------|
| 1 | Question dialog always appears when AskUserQuestion is intercepted, regardles... | Interaction | Navigate to page → perform interaction → verify expected outcome |
| 2 | Backend always stores pendingQuestion even when sessionId is not yet available | Visual | Navigate to page → screenshot → verify visual matches spec |
| 3 | Answer submission works correctly even when sessionId was initially missing (... | Visual | Navigate to page → screenshot → verify visual matches spec |
| 4 | Recovery endpoint always returns current pendingQuestion state | API | Call the relevant endpoint → verify response shape and status code |
| 5 | TrackProgressPanel recovery correctly handles all edge cases (question-before... | Visual | Navigate to page → screenshot → verify visual matches spec |
| 6 | No regression: existing working scenarios continue to function | Skip | Covered by unit tests |

**Test Type Legend:**
- **Interaction** — Playwright clicks, form fills, state assertions
- **Visual** — Navigate + screenshot + visual inspection
- **API** — curl/fetch endpoint + assert response
- **Skip** — Backend-only or covered by unit tests

## Verification Plan

| # | Acceptance Criterion | Test Type | Test Steps |
|---|---------------------|-----------|------------|
| 1 | Question dialog always appears when AskUserQuestion is intercepted, regardles... | Interaction | Navigate to page → perform interaction → verify expected outcome |
| 2 | Backend always stores pendingQuestion even when sessionId is not yet available | Visual | Navigate to page → screenshot → verify visual matches spec |
| 3 | Answer submission works correctly even when sessionId was initially missing (... | Visual | Navigate to page → screenshot → verify visual matches spec |
| 4 | Recovery endpoint always returns current pendingQuestion state | API | Call the relevant endpoint → verify response shape and status code |
| 5 | TrackProgressPanel recovery correctly handles all edge cases (question-before... | Visual | Navigate to page → screenshot → verify visual matches spec |
| 6 | No regression: existing working scenarios continue to function | Skip | Covered by unit tests |

**Test Type Legend:**
- **Interaction** — Playwright clicks, form fills, state assertions
- **Visual** — Navigate + screenshot + visual inspection
- **API** — curl/fetch endpoint + assert response
- **Skip** — Backend-only or covered by unit tests

## Post-Implementation Checklist
- [x] Unit test files created and passing
- [x] ISS-029 JSON status updated
- [x] Track metadata.json updated
- [x] tracks.md status updated

---

_Generated by Conductor. Tasks will be marked [~] in progress and [x] complete._
