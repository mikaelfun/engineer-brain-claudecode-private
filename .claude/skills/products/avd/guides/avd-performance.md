# AVD AVD 性能 - Quick Reference

**Entries**: 9 | **21V**: all applicable
**Keywords**: 0x1e, admin-highlights, bugcheck, connection-quality, contentidea-kb, deployment, display, downgrade, endpoint-analytics, endpoints, excel, framerate, intune, multi-session, nvidia
**Last updated**: 2026-04-18


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | Connection Quality (Performance) report in Intune missing RTT, available bandwid... | By design - no RTT data is collected when the connection duration is less than 2... | If connection > 2 min and data still missing, verify required endpoints are allo... | 🟢 8.0 | ADO Wiki |
| 2 📋 | Performance (Preview) blade in Intune showing partial data or no data for Window... | Required telemetry endpoints blocked or SSL inspected, Connected User Experience... | 1. Allow endpoints without SSL inspection: *.prod.warm.ingest.monitor.core.windo... | 🟢 8.0 | ADO Wiki |
| 3 📋 | Endpoint Analytics - Remoting Connection Report shows high Round Trip Time (>200... | Network latency issues causing high RTT, or sign-in process bottlenecks causing ... | Use Endpoint Analytics Remoting Connection Report in MEM portal to identify devi... | 🔵 7.0 | ADO Wiki |
| 4 📋 | Intermittent timeout errors (TaskCanceledException) in Windows 365 Admin Insight... | Downstream service (DFE or Service Health API) degradation, large data volume fo... | Check DFE and Service Health API performance. Query CloudPCEvent for TaskCancele... | 🔵 7.0 | ADO Wiki |
| 5 📋 | Windows 10/11 Enterprise multi-session AVD VM gets downgraded to Professional ed... | Scenario 2: Issue in Azure backend system (e.g., due to old WinPA agent) causes ... | Redeploy the VM. The underlying cause is a backend issue that should be resolved... | 🔵 7.0 | ADO Wiki |
| 6 📋 | Excel shows incorrect/limited number of processors in Windows 10 Enterprise Mult... | In certain VMs Excel is forced to use limited processors to preserve other apps ... | Add registry: HKLM\SOFTWARE\Microsoft\Office\Common, DWORD IdealConcurrencyValue... | 🔵 6.5 | ContentIdea |
| 7 📋 | Recurring crashed of Azure VM's has been reported&nbsp;and indicate the same pat... | After engaging the Azure team, we noted that the driver is linked to the Acceler... | 1.Enabling AN to avoid mismatch in configuration which can lead to OS instabilit... | 🔵 6.5 | ContentIdea |
| 8 📋 | Azure systems fail to boot with a 0x1E KMODE_EXCEPTION_NOT_HANDLED bugcheck. The... | Spectre/Meltdown mitigation related issue that is mitigated in current kernel pa... | Change registry value to allow system to boot so current patch levels can be app... | 🔵 6.5 | ContentIdea |
| 9 📋 | Wide screen monitor showing erratic or low frame rate feedback while using Windo... | RDP protocol uses dynamic framerate capped at 30fps by default. Static screen co... | Increase RDP frame rate cap to 60fps via registry change (see https://learn.micr... | 🔵 6.0 | ADO Wiki |

## Quick Triage Path

1. Check: By design - no RTT data is collected when the connection dur... `[Source: ADO Wiki]`
2. Check: Required telemetry endpoints blocked or SSL inspected, Conne... `[Source: ADO Wiki]`
3. Check: Network latency issues causing high RTT, or sign-in process ... `[Source: ADO Wiki]`
4. Check: Downstream service (DFE or Service Health API) degradation, ... `[Source: ADO Wiki]`
5. Check: Scenario 2: Issue in Azure backend system (e.g., due to old ... `[Source: ADO Wiki]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/avd-performance.md#troubleshooting-flow)