---
name: metric-alerts
description: Metric Alerts 触发记录查询
tables:
  - traces
parameters:
  - name: alertRuleId
    required: false
    description: 警报规则资源 ID
  - name: targetResource
    required: false
    description: 目标资源 ID
  - name: subscription
    required: false
    description: 订阅 ID
  - name: startDate
    required: true
    description: 开始时间
  - name: endDate
    required: true
    description: 结束时间
---

# Metric Alerts 触发记录查询

## 用途

查询 Metric Alerts 的触发记录，包括：
- 警报触发/解除记录
- 触发条件详情
- Action Group 配置

---

## 查询 1: 按 AlertRuleId 查询触发记录

### 用途
根据警报规则 ID 查询触发历史。

### 必要参数

| 参数 | 必填 | 说明 | 示例 |
|------|------|------|------|
| {alertRuleId} | 是 | 警报规则完整资源 ID | /subscriptions/.../metricAlerts/myAlert |
| {startDate} | 是 | 开始时间 | 2025-01-01T00:00:00Z |
| {endDate} | 是 | 结束时间 | 2025-01-02T00:00:00Z |

### 查询语句

```kql
let AlertRuleID = "/subscriptions/{subscription}/resourceGroups/{resourceGroup}/providers/microsoft.insights/metricAlerts/{alertName}";
let starttime = datetime({startDate});
let endtime = datetime({endDate});
cluster('https://azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn').database("AzureAlertsManagement").traces
| where env_time between (starttime..endtime)
| where tostring(customDimensions.AlertRuleId) == AlertRuleID
| where operation_Name == "POST alerts/createorupdate"
| summarize arg_max(env_time, *) by operation_ParentId
| project 
    operation_ParentId, 
    env_time, 
    FiredTimestamp = customDimensions.FiredTimestamp, 
    Condition = tostring(customDimensions.Condition), 
    AlertInstanceId = tostring(customDimensions.AlertInstanceId),
    MonitorCondition = tostring(customDimensions.MonitorCondition)
| order by env_time desc
```

### 结果字段说明

| 字段 | 说明 |
|------|------|
| operation_ParentId | 操作父 ID（用于关联） |
| env_time | 事件时间 |
| FiredTimestamp | 触发时间戳 |
| Condition | 触发条件详情（JSON） |
| AlertInstanceId | 警报实例 ID |
| MonitorCondition | 监控条件 (Fired/Resolved) |

---

## 查询 2: 按目标资源查询触发记录

### 用途
根据目标资源 ID 查询所有关联的警报触发记录。

### 必要参数

| 参数 | 必填 | 说明 | 示例 |
|------|------|------|------|
| {targetResource} | 是 | 目标资源完整 ID | /subscriptions/.../providers/.../myResource |
| {startDate} | 是 | 开始时间 | 2025-01-01T00:00:00Z |
| {endDate} | 是 | 结束时间 | 2025-01-02T00:00:00Z |

### 查询语句

```kql
let TargetResource = "/subscriptions/{subscription}/resourceGroups/{resourceGroup}/providers/{provider}/{resourceType}/{resourceName}";
let starttime = datetime({startDate});
let endtime = datetime({endDate});
cluster('https://azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn').database("AzureAlertsManagement").traces
| where env_time between (starttime..endtime)
| where tostring(customDimensions.TargetResource) == TargetResource
| where operation_Name == "POST alerts/createorupdate"
| summarize arg_max(env_time, *) by operation_ParentId
| project 
    operation_ParentId, 
    env_time, 
    FiredTimestamp = customDimensions.FiredTimestamp, 
    Condition = tostring(customDimensions.Condition), 
    AlertInstanceId = tostring(customDimensions.AlertInstanceId),
    MonitorCondition = tostring(customDimensions.MonitorCondition), 
    reciverSets = tostring(customDimensions.reciverSets),
    TargetResource, 
    AlertRuleId = tostring(customDimensions.AlertRuleId)
| order by env_time desc
```

---

## 查询 3: 按订阅查询所有警报活动

### 用途
查看指定订阅下的所有警报活动。

### 查询语句

```kql
let subscriptionId = "{subscription}";
let starttime = datetime({startDate});
let endtime = datetime({endDate});
cluster('https://azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn').database("AzureAlertsManagement").traces
| where env_time between (starttime..endtime)
| where tostring(customDimensions.SubscriptionId) == subscriptionId
| where operation_Name contains "alerts"
| summarize count() by 
    AlertRuleId = tostring(customDimensions.AlertRuleId),
    MonitorCondition = tostring(customDimensions.MonitorCondition)
| order by count_ desc
```

---

## 查询 4: 警报触发时间线

### 用途
生成警报触发的时间线视图。

### 查询语句

```kql
let AlertRuleID = "{alertRuleId}";
let starttime = datetime({startDate});
let endtime = datetime({endDate});
cluster('https://azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn').database("AzureAlertsManagement").traces
| where env_time between (starttime..endtime)
| where tostring(customDimensions.AlertRuleId) == AlertRuleID
| where operation_Name == "POST alerts/createorupdate"
| summarize count() by bin(env_time, 5m), MonitorCondition = tostring(customDimensions.MonitorCondition)
| order by env_time asc
| render timechart
```

## 关联查询

- [scheduled-query-rules.md](./scheduled-query-rules.md) - Scheduled Query Rules 查询
- [amp-sli.md](./amp-sli.md) - AMP SLI 查询
