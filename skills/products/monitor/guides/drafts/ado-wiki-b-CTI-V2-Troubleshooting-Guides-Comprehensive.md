---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Change Tracking(v2) and Inventory/Troubleshooting Guides"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FChange%20Tracking(v2)%20and%20Inventory%2FTroubleshooting%20Guides"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::


Following information is for Change Tracking and Inventory (v2) using AMA. 

[[_TOC_]]
# Documentation 

Here is the link to documents: 

[Overview of change tracking and inventory using Azure Monitoring Agent](https://learn.microsoft.com/azure/automation/change-tracking/overview-monitoring-agent)
[Supported Regions](https://learn.microsoft.com/azure/automation/change-tracking/region-mappings-monitoring-agent)
[Enable Change Tracking and Inventory using Azure Monitoring Agent](https://learn.microsoft.com/azure/automation/change-tracking/enable-vms-monitoring-agent?tabs=singlevm)
[Configure Alerts](https://learn.microsoft.com/azure/automation/change-tracking/configure-alerts)



# Training / Demo Recording

Latest brownbag available for [Change Tracking and inventory using AMA can be found here](https://microsoft.sharepoint.com/teams/AzMonPODSwarming/_layouts/15/stream.aspx?id=%2Fteams%2FAzMonPODSwarming%2FShared%20Documents%2FAzure%20Monitor%20Deepdive%20recordings%2FDeepdive%5F%20Change%20Tracking%20and%20Inventory%20using%20AMA%2D20231016%5F203528%2DMeeting%20Recording%2Emp4&ct=1701107950197&or=Outlook%2DBody&cid=8F1CD74D%2D6ADC%2D4F22%2DB6A3%2D8EB7FA9C4E60&ga=1&referrer=StreamWebApp%2EWeb&referrerScenario=AddressBarCopied%2Eview) Oct,2023

The deep dive recording for [Change Tracking and inventory using AMA can be found here](https://microsoft-my.sharepoint.com/:v:/p/rashmia/EVJhniIAp9FFjv8dyyTzI58B3jb8vWZ8yh0SMDl969z_iw?e=ZHKRKm) Dec,2022


<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#d7eaf8">

**Important**

Before starting troubleshooting, make sure you have right SAP in case if working on Change Tracking & Inventory using AMA.
_Support area path: Azure/Change Tracking and Inventory/Change Tracking and Inventory with AMA(preview)_
 
</div>


# Things to remember

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#d7eaf8">

**Important**
Change Tracking & Inventory V2 using AMA is Not a Real Time Monitoring Assessment. It has predefined discovery and collection intervals that cannot be changed.
 </div>

[Supported Operating Systems](https://learn.microsoft.com/azure/automation/change-tracking/overview-monitoring-agent#supported-operating-systems)
[Data Collection Frequency](https://learn.microsoft.com/azure/automation/change-tracking/overview-monitoring-agent#change-tracking-and-inventory-data-collection)
[Current Limitations](https://learn.microsoft.com/azure/automation/change-tracking/overview-monitoring-agent#current-limitations)
[Monitoring / Tracking Limits](https://learn.microsoft.com/azure/automation/change-tracking/overview-monitoring-agent#limits)

# Known Support Symptoms

Change Tracking (CT) with AMA Onboarding errors � When the customer attempts to onboard CT with AMA on a machine and faces following nature of errors 



<details closed>
<summary><b>Symptom 1 - Write permission not enabled on VM</b></summary>
<div style="margin:25px">

![image.png](/.attachments/image-1df184e2-97b0-4ff6-8acb-bee1d1521cdc.png)
**Cause** - This error surfaces when the customer has not activated write permissions on this VM. The requirement here is to modify permission-based settings. 

**Resolution** � In order to address this error, 
* Validate that customer has write permission or not on VM. 

![image.png](/.attachments/image-3d1fb114-70d0-4c30-a5b9-0fe09292bcc9.png)
* If write permission is enabled and still this error shows create ICM/CRI 
</details>



<details closed>
<summary><b>Symptom 2 - Cannot fetch DCR id</b></summary>
<div style="margin:25px">

**Error** � While onboarding CT with AMA on a machine via portal, a DCR id is created and rendered by the system. In the scenario, where this action doesn�t happen successfully this error is surfaced----->  Cannot fetch DCR id

**Cause** � While onboarding CT with AMA on a machine via portal, a DCR id is created and rendered by the system. In the scenario, where this action doesn�t happen successfully this error is surfaced 

**Resolution** � In order to address this error, 

* Create ICM/CRI 
 
</details>

 

<details closed>
<summary><b>Symptom 3 - VM Permissions data could not be fetched </b></summary>
<div style="margin:25px">

**Error** � While onboarding CT with AMA on a machine via portal, you may observe following error ----->   VM Permissions data could not be fetched 

**Cause** � While onboarding CT with AMA on a machine via portal, TBA 

**Resolution** � In order to address this error, 

* Create ICM/CRI 
 
 </details>

 


<details closed>
<summary><b>Symptom 4 - Extension Deployment failed</b></summary>
<div style="margin:25px">

**Cause** � While onboarding CT with AMA on a machine via portal, once the customer clicks on ENABLE to initiate the deployment, it usually takes 2-3 minutes for deployment to finish successfully (screenshot attached for reference below). In a scenario where the deployment fails, �Deployment Failed� message is reflected  
![image.png](/.attachments/image-9162ce9a-5d3e-4056-94b1-b81d289049a6.png)

**Resolution** � In order to address this error, 

* Browser refresh to check if solution is onboarded or not. 
If it still shows the Onboarding page, then check for read permissions the Log analytics workspace that user is trying to onboard. 
If the above steps do not resolve the issue, create ICM/CRI. 
 
 </details>

 


<details closed>
<summary><b>Symptom 5 - Cannot enable CT because MMA/OMS is installed </b></summary>
<div style="margin:25px">

**Cause** � While onboarding CT with AMA on a machine via portal, if the particular VM has MMA/OMS agent already installed, it won�t be possible to configure CT with AMA. Note � We are working on a path to for customers to migrate from MMA to AMA and this will be available by GA. 

**Resolution** � In order to address this error, 
* Can�t enable if change tracking is enabled with MMA/OMS agent. Communicate to the customer that a migration path will be introduced in next 2-3 months 
* Customer should not install MMA agent on windows or OMS Agent on Linux after successful deployment of Change tracking & Inventory V2 extension. This is not a supported configuration at the moment. 
 
 </details>


<details closed>
<summary><b>Symptom 6 - Change tracking with AMA agent installed on VM </b></summary>
<div style="margin:25px">

**Cause** - Both CT and AMA agent must be installed to complete onboarding, delete the CT extension from VM extension page and start onboarding again. 

Change Tracking Open Changes and Inventory Center > Change Tracking Blade and Inventory Blade 

* Changes Grid shows failed message because No VM is enabled with Change Tracking on the selected workspace. 

* Inventory Grid shows Error message because No VM is enabled with Change Tracking on the selected workspace. 

* Setting button is disabled if there is no Data Collection Rule reporting to the selected workspace. 
 
 </details>

 
<details closed>
<summary><b>Symptom 7 - For Azure ARC based AMA machines, Inventory and Change tracking blades appear empty in portal</b></summary>
<div style="margin:25px">

![image.png](/.attachments/image-43c11b02-a5b7-4c1b-8734-c05c5fbbfc2d.png)

**Cause** - Once CT V2 extension is deployed via Azure policy , it is observed that DCR association may not have been completed  

 **Workaround**

- DCR creation is part of Enabling CT V2 onboarding experience for ARC via Azure Policy. We can manually associate azure ARC machine to CT V2 DCR. 
- In few minutes through Azure support center we can validate that Association completed and portal blades for Change tracking & inventory wont be blank any more. Data collection will take its time based o default frequency.

 </details>

# Basic Troubleshooting 

* If making changes in CT configuration via Browser, Refresh browser after every action to ensure that the changes reflect.
It is the first action product group recommend if some settings are changed but not reflected or data is not reflected in change tracking portal/blades.

* Allow few minutes in browser when ever making change to CT v2 config or onboarding extension after creating a VM.
* When troubleshooting data collection issues post Change tracking v2 extension deployment, always make sure AMA agent is sending its heartbeat to workspace consistently. otherwise address missing heartbeat issue first via [Troubleshooting Windows AMA Missing Heartbeats](/Monitor-Agents/Agents/Azure-Monitor-Agent-\(AMA\)-for-Windows/Troubleshooting-Guides/Troubleshooting-Windows-AMA-Missing-Heartbeats)

# Extension Portal view & Processes in Operating Systems


<details closed>
<summary><b>Windows</b></summary>
<div style="margin:25px">
 

If Change Tracking & Inventory data stopped coming to workspace and you are sure that AMA agent heartbeats are successfully coming then we must check these processes in task manager, which means change tracking extension / agent is running. 

1) change_tracking_agent_windows_amd64.exe  
2) change_tracking_service.exe
![image.png](/.attachments/image-03f9a945-7e9b-4f32-abba-05b243b9c1ef.png)

**Portal Extension View:**
![image.png](/.attachments/image-03d21aa8-a63b-4fc6-8b2e-4f4b8181ac61.png)


</details>


<details closed>
<summary><b>Linux</b></summary>
<div style="margin:25px">
 
 If Change Tracking & Inventory data stopped coming to workspace and you are sure that AMA agent heartbeats are successfully coming then we must check via following command to make sure following processes for change tracking extension are running.

ps -ef | grep changetracking

1. /usr/sbin/changetracking/changetracking 
2. /opt/microsoft/changetracking/change_tracking_agent_linux_amd64 

EXAMPLE
```
[irfanr@Redhat ~]$ ps -ef | grep changetracking
root        9934       1  0 23:49 ?        00:00:00 /usr/sbin/changetracking/changetracking /opt/microsoft/changetracking/change_tracking_agent_linux_amd64 /var/lib/waagent/Microsoft.Azure.ChangeTrackingAndInventory.ChangeTracking-Linux-2.6.2.0
root        9937    9934  0 23:49 ?        00:00:00 /opt/microsoft/changetracking/change_tracking_agent_linux_amd64 /var/lib/waagent/Microsoft.Azure.ChangeTrackingAndInventory.ChangeTracking-Linux-2.6.2.0
irfanr     10477    6724  0 23:56 pts/0    00:00:00 grep --color=auto changetracking
[irfanr@Redhat ~]$
```

**Portal Extension View:**
![image.png](/.attachments/image-f997142e-abd7-4245-b7d5-b54556a27536.png)


</details>
 

# Learning about missing Software Inventory 
It is important to know how to query installed Applications on Windows / Linux.
Scenario could be like a specific software is not being discovered in Change tracking inventory, we collect output of the query from customer's linux VM and check that software is present. This information must be collected along with Logs CSS should collect for analysis and ICM.

<details closed>
<summary><b>Windows</b></summary>
<div style="margin:25px">

Once CT extension is installed and the software worker will run for the first time, it will create a baseline of current existing software and their versions. In the next cycle, if there�s a new software compared to the baseline it will report as added and so on.

Baselines are stored here in a [BoltDB](https://developer.hashicorp.com/vault/tutorials/monitoring/inspect-data-boltdb):
C:\Program Files\ChangeAndInventory\db\changetracking.db

Baselines are human readable here:
C:\WindowsAzure\Logs\Plugins\Microsoft.Azure.ChangeTrackingAndInventory.ChangeTracking-Windows\{version}\Applications.json
C:\WindowsAzure\Logs\Plugins\Microsoft.Azure.ChangeTrackingAndInventory.ChangeTracking-Windows\{version}\File.json
C:\WindowsAzure\Logs\Plugins\Microsoft.Azure.ChangeTrackingAndInventory.ChangeTracking-Windows\{version}\Patches.json
C:\WindowsAzure\Logs\Plugins\Microsoft.Azure.ChangeTrackingAndInventory.ChangeTracking-Windows\{version}\Services.json

To get the list of windows applications / software installed on the machine that ChangeTracking sees, customer has to run the exe file located in:

- Open command prompt as Admin
- Run the CTResourceApplication.exe 

![image.png](/.attachments/image-7beddcd0-7f09-4bb9-946d-3f57fb11a3f1.png)
```
C:\Packages\Plugins\Microsoft.Azure.ChangeTrackingAndInventory.ChangeTracking-Windows\<version>\agent\resources\CTResourceApplication.exe SoftwareInventory
```

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#d7eaf8">

**Important**
The switch SoftwareInventory is case sensitive. 
For Azure VM, when investigating software inventory issues, we must collect output of CTResourceApplication.exe + CT extension logs + AMA agent {agenttroubleshoooter.exe} output for analysis.
</div>

</details>

<details closed>
<summary><b>Linux</b></summary>
<div style="margin:25px">


**Distros with dpkg:**  dpkg-query -W -f 'Name:${Package}\nDescription:${Description}\nMaintainer:${Maintainer}\n'Unknown';4\nSize:${Installed-Size}\nVersion:${Version}\nStatus:${Status}\n${db:Status-Status}\nArch:${Architecture}\n\n'

**Distros with rpm:** rpm -q -a --queryformat="Name:%{NAME}\nSummary:%{SUMMARY}\nPackager:%{PACKAGER}\nInstallationTime:%{INSTALLTIME}\nSize:%{SIZE}\nVersion:%{EPOCH}:%{VERSION}-%{RELEASE}\ninstalled\nArch:%{ARCH}\n\n" | sed "s/(none)/0/g"
dpkg-query -W -f 'Name:${Package}\nDescription:${Description}\nMaintainer:${Maintainer}\n'Unknown';4\nSize:${Installed-Size}\nVersion:${Version}\nStatus:${Status}\n${db:Status-Status}\nArch:${Architecture}\n\n'

</details>





# Logs CSS Should collect for CT Extension Analysis
The logs collection depends on what are we investigating. Below is general guideline for CT v2 extension specific logs but we should always capture output of agenttroubleshooter.exe 

<details closed>
<summary><b>Windows</b></summary>
<div style="margin:25px">
 
Share all the files starting with cta_windows* from the following directories:
**Azure VM:**
```C:\WindowsAzure\Logs\Plugins\Microsoft.Azure.ChangeTrackingAndInventory.ChangeTracking-Windows\{extension version}```

![image.png](/.attachments/image-d982493e-19b5-4183-af6c-29c7f0be64ae.png)

**Azure Arc:**
```C:\Packages\Plugins\Microsoft.Azure.ChangeTrackingAndInventory.ChangeTracking-Windows\{extension version}```

</details>

<details closed>
<summary><b>Linux</b></summary>
<div style="margin:25px">
 
-Share all the files starting with cta_linux* from path /var/log/azure/Microsoft.Azure.ChangeTrackingAndInventory.ChangeTracking-Linux 

![image.png](/.attachments/image-5b40a04a-5dd1-45d2-a374-a5ef1a76d385.png)

</details>



# Manually restart Extension Agent
 
<details closed>
<summary><b>Windows</b></summary>
<div style="margin:25px">
- From command prompt run C:\Packages\Plugins\Microsoft.Azure.ChangeTrackingAndInventory.ChangeTracking-Windows\2.6.0.0>cta_windows_handler.exe disable

- Wait for few minutes and you will observe the processes will disappear in task manager
change_tracking_agent_windows_amd64.exe
change_tracking_service.exe

- From command prompt run C:\Packages\Plugins\Microsoft.Azure.ChangeTrackingAndInventory.ChangeTracking-Windows\2.6.0.0>cta_windows_handler.exe enable
</details>


<details closed>
<summary><b>Linux</b></summary>
<div style="margin:25px">

- Go to /var/lib/waagent/Microsoft.Azure.ChangeTrackingAndInventory.ChangeTracking-Linux-{extension-version}
- As high privilege user run  ./cta_linux_handler disable
- Wait for few minutes until following processes are finished
/usr/sbin/changetracking/changetracking
/opt/microsoft/changetracking/change_tracking_agent_linux_amd64

- To enable extension back ./cta_linux_handler enable 
</details>




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



# Known Issues
 

 

