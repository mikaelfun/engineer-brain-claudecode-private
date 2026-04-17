---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Azure Monitor Agent (AMA) for Linux/Troubleshooting Guides/Azure Monitor Linux Agent Performance Counter Troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor+Agents%2FAgents%2FAzure+Monitor+Agent+(AMA)+for+Linux%2FTroubleshooting+Guides%2FAzure+Monitor+Linux+Agent+Performance+Counter+Troubleshooting"
importDate: "2026-04-05"
type: troubleshooting-guide
---
:::template /.templates/Common-Header.md
:::
**Troubleshooting document for Linux AMA Agent Missing Performance Counters**  

**Azure Monitor Linux Agent Troubleshooter**

[[_TOC_]]

# Where can I find the Azure Monitor Agent(AMA) Documentation.

Here are the links to AMA Agent documentation. <br>
[Collect events and performance counters from virtual machines with Azure Monitor Agent](https://learn.microsoft.com/azure/azure-monitor/agents/data-collection-rule-azure-monitor-agent?tabs=portal)<br>
[Overview of AMA Agent:](https://docs.microsoft.com/azure/azure-monitor/agents/azure-monitor-agent-overview)<br>
[Limitations:](https://docs.microsoft.com/azure/azure-monitor/agents/azure-monitor-agent-overview#current-limitations)<br>
[Installation:](https://learn.microsoft.com/azure/azure-monitor/agents/azure-monitor-agent-manage?tabs=azure-portal)<br>
[Comparison of all the agents](https://docs.microsoft.com/azure/azure-monitor/agents/agents-overview)

[Troubleshooting Azure Monitor Agent (AMA) for Linux](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/620143/Troubleshooting-Azure-Monitor-Agent-(AMA)-for-Linux)

# Is there a FAQ for AMA Agent
  AMA FAQ can be found [here](https://docs.microsoft.com/azure/azure-monitor/faq#azure-monitor-agent-preview) 

#Saving Time
It is important to collect the AMA Logs data at the very beginning of a case.  This can save time and expedite the troubleshooting process.

[How to use troubleshooting Tool for Azure Monitor Linux Agent](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/620137/How-to-use-troubleshooting-Tool-for-Azure-Monitor-Linux-Agent)
Choose option **L** to collect the logs

>
**Do this NOW!**

#Scenario
This TSG is designed to assist with troubleshooting Azure Monitor Linux Agent Performance counter collection targeted at the Perf table in a Log Analytics Workspace.

#Update SAP
- If this is the primary issue then make sure the Support Topic Path is set to
**Azure / Data Collection Rules (DCR) and Agent (AMA) / I created a DCR but the data is not in the Log Analytics Table / No Linux Perf Counters in Log Analytics Workspace**

#Scoping questions

<details><summary>Is Performance data really missing?</summary>

> Document the query the customer is using to find the Performance data.
> Ensure that the query is for the **Perf** table in the log analytics workspace
> Also, use a simple query to help identify if there is any performance data in the Perf table
> 
``` csharp
Perf
| where Computer contains "ServerName"
| order by TimeGenerated
```

>
> Try finding perf data using the resource ID of the resource.
``` csharp
Perf
| where ResourceId contains "ResourceId"
| order by TimeGenerated
```

</details>

>

<details><summary>Is the Agent Heartbeating?</summary>


> Query Log Analytics Heartbeat table for the agent to see if it is heartbeating.
> If results are found, validate the Category as this will help determine the Type of agent that sent the Heartbeat.  
> A **Category** of **Direct Agent** indicates the **OMS** sent the Heartbeat.
> A **Category** of **Azure Monitor Agent** indicates, the **AMA** sent the Heartbeat

``` csharp
//This query will check for heartbeat from a specific server within the last 10 minutes
//If this returns a result, then the server is heartbeating just fine
Heartbeat 
| where Computer contains "ServerName"
| where Category contains "Azure Monitor Agent"
| where TimeGenerated > ago(10m)
| order by TimeGenerated
```

> If the Agent isn't heartbeating, refer to the missing Heartbeat TSG
> [Troubleshooting Linux AMA Missing Heartbeats](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1001340/Troubleshooting-Linux-AMA-Missing-Heartbeats)


</details>

>

<details><summary>What is the Linux Server Name and Resource Id?</summary>

> **Server Name**
>> Server Name can be found in the **Azure Monitor Linux Agent Troubleshooter**, in the **amalinux.out** file, documented as **Hostname:**

> **Resource ID**
>> **Resource ID** can be found in **ASC->Resource Explorer->Resource Provider->Microsoft.Compute->virutalMachines-><VM Name>->V2 Properties->VM Base Properties->Resource Uri**
or if ARC
>> **Resource ID** can be found in **ASC->Resource Explorer->Resource Provider->Microsoft.HybridCompute->Machines-><VM Name>->Data->Resource Uri**
>
>> **Resource ID** can be found in the **Azure Portal->Virtual Machines-><Virtual Machine Name>->Properties->Resource Id**
>> **Resource ID** can be found in the **Azure Monitor Linux Agent Troubleshooter**, in the **amalinux.out** file, documented as **resourceId:**

</details>

>

<details><summary>What Data Collection Rule(s) is the Agent associated with?</summary>

>
> Use the following TSG to determine if a **Data Collection Rule** and a **Data Collection Rule Association** exists for this Agent
> [How to verify in ASC that a DCR is created and associated with VM](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/817897/How-to-verify-in-ASC-that-DCR-is-created-and-associated-with-VM)
>

</details>

>

<details><summary>What Data Collection Endpoint (if any) is the Agent associated with?</summary>

>
> A Data Collection Endpoint is only required if AMPLS is enable or if Text Log Collection is configured for the agent.  
> Use the following TSG to determine if a **Data Collection Endpoint** and a **Data Collection Rule Association** exists for this Agent.  The below TSG references a DCR and Association but the same steps are used to validate the DCE and its association
> [How to verify in ASC that a DCR is created and associated with VM](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/817897/How-to-verify-in-ASC-that-DCR-is-created-and-associated-with-VM)
>

</details>

>

<details><summary>What version of the Azure Monitor Agent Extension is installed?</summary>

> There are several places where the Agent or Extension version can be found.
> From the **Azure Monitor Linux Agent Troubleshooter**, the version is documented in the **amalinux.out** file

> ![image.png](/.attachments/image-1ae23421-019b-4c66-a3be-7a33c3a02b31.png)
> 

> The extension version can also be found in ASC on the Extensions tab of the resource

> ![image.png](/.attachments/image-edeb22f5-d53c-4669-a801-9bb0b3429b66.png)

>

> The extension version can also be found in the Azure Portal on the Extensions blade of the resource
> ![image.png](/.attachments/image-f0280b95-2ef3-49f8-bf8f-a756d523e8a5.png)
>
</details>

>

<details>
<summary>What OS Distribution and Version is installed?</summary>

>
> From the **Azure Monitor Linux Agent Troubleshooter**, the OS Version is documented in the **amalinux.out** file
> ![image.png](/.attachments/image-93429429-bc0d-496d-8ae3-ae145f9e0d52.png)

>
> Then, check the **Supported OS** documentation - [Azure Monitor Agent overview - Azure Monitor | Microsoft Learn](https://learn.microsoft.com/azure/azure-monitor/agents/agents-overview#supported-operating-systems)
>
>
</details>

>

<details><summary>What Log Analytics Workspace is the Agent reporting Performance data to?</summary>

</details>

>

<details>
<summary>Is this agent connected through a proxy server or an OMS Gateway?</summary>

> 
>
> Is the AMA configured for a proxy server or an OMS Gateway?
>
>
>> There are two common places this is configured, Agent Extension Settings or the http_proxy or https_proxy environment variables. Both must be checked.
>
>
> **Proxy server in Extension settings**
>> The file **Azure Monitor Linux Agent Troubleshooter\\<extensionversion-config>\\<x>.settings** will note if the Agent Proxy settings are configured at the extension level.
>> The <x>.settings file with the highest number should represent the currently applied configuration
> á
> ![image.png](/.attachments/image-2735b0cd-f7d8-4e23-ad94-ea67f00dad04.png)

>
> á
> **http_proxy or https_proxy Environment variables**
>
>> At a shell prompt, run: **env |grep proxy**
``` cmd
env |grep proxy
https_proxy=https://proxyserver.domain.com:4343
http_proxy=http://proxyserver.domain.com:8888
```
> á
>
> Ensure these settings are proper for the customer\'s environment.
> 
>
> This brings up another topic, whether to use **http_proxy** or **https_proxy**.  
> The important thing to note is that this doesn't having anything to do with the Azure Endpoint's requirement for SSL/TLS.  
> SSL/TLS connections to Log Analytics can happen over both types of proxy servers, **http_proxy** or **https_proxy**
> The difference between these is governs how the Agent talks to the Proxy server only.
> When **http_proxy** is used, the agent will send a CONNECT message using HTTP and this CONNECT message is visible in clear text. If the CONNECT message was for a TLS enable endpoint, like those used by AMA, a TLS session will be established between the Agent and the Azure Endpoint.  Only the CONNECT message would be visiable, nothing else as the rest of the conversation will be encrypted.
> When https_proxy is used, the agent will first need to make a SSL/TLS connection to the proxy server before it can issue the CONNECT message.  The CONNECT message happens through the encrypted tunnel and would not be visible in a network trace. 

> Does this server require proxy to access LA?
>> If yes, then ensure proxy is configured in the AMA Extension Settings or via the environment variable.
>> If no, then ensure proxy isn\'t configured.
 

> If an OMS Gateway is used, ensure the gateway is also Heartbeating.  
> If the OMS Gateway is NOT heartbeating, this must be fixed before continuing with the current agent. 
> When troubleshooting a failure to heartbeat through an OMS Gateway, collect the **OMS Gateway Log** Event Log along with the **Operations Manager** Event Log from the OMS Gateway. 

</details>

>

<details><summary>What is the Workspace name, Resource ID and Workspace ID for the Log Analytics Workspace where the Performance data is to be collected?</summary>

> Locate workspace ID of the workspace from **ASC** or **Azure Portal**
> **Portal**
> ![image.png](/.attachments/image-aa837e06-dca7-4826-96ff-37abda76c10b.png)
> 
> 
> **ASC**
> ![image.png](/.attachments/image-ae20451b-3aba-4307-8452-e8d9a721938c.png)
> 
> Locate the workspace ID(s) of the AMA
> This may be contained in several places depending on the health of the AMA or in none if the agent is unable to reach the Access Control Service
> In the **Azure Monitor Linux Agent Troubleshooter** output the file(s) **DCR\config-cache\mcsconfig.lkg.xml** will contains a **workspaceName=** or **workspaceId=**

> ![image.png](/.attachments/image-aa88213d-074f-4f3c-a588-351ff00804f3.png)

> In the **Azure Monitor Linux Agent Troubleshooter** output, the DCR file(s) found in **DCR\config-cache\configchunks\**, in the **channels** section, locate the "id" which will be formatted like **ods-\<workspaceId\>**
> If there are more than one file in the configchunks folder, check each file individually as each may reference a different workspace
>
> Is the **configchunks** folder empty or missing?
>> If Yes, then the agent is unable to download configuration or there is no DCR Association.
>> Go to the troubleshooting section for CONFIG in the Missing Heartbeat TSG
>> [Troubleshooting Linux AMA Missing Heartbeats](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1001340/Troubleshooting-Linux-AMA-Missing-Heartbeats)
>
> Compare these workspace IDs
> Are they different? 
> If yes, connect to the correct workspace and test for heartbeats from the agent.
>
> If they are the same, then continue with this TSG.
>
> If any of these files are missing, this may be a clue.  This could indicate a failure to connect to a Log Analytics endpoint or a failure to authenticate to the endpoint.
</details>

>

<details><summary>What Performance Counters are missing?</summary>

> By default, a DCR configured to collect Performance counters will collect the following
>> "Processor(*)\\% Processor Time",
                        "Processor(*)\\% Idle Time",
                        "Processor(*)\\% User Time",
                        "Processor(*)\\% Nice Time",
                        "Processor(*)\\% Privileged Time",
                        "Processor(*)\\% IO Wait Time",
                        "Processor(*)\\% Interrupt Time",
                        "Processor(*)\\% DPC Time",
                        "Memory(*)\\Available MBytes Memory",
                        "Memory(*)\\% Available Memory",
                        "Memory(*)\\Used Memory MBytes",
                        "Memory(*)\\% Used Memory",
                        "Memory(*)\\Pages/sec",
                        "Memory(*)\\Page Reads/sec",
                        "Memory(*)\\Page Writes/sec",
                        "Memory(*)\\Available MBytes Swap",
                        "Memory(*)\\% Available Swap Space",
                        "Memory(*)\\Used MBytes Swap Space",
                        "Memory(*)\\% Used Swap Space",
                        "Logical Disk(*)\\% Free Inodes",
                        "Logical Disk(*)\\% Used Inodes",
                        "Logical Disk(*)\\Free Megabytes",
                        "Logical Disk(*)\\% Free Space",
                        "Logical Disk(*)\\% Used Space",
                        "Logical Disk(*)\\Logical Disk Bytes/sec",
                        "Logical Disk(*)\\Disk Read Bytes/sec",
                        "Logical Disk(*)\\Disk Write Bytes/sec",
                        "Logical Disk(*)\\Disk Transfers/sec",
                        "Logical Disk(*)\\Disk Reads/sec",
                        "Logical Disk(*)\\Disk Writes/sec",
                        "Network(*)\\Total Bytes Transmitted",
                        "Network(*)\\Total Bytes Received",
                        "Network(*)\\Total Bytes",
                        "Network(*)\\Total Packets Transmitted",
                        "Network(*)\\Total Packets Received",
                        "Network(*)\\Total Rx Errors",
                        "Network(*)\\Total Tx Errors",
                        "Network(*)\\Total Collisions"

> Are all performance counters missing?
>> If so, it's likely there is a network problem connecting to the ODS endpoint.

>
> If not all, are the missing counters included in the above list?
>> If only some of the counters are missing, and these are part of the default counters shown above, there may be a problem in OS preventing the counter from showing data. Next step would be to TS the OS itself.

>
> If not in the above list, were the missing counters custom or configured by the customer?
>> If the counter is a custom counter, we'll need to validate that it is a supported counter. 

</details>

>

<details><summary>Are any other Linux Servers unable to send Performance Data to Log Analytics?</summary>

> 
> 
> If more than one machine is failing to send performance data, use the **Azure Monitor Linux Agent Troubleshooter** to collect logs from a few machines that are also experiencing the problem.

>
> Does the customer have any agents that are successfully sending performance data to the same Log Analytics workspace?  
> If yes, again use **Azure Monitor Linux Agent Troubleshooter** to collect logs from a machine that is working.  

> Use this data to identify differences between working and non-working systems.
> What is different between the working and non-working systems that may explain this condition.
> Things to check
>> Do the servers have different roles?
>>> Different server roles will likely have different monitoring needs.  For instance, monitoring a SQL server will have different needs than monitoring a Domain Controller or a File Server.  
>
>> Are the servers on different networks?
>>> Networks may have their own unique firewall polices or AMPLS settings which may affect network connectivity.
>
>> On-Prem ARC versus Azure VMs?
>>> Are all on-prem servers failing versus all Azure VMs working, or vice-versa? 

</details>

>
>

<details><summary>Has workspace reached its daily upload cap limit?</summary>

> How to check if daily upload Cap is reached?
> [How-to: Check if the daily cap was reached](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/750256/How-to-Check-if-the-daily-cap-was-reached)

</details>

>
>

#Troubleshooting
<details><summary>Is there an associated DCR(s) collecting Performance Data?</summary>

> From the **Azure Monitor Linux Agent Troubleshooter** review the contents of the folder **DCR\config-cache\configchunks**
> Ensure a data source exists for collecting performance data.  The "id" element for Perf data should be similar to **perfCounterDataSource10** while **VMInsightsPerfCounters** is used for Insights Metrics
> Check there is a stream defined as **LINUX_PERF_BLOB** for normal Perf or **INSIGHTS_METRICS_BLOB** if Insights Metrics is used

> From ASC, locate the DCR(s) noted from the **What Data Collection Rule(s) is the Agent associated with?** section above.
> Check that an associated DCR contains a performanceCounters element for Perf and Insights Metrics
> For Perf collection the stream element will be **Microsoft-Perf**, while Insights Metrics uses **Microsoft-InsightsMetrics**

> If any of these elements is missing, create a new DCR using default parameters, then associate it with this Agent. 
> Wait around 10 minutes and review if Performance data or Insights Metrics data has populated.  

> If not, then collect new Agent Troubleshooter logs and start over

>
>

</details>

>
>

<details><summary>Has the Agent successfully downloaded the Perf DCR?</summary>

>
>
> Review the **Azure Monitor Linux Agent Troubleshooter**  for the contents of the folder **DCR\config-cache\configchunks**
> All associated DCRs should appear in this folder.
> Review each of these files for Perf related data sources

> The below article shows a helpful command for formatting the contents of a DCR to make it easier to review
[How to 'pretty-print' Data Collection Rule in Linux](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/937305/How-to-'pretty-print'-Data-Collection-Rule-in-Linux-ssh-session)
>
>
> If no DCRs exist in this folder, go to the following TSG:
[Troubleshooting Linux AMA Missing Heartbeats](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1001340/Troubleshooting-Linux-AMA-Missing-Heartbeats)

> If DCRs have been downloaded in this folder but none contain a Perf data source, review the **mdsd.err** file located in **Azure Monitor Linux Agent Troubleshooter** **mdsd\logs** folder.
> Look for failures related to accessing the global handler or regional endpoints as this would prevent the download of the Data Collection Rule

>
>

</details>

>
>

<details><summary>Check the log file mdsd.err for errors</summary>

>
>

> The **Azure Monitor Linux Agent Troubleshooter** contains the file **mdsd.err** located in **mdsd\logs**.
> Review this file for recent failures related to the ODS endpoint or failures referencing **LINUX_PERF_BLOB**

>
>


</details>

>
>

<details><summary>Check the Extension.log file for failures related to Perf</summary>

> In the **Azure Monitor Linux Agent Troubleshooter** output, locate the file **/<extensionversion>-extension_logs/extension.log**
> This file contains the startup events for the extension and may have references to Perf or Metric configuration

> Here is an example of a successful startup sequence for Perf collection
```
2023/05/15 14:53:36 [Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-1.26.1] Start processing metric configuration
2023/05/15 14:53:36 [Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-1.26.1] [{"displayName":"% Available Memory","interval":"10s","sink":["mdsd"]},{"displayName":"% Available Swap Space","interval":"10s","sink":["mdsd"]},{"displayName":"% Free Inodes","interval":"10s","sink":["mdsd"]},{"displayName":"% Free Space","interval":"10s","sink":["mdsd"]},{"displayName":"% IO Wait Time","interval":"10s","sink":["mdsd"]},{"displayName":"% Idle Time","interval":"10s","sink":["mdsd"]},{"displayName":"% Interrupt Time","interval":"10s","sink":["mdsd"]},{"displayName":"% Nice Time","interval":"10s","sink":["mdsd"]},{"displayName":"% Privileged Time","interval":"10s","sink":["mdsd"]},{"displayName":"% Processor Time","interval":"10s","sink":["mdsd"]},{"displayName":"% Used Inodes","interval":"10s","sink":["mdsd"]},{"displayName":"% Used Memory","interval":"10s","sink":["mdsd"]},{"displayName":"% Used Space","interval":"10s","sink":["mdsd"]},{"displayName":"% Used Swap Space","interval":"10s","sink":["mdsd"]},{"displayName":"% User Time","interval":"10s","sink":["mdsd"]},{"displayName":"Available MBytes Memory","interval":"10s","sink":["mdsd"]},{"displayName":"Available MBytes Swap","interval":"10s","sink":["mdsd"]},{"displayName":"Disk Read Bytes/sec","interval":"10s","sink":["mdsd"]},{"displayName":"Disk Reads/sec","interval":"10s","sink":["mdsd"]},{"displayName":"Disk Transfers/sec","interval":"10s","sink":["mdsd"]},{"displayName":"Disk Write Bytes/sec","interval":"10s","sink":["mdsd"]},{"displayName":"Disk Writes/sec","interval":"10s","sink":["mdsd"]},{"displayName":"Free Megabytes","interval":"10s","sink":["mdsd"]},{"displayName":"Logical Disk Bytes/sec","interval":"10s","sink":["mdsd"]},{"displayName":"Page Reads/sec","interval":"10s","sink":["mdsd"]},{"displayName":"Page Writes/sec","interval":"10s","sink":["mdsd"]},{"displayName":"Pages/sec","interval":"10s","sink":["mdsd"]},{"displayName":"Total Bytes","interval":"10s","sink":["mdsd"]},{"displayName":"Total Bytes Received","interval":"10s","sink":["mdsd"]},{"displayName":"Total Bytes Transmitted","interval":"10s","sink":["mdsd"]},{"displayName":"Total Collisions","interval":"10s","sink":["mdsd"]},{"displayName":"Total Packets Received","interval":"10s","sink":["mdsd"]},{"displayName":"Total Packets Transmitted","interval":"10s","sink":["mdsd"]},{"displayName":"Total Rx Errors","interval":"10s","sink":["mdsd"]},{"displayName":"Total Tx Errors","interval":"10s","sink":["mdsd"]},{"displayName":"Used MBytes Swap Space","interval":"10s","sink":["mdsd"]},{"displayName":"Used Memory MBytes","interval":"10s","sink":["mdsd"]}]
2023/05/15 14:53:39 [Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-1.26.1] Successfully started metrics-sourcer.
2023/05/15 14:53:40 [Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-1.26.1] Successfully started metrics-extension.
2023/05/15 14:53:40 [Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-1.26.1] Successfully refreshed metrics-extension MSI Auth token.
2023/05/15 19:09:54 [Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-1.26.1] Successfully refreshed metrics-extension MSI Auth token.
```

> Check for errors or failures in the above referenced sequence

</details>

>
>

<details><summary>Is the missing counter a valid Linux counter?</summary>

>
>
> A mapping file exists in the extension folder that can be used as a reference to validate if the counter is valid.
> /var/lib/waagent/Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-1.27.2/telegraf_utils/telegraf_name_map.py

>
>


</details>

>
>

<details><summary>Check telegraf.log for errors?</summary>

> The Telegraf process writes to a file named telegraf.log
> This log can be found in the **Azure Monitor Linux Agent Troubleshooter**\<version>-extension_logs\telegraf.log

> Review this log for errors.
> There may be an occasion where debug logging needs to be enabled for additional within this log.
> To enable debug logging, follow the TSG [AMA Linux: HT: Telegraf - Enable debug logging](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1138447/AMA-Linux-HT-Telegraf-Enable-debug-logging)

</details>

>
>

<details><summary> Check the contents of the <x>.settings file</summary>

> The <x>.settings file contains important extension settings needed by the Azure Monitor Agent.
> <x> represents a numeric value.
> If the extension settings have changed over time, the file number will increment the number represented by <x>
> The highest number will represent the current version of the settings file.

![image.png](/.attachments/image-61aa3e59-6571-4c6f-a9a5-0b239a88254a.png)

> If this file is missing or empty or improperly formatted, the Agent may not work
> Evidence of this may be found in the extension.log file
> The **Azure Monitor Linux Agent Troubleshooter** will capture this file in the path **\<version>-extension_logs\extension.log**

```
2023/08/23 02:51:37 [Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-1.27.2] setting file path is/var/lib/waagent/Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-1.27.2/config/0.settings
2023/08/23 02:51:37 [Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-1.27.2] JSON config: 
2023/08/23 02:51:37 ERROR:[Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-1.27.2] JSON exception decoding 
2023/08/23 02:51:37 ERROR:[Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-1.27.2] JSON error processing settings file:
```
> The **Azure Monitor Linux Agent Troubleshooter** will capture the <x>.settings file in \<version>-status\<x>.settings.

> Here is an example of a typical <x>.settings file.  If the customer has configured non-default extension settings, this file may vary from the below example.

```
[{"version": "1", "timestampUTC": "2023-06-06T03:13:39Z", "status": {"name": "Microsoft.Azure.Monitor.AzureMonitorLinuxAgent", "operation": "Enable", "status": "success", "code": "0", "formattedMessage": {"lang": "en-US", "message": "Enable succeeded"}}}]
```

> This is a simple json formatted file.
> Here's a formatted view of the same file

```
[
	{
		"version": "1",
		"timestampUTC": "2023-06-06T03:13:39Z",
		"status": {
			"name": "Microsoft.Azure.Monitor.AzureMonitorLinuxAgent",
			"operation": "Enable",
			"status": "success",
			"code": "0",
			"formattedMessage": {
				"lang": "en-US",
				"message": "Enable succeeded"
			}
		}
	}
]
```

</details>

# How do I submit IcM for DCR or AMA Agent related issues


If the Agent Swarming channel, SMEs or above information does not help to resolve the issue. Then submit an IcM from the ASC and then select the appropriate IcM escalation path based on the scenarios below:


|**Scenario** | **Escalation Path** |
|--|--|
| **Linux AMA scenarios**:<br>1. Installing and uninstalling Agent<br> 2. No heartbeat for Agent<br>3. Missing or no data<br>4. Issue sending text or IIS logs | Azure Monitor Data Collection/AMA Linux |
| **Linux AMA Scenarios:**<br>1. Installing and uninstalling Agent<br> 2. No heartbeat for Agent<br>3. Missing or no data<br> 4. Rsyslog and hardening issues | Azure Monitor Data Collection/AMA Linux |  
|**DCR scenarios:** <br>1. Error creating, deleting DCR<br>2. Need help with creating ,associating or viewing DCR | Azure Monitor Control Service (AMCS)/Triage|
