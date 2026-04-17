# Disk Miscellaneous Disk Issues — 综合排查指南

**条目数**: 5 | **草稿融合数**: 5 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-a-dump-collection-debug-diag-tool.md, ado-wiki-a-initial-questions.md, ado-wiki-a-kusto-queries.md, ado-wiki-a-support-operations-collect-traces.md, ado-wiki-a-support-operations-get-cache-plus.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Ado Wiki A Dump Collection Debug Diag Tool
> 来源: ADO Wiki (ado-wiki-a-dump-collection-debug-diag-tool.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/WebApps_training/Dump Collection|Debug diag tool"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=/WebApps_training/Dump%20Collection%7CDebug%20diag%20tool"
3. importDate: "2026-04-06"
4. type: troubleshooting-guide
5. Here are the steps to collect 3 consecutive hang dumps when the issue starts to happen:
6. 1.Launch debugdiag (download: [https://www.microsoft.com/en-us/download/details.aspx?id=58210](https://www.microsoft.com/en-us/download/details.aspx?id=58210 "https://www.microsoft.com/en-us/download/details.aspx?id=58210") )
7. 2.Dismiss the pop-up.
8. 3.Go to processes tab and identify your W3WP process instance
9. 4.Wait for issue to reproduce
10. 5.When the hang starts to happen, right click on the w3wp instance and generate Full User dump. Repeat this step 3 times each 1-2 minutes apart. Make sure hang is happening when collecting dumps

### Phase 2: Environment Details
> 来源: ADO Wiki (ado-wiki-a-initial-questions.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/WebApps_training/Initial Questions"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=/WebApps_training/Initial%20Questions"
3. importDate: "2026-04-06"
4. type: troubleshooting-guide
5. *   What is the **Windows Server version**(including build number)?
6. *   What is the **IIS version**?
7. *   Server name(s) affected:
8. *   Is this issue occurring on **a single server or multiple servers**?
9. *   Is the server part of a **web farm / loadbalanced setup**?
10. *   Affected **Site / Application name**:

### Phase 3: Kusto Queries — Azure HPC Cache (Avere)
> 来源: ADO Wiki (ado-wiki-a-kusto-queries.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Avere - HPC Cache/Kusto queries"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAvere%20-%20HPC%20Cache%2FKusto%20queries"
3. importDate: "2026-04-05"
4. type: troubleshooting-guide
5. Brief overview of Kusto Queries for Azure Storage Caches (HPC Caches). Not a full tutorial — for deeper learning see: https://aka.ms/kwe
6. Access requires membership in a project with access to the Kusto database.
7. Apply for access at: [MyAccess](https://myaccess/identityiq/home.jsf) (being replaced by CoreIdentity — ask manager for current site).
8. Navigate to Azure Data Explorer: https://dataexplorer.azure.com/clusters/armprod/databases/ARMProd
9. If ARMProd database is not showing, add it:
10. 1. Click **Add Cluster**

   ```kusto
   EventServiceEntries 
   | where TIMESTAMP > ago(1d) 
   | where subscriptionId=="646cce9f-0a1c-4acb-be06-401056b03659" 
   | where status == 'Failed'
   ```
   `[工具: Kusto skill — ado-wiki-a-kusto-queries.md]`

   ```kusto
   EventServiceEntries 
   | where TIMESTAMP > ago(1d) 
   | where subscriptionId=="646cce9f-0a1c-4acb-be06-401056b03659" 
   | where status == 'Failed'
   | limit 10
   ```
   `[工具: Kusto skill — ado-wiki-a-kusto-queries.md]`

### Phase 4: Support Operations — Collect Traces (HPC Cache)
> 来源: ADO Wiki (ado-wiki-a-support-operations-collect-traces.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Avere - HPC Cache/Support Operations - Collect Traces"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAvere%20-%20HPC%20Cache%2FSupport%20Operations%20-%20Collect%20Traces"
3. importDate: "2026-04-05"
4. type: troubleshooting-guide
5. Access Geneva Actions: https://aka.ms/GenevaActions
6. The **Collect Traces** function collects trace information from an HPC Cache using a Geneva Action operation.
7. Collect Traces is a **read/write action** — a valid Access Token for the specified Endpoint is required.
8. **Environment Parameter**
9. - `Environment`: Cloud environment used to create the cache
10. **HPC Cache Parameters**

### Phase 5: Support Operations — Get Cache Plus (HPC Cache)
> 来源: ADO Wiki (ado-wiki-a-support-operations-get-cache-plus.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Avere - HPC Cache/Support Operations - Get Cache PLus"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAvere%20-%20HPC%20Cache%2FSupport%20Operations%20-%20Get%20Cache%20PLus"
3. importDate: "2026-04-05"
4. type: troubleshooting-guide
5. Access Geneva Actions: https://aka.ms/GenevaActions
6. The **Get Cache Plus** operation retrieves initial diagnostic information from the HPC Cache using a Geneva Action. Returns: resource ID, Prod name (needed for debug environment access), contact information, current state, current and past conditions
7. Get Cache Plus is a **read-only action** — endpoint access token is NOT required. Logging in with an `ame.gbl` credential is sufficient.
8. **Environment Parameter**
9. - `Environment`: Cloud environment used to create the cache
10. **HPC Cache Parameters**

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Blob download fails when blob name has special Unicode multi-byte chars; old Java SDK encodes differently | Some Unicode chars consist of 2 chars but display as 1 glyph. Old Java SDK converts to single char,  | Upgrade to latest Java SDK. | 🟢 9 | [MCVKB] |
| 2 | Data copied to Data Box and uploaded to Azure, file count matches but total size on NAS source differs significantly fro | NAS devices (EMC Epsilon/Isilon) report physical size (with data protection) vs logical size (actual | Check source NAS for physical vs logical size. Explain: logical size (Azure) is smaller because Data Box allocates by ph | 🟢 8.5 | [ADO Wiki] |
| 3 | Need access to Config Hub for Azure Storage Devices root cause classification | User not a member of Confighub-Product-Author role | Go to CoreIdentity (https://coreidentity.microsoft.com) and request Confighub-Product-Author membership | 🟢 8.5 | [ADO Wiki] |
| 4 | Disk upload/download fails with permission denied when Entra ID data access auth enforced. Cannot generate SAS or upload | dataAccessAuthMode=AzureActiveDirectory requires Data Operator for managed disks RBAC role with Comp | Assign Data Operator for managed disks role. For snapshots also need snapshots/download\|upload/action. VHDs cannot uplo | 🔵 7.5 | [MS Learn] |
| 5 | Error 'AcquireDiskLeaseFailed': Failed to acquire lease while creating disk using blob with URI. Blob is already in use. | The VHD blob in storage has an active lease held by another disk/VM. Cannot create a new disk from a | Examine the blob metadata for disk reference information to identify which VM owns the disk. Detach or delete the confli | 🔵 7.0 | [MS Learn] |
