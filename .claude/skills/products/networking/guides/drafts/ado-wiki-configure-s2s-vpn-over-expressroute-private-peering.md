---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/How To/Configure S2S VPN over ExpressRoute Private Peering"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20ExpressRoute/How%20To/Configure%20S2S%20VPN%20over%20ExpressRoute%20Private%20Peering"
importDate: "2026-04-18"
type: troubleshooting-guide
---

#Configure S2S VPN over ExpressRoute Private Peering

[[_TOC_]]

## Overview

Some customers will have the requirement to encrypt traffic over ExpressRoute.  This wiki will go over how to use the Azure VPN Gateway to encrypt traffic over ExpressRoute. 

I have also included an example of how a previous customer accomplished this scenario.

**Note**: S2S VPN configuration over ExpressRoute circuit can get complicated due to the routing, so this setup should be advised only if the customer needs it. ExpressRoute circuits do not encrypt traffic, but it is a secure private connection as the connectivity doesn't go over the public Internet.

Customers can configure a Site-to-Site VPN to a virtual network gateway over an ExpressRoute private peering using an RFC 1918 IP address. This configuration provides the following benefits:

- Traffic over private peering is encrypted.

- Point-to-site users connecting to a virtual network gateway can use ExpressRoute (via the Site-to-Site tunnel) to access on-premises resources.

- It's possible to deploy Site-to-Site VPN connections over ExpressRoute private peering at the same time as Site-to-Site VPN connections via the Internet on the same VPN gateway.

This feature is available for the following SKUs:

- VpnGw1AZ, VpnGw2AZ, VpnGw3AZ, VpnGw4AZ, VpnGw5AZ with standard public IP with one or more zones.

**Note**: This feature is supported on gateways with a standard public IP only.

**Note**: When troubleshooting IPSEC establishment, VPN gateway packet captures will NOT show IKE SA inits leaving the gateway or anything coming in. MSEE packet captures will be needed to confirm. IKE logs will show the outbound IKE SA inits

## Prerequisites

To complete this configuration, please verify that your customer meets the following prerequisites:

- Customer has a functioning ExpressRoute circuit that is linked to the VNet where the VPN gateway is (or will be) created.

- Customer can reach resources over RFC1918 (private) IP in the VNet over the ExpressRoute circuit.

## Routing

###Traffic from on-premises networks to Azure
For traffic from on-premises networks to Azure, the Azure prefixes are advertised via both the ExpressRoute private peering BGP, and the VPN BGP. The result is two network routes (paths) toward Azure from the on-premises networks:

- One network route over the IPsec-protected path.

- One network route directly over ExpressRoute without IPsec protection.

- To apply encryption to the communication, customer must make sure that the on-prem network prefers Azure routes via the on-premises VPN gateway over the direct ExpressRoute path.

###Traffic from Azure to on-premises networks
The same requirement applies to the traffic from Azure to on-premises networks. To ensure that the IPsec path is preferred over the direct ExpressRoute path (without IPsec), customer has two options:

- Advertise more specific prefixes on the VPN BGP session for the VPN-connected network. Customer can advertise a larger range that encompasses the VPN-connected network over ExpressRoute private peering, then more specific ranges in the VPN BGP session. For example, advertise 10.0.0.0/16 over ExpressRoute, and 10.0.1.0/24 over VPN.

- Advertise disjoint prefixes for VPN and ExpressRoute. If the VPN-connected network ranges are disjoint from other ExpressRoute connected networks, customer can advertise the prefixes in the VPN and ExpressRoute BGP sessions respectively. For example, advertise 10.0.0.0/24 over ExpressRoute, and 10.0.1.0/24 over VPN.

In both of these examples, Azure will send traffic to 10.0.1.0/24 over the VPN connection rather than directly over ExpressRoute without VPN protection.

**Note**: If customer advertises the same prefixes over both ExpressRoute and VPN connections, Azure will use the ExpressRoute path directly without VPN protection.

## How To

Below is an example of VPN connectivity over ExpressRoute private peering. In this example, you see a network within the on-premises network that is connected to the Azure hub VPN gateway over ExpressRoute private peering. An important aspect of this configuration is the routing between the on-premises networks and Azure over both the ExpressRoute and VPN paths.

![S2S VPN over ExpressRoute with private peering figure](/.attachments/S2SVPNoverEXRprivatepeeringfigure.png)  

Establishing connectivity is straightforward:

1. Establish ExpressRoute connectivity with an ExpressRoute circuit and private peering.

2. Establish the VPN connectivity using the steps mentioned in this public document: https://learn.microsoft.com/en-us/azure/vpn-gateway/site-to-site-vpn-private-peering?toc=%2Fazure%2Fexpressroute%2Ftoc.json#portal 

As the document mentions, the first step here is to enable Gateway Private IPs. This will assign a private IP (obtained from the Gateway subnet) to the VPN GW's interface. This private IP is used as a remote IP by the customer to configure their on-premises firewall and establish S2S VPN connection over ExpressRoute private peering.

The customer will then need to enable "Use Azure Private IP Addresses" on the S2S VPN connection object, this will ensure that the S2S VPN connection uses Azure VPN GW's private IP to establish the VPN tunnel over ExpressRoute private peering.

**Note**: The document doesn't mention about the LNG (Local Network Gateway) configuration, just like how we enable Gateway Private IPs on the Azure VPN GW, the customer needs to assign a private IP from RFC 1918 to their on-premises VPN device (make sure that the private IP doesn't overlap with Azure VNet prefixes). This IP is then used as the Gateway IP in the LNG configuration.

If the customer wants to enable BGP on the S2S VPN connection, then please refer this public document: https://learn.microsoft.com/en-us/azure/vpn-gateway/bgp-howto 

## Example

Here is an example from one of my customers' cases. In this example, the customer configured S2S VPN with BGP over ExpressRoute private peering.

![S2S VPN over ExpressRoute with private peering drawing](/.attachments/S2SVPNoverEXRprivatepeeringdrawing.png) 

As you can see in the above example, first the customer configured ExpressRoute circuit private peering with 192.168.1.0/30 and 192.168.1.4/30 address prefixes. Once the ExpressRoute private peering configuration is complete, the MSEE BGP peers and on-prem BGP peers exchange address prefixes.

If you notice, the customer is advertising 192.168.2.0/30 from on-prem over the ExpressRoute and this range includes the IP 192.168.2.2 which is configured on the on-prem firewall's outside interface and will be used for S2S VPN tunnel on the on-prem side. Since Gateway Private IPs is enabled, the Azure VPN GW receives the tunnel IP 10.48.100.169 from the gateway subnet.

The customer then configures the LNG in Azure using the tunnel private IP (192.168.2.2), BGP IP (192.168.3.1) and ASN (65514) configured on the on-prem firewall. Similarly, on the on-prem side, the customer will use the Azure VPN GW's tunnel IP (10.48.100.169), BGP IP (10.48.100.164) and ASN (65515) to configure the S2S VPN connection with BGP.

Once the tunnel is setup properly and BGP peers are configured, the BGP session should go into established state and you can use ASC to verify BGP peers connectivity state by navigating to the VPN GW. Alternatively, you can also check the BGP peer status using this Jarvis action: https://portal.microsoftgeneva.com/E8E9845?genevatraceguid=a9ce2097-4e53-4a8e-8ef7-7d778e09d419 

![S2S VPN over ExpressRoute with private peering BGP peer state](/.attachments/S2SVPNoverEXRprivatepeeringBGPpeerstate.png) 

The next step is to verify routes learned by VPN GW via the on-prem S2S VPN BGP peer 192.168.3.1, as you can see below the Azure VPN GW learns 5 routes from 192.168.3.1. Since the customer is advertising disjoint prefixes over ExpressRoute and VPN, Azure will use the VPN connection to reach the 5 prefixes below. Alternatively, you can also check the BGP routes learned by a gateway using this Jarvis action: https://portal.microsoftgeneva.com/203D59A1?genevatraceguid=a9ce2097-4e53-4a8e-8ef7-7d778e09d419

![S2S VPN over ExpressRoute with private peering BGP learned routes](/.attachments/S2SVPNoverEXRprivatepeeringBGPlearnedroutes.png)

Lastly, verify Azure VPN GW advertised routes to on-prem BGP peer. As you can see below, the Azure VPN GW advertises all Azure VNet prefixes to on-prem BGP peer. Alternatively, you can also check the BGP routes advertised by a gateway using this Jarvis action: https://portal.microsoftgeneva.com/7781E641?genevatraceguid=a9ce2097-4e53-4a8e-8ef7-7d778e09d419

![S2S VPN over ExpressRoute with private peering BGP advertised routes](/.attachments/S2SVPNoverEXRprivatepeeringBGPadvertisedroutes.png)

# Contributors

@<A150E600-1D77-67C8-A858-E58849A3AFE1>
