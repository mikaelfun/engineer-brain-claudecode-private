---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/Features and Functions/ExpressRoute Gateway Maintenance with Private Endpoint Traffic"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20ExpressRoute/Features%20and%20Functions/ExpressRoute%20Gateway%20Maintenance%20with%20Private%20Endpoint%20Traffic"
importDate: "2026-04-17"
type: troubleshooting-guide
---

# Impact expectations during ExpressRoute gateway maintenance for Private Endpoint traffic

[[_TOC_]]

## Behavior applies for traffic from
- On-premises to Private Endpoint IP (via ExpressRoute)
- VM (in VNET1) to Private Endpoint IP (in VNET2) via ExpressRoute gateway in both VNETs

### Initial (Before Pinning)
- After the 3-way Handshake, the flow is pinned to any of the ExpressRoute gateway instances (i.e. ergw_0 to ergw_5)'s HOST
- This flow will remain on the same HOST (i.e. instance) for the duration of its lifetime

### Host Maintenance
- The ExpressRoute gateway instance is not moved / destroyed
- If the application is aggressive enough with connection retries / maintenance, the connection will be torn down (i.e. flow expired) and a new connection will go to a different ExpressRoute gateway instance
- If the application does not have a good retry logic and long timeout, the application/user may experience hang/unresponsiveness for the timeout period, until a new connection is established
- During HOST maintenance, even if the HOST is back ONLINE, connectivity will not be restored to the affected ExpressRoute gateway instance, until the instance is back online

### Guest Maintenance / GWM Updates
- The flow will remain on the same instance/HOST
- As the gateway instance container is not destroyed, the flow will not be terminated
- If the application is aggressive enough with connection retries / maintenance, it will drop the connection and start a new one
- If the application does not have a good retry logic and long timeout, the application/user may experience hang/unresponsiveness for the timeout period, until a new connection is established
- The new connection (flow) will be load balanced across the other gateway instances

_**Note:** The expectation for all return traffic is to bypass the gateway, but for Private Endpoint destinations, return traffic goes through the gateway_


## ExpressRoute FAQ
In public documentation we call out the following: 
> 
> During a maintenance period, you may experience intermittent connectivity issues to private endpoint resources.
> 
[ExperssRoute FAQ](https://learn.microsoft.com/en-us/azure/expressroute/expressroute-faqs#performance-results)

## Public Documentation
- [ExpressRoute FAQ](https://learn.microsoft.com/en-us/azure/expressroute/expressroute-faqs#performance-results)
- [Connectivity to Private Endpoints](https://learn.microsoft.com/en-us/azure/expressroute/expressroute-about-virtual-network-gateways#connectivity-to-private-endpoints)
