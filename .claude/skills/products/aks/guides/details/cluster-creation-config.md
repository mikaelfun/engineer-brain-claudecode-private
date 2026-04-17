# AKS 集群创建与初始配置 -- Comprehensive Troubleshooting Guide

**Entries**: 8 | **Draft sources**: 0 | **Kusto queries**: 1
**Kusto references**: cluster-snapshot.md
**Generated**: 2026-04-07

---

## Phase 1: Azure Backup/ASR vault dependency on the MC_ resou

### aks-980: Cluster deletion fails with 'ResourceGroupDeletionBlocked' - MC_ resource group ...

**Root Cause**: Azure Backup/ASR vault dependency on the MC_ resource group: vault auto-recreates during deletion, blocking the managed resource group from being removed

**Solution**:
Retry vault deletion manually; if vault continues recreating, open collab with ASR team (support area: Azure/Azure Backup/Vault delete and move) to remove vault dependency, then retry cluster deletion

`[Score: [G] 9.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FResourceGroupDeletionBlocked%3A%20Vault%20Recreating%20During%20Cluster%20Deletion)]`

## Phase 2: RP failing to respond to registration request due 

### aks-979: Microsoft.ContainerService Resource Provider stuck in 'Registering' state for >3...

**Root Cause**: RP failing to respond to registration request due to high load, internal errors, code changes, or ARM/RP regional issues; verifiable via ARMProd Kusto logs filtering by correlationID and register+containerservice keywords

**Solution**:
Unregister and restart the Resource Provider registration via Azure Portal. Use ARMProd Kusto queries (Requests/HttpOutgoingRequests, Traces/Errors tables) with correlationID and register+containerservice filters to diagnose root cause

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FResource%20Provider%20registration%20stuck)]`

## Phase 3: AKS resource provider throttling limits exceeded f

### aks-1156: AKS cluster creation fails with Status=429 Code=Throttled: The PutManagedCluster...

**Root Cause**: AKS resource provider throttling limits exceeded for the subscription. Independent of ARM throttling, specific to AKS RP operations.

**Solution**:
Reduce request frequency: run LIST scripts less frequently, space out deployments or use different subscriptions, ensure each operation completes before starting another.

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/error-code-aksrequeststhrottled)]`

## Phase 4: The kubeDashboard addon is not available in Moonca

### aks-199: Terraform AKS deployment fails with error: Addon kubeDashboard is not supported ...

**Root Cause**: The kubeDashboard addon is not available in Mooncake (Azure China). Terraform templates that include kubeDashboard addon configuration will fail.

**Solution**:
1) Remove kubeDashboard addon from Terraform AKS resource definition. 2) Use kubectl proxy or az aks browse for dashboard access instead. 3) kubeDashboard is deprecated in newer Kubernetes versions globally.

`[Score: [B] 6.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 5: The Hub cluster by design does not allow Pod creat

### aks-446: Cannot create Pods on AKS Fleet Manager Hub cluster

**Root Cause**: The Hub cluster by design does not allow Pod creation. It only allows other resource types (Deployments, Service Accounts, etc.) which are then propagated to member clusters via ClusterResourcePlacement.

**Solution**:
This is expected behavior. Create Deployments or other supported resources on the Hub cluster instead of Pods directly. These resources will be propagated to Fleet Member clusters as defined in CRP.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 5.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%20Fleet%20Manager%2FFAQ)]`

## Phase 6: Toggle not enabled for creating from MC snapshot, 

### aks-658: Validation errors when creating AKS cluster from Managed Cluster Snapshot: Creat...

**Root Cause**: Toggle not enabled for creating from MC snapshot, preview feature not registered, snapshot ID format is invalid, snapshot not found or not in same region as target cluster, or snapshot properties are nil (corrupted snapshot).

**Solution**:
1) Ensure toggle for creating from MC snapshot is enabled; 2) Register ManagedClusterSnapshotPreviewFeature; 3) Verify snapshot ID format is valid; 4) Ensure snapshot exists and is in same region; 5) If NilProperties error, retake the snapshot. Kusto: AKSprod.AsyncQoSEvents with usedManagedClusterSnapshot property to verify.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 5.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FPreview%20Features%2FManaged%20Cluster%20Snapshot)]`

## Phase 7: The default managed namespace limit per AKS cluste

### aks-684: Creating managed namespace fails with error: 'The total number of the managed na...

**Root Cause**: The default managed namespace limit per AKS cluster is 100. This is a configurable threshold, not a hard limit. The actual upper bound is governed by ARM limits (800 resources per resource group).

**Solution**:
The 100 limit can be increased by enabling the appropriate feature toggle at the cluster or subscription level. An IcM to PG is required to edit the toggle. The actual ARM limit allows up to 800 managed namespaces per resource group.

`[Score: [Y] 4.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FManaged%20Namespaces)]`

## Phase 8: Managed namespace operations require the AKS clust

### aks-690: Creating, updating, or deleting managed namespaces fails with error: 'Creating o...

**Root Cause**: Managed namespace operations require the AKS cluster to be in a running state. If the cluster is stopped (deallocated), ARM cannot reconcile the namespace state with the underlying Kubernetes cluster.

**Solution**:
Start the AKS cluster first using 'az aks start', then perform the managed namespace create/update/delete operation.

`[Score: [Y] 4.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FManaged%20Namespaces)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Cluster deletion fails with 'ResourceGroupDeletionBlocked' - MC_ resource group ... | Azure Backup/ASR vault dependency on the MC_ resource group:... | Retry vault deletion manually; if vault continues recreating... | [G] 9.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FResourceGroupDeletionBlocked%3A%20Vault%20Recreating%20During%20Cluster%20Deletion) |
| 2 | Microsoft.ContainerService Resource Provider stuck in 'Registering' state for >3... | RP failing to respond to registration request due to high lo... | Unregister and restart the Resource Provider registration vi... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FResource%20Provider%20registration%20stuck) |
| 3 | AKS cluster creation fails with Status=429 Code=Throttled: The PutManagedCluster... | AKS resource provider throttling limits exceeded for the sub... | Reduce request frequency: run LIST scripts less frequently, ... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/error-code-aksrequeststhrottled) |
| 4 | Terraform AKS deployment fails with error: Addon kubeDashboard is not supported ... | The kubeDashboard addon is not available in Mooncake (Azure ... | 1) Remove kubeDashboard addon from Terraform AKS resource de... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 5 | Cannot create Pods on AKS Fleet Manager Hub cluster | The Hub cluster by design does not allow Pod creation. It on... | This is expected behavior. Create Deployments or other suppo... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%20Fleet%20Manager%2FFAQ) |
| 6 | Validation errors when creating AKS cluster from Managed Cluster Snapshot: Creat... | Toggle not enabled for creating from MC snapshot, preview fe... | 1) Ensure toggle for creating from MC snapshot is enabled; 2... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FPreview%20Features%2FManaged%20Cluster%20Snapshot) |
| 7 | Creating managed namespace fails with error: 'The total number of the managed na... | The default managed namespace limit per AKS cluster is 100. ... | The 100 limit can be increased by enabling the appropriate f... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FManaged%20Namespaces) |
| 8 | Creating, updating, or deleting managed namespaces fails with error: 'Creating o... | Managed namespace operations require the AKS cluster to be i... | Start the AKS cluster first using 'az aks start', then perfo... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FManaged%20Namespaces) |
