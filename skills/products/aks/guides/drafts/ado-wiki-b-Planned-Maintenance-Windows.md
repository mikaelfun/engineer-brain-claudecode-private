---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Feature Specific/Planned Maintenance Windows"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FPlanned%20Maintenance%20Windows"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Planned Maintenance Configuration for AKS Clusters

## Overview

Azure periodically performs updates to improve reliability, performance, and security of AKS cluster host infrastructure. The pre-created public maintenance configurations are provisioned using Maintenance Resource Provider (MRP) and can be assigned to AKS clusters as maintenance windows for weekly maintenance.

- Canary region clusters can only use canary region maintenance configurations
- Prod region clusters should use prod region maintenance configurations

## Types of Maintenance

1. Maintenance that doesn't require a reboot
2. Maintenance that requires a reboot

### Pre-created Public Maintenance Configurations

Two general kinds:

1. **Weekday** (Mon-Thu), from 10 pm to 6 am next morning
2. **Weekend** (Fri-Sun), from 10 pm to 6 am next morning

Naming convention:
- Prod: `aks-mrp-cfg-weekday_utc{offset}` / `aks-mrp-cfg-weekend_utc{offset}`
- Canary: `aks-mrp-cfg-weekday_utc{offset}-estus2euap`

## How-To: Assign/List/Delete Maintenance Configuration

### Assign

1. Find public maintenance config ID:
   ```bash
   az maintenance public-configuration show --resource-name "aks-mrp-cfg-weekday_utc8"
   ```

2. Assign to AKS cluster:
   ```bash
   az maintenance assignment create \
     --maintenance-configuration-id "{configId}" \
     --name assignmentName \
     --provider-name "Microsoft.ContainerService" \
     --resource-group resourceGroupName \
     --resource-name resourceName \
     --resource-type "managedClusters"
   ```

### List
```bash
az maintenance assignment list \
  --provider-name "Microsoft.ContainerService" \
  --resource-group resourceGroupName \
  --resource-name resourceName \
  --resource-type "managedClusters"
```

### Delete
```bash
az maintenance assignment delete \
  --name assignmentName \
  --provider-name "Microsoft.ContainerService" \
  --resource-group resourceGroupName \
  --resource-name resourceName \
  --resource-type "managedClusters"
```

## Investigation Kusto Queries

### Find Maintenance Configuration operations

```kusto
union cluster('aks').database('AKSprod').FrontEndContextActivity, cluster('aks').database('AKSprod').AsyncContextActivity
| where PreciseTimeStamp between (datetime(startDate)..datetime(endDate))
| where subscriptionID has "{SUBID}"
| extend Message = parse_json(msg)
| where Message contains "maintenance configuration request body"
| project PreciseTimeStamp, level, msg, namespace, correlationID, operationID
| take 10
```

### Match auto-upgrade execution times

```kusto
cluster('aks.kusto.windows.net').database('AKSprod').AutoUpgraderEvents
| where PreciseTimeStamp between (datetime(startDate)..datetime(endDate))
| where subscriptionID has "{SUBID}"
| where msg !contains "Is upgrader running: true"
  and msg !contains "Is operation count cache running: true"
  and msg !contains "upgrader healthz returns: true"
  and msg !contains "auto-upgrade-operation-count-cache-sync-interval"
```

### Check MRP assignment/deletion events

```kusto
cluster('Aks').database('AKSprod').MaintenanceConfigEvent
| where msg contains "ARN" and msg contains "has been handled"
  and msg contains "{AKS Cluster URI}"
| project TIMESTAMP, msg
```

- Assignment: event type `Microsoft.Maintenance/configurationAssignments/write`
- Deletion: event type `Microsoft.Maintenance/configurationAssignments/delete`

Also check `OverlaymgrEvents` for overlay manager MRP consumption: search "MRP maintenance configuration" in logs.

## References

- https://docs.microsoft.com/en-us/azure/aks/planned-maintenance
- https://docs.microsoft.com/en-us/azure/aks/auto-upgrade-cluster
