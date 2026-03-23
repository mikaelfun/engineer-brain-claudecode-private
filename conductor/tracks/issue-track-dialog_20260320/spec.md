# Specification: Issue Track 对话框补充信息

**Track ID:** issue-track-dialog_20260320
**Type:** Feature
**Created:** 2026-03-20
**Status:** Draft

## Summary

在 WebUI Issues 页面，点击 "Create Track" 按钮后弹出对话框，让用户补充 track 创建所需的额外信息（验收标准、范围说明、技术约束等），这些信息会作为 prompt 上下文传给 `/conductor:new-track`，避免 Claude session 因缺少信息而生成低质量的 spec/plan。

## Source
Issue: ISS-017 (feature, P1)

## Acceptance Criteria

- [ ] 点击 Create Track 按钮后弹出模态对话框
- [ ] 对话框包含可选输入字段：额外说明 / 验收标准 / 技术约束
- [ ] 用户可直接跳过（使用 issue description 自动推断）
- [ ] 用户提交后，补充信息附加到 spawn Claude session 的 prompt 中
- [ ] TypeScript 编译无错误

## Technical Notes

- 前端：Issues.tsx 新增 TrackDialog modal state + UI
- 后端：`create-track` 路由接受 optional body `{ extraContext?: string }`
- 在 ISS-016 修复的基础上扩展（已有 async spawn + SSE）
