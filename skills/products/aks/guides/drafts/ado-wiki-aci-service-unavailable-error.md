---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACI/TSG/[TSG] Service Unavailable Error"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20Service%20Unavailable%20Error"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# TSG Service Unavailable Error

[[_TOC_]]

## Error Message

The requested resource is not available in the location 'usgovvirginia' at this moment. Please retry with a different resource request or in another location. Resource requested: '2' CPU '4' GB memory 'Linux' OS virtual network. ServiceUnavailable (409).

## Verify customer request

1. Check customer is deploying to an available region

    1. [Resource availability by region - Azure Container Instances | Microsoft Docs](https://docs.microsoft.com/en-us/azure/container-instances/container-instances-region-availability)

2. Check customer is using an available feature

    1. [Location - List Capabilities (Azure Container Instances) | Microsoft Docs](https://docs.microsoft.com/en-us/rest/api/container-instances/location/listcapabilities)

    2. You can verify available features per region by clicking "Try it" button

        1. Use the ACI Development sub

3. Check customer request for unsupported features (i.e. limitations)

4. Run:

```
let start = datetime(2022-06-23 19:07);
let end = datetime(2022-06-23 20:07);
cluster('armprodgbl.eastus').database('ARMProd').Unionizer("Requests","HttpIncomingRequests")
| where PreciseTimeStamp between (start..end)
| where targetUri contains "/subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/CAZ-W4GHAA-TAGCORE-T-RGP-NET/providers/Microsoft.ContainerInstance/containerGroups/myaccess"
| where httpStatusCode == 409
| join kind=inner (Traces
    | where PreciseTimeStamp between (start..end)
    | where * contains "Limitation") on correlationId
 | order by PreciseTimeStamp asc
 | project PreciseTimeStamp, operationName1, message
```

## Verify regional service capacity

1. For Atlas regions, check the availability of cores through [InventoryManager | Jarvis](https://portal.microsoftgeneva.com/dashboard/AzureSeabreeze/Seabreeze/InventoryManager)

2. For k8s regions, check available capacity

## Known issue - Clusters are disabled due to K8s Service unhealthy / Cluster not scheduleEnabled

```kql
// Capacity by region
ClusterHealth
| where PreciseTimeStamp > ago(1h)
| extend os=iif(osVersion=="", "Linux", iif(osVersion hasprefix "10.0.14393", iif(osVersion hasprefix "3b", "WindowsRS1_3b", "WindowsRS1"), iif(osVersion hasprefix "3b", "WindowsRS5_3b", "WindowsRS5")))
| extend feature=iif(cpu==72, "Dedicated", iif(networkPolicy=="Azure", "VNET", iif(nodeSelectingMode=="ByProvider", "GPU", "")))
| extend sku=strcat(os, feature)
| extend scheduleEnabled = tobool(parse_json(clusterAllocationState)['scheduleEnabled'])
| extend maxReplicas = toint(parse_json(clusterAllocationState)['maxReplicas'])
| extend reservedReplicas = toint(parse_json(clusterAllocationState)['reservedReplicaCount'])
| extend replicasUnavailable = toint(parse_json(clusterAllocationState)['replicasReservedForUnavailability'])
| extend availableReplicas = maxReplicas - reservedReplicas - replicasUnavailable
| extend availableReplicas = iif(availableReplicas < 0, 0, availableReplicas)
| extend maxPorts = toint(parse_json(clusterAllocationState)['maxPorts'])
| extend reservedPortCount = toint(parse_json(clusterAllocationState)['reservedPortCount'])
| extend availablePorts = toint(maxPorts - reservedPortCount)
| summarize arg_max(PreciseTimeStamp, *) by clusterId
| where ['state'] == "Enabled" and provisioningState == "Succeeded" and scheduleEnabled and not(isUnderConstruction)
| project location, clusterId, sku, availableReplicas, maxReplicas, availablePorts, totalNodes, cpu, ['state'], provisioningState, scheduleEnabled, daysBeforeCACertificateExpires
| extend totalNodes = iif(sku startswith "Linux", totalNodes-6, totalNodes)
| extend cores=cpu * availableReplicas
| summarize clusters=dcount(clusterId), availableCapacity=sum(availableReplicas), totalCapacity=sum(maxReplicas), cores=sum(cores) by location, sku, cpu
| summarize availableCapacity=sum(availableCapacity), totalCapacity=sum(totalCapacity), cores=sum(cores) by location, sku
| order by sku asc, location asc
| summarize Linux=sumif(availableCapacity, sku == "Linux"),VNET=sumif(availableCapacity, sku == "LinuxVNET"),RS5_3b=sumif(availableCapacity, sku == "WindowsRS5_3b"),RS1_3b=sumif(availableCapacity, sku == "WindowsRS1_3b") by location
| order by location asc
```

```kql
// Check cluster health by region
ClusterHealth
| where PreciseTimeStamp > ago(2d)
| extend feature=iif(cpu==72, "Dedicated", iif(networkPolicy=="Azure", "VNET", iif(nodeSelectingMode=="ByProvider", "GPU", "")))
| extend sku=strcat(osType, osVersion, feature)
| extend subscription = tostring(parse_json(manifest).subscriptionId)
| extend scheduleEnabled = parse_json(clusterAllocationState)['scheduleEnabled']
| extend maxReplicas = toint(parse_json(clusterAllocationState)['maxReplicas'])
| extend reservedReplicas = toint(parse_json(clusterAllocationState)['reservedReplicaCount'])
| extend replicasUnavailable = toint(parse_json(clusterAllocationState)['replicasReservedForUnavailability'])
| extend availableCapacity = (maxReplicas - reservedReplicas - replicasUnavailable) * scheduleEnabled
| summarize arg_max(PreciseTimeStamp, *) by clusterId
| extend isAzureDNCHealthy = iif(networkPolicy =~ "None", 1, tolong(isAzureDNCHealthy)),isVNetCustomControllerHealthy = iif(networkPolicy =~ "None", 1, tolong(isVNetCustomControllerHealthy))
| project subscription, location, clusterId, cpu, sku, certExpiry=daysBeforeCACertificateExpires, availableCapacity, usedCapacity=appDeployments, maxCapacity=maxReplicas, nodesOptimizing=nodesInOptimization, nodesInService, cores=cpu * maxReplicas, ['state'], provisioningState, scheduleEnabled, isApiServerHealthy, isMSIConnectorHealthy, isControllerManagerHealthy, isAzureDNCHealthy, isVNetCustomControllerHealthy
| order by location asc, sku asc, clusterId asc
| where location == "<target_location>"
```
