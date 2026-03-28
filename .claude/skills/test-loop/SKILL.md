# Test Loop — 自动化测试框架

持续自我迭代的测试→发现→修复→验证闭环。
每轮从文件读状态，不依赖 session memory。

## 触发
```
/test-loop                    # 手动执行一轮
/loop 8m /test-loop           # 持续自动执行（推荐）
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
5. 检查 `state.json` 的 round >= maxRounds → 如果是，输出统计报告并返回

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

5. **更新 manifest.json**：
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

#### TEST 阶段 — 执行测试

**目标**：从 testQueue 取出测试并执行。

**执行策略**：Spawn 轻量子 agent 执行具体测试。

1. 从 `state.json.testQueue` 取出下一个测试 ID
2. 读取 `tests/registry/{category}/{id}.yaml` 获取测试定义
3. 检查 `safety_level` — BLOCKED 直接跳过
4. 根据 category **spawn 对应 agent**：

   **backend-api 测试** → spawn sonnet agent（tools: Bash, Read, Write）
   ```
   Prompt: 读取 tests/env.yaml 获取 API 地址和 JWT 生成方式。
   读取 tests/registry/backend-api/{id}.yaml 获取测试定义。
   读取 tests/safety.yaml 确认所有操作安全。
   读取 tests/learnings.yaml 获取已知踩坑经验。
   执行测试步骤，验证断言，结果写入 tests/results/{round}-{id}.json。
   结果格式: { status: "pass"|"fail", assertions: [...], error: null|"desc", duration_ms: N }
   ```

   **ui-interaction / ui-visual 测试** → spawn haiku agent（无 tools，只用 Playwright MCP）
   ```
   Prompt: 读取 tests/env.yaml 获取前端 URL 和 Playwright 配置。
   读取 tests/registry/ui-interaction/{id}.yaml 获取测试定义。
   读取 tests/safety.yaml — BLOCKED 操作绝不执行。
   读取 tests/learnings.yaml 获取已知踩坑经验。
   使用 Playwright 执行测试步骤。在 subagent 内 browser_snapshot 可用。
   截图保存为 JPEG 到 tests/results/screenshots/（绝不传回主 session）。
   结果写入 tests/results/{round}-{id}.json。
   只返回纯文本 PASS/FAIL + 简短原因（≤100字）。
   ```

   **workflow-e2e 测试** → spawn sonnet agent（tools: Bash, Read, Write）
   ```
   Prompt: 读取 tests/env.yaml 获取 case 池和路径配置。
   读取 tests/registry/workflow-e2e/{id}.yaml 获取测试定义。
   读取 tests/safety.yaml 确认所有操作安全。
   读取 tests/learnings.yaml 获取已知踩坑经验。
   执行 backup → prepare → run → verify → restore 流程。
   结果写入 tests/results/{round}-{id}.json。
   ```

5. Agent 返回后，读取 `tests/results/{round}-{id}.json`
6. 更新 state.json:
   - PASS → 从 testQueue 移除，stats.passed++
   - FAIL → 移入 fixQueue，stats.failed++
7. 决定下一步：
   - testQueue 非空 → 继续 TEST
   - testQueue 空 + fixQueue 非空 → phase=FIX
   - testQueue 空 + fixQueue 空 → round++, phase=SCAN

---

#### FIX 阶段 — 分析并修复代码

**目标**：从 fixQueue 取出失败测试，分析根因并修复代码。

**执行**：Spawn opus agent 进行根因分析和修复。

1. 从 `state.json.fixQueue` 取出最高优先级的失败测试
2. Spawn opus agent:
   ```
   Prompt: 你是一个 bug 修复工程师。
   读取 tests/results/{round}-{id}.json 了解失败详情（actual vs expected）。
   读取 tests/registry/{category}/{id}.yaml 了解测试定义。
   读取 tests/learnings.yaml 了解已知问题。
   分析根因，修改相关代码文件。
   如果是环境问题（不是代码 bug），将解决方案追加到 tests/learnings.yaml。
   将修复详情写入 tests/results/fixes/{id}-fix.md（包含 diff、根因、影响范围）。
   ```
3. Agent 返回后：
   - 从 fixQueue 移入 verifyQueue
   - 将相关测试标记为 "需回归" → 加入 regressionQueue
4. 更新 state.json phase=VERIFY

---

#### VERIFY 阶段 — 验证修复有效

**目标**：重跑失败的测试，确认修复有效。

**执行**：与 TEST 阶段相同方式 spawn agent 重跑测试。

1. 从 `state.json.verifyQueue` 取出测试
2. 与 TEST 阶段相同方式执行
3. 结果：
   - PASS → stats.fixed++，从 verifyQueue 移除
   - FAIL → 回到 fixQueue，附加上次修复的 context
4. 处理 regressionQueue：
   - 每个回归测试也重跑一次
   - 确保修复不破坏已有功能
5. 决定下一步：
   - verifyQueue 非空 → 继续 VERIFY
   - verifyQueue 空 + testQueue 非空 → phase=TEST
   - 全空 → round++, phase=SCAN

---

### Step 2: 更新状态

每个阶段执行完后：
1. 更新 `tests/state.json`（phase、queues、stats）
2. 追加 phaseHistory 记录
3. 如果 round 变化，生成 `tests/results/round-{N}-summary.json`

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

## 注意事项

- 每轮只执行一个阶段的一个动作（保持 context 小）
- Agent 做具体工作，主 session 只编排
- 所有状态通过文件传递，不依赖 session memory
- UI 测试 spawn haiku agent（最轻量，Playwright MCP 隔离）
- 截图绝不传回主 session（保存到文件）
- 遵循 env.yaml 的环境配置，避免重复猜测
- 遵循 learnings.yaml 的踩坑经验，避免重复犯错
