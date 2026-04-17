---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Troubleshooting Guides (TSGs)/Security and Access Control/Private Endpoints/Overview"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTroubleshooting%20Guides%20(TSGs)%2FSecurity%20and%20Access%20Control%2FPrivate%20Endpoints%2FOverview"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Private Endpoint Overview

Network traffic between the clients on the VNet and the Purview account traverses over the VNet and a private link on the Microsoft backbone network, eliminating exposure from the public internet.

When creating a private endpoint, a read-only network interface is also created for the lifecycle of the resource. The interface is assigned dynamically private IP addresses from the subnet that maps to the private link resource.

> NOTE: If the customer is using their own DNS server there are two options:
> 1. Create and maintain all DNS A-records for such as {account}.catalog.purview.azure.com, {account}.scan.purview.azure.com, etc
> 2. Set up a DNS conditional forwarding rule for purview.azure.com to Azure DNS 168.63.129.16

## Data Exfiltration Protection

- Private Endpoint maps a specific PaaS resource to an IP address (rather than the entire service)
- Restricts access to the mapped PaaS resource
- Offers built-in data exfiltration protection

## Service Endpoints vs Private Endpoints

- **Service Endpoint**: Uses Public IP Addresses on the VNET via Microsoft Backbone
- **Private Endpoint**: Uses Private IP Addresses on the VNET via Microsoft Backbone

## Connection Approval Methods

- **Automatically** approved when you own or have permission on the specific private link resource
- **Manual** request when you don't have permission — creates PE in "Pending" state, resource owner must approve

## Configure DNS Settings for Private Endpoints

- Private DNS Zone linked to Virtual Network to resolve specific domains. VNET needs to be paired to DNS Zone.
- Custom DNS Server needs DNS Forwarding Rule to use the DNS Private DNS Zone.

Reference: https://docs.microsoft.com/en-us/azure/purview/catalog-private-link-name-resolution
