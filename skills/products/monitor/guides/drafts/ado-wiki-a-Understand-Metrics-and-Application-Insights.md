---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Learning Resources/Training/Course Materials/Portal Experiences/Understand Metrics and Application Insights"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FLearning%20Resources%2FTraining%2FCourse%20Materials%2FPortal%20Experiences%2FUnderstand%20Metrics%20and%20Application%20Insights"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Metrics in Application Insights

## Overview

Metrics are numeric data points collected at regular intervals. In Azure Monitor, metrics come from two storage locations:
- **MDM (Azure Platform)**: Pre-aggregated, fast access, limited dimensions
- **Logs**: Full dimensional data, requires ingestion processing, queried via KQL

## Log-based vs Standard Metrics

### Standard Metrics (Pre-aggregated)
- Namespace: "Application Insights standard metrics"
- Accessed via Metrics Explorer
- Faster availability (just-in-time aggregation)
- Fewer dimensions/properties
- No "Drill into Logs" option

### Log-based Metrics
- Namespace: "Log-based metrics"
- Accessed via Metrics Explorer or Logs blade
- More dimensions (full telemetry properties)
- "Drill into Logs" feature available
- Underlying query example:
```kql
requests
| where timestamp >= datetime(...) and timestamp < datetime(...)
| summarize ['requests/count_sum'] = sum(itemCount) by bin(timestamp, 1m)
| order by timestamp desc
```

### Metric Drop Choices

Both namespaces offer the same metric selections (Server requests, Server response time, etc.) because they represent the same data stored and accessed differently.

## Custom Metrics

When custom metrics are emitted via the SDK, an additional namespace "azure.applicationinsights" appears in Metric Explorer.

Sources of custom metrics:
- User-implemented via `TrackEvent`, `GetMetric`, or `TrackMetric` SDK methods
- Profiler feature
- Snapshot Debugger feature
- SDK HeartbeatState

### SDK Methods
- **TrackEvent**: Custom events with optional measurements
- **GetMetric**: Recommended - supports pre-aggregation
- **TrackMetric**: Legacy method - does NOT support pre-aggregation

## Key Diagnostic Points

1. To verify standard vs log-based metrics show same data: compare Metrics Explorer chart with Logs blade query using same time range
2. Bytes-to-MB conversion in Portal uses **binary** (1 MB = 1,048,576 bytes), not decimal
3. Custom metrics in "azure.applicationinsights" namespace may come from SDK features (Profiler, Heartbeat) even without explicit user implementation
4. Log-based metrics retain full dimensional properties; standard metrics have limited split/filter options

## Documentation
- [Metrics Comparison](https://learn.microsoft.com/en-us/azure/azure-monitor/app/metrics-overview?tabs=standard#metrics-comparison)
- [Standard metrics](https://docs.microsoft.com/azure/azure-monitor/app/standard-metrics)
- [Log-based metrics](https://docs.microsoft.com/azure/azure-monitor/essentials/app-insights-metrics)
- [Custom metrics overview](https://docs.microsoft.com/azure/azure-monitor/essentials/metrics-custom-overview)
