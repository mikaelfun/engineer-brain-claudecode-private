---
source: onenote
sourceRef: "Mooncake POD Support Notebook/POD/VMSCIM/4. Services/Intune/## Common TSG/Intune Arch and upgrade tracking.md"
sourceUrl: null
importDate: "2026-04-05"
type: reference-guide
---

# Intune Architecture and Upgrade Tracking (21v Mooncake)

## Architecture
Most Intune services run as microservices in Service Fabric.

### Mooncake Sites
| Site | Subscription |
|------|-------------|
| CNPASU01 | a1472f7d-229b-46ee-83b9-f11432738b7b |
| CNBASU01 | 3f7fcc0f-8ee3-4f1d-b1a4-7ab7609e27ce |

### Data Storage
1. **RC Collection** - in-memory data in Service Fabric
2. **CosmosDB** - per-application, for fast query and scale
3. **SQL Database** - centralized (e.g., CNPASU01_SqlAggregation) for Intune reporting

### Code Repos
Format: `intune-svc-<application_name>`

## Tracking Updates

### Customer-Facing
1. Pre-update: https://learn.microsoft.com/en-us/mem/intune/fundamentals/whats-new
2. Post-update: Intune portal -> Tenant administration -> Tenant status -> Service release

### Internal (ARM Kusto Query)
```kql
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').EventServiceEntries
| where PreciseTimeStamp > ago(30d)
| where subscriptionId in ('a1472f7d-229b-46ee-83b9-f11432738b7b','3f7fcc0f-8ee3-4f1d-b1a4-7ab7609e27ce')
| where operationName contains "Microsoft.Compute/virtualMachineScaleSets/write"
| where status == 'Accepted' and subStatus == 'OK'
| project eventTimestamp, subscriptionId, RoleLocation, resourceUri, properties
| parse properties with * "forceUpdateTag\\\":\\\"" version:string "\\\"," *
| extend intune_cloud = iff(subscriptionId == 'a1472f7d-229b-46ee-83b9-f11432738b7b', "CNPASU01", "CNBASU01")
| project eventTimestamp, intune_cloud, version, RoleLocation, resourceUri
| order by eventTimestamp asc
```
