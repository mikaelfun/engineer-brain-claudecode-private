---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Microsoft Monitoring Agent (MMA) for Windows/Troubleshooting Guides/Troubleshooting MMA Extension Installation and Uninstallation Issues"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FMicrosoft%20Monitoring%20Agent%20%28MMA%29%20for%20Windows%2FTroubleshooting%20Guides%2FTroubleshooting%20MMA%20Extension%20Installation%20and%20Uninstallation%20Issues"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::
Applies To:
- Microsoft Monitoring Agent :- All versions when installed as Extension

[[_TOC_]]
#**Troubleshoot MMA extension uninstallation issue**
---
#Basic uninstallation troubleshooting steps

1. Remove the MicorosoftMonitoringAgent entry from Extensions section of Virtual Machines blade in the portal. Please don't purge agent forcely before removing MMA extension.
![image.png](/.attachments/image-e7621122-26be-41d1-b4ec-0c91e966a6d8.png)
2. If portal still shows **disconnecting**, then login your VM, restart guest agent: **Restart-Service WindowsAzureGuestAgent** , once done, try to remove it again; 
3. If the extension status still shows abnormal after removed extension, please delete the extension folder(C:\Packages\Plugins\Microsoft.EnterpriseCloud.Monitoring.MicrosoftMonitoringAgent) and update your VM by cmd: **Update-AzVM**
4. If the extension status still shows abnormal, try with cmd **Remove-AzVMExtension** to uninstall the MMA extension. 

#Log collection
1. Use **Remove-AzVMExtension -v** to uninstall the MMA extension and check for logs.
2. Check logs under C:\WindowsAzure\Logs\Plugins\Microsoft.EnterpriseCloud.Monitoring.MicrosoftMonitoringAgent\
 to see if there's any errors during the extension uninstallation
# Common Scenario of failed uninstallation 
##Symptom
The uninstallation process of MMA extension failed and the extension status shown as provisioning failed.
##Analysis
Check if any of the following artifacts left around after uninstallation
- agent folder (that is everything under and including C:\Program Files\Microsoft Monitoring Agent)
- extension installation from under C:\Packages\Plugins\Microsoft.EnterpriseCloud.Monitoring.MicrosoftMonitoringAgent
- certificate: Get-ChildItem 'Cert:\LocalMachine\Microsoft Monitoring Agent'

##Cause
Any of the above artifacts left around after an uninstallation attempt indicate a failed uninstall.
There are two possibilities:
1.	The Guest Agent did not attempt to uninstall the extension.
2.	Uninstallation of the extension failed.
##Resolution
To determine which of the above is the case:
1. cd to C:\WindowsAzure\Logs\Plugins\Microsoft.EnterpriseCloud.Monitoring.MicrosoftMonitoringAgent\[Extension version]
2. Look for a file such as MMAExtensionUninstall[PickLargestNumber].log.
3. If that file does not exist, it indicates that the Guest Agent did not attempt the uninstall. Involve the Guest Agent team to investigate further. IcM: AzureRT/GuestAgent 
4. If the file exists, it will contain reason for the uninstall failure. In some cases, this is expected outcome and not even an error. For example:
    ```
    4/1/2020 12:38:21 AM +00:00 Removing the Microsoft Monitoring Agent VM extension.

    4/1/2020 12:38:21 AM +00:00 This Microsoft Monitoring Agent is managed by customer with some SCOM or OMS connection outside of the extension. As a result, we will not uninstall the agent.
    ```
#**Troubleshoot MMA extension installation issue**
---
#Basic installation troubleshooting steps
1. Check status in portal:
   - On the virtual machine, click Extensions.
   - From the list, check to see if the Log Analytics extension is enabled or not. If enabled the Windows Log Analytics Agent will appear with name **MMAExtension** and type **Microsoft.EnterpriseCloud.Monitoring.MicrosoftMonitoringAgent**. Note the value under the STATUS column. After a successful installation, the value should be Provisioning succeeded.
![image.png](/.attachments/image-5973782d-66b3-4100-b463-f826980b4994.png)
2. Check if Heartbeat events are emitted by this VM. If yes go to step 3, if no go to step 4.
3. If Heartbeat events are visible in Log Analytics log search that indicates that the agent is successfully installed. Try re-installing the MMA extension.
   - If portal still shows **disconnecting**, then login your VM, restart guest agent: **Restart-Service WindowsAzureGuestAgent** , once done, try to install it again; 
   - If the extension status still shows abnormal after removed extension, please delete the extension folder(C:\Packages\Plugins\Microsoft.EnterpriseCloud.Monitoring.MicrosoftMonitoringAgent) and update your VM by cmd: **Update-AzVM**
   - If it still shows not successful, involve portal team for further investigation regarding incorrect status being displayed in portal. 
Insert IcM information for portal team
4. If the extension is not showing status equal to Provisioning succeeded & Heartbeat events are not flowing, then proceed to troubleshoot on the virtual machine.
   - RDP into the virtual machine.
   - Note whether extension/agent processes are running by executing following powershell commands:
`Get-WmiObject Win32_Process -Filter "name = 'MMAExtensionHeartbeatService.exe'" | Format-List ProcessName,Path`
`Get-WmiObject Win32_Process -Filter "name = 'HealthService.exe'" | Format-List ProcessName,Path`
`Get-WmiObject Win32_Process -Filter "name = 'MonitoringHost.exe'" | Format-List ProcessName,Path`
Screenshot Example:
![image.png](/.attachments/image-00ca0217-2039-43aa-85de-04944c5cf0b7.png)
In the output for MMAExtensionHeartbeatService.exe make sure that the path corresponds to the version being installed.
   - Note whether the extension installation directory exists:
 C:\Packages\Plugins\Microsoft.EnterpriseCloud.Monitoring.MicrosoftMonitoringAgent\[Extension version]
Absence of this directory indicates that the extension installation was not attempted by Guest Agent. Involve Guest Agent team for further investigation. IcM: AzureRT/GuestAgent
   - If the directory is present:

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
If the failure is due to windows installer issues, look in the windows installer logs. Use command line to install the MMA agent and collect the installation log to check for errors
`msiexec.exe /i "MOMAgent.msi" /l*v "C:\Temp\MOMAgent_install.log"`
Address the issue reported by Windows Installer if possible and try install/uninstall again.

     Refer to article below for detailed troubleshooting about MMA agent installation issue: https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/830125/How-to-Troubleshoot-Windows-Agent-Installation-and-Uninstallation-issue?anchor=how-to-troubleshoot-windows-agent-installation-issue
#Log collection
1. Use **Set-AzVMExtension -v** to install the MMA extension and check for logs.
2. Check logs under C:\WindowsAzure\Logs\Plugins\Microsoft.EnterpriseCloud.Monitoring.MicrosoftMonitoringAgent\
 to see if there's any errors during the extension installation
3. Use command line to install the MMA agent and collect the installation log to check for errors
`msiexec.exe /i "MOMAgent.msi" /l*v "C:\Temp\MOMAgent_install.log"`

#How do I submit Icm for MMA extension installation and uninstallation issues
If your SAP is correct, then you will automatically get right Agent template when raising CRI via Azure support center. 
[Here is a direct link for the correct ICM template](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=ma3n1c)

Please make sure CRI is approved by TA or SME to make sure you have right set of data captured and have initial analysis of data as well.

Collect data referecned in the **Log Collection** section above.

#Additional Articles:
[MMA Setup Failed. Error: 0x80070643 Fatal error during installation | Status 1603 | Portal Error Error 1714](/Monitor-Agents/Agents/Microsoft-Monitoring-Agent-\(MMA\)-for-Windows/Troubleshooting-Guides/MMA-Setup-Failed.-Error:-0x80070643-Fatal-error-during-installation-|-Status-1603-|-Portal-Error-Error-1714)