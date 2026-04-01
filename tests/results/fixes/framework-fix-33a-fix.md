# Fix Report: framework-fix-33a

**Test ID:** framework-fix-33a
**Fix Type:** framework_fix
**Description:** e2e-runner.sh run_standalone_bash_assertions: flush on ANY type boundary, not just bash_* types
**Modified Files:** tests/executors/e2e-runner.sh
**Fixed At:** 2026-03-31T12:10:00Z
**Recipe Used:** none

## Root Cause

In `run_standalone_bash_assertions`, the flush+reset was only triggered when a new `bash_*` type assertion was detected. When a non-bash assertion type (e.g., `json_field_enum`) followed a `bash_output_contains` block, the `target:` and `expected:` fields from the non-bash block were absorbed into the previous bash assertion's state, corrupting it.

## What Was Fixed

Changed the type-detection logic from:
```bash
if echo "$line" | grep -q "  - type:.*bash_exit_zero|bash_output_contains|bash_output_not_contains"
```
To:
```bash
if echo "$line" | grep -q "  - type:"  # ANY type triggers flush+reset
  if bash_* type: set current_type
  else: set current_type="" (stops field collection)
```

## Effect

Any YAML assertion block boundary now resets the bash assertion parser state. Non-bash assertion types (json_field_enum, file_exists, etc.) no longer corrupt subsequent bash assertion parsing.

## Modified Files

- `tests/executors/e2e-runner.sh` (run_standalone_bash_assertions type-detection block)
