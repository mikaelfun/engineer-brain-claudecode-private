# Implementation Plan: DELTA_EMPTY nextFollowUpDate 过期机制

**Track ID:** delta-empty-expiry_20260420
**Spec:** [spec.md](./spec.md)
**Created:** 2026-04-20
**Status:** [ ] Not Started

## Overview

三处改动：(1) LLM prompt 增加 nextFollowUpDate 输出；(2) write-execution-plan.py 透传到 meta；(3) DELTA_EMPTY gate 增加日期过期检查。

## Phase 1: 写入端 — LLM prompt + write-execution-plan.py

### Tasks

- [ ] Task 1.1: 修改 assess/SKILL.md 的 LLM prompt JSON schema，增加 `nextFollowUpDate` 字段定义和规则说明
- [ ] Task 1.2: 修改 write-execution-plan.py，将 decision JSON 中的 `nextFollowUpDate` 透传写入 casework-meta.json
- [ ] Task 1.3: 更新 playbooks/schemas/case-directory.md，在 casework-meta 字段列表增加 `nextFollowUpDate` 说明

### Verification

- [ ] 运行 test_write_execution_plan.py 确认不 break
- [ ] 手动构造含 nextFollowUpDate 的 decision JSON，验证 meta 写入

## Phase 2: 读取端 — DELTA_EMPTY gate 过期检测

### Tasks

- [ ] Task 2.1: 修改 assess/SKILL.md 的 DELTA_EMPTY 快速路径 bash 代码块，在 deltaStatus==DELTA_EMPTY 判断后增加 nextFollowUpDate 过期检查
- [ ] Task 2.2: 过期时输出 `DELTA_EMPTY_EXPIRED` 标记，跳出快速路径继续走 LLM assess

### Verification

- [ ] 构造 meta 含过期 nextFollowUpDate 的 fixture，验证不走快速路径
- [ ] 构造 meta 含未来 nextFollowUpDate 的 fixture，验证仍走快速路径

## Phase 3: 测试 + 文档

### Tasks

- [ ] Task 3.1: 在 assess/tests/ 增加 nextFollowUpDate 相关测试用例（test_write_execution_plan.py 新增 test_next_follow_up_date_written_to_meta）
- [ ] Task 3.2: 运行全部已有测试确认无回归

### Verification

- [ ] 所有测试通过

## Verification Plan

| # | Acceptance Criterion | Test Type | Test Steps |
|---|---------------------|-----------|------------|
| 1 | LLM 输出新增 nextFollowUpDate | Skip | LLM prompt 变更，无法自动化测试 LLM 输出 |
| 2 | DELTA_EMPTY 到期跳出快速路径 | E2E | 构造 meta 含过期日期 + data-refresh DELTA_EMPTY fixture → 模拟 assess gate → 验证不输出 ASSESS_OK\|delta=empty |
| 3 | write-execution-plan.py 透传到 meta | E2E | 构造含 nextFollowUpDate 的 decision.json → 运行 write-execution-plan.py → 读取 meta.json 验证字段存在 |
| 4 | 已有测试不 break | E2E | 运行 test_write_execution_plan.py + test_gate_subagents.sh → 全部通过 |
| 5 | 新增测试用例覆盖 | E2E | 运行新增的 test case → 通过 |

**Test Type Legend:**
- **E2E** — Backup data → run actual workflow/script → verify file outputs + API + UI → restore
- **Interaction** — Playwright clicks, form fills, state assertions
- **Visual** — Navigate + screenshot + visual inspection
- **API** — curl/fetch endpoint + assert response
- **Skip** — D365 write/execute operations only (must justify)

## Post-Implementation Checklist

- [ ] 已有测试通过
- [ ] 新增测试通过
- [ ] 关联 Issue ISS-235 状态更新为 `implemented`
- [ ] Track metadata.json 已更新
- [ ] tracks.md 状态标记已更新
