---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure DNS/DNS Private Resolver/TSG How To Check Logs On Azure DNS Private Resolver"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20DNS/DNS%20Private%20Resolver/TSG%20How%20To%20Check%20Logs%20On%20Azure%20DNS%20Private%20Resolver"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Introduction

This page features various scenarios with explanations supported by packet captures and logs from Azure Private DNS and Azure DNS Private Resolver.

# Keep in mind

- Logs may take some time to populate (approximately 15 minutes). Be patient and avoid making changes to the environment unless you have concrete facts or evidence.
- Transaction ID is the key identifier used to correlate a DNS query with its corresponding response. In Wireshark it appears in hexadecimal (e.g., 0x1a2b) under `dns.id`. In logs, the Transaction ID is in decimal format.
- The `peerIpAddress` field identifies the DNS client that used the inbound endpoint as its DNS server, or the DNS server used by the outbound endpoint as defined in the DNS forwarding rule.
- To determine whether an endpoint is inbound or outbound, refer to the `endpointName` or `endpointId` field (Resource GUID of the endpoint).

# Log Sources Quick Reference

| Looking for | Jarvis Link | Required details |
|---|---|---|
| Azure DNS Private Resolver resolution logs | Diagnostics PROD > ManagedResolverProd > DnsProxyQuery | VNet ID of the Endpoint |
| Azure DNS Private Resolver performance logs | Diagnostics PROD > ManagedResolverProd > DnsProxyEndpointIdInfo | Endpoint GUID |
| Azure RR DNS (168.63.129.16) decision (Private DNS, Forwarding Ruleset or Edge) | Diagnostics PROD\PrivateDnsRr\IdnsPluginCacheScopeLookup, IdnsPluginServerScopeLookup | VNet ID (for Source Machine or the Inbound Endpoint) |
| Azure RR DNS (168.63.129.16) resolution | Diagnostics PROD\PrivateDnsRr\DnsQueryReceived, DnsQueryTimeout, DnsRecursiveQuery, DnsRecursiveResponse, DnsResponseFailure, DnsResponseSuccess | VNet ID, AZ VM ContainerID |
| Azure RR DNS (168.63.129.16) performance | Diagnostics PROD\LNMAgent\DnsForwarderEvent, VmDnsHealthEvent | Az NODE ID, AZ VM ContainerID |

# Scenarios

## Scenario 1: DNS Client targets the Inbound endpoint, VNet has a Private DNS Zone linked for the queried FQDN

**DNS FLOW:**
DNS Client Machine → Inbound Endpoint of Azure DNS Private Resolver → Azure Private DNS Zone

**Key ASC/Log mappings:**
- VNet ID for the Inbound Endpoint: ASC → Resolver → endpoint section → Subnet ID contains the VNet URI. Maps to `EDNSScopeName` in logs.
- Azure DNS Private Resolver Endpoint GUID: ASC → DNS Private Resolver → each endpoint has a unique Resource GUID. Maps to `endpointId` / `endpointName` in logs.

**Step 1** - Check if you see the DNS query in DnsProxyQuery logs. Filter by Transaction ID (dns.id in Wireshark decimal format).

- Jarvis: Diagnostics PROD > ManagedResolverProd > DnsProxyQuery (use VNet ID of the inbound endpoint)
- The resolution process using the inbound endpoint should have **4 steps** in the `message` column.
- If DNS query entry is not found in DnsProxyQuery, it may have been dropped by QPS (UDP or TCP) throttling on the Azure DNS Private Resolver Endpoint.
- Check for throttling using the Endpoint GUID ID: Diagnostics PROD > ManagedResolverProd > DnsProxyEndpointIdInfo

**Step 2** - Check Azure Private DNS Logs: What was the resolution outcome and how did Azure decide to use a Private DNS Zone for resolution?

- Jarvis: Diagnostics PROD\PrivateDnsRr\DnsQueryReceived, DnsQueryTimeout, DnsRecursiveQuery, DnsRecursiveResponse, DnsResponseFailure, DnsResponseSuccess
- Note: The `EDNSCorrelationTag=00000000-0000-0000-0000-000000000000` indicates Azure DNS Private Resolver Instance (not a regular Azure VM; regular VMs would show the VM containerID).
- Jarvis: Diagnostics PROD\PrivateDnsRr\IdnsPluginCacheScopeLookup, IdnsPluginServerScopeLookup (for DNS decision)

## Scenario 2: DNS Client targets Inbound Endpoint on a VNet without a matching Private DNS Zone, but with a Forwarding Ruleset rule

**DNS FLOW:**
DNS Client Machine → Inbound Endpoint Azure DNS Private Resolver → Azure DNS Private Resolver Ruleset → Outbound Endpoint → DNS Server on the Rule of the forwarding ruleset

**Key ASC/Log mappings:**
- VNet ID for the Inbound Endpoint: same as Scenario 1 → `EDNSScopeName`
- Endpoint GUID → `endpointId` / `endpointName`

**Steps:**
1. Check DnsProxyQuery logs: Diagnostics PROD > ManagedResolverProd > DnsProxyQuery (use VNet ID of inbound endpoint)
2. For throttling details or total query counts, use the Endpoint GUID in DnsProxyEndpointIdInfo: Diagnostics PROD > ManagedResolverProd > DnsProxyEndpointIdInfo
3. Check Azure Private RR DNS resolution logs: Diagnostics PROD\PrivateDnsRr\DnsQueryReceived, DnsQueryTimeout, DnsRecursiveQuery, DnsRecursiveResponse, DnsResponseFailure, DnsResponseSuccess

## Scenario 3: DNS Client uses Azure Provided DNS (168.63.129.16) with a DNS Private Resolver Forwarding Ruleset linked to their VNet

**DNS FLOW:**
DNS Client Machine → Azure Provided DNS (168.63.129.16) → Azure DNS Private Resolver Ruleset → Outbound Endpoint → DNS Server specified in the Rule

**Key ASC/Log mappings:**
- Azure VM: ContainerId, NodeId, Provider Address (Node IP). ContainerId maps to `EDNSCorrelationTag`
- VNet ID for the DNS Client VM: ASC VM → Network section → ASC VNet → VNet Id field. Maps to `EDNSScopeName`
- Azure Private Resolver Endpoint GUID: maps to `endpointId` / `endpointName`

**Steps:**
1. Check Azure Private DNS RR decision logs to see how Azure decided to route the query.
2. Check packet captures at the DNS client to verify resolution path.
3. Check Azure Private RR DNS resolution logs for the full resolution chain.
4. Check DNS Private Resolver DnsProxyQuery logs for outbound endpoint activity.
