# Fix Analysis: iss-192-copy-html-draft

**Round:** 42
**Category:** ui-interaction
**Source:** issues/ISS-192.json (AC: Copy button copies HTML rich text)
**Failure Type:** logic_error
**Is Env Issue:** false
**Analyzed At:** 2026-03-31T19:07:22Z

## Failed Assertions

- Page loads: Navigate: http://localhost:5173: expected=200, actual=000000

## Full Result

```json
{
  "testId": "iss-192-copy-html-draft",
  "round": 42,
  "timestamp": "2026-03-31T18:52:11.000Z",
  "status": "fail",
  "assertions": [{"name":"Page loads: Navigate: http://localhost:5173","pass":false,"expected":"200","actual":"000000"},{"name":"API: cases data available","pass":true,"expected":"200","actual":"200"},{"name":"API: issues data available","pass":true,"expected":"200","actual":"200"}],
  "error": "1 of 3 assertions failed",
  "duration_ms": 5952
}
```

## Suggested Fix Approach

1. Read failed assertion details carefully
2. Compare actual vs expected values
3. Trace through the relevant source code

## Root Cause Trace

_Not applicable — failure type (logic_error) did not trigger root cause trace._

## Files to Examine

- Test definition: `tests/registry/ui-interaction/iss-192-copy-html-draft.yaml`
- Source: `issues/ISS-192.json (AC: Copy button copies HTML rich text)`
- Result: `tests/results/42-iss-192-copy-html-draft.json`

