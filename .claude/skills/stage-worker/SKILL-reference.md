# Stage Worker — 自动化测试框架

持续自我迭代的测试→发现→修复→验证闭环。
每轮从文件读状态，不依赖 session memory。

## 触发
```
/test-supervisor run              # ⭐ 推荐：通过 supervisor 监督式执行
/loop 5m /test-supervisor run     # ⭐ 推荐：持续监督式循环
/stage-worker                     # 直接执行（手动或被 supervisor spawn）
/stage-worker --phase SCAN        # 强制指定阶段
/stage-worker --max-rounds 10     # 覆盖 maxRounds
```

## 🔴 安全红线（每轮必读）
先读 `tests/safety.yaml`。操作前查表：
- **SAFE** → 自动执行
- **BLOCKED** → 跳过并记录 reason（绝不执行）
- 不确定 → 标记 warning，跳过

## 🔴 state.json 写入规则（必须遵守）

**所有 state.json 写入必须通过 `state-writer.sh` 原子写入**。禁止用 Write tool、heredoc、`echo >` 等方式直接写 state.json。

原因：非原子写入在 pipe/并发场景下会产生 truncated JSON、trailing commas 等 corruption，导致后续所有轮次读取失败。

**写入方法 — 🔴 必须用 `--merge`**：
```bash
# ⭐ 只传需要改的字段，其余自动保留（防止覆盖 maxRounds 等并发修改）
echo '{"phase":"TEST","stats":{"passed":10}}' | bash tests/executors/state-writer.sh --merge

# 队列操作：先读当前 queue，计算新值，merge 写回
STATE_PATH="$TESTS_ROOT/state.json"
NEW_QUEUES=$(NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
  const fs = require('fs');
  const state = JSON.parse(fs.readFileSync(process.env.STATE_PATH, 'utf8'));
  const tq = (state.testQueue || []).filter(id => id !== 'done-test');
  const fq = [...(state.fixQueue || []), 'failed-test'];
  console.log(JSON.stringify({ testQueue: tq, fixQueue: fq }));
")
echo "$NEW_QUEUES" | bash tests/executors/state-writer.sh --merge
```

**🔴 禁止 full-replace 模式**（不带 `--merge` 的调用）。原因：full-replace 会把整个 state 写回，覆盖在读取和写入之间发生的并发修改（如 supervisor 改 maxRounds、用户注入 fixQueue）。

**环境变量**：node 中通过 `process.env.STATE_PATH` 读取 state.json 路径（POSIX 格式），不要在 node 源码中硬编码路径。

**`--merge` 模式行为**：
- 未传入的字段 → **保留原值**（不丢失 maxRounds 等配置）
- `stats` → **deep merge**（`{"stats":{"passed":10}}` 只改 passed，保留 failed/fixed）
- `roundJourney` → **per-phase deep merge**（只改指定 phase 的字段）
- `phaseHistory` → 空数组 `[]` = 重置，非空 = **追加**（concat）
- 数组字段（`testQueue`, `fixQueue` 等）→ **整体替换**（需先读再写）

## 执行流程

### Step 0: 加载状态（每轮开头，30s）

1. 读 `tests/state.json` → 确定当前 phase 和 queues
2. 读 `tests/safety.yaml` → 加载安全规则
3. 读 `tests/env.yaml` → 加载环境配置（端口、密码、case 池）
4. 读 `tests/learnings.yaml` → 加载踩坑经验
5. 检查 `state.json` 的 round >= maxRounds → 如果是，运行 `bash tests/executors/stats-reporter.sh <round>`，输出最终报告并返回（phase 设为 COMPLETE）
6. **中断恢复检查**：
   - 如果 `currentTest` 非空 → 上次执行被中断，当前测试需要重新执行
   - 将 `currentTest` 加回到对应 queue 的头部，然后清空 `currentTest`
   - 继续正常执行当前 phase

### Step 0.5: 处理指令（每轮开头）

Supervisor 可通过 `tests/directives.json` 下达跨 session 指令。

1. 如果 `tests/directives.json` 不存在 → 跳过此步骤
2. 读取 `tests/directives.json`
3. 如果 `paused=true` 且没有 pending 的 `resume` 指令 → 输出 "⏸️ Loop paused by supervisor directive" → 直接返回（不执行后续步骤）
4. 遍历 `status=pending` 的指令，按 `id` 字母序处理：

   | type | 处理逻辑 |
   |------|---------|
   | `pause` | 设 `directives.json` 的 `paused=true`，标记 processed，**立即返回**（本轮不再执行） |
   | `resume` | 设 `directives.json` 的 `paused=false`，标记 processed，继续执行 |
   | `skip_test` | 从 `state.json.testQueue` 移除 `payload.testId`（如在 queue 中），`stats.skipped++`，标记 processed（result: "removed from testQueue" 或 "not in queue"） |
   | `add_requirement` | 将 `payload.description` 追加到 `state.json.gaps` 数组，供 GENERATE 阶段使用，标记 processed |
   | `add_tests` | 将 `payload.tests` 数组中的每个 `{testId, category}` 加入 `state.json.testQueue`（去重），如果 phase 不是 TEST 则设 `phase=TEST`，标记 processed（result: "added N tests to queue"）。来源：conductor:verify 补测请求 |
   | `prioritize` | 将 `payload.testId` 移到 `state.json.testQueue` 头部（如在 queue 中），标记 processed |
   | `force_phase` | 设 `state.json.phase = payload.phase`（仅接受 SCAN/TEST/FIX/VERIFY），标记 processed |
   | `adjust_config` | 设 `state.json[payload.key] = payload.value`（仅允许 `maxRounds`、`round` 键），标记 processed |
   | `add_learning` | 执行 `bash tests/executors/learnings-writer.sh "{payload.id}" "{payload.category}" "{payload.description}" "{payload.solution}"`，标记 processed |
   | `note` | 无操作，直接标记 processed（result: "acknowledged"） |
   | 未知 type | 标记 `status=rejected`（result: "unknown directive type"） |

5. 每个指令处理后更新该指令字段：
   - `status` → `processed` 或 `rejected`
   - `processedAt` → 当前 ISO 时间戳
   - `processedResult` → 简短描述结果

6. 写回 `tests/directives.json`（原子写入）
7. 如果有 state.json 变更，写回 `tests/state.json`

### Step 1: 判断阶段 → 执行对应动作

**🔴 roundJourney 更新规则（每次进入 Step 1 必须执行）：**

在执行任何阶段逻辑**之前**，将当前 phase 标记为 `running`：
```bash
echo '{"roundJourney":{"'$PHASE'":{"status":"running"}}}' | bash tests/executors/state-writer.sh --merge
```
例如进入 SCAN：
```bash
echo '{"roundJourney":{"SCAN":{"status":"running"}}}' | bash tests/executors/state-writer.sh --merge
```

根据 `state.json.phase` 分发到对应阶段：

---

#### SCAN 阶段 — 扫描需求，发现 gap

**目标**：扫描项目文档/代码，与 manifest.json 对比，找出缺少测试的功能。

**执行**（Main Agent 直接执行，不 spawn agent）：

0. **回收旧问题**（每轮 SCAN 第一步）：
   ```bash
   bash tests/executors/queue-recycler.sh
   ```
   检查 regressionQueue / fixQueue(retryCount<3) / verifyQueue，将可回收项移入 testQueue。
   回收后通过 state-writer.sh 原子更新 state.json。
   如果回收了 N 项，记录 phaseHistory：
   ```json
   { "phase": "SCAN", "action": "recycle", "recycled": { "fromRegression": N, "fromFix": N, "fromVerify": N }, "timestamp": "..." }
   ```
   **注意**：回收后 testQueue 可能已非空，但仍继续执行后续扫描步骤（可能发现新 gap）。

0.1. **Skip 重评估**（每轮 SCAN）：
   检查 `state.skipRegistry`，对 `reviewable: true` 的条目：
   - 如果距 skip 已过 ≥ 3 轮（`round - entry.round >= 3`）→ 将 testId 加回 testQueue，从 skipRegistry 移除
   - 这让因 retry exhausted / systemic 被跳过的测试在框架修复后有机会重试
   - `reviewable: false`（如 safety:blocked）永不自动重试
   - 重评估后通过 state-writer.sh 原子更新 state.json

0.5. **刷新 Live Case 池**（每日一次）：
   ```bash
   bash tests/executors/refresh-live-cases.sh
   ```
   检查 `tests/fixtures/live-cases.yaml` 的 `lastRefreshed`，如超过 24h 则扫描 `cases/active/` 目录更新 case 池。
   这为 `data_source=live` 的测试提供最新的可用 case 列表。

1. **扫描 API 端点**：
   ```bash
   grep -r "app\.\(get\|post\|put\|patch\|delete\)" dashboard/src/routes/*.ts
   ```
   提取所有 HTTP 端点 → 与 `tests/registry/backend-api/` 已有测试对比

2. **扫描 UI 组件**：
   ```bash
   ls dashboard/web/src/components/**/*.tsx
   ```
   提取所有组件 → 与 `tests/registry/ui-interaction/` 和 `tests/registry/ui-visual/` 对比

3. **扫描 Skills/Workflows**：
   ```bash
   ls .claude/skills/*/SKILL.md
   ```
   每个 skill → 与 `tests/registry/workflow-e2e/` 对比

4. **扫描 Issues**（需求驱动）：
   ```bash
   bash tests/executors/issue-scanner.sh
   ```
   按 issue 状态分类扫描：
   - `tracked`/`implemented`（有 trackId + spec）→ 提取 AC 与 registry 比对，输出 `ISSUE_GAP`
   - `done`（有 trackId + spec）→ 检查回归测试覆盖，输出 `ISSUE_REGRESSION_GAP` 或 `ISSUE_COVERED`
   - `pending` / 无 trackId → `ISSUE_SKIP`

   将 `ISSUE_GAP` 追加到 state.json.gaps（标记来源 `issue-driven`），
   将 `ISSUE_REGRESSION_GAP` 追加到 state.json.gaps（标记来源 `issue-regression`）。
   记录 phaseHistory：
   ```json
   { "phase": "SCAN", "action": "issue-scan", "gaps": N, "regression_gaps": N, "skipped": N, "timestamp": "..." }
   ```

   **4b. 自动实现 tracked issue**（可选，受 env.yaml 控制）：
   读取 `tests/env.yaml` 的 `automation.autoImplementTracked` 字段。
   - **false（默认）**→ 跳过。如果 issue-scanner 输出了 `ISSUE_SKIP|ISS-xxx|tracked but ...`，记录 note directive：
     ```
     NOTE_DIRECTIVE: ISS-xxx is tracked but autoImplementTracked=false, skipping auto-implement
     ```
   - **true** → 扫描 issue-scanner 输出中 status=tracked 且有 trackId 的 issue：
     1. 检查 `conductor/tracks/{trackId}/plan.md` 存在
     2. 每轮最多自动实现 `automation.max_auto_implement_per_round` 个（默认 1）
     3. 对每个符合条件的 issue，spawn `conductor:implement {trackId}`（前台等待完成）
     4. 实现完成后 issue status 自动变为 `implemented`（由 conductor:implement 流程处理）
     5. 记录 phaseHistory：
        ```json
        { "phase": "SCAN", "action": "auto-implement", "issueId": "ISS-xxx", "trackId": "xxx", "timestamp": "..." }
        ```
     6. 下轮 SCAN 的 issue-scanner 会将 implemented issue 的 AC 提取为测试 gap

5. **扫描 Observability gap**（自动发现质量退化风险）：
   ```bash
   bash tests/executors/observability-scanner.sh
   ```
   自动执行以下 5 类扫描，发现新的 observability probe 需求：

   | 扫描源 | 检查内容 | 产出 |
   |--------|---------|------|
   | Agent 配置审计 | `.claude/agents/*.md` frontmatter 是否符合规范 | 新 agent 加入 → 需要更新 agent-frontmatter-audit probe |
   | SKILL Prompt 审计 | `.claude/skills/*/SKILL.md` prompt 模板大小/模式 | 新 SKILL 加入 → 需要更新 skill-prompt-lean probe |
   | Bash 反模式扫描 | `tests/executors/*.sh` + `.claude/skills/*/SKILL.md` 中的 `; VAR=` + pipe 模式 | 发现反模式 → 需要扩展 bash-variable-stability probe |
   | Timing 漂移检测 | 最新 `timing.json` vs `tests/baselines.yaml` | 基线过时 → 触发 baseline-updater.sh |
   | Learnings 回归 | `tests/learnings.yaml` 新增条目 → 需要对应验证命令 | 新 learning → 需要扩展 learnings-regression probe |

   输出：`SCAN_OBS|{discovered_count}|{details}` — 发现的 gap 追加到 state.json.gaps

5.5. **执行 Observability Probes**（基础设施健康检查）：
   ```bash
   bash tests/executors/probe-scheduler.sh {round}
   ```
   直接运行所有到期的 observability probe（不经过 testQueue）。
   调度逻辑：每 `probe_schedule.interval_rounds`（默认 5）轮重跑一次，首轮全部执行。
   输出：`PROBE_SCAN|{ran}/{total}|{passed}/{ran}|{details}`
   如有 probe 失败 → 记录到 phaseHistory（`{ phase: "SCAN", action: "probe_fail", probeId: "...", ... }`），
   生成 warning（不阻塞后续阶段）。

6. **扫描 Spec 验收标准**（从 conductor tracks 发现未测试的验收条件）：
   ```bash
   bash tests/executors/spec-scanner.sh
   ```
   扫描所有 `conductor/tracks/*/spec.md` 中 `## Acceptance Criteria` 下的条目，
   与 `tests/registry/` 已有测试定义比对，输出未覆盖的 gap 列表。
   每个 gap 格式：`SPEC_GAP|{trackId}|{criterion}|{suggested_category}`
   将 gap 追加到 state.json.gaps，标记来源为 `spec-driven`。

7. **更新 manifest.json**：
   - 新增发现的 features
   - 标记 tested/untested
   - 更新 coverage 统计

6. **决定下一步**：
   - 有 untested features → 更新 state.json phase=GENERATE, 将 gap 列表写入 state.json
   - 无 gap + testQueue 非空（含回收项）→ phase=TEST
   - 无 gap + testQueue 空 → 记录 phaseHistory `{ action: "no_work", detail: "No new gaps and no recyclable items" }`，round++, phase=SCAN（新一轮）

---

#### GENERATE 阶段 — 从 gap 生成测试定义

**目标**：为 SCAN 发现的每个 gap 生成 test definition YAML。

**执行**（Main Agent 直接执行）：

1. 从 `state.json` 读取 gap 列表
2. 对每个 gap：
   - **普通 gap**（SCAN 自动发现）：根据类型确定 category（API→backend-api, 组件→ui-interaction, skill→workflow-e2e, npm test→unit-test）
   - **spec-driven gap**（来自 spec-scanner.sh，source=`spec-driven`）：按验收标准分类规则确定 category 和 test type：
     - 工作流输出/文件生成/脚本行为/数据管道 → `workflow-e2e`（E2E 类型）
     - 用户交互：点击/表单/对话框/状态切换 → `ui-interaction`（Interaction 类型）
     - 外观：布局/样式/主题/截图 → `ui-visual`（Visual 类型）
     - 后端接口：新端点/响应格式 → `backend-api`（API 类型）
     - 单元测试/npm test/vitest → `unit-test`
     - 探针/基线/审计 → `observability`
     - D365 写操作/执行操作 → **跳过**（不生成测试，标记 `skip` 原因）
   - 查 `tests/safety.yaml` 确定 safety_level
   - 生成 `tests/registry/{category}/{id}.yaml`，遵循 `tests/schemas/test-definition.yaml` 格式
   - spec-driven gap 额外写入 `source: spec-driven` 和 `trackId: {来源 track}` 字段
   - 添加到 `state.json.testQueue`
3. 更新 `tests/manifest.json` coverage
4. 更新 `state.json` phase=TEST

---

#### TEST 阶段 — 批量执行测试

**目标**：遍历 testQueue 所有测试并执行，每个测试 spawn 独立 subagent 隔离 context。

**执行策略**：主 session 编排循环，逐个 spawn subagent 执行，每个完成后立即更新 state.json。

**批量循环**：`for each test in testQueue`（按顺序逐个处理）

1. **循环开始前**：记录 testQueue 快照（防止循环中修改导致混乱）
2. **对 testQueue 中每个测试**：
   a. 读取 `tests/registry/{category}/{id}.yaml` 获取测试定义
   b. 检查 `safety_level` — BLOCKED 直接跳过，stats.skipped++，写入 skipRegistry：
      ```
      state.skipRegistry.push({ testId, reason: "safety:blocked", round, reviewable: false })
      ```
   c. 设置 `state.json.currentTest = testId`（中断恢复用）
   d. 根据 category **spawn 对应 agent**：

   **backend-api 测试** → spawn sonnet agent（tools: Bash, Read, Write）
   ```
   Prompt: 读取 tests/env.yaml 获取 API 地址和 JWT 生成方式。
   读取 tests/registry/backend-api/{id}.yaml 获取测试定义。
   读取 tests/safety.yaml 确认所有操作安全。
   读取 tests/learnings.yaml 获取已知踩坑经验。
   执行: bash tests/executors/api-runner.sh {id} {round}
   或手动执行测试步骤，验证断言，结果写入 tests/results/{round}-{id}.json。
   ```

   **ui-interaction / ui-visual 测试** → spawn haiku agent（无 tools，只用 Playwright MCP）
   ```
   Prompt: 读取 tests/env.yaml 获取前端 URL 和 Playwright 配置。
   读取 tests/registry/ui-*/{id}.yaml 获取测试定义。
   读取 tests/safety.yaml — BLOCKED 操作绝不执行。
   读取 tests/learnings.yaml 获取已知踩坑经验。
   执行: bash tests/executors/ui-runner.sh {id} {round}
     或: bash tests/executors/visual-runner.sh {id} {round}
   截图保存为 JPEG 到 tests/results/screenshots/（绝不传回主 session）。
   结果写入 tests/results/{round}-{id}.json。
   ```

   **workflow-e2e 测试** → spawn sonnet agent（tools: Bash, Read, Write）
   ```
   Prompt: 读取 tests/env.yaml 获取 case 池和路径配置。
   读取 tests/registry/workflow-e2e/{id}.yaml 获取测试定义。
   读取 tests/safety.yaml 确认所有操作安全。
   读取 tests/learnings.yaml 获取已知踩坑经验。
   执行: bash tests/executors/e2e-runner.sh {id} {round}
   结果写入 tests/results/{round}-{id}.json。
   ```

   **observability 测试** → spawn sonnet agent（tools: Bash, Read, Write）
   ```
   Prompt: 读取 tests/registry/observability/{id}.yaml 获取探针定义。
   读取 tests/baselines.yaml 获取性能基线。
   读取 tests/safety.yaml 确认所有操作安全。
   读取 tests/learnings.yaml 获取已知踩坑经验。
   执行: bash tests/executors/observability-runner.sh {id} {round}
   结果写入 tests/results/{round}-{id}.json。
   ```

   **unit-test 测试** → spawn sonnet agent（tools: Bash, Read, Write）
   ```
   Prompt: 读取 tests/registry/unit-test/{id}.yaml 获取测试定义。
   读取 tests/safety.yaml 确认所有操作安全。
   读取 tests/learnings.yaml 获取已知踩坑经验。
   执行: bash tests/executors/unit-runner.sh {id} {round}
   结果写入 tests/results/{round}-{id}.json。
   ```

   e. **Agent 返回后立即更新 state.json**：
      - 读取 `tests/results/{round}-{id}.json`
      - PASS → 从 testQueue 移除，stats.passed++
      - FAIL → 移入 fixQueue，stats.failed++
      - 追加 phaseHistory 记录（含 testId、结果、duration）
      - 清空 `currentTest`
   f. **继续下一个 test**（不退出 session）

3. **循环结束后**决定下一步：
   - fixQueue 非空 → phase=FIX
   - fixQueue 空 → round++, phase=SCAN

---

#### FIX 阶段 — 批量分析并修复代码

**目标**：遍历 fixQueue 所有失败测试，逐个分析根因并修复代码。

**执行**：主 session 编排循环，每个 fix 两步走 — 先分析（脚本），再修复（spawn opus agent）。

**排序规则**：fixQueue 按 `priority` 字段排序（小值优先）。未设 priority 的默认为 5。`category: "framework"` 的 fix item（由自愈系统创建，priority=1）会排在普通测试 fix 之前。

**批量循环**：`for each fix in fixQueue`（按 priority 排序后逐个处理）

1. **循环开始前**：
   - 按 priority 排序 fixQueue（升序，默认 5）
   - 记录 fixQueue 快照
2. **对 fixQueue 中每个测试**：
   a. 设置 `state.json.currentTest = testId`

   **⚠️ Progress 可见性**：在 spawn agent 之前，主 session 必须写 progress 文件供 supervisor 观察：
   ```bash
   cat > tests/results/.progress-{testId}.json << EOF
   {"testId":"{testId}","type":"fix","step":"agent_spawn","detail":"Spawning opus agent for code fix","elapsed_s":0,"timestamp":"$(date -u +%Y-%m-%dT%H:%M:%SZ)"}
   EOF
   ```
   Agent 返回后立即清除：`rm -f tests/results/.progress-{testId}.json`

   b. **判断 fix 类型**：
      - 如果 `category === "framework"`（自愈系统创建的基础设施修复）→ 走 **Framework Fix 路径**
      - 否则 → 走普通 **Test Fix 路径**

   **Framework Fix 路径**：
   - 读取对应的 `tests/results/fixes/{pattern-id}-self-heal.md` 了解 pattern 详情（如存在）
   - **如果 fixQueue item 含 `retroContext` 字段**（来自 Phase Retrospective）：
     - 直接从 retroContext 提取 targetFile/targetLine/rootCause，无需探索
     - Spawn opus agent 精准修复：
       ```
       Prompt: 你是一个测试框架修复工程师。

       这是 Phase Retrospective 发现的框架逻辑 bug：
       - 异常: {retroContext.anomaly}
       - 根因: {retroContext.rootCause}
       - 目标文件: {retroContext.targetFile}
       - 目标位置: {retroContext.targetLine}

       请直接定位到 {retroContext.targetFile} 的 {retroContext.targetLine}，
       分析并修复这个逻辑缺陷。

       修复后，调用:
       bash tests/executors/fix-recorder.sh <test-id> "framework_fix" "<description>" "<modified-files>"
       ```
   - **否则**（来自 pattern-detector 的传统 framework fix）：
     - 读取 `tests/results/fixes/{pattern-id}-self-heal.md` 了解失败模式
     - Spawn opus agent 修复基础设施代码：
       ```
       Prompt: 你是一个测试框架修复工程师。
       读取 tests/results/fixes/{pattern-id}-self-heal.md 了解失败模式。
       定位基础设施代码中的根因（如 tests/executors/common.sh、e2e-runner.sh 等）。
       修复后，调用:
       bash tests/executors/fix-recorder.sh <test-id> "framework_fix" "<description>" "<modified-files>"
       ```

   **Test Fix 路径**（原有逻辑）：
   - **运行分析器**（Main Agent 直接执行）：
      ```bash
      bash tests/executors/fix-analyzer.sh <test-id> <round>
      ```
      产出：`tests/results/fixes/{id}-analysis.md`（根因分析 + 修复建议）
      输出：`FIX_ANALYSIS|testId|failureType|isEnvIssue|analysisFile`

   c. **根据分析结果决定**（Test Fix 路径）：
      - `isEnvIssue=true` → Main Agent 直接处理（调整配置/env），然后调用 learnings-writer：
        ```bash
        bash tests/executors/learnings-writer.sh "<id>" "<category>" "<problem>" "<solution>"
        ```
      - `isEnvIssue=false` → Spawn opus agent 修复代码：
        ```
        Prompt: 你是一个 bug 修复工程师。
        读取 tests/results/fixes/{id}-analysis.md 了解根因分析。
        读取 tests/registry/{category}/{id}.yaml 了解测试定义。
        读取 tests/learnings.yaml 了解已知问题。
        分析根因，修改相关代码文件（测试定义或源代码）。
        修改完成后，调用:
        bash tests/executors/fix-recorder.sh <test-id> <fix-type> "<description>" "<modified-files>"
        ```

   d. fix-recorder.sh 会自动：
      - 记录修复详情到 `tests/results/fixes/{id}-fix.md`
      - 将测试从 fixQueue 移到 verifyQueue
      - 对 code_bug 修复自动运行 regression-tracker.sh
      - 对 env_issue 修复自动调用 learnings-writer.sh

   e. **Agent 返回后立即更新 state.json**：
      - 修复成功 → 追加 phaseHistory：`{ phase: "FIX", action: "fix_pass", testId, fixType, description, timestamp }`
      - 修复失败（agent 无法修复）→ 追加 phaseHistory：`{ phase: "FIX", action: "fix_fail", testId, reason: "...", timestamp }`
        - 同时：retryCount++，如果 retryCount >= 3 → stats.skipped++，写入 skipRegistry，追加：`{ phase: "FIX", action: "fix_skip", testId, reason: "retry:exhausted", timestamp }`
      - 清空 `currentTest`
   f. **继续下一个 fix**（不退出 session）

3. **循环结束后**：phase=VERIFY

---

#### VERIFY 阶段 — 批量验证修复有效

**目标**：遍历 verifyQueue 所有测试，重跑确认修复有效。

**执行**：主 session 编排循环，逐个使用 verify-rerun.sh 重跑测试。

**批量循环**：`for each verify in verifyQueue`（按顺序逐个处理）

1. **循环开始前**：记录 verifyQueue 快照
2. **对 verifyQueue 中每个测试**：
   a. 设置 `state.json.currentTest = testId`
   b. **运行验证重跑**（spawn sonnet agent 或 Main Agent 直接执行）：
      ```bash
      bash tests/executors/verify-rerun.sh <test-id> <round>
      ```
      输出：`VERIFY_RESULT|testId|pass|5/5` 或 `VERIFY_RESULT|testId|fail|3/5`

   c. **立即更新 state.json**：
      - PASS → stats.fixed++，从 verifyQueue 移除
        - 追加 phaseHistory：`{ phase: "VERIFY", action: "verify_pass", testId, result: "pass", timestamp }`
        - **如果是 observability probe PASS** → 额外调用 baseline-updater：
          ```bash
          bash tests/executors/baseline-updater.sh <test-id>
          ```
          更新 baselines.yaml 中对应指标的滑动平均值
      - FAIL → 回到 fixQueue，retryCount++
        - 追加 phaseHistory：`{ phase: "VERIFY", action: "verify_fail", testId, result: "fail", timestamp }`
        - 如果 retryCount >= 3 → 标记为 "需人工" 并跳过（stats.skipped++），写入 skipRegistry：
          ```
          state.skipRegistry.push({ testId, reason: "retry:exhausted (retryCount=" + retryCount + ")", round, reviewable: true })
          ```
          追加 phaseHistory：`{ phase: "VERIFY", action: "verify_skip", testId, reason: "retry:exhausted", timestamp }`
      - 追加 phaseHistory 记录（含 testId、结果）
      - 清空 `currentTest`
   d. **继续下一个 verify**（不退出 session）

3. **Self-Heal Check**（verifyQueue 循环结束后，regressionQueue 之前）：

   在 fixQueue 有失败测试回退时，运行 pattern detector 检查是否存在系统性失败模式：
   ```bash
   bash tests/executors/pattern-detector.sh <round>
   ```

   **如果检测到 patterns**（exit code 0），逐个处理：

   a. **Systemic pattern**（多测试同一 signature）：
      - 对所有 affected tests：从 fixQueue/verifyQueue 移除，stats.skipped++，写入 skipRegistry：
        ```
        state.skipRegistry.push({ testId, reason: "systemic:" + signature, round, reviewable: true })
        ```
      - 创建 framework fix item 加入 fixQueue **头部**：
        ```json
        {
          "testId": "framework-fix-{pattern-id}",
          "reason": "SYSTEMIC: {signature} affecting {test-ids}",
          "failedAt": "now",
          "retryCount": 0,
          "category": "framework",
          "priority": 1
        }
        ```
      - 调用 learnings-writer 记录经验：
        ```bash
        bash tests/executors/learnings-writer.sh "{pattern-id}" "test" "{signature} caused systemic failure" "Self-healed: skipped affected tests, created framework fix"
        ```
      - 调用 self-heal-recorder 记录自愈动作：
        ```bash
        bash tests/executors/self-heal-recorder.sh "{pattern-id}" "systemic" "{signature}" "{test-ids}" "{diagnosis}" "Skipped {N} tests, created framework fix item"
        ```

   b. **Stuck pattern**（单测试反复失败）：
      - 从 fixQueue 移除该测试，stats.skipped++，写入 skipRegistry：
        ```
        state.skipRegistry.push({ testId, reason: "stuck:" + signature, round, reviewable: true })
        ```
      - 调用 learnings-writer 记录经验
      - 调用 self-heal-recorder 记录自愈动作
      - **不**创建 framework fix item（非 systemic）

   **如果未检测到 patterns**（exit code 1）→ 跳过，继续正常流程

4. **verifyQueue 循环结束后，处理 regressionQueue**：
   - 对 regressionQueue 中每个测试也用对应 executor 重跑
   - PASS → 从 regressionQueue 移除
   - FAIL → 加入 fixQueue（回归失败 = 新 bug）

5. **全部循环结束后**决定下一步：
   - fixQueue 非空（有 FAIL 回退的或 regression 新增的）→ phase=FIX
   - fixQueue 空 + testQueue 非空 → phase=TEST
   - 全空 → round++, phase=SCAN

6. **round 切换时**生成统计：
   ```bash
   bash tests/executors/stats-reporter.sh <round>
   ```

---

### Step 2: 更新状态

每个阶段执行完后：
1. 更新 `tests/state.json`（phase、queues、stats）
2. **🔴 标记完成阶段的 roundJourney 为 `done`**（含 summary 和 duration）：
   ```bash
   # 记录阶段开始时间 START_TS=$(date +%s%3N)，结束后计算 duration
   DURATION_MS=$(( $(date +%s%3N) - START_TS ))
   echo '{"roundJourney":{"SCAN":{"status":"done","summary":"23 issue gaps, 18 regression gaps","duration_ms":'$DURATION_MS'}}}' \
     | bash tests/executors/state-writer.sh --merge
   ```
   summary 内容根据阶段不同：
   - SCAN: `"{issue_gaps} issue gaps, {regression_gaps} regression gaps"`
   - GENERATE: `"{count} tests from {issue_count} issues"`
   - TEST: `"{passed} passed, {failed} failed"`
   - FIX: `"{fixed} fixed, {unfixable} unfixable"`
   - VERIFY: `"{verified} verified, {regressed} regressed"`
3. 追加 phaseHistory 记录（**必须包含 `round` 字段**，用于跨轮次过滤）：
   ```bash
   echo '{"phaseHistory":[{"phase":"TEST","action":"test_pass","testId":"xxx","round":5,"timestamp":"..."}]}' \
     | bash tests/executors/state-writer.sh --merge
   ```
   `--merge` 模式下 phaseHistory 为**追加**（非覆盖），其余字段为 shallow merge。
3. **Round 递增规则**：当一轮完整循环结束（从 VERIFY/TEST 回到 SCAN），round++
4. **Round 切换时**：
   - 清空 phaseHistory **并重置 roundJourney**（新轮次所有阶段回到 pending）：
   ```bash
   echo '{"phaseHistory":[],"roundJourney":{"SCAN":{"status":"pending","summary":""},"GENERATE":{"status":"pending","summary":""},"TEST":{"status":"pending","summary":""},"FIX":{"status":"pending","summary":""},"VERIFY":{"status":"pending","summary":""}}}' \
     | bash tests/executors/state-writer.sh --merge
   ```
   （`--merge` 检测到空数组会替换而非追加）
   - 生成统计报告：
   ```bash
   bash tests/executors/stats-reporter.sh <round>
   ```
   产出：`tests/results/round-{N}-summary.json` + 更新 `tests/stats.md`
5. 如果 round >= maxRounds → 设 phase=COMPLETE，下轮 Step 0 检测到后退出

### Step 2.2: Phase Retrospective（阶段回顾）

**每个 phase 完成且 state.json 已更新后**，Agent 回顾本阶段的执行结果，判断是否存在**框架自身的逻辑 bug** 需要升级修复。

**目标**：将自愈能力从"规则驱动"（pattern-detector 匹配已知签名）扩展为"推理驱动"（agent 识别未知异常）。

**输入**：本阶段的 phaseHistory 记录 + roundJourney summary + 执行过程中观察到的数据

**Agent 自问**（按顺序，任一项为"是"则继续深入）：

1. **输入/输出比例是否合理？**
   - SCAN 报告 N 个 gap，GENERATE 有多少转化为有效测试？（废品率 > 50% → 异常）
   - TEST 执行 N 个测试，全部同一原因失败？（同因率 > 80% → 异常）
   - FIX 修复 N 个测试，verify 全部回退？（回退率 > 60% → 异常）

2. **是否有跨轮次的重复无效工作？**
   - 连续 2+ 轮 SCAN 报告相同的 gap 被 GENERATE 过滤？（空转模式）
   - 同一测试在 FIX → VERIFY → FIX 间反复弹跳 3+ 次？（乒乓模式）

3. **异常的根因是运行时环境问题，还是框架代码的逻辑缺陷？**
   - 环境问题：端口未启动、文件权限、网络超时 → **不升级**（已有 learnings 机制）
   - 逻辑缺陷：正则错误、条件判断遗漏、数据结构不匹配 → **升级**

4. **如果是逻辑缺陷，能否定位到具体文件和代码位置？**
   - 从错误信息、输入输出对比、执行日志中推断 targetFile 和 targetLine/targetFunction

**决策**：

- ✅ **无异常** → 不产出任何内容，直接进入 Step 2.1
- 🔧 **发现逻辑 bug** → 执行以下三步，然后进入 Step 2.1：

  **Step A: 记录 learnings**
  ```bash
  bash tests/executors/learnings-writer.sh \
    "retro-{round}-{PHASE}" "framework" \
    "{问题描述：如 issue-scanner.sh regex strips CJK characters}" \
    "{根因分析：如 [^a-z0-9 ] filter removes all non-ASCII}"
  ```

  **Step B: 创建 framework fix item**（加入 fixQueue 头部）
  ```bash
  # 先读取当前 fixQueue
  CURRENT_FQ=$(node -e "
    const fs = require('fs');
    const state = JSON.parse(fs.readFileSync(process.env.STATE_PATH, 'utf8'));
    console.log(JSON.stringify(state.fixQueue || []));
  ")
  # 构建新 item + 合并
  NEW_FQ=$(node -e "
    const current = JSON.parse(process.argv[1]);
    const retroItem = {
      testId: 'retro-fix-{round}-{PHASE}',
      reason: 'RETRO: {异常描述}',
      failedAt: new Date().toISOString(),
      retryCount: 0,
      category: 'framework',
      priority: 1,
      retroContext: {
        phase: '{PHASE}',
        round: {round},
        anomaly: '{异常描述：如 100% false positive rate in GENERATE}',
        rootCause: '{根因：如 regex [^a-z0-9 ] strips CJK characters}',
        targetFile: '{文件路径：如 tests/executors/issue-scanner.sh}',
        targetLine: '{行号或函数名：如 line 72, keyword match function}'
      }
    };
    console.log(JSON.stringify([retroItem, ...current]));
  " "$CURRENT_FQ")
  echo '{"fixQueue":'"$NEW_FQ"'}' | bash tests/executors/state-writer.sh --merge
  ```

  **retroContext schema**：
  ```json
  {
    "phase": "SCAN|GENERATE|TEST|FIX|VERIFY",
    "round": 25,
    "anomaly": "human-readable description of what went wrong",
    "rootCause": "technical diagnosis of the logic bug",
    "targetFile": "relative path to the buggy file",
    "targetLine": "line number, function name, or code snippet identifier"
  }
  ```

  **Step C: 记录 self-heal**
  ```bash
  bash tests/executors/self-heal-recorder.sh \
    "retro-{round}-{PHASE}" "logic_bug" \
    "{根因签名：如 regex-strips-cjk}" \
    "N/A" \
    "{诊断描述}" \
    "Created framework fix from Phase Retrospective"
  ```

  **追加 phaseHistory**：
  ```bash
  echo '{"phaseHistory":[{"phase":"{PHASE}","action":"retro_escalate","testId":"retro-fix-{round}-{PHASE}","round":{round},"anomaly":"{异常描述}","targetFile":"{文件路径}","timestamp":"..."}]}' \
    | bash tests/executors/state-writer.sh --merge
  ```

**约束**：
- 每轮每阶段**最多创建 1 个** retro fix item（防止刷屏）— 如果发现多个异常，合并为一个最严重的
- Retrospective **不修改任何代码** — 只创建 fixQueue item，实际修复由 FIX 阶段 opus agent 完成
- 无异常时**零输出** — 不记录"一切正常"，避免噪音
- retroContext 中的 targetFile/targetLine 是**尽力提供**（best effort），agent 无法确定时可留空字符串
- FIX 阶段已有 `category === "framework"` 分支且 `priority: 1` 保证优先处理

### Step 2.1: 续跑判断（多 phase 连续执行）

**每个 phase 完成并更新 state.json 后**，检查是否继续执行下一个 phase（不返回）：

```
读取更新后的 state.json，根据 next phase 决定：

1. phase = COMPLETE → 跳到 Step 2.5（返回）
2. next phase = SCAN 或 GENERATE → ⚡ 继续执行（回到 Step 1）
3. next phase = TEST 且 testQueue.length ≤ 2 → ⚡ 继续执行
4. next phase = VERIFY 且 verifyQueue.length ≤ 2 → ⚡ 继续执行
5. 否则（TEST/FIX/VERIFY 且 queue 较大）→ 跳到 Step 3（返回摘要）
```

**设计意图**：
- SCAN（~30s）和 GENERATE（~1min）耗时短，单独占一个 tick 浪费 80-90% 等待时间
- 续跑让一个 tick 可以连续执行 SCAN → GENERATE → TEST，减少空闲
- 长 phase（大 queue 的 TEST/FIX/VERIFY）执行后返回，给 supervisor 介入窗口
- **每个 phase 完成后都已更新 state.json**，supervisor 通过文件可实时看进度

**⚠️ 续跑不跳过 Step 0.5**：回到 Step 1 之前，重新检查 directives（处理 pause/resume 等指令）。

**⚠️ Phase Retrospective 可能影响续跑**：Step 2.2 可能新增 fixQueue item，导致 next phase 从原本的 SCAN 变为 FIX。续跑判断读取的是 Step 2.2 之后的最新 state.json。

### Step 2.5: COMPLETE 状态（maxRounds 达标）

当 phase=COMPLETE 时：
1. 运行最终统计：`bash tests/executors/stats-reporter.sh <round>`
2. 输出最终报告
3. 返回 — loop 读到 COMPLETE 不再执行

### Step 3: 输出摘要

每轮结束输出（每个被执行的 phase 都列出）：
```
🔄 Test Loop Round {N}/{maxRounds}
📊 Phases executed: {SCAN → GENERATE → TEST} (续跑了 {N} 个 phase)
✅ Passed: {N}  ❌ Failed: {N}  🔧 Fixed: {N}  ⏭️ Skipped: {N}
📈 Coverage: {N}%
⏭️ Next: {next phase description}
```

## 状态机转换图

```
                    ┌─────────────────────────┐
                    │                         │
                    ▼                         │
    ┌──────┐    有 gap    ┌──────────┐        │
    │ SCAN │───────────→│ GENERATE │        │
    │      │             └─────┬────┘        │
    │      │                   │              │
    │      │   无 gap          ▼              │
    │      │─────────→┌──────┐               │
    └──────┘          │ TEST │               │
       ▲              └──┬───┘               │
       │                 │                    │
       │    全通过        │ 有失败            │
       │                 ▼                    │
       │              ┌─────┐                │
       │              │ FIX │                │
       │              └──┬──┘                │
       │                 │                    │
       │                 ▼                    │
       │            ┌────────┐               │
       │            │ VERIFY │───PASS───────┘
       │            └───┬────┘
       │                │ FAIL
       │                ▼
       │             回到 FIX
       │
       └── round++ 后回到 SCAN
```

## 输出文件

| 文件 | 用途 |
|------|------|
| `tests/state.json` | 状态机当前状态（每轮更新） |
| `tests/manifest.json` | 功能覆盖映射（SCAN 更新） |
| `tests/registry/{category}/{id}.yaml` | 测试定义（GENERATE 创建） |
| `tests/results/{round}-{id}.json` | 测试结果（TEST/VERIFY 写入） |
| `tests/results/fixes/{id}-fix.md` | 修复详情（FIX 写入） |
| `tests/results/round-{N}-summary.json` | 每轮统计（round 结束时） |
| `tests/learnings.yaml` | 踩坑经验（FIX 追加） |
| `tests/baselines.yaml` | 性能基线（VERIFY 阶段 baseline-updater 更新） |

## 注意事项

- **state.json 写入必须用 `bash tests/executors/state-writer.sh`**（原子写入）— 见顶部写入规则
- **续跑判断**：每个 phase 完成后按 Step 2.1 判断是否继续，短 phase 连续执行避免浪费
- 每轮遍历当前 phase 的所有 queue items，用 subagent 隔离每个 item
- 每个 agent 完成后立即更新 state.json（stats + queue + phaseHistory），supervisor 可实时看进度
- Step 0 只读一次 env/learnings/safety，所有 agent 复用同一 session context
- Agent 做具体工作，主 session 只编排
- 所有状态通过文件传递，不依赖 session memory
- UI 测试 spawn haiku agent（最轻量，Playwright MCP 隔离）
- 截图绝不传回主 session（保存到文件）
- 遵循 env.yaml 的环境配置，避免重复猜测
- 遵循 learnings.yaml 的踩坑经验，避免重复犯错
- **自主进化**：stage-worker 自行管理所有测试逻辑（失败分析、retry 策略、self-heal pattern 检测），supervisor 不介入这些决策
- **Phase Retrospective**：每个 phase 完成后 agent 回顾执行结果，通过推理（非规则）识别框架逻辑 bug 并升级到 fixQueue。这是规则驱动自愈（pattern-detector）的补充，覆盖规则无法预见的未知异常
