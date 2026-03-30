# Verify Result: wf-teams-search

**Round:** 7 (previous failure: Round 6)
**Category:** workflow-e2e
**Status:** fail
**Assertions:** 1/2
**Verified At:** 2026-03-28T19:30:10Z

## Previous Failures



## Executor Output

```
[0;34m[INFO][0m === E2E Test Runner ===
[0;34m[INFO][0m Test: wf-teams-search (Round 7)
[0;34m[INFO][0m Definition: /c/Users/fangkun/Documents/Claude Code Projects/EngineerBrain/tests/registry/workflow-e2e/wf-teams-search.yaml
[0;34m[INFO][0m Backend healthy at http://localhost:3010
[0;34m[INFO][0m JWT generated
[0;34m[INFO][0m Test case: 2601290030000748
[0;34m[INFO][0m Case dir: /c/Users/fangkun/Documents/Claude Code Projects/EngineerBrain/cases/active/2601290030000748
[0;34m[INFO][0m --- Setup: Backup ---
[0;34m[INFO][0m Backup created at: /tmp/e2e-backup-wf-teams-search-1774726197
[0;34m[INFO][0m Workflow type: single_step
[0;34m[INFO][0m Starting E2E test execution...
[0;34m[INFO][0m --- Executing single-step workflow: data-refresh ---
[0;34m[INFO][0m Removing stale timing.json from previous run
[0;34m[INFO][0m POST /api/case/2601290030000748/step/data-refresh
[0;31m[FAIL][0m Step failed: HTTP 409 — {"error":"Case already has an active operation","activeOperation":{"caseNumber":"2601290030000748","operationType":"full-process","startedAt":"2026-03-28T19:20:04.919Z"}}
[0;34m[INFO][0m Result written to /c/Users/fangkun/Documents/Claude Code Projects/EngineerBrain/tests/results/7-wf-teams-search.json

[0;34m[INFO][0m === E2E Test Summary ===
[0;34m[INFO][0m Test: wf-teams-search
[0;34m[INFO][0m Workflow: single_step
[0;34m[INFO][0m Status: fail
[0;34m[INFO][0m Assertions: 1 passed, 1 failed (total 2)
[0;34m[INFO][0m Duration: 27823ms
[0;34m[INFO][0m --- Teardown: Restoring backup ---
[0;34m[INFO][0m Backup restored and cleaned up
```

## Verdict

❌ FIX NOT VERIFIED — test still fails

Action: Move back to fixQueue with increased retryCount
