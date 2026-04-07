---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Sampling/Manage Sampling with Net (Core)"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/How-To/Sampling/Manage%20Sampling%20with%20Net%20%28Core%29"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Overview

This material covers managing sampling scenarios with .NET Core applications.

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

### Autoinstrumentation

- Adaptive sampling is **on by default**.
- No config options offered for autoinstrumentation: [Configure the monitoring extension/agent (App Service)](https://learn.microsoft.com/en-us/azure/azure-monitor/app/codeless-app-service?tabs=aspnetcore#configure-the-monitoring-extensionagent)

### Manual Instrumentation

- [Configuring adaptive sampling for ASP.NET Core applications](https://learn.microsoft.com/en-us/previous-versions/azure/azure-monitor/app/sampling-classic-api#configuring-adaptive-sampling-for-aspnet-core-applications)

### Additional (Status Monitor V2 / VM Agent)

- N/A for .NET Core-specific differences.

# Enabling

### Autoinstrumentation

- Adaptive sampling is **on by default**.
- [Enable application monitoring in Azure App Service for .NET (ASP.NET Core)](https://learn.microsoft.com/en-us/azure/azure-monitor/app/codeless-app-service?tabs=aspnetcore)
- **Known issue**: Adaptive sampling may cause perceived inflation of telemetry (high itemCount) — see internal issue #27486.

### Manual

- (TBD — refer to Classic API docs above)

# Disabling

### Autoinstrumentation

- Manual instrumentation methods offer disabling: [Turning off adaptive sampling](https://learn.microsoft.com/en-us/previous-versions/azure/azure-monitor/app/sampling-classic-api#turning-off-adaptive-sampling)
- For autoinstrumentation: not directly documented. In theory, leveraging the environment variable approach from the Configuring section might work (not validated).

### Manual

- Follow Classic API docs for removing or reconfiguring the `AdaptiveSamplingTelemetryProcessor`.

# Public Documentation

- [Telemetry sampling in Azure Application Insights (Classic API)](https://learn.microsoft.com/en-us/previous-versions/azure/azure-monitor/app/sampling-classic-api)

# Internal References

- [Identify if Sampling is enabled](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/580009/Identify-if-Sampling-is-enabled)
