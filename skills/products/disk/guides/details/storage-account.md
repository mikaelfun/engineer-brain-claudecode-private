# Disk Storage Account Issues — 综合排查指南

**条目数**: 14 | **草稿融合数**: 1 | **Kusto 查询融合**: 2
**来源草稿**: ado-wiki-copying-managed-disk-to-storage-account.md
**Kusto 引用**: disk-api-qos.md, xstore-storage.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Copying A Managed Disk to an Azure Storage Account
> 来源: ADO Wiki (ado-wiki-copying-managed-disk-to-storage-account.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Import-Export Service/Copying A Managed Disk to an Azure Storage Account"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Import-Export%20Service%2FCopying%20A%20Managed%20Disk%20to%20an%20Azure%20Storage%20Account"
3. importDate: "2026-04-05"
4. type: troubleshooting-guide
5. Any data that a customer wishes to export from Azure via Import-Export or Data Box must be in a storage account. Managed Disks cannot be moved via Azure Portal or Storage Explorer - only via Azure CLI.
6. - Azure CLI installed: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli-windows
7. - Customer logged in to Azure account via CLI
8. Grant-AzureRmDiskAccess -DiskName "<Disk_Name>" -ResourceGroupName "<RG_Name>" -DurationInSecond 3600 -Access Read
9. $storageAccountName = "<SA_Name>"
10. $storageContainerName = "<SC_Name>"

### Kusto 查询模板

#### disk-api-qos.md
> `[工具: Kusto skill — disk-api-qos.md]`

- **用途**
- **必要参数**
- **查询语句**
- **结果字段说明**
- **常见操作名称**

```kusto
cluster('https://disksmc.chinaeast2.kusto.chinacloudapi.cn').database('Disks').DiskManagerApiQoSEvent 
| where subscriptionId == "{subscription}"
| where PreciseTimeStamp >= datetime({startTime}) and PreciseTimeStamp <= datetime({endTime})
| where correlationId == "{correlationId}"
| project PreciseTimeStamp, operationName, resourceGroupName, resourceName, 
         httpStatusCode, resultCode, errorDetails, durationInMilliseconds
| order by PreciseTimeStamp asc
```

```kusto
cluster('https://disksmc.chinaeast2.kusto.chinacloudapi.cn').database('Disks').DiskManagerApiQoSEvent 
| where subscriptionId == "{subscription}"
| where PreciseTimeStamp >= ago(1d)
| where resourceGroupName == "{resourceGroup}"
| where operationName !contains "GET"
| project PreciseTimeStamp, operationName, resourceName, httpStatusCode, resultCode, errorDetails
| order by PreciseTimeStamp desc
```

```kusto
cluster('https://disksmc.chinaeast2.kusto.chinacloudapi.cn').database('Disks').DiskManagerApiQoSEvent 
| where subscriptionId == "{subscription}"
| where PreciseTimeStamp >= ago(1d)
| where resultCode != "Success" or httpStatusCode >= 400
| project PreciseTimeStamp, operationName, resourceName, httpStatusCode, resultCode, errorDetails, durationInMilliseconds
| order by PreciseTimeStamp desc
```

#### xstore-storage.md
> `[工具: Kusto skill — xstore-storage.md]`

- **集群信息**
- **查询语句**
- **关联表说明**
- **参考文档**

```kusto
// 查询指定卷的存储容量信息
cluster('azcore.chinanorth3.kusto.chinacloudapi.cn').database('xstore').CapacityVolumePerVolInfo 
| where env_time > ago(3d)
| where VolumeName has "chinaeast2" or Environment has "ChinaEast2"
| summarize arg_max(env_time, *) by VolumeName, TenantName, TotalCapacity, ENCapacity, UsedSizeInTB
| project env_time, VolumeName, TenantName, TotalCapacity, ENCapacity, UsedSizeInTB, PercentBadDisks
```

```kusto
// 查询存储节点磁盘故障
cluster('azcore.chinanorth3.kusto.chinacloudapi.cn').database('XHealth').DiskFailureXStoreTriage
| where NodeId == "{nodeid}"
| where env_time > datetime("{starttime}")
| where env_time < datetime("{endtime}")
| project env_time, TriageCategory, TriageReason, TriageTimestamp, StorageRegion, StorageTenant, NodeId, ClusterFailureReportUrl, DiagnosticDetailsObject, DiskPath
```

```kusto
// 查询存储账户属性
cluster('azcore.chinanorth3.kusto.chinacloudapi.cn').database('xstore').XStoreAccountProperties
| where TIMESTAMP >= ago(1d)
| where Account has '{accountName}'
| where Subscription has '{subscription}'
| project TIMESTAMP, Tenant, Account
```

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Storage account firewall modification fails with StorageAccountOperationInProgress error (409 Conflict) - exclusive lock | A previous PATCH operation on the storage account acquired an exclusive lock that was not properly r | 1) Get ARM operation ID from HttpIncomingRequests (armmcadx). 2) Find conflicting lock ID in SRP logs (Geneva portal). 3 | 🟢 9 | [MCVKB] |
| 2 | Storage account returns 404 ContainerNotFound after stamp migration - requests routed to old stamp due to stale DNS/host | Customer environment had stale DNS entries (hardcoded IP in hosts file) pointing to old storage stam | 1) Check Xportal/backend logs for stamp migration. 2) Ask customer to ping/nslookup storage FQDN and compare IPs. 3) Che | 🟢 9 | [MCVKB] |
| 3 | Storage account firewall blocks portal access with IP not authorized error even though client IP was added to firewall r | Organization has multiple outbound IPs. The IP used for Portal requests differs from the actual outb | 1) Get storage request ID from error. 2) Use Xportal Log Collector to find actual client IP in backend logs. 3) Ask cust | 🟢 9 | [MCVKB] |
| 4 | Storage account returns ServerBusyError (503) / ServerAccountBandwidthThrottlingError during load test - egress not hitt | Stamp-level bandwidth throttling not account-level. ServerAccountBandwidthThrottlingError = stamp-le | 1) Check Jarvis Shoebox metrics for ServerBusy. 2) Xportal auto-analysis to confirm error type. 3) Query XAggAccountUsag | 🟢 9 | [MCVKB] |
| 5 | Premium storage account (BlockBlobStorage) shows Access Tier Hot in portal - access tier not supported for premium | Portal submits unnecessary metadata (accessTier: Hot) in PUT/PATCH when modifying unrelated settings | 1) Check Xportal metadata for accessTier. 2) Query ARM logs for the PUT/PATCH. 3) Check ShoeboxEntries for full request  | 🟢 9 | [MCVKB] |
| 6 | Storage REST API (CheckNameAvailability) returns 404 because Microsoft.Storage resource provider not registered on subsc | After bug fix deployed Aug 2 2022, CheckNameAvailability validates subscription RP registration. Unr | Register Microsoft.Storage RP on the subscription. Normally RP auto-registers on first storage resource creation, but ma | 🟢 9 | [MCVKB] |
| 7 | Storage account connections fail after Azure Storage TLS 1.0/1.1 retirement (Feb 2026 deadline); clients using deprecate | Azure Storage retired TLS 1.0 and 1.1 in Feb 2026. Clients still using old TLS versions cannot estab | 1) Migrate all clients to TLS 1.2. 2) SAP coding: Azure\Storage Account Management\Encryption\TLS 1.0 and 1.1 retirement | 🟢 9 | [MCVKB] |
| 8 | Customer confused by legacy Blob Storage / GPv1 account migration notification: unclear which account types affected, se | Retirement covers BOTH legacy Azure Blob Storage accounts AND GPv1 accounts (deadline Sep-Oct 2026). | 1) Use Resource Graph query to find affected accounts: Resources \| where type == 'microsoft.storage/storageaccounts' \| | 🟢 9 | [MCVKB] |
| 9 | Azure Storage portal access fails in Google Chrome with IPAuthorization or Permission errors after Chrome Local Network  | Chrome Local Network Access Checks block certain requests needed for Azure Storage authentication wi | Disable Chrome flag: Local Network Access Check. Update SAP to Azure/Portal/Resource Blade Does Not Load or Refresh. Roo | 🟢 9 | [MCVKB] |
| 10 | SRP API throttling: TooManyRequests for storage resource provider operations (Read/List/Write) per subscription per regi | SRP throttling limits are hard (not raisable), per region per subscription. ARM categorizes by opera | Query RegionalSRP for throttling keywords. Use Geneva 91A6CDBB. Filter by operationName not HTTP method. Reduce API freq | 🟢 9 | [MCVKB] |
| 11 | Unable to delete ARM storage account: error AccountPendingMigrationToSrp (Conflict 409) | RSRP bug: RDFE-to-SRP migration commit failed, account stuck in Prepare state. Operations blocked in | Try Remove-AzStorageAccount -Force. If fails, file ICM to Xstore triage. Check migration state in Geneva 9BB530D5. | 🟢 9 | [MCVKB] |
| 12 | SSE appears to have Disable option in portal but saving fails; customer asks if SSE can be disabled | SSE enabled by default for ALL storage accounts (Classic and ARM), cannot be disabled. Disable optio | SSE cannot be disabled. Check status: Get-AzStorageAccount, check Encryption.Services.blob.Enabled. Contact SSE team: ss | 🟢 8.5 | [MCVKB] |
| 13 | Storage billing latency: billing delayed for storage accounts with too many large-sized accounts in a single billing str | Billing jobs process non-uniformly distributed streams; large-sized accounts in a single stream caus | PG rolling out improved techniques to create more uniformly distributed billing streams. No customer-side action require | 🟢 8 | [MCVKB] |
| 14 | Storage account throttling for unmanaged disks: ThrottlingError in storage metrics, slow disk IO, high E2E latency. Tota | Standard storage accounts have a cumulative limit of 20000 IOPS. Individual VHDs are limited to 500  | Re-balance VHDs across multiple storage accounts. Migrate to managed disks (no per-account IOPS limit). For latency-sens | 🔵 7.0 | [MS Learn] |
