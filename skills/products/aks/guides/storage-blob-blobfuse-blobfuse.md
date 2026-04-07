# AKS Blob CSI / BlobFuse — blobfuse -- Quick Reference

**Sources**: 3 | **21V**: All | **Entries**: 9
**Last updated**: 2026-04-07

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Blobfuse CSI volume mounted in Prometheus pod shows incorrect volume size (e.g. ... | Blobfuse volume reported size is determined by the local cac... | Do not use blobfuse CSI volumes for workloads that keep pers... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | 两个 Pod 挂载同一个 Blob PV（blob-fuse-premium StorageClass）后，Pod 1 修改文件内容但 Pod 2 看不到更新，... | BlobFuse 使用 FUSE kernel cache，各 Pod 的文件系统缓存独立，修改不会自动传播到其他 Po... | 方案一：在 PV mountOptions 添加 "-o direct_io" 绕过内核缓存（会增加 API 调用量和成... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FBlob%20sync%20issue%20between%20pods) |
| 3 | Customer received email notice requesting to upgrade Azure Blob Storage blobfuse... | AKS node image contains outdated blobfuse driver that needs ... | 1. Check current node OS image version. 2. Use az aks nodepo... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FStorage%2FBlob%20Fuse%20Upgrade%20Notice) |
| 4 | Azure Machine Learning endpoint deployment on AKS fails with pods stuck in init ... | Creating PV/PVCs within pods using AML services on AKS is no... | 1) Create ConfigMap azuremlaksconfig in default namespace wi... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FStorage%2FSupport%20for%20PV%20and%20PVC%20on%20AML%20workloads) |
| 5 | Blobfuse process OOM killed by Linux kernel when mounting blob storage volumes. ... | Blobfuse (< 1.3.1) uses up to 80% of available host memory f... | Upgrade blobfuse to >= 1.3.1 (Ubuntu 18.04/22.04 already upd... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Storage/Blob%20CSI%20Driver%20OOM%20issues%20when%20mounting%20volumes) |
| 6 | Pod using blobfuse to mount HNS-enabled storage account can create folders but c... | HNS-enabled accounts use ADLS Gen2. Blobfuse defaults to Blo... | Add mountOption --use-adls=true in PV spec. Verify fix: stor... | [B] 6.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 7 | BlobFuse mount fails errno=404 - Unable to start blobfuse | Blob container referenced by PV/PVC does not exist | Verify blob container exists in storage account; ensure PV r... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/storage/mounting-azure-blob-storage-container-fail) |
| 8 | BlobFuse mount fails errno=403 - authentication or connectivity issues | Kubernetes secret has wrong storage key (key rotation) or AK... | Verify/update Kubernetes secret key; add AKS VNET to storage... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/storage/mounting-azure-blob-storage-container-fail) |
| 9 | Blobfuse FlexVolume mount fails in Mooncake/sovereign cloud with error 'Failed t... | In sovereign clouds, the correct environment variable for bl... | 1) SSH to worker node and check /var/log/blobfuse-driver.log... | [B] 6.0 | [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.9] |

## Quick Troubleshooting Path

1. Check: Do not use blobfuse CSI volumes for workloads that keep persistent file handles (e `[source: onenote]`
2. Check: 方案一：在 PV mountOptions 添加 "-o direct_io" 绕过内核缓存（会增加 API 调用量和成本）。方案二：确认节点 blobfuse2 版本 ≥ 2 `[source: ado-wiki]`
3. Check: 1 `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/storage-blob-blobfuse-blobfuse.md)
