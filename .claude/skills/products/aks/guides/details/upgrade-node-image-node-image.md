# AKS 节点镜像升级 — node-image -- Comprehensive Troubleshooting Guide

**Entries**: 6 | **Draft sources**: 2 | **Kusto queries**: 4
**Source drafts**: ado-wiki-b-Who-triggered-auto-node-upgrade.md, ado-wiki-c-Upgrade-Undrainable-Node-Behavior-Cordon.md
**Kusto references**: auto-upgrade.md, image-integrity.md, node-fabric-info.md, scale-upgrade-operations.md
**Generated**: 2026-04-07

---

## Phase 1: Ubuntu 18.04 EOL. PG removed 1804 node images. Clu

### aks-083: AKS nodes using Ubuntu 18.04 (node image 202510.19 or 202510.29) fail to scale o...

**Root Cause**: Ubuntu 18.04 EOL. PG removed 1804 node images. Clusters on k8s < 1.25 may use Ubuntu 18.04. No extensions approved. Root password 90-day expiry bug also affects 202510.19/202510.29 images.

**Solution**:
1) Upgrade node image to 202511.07+. 2) Upgrade k8s to 1.25+ (Ubuntu 22.04 default). 3) OS mapping: <1.25=Ubuntu18.04 possible, 1.25-1.32=Ubuntu22.04, 1.33+=Ubuntu24.04. 4) PG rolling out hotfix via Geneva Actions. 5) PG contact: allyford@microsoft.com. 6) 21v contacts: zhao.ning@oe.21vianet.com, feng.huan@oe.21vianet.com

`[Score: [G] 8.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 2: Vulnerability in runc allows malicious container i

### aks-090: AKS nodes vulnerable to CVE-2024-21626 - container breakout through runc process...

**Root Cause**: Vulnerability in runc allows malicious container image to exploit process.cwd and leaked fds to escape container isolation and access host OS

**Solution**:
1) Upgrade node image: Azure Linux >= 202401.17.2 (runc 1.1.9-4), Ubuntu 22.04 >= 202401.17.1 (runc 1.1.9-2); 2) Verify with runc --version; 3) Track rollout at https://releases.aks.azure.com/

`[Score: [G] 8.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 3: By design, az aks upgrade / az aks nodepool upgrad

### aks-801: Running 'az aks upgrade' or 'az aks nodepool upgrade' does not upgrade existing ...

**Root Cause**: By design, az aks upgrade / az aks nodepool upgrade only upgrades the node image version, not the VM Generation. Changing VM Generation requires creating a new nodepool.

**Solution**:
Create a new nodepool that supports Gen2 on the upgraded cluster: for k8s >= 1.25 specify a Gen2 VM size; for k8s < 1.25 specify --os-sku Windows2022 and a Gen2 VM size. Migrate workloads to the new nodepool and delete the old Gen1 nodepool.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Compute/Windows/Windows%20Gen2%20VMs)]`

## Phase 4: Customer-hosted Karpenter is pulling VHDs from the

### aks-912: Self-hosted Karpenter using unsupported Community Gallery VHDs instead of AKS-su...

**Root Cause**: Customer-hosted Karpenter is pulling VHDs from the Community Image Gallery rather than official AKS-supported images from the AKS release page. This configuration is not supported.

**Solution**:
1) Use 'kubectl describe node' to verify node image origin; 2) Flag as unsupported scenario early in triage; 3) Redirect customer to use only AKS VHDs from https://releases.aks.azure.com/

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FNode%20Autoprovision%20%28Karpenter%29)]`

## Phase 5: Ubuntu 18.04 support ended May 2023. AKS continued

### aks-132: Ubuntu 18.04 EOL on AKS nodes; customers on AKS <1.25 need migration plan

**Root Cause**: Ubuntu 18.04 support ended May 2023. AKS continued images until July 2023 for K8s 1.24. K8s 1.25+ uses Ubuntu 22.04

**Solution**:
Upgrade to AKS 1.25+ for Ubuntu 22.04. For 1.24, run az aks nodepool upgrade --node-image-only for latest patched 18.04

`[Score: [B] 6.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 6: AKS node images are rebuilt weekly with latest sec

### aks-286: Customer reports security scan finding CVE vulnerabilities in AKS node packages;...

**Root Cause**: AKS node images are rebuilt weekly with latest security patches. AKS PG commits to fixing reported CVEs within 30 days. The exact node image version containing a specific fix depends on when upstream distro releases the patch.

**Solution**:
1) Inform customer AKS PG fixes CVEs within 30 days. 2) Check releases.aks.azure.com/#tabasia for China region. 3) Open GitHub release notes (raw.githubusercontent.com/Azure/AgentBaker/master/vhdbuilder/release-notes/AKSUbuntu/...) and search for the package name. 4) If not in current image, inform customer it will be in a future release. 5) Check Ubuntu security tracker: ubuntu.com/security/CVE-<id>.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [Y] 3.0 | Source: [onenote: MCVKB/wiki_migration/======VM&SCIM======]]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS nodes using Ubuntu 18.04 (node image 202510.19 or 202510.29) fail to scale o... | Ubuntu 18.04 EOL. PG removed 1804 node images. Clusters on k... | 1) Upgrade node image to 202511.07+. 2) Upgrade k8s to 1.25+... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | AKS nodes vulnerable to CVE-2024-21626 - container breakout through runc process... | Vulnerability in runc allows malicious container image to ex... | 1) Upgrade node image: Azure Linux >= 202401.17.2 (runc 1.1.... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 3 | Running 'az aks upgrade' or 'az aks nodepool upgrade' does not upgrade existing ... | By design, az aks upgrade / az aks nodepool upgrade only upg... | Create a new nodepool that supports Gen2 on the upgraded clu... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Compute/Windows/Windows%20Gen2%20VMs) |
| 4 | Self-hosted Karpenter using unsupported Community Gallery VHDs instead of AKS-su... | Customer-hosted Karpenter is pulling VHDs from the Community... | 1) Use 'kubectl describe node' to verify node image origin; ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FNode%20Autoprovision%20%28Karpenter%29) |
| 5 | Ubuntu 18.04 EOL on AKS nodes; customers on AKS <1.25 need migration plan | Ubuntu 18.04 support ended May 2023. AKS continued images un... | Upgrade to AKS 1.25+ for Ubuntu 22.04. For 1.24, run az aks ... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 6 | Customer reports security scan finding CVE vulnerabilities in AKS node packages;... | AKS node images are rebuilt weekly with latest security patc... | 1) Inform customer AKS PG fixes CVEs within 30 days. 2) Chec... | [Y] 3.0 | [onenote: MCVKB/wiki_migration/======VM&SCIM======] |
