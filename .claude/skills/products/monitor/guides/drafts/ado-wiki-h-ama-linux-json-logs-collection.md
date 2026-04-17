---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Azure Monitor Agent (AMA) for Linux/Troubleshooting Guides/Troubleshooting AMA - Linux JSON Logs Collection"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor+Agents%2FAgents%2FAzure+Monitor+Agent+(AMA)+for+Linux%2FTroubleshooting+Guides%2FTroubleshooting+AMA+Linux+JSON+Logs+Collection"
importDate: "2026-04-05"
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

The above article describes how to configure the collection of JSON logs with the Azure Monitor agent. Many applications log information to JSON files instead of standard logging services such as Windows Event log or Syslog. The main idea here is to collect JSON logs like how we collect file based text logs and then apply kql transformation on RawData field within DCR to simplify the values in different columns. **(This is now changed in GA and amaparser does this work, Please look at the note above in this doc)  


# Pre-requisites for collecting JSON logs

[Here are the prerequisites documented:]https://learn.microsoft.com/azure/azure-monitor/agents/data-collection-log-json?tabs=portal#prerequisites

- Must have Log Analytics workspace where you have at least contributor rights.
- Must create Data Collection Endpoint. https://learn.microsoft.com/azure/azure-monitor/essentials/data-collection-endpoint-overview?tabs=portal#create-a-data-collection-endpoint And if there is private link involved, the DCE should be added there too. For that, Please follow this: https://learn.microsoft.com/azure/azure-monitor/logs/private-link-configure#connect-azure-monitor-resources    
- Permissions to create Data Collection Rule objects in the workspace.
- Supported JSON log file as described here: https://learn.microsoft.com/azure/azure-monitor/agents/data-collection-log-json?tabs=portal#json-file-requirements-and-best-practices
#Steps to Enable JSON log collection 

1. Create a custom table using: https://learn.microsoft.com/azure/azure-monitor/agents/data-collection-log-json?tabs=portal#json-file-requirements-and-best-practices

2. Create/Edit DCR for JSON logs with DCE: https://learn.microsoft.com/azure/azure-monitor/agents/data-collection-log-json?tabs=portal#create-a-data-collection-rule-for-a-json-file



#Scoping Questions and Troubleshooting:

### Scenario: JSON logs Configured via AMA are not being received at Log Analytics Workspace. 
</div>
<details><summary>Is the AMA extension installed successfully and sending Heartbeats?</summary>
Verify if AMA extension is installed successfully and sending Heartbeats.

Use the following query to verify that there is Heartbeat from Agent


```
Heartbeat
| where TimeGenerated > ago(24h)
| where Computer has "<computer name>"
| project TimeGenerated, Category, Version
| order by TimeGenerated desc
```

If you see issues with AMA extension and Heartbeat data, please follow this guide: 
https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/620143/Troubleshooting-Azure-Monitor-Agent-(AMA)-for-Linux

</details>

>
>

<details><summary>Is the custom table created and had data at any point?</summary>
Ensure that Custom tables with a suffic _CL is created successfully. If the table is not created , you can check if there were any errors creating table.

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

In ASC, navigate Microsoft.insights >> dataCollectionendpoints 

</details>

>
>

<details><summary>Is the Data Collection Rule created with JSON logs configuration?</summary>

Verify in ASC if Data Collection rule is created

in ASC, navigate Microsoft.insights >> dataCollectionRules >> {DCR Name} 

Once DCR is selected, Resource Explorer view will be loaded 

![image.png](/.attachments/image-78f3a37d-eebb-496d-92d5-24e9666e2bed.png)

![image.png](/.attachments/image-77e6a804-9d6e-4b02-997d-faf3ce0eb343.png)

![image.png](/.attachments/image-b03d27b8-711c-4029-8b04-77ad7d39ee03.png)

![image.png](/.attachments/image-07c629db-584b-4c47-8ab6-e1293fab26e1.png)

</details>

>
>

<details><summary>Did DCR configuration reach to the machine with DCE configured?</summary>

Check the DCR json within machine to ensure if JSON log config arrived with DCE: 

Path: /etc/opt/microsoft/azuremonitoragent/config-cache/configchunks/<abc>.json

![image.png](/.attachments/image-ad7cb918-7bb2-4372-9f64-85d0a168e29c.png)

</details>

>
>

<details><summary>Are the JSON logs being actively written to the JSON files configured?</summary>

Verify that the JSON logs are being actively written.

AMA will only collect new content written to the log being tracked. So, if no new content is being added, AMA will not collect any logs.

If you are experimenting, you can make new entries in the JSON file via Vi editor.
</details>

>
>

**Other Files to look at inside machine**


You will see the JSON log config in /etc/opt/microsoft/azuremonitoragent/config-cache/fluentbit/td-agent.conf

![image.png](/.attachments/image-b33fb42b-780a-43aa-a167-5a4fdf056b41.png)

Further check for errors in the path /var/opt/microsoft/azuremonitoragent/log and look for files mdsd.* and fluentbit.log 

For better troubleshooting enable debug logging for fluentbit, Make the below change in log level from info to debug in td-agent.conf to enable debug logs for fluentbit and then restart AMA.  

https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/766334/How-to-restart-the-Azure-Monitor-Agent-Linux

![image.png](/.attachments/image-bf2e0f25-ba69-4e67-9ce5-a22de7e17fae.png)


You will see such debug entries in fluentbit.log which shows file is being tailed and scanned. 


![image.png](/.attachments/image-01bc181c-d935-4626-bbd6-03d78d5e4a55.png)


# Logs CSS must collect

If everything is setup as expected but still no JSON logs are showing up in log analytics (in <YourCustomLog>_CL table), collect AMA Agent logs with debug enabled for fluentbit as mentioned above.  

https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/620137/How-to-use-troubleshooting-Tool-for-Azure-Monitor-Linux-Agent

- Discuss with SMEs in Case Bash. 
- If we need to engage PG to further look into this, get the approval from SMEs and raise an IcM via ASC.

https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/493205/How-to-open-a-CRI-(ICM)-in-Azure-Support-Center  
https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/750127/Sharing-Files-internally-using-DTM

|**Scenario** | **Escalation Path** |
|--|--|
| **Linux AMA Scenarios:**<br>1. Installing and uninstalling Agent<br> 2. No heartbeat for Agent<br>3. Missing or no data<br> 4. Missing Text/JSON Logs<br>5. Rsyslog and hardening issues | Azure Monitor Data Collection/AMA Linux |  
|**DCR scenarios:** <br>1. Error creating, deleting DCR<br>2. Need help with creating ,associating or viewing DCR | Azure Monitor Control Service (AMCS)/Triage|
