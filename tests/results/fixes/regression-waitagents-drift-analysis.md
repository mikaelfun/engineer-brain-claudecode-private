# Fix Analysis: regression-waitagents-drift

**Round:** 0
**Category:** workflow-e2e
**Source:** cases/test-results/evolution-log.md — Bug #5
**Failure Type:** logic_error
**Is Env Issue:** false
**Analyzed At:** 2026-03-28T10:41:43Z

## Failed Assertions



## Full Result

```json
{
  "testId": "regression-waitagents-drift",
  "round": 0,
  "status": "fail",
  "category": "workflow-e2e",
  "executedAt": "2026-03-28T08:08:08Z",
  "duration_ms": 300000,
  "assertions": [
    {"name": "timing.json valid JSON", "passed": true, "note": "pre-test timing.json from previous run (casework timed out before producing new one)"},
    {"name": "no negative durations in phases", "passed": true, "note": "pre-test timing.json from previous run; waitAgents=0s (no negative drift detected in stale data)"}
  ],
  "steps": [
    {"skill": "casework (full process)", "httpCode": 202, "completed": false, "waitTime_s": 300}
  ],
  "error": "casework timeout: operation still active after 300s (started 2026-03-28T08:00:58Z, poll logic bug caused early exit at 10s then re-polled 280s more). timing.json assertions ran on pre-test data (modified 15:52 SGT, test started 16:00 SGT). poll API response lacks 'active' field — must check 'operation' field nullness instead."
}
```

## Suggested Fix Approach

1. Read failed assertion details carefully
2. Compare actual vs expected values
3. Trace through the relevant source code

## Files to Examine

- Test definition: `tests/registry/workflow-e2e/regression-waitagents-drift.yaml`
- Source: `cases/test-results/evolution-log.md — Bug #5`
- Result: `tests/results/0-regression-waitagents-drift.json`
