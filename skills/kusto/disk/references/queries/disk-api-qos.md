---
name: disk-api-qos
description: Disk RP API 调用追踪查询
tables:
  - DiskManagerApiQoSEvent
  - DiskManagerContextActivityEvent
parameters:
  - name: subscription
    required: true
    description: 订阅 ID
  - name: correlationId
    required: false
    description: 关联 ID
  - name: startTime
    required: false
    default: ago(3d)
    description: 开始时间
  - name: endTime
    required: false
    default: now()
    description: 结束时间
---

# Disk RP API 调用追踪查询

## 用途

追踪 Disk RP 的 API 调用，分析操作成功/失败情况和错误详情。

## 必要参数

| 参数 | 必填 | 说明 | 示例 |
|------|------|------|------|
| {subscription} | 是 | 订阅 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| {correlationId} | 否 | 关联 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| {resourceGroup} | 否 | 资源组名称 | my-rg |
| {startTime} | 否 | 开始时间 | 2025-01-01T00:00:00Z |
| {endTime} | 否 | 结束时间 | 2025-01-02T00:00:00Z |

## 查询语句

### 查询 1: 按 CorrelationId 查询 API 调用

```kql
cluster('https://disksmc.chinaeast2.kusto.chinacloudapi.cn').database('Disks').DiskManagerApiQoSEvent 
| where subscriptionId == "{subscription}"
| where PreciseTimeStamp >= datetime({startTime}) and PreciseTimeStamp <= datetime({endTime})
| where correlationId == "{correlationId}"
| project PreciseTimeStamp, operationName, resourceGroupName, resourceName, 
         httpStatusCode, resultCode, errorDetails, durationInMilliseconds
| order by PreciseTimeStamp asc
```

### 查询 2: 按资源组查询磁盘操作

```kql
cluster('https://disksmc.chinaeast2.kusto.chinacloudapi.cn').database('Disks').DiskManagerApiQoSEvent 
| where subscriptionId == "{subscription}"
| where PreciseTimeStamp >= ago(1d)
| where resourceGroupName == "{resourceGroup}"
| where operationName !contains "GET"
| project PreciseTimeStamp, operationName, resourceName, httpStatusCode, resultCode, errorDetails
| order by PreciseTimeStamp desc
```

### 查询 3: 查询失败的操作

```kql
cluster('https://disksmc.chinaeast2.kusto.chinacloudapi.cn').database('Disks').DiskManagerApiQoSEvent 
| where subscriptionId == "{subscription}"
| where PreciseTimeStamp >= ago(1d)
| where resultCode != "Success" or httpStatusCode >= 400
| project PreciseTimeStamp, operationName, resourceName, httpStatusCode, resultCode, errorDetails, durationInMilliseconds
| order by PreciseTimeStamp desc
```

### 查询 4: 操作失败率统计

```kql
cluster('https://disksmc.chinaeast2.kusto.chinacloudapi.cn').database('Disks').DiskManagerApiQoSEvent 
| where subscriptionId == "{subscription}"
| where PreciseTimeStamp >= ago(7d)
| summarize 
    TotalCount = count(),
    SuccessCount = countif(resultCode == "Success"),
    FailedCount = countif(resultCode != "Success")
    by operationName
| extend FailureRate = round(100.0 * FailedCount / TotalCount, 2)
| order by FailedCount desc
```

### 查询 5: 详细操作上下文日志

```kql
cluster('https://disksmc.chinaeast2.kusto.chinacloudapi.cn').database('Disks').DiskManagerContextActivityEvent
| where subscriptionId == "{subscription}"
| where PreciseTimeStamp >= datetime({startTime}) and PreciseTimeStamp <= datetime({endTime})
| where correlationId == "{correlationId}"
| where traceLevel >= 2  // Warning 及以上
| project PreciseTimeStamp, traceLevel, operationName, message
| order by PreciseTimeStamp asc
```

### 查询 6: 长时间操作分析

```kql
cluster('https://disksmc.chinaeast2.kusto.chinacloudapi.cn').database('Disks').DiskManagerApiQoSEvent 
| where subscriptionId == "{subscription}"
| where PreciseTimeStamp >= ago(1d)
| where durationInMilliseconds > 30000  // 超过 30 秒
| project PreciseTimeStamp, operationName, resourceName, durationInMilliseconds, httpStatusCode, resultCode
| order by durationInMilliseconds desc
```

## 结果字段说明

| 字段 | 说明 |
|------|------|
| correlationId | 关联 ID，用于追踪整个操作链 |
| operationName | 操作名称 |
| httpStatusCode | HTTP 状态码 |
| resultCode | 结果码 (Success, Failed) |
| errorDetails | 错误详情 |
| durationInMilliseconds | 操作持续时间 (毫秒) |

## 常见操作名称

| 操作名称 | 说明 |
|----------|------|
| Disks.ResourceOperation.PUT | 创建/更新磁盘 |
| Disks.ResourceOperation.DELETE | 删除磁盘 |
| DiskOperation.Get.GET | 获取磁盘信息 |
| Snapshots.ResourceOperation.PUT | 创建快照 |

## 关联查询

- [disk-lifecycle.md](./disk-lifecycle.md) - 磁盘生命周期事件
- [disk-metadata.md](./disk-metadata.md) - 磁盘元数据
