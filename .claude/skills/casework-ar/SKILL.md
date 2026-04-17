---
description: "AR Case 全流程：data-refresh(AR mode) → assess-ar → act-ar → summarize"
name: casework-ar
displayName: AR Case 处理
category: orchestrator
stability: beta
requiredInput: caseNumber
promptTemplate: |
  Process AR Case {caseNumber}. Read .claude/skills/casework-ar/SKILL.md and follow all steps.
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Agent
  - Glob
  - Grep
---

# /casework-ar — AR Case 全流程

AR Case 专用四步编排。与主 `/casework` 完全独立，复用 data-refresh.sh（AR mode）和 summarize，定制 assess-ar 和 act-ar。

## 触发条件

Case number ≥ 19 位（D365 AR case 编号格式），或 `casework-meta.json` 中 `isAR === true`。

## 前置步骤：AR 检测 + meta 初始化

```bash
CASE_DIR="{casesRoot}/active/{caseNumber}"
META="$CASE_DIR/casework-meta.json"

# 提取 main case ID（前 16 位）
MAIN_CASE_ID=$(echo "{caseNumber}" | cut -c1-16)

# Upsert meta
python3 -c "
import json, os
p = r'$META'
try: m = json.load(open(p, encoding='utf-8'))
except: m = {}
m['isAR'] = True
m['mainCaseId'] = '$MAIN_CASE_ID'
m.setdefault('ar', {})
os.makedirs(os.path.dirname(p), exist_ok=True)
json.dump(m, open(p, 'w', encoding='utf-8'), indent=2, ensure_ascii=False)
"
```

## 四步流程

### Step 1. Data Refresh（AR mode）

```bash
bash .claude/skills/casework/scripts/data-refresh.sh \
  --case-number {caseNumber} \
  --case-dir {caseDir} \
  --is-ar true \
  --main-case-number $MAIN_CASE_ID
```

AR mode 差异：
- 使用 `-MainCaseNumber` 从 main case 拉 D365 数据（case-info、emails、notes 均来自 main case）
- **⚠️ emails.md 来自 main case**：D365 中邮件活动（Email Activity）绑在 main case 上，AR case 没有独立的邮件。`fetch-all-data.ps1 -MainCaseNumber` 用 main case ID 查询邮件并写入 AR case 的 `emails.md`
- 不执行 IR check
- Teams 搜索：搜 AR case number + case owner 名

### Step 2. Assess（AR 专用）

读取 `.claude/skills/casework-ar/assess-ar/SKILL.md`，执行 AR assess：
- AR scope 提取
- communicationMode 检测
- 双模式 status 判断
- 产出 `.casework/execution-plan.json`

### Step 3. Act（AR 专用）

读取 `.claude/skills/casework-ar/act-ar/SKILL.md`，执行 AR act：
- 按 communicationMode 选收件人
- troubleshooter 限定 AR scope

### Step 4. Summarize

读取 `.claude/skills/casework/summarize/SKILL.md`（复用主 summarize）：
- case-summary.md 使用 AR 视角（inspection-writer 已有 AR 规则）
- generate-todo.sh 自动应用 AR 规则（跳过 SLA 等）

## Mode 差异

| | casework-ar(mode=full) | casework-ar(mode=patrol) |
|---|---|---|
| 调用者 | 用户直接 `/casework-ar` | patrol spawn |
| 执行范围 | Step 1→2→3→4 | Step 1→2 only |
| Step 3 | 自己 spawn | patrol 做 |

patrol mode 时，Step 2 产出 execution-plan.json 后退出，patrol 主 agent 读取 plan 后用 act-ar 路由表 spawn agent。

## 与主 /casework 的关系

- 主 `/casework` 不含任何 AR 逻辑
- AR case 始终走 `/casework-ar`
- patrol 通过 case number 长度自动路由：≥19 位 → casework-ar，<19 位 → casework
- 两者共用 data-refresh.sh（传 `--is-ar` 参数）和 summarize SKILL.md

## Safety Redlines

- ❌ 不直接发邮件
- ❌ D365 写操作需用户确认
- ✅ AR scope 限定所有分析和邮件
- ✅ compliance 基于 main case 数据（从 case-info.md 提取）
