# ARM Azure Stack Hub AzS Support 诊断命令 misc blob service — 排查速查

**来源数**: 15 | **21V**: 部分
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | Azure Stack Hub C:\temp is a file instead of a directory, causing various stamp actions to fail | Running New-Item C:\temp without -ItemType Directory creates a file by default, which blocks operat… | Run Test-AzsSupportKITempDirIsAFile to detect the issue. Use -Remediate flag to fix by removing the… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 📋 | Azure Stack Hub PEP (Privileged Endpoint) session was not created using en-US culture, causing comm… | When PEP session is created with non-en-US culture, PowerShell cmdlets may fail or produce unexpect… | Run Test-AzsSupportKICultureIsNotEnUs to verify PEP session culture. Recreate the PEP session using… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 📋 | Azure Stack Hub blob service errors due to changed volume ID -- blob service logs show failures cau… | Volume ID changed on storage node, causing blob service to encounter errors when accessing the affe… | Run Test-AzsSupportKIBlobServiceErrorInChangedVolumeId from Azs.Support module to detect blob servi… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 📋 | Azure Stack Hub blob service share notification missing -- file handlers opened to volume were not … | File handlers opened to a storage volume were not properly closed during host migration, leaving sh… | Run Test-AzsSupportKIBlobSvcShareNotificationMissing to detect; use -Remediate flag for automated r… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 📋 | Azure Stack Hub physical disks showing Lost Communication OperationalStatus across physical nodes | Physical disks lost communication with the storage subsystem, OperationalStatus shows Lost Communic… | Run Test-AzsSupportKIPhysicalDiskLostCommunication to check across all physical nodes for disks wit… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 📋 | Azure Stack Hub physical disks marked as Retired across physical nodes | Physical disks reached retirement status in the storage subsystem | Run Test-AzsSupportKIPhysicalDiskRetired to check across all physical nodes for disks marked as Ret… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 7 📋 | Azure Stack Hub infrastructure virtual machines in a specific role (e.g., FabricRingServices, WASPU… | Infrastructure VM role health degradation requiring coordinated restart via safe action plans | Use Restart-AzsSupportComputerByRole -Role:<RoleName> to safely restart all infrastructure VMs in t… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 8 📋 | Azure Stack Hub ADFS integration issues - identity provider configuration or connectivity problems | ADFS integration can break due to certificate expiration, endpoint connectivity issues, or configur… | Run Test-AzsSupportKIADFSIntegration to check ADFS integration. Use -SkipVersionCheck to verify on … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 9 📋 | Azure Stack Hub CSV owner nodes unevenly distributed -- Cluster Shared Volume ownership is not bala… | CSV owner nodes became unbalanced, potentially after node maintenance or failover events | Run Test-AzsSupportKICsvOwnerNodesUnbalanced to detect uneven CSV owner node distribution across th… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 10 📋 | Azure Stack Hub DI Scan configuration drift -- some nodes have DI Scan disabled while others do not… | Configuration drift across cluster nodes where DI Scan disabled state is not consistent (some nodes… | Run Test-AzsSupportKIDIScanDisabled to detect DI Scan configuration drift across all nodes and iden… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 11 📋 | Azure Stack Hub Table or Queue requests fail with HTTP 500 during or after admin operations (FRU/PN… | ESENT Error 59 occurs after upgrading to Azure Stack Hub 1908 or later, triggered by CSV move or ph… | Run Test-AzsSupportKITableServerESENTError59 to detect ESENT Error 59 condition. Use -SkipVersionCh… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 12 📋 | Azure Stack Hub smphost.exe process hang -- storage subsystem and virtual disk operations become un… | Storage Management Provider Host (smphost) encounters problems with the storage subsystem, causing … | Run Test-AzsSupportKISmphostHang to detect smphost hang conditions. Use -Remediate flag for automat… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 13 📋 | Azure Stack Hub service fabric container needs hotpatching, or a previously applied container hotpa… | — | Use Start-AzsSupportContainerHotpatch cmdlet. Required params: -HOTPATCHPACKAGE <zip with patch lay… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 14 📋 | Azure Stack Hub ECE action plan instance failed (e.g. MAS Update, RotateSecret, Backup) and need to… | — | Use Get-AzsSupportActionPlanInstance with filters: -Name 'MAS Update' or -Name 'Update*Rerun' (wild… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 15 📋 | Need to retrieve Azure Stack Hub infrastructure VM objects (ACS, SeedRingServices, FabricRingServic… | — | Use Get-AzsSupportInfrastructureVM from Azs.Support Module. Filter by -Role (ACS, FabricRingService… | 🔵 6.0 — ado-wiki | [ADO Wiki] |

## 快速排查路径
1. Run Test-AzsSupportKITempDirIsAFile to detect the issue. Use -Remediate flag to… `[来源: ado-wiki]`
2. Run Test-AzsSupportKICultureIsNotEnUs to verify PEP session culture. Recreate t… `[来源: ado-wiki]`
3. Run Test-AzsSupportKIBlobServiceErrorInChangedVolumeId from Azs.Support module … `[来源: ado-wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/ash-azs-cmdlets-misc-blob-service.md#排查流程)
