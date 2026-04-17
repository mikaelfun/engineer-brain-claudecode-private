---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/[New wiki structure]Purview Data Governance/Troubleshooting Guides (TSGs)/Scan/Boosting Scan Performance in Purview with Classification Rules"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FScan%2FBoosting%20Scan%20Performance%20in%20Purview%20with%20Classification%20Rules"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Boosting Scan Performance in Purview with Classification Rules

## Overview

This guide explains the impact of **classification rules** on **scan run duration** in Microsoft Purview.

## Purview Scanning Process

### 1. Scan Job Initiation
When a scan job starts, the **integration runtime** connects to the data source and navigates through objects (files/databases) to extract **technical metadata** (names, file sizes, columns, etc.).

### 2. Metadata Extraction
For structured data sources, Purview also extracts the **schema** (table structure, column names). Queries executed against the data source place a **read load**:
- **Full scan** → higher load
- **Scoped scan** (if supported) → reduced load

### 3. Sampling and Classification
After schema extraction, data is subjected to **sampling** — reading the top 128 rows of each dataset. The **classification module** then applies classification rules.

## How Classification Rules Affect Scan Duration

### Fixed Data Read Cost
Data for each asset is read **once**, regardless of how many classification rules are applied. There is always a **fixed cost** for reading data.

### Cost of Applying Classification Rules
Total classification time = data reading + applying each rule to each value in every column.

- **Regex-based rules** are the most performance-impacting
- **More rules + more complex regex = longer scan duration**
- **Linear relationship**: time scales linearly with rule count

### System vs. Custom Rules
- **System classification rules**: If disabled, corresponding regex patterns are skipped
- **Custom classification rules**: Only rules added to the scan rule set are applied

## Key Points

- **Sampling** takes milliseconds and depends on file type and directory structure
  - Reference: [Sampling data for classification](https://learn.microsoft.com/en-us/purview/microsoft-purview-connector-overview#resource-set-file-sampling)
- Classification time has a **linear relationship** with rule count
- Efficient regex patterns and fewer rules optimize scan performance

## Optimization Recommendations

1. Disable unused system classification rules
2. Minimize custom classification rules to essential ones
3. Use efficient regex patterns (avoid complex/backtracking patterns)
4. Consider scoped scans to reduce overall data read
5. Monitor scan duration trends when adding new classification rules
