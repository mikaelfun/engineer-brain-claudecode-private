# Fix Report: full-scenario

**Test ID:** full-scenario
**Fix Type:** code_bug
**Description:** Added poll_for_completion() to common.sh — polls GET /api/case/:id/operation every 10s until completion or timeout. Updated execute_casework_test() in e2e-runner.sh to call poll_for_completion() after HTTP 202 before verifying outputs.
**Modified Files:** tests/executors/common.sh,tests/executors/e2e-runner.sh
**Fixed At:** 2026-03-28T08:19:14Z

## What Was Fixed

Added poll_for_completion() to common.sh — polls GET /api/case/:id/operation every 10s until completion or timeout. Updated execute_casework_test() in e2e-runner.sh to call poll_for_completion() after HTTP 202 before verifying outputs.

## Modified Files

- `tests/executors/common.sh`
- `tests/executors/e2e-runner.sh`

## Diff

No git diff captured (files may not be tracked or no changes)
