---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Sampling/Manage Sampling Net Framework"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/How-To/Sampling/Manage%20Sampling%20Net%20Framework"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Overview

This material covers managing sampling scenarios with .NET Framework applications.

# Considerations

- Applies to both Linux and Windows, autoinstrumentation and manual, including:
  - Azure Monitor Application Insights Agent for on-premises servers (Status Monitor V2)
  - Azure Monitor Application Insights Agent on Azure VMs and VM scale sets
- Covers: configuring, enabling, disabling, sampling overrides

# Prerequisite Checks

**Status Monitor V2**: Run `Find-Module -Name Az.ApplicationMonitor` in PowerShell and confirm version 2.0.0.
- If not 2.0.0: [Deploy Azure Monitor Application Insights Agent for on-premises servers](https://learn.microsoft.com/azure/azure-monitor/app/application-insights-asp-net-agent?tabs=detailed-instructions)

**VM/VMSS Extension**: The extension is a vehicle to put Status Monitor onto an Azure VM without logging into the Azure VM.

# Configuring

### Classic SDK

- Adaptive sampling is **on by default**
- Docs: [Telemetry sampling (Classic API)](https://learn.microsoft.com/en-us/previous-versions/azure/azure-monitor/app/sampling-classic-api)
- Predominantly accomplished via modifications of the `applicationInsights.config` file
- [Configuring adaptive sampling for ASP.NET applications](https://learn.microsoft.com/en-us/previous-versions/azure/azure-monitor/app/sampling-classic-api#configuring-adaptive-sampling-for-aspnet-applications)

### Configure via Environment Variables

Use Environment Variables or App Service Settings to control sampling behavior of codeless agents. Create an environment variable with prefix `MicrosoftAppInsights_AdaptiveSamplingTelemetryProcessor_` and append the setting name.

Example — sample only Exceptions, drop everything else:
```
MicrosoftAppInsights_AdaptiveSamplingTelemetryProcessor_ExcludedTypes = Exception               
MicrosoftAppInsights_AdaptiveSamplingTelemetryProcessor_InitialSamplingPercentage = 0        
MicrosoftAppInsights_AdaptiveSamplingTelemetryProcessor_MinSamplingPercentage = 0        
MicrosoftAppInsights_AdaptiveSamplingTelemetryProcessor_MaxSamplingPercentage = 0
```

### Additional: For Status Monitor V2 / VM Agent

.NET Core apps can have independent sampling config via `web.config` file. Example:

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <location path="." inheritInChildApplications="false">
    <system.webServer>
      <aspNetCore processPath="dotnet" arguments=".\Net31StatusMonitorv2.dll" stdoutLogEnabled="false" stdoutLogFile=".\logs\stdout" hostingModel="inprocess">
        <environmentVariables>
          <environmentVariable name="MicrosoftAppInsights_AdaptiveSamplingTelemetryProcessor_InitialSamplingPercentage" value="10" />
          <environmentVariable name="MicrosoftAppInsights_AdaptiveSamplingTelemetryProcessor_MaxTelemetryItemsPerSecond" value="1" />
          <environmentVariable name="MicrosoftAppInsights_AdaptiveSamplingTelemetryProcessor_MinSamplingPercentage" value="10" />
        </environmentVariables>
      </aspNetCore>
    </system.webServer>
  </location>
</configuration>
```

> Note: `web.config` approach is not supported by .NET Framework (only .NET Core/IIS).

# Enabling

### Classic SDK

- Adaptive sampling is on by default
- Autoinstrumentation: [Enable auto-instrumentation monitoring (App Service)](https://learn.microsoft.com/en-us/azure/azure-monitor/app/codeless-app-service?tabs=net#enable-auto-instrumentation-monitoring)
- Manual: [Monitor .NET Applications with Application Insights (Classic API)](https://learn.microsoft.com/en-us/azure/azure-monitor/app/dotnet?tabs=net%2Cnet-1%2Cserver%2Cportal%2Ccsharp%2Cenqueue%2Capi-net)
- Fixed Rate: follow Steps 1 and 2 at https://docs.microsoft.com/azure/azure-monitor/app/sampling#configuring-fixed-rate-sampling-for-aspnet-applications
- **Known issue**: Adaptive sampling may cause perceived inflation of telemetry (high itemCount) — see internal issue #27486

# Disabling

### Classic SDK — Autoinstrumentation (Azure App Service Web Apps)

1. Go to the Web App in the Portal
2. Under Configuration → Application settings
3. Add app setting: `MicrosoftAppInsights_AdaptiveSamplingTelemetryProcessor_MinSamplingPercentage` = `100`

### Classic SDK — Manual Instrumentation

- Remove the `AdaptiveSamplingTelemetryProcessor` node(s) from `ApplicationInsights.config`
- Docs: [Telemetry sampling (Classic API)](https://learn.microsoft.com/en-us/previous-versions/azure/azure-monitor/app/sampling-classic-api)

# Public Documentation

- [Telemetry sampling in Azure Application Insights (Classic API)](https://learn.microsoft.com/en-us/previous-versions/azure/azure-monitor/app/sampling-classic-api)
- [Monitor .NET Applications with Application Insights (Classic API)](https://learn.microsoft.com/en-us/azure/azure-monitor/app/dotnet?tabs=net%2Cnet-1%2Cserver%2Cportal%2Ccsharp%2Cenqueue%2Capi-net)

# Internal References

- [Identify if Sampling is enabled](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/580009/Identify-if-Sampling-is-enabled)
- [Build a simple load test to validate Sampling](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/624404/Build-a-simple-load-test-to-validate-Sampling)
- [Language Resource - .NET Framework](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/890133/Language-Resource?anchor=.net-framework)
