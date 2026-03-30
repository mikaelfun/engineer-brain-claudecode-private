# Verify Result: regression-entitlement-display

**Round:** 0 (previous failure: Round -1)
**Category:** workflow-e2e
**Status:** fail
**Assertions:** 3/4
**Verified At:** 2026-03-28T14:00:14Z

## Previous Failures



## Executor Output

```
[0;33m[WARN][0m Poll: failed to parse response (elapsed: 110s), body: {"caseNumber":"2603250010001221","operation":{"caseNumber":"2603250010001221","operationType":"full-process","startedAt":"2026-03-28T13:56:57.256Z"}}
[0;34m[INFO][0m Still running... (elapsed: 110s, op_active=unknown)
[0;33m[WARN][0m Poll: failed to parse response (elapsed: 120s), body: {"caseNumber":"2603250010001221","operation":{"caseNumber":"2603250010001221","operationType":"full-process","startedAt":"2026-03-28T13:56:57.256Z"}}
[0;34m[INFO][0m Still running... (elapsed: 120s, op_active=unknown)
[0;33m[WARN][0m Poll: failed to parse response (elapsed: 130s), body: {"caseNumber":"2603250010001221","operation":{"caseNumber":"2603250010001221","operationType":"full-process","startedAt":"2026-03-28T13:56:57.256Z"}}
[0;34m[INFO][0m Still running... (elapsed: 130s, op_active=unknown)
[0;34m[INFO][0m Phase: casework:routing_done (elapsed: 140s)
[0;33m[WARN][0m Poll: failed to parse response (elapsed: 140s), body: {"caseNumber":"2603250010001221","operation":{"caseNumber":"2603250010001221","operationType":"full-process","startedAt":"2026-03-28T13:56:57.256Z"}}
[0;34m[INFO][0m Still running... (elapsed: 140s, op_active=unknown)
[0;33m[WARN][0m Poll: failed to parse response (elapsed: 150s), body: {"caseNumber":"2603250010001221","operation":{"caseNumber":"2603250010001221","operationType":"full-process","startedAt":"2026-03-28T13:56:57.256Z"}}
[0;34m[INFO][0m Still running... (elapsed: 150s, op_active=unknown)
[0;33m[WARN][0m Poll: failed to parse response (elapsed: 160s), body: {"caseNumber":"2603250010001221","operation":{"caseNumber":"2603250010001221","operationType":"full-process","startedAt":"2026-03-28T13:56:57.256Z"}}
[0;34m[INFO][0m Still running... (elapsed: 160s, op_active=unknown)
[0;33m[WARN][0m Poll: failed to parse response (elapsed: 170s), body: {"caseNumber":"2603250010001221","operation":{"caseNumber":"2603250010001221","operationType":"full-process","startedAt":"2026-03-28T13:56:57.256Z"}}
[0;34m[INFO][0m Still running... (elapsed: 170s, op_active=unknown)
[0;34m[INFO][0m Phase: casework:post-judge (elapsed: 180s)
[0;32m[PASS][0m Completion detected via timing.json fallback (elapsed: 180s)
[0;32m[PASS][0m Casework completed
[0;34m[INFO][0m Verifying expected outputs...
[0;31m[FAIL][0m File missing: /c/Users/fangkun/Documents/Claude Code Projects/EngineerBrain/cases/active/2603250010001221/case-summary.md
[0;34m[INFO][0m Result written to /c/Users/fangkun/Documents/Claude Code Projects/EngineerBrain/tests/results/0-regression-entitlement-display.json

[0;34m[INFO][0m === E2E Test Summary ===
[0;34m[INFO][0m Test: regression-entitlement-display
[0;34m[INFO][0m Workflow: casework
[0;34m[INFO][0m Status: fail
[0;34m[INFO][0m Assertions: 3 passed, 1 failed (total 4)
[0;34m[INFO][0m Duration: 220118ms
[0;34m[INFO][0m --- Teardown: Restoring backup ---
[0;34m[INFO][0m Backup restored and cleaned up
```

## Verdict

❌ FIX NOT VERIFIED — test still fails

Action: Move back to fixQueue with increased retryCount
