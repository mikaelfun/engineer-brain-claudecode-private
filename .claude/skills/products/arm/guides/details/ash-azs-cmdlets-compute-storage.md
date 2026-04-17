# ARM Azure Stack Hub AzS Support 诊断命令 compute storage — 综合排查指南

**条目数**: 14 | **草稿融合数**: 72 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-a-AzsSupportComputeInfra.md, ado-wiki-a-AzsSupportCpiClusterNodeState.md, ado-wiki-a-AzsSupportGuestLogCollection.md, ado-wiki-a-AzsSupportVMConnect.md, ado-wiki-a-Clear-AzsSupportWorkingDirectory.md (+67 more)
**Kusto 引用**: —
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Azure Stack Hub virtual machines are orphaned or ghosted - VMs exist in the sys…
> 来源: ado-wiki

**根因分析**: VM records become orphaned when the management layer loses track of VMs due to failed operations, interrupted deployments, or database inconsistencies

1. Run Test-AzsSupportKIOrphanedVMs from the Azs.
2. Support module to detect and identify orphaned/ghosted VMs on Azure Stack Hub.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 2: Azure Stack Hub nodes experienced unexpected reboots - event viewer logs show u…
> 来源: ado-wiki

**根因分析**: Unexpected reboots can be caused by hardware failures, bugcheck/BSOD, firmware issues, or unplanned power events on Azure Stack Hub infrastructure

1. Run Test-AzsSupportKIUnexpectedReboot to check event viewer logs.
2. Use -IncludeGracefulShutdowns to include graceful shutdowns, -IncludeInfrastructureVMs to check infra VMs.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 3: Azure Stack Hub cluster nodes have OS activation or licensing issues - activati…
> 来源: ado-wiki

**根因分析**: OS activation markers can become invalid after host reimaging, time sync issues, or KMS connectivity problems on Azure Stack Hub nodes

1. Run Test-AzsSupportKIOSActivationMarker to verify OS Activation Marker/License Status across all cluster nodes.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 4: Azure Stack Hub Service Fabric cluster health is degraded or unhealthy
> 来源: ado-wiki

**根因分析**: Service Fabric cluster health degradation can result from node failures, replica issues, application errors, or infrastructure component problems

1. Run Test-AzsSupportKIServiceFabricClusterHealth to validate the health of Service Fabric clusters in Azure Stack Hub.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 5: Azure Stack Hub Service Fabric nodes are in disabled state - nodes are not enab…
> 来源: ado-wiki

**根因分析**: Service Fabric nodes can become disabled after failed updates, node repairs, or manual administrative actions that were not properly completed

1. Run Test-AzsSupportKIServiceFabricNodesDisabled to check all Fabric Rings for nodes that are not enabled.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 6: Azure Stack Hub C:\HealthAgent directory is missing on infrastructure nodes
> 来源: ado-wiki

**根因分析**: The C:\HealthAgent directory can be missing after node reimaging or failed health agent installation, preventing health monitoring

1. Run Test-AzsSupportKIHealthAgentDirIsMissing to check if C:\HealthAgent exists.
2. Use -Remediate flag to automatically fix.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 7: Azure Stack Hub Host Health Agent service is not running or in a failed state o…
> 来源: ado-wiki

**根因分析**: The Health Agent service may stop or fail to start due to service crashes, configuration corruption, or dependency service failures

1. Run Test-AzsSupportKIHostHealthagent to validate the Health Agent Service status on hosts.
2. Use -Remediate flag to automatically restart.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 8: Azure Stack Hub: Duplicate infrastructure or tenant virtual machines detected i…
> 来源: ado-wiki

**根因分析**: VM duplication in the Hyper-V layer on Azure Stack Hub compute nodes; duplicate infra or tenant VMs registered in Hyper-V

1. Run Test-AzsSupportKIDuplicateVMs from Azs.
2. Support Module (CSSTools) to identify duplicate infra or tenant VMs in Hyper-V.
3. Review output to determine affected VMs and coordinate remediation.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 9: Azure Stack Hub: Infrastructure VMs or tenant VMs fail to start up; VMs stuck i…
> 来源: ado-wiki

**根因分析**: Disks ACL missing on infrastructure VMs on Azure Stack Hub compute nodes; incorrect or absent access control list on VM disk files causing startup failures

1. Run Test-AzSSupportKIDiskACLMissing from Azs.
2. Support Module (CSSTools).
3. Use -AllVMs to test all VMs, -ComputerName for specific VMs (use Hyper-V VM names), or -Remediate for automated ACL remediation.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 10: Azure Stack Hub: Cluster Shared Volume (CSV) mount point references a GUID inst…
> 来源: ado-wiki

**根因分析**: Invalid CSV mount point configuration on Azure Stack Hub; the mount point path is referencing a GUID rather than a valid local path

1. Run Test-AzsSupportKICSVMountPoint from Azs.
2. Support Module (CSSTools) to validate that CSV mount points reference local paths and not GUIDs.
3. Use -Remediate flag for automated remediation.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 11: Azure Stack Hub blob has an infinite or stuck lease preventing blob/container d…
> 来源: ado-wiki

1. Use CSSTools Invoke-AzsSupportBreakBlobLease to forcibly break the blob lease: `Invoke-AzsSupportBreakBlobLease -AccountName <sa> -ContainerName <ctn> -BlobName <blob> [-LeaseBreakingPeriod <period>]`.
2. Requires -Credential (domain admin) and -AcsVmName if not running on ACS VM directly.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 12: Azure Stack Hub blob is stuck in checked-out/locked state with an orphaned acqu…
> 来源: ado-wiki

1. Use CSSTools Invoke-AzsSupportCheckInBlob: `Invoke-AzsSupportCheckInBlob -AccountName <sa> -ContainerName <ctn> -BlobName <blob> -AcquisitionId <id>`.
2. Use -Force flag to release without requiring the acquisition ID when ID is unknown.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 13: Azure Stack Hub tenant VM disk VHD file is fragmented on s-cluster causing I/O …
> 来源: ado-wiki

1. Use CSSTools Invoke-AzsSupportDiskVhdDefrag: `Invoke-AzsSupportDiskVhdDefrag -VhdPath \\su1fileserver.
2. xxx\path\to\disk.
3. Provide the full UNC share path to the VHD on s-cluster storage.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 14: Azure Stack Hub empty blob container needs to be rebalanced or migrated from on…
> 来源: ado-wiki

1. Use CSSTools Move-AzsSupportEmptyBlobContainer: `Move-AzsSupportEmptyBlobContainer -AccountName <sa> -ContainerName <ctn> -DestShare <share>`.
2. Container must be empty before moving.
3. Requires -Credential (domain admin) and -AcsVmName for remote execution.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

## 判断逻辑

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| Azure Stack Hub virtual machines are orphaned or ghosted - … | VM records become orphaned when the management layer loses … | Run Test-AzsSupportKIOrphanedVMs from the Azs.Support modul… |
| Azure Stack Hub nodes experienced unexpected reboots - even… | Unexpected reboots can be caused by hardware failures, bugc… | Run Test-AzsSupportKIUnexpectedReboot to check event viewer… |
| Azure Stack Hub cluster nodes have OS activation or licensi… | OS activation markers can become invalid after host reimagi… | Run Test-AzsSupportKIOSActivationMarker to verify OS Activa… |
| Azure Stack Hub Service Fabric cluster health is degraded o… | Service Fabric cluster health degradation can result from n… | Run Test-AzsSupportKIServiceFabricClusterHealth to validate… |
| Azure Stack Hub Service Fabric nodes are in disabled state … | Service Fabric nodes can become disabled after failed updat… | Run Test-AzsSupportKIServiceFabricNodesDisabled to check al… |
| Azure Stack Hub C:\HealthAgent directory is missing on infr… | The C:\HealthAgent directory can be missing after node reim… | Run Test-AzsSupportKIHealthAgentDirIsMissing to check if C:… |
| Azure Stack Hub Host Health Agent service is not running or… | The Health Agent service may stop or fail to start due to s… | Run Test-AzsSupportKIHostHealthagent to validate the Health… |
| Azure Stack Hub: Duplicate infrastructure or tenant virtual… | VM duplication in the Hyper-V layer on Azure Stack Hub comp… | Run Test-AzsSupportKIDuplicateVMs from Azs.Support Module (… |
| Azure Stack Hub: Infrastructure VMs or tenant VMs fail to s… | Disks ACL missing on infrastructure VMs on Azure Stack Hub … | Run Test-AzSSupportKIDiskACLMissing from Azs.Support Module… |
| Azure Stack Hub: Cluster Shared Volume (CSV) mount point re… | Invalid CSV mount point configuration on Azure Stack Hub; t… | Run Test-AzsSupportKICSVMountPoint from Azs.Support Module … |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Azure Stack Hub virtual machines are orphaned or ghosted - VMs exist in the system but are not prop… | VM records become orphaned when the management layer loses track of VMs due to failed operations, i… | Run Test-AzsSupportKIOrphanedVMs from the Azs.Support module to detect and identify orphaned/ghoste… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 | Azure Stack Hub nodes experienced unexpected reboots - event viewer logs show unplanned restart eve… | Unexpected reboots can be caused by hardware failures, bugcheck/BSOD, firmware issues, or unplanned… | Run Test-AzsSupportKIUnexpectedReboot to check event viewer logs. Use -IncludeGracefulShutdowns to … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 | Azure Stack Hub cluster nodes have OS activation or licensing issues - activation markers are missi… | OS activation markers can become invalid after host reimaging, time sync issues, or KMS connectivit… | Run Test-AzsSupportKIOSActivationMarker to verify OS Activation Marker/License Status across all cl… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 | Azure Stack Hub: Duplicate infrastructure or tenant virtual machines detected in Hyper-V, causing r… | VM duplication in the Hyper-V layer on Azure Stack Hub compute nodes; duplicate infra or tenant VMs… | Run Test-AzsSupportKIDuplicateVMs from Azs.Support Module (CSSTools) to identify duplicate infra or… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 | Azure Stack Hub: Infrastructure VMs or tenant VMs fail to start up; VMs stuck in off or failed stat… | Disks ACL missing on infrastructure VMs on Azure Stack Hub compute nodes; incorrect or absent acces… | Run Test-AzSSupportKIDiskACLMissing from Azs.Support Module (CSSTools). Use -AllVMs to test all VMs… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 | Azure Stack Hub: Cluster Shared Volume (CSV) mount point references a GUID instead of a local path,… | Invalid CSV mount point configuration on Azure Stack Hub; the mount point path is referencing a GUI… | Run Test-AzsSupportKICSVMountPoint from Azs.Support Module (CSSTools) to validate that CSV mount po… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 7 | Azure Stack Hub blob has an infinite or stuck lease preventing blob/container deletion (CannotDelet… | — | Use CSSTools Invoke-AzsSupportBreakBlobLease to forcibly break the blob lease: `Invoke-AzsSupportBr… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 8 | Azure Stack Hub blob is stuck in checked-out/locked state with an orphaned acquisition ID, preventi… | — | Use CSSTools Invoke-AzsSupportCheckInBlob: `Invoke-AzsSupportCheckInBlob -AccountName <sa> -Contain… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 9 | Azure Stack Hub tenant VM disk VHD file is fragmented on s-cluster causing I/O performance degradat… | — | Use CSSTools Invoke-AzsSupportDiskVhdDefrag: `Invoke-AzsSupportDiskVhdDefrag -VhdPath \\su1fileserv… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 10 | Azure Stack Hub empty blob container needs to be rebalanced or migrated from one s-cluster share to… | — | Use CSSTools Move-AzsSupportEmptyBlobContainer: `Move-AzsSupportEmptyBlobContainer -AccountName <sa… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 11 | Azure Stack Hub Service Fabric cluster health is degraded or unhealthy | Service Fabric cluster health degradation can result from node failures, replica issues, applicatio… | Run Test-AzsSupportKIServiceFabricClusterHealth to validate the health of Service Fabric clusters i… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 12 | Azure Stack Hub Service Fabric nodes are in disabled state - nodes are not enabled across Fabric Ri… | Service Fabric nodes can become disabled after failed updates, node repairs, or manual administrati… | Run Test-AzsSupportKIServiceFabricNodesDisabled to check all Fabric Rings for nodes that are not en… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 13 | Azure Stack Hub C:\HealthAgent directory is missing on infrastructure nodes | The C:\HealthAgent directory can be missing after node reimaging or failed health agent installatio… | Run Test-AzsSupportKIHealthAgentDirIsMissing to check if C:\HealthAgent exists. Use -Remediate flag… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 14 | Azure Stack Hub Host Health Agent service is not running or in a failed state on host nodes | The Health Agent service may stop or fail to start due to service crashes, configuration corruption… | Run Test-AzsSupportKIHostHealthagent to validate the Health Agent Service status on hosts. Use -Rem… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
