---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Support Topics/Application Insights setup and customization/Getting started"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FSupport%20Topics%2FApplication%20Insights%20setup%20and%20customization%2FGetting%20started"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Getting Started with Application Insights

## Scenario

Learn what Application Insights is and does, how to enable and configure Application Insights to start collecting telemetry.

## What is Application Insights?

Application Insights is an APM (Application Performance Monitoring) tool that provides trend analysis of an application to understand its health and performance.

- [Overview](https://learn.microsoft.com/en-us/azure/azure-monitor/app/app-insights-overview)
- [How it works - Data collection basics](https://learn.microsoft.com/en-us/azure/azure-monitor/app/opentelemetry-overview)
- [Supported languages](https://learn.microsoft.com/en-us/azure/azure-monitor/app/app-insights-overview#supported-languages)
- [FAQ](https://learn.microsoft.com/en-us/azure/azure-monitor/app/application-insights-faq)

## Key Features

- [Overview dashboard](https://learn.microsoft.com/en-us/azure/azure-monitor/app/overview-dashboard)
- [Application map](https://learn.microsoft.com/en-us/azure/azure-monitor/app/app-map)
- [Availability tests](https://learn.microsoft.com/en-us/azure/azure-monitor/app/availability?tabs=standard)
- [Failures, performance, and transactions](https://learn.microsoft.com/en-us/azure/azure-monitor/app/failures-performance-transactions?tabs=failures-view%2Cresults-list)
- [Live metrics](https://learn.microsoft.com/en-us/azure/azure-monitor/app/live-stream?tabs=otel)
- [SDK stats (Preview)](https://learn.microsoft.com/en-us/azure/azure-monitor/app/sdk-stats)
- [Usage analysis](https://learn.microsoft.com/en-us/azure/azure-monitor/app/usage?tabs=users)

## Setting Up / Enabling

Two instrumentation options:

### Autoinstrumentation

Often a feature of another Azure service (App Services, Functions, etc.). Simple "enable" toggle. Service manages SDK version updates. Historically called "codeless."

- [Autoinstrumentation overview](https://learn.microsoft.com/en-us/azure/azure-monitor/app/codeless-overview)

### Manual Instrumentation

Add necessary packages/libraries to the application. Provides full control over SDK version and ability to add custom telemetry collection beyond defaults.

- [Enable OpenTelemetry](https://learn.microsoft.com/en-us/azure/azure-monitor/app/opentelemetry-enable?tabs=aspnetcore)
- [.NET Classic API](https://learn.microsoft.com/en-us/azure/azure-monitor/app/dotnet?tabs=net%2Cnet-1%2Cserver%2Cportal%2Ccsharp%2Cenqueue%2Capi-net)
- [Node.js Classic API](https://learn.microsoft.com/en-us/azure/azure-monitor/app/nodejs?tabs=api-net)
- [JavaScript SDK](https://learn.microsoft.com/en-us/azure/azure-monitor/app/javascript-sdk?tabs=javascriptwebsdkloaderscript)

### Classic SDK vs OpenTelemetry

Classic Application Insights SDKs are heading towards deprecation and eventual retirement (probably years away). They are not a focus of efforts going forward. Consider OpenTelemetry distros for new projects.

### Application Insights Component

The AI component itself does not contain data/telemetry. Data is stored in a linked Log Analytics Workspace.

- [Create and configure AI resources](https://learn.microsoft.com/en-us/azure/azure-monitor/app/create-workspace-resource?tabs=portal)

## Expectation Setting

- If the ask is needing help to send telemetry via OpenTelemetry to a 3rd party destination (e.g., DynaTrace), this is **NOT supported by Microsoft**
- OTLP Exporter usage is **NOT supported by Microsoft** — direct to public forums
