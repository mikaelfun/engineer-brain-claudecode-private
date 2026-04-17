# ARM Azure Stack Hub AzS Support 诊断命令 misc blob service — 综合排查指南

**条目数**: 15 | **草稿融合数**: 67 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-a-AzsSupportComputeInfra.md, ado-wiki-a-AzsSupportCpiClusterNodeState.md, ado-wiki-a-AzsSupportGuestLogCollection.md, ado-wiki-a-AzsSupportVMConnect.md, ado-wiki-a-Clear-AzsSupportWorkingDirectory.md (+62 more)
**Kusto 引用**: —
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Azure Stack Hub ADFS integration issues - identity provider configuration or co…
> 来源: ado-wiki

**根因分析**: ADFS integration can break due to certificate expiration, endpoint connectivity issues, or configuration drift between Azure Stack Hub and ADFS server

1. Run Test-AzsSupportKIADFSIntegration to check ADFS integration.
2. Use -SkipVersionCheck to verify on additional builds for recurring issues.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 2: Azure Stack Hub C:\temp is a file instead of a directory, causing various stamp…
> 来源: ado-wiki

**根因分析**: Running New-Item C:\temp without -ItemType Directory creates a file by default, which blocks operations expecting C:\temp to be a directory

1. Run Test-AzsSupportKITempDirIsAFile to detect the issue.
2. Use -Remediate flag to fix by removing the file and creating the correct directory.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 3: Azure Stack Hub PEP (Privileged Endpoint) session was not created using en-US c…
> 来源: ado-wiki

**根因分析**: When PEP session is created with non-en-US culture, PowerShell cmdlets may fail or produce unexpected output due to locale-dependent formatting

1. Run Test-AzsSupportKICultureIsNotEnUs to verify PEP session culture.
2. Recreate the PEP session using en-US culture if needed.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 4: Azure Stack Hub blob service errors due to changed volume ID -- blob service lo…
> 来源: ado-wiki

**根因分析**: Volume ID changed on storage node, causing blob service to encounter errors when accessing the affected volume

1. Run Test-AzsSupportKIBlobServiceErrorInChangedVolumeId from Azs.
2. Support module to detect blob service errors caused by changed volume IDs across all nodes (scans latest 5 days of logs).

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 5: Azure Stack Hub blob service share notification missing -- file handlers opened…
> 来源: ado-wiki

**根因分析**: File handlers opened to a storage volume were not properly closed during host migration, leaving share notifications in an inconsistent state

1. Run Test-AzsSupportKIBlobSvcShareNotificationMissing to detect; use -Remediate flag for automated remediation.
2. Supports -SkipVersionCheck for recurring issues on unlisted builds.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 6: Azure Stack Hub CSV owner nodes unevenly distributed -- Cluster Shared Volume o…
> 来源: ado-wiki

**根因分析**: CSV owner nodes became unbalanced, potentially after node maintenance or failover events

1. Run Test-AzsSupportKICsvOwnerNodesUnbalanced to detect uneven CSV owner node distribution across the cluster.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 7: Azure Stack Hub DI Scan configuration drift -- some nodes have DI Scan disabled…
> 来源: ado-wiki

**根因分析**: Configuration drift across cluster nodes where DI Scan disabled state is not consistent (some nodes disabled, others not)

1. Run Test-AzsSupportKIDIScanDisabled to detect DI Scan configuration drift across all nodes and identify which nodes have inconsistent settings.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 8: Azure Stack Hub physical disks showing Lost Communication OperationalStatus acr…
> 来源: ado-wiki

**根因分析**: Physical disks lost communication with the storage subsystem, OperationalStatus shows Lost Communication

1. Run Test-AzsSupportKIPhysicalDiskLostCommunication to check across all physical nodes for disks with OperationalStatus of Lost Communication.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 9: Azure Stack Hub physical disks marked as Retired across physical nodes
> 来源: ado-wiki

**根因分析**: Physical disks reached retirement status in the storage subsystem

1. Run Test-AzsSupportKIPhysicalDiskRetired to check across all physical nodes for disks marked as Retired.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 10: Azure Stack Hub Table or Queue requests fail with HTTP 500 during or after admi…
> 来源: ado-wiki

**根因分析**: ESENT Error 59 occurs after upgrading to Azure Stack Hub 1908 or later, triggered by CSV move or physical node reboot during admin operations (FRU, PNU)

1. Run Test-AzsSupportKITableServerESENTError59 to detect ESENT Error 59 condition.
2. Use -SkipVersionCheck for recurring issues on builds not in default appliesTo list.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 11: Azure Stack Hub smphost.exe process hang -- storage subsystem and virtual disk …
> 来源: ado-wiki

**根因分析**: Storage Management Provider Host (smphost) encounters problems with the storage subsystem, causing hangs in storage and virtual disk operations

1. Run Test-AzsSupportKISmphostHang to detect smphost hang conditions.
2. Use -Remediate flag for automated remediation steps.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 12: Azure Stack Hub service fabric container needs hotpatching, or a previously app…
> 来源: ado-wiki

1. Use Start-AzsSupportContainerHotpatch cmdlet.
2. Required params: -HOTPATCHPACKAGE <zip with patch layers> -APPLICATIONNAME <SF app> -SERVICEMANIFESTNAME <manifest> -REGISTRYNAME <registry name:port> -CONTAINERREGISTRYPATH <path on SU1 fileshare>.
3. To revert a hotpatch back to original image, add -REVERT parameter.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 13: Azure Stack Hub ECE action plan instance failed (e.g. MAS Update, RotateSecret,…
> 来源: ado-wiki

1. Use Get-AzsSupportActionPlanInstance with filters: -Name 'MAS Update' or -Name 'Update*Rerun' (wildcards supported), -Status:Failed for failed plans, -Active for active plans, -FromDate for time range.
2. Drill into specific plan: -ActionPlanInstanceID <guid> lists steps with status/timestamps.
3. Export progress: -ProgressAsXml | Out-File.
4. Use Get-AzsSupportActionPlanInstanceLogs to interactively collect verbose logs and XML.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 14: Need to retrieve Azure Stack Hub infrastructure VM objects (ACS, SeedRingServic…
> 来源: ado-wiki

1. Use Get-AzsSupportInfrastructureVM from Azs.
2. Support Module.
3. Filter by -Role (ACS, FabricRingServices, etc.
4. Use -MemoryPressure to check memory state.
5. Examples: Get-AzsSupportInfrastructureVM -Role:ACS; Get-AzsSupportInfrastructureVM -Role:FabricRingServices -MemoryPressure.

`[结论: 🔵 6.0/10 — [ADO Wiki]]`

### Phase 15: Azure Stack Hub infrastructure virtual machines in a specific role (e.g., Fabri…
> 来源: ado-wiki

**根因分析**: Infrastructure VM role health degradation requiring coordinated restart via safe action plans

1. Use Restart-AzsSupportComputerByRole -Role:<RoleName> to safely restart all infrastructure VMs in the specified role.
2. Only supports virtual machine roles.
3. Uses ECE safe restart action plans to ensure proper sequencing.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

## 判断逻辑

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| Azure Stack Hub ADFS integration issues - identity provider… | ADFS integration can break due to certificate expiration, e… | Run Test-AzsSupportKIADFSIntegration to check ADFS integrat… |
| Azure Stack Hub C:\temp is a file instead of a directory, c… | Running New-Item C:\temp without -ItemType Directory create… | Run Test-AzsSupportKITempDirIsAFile to detect the issue. Us… |
| Azure Stack Hub PEP (Privileged Endpoint) session was not c… | When PEP session is created with non-en-US culture, PowerSh… | Run Test-AzsSupportKICultureIsNotEnUs to verify PEP session… |
| Azure Stack Hub blob service errors due to changed volume I… | Volume ID changed on storage node, causing blob service to … | Run Test-AzsSupportKIBlobServiceErrorInChangedVolumeId from… |
| Azure Stack Hub blob service share notification missing -- … | File handlers opened to a storage volume were not properly … | Run Test-AzsSupportKIBlobSvcShareNotificationMissing to det… |
| Azure Stack Hub CSV owner nodes unevenly distributed -- Clu… | CSV owner nodes became unbalanced, potentially after node m… | Run Test-AzsSupportKICsvOwnerNodesUnbalanced to detect unev… |
| Azure Stack Hub DI Scan configuration drift -- some nodes h… | Configuration drift across cluster nodes where DI Scan disa… | Run Test-AzsSupportKIDIScanDisabled to detect DI Scan confi… |
| Azure Stack Hub physical disks showing Lost Communication O… | Physical disks lost communication with the storage subsyste… | Run Test-AzsSupportKIPhysicalDiskLostCommunication to check… |
| Azure Stack Hub physical disks marked as Retired across phy… | Physical disks reached retirement status in the storage sub… | Run Test-AzsSupportKIPhysicalDiskRetired to check across al… |
| Azure Stack Hub Table or Queue requests fail with HTTP 500 … | ESENT Error 59 occurs after upgrading to Azure Stack Hub 19… | Run Test-AzsSupportKITableServerESENTError59 to detect ESEN… |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Azure Stack Hub C:\temp is a file instead of a directory, causing various stamp actions to fail | Running New-Item C:\temp without -ItemType Directory creates a file by default, which blocks operat… | Run Test-AzsSupportKITempDirIsAFile to detect the issue. Use -Remediate flag to fix by removing the… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 | Azure Stack Hub PEP (Privileged Endpoint) session was not created using en-US culture, causing comm… | When PEP session is created with non-en-US culture, PowerShell cmdlets may fail or produce unexpect… | Run Test-AzsSupportKICultureIsNotEnUs to verify PEP session culture. Recreate the PEP session using… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 | Azure Stack Hub blob service errors due to changed volume ID -- blob service logs show failures cau… | Volume ID changed on storage node, causing blob service to encounter errors when accessing the affe… | Run Test-AzsSupportKIBlobServiceErrorInChangedVolumeId from Azs.Support module to detect blob servi… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 | Azure Stack Hub blob service share notification missing -- file handlers opened to volume were not … | File handlers opened to a storage volume were not properly closed during host migration, leaving sh… | Run Test-AzsSupportKIBlobSvcShareNotificationMissing to detect; use -Remediate flag for automated r… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 | Azure Stack Hub physical disks showing Lost Communication OperationalStatus across physical nodes | Physical disks lost communication with the storage subsystem, OperationalStatus shows Lost Communic… | Run Test-AzsSupportKIPhysicalDiskLostCommunication to check across all physical nodes for disks wit… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 | Azure Stack Hub physical disks marked as Retired across physical nodes | Physical disks reached retirement status in the storage subsystem | Run Test-AzsSupportKIPhysicalDiskRetired to check across all physical nodes for disks marked as Ret… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 7 | Azure Stack Hub infrastructure virtual machines in a specific role (e.g., FabricRingServices, WASPU… | Infrastructure VM role health degradation requiring coordinated restart via safe action plans | Use Restart-AzsSupportComputerByRole -Role:<RoleName> to safely restart all infrastructure VMs in t… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 8 | Azure Stack Hub ADFS integration issues - identity provider configuration or connectivity problems | ADFS integration can break due to certificate expiration, endpoint connectivity issues, or configur… | Run Test-AzsSupportKIADFSIntegration to check ADFS integration. Use -SkipVersionCheck to verify on … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 9 | Azure Stack Hub CSV owner nodes unevenly distributed -- Cluster Shared Volume ownership is not bala… | CSV owner nodes became unbalanced, potentially after node maintenance or failover events | Run Test-AzsSupportKICsvOwnerNodesUnbalanced to detect uneven CSV owner node distribution across th… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 10 | Azure Stack Hub DI Scan configuration drift -- some nodes have DI Scan disabled while others do not… | Configuration drift across cluster nodes where DI Scan disabled state is not consistent (some nodes… | Run Test-AzsSupportKIDIScanDisabled to detect DI Scan configuration drift across all nodes and iden… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 11 | Azure Stack Hub Table or Queue requests fail with HTTP 500 during or after admin operations (FRU/PN… | ESENT Error 59 occurs after upgrading to Azure Stack Hub 1908 or later, triggered by CSV move or ph… | Run Test-AzsSupportKITableServerESENTError59 to detect ESENT Error 59 condition. Use -SkipVersionCh… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 12 | Azure Stack Hub smphost.exe process hang -- storage subsystem and virtual disk operations become un… | Storage Management Provider Host (smphost) encounters problems with the storage subsystem, causing … | Run Test-AzsSupportKISmphostHang to detect smphost hang conditions. Use -Remediate flag for automat… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 13 | Azure Stack Hub service fabric container needs hotpatching, or a previously applied container hotpa… | — | Use Start-AzsSupportContainerHotpatch cmdlet. Required params: -HOTPATCHPACKAGE <zip with patch lay… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 14 | Azure Stack Hub ECE action plan instance failed (e.g. MAS Update, RotateSecret, Backup) and need to… | — | Use Get-AzsSupportActionPlanInstance with filters: -Name 'MAS Update' or -Name 'Update*Rerun' (wild… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 15 | Need to retrieve Azure Stack Hub infrastructure VM objects (ACS, SeedRingServices, FabricRingServic… | — | Use Get-AzsSupportInfrastructureVM from Azs.Support Module. Filter by -Role (ACS, FabricRingService… | 🔵 6.0 — ado-wiki | [ADO Wiki] |
