---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/AppLens/Locate service plan of App Service web app"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FAppLens%2FLocate%20service%20plan%20of%20App%20Service%20web%20app"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Locate service plan of App Service web app

## Overview

All App Service web apps run on a service plan. In some instances, it is important to know what plan type (SKU) is being used — for example, to determine if a shared or Consumption plan might be affecting performance or telemetry behavior.

## Workflow

1. Start AppLens (see: [AppLens](https://applens.trafficmanager.net/)).
2. In the detectors filter, type in **"Plan Density"** to locate the detector.
3. This detector will show the SKU plan the app is using in the **Description** section.

## Use Cases

- Determine if customer is on a shared/Free/Basic SKU that may have resource limitations
- Identify if a Consumption Function App plan is causing cold-start or scaling telemetry gaps
- Get the App Service Plan name to use with the "List Apps By App Service Plan Name" detector

## Public Documentation

- [Azure App Service plan overview](https://learn.microsoft.com/azure/app-service/overview-hosting-plans)

## References

- Last Modified: October 22, 2024
- Last Modified By: matthofa
