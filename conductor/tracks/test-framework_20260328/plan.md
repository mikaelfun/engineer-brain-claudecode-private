# Implementation Plan: 自动化测试框架重构

**Track ID:** test-framework_20260328
**Spec:** [spec.md](./spec.md)
**Created:** 2026-03-28
**Status:** [~] In Progress

## Overview

分 6 个 Phase 实现，每个 Phase 可独立验证。核心思路：先建骨架（目录+配置），再实现各阶段逻辑（SCAN/GENERATE/TEST/FIX/VERIFY），最后集成 loop skill 和迁移旧数据。

---

## Phase 1: 基础设施 — 目录结构 + 配置文件

创建 tests/ 目录骨架和所有配置文件。这是其他所有 Phase 的基础。

### Tasks

- [x] Task 1.1: 创建 `tests/` 目录结构 — `tests/{registry/, results/, registry/backend-api/, registry/ui-interaction/, registry/ui-visual/, registry/workflow-e2e/, registry/frontend/}`
- [x] Task 1.2: 从 `playbooks/rules/test-safety-redlines.md` 迁移生成 `tests/safety.yaml` — 结构化的 SAFE/BLOCKED 操作清单，分 backend/ui/scripts/api 四个维度，每个操作有 action + level + reason 字段
- [x] Task 1.3: 创建 `tests/env.yaml` — Dashboard 端口(3010/5173)、auth 信息、Playwright 配置(msedge/base_url)、case 测试池定义（从 evolution-loop 迁移 7 个 case profile）
- [x] Task 1.4: 创建 `tests/learnings.yaml` — 初始条目从 `.learnings/ERRORS.md` 迁移（login-auth、dashboard-port、path-format 等已知问题的固化方案）
- [x] Task 1.5: 创建 `tests/state.json` — 初始状态：phase=SCAN, round=0, maxRounds=50, queues 全空, stats 归零
- [x] Task 1.6: 创建 `tests/manifest.json` — 初始为空的覆盖映射结构：`{ features: [], coverage: {}, lastScan: null }`
- [x] Task 1.7: 创建 `tests/schemas/test-definition.yaml` — 测试定义的 schema 规范文档（字段：id, name, category, source, safety_level, steps[], assertions[], expected_outcomes, tags）

### Verification

- [x] 所有文件可被 YAML/JSON 正确解析
- [x] safety.yaml 覆盖 test-safety-redlines.md 中所有条目
- [x] env.yaml 中 case 池与 evolution-loop 中 7 个 case 一致

---

## Phase 2: SCAN + GENERATE 引擎 — 需求扫描 + 测试生成

实现状态机的前两个阶段：扫描项目文档发现可测试功能，自动生成测试定义文件。

### Tasks

- [x] Task 2.1: 创建 `.claude/skills/test-loop/SKILL.md` — Loop Skill 主文件，定义每轮执行流程：读 state.json → 判断 phase → 读 safety.yaml + env.yaml + learnings.yaml → spawn 对应 agent → 更新 state.json
- [x] Task 2.2: 实现 SCAN 阶段逻辑（写入 SKILL.md 的 SCAN 部分）— 扫描 6 个需求来源：`dashboard/src/routes/*.ts`（API 端点提取）、`dashboard/src/components/`（UI 组件）、`.claude/skills/*/SKILL.md`（工作流）、`conductor/tracks/*/spec.md`（功能需求）、`issues/ISS-*.json`（bug/feature）、`playbooks/schemas/*.md`（数据格式）→ 对比 manifest.json → 输出 gap 列表
- [x] Task 2.3: 实现 GENERATE 阶段逻辑 — 从 gap 列表生成测试定义 YAML 文件到 `tests/registry/{category}/{id}.yaml`，每个测试定义包含完整的 steps、assertions、safety_check 引用
- [x] Task 2.4: 迁移现有 evolution-loop 7 个场景（A-G）为 test registry 中的测试定义 — A→`workflow-e2e/full-scenario.yaml`, B→`workflow-e2e/incremental.yaml`, C→`workflow-e2e/fast-path.yaml`, D→`workflow-e2e/state-routing.yaml`, E→`workflow-e2e/error-recovery.yaml`, F→`workflow-e2e/single-step.yaml`, G→拆分为 `backend-api/` + `ui-interaction/` 多个测试
- [x] Task 2.5: 从 evolution-log.md 的 70+ findings 提取回归测试定义 — 每个已修复的 bug 生成一个回归测试（fetch-emails-falsepositive、judge-cache-fields、daysSinceLastContact、entitlement-display、waitAgents-drift）

### Verification

- [x] SCAN 能正确识别 dashboard/src/routes/ 中的所有 API 端点
- [x] GENERATE 生成的 YAML 文件符合 schema 规范
- [x] 迁移的 7 个场景覆盖 evolution-loop.md 中的所有测试步骤
- [x] 回归测试定义覆盖 5 个已修复 bug

---

## Phase 3: TEST 执行引擎 — 后端 + 前端 + UI + E2E

实现 TEST 阶段的 4 种测试执行器，每种对应一类测试定义。

### Tasks

- [ ] Task 3.1: 实现后端 API 测试执行器 — 读取 `tests/registry/backend-api/*.yaml`，用 curl 执行（自动生成 JWT），验证 status code + response shape + error handling，结果写入 `tests/results/{round}-{testId}.json`
- [ ] Task 3.2: 实现工作流 E2E 测试执行器 — 读取 `tests/registry/workflow-e2e/*.yaml`，执行 backup → prepare data → run casework/skill → verify outputs → restore 流程，验证 timing.json + case-summary.md + todo/*.md + logs
- [ ] Task 3.3: 实现 UI 交互测试执行器 — 读取 `tests/registry/ui-interaction/*.yaml`，用 Playwright MCP 执行：先检查 env.yaml 端口 → 读 safety.yaml 确认操作安全 → navigate → snapshot → click/fill/toggle → snapshot → 验证状态变化，截图保存为 JPEG 到 `tests/results/screenshots/`
- [ ] Task 3.4: 实现 UI 视觉测试执行器 — 读取 `tests/registry/ui-visual/*.yaml`，Playwright 执行：navigate → resize → screenshot → 验证布局/主题/响应式，对比基线截图
- [ ] Task 3.5: 实现安全检查前置拦截 — 每个执行器在执行前读取 safety.yaml，查表确认操作安全级别：SAFE→执行，BLOCKED→跳过并记录 reason，UNKNOWN→标记为 warning 等待人工确认
- [ ] Task 3.6: 实现 patrol 测试支持 — 在 workflow-e2e 执行器中支持 patrol 场景（`POST /api/patrol`），包含多 case 批量验证逻辑

### Verification

- [ ] API 测试执行器能跑通 health + cases + meta 等基本端点
- [ ] E2E 测试执行器能完成 full-scenario 的 backup/restore 循环
- [ ] UI 测试执行器能在 msedge 中完成导航+点击+验证
- [ ] safety 拦截器正确阻止 POST /api/todo/:id/execute

---

## Phase 4: FIX + VERIFY 引擎 — 自动修复 + 验证

实现发现问题后的自动修复和验证重跑逻辑。

### Tasks

- [ ] Task 4.1: 实现 FIX 阶段逻辑 — 从 state.json 的 fixQueue 取出失败测试，分析 `tests/results/{round}-{testId}.json` 中的 actual vs expected，spawn agent（model=opus）进行根因分析 + 代码修复，修复后记录 diff 到 `tests/results/fixes/{testId}-fix.md`
- [ ] Task 4.2: 实现 VERIFY 阶段逻辑 — 从 verifyQueue 取出已修复测试，重新执行同一测试定义，PASS→标记修复成功（从 fixQueue/verifyQueue 移除），FAIL→回到 fixQueue 附加上次修复的 context
- [ ] Task 4.3: 实现经验固化写入 — FIX 阶段解决环境/流程问题时自动追加 learnings.yaml（区分 code_bug vs env_issue，env_issue 写 learnings，code_bug 写 results/fixes/）
- [ ] Task 4.4: 实现回归保护 — FIX 修改代码后，自动将相关测试标记为 "需回归"，下轮 TEST 阶段优先执行回归测试

### Verification

- [ ] FIX 能正确分析一个已知的简单 bug 并生成修复代码
- [ ] VERIFY 能重跑测试并确认修复有效
- [ ] 环境问题修复后 learnings.yaml 有新增条目
- [ ] 修复后相关测试被标记为需回归

---

## Phase 5: 状态机编排 + /loop 集成

把 Phase 2-4 的各阶段串联为完整状态机，集成 /loop 实现持续运行。

### Tasks

- [ ] Task 5.1: 完善 `.claude/skills/test-loop/SKILL.md` 的状态转换逻辑 — SCAN→GENERATE（有 gap 时）或 TEST（无 gap 时），TEST→FIX（有失败时）或 SCAN（全通过时），FIX→VERIFY→TEST（回归），完整状态机图 + 转换条件
- [ ] Task 5.2: 实现 round 计数和 maxRounds 停止 — state.json 的 round 每完成一个 SCAN→...→回到 SCAN 加 1，达到 maxRounds 时标记 phase=COMPLETE，loop 读到 COMPLETE 直接返回
- [ ] Task 5.3: 实现 loop 启动提示词 — 创建 `tests/loop-prompt.md`，包含启动 `/loop 8m /test-loop` 的完整提示词，以及手动单次运行 `/test-loop` 的方式
- [ ] Task 5.4: 实现统计报告 — 每轮结束更新 `tests/stats.md`（当前 round、总测试数、通过/失败/修复/跳过数、覆盖率、最近修复列表），以及 `tests/results/round-{N}-summary.json`
- [ ] Task 5.5: 实现中断恢复 — 如果 state.json 的 phase 在 TEST/FIX/VERIFY 中途 session 被中断，下轮 loop 能从 state.json 恢复执行（不重头来）

### Verification

- [ ] 手动运行 `/test-loop` 一次，能完成完整 SCAN→GENERATE→TEST→(FIX→VERIFY)→回到 SCAN
- [ ] `/loop 8m /test-loop` 能持续运行多轮
- [ ] round 达到 maxRounds 时自动停止
- [ ] 中断后重启能从上次状态恢复

---

## Phase 6: 迁移 + 自我提升 + 收尾

迁移现有数据，完善自我提升机制，清理和文档。

### Tasks

- [ ] Task 6.1: 迁移 evolution-log.md 中的 70+ findings 到 `tests/results/legacy-findings.json` — 结构化的 findings 列表，每个包含 id、scenario、description、severity、fixed、regression_test_id
- [ ] Task 6.2: 更新 `playbooks/guides/casework-evolution-loop.md` — 添加 "已迁移到新框架" 标记，指向 tests/ 目录，保留作为历史参考
- [ ] Task 6.3: 实现自我提升：需求变更检测 — SCAN 阶段对比上次 scan 的 manifest.json，高亮新增/变更的 features，自动进入 GENERATE 为它们生成测试
- [ ] Task 6.4: 实现自我提升：覆盖率跟踪 — `tests/manifest.json` 中每个 feature 标记 tested/untested/partial，SCAN 阶段计算覆盖率，低覆盖区域优先生成测试
- [ ] Task 6.5: 更新 CLAUDE.md — 添加 tests/ 目录到项目结构表，添加 /test-loop 到 skills 列表，添加自动化测试使用说明
- [ ] Task 6.6: 创建 `tests/README.md` — 框架使用指南（如何启动、如何添加测试、如何查看结果、如何设置 maxRounds）

### Verification

- [ ] legacy findings 全部可被 JSON 解析
- [ ] SCAN 能检测到新增 issue 并标记为未覆盖
- [ ] 覆盖率计算与实际 registry 文件一致
- [ ] CLAUDE.md 的目录结构表包含 tests/

---

## Verification Plan

| # | Acceptance Criterion | Test Type | Test Steps |
|---|---------------------|-----------|------------|
| 1 | AC1: tests/ 目录结构完整 | E2E | 列出 tests/ 所有文件 → 验证 7 个核心文件存在且可解析（state.json, safety.yaml, env.yaml, learnings.yaml, manifest.json, schemas/, registry/） |
| 2 | AC2: Safety Manifest 可编程查询 | E2E | 构造一个包含 SAFE 和 BLOCKED 操作的测试 → 执行 → 验证 SAFE 被执行、BLOCKED 被跳过并记录 reason |
| 3 | AC3: 状态机 SCAN→GENERATE→TEST→FIX→VERIFY 循环 | E2E | 设置 state.json phase=SCAN → 运行 /test-loop → 验证 phase 转换到 GENERATE → 再运行 → 验证转换到 TEST → 注入一个必失败测试 → 验证转换到 FIX → 运行 → 验证转换到 VERIFY |
| 4 | AC4: 主-子 Agent 模式 | E2E | 运行 /test-loop 3 轮 → 检查主 session 的 context 未显著增长（通过检查 state.json 的 round 递增而非 session 内变量累积） |
| 5 | AC5: 后端 API 测试覆盖 | E2E | 运行 SCAN+GENERATE → 检查 tests/registry/backend-api/ 包含主要端点测试定义 → 运行 TEST → 检查 results/ 中有执行结果 |
| 6 | AC6: UI 交互测试 Playwright | Interaction | 启动 dashboard → 运行 UI 测试执行器 → Playwright 导航到 case 页面 → 点击 tab 切换 → 验证 snapshot 内容变化 → 点击 sidebar 导航 → 验证页面切换 |
| 7 | AC7: 工作流 E2E 测试迁移 | E2E | 运行 tests/registry/workflow-e2e/full-scenario.yaml → 验证 backup → casework 执行 → outputs 完整 → restore 成功 |
| 8 | AC8: 需求驱动发现 | E2E | 创建一个临时 issue（ISS-test） → 运行 SCAN → 验证 manifest.json 包含新 feature → 运行 GENERATE → 验证生成了对应测试定义 → 删除临时 issue |
| 9 | AC9: FIX 真正修复代码 | E2E | 注入一个已知简单 bug（如 typo in output format）→ 运行 TEST → 确认失败 → 运行 FIX → 验证代码被修改 → 运行 VERIFY → 确认通过 |
| 10 | AC10: 经验固化 | E2E | 模拟一个环境问题（如端口不对）→ FIX 解决 → 检查 learnings.yaml 有新条目 → 下轮 TEST 读取 learnings 跳过该问题 |
| 11 | AC11: /loop 集成 | E2E | 设置 maxRounds=3 → `/loop 5m /test-loop` → 等待完成 → 验证 state.json round=3 且 phase=COMPLETE |
| 12 | AC12: patrol 可触发 | E2E | 运行 patrol 测试定义 → 验证 POST /api/patrol 返回 202 → 验证 patrol status API 可查询 |

**Test Type Legend:**
- **E2E** — Backup data → run actual workflow/script → verify file outputs + API + UI → restore
- **Interaction** — Playwright clicks, form fills, state assertions
- **Visual** — Navigate + screenshot + visual inspection
- **API** — curl/fetch endpoint + assert response
- **Skip** — D365 write/execute operations only (must justify)

## Post-Implementation Checklist

- [ ] 单元测试文件已创建/更新并通过
- [ ] 关联 Issue ISS-114 状态已更新为 `implemented`（非 `done`，需 verify 后才可标 `done`）
- [ ] Track metadata.json 已更新
- [ ] tracks.md 状态标记已更新

---

_Generated by Conductor from ISS-114. Tasks will be marked [~] in progress and [x] complete._
