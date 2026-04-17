# Disk Azure Files, File Sync & NFS — 综合排查指南

**条目数**: 7 | **草稿融合数**: 7 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-a-Slow-NFS-Transfer-Rate-Linux-DataBox.md, ado-wiki-a-Unable-to-mount-NFS-share-of-Azure-Data-Box.md, onenote-afs-enumeration-eta.md, onenote-azure-file-sync-troubleshooting.md, onenote-azure-files-ad-ds-cross-forest.md, onenote-azure-files-adds-cross-forest.md, onenote-nfs41-vs-smb-protocol-comparison.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Ado Wiki A Slow Nfs Transfer Rate Linux Databox
> 来源: ADO Wiki (ado-wiki-a-Slow-NFS-Transfer-Rate-Linux-DataBox.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Data Box/Connect & Copy/Slow NFS Transfer Rate between Linux Servers and Data Box"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Data%20Box%2FConnect%20%26%20Copy%2FSlow%20NFS%20Transfer%20Rate%20between%20Linux%20Servers%20and%20Data%20Box"
3. importDate: "2026-04-05"
4. type: troubleshooting-guide
5. Description / Overview
6. Use this guide to troubleshoot a slow NFS transfer rate between Linux host(s) and an Azure Data Box Pod device.
7. There are several possible causes for slowness in the NFS transfer rate. These include:
8. *   Network I/O — Depending on the setting, the bandwidth provided to the shares for the data transfer may not be sufficient for the amount of data the customer is transferring. Low bandwidth can lead to delays and slowness in the transfer of data.
9. *   Disk I/O — If there are numerous operations occurring on the nodes in addition to data transfer, read/write operations on the disk of the NFS share (mount) itself can experience slowness due to being overburdened.
10. *   Data — If there is a large amount of data, it will take a longer amount of time to transfer from one location to another. If the files are being converted to another format during transfer (e.g., converted to the .tar format where metadata is pre

### Phase 2: Ado Wiki A Unable To Mount Nfs Share Of Azure Data Box
> 来源: ADO Wiki (ado-wiki-a-Unable-to-mount-NFS-share-of-Azure-Data-Box.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Data Box/Connect & Copy/Unable to mount NFS share of Azure Data Box"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Data%20Box%2FConnect%20%26%20Copy%2FUnable%20to%20mount%20NFS%20share%20of%20Azure%20Data%20Box"
3. importDate: "2026-04-06"
4. type: troubleshooting-guide
5. This TSG details information on how to troubleshoot issues when the customer can't copy data to the Azure Data Box because they cannot connect on the NFS Shares
6. In some cases, most of the customers forget to create a folder under the share for the files, so always ask the customer to create a folder and then copy the files to it
7. When trying to copy data to Data Box there could be issues trying to mount the NFS share. If the customer is unable to mount the share they will not be able to copy the data to it
8. Troubleshooting and Tools
9. *   In these scenarios ask the customer for screenshots or error messages if there are any
10. *   If you are using a Linux host/client computer, perform the following steps to configure Data Box to allow access to NFS clients.

### Phase 3: Azure File Sync: How to Check Enumeration ETA
> 来源: OneNote (onenote-afs-enumeration-eta.md)

1. cd "c:\Program Files\Azure\StorageSyncAgent"
2. Import-Module .\afsdiag.ps1
3. Debug-AFS -OutputDirectory C:\output -KernelModeTraceLevel Verbose -UserModeTraceLevel Verbose
4. - Path: `Event Viewer > Applications and Services Logs > Microsoft > FileSync > Agent > Telemetry`
5. - **Event ID 9133** — Monitor sync progress (ETA calculation)
6. - **Event ID 9100** — Final sync result
7. - **Event ID 9144** — Indicates inaccessible volume issue has returned
8. ETA (seconds) = ((NamespaceDirectoryCount + NamespaceFileCount) - (DirectoriesScannedThisRun + FilesScannedThisRun)) / ItemsPerSecondThisRun
9. 1. **Sync Session Status**: https://portal.microsoftgeneva.com/s/63B729E0
10. 2. **Per-item Errors**: https://portal.microsoftgeneva.com/s/C0E4F134

### Phase 4: Azure File Sync (AFS) Troubleshooting Guide
> 来源: OneNote (onenote-azure-file-sync-troubleshooting.md)

1. 1. **Initial Cloud Enumeration**
2. 2. **"Fast DR" Download sync session** — requires stage 1 complete
3. 3. **Initial Server enumeration** — requires stage 2 complete
4. 4. **"Initial upload" Sync Session** — starts concurrently with stage 3
5. 5. **Incremental Sync**
6. | Type | Direction | Description |
7. |------|-----------|-------------|
8. | FullGhostedSync | Download only | FastDR (initial download) |
9. | InitialUploadSync | Upload only | First upload(s) scenario |
10. | RegularSync | Upload/Download | Typical sync sessions |

### Phase 5: Azure Files AD DS Authentication (Cross-Forest)
> 来源: OneNote (onenote-azure-files-ad-ds-cross-forest.md)

1. Azure Files supports AD DS authentication for SMB access. Cross-forest scenarios require additional trust and SPN configuration.
2. 1. Enable AD DS via script (creates computer/service account in AD representing the storage account)
3. 2. Assign share-level permission via Azure RBAC
4. 3. Assign directory/file level permissions via NTFS: mount share then use `icacls`
5. - Sufficient permissions in both forests
6. - Trust relationship between forests
7. - If using Azure RBAC: both forests must be reachable by a single Microsoft Entra Connect Sync server
8. 1. **Create trust** between forests
9. 2. **Configure domain suffixes** — critical step due to storage account SPN ending with `file.core.chinacloudapi.cn`
10. onprem1sa.onpremad1.com -> onprem1sa.file.core.chinacloudapi.cn

### Phase 6: Azure Files with AD DS Authentication (Cross-Forest)
> 来源: OneNote (onenote-azure-files-adds-cross-forest.md)

1. Azure Files AD DS auth creates an identity (computer account or service logon account) in AD DS representing the storage account for Kerberos authentication.
2. 1. Enable AD DS authentication (via script)
3. 2. Assign share-level permissions (Azure RBAC)
4. 3. Assign directory/file level permissions (NTFS): mount share + icacls
5. - Sufficient permissions in both forests
6. - Trust relationship between forests
7. - If using Azure RBAC: both forests reachable by single Microsoft Entra Connect Sync server
8. 1. Create forest trust
9. 2. In **resource domain** DNS, add CNAME record:
10. `<storage-account-name>.<DomainDnsRoot>` → `<storage-account-name>.file.core.chinacloudapi.cn`

### Phase 7: NFS 4.1 vs SMB Protocol Comparison for Azure Files
> 来源: OneNote (onenote-nfs41-vs-smb-protocol-comparison.md)

1. Source: OneNote - [File]NFS4.1 V.S. SMB
2. | Feature | NFS 4.1 | SMB 2.0/3.x | REST API |
3. |---------|---------|-------------|----------|
4. | OS affinity | Linux/UNIX | Windows | Any (Portal/Explorer) |
5. | File system | POSIX-compliant | Win32/.NET | N/A |
6. | Hard links | Supported | N/A | N/A |
7. | Symbolic links | Supported | N/A | N/A |
8. | Encryption in transit | Not native (needs stunnel/aznfs) | AES-256-GCM, AES-128-GCM, AES-128-CCM | HTTPS |
9. | AD integration | UID/GID | AD domain join + DACL | SAS/AAD |
10. | Network isolation | Private endpoint | Private endpoint | Private endpoint |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Azure File Sync recall fails with error 0x80070032 due to unsupported characters in file path | Files contain unsupported Unicode characters. Evaluation Tool and ScanUnsupportedChars may miss some | Run FileSyncErrorsReport.ps1 to identify affected files. Verify FilePath in error output. Rename files to remove unsuppo | 🟢 9 | [MCVKB] |
| 2 | Azure File Sync agent v15.0.0 causes high CPU on server after installation | Bug in AFS agent v15.0.0 - tiering status bootstrapper thread consumes excessive CPU. ICM 308343342. | Set registry TieringStatusBootstrapMaxThreadCount=0 under HKLM\SOFTWARE\Microsoft\Azure\StorageSync, then restart filesy | 🟢 9 | [MCVKB] |
| 3 | NFS 4.1 Encryption in Transit (aznfs) mount fails in Mooncake: stunnel rejects cert with 'unable to get local issuer cer | Mooncake cloud still uses DigiCert Global Root CA (G1), but the aznfs/stunnel config pins DigiCert G | Temp workaround: concatenate both G1 and G2 certs into the stunnel CAfile. Debian: mv G2.pem → backup, cat G1.pem + G2_b | 🟢 9 | [MCVKB] |
| 4 | Azure File Sync StorageFileLogs shows unclear operation names (CreateDirectory, CreateFile, RenameFile, PutRange) during | CreateDirectory and CreateFile write metadata only. PutRange writes actual file data. RenameFile cre | When analyzing StorageFileLogs for AFS: expect CreateDirectory/RenameFile dominance in first 24h (folder creation phase) | 🟢 8.5 | [MCVKB] |
| 5 | Robocopy migration to Azure Files (SMB) shows no file creation activity for the first 2+ hours | Robocopy processes directory structure before files. For large datasets with millions of folders, th | This is expected behavior. Monitor StorageFileLogs for SMB CreateDirectory operations to confirm progress. File creation | 🟢 8.5 | [MCVKB] |
| 6 | Need to determine optimal Robocopy /MT thread count for migrating large number of small files to Azure Files via SMB | Azure Files SMB performance varies with thread count. Too few threads underutilize bandwidth; too ma | Microsoft recommends /MT:8-20 for initial copy, up to /MT:64 for subsequent runs if CPU can sustain. Tested with B4ms (4 | 🟢 8.5 | [MCVKB] |
| 7 | Azcopy sync performance insufficient for large-scale small file migration (millions of files) to Azure File Share; 500GB | Azcopy sync must index both source and destination before transferring, consuming significant memory | Use Azure File Sync for real-time continuous sync with minimal cutover downtime. Alternative: Robocopy with /MT threads  | 🟢 8.5 | [MCVKB] |
