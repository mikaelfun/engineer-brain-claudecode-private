---
name: prd-creator
displayName: PRD 生成
category: inline
stability: dev
description: "从项目代码/需求生成 PRD 产品需求文档 + 任务拆解。交互式问答→PRD.md→tasks.json"
---

# PRD Creation Assistant

Transform software ideas into comprehensive PRDs and actionable implementation tasks through a two-part process.

## Modes

本 skill 支持两种模式：

### Mode A: 正向创建（从需求到 PRD）
从用户描述/需求出发，通过交互式问答生成 PRD。适合**新项目**或**新功能**。

### Mode B: 逆向提取（从代码到 PRD）
从现有代码库出发，自动分析架构、功能、用户流程，反推生成 PRD。适合**已有项目**需要补文档、向他人介绍项目、或梳理产品全貌。

**自动判断**：
- 用户说 "生成 PRD"/"写需求文档" + 无具体描述 → 问用户选 Mode A 还是 B
- 用户说 "根据代码生成 PRD"/"反推 PRD"/"从项目生成需求文档" → 直接进 Mode B
- 用户提供了具体功能描述 → 直接进 Mode A

---

## Mode A: 正向创建

### Part A.1: Implementation Description

You will receive a lacking implementation description from the user.
The main goal is to comprehend the intent and think about the larger architecture and a robust way to implement it, filling in the gaps.

### Part A.2: PRD Creation

**File**: [references/PRD.md](references/PRD.md)

You will need to ask clarifying questions to get a clear understanding of the implementation.

**When to use**: User wants to document a software idea or create feature specifications

**What it does**:
- Guides structured questioning to gather all requirements
- Creates executive summary for validation
- Researches competitive landscape
- Generates comprehensive PRD.md

**Process**:
1. Ask clarifying questions using `AskUserQuestion` tool
2. Create executive summary for user approval
3. Research competition via WebSearch
4. Generate complete PRD
5. Iterate based on feedback

**Read [references/PRD.md](references/PRD.md) for complete instructions.**

---

## Mode B: 逆向提取（从代码到 PRD）

**File**: [references/REVERSE.md](references/REVERSE.md)

从现有代码库自动分析并生成 PRD 文档。

**When to use**: 已有项目需要生成产品需求文档

**What it does**:
- 自动扫描项目结构、入口文件、配置文件
- 识别功能模块、API 端点、UI 组件、数据模型
- 提取用户流程和业务逻辑
- 读取已有文档（README、CLAUDE.md、product.md、spec.md 等）
- 综合生成完整 PRD

**Process**:
1. 自动探索代码库（Glob + Grep + Read）
2. 读取已有文档作为上下文
3. 生成功能清单草稿，请用户确认/补充
4. 生成完整 PRD
5. 迭代修改

**Read [references/REVERSE.md](references/REVERSE.md) for complete instructions.**

---

### Part 3: Implementation Task Generation (both modes)

**File**: [references/JSON.md](references/JSON.md)

You will need to analyze the completed PRD and generate a comprehensive task list in JSON format.

**When to use**: After PRD is complete and approved, or user requests task breakdown

**What it does**:
- Analyzes the completed PRD
- Generates a complete list of implementation tasks in JSON format, covering all features and requirements from the PRD
- Keeps the tasks small and manageable
- Categorizes tasks by type (functional, ui-ux, api-endpoint, security, etc.)
- Defines verification ('pass') steps for each task
- Creates developer-ready checklist

**IMPORTANT**:
- Each task should be simple enough to be completed in maximum 10 minutes.
- If a task is too complex, it should be split into smaller tasks.

**Read [references/JSON.md](references/JSON.md) for complete instructions.**

## Part 4: Overall Description

You will need to read the completed PRD and generate an overall description of the project as a SUMMARY.md.

The description should be short, concise and contain:
- An overall description of the project
- The main features of the app
- Key user flows
- A short list of key requirements

## Quick Start

**If user wants to create a PRD:**
1. Read [references/PRD.md](references/PRD.md)
2. Follow the PRD creation workflow
3. Save PRD to user-specified location (default: project root `PRD.md`)

**If user wants to generate tasks from existing PRD:**
1. Read [references/JSON.md](references/JSON.md)
2. Follow the task generation workflow
3. Save tasks to user-specified location

## Integration with Issue + Conductor

PRD 生成的任务应无缝接入项目的 Issue → Track → Implement 工作流。

### 自动化流程（推荐）

PRD 任务审批后，提示用户：

```
任务列表已生成。如何接入开发流程？

1. 批量创建 Issues → 自动关联 Tracks（推荐）
   每个 task 创建一个 Issue（/issue），再为每个 Issue 创建 Track（/conductor:new-track ISS-XXX）
2. 只创建 Issues，稍后手动创建 Tracks
3. 直接创建 Conductor Tracks（跳过 Issue）
4. 只保存任务列表，不创建 Issue/Track
```

### Issue 创建规则

将 PRD task 转为 Issue 时的字段映射：

| PRD Task 字段 | Issue 字段 | 说明 |
|---------------|-----------|------|
| `title` | `title` | 直接使用 |
| `description` + `acceptanceCriteria` | `description` | 合并为描述 |
| `category` | `type` | `functional/ui-ux` → `feature`，`security` → `bug`（预防性），其余 → `chore` |
| `estimatedComplexity` | `priority` | `high/very high` → `P0`，`medium` → `P1`，`low` → `P2` |
| — | `status` | 固定 `pending` |
| — | `testLoopScan` | 固定 `true` |

### 批量创建示例

```
正在批量创建 Issues...

✅ ISS-180: User can create an account (feature, P1)
✅ ISS-181: Dashboard displays activity cards (feature, P2)
✅ ISS-182: API role-based access control (feature, P0)
...

共创建 12 个 Issues。是否继续为每个 Issue 创建 Conductor Track？
1. 是，批量创建 Tracks
2. 否，稍后手动处理
```

### 与现有 Conductor 的关系

- 每个 PRD **feature area**（如 "用户认证"）可以成为一个 Conductor Track
- Track 的 **phases** 对应 PRD task 的 dependency 分组
- Track 的 **tasks** 对应 PRD task 的 steps
- 遵循 CLAUDE.md 的 Issue → Track 关联规则：`/conductor:new-track ISS-XXX` 自动预填 + 回写 trackId

## Attribution

Based on [PageAI-Pro/ralph-loop](https://github.com/PageAI-Pro/ralph-loop) prd-creator skill (MIT License).
