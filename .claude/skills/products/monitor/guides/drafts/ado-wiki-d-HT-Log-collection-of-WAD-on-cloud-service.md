---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Windows Azure Diagnostics (WAD)/How-To/HT: Log collection of WAD on cloud service"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FWindows%20Azure%20Diagnostics%20(WAD)%2FHow-To%2FHT%3A%20Log%20collection%20of%20WAD%20on%20cloud%20service"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::
[[_TOC_]]

# Description
---
This article describes the log collection process in cloud service that we need collect them when we would analyze the issue with WAD on cloud service or escalate any issue to WAD product team via IcM.

# Connect to Cloud service through RDP
---
We have two type of Cloud service: cloud service (classic) and cloud service (extended support). Cloud Services (classic) is now deprecated for new customers and will be retired on August 31st, 2024 for all customers.
To collect logs, we need connect to cloud service through RDP firstly:
1. go to cloud service, add new **Remote Desktop** by specifying required parameters as below:
![image.png](/.attachments/image-0539ec2a-fab4-43d8-82f8-d26fd9fa6323.png)

2. Once RDP configuration is created, go to **Roles and Instances**, click the problem web role or worker role, then click **Connect** to login:
![image.png](/.attachments/image-f7649ebb-0575-4108-8769-90649fc20110.png)

3. Once logged in, you can then collect logs like other windows VM. For RDP configuration details, see [RDP configuration for cloud service (classic)](https://learn.microsoft.com/azure/cloud-services/cloud-services-role-enable-remote-desktop-new-portal) and [RDP configuration for cloud service (extended support)](https://learn.microsoft.com/azure/cloud-services-extended-support/enable-rdp)

# Log collection
---

## Guest agent collection tool
---

You can collect guest agent related logs/configuration with the following steps, please note it won't include WAD related logs/configuration:
1. cd D:\Packages\GuestAgent
1. run: .\CollectGuestLogs.exe
1. one .zip file will be created under D:\Packages\GuestAgent, please ask customer to share it with us.

## WAD configuration and logs
---

Azure logs - guest agent, WAD logs:
- C:\Logs\Plugins\Microsoft.Azure.Diagnostics.PaaSDiagnostics\<version>\ **(they are collected through above Guest agent collection tool, logs are located at <zip file name>\RuntimeAndAgent\Plugins\Microsoft.Azure.Diagnostics.PaaSDiagnostics\ <version>\)**
- C:\Resources\Directory\ <CloudServiceDeploymentID>.<RoleName>.DiagnosticStore\WAD0107\Configuration\MonAgentHost.<seq_num>.log
- C:\Logs\AppAgentRuntime.log and C:\Logs\WaAppAgent.log **(they are collected through above Guest agent collection tool, logs are located at <zip file name>\RuntimeAndAgent\)**

Deployment logs:
- Under C:\Config, find latest 2 deployment logs: [deploymentid]. [deploymentid].[rolename]_IN_0.x.xml

MA configuration:
- C:\Resources\Directory\{role}.DiagnosticStore\WAD0107\Configuration\MaConfig.xml

WAD configuration:
- C:\Packages\Plugins\Microsoft.Azure.Diagnostics.PaaSDiagnostics\ <version>\config.txt
- C:\Packages\Plugins\Microsoft.Azure.Diagnostics.PaaSDiagnostics\ <version>\manifest.xml

MaEventTable.csv:
```
      i.      Locate table2csv.exe � Should be here D:\Packages\Plugins\Microsoft.Azure.Diagnostics.PaaSDiagnostics\<version>\Monitor\x64\table2csv.exe
      ii.      Find the location of table file (maeventtable.tsf). Path will be something like : C:\Resources\Directory\<number>.WebRole1.DiagnosticStore\WAD0107\Tables
      iii.      In  elevated mode of command prompt, cd to above path (ii)
      iv.      In the same cmd, execute <PATH>\table2csv.exe maeventtable.tsf
      v.      A new file maeventtable.csv will get created in the same path as corresponding tsf
      vi.      Share the csv with us.
```

MaQosEvent.csv:
```
	  i.      Locate table2csv.exe � Should be here D:\Packages\Plugins\Microsoft.Azure.Diagnostics.PaaSDiagnostics\<version>\Monitor\x64\table2csv.exe
      ii.      Find the location of table file (MaQosEvent.tsf). Path will be something like : C:\Resources\Directory\<number>.WebRole1.DiagnosticStore\WAD0107\Tables
      iii.      In  elevated mode of command prompt, cd to above path (ii)
      iv.      In the same cmd, execute <PATH>\table2csv.exe MaQosEvent.tsf
      v.      A new file MaQosEvent.csv will get created in the same path as corresponding tsf
      vi.      Share the csv with us.
```

Processes:

1. Open Powershell window and run as administrator;
1. run command and share with us process.txt: tasklist > process.txt

