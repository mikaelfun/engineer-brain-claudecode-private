# ARM ARM 杂项操作 latency avnm — 排查速查

**来源数**: 15 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
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

## 快速排查路径
1. Azure Policy does not support built-in alerts. Use Event Grid system topic: Pol… `[来源: ado-wiki]`
2. Use the AzAPI Terraform provider as an alternative. AzAPI acts as a thin layer … `[来源: ado-wiki]`
3. Manually trigger storage repair via PowerShell (Repair-AzsScaleUnitNode) or Azu… `[来源: ado-wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/arm-misc-operations-latency-avnm.md#排查流程)
