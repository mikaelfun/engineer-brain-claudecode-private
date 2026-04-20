---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/How To/ExpressRoute Private Peering Datapath"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20ExpressRoute/How%20To/ExpressRoute%20Private%20Peering%20Datapath"
importDate: "2026-04-18"
type: troubleshooting-guide
---

[[_TOC_]]

## ExpressRoute Datapath

Customers can have complex environments where they have multiple ExpressRoute circuits and multiple ExpressRoute gateways connecting different Azure virtual networks and services.

The following with help you identify the datapath when using ExpressRoute with private peering. 

**Quickly narrowing down where in the datapath we need to investigate further will greatly reduce TA time to review and customer frustrations going forward with the case.**

Traditional Datapath: 

![datapath from on-premise to azure and vice versa](/.attachments/image-0eab991c-8d26-4950-b466-15b5087f98d6.png)

### FastPath Datapath

ExpressRoute virtual network gateway is designed to exchange network routes and route network traffic. FastPath is designed to improve the data path performance between your on-premises network and your virtual network. When enabled, FastPath sends network traffic directly to virtual machines in the virtual network, bypassing the gateway.

![fastpath datapath bypass gateway completely](/.attachments/image-a32579bf-36fb-4961-b364-f06a8c4e1958.png)

#### How to Confirm FastPath Enabled/Disabled

From the connection object in ASC, you will be able to see if FastPath is enabled or disabled.

![image.png](/.attachments/image-9432c232-74b5-4ee8-8ca9-3b5a4f9584a6.png)

### Private Link & FastPath (Public Preview)

Private Link traffic sent over ExpressRoute FastPath will bypass the ExpressRoute virtual network gateway in the data path.

This preview is available for connections associated to ExpressRoute Direct circuits. Connections associated to ExpressRoute partner circuits aren't eligible for this preview. Additionally, this preview is available for both IPv4 and IPv6 connectivity.

![private link with fastpath bypassing gateway in and out](/.attachments/image-c85d5bbd-108d-49c9-b430-d8040cb5974f.png)

### Private Link Datapath

![private link datapath with routing through gateway in and out of Azure](/.attachments/image-9459363b-988e-4c55-938a-94fde61b6858.png)

# Contributors
- @<F84DD2EA-3ED8-6E71-BBD4-86A47F7D8B78>
