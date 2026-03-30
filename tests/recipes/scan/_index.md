# Scan Recipes Index

> 共享架构指南：[recipe-architecture.md](../../../playbooks/guides/recipe-architecture.md) — 三层标准模式（Recipe Index / LLM 推理层 / 反思演进）

**消费者**：runner Step 2（Strategic Review）在选择 scan strategy 时**先读此文件**，根据上下文信号匹配覆写 recipe。匹配到的 recipe 建议 merge 到 scan-strategies.yaml 的频率调度之上。

## 匹配规则（按优先级）

| 优先级 | 匹配条件 | Recipe 文件 |
|-------|---------|------------|
| 1 | coverageTrend=flat 连续 3+ 轮 AND greenRate > 90% | [plateau-breaking.md](./plateau-breaking.md) |
| 2 | 某 category regressionRate > 40% OR discoveries.json 中该 category regression count > 3 | [regression-focused-scan.md](./regression-focused-scan.md) |
| 3 | 以上都不匹配 | 按 scan-strategies.yaml 频率调度（不使用 recipe 覆写） |

## 匹配指引

- **此 index 服务于 runner Step 2**，不是 test-loop SCAN 阶段本身
- Runner 读取 pre-flight + trend-analyzer 数据 → 逐条匹配 → 有覆写则将 recipe 建议注入 test-loop spawn prompt
- 多条 recipe 可同时匹配（如同时 plateau + regression hotspot），合并建议的 scanner 和 directive
- recipe 建议是**覆写层**，merge 到 scan-strategies.yaml 频率调度之上（不替代默认 `coverage` scanner）
- 如果 recipe 建议的 directive 已满 3 条，频率调度的额外 directive 不再注入

## 何时创建新 Recipe

Runner Step 4（Meta-analysis）执行完毕后，检查 scan recipe 演进信号：

| 触发条件 | 动作 |
|---------|------|
| runner 推理出 scanner override（非 recipe），后续 2 轮证明有效 | 提取为新 recipe |
| 某信号反复出现但无匹配 recipe（3+ 轮同一 override 模式） | 提取为新 recipe |
| recipe 建议的 override 后指标恶化 | 修正或弃用该 recipe |
| scan 很顺利且按频率调度即可 | 不提取 |

## 演进日志

| 日期 | Recipe | 变更 | 原因 |
|------|--------|------|------|
| 2026-03-30 | 全部 | 初始创建（占位规则） | ISS-164 recipe-seed |
| 2026-03-30 | plateau-breaking.md | 创建 — coverage 停滞突破策略 | ISS-167 scan-recipes |
| 2026-03-30 | regression-focused-scan.md | 创建 — 高回归类别聚焦扫描 | ISS-167 scan-recipes |
| 2026-03-30 | _index.md | 占位规则替换为正式匹配条件，消费者改为 runner Step 2 | ISS-167 scan-recipes |

> 版本：v2.0 | 最后更新：2026-03-30
