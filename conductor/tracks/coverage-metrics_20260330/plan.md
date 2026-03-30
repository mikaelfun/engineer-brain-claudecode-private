# Implementation Plan: coverage-metrics_20260330

## Phase 1: Fix coverage bug + 统一公式

### Task 1.1: Fix stats-reporter.sh totalTests calculation
- 修改 stats-reporter.sh：用 registry 目录 YAML count 替代 `state.stats.totalTests`
- 与 health-check.sh 使用相同的 registryCount 计算逻辑
- 确保 round summary JSON 的 coverage 字段正确

### Task 1.2: Add per-round greenRate to round summary
- stats-reporter.sh 新增：扫描当前 round 的 result 文件，计算 `本轮 pass / 本轮 total`
- 写入 round summary JSON 的 `stats.greenRate` 字段
- 这是每轮独立的健康度指标，不是累积的

### Task 1.3: Add fixThroughput and regressionRate to round summary
- fixThroughput: 从 discoveries.json 计算 `verified / total`
- regressionRate: 从 regressionQueue 处理结果计算 `regression fails / prev round passes`
- 两个指标写入 round summary JSON

## Phase 2: 上游消费者适配

### Task 2.1: Update pre-flight.sh to expose new metrics
- 新增 `metrics` 对象：`{ greenRate, fixThroughput, regressionRate }`
- 保留 `coverage` 字段向后兼容
- trend 计算适配：coverageTrend 使用修正后的 coverage 值

### Task 2.2: Update dashboard-renderer.sh + trend-analyzer.sh
- dashboard-renderer.sh 展示多维指标而非单一 coverage
- trend-analyzer.sh 感知新指标用于 Strategic Review
- 首轮跑新指标时不触发假告警（trend baseline reset 逻辑）
