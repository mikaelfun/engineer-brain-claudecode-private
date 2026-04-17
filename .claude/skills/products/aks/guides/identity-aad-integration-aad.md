# AKS AAD 集成与认证 — aad -- Quick Reference

**Sources**: 3 | **21V**: All | **Entries**: 10
**Last updated**: 2026-04-07

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Legacy AAD integration AKS clusters deprecated; platform auto-upgrades to manage... | Old AAD integration deprecated in favor of managed AAD with ... | Migrate to managed AAD integration before auto-upgrade. New ... | [B] 7.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | 客户需要查看谁在 AKS 集群中创建、删除或修改了 Pod/Service/ServiceAccount 等资源，但无法找到操作记录 | 未启用 AKS 诊断设置中的 kube-audit 日志，导致集群操作事件未被记录到 Log Analytics wor... | 在 AKS 诊断设置中启用 kube-audit 类别日志，然后通过 AzureDiagnostics 表查询：Azur... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FMonitoring%2FViewing%20events%20in%20an%20AKS%20cluster) |
| 3 | Error 'getting credentials: exec: executable kubelogin not found' when running k... | Starting with Kubernetes 1.24, the default clusterUser crede... | Install kubelogin from https://github.com/Azure/kubelogin. A... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FSecurity%20and%20Identity%2FAAD%20integrated%20AKS%20Cluster%20Authorization%20%26%20Authentication%20mechanism%20and%20related%20troubleshooting) |
| 4 | AAD-integrated AKS cluster does not prompt for device login authentication after... | Cached credential token exists at ~/.kube/cache/kubelogin/Az... | Delete the cached .json file under ~/.kube/cache/kubelogin/ ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FSecurity%20and%20Identity%2FAAD%20integrated%20AKS%20Cluster%20Authorization%20%26%20Authentication%20mechanism%20and%20related%20troubleshooting) |
| 5 | Running kubectl commands against AAD-integrated AKS cluster on Kubernetes 1.24+ ... | Starting with K8s 1.24, AAD-integrated clusters use exec-bas... | 1) Install kubelogin: az aks install-cli or download from ht... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Security%20and%20Identity/Kubelogin%20requirements%20for%201.24%2B) |
| 6 | Users unable to authenticate to AAD-integrated AKS cluster. Error: 'Failed to ac... | Conditional access policy requires MFA for all devices. This... | Update the conditional access policy to exclude impacted use... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FSecurity%20and%20Identity%2FAAD%20integrated%20with%20AKS%20-%20%20%20MFA%20enabled) |
| 7 | Enabling AAD on AKS cluster fails: 'az aks update --enable-aad --enable-azure-rb... | AKS cluster was created with RBAC disabled. RBAC cannot be e... | Create a new AKS cluster with RBAC enabled and migrate workl... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FSecurity%20and%20Identity%2FAAD%2FAKS%20RBAC%20Enablement%20Limitation) |
| 8 | Error 'The azure auth plugin has been removed' when running kubectl commands aga... | The logged-in user may not have required permissions to run ... | Check if the user has permissions to execute kubelogin. Try ... | [B] 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FSecurity%20and%20Identity%2FAAD%20integrated%20AKS%20Cluster%20Authorization%20%26%20Authentication%20mechanism%20and%20related%20troubleshooting) |
| 9 | After upgrading AKS to 1.24+, kubectl commands fail with error: The azure auth p... | Starting from Kubernetes 1.24, the in-tree Azure auth plugin... | 1) Install kubelogin from https://github.com/Azure/kubelogin... | [B] 6.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 10 | Error from server (Forbidden): resource is forbidden: User cannot list resource ... | Microsoft Entra ID account lacks required RBAC permissions. ... | Check RBAC type: az aks show --query aadProfile.enableAzureR... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/user-cannot-get-cluster-resources) |

## Quick Troubleshooting Path

1. Check: Migrate to managed AAD integration before auto-upgrade `[source: onenote]`
2. Check: 在 AKS 诊断设置中启用 kube-audit 类别日志，然后通过 AzureDiagnostics 表查询：AzureDiagnostics | where Category == "kube-a `[source: ado-wiki]`
3. Check: Install kubelogin from https://github `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/identity-aad-integration-aad.md)
