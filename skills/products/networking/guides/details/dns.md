# Networking Azure DNS 与 Private DNS — 综合排查指南

**条目数**: 59 | **草稿融合数**: 27 | **Kusto 查询融合**: 0
**来源草稿**: [ado-wiki-a-azure-dns-regional-accounts.md], [ado-wiki-a-determine-dns-zone-public-private.md], [ado-wiki-a-dns-resolution-appgw.md], [ado-wiki-a-dns-suffixes.md], [ado-wiki-a-dns-verification.md], [ado-wiki-a-lab02-private-dns.md], [ado-wiki-a-troubleshooting-missing-dns-records.md], [ado-wiki-a-tsg-check-dns-security-policy-linked-vnet.md], [ado-wiki-a-understanding-basic-dns-query-tools.md], [ado-wiki-a-windows-dns-role-setup.md]...
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: DNS 解析
> 来源: mslearn + ado-wiki + onenote

1. **DNS resolution failure when multiple VMs in the same VNet share the same hostname - nslookup returns wrong IP or NXDOMAI**
   - 根因: iDNS updates the A record to the IP of the last-started VM with that hostname. In-guest restart does NOT trigger DNS record update; only deallocate+start from portal updates the record. When the currently pointed VM is stopped, the record is deleted (NXDOMAIN) rather than failing over to another VM with the same hostname.
   - 方案: Avoid assigning the same hostname to multiple VMs in the same VNet. If duplicate hostnames exist: 1) DNS record always points to the last portal-started VM, 2) In-guest restart will not reclaim the record, 3) Stopping the VM deletes the record entirely.
   `[结论: 🟢 9.5/10 — onenote] [MCVKB/7.2[NET]How iDNS Manages The DNS Record when Multi.md]`

2. **DNS resolution failures from Azure VM - Cannot resolve host errors due to DNS forwarder throttling**
   - 根因: Azure DNS forwarder enforces per-VM limits: max 200 queries in-flight (sent to iDNS but no response yet) and 500 queries per second. When exceeded, queries are dropped by the InFlightFilter.
   - 方案: 1) Distribute DNS query load across more VMs. 2) Use custom DNS server - queries bypass node-level forwarder limits. 3) Diagnose via Jarvis: compare QueriesSentUdp vs QueriesDroppedByInFlightFilterUdp using Node ID and Container ID.
   `[结论: 🟢 9.5/10 — onenote] [MCVKB/7.3 How to Troubleshoot DNS Forwarder Related Issu.md]`

3. **Global Azure VMs or clients outside China cannot resolve Mooncake Traffic Manager domain (trafficmanager.cn) - returns N**
   - 根因: Traffic Manager geographic routing only maps CN region to endpoint. DNS queries from non-CN recursive DNS servers receive NODATA response per design.
   - 方案: 1) Add geographic mappings for other regions or use All (World) catch-all. 2) Traffic Manager uses recursive DNS server IP to determine region, not client IP. 3) Verify with China DNS server (e.g. 101.226.4.6) from global VM.
   `[结论: 🟢 9.5/10 — onenote] [MCVKB/6.1[NET]The global Azure VMs query the Mooncake tr.md]`

4. **Function App in ILB ASE cannot resolve domain name and shows Azure Functions Runtime is unreachable**
   - 根因: ILB ASE requires manual DNS configuration; Function App needs WEBSITE_DNS_SERVER app setting and CORS configuration to work in internal-only network
   - 方案: 1) Configure ILB ASE DNS per docs (docs.azure.cn/app-service/environment/create-ilb-ase#dns-configuration) 2) Add WEBSITE_DNS_SERVER app setting with DNS IP 3) Verify with nameresolver in Kudu 4) Add CORS entries: https://functions.ext.azure.cn and the ASE app URL. All testing must be done from inside the internal network
   `[结论: 🟢 9.5/10 — onenote] [MCVKB/6.2 How to make Function App work in ILB ASE.md]`

5. **Web App or Function App with VNET integration fails DNS resolution for private/custom DNS names after an Antares upgrade**
   - 根因: Antares version ANT 93+ removed the automatic DNS fallback to 168.63.129.16 when WEBSITE_VNET_ROUTE_ALL=1 is configured. Previously the app would fall back to public Azure DNS (168.63.129.16) if custom DNS or Private DNS zone failed to resolve; this fallback was removed intentionally by the WebApp PG.
   - 方案: 1) Add app setting WEBSITE_ALWAYS_FALLBACK_TO_PUBLIC_DNS=1 to WebApp configuration to restore public DNS fallback behavior. 2) Or ensure the custom DNS server / Private DNS zone can fully resolve all required FQDNs. 3) Or remove WEBSITE_VNET_ROUTE_ALL=1 if not needed. Diagnostics: check Antares version via AppLens > 'Antares Version – Worker Details'; check DNS logs via Jarvis portal (https://portal.microsoftgeneva.com/458BB5CD) filtering by node IP from NetVMALink.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20Internal%20DNS%20%28VNET%29%2FChanges%20in%20Web%20app%20Custom%20DNS%20fallback%20mechanism)`

6. **Mac P2S VPN client cannot resolve Azure VM names using DNS suffixes; hostname resolution fails from Mac client even afte**
   - 根因: Known bug (ADO Bug 14039446): Azure VPN Mac client does not honor DNS suffixes configured in the XML client package, unlike Windows clients which correctly apply the suffixes
   - 方案: Workaround: Use full IP address or complete FQDN from Mac P2S clients instead of short hostnames. Monitor ADO Bug 14039446 (https://msazure.visualstudio.com/One/_workitems/edit/14039446) for a permanent fix. Windows clients are not affected and can use the XML suffix configuration normally.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20Internal%20DNS%20%28VNET%29%2FResolve%20VM%20names%20from%20Onprem%20P2S%20client%20using%20Azure%20AD%20authentication)`

7. **Azure Data Factory FQDN (e.g., dpeastus2.svc.datafactory.azure.com) fails to resolve when DNS chain is VNet DNS → Azure **
   - 根因: Both azure-api.net AND privatelink.azure-api.net Private DNS zones are linked to the DNS Resolver VNet simultaneously. DNS resolution is directed to the public zone (azure-api.net) instead of the Private Link zone (privatelink.azure-api.net), causing the CNAME chain to resolve to the wrong endpoint and the connection to fail.
   - 方案: 1. Move all VNet links and DNS records from azure-api.net to privatelink.azure-api.net. 2. Remove the azure-api.net zone to maintain a single correct Private DNS zone per Azure naming convention. 3. Verify no workload is sending private outbound traffic through a Private Endpoint (unsupported). 4. Test within a maintenance window before committing changes. Reference: https://learn.microsoft.com/en-us/azure/private-link/private-endpoint-dns
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20DNS/DNS%20Private%20Resolver/Fqdn%20failing%20to%20resolve%20when%20resolution%20is%20through%20DNS%20private%20resolver)`

8. **DNS Private Resolver returns wrong response (NXDOMAIN or public IP) for an FQDN despite the upstream DNS forwarder provi**
   - 根因: Azure DNS Private Resolver is a recursive resolver (not a simple forwarder). When it receives a CNAME response from the forwarding target, it follows the chain independently. If the DNS Forwarding Ruleset does not contain rules matching all domains in the CNAME chain (e.g., has rule for bird.contoso.com but not kittens.contoso.com), the resolver attempts public resolution for the unmatched domain. If that domain is private-only, the result is NXDOMAIN.
   - 方案: Ensure the DNS Forwarding Ruleset contains forwarding rules for ALL domains appearing in the CNAME resolution chain. Options: (1) Add a specific rule for each subdomain encountered (e.g., kittens.contoso.com). (2) Add a broader rule covering the second-level domain (e.g., contoso.com) to handle all subdomains. Validate by checking nslookup for each hop in the chain.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20DNS/DNS%20Private%20Resolver/Private%20Resolver%20returns%20wrong%20response%20despite%20DNS%20server%20providing%20the%20correct%20A%20record)`

9. **Connectivity to DNS Private Resolver inbound endpoint times out or is unreachable on port 53. Routing, NSGs, and NVA/fir**
   - 根因: VNET encryption is enabled on the VNet hosting the DNS Private Resolver inbound endpoint. VNets with encryption enabled explicitly do not support Azure DNS Private Resolver (also affects Application Gateway and Azure Firewall).
   - 方案: Disable VNET encryption on the VNet hosting DNS Private Resolver endpoints, or deploy the inbound endpoint in a separate non-encrypted VNet. Reference: https://learn.microsoft.com/en-us/azure/dns/dns-private-resolver-overview#virtual-network-restrictions and https://learn.microsoft.com/en-us/azure/virtual-network/virtual-network-encryption-overview#limitations
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20DNS/DNS%20Private%20Resolver/TSG%3A%20Private%20Resolver%20-%20Troubleshooting%20resolution%20issues)`

10. **Azure DNS public zone suddenly stops resolving; queries return REFUSED from Azure name servers even when zone and record**
   - 根因: Azure subscription hosting the DNS zone is in a non-enabled state (disabled, suspended, or past due) — the zone is no longer served by Azure DNS when the subscription is inactive
   - 方案: Check subscription state via ARM Subscription State Management or Jarvis (Azure Resource Manager > Subscription State Management > Get subscription). Any state other than 'enabled'/'active' indicates the problem. Customer must resolve billing or management issue to re-enable the subscription. Engage ASMS (Azure Subscriptions team) via collaboration if customer is unsure how to proceed.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20%28Public%29%20DNS%20zones%2FAzure%20DNS%20public%20zone%20suddenly%20stops%20resolving%20%28REFUSED%29)`

11. **DNS zone delegation unreliable; zone may not be covered by Azure DNS SLA, or resolution breaks when Azure name server IP**
   - 根因: Customer used IP addresses (glue record only) for DNS delegation instead of all 4 FQDN NS records assigned to the zone. Azure name server IPs are unicast (pool-based) and may change; delegating via IP alone does not guarantee SLA, redundancy, or availability
   - 方案: Use all 4 FQDN NS records (e.g., ns1-01.azure-dns.com, ns2-01.azure-dns.net, ns3-01.azure-dns.org, ns4-01.azure-dns.info) paired with their glue A records for zone delegation. ALL 4 NS pools must be referenced to be eligible for Azure DNS SLA. Do not delegate using IP addresses alone.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20%28Public%29%20DNS%20zones%2FDomain%20Delegation%20to%20Azure%20DNS)`

12. **After migrating domain hosting to Azure DNS, DNS resolution fails from some resolvers (e.g., 8.8.4.4) while succeeding f**
   - 根因: DNSSEC DS records were still configured in the parent TLD (e.g., .ch) for the domain prior to or during migration to Azure DNS. Azure DNS does not support DNSSEC signing, so any resolver performing DNSSEC validation (e.g., Google 8.8.4.4) rejects the responses — while resolvers not performing DNSSEC validation return results successfully
   - 方案: 1) Use DNSVIZ (https://dnsviz.net/) to confirm DNSSEC is securing the child zone (secured = black/colored arrows from parent to child). 2) Ask customer to contact their domain registrar to remove the DNSSEC DS records for the domain. 3) Wait for propagation (may take hours). 4) Verify in DNSVIZ using 'Update Now' that DS record is removed.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20%28Public%29%20DNS%20zones%2FFeature%3A%20DNSSEC%20support%20In%20Azure%20DNS%20Zones%2FTSG%3A%20DNS%20resolution%20not%20working%20DNSSEC%20validation%20failure)`

13. **DNS resolution breaks after disabling or re-enabling DNSSEC for an Azure DNS zone; zone previously resolved correctly**
   - 根因: A new DS key is generated every time DNSSEC is enabled for an Azure DNS zone. Disabling DNSSEC removes the key without the registrar being updated first, or re-enabling creates a new key that the registrar does not yet have — breaking the DNSSEC trust chain
   - 方案: To disable DNSSEC: (1) First remove the DS record at the parent zone or domain registrar; (2) Wait for DS record TTL to expire so resolvers stop validating against the old key; (3) Then disable DNSSEC from Azure portal. For re-enable: after enabling, update DS records at the registrar with the new DNSKEY. Azure portal warns about these requirements when attempting to disable.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20%28Public%29%20DNS%20zones%2FFeature%3A%20DNSSEC%20support%20In%20Azure%20DNS%20Zones%2FTSG%3A%20Troubleshooting%20DNSSEC%20issues%20in%20Azure%20DNS%20zones)`

14. **Customer adds DNS records to Azure DNS public zone but lookups return wrong results or do not resolve at all; DNS querie**
   - 根因: Domain registrar has different nameservers configured for the domain than the 4 NS servers assigned to the Azure DNS zone — queries are directed to the old/incorrect name servers which do not have the Azure DNS records
   - 方案: 1) Find the nameservers assigned to the zone in ASC (Properties tab) — format: ns<1-4>-<bucket>.azure-dns.<com/net/org/info>. If zone not in ASC, query DnsBilling > ZoneEvent in Jarvis to get the bucket and reconstruct NS names. 2) Check the actual NS delegation at the registrar via ICANN lookup (https://lookup.icann.org/). 3) Compare — if different, customer must update NS records at their domain registrar to match Azure-assigned nameservers. 4) Verify correct resolution using DigWebInterface with Trace option.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20%28Public%29%20DNS%20zones%2FTSG%20-%20Azure%20DNS%20Delegation%20and%20Propagation)`

15. **DNS queries for a subdomain zone (child zone, e.g., myzone.contoso.com) return NXDOMAIN or resolve to wrong IP/CNAME; bo**
   - 根因: (A) Parent zone is missing the NS records that delegate the subdomain to the child zone's nameservers. OR (B) Parent zone has a conflicting A/CNAME record for the same subdomain name as the child zone — resolvers may use either the parent A record or child zone NS depending on cache state
   - 方案: 1) Get nameservers for the child zone from ASC. 2) Check parent zone record sets (ASC download or Jarvis DNS > Cloud DNS > HTTP GET with path 'dnszones/<zonename>/recordsets'). 3) Ensure NS records for the subdomain in the parent zone match child zone's nameservers. 4) Remove any conflicting A/CNAME records for the same subdomain name from the parent zone. Reference: https://docs.microsoft.com/en-us/azure/dns/tutorial-public-dns-zones-child#verify-child-dns-zone
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20%28Public%29%20DNS%20zones%2FTSG%20-%20Azure%20DNS%20Delegation%20and%20Propagation)`

16. **DNS records not updating or showing intermittent resolution after migrating domain from one DNS hosting provider to anot**
   - 根因: Previous DNS hosting provider had high TTL values on SOA or NS records (e.g., TTL=172800 = 2 days). Resolvers cached old records for the full TTL duration, causing stale responses after migration
   - 方案: 1) Use DigWebInterface with Trace+SOA option to confirm TTL values on SOA and NS records. Check for high 'refresh' values. 2) If high TTL records are outside Azure (at old provider), customer must reduce TTL at the original provider BEFORE migrating. 3) If records are already in Azure, reduce TTL for the NS/SOA records to a lower value (e.g., 300–3600s) to speed up propagation after future changes.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20%28Public%29%20DNS%20zones%2FTSG%20-%20Azure%20DNS%20Delegation%20and%20Propagation)`

17. **Intermittent DNS resolution failures for a domain; resolution inconsistent across queries or resolvers**
   - 根因: NS records for the domain are configured with IP addresses instead of domain names (FQDNs), violating RFC 1035 §3.3.11 which requires NS RDATA to be a domain-name (NSDNAME), not an IP address
   - 方案: Customer must update NS records to use domain names (FQDNs) instead of IP addresses. Verify current NS record format using DigWebInterface (https://www.digwebinterface.com/) — look for IP addresses in NS values and replace with FQDNs.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20%28Public%29%20DNS%20zones%2FTSG%20-%20Azure%20DNS%20Delegation%20and%20Propagation)`

18. **FQDN resolution fails when DNS chain is VNet DNS -> Azure Firewall DNS Proxy -> DNS Private Resolver. Endpoints like dpe**
   - 根因: Both azure-api.net AND privatelink.azure-api.net Private DNS zones are linked to the DNS Resolver VNet simultaneously. DNS resolution is directed to the public zone (azure-api.net) instead of the Private Link zone (privatelink.azure-api.net), causing the CNAME chain to resolve incorrectly.
   - 方案: 1. Move all VNet links and DNS records from azure-api.net to privatelink.azure-api.net. 2. Remove azure-api.net zone to maintain a single correct Private DNS zone. 3. Verify no workload routes private outbound traffic through a Private Endpoint (unsupported). 4. Test within a maintenance window.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20DNS/DNS%20Private%20Resolver/Fqdn%20failing%20to%20resolve%20when%20resolution%20is%20through%20DNS%20private%20resolver)`

19. **DNS client receives NXDOMAIN or only the first CNAME of a chain, even though the upstream DNS forwarder returns the comp**
   - 根因: Azure DNS Private Resolver is a recursive resolver. When it receives a CNAME response from the forwarding target, it independently follows the chain. If the DNS Forwarding Ruleset lacks a rule matching a domain in the CNAME chain, the resolver attempts public resolution for that domain, resulting in NXDOMAIN for private-only domains.
   - 方案: Ensure DNS Forwarding Ruleset contains forwarding rules for ALL domains in the CNAME resolution chain. Options: (1) Add specific rule for each sub-domain encountered. (2) Add a broader second-level domain rule (e.g., contoso.com) to cover all subdomains.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20DNS/DNS%20Private%20Resolver/Private%20Resolver%20returns%20wrong%20response%20despite%20DNS%20server%20providing%20the%20correct%20A%20record)`

20. **CRUD operation fails when deploying DNS Private Resolver resources in a specific Azure region.**
   - 根因: Azure DNS Private Resolver is not available in all Azure regions.
   - 方案: Check supported regions at https://learn.microsoft.com/en-us/azure/dns/dns-private-resolver-overview#regional-availability and deploy in a supported region.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20DNS/DNS%20Private%20Resolver/TSG%3A%20Private%20Resolver%20-%20Troubleshooting%20CRUD%20issues)`

21. **Deletion of DNS Private Resolver outbound endpoint fails.**
   - 根因: Outbound endpoints cannot be deleted unless the associated DNS Forwarding Ruleset and all virtual network links under it are deleted first.
   - 方案: Delete in order: (1) Delete all VNet links from the DNS Forwarding Ruleset, (2) Delete the DNS Forwarding Ruleset, (3) Delete the outbound endpoint.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20DNS/DNS%20Private%20Resolver/TSG%3A%20Private%20Resolver%20-%20Troubleshooting%20CRUD%20issues)`

22. **DNS Private Resolver resource creation fails with IP address conflict or validation error.**
   - 根因: IP address space 10.0.1.0 - 10.0.16.255 is reserved and cannot be used for the DNS resolver service.
   - 方案: Assign a subnet to the DNS resolver that does not overlap with the reserved range 10.0.1.0 - 10.0.16.255.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20DNS/DNS%20Private%20Resolver/TSG%3A%20Private%20Resolver%20-%20Troubleshooting%20CRUD%20issues)`

23. **Creating an inbound or outbound endpoint fails with a subnet-related validation error.**
   - 根因: The subnet delegated to DNS Private Resolver must be between /28 (minimum) and /24 (maximum) address space.
   - 方案: Create a dedicated subnet with /28 to /24 address space and delegate it to Microsoft.Network/dnsResolvers before creating the endpoint.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20DNS/DNS%20Private%20Resolver/TSG%3A%20Private%20Resolver%20-%20Troubleshooting%20CRUD%20issues)`

24. **Error when creating a DNS Forwarding Rule with 168.63.129.16 as the destination IP address: Exception while making add r**
   - 根因: Azure DNS IP (168.63.129.16) is explicitly prohibited as a destination IP address for DNS forwarding rules.
   - 方案: Use a different DNS server IP as the forwarding target. 168.63.129.16 cannot be used as a rule destination.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20DNS/DNS%20Private%20Resolver/TSG%3A%20Private%20Resolver%20-%20Troubleshooting%20CRUD%20issues)`

25. **Connectivity to DNS Private Resolver inbound endpoint on port 53 times out or is unreachable. Routing, NSGs, NVA/firewal**
   - 根因: VNet encryption is enabled on the VNet hosting the DNS Private Resolver inbound endpoint. VNets with encryption enabled do not support Azure DNS Private Resolver.
   - 方案: Disable VNet encryption on the VNet hosting DNS Private Resolver endpoints, or deploy the resolver in a separate non-encrypted VNet. Reference: https://learn.microsoft.com/en-us/azure/dns/dns-private-resolver-overview#virtual-network-restrictions
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20DNS/DNS%20Private%20Resolver/TSG%3A%20Private%20Resolver%20-%20Troubleshooting%20resolution%20issues)`

26. **DNS queries appear dropped at Private Resolver. Log message ThrottleManager UpdateForUdpQueryResponse EndpointId not fou**
   - 根因: That specific log message does NOT indicate throttling. Actual throttling is indicated when InboundQueryThrottledInflightUdp or InboundQueryThrottledInflightTcp > 0 in DNSProxyEndpointInfo logs. QPS limit is 10000 per endpoint.
   - 方案: Check DNSProxyEndpointInfo in Jarvis (Diagnostics PROD > ManagedResolverProd > DnsProxyEndpointIdInfo) using the Endpoint GUID. If throttled counters > 0, reduce DNS query rate or distribute queries across multiple endpoints.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20DNS/DNS%20Private%20Resolver/TSG%3A%20Private%20Resolver%20-%20Troubleshooting%20resolution%20issues)`

27. **Customer needs to increase Azure DNS limits: zones per subscription, record sets per zone, TXT records per recordset, DN**
   - 根因: Default Azure DNS quotas enforced at subscription level.
   - 方案: (1) Max public DNS zones/sub: up to 10000 via ASMS. (2) Max record sets/zone: up to 25000 via ASMS. (3) TXT records per recordset: ICM, hard limit 100. (4) Public DNS Aliases: ICM up to 50 with TA+PG. (5) Private DNS Aliases: hard cap 20, CANNOT increase. (6) Private DNS records per record set: hard cap 20. (7) VM DNS queries/sec: max 1000 cannot increase; workaround distribute across VMs. Private DNS increases require PM approval.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20DNS/Increasing%20Azure%20DNS%20related%20limits)`

28. **Customer unable to delete DNS public zone, receives 400 error: 'Cannot delete the zone because there exists a public del**
   - 根因: Azure DNS safety check blocks deletion of delegated zones to prevent dangling NS records and domain takeovers. Applies to major 1P tenants only (AME, PME, Torus, Corp in Public; CME/Torus Gallatin in Mooncake; USME/Torus ITAR in Fairfax). Zone cannot be deleted while NS records in the parent zone still point to it.
   - 方案: 1) Remove NS records (delegation) for the child zone from the parent zone. 2) Wait for the NS record TTL to expire. 3) Retry zone deletion. For registrar-managed parent zones, contact the registrar to remove the delegation. Use digweb to trace NS records; use Kusto (azuredns.kusto.windows.net/dnsbillingprod/ZoneEvent) to locate parent zone subscription/resource group. Confirm block via FrontendOperationEtwEvent filtering on DeleteZoneOperation.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20%28Public%29%20DNS%20zones%2FUnable%20To%20Delete%20DNS%20Zone)`

29. **Internal Azure customer's DNS name (e.g. *.cloudapp.azure.com) returns 255.255.255.255 via nslookup — customer cannot us**
   - 根因: Azure security team has sniped (taken over) the DNS name because it was a dangling domain — an orphaned DNS record pointing to a de-provisioned resource. This snipe protection applies only to internal Azure customers.
   - 方案: Run the Kusto query (datastudiostreaming/Shared cluster) with the relevant hostname to identify which team owns the domain and which ASC escalation template to use. Escalate via ASC to the appropriate team (Cloud and AI vs Entertainment and Devices division). For external customers: they must choose a new DNS name — Azure security team does not snipe external customer domains.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20%28Public%29%20DNS%20zones%2FUnblocking%20internal%20dangling%20domains)`

30. **DNS public zone creation fails with 'The zone {name} is not available' — nameserver/bucket exhaustion in a deep zone hie**
   - 根因: Azure DNS enforces that a zone cannot share the same nameserver bucket as any of its ancestor or descendant zones. With deep hierarchies, all available buckets (1-9, 32-38) are consumed by ancestors and descendants, leaving no bucket for the new zone.
   - 方案: Check existing zones via Kusto (azuredns.kusto.windows.net/dnsbillingprod/ZoneEvent) to identify bucket conflicts. Delete unused child/descendant zones to free buckets, then retry zone creation. If deletion is not possible, escalate via Azure DNS Teams channel for PG to manually create the zone in a reserved bucket (requires domain ownership verification via TXT record: 'azurednsverify.{zonename}').
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20%28Public%29%20DNS%20zones%2FZone%20is%20Not%20Available%20Error%20in%20Azure%20DNS)`

31. **Azure DNS public zone creation fails with HTTP 409 Conflict: 'The zone name {zone name} is not permitted. Please use a d**
   - 根因: ARM validates the requested zone name against the ICANN Public Suffix List (publicsuffix.org). Zone names that exactly match a Public Suffix entry without an additional label (e.g., a TLD or ccTLD) are blocked from creation by Azure DNS.
   - 方案: For customers who are not the rightful owner: create a subdomain zone instead (subdomains have no Public Suffix restrictions). For verified rightful domain owners (e.g., government entities owning a ccTLD): engage CloudDNS team via ICM to manually create the zone — requires a valid email address from within the domain for verification. After creation, enable delete protection on the zone.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20%28Public%29%20DNS%20zones%2FZone%20is%20not%20permitted%20in%20Azure%20DNS)`

32. **Linking a Virtual Network to a Private DNS zone fails with Conflict: 'Virtual network resource identity already in use. **
   - 根因: The VNet was deleted and recreated but the old Virtual Network link in the Private DNS zone was not fully cleaned up. Azure attempts to auto-delete stale links during the new PUT operation, but this fails when a CanNotDelete lock is applied to the Private DNS zone or its resource group.
   - 方案: Customer must manually delete the stale Virtual Network links from the Private DNS zone before creating a new link. Check for resource locks using Azure Resource Manager > Get Resource Locks action in Jarvis. Remove CanNotDelete locks if present. Then delete stale links and retry VNet link creation. Reference ICM: 237843831.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20Private%20DNS%20zones%2FFailed%20to%20link%20Private%20DNS%20zone%20to%20Virtual%20Network%20due%20to%20reference%20to%20stale%20links)`

33. **Private Link resource name resolution fails with NXDOMAIN response when the private endpoint is in a different tenant — **
   - 根因: Private DNS zone returns authoritative NXDOMAIN when it has no record for the queried name. Without the NxDomainRedirect policy, the Azure Recursive Resolver does not attempt public resolution after receiving NXDOMAIN, blocking access to cross-tenant Private Link endpoints.
   - 方案: Configure resolutionPolicy: NxDomainRedirect on the virtualNetworkLinks resource using api-version=2024-06-01+. Azure CLI: 'az network private-dns link vnet update --resource-group {rg} -n {linkName} -z {zoneName} --resolution-policy NxDomainRedirect'. Verify resolution in DnsServingPlaneProd/DnsResponse logs: filter AliasNameChaseCount==1 AND AliasNameChaseBitMask==2.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20Private%20DNS%20zones%2FFeature%3A%20Fallback%20to%20Internet%20for%20Azure%20Private%20DNS%20zones)`

34. **Azure Private DNS Zone Auto Registration 未能为新建 VM 或 VMSS 创建 A/PTR DNS 记录**
   - 根因: VM/VMSS hostname 不合法：Windows VM hostname（截断到 15 字符后）以连字符结尾；Linux VM hostname 超过 63 字符或以连字符结尾。Private DNS Auto Registration 在写入记录前会做 hostname 校验，不合法则静默失败。
   - 方案: 重建 VM/VMSS 并使用合法的 hostname（Windows ≤15 字符且不以连字符结尾；Linux ≤63 字符且不以连字符结尾）。通过 Jarvis NSMTraces 日志确认失败：过滤 VM hostname 前缀，搜索 'IDnsDriver Set Records found unsupported host name:'；成功则显示 '[DCMNMDnsQoS] Operation=SendRecordsWithBatchClient:SuccessfullRequest'。参考：https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/resource-name-rules#microsoftcompute
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20Private%20DNS%20zones%2FTroubleshooting%20Auto%20Registration%20FAILS%20due%20to%20unsupported%20VM%20Hostname)`

35. **使用 Custom Windows DNS Server 时，Private DNS Zone 记录（包括 Private Endpoint）间歇性返回 Public IP 地址而非 Private IP，或 DNS 查询超时**
   - 根因: Windows DNS Server 默认 forwarding timeout 为 3 秒，而 Azure DNS 递归解析器有时需要 3-4 秒才能响应。当 Azure DNS 响应在 timeout 之后到达，Windows DNS 已启用 root hints fallback 并解析到 Public IP，该结果被缓存；之后 Azure DNS 的正确 Private IP 响应被丢弃，导致后续查询持续返回 Public IP。
   - 方案: 在 Custom Windows DNS Server 上增大 forwarding timeout 值，留出足够时间让 Azure DNS 完成递归解析。参考：https://learn.microsoft.com/en-us/troubleshoot/windows-server/networking/forwarders-resolution-timeouts 。如持续出现 Azure DNS 侧超时（Jarvis 中可见 RECURSE_QUERY_TIMEOUT），需联系 TA 升级 PG 排查 backend RR 问题。
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20Private%20DNS%20zones%2FTroubleshooting%20Private%20DNS%20Queries%20Timeouts%20with%20Custom%20Windows%20DNS%20Servers)`

36. **Azure DNS 记录配置的 TTL 超过 30 分钟，但查询时返回的 TTL 始终 ≤30 分钟（Public Zone 和 Private Zone 均如此）**
   - 根因: Azure DNS 递归解析器的最大缓存 TTL 被 PG 设置为 30 分钟（防止缓存长时间不刷新带来的影响）。任何高于 30 分钟的 TTL 配置，在解析器层均被强制截断为 30 分钟。
   - 方案: 这是预期行为，无需修复。向客户解释：Azure DNS resolver 会将 TTL 上限为 30 分钟；配置低于 30 分钟的 TTL 值会被如实返回。参考 ICM: 283666122, 349938563。
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FCommon%2FAzure%20DNS%20Records%20with%20TTL%20more%20than%2030%20minutes)`

37. **客户收到安全通知，告知其某些子域处于 dangling 状态（CNAME 指向已删除的 Azure 资源）或已被其他 Azure 订阅接管（subdomain takeover）**
   - 根因: Azure 资源（如 Azure Web App）被删除时，对应的 DNS CNAME 记录未同步清理。其他 Azure 客户随后创建了相同名称的资源，从而获得了对该子域流量的控制权。
   - 方案: (1) 审查 DNS 记录中的悬空 CNAME，删除或重定向至有效资源；(2) 推荐使用 Azure DNS alias records 防止未来出现 dangling；(3) 若发生主动接管且有违法/违反 TOS 行为，引导客户通过 CARS portal 举报（https://portal.msrc.microsoft.com/en-us/engage/cars）；(4) 高优先级升级需 TA/Manager 审批后通过 GetHelp 提交。自助检测脚本：https://github.com/AzureDanglingDNS/Azure-Network-Security
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FCommon%2FDangling%20Domains%20%26%20Domain%20Takeovers)`

38. **Wildcard DNS 记录（如 *.contoso.com）对某特定子域（如 dev.contoso.com）返回 NOERROR 但 Answer 为空，而该子域并没有显式创建记录**
   - 根因: 在该子域下存在更深层级的记录（如 www.dev.contoso.com），导致 dev.contoso.com 成为 'empty non-terminal' 节点。Azure DNS 将 empty non-terminal 视为已存在的节点，阻止 wildcard 记录匹配该名称。
   - 方案: 方案一：手动为 dev.contoso.com 创建一条显式记录（A/CNAME 等）；方案二：删除产生 empty non-terminal 的子级记录（如删除 www.dev.contoso.com 后，empty non-terminal 消失，wildcard 可正常匹配）。
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FCommon%2FEmpty%20Response%20for%20Wildcard%20Domain)`

39. **DNS authoritative server 对 AAAA query 返回 NXDOMAIN，即使该名称存在 A 记录。Resolver 将名称视为完全不存在并负缓存所有 qtype，导致 A 记录也无法解析**
   - 根因: Per RFC 2308 Section 5：NXDOMAIN 表示该名称（FQDN）不存在，而非仅该 qtype 不存在。Auth NS 对 AAAA 返回 NXDOMAIN 时，resolver 会为所有 qtype 缓存 NXDOMAIN，导致后续 A 查询也返回 NXDOMAIN（从缓存）。正确行为应返回 NODATA（RCODE 0, 空 answer section）。
   - 方案: 检查 authoritative DNS server 配置：若 A 记录存在但 AAAA 不存在，server 应对 AAAA query 返回 NODATA（RCODE 0 + 空 answer），而非 NXDOMAIN。联系 authoritative DNS 提供方修正响应行为。NODATA 负缓存仅作用于该 qtype，不影响 A 记录解析。
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FCommon%2FNXDOMAIN%20Responses)`

40. **Azure DNS (168.63.129.16) 对子域名查询返回 SERVFAIL (RCODE 2)。子域名通过 NS record 委托，但目标 NS server 仅托管父域（没有子域名的 SOA record）**
   - 根因: NS record 将子域委托给一台仅托管父域的 server，该 server 对子域 SOA 查询返回父域 SOA。Azure DNS 的 EDNS resolver 检测到 SOA zone name 与委托 zone 不一致，按 RFC 1034/2308 返回 SERVFAIL。此行为特定于 Azure DNS（其他 resolver 可能不触发）。
   - 方案: 确保每个委托子域均有独立的 NS + SOA record，SOA 指向正确的 authoritative server。参考：https://learn.microsoft.com/en-us/connectivity-analyzer/mismatching-soa-and-ns-zone-names。由客户 DNS 团队修正 zone 配置。
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FCommon%2FQTYPES%20and%20RCODES)`

41. **对 38 个或更多子域标签（label）的域名发起 DNS 查询，Azure DNS 返回 FORMERR (RCODE 1)**
   - 根因: WinDNS bug：WinDNS（Azure RR.DNS 和 MSFT.RR 底层 resolver）内部有 40 labels 限制，38+ subdomains 会触发 application error。这是 WinDNS 自身 bug（Bug ID: 32729709），并非 Azure DNS 配置问题。截至 2026-01-16 仍未修复。
   - 方案: 临时缓解：将域名子域深度减少到 38 labels 以下。如需升级，向 Cloudnet/DNSServingPlane 提交 IcM 并附上 WinDNS bug 参考。PG 正在开发修复，但尚未部署到生产节点。
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FCommon%2FQTYPES%20and%20RCODES)`

42. **Azure 公共 DNS Zone 突然停止解析，查询返回 REFUSED (RCODE 5)**
   - 根因: DNS Zone 未部署到 DNS serving plane，或 subscription 存在问题（如 subscription 被暂停/禁用）。
   - 方案: (1) 检查 DNS Zone 是否仍正常部署（ASC > Providers > Microsoft.Network > dnszones）；(2) 检查 subscription 状态是否 Active；(3) 参考 wiki: https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/388531/Azure-DNS-public-zone-suddenly-stops-resolving
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FCommon%2FQTYPES%20and%20RCODES)`

43. **Ubuntu 18.04+ VM 无法解析 Azure Private DNS Zone 中的 *.local 域名，NSLOOKUP 返回 SERVFAIL。同一 VNet 下 Windows VM 解析正常。**
   - 根因: Ubuntu 18.04+ 默认将 /etc/resolv.conf 软链到 systemd-resolved stub 文件（/run/systemd/resolve/stub-resolv.conf），stub resolver 指向 127.0.0.53。该 stub resolver 认为 .local 是 mDNS 域名，拒绝向配置的 DNS server（如 168.63.129.16）转发 .local 查询。
   - 方案: 重建 /etc/resolv.conf 软链到真实的 resolv.conf：(1) sudo rm -f /etc/resolv.conf (2) sudo ln -s /run/systemd/resolve/resolv.conf /etc/resolv.conf。立即生效，无需重启。建议先用 Windows VM 在同一 subnet 验证 DNS Zone 配置正确。
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FCommon%2FTSG%3A%20Troubleshooting%20resolution%20issues%20in%20Ubuntu)`

44. **Azure DNS / Private DNS 的 CRUD 操作（尤其是 ListRecordSet）收到 HTTP 429 throttling 错误。多发于拥有大量 RecordSet 的 Zone 进行频繁列举操作时。**
   - 根因: Azure DNS 按 subscription 限流（非按 Zone）。公开限制：每 5 分钟 500 次 GET 操作；或 60 次 List 操作/分钟，200 次 Create/Update 操作/分钟。高频 ListResourceRecordsOperation（如监控、自动化脚本扫描大量 Zone）易超限。
   - 方案: (1) 用 Kusto 确认：cluster('azuredns').database('clouddnsprod').QosEtwEvent 查询 OperationName='ListResourceRecordsOperation' 并统计 RequestCount。(2) 缓解：将高频 ListRecordSet Zone 迁移到独立 subscription。(3) 若迁移失败（新 backend 问题），联系 CloudDNS support 解除阻塞。(4) 优化应用，减少 ListRecordSet 轮询频率。
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FCommon%2FTSG%20-%20ListRecordSet%20Operations%20-%20Throttling%20429)`

45. **从 Azure VM 访问 Private AKS cluster 时，Azure Portal FQDN（如 <guid>.hcp.<region>.azmk8s.io）DNS 解析失败，返回 'No such name'。从公网可正常解**
   - 根因: VNet 链接了错误的 Private DNS Zone（如 '<region>.azmk8s.io' 或 'azmk8s.io'）。Azure Portal FQDN 托管在公共 Azure DNS Zone '<region>.azmk8s.io'，错误链接的 Private Zone 覆盖了公网解析但没有对应 A 记录，导致 NXDOMAIN。正确 Private Zone 应为 'xxxxxxxx.privatelink.<region>.azmk8s.io'（由 AKS 自动创建）。
   - 方案: (1) 在 ASC 检查是否有 '<region>.azmk8s.io' 或 'azmk8s.io' Private DNS Zone 链接到该 VNet，若有则删除 VNet Link。(2) 确保只有 'xxxxxxxx-xxxx.privatelink.<region>.azmk8s.io' Private Zone 链接到该 VNet。(3) 若客户无权访问该 AKS 创建的 Private Zone（跨租户/订阅），手动创建 Private Zone 'privatelink.<region>.azmk8s.io' 并添加 A record 指向 kube-apiserver private endpoint IP，再链接到 VNet。
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FCommon%2FTSG%20Troubleshooting%20No%20such%20name%20error%20for%20Azure%20Portal%20FQDN%20of%20a%20private%20AKS%20cluster)`

46. **DNS queries fail (nslookup fails, VM domain join fails) even though UDP and TCP connectivity to DNS server on port 53 is**
   - 根因: Checkpoint firewall on-premises applies an implied rule for DNS that is incompatible with S2S VPN tunnel traffic; DNS responses from the Domain Controller are intercepted/dropped before returning to the VM
   - 方案: Disable the implied DNS rule in Checkpoint firewall and create an explicit allow rule for DNS traffic on the S2S VPN tunnel
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FCommon%2FUDP%20works%20but%20not%20DNS)`

47. **DNS queries return SERVFAIL (RCODE 2); DNS resolver cannot obtain a response from the upstream authoritative nameserver**
   - 根因: Upstream resolver timeout due to broken delegation, DNSSEC validation failure, firewall dropping DNS packets, overloaded DNS server, or excessive CNAME chains; resolver forwards query but receives no reply
   - 方案: 1) Query authoritative NS directly to bypass Azure resolver (nslookup/dig @<ns_ip>); 2) Test TCP/53 connectivity to NS from inside and outside Azure (Test-NetConnection); 3) Use PrivateDnsRr logs in Jarvis (RECURSE_QUERY_DROP or RESPONSE_FAILURE events) to identify exact failure point; 4) Verify NS delegation is correct
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FCommon%2FUnderstanding%20Servfail%20DNS)`

48. **DNS resolution succeeds from outside Azure but fails with SERVFAIL from inside Azure VMs for the same domain**
   - 根因: Authoritative nameserver (destination NS) is blocking Azure IP address ranges; confirmed by historical ICMs 88217204 and 89267259
   - 方案: Confirm via Test-NetConnection <ns_ip> -port 53 from inside Azure (should fail) vs outside Azure (should succeed). Request NS operator to add Azure IP ranges to their allow list, or configure the resolver to use an alternative NS
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FCommon%2FUnderstanding%20Servfail%20DNS)`

49. **Random or intermittent DNS resolution failures on Azure VMs using Windows Server as custom DNS; failures are sporadic wi**
   - 根因: Azure VNet reserves UDP port 65330 for VxLAN traffic and blocks all communication on this port. Windows dynamic UDP port range (49152-65535) includes port 65330; when Windows randomly selects this port for outbound DNS client queries, the packet is silently dropped by the VNet
   - 方案: Exclude UDP port 65330 from Windows dynamic port range: run `netsh int ipv4 add excludedportrange udp 65330 1 persistent`. Validate with `netsh int ipv4 show excludedportrange udp`. Reference: https://techcommunity.microsoft.com/blog/coreinfrastructureandsecurityblog/unmasking-dns-timeouts-the-hidden-culprit-in-azure-virtual-networks/4250444
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FCustom%20DNS%2FWindows%20DNS%20Network%20trace)`

50. **DNS name resolution fails across peered VNets - nslookup returns NXDOMAIN for VM hostnames in peered VNet but ping by IP**
   - 根因: VNet peering provides network-layer connectivity only. Azure-provided DNS (168.63.129.16) resolves names only within the same VNet or linked Private DNS zones. Cross-VNet DNS not automatic.
   - 方案: Option 1 (recommended): Create Azure Private DNS zone, link to both peered VNets with auto-registration enabled. Option 2: Configure custom DNS server with conditional forwarding to 168.63.129.16. Restart VMs or renew DHCP lease after DNS changes.
   `[结论: 🟢 8.0/10 — mslearn] [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/virtual-network-troubleshoot-peering-sync-route-issues)`

51. **P2S VPN client cannot resolve FQDNs of on-premises resources - DNS queries fail for local domain names**
   - 根因: P2S VPN client uses Azure DNS servers configured on the VNet which take precedence over local DNS. Azure DNS 168.63.129.16 has no records for on-prem resources.
   - 方案: Configure DNS Forwarders or Conditional Forwarders on Azure DNS for on-prem domains. Or use Azure Private Resolver with forwarding rules. Verify VPN adapter DNS metric.
   `[结论: 🔵 6.0/10 — mslearn] [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-troubleshoot-vpn-point-to-site-connection-problems)`

52. **P2S VPN clients cannot resolve Private DNS zone records including private endpoints - nslookup returns NXDOMAIN**
   - 根因: Azure DNS IP 168.63.129.16 is only resolvable from Azure platform resources, not from P2S VPN clients directly. P2S clients cannot reach wire server for Private DNS resolution.
   - 方案: Deploy Azure Private Resolver. Configure inbound endpoint IP as custom DNS on VNet instead of 168.63.129.16. VPN gateway pushes custom DNS to P2S clients. Ensure Private DNS zones linked to VNet with Private Resolver.
   `[结论: 🔵 6.0/10 — mslearn] [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-troubleshoot-vpn-point-to-site-connection-problems)`

### Phase 2: 其他
> 来源: ado-wiki

1. **Setting ReverseFqdn to a custom domain name on an Azure Public IP fails with error code ReverseFqdnDoesNotBelongToSubscr**
   - 根因: The custom domain used as ReverseFqdn does not satisfy Azure's ownership verification requirements: it must either (1) match the FQDN of a public IP in the subscription, (2) resolve via CNAME chain to a public IP FQDN in the subscription, or (3) resolve via CNAME+A records to a static public IP in the subscription
   - 方案: Create a CNAME record at the DNS registrar pointing the custom domain to an existing cloudapp.azure.com FQDN under the same subscription (e.g., custom.contoso.com CNAME existing-pip.eastasia.cloudapp.azure.com). Then set ReverseFqdn to the custom domain using Set-AzPublicIpAddress. The CNAME can later be removed without affecting PTR resolution.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20Internal%20DNS%20%28VNET%29%2FReverse%20DNS%20in%20Azure)`

2. **Resource group deletion fails with ResourceGroupDeletionBlocked / ResourceDeletionFailed — a DNS zone within the resourc**
   - 根因: The same dangling NS delegation safety check blocks zone deletion during resource group deletion. The error message only indicates RG deletion failure without surfacing the actual zone deletion reason.
   - 方案: Attempt to delete the DNS zone individually first to see the specific delegation error. Remove NS delegation from parent zone, wait for TTL expiry, then retry zone deletion. Once the zone is deleted, retry the resource group deletion.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20%28Public%29%20DNS%20zones%2FUnable%20To%20Delete%20DNS%20Zone)`

3. **DNS public zone creation fails with 'The zone {name} is not available' — zone name or an overlapping parent/child zone a**
   - 根因: The desired zone name (or a parent/child with overlapping namespace) already exists in a different subscription — owned by another customer, Azure security sniper team, or a malicious user.
   - 方案: Use Kusto (AzureDns/dnsbillingprod/ZoneEvent) to find overlapping zones across subscriptions. If owned by customer's own tenant, coordinate with their team. If owned externally, recommend choosing a different zone name. Only as last resort, escalate to PG via Azure DNS Teams channel for manual creation in reserved bucket after domain ownership verification.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20%28Public%29%20DNS%20zones%2FZone%20is%20Not%20Available%20Error%20in%20Azure%20DNS)`

### Phase 3: 已知问题与限制
> 来源: ado-wiki + onenote

1. **Azure Container App default URL is inaccessible in Azure China (21V) - URL shows incomplete or cannot be resolved**
   - 根因: China region requires ICP domain registration; the default Container App URL (*.azurecontainerapps.dev.cn) is not ICP-registered, so it is blocked by design
   - 方案: Two options: 1) Create Private DNS Zone with A record pointing Container App environment default domain to its static IP 2) Use custom domain with certificate + Private DNS Zone. For custom DNS servers, forward unresolved queries to 168.63.129.16. Do not block 168.63.129.16 in NSG/firewall. Ref: docs.azure.cn/container-apps/environment-custom-dns-suffix
   `[结论: 🟢 9.5/10 — onenote] [MCVKB/8.1 azure container app的纯内网环境如何进行域名和IP的解析.md]`

2. **客户需要一次性修改 Azure DNS Zone 中所有 RecordSet 的 TTL 值**
   - 根因: N/A
   - 方案: 使用 Azure PowerShell: Login-AzAccount 后执行 Get-AzDnsRecordSet -ZoneName contoso.com -ResourceGroupName <rg> | %{$_.Ttl=120;Set-AzDnsRecordSet -RecordSet $_ -Overwrite}。如需只修改特定记录类型，添加 -RecordType 参数。
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FCommon%2FHow%20to%20modify%20the%20TTL%20property%20of%20all%20RecordSets%20in%20an%20Azure%20DNS%20Zone%20at%20once)`

### Phase 4: 证书与密钥
> 来源: mslearn + ado-wiki

1. **VMSS marked for deletion cannot be deleted or modified; all operations fail with error code OperationNotAllowedOnVMScale**
   - 根因: AppGW in the VMSS backend pool has an SSL certificate linked to a Key Vault secret that is not DNS-resolvable (KV hostname not reachable); AppGW config validation fails during any operation, blocking all dependent VMSS operations
   - 方案: Option 1: Delete the entire resource group containing both AppGW and VMSS (ensure other resources are no longer needed). If VMSS is stuck, run: Remove-AzVmss -ResourceGroupName '<RG>' -VMScaleSetName '<VMSS>'. Option 2: Navigate to Azure Portal > Application Gateway > Listeners > Listener TLS Certificates, edit the failing certificate and upload a new certificate directly instead of referencing Key Vault.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FUnable%20to%20delete%20VMSS)`

2. **VPN Gateway Key Vault access failures - token request failed, secret not found, keyvault inaccessible, request timeout, **
   - 根因: VPN Gateway cannot access Key Vault due to: missing managed identity properties, secret/certificate not found, Key Vault inaccessible, request timeout, or Key Vault host URL cannot be resolved (DNS issue).
   - 方案: 1) Verify Key Vault accessibility and configuration. 2) Verify secret/certificate exists with correct name. 3) Check outbound certificate URL path in CertificateAuthentication object. 4) Verify managed identity has proper Key Vault access. 5) For token/timeout issues, retry and open support ticket if persistent.
   `[结论: 🔵 6.0/10 — mslearn] [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/troubleshoot-digital-certificate-authentication)`

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | DNS resolution failure when multiple VMs in the same VNet... | iDNS updates the A record to the IP of the last... | Avoid assigning the same hostname to multiple V... | 🟢 9.5 | [MCVKB/7.2[NET]How iDNS Manages The DNS Record when Multi.md] |
| 2 | DNS resolution failures from Azure VM - Cannot resolve ho... | Azure DNS forwarder enforces per-VM limits: max... | 1) Distribute DNS query load across more VMs. 2... | 🟢 9.5 | [MCVKB/7.3 How to Troubleshoot DNS Forwarder Related Issu.md] |
| 3 | Global Azure VMs or clients outside China cannot resolve ... | Traffic Manager geographic routing only maps CN... | 1) Add geographic mappings for other regions or... | 🟢 9.5 | [MCVKB/6.1[NET]The global Azure VMs query the Mooncake tr.md] |
| 4 | Function App in ILB ASE cannot resolve domain name and sh... | ILB ASE requires manual DNS configuration; Func... | 1) Configure ILB ASE DNS per docs (docs.azure.c... | 🟢 9.5 | [MCVKB/6.2 How to make Function App work in ILB ASE.md] |
| 5 | Azure Container App default URL is inaccessible in Azure ... | China region requires ICP domain registration; ... | Two options: 1) Create Private DNS Zone with A ... | 🟢 9.5 | [MCVKB/8.1 azure container app的纯内网环境如何进行域名和IP的解析.md] |
| 6 | VMSS marked for deletion cannot be deleted or modified; a... | AppGW in the VMSS backend pool has an SSL certi... | Option 1: Delete the entire resource group cont... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FUnable%20to%20delete%20VMSS) |
| 7 | Web App or Function App with VNET integration fails DNS r... | Antares version ANT 93+ removed the automatic D... | 1) Add app setting WEBSITE_ALWAYS_FALLBACK_TO_P... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20Internal%20DNS%20%28VNET%29%2FChanges%20in%20Web%20app%20Custom%20DNS%20fallback%20mechanism) |
| 8 | Mac P2S VPN client cannot resolve Azure VM names using DN... | Known bug (ADO Bug 14039446): Azure VPN Mac cli... | Workaround: Use full IP address or complete FQD... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20Internal%20DNS%20%28VNET%29%2FResolve%20VM%20names%20from%20Onprem%20P2S%20client%20using%20Azure%20AD%20authentication) |
| 9 | Setting ReverseFqdn to a custom domain name on an Azure P... | The custom domain used as ReverseFqdn does not ... | Create a CNAME record at the DNS registrar poin... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20Internal%20DNS%20%28VNET%29%2FReverse%20DNS%20in%20Azure) |
| 10 | Azure Data Factory FQDN (e.g., dpeastus2.svc.datafactory.... | Both azure-api.net AND privatelink.azure-api.ne... | 1. Move all VNet links and DNS records from azu... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20DNS/DNS%20Private%20Resolver/Fqdn%20failing%20to%20resolve%20when%20resolution%20is%20through%20DNS%20private%20resolver) |
| 11 | DNS Private Resolver returns wrong response (NXDOMAIN or ... | Azure DNS Private Resolver is a recursive resol... | Ensure the DNS Forwarding Ruleset contains forw... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20DNS/DNS%20Private%20Resolver/Private%20Resolver%20returns%20wrong%20response%20despite%20DNS%20server%20providing%20the%20correct%20A%20record) |
| 12 | Connectivity to DNS Private Resolver inbound endpoint tim... | VNET encryption is enabled on the VNet hosting ... | Disable VNET encryption on the VNet hosting DNS... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20DNS/DNS%20Private%20Resolver/TSG%3A%20Private%20Resolver%20-%20Troubleshooting%20resolution%20issues) |
| 13 | Azure DNS public zone suddenly stops resolving; queries r... | Azure subscription hosting the DNS zone is in a... | Check subscription state via ARM Subscription S... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20%28Public%29%20DNS%20zones%2FAzure%20DNS%20public%20zone%20suddenly%20stops%20resolving%20%28REFUSED%29) |
| 14 | DNS zone delegation unreliable; zone may not be covered b... | Customer used IP addresses (glue record only) f... | Use all 4 FQDN NS records (e.g., ns1-01.azure-d... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20%28Public%29%20DNS%20zones%2FDomain%20Delegation%20to%20Azure%20DNS) |
| 15 | After migrating domain hosting to Azure DNS, DNS resoluti... | DNSSEC DS records were still configured in the ... | 1) Use DNSVIZ (https://dnsviz.net/) to confirm ... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20%28Public%29%20DNS%20zones%2FFeature%3A%20DNSSEC%20support%20In%20Azure%20DNS%20Zones%2FTSG%3A%20DNS%20resolution%20not%20working%20DNSSEC%20validation%20failure) |
| 16 | DNS resolution breaks after disabling or re-enabling DNSS... | A new DS key is generated every time DNSSEC is ... | To disable DNSSEC: (1) First remove the DS reco... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20%28Public%29%20DNS%20zones%2FFeature%3A%20DNSSEC%20support%20In%20Azure%20DNS%20Zones%2FTSG%3A%20Troubleshooting%20DNSSEC%20issues%20in%20Azure%20DNS%20zones) |
| 17 | Customer adds DNS records to Azure DNS public zone but lo... | Domain registrar has different nameservers conf... | 1) Find the nameservers assigned to the zone in... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20%28Public%29%20DNS%20zones%2FTSG%20-%20Azure%20DNS%20Delegation%20and%20Propagation) |
| 18 | DNS queries for a subdomain zone (child zone, e.g., myzon... | (A) Parent zone is missing the NS records that ... | 1) Get nameservers for the child zone from ASC.... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20%28Public%29%20DNS%20zones%2FTSG%20-%20Azure%20DNS%20Delegation%20and%20Propagation) |
| 19 | DNS records not updating or showing intermittent resoluti... | Previous DNS hosting provider had high TTL valu... | 1) Use DigWebInterface with Trace+SOA option to... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20%28Public%29%20DNS%20zones%2FTSG%20-%20Azure%20DNS%20Delegation%20and%20Propagation) |
| 20 | Intermittent DNS resolution failures for a domain; resolu... | NS records for the domain are configured with I... | Customer must update NS records to use domain n... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20%28Public%29%20DNS%20zones%2FTSG%20-%20Azure%20DNS%20Delegation%20and%20Propagation) |
| 21 | FQDN resolution fails when DNS chain is VNet DNS -> Azure... | Both azure-api.net AND privatelink.azure-api.ne... | 1. Move all VNet links and DNS records from azu... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20DNS/DNS%20Private%20Resolver/Fqdn%20failing%20to%20resolve%20when%20resolution%20is%20through%20DNS%20private%20resolver) |
| 22 | DNS client receives NXDOMAIN or only the first CNAME of a... | Azure DNS Private Resolver is a recursive resol... | Ensure DNS Forwarding Ruleset contains forwardi... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20DNS/DNS%20Private%20Resolver/Private%20Resolver%20returns%20wrong%20response%20despite%20DNS%20server%20providing%20the%20correct%20A%20record) |
| 23 | CRUD operation fails when deploying DNS Private Resolver ... | Azure DNS Private Resolver is not available in ... | Check supported regions at https://learn.micros... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20DNS/DNS%20Private%20Resolver/TSG%3A%20Private%20Resolver%20-%20Troubleshooting%20CRUD%20issues) |
| 24 | Deletion of DNS Private Resolver outbound endpoint fails. | Outbound endpoints cannot be deleted unless the... | Delete in order: (1) Delete all VNet links from... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20DNS/DNS%20Private%20Resolver/TSG%3A%20Private%20Resolver%20-%20Troubleshooting%20CRUD%20issues) |
| 25 | DNS Private Resolver resource creation fails with IP addr... | IP address space 10.0.1.0 - 10.0.16.255 is rese... | Assign a subnet to the DNS resolver that does n... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20DNS/DNS%20Private%20Resolver/TSG%3A%20Private%20Resolver%20-%20Troubleshooting%20CRUD%20issues) |
| 26 | Creating an inbound or outbound endpoint fails with a sub... | The subnet delegated to DNS Private Resolver mu... | Create a dedicated subnet with /28 to /24 addre... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20DNS/DNS%20Private%20Resolver/TSG%3A%20Private%20Resolver%20-%20Troubleshooting%20CRUD%20issues) |
| 27 | Error when creating a DNS Forwarding Rule with 168.63.129... | Azure DNS IP (168.63.129.16) is explicitly proh... | Use a different DNS server IP as the forwarding... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20DNS/DNS%20Private%20Resolver/TSG%3A%20Private%20Resolver%20-%20Troubleshooting%20CRUD%20issues) |
| 28 | Connectivity to DNS Private Resolver inbound endpoint on ... | VNet encryption is enabled on the VNet hosting ... | Disable VNet encryption on the VNet hosting DNS... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20DNS/DNS%20Private%20Resolver/TSG%3A%20Private%20Resolver%20-%20Troubleshooting%20resolution%20issues) |
| 29 | DNS queries appear dropped at Private Resolver. Log messa... | That specific log message does NOT indicate thr... | Check DNSProxyEndpointInfo in Jarvis (Diagnosti... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20DNS/DNS%20Private%20Resolver/TSG%3A%20Private%20Resolver%20-%20Troubleshooting%20resolution%20issues) |
| 30 | Customer needs to increase Azure DNS limits: zones per su... | Default Azure DNS quotas enforced at subscripti... | (1) Max public DNS zones/sub: up to 10000 via A... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20DNS/Increasing%20Azure%20DNS%20related%20limits) |
| 31 | Customer unable to delete DNS public zone, receives 400 e... | Azure DNS safety check blocks deletion of deleg... | 1) Remove NS records (delegation) for the child... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20%28Public%29%20DNS%20zones%2FUnable%20To%20Delete%20DNS%20Zone) |
| 32 | Resource group deletion fails with ResourceGroupDeletionB... | The same dangling NS delegation safety check bl... | Attempt to delete the DNS zone individually fir... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20%28Public%29%20DNS%20zones%2FUnable%20To%20Delete%20DNS%20Zone) |
| 33 | Internal Azure customer's DNS name (e.g. *.cloudapp.azure... | Azure security team has sniped (taken over) the... | Run the Kusto query (datastudiostreaming/Shared... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20%28Public%29%20DNS%20zones%2FUnblocking%20internal%20dangling%20domains) |
| 34 | DNS public zone creation fails with 'The zone {name} is n... | Azure DNS enforces that a zone cannot share the... | Check existing zones via Kusto (azuredns.kusto.... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20%28Public%29%20DNS%20zones%2FZone%20is%20Not%20Available%20Error%20in%20Azure%20DNS) |
| 35 | DNS public zone creation fails with 'The zone {name} is n... | The desired zone name (or a parent/child with o... | Use Kusto (AzureDns/dnsbillingprod/ZoneEvent) t... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20%28Public%29%20DNS%20zones%2FZone%20is%20Not%20Available%20Error%20in%20Azure%20DNS) |
| 36 | Azure DNS public zone creation fails with HTTP 409 Confli... | ARM validates the requested zone name against t... | For customers who are not the rightful owner: c... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20%28Public%29%20DNS%20zones%2FZone%20is%20not%20permitted%20in%20Azure%20DNS) |
| 37 | Linking a Virtual Network to a Private DNS zone fails wit... | The VNet was deleted and recreated but the old ... | Customer must manually delete the stale Virtual... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20Private%20DNS%20zones%2FFailed%20to%20link%20Private%20DNS%20zone%20to%20Virtual%20Network%20due%20to%20reference%20to%20stale%20links) |
| 38 | Private Link resource name resolution fails with NXDOMAIN... | Private DNS zone returns authoritative NXDOMAIN... | Configure resolutionPolicy: NxDomainRedirect on... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20Private%20DNS%20zones%2FFeature%3A%20Fallback%20to%20Internet%20for%20Azure%20Private%20DNS%20zones) |
| 39 | Azure Private DNS Zone Auto Registration 未能为新建 VM 或 VMSS ... | VM/VMSS hostname 不合法：Windows VM hostname（截断到 15... | 重建 VM/VMSS 并使用合法的 hostname（Windows ≤15 字符且不以连字符... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20Private%20DNS%20zones%2FTroubleshooting%20Auto%20Registration%20FAILS%20due%20to%20unsupported%20VM%20Hostname) |
| 40 | 使用 Custom Windows DNS Server 时，Private DNS Zone 记录（包括 Pri... | Windows DNS Server 默认 forwarding timeout 为 3 秒，... | 在 Custom Windows DNS Server 上增大 forwarding time... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20Private%20DNS%20zones%2FTroubleshooting%20Private%20DNS%20Queries%20Timeouts%20with%20Custom%20Windows%20DNS%20Servers) |
| 41 | Azure DNS 记录配置的 TTL 超过 30 分钟，但查询时返回的 TTL 始终 ≤30 分钟（Public... | Azure DNS 递归解析器的最大缓存 TTL 被 PG 设置为 30 分钟（防止缓存长时间... | 这是预期行为，无需修复。向客户解释：Azure DNS resolver 会将 TTL 上限为... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FCommon%2FAzure%20DNS%20Records%20with%20TTL%20more%20than%2030%20minutes) |
| 42 | 客户收到安全通知，告知其某些子域处于 dangling 状态（CNAME 指向已删除的 Azure 资源）或已被其... | Azure 资源（如 Azure Web App）被删除时，对应的 DNS CNAME 记录未... | (1) 审查 DNS 记录中的悬空 CNAME，删除或重定向至有效资源；(2) 推荐使用 Az... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FCommon%2FDangling%20Domains%20%26%20Domain%20Takeovers) |
| 43 | Wildcard DNS 记录（如 *.contoso.com）对某特定子域（如 dev.contoso.com）... | 在该子域下存在更深层级的记录（如 www.dev.contoso.com），导致 dev.co... | 方案一：手动为 dev.contoso.com 创建一条显式记录（A/CNAME 等）；方案二... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FCommon%2FEmpty%20Response%20for%20Wildcard%20Domain) |
| 44 | 客户需要一次性修改 Azure DNS Zone 中所有 RecordSet 的 TTL 值 |  | 使用 Azure PowerShell: Login-AzAccount 后执行 Get-Az... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FCommon%2FHow%20to%20modify%20the%20TTL%20property%20of%20all%20RecordSets%20in%20an%20Azure%20DNS%20Zone%20at%20once) |
| 45 | DNS authoritative server 对 AAAA query 返回 NXDOMAIN，即使该名称存在... | Per RFC 2308 Section 5：NXDOMAIN 表示该名称（FQDN）不存在，... | 检查 authoritative DNS server 配置：若 A 记录存在但 AAAA 不... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FCommon%2FNXDOMAIN%20Responses) |
| 46 | Azure DNS (168.63.129.16) 对子域名查询返回 SERVFAIL (RCODE 2)。子域名... | NS record 将子域委托给一台仅托管父域的 server，该 server 对子域 SO... | 确保每个委托子域均有独立的 NS + SOA record，SOA 指向正确的 authori... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FCommon%2FQTYPES%20and%20RCODES) |
| 47 | 对 38 个或更多子域标签（label）的域名发起 DNS 查询，Azure DNS 返回 FORMERR (RC... | WinDNS bug：WinDNS（Azure RR.DNS 和 MSFT.RR 底层 res... | 临时缓解：将域名子域深度减少到 38 labels 以下。如需升级，向 Cloudnet/DN... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FCommon%2FQTYPES%20and%20RCODES) |
| 48 | Azure 公共 DNS Zone 突然停止解析，查询返回 REFUSED (RCODE 5) | DNS Zone 未部署到 DNS serving plane，或 subscription ... | (1) 检查 DNS Zone 是否仍正常部署（ASC > Providers > Micro... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FCommon%2FQTYPES%20and%20RCODES) |
| 49 | Ubuntu 18.04+ VM 无法解析 Azure Private DNS Zone 中的 *.local 域... | Ubuntu 18.04+ 默认将 /etc/resolv.conf 软链到 systemd-... | 重建 /etc/resolv.conf 软链到真实的 resolv.conf：(1) sudo... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FCommon%2FTSG%3A%20Troubleshooting%20resolution%20issues%20in%20Ubuntu) |
| 50 | Azure DNS / Private DNS 的 CRUD 操作（尤其是 ListRecordSet）收到 HT... | Azure DNS 按 subscription 限流（非按 Zone）。公开限制：每 5 分... | (1) 用 Kusto 确认：cluster('azuredns').database('cl... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FCommon%2FTSG%20-%20ListRecordSet%20Operations%20-%20Throttling%20429) |
| 51 | 从 Azure VM 访问 Private AKS cluster 时，Azure Portal FQDN（如 <... | VNet 链接了错误的 Private DNS Zone（如 '<region>.azmk8s... | (1) 在 ASC 检查是否有 '<region>.azmk8s.io' 或 'azmk8s.... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FCommon%2FTSG%20Troubleshooting%20No%20such%20name%20error%20for%20Azure%20Portal%20FQDN%20of%20a%20private%20AKS%20cluster) |
| 52 | DNS queries fail (nslookup fails, VM domain join fails) e... | Checkpoint firewall on-premises applies an impl... | Disable the implied DNS rule in Checkpoint fire... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FCommon%2FUDP%20works%20but%20not%20DNS) |
| 53 | DNS queries return SERVFAIL (RCODE 2); DNS resolver canno... | Upstream resolver timeout due to broken delegat... | 1) Query authoritative NS directly to bypass Az... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FCommon%2FUnderstanding%20Servfail%20DNS) |
| 54 | DNS resolution succeeds from outside Azure but fails with... | Authoritative nameserver (destination NS) is bl... | Confirm via Test-NetConnection <ns_ip> -port 53... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FCommon%2FUnderstanding%20Servfail%20DNS) |
| 55 | Random or intermittent DNS resolution failures on Azure V... | Azure VNet reserves UDP port 65330 for VxLAN tr... | Exclude UDP port 65330 from Windows dynamic por... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FCustom%20DNS%2FWindows%20DNS%20Network%20trace) |
| 56 | DNS name resolution fails across peered VNets - nslookup ... | VNet peering provides network-layer connectivit... | Option 1 (recommended): Create Azure Private DN... | 🟢 8.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/virtual-network-troubleshoot-peering-sync-route-issues) |
| 57 | P2S VPN client cannot resolve FQDNs of on-premises resour... | P2S VPN client uses Azure DNS servers configure... | Configure DNS Forwarders or Conditional Forward... | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-troubleshoot-vpn-point-to-site-connection-problems) |
| 58 | P2S VPN clients cannot resolve Private DNS zone records i... | Azure DNS IP 168.63.129.16 is only resolvable f... | Deploy Azure Private Resolver. Configure inboun... | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-troubleshoot-vpn-point-to-site-connection-problems) |
| 59 | VPN Gateway Key Vault access failures - token request fai... | VPN Gateway cannot access Key Vault due to: mis... | 1) Verify Key Vault accessibility and configura... | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/troubleshoot-digital-certificate-authentication) |
