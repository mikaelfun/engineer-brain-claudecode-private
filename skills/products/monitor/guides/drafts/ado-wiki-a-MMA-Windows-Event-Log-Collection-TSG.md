---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Microsoft Monitoring Agent (MMA) for Windows/Troubleshooting Guides/Troubleshooting MMA Windows Event Log Collection"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Agents/Microsoft%20Monitoring%20Agent%20%28MMA%29%20for%20Windows/Troubleshooting%20Guides/Troubleshooting%20MMA%20Windows%20Event%20Log%20Collection"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::
Applies To:
- Microsoft Monitoring Agent :- All versions

[[_TOC_]]

Note: All IPs and machine names in this page are from test lab and don't compromise any Pii data.
# Scenario
---
The customer reports one or combination of the following issues.
- Log Analytic Windows MMA agent unable to upload ANY Event from specific Windows Event Log.
- Log Analytic Windows MMA agent unable to upload specific Event ID to workspace. 

An ONLINE-COURSE S9216411 is available as Advanced training on this subject at [Azure Monitoring Learning Path](https://ready.azurewebsites.net/csslearning/3297)
# Scoping Questions
---
Before starting investigation, we must have key information mentioned below in our DDX format case notes.
This initial block of information should be discoverable in the Verbatim section of the case and in Azure Support Center(ASC) see: [Azure Support Center - Find basic Log Analytics Workspace information](/Monitor-Agents/Agents/How%2DTo/General/Azure-Support-Center-%2D-Find-basic-Log-Analytics-Workspace-information).

- [ ] Azure Subscription ID where the Log Analytics Workspace is located
- [ ] Workspace ID the MMA Agent has been onboarded to
- [ ] Workspace Name
- [ ] Region Workspace is located
- [ ] Data Retention policy
- [ ] Pricing Tier assigned to the Workspace
- [ ] Have workspace reached its daily upload cap limit? [How to check if daily upload Cap is reached?](https://supportability.visualstudio.com/AzureLogAnalytics/_wiki/wikis/Azure-Log-Analytics.wiki/283598/How-to-Check-if-the-daily-cap-was-reached)
- [ ] MMA Agent uploading data via OMS Gateway, or company proxy?
- [ ] Is this Direct Agent Scenario or SCOM Integration [How to Check If MMA Agent is Configured For SCOM](/Monitor-Agents/Agents/Microsoft-Monitoring-Agent-\(MMA\)-for-Windows/How%2DTo/How-to-Check-If-MMA-Agent-is-Configured-For-SCOM) to upload data? 

 Basically, we need to document follohttps://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/605666/Troubleshooting-MMA-Missing-Heartbeatswing information collected from customer to understand Which Agent Scenario we are supporting [Log Analytic Gateways & Supported Scenarios](/Monitor-Agents/Agents/Common-Concepts/Log-Analytic-Gateways-&-Supported-Scenarios)

# Troubleshooting
- Always encourage using latest version of MMA agent. Our customers deserve latest and stable code. [Available Latest Version](https://docs.microsoft.com/azure/virtual-machines/extensions/oms-windows#agent-and-vm-extension-version)
- Did we confirm this Agent machine is connected to Right workspace where Perf counter collection is enabled? If not, please connect agent to right workspace.
- Let's confirm Agent is uploading basic heartbeat to workspace where Perf counter collection is enabled. Otherwise follow this article to troubleshoot Heartbeat issue first [Windows Agent not reporting data or [Heartbeat data is missing]().
- Did we confirm this Agent machine is uploading other data types like Perf Counter collections to workspace? If customer never enabled Perf counter collections, can we test it for few minutes to confirm issue is beyond Event Log collections? 
  
_**Why not just checking heartbeat of MMA Agent is sufficient?**

_Because Heartbeat data is not billable. This means if workspace is hitting daily upload Cap Limit, then no other data type will be uploaded. Heartbeat data should always get uploaded even workspace reaches daily upload cap limit._
 
- Did the Agent machine upload Event Log data from other event logs when issue occurred? 
We can run Kusto query against workspace to learn that

//Display Names of Windows Event Logs Collected

Event
| where Computer contains "Machine Name"
| summarize by EventLog

![image.png](/.attachments/image-820bc4de-2fcb-4364-9e1e-29d5b2424665.png)

- Plese check customer's Kusto query syntax wise and conditions and operators used are correct? Like right machine name or right Event Id etc in kusto query?
- Are we sure customer typed correct Event Log Name when enabling Event Log Collection?
example: May be customer mistyped Event Log name as **Applications** for event log collection name instead of right name i.e **Application**
Look out for following event Id in Operations Manager event log of the agent machine.

```
Log Name:      Operations Manager
Source:        Health Service Modules
Date:          12/29/2021 12:56:24 PM
Event ID:      26002
Task Category: None
Level:         Warning
Keywords:      Classic
User:          N/A
Computer:      irfanrbook.northamerica.corp.microsoft.com
Description:
The Windows Event Log Provider was **unable to open the Applications event log on computer** 'irfanrbook.northamerica.corp.microsoft.com' for reading. The provider will retry opening the log every 30 seconds.
Most recent error details: The specified channel could not be found.
 
One or more workflows were affected by this.  

Workflow name: Microsoft.IntelligencePacks.DynamicEventCollector 
Instance name:  
Instance ID: {3F69AA76-F955-0B3C-0CC8-44F31571760B} 
Management group: AOI-5ae1b889-xxxx-AAA-1234-oooooooooooo
```

- Are there other MMA agents having same event log upload issue? If yes, then we must check if issue is at workspace level or customer's network level.

**How to prove?**

- Can customer create new Test-Workspace to upload Event log for testing? We want to learn if it's really issue with workspace reported in support ticket or with every workspace? If We are unable to upload data to new Test-workspace as well then, most likely its network infrastructure / proxy issue impacting multiple machines.

- Can supported engineer connect to customer's workspace (with customer's permissions) for few minutes to validate if event log collect works for that workspace from a machine outside of customer's infrastructure?

- Unable to upload event log issue occur all the time or just during certain days or time frames? In short, **any patterns**?

# Data Collection

- [ ] Once we build synopsis of the issue in detail, we must agree with customer on one or few machines to focus on this case.
- [ ] We should collect Windows Agent Support tools traces via [Windows Support Tool Guide](/Monitor-Agents/Agents/Microsoft-Monitoring-Agent-\(MMA\)-for-Windows/How%2DTo/Windows-Support-Tool-Guide) while issue is occurring.

- [ ] Once trace data via Windows Support Tool is captured, please review Operations manager, Applications and system event logs along with Agent traces etl files or seek help from local Agent SME or TA before raising ICM to request help from PG.

**NOTE**
Although event log collection occurs every 30 seconds as workflow still, we must allow at least 15 - 20 minutes of Agent Trace data collection and keep requesting customer to [produce some events or specific event Id few times for agent to capture traces.



# Which ICM Template to use?
If your SAP is correct as per screenshot, then you will automatically get right Agent template when raising ICM via Azure support center. 

Please make sure ICM is approved by TA or SME to make sure you have right set of data captured and have initial analysis of data as well.

Getagentinfo.ps1 data collection should be performed from affected machine when issue i produced (event Id is produced that is not detected by agent)
![image.png](/.attachments/image-c0728d29-7d14-4258-abe8-a2499df0693b.png)

# Known Issues
---
- #36599
- #74465 
 

