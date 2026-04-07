---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Troubleshooting Guides (TSGs)/Classification and sensitivity labels/Creating Custom classifications"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTroubleshooting%20Guides%20(TSGs)%2FClassification%20and%20sensitivity%20labels%2FCreating%20Custom%20classifications"
importDate: "2026-04-06"
type: troubleshooting-guide
---

Create Custom Classification To apply to Data Source Scan

# 1) Create Classifications

In the Azure portal, navigate to the Purview account > Classifications section > Custom tab. Create a new classification with:
- Name: e.g. "Babylon_demo"
- Friendly display name: e.g. "Babylon Demo"
- Description: e.g. "This is for demo purposes."

# 2) Create Classification Rules

Navigate to Classification rules. Create a new rule:
- Name: e.g. "babylon_demo_location"
- Classification name: Select the classification created in step 1
- Data pattern: Regular Expression Pattern
- Column pattern: e.g. "location"

# 3) Create Scan Rule Sets

Navigate to Scan rule sets. Create a new scan rule set:
- Source Type: e.g. Azure Data Lake Storage Gen2
- Scan rule set name: e.g. "babylon_demo"
- Select file types for schema extraction and classification (CSV, JSON, XML, AVRO, PARQUET, etc.)
- Under "Select classification rules", enable both System rules and Custom rules (including your new custom rule)

# 4) Create new Scan using Scan Rule Set

Navigate to Data sources > select your data source > New scan:
- Name the scan (e.g. "Scan-demo")
- Authentication method: Managed Identity
- Scope your scan: Select the assets/folders to include
- Select your custom scan rule set instead of the system default
- Set scan trigger: Recurring or Once

# 5) Search the Data Catalog for all Sources using a classification

After the scan completes, go to the Data Catalog search:
- Use Quick Filters > Classification > select your custom classification
- View all assets that matched your custom classification
