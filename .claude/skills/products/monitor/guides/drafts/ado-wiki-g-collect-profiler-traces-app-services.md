---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Diagnostics and Tools/Tools/Capture PerfView/Collect Profiler traces on App Services environments"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FDiagnostics%20and%20Tools%2FTools%2FCapture%20PerfView%2FCollect%20Profiler%20traces%20on%20App%20Services%20environments"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Collect Profiler Traces on App Services Environments

## Overview
Due to environment protections in App Services, PerfView cannot run. Use `dotnet-trace` utility as a workaround to collect profiler traces for Application Insights SDK investigations (missing telemetry, performance issues).

## Considerations
- **Windows:** Must provide a `--duration` parameter — otherwise you won't be able to stop collection gracefully
- `dotnet-trace` cannot collect trace during process startup; use SDK self-diagnostics logs instead for startup scenarios
- For downloading log files from Linux App Services, see the internal guide on downloading log files

## Windows Collection

1. Go to **Advanced Tools** → Kudu → **Process Explorer**
2. Note the PID of `w3wp.exe` (the one WITHOUT "scm")
3. Open **Debug console** → **PowerShell**
4. Install dotnet-trace:
   ```powershell
   dotnet tool install --global dotnet-trace
   ```
5. Navigate to `C:\home` folder, then run:

```powershell
C:\local\UserProfile\.dotnet\tools\dotnet-trace collect --process-id [PID] --duration 00:00:01:00 --providers Microsoft-ApplicationInsights-Core:0xFFFFFFFFFFFFFFFF:5,Microsoft-ApplicationInsights-Data:0xFFFFFFFFFFFFFFFF:5,Microsoft-ApplicationInsights-WindowsServer-TelemetryChannel:0xFFFFFFFFFFFFFFFF:5,Microsoft-ApplicationInsights-Extensibility-AppMapCorrelation-Dependency:0xFFFFFFFFFFFFFFFF:5,Microsoft-ApplicationInsights-Extensibility-AppMapCorrelation-Web:0xFFFFFFFFFFFFFFFF:5,Microsoft-ApplicationInsights-Extensibility-DependencyCollector:0xFFFFFFFFFFFFFFFF:5,Microsoft-ApplicationInsights-Extensibility-HostingStartup:0xFFFFFFFFFFFFFFFF:5,Microsoft-ApplicationInsights-Extensibility-PerformanceCollector:0xFFFFFFFFFFFFFFFF:5,Microsoft-ApplicationInsights-Extensibility-EventCounterCollector:0xFFFFFFFFFFFFFFFF:5,Microsoft-ApplicationInsights-Extensibility-PerformanceCollector-QuickPulse:0xFFFFFFFFFFFFFFFF:5,Microsoft-ApplicationInsights-Extensibility-Web:0xFFFFFFFFFFFFFFFF:5,Microsoft-ApplicationInsights-Extensibility-WindowsServer:0xFFFFFFFFFFFFFFFF:5,Microsoft-ApplicationInsights-WindowsServer-Core:0xFFFFFFFFFFFFFFFF:5,Microsoft-ApplicationInsights-LoggerProvider:0xFFFFFFFFFFFFFFFF:5,Microsoft-ApplicationInsights-Extensibility-EventSourceListener:0xFFFFFFFFFFFFFFFF:5,Microsoft-ApplicationInsights-AspNetCore:0xFFFFFFFFFFFFFFFF:5
```

**Note:** Duration of 1 minute is required for Windows-based collections.

## Linux Collection

1. Go to **Advanced Tools** → **Process Explorer**
2. Note the PID of `dotnet.exe` process (not w3wp.exe on Linux)
3. Click **SSH** and run:

```bash
dotnet-trace collect --process-id [PID] --providers Microsoft-ApplicationInsights-Core:0xFFFFFFFFFFFFFFFF:5,Microsoft-ApplicationInsights-Data:0xFFFFFFFFFFFFFFFF:5,Microsoft-ApplicationInsights-WindowsServer-TelemetryChannel:0xFFFFFFFFFFFFFFFF:5,Microsoft-ApplicationInsights-Extensibility-AppMapCorrelation-Dependency:0xFFFFFFFFFFFFFFFF:5,Microsoft-ApplicationInsights-Extensibility-AppMapCorrelation-Web:0xFFFFFFFFFFFFFFFF:5,Microsoft-ApplicationInsights-Extensibility-DependencyCollector:0xFFFFFFFFFFFFFFFF:5,Microsoft-ApplicationInsights-Extensibility-HostingStartup:0xFFFFFFFFFFFFFFFF:5,Microsoft-ApplicationInsights-Extensibility-PerformanceCollector:0xFFFFFFFFFFFFFFFF:5,Microsoft-ApplicationInsights-Extensibility-EventCounterCollector:0xFFFFFFFFFFFFFFFF:5,Microsoft-ApplicationInsights-Extensibility-PerformanceCollector-QuickPulse:0xFFFFFFFFFFFFFFFF:5,Microsoft-ApplicationInsights-Extensibility-Web:0xFFFFFFFFFFFFFFFF:5,Microsoft-ApplicationInsights-Extensibility-WindowsServer:0xFFFFFFFFFFFFFFFF:5,Microsoft-ApplicationInsights-WindowsServer-Core:0xFFFFFFFFFFFFFFFF:5,Microsoft-ApplicationInsights-LoggerProvider:0xFFFFFFFFFFFFFFFF:5,Microsoft-ApplicationInsights-Extensibility-EventSourceListener:0xFFFFFFFFFFFFFFFF:5,Microsoft-ApplicationInsights-AspNetCore:0xFFFFFFFFFFFFFFFF:5
```

Press `<Enter>` or `<Ctrl+C>` to stop collection.

## Public Documentation
- [dotnet-trace performance analysis utility](https://learn.microsoft.com/dotnet/core/diagnostics/dotnet-trace)
- [Capturing dotnet trace for app service](https://techcommunity.microsoft.com/t5/iis-support-blog/capturing-dotnet-trace-for-app-service/ba-p/3398328)
