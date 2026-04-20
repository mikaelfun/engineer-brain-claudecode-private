---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/How To/Discover Topology From AS_Path, Origin, and Community"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20ExpressRoute/How%20To/Discover%20Topology%20From%20AS_Path%2C%20Origin%2C%20and%20Community"
importDate: "2026-04-18"
type: troubleshooting-guide
---

# How to Discover Networking Topology via AS_PATH, Origin, and Community
[[_TOC_]]
## 1 Description

When engineer handles networking cases, an important initial step is to understand the traffic path. This document focuses on the Express Route gateway learned route table to determine the destination route prefix location. 
To understand the knowledge deeply, it demonstrates theory as well.
The related theory can also be applied to VPN gateways or Route servers.

## 2 Express Route Gateway Route Table Scenario

In Azure networking, a route table includes the following route attributes: Local Address, Network, NextHop, SourcePeer, Origin, AsPath, Weight, BGP Communities. 
Combining these attributes helps identify the destination route prefix location.
Below route table includes the most connectivity scenario for an Express Route Gateway.
Local Address is the Express Route gateway instance IP, Network in the second column is the destination route prefix.

**Note:** Customer’s production may not include all those scenarios.
This table can be used as a quick reference, and the remaining part demonstrates in detail.

![Express Route Gateway Learn Route Table](/.attachments/Topology/ERGW_Learn_Route_Table.png)

| Number | Scenario | Key Point |
|:---------:|---------|---------|
| 1    |Hub or spoke vnet          | Origin Network    |
| 2    | NVA---RS---ERGW in Hub Vnet    | Origin IBGP, Community FFEDFFED    |
| 3    | On-premise---MSEE---ERGW in Hub Vnet    | Origin EBGP, 12076    |
| 4   | VNET2---MSEE---Hub Vnet    | Origin EBGP, Double 12076    |
| 5    | On-premise—circuit 3----Global Reach---circuit2 ---ERGW in Hub Vnet    | 3 continuous 12076    |
| 6    | VNET1---circuit 1---on-premise1---on-premise2---circuit 2---ERGW in Hub Vnet    | Head and tail ASN is 12076    |
| 7    | Vnet 4---circuit 3----Global Reach---circuit2 ---ERGW in Hub Vnet    | 4 continuous 12076    |

![Topology](/.attachments/Topology/ERGW_Learn_Route_to_Topology.png)

### 2.1 Hub or Spoke VNET (Local)

**Key Point:** Origin is Network  
This indicates that the route is located in the Hub Vnet where the Express Route gateway is located or in the peering spoke Vnet.

### 2.2 NVA---Route Server---Express Route Gateway

**Key Point:** Origin IBGP, Community FFEDFFED  
As we know, there is only VPN gateway or Route server (Route service, RS for short) can establish IBGP session with Express Route gateway.
In case of Cortex, the RS will tag the routes reachable over VPN with "65517:65517 (FFEDFFED)" and there will be no BGP peering between VPN GWT and ER GWT.
In this example, the route 10.40.68.0/23 learned from IBGP peer with community FFEDFFED, so this route is from RS, the ASN 64826 is initial from a NVA which establish EBGP with RS.

In other hand, if the route learns from IBGP peer without community FFEDFFED, it means this route is from VPN gateway.

When ExpressRoute Gateway receives BGP route with community FFEDFFED from MSEE, ExpressRoute Gateway will drop it.
The drop will be logged in GatewayTenantLogsTable, as shown below. The IP address 10.10.10.101 is the tunnel IP address of MSEE.

<BGP> RM #2: Routing Policy DropCommunityFrom_10.10.10.101_ForCommunity_65517:65517 Action is Drop

When BGP route with community FFEDFFED is sent to on-premises via ExpressRoute Circuit, the community FFEDFFED will not be stripped.
In some scenarios, customer will send such BGP route with community FFEDFFED back to Azure via another ExpressRoute Circuit. It will be valid in MSEE routing table. But when MSEE advertise it to ExpressRoute Gateway, ExpressRoute Gateway will drop it due to routing policy.
**This drop policy is only enabled in ERGW when ERGW has BGP neighbor with RS.** If there is no BGP neighbor with RS, ERGW will not drop BGP route with community FFEDFFED.

When a VPN Gateway uses an autonomous system number (ASN) other than 65515, it may attempt to advertise prefixes to the Route Server that include 65515 in the AS path or FFED in the community. The Route Server will drop any prefixes from the VPN Gateway that have a community starting with FFED.
Since the VPN Gateway is using a custom ASN, it establishes an eBGP connection to the Route Server rather than an iBGP connection. Consequently, any prefixes advertised to the Route Server from that VPN Gateway that include 65515 in the AS path will also be dropped due to standard BGP loop avoidance.
The example below illustrates a route learned by the Route Server from a VPN Gateway configured with ASN 65442. The Route Server drops the prefix due to the community FFED2F2C:FFEDFFED, and thus, does not advertise it to the ExpressRoute Gateway

<BGP> RM #2: Routing Policy _Egress_Drop_Remote_ER_Routes_10.206.235.236 Action is Drop, modified route prefix 10.0.0.0/8 attributes AFI/SAFI=IPv4:Unicast Origin=Egp NextHop=10.206.235.238 NextHopLl= AsPathSeq=65442-65534-65446 AsPathSet= LocalPref=100 Med= Communities=00002F2C:0000C750:23299203:369B2AFF:FFAB0002:FFED2F2C:FFEDFFED weight 32768, inbound route prefix 10.0.0.0/8 attributes AFI/SAFI=IPv4:Unicast Origin=Egp NextHop=10.206.235.238 NextHopLl= AsPathSeq=65442-65534-65446 AsPathSet= LocalPref=100 Med= Communities=00002F2C:0000C750:23299203:369B2AFF:FFAB0002:<span style="color: red;">FFED2F2C:FFEDFFED</span> weight 32768 

### 2.3 On-premise---MSEE---ERGW in Hub Vnet

**Key Point:** Origin EBGP, 12076 + On-premise ASN  
As we know, only MSEE can establish EBGP session with Express Route gateway.
When a router advertises route to its EBGP neighbor, every router will add its own ASN to the route, and remains all previous ASN, such as written in the route is called AS_PATH.

In this example, the route 165.195.246.192/26 has 4 items, the first 2 items are from EBGP peers with weight 32769, and the other 2 items are from IBGP peers with weight 32768, and with community FFEDFFED as well.
So, we can know the last 2 items are from RS, and the first 2 items will be preferred for the Express Route gateway, and then the second one will be added to Express route gateway Adjacency table since it has shorter AS_PATH than the first one. That is expectation that customer prefer just go through one MSEE for the traffic from Azure to on-premise. From the AS_PATH, we can know customer prepends 2 more ASN 64565 in the secondary BGP session.

### 2.4 VNET2---MSEE---Hub Vnet

**Key Point:** Origin EBGP, Double 12076  
VNET 2 Express Route gateway and Hub Vnet Express Route gateway connect to the same circuit. 
VNET 2 Express Route gateway adds its own ASN 65515 when it advertises its route to MSEE, MSEE receives those routes, add 12076 (AS_PATH 12076 65515) to the route when MSEE advertise them to Hub Vnet Express Route gateway and on-premise. When Hub Vnet Express Route gateway receives these routes, it will drop them due to the AS_PATH include itself ASN 65515.
To overcome it, MSEE uses as-override feature when it establishes EBGP with Express Route gateway, with it, the original ASN 65515 will be override by 12076.

Circuit 2 Configuration:
```
   address-family ipv4 vrf 13a07d3bbe46407d9ea7d74f493a7079
    neighbor 10.40.0.141 remote-as 65515
    neighbor 10.40.0.141 ebgp-multihop 2
    neighbor 10.40.0.141 activate
    neighbor 10.40.0.141 send-community
    neighbor 10.40.0.141 as-override
    neighbor 10.40.0.141 route-map AS_PREPEND out
 ```  

### 2.5 On-premise—circuit 3----Global Reach---circuit2 ---ERGW in Hub Vnet

**Key Point:** Origin EBGP, 3 continuous 12076  
When On-premise 3 advertises route to Circuit 3, the AS_PATH is ‘64501 12076’.
Then Circuit 3 advertises route to Circuit 2, it will add community 12076:12077 to the route.
Then Circuit 2 advertises route to Hub Vnet Express Route gateway, it will execute a route-map to match the route with community ‘12076:12077’ and prepend two more 12076 to the AS_PATH.
Circuit 3 Configuration:
Step1: Use a route map to add community 12076:12077
```
   route-map TRANSPORT permit 10 
    set community 12076:12077
```
Step2: Apply the route map to the global reach BGP neighbor
```
   address-family ipv4 vrf ed8a82e1403842babad6a685a27a1af0
    neighbor 10.187.32.9 remote-as 12076
    neighbor 10.187.32.9 ebgp-multihop 2
    neighbor 10.187.32.9 activate
    neighbor 10.187.32.9 send-community
    neighbor 10.187.32.9 route-map TRANSPORT out
```
Circuit 2 Configuration:
Step1: Define community
```
   ip community-list standard TRANSPORT_COM permit 12076:12077
```
Step2: Use Route map to match the community and prepend 2 more 12076
```
   route-map AS_PREPEND permit 10 
    match community TRANSPORT_COM
    set as-path prepend 12076 12076
```
Step3: Apply the route map to the BGP neighbor with Express Route gateway
```
   address-family ipv4 vrf 13a07d3bbe46407d9ea7d74f493a7079
    neighbor 10.40.0.141 remote-as 65515
    neighbor 10.40.0.141 ebgp-multihop 2
    neighbor 10.40.0.141 activate
    neighbor 10.40.0.141 send-community
    neighbor 10.40.0.141 as-override
    neighbor 10.40.0.141 route-map AS_PREPEND out
```

### 2.6 VNET1---circuit 1---on-premise1---on-premise2---circuit 2---ERGW in Hub Vnet

**Key Point:** Head and tail ASN is 12076  
For the tail ASN is 12076, engineers may think this route is initial from MSEE, that is wrong. MSEE will remove private ASN when it advertises route to on-premise, so this route should be located in Azure.
In this scenario, those route from VNET 1 with AS_PATH 12076 on on-premise1 router, when it advertises from on-premise 2 to Circuit 2, MSEE will discard it due to the route AS_PATH includes 12076 same as itself.
To overcome it, MSEE uses allowas-in feature, MSEE will accept route which include one 12076.
```
   address-family ipv4 vrf efdbeb2ae12446dfa6801753b77d820c
    neighbor 100.100.0.33 remote-as 65001
    neighbor 100.100.0.33 fall-over bfd
    neighbor 100.100.0.33 activate
    neighbor 100.100.0.33 send-community
    neighbor 100.100.0.33 remove-private-as
    neighbor 100.100.0.33 allowas-in 2
    neighbor 100.100.0.33 route-map DIVERT_TRAFFIC in
    neighbor 100.100.0.33 route-map DIVERT_TRAFFIC out
    neighbor 100.100.0.33 maximum-prefix 4000 80 restart 1
```

### 2.7 Vnet 4---circuit 3----Global Reach---circuit2 ---ERGW in Hub Vnet

**Key Point:** 4 continuous 12076  
It is combined from scenarios 2.4 and 2.5.
It uses as-override to override 65515 with 12076 for the route from vnet 4, and prepend 2 more 12076 when circuit 2 advertises them to Express Route gateway in Hub Vnet.

# Contributor
@<60DAE1D7-C64E-6DF7-81AC-EF27886A3842>