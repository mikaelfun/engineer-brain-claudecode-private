---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Microsoft Monitoring Agent (MMA) for Windows/Troubleshooting Guides/Troubleshooting MMA for Windows Perf Counter Collection"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Agents/Microsoft%20Monitoring%20Agent%20%28MMA%29%20for%20Windows/Troubleshooting%20Guides/Troubleshooting%20MMA%20for%20Windows%20Perf%20Counter%20Collection"
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
- Log Analytic Windows MMA agent unable to upload ANY Performance Counter from specific Windows machine.

Before starting investigation, let's make sure we are clear that counter is producing values in local windows machine.
 [How to check Windows Perf counter is working on local Machine](/Monitor-Agents/Agents/How%2DTo/General/How-to-check-Windows-Perf-counter-is-working-on-local-Machine)


 **Customer may need to work with Microsoft support team that owns the counter.** 
For example SQL team owns SQL counters; windows support team owns basic windows counters. In case of third-party application counters; customer would need to work with 3rd party support to address those corrupt counters.

# Scoping Questions
---
Before starting investigation, we must have key information mentioned below in our DDX format case notes.
This initial block of information should be discoverable in the Verbatim section of the case and in Azure Support Center(ASC) see: [Azure Support Center - Find basic Log Analytics Workspace information](/Monitor-Agents/Agents/How%2DTo/General/Azure-Support-Center-%2D-Find-basic-Log-Analytics-Workspace-information)).

- [ ] Azure Subscription ID where the Log Analytics Workspace is located
- [ ] Workspace ID the MMA Agent has been onboarded to
- [ ] Workspace Name
- [ ] Region Workspace is located
- [ ] Data Retention policy
- [ ] Pricing Tier assigned to the Workspace
- [ ] Have workspace reached its daily upload cap limit? 
[How to check if daily upload Cap is reached?](https://supportability.visualstudio.com/AzureLogAnalytics/_wiki/wikis/Azure-Log-Analytics.wiki/283598/How-to-Check-if-the-daily-cap-was-reached)
- [ ] Confirm Agent HB is uploaded every 60 seconds? Otherwise please follow [Troubleshooting MMA Missing Heartbeats](/Monitor-Agents/Agents/Microsoft-Monitoring-Agent-\(MMA\)-for-Windows/Troubleshooting-Guides/Troubleshooting-MMA-Missing-Heartbeats)
- [ ] Are we unable to capture one Perf counter or all Perf counters (if enabled more than one in workspace) for this machine?
We can run Kusto query against workspace to learn that...

```
Perf | where Computer contains "irfanrbook" | summarize by CounterName

```

![image.png](/.attachments/image-01d32ff2-bedc-45c7-8fce-07d2e0ea563d.png)

- [ ] Are there other MMA agents able to upload Perf counter to same workspace? Feedback to this question can help during troubleshooting.
- [ ] Unable to upload Perf counter issue occur all the time or just during certain days or time frames? In short, are there any patterns?
- [ ] MMA Agent uploading data via OMS Gateway, or company proxy?
- [ ] Is this Direct Agent Scenario or SCOM Integration [How to Check If MMA Agent is Configured For SCOM](/Monitor-Agents/Agents/Microsoft-Monitoring-Agent-\(MMA\)-for-Windows/How%2DTo/How-to-Check-If-MMA-Agent-is-Configured-For-SCOM) to upload data? 

 Basically, we need to document following information collected from customer to understand Which Agent Scenario we are supporting. [Log Analytic Gateways & Supported Scenarios](/Monitor-Agents/Agents/Common-Concepts/Log-Analytic-Gateways-&-Supported-Scenarios) 

# Known Issues
#74465 74465

# Troubleshooting
- **Reoccurring Issue**: If issue is still happening then Check if MMA agent service is still running?
-  Correct the spelling of counter name in case customer misspell Performance counter name correct in workspace Agent configuration portal.
Image below shows agent configuration with correct counter name.

![image.png](/.attachments/image-d7648870-3a32-4185-8032-741f0ccb6d11.png)

Example of misspell Counter name  LogicalDisk(*)\% FreeSpace 
Example of correct Counter name LogicalDisk(*)\% Free Space (Please note space between Free Space)

In such case lookout for Operations Manager event log on agent machine for following event Id

```
Log Name:      Operations Manager
Source:        Health Service Modules
Date:          12/29/2021 1:10:47 PM
Event ID:      10102
Task Category: None
Level:         Warning
Keywords:      Classic
User:          N/A
Computer:      irfanrbook.northamerica.corp.microsoft.com
Description:
In PerfDataSource, could not resolve counter LogicalDisk, % FreeSpace, All Instances. Module will not be unloaded. 
One or more workflows were affected by this.  

Workflow name: Microsoft.IntelligencePacks.DynamicPerformanceCollector 
Instance name:  
Instance ID: {3F69AA76-F955-0B3C-0CC8-44F31571760B} 
Management group: AOI-5ae1b889-xxxx-AAA-1234-oooooooooooo
```




- **Impact of Issue:** Are there other machines successfully able to upload Perf counter to same workspace? If answer is **YES** then what is different between those machines and our agent in questions? Operating System version, Service pack version, .net version, network or subnet or even different proxy can make huge difference.
- **QUERY**: Let's confirm customer is using right table ( Perf ) to query right counter name.
- **V1 vs V2 Counters**: Are we investigating V1 or V2 Perf Counters? Please check article [Windows Missing Perf Counters](/Monitor-Agents/Agents/Common-Concepts/Windows-Missing-Perf-Counters)


# Data Collection

- [ ] Once we build synopsis of the issue in detail, we must agree with customer on one or few machines to focus on this case.
- [ ] we should collect Windows Agent Support tools traces [Windows Support Tool Guide](/Monitor-Agents/Agents/Microsoft-Monitoring-Agent-\(MMA\)-for-Windows/How%2DTo/Windows-Support-Tool-Guide) while issue is occurring.
- [ ] Once trace data via Windows Support is captured, please review

1- Event logs:
Operations manager
Applications
System

2- Analyze etl trace files with help of a SME before raising ICM to request help from PG.

**NOTE:** 
Although Perf counter collections occurs as per frequency in seconds specific in workspace portal but initial perf data collection for any agent can take up to 5-10 minutes first time.
We must allow at least 15 - 20 minutes of Agent Trace data collection and keep requesting customer to produce some activity that produce values for those counters so Agent can capture traces of upload event.

# Which ICM Template to use?
If your SAP is correct as per screenshot, then you will automatically get right Agent template when raising ICM via Azure support center. 

Please make sure ICM is approved by TA or SME to make sure you have right set of data captured and have initial analysis of data as well.

Getagentinfo.ps1 data collection should be performed from affected machine when issue i produced (event Id is produced that is not detected by agent)
![image.png](/.attachments/image-c0728d29-7d14-4258-abe8-a2499df0693b.png)