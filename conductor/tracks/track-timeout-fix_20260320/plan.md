# Implementation Plan: Create Track 超时修复

## Phase 1: 强化 Prompt 指示

- [x] Task 1.1: 修改 create-track 路由的 prompt，添加 "DO NOT use AskUserQuestion/EnterPlanMode" 明确指示
- [x] Task 1.2: 添加 "auto-fill all fields, make all decisions autonomously" 强化语句
- [x] Verification: 确认 prompt 文本包含禁止交互的明确指示

## Phase 2: plan.md + spec.md 非空校验

- [x] Task 2.1: 在 trackAsync() 找到 foundTrackId 后，读取 plan.md 并校验内容（>100 chars，包含 Phase/Task 关键词）
- [x] Task 2.2: 在 trackAsync() 中校验 spec.md 内容（>50 chars，包含 Summary 关键词）
- [x] Task 2.3: 校验失败时：清理空 track 目录（可选）、回退 issue 为 pending、广播 error SSE 事件并说明原因
- [x] Verification: 模拟空 plan.md 场景，确认 issue 不会被标记为 tracked

## Phase 3: 测试更新

- [x] Task 3.1: 添加 plan.md 非空校验的单元测试（空 plan、无 Phase 关键词、正常 plan 三种场景）
- [x] Task 3.2: 添加 spec.md 校验的单元测试
- [x] Task 3.3: 确认所有现有测试仍然通过
- [x] Verification: npm test 全部通过，TypeScript 编译无错误

## Verification Plan

| # | Acceptance Criterion | Test Type | Test Steps |
|---|---------------------|-----------|------------|
| 1 | Prompt 中增加明确的 "DO NOT use AskUserQuestion" 指示，强制 agent 自主决策 | Visual | Navigate to page → screenshot → verify visual matches spec |
| 2 | 后端增加 plan.md 非空校验：必须包含实质内容（>100 字符，包含 "Phase" 或 "Task" 关键词） | Visual | Navigate to page → screenshot → verify visual matches spec |
| 3 | plan.md 校验失败时标记为 failed（回退 pending），不标记为 tracked | Visual | Navigate to page → screenshot → verify visual matches spec |
| 4 | 前端 TrackProgressPanel 能正确展示 "创建失败：plan.md 为空" 的错误信息 | Visual | Navigate to page → screenshot → verify visual matches spec |
| 5 | 增加 spec.md 内容校验（非空、包含 Summary/Acceptance Criteria 等关键结构） | Visual | Navigate to page → screenshot → verify visual matches spec |
| 6 | TypeScript 前后端编译通过 | Visual | Navigate to page → screenshot → verify visual matches spec |
| 7 | 所有单元测试通过 | Visual | Navigate to page → screenshot → verify visual matches spec |

**Test Type Legend:**
- **Interaction** — Playwright clicks, form fills, state assertions
- **Visual** — Navigate + screenshot + visual inspection
- **API** — curl/fetch endpoint + assert response
- **Skip** — Backend-only or covered by unit tests
