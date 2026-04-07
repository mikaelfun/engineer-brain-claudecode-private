# AKS Fault Domain Distribution - Kusto Query Guide

> Source: OneNote - Mooncake POD Support Notebook / AKS / Troubleshooting / Fault Domain
> Status: guide-draft (pending SYNTHESIZE review)
> Note: Original content was for specific customer scenario. Kusto queries are generally applicable.

## Cluster & Database

- Cluster: `azurecm.chinanorth2.kusto.chinacloudapi.cn`
- Database: `azurecm`

## Query: Check Node Fault Domain Distribution

```kql
let starttime = datetime(2021-09-07 00:10);
let endtime = datetime(2021-09-07 23:30);
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').LogContainerSnapshot
| where TIMESTAMP >= starttime and TIMESTAMP <= endtime
| where subscriptionId == "<subId>" and roleInstanceName contains "<vmssName>"
| project TIMESTAMP, Tenant, tenantName, containerId, nodeId, roleInstanceName, availabilitySetName, updateDomain, subscriptionId, RoleInstance
| distinct Tenant, roleInstanceName, nodeId, updateDomain
| join kind=leftouter (
    cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').LogNodeSnapshot
    | project PreciseTimeStamp, nodeId, nodeState, nodeAvailabilityState, faultInfo, containerCount, AvailabilityZone, faultDomain
) on $left.nodeId == $right.nodeId
| project Tenant, nodeId, roleInstanceName, faultDomain, updateDomain
| sort by faultDomain
| distinct roleInstanceName, nodeId, faultDomain, updateDomain, Tenant
```

## Steps

1. Run query above, sort faultDomain ascending
2. Map Kusto faultDomain IDs to human-readable Fault Domain IDs (FD1, FD2, etc.)
3. Portal shows FaultDomain=1 as default - platform distributes VMSS instances across fault domains on best-effort basis

## Key Notes

- Portal FaultDomain=1 is a default display value, not the actual distribution
- Use Kusto query to get real fault domain assignment per node
- Fault domain IDs in Kusto are numeric and need mapping to customer-visible FD labels
