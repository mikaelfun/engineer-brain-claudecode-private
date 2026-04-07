---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Support Topics/Profiler or Snapshot Debugger/Profiler - Configuration or performance impact"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/605421/Profiler-Configuration-or-performance-impact"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Profiler - Configuration or Performance Impact

## Scenario
Issue configuring Profiler execution or investigate the impact on performance caused by Profiler

## Scoping
- Is the performance impact going away with disabling profiler?
- How was testing done to confirm?

## Analysis

### Enabling/Disabling Profiler

Profiler can be enabled across different platforms (Windows and Linux):

- **App Services**: Enable via Application Insights auto instrumentation or by adding application settings. App Service Profiler only supported on **Windows-based** web apps. For Linux, use NuGet package `Microsoft.ApplicationInsights.Profiler.AspNetCore`.
  - Both auto and manual instrumentation can be enabled simultaneously. Manual instrumentation handles telemetry; auto instrumentation controls features like Profiler/Snapshot Debugger.
  - Disable: https://learn.microsoft.com/azure/azure-monitor/profiler/profiler#disable-profiler
- **Functions**: https://learn.microsoft.com/azure/azure-monitor/profiler/profiler-azure-functions
- **Cloud Services**: https://learn.microsoft.com/azure/azure-monitor/profiler/profiler-cloudservice
- **Service Fabric**: https://learn.microsoft.com/azure/azure-monitor/profiler/profiler-servicefabric
- **Virtual Machines**: https://learn.microsoft.com/azure/azure-monitor/profiler/profiler-vm
- **Containers**: https://learn.microsoft.com/azure/azure-monitor/profiler/profiler-containers
- **Java Agent** (preview): https://learn.microsoft.com/azure/azure-monitor/app/java-standalone-profiler

### General Configuration

- **App Services**: Profiler Trigger settings allow configuring when profiling sessions start. See https://learn.microsoft.com/azure/azure-monitor/profiler/profiler-settings#trigger-settings
  - Users can configure their own storage (BYOS) for Profiler and Snapshot Debugger.
- **Containers/Linux**: NuGet package configuration options at https://github.com/microsoft/ApplicationInsights-Profiler-AspNetCore/blob/main/Configurations.md

### Performance Impact

- Profiler runs as a **separate process** (webjob) in App Service.
- **Default overhead**: 5-15% CPU for approximately 2 minutes per hour.
- On edge scenarios, Profiler could trigger scale-out/up when instance is already near autoscale thresholds. This is not a Profiler misbehavior; review autoscale settings.

**Investigation questions**:
1. How often does the performance issue happen?
2. Are there reproducible actions?
3. How long does it last?
4. How is the issue detected?
5. Can it be isolated to a specific process?
6. When were recent known occurrences?
7. Are there metrics/queries to observe the problem?

Use HOWTO: **Determine if Profiler is running** to correlate performance condition with Profiler execution.

### AMPLS Integration
Bring Your Own Storage (BYOS) required for Azure Private Link or customer-managed keys:
- https://learn.microsoft.com/azure/azure-monitor/profiler/profiler-bring-your-own-storage

### NuGet Package Version
Ensure `Microsoft.ApplicationInsights.Profiler.AspNetCore` >= 2.7.3 for proper startup logging when Profiler fails to start.

## Public Documentation
- Profiler Overview: https://docs.microsoft.com/azure/azure-monitor/profiler/profiler-overview
- Supported Languages/Platforms: https://learn.microsoft.com/azure/azure-monitor/profiler/profiler-overview#supported-in-profiler
- General troubleshooting: https://learn.microsoft.com/azure/azure-monitor/profiler/profiler-troubleshooting
