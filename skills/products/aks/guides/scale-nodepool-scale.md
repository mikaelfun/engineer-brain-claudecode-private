# AKS 节点池扩缩容 — scale -- Quick Reference

**Sources**: 1 | **21V**: All | **Entries**: 6
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS CRUD/Start operations fail with ControlPlaneAddOnsNotReady, error references... | AKS RP checks ALL pods in kube-system namespace during opera... | Advise customer to move all user workloads out of kube-syste... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FControlPlaneAddOnsNotReady%20because%20kube%20proxy%20stuck%20pending) |
| 2 | AKS cluster/nodepool creation or scaling fails with SkuNotAvailable or VM size n... | Requested VM SKU restricted in subscription, not offered in ... | 1) az vm list-skus to check availability. 2) ASC Resource Ex... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FNode%20scaling%20fails%20due%20to%20allocation%20or%20capacity%20issues) |
| 3 | AKS node scaling fails with QuotaExceeded. Exceeds vCPU quota for VM size family... | Subscription vCPU quota exhausted. Azure two-tier quota: VM-... | 1) Submit quota increase via Portal (auto-approved for stand... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FNode%20scaling%20fails%20due%20to%20allocation%20or%20capacity%20issues) |
| 4 | AKS cluster creation fails with QuotaExceeded/ManagedClusterCountExceedsQuotaLim... | AKS cluster count quota limit reached. AKS enforces maximum ... | Customer must file NEW support ticket via correct path: Azur... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FQuotaExceeded%20QuotaExceededManagedCluster) |
| 5 | OSSKU Migration fails when attempting to change node count simultaneously with O... | Simultaneous agentpool scale and OSSKU migration operations ... | Perform OSSKU migration and scale operations separately - fi... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FOSSKU%20Migration) |
| 6 | AKS cluster stuck in Starting state or autoscaler nodes not visible despite VMSS... | The vmssCSE (CustomScript) extension was removed/deleted fro... | 1) Abort ongoing operation: az aks operation-abort -n <clust... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki/%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FvmssCSE%20deleted) |

## Quick Troubleshooting Path

1. Check: Advise customer to move all user workloads out of kube-system namespace per AKS FAQ `[source: ado-wiki]`
2. Check: 1) az vm list-skus to check availability `[source: ado-wiki]`
3. Check: 1) Submit quota increase via Portal (auto-approved for standard families) `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/scale-nodepool-scale.md)
