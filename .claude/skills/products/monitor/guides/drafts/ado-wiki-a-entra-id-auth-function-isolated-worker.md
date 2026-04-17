---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Learning Resources/Training/Course Materials/Manual instrumentation/Classic SDK/Azure Function .Net Core Out of Process/Entra ID authentication for Application Insights using isolated worker function"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FLearning%20Resources%2FTraining%2FCourse%20Materials%2FManual%20instrumentation%2FClassic%20SDK%2FAzure%20Function%20.Net%20Core%20Out%20of%20Process%2FEntra%20ID%20authentication%20for%20Application%20Insights%20using%20isolated%20worker%20function"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Entra ID Authentication for Application Insights (Isolated Worker Function)

## Overview

Set up HTTP-trigger isolated-worker function authenticating with Entra ID via Managed Identity to send telemetry to Application Insights.

## Key Considerations

- Official guidance: [Entra ID authentication in Application Insights](https://learn.microsoft.com/azure/azure-monitor/app/azure-ad-authentication)
- Auto-instrumentation now supports Entra ID auth via environment variables
- This guide focuses on worker instrumentation for isolated functions

## Setup Steps

### 1. Create Function App

Create isolated worker function with Application Insights enabled (creates `APPLICATIONINSIGHTS_CONNECTION_STRING` env var).

### 2. Configure Worker Instrumentation

```csharp
// Program.cs
var host = new HostBuilder()
    .ConfigureFunctionsWorkerDefaults()
    .ConfigureServices(services => {
        services.AddApplicationInsightsTelemetryWorkerService();
        services.ConfigureFunctionsApplicationInsights();
    })
    .Build();
host.Run();
```

### 3. Add Entra ID Authentication

Required NuGet packages: `Azure.Identity`, `Microsoft.ApplicationInsights.WorkerService`

```csharp
// Program.cs with Entra ID
var host = new HostBuilder()
    .ConfigureFunctionsWorkerDefaults()
    .ConfigureServices(services =>
    {
        services.Configure<TelemetryConfiguration>(config =>
        {
            var credential = new DefaultAzureCredential();
            config.SetAzureTokenCredential(credential);
        });
        services.AddApplicationInsightsTelemetryWorkerService(new ApplicationInsightsServiceOptions
        {
            EnableQuickPulseMetricStream = true,
            ConnectionString = "CONNECTION STRING HERE"
        });
        services.ConfigureFunctionsApplicationInsights();
    })
    .Build();
host.Run();
```

### 4. Configure Azure Resources

1. Enable system-assigned Managed Identity on Function App
2. Assign **Monitoring Metrics Publisher** role to the identity on Application Insights resource
3. Disable local auth on Application Insights component

## Known Issue

Initial inbound Request telemetry may stop logging when Entra ID auth is enabled. Workaround: use `StartOperation()` from TelemetryClient to manually create Request telemetry.
