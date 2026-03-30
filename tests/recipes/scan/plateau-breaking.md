# Recipe: Coverage Plateau Breaking

> 适用于：coverage 连续 3+ 轮不变，标准 gap scan 无法发现新测试空白

## 匹配条件

- pre-flight 或 trend-analyzer 显示 coverage 连续 3+ 轮不变（coverageTrend = "flat"）
- greenRate 连续 3+ 轮 ≥ 90%（大多数测试都过，但 coverage 不涨 = 没有新测试）
- SCAN 阶段产出的 gap 数连续 2+ 轮 = 0

## 前置检查

- [ ] 确认 coverage 计算正确（totalTests = registry count，非 state.stats.totalTests）
- [ ] 确认最近 3 轮的 round-N-summary.json 都有 coverage 字段
- [ ] 确认 scan-strategies.yaml 中的 scanner 列表没有被错误裁剪

## 执行步骤

### 1. 扩展 Scanner 范围

强制启用平时不常开的 scanner 类型，突破已有 gap 检测盲区：

```
建议 activeScanners:
- coverage（默认，保留）
- design-fidelity（即使不在频率周期内也强制启用）
- architecture（强制启用 — 检查代码模式是否有未测试的分支）
```

### 2. 关注边缘类型

在 strategic directive 中注入：

```
SCAN 重点方向（plateau-breaking mode）：
- error-handling paths：try/catch 块、fallback 逻辑
- edge cases：空数组、null 参数、边界值
- integration boundaries：跨模块调用的接口契约
- config-dependent paths：不同 config 值导致的不同分支
```

### 3. 回顾被 GENERATE 过滤的历史 gap

```
检查最近 5 轮的 phaseHistory：
- 被 GENERATE 标记为 "filtered" 或 "duplicate" 的 gap
- 这些 gap 的过滤理由是否仍然成立
- 如有理由失效的 gap → 重新注入 testQueue
```

### 4. 降低 gap 发现阈值

```
在 SCAN 中放宽标准：
- AC 覆盖 < 100% 的 issue 重新扫描（平时只扫 < 80%）
- 已有测试但只有 happy path 的功能 → 补 error path gap
```

## 预期效果

- coverage 应在 1-2 轮内恢复增长
- 如果 3 轮后仍无增长 → 可能真的到了天花板，runner 应降低 coverage 权重

## 常见坑

| 坑 | 表现 | 解法 |
|----|------|------|
| 强制开太多 scanner 导致 SCAN 超时 | SCAN 阶段 > 10 分钟 | 限制额外 scanner 最多 2 个 |
| 降低阈值产生大量低价值 gap | GENERATE 过滤率 > 80% | 只对 error-handling 和 integration 类降低阈值 |
| 历史 gap 重新注入后仍被过滤 | 死循环 | 记录到 learnings，下轮不再注入同一 gap |

_来源：ISS-167 scan-recipes | 基于 scan-strategies.yaml `coverage_plateau` override 规则提取_
