---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/How-To/AMA: HT: Review agent data in ingestion pipeline"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAzure%20Monitor%20Agent%20(AMA)%20-%20NEW%20STRUCTURE%2FHow-To%2FAMA%3A%20HT%3A%20Review%20agent%20data%20in%20ingestion%20pipeline"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# AMA: How To Review Agent Data in Ingestion Pipeline

## Overview

When the agent sends data to Azure, data flows through the ingestion pipeline composed of many different services before it arrives at the final destination and is made available to query.

## Access Requirements

- Open [Security Groups](https://idweb.microsoft.com/IdentityManagement/aspx/groups/AllGroups.aspx)
- Request Access to **"AzNS Kusto Viewers"**

## Key Terms

- **InputType**: The data type incoming to the pipeline
- **OutputType**: The destination table name in Log Analytics Workspace

## Common InputTypes

- `HEALTH_ASSESSMENT_BLOB` (Heartbeat)
- `GENERIC_PERF_BLOB` (Performance counters)
- `GENERIC_EVENT_BLOB` (Windows Event Logs)
- `Custom/dcr-<DCR.ImmutableID>/Custom-Text-<TableName>` (Custom text logs)
- `Custom/dcr-<DCR.ImmutableID>/Custom-Json-<TableName>` (Custom JSON logs)
- `CONFIG_CHANGE_BLOB_V2` / `CONFIG_CHANGE_BLOB`
- `CONFIG_DATA_BLOB_V2`
- `LINUX_PERF_BLOB`
- `SECURITY_CEF_BLOB`
- `LINUX_SYSLOGS_BLOB`
- `INSIGHTS_METRICS_BLOB`

## Kusto Queries (Cluster: omsgenevatlm.kusto.windows.net / Database: GenevaNSProd)

### Latest Event per InputType per DCR

```kql
let resource = "AMAResourceID";
cluster("omsgenevatlm.kusto.windows.net").database("GenevaNSProd").ProcessedChunk
| where TIMESTAMP > ago(1h)
| where tolower(ResourceId) == tolower(resource)
| summarize arg_max(TIMESTAMP, *) by InputType, DcrId
```

### Heartbeat Count (Last 24h)

```kql
let inputType = "HEALTH_ASSESSMENT_BLOB";
let resource = "/subscriptions/xxx/resourceGroups/xxx/providers/Microsoft.Compute/virtualMachines/xxx";
cluster("omsgenevatlm.kusto.windows.net").database("GenevaNSProd").ProcessedChunk
| where TIMESTAMP > ago(1d)
| where tolower(ResourceId) == tolower(resource)
| where InputType == inputType
| summarize count() by InputType, OutputType, Codes, ResourceId
```

### Heartbeat Count (Specific Time Range)

```kql
let inputType = "HEALTH_ASSESSMENT_BLOB";
let resource = "/subscriptions/xxx/resourceGroups/xxx/providers/Microsoft.Compute/virtualMachines/xxx";
cluster("omsgenevatlm.kusto.windows.net").database("GenevaNSProd").ProcessedChunk
| where TIMESTAMP between (datetime(2024-07-03 00:00:00) .. datetime(2024-07-04 00:00:00))
| where tolower(ResourceId) == tolower(resource)
| where InputType == inputType
| summarize count() by InputType, OutputType, Codes, ResourceId
```

### Most Recent Heartbeat (Last 7d)

```kql
let inputType = "HEALTH_ASSESSMENT_BLOB";
let resource = "/subscriptions/xxx/resourceGroups/xxx/providers/{provider}/{resourceType}/{machineName}";
cluster("omsgenevatlm.kusto.windows.net").database("GenevaNSProd").ProcessedChunk
| where TIMESTAMP > ago(7d)
| where tolower(ResourceId) == tolower(resource)
| where InputType == inputType
| summarize arg_max(TIMESTAMP, *)
| project TIMESTAMP, InputType, OutputType, Codes, ResourceId
```

### Largest Heartbeat Gaps (Last 7d)

```kql
let inputType = "HEALTH_ASSESSMENT_BLOB";
let resource = "/subscriptions/xxx/resourceGroups/xxx/providers/{provider}/{resourceType}/{machineName}";
cluster("omsgenevatlm.kusto.windows.net").database("GenevaNSProd").ProcessedChunk
| where TIMESTAMP > ago(7d)
| where tolower(ResourceId) == tolower(resource)
| where InputType == inputType
| order by TIMESTAMP asc
| extend previous = prev(TIMESTAMP)
| extend DifferenceTR = TIMESTAMP - previous
| project ResourceId, DifferenceTR, TIMESTAMP, previous
| order by DifferenceTR
| take 10
```

### Windows Event Log Streams

```kql
let resource = "AMAResourceID";
cluster("omsgenevatlm.kusto.windows.net").database("GenevaNSProd").ProcessedChunk
| where TIMESTAMP > ago(1h)
| where tolower(ResourceId) == tolower(resource)
| where InputType == "GENERIC_EVENT_BLOB"
| summarize arg_max(TIMESTAMP, *) by InputType, OutputType, Codes, ResourceId, DcrId, OutputPartitionId, workspaceId = CustomerId
```

### Custom Text Log Streams

```kql
let resource = "AMAResourceID";
cluster("omsgenevatlm.kusto.windows.net").database("GenevaNSProd").ProcessedChunk
| where TIMESTAMP > ago(1d)
| where tolower(ResourceId) == tolower(resource)
| where InputType has "Custom"
| summarize arg_max(TIMESTAMP, *) by InputType, OutputType, Codes, ResourceId, DcrId, OutputPartitionId, workspaceId = CustomerId
```
