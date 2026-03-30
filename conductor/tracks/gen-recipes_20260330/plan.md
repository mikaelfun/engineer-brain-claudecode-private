# Implementation Plan: gen-recipes_20260330

## Phase 1: GENERATE.md recipe 查询集成 + 初始 recipes

### Task 1.1: Add recipe lookup to GENERATE.md
- 在 gap 分类逻辑前插入 recipe 查询
- 读 tests/recipes/generation/_index.md → 按 source × gap type 匹配
- 有匹配 → 按 recipe 模板生成
- 无匹配 → fallback 到现有硬编码分类

### Task 1.2: Create 4 generation recipes
- issue-driven-api.md: issue AC 含 API/endpoint → backend-api 模板
- issue-driven-ui.md: issue AC 含 UI/页面/组件 → ui-interaction 模板
- performance-test.md: performance scanner gap → timing_under 模板
- design-fidelity-test.md: design-fidelity scanner gap → spec AC 验证模板

## Phase 2: 演进触发

### Task 2.1: Add generation recipe evolution to state-update.md
- 如果 GENERATE 产生的测试在 TEST 首次运行 100% fail → 检查是否模板问题
- 新 scanner 类型首次出现且从零推理 → 标记为 recipe 候选

### Task 2.2: Update generation/_index.md with full rules
- 补充从 GENERATE.md 提取的所有分类规则到 _index.md
