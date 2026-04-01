# Fix Analysis: iss177-synthetic-adoption

**Round:** 29
**Category:** workflow-e2e
**Source:** issues/ISS-177.json
**Failure Type:** logic_error
**Is Env Issue:** false
**Analyzed At:** 2026-03-30T16:09:11Z

## Failed Assertions



## Full Result

```json
{
  "testId": "iss177-synthetic-adoption",
  "round": 29,
  "timestamp": "2026-03-30T15:20:30.000Z",
  "status": "fail",
  "assertions": [
    {
      "name": "synthetic-profiles.yaml exists",
      "passed": false,
      "expected": "true",
      "actual": "file not found"
    },
    {
      "name": "fixtures dir >1 file",
      "passed": true,
      "expected": ">1",
      "actual": "2"
    },
    {
      "name": "ISS-177 status=tracked",
      "passed": true,
      "expected": "tracked",
      "actual": "tracked"
    }
  ],
  "error": "tests/fixtures/synthetic-profiles.yaml not found",
  "duration_ms": 24192
}
```

## Suggested Fix Approach

1. Read failed assertion details carefully
2. Compare actual vs expected values
3. Trace through the relevant source code

## Root Cause Trace

_Not applicable — failure type (logic_error) did not trigger root cause trace._

## Files to Examine

- Test definition: `tests/registry/workflow-e2e/iss177-synthetic-adoption.yaml`
- Source: `issues/ISS-177.json`
- Result: `tests/results/29-iss177-synthetic-adoption.json`

