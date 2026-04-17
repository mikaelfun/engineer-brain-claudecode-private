---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Profiler & Snapshot Debugger/Determine if Snapshot Debugger is enabled"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/How-To/Profiler%20%26%20Snapshot%20Debugger/Determine%20if%20Snapshot%20Debugger%20is%20enabled"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Purpose

Validate the Application Insight's Snapshot debugger is enabled.


# Steps

1. Leverage ASC's "Customer Query Data" tab to run the following query for, detail on using ASC's "Customer Query Data" tab see, [Use Query Customer Data tab](/Application-Insights/How%2DTo/Azure-Support-Center/Use-Query-Customer-Data-tab)

1. The following queries will show events related to Snapshot deugger"
   workspace-based: 
   ```
    AppEvents
    | where TimeGenerated > ago(5h)
    | where SDKVersion startswith "a_sc:" 
    | order by TimeGenerated asc
   ```
   native:
   ```
    customEvents
    | where timestamp > ago(5h)
    | where sdkVersion startswith "a_sc:" 
    | order by timestamp asc
   ```

1. If you see data you also need to validate it is with respect to the application in question: validate ikey and RoleName to make sure the data is coming from the application in question.

## Application Services Web Apps
1. Use App Lens to validate settings
   1. App Insights Feature Status will show if it was toggled on in the Application Insights tab of the Web App
   1. AppSettings will give more details about the same as above
   1. Per the documentation link APPINSIGHTS_SNAPSHOTFEATURE_VERSION should exist and be set to "1.0.0".

## Application Service Azure Function
- TBD, many of the data points in the web service section above should apply
