# Disk Data Box Disk: Data Copy & Import — 综合排查指南

**条目数**: 9 | **草稿融合数**: 6 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-data-box-disk-faqs.md, ado-wiki-data-box-disk-internal-error-portal.md, ado-wiki-databox-disk-upload-to-container.md, ado-wiki-write-protected-error-data-box-disk.md, onenote-databox-disk-data-preparation.md, onenote-databox-disk-process-flow.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Data Box Disk FAQs — Ordering & Logistics
> 来源: ADO Wiki (ado-wiki-data-box-disk-faqs.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Data Box Disk/Ordering & Logistics/Data Box Disk FAQs"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Data%20Box%20Disk%2FOrdering%20%26%20Logistics%2FData%20Box%20Disk%20FAQs"
3. importDate: "2026-04-05"
4. type: troubleshooting-guide
5. Storage account cannot be changed once the order is processed. Customer will have to create a new order with the required storage account. The customer will have to return the Data Box that has been shipped earlier with the inaccurate storage account
6. Because the Data Box service is not available in the source country, it is not listed in the Source country drop-down.
7. - **Branch in supported country**: If the customer has a branch in another country where the service is available, they can place the order from that branch and personally transport the device. All responsibility of the Data Box is on the customer on
8. - **Self-managed shipping**: Customer will have to provide the address of a supported country. They can then pick up the Data Box from the data center, copy data, and drop it back. The datacenter address will be provided by MS but pickup and drop-off
9. Reference: [Microsoft Azure Data Box Disk self-managed Shipping](https://learn.microsoft.com/en-us/azure/databox/data-box-disk-portal-customer-managed-shipping)
10. When you place an order, we check whether a device is available. If available, it will ship within 10 days. During periods of high demand, orders are queued — track status changes in the Azure portal. Orders not fulfilled in 90 days are automatically

### Phase 2: Data Box disk showing as internal Error in Azure Portal
> 来源: ADO Wiki (ado-wiki-data-box-disk-internal-error-portal.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Data Box Disk/Data Copy at Azure/Data Box disk showing as Internal Error in Azure Portal"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=/Azure%20Data%20Box%20Disk/Data%20Copy%20at%20Azure/Data%20Box%20disk%20showing%20as%20Internal%20Error%20in%20Azure%20Portal"
3. importDate: "2026-04-05"
4. type: troubleshooting-guide
5. When you've already returned the disk but see an error in the portal and can't view the logs, follow these steps to troubleshoot and resolve the issue.
6. 1. Go to ASC and click on Resource Explorer.
7. 2. Check the Data Transfer Status tab.
8. - You'll see the status of the copy here.
9. 3. Confirm the status.
10. 4. Check the Active ICM tab to see if an ICM (Incident Communication Management Ticket) is already created.

### Phase 3: Data Box Disk — How Data is Uploaded to a Storage Account Container
> 来源: ADO Wiki (ado-wiki-databox-disk-upload-to-container.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Data Box Disk/Connect & Copy/How is data from the Azure Data Box Disk uploaded to a container in the storage account?"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Data%20Box%20Disk%2FConnect%20%26%20Copy%2FHow%20is%20data%20from%20the%20Azure%20Data%20Box%20Disk%20uploaded%20to%20a%20co
3. importDate: "2026-04-05"
4. type: troubleshooting-guide
5. When ordering a Data Box Disk, you only specify the Resource Group and Storage Account. The container structure is determined during the upload process.
6. "A container is created in the Azure storage account for each subfolder under BlockBlob and PageBlob folders. All files under BlockBlob and PageBlob folders are copied into a default container `$root` under the Azure Storage account. Any files in the
7. Name the folders under `BlockBlob` or `PageBlob` according to the container names you want in Azure:
8. - Disk: `<BlockBlob or PageBlob>/<container-name>/<folder-structure>`
9. - Azure Storage: `<container-name>/<folder-structure>`
10. Name the sub-folder under `BlockBlob` or `PageBlob` on the Data Box Disk with the same name as your existing container.

### Phase 4: Can't Copy Data to Azure Data Box Disk — Write Protected Error
> 来源: ADO Wiki (ado-wiki-write-protected-error-data-box-disk.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Data Box Disk/Hardware & Unlock/The Media is Write Protected error on Azure Data Box Disk"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Data%20Box%20Disk%2FHardware%20%26%20Unlock%2FThe%20Media%20is%20Write%20Protected%20error%20on%20Azure%20Data%20Box%20Disk"
3. importDate: "2026-04-05"
4. type: troubleshooting-guide
5. The customer ordered a Data Box Disk. After unlocking the unit, the customer got the following message:
6. "ERROR: The media is write protected. Exiting…"
7. The customer can see the disk contents but can't copy any data onto the disk due to a write-protected message.
8. Data Box Disk needs the Data Box Disk Unlock tool to unlock the device.
9. Make sure to follow the [documentation to unlock Data Box disks](https://learn.microsoft.com/en-us/azure/databox/data-box-disk-deploy-set-up?tabs=bitlocker%2Cwindows%2Ccentos).
10. * If you're using Robocopy, try to drag and drop a file using the file explorer to discard app-specific issues.

### Phase 5: Data Box Disk Data Preparation Guide
> 来源: OneNote (onenote-databox-disk-data-preparation.md)

1. 1. Open shipping box, verify 1-5 SSDs + USB cables
2. 2. If box is tampered/damaged → contact Microsoft Support before opening
3. 3. Save box and foam for return shipment
4. 4. Connect disk to client PC via USB
5. 1. Download Data Box Disk toolset: `https://aka.ms/databoxdisktoolswin`
6. 2. Extract toolset on the data copy machine
7. 3. Run Command Prompt / PowerShell as Administrator
8. 4. Optional: Run system check command to verify OS compatibility
9. 5. Run `DataBoxDiskUnlock.exe` with passkey from Azure portal
10. 6. Disk appears as NTFS partition after successful unlock

### Phase 6: Data Box Disk Process Flow Guide (Mooncake)
> 来源: OneNote (onenote-databox-disk-process-flow.md)

1. | Phase | Action | Portal Status | ASC Status | Typical Duration |
2. |-------|--------|---------------|------------|-----------------|
3. | 1 | Create Job (Customer) | Ordered | DeviceOrdered | Minutes |
4. | 2 | Prepare Disk (Ops) | Processed | DevicePrepared | Up to 5 business days |
5. | 3 | Dispatch to carrier (Ops) | Processed | Dispatched | 1 business day |
6. | 4 | Deliver to customer | Delivered | Delivered | 2-3 business days |
7. | 5 | Prepare Data (Customer) | Delivered | Delivered | Varies |
8. | 6 | Return disk (Customer) | Picked up | PickedUp | 2-3 business days |
9. | 7 | Receive at DC (Ops) | Received | AtAzureDC | 1 business day |
10. | 8 | Data Copy (Ops) | Data Copy in Progress | DataCopy | < 1 business day |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Data Box Disk: after data copy completes (success or error), disk immediately enters erasure stage; customer cannot acce | By design, disk enters erasure stage regardless of copy result after data copy finishes at datacente | Contact Ops team or Azure Support immediately before erasure begins if disk needed for troubleshooting. | 🟢 9 | [MCVKB] |
| 2 | Data Box Disk: data copy at DC does not start for several days after disk status changes to Received, no SLA published f | No published SLA for how long after disk received at DC data copy begins. Testing showed within 2 ho | 1) Confirm customer used original shipping label. 2) If label changed, engage Data Box operations to manually match. 3)  | 🟢 9 | [MCVKB] |
| 3 | Data Box Disk managed disk import: customer uploads dynamic VHD, differencing VHD, or VHDX files but they are not import | Data Box Disk import to managed disks only supports fixed VHDs. Dynamic VHDs, differencing VHDs, and | Convert VHDs to fixed format before copying to Data Box Disk. Use Hyper-V Manager or Convert-VHD PowerShell cmdlet: Conv | 🟢 9 | [MCVKB] |
| 4 | Data Box Disk copy to Azure stuck or frozen at same GB value for extended time; DriveCopyTimeout error in ASC; data offl | Drive copy to Azure faulted due to DriveCopyTimeout. Underlying error is Storage Exception The Remot | 1) Check ASC Resource Explorer for Upload Progress and EntityHealthState. 2) Check if an auto-generated WatchDog IcM alr | 🟢 8.5 | [ADO Wiki] |
| 5 | Data Box Disk shows 'Internal Error' in the Azure Portal after the device has been returned to the datacenter; customer  | Upload or processing issue at the datacenter; specific root cause requires investigation via ASC Res | 1) Go to ASC and open Resource Explorer for the order. 2) Check the Data Transfer Status tab for copy status details. 3) | 🟢 8.0 | [ADO Wiki] |
| 6 | Data Box Disk Split Copy tool throws 'Sequence contains no elements' when retrieving BitLocker password | Destination Data Box Disks are offline in Windows. | Use diskmgmt.msc to bring the Data Box Disks online, then retry the Split Copy operation. | 🔵 7.5 | [MS Learn] |
| 7 | Data Box Disk upload fails with 409 error for blobs in WORM (immutable) storage container | Blob storage container is configured as Write Once Read Many (WORM). Re-upload of existing blobs to  | Non-retryable error. Ensure listed blobs are not part of an immutable storage container. Create a new import order after | 🔵 7.5 | [MS Learn] |
| 8 | Data Box Disk managed disk conversion fails - blob size is invalid, supported sizes are between 20MB and 8192 GiB | Page blob size is outside the 20,971,520 bytes to 8,192 GiB range required for managed disk conversi | Ensure each VHD file is between 20 MB and 8192 GiB before creating a new import order. This is a non-retryable error. | 🔵 7.5 | [MS Learn] |
| 9 | Data Box Disk upload halts with retryable error - large file shares not enabled on storage account | Storage account does not have large file shares enabled but the data requires shares exceeding 5 TiB | Enable large file shares on the storage account in Azure portal, then confirm to resume data copy on the Data Box Disk o | 🔵 7.5 | [MS Learn] |
