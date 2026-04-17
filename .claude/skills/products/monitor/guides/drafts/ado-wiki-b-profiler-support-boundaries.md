---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Support Boundaries/Profiler"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FSupport%20Boundaries%2FProfiler"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Application Insights Profiler Support Boundaries

## Overview
Profiling in .NET analyzes performance (memory usage, CPU usage, method timing). Multiple tools exist: Visual Studio, App Services Diagnostic Tools, dotnet-trace, PerfView, and Application Insights Profiler.

Application Insights offers a built-in Profiler feature that works with some SDKs. As of today, Profiler in Application Insights is only available for **.NET and Java** applications.

## Supported Profiler Scenarios (Azure Monitoring CSS)

### .NET Profiler
1. **App Service (Windows) via autoinstrumentation**: https://learn.microsoft.com/azure/azure-monitor/profiler/profiler
2. **Function Apps via autoinstrumentation**: https://learn.microsoft.com/azure/azure-monitor/profiler/profiler-azure-functions
3. **App Service (Windows/Linux) via manual instrumentation**: https://learn.microsoft.com/azure/azure-monitor/profiler/profiler-aspnetcore-linux
4. **Containers**: https://learn.microsoft.com/azure/azure-monitor/profiler/profiler-containers
5. **VMs/VMSS via Azure Diagnostics extension (.NET Core)**: https://learn.microsoft.com/azure/azure-monitor/profiler/profiler-vm
6. **Service Fabric via Azure Diagnostics extension (.NET Framework & .NET Core)**: https://learn.microsoft.com/azure/azure-monitor/profiler/profiler-servicefabric

### Java Profiler
- **Java Agent Profiler**: https://learn.microsoft.com/azure/azure-monitor/app/java-standalone-profiler

## NOT Supported by Azure Monitoring CSS
- Visual Studio Profiler
- App Services Profiler via Diagnostics Tools blade
- PerfView, dotnet-trace, Redgate ANTS, JetBrains Rider Profiler, etc.
- **OpenTelemetry .NET distro Profiler** (as of March 2025): new library by the Profiler team; customers must use GitHub issues: https://github.com/Azure/azuremonitor-opentelemetry-profiler-net/issues

## CSS Scope of Support
- Assist customers in getting Profiler working correctly
- Identify supported/unsupported scenarios and guide customers accordingly
- Provide clarity on reading profiler trace results per: https://learn.microsoft.com/azure/azure-monitor/profiler/profiler-data#how-to-read-performance-data

## NOT in CSS Scope
- Debugging, analyzing, or reading profiler traces
- Performance investigation on third-party code

## Data Collection Before Engagement
- Precise description of the issue
- Which profiling feature exactly? Documentation reference?
- Resource URIs of the product/service involved
- Application Insights resource URI
