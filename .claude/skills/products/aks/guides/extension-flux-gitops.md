# AKS Flux / GitOps -- Quick Reference

**Sources**: 1 | **21V**: All | **Entries**: 1
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | FluxConfiguration resource is stuck in Creating state or changes are not being a... | fluxconfigs.clusterconfig.azure.com CRD does not exist on th... | Re-issue PUT request on the microsoft.flux extension to rein... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FMicrosoft.Flux%20FluxConfiguration%20TSG) |

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/extension-flux-gitops.md)
