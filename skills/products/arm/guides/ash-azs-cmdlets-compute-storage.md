# ARM Azure Stack Hub AzS Support 诊断命令 compute storage — 排查速查

**来源数**: 14 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | Azure Stack Hub virtual machines are orphaned or ghosted - VMs exist in the system but are not prop… | VM records become orphaned when the management layer loses track of VMs due to failed operations, i… | Run Test-AzsSupportKIOrphanedVMs from the Azs.Support module to detect and identify orphaned/ghoste… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 📋 | Azure Stack Hub nodes experienced unexpected reboots - event viewer logs show unplanned restart eve… | Unexpected reboots can be caused by hardware failures, bugcheck/BSOD, firmware issues, or unplanned… | Run Test-AzsSupportKIUnexpectedReboot to check event viewer logs. Use -IncludeGracefulShutdowns to … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 📋 | Azure Stack Hub cluster nodes have OS activation or licensing issues - activation markers are missi… | OS activation markers can become invalid after host reimaging, time sync issues, or KMS connectivit… | Run Test-AzsSupportKIOSActivationMarker to verify OS Activation Marker/License Status across all cl… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 📋 | Azure Stack Hub: Duplicate infrastructure or tenant virtual machines detected in Hyper-V, causing r… | VM duplication in the Hyper-V layer on Azure Stack Hub compute nodes; duplicate infra or tenant VMs… | Run Test-AzsSupportKIDuplicateVMs from Azs.Support Module (CSSTools) to identify duplicate infra or… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 📋 | Azure Stack Hub: Infrastructure VMs or tenant VMs fail to start up; VMs stuck in off or failed stat… | Disks ACL missing on infrastructure VMs on Azure Stack Hub compute nodes; incorrect or absent acces… | Run Test-AzSSupportKIDiskACLMissing from Azs.Support Module (CSSTools). Use -AllVMs to test all VMs… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 📋 | Azure Stack Hub: Cluster Shared Volume (CSV) mount point references a GUID instead of a local path,… | Invalid CSV mount point configuration on Azure Stack Hub; the mount point path is referencing a GUI… | Run Test-AzsSupportKICSVMountPoint from Azs.Support Module (CSSTools) to validate that CSV mount po… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 7 📋 | Azure Stack Hub blob has an infinite or stuck lease preventing blob/container deletion (CannotDelet… | — | Use CSSTools Invoke-AzsSupportBreakBlobLease to forcibly break the blob lease: `Invoke-AzsSupportBr… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 8 📋 | Azure Stack Hub blob is stuck in checked-out/locked state with an orphaned acquisition ID, preventi… | — | Use CSSTools Invoke-AzsSupportCheckInBlob: `Invoke-AzsSupportCheckInBlob -AccountName <sa> -Contain… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 9 📋 | Azure Stack Hub tenant VM disk VHD file is fragmented on s-cluster causing I/O performance degradat… | — | Use CSSTools Invoke-AzsSupportDiskVhdDefrag: `Invoke-AzsSupportDiskVhdDefrag -VhdPath \\su1fileserv… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 10 📋 | Azure Stack Hub empty blob container needs to be rebalanced or migrated from one s-cluster share to… | — | Use CSSTools Move-AzsSupportEmptyBlobContainer: `Move-AzsSupportEmptyBlobContainer -AccountName <sa… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 11 📋 | Azure Stack Hub Service Fabric cluster health is degraded or unhealthy | Service Fabric cluster health degradation can result from node failures, replica issues, applicatio… | Run Test-AzsSupportKIServiceFabricClusterHealth to validate the health of Service Fabric clusters i… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 12 📋 | Azure Stack Hub Service Fabric nodes are in disabled state - nodes are not enabled across Fabric Ri… | Service Fabric nodes can become disabled after failed updates, node repairs, or manual administrati… | Run Test-AzsSupportKIServiceFabricNodesDisabled to check all Fabric Rings for nodes that are not en… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 13 📋 | Azure Stack Hub C:\HealthAgent directory is missing on infrastructure nodes | The C:\HealthAgent directory can be missing after node reimaging or failed health agent installatio… | Run Test-AzsSupportKIHealthAgentDirIsMissing to check if C:\HealthAgent exists. Use -Remediate flag… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 14 📋 | Azure Stack Hub Host Health Agent service is not running or in a failed state on host nodes | The Health Agent service may stop or fail to start due to service crashes, configuration corruption… | Run Test-AzsSupportKIHostHealthagent to validate the Health Agent Service status on hosts. Use -Rem… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |

## 快速排查路径
1. Run Test-AzsSupportKIOrphanedVMs from the Azs.Support module to detect and iden… `[来源: ado-wiki]`
2. Run Test-AzsSupportKIUnexpectedReboot to check event viewer logs. Use -IncludeG… `[来源: ado-wiki]`
3. Run Test-AzsSupportKIOSActivationMarker to verify OS Activation Marker/License … `[来源: ado-wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/ash-azs-cmdlets-compute-storage.md#排查流程)
