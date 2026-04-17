---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACR/How Tos/ACR Private Link"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20Private%20Link"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# ACR Private Link

[[_TOC_]]

## What is Azure Private Link

Azure Private Link enables you to access Azure PaaS Services (for example, Azure Storage and SQL Database) and Azure hosted customer-owned/partner services over a private endpoint in your virtual network.

Traffic between your virtual network and the service travels the Microsoft backbone
network. Exposing your service to the public internet is no longer necessary. You can create your own private link service in your virtual network and deliver it to your customers. Setup and consumption using Azure Private Link is consistent across Azure PaaS, customer-owned, and shared partner services.

**Azure Private Endpoint** is a network interface that connects you privately and securely to a service powered by Azure Private Link. You can use Private Endpoints to connect to an Azure PaaS service that supports Private Link or to your own Private Link Service.

### Azure Private Endpoint Details

1. Private endpoint enables connectivity between the consumers from the same VNet, regionally peered VNets, globally peered VNets and on premises using VPN or Express Route and services powered by Private Link.

1. Network connections can only be initiated by clients connecting to the Private endpoint, Service providers do not have any routing configuration to initiate connections into service consumers. Connections can only be establish in a single direction.

1. When creating a private endpoint, a read-only network interface is also created for the lifecycle of the resource. The interface is assigned dynamically private IP addresses from the subnet that maps to the private link resource. The value of the private IP address remains unchanged for the entire lifecycle of the private endpoint.

1. The private endpoint must be deployed in the same region as the virtual network.

1. The private link resource can be deployed in a different region than the virtual network and private endpoint.

1. Multiple private endpoints can be created using the same private link resource. For a single network using a common DNS server configuration, the recommended practice is to use a single private endpoint for a given private link resource to avoid duplicate entries or conflicts in DNS resolution.

1. Multiple private endpoints can be created on the same or different subnets within the same virtual network. There are limits to the number of private endpoints you can create in a subscription. For details, seeAzure limits.

Public Documentation: <https://docs.microsoft.com/en-us/azure/private-link/private-endpoint-overview#dns-configuration>

**Azure Private Link Service** is a service created by a service provider. Currently, a Private Link service can be attached to the frontend IP configuration of a Standard Load Balancer.

### What is the relationship between Private Link service and Private Endpoint?

Private Endpoint provides access to multiple private link resource types, including Azure PaaS services and your own Private Link Service. It is a one-to-many relationship. One Private Link service can receive connections from multiple private endpoints. On the other hand, one private endpoint can only connect to one Private Link service.

### DNS configuration

When connecting to a private link resource using a fully qualified domain name (FQDN) as part of the connection string, it's important to correctly configure your DNS settings to resolve to the allocated private IP address. Existing Azure services might already have a DNS configuration to use when connecting over a public endpoint. This needs to be overridden to connect using your private endpoint.

The network interface associated with the private endpoint contains the complete set of information required to configure your DNS, including FQDN and private IP addresses allocated for a given private link resource.

For complete detailed information about best practices and recommendations to configure DNS for Private Endpoints, please review [Private Endpoint DNS configuration article](https://docs.microsoft.com/en-us/azure/private-link/private-endpoint-dns).

#### Custom DNS Configurations for ACR Private Link and different Scenarios

1. Introduction - <https://github.com/dmauser/PrivateLink/tree/master/DNS-Integration-Scenarios#1-introduction>
2. How DNS resolution works before and after Private Endpoints - <https://github.com/dmauser/PrivateLink/tree/master/DNS-Integration-Scenarios#2-how-dns-resolution-works-before-and-after-private-endpoints>
3. Azure Virtual Network DNS Integration - <https://github.com/dmauser/PrivateLink/tree/master/DNS-Integration-Scenarios#3-azure-virtual-network-dns-integration>
    1. Private DNS resolution within VNET - <https://github.com/dmauser/PrivateLink/tree/master/DNS-Integration-Scenarios#31-private-dns-resolution-within-the-vnet>
    2. Private DNS resolution between VNETs - <https://github.com/dmauser/PrivateLink/tree/master/DNS-Integration-Scenarios#32-private-dns-resolution-between-vnets>
    3. Private DNS resolution with Custom DNS inside the VNET - <https://github.com/dmauser/PrivateLink/tree/master/DNS-Integration-Scenarios#33-private-dns-resolution-with-custom-dns-inside-the-vnet>
4. On-Premises DNS integration - <https://github.com/dmauser/PrivateLink/tree/master/DNS-Integration-Scenarios#4-on-premises-dns-integration>
   1. Which conditional forwarder zone should be used? - <https://github.com/dmauser/PrivateLink/tree/master/DNS-Integration-Scenarios#41-which-conditional-forwarder-zone-should-be-used>
5. Architecture Design Example - <https://github.com/dmauser/PrivateLink/tree/master/DNS-Integration-Scenarios#5-architecture-design-example>
6. Validating DNS Resolutions - <https://github.com/dmauser/PrivateLink/tree/master/DNS-Integration-Scenarios#7-appendix-a---validating-dns-resolution>

## Connect privately to an Azure container registry using Azure Private Link

Setting up ACR Private Link is mentioned at <https://docs.microsoft.com/en-us/azure/container-registry/container-registry-private-link>

1. Disable the private-endpoint-network-policy on the subnet where Private Endpoint will be created.
2. Create Private DNS Zone with privatelink.azurecr.io
3. Create an association between Private DNS Zone and VNET where Client machine is hosted.
4. Create Private Registry End Point.
   - This creates 2 IPs from the subnet and assigns to the NIC created in step 4.
5. Now update the DNS zone with the IPs (Create A Record).

## Testing

Perform `nslookup <registryname>.azurecr.io` and it should resolve to Private IP.

### Useful References

* [Azure Private Endpoint DNS configuration](https://docs.microsoft.com/en-us/azure/private-link/private-endpoint-dns)
* [Logging and Monitoring](https://docs.microsoft.com/en-us/azure/private-link/private-link-overview#logging-and-monitoring)
* [FAQs](https://docs.microsoft.com/en-us/azure/private-link/private-link-faq)
