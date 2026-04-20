---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/How To/How to Parse Dump Circuit & Dump Routing Outputs"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20ExpressRoute/How%20To/How%20to%20Parse%20Dump%20Circuit%20%26%20Dump%20Routing%20Outputs"
importDate: "2026-04-18"
type: troubleshooting-guide
---

[[_TOC_]]

# Overview

This document outlines Dump Circuit & Dump Routing outputs for ExpressRoute, and how to parse and read them. Note that each of the examples have some redacted information as they were at one point real-world customer scenarios.

Want to get a topological view of how Dump Circuit and Dump Routing work in the context of ExpressRoute, please see [Reading Dump Circuit and Private Peering topology](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/267334/Reading-Dump-Circuit-and-Private-Peering-topology).

# Where to find Dump Circuit & Dump Routing

First and foremost, you can find the raw Dump Circuit and Dump Routing outputs in Azure Support Center under Microsoft.Network/expressRouteCircuits > Properties Tab > Properties, which can be opened in a text editor such as Notepad++ or Visual Studio Code:

![Files Uri of Dump Routing Info and Dump Circuit Info](/.attachments/image-49c8a070-31af-4162-a66f-faeea4283266.png)

If you need to update these files, please use the "refresh" function in ASC to reload the ExR resource. This will fetch the latest information:

![Refresh option in ASC](/.attachments/image-4a3ba8b1-d5e7-4e15-bcb5-b09aa6abed86.png)

# Dump Circuit

Dump Circuit shows some circuit-level details about the ExpressRoute circuit. It includes things like what peerings are enabled along with their details, what physical devices are in use for this circuit, and some customer-submitted information like /30 IPs, etc. There is no difference between Cisco & Juniper Dump Circuits.

NOTE: Most Dump Circuit information is natively in ASC Resource Explorer! In a lot of cases, Dump Circuit's raw output is not needed.

This portion of the document will behave much like references in tools like Wikipedia - For each example, I've added a comment in-line in the outputs with a reference number. Please see the bottom of the example for details about that reference number.

## Circuit Information

This section is on every Dump Circuit, no matter what peerings the customer has enabled. It has general information about the circuit:

```
Dump circuit information output :
================================================================================================
SUBSCRIPTION ID: 00000000-0000-0000-0000-000000000000
SERVICE KEY: 00000000-0000-0000-0000-000000000000
CIRCUIT NAME: myCircuit
CIRCUIT LOCATION: Washington DC
GATEWAY MANAGER REGION: East US
GATEWAY MANAGER REGION MONIKER: BL
CIRCUIT SKU: Standard
BANDWIDTH: 100
BILLING TYPE: MeteredData
ALLOW GLOBAL REACH: True
EXPRESSROUTE DIRECT PORT: N/A
PRIMARY DEVICE: ash-09xgmr-cis-1
SECONDARY DEVICE: ash-09xgmr-cis-2
SERVICE PROVIDER: AT&T Netbond
SERVICE PROVIDER TAG(STAG): 17
PROVISIONING STATE: Provisioned
CIRCUIT STATE: Enabled
NRP RESOURCE URI: https://eastus.network.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/myResourceGroup/providers/Microsoft.Network/expressRouteCircuits/myCircuit
CIRCUIT CREATION TIME (UTC): 04/29/2020 19:29:12
O365 SERVICES AUTHORIZED: False
AUTHORIZATIONS: 0, USED: 0
```

## Private Peering Information

This section outlines the private peering information, if enabled. Note that there are **two** of these sections that are nearly identical - one for the primary MSEE, one for the secondary.

```
------------------------------------------------------------------------------------------------
VRF NAME: 12345678912345678912345678912345, TYPE: Private			// 1
PEER CREATION TIME (UTC): 04/29/2020 19:38:34
PEER ASN: 8030									// 2 
BGP STATE v4: Enabled, v6: 
IPv4: True, IPv6: False
SHARED KEY EXISTS: False
PEER IP: 10.0.0.1 , SUBNET: 10.0.0.0/30						// 3
VLAN ID(CTAG): 123								// 4
DEVICE NAME: ash-09xgmr-cis-1 PA: 10.3.129.66 TYPE: Cisco-ASR-1009X		// 5
PORT NAME: TenGigabitEthernet1/1/9, BW: 10000					// 6
SUBINTERFACE NAME: TenGigabitEthernet1/1/9.17123, IP: 10.0.0.2 IPv6: 		// 7
TUNNEL COUNT: 2									// 8
TUNNEL NAME: tunnel437 IP: 10.202.8.6 KEY(MSEE): 123456 KEY(VFP): 123456 KEY(RNM): 7891234567 VNET NAME: myVnet VNET ID: 00000000-0000-0000-0000-000000000000 ENCAP TYPE: Vxlan GWID: 00000000-0000-0000-0000-000000000000 DIRECT TUNNEL: False TUNNEL SOURCE IP: 10.3.129.66  //8
TRANSIT TUNNEL INFO: tunnel123123123 PEER CIRCUIT: 00000000-0000-0000-0000-000000000000 VxLAN KEY: 123123123 ISOWNER: True TUNNEL IP: 10.1.0.1 PEER TUNNEL IP: 10.1.0.3  PA: 10.3.129.66 PEER PA: 10.3.129.72  //9
------------------------------------------------------------------------------------------------
VRF NAME: 91234567891234567891234567891234, TYPE: Private			// 1
PEER CREATION TIME (UTC): 04/29/2020 19:38:34
PEER ASN: 8030									// 2
BGP STATE v4: Enabled, v6: 
IPv4: True, IPv6: False
SHARED KEY EXISTS: False
PEER IP: 10.0.0.5 , SUBNET: 10.0.0.4/30						// 3
VLAN ID(CTAG): 123								// 4
DEVICE NAME: ash-09xgmr-cis-2 PA: 10.3.129.67 TYPE: Cisco-ASR-1009X		// 5
PORT NAME: TenGigabitEthernet1/1/9, BW: 10000					// 6
SUBINTERFACE NAME: TenGigabitEthernet1/1/9.17123, IP: 10.0.0.6 IPv6: 		// 7
TUNNEL COUNT: 2									// 8
TUNNEL NAME: tunnel437 IP: 10.202.8.7 KEY(MSEE): 123456 KEY(VFP): 123456 KEY(RNM): 7891234567 VNET NAME: myVnet VNET ID: 00000000-0000-0000-0000-000000000000 ENCAP TYPE: Vxlan GWID: 00000000-0000-0000-0000-000000000000 DIRECT TUNNEL: False TUNNEL SOURCE IP: 10.3.129.67 //8
TRANSIT TUNNEL INFO: tunnel123123123 PEER CIRCUIT: 00000000-0000-0000-0000-000000000000 VxLAN KEY: 123123123 ISOWNER: True TUNNEL IP: 10.1.0.2 PEER TUNNEL IP: 10.1.0.4  PA: 10.3.129.67 PEER PA: 10.3.129.73	// 9
------------------------------------------------------------------------------------------------
```

Reference: 
1. This is the VRF Name. A VRF is a way that a single router can have multiple routing tables that would otherwise overlap. For example, this allows Customer A and Customer B to both use 10.0.0.0/16 as their Azure Vnet Address space, but the MSEE doesn't overlap their traffic and send to the incorrect customer. A L300+ deep-dive on VRFs can be found at [Juniper Networks'](https://www.juniper.net/documentation/en_US/junos/topics/topic-map/l3-vpns-routes-vrf-tables.html) website.
2. This is the customer's ASN - remember that Private Peering allows for both Private and Public ASNs.
3. This is the peering's customer BGP Peer IP, along with the /30 subnet for this link. The Peer IP would be the "customer edge device" - which could be a provider device or a customer-owned device in a L2 peering scenario. Remember, customers must specify two /30s for use for Private Peering - note that one /30 is in the top peering, and the other is in the bottom peering
4. This is the customer-provided (generally given to them by the provider) VLAN tag, which allows the provider to segregate Customer A's traffic from Customer B. If this is incorrect, ARP will not come up.
5. This shows information about the physical MSEE devices in use. Notice that there are two devices - cis-1 and cis2 in this example, which allows the devices to be physically redundant and fault tolerant. If one device fails, the other will continue to operate, keeping the customer's traffic flowing as expected.

   * The PA is the "Provider Address" of the MSEE. if you were to look at a NIC route table from a VM in a Vnet connected to this MSEE, you'd see these PAs as next hops for ExR-destined traffic!
   * Notice that the device name indicates which region the circuit is in. In this case, `ash` indicates the Ashburn location
   * You can also determine if a device is Cisco, Juniper, or Arista based on the name (xxx is the location string, and ## is the router number which increments between devices in a region):
      * xxx-06gmr-cis-# = Cisco ASR1006
      * xxx-09xgmr-cis-# = Cisco ASR1009X
      * exr##.xxx = Juniper
      * exra##.xxx = Arista
	  
6. This is more router-level physical detail of this circuit. It notes on which physical port this circuit lives, along with the total bandwidth of this physical port. Generally, this port is shared among multiple customers, so this is not all allocated to this circuit! The only time a physical circuit is dedicated to a customer is via the ExpressRoute Direct product.

   * There are multiple Interface Names you might see:
      * TenGigabitEthernet = Cisco's or Arista's name for a single Ethernet port running at 10Gbps
	  * HundredGigabitEthernet = Cisco's or Arista's name for a single Ethernet port running at 100Gbps
	  * PortChannel = Cisco's or Arista's name for multiple interfaces joined to make one bigger interface. Most commonly seen are 4x10Gbps interfaces making a single 40Gbps interface.
	  * xe = Juniper's name for a single Ethernet port running at 10Gbps
	  * et = Juniper's name for a single Ethernet port running at 100Gbps

   Note: if you see :X after the port name (example: xe-0/1/10:1), it means there is a break-out cable attached. These breakout cables convert 1 port to multiple ports. Most frequently, a 40G port to 4x10G ports.

7. This shows router-level logical details of this circuit. A subinterface is a logical interface within a physical interface - you can have multiple subinterfaces on one physical interface. This helps us logically separate two customer interfaces into two different VRFs, even though they're on one physical interface. You can find more information about Layer 3 subinterfaces at [Juniper's documentation](https://www.juniper.net/documentation/en_US/junos/topics/concept/interfaces-layer3-subinterfaces-ex-series.html)

   Note: In most cases, the subinterface is the same on both MSEE routers for a given ExpressRoute circuit. However, this is not mandatory, as a different subinterface can be assigned on each MSEE router for the same circuit. Use Dump Circuit info to validate the subinterface name.

8. This (and the following TUNNEL NAMEs ) outlines the tunnels created from this MSEE to the different Vnets to which it is connected - these are the manifestation of the `Microsoft.Network/connections` objects. It's most useful for confirming Vnet IDs and Vnet Names of the connected entities, to compare with what NRP thinks should be connected.

   * For Cisco MSEEs, this virtual interface is called `tunnelXXXXX` - where X are numbers
   * For Juniper MSEEs, this virtual interface is called `fti0.XXX` - where X are numbers
   * For Arista MSEEs, this virtual interface is called `loopbackxxx` - where X are numbers

9. This outlines any circuits connected to this circuit via [ExpressRoute Global Reach](https://docs.microsoft.com/en-us/azure/expressroute/expressroute-global-reach).

## Microsoft Peering Information

This section outlines the Microsoft peering information, if enabled. Note that there are **two** of these sections that are nearly identical - one for the primary MSEE, one for the secondary.

NOTE: This peering is **not** on the same customer circuit as the peering above, so you'll notice discrepancies between the two (different devices, regions, etc)

```
------------------------------------------------------------------------------------------------
VRF NAME: Global, TYPE: Microsoft
PEER CREATION TIME (UTC): 05/12/2020 04:17:22
PEER ASN: 11111					// 1
BGP STATE v4: Enabled, v6: 
IPv4: True, IPv6: False
SHARED KEY EXISTS: False
PEER IP: 0.0.0.0 , SUBNET: 0.0.0.0/30		// 2
LEGACY MODE: False				// 3
ADVERTISED PREFIXES STATE: Configured
ADVERTISED PREFIXES: 0.0.0.0/24			// 4
CUSTOMER ASN: 0
ROUTING REGISTRY: APNIC
VALIDATION NEEDED ADVERTISED PREFIXES: 		// 5
ROUTE FILTER URI: /subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/myResourceGroup/providers/Microsoft.Network/routeFilters/myRouteFilter	// 6
ADVERTISED SERVICES: Other Office 365 Services, Skype For Business, CRM Online, Azure Active Directory, SharePoint Online, Exchange, Azure Australia East, Azure Australia Southeast	// 7
VLAN ID(CTAG): 12345				// 8
DEVICE NAME: exr01.syd PA: 10.3.129.114 TYPE: JunosMSEE	// 9
LINKED CORE ROUTERS: 
SUBINTERFACE NAME: xe-0/1/10:1.3888, IP: 0.0.0.0 IPv6: 	// 10
------------------------------------------------------------------------------------------------
VRF NAME: Global, TYPE: Microsoft
PEER CREATION TIME (UTC): 05/12/2020 04:17:22
PEER ASN: 11111					// 1
BGP STATE v4: Enabled, v6: 
IPv4: True, IPv6: False
SHARED KEY EXISTS: False
PEER IP: 0.0.0.0 , SUBNET: 0.0.0.0/30		// 2
LEGACY MODE: False				// 3
ADVERTISED PREFIXES STATE: Configured
ADVERTISED PREFIXES: 0.0.0.0/24			// 4
CUSTOMER ASN: 0
ROUTING REGISTRY: APNIC
VALIDATION NEEDED ADVERTISED PREFIXES: 		// 5 
ROUTE FILTER URI: /subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/myResourceGroup/providers/Microsoft.Network/routeFilters/myRouteFilter	// 6
ADVERTISED SERVICES: Other Office 365 Services, Skype For Business, CRM Online, Azure Active Directory, SharePoint Online, Exchange, Azure Australia East, Azure Australia Southeast	// 7
VLAN ID(CTAG): 12345				// 8
DEVICE NAME: exr02.syd PA: 10.3.129.115 TYPE: JunosMSEE	// 9
LINKED CORE ROUTERS: 
SUBINTERFACE NAME: xe-0/1/10:1.3888, IP: 0.0.0.0 IPv6:  // 10
------------------------------------------------------------------------------------------------
```

Reference:

1. Like Private Peering, this is the customer's provided ASN
2. Like Private Peering, this is the peering's customer BGP Peer IP, along with the /30 subnet for this MSEE. The Peer IP would be the "customer edge device" - which could be a provider device or a customer-owned device in a L2 peering scenario. Remember, customers must specify two /30s for use for Microsoft Peering - note that one /30 is in the top peering, and the other is in the bottom peering.
3. "Legacy Mode" dictates whether the circuit is using the "new" Route Filter Microsoft Peering where customers choose which routes in which they are interested, or the "old" Microsoft Peering which involved us sending **all** prefixes to the customer.
4. These are the [TA-validated](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/137958/How-to-Manually-Validate-ASN-and-Public-Prefixes-for-ExR) prefixes that are injected into our core routers. The customer MUST NAT their traffic to this prefix, else return traffic will be async-routed to the internet.
5. If the customer is pending prefix validation, the pending prefixes will show here.
6. This is the NRP URI of the [customer-created route filter object](https://docs.microsoft.com/en-us/azure/expressroute/how-to-routefilter-portal) that dictates which routes they wish to receive.
7. This provides human-readable outputs from the route filter object above. It states which prefixes should be sent to the customer via this circuit.
8. Like Private Peering, this is the customer-provided (generally given to them by the provider) VLAN tag, which allows the provider to segregate Customer A's traffic from Customer B. If this is incorrect, ARP will not come up.
9. Like Private Peering - this shows information about the physical MSEE devices in use. Notice that there are two devices - exr01 and exr02 in this example, which allows the devices to be physically redundant and fault tolerant. If one device fails, the other will continue to operate, keeping the customer's traffic flowing as expected.

   * The PA is the "Provider Address" of the MSEE. if you were to look at a NIC route table from a VM in a Vnet connected to this MSEE, you'd see these PAs as next hops for ExR-destined traffic!
   * Notice that the device name indicates which region the circuit is in. In this case, `syd` indicates the Sydney location
   * You can also determine if a device is Cisco, Juniper, or Arista based on the name (xxx is the location string, and 1 is the router number, this increments between devices in a region):
      * xxx-06gmr-cis-# = Cisco ASR1006
      * xxx-09xgmr-cis-# = Cisco ASR1009X
      * exr##.xxx = Juniper
      * exra##.xxx = Arista
	  
10. Like Private Peering, this shows router-level logical details of this circuit. A subinterface is a logical interface within a physical interface - you can have multiple subinterfaces on one physical interface. This helps us logically separate two customer interfaces into two different VRFs, even though they're on one physical interface. You can find more information about Layer 3 subinterfaces at [Juniper's documentation](https://www.juniper.net/documentation/en_US/junos/topics/concept/interfaces-layer3-subinterfaces-ex-series.html)

# Cisco MSEE
## Dump Routing

Dump Routing aggregates many extremely useful commands run directly on the router, each of which helps us troubleshoot various ExR-related issues. We will outline each section below, detailing them one at a time to discover what the section is, why it's important, and why you'd use it.

## Peering Info

The first section of any peering in a Dump Routing shows much of the same information as a Dump Circuit. Here's the section broken into individual lines for clarity:

```
Routing Info For: 
CustomerSubscriptionId:00000000-0000-0000-0000-000000000000, 
CircuitId:00000000-0000-0000-0000-000000000000, 
VrfName:12345678912345678912345678912345, 
VrfType:Private, 
DeviceName:ash-09xgmr-cis-2, 
VnetIds:00000000-0000-0000-0000-000000000000, 
SubInterfaceName:TenGigabitEthernet1/1/9.17123, 
BgpNeighborPeer:10.225.0.5, 
BgpAzureNeighborPeer:10.225.0.6, 
BgpNeighborPeerIpv6:, 
BgpAzureNeighborPeerIpv6:, 
AccessGroupName:, 
AccessGroupNamev6:, 
ProviderSubscriptionId:00000000-0000-0000-0000-000000000000
```

These are fairly self-explanatory, but see the Dump Circuit section above for details on each. Note that several are empty, and can be ignored.

## BGP Peer Info

Equivalent Cisco command: `show ip bgp summary`

```
Neighbor        V           AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
10.202.8.12     4        65515    2641    2556 137650266    0    0 1d14h           3
10.202.8.13     4        65515    2554    2464 137650266    0    0 1d13h           3
10.225.0.1      4         8030   75185   79709 137650266    0    0 1w5d            6
10.226.0.3      4        12076    1703    1707 137650266    0    0 1d01h           7
```

This section outlines every BGP peer connected to this customer circuit. This example is Private Peering, which is clear as you can clearly see only private IPs, and you can see Gateway ASNs (65515) involved.

* `Neighbor`: This is the BGP neighbor. It may be an on-prem router, an Azure ExR Gateway in a vnet, or it could even be another ExR circuit entirely (using Azure Global Reach).
* `V`: This is whether the neighbor is IPv4 or IPv6
* `AS`: This is the neighbor's AS Number. This can be one of a few things, which helps identify what the neighbor actually is:
   * 65515: Azure ExR Gateway - notice that these are ALWAYS in pairs!
   * 12076: Another MSEE/Circuit (Global Reach)
   * Some other number: Customer-side ASN
* `MsgRcvd`/`MsgSent`: This counts the number of BGP-related messages that have been sent and received between the MSEE and this neighbor since this BGP session was first established. These could be route updates, keepalives, notifications, etc.
* `TblVer`: A number used by Border Gateway Protocol (BGP) in order to track which best path changes of BGP prefixes are propagated to which BGP peers [More info can be found at Cisco's docs](https://www.cisco.com/c/en/us/support/docs/ip/border-gateway-protocol-bgp/116511-technote-tableversion-00.html)
* `InQ`/`OutQ`: These are BGP messages that are "pending" to be sent or received and processed. If this is anything but 0, there is some problem processing BGP messages on either the MSEE side (if InQ is incrementing) or the customer side (if OutQ is incrementing).
* `Up/Down`: This counts how long the BGP session has been established.
* `State/PfxRcd`: If the BGP session is connected, this shows n integer that represents the number of prefixes that are being received from the neighbor. If *not* connected, it shows the current [BGP State](https://www.ciscopress.com/articles/article.asp?p=2756480&seqNum=4)

### Microsoft Peering Notes

For Microsoft Peering, the BGP Peer Info table will show ALL customer IPs connected to this MSEE. You need to parse through them and only focus on your customer's peer IP (which is gathered in Dump Circuit). You can ignore the rest of the peers.

## BGP Routing Table

Equivalent Cisco command: `show ip route`

```
Routing Table: 12345678912345678912345678912345
Codes: L - local, C - connected, S - static, R - RIP, M - mobile, B - BGP
       D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area 
       N1 - OSPF NSSA external type 1, N2 - OSPF NSSA external type 2
       E1 - OSPF external type 1, E2 - OSPF external type 2
       i - IS-IS, su - IS-IS summary, L1 - IS-IS level-1, L2 - IS-IS level-2
       ia - IS-IS inter area, * - candidate default, U - per-user static route
       o - ODR, P - periodic downloaded static route, H - NHRP, l - LISP
       a - application route
       + - replicated route, % - next hop override, p - overrides from PfR

Gateway of last resort is not set

      10.0.0.0/8 is variably subnetted, 15 subnets, 10 masks
B        10.0.2.0/25 [20/0] via 10.225.0.5, 1w5d
B        10.36.0.0/16 [20/0] via 10.225.0.5, 1w5d
B        10.193.18.0/24 [20/0] via 10.225.0.5, 1w5d
B        10.193.83.0/24 [20/0] via 10.225.0.5, 1w5d
B        10.193.103.48/28 [20/0] via 10.225.0.5, 1w5d
B        10.199.0.0/16 [20/0] via 10.225.0.5, 1w5d
B        10.202.0.0/17 [20/0] via 10.202.8.12, 1d13h
C        10.202.8.0/27 is directly connected, Tunnel437
L        10.202.8.7/32 is directly connected, Tunnel437
B        10.202.251.0/24 [20/0] via 10.202.8.12, 1d13h
B        10.202.254.0/23 [20/0] via 10.202.8.12, 1d13h
C        10.225.0.4/30 is directly connected, TenGigabitEthernet1/1/9.17123
L        10.225.0.6/32 is directly connected, TenGigabitEthernet1/1/9.17123
C        10.226.0.0/29 is directly connected, Tunnel706
L        10.226.0.2/32 is directly connected, Tunnel706
S        10.16.13.44/32 [1/0] via binding label: 0x2006BCC    <----FastPath
S        10.16.13.45/32 [1/0] via binding label: 0x2006C1C    <----FastPath
S        10.16.13.46/32 [1/0] via binding label: 0x2006F40    <----FastPath
```

This section shows all routes that are in this customer's VRF, meaning all routes that this MSEE knows about. It'll show on-prem routes as well as Azure routes. If you don't see a route in this table that you expect to see, it means there's something to investigate on the neighbor from which the route should originate. 

You can tell which routes are which based on the `via 0.0.0.0` portion of each line. Match this with the BGP table above to determine which routes are on-prem and which are from Azure Gateways.

Here's a line-by-line breakdown of this routing table:

```
Gateway of last resort is not set
```

This indicates that there is **no** default route on this VRF. If a customer were to broadcast a 0.0.0.0/0 route via BGP from on-prem to Azure, it'd show here along with the appropriate "next hop" showing to which IP all traffic is forced.

```
      10.0.0.0/8 is variably subnetted, 15 subnets, 10 masks
```

Don't let this confuse you. This is simply Cisco's way of categorizing the routes into a top-level network that is then subnetted below it. In this case, it means that all the subnets fall under the 10.0.0.0/8 subnet. This can generally be ignored, and has nothing to do with customer routing or traffic.

```
B        10.36.0.0/16 [20/0] via 10.225.0.5, 1w5d
```

This is an actual route. Broken down piece by piece:

* `B` - this indicates (based on our codes listed above the routing table) that this is a BGP-learned route.
* `10.36.0.0/16` - Indicates the address prefix of the remote network.
* `[20/0]` - The first number in the brackets is the administrative distance of the information source; the second number is the metric for the route.
* `via 10.225.0.5` - Specifies the address of the next router to the remote network.
* `1w5d` - Specifies the last time the route was updated

```
C        10.225.0.4/30 is directly connected, TenGigabitEthernet1/1/9.17123
L        10.225.0.6/32 is directly connected, TenGigabitEthernet1/1/9.17123
```

These `C` and `L` routes indicate routes that are not learned by BGP - they are the local interface routes in the router. `L` is the local (device) IP address and will always be a /32. `C` is the subnet mask configured for that local address. On an MSEE, routes are learn only via `C`, `L`, and `B`. In this example, this route is the /30 that is assigned to the BGP peering between the MSEE and Customer Edge (you can tell this because this is the customer's specific subinterface). It is also the interface that the customer specifies for their Peering type which you can see in NRP/ASC. The /32 is the MSEE's BGP IP.

```
C        10.226.0.0/29 is directly connected, Tunnel706
L        10.226.0.2/32 is directly connected, Tunnel706
```

In case of a `TunnelXXXX` route, this would indicate an ExR Gateway in a Vnet. You'll notice that the /29 here is the same /29 for this customer's GatewaySubnet, and the /32 is the MSEE-side IP for the interface.

### ExpressRoute FastPath

```
S        10.16.13.44/32 [1/0] via binding label: 0x2006BCC
S        10.16.13.45/32 [1/0] via binding label: 0x2006C1C
S        10.16.13.46/32 [1/0] via binding label: 0x2006F40
```
If customer is using [ExpressRoute FastPath](https://docs.microsoft.com/en-us/azure/expressroute/about-fastpath) you will see the static routes being applied referenced in the above image.

MSEE manager role in GWM is responsible for programming FastPath routes (called FlexRoutes) on MSEE device. These routes are CA/PA mappings that allow MSEE to send traffic directly to customer VMs, bypassing ER gateway and SLB MUX in front of the gateway. MSEE manager role talks to BlueBird library, which in turns talks to Pub/Sub to fetch the routes.

### Microsoft Peering Notes

In Microsoft Peering, you'll see a LOT of routes listed, depending on what route filters the customer has specified. The Next Hop will be a MSFT Core Router (also known as a Internet Edge Router or IER) for these routes. You'll also see a lot of customer advertised prefixes for **all** customers using Microsoft Peering on this MSEE - you can ignore all prefixes that are not for your specific customer. 

You may wish to confirm that the customer's Advertised Prefix listed in Dump Circuit shows in this table, which confirms that they are in fact broadcasting that route to Microsoft.

## GetBgpPeering Info

This details some BGP specifics for this peering.

```
BgpPeering for circuit: 00000000-0000-0000-0000-000000000000
AzureAsn: 12076
PeerAsn: 8030
PeeringType: Private
PrimaryAzurePort: ATT-ASH-09XGMR-CIS-1-PRI-11042019-A
PrimaryPeerSubnet: 10.225.0.0/30
PrimaryPeerSubnetIpv6: 
SecondaryAzurePort: ATT-ASH-09XGMR-CIS-2-SEC-11042019-A
SecondaryPeerSubnet: 10.225.0.4/30
SecondaryPeerSubnetIpv6: 
VlanId: 1
State: Enabled
```

This doesn't affect Azure Networking much, but it confirms the physical port involved, and the /30 subnets and ASNs involved.

## ARP Info

Equivalent Cisco command: `show ip arp`

```
Protocol  Address          Age (min)  Hardware Addr   Type   Interface
Internet  10.225.0.5              0   3c94.d523.0000  ARPA   TenGigabitEthernet1/1/9.17123
Internet  10.225.0.6              -   00be.7506.0000  ARPA   TenGigabitEthernet1/1/9.17123
```

This shows the ARP info for this VRF. Most importantly used for confirming Layer 2 connectivity, which is required before BGP can come up. If you see `incomplete` in the "Hardware Addr" column, that means that there is no Layer 2 connectivity, and you'll need to work with the provider to resolve that. 

NOTE: `Age (min)` indicates the amount of time since the ARP entry was last used. It increments from 0, and resets back to 0 as the ARP cache expires.

## Subinterface Info

Equivalent Cisco command: `show interface <interfaceName>.<subinterfaceId>`

```
TenGigabitEthernet1/1/9.17123 is up, line protocol is up 
  Hardware is EPA-10X10GE, address is 00be.7506.03e9 (bia 00be.7506.03e9)
  Description: MSEE to service provider 1 link
  Internet address is 10.225.0.6/30
  MTU 1500 bytes, BW 10000000 Kbit/sec, DLY 10 usec, 
     reliability 255/255, txload 10/255, rxload 11/255
  Encapsulation QinQ Virtual LAN, outer ID  17, inner ID 1
  ARP type: ARPA, ARP Timeout 04:00:00
  Keepalive not supported 
  Last clearing of "show interface" counters never
```

This just shows the subinterface details for this peering. It shows whether or not the subinterface is up or down (`is up, line protocol is up`). Most useful bit is the `txload` and `rxload` values, which show a usage scale from 0 to 255 on the subinterface. This indicates how much traffic has flowed over the subinterface. 

## BFD Info

Equivalent Cisco command: `show bfd neighbors`

```
BFD is Configured but Down. Possible reasons are BFD not enabled on CE/PE neighbors, or genuine path issues between CE/PE and MSEE.

IPv4 Sessions
NeighAddr                              LD/RD         RH/RS     State     Int
10.225.0.5                           3480/0          Down      Down      Te1/1/9.17123
```

This shows if the [Bidirectional Forwarding Detection (BFD)](https://docs.microsoft.com/en-us/azure/expressroute/expressroute-bfd) session is up or down to the on-prem peer. In most cases, customers do not have BFD enabled on their side, so it'll report as "Down". Here's an example of it being "up":

```
IPv4 Sessions
NeighAddr                              LD/RD         RH/RS     State     Int
10.1.0.9                               56/6          Up        Up        Gi1/0/1
10.1.0.13                              62/14         Up        Up        Gi1/0/2
```

# Juniper MSEE
## Dump Routing

There are many differences between Dump Routing on a Cisco MSEE vs a Juniper MSEE. The sections below will walk through each section, and call out things you might care about.

## Peering Info

This is exactly the same as it is on the Cisco MSEEs. {See information about it above](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki?wikiVersion=GBmaster&_a=edit&pagePath=%2FAzure%20ExpressRoute%2FFeatures%20and%20Functions%2FHow%20to%20Parse%20Dump%20Circuit%20%26%20Dump%20Routing%20Outputs&pageId=325336#peering-info)

## BGP Info

You'll notice that this section is vastly different from Cisco MSEEs. Whereas Cisco MSEEs run a `show ip bgp summary` output, the Juniper MSEEs show a much more in-depth version of this. At first glance, it may be difficult to read, but we will break down some examples below.

```
Peer: 192.168.18.185+37788 AS 65047 Local: 192.168.18.186+179 AS 12076
  Group: CUSTOMER              Routing-Instance: 0c6b4cf33c4a4aadb40740c6a842a9de
  Forwarding routing-instance: 0c6b4cf33c4a4aadb40740c6a842a9de  
  Type: External    State: Established    Flags: <Sync>
  Last State: OpenConfirm   Last Event: RecvKeepAlive
  Last Error: None
  Export: [ PRIVATE-COMMON-V4-OUT ] 
  Options: <Preference RemovePrivateAS LogUpDown AddressFamily PeerAS PrefixLimit Refresh>
  Options: <AdvertisePeerAs BfdEnabled PeerSpecficLoopsAllowed>
  Address families configured: inet-unicast
  Holdtime: 90 Preference: 170
  Number of flaps: 2
  Last flap event: RestartTimeout
  Error: 'Hold Timer Expired Error' Sent: 0 Recv: 1
  Peer ID: 192.168.18.170  Local ID: 192.168.18.186    Active Holdtime: 90
  Keepalive Interval: 30         Group index: 147  Peer index: 0    SNMP index: 5330  
  I/O Session Thread: bgpio-0 State: Enabled
  BFD: enabled, down
  Local Interface: xe-0/1/10:1.3538                 
  NLRI for restart configured on peer: inet-unicast
  NLRI advertised by peer: inet-unicast
  NLRI for this session: inet-unicast
  Peer supports Refresh capability (2)
  Stale routes from peer are kept for: 300
  Restart time requested by this peer: 120
  NLRI that peer supports restart for: inet-unicast
  NLRI peer can save forwarding state: inet-unicast
  NLRI that restart is negotiated for: inet-unicast
  NLRI of received end-of-rib markers: inet-unicast
  NLRI of all end-of-rib markers sent: inet-unicast
  Peer does not support LLGR Restarter or Receiver functionality
  Peer does not support 4 byte AS extension
  Peer does not support Addpath
  Table 0c6b4cf33c4a4aadb40740c6a842a9de.inet.0 Bit: 910000
    RIB State: BGP restart is complete
    RIB State: VPN restart is complete
    Send state: in sync
    Active prefixes:              50
    Received prefixes:            50
    Accepted prefixes:            50
    Suppressed due to damping:    0
    Advertised prefixes:          11
  Last traffic (seconds): Received 7    Sent 9    Checked 577745
  Input messages:  Total 22156	Updates 9	Refreshes 0	Octets 421386
  Output messages: Total 19720	Updates 1	Refreshes 0	Octets 374750
  Output Queue[144]: 0          (0c6b4cf33c4a4aadb40740c6a842a9de.inet.0, inet-unicast)
```

Here are the bits you should care about:

* `Peer: 192.168.18.185+37788 AS 65047 Local: 192.168.18.186+179 AS 12076`
   * This indicates our BGP Peer is 192.168.18.185, their ASN is 65047, our side of the /30 is 192.168.18.186, and our ASN is 12076 (as usual).
* `Group: CUSTOMER              Routing-Instance: 0c6b4cf33c4a4aadb40740c6a842a9de`
   * This shows that this is a customer peer IP. It also shows the VRF Name (0c6b4cf33c4a4aadb40740c6a842a9de).
   * NOTE: You might also see a group named `DCGW` - this indicates that the peer is an xpressRoute Gateway. You can confirm this as ExR GWs are always in pairs, and are always with ASN 65515.
*  `Type: External    State: Established    Flags: <Sync>`
   * Most importantly here, the **State** shows that this BGP session is established. [You can find more information about the various BGP negotiation states here](https://en.wikipedia.org/wiki/Border_Gateway_Protocol#Extensions_negotiation)
* `Active Holdtime: 90` 
   * a negotiated holdtime interval with a remote peer. In this case, a BGP keepalive packet is sent every 30 seconds.
* `    Active prefixes:              50`
   * This shows how many prefixes are received and active from this peer.

If we were to use this info to re-create a Cisco MSEE output, it would look like this:

```
Neighbor           V        AS    MsgRcvd MsgSent      TblVer       InQ  OutQ Up/Down  State/PfxRcd
192.168.18.185     4        65047 22156	  19720	                    0    0             50
```

Notice we're missing `TblVer` (which isn't terribly useful for us) and "Up/Down", which would normally show how long the BGP peer has been connected (this one is certainly more useful).

### Microsoft Peering Notes

* `Group` for MS Peering will show `Group: PEERING_CUST` for customer peers, and will show `Group: GNS_CORE` for our core router peers. Remember there are two core routers peered to each MSEE.
* Like Cisco MSEEs have the `Global` VRF, Juniper calls it `Master`. you'll see that under `Routing-Instance: master`.
* Microsoft Peerings will have info in the `Export` field. Example below:
   *   `Export: [ PEERING-COMMON-V4-OUT SHAREPOINT-V4-OUT ] Import: [ MSFT-CUSTOMER-PUBLIC-00000000-0000-0000-0000-000000000000-IN ]`
   * In this case, the customer has a Route Filter applied to their MS Peering with "Sharepoint Online (12076:5020)" enabled. You can see all communities at the Azure Doc: [Support for BGP Communities](https://docs.microsoft.com/en-us/azure/expressroute/expressroute-routing#bgp)
   * For `MSFT-CUSTOMER-PUBLIC-00000000-0000-0000-0000-000000000000-IN`, this is a prefix list that dictates routes that we *allow* the customer to send us, that have been fully validated. These show in Dump Circuit under `ADVERTISED PREFIXES:`.

## BGP Routing Table

The BGP routing table in a Juniper MSEE also looks quite different than Cisco. Here's a breakdown of a route:

```
10.0.0.0/8         *[BGP/170] 6d 16:29:06, localpref 100
                      AS path: 65047 ?, validation-state: unverified
                    > to 192.168.18.185 via xe-0/1/10:1.3538
```

* `10.0.0.0/8` - Indicates the address prefix of the remote network. 
* `6d 16:29:06` - Specifies the last time the route was updated
* `AS path: 65047` - This shows the AS Path for this route. Customers may use a common principle called [AS Prepending](https://docs.microsoft.com/en-us/azure/expressroute/expressroute-optimize-routing) to make routes look "longer" than they are, to influence routing.
* `to 192.168.18.185` - Specifies the address of the next router to the remote network.
* `via xe-0/1/10:1.3538` - Specifies the interface nextHop for this route. Traffic to this prefix will egress the router on this subinterface. Remember (per our Dump Circuit info above) that Juniper MSEEs use `fti0.XXX` for ExRGW tunnels. In this example, we can conclude that prefix 10.0.0.0/8 is on-premises because the interface name starts with xe- and not fti0. Physical port xe-0/1/10:1 is shared among many customers using the same ISP, but virtual interface 3538 is a QinQ tagged subinterface that isolates this customer's private peering session.

### Microsoft Peering Notes:

Please note that you cannot see the route table for Microsoft Peering on a Juniper MSEE for *advertised* routes. Workaround: You can use Jarvis Actions' `Run Show Command` to check the advertised routes for a Microsoft Peering peer:

* To show Advertised routes: `show route advertising-protocol bgp <Peer IP>`
   * Example Jarvis Actions link: <https://portal.microsoftgeneva.com/3172F10F?genevatraceguid=9813fbfb-0723-4665-8246-76673d15c84e>
   * The output you're looking for is at the top of the output - Once you start seeing `<vrfname>.inet.0` lines, those are private VRFs and can be ignored.

## ARP Info
If we are not learning ARP from customer edge, Juniper device will not show any information under iv. ARP Info.

ARP Incomplete/Down:
```
iv. ARP Info:

```
Learning ARP: 

```
MAC Address       Address         Interface         Flags    TTE
70:0f:6a:9a:28:17 172.16.1.5      xe-0/1/10:0.41           none 972
```

This will **only** show the customer side MAC address for this VRF. ARP is most importantly used for confirming Layer 2 connectivity, which is required before BGP can come up. If you don't see any data under `iv. ARP Info:` then we can confirm that means that there is no Layer 2 connectivity, and you'll need to work with the provider to resolve that.

#14244

# Arista MSEE
## Dump Routing

Dump Routing aggregates many extremely useful commands run directly on the router, each of which helps us troubleshoot various ExR-related issues. We will outline each section below, detailing them one at a time to discover what the section is, why it's important, and why you'd use it.

## Peering Info

The first section of any peering in a Dump Routing shows much of the same information as a Dump Circuit. Here's the section broken into individual lines for clarity:

```
Routing Info For: 
CustomerSubscriptionId:00000000-0000-0000-0000-000000000000, 
CircuitId:00000000-0000-0000-0000-000000000000, 
VrfName:12345678912345678912345678912345, 
VrfType:Private, 
DeviceName:exra01.by21, 
VnetIds:00000000-0000-0000-0000-000000000000, 
SubInterfaceName:Port-Channel10.2, 
BgpNeighborPeer:10.225.0.5, 
BgpAzureNeighborPeer:10.225.0.6, 
BgpNeighborPeerIpv6:, 
BgpAzureNeighborPeerIpv6:, 
AccessGroupName:, 
AccessGroupNamev6:, 
ProviderSubscriptionId:00000000-0000-0000-0000-000000000000
```

These are fairly self-explanatory, but see the Dump Circuit section above for details on each. Note that several are empty, and can be ignored.

## BGP Peer Info

```
BGP summary information for VRF 91e6ec5ec728430cbcf038ddfef24625
Router identifier 10.138.58.186, local AS number 12076
Neighbor Status Codes: m - Under maintenance
  Description              Neighbor      V AS           MsgRcvd   MsgSent  InQ OutQ  Up/Down State   PfxRcd PfxAcc
  CUSTOMER                 10.138.58.185 4 8073         1919336   2253098    0    0   66d15h Estab   409    409
  DCGW                     10.169.229.12 4 65515         219070    226309    0   38   11d01h Estab   2      2
  DCGW                     10.169.229.13 4 65515         218968    226364    0   19   11d00h Estab   2      2
```

This section outlines every BGP peer connected to this customer circuit. This example is Private Peering, which is clear as you can clearly see only private IPs, and you can see Gateway ASNs (65515) involved.

* `Description`: Customer or DCGW. Customer would reference the customers BGP neighbor and DCGW references the ExpressRoute gateway. 
* `Neighbor`: This is the BGP neighbor. It may be an on-prem router, an Azure ExR Gateway in a vnet, or it could even be another ExR circuit entirely (using Azure Global Reach).
* `V`: This is whether the neighbor is IPv4 or IPv6
* `AS`: This is the neighbor's AS Number. This can be one of a few things, which helps identify what the neighbor actually is:
   * 65515: Azure ExR Gateway - notice that these are ALWAYS in pairs!
   * 12076: Another MSEE/Circuit (Global Reach)
   * Some other number: Customer-side ASN
* `MsgRcvd`/`MsgSent`: This counts the number of BGP-related messages that have been sent and received between the MSEE and this neighbor since this BGP session was first established. These could be route updates, keepalives, notifications, etc.
* `TblVer`: A number used by Border Gateway Protocol (BGP) in order to track which best path changes of BGP prefixes are propagated to which BGP peers .
* `InQ`/`OutQ`: These are BGP messages that are "pending" to be sent or received and processed. If this is anything but 0, there is some problem processing BGP messages on either the MSEE side (if InQ is incrementing) or the customer side (if OutQ is incrementing).
* `Up/Down`: This counts how long the BGP session has been established.
* `State/PfxRcd`: If the BGP session is connected, this shows n integer that represents the number of prefixes that are being received from the neighbor. If *not* connected, it shows the current BGP State.

### Microsoft Peering Notes

For Microsoft Peering, the BGP Peer Info table will show ALL customer IPs connected to this MSEE. You need to parse through them and only focus on your customer's peer IP (which is gathered in Dump Circuit). You can ignore the rest of the peers.

## BGP Routing Table Arista

Equivalent Cisco command: `show ip route`

```
VRF: 91e6ec5ec728430cbcf038ddfef24625
Codes: C - connected, S - static, K - kernel, 
       O - OSPF, IA - OSPF inter area, E1 - OSPF external type 1,
       E2 - OSPF external type 2, N1 - OSPF NSSA external type 1,
       N2 - OSPF NSSA external type2, B - Other BGP Routes,
       B I - iBGP, B E - eBGP, R - RIP, I L1 - IS-IS level 1,
       I L2 - IS-IS level 2, O3 - OSPFv3, A B - BGP Aggregate,
       A O - OSPF Summary, NG - Nexthop Group Static Route,
       V - VXLAN Control Service, M - Martian,
       DH - DHCP client installed default route,
       DP - Dynamic Policy Route, L - VRF Leaked,
       G  - gRIBI, RC - Route Cache Route,
       CL - CBF Leaked Route

Gateway of last resort:
 B E      0.0.0.0/0 [200/0] via 10.138.58.185, Port-Channel10.2

 B E      10.165.0.0/16 [200/0] via 10.138.58.185, Port-Channel10.2
 B E      10.166.36.0/22 [200/0] via 10.138.58.185, Port-Channel10.2
 B E      10.166.0.0/16 [200/0] via 10.138.58.185, Port-Channel10.2
 B E      10.167.0.0/16 [200/0] via 10.138.58.185, Port-Channel10.2
 B E      10.166.0.0/15 [200/0] via 10.138.58.185, Port-Channel10.2
 B E      10.160.0.0/13 [200/0] via 10.138.58.185, Port-Channel10.2
 B E      10.169.228.0/24 [200/0] via 10.169.229.12 VTEP [Gateway Public VIP] VNI 668306 router-mac 00:00:00:00:00:00 local-interface Vxlan1
                                  via 10.169.229.13 VTEP [Gateway Public VIP] VNI 668306 router-mac 00:00:00:00:00:00 local-interface Vxlan1
 C        10.169.229.4/32 is directly connected, Loopback100
 S        10.169.229.12/32 [5/0] via VTEP [Gateway Public VIP] VNI 668306 router-mac 00:00:00:00:00:00 local-interface Vxlan1
 S        10.169.229.13/32 [5/0] via VTEP [Gateway Public VIP] VNI 668306 router-mac 00:00:00:00:00:00 local-interface Vxlan1
 B E      10.169.229.0/28 [200/0] via 10.169.229.12 VTEP [Gateway Public VIP] VNI 668306 router-mac 00:00:00:00:00:00 local-interface Vxlan1
                                  via 10.169.229.13 VTEP [Gateway Public VIP] VNI 668306 router-mac 00:00:00:00:00:00 local-interface Vxlan1
```
*VTEP = VXLAN tunnel endpoint*

This section shows all routes that are in this customer's VRF, meaning all routes that this MSEE knows about. It'll show on-prem routes as well as Azure routes. If you don't see a route in this table that you expect to see, it means there's something to investigate on the neighbor from which the route should originate.

You can tell which routes are which based on the `via 0.0.0.0` portion of each line. Match this with the BGP table above to determine which routes are on-prem and which are from Azure Gateways.

Here's a line-by-line breakdown of this routing table:

```
Example 1:
 
Gateway of last resort:
 B E      0.0.0.0/0 [200/0] via 10.138.58.189, Port-Channel10.2

or

Example 2:

Gateway of last resort is not set
```
Example 1 indicates that there is a default route on this VRF. 

Example 2 indicated no default rout eon VRF. If a customer were to broadcast a 0.0.0.0/0 route via BGP from on-prem to Azure, it'd show here along with the appropriate "next hop" showing to which IP all traffic is forced as showed in Example 1.

```
      10.0.0.0/8 is variably subnetted, 15 subnets, 10 masks
```

Don't let this confuse you. This is simply Arista's way of categorizing the routes into a top-level network that is then subnetted below it. In this case, it means that all the subnets fall under the 10.0.0.0/8 subnet. This can generally be ignored, and has nothing to do with customer routing or traffic.

```
B E      10.30.0.0/15 [200/0] via 10.138.58.185, Port-Channel10.2
```

This is an actual route. Broken down piece by piece:

* `B E` - this indicates (based on our codes listed above the routing table) that this is a eBGP-learned route.
* `10.30.0.0/15` - Indicates the address prefix of the remote network.
* `[200/0]` - The first number in the brackets is the administrative distance of the information source; the second number is the metric for the route.
* `via 10.138.58.185` - Specifies the address of the next router to the remote network.

### Microsoft Peering Notes

In Microsoft Peering, you'll see a LOT of routes listed, depending on what route filters the customer has specified. The Next Hop will be a MSFT Core Router (also known as a Internet Edge Router or IER) for these routes. You'll also see a lot of customer advertised prefixes for **all** customers using Microsoft Peering on this MSEE - you can ignore all prefixes that are not for your specific customer. 

You may wish to confirm that the customer's Advertised Prefix listed in Dump Circuit shows in this table, which confirms that they are in fact broadcasting that route to Microsoft.

## GetBgpPeering Info

This details some BGP specifics for this peering.

```
BgpPeering for circuit: 00000000-0000-0000-0000-000000000000
AzureAsn: 12076
PeerAsn: 8030
PeeringType: Private
PrimaryAzurePort: MSIT-BY21-06GMR-CIS-3-PRI-A
PrimaryPeerSubnet: 10.138.58.184/30
PrimaryPeerSubnetIpv6: 
SecondaryAzurePort: MSIT-BY21-06GMR-CIS-4-SEC-A
SecondaryPeerSubnet: 10.138.58.188/30
SecondaryPeerSubnetIpv6: 
VlanId: 900
State: Enabled
```

This doesn't affect Azure Networking much, but it confirms the physical port involved, and the /30 subnets and ASNs involved.

## ARP Info

```
Address         Age (sec)  Hardware Addr   Interface
10.138.58.185     0:00:02  985d.82bf.0000  Port-Channel10.2
```

This will **only** show the customer side MAC address for this VRF. ARP is most importantly used for confirming Layer 2 connectivity, which is required before BGP can come up. If you don't see any data under `iv. ARP Info:` then we can confirm that means that there is no Layer 2 connectivity, and you'll need to work with the provider to resolve that.

NOTE: `Age (min)` indicates the amount of time since the ARP entry was last used. It increments from 0, and resets back to 0 as the ARP cache expires.

## Subinterface Info

```
Port-Channel10.2 is up, line protocol is up (connected)
  Hardware is Subinterface, address is e800.c540.0000
  Description: MSEE to service provider 900 link
  Internet address is 10.138.58.186/30
  Broadcast address is 255.255.255.255
  IP MTU 1500 bytes (default), BW 40000000 kbit
  Up 66 days, 15 hours, 2 minutes, 6 seconds
```

This just shows the subinterface details for this peering. It shows whether or not the subinterface is up or down (`is up, line protocol is up`).

<!--
## BFD Info

```
BFD is Configured but Down. Possible reasons are BFD not enabled on CE/PE neighbors, or genuine path issues between CE/PE and MSEE.

IPv4 Sessions
NeighAddr                              LD/RD         RH/RS     State     Int
10.225.0.5                           3480/0          Down      Down      Te1/1/9.17123
```

This shows if the [Bidirectional Forwarding Detection (BFD)](https://docs.microsoft.com/en-us/azure/expressroute/expressroute-bfd) session is up or down to the on-prem peer. In most cases, customers do not have BFD enabled on their side, so it'll report as "Down". Here's an example of it being "up":

```
IPv4 Sessions
NeighAddr                              LD/RD         RH/RS     State     Int
10.1.0.9                               56/6          Up        Up        Gi1/0/1
10.1.0.13                              62/14         Up        Up        Gi1/0/2
```
-->
# Contributors

* @<B0B19791-83EB-4561-9380-2B186BDF9BC7> 
* @<AAD67C1A-C862-4157-995E-B930B4652CED>
* @<F84DD2EA-3ED8-6E71-BBD4-86A47F7D8B78>
