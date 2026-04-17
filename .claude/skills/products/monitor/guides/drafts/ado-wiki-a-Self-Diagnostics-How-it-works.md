---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Learning Resources/Training/Course Materials/Conceptual/Understanding Self-Diagnostics in Application Insights/How it works?"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FLearning%20Resources%2FTraining%2FCourse%20Materials%2FConceptual%2FUnderstanding%20Self-Diagnostics%20in%20Application%20Insights%2FHow%20it%20works%3F"
importDate: "2026-04-06"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

:::template /.templates/Sandbox-Header.md
:::

[[_TOC_]]


# Overview
---

This section explains **how Self-Diagnostics works** in the Application Insights SDK.

# Workflow
---

When Self-Diagnostics is enabled, the Application Insights instrumentation begins recording its internal activity to log files stored on the local machine. 

## Enabling
How it is enabled and configured does have many commonalities between the languages especially within OpenTelemetry. The differences come in given the platform used given the platform can dictate much and the integration on any platform is up to the product or service providing the integration, see [Support Boundaries - Overview](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/579997/Support-Boundaries). The Azure Monitor support team cannot be trained in every service offering integration with Application Insights.

## Configuration
This logging mechanism is highly configurable:

*   **Log Location:**  
    By default, logs are written to a predefined directory, but you can customize this location to suit your environment or organizational policies.
    
*   **Log Levels:**  
    The level of detail captured in the logs is adjustable. You can set the log level to Error, Warning, Info, or Verbose, depending on how much information you need for troubleshooting.


# Public Documentation
---
## Net
- [opentelemetry-dotnet/src/OpenTelemetry at main · open-telemetry/opentelemetry-dotnet](https://github.com/open-telemetry/opentelemetry-dotnet/tree/main/src/OpenTelemetry#self-diagnostics)
- [Self-diagnostics for Application Insights SDKs - Azure | Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/app-insights/telemetry/enable-self-diagnostics)

## Java
- [Configuration options - Azure Monitor Application Insights for Java - Azure Monitor | Microsoft Learn](https://learn.microsoft.com/en-us/azure/azure-monitor/app/java-standalone-config#self-diagnostics)

## Python
- [Troubleshoot OpenTelemetry issues in Python - Azure | Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/app-insights/telemetry/opentelemetry-troubleshooting-python#enable-diagnostic-logging)

## Node.js
- [Troubleshoot OpenTelemetry issues in Node.js - Azure | Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/app-insights/telemetry/opentelemetry-troubleshooting-nodejs#step-1-enable-diagnostic-logging)

# Internal References
---
[Language Resource - Overview](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/890133/Language-Resource)

---
Last Modified date: 29/09/2025
Last Modified by: damanue

