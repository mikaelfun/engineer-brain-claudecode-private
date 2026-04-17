# ARM Azure Stack Hub AzS Support 诊断命令 service fabric — 综合排查指南

**条目数**: 11 | **草稿融合数**: 67 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-a-AzsSupportComputeInfra.md, ado-wiki-a-AzsSupportCpiClusterNodeState.md, ado-wiki-a-AzsSupportGuestLogCollection.md, ado-wiki-a-AzsSupportVMConnect.md, ado-wiki-a-Clear-AzsSupportWorkingDirectory.md (+62 more)
**Kusto 引用**: —
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Need to retrieve Docker image name of a Service Fabric application running on A…
> 来源: ado-wiki

1. Use Get-AzsSupportServiceFabricServiceDockerImageName -ApplicationName <appName> -ServiceManifestName <manifestName> from Azs.
2. Support module.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 2: Need to check Azure Stack Hub Service Fabric cluster health status across one o…
> 来源: ado-wiki

1. Use Get-AzsSupportServiceFabricClusterHealth [-Ring <RingName>] to get aggregated cluster health.
2. Omit -Ring to check all SF rings.
3. Returns PSObject with Ring and native ClusterHealth stats from Get-ServiceFabricClusterHealth.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 3: Need to check Azure Stack Hub Service Fabric cluster upgrade status to troubles…
> 来源: ado-wiki

1. Use Get-AzsSupportServiceFabricClusterUpgrade -Ring <RingName> (e.
2. , ACS, FabricRingServices) to get the last cluster upgrade operation status as a PSObject.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 4: Need to retrieve Azure Stack Hub Service Fabric cluster configuration JSON for …
> 来源: ado-wiki

1. Use Get-AzsSupportServiceFabricClusterConfiguration -Ring <RingName> (e.
2. , ACS, FabricRingServices) to retrieve the cluster configuration JSON.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 5: Need to retrieve Azure Stack Hub Service Fabric cluster manifest XML for a spec…
> 来源: ado-wiki

1. Use Get-AzsSupportServiceFabricClusterManifest -Ring <RingName> (e.
2. , ACS, FabricRingServices) to retrieve the Service Fabric cluster manifest XML.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 6: Azure Stack Hub Service Fabric applications, services, partitions, or replicas …
> 来源: ado-wiki

**根因分析**: One or more Service Fabric components (applications, services, partitions, replicas) have entered an unhealthy state

1. Support module cmdlet: Get-AzsSupportServiceFabricDetail -Ring <RingName> -Unhealthy to list all unhealthy SF components.
2. Ring values from [Enum]::GetValues([SFInfrastructureRole]) e.
3. ACS, FabricRingServices.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 7: Azure Stack Hub Service Fabric primary replica stuck on a node, node being deco…
> 来源: ado-wiki

**根因分析**: Primary replica is bound to a specific node that may be unhealthy or undergoing maintenance

1. Use Move-AzsSupportServiceFabricPrimaryReplica to relocate: Move-AzsSupportServiceFabricPrimaryReplica -Ring <Ring> -ServiceName "fabric:/<App>/<Service>" or -ServiceTypeName "<TypeName>".
2. Supports lookup by ApplicationName+ServiceName or ServiceTypeName.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 8: Azure Stack Hub Service Fabric primary replica unresponsive or in degraded stat…
> 来源: ado-wiki

**根因分析**: Primary replica process may be hung or in a bad state requiring restart

1. Use Restart-AzsSupportServiceFabricPrimaryReplica: Restart-AzsSupportServiceFabricPrimaryReplica -Ring <Ring> -ServiceName "fabric:/<App>/<Service>" or -ServiceTypeName "<TypeName>".
2. Only supports services with 1 primary replica.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 9: Azure Stack Hub Actors application causing issues in Service Fabric cluster
> 来源: ado-wiki

1. Remove the Actors application from Service Fabric using: Remove-AzsSupportActorsApplication.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 10: Need to run custom Service Fabric commands on Azure Stack Hub cluster for diagn…
> 来源: ado-wiki

1. Use Invoke-AzsSupportServiceFabricCommand to connect to a SF ring and execute arbitrary commands: Invoke-AzsSupportServiceFabricCommand -Ring <Ring> -ScriptBlock { Get-ServiceFabricClusterHealth }.
2. Handles SF connection automatically.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 11: Need to verify Service Fabric runtime version consistency across Azure Stack Hu…
> 来源: ado-wiki

1. Use Get-AzsSupportServiceFabricRuntimeVersion [-Ring <Ring>] to check SF runtime version across all cluster nodes.
2. If no ring specified, checks all SF rings.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

## 判断逻辑

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| Need to retrieve Docker image name of a Service Fabric appl… | — | Use Get-AzsSupportServiceFabricServiceDockerImageName -Appl… |
| Need to check Azure Stack Hub Service Fabric cluster health… | — | Use Get-AzsSupportServiceFabricClusterHealth [-Ring <RingNa… |
| Need to check Azure Stack Hub Service Fabric cluster upgrad… | — | Use Get-AzsSupportServiceFabricClusterUpgrade -Ring <RingNa… |
| Need to retrieve Azure Stack Hub Service Fabric cluster con… | — | Use Get-AzsSupportServiceFabricClusterConfiguration -Ring <… |
| Need to retrieve Azure Stack Hub Service Fabric cluster man… | — | Use Get-AzsSupportServiceFabricClusterManifest -Ring <RingN… |
| Azure Stack Hub Service Fabric applications, services, part… | One or more Service Fabric components (applications, servic… | Use Azs.Support module cmdlet: Get-AzsSupportServiceFabricD… |
| Azure Stack Hub Service Fabric primary replica stuck on a n… | Primary replica is bound to a specific node that may be unh… | Use Move-AzsSupportServiceFabricPrimaryReplica to relocate:… |
| Azure Stack Hub Service Fabric primary replica unresponsive… | Primary replica process may be hung or in a bad state requi… | Use Restart-AzsSupportServiceFabricPrimaryReplica: Restart-… |
| Azure Stack Hub Actors application causing issues in Servic… | — | Remove the Actors application from Service Fabric using: Re… |
| Need to run custom Service Fabric commands on Azure Stack H… | — | Use Invoke-AzsSupportServiceFabricCommand to connect to a S… |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Need to retrieve Docker image name of a Service Fabric application running on Azure Stack Hub fabri… | — | Use Get-AzsSupportServiceFabricServiceDockerImageName -ApplicationName <appName> -ServiceManifestNa… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 | Need to check Azure Stack Hub Service Fabric cluster health status across one or all infrastructure… | — | Use Get-AzsSupportServiceFabricClusterHealth [-Ring <RingName>] to get aggregated cluster health. O… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 | Need to check Azure Stack Hub Service Fabric cluster upgrade status to troubleshoot stalled or fail… | — | Use Get-AzsSupportServiceFabricClusterUpgrade -Ring <RingName> (e.g., ACS, FabricRingServices) to g… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 | Need to retrieve Azure Stack Hub Service Fabric cluster configuration JSON for a specific ring for … | — | Use Get-AzsSupportServiceFabricClusterConfiguration -Ring <RingName> (e.g., ACS, FabricRingServices… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 | Need to retrieve Azure Stack Hub Service Fabric cluster manifest XML for a specific ring for troubl… | — | Use Get-AzsSupportServiceFabricClusterManifest -Ring <RingName> (e.g., ACS, FabricRingServices) to … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 | Azure Stack Hub Service Fabric applications, services, partitions, or replicas in unhealthy state; … | One or more Service Fabric components (applications, services, partitions, replicas) have entered a… | Use Azs.Support module cmdlet: Get-AzsSupportServiceFabricDetail -Ring <RingName> -Unhealthy to lis… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 7 | Azure Stack Hub Service Fabric primary replica stuck on a node, node being decommissioned, or prima… | Primary replica is bound to a specific node that may be unhealthy or undergoing maintenance | Use Move-AzsSupportServiceFabricPrimaryReplica to relocate: Move-AzsSupportServiceFabricPrimaryRepl… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 8 | Azure Stack Hub Service Fabric primary replica unresponsive or in degraded state for a single-prima… | Primary replica process may be hung or in a bad state requiring restart | Use Restart-AzsSupportServiceFabricPrimaryReplica: Restart-AzsSupportServiceFabricPrimaryReplica -R… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 9 | Azure Stack Hub Actors application causing issues in Service Fabric cluster | — | Remove the Actors application from Service Fabric using: Remove-AzsSupportActorsApplication | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 10 | Need to run custom Service Fabric commands on Azure Stack Hub cluster for diagnostics or remediation | — | Use Invoke-AzsSupportServiceFabricCommand to connect to a SF ring and execute arbitrary commands: I… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 11 | Need to verify Service Fabric runtime version consistency across Azure Stack Hub nodes or after upg… | — | Use Get-AzsSupportServiceFabricRuntimeVersion [-Ring <Ring>] to check SF runtime version across all… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
