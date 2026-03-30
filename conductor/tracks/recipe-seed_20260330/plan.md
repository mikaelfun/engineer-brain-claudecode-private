# Implementation Plan: recipe-seed_20260330

## Phase 1: 目录结构 + Fix Recipe 种子

### Task 1.1: Create directory structure + README
- 创建 tests/recipes/{fix,scan,generation}/ 目录
- 写 tests/recipes/README.md 引用 recipe-architecture.md

### Task 1.2: Create fix/_index.md with initial rules
- 从 learnings.yaml 分析 34 条经验，归类 failure signature patterns
- 写 _index.md 匹配规则表（5-8 条 + 从零推理兜底）
- 写演进日志初始条目

### Task 1.3: Create 3 fix recipe seed files
- env-service-down.md: 从 dashboard-port-check, node-kill-safety 等 learnings 提取
- auth-token-expired.md: 从 jwt-auth-token learning 提取
- playwright-environment.md: 从 playwright-msedge-only, profile-path, snapshot-ban 等提取
- 每个文件遵循标准格式

## Phase 2: Scan + Generation Recipe 种子

### Task 2.1: Create scan/_index.md
- 初始 1-2 条规则（coverage plateau, regression focused）
- 大部分留空待 ISS-167 填充

### Task 2.2: Create generation/_index.md
- 初始 1-2 条规则（issue-driven-api, issue-driven-ui）
- 大部分留空待 ISS-166 填充
