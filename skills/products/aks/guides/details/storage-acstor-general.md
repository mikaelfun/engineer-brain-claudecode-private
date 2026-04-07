# AKS Azure Container Storage — general -- Comprehensive Troubleshooting Guide

**Entries**: 11 | **Draft sources**: 1 | **Kusto queries**: 0
**Source drafts**: ado-wiki-recovery-of-azure-container-registry.md
**Generated**: 2026-04-07

---

## Phase 1: ACStor background scrubber detects replica checksu

### aks-309: ACStor Data Integrity Scrubber failure; log messages indicating 'volume replicas...

**Root Cause**: ACStor background scrubber detects replica checksums don't match; if out-of-sync spans all replicas (no quorum) auto-rebuild cannot proceed; may be triggered when IOs modify blocks during scrub window

**Solution**:
Bring up the application pod and let it run for several hours — scrubber auto-mitigates by partial rebuild from healthy replicas (estimate: ~8min/GB). Monitor core-agent logs for '...completed up to N segment'. If all replicas out of sync (no quorum for rebuild), use volume snapshot to recover the volume

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACStor%2FTSG%2FData%20Integrity%20Scrubber%20Failure)]`

## Phase 2: Azure Container Storage has not been deployed to M

### aks-145: Customer requests Azure Container Storage on AKS in Mooncake; feature is not ava...

**Root Cause**: Azure Container Storage has not been deployed to Mooncake (21Vianet) environment as of Nov 2024. The feature is only available in Azure public cloud regions.

**Solution**:
Inform customer Azure Container Storage is not yet available in Mooncake. Track feature landing status with AKS PG. Alternative: use Azure Disk or Azure Files CSI drivers for persistent storage.

`[Score: [B] 7.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 3: PersistentVolumes (PVCs) still exist on the Storag

### aks-433: ACStor StoragePool deletion fails with admission webhook vstoragepool.kb.io deni...

**Root Cause**: PersistentVolumes (PVCs) still exist on the StoragePool. The admission webhook blocks deletion when PVs are bound to the storage pool.

**Solution**:
List PVCs using the storage class named <namespace>-<storagepool-name> (e.g. acstor-manageddisk): kubectl get pvc -A -o wide. Delete all PVCs on that storage class: kubectl delete pvc -n <ns> <pvc1> <pvc2>... Then retry StoragePool deletion.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 5.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACStor%2FTSG%2FDiskpool%20Delete)]`

## Phase 4: One or more of the 7 required ACStor control/data 

### aks-434: ACStor disk pool deletion or de-provisioning fails even after all PVCs are delet...

**Root Cause**: One or more of the 7 required ACStor control/data plane pods not running: Capacity Provisioner, diskpool-worker, Diskpool Operator, REST API, Core Agent, ETCD (requires 3 pods for quorum), IO-Engine.

**Solution**:
Check each component pod status in acstor namespace. Scale deployments back to 2 replicas if needed (kubectl scale deployment -n acstor <name> --replicas=2). For ETCD, if fewer than 3 pods are running, perform ETCD recovery (see Etcd-Recovery TSG). For IO-Engine, ensure storage nodes have label acstor.azure.com/io-engine=acstor.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 5.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACStor%2FTSG%2FDiskpool%20Delete)]`

## Phase 5: ACStor 使用 etcd 作为元数据存储，默认运行 3 个 etcd Pod 实现高可用，至少需

### aks-435: ACStor 控制平面不可用，etcd Pod 数量低于 2 个（kubectl get pods -n acstor -l app=etcd 显示少于 2 个...

**Root Cause**: ACStor 使用 etcd 作为元数据存储，默认运行 3 个 etcd Pod 实现高可用，至少需要 2 个才能维持控制平面正常运行。etcd Pod 数量跌破 2 导致仲裁丢失。

**Solution**:
1) 若存在 etcdr Pod 且非 Running 状态，删除 etcdr Pod 等待重建（1-2分钟后 etcd Pod 恢复）；2) 若无 etcdr Pod，重启 acstor namespace 下的 etcd-operator Pod 等待 etcdr Pod 创建并恢复 etcd；3) 若仍无法恢复，联系 xcontainerstordev@microsoft / hsethuraman@microsoft.com

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 5.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACStor%2FTSG%2FEtcd%20Recovery)]`

## Phase 6: 写入失败导致 EXT4 文件系统自动重挂为只读模式，可能是瞬态问题。如果 io-engine 日志显

### aks-436: ACStor 文件系统变为只读（dmesg 显示 EXT4-fs Remounting filesystem read-only），应用写入失败

**Root Cause**: 写入失败导致 EXT4 文件系统自动重挂为只读模式，可能是瞬态问题。如果 io-engine 日志显示 bdev_uring I/O failed 则可能是数据损坏问题。

**Solution**:
1) 重启应用 Pod 并验证 IO；2) 若问题持续，将应用 Pod 迁移到其他节点；3) 若 io-engine 日志显示 bdev_uring I/O failed，参考 Data Integrity Failure TSG；4) 仍无法解决则联系 xcontainerstordev@microsoft / hsethuraman@microsoft.com

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 5.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACStor%2FTSG%2FFile%20System%20Remounted%20Read%20Only)]`

## Phase 7: The AKS nodepool managed identity is missing the C

### aks-438: ACStor azuresan-csi-driver pods not Running with error 'does not have authorizat...

**Root Cause**: The AKS nodepool managed identity is missing the Contributor RBAC role on the Azure Elastic SAN Preview subscription.

**Solution**:
Assign Contributor role to AKS nodepool managed identity on Azure Elastic SAN Preview subscription. See https://learn.microsoft.com/en-us/azure/storage/container-storage/use-container-storage-with-elastic-san#assign-contributor-role-to-aks-managed-identity-on-azure-elastic-san-preview-subscription

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 5.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACStor%2FTSG%2FInstallation%20Failures)]`

## Phase 8: Customer did not label the node pool or selected a

### aks-439: ACStor installation fails with ExtensionOperationFailed: Helm installation faile...

**Root Cause**: Customer did not label the node pool or selected a VM size that doesn't meet the minimum requirement of 4 vCPUs for ACStor.

**Solution**:
Label the node pool per https://learn.microsoft.com/en-us/azure/storage/container-storage/install-container-storage-aks?tabs=portal#label-the-node-pool and ensure VM size has at least 4 vCPUs.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 5.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACStor%2FTSG%2FInstallation%20Failures)]`

## Phase 9: Required resource providers (Microsoft.ContainerSe

### aks-440: ACStor installation fails with ExtensionOperationFailed: Microsoft.KubernetesCon...

**Root Cause**: Required resource providers (Microsoft.ContainerService, Microsoft.KubernetesConfiguration) are not registered in the subscription.

**Solution**:
Register the required resource providers: az provider register --namespace Microsoft.ContainerService --wait && az provider register --namespace Microsoft.KubernetesConfiguration --wait

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 5.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACStor%2FTSG%2FInstallation%20Failures)]`

## Phase 10: The PVC size for the restored volume from snapshot

### aks-442: ACStor volume restored from snapshot fails to mount with error 'requested volume...

**Root Cause**: The PVC size for the restored volume from snapshot must be exactly the same as the original PVC size. A larger size is not allowed.

**Solution**:
Redeploy the statefulset using a restored PVC that requests a volume size exactly matching the original PVC.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 5.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACStor%2FTSG%2FMounting%20or%20Unmounting%20PersistentVolumes%20Issues)]`

## Phase 11: The ElasticSan storageclass numsessions parameter 

### aks-443: ACStor ElasticSan storage pool experiencing throttling / poor performance

**Root Cause**: The ElasticSan storageclass numsessions parameter may be set too low (default is 32, range 1-32). Low session count limits throughput.

**Solution**:
Describe the storageclass of the ElasticSan storagepool and check parameters.numsessions value. If lower than 32, recommend increasing it to 32 for better performance.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 5.0 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACStor%2FTSG%2FPerformance%20and%20throttling%20improvement)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | ACStor Data Integrity Scrubber failure; log messages indicating 'volume replicas... | ACStor background scrubber detects replica checksums don't m... | Bring up the application pod and let it run for several hour... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACStor%2FTSG%2FData%20Integrity%20Scrubber%20Failure) |
| 2 | Customer requests Azure Container Storage on AKS in Mooncake; feature is not ava... | Azure Container Storage has not been deployed to Mooncake (2... | Inform customer Azure Container Storage is not yet available... | [B] 7.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 3 | ACStor StoragePool deletion fails with admission webhook vstoragepool.kb.io deni... | PersistentVolumes (PVCs) still exist on the StoragePool. The... | List PVCs using the storage class named <namespace>-<storage... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACStor%2FTSG%2FDiskpool%20Delete) |
| 4 | ACStor disk pool deletion or de-provisioning fails even after all PVCs are delet... | One or more of the 7 required ACStor control/data plane pods... | Check each component pod status in acstor namespace. Scale d... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACStor%2FTSG%2FDiskpool%20Delete) |
| 5 | ACStor 控制平面不可用，etcd Pod 数量低于 2 个（kubectl get pods -n acstor -l app=etcd 显示少于 2 个... | ACStor 使用 etcd 作为元数据存储，默认运行 3 个 etcd Pod 实现高可用，至少需要 2 个才能维持控... | 1) 若存在 etcdr Pod 且非 Running 状态，删除 etcdr Pod 等待重建（1-2分钟后 etcd... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACStor%2FTSG%2FEtcd%20Recovery) |
| 6 | ACStor 文件系统变为只读（dmesg 显示 EXT4-fs Remounting filesystem read-only），应用写入失败 | 写入失败导致 EXT4 文件系统自动重挂为只读模式，可能是瞬态问题。如果 io-engine 日志显示 bdev_uri... | 1) 重启应用 Pod 并验证 IO；2) 若问题持续，将应用 Pod 迁移到其他节点；3) 若 io-engine 日... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACStor%2FTSG%2FFile%20System%20Remounted%20Read%20Only) |
| 7 | ACStor azuresan-csi-driver pods not Running with error 'does not have authorizat... | The AKS nodepool managed identity is missing the Contributor... | Assign Contributor role to AKS nodepool managed identity on ... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACStor%2FTSG%2FInstallation%20Failures) |
| 8 | ACStor installation fails with ExtensionOperationFailed: Helm installation faile... | Customer did not label the node pool or selected a VM size t... | Label the node pool per https://learn.microsoft.com/en-us/az... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACStor%2FTSG%2FInstallation%20Failures) |
| 9 | ACStor installation fails with ExtensionOperationFailed: Microsoft.KubernetesCon... | Required resource providers (Microsoft.ContainerService, Mic... | Register the required resource providers: az provider regist... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACStor%2FTSG%2FInstallation%20Failures) |
| 10 | ACStor volume restored from snapshot fails to mount with error 'requested volume... | The PVC size for the restored volume from snapshot must be e... | Redeploy the statefulset using a restored PVC that requests ... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACStor%2FTSG%2FMounting%20or%20Unmounting%20PersistentVolumes%20Issues) |
| 11 | ACStor ElasticSan storage pool experiencing throttling / poor performance | The ElasticSan storageclass numsessions parameter may be set... | Describe the storageclass of the ElasticSan storagepool and ... | [B] 5.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACStor%2FTSG%2FPerformance%20and%20throttling%20improvement) |
