---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/AppLens/List apps by App Service Plan name"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FAppLens%2FList%20apps%20by%20App%20Service%20Plan%20name"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# List apps by App Service Plan name

## Overview

This article provides the steps to identify the list of web apps residing within a specific App Service Plan. Useful for understanding blast radius when issues affect multiple apps on the same plan.

## Workflow

1. Start AppLens.
2. Add the case number and name of the App Service web app.
3. In the detectors filter, type in **"List Apps By App Service Plan Name"** to locate the detector.
4. Once there, you'll be prompted to enter the name of the App Service Plan. Optionally, you can include the subscription ID (not required).
5. Once the App Service Plan name is entered, you should see the full list of web apps residing in the plan.
   - The detector will also indicate which apps are Linux-based and which are Function Apps.

## Notes

- If you don't have the name of the App Service Plan, use the **"Plan Density"** detector in AppLens to locate it (see the Description section of that detector). See also: [Locate service plan of App Service web app](ado-wiki-b-locate-service-plan-of-app-service-web-app.md)

## Public Documentation

- [App Service Plan overview](https://learn.microsoft.com/azure/app-service/overview-hosting-plans)

## References

- Feedback? Contact Nicolas (nzamoralopez)
- Last Modified: 09/04/2024
