# AKS 节点池扩缩容 — fips -- Quick Reference

**Sources**: 1 | **21V**: All | **Entries**: 3
**Last updated**: 2026-04-07

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Error: Creating FIPS-enabled node pools using ARM64 SKU is not supported for non... | FIPS on ARM64 is only supported with AzureLinux 3.0+ (Kubern... | Use AzureLinux 3.0+ (k8s 1.32+) OS SKU for FIPS-enabled ARM6... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Arm64%20node%20pools) |
| 2 | Enabling/disabling FIPS on existing AKS node pool with Mariner OS fails: Creatin... | Mariner OS does not support updating existing node pools to ... | Use --os-sku AzureLinux with --enable-fips-image to create a... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Security%20and%20Identity/FIPS%20nodes) |
| 3 | Creating FIPS-enabled AKS node pool with ARM64 SKU fails: Creating FIPS-enabled ... | ARM64 + FIPS combination is only supported on Azure Linux V3... | Use --os-sku AzureLinux as the OS when creating ARM64 node p... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Security%20and%20Identity/FIPS%20nodes) |

## Quick Troubleshooting Path

1. Check: Use AzureLinux 3 `[source: ado-wiki]`
2. Check: Use --os-sku AzureLinux with --enable-fips-image to create a new FIPS-enabled Azure Linux node pool  `[source: ado-wiki]`
3. Check: Use --os-sku AzureLinux as the OS when creating ARM64 node pools with FIPS enabled `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/scale-nodepool-fips.md)
