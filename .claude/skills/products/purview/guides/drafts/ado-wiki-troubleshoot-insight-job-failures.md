---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Troubleshooting Guides (TSGs)/Insights/Troubleshoot insight job failures"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Troubleshooting%20Guides%20(TSGs)/Insights/Troubleshoot%20insight%20job%20failures"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Troubleshoot Insights Report Job Failures

In this article you will learn how to troubleshoot and identify issues caused by insights reports failed Jobs, specifically tracking the insights job in the Platform Job Services.

## Background

When insights reports refresh, jobs are submitted through:
**Insights → Platform Job Services (PJS) → Actual Synapse Job**

## What Details to Collect from Customer

- Purview account details: tenant ID, Purview account name

## Tracking the Insights Job

### Step 1: Identify the Job ID

Use the following Kusto to determine the `JobId` of the `AtlasAnalytics` job:

**Cluster**: `babylon.eastus2.kusto.windows.net` / **Database**: `babylonMdsLogs`

```kusto
JobInfoEvent
| where JobName == "AtlasAnalytics" and AccountName == "<purview-account-name>"
| order by TIMESTAMP desc
| project TIMESTAMP, JobStatus, AccountName, JobId, PipelineId, CatalogId, CoreCount, JobName
```

### Step 2: Confirm JobStatus is "Failed"

Use the `JobId` from Step 1 and confirm the `JobStatus` is failed.

### Step 3: Find the RunId

Use the `JobId` from Step 1 to query PJS:

```kusto
SparkManagementServiceLog
| where * contains "<jobid-from-step-1>"
```

Look at the `Message` column and search for the `runId`. Typical output:

```
"jobType":"LegacySpark","partnerType":"Purview","jobOwnerId":"...","jobDefinitionId":"...","runId":"6f562914-XXXX-XXXX-XXXX-4e8afdf5d5e7"
```

### Step 4: Trace the RunId for Status Details

```kusto
SparkManagementServiceLog
| where JobRunId contains "<runid-from-step-3>"
| order by ['time'] desc
```

Look at the `Message` column for status information:

- `"jobRunStatus":"TimedOut"` — Job exceeded time limit
- `"Status: Faulted; Message: Job run has exceeded 1320 minute limit"` — Exceeded ~22hr limit

Also look for the `correlationId` in the same message.

### Step 5: Track the Synapse Job

Use the `correlationId` from Step 4:

```kusto
JobServiceLog
| where CorrelationId == "<correlationid-from-step-4>"
```

Look at the `Message` column for `StatusCode` and `Status` (e.g., `"StatusCode":"500","Status":"TimedOut"`).

## Escalation

PG may need to collaborate with Platform Job Services ICM team to identify the RCA. TSG reference: [JobService Background Job Failures](https://eng.ms/docs/microsoft-security/cloud-ecosystem-security/microsoft-sentinel-graph-msg/security-platform-ecosystem/security-platform-purview/microsoft-purview-troubleshooting-guides/troubleshooting/platformjobservice/jobservicebackgroundjobfailures)
