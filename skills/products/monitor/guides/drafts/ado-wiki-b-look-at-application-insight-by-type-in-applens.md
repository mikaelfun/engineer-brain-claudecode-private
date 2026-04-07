---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/AppLens/Look at Application Insight by type in AppLens"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FAppLens%2FLook%20at%20Application%20Insight%20by%20type%20in%20AppLens"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Look at Application Insights resource by type in AppLens

## Overview

Traditionally AppLens has been used to look at App Service resources (web apps and functions). AppLens has evolved and now offers the ability to look at other resource types — including Application Insights components directly.

## Workflow

1. Access [AppLens](https://applens.trafficmanager.net/)
2. Set **Service type** to **"ARM Resource ID"**
3. Set **ARM Resource ID** to the resource URI of the Application Insights component
   - Format: `/subscriptions/{subId}/resourceGroups/{rg}/providers/Microsoft.Insights/components/{name}`
4. Set **Case Number** to an appropriate value
5. Set **Time range (UTC)** accordingly
6. Hit **'Continue'**
7. The resulting Overview page should show appropriate information about the component

## Notes

- This approach is useful when the customer's issue is not tied to a specific App Service or Function App, but to the Application Insights component itself (e.g., ingestion issues, data cap, component configuration)
- The basic AppLens setup guide is available at: [AppLens internal wiki](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/Application-Insights/How-To/AppLens)

## References

- See also: [AppLens](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/Application-Insights/How-To/AppLens)
