# Disk IaaS Disk Failure (Event 17) — 综合排查指南

**条目数**: 2 | **草稿融合数**: 0 | **Kusto 查询融合**: 2
**Kusto 引用**: io-errors.md, xdisk-counters.md
**生成日期**: 2026-04-07

---

## 排查流程

### Kusto 查询模板

#### io-errors.md
> `[工具: Kusto skill — io-errors.md]`

- **用途**
- **必要参数**
- **查询语句**
- **结果字段说明**
- **常见 EventId**

```kusto
let nodeId = "{nodeId}";
let startTime = datetime({startTime});
let endTime = datetime({endTime});
cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').VhdDiskEtwEventTable
| where PreciseTimeStamp between (startTime .. endTime) and NodeId == nodeId
// | where EventId == 1  // 1 表示 IO 超时
| parse EventMessage with * 'RequestOpcode:' RequestOpcode '.' *
| parse EventMessage with * 'TransportType:' TransportType '.' *
| parse EventMessage with * 'NTSTATUS:' NTSTATUS '.' *
| parse EventMessage with * 'blobpath: ' Blobpath '.' *
| parse EventMessage with * 'HttpResponseStatusCode:' HttpResponseStatusCode '.' *
| parse EventMessage with * 'SubStatusErrorCode:' SubStatusErrorCode '.' *
| summarize count() by Cluster, Blobpath, TransportType, RequestOpcode, NTSTATUS, HttpResponseStatusCode, SubStatusErrorCode
```

```kusto
cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').VhdDiskEtwEventTable
| where PreciseTimeStamp >= datetime({startTime}) and PreciseTimeStamp <= datetime({endTime})
| where NodeId == "{nodeId}"
| where EventId == 1  // IO 超时
| project PreciseTimeStamp, Level, ProviderName, EventId, TaskName, EventMessage
| order by PreciseTimeStamp asc
```

```kusto
let nodeId = "{nodeId}";
let startTime = datetime({startTime});
let endTime = datetime({endTime});
cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').OsVhddiskEventTable
| where PreciseTimeStamp between (startTime .. endTime)
| where NodeId == nodeId
| where ParamStr1 contains "{diskBlobPath}"
| extend ErrorCode = strcat(substring(ParamBinary1, 46, 2), substring(ParamBinary1, 44, 2), substring(ParamBinary1, 42, 2), substring(ParamBinary1, 40, 2)),
    ClientRequestId = strcat(substring(ParamBinary1, 94, 2), substring(ParamBinary1, 92, 2), substring(ParamBinary1, 90, 2), substring(ParamBinary1, 88, 2), substring(ParamBinary1, 86, 2), substring(ParamBinary1, 84, 2), substring(ParamBinary1, 82, 2), substring(ParamBinary1, 80, 2)),
    LastStatus = strcat(substring(ParamBinary1, 150, 2), substring(ParamBinary1, 148, 2), substring(ParamBinary1, 146, 2), substring(ParamBinary1, 144, 2)),
    RecvStatus = strcat(substring(ParamBinary1, 190, 2), substring(ParamBinary1, 188, 2), substring(ParamBinary1, 186, 2), substring(ParamBinary1, 184, 2)),
    HttpCode = strcat(substring(ParamBinary1, 198, 2), substring(ParamBinary1, 196, 2), substring(ParamBinary1, 194, 2), substring(ParamBinary1, 192, 2)),
    Retries = substring(ParamBinary1, 200, 2)
| project PreciseTimeStamp, EventId, ParamStr1, LastStatus, ErrorCode, RecvStatus, HttpCode, ClientRequestId, Retries
| order by PreciseTimeStamp asc
```

#### xdisk-counters.md
> `[工具: Kusto skill — xdisk-counters.md]`

- **用途**
- **必要参数**
- **查询语句**
- **结果字段说明**
- **传输协议说明**

```kusto
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

```kusto
cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').OsXIOXdiskCounterTable  
| where PreciseTimeStamp >= datetime({startTime}) and PreciseTimeStamp <= datetime({endTime})
| where ArmId contains "{diskArmId}"
| project PreciseTimeStamp, 
         AvgRxLatInms, AvgTxLatInms,
         AvgRdmaRxLatInms, AvgRdmaTxLatInms,
         AvgStcpRxLatInms, AvgStcpTxLatInms
| order by PreciseTimeStamp asc
```

```kusto
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

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | VM experiences IaaS Disk Failure (Event 17) causing unexpected restart | Storage service availability drop - VM host disk driver cannot write data to storage for 2 minutes,  | 1) Query VMA in vmainsight Kusto for TriageCategory. 2) Query XHealth_DiskFailureXStoreTriage in xlivesite Kusto. 3) Run | 🟢 9 | [MCVKB] |
| 2 | VM reboots repeatedly with E17 IaaSxStorageOutage; VhdDiskPrt errors XDiskBlobNotFound/XDiskContainerNotFound | Managed disk backend blob deleted or container not found at xstore layer. FASTPATH_RESPONSE_TYPE_BUS | Run GetRDOSE17Triage on rdosmc.kusto.chinacloudapi.cn/rdos. Check XPortal AutoTriage. If 8170012F/8170012E dominant, esc | 🟢 9 | [MCVKB] |
