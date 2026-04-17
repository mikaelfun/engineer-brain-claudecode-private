---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Compute/check physical zone and logical zone mapping"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FCompute%2Fcheck%20physical%20zone%20and%20logical%20zone%20mapping"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Check node physical zone and logical zone mapping

## Summary

This TSG is oriented to share a guidance about how to check node physical zone and logical zone mapping.
It would be useful in The following case:

- identify whether customers' nodes are impacted by Infra outages.
- identify the node zone when encounter the OverconstrainedZonalAllocationRequest error.

## Method

- Get the logic zone from ASC VMSS instance page.

- Use the below query to get the physical zone and logical zone mapping

   ```kql
   // Get physical to logical zone mapping
   cluster('azcrpbifollower.kusto.windows.net').database('bi_allprod').Subscription
   | where PreciseTimeStamp > ago(5h)
   | where SubscriptionId == "<subID>"
   | where Region in~ ("westus2") //Replace Region Name
   | summarize arg_max(PreciseTimeStamp,*) by SubscriptionId,Region
   | project SubscriptionId,Region,RegisteredFeatures,AvailabilityZoneMappings,SubscriptionQuotaOverrides
   ```

- If only need to check the Availability zone, the below query could also be used.

   ```kql
   cluster("AzureCM").database("AzureCM").LogContainerSnapshot
   | where PreciseTimeStamp >= ago(1d)
   | where subscriptionId == '<subID>'
   | where roleInstanceName contains "<VMSS instace_ID>"     //VM name
   | where CloudName == 'Public' and Tenant !has 'TMBox'
   | summarize min(PreciseTimeStamp), max(PreciseTimeStamp) by roleInstanceName, creationTime, virtualMachineUniqueId, Tenant, containerId, nodeId, tenantName, AvailabilityZone
   | project VMName=roleInstanceName, AvailabilityZone, VirtualMachineUniqueId=virtualMachineUniqueId, Cluster=Tenant, NodeId=nodeId, ContainerId=containerId, ContainerCreationTime=todatetime(creationTime), StartTimeStamp=min_PreciseTimeStamp, EndTimeStamp=max_PreciseTimeStamp, tenantName
   ```
