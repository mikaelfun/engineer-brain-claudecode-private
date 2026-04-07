---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure DNS/Common/Log Sources for Azure DNS"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FCommon%2FLog%20Sources%20for%20Azure%20DNS"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Log Sources for Azure DNS

> This page covers some log sources for Azure DNS zones, Private DNS zones and InternalDNS.

# ASC Log Sources

## Azure DNS zones (Azure Support Center)
### HowTo: View Azure DNS zones in ASC
_Providers -> Microsoft.Network -> dnszones_

**Diagnostics > Log Sources > Zone Data** (Refers to *JarvisLogs > CloudDnsFEProd > FrontendOperationsEtwEvent*)

**Diagnostics > Log Sources > Query Statistics** (Refers to JarvisLogs > DNSEdge)

**Diagnostics > Log Sources > Edge Dashboards** (Refers to: ProdEdgeDashboard: https://portal.microsoftgeneva.com/dashboard/CloudDns/Edge_PerfCounters/ProdEdgeDashboard_AllEnv)

## Azure Private DNS zones (Azure Support Center)
### HowTo: View Azure Private DNS zones in ASC
_Providers -> Microsoft.Network -> privatednszones_

- Retrieve RecordSets: via ASC or Jarvis Actions: https://portal.microsoftgeneva.com/1FEE5901?genevatraceguid=aa843bbb-0940-4163-9d53-8103d219fcc1
- Control Plane Link: *JarvisLogs > PrivateDNSControlPlane > FrontendOperationsEtwEvent*
- **Diagnostics > Log Sources > Zone Control Plane Logs** (*JarvisLogs > PrivateDNSControlPlane > QosEtwEvent*)
- **Diagnostics > Log Sources SLA Dashboard**: https://portal.microsoftgeneva.com/dashboard/PrivateDnsControlPlane/SLA%2520Dashboard

### HowTo: View Azure DNS Private Resolver in ASC
_Providers -> Microsoft.Network -> dnsResolvers_
- Inbound Endpoints: _Providers -> Microsoft.Network -> dnsResolvers/inboundEndpoints_
- Outbound Endpoints: _Providers -> Microsoft.Network -> dnsResolvers/outboundEndpoints_

### HowTo: View Azure DNS ForwardingRuleSet in ASC
_Providers -> Microsoft.Network -> dnsForwardingRulesets_

---

# Jarvis Log Sources

## Azure DNS zones

### Control Plane: **CloudDnsFEProd > FrontendOperationsEtwEvent**

**Description:** API calls to CloudDNS. Similar to `NRP>FrontendOperationsEtwEvent`.

[Jarvis Link](https://portal.microsoftgeneva.com/s/B2CBFDB9)

**Filtering Conditions:**
- `RequestSubscriptionId`: SubscriptionId for the Azure DNS zone
- `ResourceGroupname`: Azure DNS zone's resource group
- `ZoneName`: Azure DNS zone name

**Useful fields:** `OperationName`, `Message`, `RecordSetName`, `ClientCorrelationId`

---

### Resolution: **DnsServingPlaneProd**

**Description:** DNS queries and answers for Azure Public DNS zones.

> ⚠️ **Important**: This log is extremely inefficient due to global nature of Azure DNS zones and tends to throttle. Request specific timestamp and region from customer.

[Jarvis Link](https://portal.microsoftgeneva.com/s/36B17632)

**Scoping:** `Service == WATM` or `Role == EdgeCloudDNS`

**Filtering:** `QuestionName` (FQDN being resolved), `Zone` (Public DNS Zone name)

---

### Resolution: **Per Zone Queries Dashboard**

Shows public zone queries per second over time.

[Jarvis Dashboard](https://jarvis-west.dc.ad.msft.net/dashboard/share/38295EB5?overrides=[{"query":"//*[id='CustomerResourceId']","key":"value","replacement":""}])

**Scoping:** `CustomerResourceId`: the DNS zone resource URI

---

### Deployment Details: **DnsBilling > ZoneEvent**

**Description:** Look up subscription, resource group, or bucket info for a given public DNS zone name.

[Jarvis Link](https://portal.microsoftgeneva.com/s/8422E48B)

**Filtering:** `ZoneName`

**Useful fields:**
- `SubscriptionId`, `ResourceGroup`
- `BucketId` (in Hex — convert to decimal to find NS server number: nsx-\<bucket\>.azure-dns.xxx)

---

## Azure Private DNS

### Control Plane: **PrivateDnsControlPlane > FrontendOperationsEtwEvent**

[Jarvis Link](https://portal.microsoftgeneva.com/s/AB2409E2)

**Filtering:** `RequestSubscriptionId`, `ResourceGroupname`, `ZoneName`

**Useful fields:** `OperationName`, `Message`, `RecordSetName`, `ClientCorrelationId`

**PrivateDnsControlPlane > ArgClientRequestCompletedEvent**
- Identifies successfully completed updates to Azure Resource Graph from Private DNS service
- **Filtering:** `RequestData` (resource URI for the DNS Zone or record)
- **Useful fields:** `CorrelationId`, `Status` (should be Success)

---

### Resolution: **PrivateDnsRr**

**Description:** DNS queries and responses received and processed by Azure Recursive Resolver (RR).

> ⚠️ **Important**: Source VM/VNet is the one forwarding to 168.63.129.16. If customer uses custom DNS server forwarding to 168.63.129.16, use that VM's info for filtering.

[Jarvis Link](https://portal.microsoftgeneva.com/s/DFC93765)

**Scoping:** `Region` (Azure Region for the source VNet)

**Filtering:**
- `QNAME`: FQDN being resolved. When using `==`, include trailing dot: `QNAME == contoso.com.`
- `EDNSScopeName`: Source VNet's VNETID/Resource GUID
- `NodeIp`: Filter by `Anyfield` — appears in `Source` for QUERY_RECEIVED, `Destination` for RESPONSE_SUCCESS/FAILURE

**Useful fields:**
- `PacketData`: Encoded DNS packet (use DNS PacketData parser extension to decode)
- `GUID`: Unique identifier for a DNS "conversation" — use to correlate query + answer
- `KeywordName`: Type of DNS packet (QUERY_RECEIVED, RESPONSE_SUCCESS, RESPONSE_FAILURE, RECURSE_QUERY_DROP, etc.)
- `RCODE`: Response code (0=NOERROR, 2=SERVFAIL, 3=NXDOMAIN, etc.)
- `QTYPE`: Decimal TypeID for record type (1=A, 28=AAAA, 5=CNAME, etc.)
- `TCP`: Boolean — is request TCP or UDP?
- `EDNSScopeName`: VNet ID — if Private DNS A record resolves to public IP, check this field

---

### Deployment Details: **PrivateDNSBilling > ZoneEventUsage**

[Jarvis Link](https://portal.microsoftgeneva.com/s/AF956105)

**Scoping:** `Region`
**Filtering:** `zoneName`
**Useful fields:** `subscriptionId`, `resourceGroup`, `CurrentVirtualNetworkLinkCount`, `CurrentVirtualNetworkLinkWithRegistrationCount`

---

## Managed Resolver (DNS Private Resolver)

### Resolution: **DnsProxyEndpointInfo**

[Jarvis Link](https://portal.microsoftgeneva.com/s/8F3973AC)

**Scoping:** `Region`
**Filtering:** `ProviderGuid`, `endpointName` (from ASC inbound endpoint Resource Guid)
**Useful fields:**
- `InboundQueryThrottledInflightUdp/Tcp`: >0 indicates throttling
- `InboundQueryTimedoutUDP`: High value = backend VMSS overutilized

### Resolution: **DnsProxyQuery**

[Jarvis Link](https://portal.microsoftgeneva.com/s/DBF2D0AB)

**Scoping:** `Region`
**Filtering:** `vnetId` (VNet ID for private resolver virtual network)
**Useful fields:** `qName`, `qType`

---

## Azure Internal DNS

For log sources on iDNS records registration/management, see:
[How iDNS records get registered in Azure](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/137927/How-iDNS-records-get-registered-in-Azure)

---

## Azure Forwarder: LNMAgent/ForwarderEvents

### DNSForwarderEvents

**Description:** Statistics for queries forwarded to Azure Recursive Resolver from a Host.

[Jarvis Link](https://portal.microsoftgeneva.com/s/51F094A8)

**Scoping:** `Cluster`, `NodeID`, `NodeIP` (available from ASC or NetVMA)
**Filtering:** `ContainerId`

**Useful fields:**
- `QueriesSent|Udp|Tcp`: Confirms VM is forwarding to 168.63.129.16
- `ExtendedStats`: Overall counters per minute
- `QueriesDroppedByQpsFilter|Udp|Tcp`, `QueriesDroppedByInFlightFilter|Udp|Tcp`: Drops due to throttling limits

### WarmPath: **DnsForwarderWarmPath/DnsForwarderQueryTimeoutEvent**

Records late responses from PrivateDnsRr back to DNSForwarder. If query resolved in PrivateDnsRr but shows here → data path issue between components.

[Jarvis Link](https://portal.microsoftgeneva.com/s/6069AD75)

**Scoping:** `Cluster`, `NodeID`, `NodeIP`
**Filtering:** `ContainerId`, `QNAME` (with trailing dot when using ==)

---

## Azure DNS Security Policy

### IdnsPluginCacheScopeLookup

Determines whether a matching policy and action were applied.

[Jarvis Link](https://portal.microsoftgeneva.com/s/699C31D7)

**Scoping:** `Region`
**Filtering:** `message` field containing the FQDN being queried

### DNSResponseLog

Available when customer has enabled **Query Logging** on security policy.

[Jarvis Link](https://portal.microsoftgeneva.com/s/D7981F7A)

**Scoping:** `Region`
**Filtering in Properties field:** `Subscription ID`, `QueryName`, `"query_type":"SRV"` (example)
**Available fields:** subscription ID, Region, VNET ID, Query_Name, Query_Type, Response Code, Answer, RData, srcipaddr, srcport, dstipaddr, dstport, ResolutionPolicy_id, Action, domain list matched

---

# Kusto Log Sources

## VM Container Lookup

**Cluster:** `azureeee.eastus.kusto.windows.net` / database `Projects`

```kusto
cluster('azureeee.eastus.kusto.windows.net').database('Projects').GetVmContainer('<subid>','<vmname>',30d)
```

## DNS Resources (Azure Resource Graph)

```kusto
cluster('argwus2nrpone.westus2.kusto.windows.net').database('AzureResourceGraph').DnsResources
| where managedBy contains 'contoso.com'
```

## Common - VM Container Lookup (Multi-cluster join)

**Clusters needed:** AzureCM, aznwcc, aznwsdn

```kusto
let subid = "00000000-0000-0000-0000-000000000000";
let vmname = dynamic(['vmName01','vmName02']);
let startTime = ago(30d);
let endTime = now();
cluster('AzureCM.kusto.windows.net').database("AzureCM").LogContainerSnapshot
| where TIMESTAMP between(startTime..endTime)
| where subscriptionId =~ subid
| where roleInstanceName has_any(vmname)
// ... (join with aznwcc, aznwsdn for node/network details)
```

## Managed Resolver Kusto Clusters

- **cluster:** `Managedresolver.westus2.kusto.windows.net` / database `ManagedresolverProd`
- Tables: `FrontendQos`, `FrontendAsyncQos`, `Frontend`, `EndpointProvisionerQos`, `EndpointProvisionerAsyncQos`, `EndpointProvisioner`, `GatewayQos`
- Filter by `ActivityId` (x-ms-activity-id response header)

## iDNS & Private DNS Auto-registration

```kusto
// Find DHCP/DNS auto-registration events by MAC address
cluster('azurecm.kusto.windows.net').database('AzureCM').NsmDhcpv4OnHostStatusEtwTable
| where TIMESTAMP between(startTime..endTime)
| where Region == location
| where MacAddress == MAC
```

## Azure DNS Public Zones (Control Plane) Kusto

- **Public:** `azuredns.kusto.windows.net` / database `clouddnsprod` / table `FrontendOperationsEtwEvent`
- **Billing:** `dnsbillingprod/ZoneEvent` (BucketId in Hex — use HexToInt to convert)
- **Mooncake:** `azurednsmc.chinaeast2.kusto.chinacloudapi.cn` (use Kusto Desktop, Security: dsts-Federated)
- **Fairfax:** `azurednsff.usgovvirginia.kusto.usgovcloudapi.net`

---

## DnsQueryTool Interface (Internal Tool)

Confirms DNS resolution of a hostname from a specific VNet:

[DnsQueryTool Interface](https://digwebinterface.azurewebsites.net/PrivateDigQuery/PrivateSearch?hostnames=contoso.com&additionaloptions=&vnetId=00000000-0000-0000-0000-000000000000&queryrecord=ANY&region=canadacentral)

Required inputs: QNAME, VNETID, Azure Region, Query type (optional)

---

# Dashboards

## CloudDNS Shoebox

https://portal.microsoftgeneva.com/dashboard/CloudDNSShoebox/Shoebox

**QueryVolume Count by ResourceID:**
https://portal.microsoftgeneva.com/dashboard/share/B561896A

> ⚠️ Telemetry refresh rate: 2 hours by design.
