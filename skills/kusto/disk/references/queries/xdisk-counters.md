---
name: xdisk-counters
description: xStore 层磁盘 IO 指标查询
tables:
  - OsXIOXdiskCounterTable
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

# xStore 层 IO 指标查询

## 用途

分析磁盘在 xStore 层的 IO 性能，包括 RDMA 和 STCP 两种传输协议的指标和延迟。

## 必要参数

| 参数 | 必填 | 说明 | 示例 |
|------|------|------|------|
| {diskArmId} | 是 | 磁盘 ARM 资源 ID | /subscriptions/.../disks/mydisk |
| {startTime} | 是 | 开始时间 | 2025-01-01T00:00:00Z |
| {endTime} | 是 | 结束时间 | 2025-01-02T00:00:00Z |

## 查询语句

### 查询 1: 完整 xStore IO 指标

```kql
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

### 查询 2: 网络层延迟分析

```kql
cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').OsXIOXdiskCounterTable  
| where PreciseTimeStamp >= datetime({startTime}) and PreciseTimeStamp <= datetime({endTime})
| where ArmId contains "{diskArmId}"
| project PreciseTimeStamp, 
         AvgRxLatInms, AvgTxLatInms,
         AvgRdmaRxLatInms, AvgRdmaTxLatInms,
         AvgStcpRxLatInms, AvgStcpTxLatInms
| order by PreciseTimeStamp asc
```

### 查询 3: RDMA vs STCP 性能对比

```kql
cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').OsXIOXdiskCounterTable  
| where PreciseTimeStamp >= datetime({startTime}) and PreciseTimeStamp <= datetime({endTime})
| where ArmId contains "{diskArmId}"
| summarize 
    AvgRdmaIOPS = avg(RdmaIOPS),
    AvgStcpIOPS = avg(StcpIOPS),
    AvgRdmaMBPS = avg(RdmaNWMBPS),
    AvgStcpMBPS = avg(StcpNWMBPS),
    AvgRdmaLatency = avg(AvgRdmaRxLatInms),
    AvgStcpLatency = avg(AvgStcpRxLatInms)
```

### 查询 4: 延迟趋势图

```kql
cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').OsXIOXdiskCounterTable  
| where PreciseTimeStamp >= datetime({startTime}) and PreciseTimeStamp <= datetime({endTime})
| where ArmId contains "{diskArmId}"
| project PreciseTimeStamp, AvgRxLatInms, AvgTxLatInms, AvgRdmaRxLatInms, AvgStcpRxLatInms
| render timechart
```

### 查询 5: 错误和重试统计

```kql
cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').OsXIOXdiskCounterTable  
| where PreciseTimeStamp >= datetime({startTime}) and PreciseTimeStamp <= datetime({endTime})
| where ArmId contains "{diskArmId}"
| summarize 
    TotalFailReqCnt = max(TotXFailReqCnt),
    TotalRetryCnt = max(TotXRetryCnt),
    Total500Cnt = max(Tot500Cnt),
    Total503Cnt = max(Tot503Cnt),
    TotalRecvTimeout = max(TotRecvTimeoutCnt),
    TotalSendTimeout = max(TotSendTimeoutCnt)
```

## 结果字段说明

### IOPS 相关

| 字段 | 说明 |
|------|------|
| XIOPS | XIO 层总 IOPS |
| RdmaIOPS | RDMA 协议 IOPS |
| StcpIOPS | STCP 协议 IOPS |
| NWMBPS | 网络层吞吐量 |

### 延迟相关

| 字段 | 说明 |
|------|------|
| AvgRxLatInms | 平均接收延迟 (ms) |
| AvgTxLatInms | 平均发送延迟 (ms) |
| AvgRdmaRxLatInms | RDMA 接收延迟 |
| AvgStcpRxLatInms | STCP 接收延迟 |

## 传输协议说明

| 协议 | 说明 |
|------|------|
| RDMA | Remote Direct Memory Access，低延迟高性能 |
| STCP | Storage TCP，基于 TCP 的存储协议 |

## 关联查询

- [io-performance.md](./io-performance.md) - Surface 层 IO 性能
- [io-latency.md](./io-latency.md) - IO 延迟分布
- [io-errors.md](./io-errors.md) - IO 错误详情
