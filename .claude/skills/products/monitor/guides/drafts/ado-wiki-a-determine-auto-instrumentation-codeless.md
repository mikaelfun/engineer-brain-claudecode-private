---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Additional Reference Material/General References/Determine if Auto Instrumentation (codeless) is being used"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/How-To/Additional%20Reference%20Material/General%20References/Determine%20if%20Auto%20Instrumentation%20(codeless)%20is%20being%20used"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Scenario
---
Customer's many times do not report or do not know which of the two means were used to integrate Application Insights with their application, either codeless attach or an SDK deployment.
It is not impossible for a developer to deploy a web using the SDK and some else within the organization does not realize this and enables auto-instrumentation (codeless) on top of the developer efforts. This sort of collision can lead to some or no telemetry to be sent when it was working prior. The opposite can also occur.

Understanding what method was used to instrument an application with Application Insights is critical in troubleshooting most issues and needs to be understood early on in troubleshooting.

## Auto-instrumentation
---
Auto-instrumentation (codeless) means:

**EITHER**
- a user toggled an "enable" button to turn on Application Insights within the Azure Portal experience. Many Azure Services offer this level of integration, most notably App Service's Web Apps or Azure Functions.

**OR**
- Auto-instrumentation was done via one of the many agents now offered:
  - Azure Monitor Application Insights Agent on Azure virtual machines
  - Azure Monitor Application Insights Agent for on-premises servers
  - Java 3.X

## Investigation Methods

### ASC and General Properties
- Check "Request Source" and "Flow Type" in Component Properties tab — these indicate SDK versus auto and how auto was enabled.
- Flow Type "Redfield" = codename for Auto-Instrumentation (codeless)

### ASC and Ingestion tab
- "Aggregate by" → "Parsed SDK Names": prefix "App Service..." = App Service Auto-instrumentation
- "Aggregate by" → "Raw SDK Names": prefix "ar_" = auto-instrumentation recommended; "ad_" = auto basic; "vmr_" = on-premises agent

### ASC Customer Query Data
- Query request data for url/Url or cloud_Rolename/AppName
- Expand rows to check sdkVersion field for Raw SDK Name prefix

### App Lens
- Detectors → Configuration and Management → "Application Insights Auto Instrumentation"
- Shows if codeless is in place and whether it backed off due to detecting SDK binaries
- NOTE: Only works for .Net Framework and .Net Core

## On-Premises Codeless Attach
- The Parsed SDK names will look no different than a standard SDK
- The Raw SDK names will reveal "vmr_*" prefix for on-premises agent

## Official Documentation
- https://docs.microsoft.com/azure/azure-monitor/app/azure-web-apps
- https://docs.microsoft.com/azure/azure-monitor/app/azure-vm-vmss-apps
- https://docs.microsoft.com/azure/azure-monitor/app/status-monitor-v2-overview
- https://docs.microsoft.com/azure/azure-monitor/app/cloudservices
