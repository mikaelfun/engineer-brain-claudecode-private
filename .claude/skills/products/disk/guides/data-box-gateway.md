# Disk Data Box Gateway — 排查速查

**来源数**: 7 | **21V**: 全部适用
**最后更新**: 2026-04-07
**关键词**: archived-blob, authentication, azure-stack-edge, by-design, copy-failure, data-box, data-box-gateway, datadata, directory-name, error-0x8007003a

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | Data Box Gateway not uploading data to Azure cloud; Device events show "Could not upload file(s) from share" warning; fi | Blob Lifecycle Management policy on the storage account changed blobs to Archive tier. Archived blob | Rehydrate archived blobs to Hot or Cool tier: (1) manually change tier per blob via Azure Portal or CLI, (2) delete the  | 🟢 8.5 | [ADO Wiki] |
| 2 📋 | Error 0x8007003A when copying files from Data Box Gateway share to local machine; files inaccessible despite connectivit | Associated blobs in Azure Storage have been archived. Data Box Gateway cannot read archived blobs, p | Rehydrate archived blobs from Archive to Hot/Cool tier. Customer can use Azure Portal, CLI, or PowerShell to change blob | 🟢 8.5 | [ADO Wiki] |
| 3 📋 | Files on Data Box Gateway share take longer than normal to open; slow file access on first open | By design, Data Box Gateway uploads data to Azure Storage and once local cache threshold is reached, | Check file properties: compare "Size" vs "Size on Disk" in File Explorer or PowerShell. Files with Size on Disk = 0 are  | 🟢 8.5 | [ADO Wiki] |
| 4 📋 | Upload Error 2003 on Azure Data Box Gateway; upload failure with nonTransientErrors in upload logs; hcsedgeagentwriter l | Directory or file name ends with a space or period, violating Windows local file/directory naming co | Move affected files to a directory with a compliant name (no trailing space or period). Period as first character is acc | 🟢 8.5 | [ADO Wiki] |
| 5 📋 | Unable to access Azure Data Box / Azure Stack Edge / Data Box Gateway SMB shares due to authentication failure; SMB Sess | Mismatched LmCompatibilityLevel between client and Data Box device; client configured with lower LM  | Change LAN Manager authentication level on client: secpol.msc → Local Policies → Security Options → Network Security: LA | 🟢 8.5 | [ADO Wiki] |
| 6 📋 | Azure Data Box Gateway share status permanently shows 'Updating' in Azure Portal; last updated time and error logs are b | Error 2002: files on the share are currently open/locked by applications and cannot be uploaded to c | Close all open files on the affected share to allow the Data Box Gateway writer to retry and complete the upload | 🟢 8.5 | [ADO Wiki] |
| 7 📋 | Upload failure with error 2003 on Azure Data Box Gateway; files fail to upload from a share whose root datadata folder h | The share root or datadata folder has the ReadOnly attribute set, preventing the HCS edge agent writ | Create a non-readonly empty folder locally and robocopy it to the share root to clear the ReadOnly attribute. For future | 🟢 8.5 | [ADO Wiki] |

## 快速排查路径

1. Data Box Gateway not uploading data to Azure cloud; Device events show "Could no → Rehydrate archived blobs to Hot or Cool tier: (1) manually change tier per blob via Azure Portal or  `[来源: ado-wiki]`
2. Error 0x8007003A when copying files from Data Box Gateway share to local machine → Rehydrate archived blobs from Archive to Hot/Cool tier `[来源: ado-wiki]`
3. Files on Data Box Gateway share take longer than normal to open; slow file acces → Check file properties: compare "Size" vs "Size on Disk" in File Explorer or PowerShell `[来源: ado-wiki]`
4. Upload Error 2003 on Azure Data Box Gateway; upload failure with nonTransientErr → Move affected files to a directory with a compliant name (no trailing space or period) `[来源: ado-wiki]`
5. Unable to access Azure Data Box / Azure Stack Edge / Data Box Gateway SMB shares → Change LAN Manager authentication level on client: secpol `[来源: ado-wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/data-box-gateway.md#排查流程)
