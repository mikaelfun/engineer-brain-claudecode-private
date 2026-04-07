---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/References/Language Resource"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/References/Language%20Resource"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Application Insights Language Resource Reference

## Overview
Central reference for all supported languages with both Classic SDKs and OpenTelemetry.
For deprecated SDK support policies see: [SDK support guidance](https://learn.microsoft.com/azure/azure-monitor/app/sdk-support-guidance)

## Diagnostics
[Application Insights Diagnostic Logs - Overview](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/579991/Application-Insights-Diagnostic-Logs)

## .NET Core
- **Classic SDK**: [ASP.NET Core](https://learn.microsoft.com/azure/azure-monitor/app/asp-net-core)
- **OpenTelemetry**: [Enable Azure Monitor OpenTelemetry](https://learn.microsoft.com/azure/azure-monitor/app/opentelemetry-enable?tabs=aspnetcore)
- GitHub: https://github.com/microsoft/ApplicationInsights-dotnet

## .NET Framework
- **Classic SDK**: [Configure App Insights for ASP.NET](https://learn.microsoft.com/azure/azure-monitor/app/asp-net)
- **OpenTelemetry**: [Enable Azure Monitor OpenTelemetry](https://learn.microsoft.com/azure/azure-monitor/app/opentelemetry-enable?tabs=net)
- Windows only, eventually being replaced by .NET (Core)

## Java
- **Java 3.X** (current, fully OpenTelemetry): [Enable OpenTelemetry](https://learn.microsoft.com/azure/azure-monitor/app/opentelemetry-enable?tabs=java)
- **Java 2.X** (retired Sep 30, 2025): No fixes. Recommend upgrade to 3.X
  - Migration: [Upgrading from 2.x SDK](https://learn.microsoft.com/azure/azure-monitor/app/java-standalone-upgrade-from-2x)
- Self-diagnostics: Java Agent diagnostic logs
- Collection tools: Collect Java Dumps and Traces

## Node.js
- **Classic**: [Monitor Node.js services](https://learn.microsoft.com/azure/azure-monitor/app/nodejs)
- **OpenTelemetry**: [Migrate from SDK 2.X to OpenTelemetry](https://learn.microsoft.com/azure/azure-monitor/app/opentelemetry-nodejs-migrate)
- Nest.js integration: require applicationinsights before NestFactory.create()

## Python
- **OpenCensus**: Being deprecated
- **OpenTelemetry**: [Enable Azure Monitor OpenTelemetry for Python](https://learn.microsoft.com/azure/azure-monitor/app/opentelemetry-enable?tabs=python)
