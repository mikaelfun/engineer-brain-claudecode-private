---
name: DiskManagerApiQoSEvent
database: Disks
cluster: https://disksmc.chinaeast2.kusto.chinacloudapi.cn
description: Disk RP API 调用 QoS 事件，记录磁盘 API 操作的性能和结果
status: active
---

# DiskManagerApiQoSEvent

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://disksmc.chinaeast2.kusto.chinacloudapi.cn |
| 数据库 | Disks |
| 状态 | ✅ 可用 |

## 用途

记录 Disk RP（资源提供程序）的 API 调用事件，包括操作类型、执行时间、结果码和错误详情。用于追踪磁盘创建、删除、附加、分离等操作的成功/失败情况。

## 关键字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| PreciseTimeStamp | datetime | 精确时间戳 | 2025-01-01T00:00:00Z |
| subscriptionId | string | 订阅 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| operationId | string | 操作 ID | guid |
| correlationId | string | 关联 ID，用于追踪整个操作链 | guid |
| clientRequestId | string | 客户端请求 ID | guid |
| operationName | string | 操作名称 | Disks.ResourceOperation.PUT |
| resourceGroupName | string | 资源组名称 | my-rg |
| resourceName | string | 磁盘资源名称 | mydisk |
| durationInMilliseconds | long | 操作持续时间（毫秒） | 1500 |
| e2EDurationInMilliseconds | long | 端到端持续时间（毫秒） | 2000 |
| httpStatusCode | long | HTTP 状态码 | 200, 400, 500 |
| resultCode | string | 结果码 | Success, Failed |
| resultType | long | 结果类型 | 0=成功, 其他=失败 |
| exceptionType | string | 异常类型 | 异常类名 |
| errorDetails | string | 错误详情 | 详细错误信息 |
| region | string | 区域 | chinaeast2 |
| apiVersion | string | API 版本 | 2023-10-02 |
| userAgent | string | 用户代理 | Azure-SDK |
| clientApplicationId | string | 客户端应用 ID | guid |
| RPTenant | string | RP 租户 | 租户标识 |

## 常用筛选字段

- `subscriptionId` - 按订阅筛选
- `correlationId` - 按关联 ID 追踪完整操作
- `resourceName` - 按磁盘名称筛选
- `operationName` - 按操作类型筛选
- `httpStatusCode` - 按 HTTP 状态码筛选
- `resultCode` - 按结果筛选（Success/Failed）

## 常见操作名称

| 操作名称 | 说明 |
|----------|------|
| `Disks.ResourceOperation.PUT` | 创建/更新磁盘 |
| `Disks.ResourceOperation.DELETE` | 删除磁盘 |
| `DiskOperation.Get.GET` | 获取磁盘信息 |
| `Snapshots.ResourceOperation.PUT` | 创建快照 |
| `Snapshots.ResourceOperation.DELETE` | 删除快照 |

## 典型应用场景

1. **追踪磁盘操作失败**: 通过 correlationId 查找操作失败的详细原因
2. **分析操作延迟**: 通过 durationInMilliseconds 分析操作耗时
3. **监控 API 调用**: 统计 API 调用成功率和错误分布

## 示例查询

```kql
// 按 CorrelationId 查询磁盘 API 调用
cluster('https://disksmc.chinaeast2.kusto.chinacloudapi.cn').database('Disks').DiskManagerApiQoSEvent 
| where subscriptionId == "{subscription}"
| where PreciseTimeStamp >= ago(3d)
| where correlationId == "{correlationId}"
| project PreciseTimeStamp, operationName, resourceGroupName, resourceName, 
         httpStatusCode, resultCode, errorDetails, durationInMilliseconds
| order by PreciseTimeStamp asc
```

```kql
// 查询特定资源组的磁盘操作
cluster('https://disksmc.chinaeast2.kusto.chinacloudapi.cn').database('Disks').DiskManagerApiQoSEvent 
| where subscriptionId == "{subscription}"
| where PreciseTimeStamp >= ago(1d)
| where resourceGroupName == "{resourceGroup}"
| where operationName !contains "GET"
| project PreciseTimeStamp, operationName, resourceName, httpStatusCode, resultCode, errorDetails
| order by PreciseTimeStamp desc
```

```kql
// 统计操作失败率
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

## 关联表

- [DiskManagerContextActivityEvent.md](./DiskManagerContextActivityEvent.md) - 详细操作上下文日志
- [DiskRPResourceLifecycleEvent.md](./DiskRPResourceLifecycleEvent.md) - 磁盘生命周期事件
- [Disk.md](./Disk.md) - 磁盘元数据快照

## 注意事项

- 使用 `correlationId` 可以追踪整个操作链路
- `errorDetails` 字段包含详细的错误信息，用于诊断失败原因
- 建议过滤 GET 操作以减少噪音，专注于写操作
- 数据保留时间约 30 天
