# Disk Disk Performance & Throttling — 综合排查指南

**条目数**: 18 | **草稿融合数**: 3 | **Kusto 查询融合**: 5
**来源草稿**: mslearn-disk-benchmarking-guide.md, mslearn-disk-performance-metrics-reference.md, onenote-storage-latency-troubleshooting.md
**Kusto 引用**: io-errors.md, io-latency.md, io-performance.md, io-throttling.md, xdisk-counters.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Disk Benchmarking Guide — DiskSpd & FIO
> 来源: MS Learn (mslearn-disk-benchmarking-guide.md)

1. Benchmarking Azure managed disks using DiskSpd (Windows) and FIO (Linux) to measure IOPS, throughput, and latency under synthetic workloads.
2. - VM: Standard_D8ds_v4 with 4x Premium SSDs attached
3. - 3 disks with host caching = None → striped into "NoCacheWrites" volume
4. - 1 disk with host caching = ReadOnly → "CacheReads" volume
5. Disk with ReadOnly host caching can give IOPS higher than disk limit via cache hits. **Must warm cache before every benchmark run (and after every VM reboot).**
6. diskspd -c200G -w100 -b8K -F4 -r -o128 -W30 -d30 -Sh testfile.dat
7. - Queue depth 128, block size 8KB, 4 threads, random writes
8. - D8ds_v4 result: ~12,800 write IOPS
9. diskspd -c200G -b4K -F4 -r -o128 -W7200 -d30 -Sh testfile.dat
10. - Queue depth 128, block size 4KB, 4 threads, random reads

### Phase 2: Azure Disk Performance Metrics Reference Guide
> 来源: MS Learn (mslearn-disk-performance-metrics-reference.md)

1. | Metric | Description | Notes |
2. |--------|-------------|-------|
3. | OS/Data Disk Latency (Preview) | Average IO completion time (ms) | SCSI only, not NVMe |
4. | OS/Data Disk Queue Depth | Outstanding IO requests waiting | |
5. | OS/Data Disk Read/Write Bytes/Sec | Throughput in bytes/sec | Includes cache if enabled |
6. | OS/Data Disk Read/Write Operations/Sec | IOPS | Includes cache if enabled |
7. | Temp Disk metrics | Latency, queue depth, throughput, IOPS for temp disk | Not available for NVMe temp disks |
8. | Metric | Description |
9. |--------|-------------|
10. | Max Burst Bandwidth/IOPS (OS/Data) | Upper limit when bursting |

### Phase 3: Storage Account Latency Troubleshooting Methodology
> 来源: OneNote (onenote-storage-latency-troubleshooting.md)

1. - Determine the timeout mechanism set by the application (e.g., 5s).
2. - Identify how the application reads/writes data: SDK or REST API.
3. - Collect the SDK version and language.
4. - **E2E latency**: total time from client request to response, includes network hops.
5. - **Server latency**: time spent on the Azure Storage backend only.
6. - Reference: https://docs.microsoft.com/en-us/azure/storage/blobs/storage-blobs-latency
7. - High E2E but low server latency → network issue (client side or intermediate hops).
8. - High server latency → backend investigation needed.
9. - **Shoebox API Investigation Dashboard**: overview of storage account performance.
10. - **Account SLA Shoebox Metrics**: P99/P95/AVG latency over time.

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

#### io-latency.md
> `[工具: Kusto skill — io-latency.md]`

- **用途**
- **必要参数**
- **查询语句**
- **结果字段说明**
- **HistogramTypeEnum 说明**

```kusto
let nodeId = "{nodeId}";
let startTime = datetime({startTime});
let endTime = datetime({endTime});
cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').OsXIOSurfaceLatencyHistogramTableV2
| where PreciseTimeStamp between (startTime .. endTime)
| where NodeId == nodeId 
| where ArmId contains "{diskArmId}"
| parse BlobPath with 'XDISK:0.0.0.0:8080/' BlobName '?' *
| where HistogramTypeEnum in (1, 3)
| summarize hint.strategy=shuffle
    Bin_Count = sum(Bin_Count),
    Bin_210 = sum(Bin_210), Bin_211 = sum(Bin_211), Bin_212 = sum(Bin_212), Bin_213 = sum(Bin_213),
    Bin_214 = sum(Bin_214), Bin_215 = sum(Bin_215), Bin_216 = sum(Bin_216), Bin_217 = sum(Bin_217),
    Bin_206 = sum(Bin_206), Bin_207 = sum(Bin_207), Bin_208 = sum(Bin_208), Bin_209 = sum(Bin_209)
    by HistogramTypeEnum, BlobName
| summarize hint.strategy=shuffle
    Gt_50ms = sum(Bin_210) + sum(Bin_211) + sum(Bin_212) + sum(Bin_213) + sum(Bin_214) + sum(Bin_215) + sum(Bin_216) + sum(Bin_217),
    Gt_10ms = sum(Bin_206) + sum(Bin_207) + sum(Bin_208) + sum(Bin_209) + sum(Bin_210) + sum(Bin_211) + sum(Bin_212) + sum(Bin_213) + sum(Bin_214) + sum(Bin_215) + sum(Bin_216) + sum(Bin_217)
    by HistogramTypeEnum, BlobName
| extend HistogramType = case(HistogramTypeEnum == 1, "Read", HistogramTypeEnum == 3, "Write", "Other")
```

```kusto
cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').OsXIOSurfaceLatencyHistogramTableV2
| where PreciseTimeStamp >= datetime({startTime}) and PreciseTimeStamp <= datetime({endTime})
| where ArmId contains "{diskArmId}"
| where HistogramTypeEnum in (1, 3)
| project PreciseTimeStamp, HistogramTypeEnum, Bin_Count, Bin_Q50, Bin_Q90, Bin_Q95, Bin_Q99, Bin_Q999, Bin_Q100
| extend HistogramType = case(HistogramTypeEnum == 1, "Read", HistogramTypeEnum == 3, "Write", "Other")
| order by PreciseTimeStamp asc
```

```kusto
cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').OsXIOSurfaceLatencyHistogramTableV2
| where PreciseTimeStamp >= datetime({startTime}) and PreciseTimeStamp <= datetime({endTime})
| where ArmId contains "{diskArmId}"
| where HistogramTypeEnum in (1, 3)
| summarize 
    AvgQ50 = avg(Bin_Q50),
    AvgQ90 = avg(Bin_Q90),
    AvgQ99 = avg(Bin_Q99),
    MaxQ99 = max(Bin_Q99),
    TotalIOCount = sum(Bin_Count)
    by HistogramTypeEnum
| extend HistogramType = case(HistogramTypeEnum == 1, "Read", HistogramTypeEnum == 3, "Write", "Other")
| project HistogramType, AvgQ50, AvgQ90, AvgQ99, MaxQ99, TotalIOCount
```

#### io-performance.md
> `[工具: Kusto skill — io-performance.md]`

- **用途**
- **必要参数**
- **查询语句**
- **结果字段说明**
- **缓存策略说明**

```kusto
cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').OsXIOSurfaceCounterTable  
| where ArmId contains "{diskArmId}"
| where PreciseTimeStamp >= datetime({startTime}) and PreciseTimeStamp <= datetime({endTime})  
| project PreciseTimeStamp, CachePolicy, IOPS, ReadIOPS, WriteIOPS, MBPS, ReadMBPS, WriteMBPS, 
         QD, TotalGBRead, TotalIOInGB, TotalIOCount, CacheSizeinGB, CacheUsagePct, 
         ArmId, DeviceId, NodeId
| order by PreciseTimeStamp asc
```

```kusto
cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').OsXIOSurfaceCounterTable  
| where ArmId contains "{diskArmId}" 
| where PreciseTimeStamp >= datetime({startTime}) and PreciseTimeStamp <= datetime({endTime})  
| project PreciseTimeStamp, IOPS, MBPS, QD 
| render timechart
```

```kusto
cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').OsXIOSurfaceCounterTable  
| where ArmId contains "{diskArmId}" 
| where PreciseTimeStamp >= datetime({startTime}) and PreciseTimeStamp <= datetime({endTime})  
| project PreciseTimeStamp, ReadIOPS, WriteIOPS, ReadMBPS, WriteMBPS 
| render timechart
```

#### io-throttling.md
> `[工具: Kusto skill — io-throttling.md]`

- **用途**
- **必要参数**
- **如何获取 NodeId 和 DeviceId**
- **查询语句**
- **结果字段说明**

```kusto
cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').OsXIOSurfaceCounterTable  
| where ArmId contains "{diskArmId}"
| where PreciseTimeStamp >= datetime({startTime})
| summarize arg_max(PreciseTimeStamp, *) by ArmId
| project ArmId, NodeId, DeviceId
```

```kusto
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

```kusto
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
| 1 | Standard storage billing higher than expected - customer charged for full disk size even after deleting data | Azure thin-provisioning: deleted data marks blocks as free in file system but does not notify backen | Linux: use discard mount option or run fstrim manually/crontab. For md RAID on RHEL/CentOS 7.x, set raid0.devices_discar | 🟢 9 | [MCVKB] |
| 2 | TRIM/fstrim does not release space on Windows with dynamic disks; defrag RETRIM fails | Defrag RETRIM checks if storage supports TRIM query before performing, but dynamic disks do not supp | Workaround: create large file to fill volume (fsutil file createnew D:\bigfile.bin <size>; fsutil file seteof D:\bigfile | 🟢 9 | [MCVKB] |
| 3 | Azure VM data disk performance drops dramatically (P30 to 0.11M/s) when temporary disk under heavy IO | VM-level cached IO throttling: temp disk shares cached throughput limit with cached data disks. Heav | 1) Disable disk cache on mission-critical disks when temp disk used. 2) Ensure total cached throughput < VM cached max.  | 🟢 9 | [MCVKB] |
| 4 | Azure Premium disk sync IO only achieves ~500 IOPS despite P30 supporting 5000 IOPS | Sync IO limited by disk latency (~2ms/IO), not IOPS limit. Single outstanding sync IO = 1000ms/2ms = | 1) Increase outstanding IOs/queue depth (10 needed to fully utilize P30). 2) Use async IO where possible. 3) For SQL: tu | 🟢 9 | [MCVKB] |
| 5 | Premium SSD disk I/O latency spikes to 1800ms (await), IOPS appears within disk limits but throughput hits VM-level cap | VM-level uncached disk throughput throttling. Application writes large I/O blocks (~500KB) at 1300-1 | 1) Resize VM to support higher throughput (e.g. DS15_v2 for ~1000MBps). 2) Use disk striping (e.g. 2x P60) to distribute | 🟢 9 | [MCVKB] |
| 6 | Managed disk (Standard SSD) performance significantly worse in China East vs China East 2 with same VM size | VM in CE on RDSSD node (AllDisksInStripe) - cache policy forced to None. VM in CE2 on AllDisksAbc no | Use premium-enabled VM SKU (e.g. DS15_v2) to land on AllDisksAbc node. Or change region. Kusto: LogNodeSnapshot.diskConf | 🟢 9 | [MCVKB] |
| 7 | Standard disk VM hitting 500 IOPS limit causing high CPU load and kworker IO wait; application performance degrades at r | Standard managed disk has 500 IOPS limit per disk. Application (open-falcon Graph) receives too many | 1) Check VM disk metrics to verify disk IOPS hitting 500 limit. 2) Upgrade disk tier (Standard to Premium) or resize dis | 🟢 9 | [MCVKB] |
| 8 | Azure Premium SSD Shared Disk experiencing throttling or performance issues requiring PG escalation | Shared disk backend storage issues require Xstore team investigation. Performance throttling may occ | ICM escalation path: Xstore/Triage (template: k26O2f). Include blob URL of impacted disk(s). Alternative path: Support - | 🟢 8.5 | [MCVKB] |
| 9 | Disk performance degradation: high latency, slow IO. VM Cached/Uncached IOPS Consumed Percentage or Data Disk IOPS/Bandw | Workload exceeds the IOPS or throughput limits of the VM size (VM-level throttling) or the provision | For VM-level throttling: resize VM to a larger size with higher IOPS/bandwidth caps (e.g., memory-optimized Ebdsv5/M-ser | 🔵 7.5 | [MS Learn] |
| 10 | Disk performance drops to baseline after ~30 minutes of high IO. Credit-based bursting credits exhausted. Burst metrics  | Credit-based bursting (enabled by default on Premium SSD ≤512 GiB and Standard SSD ≤1024 GiB) allows | 1) For sustained high IO: upgrade disk tier (e.g., P20→P30) for higher baseline IOPS. 2) For Premium SSD >512 GiB: enabl | 🔵 7.5 | [MS Learn] |
| 11 | Cannot enable Performance Plus on an existing disk. Feature is greyed out or API returns error. Performance Plus only av | Performance Plus (which increases IOPS/throughput limits for Premium SSD, Standard SSD, and Standard | Workaround: 1) Create a snapshot of the existing disk. 2) Create a new disk from the snapshot with Performance Plus enab | 🔵 7.5 | [MS Learn] |
| 12 | Unexpected high disk read latency (lasting hours to ~24h) after performing control plane operations on managed disks — s | Control plane operations may trigger background data copy that moves the disk between storage locati | Plan control plane operations during maintenance windows. No way to avoid the background copy — it's platform behavior.  | 🔵 7.5 | [MS Learn] |
| 13 | Ultra Disk configured with high IOPS (e.g., 40,000) but VM only achieves much lower IOPS (e.g., 12,800). Disk not reachi | VM-level IO throttle limits total IOPS a VM can drive, independent of individual disk limits. The VM | 1) Check VM size uncached IOPS limit to ensure >= total IOPS needed across all disks. 2) Upgrade to larger VM size suppo | 🔵 7.5 | [MS Learn] |
| 14 | Cannot enable on-demand disk bursting on Premium SSD. Operation fails or option not available. Error when trying to enab | On-demand bursting constraints: 1) Cannot enable on Premium SSD <= 512 GiB (always credit-based). 2) | 1) Ensure disk size > 512 GiB. 2) Stop/deallocate VM or detach disk before enabling. 3) Portal: Disk > Configuration > E | 🔵 7.5 | [MS Learn] |
| 15 | PhysicalDisk and LogicalDisk performance counters missing in Perfmon. Error: 'Unable to add these counters: \PhysicalDis | 'Disable Performance Counters' registry value was set to 1, disabling disk performance counters. | 1. Set 'Disable Performance Counters' registry value to 0. 2. Stop and restart Performance Logs and Alerts service. 3. S | 🔵 7.5 | [KB] |
| 16 | VSS shadow copy provider times out during backup: 'The shadow copy provider timed out while holding writes to the volume | Excessive IOPS activity on the disk during backup window causes VSS shadow copy provider to time out | 1) Distribute IO load across multiple VM disks. 2) Schedule backup during off-peak hours. 3) Upgrade to higher IOPS disk | 🔵 7.0 | [MS Learn] |
| 17 | Ultra Disk deployment on VMSS with Uniform orchestration fails. Setting IOPS or throughput values that exceed the deploy | During deployment of Ultra Disks with Uniform VMSS, different (stricter) formulas apply: max IOPS =  | During initial VMSS Uniform deployment, set conservative IOPS/throughput within the deployment formulas (max 300 IOPS/Gi | 🔵 6.0 | [MS Learn] |
| 18 | Write Accelerator cannot be enabled on non-M-series VM. Feature unavailable or deployment fails. | Write Accelerator M-series only. Cache must be None/ReadOnly. Only IO<=64KiB accelerated. Snapshots  | Verify M-series VM. Set cache None/ReadOnly. For non-M-series use Ultra Disk for low-latency writes. | 🔵 6.0 | [MS Learn] |
