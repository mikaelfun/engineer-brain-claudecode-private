---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Additional Reference Material/General References/Locate and validate Application Insights Instrumentation Key/Codeless Deployment"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/How-To/Additional%20Reference%20Material/General%20References/Locate%20and%20validate%20Application%20Insights%20Instrumentation%20Key/Codeless%20Deployment"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Scenario
---
Application Insight was implemented via the codeless scenario method.

# Steps
---
1. Navigate to the Web Application and scroll down to Development Tools and locate Advanced Tools (shortcut: type "Adva" in the Search box).
2. After clicking "Advanced Tools" you will be prompted with a blade, hit the "GO ->" link.
3. This will launch a new browser session with the KUDU site tools (note the URL is the same URL used to get to the web application itself but with ".scm." inserted in the URL).
4. If the web app was a codeless (agent based) deployment you will find in the Environment section several variables named like `APPSETTING_APPINSIGHTS_*` and one will be the Instrumentation key.
5. If there are no such variables here, then the Application Insights was an SDK deployment.
