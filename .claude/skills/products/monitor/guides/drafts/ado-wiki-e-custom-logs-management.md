---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/Common Concepts/Custom logs management"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FCommon%20Concepts%2FCustom%20logs%20management"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Custom Logs Management

## Limits

- A single workspace can have up to 500 custom logs at a given time.

## Background

Custom logs are tables within a Log Analytics Workspace.
With the addition of new Custom Logs (CL) (Azure Monitor Agent(AMA) Custom Logs and new Data Collection Rule(DCR)-Based Ingestion API), there are two types of custom logs:

**Custom Log V1:**
Legacy type of custom log. Created using:
1. Legacy agent (MMA/OMS) file based custom logs
2. Azure Monitor HTTP Data Collector API

**Custom Log V2:**
New type of custom log. Created using:
1. AMA (New Agent) custom logs
2. New DCR-Based Logs Ingestion API

- A Custom Log V1 can be migrated to V2 (intentionally or via Edit Schema in portal — irreversible)

## How to Check Custom Log Version

Use the following Kusto query on `oibebt.eastus.kusto.windows.net/CMSTelemetry`:

```kql
let wsid="WorkspaceIdHere";
let custom_table_name="TableNameHere";
cluster('oibebt.eastus.kusto.windows.net').database('CMSTelemetry').
Artifacts
| where Timestamp > ago(1d)
| where PartitionKey == wsid
| where Name == custom_table_name
| where DocType == "FactDocument"
| top 1 by toint(Customization.Version) desc 
| extend Custom_Log_Version = Fact.Context.TableAPIState
| project TableName=Name, Custom_Log_Version, CreatedDate
```

| Custom_Log_Version | Explanation |
|--|--|
| V1 | Legacy Custom Log V1 (MMA/OMS or Data Collector API) |
| V2 | DCR-based Custom Log V2 (AMA or Log Ingestion API) |
| V2Migrated | Was V1, migrated to V2. Does NOT mean ingestion goes via DCR pipeline |

## Nomenclature

- Custom tables have `_CL` suffix (auto-added via portal, manual via API)
- Column names: start with letter, max 45 alphanumeric chars + underscores
- Reserved names: `_ResourceId`, `id`, `_SubscriptionId`, `TenantId`, `Type`, `UniqueId`, `Title`
- DCR input stream field names follow same rules

## Deletion

### Data Collector API (V1)
- Portal: Tables blade → 3 dots → Delete → Confirm
- API: `DELETE https://management.azure.com/{wsResourceId}/dataCollectorLogs/{tableName}?api-version=2020-08-01`
- With force flag: append `&force=true`

**IMPORTANT:** If table is re-created after deletion, customer may still be ingesting data. Stop ingestion first!

### File based (MMA/OMS) (V1)
- Portal: Same as above
- API: REST API data-sources/delete
- PowerShell: `Remove-AzOperationalInsightsDataSource`

## What Happens Upon Deletion

1. Table definition removed immediately (not visible to users)
2. Data is NOT deleted
3. Sub-resources (retention) soft-deleted, hard-deleted after 14 days
4. After hard delete, retention inherits workspace retention

**To avoid extended retention costs:**
1. Set table retention to minimum (4 days)
2. Delete the table immediately
3. Data removed after 4 days
4. Sub-resources hard-deleted after 14 days

Data purge is NOT recommended for cost reduction — only for GDPR, takes 30 days, does not affect retention costs.

## Recovery

Officially: deletion is **not recoverable**.
However, re-creating table with same name may restore access to existing data (if not purged).
This is best-effort, outside supportability boundaries.

## Re-creation

A DCR-Based (V2) table name cannot be reused for V1 type after deletion.
Exception: tables originally created as V1 then migrated to V2.

## Re-name

Tables cannot be renamed — name is an immutable ID.
