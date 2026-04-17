# Networking AppGW 失败状态与 CRUD — 综合排查指南

**条目数**: 7 | **草稿融合数**: 2 | **Kusto 查询融合**: 1
**来源草稿**: [ado-wiki-b-appgw-failed-state.md], [ado-wiki-c-crud-operations-appgw-v2.md]
**Kusto 引用**: [appgw.md]
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: 网络与路由
> 来源: ado-wiki

1. **AppGW goes down — CPU, memory utilization, and instance count all drop to zero. GWM shows MaxUnhealthyUpgradedInstancePe**
   - 根因: A default route (0.0.0.0/0) was propagated to the AppGW subnet via ExpressRoute or VPN gateway peering, breaking control plane connectivity. This is a documented unsupported scenario.
   - 方案: 1) Create a UDR on AppGW subnet to disable BGP route propagation, OR 2) Create a UDR with 0.0.0.0/0 pointing to Internet next hop. Verify: Check peered VNet for 'useRemoteGateways=true', then query GatewayTenantLogsTable for 'Updated adjacency table' messages containing '0.0.0.0'. Ref: https://learn.microsoft.com/en-us/azure/application-gateway/configuration-infrastructure#v2-supported-scenarios
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FExpert%20Troubleshooting%2FOperation%20failures%20on%20Application%20Gateways)`

2. **AppGW v2 CRUD operations fail with error 'ApplicationGatewayILBDeploymentFailureDueToPrivateIPInUse' or 'Unable to reser**
   - 根因: The private Frontend IP address chosen by the customer is already allocated to one of the AppGW's internal instances. AppGW instances use IPs from the same subnet; customers are unaware these IPs are reserved. Creating a private frontend IP without a listener does not reserve the IP — it can be claimed by instances during scaling or VMSS repairs.
   - 方案: 1. Check instance IPs via ASC Properties tab and the failed operation details to confirm the IP conflict. 2. If no listener is attached: delete the conflicting private frontend IP config and recreate with a different IP using PowerShell (Remove-AzApplicationGatewayFrontendIPConfig) or CLI. 3. If listener is attached: temporarily move listener to public frontend, delete private frontend IP, recreate with a new IP, then reattach listener. Use IPs from the end of the AppGW subnet range to avoid conflicts.
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FAppGW%20v2%20CRUD%20Operations%20Failing%20Due%20to%20the%20ApplicationGatewayILBDeploymentFailureDueToPrivateIPInUse%20error)`

### Phase 2: 配置问题
> 来源: ado-wiki

1. **Application Gateway enters Failed State; NRP logs show error: 'Input string was not in a correct format' originating fro**
   - 根因: Application Gateway fails to validate Custom Error Page configuration because the referenced URL is malformed or the hosted error page is inaccessible / returns a non-200 HTTP response code
   - 方案: 1) Fix custom error page: ensure the HTML file is hosted at a publicly accessible URL returning HTTP 200; 2) Remove custom error page config via PowerShell: `Remove-AzApplicationGatewayCustomError` (gateway-level) or `Remove-AzApplicationGatewayHttpListenerCustomError` (listener-level). Use NRP FrontendOperationEtwEvent in Jarvis to confirm the error scenario first
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFoundational%20and%20Specialist%20Troubleshooting%2FFailed%20State%20Input%20string%20was%20not%20in%20a%20correct%20format)`

2. **AppGW CRUD操作失败进入Failed状态，错误码：ApplicationGatewayProbeProtocolMustMatchBackendHttpSettinsProtocol；NRP日志显示：Probe protocol (**
   - 根因: 健康探测（Probe）配置的协议（如HTTP）与关联的后端HTTP设置（Backend HTTP Settings）的协议（如HTTPS）不匹配，NRP验证层拒绝该配置
   - 方案: 简单的Get/Set操作无法修复Failed状态，必须按以下步骤修复协议不匹配：(1) 删除请求路由规则（Request Routing Rule）；(2) 删除错误信息中引用的Backend HTTP Settings；(3) 重新创建HTTP规则和Backend HTTP Settings，确保Probe与Backend HTTP Settings使用相同协议（均为HTTP或均为HTTPS）
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FProbe%20and%20HTTP%20Setting%20Protocol%20Mismatch)`

### Phase 3: 已知问题与限制
> 来源: ado-wiki

1. **Application Gateway PUT operation fails with Backend Address Pool cannot have duplicate addresses when two backend pools**
   - 根因: Known bug (Bug 9989909): validation does not prevent VMSS instance from having the same address in multiple backend address pools
   - 方案: Remove duplicate IPs from both backend pools in a single PUT operation (one by one will fail). Use PowerShell: Get-AzApplicationGateway, filter BackendAddresses, Set-AzApplicationGateway, then PUT on VMSS.
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Backend%20Address%20Pool%20cannot%20have%20duplicate%20addresses)`

### Phase 4: 权限与认证
> 来源: ado-wiki

1. **Application Gateway DELETE (or other CRUD operations) fails; GWM logs show 'AADSTS7000112: Application GatewayRP is disa**
   - 根因: The customer has disabled the GatewayRP enterprise application (app ID 486c78bf-a0f7-45f1-92fd-37215929e116) in their Azure AD tenant. GWM requires authentication from the customer subscription side, and this disabled state blocks the auth flow.
   - 方案: Customer must re-enable the GatewayRP application in their Azure AD tenant: go to Enterprise Applications → find GatewayRP (486c78bf-a0f7-45f1-92fd-37215929e116) → Properties → set 'Enabled for users to sign in' = Yes. Then retry the failed operation. Refer to: https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/disable-user-sign-in-portal
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FGatewayRP%20is%20disabled)`

### Phase 5: 证书与密钥
> 来源: ado-wiki

1. **AppGW V1进入Failed状态，无法执行任何配置变更（PUT操作均失败）；通常发生在频繁添加Authentication Certificates之后，或证书数量接近/超过限制时**
   - 根因: AppGW V1的所有Authentication Certificates总大小有128KB硬限制；持续添加新证书（而非替换现有证书）超过该限制会导致AppGW进入Failed状态。另外V1/V2均有每类证书最多100个的数量限制。证书从监听器/后端设置解除关联后，证书配置并不会自动从AppGW中删除
   - 方案: 从Jarvis Actions获取AppGW raw config JSON文件（Get Application Gateway action）保存为config.json，使用Get-AppGWUnusedCerts.ps1工具识别未使用的证书：(1) .\Get-AppGWUnusedCerts.ps1 -File config.json（查看未使用证书列表）；(2) .\Get-AppGWUnusedCerts.ps1 -File config.json -Out removecerts.ps1（生成删除脚本）；将生成的脚本提供给客户在CloudShell中执行，一次性删除所有未使用证书
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FIdentify%20Unused%20Application%20Gateway%20Certificates%20-%20TOOL%21)`

## Kusto 查询模板

`[工具: Kusto skill — appgw.md]`
→ 详见 `.claude/skills/kusto/networking/references/queries/appgw.md`

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Application Gateway PUT operation fails with Backend Addr... | Known bug (Bug 9989909): validation does not pr... | Remove duplicate IPs from both backend pools in... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Backend%20Address%20Pool%20cannot%20have%20duplicate%20addresses) |
| 2 | AppGW goes down — CPU, memory utilization, and instance c... | A default route (0.0.0.0/0) was propagated to t... | 1) Create a UDR on AppGW subnet to disable BGP ... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FExpert%20Troubleshooting%2FOperation%20failures%20on%20Application%20Gateways) |
| 3 | Application Gateway DELETE (or other CRUD operations) fai... | The customer has disabled the GatewayRP enterpr... | Customer must re-enable the GatewayRP applicati... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FGatewayRP%20is%20disabled) |
| 4 | AppGW v2 CRUD operations fail with error 'ApplicationGate... | The private Frontend IP address chosen by the c... | 1. Check instance IPs via ASC Properties tab an... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FAppGW%20v2%20CRUD%20Operations%20Failing%20Due%20to%20the%20ApplicationGatewayILBDeploymentFailureDueToPrivateIPInUse%20error) |
| 5 | Application Gateway enters Failed State; NRP logs show er... | Application Gateway fails to validate Custom Er... | 1) Fix custom error page: ensure the HTML file ... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFoundational%20and%20Specialist%20Troubleshooting%2FFailed%20State%20Input%20string%20was%20not%20in%20a%20correct%20format) |
| 6 | AppGW CRUD操作失败进入Failed状态，错误码：ApplicationGatewayProbeProto... | 健康探测（Probe）配置的协议（如HTTP）与关联的后端HTTP设置（Backend HTT... | 简单的Get/Set操作无法修复Failed状态，必须按以下步骤修复协议不匹配：(1) 删除请... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FProbe%20and%20HTTP%20Setting%20Protocol%20Mismatch) |
| 7 | AppGW V1进入Failed状态，无法执行任何配置变更（PUT操作均失败）；通常发生在频繁添加Authenti... | AppGW V1的所有Authentication Certificates总大小有128KB... | 从Jarvis Actions获取AppGW raw config JSON文件（Get Ap... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FIdentify%20Unused%20Application%20Gateway%20Certificates%20-%20TOOL%21) |
