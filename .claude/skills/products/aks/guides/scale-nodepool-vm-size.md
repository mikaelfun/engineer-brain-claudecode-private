# AKS 节点池扩缩容 — vm-size -- Quick Reference

**Sources**: 2 | **21V**: All | **Entries**: 4
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Cluster or node pool creation fails with SKU Not Found or VM Size Not Available ... | Requested VM SKU restricted, unavailable, or not offered in ... | Check SKU availability: az vm list-skus --location <region> ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FNode%20scaling%20fails%20due%20to%20allocation%20or%20capacity%20issues) |
| 2 | AKS cluster or nodepool creation fails with SkuNotAvailable / VM Size Not Availa... | Requested VM size is not available in the subscription due t... | 1) Check SKU availability: az vm list-skus --location <regio... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FNode%20scaling%20fails%20due%20to%20allocation%20or%20capacity%20issues) |
| 3 | AKS cluster or node pool creation fails with 'SKU Not Found' or 'VM Size Not Ava... | Requested VM size is restricted at the subscription level (A... | Check SKU availability: `az vm list-skus --location <region>... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCompute%2FSKU%20Not%20Found%20OR%20VM%20Size%20Not%20Available) |
| 4 | Cannot create D4ds_v5/v4 VM size node pools in AzSm (availability zone stamped) ... | Constraint validation pipeline fails at AzSm step: Ephemeral... | PG-side fix deployed (2023-05-23). For troubleshooting use K... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |

## Quick Troubleshooting Path

1. Check: Check SKU availability: az vm list-skus --location <region> --size <sku> `[source: ado-wiki]`
2. Check: 1) Check SKU availability: az vm list-skus --location <region> --size <size> --all; 2) Check ASC Res `[source: ado-wiki]`
3. Check: Check SKU availability: `az vm list-skus --location <region> --size <vmsize> --all --output table` `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/scale-nodepool-vm-size.md)
