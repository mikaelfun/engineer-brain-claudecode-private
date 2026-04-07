---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Support Topics/Application Insights setup and customization/Filter or modify collected telemetry"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FSupport%20Topics%2FApplication%20Insights%20setup%20and%20customization%2FFilter%20or%20modify%20collected%20telemetry"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Filter or Modify Collected Telemetry

## Scenario

Assistance trying to modify contents of default collected telemetry or trying to filter out specific telemetry types from getting collected.

## Analysis

### Additional Consideration: DCRs and Ingestion-Time Transformations

Data Collection Rules (DCRs) and Ingestion-Time Transformations are also a consideration for filtering/modifying telemetry at ingestion time, independent of SDK-level processors.

### Per-Language Guidance

#### Java

**NOTE:** Telemetry processors are still in preview.

Use cases for telemetry processors:
- Mask sensitive data
- Conditionally add custom dimensions
- Update the span name (used to aggregate similar telemetry in Azure portal)
- Drop specific span attributes to control ingestion costs
- Filter out some metrics to control ingestion costs

Key steps:
1. Know the instrumentation method (autoinstrumentation vs manual) — this dictates how to pass a custom `applicationinsights.json`
2. Regardless of instrumentation method, the telemetry processor configuration is the same
3. Reference: [Telemetry processors (preview)](https://learn.microsoft.com/en-us/azure/azure-monitor/app/java-standalone-telemetry-processors)
4. For sampling (dropping entire spans), see Sampling documentation (separate topic)

**Java 2.X is deprecated.** See: [Filter telemetry in Java 2.x](https://learn.microsoft.com/azure/azure-monitor/app/java-2x-filter-telemetry)

#### JavaScript

Filtering or modifying telemetry means changing the JavaScript snippet in the web page.

#### .NET / .NET Framework

Use TelemetryInitializers to add/modify properties, or TelemetryProcessors to filter/drop telemetry items.

#### Python

See Python overview documentation.

#### Node.js

See Node.js SDK documentation.

## Expectation Setting

- We will provide proof of concept code samples
- We will debug proof of concept code samples
- We will do best effort in troubleshooting production code

## References

- [Telemetry processors (preview) - Java](https://learn.microsoft.com/en-us/azure/azure-monitor/app/java-standalone-telemetry-processors)
- [Configuration options - Java](https://learn.microsoft.com/en-us/azure/azure-monitor/app/java-standalone-config)
- [OpenTelemetry configuration](https://learn.microsoft.com/en-us/azure/azure-monitor/app/opentelemetry-configuration?tabs=java)
