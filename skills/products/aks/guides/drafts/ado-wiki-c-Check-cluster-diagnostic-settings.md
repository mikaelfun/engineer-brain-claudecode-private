---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/Monitoring/Check cluster diagnostic settings"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FMonitoring%2FCheck%20cluster%20diagnostic%20settings"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Confirming if Customers Have Diagnostic Settings Configured

## Summary

This article guides you on how to check if a customer has enabled master nodes logging (diagnostic settings) on their AKS cluster.

## Steps

1. From Geneva Actions, navigate to `MonitoringService > Power user monitoring operations > Perform Get`.

2. Fill in the following parameters:
   - **Endpoint**: Put the cluster location here
   - **Path**: The resource ID of the cluster with `/providers/microsoft.insights/diagnosticSettings` appended.
     Example: `/subscriptions/{subId}/resourcegroups/{rg}/providers/Microsoft.ContainerService/managedClusters/{clusterName}/providers/microsoft.insights/diagnosticSettings`
   - **Query Parameters**: A supported Azure API version, e.g., `api-version=2023-05-01`

3. Click Run. The output is a JSON object containing the diagnostic settings:

```json
{
  "value": [
    {
      "name": "AKS_Master_logging",
      "properties": {
        "workspaceId": "/subscriptions/.../workspaces/ammaninternal",
        "logs": [
          {"category": "kube-apiserver", "enabled": false},
          {"category": "kube-controller-manager", "enabled": true},
          {"category": "kube-scheduler", "enabled": false},
          {"category": "kube-audit", "enabled": false},
          {"category": "cluster-autoscaler", "enabled": false}
        ]
      }
    }
  ]
}
```

The output shows which log categories are enabled and the target workspace.
