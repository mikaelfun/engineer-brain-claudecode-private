# AKS UDR 与路由 — scale -- Comprehensive Troubleshooting Guide

**Entries**: 5 | **Draft sources**: 0 | **Kusto queries**: 1
**Kusto references**: scale-upgrade-operations.md
**Generated**: 2026-04-07

---

## Phase 1: Service Principal linked to the AKS PG App ID was 

### aks-762: AKS CRUD operations (upgrade/scale) fail with InternalServerError. Underlying er...

**Root Cause**: Service Principal linked to the AKS PG App ID was removed from the customer tenant, breaking AKS RP ability to authenticate against ARM/CRP on behalf of the cluster.

**Solution**:
1) Confirm via AKS ContextActivity Kusto query filtering by operationID for InvalidAuthenticationToken messages. 2) Cross-reference ARM Traces table using correlationID to identify affected TenantID and AppID. 3) Re-create the Service Principal in the customer tenant for the AKS PG App ID.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FOperations%20Fail%20with%20code%20GetSKUStoreError%20InvalidAuthenticationToken)]`

## Phase 2: Kubernetes version is outdated/unsupported and the

### aks-765: AKS nodepool scale/upgrade fails with InvalidParameter: images referenced from d...

**Root Cause**: Kubernetes version is outdated/unsupported and the base VM images are no longer available in Azure marketplace. Old nodepool cannot create new nodes because the image reference is stale.

**Solution**:
1) Create new nodepool with supported K8s version. 2) Copy custom labels. 3) Drain+cordon old nodes. 4) Delete old nodepool. 5) If cluster still Failed, az aks upgrade to same/higher version.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FScale%20or%20upgrade%20failed%20with%20image%20not%20found)]`

## Phase 3: The Service Principal linked to the AKS PG well-kn

### aks-768: AKS cluster CRUD operations (upgrade, scale) fail with InternalServerError/GetSK...

**Root Cause**: The Service Principal linked to the AKS PG well-known App ID (7319c514-..., Azure Container Service - AKS) was deleted or soft-deleted from the customer tenant, breaking AKS RP operations when calling CRP to get VM SKUs.

**Solution**:
Re-register the AKS resource provider to recreate the SP: az provider register --namespace Microsoft.ContainerService. If SP is in Soft-Delete mode, customer can try recovering it (may require collaboration with Azure Identity team). Confirm via AKS ContextActivity Kusto table and ARM Traces, check SP status in Azure TenantExplorer.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FOperations%20Fail%20with%20code%20GetSKUStoreError%20InvalidAuthenticationToken)]`

## Phase 4: The Kubernetes version is outdated/no longer suppo

### aks-772: AKS nodepool scale or upgrade fails with image not found - InvalidParameter: ima...

**Root Cause**: The Kubernetes version is outdated/no longer supported and the base VM images for the node pool are no longer available in the image gallery, preventing new node creation.

**Solution**:
1) Create new nodepool with supported K8s version. 2) Migrate pods to new nodes (apply custom labels if needed). 3) Drain and cordon old nodes: kubectl drain <node>. 4) Delete old nodepool. 5) If cluster is in Failed provisioning state, upgrade cluster to current K8s version. 6) Verify cluster provisioning status.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FScale%20or%20upgrade%20failed%20with%20image%20not%20found)]`

## Phase 5: Kubernetes version is outdated/unsupported and bas

### aks-963: AKS scaling or upgrade fails with image not found: InvalidParameter - images ref...

**Root Cause**: Kubernetes version is outdated/unsupported and base VM images (e.g. WindowsServer 2019-datacenter-core-smalldisk) are no longer available in marketplace

**Solution**:
1) Create new nodepool with supported K8s version 2) Migrate pods (check custom labels with kubectl get nodes --show-labels) 3) kubectl drain old nodes 4) Delete old nodepool 5) Upgrade cluster to same or higher version 6) Verify provisioning state

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki/%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FScale%20or%20upgrade%20failed%20with%20image%20not%20found)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS CRUD operations (upgrade/scale) fail with InternalServerError. Underlying er... | Service Principal linked to the AKS PG App ID was removed fr... | 1) Confirm via AKS ContextActivity Kusto query filtering by ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FOperations%20Fail%20with%20code%20GetSKUStoreError%20InvalidAuthenticationToken) |
| 2 | AKS nodepool scale/upgrade fails with InvalidParameter: images referenced from d... | Kubernetes version is outdated/unsupported and the base VM i... | 1) Create new nodepool with supported K8s version. 2) Copy c... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FScale%20or%20upgrade%20failed%20with%20image%20not%20found) |
| 3 | AKS cluster CRUD operations (upgrade, scale) fail with InternalServerError/GetSK... | The Service Principal linked to the AKS PG well-known App ID... | Re-register the AKS resource provider to recreate the SP: az... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FOperations%20Fail%20with%20code%20GetSKUStoreError%20InvalidAuthenticationToken) |
| 4 | AKS nodepool scale or upgrade fails with image not found - InvalidParameter: ima... | The Kubernetes version is outdated/no longer supported and t... | 1) Create new nodepool with supported K8s version. 2) Migrat... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FScale%20or%20upgrade%20failed%20with%20image%20not%20found) |
| 5 | AKS scaling or upgrade fails with image not found: InvalidParameter - images ref... | Kubernetes version is outdated/unsupported and base VM image... | 1) Create new nodepool with supported K8s version 2) Migrate... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki/%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FScale%20or%20upgrade%20failed%20with%20image%20not%20found) |
