# Engineer Brain — 需求文档与架构设计

> **版本**: v1.0
> **日期**: 2026-03-20
> **作者**: Kun Fang (Azure Support Engineer)
> **状态**: Living Document — 记录项目当前需求与已实现架构

---

## 目录

1. [项目概述](#1-项目概述)
2. [业务背景与问题定义](#2-业务背景与问题定义)
3. [功能需求](#3-功能需求)
4. [非功能需求](#4-非功能需求)
5. [已实现架构](#5-已实现架构)
6. [数据架构](#6-数据架构)
7. [工作流详解](#7-工作流详解)
8. [外部系统集成](#8-外部系统集成)
9. [Dashboard Web 应用](#9-dashboard-web-应用)
10. [安全设计](#10-安全设计)
11. [技术栈](#11-技术栈)
12. [功能清单与实现状态](#12-功能清单与实现状态)

---

## 1. 项目概述

### 1.1 项目定位

**Engineer Brain** 是一个面向 Azure 技术支持工程师的 **AI 驱动 Case 全生命周期管理系统**。

它以 Claude Code (Claude Agent SDK) 为核心引擎，将 D365 Case 管理中的重复性操作自动化：数据拉取、合规检查、状态判断、技术排查、邮件草稿生成、巡检报告输出——形成"人机协作"的工作模式。

### 1.2 核心理念

```
AI 做重复决策，人做最终判断
```

- ✅ **自动执行**：数据拉取、合规检查、状态推断、技术诊断、报告生成
- ⚠️ **需人确认**：D365 写操作（Note/Labor/SAP）
- ❌ **禁止自动**：发送邮件给客户

### 1.3 用户画像

| 属性 | 值 |
|------|---|
| 角色 | Azure Support Engineer |
| 场景 | 日常 Case 管理（5-15 个活跃 Case） |
| 频率 | 每日 1-3 次巡检 + 按需单 Case 处理 |
| 时区 | Asia/Singapore (GMT+8) |
| 工具链 | D365 CRM + Teams + ICM + Azure Portal + Kusto |

---

## 2. 业务背景与问题定义

### 2.1 痛点分析

Azure Support Engineer 的日常工作涉及多系统操作，存在以下痛点：

| 痛点 | 影响 | 现有解决方式 |
|------|------|------------|
| **D365 数据分散** | 查看 Case 需在多个 Tab 间切换（快照/邮件/笔记/附件） | 手动逐一打开 |
| **合规检查遗漏** | IR/FDR/FWR SLA 可能过期未察觉 | 手动检查 Case Performance |
| **状态判断耗时** | 判断 Case 当前该做什么需读完全部邮件 | 逐一阅读 |
| **排查重复劳动** | Kusto 查询、文档搜索每次从头来 | 手动拼 KQL + 搜索 |
| **邮件撰写重复** | 相似类型邮件反复写 | 从模板手动改 |
| **巡检覆盖不全** | Case 多时容易遗漏某个 Case 的更新 | 靠记忆 |
| **跨系统上下文切换** | D365 ↔ Teams ↔ ICM ↔ Kusto 间频繁切换 | 手动操作 |

### 2.2 设计目标

1. **单 Case 处理 < 5 分钟**（含数据拉取 + 分析 + 草稿生成）
2. **全量巡检 < 30 分钟**（10 个活跃 Case 并行处理）
3. **零遗漏**：每个 Case 的 SLA、合规、状态变化都被追踪
4. **可审计**：每个 AI 决策都有日志和推理链，可事后还原

---

## 3. 功能需求

### 3.1 核心功能

#### FR-01: 单 Case 全流程处理 (`/casework`)

**用户故事**: 作为支持工程师，我希望输入一个 Case 编号后，系统自动完成数据拉取、合规检查、状态判断、技术排查和邮件草稿生成。

**详细需求**:
- 输入: Case 编号（如 `2603100030005863`）
- 输出: Inspection 报告 + Todo 列表 + 邮件草稿（如需）
- 流程: data-refresh → compliance-check + status-judge → 路由执行 → inspection

**验收标准**:
- [ ] 完整流程 < 5 分钟
- [ ] 所有步骤有执行日志
- [ ] 产出 timing.json 统计各步骤耗时
- [ ] Todo 按 🔴🟡✅ 三级分类

#### FR-02: 批量巡检 (`/patrol`)

**用户故事**: 作为支持工程师，我希望一键巡检所有活跃 Case，只看有变化的 Case 汇总。

**详细需求**:
- 自动获取活跃 Case 列表
- 对比 `modifiedon` vs `lastInspected` 筛选有变化的 Case
- 预热阶段（~15s）: IR 批量检查 + DTM Token 预热
- 全量并行处理所有变化的 Case
- 汇总所有 Case 的 Todo

**验收标准**:
- [ ] 10 个 Case 全量巡检 < 30 分钟
- [ ] 支持增量（只处理有变化的 Case）
- [ ] 预热阶段解决 Playwright 浏览器互斥问题
- [ ] 各 Case 隔离处理，无上下文污染

#### FR-03: 数据刷新 (`/data-refresh`)

**用户故事**: 作为支持工程师，我希望自动从 D365 拉取 Case 的最新快照、邮件、笔记、附件和 ICM 信息。

**详细需求**:
- D365 快照（case-info.md）
- 邮件历史（emails.md）
- 内部笔记（notes.md）
- 附件下载（DTM 认证）
- ICM 数据（如有关联 ICM）
- IR/FDR/FWR SLA 状态检查

**验收标准**:
- [ ] 三个数据源（snapshot/emails/notes）并行拉取
- [ ] 附件支持预热 Token 和降级策略
- [ ] ICM 数据从 MCP 实时查询
- [ ] IR 检查优先 API（~2s），降级到 UI scraping（~15-20s）

#### FR-04: 合规检查 (`/compliance-check`)

**用户故事**: 作为支持工程师，我希望自动检查 Case 的 Entitlement 是否合规，以及是否为 21v 转单。

**详细需求**:
- Entitlement 合规: 检查 Service Name 含 "China Cloud" + Contract Country 为 "China"
- 21v Convert 检测: 从 Customer Statement 识别 21v ticket 信息
- 结果写入 `casehealth-meta.json` 的 `compliance` 字段
- 支持缓存跳过（已合规的不重复检查）

#### FR-05: 状态判断 (`/status-judge`)

**用户故事**: 作为支持工程师，我希望 AI 综合分析邮件历史和 ICM 状态，判断 Case 当前的实际状态。

**详细需求**:
- 判定 `actualStatus`: new / pending-engineer / pending-customer / pending-pg / researching / ready-to-close
- 计算 `daysSinceLastContact`: 距最后一封工程师邮件的天数
- 完整推理链记录到 `logs/status-judge.log`
- 不依赖 D365 Status 字段（该字段是滞后的）
- ICM 状态动态查询（有 ICM ≠ pending-pg）

#### FR-06: 技术排查 (`/troubleshoot`)

**用户故事**: 作为支持工程师，我希望 AI 根据 Case 问题自动执行 Kusto 查询、搜索知识库，产出分析报告。

**详细需求**:
- 12 个 Azure 服务子技能（ACR/AKS/ARM/AVD/Disk/Entra-ID/EOP/Intune/Monitor/Networking/Purview/VM）
- 122 个 Kusto 表定义 + 102 个查询模板
- 知识库搜索（ADO Wiki + ContentIdea + Microsoft Learn）
- 输出结构化分析报告（`analysis/*.md`）
- 保存 Kusto 查询结果和参考引用

#### FR-07: 邮件草稿 (`/draft-email`)

**用户故事**: 作为支持工程师，我希望 AI 根据 Case 上下文自动生成合适类型的邮件草稿。

**详细需求**:
- 邮件类型: initial-response / request-info / result-confirm / follow-up / closure-confirm / closure / 21v-convert-ir
- 支持 auto 模式（AI 自动选择类型）
- 支持中英文
- Humanizer 润色（去 AI 味）
- 参考邮件模板和沟通规范
- 草稿保存到 `drafts/`，不直接发送

#### FR-08: Teams 消息搜索

**用户故事**: 作为支持工程师，我希望自动搜索与 Case 相关的 Teams 消息作为上下文参考。

**详细需求**:
- 搜索策略: Case Number + 客户联系人姓名
- 支持增量搜索（只搜近 N 天）
- 缓存机制（默认 4 小时有效期）
- 通过 write-teams.ps1 结构化落盘
- 后台运行，3 分钟超时

#### FR-09: Inspection 报告 (`/inspection-writer`)

**用户故事**: 作为支持工程师，我希望得到一份 Case 的当前状态汇总报告和行动清单。

**详细需求**:
- 基本信息表 + 合规状态 + 最新动态 + 风险提示
- Todo 生成（🔴 需人工决策 / 🟡 待确认执行 / ✅ 仅通知）
- 更新 `lastInspected` 时间戳

#### FR-10: Todo 管理与执行

**用户故事**: 作为支持工程师，我希望通过 Dashboard 查看所有 Case 的 Todo 汇总，并能点击执行 D365 写操作。

**详细需求**:
- Todo 汇总页面
- 🟡 项可点击执行（调用 D365 脚本）
- 执行后自动更新 Todo 文件
- 支持跳过操作

#### FR-11: KB 文章生成

**用户故事**: 作为支持工程师，关单时希望自动生成知识库文章。

**详细需求**:
- 从 Case 全部数据提炼
- 输出到 `kb/kb-article.md`
- 包含问题描述、根因、解决方案、参考链接

### 3.2 辅助功能

#### FR-12: 记忆系统

- 每日记忆: `memory/daily/YYYY-MM-DD.md`
- 长期记忆: `memory/MEMORY.md`
- 经验教训: `.learnings/LEARNINGS.md`
- 错误记录: `.learnings/ERRORS.md`
- 功能需求: `.learnings/FEATURE_REQUESTS.md`

#### FR-13: 用户配置

- `config.json` 支持 `casesRoot`、`dataRoot`、`teamsSearchCacheHours`
- Dashboard Settings 页面可编辑

#### FR-14: ICM 事件查询

- 16 个 ICM MCP 工具（详情/摘要/位置/影响/SLA 等）
- 包装为 PowerShell 脚本可独立调用

#### FR-15: WorkIQ 查询

- 通过 Microsoft 365 Copilot 查询邮件/会议/文件上下文

---

## 4. 非功能需求

### 4.1 性能

| 指标 | 目标 | 当前实现 |
|------|------|---------|
| 单 Case 处理 | < 5 min | ~3-5 min |
| 批量巡检（10 Case） | < 30 min | ~15-25 min（全并行） |
| data-refresh | < 90s | ~60-90s |
| Teams 搜索 | < 3 min | ~45-120s |
| 合规检查 | < 5s | ~2-3s |
| 状态判断 | < 30s | ~10-30s（含 ICM 查询） |

### 4.2 可靠性

- 步骤间容错：单步骤失败不阻塞其他步骤
- 降级策略：IR API 失败降级 UI；DTM Token 失败降级 Playwright
- 超时处理：Teams 搜索 3 分钟超时后使用缓存
- 日志完整：每个步骤 START/OK/FAIL/SKIP 都有日志

### 4.3 可审计性

- 每个 AI 决策都有推理链（如 `statusReasoning` + `status-judge.log`）
- 时间统计（`timing.json`）
- 操作轨迹（`casework.log`）
- 数据快照保留（case 目录文件即快照）

### 4.4 安全

- Dashboard 认证（JWT + bcrypt）
- D365 写操作需用户确认
- 邮件不直接发送，仅生成草稿
- 敏感信息不写入日志

---

## 5. 已实现架构

### 5.1 系统架构总览

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Engineer Brain System                               │
│                                                                             │
│  ┌─────────────────────────┐    ┌──────────────────────────────────────┐    │
│  │    Dashboard (WebUI)    │    │        Claude Code CLI               │    │
│  │  ┌───────────────────┐  │    │  ┌──────────────────────────────┐   │    │
│  │  │  React + Vite +   │  │    │  │  /casework  /patrol  etc.   │   │    │
│  │  │  TailwindCSS      │──┼────┼──│  (Slash Command Skills)     │   │    │
│  │  └───────────────────┘  │    │  └──────────────────────────────┘   │    │
│  │  ┌───────────────────┐  │    │  ┌──────────────────────────────┐   │    │
│  │  │  Hono API Server  │  │    │  │  Main Agent (Orchestrator)   │   │    │
│  │  │  + Claude Agent   │──┼────┼──│  + Sub Agents               │   │    │
│  │  │    SDK            │  │    │  │    (troubleshooter, email,   │   │    │
│  │  └───────────────────┘  │    │  │     teams-search)           │   │    │
│  └─────────────────────────┘    │  └──────────────────────────────┘   │    │
│                                 └──────────────────────────────────────┘    │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    Capability Layer (Skills)                         │   │
│  │  ┌──────────┐ ┌────────────┐ ┌──────────┐ ┌──────────┐             │   │
│  │  │ D365 Ops │ │ Kusto (12) │ │Humanizer │ │KB Search │             │   │
│  │  │ (30 PS1) │ │ Services   │ │ en + zh  │ │ContentID │             │   │
│  │  └──────────┘ └────────────┘ └──────────┘ └──────────┘             │   │
│  │  ┌──────────┐ ┌────────────┐ ┌──────────┐ ┌──────────┐             │   │
│  │  │Teams Srch│ │  ICM Ops   │ │ WorkIQ   │ │KB Gen    │             │   │
│  │  │ (1 PS1)  │ │ (16 PS1)  │ │ (M365)   │ │          │             │   │
│  │  └──────────┘ └────────────┘ └──────────┘ └──────────┘             │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    MCP Server Layer (10 Servers)                      │   │
│  │  Playwright │ ICM │ Teams │ ADO(×3) │ Kusto │ MSFT-Learn │ WorkIQ │ Mail│
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    Persistent Storage (File System)                   │   │
│  │  cases/active/{id}/  │  memory/  │  playbooks/  │  .learnings/      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    External Systems                                   │   │
│  │  D365 CRM │ MS Teams │ Azure ICM │ Azure DevOps │ Kusto Clusters    │   │
│  │  DTM      │ M365     │           │ (3 orgs)     │ (12 services)     │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Agent 架构

```
Main Agent (Claude Code Session)
│
├── 内联执行 (Inline Skills)
│   ├── data-refresh         ← D365 数据 + ICM
│   ├── compliance-check     ← Entitlement + 21v
│   ├── status-judge         ← 状态推断
│   └── inspection-writer    ← 报告 + Todo
│
└── Spawn Agents (Independent Processes)
    ├── teams-search         ← Teams MCP (后台, sonnet, 15 turns)
    ├── troubleshooter       ← Kusto/ADO/Learn MCP (opus, 30 turns)
    └── email-drafter        ← Humanizer (sonnet, 15 turns)
```

**设计决策**:
- 内联 vs Spawn: 需要独立 MCP server 或独立 model 的用 Spawn，纯数据处理用内联
- Troubleshooter 用 Opus: 技术排查需要最强推理能力
- Email-drafter 用 Sonnet: 文本生成 Sonnet 足够，节省成本
- Teams-search 后台运行: 搜索耗时较长，不阻塞主流程

### 5.3 双层记忆架构

```
┌─────────────────────────────────────────────┐
│           Working Memory (Session)          │
│                                             │
│  Claude Agent SDK Session                   │
│  - 会话历史（自动 compact）                   │
│  - 当前排查思路、用户交互上下文               │
│  - resume 可恢复对话连续性                   │
│  - Dashboard per-case session 管理           │
│                                             │
│  ⚠️ 特点: 会 compact，可能丢失早期细节        │
└────────────────────┬────────────────────────┘
                     │ 读/写
┌────────────────────▼────────────────────────┐
│         Persistent Memory (Files)           │
│                                             │
│  cases/active/{id}/                         │
│  ├── case-info.md          ← D365 快照      │
│  ├── emails.md             ← 邮件历史       │
│  ├── notes.md              ← 内部笔记       │
│  ├── casehealth-meta.json  ← 状态/合规/SLA  │
│  ├── context/                               │
│  │   ├── user-inputs.jsonl ← 用户补充输入   │
│  │   └── case-summary.md   ← 上下文锚点     │
│  ├── teams/                ← Teams 消息     │
│  ├── analysis/             ← 排查报告       │
│  ├── drafts/               ← 邮件草稿       │
│  ├── kusto/                ← Kusto 结果     │
│  ├── research/             ← 文档引用       │
│  ├── icm/                  ← ICM 数据       │
│  ├── kb/                   ← KB 文章        │
│  ├── todo/                 ← Todo 文件      │
│  ├── logs/                 ← 执行日志       │
│  └── attachments/          ← 附件           │
│                                             │
│  ✅ 特点: 结构化，不丢失，可跨 session 使用    │
└─────────────────────────────────────────────┘
```

### 5.4 文件与目录架构

```
EngineerBrain/
├── CLAUDE.md                    # 项目指令（Claude Code 入口）
├── config.json                  # 用户配置
├── .mcp.json                    # MCP Server 配置（10 servers）
│
├── .claude/
│   ├── skills/                  # 工作流技能（Slash Commands）
│   │   ├── casework/SKILL.md    # /casework — Case 全流程
│   │   ├── patrol/SKILL.md      # /patrol — 批量巡检
│   │   ├── data-refresh/SKILL.md
│   │   ├── compliance-check/SKILL.md
│   │   ├── status-judge/SKILL.md
│   │   ├── inspection-writer/SKILL.md
│   │   ├── draft-email/SKILL.md
│   │   └── troubleshoot/SKILL.md
│   └── agents/                  # Agent 规格（需独立 context）
│       ├── troubleshooter.md    # Kusto/ADO/Learn MCP, opus
│       ├── email-drafter.md     # Humanizer, sonnet
│       └── teams-search.md     # Teams MCP, sonnet
│
├── skills/                      # 能力包（Domain Tools）
│   ├── d365-case-ops/           # D365 PowerShell 脚本
│   │   ├── SKILL.md
│   │   ├── scripts/             # 30 个 .ps1 脚本
│   │   │   ├── _init.ps1        # 初始化 + D365 连接
│   │   │   ├── fetch-all-data.ps1  # 并行拉取 snapshot+emails+notes
│   │   │   ├── fetch-case-snapshot.ps1
│   │   │   ├── fetch-emails.ps1
│   │   │   ├── fetch-notes.ps1
│   │   │   ├── download-attachments.ps1  # DTM 附件下载
│   │   │   ├── check-ir-status.ps1       # IR/FDR/FWR SLA
│   │   │   ├── check-ir-status-batch.ps1 # 批量 IR 检查
│   │   │   ├── warm-dtm-token.ps1        # DTM Token 预热
│   │   │   ├── list-active-cases.ps1     # 活跃 Case 列表
│   │   │   ├── add-note.ps1
│   │   │   ├── record-labor.ps1
│   │   │   ├── edit-sap.ps1
│   │   │   ├── new-email.ps1 / reply-email.ps1
│   │   │   ├── open-case.ps1 / switch-case.ps1
│   │   │   └── ... (view-*, search-*, etc.)
│   │   └── references/          # API 参考、实体模型、选择器
│   │
│   ├── kusto/                   # Kusto 查询子技能 (12 服务)
│   │   ├── SKILL.md             # 主 Skill: 122 表 + 102 查询
│   │   ├── acr/                 # 6 表 / 10 查询
│   │   ├── aks/                 # 24 表 / 14 查询
│   │   ├── arm/                 # 12 表 / 7 查询
│   │   ├── avd/                 # 11 表 / 10 查询
│   │   ├── disk/                # 6 表 / 10 查询
│   │   ├── entra-id/            # 8 查询
│   │   ├── eop/                 # 邮件保护排查
│   │   ├── intune/              # 11 表 / 13 查询
│   │   ├── monitor/             # 8 表 / 5 查询
│   │   ├── networking/          # 9 表 / 7 查询
│   │   ├── purview/             # 3 表 / 3 查询
│   │   └── vm/                  # 24 表 / 15 查询
│   │
│   ├── humanizer/               # 英文 AI 文本润色
│   ├── humanizer-zh/            # 中文 AI 文本润色
│   ├── agency-icm/              # ICM 事件查询 (16 PS1 脚本)
│   ├── teams-case-search/       # Teams 搜索脚本
│   ├── contentidea-kb-search/   # ContentIdea KB 搜索
│   ├── workiq/                  # Microsoft 365 WorkIQ
│   └── kb-article-generator/    # KB 文章生成
│
├── playbooks/                   # 领域知识
│   ├── schemas/                 # 数据结构定义
│   │   ├── case-directory.md    # Case 目录结构
│   │   ├── meta-schema.md       # casehealth-meta.json schema
│   │   ├── timing-schema.md     # timing.json schema
│   │   └── todo-format.md       # Todo 文件格式
│   ├── rules/                   # 决策规则
│   │   ├── case-lifecycle.md    # Case 生命周期 + actualStatus 判定
│   │   └── ir-entitlement.md    # IR/Entitlement 规则
│   ├── guides/                  # 操作指南
│   │   ├── customer-communication.md  # 客户沟通规范
│   │   ├── email-templates.md   # 邮件模板
│   │   ├── troubleshooting.md   # 排查指南
│   │   ├── kusto-queries.md     # Kusto 查询指南
│   │   └── d365-operations.md   # D365 操作指南
│   └── email-samples/           # 参考邮件样本
│
├── dashboard/                   # Web Dashboard
│   ├── src/                     # Backend (Hono + Claude Agent SDK)
│   └── web/                     # Frontend (React + Vite + TailwindCSS)
│
├── scripts/                     # 辅助脚本
│   ├── shallow-scan.ps1         # 浅扫描
│   ├── check-meta.ps1           # Meta 检查
│   ├── fetch-powerbi-cc.js/ps1  # Power BI CC 数据
│   ├── validate-casework.ps1    # 流程验证
│   └── warm-agency-mcps.ps1     # MCP 预热
│
├── data/                        # 业务参考数据
│   └── mooncake-cc.json         # Mooncake 客户数据
│
├── memory/                      # 记忆系统
│   ├── MEMORY.md                # 长期记忆
│   └── daily/                   # 每日记忆
│
├── .learnings/                  # 经验教训
│   ├── LEARNINGS.md
│   ├── ERRORS.md
│   └── FEATURE_REQUESTS.md
│
└── cases/                       # Case 数据（默认位置）
    ├── active/                  # 活跃 Case
    │   └── {caseNumber}/        # 每个 Case 一个目录
    └── archived/                # 已关单归档
```

---

## 6. 数据架构

### 6.1 casehealth-meta.json

Case 的核心元数据文件，被多个步骤分工写入：

```json
{
  "caseNumber": "2603090040000814",
  "lastInspected": "2026-03-17T11:00:00+08:00",
  "actualStatus": "pending-customer",
  "daysSinceLastContact": 4,
  "statusJudgedAt": "2026-03-17T11:00:00+08:00",
  "statusReasoning": "最后邮件(3/13)...",
  "irSla": { "status": "Succeeded", "remaining": null, "checkedAt": "...", "source": "api" },
  "fdr": { "status": "Expired", "remaining": null, "checkedAt": "...", "source": "api" },
  "fwr": { "status": "Expired", "remaining": null, "checkedAt": "...", "source": "api" },
  "compliance": {
    "entitlementOk": true,
    "serviceLevel": "Premier",
    "serviceName": "Unfd AddOn | ProSv Ente - China Cld",
    "contractCountry": "China",
    "is21vConvert": true,
    "21vCaseId": "20260309398206",
    "21vCaseOwner": "zhang.lihong@oe.21vianet.com",
    "warnings": []
  }
}
```

**写入者分工**:

| 字段 | 写入者 |
|------|--------|
| `irSla`, `fdr`, `fwr` | data-refresh (via check-ir-status) |
| `compliance.*` | compliance-check |
| `actualStatus`, `daysSinceLastContact`, `statusReasoning` | status-judge |
| `lastInspected` | inspection-writer |

**规则**: 使用 upsert 模式（读取 → 合并 → 写回），各写入者只修改自己负责的字段。

### 6.2 timing.json

```json
{
  "caseworkStartedAt": "2026-03-17T11:00:00+08:00",
  "caseworkCompletedAt": "2026-03-17T11:03:00+08:00",
  "totalSeconds": 180,
  "steps": {
    "dataRefresh": { "startedAt": "...", "completedAt": "...", "seconds": 60 },
    "teamsSearch": { "startedAt": "...", "completedAt": "...", "seconds": 45 },
    "complianceCheck": { "startedAt": "...", "completedAt": "...", "seconds": 30 }
  },
  "skippedSteps": ["troubleshooter"],
  "errors": []
}
```

### 6.3 Todo 文件格式

```markdown
# Todo — {case-id} — {YYYY-MM-DD HH:MM}

## 🔴 需人工决策
- [ ] {需用户判断的事项}

## 🟡 待确认执行
- [ ] 添加 Note: {内容摘要}
- [ ] 记录 Labor: {时长} {描述}
- [ ] 修改 SAP: {字段} → {值}

## ✅ 仅通知
- [x] {已完成的事项}
```

---

## 7. 工作流详解

### 7.1 /casework 完整流程

```
输入: Case Number
│
├── Step 1: 读配置，确保目录存在
│
├── Step 2a: 后台启动 teams-search Agent ──────────────────┐
│                                                          │
├── Step 2b: 内联 data-refresh                             │ (并行)
│   ├── 浏览器预检                                         │
│   ├── fetch-all-data.ps1 (snapshot+emails+notes 并行)    │
│   ├── download-attachments.ps1 (DTM)                     │
│   ├── ICM 数据拉取 (MCP)                                │
│   └── IR/FDR/FWR 检查 (API优先)                          │
│                                                          │
├── Step 3a: 内联 compliance-check                         │
│   ├── Entitlement 合规                                   │
│   └── 21v Convert 检测                                   │
│                                                          │
├── Step 3b: 内联 status-judge                             │
│   ├── 读邮件历史 + ICM 动态查询                          │
│   └── 判定 actualStatus + daysSinceLastContact            │
│                                                          │
├── Step 4: 按 actualStatus 路由                           │
│   ├── new → troubleshooter → email-drafter               │
│   ├── pending-engineer → troubleshooter → email-drafter   │
│   ├── pending-customer (≥3d) → email-drafter (follow-up)  │
│   ├── pending-pg → 仅记录                                │
│   ├── researching → troubleshooter                       │
│   └── ready-to-close → email-drafter (closure-confirm)    │
│                                                          │
├── Step 4.5: 等待 teams-search (3min 超时) ───────────────┘
│
├── Step 5: 内联 inspection-writer
│   ├── 写 inspection 报告
│   ├── 生成 Todo
│   └── 更新 lastInspected
│
├── Step 5.5: 写 timing.json
│
└── Step 6: 展示 🔴🟡✅ Todo 汇总 + 耗时统计
```

### 7.2 /patrol 批量巡检流程

```
输入: 无（自动获取全部活跃 Case）
│
├── Step 1: 读配置
│
├── Step 2: list-active-cases.ps1 获取活跃列表
│
├── Step 3: 对比 modifiedon vs lastInspected，筛选变化 Case
│
├── Step 4: 阶段 0 预热 (~15s, 并行)
│   ├── check-ir-status-batch.ps1 -SaveMeta  (批量 IR)
│   └── warm-dtm-token.ps1                   (DTM Token)
│
├── Step 5: 阶段 1 全量并行 casework
│   ├── Case A → Agent (casework)  ──┐
│   ├── Case B → Agent (casework)  ──┼── 全部并行
│   └── Case C → Agent (casework)  ──┘
│   (每个 10min 超时)
│
└── Step 6: 汇总所有 Todo
```

### 7.3 状态路由决策树

```
actualStatus
├── new
│   └── 💡 首次处理
│       ├── troubleshooter → 理解问题 + Kusto + 知识库
│       └── email-drafter → initial-response
│
├── pending-engineer
│   └── 💡 轮到工程师行动
│       ├── troubleshooter → 深度排查
│       └── email-drafter → 技术回复/request-info
│
├── pending-customer
│   └── daysSinceLastContact
│       ├── < 3 → ⏸ 无操作
│       └── ≥ 3 → email-drafter → follow-up
│
├── pending-pg
│   └── ⏸ 仅记录 ICM 状态，不启动 agent
│
├── researching
│   └── troubleshooter → 继续排查
│
└── ready-to-close
    └── email-drafter → closure-confirm
```

---

## 8. 外部系统集成

### 8.1 MCP Server 清单 (10 servers)

| Server | 用途 | 认证方式 |
|--------|------|---------|
| **playwright** | D365 浏览器自动化（数据抓取 + DTM） | Edge Profile Session |
| **icm** | ICM 事件管理（查询/摘要/影响） | Agency CLI 认证 |
| **teams** | Teams 消息搜索 + 聊天管理 | Agency CLI (M365) |
| **ado-msazure** | Azure DevOps (msazure org) — Wiki/KB/Pipeline | Agency CLI |
| **ado-contentidea** | Azure DevOps (contentidea org) — KB 文章 | Agency CLI |
| **ado-supportability** | Azure DevOps (supportability org) | Agency CLI |
| **kusto** | Kusto 查询执行 | Agency CLI (CME) |
| **msft-learn** | Microsoft Learn 文档搜索/获取 | Agency CLI |
| **workiq** | Microsoft 365 Copilot 工作智能 | Agency CLI |
| **mail** | Outlook 邮件管理 | Agency CLI (M365) |

### 8.2 D365 CRM 集成

通过 **Playwright + PowerShell** 实现浏览器自动化：
- `_init.ps1`: 连接管理 + D365 Tab 切换 + 浏览器重启守卫
- API 优先: `page.evaluate(fetch(...))` 直接调用 D365 Web API（不导航页面）
- UI 降级: API 失败时降级到 UI scraping（Playwright 导航）
- DTM Token: 用于附件下载的认证 Token（预热机制避免并行冲突）

### 8.3 ICM 集成

16 个 ICM 查询能力：
- `get-incident-details` / `get-ai-summary` / `get-incident-context`
- `get-incident-location` / `get-incident-customer-impact`
- `get-impacted-services-regions-clouds` / `get-similar-incidents`
- `get-mitigation-hints` / `get-support-requests-critsit`
- `get-teams-by-name` / `get-team-by-id` / `get-on-call-schedule-by-team-id`
- 等

### 8.4 Kusto 集成

12 个 Azure 服务诊断子技能，每个包含：
- `kusto_clusters.csv` — 集群 URI + 数据库映射
- `references/tables/` — 表结构定义（字段 + 类型 + 用途）
- `references/queries/` — 预制查询模板（含参数占位符）

---

## 9. Dashboard Web 应用

### 9.1 技术栈

| 层 | 技术 | 说明 |
|----|------|------|
| Frontend | React 18 + TypeScript | SPA |
| 构建 | Vite 6 | 开发/构建 |
| 样式 | TailwindCSS 3 | Utility-first CSS |
| 状态管理 | Zustand 5 | 轻量状态管理 |
| 数据请求 | TanStack React Query 5 | 服务端状态管理 |
| 路由 | React Router 7 | 客户端路由 |
| Markdown | react-markdown + remark-gfm | Markdown 渲染 |
| 图表 | Recharts 2 | 数据可视化 |
| 图标 | Lucide React | 图标库 |
| Backend | Hono 4 + Node.js | 轻量 HTTP 框架 |
| AI Engine | @anthropic-ai/claude-agent-sdk | Claude Code SDK |
| 实时通信 | SSE (Server-Sent Events) | 实时推送 |
| 认证 | JWT + bcryptjs | Token 认证 |
| 文件监控 | chokidar 4 | Case 目录变更监听 |

### 9.2 页面结构

| 路由 | 页面 | 功能 |
|------|------|------|
| `/` | Dashboard | Case 列表总览 + 快速操作 |
| `/case/:id` | CaseDetail | Case 详情 + AI 面板 + Session 管理 |
| `/todo` | TodoView | 全局 Todo 汇总 + 执行 |
| `/agents` | AgentMonitor | Agent 运行监控 |
| `/drafts` | DraftsPage | 邮件草稿管理 |
| `/settings` | SettingsPage | 用户配置 |
| `/login` | LoginPage | 登录页 |

### 9.3 API 路由

#### Case 处理
| Method | Path | 说明 |
|--------|------|------|
| POST | `/api/case/:id/process` | 启动完整 Case 处理 |
| POST | `/api/case/:id/chat` | 交互式反馈（resume session） |
| DELETE | `/api/case/:id/session` | 结束 session |
| GET | `/api/case/:id/sessions` | 获取 case sessions |
| POST | `/api/case/:id/session/end-all` | 结束所有 sessions |

#### 单步执行
| Method | Path | 说明 |
|--------|------|------|
| POST | `/api/case/:id/step/data-refresh` | 单步: 数据刷新 |
| POST | `/api/case/:id/step/compliance-check` | 单步: 合规检查 |
| POST | `/api/case/:id/step/status-judge` | 单步: 状态判断 |
| POST | `/api/case/:id/step/teams-search` | 单步: Teams 搜索 |
| POST | `/api/case/:id/step/troubleshoot` | 单步: 技术排查 |
| POST | `/api/case/:id/step/draft-email` | 单步: 邮件草稿 |
| POST | `/api/case/:id/step/inspection` | 单步: Inspection |
| POST | `/api/case/:id/step/generate-kb` | 单步: KB 生成 |

#### 批量 & 管理
| Method | Path | 说明 |
|--------|------|------|
| POST | `/api/patrol` | 批量巡检 |
| GET | `/api/sessions` | 全局 session 列表 |
| GET | `/api/todos/all` | Todo 汇总 |
| POST | `/api/todo/:id/execute` | 执行 Todo 项 |
| GET/PUT | `/api/settings` | 用户配置 |
| GET | `/api/health` | 健康检查 |

#### 数据读取
| Method | Path | 说明 |
|--------|------|------|
| GET | `/api/cases` | Case 列表 |
| GET | `/api/cases/:id` | Case 详情 |
| GET | `/api/drafts` | 草稿列表 |
| GET | `/api/events` | SSE 事件流 |

### 9.4 实时通信 (SSE)

Dashboard 使用 SSE 实现实时推送：
- `case-session-thinking`: Agent 执行中间状态
- `case-session-completed`: 处理完成
- `case-session-failed`: 处理失败
- `case-session-tool-result`: 工具执行结果
- `patrol-progress`: 巡检进度
- `patrol-updated`: 巡检完成
- `todo-updated`: Todo 变更
- 文件变更事件（chokidar 监听 case 目录）

### 9.5 Session 管理

```
Dashboard Session 管理
│
├── processCaseSession(caseNumber, intent)
│   ├── 创建 Claude SDK session
│   ├── 捕获 SDK 返回的 session_id
│   ├── 注册到 SessionStore
│   └── 流式转发消息到 SSE
│
├── chatCaseSession(sessionId, message)
│   ├── resume SDK session
│   ├── 记录用户输入到 user-inputs.jsonl
│   └── 流式转发
│
├── stepCaseSession(caseNumber, stepName)
│   ├── 有 session → resume
│   └── 无 session → 创建
│
├── executeTodoAction(caseNumber, action, params)
│   ├── 有 session → resume
│   └── 无 session → standalone query
│
└── patrolCoordinator(onProgress)
    ├── 单个 SDK session 执行 /patrol SKILL.md
    └── 完成后聚合 Todo
```

---

## 10. 安全设计

### 10.1 操作安全边界

| 类别 | 策略 | 说明 |
|------|------|------|
| ❌ 禁止 | 直接发邮件给客户 | 仅生成草稿 |
| ⚠️ 需确认 | D365 写操作 | Note/Labor/SAP 通过 Todo 🟡 确认 |
| ✅ 自动 | 读操作 + 分析 + 草稿 | 数据拉取、排查、报告均自动 |

### 10.2 认证

- Dashboard: JWT Token + bcrypt 密码哈希
- D365: Playwright Edge Profile（已登录的浏览器 session）
- MCP Servers: Agency CLI 统一认证
- Kusto: CME 卡认证 (Mooncake 环境)

### 10.3 数据安全

- 所有数据存储在本地文件系统
- 不上传 Case 数据到外部服务
- 日志不记录完整客户 PII（仅必要标识）

---

## 11. 技术栈

### 11.1 运行时环境

| 组件 | 技术 | 版本 |
|------|------|------|
| AI 引擎 | Claude Code + Claude Agent SDK | 0.2.77+ |
| 运行时 | Node.js | 18+ |
| 脚本引擎 | PowerShell (pwsh) | 7.x |
| 浏览器自动化 | Playwright + playwright-cli | latest |
| 包管理 | npm | 9+ |

### 11.2 AI 模型使用

| Agent | 模型 | 原因 |
|-------|------|------|
| Main Agent | Claude Opus 4 | 编排复杂工作流 |
| Troubleshooter | Claude Opus 4 | 技术排查需最强推理 |
| Email Drafter | Claude Sonnet 4 | 文本生成足够 |
| Teams Search | Claude Sonnet 4 | 搜索+格式化 |
| Inline Skills | 继承 Main Agent | — |

### 11.3 关键依赖

**Backend**:
- `hono`: 轻量 HTTP 框架
- `@anthropic-ai/claude-agent-sdk`: Claude Code SDK
- `chokidar`: 文件系统监控
- `jsonwebtoken` + `bcryptjs`: 认证

**Frontend**:
- `react` + `react-dom`: UI 框架
- `@tanstack/react-query`: 服务端状态管理
- `zustand`: 客户端状态管理
- `react-router-dom`: 路由
- `react-markdown` + `remark-gfm`: Markdown 渲染
- `recharts`: 图表
- `lucide-react`: 图标
- `tailwindcss`: 样式

---

## 12. 功能清单与实现状态

### 12.1 核心工作流

| # | 功能 | 状态 | 文件 |
|---|------|------|------|
| 1 | /casework 全流程编排 | ✅ 已实现 | `.claude/skills/casework/SKILL.md` |
| 2 | /patrol 批量巡检 | ✅ 已实现 | `.claude/skills/patrol/SKILL.md` |
| 3 | /data-refresh 数据刷新 | ✅ 已实现 | `.claude/skills/data-refresh/SKILL.md` |
| 4 | /compliance-check 合规检查 | ✅ 已实现 | `.claude/skills/compliance-check/SKILL.md` |
| 5 | /status-judge 状态判断 | ✅ 已实现 | `.claude/skills/status-judge/SKILL.md` |
| 6 | /troubleshoot 技术排查 | ✅ 已实现 | `.claude/skills/troubleshoot/SKILL.md` + `.claude/agents/troubleshooter.md` |
| 7 | /draft-email 邮件草稿 | ✅ 已实现 | `.claude/skills/draft-email/SKILL.md` + `.claude/agents/email-drafter.md` |
| 8 | /inspection-writer 报告生成 | ✅ 已实现 | `.claude/skills/inspection-writer/SKILL.md` |
| 9 | Teams 消息搜索 | ✅ 已实现 | `.claude/agents/teams-search.md` |

### 12.2 D365 脚本 (30 个)

| # | 脚本 | 状态 | 说明 |
|---|------|------|------|
| 1 | `_init.ps1` | ✅ | 初始化 + D365 连接 + 守卫 |
| 2 | `fetch-all-data.ps1` | ✅ | 并行拉取 snapshot+emails+notes |
| 3 | `fetch-case-snapshot.ps1` | ✅ | Case 快照 |
| 4 | `fetch-emails.ps1` | ✅ | 邮件历史 |
| 5 | `fetch-notes.ps1` | ✅ | Notes 历史 |
| 6 | `download-attachments.ps1` | ✅ | DTM 附件下载 |
| 7 | `check-ir-status.ps1` | ✅ | IR/FDR/FWR 检查 (API+UI) |
| 8 | `check-ir-status-batch.ps1` | ✅ | 批量 IR 预检 |
| 9 | `warm-dtm-token.ps1` | ✅ | DTM Token 预热 |
| 10 | `list-active-cases.ps1` | ✅ | 活跃 Case 列表 |
| 11 | `add-note.ps1` | ✅ | 添加 Note |
| 12 | `record-labor.ps1` | ✅ | 记录 Labor |
| 13 | `edit-sap.ps1` | ✅ | 修改 SAP 字段 |
| 14 | `new-email.ps1` | ✅ | 新建邮件 |
| 15 | `reply-email.ps1` | ✅ | 回复邮件 |
| 16 | `open-app.ps1` | ✅ | 打开 D365 应用 |
| 17 | `open-case.ps1` | ✅ | 打开指定 Case |
| 18 | `open-draft.ps1` | ✅ | 打开草稿 |
| 19 | `open-email.ps1` | ✅ | 打开邮件 |
| 20 | `switch-case.ps1` | ✅ | 切换 Case |
| 21 | `search-case.ps1` | ✅ | 搜索 Case |
| 22 | `view-details.ps1` | ✅ | 查看详情 |
| 23 | `view-attachments.ps1` | ✅ | 查看附件列表 |
| 24 | `view-timeline.ps1` | ✅ | 查看时间线 |
| 25 | `view-labor.ps1` | ✅ | 查看 Labor |
| 26 | `refresh-timeline.ps1` | ✅ | 刷新时间线 |
| 27 | `add-phone-call.ps1` | ✅ | 添加电话记录 |
| 28 | `delete-draft.ps1` | ✅ | 删除草稿 |
| 29 | `edit-draft.ps1` | ✅ | 编辑草稿 |
| 30 | `request-access.ps1` | ✅ | 请求访问权限 |

### 12.3 Kusto 诊断子技能 (12 个)

| # | 服务 | 表 | 查询 | 状态 |
|---|------|---|------|------|
| 1 | ACR | 6 | 10 | ✅ |
| 2 | AKS | 24 | 14 | ✅ |
| 3 | ARM | 12 | 7 | ✅ |
| 4 | AVD | 11 | 10 | ✅ |
| 5 | Disk | 6 | 10 | ✅ |
| 6 | Entra ID | — | 8 | ✅ |
| 7 | EOP | — | — | ✅ |
| 8 | Intune | 11 | 13 | ✅ |
| 9 | Monitor | 8 | 5 | ✅ |
| 10 | Networking | 9 | 7 | ✅ |
| 11 | Purview | 3 | 3 | ✅ |
| 12 | VM | 24 | 15 | ✅ |
| **合计** | | **122** | **102** | |

### 12.4 Dashboard

| # | 功能 | 状态 | 说明 |
|---|------|------|------|
| 1 | 认证系统 (JWT) | ✅ | 登录页 + Token 管理 |
| 2 | Dashboard 总览页 | ✅ | Case 列表 + 快速操作 |
| 3 | Case 详情页 | ✅ | 多 Tab 查看 + AI 面板 |
| 4 | Todo 管理页 | ✅ | 汇总 + 执行 |
| 5 | Agent 监控页 | ✅ | Session 状态监控 |
| 6 | 草稿管理页 | ✅ | 邮件草稿查看 |
| 7 | 设置页 | ✅ | 配置编辑 |
| 8 | SSE 实时推送 | ✅ | 处理进度实时展示 |
| 9 | Claude SDK 集成 | ✅ | per-case session 管理 |
| 10 | 文件变更监听 | ✅ | chokidar 监控 case 目录 |
| 11 | Case 处理 API | ✅ | process / chat / step |
| 12 | Patrol API | ✅ | 批量巡检 |
| 13 | Todo 执行 API | ✅ | D365 写操作执行 |

### 12.5 辅助能力

| # | 功能 | 状态 | 说明 |
|---|------|------|------|
| 1 | Humanizer (EN) | ✅ | 英文 AI 文本去味 |
| 2 | Humanizer (ZH) | ✅ | 中文 AI 文本去味 |
| 3 | ICM 查询 (16 scripts) | ✅ | 事件管理全方位查询 |
| 4 | ContentIdea KB 搜索 | ✅ | 知识库搜索 |
| 5 | WorkIQ 查询 | ✅ | M365 工作智能 |
| 6 | KB 文章生成 | ✅ | 关单时生成 KB |
| 7 | 记忆系统 | ✅ | 每日 + 长期 + 经验 |
| 8 | 邮件操作 (MCP) | ✅ | 搜索/发送/回复/转发 |

### 12.6 Playbooks (领域知识)

| # | 类别 | 文件 | 状态 |
|---|------|------|------|
| 1 | Schema: Case 目录结构 | `schemas/case-directory.md` | ✅ |
| 2 | Schema: Meta Schema | `schemas/meta-schema.md` | ✅ |
| 3 | Schema: Timing Schema | `schemas/timing-schema.md` | ✅ |
| 4 | Schema: Todo 格式 | `schemas/todo-format.md` | ✅ |
| 5 | Rules: Case 生命周期 | `rules/case-lifecycle.md` | ✅ |
| 6 | Rules: IR/Entitlement | `rules/ir-entitlement.md` | ✅ |
| 7 | Guide: 客户沟通 | `guides/customer-communication.md` | ✅ |
| 8 | Guide: 邮件模板 | `guides/email-templates.md` | ✅ |
| 9 | Guide: 排查指南 | `guides/troubleshooting.md` | ✅ |
| 10 | Guide: Kusto 查询 | `guides/kusto-queries.md` | ✅ |
| 11 | Guide: D365 操作 | `guides/d365-operations.md` | ✅ |
| 12 | 参考邮件样本 | `email-samples/` | ✅ |

---

## 附录

### A. 关键设计决策记录

| 决策 | 选项 | 选择 | 原因 |
|------|------|------|------|
| Agent 框架 | LangChain / AutoGen / Claude Code | **Claude Code + Agent SDK** | 原生 Claude 能力，MCP 生态，零额外框架 |
| 数据持久化 | 数据库 / 文件系统 | **文件系统 (Markdown + JSON)** | 简单、可读、可 Git 版本控制、无运维 |
| D365 集成 | API / Playwright | **Playwright + API 混合** | 部分操作无 API，需浏览器自动化 |
| 状态管理 | 集中式 / Per-case | **Per-case 文件** | 每个 Case 独立，无状态耦合 |
| 实时通信 | WebSocket / SSE | **SSE** | 单向推送足够，实现简单 |
| 前端框架 | Next.js / Vite+React | **Vite + React** | 纯前端 SPA 足够，无需 SSR |
| HTTP 框架 | Express / Hono | **Hono** | 轻量、TypeScript 友好、高性能 |
| 并行策略 | 全串行 / 全并行 / 混合 | **预热 + 全并行** | 预热解决资源互斥后完全并行 |

### B. 数量统计

| 类别 | 数量 |
|------|------|
| Workflow Skills (slash commands) | 8 |
| Agent Specs (spawn agents) | 3 |
| D365 PowerShell 脚本 | 30 |
| ICM PowerShell 脚本 | 16 |
| Kusto 诊断子技能 | 12 |
| Kusto 表定义 | 122 |
| Kusto 查询模板 | 102 |
| MCP Server | 10 |
| Playbook 文件 | 12 |
| Dashboard 页面 | 7 |
| Dashboard API 路由 | ~20 |
| Dashboard 后端 Service | 8 |
| Frontend 组件 | ~15 |

### C. 术语表

| 术语 | 说明 |
|------|------|
| **actualStatus** | AI 综合判断的 Case 实际状态（区别于 D365 Status 字段） |
| **DTM** | Document Transfer Manager — D365 附件下载系统 |
| **IR** | Initial Response — 首次响应 SLA |
| **FDR** | First Diagnostic Response |
| **FWR** | First Workaround Response |
| **ICM** | Incident Management — 微软内部事件管理系统 |
| **21v Convert** | 21Vianet 转单 Case（中国云特有） |
| **Entitlement** | 服务合同/权限 |
| **Humanizer** | AI 文本润色工具（去 AI 味） |
| **Agency** | Microsoft 内部 CLI 工具，提供 MCP server |
| **CME** | 中国云 Mooncake 环境认证卡 |
| **KQL** | Kusto Query Language |
