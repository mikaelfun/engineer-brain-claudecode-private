---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Windows/Troubleshooting Guides/AMA Windows: TSG:  Collection - Heartbeat"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/AMA%20Windows/Troubleshooting%20Guides/AMA%20Windows%3A%20TSG%3A%20%20Collection%20-%20Heartbeat"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Scenario
**ALL** of the following are TRUE:
- We have verified we are NOT in an installation scenario ([VM](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1464466/AMA-Windows-TSG-Installation-(Azure-Virtual-Machine)), [Arc](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1584257/AMA-Windows-TSG-Installation-(Azure-Arc-Machine)))
    - Extension is installed successfully & [MonAgent* processes are running](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1464479/AMA-Windows-HT-Check-the-Azure-Monitor-Agent-(AMA)-Processes)
- We have verified we are NOT in a configuration scenario ([VM](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1585635/AMA-Windows-TSG-Configuration-(Azure-Virtual-Machine)), [Arc](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1587539/AMA-Windows-TSG-Configuration-(Azure-Arc-Machine)))
    - Configchunks are present
- The [heartbeat is not present](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1590094/AMA-HT-Query-Data-Log-Analytics-Workspace?anchor=scenario%3A-heartbeat) in the target Log Analytics Workspace (LAW) or heartbeat is inconsistent (i.e. not present every 1 minute, as expected)

##Support Area Path
```Azure/Azure Monitor Agent (AMA) on Windows machine/I created a DCR but the data is not in the Log Analytics Workspace/No Heartbeat events in Log Analytics Workspace```

# Documentation
- [Azure Monitor Agent - Overview](https://learn.microsoft.com/azure/azure-monitor/agents/agents-overview)
- [Azure Monitor Agent - Define Network Settings](https://learn.microsoft.com/azure/azure-monitor/agents/azure-monitor-agent-data-collection-endpoint?tabs=PowerShellWindows)
- [Create a Data Collection Rule](https://learn.microsoft.com/azure/azure-monitor/essentials/data-collection-rule-create-edit?tabs=CLI)
- [Associate a Data Collection Rule to a Resource](https://learn.microsoft.com/azure/azure-monitor/agents/azure-monitor-agent-data-collection?tabs=portal#add-resources)

# What you will need
- **ResourceID** of the machine where AMA is installed
- Admin or root access to the agent machine operating system

# Known Issues
- [AMA for Windows Known Issues](https://supportability.visualstudio.com/AzureMonitor/_search?text=Tags%3A%22AMAforWindows%22&type=workitem&pageSize=100&filters=Projects%7BAzureMonitor%7DWork%20Item%20Types%7BKnown%20Issue%7DStates%7BPublished%7D)
- [Agents PG Active Incidents](https://portal.microsofticm.com/imp/v3/incidents/search/advanced?sl=cfqxe5dz1xw)
#82430

# Logs to Collect
- [AMA Troubleshooter for Windows](https://learn.microsoft.com/azure/azure-monitor/agents/troubleshooter-ama-windows?tabs=WindowsPowerShell)
    - ```...\nslookup.output.txt```
    - ```...\AgentDataStore\Tables\LogAnalyticsHeartbeats.csv```
    - ```...\AgentDataStore\Tables\MAEventTable.csv```
    - ```...\AgentDataStore\Tables\MAQosEvent.csv```
- [AMA Network Trace](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1585639/AMA-Windows-HT-Capture-a-Network-Trace?anchor=scenario%3A-ama)

# Troubleshooting
:::template /.templates/AMA-LatestVersion.md
:::

## Step 1: Is there a DCR associated that has the in-scope Log Analytics Workspace destination?
[AMA: HT: List Associated DCRs and DCEs - Overview](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1585645/AMA-HT-List-Associated-DCRs-and-DCEs)
[AMA: HT: Review Data Collection Rule (DCR) Config - Heartbeat Scenario](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1732149/AMA-HT-Review-Data-Collection-Rule-(DCR)-Config?anchor=scenario%3A-heartbeat)
- If an associated Data Collection Rule (DCR) meets the following condition, proceed to the next step:
    - The DCR has the in-scope Log Analytics Workspace destination.
- If an associated Data Collection Rule (DCR) does not meet the above condition, then we cannot expect a Heartbeat to arrive in a Log Analytics Workspace.

## Step 2: Where does the agent think it should be sending heartbeats?
[How-to review agent instruction set - Heartbeat scenario](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1590096/AMA-Windows-HT-Review-agent-instruction-set?anchor=scenario%3A-heartbeat)

- If the agent configuration shows the correct workspaceId to send HEALTH_ASSESSMENT_BLOB, proceed to the next step.
- If the agent does not show the correct workspaceId to send HEALTH_ASSESSMENT_BLOB, review the [DCR configuration](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1585645/AMA-HT-List-Associated-DCRs-and-DCEs) with the customer and ensure they have defined the correct Log Analytics Workspace (LAW) destination for their data.

## Step 3: Is the agent caching heartbeats locally?
[How-to review agent cached data - Heartbeat scenario](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1590100/AMA-Windows-HT-Review-agent-cached-data?anchor=scenario%3A-heartbeat)

- If the agent is caching heartbeats locally, proceed to the next step.
- If the agent is not caching heartbeats locally, verify the [agent processes are running](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1464479/AMA-Windows-HT-Check-the-Azure-Monitor-Agent-(AMA)-Processes) and review the MAEventTable.csv for errors.
- If we cannot mitigate with the above steps, follow instructions in the [Getting Help](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1590093/AMA-Windows-TSG-Collection-Heartbeat?anchor=getting-help) section below to escalate.

## Step 4: Did the agent complete the scheduled task?
[AMA Windows: HT: Review the MAEventTable.csv - Understanding task completion](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1739213/AMA-Windows-HT-Review-the-MAEventTable.csv?anchor=understanding-task-completion)
- If the scheduled task for the in-scope local store name from [step 2](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1590093/AMA-Windows-TSG-Collection-Heartbeat?anchor=step-2%3A-where-does-the-agent-think-it-should-be-sending-heartbeats%3F) **DOES** have an "Ending scheduled task ..." event, proceed to the next step.
- If the scheduled task for the in-scope local store name from [step 2](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1590093/AMA-Windows-TSG-Collection-Heartbeat?anchor=step-2%3A-where-does-the-agent-think-it-should-be-sending-heartbeats%3F) **DOES NOT** have an "Ending scheduled task ..." event, review [known issues](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1739213/AMA-Windows-HT-Review-the-MAEventTable.csv?anchor=known-issues-(task-scheduler)) to mitigate.
- If the scheduled task for the in-scope local store name from [step 2](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1590093/AMA-Windows-TSG-Collection-Heartbeat?anchor=step-2%3A-where-does-the-agent-think-it-should-be-sending-heartbeats%3F) **DOES NOT** have an "Ending scheduled task ..." event and the known issues do not help to mitigate this behavior, see the [Getting Help](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1590093/AMA-Windows-TSG-Collection-Heartbeat?anchor=getting-help) section below to escalate.

## Step 5: Is the agent logging errors locally?
[How-to review MAQosEvent.csv - Heartbeat scenario](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1590102/AMA-Windows-HT-Review-MAQosEvent.csv?anchor=scenario%3A-heartbeat)

- If there are only "Success = TRUE" values in the MAQosEvent.csv, proceed to the next step.
- If there are failures in the MAQoSEvent.csv, verify we can [connect to the endpoint](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1585643/AMA-Windows-HT-Test-connectivity-to-endpoints) that we discovered in [Step 2](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1590093/AMA-Windows-TSG-Collection-Heartbeat?anchor=step-2%3A-where-does-the-agent-think-it-should-be-sending-heartbeats%3F) and [Review Related Logs](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1585643/AMA-Windows-HT-Test-connectivity-to-endpoints?anchor=review-related-logs).
- If we cannot discover the cause of the failures to connect using the above steps, [Capture a Network Trace](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1585639/AMA-Windows-HT-Capture-a-Network-Trace?anchor=scenario%3A-ama) and [Review the Network Trace](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/913134/How-to-analyze-AMA-Network-Trace-ODS-Connection).
- If we are unable to use the Network Trace to ascertain the cause of the issue, see the [Getting Help](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1590093/AMA-Windows-TSG-Collection-Heartbeat?anchor=getting-help) section below to escalate.

## Step 6: Are the heartbeats present in ingestion pipeline?
[How-to review agent data in ingestion pipeline - Heartbeat scenario](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1590104/AMA-HT-Review-agent-data-in-ingestion-pipeline?anchor=scenario%3A-heartbeat)

- If HEALTH_STATUS_BLOB **IS** in ingestion pipeline, see the [Getting Help](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1590093/AMA-Windows-TSG-Collection-Heartbeat?anchor=getting-help) section below to escalate.
- If HEALTH_STATUS_BLOB **IS NOT** in ingestion pipeline, [Capture a Network Trace](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1585639/AMA-Windows-HT-Capture-a-Network-Trace?anchor=scenario%3A-ama) and [Review the Network Trace](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/913134/How-to-analyze-AMA-Network-Trace-ODS-Connection).
- If we are unable to use the Network Trace to ascertain the cause of the issue, see the [Getting Help](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1590093/AMA-Windows-TSG-Collection-Heartbeat?anchor=getting-help) section below to escalate.

## Getting Help
:::template /.templates/TSG-GettingHelp-Agents.md
:::
# Product Group Escalation
---
:::template /.templates/TSG-ProductTeamEscalation.md
:::

# To do 
- Account for this scenario (CSS 2601220040013667 | IcM 21000000890084 | [Bug](https://dev.azure.com/msazure/One/_workitems/edit/36714464))
