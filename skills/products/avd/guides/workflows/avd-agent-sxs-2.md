# AVD Agent 与 SxS Stack (Part 2) — 排查工作流

**来源草稿**: ado-wiki-a-agent-cant-talk-to-broker.md, ado-wiki-a-geneva-monitoring-agent.md, ado-wiki-a-sxs-stack-manual-reinstall.md, ado-wiki-b-agent-upgrade-failure-check.md, ado-wiki-b-avd-listener-check.md, ado-wiki-b-geneva-monitoring-agent-check.md, ado-wiki-b-reinstall-avd-applications.md, ado-wiki-geneva-agent-troubleshooter.md
**Kusto 引用**: heartbeat.md, session-host.md
**场景数**: 28
**生成日期**: 2026-04-07

---

## Scenario 1: Step 1: Collect MSRD-Collect
> 来源: ado-wiki-a-agent-cant-talk-to-broker.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Run MSRD-Collect diagnostic tool on the session host.

## Scenario 2: Step 3: Check Proxy Configuration
> 来源: ado-wiki-a-agent-cant-talk-to-broker.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Review `_Proxy.txt` from MSRD-Collect output
   - If VM goes through proxy:
   - Confirm all WVD URLs are whitelisted
   - SSL inspection must be turned off for all WVD URLs
   - Ask customer to remove proxy temporarily to test
   - If help needed with proxy config, send collab to on-prem Networking

## Scenario 3: Step 4: Check NVA (Network Virtual Appliance)
> 来源: ado-wiki-a-agent-cant-talk-to-broker.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Ask customer if VM routes through NVA
   - If yes:
   - Confirm all WVD URLs are whitelisted
   - SSL inspection must be turned off for all WVD URLs
   - If help needed with NVA config, send collab to ANP

## Scenario 4: Step 5: Confirm TLS 1.2 and Supported Ciphers
> 来源: ado-wiki-a-agent-cant-talk-to-broker.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Verify TLS 1.2 is enabled on the VM
   - Verify supported ciphers are enabled

## Scenario 5: RDOperation (Broker Connection Failures)
> 来源: ado-wiki-a-agent-cant-talk-to-broker.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
cluster("rdsprod.eastus2").database("WVD").RDOperation
| union cluster("rdsprodus.eastus2").database("WVD").RDOperation
| union cluster("rdsprodeu.westeurope").database("WVD").RDOperation
| where HostInstance == "<VM NAME>"
| where Name contains "broker"
| where PreciseTimeStamp >= ago(1d)
| where ResType != "Success"
| project PreciseTimeStamp, ActivityId, HostInstance, Role, Name, ResType, ResSignature, ResDesc
```
`[来源: ado-wiki-a-agent-cant-talk-to-broker.md]`

## Scenario 6: RDInfraTrace (WebSocket Errors)
> 来源: ado-wiki-a-agent-cant-talk-to-broker.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
cluster("rdsprod.eastus2").database("WVD").RDInfraTrace
| union cluster("rdsprodus.eastus2").database("WVD").RDInfraTrace
| union cluster("rdsprodeu.westeurope").database("WVD").RDInfraTrace
| where HostInstance == "<VM NAME>"
| where PreciseTimeStamp >= ago(1d)
| where Role == "RDAgent" and Msg contains "System.Net.Websockets"
| project PreciseTimeStamp, ActivityId, Level, Category, Role, HostInstance, Msg
```
`[来源: ado-wiki-a-agent-cant-talk-to-broker.md]`

## Scenario 7: Browser Tests (On Session Host VM)
> 来源: ado-wiki-a-agent-cant-talk-to-broker.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Open registry: `HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\RDInfraAgent`
2. Note values of `BrokerURI` and `BrokerURLGlobal`
3. Open browser and navigate to:
   - `https://<BrokerURI>/api/health`
   - `https://<BrokerURIGlobal>/api/health`
4. Both pages should load successfully
5. If network is blocking, pages will not load
> **Note**: WVD-Agent event 3701 can be misleading. Agent only reports URL as inaccessible when DNS resolution fails. Agent does a plain HTTP connect; if successful, it reports accessible. This does not prove the VM can successfully talk to WVD service.

## Scenario 8: Geneva Monitoring Agent Check
> 来源: ado-wiki-a-geneva-monitoring-agent.md | 适用: \u901a\u7528 \u2705

### 排查步骤
=============================
The Geneva Monitoring platform enables services to do Monitoring, Diagnostics and Analytics at scale. It is designed to support the requirements of services built on Azure, AutoPilot, Pilotfish or GFS/Baremetal environments. Geneva is a compliant offering (Azure and Office365) and available in all national clouds. It natively integrates with IcM, ExpressV2 for deployments, Azure Watson for compliant dump collection, Geneva Actions for compliant live site management amongst others.
Geneva maximizes the availability and performance of applications and services with a comprehensive solution for collecting, analyzing, and acting on telemetry across your cloud and on-premises environments. Large parts of the Geneva infrastructure (e.g. Agents, Metrics, Health System, Pipeline) are utilized to power Microsoft external monitoring offering - Azure Monitor.
Detailed documentation can be located[here](http://aka.ms/GenevaDocs).
Geneva Monitoring Agent
-----------------------
   * * *
Process that collects data from a node (session host and/or VM) and pushes that data to the Geneva pipeline.
More details[here](http://aka.ms/Geneva/Agent)

## Scenario 9: Scenarios:
> 来源: ado-wiki-a-geneva-monitoring-agent.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Health Check
------------
   * * *
RD Infra agent running at session host (VM) is executing periodic check for_health_of said Geneva monitoring agent. Check is non-intrusive and relies heavily on stored settings to recognize what should be running and how to perform and attempt automatic recovery in some cases. Health check only reports that customer's machine**needs assistance**when unable to retrieve information confirming health of monitoring agent.
One of possible recognition is based on event raised by check itself.
![image.png](/.attachments/image-f63bc741-b7f0-4a3b-bea3-63cbef147e2e.png)
1.Verify Monitoring agent is installed.
   *   Go to`C:\Program Files\Microsoft RDInfra`and verify agent was installed successfully and that folder**RDMonitoringAgent...**exists.
![image.png](/.attachments/image-fa6d9ec0-5995-4d84-a78b-5233c0b6faed.png)
2.Verify Monitoring agent environment variables exist.
   *   Open elevated command prompt and enter command:**set MON**
![image.png](/.attachments/image-0f48f538-e383-4cdd-ad8f-3965fffd5b13.png)
3.Verify Monitoring agent scheduled task is running.
   *   Open Task Scheduler and check root for task presence.
![image.png](/.attachments/image-52e5b57e-1bd2-42dd-be3e-925b94b67f9c.png)

## Scenario 10: NOTE
> 来源: ado-wiki-a-geneva-monitoring-agent.md | 适用: \u901a\u7528 \u2705

### 排查步骤
More tasks with name starting Geneva may exists.
One task**`MUST`**be enabled and running!
If the scheduled task status is stuck in "starting" there is something on the computer that is preventing the scheduled task from starting under SYSTEM account at startup. This is not AVD issue and needs to be fixed by CSS.

## Scenario 11: Mitigations
> 来源: ado-wiki-a-geneva-monitoring-agent.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. ### Mitigate by forcing certificate refresh
   * * *
In rare cases, WVD agent may fail to ensure valid certificate is present for Geneva agent to authenticate against its platform, leading to its failure to start. WVD attempts to refresh certificate after RD Infra Agent restart, then 20 minutes later and then finally every 12 hours for a remainder of WVD agent execution.
In all cases, to forcefully refresh expired certificate, do the following:
1. Start -> Run -> certlm.msc -> Expand Personal and select Certificates
1. Delete all certificates**when no valid certificate**issued to RDSAgent.WVD exists.
![image.png](/.attachments/image-326ba004-4b47-45e4-b3c1-67ebc77ea08c.png)
2. 1.  **`*This* mitigation is not needed with valid certificate existance!`**
2. 1.  Restart RD Agent Bootloader service.
1. net stop rdagentboolader
2. net start rdagentbootloader
2. Wait up to 30 minutes for new cert to be downloaded and installed.
2. ### Mitigate by starting scheduled task
   * * *
In rare cases, WVD agent may fail to ensure that scheduled task responsible for monitoring agent execution lifetime management is started/running. WVD attempts to start this task right after RD Infra Agent restarts in case it was not running.
In all cases, to ensure task execution, do the following:
1. Start -> Run -> taskschd.msc
1. Ensure**_one_enabled**task exists and start it when not running already.
2. If no`Geneva...`task is present, or if all tasks with`Geneva..`name are disabled, follow these[steps](https://eng.ms/docs/experiences-devices/wd-windows/wcx/avd/azure-virtual-desktop/internal-documentation/documentation/sessionhost/healthchecks/monitoringagentcheck#mitigate-by-reinstalling-monitoring-agent)to reinstall monitoring agent manually.
2. Wait up couple minutes and refresh`Task Scheduler`view ensuring task remains running.
![image.png](/.attachments/image-d6d7831b-4821-4323-979f-493883b8a416.png)
3. ### Mitigate by reinstalling monitoring agent
   * * *
In rear cases, when no other mitigations worked, reinstall manually is an option. RD Infra Agent attempts to keep monitoring running and up to date each time it starts, but in case it fails, following are steps to take in order to reinstal.
1. Verify Monitoring Agent MSI is present
   *   Go to`C:\Program Files\Microsoft RDInfra`and verify agent installation file is present (Microsoft.RDInfra.Geneva.Installer-x64...)
![image.png](/.attachments/image-315e953b-a390-4aef-addf-eff02925e832.png)
2. Run following command
msiexec /fa "C:\Program Files\Microsoft RDInfra\Microsoft.RDInfra.Geneva.Installer-x64-44.3.1.msi" /quiet /qn /norestart /l*+! "C:\Program Files\Microsoft RDInfra\ManualGeneva.txt"
3. Inspect ManualGeneva.txt for installation succeess
4. Inspect Task Scheduler for task state (and start if not running)
![image.png](/.attachments/image-f795d78b-f40a-451e-ae2a-0c5c62d14a56.png)
Engineering documentation link:
[Windows Virtual Desktop Session Host Geneva Monitoring Agent Check | Windows Virtual Desktop Internal Documents](https://eng.ms/docs/experiences-devices/wd-windows/wcx/avd/azure-virtual-desktop/internal-documentation/documentation/sessionhost/healthchecks/monitoringagentcheck)

## Scenario 12: SxS Stack Manual Reinstall Guide
> 来源: ado-wiki-a-sxs-stack-manual-reinstall.md | 适用: \u901a\u7528 \u2705

### 排查步骤
> **Use this ONLY as a last resort**, if every other troubleshooting attempt failed. Discuss with an SME before proceeding.

## Scenario 13: Prerequisites
> 来源: ado-wiki-a-sxs-stack-manual-reinstall.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Check if DisableRegistryTools is blocking installation first (see known issue avd-ado-wiki-a-r5-004)
   - See also: [Remove DisableRegistryTools](https://learn.microsoft.com/en-us/azure/virtual-desktop/troubleshoot-agent#remove-disableregistrytools)

## Scenario 14: Manual Reinstall Steps
> 来源: ado-wiki-a-sxs-stack-manual-reinstall.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Sign in to your session host VM as an administrator.
2. From an elevated PowerShell prompt run `qwinsta.exe` and make note of the version number next to `rdp-sxs` in the SESSIONNAME column.
   - If the STATE column for rdp-tcp and rdp-sxs entries is not `Listen`, or they are not listed at all, there is a stack issue.
3. Stop the RDAgentBootLoader service:
```powershell
   Stop-Service RDAgentBootLoader
```
4. Go to **Control Panel > Programs > Programs and Features** (or Settings App > Apps on Windows 11).
5. Uninstall the latest version of **Remote Desktop Services SxS Network Stack** or the version listed in Registry Editor at:
`HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations` under `ReverseConnectionListener`
6. Get the latest SxS Stack installer and install:
```powershell
   $sxsMsi = (Get-ChildItem "$env:SystemDrive\Program Files\Microsoft RDInfra\" | ? Name -like SxSStack*.msi | Sort-Object CreationTime -Descending | Select-Object -First 1).FullName
   $sxsMsi
   msiexec /i $sxsMsi
```
7. **Restart** the session host VM.
8. Run `qwinsta.exe` again and verify the STATE column for rdp-tcp and rdp-sxs entries is `Listen`.
9. If not listening, [re-register VM and reinstall agent component](https://learn.microsoft.com/en-us/azure/virtual-desktop/troubleshoot-agent#your-issue-isnt-listed-here-or-wasnt-resolved).

## Scenario 15: MSRD-Collect
> 来源: ado-wiki-b-agent-upgrade-failure-check.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Review Agent install log
   - Review RDAgentBootLoader events in Application Log for errors

## Scenario 16: Agent Version Timeline
> 来源: ado-wiki-b-agent-upgrade-failure-check.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
//Agent Version
cluster("rdsprod.eastus2").database("WVD").DiagActivity
| union cluster("rdsprodus.eastus2").database("WVD").DiagActivity
| union cluster("rdsprodeu.westeurope").database("WVD").DiagActivity
| where SessionHostName has "vm name"
| where env_time >= ago(5d)
| project env_time, Id, ActRing, SessionHostName, AgentVersion, AgentSxsStackVersion
```
`[来源: ado-wiki-b-agent-upgrade-failure-check.md]`

## Scenario 17: Agent Upgrade Trace
> 来源: ado-wiki-b-agent-upgrade-failure-check.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Use the time frame when agent was upgraded to see trace and find out what happened:
```kql
//Agent Upgrade
cluster("rdsprod.eastus2").database("WVD").RDInfraTrace
| union cluster("rdsprodus.eastus2").database("WVD").RDInfraTrace
| union cluster("rdsprodeu.westeurope").database("WVD").RDInfraTrace
| where HostInstance == "wvd vm"
| where TIMESTAMP >= datetime(start time frame) and TIMESTAMP <= datetime(end time frame)
| where Category == "RDAgent.AgentUpdaterService.AgentBackgroundUpdater"
    or Category == "Microsoft.RDInfra.AgentUpdateTelemetry.Impl.AgentUpdateTelemetryImpl"
    or Category == "Microsoft.RDInfra.RDAgent.Service.AgentDownloadHdlrImpl"
    or Category == "Microsoft.RDInfra.RDAgent.Service.RDAgentUpdateHandler"
    or Category == "Microsoft.RDInfra.RDAgent.Service.AgentUpdateStateImpl"
    or Category == "Microsoft.RDInfra.RDAgent.Service.AgentInstallImpl"
| project TIMESTAMP, ActivityId, Role, Category, HostInstance, Msg
```
`[来源: ado-wiki-b-agent-upgrade-failure-check.md]`

## Scenario 18: Upgrade Fails with "Method not found" in Event log
> 来源: ado-wiki-b-agent-upgrade-failure-check.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - **Summary**: WVD Agent failed to upgrade/install newer versions. MSI logs shows agent installed successfully but Application event log throws "Method not found" exception, agent resets to old version.
   - **Cause**: Missing method exceptions related to .NET Framework incompatibility. Session host has .NET 4.7 instead of required 4.7.2+.
   - **Resolution**: [Upgrade .NET to version 4.7.2 or greater](https://support.microsoft.com/en-us/help/4054530/microsoft-net-framework-4-7-2-offline-installer-for-windows)

## Scenario 19: Determine if WVD listener and RDP listener is working on local computer
> 来源: ado-wiki-b-avd-listener-check.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Open command prompt as administrator and enter command: `qwinsta`
   - If you see rdp-sxs the WVD listener is working
   - If you see rdp-tcp the RDP listener is working

## Scenario 20: Determine if WVD listener and RDP listener is working on remote computer
> 来源: ado-wiki-b-avd-listener-check.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Open PowerShell as administrator and enter commands
```
   Enter-PSSession -ComputerName <computer name>
```
   - If you see rdp-sxs listened the RDP listener is working
   - If you see rdp-tcp the RDP listener is working

## Scenario 21: Windows 10 1809, 1903, or 1909
> 来源: ado-wiki-b-avd-listener-check.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Go to Program and Features and verify following are installed. You may see multiple instances.
   - Remote Desktop Agent Boot Loader
   - Remote Desktop Services Infrastructure Agent
   - Remote Desktop Services Infrastructure Geneva Agent
   - Remote Desktop Services SxS Network stack

## Scenario 22: Windows 10 2004+
> 来源: ado-wiki-b-avd-listener-check.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Verify fReverseConnectMode is set to 1
   - Login to VM -> open registry and navigate to `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations\rdp-sxs`
   - Verify fReverseConnectMode is set to 1
   - If set to 0 change to 1 and reboot VM
   - Go to Program and Features and verify following are installed. You may see multiple instances.
   - Remote Desktop Agent Boot Loader
   - Remote Desktop Services Infrastructure Agent
   - Remote Desktop Services Infrastructure Geneva Agent
   - Note: Starting in Windows 10 2004 WVD stack is built into OS so don't need to install SxS network stack.
   - If WVD applications are missing see: Reinstalling WVD Agent Applications

## Scenario 23: <div id='cssfeedback-start'></div>
> 来源: ado-wiki-b-geneva-monitoring-agent-check.md | 适用: \u901a\u7528 \u2705

### 排查步骤
<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8b502565&URL=https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/467896&Instance=467896&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8b502565&URL=https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/467896&Instance=467896&Feedback=2)
___
<div id='cssfeedback-end'></div>
|Contributors|
|--|
| [Josh Bender](mailto:jobende@microsoft.com) ; [Robert Klemencz](mailto:robert.klemencz@microsoft.com) |
---
See [Geneva Monitoring Agent Check](https://eng.ms/docs/cloud-ai-platform/azure/aep-platform/sigma/sigma-remote-desktop-azure-virtual-desktop/internal-documentation/documentation/sessionhost/healthchecks/monitoringagentcheck) for possible troubleshooting steps.
---
When troubleshooting issues related to the Geneva Agent connectivity (e.g. URLs unreachable or high traffic), usually the following data collection from the affected VM can be helpful:
   - Network traces while reproducing the issue
   - See: [Network Trace - Overview](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/470842/Network-Trace)
   - Geneva Agent Troubleshooter logs
   - See: [Using the Windows Agent Troubleshooter | Geneva Monitoring](https://eng.ms/docs/products/geneva/collect/troubleshoot/troubleshooter)
   - Most of the data collected by this tool is already included in MSRD-Collect but not everything _(there's work in progress to merge them if possible)_
   - MSRD-Collect ("AVD Target" or "W365 Target", depending on the context)
   - See: [Data collection for Session Connectivity issues (not Logon or User Profile related) - Overview](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/2278889/Data-collection-for-Session-Connectivity-issues-(not-Logon-or-User-Profile-related))
---
When dealing with "high traffic" topics, make sure to clarify first if the traffic is measured per VM or per host pool or per "entire AVD", as a host pool or the "entire AVD" environment of a customer may contain hundreds of VMs. Each VM may generate just a small amount of monitoring traffic, which can be expected, but if you sum up all VMs, the total may become large.
If just one single VM is generating a large amount of traffic to the Geneva endpoints, that may require an IcM, but validate it first with an AVD SME. For reference, see: [Incident-692557619 Details - IcM](https://portal.microsofticm.com/imp/v5/incidents/details/692557619/summary)
---
content checked: 20251121

## Scenario 24: [[_TOC_]]
> 来源: ado-wiki-b-reinstall-avd-applications.md | 适用: \u901a\u7528 \u2705

### 排查步骤
<table style="margin-left:.34in">
<tr style="background:#ffeeff;color:black">
<td>
<p>&#8505; <b>Note</b></p>
Use this ONLY as a last resort, if every other troubleshooting attempt failed. Discuss with an SME before proceeding with reinstalling the AVD Agents if you are unsure.</td>
</tr>
</table>

## Scenario 25: AVD Classic
> 来源: ado-wiki-b-reinstall-avd-applications.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Login to VM with administrator account
1. Go to Program and Features and remove following. You may see multiple instances, remove all of them
   - Remote Desktop Agent Boot Loader
   - Remote Desktop Services Infrastructure Agent
   - Remote Desktop Services Infrastructure Geneva Agent
   - Remote Desktop Services SxS Network stack
![image.png](/.attachments/image-a15ed91d-6418-490d-9bac-410c36ec7c57.png)
1. Login to AVD PowerShell and remove the RDSH from host pool
```
   Remove-RdsSessionHost -TenantName <tenant name> -HostPoolName <host pool name> -Name <session host name> -Force
```
1. Export Registration Token
```
   Export-RdsRegistrationInfo -TenantName <tenant name> -HostPoolName <host pool name> | Select-Object -ExpandProperty Token > <path>
```
   - Note: If you get error "Export-RdsRegistrationInfo : RegistrationInfo does not exist for HostPoolName <host pool name>" that means you need to create new registration
![image.png](/.attachments/image-402b8956-42a5-4d18-be1f-f2bb00b915cb.png)
1. Create Registration Token:
```
   New-RdsRegistrationInfo -TenantName tenant name> -HostPoolName <host pool name> -ExpirationHours <token expiration in hours> | Select-Object -ExpandProperty Token > 
   <path>
```
1. On VM go to [Agent download page](https://learn.microsoft.com/en-us/azure/virtual-desktop/virtual-desktop-fall-2019/create-host-pools-powershell-2019#register-the-virtual-machines-to-the-azure-virtual-desktop-host-pool) and download Azure Virtual Desktop Agent and Azure Virtual Desktop Agent Bootloader.
1. Install the Azure Virtual Desktop Agent.
   - Right-click the downloaded installer, select Properties, select Unblock, then select OK. This will allow your system to trust the installer.
   - Run the installer. When the installer asks you for the registration token, enter the value you got from the Export-RdsRegistrationInfo or New-RdsRegistrationInfo cmdlet.
![image.png](/.attachments/image-0bdaf85c-f3e8-465d-b74d-6d6f59f83c50.png)
1. Install the Azure Virtual Desktop Agent Bootloader
   - Right-click the downloaded installer, select Properties, select Unblock, then select OK. This will allow your system to trust the installer.
   - Run the installer.
1. Verify computer was registered in host pool by running command
```
   Get-RdsSessionHost -TenantName <tenant name> -HostPoolName <host pool name>
```

## Scenario 26: AVD
> 来源: ado-wiki-b-reinstall-avd-applications.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Login to VM with administrator account
1. Go to Program and Features and remove following. You may see multiple instances, remove all of them
   - Remote Desktop Agent Boot Loader
   - Remote Desktop Services Infrastructure Agent
   - Remote Desktop Services Infrastructure Geneva Agent
   - Remote Desktop Services SxS Network stack
![image.png](/.attachments/image-a15ed91d-6418-490d-9bac-410c36ec7c57.png)
1. In Azure portal go to Host Pool VM is registered in -> Select Session Hosts
1. Click 3 dots next to Session Host to move -> select Remove
![image.png](/.attachments/image-4e265ad4-e8d1-44ef-aa2d-86e41bfbff7b.png)
1. Go to overview of hostpool -> click Registration key
![image.png](/.attachments/image-6ce00423-532d-4cb5-9c0d-ffc532b929ba.png)
1. Select Generate new key -> enter desired expiration date (if key already exists that hasn't expired use it)
![image.png](/.attachments/image-3561c85a-c8ee-4da4-b4e6-069dc6f88bb6.png)
1. Key will be generated -> copy to clipboard
![image.png](/.attachments/image-8460a7e0-2067-43d4-9115-5794de144d27.png)
1. On VM go to [Agent download page](https://learn.microsoft.com/en-us/azure/virtual-desktop/add-session-hosts-host-pool?tabs=portal%2Cgui#register-session-hosts-to-a-host-pool) and download Azure Virtual Desktop Agent and Azure Virtual Desktop Agent Bootloader.
1. Install the Azure Virtual Desktop Agent.
   - Right-click the downloaded installer, select Properties, select Unblock, then select OK. This will allow your system to trust the installer.
   - Run the installer. When the installer asks you for the registration token, enter the value you got from the Export-RdsRegistrationInfo or New-RdsRegistrationInfo cmdlet.
![image.png](/.attachments/image-0bdaf85c-f3e8-465d-b74d-6d6f59f83c50.png)
1. Install the Azure Virtual Desktop Agent Bootloader
   - Right-click the downloaded installer, select Properties, select Unblock, then select OK. This will allow your system to trust the installer.
   - Run the installer.
1. Verify computer was registered in host pool
   - In Azure portal should see session host registered in host pool with status available

## Scenario 27: 1. Access Geneva Agent Troubleshooter
> 来源: ado-wiki-geneva-agent-troubleshooter.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Download the Geneva Agent troubleshooting tool and extract the zip file:
https://aka.ms/ObservabilityAgents/troubleshooter

## Scenario 28: 2. Run the Troubleshooter
> 来源: ado-wiki-geneva-agent-troubleshooter.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Open PowerShell as an administrator and change the directory to the extracted file.
   - Run the command: `AgentTroubleshooter.exe --geneva`
   - The tool will show you the path of the folder it saved all the information to.

---

## 关联 Kusto 查询参考

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDInfraTrace
| where HostInstance has "{SessionHostName}"
| where PreciseTimeStamp > ago(8h)
| where Category contains "Heartbeat" or Msg contains "Heartbeat"
| where Category != "Microsoft.RDInfra.Diagnostics.DataSink.RestPipelineSink"
| project PreciseTimeStamp, Level, Category, Role, HostInstance, Msg
| order by PreciseTimeStamp desc
| take 100
```
`[来源: heartbeat.md]`

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDAgentMetadata
| where HostInstance has "{SessionHostName}"
| where TIMESTAMP >= ago(1d)
| summarize arg_max(TIMESTAMP, *) by HostInstance
| project TIMESTAMP, SubscriptionId, HostPool, HostInstance, 
          Location, OsType, Sku, VmSize, AzureResourceId
```
`[来源: session-host.md]`

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').DiagActivity
| where SessionHostName has "{SessionHostName}"
| where env_time >= ago(1d)
| where Type == "Connection"
| summarize 
    TotalConnections = count(),
    SuccessCount = countif(Outcome == "Success"),
    FailureCount = countif(Outcome == "Failure")
| extend SuccessRate = round(100.0 * SuccessCount / TotalConnections, 2)
```
`[来源: session-host.md]`
