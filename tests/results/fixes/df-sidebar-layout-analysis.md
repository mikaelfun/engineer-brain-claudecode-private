# Fix Analysis: df-sidebar-layout

**Round:** 43
**Category:** ui-visual
**Source:** design-fidelity
**Failure Type:** logic_error
**Is Env Issue:** false
**Analyzed At:** 2026-03-31T20:37:00Z

## Failed Assertions

- Sidebar must have fixed/sticky positioning: expected=>0, actual=0

## Full Result

```json
{
  "testId": "df-sidebar-layout",
  "round": 43,
  "timestamp": "2026-03-31T20:36:22.000Z",
  "status": "fail",
  "assertions": [{"name":"Layout.tsx must reference 220px or --sidebar-width CSS variable","pass":true,"expected":">0","actual":"4"},{"name":"Sidebar must have fixed/sticky positioning","pass":false,"expected":">0","actual":"0"},{"name":"Main content must offset by sidebar width","pass":true,"expected":">0","actual":"3"}],
  "error": "1 of 3 assertions failed",
  "duration_ms": 53322
}
```

## Suggested Fix Approach

1. Read failed assertion details carefully
2. Compare actual vs expected values
3. Trace through the relevant source code

## Root Cause Trace

_Not applicable — failure type (logic_error) did not trigger root cause trace._

## Files to Examine

- Test definition: `tests/registry/ui-visual/df-sidebar-layout.yaml`
- Source: `design-fidelity`
- Result: `tests/results/43-df-sidebar-layout.json`

