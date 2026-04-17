---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Additional Reference Material/SDK and Agents References/How to configure Application Insights Agent using instrumentation key map"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FAdditional%20Reference%20Material%2FSDK%20and%20Agents%20References%2FHow%20to%20configure%20Application%20Insights%20Agent%20using%20instrumentation%20key%20map"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to configure Application Insights Agent using instrumentation key map

## Overview

Walk-through for configuring the Application Insights on-prem Agent (Status Monitor v2) instrumentation using key maps, enabling multiple IIS sites to send telemetry to different Application Insights resources.

## Prerequisites

1. Install IIS Web Server role in Windows Server VM
2. Add web sites to IIS Manager
3. Create two separate Application Insights resources (one per web app)

## Workflow

### 1. Install the Application Insights on-prem Agent PowerShell module

Follow the public docs: [Deploy Azure Monitor Application Insights Agent for on-premises servers](https://learn.microsoft.com/azure/azure-monitor/app/application-insights-asp-net-agent?tabs=detailed-instructions)

### 2. Identify IIS sites

```powershell
Get-IISSite
```

The values in the **Name** column will be used to instrument your applications.

### 3. Enable monitoring with instrumentation key map

```powershell
Enable-ApplicationInsightsMonitoring -InstrumentationKeyMap `
    @(
      @{MachineFilter='.'; AppFilter="Default Web Site"; InstrumentationSettings=@{InstrumentationKey='xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx1'}},
      @{MachineFilter='.'; AppFilter="Site2"; InstrumentationSettings=@{InstrumentationKey='xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx2'}}
    )
```

- `MachineFilter='.'` matches all machines (regex dot)
- `AppFilter` must match the IIS site name exactly as shown in `Get-IISSite`
- Each site gets its own InstrumentationKey pointing to a different AI resource

### 4. Verify

Requests from both applications should appear in their respective Application Insights resources.

## Public Documentation

- [Deploy Azure Monitor Application Insights Agent - Detailed instructions](https://learn.microsoft.com/azure/azure-monitor/app/application-insights-asp-net-agent?tabs=detailed-instructions#enable-applicationinsightsmonitoring)
- [API reference](https://learn.microsoft.com/azure/azure-monitor/app/application-insights-asp-net-agent?tabs=api-reference#enable-applicationinsightsmonitoring)
- [Release notes](https://learn.microsoft.com/azure/azure-monitor/app/application-insights-asp-net-agent?tabs=release-notes#enable-applicationinsightsmonitoring)
