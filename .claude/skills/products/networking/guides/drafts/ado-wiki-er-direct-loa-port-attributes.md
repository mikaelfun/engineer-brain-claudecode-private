---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/Features and Functions/ExpressRoute Direct - Understanding LOA and Port Attributes"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20ExpressRoute/Features%20and%20Functions/ExpressRoute%20Direct%20-%20Understanding%20LOA%20and%20Port%20Attributes"
importDate: "2026-04-17"
type: troubleshooting-guide
---

# ExpressRoute Direct - Understanding LOA and Port Attributes

[[_TOC_]]

## Overview

ExpressRoute Direct customers physical connect their edge routers directly with ExpressRoute devices (MSEE) at the peering location.

The connections are facilitated by the co-location provider in a Meet-Me Room (MMR). The ports on MSEE devices are pre-cabled up to the MMR and onboarded to the controller. The customers will select the desired location and bandwidth for their ExpressRoute Direct to claim the ports from Azure portal/CLI.

The customer then proceeds to generate a Letter of Authorization (LOA) which provides approval for the co-location provider to connect the ports specified in the LOA.

## Letter of Authorizatoin (LOA)

The LOA consists of the following information:

Authorized party for the LOA
- Port bandwidth (10G/100G)
- Colo & address
- MSEE device name
- MSEE Port
- MSEE Rack location
- Patch Panel and port in the MMR
  - MSEE Port is pre-cabled to this location, the path up to this point is considered Microsoft owned/supported. The customer must extend their cabling up to this point from their equipment. The path from customer equipment to the Microsoft provided MMR port is customer owned/supported.
  - When raising trouble tickets with site, Microsoft can only investigate up to the MMR mentioned in the LOA. Customer is responsible to support their path up to the MMR.
- Connector type

## LOA Example

![LOA Sample](/.attachments/Direct-Port-LOA-420ee106-7a98-482c-a6b7-e0e62cfab419.png)

Note: Interface was removed due to privacy concerns.

## Support

For issues related to letter of authorization (LOA) with ExpressRoute Direct, please reference the following article [ExpressRoute-Direct-Down](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/547320/ExpressRoute-Direct-Down).

# Contributors
- @<F84DD2EA-3ED8-6E71-BBD4-86A47F7D8B78>



