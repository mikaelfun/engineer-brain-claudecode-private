---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Diagnostics and Tools/Tools/Capture PerfView/PerfView Data Analysis"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FDiagnostics%20and%20Tools%2FTools%2FCapture%20PerfView%2FPerfView%20Data%20Analysis"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# PerfView Data Analysis

## Overview
Guidelines on analyzing PerfView traces and best practices for App Insights investigations.

## Considerations
- Review the PerfView Data Collection guide first
- Different problems require distinct troubleshooting techniques
- Key questions for App Insights no-data investigation:
  1. Is Application Insights loaded or attached?
  2. Did the application produce telemetry?
  3. Was the telemetry successfully ingested?

## Analysis Options

### Trace Info View
Provides information about:
- **Machine Name:** Identifies the VM instance (use with AppLens detectors/Kusto tables)
- **Operating System:** OS version details
- **Last Boot Time:** When machine was last rebooted
- **Trace Collection Time:** When ETL trace was collected
- **Trace Duration:** Length of trace
- **Event Count:** Total events captured
- **Lost Events:** If any events were lost (counter != 0 → warning)
- **Time Offset:** Time zone offset for UTC conversion
- **File Size:** ETL file size

### Process Summary View
Key fields:
- **Process ID (PID):** Unique identifier
- **Process Name:** For App Insights investigations, look for `w3wp.exe`
- **Command Line:** Contains IIS pipeline mode (`-m` flag, `0` = Integrated Mode), Application Pool (`-ap` flag)
  - `~1` = Kudu/SCM App Pool (NOT the target process)
  - `293F` appended = staging slot
- **Processes That Did Not Live for Entire Trace** vs **Processes That Did** sections

### Module Version Information View
Shows DLLs loaded into specific processes.

### Events Statistics View
Different event types captured and event counts per type.

### Events View — Key Event Types

**CommandLineParameters:** Parameters used when collecting trace (circular buffer size, provider list).

**ProcessStart (Windows Kernel):** Marks initiation of new process — confirms w3wp.exe started, tracks process lifecycle.

**GENERAL_REQUEST_START (IIS):** Captures web request initiation — determines if IIS received and handed off request to ASP.NET. If IIS handled request without passing to ASP.NET → App Insights won't capture it.

**Image/Load (Windows Kernel):** Captures DLL loading — verify if App Insights DLL is loaded. Only captured if trace starts during process startup; otherwise use DotNETRuntime/Loader events.

**FrameworkLightUp / IIS-ManagedHttpModuleHelper / RedfieldIISModule:** Diagnose auto-instrumentation status:
- Path containing "az.applicationmonitor" → on-premises agent (Status Monitor v2)
- Path for App Services auto-attach or VM/VMSS extension differs
- "Matched filter" events → filter matching against IIS configuration
- "Successfully attached ApplicationInsights SDK" → DLLs attached successfully
- **RedfieldIISModule/Trace** → errors when SDK fails to attach
- Use **DotNETRuntime/Loader** events to identify conflicting DLL paths

**RawResponseFromAIBackend:** Confirms telemetry sent to Breeze ingestion service (items received/accepted count).

**Data Provider Events:** Exception, Message, Metric, Remote Dependency, Request telemetry items.

**Telemetry Channel Events:**
- Transmission Sending Failed Warning → closed connections or auth failures
- Storage Issues Warning → permission issues writing to disk
- Backoff Interval → exponential backoff for retry
- Storage Folder → where transmission files are stored

**QuickPulse Events:**
- Ping Sent Event → SDK pinging QuickPulse WCF service every 5 seconds
- Service Communication Failed → connection or auth issues

### Shortcuts
- **CTRL + A → Enter:** Project all events
- **Alt + R:** Highlight histogram section to focus on time range

## Process Filter Importance
- Isolates events to specific process (e.g., specific w3wp.exe instance)
- Reduces noise from unrelated processes
- Enables focused analysis of DLL loads, telemetry generation, network requests

## Public Documentation
- N/A
