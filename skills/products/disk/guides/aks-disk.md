# Disk AKS Persistent Volume & Disk — 排查速查

**来源数**: 10 | **21V**: 部分适用
**最后更新**: 2026-04-07
**关键词**: afs, aks, attach, authorizationfailed, availability-zone, aznfs, azure-files, blobfuse, config-priority, containercreating

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | AKS pod with Azure Disk PV fails to start after migrating to a node in a different availability zone | LRS (Locally Redundant Storage) disk only replicates within a single AZ. When AKS scheduler moves po | 1) Use ZRS (Zone-Redundant Storage) disk instead of LRS. 2) If ZRS not feasible (cost/legacy), add nodeAffinity with top | 🟢 10 | [MCVKB] |
| 2 | AKS CSI NFS 4.1 mount with encryptInTransit=true fails in Mooncake: stunnel reports 'Rejected by CERT at depth=1: CN=Dig | AKS CSI driver uses stunnel for NFS EiT. Stunnel has its own CA store separate from system trust sto | Same cert concatenation workaround as non-AKS scenario. For AKS, can also deploy a privileged pod with stunnel manually  | 🟢 9 | [MCVKB] |
| 3 | AKS pods with Azure File Share (AFS) crash after storage account migration; DNS resolution fails after storage key expir | Linux kernel DNS resolver bug in Ubuntu-azure-5.15.0-1060 and later: after key expiry, kernel cannot | Upgrade AKS node image to AKSUbuntu-2204gen2containerd-202407.29.0+ (kernel 5.15.0-1068-azure includes fix). Check curre | 🟢 9 | [MCVKB] |
| 4 | Blobfuse config values not taking effect as expected; environment variable overrides config file settings | Blobfuse configuration priority order (highest to lowest): CLI parameter > Environment variable > Co | Check all three config sources for conflicting values. Review CLI params first, then env vars (AZURE_STORAGE_ACCOUNT, AZ | 🟢 8.5 | [MCVKB] |
| 5 | AKS pod stuck in ContainerCreating: 'Disk cannot be attached to the VM because it is not in the same zone as the VM'. Az | Default AKS storage classes for Azure disks use LRS (locally redundant storage), which deploys disks | 1) Use nodeAffinity with topology.disk.csi.azure.com/zone to pin pod to same zone as disk. 2) Use ZRS (zone-redundant st | 🟢 8.5 | [MS Learn] |
| 6 | AKS pod stuck in ContainerCreating: 'AuthorizationFailed — client does not have authorization to perform action Microsof | AKS cluster's managed identity lacks RBAC permissions on the Azure disk resource. This occurs when t | Assign Contributor role to AKS control plane identity on the disk or its resource group: az role assignment create --ass | 🔵 7.5 | [MS Learn] |
| 7 | AKS pod fails to mount disk: 'applyFSGroup failed for vol — input/output error'. Pod startup hangs or fails when mountin | Kubernetes by default recursively changes ownership and permissions (chown/chmod) for all files in a | Set fsGroupChangePolicy: 'OnRootMismatch' in the pod's securityContext. This only changes permissions if the root direct | 🔵 7.5 | [MS Learn] |
| 8 | AKS pod stuck in Pending: 'FailedScheduling — 0/N nodes are available: N node(s) exceed max volume count'. No node in th | Each Azure VM size has a maximum number of data disks it can attach. When all nodes in the cluster h | 1) Add a new node pool with a VM size that supports more disks. 2) Scale out the existing node pool to add nodes with av | 🔵 7.5 | [MS Learn] |
| 9 | Slow Azure disk attach/detach operations on AKS — takes much longer than expected when >10 operations on a single node o | The in-tree Azure disk driver (kubernetes.io/azure-disk) performs attach/detach operations sequentia | Migrate from in-tree driver to CSI driver. Check storage class provisioner — if 'kubernetes.io/azure-disk', migrate to d | 🔵 6.0 | [MS Learn] |
| 10 | AKS pod fails to mount Ultra Disk: 'StorageAccountType UltraSSD_LRS can be used only when additionalCapabilities.ultraSS | Ultra Disk support is disabled by default on AKS node pools. The VMSS backing the node pool does not | Create a new AKS node pool with Ultra Disk support enabled: az aks nodepool add --enable-ultra-ssd. Ultra Disks cannot b | 🔵 6.0 | [MS Learn] |

## 快速排查路径

1. AKS pod with Azure Disk PV fails to start after migrating to a node in a differe → 1) Use ZRS (Zone-Redundant Storage) disk instead of LRS `[来源: onenote]`
2. AKS CSI NFS 4.1 mount with encryptInTransit=true fails in Mooncake: stunnel repo → Same cert concatenation workaround as non-AKS scenario `[来源: onenote]`
3. AKS pods with Azure File Share (AFS) crash after storage account migration; DNS  → Upgrade AKS node image to AKSUbuntu-2204gen2containerd-202407 `[来源: onenote]`
4. Blobfuse config values not taking effect as expected; environment variable overr → Check all three config sources for conflicting values `[来源: onenote]`
5. AKS pod stuck in ContainerCreating: 'Disk cannot be attached to the VM because i → 1) Use nodeAffinity with topology `[来源: mslearn]`
