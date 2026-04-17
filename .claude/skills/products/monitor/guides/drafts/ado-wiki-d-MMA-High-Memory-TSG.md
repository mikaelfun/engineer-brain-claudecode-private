---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Microsoft Monitoring Agent (MMA) for Windows/Troubleshooting Guides/Troubleshooting MMA High Memory Consumption"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FMicrosoft%20Monitoring%20Agent%20%28MMA%29%20for%20Windows%2FTroubleshooting%20Guides%2FTroubleshooting%20MMA%20High%20Memory%20Consumption"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::
THIS IS A DRAFT WRITTEN BY PG IN OLD DAYS. THIS CONTENT WILL BE REVIWEED IN FUTURE. 
1. The assumption here is that the MonitoringHost process has been sitting at more than a few gigs of memory consumption for longer than a few hours. However, this could be expected given demands on what is being collected and how .Net manages memory. The key item to note is whether or not memory consumption for MonitoringHost has level off or just rises continuously.

1. One thing to test and see if memory is truly leaked or simply waiting for Garabage Collection to occur is to use TestLimit to force the consumption of a large chunk of memory. This will induce stress on the system and should induce garabage collection if enough demand/stress is introduced. You can find TestLimit here: https://blogs.msdn.microsoft.com/vijaysk/2012/10/26/tools-to-simulate-cpu-memory-disk-load/ . You want to look for the section titled, "Simulate High Memory Usage" and here you will find an example of running it. The important part is to have it consume enough memory on the system to induce the required stress to force Garbage Collection to occur. It might take a few runs at increasing amounts to get GC to kick in.

1. How long does it take for the memory consumption rise back to the levels the customer is noting? It is important to have this in addition to how much memory the agent has consumed at its high watermark so you know if any troubleshooting you do is making a difference.

1. If TestLimit does not cause the memory to go down then there maybe a memory leak and hang dumps should be collected, follow the process to collect this data here: [Windows Agent and Hang Dumps](https://dev.azure.com/Supportability/AzureLogAnalytics/_wiki/wikis/Azure-Log-Analytics.wiki/50072/Windows-Agent-and-Hang-Dumps). Once this data is collected precede to the next step to continue troubleshooting.

1. The next course of action is to try and sort out what might be contributing to the memory consumption. What configuration data has been changed recently. You can see what Solutions were added to the workspace by running this query in the workspace, make appropriate changes to the machine name:
```
Heartbeat 
| where Computer == "Eolh"
| where TimeGenerated > ago(30d)
| summarize arg_max(TimeGenerated, *) by Computer, Solutions
| order by TimeGenerated desc
```
5. Looking at the query results does the impacted machine show a new solution on board just prior to the issue starting to occur? If yes, make notes of this in the case.

1. If other machines are being impacted double check the query above against one or two of those machines and see if things continue to line up timewise. The goal here is to not fix the issue rather try and pin down what is causing it.

1. If a trend surfaces and impacted machines show the solution added, try temporarily disabling the suspected solution pack by using this command:  [Set-AzureRmOperationalInsightsIntelligencePack](https://docs.microsoft.com/powershell/module/azurerm.operationalinsights/set-azurermoperationalinsightsintelligencepack?view=azurermps-6.13.0) . 

1. If the high memory issue is not causing a problem on the machines let some of the target agents alone. Make note of these machines but restart a few agents, using the commands below from and Administrative Command Prompt. Be sure to note the time and machine names in your notes to keep track.
```
Net Stop HealthService
Net Start HealthService
```

10. Now wait and watch, does memory rise back to the report high watermark? Does it take the same amount of time? 


