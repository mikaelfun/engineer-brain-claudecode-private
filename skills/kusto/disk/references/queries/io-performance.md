---
name: io-performance
description: 磁盘 IO 性能分析查询
tables:
  - OsXIOSurfaceCounterTable
parameters:
  - name: diskArmId
    required: true
    description: 磁盘 ARM 资源 ID
  - name: startTime
    required: true
    description: 开始时间
  - name: endTime
    required: true
    description: 结束时间
---

# IO 性能分析查询

## 用途

分析磁盘 IO 性能指标，包括 IOPS、MBPS、队列深度、缓存使用率等。

## 必要参数

| 参数 | 必填 | 说明 | 示例 |
|------|------|------|------|
| {diskArmId} | 是 | 磁盘 ARM 资源 ID | /subscriptions/.../disks/mydisk |
| {startTime} | 是 | 开始时间 | 2025-01-01T00:00:00Z |
| {endTime} | 是 | 结束时间 | 2025-01-02T00:00:00Z |

## 查询语句

### 查询 1: 基本 IO 性能指标

```kql
cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').OsXIOSurfaceCounterTable  
| where ArmId contains "{diskArmId}"
| where PreciseTimeStamp >= datetime({startTime}) and PreciseTimeStamp <= datetime({endTime})  
| project PreciseTimeStamp, CachePolicy, IOPS, ReadIOPS, WriteIOPS, MBPS, ReadMBPS, WriteMBPS, 
         QD, TotalGBRead, TotalIOInGB, TotalIOCount, CacheSizeinGB, CacheUsagePct, 
         ArmId, DeviceId, NodeId
| order by PreciseTimeStamp asc
```

### 查询 2: IO 性能趋势图

```kql
cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').OsXIOSurfaceCounterTable  
| where ArmId contains "{diskArmId}" 
| where PreciseTimeStamp >= datetime({startTime}) and PreciseTimeStamp <= datetime({endTime})  
| project PreciseTimeStamp, IOPS, MBPS, QD 
| render timechart
```

### 查询 3: 读写分离趋势图

```kql
cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').OsXIOSurfaceCounterTable  
| where ArmId contains "{diskArmId}" 
| where PreciseTimeStamp >= datetime({startTime}) and PreciseTimeStamp <= datetime({endTime})  
| project PreciseTimeStamp, ReadIOPS, WriteIOPS, ReadMBPS, WriteMBPS 
| render timechart
```

### 查询 4: 性能统计摘要

```kql
cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').OsXIOSurfaceCounterTable  
| where ArmId contains "{diskArmId}"
| where PreciseTimeStamp >= datetime({startTime}) and PreciseTimeStamp <= datetime({endTime})
| summarize 
    AvgIOPS = avg(IOPS),
    MaxIOPS = max(IOPS),
    AvgMBPS = avg(MBPS),
    MaxMBPS = max(MBPS),
    AvgQD = avg(QD),
    MaxQD = max(QD),
    TotalReadGB = sum(TotalGBRead),
    TotalIOGB = sum(TotalIOInGB),
    AvgCacheUsagePct = avg(CacheUsagePct)
```

### 查询 5: 检查限流情况

```kql
cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').OsXIOSurfaceCounterTable  
| where ArmId contains "{diskArmId}"
| where PreciseTimeStamp >= datetime({startTime}) and PreciseTimeStamp <= datetime({endTime})
| where DeltaThrottled > 0
| project PreciseTimeStamp, IOPS, MBPS, DeltaThrottled, TotalThrottled
| order by PreciseTimeStamp asc
```

### 查询 6: 获取 NodeId 和 DeviceId

```kql
// 用于获取 NodeId 和 DeviceId，供后续限流查询使用
cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').OsXIOSurfaceCounterTable  
| where ArmId contains "{diskArmId}"
| where PreciseTimeStamp >= datetime({startTime}) and PreciseTimeStamp <= datetime({endTime})
| summarize arg_max(PreciseTimeStamp, *) by ArmId
| project ArmId, NodeId, DeviceId, Cluster
```

## 结果字段说明

| 字段 | 说明 |
|------|------|
| IOPS | 当前 IOPS |
| ReadIOPS | 读 IOPS |
| WriteIOPS | 写 IOPS |
| MBPS | 吞吐量 (MB/s) |
| QD | 队列深度 |
| CacheUsagePct | 缓存使用率 (%) |
| TotalGBRead | 累计读取 (GB) |
| TotalIOInGB | 累计 IO (GB) |
| NodeId | 主机节点 ID |
| DeviceId | 磁盘设备 ID |

## 缓存策略说明

| CachePolicy | 说明 |
|-------------|------|
| 0 | None - 无缓存 |
| 1 | ReadOnly - 只读缓存 |
| 2 | ReadWrite - 读写缓存 |

## 关联查询

- [io-throttling.md](./io-throttling.md) - IO 限流检查
- [io-latency.md](./io-latency.md) - IO 延迟分析
- [xdisk-counters.md](./xdisk-counters.md) - xStore 层指标
