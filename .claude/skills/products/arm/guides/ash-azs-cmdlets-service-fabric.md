# ARM Azure Stack Hub AzS Support 诊断命令 service fabric — 排查速查

**来源数**: 11 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | Need to retrieve Docker image name of a Service Fabric application running on Azure Stack Hub fabri… | — | Use Get-AzsSupportServiceFabricServiceDockerImageName -ApplicationName <appName> -ServiceManifestNa… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 📋 | Need to check Azure Stack Hub Service Fabric cluster health status across one or all infrastructure… | — | Use Get-AzsSupportServiceFabricClusterHealth [-Ring <RingName>] to get aggregated cluster health. O… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 📋 | Need to check Azure Stack Hub Service Fabric cluster upgrade status to troubleshoot stalled or fail… | — | Use Get-AzsSupportServiceFabricClusterUpgrade -Ring <RingName> (e.g., ACS, FabricRingServices) to g… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 📋 | Need to retrieve Azure Stack Hub Service Fabric cluster configuration JSON for a specific ring for … | — | Use Get-AzsSupportServiceFabricClusterConfiguration -Ring <RingName> (e.g., ACS, FabricRingServices… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 📋 | Need to retrieve Azure Stack Hub Service Fabric cluster manifest XML for a specific ring for troubl… | — | Use Get-AzsSupportServiceFabricClusterManifest -Ring <RingName> (e.g., ACS, FabricRingServices) to … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 📋 | Azure Stack Hub Service Fabric applications, services, partitions, or replicas in unhealthy state; … | One or more Service Fabric components (applications, services, partitions, replicas) have entered a… | Use Azs.Support module cmdlet: Get-AzsSupportServiceFabricDetail -Ring <RingName> -Unhealthy to lis… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 7 📋 | Azure Stack Hub Service Fabric primary replica stuck on a node, node being decommissioned, or prima… | Primary replica is bound to a specific node that may be unhealthy or undergoing maintenance | Use Move-AzsSupportServiceFabricPrimaryReplica to relocate: Move-AzsSupportServiceFabricPrimaryRepl… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 8 📋 | Azure Stack Hub Service Fabric primary replica unresponsive or in degraded state for a single-prima… | Primary replica process may be hung or in a bad state requiring restart | Use Restart-AzsSupportServiceFabricPrimaryReplica: Restart-AzsSupportServiceFabricPrimaryReplica -R… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 9 📋 | Azure Stack Hub Actors application causing issues in Service Fabric cluster | — | Remove the Actors application from Service Fabric using: Remove-AzsSupportActorsApplication | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 10 📋 | Need to run custom Service Fabric commands on Azure Stack Hub cluster for diagnostics or remediation | — | Use Invoke-AzsSupportServiceFabricCommand to connect to a SF ring and execute arbitrary commands: I… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 11 📋 | Need to verify Service Fabric runtime version consistency across Azure Stack Hub nodes or after upg… | — | Use Get-AzsSupportServiceFabricRuntimeVersion [-Ring <Ring>] to check SF runtime version across all… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |

## 快速排查路径
1. Use Get-AzsSupportServiceFabricServiceDockerImageName -ApplicationName <appName… `[来源: ado-wiki]`
2. Use Get-AzsSupportServiceFabricClusterHealth [-Ring <RingName>] to get aggregat… `[来源: ado-wiki]`
3. Use Get-AzsSupportServiceFabricClusterUpgrade -Ring <RingName> (e.g., ACS, Fabr… `[来源: ado-wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/ash-azs-cmdlets-service-fabric.md#排查流程)
