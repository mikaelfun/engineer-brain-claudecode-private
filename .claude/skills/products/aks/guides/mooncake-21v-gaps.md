# AKS Mooncake 21V 功能差异 -- Quick Reference

**Sources**: 2 | **21V**: Partial | **Entries**: 4
**Last updated**: 2026-04-05

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | KMS (Key Management Service) for etcd secrets encryption not available in AKS Az... | KMS plugin for AKS was in public preview globally around Mar... | KMS-based secrets encryption availability in Azure China is ... | [B] 7.5 | [21v-gap: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | Customer asks about AKS Fleet Manager availability or multi-cluster management i... | AKS Fleet Manager is not available in Azure China (21Vianet)... | AKS Fleet Manager is not supported in 21V. No direct replace... | [B] 6.0 | [21v-gap](https://learn.microsoft.com/en-us/azure/kubernetes-fleet/overview) |
| 3 | Cannot stop AKS Fleet Manager Hub cluster - error: client ID does not have permi... | The Hub cluster has a built-in policy that prevents it from ... | This is expected behavior. Fleet Member clusters can be stop... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%20Fleet%20Manager%2FFAQ) |
| 4 | Unable to remove AKS cluster from Fleet - az fleet member delete command fails o... | A Delete Lock exists on the target AKS cluster resource. The... | 1) Remove Delete Lock from the target AKS cluster resource. ... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%20Fleet%20Manager%2FTSG%2FUnable%20to%20Remove%20AKS%20Cluster%20from%20Fleet) |

## Quick Troubleshooting Path

1. Check: KMS-based secrets encryption availability in Azure China is unconfirmed `[source: 21v-gap]`
2. Check: AKS Fleet Manager is not supported in 21V `[source: 21v-gap]`
3. Check: This is expected behavior `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/mooncake-21v-gaps.md)
