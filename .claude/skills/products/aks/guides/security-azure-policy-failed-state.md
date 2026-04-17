# AKS Azure Policy — failed-state -- Quick Reference

**Sources**: 1 | **21V**: All | **Entries**: 3
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS cluster enters Failed state with RequestDisallowedByPolicy - resource was di... | Azure Policy assignments on the subscription/resource group ... | Guide customer to locate the blocking policy assignment (sho... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Upgrade%20and%20Update/Compilation%20of%20Cluster%20In%20Failed%20State) |
| 2 | AKS cluster operations fail with RequestDisallowedByPolicy error: resource was d... | Customer has Azure Policy assignments (e.g. requiring specif... | Guide the customer to locate the blocking policy assignments... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Upgrade%20and%20Update/Compilation%20of%20Cluster%20In%20Failed%20State) |
| 3 | AKS cluster operations fail with RequestDisallowedByPolicy: Azure Policy blocks ... | Azure Policy assignments enforce tag, naming, or configurati... | Locate the blocking policy assignments via error details, th... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FUpgrade%20and%20Update%2FCompilation%20of%20Cluster%20In%20Failed%20State) |

## Quick Troubleshooting Path

1. Check: Guide customer to locate the blocking policy assignment (shown in error details), then either: 1) Cr `[source: ado-wiki]`
2. Check: Guide the customer to locate the blocking policy assignments, then either create a policy exemption  `[source: ado-wiki]`
3. Check: Locate the blocking policy assignments via error details, then create a policy exemption for the MC_ `[source: ado-wiki]`
