# AKS 集群创建与初始配置 -- Quick Reference

**Sources**: 3 | **21V**: Partial | **Entries**: 8
**Last updated**: 2026-04-07

## Symptom Quick Reference

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

## Quick Troubleshooting Path

1. Check: Retry vault deletion manually; if vault continues recreating, open collab with ASR team (support are `[source: ado-wiki]`
2. Check: Unregister and restart the Resource Provider registration via Azure Portal `[source: ado-wiki]`
3. Check: Reduce request frequency: run LIST scripts less frequently, space out deployments or use different s `[source: mslearn]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/cluster-creation-config.md)
