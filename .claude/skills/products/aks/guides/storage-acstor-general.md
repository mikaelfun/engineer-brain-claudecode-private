# AKS Azure Container Storage — general -- Quick Reference

**Sources**: 2 | **21V**: Partial | **Entries**: 11
**Last updated**: 2026-04-06

## Symptom Quick Reference

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

## Quick Troubleshooting Path

1. Check: Bring up the application pod and let it run for several hours — scrubber auto-mitigates by partial r `[source: ado-wiki]`
2. Check: Inform customer Azure Container Storage is not yet available in Mooncake `[source: onenote]`
3. Check: List PVCs using the storage class named <namespace>-<storagepool-name> (e `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/storage-acstor-general.md)
