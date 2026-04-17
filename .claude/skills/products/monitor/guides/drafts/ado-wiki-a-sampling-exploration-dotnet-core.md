---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Learning Resources/Training/Course Materials/Manual instrumentation/Classic SDK/ASPNet Core/Sampling Exploration"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FLearning%20Resources%2FTraining%2FCourse%20Materials%2FManual%20instrumentation%2FClassic%20SDK%2FASPNet%20Core%2FSampling%20Exploration"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Sampling Exploration (.NET Core)

## Overview

Sampling controls the volume of telemetry sent to Application Insights while maintaining statistical accuracy via the `itemCount` field. Adaptive sampling is enabled by default for .NET Core web apps.

## Adaptive Sampling

Configure custom adaptive sampling in `Program.cs`:

```csharp
builder.Services.Configure<TelemetryConfiguration>(telemetryConfiguration =>
{
    var telemetryProcessorChainBuilder = telemetryConfiguration.DefaultTelemetrySink.TelemetryProcessorChainBuilder;
    telemetryProcessorChainBuilder.UseAdaptiveSampling(maxTelemetryItemsPerSecond: 5);
    telemetryProcessorChainBuilder.Build();
});

builder.Services.AddApplicationInsightsTelemetry(new ApplicationInsightsServiceOptions
{
    EnableAdaptiveSampling = false,  // Disable default to use custom config above
    ConnectionString = builder.Configuration["APPLICATIONINSIGHTS_CONNECTION_STRING"]
});
```

Advanced settings via `SamplingPercentageEstimatorSettings`:
- `MinSamplingPercentage`, `MaxSamplingPercentage`, `MaxTelemetryItemsPerSecond`
- Exclude types: `excludedTypes: "Dependency"`

### Validation KQL

```kql
requests
| where timestamp > ago(1h)
| summarize RetainedPercentage = 100/avg(itemCount) by bin(timestamp, 1d), itemType
```

## Fixed-Rate Sampling

```csharp
builder.Services.Configure<TelemetryConfiguration>(telemetryConfiguration =>
{
    var builder = telemetryConfiguration.DefaultTelemetrySink.TelemetryProcessorChainBuilder;
    double fixedSamplingPercentage = 10;
    builder.UseSampling(fixedSamplingPercentage);
    builder.Build();
});
```

**Key**: Set `EnableAdaptiveSampling = false` when using custom sampling config.

## Public Documentation

- [Sampling in Application Insights](https://learn.microsoft.com/azure/azure-monitor/app/sampling-classic-api)
