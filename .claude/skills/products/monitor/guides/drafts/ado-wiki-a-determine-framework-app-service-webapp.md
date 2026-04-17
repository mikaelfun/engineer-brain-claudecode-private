---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/AppLens/Determine framework of  App Service web app"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FAppLens%2FDetermine%20framework%20of%20%20App%20Service%20web%20app"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Scenario
---
Sometimes we need to determine the type of framework used by an App Service web app. This detector can be used for this purpose.

# Considerations
---
- This detector only works with ASP.NET Framework and .NET Core web applications hosted on App Services platform.
- It only works with **Windows-based** App Services Plans.
- This is an **experimental detector** — always confirm these details with the customer.

# Steps
---
1. Start AppLens
1. Add the case number and name of App Service web app
1. In the detectors filter, type "DAAS Executions" to locate the detector
1. This detector will show you the framework:
   - **.NET Framework** — indicated in detector output
   - **.NET Core** — indicated in detector output

---
Feedback? Contact Nicolas Zamora (nzamoralopez)
Last Modified: 4/17/2023
