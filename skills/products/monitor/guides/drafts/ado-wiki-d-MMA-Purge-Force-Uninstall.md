---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Microsoft Monitoring Agent (MMA) for Windows/How-To/How to Purge and force uninstall MMA"
sourceUrl: "https://dev.azure.com/Supportability/6f9dfd80-6071-4f7b-8bf9-c97214ca68cf/_wiki/wikis/bebfc12e-d2ce-4ed1-8a64-d64c20264fd2?pagePath=%2FMonitor%20Agents%2FAgents%2FMicrosoft%20Monitoring%20Agent%20%28MMA%29%20for%20Windows%2FHow-To%2FHow%20to%20Purge%20and%20force%20uninstall%20MMA"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::
[[_TOC_]]

#Investigating extension uninstallation issues
A successful uninstallation of the extension will do the following �
1.	Remove the MicorosoftMonitoringAgent entry from Extensions section of Virtual Machines blade in the portal.

    - [ ]     Please don't purge agent forcely before removing MMA extension.
    - [ ]     If portal still shows **disconnecting**, then login your VM, restart guest agent: **Restart-Service WindowsAzureGuestAgent** , once done, try to remove it again; 
    - [ ]     If the extension status still shows abnormal after removed extension, please update your VM by cmd: **Update-AzVM**
2.	On the Virtual machine
- Stops all agent processes, that is: HealthService.exe and MonitoringHost.exe.
- Stops all MMA Extension processes, that is: MMAExtensionHeartbeatService.exe.
- From cmd make sure HealthService status is NOT RUNNING.
![image.png](/.attachments/image-8d9736bd-fe51-4557-8056-4fcf8196e9b0.png)

- If you check status of the service through services.msc you may learn error when you double click service name.
 ![image.png](/.attachments/image-421853f7-e684-4ee3-94a0-d36a420c899f.png)

- In MOMagent_install.log you may learn following information 
```
Information 1923.Service '@C:\Program Files\Microsoft Monitoring Agent\Agent\HealthService.dll,-10500' (HealthService) could not be installed. Verify that you have sufficient privileges to install system services.
10/11/2022 07:59:16.283 [11124]: Assembly Install: Failing with hr=80070005 at RemoveDirectoryAndChildren, line 393
```

# Note
<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#E8F5E9">
 Both screenshots above are indicators that service is in partial deletion state. Via SC Delete command one can manually force the service deletion.
</div>

- Delete service without OS reboot required:
  - Open command prompt and run as administrator
  - Delete service: sc.exe delete HealthService
- Delete service with OS reboot required:
  - Remove registry: Computer\HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\HealthService

- if agent folder still exists, remove the agent installation from the VM (that is everything under and including C:\Program Files\Microsoft Monitoring Agent)
- Removes extension installation from under C:\Packages\Plugins\Microsoft.EnterpriseCloud.Monitoring.MicrosoftMonitoringAgent
- Remove certificate: Get-ChildItem 'Cert:\LocalMachine\Microsoft Monitoring Agent' | Remove-Item

- Leaves the extension logs under C:\WindowsAzure\Logs\Plugins\Microsoft.EnterpriseCloud.Monitoring.MicrosoftMonitoringAgent\

#Any of the above artifacts left around after an uninstallation attempt indicate a failed uninstall.
---
There are two possibilities:
1.	The Guest Agent did not attempt to uninstall the extension.
2.	Uninstallation of the extension failed.
To determine which of the above is the case:

    �	cd to C:\WindowsAzure\Logs\Plugins\Microsoft.EnterpriseCloud.Monitoring.MicrosoftMonitoringAgent\[Extension version]

    �	Look for a file such as MMAExtensionUninstall[PickLargestNumber].log.

    �	If that file does not exist, it indicates that the Guest Agent did not attempt the uninstall. Involve the Guest Agent team to investigate further. IcM: AzureRT/GuestAgent 

    �	If the file exists, it will contain reason for the uninstall failure. In some cases, this is expected outcome and not even an error. For example:

    4/1/2020 12:38:21 AM +00:00 Removing the Microsoft Monitoring Agent VM extension.

    4/1/2020 12:38:21 AM +00:00 This Microsoft Monitoring Agent is managed by customer with some SCOM or OMS connection outside of the extension. As a result, we will not uninstall the agent.

#Cleaning partial/corrupted agent installs
---
In extremely rare cases you may encounter partial/corrupted installation of a previous version of the agent that prevents newer version from being installed/uninstalled. This issue will manifest as follows �
- Agent/extension processes are not running.
- Agent installation directory is empty: c:\Program Files\Microsoft Monitoring Agent\Agent
- Yet the following command will show that the agent is installed.

Get-WmiObject -Class Win32_Product -Filter "Name='Microsoft Monitoring Agent'"  -ComputerName . | Format-List -Property *
- 	In the output of the above command note the value of the field: IdentifyingNumber
- 	Next match it in this table (FROM https://msazure.visualstudio.com/One/_git/Mgmt-LogAnalytics-MMAVMExtension?path=/src/Shared/WindowsInstallerHelper.cs&version=GBmaster&line=115&lineEnd=116&lineStartColumn=1&lineEndColumn=1&lineStyle=plain&_a=contents)

            { new Guid("{8B21425D-02F3-4B80-88CE-8F79B320D330}"), new Version(7, 0, 9538, 0) },
            { new Guid("{786970C5-E6F6-4A41-B238-AE25D4B91EEA}"), new Version(7, 1, 10184, 0) },
            { new Guid("{EB03FA06-01A7-49F7-8BD0-0AB92D905899}"), new Version(7, 2, 10115, 0) },
            { new Guid("{C318816D-D471-4F18-999A-7662DB906BC0}"), new Version(7, 2, 10185, 0) },
            { new Guid("{E854571C-3C01-4128-99B8-52512F44E5E9}"), new Version(7, 2, 10375, 0) },
            { new Guid("{8A7F2C51-4C7D-4BFD-9014-91D11F24AAE2}"), new Version(8, 0, 10879, 0) },
            { new Guid("{742D699D-56EB-49CC-A04A-317DE01F31CD}"), new Version(8, 0, 10918, 0) },
            { new Guid("{E387F779-C574-4252-8B91-009CE5648A46}"), new Version(8, 0, 11030, 0) },
            { new Guid("{6D765BA4-C090-4C41-99AD-9DAF927E53A5}"), new Version(8, 0, 11049, 0) },
            { new Guid("{34DA9145-859A-4645-A0BD-6F22C551F8A9}"), new Version(8, 0, 11072, 0) },
            { new Guid("{EE0183F4-3BF8-4EC8-8F7C-44D3BBE6FDF0}"), new Version(8, 0, 11081, 0) },
            { new Guid("{D666640E-64C1-49E0-9ECD-2CF406AEEF37}"), new Version(8, 0, 11103, 0) },
            { new Guid("{125E840F-D03A-4F95-8236-8176B6150760}"), new Version(8, 0, 11136, 0) },
            { new Guid("{8C5A65C2-A15D-4C11-BA8E-B640639774AB}"), new Version(10, 19, 10006, 0) },
            { new Guid("{382C3EC9-20AD-4E09-A6D6-8E34CF3E0586}"), new Version(10, 19, 13515, 0) },
            { new Guid("{B1919D12-F353-4503-BCEE-E72A71A949AF}"), new Version(10, 20, 18001, 0) },
            { new Guid("{43176309-DADC-4C94-9719-DDB6BC1AFECA}"), new Version(10, 20, 18011, 0) },
            { new Guid("{3CC28940-B587-4B46-9F18-9927D6F13202}"), new Version(10, 20, 18018, 0) },
            { new Guid("{D95D3377-B0B5-452D-80BD-6E599B87CB3C}"), new Version(10, 20, 18029, 0) },
            { new Guid("{D035C02C-D356-43F2-B8B7-4A1CE5BD5AE0}"), new Version(10, 20, 18038, 0) },
            { new Guid("{774E20C6-9B94-48F2-99C9-8E1FAE17C960}"), new Version(10, 20, 18040, 0) },
            { new Guid("{88EE688B-31C6-4B90-90DF-FBB345223F94}"), new Version(10, 20, 18053, 0) },
            { new Guid("{3d2e7472-c8c5-4a81-85bd-e3ebfdf51d89}"), new Version(10, 20, 18062, 0) },
            { new Guid("{F2F6A09E-8BE3-484E-BA48-888AFEC5F20A}"), new Version(10, 20, 18064, 0) }

- Next download the msi corresponding to the corresponding version from here: https://microsoft.sharepoint.com/:f:/t/EMEAAMASupport/EmdomZp6SqFIviV6jCoto0gBDNl-Ija2hHEJtaJXfArfGg?e=LeAr2L to the VM.
- Then double-click on the msi to try to first install it.
- Check if it now shows under add remove programs and also under C:\Program Files\Microsoft Monitoring Agent and also using powershell command:
Get-WmiObject -Class Win32_Product -Filter "Name='Microsoft Monitoring Agent'"  -ComputerName . | Format-List -Property *
- Then double-click on the msi to try to uninstall it (it will give "remove" option in the UI).
- Then verify that the output of following command does not show the version installed:
Get-WmiObject -Class Win32_Product -Filter "Name='Microsoft Monitoring Agent'"  -ComputerName . | Format-List -Property *
- Now the system is in a clean state.
- If none of the above help try using clean up tool at https://support.microsoft.com/topic/fix-problems-that-block-programs-from-being-installed-or-removed-cca7d1b6-65a9-3d98-426b-e9f927e1eb4d

#References
---
Follow the links below to learn about different installation methods:
- [How to retrieve MMA installation logs](/Monitor-Agents/Agents/Microsoft-Monitoring-Agent-\(MMA\)-for-Windows/How%2DTo/How-to-retrieve-MMA-installation-logs)

- Install the extension using Azure PowerShell module (command Get-AzVMExtension)
https://docs.microsoft.com/azure/virtual-machines/extensions/oms-windows

