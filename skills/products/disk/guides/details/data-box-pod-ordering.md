# Disk Data Box POD: Ordering & Shipping — 综合排查指南

**条目数**: 34 | **草稿融合数**: 4 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-data-box-ordering-faqs.md, ado-wiki-data-box-refund-waiver.md, ado-wiki-erase-data-box-pod-cli.md, ado-wiki-xml-file-creation-export.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Data Box Ordering FAQs
> 来源: ADO Wiki (ado-wiki-data-box-ordering-faqs.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Data Box/Ordering - Logistics/Ordering FAQs"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Data%20Box%2FOrdering%20-%20Logistics%2FOrdering%20FAQs"
3. importDate: "2026-04-05"
4. type: troubleshooting-guide
5. Storage account cannot be changed once the order is processed. Customer will have to create a new order with the required storage account. The customer will have to return the databox that has been shipped to them earlier and has the inaccurate stora
6. Because the databox service is not available in the source country, it is not listed in the Source country drop-down.
7. 1. **Branch in supported country**: If the customer has a branch in another country where the service is available, they can place the order from that branch and then personally transport the device to the desired country. All responsibility of the d
8. 2. **Self-managed shipping**: Customer will have to provide the address of a supported country. They can then pickup the databox from the data center, copy the data onto it and then drop it back at the datacenter. The datacenter address will be provi
9. When you place an order, we check whether a device is available for your order. If a device is available, we will ship it within 10 days. It is conceivable that there are periods of high demand. In this situation, your order will be queued and you ca
10. Estimated lead times for a Data Box order:

### Phase 2: How to Request a Refund or Waiver for Data Box
> 来源: ADO Wiki (ado-wiki-data-box-refund-waiver.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Data Box/Management and How-To/How request a refund or waiver"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Data%20Box%2FManagement%20and%20How-To%2FHow%20request%20a%20refund%20or%20waiver"
3. importDate: "2026-04-05"
4. type: troubleshooting-guide
5. Customer asking for refund / billing adjustment for a Data Box product (Daily usage fee).
6. - Do NOT promise a refund/credit/waiver to the customer.
7. - A refund request can be approved only after checking individual case thoroughly by the PM leads.
8. - PM team will only consider charges related to the Data Box service and associated shipping charges.
9. - Billing charges associated with Azure Storage consumption/networking/IO's are separate and must be handled by Azure Storage team.
10. - Charges do not occur until the device is returned and data copy operations complete and/or the device has returned to the Data Center.

### Phase 3: How to Erase Data on Data Box Pod from CLI (PowerShell Support Session)
> 来源: ADO Wiki (ado-wiki-erase-data-box-pod-cli.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Data Box/Data Copy Service/How to Erase Data on Data Box Pod from CLI (PowerShell Support Session)"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Data%20Box%2FData%20Copy%20Service%2FHow%20to%20Erase%20Data%20on%20Data%20Box%20Pod%20from%20CLI%20(PowerShell%20Support%20
3. importDate: "2026-04-05"
4. type: troubleshooting-guide
5. This guide provides instructions on how to erase data on a Data Box Pod using the CLI (PowerShell support session). This is particularly useful when the customer is unable to run "prepare to ship" due to copy jobs being stuck in a paused state. The c
6. The copy job is stuck in a paused state and cannot be resumed or canceled from the Web UI, preventing the customer from completing the data erase or running "prepare to ship."
7. Trigger a data erase from the support session using PowerShell commands.
8. When a copy job via the Data Copy Service is stuck in a paused state, you are unable to trigger a device reset or run "prepare to ship" from the Web UI.
9. 1. **Enter Mini Shell**
10. - **Note:** `<Customer Password>` is the UI password.

### Phase 4: Assistance with creation of XML file
> 来源: ADO Wiki (ado-wiki-xml-file-creation-export.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Data Box/Export Jobs/Assistance with creation of XML file"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Data%20Box%2FExport%20Jobs%2FAssistance%20with%20creation%20of%20XML%20file"
3. importDate: "2026-04-05"
4. type: troubleshooting-guide
5. A file with the .xml file extension is an Extensible Markup Language (XML) file. These are really just plain text files that use custom tags. If the customer uses an XML file, they can specify specific containers and blobs (page and block) they want 
6. Customer will need to follow the Sample XML file table specifications for formatting their XML. The following xml shows an example of blob names, blob prefixes, and Azure Files contained in the xml format that the export order uses when you select th
7. [Tutorial to export data from Azure Data Box | Microsoft Learn](https://learn.microsoft.com/en-us/azure/databox/data-box-deploy-export-ordered?tabs=sample-xml-file#create-xml-file)

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Data Box POD order creation fails: could not validate address | Data Box service uses UPS Address Validator for address validation. Incorrectly formatted address or | 1) Verify address format using UPS Address Validator (ups.com/address_validator). 2) If address is valid but order still | 🟢 10 | [MCVKB] |
| 2 | Data Box POD Prepare to Ship running slowly, stuck, or not progressing | Prepare to Ship performs data validation, checksum computation, and multiple stages. Large data volu | 1) Check WebUI for warnings/errors at each stage. 2) Unlock device -> Connect and Copy -> download issue list XML for ex | 🟢 10 | [MCVKB] |
| 3 | Data Box export order fails or data missing: archive tier blobs not exported | Archive blobs are NOT supported for Data Box export. Only hot and cool tiers are supported. File his | 1) Rehydrate archive blobs to hot/cool tier before creating export order (see Azure docs: archive-rehydrate-overview). 2 | 🟢 10 | [MCVKB] |
| 4 | Data Box export order fails or no data exported due to incorrect XML file formatting; XML tags case-sensitive mismatch,  | XML file used for Data Box export order has formatting errors: tags are case-sensitive and must matc | Follow the sample XML file table specifications from Microsoft documentation; ensure XML tags are case-sensitive match,  | 🟢 9.5 | [ADO Wiki] |
| 5 | Need to change shipping address for Data Box order after it has been placed; edit shipping address option unavailable af | Shipping address edit is only available in Azure portal before the device is dispatched; once dispat | Go to Order details > Edit shipping address to edit and validate the new address before dispatch; if device already disp | 🟢 9.5 | [ADO Wiki] |
| 6 | Customer requests Data Box to be shipped to a different address than original order; need to redirect delivery destinati | Address change after order placement requires Data Box Operations team approval and coordination; ca | Create ICM to Data Box Ops team requesting address change with order details; Ops team will seek stakeholder approvals a | 🟢 9.5 | [ADO Wiki] |
| 7 | Unable to run Prepare to Ship on Data Box due to 502 error on Local Web UI; cannot access local UI to manage device | Known issue where Data Box Local Web UI returns 502 error, preventing access to the management inter | If data copy is complete, shutdown device using power button and return to Azure DC; create ICM with DBX Pod Management  | 🟢 9.5 | [ADO Wiki] |
| 8 | Data Box Prepare to Ship fails with ERROR_CONTAINER_OR_SHARE_CAPACITY_EXCEEDED when uploading more than 5TB to Azure Fil | Azure storage account file share capacity limit of 5TB exceeded; large file shares not enabled on th | Enable large file shares on storage account (Configuration > Large file shares > Enabled); enable Disregard LFS errors i | 🟢 9.5 | [ADO Wiki] |
| 9 | Data Box Prepare to Ship returns 'Scan completed with errors'. Customer cannot complete prepare to ship and e-ink shippi | Files or containers on the Data Box violate Azure naming rules, exceed size limits, or contain unsup | Have customer unlock device, go to Connect and Copy in WebUI, and download the 'Issue list' folder. Review the XML file  | 🟢 9.5 | [ADO Wiki] |
| 10 | Data Box Prepare to Ship fails with ERROR_CONTAINER_OR_SHARE_CAPACITY_EXCEEDED. Azure file share exceeds 5 TiB limit. | Large File Shares (LFS) was not enabled on the storage account before ordering the Data Box. Azure f | 1) Enable Large File Shares on storage account (Configuration tab). 2) Create Azure File shares and set quota to 100 TB. | 🟢 9.5 | [ADO Wiki] |
| 11 | Data Box POD order creation fails: Data Box model not available in selected region | Azure Data Box service does not support all countries/regions. Data ingestion/egress only within sam | Check region availability at Azure Products by Region page. If region supported but still failing, escalate via IcM to D | 🟢 9 | [MCVKB] |
| 12 | Data Box POD order creation fails: could not create order due to missing prerequisites | Missing required prerequisites: Azure storage account with access credentials, supported subscriptio | Verify: 1) Storage account exists with valid access key. 2) Subscription type is MCA, EA, CSP (not India), Sponsorship,  | 🟢 9 | [MCVKB] |
| 13 | Cannot create additional Data Box POD orders: limit reached | Data Box service limits each Azure subscription to 5 active Data Box orders at a time. | Wait for existing orders to complete/cancel, or use a different subscription. Limit is 5 active orders per subscription. | 🟢 9 | [MCVKB] |
| 14 | Data Box POD import order shows 'Completed with errors' - some data not copied to Azure | Customer ignored errors/warnings shown during Prepare to Ship, or skipped Prepare to Ship entirely.  | 1) Review copy logs (verbose + error logs) in a separate container of the storage account. 2) Customer not charged if fa | 🟢 9 | [MCVKB] |
| 15 | Data Box POD export order: need to verify data integrity and troubleshoot export failures | Data export may fail silently or partially. Copy/verbose logs must be checked to confirm all files e | 1) Check copy logs at container copylog. 2) Review verbose log for file list with sizes and checksums. 3) Compare export | 🟢 9 | [MCVKB] |
| 16 | Data Box cross-region scenario confusion in Mooncake: customer wants to export data from China East storage account but  | Data Box POD hardware only exists in specific DC regions (SHA20/ZQZ22 for POD; NTG20/BJS20/ZQZ22 for | 1) Confirm Data Box can handle cross-region within commerce boundary (e.g. China East SA → device in China East 2). 2) F | 🟢 9 | [MCVKB] |
| 17 | Customer confused about Data Box data transfer fees: import vs export cross-region scenarios | Import: cross-region backbone transfer is FREE (covered by Data Box service). Export: standard egres | Clarify fee model: 1) Import orders = no cross-region transfer cost within commerce boundary. 2) Export orders = egress  | 🟢 9 | [MCVKB] |
| 18 | Cannot change storage account associated with Data Box after order is processed | By design — storage account is immutable once order is processed | Customer must create a new order with the correct storage account and return the existing Data Box | 🟢 8.5 | [ADO Wiki] |
| 19 | Source country not found in dropdown when creating Data Box order | Data Box service is not available in the customer's country | Workaround: 1) Use a branch office in a supported country to place order, then personally transport device; 2) Use self- | 🟢 8.5 | [ADO Wiki] |
| 20 | MARS Agent cannot locate/detect NFS share path on Data Box when configuring offline backup to Azure Recovery Services Va | NFS client not enabled/installed on Windows host, and/or host IP not added to NFS allowed client lis | Enable NFS client feature on Windows host, mount Data Box as Local System, add host IP to NFS allowed client IP addresse | 🟢 8.5 | [ADO Wiki] |
| 21 | Cannot access or navigate folders/files copied to Data Box with robocopy ACL preservation flags (/B /MIR /IT /COPY:DATSO | Data Box is not domain-joined and cannot recognize customer's domain user IDs or security principals | Use backup-semantics-aware tools (robocopy, PowerShell) instead of File Explorer to verify files on Data Box. ACLs are p | 🟢 8.5 | [ADO Wiki] |
| 22 | Data Box device received at Azure datacenter but data copy to storage account has not started; order status shows Receiv | Multiple possible causes: shipping delay (device not yet at DC), delay at Azure DC in moving job to  | 1) Check ASC: verify AtAzureDC stage status shows succeeded. 2) Check Shipping Status in ASC for shipping details. 3) Ch | 🟢 8.5 | [ADO Wiki] |
| 23 | Data Box device lost during return shipping; device shipped by customer has not been received at Azure datacenter | Device was lost by shipping carrier (FedEx/UPS/DHL) during return transit to Azure datacenter | 1) Check tracking in ASC: Resource Explorer > Shipping Status > reverse shipping type for return tracking URL. 2) Check  | 🟢 8.5 | [ADO Wiki] |
| 24 | Customer copies data to wrong folder on Data Box (e.g., block blob folder instead of Azure Files or vice versa), data in | User error: data copied to incorrect storage type folder on Data Box device (e.g., block blob share  | No server-side fix. Use AzCopy to move data between blob and file storage: 1) Identify where data was ingested (Storage  | 🟢 8.5 | [ADO Wiki] |
| 25 | Customer shipped Data Box via USPS instead of UPS, tracking unavailable, device location unknown | Customer used wrong carrier (USPS) instead of designated carrier (UPS) | 1) Create ICM with Operations Team. 2) Email adbops@microsoft.com with order details. 3) If device lost, share pricing:  | 🟢 8.5 | [ADO Wiki] |
| 26 | Data Box returned via UPS/DHL but delivery delayed beyond expected timeframe, device not received at datacenter | Device delayed or lost by carrier (UPS/DHL) during return transit | 1) Create ICM with Operations Team. 2) Email adbops@microsoft.com with order/tracking details. 3) If investigation too l | 🟢 8.5 | [ADO Wiki] |
| 27 | In Europe, UPS/DHL requests pickup fee from customer for Data Box return, even though return service is included | Carrier incorrectly charging collection fee; device return service is included in Data Box pricing | 1) Create ICM with Operations Team. 2) Email adbops@microsoft.com to arrange collection. 3) Ops team arranges pickup wit | 🟢 8.5 | [ADO Wiki] |
| 28 | Data Box export order error when attempting to export managed disks; log file not loading, requested VHD file not copied | Exporting managed disks via Data Box is not a supported use case | Inform customer that managed disk export via Data Box is not supported; customer needs to cancel the order and use an al | 🟢 8.5 | [ADO Wiki] |
| 29 | Data Box export job from Azure halted or fails; files not copied during export; etag mismatch in copy logs between befor | Data churn during export operation: files (e.g., VHDs) were modified by running VMs while the export | Create ICM with Data Box Operations to ship device as-is so customer can check exported data; for failed files, customer | 🟢 8.5 | [ADO Wiki] |
| 30 | Data Box Pod delivered without power cable; no power cord included in shipment | Power cables were not included during shipping/packaging of the Data Box device | Create ICM with Data Box Ops team to either ship the missing power cables to the customer, or customer can use any stand | 🟢 8.5 | [ADO Wiki] |
| 31 | Data Box order showing incorrect region (e.g., West US) instead of customer-selected region (e.g., East US); order creat | Data Box devices are allocated at nearest data center with in-stock availability; in the US, order d | This is expected behavior; verify target storage account regions in ASC summary tab; order deployment region for US orde | 🟢 8.5 | [ADO Wiki] |
| 32 | Data Box device not delivered on expected date by courier service (UPS/DHL); delivery delayed beyond expected timeframe; | Regional carrier (UPS/DHL) delivery delay or missed delivery; tracking shows dispatched but device n | Raise ICM (Sev3) to Data Box Ops team to open investigation case with carrier; also email Operations team using template | 🟢 8.5 | [ADO Wiki] |
| 33 | Customer unable to download Data Box shipping label from portal or needs new shipping label for return; customer and dev | Shipping label unavailable in portal or customer needs label for different return location | Verify Prepare to Ship completed without errors; for EU orders check e-ink display for label; if unavailable, create ICM | 🟢 8.5 | [ADO Wiki] |
| 34 | System error 1909 when connecting to Data Box SMB share: 'The referenced account is currently locked out and may not be  | Multiple possible causes: (1) Using IP address with username format incorrectly, (2) Using device cr | 1) Wait 30 minutes for account auto-unlock. 2) Use SMB access credentials (not device credentials) - verify in Azure Por | 🟢 8.5 | [ADO Wiki] |
