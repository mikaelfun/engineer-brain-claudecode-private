---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/Troubleshooting Guides/Dedicated Cluster/TSG: Dedicated Clusters"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FTroubleshooting%20Guides%2FDedicated%20Cluster%2FTSG%3A%20Dedicated%20Clusters"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# TSG: Log Analytics Dedicated Clusters

## Public Docs
- [Limitations](https://learn.microsoft.com/azure/azure-monitor/logs/logs-dedicated-clusters?tabs=powershell#limitsandconstraints)
- [Troubleshooting](https://learn.microsoft.com/azure/azure-monitor/logs/logs-dedicated-clusters?tabs=powershell#troubleshooting)

## Data to Collect
- Dedicated Cluster ID
- Subscription ID

## Scenario 1: Cluster Create

1. Previously deleted cluster name is reserved for 2 weeks
2. Check permissions for cluster creation
3. Ensure cluster name is unique and valid
4. Verify region is supported
5. Verify subscription has sufficient quota
6. Check ARMProd for errors:
```kql
let customersubscription = "<SubscriptionID>";
cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd').Unionizer("Requests","HttpIncomingRequests")
| where subscriptionId == customersubscription
| where operationName =~ "Microsoft.OperationalInsights/workspaces/cluster/"
```
7. **Important**: Portal notification does NOT mean cluster is fully provisioned. Monitor ProvisioningState:
```bash
az monitor log-analytics cluster show --resource-group "rg-name" --name "cluster-name"
```
Wait until ProvisioningState = "Succeeded" before linking workspaces.

## Scenario 2: Cluster Delete
- Verify permissions
- Delete can take long - use GET to monitor status
- 400 HTTP if active link/unlink operations exist
- Operations > 1 day may indicate internal issue -> file IcM

## Scenario 3: Link/Unlink Workspace
- Max 1,000 workspaces per cluster
- Max 2 link operations per workspace in 30-day period
- Check linked workspaces via Azure Resource Graph:
```kql
resources
| where type =~ "microsoft.operationalinsights/workspaces"
| where subscriptionId == "<SUBSCRIPTIONID>"
| where isnotempty(properties.features.clusterResourceId)
| project subscriptionId, resourceGroup, name, cluster=properties.features.clusterResourceId
```

## Scenario 4: Customer Managed Key (CMK)
- CMK encryption applies only to data ingested AFTER configuration
- Pre-existing data remains Microsoft-key encrypted
- Known bug: "Failed to get encryption key" error -> raise IcM if recurs

## Additional
- Service/Data Resilience: Some regions require dedicated cluster for availability zones
- Common HTTP errors: 400, 404, 409 - see public docs
- Use LACP Dashboard for network/failed request diagnostics
