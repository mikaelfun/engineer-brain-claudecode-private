---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure DNS/Azure Private DNS zones/Azure Private DNS"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20Private%20DNS%20zones%2FAzure%20Private%20DNS"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure Private DNS — Overview & Reference

[[_TOC_]]

## Description

The Domain Name System, or DNS, is responsible for translating (or resolving) a service name to its IP address. Azure DNS is a hosting service for DNS domains, providing name resolution using the Microsoft Azure infrastructure. In addition to supporting internet-facing DNS domains, Azure DNS also supports private DNS zones.

## Feature Overview

Azure Private DNS provides a reliable, secure DNS service to manage and resolve domain names in a virtual network without the need to add a custom DNS server. By using private DNS zones, customers can use their own custom domain names rather than the default Azure-provided names available today.

Main advantages over custom DNS servers:
1. **Reduced costs**: No need to run multiple VMs for DNS resolution.
2. **Fully Managed Service**: No need to maintain, monitor and patch DNS servers.
3. **Greater Agility**: Integration with devops pipelines via SDK/Templates/PS/CLI.
4. **Scale & Performance**: Cloud-level scale and name resolution performance.

### Terminology

* **Registration Virtual Network**: VNet linked to a private DNS zone with auto-registration enabled. VMs auto-register DNS records and can also resolve records in the zone.
* **Resolution Virtual Network**: VNet linked with auto-registration disabled. VMs can resolve records but do not auto-register.
* **Virtual Network Link**: Sub-resource of privateDnsZones. Represents a link between a VNet and a private DNS zone.

### Private DNS Zone Migration

When initially shipped, Azure DNS private zones were created through `dnszones` ARM resource. This was subsequently changed — private DNS zones now have a dedicated top-level ARM resource called `privateDnsZones`. All new features are on `privateDnsZones` only.

Customers using old `dnszones` resource may see:
* Unable to link a non-empty VNet with a private DNS zone
* Unable to see auto-registered VM DNS records
* Unable to link more than one registration VNet
* Unable to link more than 10 resolution VNets
* Cannot create more than 5000 DNS records

**Resolution**: Point customer to [Migration guide](https://docs.microsoft.com/azure/dns/private-dns-migration-guide).

### Integration with WebApps/AppService injected into VNet

Injected PaaS services (WebApps/AppService) work through P2S VPN and cannot access private DNS zones directly.

**Workaround**: Use a stateless DNS forwarder VM in the VNet, configured to forward queries to 168.63.129.16 (Azure DNS resolver). Set the forwarder's IP as custom DNS server on the VNet.

### Limitations & Restrictions

**Name Server Delegation**
* NS Records are not supported for Private DNS Zones — cannot delegate subdomains. Instead, create the subdomain as a new private DNS zone and link it to the VNet.
* Reserved zone names: `internal.cloudapp.net`, `azureprivatedns.net`, `reddog.microsoft.com` (and all subdomains).

**Reverse DNS**
* Supported only for Private IP spaces for linked VNets.
* Resolution VNet only → PTR resolves to VM.internal.cloudapp.net
* Registration VNet → PTR resolves to VM.private.zone

**Zone Names**
* A VNet can be linked to private zones that are sub-zones of each other (longest match governs resolution).
* A VNet cannot be linked to multiple private zones with the same name.

**Virtual Network Link Names**
* Each VNet link name must be unique within the context of a private zone.

**Suspended Subscriptions**
* Control plane operations rejected on suspended subscriptions. Serving plane stops serving queries but backfill continues. Resources resume normal operation when subscription is unsuspended.

### Limits

| Limits | Default GA | Extension upon Request |
|--|--|--|
| Zones per subscription | 1000 | 5000 |
| Record sets per zone | 25,000 | 100,000 |
| Records per record set | 20 | 20 |
| Virtual Network Links per Zone | 1000 | 5000 |
| VNet Links with auto-registration enabled | 100 | 250 |
| Private Zones a VNet can link with auto-registration | 1 | 1 |
| Private Zones a VNet can link (total) | 1000 | 2000* |

### Public Service SLA

| SLA | Value |
|-|-|
| Control Plane Availability | 99.9% |
| Serving Plane Availability | 100% |
| Customer record propagation | 30 seconds |
| VM record propagation | 45 seconds |

### Internal Service SLA (NOT for customer sharing)

| API | QPS | Client latency | Sync latency | Async latency |
|-|-|-|-|-|
| PutPrivateZone | 5.3 | ~2.4s | ~2.1s | ~20s |
| DeletePrivateZone | 5.3 | ~2.4s | ~2.1s | ~20s |
| PutVirtualNetworkLink | 8.5 | ~2.9s | ~2.7s | ~34s |

- Private DNS Query resolution: 200ms worst case
- Propagation: 2 minutes
- GA date: 2019-10-08

## Troubleshooting and Tools

### Azure Support Center

Private DNS zones and VNet links are visible in ASC Resource Explorer. ASC provides links to PrivateDnsControlPlane → QosEtwEvent.

**Note**: Private DNS control plane does NOT go through NRP. Control plane events are in `FrontendOperationEtwEvent` (PrivateDnsControlPlane namespace). Can also filter on `ClientCorrelationId` (= ARM correlationId) in FrontendOperationEtwEvent.

### Log Filtering

Filter on `RequestUri` containing the resource URI:
`/subscriptions/{subId}/resourceGroups/{rg}/providers/Microsoft.Network/privateDnsZones/{zoneName}`

Or filter on `ClientCorrelationId` (same as ARM correlationId).

## Public Documentation

* [Overview](https://docs.microsoft.com/azure/dns/private-dns-overview)
* [Scenarios](https://docs.microsoft.com/en-us/azure/dns/private-dns-scenarios)
* [FAQ](https://docs.microsoft.com/azure/dns/dns-faq-private)
* [PowerShell](https://docs.microsoft.com/azure/dns/private-dns-getstarted-powershell)
* [CLI](https://docs.microsoft.com/azure/dns/private-dns-getstarted-cli)
* [REST API](https://docs.microsoft.com/rest/api/dns/privatedns/privatezones)
