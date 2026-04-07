---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Diagnostics and Tools/Tools/Capture PerfView/PerfView Data Collection"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FDiagnostics%20and%20Tools%2FTools%2FCapture%20PerfView%2FPerfView%20Data%20Collection"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# PerfView Data Collection

## Overview
Guidelines on collecting PerfView traces and best practices.

## Considerations
- **When to use PerfView?** IaaS scenarios (Azure VMs running IIS) or on-premises. NOT for PaaS (App Services, Azure Functions) where instance access is restricted.
- PerfView captures event trace data **system-wide** — no need to target a specific process (though you can filter later).
- For App Services ETW events, see the App Services section below.

## Collection Options
- **Collect** from Menu bar → opens collection dialog
- **Zip option:** Collects symbol files for call stack investigation
- **Merge option:** Merges kernel and user mode ETL traces into single file
- **Circular MB:** Default 500 MB buffer — oldest data gets overwritten when limit reached. Increase before starting if needed.

## App Services ETW Events
- From **Process Explorer** in Kudu, click "Start Profiling" (check "Collect IIS Events")
- Generates `.DIAGSESSION` file (not .ETL)
- Two w3wp.exe processes shown — the one with "scm" is for Kudu interface, NOT your target
- App Services uses VSDiagnostics profiler
- **Cannot capture ETW during process startup on App Services** — VS Diagnostics can only attach to running processes

## How to Collect ETW Trace Using PerfView

Public reference: [Collect ETW logs by using PerfView](https://learn.microsoft.com/troubleshoot/azure/azure-monitor/app-insights/status-monitor-v2-troubleshoot#collect-etw-logs-by-using-perfview)

### For process startup capture:
1. Prepare collection:
   - Include Application Insights providers + canned providers (IIS, NET)
   - Note the Current Dir (where trace will be saved)
2. Start trace collection
3. Perform IIS reset: `iisreset` (elevated permissions)
4. Reproduce broken behavior (this creates new w3wp.exe process)
5. Stop data collection

### Why start profiler BEFORE IISReset:
- **Captures startup events:** Loading of App Insights and critical modules
- **Identifies load failures:** If App Insights fails to load → no telemetry
- **Complete trace:** Full trace from IIS service restart

### Best practices:
- Write down start/end times and local timezone during collection
- After collection, identify the target w3wp.exe PID for analysis stage

## Public Documentation
- [Collect ETW logs by using PerfView](https://learn.microsoft.com/troubleshoot/azure/azure-monitor/app-insights/status-monitor-v2-troubleshoot#collect-etw-logs-by-using-perfview)
