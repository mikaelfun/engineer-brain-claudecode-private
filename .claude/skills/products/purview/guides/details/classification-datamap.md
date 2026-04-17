# Purview Data Map 分类标注 -- Comprehensive Troubleshooting Guide

**Entries**: 17 | **Drafts fused**: 6 | **Kusto queries fused**: 0
**Source drafts**: [ado-wiki-a-classification-insights.md](..\guides/drafts/ado-wiki-a-classification-insights.md), [ado-wiki-a-creating-custom-classifications.md](..\guides/drafts/ado-wiki-a-creating-custom-classifications.md), [ado-wiki-classification-kusto-query-bank.md](..\guides/drafts/ado-wiki-classification-kusto-query-bank.md), [ado-wiki-cri-subclassification.md](..\guides/drafts/ado-wiki-cri-subclassification.md), [ado-wiki-missing-classifications-on-asset.md](..\guides/drafts/ado-wiki-missing-classifications-on-asset.md), [ado-wiki-scan-performance-classification-rules.md](..\guides/drafts/ado-wiki-scan-performance-classification-rules.md)
**Generated**: 2026-04-07

---

## Troubleshooting Workflow

### Phase 1: Initial Diagnosis
> Sources: ado-wiki-a-creating-custom-classifications.md, ado-wiki-a-classification-insights.md

1. Classification Insights — Kusto Queries `[source: ado-wiki-a-classification-insights.md]`
2. Usage Notes `[source: ado-wiki-a-classification-insights.md]`
3. 1) Create Classifications `[source: ado-wiki-a-creating-custom-classifications.md]`
4. 2) Create Classification Rules `[source: ado-wiki-a-creating-custom-classifications.md]`
5. 3) Create Scan Rule Sets `[source: ado-wiki-a-creating-custom-classifications.md]`
6. 4) Create new Scan using Scan Rule Set `[source: ado-wiki-a-creating-custom-classifications.md]`
7. 5) Search the Data Catalog for all Sources using a classification `[source: ado-wiki-a-creating-custom-classifications.md]`
8. Classification Kusto Query Bank `[source: ado-wiki-classification-kusto-query-bank.md]`
9. Exception Classification & Analysis `[source: ado-wiki-classification-kusto-query-bank.md]`
10. Common Source Modules `[source: ado-wiki-classification-kusto-query-bank.md]`

### Phase 2: Data Collection (KQL)

```kusto
DataScanAgentEvent
| where env_time > ago(1d)
| where Message !contains "OpInfo:" and Message !contains "Sequence" and Message !contains "Processed " and Message !contains "Uri : "
| where Message !contains "(403) Forbidden"
| where Message contains "exception"
| summarize count() by Source
| order by count_ desc
```
`[tool: ado-wiki-classification-kusto-query-bank.md]`

```kusto
DataScanAgentEvent
| where env_time > ago(1d)
| where Message !contains "OpInfo:" and Message !contains "Sequence" and Message !contains "Processed " and Message !contains "Uri : "
| where Message !contains "(403) Forbidden"
| where Message contains "exception"
| where Source == "{ModuleName}"
| summarize count() by Message
| order by count_ desc
```
`[tool: ado-wiki-classification-kusto-query-bank.md]`

```kusto
// Purview TenantId = 25188
let StartTime = datetime(2021-01-01);
let indidents = (Incidents
| where CreateDate >= StartTime
| where OwningTenantId == 25188
| where IncidentType == "CustomerReported"
| where isnotempty(SupportTicketId)
| summarize argmax(Lens_IngestionTime, Status) by IncidentId
| where max_Lens_IngestionTime_Status == "RESOLVED"
| distinct IncidentId);
// Join with custom fields: IssueClass, CRIEscalationQuality, CRIClassification
// Validate classification consistency
```
`[tool: ado-wiki-cri-subclassification.md]`

```kusto
DataScanAgentLinuxEvent
| where * contains "[SCANRUNID]"  // RunID from UI
| where Message contains "OpInfo:"
| where Message !contains "\"IsLeafNode\":\"false\""
| where Message contains "ClassificationExample.csv"  // asset for which classification was expected
```
`[tool: ado-wiki-missing-classifications-on-asset.md]`

```kusto
cluster('azuredmprod.kusto.windows.net').database('AzureDataMovement').TraceGatewayLocalEventLog
| where * contains "[REPORTID]"  // ReportID from SHIR
| where Message contains "OpInfo:"
| where Message !contains "\"IsLeafNode\":\"false\""
| where Message contains "ClassificationExample.csv"
```
`[tool: ado-wiki-missing-classifications-on-asset.md]`

```kusto
DataScanAgentLinuxEvent
| where * contains "[SCANRUNID]"
| where * contains "ExceptionDetails: "
| where Source == "find"
```
`[tool: ado-wiki-missing-classifications-on-asset.md]`

```kusto
DataScanAgentLinuxEvent
| where * contains "[SCANRUNID]"
| where * contains "ExceptionDetails: "
| where Source == "ShufModule"
```
`[tool: ado-wiki-missing-classifications-on-asset.md]`

### Phase 3: Decision Logic

| Condition | Meaning | Action |
|-----------|---------|--------|
| Custom classification tags not applied after running scan - changes to classific... | Classification settings are retrieved when scan starts; chan... | Stop the current scan, update the classification rule, then start a new scan wit... |
| Classification missing on single asset (non-resource set) - system classificatio... | Column has fewer than 8 distinct values, which is the minimu... | Ensure column has at least 8 distinct values. Check classification best practice... |
| Deleted asset from data source still appears in Purview catalog with classificat... | Incremental scan only processes new/modified assets; deleted... | Ask customer to run a full scan (not incremental). Verify scan type by checking ... |
| MCE classification (e.g., US Driver's License) not applied or incorrectly classi... | MCE rules require specific contextual keywords AND proper fo... | Check MCE entity definitions (https://docs.microsoft.com/en-us/microsoft-365/com... |
| First Name, Last Name or other classification tags missing on columns in CSV res... | For resource set files, Purview only samples ~1% of files (e... | 1) Check OpInfo/EntityInfo using DataScanAgentEvent to see which files were samp... |
| Classification tags missing on asset despite data appearing to match classificat... | Classification thresholds not met. For structured data: MinS... | 1) Check OpInfo/EntityInfo for Tags and distinctCount values. 2) If Tags field m... |
| Classification tags missing from scanned asset; OpInfo not emitted for the asset... | Purview scan cannot access data source folders due to ACL/fi... | Query DataScanAgentLinuxEvent for exceptions in find module (Source == 'find'). ... |
| Oracle scan classification fails with ORA-00942 table or view does not exist whe... | Purview Oracle connector does not support cross-schema class... | Ensure username in scan credential matches the schema owner of the tables requir... |

`[conclusion: 🔵 7.0/10]`

---

## Known Issues Lookup

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Custom classification tags not applied after running scan - changes to classification rules made whi... | Classification settings are retrieved when scan starts; changes to custom classi... | Stop the current scan, update the classification rule, then start a new scan with the updated rules.... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Troubleshooting%20Guides%20(TSGs)/Classification%20and%20sensitivity%20labels/Applying%20Custom%20classification%20rules%20to%20successful%20scans/Custom%20classification%20not%20showing%20correct%20tags) |
| 2 | Classification missing on single asset (non-resource set) - system classification not applied even t... | Column has fewer than 8 distinct values, which is the minimum required for syste... | Ensure column has at least 8 distinct values. Check classification best practices at https://learn.m... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Troubleshooting%20Guides%20(TSGs)/Classification%20and%20sensitivity%20labels/Classification%20is%20missing%20or%20incorrect%20in%20single%20asset%20(non-resource%20set%20asset)) |
| 3 | Deleted asset from data source still appears in Purview catalog with classifications after scan comp... | Incremental scan only processes new/modified assets; deleted assets are not remo... | Ask customer to run a full scan (not incremental). Verify scan type by checking OpInfo/EntityInfo fo... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Troubleshooting%20Guides%20(TSGs)/Classification%20and%20sensitivity%20labels/Deleting%20or%20removing%20a%20Classification/Deleted%20classification%20still%20available%20on%20an%20asset) |
| 4 | MCE classification (e.g., US Driver's License) not applied or incorrectly classified on data | MCE rules require specific contextual keywords AND proper formatting. For exampl... | Check MCE entity definitions (https://docs.microsoft.com/en-us/microsoft-365/compliance/sensitive-in... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Troubleshooting%20Guides%20(TSGs)/Classification%20and%20sensitivity%20labels/Incorrect%20classification%20insights%20report) |
| 5 | First Name, Last Name or other classification tags missing on columns in CSV resource set files afte... | For resource set files, Purview only samples ~1% of files (e.g., 10 out of 1000)... | 1) Check OpInfo/EntityInfo using DataScanAgentEvent to see which files were sampled and column disti... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Troubleshooting%20Guides%20(TSGs)/Classification%20and%20sensitivity%20labels/Missing%20or%20incorrectly%20classified%20assets/Missing%20classification%20for%20columns%20in%20CSV%20files) |
| 6 | Classification tags missing on asset despite data appearing to match classification rules (threshold... | Classification thresholds not met. For structured data: MinSamples=8 distinct va... | 1) Check OpInfo/EntityInfo for Tags and distinctCount values. 2) If Tags field missing → first three... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Troubleshooting%20Guides%20(TSGs)/Classification%20and%20sensitivity%20labels/Missing%20or%20incorrectly%20classified%20assets/Missing%20classification%20of%20assets%20due%20to%20low%20threshold%20values) |
| 7 | Classification tags missing from scanned asset; OpInfo not emitted for the asset in DataScanAgentLin... | Purview scan cannot access data source folders due to ACL/firewall restrictions,... | Query DataScanAgentLinuxEvent for exceptions in find module (Source == 'find'). If 403 errors found,... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Troubleshooting%20Guides%20(TSGs)/Classification%20and%20sensitivity%20labels/Missing%20or%20incorrectly%20classified%20assets/Missing%20classifications%20on%20an%20asset) |
| 8 | Oracle scan classification fails with ORA-00942 table or view does not exist when scanning tables ow... | Purview Oracle connector does not support cross-schema classification. User A in... | Ensure username in scan credential matches the schema owner of the tables requiring classification. ... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Troubleshooting%20Guides%20(TSGs)/Classification%20and%20sensitivity%20labels/Oracle%20-%20Cross%20schema%20classification%20failure) |
| 9 | Manual edits to asset (description, glossary term, classification) in Purview Governance Portal are ... | By design, manual changes made in Edit Asset screen cannot coexist with subseque... | Known limitation. For bulk edit issues see sub-pages. Enhancement planned to allow manual descriptio... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Troubleshooting%20Guides%20(TSGs)/Data%20Map%20Assets/Editing%20Assets) |
| 10 | Classifications missing on schema for delimited file types (CSV/TSV/SSV/PSV) or Parquet file assets;... | File asset reported by both Scan and ADF. Scan reports schema to _tabular_schema... | Request enabling _attachedSchema_ feature via IcM (title: [HierarchicalSchema Enabling] for Account ... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTroubleshooting%20Guides%20(TSGs)%2FScanning%2FMissing%20classification%20on%20schema) |
| 11 | Oracle classification requires Table Owner privilege; customer wants to classify without owner role | Oracle classification prerequisites mandate Table Owner privilege for classifica... | Cannot lower required permissions for Oracle classification. Owner role required. Feature request FR... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FKnown%20Issues%2F2025%20Jan%20FR%20Known%20Issues) |
| 12 | Purview scanner captures top-level JSON fields but does not recognize nested JSON fields/objects dur... | Purview scanner does not fully parse nested JSON structures; schema recognition ... | No workaround. Nested JSON fields will not be captured as columns. Feature request FR 2813 logged. | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FKnown%20Issues%2F2025%20Jan%20FR%20Known%20Issues) |
| 13 | System classification not applied to columns in Resource Set despite scan completing successfully. | System classification rules require at least 8 distinct values per column. If co... | Check classification prerequisites at https://learn.microsoft.com/en-us/azure/purview/concept-best-p... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FData%20Map%2FResource%20Set%2FClassification%20is%20missing%20or%20incorrect%20in%20Resource%20Set) |
| 14 | After enabling new schema feature for delimited/parquet files in Purview, user-defined content (clas... | New feature changes schema structure: nested JSON displayed in separate panel, v... | Run the Java migration program azurepurviewschemamigration_v1.jar provided by Microsoft Support. Pre... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FData%20Map%2FSDK%20and%20API%2FMigrating%20User%20Defined%20Content%20for%20Asset%20Schema) |
| 15 | Manually edited asset in Purview (description, classification, glossary term) is not updated by subs... | By design — once an asset is manually edited, subsequent scans will not overwrit... | Inform customer this is by design. Scans preserve manually-set description, glossary term, and class... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FData%20Map%2FSDK%20and%20API%2FDeleting%20assets%20From%20the%20UI%20or%20using%20REST%20API) |
| 16 | Manually edited asset not updated by subsequent scan runs | By design - scans do not overwrite manual changes but can add new classification... | Inform customer this is by design. | 🔵 7.0 | ado-wiki |
| 17 | MIP Scanner cannot scan .msg files with signed PDFs, files matching Trainable Classifiers or EDM SIT... | Known limitations: .msg with signed PDFs unsupported; Trainable/EDM classifiers ... | No workaround for signed PDFs in .msg. For EDM/Trainable SITs use server-side auto-labeling in Excha... | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/troubleshoot/microsoft-365/purview/sensitivity-labels/known-issues-ip-client) |