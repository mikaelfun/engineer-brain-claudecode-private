# ARM ARM 杂项操作 aks arc autonomous — 综合排查指南

**条目数**: 15 | **草稿融合数**: 0 | **Kusto 查询融合**: 3
**来源草稿**: —
**Kusto 引用**: request-tracking.md, failed-operations.md, activity-log.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Azure Automation runbook using Set-AzAutomationModule cmdlet fails to update Az…
> 来源: onenote

**根因分析**: Known issue in Azure PowerShell cmdlet (GitHub #16399): Set-AzAutomationModule cannot upload PowerShell 7.1 modules. Additionally, the open-source update script enters deadlock loop when dependent Az sub-modules are missing.

1. Use REST API to replicate portal operations: capture exact API calls via F12 browser dev tools on Azure Portal, extract method/URL/payload from batch API call (management.
2. chinacloudapi.
3. cn/batch), then implement in runbook using Invoke-RestMethod with MSI authentication.
4. PATCH the automationAccount with RuntimeConfiguration to update modules.

`[结论: 🟢 8.0/10 — [MCVKB/16.7 How to use REST API to do azure portal operat.md]]`

### Phase 2: ARM template deployment of Application Gateway with Key Vault SSL certificates …
> 来源: onenote

**根因分析**: Exported ARM template includes principalId and clientId in the managed identity section under Resources. These auto-generated values are specific to the original deployment and cause deployment failure when reused.

1. Edit the exported ARM template: find the identity section under Resources, delete the principalId and clientId fields.
2. Keep only the type and userAssignedIdentities reference.
3. Save and redeploy.
4. Applies to both Azure China and Global Azure.

`[结论: 🟢 8.0/10 — [MCVKB/1.5[NETVKB]How to deploy APPGW by template if SSL.md]]`

### Phase 3: AKS cluster scaling (e.g. 6 to 35 nodes) fails with cse-agent extension timeout…
> 来源: onenote

**根因分析**: During AKS node scale-out, the ARM->CRP->CSE pipeline can timeout when provisioning large numbers of nodes simultaneously. The cse-agent CustomScriptExtension responsible for node bootstrapping fails to complete within the allotted time.

1. Troubleshoot via multi-layer Kusto: 1) AKS Kusto (akscn.
2. chinacloudapi.
3. cn/AKSprod) for cluster-level operations; 2) ARM Kusto (armmcadx.
4. chinacloudapi.
5. cn/armmc HttpIncomingRequests) for deployment flow; 3) CRP Kusto for VM extension details.
6. Check CSE logs on failed node.
7. For large scale operations, consider scaling in smaller batches.

`[结论: 🟢 8.5/10 — [MCVKB/[AKS][ARM][ARM-_ CRP] AKS cluster scaling failed w.md]]`

### Phase 4: AKS node scale-out takes 30+ minutes to complete instead of expected 5-10 minut…
> 来源: onenote

**根因分析**: During VMSS scale-out, CRP calls NRP to update associated resources. If AKS cluster has an Application Gateway v1 (CloudService type) associated, the AppGW update operation alone can take 15-30+ minutes, dominating the total scale-out duration.

1. Troubleshoot via multi-layer Kusto tracing: 1) ARM HttpIncomingRequests (filter PUT/PATCH on VMSS by subscriptionId+timeframe) to get correlationId; 2) CRP ApiQosEvent (filter by correlationId) to get operationId; 3) CRP ContextActivity (filter by activityId=operationId) to find slow downstream calls to NRP; 4) NRP Jarvis logs to confirm AppGW operation duration.
2. Root fix: migrate from AppGW v1 to v2 which has faster update operations.

`[结论: 🟢 8.5/10 — [MCVKB/[AKS][ARM_CRP_NRP] AKS node scale out take 30+ min.md]]`

### Phase 5: AVD/WVD host pool VM deployment fails in a subnet that has PaaS service (e.g. A…
> 来源: onenote

**根因分析**: Azure does not support creating IaaS resources (VMs) in a subnet that has PaaS service integration (e.g. Microsoft.Web/hostingEnvironments). The subnet delegation/service association blocks VM deployment.

1. Either 1) Remove the external service association link (e.
2. hostingEnvironments) from the target subnet, then redeploy AVD host pool VMs; or 2) Deploy AVD VMs to a different subnet without PaaS integration.
3. If removing the association does not resolve the issue, engage the hosting environments (Microsoft.

`[结论: 🟢 8.5/10 — [MCVKB/[Wei] 2106110060000413 _ Issue deploying WVD host.md]]`

### Phase 6: Azure CLI fails with 'dh key too small' error when running az commands behind a…
> 来源: ado-wiki

**根因分析**: Azure CLI 2.37.0 upgraded to Python 3.10, which increased OpenSSL SECLEVEL to 2. SECLEVEL 2 requires certificate public keys to have at minimum 2048 bits. If the customer's proxy uses a certificate with a 1024-bit public key, Python's OpenSSL libraries reject the TLS handshake.

1. Customer must upgrade their proxy configuration to use a certificate with ≥2048-bit public key to meet SECLEVEL 2 requirements.
2. Workarounds: (1) use a previous Python version and install CLI manually, (2) use an older Azure CLI version with lower SECLEVEL.

`[结论: 🔵 6.0/10 — [ADO Wiki]]`

### Phase 7: Customer wants to determine which Azure resources are still being used for clea…
> 来源: ado-wiki

1. There is no generic way to determine if an Azure resource is being used.
2. Each resource is used differently.
3. Check Azure Activity logs for write operations in the last 90 days (but this only shows active changes, not usage).
4. Recommend organizing resources sharing the same lifecycle into a single resource group to avoid orphan resources.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 8: ARC-A external service endpoints (e.g. *.blob.autonomous.cloud.private) unreach…
> 来源: ado-wiki

**根因分析**: Wildcard DNS record not configured in host environment DNS server; external DNS names do not resolve to the ingress NIC IP of the Arc-A VM

1. Configure a wildcard DNS record in the host environment DNS server resolving the ARC-A domain (e.
2. private) to the ingress NIC IP address of the Arc-A VM.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 9: Arc-A VM is not highly available or experiences data loss across reboots
> 来源: ado-wiki

**根因分析**: Arc-A VM disks (OS, Ephemeral, Local) not placed on HA storage from the VM host's perspective, leaving them vulnerable to single points of failure

1. Ensure all three Arc-A VM virtual hard disks (OS disk, Ephemeral disk, Local persistent data disk) are provisioned on HA storage provided by the VM host environment.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 10: Edge browser shows a growing list of expired/outdated PME, AME and GME (Windows…
> 来源: ado-wiki

**根因分析**: Certificates are automatically cached by Edge browser each time the user logs into SAW with a YubiKey. Old expired certificates remain in the cache and are never auto-cleaned, causing the certificate picker list to grow indefinitely.

1. In Edge: Settings > Privacy, Search, and Services > Security > Manage Certificates.
2. Delete all out-of-date PME, AME and Windows Online Services GFS Internal (GME) certificates.
3. They will be automatically re-cached on next SAW login with YubiKey.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 11: SAW Edge browser shows too many cached YubiKey certificates (PME, AME, GME) mak…
> 来源: ado-wiki

**根因分析**: Certificates are automatically uploaded and cached in Edge when logging into SAW with YubiKey. Old expired certificates accumulate over time and are never auto-cleaned.

1. In Edge: Settings > Privacy, Search, and Services > Security > Manage Certificates > Delete all out-of-date PME, AME, and Windows Online Services GFS Internal (GME) certificates.
2. They will be re-cached automatically when you next log in with YubiKey.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 12: Management Groups REST API 报错 Response size too large：查询 Management Groups - Ge…
> 来源: mslearn

**根因分析**: Management Groups - Get REST API 不返回超过 15MB 的结果。该 API 设计用于获取单个 management group 的详情，大型资源层级（大量子 MG + 订阅）会超出限制

1. 1) 改用 Management Groups - Get Descendants API（支持分页）；2) 移除 $expand 和 $recurse 参数减少响应大小；3) 使用 Azure Resource Graph 按需查询子层级.

`[结论: 🔵 6.0/10 — [mslearn]]`

### Phase 13: ARM Complete 模式部署报错 DeploymentFailedCleanUp：模板中未包含的资源无法被删除，因为部署账号没有删除权限
> 来源: mslearn

**根因分析**: Complete 模式下 ARM 会删除资源组中不在模板内的资源。如果部署账号没有这些资源的 delete 权限，删除操作失败并报 DeploymentFailedCleanUp。注意 Complete mode 即将逐步弃用，推荐使用 Deployment Stacks

1. 1) 将部署模式改为 Incremental（默认且推荐）；2) 如必须使用 Complete 模式，确保部署账号有资源组内所有资源类型的 delete 权限；3) 部署前使用 what-if 预览将被删除的资源；4) 迁移到 Deployment Stacks 替代 Complete 模式.

`[结论: 🔵 6.0/10 — [mslearn]]`

### Phase 14: ARM Complete 模式部署意外删除了 condition=false 的资源：模板中 condition 评估为 false 的资源在 Complet…
> 来源: mslearn

**根因分析**: 使用 REST API version 2019-05-10 或更新版本时，Complete 模式会删除 condition 评估为 false 的资源。旧版本（< 2019-05-10）不会删除。最新版 Azure PowerShell 和 CLI 默认使用新版 API

1. 1) 部署前始终使用 what-if 预览变更；2) 注意 condition=false 的资源在新版 API 下会被删除；3) 如需保留条件化资源，改用 Incremental 模式；4) 评估迁移到 Deployment Stacks.

`[结论: 🔵 6.0/10 — [mslearn]]`

### Phase 15: 在 Management Group 级别购买/管理 Reservation 或 Savings Plan 时报错 Not available due to …
> 来源: mslearn

**根因分析**: 同一类型的计费权益（Azure Hybrid Benefit / Savings Plan / Reservation）不能同时分配给 Management Group 层级中的父节点和子节点。例如 Savings Plan 分配给 MG_Parent 后，MG_Grandparent 和 MG_Child 都不能再分配 Savings Plan

1. 1) 选择替代 scope（如 Subscription 级别）避免层级冲突；2) 调整现有权益的 scope 消除冲突；3) 如需 MG 级别，确保同类型权益不在同一层级链上的多个节点.

`[结论: 🔵 6.0/10 — [mslearn]]`

## Kusto 查询参考

### request-tracking.md
`[工具: Kusto skill — request-tracking.md]`

```kusto
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').EventServiceEntries
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where correlationId == "{correlationId}"
| project TIMESTAMP, resourceUri, operationName, status, level, properties, claims
| order by TIMESTAMP asc
```

```kusto
// cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd') // Public Cloud - 需要权限
// .Unionizer("Requests","EventServiceEntries")
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where correlationId == "{correlationId}"
| project TIMESTAMP, resourceUri, operationName, status, level, properties, claims
| order by TIMESTAMP asc
```

```kusto
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').HttpIncomingRequests
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where correlationId == "{correlationId}"
| project TIMESTAMP, httpMethod, targetUri, commandName, httpStatusCode, clientIpAddress, userAgent
| order by TIMESTAMP asc
```

### failed-operations.md
`[工具: Kusto skill — failed-operations.md]`

```kusto
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').EventServiceEntries
| where subscriptionId == "{subscription}"
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where status == "Failed"
| where properties notcontains "isComplianceCheck" and properties notcontains "OK" and properties != ""
| project PreciseTimeStamp, resourceUri, properties, status, level, EventId, eventName, 
         eventCategory, operationName, correlationId, claims, tenantId
| order by PreciseTimeStamp desc
```

```kusto
// cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd') // Public Cloud - 需要权限
// .Unionizer("Requests","EventServiceEntries")
| where subscriptionId == "{subscription}"
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where status == "Failed"
| where properties notcontains "isComplianceCheck"
| project PreciseTimeStamp, resourceUri, properties, status, operationName, correlationId
| order by PreciseTimeStamp desc
```

```kusto
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').EventServiceEntries
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where correlationId == "{correlationId}"
| where status == "Failed"
| project PreciseTimeStamp, resourceUri, operationName, status, properties
| order by PreciseTimeStamp asc
```

### activity-log.md
`[工具: Kusto skill — activity-log.md]`

```kusto
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').EventServiceEntries 
| where subscriptionId == "{subscription}"
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where operationName notcontains "Microsoft.Authorization/policies/auditIfNotExists/action"
| where operationName notcontains "Microsoft.Authorization/policies/audit/action"
| project PreciseTimeStamp, operationName, resourceProvider, correlationId, status, subStatus, 
         properties, resourceUri, eventName, operationId, armServiceRequestId
| sort by PreciseTimeStamp asc
```

```kusto
// cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd') // Public Cloud - 需要权限
// .Unionizer("Requests","EventServiceEntries") 
| where subscriptionId == "{subscription}"
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where operationName notcontains "Microsoft.Authorization/policies"
| project PreciseTimeStamp, operationName, resourceProvider, correlationId, status, properties, resourceUri
| sort by PreciseTimeStamp asc
```

```kusto
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').EventServiceEntries 
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where resourceUri contains "{resourceUri}"
| where operationName notcontains "Microsoft.Authorization/policies"
| project PreciseTimeStamp, operationName, resourceProvider, correlationId, status, subStatus, 
         properties, resourceUri, eventName
| sort by PreciseTimeStamp asc
```

## 判断逻辑

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| Azure Automation runbook using Set-AzAutomationModule cmdle… | Known issue in Azure PowerShell cmdlet (GitHub #16399): Set… | Use REST API to replicate portal operations: capture exact … |
| ARM template deployment of Application Gateway with Key Vau… | Exported ARM template includes principalId and clientId in … | Edit the exported ARM template: find the identity section u… |
| AKS cluster scaling (e.g. 6 to 35 nodes) fails with cse-age… | During AKS node scale-out, the ARM->CRP->CSE pipeline can t… | Troubleshoot via multi-layer Kusto: 1) AKS Kusto (akscn.kus… |
| AKS node scale-out takes 30+ minutes to complete instead of… | During VMSS scale-out, CRP calls NRP to update associated r… | Troubleshoot via multi-layer Kusto tracing: 1) ARM HttpInco… |
| AVD/WVD host pool VM deployment fails in a subnet that has … | Azure does not support creating IaaS resources (VMs) in a s… | Either 1) Remove the external service association link (e.g… |
| Azure CLI fails with 'dh key too small' error when running … | Azure CLI 2.37.0 upgraded to Python 3.10, which increased O… | Customer must upgrade their proxy configuration to use a ce… |
| Customer wants to determine which Azure resources are still… | — | There is no generic way to determine if an Azure resource i… |
| ARC-A external service endpoints (e.g. *.blob.autonomous.cl… | Wildcard DNS record not configured in host environment DNS … | Configure a wildcard DNS record in the host environment DNS… |
| Arc-A VM is not highly available or experiences data loss a… | Arc-A VM disks (OS, Ephemeral, Local) not placed on HA stor… | Ensure all three Arc-A VM virtual hard disks (OS disk, Ephe… |
| Edge browser shows a growing list of expired/outdated PME, … | Certificates are automatically cached by Edge browser each … | In Edge: Settings > Privacy, Search, and Services > Securit… |

---

## 已知问题速查

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
