---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Additional Reference Material/General References/Determine History of Application Insights Component and data"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/How-To/Additional%20Reference%20Material/General%20References/Determine%20History%20of%20Application%20Insights%20Component%20and%20data"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Purpose
---
It can be key to know if data has ever flown into an Application Insights Component or did and then suddenly stopped. Understanding this is important because if it never worked means there are a lot more things to check upfront whereas if it was working until recently and '*nothing was changed*' implies a smaller set of things to investigate.

Sharing the findings in the FQR or another communication is important as it will help validate and more accurately define the issue to be solved.

## Methods:
### DFM
---
- The verbatim provided by the customer should shed clues but not always, for example, "My Application Insights data stopped showing data...".

### ASC
---
- Properties blade shows the "Created Date": See: Use the Component's Properties tab for an Application Insights Component
- Ingestion blade, can surface clues about data coming in at a prior time or if it starts and stops on some cycle, SDKs in use and etc. See Use Ingestion tab
- Customer Query Data blade, is very useful to look back though the entire retention period to see what has been coming in, volume of data, etc. While the ingestion tab gives you much the same look at the data itself allows you to adjust for multiple apps sending data to the same application Insights Component via the AppRoleName, cloud_RoleName, etc.
  -  For Native Application Insight Components
      - ```union * | where timestamp > ago(90d) | summarize count() by bin(timestamp, 30d), itemType | order by timestamp, itemType// shows looking back 90 days, by 30-day buckets what telemetry type has come```
      - ```union * | where timestamp > ago(90d) | summarize count() by bin(timestamp, 30d), itemType, sdkVersion | order by timestamp, itemType, sdkVersion // shows looking back 90 days, by 30-day buckets what telemetry type has come broken down by sdkVersion```

   - For Log Analytics based
      - ```union AppAvailabilityResults, AppBrowserTimings, AppEvents, AppMetrics, AppDependencies, AppExceptions, AppPageViews, AppPerformanceCounters, AppRequests, AppTraces | where TimeGenerated > ago(90d) | summarize count() by bin(TimeGenerated, 30d), Type | order by TimeGenerated, Type```

      - ```union AppAvailabilityResults, AppBrowserTimings, AppEvents, AppMetrics, AppDependencies, AppExceptions, AppPageViews, AppPerformanceCounters, AppRequests, AppTraces | where TimeGenerated > ago(90d) | summarize count() by bin(TimeGenerated, 30d), Type, SDKVersion  | order by TimeGenerated, Type, SDKVersion```
