# Recipe: Performance Test Generation

> 适用于：performance scanner 发现的性能 gap（响应时间、执行耗时超标）

## 匹配条件

- gap `source` = `performance`
- 或 gap description 包含以下关键词：
  - response time、latency、timeout、slow、performance
  - timing、duration、baseline、drift
  - ms、milliseconds、seconds（与数值一起出现）

## 前置检查

- [ ] gap 是否指定了具体的 baseline 值（如 "应 < 2000ms"）
- [ ] gap 涉及的是 API 响应时间还是 workflow 执行耗时
- [ ] `tests/baselines.yaml` 中是否已有该指标的 baseline 记录
- [ ] 性能退化是否可能由环境因素导致（冷启动、网络抖动）

## YAML 模板结构

### API 响应时间测试

生成 `tests/registry/backend-api/{id}.yaml`：

```yaml
id: "backend-api-perf-{short-name}"
name: "{endpoint} Response Time Check"
category: "backend-api"
source: "performance"
description: "验证 {endpoint} 响应时间 < {threshold_ms}ms"
safety_level: "safe"
priority: "high"
tags: ["performance", "timing"]
steps:
  - action: "http_request"
    params:
      method: "{GET/POST}"
      url: "http://localhost:3010{endpoint}"
      measure_time: true
assertions:
  - type: "status_code"
    expected: 200
  - type: "timing_under"
    target: "response_time"
    expected: {threshold_ms}
baseline_ref: "{baselines.yaml key path}"
timeout_seconds: 30
retry: 1  # 性能测试允许 1 次重试（排除冷启动）
```

### Workflow 执行耗时测试

生成 `tests/registry/workflow-e2e/{id}.yaml`：

```yaml
id: "workflow-e2e-perf-{short-name}"
name: "{workflow} Execution Time Check"
category: "workflow-e2e"
source: "performance"
description: "验证 {workflow} 执行耗时 < {threshold_ms}ms"
safety_level: "safe"
priority: "high"
tags: ["performance", "timing", "casework"]
steps:
  - action: "run_workflow"
    params:
      workflow: "{workflow_name}"
      measure_time: true
      # workflow 特定参数
assertions:
  - type: "timing_under"
    target: "execution_time"
    expected: {threshold_ms}
baseline_ref: "{baselines.yaml key path}"
timeout_seconds: 120
retry: 1
```

## 推荐 Assertion Types

| Gap 描述 | Assertion Type | 示例 |
|---------|---------------|------|
| "API 响应 > Nms" | `timing_under` | `target: "response_time", expected: 2000` |
| "Casework 执行 drift" | `timing_under` | `target: "execution_time", expected: 60000` |
| "同时验证功能正确性" | `timing_under` + `status_code` | 组合使用：先确保功能正确再检查时间 |
| "对比 baseline" | `timing_under` | `expected` 值从 baselines.yaml 读取 |

## 执行步骤

1. 从 gap 提取性能指标：什么操作 + 当前耗时 + 期望 threshold
2. 判断类型：
   - API endpoint 响应时间 → `backend-api` category + API 模板
   - Workflow/casework 执行耗时 → `workflow-e2e` category + Workflow 模板
3. 确定 threshold 值：
   - gap 中明确指定 → 直接使用
   - gap 只说 "变慢了" → 查 `tests/baselines.yaml` 取 baseline × 1.5 作为 threshold
   - 无 baseline 无指定 → API 默认 2000ms，workflow 默认 60000ms
4. 设置 `retry: 1`（性能测试允许 1 次重试排除冷启动影响）
5. 添加 `baseline_ref` 指向 baselines.yaml 中的 key（供后续 trend 分析）
6. 将 testId 加入 `state.json.testQueue`

## 常见坑

| 坑 | 表现 | 解法 |
|----|------|------|
| 冷启动导致首次超时 | 第一次测试 fail，后续 pass | 设 `retry: 1`，或在 setup 中先发一次 warmup 请求 |
| threshold 设太紧 | 正常波动就 fail（比如 1998ms vs 2000ms） | threshold 留 20% buffer：baseline 1500ms → threshold 2000ms |
| 环境差异（CI vs local） | local pass 但 CI fail | threshold 按最慢环境校准，或用相对 baseline（vs baseline × N） |
| 多个请求混合计时 | 测试中发了多个请求，timing 不清楚指哪个 | 每个请求独立 step + 独立 timing assertion |
| baselines.yaml 不存在 | 引用 baseline_ref 报错 | 生成时检查文件是否存在，不存在就用默认值 |

_来源：ISS-166 gen-recipes | 创建：2026-03-30_
