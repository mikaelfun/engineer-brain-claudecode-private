---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Additional Reference Material/Metrics References/Query the Metrics Resource Provider Diagnostic Logs"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/How-To/Additional%20Reference%20Material/Metrics%20References/Query%20the%20Metrics%20Resource%20Provider%20Diagnostic%20Logs"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Query the Metrics Resource Provider Diagnostic Logs

## What is the Metrics Resource Provider?

Every Azure resource exposes a control plane to ARM, allowing customers to call into ARM to create, manage, query or modify an Azure resource. Any given Azure resource may produce one or more Metrics that get saved to some MDM account within Geneva. The Metrics Resource Provider is the control plane used for creating and querying those metrics.

## When to Review Diagnostic Logs

Review Metrics RP diagnostic logs for customers who have problems trying to view metrics within the Azure Portal, or within standard or custom Workbooks. If there are any problems trying to query for a resource's metrics, the Metrics RP diagnostic logs may have additional information.

Metrics requests in HAR traces go through ARM and target the Metrics RP:
- `httpMethod = GET`
- URL pattern: `.../providers/microsoft.Insights/metrics?timespan=...&metricnames={metricName}&...`

Notice how `/providers/microsoft.Insights/metrics` is appended to the end of the resource URI.

## How to Pull Diagnostic Logs

1. **Grab a HAR trace** while customer reproduces the problem navigating TO the impacted Azure Portal webpage, Dashboard or Workbook.

2. **Open the HAR trace** (or import into Fiddler) and look for the individual request for the metrics that fail to load. Look for requests to ARM with `/providers/microsoft.Insights/metrics` URI path.

3. **Find the `x-ms-correlation-request-id`** response HTTP header value from the metrics API response.

4. **Build a DGrep query** using that header value:
   - **Endpoint**: Diagnostics PROD
   - **Namespace**: AzMonMetrics
   - **Events to search**: LogEventsV1
   - **Time range**: From the HAR trace response timestamp
   - **Scoping Conditions**: `Environment == metricsrpprod`
   - **Filtering conditions**: `AnyField contains {x-ms-correlation-request-id value}`

5. **Review results** — search for rows where `TaskName` column contains `LogError`. Review `Message` column for additional details.

6. **If Metrics RP logging does not provide insights**, open a CRI for Application UX team. ICM Team: **Application Insights/Azure Monitor UX Extension + Metrics UX (Not Autoscale, Not Diagnostic Settings, Not Logs, and Not Alerting)**

## Next Steps

The root cause may not be with Metrics RP code — it may require further investigations by the underlying Resource Provider that produces the metrics, so the ICM/CRI may move to the underlying RP team.
