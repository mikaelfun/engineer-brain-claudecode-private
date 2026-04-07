---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Feature Specific/Auto Upgrade and Security Patch Scheduled Maintenance"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FAuto%20Upgrade%20and%20Security%20Patch%20Scheduled%20Maintenance"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Auto Upgrade and Security Patch Scheduled Maintenance

## Overview

Planned Maintenance allows you to schedule weekly maintenance windows to perform updates and minimize workload impact. Once scheduled, maintenance will occur only during the window you selected.

There are two kinds of planned maintenance:
1. `az maintenance` command - correlates to multiple services (see Planned Maintenance Windows wiki page)
2. `az aks maintenanceconfiguration` - covered here

## Types of Maintenance Windows

- **default** - set a weekly time for AKS weekly releases (usually transparent to customers)
- **aksManagedAutoUpgradeSchedule** - advanced options for auto-upgrade with longer period intervals (x weeks, y months)

## Troubleshooting

Most issues are expected to be bad configuration settings. The error should say what the configuration error is, and the docs should help show how it should be configured. If something other than that is wrong, escalate to PG.

### Useful Kusto Queries

#### Get all Put MaintenanceConfiguration requests for a cluster

```kusto
cluster("Aks").database("AKSprod").FrontEndQoSEvents
| where resourceGroupName == "{resourceGroupName}"
| where resourceName == "{resourceName}"
| where subscriptionID == "{Sub_ID}"
| where operationName == "PutMaintenanceConfigurationHandler.PUT"
| project operationID, operationName, resultType, resultCode, resultSubCode
```

#### Get the user input request body

```kusto
cluster("Aks").database("AKSprod").FrontEndQoSEvents
| where operationID == "{operationID}"
| where msg contains "maintenance configuration request body:"
| project PreciseTimeStamp, msg, fileName, level
```

#### Find when maintenance was rejected based on current configuration

```kusto
cluster('Aks').database('AKSprod').AutoUpgraderEvents
| where subscriptionID == "{Sub_ID}"
| where resourceGroupName == "{resourceGroupName}"
| where resourceName == "{resourceName}"
// | where msg contains "maintenance is allowed:" // shows info for aksManagedAutoUpgradeSchedule or aksManagedNodeOSUpgradeSchedule
| where msg contains "Maintenance is not allowed, current time:"
```

#### Get all maintenance configuration in database

```kusto
cluster("Aks").database("AKSprod").ManagedClusterMonitoring
| where PreciseTimeStamp > ago(1d)
| where entitytype == "maintenanceConfiguration"
| where msg !startswith "Maintenance Configuration does not exist for Managed Cluster"
| extend data=parse_json(msg).data
| mv-expand data
| project data, configName = tostring(data.configName), resourceID = tostring(data.id)
| distinct resourceID, tostring(data)
```

## References

- [Public Docs](https://learn.microsoft.com/en-us/azure/aks/planned-maintenance)
