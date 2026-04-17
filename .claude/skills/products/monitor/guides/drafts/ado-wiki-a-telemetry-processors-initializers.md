---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Learning Resources/Training/Course Materials/Manual instrumentation/Classic SDK/ASPNet Core/Telemetry Processors and Initializers Exploration"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FLearning%20Resources%2FTraining%2FCourse%20Materials%2FManual%20instrumentation%2FClassic%20SDK%2FASPNet%20Core%2FTelemetry%20Processors%20and%20Initializers%20Exploration"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Telemetry Processors and Initializers

## Overview

- **Telemetry Processors**: Filter out telemetry items before ingestion (drop specific requests/dependencies/exceptions)
- **Telemetry Initializers**: Add or modify properties on telemetry items before they are sent

## Telemetry Processor Example: Filter Synthetic Requests

Use case: Prevent Availability Test requests from inflating costs.

### 1. Create Filter Class

```csharp
public class SyntheticRequestFilter : ITelemetryProcessor
{
    private ITelemetryProcessor Next { get; set; }

    public SyntheticRequestFilter(ITelemetryProcessor next)
    {
        this.Next = next;
    }

    public void Process(ITelemetry item)
    {
        if (item is RequestTelemetry requestTelemetry)
        {
            if (!string.IsNullOrEmpty(requestTelemetry.Context.Operation.SyntheticSource))
            {
                return; // Filter out synthetic requests
            }
        }
        this.Next.Process(item);
    }
}
```

### 2. Register in Program.cs

```csharp
builder.Services.AddApplicationInsightsTelemetry(new ApplicationInsightsServiceOptions
{
    ConnectionString = builder.Configuration["APPLICATIONINSIGHTS_CONNECTION_STRING"]
});
builder.Services.AddApplicationInsightsTelemetryProcessor<SyntheticRequestFilter>();
```

### 3. Validate

```kql
requests
| where cloud_RoleName contains 'your-app-name'
| summarize max(timestamp) by operation_SyntheticSource
| sort by max_timestamp desc
```

## Common Use Cases for Processors

- Preventing high ingestion costs from noisy exceptions
- Filtering out high-rate dependency telemetry
- Dropping telemetry exposing PII

## Public Documentation

- [Filtering and preprocessing telemetry](https://learn.microsoft.com/azure/azure-monitor/app/api-filtering-sampling)
