---
name: vm-operations
description: VM 操作查询 - 查询 VM 创建、启动、停止等操作
tables:
  - ApiQosEvent
  - ApiQosEvent_nonGet
  - ContextActivity
parameters:
  - name: subscription
    required: true
    description: 订阅 ID
  - name: correlationId
    required: false
    description: 关联 ID (从 Portal 活动日志获取)
  - name: vmname
    required: false
    description: VM 名称
  - name: starttime
    required: false
    default: ago(2d)
    description: 开始时间
  - name: endtime
    required: false
    default: now()
    description: 结束时间
---

# VM 操作查询

## 用途

查询 VM 的各类操作，包括创建、启动、停止、重启、Deallocate 等。是排查 CRP 层问题的入口查询。

## 必要参数

| 参数 | 必填 | 说明 | 示例 |
|------|------|------|------|
| {subscription} | 是 | 订阅 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| {correlationId} | 否 | 关联 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| {vmname} | 否 | VM 名称 | myvm |
| {starttime} | 否 | 开始时间 | 2025-01-01T00:00:00Z |
| {endtime} | 否 | 结束时间 | 2025-01-02T00:00:00Z |

## 查询语句

### 按 correlationId 查询操作

```kql
cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').ApiQosEvent
| where TIMESTAMP > ago(2d)
| where correlationId == "{correlationId}" 
| where operationName notcontains "GET"
| project PreciseTimeStamp, operationId, correlationId, clientPrincipalName, operationName, 
         resourceGroupName, resourceName, httpStatusCode, resultCode, errorDetails, region, 
         userAgent, clientApplicationId, subscriptionId, requestEntity
| order by PreciseTimeStamp asc
```

### 按资源 URI 查询

```kql
let uri="/subscriptions/{subscription}/resourceGroups/{resourceGroup}/providers/Microsoft.Compute/virtualMachines/{vmname}";
cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').ApiQosEvent_nonGet
| where PreciseTimeStamp between(datetime({starttime})..datetime({endtime})) 
| where subscriptionId == split(uri,"/")[2] and resourceName contains split(uri,"/")[8]
| order by PreciseTimeStamp asc
| extend startTime=PreciseTimeStamp-e2EDurationInMilliseconds*1ms
| extend OperationDuration=e2EDurationInMilliseconds*1ms
| order by startTime asc
| project startTime, PreciseTimeStamp, OperationDuration, apiVersion, resourceName, operationName, 
         resultCode, httpStatusCode, operationId, correlationId, region, requestEntity, errorDetails, 
         userAgent, clientApplicationId
```

### 查询 VM 开关机记录

```kql
cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').ApiQosEvent
| where TIMESTAMP > ago(7d)
| where subscriptionId == "{subscription}"
| where resourceName =~ "{vmname}"
| where operationName has_any ("start", "stop", "restart", "deallocate", "powerOff", "powerOn")
| project PreciseTimeStamp, operationName, resourceName, httpStatusCode, resultCode, errorDetails, 
         correlationId, clientPrincipalName
| order by PreciseTimeStamp desc
```

### 查询操作详细日志 (ContextActivity)

```kql
cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').ContextActivity
| where TIMESTAMP > ago(4h)
| where activityId == "{operationId}"
| project PreciseTimeStamp, message, traceCode
| order by PreciseTimeStamp asc
```

### 查询失败的操作

```kql
cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').ApiQosEvent
| where TIMESTAMP > ago(2d)
| where subscriptionId == "{subscription}"
| where resultType != 0 or httpStatusCode >= 400
| where operationName notcontains "GET"
| project PreciseTimeStamp, resourceName, operationName, resultCode, httpStatusCode, errorDetails, correlationId
| order by PreciseTimeStamp desc
```

## 结果字段说明

| 字段 | 说明 |
|------|------|
| PreciseTimeStamp | 操作完成时间 |
| operationId | 操作 ID (用于查询 ContextActivity) |
| correlationId | 关联 ID |
| operationName | 操作名称 |
| resultCode | 结果代码 |
| httpStatusCode | HTTP 状态码 |
| errorDetails | 错误详情 |

## 变体查询

### 查询 Redeploy 操作

```kql
cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').ApiQosEvent
| where TIMESTAMP > ago(2d)
| where subscriptionId == "{subscription}"
| where resourceName has "{vmname}"
| where operationName contains "redeploy"
| project PreciseTimeStamp, operationId, correlationId, operationName, resourceName, 
         httpStatusCode, resultCode, errorDetails
| order by PreciseTimeStamp asc
```

### 查询特定错误码

```kql
cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').ApiQosEvent
| where TIMESTAMP > ago(2d)
| where resultCode == "AllocationFailed" or resultCode == "OSProvisioningTimedOut"
| where subscriptionId == "{subscription}"
| project PreciseTimeStamp, resourceName, operationName, resultCode, errorDetails, correlationId
| order by PreciseTimeStamp desc
```

## 关联查询

- [context-activity.md](./context-activity.md) - 详细执行日志
- [extension-events.md](./extension-events.md) - 扩展事件
- [container-snapshot.md](./container-snapshot.md) - Fabric 层信息
