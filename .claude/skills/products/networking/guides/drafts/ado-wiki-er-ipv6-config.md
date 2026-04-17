---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/Features and Functions/ExpressRoute IPv6 Configuration and Monitoring"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20ExpressRoute/Features%20and%20Functions/ExpressRoute%20IPv6%20Configuration%20and%20Monitoring"
importDate: "2026-04-17"
type: troubleshooting-guide
---

Networking

[[_TOC_]]

## Description

Customers can now use IPv6 from on-premises through ExpressRoute to O365 and Private Peering.

## Feature Overview

- Introduced at Ignite 2017 - \[ Public Reference Pending\]
- Added Private Peering for IPv6 Ignite March 2021 (Preview)

## Case Handling

The Azure Networking POD will assist customers with configuration of the ExpressRoute tunnel and validation of configuration. For connectivity related issues Azure Networking POD should validate configuration and collaborate with O365 support if configuration checks out.

## Azure Support Center

[Request Feature](https://cloudes.uservoice.com/forums/561862-azure-support-center)
Feature configuration
Flagged for known issues

## MDM

**Query Reference \#1**

## Private Peering IPv6

New Capabilities:
- Establish BGP sessions between the customer and Microsoft edge over ExpressRoute using IPv4 subnets, IPv6 subnets, or both
- Connect to dual-stack deployments in Azure using a new or existing ExpressRoute  gateway
- Use FastPath with an ExpressRoute connection to route IPv6 traffic

### How To Configure

Public Documentation: [Add IPv6 support for private peering using Azure PowerShell (Preview)](https://docs.microsoft.com/en-us/azure/expressroute/expressroute-howto-add-ipv6-powershell)

#### Register for Public Preview

```
Connect-AzAccount 

Select-AzSubscription -Subscription "<SubscriptionID or SubscriptionName>"

Register-AzProviderFeature -FeatureName AllowIpv6PrivatePeering -ProviderNamespace Microsoft.Network

```
#### Add IPv6 Private Peering to your ExpressRoute circuit

```
Set-AzExpressRouteCircuitPeeringConfig -Name "AzurePrivatePeering" -ExpressRouteCircuit $ckt -PeeringType AzurePrivatePeering -PeerASN 100 -PrimaryPeerAddressPrefix "3FFE:FFFF:0:CD30::/126" -SecondaryPeerAddressPrefix "3FFE:FFFF:0:CD30::4/126" -VlanId 200 -PeerAddressType IPv6

Set-AzExpressRouteCircuit -ExpressRouteCircuit $ckt
```

#### Enable IPv6 on your existing ExpressRoute gateway

```
$gw = Get-AzVirtualNetworkGateway -Name "GatewayName" -ResourceGroupName "ExpressRouteResourceGroup" 
Set-AzVirtualNetworkGateway -VirtualNetworkGateway $gw
```
**Note:** Before enabling IPv6 on an existing ExpressRoute gateway, an IPv6 range must be added to GatewaySubnet.

### Private Peering Limitations
While IPv6 support is available for connections to deployments in regions with Availability Zones, it doesn't support the following use cases:
- Connections to deployments in Azure via a non-AZ ExpressRoute gateway SKU
- Connections to deployments in non-AZ regions
- Global Reach connections between ExpressRoute circuits
- Use of ExpressRoute with virtual WAN
- FastPath with non-ExpressRoute Direct circuits
- FastPath with circuits in the following peering locations: Dubai
- Coexistence with VPN Gateway


## Microsoft Peering IPv6

PowerShell Output of working configuration:

```
PS C:\windows\system32> $ckt04
AllowClassicOperations           : False
CircuitProvisioningState         : Enabled
ServiceProviderProvisioningState : Provisioned
Peerings                         : {MicrosoftPeering}
Authorizations                   : {}
ServiceKey                       : 00000000-0000-0000-0000-000000000000
ServiceProviderNotes             : 
ServiceProviderProperties        : Microsoft.Azure.Commands.Network.Models.PSServiceProviderProperties
Sku                              : Microsoft.Azure.Commands.Network.Models.PSExpressRouteCircuitSku
ProvisioningState                : Succeeded
GatewayManagerEtag               : 58
SkuText                          : {
                                      "Name": "Premium_MeteredData",
                                      "Tier": "Premium",
                                      "Family": "MeteredData"
                                    }
ServiceProviderPropertiesText    : {
                                      "ServiceProviderName": "Equinix",
                                      "PeeringLocation": "Seattle",
                                      "BandwidthInMbps": 1000
                                    }
PeeringsText                     : [
                                      {
                                        "Name": "MicrosoftPeering",
                                        "Etag": "W/\"00000000-0000-0000-0000-000000000000\"",
                                        "Id": "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/SEA-Cust04/providers/Microsoft.Network/expressRouteCircu
                                    its/SEA-Cust04-ER/peerings/MicrosoftPeering",
                                        "PeeringType": "MicrosoftPeering",
                                        "State": "Enabled",
                                        "AzureASN": 12076,
                                        "PeerASN": 65020,
                                        "PrimaryPeerAddressPrefix": "63.243.229.104/30",
                                        "SecondaryPeerAddressPrefix": "63.243.229.108/30",
                                        "PrimaryAzurePort": "",
                                        "SecondaryAzurePort": "",
                                        "VlanId": 40,
                                        "MicrosoftPeeringConfig": {
                                          "AdvertisedPublicPrefixes": [
                                            "63.243.229.40/32",
                                            "63.243.229.44/32"
                                          ],
                                          "AdvertisedPublicPrefixesState": "Configured",
                                          "CustomerASN": 0,
                                          "RoutingRegistryName": "NONE"
                                        },
                                        "ProvisioningState": "Succeeded",
                                        "GatewayManagerEtag": "58",
                                        "LastModifiedBy": "Customer",
                                        "RouteFilter": {
                                          "Id": 
                                    "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/SEA-Cust04/providers/Microsoft.Network/routeFilters/Pilot6"
                                        },
                                        "Ipv6PeeringConfig": {
                                          "PrimaryPeerAddressPrefix": "2001:5A0:4406:FFD8::/126",
                                          "SecondaryPeerAddressPrefix": "2001:5A0:4406:FFD8::4/126",
```
Customer side router output of working configuration:

```
sea-asr06-01#show bgp vrf 40 vpnv6 unicast summary
BGP router identifier 10.100.100.103, local AS number 65020
BGP table version is 345866, main routing table version 345866
BGP activity 11979/9109 prefixes, 13757/10607 paths, scan interval 60 secs
    
Neighbor        V           AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
2001:5A0:4406:FFD8::2
                        4        12076      32      33   345866    0    0 00:25:50        0
```

### Add IPv6 Route Filter for Microsoft Peering to ExpressRoute Circuit

```
$routefilter = Get-AzRouteFilter -Name "Route-Filter-01" -ResourceGroupName "ExpressRoute-CKT-1"

$ckt = Get-AzExpressRouteCircuit -Name "ExR01" -ResourceGroupName "ExpressRoute-CKT-1"


Add-AzExpressRouteCircuitPeeringConfig -Name "MicrosoftPeering" -ExpressRouteCircuit $ckt -PeeringType MicrosoftPeering -PeerASN 100 -PeerAddressType IPv6 -PrimaryPeerAddressPrefix "3FFE:FFFF:0:CD30::/126" -SecondaryPeerAddressPrefix "3FFE:FFFF:0:CD30::4/126" -VlanId 300 -MicrosoftConfigAdvertisedPublicPrefixes "3FFE:FFFF:0:CD31::/120" -MicrosoftConfigCustomerAsn 23 -MicrosoftConfigRoutingRegistryName "ARIN" -RouteFilter $routefilter

Set-AzExpressRouteCircuit -ExpressRouteCircuit $ckt
```
### Add IPv4 & IPv6 for Microsoft Peering with Office 365 

```
$ckt = Get-AzExpressRouteCircuit -Name "ExR01" -ResourceGroupName "ExpressRoute-CKT-1"
$routefilter = Get-AzRouteFilter -Name "Route-Filter-01" -ResourceGroupName "ExpressRoute-CKT-1"

## Add IPv4 First:

Add-AzExpressRouteCircuitPeeringConfig -Name "MicrosoftPeering" -ExpressRouteCircuit $ckt -PeeringType MicrosoftPeering -PeerASN 100 -PeerAddressType IPv4 -PrimaryPeerAddressPrefix "123.0.0.0/30" -SecondaryPeerAddressPrefix "123.0.0.4/30" -VlanId 300 -MicrosoftConfigAdvertisedPublicPrefixes "123.1.0.0/24" -MicrosoftConfigCustomerAsn 23 -MicrosoftConfigRoutingRegistryName "ARIN" -RouteFilter $routefilter

## Set IPv6: 

Set-AzExpressRouteCircuitPeeringConfig -Name "MicrosoftPeering" -ExpressRouteCircuit $ckt -PeeringType MicrosoftPeering -PeerASN 100 -PeerAddressType IPv6 -PrimaryPeerAddressPrefix "3FFE:FFFF:0:CD30::/126" -SecondaryPeerAddressPrefix "3FFE:FFFF:0:CD30::4/126" -VlanId 300 -MicrosoftConfigAdvertisedPublicPrefixes "3FFE:FFFF:0:CD31::/120" -MicrosoftConfigCustomerAsn 23 -MicrosoftConfigRoutingRegistryName "ARIN" -RouteFilter $routefilter

## Set Circuit:

Set-AzExpressRouteCircuit -ExpressRouteCircuit $ckt

```


Portal view of working configuration:

![Route table summary (Primary) Records ](/.attachments/528px-ANPExrIPv6Portal.jpg)

### ACIS

Dump Circuit of working configuration:

```
================================================================================================
SUBSCRIPTION ID: 00000000-0000-0000-0000-000000000000
SERVICE KEY: 00000000-0000-0000-0000-000000000000
CIRCUIT NAME: SEA-Cust04-ER
CIRCUIT LOCATION: Seattle
CIRCUIT SKU: Premium
BANDWIDTH: 1000
BILLING TYPE: MeteredData
PRIMARY DEVICE: wst-06gmr-cis-3
SECONDARY DEVICE: wst-06gmr-cis-4
SERVICE PROVIDER: Equinix
SERVICE PROVIDER TAG(STAG): 45
PROVISIONING STATE: Provisioned
CIRCUIT STATE: Enabled
NRP RESOURCE URI: https://westus2.network.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/SEA-Cust04/providers/Microsoft.Network/expressRouteCircuits/SEA-Cust04-ER
CIRCUIT CREATION TIME (UTC): 02/25/2017 01:36:55
MICROSOFT PEERING AUTHORIZED: True
AUTHORIZATIONS: 0, USED: 0
------------------------------------------------------------------------------------------------
VRF NAME: Global, TYPE: Microsoft
PEER CREATION TIME (UTC): 08/07/2017 19:25:16
PEER ASN: 65020
IPv4: True, IPv6: True
PEER IP: 63.243.229.105 , SUBNET: 63.243.229.104/30
PEER IPv6: 2001:5a0:4406:ffd8::1 , SUBNETv6: 2001:5A0:4406:FFD8::/126
LEGACY MODE: False
ADVERTISED PREFIXES STATE: Configured
ADVERTISED PREFIXES: 63.243.229.40/32,63.243.229.44/32
CUSTOMER ASN: 0
ROUTING REGISTRY: NONE
VALIDATION NEEDED ADVERTISED PREFIXES: 
ROUTE FILTER URI: /subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/SEA-Cust04/providers/Microsoft.Network/routeFilters/Pilot6
ADVERTISED SERVICES: CRM Online
ADVERTISED PREFIXES STATEv6: Configured
ADVERTISED PREFIXESv6: 2001:5A0:4406:FFD8::/61
CUSTOMER ASNv6: 0
ROUTING REGISTRYv6: NONE
VALIDATION NEEDED ADVERTISED PREFIXESv6: 
ROUTE FILTER URIv6: 
ADVERTISED SERVICESv6: CRM Online IPv6
VLAN ID(CTAG): 40
DEVICE NAME: wst-06gmr-cis-3 PA: 10.20.88.10
LINKED CORE ROUTERS: wst-96cbe-1a,wst-96cbe-1b
SUBINTERFACE NAME: Port-Channel10.4540, IP: 63.243.229.106 IPv6: 2001:5a0:4406:ffd8::2
------------------------------------------------------------------------------------------------
VRF NAME: Global, TYPE: Microsoft
PEER CREATION TIME (UTC): 08/07/2017 19:25:16
PEER ASN: 65020
IPv4: True, IPv6: True
PEER IP: 63.243.229.109 , SUBNET: 63.243.229.108/30
PEER IPv6: 2001:5a0:4406:ffd8::5 , SUBNETv6: 2001:5A0:4406:FFD8::4/126
LEGACY MODE: False
ADVERTISED PREFIXES STATE: Configured
ADVERTISED PREFIXES: 63.243.229.40/32,63.243.229.44/32
CUSTOMER ASN: 0
ROUTING REGISTRY: NONE
VALIDATION NEEDED ADVERTISED PREFIXES: 
ROUTE FILTER URI: /subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/SEA-Cust04/providers/Microsoft.Network/routeFilters/Pilot6
ADVERTISED SERVICES: CRM Online
ADVERTISED PREFIXES STATEv6: Configured
ADVERTISED PREFIXESv6: 2001:5A0:4406:FFD8::/61
CUSTOMER ASNv6: 0
ROUTING REGISTRYv6: NONE
VALIDATION NEEDED ADVERTISED PREFIXESv6: 
ROUTE FILTER URIv6: 
ADVERTISED SERVICESv6: CRM Online IPv6
VLAN ID(CTAG): 40
DEVICE NAME: wst-06gmr-cis-4 PA: 10.20.88.11
LINKED CORE ROUTERS: wst-96cbe-1b,wst-96cbe-1a
SUBINTERFACE NAME: Port-Channel10.4540, IP: 63.243.229.110 IPv6: 2001:5a0:4406:ffd8::6
================================================================================================
```

### Limitations

- IPv6 is supported only for Microsoft peering and Private Peering.
- IPv6 is an optional configuration on Microsoft peering and Private Peering.
- Customers requiring IPv6 connectivity to Office 365 are required to setup IPv4 peering in addition to IPv6.
- ASN, VLAN ID, stay the same across IPv4 and IPv6.
- The same route filter URI needs to be provided for both v4 and v6.
- There will be no portal experience at launch. We will get a portal experience post Ignite.

## Known Issues

## Public Documentation
[Add IPv6 support for private peering using Azure PowerShell (Preview)](https://docs.microsoft.com/en-us/azure/expressroute/expressroute-howto-add-ipv6-powershell)

[ExpressRoute circuits and peering](https://docs.microsoft.com/en-us/azure/expressroute/expressroute-circuit-peerings#routing-domain-comparison)

## Other Resources

## Contributors
- @<B25A8233-5EFB-4BBE-BAB3-2BCE78CD15A6> 
- @<F84DD2EA-3ED8-6E71-BBD4-86A47F7D8B78>

