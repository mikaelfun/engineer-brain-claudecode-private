---
name: note-gap
displayName: Note Gap 检测
description: "检测 Case Note 时间间隔过长，自动生成补充 Note 草稿。"
category: inline
stability: beta
requiredInput: caseNumber
estimatedDuration: 20s
promptTemplate: |
  Execute note-gap for Case {caseNumber}. Read .claude/skills/note-gap/SKILL.md for full instructions, then execute.
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
---

# Note Gap — 检测 & 生成

检测 Case Note 时间间隔是否过长，自动生成风格一致的补充 Note 草稿。

## 触发

```
/note-gap {caseNumber}
```

## 执行步骤

### Step 1: 确定 Case 目录

读取 `config.json` 的 `casesRoot`，定位 case 目录：
```bash
CASE_DIR="{casesRoot}/active/{caseNumber}"
```

### Step 2: 刷新 notes.md（如需要）

检查 `{CASE_DIR}/notes.md`：
- **不存在** → 执行 `pwsh skills/d365-case-ops/scripts/fetch-notes.ps1 -TicketNumber {caseNumber} -OutputDir "{CASE_DIR}"`
- **存在但修改时间 > 24小时** → 同上，加 `-Force` 刷新
- **存在且 < 24小时** → 直接使用

用 Git Bash 判断文件年龄：
```bash
FILE_AGE_HOURS=$(( ($(date +%s) - $(stat -c %Y "{CASE_DIR}/notes.md" 2>/dev/null || echo 0)) / 3600 ))
```

### Step 3: 解析最新 note 时间

从 `notes.md` 中提取所有 note 时间戳：
- 格式: `### 📝 {M/D/YYYY H:MM AM|PM} | {author}`
- **过滤掉**含 `系统自动分配` 的系统 note
- 取最新一条的日期，解析为 Date 对象

**新 Case 检测：**
- 如果过滤后无任何人工 note（notes.md 不存在、为空、或全是系统 note）→ 标记 `isNewCase = true`
- 从 `{CASE_DIR}/casehealth-meta.json` 读取 `createdon` 字段，确认 case 是否当天创建
- 如果 `isNewCase = true` 且 case 当天创建 → 进入 Step 4 新 case 分支

### Step 4: 判断 Gap

**4a. 新 Case 分支（`isNewCase = true`）：**
```
if isNewCase:
  输出: "📋 新 Case 检测 — 无历史 Note，生成日终操作记录"
  跳过 gapDays 阈值检查，直接进入 Step 5
```

**4b. 常规分支（`isNewCase = false`，有人工 note）：**
```
读取 config.json 的 noteGapThresholdDays（默认 3）
gapDays = (now - lastNoteDate) 的天数（向下取整）

if gapDays <= threshold:
  输出: "✅ Note 正常，距上次 Note {gapDays} 天（阈值 {threshold} 天），无需补充。"
  结束
```

### Step 5: 用户 Note 偏好（硬规则）

**以下偏好不需要 AI 猜测，直接应用：**

- **Title 固定**: `fangkun note`（永远不变）
- **Body 格式**:
  - 每个日期一行，格式 `YYMMDD--`（如 `260315--`）
  - 同一天的多个条目用 bullet point（`- -`）
  - 内容用英文，简洁，工程师视角
  - 不要开头问候语（No "Hi team"），不要签名
  - 每条以动词开头（`-followed up`, `-collected logs`, `-advised cx`）

**示例 body**:
```
260315--
- -followed up with cx on workaround deployment status.
- -collected diagnostic logs for analysis.
260320--
- -confirmed MDM config is in effect on device.
- -advised cx to reboot for full validation.
260401--
- -ICM resolved by PG, pending cx confirmation on closure.
```

### Step 6: 读取最新进展

**6a. 新 Case 模式（`isNewCase = true`）：**

从多个数据源提取当天操作记录：

1. **`{CASE_DIR}/casehealth-meta.json`**：
   - `irSla.status` → `"Succeeded"` 时记录 `"met IR SLA"`
   - `emails`（数量）→ >0 时记录 `"sent initial response / first quality response"`
   - `actualStatus` → 当前状态描述

2. **`{CASE_DIR}/case-summary.md`**（如存在）：
   - 提取当天日期的条目
   - 转为 note 格式

3. **兜底**：如果以上都无内容，至少生成：
   ```
   YYMMDD--
   - -new case received, initial assessment in progress.
   ```

**6b. 常规模式（`isNewCase = false`）：**

从 `{CASE_DIR}/case-summary.md` 读取 "排查进展" 部分：
- 提取 `lastNoteDate` 之后的条目（格式: `- [YYYY-MM-DD] ...`）
- 如果有新进展 → 基于这些进展构建 note 内容
- 如果无新进展 → note 内容为 status update（"Still investigating" / "仍在排查中"）

### Step 7: 生成草稿

基于 Step 5 的固定偏好 + Step 6 的进展内容，生成 note 草稿。

写入 `{CASE_DIR}/note-draft.md`：

```yaml
---
title: "fangkun note"
body: |
  {按 YYMMDD-- 格式组织，每天一组 bullet points}
gapDays: {gapDays}  # 新 case 时为 0
lastNoteDate: "{lastNoteDate YYYY-MM-DD}"  # 新 case 时为 "none"
isNewCase: {true/false}
generatedAt: "{now ISO8601}"
---
```

**生成规则：**
1. 从 case-summary.md 提取 lastNoteDate 之后的每个日期条目
2. 按日期分组，每组格式 `YYMMDD--`
3. 每条进展转为 `- -{简洁英文动词开头}`
4. 如果某天无进展但需要补充，写 `- -continued investigation, no update.`

### Step 8: 展示草稿

在终端展示：

```
⚠️ Note Gap 检测 — Case {caseNumber}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
距上次 Note: {gapDays} 天（阈值: {threshold} 天）
上次 Note: {lastNoteDate} by {lastNoteAuthor}

📝 生成的 Note 草稿:
Title: {title}
Body:
{body}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
草稿已保存到 note-draft.md
CLI: 确认后可直接写入 D365
WebUI: 可在 Case 详情页编辑后写入
```

### Step 9: 用户确认写入（CLI 模式）

如果用户确认写入：
```bash
pwsh skills/d365-case-ops/scripts/add-note.ps1 \
  -TicketNumber {caseNumber} \
  -Title "{title}" \
  -Body "{body}" \
  -OutputDir "{CASE_DIR}"
```

写入后验证：
```bash
pwsh skills/d365-case-ops/scripts/fetch-notes.ps1 \
  -TicketNumber {caseNumber} \
  -OutputDir "{CASE_DIR}" \
  -Force
```

验证成功后删除 `note-draft.md`。

如果用户不确认，保留 `note-draft.md` 供后续 WebUI 编辑使用。
