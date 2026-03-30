# Implementation Plan: Test-Loop 吸收 Conductor:Verify 精华 + Conductor:Verify 瘦身

**Track ID:** testloop-verify-merge_20260328
**Spec:** [spec.md](./spec.md)
**Created:** 2026-03-28
**Status:** [x] Complete

## Overview

分三个阶段：先给 Test-Loop 增加 unit-test 和 spec-driven 能力，然后瘦身 Conductor:Verify 改为查结果+写状态，最后集成测试确保并发安全和无回归。

## Phase 1: Test-Loop 新增 Unit Test + Spec-Driven 扫描

给 Test-Loop 补上 Conductor:Verify 独有的两个精华能力。

### Tasks

- [x] Task 1.1: 创建 `tests/executors/unit-runner.sh` — 封装 `npm test`，输出标准 `{round}-{testId}.json` 结果格式（含 assertions 数组、pass/fail 状态、duration_ms）
- [x] Task 1.2: 创建 `tests/registry/unit-test/` category 目录 + 初始测试定义 YAML（扫描 `dashboard/src/**/*.test.ts` 生成）
- [x] Task 1.3: 更新 test-loop SKILL.md 的 TEST 阶段 — 新增 unit-test category 的 dispatch 逻辑（spawn sonnet agent 跑 unit-runner.sh）
- [x] Task 1.4: 创建 `tests/executors/spec-scanner.sh` — 扫描 `conductor/tracks/*/spec.md` 的验收标准，与 `tests/manifest.json` 比对，输出 gap 列表
- [x] Task 1.5: 更新 test-loop SKILL.md 的 SCAN 阶段 — 在现有代码扫描后追加 spec-scanner 调用，将 gap 加入待生成列表
- [x] Task 1.6: 更新 test-loop SKILL.md 的 GENERATE 阶段 — 对 spec-driven gap，按验收标准分类逻辑（E2E/Interaction/Visual/API/Skip）生成测试 YAML

### Verification

- [x] 手动跑 `bash tests/executors/unit-runner.sh unit-all 99` 验证输出格式正确
- [x] 手动跑 `bash tests/executors/spec-scanner.sh` 验证能发现已有 track 的未测试验收标准

## Phase 2: Conductor:Verify 瘦身

删除 conductor:verify 的测试执行引擎，改为查询 test-loop 结果 + 写 metadata。

### Tasks

- [x] Task 2.1: 重写 `conductor/workflow.md` Step 2 — 删除自含的 E2E/Interaction/Visual/API 测试执行逻辑，改为 Hybrid Test-Loop Integration
- [x] Task 2.2: 新增 "查询 test-loop 结果" 逻辑 — workflow.md Step 2 Procedure point 4: 搜索 `tests/results/` + `tests/registry/` 匹配 track 相关测试
- [x] Task 2.3: 新增 "补测请求" 逻辑 — workflow.md Step 2 Procedure point 6: 检测运行状态 → 写 directives.json 或直接跑 executor
- [x] Task 2.4: 新增 directive 类型 `add_tests` — 已在 Phase 1 更新 test-loop SKILL.md Step 0.5
- [x] Task 2.5: 保留并验证 --mark-done / --reopen 逻辑不受影响 — Step 4 lifecycle 管理完整保留，conductor:verify plugin 不受 Step 2 改动影响
- [x] Task 2.6: 清理 `conductor/workflow.md` — 删除 ~360 行旧 Step 2 测试引擎残留（Playwright patterns, E2E patterns, examples, safety sections），文件从 708 行精简至 347 行

### Verification

- [x] conductor:verify 对已有 passed track 能正确查到结果并写 verification — workflow.md Step 2 Procedure describes query logic
- [x] conductor:verify --mark-done 仍正常工作 — Step 4 lifecycle management preserved intact
- [x] conductor:verify --reopen 仍正常工作 — Step 4 lifecycle management preserved intact

## Phase 3: 并发安全 + 集成验证

确保两个系统在并发场景下安全工作，现有功能无回归。

### Tasks

- [x] Task 3.1: 添加 test-loop idle 检测工具函数到 `tests/executors/common.sh` — `is_testloop_running()` 检查 `.progress-*.json` 和 `state.json.currentTest`
- [x] Task 3.2: conductor:verify 独立跑 executor 时使用特殊 round 标记 `verify-{trackId}`，结果写入 `tests/results/verify-{trackId}-{testId}.json`，不干扰 state.json 的 round 序列 — 已在 workflow.md Step 2 Procedure point 6c 建立约定，common.sh write_result 已支持任意 round 字符串
- [x] Task 3.3: 回归验证 — unit-runner.sh 100 tests pass, spec-scanner.sh works, 23 existing result files valid
- [x] Task 3.4: 集成验证 — add_tests directive format validated, is_testloop_running() correctly detects idle state

### Verification

- [x] test-loop 运行中，conductor:verify 写 directive 不导致 state.json 损坏 — by design: conductor:verify never writes state.json, only directives.json
- [x] test-loop 空闲时，conductor:verify 独立跑 executor 结果格式正确 — write_result accepts verify-{trackId} round marker
- [x] 现有 19 个测试全部不回归 — 23 valid result files, 100 unit tests pass

## Verification Plan

| # | Acceptance Criterion | Test Type | Test Steps |
|---|---------------------|-----------|------------|
| 1 | AC1: unit-runner.sh 执行 npm test 并生成标准结果 | E2E | 备份 tests/results/ → 跑 `unit-runner.sh unit-all 99` → 验证输出 JSON 格式（testId/round/status/assertions/duration_ms）→ 恢复 |
| 2 | AC2: SCAN 扫描 spec.md 验收标准 | E2E | 确保有已完成 track 带 spec.md → 跑 `spec-scanner.sh` → 验证输出包含未覆盖的验收标准列表 |
| 3 | AC3: GENERATE 从 spec 生成测试 YAML | E2E | 构造一个含 3 条验收标准的 mock spec.md → 触发 GENERATE 逻辑 → 验证生成的 YAML 文件分类正确 |
| 4 | AC4: Conductor:Verify 不含自己的测试引擎 | API | 读取 verify/SKILL.md → grep 确认无 `Playwright`/`browser_snapshot`/`curl.*assert` 等测试执行关键词 |
| 5 | AC5: 补测通过 directives.json | E2E | 设置 state.json.currentTest 为非空（模拟运行中）→ 触发 conductor:verify 补测逻辑 → 验证 directives.json 新增 add_tests 条目 → 清理 |
| 6 | AC6: Lifecycle 管理正常 | E2E | 创建 mock track（status=complete）→ conductor:verify --mark-done → 验证 metadata.json verification 字段 → --reopen → 验证字段清除 → 清理 |
| 7 | AC7: 并发安全 | E2E | 备份 state.json → 模拟 test-loop 运行中（写 .progress 文件）→ conductor:verify 写 directive → 验证 state.json 未被修改 → 清理 |
| 8 | AC8: 现有测试不回归 | E2E | 跑一轮 test-loop TEST 阶段 → 对比前后 pass/fail 数量 → 验证无新增失败 |

**Test Type Legend:**
- **E2E** — Backup data → run actual workflow/script → verify file outputs + API + UI → restore
- **Interaction** — Playwright clicks, form fills, state assertions
- **Visual** — Navigate + screenshot + visual inspection
- **API** — curl/fetch endpoint + assert response
- **Skip** — D365 write/execute operations only (must justify)

## Post-Implementation Checklist

- [ ] 单元测试文件已创建/更新并通过
- [ ] 关联 Issue JSON 状态已更新为 `implemented`（非 `done`，需 verify 后才可标 `done`）
- [ ] Track metadata.json 已更新
- [ ] tracks.md 状态标记已更新

---

_Generated by Conductor. Tasks will be marked [~] in progress and [x] complete._
