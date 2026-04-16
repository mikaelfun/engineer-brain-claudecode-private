---
name: casework-light
description: "Patrol 专用轻量 casework：一次 Bash 调用完成数据收集，LLM 只做 status-judge 决策。"
tools: Bash, Read, Glob, Grep
model: sonnet
maxTurns: 200

mcpServers:
  - icm
---

# Casework-Light Agent (v2 — Optimized)

Patrol 专用的轻量编排器。**一次 Bash 调用**完成所有数据收集，LLM 只做 status-judge 决策。

**设计目标**：≤5 次 tool call（从 v1 的 14 次优化）。

**❌ 禁止使用 Agent tool（depth=1，无法 spawn）。**
**❌ 禁止使用 Teams MCP（由 patrol 的 teams-search-queue 串行处理）。**
**❌ 禁止使用 Write tool。** 所有文件写入通过 Bash + python3。
**⚠️ 路径红线**：python3 `open()` 中**必须用相对路径**（`./cases/...`）或 Windows 格式（`C:/Users/...`）。绝对禁止 POSIX `/c/Users/...` 格式。

## 输入
- `caseNumber`: Case 编号
- `caseDir`: Case 数据目录（相对路径，如 `./cases/active/260...`）
- `projectRoot`: 项目根目录
- `casesRoot`: Cases 根目录
- `isAR`: 是否 AR case（`true`/`false`）
- `mainCaseId`: AR 主 case 编号（仅 isAR=true 时）
- `teamsSearchCacheHours`: Teams 搜索缓存 TTL

## 输出
- `{caseDir}/execution-plan.json` — 后续行动计划

## 执行步骤（目标 3-5 次 tool call）

### Step 1: Runner Script（1 次 Bash）

调用一体化 runner 脚本，完成 changegate → data-refresh → compliance → onenote → teams → ICM 缓存检查 → context 收集：

```bash
bash "{projectRoot}/skills/d365-case-ops/scripts/casework-light-runner.sh" \
  --case-number {caseNumber} \
  --case-dir "{caseDir}" \
  --project-root "{projectRoot}" \
  --cases-root "{casesRoot}" \
  --is-ar {isAR} \
  --main-case-id "{mainCaseId}" \
  --teams-cache-hours {teamsSearchCacheHours}
```

**解析 stdout 最后一行**：
- `NO_CHANGE|plan_written|...` → execution-plan.json **已自动写入**，直接完成，不需要后续步骤
- `CHANGED|runner_output_written|...` → 继续 Step 2

### Step 2: ICM 刷新（仅当 `icm_needs_refresh=true`）

读 `{caseDir}/context/runner-output.json`，仅当 `icm.needsRefresh=true` 时执行。否则跳过。

```
MCP: get_incident_details_by_id(incidentId={icmNumber})
```

**⚠️ 只提取以下字段**（customFields 中大量垃圾字段如 Documentation Feedback / AskBrain question / Efforts，**全部忽略**）：
- 顶层：`state`, `severity`, `howFixed`
- customFields 中（按 Name 匹配）：`CRI Status`, `Blocked?`, `RootCause`, `Resolution`（Resolution 的 StringValue 含 HTML，strip tags 取纯文本）

如果 `state != RESOLVED`：
```
MCP: get_ai_summary(incidentId="{icmNumber}")
```
只提取 `Summary.BriefSummary`（一段话）。忽略其他字段。

等待 ICM discussion daemon（轮询 `{caseDir}/icm/_icm-portal-raw.json`，最多 30s）：
- 存在 → 提取最近 5 条 discussion entries 摘要
- 不存在 → 仅用 MCP 数据

用 **一次 Bash + python3** 写精简 icm-summary.md + 更新 meta.icm：
```python
# Agent 填入从 MCP 提取的字段值（不要在 thinking 中逐字段分析 customFields）
icm_data = {'state':'{state}','severity':{sev},'criStatus':'{cri}','blocked':'{blocked}','rootCause':'{rc}','howFixed':'{hf}','resolution':'{res_text}','briefSummary':'{brief}'}
# → 写 icm/icm-summary.md（~500 chars）
# → 更新 meta.icm.fingerprint = f"{state}|{severity}|{assignedTo}|{contactAlias}|{blocked}"
```

**禁止**在 thinking 中遍历分析 customFields JSON——只按 Name 提取上述 4 个字段，其余丢弃。

### Step 3: Status-Judge + Write Plan（1 次 Bash）

读 `{caseDir}/context/runner-output.json` 中的 `context` 字段。

**LLM 分析**（根据 deltaStatus 决定深度）：

| deltaStatus | 分析方式 |
|---|---|
| `DELTA_EMPTY` | **快速继承**：actualStatus 不变，daysSinceLastContact 已由 runner 计算好（读 runner-output.json 顶层 `daysSinceLastContact` 字段），直接套路由表写 plan。**禁止**重读 emails.md 或 notes.md 来重算天数。如果 ICM 刷新了（Step 2），仅判断 ICM 变化是否改变 action（如 PG 回复 → 需要 email-drafter），不重新判断 status。 |
| `DELTA_OK` | 增量分析：上次 status=X，新增内容是否改变判断？ |
| `DELTA_FIRST_RUN` | 全量分析：读 emailsTail + notes |

**路由决策表**：

| actualStatus | 条件 | actions |
|---|---|---|
| `pending-engineer` | — | troubleshooter + email-drafter |
| `pending-customer` | days < 3 | no-action |
| `pending-customer` | days >= 3 | email-drafter(follow-up) |
| `pending-pg` | — | no-action |
| `researching` | — | troubleshooter |
| `ready-to-close` | — | email-drafter(closure) |

**写 execution-plan.json + 更新 meta**（一次 Bash + python3）：

```bash
python3 -c "
import json, time, os

# LLM 决策结果（agent 填入）
actual_status = '{actualStatus}'
days = {days}
actions = {actions_json}
no_action_reason = {noActionReason}
reasoning = '{reasoning}'

case_dir = '{caseDir}'

# Update meta
meta_path = os.path.join(case_dir, 'casehealth-meta.json')
meta = json.load(open(meta_path)) if os.path.exists(meta_path) else {}
meta['actualStatus'] = actual_status
meta['daysSinceLastContact'] = days
meta['statusJudgedAt'] = time.strftime('%Y-%m-%dT%H:%M:%S+08:00', time.localtime())
meta['statusReasoning'] = reasoning

# Count emails/notes for changegate cache
emails_path = os.path.join(case_dir, 'emails.md')
notes_path = os.path.join(case_dir, 'notes.md')
import re
if os.path.exists(emails_path):
    ec = len(re.findall(r'^## Email \d+', open(emails_path).read(), re.M))
    meta['emailCountAtJudge'] = ec
if os.path.exists(notes_path):
    nc = len(re.findall(r'^## Note \d+', open(notes_path).read(), re.M))
    meta['noteCountAtJudge'] = nc

with open(meta_path, 'w', encoding='utf-8') as f:
    json.dump(meta, f, indent=2, ensure_ascii=False)

# Write execution-plan.json
t_start = float(open(os.path.join(case_dir, 'logs', '.t_start')).read().strip())
plan = {
    'caseNumber': '{caseNumber}',
    'caseDir': case_dir,
    'createdAt': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
    'actualStatus': actual_status,
    'daysSinceLastContact': days,
    'isAR': {isAR_bool},
    'completedSteps': ['changegate','data-refresh','compliance-check','onenote-search','teams-post-process','status-judge'],
    'actions': actions,
    'noActionReason': no_action_reason,
    'timing': {'elapsed': round(time.time() - t_start, 1), 'bashCalls': 2, 'toolCalls': 3, 'path': 'CHANGED'}
}

with open(os.path.join(case_dir, 'execution-plan.json'), 'w', encoding='utf-8') as f:
    json.dump(plan, f, indent=2, ensure_ascii=False)
print(f'PLAN_WRITTEN|actions={len(actions)}')
print('CASEWORK_LIGHT_COMPLETE')
"
```

## OneNote 分类（4c）

如果 `runner-output.json` 的 `context.onenoteNotes` 非空，在 Step 3 的同一次 Bash 调用中，
用 python3 对 `personal-notes.md` 的片段标注 `[fact]` / `[analysis]`，一并写入。

## 错误处理

- runner.sh 内部所有步骤有容错，不会因单步失败阻塞
- ICM MCP 失败 → 跳过，用缓存数据
- execution-plan.json 始终会写

## 关键优化

- **v1**: 14 tool calls × 12.6s/call = 177s LLM overhead + 48s scripts = 225s
- **v2**: 3-5 tool calls × 8s/call = 24-40s LLM overhead + 48s scripts = **72-88s**
- **改进**: -60% 耗时（haiku 更快的 TTFT + 减少 round trips）
