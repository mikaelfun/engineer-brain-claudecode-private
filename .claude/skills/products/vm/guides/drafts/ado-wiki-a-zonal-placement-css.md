---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files All Topics/Workflows/Azure Files Zonal Placement/Azure File Share Zonal Placement_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Azure%20Files%20All%20Topics/Workflows/Azure%20Files%20Zonal%20Placement/Azure%20File%20Share%20Zonal%20Placement_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure Files Zonal Placement (CSS Overview)

## Overview
GA feature for Azure Files Premium (LRS only) to place storage account in a specific availability zone. Performance optimization, NOT high availability.

## Supported
- Azure Files Premium, LRS only, Provisioned v1 and v2
- New and existing storage accounts
- Free (no additional cost)

## Not Supported
- Standard Azure Files, ZRS/GRS/GZRS, Blob/Queue/Table
- Automatic zone failover
- Direct zone-to-zone moves

## Zone Selection Options

| Option | Behavior |
|--------|----------|
| None | Regional account (default) |
| Azure-selected zone | Azure picks best zone and pins |
| Explicit zone (1/2/3) | Customer selects specific zone |

Once pinned, account will not be moved out of that zone.

## Existing Storage Accounts
- Premium LRS accounts can be converted (pinned, not migrated)
- Cannot change zones directly; must unpin (None) then repin (Azure-selected)
- Re-pinning usually returns same zone

## LRS to ZRS Conversion
1. Storage account must NOT be zone-pinned
2. Set zone option to None
3. Convert replication LRS to ZRS
4. Portal enforces validation

## Missing Zones in Portal
Azure hides zones with capacity constraints. Approved CSS message: "Only zones that currently support this feature are shown in the portal." No ETA to provide.

## When to Recommend
- High latency complaints with VM and storage in different zones
- Premium Azure Files workloads
- New deployments: create VM + Files in same zone
- Existing: move VM to storage's zone when possible

## References
- [Use zonal placement for Azure file shares](https://learn.microsoft.com/en-us/azure/storage/files/zonal-placement)
