---
name: disk-metadata
description: 磁盘元数据和配置查询
tables:
  - Disk
parameters:
  - name: subscription
    required: true
    description: 订阅 ID
  - name: diskName
    required: false
    description: 磁盘名称（可选）
  - name: vmName
    required: false
    description: VM 名称（可选）
---

# 磁盘元数据查询

## 用途

查询托管磁盘的元数据信息，包括存储账户、性能配置、VM 关联等。

## 必要参数

| 参数 | 必填 | 说明 | 示例 |
|------|------|------|------|
| {subscription} | 是 | 订阅 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| {diskName} | 否 | 磁盘名称 | mydisk |
| {vmName} | 否 | VM 名称 | myvm |

## 查询语句

### 查询 1: 按订阅查询所有磁盘

```kql
cluster('https://disksmc.chinaeast2.kusto.chinacloudapi.cn').database('Disks').Disk
| where SubscriptionId in ("{subscription}")
| where TIMESTAMP > ago(1d)
| parse BlobUrl with * 'https://' storageaccount '/' *
| parse kind=regex OwnerReferenceKey with * 'VIRTUALMACHINES%2F' VMName '$'
| extend DiskSizeGB = DiskSizeBytes / 1024 / 1024 / 1024
| summarize arg_max(TIMESTAMP, *) by DiskArmId
| project DiskArmId, DisksName, BlobUrl, storageaccount, AccountType, GeoLocation, 
         OwnershipState, IsARMResource, VMName, TimeCreated, DiskSizeGB,
         TotalOperationsPerSecond, TotalBytesPerSecond, Tier, HyperVGeneration
```

### 查询 2: 按磁盘名称查询

```kql
cluster('https://disksmc.chinaeast2.kusto.chinacloudapi.cn').database('Disks').Disk
| where SubscriptionId has '{subscription}'
| where TIMESTAMP > ago(1d)
| where DiskArmId has '{diskName}' or DisksName has '{diskName}'
| parse BlobUrl with * 'https://' storageaccount '/' *
| parse kind=regex OwnerReferenceKey with * 'VIRTUALMACHINES%2F' VMName '$'
| extend DiskSizeGB = DiskSizeBytes / 1024 / 1024 / 1024
| summarize arg_max(TIMESTAMP, *) by DiskArmId
| project DiskArmId, DisksName, BlobUrl, storageaccount, AccountType, GeoLocation, 
         OwnershipState, VMName, TimeCreated, DiskSizeGB, Tier,
         TotalOperationsPerSecond, TotalBytesPerSecond, CrpDiskId
```

### 查询 3: 按 VM 名称查询关联磁盘

```kql
cluster('https://disksmc.chinaeast2.kusto.chinacloudapi.cn').database('Disks').Disk
| where SubscriptionId has '{subscription}'
| where TIMESTAMP > ago(1d)
| parse BlobUrl with * 'https://' storageaccount '/' *
| parse kind=regex OwnerReferenceKey with * 'VIRTUALMACHINES%2F' VMName '$'
| extend DiskSizeGB = DiskSizeBytes / 1024 / 1024 / 1024
| extend OwnerReferenceKey = replace_string(OwnerReferenceKey, '%2F', '/')
| where VMName has '{vmName}'
| summarize arg_max(TIMESTAMP, *) by DiskArmId
| project DiskArmId, DisksName, BlobUrl, storageaccount, AccountType, OwnershipState, 
         VMName, TimeCreated, DiskSizeGB, Tier, TotalOperationsPerSecond, TotalBytesPerSecond
```

### 查询 4: 查找未附加的磁盘

```kql
cluster('https://disksmc.chinaeast2.kusto.chinacloudapi.cn').database('Disks').Disk
| where SubscriptionId == "{subscription}"
| where TIMESTAMP > ago(1d)
| where OwnershipState == "Unattached"
| extend DiskSizeGB = DiskSizeBytes / 1024 / 1024 / 1024
| summarize arg_max(TIMESTAMP, *) by DiskArmId
| project DiskArmId, DisksName, AccountType, DiskSizeGB, TimeCreated, Tier, GeoLocation
```

## 结果字段说明

| 字段 | 说明 |
|------|------|
| DiskArmId | 磁盘 ARM 资源 ID |
| DisksName | 磁盘名称 |
| BlobUrl | Blob 存储 URL |
| storageaccount | 存储账户名称 |
| AccountType | 存储账户类型 (Premium_LRS, Standard_LRS) |
| OwnershipState | 所有权状态 (Attached, Unattached) |
| VMName | 关联的 VM 名称 |
| DiskSizeGB | 磁盘大小 (GB) |
| Tier | 性能层级 (P30, P40, etc.) |
| TotalOperationsPerSecond | 配置的 IOPS |
| TotalBytesPerSecond | 配置的吞吐量 (Bytes/s) |

## 关联查询

- [disk-lifecycle.md](./disk-lifecycle.md) - 磁盘生命周期事件
- [io-performance.md](./io-performance.md) - IO 性能分析
