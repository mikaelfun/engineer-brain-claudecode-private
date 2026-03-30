# Test Loop — Recipe Library

> 架构标准：[recipe-architecture.md](../../playbooks/guides/recipe-architecture.md) — 三层模式（Recipe Index / LLM 推理层 / 反思演进）

本目录为 test-loop 专属的 recipe 库，由 `tests/learnings.yaml` 中的 34 条踩坑经验提取为结构化 recipes。

## 目录结构

```
tests/recipes/
├── README.md           ← 本文件
├── fix/                ← FIX 阶段 recipes — 环境修复、工具配置
│   ├── _index.md       ← 匹配规则表（failure signature → recipe）
│   ├── env-service-down.md
│   ├── auth-token-expired.md
│   └── playwright-environment.md
├── scan/               ← SCAN 阶段 recipes — 覆盖分析、gap 发现
│   └── _index.md       ← 匹配规则表（scan signal → recipe）
└── generation/         ← GENERATION 阶段 recipes — 测试生成策略
    └── _index.md       ← 匹配规则表（generation trigger → recipe）
```

## 工作流程

1. test-loop 各阶段（FIX / SCAN / GENERATION）执行前，先读对应 `_index.md`
2. 按匹配规则表逐条检查，命中则读对应 recipe 文件执行
3. 无匹配时 LLM 从零推理
4. 执行后按反思触发条件决定是否更新/新建 recipe

## 数据来源

- 初始 recipes 从 `tests/learnings.yaml` 提取（ISS-164）
- 后续通过 test-loop 反思自动演进（ISS-165/166/167）

## 与 learnings.yaml 的关系

- `learnings.yaml` — 扁平化经验列表，每轮 TEST 开始前必读（快速扫描）
- `recipes/` — 结构化执行方案，阶段内按需精准匹配（深度指导）
- 两者互补：learnings 是"知道什么坑"，recipes 是"怎么修这个坑"
