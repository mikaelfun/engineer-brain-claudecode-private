---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Support Topics/Profiler or Snapshot Debugger/Profiler - Analyzing traces"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FSupport%20Topics%2FProfiler%20or%20Snapshot%20Debugger%2FProfiler%20-%20Analyzing%20traces"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Profiler - Analyzing Traces

Questions about understanding and interpreting the data collected by the Application Insights Profiler.

## Scoping
- What is the specific ask about the Profiler traces?
- Is the ask about encountering unexpected results in Profiler and needing an explanation?
- Is the ask about experiencing a performance issue and needing CSS assistance to interpret the results?
- **Important**: CSS can help interpret Profiler results but is NOT responsible for in-depth performance investigations of customer applications. Set expectations early.
- Capture screenshots with gathered information.

## Analysis

### Profiler Data Limitations
- Profiler data is restricted to the specific instance and the **2-minute time windows** during which it was executed.
- It primarily measures entry-to-exit times of methods within a call.
- It does **NOT** account for:
  - Network time
  - Code execution time for external processes
  - Waiting times for external API or database dependency calls

### Public Reference
- [Interpreting Profiler performance data](https://learn.microsoft.com/azure/azure-monitor/profiler/profiler-data)

### Multiple Traces Needed
- A single Profiler trace is often insufficient to diagnose performance issues.
- Multiple traces must be captured and analyzed in parallel to identify patterns.
- Performance investigations are complex and not the primary focus of Azure Monitoring CSS.

### Alternative Methods
When Profiler data alone is insufficient:
- Manually add `TrackTrace()` statements around different method entry and exit points.
- Compare timestamps of trace telemetry items.
- Example: [Telemetry Clients Exploration](/Application-Insights/Learning-Resources/Training/Course-Materials/Manual-instrumentation/Classic-SDK/ASPNet-Core/Telemetry-Clients-Exploration) - "Debugging long-running executions in code" section.

### In-depth Profiler Data Understanding
[Understanding Profiler Data](/Application-Insights/Learning-Resources/Concepts/Understanding-Profiler-Data)

## References
- Profiler Overview: https://docs.microsoft.com/azure/azure-monitor/profiler/profiler-overview
- [View Profiler data](https://learn.microsoft.com/azure/azure-monitor/profiler/profiler-data)
- [Understanding Profiler Data](/Application-Insights/Learning-Resources/Concepts/Understanding-Profiler-Data)
