# Purview 数据质量扫描 — 排查工作流

**来源草稿**: `ado-wiki-a-dq-roadmap.md`, `ado-wiki-handling-data-profiling-issues.md`, `handling-data-profiling-issues.md`
**Kusto 引用**: 无
**场景数**: 11
**生成日期**: 2026-04-07

---

## Scenario 1: Features
> 来源: ado-wiki-a-dq-roadmap.md | 适用: 未标注

### 排查步骤
| # | Feature | Status | Pr. Preview | Pu. Preview | GA | Comments |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | DQ for ungoverned data assets | On track | Nov 2025 | Dec 2025 | Q1CY26 | Dev ready 1st week Nov; Catalog API ready 31st |
| 2 | vNet support for DQ error records and self-serve analytics | On track | Nov 2025 | Dec 2025 | Q1CY26 | vNet decoupling completed |
| 3 | DQ for on-prem data sources (Oracle, SQL Server) | On track | Dec 2025 | Jan 2026 | Q1CY26 | Business model sign-off targeted mid-Oct |
| 4 | On-prem support for DQ error records | Not started | Dec 2025 | Jan 2026 | Q1CY26 | |
| 5 | On-prem DQ billing instrumentation | Not started | N/A | Jan 2026 | Q1CY26 | Waiting for Business Planning approval |
| 6 | Incremental DQ with time-based filtering | On track | Nov 2025 | Dec 2025 | Q1CY26 | Design completed, implementation starts 20th Oct |
| 7 | Public-facing DQ APIs for all core scenarios | On track | N/A | Dec 2025 | Q1CY26 | Connection, Rule, Scheduling, Profiling, Scores |
| 8 | DQ for SQL Managed Instance | Not started | Nov 2025 | Dec 2025 | Q1CY26 | DGPU used for billing |
| 9 | Snowflake OAuth model support | On track | Oct 2025 | Nov 2025 | Q1CY26 | Backend testing in progress; UI pending |
| 10 | BCDR | Not started | TBD | TBD | Q1CY26 | DEH and catalog partnership |
| 11 | Custom rules using ANSI SQL (no table joins) | On track | Oct 2025 | Nov 2025 | Q1CY26 | Private preview last week of October |

`[来源: ado-wiki-a-dq-roadmap.md]`

---

## Scenario 2: Notes
> 来源: ado-wiki-a-dq-roadmap.md | 适用: 未标注

### 排查步骤
- GA = General Availability; Q1CY26 = Q1 Calendar Year 2026.
- Dates are internal targets, not customer-facing.
- On-prem DQ covers Oracle and SQL Server databases.

`[来源: ado-wiki-a-dq-roadmap.md]`

---

## Scenario 3: 1. Check known issues first
> 来源: ado-wiki-handling-data-profiling-issues.md | 适用: 未标注

### 排查步骤
https://learn.microsoft.com/en-us/purview/data-quality-troubleshooting

`[来源: ado-wiki-handling-data-profiling-issues.md]`

---

## Scenario 4: 2. DQ on Lakehouse Tables
> 来源: ado-wiki-handling-data-profiling-issues.md | 适用: 未标注

### 排查步骤
**Errors:**
- "Not found. (Asset path not found)"
- Profiling Job fails with "DQ Internal Error, Internal Service Error"

**Action:** Reach out to PG to have tenant allowlisted for Private Preview. Then follow:
- Doc: https://learn.microsoft.com/en-us/purview/data-quality-for-fabric-data-estate
- Internal TSG: https://supportability.visualstudio.com/Azure%20Purview/_wiki/wikis/Microsoft%20Purview/1671830/

`[来源: ado-wiki-handling-data-profiling-issues.md]`

---

## Scenario 5: 3. Parquet Profiling - FQN Structure
> 来源: ado-wiki-handling-data-profiling-issues.md | 适用: 未标注

### 排查步骤
Profiling job stuck in "accepted" state - check if FQN follows supported structure:

**Supported:**
- Directory with Parquet Part Files: `https://(storage account).dfs.core.windows.net/(container)/path/path2/{SparkPartitions}`
- Column-partitioned directory: `./Sales/{Year=2018}/{Month=Dec}/{Parquet Part Files}`

**Not Supported:**
- Arbitrary hierarchies with `{N}` patterns in directory structure
- Example of unsupported: `path/YYYY={N}/MM={N}/DD={N}/file_{N}_{N}.parquet`

`[来源: ado-wiki-handling-data-profiling-issues.md]`

---

## Scenario 6: 4. Databricks Unity Catalog behind VNet
> 来源: ado-wiki-handling-data-profiling-issues.md | 适用: 未标注

### 排查步骤
DQ features only supported for ADB Unity Catalog **not** behind a VNet.

Error: `Request failed with status code 400 DataQualityInternalError`

Check if Databricks is behind VNet. ETA for VNet support was Q1 2025.

Reference: [Data Quality Overview](https://learn.microsoft.com/en-us/purview/data-quality-overview)

`[来源: ado-wiki-handling-data-profiling-issues.md]`

---

## Scenario 7: Handling Data Profiling Issues and Queries in Microsoft Purview
> 来源: handling-data-profiling-issues.md | 适用: 未标注

### 排查步骤
Source: ADO Wiki — Supportability/Azure Purview/Microsoft Purview:/Apps - Data Governance/Troubleshooting Guides/Data Quality/Handling Data Profiling Issues and Queries in Microsoft Purview

`[来源: handling-data-profiling-issues.md]`

---

## Scenario 8: 1. Check Known Issues First
> 来源: handling-data-profiling-issues.md | 适用: 未标注

### 排查步骤
- Review: https://learn.microsoft.com/en-us/purview/data-quality-troubleshooting

`[来源: handling-data-profiling-issues.md]`

---

## Scenario 9: 2. Lakehouse Tables (Fabric)
> 来源: handling-data-profiling-issues.md | 适用: 未标注

### 排查步骤
**Errors:**
- "Not found. (Asset path not found)"
- Profiling Job fails with: DQ Internal Error, Internal Service Error

**Action:** Reach out to PG to have tenant allowlisted for Private Preview. Follow:
- Doc: https://learn.microsoft.com/en-us/purview/data-quality-for-fabric-data-estate
- Internal TSG: ADO Wiki `/Apps - Data Governance/Troubleshooting Guides/Data Quality/[Latest Update] Known Issue: Data Quality Scans failing with Lakehouse Tables [Fabric]`

`[来源: handling-data-profiling-issues.md]`

---

## Scenario 10: 3. Profiling Job Stuck in "Accepted" State (Parquet)
> 来源: handling-data-profiling-issues.md | 适用: 未标注

### 排查步骤
Check if the FQN follows supported structure:

**Supported patterns:**
1. Directory with Parquet Part Files: `./Sales/{Parquet Part Files}`
   - FQN: `https://(storage account).dfs.core.windows.net/(container)/path/path2/{SparkPartitions}`
   - Must NOT have `{n}` patterns in directory/sub-directory structure
2. Directory with Partitioned Parquet Files: `./Sales/{Year=2018}/{Month=Dec}/{Parquet Part Files}`

**Not supported:** N arbitrary hierarchies of directories with Parquet Files. If the FQN has multiple `{N}` patterns (e.g., `YYYY={N}/MM={N}/DD={N}/FILE_{N}_{N}.parquet`), DQ features are NOT supported.

**Advice:** Customer should restructure data to pattern (1) or (2).

`[来源: handling-data-profiling-issues.md]`

---

## Scenario 11: 4. DQ Scan Fails for Databricks
> 来源: handling-data-profiling-issues.md | 适用: 未标注

### 排查步骤
- DQ features only supported for **ADB Unity Catalog**
- If scan fails with `Request failed with status code 400 DataQualityInternalError`:
  - Check if Databricks is behind a VNet — currently NOT supported
- Reference: https://learn.microsoft.com/en-us/purview/data-quality-overview

`[来源: handling-data-profiling-issues.md]`

---
