# Disk Data Box POD: Prepare to Ship — 排查速查

**来源数**: 8 | **21V**: 全部适用
**最后更新**: 2026-04-07
**关键词**: base64, bom, data-box, data-box-pod, download-file-list, dynamic-vhd, error_blob_or_file_name_character_illegal, error_blob_or_file_type_unsupported, file-naming, immutable-storage

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | Data Box POD Prepare to Ship fails with 'Scan completed with errors' | Customer data does not conform to Azure storage requirements: file/blob naming conventions violated, | 1) Unlock the device. 2) Go to Connect and Copy page, download the issues list. 3) Resolve each error (rename files, fix | 🟢 10 | [MCVKB] |
| 2 📋 | Data Box Prepare to Ship error shows StorageRequestFailed. Upload fails after data copy. | Two possible causes: 1) File rename operation conflicts during copy; 2) Legal hold or immutable stor | Scenario 1: Follow KB https://internal.support.services.microsoft.com/en-US/help/4550171 for file rename issue. Scenario | 🟢 9.5 | [ADO Wiki] |
| 3 📋 | Data Box Download file list (BOM) button not shown in Local UI or greyed out after Prepare to Ship | UI rendering issue or Prepare to Ship did not complete properly | Refresh page; log off and log in again; retry Prepare to Ship by unlocking device first | 🟢 8.5 | [ADO Wiki] |
| 4 📋 | Data Box Download file list (BOM) button visible but clicking results in error; BOM file not present | BOM file not generated during Prepare to Ship process due to incomplete or failed preparation | Retry Prepare to Ship: unlock device first then perform Prepare to Ship; if persists collect support package | 🟢 8.5 | [ADO Wiki] |
| 5 📋 | Data Box Prepare to Ship stuck; hcsdpservice.Primary logs show SE_METADATA_NOT_FOUND error; process does not complete | Files copied to Data Box were in use by another application or process during copy, causing metadata | Collect support package; search hcsdpservice.Primary logs for SE_METADATA_NOT_FOUND; if error points to a file, delete a | 🟢 8.5 | [ADO Wiki] |
| 6 📋 | Data Box Prepare to Ship error log shows ERROR_BLOB_OR_FILE_NAME_CHARACTER_ILLEGAL. File names displayed as random chara | Files on the Data Box have names containing characters that violate Azure blob/file naming rules. Th | Copy the file name from the error report and decode it using a base64 decoder (e.g., https://www.base64decode.org/) to i | 🟢 8.5 | [ADO Wiki] |
| 7 📋 | Data Box Prepare to Ship process is stuck at 86% or more for days or weeks. No errors displayed but process does not com | The device is busy preparing the BOM (Bill of Materials) file due to a very large number of files co | 1) Request support package from customer. 2) Check hcs_status for BOM register and bomdirspersecond to confirm preparati | 🟢 8.5 | [ADO Wiki] |
| 8 📋 | ERROR_BLOB_OR_FILE_TYPE_UNSUPPORTED in Data Box managed disk share - only fixed VHDs allowed | VHDX files, dynamic VHDs, or differencing VHDs were copied to managed disk folders. Only fixed VHDs  | Only upload fixed VHDs to managed disk folders (Premium SSD, Standard HDD, Standard SSD). Remove any VHDX, dynamic, or d | 🔵 7.5 | [MS Learn] |

## 快速排查路径

1. Data Box POD Prepare to Ship fails with 'Scan completed with errors' → 1) Unlock the device `[来源: onenote]`
2. Data Box Prepare to Ship error shows StorageRequestFailed. Upload fails after da → Scenario 1: Follow KB https://internal `[来源: ado-wiki]`
3. Data Box Download file list (BOM) button not shown in Local UI or greyed out aft → Refresh page; log off and log in again; retry Prepare to Ship by unlocking device first `[来源: ado-wiki]`
4. Data Box Download file list (BOM) button visible but clicking results in error;  → Retry Prepare to Ship: unlock device first then perform Prepare to Ship; if persists collect support `[来源: ado-wiki]`
5. Data Box Prepare to Ship stuck; hcsdpservice.Primary logs show SE_METADATA_NOT_F → Collect support package; search hcsdpservice `[来源: ado-wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/data-box-pod-prepare.md#排查流程)

## ⚠️ 已知矛盾
- **rootCause_conflict** (context_dependent): disk-028 vs disk-246 — 同为 PtS 失败但根因不同：OneNote 描述通用数据不合规，ADO Wiki 描述特定的文件重命名冲突和 Legal Hold 策略。不同根因对应不同场景
