---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitoring Essentials/Diagnostic Settings/Troubleshooting Guides/[TSG] Diagnostic Settings Telemetry"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitoring%20Essentials%2FDiagnostic%20Settings%2FTroubleshooting%20Guides%2F%5BTSG%5D%20Diagnostic%20Settings%20Telemetry"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# [TSG] Diagnostic Settings Telemetry

## Important - Common Misroutes
This article deals exclusively with Diagnostic Settings (Microsoft.Insights/diagnosticSettings) and data delivered by the Diagnostics Pipeline (OBO).

**NOT covered by this guide:**
- Legacy Activity Log collection (Log Profiles)
- Legacy Activity Log Solution
- Diagnostic Extension (WAD/LAD) on VMs - these are NOT Diagnostic Settings despite the portal labeling

## First Step
Before any deep investigation: **Delete & Recreate the Diagnostic Setting.** This resolves many issues.

## Scenario
Resource Log data has not been received as expected by one or more target destinations (Log Analytics, Storage Account, Event Hub, Partner Solution) as defined by Diagnostic Settings.

## Information Needed
- Azure Resource ID (ARM URI, Subscription ID for Activity Logs, Tenant ID for Entra/Intune Logs)
- Time window during which the issue occurred
- How customer identified that data is not being received

## Troubleshooting with Diagnostic Settings Telemetry Dashboard

### Step 1 - Supply Resource Id
Use the [Diagnostic Settings Telemetry Dashboard](https://dataexplorer.azure.com/dashboards/73942b7a-2530-4d30-a4b2-6c63f2bcd113).
Supply either: Resource Id, Subscription Id (Activity Logs), or Tenant Id (Entra Logs).

### Step 2 - Select Data Category
After supplying a Resource Id, charts and Data Category parameter populate.
- If desired category is missing from dropdown, there is no data from that category within the time window
- Leave blank to review all categories at once

### Step 3 - Check for Issues

**Errors:**
- Populate in "OBO to [destination]" charts
- Only tracks errors that persisted through retries (not transient)
- Check "Delivery" field: "Failed" = persistent errors, "Succeeded" = no persistent failures

**Latency:**
- Viewable in "Latency Aggregations" section
- Default aggregation is 50th percentile (median), toggleable to 75%, 95%, 99%
- Stacked chart shows Normalizer Latency (upstream) vs OBO pipeline latency
- Only tracks latency for successfully delivered records

### Step 4 - Analysis Decision Tree

**Scenario A: RP -> [no data] -> OBO -> Destination**
- No data of the investigated category coming TO OBO
- The Resource Provider is not sending data for OBO to export
- Action: Collaborate with the associated RP to investigate why data is not being sent from the source

**Scenario B: RP -> OBO -> [no data] -> Destination**
- Data coming TO OBO, but OBO not forwarding to destination
- Action: Review errors/failures in the dashboard. If no failures recorded but data clearly not forwarding, escalate for deeper review

**Scenario C: RP -> OBO -> Destination -> [data missing]**
- Data coming to OBO AND being sent successfully to destination, but still not visible
- Action: Review destination-side issues (e.g., Log Analytics ingestion errors, Storage Account/Event Hub destination limitations and network requirements)
