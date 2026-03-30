# Fix Analysis: error-recovery

**Round:** 0
**Category:** workflow-e2e
**Source:** playbooks/guides/casework-evolution-loop.md — Scenario E
**Failure Type:** logic_error
**Is Env Issue:** false
**Analyzed At:** 2026-03-28T10:41:39Z

## Failed Assertions

Could not parse assertions

## Full Result

```json
{
  "testId": "error-recovery",
  "round": 0,
  "category": "workflow-e2e",
  "status": "fail",
  "steps": [
    {
      "step": 1,
      "action": "backup",
      "status": "pass",
      "detail": "Backed up 13 files from cases/active/2603250010001221 to /tmp/test-framework-backup/2603250010001221"
    },
    {
      "step": 2,
      "action": "run_e2e_runner",
      "status": "fail",
      "detail": "e2e-runner.sh completed (exit code 1 — test assertions failed). Runner limitations: (1) 'corrupt_file' and 'delete_dir' setup actions not implemented — fault injection skipped; (2) casework is async (HTTP 202) and runner verified outputs immediately without polling for completion. 2 of 4 assertions failed."
    },
    {
      "step": 3,
      "action": "verify_outputs",
      "status": "fail",
      "detail": "Result file exists at tests/results/0-error-recovery.json (written by runner). POST /api/case/:id/process → HTTP 202 (PASS); case-summary.md → missing (FAIL); casehealth-meta.json valid_json → not found (FAIL). Root cause: fault injection was never executed; async casework outputs were checked before completion."
    },
    {
      "step": 4,
      "action": "restore",
      "status": "pass",
      "detail": "Restored 13 files to cases/active/2603250010001221. Runner also performed its own internal backup/restore via EXIT trap. Case directory verified clean after restore."
    }
  ],
  "assertions": {
    "runner_completed": true,
    "case_summary_exists": false,
    "meta_valid_json": false
  },
  "runner_raw_assertions": [
    {"name": "Setup: backup created", "pass": true, "expected": "backup exists", "actual": "created at /tmp/e2e-backup-error-recovery-1774682421"},
    {"name": "POST /api/case/:id/process", "pass": true, "expected": "200|202", "actual": "202"},
    {"name": "File exists: case-summary.md", "pass": false, "expected": "exists", "actual": "missing"},
    {"name": "Content match: casehealth-meta.json", "pass": false, "expected": "valid_json", "actual": "not found"}
  ],
  "failure_analysis": {
    "root_cause": "e2e-runner does not implement 'corrupt_file'/'delete_dir' YAML actions — fault injection was silently skipped. Casework API is async (HTTP 202) and runner checks outputs immediately without waiting for completion.",
    "fault_injection_executed": false,
    "casework_api_responded": true,
    "casework_http_status": 202,
    "runner_framework_gap": "Needs: (1) implement corrupt_file/delete_dir setup actions in e2e-runner.sh, (2) poll for casework completion before verifying outputs"
  },
  "duration_ms": 25364,
  "error": "2 of 4 assertions failed — fault injection not executed, outputs not produced in async window",
  "timestamp": "2026-03-28T07:20:59.000Z"
}
```

## Suggested Fix Approach

1. Read failed assertion details carefully
2. Compare actual vs expected values
3. Trace through the relevant source code

## Files to Examine

- Test definition: `tests/registry/workflow-e2e/error-recovery.yaml`
- Source: `playbooks/guides/casework-evolution-loop.md — Scenario E`
- Result: `tests/results/0-error-recovery.json`
