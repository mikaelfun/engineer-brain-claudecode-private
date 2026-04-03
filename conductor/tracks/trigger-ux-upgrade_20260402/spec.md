# Specification: Trigger Run UX Upgrade + Dashboard Button Review

**Track ID:** trigger-ux-upgrade_20260402
**Type:** Bug
**Created:** 2026-04-02
**Status:** Complete
**Issue:** ISS-209

## Summary

Agents页面Trigger Run按钮无实时反馈（无spinner、无进度、无取消），全面升级为SSE驱动的实时体验。

## Changes Made

### Backend (`dashboard/src/`)
- **cron-manager.ts**: 
  - 添加 `runningProcesses` Map 追踪运行中的子进程
  - `executeCronPrompt()` 现在广播 SSE 事件（trigger-started/progress/completed/failed/cancelled）
  - 实时 stdout 流式输出
  - 新增 `cancelTrigger()` 支持取消（Windows taskkill / Unix SIGTERM）
  - 新增 `isTriggerRunning()` / `getRunningTriggerIds()`
  - 防止重复运行（double-run protection）
- **routes/agents.ts**:
  - GET /triggers 返回 `running` 状态字段
  - 新增 POST /triggers/:id/cancel 端点
- **types/index.ts**: 添加5个新SSE事件类型

### Frontend (`dashboard/web/src/`)
- **stores/triggerRunStore.ts**: 新建 Zustand store，追踪 trigger 运行状态、实时输出、elapsed time
- **hooks/useSSE.ts**: 添加5个 trigger SSE 事件监听
- **api/hooks.ts**: 新增 `useCancelTrigger()` hook
- **pages/AgentMonitor.tsx**: 
  - 运行中: spinning Loader2 + "Running" badge + 实时输出面板
  - 完成: 绿色 CheckCircle2 + duration + 可 dismiss 的结果面板
  - 失败: 红色 AlertCircle + error 展示
  - 取消: Square stop 按钮替换 Play 按钮
  - 运行中禁止 Delete
