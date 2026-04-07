---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Additional Reference Material/Ingestion References/Identify Ingestion issues"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/How-To/Additional%20Reference%20Material/Ingestion%20References/Identify%20Ingestion%20issues"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Identify Ingestion Issues

## Overview

Ingestion issues manifest as latency in the availability of data for querying in logs or metrics. Such latency can lead to problems like false alerts being triggered (or not triggered) and graphs not accurately reflecting data.

Expected latency in Azure Monitor is typically within 3 to 5 minutes on average. For Application Insights, data is generally available within 2 to 3 minutes (occasional slowdowns up to 5 minutes can occur).

There may be instances where data latency extends to several minutes or even hours, indicating a potential widespread outage scenario in the backend.

## Key Concepts

| Concept | Definition |
|---------|-----------|
| **timestamp** | Time the event occurred as recorded on the client |
| **_TimeReceived** | Time telemetry arrived at ingestion service (Breeze for Classic, ODS for Workspace-based) |
| **$IngestionTime** | Time telemetry was made available to query in the portal |

## Latency Measurements

| Measurement | Formula | Definition |
|-------------|---------|-----------|
| **TimeRequiredtoGettoAzure** | `_TimeReceived - timestamp` | Time from SDK to ingestion endpoint |
| **TimeRequiredtoIngest** | `ingestion_time() - _TimeReceived` | Time through ingestion pipeline |
| **EndtoEndTime** | `ingestion_time() - timestamp` | Total end-to-end time |

**Important Note:** For workspace-based resources, `_TimeReceived` logs the time telemetry arrives at ODS (not Breeze), so queries cannot accurately determine whether ingestion latency is client-side or service-side.

**Key Consideration:** If `TimeRequiredtoIngest` is low but `EndtoEndTime` is high, the delay is between SDK sending and ODS. Historically Breeze is not the culprit — it will typically be the SDK or OBO.

## Investigation Workflow

### 1. Confirm when the ingestion latency started

**Classic Application Insights:**
```kql
let start = datetime("2022-06-01 05:00:00");
let end = datetime("2022-06-02 01:00:00");
requests
| where timestamp > start and timestamp < end
| extend TimeRequiredtoGettoAzure = _TimeReceived - timestamp
| extend durationinseconds = bin((ingestion_time() - _TimeReceived)/1s, 1)
| extend EndtoEndTime = ingestion_time() - timestamp
| project timestamp, _TimeReceived, TimeRequiredtoGettoAzure, EndtoEndTime, durationinseconds
| summarize avg(durationinseconds) by bin(timestamp, 1h)
| where avg_durationinseconds > 100
| order by timestamp asc
```

**Workspace-based Application Insights:**
```kql
let start = datetime("2022-06-01 05:00:00");
let end = datetime("2022-06-02 01:00:00");
AppRequests
| where TimeGenerated > start and TimeGenerated < end
| extend TimeRequiredtoGettoAzure = _TimeReceived - TimeGenerated
| extend durationinseconds = bin((ingestion_time() - _TimeReceived)/1s, 1)
| extend EndtoEndTime = ingestion_time() - TimeGenerated
| project TimeGenerated, _TimeReceived, TimeRequiredtoGettoAzure, EndtoEndTime, durationinseconds
| summarize avg(durationinseconds) by bin(TimeGenerated, 1h)
| where avg_durationinseconds > 100
| order by TimeGenerated asc
```

**More robust query (union all tables):**
```kql
union availabilityResults, browserTimings, dependencies, exceptions, customEvents, customMetrics, pageViews, performanceCounters, requests, traces
| where timestamp > datetime(11/8/2025 12:00:00 AM)
| where timestamp < datetime(11/14/2025 12:00:00 AM)
| extend ingestionTime = ingestion_time()
| extend OverallLatency = ingestionTime - timestamp
| extend LogAnalyticsServiceLatency = ingestionTime - _TimeReceived
| extend SourceLatency = _TimeReceived - timestamp
| project itemType, sdkVersion, OverallLatency, SourceLatency, LogAnalyticsServiceLatency, timestamp, _TimeReceived, ingestionTime
| summarize avg(SourceLatency), count() by bin(timestamp, 1h), sdkVersion, itemType
| where avg_SourceLatency > totimespan("00:05:00.0000000")
| order by timestamp asc, sdkVersion, itemType
```

### 2. Identify missing data gaps

```kql
// Classic
requests
| where timestamp > start and timestamp < end
| summarize count() by bin(timestamp, 1h)
| order by timestamp asc

// Workspace-based
AppRequests
| where TimeGenerated > start and TimeGenerated < end
| summarize count() by bin(TimeGenerated, 1h)
| order by TimeGenerated asc
```

### 3. Determine extent and impact

Check if latency occurs across multiple tables and multiple applications (using `cloud_RoleName` / `AppRoleName`).

**Impact assessment query:**
```kql
union traces, requests, customEvents, dependencies, performanceCounters
| where timestamp > ago(7d)
| extend ClientLatency = _TimeReceived - timestamp
| extend TimeRequiredtoIngest = ingestion_time() - _TimeReceived
| extend EndtoEndTime = ingestion_time() - timestamp
| extend DelayCategory = case(
    EndtoEndTime > 10m and ClientLatency <= 5m, "IngestionPipeline",
    ClientLatency > 5m, "ClientLatency",
    "Other")
| summarize
    TotalRecords = count(),
    SlowCount_5m = countif(EndtoEndTime > 5m),
    SlowCount_15m = countif(EndtoEndTime > 15m),
    SlowCount_30m = countif(EndtoEndTime > 30m),
    SlowCount_60m = countif(EndtoEndTime > 60m),
    IngestionPipelineCount = countif(DelayCategory == "IngestionPipeline"),
    ClientLatencyCount = countif(DelayCategory == "ClientLatency")
    by bin(timestamp, 1d)
| sort by timestamp desc
```

### 4. Decision tree — Where to investigate next

- **High `TimeRequiredtoIngest`** → Server-side issue, collaborate with SME/TA, consider ICM.
- **High `TimeRequiredtoGettoAzure`** → May be client-side BUT:
  - For workspace-based resources, cannot accurately distinguish client vs. service-side.
  - Check if latency affects both server-side (`requests`) and client-side (`pageViews`) telemetry → likely service-side.
  - Check if latency affects multiple apps in different networks/regions → likely service-side.
  - Check if behavior is region-specific → may indicate regional issue.
- **Client-side indicators**: latency specific to certain app pools, VNets, or on-premises servers.
- **DNS resolution** could cause latency — test with repeated NSLookup.

### 5. Example investigation

When `TimeRequiredtoGettoAzure` shows sudden increase (e.g., from ~7 seconds to 2+ hours), SDK was caching data until it could send. This indicates network issue, not SDK issue. Confirm by comparing counts binned by `_TimeReceived` (shows gap) vs. counts binned by `timestamp` (shows consistent data collection).
