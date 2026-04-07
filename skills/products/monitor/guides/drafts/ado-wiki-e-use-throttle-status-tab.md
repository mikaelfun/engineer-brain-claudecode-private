---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Azure Support Center/Use Throttle Status tab"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FAzure%20Support%20Center%2FUse%20Throttle%20Status%20tab"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Use Throttle Status tab

## Overview

The Throttle Status page indicates if the user is encountering throttling with respect to their Application Insights resource. This is most commonly encountered due to Daily Cap.

**NOTE:** This is the current status with respect to Daily Cap being hit. However if you are looking at this after the daily reset time has passed then this page will show throttling is not occurring.

## General Usage

| Property | Description |
|------|-------------|
| Application Id | Is the same value seen on the ASC Properties tab and will match the Application Id seen in the Azure Portal under the "API Access" tab for an Application Insight's resource. This value is constant and does not change. |
| Is Currently Throttled? | True/False to indicate whether throttling is currently happening |
| Throttle Reset Time | This is when the Daily Cap is reset. This can be seen in the Azure Portal for an Application Insights resource under the "Usage and estimated costs" followed by hitting the "Daily Cap" which will bring up a tab on the far-right hand side of the Portal. The reset time on this blade is rather small and hard to see but it is right under the box one specifies the amount to use for the cap. |

## Related Documentation

- Daily Cap: https://docs.microsoft.com/azure/azure-monitor/app/pricing#manage-your-maximum-daily-data-volume
- Queries to see Usage: https://docs.microsoft.com/azure/azure-monitor/app/pricing#queries-to-understand-data-volume-details
