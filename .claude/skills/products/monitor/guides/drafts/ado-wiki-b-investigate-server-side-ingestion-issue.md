---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Additional Reference Material/Ingestion References/Investigate server-side Ingestion issue"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/How-To/Additional%20Reference%20Material/Ingestion%20References/Investigate%20server-side%20Ingestion%20issue"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Investigate Server-side Ingestion Issue

> **Status: In Development**

## Overview

Once an ingestion issue is identified as server-side based on investigation from "Identify Ingestion issues", narrow the problem further to determine where in the ingestion process things are getting hung up.

- **Classic Application Insights**: `_TimeReceived` = time arriving at Breeze endpoint
- **Workspace-based resources**: `_TimeReceived` = time arriving at ODS

Once confirmed server-side, the most efficient course of action is to **open ICM with the ingestion team**.

## Additional Resources

- Log Analytics ingestion troubleshooting flowchart: https://supportability.visualstudio.com/AzureLogAnalytics/_wiki/wikis/Azure-Log-Analytics.wiki/437465/Data-ingestion-troubleshooting-flowchart
- Azure platform and resource logs data ingestion troubleshooting: https://supportability.visualstudio.com/AzureLogAnalytics/_wiki/wikis/Azure-Log-Analytics.wiki/437468/Azure-platform-and-resource-logs-data-ingestion-troubleshooting-workflow

## Log Analytics Based — ODSPostTelemetry Table

The `ODSPostTelemetry` table in the **Azureinsights** cluster (`https://azureinsights.kusto.windows.net`) is an excellent table for the next phase of investigation.

### Key Fields

- `TIMESTAMP` / `PreciseTimeStamp` → should map to `_TimeReceived` value in user data
- `availableTime`, `insertionTime` → earlier time window than TIMESTAMP, operations preceding data getting to ODS from the OBO Service

### Sample Query

```kql
ODSPostTelemetry
| where TIMESTAMP > ago(2h)
| where subscriptionId == "subid-here"
| where workspaceId == "workspaceid-here"
| where category == "AppRequests"
| where resourceId == "/SUBSCRIPTIONS/subid-here/RESOURCEGROUPS/rg-name-here/PROVIDERS/MICROSOFT.INSIGHTS/COMPONENTS/componentname-here"
//| project TIMESTAMP, PreciseTimeStamp, availableTime, insertionTime
| order by TIMESTAMP
```
