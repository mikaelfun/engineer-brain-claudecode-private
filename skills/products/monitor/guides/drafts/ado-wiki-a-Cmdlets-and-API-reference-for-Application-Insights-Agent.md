---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Learning Resources/Training/Course Materials/Autoinstrumentation/ASP.Net on-premises agent/Cmdlets and API reference exploration for the Application Insights Agent"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FLearning%20Resources%2FTraining%2FCourse%20Materials%2FAutoinstrumentation%2FASP.Net%20on-premises%20agent%2FCmdlets%20and%20API%20reference%20exploration%20for%20the%20Application%20Insights%20Agent"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Cmdlets and API reference exploration for the Application Insights Agent

## Overview
This article provides an exploration on some of the cmdlets available from the PowerShell module that can help you ensure your instrumentation works as expected. Full reference: https://learn.microsoft.com/azure/azure-monitor/app/application-insights-asp-net-agent?tabs=api-reference

## Workflow

### Enable-ApplicationInsightsMonitoring
Enables codeless attach monitoring of IIS apps on a target computer. Modifies IIS applicationHost.config and sets registry keys. Creates applicationinsights.ikey.config. IIS loads RedfieldModule on startup to inject SDK.

```powershell
# Using connection string (recommended)
Enable-ApplicationInsightsMonitoring -ConnectionString 'InstrumentationKey=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx;IngestionEndpoint=https://xxxx.applicationinsights.azure.com/'

# Using instrumentation key
Enable-ApplicationInsightsMonitoring -InstrumentationKey xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Multiple instrumentation keys
Enable-ApplicationInsightsMonitoring -InstrumentationKeyMap `
  @(@{MachineFilter='.*';AppFilter='WebAppExclude'},
    @{MachineFilter='.*';AppFilter='WebAppOne';InstrumentationSettings=@{InstrumentationKey='xxx1'}},
    @{MachineFilter='.*';AppFilter='WebAppTwo';InstrumentationSettings=@{InstrumentationKey='xxx2'}},
    @{MachineFilter='.*';AppFilter='.*';InstrumentationSettings=@{InstrumentationKey='xxxdefault'}})
```

**Restart IIS for changes to take effect.**

### Disable-ApplicationInsightsMonitoring
Removes edits to IIS applicationHost.config and removes registry keys.

```powershell
Disable-ApplicationInsightsMonitoring
```

### Get-ApplicationInsightsMonitoringConfig
Gets the config file and prints the values to the console.

```powershell
Get-ApplicationInsightsMonitoringConfig
```

**Single key output:**
```
RedfieldConfiguration:
Filters:
0)AppFilter: .* VirtualPathFilter: .* MachineFilter: .* InstrumentationSettings: ConnectionString: InstrumentationKey=xxxxxxxx;IngestionEndpoint=https://xxxx.applicationinsights.azure.com/
```

**Multiple keys output:**
```
RedfieldConfiguration:
Filters:
0)InstrumentationKey:  AppFilter: WebAppExclude MachineFilter: .*
1)InstrumentationKey: xxx2 AppFilter: WebAppTwo MachineFilter: .*
2)InstrumentationKey: xxxdefault AppFilter: .* MachineFilter: .*
```

### Set-ApplicationInsightsMonitoringConfig
Sets the config file without doing a full reinstallation. Restart IIS for changes to take effect. Pair with `-InstrumentationKey`, `-ConnectionString`, or `-InstrumentationKeyMap`.

### Get-ApplicationInsightsMonitoringStatus
Provides troubleshooting information about Application Insights Agent. Reports version info and information about key files required for monitoring. Use to investigate monitoring status, PowerShell Module version, and running process.
