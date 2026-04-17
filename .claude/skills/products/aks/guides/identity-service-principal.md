# AKS 服务主体 -- Quick Reference

**Sources**: 2 | **21V**: All | **Entries**: 5
**Last updated**: 2026-04-05

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Updating AKS cluster Service Principal credentials triggers a reboot of all work... | SP credential update writes new credentials to /etc/kubernet... | 1) Plan SP credential rotation during maintenance window. 2)... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | After AKS underlay migration, API server IP did not change; cluster behavior inc... | Cluster service principal expired before migration, preventi... | Ensure SP is valid before maintenance/migration. Renew via a... | [B] 7.5 | [onenote: POD/VMSCIM/4. Services/AKS/##Regular Syn] |
| 3 | AKS cluster degraded due to service principal credential expiration; different o... | App Registration (application object) and Enterprise Applica... | Understand that App Registration and Enterprise Application ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FSecurity%20and%20Identity%2FExplaining%20Service%20Principals%20and%20App%20Registrations%20in%20AD) |
| 4 | After resetting AKS service principal, node image shows not in latest mode in po... | Resetting AKS SP triggers reconcile that resets internal ima... | Cosmetic issue. Verify actual node image version with az aks... | [B] 5.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 5 | AKS operations fail with 403 AuthorizationFailed: client does not have authoriza... | AzureContainerService first-party service principal removed ... | Re-register Microsoft.ContainerService: az provider unregist... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FSecurity%20and%20Identity%2FRole%20assignments%20fail%20with%20AuthorizationFailed) |

## Quick Troubleshooting Path

1. Check: 1) Plan SP credential rotation during maintenance window `[source: onenote]`
2. Check: Ensure SP is valid before maintenance/migration `[source: onenote]`
3. Check: Understand that App Registration and Enterprise Application are separate objects `[source: ado-wiki]`
