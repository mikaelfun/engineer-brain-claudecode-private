# Verify Result: regression-days-contact

**Round:** 0 (previous failure: Round -1)
**Category:** workflow-e2e
**Status:** pass
**Assertions:** 5/5
**Verified At:** 2026-03-28T13:54:34Z

## Previous Failures



## Executor Output

```
[0;34m[INFO][0m Removing stale timing.json from previous run
[0;34m[INFO][0m POST /api/case/2603090040000814/process
[0;32m[PASS][0m Process started: HTTP 202
[0;34m[INFO][0m Async operation — polling for completion (timeout: 360s)...
[0;34m[INFO][0m Polling GET /api/case/2603090040000814/operation (interval=10s, timeout=360s)...
[0;34m[INFO][0m Phase: casework:post-judge (elapsed: 10s)
[0;33m[WARN][0m Poll: failed to parse response (elapsed: 10s), body: {"caseNumber":"2603090040000814","operation":{"caseNumber":"2603090040000814","operationType":"full-process","startedAt":"2026-03-28T13:53:43.823Z"}}
[0;34m[INFO][0m Still running... (elapsed: 10s, op_active=unknown)
[0;34m[INFO][0m Phase: casework:changegate_done (elapsed: 20s)
[0;33m[WARN][0m Poll: failed to parse response (elapsed: 20s), body: {"caseNumber":"2603090040000814","operation":{"caseNumber":"2603090040000814","operationType":"full-process","startedAt":"2026-03-28T13:53:43.823Z"}}
[0;34m[INFO][0m Still running... (elapsed: 20s, op_active=unknown)
[0;34m[INFO][0m Phase: casework:statusJudge_done (elapsed: 30s)
[0;33m[WARN][0m Poll: failed to parse response (elapsed: 30s), body: {"caseNumber":"2603090040000814","operation":{"caseNumber":"2603090040000814","operationType":"full-process","startedAt":"2026-03-28T13:53:43.823Z"}}
[0;34m[INFO][0m Still running... (elapsed: 30s, op_active=unknown)
[0;34m[INFO][0m Phase: casework:timing (elapsed: 40s)
[0;32m[PASS][0m Completion detected via timing.json fallback (elapsed: 40s)
[0;32m[PASS][0m Casework completed
[0;34m[INFO][0m Verifying expected outputs...
[0;32m[PASS][0m JSON field daysSinceLastContact is not null
[0;32m[PASS][0m File exists: todo
[0;34m[INFO][0m Result written to /c/Users/fangkun/Documents/Claude Code Projects/EngineerBrain/tests/results/0-regression-days-contact.json

[0;34m[INFO][0m === E2E Test Summary ===
[0;34m[INFO][0m Test: regression-days-contact
[0;34m[INFO][0m Workflow: casework
[0;34m[INFO][0m Status: pass
[0;34m[INFO][0m Assertions: 5 passed, 0 failed (total 5)
[0;34m[INFO][0m Duration: 74748ms
[0;34m[INFO][0m --- Teardown: Restoring backup ---
[0;34m[INFO][0m Backup restored and cleaned up
```

## Verdict

✅ FIX VERIFIED — test now passes

Action: Remove from verifyQueue, increment stats.fixed
