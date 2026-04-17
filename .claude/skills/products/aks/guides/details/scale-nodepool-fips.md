# AKS 节点池扩缩容 — fips -- Comprehensive Troubleshooting Guide

**Entries**: 3 | **Draft sources**: 0 | **Kusto queries**: 1
**Kusto references**: scale-upgrade-operations.md
**Generated**: 2026-04-07

---

## Phase 1: FIPS on ARM64 is only supported with AzureLinux 3.

### aks-711: Error: Creating FIPS-enabled node pools using ARM64 SKU is not supported for non...

**Root Cause**: FIPS on ARM64 is only supported with AzureLinux 3.0+ (Kubernetes 1.32+). Ubuntu and AzureLinux 2.0 are not supported.

**Solution**:
Use AzureLinux 3.0+ (k8s 1.32+) OS SKU for FIPS-enabled ARM64 node pools.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Arm64%20node%20pools)]`

## Phase 2: Mariner OS does not support updating existing node

### aks-865: Enabling/disabling FIPS on existing AKS node pool with Mariner OS fails: Creatin...

**Root Cause**: Mariner OS does not support updating existing node pools to enable or disable FIPS.

**Solution**:
Use --os-sku AzureLinux with --enable-fips-image to create a new FIPS-enabled Azure Linux node pool and migrate workloads.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Security%20and%20Identity/FIPS%20nodes)]`

## Phase 3: ARM64 + FIPS combination is only supported on Azur

### aks-867: Creating FIPS-enabled AKS node pool with ARM64 SKU fails: Creating FIPS-enabled ...

**Root Cause**: ARM64 + FIPS combination is only supported on Azure Linux V3 OS.

**Solution**:
Use --os-sku AzureLinux as the OS when creating ARM64 node pools with FIPS enabled.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Security%20and%20Identity/FIPS%20nodes)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Error: Creating FIPS-enabled node pools using ARM64 SKU is not supported for non... | FIPS on ARM64 is only supported with AzureLinux 3.0+ (Kubern... | Use AzureLinux 3.0+ (k8s 1.32+) OS SKU for FIPS-enabled ARM6... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Arm64%20node%20pools) |
| 2 | Enabling/disabling FIPS on existing AKS node pool with Mariner OS fails: Creatin... | Mariner OS does not support updating existing node pools to ... | Use --os-sku AzureLinux with --enable-fips-image to create a... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Security%20and%20Identity/FIPS%20nodes) |
| 3 | Creating FIPS-enabled AKS node pool with ARM64 SKU fails: Creating FIPS-enabled ... | ARM64 + FIPS combination is only supported on Azure Linux V3... | Use --os-sku AzureLinux as the OS when creating ARM64 node p... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Security%20and%20Identity/FIPS%20nodes) |
