---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/How-To/How To: Monitor a process with Azure Monitoring"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FHow-To%2FHow%20To%3A%20Monitor%20a%20process%20with%20Azure%20Monitoring"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# How To: Monitor a Process with Azure Monitoring

## Background
A common question when working with Azure Monitor is monitoring of Windows services and processes running on Windows servers. In Azure Monitor we can monitor Windows Services and other processes the same way: by looking at process ID as a performance counter.

Even if a process can be monitored by looking at events, it is not always a reliable source. The challenge is that there is no active monitoring checking if the process is running at the moment when looking at only events.

> **Important**: Each process writes a number of performance counters. None of these are collected by default in Azure Monitor, but easy to add under Windows Performance Counters.

## Collecting Perf counter for process using Legacy Agent
Out of the box there is no such Perf counter selection available but we can manually define counter collection criteria:
- Object Name: **Process**
- Counter Name: **ID Process**

## Collecting Perf counter for process using DCR via AMA
Out of the box DCR doesn't exist but we can create a DCR to collect performance counter:
- Object Name: **Process**
- Counter Name: **ID Process**

## Query to check process status
```kql
Perf
| where (Computer == "win2022") and (CounterName == "ID Process") and (ObjectName == "Process")
| where InstanceName == "notepad"
| extend localTimestamp = TimeGenerated + 2h
| where TimeGenerated > ago(5m)
| project TimeGenerated, CounterValue, InstanceName
| order by TimeGenerated desc
```

The alert rule, if needed, can be configured to generate an alert if zero results was returned during the last X minutes.

> **Important Note**: Sometimes customers ask support to help monitoring a process using Change Tracking & Inventory extension. Please note Change Tracking only monitors Windows services, and not every process appears in services.msc as a Windows Service.
