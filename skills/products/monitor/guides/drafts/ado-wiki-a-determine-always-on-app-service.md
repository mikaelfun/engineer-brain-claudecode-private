---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/AppLens/Determine if App Service is configured for Always On"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FAppLens%2FDetermine%20if%20App%20Service%20is%20configured%20for%20Always%20On"
importDate: "2026-04-05"
type: troubleshooting-guide
---

#Overview
___
This article shows how to verify if Always On is configured for an App Service.

#Considerations
___
Always On will send a GET request to the application root every 5 minutes to prevent the application from offloading after the default 20 minutes.

#Workflow
___
1. Go to AppLens and enter the name of the App Service resource you want to investigate.
1. Search 'AlwaysOn' in the upper, left filter option.
1. Select the 'AlwaysOn Enabled' blade to the left — shows current Always On status.
1. To view HTTP codes made against the App for "AlwaysOn", select the "Enable AlwaysOn" blade — shows current status of the feature and a summary of HTTP codes from the AlwaysOn feature.

#Public Documentation
___
- [Configure an App Service app - Configure general settings](https://learn.microsoft.com/azure/app-service/configure-common?tabs=portal#configure-general-settings)

#Internal References
___
- N/A

___
Created by: Thomas Holland (tholland)
Created: July 19th, 2023
Last Modified by: Matthofa
Last Modified on: October 23rd, 2024
