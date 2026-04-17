---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Change Tracking(v2) and Inventory/Change Tracking and Inventory (CT&I) V2 - Linux/Troubleshooting Guides/Troubleshoot Onboard Issues"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Change%20Tracking%28v2%29%20and%20Inventory/Change%20Tracking%20and%20Inventory%20%28CT%26I%29%20V2%20-%20Linux/Troubleshooting%20Guides/Troubleshoot%20Onboard%20Issues"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::



# Scenario
---
This TSG mainly applies to scenarios that customer failed to onboard CT&I v2 Linux Agent. 

# Troubleshooting Idea
---
![image.png](/.attachments/image-dd1d5dc3-bf31-4240-951f-ca9f3c7dd12f.png)

# Preliminary Checks
---
1. Check VM Guest Agent. 
- Since CT&I v2 is an extension based agent, VM Guest Agent is a prerequisite for installing any extension. Please check VM Guest Agent status in Azure Support Center => target VM => Properties tab => Additional Vm Data section. 
![image.png](/.attachments/image-3239f338-0377-4eea-b00c-9af09f9719d0.png)
- If it is in a wrong status or anything abnormal observed in VM Guest Agent log `/var/log/waagent.log`, please reach to Azure VM team for fixing the VM Guest Agent. 


2. Check installation of CT&I v2 Package. 
- Once VM Guest Agent is working correctly, we can always check if any abnormal in the extension log `/var/log/azure/Microsoft.Azure.ChangeTrackingAndInventory.ChangeTracking-Linux/CommandExecution.log`. 
- If issue is with "change-tracking-retail" package installation failure, we would be able to see any of below error message in the extension log.
  
  - `Package to be installed not found pattern`, or `More/Less than one Package to be installed`.  These two error messages indicate that no agent package found under `/var/lib/waagent/Microsoft.Azure.ChangeTrackingAndInventory.ChangeTracking-Linux-*/`, which usually caused by a corrupted extension package. Please try to uninstall and reinstall the extension, VM Agent will then re-download the correct extension package.  

  - `Driver's PackageManager could not install Package`. This error usually means PackageManager(rpm, dpkg) failed to install the CT&I package. We can try to manually install this package and see if the issue can be reproduced. See [How To: Manually Onboard CT&I Linux Agent](/Monitor-Agents/Change-Tracking\(v2\)-and-Inventory/Change-Tracking-and-Inventory-\(CT&I\)-V2-%2D-Linux/How%2DTo/How-To:-Manually-Onboard-CT&I-Linux-Agent), Method 2. If issue persists, since this issue is regarding Linux Package Manager, please collaborate with Linux Escalation team to address this issue.  

- You can use below commands to check if CT&I v2 Agent package has been installed.
  - dpkg series (Debian, Ubuntu, etc.): `dpkg-query  -f '${Version} ${Status}' -W 'change-tracking-retail'` 

  - rpm series (Redhat, CentOS, SUSE, etc.): `rpm -qi 'change_tracking_retail'`


3. Check installation of CT&I v2 Service. 
   
- If issue is with "cxp.service" installation failure, we can find error message `Driver's ServiceManager could not install Service` in the extension log. Please try to manually install this service and see if the issue can be reproduced. See [How To: Manually Onboard CT&I Linux Agent](/Monitor-Agents/Change-Tracking\(v2\)-and-Inventory/Change-Tracking-and-Inventory-\(CT&I\)-V2-%2D-Linux/How%2DTo/How-To:-Manually-Onboard-CT&I-Linux-Agent), Method 2. If issue persists, since this issue is regarding Linux service installation, please collaborate with Linux Escalation team to address this issue.  

- You can use below commands to check if CT&I v2 Agent service has been installed/running: `systemctl status cxp.service`


4. Check CT&I v2 Service running.
- From command `systemctl status cxp.service`, if `cxp.service` is running, which means CT&I v2 Agent is working well. 
- But if `cxp.service` showing status in failed, please follow [How To: Manually Restart CT&I Linux Agent](/Monitor-Agents/Change-Tracking\(v2\)-and-Inventory/Change-Tracking-and-Inventory-\(CT&I\)-V2-%2D-Linux/How%2DTo/How-To:-Manually-Restart-CT&I-Linux-Agent) and see if a restart would help. If not helping, please check if any errors in logs `/var/log/azure/Microsoft.Azure.ChangeTrackingAndInventory.ChangeTracking-Linux/cta_linux_*.log`


# Common Scenarios
---
Please refer to [Known Support Symptoms](/Monitor-Agents/Change-Tracking\(v2\)-and-Inventory/Troubleshooting-Guides)


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

