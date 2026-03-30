# Recipe: Regression-Focused Scan

> 适用于：某 category 回归率 > 40%，需要集中扫描该类别的测试覆盖盲区

## 匹配条件

- trend-analyzer 报告某 category 的 regressionRate > 40%
- discoveries.json 中特定 category 有 3+ 条 status=regression
- 连续 2+ 轮同一 category 出现 fix → regress 循环（ping-pong 模式）

## 前置检查

- [ ] 确认 regressionRate 数据来源正确（来自 stats-reporter.sh 的 per-round 计算）
- [ ] 确认 discoveries.json 存在且非空
- [ ] 识别 top-regression category：按 regression count 排序

## 执行步骤

### 1. 识别高回归类别

```bash
# 从 discoveries.json 统计各 category 的回归数
node -e "
  const d = JSON.parse(require('fs').readFileSync('tests/discoveries.json','utf8'));
  const cats = {};
  for (const [k,v] of Object.entries(d.items||{})) {
    if (v.status === 'regression') {
      cats[v.category] = (cats[v.category]||0) + 1;
    }
  }
  console.log(JSON.stringify(cats, null, 2));
"
```

### 2. 针对高回归类别强制 SCAN

在 strategic directive 中注入：

```
Regression-focused scanning for category: {category}

扫描重点：
- 该 category 下所有已 fix 的测试 → 检查是否有 side-effect 盲区
- 该 category 关联的源文件 → 找出未被测试覆盖的修改路径
- fix 修改的代码行 → 确认没有 unintended behavior change
```

### 3. 优先调度回归相关 scanner

```
建议 activeScanners（按优先级）：
- coverage（默认，但缩窄到高回归 category）
- design-fidelity（仅针对高回归 category 的 spec AC）
```

### 4. 注入防回归指令到 GENERATE

```
GENERATE 补充指令：
- 为高回归 category 的测试加入 regression guard（验证 fix 不会 break 相邻功能）
- 优先生成 integration test（跨模块依赖导致的回归最常见）
```

## 预期效果

- 高回归 category 的 regressionRate 应在 2-3 轮内降到 < 20%
- fix → regress 循环（ping-pong）应被打破
- 如果 5 轮后仍无改善 → 可能是架构问题，需要 refactor 而非更多测试

## 常见坑

| 坑 | 表现 | 解法 |
|----|------|------|
| 过度聚焦单一 category 导致其他类别 gap 增加 | 其他 category 出现新 regression | 限制 regression-focus 最多 2 轮，然后回归正常调度 |
| fix-regress ping-pong 不是测试问题而是代码缺陷 | 同一测试反复 fix-regress 3+ 次 | 创建 product issue（通过 fix-issue-creation 机制） |
| discoveries.json 统计滞后 | 使用过时的回归数据 | 确认使用最新 round 的 discoveries.json |

_来源：ISS-167 scan-recipes | 基于 scan-strategies.yaml `high_regression_category` override 规则提取_
