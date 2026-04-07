---
source: onenote
sourceRef: "MCVKB/VM+SCIM/=======12. ASR=======/12.3, 12.4, 12.7"
importDate: "2026-04-04"
type: reference-guide
relatedIds: ["vm-onenote-059","vm-onenote-060","vm-onenote-063"]
---

# ASR Kusto 诊断参考：端点 + 操作查询 + 磁盘 Churn 分析

## Kusto 端点（Mooncake）

| 用途 | 端点 | 权限申请 |
|------|------|---------|
| ASR 日志（旧） | asrclusmc.kusto.chinacloudapi.cn:443 | MyAccess: 13982 |
| ASR 日志（新，Aug 2022） | asradxclusmc.chinanorth2.kusto.chinacloudapi.cn | MyAccess: 13982 |
| MAB/Backup 日志 | mabprodmc.kusto.chinacloudapi.cn:443 | MyAccess: 13982 |

> ⚠️ 12.4 提到项目 ID 已更新为 **13981**，12.3/12.5 仍说 13982，请申请前核实当前有效 ID。

权限申请方式：进入 [https://myaccess](https://myaccess)，搜索 `13982`，点击 Add 并填写理由提交。

---

## 操作历史查询

### 1. 查询某订阅的近期 ASR 操作（无 Portal Job ID 时）

```kusto
// 连接 asradxclusmc.chinanorth2 → database: asrdb1
SRSOperationEvent
| where SubscriptionId == "<subID>"
  and ScenarioName contains "reg"   // 也可用 "enable", "failover" 等
| top 20 by TIMESTAMP desc nulls last
| project TIMESTAMP, ClientRequestId, ActivityId, ScenarioName, Message, State, StampName, ResourceId
```

### 2. 根据 ClientRequestId / Job ID 查详细日志

```kusto
SRSDataEvent
| where ClientRequestId == "<Job ID from portal or step 1>"
| top 1000 by TIMESTAMP desc nulls last
| project TIMESTAMP, ClientRequestId, Message, StampName, ResourceId

// 只看 Error/Warning 级别（3=warning, 2=error, 1=fatal）
SRSDataEvent
| where ClientRequestId == "<jobId>" and Level < 4
| top 1000 by TIMESTAMP desc nulls last
| project TIMESTAMP, ClientRequestId, Message, StampName

// 或直接看 Error 表
SRSErrorEvent
| where ClientRequestId == "<jobId>"
| project TIMESTAMP, Message, StampName
```

### 3. VMM 注册 + VM 保护遥测

```kusto
// VMM 注册信息
TelemetryPerVMMInfo
| where SubscriptionId == "<subID>"
| summarize max(TIMESTAMP) by VMMId, NoOfVMs, NoOfProtectedVMs, NoOfHosts

// VM 保护状态（含托管磁盘标志）
TelemetryPEToProvider
| where SubscriptionId == "<subID>" and PrimaryVmmId == "<VMMId>"
| extend VmInfo = parse_json(JsonSerializedAvmdInfo)
| summarize max(PreciseTimeStamp) by VmName, ProtectedItemArmId,
    IsManagedDiskVm = toupper(tostring(VmInfo.IsManagedDiskVm))
| summarize arg_max(max_PreciseTimeStamp, *) by VmName
```

---

## 磁盘 Churn 分析（复制性能问题）

> 适用场景：RPO 超标、复制速度慢、不确定磁盘写入速率是否超过带宽/IOPS 上限。  
> Mooncake 无 `GetDsHealth()` 函数，使用以下等效查询。

### Step 1：获取 DataSourceId

```kusto
// 连接 mabprodmc → database: MABKustoProd
TelemetryPEToProvider
| where PreciseTimeStamp >= ago(1d) and SubscriptionId == "<subID>"
| project DataSourceId, VmName, VmId, OsType, ProtectedDiskCount, ProtectedItemArmId
```

### Step 2：查询各磁盘 Churn 汇总指标

```kusto
let SourceTable = cluster('Mabprodmc').database('MABKustoProd').HvrApplySyncSessionStats;
SourceTable
| where TIMESTAMP > ago(2d) and TIMESTAMP < ago(1d)
| where DataSourceId == '<DataSourceId from step 1>'
| where TotalWrites > 0
| extend SourceType = iff(LogFormat == 1, "HVR", "InMage")
| summarize
    LastRPO = max(SessionProcessingStartTimeUtc) - max(SessionUploadEndTimeUtc),
    SourceChurnRateMBps   = round((sum(DiffBlobSizeKB)/1024)/((max(SessionUploadEndTimeUtc) - min(SessionUploadStartTimeUtc))/time(1s)),2),
    ServiceProcessingRateMBps = round((sum(DiffBlobSizeKB)/1024)/((max(SessionProcessingEndTimeUtc) - min(SessionProcessingStartTimeUtc))/time(1s)),2),
    AvgWriteSizeKB    = round(avg(AvgWriteSizeKB),2),
    AvgOverlapRate    = round((todouble(sum(TotalWritesBlockedForOverlap))/sum(TotalWrites))*100,2),
    AvgSourceIOPS     = round(sum(TotalWrites)/((max(SessionUploadEndTimeUtc) - min(SessionUploadStartTimeUtc))/time(1s)),2),
    CompressionRatio  = round((sum(UncompressedFileSizeKB - CompressedFileSizeKB)/sum(UncompressedFileSizeKB))*100,2),
    TotalDataSizeUploadedMB = round((sum(DiffBlobSizeKB)/1024),2)
  by VhdStorageAccountType, VhdStorageAccountName, SourceType, DataSourceId, DiskId
```

### Step 3：按小时趋势（单磁盘）

```kusto
let SourceTable = cluster('Mabprodmc').database('MABKustoProd').HvrApplySyncSessionStats;
SourceTable
| where TIMESTAMP > ago(2d) and TIMESTAMP < ago(1d)
| where DataSourceId == "<DataSourceId>" and DiskId == "<DiskId from step 2>"
| summarize IncomingDataMB = round((sum(DiffBlobSizeKB)/1024),2)
    by UploadHour = bin(SessionUploadEndTimeUtc, 1h)
| join kind=inner (
    SourceTable
    | where TIMESTAMP > ago(2d) and TIMESTAMP < ago(1d)
    | where DataSourceId == "<DataSourceId>" and DiskId == "<DiskId>"
    | summarize ProcessedDataMB = round((sum(DiffBlobSizeKB)/1024),2)
        by ProcessedHour = bin(SessionProcessingEndTimeUtc, 1h)
  ) on $left.UploadHour == $right.ProcessedHour
| project HourlyTimeStamp = UploadHour, IncomingDataMB, ProcessedDataMB
| render timechart
```

**分析要点：**
- `SourceChurnRateMBps` > 磁盘规格上限 → 需升级 Premium/Ultra 磁盘
- `LastRPO` 较大 → 处理速度跟不上写入速度
- `AvgOverlapRate` 高 → 写入热点问题
