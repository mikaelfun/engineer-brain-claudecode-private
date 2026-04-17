# AKS 节点池扩缩容 — windows -- Quick Reference

**Sources**: 1 | **21V**: Partial | **Entries**: 5
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Error: Creating Windows node pools using ARM64 SKU is not supported | ARM64 is not supported for Windows node pools in AKS | Use Linux node pools for ARM64 workloads. Windows workloads ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Arm64%20node%20pools) |
| 2 | AKS Windows nodepool creation fails with: '<VM-SKU> is a Gen 2-only VM. Windows2... | Gen2 VM sizes are not supported on Windows2019 nodepools by ... | Select a Gen1 VM size to use on Windows2019, or specify --os... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Compute/Windows/Windows%20Gen2%20VMs) |
| 3 | AKS nodepool creation fails with: 'Cannot create Windows2022 node pools with the... | AKS stopped supporting Windows2022 node pools from Kubernete... | Create Windows2025 or Windows Annual Channel node pools: --o... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Compute/Windows/Windows%20Retirements) |
| 4 | Creating AKS Windows node pool with --os-sku Windows2025 on k8s 1.31 or below fa... | Windows Server 2025 requires Kubernetes version 1.32.0 or hi... | Create node pool with Kubernetes version 1.32.0 or higher. U... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Windows%202025) |
| 5 | Attempting to update AKS node pool OS SKU to Windows2025 fails: 'Windows2025' is... | Node pool update command does not support changing Windows O... | Create a new node pool with --os-sku Windows2025 and migrate... | [W] 2.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Windows%202025) |

## Quick Troubleshooting Path

1. Check: Use Linux node pools for ARM64 workloads `[source: ado-wiki]`
2. Check: Select a Gen1 VM size to use on Windows2019, or specify --os-sku Windows2022 to create a Windows2022 `[source: ado-wiki]`
3. Check: Create Windows2025 or Windows Annual Channel node pools: --os-type Windows --os-sku Windows2025 or - `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/scale-nodepool-windows.md)
