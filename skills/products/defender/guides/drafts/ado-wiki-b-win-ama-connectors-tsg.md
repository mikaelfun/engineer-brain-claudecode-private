---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Microsoft Sentinel Wiki/Data Ingestion - Connectors/Third Party Connectors/Azure Monitoring Agent/[TSG] - Win AMA connectors"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=%2FMicrosoft%20Sentinel%20Wiki%2FData%20Ingestion%20-%20Connectors%2FThird%20Party%20Connectors%2FAzure%20Monitoring%20Agent%2F%5BTSG%5D%20-%20Win%20AMA%20connectors"
importDate: "2026-04-07"
type: troubleshooting-guide
---

[[_TOC_]]

#Relevant connector for this TSG

- Windows Security events on AMA
- Windows Forwarded events

# Glossary

- AMA: New Log Analytics agent. Also known as One agent and Azure Monitoring Agent.
- MMA: Old Log Analytics agent. Also known as Microsot Monitoring agent.
- DCR: Data collection rule. An Azure resource that serves as a configuration rule that hold basic details for the data collection. For example: what data to collect, from where, and where to send it.
- DCRA: Data Collection Rule Association. It's a resource that connects between DCRs and machines and tells the agent to download the DCR mentioned in the DCR.
- Xpath: A filter one can use in his DCR. The xpath has a specific format and can specify what exact event to collect. For example: `"Security!*[System[Provider[@Name='4622'] and (Level=3)]]"` (this means to collect Security events from level 3 (warning) and of ID 4622).

#Contact list

For general questions including agent specifications:
- Noam Landress, Haim Naamati

For UI questions
- Lior Gishry

For Agent deep dive questions
- Manish Goel.

## Training sessions
|Date (DD/MM/YYYY)|Session Recording|Presenter|
|--|--|--|
|04/08/2022|[Sentinel - Introduction to AMA Agent](https://platform.qa.com/resource/update-for-the-new-log-analytics-agent-1854/)|Noam Landress|

#Important links

Azure Monitor TSG and help guides:
- [How to use the Windows operating system (OS) Azure Monitor Agent Troubleshooter - Azure Monitor | Microsoft Learn](https://learn.microsoft.com/en-us/azure/azure-monitor/agents/troubleshooter-ama-windows?tabs=WindowsPowerShell)
- [Troubleshoot the Azure Monitor agent on Windows virtual machines and scale sets - Azure Monitor | Microsoft Learn](https://learn.microsoft.com/en-us/azure/azure-monitor/agents/azure-monitor-agent-troubleshoot-windows-vm)
- [Troubleshoot the Azure Monitor agent on Windows Arc-enabled server - Azure Monitor | Microsoft Learn](https://learn.microsoft.com/en-us/azure/azure-monitor/agents/azure-monitor-agent-troubleshoot-windows-arc)
- [Preparation for troubleshooting AMA installation issues on Windows VMs - Azure | Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/azure-monitor-agent/ama-windows-installation-issues-prepare-troubleshooting)
- [Troubleshoot AMA installation issues on Windows VMs - Azure | Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/azure-monitor-agent/ama-windows-installation-issues-detailed-troubleshooting-steps)
- [Advanced troubleshooting for AMA installation issues on Windows VMs - Azure | Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/azure-monitor-agent/ama-windows-installation-issues-advanced-troubleshooting-steps)
- [DCR limitations](https://docs.microsoft.com/azure/azure-monitor/service-limits#data-collection-rules)
- [Data collection rules explained](https://docs.microsoft.com/azure/azure-monitor/agents/data-collection-rule-overview)


For most of the issues directly related to the Agent we need a collab with AzMon for further troubleshooting.

We can however still use the links above and the information below to try and drill down the issue in the meantime.

#Agent is not getting downloaded to the machine

Further checks that can be done:

- Check Heartbeats:
  ```q
  Heartbeat
  | where Computer == "computer_hostname_here"
  // | where ComputerIP == "another option is to put an IP here"
  ```
- The customer doesn't have the following directories (ask the customer for a snip/to verify): `C:\Packages\Plugins\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent` (inside there is the agent version for example): directory that looks like this `C:\WindowsAzure\Resources{some_long_id}._{Machine name}.AMADataStore`
- The customer could also verify the agent version running through the portal by going to the extensions tab in his VM as so.
- Use the same to make sure the customer is not also running the old MMA agent by accident. The extension is called "MicrosoftMonitoringAgent".
- You can also run the following GET command to get the extensions running on the customers VM (The agent extension is called "AzureMonitorWindowsAgent").
   - `GET https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Compute/virtualMachines/{vmName}/extensions/{vmExtensionName}?api-version=2021-07-01`
    - [Virtual Machine Extensions - Get](https://docs.microsoft.com/rest/api/compute/virtual-machine-extensions/get)

#DCR is not getting downloaded to the machine

Further checks that can be done:

- Check for the mcs\configchunks directory to see if it is empty or doesn't contain the relevant DCR just created by the customer (ask the customer to provide it's content): `C:\WindowsAzure\Resources{some_number}._WEFCollectorMachine.AMADataStore\mcs\configchunks`

- You can also run the following GET request to fetch all the running DCR's:
  - `GET https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Insights/dataCollectionRules/{dataCollectionRuleName}?api-version=2019-11-01-preview`
  - [Data Collection Rules - Get](https://docs.microsoft.com/en-us/rest/api/monitor/data-collection-rules/get)

- In case the relevant DCR does seem to be created, It's possible that it's not associated to the machine correctly. Use the following GET command to get the associations list for a specified resource-
  - `GET https://management.azure.com/{resourceUri}/providers/Microsoft.Insights/dataCollectionRuleAssociations?api-version=2019-11-01-preview`
  - [Data Collection Rule Associations - List By Resource](https://docs.microsoft.com/en-us/rest/api/monitor/data-collection-rule-associations/list-by-resource)

- Each DCR is a json file which is pretty easily readable. Using the creation dates and content, one can determine whether the specific DCR was downloaded already or not (can take up to a couple of minutes for new DCR's to appear). 
  
  - DCR sample:
  
    `{"dataSources":[{"configuration":{"scheduledTransferPeriod":"PT1M","xPathQueries":["ForwardedEvents!*"]},"id":"eventLogsDataSource","kind":"winEventLog","streams":[{"stream":"SECURITY_WEF_EVENT_BLOB","solution":"SecurityInsights"}],"sendToChannels":["ods-XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXXXX"]}],"channels":[{"endpoint":"https://XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXXXX.ods.opinsights.azure.com","id":"ods-XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXXXX","protocol":"ods"}]}`

    - Explanation:
      - Xpath = "ForwardedEvents!*"
      - Data type = "SECURITY_WEF_EVENT_BLOB"
      - workspace id= XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXXXX

#Agent can't send data/has delays in ingestions

If the previous steps are fine but there is no data visible in the workspace/data 

- Sometimes there can be indicative errors in the agent log file- The log files are in the following directory:
  - `C:\WindowsAzure\Resources{some_number}}._WEFCollectorMachine.AMADataStore\Configuration`
  - `C:\WindowsAzure\Logs\Plugins\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent{agent version}`

- Sort the files by datetime and provide the latest one (the one with the latest number called `MonAgentHost.{some_number}` or `extension/extensionHealth.{latest_number}` Open the file and search for any indicative errors that might point to the error (fault Xpath for example).

#Scenarios
- Agent is not getting downloaded to the machine:
  - If there is no running agent on the machine please verify that there is a DCR in the workspace pointing to the specific machine in question. If there isn't instruct the customer to create one.
- If there is a DCR but the agent is still not loaded, ask the customer to create a dummy DCR and deleting it. That should retrigger the agent download mechanism.
- If the agent is still not downloaded you can suggest to the customer to install it manually: [Install and manage Azure Monitor Agent - Azure Monitor | Microsoft Learn](https://learn.microsoft.com/en-us/azure/azure-monitor/agents/azure-monitor-agent-manage?tabs=azure-portal#install-agent-extension)

- Data missing/delay in data.
  - The issue might be caused due to failure to process the DCR itself. This usually happens because of a fault Xpath. Whenever a DCR is created with a fault Xpath it can cause the agent to mal-function. Look for any indicative message in the agent log file (section C Diagnosis for more). Also ask the customer for the Xpath he is using and try to recreate the issue with the test machine provided below. When creating the DCR you can put the xpath here: If you are able to reproduce the issue, it probably means the Xpath is wrong (there are many online tools to verify this too). Also it might be that the customer crossed some sort of limit.

# Advance TSG

If the situation above is not the case though try to follow the following [Workspace Ingestion Investigation](https://eng.ms/docs/cloud-ai-platform/security/cloud-security-group/sentinel/microsoft-azure-sentinel/azure-sentinel-operational-guides/helpguides/gt/workspaceinvestigation).


#FAQ

- What are the best practices? 5K EPS for 1 DCR with at least 8 cores CPU's and 10GB remaining of free disk space.
- How to set up the WEF infrustructure? It is very complexed and not supported by us. Manuals can be found online.

# Boundaries

[Incident-565167633 Details - IcM](https://portal.microsofticm.com/imp/v5/incidents/details/565167633/summary): Sentinel does not have a direct involvement in how SecurityEvent data is collected or processed.
We are initiating the installation of the AMA agent on the customers machines, defining which events should be collected with a DCR and we have the ability to manipulate the data during the ingestion with a workflow.
During the collection and ingestion process of SecurityEvent data, Sentinel does not hold the data at any time or has the ability to decide when it should be collected or processed.

---

:::template /.templates/Wiki-Feedback.md 
:::

---

:::template /.templates/Ava-GetHelp.md 
:::
