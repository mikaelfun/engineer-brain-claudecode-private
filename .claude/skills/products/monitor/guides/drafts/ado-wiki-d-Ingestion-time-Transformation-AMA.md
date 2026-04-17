---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/Troubleshooting Guides/Table management/Ingestion-time Transformation with Azure Monitor Agent"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FTroubleshooting%20Guides%2FTable%20management%2FIngestion-time%20Transformation%20with%20Azure%20Monitor%20Agent"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Ingestion-time Transformation with Azure Monitor Agent

## Overview
This TSG diagnoses and resolves issues with ingestion-time transformations in Azure Monitor Agent (AMA) DCRs. Common issues include data not appearing as expected, transformation rules not applied correctly, or data volumes unexpectedly low.

> **Important**: When using custom tables, ensure the destination table schema contains custom columns matching the incoming record fields. Mismatched schemas cause fields to be dropped silently.

> **Note**: The `parse` command in `transformkql` is limited to **10 columns per statement** (performance). New DCRs enforced from Jan 2025; existing DCRs stopped from Jan 2026 if non-compliant. Split parse commands per: https://learn.microsoft.com/azure/azure-monitor/logs/query-optimization#break-up-large-parse-commands

## How to Edit AMA DCR for Transformation

For standard data types (Perf, Syslog, Event) via AMA DCR, adding transformation is **not available via Azure Portal UI**. Follow these steps:
1. GET the DCR JSON from API
2. Edit JSON to add `transformKql` value in dataFlows
3. PUT/PATCH back to DCR API

For custom text logs and JSON logs, transformation can be added from DCR UI during data source creation.

Reference: https://learn.microsoft.com/azure/azure-monitor/essentials/data-collection-rule-edit

## Troubleshooting Steps

### Step 1: Verify Transformation query is valid

Use the workspace-level table transformation editor to test (but don't create the transformation there - it would become workspace default transformation, not AMA DCR transformation):

1. Go to Tables blade in workspace
2. Click 3 dots next to table name > Create transformation
3. Give a test DCR name, proceed to query editor
4. Write and test the transformation query
5. **Close without saving** - just use the validated query in the AMA DCR

### Step 2: Verify Transformation is in ingestion pipeline

1. Identify AMA DCRs associated with the VM via ASC
2. Allow up to 1 hour for DCR backend to pick up transformation logic
3. Verify DCR JSON has `transformKql` in DataFlows section
4. Check DCR structure details via: https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1495805/

**Backend verification** (Kusto - GenevaNSProd database, omsgenevatlm cluster):

```kusto
ProcessedChunk
| where CustomerId == "<ws-id>"
| where TIMESTAMP between (datetime(2024-07-27 00:00:17) .. 2d)
| where OutputType == "<Table-Name>"
| summarize count(), min(TIMESTAMP), max(TIMESTAMP) by CustomerId, OutputType, DcrId, OutputPartitionId
```

The `OutputPartitionId` changes with each new DCR version. A new partition ID after update indicates the transformation was picked up. Compare min(TIMESTAMP) of new ID with max(TIMESTAMP) of old ID.

### Step 3: Check for Errors and Success

**Kusto query** (GenevaNSProd database, omsgenevatlm cluster):
```kusto
ProcessedChunk
| where strlen(Codes) > 0
| where TIMESTAMP between (datetime(2024-07-27 00:00:17) .. 2d)
| where DcrId == "<DCR-Immutable-Id>"
| where OutputType == "<Table-Name>"
| project TIMESTAMP, InputType, OutputType, Codes, InputRows, OutputRows, Result, DcrId, OutputPartitionId, CorrelationId
| order by TIMESTAMP desc
```

- `Codes` field contains `DcrExtensionQuery` indicating transformation is in place
- Compare `InputRows` vs `OutputRows` to verify filtering behavior
- Even with `Result = Success`, schema mismatch can cause unexpected results (e.g., new columns via transformation query but table schema not updated)

## IcM Escalation
After following this TSG with SME/TA/EEE approval, use Product Group Escalation with the template and feature area from Custom Log V2 and Transformations IcM Escalation Path.

## References
- [Data collection transformations](https://learn.microsoft.com/azure/azure-monitor/essentials/data-collection-transformations)
- [Azure Monitor Agent transformation](https://learn.microsoft.com/azure/azure-monitor/agents/azure-monitor-agent-transformation)
