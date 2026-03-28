# Test Supervisor — 测试循环监督者

跨 session 观察和调度测试循环。提供健康诊断、趋势分析、详细审查、指令下达、演进追踪。

## 触发

```
/test-supervisor                          # 默认 dashboard 模式
/test-supervisor dashboard                # 一屏总览
/test-supervisor health                   # 深度诊断
/test-supervisor trends                   # 多轮趋势图
/test-supervisor review [round|testId]    # 详细审查
/test-supervisor directive <type> [args]  # 下达指令
/test-supervisor directives               # 查看指令队列
/test-supervisor evolution                # 自我进化时间线
```

## 文件依赖

| 文件 | 用途 |
|------|------|
| `tests/state.json` | 测试状态机（主数据源） |
| `tests/directives.json` | 跨 session 指令队列 |
| `tests/executors/health-check.sh` | 健康诊断脚本 |
| `tests/executors/stats-reporter.sh` | 统计报告（产出 round summaries） |
| `tests/executors/learnings-writer.sh` | 经验写入（directive add_learning 调用） |
| `tests/results/round-*-summary.json` | 每轮汇总（trends 读取） |
| `tests/results/{round}-{testId}.json` | 每轮每测试结果（evolution 读取） |
| `tests/results/fixes/` | 诊断/修复/验证/回归记录（evolution 读取） |
| `tests/results/{round}-{probeId}.json` | 探针结果（health 读取） |
| `tests/baselines.yaml` | 性能基线阈值 |
| `tests/evolution.json` | 框架架构变更日志（evolution 补充展示） |

## 参数解析

```
args = 用户输入去掉 "/test-supervisor " 前缀
如果 args 为空 → mode = "dashboard"
否则：
  第一个词 → mode（dashboard/health/trends/review/directive/directives/evolution）
  剩余部分 → subargs
```

---

## Mode 1: `dashboard`（默认）

**一屏总览**。快速了解测试循环当前状态。

### 执行步骤

1. 运行健康诊断：
   ```bash
   bash tests/executors/health-check.sh
   ```
2. 解析输出 JSON
3. 格式化展示：

```
═══════════════════════════════════════════
  🧪 Test Loop Dashboard
═══════════════════════════════════════════

🔄 Phase: {phase}  |  Round: {round}/{maxRounds}
🏥 Health: {health emoji} {health}

📊 Stats
   ✅ Passed: {passed}    ❌ Failed: {failed}
   🔧 Fixed: {fixed}      ⏭️ Skipped: {skipped}
   📈 Coverage: {coverage}

📋 Queues
   Test: {test}  |  Fix: {fix}  |  Verify: {verify}  |  Regression: {regression}

🏃 Currently Running
{if inProgress is empty: (none)}
{for each item in inProgress:}
   ▶ {testId} [{type}] — step: {step} — {elapsed_s}s
     └ {detail}

🔭 Observability
   Probes: {probesRun}/{probesTotal} executed
   {for each lastResult: probeId → status emoji}

📝 Directives: {pendingDirectives} pending
{if paused: ⏸️ LOOP IS PAUSED}

⚠️ Warnings:
{each warning on its own line}
═══════════════════════════════════════════
```

Health emoji 映射：
- `healthy` → ✅
- `warning` → ⚠️
- `stuck` → 🔒
- `stale` → 💤

---

## Mode 2: `health`

**深度诊断**。分析反复失败、阶段停留、探针违规。

### 执行步骤

1. 运行 `bash tests/executors/health-check.sh` → 获取基础 JSON
2. 读取 `tests/state.json` 获取完整 fixQueue 和 phaseHistory
3. 分析并输出：

#### 2a. 反复失败测试分析
```
读取 state.json → fixQueue
按 retryCount 降序排列
输出:
  🔴 Stuck Tests (retryCount >= 3):
     - {testId}: {retryCount} retries — {reason}
  🟡 Failing Tests (retryCount < 3):
     - {testId}: {retryCount} retries — {reason}
```

#### 2b. 阶段停留时间分析
```
读取 state.json → phaseHistory
计算每个 phase 的累计停留时间:
  Phase     | Entries | Total Duration
  SCAN      | 2       | 30s
  GENERATE  | 1       | 10s
  TEST      | 3       | 15m
  FIX       | 1       | 5m
  VERIFY    | 1       | 2m
```

#### 2c. Observability 探针违规
```
从 health-check.sh 的 observabilityStatus.lastResults 中:
对每个已执行的探针，读取完整结果文件:
  tests/results/{round}-{probeId}.json
检查 assertions 中 pass=false 的项:
  🔴 Probe Violations:
     - {probeId} round {N}: {assertion.name} — expected {expected}, got {actual}
如果没有违规:
  ✅ All executed probes passing
```

#### 2d. 建议动作
```
基于以上分析生成建议:
- retryCount >= 3 → "建议跳过 {testId}，已失败 {N} 次: /test-supervisor directive skip {testId} \"retries exhausted\""
- phase 停留过长 → "SCAN/GENERATE 累计时间超过总时间 50%，建议优化或强制跳到 TEST"
- 探针失败 → "修复 {probeId} 违规后重跑"
- stale → "Loop 超过 20 分钟无活动，检查是否 session 中断"
- paused → "Loop 已暂停，恢复: /test-supervisor directive resume"
```

---

## Mode 3: `trends`

**多轮趋势**。读取所有 round summary 文件展示变化。

### 执行步骤

1. 列出所有 round summary 文件：
   ```bash
   ls tests/results/round-*-summary.json 2>/dev/null | sort -V
   ```
2. 如果没有 summary 文件 → 输出 "No round summaries yet. Run test-loop first." → 返回
3. 用 node 读取所有 summary 并汇总：
   ```bash
   SUMMARIES=$(NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
     const fs = require('fs');
     const path = require('path');
     const dir = 'tests/results';
     const files = fs.readdirSync(dir)
       .filter(f => /^round-\d+-summary\.json$/.test(f))
       .sort((a,b) => {
         const na = parseInt(a.match(/round-(\d+)/)[1]);
         const nb = parseInt(b.match(/round-(\d+)/)[1]);
         return na - nb;
       });
     const summaries = files.map(f =>
       JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))
     );
     console.log(JSON.stringify(summaries));
   ")
   ```
4. 格式化输出：

```
📈 Test Loop Trends ({N} rounds)
═══════════════════════════════════════

Pass/Fail/Fix per Round:
  Round | Pass | Fail | Fix  | Skip | Coverage
  ──────┼──────┼──────┼──────┼──────┼─────────
  0     | 2    | 1    | 0    | 0    | 11%
  1     | 5    | 2    | 1    | 0    | 32%
  ...

Coverage Trend:
  R0 ████████░░░░░░░ 11%
  R1 ████████████████ 32%
  ...

Queue Trend:
  Round | TestQ | FixQ
  ──────┼───────┼──────
  0     | 15    | 1
  1     | 10    | 2
  ...

Phase History Timeline:
  {from phaseHistory in state.json}
  [16:30] SCAN (15s) → [16:32] GENERATE (10s) → [16:35] TEST (5m) → ...
```

如果只有 1 个 round，不画趋势线，但仍展示该 round 数据。

---

## Mode 4: `review [round|testId]`

**详细审查**。按 round 或 testId 深入查看。

### 参数解析
```
subargs 第一个词:
  - 纯数字 → reviewType = "round", targetRound = 数字
  - 其他 → reviewType = "testId", targetTestId = 字符串
  - 空 → 默认 reviewType = "round", targetRound = state.json.round (最新)
```

### 4a. 审查指定 Round

1. 读取 `tests/results/round-{N}-summary.json`
2. 列出该 round 所有结果文件：
   ```bash
   ls tests/results/{N}-*.json 2>/dev/null
   ```
3. 对每个结果文件读取并汇总：

```
📋 Round {N} Review
═══════════════════════════════════════

Summary: {from round-N-summary.json}
  Phase: {phase} | Tests: {total} | Coverage: {coverage}%

Results:
  ✅ {testId} — {duration_ms}ms — {assertion_count} assertions
  ❌ {testId} — {duration_ms}ms — {failed_assertions}
     └ {first failed assertion name}: expected {expected}, got {actual}
  ...
```

### 4b. 审查指定 TestId

1. 找到所有 round 中该 testId 的结果：
   ```bash
   ls tests/results/*-{testId}.json 2>/dev/null | sort -V
   ```
2. 读取 `tests/results/fixes/{testId}-analysis.md`（如果存在）
3. 读取 `tests/results/fixes/{testId}-fix.md`（如果存在）
4. 读取 `tests/results/fixes/{testId}-verify.md`（如果存在）

```
🔍 Test History: {testId}
═══════════════════════════════════════

Results across rounds:
  Round 0: ❌ FAIL — {duration}ms
     Failures: {list failed assertions}
  Round 1: ✅ PASS — {duration}ms
  ...

{if fix analysis exists:}
📝 Fix Analysis:
  {content of fixes/{testId}-analysis.md}

{if fix record exists:}
🔧 Fix Applied:
  {content of fixes/{testId}-fix.md}

{if verify record exists:}
✅ Verification:
  {content of fixes/{testId}-verify.md}
```

---

## Mode 5: `directive <type> [payload]`

**下达指令**。写入 `tests/directives.json` 供 test-loop 的 Step 0.5 处理。

### 快捷语法

| 命令 | 示例 |
|------|------|
| `directive pause` | 暂停 loop |
| `directive resume` | 恢复 loop |
| `directive skip <testId> "<reason>"` | 跳过测试 |
| `directive force_phase <phase>` | 强制切换阶段（SCAN/TEST/FIX/VERIFY） |
| `directive adjust_config <key> <value>` | 修改 state.json 配置 |
| `directive add_requirement "<description>"` | 注入新需求 |
| `directive add_learning "<id>" "<category>" "<problem>" "<solution>"` | 注入经验 |
| `directive note "<message>"` | 纯备注 |
| `directive prioritize <testId> <priority>` | 调整优先级（1=highest） |

### 执行步骤

1. 读取 `tests/directives.json`
2. 生成新指令 ID：`dir-{NNN}`（基于已有 directives 数量 + 1，3 位补零）
3. 根据 type 构造 payload：

   **pause/resume**:
   ```json
   { "type": "pause|resume", "payload": {} }
   ```

   **skip**:
   ```json
   { "type": "skip_test", "payload": { "testId": "<testId>", "reason": "<reason>" } }
   ```

   **force_phase**:
   ```json
   { "type": "force_phase", "payload": { "phase": "<SCAN|TEST|FIX|VERIFY>" } }
   ```
   验证 phase 必须是有效值，否则拒绝。

   **adjust_config**:
   ```json
   { "type": "adjust_config", "payload": { "key": "<key>", "value": "<value>" } }
   ```
   value 如果是纯数字则转为 number 类型。

   **add_requirement**:
   ```json
   { "type": "add_requirement", "payload": { "description": "<desc>", "priority": "normal", "category": "auto" } }
   ```

   **add_learning**:
   ```json
   { "type": "add_learning", "payload": { "id": "<id>", "category": "<cat>", "description": "<problem>", "solution": "<solution>" } }
   ```

   **note**:
   ```json
   { "type": "note", "payload": { "message": "<message>" } }
   ```

   **prioritize**:
   ```json
   { "type": "prioritize", "payload": { "testId": "<testId>", "priority": <N> } }
   ```

4. 写入 directive：
   ```json
   {
     "id": "dir-001",
     "type": "<type>",
     "status": "pending",
     "payload": { ... },
     "createdAt": "<ISO timestamp>",
     "processedAt": null,
     "processedResult": null
   }
   ```

5. 对于 `pause`，**额外**直接设置 `directives.json` 顶层 `paused: true`（立即生效）
6. 对于 `resume`，**额外**直接设置 `directives.json` 顶层 `paused: false`

7. 写回 `tests/directives.json`
8. 输出确认：
   ```
   ✅ Directive {id} created: {type}
   📋 Payload: {JSON payload}
   ⏳ Status: pending — will be processed in next test-loop round
   ```

### 用 node 原子写入

```bash
DIRECTIVES_FILE="tests/directives.json"
NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
  const fs = require('fs');
  const d = JSON.parse(fs.readFileSync('$DIRECTIVES_FILE', 'utf8'));
  const nextNum = (d.directives || []).length + 1;
  const id = 'dir-' + String(nextNum).padStart(3, '0');
  const now = new Date().toISOString();
  const directive = {
    id,
    type: '<TYPE>',
    status: 'pending',
    payload: <PAYLOAD_JSON>,
    createdAt: now,
    processedAt: null,
    processedResult: null
  };
  d.directives.push(directive);
  // For pause/resume, also set top-level flag
  fs.writeFileSync('$DIRECTIVES_FILE', JSON.stringify(d, null, 2) + '\n');
  console.log(JSON.stringify({ id, type: directive.type, payload: directive.payload }));
"
```

---

## Mode 6: `directives`

**查看指令队列**。列出所有已创建的指令及其状态。

### 执行步骤

1. 读取 `tests/directives.json`
2. 格式化输出：

```
📋 Directive Queue (v{version})
═══════════════════════════════════════
⏸️ Loop Paused: {yes/no}

{for each directive:}
{status_emoji} {id} [{type}] — {status}
   Payload: {JSON.stringify(payload)}
   Created: {createdAt}
   {if processed: Processed: {processedAt} — {processedResult}}

{status emoji mapping:}
  pending   → ⏳
  processed → ✅
  rejected  → ❌

─────────────────────────────────────
Summary: {pending} pending, {processed} processed, {rejected} rejected
═══════════════════════════════════════
```

如果 directives 为空：
```
📋 Directive Queue — Empty
No directives have been issued.
Use /test-supervisor directive <type> to create one.
```

---

## Mode 7: `evolution`

**自我进化时间线**。从现有测试数据自动重建 test loop 的 发现→诊断→修复→验证 闭环演化过程。

### 数据来源（自动聚合，无需手动维护）

| 数据 | 来源文件 |
|------|---------|
| 每轮发现的失败 | `tests/results/{round}-{testId}.json` |
| 诊断分析 | `tests/results/fixes/{testId}-analysis.md` |
| 修复记录 | `tests/results/fixes/{testId}-fix.md` |
| 验证结果 | `tests/results/fixes/{testId}-verify.md` |
| 回归影响 | `tests/results/fixes/{testId}-regression.md` |
| 自愈记录 | `tests/results/fixes/{pattern-id}-self-heal.md` |
| 轮次汇总 | `tests/results/round-{N}-summary.json` |
| 阶段时间线 | `tests/state.json` → phaseHistory |
| 队列流转 | `tests/state.json` → fixQueue/verifyQueue |
| 框架架构变更 | `tests/evolution.json`（手动补充） |

### 执行步骤

1. 读取 `tests/state.json` 获取 phaseHistory、stats、queues、fixQueue
2. 列出所有 `tests/results/round-*-summary.json`
3. 按 round 扫描 `tests/results/{round}-*.json`，提取每个测试的 pass/fail 状态
4. 扫描 `tests/results/fixes/` 目录，按 testId 聚合 analysis→fix→verify→regression 生命周期
5. 扫描 `tests/results/fixes/*-self-heal.md`，提取自愈记录（Pattern Type、Signature、Affected Tests、Actions）
6. 可选：读取 `tests/evolution.json`（框架架构变更记录）
7. 格式化输出：

```
🧬 Test Loop Self-Evolution Timeline
═══════════════════════════════════════════

📊 Overall: {totalTests} tests | {rounds_completed} rounds
   R0: {pass0}/{total0} pass → R{N}: {passN}/{totalN} pass
   Coverage: {coverage_r0}% → {coverage_rN}%

─────────────────────────────────────────
📍 Round 0 — DISCOVERY
   Ran {tested_count} tests, discovered {fail_count} failures:
   {for each failed test:}
   ❌ {testId} [{category}] — {first_failed_assertion}
   {end for}

─────────────────────────────────────────
📍 Round 0→1 — FIX CYCLE
   {for each test that has fix records:}

   🔬 {testId} {outcome_emoji} {SELF-HEALED|RETRY NEEDED|PENDING}
      Diagnosis: {from analysis.md — Failure Type + root cause}
      Fix: {from fix.md — Fix Type + Description}
      Modified: {from fix.md — Modified Files}
      Verify: {pass/fail from verify.md, or "pending"}
      {if regression.md exists:}
      ⚠️ Regression: {regression details}
      {end if}

   {end for}

─────────────────────────────────────────
📍 Round N→N+1 — FIX CYCLE (repeat for each subsequent round)
   {same structure}

─────────────────────────────────────────
📍 Still Evolving (current fixQueue)
   {for each item in fixQueue:}
   🔄 {testId} — retry #{retryCount} — {reason}
   {end for}

─────────────────────────────────────────
🧬 Self-Heal Records (from tests/results/fixes/*-self-heal.md)
   {for each self-heal file:}
   🧬 SELF-HEALED [{pattern-id}] {signature}
      Type: {systemic|stuck}
      Affected: {test-ids}
      Diagnosis: {diagnosis}
      Actions: {actions taken}
      Timestamp: {timestamp}
   {end for}
   {if no self-heal files: "(none)"}

─────────────────────────────────────────
🏗️ Framework Changes (from evolution.json, if exists)
   {for each entry:}
   {category_emoji} [{id}] {title} ({date})
      Before: {before}
      After:  {after}
   {end for}

═══════════════════════════════════════════
```

### 读取 fix 生命周期文件

每个 testId 最多有 4 个文件，按阶段提取关键信息：

**{testId}-analysis.md** — 提取：
- `Failure Type:` 行的值
- `Is Env Issue:` 行的值
- `## Failed Assertions` 下的第一个 bullet

**{testId}-fix.md** — 提取：
- `Fix Type:` 行的值
- `Description:` 行的值
- `Modified Files:` 行的值

**{testId}-verify.md** — 提取：
- `Status:` 行的值（pass/fail）
- `Assertions:` 行的值

**{testId}-regression.md** — 提取：
- 是否存在（存在即表示该 fix 引入了回归风险）
- 回归内容摘要

### 聚合逻辑

```
for each round R from 0 to current:
  1. 读取 round-R-summary.json 获取轮次快照
  2. 列出 tests/results/R-*.json，按 status 分组
  3. 对 status=fail 的测试，检查 fixes/ 目录是否有对应的 analysis/fix/verify
  4. 如果有 → 该测试经历了完整的"发现→诊断→修复→验证"闭环
  5. 如果 verify status=pass → 标记为 ✅ SELF-HEALED
  6. 如果 verify status=fail → 标记为 🔄 RETRY NEEDED（查看 fixQueue retryCount）
  7. 如果只有 analysis 无 fix → 标记为 ⏳ DIAGNOSED
  8. 如果无任何 fix 记录 → 标记为 ❓ UNADDRESSED
```

### Outcome emoji 映射
- ✅ SELF-HEALED — 诊断+修复+验证通过，test loop 自主解决
- 🔄 RETRY NEEDED — 修复后验证仍失败，需要再次尝试
- ⏳ DIAGNOSED — 已分析但尚未修复
- ❓ UNADDRESSED — 失败但未进入 fix 流程
- ⚠️ REGRESSION — 修复引入了新问题

### Framework Changes（补充展示）

evolution.json Category emoji 映射：
- `architecture` → 🏗️
- `throughput` → ⚡
- `observability` → 🔭
- `reliability` → 🛡️
- `usability` → 🎯
- other → 🔧

---

## 持续监控模式

`/test-supervisor` 每次调用是**瞬时快照**。要实现持续动态监控，配合 `/loop` 使用：

```
/loop 5m /test-supervisor                # 每 5 分钟刷新 dashboard
/loop 5m /test-supervisor health          # 每 5 分钟深度诊断
/loop 10m /test-supervisor trends         # 每 10 分钟看趋势（默认间隔）
```

### 推荐双 session 工作流

| Session | 用途 | 命令 |
|---------|------|------|
| Session A | 跑测试循环 | `/test-loop` |
| Session B | 持续监控 + 干预 | `/loop 5m /test-supervisor` |

Session B 中随时可以手动插入指令，不影响 `/loop` 的定时刷新：
```
/test-supervisor directive pause          # 暂停 loop
/test-supervisor directive skip xxx "reason"  # 跳过卡住的测试
/test-supervisor directive resume         # 恢复 loop
```

### `/loop` 说明
- 默认间隔 10 分钟，可自定义（如 `2m`、`5m`、`15m`）
- 仅在 session idle 时触发（不会打断正在进行的交互）
- session 关闭后自动停止

---

## 注意事项

- 所有 bash 命令中的路径使用 POSIX 格式（`/c/Users/...`）
- health-check.sh 输出纯 JSON，不混入 log 到 stdout（log 走 stderr）
- directive 写入是原子操作（读 → 修改 → 整体写回）
- 本 skill 只观察和下达指令，不直接修改 state.json（由 test-loop 处理指令）
- 唯一例外：pause/resume 同时设置 directives.json 的 `paused` 标志
