---
name: vmss-operations
description: VMSS 操作查询 - 查询 VMSS 扩缩容、部署等操作
tables:
  - VmssQoSEvent
  - VmssVMGoalSeekingActivity
  - ContextActivity
parameters:
  - name: subscription
    required: true
    description: 订阅 ID
  - name: vmssname
    required: true
    description: VMSS 名称
  - name: operationId
    required: false
    description: 操作 ID
  - name: starttime
    required: false
    default: ago(3h)
    description: 开始时间
  - name: endtime
    required: false
    default: now()
    description: 结束时间
---

# VMSS 操作查询

## 用途

查询 VMSS 的各类操作，包括扩缩容、部署、更新等。用于排查 VMSS 级别问题。

## 必要参数

| 参数 | 必填 | 说明 | 示例 |
|------|------|------|------|
| {subscription} | 是 | 订阅 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| {vmssname} | 是 | VMSS 名称 | aks-nodepool1-vmss |
| {operationId} | 否 | 操作 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| {starttime} | 否 | 开始时间 | 2025-01-01T00:00:00Z |
| {endtime} | 否 | 结束时间 | 2025-01-02T00:00:00Z |

## 查询语句

### 查询 VMSS QoS 事件

```kql
cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').VmssQoSEvent
| where TIMESTAMP > ago(3h)
| where subscriptionId == "{subscription}"
| where vmssName contains "{vmssname}"
| order by TIMESTAMP asc
| project TIMESTAMP, vmssName, operationName, operationId, image, targetInstanceCount, 
         predominantErrorCode, predominantErrorDetail, extraVMInstanceOverProvisionedCount
```

### 查询 VMSS 错误事件

```kql
cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').VmssQoSEvent
| where PreciseTimeStamp >= ago(14d)
| where subscriptionId == "{subscription}"
| where vmssName contains "{vmssname}"
| where predominantErrorDetail != ""
| project PreciseTimeStamp, vmssName, operationId, resourceGroupName, predominantErrorDetail, 
         predominantErrorCode, operationName
```

### 查询 VMSS 实例级别日志

```kql
cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').VmssVMGoalSeekingActivity
| where PreciseTimeStamp between (datetime({starttime})..datetime({endtime}))
| where subscriptionId == "{subscription}"
| where activityId == "{operationId}"
| project TIMESTAMP, traceLevel, message, callerName
| order by TIMESTAMP desc
```

### 联合查询 ContextActivity 和 VmssVMGoalSeekingActivity

```kql
union cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').ContextActivity, 
      cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').VmssVMGoalSeekingActivity
| where PreciseTimeStamp between (datetime({starttime})..datetime({endtime}))
| where activityId == "{operationId}"
| project PreciseTimeStamp, vMName, activityId, traceLevel, message, sourceFile, lineNumber, 
         callerName, subscriptionId, Node, resourceType
| order by PreciseTimeStamp asc
```

### 查询 VMSS PUT 操作

```kql
cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').ApiQosEvent_nonGet
| where PreciseTimeStamp >= ago(12h)
| where subscriptionId == "{subscription}"
| where resourceName contains "{vmssname}"
| extend StartTimeStamp = datetime_add('MilliSecond', -1 * e2EDurationInMilliseconds, PreciseTimeStamp)
| project StartTimeStamp, EndTimeStamp = PreciseTimeStamp, operationId, operationName, region, 
         subscriptionId, resourceGroupName, resourceName, 
         e2eDurationInMin = e2EDurationInMilliseconds / 60000, resultType, httpStatusCode, 
         resultCode, errorDetails, requestEntity
| order by StartTimeStamp asc
```

## 结果字段说明

| 字段 | 说明 |
|------|------|
| targetInstanceCount | 目标实例数 |
| vMCountDelta | VM 数量变化 |
| predominantErrorCode | 主要错误代码 |
| predominantErrorDetail | 主要错误详情 |
| e2EDurationSeconds | 端到端持续时间 (秒) |

## 变体查询

### Cluster Autoscaler PUT 请求监控

```kql
cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').VmssQoSEvent
| where PreciseTimeStamp between (datetime({starttime})..datetime({endtime}))
| where subscriptionId == '{subscription}'
| where resourceGroupName contains "{resourceGroup}"
| where vmssName contains "{vmssname}"
| where operationName == "VirtualMachineScaleSets.ResourceOperation.PUT"
| project PreciseTimeStamp, operationName, operationId, vmssName, oSType, targetInstanceCount, 
         vMCountDelta, e2EDurationSeconds, extensionNamesCsv, predominantErrorCode, predominantErrorDetail
| order by PreciseTimeStamp desc
```

### 查询 VMSS 实例详细信息

```kql
cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').VMApiQosEvent 
| where TIMESTAMP > ago(5d)
| where operationId has "{operationId}"
| where subscriptionId has '{subscription}'
| project PreciseTimeStamp, operationId, operationName, resourceGroupName, resourceName, 
         fabricCluster, fabricTenantName, correlationId, durationInMilliseconds
| order by PreciseTimeStamp asc
```

## 关联查询

- [vm-operations.md](./vm-operations.md) - VM 操作查询
- [context-activity.md](./context-activity.md) - 详细执行日志
- [extension-events.md](./extension-events.md) - 扩展事件
