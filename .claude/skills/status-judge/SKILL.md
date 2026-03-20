---
description: "判断 Case 的 actualStatus 和 daysSinceLastContact，upsert 到 casehealth-meta.json。可独立调用 /status-judge {caseNumber}，也被 casework 内联执行。"
allowed-tools:
  - Bash
  - Read
  - Write
  - mcp__icm__get_incident_details_by_id
  - mcp__icm__get_ai_summary
---

# /status-judge — Case 状态判断

综合分析 Case 的实际状态，判定 `actualStatus` 和 `daysSinceLastContact`。

## 参数
- `$ARGUMENTS` — Case 编号（如 `2603100030005863`）

## 配置读取
```
读取 config.json 获取 casesRoot
设置 caseDir = {casesRoot}/active/{caseNumber}/（使用绝对路径）
```

## 执行步骤

### 1. 读取参考知识
读取 `playbooks/rules/case-lifecycle.md` 获取 actualStatus 判定指导。

### 2. 读取 Case 数据
- 读 `{caseDir}/case-info.md` — 获取 Status、ICM Number、Case 基本信息
- 读 `{caseDir}/emails.md` — 重点关注**最后几封邮件**的方向和内容

### 3. ICM 状态动态查询（如有 ICM）
从 `case-info.md` 读取 ICM Number，如果有：
- 使用 `mcp__icm__get_ai_summary` 获取当前摘要
- 使用 `mcp__icm__get_incident_details_by_id` 获取当前状态
- **关键**：case-info.md 中有 ICM Number 不代表一定是 pending-pg，必须查询 ICM 当前状态
  - PG 仍在处理 → pending-pg
  - PG 已完成/已反馈 → 可能是 pending-engineer

### 4. 综合判断 actualStatus

**actualStatus 枚举值**：

| 值 | 含义 |
|---|---|
| `new` | 新 Case，尚无沟通记录 |
| `pending-engineer` | 轮到工程师行动 |
| `pending-customer` | 等客户回复 |
| `pending-pg` | 等产品组（ICM） |
| `researching` | 工程师正在排查中 |
| `ready-to-close` | 可关单 |

**关键判断原则**（详见 `playbooks/rules/case-lifecycle.md`）：
1. **不依赖 D365 Status 字段** — D365 Status 是需要工程师去更新的字段，不是判断输入
2. **ICM 状态需动态查询** — 有 ICM 不等于 pending-pg
3. **最后邮件方向不等于状态** — 需结合邮件内容理解意图
4. **结合邮件内容理解意图** — 如"观察几天后反馈"→ pending-customer

### 5. 计算 daysSinceLastContact
- 从最后一封**工程师发出的邮件**到现在的自然日天数
- 用于判断是否需要 follow-up（≥ 3 天 且 actualStatus = pending-customer）

### 6. Upsert casehealth-meta.json
读已有 meta → 添加/更新以下字段 → 写回。
**保留所有已有字段不变**（compliance、irSla、fdr、fwr 等）。

```json
{
  "actualStatus": "pending-engineer",
  "daysSinceLastContact": 2,
  "statusJudgedAt": "2026-03-18T10:00:00+08:00",
  "statusReasoning": "最后邮件(3/16)是工程师发出的排查建议，客户尚未回复，但ICM#12345仍在PG处理中(Active)，case主要阻塞在PG → pending-pg"
}
```

**`statusReasoning` 字段规范**：
- 一句话概括判断逻辑，包含关键依据（最后邮件方向/日期、ICM 状态、客户意图等）
- 最后用 `→ {actualStatus}` 结尾，明确推导结论
- 控制在 200 字以内（meta 是机器可读文件，不放长文）

### 7. 写日志（含完整推理链）

```bash
mkdir -p "{caseDir}/logs"
```

日志文件：`{caseDir}/logs/status-judge.log`，append 模式。

**日志格式**：

```
[YYYY-MM-DD HH:MM:SS] === status-judge START ===
[YYYY-MM-DD HH:MM:SS] INPUT | D365 Status: {d365Status} | Severity: {severity} | ICM: {icmNumber or 'none'}
[YYYY-MM-DD HH:MM:SS] EMAILS | Last email: {direction}({date}) "{subject摘要}" | Last engineer email: {date}
[YYYY-MM-DD HH:MM:SS] ICM | {ICM 查询结果摘要，如 "Active - PG investigating" 或 "Resolved - fix deployed" 或 "N/A"}
[YYYY-MM-DD HH:MM:SS] REASONING | {完整推理过程，可多行}
  - 最后邮件是工程师在3/16发出的排查建议，要求客户测试后反馈
  - 客户尚未回复（2天）
  - ICM#12345状态为Active，PG仍在调查
  - 虽然在等客户回复，但主要阻塞在PG处理
  - 结论：pending-pg
[YYYY-MM-DD HH:MM:SS] RESULT | actualStatus=pending-pg daysSinceLastContact=2
[YYYY-MM-DD HH:MM:SS] === status-judge END ===
```

**规则**：
- 用 Bash `echo` 逐行 append 写入（`>>`）
- REASONING 部分必须包含：读了什么数据 → 观察到什么 → 为什么选这个 status
- 这是排障和审计用的，要能让人事后还原判断逻辑
