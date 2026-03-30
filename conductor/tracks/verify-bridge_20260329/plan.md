# Implementation Plan: verify.md 桥接到 SKILL.md — 消除双实现

**Track ID:** verify-bridge_20260329
**Spec:** [spec.md](./spec.md)
**Created:** 2026-03-29
**Status:** [x] Complete

## Phase 1: Backend — Types + conductor-reader.ts 兼容

- [x] Task 1.1: Update `TrackVerification` type to support both old (`result.unitTest/uiTest`) and new (`criteria[]`) formats
- [x] Task 1.2: Update `deriveIssueStatus` + `IssueVerifyResult` to handle both verification formats
- [x] Task 1.3: Run npm test to verify backend changes don't break existing tests

## Phase 2: verify.md Bridge + UI

- [x] Task 2.1: Rewrite verify.md Mode: Verify — replace Steps 3-6 with delegation to SKILL.md
- [x] Task 2.2: Update `VerifyResultPanel` in Issues.tsx to render both old and new formats
- [x] Task 2.3: Run full npm test to verify all changes

## Post-Implementation Checklist
- [x] TrackVerification type supports both formats
- [x] deriveIssueStatus handles criteria[] format
- [x] verify.md delegates Mode: Verify to SKILL.md
- [x] verify.md keeps Mode: Mark Done and Mode: Reopen unchanged
- [x] UI renders both old and new verification results
- [x] npm test passes
