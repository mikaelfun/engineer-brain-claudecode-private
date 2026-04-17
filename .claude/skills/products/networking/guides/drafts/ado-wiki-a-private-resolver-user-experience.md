---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure DNS/DNS Private Resolver/Private Resolver User Experience"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20DNS/DNS%20Private%20Resolver/Private%20Resolver%20User%20Experience"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

# Introduction  
This document describes how Managed Resolver Resources are used by the customer to implement Managed Resolver Scenarios.

# On-Premises to Azure
Contoso corporation has recently migrated an internal purchase order application from on-premise servers to Azure. The application is multi-tiered and hosted in an Azure virtual network using VMSS. Contoso corporation has a hub-spoke network topology in Azure with ExpressRoute based connectivity between their on-premise network and Azure environment. The application is hosted in one of the spoke virtual networks. Users access the application through browsers by typing the FQDN `purchaseorder.contoso.com` for the application in the address bar of the browser. The record `purchaseorder.contoso.com` is a CNAME to `purchaseorder.prod.devops.contoso.com`.

In order to move all devops operations into Azure and host `prod.devops.contoso.com` DNS zones with Azure DNS private zone along with other devops zones, the customer sets up an Azure Managed Resolver instance in the hub virtual network and links the `prod.devops.contoso.com` private DNS zone to the hub virtual network. They then configure the on-premise resolver with a conditional forwarding rule that sends the queries for prod.devops.contoso.com to the IP address of Azure Managed Resolver.

In this scenario, a user in the on-premises network wants to access a purchase order application that is running in Azure. The default DNS resolver in the on-premises network must handle other queries but forward queries for the private zone in which the application is registered to Azure Private DNS Resolver.

1. Customer delegates a dedicated subnet to Managed Resolver
     1. Customer creates a subnet `snet-resolver` in the Hub virtual network `vnet-hub`.
     1. Customer follows the Subnet Delegation process to delegate `snet-resolver` to `Microsoft.Networks/managedResolvers`
1. Customer creates a DnsResolver in their Hub virtual network
     1. Customer creates a DnsResolver `mres-hub` and associates it with the ARM resource Id of `vnet-hub`
     1. Customer Creates an InboundEndpoint `iep-hub` and provides the ARM resource Id of `snet-resolver`
          - The InboundEndpoint returned by the previous operation contains the `privateIpAddress` that has been assigned from the address space of `snet-resolver`
1. Customer configures the resolver in their on-premise network
     1. Creates a RecordSet `purchaseorder.contoso.com => CNAME purchaseorder.devops.contoso.com` in the on-premise authoritative DNS server.
     1. Configures a forwarding rule `devops.contoso.com => privateIpAddress` in their on-premise recursive resolver

When the user tries to access the PurchaseOrder application, which is running in a VM in the network `vnet-spoke`, a DNS query for `purchaseorder.contoso.com` is issued to determine the IP address of the application. This query is sent to the default resolver for the On-Premises network.

The on-premises resolver receives the query and finds that the query does not match any conditional forwarding rules. So, the query is sent to the authoritative DNS server in the on premises network. The response is a CNAME `purchaseorder.devops.contoso.com`. It then tries to resolve `purchaseorder.devops.contoso.com`. Now, the conditional rule matches and the query is sent to `privateIpAddress` associated with the InboundEndpoint `iep-hub`.

The query reaches Private DNS resolver and is resolved to the IP address of the purchase order application running in a VM in `vnet-spoke`.

# Azure to On-Premises
Contoso corporation has recently migrated an internal timesheet application from on-premise servers to Azure. The application is multi-tiered and hosted in an Azure virtual network using Azure Web Apps instance injected into virtual network. The application authenticates the user using Windows Active directory which is hosted on on-premise domain controllers. Contoso corporation has a hub-spoke network topology in Azure with ExpressRoute based connectivity between their on-premise network and Azure environment. The application is injected into one of the spoke virtual networks.

In this scenario, the user needs to authenticate to a Timesheet application that is running in a virtual network in Azure. However, the domain controller that can authenticate the user is running in an on-premise network. Private DNS resolver is the default DNS resolver for the virtual network - It must resolve other queries but forward queries for zones managed by the DC to the server running in the on-premise network.

1. Customer delegates a dedicated subnet to Managed Resolver
    1. Customer creates a subnet `snet-resolver` in the Hub virtual network `vnet-hub`.
    1. Customer follows the Subnet Delegation process to delegate `snet-resolver` to `Microsoft.Networks/managedResolvers`
1. Customer creates a DnsResolver in their Hub virtual network
    1. Customer creates a DnsResolver `mres-hub` and associates it with the ARM resource Id of `vnet-hub`.
    1. Customer Creates an OutboundEndpoint `oep-hub` and provides the ARM resource Id of `snet-resolver`.
1. Customer sets up conditional forwarding rules for Spoke virtual network
    1. Customer creates a DnsForwardingRuleset `rs-spoke` and provides the ARM resource Id of `oep-hub`.
    1. Customer links the Spoke VirtualNetwork `vnet-spoke` to `rs-spoke`.
    1. Customer creates a ForwardingRule `login.contoso.com` in the ruleset `rs-spoke`
       - `targetDnsServers` array has one entry with the IP address and port of the DomainController.
1. Customer configures the On-Premise network.
    1. vnet-hub and On-Premise Network are connected by Express Route or VPN.
    1. Customer sets an allow rule to allow traffic from `snet-resolver`

When the user tries to authenticate with the Timesheet application, which is running in a VM in the network `vnet-spoke`, a DNS query for `login.contoso.com` is issued to determine the IP address of the DomainController. This query is sent to the address `168.63.129.16` which is the default DNS server for `vnet-spoke`.

Private DNS Resolver receives the query in the context of `vnet-spoke` and finds that DnsForwardingRuleset `rs-spoke` is associated with `vnet-spoke`. In the RuleSet `rs-spoke` it finds a ForwardingRule with the name `login.contoso.com`.

The ForwardingRule `login.contoso.com` specifies the IP address of the DomainController as the target DNS server. The DnsForwardingRuleset `rs-spoke` has the ARM resource Id of the OutboundEndpoint `oep-hub` that must be used to send the query to customer on premises network.

The query is sent through the outbound endpoint and reaches the firewall in the customer's onpremises network (through ExpressRoute or VPN). The firewall is configured to allow traffic coming from IP addresses in `snet-resolver`. The DomainController handles the DNS query and the response traverses the reverse path.

# Azure to Azure
Fabrikam banking corporation has dozens of data processing applications on-premise and intends to move these to Azure. The customer intends to leverage Azure HDInsight product for data analytics.

Fabrikam banking corporation has a hub and spoke deployment model in Azure with shared services like Active Directory and DNS servers deployed in hub virtual network and every spoke is expected to consume these service over the vnet-peering.

The HDInsight application in each spoke virtual network requires access to zones managed by Domain Controllers, zones managed by the hub DNS servers as well as internal zones (*.internal.cloudapp.net).

Customer deploys an instance of Managed Resolver in every virtual network hosting HDInsight clusters.

Customer deploys a Azure Managed Resolver instance in each spoke virtual network and configures it as the default DNS server for the spoke vnet (where application is injected). The customer then configures the Managed Resolver with a conditional forwarding rules to send all DNS queries for Active Directory domains to the on-prem domain controllers.

1. Customer delegates a dedicated subnet in `vnet-hub` to Managed Resolver
    1. Customer creates a subnet `snet-hubresolver` in the Hub virtual network `vnet-hub`.
    1. Customer follows the Subnet Delegation process to delegate `snet-resolver` to `Microsoft.Networks/managedResolvers`
1. Customer delegates a dedicated subnet in `vnet-spoke` to Managed Resolver
    1. Customer creates a subnet `snet-spokeresolver` in the Hub virtual network `vnet-hub`.
    1. Customer follows the Subnet Delegation process to delegate `snet-resolver` to `Microsoft.Networks/managedResolvers`
1. Customer creates a DnsResolver in their Hub virtual network
    1. Customer creates a DnsResolver `mres-hub` and associates it with the ARM resource Id of `vnet-hub`.
    1. Customer Creates an OutboundEndpoint `oep-hub` and provides the ARM resource Id of `snet-hubresolver`.
1. Customer creates a DnsResolver in their Spoke virtual network
    1. Customer creates a DnsResolver `mres-spoke` and associates it with the ARM resource Id of `vnet-spoke`.
    1. Customer Creates an InboundEndpoint `iep-spoke` and provides the ARM resource Id of `snet-spokeresolver`.
    1. Customer configures the `privateIpAddress` of the inbound endpoint as the default DNS Server for `vnet-spoke`
1. Customer sets up conditional forwarding rules for Spoke virtual network
    1. Customer creates a DnsForwardingRuleset `rs-spoke` and provides the ARM resource Id of `oep-hub`.
    1. Customer links the Spoke VirtualNetwork `vnet-spoke` to `rs-spoke`.
    1. Customer creates a ForwardingRule `login.fabrikam.com` in the ruleset `rs-spoke`
       - `targetDnsServers` array has one entry with the IP address and port of the Active Directory Domain Controller in `vnet-hub`.
    1. Customer creates a ForwardingRule `fabrikam.com` in the ruleset `rs-spoke`
       - `targetDnsServers` array has one entry with the IP address and port of the DNS Server in `vnet-hub`.

When a VM that belongs to the HDInsight cluster issues a DNS query, it is routed to the `privateIpAddress` of iep-spoke as that is the default DNS Server for `vnet-spoke`.

Private DNS Resolver receives the query and performs one of the following actions:

- If the query matches `*.internal.cloudapp.net`, it is resolved as a private zone query for the `internal.cloudapp.net` zone associated with `vnet-spoke`.
- If the query matches `*.login.fabrikam.com`, it is sent to the Active Directory Domain Controller that is running in `vnet-hub`.
- If the query matches `*.fabrikam.com`, it is sent to the DNS Server running in `vnet-hub`.
