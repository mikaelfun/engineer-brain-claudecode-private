---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/How-To Guides/AppLens Overview/Cluster Ingestion Volume (BillingStatistics) Detector"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FHow-To%20Guides%2FAppLens%20Overview%2FCluster%20Ingestion%20Volume%20(BillingStatistics)%20Detector"
importDate: "2026-04-07"
type: troubleshooting-guide
---

### Overview

This AppLens detector tracks the **daily billable ingestion volume (in GB)** for a **specific Kusto cluster** over the past 30 days.
It is especially useful for:
- Investigating ingestion volume patterns.
- Correlating ingestion spikes with overquota or throttling alerts.
- Troubleshooting ingestion-related CRIs or escalations.

### How It Works
The detector queries the `BillingStatistics` table and:
- Filters based on the provided **Cluster ID** (GUID).
- Aggregates ingestion volume per day.
- Returns results **as a table format**

### Input Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `Cluster ID` | `GUID` | The GUID of the Kusto cluster to analyze. |

### Instructions

Before running the query:
1. Copy the **Cluster ID** from the relevant Kusto cluster (e.g., from Azure Resource Explorer or internal tooling).
2. Paste it into the **Cluster ID (GUID)** input field.
3. Click **Submit**.

### KQL Logic Summary

```kql
let clusterId = '{clusterId}';
BillingStatistics
| where SampleTime > ago(30d)
| where ClusterId == clusterId
| where IsBillable == true
| summarize TotalInGBytes = sum(BillableSize) / 1024.0 / 1024.0 / 1024.0 by bin(SampleTime, 1d)
| sort by SampleTime asc
```

### Known Limitations

- This detector queries **only the Production environment** (FF/MC are not covered).
- The **query is hardcoded** to retrieve data from the **last 30 days**; custom time ranges are not supported.
- It supports **only clusters with billing data** available in the `BillingStatistics` table.
- **Non-billable ingestion** data is **excluded** from the results.
