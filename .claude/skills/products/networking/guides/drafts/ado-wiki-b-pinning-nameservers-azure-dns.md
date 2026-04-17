---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure DNS/Azure (Public) DNS zones/Pinning Nameservers for Azure DNS"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20%28Public%29%20DNS%20zones%2FPinning%20Nameservers%20for%20Azure%20DNS"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Pinning Nameservers for Azure DNS

## Overview

Customers sometimes request that all their DNS zones be assigned to the same set of nameservers (NS pinning). Azure DNS normally assigns a random set of nameservers on zone creation for uniform distribution and conflict avoidance.

Azure DNS **does** have a mechanism to assign nameservers at resource-group level, but it is **not guaranteed 100%** (zone name conflicts can prevent it).

## Limitations and Caveats

| Constraint | Detail |
|---|---|
| Scope | Only zones created in the **same resource group** get the pinned nameservers |
| Existing zones | Remain on current nameservers; customer must delete and recreate to get pinned NS |
| Parent/child conflict | Azure DNS does not allow parent domain (contoso.com) and subdomain (child.contoso.com) to share nameservers → one creation will fail |
| Same-name zone conflict | If a zone with same name exists on another subscription, zone creation may fail → retry in different resource group |

## Process

> ⚠️ **TA approval required** before implementing.

1. Discuss limitations with customer and get written approval.
2. Post to the [Azure DNS Channel in Microsoft Teams](https://teams.microsoft.com/l/channel/19%3ace3dd4b2cd344917aabafed17244bd98%40thread.skype/Azure%2520DNS?groupId=c3e00ac7-3f76-4350-ba3b-e335a6bbbe21&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47) for TA review.
3. Get ICM approval.
4. After TA approval, file an incident: https://aka.ms/azurednsnameserverpinningicm
