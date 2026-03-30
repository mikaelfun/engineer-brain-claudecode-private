# Fix Analysis: regression-entitlement-display

**Round:** 0
**Category:** workflow-e2e
**Source:** cases/test-results/evolution-log.md — Bug #4
**Failure Type:** logic_error
**Is Env Issue:** false
**Analyzed At:** 2026-03-28T10:41:42Z

## Failed Assertions



## Full Result

```json
{
  "testId": "regression-entitlement-display",
  "round": 0,
  "status": "fail",
  "category": "workflow-e2e",
  "executedAt": "2026-03-28T07:58:12Z",
  "duration_ms": 186183,
  "assertions": [
    {
      "name": "case-summary contains 未检查",
      "passed": false
    },
    {
      "name": "case-summary not contains 合规",
      "passed": true
    }
  ],
  "steps": [
    {
      "skill": "inspection",
      "httpCode": 202,
      "completed": true
    }
  ],
  "error": "ASSERT1 FAIL: inspection-writer 在 NO_CHANGE fast-path（无新邮件）时跳过了 case-summary.md 更新，导致 serviceLevel=Unknown 的变化未被写入 case-summary.md，未检查 字符串未出现。根因：compliance 字段变更应强制触发 case-summary 刷新，而不是依赖邮件内容是否有变化。"
}
```

## Suggested Fix Approach

1. Read failed assertion details carefully
2. Compare actual vs expected values
3. Trace through the relevant source code

## Files to Examine

- Test definition: `tests/registry/workflow-e2e/regression-entitlement-display.yaml`
- Source: `cases/test-results/evolution-log.md — Bug #4`
- Result: `tests/results/0-regression-entitlement-display.json`
