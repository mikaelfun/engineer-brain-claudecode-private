---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Windows/How-To/AMA Windows: HT: Review agent instruction set"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/AMA%20Windows/How-To/AMA%20Windows%3A%20HT%3A%20Review%20agent%20instruction%20set"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Overview
The agent configuration is defined by data collection rules (DCR). The agent uses the JSON of the DCRs to define an instruction set that defines, specifically, what the agent will be collecting, the local store name of the data, the Azure data type, and where it will send that data.

```...\AgentTroubleshooterOutput-{date}\AgentDataStore\Mcs\mcsconfig.latest.xml```

# Prerequisites
This how-to assumes that you've already [Run the agent troubleshooter](https://learn.microsoft.com/azure/azure-monitor/agents/troubleshooter-ama-windows?tabs=WindowsPowerShell#run-the-troubleshooter) and have those logs.

# Terms
- **Local store name:** This is the name of the file that we create locally to cache this data.
    - Also known as: persistent store, local cache, TSF files, eventName
- **logType:** This is the InputType column when we're [investigating the ingestion pipeline data](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1590104/AMA-HT-Review-agent-data-in-ingestion-pipeline).
- **DCR immutable Id:** Globally unique id for DCRs that defines which DCR we got this configuration from.
- **endpoint (uri):** This is the destination we'll be sending the data to (must be able to reach this endpoint).

With the endpoint (uri) value, [Use the workspaceID to get the resourceID](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1590098/AMA-HT-Get-Log-Analytics-Workspace-ResourceID?anchor=workspaceid) of the destination Log Analytics Workspace.

# Scenario: Heartbeat
Where should we be sending heartbeats?

![image.png](/.attachments/image-83495d83-65a6-487c-9f1c-c79b52c1a56b.png)

![image.png](/.attachments/image-c01b87f0-deb3-4042-ba13-58d4dbe7c6ee.png)

# Scenario: Performance Counters

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#d7eaf8">

**Note:** 
If the mcsconfig.latest.xml file is missing - see the following known issue:
#84654
</div>

What counters should we collect (Events\CounterSets\CounterSet\Counter)?

![image.png](/.attachments/image-ae89ddae-5b21-4817-a716-46d730085f49.png)

Where should we be sending performance counters (EventStreamingAnnotation)?
*Using the local store name from the previous step, find the **EventStreamingAnnotation** that corresponds*

![image.png](/.attachments/image-09949b56-a0bd-4a7e-a8e8-86eaad079c74.png)

## Known Issues (Performance Counters)
#84654

# Scenario: Windows Event Log
What XPath query should we subscribe to?

![image.png](/.attachments/image-0a7af871-3355-488b-9db0-1add4c81d878.png)

Where should we be sending Windows events ?
*Using the local store name from the previous step, find the **EventStreamingAnnotation** that corresponds*

![image.png](/.attachments/image-888a0f9b-b910-464d-8c24-c78da74d07ed.png)

## Known Issues (Windows Event Log)

# Scenario: IIS Logs 
What IIS Log Files should we subscribe
 ![image.png](/.attachments/image-f39eb642-685c-4b40-9ff1-a8b7d300fd57.png)

Where should we be sending IIS Logs Data?

![image.png](/.attachments/image-75927865-1b81-4b79-9d8e-6f3926965da4.png)


