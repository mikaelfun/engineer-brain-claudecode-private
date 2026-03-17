---
name: traces
database: AzureAlertsManagement
cluster: https://azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn
description: 警报处理跟踪日志，包含 Metric Alerts 触发记录
status: active
---

# traces (AzureAlertsManagement)

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | AzureAlertsManagement |
| 状态 | ✅ 可用 |

## 用途

记录 Azure Alerts Management Platform (AMP) 的处理跟踪日志，包括：
- Metric Alerts 的评估和触发记录
- 警报状态变更 (Fired/Resolved)
- Action Group 通知触发

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| env_time | datetime | 事件时间戳 |
| operation_Name | string | 操作名称 |
| operation_Id | string | 操作 ID |
| operation_ParentId | string | 父操作 ID（用于关联同一评估周期） |
| customDimensions | dynamic | 自定义维度（含警报详情） |
| message | string | 日志消息 |
| severityLevel | string | 日志级别 |
| cloud_RoleName | string | 服务角色名称 |
| environment | string | 环境标识 |

## customDimensions 关键字段

| 字段 | 类型 | 说明 |
|------|------|------|
| AlertRuleId | string | 警报规则资源 ID |
| TargetResource | string | 目标资源 ID |
| MonitorCondition | string | 监控条件 (Fired/Resolved) |
| Condition | string | 触发条件详情（JSON） |
| FiredTimestamp | string | 触发时间戳 |
| AlertInstanceId | string | 警报实例 ID |
| reciverSets | string | 接收者配置（Action Groups） |
| SubscriptionId | string | 订阅 ID |

## 常用筛选字段

- `env_time` - 按时间筛选
- `customDimensions.AlertRuleId` - 按警报规则 ID 筛选
- `customDimensions.TargetResource` - 按目标资源筛选
- `operation_Name` - 按操作类型筛选（如 "POST alerts/createorupdate"）

## 典型应用场景

1. **查询 Metric Alert 触发记录** - 按 AlertRuleId 或 TargetResource 查询
2. **检查警报条件是否满足** - 查看 MonitorCondition 和 Condition
3. **追踪通知发送** - 查看 reciverSets 字段
4. **诊断警报未触发问题** - 检查是否有评估记录

## 示例查询

### 按 AlertRuleId 查询触发记录

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

### 按目标资源查询触发记录

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

### 查询最近的警报活动

```kql
cluster('https://azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn').database("AzureAlertsManagement").traces
| where env_time > ago(1h)
| where operation_Name contains "alerts"
| summarize count() by operation_Name, bin(env_time, 5m)
| order by env_time desc
```

## 关联表

- [requests.md](./requests.md) - 请求日志
- [exceptions.md](./exceptions.md) - 异常日志
- [AmpSliLogs.md](./AmpSliLogs.md) - SLI 日志

## 注意事项

- 使用 `tostring()` 函数提取 customDimensions 中的字段
- `operation_ParentId` 可用于关联同一评估周期的多条记录
- AlertRuleId 和 TargetResource 需要完整的资源 ID 路径
- 查询时建议使用时间范围筛选以提高性能
