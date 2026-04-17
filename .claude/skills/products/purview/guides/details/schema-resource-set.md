# Purview Schema 与资源集 -- Comprehensive Troubleshooting Guide

**Entries**: 13 | **Drafts fused**: 2 | **Kusto queries fused**: 0
**Source drafts**: [ado-wiki-check-ars-enabled.md](..\guides/drafts/ado-wiki-check-ars-enabled.md), [ado-wiki-custom-tables-schema-lineage.md](..\guides/drafts/ado-wiki-custom-tables-schema-lineage.md)
**Generated**: 2026-04-07

---

## Troubleshooting Workflow

### Phase 1: Initial Diagnosis
> Sources: ado-wiki-check-ars-enabled.md, ado-wiki-custom-tables-schema-lineage.md

1. How to check if ARS (Advanced Resource Sets) are enabled for an account `[source: ado-wiki-check-ars-enabled.md]`
2. Kusto Query `[source: ado-wiki-check-ars-enabled.md]`
3. Interpretation `[source: ado-wiki-check-ars-enabled.md]`
4. Create Custom Tables with Schema Tab and Lineage in Data Map `[source: ado-wiki-custom-tables-schema-lineage.md]`
5. Create custom table type definition and table instances `[source: ado-wiki-custom-tables-schema-lineage.md]`
6. Create custom column type definition and column instances `[source: ado-wiki-custom-tables-schema-lineage.md]`
7. Define and create the schema relationship (attach columns to tables) `[source: ado-wiki-custom-tables-schema-lineage.md]`
8. Establish lineage between custom tables `[source: ado-wiki-custom-tables-schema-lineage.md]`
9. 1. Create Table Type Definition `[source: ado-wiki-custom-tables-schema-lineage.md]`
10. 2. Create Column Type Definition `[source: ado-wiki-custom-tables-schema-lineage.md]`

### Phase 2: Data Collection (KQL)

```kusto
PipelineManagerLogEvent  
| where CatalogId == "<catalog-id>"
| where Message contains "ARS Setting"
| project TIMESTAMP, Message  
| order by TIMESTAMP desc
```
`[tool: ado-wiki-check-ars-enabled.md]`

### Phase 3: Decision Logic

| Condition | Meaning | Action |
|-----------|---------|--------|
| When trying to add data assets to a data product, request fails with status code... | Table schema contains forbidden characters such as newline, ... | Edit the schema in Data Map to remove the forbidden/non-printable characters fro... |
| Purview scanning captures top-level JSON fields but does not recognize nested fi... | By design limitation. Purview scanner primarily extracts top... | No workaround available. Purview does not traverse nested JSON objects during sc... |
| Advanced Resource Set (ARS) is all-or-none at account level. Cannot configure pe... | ARS setting applies globally; per-source control not impleme... | Consider custom entities via connector as alternative. FR-2848. |
| Schema of an asset is missing after successful scan due to sampling failure. Pur... | Purview samples 128 rows per column during scan. If the unde... | 1) Verify the data files referenced by the source exist and are accessible. 2) I... |
| Asset schema or entire table missing from Purview catalog after scan due to enti... | Purview has hard limits: 1MB max payload, 800 columns max, 7... | 1) Check if asset has too many columns (>800) or large schema. 2) Short-term PG ... |
| Classification is missing or incorrect for assets in a Resource Set. Schema not ... | Advanced Resource Sets (ARS) is toggled off. Without ARS ena... | Check ARS status via: ScanningLog / where ScanResultId == "<id>" / where Message... |
| Resource Set details, pattern rules, and aggregation are not visible in Purview ... | Advanced Resource Set feature must be explicitly enabled by ... | Turn on "Advanced Resource Set" toggle in Purview account settings. Note: ARS in... |
| Schema is missing or incorrect in Resource Set after scan. Resource Set asset sh... | Multiple possible causes: (1) ARS not enabled, (2) Scan agen... | Step-by-step diagnosis: (1) Verify ARS is on. (2) Check scan agent errors: DataS... |

`[conclusion: 🔵 7.0/10]`

---

## Known Issues Lookup

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | When trying to add data assets to a data product, request fails with status code 400 and error messa... | Table schema contains forbidden characters such as newline, tab, only whitespace... | Edit the schema in Data Map to remove the forbidden/non-printable characters from column names. | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FApps%20-%20Data%20Governance%2FTroubleshooting%20Guides%2FData%20Products%2FPrerequisites%20and%20handling%20errors%20in%20Data%20Product) |
| 2 | Purview scanning captures top-level JSON fields but does not recognize nested fields/objects during ... | By design limitation. Purview scanner primarily extracts top-level JSON fields b... | No workaround available. Purview does not traverse nested JSON objects during schema recognition. Fe... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FKnown%20Issues%2F2025%20Feb%20FR%20Known%20Issues) |
| 3 | Advanced Resource Set (ARS) is all-or-none at account level. Cannot configure per data source. | ARS setting applies globally; per-source control not implemented. | Consider custom entities via connector as alternative. FR-2848. | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FKnown%20Issues%2F2025%20Feb%20FR%20Known%20Issues) |
| 4 | Schema of an asset is missing after successful scan due to sampling failure. Purview attempts to sam... | Purview samples 128 rows per column during scan. If the underlying data source i... | 1) Verify the data files referenced by the source exist and are accessible. 2) If data files are mis... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/[New wiki structure]Purview Data Governance/Troubleshooting Guides (TSGs)/Data Map/Asset Schema is missing or incorrect/Schema is missing or incorrect in single assets (Non-Resource Set)) |
| 5 | Asset schema or entire table missing from Purview catalog after scan due to entity payload exceeding... | Purview has hard limits: 1MB max payload, 800 columns max, 700k+ characters. Whe... | 1) Check if asset has too many columns (>800) or large schema. 2) Short-term PG fix: truncate schema... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/[New wiki structure]Purview Data Governance/Troubleshooting Guides (TSGs)/Data Map/Asset Schema is missing or incorrect/Schema is missing or incorrect in single assets (Non-Resource Set)) |
| 6 | Classification is missing or incorrect for assets in a Resource Set. Schema not updated after scan. | Advanced Resource Sets (ARS) is toggled off. Without ARS enabled, schema will no... | Check ARS status via: ScanningLog / where ScanResultId == "<id>" / where Message contains "CustomPro... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FData%20Map%2FResource%20Set%2FClassification%20is%20missing%20or%20incorrect%20in%20Resource%20Set) |
| 7 | Resource Set details, pattern rules, and aggregation are not visible in Purview Governance Portal. | Advanced Resource Set feature must be explicitly enabled by customer. For accoun... | Turn on "Advanced Resource Set" toggle in Purview account settings. Note: ARS incurs additional comp... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FData%20Map%2FResource%20Set%2FResource%20Set%20Changes) |
| 8 | Schema is missing or incorrect in Resource Set after scan. Resource Set asset shows wrong or no colu... | Multiple possible causes: (1) ARS not enabled, (2) Scan agent encountered errors... | Step-by-step diagnosis: (1) Verify ARS is on. (2) Check scan agent errors: DataScanAgentLinuxEvent (... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FData%20Map%2FResource%20Set%2FSchema%20is%20missing%20or%20incorrect%20in%20Resource%20Set) |
| 9 | Scan fails to read file schema with error about unsupported Parquet column type (e.g., non-primitive... | The scanned file (e.g., Parquet) contains columns with non-primitive or unsuppor... | Check scan agent error logs: DataScanAgentLinuxEvent / where ScanResultId == "<id>" / where Message ... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FData%20Map%2FResource%20Set%2FSchema%20is%20missing%20or%20incorrect%20in%20Resource%20Set) |
| 10 | Schema tab missing for Resource sets when scanning parquet files using Azure IR or Managed VNET IR (... | Mismatched log4j-api on classpath causes NoSuchMethodError, preventing Java parq... | Hot fix deployed in East US, East US2, Canada Central, West Europe on Feb 6. Remaining regions by Fe... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/%5BNew%20wiki%20structure%5DPurview%20Data%20Governance/Processes/Known%20Issues) |
| 11 | Schema tab missing for Resource sets using Azure IR/MvnetIR (Feb 2026). Error: InvalidCastException ... | ParquetSharp type casting error between DateLogicalType and TimestampLogicalType... | Attach case to ICM 51000000874446 (work item 4975338). ETA for fix was March 31. | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/%5BNew%20wiki%20structure%5DPurview%20Data%20Governance/Processes/Known%20Issues) |
| 12 | Purview scanner captures top-level JSON fields in schema but does not recognize nested JSON structur... | Purview scanner primarily extracts top-level JSON fields and does not flatten or... | No workaround. Feature request FR-2813 filed to enhance JSON parsing capabilities for nested field r... | 🔵 6.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FKnown%20Issues%2F2025%20Feb%20FR%20Known%20Issues) |
| 13 | Information Protection Scanner: 'SchemaMismatchException' or 'DB schema is not up to date' | Scanner database schema is outdated and doesn't match the current scanner versio... | Run Update-ScannerDatabase cmdlet to resynchronize the schema | 🟡 4.5 | [MS Learn](https://learn.microsoft.com/troubleshoot/microsoft-365/purview/information-protection-scanner/resolve-deployment-issues) |