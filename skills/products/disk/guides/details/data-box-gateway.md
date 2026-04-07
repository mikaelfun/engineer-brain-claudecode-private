# Disk Data Box Gateway — 综合排查指南

**条目数**: 7 | **草稿融合数**: 1 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-a-expand-data-disk-data-box-gateway.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Process to Expand Data Disk on Data Box Gateway
> 来源: ADO Wiki (ado-wiki-a-expand-data-disk-data-box-gateway.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Data Box Gateway/Configure & Setup/Process to Expand Data Disk on Data Box Gateway"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Data%20Box%20Gateway%2FConfigure%20%26%20Setup%2FProcess%20to%20Expand%20Data%20Disk%20on%20Data%20Box%20Gateway"
3. importDate: "2026-04-05"
4. type: troubleshooting-guide
5. Below is the process to expand the data disk in a Data Box Gateway virtual device.
6. 1. **Initiate appliance shutdown** and wait until the shutdown process completes.
7. 2. **Add a new, thinly provisioned SCSI hard disk** (DO NOT expand the default data drive):
8. - **Hyper-V**: Add a new virtual hard disk via Hyper-V Manager
9. - **VMware ESXi**: Add a new virtual disk via VMware vSphere/ESXi console
10. 3. **Restart the appliance** (from Hyper-V Manager or VMware) and wait for the local UI to be available.

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Data Box Gateway not uploading data to Azure cloud; Device events show "Could not upload file(s) from share" warning; fi | Blob Lifecycle Management policy on the storage account changed blobs to Archive tier. Archived blob | Rehydrate archived blobs to Hot or Cool tier: (1) manually change tier per blob via Azure Portal or CLI, (2) delete the  | 🟢 8.5 | [ADO Wiki] |
| 2 | Error 0x8007003A when copying files from Data Box Gateway share to local machine; files inaccessible despite connectivit | Associated blobs in Azure Storage have been archived. Data Box Gateway cannot read archived blobs, p | Rehydrate archived blobs from Archive to Hot/Cool tier. Customer can use Azure Portal, CLI, or PowerShell to change blob | 🟢 8.5 | [ADO Wiki] |
| 3 | Files on Data Box Gateway share take longer than normal to open; slow file access on first open | By design, Data Box Gateway uploads data to Azure Storage and once local cache threshold is reached, | Check file properties: compare "Size" vs "Size on Disk" in File Explorer or PowerShell. Files with Size on Disk = 0 are  | 🟢 8.5 | [ADO Wiki] |
| 4 | Upload Error 2003 on Azure Data Box Gateway; upload failure with nonTransientErrors in upload logs; hcsedgeagentwriter l | Directory or file name ends with a space or period, violating Windows local file/directory naming co | Move affected files to a directory with a compliant name (no trailing space or period). Period as first character is acc | 🟢 8.5 | [ADO Wiki] |
| 5 | Unable to access Azure Data Box / Azure Stack Edge / Data Box Gateway SMB shares due to authentication failure; SMB Sess | Mismatched LmCompatibilityLevel between client and Data Box device; client configured with lower LM  | Change LAN Manager authentication level on client: secpol.msc → Local Policies → Security Options → Network Security: LA | 🟢 8.5 | [ADO Wiki] |
| 6 | Azure Data Box Gateway share status permanently shows 'Updating' in Azure Portal; last updated time and error logs are b | Error 2002: files on the share are currently open/locked by applications and cannot be uploaded to c | Close all open files on the affected share to allow the Data Box Gateway writer to retry and complete the upload | 🟢 8.5 | [ADO Wiki] |
| 7 | Upload failure with error 2003 on Azure Data Box Gateway; files fail to upload from a share whose root datadata folder h | The share root or datadata folder has the ReadOnly attribute set, preventing the HCS edge agent writ | Create a non-readonly empty folder locally and robocopy it to the share root to clear the ReadOnly attribute. For future | 🟢 8.5 | [ADO Wiki] |
