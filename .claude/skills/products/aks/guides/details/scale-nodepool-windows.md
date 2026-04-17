# AKS 节点池扩缩容 — windows -- Comprehensive Troubleshooting Guide

**Entries**: 5 | **Draft sources**: 0 | **Kusto queries**: 1
**Kusto references**: scale-upgrade-operations.md
**Generated**: 2026-04-07

---

## Phase 1: ARM64 is not supported for Windows node pools in A

### aks-705: Error: Creating Windows node pools using ARM64 SKU is not supported

**Root Cause**: ARM64 is not supported for Windows node pools in AKS

**Solution**:
Use Linux node pools for ARM64 workloads. Windows workloads must use non-ARM64 VM sizes.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Arm64%20node%20pools)]`

## Phase 2: Gen2 VM sizes are not supported on Windows2019 nod

### aks-802: AKS Windows nodepool creation fails with: '<VM-SKU> is a Gen 2-only VM. Windows2...

**Root Cause**: Gen2 VM sizes are not supported on Windows2019 nodepools by design. Windows2019 only supports Gen1 VMs.

**Solution**:
Select a Gen1 VM size to use on Windows2019, or specify --os-sku Windows2022 to create a Windows2022 nodepool which supports Gen2 VM sizes.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Compute/Windows/Windows%20Gen2%20VMs)]`

## Phase 3: AKS stopped supporting Windows2022 node pools from

### aks-807: AKS nodepool creation fails with: 'Cannot create Windows2022 node pools with the...

**Root Cause**: AKS stopped supporting Windows2022 node pools from Kubernetes version 1.34.0 as part of the Windows2022 retirement plan (planned retirement: March 2027).

**Solution**:
Create Windows2025 or Windows Annual Channel node pools: --os-type Windows --os-sku Windows2025 or --os-sku WindowsAnnualChannel. Migrate workloads from Windows2022 to the new nodepools.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Compute/Windows/Windows%20Retirements)]`

## Phase 4: Windows Server 2025 requires Kubernetes version 1.

### aks-1075: Creating AKS Windows node pool with --os-sku Windows2025 on k8s 1.31 or below fa...

**Root Cause**: Windows Server 2025 requires Kubernetes version 1.32.0 or higher.

**Solution**:
Create node pool with Kubernetes version 1.32.0 or higher. Upgrade cluster control plane first if needed.

`[Score: [Y] 4.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Windows%202025)]`

## Phase 5: Node pool update command does not support changing

### aks-1074: Attempting to update AKS node pool OS SKU to Windows2025 fails: 'Windows2025' is...

**Root Cause**: Node pool update command does not support changing Windows OS SKU. Windows2025 migration requires node pool recreation.

**Solution**:
Create a new node pool with --os-sku Windows2025 and migrate workloads. See https://learn.microsoft.com/en-us/azure/aks/upgrade-windows-os

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [W] 2.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Windows%202025)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Error: Creating Windows node pools using ARM64 SKU is not supported | ARM64 is not supported for Windows node pools in AKS | Use Linux node pools for ARM64 workloads. Windows workloads ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Arm64%20node%20pools) |
| 2 | AKS Windows nodepool creation fails with: '<VM-SKU> is a Gen 2-only VM. Windows2... | Gen2 VM sizes are not supported on Windows2019 nodepools by ... | Select a Gen1 VM size to use on Windows2019, or specify --os... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Compute/Windows/Windows%20Gen2%20VMs) |
| 3 | AKS nodepool creation fails with: 'Cannot create Windows2022 node pools with the... | AKS stopped supporting Windows2022 node pools from Kubernete... | Create Windows2025 or Windows Annual Channel node pools: --o... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Compute/Windows/Windows%20Retirements) |
| 4 | Creating AKS Windows node pool with --os-sku Windows2025 on k8s 1.31 or below fa... | Windows Server 2025 requires Kubernetes version 1.32.0 or hi... | Create node pool with Kubernetes version 1.32.0 or higher. U... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Windows%202025) |
| 5 | Attempting to update AKS node pool OS SKU to Windows2025 fails: 'Windows2025' is... | Node pool update command does not support changing Windows O... | Create a new node pool with --os-sku Windows2025 and migrate... | [W] 2.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Windows%202025) |
