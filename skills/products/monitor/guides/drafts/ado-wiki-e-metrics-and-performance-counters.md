---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Support Topics/Application Insights setup and customization/Metrics and performance counters"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FSupport%20Topics%2FApplication%20Insights%20setup%20and%20customization%2FMetrics%20and%20performance%20counters"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Collect Metrics and Performance Counters

## Scenario
Issues collecting metrics, performance counters, or event counters in Application Insights.

## Analysis

### .NET Framework / .NET Core

#### How To Enable
- By default, a core set of performance counters will be collected.
- What counters are collected depends on where the application runs:
  - [Azure Web Apps and Windows containers](https://learn.microsoft.com/azure/azure-monitor/app/performance-counters?tabs=net-core-new#performance-counters-for-applications-running-in-azure-web-apps-and-windows-containers-on-azure-app-service)
  - [Other scenarios](https://learn.microsoft.com/azure/azure-monitor/app/performance-counters?tabs=net-core-new#view-counters)
- For non-App Service scenarios, permissions prerequisites must be met.

#### Add Counters Beyond Default
- Performance Counter: [Add Counters](https://learn.microsoft.com/azure/azure-monitor/app/performance-counters?tabs=net-core-new#add-counters)
  - Initial section is for .NET Framework; for .NET Core, scroll to the purple Note.
- Custom Metrics: [Capture Application Insights custom metrics with .NET](https://learn.microsoft.com/azure/azure-monitor/app/tutorial-asp-net-custom-metrics)

#### Missing Performance Counters
- **Performance counters only apply to Windows, NOT Linux** — but Metrics applies to both.
- If manually added counter is missing:
  1. Use `Get-Counter` to validate the counter exists and name is correct
  2. Check if other manually-added counters are collected (validates implementation)
  3. Test same app on another machine (validates counter is system-specific)
  4. Check if counter is visible in Windows Performance Monitor (perfmon)
     - If NOT visible → counter may be corrupt → engage Windows Performance team or the service responsible

### Java 3.X
- Default JMX and Micrometer metrics collected automatically.
- Interval can be adjusted: [metric-interval](https://learn.microsoft.com/azure/azure-monitor/app/java-standalone-config#metric-interval)
- Add JMX metrics: [jmx-metrics](https://learn.microsoft.com/azure/azure-monitor/app/java-standalone-config#jmx-metrics)

### Java 2.X (Deprecated)
- No longer recommended. See: [deprecated-java-2x](https://learn.microsoft.com/azure/azure-monitor/app/deprecated-java-2x?tabs=maven)

### JavaScript
- Default metrics collected automatically.
- Details: [pageview-telemetry](https://learn.microsoft.com/azure/azure-monitor/app/data-model-pageview-telemetry)
- Enable time-on-page: [sdk-configuration](https://learn.microsoft.com/azure/azure-monitor/app/javascript-sdk-configuration?tabs=javascriptwebsdkloaderscript#sdk-configuration)

### Node.js
- Extended metrics: [nodejs extended-metrics](https://learn.microsoft.com/azure/azure-monitor/app/nodejs#extended-metrics)

### Python
- Encourage migration from OpenCensus to OpenTelemetry distro.
- OpenTelemetry: see [metrics/attributes.py sample](https://github.com/Azure/azure-sdk-for-python/tree/main/sdk/monitor/azure-monitor-opentelemetry/samples)
- Custom metrics: [counter-example](https://learn.microsoft.com/azure/azure-monitor/app/opentelemetry-add-modify?tabs=python#counter-example)

### On-Premises Agent / VM Extension
- Default performance counters collected.
- Adding custom counters beyond default is currently not supported.

## Public Documentation
- [JMX metrics configuration](https://learn.microsoft.com/en-us/azure/azure-monitor/app/java-jmx-metrics-configuration)
- [.NET custom metrics tutorial](https://learn.microsoft.com/en-us/previous-versions/azure/azure-monitor/app/tutorial-asp-net-custom-metrics)
- [Performance counters in Application Insights](https://learn.microsoft.com/en-us/azure/azure-monitor/app/performance-counters)

## Internal References
- [Use Azure Monitor Metrics](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/712777/Use-Azure-Monitor-Metrics)
