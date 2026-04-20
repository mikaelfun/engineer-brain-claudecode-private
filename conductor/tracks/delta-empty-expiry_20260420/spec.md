# Specification: DELTA_EMPTY nextFollowUpDate 过期机制

**Track ID:** delta-empty-expiry_20260420
**Type:** Bug
**Created:** 2026-04-20
**Status:** Draft
**Issue:** ISS-235

## Summary

Assess 的 DELTA_EMPTY 快速路径只检查数据变化（新邮件/notes），不感知时间维度。当 statusReasoning 含未来日期触发条件（如"预计4/20发布"）时，DELTA_EMPTY 持续复用旧判断直到有新数据，导致到期的 follow-up 被遗漏。

## Problem Description

Case 2601290030000748 连续 5 次被错误判定 no-action/pending-customer：
- 4/18 assess 判定 statusReasoning: "版本预计**明天(4/20)**发布，等发布后再跟进 → pending-customer"
- 4/19~4/20 每次 patrol 走 DELTA_EMPTY（无新邮件/notes），直接复用旧判断
- 4/20 当天应 follow up 客户确认版本 + 推进关闭，但未触发

## Acceptance Criteria

- [ ] assess LLM 输出 JSON 新增 `nextFollowUpDate` 字段（ISO date 格式）
- [ ] DELTA_EMPTY 快速路径检查 `meta.nextFollowUpDate`，到期时跳出快速路径强制 LLM re-assess
- [ ] write-execution-plan.py 将 `nextFollowUpDate` 透传到 casework-meta.json
- [ ] 已有测试（test_write_execution_plan.py、test_gate_subagents.sh）不被破坏
- [ ] 新增 nextFollowUpDate 过期检测的测试用例

## Dependencies

- `.claude/skills/casework/assess/SKILL.md` — DELTA_EMPTY gate 逻辑 + LLM prompt
- `.claude/skills/casework/assess/scripts/write-execution-plan.py` — 写 meta
- `playbooks/schemas/case-directory.md` — schema 文档

## Out of Scope

- 修改 data-refresh 逻辑
- 修改 act/summarize 步骤
- Dashboard UI 变更
- AR case 的特殊处理（AR 规则不变）

## Technical Notes

- `nextFollowUpDate` 规则：
  - `pending-customer` + 提到未来日期事件 → 设为该日期
  - `pending-customer` 无明确日期 → `today + 3天`
  - 其他状态（`pending-engineer`/`ready-to-close`/`researching`）→ 不设
- DELTA_EMPTY gate 检查是纯日期比较，零 LLM 开销
- 兼容性：现有无 `nextFollowUpDate` 的 meta 不受影响（字段缺失 = 不检查）
