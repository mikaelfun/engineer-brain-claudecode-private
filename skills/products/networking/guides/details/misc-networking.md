# Networking 其他网络问题 — 综合排查指南

**条目数**: 29 | **草稿融合数**: 4 | **Kusto 查询融合**: 0
**来源草稿**: [onenote-azfw-packet-capture.md], [onenote-pcap-to-kusto.md], [onenote-pingmesh-latency-query.md], [onenote-traceroute-wan-flow.md]
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: 其他
> 来源: mslearn + ado-wiki + onenote

1. **Previously accessible website returns 403 Forbidden or ERR_SSL_PROTOCOL_ERROR after 21v HTTPS auto-blocking enabled**
   - 根因: 21v ICP compliance: HTTPS auto-blocking blocks access to domains without ICP registration. Blocking identified by redirect URL containing 42.159.191.244:5672/lanyun.htm in packet capture.
   - 方案: 1) Quick verify: capture packet, check for 403 with lanyun.htm. 2) Transfer to ICP team for 21v BC cases. 3) Customer needs ICP domain registration. Affects WebApp, Network services.
   `[结论: 🟢 9.5/10 — onenote] [MCVKB/9.1 Unregistered domain is 403 forbidden according.md]`

2. **Need to capture network trace on Cloud Service Extended Support or Azure VM without installing third-party tools**
   - 根因: Wireshark/tcpdump not available on the instance and cannot install software due to restrictions
   - 方案: Use built-in netsh trace: 1) netsh trace start persistent=yes capture=yes tracefile=c:\temp\nettrace.etl 2) reproduce issue 3) netsh trace stop 4) download etl2pcapng from GitHub (v1.11.0) 5) convert: etl2pcapng.exe file.etl output.pcapng 6) analyze in Wireshark locally
   `[结论: 🟢 9.5/10 — onenote] [MCVKB/3.8 Collect network package without install tools.md]`

3. **Backend Last Byte Response Time (BLBRT) metric appears greater than Application Gateway Total Time (AGTT) metric in the **
   - 根因: AGTT is calculated per listener (total time / total requests per listener); BLBRT is calculated per listener/upstream/server and aggregated as a sum across backend pools — different dimensions cause the mathematical discrepancy when comparing aggregated values
   - 方案: View AGTT per listener for an accurate picture. View BLBRT broken down per listener + backend pool + backend HTTP settings + backend server address. Avoid comparing these metrics at different aggregation levels. Large time frames also increase sample intervals making graphs less accurate.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FUnderstanding%20discrepancies%20in%20Application%20Gateway%20Metrics)`

4. **AppGW WAF GEOIP.txt file contains IP address ranges in integer format (e.g., 3655065088,3655065151,IQ), making it diffic**
   - 根因: The GEOIP database used by AppGW WAF stores IP ranges as integer values rather than dotted-decimal notation
   - 方案: Use PowerShell script to convert integer IP ranges to dotted-decimal format: $DB = Get-Content 'GEOIP.txt'; foreach ($Data in $DB) { $Start, $End, $Region = $Data -split ',' -replace '^\s*|\s*$'; $StartIP = [IPAddress]$Start; $EndIP = [IPAddress]$End; write-host "$StartIP,$EndIP,$Region" }
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FWAF%20for%20Application%20Gateway%2FHow%20To%2FConvert%20WAF%20GeoIPs%20from%20Integer%20format%20to%20IP%20format)`

5. **Customer needs to migrate Application Gateway from WAF_v2 SKU back to Standard_v2 SKU and receives errors or is unsure h**
   - 根因: Migrating from WAF_v2 to Standard_v2 requires removing all WAF policy associations first; there is no direct portal option to change SKU tier
   - 方案: Step 1: Dissociate all per-listener WAF policies and per-URI WAF policies from the AppGW. Step 2: Run PowerShell: $AppGw = Get-AzApplicationGateway -ResourceGroupName <RG> -Name <GWName>; $AppGw.FirewallPolicy = $null; $AppGw.Sku.Name = 'Standard_v2'; $AppGw.Sku.Tier = 'Standard_v2'; $AppGw.WebApplicationFirewallConfiguration = $null; $AppGw.ForceFirewallPolicyAssociation = $true; Set-AzApplicationGateway -ApplicationGateway $AppGw
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FWAF%20for%20Application%20Gateway%2FHow%20To%2FHow%20to%20use%20PS%20to%20migrate%20from%20Waf_v2%20to%20Standard_v2)`

6. **Intermittent VM connectivity failures when behind a load balancer - connections drop or time out periodically due to SNA**
   - 根因: VMs behind a load balancer using SNAT for outbound connections can exhaust the available SNAT ports, causing intermittent connection failures. Each outbound connection consumes a SNAT port with a cooldown timer.
   - 方案: Associate a NAT gateway with the subnet (recommended), assign a public IP directly to the VM, or configure outbound rules on Standard Load Balancer to allocate more SNAT ports.
   `[结论: 🟢 8.0/10 — mslearn] [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/troubleshoot-vm-connectivity)`

7. **Cannot delete Azure virtual network - error Subnet is in use or cannot be deleted because in use by resource**
   - 根因: Resources attached to the VNet prevent deletion: VNet gateways, application gateways, VMs, container instances, Entra Domain Services, peerings, or VNet stuck in migration state.
   - 方案: Follow deletion order: 1) Gateway connections 2) Gateways 3) Public IPs 4) VNet peerings 5) ASE. Check Connected devices in VNet overview. For migration stuck: Move-AzureVirtualNetwork -Abort. Verify no VMs running.
   `[结论: 🟢 8.0/10 — mslearn] [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/virtual-network-troubleshoot-cannot-delete-vnet)`

8. **Azure VM cannot send outbound email on SMTP port 25 - connection times out or is blocked for non-Enterprise Agreement su**
   - 根因: Azure platform blocks outbound SMTP connections on TCP port 25 for all subscription types except Enterprise Agreement (EA) and Microsoft Customer Agreement for enterprise (MCA-E). Enterprise Dev/Test subscriptions also blocked by default.
   - 方案: Use authenticated SMTP relay service (e.g., Azure Communication Services) on TCP port 587 instead of port 25. For EA/MCA-E subscriptions, port 25 is allowed but delivery depends on recipient domain acceptance. For Enterprise Dev/Test, request unblock via Azure portal Diagnose and Solve.
   `[结论: 🔵 6.0/10 — mslearn] [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/troubleshoot-outbound-smtp-connectivity)`

### Phase 2: 限制与容量
> 来源: ado-wiki + onenote

1. **Load Balancer sends all traffic to only one backend VM during pressure test with Client<->PLB<->NVA<->ILB<->Backend topo**
   - 根因: 5-tuple hash algorithm limitation: when client IP is fixed (pressure test), Hash(IP) is constant. Combined with NVA IPs having complementary hash values, all flows converge to the same backend VM through hash calculation
   - 方案: This is expected behavior in pressure test scenarios with fixed client IP. In production with varying client IPs, traffic distributes evenly. For testing: use multiple source IPs, or understand that hash-based distribution requires entropy in the 5-tuple fields.
   `[结论: 🟢 9.5/10 — onenote] [MCVKB/4.3[NET] Why does load balancer load all the traff.md]`

2. **AppGW v2 (Standard_V2) throughput is limited when customers upload or download large files; adding more instances does n**
   - 根因: Standard_V2 AppGW SKU is based on a customized Standard_D1_V2 VM with ~750 Mbps bandwidth cap per instance; bandwidth is inherently limited and horizontal scaling does not increase per-connection throughput
   - 方案: Route large file traffic (e.g. download URLs like dwnld.contoso.com) through CDN, Azure Front Door, or directly to the backend. Route regular traffic via AppGW. Backend must have direct internet connectivity; plan firewall/security compliance accordingly.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FThroughput%20via%20ApplicationGatewayv2)`

3. **Azure Application Gateway V1 has missing or dropped diagnostics logs intermittently**
   - 根因: AppGW V1 SKU has a hard platform limit of 100 active HTTP listeners (Active = Total listeners minus listeners not routing traffic); exceeding this limit causes dropped diagnostics logs and incomplete telemetry
   - 方案: Check active listener count in Azure Support Center. If count exceeds 100: remove unused/inactive listeners, consolidate by using wildcard hostnames, or reuse existing listeners. Note: this limit cannot be increased on V1. Consider migrating to V2 SKU if more than 100 active listeners are needed.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FV1%20Known%20Issue%20Missing%20Logs)`

4. **Customer gets error 'MaxRequestBodySizeInKb 2000 is out of range, it should be within 8 and 128' when attempting to incr**
   - 根因: The increased request body limit (up to 2MB) and file upload limit (up to 4GB) are only available when running OWASP_3.2 (CRS 3.2) Managed Rule Set. Customer is using an older rule set (OWASP_3.1 or earlier) which has a hard cap of 128KB for request body
   - 方案: Step 1: Upgrade Managed Rule Set to OWASP_3.2 via Portal (WAF Policy → Managed Rules → set to OWASP 3.2 → Save) or CLI: az network application-gateway waf-policy managed-rule rule-set update --policy-name <name> --resource-group <rg> --type OWASP --version 3.2. Step 2: Increase limits: az network application-gateway waf-policy update --name <name> --resource-group <rg> --set policySettings.fileUploadLimitInMb=<MB> policySettings.maxRequestBodySizeInKb=<KB>. Limits: max 2000KB request body, max 4096MB file upload. Note: recommend testing CRS 3.2 on a non-production policy first.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FWAF%20for%20Application%20Gateway%2FHow%20To%2FWAFv2%20Increase%20the%20Max%20Request%20Body%20size%20or%20the%20Max%20File%20Upload%20Size)`

5. **Application Gateway WAF returning 413 Request Entity Too Large for non-file request bodies even with custom rules applie**
   - 根因: The 128 KB body size limit for non-file (raw JSON) requests is enforced by ModSecurity's secrequestbodyinmemorylimit — WAF custom rules skip variable processing but cannot bypass this size limit. Rules and limits are processed independently.
   - 方案: 1) If sending large raw JSON bodies: the 128KB limit is a hard constraint — either reduce body size or disable body inspection for that path. 2) Use per-listener or per-URI WAF policy to disable body inspection only on specific URIs (e.g. /files/upload) while keeping WAF active elsewhere. 3) Upgrade to OWASP 3.2 policy which can increase body size limit to 2MB.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FWAF%20for%20Application%20Gateway%2FTroubleshooting%2FTSG%3A%20Application%20Gateway%20V2%20returning%20413%20Request%20Entity%20Too%20Large%20even%20with%20custom%20rules%20applied)`

### Phase 3: 配置问题
> 来源: mslearn + ado-wiki

1. **Application Gateway operation fails with error: ApplicationGatewayProbePathIsInvalid — 'Path specified for Probe ... is **
   - 根因: Kubernetes readiness or liveness probe configured with a path that does not start with `/` (e.g., `test.html`). Kubernetes accepts this configuration and the Pod runs fine. However, when AGIC translates the Pod probe to an Application Gateway health probe, Application Gateway requires all probe paths to start with `/`. The missing slash causes the ARM deployment/update to fail.
   - 方案: Run `kubectl get deploy -n <namespace> -o yaml`. Find the readinessProbe or livenessProbe and correct the path to start with `/` (e.g., change `test.html` to `/test.html`). After fixing, AGIC will regenerate the Application Gateway probe with the valid path and the deployment will succeed.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FAGIC%20Application%20Gateway%20Ingress%20Controller%2FTroubleshooting%20Health%20Probes)`

2. **S2S VPN pre-shared key mismatch (error 13801) - IKE authentication credentials are unacceptable**
   - 根因: Pre-shared key configured on Azure connection resource does not match the key configured on the on-premises VPN device tunnel.
   - 方案: Verify and ensure the pre-shared key on the Azure connection resource matches exactly with the on-premises VPN device tunnel configuration.
   `[结论: 🔵 6.0/10 — mslearn] [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-troubleshoot-site-to-site-error-codes)`

3. **S2S VPN IKE/IPsec policy mismatch (error 13868/13825) or DH computation failure (error 13822) - policy match error or no**
   - 根因: IKE/IPsec policy or DH group configuration on Azure connection resource does not match the on-premises VPN device tunnel configuration.
   - 方案: For custom policy: ensure IKE policy on on-premises device matches Azure connection. For default policy: check IPsec/IKE connection policies documentation. Verify DH group matches on both sides. Engage VPN device vendor if DH computation fails.
   `[结论: 🔵 6.0/10 — mslearn] [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-troubleshoot-site-to-site-error-codes)`

4. **S2S VPN traffic selector mismatch (error 13999) - traffic selectors unacceptable by on-premises device**
   - 根因: Traffic selector configuration proposed by Azure VPN gateway is not accepted by on-premises device due to configuration mismatch.
   - 方案: 1) Check on-premises device logs for traffic selector rejection reason. 2) Fix traffic selector config on on-premises device, or 3) Configure policy-based traffic selector on Azure connection to match on-premises device.
   `[结论: 🔵 6.0/10 — mslearn] [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-troubleshoot-site-to-site-error-codes)`

5. **S2S VPN connection refused (error 1225) - remote computer refused the network connection when on-premises device initiat**
   - 根因: Azure connection resource is configured as Initiator only mode, so it does not accept incoming connection requests from on-premises device.
   - 方案: Update the connection mode property on Azure connection resource to Default or Responder only.
   `[结论: 🔵 6.0/10 — mslearn] [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-troubleshoot-site-to-site-error-codes)`

### Phase 4: 已知问题与限制
> 来源: ado-wiki

1. **Customer wants to associate a WAF Policy with a specific URI path in Application Gateway per-URI (per path-rule) granula**
   - 根因: Azure Portal does not support per-URI WAF policy association for path-based rules. Only per-site (per-listener) association is available in the Portal
   - 方案: Use Azure CLI to associate WAF policy per URI path rule: az network application-gateway url-path-map rule create -g <RG> --gateway-name <GW-Name> -n <RuleName> --path-map-name <PathMapName> --paths /String/* --address-pool <Pool> --http-settings <Settings> --waf-policy <WAF-Policy-ResourceID>. WAF policy priority: per-URI > per-site > global.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FWAF%20for%20Application%20Gateway%2FHow%20To%2FCreate%20Per%20Uri%20Waf%20Policy%20for%20AppGW%20WAFV2)`

2. **Customer requests rollback from CRS 3.2 back to CRS 3.1 or CRS 3.0 on Application Gateway WAF**
   - 根因: CRS 3.2 introduced a new WAF engine. The new engine does not support rollback to previous engine versions. As of September 2025, rollback is permanently disabled
   - 方案: Do NOT create ICM for rollback (as of Sep 2025 this is no longer permitted). Instruct customer to upgrade directly to the latest DRS 2.1 ruleset. For safe validation of new rules, change the new rules' action to 'log' mode first before enforcing. Reference: https://learn.microsoft.com/en-us/azure/web-application-firewall/ag/application-gateway-crs-rulegroups-rules?tabs=drs21%2Cowasp32#core-rule-sets-crs---legacy
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FWAF%20for%20Application%20Gateway%2FHow%20To%2FRollback%20Customer%20From%20CRS3.2)`

3. **Application Gateway packet capture filters (IP/port) configured via ASC are not being applied; capture includes all traf**
   - 根因: Known bug in Application Gateway packet capture functionality via ASC: filters are not applying (Known Bug/Issue 153524 — AppGW packet capture filters not applying).
   - 方案: Workaround: Start packet capture without filters (capture all traffic), then filter the downloaded pcap file post-collection using Wireshark or similar tool. Use minimal capture duration and force-stop early to limit file size.
   `[结论: 🔵 6.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FTools%20and%20TSGs%2FApp%20Gateway%20Packet%20Capture%20via%20ASC%20and%20Retrieval%20%28Renewed%29)`

### Phase 5: 证书与密钥
> 来源: ado-wiki + contentidea-kb

1. **AppGW CRUD/PUT operations fail with NrpException: 'Problem occurred while accessing and validating KeyVault Secrets asso**
   - 根因: AppGW has orphaned TLS certificate references in Listener TLS Certificates section pointing to KeyVault certificates that have already been deleted; AppGW attempts to validate all referenced certificates during any PUT operation, causing failure
   - 方案: Use Vulcan JIT to access the customer's portal. Navigate to AppGW > Listeners > Listener TLS Certificates. Identify and delete all certificates that have 0 associated listeners — these are orphaned references. Delete them one by one until AppGW returns to Succeeded state.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FUnused%20Listener%20TLS%20Certificates)`

2. **Known issue where if customers try to use ADFS Authentication through an ILB/VPN, they are unable to. Topology: Local Cl**
   - 根因: The issue is due to a problem with how ILBs handle the jumbo packets sent by ADFS servers as SSL "Server Hello. Certificates". Once they reach the Azure Gateway, they are not fragmented properly so they do not make it across the VPN tunnel.
   - 方案: Reduce the MTU packet size on the ADFS servers by executing: netsh interface ipv4 show subinterfaces / netsh interface ipv4 set subinterface "Sub-interface name from previous command" mtu=1350 store=persistent
   `[结论: 🟢 7.5/10 — contentidea-kb] [KB](ContentIdea#64141)`

### Phase 6: DNS 解析
> 来源: mslearn + onenote

1. **SMTP server hosted in Azure receives '554: No PTR Record' error when sending or receiving messages from remote mail serv**
   - 根因: Azure public IP reverse DNS (PTR) records must be configured using -ReverseFqdn property on the PublicIpAddress resource, not in custom domain zones. If reverse FQDN does not belong to the subscription, configuration fails.
   - 方案: Set -ReverseFqdn on the PublicIpAddress resource via Set-AzPublicIpAddress. Ensure IP and reverse FQDN belong to the same subscription. If SMTP banner is manually changed to match default reverse FQDN, remote servers may still fail if SMTP banner host doesn't match MX record.
   `[结论: 🟢 8.0/10 — mslearn] [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/create-ptr-for-smtp-service)`

2. **Need to find the correct PG team for routing network ICM tickets**
   - 根因: Network PG has many sub-teams (AzDNS, NRP, SLB, Gateway Manager, NDM, etc.) and the correct team mapping is not always obvious
   - 方案: Query Kusto cluster Aznw (aznw.kusto.windows.net), database aznwcosmos, table DstsCertTeamMappings for current network team mappings. Note: this is deprecated info from 2018, may be outdated
   `[结论: 🟢 8.0/10 — onenote] [MCVKB/9.2[Deprecated][NET] Network team mapping.md]`

### Phase 7: 网络与路由
> 来源: mslearn

1. **Azure VM cannot connect to the second (secondary) network adapter of another VM in the same VNet - traffic limited to sa**
   - 根因: Secondary network interfaces are not configured with a default gateway by default. Without a gateway route entry, traffic flow on the secondary adapter is limited to the same subnet.
   - 方案: On the VM with secondary NIC, add a persistent route: Route add 0.0.0.0 mask 0.0.0.0 -p <Gateway IP> where Gateway IP is the first usable IP of the secondary NIC subnet. Verify with route print. Also check NSG rules on both primary and secondary NICs.
   `[结论: 🟢 8.0/10 — mslearn] [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/troubleshoot-vm-connectivity)`

2. **S2S VPN IKE negotiation timeout (error 13805) - on-premises VPN device not responding to Azure VPN gateway IKE messages**
   - 根因: On-premises VPN device IP incorrectly configured on Local Network Gateway, or on-premises firewall blocking IKE packets, or on-premises device not responding to IKE messages.
   - 方案: 1) Verify on-premises IP on Local Network Gateway resource. 2) Check if on-premises device receives IKE packets. 3) Check on-premises firewall rules for IKE. 4) Review on-premises VPN device logs. 5) Engage device vendor if needed.
   `[结论: 🔵 6.0/10 — mslearn] [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-troubleshoot-site-to-site-error-codes)`

### Phase 8: 权限与认证
> 来源: ado-wiki

1. **AGIC pod logs show LinkedAuthorizationFailed error; AGIC cannot perform write/CRUD operations on AppGW after Key Vault i**
   - 根因: AGIC managed identity lacks the Microsoft.ManagedIdentity/userAssignedIdentities/assign/action permission on the AppGW's user-assigned managed identity; this permission is required when AppGW uses a managed identity for KV integration, and is typically missed when KV integration is added after initial AGIC deployment
   - 方案: 1. Assign 'Managed Identity Operator' role to the AGIC MI on the AppGW managed identity scope: az role assignment create --role 'Managed Identity Operator' --assignee <agicMIPrincipalId> --scope <appGwManagedIdentityResourceId>. 2. Force AGIC pod token refresh by deleting and recreating the AGIC pod: kubectl delete pod -n <AGICNamespace> <AGICPODNAME>. Entra ID tokens have long lifespan so RBAC changes do not apply until token refresh.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FAGIC%20Application%20Gateway%20Ingress%20Controller%2FAGIC%20is%20no%20longer%20able%20to%20run%20operations%20after%20key%20vault%20integration%20is%20added)`

### Phase 9: 版本与兼容
> 来源: mslearn

1. **S2S VPN invalid IKE messages or version mismatch (error 13824/13843/13846/13880) - unsupported protocol from on-premises**
   - 根因: On-premises VPN device sending unsupported IKE messages/protocols, or IKE version (IKEv1 vs IKEv2) mismatch between Azure connection and on-premises device.
   - 方案: 1) Ensure on-premises device is a validated VPN device. 2) Ensure IKE version matches on both sides. 3) Contact on-premises device vendor for help.
   `[结论: 🔵 6.0/10 — mslearn] [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-troubleshoot-site-to-site-error-codes)`

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Load Balancer sends all traffic to only one backend VM du... | 5-tuple hash algorithm limitation: when client ... | This is expected behavior in pressure test scen... | 🟢 9.5 | [MCVKB/4.3[NET] Why does load balancer load all the traff.md] |
| 2 | Previously accessible website returns 403 Forbidden or ER... | 21v ICP compliance: HTTPS auto-blocking blocks ... | 1) Quick verify: capture packet, check for 403 ... | 🟢 9.5 | [MCVKB/9.1 Unregistered domain is 403 forbidden according.md] |
| 3 | Need to capture network trace on Cloud Service Extended S... | Wireshark/tcpdump not available on the instance... | Use built-in netsh trace: 1) netsh trace start ... | 🟢 9.5 | [MCVKB/3.8 Collect network package without install tools.md] |
| 4 | AppGW v2 (Standard_V2) throughput is limited when custome... | Standard_V2 AppGW SKU is based on a customized ... | Route large file traffic (e.g. download URLs li... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FThroughput%20via%20ApplicationGatewayv2) |
| 5 | Backend Last Byte Response Time (BLBRT) metric appears gr... | AGTT is calculated per listener (total time / t... | View AGTT per listener for an accurate picture.... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FUnderstanding%20discrepancies%20in%20Application%20Gateway%20Metrics) |
| 6 | AppGW CRUD/PUT operations fail with NrpException: 'Proble... | AppGW has orphaned TLS certificate references i... | Use Vulcan JIT to access the customer's portal.... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FUnused%20Listener%20TLS%20Certificates) |
| 7 | Azure Application Gateway V1 has missing or dropped diagn... | AppGW V1 SKU has a hard platform limit of 100 a... | Check active listener count in Azure Support Ce... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FV1%20Known%20Issue%20Missing%20Logs) |
| 8 | AGIC pod logs show LinkedAuthorizationFailed error; AGIC ... | AGIC managed identity lacks the Microsoft.Manag... | 1. Assign 'Managed Identity Operator' role to t... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FAGIC%20Application%20Gateway%20Ingress%20Controller%2FAGIC%20is%20no%20longer%20able%20to%20run%20operations%20after%20key%20vault%20integration%20is%20added) |
| 9 | Application Gateway operation fails with error: Applicati... | Kubernetes readiness or liveness probe configur... | Run `kubectl get deploy -n <namespace> -o yaml`... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FAGIC%20Application%20Gateway%20Ingress%20Controller%2FTroubleshooting%20Health%20Probes) |
| 10 | AppGW WAF GEOIP.txt file contains IP address ranges in in... | The GEOIP database used by AppGW WAF stores IP ... | Use PowerShell script to convert integer IP ran... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FWAF%20for%20Application%20Gateway%2FHow%20To%2FConvert%20WAF%20GeoIPs%20from%20Integer%20format%20to%20IP%20format) |
| 11 | Customer wants to associate a WAF Policy with a specific ... | Azure Portal does not support per-URI WAF polic... | Use Azure CLI to associate WAF policy per URI p... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FWAF%20for%20Application%20Gateway%2FHow%20To%2FCreate%20Per%20Uri%20Waf%20Policy%20for%20AppGW%20WAFV2) |
| 12 | Customer needs to migrate Application Gateway from WAF_v2... | Migrating from WAF_v2 to Standard_v2 requires r... | Step 1: Dissociate all per-listener WAF policie... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FWAF%20for%20Application%20Gateway%2FHow%20To%2FHow%20to%20use%20PS%20to%20migrate%20from%20Waf_v2%20to%20Standard_v2) |
| 13 | Customer requests rollback from CRS 3.2 back to CRS 3.1 o... | CRS 3.2 introduced a new WAF engine. The new en... | Do NOT create ICM for rollback (as of Sep 2025 ... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FWAF%20for%20Application%20Gateway%2FHow%20To%2FRollback%20Customer%20From%20CRS3.2) |
| 14 | Customer gets error 'MaxRequestBodySizeInKb 2000 is out o... | The increased request body limit (up to 2MB) an... | Step 1: Upgrade Managed Rule Set to OWASP_3.2 v... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FWAF%20for%20Application%20Gateway%2FHow%20To%2FWAFv2%20Increase%20the%20Max%20Request%20Body%20size%20or%20the%20Max%20File%20Upload%20Size) |
| 15 | Application Gateway WAF returning 413 Request Entity Too ... | The 128 KB body size limit for non-file (raw JS... | 1) If sending large raw JSON bodies: the 128KB ... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FWAF%20for%20Application%20Gateway%2FTroubleshooting%2FTSG%3A%20Application%20Gateway%20V2%20returning%20413%20Request%20Entity%20Too%20Large%20even%20with%20custom%20rules%20applied) |
| 16 | SMTP server hosted in Azure receives '554: No PTR Record'... | Azure public IP reverse DNS (PTR) records must ... | Set -ReverseFqdn on the PublicIpAddress resourc... | 🟢 8.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/create-ptr-for-smtp-service) |
| 17 | Azure VM cannot connect to the second (secondary) network... | Secondary network interfaces are not configured... | On the VM with secondary NIC, add a persistent ... | 🟢 8.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/troubleshoot-vm-connectivity) |
| 18 | Intermittent VM connectivity failures when behind a load ... | VMs behind a load balancer using SNAT for outbo... | Associate a NAT gateway with the subnet (recomm... | 🟢 8.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/troubleshoot-vm-connectivity) |
| 19 | Cannot delete Azure virtual network - error Subnet is in ... | Resources attached to the VNet prevent deletion... | Follow deletion order: 1) Gateway connections 2... | 🟢 8.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/virtual-network-troubleshoot-cannot-delete-vnet) |
| 20 | Need to find the correct PG team for routing network ICM ... | Network PG has many sub-teams (AzDNS, NRP, SLB,... | Query Kusto cluster Aznw (aznw.kusto.windows.ne... | 🟢 8.0 | [MCVKB/9.2[Deprecated][NET] Network team mapping.md] |
| 21 | Known issue where if customers try to use ADFS Authentica... | The issue is due to a problem with how ILBs han... | Reduce the MTU packet size on the ADFS servers ... | 🟢 7.5 | [KB](ContentIdea#64141) |
| 22 | Azure VM cannot send outbound email on SMTP port 25 - con... | Azure platform blocks outbound SMTP connections... | Use authenticated SMTP relay service (e.g., Azu... | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/troubleshoot-outbound-smtp-connectivity) |
| 23 | S2S VPN IKE negotiation timeout (error 13805) - on-premis... | On-premises VPN device IP incorrectly configure... | 1) Verify on-premises IP on Local Network Gatew... | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-troubleshoot-site-to-site-error-codes) |
| 24 | S2S VPN pre-shared key mismatch (error 13801) - IKE authe... | Pre-shared key configured on Azure connection r... | Verify and ensure the pre-shared key on the Azu... | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-troubleshoot-site-to-site-error-codes) |
| 25 | S2S VPN IKE/IPsec policy mismatch (error 13868/13825) or ... | IKE/IPsec policy or DH group configuration on A... | For custom policy: ensure IKE policy on on-prem... | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-troubleshoot-site-to-site-error-codes) |
| 26 | S2S VPN traffic selector mismatch (error 13999) - traffic... | Traffic selector configuration proposed by Azur... | 1) Check on-premises device logs for traffic se... | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-troubleshoot-site-to-site-error-codes) |
| 27 | S2S VPN invalid IKE messages or version mismatch (error 1... | On-premises VPN device sending unsupported IKE ... | 1) Ensure on-premises device is a validated VPN... | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-troubleshoot-site-to-site-error-codes) |
| 28 | S2S VPN connection refused (error 1225) - remote computer... | Azure connection resource is configured as Init... | Update the connection mode property on Azure co... | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-troubleshoot-site-to-site-error-codes) |
| 29 | Application Gateway packet capture filters (IP/port) conf... | Known bug in Application Gateway packet capture... | Workaround: Start packet capture without filter... | 🔵 6.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FTools%20and%20TSGs%2FApp%20Gateway%20Packet%20Capture%20via%20ASC%20and%20Retrieval%20%28Renewed%29) |
