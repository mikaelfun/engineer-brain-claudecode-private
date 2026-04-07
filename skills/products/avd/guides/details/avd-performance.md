# AVD AVD 性能 - Comprehensive Troubleshooting Guide

**Entries**: 7 | **Drafts fused**: 1 | **Kusto queries fused**: 0
**Source drafts**: ado-wiki-resource-performance.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: KB, ADO Wiki

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| Connection Quality (Performance) report in Intune missing RT... | By design - no RTT data is collected when the connection dur... | If connection > 2 min and data still missing, verify require... |
| Performance (Preview) blade in Intune showing partial data o... | Required telemetry endpoints blocked or SSL inspected, Conne... | 1. Allow endpoints without SSL inspection: *.prod.warm.inges... |
| RTT and bandwidth information missing from CloudPC Performan... | Geneva Agent scheduled task is not running - either disabled... | On affected CloudPC check: 1) Geneva Agent is installed. 2) ... |
| Endpoint Analytics - Remoting Connection Report shows high R... | Network latency issues causing high RTT, or sign-in process ... | Use Endpoint Analytics Remoting Connection Report in MEM por... |
| Intermittent timeout errors (TaskCanceledException) in Windo... | Downstream service (DFE or Service Health API) degradation, ... | Check DFE and Service Health API performance. Query CloudPCE... |
| Excel shows incorrect/limited number of processors in Window... | In certain VMs Excel is forced to use limited processors to ... | Add registry: HKLM\SOFTWARE\Microsoft\Office\Common, DWORD I... |
| Recurring crashed of Azure VM's has been reported&nbsp;and i... | After engaging the Azure team, we noted that the driver is l... | 1.Enabling AN to avoid mismatch in configuration which can l... |

### Phase 2: Detailed Investigation

#### Resource performance on Endpoint Analytics
> Source: [ado-wiki-resource-performance.md](guides/drafts/ado-wiki-resource-performance.md)

Resource performance report helps IT monitor end user performance of the Cloud PC device in their environment based on compute resources, CPU and RAM.

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | Connection Quality (Performance) report in Intune missing RTT, available bandwid... | By design - no RTT data is collected when the connection duration is less than 2... | If connection > 2 min and data still missing, verify required endpoints are allo... | 🔵 7.5 | ADO Wiki |
| 2 | Performance (Preview) blade in Intune showing partial data or no data for Window... | Required telemetry endpoints blocked or SSL inspected, Connected User Experience... | 1. Allow endpoints without SSL inspection: *.prod.warm.ingest.monitor.core.windo... | 🔵 7.5 | ADO Wiki |
| 3 | RTT and bandwidth information missing from CloudPC Performance / Connection Qual... | Geneva Agent scheduled task is not running - either disabled, stopped, or blocke... | On affected CloudPC check: 1) Geneva Agent is installed. 2) Check EventViewer > ... | 🔵 7.5 | ADO Wiki |
| 4 | Endpoint Analytics - Remoting Connection Report shows high Round Trip Time (>200... | Network latency issues causing high RTT, or sign-in process bottlenecks causing ... | Use Endpoint Analytics Remoting Connection Report in MEM portal to identify devi... | 🔵 7.0 | ADO Wiki |
| 5 | Intermittent timeout errors (TaskCanceledException) in Windows 365 Admin Insight... | Downstream service (DFE or Service Health API) degradation, large data volume fo... | Check DFE and Service Health API performance. Query CloudPCEvent for TaskCancele... | 🔵 7.0 | ADO Wiki |
| 6 | Excel shows incorrect/limited number of processors in Windows 10 Enterprise Mult... | In certain VMs Excel is forced to use limited processors to preserve other apps ... | Add registry: HKLM\SOFTWARE\Microsoft\Office\Common, DWORD IdealConcurrencyValue... | 🔵 6.5 | KB |
| 7 | Recurring crashed of Azure VM's has been reported&nbsp;and indicate the same pat... | After engaging the Azure team, we noted that the driver is linked to the Acceler... | 1.Enabling AN to avoid mismatch in configuration which can lead to OS instabilit... | 🔵 6.5 | KB |
