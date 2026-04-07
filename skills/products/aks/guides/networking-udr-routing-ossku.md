# AKS UDR 与路由 — ossku -- Quick Reference

**Sources**: 1 | **21V**: All | **Entries**: 7
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | InvalidOSSKU error when creating CVM node pool: OSSKU=Ubuntu2204 is invalid, osS... | Only specific OS versions support CVM: Ubuntu 20.04 (k8s 1.2... | Use a supported OS SKU for CVM node pools: Ubuntu2004 (k8s 1... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FAKS%20Confidential%20VM%20%28CVM%29) |
| 2 | InvalidOSSKU error when creating AKS cluster/nodepool with osSku=Flatcar: Subscr... | Flatcar Container Linux for AKS is in preview and requires e... | Register the AKSFlatcarPreview feature flag: az feature regi... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Flatcar%20Container%20Linux%20for%20AKS) |
| 3 | Flatcar nodepool creation fails with InvalidOSSKU/CVMIncompatibleWithConfig/BadR... | Flatcar Container Linux has specific limitations: no FIPS, n... | Remove the incompatible feature. Use Gen2 VM sizes. Use Node... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Flatcar%20Container%20Linux%20for%20AKS) |
| 4 | InvalidOSSKU when trying to change existing nodepool OSSKU to Flatcar: Only allo... | OS migration to Flatcar is not currently supported. OSSKU ch... | Create a new node pool with osSku=Flatcar. Cordon/drain the ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Flatcar%20Container%20Linux%20for%20AKS) |
| 5 | AKS Azure Linux: OSSKU is invalid or InvalidOSSKU error when creating or upgradi... | The osSku AzureLinux3 is not supported for the Kubernetes ve... | Check supported osSku by k8s version: AzureLinux3 GA on k8s ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Azure%20Linux%20%28Mariner%29) |
| 6 | Node pool creation fails with: OSSKU='Ubuntu2404' is invalid, details: Selected ... | Ubuntu2404 osSku requires minimum Kubernetes 1.32.0; using i... | Upgrade cluster Kubernetes version to at least 1.32.0 before... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FUbuntu) |
| 7 | Node pool create/update fails with InvalidOSSKU: FIPS mode is not supported with... | Ubuntu2404 has feature compatibility restrictions: FIPS not ... | For FIPS workloads: use Ubuntu/Ubuntu2204 osSku (FIPS for Ub... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FUbuntu) |

## Quick Troubleshooting Path

1. Check: Use a supported OS SKU for CVM node pools: Ubuntu2004 (k8s 1 `[source: ado-wiki]`
2. Check: Register the AKSFlatcarPreview feature flag: az feature register --namespace Microsoft `[source: ado-wiki]`
3. Check: Remove the incompatible feature `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/networking-udr-routing-ossku.md)
