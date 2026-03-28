# Test Loop — 自动化测试框架

持续自我迭代的测试→发现→修复→验证闭环。
每轮从文件读状态，不依赖 session memory。

## 触发
```
/test-loop                    # 手动执行一轮
/loop 3m /test-loop           # 持续自动执行（推荐）
/test-loop --phase SCAN       # 强制指定阶段
/test-loop --max-rounds 10    # 覆盖 maxRounds
```

## 🔴 安全红线（每轮必读）
先读 `tests/safety.yaml`。操作前查表：
- **SAFE** → 自动执行
- **BLOCKED** → 跳过并记录 reason（绝不执行）
- 不确定 → 标记 warning，跳过

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

根据 `state.json.phase` 分发到对应阶段：

---

#### SCAN 阶段 — 扫描需求，发现 gap

**目标**：扫描项目文档/代码，与 manifest.json 对比，找出缺少测试的功能。

**执行**（Main Agent 直接执行，不 spawn agent）：

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
   ls issues/ISS-*.json
   ```
   type=feature + status=done 的 issue → 检查是否有对应测试

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

6. **更新 manifest.json**：
   - 新增发现的 features
   - 标记 tested/untested
   - 更新 coverage 统计

6. **决定下一步**：
   - 有 untested features → 更新 state.json phase=GENERATE, 将 gap 列表写入 state.json
   - 无 gap + testQueue 非空 → phase=TEST
   - 无 gap + testQueue 空 → round++, phase=SCAN（新一轮）

---

#### GENERATE 阶段 — 从 gap 生成测试定义

**目标**：为 SCAN 发现的每个 gap 生成 test definition YAML。

**执行**（Main Agent 直接执行）：

1. 从 `state.json` 读取 gap 列表
2. 对每个 gap：
   - 根据类型确定 category（API→backend-api, 组件→ui-interaction, skill→workflow-e2e）
   - 查 `tests/safety.yaml` 确定 safety_level
   - 生成 `tests/registry/{category}/{id}.yaml`，遵循 `tests/schemas/test-definition.yaml` 格式
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
   b. 检查 `safety_level` — BLOCKED 直接跳过，stats.skipped++
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

   b. **判断 fix 类型**：
      - 如果 `category === "framework"`（自愈系统创建的基础设施修复）→ 走 **Framework Fix 路径**
      - 否则 → 走普通 **Test Fix 路径**

   **Framework Fix 路径**：
   - 读取对应的 `tests/results/fixes/{pattern-id}-self-heal.md` 了解 pattern 详情
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
      - 追加 phaseHistory 记录（含 testId、修复类型、描述）
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
        - **如果是 observability probe PASS** → 额外调用 baseline-updater：
          ```bash
          bash tests/executors/baseline-updater.sh <test-id>
          ```
          更新 baselines.yaml 中对应指标的滑动平均值
      - FAIL → 回到 fixQueue，retryCount++
        - 如果 retryCount >= 3 → 标记为 "需人工" 并跳过（stats.skipped++）
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
      - 对所有 affected tests：从 fixQueue/verifyQueue 移除，stats.skipped++
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
      - 从 fixQueue 移除该测试，stats.skipped++
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
2. 追加 phaseHistory 记录
3. **Round 递增规则**：当一轮完整循环结束（从 VERIFY/TEST 回到 SCAN），round++
4. **Round 切换时**生成统计报告：
   ```bash
   bash tests/executors/stats-reporter.sh <round>
   ```
   产出：`tests/results/round-{N}-summary.json` + 更新 `tests/stats.md`
5. 如果 round >= maxRounds → 设 phase=COMPLETE，下轮 Step 0 检测到后退出

### Step 2.5: COMPLETE 状态（maxRounds 达标）

当 phase=COMPLETE 时：
1. 运行最终统计：`bash tests/executors/stats-reporter.sh <round>`
2. 输出最终报告
3. 返回 — loop 读到 COMPLETE 不再执行

### Step 3: 输出摘要

每轮结束输出：
```
🔄 Test Loop Round {N}/{maxRounds}
📊 Phase: {SCAN|GENERATE|TEST|FIX|VERIFY}
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

- 每轮遍历当前 phase 的所有 queue items，用 subagent 隔离每个 item
- 每个 agent 完成后立即更新 state.json（stats + queue + phaseHistory），supervisor 可实时看进度
- Step 0 只读一次 env/learnings/safety，所有 agent 复用同一 session context
- Agent 做具体工作，主 session 只编排
- 所有状态通过文件传递，不依赖 session memory
- UI 测试 spawn haiku agent（最轻量，Playwright MCP 隔离）
- 截图绝不传回主 session（保存到文件）
- 遵循 env.yaml 的环境配置，避免重复猜测
- 遵循 learnings.yaml 的踩坑经验，避免重复犯错
