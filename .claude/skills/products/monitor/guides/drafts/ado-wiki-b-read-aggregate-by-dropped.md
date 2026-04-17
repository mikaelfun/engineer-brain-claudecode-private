---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Azure Support Center/Use Ingestion tab/Read Aggregate by Dropped"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FAzure%20Support%20Center%2FUse%20Ingestion%20tab%2FRead%20Aggregate%20by%20Dropped"
importDate: "2026-04-05"
type: troubleshooting-guide
---

[[_TOC_]]

#Overview
___
This aggregation shows whether data is arriving at the Application Insights ingestion endpoint and whether it is accepted or dropped.

#Considerations
___

- **Check this aggregation BEFORE** running Dropped by Reason.
- **Success** status = telemetry reached the ingestion endpoint and was accepted.
- This aggregation can change the direction of many investigations, as the issue and troubleshooting differs significantly between:
  - Data arriving and accepted (Success) → look downstream
  - Data dropped at ingestion → investigate ingestion-level issues
  - Data not arriving at all → investigate network connectivity
- ⚠️ It does **not** indicate whether a specific application's telemetry made it in — if multiple apps share the same AI resource and only Success is shown, it **cannot** be assumed that all applications' telemetry is reaching ingestion.

#Decision Tree
___

## Scenario 1: All Success, No Dropped

- Telemetry is reaching the ingestion endpoint and being accepted.
- **No need** to run Dropped by Reason — it will return no results.
- If customer still reports missing data, investigate **downstream**: Log Analytics (ODS) ingestion, Daily Cap, or Data Collection Rules (DCRs) could be dropping the telemetry after it is accepted at the AI ingestion endpoint.

## Scenario 2: Mixed Success + Dropped

- Some telemetry is arriving and being accepted; some is being dropped.
- **Next step**: Run **"Dropped by Reason"** aggregation to understand why data is being dropped.
- Note the right-hand side of the graph: if data flat lines (most recent time), it indicates data stopped arriving at the ingestion endpoint entirely — this is a different problem.

## Scenario 3: Data Flat Lines (No Arrivals at All)

- The graph shows data stopped arriving at the ingestion endpoint entirely.
- This is **NOT** a Breeze drop issue — it indicates network connectivity issues preventing telemetry from reaching the endpoint.
- Does NOT reflect telemetry that never arrives due to network issues.
- Investigate network path between the application and the AI ingestion endpoint.

#Important Limitations
___
- This aggregation does **not** show what happens to telemetry **after** it is accepted at the AI ingestion endpoint. Downstream components (Log Analytics ODS, DCRs) can still cause data loss.
- Does **not** distinguish which specific application's telemetry is affected when multiple apps share one AI resource.

#Related Pages
___
- [Use Ingestion tab](/Application-Insights/How%2DTo/Azure-Support-Center/Use-Ingestion-tab)
- [Read Aggregate by Dropped By Reason](/Application-Insights/How%2DTo/Azure-Support-Center/Use-Ingestion-tab/Read-Aggregate-by-Dropped-By-Reason)
- [Missing or incorrect telemetry and performance issues - Overview](https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/583843/Missing-or-incorrect-telemetry-and-performance-issues)

___
Created by: matthofa
Created: Sep 12, 2025
Last Modified by: matthofa
Last Modified on: Sep 12, 2025
