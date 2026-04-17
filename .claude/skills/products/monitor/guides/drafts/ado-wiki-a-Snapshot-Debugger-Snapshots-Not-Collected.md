---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Support Topics/Profiler or Snapshot Debugger/Snapshot Debugger - Snapshots not collected"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/605427/Snapshot-Debugger-Snapshots-not-collected"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Snapshot Debugger - Snapshots Not Collected

## Scenario
Problems with Snapshot Debugger not sending or stopped sending debug snapshots.

## Scoping
- What platform is being used?
- Why does the user believe snapshots are not being collected?
- Did they just enable/start using Snapshot Debugger?
- How many times has a specific exception occurred?

## Analysis Steps
1. Check Known Issues
2. Validate supported language and platform: https://learn.microsoft.com/azure/azure-monitor/snapshot-debugger/snapshot-debugger#enable-application-insights-snapshot-debugger-for-your-application
   - Note: debugging microservices in Visual Studio on Windows 11 dev machine is supported
3. Determine if Snapshot Debugger is enabled (HOWTO: Determine if Snapshot Debugger is enabled)
4. If enabled and NO data in customEvents/AppEvents table -> go to step 8
5. **At least 2 exceptions of the same type must occur** before a snapshot is triggered (by design). See: https://learn.microsoft.com/azure/azure-monitor/snapshot-debugger/snapshot-debugger#snapshot-debugger-process
6. If everything seems in place, analyze Snapshot Debugger logs (HOWTO: Snapshot debugger log analysis)
7. Steps 1-6 can be done before contacting customer
8. If no logs generated -> something went wrong after enabling. Leverage: https://learn.microsoft.com/azure/azure-monitor/snapshot-debugger/snapshot-debugger-troubleshoot

## Public Documentation
- Debug exceptions: https://learn.microsoft.com/azure/azure-monitor/snapshot-debugger/snapshot-debugger
- Snapshot Debugger process: https://learn.microsoft.com/azure/azure-monitor/snapshot-debugger/snapshot-debugger#snapshot-debugger-process
- Troubleshooting: https://learn.microsoft.com/azure/azure-monitor/snapshot-debugger/snapshot-debugger-troubleshoot
