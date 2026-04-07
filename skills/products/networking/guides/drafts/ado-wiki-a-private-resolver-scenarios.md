---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure DNS/DNS Private Resolver/Private Resolver Scenarios"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20DNS/DNS%20Private%20Resolver/Private%20Resolver%20Scenarios"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

# Introduction
A successful hybrid networking strategy demands DNS services that work seamlessly across on-premise and cloud networks. Azure Managed Resolver service provides recursive resolution and conditional forwarding service for Azure virtual networks. Using this service customer will be able to resolve DNS names hosted in Azure DNS private zones from on premise networks as well as DNS queries originating from Azure virtual networks can be forwarded to a customer specified destination server to resolve them.

# Scenarios
## On-Premise to Azure
Contoso corporation has recently migrated an internal purchase order application from on-premise servers to Azure. The application is multi-tiered and hosted in an Azure virtual network using VMSS. Contoso corporation has a hub-spoke network topology in Azure with ExpressRoute based connectivity between their on-premise network and Azure environment. The application is hosted in one of the spoke virtual networks. Users access the application through browsers by typing the FQDN purchaseorder.contoso.com for the application in the address bar of the browser. The record purchaseorder.contoso.com is a CNAME to purchaseorder.prod.devops.contoso.com.

In order to move all devops operations into Azure and host prod.devops.contoso.com DNS zones with Azure DNS private zone along with other devops zones, the customer sets up an Azure Managed Resolver instance in the hub virtual network and links the prod.devops.contoso.com private DNS zone to the hub virtual network. They then configure the on-premise resolver with a conditional forwarding rule that sends the queries for prod.devops.contoso.com to the IP address of Azure Managed Resolver.

The Managed Resolver can be reached from the customer's on premises network over Express Route and the Managed Resolver has internal connectivity to Azure. The Managed Resolver contacts Azure Private DNS resolver to resolve the query and sends the answer to the on-premise resolver which in turn sends it to client machine. The users are now able to access the purchase order application.

See Also: Using Managed Resolver API to implement On-Premises to Azure scenario

## Azure to On-Premises
Contoso corporation has recently migrated an internal timesheet application from on-premise servers to Azure. The application is multi-tiered and hosted in an Azure virtual network using Azure Web Apps instance injected into virtual network. The application authenticates the user using Windows Active directory which is hosted on on-premise domain controllers. Contoso corporation has a hub-spoke network topology in Azure with ExpressRoute based connectivity between their on-premise network and Azure environment. The application is injected into one of the spoke virtual networks.

Customer deploys Azure Managed Resolver instance in the hub virtual network and configures it as the default DNS server for the spoke vnet (where application is injected). The customer then configures the Managed Resolver with a conditional forwarding rules to send all DNS queries for Active Directory domains to the on-prem domain controllers.

When a DNS query for on-prem zones lands at the Managed Resolver, it matches the query against the conditional forwarding rules and determines that the query must be forwarded to the on-prem domain controller. The Domain controller resolves the query and sends the answer back to Managed Resolver which in turn sends it back to the WebApp.

See Also: Using Managed Resolver API to implement Azure to On-Premises scenario

## Azure to Azure
Fabrikam banking corporation has dozens of data processing applications on-premise and intends to move these to Azure. The customer intends to leverage Azure HDInsight product for data analytics.

Fabrikam banking corporation has a hub and spoke deployment model in Azure with shared services like Active Directory and DNS servers deployed in hub virtual network and every spoke is expected to consume these service over the vnet-peering.

The HDInsight application in each spoke virtual network requires access to zones managed by Domain Controllers, zones managed by the hub DNS servers as well as internal zones (*.internal.cloudapp.net).

Customer deploys an instance of Managed Resolver in every virtual network hosting HDInsight clusters.

Customer deploys a Azure Managed Resolver instance in each spoke virtual network and configures it as the default DNS server for the spoke vnet (where application is injected). The customer then configures the Managed Resolver with a conditional forwarding rules to send all DNS queries for Active Directory domains to the on-prem domain controllers.

See Also: Using Managed Resolver API to implement Azure to Azure scenario
