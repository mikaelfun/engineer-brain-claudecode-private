# AKS 节点镜像升级 — general -- Quick Reference

**Sources**: 3 | **21V**: Partial | **Entries**: 14
**Last updated**: 2026-04-06

## Symptom Quick Reference

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

## Quick Troubleshooting Path

1. Check: Scale Kyverno admission-controller to 3+ replicas with PodDisruptionBudget (minAvailable=1) `[source: onenote]`
2. Check: 1) Reimage VMSS nodes; 2) Disable unattended upgrades; 3) Purge 6 `[source: onenote]`
3. Check: 1) Identify via AppLens detector or VMSS Extensions tab `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/upgrade-node-image-general.md)
