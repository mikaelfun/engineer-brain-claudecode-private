---
name: TraceTelemetry
database: AzureAlertsManagement
cluster: https://azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn
description: 跟踪遥测日志，包含警报处理详情
status: active
---

# TraceTelemetry

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | AzureAlertsManagement |
| 状态 | ✅ 可用 |

## 用途

记录 Azure Alerts Management 服务的遥测跟踪日志，包含：
- 警报处理详情
- 通知延迟信息
- Action Rule 处理
- 监控条件状态

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| TIMESTAMP | datetime | 记录时间戳 |
| PreciseTimeStamp | datetime | 精确时间戳 |
| Environment | string | 环境 |
| Region | string | 区域 |
| Level | long | 日志级别 |
| message | string | 消息内容 |
| operation_Id | string | 操作 ID |
| operation_Name | string | 操作名称 |
| operation_ParentId | string | 父操作 ID |
| severityLevel | long | 严重程度 |
| cloud_RoleName | string | 服务角色名称 |
| cloud_RoleInstance | string | 服务角色实例 |

### 警报相关字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| AlertName | string | 警报名称 |
| AlertRegion | string | 警报区域 |
| MonitorCondition | string | 监控条件 (Fired/Resolved) |
| NotificationType | string | 通知类型 |
| AlertFiredToNotificationDelayInMs | string | 触发到通知延迟 (毫秒) |
| Fetched action rule | string | 获取的 Action Rule |
| Pushed action rule | string | 推送的 Action Rule |
| JobName | string | 作业名称 |
| JobGroupName | string | 作业组名称 |

## 常用筛选字段

- `PreciseTimeStamp` - 按时间筛选
- `AlertName` - 按警报名称筛选
- `MonitorCondition` - 按监控条件筛选
- `Region` - 按区域筛选
- `operation_Id` - 按操作 ID 关联

## 典型应用场景

1. **警报通知延迟分析** - 查看 AlertFiredToNotificationDelayInMs
2. **Action Rule 处理追踪** - 查看 action rule 相关字段
3. **监控条件变化追踪** - 按 MonitorCondition 筛选

## 示例查询

### 查询警报处理记录

```kql
let starttime = datetime({startDate});
let endtime = datetime({endDate});
cluster('azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn').database('AzureAlertsManagement').TraceTelemetry
| where PreciseTimeStamp between (starttime..endtime)
| where isnotempty(AlertName)
| project PreciseTimeStamp, AlertName, AlertRegion, MonitorCondition, NotificationType, AlertFiredToNotificationDelayInMs
| order by PreciseTimeStamp desc
```

### 通知延迟分析

```kql
cluster('azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn').database('AzureAlertsManagement').TraceTelemetry
| where PreciseTimeStamp > ago(1h)
| where isnotempty(AlertFiredToNotificationDelayInMs)
| extend delay_ms = tolong(AlertFiredToNotificationDelayInMs)
| summarize 
    avg_delay = avg(delay_ms),
    p95_delay = percentile(delay_ms, 95),
    max_delay = max(delay_ms)
    by bin(PreciseTimeStamp, 5m)
| order by PreciseTimeStamp desc
```

### Action Rule 处理查询

```kql
cluster('azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn').database('AzureAlertsManagement').TraceTelemetry
| where PreciseTimeStamp > ago(1h)
| where isnotempty(['Fetched action rule']) or isnotempty(['Pushed action rule'])
| project PreciseTimeStamp, AlertName, ['Fetched action rule'], ['Pushed action rule']
| order by PreciseTimeStamp desc
```

### 按区域统计

```kql
cluster('azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn').database('AzureAlertsManagement').TraceTelemetry
| where PreciseTimeStamp > ago(24h)
| where isnotempty(AlertRegion)
| summarize 
    fired = countif(MonitorCondition == "Fired"),
    resolved = countif(MonitorCondition == "Resolved")
    by AlertRegion
| order by fired desc
```

## 关联表

- [traces-alerts.md](./traces-alerts.md) - 警报处理跟踪日志（更详细的 traces 表）
- [AmpSliLogs.md](./AmpSliLogs.md) - SLI 日志

## 注意事项

- TraceTelemetry 包含较详细的警报处理遥测数据
- 与 traces 表互补使用，TraceTelemetry 更偏向基础设施层面的遥测
- AlertFiredToNotificationDelayInMs 字段可用于分析端到端延迟
