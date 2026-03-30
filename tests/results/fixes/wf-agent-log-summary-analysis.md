# Fix Analysis: wf-agent-log-summary

**Round:** 20
**Category:** workflow-e2e
**Source:** ISS-136 / conductor/tracks/agent-log-visible_20260329/spec.md
**Failure Type:** logic_error
**Is Env Issue:** false
**Analyzed At:** 2026-03-29T03:22:16Z

## Failed Assertions

Could not parse assertions

## Full Result

```json
{
  "testId": "wf-agent-log-summary",
  "round": 20,
  "status": "fail",
  "assertions": {
    "total": 5,
    "passed": 0,
    "failed": 5
  },
  "failureType": "test_design",
  "details": {
    "root_cause": "executionSummary only broadcast via SSE 'case-step-completed' event, not persisted in GET /operation endpoint. After step completes, operation=null.",
    "step2_response": "{\"caseNumber\":\"2603090040000814\",\"operation\":null}",
    "assertion_failures": [
      "AC1: executionSummary field not in operation response (operation=null)",
      "AC2: executionSummary.toolCalls type check fails (field absent)",
      "AC3: executionSummary.mcpServers not in response",
      "AC4: executionSummary.agentType not in response",
      "AC5: executionSummary.turns not in response"
    ],
    "evidence": "buildExecutionSummary() called but only sent via sseManager.broadcast('case-step-completed'), not stored for REST retrieval. steps.ts:427-432"
  },
  "duration_ms": 120000,
  "timestamp": "2026-03-29T03:15:30Z"
}
```

## Suggested Fix Approach

1. Read failed assertion details carefully
2. Compare actual vs expected values
3. Trace through the relevant source code

## Root Cause Trace

_Not applicable — failure type (logic_error) did not trigger root cause trace._

## Files to Examine

- Test definition: `tests/registry/workflow-e2e/wf-agent-log-summary.yaml`
- Source: `ISS-136 / conductor/tracks/agent-log-visible_20260329/spec.md`
- Result: `tests/results/20-wf-agent-log-summary.json`

