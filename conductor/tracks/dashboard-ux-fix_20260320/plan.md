# Implementation Plan: Dashboard UX Fix

**Track ID:** dashboard-ux-fix_20260320
**Spec:** [spec.md](./spec.md)
**Created:** 2026-03-20
**Status:** [x] Complete

## Overview

分 4 个 Phase 修复 Dashboard UX 问题，按 Critical → High → Medium → Low 优先级递进。每个 Phase 独立可验证，修复后即可投入使用。

---

## Phase 1: Critical Fixes — 核心工作流修复

修复 4 个 Critical 级别问题，确保 Dashboard 核心工作流可靠运行。

### Tasks

- [x] Task 1.1: **防止重复 Session Spawn（后端）**
  - 在 `case-session-manager.ts` 中添加 per-case per-action-type 单例检查
  - 如果已有活跃 session 且类型匹配，返回现有 session 而非创建新的
  - 在 `steps.ts` 路由中增加并发保护（锁或 flag）
  - 文件: `dashboard/src/agent/case-session-manager.ts`, `dashboard/src/routes/steps.ts`

- [x] Task 1.2: **防止重复 Session Spawn（前端）**
  - 在 `CaseAIPanel.tsx` 中按钮点击后立即禁用（乐观锁）
  - 增加 loading spinner + 状态文字（"正在启动..."）
  - 轮询 session 状态间隔从 10s 缩短至 3s（活跃时）
  - 启动前先查询后端是否已有活跃 session
  - 文件: `dashboard/web/src/components/CaseAIPanel.tsx`

- [x] Task 1.3: **实时进度反馈**
  - 后端：在 `case-session-manager.ts` 中 SDK 回调时通过 SSE 广播步骤级事件（step_started, step_completed, step_error）
  - 前端：在 `CaseAIPanel.tsx` 中增加步骤进度条/列表组件，消费 SSE 事件
  - 展示当前步骤名称、已完成步骤列表、耗时
  - 文件: `dashboard/src/agent/case-session-manager.ts`, `dashboard/src/watcher/sse-manager.ts`, `dashboard/web/src/components/CaseAIPanel.tsx`

- [x] Task 1.4: **刷新后恢复进度**
  - 后端：在 session 元数据中持久化 message history 和当前步骤状态到 `.case-sessions.json`
  - 新增 API: `GET /api/cases/:id/sessions/:sessionId/messages` 返回持久化消息
  - 前端：页面加载时检查活跃 session，从后端恢复消息列表和进度状态
  - 文件: `dashboard/src/agent/case-session-manager.ts`, `dashboard/src/routes/case-routes.ts`, `dashboard/web/src/components/CaseAIPanel.tsx`

- [x] Task 1.5: **修复 Todo 加载**
  - 统一 todo 数据源为 per-case todo（`cases/active/<id>/todo/`）
  - 移除 `todo-reader.ts` 中的 legacy 全局 todo 解析逻辑
  - 修复 `routes/todos.ts` 的聚合逻辑，确保遍历所有活跃 case 的 todo
  - 前端 `TodoView.tsx` 移除 fallback to legacy 逻辑
  - 文件: `dashboard/src/services/todo-reader.ts`, `dashboard/src/routes/todos.ts`, `dashboard/web/src/pages/TodoView.tsx`

### Verification

- [ ] 快速点击同一操作按钮 5 次，仅创建 1 个 session
- [ ] 启动 Full Process 后看到实时步骤进度
- [ ] 刷新页面后进度/消息完整恢复
- [ ] Todo 页面正常加载并显示所有 case 的 todo 数据

---

## Phase 2: High Priority Fixes — 可用性提升

修复 6 个 High 级别问题，消除主要 UX 障碍。

### Tasks

- [x] Task 2.1: **修复 Workspace Not Found**
  - 在 `config.ts` 中增加多路径解析容错（相对路径 → 绝对路径 → 环境变量）
  - `workspace.ts` 的 `isWorkspaceReady()` 增加目录自动创建逻辑
  - `Layout.tsx` 中将 banner 改为 warning toast 而非阻断式横幅，并提供 "配置路径" 快捷链接
  - 文件: `dashboard/src/config.ts`, `dashboard/src/services/workspace.ts`, `dashboard/web/src/components/Layout.tsx`

- [x] Task 2.2: **修复 Analysis Tab 误报空**
  - 后端 `cases.ts` 中 `GET /api/cases/:id/analysis` 扩展扫描逻辑：
    - 扫描 `analysis/` 下所有文件（不限 `.md`）
    - 支持嵌套子目录
    - 返回文件列表而非单一 content
  - 前端渲染多个 analysis 文件的内容
  - 文件: `dashboard/src/routes/cases.ts`, `dashboard/web/src/pages/CaseDetail.tsx`

- [x] Task 2.3: **修复 Case 标题显示**
  - `Dashboard.tsx` 列表视图：移除 `truncate`，改为两行显示 + tooltip
  - `CaseDetail.tsx` 详情页：标题完整展示
  - 文件: `dashboard/web/src/pages/Dashboard.tsx`, `dashboard/web/src/pages/CaseDetail.tsx`

- [x] Task 2.4: **Patrol 并行执行**
  - 后端 `case-session-manager.ts` 中 `patrolCoordinator()` 改为并发启动多个 case session
  - 使用 `Promise.allSettled` 并行处理
  - 通过 SSE 广播每个 case 的独立进度
  - 前端 `AgentMonitor.tsx` 展示并行进度（进度条 + case 列表）
  - 文件: `dashboard/src/agent/case-session-manager.ts`, `dashboard/src/routes/case-routes.ts`, `dashboard/web/src/pages/AgentMonitor.tsx`

- [x] Task 2.5: **Draft Email AI 自动识别类型**
  - 前端 `CaseAIPanel.tsx` 中 Draft Email 按钮增加下拉：
    - "AI 自动识别"（默认）
    - 手动选择：Initial Response / Follow-up / Closure 等
  - 后端 `steps.ts` 的 draft-email 路由支持 `type: "auto"` 参数
  - 文件: `dashboard/web/src/components/CaseAIPanel.tsx`, `dashboard/src/routes/steps.ts`

- [x] Task 2.6: **步骤级日志写入**
  - 后端 `case-session-manager.ts` 中每个步骤完成时写入日志到 `cases/active/<id>/logs/`
  - 日志格式：`YYYY-MM-DD_HH-mm_<step-name>.log`
  - 包含：步骤名称、开始/结束时间、状态、关键输出摘要
  - 前端 `CaseDetail.tsx` Logs tab 按时间倒序展示日志列表
  - 文件: `dashboard/src/agent/case-session-manager.ts`, `dashboard/src/routes/cases.ts`, `dashboard/web/src/pages/CaseDetail.tsx`

### Verification

- [ ] Dashboard 启动后无误报 Workspace Not Found（路径正确时）
- [ ] 有 analysis 内容时 tab 正确显示
- [ ] 长标题 case 在列表和详情页完整可见
- [ ] Patrol 多个 case 同时处理，前端显示并行进度
- [ ] Draft Email 默认 AI 自动识别类型
- [ ] 每个步骤完成后 Logs tab 有对应日志

---

## Phase 3: Medium Priority Fixes — UX 摩擦消除

修复 8 个 Medium 级别问题，提升日常使用体验。

### Tasks

- [x] Task 3.1: **Todo 系统统一与增强**
  - 移除所有 legacy todo 代码（`todo-reader.ts` 旧格式解析、`TodoView.tsx` fallback）
  - 统一 todo 解析逻辑为结构化 JSON（非 emoji regex）
  - 增加 "不需要" 状态支持（除了完成/待办）
  - 文件: `dashboard/src/services/todo-reader.ts`, `dashboard/src/services/todo-writer.ts`, `dashboard/web/src/pages/TodoView.tsx`

- [x] Task 3.2: **合并 Session/AI 面板**
  - 将 `CaseSessionPanel` 和 `CaseAIPanel` 合并或明确分工
  - Session 面板：仅展示 session 历史和元数据
  - AI 面板：统一操作入口（Full Process、各步骤、Chat）
  - 消除功能重叠和用户困惑
  - 文件: `dashboard/web/src/components/CaseAIPanel.tsx`, `dashboard/web/src/components/CaseSessionPanel.tsx`, `dashboard/web/src/pages/CaseDetail.tsx`

- [x] Task 3.3: **Patrol 进度优化**
  - `AgentMonitor.tsx` 中增加细粒度进度：已处理/总数、每个 case 状态
  - 支持取消正在运行的 patrol
  - 文件: `dashboard/web/src/pages/AgentMonitor.tsx`, `dashboard/src/routes/case-routes.ts`

- [x] Task 3.4: **Drafts 页面优化**
  - 确认折叠功能正常工作
  - 改进空行处理：保留邮件格式原始换行
  - 增加 "复制到剪贴板" 按钮
  - 文件: `dashboard/web/src/pages/DraftsPage.tsx`

- [x] Task 3.5: **Tab 数据预加载**
  - `CaseDetail.tsx` 中在后台预取关键 tab 数据（emails, notes, todo 数量）
  - Tab badge 显示数量而非仅在打开时加载
  - 文件: `dashboard/web/src/pages/CaseDetail.tsx`

- [x] Task 3.6: **Agent Monitor 自动刷新**
  - 活跃 agent 运行时自动轮询（5s 间隔）
  - 无活跃 agent 时降低轮询频率（30s）
  - 文件: `dashboard/web/src/pages/AgentMonitor.tsx`

### Verification

- [ ] Todo 系统使用统一结构化数据，无 legacy 代码残留
- [ ] Case 详情页 AI 面板清晰、无功能重叠
- [ ] Patrol 有准确的并行进度和取消能力
- [ ] Drafts 格式正确、可折叠、可复制
- [ ] Tab badge 在未打开时也显示数量

---

## Phase 4: Low Priority Polish — 体验打磨

修复 3 个 Low 级别问题，进一步提升体验。

### Tasks

- [x] Task 4.1: **Case 列表多维排序**
  - 增加排序选项：Severity（现有）、Status、SLA 剩余时间、Todo 数量
  - 默认排序：SLA 紧急度 > Severity > 状态
  - 文件: `dashboard/web/src/pages/Dashboard.tsx`

- [x] Task 4.2: **Teams/Logs Tab 结构化展示**
  - Teams tab：按消息分组、高亮关键信息
  - Logs tab：按步骤分组、可折叠、可搜索
  - 文件: `dashboard/web/src/pages/CaseDetail.tsx`

- [x] Task 4.3: **Settings 路径改进**
  - 增加路径验证反馈（输入后即时检查目录是否存在）
  - 显示当前有效路径和 case 数量
  - 文件: `dashboard/web/src/pages/SettingsPage.tsx`

### Verification

- [ ] Case 列表支持多维排序且默认排序合理
- [ ] Teams/Logs tab 有结构化、可读的展示
- [ ] Settings 路径输入有即时反馈

---

## Final Verification

- [ ] 所有 acceptance criteria 通过
- [ ] Dashboard 启动无错误
- [ ] 核心工作流（casework、patrol）端到端可用
- [ ] 页面刷新后状态完整保留
- [ ] Todo 数据正常加载和展示
- [ ] 无重复 Agent spawn
- [ ] Finetune.txt 中记录的问题逐一验证修复
- [ ] Ready for review

---

_Generated by Conductor. Tasks will be marked [~] in progress and [x] complete._
