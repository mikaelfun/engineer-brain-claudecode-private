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

### Step 0.5: Complexity Triage（复杂度分流）

对每个 fixQueue item 在处理时判断复杂度：

**Trivial 条件**（满足任一即为 trivial）：
- 有匹配的 fix recipe（`tests/recipes/fix/_index.md` 命中）
- `category === "framework"`（框架修复走现有路径）
- `isEnvIssue === true`（环境问题）
- fix-analyzer 报告的 failureType 是 `typo`、`config`、`import`
- 预估只涉及 1 个文件改动

**Non-trivial**（以上均不满足）：
- 跨文件改动
- 多种可能根因
- 涉及业务逻辑或架构决策
- 无匹配 recipe 且非环境问题

判断在 fix-analyzer.sh 返回后执行。Trivial → 走现有修复路径（Steps c-e）。Non-trivial → 走竞争修复路径（Step f）。

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

   c3. **Fix Level Determination**（Main Agent，fix-analyzer 返回后执行）：

   从 `analysisFile`（fix-analyzer 输出的分析文件）中提取涉及的文件路径列表 `affectedFiles`。

   **分级规则**（按优先级从高到低判定）：

   | 条件 | Fix Level |
   |------|-----------|
   | **ALL** `affectedFiles` 在 `tests/` 下 | **L1** — 自动修，无限制 |
   | **ANY** `affectedFiles` 在 `dashboard/src/routes/`、`skills/`、`.claude/`、`playbooks/` 下 | **L3** — 只报告不修 |
   | **ANY** `affectedFiles` 在 `dashboard/web/src/` 下，且 **NONE** 在 `dashboard/src/routes/`、`skills/`、`.claude/` 下 | **L2** — 可修，单文件≤30行 |
   | 以上均不匹配 | **L2**（Default） |

   判定后记录：`fixLevel = "L1" | "L2" | "L3"`

   d. **Based on analysis + recipe**:
      - `isEnvIssue=true` → Main Agent handles directly (adjust config/env), call learnings-writer.sh _(unchanged)_
      - `isEnvIssue=false` AND `matchedRecipe != null` → **Recipe-guided fix**:
        1. Read `tests/recipes/fix/{matchedRecipe}` — follow 前置检查 + 执行步骤
        2. Execute: env/config recipes → Main Agent directly; code change recipes → spawn sonnet with recipe as context
        3. Record: `bash tests/executors/fix-recorder.sh <test-id> <fix-type> "<desc>" "<files>" "<matchedRecipe>"`
      - `isEnvIssue=false` AND `matchedRecipe == null` → **按 fixLevel 分流**：
        - **fixLevel === "L3"** → **不 spawn agent，Main Agent 直接处理**：
          1. 读取 `tests/results/fixes/{id}-analysis.md`
          2. 生成报告写入 `tests/results/fixes/{id}-report.md`（含根因、影响范围、建议修复方案）
          3. 创建 Issue：`bash tests/executors/issue-creator.sh "<testId>" "<cycle>" "<title>" "<description>" "P1" "tests/results/fixes/<testId>-analysis.md"`
          4. 调用：`bash tests/executors/fix-recorder.sh <test-id> "report_only" "<desc>" "<files>"`
        - **fixLevel === "L1" 或 "L2"** → Spawn opus agent，prompt 中注入权限约束：
        ```
        你是一个 bug 修复工程师。
        读取 tests/results/fixes/{id}-analysis.md 了解根因。
        读取 tests/registry/{category}/{id}.yaml 了解测试定义。
        读取 tests/learnings.yaml 了解已知问题。

        {fixLevelConstraint}

        修改完成后调用: bash tests/executors/fix-recorder.sh <test-id> <fix-type> "<desc>" "<files>"
        ```

        其中 `{fixLevelConstraint}` 按 fixLevel 替换：
        - **L1**: `"你的修改权限：✅ tests/ 目录下所有文件可自由修改。"`
        - **L2**: `"你的修改权限：✅ tests/ 自由修改；⚠️ dashboard/web/src/ 单文件≤30行；❌ 后端/skills/.claude 禁止。如果 bug 在禁止区域，写报告+创建 Issue，返回 fixType=report_only。"`

   e. **fix-recorder.sh auto-actions**: records fix details, moves test fixQueue→verifyQueue, runs regression-tracker for code_bug, calls learnings-writer for env_issue.

   e1. **report_only fixType 处理**（fixType === "report_only" 时执行，替代正常 verifyQueue 流程）：

   `report_only` 表示因 fixLevel 限制（L3 或 L2 降级）未修改代码，只生成了报告和 Issue。

   - **不进 verifyQueue**（没改代码，无需验证）
   - Record stageHistory：`{ stage: "FIX", action: "report_only", testId, fixLevel, issueCreated: "ISS-XXX" }`
   - Update feature-map：标记该 testId 的 `resolution: "issue_created"`、`fixLevel`
   - 从 fixQueue 移除该 testId
   - 跳过后续 e2（LLM 推理分类），直接进入下一个 fix

   e2. **LLM 推理分类：Infrastructure vs Product Bug**（仅 `code_bug` 类型触发）

   > **目的**：判断修复的是测试基础设施问题还是产品缺陷。产品缺陷自动创建 Issue，实现 stage-worker → Issue Tracker 反向追溯。

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

   ### Step f: 竞争修复路径（Non-trivial Only）

   当 `complexity === "non-trivial"` 时执行：

   **f1. 构建问题包**

   收集以下信息：
   - fix-analyzer.sh 的完整输出（根因分析）
   - 失败的测试定义（`tests/registry/{category}/{testId}.yaml`）
   - 测试结果日志（`tests/results/{testId}/`）
   - 相关源代码文件（根据 fix-analyzer 报告的涉及文件）

   **f2. Spawn 三个并行 fix-proposer agents**

   三个 agent 使用 `isolation: "worktree"` 在独立 worktree 中工作。
   在**同一消息中**发送三个 Agent 工具调用实现并行：

   - **Agent A（保守）**: "你是保守修复专家。目标：最小改动修复问题。优先 workaround，不引入新风险。禁止改动 3 个以上文件。禁止重构。"
   - **Agent B（激进）**: "你是根治修复专家。目标：从根因彻底解决问题。允许必要的重构。追求长期最优解。"
   - **Agent C（平衡）**: "你是平衡修复专家。目标：在改动量和彻底性之间取最佳平衡。适度改动，兼顾短期可用与长期可维护。"

   每个 agent 输出提案 JSON 到 `tests/results/fix-proposals/{testId}-{strategy}.json`：
   ```json
   {
     "agent": "conservative|aggressive|balanced",
     "targetId": "{testId}",
     "diagnosis": "一段根因分析",
     "plan": ["步骤1", "步骤2"],
     "files_affected": ["path/to/file1.ts"],
     "changes_summary": "改动摘要",
     "risk_assessment": "风险评估",
     "estimated_confidence": 0.85
   }
   ```

   **f3. Supervisor 评分**

   读取三个提案 JSON，按以下维度打分（0-10）：

   | 维度 | 权重 | 评判标准 |
   |------|------|---------|
   | 正确性 | 35% | diagnosis 是否准确定位根因，plan 是否真正解决问题 |
   | 风险控制 | 25% | 是否可能破坏其他功能，files_affected 中有无高风险文件 |
   | 改动范围 | 15% | files_affected 数量，越少越好 |
   | 可验证性 | 15% | 修复后能否通过原测试轻松验证 |
   | 副作用 | 10% | 是否引入新的技术债或依赖 |

   加权总分 = sum(维度得分 × 权重)

   **f4. 选择与执行**

   - 最高分方案 ≥ 5.0 → 选中该方案，切换到其 worktree 并 merge 改动到主分支
   - 最高分 < 5.0 → 标记 `needs_human`，不执行修复，写入事件日志
   - 如果两个方案可互补 → supervisor 可融合，但需在 reasoning 中说明

   **f5. 记录**

   - 三个提案 JSON 保留在 `tests/results/fix-proposals/`（供审计）
   - 评分结果写入 `supervisor.json` 的 reasoning
   - 写入事件：
     ```bash
     bash tests/executors/event-writer.sh --type bug_fixed --impact {impact} --area {area} --detail "{fix summary}" --method competitive --chosen {agent_name} --confidence {score}
     ```
   - 未选中的 worktree 自动清理

   **f6. 进入 VERIFY**

   选中的修复进入 verifyQueue，走正常 VERIFY 流程。
   如果标记 `needs_human`：
   ```bash
   bash tests/executors/event-writer.sh --type needs_human --impact {impact} --area {area} --detail "{testId} 竞争修复三方案均低于阈值" || true
   ```

   f. **After agent returns — update state**:
      - Fix success → stageHistory: `{ stage: "FIX", action: "fix_pass", testId, fixType, recipeUsed, ... }`
      - Fix failure → stageHistory: `{ stage: "FIX", action: "fix_fail", testId, reason, recipeUsed, ... }`
        - retryCount++; if retryCount >= 3 → stats.skipped++, write to skipRegistry: `{ testId, reason: "retry:exhausted", reviewable: true }`
      - Clear `currentTest`
   g. Continue next fix

3. **After loop**: currentStage=VERIFY
