# Fix Analysis: obs-bash-antipattern-r28

**Round:** 28
**Category:** observability
**Source:** observability-scanner.sh
**Failure Type:** platform_instability
**Is Env Issue:** true
**Analyzed At:** 2026-03-30T01:59:36Z

## Failed Assertions

- Valid probe type: expected=metric|stability|audit, actual=

## Full Result

```json
{
  "testId": "obs-bash-antipattern-r28",
  "round": 28,
  "timestamp": "2026-03-30T01:50:58.000Z",
  "status": "fail",
  "assertions": [{"name":"Valid probe type","pass":false,"expected":"metric|stability|audit","actual":""}],
  "error": null,
  "duration_ms": 672
}
```

## Suggested Fix Approach

1. Re-run the stability probe to confirm it's not transient
2. Check bash environment: Git Bash version, path handling
3. Review learnings.yaml for known platform issues
4. If persistent: investigate root cause in shell behavior
→ Write to learnings.yaml if new pattern discovered

## Root Cause Trace

**Trace Path:** `test:obs-bash-antipattern-r28 → endpoint:NOT_FOUND`

**Trace Result:** trace_incomplete: no API endpoint found in test definition or assertions

## Files to Examine

- Test definition: `tests/registry/observability/obs-bash-antipattern-r28.yaml`
- Source: `observability-scanner.sh`
- Result: `tests/results/28-obs-bash-antipattern-r28.json`

