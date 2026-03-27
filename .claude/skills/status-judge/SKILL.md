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

### 3. ICM 动态查询（如有）
有 ICM → 用 `get_ai_summary` + `get_incident_details_by_id` 查当前状态。
**有 ICM ≠ pending-pg**：PG 仍处理→pending-pg，PG 已完成→可能 pending-engineer。

### 4. 综合判断 actualStatus

枚举值：`new` | `pending-engineer` | `pending-customer` | `pending-pg` | `researching` | `ready-to-close`

**判断原则**：① 不依赖 D365 Status 字段 ② ICM 状态需动态查询 ③ 最后邮件方向≠状态，需结合内容理解意图

### 5. 计算 daysSinceLastContact
最后一封**工程师发出邮件**到现在的自然日天数（用于 ≥3 天 follow-up 判断）。

### 6. Upsert casehealth-meta.json
保留已有字段（compliance/irSla/fdr/fwr），添加/更新：
```json
{ "actualStatus": "...", "daysSinceLastContact": 2, "statusJudgedAt": "ISO8601", "statusReasoning": "一句话推理 → {status}", "emailCountAtJudge": 14, "noteCountAtJudge": 2, "icmIdAtJudge": "12345 或空字符串" }
```
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
