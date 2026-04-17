---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/Troubleshooting Guides/Ingestion pipeline/TSG: Identify duplicate records and handle them"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FTroubleshooting%20Guides%2FIngestion%20pipeline%2FTSG%3A%20Identify%20duplicate%20records%20and%20handle%20them"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# TSG: Identify Duplicate Records and Handle Them

## Definition
Records are duplicates ONLY if two or more records have the exact same values in every field/column of the standard schema (table). Must NOT have been manipulated by query operators (extend, project, summarize).

## Check Known Issues First
1. Duplication when ingestion is high (known issue)
2. Multiple diagnostic settings for the same resource sending to same workspace

## Important Note
Log Analytics does not guarantee zero duplicate records. Only investigate if evidence warrants it. Threshold: 3% or more duplicate rate is eligible for investigation.

## Step 1: Identify if Records are Actually Duplicates

### Hash-based detection query:
```kql
let _data =
<customer_query>;
_data
| sort by TimeGenerated
| extend Hash = hash(dynamic_to_json(pack_all()))
| extend isDuplicate = iff(Hash==prev(Hash), "True", "False")
| project-reorder isDuplicate
| project-away Hash
```

## Step 2: Check Extent and Source

### Query 1 - Duplicate percentage (hash-based):
```kql
let _data = materialize(<customer_query>);
let _totalRecords = toscalar(_data|count);
_data
| extend Hash = hash(dynamic_to_json(pack_all()))
| summarize recordsCount=count() by Hash
| where recordsCount > 1
| project recordsCount = recordsCount-1
| summarize duplicateRecords = sum(recordsCount)
| extend duplicate_percentage = (duplicateRecords * 100.0) / _totalRecords
```

### Query 2 - _ItemId-based duplicate check:
```kql
let _data = materialize(<customer_query>);
let _totalRecords = toscalar(_data|count);
_data
| summarize recordsCount=count() by _ItemId
| where recordsCount > 1
| project recordsCount = recordsCount-1
| summarize duplicateRecords = sum(recordsCount)
| extend duplicate_percentage = (duplicateRecords * 100.0) / _totalRecords
```

## Interpretation

### Same _ItemId duplicates
- Source: Ingestion pipeline (Kusto-LogAnalytics Backend)
- Action: Escalate to LA PG via standard CRI procedure

### Different _ItemId (hash duplicates only)
- Source: Client/Solution side (InMem/NorthStar, Agent, REST API client, Resource Provider)
- Action: Contact LA SME/TA for further investigation
- If RP data: investigate with the Resource Provider team

## Key Concepts
- **_ItemId**: Unique record identifier (public column). Same _ItemId = pipeline duplication
- **MessageId**: Internal ingestion batch identifier (not visible to customers/CSS)
- **RequestId**: Correlates source requests (e.g., Agent) to ODS ingestion

## Customer Ready Message
Log Analytics is optimized for reliability and speed. In rare cases of local instability, data is re-ingested from staging areas, which may introduce duplicates. These are rare and usually ignorable. Duplicated records cannot be deleted; filter with KQL deduplication.
