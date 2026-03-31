---
name: OsXIOXdiskCounterTable
database: Fa
cluster: https://azcore.chinanorth3.kusto.chinacloudapi.cn
description: xStore 层磁盘 IO 指标，包括 RDMA 和 STCP 网络传输
status: active
---

# OsXIOXdiskCounterTable

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azcore.chinanorth3.kusto.chinacloudapi.cn |
| 数据库 | Fa |
| 状态 | ✅ 可用 |

## 用途

记录磁盘在 xStore 层面的 IO 指标，包括 RDMA 和 STCP 两种网络传输协议的性能数据。用于分析存储后端性能和网络层问题。

## 关键字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| PreciseTimeStamp | datetime | 精确时间戳 | 2025-01-01T00:00:00Z |
| NodeId | string | 主机节点 ID | guid |
| DeviceId | string | 磁盘设备 ID | s:904DE6DC-... |
| ArmId | string | 磁盘 ARM 资源 ID | /subscriptions/.../disks/mydisk |
| BlobPath | string | Blob 路径 | XDISK:0.0.0.0:8080/... |
| StorageTenant | string | 存储租户 | md-xxx |
| CachePolicy | long | 缓存策略 | 0, 1, 2 |
| IsXIOdisk | long | 是否为 XIO 磁盘 | 0, 1 |

### IOPS 相关字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| XIOPS | real | XIO 层 IOPS |
| XReadIOPS | real | XIO 层读 IOPS |
| XWriteIOPS | real | XIO 层写 IOPS |
| XQD | real | XIO 层队列深度 |
| NWIOPS | real | 网络层 IOPS |
| NWReadIOPS | real | 网络层读 IOPS |
| NWWriteIOPS | real | 网络层写 IOPS |
| NWMBPS | real | 网络层吞吐量 (MB/s) |
| NWReadMBPS | real | 网络层读吞吐量 |
| NWWriteMBPS | real | 网络层写吞吐量 |

### RDMA 传输字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| RdmaIOPS | real | RDMA IOPS |
| RdmaReadIOPS | real | RDMA 读 IOPS |
| RdmaWriteIOPS | real | RDMA 写 IOPS |
| RdmaNWMBPS | real | RDMA 吞吐量 |
| RdmaNWReadMBPS | real | RDMA 读吞吐量 |
| RdmaNWWriteMBPS | real | RDMA 写吞吐量 |
| AvgRdmaRxLatInms | real | RDMA 平均接收延迟 (ms) |
| AvgRdmaTxLatInms | real | RDMA 平均发送延迟 (ms) |
| CurAvgRdmaRxLatInms | real | RDMA 当前平均接收延迟 |
| CurAvgRdmaTxLatInms | real | RDMA 当前平均发送延迟 |

### STCP 传输字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| StcpIOPS | real | STCP IOPS |
| StcpReadIOPS | real | STCP 读 IOPS |
| StcpWriteIOPS | real | STCP 写 IOPS |
| StcpNWMBPS | real | STCP 吞吐量 |
| StcpNWReadMBPS | real | STCP 读吞吐量 |
| StcpNWWriteMBPS | real | STCP 写吞吐量 |
| AvgStcpRxLatInms | real | STCP 平均接收延迟 (ms) |
| AvgStcpTxLatInms | real | STCP 平均发送延迟 (ms) |
| CurAvgStcpRxLatInms | real | STCP 当前平均接收延迟 |
| CurAvgStcpTxLatInms | real | STCP 当前平均发送延迟 |

### 延迟字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| AvgRxLatInms | real | 平均接收延迟 (ms) |
| AvgTxLatInms | real | 平均发送延迟 (ms) |
| CurAvgRxLatInms | real | 当前平均接收延迟 |
| CurAvgTxLatInms | real | 当前平均发送延迟 |

## 常用筛选字段

- `ArmId` - 按磁盘 ARM ID 筛选
- `NodeId` - 按节点 ID 筛选

## 典型应用场景

1. **网络层性能分析**: 分析 RDMA 和 STCP 的传输性能
2. **延迟分析**: 检查发送和接收延迟
3. **传输协议对比**: 比较 RDMA 和 STCP 的性能差异
4. **存储后端诊断**: 识别存储后端性能问题

## 示例查询

```kql
// 检查 xStore 层面的 IO 指标
let armId = "{diskArmId}";
let startTime = datetime({startTime});
let endTime = datetime({endTime});
cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').OsXIOXdiskCounterTable  
| where PreciseTimeStamp between (startTime .. endTime)
| where ArmId contains armId
| project PreciseTimeStamp, ArmId, BlobPath, DeviceId, CachePolicy, IsXIOdisk, NodeId,
    // IOPS 相关
    XIOPS, XReadIOPS, XWriteIOPS, XQD, NWIOPS, NWReadIOPS, NWWriteIOPS, NWMBPS, NWReadMBPS, NWWriteMBPS,
    NWAvgIOSizeInBytes, NWAvgReadIOSizeInBytes, NWAvgWriteIOSizeInBytes,
    RdmaIOPS, RdmaReadIOPS, RdmaWriteIOPS, RdmaNWMBPS, RdmaNWReadMBPS, RdmaNWWriteMBPS,
    StcpIOPS, StcpReadIOPS, StcpWriteIOPS, StcpNWMBPS, StcpNWReadMBPS, StcpNWWriteMBPS,
    // 延迟
    AvgRxLatInms, AvgTxLatInms, CurAvgRxLatInms, CurAvgTxLatInms,
    AvgRdmaRxLatInms, AvgRdmaTxLatInms, AvgStcpRxLatInms, AvgStcpTxLatInms,
    CurAvgRdmaRxLatInms, CurAvgRdmaTxLatInms, CurAvgStcpRxLatInms, CurAvgStcpTxLatInms
| order by PreciseTimeStamp asc
```

```kql
// 检查网络层延迟
cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').OsXIOXdiskCounterTable  
| where PreciseTimeStamp >= datetime({startTime}) and PreciseTimeStamp <= datetime({endTime})
| where ArmId contains "{diskArmId}"
| project PreciseTimeStamp, 
         AvgRxLatInms, AvgTxLatInms,
         AvgRdmaRxLatInms, AvgRdmaTxLatInms,
         AvgStcpRxLatInms, AvgStcpTxLatInms
| order by PreciseTimeStamp asc
```

## 关联表

- [OsXIOSurfaceCounterTable.md](./OsXIOSurfaceCounterTable.md) - Surface 层 IO 计数器
- [OsXIOSurfaceLatencyHistogramTableV2.md](./OsXIOSurfaceLatencyHistogramTableV2.md) - 延迟直方图
- [VhdDiskEtwEventTable.md](./VhdDiskEtwEventTable.md) - VHD 错误事件

## 注意事项

- 数据每 5 分钟记录一次
- RDMA 通常比 STCP 有更低的延迟
- 高网络延迟可能表示存储后端或网络问题
- 结合 OsXIOSurfaceLatencyHistogramTableV2 分析延迟分布
