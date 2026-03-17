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

对单个 Case 执行完整的自动化处理流程。

## 参数
- `$ARGUMENTS` — Case 编号（如 `2603100030005863`）

## 执行步骤

### 1. 读取配置
读取 `config.json` 获取 `casesRoot`
设置 `caseDir = {casesRoot}/active/{caseNumber}/`（使用绝对路径）

确保 case 目录存在：
```bash
mkdir -p "{caseDir}"
```

**⏱ 记录流程开始时间：**
用 Bash 执行 `pwsh -NoProfile -c "(Get-Date).ToString('o')"` 获取 ISO 8601 时间戳，存入变量 `t0_start`。

### 2. 数据刷新（Main Agent 内联 + teams-search 后台并行）

**⏱ 记录 `t1_dataRefresh_start`**

#### 2a. 后台启动 teams-search Agent
使用 Agent 工具，`run_in_background: true`：
- prompt 中必须包含：
  - caseNumber
  - caseDir 的绝对路径
  - "请先读取 `.claude/agents/teams-search.md` 获取完整执行步骤"
  - "必须通过 write-teams.ps1 写文件，禁止直接用 Write 工具写 teams 目录"

#### 2b. Main Agent 内联执行 data-refresh（与 teams-search 并行）
**不启动 subagent**，Main Agent 直接执行以下步骤。参照 `.claude/agents/data-refresh.md` 中的详细说明。

**⚠️ 重要：D365 脚本参数约定**
- 参数名是 **`-TicketNumber`**（不是 -CaseNumber）
- **`-OutputDir` 必须传 `{casesRoot}/active`（父目录，不含 case number）**
- 脚本内部会自动 `Join-Path $OutputDir $TicketNumber` 创建 case 子目录
- **调用方式**：必须用 `pwsh -NoProfile -File`（不用 `pwsh -Command`）

**Step 0: 浏览器预检（read-only，不做重连）**
```bash
# 清除上一个 case 的 incident ID 缓存（单引号防止 bash 展开 $env）
pwsh -NoProfile -c 'Remove-Item -Path (Join-Path $env:TEMP "d365-case-context.json") -Force -ErrorAction SilentlyContinue'
```
然后 `playwright-cli tab-list --browser msedge 2>&1` 检查浏览器状态：
- 输出包含 `dynamics.com` → ✅ 继续
- 否则记录 warning 并继续（`fetch-all-data.ps1` 内部有 browser restart + retry 机制）
- ⚠️ **不要**用 `playwright-cli open` 重连，会导致 profile lock 冲突

**Step 1: D365 数据拉取**
```bash
pwsh -NoProfile -File skills/d365-case-ops/scripts/fetch-all-data.ps1 -TicketNumber {caseNumber} -OutputDir {casesRoot}/active -CacheMinutes 10 -IncludeIrCheck -MetaDir {casesRoot}/active
```
产出：`case-info.md`, `emails.md`, `notes.md`, `attachments-meta.json`, IR check meta

**Step 2: 附件下载**
读 `{caseDir}/case-info.md`，找 `DTM Attachments: N`。N = 0 则跳过。
```bash
pwsh -NoProfile -File skills/d365-case-ops/scripts/download-attachments.ps1 -TicketNumber {caseNumber} -OutputDir {casesRoot}/active
```

**Step 3: ICM 数据拉取**
从 `case-info.md` 读取 ICM Number，如果有 ICM 则：
- 使用 `mcp__icm__get_ai_summary` 获取摘要
- 使用 `mcp__icm__get_incident_details_by_id` 获取详情
- 将结果写入 `{caseDir}/icm/icm-summary.md` 和 `{caseDir}/icm/icm-details.md`
- 无 ICM 则跳过

**Step 4: 写执行日志**
将各步骤执行状态写入 `{caseDir}/logs/data-refresh.log`（append 模式）。

**⏱ 记录 `t1_dataRefresh_end`（data-refresh 完成后即记录，teams-search 在后台继续运行）。**

### 3. 合规检查 + 状态判断

**⏱ 记录 `t2_compliance_start`**

#### 3a. Main Agent 直接执行合规检查（不启动 subagent）
参考 `.claude/skills/compliance-check/SKILL.md` 的步骤，Main Agent 自己执行：

**缓存跳过**：先读 meta 的 `compliance.entitlementOk`，如果已经是 `true` → 跳过整个 compliance check，写 SKIP 日志。

否则执行：
1. 读 `{caseDir}/case-info.md` 的 Entitlement 和 Customer Statement
2. Entitlement 合规：Service Name 或 Schedule 含 `China Cld`/`China Cloud` 且 Contract Country = China → ok
3. 21v Convert 检测：Customer Statement 含 `21v ticket` → 提取 21vCaseId + 21vCaseOwner
4. Upsert `{caseDir}/casehealth-meta.json`，写入 `compliance` 对象（保留其他字段不变）
5. 写日志到 `{caseDir}/logs/compliance-check.log`

**验证**：确认 meta 包含 `compliance.entitlementOk` 字段。

#### 3b. Main Agent 判断 actualStatus
合规检查完成后，Main Agent 自己：
1. 读取 `playbooks/case-lifecycle.md` 获取状态判断指导
2. 读取 `{caseDir}/emails.md` 最后几封邮件
3. 读取 `{caseDir}/case-info.md` 的 Status / ICM 信息
4. 综合判断 `actualStatus` 和 `daysSinceLastContact`
5. 将结果 upsert 到 `{caseDir}/casehealth-meta.json`（添加 `actualStatus` + `daysSinceLastContact` 字段，保留已有字段）

**⏱ 记录 `t2_compliance_end`**

### 4. 按 actualStatus 路由执行

**⏱ 记录 `t3_routing_start`**

| actualStatus | 执行的 Agent | 说明 |
|---|---|---|
| `new` | troubleshooter → email-drafter | 新 Case 全流程 |
| `pending-engineer` | troubleshooter → email-drafter | 排查 + 回复 |
| `pending-customer` | email-drafter（仅 daysSinceLastContact ≥ 3） | 超期才 follow-up |
| `pending-pg` | （不启动额外 agent） | 仅记录 |
| `researching` | troubleshooter | 继续排查 |
| `ready-to-close` | email-drafter | 关单确认 |

**关键**：pending-customer 时**不运行** troubleshooter。
**关键**：pending-pg 时不启动额外 agent，只记录当前状态。

每个 subagent 的 prompt 中必须包含：
- caseNumber、caseDir 绝对路径
- "请先读取 `.claude/agents/{agent-name}.md` 获取完整执行步骤"

**⏱ 记录各 subagent 的 start/end 时间。未执行的记入 `skippedSteps`。**
**⏱ 记录 `t3_routing_end`**

### 4.5 等待 teams-search（inspection 前非阻塞检查）

用 pwsh 计算 `t0_start` 到当前的已过秒数 `elapsed`，设 `remaining = max(0, 180 - elapsed)` 秒。
使用 `TaskOutput` 检查 teams-search Agent，`timeout` 设为 `remaining * 1000` 毫秒：
- **完成** → 正常使用 teams 数据，`teamsSearchTimedOut = false`
- **超时** → 设置 `teamsSearchTimedOut = true`，**不再等待**，立即继续
  - 检查 `{caseDir}/teams/` 下是否已有缓存的 `.md` 文件（排除 `_` 开头的元文件）
  - 有缓存 → 后续步骤使用本地缓存的 teams 消息
  - 无缓存 → 跳过 teams 数据
  - 将超时事件记入 `timing.json` 的 `errors` 数组：`"teams-search TIMEOUT (3min), using cached/skipped"`
  - 将超时信息传递给 Step 5 inspection-writer，写入 `## 本次未完成部分`

**⏱ `teamsSearch` 的 `completedAt`：正常完成用实际时间，超时则记录超时时刻。**

### 5. Inspection 汇总

**⏱ 记录 `t4_inspection_start`**

Main Agent 直接执行（不启动 subagent）。参考 `.claude/skills/inspection-writer/SKILL.md` 的步骤：
1. 读取 case 目录下所有产出文件
2. 用 Bash + `date '+%Y%m%d'` 写 `inspection-{日期}.md`（❌ 禁止 `inspection.md`）
3. 用 Bash + `date '+%y%m%d-%H%M'` 写 `todo/{时间戳}.md`
4. Upsert meta 的 `lastInspected`
5. 写日志到 `{caseDir}/logs/inspection-writer.log`

**⏱ 记录 `t4_inspection_end`**

### 5.5 写入时间统计

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

### 6. 展示结果
读取最新 `{caseDir}/todo/` 文件，以 🔴🟡✅ 格式展示 Todo 汇总。

读取 `{caseDir}/timing.json`，在 Todo 汇总后展示耗时统计：
```
⏱ 总耗时 Xm Xs | data-refresh Xs | teams-search Xs | compliance Xs | ...
```
