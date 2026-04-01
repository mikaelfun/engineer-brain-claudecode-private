## VERIFY Phase — Confirm fixes are effective

**Goal**: Re-run tests in verifyQueue to confirm fixes work, handle regressions.

**Execution**: Main session orchestrates, uses verify-rerun.sh per test.

### 🔴 Step -1: Start Timer (MANDATORY)
```bash
START_TS=$(date +%s%3N)
echo '{"stages":{"VERIFY":{"status":"running","startedAt":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}}}' | bash tests/executors/state-writer.sh --target pipeline --merge
```

### Batch Loop (verifyQueue)

1. **Before loop**: Snapshot verifyQueue
2. **For each test in verifyQueue** (index `i` from 0):

   a. Set `currentTest = testId` and report progress:
      ```bash
      echo '{"currentTest":"{testId}","stageProgress":{"current":'$((i+1))',"total":{TOTAL},"testId":"{testId}"}}' | bash tests/executors/state-writer.sh --target pipeline --merge
      ```

   a½. **Framework fix auto-accept**: If item has `fixType === "framework_fix"`:
      - **Skip test execution** — do NOT call verify-rerun.sh (framework fixes patch the harness itself, not a specific test)
      - Directly mark as verified: stats.passed++, remove from verifyQueue
      - stageHistory: `{ stage: "VERIFY", action: "verify_pass_framework_fix", testId, cycle, timestamp }`
      - Clear `currentTest`
      - **Continue** to next item (skip steps b/c)

   b. Run verification:
      ```bash
      bash tests/executors/verify-rerun.sh <test-id> <round>
      ```
      Output: `VERIFY_RESULT|testId|pass|5/5` or `VERIFY_RESULT|testId|fail|3/5`

   c. **Update state immediately**:
      - **PASS** → stats.fixed++, remove from verifyQueue
        - stageHistory: `{ stage: "VERIFY", action: "verify_pass", testId, ... }`
        - If observability probe PASS → run `bash tests/executors/baseline-updater.sh <test-id>`
      - **FAIL** → back to fixQueue, retryCount++
        - stageHistory: `{ stage: "VERIFY", action: "verify_fail", testId, ... }`
        - If retryCount >= 3 → stats.skipped++, write to skipRegistry: `{ testId, reason: "retry:exhausted (retryCount=N)", reviewable: true }`
      - Clear `currentTest`

   **c2. 写入事件**

   验证通过（修复成功）：
   ```bash
   FIX_METHOD="direct"
   [[ -f "tests/results/fix-proposals/${testId}-conservative.json" ]] && FIX_METHOD="competitive"
   bash tests/executors/event-writer.sh \
     --type bug_fixed --impact "${ITEM_IMPACT:-P3}" \
     --area "{category}" --detail "{testId} 修复验证通过" \
     --method "$FIX_METHOD" || true
   ```

   验证失败（修复无效）：
   ```bash
   bash tests/executors/event-writer.sh \
     --type fix_failed --impact "${ITEM_IMPACT:-P3}" \
     --area "{category}" --detail "{testId} 修复验证失败 (retry ${retryCount})" || true
   ```

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
   - fixQueue non-empty (FAIL bounced back or regression) → currentStage=FIX
   - fixQueue empty + testQueue non-empty → currentStage=TEST
   - All empty → cycle++, currentStage=SCAN

6. **On cycle switch** → generate stats: `bash tests/executors/stats-reporter.sh <cycle>`
