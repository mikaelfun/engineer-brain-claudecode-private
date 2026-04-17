# ARM Azure Stack Hub 存储 — 综合排查指南

**条目数**: 7 | **草稿融合数**: 7 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-b-azure-consistent-storage-acs.md, ado-wiki-d-Get-AzsSupportDBPathByStorageAccount.md, ado-wiki-d-Get-AzsSupportStorageAccountProperties.md, ado-wiki-d-azs-get-storage-subsystem-debug.md, ado-wiki-d-azs-start-storage-diagnostic.md (+2 more)
**Kusto 引用**: —
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Azure Stack Hub Cluster Shared Volumes (CSV) are not in Online state, causing V…
> 来源: ado-wiki

**根因分析**: One or more Cluster Shared Volumes not in Online state.

1. Run Test-AzsSupportKICsvNotOnline from the Azs.
2. Support module to identify offline CSVs.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 2: Azure Stack Hub CSV local mount point inaccessible despite all Volumes Online a…
> 来源: ado-wiki

**根因分析**: CSV local mount point becomes inaccessible despite volumes and virtual disks showing healthy/online status.

1. Run Test-AzsSupportKICSVLocalMountPointAccessible from the Azs.
2. Support module.
3. Use -Remediate for automated fix.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 3: Azure Stack Hub storage adapters on physical nodes not RDMA capable or RDMA dis…
> 来源: ado-wiki

**根因分析**: Storage network adapters on physical cluster nodes have RDMA disabled or are not RDMA capable.

1. Run Test-AzsSupportKIRDMADisabledOnCluster from the Azs.
2. Support module.
3. Use -Remediate for automated fix.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 4: Azure Stack Hub VHD page blob has incorrect padding after being checked out fro…
> 来源: ado-wiki

**根因分析**: Checked-out VHD page blob contains incorrect padding bytes in ACS storage, which can cause data integrity issues

1. Run Repair-AzsSupportIncorrectPaddingForCheckedOutVhdBlob -AccountName <storageAccount> -ContainerName <container> -BlobName <blobName> [-Credential <domainAdminCred>] [-AcsVmName <acsVm>] to detect and repair the padding issue on the affected ACS VM.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 5: Azure Stack Hub ACS storage blob resize (shrink) operation fails or is blocked …
> 来源: ado-wiki

**根因分析**: By default, blob shrinking is not allowed in ACS unless the -Force flag is explicitly specified; enlargement is allowed without restrictions

1. Use Resize-AzsSupportBlob -AccountName <sa> -ContainerName <ctn> -BlobName <blob> -NewSize <sizeBytes> -Force to shrink a blob.
2. Omit -Force for standard enlargement.
3. Parameters: -AccountName, -ContainerName, -BlobName, -NewSize, -Force (optional), -Credential, -AcsVmName.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 6: Azure Stack Hub diagnostic fileshare accumulates old or oversized diagnostic fi…
> 来源: ado-wiki

**根因分析**: No automatic cleanup policy for diagnostic fileshare files; files open via SMB and reserved/special folders with different retention config are excluded from deletion

1. Run Start-AzsSupportStoragePruneDiagnosticFileShare [-DeleteFilesOlderThanDays <days>] [-DeleteFilesBiggerThanGB <gb>] to prune diagnostic files.
2. Files open via SMB are safely skipped.
3. Reserved/special folders excluded.
4. Example: Start-AzsSupportStoragePruneDiagnosticFileShare -DeleteFilesOlderThanDays 30 -DeleteFilesBiggerThanGB 5.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 7: Azure Stack Hub infra VM or infrastructure host is running low on disk space
> 来源: ado-wiki

**根因分析**: Accumulated files on infra VMs/hosts not cleaned according to recycle settings in appSettings.json

1. Run Clear-AzSSupportDiskSpace [-ComputerName <name1>,<name2>] to clear disk space based on recycle settings in appSettings.
2. Tracks cleanup records in AzS.
3. Support log.
4. Example: Clear-AzSSupportDiskSpace -ComputerName "PREFIX-Node01","PREFIX-XRP01".

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

## 判断逻辑

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| Azure Stack Hub Cluster Shared Volumes (CSV) are not in Onl… | One or more Cluster Shared Volumes not in Online state. | Run Test-AzsSupportKICsvNotOnline from the Azs.Support modu… |
| Azure Stack Hub CSV local mount point inaccessible despite … | CSV local mount point becomes inaccessible despite volumes … | Run Test-AzsSupportKICSVLocalMountPointAccessible from the … |
| Azure Stack Hub storage adapters on physical nodes not RDMA… | Storage network adapters on physical cluster nodes have RDM… | Run Test-AzsSupportKIRDMADisabledOnCluster from the Azs.Sup… |
| Azure Stack Hub VHD page blob has incorrect padding after b… | Checked-out VHD page blob contains incorrect padding bytes … | Run Repair-AzsSupportIncorrectPaddingForCheckedOutVhdBlob -… |
| Azure Stack Hub ACS storage blob resize (shrink) operation … | By default, blob shrinking is not allowed in ACS unless the… | Use Resize-AzsSupportBlob -AccountName <sa> -ContainerName … |
| Azure Stack Hub diagnostic fileshare accumulates old or ove… | No automatic cleanup policy for diagnostic fileshare files;… | Run Start-AzsSupportStoragePruneDiagnosticFileShare [-Delet… |
| Azure Stack Hub infra VM or infrastructure host is running … | Accumulated files on infra VMs/hosts not cleaned according … | Run Clear-AzSSupportDiskSpace [-ComputerName <name1>,<name2… |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Azure Stack Hub Cluster Shared Volumes (CSV) are not in Online state, causing VM storage access fai… | One or more Cluster Shared Volumes not in Online state. | Run Test-AzsSupportKICsvNotOnline from the Azs.Support module to identify offline CSVs. | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 | Azure Stack Hub CSV local mount point inaccessible despite all Volumes Online and VirtualDisks Heal… | CSV local mount point becomes inaccessible despite volumes and virtual disks showing healthy/online… | Run Test-AzsSupportKICSVLocalMountPointAccessible from the Azs.Support module. Use -Remediate for a… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 | Azure Stack Hub storage adapters on physical nodes not RDMA capable or RDMA disabled, degrading sto… | Storage network adapters on physical cluster nodes have RDMA disabled or are not RDMA capable. | Run Test-AzsSupportKIRDMADisabledOnCluster from the Azs.Support module. Use -Remediate for automate… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 | Azure Stack Hub VHD page blob has incorrect padding after being checked out from ACS (Azure Consist… | Checked-out VHD page blob contains incorrect padding bytes in ACS storage, which can cause data int… | Run Repair-AzsSupportIncorrectPaddingForCheckedOutVhdBlob -AccountName <storageAccount> -ContainerN… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 | Azure Stack Hub ACS storage blob resize (shrink) operation fails or is blocked without explicit flag | By default, blob shrinking is not allowed in ACS unless the -Force flag is explicitly specified; en… | Use Resize-AzsSupportBlob -AccountName <sa> -ContainerName <ctn> -BlobName <blob> -NewSize <sizeByt… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 | Azure Stack Hub diagnostic fileshare accumulates old or oversized diagnostic files consuming excess… | No automatic cleanup policy for diagnostic fileshare files; files open via SMB and reserved/special… | Run Start-AzsSupportStoragePruneDiagnosticFileShare [-DeleteFilesOlderThanDays <days>] [-DeleteFile… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 7 | Azure Stack Hub infra VM or infrastructure host is running low on disk space | Accumulated files on infra VMs/hosts not cleaned according to recycle settings in appSettings.json | Run Clear-AzSSupportDiskSpace [-ComputerName <name1>,<name2>] to clear disk space based on recycle … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
