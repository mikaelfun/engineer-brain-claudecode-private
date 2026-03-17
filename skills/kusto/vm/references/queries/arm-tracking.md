---
name: arm-tracking
description: ARM 追踪查询 - 追踪 ARM 层资源操作和活动日志
tables:
  - ArmResourceEvents
  - ArmResourcePropertyEvents
  - HttpIncomingRequests
  - HttpOutgoingRequests
  - JobTraces
parameters:
  - name: subscription
    required: true
    description: 订阅 ID
  - name: correlationId
    required: true
    description: 关联 ID
  - name: resourceUri
    required: false
    description: 资源 URI
  - name: starttime
    required: false
    default: ago(1d)
    description: 开始时间
  - name: endtime
    required: false
    default: now()
    description: 结束时间
---

# ARM 追踪查询

## 用途

追踪 ARM 层的资源操作，从 Portal 活动日志获取 correlationId 后查询完整的操作链路。

## 必要参数

| 参数 | 必填 | 说明 | 示例 |
|------|------|------|------|
| {subscription} | 是 | 订阅 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| {correlationId} | 是 | 关联 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| {resourceUri} | 否 | 资源 URI | /subscriptions/.../resourceGroups/.../providers/... |
| {starttime} | 否 | 开始时间 | 2025-01-01T00:00:00Z |
| {endtime} | 否 | 结束时间 | 2025-01-02T00:00:00Z |

## 查询语句

### 查询 ARM 资源事件

```kql
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').ArmResourceEvents
| where TIMESTAMP > ago(1d)
| where correlationId == "{correlationId}"
| project TIMESTAMP, operationName, resourceUri, status, resultType, properties
| order by TIMESTAMP asc
```

### 查询 ARM 入站请求

```kql
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').HttpIncomingRequests
| where TIMESTAMP > ago(1d)
| where correlationId == "{correlationId}"
| project TIMESTAMP, httpMethod, operationName, targetUri, httpStatusCode, 
         durationInMilliseconds, clientApplicationId, userAgent
| order by TIMESTAMP asc
```

### 查询 ARM 出站请求

```kql
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').HttpOutgoingRequests
| where TIMESTAMP > ago(1d)
| where correlationId == "{correlationId}"
| project TIMESTAMP, httpMethod, operationName, targetUri, httpStatusCode, 
         durationInMilliseconds, targetResourceProvider
| order by TIMESTAMP asc
```

### 按资源 URI 查询

```kql
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').ArmResourceEvents
| where TIMESTAMP > ago(1d)
| where resourceUri == "{resourceUri}"
| project TIMESTAMP, operationName, correlationId, status, resultType, properties
| order by TIMESTAMP desc
```

### 查询资源属性变更

```kql
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').ArmResourcePropertyEvents
| where TIMESTAMP > ago(1d)
| where correlationId == "{correlationId}"
| project TIMESTAMP, resourceUri, propertyName, oldValue, newValue
| order by TIMESTAMP asc
```

## 结果字段说明

| 字段 | 说明 |
|------|------|
| operationName | 操作名称 |
| resourceUri | 资源 URI |
| status | 操作状态 |
| resultType | 结果类型 |
| durationInMilliseconds | 持续时间 (毫秒) |
| targetResourceProvider | 目标资源提供程序 |

## 工作流程

1. 从 Azure Portal 活动日志获取 `correlationId`
2. 使用 `correlationId` 查询 ARM 层事件
3. 获取 `operationId` 后查询 CRP 层详细日志

## 变体查询

### 查询失败的操作

```kql
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').HttpIncomingRequests
| where TIMESTAMP > ago(1d)
| where subscriptionId == "{subscription}"
| where httpStatusCode >= 400
| project TIMESTAMP, operationName, targetUri, httpStatusCode, correlationId
| order by TIMESTAMP desc
```

### 追踪完整操作链

```kql
let corrId = "{correlationId}";
union
(cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').HttpIncomingRequests
 | where TIMESTAMP > ago(1d) | where correlationId == corrId
 | project TIMESTAMP, Layer="ARM-In", operationName, httpStatusCode, targetUri),
(cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').HttpOutgoingRequests
 | where TIMESTAMP > ago(1d) | where correlationId == corrId
 | project TIMESTAMP, Layer="ARM-Out", operationName, httpStatusCode, targetUri),
(cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').ApiQosEvent
 | where TIMESTAMP > ago(1d) | where correlationId == corrId
 | project TIMESTAMP, Layer="CRP", operationName, httpStatusCode, targetUri=resourceName)
| order by TIMESTAMP asc
```

## 关联查询

- [vm-operations.md](./vm-operations.md) - CRP 层 VM 操作查询
- [context-activity.md](./context-activity.md) - 详细执行日志

---

## 补充查询

### 查询 ARM Job Traces (详细操作追踪)

适用于 Mooncake 环境，查询 ARM 层的 Job 追踪日志：

```kql
cluster("armmcadx.chinaeast2.kusto.chinacloudapi.cn").database('armmc').JobTraces
| where TIMESTAMP between (datetime({starttime}) .. datetime({endtime}))
| where isempty("{subscription}") or subscriptionId has "{subscription}"
| where isempty("{correlationId}") or correlationId has "{correlationId}"
| project TIMESTAMP, correlationId, ActivityId, operationName, message, exception
| order by TIMESTAMP asc
```

### 查询 ARM HTTP 入站请求 (Mooncake)

```kql
cluster("armmcadx.chinaeast2.kusto.chinacloudapi.cn").database("armmc").HttpIncomingRequests 
| where TIMESTAMP between (datetime({starttime}) .. datetime({endtime}))
| where isempty("{subscription}") or subscriptionId has "{subscription}"
| where targetUri contains strcat("virtualMachines/", "{vmname}")
| project TIMESTAMP, ActivityId, correlationId, TaskName, operationName, httpMethod, targetUri, 
         userAgent, httpStatusCode, errorCode, errorMessage, clientApplicationId, clientRequestId, additionalProperties
| sort by TIMESTAMP asc
```

### 查询 ARM HTTP 出站请求 (Mooncake)

```kql
cluster("armmcadx.chinaeast2.kusto.chinacloudapi.cn").database("armmc").HttpOutgoingRequests 
| where TIMESTAMP between (datetime({starttime}) .. datetime({endtime}))
| where isempty("{subscription}") or subscriptionId has "{subscription}"
| where targetUri contains strcat("virtualMachines/", "{vmname}")
| project TIMESTAMP, ActivityId, correlationId, TaskName, operationName, httpMethod, targetUri, 
         httpStatusCode, errorCode, errorMessage, clientApplicationId, clientRequestId, additionalProperties
| sort by TIMESTAMP asc
```

## 集群信息 (Mooncake)

| 集群 | URI | 数据库 | 用途 |
|------|-----|--------|------|
| ARM MC ADX | https://armmcadx.chinaeast2.kusto.chinacloudapi.cn | armmc | ARM 层日志 (Mooncake) |
