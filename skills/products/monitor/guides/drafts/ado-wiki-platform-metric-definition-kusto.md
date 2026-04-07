---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/How-To/Metric Alerts/How to get platform metric definition from Kusto"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAlerts%2FHow-To%2FMetric%20Alerts%2FHow%20to%20get%20platform%20metric%20definition%20from%20Kusto"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to get platform metric definition from Kusto

## Prerequisites

- Cluster: **azalertsprodweu.westeurope** / Database: **Insights**
- Metric name and resource type (metricNamespace) from ASC alert rule properties or customer

## Kusto Query

```kql
PlatformMetric
| where ResourceType =~ "RESOURCETYPEGOESHERE"
| where MetricName =~ "METRICNAMEGOESHERE"
| extend MetricJSON = parse_json(metricJson)
| extend FillGaps = MetricJSON.FillGapWithZero
| summarize arg_max(TIMESTAMP,*) by MetricName
| project MetricName, InternalMetricName, SupportedAggregationTypes, FillGaps, MonitoringAccount, MdmNamespace, metricJson
```

## Key Fields

| Field | Description |
|-------|-------------|
| MetricName | Metric display name |
| SupportedAggregationTypes | Available aggregation types ("_empty" = all supported) |
| FillGaps (FillGapWithZero) | Whether null metric values are replaced with 0 |
| metricJson | Full metric configuration payload |
