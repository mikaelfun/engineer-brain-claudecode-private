# Fix Report: bash-variable-stability

**Test ID:** bash-variable-stability
**Fix Type:** test_def_bug
**Description:** Excluded detector files (observability-scanner/runner) from anti-pattern grep to avoid self-match false positive
**Modified Files:** tests/executors/observability-runner.sh,tests/registry/observability/bash-variable-stability.yaml
**Fixed At:** 2026-03-28T16:27:32Z

## What Was Fixed

Excluded detector files (observability-scanner/runner) from anti-pattern grep to avoid self-match false positive

## Modified Files

- `tests/executors/observability-runner.sh`
- `tests/registry/observability/bash-variable-stability.yaml`

## Diff

No git diff captured (files may not be tracked or no changes)
