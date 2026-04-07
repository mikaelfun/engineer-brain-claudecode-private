---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/Cluster Management/maxUnavailable Setting"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FmaxUnavailable%20Setting"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Upgrade with maxUnavailable

[[_TOC_]]

## Overview

The `maxUnavailable` setting allows users to upgrade their cluster and agent pool without using surge nodes. This is particularly beneficial for customers with capacity constraints who lack additional SKU capacity or quota for surge nodes.

### Configuration Requirements

- Set `agentPoolProfiles.upgradeSettings.maxUnavailable` greater than 0.
- Set `agentPoolProfiles.upgradeSettings.maxSurge` to 0.

> **Note:** `maxSurge` must be 0 when `maxUnavailable` is greater than 0.

Example configuration:

```json
"upgradeSettings": {
  "maxSurge": "0",
  "maxUnavailable": "2"
}
```

With the above `upgradeSettings`, the upgrade will proceed without surge nodes and with a parallelism of 2 (as specified by `maxUnavailable`). During the upgrade, two nodes will be cordoned and upgraded at a time.

## What to expect

### Identifying Usage of maxUnavailable

To determine if the `maxUnavailable` setting is in use, retrieve the `upgradeSettings` using the Azure CLI:

```sh
az aks show --name <clusterName> --resource-group <resourceGroupName>
```

Alternatively, check the `AgentPoolSnapshot` table:

```kusto
AgentPoolSnapshot
| where id == "/subscriptions/<subscriptionId>/resourcegroups/<resourcegroup>/providers/Microsoft.ContainerService/managedClusters/<cluster>/agentPools/<agentpool>"
| where PreciseTimeStamp > ago(1d)
| project PreciseTimeStamp, upgradeSettings
| sort by PreciseTimeStamp desc
| take 10
```

The user-specified value can also be found in the `AsyncContextActivity` log:

```kusto
AsyncContextActivity
| where operationID == "<your_operation_id>"
| where msg contains "maxUnavailable found on agentpool:"
```

If the message is not found in the operation log, it indicates that `maxUnavailable` is set to the default value of 0.

## Known Limitations

Upgrading without surge nodes may increase the likelihood of PodDisruptionBudget (PDB) errors because when `maxUnavailable` nodes are cordoned, and pods are evicted to other nodes, it is possible that these other nodes might be fully utilized and unable to accommodate additional pods.

If you encounter support tickets for PDB failure to drain errors while the `maxUnavailable` setting is in use, refer to [the Pod Disruption Budgets troubleshooting guide](/Azure-Kubernetes-Service-Wiki/AKS/TSG/CRUD/Pod-Disruption-Budgets-cause-nodepool-operations-to-fail).

## Owner and Contributors

**Owner:** Jordan Harder <Jordan.Harder@microsoft.com>
