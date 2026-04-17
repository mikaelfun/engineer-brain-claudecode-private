---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Additional Reference Material/General References/Locate and validate Application Insights Instrumentation Key/SDK - ASP.NET Classic SDK"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/How-To/Additional%20Reference%20Material/General%20References/Locate%20and%20validate%20Application%20Insights%20Instrumentation%20Key/SDK%20-%20ASP.NET%20Classic%20SDK"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Locate and Validate Application Insights Instrumentation Key — ASP.NET Classic SDK

## Scenario

ASP.NET web application hosted in App Services was implemented with Application Insights SDK. On-Premises and VM IIS hosted scenarios are documented here too.

## App Services Web

1. Navigate to the Web Application → scroll down to Development Tools → locate Advanced Tools (shortcut: type "Adva" in the Search box).
2. Click "Advanced Tools" → hit the "GO ->" link.
3. This launches a new browser session with Kudu site tools (URL has ".scm." inserted).
4. From the Kudu menu → choose Debug Console → CMD from the dropdown.
5. In the file explorer section, click on the "site" folder.
6. Then choose "wwwroot" folder option.
7. Look for the `applicationinsights.config` file → use the "download" icon to open this file in another browser window.
8. Once the file opens, locate the `InstrumentationKey` entry.
