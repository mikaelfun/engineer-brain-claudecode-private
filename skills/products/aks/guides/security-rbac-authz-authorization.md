# AKS RBAC 与授权 — authorization -- Quick Reference

**Sources**: 2 | **21V**: All | **Entries**: 3
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Flux extension installation or uninstallation fails with AuthorizationFailed err... | Customer subscription not registered to required resource pr... | Register RPs: az provider register --namespace Microsoft.Kub... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FMicrosoft.Flux%20FluxConfiguration%20TSG) |
| 2 | LinkedAuthorizationFailed error when creating AKS cluster/nodepool with CRG: cli... | AzureContainerService app/identity does not have permission ... | Assign the AKS service principal/managed identity write perm... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Capacity%20Reservation%20Groups) |
| 3 | Kubernetes marketplace offer deployment fails: AuthorizationFailed - does not ha... | Microsoft.KubernetesConfiguration resource provider not regi... | Register the Microsoft.KubernetesConfiguration resource prov... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-failed-kubernetes-deployment-offer) |

## Quick Troubleshooting Path

1. Check: Register RPs: az provider register --namespace Microsoft `[source: ado-wiki]`
2. Check: Assign the AKS service principal/managed identity write permission (Contributor role) on the CRG res `[source: ado-wiki]`
3. Check: Register the Microsoft `[source: mslearn]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/security-rbac-authz-authorization.md)
