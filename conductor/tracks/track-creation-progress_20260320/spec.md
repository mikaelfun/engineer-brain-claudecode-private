# Specification: Track 创建流程完善 — 实时进度 + Plan 展示

**Track ID:** track-creation-progress_20260320
**Type:** Feature
**Created:** 2026-03-20
**Status:** Complete

## Summary

完善 WebUI Issues 页面的 Track 创建流程：新增 `tracking` 中间状态，agent 执行期间展示实时进度（SSE → Zustand → UI），agent 完成后展示 plan.md 关键内容，只有确认 trackId + plan.md 存在后才显示 Implement 按钮。支持页面刷新后恢复进度面板状态。

## Source
Issue: ISS-019 (feature, P0)

## Acceptance Criteria

- [x] 新增 `tracking` 中间状态到 IssueStatus 类型
- [x] create-track 路由：pending → tracking（执行中）→ tracked（成功）/ pending（失败）
- [x] agent 执行期间广播 tool-call + thinking 两种 SSE 进度事件
- [x] agent 完成后 SSE 事件附带 plan.md 概要（前 2000 字符）
- [x] 新增 GET /api/issues/:id/track-plan 和 track-progress API
- [x] 内存缓存进度消息，支持页面刷新恢复
- [x] 前端 Zustand store + SSE 监听 + TrackProgressPanel 组件
- [x] tracking 状态下按钮禁用（防重复点击）
- [x] TypeScript 前后端编译通过
- [x] 所有 51 个单元测试通过

## Technical Notes

- 后端：issue-track-state.ts 内存缓存 + issues.ts 路由改造 + 2 个新 API
- 前端：issueTrackStore.ts + useSSE.ts 4 个事件监听 + TrackProgressPanel.tsx + Issues.tsx 集成
- 参考 CaseAIPanel/caseSessionStore 的消息流模式
