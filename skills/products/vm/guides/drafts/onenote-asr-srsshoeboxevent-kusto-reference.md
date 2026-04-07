---
source: onenote
sourceRef: "MCVKB/VM+SCIM/=======12. ASR=======/12.10 [ASR]SRSShoeBoxEvent.md"
sourceUrl: null
importDate: "2026-04-04"
type: reference-guide
---

# ASR SRSShoeboxEvent Kusto 参考查询

用于 ASR 复制项诊断的标准 Kusto 查询，返回所有关键字段。

## 适用集群

`asrclusmc.kusto.chinacloudapi.cn` / Database: `ASRKustoDB`

## 标准查询模板

```kusto
let subscriptionId = "<YOUR_SUBSCRIPTION_ID>";
//let startTime = datetime(2018-02-27 18:51:20);
//let endTime   = datetime(2018-02-28 22:51:20);

SRSShoeboxEvent
| where PreciseTimeStamp between (ago(5d) .. now())
| where category == "AzureSiteRecoveryReplicatedItems" and resourceId has subscriptionId
| extend parsedProperties = parsejson(properties)
| summarize arg_max(PreciseTimeStamp, *) by tostring(parsedProperties.correlationId)
| extend correlationId       = tostring(parsedProperties.correlationId)
| extend VaultName           = extract("/vaults/(.*?)/replicationFabrics", 1, correlationId)
| project
    PreciseTimeStamp,
    VMName                              = toupper(tostring(parsedProperties.name)),
    ProtectionState                     = tostring(parsedProperties.protectionState),
    ReplicationHealth                   = tostring(parsedProperties.replicationHealth),
    ReplicationhealthErrors             = tostring(parsedProperties.replicationHealthErrors),
    InitialReplicationProgressPercentage = tostring(parsedProperties.initialReplicationProgressPercentage),
    StorageAccount                      = tostring(parsedProperties.targetStorageAccountName),
    RPO                                 = tostring(parsedProperties.rpoInSeconds),
    ProcessServer                       = tostring(parsedProperties.processServerName),
    AgentLastHeartbeat                  = tostring(parsedProperties.lastHeartbeat),
    OS                                  = tostring(parsedProperties.osFamily),
    PS                                  = tostring(parsedProperties.primaryFabricName),
    Provider                            = tostring(parsedProperties.primaryFabricType),
    VaultName                           = toupper(VaultName),
    parsedProperties
// | where VaultName == "MY-VAULT"
// | where VMName    == "MY-VM"
| sort by PreciseTimeStamp desc
```

## 说明

- `arg_max(PreciseTimeStamp, *) by correlationId` — 取每个复制项最新状态
- `InitialReplicationProgressPercentage` — 初始复制进度（卡 0% 时重点看）
- `ReplicationhealthErrors` — 健康错误详情
- `RPO` — 单位秒；ASR 目标 RPO ≤ 15 分钟 = 900 秒
- `parsedProperties` — 包含所有原始字段，可从中提取额外列
