# Generation Recipes Index

> 共享架构指南：[recipe-architecture.md](../../../playbooks/guides/recipe-architecture.md) — 三层标准模式（Recipe Index / LLM 推理层 / 反思演进）

test-loop GENERATION 阶段生成新测试时，**先读此文件**，根据 gap `source` × content keywords 匹配可复用的生成 recipe。

## 匹配规则（按优先级）

| 优先级 | Source | Content Keywords | Recipe 文件 |
|-------|--------|-----------------|------------|
| 1 | `performance` | response time, latency, timing, drift, slow | [performance-test.md](./performance-test.md) |
| 2 | `design-fidelity` | spec AC, implementation gap, track verification | [design-fidelity-test.md](./design-fidelity-test.md) |
| 3 | `issue-driven` | API, endpoint, HTTP, curl, `/api/`, backend, response | [issue-driven-api.md](./issue-driven-api.md) |
| 4 | `issue-driven` | 页面, 组件, 按钮, click, form, dialog, layout, Playwright | [issue-driven-ui.md](./issue-driven-ui.md) |
| 5 | `spec-driven` | _(暂无专用 recipe — fallback 到 GENERATE.md 硬编码分类)_ | LLM 从零推理 |
| 6 | `ux-review` | _(暂无专用 recipe — fallback 到 GENERATE.md 硬编码分类)_ | LLM 从零推理 |
| 7 | `architecture` | _(暂无专用 recipe — fallback 到 GENERATE.md 硬编码分类)_ | LLM 从零推理 |
| 8 | _(any)_ | 以上都不匹配 | LLM 从零推理 |

## 匹配逻辑

1. **优先按 `source` 精确匹配**：`performance` → 直接命中 performance-test recipe
2. **同 source 多 recipe 时按 keywords 区分**：`issue-driven` 根据 AC 内容区分 API vs UI
3. **无 recipe 的 source 类型**：`spec-driven`、`ux-review`、`architecture` 暂无专用 recipe，走 GENERATE.md 硬编码分类（fallback）
4. **最终兜底**：所有未匹配 gap 走 LLM 从零推理

## 匹配指引

- GENERATION 阶段的核心目标是**为 gap 生成测试定义**（写入 registry）
- recipe 指导"什么类型的 gap 用什么测试生成模板"，不替代具体测试逻辑
- recipe 是 **advisory**（经验参考），LLM 应根据具体场景调整模板细节
- 即使走"从零推理"路径，也建议参考 recipe 中的**常见坑**部分避坑
- 在生成的 YAML 中记录 `recipe_used: {filename}` 或 `recipe_used: none`

## 何时创建新 Recipe

GENERATION 执行完毕后，LLM 自问：

| 触发条件 | 动作 |
|---------|------|
| 生成的测试定义被 FIX 阶段多次修改才通过 | 提取成功模式为 recipe |
| 某类 gap 的测试生成方式形成固定模式（>= 3 次相同结构） | 提取为 recipe |
| 生成的测试 > 20 行 YAML 且从零推理 | 考虑提取模板到 recipe |
| 新 scanner 类型首次出现，从零推理成功 | 标记为 recipe 候选 |
| 100% 首次运行 fail 且使用了 recipe | 检查 recipe 模板是否有问题 |
| 生成很顺利（直接 PASS） | 不提取 |

## 演进日志

| 日期 | Recipe | 变更 | 原因 |
|------|--------|------|------|
| 2026-03-30 | 全部 | 初始创建（占位规则） | ISS-164 recipe-seed |
| 2026-03-30 | issue-driven-api | 创建完整 recipe | ISS-166 gen-recipes |
| 2026-03-30 | issue-driven-ui | 创建完整 recipe | ISS-166 gen-recipes |
| 2026-03-30 | performance-test | 创建完整 recipe | ISS-166 gen-recipes |
| 2026-03-30 | design-fidelity-test | 创建完整 recipe | ISS-166 gen-recipes |

> 版本：v2.0 | 最后更新：2026-03-30
