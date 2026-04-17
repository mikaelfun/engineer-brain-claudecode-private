---
name: disk-operations
description: 磁盘操作查询 - 查询托管磁盘创建、附加、分离等操作
tables:
  - ApiQosEvent
  - ContextActivity
  - dcmInventoryComponentDiskDirect
  - DiskEvent
  - OsConfigTable
parameters:
  - name: subscription
    required: true
    description: 订阅 ID
  - name: diskname
    required: false
    description: 磁盘名称
  - name: correlationId
    required: false
    description: 关联 ID
  - name: starttime
    required: false
    default: ago(2d)
    description: 开始时间
  - name: endtime
    required: false
    default: now()
    description: 结束时间
---

# 磁盘操作查询

## 用途

查询托管磁盘的各类操作，包括创建、附加、分离、快照等。用于排查磁盘相关问题。

## 必要参数

| 参数 | 必填 | 说明 | 示例 |
|------|------|------|------|
| {subscription} | 是 | 订阅 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| {diskname} | 否 | 磁盘名称 | mydisk |
| {correlationId} | 否 | 关联 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| {starttime} | 否 | 开始时间 | 2025-01-01T00:00:00Z |
| {endtime} | 否 | 结束时间 | 2025-01-02T00:00:00Z |

## 查询语句

### 查询磁盘操作

```kql
cluster('disksmc.chinaeast2.kusto.chinacloudapi.cn').database('Disks').ApiQosEvent
| where TIMESTAMP > ago(2d)
| where subscriptionId == "{subscription}"
| where resourceName contains "{diskname}"
| where operationName notcontains "GET"
| project PreciseTimeStamp, operationId, correlationId, operationName, resourceGroupName, 
         resourceName, httpStatusCode, resultCode, errorDetails
| order by PreciseTimeStamp desc
```

### 按 correlationId 查询

```kql
cluster('disksmc.chinaeast2.kusto.chinacloudapi.cn').database('Disks').ApiQosEvent
| where TIMESTAMP > ago(2d)
| where correlationId == "{correlationId}"
| project PreciseTimeStamp, operationId, operationName, resourceName, httpStatusCode, 
         resultCode, errorDetails
| order by PreciseTimeStamp asc
```

### 查询磁盘操作详细日志

```kql
cluster('disksmc.chinaeast2.kusto.chinacloudapi.cn').database('Disks').ContextActivity
| where TIMESTAMP > ago(4h)
| where activityId == "{operationId}"
| project PreciseTimeStamp, message, traceCode
| order by PreciseTimeStamp asc
```

### 查询磁盘创建失败

```kql
cluster('disksmc.chinaeast2.kusto.chinacloudapi.cn').database('Disks').ApiQosEvent
| where TIMESTAMP > ago(7d)
| where subscriptionId == "{subscription}"
| where operationName contains "Disks" and operationName contains "PUT"
| where httpStatusCode >= 400 or resultCode != ""
| project PreciseTimeStamp, resourceName, operationName, resultCode, httpStatusCode, errorDetails
| order by PreciseTimeStamp desc
```

### 查询磁盘附加/分离操作

```kql
cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').ApiQosEvent
| where TIMESTAMP > ago(2d)
| where subscriptionId == "{subscription}"
| where operationName contains "attach" or operationName contains "detach"
| project PreciseTimeStamp, operationName, resourceName, httpStatusCode, resultCode, errorDetails
| order by PreciseTimeStamp desc
```

## 结果字段说明

| 字段 | 说明 |
|------|------|
| operationName | 操作名称 (Disks.ResourceOperation.PUT/DELETE 等) |
| resultCode | 结果代码 |
| errorDetails | 错误详情 |

## 常见磁盘错误

| 错误码 | 说明 |
|--------|------|
| DiskSizeNotSupported | 磁盘大小不支持 |
| AttachDiskWhileBeingDetached | 磁盘正在分离时尝试附加 |
| DiskAlreadyAttached | 磁盘已附加到其他 VM |
| MaxDiskCountExceeded | 超过最大磁盘数限制 |

## 变体查询

### 查询快照操作

```kql
cluster('disksmc.chinaeast2.kusto.chinacloudapi.cn').database('Disks').ApiQosEvent
| where TIMESTAMP > ago(7d)
| where subscriptionId == "{subscription}"
| where operationName contains "Snapshot"
| project PreciseTimeStamp, operationName, resourceName, httpStatusCode, resultCode, errorDetails
| order by PreciseTimeStamp desc
```

### 查询磁盘硬件信息

```kql
cluster("azuredcmmc.kusto.chinacloudapi.cn").database("AzureDCMDb").dcmInventoryComponentDiskDirect
| where NodeId == "{nodeId}"
| project NodeId, SCSIPort, SCSIBus, SCSIAddress, SCSILUN, DriveSerialNumber, DriveProductId, 
         FirmwareRevision, DriveBusType, SystemDrive
```

## 关联查询

- [vm-operations.md](./vm-operations.md) - VM 操作查询
- [hardware-failure.md](./hardware-failure.md) - 硬件故障查询

---

## 补充查询

### 查询 VM 关联的磁盘事件 (CRP DiskEvent)

```kql
cluster("azcrpmc.kusto.chinacloudapi.cn").database('crp_allmc').DiskEvent 
| where TIMESTAMP between (datetime({starttime}) .. datetime({endtime}))
| where subscriptionId has "{subscription}"
| where vMName has "{vmname}"
| project TIMESTAMP, vMName, name, diskType, sizeInGB, blobLocation, diskId, state, errorDetails, code, category
| order by TIMESTAMP desc
```

### 查询 VM 磁盘详细信息 (含 IOPS/Burst 限制)

此查询通过 containerId 获取 VM 的磁盘信息，包括存储帐户、IOPS 限制、Burst 配置等：

```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let ContId = "{containerId}";
let subscriptionid = "{subscription}";
let VMName = "{vmname}";
let VmSnapshot =
materialize(
    cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').LogContainerSnapshot
    | where PreciseTimeStamp between (starttime .. endtime)
    | where ((isnotempty(subscriptionId) and subscriptionId =~ subscriptionid and isnotempty(roleInstanceName) and roleInstanceName contains VMName))
        or (isnotempty(containerId) and containerId == ContId)
    | summarize STARTTIME=min(PreciseTimeStamp), ENDTIME=max(PreciseTimeStamp)
        by nodeId, containerId, tenantName, Tenant, roleInstanceName, containerType,
           VMID=virtualMachineUniqueId, subscriptionId, Region
);
let LatestVm = VmSnapshot | top 1 by ENDTIME desc;
let VMID = toscalar(LatestVm | project VMID);
let _DiskEvent = materialize (
    cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').DiskEvent
    | where vMId == VMID
    | project PreciseTimeStamp, diskId, name, blobLocation, state, diskType, sizeInGB, storageAccountType, createOption, caching, oS, lun, isMigrated
);
let DiskID = _DiskEvent
    | summarize arg_max(PreciseTimeStamp, *) by diskId
    | where state has 'Detach'
    | project diskId;
let DiskBasicInfo = _DiskEvent
    | where blobLocation != ''
    | where diskId !in (DiskID)
    | project PreciseTimeStamp, diskId, name, blobLocation, state, diskType, sizeInGB, storageAccountType, createOption, caching, oS, lun, isMigrated
    | summarize arg_max(PreciseTimeStamp, *) by diskId
    | join kind = leftouter (
        _DiskEvent
        | where diskId !in (DiskID)
        | where state has 'Allocate'
        | summarize arg_max(PreciseTimeStamp, storageAccountType) by diskId
        | project AllocateStorageAccountType = storageAccountType, diskId
    ) on $left.diskId == $right.diskId
    | project PreciseTimeStamp, diskId, name, blobLocation, state, diskType, sizeInGB, 
             StorageAccountType = iif(storageAccountType != '', storageAccountType, AllocateStorageAccountType), 
             createOption, caching, oS, lun, isMigrated
    | extend StorageAccount = tostring(extract(@"https://([\\-A-Za-z0-9]+)\\.", 1, blobLocation))
    | extend BlobContainer = tostring(extract(@"/([A-Za-z0-9]+)/", 1, blobLocation))
    | extend BlobName = tostring(extract(@"/([\\-\\.A-Za-z0-9]+)$", 1, blobLocation))
    | extend DiskType = tostring(split(StorageAccountType, '_', 0)[0])
    | extend RedundantType = tostring(split(StorageAccountType, '_', 1)[0])
    | extend blobPath = strcat(StorageAccount, '/', BlobContainer, '/', BlobName);
let StartTime = toscalar(DiskBasicInfo | summarize min(PreciseTimeStamp) | project StartTime = iif(min_PreciseTimeStamp > ago(30d), min_PreciseTimeStamp, ago(30d)));
let OsConfigTab = cluster('azcore.chinanorth3.kusto.chinacloudapi.cn').database('fa').OsConfigTable
    | where TIMESTAMP >= StartTime
    | where Component == 'blobprop'
    | summarize arg_max(PreciseTimeStamp, ConfigName, ConfigValue) by ConfigName
    | extend DiskPathCN = tostring(substring(ConfigName, indexof(ConfigName, '/') + 1))
    | project DiskPathCN, ConfigValue;
DiskBasicInfo
| join kind = leftouter OsConfigTab on $left.blobPath == $right.DiskPathCN
| project diskId, name, blobLocation, diskType, sizeInGB, StorageAccountType, createOption, caching, oS, lun, isMigrated, ConfigValue, StorageAccount, BlobContainer, BlobName, DiskType, RedundantType
| extend BlobProperties = parse_json(ConfigValue)
| extend StorageTenant = tostring(BlobProperties.storagecluster)
| extend DiskResourceID = tostring(BlobProperties.blobproperties['x-ms-disk-resource-uri'])
| extend DiskAccessTier = tostring(BlobProperties.blobproperties['x-ms-access-tier'])
| extend ThroughputLimit = tostring(BlobProperties.blobproperties['x-ms-blob-throughput-limit'])
| extend IOPSLimit = tostring(BlobProperties.blobproperties['x-ms-blob-iops-limit'])
| extend Burst_Duration = tostring(BlobProperties.blobproperties['x-ms-blob-burst-duration'])
| extend Burst_MaxIOPS = tostring(BlobProperties.blobproperties['x-ms-blob-burst-iops-limit'])
| extend Burst_MaxMBPS = tostring(BlobProperties.blobproperties['x-ms-blob-burst-throughput-limit'])
| extend Burst_Type = tostring(BlobProperties.blobproperties['x-ms-blob-burst-type'])
| extend ManagedDisk = tostring(BlobProperties.blobproperties['x-ms-is-blob-in-managed-disks-account'])
| summarize by diskId, name, blobLocation, diskType, ARM_DiskType=DiskType, RedundantType, sizeInGB, StorageAccountType, createOption, caching, oS, lun, isMigrated, StorageTenant, DiskResourceID, DiskAccessTier, ThroughputLimit, IOPSLimit, Burst_Type, Burst_MaxMBPS, Burst_MaxIOPS, Burst_Duration, ManagedDisk, StorageAccount, BlobContainer, BlobName
| order by lun asc
```

### 磁盘详细信息字段说明

| 字段 | 说明 |
|------|------|
| StorageTenant | 存储集群租户 |
| ThroughputLimit | 吞吐量限制 (MB/s) |
| IOPSLimit | IOPS 限制 |
| Burst_Type | Burst 类型 (Credit/OnDemand) |
| Burst_MaxIOPS | Burst 最大 IOPS |
| Burst_MaxMBPS | Burst 最大吞吐量 |
| Burst_Duration | Burst 持续时间 |
| DiskAccessTier | 磁盘访问层 |
