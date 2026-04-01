# Monitor 产品排查 Skill

> 覆盖 Azure Monitor Alerts（Metric/Log/Activity Log）、通知、诊断设置。

## 1. 诊断层级

```
Layer 1: Alert Management
  ├─ 集群: (见 CSV) / AzureAlertsManagement
  ├─ 关键表: requests, exceptions, customEvents, dependencies
  └─ 用途: Alert 处理管道追踪

Layer 2: Insights (诊断设置)
  ├─ 集群: (见 CSV) / azureinsightsmc
  ├─ 关键表: ItemizedQosEvent, Traces-insights
  └─ 用途: 诊断设置操作日志

Layer 3: Log Search Rules
  ├─ 集群: (见 CSV) / LogSearchRule
  ├─ 关键表: LogSearchRuleSliLogs, traces-logsearchrule
  └─ 用途: Scheduled Query Rules 执行日志
```

## 2. 决策树

### Alert 未触发
```
警报应触发但没有
  ├─→ 查 AzureAlertsManagement.requests → Alert 评估记录
  ├─→ 查条件是否满足 → customMetrics / customEvents
  ├─→ 如果是 Log Alert → 查 LogSearchRuleSliLogs → SQR 执行日志
  └─→ msft-learn: "metric alert troubleshoot"
```

### 通知未收到
```
Alert 触发但通知未到
  ├─→ 查 AzureAlertsManagement.dependencies → 通知发送记录
  ├─→ 分析 Action Group 配置
  └─→ 如果是 email → 检查垃圾邮件; webhook → 检查 endpoint
```

## 3. 可用工具链

- **Kusto**: `skills/kusto/monitor/` (3 DB)
- **msft-learn**: Azure Monitor 文档

## 4. 已知问题库

| 症状 | Root Cause | 解决方案 |
|------|------------|---------|
| Alert 未触发 | 条件未满足/评估延迟 | 检查 metric 粒度和阈值 |
| SQR 报错 | KQL 语法错误/超时 | 检查查询和时间窗口 |
| 通知延迟 | Action Group 限流 | 检查 rate limit |
