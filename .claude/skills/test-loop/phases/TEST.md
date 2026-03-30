## TEST Phase — Execute tests in batch

**Goal**: Run all tests in testQueue, spawn isolated subagent per test.

**Execution**: Main session orchestrates loop, spawns per-test agents.

### 🔴 Step -1: Start Timer (MANDATORY)
```bash
START_TS=$(date +%s%3N)
echo '{"roundJourney":{"TEST":{"status":"running","startedAt":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}}}' | bash tests/executors/state-writer.sh --merge
```

### Batch Loop

1. **Before loop**: Snapshot testQueue (prevent mid-loop mutation confusion)
2. **For each test in testQueue** (sequential, index `i` from 0):

   a. Read `tests/registry/{category}/{id}.yaml` for test definition
   b. Check `safety_level` — BLOCKED → skip, stats.skipped++, write to skipRegistry:
      ```
      state.skipRegistry.push({ testId, reason: "safety:blocked", round, reviewable: false })
      ```
   c. Set `state.json.currentTest = testId` and report progress:
      ```bash
      echo '{"currentTest":"{testId}","phaseProgress":{"current":'$((i+1))',"total":{TOTAL},"testId":"{testId}"}}' | bash tests/executors/state-writer.sh --merge
      ```
   d. **Spawn agent by category**:

   | Category | Agent | Tools | Executor |
   |----------|-------|-------|----------|
   | backend-api | sonnet | Bash, Read, Write | `api-runner.sh {id} {round}` |
   | ui-interaction | haiku | Playwright MCP only | `ui-runner.sh {id} {round}` |
   | ui-visual | haiku | Playwright MCP only | `visual-runner.sh {id} {round}` |
   | workflow-e2e | sonnet | Bash, Read, Write | `e2e-runner.sh {id} {round}` |
   | observability | sonnet | Bash, Read, Write | `observability-runner.sh {id} {round}` |
   | unit-test | sonnet | Bash, Read, Write | `unit-runner.sh {id} {round}` |

   **Each agent prompt includes**: read env.yaml, read test definition YAML, read safety.yaml, read learnings.yaml, execute runner, write result to `tests/results/{round}-{id}.json`.

   e. **After agent returns — update state.json immediately**:
      - Read `tests/results/{round}-{id}.json`
      - PASS → remove from testQueue, stats.passed++
      - FAIL → move to fixQueue, stats.failed++
      - Append phaseHistory (testId, result, duration)
      - Clear `currentTest`
   f. Continue to next test

3. **After loop — decide next phase**:
   - fixQueue non-empty → phase=FIX
   - fixQueue empty → round++, phase=SCAN
