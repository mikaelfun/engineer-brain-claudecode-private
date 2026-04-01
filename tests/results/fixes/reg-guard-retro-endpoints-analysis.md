# Fix Analysis: reg-guard-retro-endpoints

**Round:** 44
**Category:** workflow-e2e
**Source:** wf-regression-scan
**Failure Type:** logic_error
**Is Env Issue:** false
**Analyzed At:** 2026-03-31T22:43:33Z

## Failed Assertions

- retro handling exists in fix-recorder or fix-analyzer: expected=exit 0, actual=non-zero exit

## Full Result

```json
{
  "testId": "reg-guard-retro-endpoints",
  "round": 44,
  "timestamp": "2026-03-31T22:06:12.000Z",
  "status": "fail",
  "assertions": [{"name":"retroContext referenced in stage-worker phases","pass":true,"expected":"exit 0","actual":"exit 0"},{"name":"retro handling exists in fix-recorder or fix-analyzer","pass":false,"expected":"exit 0","actual":"non-zero exit"}],
  "error": "1 of 2 assertions failed",
  "duration_ms": 52437
}
```

## Suggested Fix Approach

1. Read failed assertion details carefully
2. Compare actual vs expected values
3. Trace through the relevant source code

## Root Cause Trace

_Not applicable — failure type (logic_error) did not trigger root cause trace._

## Retro Context (Phase Retrospective)

_No retroContext available — standard analysis workflow applies._

## Files to Examine

- Test definition: `tests/registry/workflow-e2e/reg-guard-retro-endpoints.yaml`
- Source: `wf-regression-scan`
- Result: `tests/results/44-reg-guard-retro-endpoints.json`

