---
description: "Case 全流程处理：数据刷新 → 合规检查 → 状态判断 → 技术排查/邮件 → Inspection。用于处理单个 D365 Case。"
allowed-tools:
  - Bash
  - Read
  - Write
  - Glob
  - Grep
  - Agent
  - mcp__teams__SearchTeamsMessages
  - mcp__teams__ListChatMessages
  - mcp__icm__get_incident_details_by_id
  - mcp__icm__get_ai_summary
---

# /casework — Case 全流程处理

对单个 Case 执行完整的自动化处理流程。本 skill 是**纯编排器**——各步骤的具体执行逻辑定义在独立 skill 文件中。

## 参数
- `$ARGUMENTS` — Case 编号（如 `2603100030005863`）
- 可选标记 `--skip-data-refresh`：跳过 Step 2b（data-refresh），用于 patrol 已预先完成数据拉取的场景

## 执行步骤

### 日志规范

每个 step 执行前后 append 到 `{caseDir}/logs/casework.log`。
格式：`[YYYY-MM-DD HH:MM:SS] STEP {n} {START|OK|FAIL|SKIP} | {描述}`
用 Bash echo append 写入。`{caseDir}/logs/` 不存在时先创建。
与 timing.json 互补：timing.json 是结构化耗时，casework.log 是可读执行轨迹。

### Step 1. 读取配置
读取 `config.json` 获取 `casesRoot`
设置 `caseDir = {casesRoot}/active/{caseNumber}/`（使用绝对路径）

确保 case 目录存在：
```bash
mkdir -p "{caseDir}"
```

**⏱ 记录流程开始时间：**
用 Bash 执行 `pwsh -NoProfile -c "(Get-Date).ToString('o')"` 获取 ISO 8601 时间戳，存入变量 `t0_start`。

### Step 2a. 后台启动 teams-search Agent
使用 Agent 工具，`run_in_background: true`：
- prompt 中必须包含：
  - caseNumber
  - caseDir 的绝对路径
  - "请先读取 `.claude/agents/teams-search.md` 获取完整执行步骤"
  - "必须通过 write-teams.ps1 写文件，禁止直接用 Write 工具写 teams 目录"

### Step 2b. 内联执行 data-refresh
**如果参数包含 `--skip-data-refresh`**：跳过此步骤，记录 `STEP 2b SKIP | data-refresh (pre-fetched by patrol)`。
patrol 模式下数据已在阶段 1 串行拉取完毕，无需重复执行。

**否则**：读取 `.claude/skills/data-refresh/SKILL.md` 获取完整步骤并执行。
⏱ 记录 `t1_dataRefresh_start` / `t1_dataRefresh_end`

### Step 3a. 内联执行 compliance-check
**读取 `.claude/skills/compliance-check/SKILL.md` 获取完整步骤并执行。**
⏱ 记录 `t2_compliance_start`

### Step 3b. 内联执行 status-judge
**读取 `.claude/skills/status-judge/SKILL.md` 获取完整步骤并执行。**
⏱ 记录 `t2_compliance_end`

### Step 4. 按 actualStatus 路由执行

**⏱ 记录 `t3_routing_start`**

| actualStatus | 执行的 Agent | 说明 |
|---|---|---|
| `new` | troubleshooter → email-drafter | 新 Case 全流程 |
| `pending-engineer` | troubleshooter → email-drafter | 排查 + 回复 |
| `pending-customer` | email-drafter（仅 daysSinceLastContact ≥ 3） | 超期才 follow-up |
| `pending-pg` | （不启动额外 agent） | 仅记录 |
| `researching` | troubleshooter | 继续排查 |
| `ready-to-close` | email-drafter (closure-confirm) | 先确认客户是否同意关单 |

**关键**：pending-customer 时**不运行** troubleshooter。
**关键**：pending-pg 时不启动额外 agent，只记录当前状态。

每个 subagent 的 prompt 中必须包含：
- caseNumber、caseDir 绝对路径
- "请先读取 `.claude/agents/{agent-name}.md` 获取完整执行步骤"

**⏱ 记录各 subagent 的 start/end 时间。未执行的记入 `skippedSteps`。**
**⏱ 记录 `t3_routing_end`**

### Step 4.5. 等待 teams-search（inspection 前非阻塞检查）

用 pwsh 计算 `t0_start` 到当前的已过秒数 `elapsed`，设 `remaining = max(0, 180 - elapsed)` 秒。
使用 `TaskOutput` 检查 teams-search Agent，`timeout` 设为 `remaining * 1000` 毫秒：
- **完成** → 正常使用 teams 数据，`teamsSearchTimedOut = false`
- **超时** → 设置 `teamsSearchTimedOut = true`，**不再等待**，立即继续
  - 检查 `{caseDir}/teams/` 下是否已有缓存的 `.md` 文件（排除 `_` 开头的元文件）
  - 有缓存 → 后续步骤使用本地缓存的 teams 消息
  - 无缓存 → 跳过 teams 数据
  - 将超时事件记入 `timing.json` 的 `errors` 数组：`"teams-search TIMEOUT (3min), using cached/skipped"`
  - 将超时信息传递给 Step 5 inspection-writer

**⏱ `teamsSearch` 的 `completedAt`：正常完成用实际时间，超时则记录超时时刻。**

### Step 5. 内联执行 inspection-writer
**读取 `.claude/skills/inspection-writer/SKILL.md` 获取完整步骤并执行。**
- 将 `teamsSearchTimedOut` 作为上下文传入
⏱ 记录 `t4_inspection_start` / `t4_inspection_end`

### Step 5.5. 写入时间统计

**⏱ 记录 `t0_end`（流程结束时间）**

用之前记录的各步骤时间戳，通过 pwsh 计算耗时并写入 `{caseDir}/timing.json`：

```json
{
  "caseworkStartedAt": "{t0_start}",
  "caseworkCompletedAt": "{t0_end}",
  "totalSeconds": 180,
  "steps": {
    "dataRefresh": { "startedAt": "...", "completedAt": "...", "seconds": 60 },
    "teamsSearch": { "startedAt": "...", "completedAt": "...", "seconds": 45 },
    "complianceCheck": { "startedAt": "...", "completedAt": "...", "seconds": 30 }
  },
  "skippedSteps": ["troubleshooter", "emailDrafter"],
  "errors": []
}
```

### Step 6. 展示结果
读取最新 `{caseDir}/todo/` 文件，以 🔴🟡✅ 格式展示 Todo 汇总。

读取 `{caseDir}/timing.json`，在 Todo 汇总后展示耗时统计：
```
⏱ 总耗时 Xm Xs | data-refresh Xs | teams-search Xs | compliance Xs | ...
```
