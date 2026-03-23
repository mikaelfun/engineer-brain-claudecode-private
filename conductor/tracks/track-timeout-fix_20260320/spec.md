# Specification: Create Track 超时修复 — 交互输入阻塞 + plan.md 非空校验

**Track ID:** track-timeout-fix_20260320
**Type:** Bug Fix
**Created:** 2026-03-20
**Status:** Complete

## Summary

修复 WebUI 点击 Create Track 后 agent 超时、plan.md 为空的问题。根因：`/conductor:new-track` skill 可能使用 `AskUserQuestion` 等交互式工具，但 WebUI spawn 的 Claude session（`permissionMode: 'acceptEdits'`）没有向用户传递交互式问题的通道，导致 agent 跳过关键步骤或超时退出，产出空的 plan.md。

## Source

Issue: ISS-020 (bug, P0)

## Root Cause Analysis

1. **交互通道缺失**：`/conductor:new-track` skill 在 CLI 环境下可能通过 `AskUserQuestion` 与用户确认 spec 内容、选择实现方案。WebUI 使用 `permissionMode: 'acceptEdits'` 的 `query()` API 调用，没有能力将 `AskUserQuestion` 事件传递到前端 UI 并等待用户回答。
2. **prompt 指示不够强**：当前 prompt 包含 "For questions, make reasonable choices based on the issue description"，但这依赖于 agent 遵守指示。如果 skill 内部硬编码了 `AskUserQuestion` 调用，agent 仍然会等待交互。
3. **plan.md 非空校验缺失**：后端找到 trackId 后立即标记为 `tracked`，没有验证 plan.md 是否有实质内容（非空、包含 Phase/Task 结构）。
4. **成功判定过于宽松**：只要 `spec.md` 包含 issue ID 就认定成功，可能匹配到半成品 track。

## Acceptance Criteria

- [ ] Prompt 中增加明确的 "DO NOT use AskUserQuestion" 指示，强制 agent 自主决策
- [ ] 后端增加 plan.md 非空校验：必须包含实质内容（>100 字符，包含 "Phase" 或 "Task" 关键词）
- [ ] plan.md 校验失败时标记为 failed（回退 pending），不标记为 tracked
- [ ] 前端 TrackProgressPanel 能正确展示 "创建失败：plan.md 为空" 的错误信息
- [ ] 增加 spec.md 内容校验（非空、包含 Summary/Acceptance Criteria 等关键结构）
- [ ] TypeScript 前后端编译通过
- [ ] 所有单元测试通过

## Technical Notes

### 修复策略

**方案 1（推荐）：强化 prompt + 非空校验**
- 在 prompt 中添加 `IMPORTANT: Do NOT use AskUserQuestion. Make all decisions autonomously.`
- 后端 `trackAsync()` 在找到 trackId 后校验 plan.md 和 spec.md 内容
- 校验失败 → 回退 pending + 发送 error SSE

**方案 2（后续考虑）：UI 交互通道**
- SSE 传递 `AskUserQuestion` 事件 → 前端展示输入框 → 用户回答 → resume session
- 复杂度高，需要改造 SDK 调用方式（从 `query()` 改为手动管理 session lifecycle）
- 作为后续增强，不在本 track 范围内

### 影响范围
- `dashboard/src/routes/issues.ts` — 修改 create-track 路由
- `dashboard/src/routes/issues.test.ts` — 新增校验测试
- `dashboard/web/src/components/TrackProgressPanel.tsx` — 错误信息展示（可能无需改动，error 已支持）
