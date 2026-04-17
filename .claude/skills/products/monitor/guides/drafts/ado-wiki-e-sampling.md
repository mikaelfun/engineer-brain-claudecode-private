---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Support Topics/Application Insights setup and customization/Sampling"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FSupport%20Topics%2FApplication%20Insights%20setup%20and%20customization%2FSampling"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Configure or Troubleshoot Sampling

## Scenario
Issues with configuring, adjusting, or understanding Application Insights sampling behavior — including fixed-rate, adaptive, ingestion-side, and rate-limited sampling.

## Scoping
- Is it about turning sampling on?
- Is it adjusting the sampling currently being used?
- Is it about understanding sampling?

## Expectation Setting
- Concerns about sampling should be addressed while encouraging sampling to remain.
- Sampling concerns often start with seeing the following banner in the Azure portal:
  - "_Data received from your application is being sampled to reduce the volume of telemetry data retained; only sampled documents will be returned. The sampling may be applied by the Application Insights SDK or on ingestion._"
- Sampling is operation-based and will represent all telemetry at a percent level. Even infrequent operations will still be collected at a percentage-level.

## Analysis

1. Determine if sampling is being used and what form — see [Identify if Sampling is occurring](/Application-Insights/How-To/Sampling/Identify-if-Sampling-is-enabled)
2. Know the language involved — see [Read Aggregate by Parsed SDK Names or Raw SDK Names](/Application-Insights/How-To/Azure-Support-Center/Use-Ingestion-tab/Read-Aggregate-by-Parsed-SDK-Names-or-Raw-SDK-Names)
3. **Sampling is NOT the reason for**:
   - Consistently missing a specific telemetry item (e.g., a specific trace message or dependency) — sampling is random and wouldn't always drop the same item
   - **BUT** it could explain why an entire telemetry type is missing (e.g., all requests or all exceptions) — though this is rare
4. **Ingestion sampling does not take place** — even if set in portal — if client sampling (SDK/distro) is enabled
5. **Key sampling availability by SDK**:
   - **OpenTelemetry .NET**: Adaptive sampling removed; only Fixed-Rate and Ingestion remain
   - **Java**: Rate-limited (similar to Adaptive), Fixed-Rate, and Ingestion
   - **Python, Node.js**: Fixed-Rate and Ingestion only (both OpenTelemetry and classic)
6. Sampling concepts applied by Microsoft Distros follow the OpenTelemetry spec: [Sampling | OpenTelemetry](https://opentelemetry.io/docs/concepts/sampling/)

### Per-Language Guides
- [Manage Sampling with JAVA](/Application-Insights/How-To/Sampling/Manage-Sampling-with-JAVA)
- [Manage Sampling with .Net (Core)](/Application-Insights/How-To/Sampling/Manage-Sampling-with-Net-(Core))
- [Manage Sampling .Net Framework](/Application-Insights/How-To/Sampling/Manage-Sampling-Net-Framework)
- [Manage Sampling with Node.js](/Application-Insights/How-To/Sampling/Manage-Sampling-with-Node.js)
- [Manage Sampling with Python](/Application-Insights/How-To/Sampling/Manage-Sampling-with-Python)
- [Manage Sampling with Javascript](/Application-Insights/How-To/Sampling/Manage-Sampling-with-Javascript)
- [Manage Sampling in Azure Functions](/Application-Insights/How-To/Sampling/Manage-Sampling-in-Azure-Functions)

### Validate Sampling
- To validate sampling is working (especially Adaptive and Fixed-rate which require load):
  [Build a simple load test to validate Sampling](/Application-Insights/How-To/Sampling/Build-a-simple-load-test-to-validate-Sampling)

## Public Documentation
- [Telemetry sampling in Azure Application Insights (classic)](https://learn.microsoft.com/en-us/previous-versions/azure/azure-monitor/app/sampling)
- [Sampling in Azure Application Insights with OpenTelemetry](https://learn.microsoft.com/en-us/azure/azure-monitor/app/opentelemetry-sampling)
- [Configuring OpenTelemetry - Enable Sampling](https://learn.microsoft.com/en-us/azure/azure-monitor/app/opentelemetry-configuration?tabs=aspnetcore#enable-sampling)
- [Classic API Sampling](https://learn.microsoft.com/en-us/previous-versions/azure/azure-monitor/app/sampling-classic-api)
