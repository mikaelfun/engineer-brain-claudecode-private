---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/Features and Functions/ExpressRoute Global Reach"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20ExpressRoute/Features%20and%20Functions/ExpressRoute%20Global%20Reach"
importDate: "2026-04-17"
type: troubleshooting-guide
---

# ExpressRoute Global Reach

[[_TOC_]]

## Description

ExpressRoute Global Reach is an Azure service that connects your on-premises networks via the ExpressRoute service through Microsoft's global network.

## Feature Overview

With ExpressRoute Global Reach, you can link ExpressRoute circuits together to make a private network between your on-premises networks.  ExpressRoute Global Reach now supports IPv6 on dual-stack circuits. 

## Public Preview

| Release Date | Feature| Description |
|--|--|--|
| 05/17/22 | Preview: IPv6 Support Global Reach | IPv6 support for ExpressRoute Global Reach is now in Public Preview. If you want to enable this feature for test workloads, select "Both" for the Subnets field and include a /125 IPv6 subnet for the Global Reach IPv6 subnet. |
| 08/29/22 | GA: IPv6 Support Global Reach | IPv6 support for Global Reach unlocks connectivity between on-premise networks, via the Microsoft backbone, for customers with dual-stack workloads. Establish Global Reach connections between ExpressRoute circuits using IPv4 subnets, IPv6 subnets, or both. This configuration can be done using Azure Portal, PowerShell, or CLI.|

## Use Case

ExpressRoute Global Reach is designed to complement your service provider’s WAN implementation and connect your branch offices across the world. For example, if your service provider primarily operates in the United States and has linked all of your branches in the U.S., but the service provider doesn’t operate in Japan and Hong Kong, with ExpressRoute Global Reach you can work with a local service provider and Microsoft will connect your branches there to the ones in the U.S. using ExpressRoute and our global network.

**Availability**

ExpressRoute Global Reach currently is supported in the following places:

* Australia
* Canada
* France
* Germany
* Hong Kong SAR
* Ireland
* Japan
* Korea
* Netherlands
* New Zealand
* Norway
* Singapore
* South Africa (Johannesburg only)
* Sweden
* Switzerland
* United Kingdom
* United States


Your ExpressRoute circuits must be created at the ExpressRoute peering locations in the above countries or region. To enable ExpressRoute Global Reach between different geopolitical regions, your circuits must be Premium SKU.  

## How To

### How to Enable ExpressRoute Global Reach

Overview: [About ExpressRoute Global Reach](https://docs.microsoft.com/en-us/azure/expressroute/expressroute-global-reach)  
Refer to the Public Documentation at the bottom of this wiki.

### How to view the connection object

New "Connections" object. It is child of peering object and the grand child of the circuit object.  
"Get-AzureRmExpressRouteCircuit" to verify and view the new connections object.  

![Connection Object information](/.attachments/600px-ConnectionsObject.jpg)

## How to view the routes associated with Global Reach connection

The associated routes will show up in the route table with the BGP peer ID.  
![Private Peering and route table](/.attachments/600px-RouteTable.jpg)

## Troubleshooting

### How to view the dump circuit information

[Jarvis\>Brooklyn\>ExR Diagnostic Operations\>Dump Circuit Information](https://portal.microsoftgeneva.com/1B3128CB?genevatraceguid=b69b9ba4-ead4-4068-b06a-13c96c4f07f6)  

```
Dump circuit information output :
================================================================================================
SUBSCRIPTION ID: 00000000-0000-0000-0000-000000000000
SERVICE KEY: 00000000-0000-0000-0000-000000000000
CIRCUIT NAME: WeightTestBoydton
CIRCUIT LOCATION: Boydton
GATEWAY MANAGER REGION: East US 2
GATEWAY MANAGER REGION MONIKER: BN
CIRCUIT SKU: Standard
BANDWIDTH: 50
BILLING TYPE: MeteredData
ALLOW GLOBAL REACH: TRUE
PRIMARY DEVICE: bn1-06gmr-cis-1
SECONDARY DEVICE: bn1-06gmr-cis-2
SERVICE PROVIDER: MSIT
SERVICE PROVIDER TAG(STAG): 114
PROVISIONING STATE: Provisioned
CIRCUIT STATE: Enabled
NRP RESOURCE URI: https://westus2.network.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/MSIT-ER/providers/Microsoft.Network/expressRouteCircuits/WeightTestBoydton
CIRCUIT CREATION TIME (UTC): 11/11/2016 00:29:26
O365 SERVICES AUTHORIZED: False
AUTHORIZATIONS: 0, USED: 0
------------------------------------------------------------------------------------------------
VRF NAME: 015f6450fc4244aeb6be294dc6d09ef9, TYPE: Private
PEER CREATION TIME (UTC): 11/11/2016 00:43:48
PEER ASN: 78
BGP STATE v4: Enabled, v6: 
IPv4: True, IPv6: False
PEER IP: 10.5.0.1 , SUBNET: 10.5.0.0/30
VLAN ID(CTAG): 92
DEVICE NAME: bn1-06gmr-cis-1 PA: 10.20.78.108
PORT NAME: port-channel10, BW: 40000
SUBINTERFACE NAME: port-channel10.11492, IP: 10.5.0.2 IPv6: 
TUNNEL NAME: tunnel246452480 IP: 10.190.255.4 KEY(MSEE): 246452480 KEY(VFP): 962705 KEY(RNM): 962705 VNET NAME: VNet2 VNET ID: 00000000-0000-0000-0000-000000000000 ENCAP TYPE: IpInGre GWID: 00000000-0000-0000-0000-000000000000 DIRECT TUNNEL: False TUNNEL SOURCE IP: 10.20.78.108
TRANSIT TUNNEL INFO: tunnel246481664 PEER CIRCUIT: 00000000-0000-0000-0000-000000000000 VxLAN KEY: 246481664 ISOWNER: True TUNNEL IP: 10.13.0.1 PEER TUNNEL IP: 10.13.0.3  PA: 10.20.78.108 PEER PA: 10.20.78.120 
------------------------------------------------------------------------------------------------
VRF NAME: 92623670fab0428095be2359a83c99d6, TYPE: Private
PEER CREATION TIME (UTC): 11/11/2016 00:43:48
PEER ASN: 78
BGP STATE v4: Enabled, v6: 
IPv4: True, IPv6: False
PEER IP: 10.5.0.5 , SUBNET: 10.5.0.4/30
VLAN ID(CTAG): 92
DEVICE NAME: bn1-06gmr-cis-2 PA: 10.20.78.109
PORT NAME: port-channel10, BW: 40000
SUBINTERFACE NAME: port-channel10.11492, IP: 10.5.0.6 IPv6: 
TUNNEL NAME: tunnel246452480 IP: 10.190.255.5 KEY(MSEE): 246452480 KEY(VFP): 962705 KEY(RNM): 962705 VNET NAME: VNet2 VNET ID: 00000000-0000-0000-0000-000000000000 ENCAP TYPE: IpInGre GWID: 00000000-0000-0000-0000-000000000000 DIRECT TUNNEL: False TUNNEL SOURCE IP: 10.20.78.109
TRANSIT TUNNEL INFO: tunnel246481664 PEER CIRCUIT: 00000000-0000-0000-0000-000000000000 VxLAN KEY: 246481664 ISOWNER: True TUNNEL IP: 10.13.0.2 PEER TUNNEL IP: 10.13.0.4  PA: 10.20.78.109 PEER PA: 10.20.78.121
================================================================================================
```
## Debugbot Output

Debugbot is already updated to provide details regarding this new feature.  
[Debugbot sample output](https://microsoft-my.sharepoint.com/:u:/g/personal/yagohel_microsoft_com1/EZUTDL1ZVKBLlMchlSps0AsBnSan6ust3RdlrldD1uoiuQ?e=uERD2t)

## Public Documentation

**ExpressRoute Global Reach**

- **Overview and Technical:**
    - Overview: [About ExpressRoute Global Reach](https://docs.microsoft.com/en-us/azure/expressroute/expressroute-global-reach)
    - Configure: [How to configure ExpressRoute Global Reach](https://docs.microsoft.com/en-us/azure/expressroute/expressroute-howto-set-global-reach)
    - Deploy with Powershell: [Configure ExpressRoute Global Reach](https://docs.microsoft.com/en-us/azure/expressroute/expressroute-howto-set-global-reach)
    - ExpressRoute Global Reach FAQ: [FAQ - ExpressRoute Global Reach](https://docs.microsoft.com/en-us/azure/expressroute/expressroute-faqs#globalreach)
- **Announcements:**
    - Public Preview Announcements:
        - Azure Updates: [Azure ExpressRoute Global Reach](https://azure.microsoft.com/en-us/updates/azure-expressroute-global-reach/)
        - Yousef's Blog: [Azure Networking Fall 2018 update](https://azure.microsoft.com/en-us/blog/azure-networking-fall-2018-update/)
    - General Availability Announcement: 
        - Azure Blog: [ExpressRoute Global Reach: Building your own cloud-based global backbone](https://azure.microsoft.com/en-us/blog/expressroute-global-reach-building-your-own-cloud-based-global-backbone)


## Training and Other Resources

- **Feature Overview Session**
    - [Feature Overview](https://microsoft.sharepoint.com/:v:/t/anpreadiness/EYSX9utKDmBPvz5dSReBOhQBfPmmh9lRJE9sm-WqqNH9bA?e=1tAYG7)

# Contributors
@<F84DD2EA-3ED8-6E71-BBD4-86A47F7D8B78> 

