# Disk AKS Persistent Volume & Disk — 详细速查

**条目数**: 10 | **类型**: 📊 速查（无融合素材）
**生成日期**: 2026-04-07

---

### 1. AKS pod with Azure Disk PV fails to start after migrating to a node in a different availability zone

**分数**: 🟢 10 | **来源**: [MCVKB] | **置信度**: high
**21V 适用**: ✅ 是

**根因**: LRS (Locally Redundant Storage) disk only replicates within a single AZ. When AKS scheduler moves pod cross-AZ, the new node cannot access the LRS disk in the original zone.

**方案**: 1) Use ZRS (Zone-Redundant Storage) disk instead of LRS. 2) If ZRS not feasible (cost/legacy), add nodeAffinity with topology.disk.csi.azure.com/zone to pin pod to the disk's AZ. 3) Check AZ config: az aks show --query 'agentPoolProfiles[].availabilityZones'. Trade-off: node affinity breaks scheduling balance.

**标签**: AKS, LRS, ZRS, availability-zone, PV, nodeAffinity, cross-AZ

---

### 2. AKS CSI NFS 4.1 mount with encryptInTransit=true fails in Mooncake: stunnel reports 'Rejected by CER

**分数**: 🟢 9 | **来源**: [MCVKB] | **置信度**: high
**21V 适用**: ✅ 是

**根因**: AKS CSI driver uses stunnel for NFS EiT. Stunnel has its own CA store separate from system trust store, so even though openssl trusts the chain, stunnel rejects it because its CAfile only has G2 but MC uses G1 root. AKS PG (xiazhang@) indicated NFS EiT support in China is not confirmed.

**方案**: Same cert concatenation workaround as non-AKS scenario. For AKS, can also deploy a privileged pod with stunnel manually configured (K8s pod YAML with stunnel.conf mounting NFS via 127.0.0.1:20049). StorageClass needs: protocol: nfs, encryptInTransit: 'true', specify storageAccount and resourceGroup explicitly. AKS Identity needs Contributor on VNET RG and Storage Account.

**标签**: NFS, NFSv4.1, AKS, CSI, aznfs, stunnel, encryption-in-transit, DigiCert

---

### 3. AKS pods with Azure File Share (AFS) crash after storage account migration; DNS resolution fails aft

**分数**: 🟢 9 | **来源**: [MCVKB] | **置信度**: high
**21V 适用**: ✅ 是

**根因**: Linux kernel DNS resolver bug in Ubuntu-azure-5.15.0-1060 and later: after key expiry, kernel cannot reclaim expired key and perform DNS lookup, causing DNS resolution failure for AFS mount. Root cause: kernel commit 39299bdd2546 introduced the regression.

**方案**: Upgrade AKS node image to AKSUbuntu-2204gen2containerd-202407.29.0+ (kernel 5.15.0-1068-azure includes fix). Check current kernel: kubectl describe node <node-name>. Fix commit: https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=9da27fb65a14c18efd4473e2e82b76b53ba60252

**标签**: AKS, AFS, Azure-Files, DNS, kernel-bug, Ubuntu, storage-migration, mount-failure

---

### 4. Blobfuse config values not taking effect as expected; environment variable overrides config file set

**分数**: 🟢 8.5 | **来源**: [MCVKB] | **置信度**: medium
**21V 适用**: ✅ 是

**根因**: Blobfuse configuration priority order (highest to lowest): CLI parameter > Environment variable > Config file. If account name/key defined in both env var and config file, the env var value wins silently.

**方案**: Check all three config sources for conflicting values. Review CLI params first, then env vars (AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_ACCESS_KEY etc.), then config file. CSI driver comes pre-packaged with blobfuse - no manual install needed on AKS.

**标签**: blobfuse, config-priority, environment-variable, CSI, AKS

---

### 5. AKS pod stuck in ContainerCreating: 'Disk cannot be attached to the VM because it is not in the same

**分数**: 🟢 8.5 | **来源**: [MS Learn] | **置信度**: high
**21V 适用**: ✅ 是

**根因**: Default AKS storage classes for Azure disks use LRS (locally redundant storage), which deploys disks in a specific availability zone. When AKS schedules a pod to a node in a different zone than the disk, the attach operation fails with BadRequest.

**方案**: 1) Use nodeAffinity with topology.disk.csi.azure.com/zone to pin pod to same zone as disk. 2) Use ZRS (zone-redundant storage) disks: create StorageClass with Premium_ZRS or StandardSSD_ZRS — ZRS disks attach to any zone. 3) Use Azure Files (NFS/SMB) instead of Azure Disk for cross-zone access.

**标签**: AKS, availability-zone, LRS, ZRS, nodeAffinity, ContainerCreating, cross-zone

---

### 6. AKS pod stuck in ContainerCreating: 'AuthorizationFailed — client does not have authorization to per

**分数**: 🔵 7.5 | **来源**: [MS Learn] | **置信度**: high
**21V 适用**: ✅ 是

**根因**: AKS cluster's managed identity lacks RBAC permissions on the Azure disk resource. This occurs when the disk is created in a resource group other than the AKS infrastructure (MC_*) resource group.

**方案**: Assign Contributor role to AKS control plane identity on the disk or its resource group: az role assignment create --assignee <AKS-identity-ID> --role 'Contributor' --scope <disk-resource-id>. Use the control plane managed identity (not kubelet identity) for disk management.

**标签**: AKS, RBAC, AuthorizationFailed, managed-identity, Contributor, external-RG

---

### 7. AKS pod fails to mount disk: 'applyFSGroup failed for vol — input/output error'. Pod startup hangs o

**分数**: 🔵 7.5 | **来源**: [MS Learn] | **置信度**: high
**21V 适用**: ✅ 是

**根因**: Kubernetes by default recursively changes ownership and permissions (chown/chmod) for all files in a volume to match the fsGroup specified in the pod's securityContext. For volumes with many files/directories, this recursive operation takes excessive time and can trigger I/O errors or timeout.

**方案**: Set fsGroupChangePolicy: 'OnRootMismatch' in the pod's securityContext. This only changes permissions if the root directory ownership doesn't match, drastically reducing mount time. Example: spec.securityContext.fsGroupChangePolicy: 'OnRootMismatch'. Requires Kubernetes 1.20+.

**标签**: AKS, fsGroup, fsGroupChangePolicy, OnRootMismatch, mount-timeout, securityContext, permissions

---

### 8. AKS pod stuck in Pending: 'FailedScheduling — 0/N nodes are available: N node(s) exceed max volume c

**分数**: 🔵 7.5 | **来源**: [MS Learn] | **置信度**: high
**21V 适用**: ✅ 是

**根因**: Each Azure VM size has a maximum number of data disks it can attach. When all nodes in the cluster have reached their disk attachment limit, new pods requiring Azure disk PVs cannot be scheduled. The limit depends on VM size (e.g., Standard_D2s_v3 supports max 4 data disks).

**方案**: 1) Add a new node pool with a VM size that supports more disks. 2) Scale out the existing node pool to add nodes with available disk capacity. 3) Delete unused PVCs/disks from existing nodes. 4) Check Kubernetes default volume limits per node and ensure disk count doesn't exceed them.

**标签**: AKS, max-volume-count, FailedScheduling, disk-limit, VM-size, scale, node-pool

---

### 9. Slow Azure disk attach/detach operations on AKS — takes much longer than expected when >10 operation

**分数**: 🔵 6.0 | **来源**: [MS Learn] | **置信度**: high
**21V 适用**: ❌ 否

**根因**: The in-tree Azure disk driver (kubernetes.io/azure-disk) performs attach/detach operations sequentially, not in parallel. Deprecated since AKS 1.21.

**方案**: Migrate from in-tree driver to CSI driver. Check storage class provisioner — if 'kubernetes.io/azure-disk', migrate to disk.csi.azure.com. See docs: csi-migrate-in-tree-volumes.

**标签**: AKS, attach, detach, slow, CSI, in-tree-driver, kubernetes

---

### 10. AKS pod fails to mount Ultra Disk: 'StorageAccountType UltraSSD_LRS can be used only when additional

**分数**: 🔵 6.0 | **来源**: [MS Learn] | **置信度**: high
**21V 适用**: ❌ 否

**根因**: Ultra Disk support is disabled by default on AKS node pools. The VMSS backing the node pool does not have additionalCapabilities.ultraSSDEnabled set, so attaching an Ultra Disk PV fails with InvalidParameter.

**方案**: Create a new AKS node pool with Ultra Disk support enabled: az aks nodepool add --enable-ultra-ssd. Ultra Disks cannot be enabled on existing node pools — a new node pool must be created. Schedule pods using Ultra Disk PVs to the Ultra Disk-enabled node pool via nodeSelector or nodeAffinity.

**标签**: AKS, Ultra-Disk, UltraSSD_LRS, ultraSSDEnabled, node-pool, VMSS

---

