# ARM ARM 杂项操作 latency avnm — 综合排查指南

**条目数**: 15 | **草稿融合数**: 0 | **Kusto 查询融合**: 3
**来源草稿**: —
**Kusto 引用**: request-tracking.md, failed-operations.md, activity-log.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: ARM API calls are slow or have unexpectedly high latency; unclear whether delay…
> 来源: ado-wiki

**根因分析**: ARM adds processing time before forwarding to RP; HttpIncomingRequests.durationInMilliseconds captures total end-to-end duration (ARM + RP); HttpOutgoingRequests.durationInMilliseconds captures only the RP portion

1. Compare durationInMilliseconds in HttpIncomingRequests (total) vs HttpOutgoingRequests (RP time) using the same correlationId.
2. The delta (Incoming minus Outgoing) indicates ARM-side delay; the Outgoing value indicates RP-side delay.
3. Use this to determine which side to escalate.

`[结论: 🔵 6.0/10 — [ADO Wiki]]`

### Phase 2: AVNM 网络组成员资格与 Policy 合规状态的对应关系令人困惑：满足条件的 VNET 反而显示 non-compliant，但被加入了网络组
> 来源: ado-wiki

**根因分析**: AVNM 与 Policy 的集成使用了反向逻辑：Policy 将满足所有条件的 VNET 标记为 non-compliant，AVNM 读取 non-compliant 结果后将该 VNET 加入网络组。这是 by design。

1. 向客户解释：AVNM 场景下 Policy non-compliant = '应加入网络组'，compliant = '不应加入'。这是 AVNM 与 Policy 集成的设计行为，非 Bug。AVNM 的后续处理（加入/移除网络组）由 AVNM 团队负责。.

`[结论: 🔵 6.0/10 — [ADO Wiki]]`

### Phase 3: Key Vault dataplane policy 的合规详情（evaluation details）在 Policy Compliance UI 中不可见…
> 来源: ado-wiki

**根因分析**: 这是已知功能限制：当前 evaluation details 尚未在 Policy Compliance UI 中为 Key Vault dataplane policies 实现。

1. 告知客户这是当前平台限制，evaluation details 对 Key Vault dataplane policies 不可用。如需排查合规原因，需借助 Key Vault traces 和 Kusto 中的 Components Greenfield/Brownfield logs（需 Key Vault 团队协助）。.

`[结论: 🔵 6.0/10 — [ADO Wiki]]`

### Phase 4: Customer wants to create alerts based on Azure Policy compliance state changes …
> 来源: ado-wiki

1. Azure Policy does not support built-in alerts.
2. Use Event Grid system topic: Policy is supported as an Event Grid system topic.
3. Subscribe to compliance state change events and integrate with alerting/automation solutions.
4. Reference: https://learn.
5. com/en-us/azure/governance/policy/concepts/event-overview.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 5: Terraform AzureRM provider does not support a new Azure resource type, resource…
> 来源: ado-wiki

**根因分析**: The AzureRM provider is hardcoded to specific supported resources, properties, and API versions at each release. Any new Azure resource, property, or API version requires a new AzureRM provider version to be released by Hashicorp/Microsoft before it becomes available.

1. Use the AzAPI Terraform provider as an alternative.
2. AzAPI acts as a thin layer directly over ARM REST APIs and supports all resource types, properties, and API versions (including private preview).
3. Recommended workflow: use AzAPI while the feature is in preview, then migrate to AzureRM once officially released using the AzAPI2AzureRM migration tool.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 6: During or after node addition in Azure Stack, background storage repair/optimiz…
> 来源: ado-wiki

**根因分析**: Azure Stack background storage jobs may not automatically retry after failure during node operations

1. Manually trigger storage repair via PowerShell (Repair-AzsScaleUnitNode) or Azure Stack Admin Portal.
2. Monitor storage jobs with Get-StorageJob to confirm completion before proceeding with further cluster operations.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 7: Start-SdnDataCollection shows warnings about inability to copy files using port…
> 来源: ado-wiki

**根因分析**: Port 445 (SMB) may be blocked between the Domain Controller and target SDN nodes, preventing direct file copy during diagnostic data collection

1. Ignore port 445 warnings.
2. SdnDiagnostics module automatically falls back to WinRM for file copy.
3. Collected files appear at C:\Windows\Tracing\SdnDiag\SdnDataCollection_<datetime>.
4. Upload to Helen workspace for analysis.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 8: NAKS cluster deletion fails because azure-arc-k8sagent feature cannot be remove…
> 来源: ado-wiki

**根因分析**: Bug in feature reconciler triggers deletion before cluster is fully created. When cluster creation fails or is interrupted (often due to capacity issues preventing agent pool node deployment), the subscription ID in ProviderVariables is never populated. Feature deletion logic expects this ID to exist, leaving the cluster stuck.

1. Manual mitigation: (1) Delete NAKS from portal, (2) Check/delete kubernetescluster CR with kubectl, (3) Patch finalizer on azure-arc-k8sagents feature: kubectl patch kcft -n nc-system <name>-azure-arc-k8sagents --type=json to remove /metadata/finalizers, (4) Wait for NAKS deletion.
2. Fixed in build 2603.
3. Ref Bug 2380334.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 9: Nexus tenant-level operations (e.g. VM delete) fail with error: net/http: TLS h…
> 来源: ado-wiki

**根因分析**: k8bridgeproxy limitation: it does not retry on TLS/handshake errors when proxying to k8bridge. Transient backend failures cause TLS handshake timeouts that are not retried.

1. Retry the failed operation; TLS issues are transient and should succeed on retry.
2. Fix tracked by Bug 2551088.
3. Diagnose via K8BridgeProxyTraces Kusto query filtering level=error, message=HTTP Request Failed, error=TLS handshake timeout.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 10: Network Fabric device RefreshConfiguration post-action fails with System.Argume…
> 来源: ado-wiki

**根因分析**: Two related bugs: Bug 2591815 - RefreshConfiguration should be blocked when Fabric is in Accepted (pending commit) state but is allowed. Bug 2591832 - Null exception in PatchArmResource because apiVersion is null during RefreshConfiguration in this state.

1. Avoid running az networkfabric device refresh-configuration when Fabric is in Accepted/pending commit state.
2. Complete the commit workflow first.
3. Fixed in NNF 11.
4. 0 (management bundle, build 2604).

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 11: After bare metal machine (BMM) replace action, iDRAC interface TLS certificate …
> 来源: ado-wiki

**根因分析**: Race condition during BMM replace action: hardware validation resets iDRAC (clearing TLS certs) simultaneously with certificate reconciler. Due to race, certificate is replaced BEFORE iDRAC reset, so reset clears the correct alrs-edge-interface-issuer certificate.

1. Three options: (1) Wait ~40 days for automatic cert rotation (no functional impact), (2) Force cert reinstall via kubectl patch baremetalmachine status to null secretRevision + az networkcloud baremetalmachine run-command, (3) Run BMM restart.
2. Fix in future release.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 12: cluster-cve-report run-data-extract fails with Failed to retrieve vulnerability…
> 来源: ado-wiki

**根因分析**: nexus-trivy-operator deadlock: failed scan pod (exit code 1) followed by successful retry, but operator picks failed pod first (no status filtering), gets unexpected EOF, requeues but never deletes stuck scan job. Permanently consumes one of two ConcurrentScanJobsLimit slots. Both consumed = all scanning stops.

1. See TSG: Scan Job Deadlock - CVE Report Failures at eng.
2. ms for diagnose/fix/verify steps.
3. Present in all pre-NC 4.
4. 10 versions.
5. Fixed in NC 4.
6. 10 (build 2604).

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 13: ARM 部署报错 NoRegisteredProviderFound 或 MissingSubscriptionRegistration：No registe…
> 来源: mslearn

**根因分析**: 订阅未注册所需的 Resource Provider。首次使用某 RP 时需手动注册；或 VM auto-shutdown 需要 Microsoft.DevTestLab RP；或模板部署的资源会自动创建依赖资源（如监控/安全），其 RP 也需注册

1. 1) az provider register --namespace Microsoft.
2. Xxx 或 Register-AzResourceProvider -ProviderNamespace Microsoft.
3. Xxx 注册 RP；2) Portal → Subscription → Resource providers → 选择 RP → Register；3) 检查 API version 和 location 是否受支持：az provider show --namespace Microsoft.
4. Web --query resourceTypes[?resourceType=='sites'].

`[结论: 🔵 6.0/10 — [mslearn]]`

### Phase 14: ARM 部署报错 OperationNotAllowed 或 ResourceQuotaExceeded：Operation results in excee…
> 来源: mslearn

**根因分析**: 部署请求的资源数量超过了订阅/资源组/区域的配额限制，如 vCPU 数量、公共 IP 数量、存储账户数量等

1. 1) 检查当前配额使用情况：az vm list-usage --location westus 或 Get-AzVMUsage -Location westus；2) Portal → Subscription → Usage + quotas → Request increase 请求增加配额；3) 修改部署模板减少资源数量或更换区域.

`[结论: 🔵 6.0/10 — [mslearn]]`

### Phase 15: ARM 部署报错 SkuNotAvailable 或 InvalidTemplateDeployment：The requested size for res…
> 来源: mslearn

**根因分析**: 所选 SKU（如 VM 大小）在指定区域/可用区不可用，可能是该区域未提供该 SKU、订阅没有该 SKU 的访问权限（NotAvailableForSubscription）、或 Azure Spot 容量不足

1. 1) 检查可用 SKU：az vm list-skus --location centralus --size Standard_D --all --output table；2) 检查可用区：az vm list-skus --location centralus --zone --all --output table；3) 更换 VM 大小或部署到其他区域/可用区；4) 如订阅受限，提交 SKU request 给 Azure Support.

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
| ARM API calls are slow or have unexpectedly high latency; u… | ARM adds processing time before forwarding to RP; HttpIncom… | Compare durationInMilliseconds in HttpIncomingRequests (tot… |
| AVNM 网络组成员资格与 Policy 合规状态的对应关系令人困惑：满足条件的 VNET 反而显示 non-comp… | AVNM 与 Policy 的集成使用了反向逻辑：Policy 将满足所有条件的 VNET 标记为 non-compl… | 向客户解释：AVNM 场景下 Policy non-compliant = '应加入网络组'，compliant = … |
| Key Vault dataplane policy 的合规详情（evaluation details）在 Polic… | 这是已知功能限制：当前 evaluation details 尚未在 Policy Compliance UI 中为 … | 告知客户这是当前平台限制，evaluation details 对 Key Vault dataplane polic… |
| Customer wants to create alerts based on Azure Policy compl… | — | Azure Policy does not support built-in alerts. Use Event Gr… |
| Terraform AzureRM provider does not support a new Azure res… | The AzureRM provider is hardcoded to specific supported res… | Use the AzAPI Terraform provider as an alternative. AzAPI a… |
| During or after node addition in Azure Stack, background st… | Azure Stack background storage jobs may not automatically r… | Manually trigger storage repair via PowerShell (Repair-AzsS… |
| Start-SdnDataCollection shows warnings about inability to c… | Port 445 (SMB) may be blocked between the Domain Controller… | Ignore port 445 warnings. SdnDiagnostics module automatical… |
| NAKS cluster deletion fails because azure-arc-k8sagent feat… | Bug in feature reconciler triggers deletion before cluster … | Manual mitigation: (1) Delete NAKS from portal, (2) Check/d… |
| Nexus tenant-level operations (e.g. VM delete) fail with er… | k8bridgeproxy limitation: it does not retry on TLS/handshak… | Retry the failed operation; TLS issues are transient and sh… |
| Network Fabric device RefreshConfiguration post-action fail… | Two related bugs: Bug 2591815 - RefreshConfiguration should… | Avoid running az networkfabric device refresh-configuration… |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Customer wants to create alerts based on Azure Policy compliance state changes but Policy does not … | — | Azure Policy does not support built-in alerts. Use Event Grid system topic: Policy is supported as … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 | Terraform AzureRM provider does not support a new Azure resource type, resource property, or API ve… | The AzureRM provider is hardcoded to specific supported resources, properties, and API versions at … | Use the AzAPI Terraform provider as an alternative. AzAPI acts as a thin layer directly over ARM RE… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 | During or after node addition in Azure Stack, background storage repair/optimization jobs do not au… | Azure Stack background storage jobs may not automatically retry after failure during node operations | Manually trigger storage repair via PowerShell (Repair-AzsScaleUnitNode) or Azure Stack Admin Porta… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 | Start-SdnDataCollection shows warnings about inability to copy files using port 445 (SMB) during SD… | Port 445 (SMB) may be blocked between the Domain Controller and target SDN nodes, preventing direct… | Ignore port 445 warnings. SdnDiagnostics module automatically falls back to WinRM for file copy. Co… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 | NAKS cluster deletion fails because azure-arc-k8sagent feature cannot be removed; clusters stuck in… | Bug in feature reconciler triggers deletion before cluster is fully created. When cluster creation … | Manual mitigation: (1) Delete NAKS from portal, (2) Check/delete kubernetescluster CR with kubectl,… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 | Nexus tenant-level operations (e.g. VM delete) fail with error: net/http: TLS handshake timeout; k8… | k8bridgeproxy limitation: it does not retry on TLS/handshake errors when proxying to k8bridge. Tran… | Retry the failed operation; TLS issues are transient and should succeed on retry. Fix tracked by Bu… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 7 | Network Fabric device RefreshConfiguration post-action fails with System.ArgumentNullException: api… | Two related bugs: Bug 2591815 - RefreshConfiguration should be blocked when Fabric is in Accepted (… | Avoid running az networkfabric device refresh-configuration when Fabric is in Accepted/pending comm… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 8 | After bare metal machine (BMM) replace action, iDRAC interface TLS certificate resets to Dell defau… | Race condition during BMM replace action: hardware validation resets iDRAC (clearing TLS certs) sim… | Three options: (1) Wait ~40 days for automatic cert rotation (no functional impact), (2) Force cert… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 9 | cluster-cve-report run-data-extract fails with Failed to retrieve vulnerability report; nexus-trivy… | nexus-trivy-operator deadlock: failed scan pod (exit code 1) followed by successful retry, but oper… | See TSG: Scan Job Deadlock - CVE Report Failures at eng.ms for diagnose/fix/verify steps. Present i… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 10 | ARM API calls are slow or have unexpectedly high latency; unclear whether delay originates from ARM… | ARM adds processing time before forwarding to RP; HttpIncomingRequests.durationInMilliseconds captu… | Compare durationInMilliseconds in HttpIncomingRequests (total) vs HttpOutgoingRequests (RP time) us… | 🔵 6.0 — ado-wiki+21V适用 | [ADO Wiki] |
| 11 | AVNM 网络组成员资格与 Policy 合规状态的对应关系令人困惑：满足条件的 VNET 反而显示 non-compliant，但被加入了网络组 | AVNM 与 Policy 的集成使用了反向逻辑：Policy 将满足所有条件的 VNET 标记为 non-compliant，AVNM 读取 non-compliant 结果后将该 VNET 加入… | 向客户解释：AVNM 场景下 Policy non-compliant = '应加入网络组'，compliant = '不应加入'。这是 AVNM 与 Policy 集成的设计行为，非 Bug。AV… | 🔵 6.0 — ado-wiki+21V适用 | [ADO Wiki] |
| 12 | Key Vault dataplane policy 的合规详情（evaluation details）在 Policy Compliance UI 中不可见/无法查看 | 这是已知功能限制：当前 evaluation details 尚未在 Policy Compliance UI 中为 Key Vault dataplane policies 实现。 | 告知客户这是当前平台限制，evaluation details 对 Key Vault dataplane policies 不可用。如需排查合规原因，需借助 Key Vault traces 和 … | 🔵 6.0 — ado-wiki+21V适用 | [ADO Wiki] |
| 13 | ARM 部署报错 NoRegisteredProviderFound 或 MissingSubscriptionRegistration：No registered resource provide… | 订阅未注册所需的 Resource Provider。首次使用某 RP 时需手动注册；或 VM auto-shutdown 需要 Microsoft.DevTestLab RP；或模板部署的资源会自… | 1) az provider register --namespace Microsoft.Xxx 或 Register-AzResourceProvider -ProviderNamespace … | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 14 | ARM 部署报错 OperationNotAllowed 或 ResourceQuotaExceeded：Operation results in exceeding quota limits of… | 部署请求的资源数量超过了订阅/资源组/区域的配额限制，如 vCPU 数量、公共 IP 数量、存储账户数量等 | 1) 检查当前配额使用情况：az vm list-usage --location westus 或 Get-AzVMUsage -Location westus；2) Portal → Subsc… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 15 | ARM 部署报错 SkuNotAvailable 或 InvalidTemplateDeployment：The requested size for resource is currently n… | 所选 SKU（如 VM 大小）在指定区域/可用区不可用，可能是该区域未提供该 SKU、订阅没有该 SKU 的访问权限（NotAvailableForSubscription）、或 Azure Spo… | 1) 检查可用 SKU：az vm list-skus --location centralus --size Standard_D --all --output table；2) 检查可用区：az… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
