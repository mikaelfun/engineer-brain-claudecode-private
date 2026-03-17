---
name: xstore-storage
description: XStore 存储相关查询 (Mooncake 环境)
tables:
  - CapacityVolumePerVolInfo
  - XStoreAccountProperties
  - XStoreAccountCapacity
  - XStoreAccountBilling
  - DiskFailureXStoreTriage
environment: Mooncake
---

# XStore 存储查询 (Mooncake 环境)

## 集群信息

| 集群 | URI | 数据库 | 用途 |
|------|-----|--------|------|
| Azure Core | https://azcore.chinanorth3.kusto.chinacloudapi.cn | xstore | XStore 存储数据 |

---

## 查询语句

### 卷容量查询

```kql
// 查询指定卷的存储容量信息
cluster('azcore.chinanorth3.kusto.chinacloudapi.cn').database('xstore').CapacityVolumePerVolInfo 
| where env_time > ago(3d)
| where VolumeName has "chinaeast2" or Environment has "ChinaEast2"
| summarize arg_max(env_time, *) by VolumeName, TenantName, TotalCapacity, ENCapacity, UsedSizeInTB
| project env_time, VolumeName, TenantName, TotalCapacity, ENCapacity, UsedSizeInTB, PercentBadDisks
```

### 存储节点磁盘故障分析

> ⚠️ **注意**: XLivesite 集群当前无访问权限，以下查询仅供参考。

```kql
// 查询存储节点磁盘故障
cluster('azcore.chinanorth3.kusto.chinacloudapi.cn').database('XHealth').DiskFailureXStoreTriage
| where NodeId == "{nodeid}"
| where env_time > datetime("{starttime}")
| where env_time < datetime("{endtime}")
| project env_time, TriageCategory, TriageReason, TriageTimestamp, StorageRegion, StorageTenant, NodeId, ClusterFailureReportUrl, DiagnosticDetailsObject, DiskPath
```

### 存储账户属性查询

```kql
// 查询存储账户属性
cluster('azcore.chinanorth3.kusto.chinacloudapi.cn').database('xstore').XStoreAccountProperties
| where TIMESTAMP >= ago(1d)
| where Account has '{accountName}'
| where Subscription has '{subscription}'
| project TIMESTAMP, Tenant, Account
```

```kql
// 查询启用层级命名空间的存储账户
cluster('azcore.chinanorth3.kusto.chinacloudapi.cn').database('xstore').XStoreAccountProperties
| where TIMESTAMP > ago(365d) and IsPrimaryReplica == 1
| where Subscription in ("{subscription}")
| extend props = parse_json(Properties)
| where props["BlobLogType"] > 0 or props["QueueLogType"] > 0 or props["TableLogType"] > 0
// | where IsHnsEnabled == 1
| distinct Account
```

### 存储账户容量查询

```kql
// 按时间范围查询存储账户容量
let startDate = datetime(2023-03-12 00:00:00);
let endDate = datetime(2023-04-07 09:00:00);
cluster('azcore.chinanorth3.kusto.chinacloudapi.cn').database('xstore').XStoreAccountCapacity
| where TIMESTAMP >= startDate and TIMESTAMP <= endDate
| where SubscriptionId in ("{subscription}")
| where Account startswith "{accountPrefix}"
| where ProductName contains "block blob"
| summarize sum(UsedSize / pow(2, 40)) by Account, TIMESTAMP  // 结果单位: TB
```

### 存储账户计费查询

```kql
// 查询存储账户计费数据并计算增长趋势
let startDate = datetime(2022-04-01 00:00:00);
let endDate = datetime(2023-03-08 00:00:00);
cluster('azcore.chinanorth3.kusto.chinacloudapi.cn').database('xstore').XStoreAccountBilling
| where StgMeterName == "StgBlockBlobv2HnsHotLRSDataStored"
| where Subscription == "{subscription}"
| where AccountName startswith "{accountPrefix}"
| where TIMESTAMP > ago(260d)
| summarize BilledUnits = sum(ProratedQuantity) by TIMESTAMP
```

---

## 关联表说明

| 表名 | 数据库 | 说明 |
|------|--------|------|
| CapacityVolumePerVolInfo | xstore | 存储卷容量统计 (按 Volume 维度) |
| DiskFailureXStoreTriage | XHealth | 存储节点磁盘故障 Triage |
| XStoreAccountProperties | xstore | 存储账户属性 (实时数据) |
| XStoreAccountCapacity | xstore | 存储账户容量 |
| XStoreAccountBilling | xstore | 存储账户计费 |

---

## 参考文档

- [Azure 存储可伸缩性目标](https://docs.azure.cn/zh-cn/storage/common/scalability-targets-standard-account)
