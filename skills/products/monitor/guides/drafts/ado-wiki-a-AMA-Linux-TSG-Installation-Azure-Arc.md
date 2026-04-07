---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Linux/Troubleshooting Guides/AMA Linux: TSG: Installation (Azure Arc Machine)"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/AMA%20Linux/Troubleshooting%20Guides/AMA%20Linux%3A%20TSG%3A%20Installation%20%28Azure%20Arc%20Machine%29"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Scenario
ALL of the following are TRUE:
- The operating system is a **Linux Server** operating system on the [supported operating systems list](https://learn.microsoft.com/azure/azure-monitor/agents/azure-monitor-agent-supported-operating-systems#linux-operating-systems)
*If not, use [AMA Linux: TSG: Installation (Azure Virtual Machine)](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1136283/AMA-Linux-TSG-Installation-(Azure-Virtual-Machine)) instead.*

At least ONE of the following are TRUE:
- The **Microsoft.Azure.Monitor.AzureMonitorLinuxAgent** [extension status](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1584263/AMA-HT-Check-if-an-Azure-Arc-Machine-has-an-extension-in-its-config) is not "Succeeded"
- One or more of the [agent processes are not starting](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1697667/AMA-Linux-HT-Check-the-Azure-Monitor-Agent-(AMA)-Processes):
    - agentlauncher
    - amacoreagent
    - mdsd

If the extension is "Provisioning Succeeded" and the agent processes are running, use [AMA Linux: TSG: Configuration](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1343756/AMA-Linux-TSG-Configuration) instead.

## Support Area Path
```Azure/Azure Monitor Agent (AMA) on Linux machine/The agent is having startup or shutdown issues/Extension not installing on Arc enabled server```

# Documentation
- [Install Azure Arc Agent](https://learn.microsoft.com/azure/network-watcher/connection-monitor-connected-machine-agent?tabs=LinuxScript)
- [Install Azure Monitor Agent](https://learn.microsoft.com/azure/azure-monitor/agents/azure-monitor-agent-manage?tabs=azure-portal#install)

# What you will need
- **ResourceID** of the Azure Arc Machine
- root access to the machine

# Known Issues
- [AMA for Linux Known Issues](https://supportability.visualstudio.com/AzureMonitor/_search?text=Tags%3A%22AMAforLinux%22&type=workitem&pageSize=100&filters=Projects%7BAzureMonitor%7DWork%20Item%20Types%7BKnown%20Issue%7DStates%7BPublished%7D)
- [Agents PG Active Incidents](https://portal.microsofticm.com/imp/v3/incidents/search/advanced?sl=x4rel0tgnqd)

# Logs to Collect
If extension installation failed:
- ```/var/lib/GuestConfig/ext_mgr_logs/gc_ext.log```
- ```/var/opt/azcmagent/log/*.log```
- ```/var/lib/GuestConfig/extension_logs/Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-{version}/*.log```
- ```/var/lib/GuestConfig/extension_logs/Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-{version}/state.json```
- ```RHEL: /var/log/messages```
- ```Debian: /var/log/syslog```


Run the [azcmagents logs](https://learn.microsoft.com/azure/azure-arc/servers/azcmagent-logs) command and collect the .zip:
```azcmagent logs```

If extension installation succeeded, but processes are not running:
- [AMA Troubleshooter for Linux](https://learn.microsoft.com/azure/azure-monitor/agents/troubleshooter-ama-linux?tabs=redhat%2CGenerateLogs#run-the-troubleshooter)
    - ...\mdsd\logs\mdsd.err
    - ...\mdsd\logs\mdsd.info

# Troubleshooting
:::template /.templates/AMA-LatestVersion.md
:::

## Step 1: Is the Arc machine connected?

[How-to check if the Azure Arc machine is connected](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1584259/AMA-HT-Check-if-an-Azure-Arc-Machine-is-connected)

- If the Arc machine is connected, proceed to the next step.
- If the Arc machine is not connected, [Public: Troubleshoot Azure Connected Machine](https://learn.microsoft.com/azure/azure-arc/servers/troubleshoot-agent-onboard) and [MS INT: Troubleshoot Azure Connected Machine](https://supportability.visualstudio.com/AzureArcforServers/_wiki/wikis/AzureArcenabledservers.wiki/236863/TSG-Linux-agent-installation).
- If the Arc machine will not enter a connected state, create a collaboration case to the Azure Arc SAP: 
    ```Azure/Azure Arc enabled servers/Configuration and setup/Cannot connect my server to Azure Arc```

## Step 2: Does the Arc machine have a managed identity?
[How-to check if the Azure Arc machine has a managed identity](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1584261/AMA-HT-Check-if-an-Azure-Arc-Machine-has-a-managed-identity)

- If the Arc machine has a managed identity, proceed to the next step.
- If the Arc machine does not have a managed identity, create a collaboration case to the Azure Arc SAP:
    ```Azure/Azure Arc enabled servers/Configuration and setup```

## Step 3: Is the extension present in the Arc machine configuration?
[How-to check if an Azure arc machine has an extension in its config](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1584263/AMA-HT-Check-if-an-Azure-Arc-Machine-has-an-extension-in-its-config)

- If the status for an extension with Type = "Microsoft.Azure.Monitor.AzureMonitorLinuxAgent" is "Succeeded", proceed to [Step 6](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1702158/AMA-Linux-TSG-Installation-(Azure-Arc-Machine)?_a=edit&anchor=step-6%3A-did-the-agent-processes-successfully-start%3F).
- If details for an extension with Type = "Microsoft.Azure.Monitor.AzureMonitorLinuxAgent" are returned and status is **NOT** "Succeeded", proceed to the next step.
- If nothing is returned, [Install Azure Monitor Agent](https://learn.microsoft.com/azure/azure-monitor/agents/azure-monitor-agent-manage?tabs=azure-portal#install) and then check this again.

## Step 4: Did the Azure Arc Agent download the extension binaries?
[How-to check if the Azure Arc agent downloaded extension binaries](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1703546/AMA-Linux-HT-Check-if-the-Azure-Arc-agent-downloaded-extension-binaries)

- If we find that the binaries were downloaded, extracted and validated, proceed to the next step.
- If the binaries are missing, the Azure Arc agent did not successfully download the extension binary files, or the package validation failed. [Collect Arc Logs](https://supportability.visualstudio.com/AAAP_Code/_wiki/wikis/AAAP/1697261/TSG-Extension-Management?anchor=data-to-collect)) and create a collaboration with the Azure Arc team using the following SAP:
    ```Azure/Azure Arc enabled servers/Extensions```

## Step 5: Did the Azure Arc Agent install and enable the extension?
[How-to check the Azure VM Guest Agent extension installation logs](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1703560/AMA-Linux-HT-Check-the-Azure-Arc-Agent-extension-installation-logs)

- If we find that the extension was installed and enabled without error, proceed to the next step.
- If we find errors with Arc (install/enable was not attempted, install/enable results were not logged), create a collaboration with the Azure Arc team using the following SAP:
    ```Azure/Azure Arc enabled servers/Extensions```
- If you are unable to use the logs and [Common Errors](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1584267/AMA-Linux-HT-Check-the-Azure-Arc-Agent-extension-installation-logs?anchor=common-errors) to identify and resolve the problem, ensure [Logs to Collect](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1584257/AMA-Linux-TSG-Installation-(Azure-Arc-Machine)?anchor=logs-to-collect) have been uploaded to DTM for this case and see [Getting help](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1584257/AMA-Linux-TSG-Installation-(Azure-Arc-Machine)?anchor=getting-help) for next steps.

## Step 6: Did the agent processes successfully start?
[How-to Check the Azure Monitor Agent (AMA) Processes](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1697667/AMA-Linux-HT-Check-the-Azure-Monitor-Agent-(AMA)-Processes)

- There are three processes we care about as part of installation: **agentlauncher, amacoreagent, mdsd.** If the processes are not running [Review Related Logs](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1697667/AMA-Linux-HT-Check-the-Azure-Monitor-Agent-(AMA)-Processes?anchor=review-related-logs) 
- If you are unable to use the logs and [Common Errors](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1697667/AMA-Linux-HT-Check-the-Azure-Monitor-Agent-(AMA)-Processes?anchor=common-errors) to identify and resolve the problem, ensure [Logs to Collect](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1702158/AMA-Linux-TSG-Installation-(Azure-Arc-Machine)?anchor=logs-to-collect) have been uploaded to DTM for this case and see [Getting help](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1702158/AMA-Linux-TSG-Installation-(Azure-Arc-Machine)?anchor=getting-help) for next steps.

## Getting Help
:::template /.templates/TSG-GettingHelp-AgentsLinux.md
:::
# Product Group Escalation
---
:::template /.templates/TSG-ProductTeamEscalation.md
:::
