---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Microsoft Monitoring Agent (MMA) for Windows/Troubleshooting Guides/Troubleshooting MMA Extension Deployment"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FMicrosoft%20Monitoring%20Agent%20%28MMA%29%20for%20Windows%2FTroubleshooting%20Guides%2FTroubleshooting%20MMA%20Extension%20Deployment"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::
Applies To:
- Microsoft Monitoring Agent :- All versions when installed as Extension

[[_TOC_]]

****Note:** All IPs and machine names in this page are from test lab and don't compromise any Pii data.**

---
- [ ] Check status in portal
- [ ] Check status on VM
---
#**Check status in portal**
- 	Sign into the Azure portal - https://portal.azure.com/

- 	In the Azure portal, click Virtual Machines. 
- 	In your list of virtual machines, find your virtual machine and select it.
- 	On the virtual machine, click Extensions.

- 	From the list, check to see if the Log Analytics extension is enabled or not. If enabled the Windows Log Analytics Agent will appear with name **MMAExtension** and type **Microsoft.EnterpriseCloud.Monitoring.MicrosoftMonitoringAgent**. Note the value under the STATUS column. After a successful installation, the value should be Provisioning succeeded.

![image.png](/.attachments/image-5973782d-66b3-4100-b463-f826980b4994.png)

- 	Check if Heartbeat events are emitted by this VM.
If Heartbeat events are visible in Log Analytics log search that indicates that the extension is successfully installed. 
Involve portal team for further investigation regarding incorrect status being displayed in portal. 
Insert IcM information for portal team

#**Check status on VM**
If the extension is not showing status equal to Provisioning succeeded & Heartbeat events are not flowing, then proceed to troubleshoot on the virtual machine.

- RDP into the virtual machine.

- Note whether extension/agent processes are running by executing following powershell commands:

Get-WmiObject Win32_Process -Filter "name = 'MMAExtensionHeartbeatService.exe'" | Format-List ProcessName,Path

Get-WmiObject Win32_Process -Filter "name = 'HealthService.exe'" | Format-List ProcessName,Path

Get-WmiObject Win32_Process -Filter "name = 'MonitoringHost.exe'" | Format-List ProcessName,Path

Screenshot Example:
![image.png](/.attachments/image-00ca0217-2039-43aa-85de-04944c5cf0b7.png)

**It is important to note that the MMAExtensionHeartbeatService.exe is only expected to be running on a VM when MMA is installed as an extension.**

In the output for MMAExtensionHeartbeatService.exe make sure that the path corresponds to the version being installed.

- 	Note whether the extension installation directory exists:
 C:\Packages\Plugins\Microsoft.EnterpriseCloud.Monitoring.MicrosoftMonitoringAgent\[Extension version]

Absence of this directory indicates that the extension installation was not attempted by Guest Agent. Involve Guest Agent team for further investigation. IcM: AzureRT/GuestAgent

- 	If the directory is present:

     cd to that directory
     Open MMAExtensionInstall[PickLargestNumber].log

A successful install will look as follows:


``` 
11/22/2019 1:10:05 AM +00:00 Starting installation of agent install package at path C:\Packages\Plugins\Microsoft.EnterpriseCloud.Monitoring.MicrosoftMonitoringAgent\1.0.18018.0\MOMAgent.msi with log C:\WindowsAzure\Logs\Plugins\Microsoft.EnterpriseCloud.Monitoring.MicrosoftMonitoringAgent\1.0.18018.0\MMAExtensionInstall0-Setup0.log.
11/22/2019 1:11:42 AM +00:00 Windows installer reported success in installing agent.
11/22/2019 1:11:42 AM +00:00 Verified that service Microsoft Monitoring Agent is installed and in Running state.
11/22/2019 1:11:42 AM +00:00 Completed installing the Microsoft Monitoring Agent VM Extension.
```

A failed install will show the cause of installation failure.
If the failure is due to windows installer issues, look in the windows installer logs. 

In the example above, the file to inspect is MMAExtensionInstall0-Setup0.log as indicated. Address the issue reported by Windows Installer if possible and try install/uninstall again.

# Helpful Related Articles

[Troubleshooting  Mon-agent fails to install with error: Failed to install performance counters (The parameter is incorrect)](/Monitor-Agents/Agents/Microsoft-Monitoring-Agent-\(MMA\)-for-Windows/Troubleshooting-Guides/Troubleshooting--Mon%2Dagent-fails-to-install-with-error:-Failed-to-install-performance-counters-\(The-parameter-is-incorrect\))

[Upgrade is not supported for currently Installed Version](/Monitor-Agents/Agents/Microsoft-Monitoring-Agent-\(MMA\)-for-Windows/Known-Issues/Upgrade-is-not-supported-for-currently-Installed-Version)

[Troubleshooting MMA fails to install with error ConvertStringSecurityDescriptorToSecurityDescriptor failed : 87](/Monitor-Agents/Agents/Microsoft-Monitoring-Agent-\(MMA\)-for-Windows/Troubleshooting-Guides/Troubleshooting-MMA-fails-to-install-with-error-ConvertStringSecurityDescriptorToSecurityDescriptor-failed-:-87)

[How to retrieve MMA installation logs](/Monitor-Agents/Agents/Microsoft-Monitoring-Agent-\(MMA\)-for-Windows/How%2DTo/How-to-retrieve-MMA-installation-logs)

