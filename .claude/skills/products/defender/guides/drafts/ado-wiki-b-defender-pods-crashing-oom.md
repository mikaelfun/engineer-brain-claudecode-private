---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Workload Protections/Defender for Containers/Defender Sensor and PODs/[Troubleshooting Guide] - Pods are crashing"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FWorkload%20Protections%2FDefender%20for%20Containers%2FDefender%20Sensor%20and%20PODs%2F%5BTroubleshooting%20Guide%5D%20-%20Pods%20are%20crashing"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Microsoft Defender Pods Experiencing Multiple Restarts or Out of Memory (OOM)

Microsoft Defender for Cloud deploys agents on customers' clusters to collect various data types in high volume for security purposes. The agents are deployed as native Kubernetes components (pods), as a security profile in Azure Kubernetes Service (AKS), or as an Azure Arc extension for Arc-enabled Kubernetes clusters.

## Cross-Platform Guide

The following Kusto queries should help you identify the specific component with errors. After finding the relevant component, follow the relevant subpage.

All queries are relevant to the public cloud only. For other environments, please use other alternatives.

```kusto
let resourceId = "<RESOURCE-ID>"; // format: /subscriptions/{SubscriptionId}/resourceGroups/{ResourceGroup}/providers/Microsoft.ContainerService/managedClusters/XXX
let lookbackTime = 2h;
union
    cluster('romeeus.eastus.kusto.windows.net').database('ProdRawEvents').K8S_Pods,
    cluster('romeuksouth.uksouth.kusto.windows.net').database('ProdRawEvents').K8S_Pods
| where ingestion_time() > ago(lookbackTime)
| where AzureResourceId =~ resourceId
| extend PodName=tostring(PodMetadata.name)
| where PodName startswith "microsoft-defender"
| mv-expand SingleStatus=Status.containerStatuses
| extend RestartCount = toint(SingleStatus.RestartCount)
| extend ContainerName=tostring(SingleStatus.name)
| extend NodeName = tostring(Spec.nodeName)
| where RestartCount > 0
| summarize count() by AzureResourceId, RestartCount, PodName, ContainerName, NodeName
| order by RestartCount desc
```

Search for the container name with errors. For Publisher or low-level issues, see relevant wikis. For others, open an Incident Case Management ticket.

## AKS Platform - Additional Steps

### Azure Service Insights Portal
- Browse to [Azure Service Insights](https://azureserviceinsights.trafficmanager.net/)
- Select "AKS" resource, type the full Azure Resource Id in the search box
- Search for "Pods & Restarts"
- Look for "microsoft-defender-xxxxx" pods and check for restarts

### Pod Describe (AKS)
```bash
kubectl describe pod microsoft-defender-ds-xxxxx -n kube-system
```

### Pod Logs (AKS)
```bash
kubectl logs microsoft-defender-ds-xxxxx -n kube-system
```

## Arc Platform (Including Multi-Cloud) - Additional Steps

### Pod Describe (Arc)
```bash
kubectl describe pod microsoft-defender-ds-xxxxx -n mdc
```

### Pod Logs (Arc)
```bash
kubectl logs microsoft-defender-ds-xxxxx -n mdc
```

## Remarks (Cross-Platform)

- If you see errors from the failing liveness probe, this is not the issue; it's just a symptom. Continue to the next item. "Failed to perform liveness probe, error details - exit status 1"

## OOM (Error Code 137) - Causes and Resolution

| Cause | Resolution | Scoping Questions |
|-------|------------|-------------------|
| Container memory limit reached, application experiencing higher load than normal | Increase memory limit via ICM to PG (customer cannot change defender pod limits directly) | How many pods does the customer have in the cluster? How many pods per node? If too many pods, defender pods may not handle the volume. ICM ref: 483812564 |
| Container memory limit reached, application memory leak | Debug the application and resolve the memory leak (customer application issue) | Does the customer have other pods also terminated with 137 (OOM)? How many pods? Check restart count for all crashing pods. Customer should adjust app pod limits. If app pod is unfixed, increasing defender limit will not fix the issue. |
| Node overcommitted (total memory used by pods > node memory) | Adjust memory requests and limits for containers | Some pods running with no limits using all node resources, node metric shows 100% memory/CPU. Customer should either scale up node or add limits to respective pods. |

## Data Collection

Request the customer to upload the following logs:
```bash
kubectl describe po <Defender-Pod-name> -n kube-system > describepod.log
kubectl logs <Defender-Pod-name> -n kube-system > podlogs.log
kubectl get po -A > podsstate.log
```
