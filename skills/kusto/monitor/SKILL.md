---
name: monitor
description: Azure Monitor Kusto 查询专家 - 诊断 Azure Alerts、通知服务、日志搜索规则等问题。当用户需要排查 Azure Monitor 警报、Action Groups、Scheduled Query Rules 问题时触发此 skill。
author: fangkun
last_modified: 2026-01-14
---

# Azure Monitor Kusto 查询 Skill

## 概述

本 Skill 用于查询 Azure Monitor 相关的 Kusto 日志，诊断警报 (Alerts)、通知 (Notifications)、日志搜索规则 (Log Search Rules)、诊断设置 (Diagnostic Settings) 等问题。

## 触发关键词

- Azure Monitor、监控
- 警报、Alerts、Alert Rule
- 通知、Notification、Action Group
- Scheduled Query Rules、日志搜索规则
- Metric Alerts、指标警报
- Activity Log Alerts、活动日志警报
- 诊断设置、Diagnostic Settings

## 集群信息

| 集群名称 | URI | 数据库 | 用途 |
|----------|-----|--------|------|
| Azure Alerts MC | https://azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn | AzureAlertsManagement | 警报管理主数据库 |
| Azure Alerts MC | https://azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn | LogSearchRule | 日志搜索规则 (Scheduled Query Rules) |
| Azure Insights MC | https://azureinsightsmc.chinaeast2.kusto.chinacloudapi.cn | azureinsightsmc | Azure Monitor Insights 数据、诊断设置日志 |
| Azure NS Cluster | https://aznscluster.chinaeast2.kusto.chinacloudapi.cn | AzNSPROD | 通知服务 (Action Groups, 通知发送) ⚠️ |

> ⚠️ Azure NS Cluster 目前可能存在访问限制，建议先验证连接性。

详细集群信息见: [kusto_clusters.csv](./references/kusto_clusters.csv)

## 主要表

### AzureAlertsManagement 数据库 (警报管理)

| 表名 | 用途 | 文档 |
|------|------|------|
| traces | 警报处理跟踪日志（含 Metric Alerts 触发记录） | [📄](./references/tables/traces-alerts.md) |
| requests | 请求日志 | [📄](./references/tables/requests.md) |
| exceptions | 异常日志 | [📄](./references/tables/exceptions.md) |
| customEvents | 自定义事件 | [📄](./references/tables/customEvents.md) |
| customMetrics | 自定义指标 | [📄](./references/tables/customMetrics.md) |
| dependencies | 依赖项调用日志 | [📄](./references/tables/dependencies.md) |
| AmpSliLogs | 警报管理平台 SLI 日志 | [📄](./references/tables/AmpSliLogs.md) |
| TraceTelemetry | 跟踪遥测（警报处理详情） | [📄](./references/tables/TraceTelemetry.md) |
| ServiceFabricOperationalEvent | Service Fabric 操作事件 | [📄](./references/tables/ServiceFabricOperationalEvent.md) |

### LogSearchRule 数据库 (日志搜索规则)

| 表名 | 用途 | 文档 |
|------|------|------|
| traces | 日志搜索规则执行跟踪 | [📄](./references/tables/traces-logsearchrule.md) |
| LogSearchRuleSliLogs | 日志搜索规则 SLI 日志 | [📄](./references/tables/LogSearchRuleSliLogs.md) |

### azureinsightsmc 数据库 (Azure Insights)

| 表名 | 用途 | 文档 |
|------|------|------|
| Traces | Azure Insights 跟踪日志 | [📄](./references/tables/Traces-insights.md) |
| ItemizedQosEvent | 诊断设置 QoS 事件 | [📄](./references/tables/ItemizedQosEvent.md) |
| ActivityLogAlertsSliLogs | 活动日志警报 SLI 日志 | [📄](./references/tables/ActivityLogAlertsSliLogs.md) |

详细表定义见: [tables/](./references/tables/)

## 工作流程

### 步骤 1: 确定问题类型

根据用户问题确定查询目标：
- **Metric Alerts 未触发/触发记录** → AzureAlertsManagement.traces
- **Scheduled Query Rules 执行问题** → LogSearchRule.traces
- **通知未发送** → 需要确认 Action Group 配置
- **诊断设置问题** → azureinsightsmc.ItemizedQosEvent

### 步骤 2: 根据 AlertRuleID 查询 Metric Alerts

```kql
let AlertRuleID = "/subscriptions/{subscription}/resourceGroups/{resourceGroup}/providers/microsoft.insights/metricAlerts/{alertName}";
let starttime = datetime({startDate});
let endtime = datetime({endDate});
cluster('https://azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn').database("AzureAlertsManagement").traces
| where env_time between (starttime..endtime)
| where tostring(customDimensions.AlertRuleId) == AlertRuleID
| where operation_Name == "POST alerts/createorupdate"
| summarize arg_max(env_time, *) by operation_ParentId
| project operation_ParentId, env_time, customDimensions.FiredTimestamp, 
         tostring(customDimensions.Condition), tostring(customDimensions.AlertInstanceId),
         tostring(customDimensions.MonitorCondition)
```

### 步骤 3: 根据目标资源查询 Metric Alerts

```kql
let TargetResource = "/subscriptions/{subscription}/resourceGroups/{resourceGroup}/providers/{provider}/{resourceType}/{resourceName}";
let starttime = datetime({startDate});
let endtime = datetime({endDate});
cluster('https://azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn').database("AzureAlertsManagement").traces
| where env_time between (starttime..endtime)
| where tostring(customDimensions.TargetResource) == TargetResource
| where operation_Name == "POST alerts/createorupdate"
| summarize arg_max(env_time, *) by operation_ParentId
| project operation_ParentId, env_time, customDimensions.FiredTimestamp, 
         tostring(customDimensions.Condition), tostring(customDimensions.AlertInstanceId),
         tostring(customDimensions.MonitorCondition), tostring(customDimensions.reciverSets),
         TargetResource, tostring(customDimensions.AlertRuleId)
```

### 步骤 4: 查询 Scheduled Query Rules 执行记录

```kql
let ruleid = "{alertRuleId}";
let starttime = datetime({startDate});
let endtime = datetime({endDate});
cluster('azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn').database('LogSearchRule').traces
| where env_time between (starttime..endtime)
| where message contains ruleid
| project env_time, message, operation_Name, operation_Id
| order by env_time desc
```

## 常见诊断场景

### 场景 1: Metric Alert 未触发

**排查步骤**:
1. 确认 Alert Rule ID 和目标资源 ID
2. 使用查询 2 或查询 3 查询触发记录
3. 检查 MonitorCondition 字段判断条件是否满足
4. 如无记录，检查规则配置和指标是否正常

### 场景 2: Scheduled Query Rule 未触发

**排查步骤**:
1. 获取 Alert Rule ID
2. 查询 LogSearchRule.traces 检查执行记录
3. 检查是否有执行错误
4. 验证查询条件和时间窗口

### 场景 3: 通知未发送

**排查步骤**:
1. 确认 Alert 已触发（查看 MonitorCondition = Fired）
2. 检查 Action Group 配置
3. 检查 reciverSets 字段是否有配置的通知目标
4. 如需进一步排查通知发送，需要 Azure NS Cluster 权限

### 场景 4: 诊断设置日志未到达

**排查步骤**:
1. 查询 azureinsightsmc.ItemizedQosEvent 检查数据处理状态
2. 检查 Result 字段是否成功
3. 检查 Error 字段获取错误详情
4. 验证目标 Log Analytics Workspace/Storage Account/Event Hub 配置

## 预定义查询

详细查询模板见: [queries/](./references/queries/)

| 查询 | 用途 |
|------|------|
| [metric-alerts.md](./references/queries/metric-alerts.md) | Metric Alerts 触发查询 |
| [scheduled-query-rules.md](./references/queries/scheduled-query-rules.md) | Scheduled Query Rules 执行查询 |
| [diagnostic-settings.md](./references/queries/diagnostic-settings.md) | 诊断设置问题排查 |
| [amp-sli.md](./references/queries/amp-sli.md) | 警报管理平台 SLI 查询 |
| [notification-service.md](./references/queries/notification-service.md) | 通知服务 (Action Groups) 查询 ⚠️ |

## 关键字段说明

### customDimensions 常用字段 (AzureAlertsManagement.traces)

| 字段 | 说明 |
|------|------|
| AlertRuleId | 警报规则资源 ID |
| TargetResource | 目标资源 ID |
| MonitorCondition | 监控条件 (Fired/Resolved) |
| Condition | 触发条件详情 |
| FiredTimestamp | 触发时间戳 |
| AlertInstanceId | 警报实例 ID |
| reciverSets | 接收者配置（Action Groups） |

## 参考链接

- [Azure Monitor 警报故障排查](https://learn.microsoft.com/azure/azure-monitor/alerts/alerts-troubleshoot)
- [Azure Monitor 日志搜索警报故障排查](https://learn.microsoft.com/azure/azure-monitor/alerts/alerts-troubleshoot-log)
- [父 Skill](../SKILL.md)
