# NMAgent Version Check Across Subscriptions

> Source: MCVKB 3.7 | Author: Bing Yu | Updated: 2024-03

## Kusto Query

**Cluster**: `https://azurecmmc.kusto.chinacloudapi.cn`
**Database**: `AzureCM`

```kql
let SubID1 = '<SUB_ID_1>';
let SubID2 = '<SUB_ID_2>';
let SubID3 = '<SUB_ID_3>';
cluster('Azurecmmc').database("AzureCM").LogContainerSnapshot 
| where subscriptionId in (SubID1, SubID2, SubID3)
| where TIMESTAMP >= ago(90m)
| summarize arg_max(TIMESTAMP, *) by containerId
| project Tenant, nodeId, roleInstanceName, subscriptionId, containerId
| join kind=leftouter (
    cluster('Azurecmmc').database("AzureCM").LogHostPluginVersionSnapshot 
    | where TIMESTAMP >= datetime(<START_TIME>)
    | where TIMESTAMP <= datetime(<END_TIME>)
    | project PreciseTimeStamp, nodeId, hostPluginVersions
) on nodeId
| extend NMAgentVersion = extract("([0-9.]+)\\..+", 1, tostring(parsejson(hostPluginVersions).NMAgentHostPlugin))
| summarize VersionLastSeen=max(PreciseTimeStamp), VersionFirstSeen=min(PreciseTimeStamp)
    by Tenant, nodeId, roleInstanceName, NMAgentVersion, subscriptionId, containerId
| project Tenant, nodeId, roleInstanceName, NMAgentVersion, VersionFirstSeen, VersionLastSeen, subscriptionId, containerId
| sort by roleInstanceName asc, NMAgentVersion asc
```

## Output Columns

| Column | Description |
|--------|-------------|
| Tenant | Physical cluster/tenant |
| nodeId | Host node GUID |
| roleInstanceName | Role instance name |
| NMAgentVersion | NMAgent plugin version |
| VersionFirstSeen / LastSeen | Time range when version was active |
| subscriptionId | Customer subscription |
| containerId | VM container GUID |

## Use Cases

- Verify NMAgent update rollout across multiple subscriptions
- Identify VMs still running old NMAgent versions
- Correlate network issues with NMAgent version changes
