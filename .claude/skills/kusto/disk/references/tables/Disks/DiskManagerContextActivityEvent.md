---
name: DiskManagerContextActivityEvent
database: Disks
cluster: https://disksmc.chinaeast2.kusto.chinacloudapi.cn
description: Disk 操作上下文活动日志，包含详细的操作日志和消息
status: active
---

# DiskManagerContextActivityEvent

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://disksmc.chinaeast2.kusto.chinacloudapi.cn |
| 数据库 | Disks |
| 状态 | ✅ 可用 |

## 用途

记录 Disk RP 操作的详细上下文活动日志，包括操作的各个步骤、消息和调用链。用于深入分析磁盘操作的执行过程。

## 关键字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| PreciseTimeStamp | datetime | 精确时间戳 | 2025-01-01T00:00:00Z |
| subscriptionId | string | 订阅 ID | guid |
| activityId | string | 活动 ID | guid |
| correlationId | string | 关联 ID | guid |
| goalSeekingActivityId | string | 目标寻求活动 ID | guid |
| operationName | string | 操作名称 | Disks.ResourceOperation.PUT |
| traceLevel | long | 跟踪级别 | 0=Verbose, 1=Info, 2=Warning, 3=Error |
| traceCode | long | 跟踪代码 | 操作代码 |
| message | string | 日志消息 | 详细日志内容 |
| callerName | string | 调用方名称 | 方法名 |
| sourceFile | string | 源文件 | 文件路径 |
| lineNumber | long | 行号 | 代码行号 |
| RPTenant | string | RP 租户 | 租户标识 |

## 常用筛选字段

- `subscriptionId` - 按订阅筛选
- `activityId` - 按活动 ID 筛选
- `correlationId` - 按关联 ID 筛选
- `traceLevel` - 按日志级别筛选

## traceLevel 说明

| 值 | 级别 | 说明 |
|----|------|------|
| 0 | Verbose | 详细日志 |
| 1 | Info | 信息日志 |
| 2 | Warning | 警告日志 |
| 3 | Error | 错误日志 |

## 典型应用场景

1. **操作详细追踪**: 通过 activityId 查看操作的完整执行过程
2. **错误诊断**: 筛选 Error 级别的日志查找问题
3. **调用链分析**: 通过 callerName 和 sourceFile 分析调用路径

## 示例查询

```kql
// 按 ActivityId 查询操作详情
cluster('https://disksmc.chinaeast2.kusto.chinacloudapi.cn').database('Disks').DiskManagerContextActivityEvent
| where subscriptionId == "{subscription}"
| where PreciseTimeStamp >= ago(1d)
| where activityId == "{activityId}"
| project PreciseTimeStamp, traceLevel, operationName, message, callerName
| order by PreciseTimeStamp asc
```

```kql
// 查询错误和警告日志
cluster('https://disksmc.chinaeast2.kusto.chinacloudapi.cn').database('Disks').DiskManagerContextActivityEvent
| where subscriptionId == "{subscription}"
| where PreciseTimeStamp >= ago(1d)
| where correlationId == "{correlationId}"
| where traceLevel >= 2  // Warning 及以上
| project PreciseTimeStamp, traceLevel, operationName, message
| order by PreciseTimeStamp asc
```

## 关联表

- [DiskManagerApiQoSEvent.md](./DiskManagerApiQoSEvent.md) - API 调用 QoS 事件
- [DiskRPResourceLifecycleEvent.md](./DiskRPResourceLifecycleEvent.md) - 生命周期事件

## 注意事项

- 使用 `activityId` 或 `correlationId` 关联相关日志
- `traceLevel >= 2` 过滤警告和错误
- 详细日志量较大，建议缩小时间范围
