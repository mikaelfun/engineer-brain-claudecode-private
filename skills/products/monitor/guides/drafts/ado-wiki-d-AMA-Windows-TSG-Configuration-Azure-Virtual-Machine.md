---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Windows/Troubleshooting Guides/AMA Windows: TSG:  Configuration (Azure Virtual Machine)"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAzure%20Monitor%20Agent%20(AMA)%20-%20NEW%20STRUCTURE%2FAMA%20Windows%2FTroubleshooting%20Guides%2FAMA%20Windows%3A%20TSG%3A%20%20Configuration%20(Azure%20Virtual%20Machine)"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Scenario
**ALL** of the following are TRUE:
- The operating system is a **Windows** operating system on the [supported operating systems list](https://learn.microsoft.com/azure/azure-monitor/agents/azure-monitor-agent-supported-operating-systems#windows-operating-systems)
- The **Microsoft.Azure.Monitor.AzureMonitorWindowsAgent** extension status is "Provisioning succeeded"
- All of the following [agent processes are running](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1464479/AMA-Windows-HT-Check-the-Azure-Monitor-Agent-(AMA)-Processes):
    - AMAExtHealthMonitor
    - MonAgentHost
    - MonAgentLauncher
    - MonAgentManager
- At least one [Data Collection Rule (DCR) should be associated](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1585645/AMA-HT-List-Associated-DCRs-and-DCEs) with the resource

If the extension is not succeeded or processes are not running, use one of these instead: 
- [AMA Windows: TSG: Installation (Azure Virtual Machine)](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1464466/AMA-Windows-TSG-Installation-(Azure-Virtual-Machine))
- [AMA Windows: TSG: Installation (Azure Arc Machine)](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1584257/AMA-Windows-TSG-Installation-(Azure-Arc-Machine))
- [AMA Windows: TSG: Installation (Windows Desktop OS)](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1369217/AMA-Windows-TSG-Installation-(Windows-Desktop-OS))

**At least one** of the following are TRUE:
- AuthToken-MSI.json is missing
```C:\WindowsAzure\Resources\AMADataStore.{MachineName}\mcs\AuthToken-MSI.json```
- Configchunks are missing
```C:\WindowsAzure\Resources\AMADataStore.{MachineName}\mcs\configchunks\*.json```
- Mcsconfig.latest.xml is missing
```C:\WindowsAzure\Resources\AMADataStore.{MachineName}\mcs\mcsconfig.latest.xml```
#84654

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#d7eaf8">

**Note:** 
It is possible that we are in this scenario, but we do have an AuthToken-MSI.json and/or .json files in our configchunks folder. Usually when this happens, the agent was, at one point, able to acquire it's configuration, but it is no longer able to and the files that are present are old. In this scenario, check for errors in the following logs:
```C:\WindowsAzure\Logs\Plugins\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent\{version}\ExtensionHealth.*.log```
```C:\WindowsAzure\Resources\AMADataStore.{hostname}\Configuration\MonAgentHost.*.log```
</div>

##Support Area Path
```Azure/Azure Monitor Agent (AMA) on Windows machine/I created a DCR but the data is not in the Log Analytics Workspace/No Heartbeat events in Log Analytics Workspace```

# Documentation
- [Azure Monitor Agent - Overview](https://learn.microsoft.com/azure/azure-monitor/agents/agents-overview)
- [Azure Monitor Agent - Define Network Settings](https://learn.microsoft.com/azure/azure-monitor/agents/azure-monitor-agent-data-collection-endpoint?tabs=PowerShellWindows)

# What you will need
- **ResourceID** of the machine
- Admin access to the operating system

# Known Issues
- [AMA for Windows Known Issues](https://supportability.visualstudio.com/AzureMonitor/_search?text=Tags%3A%22AMAforWindows%22&type=workitem&pageSize=100&filters=Projects%7BAzureMonitor%7DWork%20Item%20Types%7BKnown%20Issue%7DStates%7BPublished%7D)
- [Agents PG Active Incidents](https://portal.microsofticm.com/imp/v3/incidents/search/advanced?sl=cfqxe5dz1xw)

# Logs to Collect
- [AMA Troubleshooter for Windows](https://learn.microsoft.com/azure/azure-monitor/agents/troubleshooter-ama-windows?tabs=WindowsPowerShell)
    - ```...\curl.output.txt```
    - ```...\ImdsMetadataResponse.json```
    - ```...\AgentDataStore\Configuration\MonAgentHost.*.log```
    - ```...\VmExtLogs\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent\{version}\Extension.*.log```
    - ```...\VmExtLogs\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent\{version}\ExtensionHealth.*.log```
    - ```...\nslookup.output.txt```
    - ```...\AgentDataStore\Tables\MAEventTable.csv```
    - ```...\AgentDataStore\Tables\MAQosEvent.csv```
- [AMA Network Trace](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1585639/AMA-Windows-HT-Capture-a-Network-Trace?anchor=scenario%3A-ama)

# Troubleshooting
:::template /.templates/AMA-LatestVersion.md
:::

## Step 1: Is there a Data Collection Rule (DCR) associated?
[How-to check if a DCR is associated](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1585645/AMA-HT-List-Associated-DCRs-and-DCEs)

- If a DCR is associated, proceed to the next step. 
- If no DCR is associated, the customer should [Create a DCR](https://learn.microsoft.com/azure/azure-monitor/essentials/data-collection-rule-create-edit?tabs=CLI) that collects the data they require and then should [Associate the DCR](https://learn.microsoft.com/azure/azure-monitor/essentials/data-collection-rule-create-edit?tabs=portal#add-resources) to their machine.

## Step 2: Does the VM have a managed identity?
[How-to check if an Azure virtual machine has a managed identity](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1464469/AMA-HT-Check-if-an-Azure-Virtual-Machine-(VM)-has-a-managed-identity)

- If either (or both) "SystemAssigned" or "UserAssigned" identities exist, proceed to the next step.
- If neither is found, [Enable System Managed Identity](https://learn.microsoft.com/entra/identity/managed-identities-azure-resources/qs-configure-portal-windows-vm#enable-system-assigned-managed-identity-on-an-existing-vm) or [Assign User Managed Identity](https://learn.microsoft.com/entra/identity/managed-identities-azure-resources/qs-configure-portal-windows-vm#assign-a-user-assigned-managed-identity-to-an-existing-vm). The customer will need to [determine which is appropriate for their environment](https://learn.microsoft.com/entra/identity/managed-identities-azure-resources/overview).
- If the managed identities cannot be created or assigned, create a collaboration case to the Azure Virtual Machine team SAP: 
    ```Azure/Virtual Machine running Windows/Azure Features/Managed Identity Integration```

## Step 3: Can we talk to Azure Instance Metadata Service (IMDS)?
[How-to test connectivity to IMDS](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1585641/AMA-Windows-HT-Test-connectivity-to-IMDS?anchor=azure-virtual-machine)

- If we can connect to IMDS and [Related Logs](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1585641/AMA-Windows-HT-Test-connectivity-to-IMDS?anchor=review-related-logs) show no IMDS errors, proceed to the next step.
- If we cannot connect to IMDS, [Review Related Logs](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1585641/AMA-Windows-HT-Test-connectivity-to-IMDS?anchor=review-related-logs) and [Common Errors](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1585641/AMA-Windows-HT-Test-connectivity-to-IMDS?anchor=common-errors) and attempt to mitigate.
- If we cannot mitigate with the above steps, follow instructions in the [Getting Help](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1585635/AMA-Windows-TSG-Configuration-(Azure-Virtual-Machine)?anchor=getting-help) section below

Escalation team may suggest we create a collaboration case to the Azure Virtual Machine team SAP: 
    ```Azure/Virtual Machine running Windows/Azure Features/Instance Metadata Service```

## Step 4: Can we talk to handlers?
[How-to test connectivity to handlers](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1585643/AMA-Windows-HT-Test-connectivity-to-endpoints)

- If we can connect to the handlers and [Related Logs](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1585643/AMA-Windows-HT-Test-connectivity-to-endpoints#review-related-logs) show no errors, but we still don't have a configuration, follow instructions in the [Getting Help](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1585635/AMA-Windows-TSG-Configuration-(Azure-Virtual-Machine)?anchor=getting-help) section below.
- If we cannot connect to the Global Handler, review [AMA: HT: Azure VM Diagnostics - Test Connectivity & Process Tuples - Overview](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1693370/AMA-HT-Azure-VM-Diagnostics-Test-Connectivity-Process-Tuples) and [Common Errors](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1585643/AMA-Windows-HT-Test-connectivity-to-endpoints#common-errors) and attempt to mitigate.
- If we cannot mitigate with the above steps, [Capture a Network Trace](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1585639/AMA-Windows-HT-Capture-a-Network-Trace?anchor=scenario%3A-ama) and proceed to the next step.

Escalation team may suggest we create a collaboration case to the Azure Networking team SAP: 
    ```Azure/Virtual Machine running Windows/Azure Features/Azure Networking```

## Step 5: Reviewing network trace
[How to analyze AMA Network Trace global.handler.control.monitor.azure.com](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/936016/How-to-analyze-AMA-Network-Trace-global.handler.control.monitor.azure.com)

- If we cannot mitigate with the above steps, follow instructions in the [Getting Help](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1585635/AMA-Windows-TSG-Configuration-(Azure-Virtual-Machine)?anchor=getting-help) section below.

## Getting Help
:::template /.templates/TSG-GettingHelp-Agents.md
:::
# Product Group Escalation
---
:::template /.templates/TSG-ProductTeamEscalation.md
:::
