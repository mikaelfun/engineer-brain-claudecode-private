# Disk Storage Account Issues — 排查工作流

**来源草稿**: ado-wiki-copying-managed-disk-to-storage-account.md
**Kusto 引用**: disk-api-qos.md, xstore-storage.md
**场景数**: 3
**生成日期**: 2026-04-07

---

## Scenario 1: 托管磁盘复制到存储账户
> 来源: ado-wiki-copying-managed-disk-to-storage-account.md | 适用: Mooncake ✅ / Global ✅

### 场景
Export 或 Data Box 要求数据在存储账户中，托管磁盘无法通过 Portal/Storage Explorer 移动。

### 步骤

1. **生成 SAS URL**
   ```powershell
   Grant-AzureRmDiskAccess -DiskName "<Disk_Name>" -ResourceGroupName "<RG>" -DurationInSecond 3600 -Access Read
   ```

2. **配置目标存储上下文**
   ```powershell
   $destinationContext = New-AzureStorageContext -StorageAccountName "<SA>" -StorageAccountKey "<Key>"
   ```

3. **执行复制**
   ```powershell
   Start-AzureStorageBlobCopy -AbsoluteUri $sas -DestContainer "<container>" -DestContext $destinationContext -DestBlob "<VHD_Name>"
   ```

---

## Scenario 2: Disk RP API 问题排查
> 来源: disk-api-qos.md | 适用: Mooncake ✅

### 排查步骤

1. **查询操作失败率统计**
   ```kql
   cluster('https://disksmc.chinaeast2.kusto.chinacloudapi.cn').database('Disks').DiskManagerApiQoSEvent
   | where subscriptionId == "{subscription}" and PreciseTimeStamp >= ago(7d)
   | summarize TotalCount = count(), FailedCount = countif(resultCode != "Success") by operationName
   | extend FailureRate = round(100.0 * FailedCount / TotalCount, 2)
   ```

2. **按 CorrelationId 追踪**
   ```kql
   | where correlationId == "{correlationId}"
   | project PreciseTimeStamp, operationName, httpStatusCode, errorDetails
   ```

---

## Scenario 3: XStore 存储查询 (Mooncake)
> 来源: xstore-storage.md | 适用: Mooncake ✅

### 存储账户属性查询
```kql
cluster('azcore.chinanorth3.kusto.chinacloudapi.cn').database('xstore').XStoreAccountProperties
| where TIMESTAMP >= ago(1d)
| where Account has '{accountName}' and Subscription has '{subscription}'
```

### 存储账户容量查询
```kql
cluster('azcore.chinanorth3.kusto.chinacloudapi.cn').database('xstore').XStoreAccountCapacity
| where SubscriptionId in ("{subscription}") and Account startswith "{accountPrefix}"
| where ProductName contains "block blob"
| summarize sum(UsedSize / pow(2, 40)) by Account, TIMESTAMP  // 单位: TB
```

### 卷容量查询
```kql
cluster('azcore.chinanorth3.kusto.chinacloudapi.cn').database('xstore').CapacityVolumePerVolInfo
| where env_time > ago(3d)
| summarize arg_max(env_time, *) by VolumeName, TenantName
| project env_time, VolumeName, TotalCapacity, UsedSizeInTB, PercentBadDisks
```

### 关联表

| 表名 | 数据库 | 说明 |
|------|--------|------|
| XStoreAccountProperties | xstore | 存储账户属性 |
| XStoreAccountCapacity | xstore | 存储账户容量 |
| XStoreAccountBilling | xstore | 存储账户计费 |
| CapacityVolumePerVolInfo | xstore | 卷容量统计 |
| DiskFailureXStoreTriage | XHealth | 磁盘故障 Triage |