---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/AppLens/Finding Application Insights Instrumentation Key"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FAppLens%2FFinding%20Application%20Insights%20Instrumentation%20Key"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Scenario
---
User has either an Azure Web App or Azure Function and one needs to locate the Application Insights Component associated with it.

## Steps
1. Start App Lens: https://applens.azurewebsites.net/
1. When the UI comes up plug in the Web App name or Azure Function name and hit the Go button.
   - (Note: the Lightning Bolt in the top left indicates Function, a globe indicates Web App)
1. Scroll down on the left side and expand the choice named "Configuration and Management" and in the choices it exposes you will find "App Settings" — select it.
1. In the App Settings table you will see the value **APPINSIGHTS_INSTRUMENTATIONKEY** — the value to the right is the Application Insights Component iKey being used.
   - **Note**: `APPLICATIONINSIGHTS_CONNECTION_STRING` will show a value of `"******"` even when it has a valid string defined. This is expected AppLens behavior — redaction of the connection string.
   - Codeless auto-instrumentation uses either `APPINSIGHTS_INSTRUMENTATIONKEY` or `APPLICATIONINSIGHTS_CONNECTION_STRING` to know where to send data; both are not required, but the iKey must be correct and valid.
1. The iKey alone does not tell you the name or subscription of the Application Insights Component. To look up the component by iKey, use AIMC: [Locate Application Insights details with only Instrumentation Key or App Insights Name](/Application-Insights/How%2DTo/Additional-Reference-Material/General-References/Locate-Application-Insights-details-with-only-Instrumentation-Key-or-App-Insights-Name)
1. Select "Application Insights Auto Instrumentation" Detector to show the codeless attach status.

## Key Notes
- `APPLICATIONINSIGHTS_CONNECTION_STRING` showing `"******"` in AppLens is **normal** — it does not mean the value is missing.
- Check both `APPINSIGHTS_INSTRUMENTATIONKEY` and `APPLICATIONINSIGHTS_CONNECTION_STRING` to confirm codeless is configured.
