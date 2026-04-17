# ARM ARM 杂项操作 aks arc autonomous — 排查速查

**来源数**: 15 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | AKS cluster scaling (e.g. 6 to 35 nodes) fails with cse-agent extension timeout, resulting in missi… | During AKS node scale-out, the ARM->CRP->CSE pipeline can timeout when provisioning large numbers o… | Troubleshoot via multi-layer Kusto: 1) AKS Kusto (akscn.kusto.chinacloudapi.cn/AKSprod) for cluster… | 🟢 8.5 — onenote+21V适用 | [MCVKB/[AKS][ARM][ARM-_ CRP] AKS cluster scaling failed w.md] |
| 2 | AKS node scale-out takes 30+ minutes to complete instead of expected 5-10 minutes | During VMSS scale-out, CRP calls NRP to update associated resources. If AKS cluster has an Applicat… | Troubleshoot via multi-layer Kusto tracing: 1) ARM HttpIncomingRequests (filter PUT/PATCH on VMSS b… | 🟢 8.5 — onenote+21V适用 | [MCVKB/[AKS][ARM_CRP_NRP] AKS node scale out take 30+ min.md] |
| 3 | AVD/WVD host pool VM deployment fails in a subnet that has PaaS service (e.g. App Service Environme… | Azure does not support creating IaaS resources (VMs) in a subnet that has PaaS service integration … | Either 1) Remove the external service association link (e.g. hostingEnvironments) from the target s… | 🟢 8.5 — onenote+21V适用 | [MCVKB/[Wei] 2106110060000413 _ Issue deploying WVD host.md] |
| 4 | Azure Automation runbook using Set-AzAutomationModule cmdlet fails to update Az modules; runbook ti… | Known issue in Azure PowerShell cmdlet (GitHub #16399): Set-AzAutomationModule cannot upload PowerS… | Use REST API to replicate portal operations: capture exact API calls via F12 browser dev tools on A… | 🟢 8.0 — onenote+21V适用 | [MCVKB/16.7 How to use REST API to do azure portal operat.md] |
| 5 | ARM template deployment of Application Gateway with Key Vault SSL certificates fails with identity … | Exported ARM template includes principalId and clientId in the managed identity section under Resou… | Edit the exported ARM template: find the identity section under Resources, delete the principalId a… | 🟢 8.0 — onenote+21V适用 | [MCVKB/1.5[NETVKB]How to deploy APPGW by template if SSL.md] |
| 6 | ARC-A external service endpoints (e.g. *.blob.autonomous.cloud.private) unreachable from clients ou… | Wildcard DNS record not configured in host environment DNS server; external DNS names do not resolv… | Configure a wildcard DNS record in the host environment DNS server resolving the ARC-A domain (e.g.… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 7 | Arc-A VM is not highly available or experiences data loss across reboots | Arc-A VM disks (OS, Ephemeral, Local) not placed on HA storage from the VM host's perspective, leav… | Ensure all three Arc-A VM virtual hard disks (OS disk, Ephemeral disk, Local persistent data disk) … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 8 | Edge browser shows a growing list of expired/outdated PME, AME and GME (Windows Online Services GFS… | Certificates are automatically cached by Edge browser each time the user logs into SAW with a YubiK… | In Edge: Settings > Privacy, Search, and Services > Security > Manage Certificates. Delete all out-… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 9 | SAW Edge browser shows too many cached YubiKey certificates (PME, AME, GME) making it difficult to … | Certificates are automatically uploaded and cached in Edge when logging into SAW with YubiKey. Old … | In Edge: Settings > Privacy, Search, and Services > Security > Manage Certificates > Delete all out… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 10 | Customer wants to determine which Azure resources are still being used for cleanup and cost reducti… | — | There is no generic way to determine if an Azure resource is being used. Each resource is used diff… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 11 | Management Groups REST API 报错 Response size too large：查询 Management Groups - Get 时使用 $expand + $rec… | Management Groups - Get REST API 不返回超过 15MB 的结果。该 API 设计用于获取单个 management group 的详情，大型资源层级（大量子 MG +… | 1) 改用 Management Groups - Get Descendants API（支持分页）；2) 移除 $expand 和 $recurse 参数减少响应大小；3) 使用 Azure R… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 12 | 在 Management Group 级别购买/管理 Reservation 或 Savings Plan 时报错 Not available due to conflict | 同一类型的计费权益（Azure Hybrid Benefit / Savings Plan / Reservation）不能同时分配给 Management Group 层级中的父节点和子节点。例如… | 1) 选择替代 scope（如 Subscription 级别）避免层级冲突；2) 调整现有权益的 scope 消除冲突；3) 如需 MG 级别，确保同类型权益不在同一层级链上的多个节点 | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 13 | ARM Complete 模式部署报错 DeploymentFailedCleanUp：模板中未包含的资源无法被删除，因为部署账号没有删除权限 | Complete 模式下 ARM 会删除资源组中不在模板内的资源。如果部署账号没有这些资源的 delete 权限，删除操作失败并报 DeploymentFailedCleanUp。注意 Comple… | 1) 将部署模式改为 Incremental（默认且推荐）；2) 如必须使用 Complete 模式，确保部署账号有资源组内所有资源类型的 delete 权限；3) 部署前使用 what-if 预览… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 14 | ARM Complete 模式部署意外删除了 condition=false 的资源：模板中 condition 评估为 false 的资源在 Complete 模式下被删除 | 使用 REST API version 2019-05-10 或更新版本时，Complete 模式会删除 condition 评估为 false 的资源。旧版本（< 2019-05-10）不会删除。… | 1) 部署前始终使用 what-if 预览变更；2) 注意 condition=false 的资源在新版 API 下会被删除；3) 如需保留条件化资源，改用 Incremental 模式；4) 评估… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 15 | Azure CLI fails with 'dh key too small' error when running az commands behind a proxy that decrypts… | Azure CLI 2.37.0 upgraded to Python 3.10, which increased OpenSSL SECLEVEL to 2. SECLEVEL 2 require… | Customer must upgrade their proxy configuration to use a certificate with ≥2048-bit public key to m… | 🔵 6.0 — ado-wiki+21V适用 | [ADO Wiki] |

## 快速排查路径
1. Troubleshoot via multi-layer Kusto: 1) AKS Kusto (akscn.kusto.chinacloudapi.cn/… `[来源: onenote]`
2. Troubleshoot via multi-layer Kusto tracing: 1) ARM HttpIncomingRequests (filter… `[来源: onenote]`
3. Either 1) Remove the external service association link (e.g. hostingEnvironment… `[来源: onenote]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/arm-misc-operations-aks-arc-autonomous.md#排查流程)
