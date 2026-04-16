# Product Requirements Document: EngineerBrain

**生成日期:** 2026-03-30
**生成方式:** 代码逆向提取 + 人工确认
**项目版本:** 0.x (Active Development)
**所有者:** Kun Fang, Azure Support Engineer

---

## 1. 产品概述

### 1.1 产品定位

EngineerBrain 是一套 **AI 驱动的 D365 Case 全生命周期自动化系统**，专为 Azure 技术支持工程师设计。它以 Claude Agent SDK 为核心编排引擎，将 Case 数据拉取、合规检查、状态判断、技术排查、邮件起草、待办生成等重复性工作自动化，同时通过 "草稿优先 + 人工确认" 的安全模型确保关键操作始终在人类控制之下。

系统包含三个核心层面：
- **CLI 工作流层** — 通过 Slash Commands（`/casework`、`/patrol` 等）在 Claude Code 中直接执行
- **Web Dashboard 层** — React + Hono 构建的实时监控面板，支持 Case 管理、Todo 执行、Agent 监控
- **自动化测试层** — 5 阶段状态机驱动的自测试框架（SCAN→GENERATE→TEST→FIX→VERIFY）

### 1.2 目标用户

| 用户画像 | 描述 |
|---------|------|
| **Primary** | Azure Support Engineer（当前：Kun Fang），同时管理多个 D365 Case |
| **使用场景** | 日常 Case 处理、批量巡检、技术排查、客户沟通、SLA 监控 |
| **技术背景** | 熟悉 Azure 产品、Kusto 查询、PowerShell、D365 操作 |
| **语言** | 界面/文档中文为主，代码英文，客户邮件中英文混用 |
| **时区** | Asia/Singapore (GMT+8) |

### 1.3 核心价值主张

| 价值 | 说明 |
|------|------|
| **时间节省** | 单 Case 全流程从手动 30+ 分钟 → 自动化 ~4 分钟（242s） |
| **质量一致** | 标准化合规检查、状态判断、邮件模板，避免遗漏 |
| **上下文连续** | 双层记忆（Session + 持久目录），跨会话无缝恢复 |
| **安全可控** | 所有 D365 写操作和客户邮件均需人工确认 |
| **知识积累** | 每次排查的诊断路径、Kusto 查询、解决方案自动归档 |

---

## 2. 功能需求

### 2.1 Case 全生命周期管理

**状态**: ✅ 已实现

**描述**: Main Agent 作为编排者，按序调度 6 个专用子 Agent 完成 Case 从数据拉取到待办生成的完整处理流程。

**用户故事**:
- As a support engineer, I want to process a case with one command so that I can focus on decision-making instead of repetitive data gathering.
- As a support engineer, I want the system to automatically detect case health issues (SLA risk, FDR violation) so that I can take action before escalation.

**功能详情**:
- FR-001: **Data Refresh** — 从 D365 拉取 Case 快照（基本信息、联系人、Notes、Emails、Attachments），支持增量拉取和 10 分钟缓存
- FR-002: **Compliance Check** — 验证 Entitlement 有效性、检测 21v（Azure China）客户转换需求
- FR-003: **Status Judge** — 判断 Case 实际状态（actualStatus）和距上次联系天数（daysSinceLastContact），检测 FDR 违规、SLA 风险
- FR-004: **Teams Search** — KQL 并行搜索 Teams 聊天记录（按 Case 号 + 客户名），落盘到 `teams/` 目录
- FR-005: **Troubleshoot** — Opus 模型驱动，集成 Kusto 诊断（12 Azure 产品模板）、ADO Wiki 搜索、Microsoft Learn 文档搜索、Local RAG 知识库搜索
- FR-006: **Email Draft** — 根据 Case 上下文生成 initial-response / follow-up / closure 邮件草稿，经 Humanizer 润色
- FR-007: **Inspection** — 生成 case-summary.md（增量更新）+ Todo 待办清单

**关联文件**:
- `.claude/skills/casework/SKILL.md` — 主编排逻辑
- `.claude/agents/*.md` — 6 个子 Agent 定义
- `skills/d365-case-ops/` — D365 PowerShell 脚本库

**执行管道**:
```
Data Refresh (71s) → Compliance (13s) → Status Judge (~5s)
    → Teams Search (~30s, 后台) + Troubleshoot (~60s)
    → Email Draft (~15s) → Inspection (~15s)
    ─────────────────────────────────────────
    Total: ~180-240s
```

---

### 2.2 批量巡检 (Patrol)

**状态**: ✅ 已实现

**描述**: 批量扫描所有活跃 Case，筛选有变化（新邮件、新 Note、状态变更）的 Case，逐个执行 casework 流程，最终汇总所有 Todo。

**用户故事**:
- As a support engineer, I want to run a single patrol command at the start/end of my day so that I have a complete view of all case health and pending actions.

**功能详情**:
- FR-008: 获取所有活跃 Case 列表
- FR-009: 按最近活动筛选需处理的 Case
- FR-010: 逐个执行 casework 流程（可跳过已处理的步骤）
- FR-011: 汇总所有 Case 的 Todo 到统一视图

**关联文件**:
- `.claude/skills/patrol/SKILL.md`
- `cases/casehealth-state.json` — 全局巡检状态

---

### 2.3 技术排查 (Troubleshooter)

**状态**: ✅ 已实现

**描述**: 使用 Opus 模型（最强推理能力）执行技术诊断。集成 Kusto 遥测查询、Azure DevOps Wiki 搜索、Microsoft Learn 文档搜索和本地 RAG 知识库，输出结构化分析报告。

**用户故事**:
- As a support engineer, I want automated Kusto diagnostics so that I can quickly identify root causes without manually constructing queries.
- As a support engineer, I want the troubleshooter to search internal KB and official docs so that I can find relevant solutions faster.

**功能详情**:
- FR-012: 根据 Case 产品和问题描述，自动选择合适的 Kusto 查询模板（覆盖 12 个 Azure 产品）
- FR-013: 执行 Kusto 查询并分析结果，识别异常模式
- FR-014: 搜索 ADO Wiki（msazure / contentidea / supportability 三个 org）获取内部知识
- FR-015: 搜索 Microsoft Learn 获取官方文档
- FR-016: 搜索 Local RAG 向量库（OneNote 导出的知识库）
- FR-017: 综合分析生成诊断报告（`analysis/` 目录）

**关联文件**:
- `.claude/agents/troubleshooter.md`
- `skills/kusto/` — 12 个产品的 KQL 模板
- `skills/contentidea-kb-search/` — KB 搜索能力

---

### 2.4 邮件草稿生成

**状态**: ✅ 已实现

**描述**: 根据 Case 上下文（客户问题、诊断结果、历史沟通）生成专业的客户邮件草稿。支持 initial-response、follow-up、closure 三种类型，经 Humanizer 润色后输出。

**用户故事**:
- As a support engineer, I want contextual email drafts so that I can respond to customers faster while maintaining quality.
- As a support engineer, I want the email to be humanized so that it reads naturally, not like AI-generated text.

**功能详情**:
- FR-018: 根据 Case 阶段自动推荐邮件类型（initial/follow-up/closure）
- FR-019: 结合诊断报告、客户历史邮件、Case notes 生成邮件内容
- FR-020: Humanizer 润色（英文版 + 中文版两套风格引擎）
- FR-021: 输出到 `drafts/` 目录，用户在 Dashboard 或手动复制发送
- FR-022: ❌ 系统不直接发送邮件给客户（安全边界）

**关联文件**:
- `.claude/agents/email-drafter.md`
- `skills/humanizer/SKILL.md` — 英文润色
- `skills/humanizer-zh/SKILL.md` — 中文润色
- `playbooks/email-samples/` — 邮件模板参考

---

### 2.5 Todo 系统

**状态**: ✅ 已实现

**描述**: 三级待办系统，将 Case 处理结果转化为可执行的行动项。WebUI 支持一键执行确认类操作。

**用户故事**:
- As a support engineer, I want a prioritized todo list per case so that I know exactly what actions to take.
- As a support engineer, I want to execute D365 operations (add note, record labor) with one click from the dashboard so that I don't need to switch to D365.

**功能详情**:
- FR-023: **🔴 需人工决策** — 需要工程师判断的事项（是否升级、方案选择等）
- FR-024: **🟡 待确认执行** — D365 写操作（Add Note、Record Labor、Modify SAP），WebUI 可点击触发
- FR-025: **✅ 仅通知** — 已完成的信息性事项（data refresh 完成、Teams 搜索结果等）
- FR-026: Todo 文件按时间戳命名（`todo/YYMMDD-HHMM.md`），支持历史追溯
- FR-027: 执行后自动更新对应项为 `[x]`

**关联文件**:
- `playbooks/schemas/todo-format.md` — 格式定义
- `dashboard/src/routes/todos.ts` — API 端点

---

### 2.6 Web Dashboard

**状态**: ✅ 已实现

**描述**: React + Hono 构建的全功能 Web Dashboard，提供 Case 管理、AI 交互、Todo 执行、Agent 监控、测试框架控制等功能。

**用户故事**:
- As a support engineer, I want a visual dashboard so that I can monitor all cases, SLA status, and pending actions at a glance.
- As a support engineer, I want to trigger case processing steps from the UI so that I don't need to switch to CLI.

#### 2.6.1 Case 列表与详情

**功能详情**:
- FR-028: Case 表格视图（排序、筛选、SLA 指标、健康评分）
- FR-029: Case 详情页（Tab 切换：Info / Emails / Notes / Analysis / Todos / Drafts / Research）
- FR-030: AI Panel 嵌入详情页右侧，支持完整处理 / 单步执行 / 交互式 Chat
- FR-031: Session 面板展示当前 Agent 执行上下文和消息历史

#### 2.6.2 Issue Tracker

**功能详情**:
- FR-032: Issue CRUD（创建、编辑、删除、搜索）
- FR-033: Issue → Conductor Track 一键关联（Create Track、Implement、Verify）
- FR-034: Issue 状态流转可视化（pending → tracked → in-progress → implemented → done）
- FR-035: 按状态分组展示 + 搜索过滤

#### 2.6.3 Agent 监控

**功能详情**:
- FR-036: 所有 Agent 会话状态一览（active / completed / error）
- FR-037: 统一会话视图（Case sessions、Implement sessions、Verify sessions、Track-creation sessions）
- FR-038: Session 详情展示（消息历史、执行日志）

#### 2.6.4 Email Drafts 管理

**功能详情**:
- FR-039: 所有 Case 的邮件草稿列表
- FR-040: 草稿预览和 Markdown 渲染

#### 2.6.5 Settings

**功能详情**:
- FR-041: 配置编辑器（casesRoot、dataRoot、teamsSearchCacheHours）
- FR-042: 实时保存到 `config.json`

**关联文件**:
- `dashboard/src/` — Backend（Hono routes + services）
- `dashboard/web/src/` — Frontend（React pages + components）

---

### 2.7 实时通信 (SSE)

**状态**: ✅ 已实现

**描述**: Server-Sent Events 实现 Dashboard 与 Backend 的实时数据推送，用于 Case 处理进度、测试状态、Track 创建进度等场景。

**功能详情**:
- FR-043: Case 处理进度实时推送（当前步骤、完成百分比）
- FR-044: Test Lab 测试状态实时更新（阶段切换、结果通知）
- FR-045: Track 创建/实现进度推送
- FR-046: 文件变更监听（Chokidar）+ SSE 广播

**关联文件**:
- `dashboard/src/routes/events.ts` — SSE 端点
- `dashboard/src/watcher/` — 文件监听 + SSE 管理器
- `dashboard/web/src/hooks/useSSE.ts` — 前端 SSE Hook

---

### 2.8 自动化测试框架 (Test Lab)

**状态**: ✅ 已实现

**描述**: 5 阶段状态机驱动的自动化测试系统，支持推理驱动的问题自发现、测试生成、执行、修复和验证。包含 Supervisor（Observer）和 Stage Worker（Subject）两个 Agent 分离架构。

**用户故事**:
- As a developer, I want automated test discovery and generation so that new features are automatically covered.
- As a developer, I want the test system to self-heal when it discovers framework issues during testing.

**功能详情**:
- FR-047: **SCAN** — 分析代码/文档，发现未测试的功能
- FR-048: **GENERATE** — 生成 YAML 格式的测试定义
- FR-049: **TEST** — 执行测试，收集结果
- FR-050: **FIX** — 修复失败的测试或代码
- FR-051: **VERIFY** — 重新运行修复后的测试，确认通过
- FR-052: **Cycle 循环** — 可配置最大轮次（maxRounds）
- FR-053: **Safety Gate** — SAFE/BLOCKED/UNKNOWN 三级安全控制，阻断危险操作
- FR-054: **Supervisor 架构** — Observer + Subject 两个 Agent 分离，支持自发现和自愈
- FR-055: **Test Registry** — YAML 驱动的测试定义（backend-api / ui-interaction / ui-visual / workflow-e2e / frontend）
- FR-056: **Dashboard UI** — Test Lab 页面实时展示管道进度、结果统计

**关联文件**:
- `tests/` — 测试框架（registry、executors、results、state.json）
- `.claude/skills/test-supervisor/SKILL.md` — 状态机控制
- `.claude/agents/stage-worker.md` — 阶段执行器
- `dashboard/web/src/pages/TestLab.tsx` — 前端页面

---

### 2.9 Conductor 项目管理

**状态**: ✅ 已实现

**描述**: Issue → Track → Implement → Verify 的完整开发流程管理系统，支持 125+ 个 Track 的生命周期跟踪。

**用户故事**:
- As a developer, I want to track issues and implementation progress so that I can manage feature development systematically.

**功能详情**:
- FR-057: **Issue 创建** — `/issue "描述"` 创建到 `issues/` 目录
- FR-058: **Track 创建** — `/conductor:new-track ISS-XXX` 自动预填 + 回写 trackId
- FR-059: **Track 实现** — `/conductor:implement {trackId}` 按 Phase 执行
- FR-060: **Track 验证** — `/conductor:verify {trackId}` 验收标准检查
- FR-061: **状态流转** — pending → tracked → in-progress → implemented → done
- FR-062: **Dashboard 集成** — Issue 页面支持一键 Create Track、Implement、Verify

**关联文件**:
- `conductor/` — tracks、specs、plans
- `issues/` — Issue JSON 文件
- `dashboard/src/routes/issues.ts` — Issue API

---

### 2.10 双层记忆架构

**状态**: ✅ 已实现

**描述**: Agent SDK Session（工作记忆）+ Case 目录文件（持久记忆）的双层设计，确保跨会话上下文连续性。

**功能详情**:
- FR-063: Session 工作记忆 — Agent SDK session，会 compact，可能丢失早期细节
- FR-064: Case 持久记忆 — 结构化文件（case-info.md、case-summary.md、emails.md 等），不丢失
- FR-065: Resume 注入 — 重新打开时从 `context/case-summary.md` 恢复上下文
- FR-066: 用户补充 — 用户输入写入 `context/user-inputs.jsonl` + 更新 case-summary
- FR-067: 长期记忆 — `memory/MEMORY.md`（跨项目经验）+ `memory/daily/` + `.learnings/`

**关联文件**:
- `memory/` — 记忆系统
- `.learnings/` — 经验教训
- `playbooks/schemas/case-directory.md` — Case 目录结构

---

### 2.11 MCP 集成层

**状态**: ✅ 已实现

**描述**: 通过 14 个 MCP Server 实现与外部系统的深度集成，覆盖 ICM、Teams、ADO、Kusto、Mail、Microsoft Learn 等。

**功能详情**:
- FR-068: **ICM** — 事件管理（获取事件详情、影响客户、相似事件、缓解提示）
- FR-069: **Teams** — 消息搜索、聊天发送、频道操作
- FR-070: **ADO** — Wiki 搜索、工作项管理、管道触发、PR 管理（3 个 org）
- FR-071: **Kusto** — KQL 查询执行（China Intune cluster）
- FR-072: **Microsoft Learn** — 文档搜索 + 代码示例搜索 + 页面抓取
- FR-073: **Mail** — 邮件搜索、草稿创建、发送、附件管理
- FR-074: **WorkIQ** — M365 Copilot 集成（基础）
- FR-075: **Playwright** — 浏览器自动化（Edge）
- FR-076: **Local RAG** — 本地向量库搜索（OneNote 知识库）

**关联文件**:
- `.mcp.json` — 14 个 MCP Server 配置

---

### 2.12 D365 脚本库

**状态**: ✅ 已实现

**描述**: 20+ PowerShell 脚本封装 D365 操作，覆盖 Case/Notes/Emails/Attachments 的读取和 Note/Labor/SAP 的写入。

**功能详情**:
- FR-077: 读取 Case 基本信息、联系人、Entitlement
- FR-078: 读取 Case Notes（增量）、Emails（全量/增量）
- FR-079: 下载 Case Attachments
- FR-080: 写入 Note（🟡 待确认执行）
- FR-081: 记录 Labor Time（🟡 待确认执行）
- FR-082: 修改 SAP（Support Area Path）（🟡 待确认执行）

**关联文件**:
- `skills/d365-case-ops/` — PowerShell 脚本 + 参考文档

---

### 2.13 Kusto 诊断模板

**状态**: ✅ 已实现

**描述**: 覆盖 12 个 Azure 产品的 KQL 查询模板，Troubleshooter Agent 根据 Case 产品自动选择并执行。

**功能详情**:
- FR-083: 12 个 Azure 产品的预定义 KQL 模板
- FR-084: 参数化查询（Subscription ID、时间范围、资源名等）
- FR-085: 结果分析和异常模式识别

**关联文件**:
- `skills/kusto/` — 按产品组织的查询模板

---

### 2.14 OneNote 知识库

**状态**: ✅ 已实现

**描述**: 将 OneNote 笔记本导出为 Markdown，再通过 Local RAG MCP 向量化，实现语义搜索。

**功能详情**:
- FR-086: OneNote 导出/同步为 Markdown（`/onenote-export`）
- FR-087: OneNote Markdown 知识库搜索（`/onenote-search`）
- FR-088: 增量同步到 Local RAG 向量库（`/rag-sync`）
- FR-089: Troubleshooter 集成（搜索历史排查经验）

**关联文件**:
- `.claude/skills/onenote-export/SKILL.md`
- `.claude/skills/onenote-search/SKILL.md`
- `.claude/skills/rag-sync/SKILL.md`
- `~/Documents/EngineerBrain-Data/` — 外部数据目录

---

### 2.15 Humanizer 邮件润色

**状态**: ✅ 已实现

**描述**: 两套风格引擎（英文 + 中文），将 AI 生成的邮件润色为自然、专业的人类写作风格。

**功能详情**:
- FR-090: 英文 Humanizer — 专业技术支持风格
- FR-091: 中文 Humanizer — 适配中文客户沟通习惯
- FR-092: 保留技术准确性的同时提升可读性

**关联文件**:
- `skills/humanizer/SKILL.md` — 英文（437 行）
- `skills/humanizer-zh/SKILL.md` — 中文

---

### 2.16 Playbooks 领域知识库

**状态**: ✅ 已实现

**描述**: 结构化的领域知识库，包含操作指南、业务规则、数据 Schema、邮件模板等，供 Agent 运行时参考。

**功能详情**:
- FR-093: **Guides** — 13 个操作指南（D365 操作、Kusto 查询、客户沟通、排查流程等）
- FR-094: **Rules** — 3 个业务规则（Case 生命周期、IR Entitlement、测试安全红线）
- FR-095: **Schemas** — 4 个数据 Schema（Case 目录、Meta、Timing、Todo 格式）
- FR-096: **Email Samples** — 邮件模板参考库

**关联文件**:
- `playbooks/` — 完整目录

---

## 3. 用户流程

### 3.1 单 Case 处理流程

```
1. 工程师 → 执行 /casework {caseNumber} 或在 Dashboard 点击 "Process"
2. 系统 → 自动执行 7 步管道（~4 分钟）
   ├── Data Refresh → 拉取 D365 数据 + ICM
   ├── Compliance → 验证 Entitlement + 21v
   ├── Status Judge → 判断状态 + SLA 风险
   ├── Teams Search → 搜索聊天记录（后台）
   ├── Troubleshoot → Kusto + 文档 + KB 诊断
   ├── Email Draft → 生成客户邮件草稿
   └── Inspection → 生成 case-summary + todo
3. 系统 → 展示 Todo 清单
4. 工程师 → 审阅 🔴 决策项、确认执行 🟡 D365 操作
5. 工程师 → 审阅邮件草稿、手动发送
```

### 3.2 批量巡检流程

```
1. 工程师 → 执行 /patrol 或在 Dashboard 点击 "Patrol"
2. 系统 → 获取所有活跃 Case 列表
3. 系统 → 筛选有变化的 Case（新邮件、新 Note 等）
4. 系统 → 逐个执行 casework 流程
5. 系统 → 汇总所有 Todo 到统一视图
6. 工程师 → 逐个审阅处理
```

### 3.3 Issue → 实现 → 验证流程

```
1. 发现问题/需求 → /issue "描述" 创建 Issue
2. 需要实现 → /conductor:new-track ISS-XXX 创建 Track
3. 实现 Track → /conductor:implement {trackId} 按 Phase 执行
4. 实现完成 → Issue 状态自动设为 "implemented"
5. 验证通过 → /conductor:verify {trackId} → Issue 设为 "done"
```

### 3.4 技术排查交互流程

```
1. 工程师 → 执行 /troubleshoot {caseNumber} [topic]
2. Troubleshooter → 分析 Case 上下文，确定诊断方向
3. Troubleshooter → 执行 Kusto 查询（自动选择产品模板）
4. Troubleshooter → 搜索 ADO Wiki + Microsoft Learn + Local RAG
5. Troubleshooter → 综合分析，生成诊断报告
6. 工程师 → 审阅报告，提供反馈
7. 系统 → 将报告归档到 analysis/ 目录
```

### 3.5 测试自动化流程

```
1. 开发者 → 在 Test Lab 页面启动测试 或执行 /test-supervisor
2. Supervisor → 观察当前状态，决定阶段
3. Stage Worker → 执行当前阶段（SCAN/GENERATE/TEST/FIX/VERIFY）
4. Safety Gate → 检查操作安全性（SAFE/BLOCKED/UNKNOWN）
5. 系统 → 阶段完成后自动推进到下一阶段
6. 系统 → 发现问题时尝试自愈（框架级问题）
7. 系统 → 完成一轮循环后重新 SCAN
```

---

## 4. 数据模型

### 4.1 核心实体

| 实体 | 存储方式 | 关键字段 | 关系 |
|------|---------|---------|------|
| **Case** | 文件系统目录 `cases/active/{id}/` | case-info.md, emails.md, notes.md, casehealth-meta.json | 1:N Todos, 1:N Drafts, 1:N Analysis |
| **Todo** | Markdown 文件 `todo/YYMMDD-HHMM.md` | 级别（🔴🟡✅）、描述、状态（☐/☑） | N:1 Case |
| **Draft** | Markdown 文件 `drafts/*.md` | 类型、内容、生成时间 | N:1 Case |
| **Issue** | JSON 文件 `issues/ISS-XXX.json` | id, title, type, status, priority, trackId | 1:1 Track |
| **Track** | 目录 `conductor/tracks/{id}/` | spec.md, plan.md, metadata.json | 1:1 Issue, 1:N Phases |
| **Memory** | Markdown `memory/MEMORY.md` + `daily/*.md` | 长期经验、每日记录 | 全局 |
| **Test** | YAML `tests/registry/**/*.yaml` | id, category, steps, assertions, safety_level | N:1 Registry |
| **Config** | JSON `config.json` | casesRoot, dataRoot, teamsSearchCacheHours | 全局 |

### 4.2 Case 目录结构（详细）

```
cases/active/{case-id}/
├── case-info.md              # D365 快照（基本信息、联系人、Entitlement）
├── casehealth-meta.json      # 合规/健康元数据
├── case-summary.md           # 增量叙述（问题→发现→风险）
├── emails.md                 # D365 邮件历史
├── emails-office.md          # Outlook 补充邮件
├── notes.md                  # D365 Notes（增量）
├── timing.json               # 执行性能统计
├── todo/                     # 待办清单（按时间戳）
├── context/                  # 用户补充上下文
│   └── user-inputs.jsonl     # 电话记录、观察笔记
├── analysis/                 # 诊断报告
├── drafts/                   # 邮件草稿
├── research/                 # KB/ADO/Learn 参考
├── kusto/                    # KQL 查询结果
├── teams/                    # Teams 聊天记录
├── attachments/              # 下载的附件
├── images/                   # 邮件内嵌图片
├── icm/                      # ICM 事件数据
├── kb/                       # 知识库文章（结案时）
└── logs/                     # Agent 执行日志
```

### 4.3 casehealth-meta.json Schema

```json
{
  "caseNumber": "2503280050000001",
  "entitlement": {
    "valid": true,
    "type": "Premier",
    "expiryDate": "2026-12-31"
  },
  "is21vCustomer": false,
  "actualStatus": "Active",
  "daysSinceLastContact": 3,
  "slaRisk": false,
  "fdrViolation": false,
  "lastUpdated": "2026-03-30T12:00:00Z"
}
```

---

## 5. 技术架构

### 5.1 技术栈

| 层 | 技术 | 版本 |
|----|------|------|
| **语言** | TypeScript | 5.7.2 |
| **前端框架** | React | 18.3.1 |
| **前端构建** | Vite | 6.x |
| **前端样式** | Tailwind CSS | 3.4.17 |
| **状态管理** | Zustand（客户端）+ TanStack Query（服务端状态） | 5.0.2 / 5.62.2 |
| **后端框架** | Hono | 4.6.14 |
| **后端运行时** | Node.js + tsx | — |
| **认证** | JWT (jsonwebtoken + bcryptjs) | — |
| **实时通信** | Server-Sent Events (SSE) | — |
| **文件监听** | Chokidar | 4.0.3 |
| **AI 引擎** | Claude Agent SDK | 0.2.77 |
| **自动化脚本** | PowerShell (D365) + Bash (编排) + Node.js (工具) | — |
| **浏览器自动化** | Playwright MCP (Edge) | — |
| **数据存储** | 文件系统（JSON + Markdown） | — |
| **向量数据库** | LanceDB (via local-rag MCP) | — |
| **图标** | lucide-react | 0.468.0 |
| **图表** | Recharts | 2.15.0 |
| **Markdown** | react-markdown + remark-gfm | — |
| **测试** | Vitest + React Testing Library | — |

### 5.2 系统架构

```
┌───────────────────────────────────────────────────┐
│                  Web Dashboard                     │
│  React 18 + Vite + Tailwind + Zustand + TanStack  │
│  (localhost:5173)                                   │
└─────────────────────┬─────────────────────────────┘
                      │ HTTP + SSE
┌─────────────────────▼─────────────────────────────┐
│              Dashboard Backend                      │
│  Hono + TypeScript + JWT Auth + Chokidar           │
│  (localhost:3010)                                    │
└──────┬──────────────┬──────────────┬──────────────┘
       │              │              │
       ▼              ▼              ▼
┌──────────┐  ┌──────────────┐  ┌──────────────┐
│  Claude   │  │  File System  │  │  MCP Servers │
│  Agent    │  │  cases/       │  │  (14 个)      │
│  SDK      │  │  issues/      │  │  ICM, Teams, │
│           │  │  conductor/   │  │  ADO, Kusto, │
│  ┌─────┐  │  │  tests/       │  │  Mail, Learn │
│  │Main │  │  │  memory/      │  │  Playwright  │
│  │Agent│  │  └──────────────┘  │  Local RAG   │
│  └──┬──┘  │                    └──────────────┘
│     │     │
│  ┌──▼───────────────────────┐
│  │ Sub-Agents (6)           │
│  │ data-refresh (sonnet)    │
│  │ compliance (sonnet)      │
│  │ teams-search (sonnet)    │
│  │ troubleshooter (opus)    │
│  │ email-drafter (sonnet)   │
│  │ inspection (sonnet)      │
│  └──────────────────────────┘
└──────────┘
```

### 5.3 外部集成

| 系统 | 集成方式 | 用途 |
|------|---------|------|
| Dynamics 365 | PowerShell 脚本 (agency.exe) | Case CRUD |
| Azure ICM | MCP Server (agency.exe) | 事件管理 |
| Microsoft Teams | MCP Server (agency.exe) | 消息搜索/发送 |
| Azure DevOps | MCP Server (agency.exe, 3 orgs) | Wiki/工作项/PR |
| Azure Data Explorer (Kusto) | MCP Server (agency.exe) | 遥测查询 |
| Microsoft Learn | MCP Server (agency.exe) | 文档搜索 |
| Outlook Mail | MCP Server (agency.exe) | 邮件操作 |
| M365 Copilot (WorkIQ) | MCP Server (agency.exe) | AI 辅助 |
| OneNote | 导出 + Local RAG | 知识库 |

---

## 6. 非功能需求

### 6.1 已实现

| 类别 | 实现 |
|------|------|
| **认证** | JWT 单用户认证（bcryptjs 密码哈希） |
| **安全** | D365 写操作需人工确认、邮件不自动发送、测试安全门禁（SAFE/BLOCKED/UNKNOWN） |
| **性能** | 增量数据拉取 + 10 分钟缓存（data-refresh 66% 加速）、并行 Agent 执行 |
| **可靠性** | 文件系统持久化（不依赖数据库）、Session 恢复机制 |
| **可观测性** | Agent 执行日志、timing.json 性能追踪、SSE 实时状态 |
| **可维护性** | 技能/Agent 定义分离、Playbooks 知识库、Conductor 项目管理 |
| **可扩展性** | MCP 插件架构（14 个 Server 可独立添加/替换） |

### 6.2 待改进（从 Issues 提取）

- 175 个 Issue 涵盖 Bug 修复、功能增强、基础设施改进
- 测试覆盖率持续通过 Test Lab 自动化提升
- Dashboard 体验持续优化（最近：scroll-fix、case-header-redesign、session-detail-panel）

---

## 7. 产品演进

### 7.1 已完成的迭代

基于 125 个 Conductor Track 的分析，主要里程碑包括：

| 阶段 | 关键特性 |
|------|---------|
| **Foundation** | 项目结构、CLAUDE.md、Conductor 框架、Case 目录 Schema |
| **Core Casework** | data-refresh、compliance-check、status-judge、inspection-writer |
| **Troubleshooter** | Kusto 集成、ADO 搜索、Microsoft Learn、Local RAG |
| **Dashboard v1** | Case 列表、详情页、AI Panel、Todo 系统 |
| **Issue Tracker** | CRUD、状态分组、搜索过滤、Conductor 关联 |
| **Test Lab** | 5 阶段状态机、Supervisor 架构、Safety Gate |
| **Performance** | 增量拉取、缓存、并行 Agent、timing 追踪 |
| **Dashboard UX** | 双主题、SSE 实时更新、Session 面板、Draft 管理 |

### 7.2 进行中

- Dashboard UX 持续优化
- Test Lab 管道 v2 设计（Design A/B/C 多方案探索）
- Session 管理增强

### 7.3 计划中

- 从 175 个 Issues 的 pending 状态提取
- KB Article 自动生成（Case 结案时）
- 多工程师支持扩展
- 完整 Mail MCP 集成

---

## Appendix

### A. 文件结构概览

```
EngineerBrain/
├── .claude/                  # Claude SDK 配置
│   ├── agents/ (7)           # 可 spawn 的 Agent 定义
│   ├── skills/ (17)          # Slash Command 工作流
│   └── commands/             # 附加命令
├── dashboard/                # Full-stack Web 应用
│   ├── src/ (Backend)        # Hono + TypeScript (11 routes, 15+ services)
│   └── web/ (Frontend)       # React + Vite + Tailwind (11 pages)
├── skills/                   # 领域能力包
│   ├── d365-case-ops/ (20+ PS1)
│   ├── kusto/ (12 products)
│   ├── humanizer/ (EN+ZH)
│   └── ...
├── playbooks/                # 领域知识
│   ├── guides/ (13)
│   ├── rules/ (3)
│   └── schemas/ (4)
├── cases/                    # Case 数据（文件系统）
├── conductor/                # 项目管理（125 tracks）
├── tests/                    # 自动化测试（288 results）
├── issues/                   # Issue Tracker（175 issues）
├── memory/                   # 记忆系统
├── scripts/                  # 工具脚本（13）
└── docs/                     # 架构文档
```

### B. API 端点清单

| 方法 | 路径 | 用途 |
|------|------|------|
| GET | `/api/health` | 健康检查 |
| GET/POST | `/api/auth/*` | JWT 认证 |
| GET | `/api/cases` | Case 列表 |
| GET | `/api/cases/:id` | Case 详情 + 元数据 |
| POST | `/api/case/:id/process` | 完整 Case 处理 |
| POST | `/api/case/:id/chat` | 交互式 Chat（resume） |
| POST | `/api/case/:id/step/{name}` | 单步执行 |
| DELETE | `/api/case/:id/session` | 删除 Session |
| POST | `/api/patrol` | 批量巡检 |
| GET | `/api/todos/all` | Todo 列表 |
| POST | `/api/todo/:id/execute` | 执行 Todo 项 |
| GET/POST/PUT/DELETE | `/api/issues/*` | Issue CRUD |
| POST | `/api/issues/:id/create-track` | 创建 Conductor Track |
| POST | `/api/issues/:id/verify` | 验证 Issue |
| GET | `/api/agents` | Agent 状态 |
| GET | `/api/sessions/all` | 统一会话视图 |
| GET | `/api/drafts` | 邮件草稿列表 |
| GET | `/api/drafts/:caseId/:file` | 草稿内容 |
| GET | `/api/events` | SSE 实时流 |
| GET | `/api/tests/state` | 测试状态 |
| POST | `/api/tests/runner/start` | 启动测试 |
| POST | `/api/tests/runner/stop` | 停止测试 |
| POST | `/api/restart/{target}` | 重启服务 |
| GET/PUT | `/api/settings` | 配置管理 |

### C. UI 页面清单

| 页面 | 路径 | 功能 |
|------|------|------|
| Login | `/login` | JWT 密码认证 |
| Dashboard | `/` | 主面板 |
| Cases | `/cases` | Case 列表 + 筛选 |
| Case Detail | `/cases/:id` | Case 详情 + AI Panel |
| Todos | `/todos` | Todo 管理 + 执行 |
| Drafts | `/drafts` | 邮件草稿预览 |
| Issues | `/issues` | Issue Tracker + Conductor |
| Agent Monitor | `/agents` | Agent 会话监控 |
| Test Lab | `/test-lab` | 自动化测试 Dashboard |
| Settings | `/settings` | 配置编辑 |

---

_Generated by prd-creator (Mode B: Reverse Engineering) from codebase analysis on 2026-03-30._
