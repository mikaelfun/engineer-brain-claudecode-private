## VERIFY Phase — Confirm fixes are effective

**Goal**: Re-run tests in verifyQueue to confirm fixes work, handle regressions.

**Execution**: Main session orchestrates, uses verify-rerun.sh per test.

### Batch Loop (verifyQueue)

1. **Before loop**: Snapshot verifyQueue
2. **For each test in verifyQueue**:

   a. Set `state.json.currentTest = testId`
   b. Run verification:
      ```bash
      bash tests/executors/verify-rerun.sh <test-id> <round>
      ```
      Output: `VERIFY_RESULT|testId|pass|5/5` or `VERIFY_RESULT|testId|fail|3/5`

   c. **Update state.json immediately**:
      - **PASS** → stats.fixed++, remove from verifyQueue
        - phaseHistory: `{ phase: "VERIFY", action: "verify_pass", testId, ... }`
        - If observability probe PASS → run `bash tests/executors/baseline-updater.sh <test-id>`
      - **FAIL** → back to fixQueue, retryCount++
        - phaseHistory: `{ phase: "VERIFY", action: "verify_fail", testId, ... }`
        - If retryCount >= 3 → stats.skipped++, write to skipRegistry: `{ testId, reason: "retry:exhausted (retryCount=N)", reviewable: true }`
      - Clear `currentTest`
   d. Continue next verify

### Self-Heal Check (after verifyQueue loop, before regressionQueue)

When fixQueue has failed tests bouncing back, run pattern detector:
```bash
bash tests/executors/pattern-detector.sh <round>
```

**If patterns detected** (exit code 0):

- **Systemic pattern** (multiple tests, same signature):
  - Move affected tests out of fixQueue/verifyQueue → skipRegistry (`reason: "systemic:{signature}"`, `reviewable: true`)
  - Create framework fix item at fixQueue **head**: `{ testId: "framework-fix-{pattern-id}", category: "framework", priority: 1 }`
  - Record learning + self-heal action

- **Stuck pattern** (single test, repeated failure):
  - Move to skipRegistry (`reason: "stuck:{signature}"`, `reviewable: true`)
  - Record learning + self-heal action
  - **No** framework fix item

**If no patterns** (exit code 1) → skip, continue

### Regression Queue (after self-heal)

4. For each test in regressionQueue:
   - Re-run with corresponding executor
   - PASS → remove from regressionQueue
   - FAIL → add to fixQueue (regression = new bug)

### Phase Decision

5. After all loops:
   - fixQueue non-empty (FAIL bounced back or regression) → phase=FIX
   - fixQueue empty + testQueue non-empty → phase=TEST
   - All empty → round++, phase=SCAN

6. **On round switch** → generate stats: `bash tests/executors/stats-reporter.sh <round>`
