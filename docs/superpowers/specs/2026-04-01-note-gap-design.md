# Note Gap 检测与生成 — 设计文档

> 日期: 2026-04-01
> 状态: Draft
> 作者: Kun Fang + Claude

## 1. 背景与动机

Azure 支持工程师需要定期在 D365 Case Timeline 中补充 Note，记录排查进展。当 Case 处理周期长或多任务并行时，容易出现 Note 间隔过长的情况，影响 Case 管理质量和客户体验。

**目标：** 自动检测 Note 时间间隔过长的 Case，基于历史 note 风格和最新排查进展生成草稿，供用户确认后写入 D365。

## 2. 设计目标

1. **CLI/WebUI 统一** — 一个 SKILL.md 定义，通过 skill registry 暴露给 WebUI
2. **可独立调用也可被 casework 编排** — `/note-gap 1234567` 或 casework 流程自动触发
3. **用户掌控** — AI 只生成草稿，写入由用户决定；WebUI 可编辑后写入
4. **风格一致** — 学习用户历史 note 风格，生成自然一致的内容

## 3. 检测逻辑

### 3.1 数据刷新策略

```
读取 {caseDir}/notes.md:
  - 文件不存在 → 调用 fetch-notes.ps1 拉取
  - 文件存在但修改时间 > 1天 → 调用 fetch-notes.ps1 刷新
  - 文件存在且 < 1天 → 直接使用
```

### 3.2 Gap 判断

```
1. 解析 notes.md，提取最新一条非系统 note 的时间戳
   - 匹配格式: ### 📝 {YYYY-MM-DD HH:mm} | {author}
   - 过滤掉系统自动分配 note

2. 计算 gapDays = (now - lastNoteDate) / 86400000

3. 判断:
   - gapDays > threshold → 有 gap，进入生成流程
   - gapDays <= threshold → 无 gap，输出 "Note 正常，无需补充"
```

### 3.3 阈值配置

- 默认阈值: 3 天
- 配置位置: `config.json` 新增字段 `noteGapThresholdDays`
- 可在 WebUI Settings 页修改

## 4. Note 生成逻辑

### 4.1 风格学习

```
1. 从 notes.md 提取最近 5 条非系统 note
2. 分析风格特征:
   - 语言 (中文/英文/混合)
   - 长度范围 (短句/段落)
   - 格式 (纯文本/bullet point/结构化)
   - 开头惯用语 (如 "Hi team," / "Update:" 等)
3. 作为 few-shot examples 指导生成
```

### 4.2 内容来源

```
1. 读取 case-summary.md 的 "排查进展" 部分
2. 找到自 lastNoteDate 以来的新进展条目
3. 情况分支:
   - 有新进展 → 基于进展内容生成 note
   - 无新进展 → 生成 status update 类型 note（"仍在排查中"）
```

### 4.3 输出格式

生成到 `{caseDir}/note-draft.md`:

```yaml
---
title: "Status Update - 2026-04-01"
body: |
  Hi team,
  
  We have been investigating the issue and found that...
  
  Next steps:
  - ...
gapDays: 5
lastNoteDate: "2026-03-27"
generatedAt: "2026-04-01T10:30:00+08:00"
---
```

## 5. 写入流程

### 5.1 CLI 流程

```
1. 检测到 gap → 生成草稿
2. 在终端展示:
   ┌─ Note Gap 检测 ──────────────────────┐
   │ 距上次 Note: 5 天 (阈值: 3 天)        │
   │ 上次 Note: 2026-03-27 by Kun Fang     │
   │                                        │
   │ Title: Status Update - 2026-04-01     │
   │ Body:                                  │
   │   Hi team, ...                         │
   └────────────────────────────────────────┘
3. 生成 todo item: 🔴 补充 Note → {title}
4. 用户确认 → 调用 add-note.ps1 -Title "{title}" -Body "{body}"
5. fetch-notes.ps1 验证写入成功
```

### 5.2 WebUI 流程

```
1. 前端检测到 note-draft.md 存在 → 显示 "Note Gap" 卡片
2. 卡片内含:
   - gap 天数 + 上次 note 日期 (只读信息)
   - 可编辑的 title 输入框 (预填 AI 生成)
   - 可编辑的 body 文本框 (预填 AI 生成)
   - "写入 D365" 按钮
   - "忽略" 按钮
3. "写入 D365":
   → POST /api/case/:id/note-gap/submit (body: {title, body})
   → 后端调用 add-note.ps1 + fetch-notes.ps1 验证
   → 删除 note-draft.md
4. "忽略":
   → DELETE /api/case/:id/note-gap
   → 删除 note-draft.md
```

### 5.3 WebUI 后端端点

- `POST /api/case/:id/note-gap/submit` — 写入 note 到 D365
  - Body: `{ title: string, body: string }`
  - 执行: `add-note.ps1 -Title -Body -TicketNumber`
  - 验证: `fetch-notes.ps1 -TicketNumber`
  - 清理: 删除 `note-draft.md`

- `DELETE /api/case/:id/note-gap` — 忽略/关闭 gap 提示
  - 删除 `note-draft.md`

- `GET /api/case/:id/note-gap` — 获取当前 gap 状态
  - 返回: `{ hasGap: boolean, draft?: { title, body, gapDays, lastNoteDate } }`

## 6. Casework 集成

casework 的 SKILL.md `steps` 列表中加入 `note-gap`，放在 `inspection-writer` 之前:

```yaml
steps:
  - data-refresh
  - compliance-check
  - status-judge
  - teams-search
  - troubleshoot
  - draft-email
  - note-gap          # ← 新增
  - inspection-writer
```

casework 编排时自动调用 note-gap skill。有 gap 则生成草稿 + todo 提示，无 gap 则跳过。

## 7. Skill Registry Frontmatter

```yaml
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
---
```

## 8. 影响范围

### 新增

| 文件 | 说明 |
|------|------|
| `.claude/skills/note-gap/SKILL.md` | Skill 定义 + 执行逻辑 |
| `dashboard/src/routes/note-gap-routes.ts` | 3 个 API 端点 |
| `dashboard/web/src/components/NoteGapCard.tsx` | 前端编辑卡片组件 |

### 修改

| 文件 | 说明 |
|------|------|
| `.claude/skills/casework/SKILL.md` | steps 列表加入 note-gap |
| `dashboard/src/index.ts` | 注册 note-gap 路由 |
| `dashboard/web/src/pages/CaseDetail.tsx` 或 `CaseAIPanel.tsx` | 展示 NoteGapCard |
| `config.json` | 新增 `noteGapThresholdDays` 配置字段 |

### 不改动

- `add-note.ps1` / `fetch-notes.ps1` — 直接复用
- Skill Registry 服务 — 自动发现新 SKILL.md
- Session 管理 — 复用现有机制

## 9. 边界情况

| 情况 | 处理 |
|------|------|
| notes.md 为空（新 case，无历史 note） | 无法学习风格，用默认英文模板 |
| case-summary.md 不存在 | 先运行 data-refresh，再检测 |
| note-draft.md 已存在（之前生成未处理） | 覆盖重新生成 |
| add-note.ps1 写入失败 | 返回错误，保留 note-draft.md |
| 用户编辑后 body 为空 | 前端校验，不允许空 body 提交 |
