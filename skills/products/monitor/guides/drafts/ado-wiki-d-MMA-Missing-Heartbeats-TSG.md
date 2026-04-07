---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Microsoft Monitoring Agent (MMA) for Windows/Troubleshooting Guides/Troubleshooting MMA Missing Heartbeats"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FMicrosoft%20Monitoring%20Agent%20%28MMA%29%20for%20Windows%2FTroubleshooting%20Guides%2FTroubleshooting%20MMA%20Missing%20Heartbeats"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::
Applies To:
- Microsoft Monitoring Agent :- All versions

[[_TOC_]]


Note: All IPs and machine names in this page are from test lab and don't compromise any Pii data.
# Workflow
---
This workflow represents a level 2 support topics that is presented to the customer in the Azure Portal when opening a service request.
Be sure the support topic in the case is set appropriately.

# Scenario
---
This workflow is for Windows MMA Agents that are unable to upload Heartbeats.  If Agent heartbeat is consistently received in the Log Analytics Workspace (every 60 seconds) but no data is visible, depending on the missing data type (Windows Event logs, Perf Counters etc) please follow one of the TSGs linked below

- [Troubleshooting MMA for Windows Perf Counter Collection](/Monitor-Agents/Agents/Microsoft-Monitoring-Agent-\(MMA\)-for-Windows/Troubleshooting-Guides/Troubleshooting-MMA-for-Windows-Perf-Counter-Collection)
- [Troubleshooting MMA Windows Event Log Collection](/Monitor-Agents/Agents/Microsoft-Monitoring-Agent-\(MMA\)-for-Windows/Troubleshooting-Guides/Troubleshooting-MMA-Windows-Event-Log-Collection)


<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#d7eaf8">

 

**Important**

The troubleshooting steps outlined by this article are targeted to work with the Legacy Log Analytics Agent (MMA) for Windows.  If the customer is using the Azure Monitoring Agent (AMA), please refer to the link below. [Troubleshooting Azure Monitor Agent (AMA) for Windows](/Sandbox/Agents/Irfan/Troubleshooting-Azure-Monitor-Agent-\(AMA\)-for-Windows).
</div>


# Saving Time

1. Collect the following data up front [Windows Support Tool Guide](/Monitor-Agents/Agents/Microsoft-Monitoring-Agent-\(MMA\)-for-Windows/How%2DTo/Windows-Support-Tool-Guide).
   - Choose Scenario **Agent not reporting data or heartbeat data missing**
   - Then choose  **Option 2** to Collect Logs 
   - Allow at least 5 minutes for **Agent ETL Logs collection** before pressing **'s'**
   - Allow at least 5 minutes for  **CaptureNetworkTrace** before pressing **'s'**
	It is **BEST** to get this data while the agent is **FAILING** to Heartbeat


1. Connect to a new workspace.
    - To make sure customer is not having some Network issue in customer's Environment Or some workspace level issue.

# Update SAP
- If this is the primary issue then make sure the Support Topic Path is set to "Azure/Log Analytics agent (MMA and OMS)/Windows Agents/Windows agent not reporting data or Heartbeat data missing"

# Scoping Questions:
In this section you are establishing facts about the issue.
<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#d7eaf8">

**Important**

It is important to document Agent configuration details. please check [Windows Agent Basics (Microsoft Monitoring Agent)](/Monitor-Agents/Agents/Common-Concepts/Windows-Agent-Basics-\(Microsoft-Monitoring-Agent\))

</div>

<details><summary>Are Heartbeats really missing?</summary>

>
> Document the query used by the customer.
> Then, using the simplified queries below, query Log Analytics to ensure it's really missing.
> If results are found, validate the Category as this will help determine the Type of agent that sent the Heartbeat.  
> A **Category** of **Direct Agent** indicates the **MMA** sent the Heartbeat.
> A **Category** of **Azure Monitor Agent** indicates, the **AMA** sent the Heartbeat

``` csharp
//This query will check for heartbeat from a specific server within the last 10 minutes
//If this returns a result, then the server is heartbeating just fine
Heartbeat 
| where Computer contains "ServerName"
| where Category contains "Direct Agent"
| where TimeGenerated > ago(10m)
| order by TimeGenerated
```

> If the above query doesn't return a result, check for heartbeats based on Agent Id instead.
> **Agent Id** can be found in the file **agent_status.txt** from **GetAgentInfo**
> **Agent Id** can be found on the **Control Panel->Microsoft Monitoring Agent->Azure Log Analytics (OMS)** tab
> 
> ![image.png](/.attachments/image-5b09d032-9e07-4615-a6d8-c88e8a9e6026.png)

``` csharp
//This query will check for heartbeat from a specific AgentId within the last 10 minutes
//If this returns a result, then the server is heartbeating just fine
Heartbeat 
| where SourceComputerId contains "AgentId"
| where Category contains "Direct Agent"
| where TimeGenerated > ago(10m)
| order by TimeGenerated
```

> If the above query doesn't return a result, check for heartbeats based on resource Id instead.  
> This may happen if the name isn't what is expected.  
> Note: This only works for Azure VMs or ARC Connected Machines

> **Resource ID** can be found in **ASC->Resource Explorer->Resource Provider->Microsoft.Compute->virutalMachines-><VM Name>->V2 Properties->VM Base Properties->Resource Uri**
> **Resource ID** can be found in the **Azure Portal->Virtual Machines-><Virtual Machine Name>->Properties->Resource Id**

``` csharp
//This query will check for heartbeat from a specific ResoruceId within the last 10 minutes
//If this returns a result, then the server is heartbeating just fine
Heartbeat 
| where ResourceId contains "ResourceId"
| where Category contains "Direct Agent"
| where TimeGenerated > ago(10m)
| order by TimeGenerated
```
</details>

>
>
<details>
<summary>Is the Agent able to connect to the required endpoints?</summary> 

>
>Review the network connectivity checks performed by the GetAgentInfo script in the file **test_cloud_connection_results.txt**
> ![image.png](/.attachments/image-28df1c6a-92eb-4616-b770-e511585bfb2c.png)
> For a more detailed analysis of the network review [How to Check for Network Connection Issues for MMA](/Monitor-Agents/Agents/Microsoft-Monitoring-Agent-\(MMA\)-for-Windows/How%2DTo/How-to-Check-for-Network-Connection-Issues-for-MMA)

</details>

>
>

<details><summary>How many machines are not heartbeating?</summary>

> 
> 
> If more than one machine is failing to heartbeat, use the [Windows Support Tool Guide](/Monitor-Agents/Agents/Microsoft-Monitoring-Agent-\(MMA\)-for-Windows/How%2DTo/Windows-Support-Tool-Guide) to collect logs from a few machines that are also experiencing the problem.

>
> Does the customer have any agents that are successfully sending heartbeats to the Log Analytics workspace?  
> If yes, again use [Windows Support Tool Guide](/Monitor-Agents/Agents/Microsoft-Monitoring-Agent-\(MMA\)-for-Windows/How%2DTo/Windows-Support-Tool-Guide) to collect logs from a machine that is working.  

> Use this data to identify differences between working and non-working systems.
> What is different between the working and non-working systems that may explain this condition.
> Things to check
>> Do the servers have different roles?
>>> Different server roles will likely have different monitoring needs.  For instance, monitoring a SQL server will have different needs than monitoring a Domain Controller or a File Server.  
>
>> Are the servers on different networks?
>>> Networks may have their own unique firewall polices which may affect network connectivity.
>
>> On-Prem versus Azure VMs?
>>> Are all on-prem servers failing versus all Azure VMs working, or vice-versa? 

</details>

>
<details><summary>Has the agent ever successfully sent heartbeats to this Log Analytics workspace?</summary>

>
>
> If yes, when was the last time it successfully heartbeated?
> To determine this, navigate to the Workspace in ASC and review the Agent Report. 
> ![image.png](/.attachments/image-6b5cddd3-57da-4132-a332-2cbb82876186.png)

>
> **Or** use the below **KQL** query to determine the time of the last heartbeat from the MMA

``` csharp
Heartbeat
| where Computer contains "ServerName"
| where Category contains "Direct Agent"
| summarize arg_max(TimeGenerated, *) by Computer
```
> Use this time as a reference in the log files and event logs to determine what may have happened at that time.  Heartbeats occur every minute, so if something breaks that causes a log entry, it'll likely show up within a minute of the last heartbeat.

>
> Also use this time to determine if the issue is intermittent.  Does it work **sometimes** but not others. 
>
</details>

>
<details>
<summary>Is the Microsoft Monitoring Agent installed?</summary>

>
> To determine if the Agent is installed see [How to locate installed version of MMA Agent](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/605561/How-to-locate-)installed-version-of-MMA-Agent
>
> If agent isn't installed [Install Log Analytics agent on Windows computers - Azure Monitor | Microsoft Learn](https://learn.microsoft.com/azure/azure-monitor/agents/agent-windows?tabs=setup-wizard)

>
>
</details>

>
<details>
<summary>Is this running on a supported Operating System?</summary>

>
> The OS Version can be found in the **GetAgentInfo** output in the **system_info.nfo** file
![image.png](/.attachments/image-1d5ab57d-9a1e-441d-b912-822e971c2dfc.png)

>
> Then, check the **Supported OS** documentation - [Azure Monitor Agent overview - Azure Monitor | Microsoft Learn](https://learn.microsoft.com/azure/azure-monitor/agents/agents-overview#supported-operating-systems)
>
>
</details>

>
<details>
<summary>Does the Workspace ID for this Log Analytics Workspace match the configuration of the Agent?</summary>

> Locate workspace ID of the workspace from **ASC** or **Azure Portal**
> **Portal**
> ![image.png](/.attachments/image-aa837e06-dca7-4826-96ff-37abda76c10b.png)
> 
> 
> **ASC**
> ![image.png](/.attachments/image-ae20451b-3aba-4307-8452-e8d9a721938c.png)
> 
> Locate the workspace ID(s) configured in the Microsoft Monitoring Agent Control Panel 

>> ![image.png](/.attachments/image-b5a139d2-53d9-412b-8929-944e6226fad0.png)


>> Or in the **agent_status.txt** from the **GetAgentInfo** output

>> ![image.png](/.attachments/image-ddb6e49c-cdfc-4937-9a0e-9dc95bf3e11f.png)

>
> Compare these workspace IDs
> Are they different? 
> If yes, connect to the correct workspace and test for heartbeats from the agent.
>
> If they are the same, then continue with this TSG.
>
> �
</details>

>

<details>
<summary>What version of the .Net Framework is installed?</summary>

> Ensure at least .net Framework 4.5 is installed
>
>
> [How to find out dotnet version installed on windows - Overview
> (visualstudio.com)](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/605586/How-to-find-out-dotnet-version-installed-on-windows)
>
> Or
>
> This can be found in the **dot_network_framework_version.txt** file from **GetAgentInfo**
</details>

>�

<details>
<summary>Is this agent connected through a proxy server or an OMS Gateway?</summary>

> 
> Is the MMA configured for a proxy server or an OMS Gateway?
>
>> There are two common places this is configured, Agent Proxy Settings in the Control Panel and WINHTTP proxy settings found via the command prompt. Both must be checked.
>
>
>> The file **test_cloud_connection_results.txt** from **GetAgentInfo** will note if the Agent Proxy settings are configured but does NOT display if a WINHTTP proxy is configured.
> �
>
>> Agent Proxy Setting
>
>> Control Panel-\>Microsoft Monitoring Agent-\>Proxy Settings
![image.png](/.attachments/image-7f1e0baa-ffaf-4934-9e20-3c10f6012fd4.png)
>
>
>> In the above example, the agent is configured to use a proxy server named **myProxy.contoso.com** on tcp port **8080**.
>
> �
> **WINHTTP Proxy Settings**
>
>> At a command prompt, run: **netsh winhttp show proxy**
![image.png](/.attachments/image-6f113d9b-87a1-43a2-b458-bd051f738fce.png)
>
> ![](media/image6.png){width="5.375in" height="3.09375in"}
>
>> In the above example, winhttp is configured with a system wide proxy server named **myproxy.contoso.com** on tcp port **8888**.
>
>> The Agent Proxy and WINHTTP proxy settings are independent of each other. If a proxy is set in either location, it will affect how the MMA connects to LA.
>
> �
>
> **Less common proxy setting**
>
>> **Windows Server 2008 R2**
>
>> There is an exception to the above when dealing with **Windows Server 2008 R2**. In Windows Server 2008 R2, if the WINHTTP proxy setting is set from a SYSTEM elevated command prompt, this won\'t be visible to Administrative users. The WINHTTP proxy settings must be checked from an Administrative Command prompt **AND** a system elevated command prompt. This can be done using **PsExec** from the **PSTools** suite found on [https://**SysInternals.com**](https://SysInternals.com)**.**
>> Elevate the command prompt to run as **Local System** using the PsExec command: **psexec /s cmd**
>> Then run: **netsh winhttp show proxy**
>
>> Later Operating Systems don\'t have this nuance.
>
> �
>
> Ensure these settings are proper for the customer\'s environment.
>
> Does this server require proxy to access LA?
>> If yes, then ensure proxy is configured in the MMA control panel applet.
>> If no, then ensure proxy isn\'t configured in the MMA control panel applet AND isn\'t configured in winhttp.
>
>
> To remove proxy from the MMA Control Panel, uncheck **\"Use a proxy server\"**
>
> To remove the proxy from WINHTTP run the following command at an Administrative command prompt: **netsh winhttp reset  proxy**
>

```
Note: For Windows Server 2008 R2, this command must be run in the user context where the proxy setting was found. 
If found in while using a System elevated command prompt, then the command to remove it must be run in this same 
system level context. If found in the Administrative context, then it must be removed while in the Administrative 
user context. All Administrative level users share the same WINHTTP context, while local while system isn\'t shared. 
That statement may be confusing, so don't hesitate to ask a SME for clarification!
```

![image.png](/.attachments/image-1aa12dc5-aca0-47bf-bdb8-04943025dee8.png)

>
> 

> If an OMS Gateway is used, ensure the gateway is also Heartbeating.  
> If the OMS Gateway is NOT heartbeating, this must be fixed before continuing with the current agent.  

</details>

>
<details>
<summary>Is TLS 1.2 used by the agent?</summary>

TLS Settings

> Log Analytics endpoints require TLS 1.2
>
> Windows uses the following registry key to control TLS protocol
> settings:
> **HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\\SecurityProviders\\SCHANNEL\\Protocols**
>
> These values can be verified in the **Schannel.txt** file from
> **GetAgentInfo**
>
> The absence of a key or value indicates that the protocol is enabled.
>
>
> ![image.png](/.attachments/image-cc31f330-f540-43e0-ab74-7e3dd12ee8a2.png)
>
> �
>
> Above is the default settings of a basic install of many but not all Windows
> Server versions.
>
> If other keys are present, then it is likely these values have been altered and should be investigated
>
> ![image.png](/.attachments/image-acfef6dc-c001-4b08-bc19-5554944c739f.png)
>
> If the TLS 1.2 regkey is present, the values in the Client subkey must be set to enable the protocol
>
> ![image.png](/.attachments/image-358ba3d3-41e4-4406-8ccf-86ab6d409e73.png)
>
> Some Tools like older versions of IISCrypto may set the Enabled value to 0xffffffff instead of using 1. This may cause problems for the MMA an it is strongly suggested to use a value of 1 (decimal) or 0x00000001 (hex). IISCrypto was updated not too long ago and now uses 1 instead of 0xffffffff.
>
> �
>
> If the TLS 1.0 regkey is present, the values in the Client subkey should be set to disable the protocol
>
> �
>
> ![image.png](/.attachments/image-5b78a098-31c1-49c7-a066-3e5185b09b31.png)
>
> �
>
> If TLS 1.0 is enabled, there may be a need to force .Net to use TLS 1.2 instead.
>
> This is controlled by the DWORD value **SchUseStrongCrypto = 1** configured in the following two registry keys, one for 64 bit and the other for 32 bit:
>
> **HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\.NETFramework\\v4.0.30319**
> **HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Microsoft\\.NETFramework\\v4.0.30319**
>
> �
>
> Changes to any of the above registry keys require a restart of the System to take effect. Please also note that if these keys are controlled via Group Policy, a system reboot will cause them to revert back to their previous values. So on reboot, double check any changes you made were retained.

</details>

> �
<details>
<summary>What version of the MMA is installed?</summary>

> Is MMA newest version? Update if needed.
>
> Installed version can be found in **agent_version.txt** from **GetAgentInfo**
>
> Installed version can also be found on the **Control Panel-\>Microsoft Monitoring Agent-\>Properties** tab.
>
> ![image.png](/.attachments/image-ec0ae751-2b54-4090-9efc-4d8243e86ada.png)

</details>�

<details>
<summary>Is the Agent connected to SCOM or any other Log Analytics Workspaces?</summary>

>
> This is referred to as Multihoming or the Agent being Multihomed. Additional workspaces or SCOM connections increases the workload of the agent.  The agent has finite resources available for monitoring.  This increase in workload can exhaust the resources available to the agent to monitor effectively.  

> Check if the agent is connected to SCOM by checking the **Control Panel-\>Microsoft Monitoring Agent-\>Operations Manager** tab
>
> ![image.png](/.attachments/image-68b033f1-95f2-43a5-9d59-a9f6a468e02f.png)


> Check for multihoming of the agent to more than one Log Analytics Workspaces by checking the **Control Panel-\>Microsoft Monitoring Agent-\>Azure Log Analytics (OMS) tab**
>
> ![image.png](/.attachments/image-ebd807ec-4911-4365-91f6-4cf275073322.png)
>
> �
>
> For troubleshooting purposes, simplifying this configuration by only connecting to a single workspace is best. Removing all other workspaces and SCOM Management Groups, will expedite and simplify troubleshooting.  If a workspace or SCOM connection is removed, it is a best practice to flush the cache by removing the Health Service State folder.
>
> To clear the Health Service cache [How to restart and clear the MMA cache](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/605555/How-to-restart-and-clear-the-MMA-cache)
> �
</details>�

<details>
<summary>Is the Microsoft Monitoring Agent service running?</summary>
**Agent Running?**

> Is MMA running? The Microsoft Monitoring Agent, sometimes referred to as the **Log Analytics Agent** or as the **Health Service**, is made up of two processes. 
> The process name for this service is **HealthService.exe**.
>
> The Health Service, spawns a child process named **MonitoringHost.exe**.
>
> There may be more than one **MonitoringHost.exe** processes.
>
> �
>
> How to see if the **HealthService** is running?
>
> Check the Services MMC to see if the Service is in a Running State.
>
> ![image.png](/.attachments/image-22857f4e-d267-42ad-bf54-c0a14f0df977.png)
>
> �
>
> Check Task Manager, on the Details tab for the HealthService.exe process
>
> ![image.png](/.attachments/image-28337fcf-606d-4c19-9d15-b7d78c991910.png)
>
> Check **system_info.nfo** found in the **GetAgentInfo** output for the state of the service
>
> ![image.png](/.attachments/image-fdf4ad52-f5e0-4d96-9f6e-ac0c1fbf984b.png)
>
> Or in **Running Tasks** from **system_info.nfo**
>
> ![image.png](/.attachments/image-8c78b507-bb38-41c9-a1a1-a990497ac7d3.png)
>
> �


```
MonitoringHost.exe will only start once the HealthService has downloaded and applied config.   
The Agent will not heartbeat if MonitoringHost.exe isn't running. If HealthService.exe is running, 
but MonitoringHost.exe isn't, go to the **Has the Agent applied configuration** section for next steps. 
```


> Please document the state of these services and processes while in
> state.
</details>�

#Troubleshooting
�
<details>
<summary>Restart the Microsoft Monitoring Agent service</summary>

>
> **Restart Agent -** Did this resolve it?
> You should wait a few minutes and then query the workspace to see if the agent returned to normal operation.
>
</details>

>
<details>
<summary>Has the Agent applied configuration?</summary>

>
**Config Applied?**

> If the Agent is unable to obtain and apply configuration, it will not heartbeat.
>
> To check if configuration is applied, check for the existence of the following events in the Operations Manager Event log which can be found in the GetAgentinfo output.
>
> �
>
> Event 1210 indicates agent successfully applied config for a given workspace or Management Group(if SCOM connected) make sure the 1210 is for the desired workspace.
>
> This is the most important event for config. Be sure to check the workspace ID mentioned in the event to ensure that config for the proper workspace has applied.
>
>> **Log Name: Operations Manager**
>> **Source: HealthService**
>> **Date: \<datetime\>**
>> **Event ID: 1210**
>> **Task Category: Health Service**
>> **Level: Information**
>> **Keywords: Classic**
>> **User: N/A**
>> **Computer: \<ServerName\>**
>> **Description: New configuration became active. Management group \"AOI-\<workspaceID\>\", configuration id:\"10/31/2022 11:33:45 AM +00:00 Public \<Workspace ID\> 01c07e77-e97e-454b-8cd8-b290672b36a5 a3c2d0a8736b04f7f0a2cae5138b74e550ea4f2a True logmanagement;updates;\".**
>
> �
>
> Event 5000 shows agent is asking if new config exists.
>
>> **Log Name: Operations Manager**
>> **Source: Service Connector**
>> **Date: \<dateTime\>**
>> **Event ID: 5000**
>> **Task Category: State Synchronization**
>> **Level: Information**
>> **Keywords: Classic**
>> **User: N/A**
>> **Computer: \<ServerName\>**
>> **Description: Management group \"AOI-\<WorkspaceID\>\" has no configuration and will request configuration from the service.**
>
> �
>
> Event 5001 indicates current config is out of date and new config will
> be downloaded
>
> Event 5002 indicates agent received new config from workspace
>> **Log Name: Operations Manager**
>> **Source: Service Connector**
>> **Date: \<dateTime\>**
>> **Event ID: 5002**
>> **Task Category: State Synchronization**
>> **Level: Information**
>> **Keywords: Classic**
>> **User: N/A**
>> **Computer: \<ServerName\>**
>> **Description:**
>> **Management group \"AOI-\<Workspace ID\>\" has received new configuration from the service.**
>> **Previous Configuration Cookie:**
>> **New Configuration Cookie: 10/31/2022 11:33:45 AM +00:00 Public \<Workspace Id\> 01c07e77-e97e-454b-8cd8-b290672b36a5 a3c2d0a8736b04f7f0a2cae5138b74e550ea4f2a True logmanagement;updates;**
>
> �
>
> Event 1201 indicates download of a MP. - There should be lots of these
>> **Log Name: Operations Manager**
>> **Source: HealthService**
>> **Date: \<dateTime\>**
>> **Event ID: 1201**
>> **Task Category: Health Service**
>> **Level: Information**
>> **Keywords: Classic**
>> **User: N/A**
>> **Computer: \<ServerName\>**
>> **Description: New Management Pack with id:\"\<Mangement Pack Name\>\", version:\"8.0.1.967\" received.**
>
> �
>
>
> Check the following folder is populated **C:\\Program Files\\Microsoft Monitoring Agent\\Agent\\Health Service State**
>
> ![image.png](/.attachments/image-b69c3cc9-8696-40b3-8ce3-936d60a3806d.png)
>
> �
>
> If config isn\'t downloading, check the **Operations Manager** event log for connectivity errors connecting to Azure Monitor endpoints such as \<workspaceId\>.oms.opinsights.azure.com, \<storageName\>.blob.core.windows.net
>
> �
>
> Here\'s an example of an event where there is a failure to connect to the OMS endpoint. In this example, DNS failed to resolve the name. Other failure reasons exist, the key is that reference to a failed connection to the OMS endpoint
>
> Example failure to connect to OMS endpoint
>> **Log Name: Operations Manager**
>> **Source: Service Connector**
>> **D*ate: \<dateTime\>**
>> **Event ID: 4000**
>> **Task Category: Communication**
>> **Level: Error**
>> **Keywords: Classic**
>> **User: N/A**
>> **Computer: \<Server Name\>**
>> **Description: DNS resolution of the service name \<Workspace ID\>.oms.opinsights.azure.com failed. Please check that the computer has Internet access or that a HTTP proxy has been configured for the system. The query will be retried later. The article KB3126513 has additional troubleshooting information for connectivity issues.**
>> **URL for Operation:\<Workspace ID\>.oms.opinsights.azure.com/ConfigurationService.Svc/...**
>> **Proxy Host:**
>
> �
>
> Example of failure to connect to storage account. In this example, a
> 503 response was received due to a firewall misconfiguration. Other
> failure reasons exist, the key is the reference to a failed connection
> attempt to a storage account
>> **LogName: Operations Manager**
>> **Source: Service Connector**
>> **Date: \<dateTime\>**
>> **Event ID: 4002**
>> **Task Category: Communication**
>> **Level: Error**
>> **User: N/A**
>> **Computer: \<Server Name\>**
>> **Description: The service returned HTTP status code 503 in response to a query. Please check with the service administrator for the health of the service. The query will be retried later. The article KB3126513 has additional troubleshooting information for connectivity issues.**
>> **URL for Operation: \...**
>
> �
</details>

>
<details>
<summary>Does the Agent have Network Connectivity to the Log Analytics Workspace?</summary>

> Reference **test_cloud_connection_results.txt** from the **GetAgentInfo** output.
>
> This test does a great job of checking basic network connectivity and will identify if the MMA is configured with a proxy. This does NOT test the scenarios where a WINHTTP proxy is configured.
>
> The Operations Manager event log is a good place to check for errors related to the MMA connecting to Azure Endpoints.
>
> There are a number of event IDs used to convey this. The below list isn\'t all encompassing but shows some of the more common events.
>
> Event IDs 4000 - 4009 sourced from **Service Connector**, they are likely related to a network connectivity failure. Most should reference the endpoint that the agent failed to connect to.
>
> Event IDs 2127 - 2141 sourced from **Ops Connector** or **HealthService** may indicate a failed network connection/TLS Negotiation/Certificate verification
>
> �
>
> How to get a network trace:
> From an Administrative Command prompt, run:

``` DOS
 net stop healthservice>
 ren "c:\program files\Microsoft Monitoring Agent\Agent\Health Service State" "c:\program files\Microsoft Monitoring Agent\Agent\Health Service State.old"
 netsh trace start capture=yes
 ipconfig /flushdns
 net start healthservice

 wait 5 minutes

 netsh trace stop
```
>
> Collect the **nettrace.etl** file. The output of the above command will provide its path, which is typically in the path **C:\\Users\\\<username\>\\AppData\\Local\\Temp**
>
> Collect the **Operations Manager** event log. This will help coordinate the time of the failure with the trace events.
>
> �
>
> How to analyze the trace.
>
> Here is an example of a successful DNS lookup for the OMS endpoint followed by a TCP connection to that Endpoint on Port 443
>
> �

| Source | Destination | Protocol | Details |
|-----------|-----------|-----|--------|
| 10.0.0.20 | 10.0.0.34 | DNS | DNS:QueryId = 0xF3A1, QUERY (Standard query), Query for ac604a75-54fe-42e7-99bc-e0b23545d3c5.oms.opinsights.azure.com of type Host Addr on class Internet | 
| 10.0.0.34 |     10.0.0.20  |    DNS |  DNS:QueryId = 0xF3A1, QUERY (Standard query), Response - Success, 50, 0 \... |
|  10.0.0.20  |    20.42.73.172 |  TCP  | TCP:Flags=CE\....S., SrcPort=24159, DstPort=HTTPS(443), PayloadLen=0, Seq=3607828370, Ack=0, Win=8192 ( Negotiating scale factor 0x8 ) = 8192 |
| 20.42.73.172  | 10.0.0.20 |     TCP |  TCP:Flags=.E.A..S., SrcPort=HTTPS(443), DstPort=24159, PayloadLen=0, Seq=3832332008, Ack=3607828371, Win=65535 ( Negotiated scale factor 0x8 ) = 16776960 |
|  10.0.0.20   |   20.42.73.172 |  TCP  | TCP:Flags=\...A\...., SrcPort=24159, DstPort=HTTPS(443), PayloadLen=0, Seq=3607828371, Ack=3832332009, Win=258 (scale factor 0x8) = 66048 |
|  10.0.0.20  |    20.42.73.172 |  TLS |  TLS:TLS Rec Layer-1 HandShake: Client Hello. |
|  20.42.73.172  | 10.0.0.20  |    TLS  | TLS:TLS Rec Layer-1 HandShake: Server Hello. Certificate. |
|  10.0.0.20  |    20.42.73.172 |  TLS |  TLS:TLS Rec Layer-1 HandShake: Certificate. Client Key Exchange. Certificate Verify.; TLS Rec Layer-2 Cipher Change Spec; TLS Rec Layer-3 HandShake: Encrypted Handshake Message.|
|  20.42.73.172 |  10.0.0.20   |   TLS |  TLS:TLS Rec Layer-1 Cipher Change Spec; TLS Rec Layer-2 HandShake: Encrypted Handshake Message.|
|  10.0.0.20   |   20.42.73.172  | TLS |  TLS:TLS Rec Layer-1 SSL Application Data |


> �
>
> Next, you will likely see several connections to one or more storage accounts in order to download config. Here is an example of one such connection.
>
> �

| Source | Destination | Protocol | Details |
|-----------|-----------|-----|--------|
|  10.0.0.20 |    10.0.0.34 |    DNS  | DNS:QueryId = 0x7EAC, QUERY (Standard query), Query for eusaaomssa.blob.core.windows.net of type Host Addr on class Internet |
|  10.0.0.34 |    10.0.0.20  |   DNS  | DNS:QueryId = 0x7EAC, QUERY (Standard query), Response - Success, 20.60.6.228, 20.60.6.68 ...|
| 10.0.0.20 |    20.60.6.228 |  TCP |  TCP:Flags=CE\....S., SrcPort=24160, DstPort=HTTPS(443), PayloadLen=0, Seq=2450629647, Ack=0, Win=8192 ( Negotiating scale factor 0x8 ) = 8192|
|  20.60.6.228 |   10.0.0.20  |   TCP  | TCP:Flags=.E.A..S., SrcPort=HTTPS(443), DstPort=24160, PayloadLen=0, Seq=2941894398, Ack=2450629648, Win=65535 ( Negotiated scale factor 0x8 ) = 16776960 |
|  10.0.0.20  |   20.60.6.228  | TCP  | TCP:Flags=\...A\...., SrcPort=24160, DstPort=HTTPS(443), PayloadLen=0, Seq=2450629648, Ack=2941894399, Win=258 (scale factor 0x8) = 66048|
|  10.0.0.20  |   20.60.6.228 |  TLS |  TLS:TLS Rec Layer-1 HandShake: Client Hello.|
|  20.60.6.228  | 10.0.0.20  |   TLS |  TLS:TLS Rec Layer-1 HandShake: Server Hello. Certificate. |
|  10.0.0.20  |   20.60.6.228  | TLS  | TLS:TLS Rec Layer-1 HandShake: Client Key Exchange.; TLS Rec Layer-2 Cipher Change Spec; TLS Rec Layer-3 HandShake: Encrypted Handshake Message.|
|  20.60.6.228  | 10.0.0.20  |   TLS  | TLS:TLS Rec Layer-1 Cipher Change Spec; TLS Rec Layer-2 HandShake: Encrypted Handshake Message.|
| 10.0.0.20  |   20.60.6.228 |  TLS  | TLS:TLS Rec Layer-1 SSL Application Data|


> �
>
> Lastly, once configuration has been downloaded and applied, the agent can start running workflows to monitor the server. At this point a connection will be made to the ODS endpoint to start sending data up to log analytics.
>
> �

| Source | Destination | Protocol | Details |
|-----------|-----------|-----|--------|
|  10.0.0.20  |    10.0.0.34 |     DNS  | DNS:QueryId = 0x73DD, QUERY (Standard query), Query for ac604a75-54fe-42e7-99bc-e0b23545d3c5.ods.opinsights.azure.com of type Host Addr on class Internet|
|  10.0.0.34   |   10.0.0.20  |    DNS  | DNS:QueryId = 0x73DD, QUERY (Standard query), Response - Success, 50, 0 \...|
|  10.0.0.20    |  20.42.73.133  | TCP |  TCP:Flags=CE\....S., SrcPort=24272, DstPort=HTTPS(443), PayloadLen=0, Seq=1252081273, Ack=0, Win=8192 ( Negotiating scale factor 0x8 ) = 8192|
|  20.42.73.133  | 10.0.0.20  |   TCP |  TCP:Flags=.E.A..S., SrcPort=HTTPS(443), DstPort=24272, PayloadLen=0, Seq=2894879133, Ack=1252081274, Win=65535 ( Negotiated scale factor 0x8 ) = 16776960|
|  10.0.0.20   |   20.42.73.133 |  TCP |  TCP:Flags=\...A\...., SrcPort=24272, DstPort=HTTPS(443), PayloadLen=0, Seq=1252081274, Ack=2894879134, Win=258 (scale factor 0x8) = 66048|
|  10.0.0.20  |    20.42.73.133 |  TLS  | TLS:TLS Rec Layer-1 HandShake: Client Hello.|
|  20.42.73.133 |  10.0.0.20  |    TLS  | TLS:TLS Rec Layer-1 HandShake: Server Hello. Certificate.|
|  10.0.0.20  |    20.42.73.133 |  TLS  | TLS:TLS Rec Layer-1 HandShake: Certificate. Client Key Exchange. Certificate Verify.; TLS Rec Layer-2 Cipher Change Spec; TLS Rec Layer-3 HandShake: Encrypted Handshake Message.|
|  20.42.73.133  | 10.0.0.20 |     TLS  | TLS:TLS Rec Layer-1 Cipher Change Spec; TLS Rec Layer-2 HandShake: Encrypted Handshake Message.|
|  10.0.0.20  |    20.42.73.133  | TLS |  TLS:TLS Rec Layer-1 SSL Application Data|

> �
>
> OMS Gateway or proxy? Yes, get those details for use when diagnosing network trace. If the OMS Gateway is used, it would be recommended to get to the OMS Gateway event log
>
> �
>
> How to check SSL connectivity for MMA using PowerShell
>
> [How to check SSL connectivity for MMA using PowerShell - Overview (visualstudio.com)](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/605550/How-to-check-SSL-connectivity-for-MMA-using-PowerShell)

�</details>

<details><summary>Is SSL Packet inspect used by the customer's firewall or proxy?</summary>

> A firewall or proxy server may act as a **man-in-the-middle** in order to inpsect the contents of a SSL/TLS session.
> Connections to Azure endpoints do not support this as it exposes the potential for a security vulnerability.
> This may result in an error similar to the below reference 4002 event.

> The Microsoft Monitoring Agent uses a client certificate to authenticate to the Log Analytics OMS endpoint.
> This certificate expires every 3 months and will be renewed automatically prior to that time.
> If there is a failure of the agent to auto-renew this certificate, authentication will fail once the certificate expires
> This may manifest as a 4002 event in the Operations Manager event log with the following details
>>
>> **Log Name:      Operations Manager**
>> **Source:        Service Connector**
>> **Date:          \<DateTime\>**
>> **Event ID:      4002**
>> **Task Category: Communication**
>> **Level:         Error**
>> **Keywords:      Classic**
>> **User:          N/A**
>> **Computer:      \<ServerName\>**
>> **Description:**
>> **The service returned HTTP status code 403 in response to a query.  Please check with the service administrator for the health of the service. The query will be retried later.  The article KB3126513 has additional troubleshooting information for connectivity issues.**
	 
>> **URL for Operation: https://\<workspaceID\>.oms.opinsights.azure.com/AgentService.svc/AgentTopologyRequest**
>> **Request ID: b960be46-ed89-4c4f-a517-a1b62a47cd2b**

> In the above event log error, note the HTTP Status code of **403**.  A **HTTP 403** code indicates **Forbidden**, denoting a failure to authenticate
> To determine if the customer's network is attempting to perform SSL/TLS packet inspection, do the following:

> From an Administrative Command prompt, run:

``` DOS
 net stop healthservice
 ren "c:\program files\Microsoft Monitoring Agent\Agent\Health Service State" "c:\program files\Microsoft Monitoring Agent\Agent\Health Service State.old"
 netsh trace start capture=yes
 ipconfig /flushdns
 net start healthservice

 wait 5 minutes

 netsh trace stop
```
>
> Collect the **nettrace.etl** file. The output of the above command will provide its path, which is typically in the path **C:\\Users\\\<username\>\\AppData\\Local\\Temp**
>  In the network trace, locate a **Client Hello** message from one of the Log Analytics endpoints

>> Log Analytics Endpoint names for reference
>> * .ods.opinsights.azure.com
>> * .oms.opinsights.azure.com
>> * .blob.core.windows.net
>> * .azure-automation.net

> To determine if a **Client Hello** is intended for a LA endpoint, in Frame Details of Netmon, expand **TLS->SSLHandshake->ClientHello->ClientHelloExtension: ServerName**
> 

![image.png](/.attachments/image-2091045f-4d72-4ad5-9485-f9c08fc38031.png)

>
> The ServerName extension in the **Client Hello** will contain the name of the LA endpoint the agent is attempting to connect to.
> With this packet found, from the **Frame Summary** window of Network Monitor, right click the **Client Hello** packet and choose **Find Conversations->TLS**
> This will filer the trace to just the one TCP/TLS session.
> 
> A **Server Hello** message should follow the **Client Hello**.  Select this **Server Hello** packet.
> From the **Frame Details** pane, expand **TLS->SSLHandshake->Cert->Certificates->X509Cert->Subject**
> The Certificate's **Subject** property may include the name of the LA endpoint this session connected to or a wildcard reference to the name.  
> 
> This may not always match that of the **Client Hello** though.
> In cases where it doesn't match, there may be a **Subject Alternate Name** extension on the certificate with a list of names supported by this certificate.
> **Subject Alternate Names** would look like this:
> 
![image.png](/.attachments/image-26183ea6-448b-4dbd-8672-76d6d7abd3d4.png)
>
> Once you know this is indeed a LA endpoint, check the **Issuer** of the certificate
> In the below screenshot, this is a sample of what this may look like for an attempted packet inspection
>
![image.png](/.attachments/image-bcd03962-51a4-409f-a9b8-60a77ae2819e.png)
>
> From the above screenshot, note the Issue in this case is **DO_NOT_TRUST_FiddlerRoot**.  
> That is because I used fiddler to simulate this **man-in-the-middle** scenario.  
> In the case of a customer, the **Issuer** will likely be something from the proxy server, firewall or their corporate CA.
> If packet inspection is NOT enabled, you will likely see a cert issued by a Microsoft CA, a DigiCert CA or a Baltimore Cyber Trust CA.  
> There may be others but they should be well known CAs.
> Here is an example of a normal **Server Hello** from a LA Endpoint
>
![image.png](/.attachments/image-22aa0dee-e0d3-4f9d-bd94-c8114f23e3ca.png)
>
> Note the **Issuer** of the above GOOD response, shows Microsoft RSA TLS CA.  
> 
> If the Server's certificate shown in the **Server Hello** packet isn't Issued by a Microsoft CA, or a DigiCert CA, or  Baltimore Trust CA, then it is likely that SSL/TLS packet inspection has been enabled.
> This isn't support by our connections and the customer **MUST** turn this off.
> 
> Lastly, each endpoint connection must be validated using this method.  Firewalls or Proxy servers may have different rules for each endpoint, so validating just one endpoint isn't enough.  You must validate this for each endpoint.
> Keep in mind that the Agent typically hits each endpoint one at a time. Should one fail, it may not proceed to the next endpoint.  With this in mind, a network trace may not show connections to all endpoints.  It can't proceed to the next endpoint until it successfully connects to the previous endpoint.  
> 
> As you fix one endpoint, it may be necessary to get additional traces to validate the next endpoints.  
> 
> Feel free ask a SME for clarification on this process as it can be confusing.  
>
</details>

>
<details><summary>Has the Client Authentication certificate expired?</summary>

>
> The Microsoft Monitoring Agent uses a client certificate to authenticate to the Log Analytics OMS endpoint.
> This certificate expires every 3 months and will be renewed automatically prior to that time.
> If there is a failure of the agent to auto-renew this certificate, authentication will fail once the certificate expires
> This may manifest as a 4002 event in the Operations Manager event log with the following details
>>
>> **Log Name:      Operations Manager**
>> **Source:        Service Connector**
>> **Date:          \<DateTime\>**
>> **Event ID:      4002**
>> **Task Category: Communication**
>> **Level:         Error**
>> **Keywords:      Classic**
>> **User:          N/A**
>> **Computer:      \<ServerName\>**
>> **Description:**
>> **The service returned HTTP status code 403 in response to a query.  Please check with the service administrator for the health of the service. The query will be retried later.  The article KB3126513 has additional troubleshooting information for connectivity issues.**
	 
>> **URL for Operation: https://\<workspaceID\>.oms.opinsights.azure.com/AgentService.svc/AgentTopologyRequest**
>> **Request ID: b960be46-ed89-4c4f-a517-a1b62a47cd2b**

>
> In the above event log error, note the HTTP Status code of 403.  A HTTP 403 code indicates **Forbidden**, denoting a failure to authenticate
	
> To resolve this situation, first identify the agent ID for this Agent by opening **Control Panel-\>Microsoft Monitoring Agent-\> Azure Log Analytics (OMS)**
> Note the **Agent ID** for the connected workspace.  If the Agent is multihomed, ensure the proper Agent ID is referenced.  Each connection will have a unique Agent ID.
>
![image.png](/.attachments/image-1f9fe230-56e3-46fc-b748-51d5a98e9bab.png)

>
> Next, open **certlm.msc**
> Navigate to **Certificates - Local Computer-\>Microsoft Monitoring Agent-\>Certificates**
> Locate the client authentication certificate with the **Issued To** name that matches the **Agent ID**
>
![image.png](/.attachments/image-509d525e-2992-4d91-abcc-3ba80350fb0a.png)
>
> Delete this certificate by selecting the certificate, right click and choose **Delete**
> Ensure the Time and Date on this server are accurate
> Ensure the **CNG Key Isolation** service is in a running state.  This service is used for managing and using certificates.

>
![image.png](/.attachments/image-4a77812d-07ad-41c6-83dc-f69164f78c9f.png)
>
> Restart the **Microsoft Monitoring Agent** service.  This will create a new certificate
> Validate a new certificate has been created and the Expiration Date is 3 months in the future

</details>

>
<details><summary>Is heartbeat failing due to PowerShell Transcription?</summary>

> See [PowerShell Transcription](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/740674/Troubleshooting-MMA-Missing-Heartbeats-caused-by-SYSTEM-permission-issue-to-PowerShell-Transcription-folder)

</details>

>
<details><summary>Have all previous steps not produced a reliable heartbeat?</summary>

> There are times when the Agent appears to be doing nothing.  There are no obvious failures or problems that can be diagnosed.  The agent process is running but doesn't provide any feedback on why it fails to heartbeat. 
> A deeper dive or possibly debugging will be needed to further investigate.  As mentioned previously, the agent has finite resources available to it for the purposes of monitoring.  Some of these resources are internal to the process and won't manifest themselves externally.  So, you may not see high CPU or high memory usage from the agent.  Instead, what you may see is a LACK of CPU time from the agent or its child processes, primarily MonitoringHost.exe.  

>
> For instance, the agent uses a Thread Pool to process its workitems.  The number of threads available to that pool is limited.  There are five threads allocated per logical processor.  Given a server with 4 logical processors, the thread pool will contain a maximum of 20 threads.  Threads will be added to the thread pool on a as needed basis up to the MAX allowed. Threads will only be added to the pool when required.  When the MAX thread could has been achieved (5 per logical processor) no additional threads will be allocated.  

> If those threads become busy doing work, or waiting on something else to complete, then the heartbeat workitem may not get processed. Restarting the agent after clearing the HeathService cache will often provide temporary relief for this condition.
>
> Debugging is the only way to determine this condition. 
>
> In a case like this, proceed with collecting the following.
>
> Use the GetAgentInfo data collector [Windows Support Tool Guide](/Monitor-Agents/Agents/Microsoft-Monitoring-Agent-\(MMA\)-for-Windows/How%2DTo/Windows-Support-Tool-Guide)

> Choose Scenario **A: Collect logs for all scenarios except custom logs issue (Note: collects agent process dumps which increases the size of results)**
> Allow at least 5 minutes for Agent ETL Logs collection before pressing 's'
> Allow at least 5 minutes for CaptureNetworkTrace before pressing 's'
> It is a **MUST** to get this data while the agent is FAILING to Heartbeat
>
> Seek SME or EE
</details>

###Arc Server Log Collection
If investigating MMA Agent deployment or any aspect of ARC based extension deployments, please make sure to capture ARC Server logs by following [ARC Troubleshooter Script](https://supportability.visualstudio.com/AzureArcforServers/_wiki/wikis/AzureArcenabledservers.wiki/641458/Azure-Connected-Machine-Agent-Troubleshooter-Script)

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#d7eaf8">

**Important**
ARC logs through troubleshooter will help reduce wait time for ICM and eventually for customer.
</div>

# Which CRI Template to use?
If the Agent Swarming channel, SMEs or above information does not help to resolve the issue. Then submit an IcM from ASC and select the right SAP to submit IcM.

If your SAP is correct, then you will automatically get right Agent template when raising CRI via Azure support center. 
[Here is a direct link for the correct ICM template](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=ma3n1c)

Please make sure CRI is approved by TA or SME to make sure you have right set of data captured and have initial analysis of data as well.

Collect data referecned in the **Have all previous steps not produced a reliable heartbeat?** section above.

# Known Issues:
#74465

# Related Articles
[Troubleshooting Agents on Virtual Desktops do not connect to log analytics workspace](/Monitor-Agents/Agents/Microsoft-Monitoring-Agent-\(MMA\)-for-Windows/Troubleshooting-Guides/Troubleshooting-Agents-on-Virtual-Desktops-do-not-connect-to-log-analytics-workspace)
[Troubleshooting MMA Windows Event Log Collection](/Monitor-Agents/Agents/Microsoft-Monitoring-Agent-\(MMA\)-for-Windows/Troubleshooting-Guides/Troubleshooting-MMA-Windows-Event-Log-Collection)
[Troubleshooting MMA for Windows Perf Counter Collection](/Monitor-Agents/Agents/Microsoft-Monitoring-Agent-\(MMA\)-for-Windows/Troubleshooting-Guides/Troubleshooting-MMA-for-Windows-Perf-Counter-Collection)
[Troubleshooting MMA Extension Installation and Uninstallation Issues](https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/826567/Troubleshooting-MMA-Extension-Installation-and-Uninstallation-Issues)
[Troubleshooting Windows Agent Installation and Uninstallation issue](https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/830125/Troubleshooting-Windows-Agent-Installation-and-Uninstallation-issue)
[Network Agents having Baltimore CyberTrust Root issue when using LA Gateway](/Monitor-Agents/Agents/Microsoft-Monitoring-Agent-\(MMA\)-for-Windows/Troubleshooting-Guides/Network-Agents-having-Baltimore-CyberTrust-Root-issue-when-using-LA-Gateway)