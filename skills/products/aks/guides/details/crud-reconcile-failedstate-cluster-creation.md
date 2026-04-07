# AKS CRUD 操作与 Failed State 恢复 — cluster-creation -- Comprehensive Troubleshooting Guide

**Entries**: 3 | **Draft sources**: 2 | **Kusto queries**: 1
**Source drafts**: mslearn-aks-cluster-creation-troubleshooting.md, onenote-aks-reconcile-cluster.md
**Kusto references**: cluster-snapshot.md
**Generated**: 2026-04-07

---

## Phase 1: Subscription has exhausted the compute cores quota

### aks-1195: AKS cluster creation fails with OperationNotAllowed: exceeding approved VM famil...

**Root Cause**: Subscription has exhausted the compute cores quota for the specific VM SKU family or reached the public IP address limit in the region

**Solution**:
Request quota increase: Azure portal → Quotas → Microsoft.Compute → filter by region → edit the specific SKU record → submit new limit. For PublicIP: Subscriptions → Usage + quotas → Provider: Networking → find Public IP Addresses → create support request for increase. Alternatively, reprovision in another region/SKU.

`[Score: [G] 8.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/operationnotallowed-publicipcountlimitreached-error)]`

## Phase 2: AKS instated per-subscription per-region quota lim

### aks-771: AKS cluster creation fails with QuotaExceeded/ManagedClusterCountExceedsQuotaLim...

**Root Cause**: AKS instated per-subscription per-region quota limits on managed cluster count (effective September 2, 2025). Customer has reached the maximum number of clusters allowed.

**Solution**:
Customer should request quota increase via Azure Portal Quotas page. Must file under support path: Azure/Subscription limits and quota/Azure Kubernetes Service (not AKS support path). Quota ICMs auto-created against AzureKubernetesService/ClusterQuotaRequests team (all Sev 3). Decline for student/free-trial/DreamSpark subscriptions; route internal requests to AZURECONTAINERSERVICE/Platform.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FQuotaExceeded%20QuotaExceededManagedCluster)]`

## Phase 3: Required resource provider is not registered for t

### aks-1193: AKS cluster deployment fails with MissingSubscriptionRegistration: subscription ...

**Root Cause**: Required resource provider is not registered for the subscription, or the API version/location is not supported for the resource type

**Solution**:
Register the missing resource provider namespace using Azure portal (Subscriptions → Resource providers) or Azure CLI: az provider register --namespace Microsoft.OperationsManagement. Replace namespace with the one shown in the error message.

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/missingsubscriptionregistration-error)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS cluster creation fails with OperationNotAllowed: exceeding approved VM famil... | Subscription has exhausted the compute cores quota for the s... | Request quota increase: Azure portal → Quotas → Microsoft.Co... | [G] 8.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/operationnotallowed-publicipcountlimitreached-error) |
| 2 | AKS cluster creation fails with QuotaExceeded/ManagedClusterCountExceedsQuotaLim... | AKS instated per-subscription per-region quota limits on man... | Customer should request quota increase via Azure Portal Quot... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FQuotaExceeded%20QuotaExceededManagedCluster) |
| 3 | AKS cluster deployment fails with MissingSubscriptionRegistration: subscription ... | Required resource provider is not registered for the subscri... | Register the missing resource provider namespace using Azure... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/missingsubscriptionregistration-error) |
