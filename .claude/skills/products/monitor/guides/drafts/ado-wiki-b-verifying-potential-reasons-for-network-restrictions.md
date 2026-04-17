---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Validate Network Connectivity/Verifying potential reasons for network restrictions"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/How-To/Validate%20Network%20Connectivity/Verifying%20potential%20reasons%20for%20network%20restrictions"
importDate: "2026-04-05"
type: troubleshooting-guide
---

[[_TOC_]]

#Overview
___
This article is going to walk you through scenarios where we've identified a network restriction is in place and is most likely the reason behind missing telemetry in Application Insights. 

#Considerations
___
- Before going over this reading, you should have started by identifying a network restriction by running network connectivity tests. See: [Test Basic Connectivity to Application Insight Endpoints](/Application-Insights/How%2DTo/Validate-Network-Connectivity/Test-Basic-Connectivity-to-Application-Insight-Endpoints)
- This article will focus on Azure-based networking. For on-premises network restrictions, visibility using tools like Azure Support Center or AppLens non-existing, so we will rely heavily on the customer and their networking team to find where in the network are outbound connections being dropped. 

#Workflow
___
1. Identify the hosting platform for the suspect web app: Azure VMs, App Services, etc. 

1. Inspect networking aspects based on the hosting platform: 
   - If using Azure VMs, find that VM resource in ASC (found under 'Microsoft.Compute/virtualMachines' RP) and inspect the 'Network Profile' under VM Base Properties. You should be able to find the VNET/subnet related aspects in there.

   - If using Azure App Services, including web apps or functions, you will need to inspect the App Service Plan being used by the app. See: [Locate service plan of App Service web app](/Application-Insights/How%2DTo/AppLens/Locate-service-plan-of-App-Service-web-app)

      - If the plan is Standard or Premium, this means that customer is more than likely using VNET integration to control outbound network connectivity. In that case, follow this: [Determine if a web app is using VNET integration](/Application-Insights/How%2DTo/AppLens/Determine-if-a-web-app-is-using-VNET-integration) to get VNET/subnet details.
      - If the plan is Isolated, this means that customer is using an App Service Environment (ASE). To find details about their VNET/subnet, see this: [Find out associated VNET for ASE-hosted web apps](/Application-Insights/How%2DTo/AppLens/Find-out-associated-VNET-for-ASE%2Dhosted-web-apps)

1. Now that you've found the VNET/subnet details related to the suspect app, you can take some time to inspect potential aspects that could lead to finding the reason behind a network connectivity restriction. Start by finding the VNET hosting the subnet. These resource types should be found under the 'Microsoft.Network/virtualNetworks" RP. Once there, you should be able to find the subnet you're looking for under 'Subnets'

   For each subnet listed, you can find associated Network Security Groups (NSG) and Route Tables. Both of these could play a factor behind connectivity problems: 
      1. A NSG outbound rule could be preventing connections to the 'AzureMonitor' service tag or perhaps the connections to our endpoints could be falling under a default 'Deny All' security rule. These security rules can be inspected by navigating to the NSG resource in ASC (under 'Microsoft.Network/networkSecurityGroup') and finding the section called 'Security Rules'.

      1. A Route Table could also have a default route (a route to match everything that was not matched by previous routes) to forward all data/traffic to some next hop IP address represented by an Azure Firewall or some other network appliance that could be responsible for dropping the connections unexpectedly. To inspect this resource, navigate to the route table associated to the subnet, which should be found under 'Microsoft.Network/routeTables' and inspect the 'Routes' section. 
         
         Sometimes, it may be helpful to filter all the routes and find that default route that could be suspect to our issue.

1. At this point in the investigation, we're beyond the realm of an Azure Monitoring support investigation. The hope is that with this information, we can provide insights/clues to customers to investigate further on their network infrastructure. Questions like the ones below can go a long way and even get customers to find their own issues and resolve them: 

   1. _Can we validate if the associated NSG is not filtering out unexpected connections?_ 
   1. _Can we validate what's behind the next hop IP address in the default route? Is it some Azure Firewall or load balancer? Can we ensure that our endpoints and outbound connections have been whitelisted as expected?_

   **Note:** Remember, the goal is never to have customers rely on support for every issue, but to empower them to find answers whenever they can.

1. If even after sharing these details with the customer, they aren't able to find anything on their end to explain the connectivity problems. It's time to engage Azure Networking on a collaboration to help us drive through this conversation and ask the right questions to get the right answers. 

#Public Documentation
___
- [Integrate your app with an Azure virtual network](https://learn.microsoft.com/azure/app-service/overview-vnet-integration)
- [ASE dedicated environments](https://learn.microsoft.com/azure/app-service/environment/intro)
- [What is Azure Virtual Network?](https://learn.microsoft.com/azure/virtual-network/virtual-networks-overview)
- [Add, change, or delete a virtual network subnet](https://learn.microsoft.com/azure/virtual-network/virtual-network-manage-subnet?tabs=azure-portal)
- [Network security groups](https://learn.microsoft.com/azure/virtual-network/network-security-groups-overview)
- [Create, change, or delete a route table](https://learn.microsoft.com/azure/virtual-network/manage-route-table)

#Internal References
___
- [Test Basic Connectivity to Application Insight Endpoints](/Application-Insights/How%2DTo/Validate-Network-Connectivity/Test-Basic-Connectivity-to-Application-Insight-Endpoints)
- [Determine if a web app is using VNET integration](/Application-Insights/How%2DTo/AppLens/Determine-if-a-web-app-is-using-VNET-integration)
- [Locate service plan of App Service web app](/Application-Insights/How%2DTo/AppLens/Locate-service-plan-of-App-Service-web-app)
- [Find out associated VNET for ASE-hosted web apps](/Application-Insights/How%2DTo/AppLens/Find-out-associated-VNET-for-ASE%2Dhosted-web-apps)

___
Last Modified: 2024/04/19
Last Modified By: nzamoralopez
