# DEFENDER Defender for Storage — Comprehensive Troubleshooting Guide

**Entries**: 23 | **Draft sources**: 6 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-defender-for-storage-tsg.md, ado-wiki-b-defender-for-storage-v2-internal-faq.md, ado-wiki-b-enabling-on-upload-malware-scanning-bicep.md, ado-wiki-b-storage-atp-alerts.md, ado-wiki-c-defender-for-storage-overview.md, ado-wiki-c-kql-queries-malware-scanning.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Defender For Storage
> Sources: ado-wiki

**1. Customer wants to exclude a specific storage account from Microsoft Defender for Storage coverage**

- **Root Cause**: Once Defender for Storage is enabled at subscription level, all storage accounts are automatically covered. Exclusion is only available for the legacy Per Transaction pricing plan, not the new Per Storage Account plan.
- **Solution**: First confirm customer is on Per Transaction plan (UI shows New pricing plan available). Then: (1) Assign tag Name=AzDefenderPlanAutoEnable Value=off to the storage account. (2) Disable Defender using one of: turn bundle OFF then ON at subscription level (caution: may trigger plan migration), PowerShell Disable-AzSecurityAdvancedThreatProtection -ResourceId, or manually disable from each storage account UI. Per Storage Account plan supports per-resource enable/disable by design.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Malware not detected by Defender for Storage (old per-transaction plan) for files uploaded via SMB or using Put Block/Put Block List API operations**

- **Root Cause**: The old Defender for Storage (Storage ATP) uses hash reputation analysis, not actual file scanning. Some storage telemetry logs do not contain hash values. Unsupported scenarios: SMB file-sharing protocol, and blobs created using Put Block + Put Block List operations.
- **Solution**: Inform customer that hash reputation analysis has protocol limitations on the legacy plan. Recommend migrating to the new Defender for Storage plan which provides proper on-upload malware scanning (full file scan, not just hash comparison). The new plan supports Blob Storage (Standard/Premium StorageV2 including Data Lake Gen2) for activity monitoring and malware scanning.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. Customer notices higher Defender for Storage billing charges after Storage ATP v2 update**

- **Root Cause**: Storage ATP v2 extended protection to Azure Files and Azure Data Lake Storage Gen2 (ADLS Gen2). This increased protected storage accounts by ~30% and billed transactions by ~20% (exceeding 6.9 billion hourly transactions).
- **Solution**: Use KQL billing query on RomeTelemetryData/RomeTelemetryProd BillingReportsRawArchive filtering by subscription and storage account with meter IDs (standard: 8a752c6d-6098-4f15-8828-3716ba46d524, trial: 3783f977-f109-4a6b-9cf6-2f1432bb770c) to analyze usage across services. Consider migrating to the new per-storage-account pricing plan for predictable billing.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**4. Customer asks why Defender for Storage malware scanning GB usage is higher than expected or asks if modified files are rescanned**

- **Root Cause**: By design, modified files undergo a full rescan each time. Rescanning is triggered only by write actions (not reads). Every modification triggers a full scan of the entire file (not incremental). Example: a 1GB file modified 10 times in a day = 10GB total scanned.
- **Solution**: Inform customer this is expected behavior by design. To reduce scanning costs: (1) minimize unnecessary file modifications/re-uploads, (2) consider the GB cap setting available per storage account in the new plan, (3) use HourlyPolicyTableSnapshot_v1 query on dfsv2telemetryadx cluster to check current GBCap configuration.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**5. Malicious blob detected by Defender for Storage but not automatically deleted (Automated Response enabled)**

- **Root Cause**: Three possible causes: 1) Automated Response feature not enabled under On-Upload Malware Scanning settings (default is disabled). 2) Soft-delete property was disabled on the storage account after Automated Response was enabled - Malware Scanning will not re-enable it. 3) Internal server error (status 500) in the deletion operation.
- **Solution**: 1) Verify Defender for Storage On-Upload Malware Scanning is enabled AND Automated Response is enabled underneath it. 2) Check storage account Data Protection settings to ensure soft-delete is enabled. 3) Check the security alert for the malicious blob - if failure reason shows status 500, escalate to PG (IcM: Microsoft Defender for Cloud > Antimalware for Storage). Collect: SA resource ID, enablement date, exact error, reproduction steps.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**6. Cannot enable or configure Defender for Storage on Databricks managed storage account - access denied or security settings writes blocked**

- **Root Cause**: Databricks managed storage accounts have a Deny Assignment that blocks Microsoft.Security/advancedThreatProtectionSettings/* and Microsoft.Security/DefenderForStorageSettings/* writes. The customer cannot directly enable Defender for Storage on these SAs.
- **Solution**: 1) Collaborate with Databricks team (SAP Azure/Databricks/Storage/Workspace managed storage) providing: SubscriptionId, SA resourceID, workspace URI, business justification. 2) Create CRI to Azure Databricks RP team to allow access to the two security providers. Note: Even after enablement, Sensitive Data Discovery and Malware Scanning are NOT supported on Databricks managed SAs.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**7. Error modifying Event Grid StorageAntimalwareSubscription: WebhookAadAppAccessCheckCategory - Subscriber user should be in the same tenant as the webhook aad application**

- **Root Cause**: The StorageAntimalwareSubscription is a system-managed Event Grid subscription tied to the Storage Antimalware RP. It is read-only and only supports BlobCreated and BlobRenamed event types. Attempting to add/filter other event types (e.g. AsyncOperationInitiated) triggers a tenant mismatch error because the subscription belongs to a different AAD tenant (Microsoft internal tenant).
- **Solution**: 1) Customer cannot modify the default StorageAntimalwareSubscription - it is managed by Azure. 2) To filter additional event types: create a NEW event subscription on the storage account with desired event types and filters. 3) If default subscription is accidentally deleted, it auto-recreates when Defender for Cloud plan is disabled and re-enabled at resource level. 4) All event types except BlobCreated and BlobRenamed will be greyed out in the default subscription - this is by design.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**8. Unexpected role deletions observed in Activity Log at scope of storage accounts after enabling Defender for Storage**

- **Root Cause**: Expected behavior. Defender for Storage uses DefenderForStorageSecurityOperator service principal to manage role assignments for the data scanner. Depending on configuration, it may delete old role assignments to optimize count and avoid reaching tenant assignment capacity.
- **Solution**: Inform customer this is expected behavior - it does not affect other role assignments or Defender for Storage functionality. The deletion targets previous data scanner role assignments that are no longer needed. No action required.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**9. Blob or container not scanned by On-Upload Malware Scanning despite Defender for Storage being enabled**

- **Root Cause**: On-Upload Malware Scanning Filters are configured with exclusion rules (prefix/suffix/size) that match the blob. Filters use OR logic - blob is excluded if it matches ANY one criterion. Up to 24 filter values total. Filters only apply at storage account level (not subscription level).
- **Solution**: 1) Verify Defender for Storage and On-Upload Malware Scanning are enabled. 2) Check filter settings: Portal > SA > Microsoft Defender for Cloud > On-Upload filters. 3) Verify no exclusion rule matches the blob. 4) Kusto verification: cluster('dfsv2telemetryadx.westeurope').database('Snapshots').HourlyPolicyTableSnapshot_v1 | where StorageResourceId contains '<sa-name>' - check ExcludeBlobsWithPrefix/Suffix (URL-encoded), ExcludeBlobsLargerThan (-1 = not set). 5) Scan results: cluster('dfsv2telemetryadx.westeurope').database('ScanData').ScanResultsFromAllRegions_v1. Access: TM-ASC-DataProtection-READERS in CoreIdentity.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**10. Blob scanned by Defender for Storage despite matching On-Upload filter exclusion rules**

- **Root Cause**: Multiple causes: 1) On-Upload Filters not actually enabled on the storage account. 2) Blob was scanned via On-Demand Scanning (filters only apply to On-Upload). 3) Filter formatting issues: unintended whitespace after comma separators, filter values wrapped in quotes in the UI, storage account name included in prefix filter values (should start with container name).
- **Solution**: 1) Verify On-Upload Filters are enabled on the SA. 2) Check if blob was scanned on-demand: query ScanResultsFromAllRegions_v1 - scans without AggregatedScanId = on-upload, with AggregatedScanId = on-demand. 3) Verify filter formatting: no trailing spaces after commas, no quotes wrapping values, prefix format is container-name/blob-name (NOT storage-account/container/blob). 4) Suffix filters match only end of blob name. 5) Access: TM-ASC-DataProtection-READERS entitlement in CoreIdentity.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**11. Filtered On-Demand Scanning returns no results when targeting a directory in Azure Files using Exact match**

- **Root Cause**: Azure Files directories are not scanned directly - the service scans files only. Using Exact match on a directory name (e.g. dir) searches for a file literally named dir, which does not exist. The filtering feature (API version 2026-01-01-preview) supports Exact and Prefix match types for container/blob/share/file fields.
- **Solution**: Use Prefix matching with trailing slash to scan files within a directory: {"file": {"value": "dir/", "match": "Prefix"}}. For scanning specific containers/blobs: use container field with Exact match and blob field with Prefix match. If no filters provided, scan processes entire storage account. Filters can target blobs, files, or both - if only one type specified, only that type is scanned.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**12. Customer reports being charged for more GB than uploaded data in Defender for Storage malware scanning (e.g. uploaded x GB but charged for x+ GB)**

- **Root Cause**: Each commit/incremental update on a blob triggers a new on-upload malware scan. Files with multiple incremental updates are scanned repeatedly, each scan incurring cost based on blob size at that point.
- **Solution**: Use Kusto dashboard (Defender for Storage) to query ScanResultsFromAllRegions table with OnUploadScan==true to verify repeated scans on the same BlobUri. Show customer that incremental updates trigger new scans per documentation: https://learn.microsoft.com/en-us/azure/defender-for-cloud/on-upload-malware-scanning#on-upload-malware-scanning-flow
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**13. Customer asks about unexpected charges for Storage Blob Indexing, matching ingress/egress volumes, or high Storage Read Operations after enabling Defender for Storage malware scanning**

- **Root Cause**: By design: malware scanning creates additional storage operations (blob indexing for tag-based scanning, read operations for content analysis, data transfer between scanning infra and storage) as part of the scanning process.
- **Solution**: Refer customer to documentation on other costs associated with Storage malware scanning: https://learn.microsoft.com/en-us/azure/defender-for-cloud/introduction-malware-scanning#other-costs. These are expected Azure Storage charges, not Defender charges.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**14. Customer receives Defender for Storage alerts even though they turned off Defender for Storage**

- **Root Cause**: Defender for Storage can be enabled independently at the subscription level and at individual storage account level. The subscription-level setting automatically re-enables Defender for Storage on all storage accounts under it every few hours.
- **Solution**: To disable at subscription level: turn off the Storage accounts option in the Defender for Cloud Pricing tier. To keep it only on specific storage accounts: disable at subscription level first, then enable on individual accounts.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**15. Customer being swamped by noisy alerts from Defender for Storage**

- **Root Cause**: Alert throttling limits are per subscription per alert type per day. Customers owning many subscriptions may receive a large volume of alerts across all subscriptions.
- **Solution**: Use the Defender for Cloud Suppression feature (alerts-suppression-rules) to suppress alerts per subscription. Suppression rules can filter by specific alert types, IP addresses, or other criteria.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**16. Customer suspects Defender for Storage alert is false positive because storage account is not public**

- **Root Cause**: Customer confuses three distinct access concepts: (1) Unauthenticated/public access - no credentials required; (2) Anonymous access - uses SAS or account key, cannot be correlated to a specific user; (3) Restricted IP/VNet access via firewall. Alerts can trigger for anonymous access even on firewall-restricted accounts.
- **Solution**: Clarify the three access concepts with the customer. Ask what they mean by public and verify the actual access pattern. Anonymous SAS-based access on a firewall-restricted account can still trigger legitimate alerts.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**17. Customer not getting Defender for Storage alerts after enabling the service**

- **Root Cause**: Storage account events may not be processed by the Defender for Storage detection pipelines. The service may take up to 24 hours to be fully enabled on new resources.
- **Solution**: Check in Kusto if storage account events are being processed by the Defender for Storage service. Allow up to 24 hours for the setting to propagate to new resources.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**18. Advanced Threat Protection (ATP) in storage blade does not open or shows sad cloud icon in Azure portal**

- **Root Cause**: Storage ATP Resource Provider (RP) service may be experiencing issues with API success rate below 95%.
- **Solution**: First check if other portal blades open normally (broader portal issue). Then check Storage ATP RP service health via Jarvis. If API success rate is below 95%, escalate to TA about possible ICM.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**19. Compressed or embedded files do not trigger malware alerts in Defender for Storage**

- **Root Cause**: Malware alert based on hash reputation analysis cannot detect malware within compressed or embedded files.
- **Solution**: This is expected behavior and a known product limitation. Inform customer that hash-based detection does not scan inside archives or embedded files.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**20. Microsoft Defender for Cloud menu item is missing from Storage Account portal for certain regions**

- **Root Cause**: Defender for Storage ATP and Antimalware are region-aware features. Storage accounts in unsupported regions will not show the MDC menu item.
- **Solution**: Check the supported regions list for ATP and Antimalware. If the customer needs Defender for Storage in an unsupported region, submit a feature request via the Employee Self-Service Portal.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**21. Customer unable to send on-upload malware scan results to Event Grid even with correct Bicep code**

- **Root Cause**: The Event Grid custom topic must be in the same region as the storage account. Cross-region Event Grid topics are not supported for scan result forwarding.
- **Solution**: Ensure the Event Grid custom topic is created in the same region as the storage account. Verify the scanResultsEventGridTopicResourceId points to a custom topic in the matching region.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**22. Errors while sending on-upload malware scan results from Defender for Storage to Log Analytics workspace via Bicep**

- **Root Cause**: Sending on-upload malware scan results to Log Analytics using Bicep is currently not supported.
- **Solution**: Inform customer this is a known limitation. Refer to the feature request on the Employee Self-Service Portal. Use Event Grid as an alternative for scan result forwarding.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**23. Bicep deployment errors when enabling on-upload malware scan for Defender for Storage**

- **Root Cause**: The isEnabled field is placed after/outside the onUpload block instead of inside it. Incorrect field ordering in the Bicep template causes deployment validation failures.
- **Solution**: Place the isEnabled field inside the malwareScanning.onUpload block, before capGBPerMonth. Correct structure: malwareScanning: { onUpload: { isEnabled: true, capGBPerMonth: 1000 } }
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Customer wants to exclude a specific storage account from Microsoft Defender for Storage coverage | Once Defender for Storage is enabled at subscription level, all storage accounts are automaticall... | First confirm customer is on Per Transaction plan (UI shows New pricing plan available). Then: (1... | 🟢 8.5 | ADO Wiki |
| 2 | Malware not detected by Defender for Storage (old per-transaction plan) for files uploaded via SM... | The old Defender for Storage (Storage ATP) uses hash reputation analysis, not actual file scannin... | Inform customer that hash reputation analysis has protocol limitations on the legacy plan. Recomm... | 🟢 8.5 | ADO Wiki |
| 3 | Customer notices higher Defender for Storage billing charges after Storage ATP v2 update | Storage ATP v2 extended protection to Azure Files and Azure Data Lake Storage Gen2 (ADLS Gen2). T... | Use KQL billing query on RomeTelemetryData/RomeTelemetryProd BillingReportsRawArchive filtering b... | 🟢 8.5 | ADO Wiki |
| 4 | Customer asks why Defender for Storage malware scanning GB usage is higher than expected or asks ... | By design, modified files undergo a full rescan each time. Rescanning is triggered only by write ... | Inform customer this is expected behavior by design. To reduce scanning costs: (1) minimize unnec... | 🟢 8.5 | ADO Wiki |
| 5 | Malicious blob detected by Defender for Storage but not automatically deleted (Automated Response... | Three possible causes: 1) Automated Response feature not enabled under On-Upload Malware Scanning... | 1) Verify Defender for Storage On-Upload Malware Scanning is enabled AND Automated Response is en... | 🟢 8.5 | ADO Wiki |
| 6 | Cannot enable or configure Defender for Storage on Databricks managed storage account - access de... | Databricks managed storage accounts have a Deny Assignment that blocks Microsoft.Security/advance... | 1) Collaborate with Databricks team (SAP Azure/Databricks/Storage/Workspace managed storage) prov... | 🟢 8.5 | ADO Wiki |
| 7 | Error modifying Event Grid StorageAntimalwareSubscription: WebhookAadAppAccessCheckCategory - Sub... | The StorageAntimalwareSubscription is a system-managed Event Grid subscription tied to the Storag... | 1) Customer cannot modify the default StorageAntimalwareSubscription - it is managed by Azure. 2)... | 🟢 8.5 | ADO Wiki |
| 8 | Unexpected role deletions observed in Activity Log at scope of storage accounts after enabling De... | Expected behavior. Defender for Storage uses DefenderForStorageSecurityOperator service principal... | Inform customer this is expected behavior - it does not affect other role assignments or Defender... | 🟢 8.5 | ADO Wiki |
| 9 | Blob or container not scanned by On-Upload Malware Scanning despite Defender for Storage being en... | On-Upload Malware Scanning Filters are configured with exclusion rules (prefix/suffix/size) that ... | 1) Verify Defender for Storage and On-Upload Malware Scanning are enabled. 2) Check filter settin... | 🟢 8.5 | ADO Wiki |
| 10 | Blob scanned by Defender for Storage despite matching On-Upload filter exclusion rules | Multiple causes: 1) On-Upload Filters not actually enabled on the storage account. 2) Blob was sc... | 1) Verify On-Upload Filters are enabled on the SA. 2) Check if blob was scanned on-demand: query ... | 🟢 8.5 | ADO Wiki |
| 11 | Filtered On-Demand Scanning returns no results when targeting a directory in Azure Files using Ex... | Azure Files directories are not scanned directly - the service scans files only. Using Exact matc... | Use Prefix matching with trailing slash to scan files within a directory: {"file": {"value": "dir... | 🟢 8.5 | ADO Wiki |
| 12 | Customer reports being charged for more GB than uploaded data in Defender for Storage malware sca... | Each commit/incremental update on a blob triggers a new on-upload malware scan. Files with multip... | Use Kusto dashboard (Defender for Storage) to query ScanResultsFromAllRegions table with OnUpload... | 🟢 8.5 | ADO Wiki |
| 13 | Customer asks about unexpected charges for Storage Blob Indexing, matching ingress/egress volumes... | By design: malware scanning creates additional storage operations (blob indexing for tag-based sc... | Refer customer to documentation on other costs associated with Storage malware scanning: https://... | 🟢 8.5 | ADO Wiki |
| 14 | Customer receives Defender for Storage alerts even though they turned off Defender for Storage | Defender for Storage can be enabled independently at the subscription level and at individual sto... | To disable at subscription level: turn off the Storage accounts option in the Defender for Cloud ... | 🔵 5.5 | ADO Wiki |
| 15 | Customer being swamped by noisy alerts from Defender for Storage | Alert throttling limits are per subscription per alert type per day. Customers owning many subscr... | Use the Defender for Cloud Suppression feature (alerts-suppression-rules) to suppress alerts per ... | 🔵 5.5 | ADO Wiki |
| 16 | Customer suspects Defender for Storage alert is false positive because storage account is not public | Customer confuses three distinct access concepts: (1) Unauthenticated/public access - no credenti... | Clarify the three access concepts with the customer. Ask what they mean by public and verify the ... | 🔵 5.5 | ADO Wiki |
| 17 | Customer not getting Defender for Storage alerts after enabling the service | Storage account events may not be processed by the Defender for Storage detection pipelines. The ... | Check in Kusto if storage account events are being processed by the Defender for Storage service.... | 🔵 5.5 | ADO Wiki |
| 18 | Advanced Threat Protection (ATP) in storage blade does not open or shows sad cloud icon in Azure ... | Storage ATP Resource Provider (RP) service may be experiencing issues with API success rate below... | First check if other portal blades open normally (broader portal issue). Then check Storage ATP R... | 🔵 5.5 | ADO Wiki |
| 19 | Compressed or embedded files do not trigger malware alerts in Defender for Storage | Malware alert based on hash reputation analysis cannot detect malware within compressed or embedd... | This is expected behavior and a known product limitation. Inform customer that hash-based detecti... | 🔵 5.5 | ADO Wiki |
| 20 | Microsoft Defender for Cloud menu item is missing from Storage Account portal for certain regions | Defender for Storage ATP and Antimalware are region-aware features. Storage accounts in unsupport... | Check the supported regions list for ATP and Antimalware. If the customer needs Defender for Stor... | 🔵 5.5 | ADO Wiki |
| 21 | Customer unable to send on-upload malware scan results to Event Grid even with correct Bicep code | The Event Grid custom topic must be in the same region as the storage account. Cross-region Event... | Ensure the Event Grid custom topic is created in the same region as the storage account. Verify t... | 🔵 5.5 | ADO Wiki |
| 22 | Errors while sending on-upload malware scan results from Defender for Storage to Log Analytics wo... | Sending on-upload malware scan results to Log Analytics using Bicep is currently not supported. | Inform customer this is a known limitation. Refer to the feature request on the Employee Self-Ser... | 🔵 5.5 | ADO Wiki |
| 23 | Bicep deployment errors when enabling on-upload malware scan for Defender for Storage | The isEnabled field is placed after/outside the onUpload block instead of inside it. Incorrect fi... | Place the isEnabled field inside the malwareScanning.onUpload block, before capGBPerMonth. Correc... | 🔵 5.5 | ADO Wiki |
