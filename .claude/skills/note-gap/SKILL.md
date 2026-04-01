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

### Step 4: 判断 Gap

```
读取 config.json 的 noteGapThresholdDays（默认 3）
gapDays = (now - lastNoteDate) 的天数（向下取整）

if gapDays <= threshold:
  输出: "✅ Note 正常，距上次 Note {gapDays} 天（阈值 {threshold} 天），无需补充。"
  结束
```

### Step 5: 学习历史 Note 风格

从 notes.md 提取最近 5 条**非系统** note（即不含 `系统自动分配` 的 note）：
- 分析风格特征：
  - 语言：中文 / 英文 / 混合
  - 格式：bullet point / 段落 prose / 混合
  - 开头惯用语（如 "Hi team," / "Update:" / 无开头语）
  - 签名习惯（有无结尾签名）
- 记住这些特征用于下一步生成

### Step 6: 读取最新进展

从 `{CASE_DIR}/case-summary.md` 读取 "排查进展" 部分：
- 提取 `lastNoteDate` 之后的条目（格式: `- [YYYY-MM-DD] ...`）
- 如果有新进展 → 基于这些进展构建 note 内容
- 如果无新进展 → note 内容为 status update（"Still investigating" / "仍在排查中"）

### Step 7: 生成草稿

基于 Step 5 的风格 + Step 6 的内容，生成 note 草稿。

写入 `{CASE_DIR}/note-draft.md`：

```yaml
---
title: "Status Update - {today YYYY-MM-DD}"
body: |
  {基于历史风格和最新进展生成的 note 内容}
gapDays: {gapDays}
lastNoteDate: "{lastNoteDate YYYY-MM-DD}"
generatedAt: "{now ISO8601}"
---
```

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
