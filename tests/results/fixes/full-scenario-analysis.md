# Fix Analysis: full-scenario

**Round:** 0
**Category:** workflow-e2e
**Source:** playbooks/guides/casework-evolution-loop.md — Scenario A
**Failure Type:** logic_error
**Is Env Issue:** false
**Analyzed At:** 2026-03-28T08:15:33Z

## Failed Assertions

Could not parse assertions

## Full Result

```json
{
  "testId": "full-scenario",
  "round": 0,
  "category": "workflow-e2e",
  "status": "fail",
  "steps": [
    {
      "step": 1,
      "action": "backup",
      "status": "pass",
      "detail": "Backed up 14 files from case/2603100030005863 to /tmp/test-framework-backup/2603100030005863"
    },
    {
      "step": 2,
      "action": "clean",
      "status": "pass",
      "detail": "Deleted all local data except case-info.md — case dir contains only: case-info.md"
    },
    {
      "step": 3,
      "action": "run_casework",
      "status": "fail",
      "detail": "e2e-runner.sh fired POST /api/case/2603100030005863/process → HTTP 202 (async). Runner immediately verified outputs without waiting for async completion — all 4 output files missing. Runner duration: 24691ms. Root cause: e2e-runner.sh lacks polling/wait logic for async casework workflow."
    },
    {
      "step": 4,
      "action": "verify_outputs",
      "status": "fail",
      "detail": "All expected output files were missing after casework attempt: case-summary.md, casehealth-meta.json, timing.json, todo/ — async casework did not complete within verification window."
    },
    {
      "step": 5,
      "action": "restore",
      "status": "pass",
      "detail": "Restored 14 files from backup to case/2603100030005863. Backup cleaned up. Restored files include: case-summary.md, casehealth-meta.json, timing.json, todo/ (5 files), drafts/, emails.md, inspection files, etc."
    }
  ],
  "assertions": {
    "case_summary_exists": false,
    "casehealth_meta_valid": false,
    "timing_json_valid": false,
    "todo_exists": false
  },
  "duration_ms": 30452,
  "error": "Casework API returned HTTP 202 (async) but e2e-runner.sh verified outputs immediately without polling for completion — 4 of 6 assertions failed. Root cause: missing async wait/poll logic in execute_casework_test() in e2e-runner.sh.",
  "timestamp": "2026-03-28T07:02:26.713Z"
}
```

## Suggested Fix Approach

1. Read failed assertion details carefully
2. Compare actual vs expected values
3. Trace through the relevant source code

## Files to Examine

- Test definition: `tests/registry/workflow-e2e/full-scenario.yaml`
- Source: `playbooks/guides/casework-evolution-loop.md — Scenario A`
- Result: `tests/results/0-full-scenario.json`
