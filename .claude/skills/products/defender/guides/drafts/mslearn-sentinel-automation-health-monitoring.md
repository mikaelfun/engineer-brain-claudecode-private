# Sentinel Automation Health Monitoring Guide

> Source: https://learn.microsoft.com/azure/sentinel/monitor-automation-health

## 概述

通过 SentinelHealth 数据表和 Logic Apps 诊断日志，监控 Sentinel 自动化规则和 Playbook 的健康状态。

## 前置条件

1. 启用 Sentinel Health Monitoring: Settings > Health monitoring
2. 对需监控的 Playbook 启用 Logic Apps 诊断日志 -> 发送到 Log Analytics workspace

## SentinelHealth 事件类型

| OperationName | 说明 |
|---|---|
| `Automation rule run` | 自动化规则执行（含 TriggeredPlaybooks 列表） |
| `Playbook was triggered` | Playbook 被手动/API 触发 |

## 状态说明

### Automation Rule Run
- **Success**: 全部 action 执行成功
- **Partial success**: 至少一个 action 成功，部分失败
- **Failure**: 无 action 执行（条件评估失败或首个 action 失败）

### Playbook Was Triggered
- **Success**: 仅表示 Playbook 被成功触发，不代表 Playbook 内部执行完成
- **Failure**: Playbook 无法被触发

> **注意**: Success 仅代表触发成功，Playbook 内部运行结果需查看 Logic Apps 诊断日志。

## 常见错误及解决方案

| 错误 | 解决方案 |
|---|---|
| Playbook was disabled | 在 Automation > Active Playbooks 或 Logic Apps 页面启用 |
| Missing permissions | 授予 Sentinel Automation Contributor 角色 |
| Access control restricts Sentinel | 移除 Logic App IP 访问限制 |
| Not migrated to new permissions model | 重新授权 + 重保存规则 |
| Workflow throttling limits | 增加 trigger concurrency 的 maximumWaitingRuns |
| ARM throttling limits | 减少并发调用频率 |
| Managed identity missing | 配置 managed identity 权限 |
| Subscription/RG locked | 移除资源锁 |
| Invalid credentials | 在 API connections 服务中刷新凭据 |
| Invalid template definition | Logic App Designer 修复后保存 |
| Unsupported trigger type | 使用正确的 Sentinel trigger |

## 关联查询 KQL

```kusto
SentinelHealth
| where SentinelResourceType == "Automation rule"
| mv-expand TriggeredPlaybooks = ExtendedProperties.TriggeredPlaybooks
| extend runId = tostring(TriggeredPlaybooks.RunId)
| join (AzureDiagnostics
    | where OperationName == "Microsoft.Logic/workflows/workflowRunCompleted"
    | project
        resource_runId_s,
        playbookName = resource_workflowName_s,
        playbookRunStatus = status_s)
    on $left.runId == $right.resource_runId_s
| project
    TimeGenerated,
    AutomationRuleName = SentinelResourceName,
    AutomationRuleStatus = Status,
    Description,
    playbookName,
    playbookRunStatus
```

## 可视化

使用 Sentinel 内置 **Automation health** workbook:
- Automation rule health and details
- Playbook trigger health and details
- Playbook runs health and details (需启用 Logic Apps 诊断)
- Automation details per incident
