# VM 串行控制台 — 排查速查

**来源数**: 3 (AW, ML, ON) | **条目**: 22 | **21V**: 20/22
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Windows VM stuck with "Error C01A001D applying update operations" after June 2021 patch, Event 7023  | CLFS transaction log creation fails. Base container file (txr\*.TxR.blf) has SE_ | Offline: (1) dism.exe /image:<drive>:\ /cleanup-image /revertpendingactions. (2) | 🔵 7.5 | AW |
| 2 | Black screen on both VM console screenshot and RDP session; Desktop Window Manager (dwm.exe) crashes | OS file corruption affecting the GUI subsystem, specifically dwm.exe; related to | Apply KB3137061 fix. For file corruption, run SFC /scannow and DISM /online /cle | 🔵 7.5 | AW |
| 3 | No console output after Starting Switch Root when repairing Linux VM via nested Hyper-V | Hyper-V Gen2 VM has no COM port enabled; serial console output not displayed | Enable COM1 in Hyper-V settings (pipe name = VM name). Access via hvc.exe serial | 🔵 7 | ON |
| 4 | VMCU (VMware Cloud Universal) customer contacts Azure support for a technical issue with Azure VMwar | VMCU is a transactional licensing/credit program between VMware and customers, n | No technical support scope for VMCU program questions. Direct customer to open a | 🔵 6.5 | AW |
| 5 | ACIS operations (serial console logs, VM screenshot, InspectIaaS Disk, Brooklyn diagnostics) unavail | Azure Government requires JIT (Just-in-Time) access for ACIS operations due to c | 1) Create IcM using POD-specific template (e.g., http://aka.ms/vmaacisjit for VM | 🔵 6.5 | AW |
| 6 | Gallery Image Version fails with Conflict: IsAcceleratedNetworkSupported property mismatch between s | Source VM OS disk does not have AcceleratedNetwork capability enabled, but Image | Enable accelerated networking on source disk: az disk update -n <diskName> --res | 🔵 6.5 | AW |
| 7 | APIPA address 169.254.x.x. DHCP Client service disabled. | DHCP Client service disabled/broken. | sc config dhcp start=auto; net start dhcp via Serial Console. | 🔵 6.5 | AW |
| 8 | Black screen after RDP credentials on Windows Server 2012 R2; VM in partial hang state; apps (e.g.,  | Deadlock in WinHttpAutoProxySvc: when this service is disabled and the system is | Enable the WinHttpAutoProxySvc service (set to Manual or Automatic). Apply lates | 🔵 6.5 | AW |
| 9 | Azure Windows VM fails to boot with stop error 0xC0000102 STATUS_FILE_CORRUPT. | Corrupt file or disk structure has become corrupt and unreadable. | VM repair commands to create repair VM. chkdsk /F. Replace corrupt binary from W | 🔵 6.5 | ML |
| 10 | Azure Windows VM shutdown is stuck on Restarting, Shutting Down, or Stopping services screen. Boot d | Windows shutdown process is performing system maintenance (updates, role/feature | 1. Use Serial Console to identify stuck service with Get-Service / Where-Object  | 🔵 6.5 | ML |
| 11 | Boot Diagnostics in Azure portal shows error: 'Failed to get contents of the log' when viewing VM sc | Multiple causes: (1) Windows Server 2008 R2 or earlier does not produce VM Healt | (1) Upgrade OS to newer version. (2) Update VM Guest Agent to version 2.7.1198.8 | 🔵 6.5 | ML |
| 12 | VM stuck at Windows Boot Manager menu: Choose an operating system to start, or press TAB to select a | BCD flag displaybootmenu is enabled, causing Boot Manager to wait for user input | Via Serial Console: bcdedit /set {bootmgr} timeout 5 or bcdedit /deletevalue {bo | 🔵 5.5 | ML |
| 13 | Azure Serial Console: Pressing Enter after connection banner does not show sign-in prompt. No SAC pr | Custom VM, hardened appliance, or incorrect boot config causing Windows to fail  | For older/custom images, enable EMS manually: bcdedit /ems {current} on && bcded | 🔵 5.5 | ML |
| 14 | Azure Serial Console: Only health information shown when connecting to Windows VM. SAC prompt does n | Special Administration Console (SAC) has not been enabled for the Windows image. | Enable SAC manually via RDP: bcdedit /ems {current} on && bcdedit /emssettings E | 🔵 5.5 | ML |
| 15 | Azure Serial Console: Unable to type at SAC prompt when kernel debugging is enabled on Windows VM. | Kernel debugging conflicts with Serial Console SAC prompt input. | RDP to VM and run: bcdedit /debug {current} off. If cannot RDP, attach OS disk t | 🔵 5.5 | ML |
| 16 | Azure Serial Console: Pasting into PowerShell in SAC results in extra/third character when original  | Known issue with PSReadLine module running in PowerShell session within SAC. | Run Remove-Module PSReadLine to unload PSReadLine from the current session. | 🔵 5.5 | ML |
| 17 | Azure Serial Console: Forbidden response when accessing VM boot diagnostic storage account. Serial C | Custom boot diagnostics storage account has firewall restrictions enabled. Seria | Add Serial Console service IPs as firewall exclusions based on VM geography (use | 🔵 5.5 | ML |
| 18 | Azure Serial Console: Bad Request (400) error when connecting to VM. | Boot diagnostics URI is incorrect, e.g., using http:// instead of https://. | Fix boot diagnostics URI: az vm boot-diagnostics enable --name vmName --resource | 🔵 5.5 | ML |
| 19 | Azure Serial Console: Web socket is closed or could not be opened error. | Firewall or network policy blocking outbound access to *.serialconsole.azure.com | Add *.serialconsole.azure.com to firewall allow list. For US Gov cloud, use *.se | 🔵 5.5 | ML |
| 20 | Azure Serial Console does not work with storage account using Azure Data Lake Storage Gen2 with hier | Serial Console is incompatible with ADLS Gen2 hierarchical namespace storage acc | Create a separate boot diagnostics storage account without ADLS Gen2/hierarchica | 🔵 5.5 | ML |
| 21 | Azure Serial Console connects but no output displayed and user input unresponsive after live migrati | Serial Console and logs become unavailable after live migration for Gen2 VMs wit | Perform a guest OS restart to restore Serial Console functionality. | 🔵 5.5 | ML |
| 22 | Azure Serial Console error: Another connection is currently in progress to this VM. | Another user has Serial Console open, or a stale connection exists. | If no other user has Serial Console open, try disabling and re-enabling boot dia | 🔵 5.5 | ML |

## 快速排查路径

1. **Windows VM stuck with "Error C01A001D applying update operations" after June 202**
   - 根因: CLFS transaction log creation fails. Base container file (txr\*.TxR.blf) has SE_SACL_PROTECTED flag, system account lack
   - 方案: Offline: (1) dism.exe /image:<drive>:\ /cleanup-image /revertpendingactions. (2) Load SYSTEM hive, check active ControlSet. (3) reg add HKLM\brokenSYS
   - `[🔵 7.5 | AW]`

2. **Black screen on both VM console screenshot and RDP session; Desktop Window Manag**
   - 根因: OS file corruption affecting the GUI subsystem, specifically dwm.exe; related to Azure VM data corruption issue document
   - 方案: Apply KB3137061 fix. For file corruption, run SFC /scannow and DISM /online /cleanup-image /restorehealth to repair. Check CBS logs for specific corru
   - `[🔵 7.5 | AW]`

3. **No console output after Starting Switch Root when repairing Linux VM via nested **
   - 根因: Hyper-V Gen2 VM has no COM port enabled; serial console output not displayed
   - 方案: Enable COM1 in Hyper-V settings (pipe name = VM name). Access via hvc.exe serial VMNAME or PuTTY serial to named pipe.
   - `[🔵 7 | ON]`

4. **VMCU (VMware Cloud Universal) customer contacts Azure support for a technical is**
   - 根因: VMCU is a transactional licensing/credit program between VMware and customers, not a technical Azure feature; VMCU custo
   - 方案: No technical support scope for VMCU program questions. Direct customer to open a Billing support ticket via Azure Portal (https://portal.azure.com/#vi
   - `[🔵 6.5 | AW]`

5. **ACIS operations (serial console logs, VM screenshot, InspectIaaS Disk, Brooklyn **
   - 根因: Azure Government requires JIT (Just-in-Time) access for ACIS operations due to compliance requirements; persistent acces
   - 方案: 1) Create IcM using POD-specific template (e.g., http://aka.ms/vmaacisjit for VM Availability POD). 2) Submit JIT request at https://jitaccess-validat
   - `[🔵 6.5 | AW]`

