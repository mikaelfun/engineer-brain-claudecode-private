## TEST Phase — Execute tests in batch

**Goal**: Run all tests in testQueue, spawn isolated subagent per test.

**Execution**: Main session orchestrates loop, spawns per-test agents.

### 🔴 Step -1: Start Timer (MANDATORY)
```bash
START_TS=$(date +%s%3N)
echo '{"stages":{"TEST":{"status":"running","startedAt":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}}}' | bash tests/executors/state-writer.sh --target pipeline --merge
```

### Batch Loop

1. **Before loop**: Snapshot testQueue (prevent mid-loop mutation confusion)
2. **For each test in testQueue** (sequential, index `i` from 0):

   a. Read `tests/registry/{category}/{id}.yaml` for test definition
   b. Check `safety_level` — BLOCKED → skip, stats.skipped++, write to skipRegistry:
      ```
      skipRegistry.push({ testId, reason: "safety:blocked", cycle, reviewable: false })
      ```
   c. Set `currentTest = testId` and report progress:
      ```bash
      echo '{"currentTest":"{testId}","stageProgress":{"current":'$((i+1))',"total":{TOTAL},"testId":"{testId}"}}' | bash tests/executors/state-writer.sh --target pipeline --merge
      ```
   d. **Spawn agent by category**:

   | Category | Agent | Tools | Executor |
   |----------|-------|-------|----------|
   | backend-api | sonnet | Bash, Read, Write | `api-runner.sh {id} {cycle}` |
   | ui-interaction | haiku | Playwright MCP only | `ui-runner.sh {id} {cycle}` |
   | ui-visual | haiku | Playwright MCP only | `visual-runner.sh {id} {cycle}` |
   | workflow-e2e | sonnet | Bash, Read, Write | `e2e-runner.sh {id} {cycle}` |
   | observability | sonnet | Bash, Read, Write | `observability-runner.sh {id} {cycle}` |
   | unit-test | sonnet | Bash, Read, Write | `unit-runner.sh {id} {cycle}` |

   **Each agent prompt includes**: read env.yaml, read test definition YAML, read safety.yaml, read learnings.yaml, execute runner, write result to `tests/results/{cycle}-{id}.json`.

   e. **After agent returns — update state immediately**:
      - Read `tests/results/{cycle}-{id}.json`
      - PASS → remove from testQueue, cumulative.passed++, cycleStats.passed++
      - FAIL → move to fixQueue, cumulative.failed++, cycleStats.failed++
      - Update both cumulative and cycleStats in one call:
        `echo '{"cumulative":{"passed":N},"cycleStats":{"passed":M}}' | bash tests/executors/state-writer.sh --target stats --merge`
      - Append stageHistory (testId, result, duration)
      - Clear `currentTest`

   **e2. 写入事件**

   测试通过：
   ```bash
   bash tests/executors/event-writer.sh \
     --type feature_verified --impact "${ITEM_IMPACT:-P3}" --result pass \
     --area "{category}" --detail "{testId} 验证通过" || true
   ```

   测试失败：
   ```bash
   bash tests/executors/event-writer.sh \
     --type feature_verified --impact "${ITEM_IMPACT:-P3}" --result fail \
     --area "{category}" --detail "{testId} 验证失败: {failure_summary}" || true
   ```

   如果失败分析确认是 bug（非测试本身问题）：
   ```bash
   bash tests/executors/event-writer.sh \
     --type bug_discovered --impact "${ITEM_IMPACT:-P3}" \
     --area "{category}" --detail "{root cause summary}" || true
   ```

   f. Continue to next test

3. **After loop — decide next phase**:
   - fixQueue non-empty → currentStage=FIX
   - fixQueue empty → cycle++, currentStage=SCAN
