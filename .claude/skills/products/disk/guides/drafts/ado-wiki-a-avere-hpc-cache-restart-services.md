---
source: ado-wiki
sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Avere - HPC Cache/Support Operations - Restart Services"
sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAvere%20-%20HPC%20Cache%2FSupport%20Operations%20-%20Restart%20Services"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Restart Services

*It needs SAW and AME account*

[Geneva](https://aka.ms/GenevaActions)

The **Restart Services** operation allows authorized users to restart services on specific nodes or the entire HPC cache using a Geneva Action. The restart of services is similar to the same function on an FXT or vFXT cluster and will take several minutes to complete once Geneva Actions shows that the command has been taken.

## ACCESS

As Restart Services is a read/write action, a valid Access Token for the specified Endpoint is required.

## REQUIRED PARAMETERS

The following parameters are required:

**Environment Parameter**

- Environment: The cloud environment that was used to create the cache

**HPC Cache Parameters**

- Endpoint: The endpoint server corresponding to the Region where the cache was created
- Subscription Id: The subscription Id that was used to create the cache
- Resource Group Name: The resource group name where the cache was created
- Cache Name: Name of target cache
- Node Id: The number of the node that you wish to restart. You can obtain the node numbers for a HPC cache by using the **Node List** action. If you enter a -1 into the textbox, all nodes in the cache will have their services restarted.

## OUTPUT

The output in the results window will be "NoContent" if the command has been successfully run. After 5-10 minutes, you should check the status of the cluster using the **Get Cache Plus** action to make sure that the node(s) have returned to a running state.
