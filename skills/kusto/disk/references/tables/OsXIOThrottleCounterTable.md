---
name: OsXIOThrottleCounterTable
database: Fa
cluster: https://azcore.chinanorth3.kusto.chinacloudapi.cn
description: IO 限流详细计数器，记录 IOPS、带宽、队列深度等限流事件
status: active
---

# OsXIOThrottleCounterTable

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azcore.chinanorth3.kusto.chinacloudapi.cn |
| 数据库 | Fa |
| 状态 | ✅ 可用 |

## 用途

记录磁盘 IO 限流的详细计数器，用于分析 IOPS 限流、带宽限流、队列深度限流等情况。帮助诊断磁盘性能瓶颈和限流原因。

## 关键字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| PreciseTimeStamp | datetime | 精确时间戳 | 2025-01-01T00:00:00Z |
| NodeId | string | 主机节点 ID | guid |
| DeviceId | string | 磁盘设备 ID | s:904DE6DC-... |
| Cluster | string | 集群名称 | 集群标识 |
| ThrottleIndex | long | 限流索引 | 0 |
| ThrottledByIopsBucketEmpty | long | IOPS 限流累计次数 | 1000 |
| DeltaThrottledByIopsBucketEmpty | long | 间隔内 IOPS 限流次数 | 50 |
| ThrottledByByteBucketEmpty | long | 带宽限流累计次数 | 500 |
| DeltaThrottledByByteBucketEmpty | long | 间隔内带宽限流次数 | 25 |
| ThrottledByQDLimit | long | 队列深度限流累计次数 | 200 |
| DeltaThrottledByQDLimit | long | 间隔内队列深度限流次数 | 10 |
| ThrottledByQBLimit | long | 队列字节限流累计次数 | 100 |
| DeltaThrottledByQBLimit | long | 间隔内队列字节限流次数 | 5 |
| CurrentQueueDepth | long | 当前队列深度 | 32 |
| CurrentQueueBytes | long | 当前队列字节数 | 2097152 |
| CurrentBucketCountByte | real | 当前字节桶计数 | 1000.0 |
| CurrentBucketCountIO | real | 当前 IO 桶计数 | 500.0 |
| BurstTokensUsedIO | real | 已使用的 IO 突发令牌 | 100.0 |
| BurstTokensUsedByte | real | 已使用的字节突发令牌 | 50000.0 |
| BurstState | long | 突发状态 | 0=正常, 1=突发中 |
| MegaBurstCapacityIO | real | 超级突发 IO 容量 | 10000.0 |
| MegaBurstCapacityByte | real | 超级突发字节容量 | 500000000.0 |

## 常用筛选字段

- `NodeId` - 按节点 ID 筛选
- `DeviceId` - 按设备 ID 筛选（从 OsXIOSurfaceCounterTable 获取）

## 限流类型说明

| 字段 | 说明 | 触发条件 |
|------|------|----------|
| `DeltaThrottledByIopsBucketEmpty` | IOPS 限流 | 磁盘 IOPS 达到配置上限 |
| `DeltaThrottledByByteBucketEmpty` | 带宽限流 | 磁盘吞吐量达到配置上限 |
| `DeltaThrottledByQDLimit` | 队列深度限流 | 队列深度达到上限，通常与延迟增加相关 |
| `DeltaThrottledByQBLimit` | 队列字节限流 | 队列中的字节数达到上限 |

## 典型应用场景

1. **限流诊断**: 确定磁盘是否受到限流及限流类型
2. **性能瓶颈分析**: 判断是 IOPS 还是带宽成为瓶颈
3. **突发使用分析**: 检查突发令牌的使用情况
4. **队列深度分析**: 分析队列积压情况

## 示例查询

```kql
// 检查 IO 限流情况
cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').OsXIOThrottleCounterTable   
| where PreciseTimeStamp >= datetime({startTime}) and PreciseTimeStamp <= datetime({endTime})
| where NodeId == "{nodeId}" 
| where DeviceId contains "{deviceId}"
| project PreciseTimeStamp, ThrottleIndex, 
         DeltaThrottledByByteBucketEmpty, DeltaThrottledByIopsBucketEmpty, 
         DeltaThrottledByQDLimit, DeltaThrottledByQBLimit
| where DeltaThrottledByByteBucketEmpty != 0 
     or DeltaThrottledByIopsBucketEmpty != 0 
     or DeltaThrottledByQDLimit != 0 
     or DeltaThrottledByQBLimit != 0
| order by PreciseTimeStamp asc
```

```kql
// 限流统计
cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').OsXIOThrottleCounterTable   
| where PreciseTimeStamp >= datetime({startTime}) and PreciseTimeStamp <= datetime({endTime})
| where NodeId == "{nodeId}" 
| where DeviceId contains "{deviceId}"
| summarize 
    IopsThrottleCount = sum(DeltaThrottledByIopsBucketEmpty),
    ByteThrottleCount = sum(DeltaThrottledByByteBucketEmpty),
    QDThrottleCount = sum(DeltaThrottledByQDLimit),
    QBThrottleCount = sum(DeltaThrottledByQBLimit)
| extend TotalThrottleCount = IopsThrottleCount + ByteThrottleCount + QDThrottleCount + QBThrottleCount
```

```kql
// 检查突发令牌使用
cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').OsXIOThrottleCounterTable   
| where PreciseTimeStamp >= datetime({startTime}) and PreciseTimeStamp <= datetime({endTime})
| where NodeId == "{nodeId}" 
| where DeviceId contains "{deviceId}"
| project PreciseTimeStamp, BurstState, BurstTokensUsedIO, BurstTokensUsedByte,
         MegaBurstCapacityIO, MegaBurstCapacityByte
| where BurstTokensUsedIO > 0 or BurstTokensUsedByte > 0
```

## 关联表

- [OsXIOSurfaceCounterTable.md](./OsXIOSurfaceCounterTable.md) - IO 性能计数器（获取 DeviceId）
- [OsXIOSurfaceLatencyHistogramTableV2.md](./OsXIOSurfaceLatencyHistogramTableV2.md) - 延迟分布
- [Disk.md](./Disk.md) - 磁盘元数据（检查配置的 IOPS/吞吐量）

## 注意事项

- `DeviceId` 需要从 `OsXIOSurfaceCounterTable` 获取
- 主要关注 `Delta*` 字段，表示间隔内的增量
- 限流类型决定了需要采取的优化措施：
  - IOPS 限流 → 考虑升级磁盘类型或减少 IO 频率
  - 带宽限流 → 考虑升级磁盘类型或减少大 IO 操作
  - QD 限流 → 通常与延迟增加相关，需检查延迟表
- 突发令牌耗尽后会触发持续限流
