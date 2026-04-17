---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/AKS Network Troubleshooting Methodology/[TSG] AGIC/[TSG] AGIC Is The AppGW Receiving Configuration Updates From AGIC"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20AGIC%2F%5BTSG%5D%20AGIC%20Is%20The%20AppGW%20Receiving%20Configuration%20Updates%20From%20AGIC"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# AGIC: Is the Application Gateway Receiving Configuration Updates from AGIC?

## Purpose

Confirm if AGIC is successfully translating K8s resource changes into AppGW configuration updates.

## Method 1: AGIC Pod Logs

```bash
kubectl logs -f -l app=ingress-appgw -n kube-system
```

Successful update sequence:
1. "BEGIN AppGateway deployment"
2. "Applied generated Application Gateway configuration"
3. "END AppGateway deployment"
4. "Completed last event loop run in..."

CSS: Also available via Jarvis Action → CustomerCluster - Get pods log.

## Method 2: Application Gateway Activity Logs (Azure Portal)

Check Activity Log for:
- **Operation**: "Create or Update Application Gateway"
- **Status**: "Succeeded"
- **Timestamp**: matches K8s resource change time
- **Initiated by**: `ingressapplicationgateway-<CLUSTER_NAME>` (for addon clusters)

## Method 3: ARM Logs (Kusto - CSS Internal)

```kql
cluster('armprodgbl.eastus').database('ARMProd').Unionizer("Requests","HttpIncomingRequests")
| where subscriptionId == "<SUB_ID>"
| where PreciseTimeStamp > ago(1d)
| where targetUri contains "<APPGW_RESOURCE_ID>"
| where userAgent contains "ingress-appgw"
| project PreciseTimeStamp, userAgent, operationName, targetUri, clientIpAddress, TaskName, httpStatusCode
| order by PreciseTimeStamp asc
```

Check: userAgent contains "ingress-appgw/<version>", httpStatusCode=200, TaskName contains "EndWithSuccess".

## Method 4: NRP Logs (Kusto - CSS Internal)

```kql
cluster("Nrp").database("mdsnrp").QosEtwEvent
| where SubscriptionId == "<SUB_ID>"
| where PreciseTimeStamp > ago(1d)
| where ResourceGroup == "<RG>"
| where ResourceName == "<APPGW_NAME>"
| where ClientAppId == "<AGIC_APP_ID>"
| project PreciseTimeStamp, ClientAppId, OperationName, ResourceGroup, ResourceName, Success, UserError
| order by PreciseTimeStamp asc
```

Check: Success=True, UserError=False.
