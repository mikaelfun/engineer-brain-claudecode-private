---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/Features and Functions/Azure VMware Solution (AVS) - Network topologies"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20ExpressRoute/Features%20and%20Functions/Azure%20VMware%20Solution%20(AVS)%20-%20Network%20topologies"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure VMware Solution (AVS) Network Topologies

## Overview

This article outlines common network topologies used to establish connectivity between Azure VMware Solution (AVS) infrastructure and on-premises environments, as well as between AVS infrastructure and Azure resources.

## AVS connecting to on-premises via ExpressRoute Global Reach

An ExpressRoute gateway does not support transitive routing between connected circuits; therefore, on-premises connectivity to Azure VMware Solution can be achieved with Global Reach.

> **Note:** [More details about Global Reach](https://learn.microsoft.com/en-us/azure/azure-vmware/tutorial-expressroute-global-reach-private-cloud)

## AVS connecting to on-premises via supernet design topology

Use when:
- Customer requires AVS traffic to be inspected by an NVA/Azure Firewall.
- ExpressRoute Global Reach is not available in a particular region.

**Solution:**
- Both on-premises and AVS ExpressRoute circuits must be connected to the same ExpressRoute gateway
- Traffic must be hairpinned through an NVA capable of performing the required routing
- The NVA should advertise a supernet to Azure VMware Solution and on-premises ExpressRoute Circuits
- Azure Route Server will advertise all supernet prefixes to both circuits
- UDRs in the GatewaySubnet, matching exactly the prefixes advertised by AVS and on-premises, cause hairpin traffic from GatewaySubnet to the NVA

> **Note:** [More details about supernet design topology](https://learn.microsoft.com/en-us/azure/azure-vmware/architecture-network-design-considerations#supernet-design-topology)

## AVS connecting to on-premises via Transit spoke virtual network topology

If advertising prefixes that are less specific is not possible, an alternative design uses two separate virtual networks:
- Two different NVAs in separate virtual networks can exchange routes between each other
- The virtual networks can propagate these routes to their respective ExpressRoute circuits via BGP through Azure Route Server
- Each NVA has full control over which prefixes are propagated to each ExpressRoute circuit

> **Note:** [More details about transit spoke virtual network topology](https://learn.microsoft.com/en-us/azure/azure-vmware/architecture-network-design-considerations#transit-spoke-virtual-network-topology)

## AVS connecting to on-premises via S2S VPN in vWAN

The vWAN hub contains the Azure VMware Solution ExpressRoute gateway and the site-to-site VPN gateway. It interconnects an on-premises VPN device with an Azure VMware Solution endpoint.

> **Note:** [In a traditional environment, to enable transit routing between ExpressRoute and Azure VPN, an Azure Route Server will be required](https://learn.microsoft.com/en-us/azure/expressroute/how-to-configure-coexisting-gateway-portal#to-enable-transit-routing-between-expressroute-and-azure-vpn)

## AVS to Hub and Spoke topology

AVS connects via its ExpressRoute circuit to Azure ExpressRoute gateway in hub VNet. A Route table can be configured in GatewaySubnet to send the traffic to an Azure Firewall or NVA for traffic inspection within Hub VNet.

**Key requirement:** AVS will not be able to communicate with Azure workloads in spoke virtual networks unless their address space is advertised via BGP to AVS ExpressRoute circuit. For the Spoke prefixes to be advertised over the AVS ExpressRoute, the VNet Peering must have:
- **Spoke side:** "Enable 'SpokeVNet' to use 'HubVNet' remote gateway or route server" enabled
- **Hub side:** "Allow gateway or route server in 'HubVNet' to forward traffic to the peered virtual network" enabled
