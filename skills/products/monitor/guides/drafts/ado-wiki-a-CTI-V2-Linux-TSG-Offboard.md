---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Change Tracking(v2) and Inventory/Change Tracking and Inventory (CT&I) V2 - Linux/Troubleshooting Guides/Troubleshoot Offboard Issues"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Change%20Tracking%28v2%29%20and%20Inventory/Change%20Tracking%20and%20Inventory%20%28CT%26I%29%20V2%20-%20Linux/Troubleshooting%20Guides/Troubleshoot%20Offboard%20Issues"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::




# Scenario
---
This TSG mainly applies to scenarios that customer failed to offboard CT&I v2 Linux Agent. 

# Troubleshooting Idea
---
![image.png](/.attachments/image-cf68f12c-a4bb-4905-bea7-c4cba983f919.png)

# Preliminary Checks
---
1. Check VM Guest Agent. 
- Since CT&I v2 is an extension based agent, VM Guest Agent is a prerequisite for installing any extension. Please check VM Guest Agent status in Azure Support Center => target VM => Properties tab => Additional Vm Data section. 
![image.png](/.attachments/image-3239f338-0377-4eea-b00c-9af09f9719d0.png)
- If it is in a wrong status or anything abnormal observed in VM Guest Agent log `/var/log/waagent.log`, please reach to Azure VM team for fixing the VM Guest Agent. 


2. Check extension log. 
- Once VM Guest Agent is working correctly, we can always check if any abnormal in the extension log `/var/log/azure/Microsoft.Azure.ChangeTrackingAndInventory.ChangeTracking-Linux/CommandExecution.log`. 
- If we see error `Driver's ServiceManager could not remove Service`, which indicates the uninstallation process failed at removal of the `cxp.service`. There should be a more detailed reason right after this error message, which should give us some more insights about why this operation failed. Please first follow that clue, but if no luck, you may then need to follow[How To: Manually Purge CT&I Linux Agent](/Monitor-Agents/Change-Tracking\(v2\)-and-Inventory/Change-Tracking-and-Inventory-\(CT&I\)-V2-%2D-Linux/How%2DTo/How-To:-Manually-Purge-CT&I-Linux-Agent)-Method 2 to manually remove the service, or engage Linux Escalation team to help remove the service.
- If we see error `Driver's PacakageManager could not remove Package`, which indicates the uninstallation process failed at removal of the `change-tracking-retail` package.  There should be a more detailed reason right after this error message, which should give us some more insights about why this operation failed. Please first follow that clue, but if no luck, you may then need to follow [How To: Manually Purge CT&I Linux Agent](/Monitor-Agents/Change-Tracking\(v2\)-and-Inventory/Change-Tracking-and-Inventory-\(CT&I\)-V2-%2D-Linux/How%2DTo/How-To:-Manually-Purge-CT&I-Linux-Agent)-Method 2 to manually remove the package, or engage Linux Escalation team to help remove the package. 


# Logs for CT&I Agent Analysis
---
- Always collect AMA Linux log. See [How to use troubleshooting Tool for Azure Monitor Linux Agent](/Monitor-Agents/Agents/Azure-Monitor-Agent-\(AMA\)-for-Linux/How%2DTo/How-to-use-troubleshooting-Tool-for-Azure-Monitor-Linux-Agent).
- All the files from path `/var/log/azure/Microsoft.Azure.ChangeTrackingAndInventory.ChangeTracking-Linux`
  - CommandExecution.log  (Extension log)
  - cta_linux_handler.log  (Handler log)
  - cta_linux_watcher.log  (Watcher log)
  - cta_linux_agent.log   (Main Agent log)
  - File.json             (DB data of last run of File worker)
  - Packages.json         (DB data of last run of Software worker)
  - Services.json         (DB data of last run of Service worker)

- DB file at `/opt/microsoft/changetrackingdata/db/changetracking.db`

- For getting an equivalent logging of `cta_linux_agent.log` from backend, please refer to [How To: Kusto for checking CT&I V2 Agent Log](/Monitor-Agents/Change-Tracking\(v2\)-and-Inventory/Change-Tracking-and-Inventory-\(CT&I\)-V2-%2D-Linux/How%2DTo/How-To:-Kusto-for-checking-CT&I-V2-Agent-Log)

- If above logs aren't enough to help you identify issues, we can do further analysis by enabling debug logging. Please  refer to [How To: Enable Debug Logging](/Monitor-Agents/Change-Tracking\(v2\)-and-Inventory/Change-Tracking-and-Inventory-\(CT&I\)-V2-%2D-Linux/How%2DTo/How-To:-Enable-Debug-Logging) .




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

