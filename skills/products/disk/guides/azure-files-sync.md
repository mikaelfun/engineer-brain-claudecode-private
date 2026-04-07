# Disk Azure Files, File Sync & NFS — 排查速查

**来源数**: 7 | **21V**: 全部适用
**最后更新**: 2026-04-07
**关键词**: 0x80070032, 21v, agent-v15, azcopy, aznfs, azure-file-sync, azure-files, certificate, digicert, encryption-in-transit

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | Azure File Sync recall fails with error 0x80070032 due to unsupported characters in file path | Files contain unsupported Unicode characters. Evaluation Tool and ScanUnsupportedChars may miss some | Run FileSyncErrorsReport.ps1 to identify affected files. Verify FilePath in error output. Rename files to remove unsuppo | 🟢 9 | [MCVKB] |
| 2 📋 | Azure File Sync agent v15.0.0 causes high CPU on server after installation | Bug in AFS agent v15.0.0 - tiering status bootstrapper thread consumes excessive CPU. ICM 308343342. | Set registry TieringStatusBootstrapMaxThreadCount=0 under HKLM\SOFTWARE\Microsoft\Azure\StorageSync, then restart filesy | 🟢 9 | [MCVKB] |
| 3 📋 | NFS 4.1 Encryption in Transit (aznfs) mount fails in Mooncake: stunnel rejects cert with 'unable to get local issuer cer | Mooncake cloud still uses DigiCert Global Root CA (G1), but the aznfs/stunnel config pins DigiCert G | Temp workaround: concatenate both G1 and G2 certs into the stunnel CAfile. Debian: mv G2.pem → backup, cat G1.pem + G2_b | 🟢 9 | [MCVKB] |
| 4 📋 | Azure File Sync StorageFileLogs shows unclear operation names (CreateDirectory, CreateFile, RenameFile, PutRange) during | CreateDirectory and CreateFile write metadata only. PutRange writes actual file data. RenameFile cre | When analyzing StorageFileLogs for AFS: expect CreateDirectory/RenameFile dominance in first 24h (folder creation phase) | 🟢 8.5 | [MCVKB] |
| 5 📋 | Robocopy migration to Azure Files (SMB) shows no file creation activity for the first 2+ hours | Robocopy processes directory structure before files. For large datasets with millions of folders, th | This is expected behavior. Monitor StorageFileLogs for SMB CreateDirectory operations to confirm progress. File creation | 🟢 8.5 | [MCVKB] |
| 6 📋 | Need to determine optimal Robocopy /MT thread count for migrating large number of small files to Azure Files via SMB | Azure Files SMB performance varies with thread count. Too few threads underutilize bandwidth; too ma | Microsoft recommends /MT:8-20 for initial copy, up to /MT:64 for subsequent runs if CPU can sustain. Tested with B4ms (4 | 🟢 8.5 | [MCVKB] |
| 7 📋 | Azcopy sync performance insufficient for large-scale small file migration (millions of files) to Azure File Share; 500GB | Azcopy sync must index both source and destination before transferring, consuming significant memory | Use Azure File Sync for real-time continuous sync with minimal cutover downtime. Alternative: Robocopy with /MT threads  | 🟢 8.5 | [MCVKB] |

## 快速排查路径

1. Azure File Sync recall fails with error 0x80070032 due to unsupported characters → Run FileSyncErrorsReport `[来源: onenote]`
2. Azure File Sync agent v15.0.0 causes high CPU on server after installation → Set registry TieringStatusBootstrapMaxThreadCount=0 under HKLM\SOFTWARE\Microsoft\Azure\StorageSync, `[来源: onenote]`
3. NFS 4.1 Encryption in Transit (aznfs) mount fails in Mooncake: stunnel rejects c → Temp workaround: concatenate both G1 and G2 certs into the stunnel CAfile `[来源: onenote]`
4. Azure File Sync StorageFileLogs shows unclear operation names (CreateDirectory,  → When analyzing StorageFileLogs for AFS: expect CreateDirectory/RenameFile dominance in first 24h (fo `[来源: onenote]`
5. Robocopy migration to Azure Files (SMB) shows no file creation activity for the  → This is expected behavior `[来源: onenote]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/azure-files-sync.md#排查流程)
