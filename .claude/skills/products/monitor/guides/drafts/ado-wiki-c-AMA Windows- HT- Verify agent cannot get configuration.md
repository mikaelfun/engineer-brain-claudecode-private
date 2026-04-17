---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Windows/How-To/AMA Windows: HT: Verify agent cannot get configuration"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/AMA%20Windows/How-To/AMA%20Windows%3A%20HT%3A%20Verify%20agent%20cannot%20get%20configuration"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Overview
In some cases, our agent has previously been able to acquire a configuration, but is no longer able to. This how-to will go through the steps to verify whether or not that is the case.

# Process
- [Stop the Azure Monitor Agent](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/766329/How-to-Restart-the-Azure-Monitor-Agent-Windows)

- Delete the AuthToken-MSI.json
```C:\WindowsAzure\Resources\AMADataStore.{MachineName}\mcs\AuthToken-MSI.json```

- Delete the .json files in the configchunks folder
```C:\WindowsAzure\Resources\AMADataStore.{MachineName}\mcs\configchunks\*.json```

- [Start the Azure Monitor Agent](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/766329/How-to-Restart-the-Azure-Monitor-Agent-Windows)

- Wait 5 minutes to see if the deleted files return
    - If they do not, then we can confirm that the agent is no longer able to acquire its config
        - We should be following [AMA Windows: TSG: Configuration (Azure Virtual Machine)](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1585635/AMA-Windows-TSG-Configuration-(Azure-Virtual-Machine)) or [AMA Windows: TSG: Configuration (Azure Arc Machine)](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1587539/AMA-Windows-TSG-Configuration-(Azure-Arc-Machine))
    - If they do return, then we can confirm that the agent is able to acquire its config.
        - We should be following [AMA Windows: TSG: Heartbeat](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1343752/AMA-Windows-TSG-Collection-Heartbeat).

# Common Issues
