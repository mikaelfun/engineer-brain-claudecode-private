## FIX Phase — Analyze and fix failed tests

**Goal**: Process fixQueue — analyze root cause and fix code for each failed test.

**Execution**: Main session orchestrates, spawns opus agents for code fixes.

### Sorting

Sort fixQueue by `priority` (ascending, default 5). `category: "framework"` items (priority=1) go first.

### Batch Loop

1. **Before loop**: Sort fixQueue by priority, snapshot
2. **For each fix in fixQueue** (by priority order):

   a. Set `state.json.currentTest = testId`

   **⚠️ Progress visibility** — write progress file before spawning:
   ```bash
   cat > tests/results/.progress-{testId}.json << EOF
   {"testId":"{testId}","type":"fix","step":"agent_spawn","detail":"Spawning opus agent for code fix","elapsed_s":0,"timestamp":"$(date -u +%Y-%m-%dT%H:%M:%SZ)"}
   EOF
   ```
   After agent returns: `rm -f tests/results/.progress-{testId}.json`

   b. **Determine fix type**:
      - `category === "framework"` → **Framework Fix Path**
      - Otherwise → **Test Fix Path**

   ### Framework Fix Path

   **If fixQueue item has `retroContext`** (from Phase Retrospective):
   - Extract targetFile/targetLine/rootCause from retroContext
   - Spawn opus agent with precise fix instructions:
     ```
     你是一个测试框架修复工程师。
     Phase Retrospective 发现的框架逻辑 bug：
     - 异常: {retroContext.anomaly}
     - 根因: {retroContext.rootCause}
     - 目标文件: {retroContext.targetFile}
     修复后调用: bash tests/executors/fix-recorder.sh <test-id> "framework_fix" "<desc>" "<files>"
     ```

   **Otherwise** (from pattern-detector):
   - Read `tests/results/fixes/{pattern-id}-self-heal.md`
   - Spawn opus agent to fix infrastructure code, call fix-recorder.sh

   ### Test Fix Path

   c. **Run fix-analyzer** (Main Agent directly):
      ```bash
      bash tests/executors/fix-analyzer.sh <test-id> <round>
      ```
      Output: `FIX_ANALYSIS|testId|failureType|isEnvIssue|analysisFile`

   d. **Based on analysis**:
      - `isEnvIssue=true` → Main Agent handles directly (adjust config/env), call learnings-writer.sh
      - `isEnvIssue=false` → Spawn opus agent:
        ```
        你是一个 bug 修复工程师。
        读取 tests/results/fixes/{id}-analysis.md 了解根因。
        读取 tests/registry/{category}/{id}.yaml 了解测试定义。
        读取 tests/learnings.yaml 了解已知问题。
        修改完成后调用: bash tests/executors/fix-recorder.sh <test-id> <fix-type> "<desc>" "<files>"
        ```

   e. **fix-recorder.sh auto-actions**: records fix details, moves test fixQueue→verifyQueue, runs regression-tracker for code_bug, calls learnings-writer for env_issue.

   f. **After agent returns — update state.json**:
      - Fix success → phaseHistory: `{ phase: "FIX", action: "fix_pass", testId, fixType, ... }`
      - Fix failure → phaseHistory: `{ phase: "FIX", action: "fix_fail", testId, reason, ... }`
        - retryCount++; if retryCount >= 3 → stats.skipped++, write to skipRegistry: `{ testId, reason: "retry:exhausted", reviewable: true }`
      - Clear `currentTest`
   g. Continue next fix

3. **After loop**: phase=VERIFY
