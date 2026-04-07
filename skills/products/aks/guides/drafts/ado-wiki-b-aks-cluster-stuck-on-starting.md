---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/Cluster Management/AKS cluster stuck on starting"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FAKS%20cluster%20stuck%20on%20starting"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# AKS Cluster Stuck on Starting

## Summary

Customer is trying to start a stopped AKS cluster and experiencing long startup times. AKS cluster stuck in Starting state for hours with worker nodes in `NodeNotReady` status.

> **Note**: The same behavior may be observed in CRUD operations, not just start operations. Any operation may fail and the AKS cluster may become stuck with worker nodes in NodeNotReady status indefinitely.

## Possible Causes

- Internal operation errors
- Customer quota errors
- Connectivity errors (most common)
- Allocation constraints
- VNET/Subnet full errors
- SKU restrictions
- VMSS errors
- Expired SPN credentials
- Infrastructure issues (maintenance, incidents)

## Investigation via ASI

Use Azure Service Insights (ASI) for recent issues (<15 days):

1. Check **State and Health Timelines** for errors
2. Filter by `StartManagedCluster` in the **Mutating Operations** timeline
3. Click tooltip for **Operation Details** popup

## Investigation via Kusto

### Check STOP/START Operations

```kql
union cluster("Aks").database("AKSprod").FrontEndContextActivity, cluster("Aks").database("AKSprod").AsyncContextActivity
| where subscriptionID == "<subId>"
| where resourceName contains "<clusterName>"
| where PreciseTimeStamp between (datetime(start) .. datetime(end))
| where msg contains "StopManagedClusterHandle" or msg contains "StartManagedClusterHandle"
| project PreciseTimeStamp, operationID, correlationID, level, suboperationName, msg
| sort by PreciseTimeStamp desc
```

## Common Scenarios

### Connectivity Errors (Most Common)

**Symptom**: Nodes cannot register with the API server.

**Kubelet log errors**:
```
Unable to register node with API server: Post "https://<fqdn>:443/api/v1/nodes": tls: failed to verify certificate: x509: certificate signed by unknown authority
```

And:
```
No valid client certificate is found but the server is not responsive. A restart may be necessary to retrieve new initial credentials.
```

**Root Cause**: Network/firewall issue preventing internal traffic from reaching the AKS API server. A route may be blocking traffic.

**Additional symptom**: `ImagePullBackOff` errors on all pods (especially system pods like ama-logs, csi-blob):
```
Back-off pulling image "mcr.microsoft.com/oss/kubernetes-csi/blob-csi:v1.20.2"
```

### Resolution Steps

1. Check customer's UDR/route tables for routes that may intercept API server traffic
2. Verify NSG rules allow required AKS traffic
3. Check if firewall is blocking MCR endpoints
4. If certificate issue: may need cluster certificate rotation
5. For SPN expiry: rotate credentials via `az aks update-credentials`
6. For quota issues: request quota increase or use different VM SKU

## General Mitigation

- Identify the specific error from ASI/Kusto operation details
- Address the root cause (network, quota, SPN, etc.)
- Trigger a reconcile or retry the start operation
