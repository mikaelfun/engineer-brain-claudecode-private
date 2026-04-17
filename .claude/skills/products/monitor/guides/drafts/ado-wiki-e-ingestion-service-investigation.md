---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Additional Reference Material/Ingestion References/Ingestion service investigation"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/How-To/Additional%20Reference%20Material/Ingestion%20References/Ingestion%20service%20investigation"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Ingestion Service Investigation

## Overview

This focuses on validating aspects related to the data arriving at the Application Insights ingestion endpoint. Use this after confirming that an ingestion issue exists (see: Identify Ingestion Issues).

## Ingestion Pipeline

The ingestion endpoint for Application Insights is internally known as "breeze". After breeze accepts the telemetry from SDK/Agent, it hands off to the Log Analytics ingestion pipeline for final write to tables.

## Step by Step Instructions

1. **Confirm telemetry is reaching the ingestion endpoint**
   - Check ASC: Read Aggregate by Dropped
   - Message "There was no data found for the specified time range" indicates no telemetry reaching the AI resource → problem is network connectivity or SDK not sending

2. **If telemetry is reaching but dropped, investigate why**
   - Check ASC: Read Aggregate by Dropped By Reason

3. **Daily Cap check** (two levels):
   - Dropped by reason "Quota Exceed / Q" → Application Insights Daily Cap hit
   - If AI ingestion shows no drops but data is missing → check Log Analytics Daily Cap downstream
   - Whichever cap is hit first takes effect

4. **Verify Data Collection Rules (DCRs)**
   - If Daily Cap not being hit, Log Analytics may have DCRs filtering telemetry
   - Check DCRs in Azure Portal Tables pane

5. **Check for latent data**
   - Latent data can be mistaken for missing data
   - Use ingestion latency queries to validate

## Kusto Investigation (Server-side)

For confirmed server-side issues, query `ODSPostTelemetry` in the Azureinsights cluster:

```kql
ODSPostTelemetry
| where TIMESTAMP > ago(2h)
| where subscriptionId == "subid-here"
| where workspaceId == "workspaceid-here"
| where category == "AppRequests"
| where resourceId == "/SUBSCRIPTIONS/subid/RESOURCEGROUPS/rg/PROVIDERS/MICROSOFT.INSIGHTS/COMPONENTS/component"
| order by TIMESTAMP
```

Key columns:
- **TIMESTAMP/PreciseTimeStamp** — maps to `_TimeReceived` in user data
- **availableTime, insertionTime** — earlier timestamps from OBO Service before data reaches ODS

Most efficient course of action for confirmed server-side issues: open ICM with the ingestion team.

## Additional Resources

- [Log Analytics Data ingestion troubleshooting flowchart](https://supportability.visualstudio.com/AzureLogAnalytics/_wiki/wikis/Azure-Log-Analytics.wiki/437465/Data-ingestion-troubleshooting-flowchart)
- [Azure platform and resource logs data ingestion troubleshooting workflow](https://supportability.visualstudio.com/AzureLogAnalytics/_wiki/wikis/Azure-Log-Analytics.wiki/437468/)

## Public Documentation

- [Troubleshoot missing application telemetry](https://learn.microsoft.com/troubleshoot/azure/azure-monitor/app-insights/telemetry/investigate-missing-telemetry)
- [Azure Monitor endpoint access and firewall configuration](https://learn.microsoft.com/azure/azure-monitor/fundamentals/azure-monitor-network-access#outgoing-ports)
