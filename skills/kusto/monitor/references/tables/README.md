# 表结构定义 (tables/)

本目录存放 Azure Monitor Kusto 表结构定义文件，每个文件对应一个表。

## 表索引

### AzureAlertsManagement 数据库 (警报管理)

| 表名 | 用途 | 文件 |
|------|------|------|
| traces | 警报处理跟踪日志（Metric Alerts 触发记录） | [traces-alerts.md](./traces-alerts.md) |
| requests | API 请求日志 | [requests.md](./requests.md) |
| exceptions | 异常日志 | [exceptions.md](./exceptions.md) |
| customEvents | 自定义事件 | [customEvents.md](./customEvents.md) |
| customMetrics | 自定义指标 | [customMetrics.md](./customMetrics.md) |
| dependencies | 依赖项调用日志 | [dependencies.md](./dependencies.md) |
| AmpSliLogs | 警报管理平台 SLI 日志 | [AmpSliLogs.md](./AmpSliLogs.md) |
| TraceTelemetry | 跟踪遥测（警报处理详情） | [TraceTelemetry.md](./TraceTelemetry.md) |
| ServiceFabricOperationalEvent | Service Fabric 操作事件 | [ServiceFabricOperationalEvent.md](./ServiceFabricOperationalEvent.md) |

### LogSearchRule 数据库 (日志搜索规则)

| 表名 | 用途 | 文件 |
|------|------|------|
| traces | 日志搜索规则执行跟踪 | [traces-logsearchrule.md](./traces-logsearchrule.md) |
| LogSearchRuleSliLogs | 日志搜索规则 SLI 日志 | [LogSearchRuleSliLogs.md](./LogSearchRuleSliLogs.md) |

### azureinsightsmc 数据库 (Azure Insights)

| 表名 | 用途 | 文件 |
|------|------|------|
| Traces | Azure Insights 跟踪日志 | [Traces-insights.md](./Traces-insights.md) |
| ItemizedQosEvent | 诊断设置 QoS 事件 | [ItemizedQosEvent.md](./ItemizedQosEvent.md) |
| ActivityLogAlertsSliLogs | 活动日志警报 SLI 日志 | [ActivityLogAlertsSliLogs.md](./ActivityLogAlertsSliLogs.md) |

### AzNSPROD 数据库 (通知服务) ⚠️

> **注意**: Azure NS Cluster 目前无法通过 MCP 访问，以下信息基于文档参考。

| 表名 | 用途 | 文件 |
|------|------|------|
| traces | 通知服务跟踪日志 | - |

**集群信息**:
- 集群 URI: `https://aznscluster.chinaeast2.kusto.chinacloudapi.cn`
- 数据库: `AzNSPROD`
- 用途: Azure 通知服务 (Action Groups, 通知发送)

---

## 文件命名规范

```
{TableName}.md                    # 单一表
{TableName}-{database}.md         # 同名表区分数据库
```

示例：
- `traces-alerts.md` - AzureAlertsManagement.traces
- `traces-logsearchrule.md` - LogSearchRule.traces
- `Traces-insights.md` - azureinsightsmc.Traces
- `ItemizedQosEvent.md` - 诊断设置 QoS 事件

## 文件格式

每个表定义文件使用以下格式：

```markdown
---
name: TableName
database: DatabaseName
cluster: cluster_uri
description: 表描述
status: active|deprecated
---

# TableName

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | AzureAlertsManagement |
| 状态 | ✅ 可用 / ⚠️ 已弃用 |

## 用途

描述此表的主要用途和适用场景。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| env_time | datetime | 事件时间戳 |
| operation_Name | string | 操作名称 |
| customDimensions | dynamic | 自定义维度（含警报详情） |

## 常用筛选字段

- `env_time` - 按时间筛选
- `operation_Name` - 按操作类型筛选
- `customDimensions.AlertRuleId` - 按警报规则筛选

## 示例查询

\```kql
TableName
| where env_time > ago(1d)
| project env_time, operation_Name, customDimensions
| take 10
\```
```

## 状态标记

| 状态 | 标记 | 说明 |
|------|------|------|
| 可用 | ✅ | 表正常可用 |
| 已弃用 | ⚠️ | 表已弃用，不建议使用 |
| 实验性 | 🧪 | 实验性表，可能变更 |
