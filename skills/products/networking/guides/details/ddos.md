# Networking DDoS Protection — 综合排查指南

**条目数**: 13 | **草稿融合数**: 9 | **Kusto 查询融合**: 1
**来源草稿**: [ado-wiki-b-ddos-troubleshooting-guides.md], [ado-wiki-b-log-sources-ddos-protection.md], [ado-wiki-b-outbound-ddos-troubleshooting.md], [ado-wiki-c-special-ddos-sr-cri-handling-processes.md], [ado-wiki-c-tsg-ddos-attack-post-mortem.md], [ado-wiki-c-tsg-ddos-cost-protection-workflow.md], [ado-wiki-c-tsg-determine-customers-ddos-sku.md], [ado-wiki-c-tsg-infrastructure-level-ddos-limits.md], [ado-wiki-c-tsg-layer-7-ddos-attack.md]
**Kusto 引用**: [arg-publicip.md]
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: 网络与路由
> 来源: ado-wiki

1. **TCP connections appear to hang (server not responding) during DDoS mitigation when SYN Auth v2 is active**
   - 根因: SYN Auth v2 sends an invalid ACK (with wrong ACK number, appears like a challenge ACK) to authenticate clients. If there is a firewall in the path that drops this invalid ACK, the client never receives the challenge and cannot complete authentication, making it appear the server is not responding.
   - 方案: If a firewall in the network path is dropping the invalid ACK challenge, consider switching to SYN Auth v1 (uses RST) or v3 (uses invalid SYN+ACK) to check compatibility. Alternatively, configure the firewall to allow the challenge ACK packets.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DDoS%20Protection%2FTCP%20SYN%20auth%20versions%20and%20behaviors)`

2. **TCP connections appear to hang (server not responding) during DDoS mitigation when SYN Auth v3 is active**
   - 根因: SYN Auth v3 sends an invalid SYN+ACK (with wrong ACK number) as a challenge. If a firewall in the path drops this invalid SYN+ACK, the client never receives the challenge and cannot complete authentication, making it appear the server is not responding.
   - 方案: If a firewall in the network path is dropping the invalid SYN+ACK challenge, consider switching to SYN Auth v1 (uses RST) or v2 (uses invalid ACK) to check compatibility. Alternatively, configure the firewall to allow the challenge SYN+ACK packets. Note: SYN Auth v3 allows the source IP for 5 minutes, refreshed by subsequent packets.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DDoS%20Protection%2FTCP%20SYN%20auth%20versions%20and%20behaviors)`

3. **Azure Firewall or NVA triggers DDoS mitigation during business hours; traffic analysis shows DDoS is triggered by outbou**
   - 根因: Azure Firewall or NVA generates high outbound TCP from a single IP address (e.g., connecting back to on-premises or internet at business start). This single-IP outbound volume triggers the DDoS TCP threshold. Indicators: source ports are well-known (443, etc.), source IPs are Microsoft Online/AAD IPs, destination ports are random, top DDoS device action is 'Packet was forwarded to the service'.
   - 方案: 1. Customer-side (preferred): Deploy multiple outbound IP addresses to distribute traffic. Note: architecture changes require CSA/ACE/Field team engagement. 2. Microsoft-side: Create ICM with strong business justification to request DDoS team lift the threshold for the specific IP. This is per-IP, case-by-case. Note: limits cannot be increased above 2M pps (TCP), 200k pps (UDP), 100k pps (TCP-SYN). Do not share internal limits with customer.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DDoS%20Protection%2FTSG%3A%20DDoS%20Attack%20Post-Mortem)`

4. **Customer using DDoS Network Protection plan receives DDoS Mitigation alerts for a Public IP address that does not belong**
   - 根因: DDoS Network Protection plan protects all public IPs in the VNet including pseudo-random VIPs automatically assigned to subnets with defaultOutboundAccess set to true. These are platform-managed IPs the customer may not be aware of. Alerts for these IPs are expected by design — confirmed by Cloudnet DDoS DRI.
   - 方案: 1) Ask customer for the timestamp and alerted IP. 2) Verify in DDoS Dashboard or DDoS Sflow whether mitigation triggered for that IP at that time. 3) Use Azure Resource Graph (ARG) query or Eagle Eye to confirm IP is not in customer subscription. 4) If confirmed as a pseudo-random VIP on a subnet with defaultOutboundAccess=true, explain this is expected behavior — DDoS Network Protection covers all VIPs including platform pseudo-random ones.
   `[结论: 🟢 7.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20DDoS%20Protection/DDoS%20Network%20Protection%20Alerts%20for%20pseudo%20random%20VIP)`

### Phase 2: 其他
> 来源: ado-wiki

1. **Customer's public IPs attached to outbound rules on Standard Load Balancer are being billed for DDoS Standard overage ch**
   - 根因: All public IPs visible in a VNET that has DDoS Standard enabled are automatically enrolled for DDoS protection (and billed for overage), regardless of whether they accept inbound traffic. There is no customer-facing API to exclude individual IPs from protection.
   - 方案: If the outbound-only IPs have no port open to accept internet traffic: (1) Request an IcM ticket to manually exclude those IPs from DDoS protection on a batch cadence. (2) Alternatively, move those public IPs to a different VNET that does not have DDoS Standard enabled. IP exclusion configuration via API is in the backlog but de-prioritized.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DDoS%20Protection%2FOutbound%20PIP%20Billing%20Clarifications)`

2. **Customer unable to delete DDoS protection plan; delete operation fails or hangs in Portal/PowerShell**
   - 根因: Azure Policy assigned to the subscription is blocking VNet from being unlinked from the DDoS plan, preventing plan deletion
   - 方案: 1) Check Azure Policy under Subscription > Policy > Policy Assignments; remove or disable blocking policies. 2) Verify VNets are detached from DDoS plan (check ASC and NRP via Jarvis: NRP > NRP Subscription Operations > Get NRP Subscription Details). 3) Retry deletion using PowerShell: Remove-AzDdosProtectionPlan
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DDoS%20Protection%2FTSG%20unable%20to%20delete%20DDos)`

3. **Unable to delete DDoS protection plan; associated VNets are stuck in a failed provisioning state**
   - 根因: VNets attached to the DDoS plan are in failed ProvisioningState, which blocks DDoS plan deletion operations
   - 方案: Perform a GET/SET operation on each failed VNet to trigger self-heal: Get-AzVirtualNetwork -Name <vnet-name> -ResourceGroupName <rg> | Set-AzVirtualNetwork. Then retry DDoS plan deletion. Also verify VNet provisioning state via NRP logs in Jarvis.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DDoS%20Protection%2FTSG%20unable%20to%20delete%20DDos)`

### Phase 3: 限制与容量
> 来源: ado-wiki + onenote

1. **Sharp traffic decrease on Azure public IP — customer sees sudden drop then recovery in inbound traffic**
   - 根因: Azure platform DDoS protection mechanism blocks traffic matching suspicious patterns: UDP protocol, multiple source IPs targeting single public IP, small packet size, very large volume (e.g. heartbeat packets from many clients)
   - 方案: 1) Contact 21V-WAPHYNET@oe.21vianet.com with public IP and time range to verify if protection was triggered. 2) If confirmed legitimate traffic, request rule disable (warns: IP will lose DDoS protection). 3) Long-term: customer should distribute traffic across multiple destination IPs.
   `[结论: 🟢 9.5/10 — onenote] [MCVKB/3.6[NET]How to Identify Traffic Decrease Caused by.md]`

2. **Customer is concerned that their Azure region (e.g., Australia Central) does not have enough DDoS mitigation capacity to**
   - 根因: Misunderstanding of Azure DDoS scrubbing architecture. DDoS Protection does not scrub traffic at the destination region. Instead, it intercepts and scrubs traffic at the edge of the Microsoft global WAN network — near the attacker origin, wherever attack traffic first enters Microsoft network. Regional capacity at the destination is not the limiting factor.
   - 方案: Explain that Azure DDoS Network Plan scrubs globally at the WAN edge (80+ Tbps capacity across ~65 regions). Traffic is mitigated near the attacker origin, not at the resource region. Exception: if an attack originates entirely from the same region as the protected resource, all attack traffic may enter Microsoft WAN in that same region.
   `[结论: 🔵 6.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20DDoS%20Protection/DDoS%20Protection%20Global%20Capacity%20Details)`

### Phase 4: 已知问题与限制
> 来源: ado-wiki

1. **Customer using Azure DDoS Network Protection receives no DDoS alerts in Microsoft Defender for Cloud (MDfC) despite the **
   - 根因: Azure DDoS Protection service stopped sending alert events to Microsoft Defender for Cloud. This can be confirmed via Jarvis ASCAlertMonitoring dashboard: if 'Asc Critical Errors' > 0 or 'Asc Alerts Count' remains 0 during known attack windows, the pipeline is broken. Root cause requires DDoS PG investigation.
   - 方案: 1. Confirm VIP is under mitigation via Log Sources for DDoS Standard dashboard (is_under_mitigation = 1). 2. Check Jarvis Dashboard: CNS > DDoSMonitoring > ASCAlertMonitoring — input the public IP in Overrides. Look for Asc Critical Errors > 0 or Asc Alerts Count = 0. 3. If pipeline is broken, engage TA/SME via AVA post in the DDoS channel and get approval prior to creating a CRI to DDoS PG. Internal Kusto (Rome cluster, SecurityAlerts table) can be used by Azure Security Team to confirm last alert delivery timestamp.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DDoS%20Protection%2FTSG%3A%20Lack%20of%20Alerts%20in%20Microsoft%20Defender%20for%20Cloud%20%28MDfC%29%20despite%20under%20mitigation%20state)`

2. **Customer observes massive inbound traffic from Microsoft AFD IP range (e.g., 204.79.197.0/24, specifically 204.79.197.21**
   - 根因: Not a DDoS attack. The customer VMs initiated downloads from Microsoft CDN (e.g., download.microsoft.com hosted by Azure Front Door), which returns traffic to the VM from AFD IPs. Azure DDoS exempts AFD IPs from scrubbing by design — AFD traffic bypasses DDoS scrubbing devices, explaining why these IPs do not appear in mitigation flow logs.
   - 方案: 1) Explain this is expected behavior and not an attack. 2) Identify customer VM connections to download.microsoft.com or similar CDN URLs. 3) In mitigation flow logs, source port 443 with message 'Packet was forwarded to the service' confirms legitimate traffic. 4) DDoS mitigation triggers per-router based on individual traffic volume — check per-router-pair values in DDoS NetFlow dashboard rather than aggregate view.
   `[结论: 🟢 7.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20DDoS%20Protection/DDOS%20Attack%20from%20Microsoft%20AFD%20IP)`

### Phase 5: 权限与认证
> 来源: ado-wiki

1. **TCP connection failures during DDoS mitigation with SYN Auth v1; connection is established and immediately reset, and th**
   - 根因: SYN Auth v1 uses a SYN-cookie mechanism: A10 sends RST after the 3-way handshake to close the authenticated session, then expects the client to retry with a new SYN. Game clients that do not implement TCP retry logic after receiving RST will not reconnect, resulting in connection failure.
   - 方案: Ensure clients implement TCP retry logic after receiving RST. For game clients that cannot retry, consider migrating to SYN Auth v2 or v3 which use invalid ACK/SYN+ACK challenges instead of RST, avoiding this issue.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DDoS%20Protection%2FTCP%20SYN%20auth%20versions%20and%20behaviors)`

### Phase 6: 配置问题
> 来源: ado-wiki

1. **Customer cannot link a VNet in one tenant (VNET subscription) to a DDoS Protection Plan in another tenant (DDoS subscrip**
   - 根因: Cross-tenant VNet-to-DDoS-Plan linking is not supported via Portal, CLI, or PowerShell management tools. Only REST API supports this configuration, requiring Azure Lighthouse to establish delegated access between tenants.
   - 方案: 1) Onboard VNET subscription as Service Provider in Azure Lighthouse (VNET subscription portal -> My Customers -> Create ARM template with Network Contributor permission -> download template). 2) In DDoS subscription: Service Providers -> Add Offer via template. 3) Get VNet config via REST API and append enableDdosProtection:true and ddosProtectionPlan.id to body. 4) In PowerShell on DDoS tenant: Login-AzAccount, Set-AzContext, Get-AzAccessToken. 5) Call VirtualNetworks/CreateOrUpdate REST API passing VNET-tenant token as x-ms-authorization-auxiliary: Bearer <token> header.
   `[结论: 🟢 7.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20DDoS%20Protection/Cross%20Tenant%20DDOS%20Support)`

## Kusto 查询模板

`[工具: Kusto skill — arg-publicip.md]`
→ 详见 `skills/kusto/networking/references/queries/arg-publicip.md`

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Sharp traffic decrease on Azure public IP — customer sees... | Azure platform DDoS protection mechanism blocks... | 1) Contact 21V-WAPHYNET@oe.21vianet.com with pu... | 🟢 9.5 | [MCVKB/3.6[NET]How to Identify Traffic Decrease Caused by.md] |
| 2 | Customer's public IPs attached to outbound rules on Stand... | All public IPs visible in a VNET that has DDoS ... | If the outbound-only IPs have no port open to a... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DDoS%20Protection%2FOutbound%20PIP%20Billing%20Clarifications) |
| 3 | TCP connection failures during DDoS mitigation with SYN A... | SYN Auth v1 uses a SYN-cookie mechanism: A10 se... | Ensure clients implement TCP retry logic after ... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DDoS%20Protection%2FTCP%20SYN%20auth%20versions%20and%20behaviors) |
| 4 | TCP connections appear to hang (server not responding) du... | SYN Auth v2 sends an invalid ACK (with wrong AC... | If a firewall in the network path is dropping t... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DDoS%20Protection%2FTCP%20SYN%20auth%20versions%20and%20behaviors) |
| 5 | TCP connections appear to hang (server not responding) du... | SYN Auth v3 sends an invalid SYN+ACK (with wron... | If a firewall in the network path is dropping t... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DDoS%20Protection%2FTCP%20SYN%20auth%20versions%20and%20behaviors) |
| 6 | Customer using Azure DDoS Network Protection receives no ... | Azure DDoS Protection service stopped sending a... | 1. Confirm VIP is under mitigation via Log Sour... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DDoS%20Protection%2FTSG%3A%20Lack%20of%20Alerts%20in%20Microsoft%20Defender%20for%20Cloud%20%28MDfC%29%20despite%20under%20mitigation%20state) |
| 7 | Azure Firewall or NVA triggers DDoS mitigation during bus... | Azure Firewall or NVA generates high outbound T... | 1. Customer-side (preferred): Deploy multiple o... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DDoS%20Protection%2FTSG%3A%20DDoS%20Attack%20Post-Mortem) |
| 8 | Customer unable to delete DDoS protection plan; delete op... | Azure Policy assigned to the subscription is bl... | 1) Check Azure Policy under Subscription > Poli... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DDoS%20Protection%2FTSG%20unable%20to%20delete%20DDos) |
| 9 | Unable to delete DDoS protection plan; associated VNets a... | VNets attached to the DDoS plan are in failed P... | Perform a GET/SET operation on each failed VNet... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DDoS%20Protection%2FTSG%20unable%20to%20delete%20DDos) |
| 10 | Customer cannot link a VNet in one tenant (VNET subscript... | Cross-tenant VNet-to-DDoS-Plan linking is not s... | 1) Onboard VNET subscription as Service Provide... | 🟢 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20DDoS%20Protection/Cross%20Tenant%20DDOS%20Support) |
| 11 | Customer observes massive inbound traffic from Microsoft ... | Not a DDoS attack. The customer VMs initiated d... | 1) Explain this is expected behavior and not an... | 🟢 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20DDoS%20Protection/DDOS%20Attack%20from%20Microsoft%20AFD%20IP) |
| 12 | Customer using DDoS Network Protection plan receives DDoS... | DDoS Network Protection plan protects all publi... | 1) Ask customer for the timestamp and alerted I... | 🟢 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20DDoS%20Protection/DDoS%20Network%20Protection%20Alerts%20for%20pseudo%20random%20VIP) |
| 13 | Customer is concerned that their Azure region (e.g., Aust... | Misunderstanding of Azure DDoS scrubbing archit... | Explain that Azure DDoS Network Plan scrubs glo... | 🔵 6.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20DDoS%20Protection/DDoS%20Protection%20Global%20Capacity%20Details) |
