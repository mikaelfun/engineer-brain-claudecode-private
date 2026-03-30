# Fix Analysis: fast-path

**Round:** 0
**Category:** workflow-e2e
**Source:** playbooks/guides/casework-evolution-loop.md — Scenario C
**Failure Type:** logic_error
**Is Env Issue:** false
**Analyzed At:** 2026-03-28T10:41:37Z

## Failed Assertions

Could not parse assertions

## Full Result

```json
{
  "testId": "fast-path",
  "round": 0,
  "category": "workflow-e2e",
  "status": "fail",
  "steps": [
    {
      "step": 1,
      "action": "backup",
      "status": "pass",
      "detail": "Backed up 16 files to /tmp/test-framework-backup/2603090040000814"
    },
    {
      "step": 2,
      "action": "ensure_fresh",
      "status": "pass",
      "detail": "Set casehealth-meta.json lastInspected = 2026-03-28T15:10:19+08:00 (NOW)"
    },
    {
      "step": 3,
      "action": "run_casework",
      "status": "pass",
      "detail": "POST /api/case/2603090040000814/process → HTTP 202. Casework completed in ~181s. e2e-runner reported 2/2 runner-level assertions passed (backup + HTTP 202)."
    },
    {
      "step": 4,
      "action": "verify_outputs",
      "status": "fail",
      "detail": "timing.json found. totalSeconds=181 (expected <60). phases.changegate took 23s. Log shows changegate=CHANGED|reason=case_not_found_in_api (expected NO_CHANGE). Both fast-path assertions FAIL."
    },
    {
      "step": 5,
      "action": "restore",
      "status": "pass",
      "detail": "Restored 16 files from /tmp/test-framework-backup. Verified lastInspected restored to 2026-03-28T10:00:00+08:00. Backup dir cleaned up."
    }
  ],
  "assertions": {
    "timing_under_60s": false,
    "changegate_no_change": false
  },
  "timing_actual": {
    "totalSeconds": 181,
    "phases_changegate_seconds": 23,
    "changegate_result": "CHANGED|reason=case_not_found_in_api"
  },
  "duration_ms": 19953,
  "error": "Fast path NOT taken: totalSeconds=181 (>60s threshold), changegate=CHANGED (reason: case_not_found_in_api). Casework ran full workflow including agent spawns. Root cause: PowerShell changegate script could not find case in D365 API, triggering CHANGED state instead of NO_CHANGE.",
  "timestamp": "2026-03-28T07:10:45.000Z"
}
```

## Suggested Fix Approach

1. Read failed assertion details carefully
2. Compare actual vs expected values
3. Trace through the relevant source code

## Files to Examine

- Test definition: `tests/registry/workflow-e2e/fast-path.yaml`
- Source: `playbooks/guides/casework-evolution-loop.md — Scenario C`
- Result: `tests/results/0-fast-path.json`
