---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/Cluster Management/Who triggered auto node upgrade"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FWho%20triggered%20auto%20node%20upgrade"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Finding who triggered node upgrade to the customer AKS cluster node pool

[[_TOC_]]

## Summary

This document explains how to identify who triggered the node upgrade to the customer AKS cluster node pool.

In some cases, you may receive a service request from the customer, where you are asked to identify who triggered node upgrade because the customer experienced an unexpected node restart/reimage on the production environment.

## Troubleshooting Steps

Please ask the customer the precise date and time when the issue happened. Then, check the CRUD operation around the time.

```sql
cluster('aks.kusto.windows.net').database('AKSprod').AsyncQoSEvents
| where PreciseTimeStamp between (datetime({starttime}) .. datetime({endtime}))
| where subscriptionID == "{subscriptionid}" and resourceName contains "{resourcename}"
| extend Count = parse_json(tostring(parse_json(propertiesBag).LinuxAgentsCount))
| project PreciseTimeStamp, insertionTime, logPreciseTime, correlationID, operationID, Count , operationName, suboperationName, agentPoolName ,result, errorDetails, resultCode, 
  resultSubCode, k8sCurrentVersion, k8sGoalVersion, subscriptionID, resourceGroupName, resourceName, type=(parse_json(propertiesBag).agentpool_storage_profile_0), 
  UnderlayName, hostMachine, Host, namespace, pod, container, region, fqdn
```

If there is a cluster upgrade operation around the time, that is the reason. Please identify who triggered it. You can use this TSG in IaaS Pod: [Identify Who Performed Operation](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496451/Identify-Who-Performed-Operation_Tool)

If there is a node image update (operationName = `UpgradeNodeImageAgentPoolHandler.POST`) and correlationId is not `"00000000-0000-0000-0000-000000000000"`, someone triggered the operation. You can use this TSG in IaaS Pod: [Identify Who Performed Operation](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496451/Identify-Who-Performed-Operation_Tool)

If the `UpgradeNodeImageAgentPoolHandler.POST` was triggered by correlationId `"00000000-0000-0000-0000-000000000000"`, that node upgrade must have been triggered by AKS platform. In almost all cases, auto upgrade configuration is set to the customer AKS cluster and that system triggers the node upgrade. You can confirm whether the auto upgrade option is set to the customer cluster following the below steps:

1. Show the AKS cluster details in ASI -> AKS -> Managed Cluster.
2. Select "Nodes" tab under timeline, where you can find "Auto Upgrade Profile".
3. In the tab, you will see the current auto upgrade settings. (Example: "node-image" is set.)

## Reference

- Upgrade an Azure Kubernetes Service (AKS) cluster: <https://learn.microsoft.com/en-us/azure/aks/upgrade-cluster?tabs=azure-portal>
- Automatically upgrade an Azure Kubernetes Service (AKS) cluster: <https://learn.microsoft.com/en-us/azure/aks/auto-upgrade-cluster>

## Owner and Contributors

**Owner:** Kenichiro Hirahara <khiraha@microsoft.com>
