---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/How To/BGP Route Propagation Gateway Subnet"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20ExpressRoute/How%20To/BGP%20Route%20Propagation%20Gateway%20Subnet"
importDate: "2026-04-18"
type: troubleshooting-guide
---

# BGP Route Propagation Gateway Subnet

[[_TOC_]]

## Description

An on-premises network gateway can exchange routes with an Azure virtual network gateway using the border gateway protocol (BGP). Using BGP with an Azure virtual network gateway is dependent on the type you selected when you created the gateway. If the type you selected were:

- ExpressRoute: You must use BGP to advertise on-premises routes to the Microsoft Edge router. You can't create user-defined routes to force traffic to the ExpressRoute virtual network gateway if you deploy a virtual network gateway deployed as type: ExpressRoute. You can use user-defined routes for forcing traffic from the Express Route to, for example, a Network Virtual Appliance.
- VPN: You can, optionally use BGP. For details, see [BGP with site-to-site VPN connections](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-bgp-overview?toc=/azure/virtual-network/toc.json).

When you exchange routes with Azure using BGP, a separate route is added to the route table of all subnets in a virtual network for each advertised prefix. The route is added with Virtual network gateway listed as the source and next hop type.

ER and VPN Gateway route propagation can be disabled on a subnet using a property on a route table. When route propagation is disabled, routes aren't added to the route table of all subnets with Virtual network gateway route propagation disabled (both static routes and BGP routes). Connectivity with VPN connections is achieved using custom routes with a next hop type of Virtual network gateway. **Route propagation shouldn't be disabled on the GatewaySubnet. The gateway will not function with this setting disabled.** For details, see How to disable Virtual network gateway route propagation.

## Important!

**Route propagation shouldn't be disabled on the GatewaySubnet. The gateway will not function with this setting disabled.**

## ASC

If the customer has disabled BGP route propagation on the gateway subnet, it will look like the following in ASC: 

![disable bgp route propagation from asc](/.attachments/image-feb4181a-4e83-45bd-a73c-b22bf2d62af8.png)


- Disable BGP Route Propagation : True 
- Subnets: GatewaySubnet

## Solution

On the route table associated with the gateway subnet, have the customer set disable bgp propagation to false. 

- Disable BGP Route Propagation : False

*Note: If the customer has other subnets associated to the route table, they may have to create a new route table with only the gateway subnet if this is needed on other subnets.*

## Public Documentation: 

[Virtual Network UDR Overview](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-udr-overview#border-gateway-protocol)

![public documentation that references this shouldn't be allowed on gateway subnet](/.attachments/image-5089bfa8-bdb3-451a-b0c2-9624b80f17c4.png)


# Contributors
- @<F84DD2EA-3ED8-6E71-BBD4-86A47F7D8B78>