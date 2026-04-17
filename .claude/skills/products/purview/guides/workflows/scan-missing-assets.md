# Purview 扫描后资产丢失 — 排查工作流

**来源草稿**: `ado-wiki-a-convertedentities-scan-log-queries.md`, `ado-wiki-activity-explorer-search-audit-log-missing-event.md`, `ado-wiki-label-missing-on-asset.md`, `ado-wiki-missing-assets-diagnostic.md`
**Kusto 引用**: 无
**场景数**: 31
**生成日期**: 2026-04-07

---

## Scenario 1: Background
> 来源: ado-wiki-a-convertedentities-scan-log-queries.md | 适用: 未标注

### 排查步骤
The OpInfo structure has been removed from Purview scan logs. The keyword "OpInfo" is no longer available in logs. Use "ConvertedEntities" instead to check information like samplingLabel, isLeafNode, qualifiedName etc.

"ConvertedEntities" keyword has existed from the beginning, so use "ConvertedEntities" keyword instead of "OpInfo".

**The functionality is the same between "OpInfo" and "ConvertedEntities":**
1. Each asset will emit an entity - "convertedEntities"
2. For an incremental scan, "convertedEntities" will be emitted only for new assets/modified assets since last scan
3. For a full scan, all assets in data source are classified and "convertedEntities" emitted

`[来源: ado-wiki-a-convertedentities-scan-log-queries.md]`

---

## Scenario 2: Timeline by data source regions for "OpInfo" keyword removal
> 来源: ado-wiki-a-convertedentities-scan-log-queries.md | 适用: 未标注

### 排查步骤
| Regions | Date |
|--|--|
| Dogfood | 2022/7/18 |
| EUS2EUAP | 2022/9/8 |
| WestCentralUS | 2023/3/21 |
| SouthEastAsia | 2023/3/28 |
| EastUS | 2023/4/3 |
| NorthEurope | 2023/4/10 |
| JapanEast | 2023/4/10 |
| SouthAfricaNorth | 2023/4/10 |
| AustraliaEast | 2023/4/10 |
| CanadaCentral | 2023/4/10 |
| EastUS2 | 2023/4/10 |
| CentralIndia | 2023/5/11 |
| FranceCentral | 2023/5/11 |
| WestUS2 | 2023/5/11 |
| EastAsia | 2023/5/11 |
| KoreaCentral | 2023/5/11 |
| NorthCentralUS | 2023/5/11 |
| BrazilSouth | 2023/6/12 |
| WestUS | 2023/6/12 |
| SouthCentralUS | 2023/6/12 |
| UKSouth | 2023/6/12 |
| WestEurope | 2023/6/12 |
| AustraliaSouthEast | 2023/6/12 |
| CentralUS | 2023/6/12 |
| UaeNorth | 2023/6/12 |
| SwitzerlandNorth | 2023/6/12 |
| GermanyWestCentral | 2023/6/12 |
| WestUS3 | 2023/6/12 |

`[来源: ado-wiki-a-convertedentities-scan-log-queries.md]`

---

## Scenario 3: 1. Checking a certain file
> 来源: ado-wiki-a-convertedentities-scan-log-queries.md | 适用: 未标注

### 排查步骤
```kql
DataScanAgentLinuxEvent
| where * contains "<RunID>"  // RunID from UI
| where Message startswith "convertedEntities:"
| where Message contains "\"isLeafNode\":\"true\""
| where Message contains "<FileName>"  // Target file/asset
```

`[来源: ado-wiki-a-convertedentities-scan-log-queries.md]`

---

## Scenario 4: 2. Checking a certain folder
> 来源: ado-wiki-a-convertedentities-scan-log-queries.md | 适用: 未标注

### 排查步骤
```kql
DataScanAgentLinuxEvent
| where * contains "<RunID>"  // RunID from UI
| where Message startswith "convertedEntities:"
| where Message contains "\"isLeafNode\":\"false\""
| where Message contains "<FolderURL>"  // Target folder
```

`[来源: ado-wiki-a-convertedentities-scan-log-queries.md]`

---

## Scenario 5: 3. Checking classification tag and confidence for columns
> 来源: ado-wiki-a-convertedentities-scan-log-queries.md | 适用: 未标注

### 排查步骤
Look in the "referredEntities" section for:
- `qualifiedName` - URL of the data source
- Classification details with confidence level and type name (e.g., `MICROSOFT.FINANCIAL.US.ABA_ROUTING_NUMBER`)
- `sourceDetails` for MCE confidence levels, rule descriptions, sample counts

`[来源: ado-wiki-a-convertedentities-scan-log-queries.md]`

---

## Scenario 6: 4. Checking if entity has schema
> 来源: ado-wiki-a-convertedentities-scan-log-queries.md | 适用: 未标注

### 排查步骤
In the "referredEntities" section, look for `"typeName": "column"` entries to verify schema presence.

`[来源: ado-wiki-a-convertedentities-scan-log-queries.md]`

---

## Scenario 7: 5. Checking entity label
> 来源: ado-wiki-a-convertedentities-scan-log-queries.md | 适用: 未标注

### 排查步骤
In the entity section, look for the `samplingLabel` attribute (e.g., `"samplingLabel": "classify"`).

`[来源: ado-wiki-a-convertedentities-scan-log-queries.md]`

---

## Scenario 8: Introduction
> 来源: ado-wiki-activity-explorer-search-audit-log-missing-event.md | 适用: 未标注

### 排查步骤
When an event is missing from Activity Explorer, search the Audit log to verify whether the underlying audit event exists. Activity Explorer events are based on audit log data.

`[来源: ado-wiki-activity-explorer-search-audit-log-missing-event.md]`

---

## Scenario 9: Step 1: Connect to Exchange Online PowerShell or open Audit log in Purview portal
> 来源: ado-wiki-activity-explorer-search-audit-log-missing-event.md | 适用: 未标注

### 排查步骤
Use the correct Activity and Workload filters to search for the relevant audit log entry:

- For missing events, use `Search-UnifiedAuditLog` with appropriate `-Operations` and `-RecordType` parameters
- Match the date range, user, and operation type to what should have triggered the Activity Explorer event
- If the audit log entry exists but Activity Explorer does not show it, there may be a sync delay or filtering issue
- If the audit log entry does not exist, the source activity was not audited

`[来源: ado-wiki-activity-explorer-search-audit-log-missing-event.md]`

---

## Scenario 10: Label is Missing on an Asset
> 来源: ado-wiki-label-missing-on-asset.md | 适用: 未标注

### 排查步骤
Author Tiffany Fischer and Travis Grenell
Author Rahul Pyne (MIPS contributor)

`[来源: ado-wiki-label-missing-on-asset.md]`

---

## Scenario 11: Process Flow
> 来源: ado-wiki-label-missing-on-asset.md | 适用: 未标注

### 排查步骤
Scan checks first for Classification and gets meta data. Then catalog will check if file has been updated to see if needs a new event for downstream events such as Middle Tier Service handles label service or offline system. After Middle tier receives events it will process the classification and make a call to MIP to return the label. MIPS checks the label policy and returns matching label and sensitivity and update the catalog through the ingestion team. Ingestion will attach the Label at the Catalog level.

`[来源: ado-wiki-label-missing-on-asset.md]`

---

## Scenario 12: Supported Data Sources & Limitations
> 来源: ado-wiki-label-missing-on-asset.md | 适用: 未标注

### 排查步骤
[Check Supported Data Sources & Limitations GUIDE](https://docs.microsoft.com/en-us/azure/purview/create-sensitivity-label#supported-data-sources)

`[来源: ado-wiki-label-missing-on-asset.md]`

---

## Scenario 13: Gather Information
> 来源: ado-wiki-label-missing-on-asset.md | 适用: 未标注

### 排查步骤
- Scan Run ID (from a run after labels were published)
- Report Id if using SHIR
- Asset FQN & Column Expecting Label
- Label Name Missing
- Sample asset file or top 128 rows of column
- Screenshot of the Overview page of the asset (capture the entire Overview page)
- Confirm the classification is correctly assigned
- Screenshots of all pages of the Label config
- Screenshots of all pages of the Label Policy config
- Screenshots of all pages of the Label Publishing config

`[来源: ado-wiki-label-missing-on-asset.md]`

---

## Scenario 14: Verify Permissions
> 来源: ado-wiki-label-missing-on-asset.md | 适用: 未标注

### 排查步骤
Ensure that the customer's Purview Account has the required permissions to call MIPs SDK APIs. This is controlled by the admin of the customer's tenant. Refer to: [Required Permissions](https://learn.microsoft.com/en-us/purview/get-started-with-sensitivity-labels#permissions-required-to-create-and-manage-sensitivity-labels)

`[来源: ado-wiki-label-missing-on-asset.md]`

---

## Scenario 15: Purview Label Service Logs
> 来源: ado-wiki-label-missing-on-asset.md | 适用: 未标注

### 排查步骤
Follow the [LabelService Logs and Debugging TSG](https://supportability.visualstudio.com/Azure%20Purview/_wiki/wikis/Microsoft%20Purview/1083914/Purview-LabelService-Logs-and-Debugging) to identify if the issue is due to MIPs or Purview Label Service.

`[来源: ado-wiki-label-missing-on-asset.md]`

---

## Scenario 16: MIPs TSGs
> 来源: ado-wiki-label-missing-on-asset.md | 适用: 未标注

### 排查步骤
- [Understanding Purview and MIP Support boundaries](https://dev.azure.com/Supportability/Modern%20Workplace/_wiki/wikis/Modern%20Workplace/377941/AIP-and-MIP-Support-Boundaries)
- [Auto Labeling Support TSG and Template](https://o365exchange.visualstudio.com/IP%20Engineering/_wiki/wikis/IP%20Engineering.wiki/157733/Auto-Labeling-Support-TSG-and-Template)
- [MIP Labels : Support TSG](https://o365exchange.visualstudio.com/IP%20Engineering/_wiki/wikis/IP%20Engineering.wiki/23865/MIP-Labels-Support-TSG)
- [MIP Debugging/Logs](https://supportability.visualstudio.com/Azure%20Purview/_wiki/wikis/Microsoft%20Purview/1083914/Purview-LabelService-Logs-and-Debugging)

`[来源: ado-wiki-label-missing-on-asset.md]`

---

## Scenario 17: Confirm Label Configuration Checklist
> 来源: ado-wiki-label-missing-on-asset.md | 适用: 未标注

### 排查步骤
1. **License Requirements**: Must have at least one M365 license in same AAD tenant. Required licenses: M365 E5/A5/G5, M365 E5/A5/G5 Compliance, M365 E5/A5/G5 Information Protection and Governance, Office 365 E5 + EMS E5/A5/G5 + AIP Plan 2.

2. **Consent is turned on**: [Consent Guide](https://docs.microsoft.com/en-us/azure/purview/how-to-automatically-label-your-content#step-2-consent-to-use-sensitivity-labels-in-azure-purview)

3. **Auto-Apply enabled**: If not set to automatically apply, labels will not be applied. [Auto-labeling for files](https://docs.microsoft.com/en-us/azure/purview/how-to-automatically-label-your-content#autolabeling-for-files)

4. **Labels Published**: If not published, labels will not apply. It can take up to 24 hours to publish. [Publish Labels](https://docs.microsoft.com/en-us/azure/purview/how-to-automatically-label-your-content#step-4-publish-labels)

5. **NOT a parent label**: If there are child labels, the parent label is NOT applied; configure child labels instead.

6. **NOT using custom SITs**: Only system-created Sensitive Information Types work with auto-labeling for schematized data assets. Custom SITs are NOT supported.

7. **No encryption/DKE**: Labels must NOT apply encryption controls or use Double Key Encryption.

8. **Label Policy scoped to All**: Publishing must be scoped to All users - labels scoped to specific users/groups will not apply.

9. **Labels imported to Governance Portal**: Check if label appears for manual application. Test: create a basic label with few settings, publish, wait, check if it shows in Governance portal.

10. **Valid keywords**: Check compliance docs for valid keywords for the specific label type.

11. **Supported values**: Check compliance docs for supported value patterns.

12. **Test file**: Upload test file in Compliance portal to confirm match.

`[来源: ado-wiki-label-missing-on-asset.md]`

---

## Scenario 18: Label Distribution Check
> 来源: ado-wiki-label-missing-on-asset.md | 适用: 未标注

### 排查步骤
```powershell
Connect-IPPSSession -UserPrincipalName cx_email@cx_domain.cx_ext
Get-LabelPolicy -Identity NameOfLabelPolicy | Select Name, Distr*
```

If distribution was successful but label still not applied → Governance PG involvement needed.
If not successful → Compliance team involvement needed.

`[来源: ado-wiki-label-missing-on-asset.md]`

---

## Scenario 19: Communicating with Compliance Team
> 来源: ado-wiki-label-missing-on-asset.md | 适用: 未标注

### 排查步骤
Key points:
1. Purview Governance uses Classifications (not SITs used by Information Protection)
2. The classification engine is a text extractor, different from what AIP uses
3. Classification occurs first, then label is applied. If not classified → likely config issue on Information Protection side. If classified but not labeled → check common issues above.

`[来源: ado-wiki-label-missing-on-asset.md]`

---

## Scenario 20: Get Consent Confirmation
> 来源: ado-wiki-label-missing-on-asset.md | 适用: 未标注

### 排查步骤
[Online TSG](https://learn.microsoft.com/en-us/azure/purview/sensitivity-labels-frequently-asked-questions#how-can-i-determine-if-consent-has-been-granted-to-extend-labeling-to-the-microsoft-purview-data-map)

`[来源: ado-wiki-label-missing-on-asset.md]`

---

## Scenario 21: Get Label Policy XML
> 来源: ado-wiki-label-missing-on-asset.md | 适用: 未标注

### 排查步骤
Steps to get specific policy and label information:
```powershell
Connect-IPPSSession -UserPrincipalName [global admin or compliance admin email]

`[来源: ado-wiki-label-missing-on-asset.md]`

---

## Scenario 22: Get Specific Label Information
> 来源: ado-wiki-label-missing-on-asset.md | 适用: 未标注

### 排查步骤
get-Label "LABELNAME" | Select-Object -Property * -ExcludeProperty SerializationData | ConvertTo-Json -Depth 100 > label.txt

`[来源: ado-wiki-label-missing-on-asset.md]`

---

## Scenario 23: Get Specific Policy Information
> 来源: ado-wiki-label-missing-on-asset.md | 适用: 未标注

### 排查步骤
get-LabelPolicy "POLICYNAME" | Select-Object -Property * -ExcludeProperty SerializationData | ConvertTo-Json -Depth 100 > labelPolicy.txt
```

`[来源: ado-wiki-label-missing-on-asset.md]`

---

## Scenario 24: SCC Status & Failures
> 来源: ado-wiki-label-missing-on-asset.md | 适用: 未标注

### 排查步骤
Use the [SCC Tool](https://supportability.visualstudio.com/Azure%20Purview/_wiki/wikis/Microsoft%20Purview/912762/Check-for-Network-Issues-for-SCC-Service) to check for SCC status and failures. Issues can be provided to Data Azure Security Compliance Center (SCC) Team: sccsupport@microsoft.com

`[来源: ado-wiki-label-missing-on-asset.md]`

---

## Scenario 25: SCC SAP
> 来源: ado-wiki-label-missing-on-asset.md | 适用: 未标注

### 排查步骤
Product Family: Office Products → Product Name: Microsoft Purview Compliance → Category: Labels

`[来源: ado-wiki-label-missing-on-asset.md]`

---

## Scenario 26: Missing Assets Diagnostic Guide
> 来源: ado-wiki-missing-assets-diagnostic.md | 适用: 未标注

### 排查步骤
Asset or classification missing is a broad issue which might be caused by several causes:

- Scan didn't emit the assets or classifications
- The assets or classifications were lost/dropped before sending to Hot tier
- Ingest request failed leading assets or classifications not ingested
- Customer modified the assets where scan won't override the asset anymore
- Check if the issue still repros after clicking refresh or F5 browser reload
- The assets are deleted by offline tier after successfully ingested into the catalog

`[来源: ado-wiki-missing-assets-diagnostic.md]`

---

## Scenario 27: Step 1: Check Scan Emission
> 来源: ado-wiki-missing-assets-diagnostic.md | 适用: 未标注

### 排查步骤
Get the scan id from the customer, then check if the entity has schema (No schema = no detection):

**NOTE:** "OpInfo" is being replaced by "Entity info" — check the timeline for which keyword to use.

```kql
DataScanAgentEvent
| where ScanResultId == "<Scan Run Id>"
| where Message contains "OpInfo"
| where Message contains "<URI or Part of URI>"
| where Message !contains "Schema\":[]"
| project Message
```

For multi-cloud resources (Multi cloud DB):

```kql
let pipelineId = MultiCloudIRLog
| where Message contains "<RunId from UI>" and Message contains "PipelineId"
| extend parsedMessage = parse_json(Message)
| extend PipelineId = parsedMessage["PipelineId"]
| project tostring(PipelineId);
MultiCloudDataScanLog
| join kind = inner(pipelineId) on $left.CorrelationId == $right.PipelineId
| where Message contains "OpInfo"
| where Message contains "<URI or Part of URI>"
| where Message !contains "Schema\":[]"
| project Message
```

`[来源: ado-wiki-missing-assets-diagnostic.md]`

---

## Scenario 28: Step 2: Check Hot Tier Delivery
> 来源: ado-wiki-missing-assets-diagnostic.md | 适用: 未标注

### 排查步骤
Assets may be lost/dropped before sending to Hot Tier. Get traceId from scan run id (activityId + pipelineId → traceId).

```kql
OnlineTierDetails
| where RequestId == "{traceId}"
and Msg has "<some keyword>"
```

If no logs found → go back to Step 1 (scan didn't emit). Compare payload from HT logs with OpInfo to check if assets were dropped.

`[来源: ado-wiki-missing-assets-diagnostic.md]`

---

## Scenario 29: Step 3: Check Ingest Failures
> 来源: ado-wiki-missing-assets-diagnostic.md | 适用: 未标注

### 排查步骤
```kql
OfflineTierWarmPathAgentLogs
| where TraceId contains "{traceId}"
| where Message contains "resources processed"
```

If resources failed ("0 resources processed, X resources failed while importing"), check detailed errors:

```kql
OnlineTierWebRequests
| where RequestId == "{traceId}"
| where RequestUrl == "/api/atlas/v2/entity/bulk"
```

For detailed error logs:

```kql
OnlineTierDetails
| where RequestId == "{traceId}"
```

Filter "Level" column by "ERROR". Common errors: operation timeout, transient network failure, CatalogServiceException.

**SME: Charles Shen** for deep investigation.

`[来源: ado-wiki-missing-assets-diagnostic.md]`

---

## Scenario 30: Step 4: Customer-Modified Assets
> 来源: ado-wiki-missing-assets-diagnostic.md | 适用: 未标注

### 排查步骤
Per Apache Atlas behavior (section 2.5.3): If a user makes any changes to a schema, Data Scan can never change it. Changing a name, field classification, or description makes the entire schema definitive (confidence == 1). This is **by design**.

Contact **SME Charles Shen** to check if asset was user-modified using the asset FQN.

`[来源: ado-wiki-missing-assets-diagnostic.md]`

---

## Scenario 31: Step 5: Search for Deletion Logs (PBI Scan Example)
> 来源: ado-wiki-missing-assets-diagnostic.md | 适用: 未标注

### 排查步骤
1. Search scan-to-Data-Map logs using entity qualified name:

```kql
OnlineTierDetails
| where Msg contains "<entity-qualified-name>" and strlen(RequestId) > 36
```

2. Get related entity GUIDs from relationship 409 responses or creation logs

3. Search deletion logs using GUIDs:

```kql
OnlineTierDetails
| where Msg contains "<entity-guid>"
```

4. Share findings and request IDs to offline tier for further investigation

**Sample IcM**: Incident 212699017 - Missing reports and datasets from PBI Scan

`[来源: ado-wiki-missing-assets-diagnostic.md]`

---
