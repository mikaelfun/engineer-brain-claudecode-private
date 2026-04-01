# Fix Analysis: df-synthetic-edge-profiles

**Round:** 45
**Category:** workflow-e2e
**Source:** design-fidelity
**Failure Type:** endpoint_missing
**Is Env Issue:** false
**Analyzed At:** 2026-03-31T23:03:00Z

## Failed Assertions

- edge-corrupted-meta profile defined: expected=PASS: edge-corrupted-meta defined, actual=not found in: PASS: edge-missing-fields defined
- edge-no-entitlement profile defined: expected=PASS: edge-no-entitlement defined, actual=not found in: PASS: edge-missing-fields defined

## Full Result

```json
{
  "testId": "df-synthetic-edge-profiles",
  "round": 45,
  "timestamp": "2026-03-31T23:00:10.000Z",
  "status": "fail",
  "assertions": [{"name":"edge-corrupted-meta profile defined","pass":false,"expected":"PASS: edge-corrupted-meta defined","actual":"not found in: PASS: edge-missing-fields defined"},{"name":"edge-no-entitlement profile defined","pass":false,"expected":"PASS: edge-no-entitlement defined","actual":"not found in: PASS: edge-missing-fields defined"}],
  "error": "2 of 2 assertions failed",
  "duration_ms": 57898
}
```

## Suggested Fix Approach

1. Check if the endpoint exists in dashboard/src/routes/
2. Verify route registration in server.ts
3. If endpoint was removed, update test definition

## Root Cause Trace

_Not applicable — failure type (endpoint_missing) did not trigger root cause trace._

## Retro Context (Phase Retrospective)

_No retroContext available — standard analysis workflow applies._

## Files to Examine

- Test definition: `tests/registry/workflow-e2e/df-synthetic-edge-profiles.yaml`
- Source: `design-fidelity`
- Result: `tests/results/45-df-synthetic-edge-profiles.json`

