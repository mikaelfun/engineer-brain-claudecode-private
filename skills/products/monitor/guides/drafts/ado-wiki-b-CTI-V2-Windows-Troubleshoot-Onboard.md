---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Change Tracking(v2) and Inventory/Change Tracking and Inventory (CT&I) V2 - Windows/Troubleshooting Guide/Troubleshoot Onboard Issues"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FChange%20Tracking(v2)%20and%20Inventory%2FChange%20Tracking%20and%20Inventory%20(CT%26I)%20V2%20-%20Windows%2FTroubleshooting%20Guide%2FTroubleshoot%20Onboard%20Issues"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::




# Scenario
---
This TSG mainly applies to scenarios that customer failed to onboard CT&I v2 Windows Agent. 

# Troubleshooting Idea
---
![image.png](/.attachments/image-28d27354-a874-4baa-9f90-cc7ffb1af37f.png)

# Preliminary Checks
---
1. Check VM Guest Agent. 
- Since CT&I v2 is an extension based agent, VM Guest Agent is a prerequisite for installing any extension. Please check VM Guest Agent status in Azure Support Center => target VM => Properties tab => Additional Vm Data section. 
![image.png](/.attachments/image-3239f338-0377-4eea-b00c-9af09f9719d0.png)
- If it is in a wrong status or anything abnormal observed in VM Guest Agent log `/var/log/waagent.log`, please reach to Azure VM team for fixing the VM Guest Agent. 


2. Check installation of CT&I v2 Service. 
- Once VM Guest Agent is working correctly, we can always check if any abnormal in the extension log `C:\WindowsAzure\Logs\Plugins\Microsoft.Azure.ChangeTrackingAndInventory.ChangeTracking-Windows\<ver>\CommandExecution.log`. 

   
- If issue is with "change_tracking_service" installation failure, we can find below error messages in the extension log.
    - `Driver's ServiceManager could not check Service status`
    - `Couldn't setup the parent Service in place`
    - `Driver's ServiceManager could not install Service`. 

    In those cases, Please try to manually install this service and see if the issue can be reproduced. See [How To: Manually Onboard CT&I Windows Agent](/Monitor-Agents/Change-Tracking\(v2\)-and-Inventory/Change-Tracking-and-Inventory-\(CT&I\)-V2-%2D-Windows/How-To/How-To:-Manually-Onboard-CT&I-Windows-Agent), Method 2. If issue persists, since this issue is regarding Windows Service installation, please collaborate with Windows team to address this issue.  

3. Check CT&I v2 Service running.
- We can check "change_trakcing_service" status by PowerShell command `Get-Service -Name change_tracking_service`, like below. 
  ![image.png](/.attachments/image-50883498-e2ab-4b6b-a5b7-b6972f0c19c8.png)
  and change tracking processes in Task Manager like below.
  ![image.png](/.attachments/image-93415877-b801-4d50-ac61-46816fec5ef9.png)
- If `change_trakcing_service` not showing in running status, please follow [How To: Manually Restart CT&I Windows Agent](/Monitor-Agents/Change-Tracking\(v2\)-and-Inventory/Change-Tracking-and-Inventory-\(CT&I\)-V2-%2D-Windows/How-To/How-To:-Manually-Restart-CT&I-Windows-Agent) and see if a restart would help. If not helping, please check if any errors in logs `C:\WindowsAzure\Logs\Plugins\Microsoft.Azure.ChangeTrackingAndInventory.ChangeTracking-Windows\<version>\cta_windows_*.log`


# Logs for CT&I Agent Analysis
---
-  Always collect AMA Windows log. See [How To run  AgentTroubleshooter.exe for AMA - Windows](/Monitor-Agents/Agents/Azure-Monitor-Agent-\(AMA\)-for-Windows/How%2DTo/How-To-run--AgentTroubleshooter.exe-for-AMA-%2D-Windows).
- All the files from path 
Azure VM: `C:\WindowsAzure\Logs\Plugins\Microsoft.Azure.ChangeTrackingAndInventory.ChangeTracking-Windows\<version>\`
Azure Arc: `C:\Packages\Plugins\Microsoft.Azure.ChangeTrackingAndInventory.ChangeTracking-Windows\<version>\`
  - CommandExecution.log  (Extension log)
  - cta_windows_handler.log  (Handler log)
  - cta_windows_watcher.log  (Watcher log)
  - cta_windows_agent.log   (Main Agent log)
  - File.json             (DB data of last run of File worker)
  - Applications.json         (DB data of last run of Software worker for applications)
  - patches.json         (DB data of last run of Software worker for patches)
  - Services.json         (DB data of last run of Service worker)

- DB file at `%SystemDrive%\Program Files\ChangeAndInventory\db\changetracking.db`


- For getting an equivalent logging of `cta_windows_agent.log` from backend, please refer to [How To: Kusto for checking CT&I V2 Agent Log](/Monitor-Agents/Change-Tracking\(v2\)-and-Inventory/Change-Tracking-and-Inventory-\(CT&I\)-V2-%2D-Windows/How-To/How-To:-Kusto-for-checking-CT&I-V2-Agent-Log).

- If above logs aren't enough to help you identify issues, we can do further analysis by enabling debug logging. Please  refer to [How To: Enable Debug Logging of CT&I Windows Agent](/Monitor-Agents/Change-Tracking\(v2\)-and-Inventory/Change-Tracking-and-Inventory-\(CT&I\)-V2-%2D-Windows/How-To/How-To:-Enable-Trace-Logging-of-CT&I-Windows-Agent).




# Support Boundary 
Refer to the below support boundary to determine the correct team to reach out to support based on the scenarios. 




|**Scenario**| **IcM Escalation Path** | **Support Topics**  |
|--|--|--|
| **Change Tracking V2** <br> 1.Extension installation and uninstallation<br>2. issues related to default DCR created for Change tracking| Azure Automation/Change Tracking(Sev 3 & Sev 4) | Azure\Change Tracking and Inventory\Change Tracking and Inventory with AMA  |
| **AMA Agent**<br> 1. Installing and uninstalling AMA Agent<br> 2. No heartbeat for Agent <br> 3. Missing or no data from Agent<br>| Azure Monitor Data Collection/AMA Linux <br> Azure Monitor Data Collection/AMA Windows | Data Colletion rules (DCR) and Agent  |
| **DCR scenarios:** <br>1. Error creating, deleting DCR <br> 2. Need help with creating ,associating or viewing DCR|Azure Monitor Control Service (AMCS)/Triage|Data Colletion rules (DCR) and Agent |
| **FIM Scenarios** <br> 1.Error enabling FIM in the Log Analytics workspace<br>2. Migration from legacy to new FIM<br>3. Not tracking changes<br>|Microsoft Defender for Cloud\Guardians| Azure\Microsoft Defender for Cloud\Enhanced security features for servers\File Integrity Monitoring (FIM) |

 



# IcM Escalation path 
<details closed>
<summary><b>Scenarios & Templates</b></summary>
<div style="margin:25px">

Refer to the following for IcM Escalation path based on scenario

|**Scenario**| **IcM Escalation Path** | **ICM Template**  |
|--|--|--|
| **Change Tracking V2** <br> Extension installation and uninstallation| Azure Automation/Change Tracking(Sev 3 & Sev 4) | Icm template -Change Tracking and Inventory with AMA [j234o3](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=j234o3) |
| **AMA Agent**<br> 1. Installing and uninstalling AMA Agent<br> 2. No heartbeat for Agent <br> 3. Missing or no data<br>| Azure Monitor Data Collection/AMA Linux <br> Azure Monitor Data Collection/AMA Windows | ICM template for Windows [4231G3](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=4231G3) Icm template for Linux [n3w2h3](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=n3w2h3) |
| **DCR scenarios:** <br>1. Error creating, deleting DCR <br> 2. Need help with creating ,associating or viewing DCR|Azure Monitor Control Service (AMCS)/Triage| Icm template for DCR [mri3w1](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=mri3w1) |
| **FIM Scenarios** <br> 1.Error enabling FIM in the Log Analytics workspace<br>2. Migration from legacy to new FIM<br>3. Not tracking changes<br>|Microsoft Defender for Cloud\Guardians| Azure\Microsoft Defender for Cloud\Enhanced security features for servers\File Integrity Monitoring (FIM) |

</details>




