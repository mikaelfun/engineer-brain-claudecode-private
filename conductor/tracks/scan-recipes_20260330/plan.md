# Implementation Plan: scan-recipes_20260330

## Phase 1: Recipe 覆写层 + runner 集成

### Task 1.1: Create scan recipes
- [x] plateau-breaking.md: coverage 连续 3 轮不变 → 强制 design-fidelity + 扩大 SCAN 范围
- [x] regression-focused-scan.md: 某 category regression > 40% → 强制该 category scanner

### Task 1.2: Update runner Step 2 to query scan recipes
- [x] 修改 test-supervisor-runner.md Step 2
- [x] 先读 tests/recipes/scan/_index.md → 有覆写则用 recipe 建议
- [x] 无覆写则按 scan-strategies.yaml 默认频率
- [x] recipe 建议 merge 到 activeScanners 列表

## Phase 2: 演进机制

### Task 2.1: Add recipe evolution to runner Step 4
- [x] Meta-analysis 中记录本轮 scanner 选择和效果
- [x] override 后效果好 → 记录到 scan recipe 演进日志

### Task 2.2: Update scan/_index.md with override patterns
- [x] 从 runner 历史 override 中提取规则
