---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Sampling/Manage Sampling in Azure Functions"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/How-To/Sampling/Manage%20Sampling%20in%20Azure%20Functions"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Overview

This material covers managing sampling scenarios with Azure Functions.

# Key Facts

- For **.NET Functions**: Adaptive sampling is on by default.
- For **Java Functions**: Rate-Limited sampling is on by default.
- Functions architecture uses a **HOST process** and an **isolated worker** (where customer code runs).
- `host.json` sampling settings **only impact HOST telemetry** (sdkVersion `"azurefunctions: #.####.###.#"`), NOT the isolated worker.
- Telemetry from other sdkVersions (isolated worker) must be controlled via manual instrumentation approach.
- Request telemetry can still be enabled/disabled via `host.json`.

Reference: [Guide for running C# Azure Functions in an isolated worker process](https://learn.microsoft.com/en-us/azure/azure-functions/dotnet-isolated-process-guide?tabs=hostbuilder%2Cwindows)

# Enabling

### Autoinstrumentation
- (TBD)

### Manual
- (TBD)

# Disabling

### Autoinstrumentation — Java

Disable sampling from HOST via `host.json`. Example:

```json
{  
  "version": "2.0",  
  "extensionBundle": {  
    "id": "Microsoft.Azure.Functions.ExtensionBundle",  
    "version": "[4.*, 5.2.0)"  
  },  
  "logging": {  
    "applicationInsights": {  
      "samplingSettings": {  
        "isEnabled": false  
      }  
    }  
  },  
  "functionTimeout": "00:10:00"
}
```

- To keep sampling but exclude selected telemetry types, use `"excludedTypes"` inside `samplingSettings`.
- Reference: [host.json reference for Azure Functions 2.x](https://learn.microsoft.com/en-us/azure/azure-functions/functions-host-json) — see section `logging > applicationInsights > samplingSettings`.

### Manual
- (TBD)

# Configuring

### Autoinstrumentation
- (TBD)

### Manual
- (TBD)

# Public Documentation

- [host.json reference for Azure Functions 2.x](https://learn.microsoft.com/en-us/azure/azure-functions/functions-host-json)
- [Guide for running C# Azure Functions in an isolated worker process](https://learn.microsoft.com/en-us/azure/azure-functions/dotnet-isolated-process-guide?tabs=hostbuilder%2Cwindows)

# Internal References

- [Identify if Sampling is enabled](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/580009/Identify-if-Sampling-is-enabled)
