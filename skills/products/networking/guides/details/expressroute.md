# Networking ExpressRoute — 综合排查指南

**条目数**: 39 | **草稿融合数**: 27 | **Kusto 查询融合**: 3
**来源草稿**: [ado-wiki-a-dns-packetdata-parser-chrome.md], [ado-wiki-a-dns-private-resolver-faq.md], [ado-wiki-a-er-approved-customers-basicipextension.md], [ado-wiki-a-er-bgp-flapping-troubleshoot.md], [ado-wiki-a-er-datapath-msee-gwt.md], [ado-wiki-a-er-msee-light-levels.md], [ado-wiki-a-er-ops-engagement-guide.md], [ado-wiki-a-private-resolver-scenarios.md], [ado-wiki-a-private-resolver-user-experience.md], [ado-wiki-a-wildcard-hostname-listener-ps.md]...
**Kusto 引用**: [er-circuit.md], [er-gateway.md], [server-tor.md]
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: 网络与路由
> 来源: mslearn + ado-wiki + onenote

1. **BFD (Bidirectional Forwarding Detection) not working on ExpressRoute private peering for older circuits**
   - 根因: BFD over private peering is only enabled by default on MSEE side for ExpressRoute circuits created after August 1, 2018. Older circuits do not have BFD configured.
   - 方案: For older circuits: disable the peering and re-enable it to activate BFD on MSEE side. Customer also needs to enable and configure BFD on their PE router. Note: disabling peering will shut down BGP session and cause connectivity loss during the change.
   `[结论: 🟢 9.5/10 — onenote] [MCVKB/2.5[NET] BFD over ER private peer & peering Reset.md]`

2. **Customer continues to be billed for an ExpressRoute circuit that was deleted; circuit is no longer visible in the Azure **
   - 根因: ExpressRoute circuit record persists in billing system (CircuitTable in hybridnetworking Kusto) even after removal from NRP, creating a billing/resource discrepancy that requires manual CRI to resolve
   - 方案: 1) Query CircuitTable by AzureSubscriptionId to find circuit details; 2) Validate circuit does not exist in NRP via ARG Kusto query (Resources table) or ASC resource browser; 3) Once confirmed missing from NRP but present in CircuitTable, engage TA to approve CRI to ExpressRoute billing team
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FAdvanced%20Troubleshooting%2FBilling%20Support%3A%20Find%20Missing%20ExpressRoute%20Links)`

3. **On-premises advertised routes fail to install in ExpressRoute MSEE (Cisco) routing table — route appears in BGP but not **
   - 根因: VRF Route Limit exceeded on the Cisco MSEE. The total number of routes in the VRF (e.g., 5850 routes, many from ExpressRoute Direct as 'static') exceeds the per-VRF route limit. This limit is distinct from the Azure subscription route advertisement limits (4000 for Standard, 10000 for Premium SKU).
   - 方案: 1) Confirm via Jarvis: run 'show bgp vpnv4 unicast vrf <vrf-name> rib-failure' — look for 'Route limit' cause. 2) Run 'show ip route vrf <vrf-name> summary' to see total route count and breakdown by source (static/bgp/connected). 3) Work with PG/EROps to reduce static routes in the VRF (especially ExR Direct static routes) to bring total below limit.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FAdvanced%20Troubleshooting%2FTroubleshoot%20MSEE%28Cisco%29%20failed%20to%20install%20On-Premises%20routes%20to%20routing%20table%20due%20to%20VRF%20Route%20Limit)`

4. **VMs not getting ExpressRoute/VPN gateway routes; NMAgent error 0x803D0006 (adjacency query timeout); VNG effective route**
   - 根因: User Defined Route (UDR) configured on the GatewaySubnet. UDRs are not supported on ExR gateway subnets — ExR must use BGP for custom routes. The UDR creates an invalid route (e.g., 10.0.0.0/8) that blocks NMAgent communication.
   - 方案: Remove the UDR from the GatewaySubnet. Per Azure documentation, you cannot specify an ExR-type VNG in a UDR — use BGP instead. After removal, VMs should start receiving correct routes in Effective Routes.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FAdvanced%20Troubleshooting%2FVirtual%20Machine%20Not%20Getting%20Virtual%20Network%20Gateway%20Routes)`

5. **ExpressRoute Gateway performance degraded — high latency, throughput issues, slow failover; ASC shows 'High CPU' insight**
   - 根因: ExpressRoute Gateway CPU utilization exceeds 70% for more than 1/3 of the time in the last 2 days. Current gateway SKU cannot support the workload.
   - 方案: Review current gateway SKU throughput limits and consider upgrading to a higher SKU. The ASC insight 'ExpressRoute Gateway CPU Utilization is High' provides the alert baseline.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FExpressRoute%20ASC%20Insights)`

6. **ExpressRoute Gateway fails to connect to ExpressRoute Circuit — authorization error; ASC shows 'Wrong Authorization Key'**
   - 根因: The customer attempted to associate an ExpressRoute Gateway with a Circuit but failed because the user is not authorized to use the circuit's authorization key.
   - 方案: Regenerate or validate the authorization key from the circuit owner's subscription. Ensure the correct authorization key is used when creating the gateway connection. The circuit owner must provide a valid key to the gateway VNet owner.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FExpressRoute%20ASC%20Insights)`

7. **Customer cannot delete ExpressRoute circuit — delete operation fails; ASC shows 'Cannot Delete Circuit Because Peering I**
   - 根因: ExpressRoute circuit still has active virtual network connections (VNet links) associated with it. Azure requires all connections to be deleted before the circuit can be deleted.
   - 方案: List and delete all virtual network connections linked to the ExpressRoute circuit before attempting to delete the circuit itself. Navigate to circuit → Connections blade → delete each connection.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FExpressRoute%20ASC%20Insights)`

8. **Connectivity loss across ExpressRoute — traffic destined for specific prefixes is dropped or routed incorrectly; ASC sho**
   - 根因: ExpressRoute circuit has overlapping routes/prefixes advertised between on-premises and different VNets. Traffic for overlapping prefixes is sent to multiple destinations causing connectivity loss.
   - 方案: Identify the overlapping prefixes from the ASC Overlapping Routes insight. Work with customer to ensure that route advertisements from on-premises and VNet address spaces do not overlap. Adjust BGP route filters or VNet address spaces to eliminate the overlap.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FExpressRoute%20ASC%20Insights)`

9. **ExpressRoute Gateway CSES-to-VMSS migration fails with error ERGWMigrationIPInGREConnectionError**
   - 根因: Gateway was created before 2017 and uses legacy IPinGRE mode for ExpressRoute connections
   - 方案: Delete all connections to the gateway and recreate them before proceeding with migration. Refer to the migration documentation for the recreation process.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FAdvanced%20Troubleshooting%2FExpressRoute%20CSES%20to%20VMSS%20Gateway%20Migration)`

10. **ExpressRoute Gateway CSES-to-VMSS migration fails with error: virtual network does not have enough space for another gat**
   - 根因: GatewaySubnet size is smaller than /28, insufficient for deploying the new gateway in parallel during migration (migration requires two gateways simultaneously)
   - 方案: Add more address prefixes to the GatewaySubnet to ensure it is at least /28 size before retrying migration.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FAdvanced%20Troubleshooting%2FExpressRoute%20CSES%20to%20VMSS%20Gateway%20Migration)`

11. **ExpressRoute Gateway CSES-to-VMSS migration validation fails or migration step results in error; resources stuck in erro**
   - 根因: Gateway or connected resources (circuits, connections, Public IP, VNet/GatewaySubnet) are in a Failed provisioning state
   - 方案: Perform GET and SET on failed resources per https://learn.microsoft.com/en-us/azure/networking/troubleshoot-failed-state. Ensure all resources are in Succeeded state before retrying. Avoid running concurrent changes on related resources during migration. For Prepare step failures: delete newly created resources and retry. For Migrate step failures: try reverting traffic to old gateway and retry.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FAdvanced%20Troubleshooting%2FExpressRoute%20CSES%20to%20VMSS%20Gateway%20Migration)`

12. **VMs in spoke virtual networks cannot communicate with each other through a hub VNet with ExpressRoute gateway (spoke-A →**
   - 根因: Gateway transit between spoke virtual networks is not supported for ExpressRoute Gateway by design. ERGW is designed for inbound traffic only and does not program spoke-B reachability into spoke-A routing tables.
   - 方案: Deploy an NVA (Network Virtual Appliance) in the hub VNet to route traffic between spoke VNets. Alternatively, on-premises can advertise a supernet covering both spoke address spaces (workaround: on-prem advertises larger prefix back). Public docs: https://docs.microsoft.com/en-us/azure/expressroute/virtual-network-connectivity-guidance
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FAdvanced%20Troubleshooting%2FGateway%20Transit%20Between%20Spoke%20Virtual%20Networks%20using%20ExpressRoute%20Gateway%20Not%20Supported)`

13. **BGP routes on ExpressRoute circuit continuously flapping; routes appear and disappear from MSEE routing table; high CPU **
   - 根因: Customer is re-advertising routes learned from Azure ExpressRoute back to Azure, creating a routing loop: Azure advertises → customer re-advertises back → Azure stops advertising (now learned from customer) → customer stops → Azure re-advertises → loop repeats
   - 方案: Identify using 'show ip bgp vpnv4 vrf <vrf#>' on MSEE via Jarvis Actions > Brooklyn > ExR Diagnostic Operations. Look for prefixes with 'e' (external) marker that are Azure-originated routes learned back from customer. Customer must update their route policy to not re-advertise Azure-learned routes back to Azure.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FAdvanced%20Troubleshooting%2FMSEE%20Commands%20By%20Device%2FCisco%20MSEE%20Commands)`

14. **VMs in Azure VNet not learning certain on-premises routes via ExpressRoute; route is visible in Dump Routing on MSEE but**
   - 根因: Customer configured 'No-Export' BGP community on their PE device for specific prefixes. This prevents the MSEE from advertising those routes to eBGP peers upstream (ExR Gateway). Routes with No-Export community stay within the local AS and are not forwarded.
   - 方案: 1. Confirm route appears in Dump Routing. 2. Run 'Get Routes Learned By A Gateway' via Jarvis (Brooklyn > Troubleshooting Operations) — if route absent, proceed. 3. Run 'bgp vrf {vrf} vpnv4 uni {address}' on MSEE via Jarvis (Brooklyn > ExR Diagnostic Operations > Run Any Read Only Command) — check for No-Export community in output. 4. Customer must remove the No-Export BGP community configuration from their PE device.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FAdvanced%20Troubleshooting%2FMSEE%20does%20not%20send%20Advertised%20Address%20Spaces%20upstream%20to%20ExR%20Gateway)`

15. **ExpressRoute Gateway drops BGP routes advertised by on-premises; specific on-prem prefixes not appearing in VM effective**
   - 根因: Azure ExR Gateway enforces 'DropLocalSubnets' policy: routes more specific than or overlapping with local VNet/peered VNet address space are dropped. Example: on-prem advertises 10.0.0.0/24 while connected VNet uses 10.0.0.0/16.
   - 方案: Check Kusto GatewayTenantLogsTable for 'DropLocalSubnets' + 'BGP' messages using the GatewayId. Query: cluster('Hybridnetworking').database('aznwmds').GatewayTenantLogsTable | where GatewayId contains 'xxx' | where Message contains 'DropLocalSubnets' | where Message contains 'BGP'. Customer must adjust on-prem routing to not advertise prefixes more specific than connected VNet address spaces. Ref: https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-udr-overview
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FAdvanced%20Troubleshooting%2FMSEE%20does%20not%20send%20Advertised%20Address%20Spaces%20upstream%20to%20ExR%20Gateway)`

16. **ExpressRoute Private Peering DSCP QoS values are reset to 0 when packets hit the MSEEs - customer configured DSCP markin**
   - 根因: Azure ExpressRoute Private Peering circuits do not support QoS queues. DSCP values configured on the customer/provider side get reset to 0 at the MSEEs. Only Microsoft Peering supports QoS.
   - 方案: Inform customer that QoS queues for Private Peering are not supported. DSCP values will be reset to 0 on Private Peering. QoS is only supported on Microsoft Peering.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20ExpressRoute/Features%20and%20Functions/ExR%20Bursting%20Capabilities%20%26%20Considerations)`

17. **Customer attempts to use Layer-3 router redundancy protocols (GLBP, HSRP, or VRRP) with ExpressRoute circuits but they a**
   - 根因: Azure ExpressRoute does not support Layer-3 redundancy protocols such as GLBP, HSRP, or VRRP on the MSEE side.
   - 方案: Inform customer that Layer-3 protocols (GLBP, HSRP, VRRP) are not supported with ExpressRoute. Use ECMP with dual Active/Active CE/PE links and BGP for redundancy instead.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20ExpressRoute/Features%20and%20Functions/ExR%20Bursting%20Capabilities%20%26%20Considerations)`

18. **ExpressRoute Gateway selects sub-optimal path when different weight values are applied to connections with Global Reach **
   - 根因: When different weight values are applied to ExpressRoute connections, weight attribute has highest BGP priority, overriding the AS_PATH prepend mechanism (community 12076:12077) used by Global Reach for best path selection. This causes ERGW to prefer the transit (longer) path through Global Reach.
   - 方案: Do not apply different weight values to ExpressRoute connections when Global Reach is enabled between circuits connected to the same gateway. ERGW uses AS_PATH prepend (community 12076:12077) for best path selection with Global Reach - weight overrides this mechanism.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20ExpressRoute/Features%20and%20Functions/Express%20Route%20Global%20Reach%20Advance)`

19. **On-premises network connected to ExpressRoute circuit X cannot reach on-premises network connected to circuit Z, even th**
   - 根因: MSEEs use iBGP between Global Reach connected circuits. BGP rule prevents routes learned from iBGP neighbors from being re-advertised to other iBGP neighbors, blocking transitive routing through intermediate circuits.
   - 方案: Enable Global Reach directly between circuit X and circuit Z. ExpressRoute Global Reach does not support transitive routing - each pair of on-premises networks must have their corresponding circuits explicitly connected via Global Reach.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20ExpressRoute/Features%20and%20Functions/Express%20Route%20Global%20Reach%20Advance)`

20. **ExpressRoute Gateway creation fails with error: ExpressRoute Gateway customers will no longer need to create a Public IP**
   - 根因: New ExpressRoute Gateway deployment model auto-creates and manages public IPs in Gateway Tenant subscriptions with zone-redundant configuration. Old commands that manually create/associate public IPs are no longer supported for new or upgraded gateways.
   - 方案: Use updated PowerShell/CLI commands that do not specify a public IP address. The gateway will auto-create a zone-redundant public IP. The public endpoint is now hidden from the end user.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20ExpressRoute/Features%20and%20Functions/ExpressRoute%20Auto-assigned%20Public%20IP)`

21. **Spoke VNet address ranges are not advertised to on-premises via ExpressRoute BGP routing table when using hub-spoke topo**
   - 根因: VNet peering does not provide transitive routing properties. Spoke VNet addresses peered to a hub VNet are not automatically advertised via BGP to on-premises through ExpressRoute, even if the hub/infra VNet with the ExpressRoute gateway is correctly peered.
   - 方案: Option 1: Peer spokes directly to the infra VNet with ExpressRoute gateway. Option 2: Enable forwarded packets on all VNets, create static routes on the VPN for spoke subnets using the Infra GW BGP address as next hop, and add corresponding firewall/ACL rules. Ensure VNet Peering has Use remote gateway and Allow gateway transit flags enabled.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20ExpressRoute/Features%20and%20Functions/ExpressRoute%20BGP%20Route%20Advertising%20and%20VNet%20Peering%20(Transitive%20Limitations))`

22. **Customer asks about BGP graceful restart support with ExpressRoute BFD - wants to maintain forwarding during BGP session**
   - 根因: BGP graceful restart is not supported on ExpressRoute and is not on the product roadmap.
   - 方案: Inform customer that BGP graceful restart is not supported with ExpressRoute. This is a known limitation with no current plans for implementation. Use BFD for fast failure detection and ECMP for redundancy.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20ExpressRoute/Features%20and%20Functions/ExpressRoute%20Bidirectional%20Forwarding%20Detection%20(BFD))`

23. **ExpressRoute gateway migration fails at Validate stage - GatewaySubnet too small for deploying second gateway**
   - 根因: Virtual network GatewaySubnet does not have sufficient address space to deploy another gateway during migration.
   - 方案: Delete and recreate the GatewaySubnet as /27 or shorter prefix (e.g., /26 or /25) before initiating migration.
   `[结论: 🔵 6.0/10 — mslearn] [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/expressroute/gateway-migration-error-messaging)`

24. **ExpressRoute circuit stuck in failed provisioning state after an operation does not complete successfully**
   - 根因: An Azure operation on the ExpressRoute circuit did not complete, leaving the circuit resource in a failed state.
   - 方案: Reset the circuit: in Azure portal, open the circuit and click Refresh; or via PowerShell: $ckt = Get-AzExpressRouteCircuit -Name '<name>' -ResourceGroupName '<rg>'; Set-AzExpressRouteCircuit -ExpressRouteCircuit $ckt. If still failed, open a Microsoft support ticket.
   `[结论: 🔵 6.0/10 — mslearn] [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/expressroute/reset-circuit)`

25. **ExpressRoute ARP table shows on-premises MAC address as Incomplete or on-premises entry is missing entirely**
   - 根因: Layer 2 connectivity problem on the on-premises or connectivity provider side — the on-premises router is not responding to ARP requests from the MSEE.
   - 方案: 1) Verify the first IP of the /30 subnet is used on MSEE-PR interface (Azure uses the second IP for MSEE). 2) Check customer (C-Tag) and service (S-Tag) VLAN tags match on both MSEE-PR and MSEE pair. 3) Open a support request with your connectivity provider.
   `[结论: 🔵 6.0/10 — mslearn] [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/expressroute/expressroute-troubleshooting-arp-resource-manager)`

### Phase 2: 其他
> 来源: mslearn + ado-wiki

1. **ExpressRoute Microsoft Peering shows `AdvertisedPublicPrefixesState: ValidationNeeded`; customer believes prefixes shoul**
   - 根因: Prefix auto-validation fails because the prefix/ASN is not correctly registered in the Regional Internet Registry (RIR); WHOIS query to the RIR (e.g., riswhois.ripe.net) returns no entries, so GWM cannot validate automatically
   - 方案: 1) Get correlation ID from NRP QosEtwEvent (PutExpressRouteBgpPeeringOperation); 2) Query AsyncWorkerLogsTable for 'Validating Prefixes' messages to identify which prefix failed; 3) Run WHOIS against relevant RIR: `whois -h riswhois.ripe.net -q <prefix>`; 4) If no entries, customer must update their RIR registration; 5) Proceed with manual ASN/prefix validation process in parallel
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FAdvanced%20Troubleshooting%2FDebugging%20Microsoft%20Peering%20Auto%20Validation)`

2. **Engineer tries to use NetVMA for ExpressRoute troubleshooting but the tool is unavailable or deprecated**
   - 根因: NetVMA is being phased out by the Azure PG.
   - 方案: Use EagleEye instead: https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/1434477/EagleEye — EagleEye provides equivalent and improved functionality for ExpressRoute troubleshooting scenarios.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FAdvanced%20Troubleshooting%2FTroubleshooting%20ExR%20Using%20NetVMA)`

3. **ExpressRoute or ExpressRoute Direct physical connectivity failure — circuit cannot establish or intermittent physical dr**
   - 根因: MSEE port optic Tx/Rx light levels outside acceptable range.
   - 方案: Check light levels: Cisco acceptable range 0 to -10 dBm; Juniper acceptable range 5 to -5 dBm. For ExR Direct: check via ASC → Jarvis Dashboard link. For ExR/ExR Direct manually: find interface from ASC VRF section or DumpCircuitInfo, then run Jarvis ACIS command (Cisco: 'show hw-module subslot {x}/{y} transceiver {z} status'; Juniper: 'show interfaces diagnostics optics {interface}'). If out of range: engage TA in ExpressRoute Teams channel with all details and Jarvis action links.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FAdvanced%20Troubleshooting%2FValidate%20MSEE%20Light%20Levels%20Within%20Optimal%20Range)`

4. **Gateway SKU Migration blade is not visible in Azure portal for a previously migrated ExpressRoute gateway that needs re-**
   - 根因: When gateways are migrated, a tag CreatedBy:GatewaySKUMigration is added. Gateways with this tag will not display the Gateway SKU Migration blade in the portal.
   - 方案: Remove the CreatedBy:GatewaySKUMigration tag from the gateway resource to access the Gateway SKU Migration blade again. Re-running migration will also update the public IP to auto-assigned.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20ExpressRoute/Features%20and%20Functions/ExpressRoute%20Auto-assigned%20Public%20IP)`

5. **Bidirectional Forwarding Detection (BFD) is not enabled on ExpressRoute circuit despite being configured on customer edg**
   - 根因: BFD is only enabled by default on circuits created after August 1, 2018 (Private Peering) or January 10, 2020 (Microsoft Peering). Older circuits do not have BFD enabled automatically.
   - 方案: Reset the ExpressRoute circuit peerings to enable BFD. Follow: https://docs.microsoft.com/en-us/azure/expressroute/expressroute-howto-reset-peering. After reset, configure BFD on both primary and secondary CE/PE devices (interface + BGP session).
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20ExpressRoute/Features%20and%20Functions/ExpressRoute%20Bidirectional%20Forwarding%20Detection%20(BFD))`

6. **Azure Government ExpressRoute Microsoft Peering is configured but Office 365 (commercial) traffic fails; customer prefix**
   - 根因: Azure Government requires an extra whitelisting step with Azure Federal Networking team (FedNet) to propagate customer prefixes to public WAN for O365 access; by default, prefixes are not whitelisted in Azure Government even after ASN/prefix validation
   - 方案: 1) Validate ASN/prefixes per manual validation guide; 2) Check IPv4GsgoExpressRoutePartnerPrefixes list to confirm not yet whitelisted; 3) Engage FedNet via ASC IcM template or Federal Networking Team IcM Template (portal.microsofticm.com/imp/v3/incidents/create?tmpl=J2P1p1); 4) Process takes up to 5 business days; validate completion via WAN Edge (AS 8070=Fairfax, AS 8075=Public)
   `[结论: 🟢 7.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FAdvanced%20Troubleshooting%2FAzure%20Government%20ExpressRoute%20-%20Microsoft%20Peering)`

7. **ExpressRoute gateway migration blocked by legacy connections (pre-2017) or resources in failed state**
   - 根因: Legacy connection mode: connections created before 2017 are incompatible with migration. Failed state: gateway or connected resources not in Succeeded provisioning state.
   - 方案: For legacy connections: delete and recreate all connections before migration. For failed state: perform GET+SET on affected resources to restore Succeeded state. Default SKU must be upgraded to Standard; FastPath and route weight must not change during migration.
   `[结论: 🔵 6.0/10 — mslearn] [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/expressroute/gateway-migration-error-messaging)`

8. **ExpressRoute ARP table for a peering does not appear at all (empty or no output)**
   - 根因: Layer 2 connectivity issue on the Microsoft side — MSEE is not generating ARP entries for the peering.
   - 方案: Open a support ticket with Microsoft support specifying a layer 2 connectivity issue. Provide the output of Get-AzExpressRouteCircuitARPTable for both primary and secondary paths.
   `[结论: 🔵 6.0/10 — mslearn] [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/expressroute/expressroute-troubleshooting-arp-resource-manager)`

### Phase 3: 已知问题与限制
> 来源: ado-wiki

1. **Customer experiences unexpected bandwidth spike on ExpressRoute Microsoft Peering and cannot identify the source/destina**
   - 根因: N/A
   - 方案: Query IPFix data in NetCapPlan Kusto cluster using RealTimeIpfixWithMetadata table; filter by customer-advertised prefixes (from ASC Dump Routing) in SrcSubnet/DstSubnet; summarize by SrcIpAddress/DstIpAddress. Requires NetCapPlanKustoViewers access via IDWeb. Note: sampling rate is 1:4096 packets. Do NOT share query results with customer.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FAdvanced%20Troubleshooting%2FTop%20Talkers%20Microsoft%20Peering)`

2. **ExpressRoute Gateway CSES-to-VMSS migration fails with error ERGWMigrationServerConnectedCircuitError**
   - 根因: Gateway is connected to Baremetal/AVS circuit with dedicated HSM; migration is not supported when dedicated HSM is allocated
   - 方案: Deallocate the dedicated HSM before proceeding with gateway migration. Refer to Microsoft documentation for HSM deallocation steps.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FAdvanced%20Troubleshooting%2FExpressRoute%20CSES%20to%20VMSS%20Gateway%20Migration)`

### Phase 4: 证书与密钥
> 来源: ado-wiki

1. **VMs not getting ExpressRoute/VPN gateway routes in Effective Routes despite 'Propagate gateway routes' being enabled; VN**
   - 根因: Private DNS zone for blob.core.windows.net (or similar storage endpoint) is linked to the GW VNet, intercepting DNS queries from the VNG and causing certificate validation to fail. The ER GW requires unimpeded access to 168.63.129.16 for DNS resolution.
   - 方案: Remove the VNet link from the private DNS zone for the VNet containing the gateway. Ensure a DNS forwarder pointing to 168.63.129.16 (Azure DNS) is configured if custom DNS is in use.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FAdvanced%20Troubleshooting%2FVirtual%20Machine%20Not%20Getting%20Virtual%20Network%20Gateway%20Routes)`

### Phase 5: DNS 解析
> 来源: ado-wiki

1. **VMs not getting ExpressRoute/VPN gateway routes; NMAgent error 0x803d0005; connectivity issues between hosts and on-prem**
   - 根因: Private DNS resolver DNS Forwarding Ruleset linked to the GW VNet contains a wildcard forwarding rule that redirects DNS queries (including VNG's queries to 168.63.129.16) to an external or non-existent DNS server.
   - 方案: Remove the VNet link from the DNS resolver forwarding ruleset for the VNet containing the gateway. Use ARG Kusto queries to find DNS resolvers and forwarding rulesets referencing the affected VNet/resolver.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FAdvanced%20Troubleshooting%2FVirtual%20Machine%20Not%20Getting%20Virtual%20Network%20Gateway%20Routes)`

### Phase 6: 配置问题
> 来源: ado-wiki

1. **ARP resolution failure (Incomplete ARP) between MSEE and PE/CE; no Layer 2 connectivity on ExpressRoute circuit; Dump Ro**
   - 根因: Wrong STAG or CTAG VLAN configuration; failure in telco equipment between MSEE and PE/CE; other misconfiguration on MSEE or PE/CE side
   - 方案: Compare STAG/CTAG configs with telco/customer. Ask telco to review circuit. Run 'Validate Device Configuration' from ACIS/Jarvis Actions. Check interface link status via Brooklyn > ExR Diagnostic Operation > Run Show Command for the interface.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FAdvanced%20Troubleshooting%2FExpressRoute%3A%20About%20Datapath%20between%20MSEE%20and%20PE%20%28Provider%20Edge%29)`

### Phase 7: 版本与兼容
> 来源: ado-wiki

1. **ExpressRoute circuit bandwidth upgrade fails with error: 'did not succeed due to insufficient capacity on existing physi**
   - 根因: The physical port pair hosting the circuit does not have sufficient remaining bandwidth to accommodate the requested bandwidth upgrade
   - 方案: Check port capacity via Jarvis Actions > Brooklyn > ExR Onboard Operations > List port pairs operation. Get PortPairId via Kusto (CircuitTable, filter by AzureServiceKey). Compare UsedBandwidth vs TotalAvailableBandwidth. Customer can also check via Azure Portal (Circuit > Configuration > Bandwidth) or REST API (Express Route Provider Ports Location - List). If insufficient capacity, customer must request a new port or work with provider per https://docs.microsoft.com/en-us/azure/expressroute/about-upgrade-circuit-bandwidth#considerations
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FAdvanced%20Troubleshooting%2FHow%20to%3A%20Check%20ExpressRoute%20Port%20Usage%20%28capacity%29)`

## Kusto 查询模板

`[工具: Kusto skill — er-circuit.md]`
→ 详见 `skills/kusto/networking/references/queries/er-circuit.md`

`[工具: Kusto skill — er-gateway.md]`
→ 详见 `skills/kusto/networking/references/queries/er-gateway.md`

`[工具: Kusto skill — server-tor.md]`
→ 详见 `skills/kusto/networking/references/queries/server-tor.md`

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | BFD (Bidirectional Forwarding Detection) not working on E... | BFD over private peering is only enabled by def... | For older circuits: disable the peering and re-... | 🟢 9.5 | [MCVKB/2.5[NET] BFD over ER private peer & peering Reset.md] |
| 2 | Customer continues to be billed for an ExpressRoute circu... | ExpressRoute circuit record persists in billing... | 1) Query CircuitTable by AzureSubscriptionId to... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FAdvanced%20Troubleshooting%2FBilling%20Support%3A%20Find%20Missing%20ExpressRoute%20Links) |
| 3 | ExpressRoute Microsoft Peering shows `AdvertisedPublicPre... | Prefix auto-validation fails because the prefix... | 1) Get correlation ID from NRP QosEtwEvent (Put... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FAdvanced%20Troubleshooting%2FDebugging%20Microsoft%20Peering%20Auto%20Validation) |
| 4 | Customer experiences unexpected bandwidth spike on Expres... |  | Query IPFix data in NetCapPlan Kusto cluster us... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FAdvanced%20Troubleshooting%2FTop%20Talkers%20Microsoft%20Peering) |
| 5 | On-premises advertised routes fail to install in ExpressR... | VRF Route Limit exceeded on the Cisco MSEE. The... | 1) Confirm via Jarvis: run 'show bgp vpnv4 unic... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FAdvanced%20Troubleshooting%2FTroubleshoot%20MSEE%28Cisco%29%20failed%20to%20install%20On-Premises%20routes%20to%20routing%20table%20due%20to%20VRF%20Route%20Limit) |
| 6 | Engineer tries to use NetVMA for ExpressRoute troubleshoo... | NetVMA is being phased out by the Azure PG. | Use EagleEye instead: https://supportability.vi... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FAdvanced%20Troubleshooting%2FTroubleshooting%20ExR%20Using%20NetVMA) |
| 7 | ExpressRoute or ExpressRoute Direct physical connectivity... | MSEE port optic Tx/Rx light levels outside acce... | Check light levels: Cisco acceptable range 0 to... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FAdvanced%20Troubleshooting%2FValidate%20MSEE%20Light%20Levels%20Within%20Optimal%20Range) |
| 8 | VMs not getting ExpressRoute/VPN gateway routes in Effect... | Private DNS zone for blob.core.windows.net (or ... | Remove the VNet link from the private DNS zone ... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FAdvanced%20Troubleshooting%2FVirtual%20Machine%20Not%20Getting%20Virtual%20Network%20Gateway%20Routes) |
| 9 | VMs not getting ExpressRoute/VPN gateway routes; NMAgent ... | User Defined Route (UDR) configured on the Gate... | Remove the UDR from the GatewaySubnet. Per Azur... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FAdvanced%20Troubleshooting%2FVirtual%20Machine%20Not%20Getting%20Virtual%20Network%20Gateway%20Routes) |
| 10 | VMs not getting ExpressRoute/VPN gateway routes; NMAgent ... | Private DNS resolver DNS Forwarding Ruleset lin... | Remove the VNet link from the DNS resolver forw... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FAdvanced%20Troubleshooting%2FVirtual%20Machine%20Not%20Getting%20Virtual%20Network%20Gateway%20Routes) |
| 11 | ExpressRoute Gateway performance degraded — high latency,... | ExpressRoute Gateway CPU utilization exceeds 70... | Review current gateway SKU throughput limits an... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FExpressRoute%20ASC%20Insights) |
| 12 | ExpressRoute Gateway fails to connect to ExpressRoute Cir... | The customer attempted to associate an ExpressR... | Regenerate or validate the authorization key fr... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FExpressRoute%20ASC%20Insights) |
| 13 | Customer cannot delete ExpressRoute circuit — delete oper... | ExpressRoute circuit still has active virtual n... | List and delete all virtual network connections... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FExpressRoute%20ASC%20Insights) |
| 14 | Connectivity loss across ExpressRoute — traffic destined ... | ExpressRoute circuit has overlapping routes/pre... | Identify the overlapping prefixes from the ASC ... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FExpressRoute%20ASC%20Insights) |
| 15 | ARP resolution failure (Incomplete ARP) between MSEE and ... | Wrong STAG or CTAG VLAN configuration; failure ... | Compare STAG/CTAG configs with telco/customer. ... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FAdvanced%20Troubleshooting%2FExpressRoute%3A%20About%20Datapath%20between%20MSEE%20and%20PE%20%28Provider%20Edge%29) |
| 16 | ExpressRoute Gateway CSES-to-VMSS migration fails with er... | Gateway is connected to Baremetal/AVS circuit w... | Deallocate the dedicated HSM before proceeding ... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FAdvanced%20Troubleshooting%2FExpressRoute%20CSES%20to%20VMSS%20Gateway%20Migration) |
| 17 | ExpressRoute Gateway CSES-to-VMSS migration fails with er... | Gateway was created before 2017 and uses legacy... | Delete all connections to the gateway and recre... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FAdvanced%20Troubleshooting%2FExpressRoute%20CSES%20to%20VMSS%20Gateway%20Migration) |
| 18 | ExpressRoute Gateway CSES-to-VMSS migration fails with er... | GatewaySubnet size is smaller than /28, insuffi... | Add more address prefixes to the GatewaySubnet ... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FAdvanced%20Troubleshooting%2FExpressRoute%20CSES%20to%20VMSS%20Gateway%20Migration) |
| 19 | ExpressRoute Gateway CSES-to-VMSS migration validation fa... | Gateway or connected resources (circuits, conne... | Perform GET and SET on failed resources per htt... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FAdvanced%20Troubleshooting%2FExpressRoute%20CSES%20to%20VMSS%20Gateway%20Migration) |
| 20 | VMs in spoke virtual networks cannot communicate with eac... | Gateway transit between spoke virtual networks ... | Deploy an NVA (Network Virtual Appliance) in th... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FAdvanced%20Troubleshooting%2FGateway%20Transit%20Between%20Spoke%20Virtual%20Networks%20using%20ExpressRoute%20Gateway%20Not%20Supported) |
| 21 | ExpressRoute circuit bandwidth upgrade fails with error: ... | The physical port pair hosting the circuit does... | Check port capacity via Jarvis Actions > Brookl... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FAdvanced%20Troubleshooting%2FHow%20to%3A%20Check%20ExpressRoute%20Port%20Usage%20%28capacity%29) |
| 22 | BGP routes on ExpressRoute circuit continuously flapping;... | Customer is re-advertising routes learned from ... | Identify using 'show ip bgp vpnv4 vrf <vrf#>' o... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FAdvanced%20Troubleshooting%2FMSEE%20Commands%20By%20Device%2FCisco%20MSEE%20Commands) |
| 23 | VMs in Azure VNet not learning certain on-premises routes... | Customer configured 'No-Export' BGP community o... | 1. Confirm route appears in Dump Routing. 2. Ru... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FAdvanced%20Troubleshooting%2FMSEE%20does%20not%20send%20Advertised%20Address%20Spaces%20upstream%20to%20ExR%20Gateway) |
| 24 | ExpressRoute Gateway drops BGP routes advertised by on-pr... | Azure ExR Gateway enforces 'DropLocalSubnets' p... | Check Kusto GatewayTenantLogsTable for 'DropLoc... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FAdvanced%20Troubleshooting%2FMSEE%20does%20not%20send%20Advertised%20Address%20Spaces%20upstream%20to%20ExR%20Gateway) |
| 25 | ExpressRoute Private Peering DSCP QoS values are reset to... | Azure ExpressRoute Private Peering circuits do ... | Inform customer that QoS queues for Private Pee... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20ExpressRoute/Features%20and%20Functions/ExR%20Bursting%20Capabilities%20%26%20Considerations) |
| 26 | Customer attempts to use Layer-3 router redundancy protoc... | Azure ExpressRoute does not support Layer-3 red... | Inform customer that Layer-3 protocols (GLBP, H... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20ExpressRoute/Features%20and%20Functions/ExR%20Bursting%20Capabilities%20%26%20Considerations) |
| 27 | ExpressRoute Gateway selects sub-optimal path when differ... | When different weight values are applied to Exp... | Do not apply different weight values to Express... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20ExpressRoute/Features%20and%20Functions/Express%20Route%20Global%20Reach%20Advance) |
| 28 | On-premises network connected to ExpressRoute circuit X c... | MSEEs use iBGP between Global Reach connected c... | Enable Global Reach directly between circuit X ... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20ExpressRoute/Features%20and%20Functions/Express%20Route%20Global%20Reach%20Advance) |
| 29 | ExpressRoute Gateway creation fails with error: ExpressRo... | New ExpressRoute Gateway deployment model auto-... | Use updated PowerShell/CLI commands that do not... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20ExpressRoute/Features%20and%20Functions/ExpressRoute%20Auto-assigned%20Public%20IP) |
| 30 | Gateway SKU Migration blade is not visible in Azure porta... | When gateways are migrated, a tag CreatedBy:Gat... | Remove the CreatedBy:GatewaySKUMigration tag fr... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20ExpressRoute/Features%20and%20Functions/ExpressRoute%20Auto-assigned%20Public%20IP) |
| 31 | Spoke VNet address ranges are not advertised to on-premis... | VNet peering does not provide transitive routin... | Option 1: Peer spokes directly to the infra VNe... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20ExpressRoute/Features%20and%20Functions/ExpressRoute%20BGP%20Route%20Advertising%20and%20VNet%20Peering%20(Transitive%20Limitations)) |
| 32 | Bidirectional Forwarding Detection (BFD) is not enabled o... | BFD is only enabled by default on circuits crea... | Reset the ExpressRoute circuit peerings to enab... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20ExpressRoute/Features%20and%20Functions/ExpressRoute%20Bidirectional%20Forwarding%20Detection%20(BFD)) |
| 33 | Customer asks about BGP graceful restart support with Exp... | BGP graceful restart is not supported on Expres... | Inform customer that BGP graceful restart is no... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20ExpressRoute/Features%20and%20Functions/ExpressRoute%20Bidirectional%20Forwarding%20Detection%20(BFD)) |
| 34 | Azure Government ExpressRoute Microsoft Peering is config... | Azure Government requires an extra whitelisting... | 1) Validate ASN/prefixes per manual validation ... | 🟢 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FAdvanced%20Troubleshooting%2FAzure%20Government%20ExpressRoute%20-%20Microsoft%20Peering) |
| 35 | ExpressRoute gateway migration fails at Validate stage - ... | Virtual network GatewaySubnet does not have suf... | Delete and recreate the GatewaySubnet as /27 or... | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/expressroute/gateway-migration-error-messaging) |
| 36 | ExpressRoute gateway migration blocked by legacy connecti... | Legacy connection mode: connections created bef... | For legacy connections: delete and recreate all... | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/expressroute/gateway-migration-error-messaging) |
| 37 | ExpressRoute circuit stuck in failed provisioning state a... | An Azure operation on the ExpressRoute circuit ... | Reset the circuit: in Azure portal, open the ci... | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/expressroute/reset-circuit) |
| 38 | ExpressRoute ARP table shows on-premises MAC address as I... | Layer 2 connectivity problem on the on-premises... | 1) Verify the first IP of the /30 subnet is use... | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/expressroute/expressroute-troubleshooting-arp-resource-manager) |
| 39 | ExpressRoute ARP table for a peering does not appear at a... | Layer 2 connectivity issue on the Microsoft sid... | Open a support ticket with Microsoft support sp... | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/expressroute/expressroute-troubleshooting-arp-resource-manager) |
