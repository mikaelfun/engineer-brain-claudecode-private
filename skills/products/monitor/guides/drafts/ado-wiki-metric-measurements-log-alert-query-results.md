---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/How-To/Log Alerts/How to get query results for metric measurements log alert rules from Kusto"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAlerts%2FHow-To%2FLog%20Alerts%2FHow%20to%20get%20query%20results%20for%20metric%20measurements%20log%20alert%20rules%20from%20Kusto"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to Get Query Results for Metric Measurements Log Alert Rules from Kusto

## Instructions

1. Open ASC from the support request → navigate to Resource Explorer.
2. Locate the alert rule under **microsoft.insights** → **scheduledqueryrules** → click the rule.
3. Navigate to **Execution History** tab → filter by Start/End Time (UTC).
4. Expand the operation at the relevant timestamp → click the **Logs** link in **Evaluation logs** → redirects to Kusto Explorer with auto-populated query.

## Adjusting the Query

The auto-populated query will look like:

```kql
lsa_supportabilityEvaluationTraces(datetime(2023-04-16 09:34:23Z),datetime(2023-04-16 11:34:23Z),'bdb8b175-03da-4dbc-9a1b-a23a4d02e8e4')
| order by timestamp
```

To return only the metric result from the last retry, add:

```kql
| where message has 'Metric Search Result' or customDimensions has 'MetricResult'
```

## Reviewing Results

- **Threshold met**: The metric result exceeds the configured threshold → alert fires
- **Threshold not met**: The metric result is below the threshold → no alert
