## FIX Phase — Analyze and fix failed tests

**Goal**: Process fixQueue — analyze root cause and fix code for each failed test.

**Execution**: Main session orchestrates, spawns opus agents for code fixes.

### 🔴 Step -1: Start Timer (MANDATORY)
```bash
START_TS=$(date +%s%3N)
echo '{"stages":{"FIX":{"status":"running","startedAt":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}}}' | bash tests/executors/state-writer.sh --target pipeline --merge
```

### Sorting

Sort fixQueue by `priority` (ascending, default 5). `category: "framework"` items (priority=1) go first.

### Batch Loop

1. **Before loop**: Sort fixQueue by priority, snapshot
2. **For each fix in fixQueue** (by priority order, index `i` from 0):

   a. Set `currentTest = testId` and report progress:
   ```bash
   echo '{"currentTest":"{testId}","stageProgress":{"current":'$((i+1))',"total":{TOTAL},"testId":"{testId}"}}' | bash tests/executors/state-writer.sh --target pipeline --merge
   ```

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

   c2. **Recipe lookup** (Main Agent, advisory — skip if `tests/recipes/fix/_index.md` not found):
      1. Read `tests/recipes/fix/_index.md`
      2. Match `failureType` + error messages from `analysisFile` against the Failure Signature column (priority order)
      3. Result: `matchedRecipe` (filename, e.g. `env-service-down.md`) or `null`
      - ⚠️ Recipe 查询是 advisory，文件不存在时静默跳过，等价于 `matchedRecipe = null`

   d. **Based on analysis + recipe**:
      - `isEnvIssue=true` → Main Agent handles directly (adjust config/env), call learnings-writer.sh _(unchanged)_
      - `isEnvIssue=false` AND `matchedRecipe != null` → **Recipe-guided fix**:
        1. Read `tests/recipes/fix/{matchedRecipe}` — follow 前置检查 + 执行步骤
        2. Execute: env/config recipes → Main Agent directly; code change recipes → spawn sonnet with recipe as context
        3. Record: `bash tests/executors/fix-recorder.sh <test-id> <fix-type> "<desc>" "<files>" "<matchedRecipe>"`
      - `isEnvIssue=false` AND `matchedRecipe == null` → Spawn opus agent _(fallback, unchanged)_:
        ```
        你是一个 bug 修复工程师。
        读取 tests/results/fixes/{id}-analysis.md 了解根因。
        读取 tests/registry/{category}/{id}.yaml 了解测试定义。
        读取 tests/learnings.yaml 了解已知问题。
        修改完成后调用: bash tests/executors/fix-recorder.sh <test-id> <fix-type> "<desc>" "<files>"
        ```

   e. **fix-recorder.sh auto-actions**: records fix details, moves test fixQueue→verifyQueue, runs regression-tracker for code_bug, calls learnings-writer for env_issue.

   e2. **LLM 推理分类：Infrastructure vs Product Bug**（仅 `code_bug` 类型触发）

   > **目的**：判断修复的是测试基础设施问题还是产品缺陷。产品缺陷自动创建 Issue，实现 test-loop → Issue Tracker 反向追溯。

   **跳过条件**（不执行推理）：
   - `fixType === "env_issue"` → 天然是环境问题，跳过
   - `fixType === "framework_fix"` → 天然是框架问题，跳过
   - `category === "framework"` → 框架类测试，跳过

   **推理输入**（Main Agent 直接读取，不 spawn agent）：
   - `tests/results/fixes/{testId}-analysis.md` — 根因分析
   - `tests/results/fixes/{testId}-fix.md` — 修复报告（含 modified files 和 diff）
   - 修复涉及的文件路径列表

   **推理判断维度**（由 LLM 综合推理，非规则匹配）：
   - **文件路径信号**：修改的文件在 `tests/`、`tests/executors/`、`tests/registry/` → 倾向 infrastructure；修改在 `skills/`、`playbooks/`、`dashboard/src/`、`.claude/skills/` → 倾向 product
   - **错误性质**：YAML 格式、assertion 逻辑、executor 脚本 bug → infrastructure；业务流程缺步骤、模板错误、API 逻辑 bug → product
   - **影响范围**：仅影响测试能否运行 → infrastructure；影响用户可见的功能行为 → product

   **推理输出**（Main Agent 内部决策，不写文件）：
   ```
   classification: "infrastructure" | "product"
   priority: "P0" | "P1" | "P2"  (仅 product 时)
   title: "一句话描述"            (仅 product 时)
   description: "详细描述"        (仅 product 时)
   ```

   **如果 classification === "product"**：
   ```bash
   bash tests/executors/issue-creator.sh "<testId>" "<cycle>" "<title>" "<description>" "<priority>" "tests/results/fixes/<testId>-fix.md"
   ```
   - 脚本自动去重（同 testId 已有 Issue 则跳过）
   - 输出 `ISSUE_CREATED|ISS-XXX|testId` 或 `ISSUE_EXISTS|ISS-XXX|testId`
   - 记录到 stageHistory：`{ ..., issueCreated: "ISS-XXX" }` 或 `{ ..., issueCreated: null }`

   **如果 classification === "infrastructure"**：
   - 不创建 Issue，仅在 stageHistory 中标记 `issueClassification: "infrastructure"`

   f. **After agent returns — update state**:
      - Fix success → stageHistory: `{ stage: "FIX", action: "fix_pass", testId, fixType, recipeUsed, ... }`
      - Fix failure → stageHistory: `{ stage: "FIX", action: "fix_fail", testId, reason, recipeUsed, ... }`
        - retryCount++; if retryCount >= 3 → stats.skipped++, write to skipRegistry: `{ testId, reason: "retry:exhausted", reviewable: true }`
      - Clear `currentTest`
   g. Continue next fix

3. **After loop**: currentStage=VERIFY
