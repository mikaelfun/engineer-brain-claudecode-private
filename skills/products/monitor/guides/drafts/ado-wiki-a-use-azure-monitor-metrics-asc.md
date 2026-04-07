---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Azure Support Center/Use Azure Monitor Metrics"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FAzure%20Support%20Center%2FUse%20Azure%20Monitor%20Metrics"
importDate: "2026-04-05"
type: troubleshooting-guide
---

## Overview

This ASC tab allows inspection of metric data available through the Metrics API (MDM). The information here maps to what is seen in the Metrics tab — specifically data where the Metric Namespace is **NOT** Log-based metrics but rather **Application Insights standard metrics** or **azure.applicationinsights**.

## Considerations

This feature is very useful for validating data available through the Metrics API. Knowing the "Metric Namespace" is key:
- If metrics are not available in the Metrics blade, this can be validated here
- If metrics are reported as incorrect, this can be validated here

## Workflow

### Application Insights Standard Metrics

1. The default experience is set up for accessing standard metrics
2. Click "Click to populate or refresh the metric namespace list" to get available metrics
3. Select an available metric from the dropdown and use "Click to populate or refresh other configurations"
4. The items in the dropdown map to the options available in the Metric dropdown assuming the Metric Namespace is "Application Insights standard metrics" — this allows simulating what the user sees in the portal
5. Adjust the time window to match what is used in Metrics in the portal
6. Once settings are set, the graph and raw data are returned — should match closely to what is in the Metrics option of the portal

### azure.applicationinsights (Custom Metrics)

1. Uncheck the initial checkbox for "Apply platform namespace"
2. Click "Click to populate or refresh the metric namespace list" — a new dropdown appears
3. The default choice is "Application Insights standard metrics" — drop it down to find **azure.applicationinsights**
4. Select this other choice and hit "Click to populate or refresh metric list" to proceed with a similar experience as the standard metrics workflow

## Reference

- Generic reference: [How to chart metric data in Azure Support Center](/Monitoring-Essentials/Metrics/How-To/How-to-chart-metric-data-in-Azure-Support-Center)
- Last Modified: 2024/07/15 by matthofa
