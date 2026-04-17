# Disk Data Box POD: Prepare to Ship — 综合排查指南

**条目数**: 8 | **草稿融合数**: 2 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-change-shipping-address-data-box.md, ado-wiki-prepare-to-ship-phases.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Ado Wiki Change Shipping Address Data Box
> 来源: ADO Wiki (ado-wiki-change-shipping-address-data-box.md)

1. sourceRef: Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Data Box/Ordering - Logistics/Change Shipping Address
2. sourceUrl: https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Data%20Box%2FOrdering%20-%20Logistics%2FChange%20Shipping%20Address
3. importDate: 2026-04-05
4. type: troubleshooting-guide
5. **Description / Overview**
6. You may need to edit the shipping address once the order is placed. This is only available until the device is dispatched. Once the device is dispatched, this option is no longer available. For further assistance Data Box Operations team must be cont
7. Perform the following steps to edit the order.
8. 1.  Go to Order details > Edit shipping address.
9. 2.  Edit and validate the shipping address and then save the changes.
10. **Public Documentation:**

### Phase 2: Prepare to Ship Phases — Stuck Troubleshooting Guide
> 来源: ADO Wiki (ado-wiki-prepare-to-ship-phases.md)

1. sourceRef: Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Data Box/Prepare to Ship/'Prepare to Ship' Phases
2. sourceUrl: https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Data%20Box%2FPrepare%20to%20Ship%2F%27Prepare%20to%20Ship%27%20Phases
3. importDate: 2026-04-05
4. type: troubleshooting-guide
5. Below are the percentages in which each phase of the prepare to ship process completes:
6. If prepare to ship is stuck at this stage for more than 30 minutes try the following:
7. - Cancel prepare to ship and try it again
8. - Cancel prepare to ship, check if the device is showing as locked, if yes, unlock it and try prepare to ship again
9. - Cancel prepare to ship, check if the device is showing as locked, if yes, keep it locked and try prepare to ship again
10. - Reboot the device and try prepare to ship again

## ⚠️ 矛盾处理

📌 **disk-028 vs disk-246** — 适用条件不同：
   - 指南中按根因分支列出，均保留

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Data Box POD Prepare to Ship fails with 'Scan completed with errors' | Customer data does not conform to Azure storage requirements: file/blob naming conventions violated, | 1) Unlock the device. 2) Go to Connect and Copy page, download the issues list. 3) Resolve each error (rename files, fix | 🟢 10 | [MCVKB] |
| 2 | Data Box Prepare to Ship error shows StorageRequestFailed. Upload fails after data copy. | Two possible causes: 1) File rename operation conflicts during copy; 2) Legal hold or immutable stor | Scenario 1: Follow KB https://internal.support.services.microsoft.com/en-US/help/4550171 for file rename issue. Scenario | 🟢 9.5 | [ADO Wiki] |
| 3 | Data Box Download file list (BOM) button not shown in Local UI or greyed out after Prepare to Ship | UI rendering issue or Prepare to Ship did not complete properly | Refresh page; log off and log in again; retry Prepare to Ship by unlocking device first | 🟢 8.5 | [ADO Wiki] |
| 4 | Data Box Download file list (BOM) button visible but clicking results in error; BOM file not present | BOM file not generated during Prepare to Ship process due to incomplete or failed preparation | Retry Prepare to Ship: unlock device first then perform Prepare to Ship; if persists collect support package | 🟢 8.5 | [ADO Wiki] |
| 5 | Data Box Prepare to Ship stuck; hcsdpservice.Primary logs show SE_METADATA_NOT_FOUND error; process does not complete | Files copied to Data Box were in use by another application or process during copy, causing metadata | Collect support package; search hcsdpservice.Primary logs for SE_METADATA_NOT_FOUND; if error points to a file, delete a | 🟢 8.5 | [ADO Wiki] |
| 6 | Data Box Prepare to Ship error log shows ERROR_BLOB_OR_FILE_NAME_CHARACTER_ILLEGAL. File names displayed as random chara | Files on the Data Box have names containing characters that violate Azure blob/file naming rules. Th | Copy the file name from the error report and decode it using a base64 decoder (e.g., https://www.base64decode.org/) to i | 🟢 8.5 | [ADO Wiki] |
| 7 | Data Box Prepare to Ship process is stuck at 86% or more for days or weeks. No errors displayed but process does not com | The device is busy preparing the BOM (Bill of Materials) file due to a very large number of files co | 1) Request support package from customer. 2) Check hcs_status for BOM register and bomdirspersecond to confirm preparati | 🟢 8.5 | [ADO Wiki] |
| 8 | ERROR_BLOB_OR_FILE_TYPE_UNSUPPORTED in Data Box managed disk share - only fixed VHDs allowed | VHDX files, dynamic VHDs, or differencing VHDs were copied to managed disk folders. Only fixed VHDs  | Only upload fixed VHDs to managed disk folders (Premium SSD, Standard HDD, Standard SSD). Remove any VHDX, dynamic, or d | 🔵 7.5 | [MS Learn] |
