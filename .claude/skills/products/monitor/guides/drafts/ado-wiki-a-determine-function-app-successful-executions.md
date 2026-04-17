---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/AppLens/Determine successful executions from Function App"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FAppLens%2FDetermine%20successful%20executions%20from%20Function%20App"
importDate: "2026-04-05"
type: troubleshooting-guide
---

#Overview
___
This article shows how to determine the number of overall, successful/failed executions of different functions hosted on Function App.

#Considerations
___
- Functions executions indicate that the function's code actually ran. When investigating missing telemetry from functions, it is important to determine whether the affected function actually ran during the investigation time frame.

#Workflow
___
1. Go to AppLens and enter the name of the Function App resource to be investigated.
1. Search 'Function Executions and Errors' in the upper, left filter option.
1. Drop down the 'Host.json sanitized content' section.
   - The detector displays a graph of successful vs failed HTTP executions by function.

#Public Documentation
---
- N/A

#Internal References
---
- [AppLens](/Application-Insights/How%2DTo/AppLens)

Created by: Nicolas Zamora (nzamoralopez)
Created on: July 18 2023
Last Modified by: matthofa
Last Modified on: October 23 2024
