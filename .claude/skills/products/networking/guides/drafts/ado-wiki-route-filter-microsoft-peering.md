---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/Features and Functions/Route Filter for Microsoft Peering"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FFeatures%20and%20Functions%2FRoute%20Filter%20for%20Microsoft%20Peering"
importDate: "2026-04-18"
type: troubleshooting-guide
---

# Route Filter for Microsoft Peering

## Overview

Route filters select a subset of supported services consumed through Microsoft peering. They control which BGP community prefixes are advertised to the customer network.

## How It Works

1. Microsoft peering configured on ExpressRoute circuit
2. Microsoft edge routers establish BGP sessions with customer edge routers
3. No routes advertised until route filter is associated
4. Route filter = allowed list of BGP community values
5. Only prefixes mapping to allowed communities are advertised

## Key Points

- Each BGP community value maps to a specific Azure/M365 service
- Route filters reduce route table size by filtering unwanted prefixes
- M365 route filters require authorization (see O365 authorization process)

## List BGP Community Services

```powershell
Get-AzBgpServiceCommunity
```

## BGP Community Updates

- Prefixes typically updated monthly
- Customers notified ahead of time
- Check ExpressRoute Maintenance wiki for update schedules

## Common Issues

1. **O365 route filter attachment fails**: Customer needs O365 over ExpressRoute authorization
2. **Missing prefixes after route filter change**: BGP community updates are periodic, verify latest community values
3. **Route filter not taking effect**: Verify BGP sessions are established and route filter is properly associated with the circuit
