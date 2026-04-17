---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure DNS/DNS Private Resolver/DNS Private Resolver FAQ"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FDNS%20Private%20Resolver%2FDNS%20Private%20Resolver%20FAQ"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# DNS Private Resolver FAQ

[[_TOC_]]

## What is an Inbound Endpoint?

An inbound endpoint enables name resolution **from on-premises or other private locations** into Azure via an IP address in your private VNET address space.

- Requires a dedicated subnet in the VNET (no other services; delegated to `Microsoft.Network/dnsResolvers`)
- DNS queries **ingress** to Azure via this endpoint
- Can resolve Private DNS Zones (including auto-registered VMs and Private Link services)

## What is an Outbound Endpoint?

An outbound endpoint enables **conditional forwarding** name resolution from Azure to on-premises, other cloud providers, or external DNS servers.

- Requires a dedicated subnet in the VNET (no other services; delegated to `Microsoft.Network/dnsResolvers`)
- DNS queries **egress** from Azure via this endpoint

## What is a Virtual Network Link?

Virtual Network Links enable name resolution for VNETs linked to an outbound endpoint via a DNS Forwarding Ruleset.

- Relationship: **1:1** (one VNet link per outbound endpoint)

## What is a DNS Forwarding Ruleset?

A DNS Forwarding Ruleset is a group of DNS Forwarding Rules (up to **1,000 rules**) applied to:
- One or more Outbound Endpoints, **or**
- One or more Virtual Networks

Relationship: **1:N**

## What is a DNS Forwarding Rule?

A DNS Forwarding Rule specifies:
- **Domain name** to match
- **Target DNS server(s)**: IP address, port, and protocol (UDP or TCP)

Used for conditional forwarding to on-premises or external DNS resolvers.

---

## Virtual Network Restrictions

> ⚠️ Key constraints to know for troubleshooting:

- DNS resolver can **only reference a VNet in the same region** as the DNS resolver
- A VNet **cannot be shared** between multiple DNS resolvers (1:1 per resolver)
