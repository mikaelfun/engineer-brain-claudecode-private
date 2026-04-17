# AKS Blob CSI / BlobFuse — blobfuse -- Comprehensive Troubleshooting Guide

**Entries**: 9 | **Draft sources**: 2 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-aci-automate-sync-ip-appgw-backend-pool.md, onenote-blobfuse2-csi-setup.md
**Generated**: 2026-04-07

---

## Phase 1: Blobfuse volume reported size is determined by the

### aks-158: Blobfuse CSI volume mounted in Prometheus pod shows incorrect volume size (e.g. ...

**Root Cause**: Blobfuse volume reported size is determined by the local cache/temp disk size on the AKS node, not the YAML spec or storage account capacity. Files with open file handles (like Prometheus WAL/TSDB) are cached on the temp disk and consume real disk space, while files without handles (uploaded via portal or dd) show 0 bytes in du output

**Solution**:
Do not use blobfuse CSI volumes for workloads that keep persistent file handles (e.g. Prometheus TSDB). Use Azure Disk or Azure Files instead. If blobfuse is required, increase node temp disk size or configure --cache-size-mb mount option to limit cache usage. Track: github.com/kubernetes-sigs/blob-csi-driver/issues/862

`[Score: [G] 8.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 2: BlobFuse 使用 FUSE kernel cache，各 Pod 的文件系统缓存独立，修改不会

### aks-486: 两个 Pod 挂载同一个 Blob PV（blob-fuse-premium StorageClass）后，Pod 1 修改文件内容但 Pod 2 看不到更新，...

**Root Cause**: BlobFuse 使用 FUSE kernel cache，各 Pod 的文件系统缓存独立，修改不会自动传播到其他 Pod 的内核缓存

**Solution**:
方案一：在 PV mountOptions 添加 "-o direct_io" 绕过内核缓存（会增加 API 调用量和成本）。方案二：确认节点 blobfuse2 版本 ≥ 2.5.0（node image ≥ 202507.21.0），然后设置 mountOptions: --file-cache-timeout-in-seconds=120 --attr-cache-timeout=100 --disable-kernel-cache，每 120 秒清除 blob 缓存实现跨 Pod 同步。

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FBlob%20sync%20issue%20between%20pods)]`

## Phase 3: AKS node image contains outdated blobfuse driver t

### aks-528: Customer received email notice requesting to upgrade Azure Blob Storage blobfuse...

**Root Cause**: AKS node image contains outdated blobfuse driver that needs updating

**Solution**:
1. Check current node OS image version. 2. Use az aks nodepool upgrade to upgrade node image to latest version containing required blobfuse driver. 3. Verify latest VHD release notes at AKS GitHub for driver versions. 4. Enable automatic node OS image upgrades for future updates.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FStorage%2FBlob%20Fuse%20Upgrade%20Notice)]`

## Phase 4: Creating PV/PVCs within pods using AML services on

### aks-821: Azure Machine Learning endpoint deployment on AKS fails with pods stuck in init ...

**Root Cause**: Creating PV/PVCs within pods using AML services on AKS is not a supported scenario. AML default blobfuse mount path configuration leads to PVC mount failures.

**Solution**:
1) Create ConfigMap azuremlaksconfig in default namespace with disableHostPathMount: true annotation. 2) Redeploy the AML model with blobfuse_enabled=False to prevent PV/PVC creation. 3) Verify pods transition to running state after redeployment.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FStorage%2FSupport%20for%20PV%20and%20PVC%20on%20AML%20workloads)]`

## Phase 5: Blobfuse (< 1.3.1) uses up to 80% of available hos

### aks-891: Blobfuse process OOM killed by Linux kernel when mounting blob storage volumes. ...

**Root Cause**: Blobfuse (< 1.3.1) uses up to 80% of available host memory for caching. As files increase in blob storage, cache grows until hitting the limit, triggering OOM killer.

**Solution**:
Upgrade blobfuse to >= 1.3.1 (Ubuntu 18.04/22.04 already updated). Set cache-size-mb mount option: mountOptions: ['cache-size-mb=3000']. Or deploy DaemonSet to update blobfuse on all nodes.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Storage/Blob%20CSI%20Driver%20OOM%20issues%20when%20mounting%20volumes)]`

## Phase 6: HNS-enabled accounts use ADLS Gen2. Blobfuse defau

### aks-046: Pod using blobfuse to mount HNS-enabled storage account can create folders but c...

**Root Cause**: HNS-enabled accounts use ADLS Gen2. Blobfuse defaults to Blob API (DeleteBlob) which does not support directory ops on HNS accounts. DFS API (DeleteDirectory) must be used.

**Solution**:
Add mountOption --use-adls=true in PV spec. Verify fix: storage logs show DeleteDirectory Success 200 via dfs.core.chinacloudapi.cn. Ref: github.com/kubernetes-sigs/blob-csi-driver/blob/master/docs/driver-parameters.md

`[Score: [B] 6.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 7: Blob container referenced by PV/PVC does not exist

### aks-1302: BlobFuse mount fails errno=404 - Unable to start blobfuse

**Root Cause**: Blob container referenced by PV/PVC does not exist

**Solution**:
Verify blob container exists in storage account; ensure PV references correct container name

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/storage/mounting-azure-blob-storage-container-fail)]`

## Phase 8: Kubernetes secret has wrong storage key (key rotat

### aks-1303: BlobFuse mount fails errno=403 - authentication or connectivity issues

**Root Cause**: Kubernetes secret has wrong storage key (key rotation) or AKS VNET not whitelisted on storage account

**Solution**:
Verify/update Kubernetes secret key; add AKS VNET to storage account networking

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/storage/mounting-azure-blob-storage-container-fail)]`

## Phase 9: In sovereign clouds, the correct environment varia

### aks-064: Blobfuse FlexVolume mount fails in Mooncake/sovereign cloud with error 'Failed t...

**Root Cause**: In sovereign clouds, the correct environment variable for blobfuse FlexVolume is AZURE_STORAGE_BLOB_ENDPOINT (introduced in v1.0.12). In v1.0.11 it was AZURE_BLOB_ENDPOINT. Old blobfuse-flexvol-installer uses the wrong env var name, causing the blobfuse binary to fail connecting to the chinacloudapi.cn blob endpoint.

**Solution**:
1) SSH to worker node and check /var/log/blobfuse-driver.log for the exact blobfuse command and env vars. 2) Manually test: export AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_ACCESS_KEY, and AZURE_STORAGE_BLOB_ENDPOINT (not BLOBENDPOINT). 3) Delete old blobfuse-flexvol-installer daemonset. 4) Apply latest installer: kubectl apply -f https://raw.githubusercontent.com/Azure/kubernetes-volume-drivers/master/flexvolume/blobfuse/deployment/blobfuse-flexvol-installer-1.9.yaml. 5) Long-term: migrate from deprecated FlexVolume to blobfuse CSI driver. 6) To verify secrets: kubectl get pv -o yaml to find secretRef, then kubectl get secret -o yaml and base64 decode to verify credentials.

`[Score: [B] 6.0 | Source: [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.9]]`

---

## Known Issues Quick Reference

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
