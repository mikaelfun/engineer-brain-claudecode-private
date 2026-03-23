# Specification: Fix WebUI Issue Track Button

**Track ID:** issue-track-fix_20260320
**Type:** Bug
**Created:** 2026-03-20
**Status:** Draft

## Summary

WebUI Issues 页面点击 "Create Track" 按钮后，只调用 `createTrackFromIssue()` 创建空白 stub 文件，没有执行 `/conductor:new-track` 生成完整的 spec 和 plan。需要修改为异步 spawn Claude session 执行 `/conductor:new-track`。

## Source
Issue: ISS-016 (bug, P1)

## Problem Description

当前 `POST /api/issues/:id/create-track` 路由：
1. 调用 `createTrackFromIssue(issue)` 创建最小化 stub 目录（空 spec、空 plan）
2. 立即更新 issue status 为 'tracked'
3. 没有执行 `/conductor:new-track` 来生成完整的 specification 和 implementation plan

这导致 track 被创建但没有可执行的计划，后续 `/conductor:implement` 无法正常工作。

## Acceptance Criteria

- [ ] "Create Track" 按钮触发后端 spawn Claude session 执行 `/conductor:new-track`
- [ ] 通过 SSE 广播 track 创建进度
- [ ] 创建完成后 issue 自动更新 trackId 和 status
- [ ] SSEEventType 包含 track 创建相关事件类型
- [ ] TypeScript 编译无错误

## Technical Notes

- 采用与 ISS-013 (start-implement) 相同的 async spawn + SSE 模式
- Claude session prompt 包含 issue 信息，让 `/conductor:new-track` 可以自动填充
