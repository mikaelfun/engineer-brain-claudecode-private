---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/AppLens/Determine if a web app is using VNET integration"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FAppLens%2FDetermine%20if%20a%20web%20app%20is%20using%20VNET%20integration"
importDate: "2026-04-05"
type: troubleshooting-guide
---

#Overview
___
This article covers the steps to determine whether a web app hosted on App Services uses VNET integration. It walks through finding the associated VNET/subnet and DNS settings for said web app.

#Considerations
___
For information specific to VNET integration, see [Integrate your app with an Azure virtual network](https://learn.microsoft.com/azure/app-service/overview-vnet-integration)

#Workflow
___
1. Start Applens
1. Add the case number and name of App Service web app
1. In the detectors filter type in "VNET Integration Information" to locate the detector.
1. This detector will show you the following:
   - The name of the subnet and its associated web app are visible.
   - The full resource URI of the VNET that hosts the subnet can be found here.

1. Next, go to ASC, navigate to Microsoft.Network/virtualNetworks. Locate the name of the VNET you identified on AppLens.
1. Check DNS settings:
   - Shows a list of private IP addresses next to 'DNS Servers' → the VNET (and all subnets) is using custom DNS servers.
   - Shows 'Default (Azure-Provided)' → Azure DNS Service is being used.

#Public Documentation
___
- [Integrate your app with an Azure virtual network](https://learn.microsoft.com/azure/app-service/overview-vnet-integration)
- [What is Azure DNS?](https://learn.microsoft.com/azure/dns/dns-overview)
- [What is IP address 168.63.129.16?](https://learn.microsoft.com/azure/virtual-network/what-is-ip-address-168-63-129-16)

#Internal References
___
- NA

___
Last Modified: October 22, 2024
Last Modified By: matthofa
