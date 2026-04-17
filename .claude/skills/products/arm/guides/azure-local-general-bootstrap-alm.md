# ARM Azure Local 通用 bootstrap alm — 排查速查

**来源数**: 7 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | ALDO bootstrap fails on build 2602.2.25259 - Invoke-AzStackHciArcInitialization hangs for ~45 minut… | CRL (Certificate Revocation List) check in the BootstrapManagementService blocks arc initialization… | Run PowerShell script on all nodes PRIOR to arc initialization: locate windows.mae.config.json unde… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 📋 | ALM (Agent Lifecycle Manager) fails to deploy agents during Azure Local deployment. ECE action plan… | ALM reads trigger files from ECE to deploy agents in categories (bootstrap, ECE agent, all agents).… | 1) Check C:\Agents\Orchestration\AgentLifecycleManagement\SuccessIndication* for success file. 2) I… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 📋 | wssdcloudagent service appears stopped on some Azure Local (HCI) cluster nodes, causing concern abo… | wssdcloudagent is a clustered service (Failover Cluster generic service role) that runs on only one… | Verify cluster resource ownership: Get-ClusterResource \| ? {$_.Name -like '*moc*'} \| Format-Table… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 📋 | Add-Server or cluster node addition fails in Azure Stack HCI / Azure Local due to ComponentID misma… | Mismatch between network intent and adapter IDs (ComponentID) on the new node vs existing cluster n… | Check logs for ValidateAzureStackNetworkATCSettings errors. Identify the ComponentID mismatch betwe… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 📋 | Suspend-ClusterNode fails with error 'Currently unsafe to perform the operation' when attempting to… | Cluster health conditions prevent safe drain - possible causes include unhealthy storage volumes, r… | Before draining: (1) Verify all nodes are Up with Get-ClusterNode, (2) Check CSVs are Online with G… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 📋 | Error when running `az aksarc nodepool add` with invalid --os-sku value or --os-type/--os-sku misma… | Invalid --os-sku parameter value specified, or mismatch between --os-type and --os-sku parameters | Use valid --os-sku values: 'CBLMariner' (for --os-type Linux), 'Windows2019' or 'Windows2022' (for … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 7 📋 | Cannot get ACR credentials or pull private container images in Azure Local disconnected environment… | ACR admin user is not enabled by default; Kubernetes imagePullSecrets require admin credentials for… | Enable admin access: `az acr update -n <acrName> --admin-enabled true`, then retrieve credentials w… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |

## 快速排查路径
1. Run PowerShell script on all nodes PRIOR to arc initialization: locate windows.… `[来源: ado-wiki]`
2. 1) Check C:\Agents\Orchestration\AgentLifecycleManagement\SuccessIndication* fo… `[来源: ado-wiki]`
3. Verify cluster resource ownership: Get-ClusterResource \| ? {$_.Name -like '*mo… `[来源: ado-wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/azure-local-general-bootstrap-alm.md#排查流程)
