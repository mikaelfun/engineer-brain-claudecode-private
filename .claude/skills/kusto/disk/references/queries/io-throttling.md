---
name: io-throttling
description: IO 限流检查查询
tables:
  - OsXIOThrottleCounterTable
parameters:
  - name: nodeId
    required: true
    description: 主机节点 ID
  - name: deviceId
    required: true
    description: 磁盘设备 ID
  - name: startTime
    required: true
    description: 开始时间
  - name: endTime
    required: true
    description: 结束时间
---

# IO 限流检查查询

## 用途

检查磁盘 IO 限流情况，识别 IOPS 限流、带宽限流、队列深度限流等问题。

## 必要参数

| 参数 | 必填 | 说明 | 示例 |
|------|------|------|------|
| {nodeId} | 是 | 主机节点 ID | b37b844d-1732-429b-84a1-8f467c92817e |
| {deviceId} | 是 | 磁盘设备 ID | s:904DE6DC-0278-4991-A6B9-6AECD0FEE886 |
| {startTime} | 是 | 开始时间 | 2025-01-01T00:00:00Z |
| {endTime} | 是 | 结束时间 | 2025-01-02T00:00:00Z |

## 如何获取 NodeId 和 DeviceId

从 OsXIOSurfaceCounterTable 获取：

```kql
cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').OsXIOSurfaceCounterTable  
| where ArmId contains "{diskArmId}"
| where PreciseTimeStamp >= datetime({startTime})
| summarize arg_max(PreciseTimeStamp, *) by ArmId
| project ArmId, NodeId, DeviceId
```

## 查询语句

### 查询 1: 检查 IO 限流

```kql
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

### 查询 2: 限流统计汇总

```kql
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

### 查询 3: 限流趋势图

```kql
cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').OsXIOThrottleCounterTable   
| where PreciseTimeStamp >= datetime({startTime}) and PreciseTimeStamp <= datetime({endTime})
| where NodeId == "{nodeId}" 
| where DeviceId contains "{deviceId}"
| project PreciseTimeStamp, 
         DeltaThrottledByIopsBucketEmpty, 
         DeltaThrottledByByteBucketEmpty,
         DeltaThrottledByQDLimit
| render timechart
```

### 查询 4: 检查突发令牌使用

```kql
cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').OsXIOThrottleCounterTable   
| where PreciseTimeStamp >= datetime({startTime}) and PreciseTimeStamp <= datetime({endTime})
| where NodeId == "{nodeId}" 
| where DeviceId contains "{deviceId}"
| project PreciseTimeStamp, BurstState, 
         BurstTokensUsedIO, BurstTokensUsedByte,
         MegaBurstCapacityIO, MegaBurstCapacityByte
| where BurstTokensUsedIO > 0 or BurstTokensUsedByte > 0
```

### 查询 5: 队列深度和字节数

```kql
cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').OsXIOThrottleCounterTable   
| where PreciseTimeStamp >= datetime({startTime}) and PreciseTimeStamp <= datetime({endTime})
| where NodeId == "{nodeId}" 
| where DeviceId contains "{deviceId}"
| project PreciseTimeStamp, CurrentQueueDepth, CurrentQueueBytes,
         CurrentBucketCountIO, CurrentBucketCountByte
| order by PreciseTimeStamp asc
```

## 结果字段说明

| 字段 | 说明 |
|------|------|
| DeltaThrottledByIopsBucketEmpty | 间隔内 IOPS 限流次数 |
| DeltaThrottledByByteBucketEmpty | 间隔内带宽限流次数 |
| DeltaThrottledByQDLimit | 间隔内队列深度限流次数 |
| DeltaThrottledByQBLimit | 间隔内队列字节限流次数 |
| BurstTokensUsedIO | 已使用的 IO 突发令牌 |
| BurstTokensUsedByte | 已使用的字节突发令牌 |
| CurrentQueueDepth | 当前队列深度 |

## 限流类型说明

| 限流类型 | 说明 | 建议 |
|---------|------|------|
| IOPS 限流 | 磁盘 IOPS 达到配置上限 | 升级磁盘类型或减少 IO 频率 |
| 带宽限流 | 磁盘吞吐量达到配置上限 | 升级磁盘类型或减少大 IO 操作 |
| QD 限流 | 队列深度达到上限 | 通常与延迟增加相关 |
| QB 限流 | 队列字节数达到上限 | 检查大 IO 操作 |

## 关联查询

- [io-performance.md](./io-performance.md) - IO 性能分析
- [io-latency.md](./io-latency.md) - IO 延迟分析
- [disk-metadata.md](./disk-metadata.md) - 检查磁盘配置
