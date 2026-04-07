# Purview ADF / Synapse 血缘 -- Quick Reference

**Entries**: 6 | **21V**: all-applicable | **Confidence**: medium
**Last updated**: 2026-04-07

## Symptom Lookup
| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | Azure Databricks lineage missing in Purview after scan completes; lineage tab shows no data | Only NOTEBOOK entity type lineage is supported. Tables/notebooks must be in same... | (1) Verify lineage is from NOTEBOOK type. (2) Confirm within scan workspace scope. (3) Query DataSca... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Troubleshooting%20Guides%20(TSGs)/Known%20Issues/Azure%20Databricks%20Lineage%20and%20Authentication%20Issues) |
| 2 📋 | Lineage not appearing for stored procedures invoked from Azure Data Factory (ADF) in Azure SQL DB li... | Remote Procedure Calls (RPC) from ADF are not supported in SQL provenance lineag... | Known limitation. Stored procedures invoked from ADF are not supported for lineage extraction. Only ... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview/Troubleshooting%20Guides%20(TSGs)/Lineage/SQL%20Server%20Provenance%2C%20PowerBI%20sub-artifact%20lineage%20and%20PowerBI%20scan%20through%20VNET) |
| 3 📋 | View lineage not rendered after SQL DB metadata scan. Customer does not see view lineage for scanned... | If the asset was already ingested to data map before the lineage-enabled scan, t... | Delete the asset from data map, then re-run the scan. If errors persist, check Kusto logs (DataScanA... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Troubleshooting%20Guides%20(TSGs)/Known%20Issues/SQL%20Server%20Lineage%20Issues) |
| 4 📋 | Synapse Analytics lineage missing despite successful ADF dataflow; ADF-Purview linking incorrect | ADF-Purview connection not established correctly; adcProperties show empty/wrong... | Verify ADF-Purview connection per docs. Try disconnect/reconnect Synapse. Kusto: DataflowClusterLogs... | 🔵 7.0 | ado-wiki |
| 5 📋 | Data factory disappears from the Purview portal Lineage connection list | The data factory service principal was removed from the Purview root collection'... | 1) Go to Purview → Collection page → check if the data factory is still listed as a Data Curator in ... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTroubleshooting%20Guides%20(TSGs)%2FLineage%2FConnecting%20to%20lineage%20sources%2FTroubleshoot%20Data%20factory%20disappears%20or%20gets%20disconnected%20on%20Purview%20portal) |
| 6 📋 | Cross-workspace lineage for Databricks Unity Catalog is not supported in Purview. | By design. Purview does not support cross-workspace lineage extraction from Data... | No workaround. Feature request FR-2772. | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FKnown%20Issues%2F2025%20Feb%20FR%20Known%20Issues) |

## Quick Troubleshooting Path

1. (1) Verify lineage is from NOTEBOOK type. (2) Confirm within scan workspace scope. (3) Query DataScanAgentLinuxEvent for lineage result size. (4) If 0... `[source: ado-wiki]`
2. Known limitation. Stored procedures invoked from ADF are not supported for lineage extraction. Only locally executed stored procedures show lineage. P... `[source: ado-wiki]`
3. Delete the asset from data map, then re-run the scan. If errors persist, check Kusto logs (DataScanAgentLinuxEvent for scan errors, TraceGatewayLocalE... `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Full troubleshooting workflow](details/lineage-adf-synapse.md#troubleshooting-workflow)