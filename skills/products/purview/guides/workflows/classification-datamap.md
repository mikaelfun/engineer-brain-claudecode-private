# Purview Data Map 分类标注 — 排查工作流

**来源草稿**: `ado-wiki-a-classification-insights.md`, `ado-wiki-a-creating-custom-classifications.md`, `ado-wiki-classification-kusto-query-bank.md`, `ado-wiki-cri-subclassification.md`, `ado-wiki-missing-classifications-on-asset.md`, `ado-wiki-scan-performance-classification-rules.md`
**Kusto 引用**: 无
**场景数**: 31
**生成日期**: 2026-04-07

---

## Scenario 1: Classification Insights — Kusto Queries
> 来源: ado-wiki-a-classification-insights.md | 适用: 未标注

### 排查步骤
This set of queries will report the assets and classifications considered by L1, L2 and L3 scanning. Note, NO classification is done at L2. Also note, that these assets and classifications may be still dropped by the Offline Tier for threshold, or by the Online Tier in case of any unexpected ingestion errors.

**Input Required:** Scan Run Id

**Attached Query File:** [ASCClassificationInsights.txt](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTools%2FKusto%20Queries%2FClassification%20Insights) (see wiki page for download)

`[来源: ado-wiki-a-classification-insights.md]`

---

## Scenario 2: Usage Notes
> 来源: ado-wiki-a-classification-insights.md | 适用: 未标注

### 排查步骤
- Use ASC (Azure Support Center) Classification Insights to run these queries
- Queries cover L1, L2, L3 scanning tiers
- L2 does NOT perform classification
- Results may be further filtered by Offline Tier (threshold) or Online Tier (ingestion errors)

`[来源: ado-wiki-a-classification-insights.md]`

---

## Scenario 3: 1) Create Classifications
> 来源: ado-wiki-a-creating-custom-classifications.md | 适用: 未标注

### 排查步骤
In the Azure portal, navigate to the Purview account > Classifications section > Custom tab. Create a new classification with:
- Name: e.g. "Babylon_demo"
- Friendly display name: e.g. "Babylon Demo"
- Description: e.g. "This is for demo purposes."

`[来源: ado-wiki-a-creating-custom-classifications.md]`

---

## Scenario 4: 2) Create Classification Rules
> 来源: ado-wiki-a-creating-custom-classifications.md | 适用: 未标注

### 排查步骤
Navigate to Classification rules. Create a new rule:
- Name: e.g. "babylon_demo_location"
- Classification name: Select the classification created in step 1
- Data pattern: Regular Expression Pattern
- Column pattern: e.g. "location"

`[来源: ado-wiki-a-creating-custom-classifications.md]`

---

## Scenario 5: 3) Create Scan Rule Sets
> 来源: ado-wiki-a-creating-custom-classifications.md | 适用: 未标注

### 排查步骤
Navigate to Scan rule sets. Create a new scan rule set:
- Source Type: e.g. Azure Data Lake Storage Gen2
- Scan rule set name: e.g. "babylon_demo"
- Select file types for schema extraction and classification (CSV, JSON, XML, AVRO, PARQUET, etc.)
- Under "Select classification rules", enable both System rules and Custom rules (including your new custom rule)

`[来源: ado-wiki-a-creating-custom-classifications.md]`

---

## Scenario 6: 4) Create new Scan using Scan Rule Set
> 来源: ado-wiki-a-creating-custom-classifications.md | 适用: 未标注

### 排查步骤
Navigate to Data sources > select your data source > New scan:
- Name the scan (e.g. "Scan-demo")
- Authentication method: Managed Identity
- Scope your scan: Select the assets/folders to include
- Select your custom scan rule set instead of the system default
- Set scan trigger: Recurring or Once

`[来源: ado-wiki-a-creating-custom-classifications.md]`

---

## Scenario 7: 5) Search the Data Catalog for all Sources using a classification
> 来源: ado-wiki-a-creating-custom-classifications.md | 适用: 未标注

### 排查步骤
After the scan completes, go to the Data Catalog search:
- Use Quick Filters > Classification > select your custom classification
- View all assets that matched your custom classification

`[来源: ado-wiki-a-creating-custom-classifications.md]`

---

## Scenario 8: Exception Classification & Analysis
> 来源: ado-wiki-classification-kusto-query-bank.md | 适用: 未标注

### 排查步骤
Get all errors/exceptions in data scan for the past x days, summarized by Module:

```kql
DataScanAgentEvent
| where env_time > ago(1d)
| where Message !contains "OpInfo:" and Message !contains "Sequence" and Message !contains "Processed " and Message !contains "Uri : "
| where Message !contains "(403) Forbidden"
| where Message contains "exception"
| summarize count() by Source
| order by count_ desc
```

`[来源: ado-wiki-classification-kusto-query-bank.md]`

---

## Scenario 9: Common Source Modules
> 来源: ado-wiki-classification-kusto-query-bank.md | 适用: 未标注

### 排查步骤
| Source | Description |
|--|--|
| jobs name=infoOps.Handler.WarmPath | WarmPath handler exceptions |
| ShufModule | Shuffle module exceptions |
| progressreport | Progress reporting exceptions |
| parsers.document | Document parser exceptions |
| weights-classify | Classification weight exceptions |
| connectors.powerbi | Power BI connector exceptions |

`[来源: ado-wiki-classification-kusto-query-bank.md]`

---

## Scenario 10: Per-Module Exception Stack Analysis
> 来源: ado-wiki-classification-kusto-query-bank.md | 适用: 未标注

### 排查步骤
For each module, get unique exception call stacks statistics:

```kql
DataScanAgentEvent
| where env_time > ago(1d)
| where Message !contains "OpInfo:" and Message !contains "Sequence" and Message !contains "Processed " and Message !contains "Uri : "
| where Message !contains "(403) Forbidden"
| where Message contains "exception"
| where Source == "{ModuleName}"
| summarize count() by Message
| order by count_ desc
```

`[来源: ado-wiki-classification-kusto-query-bank.md]`

---

## Scenario 11: Microsoft Purview CRI Subclassification Rules
> 来源: ado-wiki-cri-subclassification.md | 适用: 未标注

### 排查步骤
> Source: ADO Wiki — `CRI Subclassification`
> Purpose: Rules for classifying CRI (Customer Reported Incidents) in Purview ICM

`[来源: ado-wiki-cri-subclassification.md]`

---

## Scenario 12: Classification Matrix
> 来源: ado-wiki-cri-subclassification.md | 适用: 未标注

### 排查步骤
| CRIClassification | IssueClass | CRIEscalationQuality |
|---|---|---|
| CSS Delivery Issue - CSS Training | Customer Error or Request | Missing information for investigation / Public document or TSG exists |
| CSS Delivery Issue - CSS Didn't follow process | Customer Error or Request | Improper escalation as sev 2 / Unqualified CRI / Advisory question with no Ava / Ava thread already provided solution |
| Product Bug - Environment Issue | External or Partner | (any) |
| Product Bug - Service Bug | Product Issue | (any) |
| Product Operation - Account/Quota Limit | Customer Error or Request | Quota Increase |
| Product Operation - Refund Request | Customer Error or Request | Refund Request |
| Product Improvement/Limitation - Outside Current Design | Customer Error or Request | Qualified CRI / Not applicable (for LSI) |
| Product Improvement/Limitation - Enable Feature Functionality | Customer Error or Request | New Feature Request |
| Product Improvement/Limitation - Engineering Deployment Process | Product Issue | Not applicable (for LSI) |
| Supportability Gap - ASC Insight | Customer Error or Request | ASC Insight missing/need improvement |
| Supportability Gap - TSG/Public Doc | Customer Error or Request | TSG/Public Documentation opportunity |

`[来源: ado-wiki-cri-subclassification.md]`

---

## Scenario 13: Kusto Validation Query
> 来源: ado-wiki-cri-subclassification.md | 适用: 未标注

### 排查步骤
```kql
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

`[来源: ado-wiki-cri-subclassification.md]`

---

## Scenario 14: Missing Classifications on an Asset
> 来源: ado-wiki-missing-classifications-on-asset.md | 适用: 未标注

### 排查步骤
**NOTE:** Use "Entity info"/"convertedEntities" instead of "OpInfo" for checking information.

`[来源: ado-wiki-missing-classifications-on-asset.md]`

---

## Scenario 15: Background
> 来源: ado-wiki-missing-classifications-on-asset.md | 适用: 未标注

### 排查步骤
For an asset in the data source scanned, customer expects to see a tag on the asset, but it is not found in the catalog.
If Threshold Values and System Classification TSGs are not applicable, proceed with this.

`[来源: ado-wiki-missing-classifications-on-asset.md]`

---

## Scenario 16: Scoping Questions
> 来源: ado-wiki-missing-classifications-on-asset.md | 适用: 未标注

### 排查步骤
- Purview classification rule (out of the box or custom details)
- Purview Scan Run ID
- An example of assets that you expect to be classified that were not

`[来源: ado-wiki-missing-classifications-on-asset.md]`

---

## Scenario 17: Possible Causes
> 来源: ado-wiki-missing-classifications-on-asset.md | 适用: 未标注

### 排查步骤
1. **Data removed or has security restrictions** — data within the current region deployment was removed/not populated due to security concerns (source folders have access restrictions). At scan time, Purview didn't have any data to classify.
2. **Inconsistent data classification** — data quality issues when sourcing from data sources such as Salesforce can generate inconsistent classifications.

`[来源: ado-wiki-missing-classifications-on-asset.md]`

---

## Scenario 18: Check OpInfo (Azure IR)
> 来源: ado-wiki-missing-classifications-on-asset.md | 适用: 未标注

### 排查步骤
```kql
DataScanAgentLinuxEvent
| where * contains "[SCANRUNID]"  // RunID from UI
| where Message contains "OpInfo:"
| where Message !contains "\"IsLeafNode\":\"false\""
| where Message contains "ClassificationExample.csv"  // asset for which classification was expected
```

`[来源: ado-wiki-missing-classifications-on-asset.md]`

---

## Scenario 19: Check OpInfo (SHIR)
> 来源: ado-wiki-missing-classifications-on-asset.md | 适用: 未标注

### 排查步骤
```kql
cluster('azuredmprod.kusto.windows.net').database('AzureDataMovement').TraceGatewayLocalEventLog
| where * contains "[REPORTID]"  // ReportID from SHIR
| where Message contains "OpInfo:"
| where Message !contains "\"IsLeafNode\":\"false\""
| where Message contains "ClassificationExample.csv"
```

`[来源: ado-wiki-missing-classifications-on-asset.md]`

---

## Scenario 20: If OpInfo is missing — check find module exceptions
> 来源: ado-wiki-missing-classifications-on-asset.md | 适用: 未标注

### 排查步骤
```kql
DataScanAgentLinuxEvent
| where * contains "[SCANRUNID]"
| where * contains "ExceptionDetails: "
| where Source == "find"
```
Common exception: `403 Forbidden` — ACL verification failed, resource doesn't exist or user not authorized.

`[来源: ado-wiki-missing-classifications-on-asset.md]`

---

## Scenario 21: If OpInfo exists but tag missing — check shuffle module
> 来源: ado-wiki-missing-classifications-on-asset.md | 适用: 未标注

### 排查步骤
```kql
DataScanAgentLinuxEvent
| where * contains "[SCANRUNID]"
| where * contains "ExceptionDetails: "
| where Source == "ShufModule"
```

`[来源: ado-wiki-missing-classifications-on-asset.md]`

---

## Scenario 22: Mitigation Decision Tree
> 来源: ado-wiki-missing-classifications-on-asset.md | 适用: 未标注

### 排查步骤
| Scenario | Action |
|----------|--------|
| OpInfo missing + find module exception (403) | File ICM with **DataScan** — RunID, asset name, exception details |
| OpInfo exists + high confidence tag emitted but not in catalog | File ICM with **Data Map Team** — OpInfo, RunID, asset/column name, expected tag |
| OpInfo exists + tag missing + shuffle module exception | Ask customer to **rerun scan**. If persists → file ICM with **DataScan** citing shuffle module failure |

`[来源: ado-wiki-missing-classifications-on-asset.md]`

---

## Scenario 23: Overview
> 来源: ado-wiki-scan-performance-classification-rules.md | 适用: 未标注

### 排查步骤
This guide explains the impact of **classification rules** on **scan run duration** in Microsoft Purview.

`[来源: ado-wiki-scan-performance-classification-rules.md]`

---

## Scenario 24: 1. Scan Job Initiation
> 来源: ado-wiki-scan-performance-classification-rules.md | 适用: 未标注

### 排查步骤
When a scan job starts, the **integration runtime** connects to the data source and navigates through objects (files/databases) to extract **technical metadata** (names, file sizes, columns, etc.).

`[来源: ado-wiki-scan-performance-classification-rules.md]`

---

## Scenario 25: 2. Metadata Extraction
> 来源: ado-wiki-scan-performance-classification-rules.md | 适用: 未标注

### 排查步骤
For structured data sources, Purview also extracts the **schema** (table structure, column names). Queries executed against the data source place a **read load**:
- **Full scan** → higher load
- **Scoped scan** (if supported) → reduced load

`[来源: ado-wiki-scan-performance-classification-rules.md]`

---

## Scenario 26: 3. Sampling and Classification
> 来源: ado-wiki-scan-performance-classification-rules.md | 适用: 未标注

### 排查步骤
After schema extraction, data is subjected to **sampling** — reading the top 128 rows of each dataset. The **classification module** then applies classification rules.

`[来源: ado-wiki-scan-performance-classification-rules.md]`

---

## Scenario 27: Fixed Data Read Cost
> 来源: ado-wiki-scan-performance-classification-rules.md | 适用: 未标注

### 排查步骤
Data for each asset is read **once**, regardless of how many classification rules are applied. There is always a **fixed cost** for reading data.

`[来源: ado-wiki-scan-performance-classification-rules.md]`

---

## Scenario 28: Cost of Applying Classification Rules
> 来源: ado-wiki-scan-performance-classification-rules.md | 适用: 未标注

### 排查步骤
Total classification time = data reading + applying each rule to each value in every column.

- **Regex-based rules** are the most performance-impacting
- **More rules + more complex regex = longer scan duration**
- **Linear relationship**: time scales linearly with rule count

`[来源: ado-wiki-scan-performance-classification-rules.md]`

---

## Scenario 29: System vs. Custom Rules
> 来源: ado-wiki-scan-performance-classification-rules.md | 适用: 未标注

### 排查步骤
- **System classification rules**: If disabled, corresponding regex patterns are skipped
- **Custom classification rules**: Only rules added to the scan rule set are applied

`[来源: ado-wiki-scan-performance-classification-rules.md]`

---

## Scenario 30: Key Points
> 来源: ado-wiki-scan-performance-classification-rules.md | 适用: 未标注

### 排查步骤
- **Sampling** takes milliseconds and depends on file type and directory structure
  - Reference: [Sampling data for classification](https://learn.microsoft.com/en-us/purview/microsoft-purview-connector-overview#resource-set-file-sampling)
- Classification time has a **linear relationship** with rule count
- Efficient regex patterns and fewer rules optimize scan performance

`[来源: ado-wiki-scan-performance-classification-rules.md]`

---

## Scenario 31: Optimization Recommendations
> 来源: ado-wiki-scan-performance-classification-rules.md | 适用: 未标注

### 排查步骤
1. Disable unused system classification rules
2. Minimize custom classification rules to essential ones
3. Use efficient regex patterns (avoid complex/backtracking patterns)
4. Consider scoped scans to reduce overall data read
5. Monitor scan duration trends when adding new classification rules

`[来源: ado-wiki-scan-performance-classification-rules.md]`

---
