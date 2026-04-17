# ARM Azure Local 通用 bootstrap alm — 综合排查指南

**条目数**: 7 | **草稿融合数**: 1 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-b-sff-haas-deployment.md
**Kusto 引用**: —
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: ALDO bootstrap fails on build 2602.2.25259 - Invoke-AzStackHciArcInitialization…
> 来源: ado-wiki

**根因分析**: CRL (Certificate Revocation List) check in the BootstrapManagementService blocks arc initialization, causing the bootstrap process to hang and eventually timeout.

1. Run PowerShell script on all nodes PRIOR to arc initialization: locate windows.
2. json under C:\windows\system32ootstrap\content_*\Microsoft.
3. ManagementService, set CheckCertificateRevocationList to false, restart BootstrapManagementService, wait 60 seconds.
4. Full script in ADO wiki.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 2: ALM (Agent Lifecycle Manager) fails to deploy agents during Azure Local deploym…
> 来源: ado-wiki

**根因分析**: ALM reads trigger files from ECE to deploy agents in categories (bootstrap, ECE agent, all agents). If trigger file is missing, agent nuget download fails, or agent installation fails, ALM produces a Results file with errors instead of SuccessIndication file in C:\Agents\Orchestration\AgentLifecycleManagement\SuccessIndication*.

1. 1) Check C:\Agents\Orchestration\AgentLifecycleManagement\SuccessIndication* for success file.
2. 2) If absent, check Results file for specific errors.
3. 3) Verify trigger files exist with correct agent categories.
4. 4) Check nuget store connectivity.
5. 5) To manually trigger ALM: see How to trigger ALM wiki page.
6. 6) ECE waits 25 min - if ALM completes after timeout, manual retry may be needed.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 3: wssdcloudagent service appears stopped on some Azure Local (HCI) cluster nodes,…
> 来源: ado-wiki

**根因分析**: wssdcloudagent is a clustered service (Failover Cluster generic service role) that runs on only one active node at a time. It is expected to show as 'Stopped' on non-owner nodes.

1. Verify cluster resource ownership: Get-ClusterResource | ? {$_.
2. Name -like '*moc*'} | Format-Table Name, State, OwnerGroup, OwnerNode.
3. The service should be 'Online' on exactly one owner node.
4. If it shows 'Failed' or 'Offline' on all nodes, check failover cluster health and MOC logs at $(Get-MocConfig).
5. cloudconfiglocation\log\wssdcloudagent.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 4: Add-Server or cluster node addition fails in Azure Stack HCI / Azure Local due …
> 来源: ado-wiki

**根因分析**: Mismatch between network intent and adapter IDs (ComponentID) on the new node vs existing cluster nodes, causing Network ATC provisioning validation to fail

1. Check logs for ValidateAzureStackNetworkATCSettings errors.
2. Identify the ComponentID mismatch between intent and adapter IDs.
3. Apply mitigation scripts to correct the ComponentID mapping before retrying Add-Server.
4. Ref: Azure Local deployment and management wiki - TSG Network ATC provisioning fails due to ComponentID mismatch.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 5: Suspend-ClusterNode fails with error 'Currently unsafe to perform the operation…
> 来源: ado-wiki

**根因分析**: Cluster health conditions prevent safe drain - possible causes include unhealthy storage volumes, running storage jobs, degraded virtual disks, or VMs in failed/paused state that cannot be live-migrated

1. Before draining: (1) Verify all nodes are Up with Get-ClusterNode, (2) Check CSVs are Online with Get-ClusterSharedVolume, (3) Verify virtual disks are healthy with Get-VirtualDisk, (4) Wait for storage jobs to complete with Get-StorageJob, (5) Check VM status across all nodes.
2. Resolve any unhealthy conditions before retrying Suspend-ClusterNode -Name <node> -Drain.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 6: Error when running `az aksarc nodepool add` with invalid --os-sku value or --os…
> 来源: ado-wiki

**根因分析**: Invalid --os-sku parameter value specified, or mismatch between --os-type and --os-sku parameters

1. Use valid --os-sku values: 'CBLMariner' (for --os-type Linux), 'Windows2019' or 'Windows2022' (for --os-type Windows).
2. Ensure --os-type matches the os-sku.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 7: Cannot get ACR credentials or pull private container images in Azure Local disc…
> 来源: ado-wiki

**根因分析**: ACR admin user is not enabled by default; Kubernetes imagePullSecrets require admin credentials for private ACR in disconnected environments

1. Enable admin access: `az acr update -n <acrName> --admin-enabled true`, then retrieve credentials with `az acr credential show --name <acrName>`.
2. Create Kubernetes docker-registry secret using ACR login server, username and password for image pulling.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

## 判断逻辑

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| ALDO bootstrap fails on build 2602.2.25259 - Invoke-AzStack… | CRL (Certificate Revocation List) check in the BootstrapMan… | Run PowerShell script on all nodes PRIOR to arc initializat… |
| ALM (Agent Lifecycle Manager) fails to deploy agents during… | ALM reads trigger files from ECE to deploy agents in catego… | 1) Check C:\Agents\Orchestration\AgentLifecycleManagement\S… |
| wssdcloudagent service appears stopped on some Azure Local … | wssdcloudagent is a clustered service (Failover Cluster gen… | Verify cluster resource ownership: Get-ClusterResource \| ?… |
| Add-Server or cluster node addition fails in Azure Stack HC… | Mismatch between network intent and adapter IDs (ComponentI… | Check logs for ValidateAzureStackNetworkATCSettings errors.… |
| Suspend-ClusterNode fails with error 'Currently unsafe to p… | Cluster health conditions prevent safe drain - possible cau… | Before draining: (1) Verify all nodes are Up with Get-Clust… |
| Error when running `az aksarc nodepool add` with invalid --… | Invalid --os-sku parameter value specified, or mismatch bet… | Use valid --os-sku values: 'CBLMariner' (for --os-type Linu… |
| Cannot get ACR credentials or pull private container images… | ACR admin user is not enabled by default; Kubernetes imageP… | Enable admin access: `az acr update -n <acrName> --admin-en… |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | ALDO bootstrap fails on build 2602.2.25259 - Invoke-AzStackHciArcInitialization hangs for ~45 minut… | CRL (Certificate Revocation List) check in the BootstrapManagementService blocks arc initialization… | Run PowerShell script on all nodes PRIOR to arc initialization: locate windows.mae.config.json unde… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 | ALM (Agent Lifecycle Manager) fails to deploy agents during Azure Local deployment. ECE action plan… | ALM reads trigger files from ECE to deploy agents in categories (bootstrap, ECE agent, all agents).… | 1) Check C:\Agents\Orchestration\AgentLifecycleManagement\SuccessIndication* for success file. 2) I… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 | wssdcloudagent service appears stopped on some Azure Local (HCI) cluster nodes, causing concern abo… | wssdcloudagent is a clustered service (Failover Cluster generic service role) that runs on only one… | Verify cluster resource ownership: Get-ClusterResource \| ? {$_.Name -like '*moc*'} \| Format-Table… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 | Add-Server or cluster node addition fails in Azure Stack HCI / Azure Local due to ComponentID misma… | Mismatch between network intent and adapter IDs (ComponentID) on the new node vs existing cluster n… | Check logs for ValidateAzureStackNetworkATCSettings errors. Identify the ComponentID mismatch betwe… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 | Suspend-ClusterNode fails with error 'Currently unsafe to perform the operation' when attempting to… | Cluster health conditions prevent safe drain - possible causes include unhealthy storage volumes, r… | Before draining: (1) Verify all nodes are Up with Get-ClusterNode, (2) Check CSVs are Online with G… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 | Error when running `az aksarc nodepool add` with invalid --os-sku value or --os-type/--os-sku misma… | Invalid --os-sku parameter value specified, or mismatch between --os-type and --os-sku parameters | Use valid --os-sku values: 'CBLMariner' (for --os-type Linux), 'Windows2019' or 'Windows2022' (for … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 7 | Cannot get ACR credentials or pull private container images in Azure Local disconnected environment… | ACR admin user is not enabled by default; Kubernetes imagePullSecrets require admin credentials for… | Enable admin access: `az acr update -n <acrName> --admin-enabled true`, then retrieve credentials w… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
