---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Linux/Troubleshooting Guides/AMA Linux: TSG:  Collection - Heartbeat"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/AMA%20Linux/Troubleshooting%20Guides/AMA%20Linux%3A%20TSG%3A%20%20Collection%20-%20Heartbeat"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Scenario
**ALL** of the following are TRUE:
- The AMA **extension is installed** successfully & the AMA [processes are running](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1697667/AMA-Linux-HT-Check-the-Azure-Monitor-Agent-(AMA)-Processes) (agentlauncher, amacoreagent, mdsd). If not (or you aren't sure), follow the installation TSG instead: ([VM](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1136283/AMA-Linux-TSG-Installation-(Azure-Virtual-Machine)), [Arc](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1702158/AMA-Linux-TSG-Installation-(Azure-Arc-Machine))).
- The AMA **configchunks are present**. If not (or you aren't sure), follow the configuration TSG instead: ([VM](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1703539/AMA-Linux-TSG-Configuration-Azure-Virtual-Machine-(johnsirmon)), [Arc](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1705012/AMA-Linux-TSG-Configuration-(Azure-Arc-Machine))).
    - ```/etc/opt/microsoft/azuremonitoragent/config-cache/configchunks/*.json```
- The [heartbeat is **NOT** present](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1590094/AMA-HT-Query-Data-Log-Analytics-Workspace?anchor=scenario%3A-heartbeat) in the target Log Analytics Workspace (LAW).

##Support Area Path
```Azure/Azure Monitor Agent (AMA) on Linux machine/I created a DCR but the data is not in the Log Analytics Workspace/No Heartbeat events in Log Analytics Workspace```

# Documentation
- [Azure Monitor Agent - Overview](https://learn.microsoft.com/azure/azure-monitor/agents/agents-overview)
- [Azure Monitor Agent - Define Network Settings](https://learn.microsoft.com/azure/azure-monitor/agents/azure-monitor-agent-data-collection-endpoint?tabs=PowerShellWindows)
- [Create a Data Collection Rule](https://learn.microsoft.com/azure/azure-monitor/essentials/data-collection-rule-create-edit?tabs=CLI)
- [Associate a Data Collection Rule to a Resource](https://learn.microsoft.com/azure/azure-monitor/agents/azure-monitor-agent-data-collection?tabs=portal#add-resources)

# What you will need
- **ResourceID** of the machine where AMA is installed
- root access to the agent machine operating system

# Known Issues
- [AMA for Linux Known Issues](https://supportability.visualstudio.com/AzureMonitor/_search?text=Tags%3A%22AMAforLinux%22&type=workitem&pageSize=100&filters=Projects%7BAzureMonitor%7DWork%20Item%20Types%7BKnown%20Issue%7DStates%7BPublished%7D)
- [Agents PG Active Incidents](https://portal.microsofticm.com/imp/v3/incidents/search/advanced?sl=x4rel0tgnqd)

# Logs to Collect
- [AMA Troubleshooter for Linux](https://learn.microsoft.com/azure/azure-monitor/agents/troubleshooter-ama-linux?tabs=redhat%2CGenerateLogs#run-the-troubleshooter)
    - ...\mdsd\logs\mdsd.err
    - ...\mdsd\logs\mdsd.info
- [AMA Network Trace](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1590073/AMA-Linux-HT-Network-Trace?anchor=scenario%3A-ama)

# Troubleshooting
:::template /.templates/AMA-LatestVersion.md
:::

## Step 1: Is the heartbeat actually missing?
[How-to check heartbeat](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1590094/AMA-HT-Query-Data-Log-Analytics-Workspace?anchor=scenario%3A-heartbeat)

- If the heartbeat is missing, proceed to the next step.
- If the heartbeat is not missing, review how the customer is querying the heartbeat.

## Step 2: Where does the agent think it should be sending heartbeats?
[How-to review agent instruction set - Heartbeat scenario](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1710334/AMA-Linux-HT-Review-agent-instruction-set?anchor=scenario%3A-heartbeat)

- If the agent configuration matches the expected destination, proceed to the next step.
- If the agent configuration does **NOT** match the expected destination, review the [associated DCRs](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1585645/AMA-HT-List-Associated-DCRs-and-DCEs) and update them if required.
- If the associated DCRs match the expected destination, but the agent configuration doesn't match the associated DCRs, follow the configuration TSG instead: ([VM](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1703539/AMA-Linux-TSG-Configuration-Azure-Virtual-Machine-(johnsirmon)), [Arc](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1705012/AMA-Linux-TSG-Configuration-(Azure-Arc-Machine))).

## Step 3: Is the agent logging errors locally?
[How-to review mdsd.err - Heartbeat scenario](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1710890/AMA-Linux-HT-Review-mdsd.err?anchor=scenario%3A-heartbeat)

- If there are errors in mdsd.err, review the [known issues](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1710890/AMA-Linux-HT-Review-mdsd.err?anchor=known-issues-(heartbeat)).
- If none of the known issues explains why Heartbeats are missing, proceed to the next step.

## Step 4: Is the agent logging heartbeats locally?
[How-to review mdsd.info - Heartbeat scenario](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1710889/AMA-Linux-HT-Review-mdsd.info)

- If the agent is logging heartbeats locally, proceed to the next step.
- If the agent is not logging heartbeats locally and the [mdsd process is running](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1697667/AMA-Linux-HT-Check-the-Azure-Monitor-Agent-(AMA)-Processes]), we may have a "zombie process".
    - If the agent is not running the [latest available version](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1796093/AMA-HT-Check-latest-available-agent-version), upgrade to the latest agent version and test again (latest agent will be required for debug scenarios).
    - If the agent is running the [latest available version](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1796093/AMA-HT-Check-latest-available-agent-version), check this [known issue](https://supportability.visualstudio.com/AzureMonitor/_workitems/edit/105678). If the known issue doesn't explain this scenario, capture a [gcore](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1429527/AMA-Linux-HT-Mdsd-core-dump-or-gcore?anchor=scenario%3A-mdsd-is-running-and-we-need-memory-dump) and see the [Getting Help](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1343718/AMA-Linux-TSG-Collection-Heartbeat?anchor=getting-help) section below to escalate.

## Step 5: Are the heartbeats present in the Azure ingestion pipeline?
[How-to review agent data in ingestion pipeline - Heartbeat scenario](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1590104/AMA-HT-Review-agent-data-in-ingestion-pipeline?anchor=scenario%3A-heartbeat)

- If HEALTH_STATUS_BLOB **IS** in ProcessedChunks and we've confirmed the [Heartbeat is **NOT** present in the destination](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1590094/AMA-HT-Query-Data-Log-Analytics-Workspace?anchor=scenario%3A-heartbeat), see the [Getting Help](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1343718/AMA-Linux-TSG-Collection-Heartbeat?anchor=getting-help) section below to escalate.
- If HEALTH_STATUS_BLOB **IS NOT** in ProcessedChunks, [Capture a Network Trace](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1590073/AMA-Linux-HT-Network-Trace?anchor=scenario%3A-ama) and [Review the Network Trace](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/913134/How-to-analyze-AMA-Network-Trace-ODS-Connection).
- If we are unable to use the Network Trace to ascertain the cause of the issue, see the [Getting Help](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1343718/AMA-Linux-TSG-Collection-Heartbeat?anchor=getting-help) section below to escalate.

## Getting Help
:::template /.templates/TSG-GettingHelp-AgentsLinux.md
:::
# Product Group Escalation
---
:::template /.templates/TSG-ProductTeamEscalation.md
:::