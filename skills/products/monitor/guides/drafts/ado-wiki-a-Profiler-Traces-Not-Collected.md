---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Support Topics/Profiler or Snapshot Debugger/Profiler - Traces are not collected"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/605419/Profiler-Traces-are-not-collected"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Profiler - Traces are Not Collected

## Scenario
Application Insights Profiler is not sending or suddenly stopped sending profile traces data.

## Scoping
- Is this new behavior? Were traces generated before?
- Were any changes made prior to this behavior?
- What experience shows no traces are being generated?
- Any errors in the portal?
- Has the user seen: https://learn.microsoft.com/azure/azure-monitor/profiler/profiler-troubleshooting

## Expectation Setting
- Profiler is **not** supported for all languages and platforms. Validate support scenario early.

## General Analysis Steps
1. Check Known Issues
2. Validate app runs on supported language and platform
3. For manual deployments, ensure NuGet `Microsoft.ApplicationInsights.Profiler.AspNetCore` >= 2.7.3 (includes startup logging)
4. Check if AppInsights resource associated to AMPLS
5. Check if LOCAL AUTHENTICATION disabled
6. Validate networking connectivity to Profiler endpoints
7. Complete platform-specific workflow below

## App Services Web Apps

### .NET Apps
1. Reference public troubleshooting: https://learn.microsoft.com/azure/azure-monitor/profiler/profiler-troubleshooting
2. Validate App Service plan (check via AppLens)
3. **Validate Always On is enabled** - required for Profiler to avoid timeout issues
4. Validate supported .NET Framework/.NET Core version
5. Determine if Profiler is running (HOWTO: Determine if Profiler is running)
   - Not running -> try enabling
   - Enabled but not running -> check trigger/collection
   - Running but no traces -> collect WebJob logs
6. Collect App Services WebJob logs for analysis

### Java Apps
1. Validate supported App Service plan
2. Ensure Java 3.x agent (sdkVersion >= 3.4.0)
3. Profiler enabled per environment variables and installation docs
4. Collect self-diagnostics logs to determine Profiler status

## Azure Functions
- **NOT supported by Azure Monitor** (support boundary)
- See: https://learn.microsoft.com/azure/azure-monitor/profiler/profiler-azure-functions

## Azure VMs (WAD sink)
1. Validate supported .NET version
2. Validate networking connectivity to Profiler endpoints
3. See: https://learn.microsoft.com/azure/azure-monitor/profiler/profiler-troubleshooting#vms-and-azure-cloud-services
4. Determine if Profiler is running -> enable/troubleshoot accordingly

## NuGet package (Containers, Linux apps)
1. Validate supported .NET version
2. Validate networking connectivity
3. **COMPlus_EnableDiagnostics must be set to 1** - required for Profiler in IaaS/container environments (PaaS sets this by default)
4. Configure logging: https://github.com/microsoft/ApplicationInsights-Profiler-AspNetCore/blob/main/Configurations.md
5. Determine if Profiler is running -> enable/troubleshoot accordingly

## Public Documentation
- Profiler Overview: https://docs.microsoft.com/azure/azure-monitor/profiler/profiler-overview
- Supported Platforms: https://learn.microsoft.com/azure/azure-monitor/profiler/profiler-overview#supported-in-profiler
- Troubleshooting: https://learn.microsoft.com/azure/azure-monitor/profiler/profiler-troubleshooting
