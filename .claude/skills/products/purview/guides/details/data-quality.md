# Purview 数据质量扫描 -- Comprehensive Troubleshooting Guide

**Entries**: 9 | **Drafts fused**: 3 | **Kusto queries fused**: 0
**Source drafts**: [ado-wiki-a-dq-roadmap.md](..\guides/drafts/ado-wiki-a-dq-roadmap.md), [ado-wiki-handling-data-profiling-issues.md](..\guides/drafts/ado-wiki-handling-data-profiling-issues.md), [handling-data-profiling-issues.md](..\guides/drafts/handling-data-profiling-issues.md)
**Generated**: 2026-04-07

---

## Troubleshooting Workflow

### Phase 1: Initial Diagnosis
> Sources: ado-wiki-a-dq-roadmap.md, ado-wiki-handling-data-profiling-issues.md

1. Data Quality (DQ) - Internal Roadmap `[source: ado-wiki-a-dq-roadmap.md]`
2. Understanding and Resolving Data Profiling Issues in Microsoft Purview `[source: ado-wiki-handling-data-profiling-issues.md]`
3. 1. Check known issues first `[source: ado-wiki-handling-data-profiling-issues.md]`
4. 2. DQ on Lakehouse Tables `[source: ado-wiki-handling-data-profiling-issues.md]`
5. 3. Parquet Profiling - FQN Structure `[source: ado-wiki-handling-data-profiling-issues.md]`
6. 4. Databricks Unity Catalog behind VNet `[source: ado-wiki-handling-data-profiling-issues.md]`
7. Handling Data Profiling Issues and Queries in Microsoft Purview `[source: handling-data-profiling-issues.md]`
8. Decision Tree `[source: handling-data-profiling-issues.md]`
9. 1. Check Known Issues First `[source: handling-data-profiling-issues.md]`
10. 2. Lakehouse Tables (Fabric) `[source: handling-data-profiling-issues.md]`

### Phase 2: Decision Logic

| Condition | Meaning | Action |
|-----------|---------|--------|
| Data Quality scan fails with error: Profiling job failed / DataQualityInternalEr... | An automatically selected column from a previous profile no ... | Remove the stale/missing column from the DQ scan settings and re-run the scan. U... |
| Purview Data Quality and Data Profile scans fail after customer upgraded Delta L... | Purview DQ only supports Delta Lake up to version 2.2. Upgra... | Customer must downgrade to Delta Lake 2.2.0 for DQ scans and data profiles until... |
| DQ scan fails with error: Max Retry Count Reached. Ending Workflow. Current Task... | Customer data source is in a region not supported for Data Q... | Verify both Purview account and data source are in supported DQ regions. See sup... |
| DQ scan fails with Max Retry Count Reached and Kusto logs show The given key nor... | Data source is in a region not currently supported for Data ... | Ensure both Purview account and data source are in supported DQ regions. See: ht... |
| Data Quality rules cannot be reused across different data assets. Each asset nee... | DQ rules are per-asset; no global rule template mechanism ex... | No workaround. FR-2832 for global DQ rule reusability. |
| Data Quality (DQ) scans fail for Snowflake data source with restrictive access p... | Product limitation: Purview DQ scan does not support Snowfla... | Feature request FR-2729. Known limitation per docs: https://learn.microsoft.com/... |
| Data Quality scans fail for Snowflake data source with restrictive access policy... | Purview DQ scan limitation: cannot perform data quality scan... | No workaround for restrictive access policies. Feature request FR 2729 logged. |
| Data Quality connection page in new unified portal throws 500 errors; DQ connect... | - | Engineering applied fix on Feb 12. Attach case to ICM 21000000896056 and track p... |

`[conclusion: 🔵 7.0/10]`

---

## Known Issues Lookup

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Data Quality scan fails with error: Profiling job failed / DataQualityInternalError / Internal servi... | An automatically selected column from a previous profile no longer exists in the... | Remove the stale/missing column from the DQ scan settings and re-run the scan. Use Kusto query on ba... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FApps%20-%20Data%20Governance%2FTroubleshooting%20Guides%2FData%20Quality%2FDQ%20Scan%20Failure%20%3A%20DataQualityInternalError) |
| 2 | Purview Data Quality and Data Profile scans fail after customer upgraded Delta Lake beyond version 2... | Purview DQ only supports Delta Lake up to version 2.2. Upgrading to Delta Lake 2... | Customer must downgrade to Delta Lake 2.2.0 for DQ scans and data profiles until Purview DQ adds sup... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FApps%20-%20Data%20Governance%2FTroubleshooting%20Guides%2FData%20Quality%2FDQ%20and%20Profile%20scan%20fail) |
| 3 | DQ scan fails with error: Max Retry Count Reached. Ending Workflow. Current Task HandleError. Backen... | Customer data source is in a region not supported for Data Quality scans. Both t... | Verify both Purview account and data source are in supported DQ regions. See supported regions: http... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FApps%20-%20Data%20Governance%2FTroubleshooting%20Guides%2FData%20Quality%2FDQ%20scan%20failure%20-%20The%20given%20key%20'xxxxx'%20was%20not%20present%20in%20the%20dictionary) |
| 4 | DQ scan fails with Max Retry Count Reached and Kusto logs show The given key northcentralus was not ... | Data source is in a region not currently supported for Data Quality scans | Ensure both Purview account and data source are in supported DQ regions. See: https://learn.microsof... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FApps%20-%20Data%20Governance%2FTroubleshooting%20Guides%2FData%20Quality%2FDQ%20scan%20failure) |
| 5 | Data Quality rules cannot be reused across different data assets. Each asset needs its own rule defi... | DQ rules are per-asset; no global rule template mechanism exists. | No workaround. FR-2832 for global DQ rule reusability. | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FKnown%20Issues%2F2025%20Feb%20FR%20Known%20Issues) |
| 6 | Data Quality (DQ) scans fail for Snowflake data source with restrictive access policy enabled. Data ... | Product limitation: Purview DQ scan does not support Snowflake with restrictive ... | Feature request FR-2729. Known limitation per docs: https://learn.microsoft.com/en-us/purview/data-q... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FKnown%20Issues%2F2025%20Jan%20FR%20Known%20Issues) |
| 7 | Data Quality scans fail for Snowflake data source with restrictive access policy; data map scans suc... | Purview DQ scan limitation: cannot perform data quality scans for Snowflake with... | No workaround for restrictive access policies. Feature request FR 2729 logged. | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FKnown%20Issues%2F2025%20Jan%20FR%20Known%20Issues) |
| 8 | Data Quality connection page in new unified portal throws 500 errors; DQ connections not displayed (... | - | Engineering applied fix on Feb 12. Attach case to ICM 21000000896056 and track progress. | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/%5BNew%20wiki%20structure%5DPurview%20Data%20Governance/Processes/Known%20Issues) |
| 9 | Data Quality (DQ) and Profiling scans fail for VNet-enabled Azure Databricks data source even after ... | Enabling public endpoint for Databricks workspace makes JDBC endpoints accessibl... | Enable "Allow public endpoint access" as partial workaround (JDBC only). Full MPE support for Azure ... | 🔵 6.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FKnown%20Issues%2F2025%20Feb%20FR%20Known%20Issues) |