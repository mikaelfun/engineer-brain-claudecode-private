# AKS UDR 与路由 — scale -- Quick Reference

**Sources**: 1 | **21V**: All | **Entries**: 5
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS CRUD operations (upgrade/scale) fail with InternalServerError. Underlying er... | Service Principal linked to the AKS PG App ID was removed fr... | 1) Confirm via AKS ContextActivity Kusto query filtering by ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FOperations%20Fail%20with%20code%20GetSKUStoreError%20InvalidAuthenticationToken) |
| 2 | AKS nodepool scale/upgrade fails with InvalidParameter: images referenced from d... | Kubernetes version is outdated/unsupported and the base VM i... | 1) Create new nodepool with supported K8s version. 2) Copy c... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FScale%20or%20upgrade%20failed%20with%20image%20not%20found) |
| 3 | AKS cluster CRUD operations (upgrade, scale) fail with InternalServerError/GetSK... | The Service Principal linked to the AKS PG well-known App ID... | Re-register the AKS resource provider to recreate the SP: az... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FOperations%20Fail%20with%20code%20GetSKUStoreError%20InvalidAuthenticationToken) |
| 4 | AKS nodepool scale or upgrade fails with image not found - InvalidParameter: ima... | The Kubernetes version is outdated/no longer supported and t... | 1) Create new nodepool with supported K8s version. 2) Migrat... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FScale%20or%20upgrade%20failed%20with%20image%20not%20found) |
| 5 | AKS scaling or upgrade fails with image not found: InvalidParameter - images ref... | Kubernetes version is outdated/unsupported and base VM image... | 1) Create new nodepool with supported K8s version 2) Migrate... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki/%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FScale%20or%20upgrade%20failed%20with%20image%20not%20found) |

## Quick Troubleshooting Path

1. Check: 1) Confirm via AKS ContextActivity Kusto query filtering by operationID for InvalidAuthenticationTok `[source: ado-wiki]`
2. Check: 1) Create new nodepool with supported K8s version `[source: ado-wiki]`
3. Check: Re-register the AKS resource provider to recreate the SP: az provider register --namespace Microsoft `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/networking-udr-routing-scale.md)
