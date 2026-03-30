# Implementation Plan: fix-recipes_20260330

## Phase 1: FIX.md recipe 查询集成

### Task 1.1: Add recipe lookup step to FIX.md
- 在 "Test Fix Path" 的 fix-analyzer 之后插入 recipe 查询
- 读 tests/recipes/fix/_index.md → 按 failure signature 匹配
- 有匹配 → 读 recipe 文件 → 按步骤修复
- 无匹配 → fallback 到 opus（保持现有逻辑不变）

### Task 1.2: Update fix-recorder.sh to log recipe usage
- 新增可选参数 `recipe_used`
- 记录到 fix.md 文件和 phaseHistory

## Phase 2: 演进触发集成

### Task 2.1: Add recipe evolution check to state-update.md
- Phase Retrospective 增加 recipe 演进自检
- fix 成功 + 无 recipe + 步骤 >3 → 输出建议（不自动创建，留给下轮 FIX 的 framework fix 路径）

### Task 2.2: Update common.md with recipe reading convention
- 添加 "recipe 查询是 advisory，不是 mandatory" 的通用原则
- 确保 recipe 文件不存在时优雅降级
