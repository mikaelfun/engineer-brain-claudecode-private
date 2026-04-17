# ARM Azure Stack Hub 存储 — 排查速查

**来源数**: 7 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | Azure Stack Hub Cluster Shared Volumes (CSV) are not in Online state, causing VM storage access fai… | One or more Cluster Shared Volumes not in Online state. | Run Test-AzsSupportKICsvNotOnline from the Azs.Support module to identify offline CSVs. | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 📋 | Azure Stack Hub CSV local mount point inaccessible despite all Volumes Online and VirtualDisks Heal… | CSV local mount point becomes inaccessible despite volumes and virtual disks showing healthy/online… | Run Test-AzsSupportKICSVLocalMountPointAccessible from the Azs.Support module. Use -Remediate for a… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 📋 | Azure Stack Hub storage adapters on physical nodes not RDMA capable or RDMA disabled, degrading sto… | Storage network adapters on physical cluster nodes have RDMA disabled or are not RDMA capable. | Run Test-AzsSupportKIRDMADisabledOnCluster from the Azs.Support module. Use -Remediate for automate… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 📋 | Azure Stack Hub VHD page blob has incorrect padding after being checked out from ACS (Azure Consist… | Checked-out VHD page blob contains incorrect padding bytes in ACS storage, which can cause data int… | Run Repair-AzsSupportIncorrectPaddingForCheckedOutVhdBlob -AccountName <storageAccount> -ContainerN… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 📋 | Azure Stack Hub ACS storage blob resize (shrink) operation fails or is blocked without explicit flag | By default, blob shrinking is not allowed in ACS unless the -Force flag is explicitly specified; en… | Use Resize-AzsSupportBlob -AccountName <sa> -ContainerName <ctn> -BlobName <blob> -NewSize <sizeByt… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 📋 | Azure Stack Hub diagnostic fileshare accumulates old or oversized diagnostic files consuming excess… | No automatic cleanup policy for diagnostic fileshare files; files open via SMB and reserved/special… | Run Start-AzsSupportStoragePruneDiagnosticFileShare [-DeleteFilesOlderThanDays <days>] [-DeleteFile… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 7 📋 | Azure Stack Hub infra VM or infrastructure host is running low on disk space | Accumulated files on infra VMs/hosts not cleaned according to recycle settings in appSettings.json | Run Clear-AzSSupportDiskSpace [-ComputerName <name1>,<name2>] to clear disk space based on recycle … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |

## 快速排查路径
1. Run Test-AzsSupportKICsvNotOnline from the Azs.Support module to identify offli… `[来源: ado-wiki]`
2. Run Test-AzsSupportKICSVLocalMountPointAccessible from the Azs.Support module. … `[来源: ado-wiki]`
3. Run Test-AzsSupportKIRDMADisabledOnCluster from the Azs.Support module. Use -Re… `[来源: ado-wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/ash-storage.md#排查流程)
