---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure DNS/Azure Private DNS zones/Feature: DNS security policy"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20Private%20DNS%20zones%2FFeature%3A%20DNS%20security%20policy"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

# DNS Security Policy

## Overview

DNS security policy is an object that contains monitoring settings for DNS query logging which can be applied to one or more Virtual Networks. DNS security policy offers two main capabilities:

**Filtering**: 
DNS security policy offers the ability to filter DNS queries at the VNet level. You can allow, alert, or block name resolution of known or malicious domains and gain insight into your DNS traffic. 

**Logging**:
Detailed DNS logs can be sent to a storage account, log analytics workspace, or event hubs.

## Security Policy concepts

- **DNS traffic rules**: A set of predefined criteria or policies used to manage and control the flow of DNS queries and responses within a VNet. Rules can be enabled or disabled.
- **Virtual network links**: Enable the policy on VNets linked to a DNS security policy. 1-to-1 relationship: one security policy per VNet.
- **DNS domain lists**: A collection of domain names grouped for a specific purpose (e.g., DNS filtering).

## Limitations

- DNS security policy can reference a VNet in the **same region** only.
- DNS security policy cannot be deleted unless all VNet links under it are deleted.
- Only one DNS security policy can be linked to a given VNet.

## Troubleshooting

### ASC

DNS security policy appears in ASC as resource type: `Microsoft.Network/dnsResolverPolicies/`

`Virtual Network Links` and `DNS Security rules` appear under this resource type in their corresponding blades.

### Logging

DNS Security policy uses the **same Frontend API implementation as DNS Managed Resolver** — they share the same logging space.

- Kusto: [Log Sources for Azure DNS: Managed Resolver - Frontend API](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/448501/Log-Sources-for-Azure-DNS?anchor=managed-resolver---frontend-api)
- Jarvis: [Log Sources for Azure DNS: DNS Security Policy](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/448501/Log-Sources-for-Azure-DNS?anchor=azure-dns-security-policy)

## Additional details

- [Filter and view DNS traffic - Azure DNS | Microsoft Learn](https://review.learn.microsoft.com/en-us/azure/dns/dns-traffic-log-how-to)
- [Overview of DNS security policy (Preview) | Microsoft Learn](https://review.learn.microsoft.com/en-us/azure/dns/dns-security-policy)
