# AKS VMSS CSE 与节点启动 — general -- Comprehensive Troubleshooting Guide

**Entries**: 8 | **Draft sources**: 0 | **Kusto queries**: 1
**Kusto references**: node-fabric-info.md
**Generated**: 2026-04-07

---

## Phase 1: AKS nodes have no direct SSH access by default; of

### aks-151: Need to SSH into AKS VMSS worker node for troubleshooting; kubectl debug method ...

**Root Cause**: AKS nodes have no direct SSH access by default; official documentation previously lacked the chroot /host step for kubectl debug method

**Solution**:
Method 1: kubectl-node-shell plugin (https://github.com/kvaps/kubectl-node-shell); Method 2 (official): `kubectl debug node/<node-id> -it --image=mcr.azk8s.cn/aks/fundamental/base-ubuntu:v0.0.11` then run `chroot /host` to access node filesystem (note: use mcr.azk8s.cn mirror for Mooncake)

`[Score: [G] 8.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 2: NVIDIA GPU drivers did not correctly install or st

### aks-582: AKS node provisioning fails with vmssCSE exit code 84 (ERR_GPU_DRIVERS_START_FAI...

**Root Cause**: NVIDIA GPU drivers did not correctly install or start. Common cause: customer did not follow GPU documentation, used wrong installation method, or node image is incompatible.

**Solution**:
1. Verify customer followed GPU documentation. 2. Check GPU driver installation method (automatic vs manual). 3. Run InspectIaaSDisk and check /var/log/nvidia-installer-xyz.log.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FCSE%20Exit%20Codes%2FvmssCSE%20failures%20during%20node%20provisioning)]`

## Phase 3: Key vault created without purge protection enabled

### aks-1307: BYOK CreateVMSSAgentPoolFailed - KeyVaultNotPurgeProtectionEnabled

**Root Cause**: Key vault created without purge protection enabled

**Solution**:
Recreate key vault with --enable-purge-protection true

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/storage/troubleshoot-common-bring-your-own-key-issues)]`

## Phase 4: Key vault and disk encryption set are in different

### aks-1308: BYOK CreateVMSSAgentPoolFailed - KeyVaultAndDiskInDifferentRegions

**Root Cause**: Key vault and disk encryption set are in different Azure regions

**Solution**:
Create key vault in same region as disk encryption set

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/storage/troubleshoot-common-bring-your-own-key-issues)]`

## Phase 5: AKS RP tracks VM SKU in its internal state databas

### aks-234: After manually resizing AKS VMSS to a different VM SKU size, the AKS resource pr...

**Root Cause**: AKS RP tracks VM SKU in its internal state database; manual VMSS resize via Azure Portal or ARM API bypasses AKS RP and causes state drift between the actual VMSS and AKS control plane records

**Solution**:
Do NOT manually resize AKS VMSS. Use AKS-supported method: 1) Create new node pool with desired VM SKU. 2) Cordon/drain old nodes. 3) Delete old node pool. TSG available for team reference

`[Score: [B] 6.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 6: Connectivity issue between AKS cluster and require

### aks-1165: AKS cluster creation fails with VMExtensionProvisioningError exit status=65 (ERR...

**Root Cause**: Connectivity issue between AKS cluster and required Azure endpoints (mcr.microsoft.com, acs-mirror.azureedge.net). Exit code 65 is a rare substitute for codes 50/51/52.

**Solution**:
Review outbound network and FQDN rules for AKS clusters. Ensure all required API services FQDNs are allowed.

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/error-code-vhdfilenotfound)]`

## Phase 7: Cluster extension agent and manager pods fail to i

### aks-1216: AKS cluster extension creation fails with 'Unable to get a response from the age...

**Root Cause**: Cluster extension agent and manager pods fail to initialize because of resource limitations, policy restrictions, or node taints (NoSchedule). Pods stuck in unready state.

**Solution**:
Run kubectl describe pod -n kube-system extension-operator-{id} to identify scheduling issues. Ensure sufficient resources, remove blocking taints, adjust policies. For ARC clusters check azure-arc namespace.

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/cluster-extension-deployment-errors)]`

## Phase 8: Common causes: insufficient CPU/memory, policy con

### aks-1219: AKS extension Helm chart install fails with 'Timed out waiting for resource read...

**Root Cause**: Common causes: insufficient CPU/memory, policy constraints or NoSchedule taints blocking pods, architecture mismatch (Linux app on Windows node), or incorrect Helm chart configuration values.

**Solution**:
Ensure sufficient cluster resources and proper node scheduling. Check namespace events for pod startup issues. Verify all Helm chart configuration values are correct and complete.

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/cluster-extension-deployment-errors)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Need to SSH into AKS VMSS worker node for troubleshooting; kubectl debug method ... | AKS nodes have no direct SSH access by default; official doc... | Method 1: kubectl-node-shell plugin (https://github.com/kvap... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | AKS node provisioning fails with vmssCSE exit code 84 (ERR_GPU_DRIVERS_START_FAI... | NVIDIA GPU drivers did not correctly install or start. Commo... | 1. Verify customer followed GPU documentation. 2. Check GPU ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FCSE%20Exit%20Codes%2FvmssCSE%20failures%20during%20node%20provisioning) |
| 3 | BYOK CreateVMSSAgentPoolFailed - KeyVaultNotPurgeProtectionEnabled | Key vault created without purge protection enabled | Recreate key vault with --enable-purge-protection true | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/storage/troubleshoot-common-bring-your-own-key-issues) |
| 4 | BYOK CreateVMSSAgentPoolFailed - KeyVaultAndDiskInDifferentRegions | Key vault and disk encryption set are in different Azure reg... | Create key vault in same region as disk encryption set | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/storage/troubleshoot-common-bring-your-own-key-issues) |
| 5 | After manually resizing AKS VMSS to a different VM SKU size, the AKS resource pr... | AKS RP tracks VM SKU in its internal state database; manual ... | Do NOT manually resize AKS VMSS. Use AKS-supported method: 1... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 6 | AKS cluster creation fails with VMExtensionProvisioningError exit status=65 (ERR... | Connectivity issue between AKS cluster and required Azure en... | Review outbound network and FQDN rules for AKS clusters. Ens... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/error-code-vhdfilenotfound) |
| 7 | AKS cluster extension creation fails with 'Unable to get a response from the age... | Cluster extension agent and manager pods fail to initialize ... | Run kubectl describe pod -n kube-system extension-operator-{... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/cluster-extension-deployment-errors) |
| 8 | AKS extension Helm chart install fails with 'Timed out waiting for resource read... | Common causes: insufficient CPU/memory, policy constraints o... | Ensure sufficient cluster resources and proper node scheduli... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/cluster-extension-deployment-errors) |
