# AKS VMSS CSE 与节点启动 — extension -- Quick Reference

**Sources**: 3 | **21V**: All | **Entries**: 9
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | ML extension deployment fails with permission error on a new subscription. Error... | Microsoft.Kubernetes and Microsoft.KubernetesConfiguration r... | Register the required providers: az provider register --name... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20ML(Azure%20Machine%20Learning)%20TSG) |
| 2 | Azure Backup Extension fails to install on AKS cluster or dataprotection-microso... | Extension Manager not deployed correctly in AKS cluster, or ... | 1) Check if Extension Manager is deployed. 2) Check dataprot... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FAddons%20and%20Extensions%2FAzure%20backup%20extension) |
| 3 | Dapr extension not available on AKS in Mooncake; az k8s-extension create --exten... | Dapr extension not GA in Mooncake. No regions supported. No ... | Use self-managed Dapr via Helm chart as workaround. Monitor ... | [B] 6.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 4 | Azure App Configuration extension installation fails with Resource already exist... | Azure App Configuration Kubernetes Provider already installe... | Uninstall Azure App Configuration Kubernetes Provider first ... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-app-configuration-extension-installation-errors) |
| 5 | Azure App Configuration extension fails with Extension type microsoft.appconfigu... | Azure App Configuration extension not available in the speci... | Install in a supported region that the cluster extension sup... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-app-configuration-extension-installation-errors) |
| 6 | Dapr extension installation fails with no visible error message; extension statu... | Wrong key used in configuration settings (e.g., global.ha=fa... | Inspect error via az k8s-extension list --cluster-type manag... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-dapr-extension-installation-errors) |
| 7 | Dapr extension install fails: ExtensionTypeRegistrationGetFailed - Extension typ... | Dapr version not available in the specified Azure region | Install Dapr extension in a region where the target version ... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-dapr-extension-installation-errors) |
| 8 | Kubernetes marketplace offer: Extension failed to deploy with Internal server er... | Extension resource installation failure or incorrect Helm ch... | For internal server error: delete extension resource and rei... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-failed-kubernetes-deployment-offer) |
| 9 | az aks commands fail or behave unexpectedly after installing aks-preview extensi... | aks-preview extension v0.4.23 is incompatible with azure-cli... | 1) Uninstall aks-preview extension if not needed: az extensi... | [B] 5.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |

## Quick Troubleshooting Path

1. Check: Register the required providers: az provider register --namespace Microsoft `[source: ado-wiki]`
2. Check: 1) Check if Extension Manager is deployed `[source: ado-wiki]`
3. Check: Use self-managed Dapr via Helm chart as workaround `[source: onenote]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/node-vmss-cse-extension.md)
