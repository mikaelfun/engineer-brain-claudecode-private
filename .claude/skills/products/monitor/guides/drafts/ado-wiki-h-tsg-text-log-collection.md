---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Azure Monitor Agent (AMA) for Windows/Troubleshooting Guides/Troubleshooting AMA - Windows Text Log Collection"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FAzure%20Monitor%20Agent%20(AMA)%20for%20Windows%2FTroubleshooting%20Guides%2FTroubleshooting%20AMA%20-%20Windows%20Text%20Log%20Collection"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::
Note: All IPs and machine names in this page are from test lab and don't compromise any Pii data.

**Troubleshooting document for custom text Logs**  

[[_TOC_]]
<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:100%;border-radius:10px;color:black;background-color:#efd9fd">

**Note** <br>
This TSG is specific to custom text logs collected by the AMA on Windows machines.  **Please do not complete the steps in this TSG before verifying that the customer is collecting the log in question using the AMA on a Windows machine.**  This TSG is not applicable to any issue with the legacy HTTP data collector API or the DCR based ingestion API.
   </div>
# Update SAP

If this is the primary issue then make sure the Support Topic Path is set to: 

 **Azure/Data Collection Rules (DCR) and Agent (AMA)/I created a DCR but the data is not in the Log Analytics Table/No Text custom logs in Log Analytics Workspace**
# Official Public Documentation 

Here is the link to documentation:
https://docs.microsoft.com/azure/azure-monitor/agents/data-collection-text-log

The above article describes how to configure the collection of file-based text logs with the Azure Monitor agent. Many applications log information to text files instead of standard logging services such as Windows Event log or Syslog.


# Pre-requisites for collecting text logs

[Here are the prerequisites documented:](https://docs.microsoft.com/azure/azure-monitor/agents/data-collection-text-log#prerequisites) 

- Must have LA workspace where you have at least contributor rights.
- Must create Data Collection Endpoint. https://learn.microsoft.com/azure/azure-monitor/essentials/data-collection-endpoint-overview?tabs=portal#create-a-data-collection-endpoint And if there is private link involved, the DCE should be added there too. For that, Please follow this: https://learn.microsoft.com/azure/azure-monitor/logs/private-link-configure#connect-azure-monitor-resources    
- Permissions to create Data Collection Rule objects in the workspace.
- Supported Text log file as described here: https://learn.microsoft.com/azure/azure-monitor/agents/data-collection-text-log?tabs=portal#prerequisites

# Steps to Enable Text Log Collection

1. Create a custom table using: https://learn.microsoft.com/azure/azure-monitor/agents/data-collection-text-log?tabs=portal#create-a-custom-table

2. Create/Edit DCR for text logs with DCE: https://learn.microsoft.com/azure/azure-monitor/agents/data-collection-text-log?tabs=portal#create-a-custom-table

# Scoping Question & Troubleshooting

### Scenario: Text logs Configured via AMA are not being received at Log Analytics Workspace. 
</div>

<details><summary>Is the AMA extension installed successfully and sending Heartbeats?</summary>


Use the following query to verify that there is Heartbeat from Agent


```
Heartbeat
| where TimeGenerated > ago(24h)
| where Computer has "<computer name>"
| project TimeGenerated, Category, Version
| order by TimeGenerated desc
```

If you see issues with AMA extension and Heartbeat data, please follow this guide: https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/620123/Troubleshooting-Azure-Monitor-Agent-(AMA)-for-Windows
For Heartbeat Specific: https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/820689/Troubleshooting-Windows-AMA-Missing-Heartbeats
</details>

>
>

<details><summary>Is the custom table created and had data at any point?</summary>

Ensure that Custom tables with a suffic _CL is created successfully. If the table is not created , you can check if there were any errors creating table.

Check if there are any custom logs received in the last 2 days


```
<YourCustomLog>_CL
| where TimeGenerated > ago(48h)
| order by TimeGenerated desc
```

</details>

>
>
<details><summary>Is the Data Collection endpoint created?</summary>

Verify in ASC if Data collection endpoint is created.

in ASC, navigate Microsoft.insights >> dataCollectionendpoints 

</details>

>
>
<details><summary>Is the Data Collection Rule created with Text logs configuration?</summary>

Verify in ASC if Data Collection rule is created 

in ASC, navigate Microsoft.insights >> dataCollectionRules >> {DCR Name} 

Once DCR is selected, Resource Explorer view will be loaded 

![stream.png](/.attachments/stream-1eff2364-acc5-4d9b-8cff-c66be8ef52e7.png)

![image.png](/.attachments/image-9c19fce9-75ab-485f-9c11-d5f13b538076.png)

![image.png](/.attachments/image-b2ea7a4e-2d54-40ae-a67b-781aa12b69a0.png)

</details>

>
>
<details><summary>Did DCR configuration reach to the machine with DCE configured?</summary>

Check the DCR json within machine to ensure if text log config arrived with DCE: 

Path: C:\WindowsAzure\Resources\AMADataStore.<VM_Name>\mcs\configchunks\<abc>.json

![image.png](/.attachments/image-2dc383ea-9d5d-4c3d-b80c-8e489e01d428.png)

</details>

>
>
<details><summary>Are the text logs being actively written to the text files configured?</summary>

Verify that the custom logs are being actively written.

AMA will only collect new content written to the log being tracked. So, if no new content is being added, AMA will not collect any logs.
If you are experimenting with the custom logs collection feature, you can use the following script to generate logs. Save script as GenerateCustomLogs.ps1 and then execute from powershell.


```
# This script writes a new log entry at the specified interval indefinitely.
# Usage:
# .\GenerateCustomLogs.ps1 [interval to sleep]
#
# Press Ctrl+C to terminate script.
#
# Example:
# .\ GenerateCustomLogs.ps1 5

param (
    [Parameter(Mandatory=$true)][int]$sleepSeconds
)

$logFolder = "c:\\JavaLogs"
if (!(Test-Path -Path $logFolder))
{
    mkdir $logFolder
}

$logFileName = "TestLog-$(Get-Date -format yyyyMMddhhmm).log"
do
{
    $count++
    $randomContent = New-Guid
    $logRecord = "$(Get-Date -format s)Z Record number $count with random content $randomContent"
    $logRecord | Out-File "$logFolder\\$logFileName" -Encoding utf8 -Append
    Sleep $sleepSeconds
}
while ($true)

``
`
```
</details>

>
>


>
>

**Other Files to look at inside machine**



- In td-agent.conf file: C:\WindowsAzure\Resources\AMADataStore.<VM_Name>\mcs\fluentbit\td-agent.conf , verify that we have the text file path.  

![image.png](/.attachments/image-fa7bbb77-efac-4f04-b145-d960d1b3e86b.png)

- Fluentbit log path for any errors: C:\WindowsAzure\Resources\AMADataStore.<VM_Name>\mcs\fluentbit\Logs\fluentbit.log

- MAEventTable.tsf path for any errors: C:\WindowsAzure\Resources\AMADataStore.<VM_Name>\Tables\MAEventTable.tsf

You can convert to read it in csv format, the log collection script does that.  You can use the below command too. 

C:\Packages\Plugins\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent\<version-number>\Monitoring\Agent\table2csv.exe C:\WindowsAzure\Resources\AMADataStore.<virtual-machine-name>\Tables\MaMetricsExtensionEtw.tsf


You will see a table for that custom log id which you see in td-agent.conf with raw data once it starts writing the logs. 

For e.g in the above case: 
C:\WindowsAzure\Resources\AMADataStore.AMATextlogWikiWinVM\Tables\c15151907158480815706_15888271637618063960.tsf

Convert it into .csv using above command to see its content. 

- For better troubleshooting enable debug logging for fluentbit, Make the below change in log level from info to debug in td-agent.conf to enable debug logs for fluentbit and then restart AMA. You should be then able to see debug level logs in C:\WindowsAzure\Resources\AMADataStore.<VM_Name>\mcs\fluentbit\Logs\fluentbit.log 

https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/766329/How-to-Restart-the-Azure-Monitor-Agent-Windows

![image.png](/.attachments/image-87e352e6-3c66-4287-8038-f2bc5bb40223.png)




# Logs CSS must collect
If everything is setup as expected but still no custom logs are showing up in log analytics (in <YourCustomLog>_CL table), collect AMA Agent logs with debug enabled for fluentbit as mentioned above.


New Troubleshooter: https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/909866/How-To-run-AgentTroubleshooter.exe-for-AMA-Windows

Discuss with SMEs. If we need to engage PG to further look into this, get the approval from SMEs and raise an IcM via ASC. Also give PG access to the logs when it is acknowledged.

https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/493205/How-to-open-a-CRI-(ICM)-in-Azure-Support-Center

https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/750127/Sharing-Files-internally-using-DTM

|**Scenario** | **Escalation Path** |
|--|--|
| **Windows AMA scenarios**:<br>1. Installing and uninstalling Agent<br> 2. No heartbeat for Agent<br>3. Missing or no data<br>4. Issue collecting text or IIS logs | Azure Monitor Data Collection/AMA Windows |
|**DCR scenarios:** <br>1. Error creating, deleting DCR<br>2. Need help with creating ,associating or viewing DCR | Azure Monitor Control Service (AMCS)/Triage|
