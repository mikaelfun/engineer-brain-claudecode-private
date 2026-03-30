# Fix Analysis: regression-days-contact

**Round:** 0
**Category:** workflow-e2e
**Source:** cases/test-results/evolution-log.md — Bug #3
**Failure Type:** logic_error
**Is Env Issue:** false
**Analyzed At:** 2026-03-28T10:41:41Z

## Failed Assertions



## Full Result

```json
{
  "testId": "regression-days-contact",
  "round": 0,
  "status": "fail",
  "category": "workflow-e2e",
  "executedAt": "2026-03-28T07:51:49.263Z",
  "duration_ms": 97563,
  "assertions": [
    {
      "name": "daysSinceLastContact is number",
      "passed": true,
      "actualValue": "7 (type: number, location: root)"
    },
    {
      "name": "todo contains days info",
      "passed": false,
      "actualValue": "Latest todo 260328-1550.md has no day/天/contact keywords; content is about closure email + IR SLA + Entitlement"
    }
  ],
  "steps": [
    {
      "skill": "inspection",
      "httpCode": 202,
      "completed": true
    }
  ],
  "error": "Assert 2 failed: todo file does not contain days/contact information. The generated todo (260328-1550.md) focuses on closure actions (closure email, IR SLA, Entitlement compliance) without mentioning daysSinceLastContact or contact timing."
}
```

## Suggested Fix Approach

1. Read failed assertion details carefully
2. Compare actual vs expected values
3. Trace through the relevant source code

## Files to Examine

- Test definition: `tests/registry/workflow-e2e/regression-days-contact.yaml`
- Source: `cases/test-results/evolution-log.md — Bug #3`
- Result: `tests/results/0-regression-days-contact.json`
