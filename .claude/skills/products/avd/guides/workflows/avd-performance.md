# AVD 性能 — Troubleshooting Workflow

**Scenario Count**: 9
**Generated**: 2026-04-18

---

## Scenario 1: Connection Quality (Performance) report in Intune missing RT...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- If connection > 2 min and data still missing, verify required endpoints are allowed without SSL inspection: *.prod.warm.ingest.monitor.core.windows.net, gcs.prod.monitoring.core.windows.net, *.events.data.microsoft.com, *.blob.core.windows.net, *.table.core.windows.net, *.servicebus.windows.net. Test reachability with Invoke-WebRequest and curl from the CPC.

**Root Cause**: By design - no RTT data is collected when the connection duration is less than 2 minutes

## Scenario 2: Performance (Preview) blade in Intune showing partial data o...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- 1
- Allow endpoints without SSL inspection: *.prod.warm.ingest.monitor.core.windows.net:443, gcs.prod.monitoring.core.windows.net:443, *.events.data.microsoft.com:443
- 2
- Verify Connected User Experience service is running
- 3
- Check WVD Events in Application.evtx for missing reporting endpoints
- 4
- Enroll devices in Intune Endpoint Analytics and create Windows Health Monitoring policy.

**Root Cause**: Required telemetry endpoints blocked or SSL inspected, Connected User Experience service not running, or devices not enrolled in Intune Endpoint Analytics

## Scenario 3: Endpoint Analytics - Remoting Connection Report shows high R...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Use Endpoint Analytics Remoting Connection Report in MEM portal to identify devices with above-average metrics. RTT >200ms is high. Sign-in >60s is high. Drill down to Model → Device → Device History to isolate root cause

**Root Cause**: Network latency issues causing high RTT, or sign-in process bottlenecks causing high sign-in times

## Scenario 4: Intermittent timeout errors (TaskCanceledException) in Windo...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Check DFE and Service Health API performance. Query CloudPCEvent for TaskCanceledException messages. Review error trend with daily aggregation query to identify time-based patterns. Consider increasing timeout if issue persists.

**Root Cause**: Downstream service (DFE or Service Health API) degradation, large data volume for tenant, or network latency

## Scenario 5: Windows 10/11 Enterprise multi-session AVD VM gets downgrade...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Redeploy the VM. The underlying cause is a backend issue that should be resolved with updated WinPA agent. If persists, escalate to PG.

**Root Cause**: Scenario 2: Issue in Azure backend system (e.g., due to old WinPA agent) causes OS downgrade during initial deployment phase.

## Scenario 6: Excel shows incorrect/limited number of processors in Window...
> Source: ContentIdea | Applicable: ✅

### Troubleshooting Steps
- Add registry: HKLM\SOFTWARE\Microsoft\Office\Common, DWORD IdealConcurrencyValueOverride=0.

**Root Cause**: In certain VMs Excel is forced to use limited processors to preserve other apps performance.

## Scenario 7: Recurring crashed of Azure VM's has been reported&nbsp;and i...
> Source: ContentIdea | Applicable: ✅

### Troubleshooting Steps
- 1.Enabling AN to avoid mismatch in configuration which can lead to OS instability or crashes:     2.Update driver version but keeping in mind below:   3.The latest driver can be downloaded from the following source: WinOF-2 / WinOF Drivers  4.If there is persistent incompatibility or driver-level instability, escalate to EEE Cloudnet via ICM

**Root Cause**: After engaging the Azure team, we noted that the driver is linked to the Accelerated Networking:    Note on Accelerated Networking: The Mellanox/Accelerated Networking driver is a virtual network device optimized specifically for the virtualized environment rather than emulating a physical network adapter. Instead of pretending to be a real hardware network card, the virtual device �knows� it�s running inside a virtual machine and can more directly interact with the hypervisor. This more direct interaction typically results in greater efficiency and better performance, such as lower overhead and reduced latency compared to emulated network adapters. However, due to this interaction, it is important that the OS-level driver is up to date to maintain optimal performance and stability of the Guest OS.   -Analyzing the client's configuration, we observed the AN is disabled:      -But&nbsp;from another view (DRI dashboard) it looks like as enabled:      We received the following information from Azure PG:  This VM size&nbsp;Standard (Edsv5)&nbsp;actually requires Accelerated Networking so we were observing behavior by design.&nbsp;There are pending documentation updates for&nbsp;https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/memory-optimized/edsv5-series?tabs=sizebasic&nbsp; to clarify that AN is required.  There are plans to change the Portal/API to not allow the customer to disable AN on these SKUs (Stock Keeping Unit).  The VM family EDSv5-series is placed on hardware clusters where accelerated networking functionality cannot be fully toggled off at the host level. Disabling Accelerated Networking from the portal/CLI/Powershell will update the VM schema, but the actual cluster serving this workload is Overlake/Accelerated Networking powered.  Customers may report that accelerated networking has been disabled through the Azure portal, Azure CLI, or PowerShell. We see that Accelerated Networking is visible as disabled on the Azure Portal/VM schema/on ASC. However, within the guest operating system, accelerated networking still appears as enabled, and the Mellanox driver is active and used for the VM NIC interface.

## Scenario 8: Azure systems fail to boot with a 0x1E KMODE_EXCEPTION_NOT_H...
> Source: ContentIdea | Applicable: ✅

### Troubleshooting Steps
- Change registry value to allow system to boot so current patch levels can be applied: 1. Attach the broken VM OS disk to a recovery VM. 2. Load the system registry hive using regedit. 3. Change FeatureSettingsOverride from 8 to 3 under HKLMSYSTEMCurrentControlSetControlSession ManagerMemory ManagementFeatureSettingOverride. 4. Conduct a disk swap and apply latest patches.

**Root Cause**: Spectre/Meltdown mitigation related issue that is mitigated in current kernel patch versions (July 2018 and newer).

## Scenario 9: Wide screen monitor showing erratic or low frame rate feedba...
> Source: ADO Wiki | Applicable: ❓

### Troubleshooting Steps
- Increase RDP frame rate cap to 60fps via registry change (see https://learn.microsoft.com/en-us/troubleshoot/windows-server/remote/frame-rate-limited-to-30-fps). For Nvidia GPU users, enable 'Image Scaling' in GeForce Experience to force per-frame post-processing.

**Root Cause**: RDP protocol uses dynamic framerate capped at 30fps by default. Static screen content does not trigger redraws, causing overlays to report 0 FPS.
