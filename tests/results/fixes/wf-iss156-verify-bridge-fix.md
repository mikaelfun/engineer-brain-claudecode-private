# Fix Report: wf-iss156-verify-bridge

**Test ID:** wf-iss156-verify-bridge
**Fix Type:** assertion_fix
**Description:** Fixed test definition: verify.md is in global commands dir (~/.claude/commands/conductor/verify.md), not project-local. Updated path and refined assertions to avoid grep -c || double-0 issue.
**Modified Files:** tests/registry/workflow-e2e/wf-iss156-verify-bridge.yaml
**Fixed At:** 2026-03-29T22:33:24Z
**Recipe Used:** none

## What Was Fixed

Fixed test definition: verify.md is in global commands dir (~/.claude/commands/conductor/verify.md), not project-local. Updated path and refined assertions to avoid grep -c || double-0 issue.

## Modified Files

- `tests/registry/workflow-e2e/wf-iss156-verify-bridge.yaml`

## Diff

No git diff captured (files may not be tracked or no changes)
