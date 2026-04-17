---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Apps - Data Governance/Troubleshooting Guides/Data Quality/Handling Data Profiling Issues and Queries in Microsoft Purview"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FApps%20-%20Data%20Governance%2FTroubleshooting%20Guides%2FData%20Quality%2FHandling%20Data%20Profiling%20Issues%20and%20Queries%20in%20Microsoft%20Purview"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Understanding and Resolving Data Profiling Issues in Microsoft Purview

## 1. Check known issues first
https://learn.microsoft.com/en-us/purview/data-quality-troubleshooting

## 2. DQ on Lakehouse Tables

**Errors:**
- "Not found. (Asset path not found)"
- Profiling Job fails with "DQ Internal Error, Internal Service Error"

**Action:** Reach out to PG to have tenant allowlisted for Private Preview. Then follow:
- Doc: https://learn.microsoft.com/en-us/purview/data-quality-for-fabric-data-estate
- Internal TSG: https://supportability.visualstudio.com/Azure%20Purview/_wiki/wikis/Microsoft%20Purview/1671830/

## 3. Parquet Profiling - FQN Structure

Profiling job stuck in "accepted" state - check if FQN follows supported structure:

**Supported:**
- Directory with Parquet Part Files: `https://(storage account).dfs.core.windows.net/(container)/path/path2/{SparkPartitions}`
- Column-partitioned directory: `./Sales/{Year=2018}/{Month=Dec}/{Parquet Part Files}`

**Not Supported:**
- Arbitrary hierarchies with `{N}` patterns in directory structure
- Example of unsupported: `path/YYYY={N}/MM={N}/DD={N}/file_{N}_{N}.parquet`

## 4. Databricks Unity Catalog behind VNet

DQ features only supported for ADB Unity Catalog **not** behind a VNet.

Error: `Request failed with status code 400 DataQualityInternalError`

Check if Databricks is behind VNet. ETA for VNet support was Q1 2025.

Reference: [Data Quality Overview](https://learn.microsoft.com/en-us/purview/data-quality-overview)
