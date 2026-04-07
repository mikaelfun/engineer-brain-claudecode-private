# AKS CRUD 操作与 Failed State 恢复 — cluster-creation -- Quick Reference

**Sources**: 2 | **21V**: All | **Entries**: 3
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS cluster creation fails with OperationNotAllowed: exceeding approved VM famil... | Subscription has exhausted the compute cores quota for the s... | Request quota increase: Azure portal → Quotas → Microsoft.Co... | [G] 8.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/operationnotallowed-publicipcountlimitreached-error) |
| 2 | AKS cluster creation fails with QuotaExceeded/ManagedClusterCountExceedsQuotaLim... | AKS instated per-subscription per-region quota limits on man... | Customer should request quota increase via Azure Portal Quot... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FQuotaExceeded%20QuotaExceededManagedCluster) |
| 3 | AKS cluster deployment fails with MissingSubscriptionRegistration: subscription ... | Required resource provider is not registered for the subscri... | Register the missing resource provider namespace using Azure... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/missingsubscriptionregistration-error) |

## Quick Troubleshooting Path

1. Check: Request quota increase: Azure portal → Quotas → Microsoft `[source: mslearn]`
2. Check: Customer should request quota increase via Azure Portal Quotas page `[source: ado-wiki]`
3. Check: Register the missing resource provider namespace using Azure portal (Subscriptions → Resource provid `[source: mslearn]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/crud-reconcile-failedstate-cluster-creation.md)
