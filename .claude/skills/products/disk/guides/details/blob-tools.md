# Disk Blob Storage & Transfer Tools — 综合排查指南

**条目数**: 5 | **草稿融合数**: 5 | **Kusto 查询融合**: 0
**来源草稿**: onenote-azcopy-support-reference.md, onenote-blob-capacity-calculation.md, onenote-blobfuse-logging.md, onenote-blobfuse2-csi-setup.md, onenote-blobfuse2-static-mount-msi.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Azcopy Support Reference & Performance Considerations
> 来源: OneNote (onenote-azcopy-support-reference.md)

1. | Scope | Doc Link | Notes |
2. |-------|----------|-------|
3. | Tool reference | [azcopy CLI](https://learn.microsoft.com/en-us/azure/storage/common/storage-ref-azcopy) | Per-command options differ |
4. | Azure Blob copy | [Copy/move data with AzCopy v10](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azcopy-v10) | upload, download, sync, AWS-Azure |
5. | Azure Files | [Transfer data to Azure Files](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azcopy-files) | Azure Files migration recommends Robocopy over azcopy |
6. | Migration tools comparison | [Azure Storage migration tools](https://learn.microsoft.com/en-us/azure/storage/solution-integration/validated-partners/data-management/migration-tools-comparison) | - |
7. | File Share Migration | [Migrate to Azure file shares](https://learn.microsoft.com/en-us/azure/storage/files/storage-files-migration-overview) | Robocopy outperforms azcopy for many small files |
8. | Network restrictions | [Copy blobs with access restriction](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-storage/copy-blobs-between-storage-accounts-network-restriction) | - |
9. | Performance tuning | [Optimize AzCopy v10](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azcopy-optimize) | Server-to-server: increase concurrency; sync: memory-intensive |
10. | Source code | [GitHub azure-storage-azcopy](https://github.com/Azure/azure-storage-azcopy) | - |

### Phase 2: Azure Blob Capacity Calculation Methods
> 来源: OneNote (onenote-blob-capacity-calculation.md)

1. - Storage Browser data comes from metrics
2. - Container count may be inaccurate (known bug, ICM filed)
3. - Blob count includes system containers ($logs, $blobchangefeed, etc.)
4. - Manual per-container statistics
5. - Can enumerate system containers ($log etc.)
6. - Shows: Active blobs (base), Snapshots (excl. deleted), Versions (excl. deleted), Deleted blobs (includes deleted versions/snapshots/blobs)
7. - Enumerates all containers automatically, minimum cycle = 1 day
8. - Capacity sum may exceed Portal if soft delete / versioning enabled
9. - Paid feature (low cost)
10. - Cannot enumerate system containers ($log) or deleted containers

### Phase 3: Blobfuse Detailed Logging on AKS
> 来源: OneNote (onenote-blobfuse-logging.md)

1. Set `--log-level` in PV mountOptions:
2. - --file-cache-timeout-in-seconds=120
3. - --use-attr-cache=true
4. - --cancel-list-on-mount-seconds=10  # prevent billing charges on mounting
5. - -o attr_timeout=120
6. - -o entry_timeout=120
7. - -o negative_timeout=120
8. - --log-level=LOG_WARNING  # LOG_WARNING, LOG_INFO, LOG_DEBUG
9. - --cache-size-mb=1000  # Default will be 80% of available memory
10. | LOG_WARNING | Production default |

### Phase 4: Blobfuse2 CSI Driver Setup on AKS
> 来源: OneNote (onenote-blobfuse2-csi-setup.md)

1. 1. **Enable CSI driver on AKS cluster**
2. az aks update --enable-blob-driver --resource-group <rg> --name <aks>
3. 2. **Create storage account secret**
4. kubectl create secret generic azure-secret \
5. --from-literal=azurestorageaccountname=<account> \
6. --from-literal=azurestorageaccountkey=<key>
7. 3. **Define StorageClass** (key: `protocol: fuse2`)
8. apiVersion: storage.k8s.io/v1
9. provisioner: blob.csi.azure.com
10. skuName: Standard_LRS

### Phase 5: Blobfuse2 Static Mount with Managed Identity on AKS
> 来源: OneNote (onenote-blobfuse2-static-mount-msi.md)

1. 1. Identity = kubelet identity of AKS cluster (named `xxx-agentpool`)
2. 2. **Static mount**: `Storage Blob Data Contributor` on storage account
3. 3. **Dynamic mount**: `Storage Blob Data Contributor` on resource group
4. apiVersion: storage.k8s.io/v1
5. provisioner: blob.csi.azure.com
6. AzureStorageAuthType: MSI
7. AzureStorageIdentityClientID: "<kubelet-identity-client-id>"
8. reclaimPolicy: Delete
9. volumeBindingMode: Immediate
10. allowVolumeExpansion: true

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Blobfuse volume mounted in Prometheus pod shows incorrect size matching temp disk instead of storage account capacity, v | Blobfuse volume size equals the node temp disk cache size, not the requested PVC capacity or storage | Do not use blobfuse with write-heavy workloads like Prometheus. Use Azure Disk or Azure Files instead. If blobfuse is re | 🟢 9 | [MCVKB] |
| 2 | Blobfuse2 rm -rf command fails on mounted Azure Blob storage container - recursive deletion not supported | Blobfuse2 is a FUSE driver that maps file operations to REST API calls. It does not support recursiv | 1) Upgrade storage account to enable HNS (Data Lake Storage Gen2). 2) Mount blobfuse2 with --use-adls=true flag. Workaro | 🟢 9 | [MCVKB] |
| 3 | Azcopy fails with 'x509: certificate signed by unknown authority' when copying blobs through proxy server | Server running azcopy is missing DigiCert Global Root CA in its certificate store. Browser can toler | Install the DigiCert Global Root CA on the server. Export from a working machine and import to the affected server. Also | 🟢 9 | [MCVKB] |
| 4 | Blob upload via Java SDK intermittently fails with AuthenticationFailed (403) | Client system clock drift >15min tolerance, or high CPU/network causing signed request to take >15mi | 1. Sync client clock with NTP. 2. Check client CPU/network. 3. Update SDK. 4. Enable Storage Diagnostics Settings. 5. En | 🟢 8.5 | [MCVKB] |
| 5 | Blob Lifecycle Management policy rule does not execute - blobs under certain prefixes not deleted | Missing configuration on Storage clusters processing the account. Platform-side bug on specific clus | Check Jarvis: ETWEventOLCMScannerStatesTable, ETWEventOLCMAccountPolicyExecutionStatsTable. Check ASC for policy/operati | 🟢 8.5 | [MCVKB] |
