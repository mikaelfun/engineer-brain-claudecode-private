---
description: "判断 Case 的 actualStatus 和 daysSinceLastContact，upsert 到 casehealth-meta.json。可独立调用 /status-judge {caseNumber}，也被 casework 内联执行。"
name: status-judge
displayName: 状态判断
category: inline
stability: stable
requiredInput: caseNumber
mcpServers: [icm]
estimatedDuration: 15s
promptTemplate: |
  Execute status-judge for Case {caseNumber}. Read .claude/skills/status-judge/SKILL.md for full instructions, then execute.
allowed-tools:
  - Bash
  - Read
  - Write
  - mcp__icm__get_incident_details_by_id
  - mcp__icm__get_ai_summary
---

# /status-judge — Case 状态判断

综合分析 Case 实际状态，判定 `actualStatus` 和 `daysSinceLastContact`。

## 参数
- `$ARGUMENTS` — Case 编号

## 配置读取
读取 `config.json` 获取 `casesRoot`，设置 `caseDir = {casesRoot}/active/{caseNumber}/`（绝对路径）。

## 执行步骤

### 1. 读取参考知识
读取 `playbooks/rules/case-lifecycle.md`。

### 2. 读取 Case 数据
- `{caseDir}/case-info.md` — Status、ICM Number、基本信息
- `{caseDir}/emails.md` — **只读最后 100 行**（最近几封邮件），当前状态与最早邮件无关：
  ```bash
  tail -100 "{caseDir}/emails.md"
  ```
  邮件总数和 Note 总数从 `case-info.md` 提取（格式 `## Emails (N)` / `## Notes (N)`），供缓存用：
  ```bash
  sed -n 's/.*Emails (\([0-9]*\)).*/\1/p' "{caseDir}/case-info.md" | head -1
  sed -n 's/.*Notes (\([0-9]*\)).*/\1/p' "{caseDir}/case-info.md" | head -1
  ```
  > 以上命令合并到单次 Bash 调用中

- `{caseDir}/notes-ar.md`（如存在）— **只读最后 50 行**（AR notes 通常较少）：
  ```bash
  tail -50 "{caseDir}/notes-ar.md" 2>/dev/null || echo "(no AR notes)"
  ```
  > AR Mode 时必须读取此文件。

### 3. ICM 动态查询（如有）
有 ICM → 用 `get_ai_summary` + `get_incident_details_by_id` 查当前状态。
**有 ICM ≠ pending-pg**：PG 仍处理→pending-pg，PG 已完成→可能 pending-engineer。

### 4. 综合判断 actualStatus

枚举值：`new` | `pending-engineer` | `pending-customer` | `pending-pg` | `researching` | `ready-to-close`

**判断原则**：① 不依赖 D365 Status 字段 ② ICM 状态需动态查询 ③ 最后邮件方向≠状态，需结合内容理解意图

### AR Mode 判断原则

当 `meta.isAR === true` 时，status-judge 使用 AR 语义规则。核心区别：

**数据源变化**：
- `emails.md` — 来自 **main case**，分析客户/case owner 的最新沟通
- `notes-ar.md` — AR 专属 notes，分析 case owner 的需求和你的回复
- `ar.communicationMode` — 决定用哪套判断规则

**内部模式** (`communicationMode = "internal"`)：
- 你与 case owner 之间的沟通，不直接面对客户
- `pending-engineer` = case owner 在 notes/Teams 中提了新问题，你未回应
- `pending-customer` = 你在 notes 中回复了，等 case owner 反馈
- `ready-to-close` = AR scope 问题已解决，你已回复 case owner
- `daysSinceLastContact` = 距你最后一次在 `notes-ar.md` 中回复的天数

**客户面向模式** (`communicationMode = "customer-facing"`)：
- 你被拉入客户邮件链，直接面对客户（但只处理 AR scope 内的问题）
- `pending-engineer` = 客户发了新的 AR scope 内问题，你未回复
- `pending-customer` = 你回复了客户（AR scope 内），等客户反馈
- `ready-to-close` = 客户确认 AR scope 问题已解决
- `daysSinceLastContact` = 距你最后一次在 `emails.md` 中给客户发邮件的天数

### AR 判断步骤

1. 读取 `notes-ar.md`（如存在）— 最后几条 note
2. 读取 `emails.md` 最后 100 行（与普通 case 相同）
3. 读取 `ar.communicationMode` 和 `ar.scope`
4. **内部模式**：
   - 检查 notes-ar.md 最后一条 note 是谁写的
   - 如果是 case owner → pending-engineer
   - 如果是你 → pending-customer 或 researching
5. **客户面向模式**：
   - 分析 emails.md 最后几封邮件
   - 如果客户最后发邮件且涉及 AR scope → pending-engineer
   - 如果你最后发邮件（AR scope 回复）→ pending-customer
6. ICM 查询逻辑与普通 case 相同

### 4b. 推荐下一步行动（recommendedActions）

在判定 actualStatus 后，综合以下已读取的上下文推理最优行动：

- `actualStatus` + `daysSinceLastContact`
- `case-summary.md`（排查进展、关键发现、风险）
- `emails.md` 最后几封邮件（沟通状态、是否已发送关键邮件）
- `notes.md` / `notes-ar.md`（最新工作记录）
- ICM 状态（如有 ICM：PG 是否在处理、是否有新回复）
- `drafts/` 目录是否有未发送草稿（`ls {caseDir}/drafts/*.md 2>/dev/null | wc -l`）

**推理指导**（非严格规则，LLM 应综合判断）：
1. 排查已完成 + 邮件已发送 + ICM pending PG → `no-agent`（等 PG 即可）
2. 有未发送草稿且内容仍相关 → `no-agent`（用户只需发送现有草稿）
3. 排查完成但未告知客户/case owner → `email-drafter`（不需要 troubleshooter）
4. 有新信息需要排查（客户新提供数据、PG 有新回复需要验证）→ `troubleshooter`
5. 新 case + 需要初始排查和首次沟通 → `troubleshooter+email-drafter`
6. 判断不确定 → 留空 `recommendedActions: []`（让 routing fallback 到路由表）

**输出格式**：
```json
"recommendedActions": [
  {
    "action": "no-agent | troubleshooter | email-drafter | troubleshooter+email-drafter",
    "reason": "≤100字，解释为什么推荐这个行动"
  }
]
```

**action 枚举**：
| action | casework 行为 |
|--------|-------------|
| `no-agent` | 跳过 agent spawn，直接到 inspection |
| `troubleshooter` | 仅 spawn troubleshooter |
| `email-drafter` | 仅 spawn email-drafter |
| `troubleshooter+email-drafter` | spawn 两者（先 troubleshooter 后 email-drafter） |

> ⚠️ 仅在 CHANGED 路径（status-judge 实际执行时）输出。快速路径（cache hit）不输出 recommendedActions。
> ⚠️ AR Mode 同样输出 recommendedActions，但推理时考虑 AR scope 和 communicationMode。

### 5. 计算 daysSinceLastContact
最后一封**工程师发出邮件**到现在的自然日天数（用于 ≥3 天 follow-up 判断）。

### 6. Upsert casehealth-meta.json
保留已有字段（compliance/irSla/fdr/fwr），添加/更新：
```json
{ "actualStatus": "...", "daysSinceLastContact": 2, "statusJudgedAt": "ISO8601", "statusReasoning": "一句话推理 → {status}", "emailCountAtJudge": 14, "noteCountAtJudge": 2, "icmIdAtJudge": "12345 或空字符串", "recommendedActions": [{"action": "...", "reason": "..."}] }
```

> ⚠️ AR Mode 时，保留已有的 `isAR`、`mainCaseId`、`ar` 字段不覆盖。status-judge 只写入 `actualStatus`/`daysSinceLastContact`/`statusJudgedAt`/`statusReasoning`/`emailCountAtJudge`/`noteCountAtJudge`/`icmIdAtJudge`。
- `statusReasoning`：含关键依据，以 `→ {actualStatus}` 结尾，≤200 字。
- `emailCountAtJudge`：本次 judge 时 emails.md 的邮件总数（从文件头 `Emails (N)` 提取）。
- `noteCountAtJudge`：本次 judge 时 notes.md 的 Note 总数（从文件头 `Notes (N)` 提取）。
- `icmIdAtJudge`：本次 judge 时 case-info.md 中的 ICM Number（无则空字符串）。
- 以上三个字段用于下次缓存判断，任一变化触发重新 judge。

### 7. 写日志（单次 Bash + heredoc）

```bash
mkdir -p "{caseDir}/logs" && cat >> "{caseDir}/logs/status-judge.log" << SJEOF
[$(date '+%Y-%m-%d %H:%M:%S')] === status-judge START ===
[$(date '+%Y-%m-%d %H:%M:%S')] INPUT | D365 Status: {d365Status} | Severity: {severity} | ICM: {icmNumber or 'none'}
[$(date '+%Y-%m-%d %H:%M:%S')] EMAILS | Last: {direction}({date}) "{subject}" | Last engineer: {date}
[$(date '+%Y-%m-%d %H:%M:%S')] ICM | {摘要 or "N/A"}
[$(date '+%Y-%m-%d %H:%M:%S')] REASONING | {推理要点} → {actualStatus}
[$(date '+%Y-%m-%d %H:%M:%S')] RESULT | actualStatus={status} daysSinceLastContact={days}
[$(date '+%Y-%m-%d %H:%M:%S')] === status-judge END ===
SJEOF
```
**禁止**多次 `echo >>` 逐行写入。
