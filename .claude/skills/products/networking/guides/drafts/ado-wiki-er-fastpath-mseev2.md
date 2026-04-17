---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/Features and Functions/ExpressRoute Fastpath"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20ExpressRoute/Features%20and%20Functions/ExpressRoute%20Fastpath"
importDate: "2026-04-17"
type: troubleshooting-guide
---

# ExpressRoute FastPath

[[_TOC_]]

## Feature Overview

ExpressRoute virtual network gateway is designed to exchange network routes and route network traffic. FastPath is designed to improve the data path performance between your on-premises network and your virtual network. When enabled, FastPath sends network traffic directly to virtual machines in the virtual network, bypassing the gateway.

What is FastPath?[](https://msazure.visualstudio.com/AzureWiki/_wiki/wikis/AzureWiki.wiki/587789/MSEEv2?anchor=what-is-fastpath%3F)
===================================================================================================================================

MSEEv2 and FastPath are synonyms. MSEEv2 is used internally, whereas FastPath is the customer-facing name used in [public doc](https://learn.microsoft.com/en-us/azure/expressroute/about-fastpath) . They both refer to one of the features of ExpressRoute which allows traffic coming from on-prem to azure to bypass the SLB and the gateway.
For example, before FastPath is enabled, traffic from on-prem to an azure vm travels these hops:

    on-prem -> MSEE -> SLB -> gateway -> azure vm
    

After FastPath is enabled, SLB and gateway hops will be bypassed:

    on-prem -> MSEE -> azure vm
    

Without FastPath, on-prem can only send maximum 10 Gbps to an azure vnet due to the bandwidth limitation of the gateway. With FastPath, since the gateway is bypassed, customers can potentially go **beyond** 10 Gbps (up to 100 Gbps per connection which is the maximum bandwidth offered by [ExpressRoute Direct](https://learn.microsoft.com/en-us/azure/expressroute/expressroute-erdirect-about) )
One important thing to note is that **FastPath doesn't affect the traffic from azure to on-prem**. Traffic of this direction travels the same hops no matter FastPath is enabled or not.

## Requirements

### Circuits

FastPath is available on all ExpressRoute circuits. Public preview support for Private Link connectivity over FastPath is available for connections associated to ExpressRoute Direct circuits. Connections associated to ExpressRoute partner circuits are not eligible for the preview.

### Gateway

FastPath still requires a virtual network gateway to be created to exchange routes between virtual network and on-premises network. For more information about virtual network gateways and ExpressRoute, including performance information and gateway SKUs, see [ExpressRoute virtual network gateways](https://docs.microsoft.com/en-us/azure/expressroute/expressroute-about-virtual-network-gateways).

To configure FastPath, the virtual network gateway must be either:

- Ultra Performance
- ErGw3AZ

## Limitations

While FastPath supports most configurations, it doesn't support the following features:

- Basic Load Balancer: If you deploy a Basic internal load balancer in your virtual network or the Azure PaaS service you deploy in your virtual network uses a Basic internal load balancer, the network traffic from your on-premises network to the virtual IPs hosted on the Basic load balancer will be sent to the virtual network gateway. The solution is to upgrade the Basic load balancer to a [Standard load balancer](https://docs.microsoft.com/en-us/azure/load-balancer/load-balancer-overview).

## Limitations Private Link



- Private Link: If you connect to a [private endpoint](https://docs.microsoft.com/en-us/azure/private-link/private-link-overview) in your virtual network from your on-premises network, the connection will go through the virtual network gateway.

If the customer is using FastPath and IS enabled for the feature for Private Link over FastPath, this currently isn't in GA: 

- Private Link with FastPath: Post to teams and TA will approve IcM to further investigate SDN Appliance that is in the path. 

If any questions regarding Private Link with FastPath, please reach out to @<F84DD2EA-3ED8-6E71-BBD4-86A47F7D8B78>. 

## Public Preview

The following FastPath features are in Public preview:

VNet Peering/UDR Support - FastPath will send traffic directly to any VM deployed in a virtual network peered to the one connected to ExpressRoute, bypassing the ExpressRoute virtual network gateway.

Private Link - Private Link traffic sent over ExpressRoute FastPath will bypass the ExpressRoute virtual network gateway in the data path. This preview is available in the following Azure Regions.

- Australia East
- East Asia
- East US
- East US 2
- North Central US
- North Europe
- South Central US
- South East Asia
- UK South
- West Central US
- West Europe
- West US
- West US 2
- West US 3

This preview supports connectivity to the following Azure Services:

- Azure Cosmos DB
- Azure Key Vault
- Azure Storage
- Third Party Private Link Services

This preview is available for connections associated to ExpressRoute Direct circuits. Connections associated to ExpressRoute partner circuits are not eligible for this preview.

## Enroll in Expressroute FastPath Features

[How to enroll in ExpressRoute FastPath features](https://docs.microsoft.com/en-us/azure/expressroute/expressroute-howto-linkvnet-arm#enroll-in-expressroute-fastpath-features-preview)

## Additional Info

### How it works (Microsoft internal, do not share with customer)
- When FastPath is Disabled, MSEE receives routes towards Azure Vnets from ExpressRoute gateway over BGP. So all the traffic towards Vnet goes via tunnel interface using GRE or VXLAN.
- When FastPath is Enabled, **in addition** to BGP advertisements from ExR gateway, MSEE is configured with Static more specific /32 routes to specific hosts/VMs.
- On the way from VMs/Hosts to MSEE, there is no difference between FastPath enabled and disabled.

What can go wrong:
* If MSEE was not programmed when Customer enables FastPath, no traffic drops happen. The traffic will still be routed over standard path, over ExR Gateway. No speed/latency improvement observed.
* If MSEE was not programmed when VMs moves from one Host to another (Live Migration, VM redeploy), this Will cause traffic drop, because MSEE will statically route traffic to the Host that previously had this VM on, and host will drop the traffic. New Host will not get this traffic. The issue should usually self-heal, when MSEE finally programmed.
* There can be situation when only one of MSEEs failed to program. In this case only part of traffic may be lost (going via this particular MSEE).

####Example: 

Vnet Address space: 192.168.0.0/24, and 2 VMs deployed in Vnet: 192.168.0.4 on host 10.1.2.3, and 192.168.0.5 on host 100.64.5.6.
So with FastPath on, MSEE will have 3 routes to Azure:

* 192.168.0.0/24 over VXLAN to ExpressRoute Gateway host, configured via BGP from ExR GW. Non-VM traffic (Load Balancer, Private Endpoint) will go this default path.
* 192.168.0.4 over VXLAN to Host 10.1.2.3, statically configured, and periodically updated by GatewayManager
* 192.168.0.5 over VXLAN to Host 100.64.5.6, statically configured and updated by GatewayManager.

If VM 192.168.0.5 migrates/redeploys from host 100.64.5.6 to host 100.64.8.9, but MSEE is not programmed accordingly, VXLAN traffic for this VM will still go to old host 100.64.5.6, and be dropped by Host.

## MSEEv2 route programming information/failure: [~~FlexRouteDashboard | Jarvis (msft.net)~~](https://jarvis-west.dc.ad.msft.net/dashboard/AznwErUSWest/MSEEv2/FlexRouteDashboard?overrides=[{%22query%22:%22//*[id=%27Environment%27]%22,%22key%22:%22value%22,%22replacement%22:%22%22},{%22query%22:%22//*[id=%27ServicePrefix%27]%22,%22key%22:%22value%22,%22replacement%22:%22%22},{%22query%22:%22//*[id=%27DeviceName%27]%22,%22key%22:%22value%22,%22replacement%22:%22%22},{%22query%22:%22//*[id=%27VrfId%27]%22,%22key%22:%22value%22,%22replacement%22:%22%22},{%22query%22:%22//*[id=%27VnetId%27]%22,%22key%22:%22value%22,%22replacement%22:%22%22},{%22query%22:%22//*[id=%27RoleInstance%27]%22,%22key%22:%22value%22,%22replacement%22:%22%22}]%20)  

- MSEEv2 Route Information: this dashboard represents information about routes fetched from MSEE, routes created on MSEE, and routes deleted from MSEE. There are 6 parameters at the top that can be filtered, out of which the “vnetId” is the most useful one. If customers create a VM, we should expect the routes to appear on the “routes created” dashboard; if customers delete a VM, we should expect the routes to appear on the “routes deleted” dashboard. 

- MSEEv2 Route Programming Failure: this dashboard represents route creation/deletion failure. If there are continuous failures, it means that routes are not being successfully programmed on MSEE, which can cause connectivity problems between on-prem and azure. 

- MSEEv2 Route Validation: whenever customers create/delete a VM, corresponding routes should be created on/deleted from MSEE. Customer side of things is identified as the “goal state”. This dashboard represents the number of mismatched routes between MSEE and goal state. For example, if customers create a VM but the routes fail to be created on MSEE, the routes will be flagged on the “missing routes” dashboard. 

## Status of the backend job that programs routes on MSEE: [~~DirectTunnelWorkItemDashboard | Jarvis (msft.net)~~](https://jarvis-west.dc.ad.msft.net/dashboard/AznwErUSWest/MSEEv2/DirectTunnelWorkItemDashboard?overrides=[{%22query%22:%22//*[id=%27Environment%27]%22,%22key%22:%22value%22,%22replacement%22:%22%22},{%22query%22:%22//*[id=%27ServicePrefix%27]%22,%22key%22:%22value%22,%22replacement%22:%22%22},{%22query%22:%22//*[id=%27DeviceName%27]%22,%22key%22:%22value%22,%22replacement%22:%22%22},{%22query%22:%22//*[id=%27RoleInstance%27]%22,%22key%22:%22value%22,%22replacement%22:%22%22}]%20) 

- In the backend, there is a long-running job that runs on each MSEE device-pair that is responsible for programming routes. If the job is healthy, it will emit a heartbeat signal every 5 seconds and there will be 60s/5s = 12 heartbeats per minute. If there have been no heartbeats for the past X minutes, it means no routes have been programmed on the MSEE for the X minutes. If customers created/deleted a VM in the X minutes, the routes would not have been reflected on the MSEE, causing connectivity problems. 

## GRPC failure on Juniper MSEE: [~~PerDeviceMseev2Failures | Jarvis (msft.net)~~](https://jarvis-west.dc.ad.msft.net/dashboard/AznwErUSWest/MSEEv2/Mseev2FailuresDashboard/PerDeviceMseev2Failures?overrides=[{%22query%22:%22//*[id=%27Environment%27]%22,%22key%22:%22value%22,%22replacement%22:%22%22},{%22query%22:%22//*[id=%27ServicePrefix%27]%22,%22key%22:%22value%22,%22replacement%22:%22%22},{%22query%22:%22//*[id=%27ErrorCode%27]%22,%22key%22:%22value%22,%22replacement%22:%22ExpressRouteMseev2GrpcFailure%22},{%22query%22:%22//*[id=%27DeviceName%27]%22,%22key%22:%22value%22,%22replacement%22:%22%22},{%22query%22:%22//*[id=%27RoleInstance%27]%22,%22key%22:%22value%22,%22replacement%22:%22%22}]%20) 
- For Juniper MSEE, we use a protocol called GRPC to program routes. There can be connectivity issues from the backend job to Juniper MSEE if there is a problem with the GRPC channel. This dashboard represents such a failure. If there are continuous GRPC failures, it means that routes cannot be programmed on MSEE. 

 

## Trouble-shooting guide: 

Most MSEEv2 problems are connectivity problems between on-prem and azure, and there can be many reasons. One of the most common reasons is that route changes are not programmed correctly on MSEE. When such issues happen, check the above dashboards and put the corresponding filters (servicePrefix, device, vrfId, vnetId, etc.) to help identify potential issues. 

# Contributors
- @<F84DD2EA-3ED8-6E71-BBD4-86A47F7D8B78> 
- Eric Spooner
- Alexey Vorobyev
