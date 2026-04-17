---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/AppLens/Identify changes in environment variables"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FAppLens%2FIdentify%20changes%20in%20environment%20variables"
importDate: "2026-04-05"
type: troubleshooting-guide
---

#Overview
___
This article provides guidance for validating changes in the environment variables for an App Service web app.

#Considerations
___
- The concept of application settings and environment variables is used interchangeably when working on App Services platform.

#Workflow
___
1. Go to AppLens and enter the name of the App Service resource you want to investigate.
1. Search and select the **'Environment Variables Changed'** option in the upper, left filter.
1. Adjust the time filter as needed for your investigation. You may also need to select a specific Role Instance within the App Service Plan.
   - If you need to associate a Role Instance in App Services to the value recorded in Application Insights' cloud role instance telemetry field, consider using: [Identify cloud role instances in App Services](/Application-Insights/How%2DTo/AppLens/Identify-cloud-role-instances-in-App-Services)
1. The detector will list out whether any changes were made to specific environment variables for the app, including timestamps of when each change occurred.

#Public Documentation
___
- N/A

#Internal References
___
- N/A

___
Last Modified: 2024/10/09
Last Modified By: nzamoralopez
