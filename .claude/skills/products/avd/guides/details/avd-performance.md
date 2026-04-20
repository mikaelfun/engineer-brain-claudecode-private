# AVD AVD 性能 - Comprehensive Troubleshooting Guide

**Entries**: 9 | **Generated**: 2026-04-18

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: ADO Wiki, ContentIdea

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| Connection Quality (Performance) report in Intune missing RTT, availab... | By design - no RTT data is collected when the connection duration is l... | If connection > 2 min and data still missing, verify required endpoint... |
| Performance (Preview) blade in Intune showing partial data or no data ... | Required telemetry endpoints blocked or SSL inspected, Connected User ... | 1. Allow endpoints without SSL inspection: *.prod.warm.ingest.monitor.... |
| Endpoint Analytics - Remoting Connection Report shows high Round Trip ... | Network latency issues causing high RTT, or sign-in process bottleneck... | Use Endpoint Analytics Remoting Connection Report in MEM portal to ide... |
| Intermittent timeout errors (TaskCanceledException) in Windows 365 Adm... | Downstream service (DFE or Service Health API) degradation, large data... | Check DFE and Service Health API performance. Query CloudPCEvent for T... |
| Windows 10/11 Enterprise multi-session AVD VM gets downgraded to Profe... | Scenario 2: Issue in Azure backend system (e.g., due to old WinPA agen... | Redeploy the VM. The underlying cause is a backend issue that should b... |
| Excel shows incorrect/limited number of processors in Windows 10 Enter... | In certain VMs Excel is forced to use limited processors to preserve o... | Add registry: HKLM\SOFTWARE\Microsoft\Office\Common, DWORD IdealConcur... |
| Recurring crashed of Azure VM's has been reported&nbsp;and indicate th... | After engaging the Azure team, we noted that the driver is linked to t... | 1.Enabling AN to avoid mismatch in configuration which can lead to OS ... |
| Azure systems fail to boot with a 0x1E KMODE_EXCEPTION_NOT_HANDLED bug... | Spectre/Meltdown mitigation related issue that is mitigated in current... | Change registry value to allow system to boot so current patch levels ... |
| Wide screen monitor showing erratic or low frame rate feedback while u... | RDP protocol uses dynamic framerate capped at 30fps by default. Static... | Increase RDP frame rate cap to 60fps via registry change (see https://... |

### Phase 2: Detailed Investigation

#### Entry 1: Connection Quality (Performance) report in Intune missing RT...
> Source: ADO Wiki | ID: avd-ado-wiki-063 | Score: 8.0

**Symptom**: Connection Quality (Performance) report in Intune missing RTT, available bandwidth, and remote sign-in time details for some connections

**Root Cause**: By design - no RTT data is collected when the connection duration is less than 2 minutes

**Solution**: If connection > 2 min and data still missing, verify required endpoints are allowed without SSL inspection: *.prod.warm.ingest.monitor.core.windows.net, gcs.prod.monitoring.core.windows.net, *.events.data.microsoft.com, *.blob.core.windows.net, *.table.core.windows.net, *.servicebus.windows.net. Test reachability with Invoke-WebRequest and curl from the CPC.

> 21V Mooncake: Applicable

#### Entry 2: Performance (Preview) blade in Intune showing partial data o...
> Source: ADO Wiki | ID: avd-ado-wiki-064 | Score: 8.0

**Symptom**: Performance (Preview) blade in Intune showing partial data or no data for Windows 365 Cloud PCs

**Root Cause**: Required telemetry endpoints blocked or SSL inspected, Connected User Experience service not running, or devices not enrolled in Intune Endpoint Analytics

**Solution**: 1. Allow endpoints without SSL inspection: *.prod.warm.ingest.monitor.core.windows.net:443, gcs.prod.monitoring.core.windows.net:443, *.events.data.microsoft.com:443. 2. Verify Connected User Experience service is running. 3. Check WVD Events in Application.evtx for missing reporting endpoints. 4. Enroll devices in Intune Endpoint Analytics and create Windows Health Monitoring policy.

> 21V Mooncake: Applicable

#### Entry 3: Endpoint Analytics - Remoting Connection Report shows high R...
> Source: ADO Wiki | ID: avd-ado-wiki-215 | Score: 7.0

**Symptom**: Endpoint Analytics - Remoting Connection Report shows high Round Trip Time (>200ms) or high Cloud PC Sign in time (>60s)

**Root Cause**: Network latency issues causing high RTT, or sign-in process bottlenecks causing high sign-in times

**Solution**: Use Endpoint Analytics Remoting Connection Report in MEM portal to identify devices with above-average metrics. RTT >200ms is high. Sign-in >60s is high. Drill down to Model → Device → Device History to isolate root cause

> 21V Mooncake: Applicable

#### Entry 4: Intermittent timeout errors (TaskCanceledException) in Windo...
> Source: ADO Wiki | ID: avd-ado-wiki-232 | Score: 7.0

**Symptom**: Intermittent timeout errors (TaskCanceledException) in Windows 365 Admin Insights API

**Root Cause**: Downstream service (DFE or Service Health API) degradation, large data volume for tenant, or network latency

**Solution**: Check DFE and Service Health API performance. Query CloudPCEvent for TaskCanceledException messages. Review error trend with daily aggregation query to identify time-based patterns. Consider increasing timeout if issue persists.

> 21V Mooncake: Applicable

#### Entry 5: Windows 10/11 Enterprise multi-session AVD VM gets downgrade...
> Source: ADO Wiki | ID: avd-ado-wiki-a-r3-007 | Score: 7.0

**Symptom**: Windows 10/11 Enterprise multi-session AVD VM gets downgraded to Professional edition during initial deployment. OS loses multi-session capability right after provisioning.

**Root Cause**: Scenario 2: Issue in Azure backend system (e.g., due to old WinPA agent) causes OS downgrade during initial deployment phase.

**Solution**: Redeploy the VM. The underlying cause is a backend issue that should be resolved with updated WinPA agent. If persists, escalate to PG.

> 21V Mooncake: Applicable

#### Entry 6: Excel shows incorrect/limited number of processors in Window...
> Source: ContentIdea | ID: avd-contentidea-kb-032 | Score: 6.5

**Symptom**: Excel shows incorrect/limited number of processors in Windows 10 Enterprise Multi-session VM, causing slowness.

**Root Cause**: In certain VMs Excel is forced to use limited processors to preserve other apps performance.

**Solution**: Add registry: HKLM\SOFTWARE\Microsoft\Office\Common, DWORD IdealConcurrencyValueOverride=0.

> 21V Mooncake: Applicable

#### Entry 7: Recurring crashed of Azure VM's has been reported&nbsp;and i...
> Source: ContentIdea | ID: avd-contentidea-kb-097 | Score: 6.5

**Symptom**: Recurring crashed of Azure VM's has been reported&nbsp;and indicate the same pattern:     Debugging notes Dump Info============================================Kernel Version &nbsp; &nbsp; &nbsp;: Windows 10 Kernel Version 19041 MP (16 procs) Free x64Product &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; : Server, suite: TerminalServer MultiUserTSEdition build lab &nbsp; : 19041.1.amd64fre.vb_release.191206-1406Dump Time &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; : Sun Feb 16 07:02:06.536 2025 (UTC + 1:00)System Uptime &nbsp; &nbsp; &nbsp; : 6 days 6:36:12.314System Manufacturer : Microsoft CorporationSystem Product Name : Virtual MachineProcessor &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; : Intel(R) Xeon(R) Platinum 8370C CPU @ 2.80GHzBugcheck Info &nbsp; &nbsp; &nbsp; : Bugcheck d1 (80, 2, 0, fffff8017547d0d8)Dump Type &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; : Kernel Complete (Full address space is available)Build Revision &nbsp; &nbsp; &nbsp;: 19045.5247System Summary Hotfix InformationDRIVER_IRQL_NOT_LESS_OR_EQUAL (D1)Arg1: 80: Memory address referencedArg2: 2: IRQLArg3: 0: Read operationArg4: fffff8017547d0d8: Read by mlx5!mlx_eth::CTxQueue::FreeSendResources+0x1c2: kd&gt; kL&nbsp;# Call Site00 nt!KeBugCheckEx01 nt!KiBugCheckDispatch+0x6902 nt!KiPageFault+0x47803 mlx5!mlx_eth::CTxQueue::FreeSendResources+0x1c04 mlx5!mlx_eth::CTxQueue::FreeTcb+0x2005 mlx5!mlx_eth::CTxQueue::DoProcessTxCompletion+0x12a06 mlx5!mlx_eth::CTxQueue::ProcessTxCompletion+0x1a07 mlx5!mlx5_cq_completion+0xb108 mlx5!mlx5_eq_int+0x26509 NDIS!ndisMiniportDpc+0xd30a NDIS!ndisInterruptDpc+0x1970b nt!KiExecuteAllDpcs+0x30e0c nt!KiRetireDpcList+0x1f40d nt!KiIdleLoop+0x9e2: kd&gt; .trap ffff8b8e7703ecc0NOTE: The trap frame does not contain all registers.Some register values may be zeroed or incorrect.rax=0000000000000000 rbx=0000000000000000 rcx=ffff968f1aa49000rdx=0000000000000000 rsi=0000000000000000 rdi=0000000000000000rip=fffff8017547d0d8 rsp=ffff8b8e7703ee50 rbp=ffff8b8e7703ef79&nbsp;r8=ffff968f1c235001 &nbsp;r9=ffff968f1c23c680 r10=00000000000004f2r11=00000000000007ff r12=0000000000000000 r13=0000000000000000r14=0000000000000000 r15=0000000000000000iopl=0 &nbsp; &nbsp; &nbsp; &nbsp; nv up ei ng nz na po ncmlx5!mlx_eth::CTxQueue::FreeSendResources+0x1c://Below driver looks pretty old:2: kd&gt; lmvm mlx5 &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Browse full module list &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;start &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; end &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; module namefffff801`75420000 fffff801`755c4000 &nbsp; mlx5 &nbsp; &nbsp; # (private pdb symbols) &nbsp;c:\symbols\mlx5.pdb\E83BEA598FA84EE0A1C0353441FCBBA21\mlx5.pdb&nbsp; &nbsp; Loaded symbol image file: mlx5.sys&nbsp; &nbsp; Mapped memory image file: c:\symbols\mlx5.sys\5AEEBA601a4000\mlx5.sys&nbsp; &nbsp; Image path: \SystemRoot\System32\drivers\mlx5.sys&nbsp; &nbsp; Image name: mlx5.sys&nbsp; &nbsp; Browse all global symbols &nbsp;functions &nbsp;data &nbsp;Symbol Reload&nbsp; &nbsp; Timestamp: &nbsp; &nbsp; &nbsp; &nbsp;Sun May &nbsp;6 10:18:40 2018 (5AEEBA60) We asked the customer to update the driver; however, we received a reply that they did not install it separately and is included as part of Azure Marketplace image.

**Root Cause**: After engaging the Azure team, we noted that the driver is linked to the Accelerated Networking:    Note on Accelerated Networking: The Mellanox/Accelerated Networking driver is a virtual network device optimized specifically for the virtualized environment rather than emulating a physical network adapter. Instead of pretending to be a real hardware network card, the virtual device �knows� it�s running inside a virtual machine and can more directly interact with the hypervisor. This more direct interaction typically results in greater efficiency and better performance, such as lower overhead and reduced latency compared to emulated network adapters. However, due to this interaction, it is important that the OS-level driver is up to date to maintain optimal performance and stability of the Guest OS.   -Analyzing the client's configuration, we observed the AN is disabled:      -But&nbsp;from another view (DRI dashboard) it looks like as enabled:      We received the following information from Azure PG:  This VM size&nbsp;Standard (Edsv5)&nbsp;actually requires Accelerated Networking so we were observing behavior by design.&nbsp;There are pending documentation updates for&nbsp;https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/memory-optimized/edsv5-series?tabs=sizebasic&nbsp; to clarify that AN is required.  There are plans to change the Portal/API to not allow the customer to disable AN on these SKUs (Stock Keeping Unit).  The VM family EDSv5-series is placed on hardware clusters where accelerated networking functionality cannot be fully toggled off at the host level. Disabling Accelerated Networking from the portal/CLI/Powershell will update the VM schema, but the actual cluster serving this workload is Overlake/Accelerated Networking powered.  Customers may report that accelerated networking has been disabled through the Azure portal, Azure CLI, or PowerShell. We see that Accelerated Networking is visible as disabled on the Azure Portal/VM schema/on ASC. However, within the guest operating system, accelerated networking still appears as enabled, and the Mellanox driver is active and used for the VM NIC interface.

**Solution**: 1.Enabling AN to avoid mismatch in configuration which can lead to OS instability or crashes:     2.Update driver version but keeping in mind below:   3.The latest driver can be downloaded from the following source: WinOF-2 / WinOF Drivers  4.If there is persistent incompatibility or driver-level instability, escalate to EEE Cloudnet via ICM

> 21V Mooncake: Applicable

#### Entry 8: Azure systems fail to boot with a 0x1E KMODE_EXCEPTION_NOT_H...
> Source: ContentIdea | ID: avd-contentidea-kb-001 | Score: 6.5

**Symptom**: Azure systems fail to boot with a 0x1E KMODE_EXCEPTION_NOT_HANDLED bugcheck. The bugcheck is almost immediate after the system is turned on (<1 second). The first bugcheck parameter is 0xc0000096.

**Root Cause**: Spectre/Meltdown mitigation related issue that is mitigated in current kernel patch versions (July 2018 and newer).

**Solution**: Change registry value to allow system to boot so current patch levels can be applied: 1. Attach the broken VM OS disk to a recovery VM. 2. Load the system registry hive using regedit. 3. Change FeatureSettingsOverride from 8 to 3 under HKLMSYSTEMCurrentControlSetControlSession ManagerMemory ManagementFeatureSettingOverride. 4. Conduct a disk swap and apply latest patches.

> 21V Mooncake: Applicable

#### Entry 9: Wide screen monitor showing erratic or low frame rate feedba...
> Source: ADO Wiki | ID: avd-ado-wiki-a-r14-002 | Score: 6.0

**Symptom**: Wide screen monitor showing erratic or low frame rate feedback while using Windows 365 with Windows App. Gaming overlays (e.g. Nvidia GeForce Experience) detect very low FPS.

**Root Cause**: RDP protocol uses dynamic framerate capped at 30fps by default. Static screen content does not trigger redraws, causing overlays to report 0 FPS.

**Solution**: Increase RDP frame rate cap to 60fps via registry change (see https://learn.microsoft.com/en-us/troubleshoot/windows-server/remote/frame-rate-limited-to-30-fps). For Nvidia GPU users, enable 'Image Scaling' in GeForce Experience to force per-frame post-processing.

> 21V Mooncake: Not verified

### Phase 3: Kusto Diagnostics

> Refer to Kusto skill references for relevant queries.
