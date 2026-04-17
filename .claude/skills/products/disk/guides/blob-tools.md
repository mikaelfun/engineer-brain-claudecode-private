# Disk Blob Storage & Transfer Tools — 排查速查

**来源数**: 5 | **21V**: 全部适用
**最后更新**: 2026-04-07
**关键词**: 403, adls, aks, authenticationfailed, azcopy, blob, blobfuse, blobfuse2, cache, certificate

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | Blobfuse volume mounted in Prometheus pod shows incorrect size matching temp disk instead of storage account capacity, v | Blobfuse volume size equals the node temp disk cache size, not the requested PVC capacity or storage | Do not use blobfuse with write-heavy workloads like Prometheus. Use Azure Disk or Azure Files instead. If blobfuse is re | 🟢 9 | [MCVKB] |
| 2 📋 | Blobfuse2 rm -rf command fails on mounted Azure Blob storage container - recursive deletion not supported | Blobfuse2 is a FUSE driver that maps file operations to REST API calls. It does not support recursiv | 1) Upgrade storage account to enable HNS (Data Lake Storage Gen2). 2) Mount blobfuse2 with --use-adls=true flag. Workaro | 🟢 9 | [MCVKB] |
| 3 📋 | Azcopy fails with 'x509: certificate signed by unknown authority' when copying blobs through proxy server | Server running azcopy is missing DigiCert Global Root CA in its certificate store. Browser can toler | Install the DigiCert Global Root CA on the server. Export from a working machine and import to the affected server. Also | 🟢 9 | [MCVKB] |
| 4 📋 | Blob upload via Java SDK intermittently fails with AuthenticationFailed (403) | Client system clock drift >15min tolerance, or high CPU/network causing signed request to take >15mi | 1. Sync client clock with NTP. 2. Check client CPU/network. 3. Update SDK. 4. Enable Storage Diagnostics Settings. 5. En | 🟢 8.5 | [MCVKB] |
| 5 📋 | Blob Lifecycle Management policy rule does not execute - blobs under certain prefixes not deleted | Missing configuration on Storage clusters processing the account. Platform-side bug on specific clus | Check Jarvis: ETWEventOLCMScannerStatesTable, ETWEventOLCMAccountPolicyExecutionStatsTable. Check ASC for policy/operati | 🟢 8.5 | [MCVKB] |

## 快速排查路径

1. Blobfuse volume mounted in Prometheus pod shows incorrect size matching temp dis → Do not use blobfuse with write-heavy workloads like Prometheus `[来源: onenote]`
2. Blobfuse2 rm -rf command fails on mounted Azure Blob storage container - recursi → 1) Upgrade storage account to enable HNS (Data Lake Storage Gen2) `[来源: onenote]`
3. Azcopy fails with 'x509: certificate signed by unknown authority' when copying b → Install the DigiCert Global Root CA on the server `[来源: onenote]`
4. Blob upload via Java SDK intermittently fails with AuthenticationFailed (403) → 1 `[来源: onenote]`
5. Blob Lifecycle Management policy rule does not execute - blobs under certain pre → Check Jarvis: ETWEventOLCMScannerStatesTable, ETWEventOLCMAccountPolicyExecutionStatsTable `[来源: onenote]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/blob-tools.md#排查流程)
