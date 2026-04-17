# AKS 外部负载均衡器与 SNAT — aks -- Quick Reference

**Sources**: 1 | **21V**: All | **Entries**: 5
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS node pool rollback fails with OperationNotAllowed: cannot rollback with blue... | UpgradeStrategy_BlueGreen requires an active blue/green cycl... | Resume the original blue/green upgrade or switch the pool to... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Agentpool%20Rollback) |
| 2 | AKS node pool rollback fails with AgentPoolRollbackNoHistory: rollback to node i... | recentlyUsedVersions is empty, usually because this pool has... | Let at least one upgrade finish so history is populated, the... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Agentpool%20Rollback) |
| 3 | AKS node pool rollback fails with AgentPoolRollbackVersionNotAllowed: invalid ve... | The (nodeImageVersion, orchestratorVersion) pair requested d... | Fetch the pool (expand properties.recentlyUsedVersions) and ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Agentpool%20Rollback) |
| 4 | AKS node pool rollback fails with AgentPoolRollbackVersionExpired - rollback tar... | The rollback target version pair exists but its timestamp is... | Roll back to a more recent pair within 7 days, or re-upgrade... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Agentpool%20Rollback) |
| 5 | AKS node pool rollback fails with AgentPoolRollbackVersionNotAllowed: Agent pool... | The requested rollback version is more than 3 minors behind ... | Pick a rollback target within 3 minor versions of the contro... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Agentpool%20Rollback) |

## Quick Troubleshooting Path

1. Check: Resume the original blue/green upgrade or switch the pool to rolling strategy, then issue the rollba `[source: ado-wiki]`
2. Check: Let at least one upgrade finish so history is populated, then retry the rollback `[source: ado-wiki]`
3. Check: Fetch the pool (expand properties `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/networking-lb-external-aks.md)
