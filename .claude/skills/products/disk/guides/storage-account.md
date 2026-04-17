# Disk Storage Account Issues — 排查速查

**来源数**: 14 | **21V**: 全部适用
**最后更新**: 2026-04-07
**关键词**: 20000, 404, 409-conflict, 503, access-tier, account-migration, accountpendingmigrationtosrp, api-throttling, arm, authorizationfailed

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | Storage account firewall modification fails with StorageAccountOperationInProgress error (409 Conflict) - exclusive lock | A previous PATCH operation on the storage account acquired an exclusive lock that was not properly r | 1) Get ARM operation ID from HttpIncomingRequests (armmcadx). 2) Find conflicting lock ID in SRP logs (Geneva portal). 3 | 🟢 9 | [MCVKB] |
| 2 📋 | Storage account returns 404 ContainerNotFound after stamp migration - requests routed to old stamp due to stale DNS/host | Customer environment had stale DNS entries (hardcoded IP in hosts file) pointing to old storage stam | 1) Check Xportal/backend logs for stamp migration. 2) Ask customer to ping/nslookup storage FQDN and compare IPs. 3) Che | 🟢 9 | [MCVKB] |
| 3 📋 | Storage account firewall blocks portal access with IP not authorized error even though client IP was added to firewall r | Organization has multiple outbound IPs. The IP used for Portal requests differs from the actual outb | 1) Get storage request ID from error. 2) Use Xportal Log Collector to find actual client IP in backend logs. 3) Ask cust | 🟢 9 | [MCVKB] |
| 4 📋 | Storage account returns ServerBusyError (503) / ServerAccountBandwidthThrottlingError during load test - egress not hitt | Stamp-level bandwidth throttling not account-level. ServerAccountBandwidthThrottlingError = stamp-le | 1) Check Jarvis Shoebox metrics for ServerBusy. 2) Xportal auto-analysis to confirm error type. 3) Query XAggAccountUsag | 🟢 9 | [MCVKB] |
| 5 📋 | Premium storage account (BlockBlobStorage) shows Access Tier Hot in portal - access tier not supported for premium | Portal submits unnecessary metadata (accessTier: Hot) in PUT/PATCH when modifying unrelated settings | 1) Check Xportal metadata for accessTier. 2) Query ARM logs for the PUT/PATCH. 3) Check ShoeboxEntries for full request  | 🟢 9 | [MCVKB] |
| 6 📋 | Storage REST API (CheckNameAvailability) returns 404 because Microsoft.Storage resource provider not registered on subsc | After bug fix deployed Aug 2 2022, CheckNameAvailability validates subscription RP registration. Unr | Register Microsoft.Storage RP on the subscription. Normally RP auto-registers on first storage resource creation, but ma | 🟢 9 | [MCVKB] |
| 7 📋 | Storage account connections fail after Azure Storage TLS 1.0/1.1 retirement (Feb 2026 deadline); clients using deprecate | Azure Storage retired TLS 1.0 and 1.1 in Feb 2026. Clients still using old TLS versions cannot estab | 1) Migrate all clients to TLS 1.2. 2) SAP coding: Azure\Storage Account Management\Encryption\TLS 1.0 and 1.1 retirement | 🟢 9 | [MCVKB] |
| 8 📋 | Customer confused by legacy Blob Storage / GPv1 account migration notification: unclear which account types affected, se | Retirement covers BOTH legacy Azure Blob Storage accounts AND GPv1 accounts (deadline Sep-Oct 2026). | 1) Use Resource Graph query to find affected accounts: Resources \| where type == 'microsoft.storage/storageaccounts' \| | 🟢 9 | [MCVKB] |
| 9 📋 | Azure Storage portal access fails in Google Chrome with IPAuthorization or Permission errors after Chrome Local Network  | Chrome Local Network Access Checks block certain requests needed for Azure Storage authentication wi | Disable Chrome flag: Local Network Access Check. Update SAP to Azure/Portal/Resource Blade Does Not Load or Refresh. Roo | 🟢 9 | [MCVKB] |
| 10 📋 | SRP API throttling: TooManyRequests for storage resource provider operations (Read/List/Write) per subscription per regi | SRP throttling limits are hard (not raisable), per region per subscription. ARM categorizes by opera | Query RegionalSRP for throttling keywords. Use Geneva 91A6CDBB. Filter by operationName not HTTP method. Reduce API freq | 🟢 9 | [MCVKB] |
| 11 📋 | Unable to delete ARM storage account: error AccountPendingMigrationToSrp (Conflict 409) | RSRP bug: RDFE-to-SRP migration commit failed, account stuck in Prepare state. Operations blocked in | Try Remove-AzStorageAccount -Force. If fails, file ICM to Xstore triage. Check migration state in Geneva 9BB530D5. | 🟢 9 | [MCVKB] |
| 12 📋 | SSE appears to have Disable option in portal but saving fails; customer asks if SSE can be disabled | SSE enabled by default for ALL storage accounts (Classic and ARM), cannot be disabled. Disable optio | SSE cannot be disabled. Check status: Get-AzStorageAccount, check Encryption.Services.blob.Enabled. Contact SSE team: ss | 🟢 8.5 | [MCVKB] |
| 13 📋 | Storage billing latency: billing delayed for storage accounts with too many large-sized accounts in a single billing str | Billing jobs process non-uniformly distributed streams; large-sized accounts in a single stream caus | PG rolling out improved techniques to create more uniformly distributed billing streams. No customer-side action require | 🟢 8 | [MCVKB] |
| 14 📋 | Storage account throttling for unmanaged disks: ThrottlingError in storage metrics, slow disk IO, high E2E latency. Tota | Standard storage accounts have a cumulative limit of 20000 IOPS. Individual VHDs are limited to 500  | Re-balance VHDs across multiple storage accounts. Migrate to managed disks (no per-account IOPS limit). For latency-sens | 🔵 7.0 | [MS Learn] |

## 快速排查路径

1. Storage account firewall modification fails with StorageAccountOperationInProgre → 1) Get ARM operation ID from HttpIncomingRequests (armmcadx) `[来源: onenote]`
2. Storage account returns 404 ContainerNotFound after stamp migration - requests r → 1) Check Xportal/backend logs for stamp migration `[来源: onenote]`
3. Storage account firewall blocks portal access with IP not authorized error even  → 1) Get storage request ID from error `[来源: onenote]`
4. Storage account returns ServerBusyError (503) / ServerAccountBandwidthThrottling → 1) Check Jarvis Shoebox metrics for ServerBusy `[来源: onenote]`
5. Premium storage account (BlockBlobStorage) shows Access Tier Hot in portal - acc → 1) Check Xportal metadata for accessTier `[来源: onenote]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/storage-account.md#排查流程)
