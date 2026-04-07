# AKS 集群版本升级 — scale -- Quick Reference

**Sources**: 2 | **21V**: All | **Entries**: 5
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS cluster upgrade or scale fails with Unable to get log analytics workspace in... | Log Analytics workspace or its resource group was deleted wi... | If <14 days since deletion: recover workspace with New-AzOpe... | [G] 8.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/aks-upgrade-scale-fail-log-analytics-workspace-missing) |
| 2 | AKS nodepool upgrade fails with GetSurgedVms_CountNotMatch or AgentCountNotMatch... | Race condition between AKS RP and cluster autoscaler: autosc... | Disable cluster autoscaler before nodepool upgrades, re-enab... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FGetSurgedVms_CountNotMatch_for_upgrade) |
| 3 | Quota exceeded error during AKS cluster creation, scale up, or upgrade at large ... | Regional compute quotas exceeded for the subscription when p... | Create a support request in the subscription to increase reg... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/aks-at-scale-troubleshoot-guide) |
| 4 | AKS cluster upgrade or scale fails with 'Changing property imageReference is not... | Tags or resource properties in MC_* node resource group were... | Add a new node pool, then delete the affected node pool | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/changing-property-imagereference-not-allowed) |
| 5 | AKS cluster cannot simultaneously upgrade and scale - second operation fails whi... | Each operation type must finish on the target resource befor... | Run az aks show to check ProvisioningState. If Upgrading: wa... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/upgrading-or-scaling-does-not-succeed) |

## Quick Troubleshooting Path

1. Check: If <14 days since deletion: recover workspace with New-AzOperationalInsightsWorkspace (recreate RG f `[source: mslearn]`
2. Check: Disable cluster autoscaler before nodepool upgrades, re-enable after completion `[source: ado-wiki]`
3. Check: Create a support request in the subscription to increase regional compute quota for the correspondin `[source: mslearn]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/upgrade-cluster-version-scale.md)
