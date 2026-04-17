# Networking AppGW 通用问题 — 综合排查指南

**条目数**: 39 | **草稿融合数**: 21 | **Kusto 查询融合**: 3
**来源草稿**: [ado-wiki-a-appgw-packet-capture-asc-renewed.md], [ado-wiki-a-appgw-packet-capture-asc-retiring.md], [ado-wiki-a-appgw-packet-capture.md], [ado-wiki-a-quick-check-maintenance-appgw.md], [ado-wiki-b-app-gw-with-spring-apps.md], [ado-wiki-b-appgw-architecture-reference.md], [ado-wiki-b-appgw-basic-sku.md], [ado-wiki-b-appgw-dashboards-v2.md], [ado-wiki-b-appgw-dip-vip-availability.md], [ado-wiki-b-appgw-load-distribution-graphs.md]...
**Kusto 引用**: [appgw.md], [arg-publicip.md], [arg-vnet-subnet.md]
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: 其他
> 来源: ado-wiki + onenote

1. **Application Gateway V2 memory utilization keeps increasing to 100%, causing outage**
   - 根因: Nginx process in AppGW V2 instances has a memory leak consuming excessive memory
   - 方案: Short-term: PG enables nginx watcher to auto-reload process at 40% memory usage. Long-term: PG enables queue size limit to reduce nginx memory consumption. Both require PG engagement. Check ApplicationGatewayFeatureFlag >= 32768 for short-term fix status.
   `[结论: 🟢 9.5/10 — onenote] [MCVKB/1.7 [NETVKB] AppGW V2 memory leaking issue.md]`

2. **Azure CLI command 'az network application-gateway address-pool update --remove backendIpConfigurations' fails to remove **
   - 根因: AppGW does not autonomously update IP values when referencing VMs. It relies on the VM NIC to manage and update IP values. The command targeting AppGW directly fails because the association is managed from the NIC side, not the AppGW side.
   - 方案: Use 'az network nic ip-config address-pool remove' instead of 'az network application-gateway address-pool update --remove'. Specify the full address-pool resource ID, the NIC IP config name, the NIC name, and the resource group of the NIC. Example: az network nic ip-config address-pool remove --address-pool "/subscriptions/.../backendAddressPools/pool-name" -n "NIC-IP-CONFIG-NAME" --nic-name "NIC-NAME" --resource-group "NIC-RG"
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FExpert%20Troubleshooting%2FRemoving%20Server%20from%20Backend%20Pool%20using%20Azure%20CLI)`

3. **Registering AllowApplicationGatewayLoadDistributionPolicy feature flag stays in Pending state indefinitely**
   - 根因: The Load Distribution feature for Azure Application Gateway has been cancelled/postponed with no ETA for public availability.
   - 方案: Inform customer the feature is not available and has no ETA. Advise to reach out to their account team for roadmap info. Reference IcM 528953655.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FFeature%3A%20AllowApplicationGatewayLoadDistributionPolicy)`

4. **Customer struggles to upload or download large files through AppGW v2 Standard SKU; slow transfer speeds, connection dro**
   - 根因: Request and response proxy buffering is enabled by default on AppGW v2 Standard SKU. This buffering can cause issues with large file uploads/downloads as the gateway attempts to buffer the entire payload before forwarding.
   - 方案: Disable request and response proxy buffering via REST API PUT on the AppGW globalConfiguration property. Use resources.azure.com/raw (GET the config, add `"globalConfiguration":{"enableRequestBuffering":false,"enableResponseBuffering":false}`, then PUT) or Azure API Playground (portal: https://ms.portal.azure.com/#view/Microsoft_Azure_Resources/ArmPlayground for public, https://portal.azure.us/#view/Microsoft_Azure_Resources/ArmPlayground for Gov). Note: this setting is NOT configurable via PowerShell or CLI.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FConfigure%20Request%20and%20Response%20Proxy%20Buffers%20via%20API%20Playground%20or%20resources.azure.com)`

5. **通过 AppGW V1 访问后端 Web 服务时响应延迟超过 10 分钟甚至超时；或第三方应用（如 Excel）通过 AppGW V1 获取报表时出现 'Invalid XML file received' 错误或响应不记录；直接访问后端 **
   - 根因: AppGW V1（基于 IIS）默认启用 Dynamic Compression。客户端请求携带 Accept-Encoding: gzip 时，即使后端返回未压缩内容，AppGW V1 也会将响应重新压缩后返回给客户端，导致额外延迟。AppGW V2 不具备此 Dynamic Compression 行为
   - 方案: 方案1：去掉客户端请求中的 Accept-Encoding: gzip 头，避免触发 AppGW V1 压缩。方案2（推荐）：迁移到 Application Gateway V2，V2 不会对响应进行 Dynamic Compression
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FResponse%20from%20Application%20Gateway%20V1%20delayed%20due%20to%20compression)`

6. **AppGW 同时配置了 wildcard listener（如 *.domain.com）和特定 hostname listener（如 webapp.domain.com），请求 webapp.domain.com 时被路由到 wildc**
   - 根因: wildcard listener 对应路由规则的 priority 数值低于特定 hostname listener 的路由规则（数值越小优先级越高）。AppGW 按优先级顺序匹配，wildcard 规则优先匹配，webapp.domain.com 完全匹配 *.domain.com，导致走了错误的路由
   - 方案: 将特定 hostname listener（如 webapp.domain.com）对应路由规则的 priority 数值设置为低于 wildcard listener 的路由规则数值（例如特定 hostname 用 priority 10，wildcard 用 priority 1000），使特定 hostname 规则先于 wildcard 规则被评估
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FRouting%20Issue%20With%20Wildcard%20listener%20Due%20to%20Priority)`

7. **Application Gateway v2 backend server shows unhealthy; private IP backend is unreachable**
   - 根因: Private IP backend does not exist in the AppGW VNet or its peered VNets; missing VNet peering that was not added
   - 方案: Verify that the backend private IP is within the AppGW VNet address space or a peered VNet; add missing VNet peering. Root Cause: Windows Azure\Virtual Network\VNet Peering\Configuration\How to
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FTools%20and%20TSGs%2FBackendConnectivityTSG)`

8. **将VMSS添加到AppGW后端池时操作报错，随后VMSS更新失败，错误：Resource referenced by resource was not found. Please make sure that the referenced **
   - 根因: VMSS的NIC配置中残留了对一个已被清空或不存在的AppGW后端池的引用，导致VMSS更新失败
   - 方案: 使用CLI移除VMSS中的孤立引用：(1) az vmss update --resource-group <rg> --name <vmss> --remove virtualMachineProfile.networkProfile.networkInterfaceConfigurations[0].ipConfigurations[0].applicationGatewayBackendAddressPools；(2) az vmss update-instances --instance-ids "*" --resource-group <rg> --name <vmss>。引用移除后，再重新将VMSS加入AppGW后端池
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FModify%20an%20Application%20Gateway%20when%20there%20is%20a%20backend%20pool%20referenced%20in%20a%20VMSS)`

9. **When Application Gateway overrides backend hostname, the Set-Cookie ARRAffinity header Domain attribute contains the bac**
   - 根因: Azure App Service sets the Set-Cookie Domain attribute based on the incoming Host header. When Application Gateway overrides the hostname to the backend FQDN (e.g., non-existing-app.azurewebsites.net), the cookie domain doesn't match the client's original hostname (e.g., test-gateway.test).
   - 方案: Set clientAffinityProxyEnabled=true on the App Service: az resource update --name <app-name> --resource-type 'Microsoft.Web/sites' -g <rg> --set properties.clientAffinityProxyEnabled=true. This makes the web app inspect X-Original-Host or X-Forwarded-Host headers from Application Gateway/Front Door/CDN and dynamically set the Set-Cookie Domain attribute to match the original client hostname.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FAzure%20App%20Service%20Session%20Affinity%20Cookie)`

10. **When accessing Application Gateway using host:port format (e.g., https://test-gateway.test:4443), the Set-Cookie ARRAffi**
   - 根因: Application Gateway's X-Original-Host header is derived from server variable var_http_host which includes the port. When clientAffinityProxyEnabled is true, the App Service uses this value (including port) as the Set-Cookie Domain attribute, violating cookie specifications.
   - 方案: Add a rewrite rule on Application Gateway to set the X-Forwarded-Host header for every request to the backend web app. Use the server variable var_host (hostname only, without port) as the value. The App Service will use X-Forwarded-Host instead of X-Original-Host, producing a valid cookie Domain without port.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FAzure%20App%20Service%20Session%20Affinity%20Cookie)`

11. **When accessing Application Gateway using host:port format, the Set-Cookie ARRAffinity Domain includes the port number. C**
   - 根因: Application Gateway X-Original-Host header is derived from server variable var_http_host which includes the port. The App Service uses this value (with port) as Set-Cookie Domain, violating cookie specs.
   - 方案: Add a rewrite rule on Application Gateway to set X-Forwarded-Host header using server variable var_host (hostname only, no port). The App Service will use X-Forwarded-Host instead of X-Original-Host.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FAzure%20App%20Service%20Session%20Affinity%20Cookie)`

12. **Requests bouncing between backend servers despite cookie-based affinity enabled; ARRAffinity cookie not retained by brow**
   - 根因: Client accessing Application Gateway via shortname URL (e.g. http://Website instead of FQDN). IE browser will not store or use cookies with shortname URLs
   - 方案: Access website using FQDN (e.g. http://website.com). If FQDN cannot be used, switch to a layer-4 Load Balancer. Verify with Fiddler trace that client sends ARRAffinity cookie back
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFoundational%20and%20Specialist%20Troubleshooting%2FSession%20Affinity%20Not%20Working)`

13. **使用PowerShell将AppGW移动到同VNet内新子网时失败，错误：(a) private IP cannot be changed；(b) frontend subnet and gateway subnet can not be **
   - 根因: AppGW V2（含私有前端IP）、Private-only V2 AppGW、或V1（静态私有前端IP）无法直接跨子网移动；只有动态IP的私有前端配置支持直接移动；静态私有IP配置不允许在移动过程中变更分配类型
   - 方案: 方案A（间接移动）：(1) 创建公共前端IP配置；(2) 将所有监听器关联到公共前端IP；(3) 删除静态私有前端IP配置；(4) 执行标准子网移动命令（Stop-AzApplicationGateway → Set-AzApplicationGatewayIPConfiguration → Set-AzApplicationGateway）；(5) 创建新的静态私有前端IP；(6) 重新关联监听器；(7) 删除临时公共前端IP。方案B：直接在新子网重建AppGW
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FHowTo%3A%20move%20Application%20Gateway%20to%20new%20Subnet%20within%20the%20Vnet)`

14. **Cannot view zones in Azure Portal after migrating Application Gateway from non-zonal to zonal; zones field appears empty**
   - 根因: Migration from non-zonal to zonal runs silently; zones are not displayed in portal after migration to avoid further issues
   - 方案: Navigate to ASC > download Raw Gateway Manager Config (SAS URL), search for PhysicalZones field to confirm the Application Gateway is zonal
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFoundational%20and%20Specialist%20Troubleshooting%2FTSG%3A%20%20Unable%20to%20view%20zones%20after%20migrating%20from%20non-zonal)`

15. **Application Gateway Private Link CRUD operation fails with error 'ApplicationGatewayOperationNotSupportedOnV1Sku'**
   - 根因: Private Link for Application Gateway is only supported on V2 SKU. The operation was attempted on a V1 SKU gateway.
   - 方案: Migrate Application Gateway from V1 to V2 SKU to leverage Private Link capabilities.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFoundational%20and%20Specialist%20Troubleshooting%2FTroubleshooting%20Private%20Link%20for%20Application%20Gateway)`

### Phase 2: 配置问题
> 来源: ado-wiki + onenote

1. **Cannot add VMSS in peered VNET to Application Gateway backend pool via Azure Portal**
   - 根因: Azure Portal limitation: Portal requires VMSS to be in the same VNET as Application Gateway, does not support cross-VNET peering backend configuration
   - 方案: Use Azure CLI: 1) Get backend pool ID with az network application-gateway show, 2) Add VMSS to pool with az vmss update --add virtualMachineProfile.networkProfile...applicationGatewayBackendAddressPools, 3) Update instances with az vmss update-instances
   `[结论: 🟢 9.5/10 — onenote] [MCVKB/1.10 [MCVKB]  Using Application Gateway with VNET.md]`

2. **Data path failure after configuring public and private listeners on same port for Application Gateway v2**
   - 根因: AppGW version is below Vmss_12.0.1496.2. The same-port feature for public/private IPs requires at least this version. Older versions accept the control plane configuration but the data path is inoperative.
   - 方案: Upgrade Application Gateway to the latest version (at least Vmss_12.0.1496.2). Post to [L7] Application Gateway Teams channel for TA review if needed.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FFeature%3A%20Public%20and%20Private%20IP%20in%20the%20same%20port%20for%20Application%20Gateway%20v2)`

3. **Application Gateway cannot reach backend in a peered VNet; backend health shows Unhealthy or Unknown**
   - 根因: VNet peering between AppGW VNet and backend VNet is broken, missing, or not properly configured
   - 方案: Verify VNet peering status in both VNets; recreate or fix the peering; ensure 'Allow gateway transit' and 'Use remote gateways' settings are correct. Root Cause: Windows Azure\Virtual Network\VNet Peering\Configuration\How to
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FTools%20and%20TSGs%2FBackendConnectivityTSG)`

4. **删除Application Gateway失败，错误：Cannot delete application gateway because its child resources are in use by virtual machine s**
   - 根因: VMSS的NIC网络配置（networkInterfaceConfigurations）中的applicationGatewayBackendAddressPools引用了该AppGW的后端池，必须先移除此引用才能删除AppGW
   - 方案: 执行以下Azure CLI命令移除VMSS对AppGW后端池的引用：(1) az vmss update --resource-group <rg> --name <vmss> --remove virtualMachineProfile.networkProfile.networkInterfaceConfigurations[0].ipConfigurations[0].applicationGatewayBackendAddressPools；(2) az vmss update-instances --instance-ids "*" --resource-group <rg> --name <vmss>。完成后再删除AppGW
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FModify%20an%20Application%20Gateway%20when%20there%20is%20a%20backend%20pool%20referenced%20in%20a%20VMSS)`

5. **Application Gateway session affinity not maintained; same session appears on multiple backend servers**
   - 根因: Cookie-based affinity not enabled in backendHttpSettingsCollection (cookieBasedAffinity set to Disabled)
   - 方案: Enable Cookie Based Affinity in the HTTP Settings tab in Azure Portal or set cookieBasedAffinity to Enabled in ARM config
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFoundational%20and%20Specialist%20Troubleshooting%2FSession%20Affinity%20Not%20Working)`

6. **WebSocket session times out unexpectedly on Application Gateway V2 even though connection was established**
   - 根因: HTTP Settings request timeout also applies to WebSocket sessions. V2 terminates session if no Keep-Alive from client or no PING-PONG from backend.
   - 方案: Configure PING-PONG intervals on backend application lower than AppGW HTTP Settings timeout value.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FFeature%3A%20Websockets%20Overview)`

7. **Updating IDLE timeout for Public IP of a CSES-migrated Application Gateway V1 fails with error: PublicIPAddressUsedByClo**
   - 根因: After CSES migration, Allocation Type and Idle Timeout settings of public IP addresses used by Cloud Services (Extended Support) cannot be changed via standard operations
   - 方案: PG must disable CSES creation at subscription level (Feature: DisableAppgwCsesDeployments). Reach TA via Teams [L7]Application Gateway channel for CRI approval, then escalate using ICM template [AppGWv1 CSES Migration] Disable CSES creation for subscription (id:B231l1)
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FApplication%20Gateway%20Internal%20CSES%20Migration)`

8. **Need to query Application Gateway historical VIP address and configuration for troubleshooting**
   - 根因: Application Gateway VIP and config changes are recorded in Kusto but not easily visible through Portal or ASC
   - 方案: Query Kusto table ApplicationGatewaysExtendedHistory with GatewayId filter to get VirtualIPs, GatewayName, Config. Note: deprecated article, endpoint may have changed.
   `[结论: 🟢 8.0/10 — onenote] [MCVKB/1.1[Deprecated][NET]how to query APP GW history VI.md]`

### Phase 3: 限制与容量
> 来源: ado-wiki

1. **Application Gateway CPU compute unit (CU) spikes even when customer traffic does not match the spike pattern**
   - 根因: Mandatory Qualys security scanning causes periodic CPU spikes, limited to max 5% CPU at lowest system priority
   - 方案: Expected behavior. Qualys scans are mandatory for S360 compliance. CPU capped at 5%. Extra CUs count toward billing if exceeding reserved capacity. Do not raise CRI unless deviation from pattern.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/CPU%20Spike%20After%20Internal%20Qualys%20Security%20Scan)`

2. **AppGW V2 billing overcharge: customer reports higher-than-expected charges for autoscaling Application Gateway v2. Porta**
   - 根因: Azure Portal bug: when creating an autoscaling Application Gateway v2, the portal forces a minimum of 2 instances. Each instance is billed for 10 Capacity Units regardless of traffic. Customer is overcharged for the extra minimum instance.
   - 方案: After creation, use PowerShell to decrease MinCapacity:
$appgw = Get-AzApplicationGateway -ResourceGroupName $RG -Name $AppGWNAME
$appgw = Set-AzApplicationGatewayAutoscaleConfiguration -ApplicationGateway $appgw -MinCapacity 0 -MaxCapacity 2
Set-AzApplicationGateway -ApplicationGateway $appgw
Explain workaround to customer and suggest billing engineer offer a refund.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Features%20and%20Functions/AppGW%20V2%20Billing%20Clarification)`

3. **AppGW V2 billing overcharge: portal creates autoscaling GW with minimum 2 instances (cannot set 0/1 in portal). 10 CUs p**
   - 根因: Azure Portal bug forces minimum 2 instances for autoscaling AppGW v2. Customer overcharged for extra minimum instance capacity.
   - 方案: After creation, use PS: Set-AzApplicationGatewayAutoscaleConfiguration -ApplicationGateway $appgw -MinCapacity 0 -MaxCapacity 2. Explain workaround and suggest billing refund.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Features%20and%20Functions/AppGW%20V2%20Billing%20Clarification)`

4. **Provisioning of Private Link Service fails with error: resource name is invalid / name too long (up to 80 characters lim**
   - 根因: Known issue (WI 25954704): When the Application Gateway resource name is long, the auto-generated internal Private Link policy resource name exceeds the 80-character limit for Azure resource names.
   - 方案: Known issue tracked in WI-25954704. Workaround: use a shorter Application Gateway name so the generated private-link-policy name stays within 80 characters. Monitor WI for fix availability.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFoundational%20and%20Specialist%20Troubleshooting%2FTroubleshooting%20Private%20Link%20for%20Application%20Gateway)`

5. **Application Gateway v1 returns server errors or unexpected behavior when URLs contain special characters (+, %, :, *, ;,**
   - 根因: AppGW v1 SKU does not tolerate '+' character in the URL under any conditions, and does not accept %, :, *, ;, \, & special characters when HTTP-to-HTTPS redirection is enabled. Root cause is ASP.NET limitation in the underlying datapath.
   - 方案: 1. Disable managed runtime version on the backend, or add a web.config allowing these characters. 2. If possible, migrate to AppGW v2 SKU which does not have this limitation. Note: This issue is specific to v1 SKU only.
   `[结论: 🟢 8.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FAppGtw%20special%20characters%20limitation%20in%20the%20request%20URL%20for%20HTTP%20to%20HTTPS%20Redirection)`

6. **AppGW autoscaling causes DDoS protection thresholds to scale proportionally, so DDoS mitigation never triggers during at**
   - 根因: When AppGW scales out and capacity units increase (due to DDoS or high traffic), the DDoS Protection autotune policy adjusts thresholds proportionally upward to match the scaled-up baseline. This causes the detection threshold to perpetually stay ahead of the traffic volume, preventing mitigation from ever triggering even during actual DDoS attacks. Per DDoS PG, this is by design.
   - 方案: Contact DDoS PG team via Teams DDoS channel or AVA escalation to manually reset DDoS thresholds back to baseline values before the AppGW scale-out event. For customers on Network (VNet) Protection plan who were unprotected during this window, they are eligible for cost reimbursement per DDoS Cost Protection workflow. Reference CRI 394958723.
   `[结论: 🟢 7.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20DDoS%20Protection/Capacity%20Units%20%26%20DDoS%20Protection)`

### Phase 4: 已知问题与限制
> 来源: ado-wiki

1. **ApplicationGatewayAccessLogs show periodic requests with Nmap user-agent from AppGW private frontend IP or localhost (12**
   - 根因: Known Azure Application Gateway platform bug (Bug 9729519): internal diagnostic loopback traffic is incorrectly surfaced in customer-facing access logs with Nmap user-agent
   - 方案: No customer action required. This is expected internal platform diagnostic traffic. Platform fix targeted for Q2 CY2026.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Appgw%20logs%20showing%20Nmap%20User-Agent%20Traffic)`

2. **Application cannot use cookie-based session affinity on Application Gateway**
   - 根因: Customer application does not support cookie-based affinity mechanism
   - 方案: Use Azure Load Balancer (ILB/SLB) with 5-tuple, 2-tuple, or 3-tuple distribution mode instead. Note: URL path rules and SSL offloading will not be available with Load Balancer
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFoundational%20and%20Specialist%20Troubleshooting%2FSession%20Affinity%20Not%20Working)`

3. **Application Gateway returns HTTP 403 for HTTP/2 traffic over cleartext (h2c)**
   - 根因: Azure Application Gateway only supports HTTP/2 for HTTPS listeners. HTTP listeners do not support HTTP/2 (h2c - HTTP/2 over cleartext).
   - 方案: Use HTTPS listener for HTTP/2 support. Most browsers only support HTTP/2 over HTTPS anyway.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FFeature%3A%20HTTP2%20Support)`

### Phase 5: DNS 解析
> 来源: ado-wiki

1. **Application Gateway resolves privatelink/private zone FQDNs (e.g., something.privatelink.web.core.windows.net) via publi**
   - 根因: AppGW has hard-coded DNS exceptions — domains matching .windows.net, .azure.net, .microsoft.com and others are always resolved via Azure DNS (168.63.129.16) regardless of custom DNS configuration. This is by design to ensure AppGW can reach its internal dependencies. The exception is implemented in dnsmasq configuration (appgwdnsmasq.conf).
   - 方案: Two workarounds: (1) Add the private DNS zone directly to the VNET where AppGW is deployed (instead of relying on forwarding through custom DNS in another VNET). (2) Use the backend IP address instead of FQDN in the backend pool, but set the correct hostname in backend settings and health probe. Note: If EnableApplicationGatewayNetworkIsolation feature is registered, the DNS exception is disabled in the customer namespace.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FExpert%20Troubleshooting%2FCustom%20DNS%20Internal%20Exceptions)`

2. **Application Gateway continues routing to stale/old backend IP addresses after DNS record changes for FQDN-based backend **
   - 根因: Prior behavior: Nginx only performed DNS resolution at startup and cached IPs for the entire lifetime of the worker process. No periodic DNS refresh was performed, so DNS record changes were unknown to the gateway until it restarted.
   - 方案: Current behavior (resolved in platform update): AppGW now refreshes DNS entries upon TTL expiry. If fresh DNS lookup fails, last-known good IP is maintained and retried every 1 second. If customer is on older AppGW version, trigger a gateway restart or perform a redundant PUT operation to force DNS re-resolution.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Refresh%20Backend%20DNS%20Cache)`

3. **Application Gateway backend shows Unknown health status; backend FQDN cannot be resolved by application gateway instance**
   - 根因: Missing DNS records for the backend FQDN; blocked connectivity to custom DNS server; private DNS zone missing virtual network link to AppGW VNet
   - 方案: Add/correct DNS records for backend FQDN; fix connectivity to custom DNS server; add VNet link for private DNS zone to AppGW VNet. Root Cause: Windows Azure\Azure DNS Services\...
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FTools%20and%20TSGs%2FBackendConnectivityTSG)`

### Phase 6: 网络与路由
> 来源: ado-wiki

1. **Application Gateway backend connectivity fails; intermediate firewall drops packets; asymmetric routing observed**
   - 根因: UDR on backend subnet routes return traffic through a firewall/NVA causing asymmetric routing; the firewall drops packets that do not match an existing session
   - 方案: Fix UDR on backend subnet to ensure symmetric routing; remove or adjust routes that force return traffic through NVA; or configure NVA to allow asymmetric routing. Root Cause: Windows Azure\Virtual Network\UDR\Configuration\How to
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FTools%20and%20TSGs%2FBackendConnectivityTSG)`

2. **Traffic blocked after configuring same port for public/private IPs on Application Gateway v2 with NSG**
   - 根因: When same port is configured for public and private IPs, AppGW internally changes the destination for ALL inbound flows to the frontend IPs. NSG rules not updated to include both public and private frontend IPs as destination.
   - 方案: Update NSG inbound rules: set Destination to both public and private frontend IPs of Application Gateway. Note: this affects ALL inbound flows, including other public listeners on different ports.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FFeature%3A%20Public%20and%20Private%20IP%20in%20the%20same%20port%20for%20Application%20Gateway%20v2)`

3. **AGIC with Azure CNI Overlay: backend pool shows Pod IP addresses from overlay network; traffic routing fails or backend **
   - 根因: Azure CNI Overlay has specific constraints: (1) Only a single V2 Application Gateway per /24 subnet is allowed — larger subnets are unsupported; (2) AGIC 1.8.0+ is required (1.8.1 fixes known controller bug); (3) Global and Regional VNet peerings are not supported; (4) Fairfax and Mooncake regions are not supported (as of July 2025). Without meeting these constraints, routing via the overlay network fails.
   - 方案: Ensure: (1) AppGw subnet is /24 and only one V2 AppGw is deployed on it; (2) Upgrade AGIC to 1.8.1+; (3) Remove any VNet peerings; (4) Do not use with Fairfax/Mooncake. Backend pool IP addresses will be Pod IPs (overlay range) which Application Gateway routes via injected routes — this is expected behavior.
   `[结论: 🟢 7.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FAGIC%20Application%20Gateway%20Ingress%20Controller%2FAGIC%20with%20Azure%20CNI%20Overlay)`

### Phase 7: 权限与认证
> 来源: ado-wiki

1. **VAPT (Vulnerability Assessment and Penetration Testing) reports flag Application Gateway affinity cookie as a security v**
   - 根因: The AppGW affinity cookie is a one-way hash of the backend pool VM's IP address used for session affinity. It does not contain customer data, login credentials, or session information — those are in cookies set by the backend server. The VAPT finding is a false alarm because even if the hash were cracked, it would only expose the backend server's IP/FQDN, not sensitive data.
   - 方案: Explain to the customer that this is a false alarm. The AppGW affinity cookie is a one-way hash that does not contain sensitive information. Even if reversed, it only reveals the backend IP/FQDN, not customer data. HTTPOnly and Secure flags on this cookie are on the AppGW roadmap for future enhancement but the current behavior does not pose a real security risk.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FApplication%20Gateway%20Affinity%20%2CCookie%20Handling%2C%20Vulnerabilities%2C%20and%20False%20Alarms)`

## Kusto 查询模板

`[工具: Kusto skill — appgw.md]`
→ 详见 `.claude/skills/kusto/networking/references/queries/appgw.md`

`[工具: Kusto skill — arg-publicip.md]`
→ 详见 `.claude/skills/kusto/networking/references/queries/arg-publicip.md`

`[工具: Kusto skill — arg-vnet-subnet.md]`
→ 详见 `.claude/skills/kusto/networking/references/queries/arg-vnet-subnet.md`

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Application Gateway V2 memory utilization keeps increasin... | Nginx process in AppGW V2 instances has a memor... | Short-term: PG enables nginx watcher to auto-re... | 🟢 9.5 | [MCVKB/1.7 [NETVKB] AppGW V2 memory leaking issue.md] |
| 2 | Cannot add VMSS in peered VNET to Application Gateway bac... | Azure Portal limitation: Portal requires VMSS t... | Use Azure CLI: 1) Get backend pool ID with az n... | 🟢 9.5 | [MCVKB/1.10 [MCVKB]  Using Application Gateway with VNET.md] |
| 3 | ApplicationGatewayAccessLogs show periodic requests with ... | Known Azure Application Gateway platform bug (B... | No customer action required. This is expected i... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Appgw%20logs%20showing%20Nmap%20User-Agent%20Traffic) |
| 4 | Application Gateway resolves privatelink/private zone FQD... | AppGW has hard-coded DNS exceptions — domains m... | Two workarounds: (1) Add the private DNS zone d... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FExpert%20Troubleshooting%2FCustom%20DNS%20Internal%20Exceptions) |
| 5 | Azure CLI command 'az network application-gateway address... | AppGW does not autonomously update IP values wh... | Use 'az network nic ip-config address-pool remo... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FExpert%20Troubleshooting%2FRemoving%20Server%20from%20Backend%20Pool%20using%20Azure%20CLI) |
| 6 | Data path failure after configuring public and private li... | AppGW version is below Vmss_12.0.1496.2. The sa... | Upgrade Application Gateway to the latest versi... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FFeature%3A%20Public%20and%20Private%20IP%20in%20the%20same%20port%20for%20Application%20Gateway%20v2) |
| 7 | Registering AllowApplicationGatewayLoadDistributionPolicy... | The Load Distribution feature for Azure Applica... | Inform customer the feature is not available an... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FFeature%3A%20AllowApplicationGatewayLoadDistributionPolicy) |
| 8 | Customer struggles to upload or download large files thro... | Request and response proxy buffering is enabled... | Disable request and response proxy buffering vi... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FConfigure%20Request%20and%20Response%20Proxy%20Buffers%20via%20API%20Playground%20or%20resources.azure.com) |
| 9 | 通过 AppGW V1 访问后端 Web 服务时响应延迟超过 10 分钟甚至超时；或第三方应用（如 Excel）通... | AppGW V1（基于 IIS）默认启用 Dynamic Compression。客户端请求携... | 方案1：去掉客户端请求中的 Accept-Encoding: gzip 头，避免触发 AppG... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FResponse%20from%20Application%20Gateway%20V1%20delayed%20due%20to%20compression) |
| 10 | AppGW 同时配置了 wildcard listener（如 *.domain.com）和特定 hostname... | wildcard listener 对应路由规则的 priority 数值低于特定 hostn... | 将特定 hostname listener（如 webapp.domain.com）对应路由规... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FRouting%20Issue%20With%20Wildcard%20listener%20Due%20to%20Priority) |
| 11 | Application Gateway continues routing to stale/old backen... | Prior behavior: Nginx only performed DNS resolu... | Current behavior (resolved in platform update):... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Refresh%20Backend%20DNS%20Cache) |
| 12 | Application Gateway backend shows Unknown health status; ... | Missing DNS records for the backend FQDN; block... | Add/correct DNS records for backend FQDN; fix c... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FTools%20and%20TSGs%2FBackendConnectivityTSG) |
| 13 | Application Gateway v2 backend server shows unhealthy; pr... | Private IP backend does not exist in the AppGW ... | Verify that the backend private IP is within th... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FTools%20and%20TSGs%2FBackendConnectivityTSG) |
| 14 | Application Gateway backend connectivity fails; intermedi... | UDR on backend subnet routes return traffic thr... | Fix UDR on backend subnet to ensure symmetric r... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FTools%20and%20TSGs%2FBackendConnectivityTSG) |
| 15 | Application Gateway cannot reach backend in a peered VNet... | VNet peering between AppGW VNet and backend VNe... | Verify VNet peering status in both VNets; recre... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FTools%20and%20TSGs%2FBackendConnectivityTSG) |
| 16 | Application Gateway CPU compute unit (CU) spikes even whe... | Mandatory Qualys security scanning causes perio... | Expected behavior. Qualys scans are mandatory f... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/CPU%20Spike%20After%20Internal%20Qualys%20Security%20Scan) |
| 17 | AppGW V2 billing overcharge: customer reports higher-than... | Azure Portal bug: when creating an autoscaling ... | After creation, use PowerShell to decrease MinC... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Features%20and%20Functions/AppGW%20V2%20Billing%20Clarification) |
| 18 | AppGW V2 billing overcharge: portal creates autoscaling G... | Azure Portal bug forces minimum 2 instances for... | After creation, use PS: Set-AzApplicationGatewa... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Features%20and%20Functions/AppGW%20V2%20Billing%20Clarification) |
| 19 | 删除Application Gateway失败，错误：Cannot delete application gate... | VMSS的NIC网络配置（networkInterfaceConfigurations）中的a... | 执行以下Azure CLI命令移除VMSS对AppGW后端池的引用：(1) az vmss u... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FModify%20an%20Application%20Gateway%20when%20there%20is%20a%20backend%20pool%20referenced%20in%20a%20VMSS) |
| 20 | 将VMSS添加到AppGW后端池时操作报错，随后VMSS更新失败，错误：Resource referenced b... | VMSS的NIC配置中残留了对一个已被清空或不存在的AppGW后端池的引用，导致VMSS更新失败 | 使用CLI移除VMSS中的孤立引用：(1) az vmss update --resource... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FModify%20an%20Application%20Gateway%20when%20there%20is%20a%20backend%20pool%20referenced%20in%20a%20VMSS) |
| 21 | VAPT (Vulnerability Assessment and Penetration Testing) r... | The AppGW affinity cookie is a one-way hash of ... | Explain to the customer that this is a false al... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FApplication%20Gateway%20Affinity%20%2CCookie%20Handling%2C%20Vulnerabilities%2C%20and%20False%20Alarms) |
| 22 | When Application Gateway overrides backend hostname, the ... | Azure App Service sets the Set-Cookie Domain at... | Set clientAffinityProxyEnabled=true on the App ... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FAzure%20App%20Service%20Session%20Affinity%20Cookie) |
| 23 | When accessing Application Gateway using host:port format... | Application Gateway's X-Original-Host header is... | Add a rewrite rule on Application Gateway to se... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FAzure%20App%20Service%20Session%20Affinity%20Cookie) |
| 24 | When accessing Application Gateway using host:port format... | Application Gateway X-Original-Host header is d... | Add a rewrite rule on Application Gateway to se... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FAzure%20App%20Service%20Session%20Affinity%20Cookie) |
| 25 | Application Gateway session affinity not maintained; same... | Cookie-based affinity not enabled in backendHtt... | Enable Cookie Based Affinity in the HTTP Settin... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFoundational%20and%20Specialist%20Troubleshooting%2FSession%20Affinity%20Not%20Working) |
| 26 | Application cannot use cookie-based session affinity on A... | Customer application does not support cookie-ba... | Use Azure Load Balancer (ILB/SLB) with 5-tuple,... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFoundational%20and%20Specialist%20Troubleshooting%2FSession%20Affinity%20Not%20Working) |
| 27 | Requests bouncing between backend servers despite cookie-... | Client accessing Application Gateway via shortn... | Access website using FQDN (e.g. http://website.... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFoundational%20and%20Specialist%20Troubleshooting%2FSession%20Affinity%20Not%20Working) |
| 28 | Application Gateway returns HTTP 403 for HTTP/2 traffic o... | Azure Application Gateway only supports HTTP/2 ... | Use HTTPS listener for HTTP/2 support. Most bro... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FFeature%3A%20HTTP2%20Support) |
| 29 | WebSocket session times out unexpectedly on Application G... | HTTP Settings request timeout also applies to W... | Configure PING-PONG intervals on backend applic... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FFeature%3A%20Websockets%20Overview) |
| 30 | Traffic blocked after configuring same port for public/pr... | When same port is configured for public and pri... | Update NSG inbound rules: set Destination to bo... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FFeature%3A%20Public%20and%20Private%20IP%20in%20the%20same%20port%20for%20Application%20Gateway%20v2) |
| 31 | 使用PowerShell将AppGW移动到同VNet内新子网时失败，错误：(a) private IP canno... | AppGW V2（含私有前端IP）、Private-only V2 AppGW、或V1（静态私... | 方案A（间接移动）：(1) 创建公共前端IP配置；(2) 将所有监听器关联到公共前端IP；(3... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FHowTo%3A%20move%20Application%20Gateway%20to%20new%20Subnet%20within%20the%20Vnet) |
| 32 | Updating IDLE timeout for Public IP of a CSES-migrated Ap... | After CSES migration, Allocation Type and Idle ... | PG must disable CSES creation at subscription l... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FApplication%20Gateway%20Internal%20CSES%20Migration) |
| 33 | Cannot view zones in Azure Portal after migrating Applica... | Migration from non-zonal to zonal runs silently... | Navigate to ASC > download Raw Gateway Manager ... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFoundational%20and%20Specialist%20Troubleshooting%2FTSG%3A%20%20Unable%20to%20view%20zones%20after%20migrating%20from%20non-zonal) |
| 34 | Application Gateway Private Link CRUD operation fails wit... | Private Link for Application Gateway is only su... | Migrate Application Gateway from V1 to V2 SKU t... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFoundational%20and%20Specialist%20Troubleshooting%2FTroubleshooting%20Private%20Link%20for%20Application%20Gateway) |
| 35 | Provisioning of Private Link Service fails with error: re... | Known issue (WI 25954704): When the Application... | Known issue tracked in WI-25954704. Workaround:... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFoundational%20and%20Specialist%20Troubleshooting%2FTroubleshooting%20Private%20Link%20for%20Application%20Gateway) |
| 36 | Application Gateway v1 returns server errors or unexpecte... | AppGW v1 SKU does not tolerate '+' character in... | 1. Disable managed runtime version on the backe... | 🟢 8.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FAppGtw%20special%20characters%20limitation%20in%20the%20request%20URL%20for%20HTTP%20to%20HTTPS%20Redirection) |
| 37 | Need to query Application Gateway historical VIP address ... | Application Gateway VIP and config changes are ... | Query Kusto table ApplicationGatewaysExtendedHi... | 🟢 8.0 | [MCVKB/1.1[Deprecated][NET]how to query APP GW history VI.md] |
| 38 | AppGW autoscaling causes DDoS protection thresholds to sc... | When AppGW scales out and capacity units increa... | Contact DDoS PG team via Teams DDoS channel or ... | 🟢 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20DDoS%20Protection/Capacity%20Units%20%26%20DDoS%20Protection) |
| 39 | AGIC with Azure CNI Overlay: backend pool shows Pod IP ad... | Azure CNI Overlay has specific constraints: (1)... | Ensure: (1) AppGw subnet is /24 and only one V2... | 🟢 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FAGIC%20Application%20Gateway%20Ingress%20Controller%2FAGIC%20with%20Azure%20CNI%20Overlay) |
