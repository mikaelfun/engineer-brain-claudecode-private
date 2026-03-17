---
name: OsXIOSurfaceCounterTable
database: Fa
cluster: https://azcore.chinanorth3.kusto.chinacloudapi.cn
description: VM 磁盘 IO 性能计数器，记录 IOPS、MBPS、队列深度等性能指标
status: active
---

# OsXIOSurfaceCounterTable

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azcore.chinanorth3.kusto.chinacloudapi.cn |
| 数据库 | Fa |
| 状态 | ✅ 可用 |

## 用途

记录 VM 磁盘的 IO 性能计数器数据，包括 IOPS、MBPS、队列深度、缓存使用等指标。每 5 分钟记录一次，用于性能分析和故障排查。

## 关键字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| PreciseTimeStamp | datetime | 精确时间戳 | 2025-01-01T00:00:00Z |
| NodeId | string | 主机节点 ID | guid |
| DeviceId | string | 磁盘设备 ID | s:904DE6DC-... |
| ArmId | string | 磁盘 ARM 资源 ID | /subscriptions/.../disks/mydisk |
| BlobPath | string | Blob 路径 | XDISK:0.0.0.0:8080/... |
| StorageTenant | string | 存储租户 | md-xxx |
| Cluster | string | 集群名称 | 集群标识 |
| CachePolicy | long | 缓存策略 | 0=None, 1=ReadOnly, 2=ReadWrite |
| IsXIOdisk | long | 是否为 XIO 磁盘 | 0, 1 |
| IOPS | real | 当前 IOPS | 2500.5 |
| ReadIOPS | real | 读 IOPS | 1500.0 |
| WriteIOPS | real | 写 IOPS | 1000.5 |
| MBPS | real | 当前吞吐量 (MB/s) | 125.5 |
| ReadMBPS | real | 读吞吐量 (MB/s) | 75.0 |
| WriteMBPS | real | 写吞吐量 (MB/s) | 50.5 |
| QD | real | 队列深度 | 32.0 |
| AvgIOSizeInBytes | long | 平均 IO 大小 | 65536 |
| TotalGBRead | real | 累计读取 (GB) | 1024.5 |
| TotalIOInGB | real | 累计 IO (GB) | 2048.0 |
| TotalIOCount | long | 累计 IO 次数 | 1000000 |
| TotalMisalignedReads | long | 未对齐读取次数 | 100 |
| TotalMisalignedWrites | long | 未对齐写入次数 | 50 |
| CacheSizeinGB | real | 缓存大小 (GB) | 128.0 |
| CacheUsagePct | real | 缓存使用率 (%) | 75.5 |
| TotalWorkItemTimeInSec | real | 累计工作项时间 (秒) | 1000.0 |
| TotalThrottled | long | 累计限流次数 | 500 |
| DeltaThrottled | long | 间隔内限流次数 | 10 |

## 常用筛选字段

- `ArmId` - 按磁盘 ARM ID 筛选
- `NodeId` - 按节点 ID 筛选
- `DeviceId` - 按设备 ID 筛选
- `StorageTenant` - 按存储租户筛选

## 缓存策略说明

| CachePolicy 值 | 说明 |
|----------------|------|
| 0 | None - 无缓存 |
| 1 | ReadOnly - 只读缓存 |
| 2 | ReadWrite - 读写缓存 |

## 典型应用场景

1. **IO 性能分析**: 查看 IOPS、MBPS、队列深度趋势
2. **性能瓶颈诊断**: 识别 IO 限流和高延迟
3. **缓存效率分析**: 检查缓存使用率和命中情况
4. **性能趋势图**: 绘制 IO 性能时间序列图表

## 示例查询

```kql
// 检查指定磁盘的 IO 性能
cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').OsXIOSurfaceCounterTable  
| where ArmId contains "{diskArmId}"
| where PreciseTimeStamp >= datetime({startTime}) and PreciseTimeStamp <= datetime({endTime})  
| project PreciseTimeStamp, CachePolicy, IOPS, MBPS, QD, TotalGBRead, TotalIOInGB, 
         TotalIOCount, CacheSizeinGB, CacheUsagePct, TotalMisalignedReads, 
         TotalWorkItemTimeInSec, ArmId, DeviceId, NodeId
| order by PreciseTimeStamp asc
```

```kql
// 绘制 IOPS/MBPS 趋势图
cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').OsXIOSurfaceCounterTable  
| where ArmId contains "{diskArmId}" 
| where PreciseTimeStamp >= datetime({startTime}) and PreciseTimeStamp <= datetime({endTime})  
| project PreciseTimeStamp, IOPS, MBPS, TotalGBRead, TotalIOInGB, QD 
| render timechart
```

```kql
// 检查限流情况
cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').OsXIOSurfaceCounterTable  
| where ArmId contains "{diskArmId}"
| where PreciseTimeStamp >= datetime({startTime}) and PreciseTimeStamp <= datetime({endTime})
| where DeltaThrottled > 0
| project PreciseTimeStamp, IOPS, MBPS, DeltaThrottled, TotalThrottled
| order by PreciseTimeStamp asc
```

## 关联表

- [OsXIOThrottleCounterTable.md](./OsXIOThrottleCounterTable.md) - 限流详细计数器
- [OsXIOSurfaceLatencyHistogramTableV2.md](./OsXIOSurfaceLatencyHistogramTableV2.md) - 延迟直方图
- [OsXIOXdiskCounterTable.md](./OsXIOXdiskCounterTable.md) - xStore 层指标
- [Disk.md](./Disk.md) - 磁盘元数据

## 注意事项

- 数据每 5 分钟记录一次
- `DeviceId` 用于关联 OsXIOThrottleCounterTable
- `NodeId` 和 `DeviceId` 可从此表获取后用于其他查询
- 使用 `render timechart` 可视化性能趋势
- `TotalMisalignedReads/Writes` 较高可能影响性能
