# AKS 网络连通性通用 — kubectl -- Quick Reference

**Sources**: 3 | **21V**: All | **Entries**: 3
**Last updated**: 2026-04-05

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | kubectl fails: dial tcp [::1]:8080: connectex: No connection could be made or Yo... | Kubeconfig file missing, in wrong directory, expired, or cor... | Run az aks get-credentials --resource-group <rg> --name <clu... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/config-file-is-not-available-when-connecting) |
| 2 | az aks install-cli fails with 'HTTP Error 404: Not Found' when installing specif... | Mooncake kubectl mirror (mirror.azure.cn/kubernetes/kubectl/... | 1) Check available versions at https://mirror.azure.cn/kuber... | [B] 5.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 3 | kubectl edit/delete operations on managed Kubernetes namespaces, resource quotas... | When Managed Namespaces feature is enabled, ValidatingAdmiss... | Modifications to managed namespaces, resource quotas (defaul... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FManaged%20Namespaces) |

## Quick Troubleshooting Path

1. Check: Run az aks get-credentials --resource-group <rg> --name <cluster> [--overwrite-existing]; verify KUB `[source: mslearn]`
2. Check: 1) Check available versions at https://mirror `[source: onenote]`
3. Check: Modifications to managed namespaces, resource quotas (defaultresourcequota), and network policies (d `[source: ado-wiki]`
