## VALIDATE Phase — Filter fixQueue before FIX

**Goal**: Review each fixQueue item to determine if it's worth fixing, stale, or an env issue.

**Execution**: Main session runs validate-runner.js per item, LLM review only for needs_review.

### 🔴 Step -1: Start Timer (MANDATORY)
```bash
START_TS=$(date +%s%3N)
echo '{"stages":{"VALIDATE":{"status":"running","startedAt":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}}}' | bash tests/executors/state-writer.sh --target pipeline --merge
```

### Batch Loop

1. **Before loop**: Snapshot fixQueue, init counters (staleCount, envCount, fwCount, reviewCount, fixCount)
2. **For each item in fixQueue** (sequential, index `i` from 0):

   a. Set progress:
   ```bash
   echo '{"currentTest":"{testId}","stageProgress":{"current":'$((i+1))',"total":{TOTAL},"testId":"{testId}"}}' | bash tests/executors/state-writer.sh --target pipeline --merge
   ```

   b. **Run validate-runner.js** (Main Agent directly):
   ```bash
   node tests/executors/validate-runner.js --test-id {testId} --category {category} --fail-reason "{failReason}"
   ```
   Output: `{ verdict, layer, reason, llmPrompt? }`

   c. **Process by verdict**:

   | verdict | action |
   |---------|--------|
   | `stale` | Remove from fixQueue. Move YAML to `tests/registry/_stale/`. Run `node tests/executors/feature-map-writer.js --action mark-stale --test-id {testId}`. staleCount++ |
   | `env_issue` | Move to retryQueue (keep in fixQueue, mark `isEnvIssue: true`). envCount++ |
   | `framework` | Keep in fixQueue, set `fixLevel: "L1"`, `category: "framework"`, `priority: 1`. fwCount++ |
   | `needs_review` | Execute LLM review (see Step d). reviewCount++ |
   | `fix` | Keep in fixQueue unchanged. fixCount++ |

   d. **LLM Review** (only for `needs_review` verdict):

   Read the `llmPrompt` from validate-runner output. Main Agent performs the reasoning directly:

   **Input context**:
   - Test YAML definition (`tests/registry/{category}/{testId}.yaml`)
   - Fail reason from TEST phase
   - Related source code files (key snippets only)

   **Reasoning question**:
   "测试期望行为 X，代码实际行为 Y。这是代码 bug（应该修代码）还是设计变更（应该更新测试）？"

   **LLM output → verdict override**:
   - `fix` → keep in fixQueue. fixCount++
   - `stale` → same as stale handling above. staleCount++
   - `redesign` → remove from fixQueue, create Issue:
     ```bash
     bash tests/executors/issue-creator.sh "{testId}" "{cycle}" "设计变更: {reason}" "{description}" "P2" ""
     ```
     Archive test YAML to `tests/registry/_stale/`. Run feature-map mark-stale.

   e. **Write event** (for stale/redesign items):
   ```bash
   bash tests/executors/event-writer.sh \
     --type feature_verified --impact "${ITEM_IMPACT:-P3}" --result stale \
     --area "{category}" --detail "{testId} 判定为 {verdict}: {reason}" || true
   ```

   f. Clear `currentTest`, continue next item

3. **After loop — update state**:
   - Write filtered fixQueue (only fix + framework + env_issue items remain)
   - Update stats:
     ```bash
     echo '{"cycleStats":{"validated_stale":'$staleCount',"validated_fix":'$fixCount'}}' | bash tests/executors/state-writer.sh --target stats --merge
     ```
   - Decide next phase:
     - fixQueue non-empty → currentStage=FIX
     - fixQueue empty → cycle++, currentStage=SCAN
