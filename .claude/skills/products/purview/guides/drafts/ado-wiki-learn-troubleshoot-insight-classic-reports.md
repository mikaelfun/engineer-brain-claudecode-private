---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Troubleshooting Guides (TSGs)/Insights/Learn and troublehoot insight classic reports"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Troubleshooting%20Guides%20(TSGs)/Insights/Learn%20and%20troublehoot%20insight%20classic%20reports"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Learn & Troubleshoot classic reports not getting refreshed in purview portal

## Issue

Customers are seeing that the classic reports in purview portal are not getting updated

## Background

Classic report has a cadence of 7 days which cannot be controlled by customer as documented here:
[Health Management Reports in Unified Catalog | Microsoft Learn](https://learn.microsoft.com/en-us/purview/unified-catalog-reports)

Classic reports refresh weekly. You can't change the schedule. Classic reports don't have any impact to the [data governance billing model](https://learn.microsoft.com/en-us/purview/data-governance-billing). When you consent to using Unified Catalog, the billing model starts, but classic reports have no charge.

## What details to collect from customer

- Purview account details like tenant id, purview account name
- Har trace

## Brief technical details

There are multiple jobs that are responsible for each report that are run in the background:

### AtlasRDDV3 / AtlasRDDV2 jobs

- **Jobname:** AtlasRDDV3 / AtlasRDDV2
- **Purpose:** Foundation jobs that process all Atlas entities into DeltaLake and create hourly time windows (YYYY/MM/DD/HH).
- **Impact:** ALL downstream reports depend on these jobs.
- **Customer Impact:** If these fail, no reports update.
- **Reports Generated:** None directly (they enable all other reporting jobs).

### AtlasAnalytics jobs

- **Purpose**: Primary report generation job.
- **Reports Generated:**
  - **Assets Tab Reports:**
    - All Data Assets Details
    - Asset Distribution (Source, Collection, Classification)
  - **Stewardship/Insights Reports:**
    - Conformity Tile
    - Consistency Tile
    - Classifications & Sensitivity Labels Insights
    - Deleted Assets (30-day view)
  - **Adoption/Health Reports:**
    - User Activity Stats
    - Most Viewed Assets
    - Manual Curation Events

Customer Impact: If this fails, reports show stale or missing data.

## Troubleshooting

Check the `JobInfoEvent` table in kusto to check the status of the jobs

**Kusto cluster:** `babylon.eastus2.kusto.windows.net` / database: `babylonMdsLogs`

```kql
JobInfoEvent
| where TenantId == "<TENANT ID>"
| where AccountName == "<ACCOUNT NAME>"
| where JobName == "AtlasAnalytics" // other jobnames: "AtlasRDDV3", "AtlasRDDV2"
| order by TIMESTAMP desc
| project JobName, JobStatus, TIMESTAMP, PipelineId, CatalogId, RequestId, TenantId
```

Based on the `JobName` and `JobStatus` continue the troubleshooting:
- If the job didn't start at all → look at the **Orchestration** layer
- If the job is in Failed or InProgress → look at the **Execution** layer

## Orchestration layer

This layer is logged in `PipelineManagerLogEvent` Kusto table.

**Use When:**
- Job didn't start at all
- Job shows status **Disabled** or **UpstreamDependencyFailed**
- Need to understand WHY job was skipped
- Core count calculation issues
- Job timeout configuration

```kql
PipelineManagerLogEvent
| where TIMESTAMP > ago(7d)
| where CatalogId == "<catalog-id>"
| where JobName in ("AtlasRDDV3", "AtlasAnalytics")
| where Message contains "disabled" or Message contains "Upstream" or Message contains "CoreCount"
| project TIMESTAMP, JobName, Message, LogType
| order by TIMESTAMP desc
```

Filter for `LogType` = `Error` and `Warning` to find the probable cause.

## Execution layer

This layer is logged in `SparkJobLogEvent` Kusto table.

**When to use:**
- Job status = **Failed** or **InProgress**
- Python code exceptions/errors
- Memory/compute resource exhaustion
- Tracking file write failures

```kql
SparkJobLogEvent
| where TIMESTAMP > ago(7d)
| where CatalogId == "<catalog-id>"
| where JobName == "AtlasAnalytics"
| where LogLevel == "ERROR" or LogLevel == "WARN"
| where Message contains "Exception" or Message contains "failed" or Message contains "error"
| project TIMESTAMP, JobName, Message, LogLevel
| order by TIMESTAMP desc
```

## Reporting logs

**When to Use:**
- Jobs succeeded but UI still shows "No Data"
- Checking if report calculations completed
- Validating report refresh timestamps
- ReportingError - No logs

```kql
ReportingLog
| where TIMESTAMP > ago(7d)
| where CorrelationId == "<CorrelationId from customer>"
```

## Escalation path

To create an ICM with the insights team, select the `insights` [template in ASC](https://supportability.visualstudio.com/Azure%20Purview/_wiki/wikis/Microsoft%20Purview/2292595/CRI-Creation-through-ASC).
