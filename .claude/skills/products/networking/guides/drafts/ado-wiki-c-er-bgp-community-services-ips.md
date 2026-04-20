---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/How To/Microsoft Peering BGP Community Services and IPs List"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20ExpressRoute/How%20To/Microsoft%20Peering%20BGP%20Community%20Services%20and%20IPs%20List"
importDate: "2026-04-18"
type: troubleshooting-guide
---

# Microsoft Peering BGP Community Services and IPs

[[_TOC_]]

## Description

How to get all services and IP ranges advertised in BGP Communities.

## Overview

Microsoft 365 was created to be accessed securely and reliably via the Internet. We recommend ExpressRoute for specific scenarios. Connectivity to Microsoft online services (Microsoft 365 and Azure PaaS services) occurs through Microsoft peering. We enable bi-directional connectivity between your WAN and Microsoft cloud services through the Microsoft peering routing domain.

**Note: O365 services require specific validation before being enabled.**

## API

1. Go to: [BGP Services Communities - List](https://learn.microsoft.com/en-us/rest/api/expressroute/bgp-service-communities/list?tabs=HTTP)
2. Select the "Try It" feature.
3. Login with Microsoft credentials (requires associated subscription).
4. Select run.

This outputs all BGP community services and their IP ranges.

5. Validate what the customer has configured in the route filter. The route filter dictates what services are being advertised to customer.

## Cloud Shell

```powershell
Invoke-AzRestMethod -Method GET -Uri https://management.azure.com/subscriptions/<EnterYourSubID>/providers/Microsoft.Network/bgpServiceCommunities?api-version=2022-07-01
```

Add `>> BGP-Communities.txt` to save to file and download from Cloud Shell.

## Cloud Shell Fairfax/Government

```powershell
Invoke-azRestMethod -Method GET -Uri https://management.usgovcloudapi.net/subscriptions/<EnterYourSubID>/providers/Microsoft.Network/bgpServiceCommunities?api-version=2022-01-01
```

## Wiki Repos

Azure Networking internal repo has automation that uploads BGP community data when updates are detected. Available for public, fairfax, and mooncake.

Repos: https://supportability.visualstudio.com/_git/AzureNetworking?path=/.attachments/AzureServiceTagsJson

## How to Confirm What Services/IPs Customer Should Be Seeing

1. Review the customer's route filter configuration.
2. Use the API or Cloud Shell to get the corresponding IP ranges for the configured BGP communities.
3. Match the community values (e.g., `12076:51009` for Azure Central US) with the communityPrefixes list.
