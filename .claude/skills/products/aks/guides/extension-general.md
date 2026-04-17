# AKS 扩展与插件通用 -- Quick Reference

**Sources**: 3 | **21V**: All | **Entries**: 3
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Cost Analysis data not appearing in Azure portal for AKS cluster. Cost Analysis ... | Cost Analysis addon requires standard or premium tier (not f... | 1) Verify addon active in ASI (may take 24h to sync). 2) Che... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FAddons%20and%20Extensions%2FCost%20Analysis%20Addon) |
| 2 | Kubernetes marketplace offer fails: payment instrument not supported; offer cann... | Subscription billing constraints, regional availability rest... | Verify subscription billing configuration; check offer regio... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-failed-kubernetes-deployment-offer) |
| 3 | Open Service Broker for Azure (OSBA) helm install succeeds but broker fails to p... | OSBA defaults to global Azure environment. Without specifyin... | Add --set azure.environment=AzureChinaCloud to the helm inst... | [B] 5.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |

## Quick Troubleshooting Path

1. Check: 1) Verify addon active in ASI (may take 24h to sync) `[source: ado-wiki]`
2. Check: Verify subscription billing configuration; check offer regional availability; accept legal terms via `[source: mslearn]`
3. Check: Add --set azure `[source: onenote]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/extension-general.md)
