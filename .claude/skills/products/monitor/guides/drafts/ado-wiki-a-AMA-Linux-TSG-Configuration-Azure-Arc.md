---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Linux/Troubleshooting Guides/AMA Linux: TSG:  Configuration (Azure Arc Machine)"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/AMA%20Linux/Troubleshooting%20Guides/AMA%20Linux%3A%20TSG%3A%20%20Configuration%20%28Azure%20Arc%20Machine%29"
importDate: "2026-04-07"
type: troubleshooting-guide
---

AMA Linux: TSG:  Configuration (Azure Arc Machine)

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Scenario
**ALL** of the following are TRUE:
- The operating system is a **Linux** operating system on the [supported operating systems list](https://learn.microsoft.com/azure/azure-monitor/agents/azure-monitor-agent-supported-operating-systems#linux-operating-systems)
- The **Microsoft.Azure.Monitor.AzureMonitorLinuxAgent** extension status is succeeded
- All of the following [agent processes are running](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1697667/AMA-Linux-HT-Check-the-Azure-Monitor-Agent-(AMA)-Processes):
    - agentlauncher
    - amacoreagent
    - mdsd
- At least one [Data Collection Rule (DCR) should be associated](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1585645/AMA-HT-List-Associated-DCRs-and-DCEs) with the resource

If the extension is not succeeded or processes are not running, use one of these instead: 
- [AMA Linux: TSG: Installation (Azure Virtual Machine)](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1136283/AMA-Linux-TSG-Installation-(Azure-Virtual-Machine))
- [AMA Linux: TSG: Installation (Azure Arc Machine)](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1702158/AMA-Linux-TSG-Installation-(Azure-Arc-Machine))

**At least one** of the following are TRUE:
- AuthToken-MSI.json is missing
```/var/lib/waagent/Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-{version}/config/metrics_configs/AuthToken-MSI.json```
- Configchunks are missing
```/etc/opt/microsoft/azuremonitoragent/config-cache/configchunks/*.json```

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#d7eaf8">

**Note:** 
It is possible that we are in this scenario, but we do have an AuthToken-MSI.json and/or .json files in our configchunks folder. Usually when this happens, the agent was, at one point, able to acquire it's configuration, but it is no longer able to and the files that are present are old. 

In this scenario, check for errors in the following logs:
```/var/lib/GuestConfig/extension_logs/Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-{version}/extension.log```
```/var/opt/microsoft/azuremonitoragent/log/mdsd.err```
```/var/opt/microsoft/azuremonitoragent/log/mdsd.info```
```/var/lib/GuestConfig/ext_mgr_logs/gc_ext.log```
</div>

##Support Area Path
```Azure/Azure Monitor Agent (AMA) on Linux machine/I created a DCR but the data is not in the Log Analytics Workspace/No Heartbeat events in Log Analytics Workspace```

# Documentation
- [Azure Monitor Agent - Overview](https://learn.microsoft.com/azure/azure-monitor/agents/agents-overview)
- [Azure Monitor Agent - Define Network Settings](https://learn.microsoft.com/azure/azure-monitor/agents/azure-monitor-agent-data-collection-endpoint?tabs=PowerShellLinux)
- [Azure Arc Network Requirements](https://learn.microsoft.com/azure/azure-arc/network-requirements-consolidated?tabs=azure-cloud#urls)

# What you will need
- **ResourceID** of the machine
- root access to the operating system

# Known Issues
- [AMA for Linux Known Issues](https://supportability.visualstudio.com/AzureMonitor/_search?text=Tags%3A%22AMAforLinux%22&type=workitem&pageSize=100&filters=Projects%7BAzureMonitor%7DWork%20Item%20Types%7BKnown%20Issue%7DStates%7BPublished%7D)
- [Agents PG Active Incidents](https://portal.microsofticm.com/imp/v3/incidents/search/advanced?sl=x4rel0tgnqd)

# Logs to Collect
- [AMA Troubleshooter for Linux](https://learn.microsoft.com/azure/azure-monitor/agents/troubleshooter-ama-Linux?tabs=LinuxPowerShell)
    - ```...\{version}-extension_logs\extension.log```
    - ```...\mdsd\logs\mdsd.err```
    - ```...\mdsd\logs\mdsd.warn```
    - ```...\mdsd\logs\mdsd.info```
    - ```...\mdsd\logs\mdsd.qos```
    - ```...\GC_Extension\gc_ext.log```
    - ```...\GC_Extension\gc_ext.*.log```
- [AMA Network Trace](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1590073/AMA-Linux-HT-Network-Trace?anchor=scenario%3A-ama)

# Troubleshooting
:::template /.templates/AMA-LatestVersion.md
:::

## Step 1: Is there a Data Collection Rule (DCR) associated?
[How-to check if a DCR is associated](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1585645/AMA-HT-List-Associated-DCRs-and-DCEs)

- If a DCR is associated, proceed to the next step. 
- If no DCR is associated, the customer should [Create a DCR](https://learn.microsoft.com/azure/azure-monitor/essentials/data-collection-rule-create-edit?tabs=CLI) that collects the data they require and then should [Associate the DCR](https://learn.microsoft.com/azure/azure-monitor/essentials/data-collection-rule-create-edit?tabs=portal#add-resources) to their machine.

## Step 2: Does the Arc machine have a managed identity?
[How-to check if an Azure Arc machine has a managed identity](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1584261/AMA-HT-Check-if-an-Azure-Arc-Machine-has-a-managed-identity)

- If "SystemAssigned" identity exists, proceed to the next step
- If the managed identity does not exist, follow instructions in the [Getting Help](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1705012/AMA-Linux-TSG-Configuration-(Azure-Arc-Machine)?anchor=getting-help) section below

## Step 3: Can we talk to Hybrid Azure Instance Metadata Service (HIMDS)?
[How-to test connectivity to HIMDS](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1709769/AMA-Linux-HT-Test-connectivity-to-IMDS)

- If we can connect to HIMDS and [Related Logs](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1709769/AMA-Linux-HT-Test-connectivity-to-IMDS?anchor=review-related-logs) show no IMDS errors, proceed to the next step.
- If we cannot connect to HIMDS, [Review Related Logs](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1709769/AMA-Linux-HT-Test-connectivity-to-IMDS?anchor=review-related-logs) and [Common Errors](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1709769/AMA-Linux-HT-Test-connectivity-to-IMDS?anchor=common-errors) and attempt to mitigate.
- If we cannot mitigate with the above steps, follow instructions in the [Getting Help](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1705012/AMA-Linux-TSG-Configuration-(Azure-Arc-Machine)?anchor=getting-help) section below

Escalation team may suggest we create a collaboration case to the Azure Virtual Machine team SAP: 
    ```Azure/Azure Arc enabled servers/Azure features and services```

## Step 4: Can we talk to handlers?
[How-to test connectivity to handlers](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1710468/AMA-Linux-HT-Test-connectivity-to-endpoints)

- If we can connect to the handlers and [Related Logs](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1710468/AMA-Linux-HT-Test-connectivity-to-endpoints?anchor=review-related-logs) show no errors, but we still don't have a configuration, follow instructions in the [Getting Help](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1705012/AMA-Linux-TSG-Configuration-(Azure-Arc-Machine)?anchor=getting-help) section below.
- If we cannot connect to the Global Handler, review [Common Errors](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1710468/AMA-Linux-HT-Test-connectivity-to-endpoints?anchor=common-errors) and attempt to mitigate.
- If we cannot mitigate with the above steps, [Capture a Network Trace](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1585639/AMA-Linux-HT-Capture-a-Network-Trace?anchor=scenario%3A-ama) and proceed to the next step.

## Step 5: Reviewing network trace
[How to analyze AMA Network Trace global.handler.control.monitor.azure.com](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/936016/How-to-analyze-AMA-Network-Trace-global.handler.control.monitor.azure.com)

- If we cannot mitigate with the above steps, follow instructions in the [Getting Help](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1705012/AMA-Linux-TSG-Configuration-(Azure-Arc-Machine)?anchor=getting-help) section below.

## Getting Help
:::template /.templates/TSG-GettingHelp-AgentsLinux.md
:::
# Product Group Escalation
---
:::template /.templates/TSG-ProductTeamEscalation.md
:::


