# AVD AVD 性能 - Quick Reference

**Entries**: 7 | **21V**: all applicable
**Keywords**: admin-highlights, connection-quality, endpoint-analytics, endpoints, excel, geneva-agent, intune, monitoring
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | Connection Quality (Performance) report in Intune missing RTT, available bandwid... | By design - no RTT data is collected when the connection duration is less than 2... | If connection > 2 min and data still missing, verify required endpoints are allo... | 🔵 7.5 | ADO Wiki |
| 2 📋 | Performance (Preview) blade in Intune showing partial data or no data for Window... | Required telemetry endpoints blocked or SSL inspected, Connected User Experience... | 1. Allow endpoints without SSL inspection: *.prod.warm.ingest.monitor.core.windo... | 🔵 7.5 | ADO Wiki |
| 3 📋 | RTT and bandwidth information missing from CloudPC Performance / Connection Qual... | Geneva Agent scheduled task is not running - either disabled, stopped, or blocke... | On affected CloudPC check: 1) Geneva Agent is installed. 2) Check EventViewer > ... | 🔵 7.5 | ADO Wiki |
| 4 📋 | Endpoint Analytics - Remoting Connection Report shows high Round Trip Time (>200... | Network latency issues causing high RTT, or sign-in process bottlenecks causing ... | Use Endpoint Analytics Remoting Connection Report in MEM portal to identify devi... | 🔵 7.0 | ADO Wiki |
| 5 📋 | Intermittent timeout errors (TaskCanceledException) in Windows 365 Admin Insight... | Downstream service (DFE or Service Health API) degradation, large data volume fo... | Check DFE and Service Health API performance. Query CloudPCEvent for TaskCancele... | 🔵 7.0 | ADO Wiki |
| 6 📋 | Excel shows incorrect/limited number of processors in Windows 10 Enterprise Mult... | In certain VMs Excel is forced to use limited processors to preserve other apps ... | Add registry: HKLM\SOFTWARE\Microsoft\Office\Common, DWORD IdealConcurrencyValue... | 🔵 6.5 | KB |
| 7 📋 | Recurring crashed of Azure VM's has been reported&nbsp;and indicate the same pat... | After engaging the Azure team, we noted that the driver is linked to the Acceler... | 1.Enabling AN to avoid mismatch in configuration which can lead to OS instabilit... | 🔵 6.5 | KB |

## Quick Triage Path

1. Check: By design - no RTT data is collected when the conn `[Source: ADO Wiki]`
2. Check: Required telemetry endpoints blocked or SSL inspec `[Source: ADO Wiki]`
3. Check: Geneva Agent scheduled task is not running - eithe `[Source: ADO Wiki]`
4. Check: Network latency issues causing high RTT, or sign-i `[Source: ADO Wiki]`
5. Check: Downstream service (DFE or Service Health API) deg `[Source: ADO Wiki]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/avd-performance.md#troubleshooting-flow)
