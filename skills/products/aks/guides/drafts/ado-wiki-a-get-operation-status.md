---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Feature Specific/Get Operation Status"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FGet%20Operation%20Status"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Get Operation Status

## Overview

AKS has added a way to see an operations's current status. This will mainly be seen in the portal for customers, but it is also available by doing a CLI command for a REST GET.

## How to get operation progress

To monitor the progress of creation, scaling, and upgrade operations, customers may consult the operation progress via the URL `/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.ContainerService/managedClusters/{resourceName}/operations/{operationId}`,
The attribute "percentComplete" denotes the extent of completion for the ongoing operation.

### Use az cli get latest operation json data example

```
export ResourceID="You cluster ResourceID"
az rest --method get --url "https://management.azure.com$ResourceID/operations/latest?api-version=2024-01-02-preview"
```

ResourceID like this `/subscriptions/26fe00f8-9173-4872-9134-bb1d2e00343a/resourceGroups/wenhtest2_group/providers/Microsoft.ContainerService/managedClusters/wenhtest2`

## How to list recent operation progress

And customers can access `/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.ContainerService/managedClusters/{resourceName}/operations` to get the latest 50 operations of the cluster.

### Use az cli list operation json data example

```
export ResourceID="You cluster ResourceID"
az rest --method get --url "https://management.azure.com$ResourceID/operations?api-version=2024-01-02-preview"
```

## Get operation progress failed

Should customers encounter difficulties in ascertaining the progress of operations, an examination of the logs is advisable to verify the existence and current status of the operation in question.

```
AsyncContextActivity
| where PreciseTimeStamp > ago(1d)
| where operationID == "{{operationID}}"
| project PreciseTimeStamp,level,msg,fileName,lineNumber
| order by PreciseTimeStamp
```

If the customer wants to know the specific completePercent, it is recommended to access the customer's overlay cluster, obtain all node information through `kubectl get node`, and give the user a roughly complete situation of the current operation.

### Query Get Operation QoS

```
FrontEndQoSEvents
| where TIMESTAMP > ago(1d)
| where operationName == "GetOperationStatusResultHandler.GET"
| summarize total=count(), servicefail=countif(resultType != 0) by timerange=startofweek(PreciseTimeStamp)
| project timerange, QoSPercent = 100 - (servicefail*100.0/total), total
```

### Query failed msg about Get Operation

```
FrontEndQoSEvents
| where TIMESTAMP > ago(1d)
| where operationName == "GetOperationStatusResultHandler.GET"
| where resultType !=0
| project TIMESTAMP,operationID,resultCode,msg,errorDetails
```

## List operation for cluster failed

```
AsyncQoSEvents
| where subscriptionID == "{subscriptionID}" and resourceGroupName == "{resourceGroupName}" and resourceName == "{clusterName}"
| order by TIMESTAMP
| limit 50
| project PreciseTimeStamp,suboperationName, result, errorDetails, msg
```

### Query List Operation QoS

```
FrontEndQoSEvents
| where TIMESTAMP > ago(1d)
| where operationName == "ListOperationStatusResultHandler.GET"
| summarize total=count(), servicefail=countif(resultType != 0) by timerange=startofweek(PreciseTimeStamp)
| project timerange, QoSPercent = 100 - (servicefail*100.0/total), total
```

### Query failed msg about List Operation

```
FrontEndQoSEvents
| where TIMESTAMP > ago(1d)
| where operationName == "ListOperationStatusResultHandler.GET"
| where resultType !=0
| project TIMESTAMP,operationID,resultCode,msg,errorDetails
```
