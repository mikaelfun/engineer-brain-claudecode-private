# Implementation Plan: CaseAIPanel Timeline + Filter Tab Redesign

**Track ID:** ai-panel-timeline_20260322
**Spec:** [spec.md](./spec.md)
**Created:** 2026-03-22
**Status:** [~] In Progress

## Overview

Three-phase refactor: (1) Extract shared components + add filter tab UI, (2) Migrate message data flow from `caseAssistantStore` to `caseSessionStore`, (3) Clean up dead code and verify.

## Phase 1: UI Display Layer — Filter Tabs + groupByStep

Replace the per-executionId tab strip with step filter tabs and switch the message area to use `groupByStep` timeline.

### Tasks

- [x] Task 1.1: Extract `StepQuestionForm` from CaseAIPanel into `dashboard/web/src/components/session/StepQuestionForm.tsx` as a shared component. Keep the same props interface, add optional `sessionId` prop for AgentMonitor use.
- [x] Task 1.2: Create `StepFilterTabs` component in `dashboard/web/src/components/session/StepFilterTabs.tsx`. Props: `steps: StepGroup[]` (from `groupMessagesByStep`), `activeFilter: string | null` (null = All), `onFilterChange: (stepName: string | null) => void`. Renders `[All]` + per-step buttons with status badges (✅🔄❌) and message counts.
- [x] Task 1.3: Refactor CaseAIPanel full mode message area — replace `sessionTabs` strip (L1108-1173) with `StepFilterTabs`. Replace per-session message rendering with `SessionMessageList` using `groupByStep=true`. When a filter is active, pass only that step's messages to `SessionMessageList` (using `groupMessagesByStep` to filter, then render flat without step grouping).
- [x] Task 1.4: Update CaseAIPanel full mode chat input — decouple from `effectiveSessionId` (which was executionId). Chat always sends to the real backend `activeSessionId` from `useCaseSessions()`. Remove tab-awareness from chat routing.
- [x] Task 1.5: Update CaseAIPanel compact mode — keep existing sidebar layout, but derive active step info from `groupMessagesByStep` on the message stream instead of from `caseAssistantStore.currentStep`. (No change needed — compact mode already uses sessions API, not caseAssistantStore.currentStep)

### Verification

- [x] Phase 1 verified: CaseAIPanel shows timeline with step sections, filter tabs work, chat routes correctly, compact mode unchanged. TypeScript compiles. Existing unit tests pass (1 pre-existing failure in AgentMonitor unrelated to this track).

## Phase 2: Data Flow Migration — SSE → caseSessionStore

Migrate SSE event handlers to write case step messages into `caseSessionStore` (per-session bucket) instead of `caseAssistantStore` (per-executionId bucket).

### Tasks

- [x] Task 2.1: Extend `caseSessionStore` — add `pendingQuestions: Record<string, PendingQuestion>` field (keyed by `caseNumber:sessionId`), `setPendingQuestion()`, `clearPendingQuestion()`, `getSessionPendingQuestion()` actions. This moves pending question state from `caseAssistantStore` to `caseSessionStore`.
- [x] Task 2.2: Update SSE handler in `useSSE.ts` — for case step events (`case-step-started`, `case-step-progress`, `case-step-question`, `case-step-completed`, `case-step-failed`): write messages to `caseSessionStore.addSessionMessage(caseNumber, sessionId, msg)` with `step` field populated. Keep `caseAssistantStore` writes as parallel (dual-write) for backward compat during migration.
- [x] Task 2.3: Update CaseAIPanel to read from `caseSessionStore` per-session messages (using `sessionId` from `useCaseSessions()`) instead of `caseAssistantStore` per-executionId messages. Remove the `stepMessageToSessionMessage` adapter — messages are now natively `CaseSessionMessage`. Remove `selectedStepMessages`, `convertedStepMessages`, `effectiveMessages` fallback chain.
- [x] Task 2.4: Update step progress recovery (`/case/:id/step-progress` API) — populate `caseSessionStore` on page refresh instead of `caseAssistantStore.loadMessages()`. Ensure recovered messages have `step` field for groupByStep to work.
- [x] Task 2.5: Migrate action disabled logic — `getCaseStatus()` currently reads from `caseAssistantStore.sessionStatus`. Move to derive status from `caseSessionStore` messages (check if latest message is 'completed'/'failed' or if session is active from `useCaseSessions()`). Or keep a thin status field in `caseSessionStore`.

### Verification

- [x] Phase 2 verified: SSE messages flow through `caseSessionStore`, CaseAIPanel reads from single store, step recovery works after page refresh. AgentMonitor still works correctly (it already reads from `caseSessionStore`).

## Phase 3: Cleanup + AgentMonitor Enhancement

Remove dead code and add question form to AgentMonitor.

### Tasks

- [~] Task 3.1: Remove `caseAssistantStore` dual-write from SSE handler (useSSE.ts). Remove all `caseAssistantStore` imports and usage from CaseAIPanel. Keep `caseAssistantStore.ts` file only if other consumers exist (check grep), otherwise delete.
- [ ] Task 3.2: Add `StepQuestionForm` to AgentMonitor's `CaseSessionDetail` — when the case session has a pending question, render the shared question form below the message list.
- [ ] Task 3.3: Clean up unused adapter functions — remove `stepMessageToSessionMessage()`, remove `KIND_TO_TYPE` mapping, remove `INTENT_LABEL_MAP` if no longer needed.
- [ ] Task 3.4: Update `QueuedMessage` handling — ensure queued chat messages appear in the timeline as a `__chat__` step segment or in the `__general__` group.

### Verification

- [ ] Phase 3 verified: No unused imports/code. AgentMonitor shows question form for active case sessions. All existing unit tests pass. TypeScript compiles clean.

## Verification Plan

| # | Acceptance Criterion | Test Type | Test Steps |
|---|---------------------|-----------|------------|
| 1 | Message area uses groupByStep timeline | Visual | Navigate to CaseDetail AI tab → screenshot → verify step sections with collapse/expand |
| 2 | Filter tabs show step names with status badges | Visual | Run a step → screenshot → verify `[All] [data-refresh ✅]` tab bar |
| 3 | Clicking filter tab shows only that step's messages | Interaction | Run data-refresh + troubleshoot → click `[data-refresh]` tab → verify only data-refresh messages visible → click `[All]` → verify all messages visible |
| 4 | Chat routes to real backend session | Interaction | Select a filter tab → type chat message → verify message appears in timeline (not isolated to tab) |
| 5 | StepQuestionForm shared in both views | Visual | Trigger a step with question (troubleshoot) → verify form appears in CaseAIPanel → navigate to Agent Monitor → verify same form in CaseSessionDetail |
| 6 | caseAssistantStore removed from CaseAIPanel | Skip | Code-level check: grep for imports |
| 7 | Compact mode shows active step | Visual | Run a step → verify compact sidebar shows step name + latest message |
| 8 | Existing features preserved | Interaction | Test action buttons, email menu, step cancel — verify no regression |

**Test Type Legend:**
- **Interaction** — Playwright clicks, form fills, state assertions
- **Visual** — Navigate + screenshot + visual inspection
- **API** — curl/fetch endpoint + assert response
- **Skip** — Backend-only or covered by unit tests

## Post-Implementation Checklist

- [ ] 单元测试文件已创建/更新并通过
- [ ] 关联 Issue JSON 状态已更新
- [ ] Track metadata.json 已更新
- [ ] tracks.md 状态标记已更新

---

_Generated by Conductor. Tasks will be marked [~] in progress and [x] complete._
