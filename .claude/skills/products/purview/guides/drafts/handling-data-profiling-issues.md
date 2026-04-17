# Handling Data Profiling Issues and Queries in Microsoft Purview

Source: ADO Wiki — Supportability/Azure Purview/Microsoft Purview:/Apps - Data Governance/Troubleshooting Guides/Data Quality/Handling Data Profiling Issues and Queries in Microsoft Purview

## Decision Tree

### 1. Check Known Issues First
- Review: https://learn.microsoft.com/en-us/purview/data-quality-troubleshooting

### 2. Lakehouse Tables (Fabric)
**Errors:**
- "Not found. (Asset path not found)"
- Profiling Job fails with: DQ Internal Error, Internal Service Error

**Action:** Reach out to PG to have tenant allowlisted for Private Preview. Follow:
- Doc: https://learn.microsoft.com/en-us/purview/data-quality-for-fabric-data-estate
- Internal TSG: ADO Wiki `/Apps - Data Governance/Troubleshooting Guides/Data Quality/[Latest Update] Known Issue: Data Quality Scans failing with Lakehouse Tables [Fabric]`

### 3. Profiling Job Stuck in "Accepted" State (Parquet)
Check if the FQN follows supported structure:

**Supported patterns:**
1. Directory with Parquet Part Files: `./Sales/{Parquet Part Files}`
   - FQN: `https://(storage account).dfs.core.windows.net/(container)/path/path2/{SparkPartitions}`
   - Must NOT have `{n}` patterns in directory/sub-directory structure
2. Directory with Partitioned Parquet Files: `./Sales/{Year=2018}/{Month=Dec}/{Parquet Part Files}`

**Not supported:** N arbitrary hierarchies of directories with Parquet Files. If the FQN has multiple `{N}` patterns (e.g., `YYYY={N}/MM={N}/DD={N}/FILE_{N}_{N}.parquet`), DQ features are NOT supported.

**Advice:** Customer should restructure data to pattern (1) or (2).

### 4. DQ Scan Fails for Databricks
- DQ features only supported for **ADB Unity Catalog**
- If scan fails with `Request failed with status code 400 DataQualityInternalError`:
  - Check if Databricks is behind a VNet — currently NOT supported
- Reference: https://learn.microsoft.com/en-us/purview/data-quality-overview
