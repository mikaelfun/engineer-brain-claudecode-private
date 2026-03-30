# EngineerBrain — Next Phase: Polish & Automation

## What This Is

EngineerBrain 是一个 AI 驱动的 Azure 支持工程师工具集，覆盖 D365 Case 全生命周期管理。已有 Dashboard Web UI、18 个 CLI skills、6 个 subagent、12 个 MCP 集成、自动化测试框架。本阶段目标是打磨现有功能，让系统从"能用"变成"可靠无人值守"。

## Core Value

测试框架完全自动化运行 — cron 触发、自动执行、实时可观测、无需人工干预。

## Requirements

### Validated

- ✓ Case 数据自动拉取（data-refresh skill） — existing
- ✓ Case 合规检查（compliance-check skill） — existing
- ✓ Case 状态判断（status-judge skill） — existing
- ✓ Case 技术排查（troubleshooter agent） — existing
- ✓ 邮件草稿生成（email-drafter agent） — existing
- ✓ Case 巡检（patrol skill） — existing
- ✓ Dashboard Web UI（React + Hono） — existing
- ✓ TestLab 页面基础版 — existing
- ✓ 测试框架 SCAN→GENERATE→TEST→FIX→VERIFY 循环 — existing
- ✓ 40+ bash executor 覆盖 7 个测试类别 — existing
- ✓ Issue Tracker（CLI + WebUI 同步） — existing
- ✓ OneNote 导出 + RAG 向量搜索 — existing
- ✓ Teams/Mail/Kusto/ICM MCP 集成 — existing

### Active

- [ ] 测试状态机可靠运行不卡死
- [ ] TestLab WebUI 实时显示测试状态、进度、日志流
- [ ] 测试 cron 定时触发，完全无人值守
- [ ] 测试异常自动通知（WebUI 看板 + 可选消息通知）
- [ ] Dashboard 性能优化（SSE 稳定性、加载速度）
- [ ] Dashboard UI/UX 统一（暗色主题一致性、布局合理化）
- [ ] Casework data-refresh 速度优化
- [ ] Casework 流程可靠性提升（步骤间数据传递不丢失）

### Out of Scope

- OneNote 知识提取为 SOP 手册 — 长期功能，本阶段不做
- 邮件扫描自动分类 — 长期功能
- ADO Wiki 知识提取 — 长期功能
- 团队 Case Review 自动化 — 长期功能
- 移动端适配 — 不需要
- 多用户/多团队支持 — 单人使用

## Context

- 测试框架已跑到 Round 28，165 passed / 44 failed / 13 skipped
- 状态机 state.json 需要手动修复才能恢复
- TestLab WebUI 当前不可靠，无法替代 CLI 查状态
- Dashboard 暗色主题存在不一致的地方
- data-refresh 是 casework 流程中最慢的环节
- 现有 bash executor 维护成本高，但核心流程已验证可行
- 用户对重构持开放态度 — 如果有更好的方案愿意换

## Constraints

- **Runtime**: Windows + Git Bash (MSYS2)，路径必须 POSIX 格式
- **Tech stack**: TypeScript (Dashboard), Bash (test executors), PowerShell (D365/Kusto)
- **Browser**: 仅 Edge，不支持 Chrome
- **AI model**: Claude via Agent SDK，haiku 子 agent 当前 API 400 不可用
- **Single user**: 只有 Kun Fang 一个人使用
- **MCP**: 12 个 MCP server 已配置稳定，不需要改动

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 测试框架优先于 Dashboard 和 Casework | 测试自动化是开发效率基础，不稳定影响迭代节奏 | — Pending |
| 愿意重构测试框架 | 40+ bash executor + state.json 可能不是最优方案 | — Pending |
| WebUI 实时看板作为主要监控方式 | 比 CLI 命令更直观，支持无人值守场景 | — Pending |
| 完全无人值守为最终目标 | cron 触发、自动执行、自动通知，不需要人盯 | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-30 after initialization*
