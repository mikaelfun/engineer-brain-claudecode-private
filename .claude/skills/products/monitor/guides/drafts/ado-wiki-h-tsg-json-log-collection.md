---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Azure Monitor Agent (AMA) for Windows/Troubleshooting Guides/Troubleshooting AMA - Windows JSON Log Collection"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FAzure%20Monitor%20Agent%20(AMA)%20for%20Windows%2FTroubleshooting%20Guides%2FTroubleshooting%20AMA%20-%20Windows%20JSON%20Log%20Collection"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::
Note: All IPs and machine names in this page are from test lab and don't compromise any Pii data.

**Troubleshooting document for JSON Logs**  

[[_TOC_]]

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:100%;border-radius:10px;background-color:#FF99C1">

**Please Read**

Starting Agent versions from March'2024 release (AMA Windows 1.25.0 and AMA Linux 1.31.0), There is a breaking change from public preview to GA transition of this feature, This feature now automatically parse JSON into columns with matching tags in your custom table in Log Analytic was added. It does not push data in RawData (This is not required now) column anymore like text logs. The custom table should have schema similar to JSON tags. amaparser is used in td-agent.conf to carry out this parsing. The UI capability of Data collection rule for this data type still hard codes the schema to TimeGenerated and RawData column in DCR json, Please use ARM template from public doc with your table schema so that the parsing works as expected. https://learn.microsoft.com/azure/azure-monitor/agents/data-collection-log-json?tabs=arm#incoming-stream </div>

# Update SAP

If this is the primary issue then make sure the Support Topic Path is set to: 

 **Azure\Data Collection Rules (DCR) and Agent (AMA)\Issues related to custom logs and IIS logs(preview)**
# Official Public Documentation 

Here is the link to documentation:
https://learn.microsoft.com/azure/azure-monitor/agents/data-collection-log-json?tabs=portal

The above article describes how to configure the collection of JSON logs with the Azure Monitor agent. Many applications log information to JSON log files instead of standard logging services such as Windows Event log or Syslog. The main idea here is to collect JSON logs like how we collect file based text logs and then apply kql transformation on RawData field within DCR to simplify the values in different columns. **(This is now changed in GA and amaparser does this work, Please look at the note above in this doc)**


# Pre-requisites for collecting JSON logs

[Here are the prerequisites documented:] https://learn.microsoft.com/azure/azure-monitor/agents/data-collection-log-json?tabs=portal#prerequisites

- Must have LA workspace where you have at least contributor rights.
- Must create Data Collection Endpoint. https://learn.microsoft.com/azure/azure-monitor/essentials/data-collection-endpoint-overview?tabs=portal#create-a-data-collection-endpoint And if there is private link involved, the DCE should be added there too. For that, Please follow this: https://learn.microsoft.com/azure/azure-monitor/logs/private-link-configure#connect-azure-monitor-resources    
- Permissions to create Data Collection Rule objects in the workspace.
- Supported JSON log file as described here: https://learn.microsoft.com/azure/azure-monitor/agents/data-collection-log-json?tabs=portal#json-file-requirements-and-best-practices

# Steps to Enable JSON Log Collection

1. Create a custom table using: https://learn.microsoft.com/azure/azure-monitor/agents/data-collection-log-json?tabs=portal#json-file-requirements-and-best-practices

2. Create/Edit DCR for text logs with DCE: https://learn.microsoft.com/azure/azure-monitor/agents/data-collection-log-json?tabs=portal#create-a-data-collection-rule-for-a-json-file

# Scoping Question & Troubleshooting

### Scenario: JSON logs Configured via AMA are not being received at Log Analytics Workspace. 
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

Ensure that Custom tables with a suffix _CL is created successfully. If the table is not created , you can check if there were any errors creating table.

Check if there are any JSON logs received in the last 2 days


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
<details><summary>Is the Data Collection Rule created with JSON logs configuration?</summary>

Verify in ASC if Data Collection rule is created 

in ASC, navigate Microsoft.insights >> dataCollectionRules >> {DCR Name} 

Once DCR is selected, Resource Explorer view will be loaded 

![image.png](/.attachments/image-3562bd61-db72-45ab-97e7-440675659b45.png)

![image.png](/.attachments/image-8e8892d3-b736-4534-80b4-76ab76f63134.png)

![image.png](/.attachments/image-ebc80cac-b7e3-4790-bff2-77842f0263ed.png)

![image.png](/.attachments/image-d4fbad6b-2d9f-4592-af1d-7eb1928dd250.png)

</details>

>
>
<details><summary>Did DCR configuration reach to the machine with DCE configured?</summary>

Check the DCR json within machine to ensure if JSON log config arrived with DCE: 

Path: C:\WindowsAzure\Resources\AMADataStore.<VM_Name>\mcs\configchunks\<abc>.json

you will see something like this which contains JSON path info, DCE info and Tranformkql. 

{"dataSources":[{"configuration":{"filePatterns":["C:\\JavaLogs\\*.json"],"format":"text","settings":{"text":{"recordStartTimestampFormat":"yyyy-MM-ddTHH:mm:ssK"}}},"id":"JSONWindows_CL","kind":"logFile","streams":[{"stream":"Custom-JSONWindows_CL"}],"sendToChannels":["gigl-dce-dd80d9ac94c54be0a669e2ec275df05f"]}],"channels":[{"endpoint":"https://acf9ca28-a1f5-4c52-b80c-5a0c6b1ce1cf.ods.opinsights.azure.com","tokenEndpointUri":"https://centralus.handler.control.monitor.azure.com/subscriptions/db9ea044-d905-4d9d-886f-3fce36ca8ecd/resourceGroups/sahil-rg/providers/Microsoft.Compute/virtualMachines/Sahil-WinVM/agentConfigurations/dcr-7920c580b6cb4a879d5e40ba366a3d7c/channels/ods-acf9ca28-a1f5-4c52-b80c-5a0c6b1ce1cf/issueIngestionToken?platform=windows&api-version=2022-06-02","id":"ods-acf9ca28-a1f5-4c52-b80c-5a0c6b1ce1cf","protocol":"ods"},{"endpointUriTemplate":"https://dceforjsonlog-rnwt.centralus-1.ingest.monitor.azure.com/dataCollectionRules/dcr-7920c580b6cb4a879d5e40ba366a3d7c/streams/<STREAM>?api-version=2021-11-01-preview","tokenEndpointUri":"https://centralus.handler.control.monitor.azure.com/subscriptions/db9ea044-d905-4d9d-886f-3fce36ca8ecd/resourceGroups/sahil-rg/providers/Microsoft.Compute/virtualMachines/Sahil-WinVM/agentConfigurations/dcr-7920c580b6cb4a879d5e40ba366a3d7c/channels/gigl-dce-dd80d9ac94c54be0a669e2ec275df05f/issueIngestionToken?platform=windows&api-version=2022-06-02","id":"gigl-dce-dd80d9ac94c54be0a669e2ec275df05f","protocol":"gig"}]} 

</details>

>
>
<details><summary>Are the JSON logs being actively written to the JSON files configured?</summary>

Verify that the JSON logs are being actively written.

AMA will only collect new content written to the log being tracked. So, if no new content is being added, AMA will not collect any logs.
If you are experimenting with the JSON logs collection feature, you can use the following script to generate logs. Save script as GenerateCustomLogs.ps1 and then execute from powershell.


```
# This script writes a new log entry at the specified interval indefinitely.
# Usage:
# .\GenerateCustomLogs.ps1 [interval to sleep]
#
# Press Ctrl+C to terminate script.
#
# Example:
# .\ GenerateCustomLogs.ps1 5

$logFolder = "c:\\JavaLogs"
if (!(Test-Path -Path $logFolder))
{
    mkdir $logFolder
}

$logFileName = "TestLog-$(Get-Date -format yyyyMMddhhmm).json"
do
{
    $count++
    $randomContent = New-Guid
    $logRecord = "{`"Time`":`"$(Get-Date -format yyyy-MM-ddThh:mm:sss.fffffff)Z`",`"RecordNumber`":$count,`"RandomContent`":`"$randomContent`"}"
    Echo $logRecord
    $logRecord | Out-File "$logFolder\\$logFileName" -Encoding utf8 -Append
    Sleep 10
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



- In td-agent.conf file: C:\WindowsAzure\Resources\AMADataStore.<VM_Name>\mcs\fluentbit\td-agent.conf , verify that we have the JSON log file path.  

![image.png](/.attachments/image-a617b213-fef8-4ad4-ae9d-8c97f6c05da5.png)

- Fluentbit log path for any errors: C:\WindowsAzure\Resources\AMADataStore.<VM_Name>\mcs\fluentbit\Logs\fluentbit.log

- MAEventTable.tsf path for any errors: C:\WindowsAzure\Resources\AMADataStore.<VM_Name>\Tables\MAEventTable.tsf

You can convert to read it in csv format, the log collection script does that.  You can use the below command too. 

C:\Packages\Plugins\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent\<version-number>\Monitoring\Agent\table2csv.exe C:\WindowsAzure\Resources\AMADataStore.<virtual-machine-name>\Tables\MaEventTable.tsf

- For better troubleshooting enable debug logging for fluentbit, Make the below change in log level from info to debug in td-agent.conf to enable debug logs for fluentbit and then restart AMA. You should be then able to see debug level logs in C:\WindowsAzure\Resources\AMADataStore.<VM_Name>\mcs\fluentbit\Logs\fluentbit.log

https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/766329/How-to-Restart-the-Azure-Monitor-Agent-Windows

![image.png](/.attachments/image-165a5adc-5730-4ef3-b721-4d7c0c0dcc54.png)




# Logs CSS must collect
If everything is setup as expected but still no JSON logs are showing up in log analytics (in <YourCustomLog>_CL table), collect AMA Agent logs with debug enabled for fluentbit as mentioned above.

Use Agent Troubleshooter: https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/909866/How-To-run-AgentTroubleshooter.exe-for-AMA-Windows

Discuss with SMEs. If we need to engage PG to further look into this, get the approval from SMEs and raise an IcM via ASC. Also give PG access to the logs when it is acknowledged.

https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/493205/How-to-open-a-CRI-(ICM)-in-Azure-Support-Center

https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/750127/Sharing-Files-internally-using-DTM

|**Scenario** | **Escalation Path** |
|--|--|
| **Windows AMA scenarios**:<br>1. Installing and uninstalling Agent<br> 2. No heartbeat for Agent<br>3. Missing or no data<br>4. Issue collecting text, JSON and IIS logs | Azure Monitor Data Collection/AMA Windows |
|**DCR scenarios:** <br>1. Error creating, deleting DCR<br>2. Need help with creating ,associating or viewing DCR | Azure Monitor Control Service (AMCS)/Triage
