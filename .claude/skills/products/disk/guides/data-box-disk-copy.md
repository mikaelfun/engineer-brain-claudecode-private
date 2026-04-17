# Disk Data Box Disk: Data Copy & Import — 排查速查

**来源数**: 9 | **21V**: 全部适用
**最后更新**: 2026-04-07
**关键词**: 409, 5tib, asc, bitlocker, blob, blob-size, conversion, copy-stuck, data-box-disk, data-copy

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | Data Box Disk: after data copy completes (success or error), disk immediately enters erasure stage; customer cannot acce | By design, disk enters erasure stage regardless of copy result after data copy finishes at datacente | Contact Ops team or Azure Support immediately before erasure begins if disk needed for troubleshooting. | 🟢 9 | [MCVKB] |
| 2 📋 | Data Box Disk: data copy at DC does not start for several days after disk status changes to Received, no SLA published f | No published SLA for how long after disk received at DC data copy begins. Testing showed within 2 ho | 1) Confirm customer used original shipping label. 2) If label changed, engage Data Box operations to manually match. 3)  | 🟢 9 | [MCVKB] |
| 3 📋 | Data Box Disk managed disk import: customer uploads dynamic VHD, differencing VHD, or VHDX files but they are not import | Data Box Disk import to managed disks only supports fixed VHDs. Dynamic VHDs, differencing VHDs, and | Convert VHDs to fixed format before copying to Data Box Disk. Use Hyper-V Manager or Convert-VHD PowerShell cmdlet: Conv | 🟢 9 | [MCVKB] |
| 4 📋 | Data Box Disk copy to Azure stuck or frozen at same GB value for extended time; DriveCopyTimeout error in ASC; data offl | Drive copy to Azure faulted due to DriveCopyTimeout. Underlying error is Storage Exception The Remot | 1) Check ASC Resource Explorer for Upload Progress and EntityHealthState. 2) Check if an auto-generated WatchDog IcM alr | 🟢 8.5 | [ADO Wiki] |
| 5 📋 | Data Box Disk shows 'Internal Error' in the Azure Portal after the device has been returned to the datacenter; customer  | Upload or processing issue at the datacenter; specific root cause requires investigation via ASC Res | 1) Go to ASC and open Resource Explorer for the order. 2) Check the Data Transfer Status tab for copy status details. 3) | 🟢 8.0 | [ADO Wiki] |
| 6 📋 | Data Box Disk Split Copy tool throws 'Sequence contains no elements' when retrieving BitLocker password | Destination Data Box Disks are offline in Windows. | Use diskmgmt.msc to bring the Data Box Disks online, then retry the Split Copy operation. | 🔵 7.5 | [MS Learn] |
| 7 📋 | Data Box Disk upload fails with 409 error for blobs in WORM (immutable) storage container | Blob storage container is configured as Write Once Read Many (WORM). Re-upload of existing blobs to  | Non-retryable error. Ensure listed blobs are not part of an immutable storage container. Create a new import order after | 🔵 7.5 | [MS Learn] |
| 8 📋 | Data Box Disk managed disk conversion fails - blob size is invalid, supported sizes are between 20MB and 8192 GiB | Page blob size is outside the 20,971,520 bytes to 8,192 GiB range required for managed disk conversi | Ensure each VHD file is between 20 MB and 8192 GiB before creating a new import order. This is a non-retryable error. | 🔵 7.5 | [MS Learn] |
| 9 📋 | Data Box Disk upload halts with retryable error - large file shares not enabled on storage account | Storage account does not have large file shares enabled but the data requires shares exceeding 5 TiB | Enable large file shares on the storage account in Azure portal, then confirm to resume data copy on the Data Box Disk o | 🔵 7.5 | [MS Learn] |

## 快速排查路径

1. Data Box Disk: after data copy completes (success or error), disk immediately en → Contact Ops team or Azure Support immediately before erasure begins if disk needed for troubleshooti `[来源: onenote]`
2. Data Box Disk: data copy at DC does not start for several days after disk status → 1) Confirm customer used original shipping label `[来源: onenote]`
3. Data Box Disk managed disk import: customer uploads dynamic VHD, differencing VH → Convert VHDs to fixed format before copying to Data Box Disk `[来源: onenote]`
4. Data Box Disk copy to Azure stuck or frozen at same GB value for extended time;  → 1) Check ASC Resource Explorer for Upload Progress and EntityHealthState `[来源: ado-wiki]`
5. Data Box Disk shows 'Internal Error' in the Azure Portal after the device has be → 1) Go to ASC and open Resource Explorer for the order `[来源: ado-wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/data-box-disk-copy.md#排查流程)
