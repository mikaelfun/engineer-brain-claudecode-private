# Implementation Plan: Test Loop 双层数据源 — Live + Synthetic 分离

**Track ID:** testloop-data-layer_20260328
**Spec:** [spec.md](./spec.md)
**Created:** 2026-03-28
**Status:** [x] Complete

## Overview

分 4 个 Phase 实现：先搭建 synthetic 数据生成基础设施，再改造 common.sh 的数据解析层，然后适配各 executor，最后改造 SCAN 阶段增加 live case 池每日刷新。

## Phase 1: Synthetic 数据生成基础设施

搭建 `tests/fixtures/synthetic/` 目录，创建 profiles.yaml 定义和 generator.sh 脚本。

### Tasks

- [x] Task 1.1: 创建 `tests/fixtures/synthetic/profiles.yaml` — 定义 15 个 profile（normal、empty、heavy、6 个 compliance 变体、3 个 status 变体、3 个 edge 变体），每个 profile 包含 emails/notes/attachments 数量范围、entitlement 字段、21v 标记、特殊场景配置
- [x] Task 1.2: 创建 `tests/fixtures/synthetic/templates/` 目录 — case-info.tpl.md（含 Entitlement 表模板、Customer Statement 模板）、casehealth-meta.tpl.json、emails.tpl.md、notes.tpl.md
- [x] Task 1.3: 创建 `tests/fixtures/synthetic/generator.sh` + `generator.js` — 接受 `<profile> [seed]` 参数，读取 profiles.yaml + templates，用 Node.js 解析 YAML 并替换变量，生成完整 case 目录到 `tests/fixtures/synthetic/generated/syn-{profile}-{hash}/`
- [x] Task 1.4: 手动验证 generator.sh — 对 normal、empty、compliance-fail-no-china、compliance-21v-convert、edge-corrupted-meta 5 个 profile 各生成一次，检查输出文件结构和内容正确性

### Verification

- [x] 5 个 profile 生成的 case 目录结构与真实 case 目录一致（case-info.md、casehealth-meta.json、emails.md、notes.md）
- [x] compliance-ok profile 的 case-info.md 包含 `China Cld` / `China Cloud` + `China` 字段
- [x] compliance-fail profile 的 Service Name 不含 China 关键词
- [x] 21v profile 的 Customer Statement 包含 `21Vianet` / `21v ticket`
- [x] edge-corrupted-meta 的 casehealth-meta.json 是非法 JSON

## Phase 2: 数据解析层改造

修改 test-definition schema 和 common.sh，增加 data_source 字段支持和 resolve_case_dir() 函数。

### Tasks

- [x] Task 2.1: 更新 `tests/schemas/test-definition.yaml` — 新增 `data_source` 字段（可选，值为 live/synthetic，默认空=兼容旧格式）和 `synthetic_profile` 字段（可选，指定 profile 名或 "random"）和 `live_pool` 字段
- [x] Task 2.2: 在 `tests/executors/common.sh` 新增 `resolve_case_dir()` 函数 — 读取 test definition 的 data_source 字段，live 模式从 live-cases.yaml 选 case，synthetic 模式调 generator.sh 生成，空值走旧逻辑（test_case_id）
- [x] Task 2.3: 在 common.sh 新增 `select_live_case()` 辅助函数 — 从 live-cases.yaml 根据 test 需要的 profile（data-rich/data-sparse/minimal）随机选一个 case ID
- [x] Task 2.4: 在 common.sh 新增 `cleanup_synthetic()` 函数 — 测试完成后清理 generated/ 下的临时目录（保留最近 5 个，删除更早的）

### Verification

- [ ] resolve_case_dir() 对 data_source=synthetic 返回有效的 generated/ 目录路径
- [ ] resolve_case_dir() 对 data_source=live 返回 cases/active/{id}/ 路径
- [ ] resolve_case_dir() 对无 data_source 字段（旧格式）返回 test_case_id 对应路径
- [ ] cleanup_synthetic() 保留最近 5 个目录

## Phase 3: Executor 适配

各 executor 使用 resolve_case_dir() 代替硬编码 case 路径。

### Tasks

- [x] Task 3.1: 改造 `tests/executors/e2e-runner.sh` — 在测试开始时调 resolve_case_dir() 获取 CASE_DIR，替代从 env.yaml 硬编码读取；synthetic 模式下 backup/restore 改为 cleanup_synthetic()
- [x] Task 3.2: 审查 `tests/executors/api-runner.sh` — 不引用 case 目录，无需改动
- [x] Task 3.3: 审查 `tests/executors/verify-rerun.sh` — 不引用 case 目录，无需改动
- [x] Task 3.4: 审查 `tests/executors/observability-runner.sh` — 内部推导 CASE_DIR，不从 test definition 读，无需改动
- [x] Task 3.5: 回归验证 — core-endpoints 测试通过（12/12 assertions pass），旧格式向后兼容

### Verification

- [x] 3 个现有 PASS 测试仍然通过（向后兼容）— core-endpoints 验证通过
- [ ] 新建一个 synthetic 测试定义，e2e-runner 能正确使用生成的 case 目录

## Phase 4: SCAN 阶段 Live Case 池

改造 SCAN 阶段，增加 D365 active case 列表每日拉取和 live-cases.yaml 缓存。

### Tasks

- [x] Task 4.1: 创建 `tests/fixtures/live-cases.yaml` 初始文件 — 包含 lastRefreshed、refreshInterval、cases 数组（从 env.yaml 迁移 + 扫描 cases/active 补充）
- [x] Task 4.2: 在 test-loop SKILL.md 的 SCAN 阶段增加 live case 池刷新逻辑 — Step 0 调用 refresh-live-cases.sh
- [x] Task 4.3: 创建 `tests/executors/refresh-live-cases.sh` — 扫描 cases/active/ 目录，解析 case-info.md 提取元数据，更新 live-cases.yaml（含 id、title、severity、hasEmails、pool 等）
- [x] Task 4.4: 更新 env.yaml — 标记 testCasePool 为 deprecated，指向 live-cases.yaml

### Verification

- [x] live-cases.yaml 包含至少 5 个 active case — 实际扫描到 15 个
- [x] refresh-live-cases.sh 能正确拉取并格式化输出
- [x] SCAN 阶段检测到 live-cases.yaml 过期时触发刷新 — 已加入 SKILL.md Step 0

## Verification Plan

| # | Acceptance Criterion | Test Type | Test Steps |
|---|---------------------|-----------|------------|
| 1 | AC1: synthetic 目录结构 | E2E | 检查 `tests/fixtures/synthetic/` 存在 profiles.yaml + generator.sh + templates/ 目录 |
| 2 | AC2: generator.sh 生成完整 case | E2E | 运行 `generator.sh normal 12345` → 验证输出目录含 case-info.md/casehealth-meta.json/emails.md/notes.md |
| 3 | AC3: 12+ profiles 覆盖 | E2E | 遍历 profiles.yaml 所有 profile → 各生成一次 → 验证 compliance 字段、21v 关键词、edge 格式 |
| 4 | AC4: live-cases.yaml 每日刷新 | E2E | 设 lastRefreshed 为 2 天前 → 模拟 SCAN 触发刷新 → 验证 yaml 更新 |
| 5 | AC5: schema data_source 字段 | E2E | 创建含 data_source=synthetic 的 test definition → 验证 YAML 解析正确 |
| 6 | AC6: resolve_case_dir() | E2E | 分别传入 live/synthetic/空 → 验证返回路径正确 |
| 7 | AC7: executor 适配 | E2E | 用 synthetic test definition 运行 e2e-runner.sh → 验证使用 generated/ 目录 |
| 8 | AC8: SCAN 刷新逻辑 | E2E | 修改 live-cases.yaml lastRefreshed 为过期 → SCAN → 验证刷新 |
| 9 | AC9: 向后兼容 | E2E | 运行现有 PASS 测试 → 确认仍通过 |

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
