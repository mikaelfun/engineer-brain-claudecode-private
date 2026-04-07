# AKS 升级通用问题 -- Quick Reference

**Sources**: 3 | **21V**: All | **Entries**: 4
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | After upgrading to AKS 1.31+, workloads experience increased latency for contain... | AKS 1.31 changed default image pull mode from serialized to ... | Use ephemeral OS disks; increase OS disk size; use newer/lar... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FParallel%20Image%20Pulling) |
| 2 | AKS scale/upgrade/create fails with QuotaExceeded: Operation results in exceedin... | Subscription compute (CPU vCPU/core) quota exceeded for the ... | Customer requests core quota increase via Azure Portal (per-... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki/%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FQuota%20limits%20are%20exceeded) |
| 3 | Docker-in-Docker (DinD) workloads break after upgrading AKS to Kubernetes 1.19 w... | K8s 1.19 on AKS defaults to containerd runtime which does no... | Quick fix: Add a nodepool with k8s 1.18 (uses dockershim). P... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 4 | OperationNotAllowed error when starting, upgrading, or scaling AKS cluster: Anot... | A previous cluster operation is still in progress or left th... | Wait for current operation to finish, use az aks operation-a... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/operationnotallowed) |

## Quick Troubleshooting Path

1. Check: Use ephemeral OS disks; increase OS disk size; use newer/larger VM SKUs; or switch back to serialize `[source: ado-wiki]`
2. Check: Customer requests core quota increase via Azure Portal (per-vm-quota-requests) `[source: ado-wiki]`
3. Check: Quick fix: Add a nodepool with k8s 1 `[source: onenote]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/upgrade-general.md)
