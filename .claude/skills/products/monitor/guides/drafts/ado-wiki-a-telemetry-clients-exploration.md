---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Learning Resources/Training/Course Materials/Manual instrumentation/Classic SDK/ASPNet Core/Telemetry Clients Exploration"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FLearning%20Resources%2FTraining%2FCourse%20Materials%2FManual%20instrumentation%2FClassic%20SDK%2FASPNet%20Core%2FTelemetry%20Clients%20Exploration"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Telemetry Clients Exploration

## Overview

TelemetryClient enables sending custom telemetry to Application Insights — useful when SDK auto-collection doesn't capture specific calls, or when enriching existing telemetry with custom data.

## Basic Usage

```csharp
TelemetryConfiguration configuration = TelemetryConfiguration.CreateDefault();
configuration.ConnectionString = "InstrumentationKey=...;IngestionEndpoint=...";
TelemetryClient telemetryClient = new TelemetryClient(configuration);
telemetryClient.TrackTrace("Hello, world!");
telemetryClient.Flush();
```

**Warning**: `Flush()` should only be called on application shutdown. Calling it early can cause SDK performance issues.

## Tracking Unsupported Dependencies

For protocols not auto-captured (e.g., Redis, custom services):

```csharp
DependencyTelemetry dependencyTelemetry = new DependencyTelemetry(
    dependencyTypeName: "custom",
    target: "https://bing.com",
    dependencyName: "my custom call",
    data: "custom call description",
    startTime: DateTime.Now,
    duration: TimeSpan.FromSeconds(1),
    resultCode: "200",
    success: true
);
_telemetryClient.TrackDependency(dependencyTelemetry);
```

## Debugging Long-Running Operations

Use `StartOperation()` with nested operations to identify code segments causing high duration in End-to-End Transaction Details.

## Key Considerations

- Instantiate single TelemetryClient and reuse (avoid memory leaks)
- Use dependency injection in ASP.NET Core
- For MVC: add in controller before `return`
- For Razor Pages: add in `OnGet()` method

## Public Documentation

- [Custom events and metrics API](https://learn.microsoft.com/azure/azure-monitor/app/api-custom-events-metrics)
- [Manual dependency tracking](https://learn.microsoft.com/azure/azure-monitor/app/asp-net-dependencies#manually-tracking-dependencies)
