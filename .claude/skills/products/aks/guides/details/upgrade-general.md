# AKS 升级通用问题 -- Comprehensive Troubleshooting Guide

**Entries**: 4 | **Draft sources**: 0 | **Kusto queries**: 2
**Kusto references**: auto-upgrade.md, scale-upgrade-operations.md
**Generated**: 2026-04-07

---

## Phase 1: AKS 1.31 changed default image pull mode from seri

### aks-692: After upgrading to AKS 1.31+, workloads experience increased latency for contain...

**Root Cause**: AKS 1.31 changed default image pull mode from serialized to parallel; parallel pulls can cause disk I/O contention in edge case workload patterns

**Solution**:
Use ephemeral OS disks; increase OS disk size; use newer/larger VM SKUs; or switch back to serialized image pulls (requires ICM to PG for configuration change)

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FParallel%20Image%20Pulling)]`

## Phase 2: Subscription compute (CPU vCPU/core) quota exceede

### aks-961: AKS scale/upgrade/create fails with QuotaExceeded: Operation results in exceedin...

**Root Cause**: Subscription compute (CPU vCPU/core) quota exceeded for the target VM size or region

**Solution**:
Customer requests core quota increase via Azure Portal (per-vm-quota-requests). After quota increase, retry the operation. If upgrade was in progress, re-run upgrade via CLI

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki/%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FQuota%20limits%20are%20exceeded)]`

## Phase 3: K8s 1.19 on AKS defaults to containerd runtime whi

### aks-244: Docker-in-Docker (DinD) workloads break after upgrading AKS to Kubernetes 1.19 w...

**Root Cause**: K8s 1.19 on AKS defaults to containerd runtime which does not have Docker socket. DinD workloads depend on Docker daemon socket (/var/run/docker.sock) unavailable under containerd.

**Solution**:
Quick fix: Add a nodepool with k8s 1.18 (uses dockershim). Permanent fix: Migrate to docker buildx/buildkit or similar container-native build tools that do not require Docker daemon.

`[Score: [B] 6.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 4: A previous cluster operation is still in progress 

### aks-1170: OperationNotAllowed error when starting, upgrading, or scaling AKS cluster: Anot...

**Root Cause**: A previous cluster operation is still in progress or left the cluster in inconsistent state. AKS blocks concurrent operations on the same resource.

**Solution**:
Wait for current operation to finish, use az aks operation-abort, check cluster state with az aks show, or retry failed operation.

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/operationnotallowed)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | After upgrading to AKS 1.31+, workloads experience increased latency for contain... | AKS 1.31 changed default image pull mode from serialized to ... | Use ephemeral OS disks; increase OS disk size; use newer/lar... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FParallel%20Image%20Pulling) |
| 2 | AKS scale/upgrade/create fails with QuotaExceeded: Operation results in exceedin... | Subscription compute (CPU vCPU/core) quota exceeded for the ... | Customer requests core quota increase via Azure Portal (per-... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki/%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FQuota%20limits%20are%20exceeded) |
| 3 | Docker-in-Docker (DinD) workloads break after upgrading AKS to Kubernetes 1.19 w... | K8s 1.19 on AKS defaults to containerd runtime which does no... | Quick fix: Add a nodepool with k8s 1.18 (uses dockershim). P... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 4 | OperationNotAllowed error when starting, upgrading, or scaling AKS cluster: Anot... | A previous cluster operation is still in progress or left th... | Wait for current operation to finish, use az aks operation-a... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/operationnotallowed) |
