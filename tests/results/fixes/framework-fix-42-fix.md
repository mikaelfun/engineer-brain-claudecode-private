# Fix Report: framework-fix-42

**Test ID:** framework-fix-42
**Fix Type:** framework_fix
**Description:** Fixed stage reset logic to clear timestamp fields (startedAt, completedAt, duration_ms) when transitioning cycles. Updated common.md Step C and state-update.md Step 5 to explicitly null out these fields during stage reset.
**Modified Files:** .claude/skills/stage-worker/phases/common.md .claude/skills/stage-worker/phases/state-update.md
**Fixed At:** 2026-03-31T19:34:40Z
**Recipe Used:** none

## What Was Fixed

Fixed stage reset logic to clear timestamp fields (startedAt, completedAt, duration_ms) when transitioning cycles. Updated common.md Step C and state-update.md Step 5 to explicitly null out these fields during stage reset.

## Modified Files

- `.claude/skills/stage-worker/phases/common.md.claude/skills/stage-worker/phases/state-update.md`

## Diff

No git diff captured (files may not be tracked or no changes)
