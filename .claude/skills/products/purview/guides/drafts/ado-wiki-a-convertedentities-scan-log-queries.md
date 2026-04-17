---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Troubleshooting Guides (TSGs)/Scanning/Check scan logs using \"ConvertedEntities\" instead of \"OpInfo\""
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTroubleshooting%20Guides%20(TSGs)%2FScanning%2FCheck%20scan%20logs%20using%20%22ConvertedEntities%22%20instead%20of%20%22OpInfo%22"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Check scan logs using "ConvertedEntities" instead of "OpInfo"

## Background

The OpInfo structure has been removed from Purview scan logs. The keyword "OpInfo" is no longer available in logs. Use "ConvertedEntities" instead to check information like samplingLabel, isLeafNode, qualifiedName etc.

"ConvertedEntities" keyword has existed from the beginning, so use "ConvertedEntities" keyword instead of "OpInfo".

**The functionality is the same between "OpInfo" and "ConvertedEntities":**
1. Each asset will emit an entity - "convertedEntities"
2. For an incremental scan, "convertedEntities" will be emitted only for new assets/modified assets since last scan
3. For a full scan, all assets in data source are classified and "convertedEntities" emitted

## Timeline by data source regions for "OpInfo" keyword removal

| Regions | Date |
|--|--|
| Dogfood | 2022/7/18 |
| EUS2EUAP | 2022/9/8 |
| WestCentralUS | 2023/3/21 |
| SouthEastAsia | 2023/3/28 |
| EastUS | 2023/4/3 |
| NorthEurope | 2023/4/10 |
| JapanEast | 2023/4/10 |
| SouthAfricaNorth | 2023/4/10 |
| AustraliaEast | 2023/4/10 |
| CanadaCentral | 2023/4/10 |
| EastUS2 | 2023/4/10 |
| CentralIndia | 2023/5/11 |
| FranceCentral | 2023/5/11 |
| WestUS2 | 2023/5/11 |
| EastAsia | 2023/5/11 |
| KoreaCentral | 2023/5/11 |
| NorthCentralUS | 2023/5/11 |
| BrazilSouth | 2023/6/12 |
| WestUS | 2023/6/12 |
| SouthCentralUS | 2023/6/12 |
| UKSouth | 2023/6/12 |
| WestEurope | 2023/6/12 |
| AustraliaSouthEast | 2023/6/12 |
| CentralUS | 2023/6/12 |
| UaeNorth | 2023/6/12 |
| SwitzerlandNorth | 2023/6/12 |
| GermanyWestCentral | 2023/6/12 |
| WestUS3 | 2023/6/12 |

## KQL Tips for checking ConvertedEntities

### 1. Checking a certain file

```kql
DataScanAgentLinuxEvent
| where * contains "<RunID>"  // RunID from UI
| where Message startswith "convertedEntities:"
| where Message contains "\"isLeafNode\":\"true\""
| where Message contains "<FileName>"  // Target file/asset
```

### 2. Checking a certain folder

```kql
DataScanAgentLinuxEvent
| where * contains "<RunID>"  // RunID from UI
| where Message startswith "convertedEntities:"
| where Message contains "\"isLeafNode\":\"false\""
| where Message contains "<FolderURL>"  // Target folder
```

### 3. Checking classification tag and confidence for columns

Look in the "referredEntities" section for:
- `qualifiedName` - URL of the data source
- Classification details with confidence level and type name (e.g., `MICROSOFT.FINANCIAL.US.ABA_ROUTING_NUMBER`)
- `sourceDetails` for MCE confidence levels, rule descriptions, sample counts

### 4. Checking if entity has schema

In the "referredEntities" section, look for `"typeName": "column"` entries to verify schema presence.

### 5. Checking entity label

In the entity section, look for the `samplingLabel` attribute (e.g., `"samplingLabel": "classify"`).
