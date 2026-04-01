# Fix Report: framework-fix-34a

**Test ID:** framework-fix-34a
**Fix Type:** framework_fix
**Description:** health-check.sh reads authoritative pipelineStatus from pipeline.json and includes in output
**Modified Files:** tests/executors/health-check.sh
**Fixed At:** 2026-03-31T12:25:00Z
**Recipe Used:** none

## Root Cause (ISS-180 gap)

health-check.sh was not:
1. Reading `pipelineStatus` field from pipeline.json
2. Including it in diagnostic output
3. Using `stages[phase].status` from pipeline.json authoritatively — it was unconditionally overwriting with heuristics like `(currentStage === 'TEST') ? 'running' : 'done'`

## What Was Fixed

1. Added `pipelineStatus = pipeline.pipelineStatus || 'idle'` to the pipeline.json read block
2. Added `pipelineStatus` as `let` variable declaration in outer scope
3. Changed stage status heuristics from unconditional override to fallback-only:
   `stages.TEST.status = stages.TEST.status !== 'pending' ? stages.TEST.status : (currentStage === 'TEST' ? 'running' : 'pending')`
4. Added `pipelineStatus` to the final output JSON object

## Modified Files

- `tests/executors/health-check.sh`
