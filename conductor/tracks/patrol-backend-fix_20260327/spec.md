# Specification: Patrol 后端重构 — 调度+预热+per-case processCaseSession

**Track ID:** patrol-backend-fix_20260327
**Type:** Bug
**Created:** 2026-03-27
**Status:** Draft
**Source:** ISS-111

## Summary

重构 `_runPatrol()` 实现：后端做调度（case 发现 + 筛选 + 预热），per-case 处理走 `processCaseSession()` 创建独立 session，每个 case session 在 Agent Monitor 和 Case 详情页可跟踪。

## Problem Description

当前 `_runPatrol()` 直接为每个 case 调用 SDK `query()`，存在多个问题：

1. **SDK query() 完全无响应** — `for await (const message of query(...))` 不产出任何 message，导致 patrol 卡死
2. **Prompt 指向错误 skill** — 让 per-case session 读 `patrol/SKILL.md`（调度器），应该读 `casework/SKILL.md`（case 处理器）
3. **缺少预热阶段** — SKILL.md 定义的 DTM token + IR batch 预热完全缺失
4. **无 case 筛选** — 处理所有 active case，而非按 `lastInspected > 24h` 过滤
5. **Session 不可追踪** — 直接 `query()` 不经过 `processCaseSession()`，session 不注册到 `sessions` map / `caseIndex`，Agent Monitor 看不到，Case 详情页也看不到

## Acceptance Criteria

- [ ] Patrol 使用 `processCaseSession()` 为每个 case 创建独立 session
- [ ] 每个 patrol case session 在 Agent Monitor 可见（session type/intent 标识为 patrol）
- [ ] 每个 patrol case session 在 Case 详情页可跟踪（SSE 消息流 + session 列表）
- [ ] Patrol 开始前执行预热阶段（DTM token + IR batch check）
- [ ] Case 筛选：仅处理 `lastInspected` 超过 24h 或新 case
- [ ] Prompt 指向 `casework/SKILL.md`（不是 `patrol/SKILL.md`）
- [ ] 进度 SSE 事件正常广播（patrol-progress / patrol-case-completed）
- [ ] `patrolRunning` 标志在 patrol 结束/失败后正确清除
- [ ] 单个 case 处理失败不影响其他 case（错误隔离）
- [ ] Cancel patrol 可以终止所有正在进行的 case session

## Dependencies

- `processCaseSession()` — 已有，创建 per-case SDK session 并注册到 session store
- `broadcastSDKMessages()` — 已有，将 SDK message 转为 SSE 事件广播
- `registerQuery()` / `abortQuery()` — 已有，AbortController 管理
- `acquireCaseOperationLock()` — 已有，防止重复操作
- PowerShell 脚本：`check-ir-status-batch.ps1`、`warm-dtm-token.ps1` — 已有

## Out of Scope

- 修改 `/patrol` SKILL.md 定义（保持不变）
- 修改 `processCaseSession()` 本身的逻辑
- 前端 patrol progress UI（已在 ISS-094 track 完成）
- 新增 MCP 工具权限

## Technical Notes

- `processCaseSession()` 是 AsyncGenerator，需要配合 `broadcastSDKMessages()` 消费
- 并发度需控制（5 个并发 session），避免 SDK 连接过载
- 预热脚本通过 `child_process.execSync` 执行 PowerShell
- Case 筛选读取 `{casesRoot}/active/{caseNumber}/casehealth-meta.json` 的 `lastInspected` 字段
