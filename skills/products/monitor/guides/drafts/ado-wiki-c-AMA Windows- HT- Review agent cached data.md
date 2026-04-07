---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Windows/How-To/AMA Windows: HT: Review agent cached data"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/AMA%20Windows/How-To/AMA%20Windows%3A%20HT%3A%20Review%20agent%20cached%20data"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Overview
The agent collects data and caches it locally before sending to the defined destination.

# Prerequisites
This how-to assumes that you've already [Run the agent troubleshooter](https://learn.microsoft.com/azure/azure-monitor/agents/troubleshooter-ama-windows?tabs=WindowsPowerShell#run-the-troubleshooter) and have those logs.

# Scenario: Heartbeat
```Troubleshooter: ...\AgentDataStore\Tables\LogAnalyticsHeartbeats.csv```

![image.png](/.attachments/image-b87e9722-61de-4a91-9914-e4033aa32d13.png)

NOTE: The process responsible for creating these records is the MonAgentCore.exe process. If we are not seeing consistent local heartbeats, we should investigate the MonAgentHost log file, which is where MonAgentCore writes it's log.

## Known Issues: Heartbeat
[Pending: Agent core process terminated with code...]()

# Scenario: Performance Counters (Microsoft-Perf)
Determine the local store name from the [agent instruction set](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1590096/AMA-Windows-HT-Review-agent-instruction-set?anchor=scenario%3A-performance-counters).

```Troubleshooter: ...\AgentDataStore\Tables\{localStoreName}.csv```
```Example: ...\AgentDataStore\Tables\c11900347338608146328_9397282252744225205.csv```

The below screenshot shows a successful collection of performance counters and their values at the time listed in column A:

![image.png](/.attachments/image-82a60e58-9453-4fb8-b158-4b0fb5a58c1a.png)

## Known Issues: Performance Counters

# Scenario: Windows Event Log
Determine the local store name from the�[agent instruction set](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1590096/AMA-Windows-HT-Review-agent-instruction-set?anchor=scenario%3A-iis-logs)

```Troubleshooter: ...\AgentDataStore\Tables\{localStoreName}.csv```
```Example: ...\AgentDataStore\Tables\cc14527420687904246648_546419284751770569.csv```

The below screenshot shows a successful collection of Windows events and their properties at the time listed in column A:

![image.png](/.attachments/image-41d59b35-63bc-42df-a04d-b470eff5146e.png)

## Known Issues: Windows Event Log

# Scenario: IIS Log
Determine the local store name from the�[agent instruction set](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1590096/AMA-Windows-HT-Review-agent-instruction-set?anchor=scenario%3A-iis-logs)

```Troubleshooter: ...\AgentDataStore\Tables\{localStoreName}.csv```
```Example: ...\AgentDataStore\Tables\c3854215445833175324_15172972868530079658.csv```

The below screenshot shows a successful collection of performance counters and their values at the time listed in column A:

![image.png](/.attachments/image-cb9c2b29-3b80-4565-89bd-43adeda8b7b6.png)
