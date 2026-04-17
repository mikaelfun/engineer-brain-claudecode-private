# AKS UDR 与路由 — ossku -- Comprehensive Troubleshooting Guide

**Entries**: 7 | **Draft sources**: 1 | **Kusto queries**: 0
**Source drafts**: ado-wiki-resolv-conf-generation-aks-ubuntu-2204.md
**Generated**: 2026-04-07

---

## Phase 1: Only specific OS versions support CVM: Ubuntu 20.0

### aks-644: InvalidOSSKU error when creating CVM node pool: OSSKU=Ubuntu2204 is invalid, osS...

**Root Cause**: Only specific OS versions support CVM: Ubuntu 20.04 (k8s 1.24-1.34), Ubuntu 24.04 (k8s 1.32-1.38), Azure Linux 3.0 (k8s 1.31+). Ubuntu 22.04, Azure Linux 2.0, and Windows are not supported

**Solution**:
Use a supported OS SKU for CVM node pools: Ubuntu2004 (k8s 1.24-1.34), Ubuntu2404 (k8s 1.32+), or AzureLinux3 (k8s 1.31+). Refer to the CVM supported OS versions compatibility table

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FAKS%20Confidential%20VM%20%28CVM%29)]`

## Phase 2: Flatcar Container Linux for AKS is in preview and 

### aks-735: InvalidOSSKU error when creating AKS cluster/nodepool with osSku=Flatcar: Subscr...

**Root Cause**: Flatcar Container Linux for AKS is in preview and requires explicit feature flag registration on the subscription

**Solution**:
Register the AKSFlatcarPreview feature flag: az feature register --namespace Microsoft.ContainerService --name AKSFlatcarPreview. Wait for propagation then retry

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Flatcar%20Container%20Linux%20for%20AKS)]`

## Phase 3: Flatcar Container Linux has specific limitations: 

### aks-737: Flatcar nodepool creation fails with InvalidOSSKU/CVMIncompatibleWithConfig/BadR...

**Root Cause**: Flatcar Container Linux has specific limitations: no FIPS, no SecurityPatch channel (only NodeImage/None), Gen2 VMs only, no CVM, no Artifact Streaming, no Trusted Launch, no Pod Sandboxing, no GPU workloads

**Solution**:
Remove the incompatible feature. Use Gen2 VM sizes. Use NodeImage or None upgrade channels. GPU workloads blocked pending AgentBaker support. Create new nodepools with Flatcar; OS migration to Flatcar is not supported

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Flatcar%20Container%20Linux%20for%20AKS)]`

## Phase 4: OS migration to Flatcar is not currently supported

### aks-739: InvalidOSSKU when trying to change existing nodepool OSSKU to Flatcar: Only allo...

**Root Cause**: OS migration to Flatcar is not currently supported. OSSKU change only allows migration between Ubuntu and AzureLinux variants

**Solution**:
Create a new node pool with osSku=Flatcar. Cordon/drain the old nodepool, move workloads, then delete the old nodepool

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Flatcar%20Container%20Linux%20for%20AKS)]`

## Phase 5: The osSku AzureLinux3 is not supported for the Kub

### aks-947: AKS Azure Linux: OSSKU is invalid or InvalidOSSKU error when creating or upgradi...

**Root Cause**: The osSku AzureLinux3 is not supported for the Kubernetes version being used, or required feature flags (AFEC) are not registered. CVM on AzureLinux requires Azure Linux 3.0+.

**Solution**:
Check supported osSku by k8s version: AzureLinux3 GA on k8s 1.28-1.36. AzureLinux2 retirement Nov 30 2025. For CVM: requires Azure Linux 3.0+ (k8s 1.28+). Register AFEC flag if needed.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Azure%20Linux%20%28Mariner%29)]`

## Phase 6: Ubuntu2404 osSku requires minimum Kubernetes 1.32.

### aks-981: Node pool creation fails with: OSSKU='Ubuntu2404' is invalid, details: Selected ...

**Root Cause**: Ubuntu2404 osSku requires minimum Kubernetes 1.32.0; using it with older k8s versions is not supported

**Solution**:
Upgrade cluster Kubernetes version to at least 1.32.0 before using Ubuntu2404 osSku, or use Ubuntu/Ubuntu2204 osSku for Kubernetes versions below 1.32

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FUbuntu)]`

## Phase 7: Ubuntu2404 has feature compatibility restrictions:

### aks-982: Node pool create/update fails with InvalidOSSKU: FIPS mode is not supported with...

**Root Cause**: Ubuntu2404 has feature compatibility restrictions: FIPS not supported (requires Ubuntu 22.04 or below); CVM+Ubuntu2404 requires k8s 1.33+; Ubuntu2404 cannot be combined with FIPS or certain Arm64/Trusted Launch+CVM configurations

**Solution**:
For FIPS workloads: use Ubuntu/Ubuntu2204 osSku (FIPS for Ubuntu2404 not yet supported). For CVM+Ubuntu2404: ensure k8s >= 1.33. Check OS SKU compatibility matrix before combining osSku with special features

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FUbuntu)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | InvalidOSSKU error when creating CVM node pool: OSSKU=Ubuntu2204 is invalid, osS... | Only specific OS versions support CVM: Ubuntu 20.04 (k8s 1.2... | Use a supported OS SKU for CVM node pools: Ubuntu2004 (k8s 1... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FAKS%20Confidential%20VM%20%28CVM%29) |
| 2 | InvalidOSSKU error when creating AKS cluster/nodepool with osSku=Flatcar: Subscr... | Flatcar Container Linux for AKS is in preview and requires e... | Register the AKSFlatcarPreview feature flag: az feature regi... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Flatcar%20Container%20Linux%20for%20AKS) |
| 3 | Flatcar nodepool creation fails with InvalidOSSKU/CVMIncompatibleWithConfig/BadR... | Flatcar Container Linux has specific limitations: no FIPS, n... | Remove the incompatible feature. Use Gen2 VM sizes. Use Node... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Flatcar%20Container%20Linux%20for%20AKS) |
| 4 | InvalidOSSKU when trying to change existing nodepool OSSKU to Flatcar: Only allo... | OS migration to Flatcar is not currently supported. OSSKU ch... | Create a new node pool with osSku=Flatcar. Cordon/drain the ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Flatcar%20Container%20Linux%20for%20AKS) |
| 5 | AKS Azure Linux: OSSKU is invalid or InvalidOSSKU error when creating or upgradi... | The osSku AzureLinux3 is not supported for the Kubernetes ve... | Check supported osSku by k8s version: AzureLinux3 GA on k8s ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Azure%20Linux%20%28Mariner%29) |
| 6 | Node pool creation fails with: OSSKU='Ubuntu2404' is invalid, details: Selected ... | Ubuntu2404 osSku requires minimum Kubernetes 1.32.0; using i... | Upgrade cluster Kubernetes version to at least 1.32.0 before... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FUbuntu) |
| 7 | Node pool create/update fails with InvalidOSSKU: FIPS mode is not supported with... | Ubuntu2404 has feature compatibility restrictions: FIPS not ... | For FIPS workloads: use Ubuntu/Ubuntu2204 osSku (FIPS for Ub... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FUbuntu) |
