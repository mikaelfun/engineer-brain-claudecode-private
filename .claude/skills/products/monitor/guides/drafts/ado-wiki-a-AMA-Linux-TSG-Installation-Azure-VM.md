---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Linux/Troubleshooting Guides/AMA Linux: TSG:  Installation (Azure Virtual Machine)"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/AMA%20Linux/Troubleshooting%20Guides/AMA%20Linux%3A%20TSG%3A%20%20Installation%20%28Azure%20Virtual%20Machine%29"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Scenario
**ALL** of the following are TRUE:
- The operating system is a **Linux** operating system on the [supported operating systems list](https://learn.microsoft.com/azure/azure-monitor/agents/azure-monitor-agent-supported-operating-systems#linux-operating-systems)
- The machine is an Azure Virtual Machine (VM)
*If not, use [AMA Linux: TSG: Installation (Azure Arc Machine)](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1702158/AMA-Linux-TSG-Installation-(Azure-Arc-Machine)) instead.*

**At least one** of the following are TRUE:
- The **Microsoft.Azure.Monitor.AzureMonitorLinuxAgent** [extension status](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1464472/AMA-HT-Check-if-an-Azure-Virtual-Machine-(VM)-has-an-extension-in-its-config) is not "Provisioning succeeded"
- One or more of the [agent processes are not starting](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1697667/AMA-Linux-HT-Check-the-Azure-Monitor-Agent-(AMA)-Processes):
    - agentlauncher
    - amacoreagent
    - mdsd

If the extension is "Provisioning Succeeded" and the agent processes are running, use [AMA Linux: TSG: Configuration](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1703539/AMA-Linux-TSG-Configuration-Azure-Virtual-Machine-(johnsirmon)) instead.

##Support Area Path
```Azure/Azure Monitor Agent (AMA) on Linux machine/The agent is having startup or shutdown issues/Linux Extension not installing```

# Documentation
- [Install Azure Monitor Agent](https://learn.microsoft.com/azure/azure-monitor/agents/azure-monitor-agent-manage?tabs=azure-portal#install)

# What you will need
- **ResourceID** of the Azure Virtual Machine
- root access to the virtual machine operating system

# Known Issues
- [AMA for Linux Known Issues](https://supportability.visualstudio.com/AzureMonitor/_search?text=Tags%3A%22AMAforLinux%22&type=workitem&pageSize=100&filters=Projects%7BAzureMonitor%7DWork%20Item%20Types%7BKnown%20Issue%7DStates%7BPublished%7D)
- [Agents PG Active Incidents](https://portal.microsofticm.com/imp/v3/incidents/search/advanced?sl=x4rel0tgnqd)

# Logs to Collect
If extension installation failed:
- ```/var/log/waagent.log```
- ```/var/log/azure/Microsoft.Azure.Monitor.AzureMonitorLinuxAgent/extension.log```
- ```/var/log/azure/Microsoft.Azure.Monitor.AzureMonitorLinuxAgent/CommandExecution.log```
- ```RHEL: /var/log/messages```
- ```Debian: /var/log/syslog```

If extension installation succeeded, but processes are not running:
- [AMA Troubleshooter for Linux](https://learn.microsoft.com/azure/azure-monitor/agents/troubleshooter-ama-linux?tabs=redhat%2CGenerateLogs#run-the-troubleshooter)
    - ...\mdsd\logs\mdsd.err
    - ...\mdsd\logs\mdsd.info

# Troubleshooting
:::template /.templates/AMA-LatestVersion.md
:::

## Step 1: Is the VM powered on?
[How-to check if an Azure virtual machine is powered on](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1464468/AMA-HT-Check-if-an-Azure-Virtual-Machine-(VM)-is-powered-on)

- If the VM is running, proceed to the next step.
- If the VM is not running, start the VM first and wait for it to enter a running state. 
- If the VM cannot enter a running state, create a collaboration case to the Azure Virtual Machine team SAP: 
    ```Azure/Virtual Machine running Linux/Cannot start or stop my VM```

## Step 2: Does the VM have a managed identity?
[How-to check if an Azure virtual machine has a managed identity](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1464469/AMA-HT-Check-if-an-Azure-Virtual-Machine-(VM)-has-a-managed-identity)

- If either (or both) "SystemAssigned" or "UserAssigned" identities exist, proceed to the next step.
- If neither is found, [Enable System Managed Identity](https://learn.microsoft.com/entra/identity/managed-identities-azure-resources/qs-configure-portal-windows-vm#enable-system-assigned-managed-identity-on-an-existing-vm) or [Assign User Managed Identity](https://learn.microsoft.com/entra/identity/managed-identities-azure-resources/qs-configure-portal-windows-vm#assign-a-user-assigned-managed-identity-to-an-existing-vm). The customer will need to [determine which is appropriate for their environment](https://learn.microsoft.com/entra/identity/managed-identities-azure-resources/overview).
- If the managed identities cannot be created or assigned, create a collaboration case to the Azure Virtual Machine team SAP: 
    ```Azure / Virtual Machine running Linux / Management / Managed Identity Integration```

## Step 3: Is the extension present in the VM configuration?
[How-to check if an Azure Virtual Machine (VM) has an extension in its config](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1464472/AMA-HT-Check-if-an-Azure-Virtual-Machine-(VM)-has-an-extension-in-its-config)

- If the status for an extension with Type = "Microsoft.Azure.Monitor.AzureMonitorLinuxAgent" is "Provisioning Succeeded", proceed to [Step 7](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1136283/AMA-Linux-TSG-Installation-(Azure-Virtual-Machine)?anchor=step-7%3A-did-the-agent-processes-successfully-start%3F).
- If details for an extension with Type = "Microsoft.Azure.Monitor.AzureMonitorLinuxAgent" are returned and status is **NOT** "Provisioning Succeeded", proceed to the next step.
- If nothing is returned, [Install Azure Monitor Agent](https://learn.microsoft.com/azure/azure-monitor/agents/azure-monitor-agent-manage?tabs=azure-portal#install) and then check this again.

## Step 4: Is the VM Guest Agent running?
[How-to check if the Azure VM Guest Agent is running](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1703550/AMA-Linux-HT-Check-if-the-Azure-VM-Guest-Agent-is-running)

- If the VM Guest Agent is running, proceed to the next step.
- If the VM Guest Agent is not running, create a collaboration case to the Azure Virtual Machine team SAP:
    ```Azure/Virtual Machine running Linux/VM Extensions not operating correctly/VM Guest Agent not working due to a networking issue```

## Step 5: Did the VM Guest Agent download the extension binaries?
[How-to check if the Azure VM Guest Agent downloaded extension binaries](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1704221/AMA-Linux-HT-Check-if-the-Azure-VM-Guest-Agent-downloaded-extension-binaries).

- If we find that the binaries were downloaded and extracted, proceed to the next step.
- If the binaries are missing, the VM Guest Agent did not successfully download the extension binary files. Create a collaboration with the VM team using the following SAP:
    ```Azure/Virtual Machine running Linux/VM Extensions not operating correctly/VM Guest Agent not working due to a networking issue```

## Step 6: Did the VM Guest Agent install and enable the extension?
[How-to check the Azure VM Guest Agent extension installation logs](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1705007/AMA-Linux-HT-Check-the-Azure-VM-Guest-Agent-extension-installation-logs)

- If you are able to use the logs to identify and resolve the problem, proceed to the next step.
- If you are unable to use the logs to identify and resolve the problem, ensure [Logs to Collect](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1136283/AMA-Linux-TSG-Installation-(Azure-Virtual-Machine)?anchor=logs-to-collect) have been uploaded to DTM for this case and see [Getting help](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1136283/AMA-Linux-TSG-Installation-(Azure-Virtual-Machine)?anchor=getting-help) for next steps.
 
## Step 7: Did the agent processes successfully start?
[How-to Check the Azure Monitor Agent (AMA) Processes](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1697667/AMA-Linux-HT-Check-the-Azure-Monitor-Agent-(AMA)-Processes)

- There are three processes we care about as part of installation: **agentlauncher, amacoreagent, mdsd**. If the processes are not running [Review Related Logs](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1705007/AMA-Linux-HT-Check-the-Azure-VM-Guest-Agent-extension-installation-logs?anchor=review-related-logs) and [Common Errors](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1705007/AMA-Linux-HT-Check-the-Azure-VM-Guest-Agent-extension-installation-logs?anchor=common-errors)
- If you are unable to use the logs to identify and resolve the problem, ensure [Logs to Collect](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1136283/AMA-Linux-TSG-Installation-(Azure-Virtual-Machine)?anchor=logs-to-collect) have been uploaded to DTM for this case and see [Getting help](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1136283/AMA-Linux-TSG-Installation-(Azure-Virtual-Machine)?anchor=getting-help) for next steps.

## Getting Help
:::template /.templates/TSG-GettingHelp-AgentsLinux.md
:::
# Product Group Escalation
---
:::template /.templates/TSG-ProductTeamEscalation.md
:::
