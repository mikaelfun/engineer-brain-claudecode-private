# AKS 节点镜像升级 — general -- Comprehensive Troubleshooting Guide

**Entries**: 14 | **Draft sources**: 0 | **Kusto queries**: 5
**Kusto references**: auto-upgrade.md, image-integrity.md, node-fabric-info.md, remediator-events.md, scale-upgrade-operations.md
**Generated**: 2026-04-07

---

## Phase 1: Kyverno admission-controller has single replica an

### aks-073: AKS node upgrade blocked by MutatingWebhook (e.g. Kyverno) with failurePolicy=Fa...

**Root Cause**: Kyverno admission-controller has single replica and gets evicted during node cordon/drain in upgrade. failurePolicy=Fail causes all pod CREATE/UPDATE in user namespaces to be rejected until Kyverno recovers.

**Solution**:
Scale Kyverno admission-controller to 3+ replicas with PodDisruptionBudget (minAvailable=1). Alternative: change failurePolicy to Ignore (mutation skipped during upgrade), or use namespaceSelector to reduce blast radius.

`[Score: [G] 8.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 2: Ubuntu unattended upgrade from kernel 5.15.0-1042-

### aks-103: AKS nodes Unschedulable, pods Unknown with Failed to create pod sandbox Transpar...

**Root Cause**: Ubuntu unattended upgrade from kernel 5.15.0-1042-azure to 6.2.0-1009-azure introduced breaking change in network plugin

**Solution**:
1) Reimage VMSS nodes; 2) Disable unattended upgrades; 3) Purge 6.2 kernel; 4) AKS Remediator auto-detects and reimages; 5) Use nodeImage auto-upgrade channel.

`[Score: [G] 8.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 3: Custom VM extensions manually installed at VMSS le

### aks-766: AKS nodepool operations (scale/upgrade/reconcile) fail with VMExtensionHandlerNo...

**Root Cause**: Custom VM extensions manually installed at VMSS level outside AKS control. AKS manages VMSS lifecycle and cannot validate/maintain custom extensions, causing non-retriable reconcile failures.

**Solution**:
1) Identify via AppLens detector or VMSS Extensions tab. 2) Remove extensions from VMSS (Portal/CLI/ARM). 3) Retry or reconcile. 4) If impossible, recreate nodepool. Never manually install VM extensions on AKS VMSS.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FUnsupportedVMExtensions)]`

## Phase 4: vCPU quotas are arranged in two tiers per subscrip

### aks-957: AKS node scaling, creation, or upgrade fails due to vCPU quota exceeded; operati...

**Root Cause**: vCPU quotas are arranged in two tiers per subscription per region: Total Regional vCPUs and VM size family cores. When node creation would exceed either quota, VMSS deployment is blocked.

**Solution**:
1) Customer submits direct quota request (many standard VM family increases auto-approved); 2) Check Usage + quotas in Azure portal; 3) For large/high-demand VMs, manual review required; 4) Transfer to SAP: Azure > Subscription management > Compute-VM (cores-vCPUs); 5) Include: Subscription ID, Region, SKU Size, Restriction Type, cores requested. Do NOT transfer to VM/VMSS team.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FNode%20scaling%20fails%20due%20to%20allocation%20or%20capacity%20issues)]`

## Phase 5: During node image upgrade, the node is deleted fro

### aks-179: Node labels added using kubectl label are removed/lost after AKS node image upgr...

**Root Cause**: During node image upgrade, the node is deleted from the API server and reimaged with the same node name. When the node is deleted from API server, its data (including custom labels) in etcd is cleaned. The new node registers without the custom labels.

**Solution**:
Use AKS-managed node pool labels (--labels parameter in az aks nodepool add/update) instead of kubectl label. AKS-managed labels persist across node image upgrades. Behavior confirmed since AKS release 2024-04-28.

`[Score: [B] 7.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 6: Mooncake AKS GPU doc (docs.azure.cn/en-us/aks/gpu-

### aks-031: AKS GPU node pods fail to pull NVIDIA device plugin image mcr.azk8s.cn/oss/nvidi...

**Root Cause**: Mooncake AKS GPU doc (docs.azure.cn/en-us/aks/gpu-cluster) has a bug: 'Install GPU plugin' section is duplicated with 'Add the NVIDIA device plugin' and its image reference is not downloadable. Also, CUDA driver is pre-installed on AKS GPU node VHDs — the manual driver installation steps from VM GPU docs do NOT apply to AKS nodes.

**Solution**:
1) CUDA driver is pre-installed on AKS GPU nodes — skip manual driver installation. 2) Correct NVIDIA device plugin image: mcr.azk8s.cn/oss/nvidia/k8s-device-plugin:1.11. 3) Add GPU nodepool: az aks nodepool add --node-vm-size standard_nc6s_v3 --node-taints sku=gpu:NoSchedule. 4) Supported China GPU SKUs (NCv3 only): standard_nc6s_v3, nc12s_v3, nc24s_v3, nc24rs_v3. 5) China supports CUDA only (not GRID driver). Ref: https://docs.azure.cn/en-us/aks/gpu-cluster

`[Score: [B] 6.5 | Source: [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.3]]`

## Phase 7: AKS node pool snapshot feature was GA in public Az

### aks-113: AKS node pool snapshot creation or usage fails in Mooncake; az aks nodepool snap...

**Root Cause**: AKS node pool snapshot feature was GA in public Azure but not yet fully available in Mooncake at the time (2022-05). Feature availability in sovereign clouds lags behind public cloud.

**Solution**:
1) Check AKS feature availability for Mooncake before using preview/new features. 2) Use FrontEndQoSEvents Kusto query to examine operation error details. 3) Alternative: manually specify --kubernetes-version during node pool creation to control version. 4) Once feature is GA in MC, ensure snapshot and target are in same location.

`[Score: [B] 6.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 8: Kubelet image GC threshold is 85% by default. With

### aks-261: AKS node disk space pressure due to cached container images with containerd runt...

**Root Cause**: Kubelet image GC threshold is 85% by default. With containerd runtime, Docker CLI commands are not available for image cleanup

**Solution**:
Use `crictl rmi --prune` to remove unused images on containerd nodes. Alternatively, adjust kubelet image GC threshold via CustomNodeConfigPreview feature to lower the threshold and trigger earlier cleanup

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 6.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 9: VM extensions failed to provision on the node duri

### aks-1093: Node auto-repair fails with VMExtensionProvisioningError during reboot/reimage/r...

**Root Cause**: VM extensions failed to provision on the node during auto-repair process

**Solution**:
Check VM extension error details in Azure portal: Resource groups → cluster RG → node → Extensions. See error code ERR_VHD_FILE_NOT_FOUND (124) for common cases. If persistent, contact Azure support

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/availability-performance/node-auto-repair-errors)]`

## Phase 10: Remediator has three distinct repair actions: rebo

### aks-021: AKS node auto-repair (Remediator) triggers unexpected reimage or redeploy on nod...

**Root Cause**: Remediator has three distinct repair actions: reboot=restart on same physical host; reimage=replace VHD, VMSS container ID unchanged; redeploy=move to different physical host. Customers often confuse these.

**Solution**:
1) Query RemediatorEvent in AKSprod Kusto: cluster(akscn.kusto.chinacloudapi.cn).database(AKSprod).RemediatorEvent | where ccpNamespace contains <cluster-namespace-id>. 2) Check reason and msg fields. 3) kubectl describe node for health conditions. 4) Frequent remediations: investigate disk/memory/kubelet issues. Ref: https://docs.microsoft.com/en-us/azure/aks/node-auto-repair

`[Score: [B] 5.5 | Source: [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.2]]`

## Phase 11: When orchestrator version tag does not exist or is

### aks-230: AKS VMSS and VM instances show different image versions (e.g. VMSS model sku 202...

**Root Cause**: When orchestrator version tag does not exist or is nil on older VMSS, AKS reconciler detects model mismatch and attempts to update VMSS model, triggering unplanned node image updates

**Solution**:
Monitor VMSS model vs instance image versions; for older clusters without tags, reconciliation may trigger updates during upgrade or node operations. Newer AKS versions properly set orchestrator version tags

`[Score: [B] 5.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 12: Linux kernel BPF JIT memory limit (net.core.bpf_ji

### aks-856: Pods stuck in pending state with kubelet error: 'unable to init seccomp: error l...

**Root Cause**: Linux kernel BPF JIT memory limit (net.core.bpf_jit_limit) is exhausted. Each container's seccomp filter consumes BPF JIT memory. When many containers run on a node, the default limit is insufficient, causing new containers to fail seccomp filter loading.

**Solution**:
1) Increase BPF JIT limit: 'sysctl net.core.bpf_jit_limit=452534528' on affected nodes. 2) For persistent fix, apply via DaemonSet or node configuration to set sysctl at boot. 3) Upgrade to newer node image with kernel fix if available.

`[Score: [Y] 4.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FOthers%2FError%20loading%20seccomp%20filter%20bpfjitlimit)]`

## Phase 13: By design, node image upgrade only updates image v

### aks-1169: Windows Server node pools not upgraded from Gen1 to Gen2 VMs during AKS node ima...

**Root Cause**: By design, node image upgrade only updates image version, not VM generation. Creating Windows2022 node pool without Gen2-compatible VM size also results in Gen1.

**Solution**:
Create new Windows Server node pool with Gen2 VM size (--node-vm-size). For K8s <1.25, also set --os-sku Windows2022. Verify Gen2 support with az vm list-sizes.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [Y] 4.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/nodepools-not-upgraded-to-gen2-during-node-image-upgrade)]`

## Phase 14: AKS retired GPU VHD preview. It only supported Ubu

### aks-1081: Creating AKS node pool with GPU VHD (preview) after Jan 2025 fails: AKS no longe...

**Root Cause**: AKS retired GPU VHD preview. It only supported Ubuntu 18.04 (unsupported since May 2023), did not work with Cilium/Calico in k8s 1.29+, and never reached GA.

**Solution**:
Create GPU-enabled node pools using supported methods per https://learn.microsoft.com/azure/aks/gpu-cluster. Migrate workloads from GPU VHD pools to new pools. Cannot update existing pool to disable GPU VHD.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [W] 2.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/GPU%20Nodes)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS node upgrade blocked by MutatingWebhook (e.g. Kyverno) with failurePolicy=Fa... | Kyverno admission-controller has single replica and gets evi... | Scale Kyverno admission-controller to 3+ replicas with PodDi... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | AKS nodes Unschedulable, pods Unknown with Failed to create pod sandbox Transpar... | Ubuntu unattended upgrade from kernel 5.15.0-1042-azure to 6... | 1) Reimage VMSS nodes; 2) Disable unattended upgrades; 3) Pu... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 3 | AKS nodepool operations (scale/upgrade/reconcile) fail with VMExtensionHandlerNo... | Custom VM extensions manually installed at VMSS level outsid... | 1) Identify via AppLens detector or VMSS Extensions tab. 2) ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FUnsupportedVMExtensions) |
| 4 | AKS node scaling, creation, or upgrade fails due to vCPU quota exceeded; operati... | vCPU quotas are arranged in two tiers per subscription per r... | 1) Customer submits direct quota request (many standard VM f... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FNode%20scaling%20fails%20due%20to%20allocation%20or%20capacity%20issues) |
| 5 | Node labels added using kubectl label are removed/lost after AKS node image upgr... | During node image upgrade, the node is deleted from the API ... | Use AKS-managed node pool labels (--labels parameter in az a... | [B] 7.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 6 | AKS GPU node pods fail to pull NVIDIA device plugin image mcr.azk8s.cn/oss/nvidi... | Mooncake AKS GPU doc (docs.azure.cn/en-us/aks/gpu-cluster) h... | 1) CUDA driver is pre-installed on AKS GPU nodes — skip manu... | [B] 6.5 | [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.3] |
| 7 | AKS node pool snapshot creation or usage fails in Mooncake; az aks nodepool snap... | AKS node pool snapshot feature was GA in public Azure but no... | 1) Check AKS feature availability for Mooncake before using ... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 8 | AKS node disk space pressure due to cached container images with containerd runt... | Kubelet image GC threshold is 85% by default. With container... | Use `crictl rmi --prune` to remove unused images on containe... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 9 | Node auto-repair fails with VMExtensionProvisioningError during reboot/reimage/r... | VM extensions failed to provision on the node during auto-re... | Check VM extension error details in Azure portal: Resource g... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/availability-performance/node-auto-repair-errors) |
| 10 | AKS node auto-repair (Remediator) triggers unexpected reimage or redeploy on nod... | Remediator has three distinct repair actions: reboot=restart... | 1) Query RemediatorEvent in AKSprod Kusto: cluster(akscn.kus... | [B] 5.5 | [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.2] |
| 11 | AKS VMSS and VM instances show different image versions (e.g. VMSS model sku 202... | When orchestrator version tag does not exist or is nil on ol... | Monitor VMSS model vs instance image versions; for older clu... | [B] 5.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 12 | Pods stuck in pending state with kubelet error: 'unable to init seccomp: error l... | Linux kernel BPF JIT memory limit (net.core.bpf_jit_limit) i... | 1) Increase BPF JIT limit: 'sysctl net.core.bpf_jit_limit=45... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FOthers%2FError%20loading%20seccomp%20filter%20bpfjitlimit) |
| 13 | Windows Server node pools not upgraded from Gen1 to Gen2 VMs during AKS node ima... | By design, node image upgrade only updates image version, no... | Create new Windows Server node pool with Gen2 VM size (--nod... | [Y] 4.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/nodepools-not-upgraded-to-gen2-during-node-image-upgrade) |
| 14 | Creating AKS node pool with GPU VHD (preview) after Jan 2025 fails: AKS no longe... | AKS retired GPU VHD preview. It only supported Ubuntu 18.04 ... | Create GPU-enabled node pools using supported methods per ht... | [W] 2.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/GPU%20Nodes) |
